/**
 * Marva Service
 * Implements Library of Congress Marva Cataloging Tools and BIBFRAME Primer Specifications:
 * - Minimal Level Cataloging (MLC) Numbers Generator
 * - Name Authority Record (NAR) Creator (MARC21 Authority & MADS/RDF)
 * - BCP47 Language & Script Tag Normalizer (Primer Compliant)
 * - Diacritic Macros & Text Expansion Macros
 * - FOLIO Inventory Sync Simulation
 * - Global Find & Replace Engine
 * - History & Audit Trail Engine
 */

// ==========================================
// 1. MLC NUMBERS GENERATOR
// ==========================================

export interface MLCNumberOptions {
  year?: number;
  dimensions?: string; // e.g. "24 cm" or "32 cm"
  materialType?: 'book' | 'music' | 'serial' | 'map';
}

export interface MLCNumberResult {
  lccn: string;
  callNumber: string;
  shelfLocation: string;
  isOversize: boolean;
  explanation: string;
}

/**
 * Generate an LC Minimal Level Cataloging (MLC) number according to LC practice:
 * Format: [Year]-[6-digit sequential number]
 * Call number: MLC [Oversize flag] [Year]/[sequence]
 */
export function generateMLCNumber(options: MLCNumberOptions = {}): MLCNumberResult {
  const currentYear = options.year || new Date().getFullYear();
  const randomSeq = Math.floor(100000 + Math.random() * 900000);
  const lccn = `${currentYear}${randomSeq.toString().padStart(6, '0')}`;

  // Check dimensions for oversize (LC rule: over 28 cm or 30 cm is usually classified as Folio / Oversize)
  let isOversize = false;
  if (options.dimensions) {
    const match = options.dimensions.match(/(\d+)\s*cm/i);
    if (match && parseInt(match[1], 10) >= 30) {
      isOversize = true;
    }
  }

  const prefix = isOversize ? 'Folio ' : '';
  const callNumber = `MLC${isOversize ? 'F' : ''} ${currentYear}/${randomSeq.toString().padStart(5, '0')}`;
  const shelfLocation = isOversize ? 'Library of Congress - Oversize Collection' : 'Library of Congress - General Collections';

  return {
    lccn,
    callNumber,
    shelfLocation,
    isOversize,
    explanation: `Assigned MLC number for year ${currentYear} (LC prefix: ${prefix}MLC).`
  };
}

// ==========================================
// 2. NAME AUTHORITY RECORD (NAR) GENERATOR
// ==========================================

export interface NAREntityData {
  authorizedHeading: string;
  type: 'personal' | 'corporate' | 'meeting';
  birthDate?: string;
  deathDate?: string;
  titleOrTerm?: string;
  variantNames?: string[];
  sourceTitle?: string;
  sourceUri?: string;
  catalogerCode?: string;
}

export interface NARRecordResult {
  lccn: string;
  marc21Text: string;
  madsRdfXml: string;
  authorizedAccessPoint: string;
}

export function generateNAR(data: NAREntityData): NARRecordResult {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Math.floor(100000 + Math.random() * 900000);
  const lccn = `n  ${new Date().getFullYear() % 100}${seq}`;
  const cataloger = data.catalogerCode || 'DLC';

  // Dates string
  let dates = '';
  if (data.birthDate || data.deathDate) {
    dates = `, ${data.birthDate || ''}-${data.deathDate || ''}`;
  }

  const fullHeading = `${data.authorizedHeading}${dates}`;
  const tag = data.type === 'personal' ? '100 1 ' : data.type === 'corporate' ? '110 2 ' : '111 2 ';

  // Build MARC21 Authority Text
  let marc = `=LDR  00000nz  a2200000n  4500\n`;
  marc += `=001  ${lccn}\n`;
  marc += `=003  DLC\n`;
  marc += `=005  ${dateStr}120000.0\n`;
  marc += `=008  ${dateStr.slice(2)}n| azannaabn          |a aaa      \n`;
  marc += `=010  \\\\$a${lccn}\n`;
  marc += `=040  \\\\$a${cataloger}$beng$eRDA$c${cataloger}\n`;
  marc += `=${tag}$a${data.authorizedHeading}${data.titleOrTerm ? '$c' + data.titleOrTerm : ''}${dates ? '$d' + dates.replace(/^, /, '') : ''}\n`;

  if (data.variantNames && data.variantNames.length > 0) {
    for (const v of data.variantNames) {
      const vTag = data.type === 'personal' ? '400 1 ' : '410 2 ';
      marc += `=${vTag}$a${v}\n`;
    }
  }

  if (data.sourceTitle) {
    marc += `=670  \\\\$a${data.sourceTitle}, ${new Date().getFullYear()}: $btitle page (${data.authorizedHeading})\n`;
  }
  if (data.sourceUri) {
    marc += `=670  \\\\$aWork resource URI: $u${data.sourceUri}\n`;
  }

  // Build MADS/RDF XML
  const madsRdf = `<rdf:RDF
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"
  xmlns:ident="http://id.loc.gov/vocabulary/identifiers/">
  
  <madsrdf:Authority rdf:about="http://id.loc.gov/authorities/names/${lccn.replace(/\s+/g, '')}">
    <rdf:type rdf:resource="http://www.loc.gov/mads/rdf/v1#${data.type === 'personal' ? 'PersonalName' : 'CorporateName'}"/>
    <madsrdf:authoritativeLabel>${fullHeading}</madsrdf:authoritativeLabel>
    <madsrdf:elementList rdf:parseType="Collection">
      <madsrdf:FullNameElement>
        <madsrdf:elementValue>${data.authorizedHeading}</madsrdf:elementValue>
      </madsrdf:FullNameElement>
      ${dates ? `<madsrdf:DateNameElement><madsrdf:elementValue>${dates.replace(/^, /, '')}</madsrdf:elementValue></madsrdf:DateNameElement>` : ''}
    </madsrdf:elementList>
    <madsrdf:identifiesRWO>
      <rdf:Description rdf:about="http://id.loc.gov/rwo/agents/${lccn.replace(/\s+/g, '')}">
        <rdfs:label>${fullHeading}</rdfs:label>
      </rdf:Description>
    </madsrdf:identifiesRWO>
  </madsrdf:Authority>
</rdf:RDF>`;

  return {
    lccn,
    marc21Text: marc,
    madsRdfXml: madsRdf,
    authorizedAccessPoint: fullHeading
  };
}

