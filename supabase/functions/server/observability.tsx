/**
 * 📊 OBSERVABILITY & MONITORING
 * Persistent logging, metrics, and alerting for production operations
 * 
 * Features:
 * - Persistent audit logs
 * - Error tracking
 * - Performance metrics
 * - Failed operation logging
 * - Alert triggers
 */

import * as db from "./db.tsx";
const kv = { set: db.kvSet, get: db.kvGet, del: db.kvDel, getByPrefix: db.kvGetByPrefix };
import { Context } from "npm:hono";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  institutionId: string;
  action: string;
  resource: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  institutionId?: string;
  error: string;
  stack?: string;
  context: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface PerformanceMetric {
  id: string;
  timestamp: string;
  operation: string;
  duration: number;
  recordCount?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

/**
 * 📝 PERSISTENT AUDIT LOGGING
 * Stores all authenticated requests with full context
 */
export async function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    const auditEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...entry
    };

    // Store with timestamp-based key for easy querying
    const key = `moon:audit:${entry.institutionId}:${Date.now()}:${auditEntry.id}`;
    await kv.set(key, JSON.stringify(auditEntry));

    // Also log to console for immediate visibility
    console.log(`[AUDIT] ${entry.method} ${entry.path} - ${entry.userEmail} - ${entry.status} - ${entry.duration}ms`);
  } catch (error) {
    console.error('[OBSERVABILITY] Failed to log audit event:', error);
    // Don't throw - audit logging failure shouldn't break the request
  }
}

/**
 * 🚨 ERROR LOGGING
 * Persistent error tracking with context
 */
export async function logError(
  error: Error | string,
  context: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const errorEntry: ErrorLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      severity,
      userId: metadata?.userId,
      institutionId: metadata?.institutionId,
      metadata
    };

    const key = `moon:errors:${severity}:${Date.now()}:${errorEntry.id}`;
    await kv.set(key, JSON.stringify(errorEntry));

    console.error(`[ERROR ${severity.toUpperCase()}] ${context}: ${errorEntry.error}`);

    // Alert on critical errors
    if (severity === 'critical') {
      await triggerAlert('critical_error', errorEntry);
    }
  } catch (logError) {
    console.error('[OBSERVABILITY] Failed to log error:', logError);
  }
}

/**
 * 📊 PERFORMANCE METRICS
 * Track operation duration and success rates
 */
export async function logPerformanceMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): Promise<void> {
  try {
    const perfMetric: PerformanceMetric = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...metric
    };

    const key = `moon:metrics:${metric.operation}:${Date.now()}:${perfMetric.id}`;
    await kv.set(key, JSON.stringify(perfMetric));

    // Log slow operations (>5s)
    if (perfMetric.duration > 5000) {
      console.warn(`[PERFORMANCE] Slow operation: ${metric.operation} took ${metric.duration}ms`);
    }
  } catch (error) {
    console.error('[OBSERVABILITY] Failed to log performance metric:', error);
  }
}

/**
 * 🔍 FAILED SHACL VALIDATION LOGGING
 */
export async function logSHACLValidationFailure(
  documentId: string,
  institutionId: string,
  userId: string,
  violations: any[]
): Promise<void> {
  try {
    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      documentId,
      institutionId,
      userId,
      violations,
      violationCount: violations.length
    };

    const key = `moon:validation-failures:${institutionId}:${Date.now()}:${entry.id}`;
    await kv.set(key, JSON.stringify(entry));

    console.warn(`[SHACL FAILURE] Document ${documentId} failed validation with ${violations.length} violations`);
  } catch (error) {
    console.error('[OBSERVABILITY] Failed to log SHACL validation failure:', error);
  }
}

/**
 * 🔗 FAILED AUTHORITY MERGE LOGGING
 */
export async function logMergeFailure(
  canonicalId: string,
  mergeIds: string[],
  institutionId: string,
  userId: string,
  error: string
): Promise<void> {
  try {
    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      canonicalId,
      mergeIds,
      institutionId,
      userId,
      error
    };

    const key = `moon:merge-failures:${institutionId}:${Date.now()}:${entry.id}`;
    await kv.set(key, JSON.stringify(entry));

    console.error(`[MERGE FAILURE] Failed to merge ${mergeIds.join(',')} into ${canonicalId}: ${error}`);

    await logError(
      error,
      'authority_merge',
      'high',
      { canonicalId, mergeIds, institutionId, userId }
    );
  } catch (logError) {
    console.error('[OBSERVABILITY] Failed to log merge failure:', logError);
  }
}

/**
 * 🔄 TRIPLE STORE SYNC FAILURE LOGGING
 */
export async function logTripleStoreSyncFailure(
  recordId: string,
  institutionId: string,
  operation: 'upload' | 'delete' | 'update',
  error: string
): Promise<void> {
  try {
    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      recordId,
      institutionId,
      operation,
      error
    };

    const key = `moon:triplestore-failures:${institutionId}:${Date.now()}:${entry.id}`;
    await kv.set(key, JSON.stringify(entry));

    console.error(`[TRIPLE STORE FAILURE] ${operation} failed for record ${recordId}: ${error}`);

    // This is critical - triple store out of sync
    await triggerAlert('triplestore_sync_failure', entry);
  } catch (logError) {
    console.error('[OBSERVABILITY] Failed to log triple store sync failure:', logError);
  }
}

/**
 * 🚨 ALERT TRIGGERS
 * Send alerts for critical events
 */
