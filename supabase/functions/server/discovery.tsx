/**
 * 🔍 DISCOVERY LAYER 2.0 — FEDERATED
 * Faceted search and entity-based browsing for end users
 * Now searches internal catalog AND external Linked Data sources
 * (LOC, VIAF, Open Library) via the provider registry.
 */

import * as db from "./db.tsx";
const kv = { set: db.kvSet, get: db.kvGet, del: db.kvDel, getByPrefix: db.kvGetByPrefix };
import {
  federatedSearch,
  getInternalRecords,
  getSourceMetadata,
  type NormalizedRecord,
  type SourceId,
  type SourceMeta,
} from "./discoveryProviders.tsx";

export interface Facet {
  field: string;
  label: string;
  values: Array<{
    value: string;
    label: string;
    count: number;
  }>;
}

export interface DiscoveryQuery {
  q?: string;               // Full-text search
  facets?: {                // Facet filters
    type?: string[];        // Work, Instance, Item
    language?: string[];
    format?: string[];
    subject?: string[];
    contributor?: string[];
    source?: SourceId[];    // Filter by source (internal, loc, viaf, openlibrary)
    date?: {
      from?: string;
      to?: string;
    };
  };
  sort?: 'relevance' | 'title' | 'date' | 'contributor';
  page?: number;
  pageSize?: number;
}

export interface DiscoveryResults {
  total: number;
  results: any[];
  facets: Facet[];
  page: number;
  pageSize: number;
  sources: SourceMeta[];    // Available source metadata for UI
}

/**
 * Fetch all records from ALL storage systems and normalize to a common format
 * Now delegates to the federated provider registry.
 */
async function getAllNormalizedRecords(query?: string, sourcesFilter?: SourceId[]): Promise<NormalizedRecord[]> {
  return federatedSearch(query || '', { sources: sourcesFilter });
}

/**
 * Execute faceted discovery search
 */
export async function discover(query: DiscoveryQuery): Promise<DiscoveryResults> {
  // Determine which sources to search
  const sourcesFilter = query.facets?.source;

  // Get all records from federated providers
  let records = await getAllNormalizedRecords(query.q, sourcesFilter);

  // Full-text search (additional client-side filtering for internal records)
  if (query.q) {
    const lowerQuery = query.q.toLowerCase();
    records = records.filter((record: any) => {
      // Search in title
      if (record.title?.toLowerCase().includes(lowerQuery)) return true;
      // Search in document
      const searchable = JSON.stringify(record.document || {}).toLowerCase();
      return searchable.includes(lowerQuery);
    });
  }

  // Apply facet filters
  if (query.facets) {
    // Type filter
    if (query.facets.type && query.facets.type.length > 0) {
      records = records.filter((record: any) => {
        const types = extractTypes(record.document);
        return query.facets!.type!.some(t => types.includes(t));
      });
    }

    // Language filter
    if (query.facets.language && query.facets.language.length > 0) {
      records = records.filter((record: any) => {
        const languages = extractLanguages(record.document);
        return query.facets!.language!.some(lang => languages.includes(lang));
      });
    }

    // Contributor filter
    if (query.facets.contributor && query.facets.contributor.length > 0) {
      records = records.filter((record: any) => {
        const contributors = extractContributors(record.document);
        return query.facets!.contributor!.some(c => contributors.includes(c));
      });
    }

    // Date range filter
    if (query.facets.date) {
      records = records.filter((record: any) => {
        const date = extractDate(record.document);
        if (!date) return false;
        
        if (query.facets!.date!.from && date < query.facets!.date!.from) {
          return false;
        }
        if (query.facets!.date!.to && date > query.facets!.date!.to) {
          return false;
        }
        return true;
      });
    }
  }

  // Sort
  records = sortRecords(records, query.sort || 'relevance');

  // Calculate facets from filtered results (includes source facet)
  const facets = calculateFacets(records);

  // Pagination
  const page = query.page || 1;
  const pageSize = query.pageSize || 20;
  const start = (page - 1) * pageSize;
  const paginatedRecords = records.slice(start, start + pageSize);

  return {
    total: records.length,
    results: paginatedRecords,
    facets,
    page,
    pageSize,
    sources: getSourceMetadata(),
  };
}

/**
 * Browse by entity - get all works by an agent/subject/etc
 * Only searches internal catalog for entity browsing
 */
export async function browseByEntity(
  entityType: 'agent' | 'subject' | 'language' | 'place',
  entityUri: string
): Promise<any[]> {
  const records = await getInternalRecords();
  
  return records.filter((record: any) => {
    return recordLinksToEntity(record.document, entityType, entityUri);
  });
}

/**
 * Work clustering - group expressions/instances by FRBR Work
 */
