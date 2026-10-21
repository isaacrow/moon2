// AfIqa - Internal Authority Layer (Moon's own authority system)
import type { AuthoritySearchResult } from './types';

export class AfiqaService {
  private localAuthorities: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Example local authorities
    this.localAuthorities.set('afiqa:1', {
      id: 'afiqa:1',
      label: 'Local Author Example',
      birth: '1950',
      description: 'Local cataloging authority',
      uri: 'http://moon.library/authorities/afiqa:1'
    });
  }

  async search(query: string): Promise<AuthoritySearchResult[]> {
    if (!query || query.trim().length === 0) return [];

    const results: AuthoritySearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    this.localAuthorities.forEach((authority, id) => {
      if (authority.label.toLowerCase().includes(lowerQuery)) {
        results.push({
          source: 'AfIqa' as const,
          id: authority.id,
          label: authority.label,
          description: authority.description || 'Local authority',
          uri: authority.uri,
          score: 0.8
        });
      }
    });

    return results;
  }

  async getPersonDetails(id: string): Promise<any> {
    return this.localAuthorities.get(id) || null;
  }

  async createAuthority(data: {
    label: string;
    birth?: string;
    death?: string;
    description?: string;
    identifiers?: any;
  }): Promise<string> {
    const id = `afiqa:${Date.now()}`;
    
    this.localAuthorities.set(id, {
      id,
      label: data.label,
      birth: data.birth,
      death: data.death,
      description: data.description,
      identifiers: data.identifiers,
      uri: `http://moon.library/authorities/${id}`,
      created: new Date().toISOString()
    });

    console.log('[AfIqa] Created local authority:', id);
    return id;
  }

  async linkExternalAuthority(afiqaId: string, externalUri: string, source: string) {
    const authority = this.localAuthorities.get(afiqaId);
    if (!authority) return;

    if (!authority.externalLinks) {
      authority.externalLinks = [];
    }

    authority.externalLinks.push({
      source,
      uri: externalUri,
      linkedAt: new Date().toISOString()
    });

    console.log(`[AfIqa] Linked ${afiqaId} to ${source}: ${externalUri}`);
  }

  getAllAuthorities(): any[] {
    return Array.from(this.localAuthorities.values());
  }
}
