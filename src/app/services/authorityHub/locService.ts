// Library of Congress Authority Service
import axios from 'axios';
import type { AuthoritySearchResult } from './types';

export class LocAuthorityService {
  private baseUrl = 'https://id.loc.gov/authorities';

  async searchPerson(query: string): Promise<AuthoritySearchResult[]> {
    if (!query || query.trim().length === 0) return [];

    try {
      const url = `${this.baseUrl}/names/suggest/?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url, { timeout: 8000 });

      const data = response.data;
      if (!Array.isArray(data) || data.length < 4) return [];

      const labels = data[1] || [];
      const descriptions = data[2] || [];
      const uris = data[3] || [];

      return labels.map((label: string, index: number) => ({
        source: 'LOC' as const,
        id: this.extractId(uris[index]),
        label,
        description: descriptions[index] || '',
        uri: uris[index],
        score: 1.0 - (index * 0.05)
      }));
    } catch (error) {
      console.error('[LOC] Search error:', error);
      return [];
    }
  }

  async fetchRDF(uri: string): Promise<any> {
    try {
      const jsonUrl = uri.endsWith('.json') ? uri : `${uri}.json`;
      const response = await axios.get(jsonUrl, { timeout: 10000 });
      return response.data;
    } catch (error) {
      console.error('[LOC] Fetch RDF error:', error);
      return null;
    }
  }

  async getPersonDetails(id: string): Promise<any> {
    const uri = `${this.baseUrl}/names/${id}`;
    return this.fetchRDF(uri);
  }

  private extractId(uri: string): string {
    const match = uri.match(/\/([^\/]+)$/);
    return match ? match[1] : uri;
  }
}
