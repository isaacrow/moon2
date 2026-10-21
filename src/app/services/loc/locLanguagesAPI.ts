/**
 * LOC Languages API Service
 * API: https://id.loc.gov/vocabulary/languages
 * Used for: Language of content (MARC 008/35-37, 041)
 * Based on ISO 639-2 language codes
 */

export interface LanguageTerm {
  uri: string;
  label: string;
  code: string;
  iso6391?: string; // ISO 639-1 two-letter code
  iso6392?: string; // ISO 639-2 three-letter code
}

const BASE_URL = 'https://id.loc.gov/vocabulary/languages';

/**
 * Search languages
 */
export async function searchLanguages(query: string): Promise<LanguageTerm[]> {
  if (!query || query.trim().length < 2) {
    return getCommonLanguages();
  }

  try {
    const searchUrl = `${BASE_URL}/suggest2/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.warn(`Languages API error: ${response.status}`);
      return filterLanguages(query);
    }

    const data = await response.json();
    
    if (!data || !data.hits) {
      return filterLanguages(query);
    }

    return data.hits.map((hit: any) => ({
      uri: hit.uri || `${BASE_URL}/${hit.token}`,
      label: hit.aLabel || hit.suggestLabel || hit.token,
      code: hit.token,
      iso6392: hit.token
    }));
  } catch (error) {
    console.error('Error searching languages:', error);
    return filterLanguages(query);
  }
}

/**
 * Get common languages
 */
export function getCommonLanguages(): LanguageTerm[] {
  return COMMON_LANGUAGES;
}

/**
 * Filter languages by query
 */
function filterLanguages(query: string): LanguageTerm[] {
  const lowerQuery = query.toLowerCase();
  return COMMON_LANGUAGES.filter(lang =>
    lang.label.toLowerCase().includes(lowerQuery) ||
    lang.code.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get language by code
 */
export function getLanguageByCode(code: string): LanguageTerm | undefined {
  return COMMON_LANGUAGES.find(lang => 
    lang.code === code || lang.iso6391 === code || lang.iso6392 === code
  );
}

/**
 * Common languages for quick access
 * Source: https://id.loc.gov/vocabulary/languages
 */
export const COMMON_LANGUAGES: LanguageTerm[] = [
  { uri: `${BASE_URL}/eng`, label: 'English', code: 'eng', iso6391: 'en', iso6392: 'eng' },
  { uri: `${BASE_URL}/ara`, label: 'Arabic', code: 'ara', iso6391: 'ar', iso6392: 'ara' },
  { uri: `${BASE_URL}/spa`, label: 'Spanish', code: 'spa', iso6391: 'es', iso6392: 'spa' },
  { uri: `${BASE_URL}/fre`, label: 'French', code: 'fre', iso6391: 'fr', iso6392: 'fre' },
  { uri: `${BASE_URL}/ger`, label: 'German', code: 'ger', iso6391: 'de', iso6392: 'ger' },
  { uri: `${BASE_URL}/ita`, label: 'Italian', code: 'ita', iso6391: 'it', iso6392: 'ita' },
  { uri: `${BASE_URL}/por`, label: 'Portuguese', code: 'por', iso6391: 'pt', iso6392: 'por' },
  { uri: `${BASE_URL}/rus`, label: 'Russian', code: 'rus', iso6391: 'ru', iso6392: 'rus' },
  { uri: `${BASE_URL}/chi`, label: 'Chinese', code: 'chi', iso6391: 'zh', iso6392: 'chi' },
  { uri: `${BASE_URL}/jpn`, label: 'Japanese', code: 'jpn', iso6391: 'ja', iso6392: 'jpn' },
  { uri: `${BASE_URL}/kor`, label: 'Korean', code: 'kor', iso6391: 'ko', iso6392: 'kor' },
  { uri: `${BASE_URL}/hin`, label: 'Hindi', code: 'hin', iso6391: 'hi', iso6392: 'hin' },
  { uri: `${BASE_URL}/ben`, label: 'Bengali', code: 'ben', iso6391: 'bn', iso6392: 'ben' },
  { uri: `${BASE_URL}/urd`, label: 'Urdu', code: 'urd', iso6391: 'ur', iso6392: 'urd' },
  { uri: `${BASE_URL}/per`, label: 'Persian', code: 'per', iso6391: 'fa', iso6392: 'per' },
  { uri: `${BASE_URL}/tur`, label: 'Turkish', code: 'tur', iso6391: 'tr', iso6392: 'tur' },
  { uri: `${BASE_URL}/heb`, label: 'Hebrew', code: 'heb', iso6391: 'he', iso6392: 'heb' },
  { uri: `${BASE_URL}/dut`, label: 'Dutch', code: 'dut', iso6391: 'nl', iso6392: 'dut' },
  { uri: `${BASE_URL}/gre`, label: 'Greek, Modern (1453-)', code: 'gre', iso6391: 'el', iso6392: 'gre' },
  { uri: `${BASE_URL}/pol`, label: 'Polish', code: 'pol', iso6391: 'pl', iso6392: 'pol' },
  { uri: `${BASE_URL}/swe`, label: 'Swedish', code: 'swe', iso6391: 'sv', iso6392: 'swe' },
  { uri: `${BASE_URL}/dan`, label: 'Danish', code: 'dan', iso6391: 'da', iso6392: 'dan' },
  { uri: `${BASE_URL}/nor`, label: 'Norwegian', code: 'nor', iso6391: 'no', iso6392: 'nor' },
  { uri: `${BASE_URL}/fin`, label: 'Finnish', code: 'fin', iso6391: 'fi', iso6392: 'fin' },
  { uri: `${BASE_URL}/cze`, label: 'Czech', code: 'cze', iso6391: 'cs', iso6392: 'cze' },
  { uri: `${BASE_URL}/hun`, label: 'Hungarian', code: 'hun', iso6391: 'hu', iso6392: 'hun' },
  { uri: `${BASE_URL}/rum`, label: 'Romanian', code: 'rum', iso6391: 'ro', iso6392: 'rum' },
  { uri: `${BASE_URL}/ukr`, label: 'Ukrainian', code: 'ukr', iso6391: 'uk', iso6392: 'ukr' },
  { uri: `${BASE_URL}/tha`, label: 'Thai', code: 'tha', iso6391: 'th', iso6392: 'tha' },
  { uri: `${BASE_URL}/vie`, label: 'Vietnamese', code: 'vie', iso6391: 'vi', iso6392: 'vie' },
  { uri: `${BASE_URL}/ind`, label: 'Indonesian', code: 'ind', iso6391: 'id', iso6392: 'ind' },
  { uri: `${BASE_URL}/may`, label: 'Malay', code: 'may', iso6391: 'ms', iso6392: 'may' },
  { uri: `${BASE_URL}/swa`, label: 'Swahili', code: 'swa', iso6391: 'sw', iso6392: 'swa' },
  { uri: `${BASE_URL}/afr`, label: 'Afrikaans', code: 'afr', iso6391: 'af', iso6392: 'afr' },
  { uri: `${BASE_URL}/lat`, label: 'Latin', code: 'lat', iso6391: 'la', iso6392: 'lat' },
  { uri: `${BASE_URL}/grc`, label: 'Greek, Ancient (to 1453)', code: 'grc', iso6392: 'grc' },
  { uri: `${BASE_URL}/san`, label: 'Sanskrit', code: 'san', iso6391: 'sa', iso6392: 'san' },
  { uri: `${BASE_URL}/mul`, label: 'Multiple languages', code: 'mul', iso6392: 'mul' },
  { uri: `${BASE_URL}/und`, label: 'Undetermined', code: 'und', iso6392: 'und' },
  { uri: `${BASE_URL}/zxx`, label: 'No linguistic content', code: 'zxx', iso6392: 'zxx' },
];
