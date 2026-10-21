// Library of Congress Authority Service Layer
// Enterprise-grade LOC Linked Data API integration
// Handles: LCNAF, LCSH, LCGFT, LCC, BIBFRAME Works/Instances

interface AuthorityResult {
  label: string;
  uri: string;
  type: string;
  description?: string;
  source: 'LOC';
  linkedData?: any;
}

interface BIBFRAMEResource {
  '@id': string;
  '@type': string;
  [key: string]: any;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // 24 hours in ms
}

// In-memory cache with 24h TTL
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Rate limiting
let requestCount = 0;
let requestWindow = Date.now();
const MAX_REQUESTS_PER_MINUTE = 30;

function checkRateLimit(): boolean {
  const now = Date.now();
  if (now - requestWindow > 60000) {
    requestCount = 0;
    requestWindow = now;
  }
  
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    console.warn('[LOC Auth] Rate limit reached');
    return false;
  }
  
  requestCount++;
  return true;
}

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  console.log(`[LOC Auth] Cache hit: ${key}`);
  return entry.data;
}

function setCache(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  });
}

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Moon-BIBFRAME-Cataloging-System/1.0'
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// 1️⃣ LC Name Authority File (LCNAF)
export async function searchNames(query: string): Promise<AuthorityResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const cacheKey = `naf:${query}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded - please wait');
  }
  
  try {
    console.log('[LOC Auth] Searching LCNAF:', query);
    
    const suggestUrl = `https://id.loc.gov/authorities/names/suggest/?q=${encodeURIComponent(query)}`;
    const response = await fetchWithTimeout(suggestUrl);
    
    if (!response.ok) {
      throw new Error(`LCNAF API error: ${response.status}`);
    }
    
    const data = await response.json();
    const results: AuthorityResult[] = [];
    
    // OpenSearch suggest format: [query, [labels], [descriptions], [uris]]
    const labels = data[1] || [];
    const descriptions = data[2] || [];
    const uris = data[3] || [];
    
    for (let i = 0; i < labels.length && i < 20; i++) {
      if (uris[i]) {
        results.push({
          label: labels[i],
          uri: uris[i],
          type: 'bf:Agent',
          description: descriptions[i] || '',
          source: 'LOC'
        });
      }
    }
    
    setCache(cacheKey, results);
    console.log(`[LOC Auth] Found ${results.length} LCNAF results`);
    return results;
    
  } catch (error) {
    console.error('[LOC Auth] LCNAF search error:', error);
    return [];
  }
}

// 2️⃣ LC Subject Headings (LCSH)
export async function searchSubjects(query: string): Promise<AuthorityResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const cacheKey = `lcsh:${query}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded - please wait');
  }
  
  try {
    console.log('[LOC Auth] Searching LCSH:', query);
    
    const suggestUrl = `https://id.loc.gov/authorities/subjects/suggest/?q=${encodeURIComponent(query)}`;
    const response = await fetchWithTimeout(suggestUrl);
    
    if (!response.ok) {
      throw new Error(`LCSH API error: ${response.status}`);
    }
    
    const data = await response.json();
    const results: AuthorityResult[] = [];
    
    const labels = data[1] || [];
    const descriptions = data[2] || [];
    const uris = data[3] || [];
    
    for (let i = 0; i < labels.length && i < 20; i++) {
      if (uris[i]) {
        results.push({
          label: labels[i],
          uri: uris[i],
          type: 'bf:Topic',
          description: descriptions[i] || '',
          source: 'LOC'
        });
      }
    }
    
    setCache(cacheKey, results);
    console.log(`[LOC Auth] Found ${results.length} LCSH results`);
    return results;
    
  } catch (error) {
    console.error('[LOC Auth] LCSH search error:', error);
    return [];
  }
}

// 3️⃣ LC Genre/Form Terms (LCGFT)
export async function searchGenreForms(query: string): Promise<AuthorityResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const cacheKey = `lcgft:${query}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded - please wait');
  }
  
  try {
    console.log('[LOC Auth] Searching LCGFT:', query);
    
    const suggestUrl = `https://id.loc.gov/authorities/genreForms/suggest/?q=${encodeURIComponent(query)}`;
    const response = await fetchWithTimeout(suggestUrl);
    
    if (!response.ok) {
      throw new Error(`LCGFT API error: ${response.status}`);
    }
    
    const data = await response.json();
    const results: AuthorityResult[] = [];
    
    const labels = data[1] || [];
    const descriptions = data[2] || [];
    const uris = data[3] || [];
    
    for (let i = 0; i < labels.length && i < 20; i++) {
      if (uris[i]) {
        results.push({
          label: labels[i],
          uri: uris[i],
          type: 'bf:GenreForm',
          description: descriptions[i] || '',
          source: 'LOC'
        });
      }
    }
    
    setCache(cacheKey, results);
    console.log(`[LOC Auth] Found ${results.length} LCGFT results`);
    return results;
    
  } catch (error) {
    console.error('[LOC Auth] LCGFT search error:', error);
    return [];
  }
}

