// ============================================================================
// BIBFRAME2MARC XSLT ENGINE
// Uses the ACTUAL Library of Congress bibframe2marc XSLT rules
// https://github.com/lcnetdev/bibframe2marc (v3.0.0)
//
// Architecture:
// 1. Fetches compile.xsl + all 14 XML rule files from GitHub
// 2. Merges rules into a single XML document (inlining <file> references)
// 3. Compiles rules using browser's native XSLTProcessor:
//    compile.xsl + merged-rules.xml => bibframe2marc.xsl
// 4. Converts BIBFRAME RDF/XML => MARCXML using the compiled stylesheet
// ============================================================================

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/lcnetdev/bibframe2marc/master';

const COMPILE_XSL_URL = `${GITHUB_RAW_BASE}/src/compile.xsl`;

const RULE_FILES = [
  '00-LDR.xml',
  '01-001-008.xml',
  '02-010-048.xml',
  '03-050-088.xml',
  '04-1XX.xml',
  '05-2XX.xml',
  '06-3XX.xml',
  '065-490.xml',
  '07-5XX.xml',
  '08-6XX.xml',
  '09-7XX.xml',
  '10-8XX.xml',
  '11-9XX.xml',
  '99-maps.xml',
];

const RULE_FILE_URLS = RULE_FILES.map(f => `${GITHUB_RAW_BASE}/rules/${f}`);
const VERSION_URL = `${GITHUB_RAW_BASE}/rules/VERSION`;

export type EngineStatus = 'idle' | 'fetching' | 'compiling' | 'ready' | 'error';

export interface EngineState {
  status: EngineStatus;
  error: string | null;
  version: string | null;
  progress: { loaded: number; total: number };
  rulesCount: number;
}

export interface XSLTConversionResult {
  success: boolean;
  marcxml: string;
  error: string | null;
}

/**
 * Bibframe2Marc XSLT Engine
 * 
 * Fetches the actual LC XSLT rules from GitHub, compiles them in-browser,
 * and provides BIBFRAME RDF/XML => MARCXML conversion using the native
 * browser XSLTProcessor API.
 */
export class Bibframe2MarcXSLTEngine {
  private compiledProcessor: XSLTProcessor | null = null;
  private _state: EngineState = {
    status: 'idle',
    error: null,
    version: null,
    progress: { loaded: 0, total: RULE_FILES.length + 2 }, // +2 for compile.xsl and VERSION
    rulesCount: 0,
  };
  private listeners: Set<(state: EngineState) => void> = new Set();
  private initPromise: Promise<void> | null = null;

  get state(): EngineState {
    return { ...this._state };
  }

  get isReady(): boolean {
    return this._state.status === 'ready';
  }

