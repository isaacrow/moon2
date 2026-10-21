/**
 * 🕰️ VERSIONING & AUDIT SYSTEM
 * Enterprise-grade version control for records and authorities
 * NEVER hard delete - always preserve history
 */

import * as db from "./db.tsx";

export interface Version<T> {
  id: string;
  entityId: string; // Record or Authority ID
  entityType: 'record' | 'authority';
  version: number;
  data: T;
  metadata: {
    createdAt: string;
    createdBy: string;
    action: 'create' | 'update' | 'delete' | 'merge';
    changeDescription?: string;
    parentVersion?: number;
  };
  namedGraphUri?: string; // For triple store snapshots
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: 'record' | 'authority';
  entityId: string;
  version: number;
  details: {
    before?: any;
    after?: any;
    mergeTarget?: string;
    mergeSource?: string[];
    reason?: string;
  };
}

/**
 * Save versioned entity
 * Creates new version, never overwrites
 */
export async function saveVersion<T>(
  entityId: string,
  entityType: 'record' | 'authority',
  data: T,
  actor: string,
  action: 'create' | 'update' | 'delete' | 'merge',
  changeDescription?: string,
  mergeInfo?: { target?: string; source?: string[] }
): Promise<Version<T>> {
  // Get current version number
  const currentVersion = await getCurrentVersion(entityId, entityType);
  const newVersion = currentVersion + 1;

  const versionId = `${entityId}-v${newVersion}`;
  const timestamp = new Date().toISOString();

  const version: Version<T> = {
    id: versionId,
    entityId,
    entityType,
    version: newVersion,
    data,
    metadata: {
      createdAt: timestamp,
      createdBy: actor,
      action,
      changeDescription,
      parentVersion: currentVersion > 0 ? currentVersion : undefined
    },
    namedGraphUri: action !== 'delete' ? generateVersionedGraphUri(entityId, newVersion) : undefined
  };

  // Save version
  await db.kvSet(`moon:version:${entityType}:${versionId}`, JSON.stringify(version));

  // Update version index
  await db.kvSet(`moon:version:index:${entityType}:${entityId}:latest`, newVersion.toString());

  // Create audit log
  await createAuditLog({
    actor,
    action: `${entityType}.${action}`,
    entityType,
    entityId,
    version: newVersion,
    details: {
      after: data,
      mergeTarget: mergeInfo?.target,
      mergeSource: mergeInfo?.source,
      reason: changeDescription
    }
  });

  console.log(`[VERSIONING] Created version ${newVersion} for ${entityType} ${entityId}`);

  return version;
}

/**
 * Get specific version
 */