async function triggerAlert(type: string, data: any): Promise<void> {
  try {
    const alert = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type,
      data,
      acknowledged: false
    };

    const key = `moon:alerts:${type}:${Date.now()}:${alert.id}`;
    await kv.set(key, JSON.stringify(alert));

    // TODO: Send to external alerting service (PagerDuty, Slack, email, etc.)
    console.error(`🚨 ALERT [${type}]:`, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('[OBSERVABILITY] Failed to trigger alert:', error);
  }
}

/**
 * 📊 QUERY AUDIT LOGS
 */
export async function getAuditLogs(
  institutionId: string,
  options?: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
): Promise<AuditLogEntry[]> {
  try {
    const prefix = `moon:audit:${institutionId}:`;
    const allLogs = await kv.getByPrefix(prefix);

    let logs = allLogs
      .map((data: any) => {
        try {
          return typeof data === 'string' ? JSON.parse(data) : data;
        } catch {
          return null;
        }
      })
      .filter((log): log is AuditLogEntry => log !== null);

    // Filter by user
    if (options?.userId) {
      logs = logs.filter(log => log.userId === options.userId);
    }

    // Filter by date range
    if (options?.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= options.startDate!);
    }
    if (options?.endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= options.endDate!);
    }

    // Sort by timestamp descending (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit results
    if (options?.limit) {
      logs = logs.slice(0, options.limit);
    }

    return logs;
  } catch (error) {
    console.error('[OBSERVABILITY] Failed to query audit logs:', error);
    return [];
  }
}

/**
 * 📊 QUERY ERROR LOGS
 */
export async function getErrorLogs(
  severity?: 'low' | 'medium' | 'high' | 'critical',
  limit: number = 100
): Promise<ErrorLogEntry[]> {
  try {
    const prefix = severity ? `moon:errors:${severity}:` : 'moon:errors:';
    const allErrors = await kv.getByPrefix(prefix);

    const errors = allErrors
      .map((data: any) => {
        try {
          return typeof data === 'string' ? JSON.parse(data) : data;
        } catch {
          return null;
        }
      })
      .filter((error): error is ErrorLogEntry => error !== null);

    // Sort by timestamp descending
    errors.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return errors.slice(0, limit);
  } catch (error) {
    console.error('[OBSERVABILITY] Failed to query error logs:', error);
    return [];
  }
}

/**
 * 📊 GET PERFORMANCE METRICS
 */
export async function getPerformanceMetrics(
  operation?: string,
  startDate?: Date,
  endDate?: Date
): Promise<PerformanceMetric[]> {
  try {
    const prefix = operation ? `moon:metrics:${operation}:` : 'moon:metrics:';
    const allMetrics = await kv.getByPrefix(prefix);

    let metrics = allMetrics
      .map((data: any) => {
        try {
          return typeof data === 'string' ? JSON.parse(data) : data;
        } catch {
          return null;
        }
      })
      .filter((metric): metric is PerformanceMetric => metric !== null);

    // Filter by date range
    if (startDate) {
      metrics = metrics.filter(m => new Date(m.timestamp) >= startDate);
    }
    if (endDate) {
      metrics = metrics.filter(m => new Date(m.timestamp) <= endDate);
    }

    return metrics;
  } catch (error) {
    console.error('[OBSERVABILITY] Failed to query performance metrics:', error);
    return [];
  }
}

/**
 * 📊 GET SYSTEM HEALTH
 */
export async function getSystemHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'critical';
  metrics: {
    errorRate: number;
    avgResponseTime: number;
    recentErrors: number;
    criticalAlerts: number;
  };
  issues: string[];
}> {
  try {
    // Get recent errors (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentErrors = await getErrorLogs(undefined, 1000);
    const recentErrorsFiltered = recentErrors.filter(e => 
      new Date(e.timestamp) >= oneHourAgo
    );

    // Get critical alerts
    const criticalErrors = recentErrorsFiltered.filter(e => e.severity === 'critical');

    // Get recent metrics
    const recentMetrics = await getPerformanceMetrics(undefined, oneHourAgo);
    const avgResponseTime = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
      : 0;

    const errorRate = recentMetrics.length > 0
      ? (recentMetrics.filter(m => !m.success).length / recentMetrics.length) * 100
      : 0;

    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

    if (criticalErrors.length > 0) {
      status = 'critical';
      issues.push(`${criticalErrors.length} critical errors in the last hour`);
    }

    if (errorRate > 10) {
      status = status === 'critical' ? 'critical' : 'degraded';
      issues.push(`High error rate: ${errorRate.toFixed(2)}%`);
    }

    if (avgResponseTime > 2000) {
      status = status === 'critical' ? 'critical' : 'degraded';
      issues.push(`Slow average response time: ${avgResponseTime.toFixed(0)}ms`);
    }

    return {
      status,
      metrics: {
        errorRate,
        avgResponseTime,
        recentErrors: recentErrorsFiltered.length,
        criticalAlerts: criticalErrors.length
      },
      issues
    };
  } catch (error) {
    console.error('[OBSERVABILITY] Failed to get system health:', error);
    return {
      status: 'critical',
      metrics: { errorRate: 0, avgResponseTime: 0, recentErrors: 0, criticalAlerts: 0 },
      issues: ['Failed to retrieve system health metrics']
    };
  }
}

/**
 * 🔄 ENHANCED AUDIT MIDDLEWARE
 * Tracks all requests with persistent storage
 */
export async function enhancedAuditLog(c: Context, next: () => Promise<void>) {
  const startTime = Date.now();
  const user = (c as any).user;
  
  await next();
  
  const duration = Date.now() - startTime;

  if (user) {
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      institutionId: user.institutionId,
      action: `${c.req.method} ${c.req.path}`,
      resource: c.req.path.split('/').pop() || 'unknown',
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration,
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent')
    });
  }
}