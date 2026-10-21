/**
 * 🔗 AUTHORITY MERGE WITH REFERENTIAL INTEGRITY
 * When authorities merge, ALL record references MUST be updated
 * 
 * This prevents broken graph references and ensures data integrity
 * 
 * CRITICAL: This is NOT optional - merge without reference updates
 * creates orphaned URIs and breaks the knowledge graph
 */

import * as db from "./db.tsx";
const kv = { set: db.kvSet, get: db.kvGet, del: db.kvDel, getByPrefix: db.kvGetByPrefix };
import * as dataIsolation from "./dataIsolation.tsx";
import * as tripleStore from "./tripleStore.tsx";

export interface MergeOperation {
  canonicalId: string; // The authority we're keeping
  canonicalUri: string;
  mergedIds: string[]; // Authorities being merged into canonical
  mergedUris: string[];
  recordsUpdated: number;
  triplesRewritten: number;
  redirectsCreated: number;
  timestamp: string;
}

/**
 * ⚠️ COMPLETE AUTHORITY MERGE WITH REFERENTIAL INTEGRITY
 * 
 * Steps:
 * 1. Verify all authorities exist and belong to same institution
 * 2. Create canonical merged authority
 * 3. Find ALL records referencing merged authorities
 * 4. Rewrite URIs in each record's JSON-LD
 * 5. Update triple store (if connected)
 * 6. Create redirect records
 * 7. Soft-delete merged authorities
 * 8. Create audit log
 */
export async function mergeAuthoritiesWithIntegrity(
  canonicalAuthorityId: string,
  mergeAuthorityIds: string[],
  institutionId: string,
  userId: string,
  tripleStoreConfig?: tripleStore.TripleStoreConfig
): Promise<MergeOperation> {
  console.log(`[MERGE] Starting integrity-preserving merge: ${mergeAuthorityIds.join(', ')} → ${canonicalAuthorityId}`);

  // STEP 1: Load and verify all authorities
  const canonical = await dataIsolation.getAuthority(canonicalAuthorityId, institutionId);
  if (!canonical) {
    throw new Error(`Canonical authority not found: ${canonicalAuthorityId}`);
  }

  const toMerge = [];
  for (const id of mergeAuthorityIds) {
    const authority = await dataIsolation.getAuthority(id, institutionId);
    if (!authority) {
      throw new Error(`Authority not found: ${id}`);
    }
    if (authority.institutionId !== institutionId) {
      throw new Error(`Authority ${id} belongs to different institution`);
    }
    toMerge.push(authority);
  }

  // STEP 2: Create merged authority (combine labels, links, etc.)
  const mergedAuthority = {
    ...canonical,
    alternateLabels: [
      ...(canonical.alternateLabels || []),
      ...toMerge.flatMap(a => [a.label, ...(a.alternateLabels || [])])
    ],
    externalLinks: {
      ...canonical.externalLinks,
      ...toMerge.reduce((acc, a) => ({ ...acc, ...a.externalLinks }), {})
    },
    metadata: {
      ...canonical.metadata,
      modified: new Date().toISOString(),
      modifiedBy: userId,
      usageCount: (canonical.metadata?.usageCount || 0) +
        toMerge.reduce((sum, a) => sum + (a.metadata?.usageCount || 0), 0),
      mergeHistory: [
        ...(canonical.metadata?.mergeHistory || []),
        {
          timestamp: new Date().toISOString(),
          mergedIds: mergeAuthorityIds,
          mergedBy: userId
        }
      ]
    }
  };

  await dataIsolation.saveAuthority(canonicalAuthorityId, institutionId, mergedAuthority, userId);

  // STEP 3: Find ALL records referencing merged authorities
  console.log('[MERGE] Step 3: Finding all records with references to merged authorities...');
  
  const mergedUris = toMerge.map(a => a.uri);
  const canonicalUri = canonical.uri;
  
  const allRecords = await dataIsolation.listRecords(institutionId);
  const recordsToUpdate = [];

  for (const record of allRecords) {
    if (recordContainsAnyUri(record.data, mergedUris)) {
      recordsToUpdate.push(record);
    }
  }

  console.log(`[MERGE] Found ${recordsToUpdate.length} records to update`);

  // STEP 4: Rewrite URIs in each record
  let recordsUpdated = 0;
  let triplesRewritten = 0;

  for (const record of recordsToUpdate) {
    console.log(`[MERGE] Updating record ${record.id}...`);
    
    const { document: updatedDocument, replacementCount } = rewriteUrisInDocument(
      record.data,
      mergedUris,
      canonicalUri
    );

    if (replacementCount > 0) {
      // Save updated record
      await dataIsolation.saveRecord(
        record.id,
        institutionId,
        updatedDocument,
        userId
      );

      recordsUpdated++;
      triplesRewritten += replacementCount;

      // Update triple store if configured
      if (tripleStoreConfig) {
        try {
          const graphUri = extractGraphUri(updatedDocument, record.id);
          await tripleStore.uploadToTripleStore(updatedDocument, graphUri, tripleStoreConfig);
          console.log(`[MERGE] Updated triple store for record ${record.id}`);
        } catch (error) {
          console.error(`[MERGE] Failed to update triple store for record ${record.id}:`, error);
        }
      }
    }
  }

  // STEP 5: Create redirect records
  console.log('[MERGE] Step 5: Creating redirect records...');
  
  let redirectsCreated = 0;
  for (const authority of toMerge) {
    await kv.set(
      `moon:${institutionId}:authority:redirect:${authority.id}`,
      JSON.stringify({
        from: authority.uri,
        to: canonicalUri,
        timestamp: new Date().toISOString(),
        mergedBy: userId
      })
    );
    redirectsCreated++;
  }

  // STEP 6: Soft-delete merged authorities (preserve for audit)
  console.log('[MERGE] Step 6: Soft-deleting merged authorities...');
  
  for (const authority of toMerge) {
    const deletedAuthority = {
      ...authority,
      _deleted: true,
      _deletedAt: new Date().toISOString(),
      _deletedBy: userId,
      _deletedReason: `Merged into ${canonicalAuthorityId}`,
      _mergedInto: canonicalUri
    };

    await kv.set(
      `moon:${institutionId}:authority:deleted:${authority.id}`,
      JSON.stringify(deletedAuthority)
    );

    // Remove from active authorities
    await kv.del(`moon:${institutionId}:authority:${authority.id}`);
  }

  // STEP 7: Create audit log
  const mergeOperation: MergeOperation = {
    canonicalId: canonicalAuthorityId,
    canonicalUri,
    mergedIds: mergeAuthorityIds,
    mergedUris,
    recordsUpdated,
    triplesRewritten,
    redirectsCreated,
    timestamp: new Date().toISOString()
  };

  await kv.set(
    `moon:${institutionId}:audit:merge:${crypto.randomUUID()}`,
    JSON.stringify({
      type: 'authority.merge',
      operation: mergeOperation,
      userId,
      timestamp: new Date().toISOString()
    })
  );

  console.log(`[MERGE] ✅ Complete! Updated ${recordsUpdated} records, rewrote ${triplesRewritten} references`);

  return mergeOperation;
}