// ==========================================
// 3. BCP47 LANGUAGE & SCRIPT NORMALIZER (PRIMER)
// ==========================================

export interface BCP47TagInfo {
  tag: string;
  language: string;
  script?: string;
  region?: string;
  normalized: string;
  isValid: boolean;
}

/**
 * Normalizes language codes according to BIBFRAME Primer section "Language and script codes":
 * 1) Retain components.
 * 2) 2-character lowercase preferred; 3-character if 2-char unavailable.
 * 3) If "Suppress-script" in IANA registry (e.g. en-Latn -> en), remove script.
 * 4) If not suppressed (e.g. ar-Arab, ru-Cyrl, zh-Hans), require script.
 * 5) Entire code to lowercase.
 */
export function normalizeBCP47(tag: string): BCP47TagInfo {
  const cleaned = tag.trim().toLowerCase();
  const parts = cleaned.split(/[-_]/);
  const lang = parts[0] || 'und';
  let script = parts.length > 1 && parts[1].length === 4 ? parts[1] : undefined;
  let region = parts.length > 2 ? parts[2] : (!script && parts[1]?.length === 2 ? parts[1] : undefined);

  // Common suppress-script mappings from IANA:
  const suppressScriptMap: Record<string, string> = {
    en: 'latn',
    fr: 'latn',
    de: 'latn',
    es: 'latn',
    it: 'latn'
  };

  // Capitalize script for display if present
  let normScript = script ? script.charAt(0).toUpperCase() + script.slice(1).toLowerCase() : undefined;
  let normalized = lang;

  if (normScript) {
    if (suppressScriptMap[lang] && suppressScriptMap[lang] === normScript.toLowerCase()) {
      // Suppress script per primer guidelines
      normalized = lang;
    } else {
      normalized = `${lang}-${normScript}`;
    }
  }

  if (region) {
    normalized += `-${region.toUpperCase()}`;
  }

  return {
    tag,
    language: lang,
    script: normScript,
    region,
    normalized,
    isValid: lang.length >= 2
  };
}

// ==========================================
// 4. DIACRITICS & TEXT MACROS (MARVA USER MANUAL)
// ==========================================

export interface DiacriticMacro {
  char: string;
  name: string;
  shortcut: string;
  combining?: string;
}

export const MARVA_DIACRITICS: DiacriticMacro[] = [
  { char: '¯', name: 'Macron', shortcut: 'Alt+M', combining: '\u0304' },
  { char: '´', name: 'Acute', shortcut: 'Alt+A', combining: '\u0301' },
  { char: '`', name: 'Grave', shortcut: 'Alt+G', combining: '\u0300' },
  { char: 'ˆ', name: 'Circumflex', shortcut: 'Alt+C', combining: '\u0302' },
  { char: '˜', name: 'Tilde', shortcut: 'Alt+T', combining: '\u0303' },
  { char: '¨', name: 'Umlaut/Diaeresis', shortcut: 'Alt+U', combining: '\u0308' },
  { char: '¸', name: 'Cedilla', shortcut: 'Alt+K', combining: '\u0327' },
  { char: 'ˇ', name: 'Hacek/Caron', shortcut: 'Alt+H', combining: '\u030c' },
  { char: '˘', name: 'Breve', shortcut: 'Alt+B', combining: '\u0306' },
  { char: '˙', name: 'Dot Above', shortcut: 'Alt+D', combining: '\u0307' },
  { char: '̣', name: 'Dot Below', shortcut: 'Alt+Shift+D', combining: '\u0323' },
  { char: 'ʻ', name: 'ʻAyn / Alif', shortcut: "Alt+'", combining: '\u02bb' },
  { char: 'ʼ', name: 'Hamzah', shortcut: 'Alt+"', combining: '\u02bc' },
  { char: 'æ', name: 'ae ligature', shortcut: 'Alt+E' },
  { char: 'œ', name: 'oe ligature', shortcut: 'Alt+O' }
];

