/**
 * 🔐 AUTHENTICATION & AUTHORIZATION MIDDLEWARE
 * Production-grade security enforcement for all API endpoints
 * 
 * CRITICAL: NO ENDPOINT should bypass this middleware
 */

import { Context } from "npm:hono";
import * as multiTenant from "./multiTenant.tsx";
import * as jwtAuth from "./jwtAuth.tsx";

export interface AuthContext extends Context {
  user?: {
    id: string;
    email: string;
    institutionId: string;
    roles: string[];
    permissions: string[];
    jwtPayload?: any;
  };
}

/**
 * ✅ PRODUCTION AUTHENTICATION
 * Supports both JWT tokens (production) and X-User-ID (development)
 * 
 * Production: Authorization: Bearer <jwt-token>
 * Development: X-User-ID: <user-id>
 */
export async function requireAuth(c: Context, next: () => Promise<void>) {
  // Use new JWT authentication (handles fallback to X-User-ID)
  return jwtAuth.requireJWTAuth(c, next);
}

/**
 * 🛡️ PERMISSION-BASED AUTHORIZATION
 * Verify user has required permission
 */
export function requirePermission(permission: string) {
  return async (c: Context, next: () => Promise<void>) => {
    const user = (c as any).user;
    
    if (!user) {
      return c.json({ 
        error: 'Unauthorized', 
        message: 'Authentication required' 
      }, 401);
    }

    if (!user.permissions.includes(permission)) {
      return c.json({ 
        error: 'Forbidden', 
        message: `Required permission: ${permission}`,
        userPermissions: user.permissions
      }, 403);
    }

    await next();
  };
}

/**
 * 👥 ROLE-BASED AUTHORIZATION
 * Verify user has required role
 */
export function requireRole(role: string) {
  return async (c: Context, next: () => Promise<void>) => {
    const user = (c as any).user;
    
    if (!user) {
      return c.json({ 
        error: 'Unauthorized', 
        message: 'Authentication required' 
      }, 401);
    }

    if (!user.roles.includes(role)) {
      return c.json({ 
        error: 'Forbidden', 
        message: `Required role: ${role}`,
        userRoles: user.roles
      }, 403);
    }

    await next();
  };
}

/**
 * 🏢 INSTITUTION ISOLATION
 * Ensure user can only access data from their institution
 */
export async function requireInstitutionAccess(c: Context, next: () => Promise<void>) {
  const user = (c as any).user;
  
  if (!user) {
    return c.json({ 
      error: 'Unauthorized', 
      message: 'Authentication required' 
    }, 401);
  }

  // Get institution ID from request (path param or body)
  const pathInstitutionId = c.req.param('institutionId');
  const bodyInstitutionId = await c.req.json().then(data => data.institutionId).catch(() => null);
  const requestedInstitutionId = pathInstitutionId || bodyInstitutionId;

  if (requestedInstitutionId && requestedInstitutionId !== user.institutionId) {
    // Admin can access any institution
    if (!user.roles.includes('admin')) {
      return c.json({ 
        error: 'Forbidden', 
        message: 'You can only access data from your institution',
        userInstitution: user.institutionId,
        requestedInstitution: requestedInstitutionId
      }, 403);
    }
  }

  await next();
}

/**
 * 🚫 RESTRICT SPARQL UPDATE
 * Only admins and SPARQL-authorized users can execute SPARQL UPDATE
 */
export async function requireSparqlUpdatePermission(c: Context, next: () => Promise<void>) {
  const user = (c as any).user;
  
  if (!user) {
    return c.json({ 
      error: 'Unauthorized', 
      message: 'Authentication required' 
    }, 401);
  }

  // Check if query contains UPDATE/DELETE/INSERT/DROP/CLEAR
  const body = await c.req.text();
  const query = body.toLowerCase();
  
  const isUpdateQuery = 
    query.includes('insert') ||
    query.includes('delete') ||
    query.includes('drop') ||
    query.includes('clear') ||
    query.includes('load') ||
    query.includes('create') ||
    query.includes('copy') ||
    query.includes('move') ||
    query.includes('add');

  if (isUpdateQuery) {
    if (!user.permissions.includes('sparql.update') && !user.roles.includes('admin')) {
      return c.json({ 
        error: 'Forbidden', 
        message: 'SPARQL UPDATE operations require admin permission',
        detectedOperation: 'SPARQL UPDATE/DELETE/INSERT'
      }, 403);
    }
  }

  await next();
}

/**
 * 🔴 ADMIN-ONLY OPERATIONS
 * Restrict destructive operations to admins only
 */
export async function requireAdmin(c: Context, next: () => Promise<void>) {
  const user = (c as any).user;
  
  if (!user) {
    return c.json({ 
      error: 'Unauthorized', 
      message: 'Authentication required' 
    }, 401);
  }

  if (!user.roles.includes('admin')) {
    return c.json({ 
      error: 'Forbidden', 
      message: 'This operation requires administrator privileges',
      userRoles: user.roles
    }, 403);
  }

  await next();
}

/**
 * 📊 AUDIT LOGGING MIDDLEWARE
 * Log all authenticated requests for security audit
 * Now uses persistent storage via observability module
 */
export async function auditLog(c: Context, next: () => Promise<void>) {
  // Import observability module dynamically to avoid circular deps
  const observability = await import("./observability.tsx");
  return observability.enhancedAuditLog(c, next);
}

/**
 * 🔓 PUBLIC ENDPOINT (No Auth Required)
 * Explicitly mark endpoints that don't need authentication
 */
export async function publicEndpoint(c: Context, next: () => Promise<void>) {
  // Mark as public (for documentation/clarity)
  (c as any).isPublic = true;
  await next();
}
