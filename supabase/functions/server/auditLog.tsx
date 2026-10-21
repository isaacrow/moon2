/**
 * Audit Log Service - PostgreSQL Backend
 * Complete lifecycle tracking for all record operations
 * 
 * MIGRATED: Now uses the audit_log table directly
 * Append-only. Never updates or deletes entries.
 */

import * as db from './db.tsx';

export type AuditAction =
  | 'record.created'
  | 'record.updated'
  | 'record.deleted'
  | 'record.archived'
  | 'record.published'
  | 'record.unpublished'
  | 'record.corrupted'
  | 'version.created'
  | 'version.restored'
  | 'export.jsonld'
  | 'export.turtle'
  | 'export.rdfxml'
  | 'export.marc'
  | 'validation.passed'
  | 'validation.failed'
  | 'lock.acquired'
  | 'lock.released';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  recordId: string;
  userId?: string;
  metadata?: {
    versionNumber?: number;
    status?: string;
    checksum?: string;
    validationErrors?: string[];
    exportFormat?: string;
    changes?: any;
    [key: string]: any;
  };
  ipAddress?: string;
  userAgent?: string;
}

interface AuditRow {
  id: string;
  timestamp: string;
  action: string;
  entity_type: string;
  entity_id: string;
  version_number: number | null;
  user_id: string | null;
  institution_id: string | null;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  archived: boolean;
}

function rowToEntry(row: AuditRow): AuditLogEntry {
  return {
    id: row.id,
    timestamp: row.timestamp,
    action: row.action as AuditAction,
    recordId: row.entity_id,
    userId: row.user_id || undefined,
    metadata: row.metadata || undefined,
    ipAddress: row.ip_address || undefined,
    userAgent: row.user_agent || undefined,
  };
}

/**
 * Create an audit log entry (append-only INSERT)
 */
export async function logAudit(
  action: AuditAction,
  recordId: string,
  userId?: string,
  metadata?: any,
  request?: any
): Promise<AuditLogEntry> {
  const row = await db.insert('audit_log', {
    action,
    entity_type: 'record',
    entity_id: recordId,
    user_id: userId || null,
    metadata: metadata || {},
    ip_address: request?.headers?.get('x-forwarded-for') || request?.headers?.get('x-real-ip') || null,
    user_agent: request?.headers?.get('user-agent') || null,
  });

  console.log(`[AUDIT] ${action} - Record: ${recordId} - User: ${userId || 'system'}`);
  return rowToEntry(row);
}

/**
 * Get all audit logs for a record (sorted by timestamp desc)
 */
export async function getAuditHistory(recordId: string): Promise<AuditLogEntry[]> {
  const rows = await db.query<AuditRow>('audit_log', {
    filters: { entity_id: recordId, archived: false },
    order: { column: 'timestamp', ascending: false },
  });
  return rows.map(rowToEntry);
}

/**
 * Get audit logs by action type
 */
export async function getAuditByAction(
  recordId: string,
  action: AuditAction
): Promise<AuditLogEntry[]> {
  const rows = await db.query<AuditRow>('audit_log', {
    filters: { entity_id: recordId, action, archived: false },
    order: { column: 'timestamp', ascending: false },
  });
  return rows.map(rowToEntry);
}

/**
 * Get most recent audit entry
 */
export async function getLastAudit(
  recordId: string,
  action?: AuditAction
): Promise<AuditLogEntry | null> {
  const logs = action
    ? await getAuditByAction(recordId, action)
    : await getAuditHistory(recordId);
  return logs.length > 0 ? logs[0] : null;
}

/**
 * Get audit summary statistics
 */
export async function getAuditStats(recordId: string): Promise<{
  totalActions: number;
  actionCounts: Record<string, number>;
  firstAction: string;
  lastAction: string;
  uniqueUsers: number;
}> {
  const logs = await getAuditHistory(recordId);

  const actionCounts: Record<string, number> = {};
  const users = new Set<string>();

  logs.forEach(log => {
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    if (log.userId) users.add(log.userId);
  });

  return {
    totalActions: logs.length,
    actionCounts,
    firstAction: logs.length > 0 ? logs[logs.length - 1].timestamp : '',
    lastAction: logs.length > 0 ? logs[0].timestamp : '',
    uniqueUsers: users.size,
  };
}

