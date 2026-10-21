import React, { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ChevronLeft, Upload, Download, FileText, Copy, Play,
  BookOpen, Code, RefreshCw, Trash2,
  CheckCircle, AlertTriangle, Info, FileCode, ArrowRight,
  Table, Eye, ExternalLink,
  GitBranch, Loader2, WifiOff, Zap, Shield,
  Terminal, FileInput, ToggleLeft, ToggleRight
} from 'lucide-react';
import {
  getXSLTEngine,
  SAMPLE_BIBFRAME_RDFXML,
  parseMarcXml,
  type EngineState,
  type ParsedMarcRecord,
  type ParsedMarcField,
} from './Bibframe2MarcEngine';

// ============================================================================
// BIBFRAME2MARC CONVERTER
// Uses the ACTUAL Library of Congress bibframe2marc XSLT rules
// https://github.com/lcnetdev/bibframe2marc (v3.0.0)
//
// Primary: Browser-native XSLTProcessor with LC's compile.xsl + XML rules
// Fallback: TypeScript conversion engine for when XSLT is unavailable
// ============================================================================

// ============================================================================
// FALLBACK: TypeScript-based conversion engine
// Used when browser XSLT is unavailable or fails
// ============================================================================

interface MarcRecord {
  leader: string;
  controlFields: { tag: string; value: string }[];
  dataFields: ParsedMarcField[];
}

interface ConversionResult {
  success: boolean;
  record: MarcRecord | null;
  marcxml: string;
  warnings: string[];
  errors: string[];
  engine: 'xslt' | 'typescript';
  stats: {
    fieldsGenerated: number;
    propertiesMapped: number;
    unmappedProperties: string[];
  };
}

function extractValue(obj: any): string {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (obj['@value']) return obj['@value'];
  if (obj['rdfs:label']) return extractValue(obj['rdfs:label']);
  if (obj['bf:mainTitle']) return extractValue(obj['bf:mainTitle']);
  if (Array.isArray(obj)) return obj.map(extractValue).filter(Boolean).join('; ');
  return '';
}

function extractUri(obj: any): string {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (obj['@id']) return obj['@id'];
  return '';
}

function generateLeader(work: any, instance: any): string {
  let typeOfRecord = 'a';
  let bibLevel = 'm';
  const workType = work?.['@type'] || '';
  const instanceType = instance?.['@type'] || '';

  if (workType.includes('NotatedMusic') && workType.includes('Manuscript')) typeOfRecord = 'd';
  else if (workType.includes('NotatedMusic')) typeOfRecord = 'c';
  else if (workType.includes('Cartography') && workType.includes('Manuscript')) typeOfRecord = 'f';
  else if (workType.includes('Cartography')) typeOfRecord = 'e';
  else if (workType.includes('MovingImage')) typeOfRecord = 'g';
  else if (workType.includes('NonMusicAudio')) typeOfRecord = 'i';
  else if (workType.includes('MusicAudio')) typeOfRecord = 'j';
  else if (workType.includes('StillImage')) typeOfRecord = 'k';
  else if (workType.includes('Multimedia')) typeOfRecord = 'm';
  else if (workType.includes('MixedMaterial')) typeOfRecord = 'p';
  else if (workType.includes('Object')) typeOfRecord = 'r';
  else if (workType.includes('Text') && workType.includes('Manuscript')) typeOfRecord = 't';

  if (workType.includes('Collection')) bibLevel = 'c';
  else if (workType.includes('Integrating')) bibLevel = 'i';
  else if (workType.includes('Serial') || instanceType.includes('Serial')) bibLevel = 's';

  return `00000n${typeOfRecord}${bibLevel} a22     i 4500`;
}

function generate008(work: any, instance: any): string {
  const now = new Date();
  const dateEntered = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  let date1 = '    ', date2 = '    ', dateType = 's';
  const provAct = instance?.['bf:provisionActivity'] || instance?.['bf:publication'];
  if (provAct) {
    const year = extractValue(provAct?.['bf:date'] || provAct)?.match(/\d{4}/)?.[0];
    if (year) date1 = year;
  }
  let place = 'xx ';
  let lang = 'eng';
  const workLang = work?.['bf:language'];
  if (workLang) {
    const langMatch = extractUri(workLang).match(/languages\/(\w{3})/);
    if (langMatch) lang = langMatch[1];
  }
  const filler = '                 ';
  return `${dateEntered}${dateType}${date1}${date2}${place}${filler}${lang}  `;
}

