/**
 * 🌕 MOON RECORDS API
 * Complete Linked Data records management for MOON system
 * Shared by both Moon Engine (editor) and Moon OPAC (public site)
 */

import * as db from "./db.tsx";
import * as jsonld from "npm:jsonld@9.0.0";
import { Writer as N3Writer, Parser as N3Parser, DataFactory } from "npm:n3@2.0.1";
const { quad, namedNode, literal } = DataFactory;

// BIBFRAME 2.0 Context
export const BIBFRAME_CONTEXT = "https://id.loc.gov/ontologies/bibframe.jsonld";

export interface MoonRecord {
  id: string;
  uri: string;
  title: string;
  document: any; // Full JSON-LD document with @context and @graph
  metadata: {
    created: string;
    modified: string;
    creator?: string;
    status?: 'draft' | 'published' | 'archived';
    version?: number;
  };
  workUri?: string;
  instanceUri?: string;
  itemUri?: string;
}

/**
 * Generate a permanent URI for a record
 */
export function generateRecordURI(id: string, baseUrl = 'https://moon.org'): string {
  return `${baseUrl}/record/${id}`;
}

/**
 * Generate a unique UUID for records
 */
export function generateRecordId(): string {
  return crypto.randomUUID();
}

/**
 * Validate JSON-LD structure with BIBFRAME semantic validation
 */
