/**
 * Record Service - PostgreSQL Backend
 * CRUD, Versioning, Publishing, Export
 * 
 * MIGRATED: Now uses direct PostgreSQL tables instead of KV store
 * Tables used: records, record_versions, audit_log, triples
 */

import * as db from './db.tsx';
import { toCanonicalJsonLd, generateChecksum, addExportMetadata } from './canonicalJsonLd.tsx';
import * as auditLog from './auditLog.tsx';

export type RecordStatus = 'draft' | 'validated' | 'published' | 'archived';

export interface RecordMetadata {
  id: string;
  title: string;
  resourceType: 'Work' | 'Instance' | 'Item';
  status: RecordStatus;
  graphJson: any;
  checksum: string;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  versionNumber: number;
  createdBy?: string;
  lastModifiedBy?: string;
  publishedBy?: string;
}

export interface RecordVersion {
  id: string;
  recordId: string;
  versionNumber: number;
  graphSnapshot: any;
  checksum: string;
  createdAt: string;
  createdBy?: string;
  comment?: string;
  validationResult?: {
    valid: boolean;
    errors: string[];
    timestamp: string;
    checksumValidated: string;
  };
}

// ─── Helpers: DB row <-> App model ───────────────────────────

interface RecordRow {
  id: string;
  uri: string;
  work_uri: string | null;
  instance_uri: string | null;
  item_uri: string | null;
  title: string;
  resource_type: string;
  status: string;
  graph_jsonld: any;
  checksum: string;
  locked: boolean;
  institution_id: string | null;
  created_by: string | null;
  last_modified_by: string | null;
  published_by: string | null;
  version_number: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  deleted: boolean;
}

function rowToMetadata(row: RecordRow): RecordMetadata {
  return {
    id: row.id,
    title: row.title,
    resourceType: row.resource_type as any,
    status: row.status as RecordStatus,
    graphJson: row.graph_jsonld,
    checksum: row.checksum,
    locked: row.locked,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at || undefined,
    versionNumber: row.version_number,
    createdBy: row.created_by || undefined,
    lastModifiedBy: row.last_modified_by || undefined,
    publishedBy: row.published_by || undefined,
  };
}

interface VersionRow {
  id: string;
  record_id: string;
  version_number: number;
  graph_snapshot: any;
  checksum: string;
  validation_result: any;
  named_graph_uri: string | null;
  comment: string | null;
  created_by: string | null;
  created_at: string;
}

function rowToVersion(row: VersionRow): RecordVersion {
  return {
    id: row.id,
    recordId: row.record_id,
    versionNumber: row.version_number,
    graphSnapshot: row.graph_snapshot,
    checksum: row.checksum,
    createdAt: row.created_at,
    createdBy: row.created_by || undefined,
    comment: row.comment || undefined,
    validationResult: row.validation_result || undefined,
  };
}

// ─── CRUD ────────────────────────────────────────────────────

/**
 * Create a new record
 */
export async function createRecord(
  graphJson: any,
  title: string,
  resourceType: string,
  userId?: string,
  request?: any
): Promise<RecordMetadata> {
  const recordId = crypto.randomUUID();
  const canonical = toCanonicalJsonLd(graphJson);
  const checksum = generateChecksum(canonical);
  const uri = `https://moon.org/record/${recordId}`;

  // Extract Work/Instance/Item URIs from the graph
  const graph = canonical?.['@graph'] || [];
  const workNode = graph.find((n: any) => n['@type']?.includes?.('bf:Work') || n['@type'] === 'bf:Work');
  const instanceNode = graph.find((n: any) => n['@type']?.includes?.('bf:Instance') || n['@type'] === 'bf:Instance');
  const itemNode = graph.find((n: any) => n['@type']?.includes?.('bf:Item') || n['@type'] === 'bf:Item');

  const row = await db.insert('records', {
    id: recordId,
    uri,
    title,
    resource_type: resourceType || 'Work',
    status: 'draft',
    graph_jsonld: canonical,
    checksum,
    locked: false,
    work_uri: workNode?.['@id'] || null,
    instance_uri: instanceNode?.['@id'] || null,
    item_uri: itemNode?.['@id'] || null,
    created_by: userId || null,
    last_modified_by: userId || null,
    version_number: 1,
  });

  const metadata = rowToMetadata(row);

  // Create initial version
  await createVersion(recordId, canonical, userId, 'Initial version', request);

  // Sync triples from JSON-LD
  await syncTriples(recordId, uri, canonical);

  // Audit log
  await auditLog.logRecordCreated(recordId, userId, checksum, request);

  return metadata;
}