  subscribe(listener: (state: EngineState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private updateState(partial: Partial<EngineState>) {
    this._state = { ...this._state, ...partial };
    this.listeners.forEach(fn => fn(this._state));
  }

  /**
   * Initialize the engine: fetch, merge, and compile the XSLT rules.
   * Safe to call multiple times - will reuse the existing promise.
   */
  async initialize(): Promise<void> {
    if (this._state.status === 'ready') return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      this.updateState({ status: 'fetching', error: null, progress: { loaded: 0, total: RULE_FILES.length + 2 } });

      // Fetch everything in parallel
      let loaded = 0;
      const trackFetch = async (url: string): Promise<string> => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        loaded++;
        this.updateState({ progress: { loaded, total: RULE_FILES.length + 2 } });
        return text;
      };

      const results = await Promise.all([
        trackFetch(COMPILE_XSL_URL),
        trackFetch(VERSION_URL),
        ...RULE_FILE_URLS.map(url => trackFetch(url)),
      ]);

      const compileXslText = results[0];
      const versionText = results[1].trim();
      const ruleTexts = results.slice(2);

      this.updateState({ 
        status: 'compiling', 
        version: versionText,
        progress: { loaded: RULE_FILES.length + 2, total: RULE_FILES.length + 2 }
      });

      // Merge all rule files into a single <rules> document
      const mergedRulesXml = this.mergeRuleFiles(ruleTexts, versionText);

      // Count rules
      const rulesCount = (mergedRulesXml.match(/<(?:cf|df)\s/g) || []).length;
      this.updateState({ rulesCount });

      // Step 1: Compile - compile.xsl + merged-rules.xml => bibframe2marc.xsl
      const parser = new DOMParser();

      const compileDoc = parser.parseFromString(compileXslText, 'text/xml');
      const compileError = compileDoc.querySelector('parsererror');
      if (compileError) {
        throw new Error(`Failed to parse compile.xsl: ${compileError.textContent}`);
      }

      const compileProcessor = new XSLTProcessor();
      compileProcessor.importStylesheet(compileDoc);

      const rulesDoc = parser.parseFromString(mergedRulesXml, 'text/xml');
      const rulesError = rulesDoc.querySelector('parsererror');
      if (rulesError) {
        throw new Error(`Failed to parse merged rules: ${rulesError.textContent}`);
      }

      // This is the key step: compile.xsl transforms the rules into bibframe2marc.xsl
      const compiledDoc = compileProcessor.transformToDocument(rulesDoc);
      if (!compiledDoc || !compiledDoc.documentElement) {
        throw new Error('XSLT compilation produced empty output. The browser XSLTProcessor may not support xsl:namespace-alias.');
      }

      // Verify the compiled document is a valid stylesheet
      const rootTag = compiledDoc.documentElement.localName;
      if (rootTag !== 'stylesheet' && rootTag !== 'transform') {
        // The compilation may have produced output but not an XSLT stylesheet
        console.warn(`[bibframe2marc] Compiled document root is <${rootTag}>, expected <stylesheet>`);
        console.log('[bibframe2marc] Compiled document:', new XMLSerializer().serializeToString(compiledDoc).substring(0, 500));
      }

      // Step 2: Import the compiled stylesheet for conversion
      this.compiledProcessor = new XSLTProcessor();
      this.compiledProcessor.importStylesheet(compiledDoc);

      this.updateState({ status: 'ready' });
      console.log(`[bibframe2marc] XSLT engine ready. Version: ${versionText}. Rules compiled: ${rulesCount} field definitions.`);

    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      console.error('[bibframe2marc] Engine initialization failed:', errorMsg);
      this.updateState({ status: 'error', error: errorMsg });
      this.initPromise = null; // Allow retry
      throw err;
    }
  }

  /**
   * Merge individual rule XML files into a single <rules> document.
   * This inlines the content so compile.xsl doesn't need document() calls.
   */
  private mergeRuleFiles(ruleTexts: string[], version: string): string {
    const parser = new DOMParser();
    const serializer = new XMLSerializer();

    // Build the merged document
    let merged = `<?xml version="1.0" encoding="UTF-8"?>
<rules xmlns="http://www.loc.gov/bf2marc"
       xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
       xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
       xmlns:bf="http://id.loc.gov/ontologies/bibframe/"
       xmlns:bflc="http://id.loc.gov/ontologies/bflc/"
       xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"
       xmlns:marc="http://www.loc.gov/MARC21/slim"
       xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <version>${this.escapeXml(version)}</version>
`;

    for (let i = 0; i < ruleTexts.length; i++) {
      const ruleText = ruleTexts[i];
      const ruleDoc = parser.parseFromString(ruleText, 'text/xml');
      const parseError = ruleDoc.querySelector('parsererror');
      if (parseError) {
        console.warn(`[bibframe2marc] Parse error in rule file ${RULE_FILES[i]}:`, parseError.textContent);
        continue;
      }

      const root = ruleDoc.documentElement;
      if (!root) continue;

      // Extract child elements from the <rules> root
      merged += `\n  <!-- ========== ${RULE_FILES[i]} ========== -->\n`;
      for (let j = 0; j < root.childNodes.length; j++) {
        const child = root.childNodes[j];
        if (child.nodeType === Node.ELEMENT_NODE) {
          // Skip <version> elements from included files (only top-level version matters)
          if ((child as Element).localName === 'version') continue;
          merged += '  ' + serializer.serializeToString(child) + '\n';
        }
      }
    }

    merged += '\n</rules>';
    return merged;
  }

