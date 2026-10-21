// ============================================================================
// MARC2BIBFRAME2 XSLT ENGINE
// Uses the ACTUAL Library of Congress marc2bibframe2 XSLT stylesheets
// https://github.com/lcnetdev/marc2bibframe2
//
// Architecture:
// 1. Fetches marc2bibframe2.xsl + all included ConvSpec-*.xsl + conf/ files
// 2. Merges all xsl:include references into a single monolithic stylesheet
// 3. Replaces document() config references with inline variable data
// 4. Converts MARCXML => BIBFRAME 2.0 RDF/XML using browser XSLTProcessor
// ============================================================================

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/lcnetdev/marc2bibframe2/master';

// Main stylesheet
const MAIN_XSL = 'marc2bibframe2.xsl';

// All XSL files in xsl/ directory (fetched for xsl:include resolution)
const XSL_FILES = [
  'marc2bibframe2.xsl',
  'ConvSpec-LDR.xsl',
  'ConvSpec-001-007.xsl',
  'ConvSpec-006,008.xsl',
  'ConvSpec-ControlSubfields.xsl',
  'ConvSpec-010-048.xsl',
  'ConvSpec-050-088.xsl',
  'ConvSpec-1XX,7XX,8XX-names.xsl',
  'ConvSpec-200-247not240-Titles.xsl',
  'ConvSpec-240andX30-UnifTitle.xsl',
  'ConvSpec-250-270.xsl',
  'ConvSpec-3XX.xsl',
  'ConvSpec-460-468-SeriesTreat.xsl',
  'ConvSpec-490-510-Links.xsl',
  'ConvSpec-5XX.xsl',
  'ConvSpec-600-662.xsl',
  'ConvSpec-720+740to755.xsl',
  'ConvSpec-758.xsl',
  'ConvSpec-760-788-Links.xsl',
  'ConvSpec-841-887.xsl',
  'ConvSpec-880.xsl',
  'ConvSpec-Preprocess0-Splitting.xsl',
  'ConvSpec-Process6-Series.xsl',
  'ConvSpec-Process8-ProvAct.xsl',
  'naco-normalize.xsl',
  'utils.xsl',
  'variables.xsl',
];

// Configuration XML files used via document() in the stylesheets
const CONF_FILES = [
  'abbreviations.xml',
  'codeMaps.xml',
  'exclusions.xml',
  'languageCrosswalk.xml',
  'map880.xml',
  'scriptCrosswalk.xml',
  'subjectThesaurus.xml',
];

export type EngineStatus = 'idle' | 'fetching' | 'merging' | 'ready' | 'error';

export interface Marc2BibframeEngineState {
  status: EngineStatus;
  error: string | null;
  progress: { loaded: number; total: number };
  xslFilesCount: number;
  confFilesCount: number;
}

export interface M2BConversionResult {
  success: boolean;
  rdfxml: string;
  error: string | null;
}

export class Marc2BibframeXSLTEngine {
  private processor: XSLTProcessor | null = null;
  private _state: Marc2BibframeEngineState = {
    status: 'idle',
    error: null,
    progress: { loaded: 0, total: XSL_FILES.length + CONF_FILES.length },
    xslFilesCount: XSL_FILES.length,
    confFilesCount: CONF_FILES.length,
  };
  private listeners: Set<(s: Marc2BibframeEngineState) => void> = new Set();
  private initPromise: Promise<void> | null = null;

  get state() { return { ...this._state }; }
  get isReady() { return this._state.status === 'ready'; }

