/**
 * Authority Search Service
 * Integrates with LOC, VIAF, and Wikidata APIs
 * Provides unified authority search for cataloging
 */

export interface AuthorityResult {
  label: string;
  uri: string;
  source: 'LOC' | 'VIAF' | 'Wikidata' | 'Local';
  type?: string;
  description?: string;
}

/**
 * Search LOC Authorities
 */
export async function searchLOCAuthorities(
  query: string,
  scheme: 'names' | 'subjects' | 'genreForms' | 'geographicAreas' | 'languages' | 'countries'
): Promise<AuthorityResult[]> {
  if (!query || query.length < 2) return [];

  try {
    const schemeMap: Record<string, string> = {
      names: 'http://id.loc.gov/authorities/names',
      subjects: 'http://id.loc.gov/authorities/subjects',
      genreForms: 'http://id.loc.gov/authorities/genreForms',
      geographicAreas: 'http://id.loc.gov/vocabulary/geographicAreas',
      languages: 'http://id.loc.gov/vocabulary/languages',
      countries: 'http://id.loc.gov/vocabulary/countries'
    };

    const baseUrl = 'https://id.loc.gov/search/';
    const params = new URLSearchParams({
      q: `${query} cs:${schemeMap[scheme]}`,
      format: 'json'
    });

    const response = await fetch(`${baseUrl}?${params}`);
    if (!response.ok) throw new Error('LOC API error');

    const data = await response.json();
    
    // LOC search API may return items without URI — filter them out
    return (Array.isArray(data) ? data : []).map((item: any) => ({
      label: item.label || item.prefLabel || item.title || '',
      uri: item.uri || item['@id'] || '',
      source: 'LOC' as const,
      type: item.type,
      description: item.scopeNote
    })).filter((r: AuthorityResult) => r.label && r.uri);
  } catch (error) {
    console.error('LOC search error:', error);
    return [];
  }
}

/**
 * Search VIAF for persons and organizations
 */
export async function searchVIAF(query: string): Promise<AuthorityResult[]> {
  if (!query || query.length < 2) return [];

  try {
    // Use viaf.org (without www) — the AutoSuggest endpoint supports CORS
    const url = `https://viaf.org/viaf/AutoSuggest?query=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error('VIAF API error');

    const data = await response.json();
    
    return (data.result || []).map((item: any) => ({
      label: item.term || item.displayForm || 'Unknown',
      uri: `https://viaf.org/viaf/${item.viafid || item.recordID || ''}`,
      source: 'VIAF' as const,
      type: item.nametype === 'corporate' ? 'Organization' : 'Person',
      description: item.displayForm || ''
    })).filter((r: AuthorityResult) => r.uri && !r.uri.endsWith('/'));
  } catch (error) {
    console.error('VIAF search error:', error);
    return [];
  }
}

/**
 * Search Wikidata
 */
export async function searchWikidata(query: string, type?: string): Promise<AuthorityResult[]> {
  if (!query || query.length < 2) return [];

  try {
    const url = `https://www.wikidata.org/w/api.php`;
    const params = new URLSearchParams({
      action: 'wbsearchentities',
      search: query,
      language: 'en',
      format: 'json',
      origin: '*'
    });

    if (type) params.append('type', type);

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) throw new Error('Wikidata API error');

    const data = await response.json();
    
    return data.search?.map((item: any) => ({
      label: item.label,
      uri: `http://www.wikidata.org/entity/${item.id}`,
      source: 'Wikidata' as const,
      description: item.description
    })) || [];
  } catch (error) {
    console.error('Wikidata search error:', error);
    return [];
  }
}

/**
 * Combined authority search across all sources
 */
export async function searchAllAuthorities(
  query: string,
  context: 'person' | 'organization' | 'subject' | 'genre' | 'place' | 'language'
): Promise<AuthorityResult[]> {
  const results: AuthorityResult[] = [];

  try {
    // Parallel search across sources
    const searches: Promise<AuthorityResult[]>[] = [];

    switch (context) {
      case 'person':
      case 'organization':
        searches.push(searchLOCAuthorities(query, 'names'));
        searches.push(searchVIAF(query));
        searches.push(searchWikidata(query, 'item'));
        break;

      case 'subject':
        searches.push(searchLOCAuthorities(query, 'subjects'));
        searches.push(searchWikidata(query, 'item'));
        break;

      case 'genre':
        searches.push(searchLOCAuthorities(query, 'genreForms'));
        break;

      case 'place':
        searches.push(searchLOCAuthorities(query, 'geographicAreas'));
        searches.push(searchWikidata(query, 'item'));
        break;

      case 'language':
        searches.push(searchLOCAuthorities(query, 'languages'));
        break;
    }

    const allResults = await Promise.all(searches);
    allResults.forEach(sourceResults => results.push(...sourceResults));

    // Deduplicate by label
    const seen = new Set<string>();
    return results.filter(r => {
      if (!r.label) return false;
      const labelLower = r.label.toLowerCase();
      if (seen.has(labelLower)) return false;
      seen.add(labelLower);
      return true;
    });
  } catch (error) {
    console.error('Authority search error:', error);
    return [];
  }
}

