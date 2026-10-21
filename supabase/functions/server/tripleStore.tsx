/**
 * 🗄️ TRIPLE STORE INTEGRATION
 * Connect MOON to external triple stores (Fuseki, Blazegraph, GraphDB)
 * Provides SPARQL endpoint and persistent RDF storage
 */

import * as jsonld from "npm:jsonld@9.0.0";
import { Writer as N3Writer } from "npm:n3@2.0.1";

export interface TripleStoreConfig {
  type: 'fuseki' | 'blazegraph' | 'graphdb';
  endpoint: string; // SPARQL endpoint URL
  updateEndpoint?: string; // SPARQL update endpoint (if different)
  graphStore?: string; // Graph Store Protocol endpoint
  dataset?: string; // Dataset name (for Fuseki)
  repository?: string; // Repository name (for GraphDB)
  auth?: {
    username: string;
    password: string;
  };
}

/**
 * Upload JSON-LD record to triple store
 * 
 * Flow:
 * 1. Convert JSON-LD to N-Quads using jsonld.js
 * 2. POST to Graph Store Protocol endpoint
 * 3. Return status
 */
export async function uploadToTripleStore(
  document: any,
  graphUri: string,
  config: TripleStoreConfig
): Promise<{ success: boolean; message: string }> {
  try {
    // Convert JSON-LD to N-Quads
    const nquads = await jsonld.toRDF(document, {
      format: 'application/n-quads'
    });

    // Determine endpoint based on triple store type
    const uploadEndpoint = getGraphStoreEndpoint(config, graphUri);

    // Upload to triple store
    const headers: Record<string, string> = {
      'Content-Type': 'application/n-quads'
    };

    if (config.auth) {
      const authString = btoa(`${config.auth.username}:${config.auth.password}`);
      headers['Authorization'] = `Basic ${authString}`;
    }

    const response = await fetch(uploadEndpoint, {
      method: 'PUT', // PUT replaces graph, POST appends
      headers,
      body: nquads
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Triple store upload failed: ${response.status} - ${errorText}`);
    }

    console.log(`[MOON] Uploaded to triple store: ${graphUri}`);

    return {
      success: true,
      message: `Successfully uploaded to ${config.type}`
    };
  } catch (error) {
    console.error('[MOON] Triple store upload error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Query triple store using SPARQL
 */
export async function querySparql(
  query: string,
  config: TripleStoreConfig
): Promise<any> {
  try {
    const sparqlEndpoint = config.endpoint;

    const headers: Record<string, string> = {
      'Accept': 'application/sparql-results+json'
    };

    if (config.auth) {
      const authString = btoa(`${config.auth.username}:${config.auth.password}`);
      headers['Authorization'] = `Basic ${authString}`;
    }

    const url = new URL(sparqlEndpoint);
    url.searchParams.set('query', query);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SPARQL query failed: ${response.status} - ${errorText}`);
    }

    const results = await response.json();
    return results;
  } catch (error) {
    console.error('[MOON] SPARQL query error:', error);
    throw error;
  }
}

/**
 * Execute SPARQL UPDATE (INSERT, DELETE)
 */