  private escapeXml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * Convert BIBFRAME RDF/XML to MARCXML using the compiled LC stylesheet.
   */
  convert(rdfXml: string, params?: {
    pRecordId?: string;
    pConversionAgency?: string;
    pCatScript?: string;
    pGenerationUri?: string;
    pSourceRecordId?: string;
  }): XSLTConversionResult {
    if (!this.compiledProcessor) {
      return { success: false, marcxml: '', error: 'XSLT engine not initialized. Call initialize() first.' };
    }

    try {
      const parser = new DOMParser();
      const inputDoc = parser.parseFromString(rdfXml, 'text/xml');
      
      const parseError = inputDoc.querySelector('parsererror');
      if (parseError) {
        return { 
          success: false, 
          marcxml: '', 
          error: `Invalid RDF/XML input: ${parseError.textContent}` 
        };
      }

      // Set optional parameters
      if (params?.pRecordId) {
        this.compiledProcessor.setParameter('', 'pRecordId', params.pRecordId);
      }
      if (params?.pConversionAgency) {
        this.compiledProcessor.setParameter('', 'pConversionAgency', params.pConversionAgency);
      }
      if (params?.pCatScript) {
        this.compiledProcessor.setParameter('', 'pCatScript', params.pCatScript);
      }
      if (params?.pGenerationUri) {
        this.compiledProcessor.setParameter('', 'pGenerationUri', params.pGenerationUri);
      }
      if (params?.pSourceRecordId) {
        this.compiledProcessor.setParameter('', 'pSourceRecordId', params.pSourceRecordId);
      }

      // Generate timestamp
      const now = new Date();
      const timestamp = now.toISOString()
        .replace(/[-:T]/g, '')
        .replace(/\.\d+Z$/, '.0');
      try {
        this.compiledProcessor.setParameter('', 'pGenerationDatestamp', timestamp);
      } catch {
        // Parameter may not exist in stylesheet
      }

      const resultDoc = this.compiledProcessor.transformToDocument(inputDoc);
      
      if (!resultDoc || !resultDoc.documentElement) {
        return { 
          success: false, 
          marcxml: '', 
          error: 'XSLT transformation produced empty output. Check that the input is valid BIBFRAME RDF/XML.' 
        };
      }

      const serializer = new XMLSerializer();
      let marcxml = serializer.serializeToString(resultDoc);

      // Pretty-print the output
      marcxml = this.prettyPrintXml(marcxml);

      return { success: true, marcxml, error: null };

    } catch (err: any) {
      return { 
        success: false, 
        marcxml: '', 
        error: `XSLT transformation error: ${err.message}` 
      };
    }
  }

  /**
   * Basic XML pretty-printer
   */
  private prettyPrintXml(xml: string): string {
    // Remove existing whitespace between tags
    let formatted = xml.replace(/(>)\s*(<)/g, '$1\n$2');
    
    let indent = 0;
    const lines = formatted.split('\n');
    const result: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Decrease indent for closing tags
      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 1);
      }
      
      result.push('  '.repeat(indent) + trimmed);
      
      // Increase indent for opening tags (not self-closing, not closing, not processing instructions)
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.startsWith('<?') && 
          !trimmed.endsWith('/>') && !trimmed.includes('</')) {
        indent++;
      }
    }
    
    return result.join('\n');
  }

  /**
   * Reset the engine state
   */
  reset() {
    this.compiledProcessor = null;
    this.initPromise = null;
    this.updateState({
      status: 'idle',
      error: null,
      version: null,
      progress: { loaded: 0, total: RULE_FILES.length + 2 },
      rulesCount: 0,
    });
  }
}

// Singleton instance
let engineInstance: Bibframe2MarcXSLTEngine | null = null;

export function getXSLTEngine(): Bibframe2MarcXSLTEngine {
  if (!engineInstance) {
    engineInstance = new Bibframe2MarcXSLTEngine();
  }
  return engineInstance;
}

// ============================================================================
// SAMPLE BIBFRAME RDF/XML RECORD
// This is the format the LC bibframe2marc XSLT expects as input
// ============================================================================

