/**
 * BIBFRAME Search Service - Enhanced
 * Complete LOC API integration for all authority-controlled fields
 * Including subjects, countries, geographic areas, etc.
 */

export interface SearchResult {
  uri: string;
  label: string;
  type?: string;
  source?: string;
  note?: string;
  broader?: string[];
  narrower?: string[];
  related?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

/**
 * Search LOC Subject Headings (LCSH)
 * Endpoint: https://id.loc.gov/authorities/subjects/suggest2
 */
export async function searchSubjects(query: string): Promise<SearchResponse> {
  if (!query || query.trim().length < 2) {
    return { results: [], total: 0, query };
  }

  try {
    const url = `https://id.loc.gov/authorities/subjects/suggest2/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`LCSH API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Format: { hits: [{ uri, aLabel, suggestLabel }] }
    const results: SearchResult[] = (data.hits || []).map((hit: any) => ({
      uri: hit.uri,
      label: hit.aLabel || hit.suggestLabel || hit.label,
      type: 'Topic',
      source: 'LCSH',
    }));

    return {
      results,
      total: results.length,
      query,
    };
  } catch (error) {
    console.error('Error searching LCSH:', error);
    return { results: [], total: 0, query };
  }
}

/**
 * Search LOC Geographic Names
 * Endpoint: https://id.loc.gov/authorities/names/suggest2
 * Filter for geographic names
 */
export async function searchGeographicNames(query: string): Promise<SearchResponse> {
  if (!query || query.trim().length < 2) {
    return { results: [], total: 0, query };
  }

  try {
    const url = `https://id.loc.gov/authorities/names/suggest2/?q=${encodeURIComponent(query)}&rdftype=Geographic`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geographic Names API error: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = (data.hits || []).map((hit: any) => ({
      uri: hit.uri,
      label: hit.aLabel || hit.suggestLabel || hit.label,
      type: 'Geographic',
      source: 'LCNAF Geographic',
    }));

    return {
      results,
      total: results.length,
      query,
    };
  } catch (error) {
    console.error('Error searching geographic names:', error);
    return { results: [], total: 0, query };
  }
}

/**
 * Search LOC Countries
 * Endpoint: https://id.loc.gov/vocabulary/countries/suggest2
 */
export async function searchCountries(query: string): Promise<SearchResponse> {
  if (!query || query.trim().length < 1) {
    return { results: [], total: 0, query };
  }

  try {
    const url = `https://id.loc.gov/vocabulary/countries/suggest2/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Countries API error: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = (data.hits || []).map((hit: any) => ({
      uri: hit.uri,
      label: hit.aLabel || hit.suggestLabel || hit.label,
      type: 'Country',
      source: 'LOC Countries',
    }));

    return {
      results,
      total: results.length,
      query,
    };
  } catch (error) {
    console.error('Error searching countries:', error);
    return { results: [], total: 0, query };
  }
}

/**
 * Search LOC Geographic Areas
 * Endpoint: https://id.loc.gov/vocabulary/geographicAreas/suggest2
 */
export async function searchGeographicAreas(query: string): Promise<SearchResponse> {
  if (!query || query.trim().length < 1) {
    return { results: [], total: 0, query };
  }

  try {
    const url = `https://id.loc.gov/vocabulary/geographicAreas/suggest2/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geographic Areas API error: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = (data.hits || []).map((hit: any) => ({
      uri: hit.uri,
      label: hit.aLabel || hit.suggestLabel || hit.label,
      type: 'GeographicArea',
      source: 'LOC Geographic Areas',
    }));

    return {
      results,
      total: results.length,
      query,
    };
  } catch (error) {
    console.error('Error searching geographic areas:', error);
    return { results: [], total: 0, query };
  }
}

/**
 * Search LOC Languages
 * Endpoint: https://id.loc.gov/vocabulary/languages/suggest2
 */
export async function searchLanguages(query: string): Promise<SearchResponse> {
  if (!query || query.trim().length < 1) {
    return { results: [], total: 0, query };
  }

  try {
    const url = `https://id.loc.gov/vocabulary/languages/suggest2/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Languages API error: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = (data.hits || []).map((hit: any) => ({
      uri: hit.uri,
      label: hit.aLabel || hit.suggestLabel || hit.label,
      type: 'Language',
      source: 'LOC Languages',
    }));

    return {
      results,
      total: results.length,
      query,
    };
  } catch (error) {
    console.error('Error searching languages:', error);
    return { results: [], total: 0, query };
  }
}

/**
 * Search LOC Organizations
 * Endpoint: https://id.loc.gov/vocabulary/organizations/suggest2
 */
export async function searchOrganizations(query: string): Promise<SearchResponse> {
  if (!query || query.trim().length < 2) {
    return { results: [], total: 0, query };
  }

  try {
    const url = `https://id.loc.gov/vocabulary/organizations/suggest2/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Organizations API error: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = (data.hits || []).map((hit: any) => ({
      uri: hit.uri,
      label: hit.aLabel || hit.suggestLabel || hit.label,
      type: 'Organization',
      source: 'LOC Organizations',
    }));

    return {
      results,
      total: results.length,
      query,
    };
  } catch (error) {
    console.error('Error searching organizations:', error);
    return { results: [], total: 0, query };
  }
}

