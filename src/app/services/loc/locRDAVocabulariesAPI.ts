/**
 * LOC RDA Vocabularies API Service
 * APIs for RDA (Resource Description and Access) controlled vocabularies
 * Content Types, Media Types, Carrier Types, etc.
 */

export interface RDAVocabularyTerm {
  uri: string;
  label: string;
  code?: string;
  definition?: string;
  notation?: string;
}

/**
 * Content Types (MARC 336)
 * API: https://id.loc.gov/vocabulary/contentTypes
 */
export async function searchContentTypes(query: string): Promise<RDAVocabularyTerm[]> {
  return searchRDAVocabulary('contentTypes', query);
}

export async function getAllContentTypes(): Promise<RDAVocabularyTerm[]> {
  return fetchAllRDATerms('contentTypes');
}

/**
 * Media Types (MARC 337)
 * API: https://id.loc.gov/vocabulary/mediaTypes
 */
export async function searchMediaTypes(query: string): Promise<RDAVocabularyTerm[]> {
  return searchRDAVocabulary('mediaTypes', query);
}

export async function getAllMediaTypes(): Promise<RDAVocabularyTerm[]> {
  return fetchAllRDATerms('mediaTypes');
}

/**
 * Carrier Types (MARC 338)
 * API: https://id.loc.gov/vocabulary/carriers
 */
export async function searchCarrierTypes(query: string): Promise<RDAVocabularyTerm[]> {
  return searchRDAVocabulary('carriers', query);
}

export async function getAllCarrierTypes(): Promise<RDAVocabularyTerm[]> {
  return fetchAllRDATerms('carriers');
}

/**
 * Issuance Types (Leader/07)
 * API: https://id.loc.gov/vocabulary/issuance
 */
export async function getAllIssuanceTypes(): Promise<RDAVocabularyTerm[]> {
  return fetchAllRDATerms('issuance');
}

/**
 * Illustrative Content
 * API: https://id.loc.gov/vocabulary/millus
 */
export async function getAllIllustrativeContent(): Promise<RDAVocabularyTerm[]> {
  return fetchAllRDATerms('millus');
}

/**
 * Generic RDA vocabulary search
 */
