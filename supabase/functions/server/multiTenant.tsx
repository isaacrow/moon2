/**
 * 🏛️ MULTI-TENANT ARCHITECTURE
 * Support multiple institutions on shared infrastructure
 * Namespace isolation, permission roles, dataset partitioning
 */

import * as db from "./db.tsx";
const kv = { set: db.kvSet, get: db.kvGet, del: db.kvDel, getByPrefix: db.kvGetByPrefix };

export interface Institution {
  id: string;
  name: string;
  namespace: string;              // URI base: https://institution.org
  baseUri: string;                // Resource URI base
  settings: {
    catalogingRules?: 'RDA' | 'AACR2' | 'custom';
    defaultLanguage?: string;
    bibframeVersion?: '2.0' | '3.0';
    enableAuthorities?: boolean;
    enableVersioning?: boolean;
    tripleStoreConfig?: any;
  };
  metadata: {
    created: string;
    contactEmail: string;
    type: 'library' | 'archive' | 'museum' | 'university' | 'research';
    country?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  institutionId: string;
  roles: UserRole[];
  permissions: Permission[];
  metadata: {
    created: string;
    lastLogin?: string;
  };
}

export type UserRole = 
  | 'admin'              // Full system access
  | 'cataloger'          // Create/edit records
  | 'authority_manager'  // Manage authorities, merge duplicates
  | 'graph_admin'        // Triple store management
  | 'sparql_admin'       // SPARQL endpoint configuration
  | 'viewer';            // Read-only access

export type Permission =
  | 'records.create'
  | 'records.edit'
  | 'records.delete'
  | 'records.publish'
  | 'authorities.create'
  | 'authorities.edit'
  | 'authorities.merge'
  | 'authorities.delete'
  | 'sparql.query'
  | 'sparql.update'
  | 'triplestore.sync'
  | 'settings.edit'
  | 'users.manage';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'records.create', 'records.edit', 'records.delete', 'records.publish',
    'authorities.create', 'authorities.edit', 'authorities.merge', 'authorities.delete',
    'sparql.query', 'sparql.update',
    'triplestore.sync',
    'settings.edit',
    'users.manage'
  ],
  cataloger: [
    'records.create', 'records.edit',
    'authorities.create',
    'sparql.query'
  ],
  authority_manager: [
    'authorities.create', 'authorities.edit', 'authorities.merge',
    'sparql.query'
  ],
  graph_admin: [
    'sparql.query', 'sparql.update',
    'triplestore.sync'
  ],
  sparql_admin: [
    'sparql.query', 'sparql.update',
    'triplestore.sync'
  ],
  viewer: [
    'sparql.query'
  ]
};

/**
 * Create institution
 */
export async function createInstitution(data: Omit<Institution, 'id'>): Promise<Institution> {
  const id = crypto.randomUUID();
  
  const institution: Institution = {
    id,
    ...data
  };

  await kv.set(`moon:institution:${id}`, JSON.stringify(institution));
  await kv.set(`moon:institution:namespace:${data.namespace}`, id);

  console.log(`[MULTI-TENANT] Created institution: ${data.name} (${id})`);

  return institution;
}

/**
 * Get institution
 */