/**
 * Search LOC Genre/Form Terms (LCGFT)
 * Endpoint: https://id.loc.gov/authorities/genreForms/suggest2
 */
export async function searchGenreForms(query: string): Promise<SearchResponse> {
  if (!query || query.trim().length < 2) {
    return { results: [], total: 0, query };
  }

  try {
    const url = `https://id.loc.gov/authorities/genreForms/suggest2/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`LCGFT API error: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = (data.hits || []).map((hit: any) => ({
      uri: hit.uri,
      label: hit.aLabel || hit.suggestLabel || hit.label,
      type: 'GenreForm',
      source: 'LCGFT',
    }));

    return {
      results,
      total: results.length,
      query,
    };
  } catch (error) {
    console.error('Error searching genre/form terms:', error);
    return { results: [], total: 0, query };
  }
}

/**
 * Search LOC Personal Names
 * Endpoint: https://id.loc.gov/authorities/names/suggest2
 */
export async function searchPersonalNames(query: string): Promise<SearchResponse> {
  if (!query || query.trim().length < 2) {
    return { results: [], total: 0, query };
  }

  try {
    const url = `https://id.loc.gov/authorities/names/suggest2/?q=${encodeURIComponent(query)}&rdftype=PersonalName`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Personal Names API error: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = (data.hits || []).map((hit: any) => ({
      uri: hit.uri,
      label: hit.aLabel || hit.suggestLabel || hit.label,
      type: 'Person',
      source: 'LCNAF',
    }));

    return {
      results,
      total: results.length,
      query,
    };
  } catch (error) {
    console.error('Error searching personal names:', error);
    return { results: [], total: 0, query };
  }
}

/**
 * Search LOC Corporate Names
 * Endpoint: https://id.loc.gov/authorities/names/suggest2
 */
export async function searchCorporateNames(query: string): Promise<SearchResponse> {
  if (!query || query.trim().length < 2) {
    return { results: [], total: 0, query };
  }

  try {
    const url = `https://id.loc.gov/authorities/names/suggest2/?q=${encodeURIComponent(query)}&rdftype=CorporateName`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Corporate Names API error: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = (data.hits || []).map((hit: any) => ({
      uri: hit.uri,
      label: hit.aLabel || hit.suggestLabel || hit.label,
      type: 'Organization',
      source: 'LCNAF',
    }));

    return {
      results,
      total: results.length,
      query,
    };
  } catch (error) {
    console.error('Error searching corporate names:', error);
    return { results: [], total: 0, query };
  }
}

/**
 * Get entity details by URI
 */
export async function getEntityDetails(uri: string): Promise<SearchResult | null> {
  try {
    const jsonUri = uri.endsWith('.json') ? uri : `${uri}.json`;
    const response = await fetch(jsonUri);
    
    if (!response.ok) {
      throw new Error(`Entity fetch error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract label from various possible fields
    const label = 
      data['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']?.[0]?.['@value'] ||
      data['http://www.w3.org/2000/01/rdf-schema#label']?.[0]?.['@value'] ||
      data['http://www.w3.org/2004/02/skos/core#prefLabel']?.[0]?.['@value'] ||
      'Unknown';

    return {
      uri,
      label,
      type: data['@type']?.[0] || 'Unknown',
      source: 'LOC',
    };
  } catch (error) {
    console.error('Error fetching entity details:', error);
    return null;
  }
}

/**
 * Universal search function that tries multiple endpoints
 */
export async function universalSearch(
  query: string,
  searchType: 'subject' | 'geographic' | 'country' | 'language' | 'organization' | 'person' | 'corporate' | 'genreForm' | 'all'
): Promise<SearchResponse> {
  switch (searchType) {
    case 'subject':
      return searchSubjects(query);
    case 'geographic':
      return searchGeographicNames(query);
    case 'country':
      return searchCountries(query);
    case 'language':
      return searchLanguages(query);
    case 'organization':
      return searchOrganizations(query);
    case 'person':
      return searchPersonalNames(query);
    case 'corporate':
      return searchCorporateNames(query);
    case 'genreForm':
      return searchGenreForms(query);
    case 'all':
      // Search all and combine results
      const [subjects, people, organizations] = await Promise.all([
        searchSubjects(query),
        searchPersonalNames(query),
        searchCorporateNames(query),
      ]);
      return {
        results: [...subjects.results, ...people.results, ...organizations.results],
        total: subjects.total + people.total + organizations.total,
        query,
      };
    default:
      return { results: [], total: 0, query };
  }
}