export async function getVersion<T>(
  entityId: string,
  entityType: 'record' | 'authority',
  version: number
): Promise<Version<T> | null> {
  try {
    const versionId = `${entityId}-v${version}`;
    const data = await db.kvGet(`moon:version:${entityType}:${versionId}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error(`[VERSIONING] Error getting version:`, error);
    return null;
  }
}

/**
 * Get current version number
 */
export async function getCurrentVersion(
  entityId: string,
  entityType: 'record' | 'authority'
): Promise<number> {
  try {
    const versionStr = await db.kvGet(`moon:version:index:${entityType}:${entityId}:latest`);
    return versionStr ? parseInt(versionStr) : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Get latest version data
 */
export async function getLatestVersion<T>(
  entityId: string,
  entityType: 'record' | 'authority'
): Promise<Version<T> | null> {
  const currentVersion = await getCurrentVersion(entityId, entityType);
  if (currentVersion === 0) return null;
  return await getVersion<T>(entityId, entityType, currentVersion);
}

/**
 * Get version history
 */
export async function getVersionHistory(
  entityId: string,
  entityType: 'record' | 'authority'
): Promise<Version<any>[]> {
  try {
    const currentVersion = await getCurrentVersion(entityId, entityType);
    const versions: Version<any>[] = [];

    for (let v = 1; v <= currentVersion; v++) {
      const version = await getVersion(entityId, entityType, v);
      if (version) {
        versions.push(version);
      }
    }

    return versions.reverse(); // Newest first
  } catch (error) {
    console.error(`[VERSIONING] Error getting history:`, error);
    return [];
  }
}

/**
 * Rollback to previous version
 * Creates new version with old data
 */
export async function rollbackToVersion<T>(
  entityId: string,
  entityType: 'record' | 'authority',
  targetVersion: number,
  actor: string,
  reason: string
): Promise<Version<T> | null> {
  try {
    const targetVersionData = await getVersion<T>(entityId, entityType, targetVersion);
    if (!targetVersionData) {
      throw new Error(`Version ${targetVersion} not found`);
    }

    // Create new version with old data
    const newVersion = await saveVersion<T>(
      entityId,
      entityType,
      targetVersionData.data,
      actor,
      'update',
      `Rollback to version ${targetVersion}: ${reason}`
    );

    console.log(`[VERSIONING] Rolled back ${entityType} ${entityId} to version ${targetVersion}`);

    return newVersion;
  } catch (error) {
    console.error(`[VERSIONING] Rollback error:`, error);
    return null;
  }
}

/**
 * Soft delete - mark as deleted but preserve data
 */
export async function softDelete(
  entityId: string,
  entityType: 'record' | 'authority',
  actor: string,
  reason: string
): Promise<boolean> {
  try {
    const currentData = await getLatestVersion(entityId, entityType);
    if (!currentData) {
      throw new Error('Entity not found');
    }

    // Create delete version with tombstone
    const deleteData = {
      ...currentData.data,
      _deleted: true,
      _deletedAt: new Date().toISOString(),
      _deletedBy: actor,
      _deletedReason: reason
    };

    await saveVersion(
      entityId,
      entityType,
      deleteData,
      actor,
      'delete',
      reason
    );

    console.log(`[VERSIONING] Soft deleted ${entityType} ${entityId}`);

    return true;
  } catch (error) {
    console.error(`[VERSIONING] Soft delete error:`, error);
    return false;
  }
}

/**
 * Check if entity is deleted
 */
export async function isDeleted(
  entityId: string,
  entityType: 'record' | 'authority'
): Promise<boolean> {
  const latest = await getLatestVersion(entityId, entityType);
  return latest?.data?._deleted === true;
}

/**
 * Restore soft-deleted entity
 */
export async function restore(
  entityId: string,
  entityType: 'record' | 'authority',
  actor: string
): Promise<boolean> {
  try {
    const currentData = await getLatestVersion(entityId, entityType);
    if (!currentData || !currentData.data._deleted) {
      throw new Error('Entity not deleted');
    }

    // Find last non-deleted version
    const history = await getVersionHistory(entityId, entityType);
    const lastGoodVersion = history.find(v => !v.data._deleted);
    
    if (!lastGoodVersion) {
      throw new Error('No valid version to restore');
    }

    // Create new version restoring old data
    await saveVersion(
      entityId,
      entityType,
      lastGoodVersion.data,
      actor,
      'update',
      'Restored from deletion'
    );

    console.log(`[VERSIONING] Restored ${entityType} ${entityId}`);

    return true;
  } catch (error) {
    console.error(`[VERSIONING] Restore error:`, error);
    return false;
  }
}

/**
 * Create audit log entry
 */
export async function createAuditLog(entry: {
  actor: string;
  action: string;
  entityType: 'record' | 'authority';
  entityId: string;
  version: number;
  details: AuditLog['details'];
}): Promise<AuditLog> {
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const auditLog: AuditLog = {
    id,
    timestamp,
    ...entry
  };

  await db.kvSet(`moon:audit:${id}`, JSON.stringify(auditLog));
  await db.kvSet(`moon:audit:index:${timestamp}`, id);

  return auditLog;
}

/**
 * Get audit logs
 */
export async function getAuditLogs(options?: {
  entityId?: string;
  entityType?: 'record' | 'authority';
  actor?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLog[]> {
  try {
    const allLogs = await db.kvGetByPrefix('moon:audit:');
    
    let logs: AuditLog[] = allLogs
      .filter((record: string) => {
        try {
          const parsed = JSON.parse(record);
          return parsed.id && !record.includes(':index:');
        } catch {
          return false;
        }
      })
      .map((r: string) => JSON.parse(r))
      .filter((log: AuditLog) => {
        if (options?.entityId && log.entityId !== options.entityId) return false;
        if (options?.entityType && log.entityType !== options.entityType) return false;
        if (options?.actor && log.actor !== options.actor) return false;
        return true;
      });

    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    if (options?.offset !== undefined) {
      logs = logs.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      logs = logs.slice(0, options.limit);
    }

    return logs;
  } catch (error) {
    console.error('[VERSIONING] Error getting audit logs:', error);
    return [];
  }
}

/**
 * Get diff between versions
 */
export function getDiff(oldVersion: any, newVersion: any): {
  added: string[];
  removed: string[];
  modified: Array<{ field: string; before: any; after: any }>;
} {
  const diff = {
    added: [] as string[],
    removed: [] as string[],
    modified: [] as Array<{ field: string; before: any; after: any }>
  };

  const oldKeys = new Set(Object.keys(oldVersion));
  const newKeys = new Set(Object.keys(newVersion));

  // Find added keys
  for (const key of newKeys) {
    if (!oldKeys.has(key)) {
      diff.added.push(key);
    }
  }

  // Find removed keys
  for (const key of oldKeys) {
    if (!newKeys.has(key)) {
      diff.removed.push(key);
    }
  }

  // Find modified values
  for (const key of oldKeys) {
    if (newKeys.has(key)) {
      const oldVal = JSON.stringify(oldVersion[key]);
      const newVal = JSON.stringify(newVersion[key]);
      if (oldVal !== newVal) {
        diff.modified.push({
          field: key,
          before: oldVersion[key],
          after: newVersion[key]
        });
      }
    }
  }

  return diff;
}

// Helper functions

function generateVersionedGraphUri(entityId: string, version: number): string {
  return `https://moon.org/graph/${entityId}/v${version}`;
}

/**
 * Export version snapshot to triple store
 * Each version gets its own named graph
 */
export async function exportVersionToTripleStore(
  entityId: string,
  entityType: 'record' | 'authority',
  version: number,
  tripleStoreConfig: any
): Promise<{ success: boolean; graphUri: string }> {
  // This would integrate with tripleStore.tsx
  // Each version = separate named graph for complete history
  const versionData = await getVersion(entityId, entityType, version);
  if (!versionData) {
    throw new Error(`Version ${version} not found`);
  }

  const graphUri = versionData.namedGraphUri || generateVersionedGraphUri(entityId, version);

  // Would call: tripleStore.uploadToTripleStore(versionData.data, graphUri, config)
  
  return {
    success: true,
    graphUri
  };
}