/**
 * Search LOC Languages
 */
export async function searchLanguages(query: string): Promise<AuthorityResult[]> {
  // Common languages (fallback for offline)
  const commonLanguages: AuthorityResult[] = [
    { label: 'English', uri: 'http://id.loc.gov/vocabulary/languages/eng', source: 'LOC' },
    { label: 'Spanish', uri: 'http://id.loc.gov/vocabulary/languages/spa', source: 'LOC' },
    { label: 'French', uri: 'http://id.loc.gov/vocabulary/languages/fre', source: 'LOC' },
    { label: 'German', uri: 'http://id.loc.gov/vocabulary/languages/ger', source: 'LOC' },
    { label: 'Italian', uri: 'http://id.loc.gov/vocabulary/languages/ita', source: 'LOC' },
    { label: 'Arabic', uri: 'http://id.loc.gov/vocabulary/languages/ara', source: 'LOC' },
    { label: 'Chinese', uri: 'http://id.loc.gov/vocabulary/languages/chi', source: 'LOC' },
    { label: 'Japanese', uri: 'http://id.loc.gov/vocabulary/languages/jpn', source: 'LOC' },
    { label: 'Russian', uri: 'http://id.loc.gov/vocabulary/languages/rus', source: 'LOC' },
    { label: 'Portuguese', uri: 'http://id.loc.gov/vocabulary/languages/por', source: 'LOC' },
  ];

  if (!query) return commonLanguages;

  const filtered = commonLanguages.filter(l => 
    l.label && query && l.label.toLowerCase().includes(query.toLowerCase())
  );

  // Try LOC API if query is specific
  if (query.length >= 2) {
    try {
      const locResults = await searchLOCAuthorities(query, 'languages');
      return [...locResults, ...filtered];
    } catch {
      return filtered;
    }
  }

  return filtered;
}

/**
 * Search LOC Carriers
 */
