/**
 * RECORD STORAGE SERVICE
 * Manages persistent storage of BIBFRAME records
 * Supports localStorage, export, and future backend sync
 */

export interface MoonRecord {
  id: string;
  title: string;
  template: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
  
  // Core data
  graph: any; // JSON-LD graph (source of truth)
  turtle: string; // Cached Turtle serialization
  
  // Metadata
  metadata: {
    creator?: string;
    institution?: string;
    workUri: string;
    instanceUri: string;
    itemUri?: string;
    expressionUri?: string;
  };
  
  // Preview data for UI
  preview: {
    mainTitle?: string;
    subtitle?: string;
    contributors?: string[];
    publisher?: string;
    year?: string;
  };
}

const STORAGE_KEY = 'moon-sand-records';
const BACKUP_KEY = 'moon-sand-backup';

/**
 * Save a record to localStorage
 */
export function saveRecord(record: MoonRecord): void {
  try {
    const records = loadAllRecords();
    
    // Check if record exists
    const existingIndex = records.findIndex(r => r.id === record.id);
    
    if (existingIndex >= 0) {
      // Update existing
      records[existingIndex] = {
        ...record,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new
      records.push(record);
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    
    // Create backup
    createBackup(records);
    
    console.log(`✅ Record saved: ${record.id}`);
  } catch (error) {
    console.error('❌ Error saving record:', error);
    throw new Error('Failed to save record');
  }
}

/**
 * Load all records from localStorage
 */
export function loadAllRecords(): MoonRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const records = JSON.parse(data);
    return Array.isArray(records) ? records : [];
  } catch (error) {
    console.error('❌ Error loading records:', error);
    
    // Try to restore from backup
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        const records = JSON.parse(backup);
        console.log('✅ Restored from backup');
        return Array.isArray(records) ? records : [];
      }
    } catch (backupError) {
      console.error('❌ Backup restore failed:', backupError);
    }
    
    return [];
  }
}

/**
 * Load a single record by ID
 */
export function loadRecord(id: string): MoonRecord | null {
  const records = loadAllRecords();
  return records.find(r => r.id === id) || null;
}

/**
 * Delete a record
 */
