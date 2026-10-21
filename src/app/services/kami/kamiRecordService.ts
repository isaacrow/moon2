/**
 * KAMI Record Service
 * Handles all CRUD operations for KAMI records
 */

import {
  KamiRecord,
  KamiWork,
  KamiInstance,
  KamiItem,
  KamiApiResponse,
  KamiListResponse,
  KamiSearchFilters,
  KamiSortOptions,
  KamiVersion,
  KamiAuditLog
} from '../../types/kami';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/kami`;

/**
 * Get authorization headers
 */
function getHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }
  
  return headers;
}

/**
 * Handle API errors
 */
function handleError(error: any): never {
  console.error('KAMI API Error:', error);
  throw error;
}

// =============================================
// Work Operations
// =============================================

/**
 * Create a new work
 */
export async function createWork(
  work: Partial<KamiWork>,
  token?: string
): Promise<KamiApiResponse<KamiWork>> {
  try {
    const response = await fetch(`${API_BASE_URL}/works`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(work)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create work');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Get work by ID
 */
export async function getWork(
  workId: string,
  token?: string
): Promise<KamiApiResponse<KamiWork>> {
  try {
    const response = await fetch(`${API_BASE_URL}/works/${workId}`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get work');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * List works with filters
 */
export async function listWorks(
  filters?: KamiSearchFilters,
  sort?: KamiSortOptions,
  page: number = 1,
  perPage: number = 20,
  token?: string
): Promise<KamiListResponse<KamiWork>> {
  try {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('per_page', perPage.toString());
    
    if (filters?.query) params.set('q', filters.query);
    if (filters?.resource_type) params.set('resource_type', filters.resource_type);
    if (filters?.status) params.set('status', filters.status);
    if (sort?.field) params.set('sort', sort.field);
    if (sort?.direction) params.set('order', sort.direction);
    
    const response = await fetch(`${API_BASE_URL}/works?${params}`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to list works');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Update work
 */
export async function updateWork(
  workId: string,
  work: Partial<KamiWork>,
  lockToken?: string,
  token?: string
): Promise<KamiApiResponse<KamiWork>> {
  try {
    const body: any = { ...work };
    if (lockToken) body.lock_token = lockToken;
    
    const response = await fetch(`${API_BASE_URL}/works/${workId}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update work');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Delete work
 */
export async function deleteWork(
  workId: string,
  token?: string
): Promise<KamiApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/works/${workId}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete work');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Lock work for editing
 */