/**
 * Get record by ID (with checksum verification)
 */
export async function getRecord(recordId: string): Promise<RecordMetadata | null> {
  const row = await db.getById<RecordRow>('records', recordId);
  if (!row || row.deleted) return null;

  const stored = rowToMetadata(row);

  // Verify checksum integrity
  const recomputedChecksum = generateChecksum(stored.graphJson);
  if (recomputedChecksum !== stored.checksum) {
    console.error(`[CORRUPTION DETECTED] Record ${recordId} checksum mismatch`);
    console.error(`  Expected: ${stored.checksum}`);
    console.error(`  Computed: ${recomputedChecksum}`);
    await auditLog.logAudit('record.corrupted' as any, recordId, undefined, {
      storedChecksum: stored.checksum,
      computedChecksum: recomputedChecksum,
      detectedAt: new Date().toISOString(),
    });
    throw new Error(`Data corruption detected for record ${recordId}. Checksum mismatch.`);
  }

  return stored;
}

/**
 * Update record
 */
export async function updateRecord(
  recordId: string,
  graphJson: any,
  title?: string,
  userId?: string,
  request?: any
): Promise<RecordMetadata> {
  const existing = await getRecord(recordId);
  if (!existing) throw new Error(`Record ${recordId} not found`);
  if (existing.locked) throw new Error(`Record ${recordId} is locked (status: ${existing.status}). Cannot modify published records.`);

  const canonical = toCanonicalJsonLd(graphJson);
  const checksum = generateChecksum(canonical);
  const changes = {
    titleChanged: title && title !== existing.title,
    graphChanged: checksum !== existing.checksum,
  };

  const graph = canonical?.['@graph'] || [];
  const workNode = graph.find((n: any) => n['@type']?.includes?.('bf:Work') || n['@type'] === 'bf:Work');
  const instanceNode = graph.find((n: any) => n['@type']?.includes?.('bf:Instance') || n['@type'] === 'bf:Instance');

  const row = await db.update<RecordRow>('records', recordId, {
    graph_jsonld: canonical,
    checksum,
    title: title || existing.title,
    last_modified_by: userId || null,
    work_uri: workNode?.['@id'] || null,
    instance_uri: instanceNode?.['@id'] || null,
  });

  // Re-sync triples
  await syncTriples(recordId, row.uri, canonical);

  await auditLog.logRecordUpdated(recordId, userId, changes, checksum, request);
  return rowToMetadata(row);
}

/**
 * Delete record (soft delete)
 */
export async function deleteRecord(recordId: string, userId?: string, request?: any): Promise<void> {
  const existing = await getRecord(recordId);
  if (!existing) throw new Error(`Record ${recordId} not found`);

  await db.update('records', recordId, {
    status: 'archived',
    locked: false,
    deleted: true,
    deleted_at: new Date().toISOString(),
    deleted_by: userId || null,
    last_modified_by: userId || null,
  });

  await auditLog.logRecordArchived(recordId, userId, request);
}

/**
 * List records with pagination and filtering
 */
export async function listRecords(options?: {
  status?: RecordStatus;
  resourceType?: string;
  limit?: number;
  offset?: number;
}): Promise<RecordMetadata[]> {
  const filters: Record<string, any> = { deleted: false };
  if (options?.status) filters.status = options.status;
  if (options?.resourceType) filters.resource_type = options.resourceType;

  const rows = await db.query<RecordRow>('records', {
    filters,
    order: { column: 'updated_at', ascending: false },
    limit: options?.limit || 50,
    offset: options?.offset || 0,
  });

  return rows.map(rowToMetadata);
}

/**
 * Search records by title (trigram fuzzy search)
 */
export async function searchRecords(queryStr: string): Promise<RecordMetadata[]> {
  const rows = await db.search<RecordRow>('records', 'title', queryStr, {
    filters: { deleted: false },
    order: { column: 'updated_at', ascending: false },
    limit: 50,
  });
  return rows.map(rowToMetadata);
}

// ─── Versioning ──────────────────────────────────────────────

/**
 * Create a new version
 */
