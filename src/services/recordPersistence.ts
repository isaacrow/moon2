/**
 * 💾 Record Persistence Service
 * Frontend API client for record lifecycle
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/api/records`;

export interface RecordMetadata {
  id: string;
  title: string;
  resourceType: 'Work' | 'Instance' | 'Item';
  status: 'draft' | 'validated' | 'published' | 'archived';
  graphJson: any;
  createdAt: string;
  updatedAt: string;
  versionNumber: number;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface RecordVersion {
  id: string;
  recordId: string;
  versionNumber: number;
  graphSnapshot: any;
  createdAt: string;
  createdBy?: string;
  comment?: string;
}

/**
 * Create a new record
 */
export async function createRecord(
  graphJson: any,
  title: string,
  resourceType: string = 'Work',
  userId?: string
): Promise<RecordMetadata> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      graphJson,
      title,
      resourceType,
      userId
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create record');
  }

  const data = await response.json();
  return data.record;
}

/**
 * Get record by ID
 */
export async function getRecord(id: string): Promise<RecordMetadata> {
  const response = await fetch(`${API_BASE}/${id}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch record');
  }

  const data = await response.json();
  return data.record;
}

/**
 * Update record
 */
export async function updateRecord(
  id: string,
  graphJson: any,
  title?: string,
  userId?: string
): Promise<RecordMetadata> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      graphJson,
      title,
      userId
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update record');
  }

  const data = await response.json();
  return data.record;
}

/**
 * Delete record
 */
export async function deleteRecord(id: string, userId?: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-User-Id': userId || ''
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete record');
  }
}

/**
 * List records
 */
export async function listRecords(options?: {
  status?: string;
  resourceType?: string;
  limit?: number;
  offset?: number;
}): Promise<RecordMetadata[]> {
  const params = new URLSearchParams();
  if (options?.status) params.append('status', options.status);
  if (options?.resourceType) params.append('resourceType', options.resourceType);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const response = await fetch(`${API_BASE}?${params}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list records');
  }

  const data = await response.json();
  return data.records;
}

/**
 * Create version snapshot
 */
export async function createVersion(
  recordId: string,
  comment?: string,
  userId?: string
): Promise<RecordVersion> {
  const response = await fetch(`${API_BASE}/${recordId}/version`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      comment,
      userId
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create version');
  }

  const data = await response.json();
  return data.version;
}

/**
 * List versions
 */
export async function listVersions(recordId: string): Promise<RecordVersion[]> {
  const response = await fetch(`${API_BASE}/${recordId}/versions`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list versions');
  }

  const data = await response.json();
  return data.versions;
}

/**
 * Get specific version
 */
export async function getVersion(recordId: string, versionNumber: number): Promise<RecordVersion> {
  const response = await fetch(`${API_BASE}/${recordId}/versions/${versionNumber}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch version');
  }

  const data = await response.json();
  return data.version;
}

/**
 * Publish record
 */
export async function publishRecord(recordId: string, userId?: string): Promise<RecordMetadata> {
  const response = await fetch(`${API_BASE}/${recordId}/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to publish record');
  }

  const data = await response.json();
  return data.record;
}

/**
 * Archive record
 */
export async function archiveRecord(recordId: string, userId?: string): Promise<RecordMetadata> {
  const response = await fetch(`${API_BASE}/${recordId}/archive`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to archive record');
  }

  const data = await response.json();
  return data.record;
}

/**
 * Export record
 */
export async function exportRecord(recordId: string, format: 'jsonld' | 'turtle' = 'jsonld'): Promise<any> {
  const response = await fetch(`${API_BASE}/${recordId}/export?format=${format}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to export record');
  }

  if (format === 'turtle') {
    return await response.text();
  }

  return await response.json();
}

/**
 * Search records
 */
export async function searchRecords(query: string): Promise<RecordMetadata[]> {
  const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to search records');
  }

  const data = await response.json();
  return data.results;
}

/**
 * Download export file
 */
export function downloadExport(recordId: string, format: 'jsonld' | 'turtle', title: string) {
  const url = `${API_BASE}/${recordId}/export?format=${format}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.${format === 'turtle' ? 'ttl' : 'jsonld'}`;
  a.click();
}