export function deleteRecord(id: string): boolean {
  try {
    const records = loadAllRecords();
    const filtered = records.filter(r => r.id !== id);
    
    if (filtered.length === records.length) {
      console.warn('⚠️ Record not found:', id);
      return false;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    createBackup(filtered);
    
    console.log(`✅ Record deleted: ${id}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting record:', error);
    return false;
  }
}

/**
 * Duplicate a record (create a copy)
 */
export function duplicateRecord(id: string): MoonRecord | null {
  try {
    const original = loadRecord(id);
    if (!original) return null;
    
    const duplicate: MoonRecord = {
      ...original,
      id: generateRecordId(),
      title: `${original.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };
    
    saveRecord(duplicate);
    
    console.log(`✅ Record duplicated: ${id} → ${duplicate.id}`);
    return duplicate;
  } catch (error) {
    console.error('❌ Error duplicating record:', error);
    return null;
  }
}

/**
 * Update record status
 */
export function updateRecordStatus(id: string, status: 'draft' | 'published'): boolean {
  try {
    const record = loadRecord(id);
    if (!record) return false;
    
    record.status = status;
    record.updatedAt = new Date().toISOString();
    
    saveRecord(record);
    return true;
  } catch (error) {
    console.error('❌ Error updating record status:', error);
    return false;
  }
}

/**
 * Export record as JSON-LD file
 */
export function exportRecordAsJsonLd(record: MoonRecord): void {
  const jsonld = JSON.stringify(record.graph, null, 2);
  downloadFile(jsonld, `bibframe-${record.id}.jsonld`, 'application/ld+json');
}

/**
 * Export record as Turtle file
 */
export function exportRecordAsTurtle(record: MoonRecord): void {
  downloadFile(record.turtle, `bibframe-${record.id}.ttl`, 'text/turtle');
}

/**
 * Export record as ZIP package
 */
export async function exportRecordAsPackage(record: MoonRecord): Promise<void> {
  // For now, just export both files separately
  // In production, use JSZip library
  exportRecordAsJsonLd(record);
  
  // Small delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  exportRecordAsTurtle(record);
  
  // Export metadata
  const metadata = {
    id: record.id,
    title: record.title,
    template: record.template,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    status: record.status,
    uris: record.metadata
  };
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  downloadFile(
    JSON.stringify(metadata, null, 2), 
    `bibframe-${record.id}-metadata.json`, 
    'application/json'
  );
}

/**
 * Search records by title
 */
export function searchRecords(query: string): MoonRecord[] {
  const records = loadAllRecords();
  if (!query) return records;
  
  const lowerQuery = query.toLowerCase();
  
  return records.filter(r => 
    r.title.toLowerCase().includes(lowerQuery) ||
    r.preview.mainTitle?.toLowerCase().includes(lowerQuery) ||
    r.preview.contributors?.some(c => c.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get records by template
 */
export function getRecordsByTemplate(template: string): MoonRecord[] {
  const records = loadAllRecords();
  return records.filter(r => r.template === template);
}

/**
 * Get records by status
 */
export function getRecordsByStatus(status: 'draft' | 'published'): MoonRecord[] {
  const records = loadAllRecords();
  return records.filter(r => r.status === status);
}

/**
 * Get record count
 */
export function getRecordCount(): number {
  return loadAllRecords().length;
}

/**
 * Get statistics
 */
export function getRecordStatistics() {
  const records = loadAllRecords();
  
  return {
    total: records.length,
    drafts: records.filter(r => r.status === 'draft').length,
    published: records.filter(r => r.status === 'published').length,
    byTemplate: records.reduce((acc, r) => {
      acc[r.template] = (acc[r.template] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}

/**
 * Clear all records (use with caution!)
 */
export function clearAllRecords(): void {
  if (confirm('⚠️ This will delete ALL records. Are you sure?')) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_KEY);
    console.log('✅ All records cleared');
  }
}

/**
 * Import record from JSON-LD file
 */
export function importRecordFromJsonLd(jsonldString: string): MoonRecord | null {
  try {
    const graph = JSON.parse(jsonldString);
    
    // Extract basic info
    const graphArray = graph['@graph'] || [];
    const work = graphArray.find((e: any) => e['@type'] === 'bf:Work');
    const instance = graphArray.find((e: any) => e['@type'] === 'bf:Instance');
    
    if (!work || !instance) {
      throw new Error('Invalid BIBFRAME record: missing Work or Instance');
    }
    
    // Extract title
    const title = extractTitle(work);
    
    // Create record
    const record: MoonRecord = {
      id: generateRecordId(),
      title: title || 'Imported Record',
      template: 'imported',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      graph,
      turtle: '', // Will need to regenerate
      metadata: {
        workUri: work['@id'],
        instanceUri: instance['@id']
      },
      preview: {
        mainTitle: title
      }
    };
    
    saveRecord(record);
    return record;
  } catch (error) {
    console.error('❌ Error importing record:', error);
    return null;
  }
}

// ============= HELPER FUNCTIONS =============

/**
 * Generate unique record ID
 */
export function generateRecordId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${timestamp}${random}`;
}

/**
 * Download file to user's computer
 */
function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Create backup of all records
 */
function createBackup(records: MoonRecord[]): void {
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('⚠️ Backup failed:', error);
  }
}

/**
 * Extract title from Work entity
 */
function extractTitle(work: any): string | null {
  if (!work['bf:title']) return null;
  
  if (typeof work['bf:title'] === 'object') {
    return work['bf:title']['bf:mainTitle'] || 
           work['bf:title']['rdfs:label'] || 
           null;
  }
  
  return null;
}

/**
 * Create record from graph builder output
 */
export function createRecordFromGraph(
  graphOutput: any,
  template: string,
  turtleString: string
): MoonRecord {
  const graph = graphOutput;
  const graphArray = graph['@graph'] || [];
  const work = graphArray.find((e: any) => e['@type'] === 'bf:Work');
  const instance = graphArray.find((e: any) => e['@type'] === 'bf:Instance');
  const item = graphArray.find((e: any) => e['@type'] === 'bf:Item');
  const expression = graphArray.find((e: any) => e['@type'] === 'bf:Expression');
  
  // Extract preview data
  const mainTitle = work?.['bf:title']?.['bf:mainTitle'] || 'Untitled';
  const subtitle = work?.['bf:title']?.['bf:subtitle'];
  
  const contributors: string[] = [];
  if (work?.['bf:contribution']) {
    const contribs = Array.isArray(work['bf:contribution']) 
      ? work['bf:contribution'] 
      : [work['bf:contribution']];
    
    contribs.forEach((c: any) => {
      if (c['bf:agent']?.['rdfs:label']) {
        contributors.push(c['bf:agent']['rdfs:label']);
      }
    });
  }
  
  // Extract publication info
  let publisher: string | undefined;
  let year: string | undefined;
  
  if (instance?.['bf:provisionActivity']) {
    const provId = instance['bf:provisionActivity']['@id'];
    const prov = graphArray.find((e: any) => e['@id'] === provId);
    if (prov) {
      publisher = prov['bf:agent']?.['rdfs:label'];
      year = prov['bf:date'];
    }
  }
  
  const record: MoonRecord = {
    id: graphOutput.recordId || generateRecordId(),
    title: mainTitle,
    template,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    graph,
    turtle: turtleString,
    metadata: {
      workUri: work?.['@id'] || '',
      instanceUri: instance?.['@id'] || '',
      itemUri: item?.['@id'],
      expressionUri: expression?.['@id']
    },
    preview: {
      mainTitle,
      subtitle,
      contributors,
      publisher,
      year
    }
  };
  
  return record;
}
