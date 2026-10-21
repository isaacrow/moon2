/**
 * MARC Generator Service
 * Generates complete MARC21 records from BIBFRAME data
 * Handles deep nested properties and edge cases
 */

export function generateMARC(work: any, instance: any): string {
  const fields: string[] = [];

  // --- Helper to add fields safely ---
  const addField = (tag: string, ind1: string, ind2: string, subfields: [string, string][]) => {
    const validSubfields = subfields.filter(([_, val]) => val && val.trim() !== '');
    if (validSubfields.length > 0) {
      const subfieldString = validSubfields.map(([code, val]) => `$${code}${val}`).join('');
      fields.push(`=${tag}  ${ind1}${ind2}${subfieldString}`);
    }
  };

  // --- Helper to extract title safely ---
  const extractTitle = (titleNode: any): { main: string, subtitle: string } => {
    if (!titleNode) return { main: '', subtitle: '' };
    
    // Handle array format
    if (Array.isArray(titleNode)) {
      titleNode = titleNode[0];
    }
    
    return {
      main: titleNode['bf:mainTitle'] || '',
      subtitle: titleNode['bf:subtitle'] || ''
    };
  };

  // --- Helper to extract label safely ---
  const extractLabel = (node: any): string => {
    if (!node) return '';
    if (typeof node === 'string') return node;
    return node['rdfs:label'] || node['rdf:value'] || '';
  };

  // --- LDR: Leader ---
  fields.push('=LDR  00000nam a2200000 i 4500');

  // --- 001: Control Number ---
  if (instance?.['@id']) {
    const controlNumber = instance['@id'].split('/').pop() || instance['@id'];
    fields.push(`=001  ${controlNumber}`);
  }

  // --- 008: Fixed Length Data (Auto-generated basic) ---
  const date = new Date().toISOString().slice(2, 8).replace(/-/g, ''); // YYMMDD
  const pubDate = instance?.['bf:provisionActivity']?.[0]?.['bf:date'] || '2024';
  
  // Extract language code safely (handle both string URIs and objects)
  let lang = 'eng';
  const languageField = work?.['bf:language'];
  if (languageField) {
    if (typeof languageField === 'string') {
      // If it's a string URI like "http://id.loc.gov/vocabulary/languages/ara"
      lang = languageField.split('/').pop() || 'eng';
    } else if (typeof languageField === 'object' && languageField['@id']) {
      // If it's an object with @id
      lang = languageField['@id'].split('/').pop() || 'eng';
    }
  }
  
  fields.push(`=008  ${date}s${pubDate}    ir      o     000 0 ${lang} d`);

  // --- 020: ISBN ---
  const identifiers = Array.isArray(instance?.['bf:identifiedBy']) 
    ? instance['bf:identifiedBy'] 
    : instance?.['bf:identifiedBy'] ? [instance['bf:identifiedBy']] : [];
  
  const isbn = identifiers.find((id: any) => 
    id?.['@type'] === 'bf:Isbn' || id?.['@type']?.includes('Isbn')
  );
  
  if (isbn) {
    const isbnValue = extractLabel(isbn);
    if (isbnValue) addField('020', ' ', ' ', [['a', isbnValue]]);
  }

  // --- 040: Cataloging Source ---
  addField('040', ' ', ' ', [
    ['a', 'MOON'],
    ['b', 'eng'],
    ['c', 'MOON'],
    ['e', 'rda']
  ]);

  // --- 100: Main Entry (Author) ---
  const contributions = Array.isArray(work?.['bf:contribution']) 
    ? work['bf:contribution'] 
    : work?.['bf:contribution'] ? [work['bf:contribution']] : [];
  
  const primaryContrib = contributions[0];
  if (primaryContrib) {
    const agent = primaryContrib['bf:agent'];
    const name = extractLabel(agent);
    if (name) {
      addField('100', '1', ' ', [
        ['a', name],
        ['e', 'author']
      ]);
    }
  }

  // --- 245: Title Statement ---
  const { main: mainTitle, subtitle } = extractTitle(work?.['bf:title']);
  const responsibilityStatement = instance?.['bf:responsibilityStatement'] || '';
  
  if (mainTitle) {
    const subfields: [string, string][] = [['a', mainTitle]];
    if (subtitle) subfields.push(['b', subtitle]);
    if (responsibilityStatement) subfields.push(['c', responsibilityStatement]);
    addField('245', '1', '0', subfields);
  }

  // --- 250: Edition Statement ---
  const edition = instance?.['bf:editionStatement'];
  if (edition) {
    const editionValue = extractLabel(edition);
    if (editionValue) addField('250', ' ', ' ', [['a', editionValue]]);
  }

  // --- 264: Production/Publication/Distribution/Manufacture ---
  const provisionActivities = Array.isArray(instance?.['bf:provisionActivity']) 
    ? instance['bf:provisionActivity'] 
    : instance?.['bf:provisionActivity'] ? [instance['bf:provisionActivity']] : [];
  
  provisionActivities.forEach((provision: any) => {
    const place = extractLabel(provision?.['bf:place']);
    const agent = extractLabel(provision?.['bf:agent']);
    const date = provision?.['bf:date'] || '';
    
    // Determine indicator 2 based on type
    let ind2 = '1'; // Default to publication
    if (provision?.['@type'] === 'bf:Distribution') ind2 = '2';
    if (provision?.['@type'] === 'bf:Manufacture') ind2 = '3';
    if (provision?.['@type'] === 'bf:Production') ind2 = '0';
    
    const subfields: [string, string][] = [];
    if (place) subfields.push(['a', place]);
    if (agent) subfields.push(['b', agent]);
    if (date) subfields.push(['c', date]);
    
    if (subfields.length > 0) {
      addField('264', ' ', ind2, subfields);
    }
  });

  // --- 300: Physical Description ---
  const extent = extractLabel(instance?.['bf:extent']);
  const dimensions = extractLabel(instance?.['bf:dimensions']);
  const illustrations = extractLabel(instance?.['bf:illustrativeContent']);
  
  const physicalSubfields: [string, string][] = [];
  if (extent) physicalSubfields.push(['a', extent]);
  if (illustrations) physicalSubfields.push(['b', illustrations]);
  if (dimensions) physicalSubfields.push(['c', dimensions]);
  
  if (physicalSubfields.length > 0) {
    addField('300', ' ', ' ', physicalSubfields);
  }

  // --- 336/337/338: RDA Content/Media/Carrier Types ---
  addField('336', ' ', ' ', [['a', 'text'], ['b', 'txt'], ['2', 'rdacontent']]);
  addField('337', ' ', ' ', [['a', 'unmediated'], ['b', 'n'], ['2', 'rdamedia']]);
  addField('338', ' ', ' ', [['a', 'volume'], ['b', 'nc'], ['2', 'rdacarrier']]);

  // --- 490: Series Statement ---
  const seriesStatement = instance?.['bf:seriesStatement'];
  if (seriesStatement) {
    const seriesValue = extractLabel(seriesStatement);
    if (seriesValue) addField('490', '0', ' ', [['a', seriesValue]]);
  }

  // --- 500: General Notes ---
  const notes = Array.isArray(instance?.['bf:note']) 
    ? instance['bf:note'] 
    : instance?.['bf:note'] ? [instance['bf:note']] : [];
  
  notes.forEach((note: any) => {
    const noteValue = extractLabel(note);
    if (noteValue) addField('500', ' ', ' ', [['a', noteValue]]);
  });

  // --- 520: Summary/Abstract ---
  const summaries = Array.isArray(work?.['bf:summary']) 
    ? work['bf:summary'] 
    : work?.['bf:summary'] ? [work['bf:summary']] : [];
  
  summaries.forEach((summary: any) => {
    const summaryValue = extractLabel(summary);
    if (summaryValue) addField('520', ' ', ' ', [['a', summaryValue]]);
  });

  // --- 546: Language Note ---
  const language = work?.['bf:language'];
  if (language) {
    const langLabel = extractLabel(language);
    if (langLabel) addField('546', ' ', ' ', [['a', langLabel]]);
  }

  // --- 600/610/611: Subject Added Entry - Personal/Corporate/Meeting Names ---
  const subjects = Array.isArray(work?.['bf:subject']) 
    ? work['bf:subject'] 
    : work?.['bf:subject'] ? [work['bf:subject']] : [];
  
  subjects.forEach((subj: any) => {
    const label = extractLabel(subj);
    if (!label) return;
    
    const type = subj?.['@type'];
    if (type === 'bf:Person' || type?.includes('Person')) {
      addField('600', '1', '0', [['a', label]]);
    } else if (type === 'bf:Organization' || type?.includes('Organization')) {
      addField('610', '2', '0', [['a', label]]);
    } else if (type === 'bf:Meeting' || type?.includes('Meeting')) {
      addField('611', '2', '0', [['a', label]]);
    } else if (type === 'bf:Topic' || type?.includes('Topic')) {
      addField('650', ' ', '0', [['a', label]]);
    } else if (type === 'bf:Place' || type?.includes('Place')) {
      addField('651', ' ', '0', [['a', label]]);
    } else if (type === 'bf:Temporal' || type?.includes('Temporal')) {
      addField('648', ' ', '0', [['a', label]]);
    } else {
      // Default to topical term
      addField('650', ' ', '0', [['a', label]]);
    }
  });

  // --- 655: Index Term - Genre/Form ---
  const genres = Array.isArray(work?.['bf:genreForm']) 
    ? work['bf:genreForm'] 
    : work?.['bf:genreForm'] ? [work['bf:genreForm']] : [];
  
  genres.forEach((genre: any) => {
    const genreValue = extractLabel(genre);
    if (genreValue) addField('655', ' ', '7', [['a', genreValue], ['2', 'lcgft']]);
  });

  // --- 700: Added Entry - Personal Name (Other Contributors) ---
  const otherContribs = contributions.slice(1);
  otherContribs.forEach((contrib: any) => {
    const agent = contrib?.['bf:agent'];
    const name = extractLabel(agent);
    const role = contrib?.['bf:role'];
    const roleLabel = extractLabel(role) || 'contributor';
    
    if (name) {
      addField('700', '1', ' ', [
        ['a', name],
        ['e', roleLabel]
      ]);
    }
  });

  // --- 710: Added Entry - Corporate Name ---
  const corporateContribs = contributions.filter((c: any) => 
    c?.['bf:agent']?.['@type'] === 'bf:Organization' || 
    c?.['bf:agent']?.['@type']?.includes('Organization')
  );
  
  corporateContribs.forEach((contrib: any) => {
    const agent = contrib?.['bf:agent'];
    const name = extractLabel(agent);
    const role = contrib?.['bf:role'];
    const roleLabel = extractLabel(role) || 'contributor';
    
    if (name) {
      addField('710', '2', ' ', [
        ['a', name],
        ['e', roleLabel]
      ]);
    }
  });

  // --- 856: Electronic Location and Access ---
  const electronicLocators = Array.isArray(instance?.['bf:electronicLocator']) 
    ? instance['bf:electronicLocator'] 
    : instance?.['bf:electronicLocator'] ? [instance['bf:electronicLocator']] : [];
  
  electronicLocators.forEach((locator: any) => {
    const uri = locator?.['@id'] || extractLabel(locator);
    if (uri) addField('856', '4', '0', [['u', uri]]);
  });

  // --- 880: Alternate Graphic Representation (for Arabic/multilingual) ---
  // Handle alternate titles in different scripts
  const alternateTitles = Array.isArray(work?.['bf:title']) 
    ? work['bf:title'].slice(1) 
    : [];
  
  alternateTitles.forEach((altTitle: any, index: number) => {
    const { main: altMain } = extractTitle(altTitle);
    if (altMain) {
      // Link to 245 field
      addField('880', '1', '0', [
        ['6', `245-${index + 1}`],
        ['a', altMain]
      ]);
    }
  });

  return fields.join('\n');
}

/**
 * Download MARC record as .mrc file
 */
export function downloadMARCFile(work: any, instance: any, filename: string = 'record.mrc') {
  const marcString = generateMARC(work, instance);
  const blob = new Blob([marcString], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Validate MARC record completeness
 */
export function validateMARC(work: any, instance: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!work?.['bf:title']?.['bf:mainTitle'] && !Array.isArray(work?.['bf:title'])) {
    errors.push('Missing title (245 field)');
  }
  
  if (!work?.['bf:contribution']?.[0]) {
    errors.push('Missing main entry/creator (100 field)');
  }
  
  if (!instance?.['bf:provisionActivity']?.[0]) {
    errors.push('Missing publication information (264 field)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Alias export for compatibility
 */
export const generateMARCFromBibframe = generateMARC;