export async function lockWork(
  workId: string,
  token?: string
): Promise<KamiApiResponse<{ lock_token: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/works/${workId}/lock`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to lock work');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Unlock work
 */
export async function unlockWork(
  workId: string,
  lockToken: string,
  token?: string
): Promise<KamiApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/works/${workId}/lock`, {
      method: 'DELETE',
      headers: getHeaders(token),
      body: JSON.stringify({ lock_token: lockToken })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unlock work');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

// =============================================
// Instance Operations
// =============================================

/**
 * Create instance
 */
export async function createInstance(
  instance: Partial<KamiInstance>,
  token?: string
): Promise<KamiApiResponse<KamiInstance>> {
  try {
    const response = await fetch(`${API_BASE_URL}/instances`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(instance)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create instance');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Get instance
 */
export async function getInstance(
  instanceId: string,
  token?: string
): Promise<KamiApiResponse<KamiInstance>> {
  try {
    const response = await fetch(`${API_BASE_URL}/instances/${instanceId}`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get instance');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Update instance
 */
export async function updateInstance(
  instanceId: string,
  instance: Partial<KamiInstance>,
  token?: string
): Promise<KamiApiResponse<KamiInstance>> {
  try {
    const response = await fetch(`${API_BASE_URL}/instances/${instanceId}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(instance)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update instance');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

// =============================================
// Item Operations
// =============================================

/**
 * Create item
 */
export async function createItem(
  item: Partial<KamiItem>,
  token?: string
): Promise<KamiApiResponse<KamiItem>> {
  try {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(item)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create item');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

// =============================================
// Version Control
// =============================================

/**
 * Get version history
 */
export async function getVersionHistory(
  workId: string,
  token?: string
): Promise<KamiApiResponse<KamiVersion[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/works/${workId}/versions`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get version history');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Rollback to version
 */
export async function rollbackToVersion(
  workId: string,
  versionNumber: number,
  token?: string
): Promise<KamiApiResponse<KamiWork>> {
  try {
    const response = await fetch(`${API_BASE_URL}/works/${workId}/rollback`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ version_number: versionNumber })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to rollback');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

// =============================================
// Review Workflow
// =============================================

/**
 * Submit work for review
 */
export async function submitForReview(
  workId: string,
  token?: string
): Promise<KamiApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/works/${workId}/submit`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit for review');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Publish work
 */
export async function publishWork(
  workId: string,
  token?: string
): Promise<KamiApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/works/${workId}/publish`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to publish work');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

// =============================================
// Complete Record Operations
// =============================================

/**
 * Save complete record (Work + Instance + Items)
 */
export async function saveRecord(
  record: Partial<KamiRecord>,
  token?: string
): Promise<KamiApiResponse<KamiRecord>> {
  try {
    const response = await fetch(`${API_BASE_URL}/records`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(record)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save record');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Get complete record
 */
export async function getRecord(
  workId: string,
  token?: string
): Promise<KamiApiResponse<KamiRecord>> {
  try {
    const response = await fetch(`${API_BASE_URL}/records/${workId}`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get record');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

// =============================================
// Audit Log
// =============================================

/**
 * Get audit log for entity
 */
export async function getAuditLog(
  entityId: string,
  token?: string
): Promise<KamiApiResponse<KamiAuditLog[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/audit?entity_id=${entityId}`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get audit log');
    }
    
    return await response.json();
  } catch (error) {
    return handleError(error);
  }
}

// =============================================
// Local Storage Fallback (for offline/demo)
// =============================================

const LOCAL_STORAGE_KEY = 'kami-records';

/**
 * Save record to local storage
 */
export function saveRecordLocal(record: Partial<KamiRecord>): void {
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    const records = existing ? JSON.parse(existing) : [];
    
    const workId = record.work?.id || `work-${Date.now()}`;
    const existingIndex = records.findIndex((r: any) => r.work?.id === workId);
    
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving to local storage:', error);
  }
}

/**
 * Get record from local storage
 */
export function getRecordLocal(workId: string): Partial<KamiRecord> | null {
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!existing) return null;
    
    const records = JSON.parse(existing);
    return records.find((r: any) => r.work?.id === workId) || null;
  } catch (error) {
    console.error('Error reading from local storage:', error);
    return null;
  }
}

/**
 * List records from local storage
 */
export function listRecordsLocal(): Partial<KamiRecord>[] {
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Error reading from local storage:', error);
    return [];
  }
}

// =============================================
// Export Functions
// =============================================

/**
 * Export formats
 */
export type ExportFormat = 'json-ld' | 'rdf-xml' | 'marc21' | 'turtle';

/**
 * Export record to various formats
 */
export function exportRecord(
  record: Partial<KamiRecord>,
  format: ExportFormat = 'json-ld'
): string {
  switch (format) {
    case 'json-ld':
      return exportAsJsonLd(record);
    case 'rdf-xml':
      return exportAsRdfXml(record);
    case 'marc21':
      return exportAsMarc21(record);
    case 'turtle':
      return exportAsTurtle(record);
    default:
      return exportAsJsonLd(record);
  }
}

/**
 * Export as JSON-LD
 */
function exportAsJsonLd(record: Partial<KamiRecord>): string {
  const jsonLd: any = {
    '@context': {
      'bf': 'http://id.loc.gov/ontologies/bibframe/',
      'bflc': 'http://id.loc.gov/ontologies/bflc/',
      'madsrdf': 'http://www.loc.gov/mads/rdf/v1#',
      'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
      'skos': 'http://www.w3.org/2004/02/skos/core#'
    },
    '@graph': []
  };

  // Add Work
  if (record.work) {
    const work: any = {
      '@type': record.work.resource_type || 'bf:Work',
      '@id': record.work.id || `_:work${Date.now()}`,
    };

    if (record.work.title) work['bf:title'] = record.work.title;
    if (record.work.classification) work['bf:classification'] = record.work.classification;
    if (record.work.subjects) work['bf:subject'] = record.work.subjects;
    if (record.work.contributors) work['bf:contribution'] = record.work.contributors;
    if (record.work.language) work['bf:language'] = record.work.language;
    if (record.work.content) work['bf:content'] = record.work.content;
    if (record.work.summary) work['bf:summary'] = record.work.summary;
    if (record.work.notes) work['bf:note'] = record.work.notes;

    jsonLd['@graph'].push(work);
  }

  // Add Instance
  if (record.instance) {
    const instance: any = {
      '@type': 'bf:Instance',
      '@id': record.instance.id || `_:instance${Date.now()}`,
    };

    if (record.work?.id) instance['bf:instanceOf'] = { '@id': record.work.id };
    if (record.instance.title) instance['bf:title'] = record.instance.title;
    if (record.instance.publication) instance['bf:provisionActivity'] = record.instance.publication;
    if (record.instance.identifiers) instance['bf:identifiedBy'] = record.instance.identifiers;
    if (record.instance.physical_description) instance['bf:extent'] = record.instance.physical_description;

    jsonLd['@graph'].push(instance);
  }

  // Add Items
  if (record.items && record.items.length > 0) {
    record.items.forEach((item, index) => {
      const itemObj: any = {
        '@type': 'bf:Item',
        '@id': item.id || `_:item${index}${Date.now()}`,
      };

      if (record.instance?.id) itemObj['bf:itemOf'] = { '@id': record.instance.id };
      if (item.barcode) itemObj['bf:barcode'] = item.barcode;
      if (item.call_number) itemObj['bf:shelfMark'] = item.call_number;
      if (item.location) itemObj['bf:heldBy'] = item.location;
      if (item.status) itemObj['bf:status'] = item.status;

      jsonLd['@graph'].push(itemObj);
    });
  }

  return JSON.stringify(jsonLd, null, 2);
}

/**
 * Export as RDF/XML
 */
function exportAsRdfXml(record: Partial<KamiRecord>): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<rdf:RDF\n';
  xml += '  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n';
  xml += '  xmlns:bf="http://id.loc.gov/ontologies/bibframe/"\n';
  xml += '  xmlns:bflc="http://id.loc.gov/ontologies/bflc/"\n';
  xml += '  xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">\n\n';

  // Work
  if (record.work) {
    const workId = record.work.id || `_:work${Date.now()}`;
    xml += `  <bf:Work rdf:about="${workId}">\n`;
    
    if (record.work.title) {
      xml += `    <bf:title>\n`;
      xml += `      <bf:Title>\n`;
      xml += `        <bf:mainTitle>${escapeXml(record.work.title)}</bf:mainTitle>\n`;
      xml += `      </bf:Title>\n`;
      xml += `    </bf:title>\n`;
    }
    
    if (record.work.classification) {
      xml += `    <bf:classification>\n`;
      xml += `      <bf:ClassificationLcc>\n`;
      xml += `        <bf:classificationPortion>${escapeXml(record.work.classification)}</bf:classificationPortion>\n`;
      xml += `      </bf:ClassificationLcc>\n`;
      xml += `    </bf:classification>\n`;
    }
    
    xml += `  </bf:Work>\n\n`;
  }

  // Instance
  if (record.instance) {
    const instanceId = record.instance.id || `_:instance${Date.now()}`;
    xml += `  <bf:Instance rdf:about="${instanceId}">\n`;
    
    if (record.work?.id) {
      xml += `    <bf:instanceOf rdf:resource="${record.work.id}"/>\n`;
    }
    
    if (record.instance.title) {
      xml += `    <bf:title>\n`;
      xml += `      <bf:Title>\n`;
      xml += `        <bf:mainTitle>${escapeXml(record.instance.title)}</bf:mainTitle>\n`;
      xml += `      </bf:Title>\n`;
      xml += `    </bf:title>\n`;
    }
    
    xml += `  </bf:Instance>\n\n`;
  }

  xml += '</rdf:RDF>';
  return xml;
}

/**
 * Export as MARC21 XML
 */
function exportAsMarc21(record: Partial<KamiRecord>): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<record xmlns="http://www.loc.gov/MARC21/slim">\n';
  xml += '  <leader>00000nam a2200000 a 4500</leader>\n';
  
  // 008 field
  const date = new Date().toISOString().slice(2, 8).replace(/-/g, '');
  xml += `  <controlfield tag="008">${date}s                    |||| |||| d</controlfield>\n`;
  
  // Title (245)
  if (record.work?.title || record.instance?.title) {
    const title = record.instance?.title || record.work?.title || '';
    xml += '  <datafield tag="245" ind1="1" ind2="0">\n';
    xml += `    <subfield code="a">${escapeXml(title)}</subfield>\n`;
    xml += '  </datafield>\n';
  }
  
  // Classification (050 for LCC)
  if (record.work?.classification) {
    xml += '  <datafield tag="050" ind1="0" ind2="0">\n';
    xml += `    <subfield code="a">${escapeXml(record.work.classification)}</subfield>\n`;
    xml += '  </datafield>\n';
  }
  
  // Publication (264)
  if (record.instance?.publication) {
    xml += '  <datafield tag="264" ind1=" " ind2="1">\n';
    if ((record.instance.publication as any).place) {
      xml += `    <subfield code="a">${escapeXml((record.instance.publication as any).place)}</subfield>\n`;
    }
    if ((record.instance.publication as any).publisher) {
      xml += `    <subfield code="b">${escapeXml((record.instance.publication as any).publisher)}</subfield>\n`;
    }
    if ((record.instance.publication as any).date) {
      xml += `    <subfield code="c">${escapeXml((record.instance.publication as any).date)}</subfield>\n`;
    }
    xml += '  </datafield>\n';
  }
  
  xml += '</record>';
  return xml;
}

/**
 * Export as Turtle
 */
function exportAsTurtle(record: Partial<KamiRecord>): string {
  let turtle = '@prefix bf: <http://id.loc.gov/ontologies/bibframe/> .\n';
  turtle += '@prefix bflc: <http://id.loc.gov/ontologies/bflc/> .\n';
  turtle += '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\n';
  
  if (record.work) {
    const workId = record.work.id || `_:work${Date.now()}`;
    turtle += `<${workId}> a bf:Work ;\n`;
    
    if (record.work.title) {
      turtle += `  bf:title "${record.work.title}" ;\n`;
    }
    
    if (record.work.classification) {
      turtle += `  bf:classification "${record.work.classification}" ;\n`;
    }
    
    turtle += '  .\n\n';
  }
  
  return turtle;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// =============================================
// Load Record
// =============================================

/**
 * Load record (tries backend first, falls back to local storage)
 */
export async function loadRecord(
  workId: string,
  token?: string
): Promise<Partial<KamiRecord> | null> {
  try {
    // Try backend first
    const response = await getRecord(workId, token);
    if (response.success && response.data) {
      return response.data;
    }
  } catch (error) {
    console.error('Failed to load from backend, trying local storage:', error);
  }
  
  // Fallback to local storage
  return getRecordLocal(workId);
}
