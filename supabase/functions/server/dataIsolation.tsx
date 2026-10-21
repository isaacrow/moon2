/**
 * 🔒 ROW-LEVEL DATA ISOLATION
 * Enforce tenant isolation at the data access layer
 * 
 * CRITICAL: All data queries MUST go through these functions
 * Direct KV access bypasses security - NEVER USE kv.* directly in endpoints
 */

import * as db from "./db.tsx";
const kv = { set: db.kvSet, get: db.kvGet, del: db.kvDel, getByPrefix: db.kvGetByPrefix };

export interface IsolatedRecord {
  id: string;
  institutionId: string;
  data: any;
  metadata: {
    created: string;
    createdBy: string;
    modified?: string;
    modifiedBy?: string;
  };
}

/**
 * ✅ SAFE: Get record with institution check
 */
export async function getRecord(
  recordId: string,
  institutionId: string
): Promise<IsolatedRecord | null> {
  try {
    const key = `moon:${institutionId}:record:${recordId}`;
    const data = await kv.get(key);
    
    if (!data) {
      return null;
    }

    const record = typeof data === 'string' ? JSON.parse(data) : data;
    
    // SECURITY CHECK: Verify institution matches
    if (record.institutionId !== institutionId) {
      console.error(`[SECURITY VIOLATION] Attempted cross-tenant access: Record ${recordId} belongs to ${record.institutionId}, requested by ${institutionId}`);
      return null;
    }

    return record;
  } catch (error) {
    console.error('[DATA ISOLATION] Error getting record:', error);
    return null;
  }
}

/**
 * ✅ SAFE: List records for institution only
 */
export async function listRecords(
  institutionId: string,
  options?: {
    limit?: number;
    offset?: number;
    filter?: (record: any) => boolean;
  }
): Promise<IsolatedRecord[]> {
  try {
    const prefix = `moon:${institutionId}:record:`;
    const allData = await kv.getByPrefix(prefix);
    
    let records = allData
      .map((data: any) => {
        try {
          const record = typeof data === 'string' ? JSON.parse(data) : data;
          
          // SECURITY CHECK: Double-verify institution
          if (record.institutionId !== institutionId) {
            console.error(`[SECURITY VIOLATION] Record found with wrong prefix: ${record.id}`);
            return null;
          }
          
          return record;
        } catch {
          return null;
        }
      })
      .filter((r: any): r is IsolatedRecord => r !== null);

    // Apply custom filter
    if (options?.filter) {
      records = records.filter(options.filter);
    }

    // Pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || records.length;
    
    return records.slice(offset, offset + limit);
  } catch (error) {
    console.error('[DATA ISOLATION] Error listing records:', error);
    return [];
  }
}

/**
 * ✅ SAFE: Save record with mandatory institution
 */
export async function saveRecord(
  recordId: string,
  institutionId: string,
  data: any,
  userId: string
): Promise<IsolatedRecord> {
  const key = `moon:${institutionId}:record:${recordId}`;
  
  // Get existing record to check if update
  const existing = await getRecord(recordId, institutionId);
  
  const record: IsolatedRecord = {
    id: recordId,
    institutionId, // ENFORCED
    data,
    metadata: existing ? {
      ...existing.metadata,
      modified: new Date().toISOString(),
      modifiedBy: userId
    } : {
      created: new Date().toISOString(),
      createdBy: userId
    }
  };

  await kv.set(key, JSON.stringify(record));
  
  console.log(`[DATA ISOLATION] Saved record ${recordId} for institution ${institutionId}`);
  
  return record;
}

/**
 * ✅ SAFE: Delete record with institution check
 */
export async function deleteRecord(
  recordId: string,
  institutionId: string
): Promise<boolean> {
  try {
    // Verify ownership before delete
    const record = await getRecord(recordId, institutionId);
    
    if (!record) {
      console.error(`[DATA ISOLATION] Cannot delete record ${recordId}: Not found or access denied`);
      return false;
    }

    const key = `moon:${institutionId}:record:${recordId}`;
    await kv.del(key);
    
    console.log(`[DATA ISOLATION] Deleted record ${recordId} from institution ${institutionId}`);
    return true;
  } catch (error) {
    console.error('[DATA ISOLATION] Error deleting record:', error);
    return false;
  }
}

/**
 * ✅ SAFE: Authority operations with isolation
 */
