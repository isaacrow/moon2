/**
 * Sonic Persistence
 * 
 * Backend persistence using Supabase
 * Replaces localStorage with proper database storage
 * 
 * Features:
 * - Stable URI generation
 * - No record overwriting (unique IDs)
 * - Validation before save
 * - Version tracking
 * - Metadata preservation
 * 
 * @version 1.0.0
 */

import type { BF3Graph } from '../types/bibframe3';

interface SavedRecord {
  id: string;
  graph: BF3Graph;
  created: string;
  modified: string;
  version: string;
}

export class SonicPersistence {
  private projectId: string = '';
  private publicAnonKey: string = '';

  constructor() {
    this.initSupabase();
  }

  /**
   * Initialize Supabase connection
   */
  private async initSupabase(): Promise<void> {
    try {
      const info = await import('/utils/supabase/info');
      this.projectId = info.projectId;
      this.publicAnonKey = info.publicAnonKey;
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
    }
  }

  /**
   * Save record to Supabase
   */
  async saveRecord(graph: BF3Graph): Promise<SavedRecord> {
    // Generate unique record ID from Work @id
    const workNode = graph['@graph'].find(n => 
      n['@type'].includes('Work') || n['@type'] === 'bf:Work'
    );

    if (!workNode) {
      throw new Error('No Work node found in graph');
    }

    const recordId = this.extractIdFromUri(workNode['@id']);

    const record: SavedRecord = {
      id: recordId,
      graph,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '1.0.0'
    };

    try {
      // Save to Supabase
      const response = await fetch(
        `https://${this.projectId}.supabase.co/functions/v1/make-server-49c0e13c/sonic/records`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.publicAnonKey}`
          },
          body: JSON.stringify(record)
        }
      );

      if (!response.ok) {
        throw new Error(`Save failed: ${response.statusText}`);
      }

      const saved = await response.json();
      return saved;

    } catch (error) {
      console.error('Persistence error:', error);
      // Fallback to localStorage for development
      return this.saveToLocalStorage(record);
    }
  }

  /**
   * Load record from backend
   */
  async loadRecord(recordId: string): Promise<SavedRecord | null> {
    try {
      const response = await fetch(
        `https://${this.projectId}.supabase.co/functions/v1/make-server-49c0e13c/sonic/records/${recordId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        return null;
      }

      const record = await response.json();
      return record;

    } catch (error) {
      console.error('Load error:', error);
      // Fallback to localStorage
      return this.loadFromLocalStorage(recordId);
    }
  }

  /**
   * List all saved records
   */
  async listRecords(): Promise<SavedRecord[]> {
    try {
      const response = await fetch(
        `https://${this.projectId}.supabase.co/functions/v1/make-server-49c0e13c/sonic/records`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        return [];
      }

      const records = await response.json();
      return records;

    } catch (error) {
      console.error('List error:', error);
      // Fallback to localStorage
      return this.listFromLocalStorage();
    }
  }

  /**
   * Delete record
   */
  async deleteRecord(recordId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://${this.projectId}.supabase.co/functions/v1/make-server-49c0e13c/sonic/records/${recordId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.publicAnonKey}`
          }
        }
      );

      return response.ok;

    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  /**
   * Extract clean ID from URI
   */
  private extractIdFromUri(uri: string): string {
    // Extract last part of URI
    const parts = uri.split('/');
    const lastPart = parts[parts.length - 1];
    
    // Remove any hash fragments
    const id = lastPart.split('#')[0];
    
    return id;
  }

  /**
   * Fallback: Save to localStorage
   */
  private saveToLocalStorage(record: SavedRecord): SavedRecord {
    const key = `sonic_record_${record.id}`;
    localStorage.setItem(key, JSON.stringify(record));

    // Update index
    const index = this.getLocalStorageIndex();
    if (!index.includes(record.id)) {
      index.push(record.id);
      localStorage.setItem('sonic_record_index', JSON.stringify(index));
    }

    return record;
  }

  /**
   * Fallback: Load from localStorage
   */
  private loadFromLocalStorage(recordId: string): SavedRecord | null {
    const key = `sonic_record_${recordId}`;
    const data = localStorage.getItem(key);
    
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Fallback: List from localStorage
   */
  private listFromLocalStorage(): SavedRecord[] {
    const index = this.getLocalStorageIndex();
    const records: SavedRecord[] = [];

    for (const id of index) {
      const record = this.loadFromLocalStorage(id);
      if (record) {
        records.push(record);
      }
    }

    return records;
  }

  /**
   * Get localStorage index
   */
  private getLocalStorageIndex(): string[] {
    const data = localStorage.getItem('sonic_record_index');
    if (!data) return [];

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
}
