import { BIBFRAMERecord } from '../types/bibframe';

export interface SavedRecord {
  id: string;
  record: BIBFRAMERecord;
  createdAt: string;
  modifiedAt: string;
  title: string;
}

const STORAGE_KEY = 'bibframe_saved_records';

export function saveRecord(record: BIBFRAMERecord): SavedRecord {
  const records = getAllRecords();
  const title =
    record.instance['bf:title']?.['bf:mainTitle'] ||
    record.work['bf:title']?.['bf:mainTitle'] ||
    'Untitled Record';

  const savedRecord: SavedRecord = {
    id: `record-${Date.now()}`,
    record,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    title,
  };

  records.push(savedRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return savedRecord;
}

export function getAllRecords(): SavedRecord[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error parsing saved records:', error);
    return [];
  }
}

export function getRecordById(id: string): SavedRecord | null {
  const records = getAllRecords();
  return records.find((r) => r.id === id) || null;
}

export function deleteRecord(id: string): void {
  const records = getAllRecords();
  const filtered = records.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function updateRecord(id: string, record: BIBFRAMERecord): SavedRecord | null {
  const records = getAllRecords();
  const index = records.findIndex((r) => r.id === id);
  
  if (index === -1) return null;

  const title =
    record.instance['bf:title']?.['bf:mainTitle'] ||
    record.work['bf:title']?.['bf:mainTitle'] ||
    'Untitled Record';

  records[index] = {
    ...records[index],
    record,
    modifiedAt: new Date().toISOString(),
    title,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return records[index];
}

export function searchRecords(query: string): SavedRecord[] {
  if (!query) return getAllRecords();
  
  const records = getAllRecords();
  const lowerQuery = query.toLowerCase();
  
  return records.filter((record) => {
    const titleMatch = record.title.toLowerCase().includes(lowerQuery);
    const creatorMatch = record.record.work['bf:creator']?.some((creator) =>
      creator.label.toLowerCase().includes(lowerQuery)
    );
    return titleMatch || creatorMatch;
  });
}
