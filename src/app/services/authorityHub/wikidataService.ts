// Wikidata Service (Primary Image Source)
import axios from 'axios';
import type { AuthoritySearchResult } from './types';

export class WikidataService {
  private apiUrl = 'https://www.wikidata.org/w/api.php';
  private entityUrl = 'https://www.wikidata.org/wiki/Special:EntityData';

  async search(query: string): Promise<AuthoritySearchResult[]> {
    if (!query || query.trim().length === 0) return [];

    try {
      const url = `${this.apiUrl}?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&origin=*`;
      const response = await axios.get(url, { timeout: 8000 });

      const results = response.data?.search || [];

      return results.map((item: any, index: number) => ({
        source: 'Wikidata' as const,
        id: item.id,
        label: item.label || '',
        description: item.description || '',
        uri: `https://www.wikidata.org/entity/${item.id}`,
        score: 1.0 - (index * 0.05)
      }));
    } catch (error) {
      console.error('[Wikidata] Search error:', error);
      return [];
    }
  }

  async getEntity(id: string): Promise<any> {
    try {
      const url = `${this.entityUrl}/${id}.json`;
      const response = await axios.get(url, { timeout: 10000 });
      return response.data.entities?.[id];
    } catch (error) {
      console.error('[Wikidata] Fetch entity error:', error);
      return null;
    }
  }

  extractImage(entity: any): string | null {
    if (!entity) return null;

    // P18 = image property
    const imageClaims = entity.claims?.P18;
    if (!imageClaims || imageClaims.length === 0) return null;

    const imageValue = imageClaims[0]?.mainsnak?.datavalue?.value;
    if (!imageValue) return null;

    // Convert to Commons URL
    const imageName = imageValue.replace(/ /g, '_');
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageName)}?width=300`;
  }

  extractBirthDeath(entity: any): { birth?: string; death?: string } {
    const result: { birth?: string; death?: string } = {};

    // P569 = date of birth
    const birthClaims = entity.claims?.P569;
    if (birthClaims && birthClaims.length > 0) {
      const birthDate = birthClaims[0]?.mainsnak?.datavalue?.value?.time;
      if (birthDate) {
        result.birth = this.parseWikidataDate(birthDate);
      }
    }

    // P570 = date of death
    const deathClaims = entity.claims?.P570;
    if (deathClaims && deathClaims.length > 0) {
      const deathDate = deathClaims[0]?.mainsnak?.datavalue?.value?.time;
      if (deathDate) {
        result.death = this.parseWikidataDate(deathDate);
      }
    }

    return result;
  }

  extractOccupations(entity: any): string[] {
    const occupations: string[] = [];

    // P106 = occupation
    const occupationClaims = entity.claims?.P106;
    if (!occupationClaims) return occupations;

    occupationClaims.forEach((claim: any) => {
      const occupationId = claim?.mainsnak?.datavalue?.value?.id;
      if (occupationId && entity.labels?.[occupationId]) {
        occupations.push(entity.labels[occupationId].value);
      }
    });

    return occupations;
  }

  extractNationality(entity: any): string | null {
    // P27 = country of citizenship
    const nationalityClaims = entity.claims?.P27;
    if (!nationalityClaims || nationalityClaims.length === 0) return null;

    const nationalityId = nationalityClaims[0]?.mainsnak?.datavalue?.value?.id;
    if (!nationalityId) return null;

    // Try to get label
    return entity.labels?.[nationalityId]?.value || null;
  }

  extractIdentifiers(entity: any): { loc?: string; viaf?: string } {
    const identifiers: { loc?: string; viaf?: string } = {};

    // P244 = Library of Congress authority ID
    const locClaims = entity.claims?.P244;
    if (locClaims && locClaims.length > 0) {
      identifiers.loc = locClaims[0]?.mainsnak?.datavalue?.value;
    }

    // P214 = VIAF ID
    const viafClaims = entity.claims?.P214;
    if (viafClaims && viafClaims.length > 0) {
      identifiers.viaf = viafClaims[0]?.mainsnak?.datavalue?.value;
    }

    return identifiers;
  }

  private parseWikidataDate(dateStr: string): string {
    // Wikidata dates are like "+1927-03-06T00:00:00Z"
    const match = dateStr.match(/([+-]\d{4})-(\d{2})-(\d{2})/);
    if (!match) return dateStr;

    const year = match[1].replace('+', '');
    return year; // Return just the year for simplicity
  }
}
