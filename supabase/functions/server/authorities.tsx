/**
 * AUTHORITY MANAGEMENT FOR MOON - PostgreSQL Backend
 * Professional authority control with linking, deduplication, and URI merging
 * 
 * MIGRATED: Now uses the authorities table directly
 */

import * as db from "./db.tsx";
import * as jsonld from "npm:jsonld@9.0.0";

export interface Authority {
  id: string;
  uri: string;
  type: 'Person' | 'Organization' | 'Topic' | 'Place' | 'Work' | 'GenreForm';
  label: string;
  alternateLabels?: string[];
  externalLinks?: {
    viaf?: string;
    lc?: string;
    wikidata?: string;
    isni?: string;
    orcid?: string;
  };
  metadata: {
    created: string;
    modified: string;
    source?: 'local' | 'imported' | 'external';
    verified?: boolean;
    usageCount?: number;
  };
  rawData?: any;
}

interface AuthorityRow {
  id: string;
  uri: string;
  type: string;
  label: string;
  alternate_labels: string[] | null;
  viaf_uri: string | null;
  lc_uri: string | null;
  wikidata_uri: string | null;
  isni: string | null;
  orcid: string | null;
  raw_data: any;
  source: string;
  verified: boolean;
  usage_count: number;
  institution_id: string | null;
  created_at: string;
  updated_at: string;
}

function rowToAuthority(row: AuthorityRow): Authority {
  return {
    id: row.id,
    uri: row.uri,
    type: row.type as any,
    label: row.label,
    alternateLabels: row.alternate_labels || [],
    externalLinks: {
      viaf: row.viaf_uri || undefined,
      lc: row.lc_uri || undefined,
      wikidata: row.wikidata_uri || undefined,
      isni: row.isni || undefined,
      orcid: row.orcid || undefined,
    },
    metadata: {
      created: row.created_at,
      modified: row.updated_at,
      source: row.source as any,
      verified: row.verified,
      usageCount: row.usage_count,
    },
    rawData: row.raw_data,
  };
}

export function generateAuthorityURI(id: string, type: string, baseUrl = 'https://moon.org'): string {
  return `${baseUrl}/authority/${type.toLowerCase()}/${id}`;
}

/**
 * Save authority
 */
export async function saveAuthority(authority: Partial<Authority>): Promise<Authority> {
  const id = authority.id || crypto.randomUUID();
  const uri = authority.uri || generateAuthorityURI(id, authority.type || 'Person');

  if (!authority.label) throw new Error('Authority must have a label');
  if (!authority.type) throw new Error('Authority must have a type');

  const row = await db.upsert<AuthorityRow>('authorities', {
    id,
    uri,
    type: authority.type,
    label: authority.label,
    alternate_labels: authority.alternateLabels || [],
    viaf_uri: authority.externalLinks?.viaf || null,
    lc_uri: authority.externalLinks?.lc || null,
    wikidata_uri: authority.externalLinks?.wikidata || null,
    isni: authority.externalLinks?.isni || null,
    orcid: authority.externalLinks?.orcid || null,
    raw_data: authority.rawData || null,
    source: authority.metadata?.source || 'local',
    verified: authority.metadata?.verified || false,
    usage_count: authority.metadata?.usageCount || 0,
  } as any, 'id');

  console.log(`[MOON] Saved authority ${id} - "${authority.label}"`);
  return rowToAuthority(row);
}

/**
 * Get authority by ID
 */
export async function getAuthority(id: string): Promise<Authority | null> {
  try {
    const row = await db.getById<AuthorityRow>('authorities', id);
    if (!row) return null;
    return rowToAuthority(row);
  } catch (error) {
    console.error(`[MOON] Error loading authority ${id}:`, error);
    return null;
  }
}

/**
 * Get authority by URI
 */
export async function getAuthorityByURI(uri: string): Promise<Authority | null> {
  try {
    const rows = await db.query<AuthorityRow>('authorities', {
      filters: { uri },
      limit: 1,
    });
    return rows.length > 0 ? rowToAuthority(rows[0]) : null;
  } catch (error) {
    console.error(`[MOON] Error finding authority by URI:`, error);
    return null;
  }
}

/**
 * List all authorities
 */