// ─── Convenience loggers ─────────────────────────────────────

export async function logRecordCreated(recordId: string, userId?: string, checksum?: string, request?: any): Promise<void> {
  await logAudit('record.created', recordId, userId, { checksum }, request);
}

export async function logRecordUpdated(recordId: string, userId?: string, changes?: any, checksum?: string, request?: any): Promise<void> {
  await logAudit('record.updated', recordId, userId, { changes, checksum }, request);
}

export async function logRecordDeleted(recordId: string, userId?: string, request?: any): Promise<void> {
  await logAudit('record.deleted', recordId, userId, {}, request);
}

export async function logRecordArchived(recordId: string, userId?: string, request?: any): Promise<void> {
  await logAudit('record.archived', recordId, userId, {}, request);
}

export async function logRecordPublished(recordId: string, userId?: string, versionNumber?: number, checksum?: string, request?: any): Promise<void> {
  await logAudit('record.published', recordId, userId, { status: 'published', versionNumber, checksum }, request);
}

export async function logVersionCreated(recordId: string, versionNumber: number, userId?: string, checksum?: string, request?: any): Promise<void> {
  await logAudit('version.created', recordId, userId, { versionNumber, checksum }, request);
}

export async function logExport(recordId: string, format: 'jsonld' | 'turtle' | 'rdfxml' | 'marc', userId?: string, request?: any): Promise<void> {
  const actionMap: Record<string, AuditAction> = {
    jsonld: 'export.jsonld', turtle: 'export.turtle', rdfxml: 'export.rdfxml', marc: 'export.marc',
  };
  await logAudit(actionMap[format], recordId, userId, { exportFormat: format, exportedAt: new Date().toISOString() }, request);
}

export async function logValidation(recordId: string, passed: boolean, errors?: string[], userId?: string, request?: any): Promise<void> {
  const action: AuditAction = passed ? 'validation.passed' : 'validation.failed';
  await logAudit(action, recordId, userId, { validationErrors: errors || [], validatedAt: new Date().toISOString() }, request);
}

export async function logLockAcquired(recordId: string, userId?: string, request?: any): Promise<void> {
  await logAudit('lock.acquired', recordId, userId, { lockedAt: new Date().toISOString() }, request);
}

export async function logLockReleased(recordId: string, userId?: string, request?: any): Promise<void> {
  await logAudit('lock.released', recordId, userId, { unlockedAt: new Date().toISOString() }, request);
}

// ─── Archival ────────────────────────────────────────────────

/**
 * Archive old audit logs (set archived=true, never delete)
 */
export async function archiveOldAudits(
  recordId: string,
  retentionDays: number = 365
): Promise<number> {
  const logs = await getAuditHistory(recordId);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  let archivedCount = 0;

  for (const log of logs) {
    const logDate = new Date(log.timestamp);
    if (logDate < cutoffDate) {
      // Mark as archived (the DB trigger prevents deletes)
      try {
        await db.update('audit_log', log.id, { archived: true, archived_at: new Date().toISOString() });
        archivedCount++;
      } catch (e) {
        // The immutability trigger may block this - that's OK
        console.log(`[AUDIT] Could not archive ${log.id}: ${e}`);
      }
    }
  }

  console.log(`[AUDIT ARCHIVE] Archived ${archivedCount} logs older than ${retentionDays} days for record ${recordId}`);
  return archivedCount;
}

/**
 * Get archived audit logs
 */
export async function getArchivedAuditHistory(recordId: string): Promise<AuditLogEntry[]> {
  const rows = await db.query<AuditRow>('audit_log', {
    filters: { entity_id: recordId, archived: true },
    order: { column: 'timestamp', ascending: false },
  });
  return rows.map(rowToEntry);
}

/**
 * DEPRECATED: cleanupOldAudits - audit logs are immutable
 */
export async function cleanupOldAudits(recordId: string, retentionDays: number = 365): Promise<number> {
  throw new Error('DEPRECATED: cleanupOldAudits() is not allowed. Audit logs are immutable. Use archiveOldAudits() instead.');
}