export const SAMPLE_BIBFRAME_RDFXML = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
         xmlns:bf="http://id.loc.gov/ontologies/bibframe/"
         xmlns:bflc="http://id.loc.gov/ontologies/bflc/"
         xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#">

  <bf:Work rdf:about="http://example.org/resources/works/w1">
    <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Text"/>
    <bf:adminMetadata>
      <bf:AdminMetadata>
        <bf:status rdf:resource="http://id.loc.gov/vocabulary/mstatus/n"/>
        <bflc:encodingLevel rdf:resource="http://id.loc.gov/vocabulary/menclvl/f"/>
        <bf:descriptionConventions rdf:resource="http://id.loc.gov/vocabulary/descriptionConventions/rda"/>
        <bf:source>
          <bf:Source>
            <bf:code>MOON</bf:code>
          </bf:Source>
        </bf:source>
        <bf:descriptionLanguage rdf:resource="http://id.loc.gov/vocabulary/languages/eng"/>
      </bf:AdminMetadata>
    </bf:adminMetadata>
    <bf:language rdf:resource="http://id.loc.gov/vocabulary/languages/eng"/>
    <bf:title>
      <bf:Title>
        <bf:mainTitle>Introduction to Linked Data</bf:mainTitle>
        <bf:subtitle>A Practical Guide for Librarians</bf:subtitle>
      </bf:Title>
    </bf:title>
    <bf:contribution>
      <bf:Contribution>
        <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/PrimaryContribution"/>
        <bf:agent>
          <bf:Agent>
            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Person"/>
            <rdfs:label>Smith, John A.</rdfs:label>
            <bflc:marcKey>1001 $aSmith, John A.</bflc:marcKey>
          </bf:Agent>
        </bf:agent>
        <bf:role rdf:resource="http://id.loc.gov/vocabulary/relators/aut"/>
      </bf:Contribution>
    </bf:contribution>
    <bf:contribution>
      <bf:Contribution>
        <bf:agent>
          <bf:Agent>
            <rdf:type rdf:resource="http://id.loc.gov/ontologies/bibframe/Person"/>
            <rdfs:label>Johnson, Mary B.</rdfs:label>
          </bf:Agent>
        </bf:agent>
        <bf:role rdf:resource="http://id.loc.gov/vocabulary/relators/edt"/>
      </bf:Contribution>
    </bf:contribution>
    <bf:subject>
      <bf:Topic>
        <rdfs:label>Linked data</rdfs:label>
        <bf:source rdf:resource="http://id.loc.gov/vocabulary/subjectSchemes/lcsh"/>
      </bf:Topic>
    </bf:subject>
    <bf:subject>
      <bf:Topic>
        <rdfs:label>Semantic Web</rdfs:label>
        <bf:source rdf:resource="http://id.loc.gov/vocabulary/subjectSchemes/lcsh"/>
      </bf:Topic>
    </bf:subject>
    <bf:subject>
      <bf:Topic>
        <rdfs:label>Libraries--Data processing</rdfs:label>
        <bf:source rdf:resource="http://id.loc.gov/vocabulary/subjectSchemes/lcsh"/>
      </bf:Topic>
    </bf:subject>
    <bf:classification>
      <bf:ClassificationLcc>
        <bf:classificationPortion>Z666.7</bf:classificationPortion>
        <bf:itemPortion>.S65 2024</bf:itemPortion>
        <bf:source rdf:resource="http://id.loc.gov/vocabulary/organizations/dlc"/>
      </bf:ClassificationLcc>
    </bf:classification>
    <bf:classification>
      <bf:ClassificationDdc>
        <bf:classificationPortion>025.04</bf:classificationPortion>
        <bf:edition>23</bf:edition>
      </bf:ClassificationDdc>
    </bf:classification>
    <bf:summary>
      <bf:Summary>
        <rdfs:label>A comprehensive introduction to linked data technologies and their application in library science and information management.</rdfs:label>
      </bf:Summary>
    </bf:summary>
    <bf:note>
      <bf:Note>
        <rdfs:label>Includes bibliographical references and index.</rdfs:label>
      </bf:Note>
    </bf:note>
    <bf:content>
      <bf:Content rdf:about="http://id.loc.gov/vocabulary/contentTypes/txt">
        <rdfs:label>text</rdfs:label>
      </bf:Content>
    </bf:content>
    <bf:hasInstance rdf:resource="http://example.org/resources/instances/i1"/>
  </bf:Work>

  <bf:Instance rdf:about="http://example.org/resources/instances/i1">
    <bf:instanceOf rdf:resource="http://example.org/resources/works/w1"/>
    <bf:title>
      <bf:Title>
        <bf:mainTitle>Introduction to Linked Data</bf:mainTitle>
        <bf:subtitle>A Practical Guide for Librarians</bf:subtitle>
      </bf:Title>
    </bf:title>
    <bf:responsibilityStatement>John A. Smith ; edited by Mary B. Johnson</bf:responsibilityStatement>
    <bf:editionStatement>Second edition</bf:editionStatement>
    <bf:provisionActivity>
      <bf:Publication>
        <bf:place>
          <bf:Place rdf:about="http://id.loc.gov/vocabulary/countries/ilu">
            <rdfs:label>Chicago</rdfs:label>
          </bf:Place>
        </bf:place>
        <bf:agent>
          <bf:Agent>
            <rdfs:label>ALA Editions</rdfs:label>
          </bf:Agent>
        </bf:agent>
        <bf:date rdf:datatype="http://id.loc.gov/datatypes/edtf">2024</bf:date>
      </bf:Publication>
    </bf:provisionActivity>
    <bf:identifiedBy>
      <bf:Isbn>
        <rdf:value>978-0-8389-1234-5</rdf:value>
      </bf:Isbn>
    </bf:identifiedBy>
    <bf:identifiedBy>
      <bf:Lccn>
        <rdf:value>  2024012345</rdf:value>
      </bf:Lccn>
    </bf:identifiedBy>
    <bf:extent>
      <bf:Extent>
        <rdfs:label>xii, 345 pages</rdfs:label>
      </bf:Extent>
    </bf:extent>
    <bf:dimensions>24 cm</bf:dimensions>
    <bf:illustrativeContent rdf:resource="http://id.loc.gov/vocabulary/millus/ill"/>
    <bf:media>
      <bf:Media rdf:about="http://id.loc.gov/vocabulary/mediaTypes/n">
        <rdfs:label>unmediated</rdfs:label>
      </bf:Media>
    </bf:media>
    <bf:carrier>
      <bf:Carrier rdf:about="http://id.loc.gov/vocabulary/carriers/nc">
        <rdfs:label>volume</rdfs:label>
      </bf:Carrier>
    </bf:carrier>
    <bf:seriesStatement>Library Technology Essentials ; no. 7</bf:seriesStatement>
    <bf:adminMetadata>
      <bf:AdminMetadata>
        <bf:source>
          <bf:Source>
            <bf:code>MOON</bf:code>
          </bf:Source>
        </bf:source>
        <bf:descriptionConventions rdf:resource="http://id.loc.gov/vocabulary/descriptionConventions/rda"/>
        <bf:descriptionLanguage rdf:resource="http://id.loc.gov/vocabulary/languages/eng"/>
      </bf:AdminMetadata>
    </bf:adminMetadata>
  </bf:Instance>