export async function createVersion(
  recordId: string,
  graphSnapshot: any,
  userId?: string,
  comment?: string,
  request?: any
): Promise<RecordVersion> {
  // Get current version number from record
  const record = await db.getById<RecordRow>('records', recordId);
  if (!record) throw new Error(`Record ${recordId} not found`);

  const canonical = toCanonicalJsonLd(graphSnapshot);
  const checksum = generateChecksum(canonical);
  const validationResult = validateForPublishing(canonical);
  const namedGraphUri = `https://moon.org/graph/${recordId}/v${record.version_number}`;

  const row = await db.insert('record_versions', {
    record_id: recordId,
    version_number: record.version_number,
    graph_snapshot: canonical,
    checksum,
    validation_result: {
      ...validationResult,
      timestamp: new Date().toISOString(),
      checksumValidated: checksum,
    },
    named_graph_uri: namedGraphUri,
    comment: comment || null,
    created_by: userId || null,
  });

  await auditLog.logVersionCreated(recordId, record.version_number, userId, checksum, request);
  await auditLog.logValidation(recordId, validationResult.valid, validationResult.errors, userId, request);

  return rowToVersion(row);
}

/**
 * List versions for a record
 */
export async function listVersions(recordId: string): Promise<RecordVersion[]> {
  const rows = await db.query<VersionRow>('record_versions', {
    filters: { record_id: recordId },
    order: { column: 'version_number', ascending: false },
  });
  return rows.map(rowToVersion);
}

/**
 * Get specific version
 */
export async function getVersion(recordId: string, versionNumber: number): Promise<RecordVersion | null> {
  const rows = await db.query<VersionRow>('record_versions', {
    filters: { record_id: recordId, version_number: versionNumber },
    limit: 1,
  });
  return rows.length > 0 ? rowToVersion(rows[0]) : null;
}

/**
 * Get latest version for a record
 */
export async function getLatestVersion(recordId: string): Promise<RecordVersion | null> {
  const versions = await listVersions(recordId);
  return versions.length > 0 ? versions[0] : null;
}

// ─── Publishing ──────────────────────────────────────────────

/**
 * Publish record (lock + validate + snapshot)
 */
export async function publishRecord(recordId: string, userId?: string, request?: any): Promise<RecordMetadata> {
  const record = await getRecord(recordId);
  if (!record) throw new Error(`Record ${recordId} not found`);

  const latestVersion = await getLatestVersion(recordId);
  if (latestVersion?.validationResult) {
    if (!latestVersion.validationResult.valid) {
      throw new Error(`Cannot publish: Record failed validation with ${latestVersion.validationResult.errors.length} errors.`);
    }
    if (latestVersion.checksum !== record.checksum) {
      throw new Error('Cannot publish: Record has been modified since last validation.');
    }
  }

  // Create version snapshot
  await createVersion(record.id, record.graphJson, userId, `Published version ${record.versionNumber}`, request);

  const row = await db.update<RecordRow>('records', recordId, {
    status: 'published',
    locked: true,
    published_at: new Date().toISOString(),
    published_by: userId || null,
    last_modified_by: userId || null,
    version_number: record.versionNumber + 1,
  });

  await auditLog.logRecordPublished(recordId, userId, row.version_number, row.checksum, request);
  await auditLog.logLockAcquired(recordId, userId, request);

  return rowToMetadata(row);
}

/**
 * Archive record
 */
export async function archiveRecord(recordId: string, userId?: string, request?: any): Promise<RecordMetadata> {
  const record = await getRecord(recordId);
  if (!record) throw new Error(`Record ${recordId} not found`);

  const wasLocked = record.locked;

  const row = await db.update<RecordRow>('records', recordId, {
    status: 'archived',
    locked: false,
    last_modified_by: userId || null,
  });

  await auditLog.logRecordArchived(recordId, userId, request);
  if (wasLocked) {
    await auditLog.logLockReleased(recordId, userId, request);
  }

  return rowToMetadata(row);
}

// ─── Triple Sync ─────────────────────────────────────────────

/**
 * Extract triples from JSON-LD and store in the triples table
 */
