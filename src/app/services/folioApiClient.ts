/**
 * FOLIO API Client
 * Connects Moon to FOLIO platform for full cataloging capabilities
 * Based on FOLIO's Okapi gateway and mod-inventory modules
 */

export interface FOLIOConfig {
  okapiUrl: string;
  tenant: string;
  username?: string;
  token?: string;
}

export interface FOLIOInstance {
  id: string;
  source: string;
  title: string;
  contributors?: Array<{ name: string; contributorNameTypeId?: string }>;
  identifiers?: Array<{ value: string; identifierTypeId: string }>;
  subjects?: Array<{ value: string }>;
  publication?: Array<{ publisher?: string; dateOfPublication?: string; place?: string }>;
  instanceTypeId: string;
  modeOfIssuanceId?: string;
  catalogedDate?: string;
  metadata?: {
    createdDate?: string;
    updatedDate?: string;
    createdByUserId?: string;
    updatedByUserId?: string;
  };
}

export interface FOLIOHolding {
  id: string;
  instanceId: string;
  permanentLocationId: string;
  callNumber?: string;
  holdingsTypeId?: string;
  metadata?: {
    createdDate?: string;
    updatedDate?: string;
  };
}

export interface FOLIOItem {
  id: string;
  holdingsRecordId: string;
  barcode?: string;
  status?: { name: string };
  materialTypeId: string;
  permanentLoanTypeId: string;
  metadata?: {
    createdDate?: string;
    updatedDate?: string;
  };
}

export class FOLIOApiClient {
  private config: FOLIOConfig;
  private token: string | null = null;

  constructor(config: FOLIOConfig) {
    this.config = config;
    this.token = config.token || null;
  }

