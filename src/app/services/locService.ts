/**
 * Library of Congress API Service
 * 
 * Provides functions to search and retrieve data from various LOC APIs:
 * - Name Authority File (NAF)
 * - Subject Headings (LCSH)
 * - Geographic Names
 * - RDA Vocabularies
 * - Classification schemes
 */

const LOC_BASE_URL = 'https://id.loc.gov';

/**
 * Search LOC Name Authority File (NAF)
 * For persons, organizations, families
 */
export async function searchLocNames(query: string): Promise<any> {
  try {
    // Use the suggest2 endpoint which has better CORS support
    const response = await fetch(
      `${LOC_BASE_URL}/authorities/names/suggest2/?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.warn('LOC Names API returned error:', response.status);
      return { hits: getMockNames(query) };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching LOC Names:', error);
    // Return mock data as fallback
    return { hits: getMockNames(query) };
  }
}

// Mock data for development/fallback
function getMockNames(query: string): any[] {
  const mockData = [
    { uri: 'http://id.loc.gov/authorities/names/n79021164', suggestLabel: 'Shakespeare, William, 1564-1616', type: 'Person' },
    { uri: 'http://id.loc.gov/authorities/names/n79046204', suggestLabel: 'Hemingway, Ernest, 1899-1961', type: 'Person' },
    { uri: 'http://id.loc.gov/authorities/names/n79043203', suggestLabel: 'Austen, Jane, 1775-1817', type: 'Person' },
    { uri: 'http://id.loc.gov/authorities/names/n79006779', suggestLabel: 'Dickens, Charles, 1812-1870', type: 'Person' },
    { uri: 'http://id.loc.gov/authorities/names/n50034861', suggestLabel: 'García Márquez, Gabriel, 1927-2014', type: 'Person' },
    { uri: 'http://id.loc.gov/authorities/names/n79144981', suggestLabel: 'Library of Congress', type: 'Organization' },
    { uri: 'http://id.loc.gov/authorities/names/n79021846', suggestLabel: 'Oxford University Press', type: 'Organization' },
  ];
  
  return mockData.filter(item => 
    item.suggestLabel.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * Search LOC Subject Headings (LCSH)
 */
export async function searchLocSubjects(query: string): Promise<any> {
  try {
    const response = await fetch(
      `${LOC_BASE_URL}/authorities/subjects/suggest2/?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.warn('LOC Subjects API returned error:', response.status);
      return { hits: getMockSubjects(query) };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching LOC Subjects:', error);
    return { hits: getMockSubjects(query) };
  }
}

function getMockSubjects(query: string): any[] {
  const mockData = [
    { uri: 'http://id.loc.gov/authorities/subjects/sh85076502', suggestLabel: 'Libraries', type: 'Topic' },
    { uri: 'http://id.loc.gov/authorities/subjects/sh85043024', suggestLabel: 'English literature', type: 'Topic' },
    { uri: 'http://id.loc.gov/authorities/subjects/sh85004379', suggestLabel: 'American literature', type: 'Topic' },
    { uri: 'http://id.loc.gov/authorities/subjects/sh85009852', suggestLabel: 'Arabic literature', type: 'Topic' },
    { uri: 'http://id.loc.gov/authorities/subjects/sh85118696', suggestLabel: 'Science', type: 'Topic' },
    { uri: 'http://id.loc.gov/authorities/subjects/sh85082139', suggestLabel: 'Mathematics', type: 'Topic' },
    { uri: 'http://id.loc.gov/authorities/subjects/sh85061212', suggestLabel: 'History', type: 'Topic' },
  ];
  
  return mockData.filter(item => 
    item.suggestLabel.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * Search LOC Geographic Names
 */
export async function searchLocPlaces(query: string): Promise<any> {
  try {
    // Try geographic areas first with suggest2
    const response = await fetch(
      `${LOC_BASE_URL}/vocabulary/geographicAreas/suggest2/?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.hits && data.hits.length > 0) {
        return data;
      }
    }
    
    // Try countries if no geographic areas found
    const countriesResponse = await fetch(
      `${LOC_BASE_URL}/vocabulary/countries/suggest2/?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (countriesResponse.ok) {
      return await countriesResponse.json();
    }
    
    return { hits: getMockPlaces(query) };
  } catch (error) {
    console.error('Error searching LOC Places:', error);
    return { hits: getMockPlaces(query) };
  }
}

function getMockPlaces(query: string): any[] {
  const mockData = [
    { uri: 'http://id.loc.gov/vocabulary/countries/us', suggestLabel: 'United States', code: 'us' },
    { uri: 'http://id.loc.gov/vocabulary/countries/uk', suggestLabel: 'United Kingdom', code: 'uk' },
    { uri: 'http://id.loc.gov/vocabulary/countries/fr', suggestLabel: 'France', code: 'fr' },
    { uri: 'http://id.loc.gov/vocabulary/countries/eg', suggestLabel: 'Egypt', code: 'eg' },
    { uri: 'http://id.loc.gov/vocabulary/countries/sa', suggestLabel: 'Saudi Arabia', code: 'sa' },
    { uri: 'http://id.loc.gov/vocabulary/countries/iq', suggestLabel: 'Iraq', code: 'iq' },
    { uri: 'http://id.loc.gov/vocabulary/countries/jo', suggestLabel: 'Jordan', code: 'jo' },
    { uri: 'http://id.loc.gov/vocabulary/countries/lb', suggestLabel: 'Lebanon', code: 'lb' },
    { uri: 'http://id.loc.gov/vocabulary/countries/sy', suggestLabel: 'Syria', code: 'sy' },
    { uri: 'http://id.loc.gov/vocabulary/countries/ma', suggestLabel: 'Morocco', code: 'ma' },
  ];
  
  return mockData.filter(item => 
    item.suggestLabel.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * Get LOC Relators (contributor roles)
 */
export async function getRelators(): Promise<any[]> {
  // Common relators - in production, this could fetch from LOC API
  return [
    { code: 'aut', uri: 'http://id.loc.gov/vocabulary/relators/aut', label: 'Author' },
    { code: 'edt', uri: 'http://id.loc.gov/vocabulary/relators/edt', label: 'Editor' },
    { code: 'trl', uri: 'http://id.loc.gov/vocabulary/relators/trl', label: 'Translator' },
    { code: 'ill', uri: 'http://id.loc.gov/vocabulary/relators/ill', label: 'Illustrator' },
    { code: 'pbl', uri: 'http://id.loc.gov/vocabulary/relators/pbl', label: 'Publisher' },
    { code: 'ctb', uri: 'http://id.loc.gov/vocabulary/relators/ctb', label: 'Contributor' },
    { code: 'com', uri: 'http://id.loc.gov/vocabulary/relators/com', label: 'Compiler' },
    { code: 'cre', uri: 'http://id.loc.gov/vocabulary/relators/cre', label: 'Creator' },
    { code: 'ann', uri: 'http://id.loc.gov/vocabulary/relators/ann', label: 'Annotator' },
    { code: 'ant', uri: 'http://id.loc.gov/vocabulary/relators/ant', label: 'Bibliographic antecedent' },
    { code: 'prf', uri: 'http://id.loc.gov/vocabulary/relators/prf', label: 'Performer' },
    { code: 'nrt', uri: 'http://id.loc.gov/vocabulary/relators/nrt', label: 'Narrator' },
  ];
}

/**
 * Get RDA Content Types
 */
export function getRdaContentTypes(): any[] {
  return [
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/txt', label: 'Text', code: 'txt' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/tct', label: 'Tactile text', code: 'tct' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/sti', label: 'Still image', code: 'sti' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/tdi', label: 'Two-dimensional moving image', code: 'tdi' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/tdm', label: 'Three-dimensional moving image', code: 'tdm' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/tdf', label: 'Three-dimensional form', code: 'tdf' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/cri', label: 'Cartographic image', code: 'cri' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/crm', label: 'Cartographic moving image', code: 'crm' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/crt', label: 'Cartographic tactile image', code: 'crt' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/crd', label: 'Cartographic three-dimensional form', code: 'crd' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/prm', label: 'Performed music', code: 'prm' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/ntm', label: 'Notated music', code: 'ntm' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/spw', label: 'Spoken word', code: 'spw' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/snd', label: 'Sounds', code: 'snd' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/cod', label: 'Computer dataset', code: 'cod' },
    { uri: 'http://id.loc.gov/vocabulary/contentTypes/cop', label: 'Computer program', code: 'cop' },
  ];
}

/**
 * Get RDA Media Types
 */
export function getRdaMediaTypes(): any[] {
  return [
    { uri: 'http://id.loc.gov/vocabulary/mediaTypes/n', label: 'Unmediated', code: 'n' },
    { uri: 'http://id.loc.gov/vocabulary/mediaTypes/s', label: 'Audio', code: 's' },
    { uri: 'http://id.loc.gov/vocabulary/mediaTypes/c', label: 'Computer', code: 'c' },
    { uri: 'http://id.loc.gov/vocabulary/mediaTypes/h', label: 'Microform', code: 'h' },
    { uri: 'http://id.loc.gov/vocabulary/mediaTypes/p', label: 'Microscopic', code: 'p' },
    { uri: 'http://id.loc.gov/vocabulary/mediaTypes/g', label: 'Projected', code: 'g' },
    { uri: 'http://id.loc.gov/vocabulary/mediaTypes/e', label: 'Stereographic', code: 'e' },
    { uri: 'http://id.loc.gov/vocabulary/mediaTypes/v', label: 'Video', code: 'v' },
    { uri: 'http://id.loc.gov/vocabulary/mediaTypes/x', label: 'Other', code: 'x' },
    { uri: 'http://id.loc.gov/vocabulary/mediaTypes/z', label: 'Unspecified', code: 'z' },
  ];
}

/**
 * Get RDA Carrier Types
 */
export function getRdaCarrierTypes(): any[] {
  return [
    // Unmediated carriers
    { uri: 'http://id.loc.gov/vocabulary/carriers/nc', label: 'Volume', code: 'nc' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/no', label: 'Sheet', code: 'no' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/nr', label: 'Object', code: 'nr' },
    
    // Audio carriers
    { uri: 'http://id.loc.gov/vocabulary/carriers/sd', label: 'Audio disc', code: 'sd' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/ss', label: 'Audiocassette', code: 'ss' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/st', label: 'Audio cylinder', code: 'st' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/sq', label: 'Audio roll', code: 'sq' },
    
    // Computer carriers
    { uri: 'http://id.loc.gov/vocabulary/carriers/cr', label: 'Online resource', code: 'cr' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/cd', label: 'Computer disc', code: 'cd' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/ce', label: 'Computer disc cartridge', code: 'ce' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/ca', label: 'Computer tape cartridge', code: 'ca' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/cb', label: 'Computer chip cartridge', code: 'cb' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/ck', label: 'Computer card', code: 'ck' },
    
    // Microform carriers
    { uri: 'http://id.loc.gov/vocabulary/carriers/hd', label: 'Microfilm reel', code: 'hd' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/he', label: 'Microfiche', code: 'he' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/hf', label: 'Microfiche cassette', code: 'hf' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/hg', label: 'Microfilm cassette', code: 'hg' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/hj', label: 'Microfilm slip', code: 'hj' },
    
    // Video carriers
    { uri: 'http://id.loc.gov/vocabulary/carriers/vd', label: 'Videodisc', code: 'vd' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/vf', label: 'Videocassette', code: 'vf' },
    { uri: 'http://id.loc.gov/vocabulary/carriers/vr', label: 'Videotape reel', code: 'vr' },
  ];
}