</rdf:RDF>`;

// ============================================================================
// HELPER: Parse MARCXML output into structured record for display formatters
// ============================================================================

export interface ParsedMarcField {
  tag: string;
  ind1: string;
  ind2: string;
  subfields: { code: string; value: string }[];
}

export interface ParsedMarcRecord {
  leader: string;
  controlFields: { tag: string; value: string }[];
  dataFields: ParsedMarcField[];
}

export function parseMarcXml(marcxml: string): ParsedMarcRecord | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(marcxml, 'text/xml');
    
    if (doc.querySelector('parsererror')) return null;

    const ns = 'http://www.loc.gov/MARC21/slim';
    
    // Try with namespace first, then without
    let leaderEl = doc.getElementsByTagNameNS(ns, 'leader')[0] || doc.getElementsByTagName('leader')[0];
    const leader = leaderEl?.textContent || '';

    const controlFields: { tag: string; value: string }[] = [];
    const cfEls = doc.getElementsByTagNameNS(ns, 'controlfield');
    const cfElsFallback = cfEls.length > 0 ? cfEls : doc.getElementsByTagName('controlfield');
    for (let i = 0; i < cfElsFallback.length; i++) {
      const el = cfElsFallback[i];
      controlFields.push({
        tag: el.getAttribute('tag') || '',
        value: el.textContent || '',
      });
    }

    const dataFields: ParsedMarcField[] = [];
    const dfEls = doc.getElementsByTagNameNS(ns, 'datafield');
    const dfElsFallback = dfEls.length > 0 ? dfEls : doc.getElementsByTagName('datafield');
    for (let i = 0; i < dfElsFallback.length; i++) {
      const el = dfElsFallback[i];
      const subfields: { code: string; value: string }[] = [];
      
      const sfEls = el.getElementsByTagNameNS(ns, 'subfield');
      const sfElsFallback = sfEls.length > 0 ? sfEls : el.getElementsByTagName('subfield');
      for (let j = 0; j < sfElsFallback.length; j++) {
        const sf = sfElsFallback[j];
        subfields.push({
          code: sf.getAttribute('code') || '',
          value: sf.textContent || '',
        });
      }

      dataFields.push({
        tag: el.getAttribute('tag') || '',
        ind1: el.getAttribute('ind1') || ' ',
        ind2: el.getAttribute('ind2') || ' ',
        subfields,
      });
    }

    return { leader, controlFields, dataFields };
  } catch {
    return null;
  }
}
