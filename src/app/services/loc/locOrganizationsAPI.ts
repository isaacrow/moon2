/**
 * LOC Organizations API Service
 * API: https://id.loc.gov/vocabulary/organizations
 * Used for: Classification assigners, Cataloging sources (MARC 040, 050 $5, etc.)
 */

export interface LocOrganization {
  uri: string;
  label: string;
  code?: string;
  notation?: string;
  broader?: string[];
  altLabel?: string[];
}

const BASE_URL = 'https://id.loc.gov/vocabulary/organizations';

/**
 * Search LOC Organizations
 * For classification assigners, cataloging agencies, etc.
 */
export async function searchLocOrganizations(query: string): Promise<LocOrganization[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const searchUrl = `${BASE_URL}/suggest2/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`Organizations API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.hits) {
      return [];
    }

    return data.hits.map((hit: any) => ({
      uri: hit.uri || `${BASE_URL}/${hit.token}`,
      label: hit.aLabel || hit.suggestLabel || hit.token,
      code: hit.token,
      notation: hit.token,
      altLabel: hit.altLabels || []
    }));
  } catch (error) {
    console.error('Error searching LOC organizations:', error);
    return [];
  }
}

/**
 * Get organization by code
 */
export async function getOrganizationByCode(code: string): Promise<LocOrganization | null> {
  try {
    const url = `${BASE_URL}/${code}.json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const org = data[0] || data;

    return {
      uri: org['@id'] || `${BASE_URL}/${code}`,
      label: org['http://www.w3.org/2004/02/skos/core#prefLabel']?.[0]?.['@value'] || code,
      code: code,
      notation: code
    };
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
}

/**
 * Common organizations for quick access
 */
export const COMMON_ORGANIZATIONS = [
  { code: 'DLC', label: 'Library of Congress', uri: `${BASE_URL}/dlc` },
  { code: 'DNAL', label: 'National Agricultural Library', uri: `${BASE_URL}/dnal` },
  { code: 'NLM', label: 'National Library of Medicine', uri: `${BASE_URL}/nlm` },
  { code: 'CU', label: 'University of California', uri: `${BASE_URL}/cu` },
  { code: 'CtY', label: 'Yale University', uri: `${BASE_URL}/cty` },
  { code: 'MH', label: 'Harvard University', uri: `${BASE_URL}/mh` },
  { code: 'NIC', label: 'Cornell University', uri: `${BASE_URL}/nic` },
  { code: 'NN', label: 'New York Public Library', uri: `${BASE_URL}/nn` },
];