async function searchRDAVocabulary(vocabulary: string, query: string): Promise<RDAVocabularyTerm[]> {
  if (!query || query.trim().length < 1) {
    return getAllRDATerms(vocabulary);
  }

  try {
    const baseUrl = `https://id.loc.gov/vocabulary/${vocabulary}`;
    const searchUrl = `${baseUrl}/suggest2/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.warn(`RDA ${vocabulary} API error: ${response.status}`);
      return getAllRDATerms(vocabulary);
    }

    const data = await response.json();
    
    if (!data || !data.hits) {
      return [];
    }

    return data.hits.map((hit: any) => ({
      uri: hit.uri || `${baseUrl}/${hit.token}`,
      label: hit.aLabel || hit.suggestLabel || hit.token,
      code: hit.token,
      notation: hit.token,
      definition: hit.definition
    }));
  } catch (error) {
    console.error(`Error searching RDA ${vocabulary}:`, error);
    return getAllRDATerms(vocabulary);
  }
}

/**
 * Fetch all terms for a vocabulary
 */
async function fetchAllRDATerms(vocabulary: string): Promise<RDAVocabularyTerm[]> {
  // Return cached/predefined terms
  switch (vocabulary) {
    case 'contentTypes':
      return CONTENT_TYPES;
    case 'mediaTypes':
      return MEDIA_TYPES;
    case 'carriers':
      return CARRIER_TYPES;
    case 'issuance':
      return ISSUANCE_TYPES;
    case 'millus':
      return ILLUSTRATIVE_CONTENT;
    default:
      return [];
  }
}

/**
 * Get all terms (alias)
 */
function getAllRDATerms(vocabulary: string): RDAVocabularyTerm[] {
  return fetchAllRDATerms(vocabulary);
}

// ============================================================================
// PREDEFINED RDA VOCABULARIES
// ============================================================================

/**
 * Content Types (MARC 336)
 * Source: https://id.loc.gov/vocabulary/contentTypes
 */
export const CONTENT_TYPES: RDAVocabularyTerm[] = [
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/txt', label: 'text', code: 'txt', notation: 'txt' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/cri', label: 'cartographic image', code: 'cri', notation: 'cri' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/crd', label: 'cartographic dataset', code: 'crd', notation: 'crd' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/crm', label: 'cartographic moving image', code: 'crm', notation: 'crm' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/crt', label: 'cartographic tactile image', code: 'crt', notation: 'crt' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/spw', label: 'spoken word', code: 'spw', notation: 'spw' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/prm', label: 'performed music', code: 'prm', notation: 'prm' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/snd', label: 'sounds', code: 'snd', notation: 'snd' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/ntm', label: 'notated music', code: 'ntm', notation: 'ntm' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/ntv', label: 'notated movement', code: 'ntv', notation: 'ntv' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/sti', label: 'still image', code: 'sti', notation: 'sti' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/tdi', label: 'two-dimensional moving image', code: 'tdi', notation: 'tdi' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/tdm', label: 'three-dimensional moving image', code: 'tdm', notation: 'tdm' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/tdf', label: 'three-dimensional form', code: 'tdf', notation: 'tdf' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/tcm', label: 'tactile three-dimensional form', code: 'tcm', notation: 'tcm' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/tcn', label: 'tactile notated music', code: 'tcn', notation: 'tcn' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/tct', label: 'tactile text', code: 'tct', notation: 'tct' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/tcf', label: 'tactile notated movement', code: 'tcf', notation: 'tcf' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/tci', label: 'tactile image', code: 'tci', notation: 'tci' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/cod', label: 'computer dataset', code: 'cod', notation: 'cod' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/cop', label: 'computer program', code: 'cop', notation: 'cop' },
];

/**
 * Media Types (MARC 337)
 * Source: https://id.loc.gov/vocabulary/mediaTypes
 */
export const MEDIA_TYPES: RDAVocabularyTerm[] = [
  { uri: 'http://id.loc.gov/vocabulary/mediaTypes/n', label: 'unmediated', code: 'n', notation: 'n' },
  { uri: 'http://id.loc.gov/vocabulary/mediaTypes/s', label: 'audio', code: 's', notation: 's' },
  { uri: 'http://id.loc.gov/vocabulary/mediaTypes/c', label: 'computer', code: 'c', notation: 'c' },
  { uri: 'http://id.loc.gov/vocabulary/mediaTypes/h', label: 'microform', code: 'h', notation: 'h' },
  { uri: 'http://id.loc.gov/vocabulary/mediaTypes/p', label: 'microscopic', code: 'p', notation: 'p' },
  { uri: 'http://id.loc.gov/vocabulary/mediaTypes/g', label: 'projected', code: 'g', notation: 'g' },
  { uri: 'http://id.loc.gov/vocabulary/mediaTypes/e', label: 'stereographic', code: 'e', notation: 'e' },
  { uri: 'http://id.loc.gov/vocabulary/mediaTypes/v', label: 'video', code: 'v', notation: 'v' },
  { uri: 'http://id.loc.gov/vocabulary/mediaTypes/x', label: 'other', code: 'x', notation: 'x' },
  { uri: 'http://id.loc.gov/vocabulary/mediaTypes/z', label: 'unspecified', code: 'z', notation: 'z' },
];

/**
 * Carrier Types (MARC 338)
 * Source: https://id.loc.gov/vocabulary/carriers
 */
export const CARRIER_TYPES: RDAVocabularyTerm[] = [
  { uri: 'http://id.loc.gov/vocabulary/carriers/nc', label: 'volume', code: 'nc', notation: 'nc' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/nb', label: 'sheet', code: 'nb', notation: 'nb' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/no', label: 'card', code: 'no', notation: 'no' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/nr', label: 'object', code: 'nr', notation: 'nr' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/sd', label: 'audio disc', code: 'sd', notation: 'sd' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/ss', label: 'audiocassette', code: 'ss', notation: 'ss' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/st', label: 'audio cartridge', code: 'st', notation: 'st' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/se', label: 'audio cylinder', code: 'se', notation: 'se' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/sg', label: 'audio roll', code: 'sg', notation: 'sg' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/sw', label: 'audio wire reel', code: 'sw', notation: 'sw' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/sq', label: 'audio roll', code: 'sq', notation: 'sq' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/cr', label: 'online resource', code: 'cr', notation: 'cr' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/cd', label: 'computer disc', code: 'cd', notation: 'cd' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/ce', label: 'computer disc cartridge', code: 'ce', notation: 'ce' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/ca', label: 'computer tape cartridge', code: 'ca', notation: 'ca' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/cb', label: 'computer chip cartridge', code: 'cb', notation: 'cb' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/ck', label: 'computer card', code: 'ck', notation: 'ck' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/he', label: 'microfiche', code: 'he', notation: 'he' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/hd', label: 'microfilm cartridge', code: 'hd', notation: 'hd' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/hf', label: 'microfiche cassette', code: 'hf', notation: 'hf' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/hj', label: 'microfilm roll', code: 'hj', notation: 'hj' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/vd', label: 'videodisc', code: 'vd', notation: 'vd' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/vf', label: 'videocassette', code: 'vf', notation: 'vf' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/vc', label: 'video cartridge', code: 'vc', notation: 'vc' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/vr', label: 'videotape reel', code: 'vr', notation: 'vr' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/gs', label: 'slide', code: 'gs', notation: 'gs' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/gc', label: 'filmstrip cartridge', code: 'gc', notation: 'gc' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/gd', label: 'filmslip', code: 'gd', notation: 'gd' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/gf', label: 'filmstrip', code: 'gf', notation: 'gf' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/gt', label: 'overhead transparency', code: 'gt', notation: 'gt' },
];

/**
 * Issuance Types (Leader/07)
 * Source: https://id.loc.gov/vocabulary/issuance
 */
export const ISSUANCE_TYPES: RDAVocabularyTerm[] = [
  { uri: 'http://id.loc.gov/vocabulary/issuance/mono', label: 'single unit', code: 'mono', notation: 'm' },
  { uri: 'http://id.loc.gov/vocabulary/issuance/serl', label: 'serial', code: 'serl', notation: 's' },
  { uri: 'http://id.loc.gov/vocabulary/issuance/intg', label: 'integrating resource', code: 'intg', notation: 'i' },
  { uri: 'http://id.loc.gov/vocabulary/issuance/mulm', label: 'multipart monograph', code: 'mulm', notation: 'm' },
];

/**
 * Illustrative Content (MARC 300$b / 008/18-21)
 * Source: https://id.loc.gov/vocabulary/millus
 */
export const ILLUSTRATIVE_CONTENT: RDAVocabularyTerm[] = [
  { uri: 'http://id.loc.gov/vocabulary/millus/ill', label: 'Illustrations', code: 'ill', notation: 'a' },
  { uri: 'http://id.loc.gov/vocabulary/millus/map', label: 'Maps', code: 'map', notation: 'b' },
  { uri: 'http://id.loc.gov/vocabulary/millus/por', label: 'Portraits', code: 'por', notation: 'c' },
  { uri: 'http://id.loc.gov/vocabulary/millus/chr', label: 'Charts', code: 'chr', notation: 'd' },
  { uri: 'http://id.loc.gov/vocabulary/millus/pln', label: 'Plans', code: 'pln', notation: 'e' },
  { uri: 'http://id.loc.gov/vocabulary/millus/plt', label: 'Plates', code: 'plt', notation: 'f' },
  { uri: 'http://id.loc.gov/vocabulary/millus/mus', label: 'Music', code: 'mus', notation: 'g' },
  { uri: 'http://id.loc.gov/vocabulary/millus/fac', label: 'Facsimiles', code: 'fac', notation: 'h' },
  { uri: 'http://id.loc.gov/vocabulary/millus/coa', label: 'Coats of arms', code: 'coa', notation: 'i' },
  { uri: 'http://id.loc.gov/vocabulary/millus/gen', label: 'Genealogical tables', code: 'gen', notation: 'j' },
  { uri: 'http://id.loc.gov/vocabulary/millus/frm', label: 'Forms', code: 'frm', notation: 'k' },
  { uri: 'http://id.loc.gov/vocabulary/millus/sam', label: 'Samples', code: 'sam', notation: 'l' },
  { uri: 'http://id.loc.gov/vocabulary/millus/pho', label: 'Photographs', code: 'pho', notation: 'o' },
  { uri: 'http://id.loc.gov/vocabulary/millus/ilm', label: 'Illuminations', code: 'ilm', notation: 'p' },
];

/**
 * Supplementary Content
 */
export const SUPPLEMENTARY_CONTENT = [
  { value: 'index', label: 'Index', marc: '500/504' },
  { value: 'bibliography', label: 'Bibliography', marc: '504' },
  { value: 'discography', label: 'Discography', marc: '504' },
  { value: 'filmography', label: 'Filmography', marc: '504' },
  { value: 'appendix', label: 'Appendix', marc: '500' },
  { value: 'glossary', label: 'Glossary', marc: '500' },
];
