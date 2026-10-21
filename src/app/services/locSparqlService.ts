// Production LOC SPARQL Service (Frontend)
// Enterprise-level SPARQL query builder

const SPARQL_ENDPOINT = "https://id.loc.gov/sparql";

interface SPARQLBinding {
  type: string;
  value: string;
}

interface SPARQLResult {
  [key: string]: SPARQLBinding;
}

interface SPARQLResponse {
  head: {
    vars: string[];
  };
  results: {
    bindings: SPARQLResult[];
  };
}

// Build SPARQL query for work search
function buildWorkSearchQuery(keyword: string): string {
  return `
  PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

  SELECT ?work ?title
  WHERE {
    ?work a bf:Work ;
          bf:title ?titleNode .
    ?titleNode rdfs:label ?title .
    FILTER(CONTAINS(LCASE(?title), LCASE("${keyword}")))
  }
  LIMIT 20
  `;
}

// Build SPARQL query for duplicate detection
function buildDuplicateQuery(title: string, creator?: string): string {
  const creatorFilter = creator
    ? `FILTER(CONTAINS(LCASE(?creator), LCASE("${creator}")))`
    : '';

  return `
  PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

  SELECT DISTINCT ?work ?title ?creator
  WHERE {
    ?work a bf:Work ;
          bf:title ?titleNode .
    ?titleNode bf:mainTitle ?title .
    
    FILTER(CONTAINS(LCASE(?title), LCASE("${title}")))
    
    OPTIONAL {
      ?work bf:creator ?creatorObj .
      ?creatorObj rdfs:label ?creator .
    }
    
    ${creatorFilter}
  }
  LIMIT 50
  `;
}

// Build SPARQL query for related works
function buildRelatedWorksQuery(workUri: string): string {
  return `
  PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

  SELECT DISTINCT ?relatedWork ?title ?creator
  WHERE {
    <${workUri}> bf:relatedTo ?relatedWork .
    ?relatedWork a bf:Work ;
                 bf:title ?titleObj .
    ?titleObj bf:mainTitle ?title .
    
    OPTIONAL {
      ?relatedWork bf:creator ?creatorObj .
      ?creatorObj rdfs:label ?creator .
    }
  }
  LIMIT 20
  `;
}

// Build SPARQL query for work clustering (FRBR)
function buildClusterQuery(workUri: string): string {
  return `
  PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

  SELECT DISTINCT ?instance ?instanceTitle ?format
  WHERE {
    <${workUri}> bf:hasInstance ?instance .
    ?instance a bf:Instance ;
              bf:title ?titleObj .
    ?titleObj bf:mainTitle ?instanceTitle .
    
    OPTIONAL {
      ?instance bf:format ?format .
    }
  }
  LIMIT 100
  `;
}

// Build SPARQL query for discovery by subject
function buildSubjectDiscoveryQuery(subjectUri: string, limit = 20): string {
  return `
  PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

  SELECT DISTINCT ?work ?title ?creator ?date
  WHERE {
    ?work a bf:Work ;
          bf:subject <${subjectUri}> ;
          bf:title ?titleObj .
    ?titleObj bf:mainTitle ?title .
    
    OPTIONAL {
      ?work bf:creator ?creatorObj .
      ?creatorObj rdfs:label ?creator .
    }
    
    OPTIONAL {
      ?work bf:originDate ?date .
    }
  }
  ORDER BY DESC(?date)
  LIMIT ${limit}
  `;
}

// Build SPARQL query for discovery by creator
function buildCreatorDiscoveryQuery(creatorUri: string, limit = 20): string {
  return `
  PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

  SELECT DISTINCT ?work ?title ?date ?genre
  WHERE {
    ?work a bf:Work ;
          bf:creator <${creatorUri}> ;
          bf:title ?titleObj .
    ?titleObj bf:mainTitle ?title .
    
    OPTIONAL {
      ?work bf:originDate ?date .
    }
    
    OPTIONAL {
      ?work bf:genreForm ?genreObj .
      ?genreObj rdfs:label ?genre .
    }
  }
  ORDER BY DESC(?date)
  LIMIT ${limit}
  `;
}

// Execute SPARQL query
async function runQuery(query: string): Promise<SPARQLResponse> {
  console.log('[SPARQL] Executing query:', query.substring(0, 100) + '...');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(SPARQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/sparql-query",
        Accept: "application/sparql-results+json"
      },
      body: query,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`SPARQL query failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[SPARQL] Query successful - ${data.results?.bindings?.length || 0} results`);
    
    return data;
  } catch (error) {
    clearTimeout(timeout);
    console.error('[SPARQL] Query execution error:', error);
    throw error;
  }
}

// Parse SPARQL results to clean JSON
function parseResults(response: SPARQLResponse): any[] {
  if (!response.results || !response.results.bindings) {
    return [];
  }

  return response.results.bindings.map(binding => {
    const result: any = {};

    for (const [key, value] of Object.entries(binding)) {
      if (value.type === 'uri') {
        result[key] = {
          '@id': value.value,
          type: 'uri'
        };
      } else {
        result[key] = value.value;
      }
    }

    return result;
  });
}

export const locSparqlService = {
  // Search works by keyword
  async searchWorks(keyword: string) {
    try {
      const query = buildWorkSearchQuery(keyword);
      const response = await runQuery(query);
      return parseResults(response);
    } catch (error) {
      console.error('[SPARQL] Work search failed:', error);
      return [];
    }
  },

  // Detect duplicates
  async detectDuplicates(title: string, creator?: string) {
    try {
      const query = buildDuplicateQuery(title, creator);
      const response = await runQuery(query);
      return parseResults(response);
    } catch (error) {
      console.error('[SPARQL] Duplicate detection failed:', error);
      return [];
    }
  },

  // Find related works
  async findRelatedWorks(workUri: string) {
    try {
      const query = buildRelatedWorksQuery(workUri);
      const response = await runQuery(query);
      return parseResults(response);
    } catch (error) {
      console.error('[SPARQL] Related works search failed:', error);
      return [];
    }
  },

  // Cluster works (FRBR)
  async clusterWorks(workUri: string) {
    try {
      const query = buildClusterQuery(workUri);
      const response = await runQuery(query);
      return parseResults(response);
    } catch (error) {
      console.error('[SPARQL] Work clustering failed:', error);
      return [];
    }
  },

  // Discover by subject
  async discoverBySubject(subjectUri: string, limit = 20) {
    try {
      const query = buildSubjectDiscoveryQuery(subjectUri, limit);
      const response = await runQuery(query);
      return parseResults(response);
    } catch (error) {
      console.error('[SPARQL] Subject discovery failed:', error);
      return [];
    }
  },

  // Discover by creator
  async discoverByCreator(creatorUri: string, limit = 20) {
    try {
      const query = buildCreatorDiscoveryQuery(creatorUri, limit);
      const response = await runQuery(query);
      return parseResults(response);
    } catch (error) {
      console.error('[SPARQL] Creator discovery failed:', error);
      return [];
    }
  },

  // Custom query
  async customQuery(query: string) {
    try {
      const response = await runQuery(query);
      return parseResults(response);
    } catch (error) {
      console.error('[SPARQL] Custom query failed:', error);
      throw error;
    }
  }
};