/**
 * Check if record contains any of the given URIs
 */
function recordContainsAnyUri(document: any, uris: string[]): boolean {
  const docString = JSON.stringify(document);
  return uris.some(uri => docString.includes(uri));
}

/**
 * Rewrite all occurrences of old URIs to new canonical URI in JSON-LD document
 * 
 * This handles:
 * - @id references
 * - Object values (e.g., bf:agent { "@id": "uri" })
 * - String values (e.g., bf:agent: "uri")
 * - Arrays
 * - Nested structures
 */
function rewriteUrisInDocument(
  document: any,
  oldUris: string[],
  newUri: string
): { document: any; replacementCount: number } {
  let replacementCount = 0;

  function rewrite(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // String: Check if it's one of the old URIs
    if (typeof obj === 'string') {
      if (oldUris.includes(obj)) {
        replacementCount++;
        return newUri;
      }
      return obj;
    }

    // Array: Recursively rewrite each element
    if (Array.isArray(obj)) {
      return obj.map(item => rewrite(item));
    }

    // Object: Recursively rewrite properties
    if (typeof obj === 'object') {
      const rewritten: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        // Special handling for @id
        if (key === '@id' && typeof value === 'string' && oldUris.includes(value)) {
          rewritten[key] = newUri;
          replacementCount++;
        } else {
          rewritten[key] = rewrite(value);
        }
      }
      
      return rewritten;
    }

    return obj;
  }

  const rewrittenDocument = rewrite(document);

  return {
    document: rewrittenDocument,
    replacementCount
  };
}

/**
 * Extract graph URI from document or generate from record ID
 */
function extractGraphUri(document: any, recordId: string): string {
  // Try to find Work URI
  if (document['@graph']) {
    for (const node of document['@graph']) {
      if (node['@type']?.includes('bf:Work') || node['@type']?.includes('http://id.loc.gov/ontologies/bibframe/Work')) {
        if (node['@id']) {
          return node['@id'];
        }
      }
    }
  }

  // Fallback to record-based URI
  return `https://moon.org/record/${recordId}`;
}

/**
 * 🔍 GET MERGE IMPACT ANALYSIS
 * Before merging, show user what will be affected
 */
export async function analyzeMergeImpact(
  mergeAuthorityIds: string[],
  institutionId: string
): Promise<{
  recordsAffected: number;
  recordIds: string[];
  estimatedReplacements: number;
  authorities: Array<{
    id: string;
    label: string;
    uri: string;
    usageCount: number;
  }>;
}> {
  const authorities = [];
  const uris = [];

  for (const id of mergeAuthorityIds) {
    const authority = await dataIsolation.getAuthority(id, institutionId);
    if (authority) {
      authorities.push({
        id: authority.id,
        label: authority.label,
        uri: authority.uri,
        usageCount: authority.metadata?.usageCount || 0
      });
      uris.push(authority.uri);
    }
  }

  const allRecords = await dataIsolation.listRecords(institutionId);
  const affectedRecords = [];
  let estimatedReplacements = 0;

  for (const record of allRecords) {
    if (recordContainsAnyUri(record.data, uris)) {
      affectedRecords.push(record.id);
      
      // Estimate number of replacements
      const docString = JSON.stringify(record.data);
      for (const uri of uris) {
        const matches = docString.split(uri).length - 1;
        estimatedReplacements += matches;
      }
    }
  }

  return {
    recordsAffected: affectedRecords.length,
    recordIds: affectedRecords,
    estimatedReplacements,
    authorities
  };
}

/**
 * 🔄 RESOLVE AUTHORITY REDIRECT
 * When querying, follow redirects to get canonical authority
 */
export async function resolveAuthorityRedirect(
  authorityId: string,
  institutionId: string
): Promise<string> {
  const redirectKey = `moon:${institutionId}:authority:redirect:${authorityId}`;
  const redirectData = await kv.get(redirectKey);

  if (redirectData) {
    const redirect = typeof redirectData === 'string' ? JSON.parse(redirectData) : redirectData;
    console.log(`[MERGE] Resolved redirect: ${authorityId} → ${redirect.to}`);
    return redirect.to;
  }

  return authorityId;
}