export async function getWorkCluster(workUri: string): Promise<{
  work: any;
  instances: any[];
  items: any[];
  expressions?: any[];
}> {
  const allRecords = await getInternalRecords();
  const work = allRecords.find((record: any) => {
    if (!record?.document?.['@graph']) return false;
    return record.document['@graph'].some((node: any) => 
      node['@id'] === workUri && 
      (node['@type']?.includes('bf:Work') || node['@type']?.includes('http://id.loc.gov/ontologies/bibframe/Work'))
    );
  });

  if (!work) {
    return { work: null, instances: [], items: [] };
  }

  // Find all Instances of this Work
  const instances: any[] = [];
  const items: any[] = [];

  for (const record of allRecords) {
    try {
      if (!record?.document?.['@graph']) continue;

      for (const node of record.document['@graph']) {
        // Check if Instance
        if (node['@type']?.includes('bf:Instance') || node['@type']?.includes('http://id.loc.gov/ontologies/bibframe/Instance')) {
          const instanceOf = node['bf:instanceOf'] || node['http://id.loc.gov/ontologies/bibframe/instanceOf'];
          if (instanceOf?.['@id'] === workUri || instanceOf === workUri) {
            instances.push(node);
          }
        }

        // Check if Item
        if (node['@type']?.includes('bf:Item') || node['@type']?.includes('http://id.loc.gov/ontologies/bibframe/Item')) {
          // Items link to Instances, which link to Works
          // Would need to check Instance first
          items.push(node);
        }
      }
    } catch {
      continue;
    }
  }

  return {
    work,
    instances,
    items
  };
}

/**
 * Authority drill-down - get entity page with all linked resources
 */
export async function getAuthorityPage(authorityUri: string): Promise<{
  authority: any;
  works: any[];
  relatedAuthorities: any[];
  statistics: {
    workCount: number;
    instanceCount: number;
    dateRange?: { from: string; to: string };
  };
}> {
  // Get authority record
  const authorities = await kv.getByPrefix('moon:authority:');
  const authority = authorities
    .map((a: string) => {
      try {
        return JSON.parse(a);
      } catch {
        return null;
      }
    })
    .find((auth: any) => auth?.uri === authorityUri);

  // Get all works linked to this authority
  const works = await browseByEntity('agent', authorityUri);

  // Calculate statistics
  const statistics = {
    workCount: works.length,
    instanceCount: works.reduce((sum, work) => {
      const instances = work.document?.['@graph']?.filter((n: any) => 
        n['@type']?.includes('bf:Instance')
      ) || [];
      return sum + instances.length;
    }, 0),
    dateRange: calculateDateRange(works)
  };

  return {
    authority,
    works,
    relatedAuthorities: [],
    statistics
  };
}

/**
 * Subject hierarchy browsing
 */
export async function getSubjectHierarchy(subjectUri: string): Promise<{
  subject: any;
  broader: any[];
  narrower: any[];
  related: any[];
  works: any[];
}> {
  // This would integrate with LCSH/FAST hierarchies
  // For now, return basic structure
  const works = await browseByEntity('subject', subjectUri);

  return {
    subject: { uri: subjectUri },
    broader: [],
    narrower: [],
    related: [],
    works
  };
}

// ===== HELPER FUNCTIONS =====

function extractTypes(document: any): string[] {
  if (!document?.['@graph']) return [];
  
  const types = new Set<string>();
  for (const node of document['@graph']) {
    if (node['@type']) {
      const nodeTypes = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      nodeTypes.forEach((t: string) => {
        if (t.includes('Work')) types.add('Work');
        if (t.includes('Instance')) types.add('Instance');
        if (t.includes('Item')) types.add('Item');
      });
    }
  }
  
  return Array.from(types);
}

function extractLanguages(document: any): string[] {
  if (!document?.['@graph']) return [];
  
  const languages = new Set<string>();
  for (const node of document['@graph']) {
    const lang = node['bf:language'] || node['http://id.loc.gov/ontologies/bibframe/language'];
    if (lang) {
      const langUri = typeof lang === 'object' ? lang['@id'] : lang;
      if (langUri) languages.add(langUri);
    }
  }
  
  return Array.from(languages);
}

function extractContributors(document: any): string[] {
  if (!document?.['@graph']) return [];
  
  const contributors = new Set<string>();
  for (const node of document['@graph']) {
    if (node['@type']?.includes('Contribution')) {
      const agent = node['bf:agent'] || node['http://id.loc.gov/ontologies/bibframe/agent'];
      if (agent) {
        const agentUri = typeof agent === 'object' ? agent['@id'] : agent;
        if (agentUri) contributors.add(agentUri);
      }
    }
  }
  
  return Array.from(contributors);
}

function extractDate(document: any): string | null {
  if (!document?.['@graph']) return null;
  
  for (const node of document['@graph']) {
    if (node['@type']?.includes('ProvisionActivity') || node['@type']?.includes('Publication')) {
      const date = node['bf:date'] || node['http://id.loc.gov/ontologies/bibframe/date'];
      if (date) return date;
    }
  }
  
  return null;
}