export async function getInstitution(id: string): Promise<Institution | null> {
  try {
    const data = await kv.get(`moon:institution:${id}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('[MULTI-TENANT] Error getting institution:', error);
    return null;
  }
}

/**
 * Get institution by namespace
 */
export async function getInstitutionByNamespace(namespace: string): Promise<Institution | null> {
  try {
    const id = await kv.get(`moon:institution:namespace:${namespace}`);
    if (!id) return null;
    return await getInstitution(id);
  } catch (error) {
    console.error('[MULTI-TENANT] Error getting institution by namespace:', error);
    return null;
  }
}

/**
 * List all institutions
 */
export async function listInstitutions(): Promise<Institution[]> {
  try {
    const allInstitutions = await kv.getByPrefix('moon:institution:');
    
    return allInstitutions
      .filter((record: string) => {
        try {
          const parsed = JSON.parse(record);
          return parsed.id && !record.includes(':namespace:');
        } catch {
          return false;
        }
      })
      .map((r: string) => JSON.parse(r));
  } catch (error) {
    console.error('[MULTI-TENANT] Error listing institutions:', error);
    return [];
  }
}

/**
 * Create user
 */
export async function createUser(data: Omit<User, 'id' | 'permissions' | 'metadata'>): Promise<User> {
  const id = crypto.randomUUID();
  
  // Calculate permissions from roles
  const permissions = new Set<Permission>();
  data.roles.forEach(role => {
    ROLE_PERMISSIONS[role].forEach(perm => permissions.add(perm));
  });

  const user: User = {
    id,
    ...data,
    permissions: Array.from(permissions),
    metadata: {
      created: new Date().toISOString()
    }
  };

  await kv.set(`moon:user:${id}`, JSON.stringify(user));
  await kv.set(`moon:user:email:${data.email}`, id);

  console.log(`[MULTI-TENANT] Created user: ${data.email} (${id})`);

  return user;
}

/**
 * Get user
 */
export async function getUser(id: string): Promise<User | null> {
  try {
    const data = await kv.get(`moon:user:${id}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('[MULTI-TENANT] Error getting user:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const id = await kv.get(`moon:user:email:${email}`);
    if (!id) return null;
    return await getUser(id);
  } catch (error) {
    console.error('[MULTI-TENANT] Error getting user by email:', error);
    return null;
  }
}

/**
 * Check if user has permission
 */
export function hasPermission(user: User, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

/**
 * Check if user has role
 */
export function hasRole(user: User, role: UserRole): boolean {
  return user.roles.includes(role);
}

/**
 * Generate namespaced URI
 */
export function generateNamespacedUri(
  institution: Institution,
  entityType: 'work' | 'instance' | 'item' | 'authority',
  id: string
): string {
  return `${institution.baseUri}/${entityType}/${id}`;
}

/**
 * Get dataset key prefix for institution
 * Ensures all data is partitioned by institution
 */
export function getDatasetPrefix(institutionId: string, dataType: 'record' | 'authority'): string {
  return `moon:${institutionId}:${dataType}:`;
}

/**
 * Save record with institution namespace
 */
export async function saveInstitutionRecord(
  institutionId: string,
  recordId: string,
  document: any,
  userId: string
): Promise<void> {
  const institution = await getInstitution(institutionId);
  if (!institution) {
    throw new Error('Institution not found');
  }

  const user = await getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!hasPermission(user, 'records.create') && !hasPermission(user, 'records.edit')) {
    throw new Error('User does not have permission to save records');
  }

  // Save with institution prefix
  const key = `${getDatasetPrefix(institutionId, 'record')}${recordId}`;
  
  const record = {
    id: recordId,
    institutionId,
    document,
    metadata: {
      created: new Date().toISOString(),
      createdBy: userId
    }
  };

  await kv.set(key, JSON.stringify(record));

  console.log(`[MULTI-TENANT] Saved record ${recordId} for institution ${institutionId}`);
}

/**
 * Get institution records (dataset isolation)
 */
export async function getInstitutionRecords(institutionId: string): Promise<any[]> {
  try {
    const prefix = getDatasetPrefix(institutionId, 'record');
    const records = await kv.getByPrefix(prefix);
    
    return records
      .filter((r: string) => {
        try {
          const parsed = JSON.parse(r);
          return parsed.id;
        } catch {
          return false;
        }
      })
      .map((r: string) => JSON.parse(r));
  } catch (error) {
    console.error('[MULTI-TENANT] Error getting institution records:', error);
    return [];
  }
}

/**
 * SPARQL query with institution filtering
 */
export function getInstitutionSparqlQuery(institutionId: string, baseQuery: string): string {
  // Modify SPARQL query to filter by institution namespace
  // This ensures cross-tenant data isolation at query level
  
  return `
    PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
    PREFIX moon: <https://moon.org/>
    
    SELECT * WHERE {
      GRAPH ?g {
        ${baseQuery}
      }
      
      # Filter to institution's named graphs only
      FILTER(STRSTARTS(STR(?g), "https://moon.org/institution/${institutionId}/"))
    }
  `;
}

/**
 * Middleware: Verify user has access to institution
 */
export async function verifyInstitutionAccess(
  userId: string,
  institutionId: string
): Promise<boolean> {
  const user = await getUser(userId);
  if (!user) return false;
  
  return user.institutionId === institutionId;
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<{
  recordsCreated: number;
  recordsEdited: number;
  authoritiesCreated: number;
  authoritiesMerged: number;
}> {
  // Would query audit logs
  return {
    recordsCreated: 0,
    recordsEdited: 0,
    authoritiesCreated: 0,
    authoritiesMerged: 0
  };
}

/**
 * Get institution statistics
 */
export async function getInstitutionStats(institutionId: string): Promise<{
  totalRecords: number;
  totalAuthorities: number;
  totalUsers: number;
  storageUsed: number;
  lastActivity?: string;
}> {
  const records = await getInstitutionRecords(institutionId);
  const authorities = await kv.getByPrefix(getDatasetPrefix(institutionId, 'authority'));
  
  return {
    totalRecords: records.length,
    totalAuthorities: authorities.length,
    totalUsers: 0, // Would count users
    storageUsed: 0, // Would calculate from data
    lastActivity: new Date().toISOString()
  };
}

/**
 * Example institution setups
 */
export const EXAMPLE_INSTITUTIONS = {
  libraryOfCongress: {
    name: 'Library of Congress',
    namespace: 'https://id.loc.gov',
    baseUri: 'https://id.loc.gov/resources',
    settings: {
      catalogingRules: 'RDA' as const,
      defaultLanguage: 'eng',
      bibframeVersion: '3.0' as const,
      enableAuthorities: true,
      enableVersioning: true
    },
    metadata: {
      created: new Date().toISOString(),
      contactEmail: 'ndmso@loc.gov',
      type: 'library' as const,
      country: 'US'
    }
  },
  
  nationalLibrarySweden: {
    name: 'Kungliga biblioteket (National Library of Sweden)',
    namespace: 'https://libris.kb.se',
    baseUri: 'https://libris.kb.se/resource',
    settings: {
      catalogingRules: 'RDA' as const,
      defaultLanguage: 'swe',
      bibframeVersion: '2.0' as const,
      enableAuthorities: true,
      enableVersioning: true
    },
    metadata: {
      created: new Date().toISOString(),
      contactEmail: 'libris@kb.se',
      type: 'library' as const,
      country: 'SE'
    }
  }
};