  /**
   * Authenticate with FOLIO
   */
  async authenticate(username: string, password: string): Promise<string> {
    const response = await fetch(`${this.config.okapiUrl}/authn/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Okapi-Tenant': this.config.tenant,
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`FOLIO authentication failed: ${response.statusText}`);
    }

    this.token = response.headers.get('x-okapi-token');
    if (!this.token) {
      throw new Error('No token returned from FOLIO');
    }

    return this.token;
  }

  /**
   * Get common headers for FOLIO API requests
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Okapi-Tenant': this.config.tenant,
      ...(this.token && { 'X-Okapi-Token': this.token }),
    };
  }

  /**
   * Search instances in FOLIO inventory
   */
  async searchInstances(query: string, limit = 100): Promise<{ instances: FOLIOInstance[]; totalRecords: number }> {
    const response = await fetch(
      `${this.config.okapiUrl}/instance-storage/instances?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`FOLIO instance search failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get instance by ID
   */
  async getInstance(instanceId: string): Promise<FOLIOInstance> {
    const response = await fetch(`${this.config.okapiUrl}/instance-storage/instances/${instanceId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get FOLIO instance: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new instance in FOLIO
   */
  async createInstance(instance: Partial<FOLIOInstance>): Promise<FOLIOInstance> {
    const response = await fetch(`${this.config.okapiUrl}/instance-storage/instances`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...instance,
        source: instance.source || 'MARC',
        id: instance.id || this.generateUUID(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create FOLIO instance: ${error}`);
    }

    return response.json();
  }

  /**
   * Update an existing instance
   */
  async updateInstance(instanceId: string, instance: Partial<FOLIOInstance>): Promise<void> {
    const response = await fetch(`${this.config.okapiUrl}/instance-storage/instances/${instanceId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...instance,
        id: instanceId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update FOLIO instance: ${error}`);
    }
  }

  /**
   * Delete an instance
   */
  async deleteInstance(instanceId: string): Promise<void> {
    const response = await fetch(`${this.config.okapiUrl}/instance-storage/instances/${instanceId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete FOLIO instance: ${response.statusText}`);
    }
  }

  /**
   * Get holdings for an instance
   */
  async getHoldings(instanceId: string): Promise<{ holdingsRecords: FOLIOHolding[]; totalRecords: number }> {
    const response = await fetch(
      `${this.config.okapiUrl}/holdings-storage/holdings?query=instanceId==${instanceId}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get holdings: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create holdings record
   */
  async createHolding(holding: Partial<FOLIOHolding>): Promise<FOLIOHolding> {
    const response = await fetch(`${this.config.okapiUrl}/holdings-storage/holdings`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...holding,
        id: holding.id || this.generateUUID(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create holding: ${error}`);
    }

    return response.json();
  }

  /**
   * Get items for a holdings record
   */
  async getItems(holdingsRecordId: string): Promise<{ items: FOLIOItem[]; totalRecords: number }> {
    const response = await fetch(
      `${this.config.okapiUrl}/item-storage/items?query=holdingsRecordId==${holdingsRecordId}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get items: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create item record
   */
  async createItem(item: Partial<FOLIOItem>): Promise<FOLIOItem> {
    const response = await fetch(`${this.config.okapiUrl}/item-storage/items`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...item,
        id: item.id || this.generateUUID(),
        status: item.status || { name: 'Available' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create item: ${error}`);
    }

    return response.json();
  }

  /**
   * Get MARC record for instance (from mod-source-record-storage)
   */
  async getMARCRecord(instanceId: string): Promise<any> {
    const response = await fetch(
      `${this.config.okapiUrl}/source-storage/records?instanceId=${instanceId}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get MARC record: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Import MARC record using mod-data-import
   */
  async importMARCRecord(marcContent: string): Promise<any> {
    const response = await fetch(`${this.config.okapiUrl}/data-import/uploadDefinitions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        fileDefinitions: [
          {
            name: 'import.mrc',
            size: marcContent.length,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to import MARC: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search using CQL (Contextual Query Language)
   */
  async searchCQL(endpoint: string, cql: string, limit = 100): Promise<any> {
    const response = await fetch(
      `${this.config.okapiUrl}/${endpoint}?query=${encodeURIComponent(cql)}&limit=${limit}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`CQL search failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get reference data (instance types, identifier types, etc.)
   */
  async getReferenceData(type: 'instance-types' | 'identifier-types' | 'contributor-name-types' | 'locations' | 'material-types'): Promise<any> {
    const endpoints: Record<string, string> = {
      'instance-types': '/instance-types',
      'identifier-types': '/identifier-types',
      'contributor-name-types': '/contributor-name-types',
      'locations': '/locations',
      'material-types': '/material-types',
    };

    const response = await fetch(`${this.config.okapiUrl}${endpoints[type]}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get reference data: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Convert BIBFRAME to FOLIO Instance
   */
  bibframeToFOLIOInstance(bibframe: any): Partial<FOLIOInstance> {
    return {
      title: bibframe.title || 'Untitled',
      contributors: bibframe.contribution?.map((c: any) => ({
        name: c.agent?.label || c.agent?.name || 'Unknown',
      })) || [],
      identifiers: bibframe.identifiedBy?.map((id: any) => ({
        value: id.value || id.isbn || id.issn || '',
        identifierTypeId: this.mapIdentifierType(id['@type']),
      })) || [],
      subjects: bibframe.subject?.map((s: any) => ({
        value: s.label || s.term || '',
      })) || [],
      publication: bibframe.provisionActivity?.map((p: any) => ({
        publisher: p.agent?.label,
        dateOfPublication: p.date,
        place: p.place?.label,
      })) || [],
      instanceTypeId: this.mapInstanceType(bibframe['@type']),
      source: 'BIBFRAME',
      catalogedDate: new Date().toISOString().split('T')[0],
    };
  }

  /**
   * Convert FOLIO Instance to BIBFRAME
   */
  folioInstanceToBIBFRAME(instance: FOLIOInstance): any {
    return {
      '@context': 'http://bibfra.me/vocab/lite/',
      '@type': 'Instance',
      title: instance.title,
      contribution: instance.contributors?.map(c => ({
        '@type': 'Contribution',
        agent: {
          '@type': 'Person',
          label: c.name,
        },
      })) || [],
      identifiedBy: instance.identifiers?.map(id => ({
        '@type': 'Identifier',
        value: id.value,
      })) || [],
      subject: instance.subjects?.map(s => ({
        '@type': 'Topic',
        label: s.value,
      })) || [],
      provisionActivity: instance.publication?.map(p => ({
        '@type': 'Publication',
        agent: p.publisher ? { label: p.publisher } : undefined,
        date: p.dateOfPublication,
        place: p.place ? { label: p.place } : undefined,
      })) || [],
    };
  }

  // Utility methods
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private mapIdentifierType(bibframeType: string): string {
    // Default FOLIO UUID for ISBN - you'd need to get actual UUIDs from your FOLIO instance
    const mapping: Record<string, string> = {
      'bf:Isbn': '8261054f-be78-422d-bd51-4ed9f33c3422',
      'bf:Issn': '913300b2-03ed-469a-8179-c1092c991227',
      'bf:Lccn': 'c858e4f2-2b6b-4385-842b-60732ee14abb',
    };
    return mapping[bibframeType] || '7e591197-f335-4afb-bc6d-a6d76ca3bace'; // Default to "Other"
  }

  private mapInstanceType(bibframeType: string): string {
    // Default FOLIO UUID for text - you'd need actual UUIDs from your FOLIO instance
    const mapping: Record<string, string> = {
      'bf:Text': '6312d172-f0cf-40f6-b27d-9fa8feaf332f',
      'bf:StillImage': '3363cdb1-e644-446c-82a4-dc3a1d4395b9',
      'bf:MovingImage': '526aa04d-9289-4511-8866-349299592c18',
    };
    return mapping[bibframeType] || '6312d172-f0cf-40f6-b27d-9fa8feaf332f'; // Default to "text"
  }
}

// Singleton instance
let folioClient: FOLIOApiClient | null = null;

export function initializeFOLIOClient(config: FOLIOConfig): FOLIOApiClient {
  folioClient = new FOLIOApiClient(config);
  return folioClient;
}

export function getFOLIOClient(): FOLIOApiClient {
  if (!folioClient) {
    throw new Error('FOLIO client not initialized. Call initializeFOLIOClient first.');
  }
  return folioClient;
}