export async function getAuthority(
  authorityId: string,
  institutionId: string
): Promise<any | null> {
  try {
    const key = `moon:${institutionId}:authority:${authorityId}`;
    const data = await kv.get(key);
    
    if (!data) {
      return null;
    }

    const authority = typeof data === 'string' ? JSON.parse(data) : data;
    
    // SECURITY CHECK
    if (authority.institutionId !== institutionId) {
      console.error(`[SECURITY VIOLATION] Cross-tenant authority access attempt`);
      return null;
    }

    return authority;
  } catch (error) {
    console.error('[DATA ISOLATION] Error getting authority:', error);
    return null;
  }
}

export async function listAuthorities(
  institutionId: string,
  options?: {
    type?: string;
    limit?: number;
  }
): Promise<any[]> {
  try {
    const prefix = `moon:${institutionId}:authority:`;
    const allData = await kv.getByPrefix(prefix);
    
    let authorities = allData
      .map((data: any) => {
        try {
          const auth = typeof data === 'string' ? JSON.parse(data) : data;
          
          // SECURITY CHECK
          if (auth.institutionId !== institutionId) {
            console.error(`[SECURITY VIOLATION] Authority with wrong institution in prefix`);
            return null;
          }
          
          return auth;
        } catch {
          return null;
        }
      })
      .filter((a: any): a is any => a !== null);

    // Filter by type
    if (options?.type) {
      authorities = authorities.filter(a => a.type === options.type);
    }

    // Limit
    if (options?.limit) {
      authorities = authorities.slice(0, options.limit);
    }

    return authorities;
  } catch (error) {
    console.error('[DATA ISOLATION] Error listing authorities:', error);
    return [];
  }
}

export async function saveAuthority(
  authorityId: string,
  institutionId: string,
  data: any,
  userId: string
): Promise<any> {
  const key = `moon:${institutionId}:authority:${authorityId}`;
  
  const authority = {
    ...data,
    id: authorityId,
    institutionId, // ENFORCED
    metadata: {
      ...data.metadata,
      modified: new Date().toISOString(),
      modifiedBy: userId
    }
  };

  await kv.set(key, JSON.stringify(authority));
  
  console.log(`[DATA ISOLATION] Saved authority ${authorityId} for institution ${institutionId}`);
  
  return authority;
}

/**
 * 🔍 SEARCH with mandatory institution filter
 */
export async function searchRecords(
  institutionId: string,
  query: string,
  options?: {
    limit?: number;
    type?: string;
  }
): Promise<IsolatedRecord[]> {
  const allRecords = await listRecords(institutionId);
  
  const lowerQuery = query.toLowerCase();
  
  let results = allRecords.filter(record => {
    const searchable = JSON.stringify(record.data).toLowerCase();
    return searchable.includes(lowerQuery);
  });

  // Type filter
  if (options?.type) {
    results = results.filter(record => {
      const types = extractTypes(record.data);
      return types.includes(options.type!);
    });
  }

  // Limit
  if (options?.limit) {
    results = results.slice(0, options.limit);
  }

  return results;
}

/**
 * Helper: Extract @type from JSON-LD
 */
function extractTypes(document: any): string[] {
  const types: string[] = [];
  
  if (document['@type']) {
    const typeValue = document['@type'];
    if (Array.isArray(typeValue)) {
      types.push(...typeValue);
    } else {
      types.push(typeValue);
    }
  }

  if (document['@graph']) {
    for (const node of document['@graph']) {
      if (node['@type']) {
        const typeValue = node['@type'];
        if (Array.isArray(typeValue)) {
          types.push(...typeValue);
        } else {
          types.push(typeValue);
        }
      }
    }
  }

  return types;
}

/**
 * 🔐 INSTITUTION NAMESPACE ISOLATION
 * Generate URIs that are scoped to institution
 */
export function generateInstitutionUri(
  institutionId: string,
  entityType: string,
  entityId: string
): string {
  // Get institution config
  // For now, use a default pattern
  return `https://moon.org/inst/${institutionId}/${entityType}/${entityId}`;
}

/**
 * ⚠️ SECURITY AUDIT: Detect unauthorized KV access
 * This should be called before allowing any direct kv.* calls
 */
export function validateDirectKvAccess(key: string, institutionId: string): boolean {
  // Key MUST start with moon:{institutionId}:
  const expectedPrefix = `moon:${institutionId}:`;
  
  if (!key.startsWith(expectedPrefix)) {
    console.error(`[SECURITY VIOLATION] Attempted to access key outside institution: ${key}`);
    return false;
  }

  return true;
}