async function syncTriples(recordId: string, graphUri: string, canonical: any): Promise<void> {
  try {
    // Delete existing triples for this record
    await db.deleteTriplesByRecord(recordId);

    const graph = canonical?.['@graph'];
    if (!graph || !Array.isArray(graph)) return;

    const triplesToInsert: db.Triple[] = [];

    for (const node of graph) {
      const nodeId = node['@id'];
      if (!nodeId) continue;

      // Extract @type as rdf:type triples
      const types = Array.isArray(node['@type']) ? node['@type'] : node['@type'] ? [node['@type']] : [];
      for (const t of types) {
        triplesToInsert.push({
          subject: nodeId,
          predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
          object_value: t,
          object_type: 'uri',
          graph_uri: graphUri,
          record_id: recordId,
        });
      }

      // Extract all other properties
      for (const [key, value] of Object.entries(node)) {
        if (['@id', '@type', '@context'].includes(key)) continue;

        const values = Array.isArray(value) ? value : [value];
        for (const v of values) {
          if (v === null || v === undefined) continue;

          if (typeof v === 'object' && v['@id']) {
            triplesToInsert.push({
              subject: nodeId,
              predicate: key,
              object_value: v['@id'],
              object_type: 'uri',
              graph_uri: graphUri,
              record_id: recordId,
            });
          } else if (typeof v === 'object' && v['@value']) {
            triplesToInsert.push({
              subject: nodeId,
              predicate: key,
              object_value: v['@value'],
              object_type: 'literal',
              object_lang: v['@language'] || null,
              object_datatype: v['@type'] || null,
              graph_uri: graphUri,
              record_id: recordId,
            });
          } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
            triplesToInsert.push({
              subject: nodeId,
              predicate: key,
              object_value: String(v),
              object_type: 'literal',
              graph_uri: graphUri,
              record_id: recordId,
            });
          }
        }
      }
    }

    if (triplesToInsert.length > 0) {
      await db.insertTriples(triplesToInsert);
    }

    // Update named graph
    await db.upsertNamedGraph(graphUri, recordId, triplesToInsert.length);

    console.log(`[TRIPLES] Synced ${triplesToInsert.length} triples for record ${recordId}`);
  } catch (error) {
    console.error(`[TRIPLES] Failed to sync triples for record ${recordId}:`, error);
    // Don't throw - triple sync failure should not block record save
  }
}

// ─── Validation ──────────────────────────────────────────────

export function validateForPublishing(graphJson: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!graphJson || !graphJson['@graph']) {
    errors.push('Graph is empty');
    return { valid: false, errors };
  }

  const graph = graphJson['@graph'];

  const works = graph.filter((node: any) =>
    node['@type'] === 'bf:Work' || (Array.isArray(node['@type']) && node['@type'].includes('bf:Work'))
  );
  if (works.length === 0) errors.push('At least one Work is required');

  const instances = graph.filter((node: any) =>
    node['@type'] === 'bf:Instance' || (Array.isArray(node['@type']) && node['@type'].includes('bf:Instance'))
  );
  if (instances.length === 0) errors.push('At least one Instance is required');

  works.forEach((work: any, idx: number) => {
    if (!work['bf:title']) errors.push(`Work ${idx + 1}: Title is required`);
    if (!work['bf:contribution']) errors.push(`Work ${idx + 1}: At least one contribution is required`);
  });

  instances.forEach((instance: any, idx: number) => {
    if (!instance['bf:instanceOf']) errors.push(`Instance ${idx + 1}: instanceOf is required`);
  });

  return { valid: errors.length === 0, errors };
}

// ─── Public & Export ─────────────────────────────────────────

export async function getPublicRecord(recordId: string): Promise<any | null> {
  const record = await getRecord(recordId);
  if (!record || record.status !== 'published') return null;

  const publicGraph = addExportMetadata(record.graphJson, record.publishedBy, recordId);
  return {
    '@context': publicGraph['@context'],
    '@graph': publicGraph['@graph'],
    metadata: {
      recordId: record.id,
      title: record.title,
      publishedAt: record.publishedAt,
      publishedBy: record.publishedBy,
      versionNumber: record.versionNumber,
      checksum: record.checksum,
    },
  };
}

export async function exportRecordWithMetadata(
  recordId: string,
  userId?: string,
  format: 'jsonld' | 'turtle' | 'marc' = 'jsonld'
): Promise<any> {
  const record = await getRecord(recordId);
  if (!record) throw new Error(`Record ${recordId} not found`);

  const enriched = addExportMetadata(record.graphJson, userId, recordId);
  return {
    data: enriched,
    metadata: {
      recordId: record.id,
      title: record.title,
      status: record.status,
      versionNumber: record.versionNumber,
      checksum: record.checksum,
      exportedAt: new Date().toISOString(),
      exportedBy: userId,
      exportFormat: format,
    },
  };
}

export async function getRecordAuditHistory(recordId: string): Promise<any[]> {
  return await auditLog.getAuditHistory(recordId);
}

export async function getValidationHistory(recordId: string): Promise<any[]> {
  const versions = await listVersions(recordId);
  return versions
    .filter(v => v.validationResult)
    .map(v => ({
      versionNumber: v.versionNumber,
      timestamp: v.validationResult?.timestamp,
      valid: v.validationResult?.valid,
      errors: v.validationResult?.errors,
      createdBy: v.createdBy,
    }));
}
