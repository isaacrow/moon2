// Authority Hub Service - Merges ALL 5 Sources
import { LocAuthorityService } from './locService';
import { ViafService } from './viafService';
import { WikidataService } from './wikidataService';
import { AfiqaService } from './afiqaService';
import { IsbndbService } from './isbndbService';
import type { 
  UnifiedPerson, 
  AuthoritySearchResult, 
  AuthorityGraphNode,
  AuthorityConnection 
} from './types';

export class AuthorityHubService {
  private loc: LocAuthorityService;
  private viaf: ViafService;
  private wikidata: WikidataService;
  private afiqa: AfiqaService;
  private isbndb: IsbndbService;

  constructor() {
    this.loc = new LocAuthorityService();
    this.viaf = new ViafService();
    this.wikidata = new WikidataService();
    this.afiqa = new AfiqaService();
    this.isbndb = new IsbndbService();
  }

  /**
   * Search all 5 authority sources in parallel
   */
  async searchAll(name: string): Promise<AuthoritySearchResult[]> {
    console.log('[Authority Hub] Searching all sources for:', name);

    const [locResults, viafResults, wikidataResults, afiqaResults, isbndbResults] = await Promise.all([
      this.loc.searchPerson(name).catch((err) => {
        console.warn('[Authority Hub] LOC search failed:', err.message);
        return [];
      }),
      this.viaf.search(name).catch((err) => {
        console.warn('[Authority Hub] VIAF search failed (network/CORS issue):', err.message);
        return [];
      }),
      this.wikidata.search(name).catch((err) => {
        console.warn('[Authority Hub] Wikidata search failed:', err.message);
        return [];
      }),
      this.afiqa.search(name).catch((err) => {
        console.warn('[Authority Hub] AfIqa search failed:', err.message);
        return [];
      }),
      this.isbndb.search(name).catch((err) => {
        console.warn('[Authority Hub] ISBNdb search failed:', err.message);
        return [];
      })
    ]);

    const allResults = [
      ...locResults,
      ...viafResults,
      ...wikidataResults,
      ...afiqaResults,
      ...isbndbResults
    ];

    console.log(`[Authority Hub] Results: LOC(${locResults.length}), VIAF(${viafResults.length}), Wikidata(${wikidataResults.length}), AfIqa(${afiqaResults.length}), ISBNdb(${isbndbResults.length})`);
    console.log(`[Authority Hub] Total: ${allResults.length} results from all sources`);
    return allResults.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  /**
   * Build unified person record from selected result
   */
  async buildUnifiedPerson(result: AuthoritySearchResult): Promise<UnifiedPerson> {
    console.log(`[Authority Hub] Building unified person for ${result.source}:${result.id}`);

    const baseData: UnifiedPerson = {
      id: `${result.source.toLowerCase()}:${result.id}`,
      label: result.label,
      identifiers: {},
      sourceGraph: [],
      metadata: {
        sources: [result.source],
        lastUpdated: new Date().toISOString(),
        confidence: result.score || 0.8
      }
    };

    // Fetch detailed data from primary source
    let detailsData: any = null;
    let image: string | null = null;

    switch (result.source) {
      case 'LOC':
        baseData.identifiers.loc = result.id;
        detailsData = await this.loc.getPersonDetails(result.id);
        break;

      case 'VIAF':
        baseData.identifiers.viaf = result.id;
        detailsData = await this.viaf.getPersonDetails(result.id);
        if (detailsData) {
          const dates = this.viaf.extractBirthDeath(detailsData);
          baseData.birth = dates.birth;
          baseData.death = dates.death;
          baseData.alternateNames = this.viaf.extractAlternateNames(detailsData);
        }
        break;

      case 'Wikidata':
        baseData.identifiers.wikidata = result.id;
        detailsData = await this.wikidata.getEntity(result.id);
        if (detailsData) {
          // Wikidata is BEST for images
          image = this.wikidata.extractImage(detailsData);
          const dates = this.wikidata.extractBirthDeath(detailsData);
          baseData.birth = dates.birth;
          baseData.death = dates.death;
          baseData.occupations = this.wikidata.extractOccupations(detailsData);
          baseData.nationality = this.wikidata.extractNationality(detailsData) || undefined;
          
          // Extract cross-references
          const ids = this.wikidata.extractIdentifiers(detailsData);
          if (ids.loc) baseData.identifiers.loc = ids.loc;
          if (ids.viaf) baseData.identifiers.viaf = ids.viaf;
        }
        break;

      case 'AfIqa':
        baseData.identifiers.afiqa = result.id;
        detailsData = await this.afiqa.getPersonDetails(result.id);
        if (detailsData) {
          baseData.birth = detailsData.birth;
          baseData.death = detailsData.death;
          baseData.description = detailsData.description;
        }
        break;

      case 'ISBNdb':
        baseData.identifiers.isbndb = result.id;
        detailsData = await this.isbndb.getPersonDetails(result.id);
        if (detailsData) {
          // Extract works/books by this author
          const works = this.isbndb.extractWorks(detailsData);
          if (works && works.length > 0) {
            baseData.works = works;
          }
        }
        break;
    }

    // If no image from primary source, try to fetch from linked authorities
    if (!image && baseData.identifiers.wikidata) {
      const wikidataEntity = await this.wikidata.getEntity(baseData.identifiers.wikidata);
      image = this.wikidata.extractImage(wikidataEntity);
    }

    if (image) {
      baseData.image = image;
    }

    // Build source graph
    baseData.sourceGraph = await this.buildSourceGraph(baseData);
    console.log(`[Authority Hub] Built source graph with ${baseData.sourceGraph.length} nodes`);

    return baseData;
  }

  /**
   * Build authority graph showing connections between sources
   */
  private async buildSourceGraph(person: UnifiedPerson): Promise<AuthorityGraphNode[]> {
    console.log('[Authority Hub] Building source graph for identifiers:', person.identifiers);
    const nodes: AuthorityGraphNode[] = [];
    const connections: AuthorityConnection[] = [];

    // Create nodes for each identifier
    if (person.identifiers.loc) {
      nodes.push({
        id: `loc:${person.identifiers.loc}`,
        label: person.label,
        source: 'LOC',
        uri: `http://id.loc.gov/authorities/names/${person.identifiers.loc}`,
        type: 'person',
        connections: []
      });
    }

    if (person.identifiers.viaf) {
      nodes.push({
        id: `viaf:${person.identifiers.viaf}`,
        label: person.label,
        source: 'VIAF',
        uri: `https://viaf.org/viaf/${person.identifiers.viaf}`,
        type: 'person',
        connections: []
      });
    }

    if (person.identifiers.wikidata) {
      nodes.push({
        id: `wikidata:${person.identifiers.wikidata}`,
        label: person.label,
        source: 'Wikidata',
        uri: `https://www.wikidata.org/entity/${person.identifiers.wikidata}`,
        type: 'person',
        connections: []
      });
    }

    if (person.identifiers.afiqa) {
      nodes.push({
        id: `afiqa:${person.identifiers.afiqa}`,
        label: person.label,
        source: 'AfIqa',
        uri: `http://moon.library/authorities/${person.identifiers.afiqa}`,
        type: 'person',
        connections: []
      });
    }

    if (person.identifiers.isbndb) {
      nodes.push({
        id: `isbndb:${person.identifiers.isbndb}`,
        label: person.label,
        source: 'ISBNdb',
        uri: `https://isbndb.com/author/${encodeURIComponent(person.identifiers.isbndb)}`,
        type: 'person',
        connections: []
      });
    }

    // Create connections (sameAs relationships)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const connection: AuthorityConnection = {
          from: nodes[i].id,
          to: nodes[j].id,
          relationship: 'sameAs',
          confidence: 0.9
        };
        connections.push(connection);
        nodes[i].connections.push(connection);
        nodes[j].connections.push(connection);
      }
    }

    return nodes;
  }

  /**
   * Get AfIqa service for direct access
   */
  getAfiqaService(): AfiqaService {
    return this.afiqa;
  }

  /**
   * Get ISBNdb service for direct access
   */
  getIsbndbService(): IsbndbService {
    return this.isbndb;
  }

  /**
   * Create local authority and optionally link to external sources
   */
  async createLocalAuthority(data: {
    label: string;
    birth?: string;
    death?: string;
    description?: string;
    linkToExternal?: {
      loc?: string;
      viaf?: string;
      wikidata?: string;
    };
  }): Promise<string> {
    const afiqaId = await this.afiqa.createAuthority({
      label: data.label,
      birth: data.birth,
      death: data.death,
      description: data.description,
      identifiers: data.linkToExternal
    });

    // Link to external authorities
    if (data.linkToExternal?.loc) {
      await this.afiqa.linkExternalAuthority(afiqaId, `http://id.loc.gov/authorities/names/${data.linkToExternal.loc}`, 'LOC');
    }
    if (data.linkToExternal?.viaf) {
      await this.afiqa.linkExternalAuthority(afiqaId, `https://viaf.org/viaf/${data.linkToExternal.viaf}`, 'VIAF');
    }
    if (data.linkToExternal?.wikidata) {
      await this.afiqa.linkExternalAuthority(afiqaId, `https://www.wikidata.org/entity/${data.linkToExternal.wikidata}`, 'Wikidata');
    }

    return afiqaId;
  }
}

// Singleton instance
export const authorityHub = new AuthorityHubService();