export async function listAuthorities(options?: {
  type?: string;
  verified?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Authority[]> {
  try {
    const filters: Record<string, any> = {};
    if (options?.type) filters.type = options.type;
    if (options?.verified !== undefined) filters.verified = options.verified;

    const rows = await db.query<AuthorityRow>('authorities', {
      filters,
      order: { column: 'usage_count', ascending: false },
      limit: options?.limit || 100,
      offset: options?.offset || 0,
    });

    return rows.map(rowToAuthority);
  } catch (error) {
    console.error('[MOON] Error listing authorities:', error);
    return [];
  }
}

/**
 * Search authorities (trigram fuzzy search on label)
 */
export async function searchAuthorities(query: string, options?: {
  type?: string;
  limit?: number;
}): Promise<Authority[]> {
  try {
    const filters: Record<string, any> = {};
    if (options?.type) filters.type = options.type;

    const rows = await db.search<AuthorityRow>('authorities', 'label', query, {
      filters,
      order: { column: 'usage_count', ascending: false },
      limit: options?.limit || 20,
    });

    return rows.map(rowToAuthority);
  } catch (error) {
    console.error('[MOON] Error searching authorities:', error);
    return [];
  }
}

/**
 * Duplicate detection
 */
export async function findDuplicates(authority: Authority, threshold = 0.8): Promise<Array<{
  authority: Authority;
  similarity: number;
  reasons: string[];
}>> {
  const allAuthorities = await listAuthorities({ type: authority.type });
  const duplicates: Array<{ authority: Authority; similarity: number; reasons: string[] }> = [];

  for (const candidate of allAuthorities) {
    if (candidate.id === authority.id) continue;

    const reasons: string[] = [];
    let similarity = 0;

    if (candidate.label.toLowerCase() === authority.label.toLowerCase()) {
      similarity = 1.0;
      reasons.push('Exact label match');
    } else {
      const labelSim = calculateStringSimilarity(candidate.label.toLowerCase(), authority.label.toLowerCase());
      similarity = Math.max(similarity, labelSim);
      if (labelSim > threshold) reasons.push(`Label similarity: ${(labelSim * 100).toFixed(0)}%`);
    }

    for (const altLabel of authority.alternateLabels || []) {
      if (candidate.label.toLowerCase() === altLabel.toLowerCase()) {
        similarity = Math.max(similarity, 0.9);
        reasons.push('Alternate label matches main label');
      }
    }

    if (candidate.externalLinks?.viaf && authority.externalLinks?.viaf &&
        candidate.externalLinks.viaf === authority.externalLinks.viaf) {
      similarity = 1.0;
      reasons.push('Same VIAF ID');
    }
    if (candidate.externalLinks?.lc && authority.externalLinks?.lc &&
        candidate.externalLinks.lc === authority.externalLinks.lc) {
      similarity = 1.0;
      reasons.push('Same LC ID');
    }
    if (candidate.externalLinks?.wikidata && authority.externalLinks?.wikidata &&
        candidate.externalLinks.wikidata === authority.externalLinks.wikidata) {
      similarity = 1.0;
      reasons.push('Same Wikidata ID');
    }

    if (similarity >= threshold) {
      duplicates.push({ authority: candidate, similarity, reasons });
    }
  }

  duplicates.sort((a, b) => b.similarity - a.similarity);
  return duplicates;
}

/**
 * Merge authorities
 */
export async function mergeAuthorities(
  keepId: string,
  mergeIds: string[]
): Promise<{ success: boolean; canonicalAuthority: Authority; mergedCount: number }> {
  try {
    const keep = await getAuthority(keepId);
    if (!keep) throw new Error(`Authority ${keepId} not found`);

    const toMerge: Authority[] = [];
    for (const id of mergeIds) {
      const auth = await getAuthority(id);
      if (auth) toMerge.push(auth);
    }

    const allLabels = new Set([keep.label, ...(keep.alternateLabels || [])]);
    for (const auth of toMerge) {
      allLabels.add(auth.label);
      if (auth.alternateLabels) auth.alternateLabels.forEach(l => allLabels.add(l));
    }
    allLabels.delete(keep.label);

    const combinedLinks = { ...keep.externalLinks };
    for (const auth of toMerge) {
      if (auth.externalLinks) {
        Object.entries(auth.externalLinks).forEach(([key, value]) => {
          if (value && !combinedLinks[key as keyof typeof combinedLinks]) {
            (combinedLinks as any)[key] = value;
          }
        });
      }
    }

    keep.alternateLabels = Array.from(allLabels);
    keep.externalLinks = combinedLinks;
    keep.metadata.modified = new Date().toISOString();
    keep.metadata.usageCount = (keep.metadata.usageCount || 0) +
      toMerge.reduce((sum, a) => sum + (a.metadata.usageCount || 0), 0);

    await saveAuthority(keep);

    // Delete merged authorities
    for (const auth of toMerge) {
      await db.del('authorities', auth.id);
    }

    console.log(`[MOON] Merged ${toMerge.length} authorities into ${keep.id}`);

    return {
      success: true,
      canonicalAuthority: keep,
      mergedCount: toMerge.length,
    };
  } catch (error) {
    console.error('[MOON] Error merging authorities:', error);
    throw error;
  }
}

/**
 * Increment usage count
 */
export async function incrementAuthorityUsage(authorityId: string): Promise<void> {
  const authority = await getAuthority(authorityId);
  if (authority) {
    authority.metadata.usageCount = (authority.metadata.usageCount || 0) + 1;
    authority.metadata.modified = new Date().toISOString();
    await saveAuthority(authority);
  }
}

/**
 * Import authority from external source
 */
export async function importExternalAuthority(
  uri: string,
  type: Authority['type']
): Promise<Authority> {
  const label = extractLabelFromURI(uri);
  const externalLinks: Authority['externalLinks'] = {};

  if (uri.includes('viaf.org')) externalLinks.viaf = uri;
  else if (uri.includes('id.loc.gov')) externalLinks.lc = uri;
  else if (uri.includes('wikidata.org')) externalLinks.wikidata = uri;

  return await saveAuthority({
    label,
    type,
    externalLinks,
    metadata: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      source: 'external',
      verified: true,
      usageCount: 0,
    },
  });
}

// ─── Helpers ─────────────────────────────────────────────────

function extractLabelFromURI(uri: string): string {
  const parts = uri.split('/');
  const last = parts[parts.length - 1];
  return decodeURIComponent(last).replace(/_/g, ' ');
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
  for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}
