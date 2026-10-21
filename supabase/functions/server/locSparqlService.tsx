// Library of Congress SPARQL Service
// Advanced query capabilities for linked data discovery

interface SPARQLBinding {
  type: string;
  value: string;
  'xml:lang'?: string;
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

// 🔍 Find Related Works
export async function findRelatedWorks(workUri: string): Promise<any[]> {
  const query = `
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
  
  try {
    const response = await executeSPARQL(query);
    return parseSPARQLResults(response);
  } catch (error) {
    console.error('[LOC SPARQL] Find related works error:', error);
    return [];
  }
}

// 🔎 Duplicate Detection
export async function detectDuplicates(title: string, creator?: string): Promise<any[]> {
  const creatorFilter = creator 
    ? `FILTER(CONTAINS(LCASE(?creator), "${creator.toLowerCase()}"))`
    : '';
  
  const query = `
    PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT DISTINCT ?work ?workTitle ?creator
    WHERE {
      ?work a bf:Work ;
            bf:title ?titleObj .
      ?titleObj bf:mainTitle ?workTitle .
      
      FILTER(CONTAINS(LCASE(?workTitle), "${title.toLowerCase()}"))
      
      OPTIONAL {
        ?work bf:creator ?creatorObj .
        ?creatorObj rdfs:label ?creator .
      }
      
      ${creatorFilter}
    }
    LIMIT 50
  `;
  
  try {
    const response = await executeSPARQL(query);
    return parseSPARQLResults(response);
  } catch (error) {
    console.error('[LOC SPARQL] Duplicate detection error:', error);
    return [];
  }
}

// 📚 Work Clustering (FRBR-style grouping)
export async function clusterWorks(baseWorkUri: string): Promise<any[]> {
  const query = `
    PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT DISTINCT ?instance ?instanceTitle ?format ?isbn
    WHERE {
      <${baseWorkUri}> bf:hasInstance ?instance .
      ?instance a bf:Instance ;
                bf:title ?titleObj .
      ?titleObj bf:mainTitle ?instanceTitle .
      
      OPTIONAL {
        ?instance bf:format ?format .
      }
      
      OPTIONAL {
        ?instance bf:identifiedBy ?isbnObj .
        ?isbnObj a bf:Isbn ;
                 rdf:value ?isbn .
      }
    }
    LIMIT 100
  `;
  
  try {
    const response = await executeSPARQL(query);
    return parseSPARQLResults(response);
  } catch (error) {
    console.error('[LOC SPARQL] Work clustering error:', error);
    return [];
  }
}

// 🌐 Discover Works by Subject
export async function discoverBySubject(subjectUri: string, limit = 20): Promise<any[]> {
  const query = `
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
  
  try {
    const response = await executeSPARQL(query);
    return parseSPARQLResults(response);
  } catch (error) {
    console.error('[LOC SPARQL] Discover by subject error:', error);
    return [];
  }
}

// 👤 Discover Works by Creator
export async function discoverByCreator(creatorUri: string, limit = 20): Promise<any[]> {
  const query = `
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
  
  try {
    const response = await executeSPARQL(query);
    return parseSPARQLResults(response);
  } catch (error) {
    console.error('[LOC SPARQL] Discover by creator error:', error);
    return [];
  }
}

// 📖 Get Complete Work Graph
export async function getWorkGraph(workUri: string): Promise<any> {
  const query = `
    PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    
    CONSTRUCT {
      <${workUri}> ?p ?o .
      ?o ?p2 ?o2 .
    }
    WHERE {
      <${workUri}> ?p ?o .
      OPTIONAL {
        ?o ?p2 ?o2 .
      }
    }
  `;
  
  try {
    const response = await executeSPARQL(query);
    return response;
  } catch (error) {
    console.error('[LOC SPARQL] Get work graph error:', error);
    return null;
  }
}

// 🔢 Statistics Query
export async function getStatistics(): Promise<any> {
  const query = `
    PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
    
    SELECT 
      (COUNT(DISTINCT ?work) AS ?totalWorks)
      (COUNT(DISTINCT ?instance) AS ?totalInstances)
      (COUNT(DISTINCT ?creator) AS ?totalCreators)
    WHERE {
      ?work a bf:Work .
      OPTIONAL { ?instance a bf:Instance . }
      OPTIONAL { ?creator a bf:Agent . }
    }
  `;
  
  try {
    const response = await executeSPARQL(query);
    return parseSPARQLResults(response)[0] || {};
  } catch (error) {
    console.error('[LOC SPARQL] Statistics error:', error);
    return {};
  }
}

// 🔧 Execute Raw SPARQL Query
async function executeSPARQL(query: string): Promise<SPARQLResponse> {
  console.log('[LOC SPARQL] Executing query:', query.substring(0, 100) + '...');
  
  const sparqlUrl = 'https://id.loc.gov/sparql';
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
  
  try {
    const response = await fetch(sparqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/sparql-results+json'
      },
      body: query,
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`SPARQL endpoint error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[LOC SPARQL] Query successful - ${data.results?.bindings?.length || 0} results`);
    
    return data;
    
  } catch (error) {
    clearTimeout(timeout);
    console.error('[LOC SPARQL] Query execution error:', error);
    throw error;
  }
}

// 🔄 Parse SPARQL Results to Clean JSON
function parseSPARQLResults(response: SPARQLResponse): any[] {
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
      } else if (value.type === 'literal') {
        result[key] = value.value;
        if (value['xml:lang']) {
          result[`${key}_lang`] = value['xml:lang'];
        }
      } else {
        result[key] = value.value;
      }
    }
    
    return result;
  });
}

// 🎯 Advanced Discovery Search
export async function advancedDiscovery(params: {
  title?: string;
  creator?: string;
  subject?: string;
  language?: string;
  dateStart?: string;
  dateEnd?: string;
  limit?: number;
}): Promise<any[]> {
  const filters: string[] = [];
  
  if (params.title) {
    filters.push(`FILTER(CONTAINS(LCASE(?title), "${params.title.toLowerCase()}"))`);
  }
  
  if (params.creator) {
    filters.push(`FILTER(CONTAINS(LCASE(?creator), "${params.creator.toLowerCase()}"))`);
  }
  
  if (params.language) {
    filters.push(`FILTER(?language = "${params.language}")`);
  }
  
  if (params.dateStart) {
    filters.push(`FILTER(?date >= "${params.dateStart}")`);
  }
  
  if (params.dateEnd) {
    filters.push(`FILTER(?date <= "${params.dateEnd}")`);
  }
  
  const query = `
    PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT DISTINCT ?work ?title ?creator ?date ?language
    WHERE {
      ?work a bf:Work ;
            bf:title ?titleObj .
      ?titleObj bf:mainTitle ?title .
      
      OPTIONAL {
        ?work bf:creator ?creatorObj .
        ?creatorObj rdfs:label ?creator .
      }
      
      OPTIONAL {
        ?work bf:originDate ?date .
      }
      
      OPTIONAL {
        ?work bf:language ?langObj .
        ?langObj rdfs:label ?language .
      }
      
      ${filters.join('\n      ')}
    }
    ORDER BY DESC(?date)
    LIMIT ${params.limit || 50}
  `;
  
  try {
    const response = await executeSPARQL(query);
    return parseSPARQLResults(response);
  } catch (error) {
    console.error('[LOC SPARQL] Advanced discovery error:', error);
    return [];
  }
}

export { executeSPARQL, parseSPARQLResults };