export function validateJSONLD(document: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Must have @context
  if (!document['@context']) {
    errors.push('Missing @context');
  }

  // Must have @graph
  if (!document['@graph'] || !Array.isArray(document['@graph'])) {
    errors.push('Missing or invalid @graph array');
  }

  // Each node must have @id and @type
  if (document['@graph']) {
    document['@graph'].forEach((node: any, index: number) => {
      if (!node['@id']) {
        errors.push(`Node at index ${index} missing @id`);
      }
      if (!node['@type']) {
        errors.push(`Node at index ${index} missing @type`);
      }
      
      // Semantic validation for BIBFRAME entities
      const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      
      // bf:Work domain checks
      if (types.some(t => t === 'bf:Work' || t === 'http://id.loc.gov/ontologies/bibframe/Work')) {
        if (node['bf:contribution']) {
          const contributions = Array.isArray(node['bf:contribution']) ? node['bf:contribution'] : [node['bf:contribution']];
          contributions.forEach((contrib: any, cIdx: number) => {
            if (contrib['@id'] && !contrib['@type']) {
              errors.push(`bf:Work contribution at index ${cIdx} must reference a bf:Contribution with @type`);
            }
            if (contrib['@type'] && !contrib['@type'].includes('bf:Contribution') && 
                !contrib['@type'].includes('http://id.loc.gov/ontologies/bibframe/Contribution')) {
              errors.push(`bf:Work contribution at index ${cIdx} must be of type bf:Contribution`);
            }
          });
        }
      }
      
      // bf:Contribution range checks
      if (types.some(t => t === 'bf:Contribution' || t === 'http://id.loc.gov/ontologies/bibframe/Contribution')) {
        if (node['bf:agent']) {
          const agents = Array.isArray(node['bf:agent']) ? node['bf:agent'] : [node['bf:agent']];
          agents.forEach((agent: any, aIdx: number) => {
            if (typeof agent === 'string' || (agent['@value'])) {
              errors.push(`bf:Contribution agent at index ${aIdx} must be a URI reference, not a literal`);
            }
            if (agent['@id'] && !agent['@type']) {
              errors.push(`bf:Contribution agent at index ${aIdx} must reference a bf:Agent with @type`);
            }
          });
        }
      }
      
      // Authority entity validation (VIAF, LC, Wikidata references)
      if (types.some(t => t === 'bf:Agent' || t === 'bf:Person' || t === 'bf:Organization' ||
                         t.includes('Agent') || t.includes('Person') || t.includes('Organization'))) {
        if (!node['rdfs:label'] && !node['http://www.w3.org/2000/01/rdf-schema#label']) {
          errors.push(`Authority entity at index ${index} (${node['@id']}) must have rdfs:label`);
        }
        // Check for authority URIs
        if (node['@id']) {
          const id = node['@id'];
          const isAuthority = id.includes('viaf.org') || id.includes('id.loc.gov') || id.includes('wikidata.org');
          if (!isAuthority && (types.some(t => t.includes('Agent') || t.includes('Person')))) {
            // Warning, not error - internal agents are allowed
            console.warn(`Entity ${id} is not linked to external authority (VIAF/LC/Wikidata)`);
          }
        }
      }
    });
  }

  // Must contain at least one bf:Work
  const hasWork = document['@graph']?.some((node: any) => 
    node['@type']?.includes('bf:Work') || node['@type']?.includes('http://id.loc.gov/ontologies/bibframe/Work')
  );
  if (!hasWork) {
    errors.push('Document must contain at least one bf:Work');
  }

  // Must contain at least one bf:Instance
  const hasInstance = document['@graph']?.some((node: any) => 
    node['@type']?.includes('bf:Instance') || node['@type']?.includes('http://id.loc.gov/ontologies/bibframe/Instance')
  );
  if (!hasInstance) {
    errors.push('Document must contain at least one bf:Instance');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Extract Work URI from document
 */
export function extractWorkURI(document: any): string | undefined {
  const workNode = document['@graph']?.find((node: any) => 
    node['@type']?.includes('bf:Work') || node['@type']?.includes('http://id.loc.gov/ontologies/bibframe/Work')
  );
  return workNode?.['@id'];
}

/**
 * Extract Instance URI from document
 */
export function extractInstanceURI(document: any): string | undefined {
  const instanceNode = document['@graph']?.find((node: any) => 
    node['@type']?.includes('bf:Instance') || node['@type']?.includes('http://id.loc.gov/ontologies/bibframe/Instance')
  );
  return instanceNode?.['@id'];
}

/**
 * Extract Item URI from document
 */
export function extractItemURI(document: any): string | undefined {
  const itemNode = document['@graph']?.find((node: any) => 
    node['@type']?.includes('bf:Item') || node['@type']?.includes('http://id.loc.gov/ontologies/bibframe/Item')
  );
  return itemNode?.['@id'];
}

/**
 * Extract title from BIBFRAME document
 */
export function extractTitle(document: any): string {
  const workNode = document['@graph']?.find((node: any) => 
    node['@type']?.includes('bf:Work') || node['@type']?.includes('http://id.loc.gov/ontologies/bibframe/Work')
  );
  
  if (workNode) {
    // Try bf:title with mainTitle
    const titleNode = workNode['bf:title']?.[0];
    if (titleNode?.['bf:mainTitle']?.[0]?.['@value']) {
      return titleNode['bf:mainTitle'][0]['@value'];
    }
    
    // Try direct mainTitle
    if (workNode['bf:mainTitle']?.[0]?.['@value']) {
      return workNode['bf:mainTitle'][0]['@value'];
    }
  }
  
  return 'Untitled';
}

/**
 * Save a MOON record
 */
export async function saveMoonRecord(record: Partial<MoonRecord>): Promise<MoonRecord> {
  const id = record.id || generateRecordId();
  const uri = record.uri || generateRecordURI(id);
  
  if (!record.document) {
    throw new Error('Document is required');
  }

  // Validate JSON-LD
  const validation = validateJSONLD(record.document);
  if (!validation.valid) {
    throw new Error(`Invalid JSON-LD: ${validation.errors.join(', ')}`);
  }

  // Ensure @context is present
  if (!record.document['@context']) {
    record.document['@context'] = BIBFRAME_CONTEXT;
  }

  const now = new Date().toISOString();
  
  const moonRecord: MoonRecord = {
    id,
    uri,
    title: record.title || extractTitle(record.document),
    document: record.document,
    metadata: {
      created: record.metadata?.created || now,
      modified: now,
      creator: record.metadata?.creator,
      status: record.metadata?.status || 'draft',
      version: (record.metadata?.version || 0) + 1
    },
    workUri: extractWorkURI(record.document),
    instanceUri: extractInstanceURI(record.document),
    itemUri: extractItemURI(record.document)
  };

  // Save to records table
  await db.upsert('records', {
    id,
    uri,
    title: moonRecord.title,
    resource_type: 'Work',
    status: moonRecord.metadata.status || 'draft',
    graph_jsonld: record.document,
    checksum: '',
    work_uri: moonRecord.workUri || null,
    instance_uri: moonRecord.instanceUri || null,
    item_uri: moonRecord.itemUri || null,
    created_by: moonRecord.metadata.creator || null,
    last_modified_by: moonRecord.metadata.creator || null,
    version_number: moonRecord.metadata.version || 1,
    cataloger: moonRecord.metadata.creator || null,
  }, 'id');

  console.log(`[MOON] Saved record ${id} - "${moonRecord.title}"`);
  
  return moonRecord;
}

/**
 * Get a MOON record by ID
 */
export async function getMoonRecord(id: string): Promise<MoonRecord | null> {
  try {
    const row = await db.getById<any>('records', id);
    if (!row || row.deleted) return null;
    // Convert from DB row to MoonRecord format
    return {
      id: row.id,
      uri: row.uri,
      title: row.title,
      document: row.graph_jsonld,
      metadata: {
        created: row.created_at,
        modified: row.updated_at,
        creator: row.created_by,
        status: row.status,
        version: row.version_number,
      },
      workUri: row.work_uri,
      instanceUri: row.instance_uri,
      itemUri: row.item_uri,
    };
  } catch (error) {
    console.error(`[MOON] Error loading record ${id}:`, error);
    return null;
  }
}

/**
 * List all MOON records
 */
export async function listMoonRecords(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ records: MoonRecord[]; total: number }> {
  try {
    const filters: Record<string, any> = { deleted: false };
    if (options?.status) filters.status = options.status;

    const rows = await db.query<any>('records', {
      filters,
      order: { column: 'updated_at', ascending: false },
      limit: options?.limit || 100,
      offset: options?.offset || 0,
    });

    const records: MoonRecord[] = rows.map((row: any) => ({
      id: row.id,
      uri: row.uri,
      title: row.title,
      document: row.graph_jsonld,
      metadata: {
        created: row.created_at,
        modified: row.updated_at,
        creator: row.created_by,
        status: row.status,
        version: row.version_number,
      },
      workUri: row.work_uri,
      instanceUri: row.instance_uri,
      itemUri: row.item_uri,
    }));

    const total = await db.count('records', { deleted: false });

    return { records, total };
  } catch (error) {
    console.error('[MOON] Error listing records:', error);
    return { records: [], total: 0 };
  }
}

/**
 * Delete a MOON record
 */
export async function deleteMoonRecord(id: string): Promise<boolean> {
  try {
    await db.update('records', id, {
      deleted: true,
      deleted_at: new Date().toISOString(),
      status: 'archived',
    });
    console.log(`[MOON] Deleted record ${id}`);
    return true;
  } catch (error) {
    console.error(`[MOON] Error deleting record ${id}:`, error);
    return false;
  }
}

/**
 * Search MOON records
 */
export async function searchMoonRecords(query: string): Promise<MoonRecord[]> {
  try {
    const rows = await db.search<any>('records', 'title', query, {
      filters: { deleted: false },
      order: { column: 'updated_at', ascending: false },
      limit: 50,
    });

    return rows.map((row: any) => ({
      id: row.id,
      uri: row.uri,
      title: row.title,
      document: row.graph_jsonld,
      metadata: {
        created: row.created_at,
        modified: row.updated_at,
        creator: row.created_by,
        status: row.status,
        version: row.version_number,
      },
      workUri: row.work_uri,
      instanceUri: row.instance_uri,
      itemUri: row.item_uri,
    }));
  } catch (error) {
    console.error('[MOON] Error searching records:', error);
    return [];
  }
}

/**
 * 🚀 REAL RDF CONVERSION USING jsonld.js + N3.js
 * 
 * Proper flow:
 * JSON-LD → jsonld.toRDF() → N3.Writer() → Turtle/N-Triples
 */

/**
 * Convert JSON-LD to RDF N-Quads (intermediate format)
 */
export async function convertToRDF(document: any): Promise<any> {
  try {
    // Use jsonld.js to properly convert JSON-LD to RDF dataset
    const nquads = await jsonld.toRDF(document, {
      format: 'application/n-quads'
    });
    return nquads;
  } catch (error) {
    console.error('[MOON] RDF conversion error:', error);
    throw new Error(`Failed to convert to RDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert JSON-LD to Turtle using real RDF libraries
 */
export async function convertToTurtle(document: any): Promise<string> {
  try {
    // Step 1: Convert JSON-LD to N-Quads using jsonld.js
    const nquads = await jsonld.toRDF(document, {
      format: 'application/n-quads'
    });

    // Step 2: Parse N-Quads into N3 store
    const parser = new N3Parser({ format: 'N-Quads' });
    const quads = parser.parse(nquads);

    // Step 3: Write as Turtle using N3.js Writer
    const writer = new N3Writer({ 
      format: 'Turtle',
      prefixes: {
        bf: 'http://id.loc.gov/ontologies/bibframe/',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        owl: 'http://www.w3.org/2002/07/owl#',
        skos: 'http://www.w3.org/2004/02/skos/core#',
        dcterms: 'http://purl.org/dc/terms/',
        schema: 'http://schema.org/',
      }
    });

    quads.forEach(quad => writer.addQuad(quad));

    return new Promise((resolve, reject) => {
      writer.end((error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    console.error('[MOON] Turtle conversion error:', error);
    throw new Error(`Failed to convert to Turtle: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert JSON-LD to N-Triples using real RDF libraries
 */
export async function convertToNTriples(document: any): Promise<string> {
  try {
    // Step 1: Convert JSON-LD to N-Quads using jsonld.js
    const nquads = await jsonld.toRDF(document, {
      format: 'application/n-quads'
    });

    // Step 2: Parse and re-serialize as N-Triples
    const parser = new N3Parser({ format: 'N-Quads' });
    const quads = parser.parse(nquads);

    const writer = new N3Writer({ format: 'N-Triples' });
    quads.forEach(quad => writer.addQuad(quad));

    return new Promise((resolve, reject) => {
      writer.end((error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    console.error('[MOON] N-Triples conversion error:', error);
    throw new Error(`Failed to convert to N-Triples: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract RDF triples from JSON-LD document for graph visualization
 * Returns array of { subject, predicate, object } triples
 */
export async function extractTriples(document: any): Promise<Array<{
  subject: string;
  predicate: string;
  object: string;
  objectType: 'uri' | 'literal';
}>> {
  try {
    // Convert to N-Quads first
    const nquads = await jsonld.toRDF(document, {
      format: 'application/n-quads'
    });

    // Parse into structured triples
    const parser = new N3Parser({ format: 'N-Quads' });
    const quads = parser.parse(nquads);

    return quads.map(quad => ({
      subject: quad.subject.value,
      predicate: quad.predicate.value,
      object: quad.object.value,
      objectType: quad.object.termType === 'Literal' ? 'literal' : 'uri'
    }));
  } catch (error) {
    console.error('[MOON] Triple extraction error:', error);
    return [];
  }
}