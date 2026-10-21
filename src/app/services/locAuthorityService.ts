// Production LOC Authority Service (Frontend)
// Full LOC authority coverage with automatic normalization

type AuthorityType =
  | "names"
  | "subjects"
  | "genreForms"
  | "classification";

export interface AuthorityResult {
  label: string;
  uri: string;
  type: string;
  description?: string;
}

const LOC_BASE = "https://id.loc.gov/authorities";
const SPARQL_ENDPOINT = "https://id.loc.gov/sparql";

const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

interface CacheEntry {
  timestamp: number;
  data: AuthorityResult[];
}

const memoryCache = new Map<string, CacheEntry>();

async function fetchWithTimeout(url: string, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("LOC API Error");
    return await response.json();
  } finally {
    clearTimeout(id);
  }
}

function normalizeSuggestResponse(data: any): AuthorityResult[] {
  if (!Array.isArray(data) || data.length < 4) return [];

  const labels = data[1];
  const descriptions = data[2] || [];
  const uris = data[3];

  return labels.map((label: string, index: number) => ({
    label,
    uri: uris[index],
    type: "Authority",
    description: descriptions[index] || ""
  }));
}

async function search(type: AuthorityType, query: string): Promise<AuthorityResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const cacheKey = `${type}:${query}`;

  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[LOC Cache Hit] ${cacheKey}`);
    return cached.data;
  }

  try {
    const url = `${LOC_BASE}/${type}/suggest/?q=${encodeURIComponent(query)}`;
    console.log(`[LOC Request] ${url}`);
    
    const raw = await fetchWithTimeout(url);
    const results = normalizeSuggestResponse(raw);

    memoryCache.set(cacheKey, {
      timestamp: Date.now(),
      data: results
    });

    console.log(`[LOC Results] ${results.length} found for "${query}"`);
    return results;
  } catch (error) {
    console.error(`[LOC Error] ${type} search failed:`, error);
    return [];
  }
}

export const locAuthorityService = {
  searchNames: (q: string) => search("names", q),
  searchSubjects: (q: string) => search("subjects", q),
  searchGenreForms: (q: string) => search("genreForms", q),
  searchClassification: (q: string) => search("classification", q),

  async fetchBIBFRAMEWork(id: string) {
    const url = `https://id.loc.gov/resources/works/${id}.json`;
    try {
      const data = await fetchWithTimeout(url);
      console.log(`[LOC BIBFRAME Work] Fetched ${id}`);
      return data;
    } catch (error) {
      console.error(`[LOC Error] Failed to fetch work ${id}:`, error);
      return null;
    }
  },

  async fetchBIBFRAMEInstance(id: string) {
    const url = `https://id.loc.gov/resources/instances/${id}.json`;
    try {
      const data = await fetchWithTimeout(url);
      console.log(`[LOC BIBFRAME Instance] Fetched ${id}`);
      return data;
    } catch (error) {
      console.error(`[LOC Error] Failed to fetch instance ${id}:`, error);
      return null;
    }
  },

  getCacheStats() {
    return {
      size: memoryCache.size,
      entries: Array.from(memoryCache.keys())
    };
  },

  clearCache() {
    memoryCache.clear();
    console.log('[LOC Cache] Cleared');
  }
};