export async function updateSparql(
  updateQuery: string,
  config: TripleStoreConfig
): Promise<{ success: boolean; message: string }> {
  try {
    const updateEndpoint = config.updateEndpoint || config.endpoint;

    const headers: Record<string, string> = {
      'Content-Type': 'application/sparql-update'
    };

    if (config.auth) {
      const authString = btoa(`${config.auth.username}:${config.auth.password}`);
      headers['Authorization'] = `Basic ${authString}`;
    }

    const response = await fetch(updateEndpoint, {
      method: 'POST',
      headers,
      body: updateQuery
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SPARQL update failed: ${response.status} - ${errorText}`);
    }

    return {
      success: true,
      message: 'SPARQL update successful'
    };
  } catch (error) {
    console.error('[MOON] SPARQL update error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Update failed'
    };
  }
}

/**
 * Delete graph from triple store
 */
export async function deleteGraph(
  graphUri: string,
  config: TripleStoreConfig
): Promise<{ success: boolean; message: string }> {
  try {
    const updateQuery = `DROP GRAPH <${graphUri}>`;
    return await updateSparql(updateQuery, config);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Delete failed'
    };
  }
}

/**
 * Sync MOON record to triple store
 * Called automatically when records are saved
 */
export async function syncRecordToTripleStore(
  recordId: string,
  document: any,
  config: TripleStoreConfig
): Promise<{ success: boolean; message: string }> {
  try {
    // Use record URI as graph URI
    const graphUri = extractWorkUri(document) || `https://moon.org/record/${recordId}`;

    // Upload document as named graph
    const result = await uploadToTripleStore(document, graphUri, config);

    if (result.success) {
      console.log(`[MOON] Synced record ${recordId} to triple store`);
    }

    return result;
  } catch (error) {
    console.error('[MOON] Sync to triple store error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Sync failed'
    };
  }
}

/**
 * Federated SPARQL query across MOON and external triple store
 */
export async function federatedQuery(
  query: string,
  config: TripleStoreConfig
): Promise<any> {
  // This would use SPARQL 1.1 Federation (SERVICE keyword)
  // Example:
  // SELECT ?work ?title WHERE {
  //   SERVICE <http://fuseki:3030/moon/sparql> {
  //     ?work a bf:Work .
  //     ?work bf:title ?titleNode .
  //     ?titleNode bf:mainTitle ?title .
  //   }
  // }
  
  return await querySparql(query, config);
}

// Helper functions

function getGraphStoreEndpoint(config: TripleStoreConfig, graphUri: string): string {
  if (config.graphStore) {
    return `${config.graphStore}?graph=${encodeURIComponent(graphUri)}`;
  }

  // Construct based on triple store type
  switch (config.type) {
    case 'fuseki':
      return `${config.endpoint.replace('/sparql', '/data')}?graph=${encodeURIComponent(graphUri)}`;
    
    case 'blazegraph':
      return `${config.endpoint}?context-uri=${encodeURIComponent(graphUri)}`;
    
    case 'graphdb':
      return `${config.endpoint.replace('/sparql', '/statements')}?context=${encodeURIComponent(graphUri)}`;
    
    default:
      throw new Error(`Unknown triple store type: ${config.type}`);
  }
}

function extractWorkUri(document: any): string | null {
  if (!document['@graph']) return null;
  
  const workNode = document['@graph'].find((node: any) => 
    node['@type']?.includes('bf:Work') || 
    node['@type']?.includes('http://id.loc.gov/ontologies/bibframe/Work')
  );
  
  return workNode?.['@id'] || null;
}

/**
 * EXAMPLE CONFIGURATIONS
 */

export const EXAMPLE_FUSEKI_CONFIG: TripleStoreConfig = {
  type: 'fuseki',
  endpoint: 'http://localhost:3030/moon/sparql',
  updateEndpoint: 'http://localhost:3030/moon/update',
  graphStore: 'http://localhost:3030/moon/data',
  dataset: 'moon',
  auth: {
    username: 'admin',
    password: 'admin'
  }
};

export const EXAMPLE_BLAZEGRAPH_CONFIG: TripleStoreConfig = {
  type: 'blazegraph',
  endpoint: 'http://localhost:9999/blazegraph/sparql',
  auth: undefined
};

export const EXAMPLE_GRAPHDB_CONFIG: TripleStoreConfig = {
  type: 'graphdb',
  endpoint: 'http://localhost:7200/repositories/moon',
  repository: 'moon',
  auth: {
    username: 'admin',
    password: 'admin'
  }
};

/**
 * EXAMPLE SPARQL QUERIES
 */

export const EXAMPLE_QUERIES = {
  // List all Works
  listWorks: `
    PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
    
    SELECT ?work ?title
    WHERE {
      ?work a bf:Work .
      ?work bf:title ?titleNode .
      ?titleNode bf:mainTitle ?title .
    }
    LIMIT 100
  `,

  // Find works by author
  findByAuthor: (authorName: string) => `
    PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?work ?title ?author
    WHERE {
      ?work a bf:Work .
      ?work bf:contribution ?contribution .
      ?contribution bf:agent ?agent .
      ?agent rdfs:label ?author .
      FILTER(CONTAINS(LCASE(?author), LCASE("${authorName}")))
      
      ?work bf:title ?titleNode .
      ?titleNode bf:mainTitle ?title .
    }
  `,

  // Get complete record as JSON-LD
  getRecordAsJsonLd: (workUri: string) => `
    PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
    
    CONSTRUCT {
      ?s ?p ?o .
    }
    WHERE {
      GRAPH <${workUri}> {
        ?s ?p ?o .
      }
    }
  `,

  // Count records by type
  countByType: `
    PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
    
    SELECT ?type (COUNT(?s) as ?count)
    WHERE {
      ?s a ?type .
      FILTER(STRSTARTS(STR(?type), "http://id.loc.gov/ontologies/bibframe/"))
    }
    GROUP BY ?type
    ORDER BY DESC(?count)
  `
};