export async function searchCarriers(query: string): Promise<AuthorityResult[]> {
  const commonCarriers: AuthorityResult[] = [
    { label: 'volume (print)', uri: 'http://id.loc.gov/vocabulary/carriers/nc', source: 'LOC' },
    { label: 'online resource', uri: 'http://id.loc.gov/vocabulary/carriers/cr', source: 'LOC' },
    { label: 'computer disc', uri: 'http://id.loc.gov/vocabulary/carriers/cd', source: 'LOC' },
    { label: 'audio disc', uri: 'http://id.loc.gov/vocabulary/carriers/sd', source: 'LOC' },
    { label: 'videodisc', uri: 'http://id.loc.gov/vocabulary/carriers/vd', source: 'LOC' },
    { label: 'microfilm reel', uri: 'http://id.loc.gov/vocabulary/carriers/hd', source: 'LOC' },
  ];

  if (!query) return commonCarriers;

  return commonCarriers.filter(c => 
    c.label && query && c.label.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * Search LOC Media Types
 */
export async function searchMediaTypes(query: string): Promise<AuthorityResult[]> {
  const commonMedia: AuthorityResult[] = [
    { label: 'unmediated', uri: 'http://id.loc.gov/vocabulary/mediaTypes/n', source: 'LOC' },
    { label: 'computer', uri: 'http://id.loc.gov/vocabulary/mediaTypes/c', source: 'LOC' },
    { label: 'audio', uri: 'http://id.loc.gov/vocabulary/mediaTypes/s', source: 'LOC' },
    { label: 'video', uri: 'http://id.loc.gov/vocabulary/mediaTypes/v', source: 'LOC' },
    { label: 'microform', uri: 'http://id.loc.gov/vocabulary/mediaTypes/h', source: 'LOC' },
  ];

  if (!query) return commonMedia;

  return commonMedia.filter(m => 
    m.label && query && m.label.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * Search LOC Countries
 */
export async function searchCountries(query: string): Promise<AuthorityResult[]> {
  const commonCountries: AuthorityResult[] = [
    { label: 'United States', uri: 'http://id.loc.gov/vocabulary/countries/xxu', source: 'LOC' },
    { label: 'United Kingdom', uri: 'http://id.loc.gov/vocabulary/countries/xxk', source: 'LOC' },
    { label: 'Canada', uri: 'http://id.loc.gov/vocabulary/countries/xxc', source: 'LOC' },
    { label: 'France', uri: 'http://id.loc.gov/vocabulary/countries/fr', source: 'LOC' },
    { label: 'Germany', uri: 'http://id.loc.gov/vocabulary/countries/gw', source: 'LOC' },
    { label: 'Spain', uri: 'http://id.loc.gov/vocabulary/countries/sp', source: 'LOC' },
    { label: 'Italy', uri: 'http://id.loc.gov/vocabulary/countries/it', source: 'LOC' },
    { label: 'Japan', uri: 'http://id.loc.gov/vocabulary/countries/ja', source: 'LOC' },
    { label: 'China', uri: 'http://id.loc.gov/vocabulary/countries/cc', source: 'LOC' },
    { label: 'Australia', uri: 'http://id.loc.gov/vocabulary/countries/at', source: 'LOC' },
  ];

  if (!query) return commonCountries;

  return commonCountries.filter(c => 
    c.label && query && c.label.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * LOC Relators (common roles)
 */
export const COMMON_RELATORS = [
  { code: 'aut', label: 'Author', uri: 'http://id.loc.gov/vocabulary/relators/aut' },
  { code: 'edt', label: 'Editor', uri: 'http://id.loc.gov/vocabulary/relators/edt' },
  { code: 'trl', label: 'Translator', uri: 'http://id.loc.gov/vocabulary/relators/trl' },
  { code: 'ill', label: 'Illustrator', uri: 'http://id.loc.gov/vocabulary/relators/ill' },
  { code: 'pbl', label: 'Publisher', uri: 'http://id.loc.gov/vocabulary/relators/pbl' },
  { code: 'ctb', label: 'Contributor', uri: 'http://id.loc.gov/vocabulary/relators/ctb' },
  { code: 'cre', label: 'Creator', uri: 'http://id.loc.gov/vocabulary/relators/cre' },
  { code: 'com', label: 'Compiler', uri: 'http://id.loc.gov/vocabulary/relators/com' },
  { code: 'pht', label: 'Photographer', uri: 'http://id.loc.gov/vocabulary/relators/pht' },
  { code: 'nrt', label: 'Narrator', uri: 'http://id.loc.gov/vocabulary/relators/nrt' },
  { code: 'drt', label: 'Director', uri: 'http://id.loc.gov/vocabulary/relators/drt' },
];

export function searchRelators(query: string) {
  if (!query) return COMMON_RELATORS;
  
  return COMMON_RELATORS.filter(r => {
    if (!query) return true;
    const queryLower = query.toLowerCase();
    return (r.label && r.label.toLowerCase().includes(queryLower)) ||
           (r.code && r.code.toLowerCase().includes(queryLower));
  });
}

/**
 * ISBN Lookup using Open Library API
 */
export interface ISBNData {
  title?: string;
  subtitle?: string;
  authors?: string[];
  publishers?: string[];
  publishDate?: string;
  numberOfPages?: number;
  isbn10?: string;
  isbn13?: string;
}

export async function lookupISBN(isbn: string): Promise<ISBNData | null> {
  try {
    // Clean ISBN
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    
    // Try Open Library
    const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`);
    if (!response.ok) return null;

    const data = await response.json();
    const bookData = data[`ISBN:${cleanISBN}`];
    
    if (!bookData) return null;

    return {
      title: bookData.title,
      subtitle: bookData.subtitle,
      authors: bookData.authors?.map((a: any) => a.name) || [],
      publishers: bookData.publishers?.map((p: any) => p.name) || [],
      publishDate: bookData.publish_date,
      numberOfPages: bookData.number_of_pages,
      isbn10: bookData.identifiers?.isbn_10?.[0],
      isbn13: bookData.identifiers?.isbn_13?.[0],
    };
  } catch (error) {
    console.error('ISBN lookup error:', error);
    return null;
  }
}

/**
 * Search for Accessibility Content features
 */
export async function searchAccessibilityContent(query: string): Promise<AuthorityResult[]> {
  const options = [
    { id: 'large-print', label: 'Large print', uri: 'http://id.loc.gov/vocabulary/accessibility/largePrint' },
    { id: 'braille', label: 'Braille', uri: 'http://id.loc.gov/vocabulary/accessibility/braille' },
    { id: 'audio-desc', label: 'Audio description', uri: 'http://id.loc.gov/vocabulary/accessibility/audioDescription' },
    { id: 'captions', label: 'Captions', uri: 'http://id.loc.gov/vocabulary/accessibility/captions' },
    { id: 'sign-lang', label: 'Sign language', uri: 'http://id.loc.gov/vocabulary/accessibility/signLanguage' },
    { id: 'tactile', label: 'Tactile graphics', uri: 'http://id.loc.gov/vocabulary/accessibility/tactileGraphics' },
    { id: 'screen-reader', label: 'Screen reader compatible', uri: 'http://id.loc.gov/vocabulary/accessibility/screenReaderCompatible' },
    { id: 'high-contrast', label: 'High contrast', uri: 'http://id.loc.gov/vocabulary/accessibility/highContrast' },
    { id: 'accessible-pdf', label: 'Accessible PDF', uri: 'http://id.loc.gov/vocabulary/accessibility/accessiblePDF' }
  ];

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.map(opt => ({
    label: opt.label,
    uri: opt.uri,
    type: 'accessibilityContent' as const,
    source: 'LOC' as const
  }));
}

/**
 * Search for Notation Types
 */
export async function searchNotationTypes(query: string): Promise<AuthorityResult[]> {
  const options = [
    { id: 'braille', label: 'Braille code', uri: 'http://id.loc.gov/vocabulary/notationType/braille' },
    { id: 'music', label: 'Music notation', uri: 'http://id.loc.gov/vocabulary/notationType/music' },
    { id: 'mathematical', label: 'Mathematical notation', uri: 'http://id.loc.gov/vocabulary/notationType/mathematical' },
    { id: 'movement', label: 'Movement notation', uri: 'http://id.loc.gov/vocabulary/notationType/movement' },
    { id: 'tactile', label: 'Tactile notation', uri: 'http://id.loc.gov/vocabulary/notationType/tactile' }
  ];

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.map(opt => ({
    label: opt.label,
    uri: opt.uri,
    type: 'notation' as const,
    source: 'LOC' as const
  }));
}

/**
 * Search for Government Publication types
 */
export async function searchGovernmentPub(query: string): Promise<AuthorityResult[]> {
  const options = [
    { id: 'federal', label: 'Federal/national', uri: 'http://id.loc.gov/vocabulary/mgovtpubtype/f' },
    { id: 'multilocal', label: 'Multilocal', uri: 'http://id.loc.gov/vocabulary/mgovtpubtype/c' },
    { id: 'state', label: 'State, provincial, territorial', uri: 'http://id.loc.gov/vocabulary/mgovtpubtype/s' },
    { id: 'local', label: 'Local', uri: 'http://id.loc.gov/vocabulary/mgovtpubtype/l' },
    { id: 'intergovernmental', label: 'Intergovernmental', uri: 'http://id.loc.gov/vocabulary/mgovtpubtype/i' },
    { id: 'undetermined', label: 'Government publication-level undetermined', uri: 'http://id.loc.gov/vocabulary/mgovtpubtype/u' },
    { id: 'not-govt', label: 'Not a government publication', uri: 'http://id.loc.gov/vocabulary/mgovtpubtype/n' }
  ];

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.map(opt => ({
    label: opt.label,
    uri: opt.uri,
    type: 'governmentPublication' as const,
    source: 'LOC' as const
  }));
}

/**
 * Search for Description Authentication codes
 */
export async function searchDescriptionAuth(query: string): Promise<AuthorityResult[]> {
  const options = [
    { id: 'pcc', label: 'PCC (Program for Cooperative Cataloging)', uri: 'http://id.loc.gov/vocabulary/descriptionAuthentication/pcc' },
    { id: 'nsdp', label: 'NSDP (National Serials Data Program)', uri: 'http://id.loc.gov/vocabulary/descriptionAuthentication/nsdp' },
    { id: 'authenticated', label: 'Authenticated', uri: 'http://id.loc.gov/vocabulary/descriptionAuthentication/auth' },
    { id: 'non-auth', label: 'Non-authenticated', uri: 'http://id.loc.gov/vocabulary/descriptionAuthentication/nonAuth' }
  ];

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.map(opt => ({
    label: opt.label,
    uri: opt.uri,
    type: 'authentication' as const,
    source: 'LOC' as const
  }));
}