// 4️⃣ LC Classification (LCC)
export async function searchClassification(query: string): Promise<AuthorityResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const cacheKey = `lcc:${query}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded - please wait');
  }
  
  try {
    console.log('[LOC Auth] Searching LCC:', query);
    
    const suggestUrl = `https://id.loc.gov/authorities/classification/suggest/?q=${encodeURIComponent(query)}`;
    const response = await fetchWithTimeout(suggestUrl);
    
    if (!response.ok) {
      throw new Error(`LCC API error: ${response.status}`);
    }
    
    const data = await response.json();
    const results: AuthorityResult[] = [];
    
    const labels = data[1] || [];
    const descriptions = data[2] || [];
    const uris = data[3] || [];
    
    for (let i = 0; i < labels.length && i < 20; i++) {
      if (uris[i]) {
        results.push({
          label: labels[i],
          uri: uris[i],
          type: 'bf:Classification',
          description: descriptions[i] || '',
          source: 'LOC'
        });
      }
    }
    
    setCache(cacheKey, results);
    console.log(`[LOC Auth] Found ${results.length} LCC results`);
    return results;
    
  } catch (error) {
    console.error('[LOC Auth] LCC search error:', error);
    return [];
  }
}

// 5️⃣ Fetch BIBFRAME Work
export async function fetchBIBFRAMEWork(workId: string): Promise<BIBFRAMEResource | null> {
  const cacheKey = `work:${workId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded - please wait');
  }
  
  try {
    console.log('[LOC Auth] Fetching BIBFRAME Work:', workId);
    
    const workUrl = `https://id.loc.gov/resources/works/${workId}.json`;
    const response = await fetchWithTimeout(workUrl, 15000);
    
    if (!response.ok) {
      throw new Error(`BIBFRAME Work API error: ${response.status}`);
    }
    
    const jsonLD = await response.json();
    
    // Normalize LOC JSON-LD format
    const workUri = `http://id.loc.gov/resources/works/${workId}`;
    const workData = jsonLD[workUri];
    
    if (!workData) {
      console.warn('[LOC Auth] Work data not found in response');
      return null;
    }
    
    const normalized: BIBFRAMEResource = {
      '@id': workUri,
      '@type': 'bf:Work',
      ...workData
    };
    
    setCache(cacheKey, normalized);
    console.log('[LOC Auth] BIBFRAME Work fetched successfully');
    return normalized;
    
  } catch (error) {
    console.error('[LOC Auth] BIBFRAME Work fetch error:', error);
    return null;
  }
}

// 6️⃣ Fetch BIBFRAME Instance
export async function fetchBIBFRAMEInstance(instanceId: string): Promise<BIBFRAMEResource | null> {
  const cacheKey = `instance:${instanceId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded - please wait');
  }
  
  try {
    console.log('[LOC Auth] Fetching BIBFRAME Instance:', instanceId);
    
    const instanceUrl = `https://id.loc.gov/resources/instances/${instanceId}.json`;
    const response = await fetchWithTimeout(instanceUrl, 15000);
    
    if (!response.ok) {
      throw new Error(`BIBFRAME Instance API error: ${response.status}`);
    }
    
    const jsonLD = await response.json();
    
    const instanceUri = `http://id.loc.gov/resources/instances/${instanceId}`;
    const instanceData = jsonLD[instanceUri];
    
    if (!instanceData) {
      console.warn('[LOC Auth] Instance data not found in response');
      return null;
    }
    
    const normalized: BIBFRAMEResource = {
      '@id': instanceUri,
      '@type': 'bf:Instance',
      ...instanceData
    };
    
    setCache(cacheKey, normalized);
    console.log('[LOC Auth] BIBFRAME Instance fetched successfully');
    return normalized;
    
  } catch (error) {
    console.error('[LOC Auth] BIBFRAME Instance fetch error:', error);
    return null;
  }
}

// 7️⃣ Run SPARQL Query
export async function runSPARQLQuery(query: string): Promise<any> {
  const cacheKey = `sparql:${query.substring(0, 100)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded - please wait');
  }
  
  try {
    console.log('[LOC Auth] Running SPARQL query');
    
    const sparqlUrl = 'https://id.loc.gov/sparql';
    const response = await fetch(sparqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/sparql-results+json'
      },
      body: query
    });
    
    if (!response.ok) {
      throw new Error(`SPARQL API error: ${response.status}`);
    }
    
    const results = await response.json();
    
    setCache(cacheKey, results);
    console.log('[LOC Auth] SPARQL query executed successfully');
    return results;
    
  } catch (error) {
    console.error('[LOC Auth] SPARQL query error:', error);
    throw error;
  }
}

// 🔍 Smart Authority Lookup (Auto-detect type)
export async function smartAuthorityLookup(query: string, propertyRange: string): Promise<AuthorityResult[]> {
  console.log(`[LOC Auth] Smart lookup - Query: "${query}", Range: ${propertyRange}`);
  
  // Map BIBFRAME property ranges to LOC authority services
  if (propertyRange.includes('Agent') || propertyRange.includes('Person') || propertyRange.includes('Organization')) {
    return searchNames(query);
  }
  
  if (propertyRange.includes('Topic') || propertyRange.includes('Subject')) {
    return searchSubjects(query);
  }
  
  if (propertyRange.includes('GenreForm') || propertyRange.includes('Genre')) {
    return searchGenreForms(query);
  }
  
  if (propertyRange.includes('Classification')) {
    return searchClassification(query);
  }
  
  // Default to name authority
  return searchNames(query);
}

// 📊 Get Cache Statistics
export function getCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
    requestCount,
    rateLimitRemaining: MAX_REQUESTS_PER_MINUTE - requestCount
  };
}

// 🗑️ Clear Cache
export function clearCache() {
  cache.clear();
  console.log('[LOC Auth] Cache cleared');
}
