/**
 * Controlled Vocabulary Service
 * For accessing Library of Congress and other controlled vocabularies used in BIBFRAME 3.0.1
 */

import { BIBFRAME_VOCABULARIES } from '../types/bibframe3';

interface VocabularyTerm {
  id: string;
  uri: string;
  label: string;
  code?: string;
  definition?: string;
  broader?: string[];
  narrower?: string[];
  related?: string[];
  source?: string;
}

interface VocabularySearchResult {
  terms: VocabularyTerm[];
  totalResults: number;
  hasMore: boolean;
}

/**
 * Controlled Vocabulary Service
 * Provides access to LOC and other controlled vocabularies
 */
class ControlledVocabularyService {
  private cache: Map<string, VocabularyTerm[]> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  /**
   * Search a controlled vocabulary
   */
  async searchVocabulary(
    vocabularyType: keyof typeof BIBFRAME_VOCABULARIES,
    query: string,
    limit: number = 20
  ): Promise<VocabularySearchResult> {
    const baseUrl = BIBFRAME_VOCABULARIES[vocabularyType];
    
    try {
      // For demo purposes, we'll return mock data
      // In production, this would call the actual LOC APIs
      const mockData = this.getMockVocabularyData(vocabularyType, query, limit);
      return mockData;
    } catch (error) {
      console.error(`Error searching vocabulary ${vocabularyType}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific term from a vocabulary by URI
   */
  async getTerm(uri: string): Promise<VocabularyTerm | null> {
    try {
      // In production, this would fetch from LOC API
      return this.getMockTerm(uri);
    } catch (error) {
      console.error(`Error fetching term ${uri}:`, error);
      return null;
    }
  }

  /**
   * Get all available carriers
   */
  async getCarriers(query?: string): Promise<VocabularyTerm[]> {
    const result = await this.searchVocabulary('carriers', query || '', 100);
    return result.terms;
  }

  /**
   * Get all available media types
   */
  async getMediaTypes(query?: string): Promise<VocabularyTerm[]> {
    const result = await this.searchVocabulary('mediaTypes', query || '', 100);
    return result.terms;
  }

  /**
   * Get all available content types
   */
  async getContentTypes(query?: string): Promise<VocabularyTerm[]> {
    const result = await this.searchVocabulary('contentTypes', query || '', 100);
    return result.terms;
  }

  /**
   * Get all available issuance modes
   */
  async getIssuanceModes(query?: string): Promise<VocabularyTerm[]> {
    const result = await this.searchVocabulary('issuance', query || '', 100);
    return result.terms;
  }

  /**
   * Get all available countries
   */
  async getCountries(query?: string): Promise<VocabularyTerm[]> {
    const result = await this.searchVocabulary('countries', query || '', 300);
    return result.terms;
  }

  /**
   * Get all available languages
   */
  async getLanguages(query?: string): Promise<VocabularyTerm[]> {
    const result = await this.searchVocabulary('languages', query || '', 500);
    return result.terms;
  }

  /**
   * Get all available relator roles
   */
  async getRelatorRoles(query?: string): Promise<VocabularyTerm[]> {
    const result = await this.searchVocabulary('relators', query || '', 200);
    return result.terms;
  }

  /**
   * Get all available genre forms
   */
  async getGenreForms(query: string): Promise<VocabularyTerm[]> {
    const result = await this.searchVocabulary('genreForms', query, 50);
    return result.terms;
  }

  /**
   * Search subjects (LCSH)
   */
  async searchSubjects(query: string): Promise<VocabularyTerm[]> {
    const result = await this.searchVocabulary('subjects', query, 50);
    return result.terms;
  }

  /**
   * Search names (NAF)
   */
  async searchNames(query: string): Promise<VocabularyTerm[]> {
    const result = await this.searchVocabulary('names', query, 50);
    return result.terms;
  }

  /**
   * Get all available font sizes
   */
  async getFontSizes(): Promise<VocabularyTerm[]> {
    const result = await this.searchVocabulary('mfont', '', 20);
    return result.terms;
  }

  /**
   * Get all available color content values
   */
  async getColorContent(): Promise<VocabularyTerm[]> {
    const result = await this.searchVocabulary('mcolor', '', 20);
    return result.terms;
  }

  /**
   * Get all available sound content values
   */
  async getSoundContent(): Promise<VocabularyTerm[]> {
    const result = await this.searchVocabulary('msoundcontent', '', 20);
    return result.terms;
  }

  /**
   * Get all available intended audiences
   */
  async getIntendedAudiences(): Promise<VocabularyTerm[]> {
    const result = await this.searchVocabulary('maudience', '', 20);
    return result.terms;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // =========================================================================
  // MOCK DATA GENERATORS (Replace with actual API calls in production)
  // =========================================================================

  private getMockVocabularyData(
    vocabularyType: keyof typeof BIBFRAME_VOCABULARIES,
    query: string,
    limit: number
  ): VocabularySearchResult {
    const mockData = this.generateMockData(vocabularyType);
    
    const filtered = query
      ? mockData.filter(term =>
          term.label.toLowerCase().includes(query.toLowerCase()) ||
          term.code?.toLowerCase().includes(query.toLowerCase())
        )
      : mockData;

    return {
      terms: filtered.slice(0, limit),
      totalResults: filtered.length,
      hasMore: filtered.length > limit,
    };
  }

  private getMockTerm(uri: string): VocabularyTerm | null {
    // Mock implementation
    return {
      id: uri.split('/').pop() || '',
      uri,
      label: 'Mock Term',
      definition: 'This is a mock term definition',
    };
  }

  private generateMockData(vocabularyType: keyof typeof BIBFRAME_VOCABULARIES): VocabularyTerm[] {
    const baseUrl = BIBFRAME_VOCABULARIES[vocabularyType];

    switch (vocabularyType) {
      case 'carriers':
        return [
          { id: 'nc', uri: `${baseUrl}nc`, label: 'volume', code: 'nc' },
          { id: 'nb', uri: `${baseUrl}nb`, label: 'sheet', code: 'nb' },
          { id: 'no', uri: `${baseUrl}no`, label: 'online resource', code: 'no' },
          { id: 'sd', uri: `${baseUrl}sd`, label: 'audio disc', code: 'sd' },
          { id: 'vd', uri: `${baseUrl}vd`, label: 'videodisc', code: 'vd' },
          { id: 'cr', uri: `${baseUrl}cr`, label: 'online resource', code: 'cr' },
        ];

      case 'mediaTypes':
        return [
          { id: 'n', uri: `${baseUrl}n`, label: 'unmediated', code: 'n' },
          { id: 'c', uri: `${baseUrl}c`, label: 'computer', code: 'c' },
          { id: 's', uri: `${baseUrl}s`, label: 'audio', code: 's' },
          { id: 'v', uri: `${baseUrl}v`, label: 'video', code: 'v' },
          { id: 'p', uri: `${baseUrl}p`, label: 'projected', code: 'p' },
        ];

      case 'contentTypes':
        return [
          { id: 'txt', uri: `${baseUrl}txt`, label: 'text', code: 'txt' },
          { id: 'sti', uri: `${baseUrl}sti`, label: 'still image', code: 'sti' },
          { id: 'tdi', uri: `${baseUrl}tdi`, label: 'two-dimensional moving image', code: 'tdi' },
          { id: 'spw', uri: `${baseUrl}spw`, label: 'spoken word', code: 'spw' },
          { id: 'prm', uri: `${baseUrl}prm`, label: 'performed music', code: 'prm' },
          { id: 'ntm', uri: `${baseUrl}ntm`, label: 'notated music', code: 'ntm' },
          { id: 'cri', uri: `${baseUrl}cri`, label: 'cartographic image', code: 'cri' },
          { id: 'cod', uri: `${baseUrl}cod`, label: 'computer dataset', code: 'cod' },
        ];

      case 'issuance':
        return [
          { id: 'mono', uri: `${baseUrl}mono`, label: 'single unit', code: 'mono' },
          { id: 'serl', uri: `${baseUrl}serl`, label: 'serial', code: 'serl' },
          { id: 'mulm', uri: `${baseUrl}mulm`, label: 'multipart monograph', code: 'mulm' },
          { id: 'intg', uri: `${baseUrl}intg`, label: 'integrating resource', code: 'intg' },
        ];

      case 'countries':
        return [
          { id: 'xxu', uri: `${baseUrl}xxu`, label: 'United States', code: 'xxu' },
          { id: 'xxk', uri: `${baseUrl}xxk`, label: 'United Kingdom', code: 'xxk' },
          { id: 'fr', uri: `${baseUrl}fr`, label: 'France', code: 'fr' },
          { id: 'gw', uri: `${baseUrl}gw`, label: 'Germany', code: 'gw' },
          { id: 'ja', uri: `${baseUrl}ja`, label: 'Japan', code: 'ja' },
          { id: 'ch', uri: `${baseUrl}ch`, label: 'China', code: 'ch' },
        ];

      case 'languages':
        return [
          { id: 'eng', uri: `${baseUrl}eng`, label: 'English', code: 'eng' },
          { id: 'ara', uri: `${baseUrl}ara`, label: 'Arabic', code: 'ara' },
          { id: 'fre', uri: `${baseUrl}fre`, label: 'French', code: 'fre' },
          { id: 'ger', uri: `${baseUrl}ger`, label: 'German', code: 'ger' },
          { id: 'spa', uri: `${baseUrl}spa`, label: 'Spanish', code: 'spa' },
          { id: 'chi', uri: `${baseUrl}chi`, label: 'Chinese', code: 'chi' },
          { id: 'jpn', uri: `${baseUrl}jpn`, label: 'Japanese', code: 'jpn' },
        ];

      case 'relators':
        return [
          { id: 'aut', uri: `${baseUrl}aut`, label: 'Author', code: 'aut' },
          { id: 'edt', uri: `${baseUrl}edt`, label: 'Editor', code: 'edt' },
          { id: 'ill', uri: `${baseUrl}ill`, label: 'Illustrator', code: 'ill' },
          { id: 'trl', uri: `${baseUrl}trl`, label: 'Translator', code: 'trl' },
          { id: 'pbl', uri: `${baseUrl}pbl`, label: 'Publisher', code: 'pbl' },
          { id: 'ctb', uri: `${baseUrl}ctb`, label: 'Contributor', code: 'ctb' },
          { id: 'cmp', uri: `${baseUrl}cmp`, label: 'Composer', code: 'cmp' },
          { id: 'prf', uri: `${baseUrl}prf`, label: 'Performer', code: 'prf' },
        ];

      case 'mcolor':
        return [
          { id: 'bla', uri: `${baseUrl}bla`, label: 'black and white', code: 'bla' },
          { id: 'col', uri: `${baseUrl}col`, label: 'colored', code: 'col' },
          { id: 'mul', uri: `${baseUrl}mul`, label: 'multicolored', code: 'mul' },
          { id: 'one', uri: `${baseUrl}one`, label: 'one color', code: 'one' },
        ];

      case 'msoundcontent':
        return [
          { id: 'sound', uri: `${baseUrl}sound`, label: 'sound', code: 'sound' },
          { id: 'silent', uri: `${baseUrl}silent`, label: 'silent', code: 'silent' },
        ];

      case 'maudience':
        return [
          { id: 'juv', uri: `${baseUrl}juv`, label: 'Juvenile', code: 'juv' },
          { id: 'ado', uri: `${baseUrl}ado`, label: 'Adolescent', code: 'ado' },
          { id: 'gen', uri: `${baseUrl}gen`, label: 'General', code: 'gen' },
          { id: 'pre', uri: `${baseUrl}pre`, label: 'Preschool', code: 'pre' },
        ];

      case 'mfont':
        return [
          { id: 'lp', uri: `${baseUrl}lp`, label: 'large print', code: 'lp' },
          { id: 'gp', uri: `${baseUrl}gp`, label: 'giant print', code: 'gp' },
        ];

      case 'millus':
        return [
          { id: 'ill', uri: `${baseUrl}ill`, label: 'illustrations', code: 'ill' },
          { id: 'map', uri: `${baseUrl}map`, label: 'maps', code: 'map' },
          { id: 'por', uri: `${baseUrl}por`, label: 'portraits', code: 'por' },
          { id: 'cha', uri: `${baseUrl}cha`, label: 'charts', code: 'cha' },
          { id: 'pla', uri: `${baseUrl}pla`, label: 'plans', code: 'pla' },
          { id: 'pho', uri: `${baseUrl}pho`, label: 'photographs', code: 'pho' },
          { id: 'fac', uri: `${baseUrl}fac`, label: 'facsimiles', code: 'fac' },
          { id: 'coa', uri: `${baseUrl}coa`, label: 'coats of arms', code: 'coa' },
          { id: 'gen', uri: `${baseUrl}gen`, label: 'genealogical tables', code: 'gen' },
          { id: 'for', uri: `${baseUrl}for`, label: 'forms', code: 'for' },
          { id: 'sam', uri: `${baseUrl}sam`, label: 'samples', code: 'sam' },
        ];

      case 'msupplcont':
        return [
          { id: 'index', uri: `${baseUrl}index`, label: 'index', code: 'index' },
          { id: 'bibliography', uri: `${baseUrl}bibliography`, label: 'bibliography', code: 'bibliography' },
          { id: 'discography', uri: `${baseUrl}discography`, label: 'discography', code: 'discography' },
          { id: 'filmography', uri: `${baseUrl}filmography`, label: 'filmography', code: 'filmography' },
          { id: 'glossary', uri: `${baseUrl}glossary`, label: 'glossary', code: 'glossary' },
          { id: 'appendix', uri: `${baseUrl}appendix`, label: 'appendix', code: 'appendix' },
        ];

      case 'mstatus':
        return [
          { id: 'n', uri: `${baseUrl}n`, label: 'new', code: 'n' },
          { id: 'c', uri: `${baseUrl}c`, label: 'changed', code: 'c' },
          { id: 'd', uri: `${baseUrl}d`, label: 'deleted', code: 'd' },
          { id: 'o', uri: `${baseUrl}o`, label: 'obsolete', code: 'o' },
          { id: 'x', uri: `${baseUrl}x`, label: 'cancelled', code: 'x' },
          { id: 'uba', uri: `${baseUrl}uba`, label: 'used by assigner', code: 'uba' },
        ];

      case 'menclvl':
        return [
          { id: 'blank', uri: `${baseUrl}blank`, label: 'full level', code: ' ' },
          { id: '1', uri: `${baseUrl}1`, label: 'full level, material not examined', code: '1' },
          { id: '2', uri: `${baseUrl}2`, label: 'less-than-full level, material not examined', code: '2' },
          { id: '3', uri: `${baseUrl}3`, label: 'abbreviated level', code: '3' },
          { id: '4', uri: `${baseUrl}4`, label: 'core level', code: '4' },
          { id: '5', uri: `${baseUrl}5`, label: 'partial (preliminary) level', code: '5' },
          { id: '7', uri: `${baseUrl}7`, label: 'minimal level', code: '7' },
          { id: '8', uri: `${baseUrl}8`, label: 'prepublication level', code: '8' },
          { id: 'u', uri: `${baseUrl}u`, label: 'unknown', code: 'u' },
          { id: 'z', uri: `${baseUrl}z`, label: 'not applicable', code: 'z' },
        ];

      case 'descriptionConventions':
        return [
          { id: 'aacr', uri: `${baseUrl}aacr`, label: 'Anglo-American Cataloguing Rules', code: 'aacr' },
          { id: 'rda', uri: `${baseUrl}rda`, label: 'Resource Description and Access', code: 'rda' },
          { id: 'isbd', uri: `${baseUrl}isbd`, label: 'International Standard Bibliographic Description', code: 'isbd' },
          { id: 'dcrmb', uri: `${baseUrl}dcrmb`, label: 'Descriptive Cataloging of Rare Materials (Books)', code: 'dcrmb' },
          { id: 'dcrmmss', uri: `${baseUrl}dcrmmss`, label: 'Descriptive Cataloging of Rare Materials (Manuscripts)', code: 'dcrmmss' },
        ];

      case 'marcauthen':
        return [
          { id: 'pcc', uri: `${baseUrl}pcc`, label: 'Program for Cooperative Cataloging', code: 'pcc' },
          { id: 'nsdp', uri: `${baseUrl}nsdp`, label: 'National Serials Data Program', code: 'nsdp' },
          { id: 'lc', uri: `${baseUrl}lc`, label: 'Library of Congress', code: 'lc' },
          { id: 'nlc', uri: `${baseUrl}nlc`, label: 'National Library of Canada', code: 'nlc' },
          { id: 'blcmp', uri: `${baseUrl}blcmp`, label: 'BLCMP', code: 'blcmp' },
        ];

      default:
        return [];
    }
  }
}

// Export singleton instance
export const controlledVocabularyService = new ControlledVocabularyService();

// Export service class for testing
export { ControlledVocabularyService };