function convertBibframeJsonLdToMarc(input: any): ConversionResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const unmappedProperties: string[] = [];
  let propertiesMapped = 0;

  try {
    let work: any = null, instance: any = null, items: any[] = [];

    if (input?.['@graph']) {
      const graph = input['@graph'];
      work = graph.find((n: any) => { const t = n['@type']; return (Array.isArray(t) ? t.some((x: string) => x?.includes('Work')) : t?.includes?.('Work')); });
      instance = graph.find((n: any) => { const t = n['@type']; return (Array.isArray(t) ? t.some((x: string) => x?.includes('Instance')) : t?.includes?.('Instance')); });
      items = graph.filter((n: any) => { const t = n['@type']; return (Array.isArray(t) ? t.some((x: string) => x?.includes('Item')) : t?.includes?.('Item')); });
    } else {
      work = input?.work || input;
      instance = input?.instance || {};
      if (input?.item) items = Array.isArray(input.item) ? input.item : [input.item];
    }

    if (!work && !instance) {
      return { success: false, record: null, marcxml: '', warnings, errors: ['No BIBFRAME Work or Instance found'], engine: 'typescript', stats: { fieldsGenerated: 0, propertiesMapped: 0, unmappedProperties: [] } };
    }

    work = work || {}; instance = instance || {};
    const leader = generateLeader(work, instance);
    const controlFields: { tag: string; value: string }[] = [];
    const dataFields: ParsedMarcField[] = [];

    // 001
    const controlNum = extractUri(work) || extractUri(instance) || `moon-${Date.now()}`;
    controlFields.push({ tag: '001', value: controlNum.replace(/.*\//, '').slice(0, 20) }); propertiesMapped++;
    controlFields.push({ tag: '003', value: 'MOON-BIBFRAME' });
    const now = new Date();
    controlFields.push({ tag: '005', value: now.toISOString().replace(/[-:T]/g, '').replace(/\.\d+Z/, '.0') });
    controlFields.push({ tag: '008', value: generate008(work, instance) }); propertiesMapped++;

    // Identifiers
    const identifiers = [].concat(instance?.['bf:identifiedBy'] || []);
    identifiers.forEach((id: any) => {
      const idType = id?.['@type'] || '';
      const idValue = extractValue(id?.['rdf:value'] || id?.['bf:value'] || id);
      if (idType.includes('Isbn')) { dataFields.push({ tag: '020', ind1: ' ', ind2: ' ', subfields: [{ code: 'a', value: idValue }] }); propertiesMapped++; }
      else if (idType.includes('Issn')) { dataFields.push({ tag: '022', ind1: ' ', ind2: ' ', subfields: [{ code: 'a', value: idValue }] }); propertiesMapped++; }
      else if (idType.includes('Lccn')) { dataFields.push({ tag: '010', ind1: ' ', ind2: ' ', subfields: [{ code: 'a', value: idValue }] }); propertiesMapped++; }
      else if (idType.includes('Doi')) { dataFields.push({ tag: '024', ind1: '7', ind2: ' ', subfields: [{ code: 'a', value: idValue }, { code: '2', value: 'doi' }] }); propertiesMapped++; }
      else if (idValue) { dataFields.push({ tag: '024', ind1: '8', ind2: ' ', subfields: [{ code: 'a', value: idValue }] }); propertiesMapped++; }
    });

    // Work identifiers
    const workIds = [].concat(work?.['bf:identifiedBy'] || []);
    workIds.forEach((id: any) => {
      const idType = id?.['@type'] || '';
      const idValue = extractValue(id?.['rdf:value'] || id?.['bf:value'] || id);
      if (idType.includes('Lccn')) { dataFields.push({ tag: '010', ind1: ' ', ind2: ' ', subfields: [{ code: 'a', value: idValue }] }); propertiesMapped++; }
    });

    // 040
    const adminMetadata = work?.['bf:adminMetadata'] || instance?.['bf:adminMetadata'];
    if (adminMetadata) {
      const source = extractValue(adminMetadata?.['bf:source'] || adminMetadata?.['bf:assigner']);
      const subs: { code: string; value: string }[] = [{ code: 'a', value: source || 'MOON' }, { code: 'b', value: 'eng' }];
      const descConventions = extractValue(adminMetadata?.['bf:descriptionConventions']);
      if (descConventions) subs.push({ code: 'e', value: descConventions });
      subs.push({ code: 'c', value: source || 'MOON' });
      dataFields.push({ tag: '040', ind1: ' ', ind2: ' ', subfields: subs }); propertiesMapped++;
    }

    // 041
    const languages = [].concat(work?.['bf:language'] || []);
    if (languages.length > 1) {
      const langSubs = languages.map((l: any) => {
        const match = extractUri(l).match(/languages\/(\w{3})/);
        return { code: 'a', value: match ? match[1] : extractValue(l) };
      }).filter((s: any) => s.value);
      if (langSubs.length > 0) { dataFields.push({ tag: '041', ind1: '0', ind2: ' ', subfields: langSubs }); propertiesMapped++; }
    }

    // Classifications
    const classifications = [].concat(work?.['bf:classification'] || []);
    classifications.forEach((cls: any) => {
      const clsType = cls?.['@type'] || '';
      const clsValue = extractValue(cls?.['bf:classificationPortion'] || cls?.['rdfs:label'] || cls);
      const itemNum = extractValue(cls?.['bf:itemPortion'] || '');
      if (clsType.includes('ClassificationLcc') || clsType.includes('LCC')) {
        const subs = [{ code: 'a', value: clsValue }];
        if (itemNum) subs.push({ code: 'b', value: itemNum });
        dataFields.push({ tag: '050', ind1: ' ', ind2: '4', subfields: subs }); propertiesMapped++;
      } else if (clsType.includes('ClassificationDdc') || clsType.includes('DDC')) {
        const subs: { code: string; value: string }[] = [{ code: 'a', value: clsValue }];
        const edition = extractValue(cls?.['bf:edition'] || '');
        if (edition) subs.push({ code: '2', value: edition });
        dataFields.push({ tag: '082', ind1: '0', ind2: '4', subfields: subs }); propertiesMapped++;
      }
    });

    // 1XX/7XX Contributions
    const contributions = [].concat(work?.['bf:contribution'] || []);
    let hasMainEntry = false;
    contributions.forEach((contrib: any, idx: number) => {
      const agent = contrib?.['bf:agent'] || contrib;
      const agentType = agent?.['@type'] || '';
      const name = extractValue(agent?.['rdfs:label'] || agent?.['bf:authorizedAccessPoint'] || agent);
      const role = extractValue(contrib?.['bf:role'] || '');
      if (!name) return;
      const isMain = idx === 0 && !hasMainEntry;
      const tag = isMain
        ? (agentType.includes('Organization') ? '110' : agentType.includes('Meeting') ? '111' : '100')
        : (agentType.includes('Organization') ? '710' : agentType.includes('Meeting') ? '711' : '700');
      if (isMain) hasMainEntry = true;
      const subs: { code: string; value: string }[] = [{ code: 'a', value: name }];
      if (role) subs.push({ code: 'e', value: role.toLowerCase() });
      let ind1 = '1';
      if ((tag === '100' || tag === '700') && !name.includes(',')) ind1 = '0';
      else if (tag !== '100' && tag !== '700') ind1 = '2';
      dataFields.push({ tag, ind1, ind2: ' ', subfields: subs }); propertiesMapped++;
    });

    // 245
    const titleObj = work?.['bf:title'] || instance?.['bf:title'];
    if (titleObj) {
      const mainTitle = extractValue(titleObj?.['bf:mainTitle'] || titleObj);
      const subtitle = extractValue(titleObj?.['bf:subtitle'] || '');
      if (mainTitle) {
        const subs: { code: string; value: string }[] = [{ code: 'a', value: mainTitle }];
        if (subtitle) subs.push({ code: 'b', value: subtitle });
        const resp = extractValue(instance?.['bf:responsibilityStatement'] || work?.['bf:responsibilityStatement'] || '');
        if (resp) subs.push({ code: 'c', value: resp });
        dataFields.push({ tag: '245', ind1: hasMainEntry ? '1' : '0', ind2: '0', subfields: subs }); propertiesMapped++;
      }
    }

    // 246
    const variantTitles = [].concat(work?.['bf:variantTitle'] || instance?.['bf:variantTitle'] || []);
    variantTitles.forEach((vt: any) => {
      const title = extractValue(vt?.['bf:mainTitle'] || vt);
      if (title) { dataFields.push({ tag: '246', ind1: '1', ind2: ' ', subfields: [{ code: 'a', value: title }] }); propertiesMapped++; }
    });

    // 250
    const edition = extractValue(instance?.['bf:editionStatement'] || '');
    if (edition) { dataFields.push({ tag: '250', ind1: ' ', ind2: ' ', subfields: [{ code: 'a', value: edition }] }); propertiesMapped++; }

    // 264
    const provisionActivities = [].concat(instance?.['bf:provisionActivity'] || instance?.['bf:publication'] || []);
    provisionActivities.forEach((pa: any) => {
      const paType = pa?.['@type'] || '';
      const place = extractValue(pa?.['bf:place']?.['rdfs:label'] || pa?.['bf:place'] || '');
      const agent = extractValue(pa?.['bf:agent']?.['rdfs:label'] || pa?.['bf:agent'] || '');
      const date = extractValue(pa?.['bf:date'] || '');
      let ind2 = '1';
      if (paType.includes('Production')) ind2 = '0';
      else if (paType.includes('Distribution')) ind2 = '2';
      else if (paType.includes('Manufacture')) ind2 = '3';
      const subs: { code: string; value: string }[] = [];
      if (place) subs.push({ code: 'a', value: place });
      if (agent) subs.push({ code: 'b', value: agent });
      if (date) subs.push({ code: 'c', value: date });
      if (subs.length > 0) { dataFields.push({ tag: '264', ind1: ' ', ind2, subfields: subs }); propertiesMapped++; }
    });

    // 300
    const extent = extractValue(instance?.['bf:extent']?.['rdfs:label'] || instance?.['bf:extent'] || '');
    const dimensions = extractValue(instance?.['bf:dimensions'] || '');
    if (extent || dimensions) {
      const subs: { code: string; value: string }[] = [];
      if (extent) subs.push({ code: 'a', value: extent });
      if (dimensions) subs.push({ code: 'c', value: dimensions });
      dataFields.push({ tag: '300', ind1: ' ', ind2: ' ', subfields: subs }); propertiesMapped++;
    }

    // 336/337/338
    const contentType = extractValue(work?.['bf:content']?.['rdfs:label'] || work?.['bf:content'] || '');
    if (contentType) { dataFields.push({ tag: '336', ind1: ' ', ind2: ' ', subfields: [{ code: 'a', value: contentType }, { code: '2', value: 'rdacontent' }] }); propertiesMapped++; }
    const mediaType = extractValue(instance?.['bf:media']?.['rdfs:label'] || instance?.['bf:media'] || '');
    if (mediaType) { dataFields.push({ tag: '337', ind1: ' ', ind2: ' ', subfields: [{ code: 'a', value: mediaType }, { code: '2', value: 'rdamedia' }] }); propertiesMapped++; }
    const carrierType = extractValue(instance?.['bf:carrier']?.['rdfs:label'] || instance?.['bf:carrier'] || '');
    if (carrierType) { dataFields.push({ tag: '338', ind1: ' ', ind2: ' ', subfields: [{ code: 'a', value: carrierType }, { code: '2', value: 'rdacarrier' }] }); propertiesMapped++; }

    // 490
    const seriesStatements = [].concat(instance?.['bf:seriesStatement'] || []);
    seriesStatements.forEach((ss: any) => {
      const title = extractValue(ss);
      if (title) { dataFields.push({ tag: '490', ind1: '0', ind2: ' ', subfields: [{ code: 'a', value: title }] }); propertiesMapped++; }
    });

    // 500/505/520
    const notes = [].concat(work?.['bf:note'] || instance?.['bf:note'] || []);
    notes.forEach((note: any) => {
      const noteText = extractValue(note?.['rdfs:label'] || note?.['bf:noteText'] || note);
      if (noteText) { dataFields.push({ tag: '500', ind1: ' ', ind2: ' ', subfields: [{ code: 'a', value: noteText }] }); propertiesMapped++; }
    });
    const toc = extractValue(work?.['bf:tableOfContents']?.['rdfs:label'] || work?.['bf:tableOfContents'] || '');
    if (toc) { dataFields.push({ tag: '505', ind1: '0', ind2: ' ', subfields: [{ code: 'a', value: toc }] }); propertiesMapped++; }
    const summary = extractValue(work?.['bf:summary']?.['rdfs:label'] || work?.['bf:summary'] || '');
    if (summary) { dataFields.push({ tag: '520', ind1: ' ', ind2: ' ', subfields: [{ code: 'a', value: summary }] }); propertiesMapped++; }

    // 6XX Subjects
    const subjects = [].concat(work?.['bf:subject'] || []);
    subjects.forEach((subj: any) => {
      const subjType = subj?.['@type'] || '';
      const label = extractValue(subj?.['rdfs:label'] || subj?.['bf:authorizedAccessPoint'] || subj);
      const source = extractValue(subj?.['bf:source']?.['bf:code'] || subj?.['bf:source'] || '');
      if (!label) return;
      let ind2 = '4';
      if (source.includes('lcsh')) ind2 = '0';
      else if (source.includes('mesh')) ind2 = '2';
      let tag = '650';
      if (subjType.includes('Person')) tag = '600';
      else if (subjType.includes('Organization')) tag = '610';
      else if (subjType.includes('Place') || subjType.includes('Geographic')) tag = '651';
      else if (subjType.includes('Genre')) tag = '655';
      const subs: { code: string; value: string }[] = [{ code: 'a', value: label }];
      if (source && ind2 === '4') { subs.push({ code: '2', value: source }); ind2 = '7'; }
      dataFields.push({ tag, ind1: ' ', ind2, subfields: subs }); propertiesMapped++;
    });

    // 852/856
    items.forEach((item: any) => {
      const location = extractValue(item?.['bf:heldBy']?.['rdfs:label'] || item?.['bf:heldBy'] || '');
      const shelfMark = extractValue(item?.['bf:shelfMark']?.['rdfs:label'] || item?.['bf:shelfMark'] || '');
      if (location || shelfMark) {
        const subs: { code: string; value: string }[] = [];
        if (location) subs.push({ code: 'a', value: location });
        if (shelfMark) subs.push({ code: 'h', value: shelfMark });
        dataFields.push({ tag: '852', ind1: ' ', ind2: ' ', subfields: subs }); propertiesMapped++;
      }
    });
    const electronicLocators = [].concat(instance?.['bf:electronicLocator'] || []);
    electronicLocators.forEach((el: any) => {
      const uri = extractUri(el) || extractValue(el);
      if (uri) { dataFields.push({ tag: '856', ind1: '4', ind2: '0', subfields: [{ code: 'u', value: uri }] }); propertiesMapped++; }
    });

    dataFields.sort((a, b) => a.tag.localeCompare(b.tag));

    return {
      success: true,
      record: { leader, controlFields, dataFields },
      marcxml: formatMarcXml({ leader, controlFields, dataFields }),
      warnings,
      errors,
      engine: 'typescript',
      stats: { fieldsGenerated: controlFields.length + dataFields.length, propertiesMapped, unmappedProperties }
    };
  } catch (error: any) {
    return {
      success: false, record: null, marcxml: '', warnings, errors: [`Conversion failed: ${error.message}`],
      engine: 'typescript', stats: { fieldsGenerated: 0, propertiesMapped: 0, unmappedProperties }
    };
  }
}

// ============================================================================
// OUTPUT FORMATTERS
// ============================================================================

function formatMarcTagged(record: MarcRecord): string {
  const lines: string[] = [`LDR ${record.leader}`];
  record.controlFields.forEach(cf => lines.push(`${cf.tag}    ${cf.value}`));
  record.dataFields.forEach(df => {
    const sfStr = df.subfields.map(sf => `$${sf.code} ${sf.value}`).join(' ');
    lines.push(`${df.tag} ${df.ind1}${df.ind2} ${sfStr}`);
  });
  return lines.join('\n');
}

function formatMarcXml(record: MarcRecord): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<record xmlns="http://www.loc.gov/MARC21/slim">\n  <leader>${esc(record.leader)}</leader>\n`;
  record.controlFields.forEach(cf => { xml += `  <controlfield tag="${cf.tag}">${esc(cf.value)}</controlfield>\n`; });
  record.dataFields.forEach(df => {
    xml += `  <datafield tag="${df.tag}" ind1="${esc(df.ind1)}" ind2="${esc(df.ind2)}">\n`;
    df.subfields.forEach(sf => { xml += `    <subfield code="${sf.code}">${esc(sf.value)}</subfield>\n`; });
    xml += `  </datafield>\n`;
  });
  xml += `</record>`;
  return xml;
}

function formatMarcBreaker(record: MarcRecord): string {
  const lines: string[] = [`=LDR  ${record.leader}`];
  record.controlFields.forEach(cf => lines.push(`=${cf.tag}  ${cf.value}`));
  record.dataFields.forEach(df => {
    const sfStr = df.subfields.map(sf => `\\$${sf.code}${sf.value}`).join('');
    lines.push(`=${df.tag}  ${df.ind1 === ' ' ? '\\' : df.ind1}${df.ind2 === ' ' ? '\\' : df.ind2}${sfStr}`);
  });
  return lines.join('\n');
}

function formatHumanReadable(record: MarcRecord): string {
  const tagNames: Record<string, string> = {
    '001': 'Control Number', '003': 'Control Number ID', '005': 'Date/Time Modified',
    '008': 'Fixed-Length Data', '010': 'LCCN', '020': 'ISBN', '022': 'ISSN',
    '024': 'Other Standard ID', '040': 'Cataloging Source', '041': 'Language Code',
    '050': 'LC Call Number', '082': 'Dewey Classification',
    '100': 'Main Entry: Person', '110': 'Main Entry: Corp. Body', '111': 'Main Entry: Meeting',
    '245': 'Title Statement', '246': 'Variant Title', '250': 'Edition',
    '264': 'Publication Info', '300': 'Physical Description',
    '336': 'Content Type', '337': 'Media Type', '338': 'Carrier Type',
    '490': 'Series Statement', '500': 'General Note', '505': 'Contents', '520': 'Summary',
    '600': 'Subject: Person', '610': 'Subject: Corp. Body', '650': 'Subject: Topical',
    '651': 'Subject: Geographic', '655': 'Genre/Form',
    '700': 'Added Entry: Person', '710': 'Added Entry: Corp. Body',
    '776': 'Additional Phys. Form', '830': 'Series Added Entry',
    '852': 'Location', '856': 'Electronic Access', '884': 'Conversion Info',
  };
  const lines: string[] = [`LEADER: ${record.leader}`, ''];
  record.controlFields.forEach(cf => lines.push(`[${cf.tag}] ${tagNames[cf.tag] || 'Control Field'}: ${cf.value}`));
  lines.push('');
  record.dataFields.forEach(df => {
    const name = tagNames[df.tag] || `Field ${df.tag}`;
    const sfStr = df.subfields.map(sf => `$${sf.code} ${sf.value}`).join('  |  ');
    lines.push(`[${df.tag}] ${name}: ${sfStr}`);
  });
  return lines.join('\n');
}

// ============================================================================
// COMPONENT
// ============================================================================

type OutputFormat = 'human' | 'tagged' | 'marcxml' | 'breaker';
type InputFormat = 'rdfxml' | 'jsonld';

interface Bibframe2MarcProps {
  onBack?: () => void;
}

export default function Bibframe2Marc({ onBack }: Bibframe2MarcProps) {
  const [inputText, setInputText] = useState('');
  const [inputFormat, setInputFormat] = useState<InputFormat>('rdfxml');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('human');
  const [isConverting, setIsConverting] = useState(false);
  const [activeTab, setActiveTab] = useState<'convert' | 'about' | 'mappings'>('convert');
  const [engineState, setEngineState] = useState<EngineState>({ status: 'idle', error: null, version: null, progress: { loaded: 0, total: 16 }, rulesCount: 0 });
  const [useXslt, setUseXslt] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize XSLT engine on mount
  useEffect(() => {
    const engine = getXSLTEngine();
    const unsub = engine.subscribe(setEngineState);
    setEngineState(engine.state);

    if (engine.state.status === 'idle') {
      engine.initialize().catch(() => {
        // Error already handled in engine state
      });
    }

    return unsub;
  }, []);

  const handleConvert = useCallback(() => {
    if (!inputText.trim()) {
      toast.error('Please provide BIBFRAME input');
      return;
    }

    setIsConverting(true);

    try {
      const engine = getXSLTEngine();

      // Try XSLT engine first (for RDF/XML input)
      if (useXslt && engine.isReady && inputFormat === 'rdfxml') {
        const xsltResult = engine.convert(inputText, {
          pConversionAgency: 'MOON',
          pGenerationUri: 'https://github.com/lcnetdev/bibframe2marc',
        });

        if (xsltResult.success) {
          const parsed = parseMarcXml(xsltResult.marcxml);
          setResult({
            success: true,
            record: parsed,
            marcxml: xsltResult.marcxml,
            warnings: [],
            errors: [],
            engine: 'xslt',
            stats: {
              fieldsGenerated: parsed ? parsed.controlFields.length + parsed.dataFields.length : 0,
              propertiesMapped: parsed ? parsed.controlFields.length + parsed.dataFields.length : 0,
              unmappedProperties: [],
            }
          });
          toast.success(`Converted via LC XSLT engine! ${parsed ? parsed.controlFields.length + parsed.dataFields.length : 0} fields generated`);
          setIsConverting(false);
          return;
        } else {
          console.warn('[bibframe2marc] XSLT conversion failed, falling back to TypeScript engine:', xsltResult.error);
          toast.warning(`XSLT engine: ${xsltResult.error}. Falling back to TypeScript engine.`);
        }
      }

      // Fallback: TypeScript engine (for JSON-LD or when XSLT unavailable)
      if (inputFormat === 'jsonld') {
        const parsed = JSON.parse(inputText);
        const convResult = convertBibframeJsonLdToMarc(parsed);
        setResult(convResult);
        if (convResult.success) {
          toast.success(`Converted via TypeScript engine! ${convResult.stats.fieldsGenerated} fields generated`);
        } else {
          toast.error(`Conversion failed: ${convResult.errors.join(', ')}`);
        }
      } else if (inputFormat === 'rdfxml' && !useXslt) {
        // RDF/XML with TypeScript fallback - try to parse as JSON-LD
        toast.warning('TypeScript engine requires JSON-LD input. Please switch to XSLT engine for RDF/XML input, or switch input format to JSON-LD.');
        setResult({
          success: false, record: null, marcxml: '', warnings: [],
          errors: ['TypeScript engine only supports JSON-LD input. Switch to XSLT engine for RDF/XML.'],
          engine: 'typescript', stats: { fieldsGenerated: 0, propertiesMapped: 0, unmappedProperties: [] }
        });
      } else {
        // XSLT not ready but RDF/XML input
        toast.error('XSLT engine is not ready yet. Please wait for initialization or switch to JSON-LD input.');
      }
    } catch (e: any) {
      toast.error(`Error: ${e.message}`);
      setResult({
        success: false, record: null, marcxml: '', warnings: [],
        errors: [`Parse error: ${e.message}`],
        engine: inputFormat === 'rdfxml' ? 'xslt' : 'typescript',
        stats: { fieldsGenerated: 0, propertiesMapped: 0, unmappedProperties: [] }
      });
    } finally {
      setIsConverting(false);
    }
  }, [inputText, inputFormat, useXslt]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setInputText(text);
      // Auto-detect format
      if (text.trim().startsWith('<') || text.trim().startsWith('<?xml')) {
        setInputFormat('rdfxml');
      } else if (text.trim().startsWith('{')) {
        setInputFormat('jsonld');
      }
      toast.success(`Loaded: ${file.name}`);
    };
    reader.readAsText(file);
  }, []);

  const handleExport = useCallback(() => {
    if (!result?.record && !result?.marcxml) return;
    let content = '';
    let ext = 'txt';
    let mimeType = 'text/plain';

    if (result.engine === 'xslt' && result.marcxml && outputFormat === 'marcxml') {
      content = result.marcxml;
      ext = 'xml';
      mimeType = 'application/xml';
    } else if (result.record) {
      switch (outputFormat) {
        case 'marcxml': content = formatMarcXml(result.record); ext = 'xml'; mimeType = 'application/xml'; break;
        case 'tagged': content = formatMarcTagged(result.record); ext = 'mrk'; break;
        case 'breaker': content = formatMarcBreaker(result.record); ext = 'mrk'; break;
        default: content = formatHumanReadable(result.record); break;
      }
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibframe2marc-output-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported MARC record');
  }, [result, outputFormat]);

  const handleCopy = useCallback(() => {
    if (!result?.record && !result?.marcxml) return;
    let content = '';
    if (result.engine === 'xslt' && result.marcxml && outputFormat === 'marcxml') {
      content = result.marcxml;
    } else if (result.record) {
      switch (outputFormat) {
        case 'marcxml': content = formatMarcXml(result.record); break;
        case 'tagged': content = formatMarcTagged(result.record); break;
        case 'breaker': content = formatMarcBreaker(result.record); break;
        default: content = formatHumanReadable(result.record); break;
      }
    }
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  }, [result, outputFormat]);

  const loadSample = useCallback(() => {
    if (inputFormat === 'rdfxml') {
      setInputText(SAMPLE_BIBFRAME_RDFXML);
      toast.success('Sample BIBFRAME RDF/XML record loaded');
    } else {
      const sample = {
        "@context": { "bf": "http://id.loc.gov/ontologies/bibframe/", "rdfs": "http://www.w3.org/2000/01/rdf-schema#", "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#" },
        "work": {
          "@type": "bf:Work", "@id": "http://example.org/work/123",
          "bf:title": { "bf:mainTitle": "Introduction to Linked Data", "bf:subtitle": "A Practical Guide for Librarians" },
          "bf:contribution": [
            { "bf:agent": { "@type": "bf:Person", "rdfs:label": "Smith, John A." }, "bf:role": "Author" },
            { "bf:agent": { "@type": "bf:Person", "rdfs:label": "Johnson, Mary B." }, "bf:role": "Editor" }
          ],
          "bf:language": { "@id": "http://id.loc.gov/vocabulary/languages/eng" },
          "bf:subject": [
            { "@type": "bf:Topic", "rdfs:label": "Linked data", "bf:source": { "bf:code": "lcsh" } },
            { "@type": "bf:Topic", "rdfs:label": "Semantic Web", "bf:source": { "bf:code": "lcsh" } }
          ],
          "bf:summary": { "rdfs:label": "A comprehensive introduction to linked data technologies and their application in library science." },
          "bf:note": { "rdfs:label": "Includes bibliographical references and index." },
          "bf:content": { "rdfs:label": "text" }
        },
        "instance": {
          "@type": "bf:Instance", "@id": "http://example.org/instance/123",
          "bf:identifiedBy": [
            { "@type": "bf:Isbn", "rdf:value": "978-0-8389-1234-5" },
            { "@type": "bf:Lccn", "rdf:value": "2024012345" }
          ],
          "bf:responsibilityStatement": "John A. Smith ; edited by Mary B. Johnson",
          "bf:editionStatement": "Second edition",
          "bf:provisionActivity": {
            "@type": "bf:Publication",
            "bf:place": { "rdfs:label": "Chicago" },
            "bf:agent": { "rdfs:label": "ALA Editions" },
            "bf:date": "2024"
          },
          "bf:extent": { "rdfs:label": "xii, 345 pages" },
          "bf:dimensions": "24 cm",
          "bf:media": { "rdfs:label": "unmediated" },
          "bf:carrier": { "rdfs:label": "volume" }
        }
      };
      setInputText(JSON.stringify(sample, null, 2));
      toast.success('Sample BIBFRAME JSON-LD record loaded');
    }
  }, [inputFormat]);

  const getOutput = (): string => {
    if (!result) return '';
    // For XSLT engine with MARCXML output, show the raw XSLT output
    if (result.engine === 'xslt' && result.marcxml && outputFormat === 'marcxml') {
      return result.marcxml;
    }
    if (!result.record) return result.marcxml || '';
    switch (outputFormat) {
      case 'marcxml': return formatMarcXml(result.record);
      case 'tagged': return formatMarcTagged(result.record);
      case 'breaker': return formatMarcBreaker(result.record);
      default: return formatHumanReadable(result.record);
    }
  };

  const retryInit = useCallback(() => {
    const engine = getXSLTEngine();
    engine.reset();
    engine.initialize().catch(() => {});
  }, []);

  const glassCard = "backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl";
  const glassCardBg = "bg-white/5";

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 30%, #0d1b2a 60%, #0a0a1a 100%)' }}>
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 bg-clip-text text-transparent flex items-center gap-3">
                <GitBranch className="w-7 h-7 text-amber-400" />
                bibframe2marc
              </h1>
              <p className="text-sm text-white/40 mt-1">
                BIBFRAME 2.0 → MARC 21 &bull; Powered by LC's{' '}
                <a href="https://github.com/lcnetdev/bibframe2marc" target="_blank" rel="noopener noreferrer"
                  className="text-amber-400/60 hover:text-amber-400 underline inline-flex items-center gap-1">
                  lcnetdev/bibframe2marc <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            {[
              { key: 'convert' as const, label: 'Convert', icon: Play },
              { key: 'mappings' as const, label: 'Mappings', icon: Table },
              { key: 'about' as const, label: 'About', icon: Info },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* XSLT Engine Status Bar */}
        <div className={`mb-4 px-4 py-2.5 rounded-xl border ${
          engineState.status === 'ready' ? 'bg-emerald-500/5 border-emerald-500/20' :
          engineState.status === 'error' ? 'bg-red-500/5 border-red-500/20' :
          engineState.status === 'fetching' || engineState.status === 'compiling' ? 'bg-amber-500/5 border-amber-500/20' :
          'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {engineState.status === 'ready' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-400">LC XSLT ENGINE READY</span>
                  </div>
                  <span className="text-[10px] text-white/30">|</span>
                  <span className="text-[10px] text-white/40 font-mono">{engineState.version}</span>
                  <span className="text-[10px] text-white/30">|</span>
                  <span className="text-[10px] text-white/40">{engineState.rulesCount} field definitions compiled</span>
                </>
              )}
              {(engineState.status === 'fetching') && (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-xs text-amber-400">Fetching LC rules from GitHub...</span>
                  <span className="text-[10px] text-white/40">{engineState.progress.loaded}/{engineState.progress.total} files</span>
                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400/60 rounded-full transition-all" style={{ width: `${(engineState.progress.loaded / engineState.progress.total) * 100}%` }} />
                  </div>
                </>
              )}
              {engineState.status === 'compiling' && (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                  <span className="text-xs text-violet-400">Compiling XSLT stylesheet in browser...</span>
                </>
              )}
              {engineState.status === 'error' && (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs text-red-400">XSLT engine failed</span>
                  <span className="text-[10px] text-red-300/50 max-w-md truncate">{engineState.error}</span>
                </>
              )}
              {engineState.status === 'idle' && (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-xs text-white/40">XSLT engine not initialized</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {engineState.status === 'error' && (
                <button onClick={retryInit} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all">
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              )}
              {engineState.status === 'ready' && (
                <button
                  onClick={() => setUseXslt(!useXslt)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    useXslt ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-white/5 text-white/40 border border-white/10'
                  }`}
                >
                  {useXslt ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                  {useXslt ? 'XSLT Active' : 'XSLT Off'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className={`${glassCard} ${glassCardBg} p-6 space-y-4`}>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-400" />
              About bibframe2marc
            </h2>
            <div className="prose prose-invert prose-sm max-w-none space-y-3 text-white/70">
              <p>
                This tool uses the <strong className="text-amber-300">actual XSLT rules</strong> from the Library of Congress{' '}
                <a href="https://github.com/lcnetdev/bibframe2marc" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">bibframe2marc</a>{' '}
                project (v3.0.0) to convert BIBFRAME 2.0 RDF/XML descriptions into MARC 21 records.
              </p>
              <div className={`p-4 rounded-xl ${glassCardBg} border border-white/10`}>
                <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  How It Works
                </h3>
                <ol className="space-y-1.5 text-xs">
                  <li><span className="text-cyan-300 font-mono">1.</span> Fetches <code className="text-amber-300">compile.xsl</code> + all 14 XML rule files from <code className="text-white/60">raw.githubusercontent.com/lcnetdev/bibframe2marc</code></li>
                  <li><span className="text-cyan-300 font-mono">2.</span> Merges rule files into a single <code className="text-amber-300">rules.xml</code> document (inlining all <code className="text-white/60">&lt;file&gt;</code> references)</li>
                  <li><span className="text-cyan-300 font-mono">3.</span> Compiles rules using the browser's native <code className="text-amber-300">XSLTProcessor</code> API: <code className="text-white/60">compile.xsl + rules.xml → bibframe2marc.xsl</code></li>
                  <li><span className="text-cyan-300 font-mono">4.</span> Converts BIBFRAME RDF/XML → MARCXML using the compiled stylesheet</li>
                </ol>
              </div>
              <div className={`p-4 rounded-xl ${glassCardBg} border border-white/10`}>
                <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-400" />
                  Engine Architecture
                </h3>
                <ul className="space-y-1 text-xs">
                  <li><strong className="text-emerald-300">Primary Engine (XSLT):</strong> Uses LC's actual XSLT 1.0 rules via browser's native XSLTProcessor. Requires RDF/XML input. Produces byte-accurate MARCXML output identical to the LC tool.</li>
                  <li><strong className="text-amber-300">Fallback Engine (TypeScript):</strong> Built-in TypeScript converter for JSON-LD input. Implements core BIBFRAME→MARC mappings. Used when XSLT is unavailable or for non-RDF/XML input.</li>
                </ul>
              </div>
              <h3 className="text-white font-semibold text-base">Output Formats</h3>
              <ul className="space-y-1">
                <li><strong className="text-green-300">Human-Readable:</strong> Labeled fields with descriptive names</li>
                <li><strong className="text-green-300">MARC Tagged:</strong> Standard MARC tagged display format</li>
                <li><strong className="text-green-300">MARCXML:</strong> MARC 21 XML (LOC schema)</li>
                <li><strong className="text-green-300">MARCBreaker:</strong> MarcEdit-compatible text format</li>
              </ul>
            </div>
          </div>
        )}

        {/* Mappings Tab */}
        {activeTab === 'mappings' && (
          <div className={`${glassCard} ${glassCardBg} p-6 space-y-4`}>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Table className="w-5 h-5 text-amber-400" />
              LC bibframe2marc Rule Files
            </h2>
            <p className="text-xs text-white/40">
              These are the actual XML rule files from <code className="text-amber-300/60">lcnetdev/bibframe2marc</code> v3.0.0 that are fetched, merged, and compiled at runtime.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-amber-300 font-semibold">Rule File</th>
                    <th className="text-left py-2 px-3 text-amber-300 font-semibold">MARC Fields</th>
                    <th className="text-left py-2 px-3 text-amber-300 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="text-white/70">
                  {[
                    ['00-LDR.xml', 'LDR', 'Leader generation from Work/Instance types and AdminMetadata'],
                    ['01-001-008.xml', '001-008', 'Control fields: record ID, fixed-length data elements, 006/007'],
                    ['02-010-048.xml', '010-048', 'Numbers & codes: LCCN, ISBN, ISSN, DOI, language codes, cataloging source'],
                    ['03-050-088.xml', '050-088', 'Classification & call numbers: LC, Dewey, NLM, Government doc'],
                    ['04-1XX.xml', '100-130', 'Main entry: personal names, corporate bodies, meetings, uniform titles'],
                    ['05-2XX.xml', '200-270', 'Title & publication: title statement, edition, imprint, physical description'],
                    ['06-3XX.xml', '300-388', 'Physical description & content types: extent, dimensions, RDA 336/337/338'],
                    ['065-490.xml', '490', 'Series statements'],
                    ['07-5XX.xml', '500-588', 'Notes: general, contents, summary, performer, language, bibliography'],
                    ['08-6XX.xml', '600-662', 'Subject access: personal, corporate, topical, geographic, genre/form'],
                    ['09-7XX.xml', '700-787', 'Added entries & linking: contributors, related works, series'],
                    ['10-8XX.xml', '800-884', 'Series added entries, electronic access, conversion metadata'],
                    ['11-9XX.xml', '9XX', 'Local fields from marcKey data'],
                    ['99-maps.xml', '(maps)', 'Lookup tables: carrier types, content types, languages, countries, etc.'],
                  ].map(([file, tags, desc], i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2 px-3 font-mono text-xs text-cyan-300">{file}</td>
                      <td className="py-2 px-3 font-mono text-xs text-violet-300">{tags}</td>
                      <td className="py-2 px-3 text-xs text-white/60">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Also show the old mapping table */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400/50" />
                TypeScript Fallback Engine Mappings
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 px-3 text-white/40 font-semibold text-xs">Tag</th>
                      <th className="text-left py-2 px-3 text-white/40 font-semibold text-xs">Field</th>
                      <th className="text-left py-2 px-3 text-white/40 font-semibold text-xs">BIBFRAME Property</th>
                      <th className="text-left py-2 px-3 text-white/40 font-semibold text-xs">Source</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/50 text-xs">
                    {[
                      ['LDR', 'Leader', 'bf:Work/@type', 'Work/Instance'],
                      ['001', 'Control Number', '@id', 'Work/Instance'],
                      ['008', 'Fixed-Length Data', 'bf:language, bf:provisionActivity', 'Work/Instance'],
                      ['010', 'LCCN', 'bf:identifiedBy[bf:Lccn]', 'Work/Instance'],
                      ['020', 'ISBN', 'bf:identifiedBy[bf:Isbn]', 'Instance'],
                      ['040', 'Cataloging Source', 'bf:adminMetadata/bf:source', 'Work'],
                      ['050', 'LC Call Number', 'bf:classification[LCC]', 'Work'],
                      ['082', 'Dewey', 'bf:classification[DDC]', 'Work'],
                      ['100', 'Main Entry: Person', 'bf:contribution[0]/bf:agent', 'Work'],
                      ['245', 'Title Statement', 'bf:title/bf:mainTitle', 'Work/Instance'],
                      ['250', 'Edition', 'bf:editionStatement', 'Instance'],
                      ['264', 'Publication', 'bf:provisionActivity', 'Instance'],
                      ['300', 'Physical Desc.', 'bf:extent, bf:dimensions', 'Instance'],
                      ['336-338', 'RDA Types', 'bf:content, bf:media, bf:carrier', 'Work/Instance'],
                      ['500', 'General Note', 'bf:note', 'Work/Instance'],
                      ['520', 'Summary', 'bf:summary', 'Work'],
                      ['6XX', 'Subjects', 'bf:subject', 'Work'],
                      ['7XX', 'Added Entries', 'bf:contribution[1+]', 'Work'],
                      ['856', 'Electronic Access', 'bf:electronicLocator', 'Instance'],
                    ].map(([tag, name, prop, source], i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-1.5 px-3 font-mono text-cyan-300/60">{tag}</td>
                        <td className="py-1.5 px-3 text-white/60">{name}</td>
                        <td className="py-1.5 px-3 font-mono text-violet-300/50">{prop}</td>
                        <td className="py-1.5 px-3">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                            source === 'Work' ? 'bg-blue-500/10 text-blue-300/60' :
                            source === 'Instance' ? 'bg-green-500/10 text-green-300/60' :
                            'bg-amber-500/10 text-amber-300/60'
                          }`}>{source}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Convert Tab */}
        {activeTab === 'convert' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <div className={`${glassCard} ${glassCardBg} flex flex-col`}>
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileInput className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-white">BIBFRAME Input</h2>
                  {/* Input format toggle */}
                  <div className="flex gap-0.5 p-0.5 rounded-lg bg-black/30 border border-white/5 ml-2">
                    <button
                      onClick={() => { setInputFormat('rdfxml'); setInputText(''); setResult(null); }}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                        inputFormat === 'rdfxml' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20' : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      RDF/XML
                    </button>
                    <button
                      onClick={() => { setInputFormat('jsonld'); setInputText(''); setResult(null); }}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                        inputFormat === 'jsonld' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/20' : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      JSON-LD
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={loadSample} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/20 transition-all">
                    <BookOpen className="w-3.5 h-3.5" /> Sample
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all">
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </button>
                  <input ref={fileInputRef} type="file" accept=".xml,.rdf,.jsonld,.json,.ld" onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => { setInputText(''); setResult(null); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/40 hover:text-red-300 hover:bg-red-500/10 border border-white/10 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Engine indicator */}
              <div className="px-4 pt-2">
                <div className="flex items-center gap-2 text-[10px]">
                  {inputFormat === 'rdfxml' && useXslt && engineState.status === 'ready' ? (
                    <span className="flex items-center gap-1 text-emerald-400/70">
                      <Zap className="w-3 h-3" /> Will use LC XSLT engine
                    </span>
                  ) : inputFormat === 'jsonld' ? (
                    <span className="flex items-center gap-1 text-amber-400/70">
                      <Code className="w-3 h-3" /> Will use TypeScript fallback engine
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-white/30">
                      <WifiOff className="w-3 h-3" /> XSLT engine {engineState.status === 'ready' ? 'disabled' : 'loading...'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 pt-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={inputFormat === 'rdfxml'
                    ? `Paste BIBFRAME RDF/XML here...\n\n<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n         xmlns:bf="http://id.loc.gov/ontologies/bibframe/">\n  <bf:Work rdf:about="...">\n    <bf:title>\n      <bf:Title>\n        <bf:mainTitle>My Book</bf:mainTitle>\n      </bf:Title>\n    </bf:title>\n  </bf:Work>\n  <bf:Instance rdf:about="...">\n    ...\n  </bf:Instance>\n</rdf:RDF>`
                    : `Paste BIBFRAME JSON-LD here...\n\n{\n  "work": {\n    "@type": "bf:Work",\n    "bf:title": {\n      "bf:mainTitle": "My Book"\n    }\n  }\n}`
                  }
                  className="w-full h-[400px] bg-black/30 rounded-xl p-4 text-sm font-mono text-white/80 placeholder:text-white/20 border border-white/5 focus:border-amber-500/30 focus:outline-none resize-none"
                  spellCheck={false}
                />
              </div>
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={handleConvert}
                  disabled={isConverting || !inputText.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-amber-500/20"
                >
                  {isConverting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Convert BIBFRAME → MARC 21
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div className={`${glassCard} ${glassCardBg} flex flex-col`}>
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-semibold text-white">MARC 21 Output</h2>
                  {result && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                      result.engine === 'xslt' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {result.engine === 'xslt' ? 'LC XSLT' : 'TS Fallback'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 p-0.5 rounded-lg bg-black/30 border border-white/5">
                    {[
                      { key: 'human' as const, label: 'Readable', icon: Eye },
                      { key: 'tagged' as const, label: 'Tagged', icon: FileText },
                      { key: 'marcxml' as const, label: 'XML', icon: Code },
                      { key: 'breaker' as const, label: 'Breaker', icon: FileCode },
                    ].map(fmt => (
                      <button
                        key={fmt.key}
                        onClick={() => setOutputFormat(fmt.key)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                          outputFormat === fmt.key
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/20'
                            : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        <fmt.icon className="w-3 h-3" />
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                  {(result?.record || result?.marcxml) && (
                    <>
                      <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-all">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/20 transition-all">
                        <Download className="w-3.5 h-3.5" /> Export
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4">
                {result ? (
                  <pre className="w-full h-[400px] overflow-auto bg-black/30 rounded-xl p-4 text-sm font-mono text-white/80 border border-white/5 whitespace-pre-wrap">
                    {getOutput()}
                  </pre>
                ) : (
                  <div className="w-full h-[400px] bg-black/30 rounded-xl border border-white/5 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <ArrowRight className="w-8 h-8 text-white/10 mx-auto" />
                      <p className="text-sm text-white/20">MARC 21 output will appear here</p>
                      <p className="text-xs text-white/10">
                        {inputFormat === 'rdfxml' ? 'Paste BIBFRAME RDF/XML' : 'Paste BIBFRAME JSON-LD'} on the left and click Convert
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              {result && (
                <div className="p-4 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-3">
                    {result.success ? (
                      <span className="flex items-center gap-1.5 text-xs text-green-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Conversion successful
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Conversion failed
                      </span>
                    )}
                    {result.stats.fieldsGenerated > 0 && (
                      <span className="text-xs text-white/40">{result.stats.fieldsGenerated} fields</span>
                    )}
                    {result.engine === 'xslt' && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400/60">
                        <Shield className="w-3 h-3" /> LC XSLT v3.0.0
                      </span>
                    )}
                    {result.warnings.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        {result.warnings.length} warning{result.warnings.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {result.errors.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        {result.errors.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
