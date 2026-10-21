// Frontend Client for LOC Authority Services
// Connects to backend LOC integration layer

import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c`;

interface AuthorityResult {
  label: string;
  uri: string;
  type: string;
  description?: string;
  source: 'LOC';
}

interface URIReference {
  '@id': string;
  'rdfs:label': string;
  '@type': string;
}

// 🔍 Search LC Name Authority (LCNAF)
export async function searchNames(query: string): Promise<AuthorityResult[]> {
  try {
    const response = await fetch(`${API_BASE}/authority/names?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Search names error:', error);
    return [];
  }
}

// 📚 Search LC Subject Headings (LCSH)
export async function searchSubjects(query: string): Promise<AuthorityResult[]> {
  try {
    const response = await fetch(`${API_BASE}/authority/subjects?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Search subjects error:', error);
    return [];
  }
}

// 🎭 Search LC Genre/Form Terms (LCGFT)
export async function searchGenreForms(query: string): Promise<AuthorityResult[]> {
  try {
    const response = await fetch(`${API_BASE}/authority/genreforms?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Search genre/forms error:', error);
    return [];
  }
}

// 📊 Search LC Classification (LCC)
export async function searchClassification(query: string): Promise<AuthorityResult[]> {
  try {
    const response = await fetch(`${API_BASE}/authority/classification?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Search classification error:', error);
    return [];
  }
}

// 🧠 Smart Authority Lookup (Auto-detect)
export async function smartLookup(query: string, propertyRange: string): Promise<AuthorityResult[]> {
  try {
    const response = await fetch(`${API_BASE}/authority/smart?q=${encodeURIComponent(query)}&range=${encodeURIComponent(propertyRange)}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Smart lookup error:', error);
    return [];
  }
}

// 📖 Fetch BIBFRAME Work
export async function fetchBIBFRAMEWork(workId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/bibframe/work/${workId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch BIBFRAME work error:', error);
    return null;
  }
}

// 📚 Fetch BIBFRAME Instance
export async function fetchBIBFRAMEInstance(instanceId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/bibframe/instance/${instanceId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch BIBFRAME instance error:', error);
    return null;
  }
}

// 🔎 Run SPARQL Query
export async function runSPARQLQuery(query: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/sparql/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('SPARQL query error:', error);
    throw error;
  }
}

// 🔍 Find Related Works
export async function findRelatedWorks(workUri: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/sparql/related/${encodeURIComponent(workUri)}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Find related works error:', error);
    return [];
  }
}

// 🔎 Detect Duplicates
export async function detectDuplicates(title: string, creator?: string): Promise<any[]> {
  try {
    const params = new URLSearchParams({ title });
    if (creator) params.append('creator', creator);
    
    const response = await fetch(`${API_BASE}/sparql/duplicates?${params}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Detect duplicates error:', error);
    return [];
  }
}

// 📚 Cluster Works (FRBR)
export async function clusterWorks(workUri: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/sparql/cluster/${encodeURIComponent(workUri)}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Cluster works error:', error);
    return [];
  }
}

// 🌐 Advanced Discovery
export async function advancedDiscovery(params: {
  title?: string;
  creator?: string;
  subject?: string;
  language?: string;
  dateStart?: string;
  dateEnd?: string;
  limit?: number;
}): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/sparql/discover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Advanced discovery error:', error);
    return [];
  }
}

// 🔗 Get Authority Service for Property
export async function getAuthorityService(propertyUri: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/ontology/authority-service/${encodeURIComponent(propertyUri)}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.service;
  } catch (error) {
    console.error('Get authority service error:', error);
    return null;
  }
}

// 📋 Get Properties with Authority Mapping
export async function getPropertiesWithAuthorities(className: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/ontology/properties/${encodeURIComponent(className)}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.properties || [];
  } catch (error) {
    console.error('Get properties error:', error);
    return [];
  }
}

// ✅ Validate BIBFRAME Record
export async function validateRecord(entity: any, className: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/ontology/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ entity, className })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Validate record error:', error);
    return { valid: false, errors: ['Validation service unavailable'] };
  }
}

// 🔄 Convert Literal to URI
export async function convertLiteralToURI(propertyUri: string, literalValue: string): Promise<URIReference | null> {
  try {
    const response = await fetch(`${API_BASE}/ontology/literalToUri`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ propertyUri, literalValue })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.uriRef;
  } catch (error) {
    console.error('Convert literal error:', error);
    return null;
  }
}

// 🏗️ Build RDF Graph
export async function buildRDFGraph(workData: any, instanceData: any, adminData: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/graph/build`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ workData, instanceData, adminData })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Build RDF graph error:', error);
    return null;
  }
}

// ✅ Validate SPARQL Graph
export async function validateGraph(graph: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/graph/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graph)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Validate graph error:', error);
    return { valid: false, errors: ['Validation service unavailable'] };
  }
}

// 📈 Get Cache Statistics
export async function getCacheStats(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/authority/cache-stats`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get cache stats error:', error);
    return null;
  }
}