export interface TextMacro {
  trigger: string;
  expansion: string;
  description: string;
}

export const MARVA_TEXT_MACROS: TextMacro[] = [
  { trigger: ';bib', expansion: 'Includes bibliographical references (pages ) and index.', description: 'Bibliography & Index note' },
  { trigger: ';cm', expansion: 'pages : illustrations ; cm', description: 'Standard physical description' },
  { trigger: ';ill', expansion: 'illustrations (some color) ; cm', description: 'Illustrated physical description' },
  { trigger: ';onl', expansion: '1 online resource', description: 'Online resource extent' },
  { trigger: ';dis', expansion: 'Thesis (Ph. D.)--University, ', description: 'Dissertation note template' },
  { trigger: ';sor', expansion: 'by ', description: 'Statement of responsibility prefix' }
];

// ==========================================
// 5. FOLIO SYNC SIMULATION (MARVA TOOLS)
// ==========================================

export interface FolioSyncRecord {
  instanceHrid: string;
  title: string;
  holdingsHrid: string;
  itemBarcode: string;
  effectiveLocation: string;
  status: 'In transit' | 'Available' | 'Checked out' | 'Cataloging review';
  syncStatus: 'Synced' | 'Pending' | 'Conflict';
  lastSyncedAt: string;
}

export function simulateFolioSync(title: string, lccn?: string): FolioSyncRecord {
  const hridNum = Math.floor(1000000 + Math.random() * 9000000);
  const barcodeNum = Math.floor(30000000000000 + Math.random() * 9000000000000);
  return {
    instanceHrid: `in${hridNum}`,
    title: title || 'Untitled Resource',
    holdingsHrid: `ho${hridNum + 10}`,
    itemBarcode: barcodeNum.toString(),
    effectiveLocation: 'Library of Congress - Jefferson Bldg - Main Stacks',
    status: 'Available',
    syncStatus: 'Synced',
    lastSyncedAt: new Date().toLocaleTimeString()
  };
}

// ==========================================
// 6. GLOBAL FIND & REPLACE ENGINE
// ==========================================

export interface FindReplaceMatch {
  entity: 'work' | 'instance' | 'item' | 'hub';
  field: string;
  currentValue: string;
  replacedValue: string;
}

export function executeFindReplace(
  data: { work: any; instance: any; item?: any; hub?: any },
  findText: string,
  replaceText: string,
  matchCase: boolean = false
): { updatedData: any; matches: FindReplaceMatch[] } {
  if (!findText) return { updatedData: data, matches: [] };

  const matches: FindReplaceMatch[] = [];
  const regexFlags = matchCase ? 'g' : 'gi';
  const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, regexFlags);

  function processObject(obj: any, entity: 'work' | 'instance' | 'item' | 'hub'): any {
    if (!obj) return obj;
    const cloned = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key of Object.keys(cloned)) {
      const val = cloned[key];
      if (typeof val === 'string') {
        if (regex.test(val)) {
          const replaced = val.replace(regex, replaceText);
          matches.push({
            entity,
            field: key,
            currentValue: val,
            replacedValue: replaced
          });
          cloned[key] = replaced;
        }
      } else if (typeof val === 'object' && val !== null) {
        cloned[key] = processObject(val, entity);
      }
    }
    return cloned;
  }

  const updatedData = {
    work: processObject(data.work, 'work'),
    instance: processObject(data.instance, 'instance'),
    item: processObject(data.item, 'item'),
    hub: processObject(data.hub, 'hub')
  };

  return { updatedData, matches };
}

// ==========================================
// 7. MARVA HISTORY LOG & AUDIT TRAIL
// ==========================================

export interface MarvaHistoryEntry {
  id: string;
  timestamp: string;
  cataloger: string;
  entity: 'Work' | 'Instance' | 'Item' | 'Hub' | 'Admin';
  field: string;
  previousValue: any;
  newValue: any;
  description: string;
}

export class MarvaHistoryLog {
  private entries: MarvaHistoryEntry[] = [];
  private maxEntries: number = 100;

  addEntry(entry: Omit<MarvaHistoryEntry, 'id' | 'timestamp'>): MarvaHistoryEntry {
    const fullEntry: MarvaHistoryEntry = {
      ...entry,
      id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString()
    };
    this.entries.unshift(fullEntry);
    if (this.entries.length > this.maxEntries) {
      this.entries.pop();
    }
    return fullEntry;
  }

  getEntries(): MarvaHistoryEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }
}