function recordLinksToEntity(document: any, entityType: string, entityUri: string): boolean {
  if (!document?.['@graph']) return false;
  
  for (const node of document['@graph']) {
    switch (entityType) {
      case 'agent':
        if (node['@type']?.includes('Contribution')) {
          const agent = node['bf:agent'] || node['http://id.loc.gov/ontologies/bibframe/agent'];
          const agentUri = typeof agent === 'object' ? agent['@id'] : agent;
          if (agentUri === entityUri) return true;
        }
        break;
      
      case 'subject':
        const subject = node['bf:subject'] || node['http://id.loc.gov/ontologies/bibframe/subject'];
        if (subject) {
          const subjectUri = typeof subject === 'object' ? subject['@id'] : subject;
          if (subjectUri === entityUri) return true;
        }
        break;
      
      case 'language':
        const lang = node['bf:language'] || node['http://id.loc.gov/ontologies/bibframe/language'];
        if (lang) {
          const langUri = typeof lang === 'object' ? lang['@id'] : lang;
          if (langUri === entityUri) return true;
        }
        break;
    }
  }
  
  return false;
}

function calculateFacets(records: any[]): Facet[] {
  const facets: Facet[] = [];

  // Source facet (NEW — shows which sources returned results)
  const sourceCounts: Record<string, number> = {};
  records.forEach(record => {
    const src = record.source || 'internal';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });
  const sourceLabels: Record<string, string> = {
    internal: 'Local Catalog',
    loc: 'Library of Congress',
    viaf: 'VIAF',
    openlibrary: 'Open Library',
    wikidata: 'Wikidata',
    worldcat: 'WorldCat',
    fast: 'FAST Subject Headings',
    isbndb: 'ISBNdb',
    googlebooks: 'Google Books',
    crossref: 'CrossRef',
    bnf: 'BNF (Bibliothèque nationale de France)',
  };
  facets.push({
    field: 'source',
    label: 'Source',
    values: Object.entries(sourceCounts).map(([value, count]) => ({
      value,
      label: sourceLabels[value] || value,
      count,
    })).sort((a, b) => b.count - a.count),
  });

  // Type facet
  const typeCounts: Record<string, number> = {};
  records.forEach(record => {
    const types = extractTypes(record.document);
    types.forEach(type => {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
  });
  facets.push({
    field: 'type',
    label: 'Resource Type',
    values: Object.entries(typeCounts).map(([value, count]) => ({
      value,
      label: value,
      count
    })).sort((a, b) => b.count - a.count)
  });

  // Language facet
  const langCounts: Record<string, number> = {};
  records.forEach(record => {
    const languages = extractLanguages(record.document);
    languages.forEach(lang => {
      langCounts[lang] = (langCounts[lang] || 0) + 1;
    });
  });
  facets.push({
    field: 'language',
    label: 'Language',
    values: Object.entries(langCounts).map(([value, count]) => ({
      value,
      label: extractLanguageLabel(value),
      count
    })).sort((a, b) => b.count - a.count).slice(0, 10)
  });

  // Contributor facet
  const contribCounts: Record<string, number> = {};
  records.forEach(record => {
    const contributors = extractContributors(record.document);
    contributors.forEach(contrib => {
      contribCounts[contrib] = (contribCounts[contrib] || 0) + 1;
    });
  });
  facets.push({
    field: 'contributor',
    label: 'Contributor',
    values: Object.entries(contribCounts).map(([value, count]) => ({
      value,
      label: extractContributorLabel(value),
      count
    })).sort((a, b) => b.count - a.count).slice(0, 20)
  });

  return facets;
}

function sortRecords(records: any[], sortBy: string): any[] {
  switch (sortBy) {
    case 'title':
      return records.sort((a, b) => {
        const titleA = extractTitle(a.document) || '';
        const titleB = extractTitle(b.document) || '';
        return titleA.localeCompare(titleB);
      });
    
    case 'date':
      return records.sort((a, b) => {
        const dateA = extractDate(a.document) || '';
        const dateB = extractDate(b.document) || '';
        return dateB.localeCompare(dateA);
      });
    
    case 'contributor':
      return records.sort((a, b) => {
        const contribA = extractContributors(a.document)[0] || '';
        const contribB = extractContributors(b.document)[0] || '';
        return contribA.localeCompare(contribB);
      });
    
    default: // relevance
      return records;
  }
}

function extractTitle(document: any): string | null {
  if (!document?.['@graph']) return null;
  
  for (const node of document['@graph']) {
    if (node['@type']?.includes('Title')) {
      return node['bf:mainTitle'] || node['http://id.loc.gov/ontologies/bibframe/mainTitle'];
    }
  }
  
  return null;
}

function extractLanguageLabel(uri: string): string {
  const match = uri.match(/\/([a-z]{3})$/);
  return match ? match[1].toUpperCase() : uri;
}

function extractContributorLabel(uri: string): string {
  // Would look up from authority table
  return uri.split('/').pop() || uri;
}

function calculateDateRange(works: any[]): { from: string; to: string } | undefined {
  const dates = works
    .map(w => extractDate(w.document))
    .filter(d => d !== null)
    .sort();
  
  if (dates.length === 0) return undefined;
  
  return {
    from: dates[0]!,
    to: dates[dates.length - 1]!
  };
}