  subscribe(fn: (s: Marc2BibframeEngineState) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private update(p: Partial<Marc2BibframeEngineState>) {
    this._state = { ...this._state, ...p };
    this.listeners.forEach(fn => fn(this._state));
  }

  async initialize(): Promise<void> {
    if (this._state.status === 'ready') return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this._init();
    return this.initPromise;
  }

  private async _init(): Promise<void> {
    const total = XSL_FILES.length + CONF_FILES.length;
    let loaded = 0;

    try {
      this.update({ status: 'fetching', error: null, progress: { loaded: 0, total } });

      const fetchFile = async (url: string): Promise<string> => {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${url}`);
        const text = await r.text();
        loaded++;
        this.update({ progress: { loaded, total } });
        return text;
      };

      // Fetch all in parallel
      const xslResults = await Promise.all(
        XSL_FILES.map(f => fetchFile(`${GITHUB_RAW_BASE}/xsl/${encodeURIComponent(f)}`))
      );
      const confResults = await Promise.all(
        CONF_FILES.map(f => fetchFile(`${GITHUB_RAW_BASE}/xsl/conf/${encodeURIComponent(f)}`))
      );

      this.update({ status: 'merging' });

      // Build lookup maps
      const xslMap = new Map<string, string>();
      XSL_FILES.forEach((name, i) => xslMap.set(name, xslResults[i]));

      const confMap = new Map<string, string>();
      CONF_FILES.forEach((name, i) => confMap.set(name, confResults[i]));

      // Merge all xsl:include into one monolithic stylesheet
      const mergedXsl = this.mergeStylesheets(xslMap, confMap);

      // Parse and create processor
      const parser = new DOMParser();
      const doc = parser.parseFromString(mergedXsl, 'text/xml');

      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        throw new Error(`XSLT parse error: ${parseError.textContent?.substring(0, 300)}`);
      }

      this.processor = new XSLTProcessor();
      this.processor.importStylesheet(doc);

      this.update({ status: 'ready' });
      console.log(`[marc2bibframe2] XSLT engine ready. ${XSL_FILES.length} stylesheets merged, ${CONF_FILES.length} config files embedded.`);

    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error('[marc2bibframe2] Init failed:', msg);
      this.update({ status: 'error', error: msg });
      this.initPromise = null;
      throw err;
    }
  }

  /**
   * Merge all xsl:include references into a single monolithic stylesheet.
   * Also replaces document('conf/...') references with inline variables.
   */
  private mergeStylesheets(
    xslMap: Map<string, string>,
    confMap: Map<string, string>,
  ): string {
    const parser = new DOMParser();
    const serializer = new XMLSerializer();
    const XSL_NS = 'http://www.w3.org/1999/XSL/Transform';

    // Parse main stylesheet
    const mainText = xslMap.get(MAIN_XSL)!;
    const mainDoc = parser.parseFromString(mainText, 'text/xml');
    const root = mainDoc.documentElement;

    // Collect all namespace declarations from root
    const namespaces: string[] = [];
    for (let i = 0; i < root.attributes.length; i++) {
      const attr = root.attributes[i];
      if (attr.name.startsWith('xmlns')) {
        namespaces.push(`${attr.name}="${attr.value}"`);
      }
    }

    // Collect the already-included set to avoid duplicates
    const included = new Set<string>([MAIN_XSL]);

    // Extract all non-include, non-import children from a stylesheet
    const extractContent = (xslText: string, filename: string): string => {
      const doc = parser.parseFromString(xslText, 'text/xml');
      const docRoot = doc.documentElement;
      if (!docRoot) return '';

      let content = '';

      // First resolve any nested includes
      const includes = docRoot.getElementsByTagNameNS(XSL_NS, 'include');
      const includeHrefs: string[] = [];
      for (let i = 0; i < includes.length; i++) {
        const href = includes[i].getAttribute('href');
        if (href) includeHrefs.push(href);
      }

      for (const href of includeHrefs) {
        // Normalize href (may be relative like "utils.xsl" or "./utils.xsl")
        const normalizedHref = href.replace(/^\.\//, '');
        if (!included.has(normalizedHref) && xslMap.has(normalizedHref)) {
          included.add(normalizedHref);
          content += `\n  <!-- ===== INCLUDED: ${normalizedHref} ===== -->\n`;
          content += extractContent(xslMap.get(normalizedHref)!, normalizedHref);
        }
      }

      // Then add all non-include, non-import, non-output elements
      for (let i = 0; i < docRoot.childNodes.length; i++) {
        const node = docRoot.childNodes[i];
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          const localName = el.localName;
          // Skip xsl:include, xsl:import, xsl:output (main has these already)
          if (el.namespaceURI === XSL_NS &&
              (localName === 'include' || localName === 'import' || localName === 'output')) {
            continue;
          }
          content += '  ' + serializer.serializeToString(el) + '\n';
        } else if (node.nodeType === Node.COMMENT_NODE) {
          content += '  <!--' + node.textContent + '-->\n';
        }
      }

      return content;
    };

    // Build the merged stylesheet
    let merged = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    merged += `<xsl:stylesheet version="1.0"\n  `;
    merged += namespaces.join('\n  ');

    // Add exsl namespace if not present (needed for node-set)
    if (!namespaces.some(ns => ns.includes('exsl'))) {
      merged += `\n  xmlns:exsl="http://exslt.org/common"`;
    }
    merged += `\n  exclude-result-prefixes="exsl">\n\n`;

    // Add xsl:output from main
    const outputs = root.getElementsByTagNameNS(XSL_NS, 'output');
    for (let i = 0; i < outputs.length; i++) {
      merged += '  ' + serializer.serializeToString(outputs[i]) + '\n';
    }

    // Embed conf files as top-level variables
    // The stylesheets use patterns like: document('conf/codeMaps.xml')
    // We'll create variables named the same way they're used in the XSLT
    merged += '\n  <!-- ===== EMBEDDED CONFIGURATION FILES ===== -->\n';
    for (const [filename, content] of confMap.entries()) {
      const varName = `conf-${filename.replace('.xml', '').replace(/[^a-zA-Z0-9]/g, '-')}`;
      // Parse the conf file and embed its root element
      const confDoc = parser.parseFromString(content, 'text/xml');
      if (confDoc.documentElement && !confDoc.querySelector('parsererror')) {
        const serialized = serializer.serializeToString(confDoc.documentElement);
        merged += `  <xsl:variable name="${varName}">\n    ${serialized}\n  </xsl:variable>\n`;
      }
    }
    merged += '\n';

    // Process main stylesheet content (non-include elements)
    merged += '\n  <!-- ===== MAIN: marc2bibframe2.xsl ===== -->\n';
    for (let i = 0; i < root.childNodes.length; i++) {
      const node = root.childNodes[i];
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        if (el.namespaceURI === XSL_NS &&
            (el.localName === 'include' || el.localName === 'import' || el.localName === 'output')) {
          // Process includes
          if (el.localName === 'include' || el.localName === 'import') {
            const href = el.getAttribute('href')?.replace(/^\.\//, '');
            if (href && !included.has(href) && xslMap.has(href)) {
              included.add(href);
              merged += `\n  <!-- ===== INCLUDED: ${href} ===== -->\n`;
              merged += extractContent(xslMap.get(href)!, href);
            }
          }
          continue;
        }
        merged += '  ' + serializer.serializeToString(el) + '\n';
      }
    }

    merged += '\n</xsl:stylesheet>';

    // Post-process: Replace document('conf/...') calls with $conf-... variables
    // This is the critical step to make conf files work without file system access
    for (const filename of CONF_FILES) {
      const varName = `conf-${filename.replace('.xml', '').replace(/[^a-zA-Z0-9]/g, '-')}`;
      // Replace various patterns of document() calls to conf files
      const patterns = [
        `document('conf/${filename}')`,
        `document("conf/${filename}")`,
        `document('conf/${filename}')`,
      ];
      for (const pattern of patterns) {
        merged = merged.split(pattern).join(`exsl:node-set($${varName})`);
      }
    }

    return merged;
  }

  /**
   * Convert MARCXML to BIBFRAME 2.0 RDF/XML
   */
  convert(marcxml: string, params?: {
    baseuri?: string;
    idfield?: string;
    idsource?: string;
    localfields?: string;
    serialization?: string;
  }): M2BConversionResult {
    if (!this.processor) {
      return { success: false, rdfxml: '', error: 'Engine not initialized' };
    }

    try {
      const parser = new DOMParser();
      const inputDoc = parser.parseFromString(marcxml, 'text/xml');

      const parseError = inputDoc.querySelector('parsererror');
      if (parseError) {
        return { success: false, rdfxml: '', error: `Invalid MARCXML: ${parseError.textContent?.substring(0, 200)}` };
      }

      // Set parameters
      if (params?.baseuri) this.processor.setParameter('', 'baseuri', params.baseuri);
      if (params?.idfield) this.processor.setParameter('', 'idfield', params.idfield);
      if (params?.idsource) this.processor.setParameter('', 'idsource', params.idsource);
      if (params?.localfields) this.processor.setParameter('', 'localfields', params.localfields);
      if (params?.serialization) this.processor.setParameter('', 'serialization', params.serialization);

      const resultDoc = this.processor.transformToDocument(inputDoc);
      if (!resultDoc || !resultDoc.documentElement) {
        return { success: false, rdfxml: '', error: 'XSLT transformation produced empty output' };
      }

      const serializer = new XMLSerializer();
      let rdfxml = serializer.serializeToString(resultDoc);
      rdfxml = this.prettyPrint(rdfxml);

      return { success: true, rdfxml, error: null };

    } catch (err: any) {
      return { success: false, rdfxml: '', error: `Transform error: ${err.message}` };
    }
  }

  private prettyPrint(xml: string): string {
    let formatted = xml.replace(/(>)\s*(<)/g, '$1\n$2');
    let indent = 0;
    const lines = formatted.split('\n');
    const result: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('</')) indent = Math.max(0, indent - 1);
      result.push('  '.repeat(indent) + trimmed);
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.startsWith('<?') &&
          !trimmed.endsWith('/>') && !trimmed.includes('</')) {
        indent++;
      }
    }
    return result.join('\n');
  }

  reset() {
    this.processor = null;
    this.initPromise = null;
    this.update({
      status: 'idle', error: null,
      progress: { loaded: 0, total: XSL_FILES.length + CONF_FILES.length },
      xslFilesCount: XSL_FILES.length, confFilesCount: CONF_FILES.length,
    });
  }
}

// Singleton
let instance: Marc2BibframeXSLTEngine | null = null;
export function getMarc2BibframeEngine(): Marc2BibframeXSLTEngine {
  if (!instance) instance = new Marc2BibframeXSLTEngine();
  return instance;
}

// ============================================================================
// SAMPLE MARCXML RECORD
// ============================================================================
export const SAMPLE_MARCXML = `<?xml version="1.0" encoding="UTF-8"?>
<record xmlns="http://www.loc.gov/MARC21/slim">
  <leader>01234nam a22002893i 4500</leader>
  <controlfield tag="001">13600108</controlfield>
  <controlfield tag="003">DLC</controlfield>
  <controlfield tag="005">20240315120000.0</controlfield>
  <controlfield tag="008">240101s2024    ilu    b    001 0 eng d</controlfield>
  <datafield tag="010" ind1=" " ind2=" ">
    <subfield code="a">  2024012345</subfield>
  </datafield>
  <datafield tag="020" ind1=" " ind2=" ">
    <subfield code="a">978-0-8389-1234-5</subfield>
  </datafield>
  <datafield tag="040" ind1=" " ind2=" ">
    <subfield code="a">DLC</subfield>
    <subfield code="b">eng</subfield>
    <subfield code="e">rda</subfield>
    <subfield code="c">DLC</subfield>
  </datafield>
  <datafield tag="050" ind1="0" ind2="0">
    <subfield code="a">Z666.7</subfield>
    <subfield code="b">.S65 2024</subfield>
  </datafield>
  <datafield tag="082" ind1="0" ind2="0">
    <subfield code="a">025.04</subfield>
    <subfield code="2">23</subfield>
  </datafield>
  <datafield tag="100" ind1="1" ind2=" ">
    <subfield code="a">Smith, John A.,</subfield>
    <subfield code="e">author.</subfield>
  </datafield>
  <datafield tag="245" ind1="1" ind2="0">
    <subfield code="a">Introduction to Linked Data :</subfield>
    <subfield code="b">a practical guide for librarians /</subfield>
    <subfield code="c">John A. Smith ; edited by Mary B. Johnson.</subfield>
  </datafield>
  <datafield tag="250" ind1=" " ind2=" ">
    <subfield code="a">Second edition.</subfield>
  </datafield>
  <datafield tag="264" ind1=" " ind2="1">
    <subfield code="a">Chicago :</subfield>
    <subfield code="b">ALA Editions,</subfield>
    <subfield code="c">2024.</subfield>
  </datafield>
  <datafield tag="300" ind1=" " ind2=" ">
    <subfield code="a">xii, 345 pages :</subfield>
    <subfield code="b">illustrations ;</subfield>
    <subfield code="c">24 cm</subfield>
  </datafield>
  <datafield tag="336" ind1=" " ind2=" ">
    <subfield code="a">text</subfield>
    <subfield code="b">txt</subfield>
    <subfield code="2">rdacontent</subfield>
  </datafield>
  <datafield tag="337" ind1=" " ind2=" ">
    <subfield code="a">unmediated</subfield>
    <subfield code="b">n</subfield>
    <subfield code="2">rdamedia</subfield>
  </datafield>
  <datafield tag="338" ind1=" " ind2=" ">
    <subfield code="a">volume</subfield>
    <subfield code="b">nc</subfield>
    <subfield code="2">rdacarrier</subfield>
  </datafield>
  <datafield tag="490" ind1="0" ind2=" ">
    <subfield code="a">Library Technology Essentials ;</subfield>
    <subfield code="v">no. 7</subfield>
  </datafield>
  <datafield tag="504" ind1=" " ind2=" ">
    <subfield code="a">Includes bibliographical references and index.</subfield>
  </datafield>
  <datafield tag="520" ind1=" " ind2=" ">
    <subfield code="a">A comprehensive introduction to linked data technologies and their application in library science and information management.</subfield>
  </datafield>
  <datafield tag="650" ind1=" " ind2="0">
    <subfield code="a">Linked data</subfield>
  </datafield>
  <datafield tag="650" ind1=" " ind2="0">
    <subfield code="a">Semantic Web</subfield>
  </datafield>
  <datafield tag="650" ind1=" " ind2="0">
    <subfield code="a">Libraries</subfield>
    <subfield code="x">Data processing</subfield>
  </datafield>
  <datafield tag="700" ind1="1" ind2=" ">
    <subfield code="a">Johnson, Mary B.,</subfield>
    <subfield code="e">editor.</subfield>
  </datafield>
</record>`;
