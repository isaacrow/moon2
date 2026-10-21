// VIAF (Virtual International Authority File) Service
import axios from 'axios';
import type { AuthoritySearchResult } from './types';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

export class ViafService {
  private proxyUrl = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/viaf`;

  async search(query: string): Promise<AuthoritySearchResult[]> {
    if (!query || query.trim().length === 0) return [];

    try {
      const url = `${this.proxyUrl}/search?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url, { 
        timeout: 8000,
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const results = response.data?.results || [];
      
      return results.map((item: any) => ({
        source: 'VIAF' as const,
        id: item.id,
        label: item.label,
        description: item.description,
        uri: item.uri,
        score: item.score
      }));
    } catch (error) {
      console.error('[VIAF] Search error:', error);
      return [];
    }
  }

  async getPersonDetails(viafId: string): Promise<any> {
    try {
      const url = `${this.proxyUrl}/details/${viafId}`;
      const response = await axios.get(url, { 
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      return response.data;
    } catch (error) {
      // Don't log 404 errors as they're expected when a VIAF ID doesn't exist
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log(`[VIAF] Record not found: ${viafId}`);
      } else {
        console.error('[VIAF] Fetch details error:', error);
      }
      return null;
    }
  }

  extractBirthDeath(data: any): { birth?: string; death?: string } {
    const result: { birth?: string; death?: string } = {};

    // VIAF data structure varies, try common patterns
    const birthDate = data['birthDate'] || data['ns1:birthDate'];
    const deathDate = data['deathDate'] || data['ns1:deathDate'];

    if (birthDate) result.birth = String(birthDate);
    if (deathDate) result.death = String(deathDate);

    return result;
  }

  extractAlternateNames(data: any): string[] {
    const names: string[] = [];

    const x400 = data['x400'] || [];
    const x500 = data['x500'] || [];

    [...x400, ...x500].forEach((entry: any) => {
      const name = entry.datafield?.[0]?.subfield?.find((s: any) => s.code === 'a')?._;
      if (name) names.push(name);
    });

    return names;
  }

  private buildDescription(item: any): string {
    const parts: string[] = [];

    if (item.birthDate) parts.push(`b. ${item.birthDate}`);
    if (item.deathDate) parts.push(`d. ${item.deathDate}`);
    if (item.nametype) parts.push(item.nametype);

    return parts.join(', ');
  }
}