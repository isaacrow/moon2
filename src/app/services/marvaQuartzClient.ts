/**
 * Marva Quartz Client
 * Integration with Library of Congress BIBFRAME Editor
 * Based on: https://github.com/lcnetdev/marva-quartz
 */

export interface MarvaProfile {
  id: string;
  name: string;
  description?: string;
  resourceTemplates: ResourceTemplate[];
  author?: string;
  date?: string;
  schema?: string;
}

export interface ResourceTemplate {
  id: string;
  resourceLabel: string;
  resourceURI: string;
  propertyTemplates: PropertyTemplate[];
  author?: string;
  date?: string;
  remark?: string;
}

export interface PropertyTemplate {
  propertyURI: string;
  propertyLabel: string;
  mandatory?: boolean;
  repeatable?: boolean;
  type: 'literal' | 'resource' | 'lookup';
  valueConstraint?: ValueConstraint;
  remark?: string;
}

export interface ValueConstraint {
  valueTemplateRefs?: string[];
  valueDataType?: {
    dataTypeURI: string;
    dataTypeLabel?: string;
  };
  defaults?: Array<{
    defaultURI: string;
    defaultLiteral: string;
  }>;
  useValuesFrom?: string[];
}

export interface LOCAuthority {
  uri: string;
  label: string;
  scheme?: string;
  type?: string;
}

export interface MarvaResource {
  '@id'?: string;
  '@type': string;
  [key: string]: any;
}

export class MarvaQuartzClient {
  private baseURL = 'https://id.loc.gov';
  private marvaBaseURL = 'https://marva.io';
  
  /**
   * Load BIBFRAME profile
   */
  async loadProfile(profileId: string): Promise<MarvaProfile> {
    try {
      const response = await fetch(`${this.marvaBaseURL}/api/profiles/${profileId}`);
      if (!response.ok) {
        throw new Error(`Failed to load profile: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Profile loading error:', error);
      // Return default BIBFRAME profile
      return this.getDefaultBIBFRAMEProfile();
    }
  }

  /**
   * Get default BIBFRAME 2.0 profile
   */
  getDefaultBIBFRAMEProfile(): MarvaProfile {
    return {
      id: 'lc:profile:bf2:Monograph',
      name: 'BIBFRAME 2.0 Monograph',
      description: 'Library of Congress BIBFRAME 2.0 Monograph Profile',
      author: 'Library of Congress',
      schema: 'https://www.loc.gov/bibframe/',
      resourceTemplates: [
        // Work Template
        {
          id: 'lc:RT:bf2:Monograph:Work',
          resourceLabel: 'BIBFRAME Work',
          resourceURI: 'http://id.loc.gov/ontologies/bibframe/Work',
          propertyTemplates: [
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/title',
              propertyLabel: 'Title',
              mandatory: true,
              repeatable: false,
              type: 'resource',
              valueConstraint: {
                valueTemplateRefs: ['lc:RT:bf2:Title']
              }
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/contribution',
              propertyLabel: 'Contribution',
              mandatory: false,
              repeatable: true,
              type: 'resource',
              valueConstraint: {
                valueTemplateRefs: ['lc:RT:bf2:Contribution']
              }
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/subject',
              propertyLabel: 'Subject',
              mandatory: false,
              repeatable: true,
              type: 'lookup',
              valueConstraint: {
                useValuesFrom: [
                  'http://id.loc.gov/authorities/subjects',
                  'http://id.loc.gov/authorities/names',
                  'http://id.loc.gov/authorities/childrensSubjects'
                ]
              }
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/classification',
              propertyLabel: 'Classification',
              mandatory: false,
              repeatable: true,
              type: 'resource',
              valueConstraint: {
                valueTemplateRefs: ['lc:RT:bf2:Classification']
              }
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/content',
              propertyLabel: 'Content Type',
              mandatory: false,
              repeatable: true,
              type: 'lookup',
              valueConstraint: {
                useValuesFrom: ['http://id.loc.gov/vocabulary/contentTypes']
              }
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/language',
              propertyLabel: 'Language',
              mandatory: false,
              repeatable: true,
              type: 'lookup',
              valueConstraint: {
                useValuesFrom: ['http://id.loc.gov/vocabulary/languages']
              }
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/note',
              propertyLabel: 'Note',
              mandatory: false,
              repeatable: true,
              type: 'literal'
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/genreForm',
              propertyLabel: 'Genre/Form',
              mandatory: false,
              repeatable: true,
              type: 'lookup',
              valueConstraint: {
                useValuesFrom: ['http://id.loc.gov/authorities/genreForms']
              }
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/temporalCoverage',
              propertyLabel: 'Temporal Coverage',
              mandatory: false,
              repeatable: true,
              type: 'literal'
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/geographicCoverage',
              propertyLabel: 'Geographic Coverage',
              mandatory: false,
              repeatable: true,
              type: 'lookup',
              valueConstraint: {
                useValuesFrom: ['http://id.loc.gov/vocabulary/geographicAreas']
              }
            }
          ]
        },
        // Instance Template
        {
          id: 'lc:RT:bf2:Monograph:Instance',
          resourceLabel: 'BIBFRAME Instance',
          resourceURI: 'http://id.loc.gov/ontologies/bibframe/Instance',
          propertyTemplates: [
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/title',
              propertyLabel: 'Title',
              mandatory: true,
              repeatable: false,
              type: 'resource',
              valueConstraint: {
                valueTemplateRefs: ['lc:RT:bf2:Title']
              }
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/provisionActivity',
              propertyLabel: 'Publication Information',
              mandatory: false,
              repeatable: true,
              type: 'resource',
              valueConstraint: {
                valueTemplateRefs: ['lc:RT:bf2:Publication']
              }
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/identifiedBy',
              propertyLabel: 'Identifier',
              mandatory: false,
              repeatable: true,
              type: 'resource',
              valueConstraint: {
                valueTemplateRefs: ['lc:RT:bf2:Identifier']
              }
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/extent',
              propertyLabel: 'Extent',
              mandatory: false,
              repeatable: false,
              type: 'resource',
              valueConstraint: {
                valueTemplateRefs: ['lc:RT:bf2:Extent']
              }
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/dimensions',
              propertyLabel: 'Dimensions',
              mandatory: false,
              repeatable: false,
              type: 'literal'
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/media',
              propertyLabel: 'Media Type',
              mandatory: false,
              repeatable: true,
              type: 'lookup',
              valueConstraint: {
                useValuesFrom: ['http://id.loc.gov/vocabulary/mediaTypes']
              }
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/carrier',
              propertyLabel: 'Carrier Type',
              mandatory: false,
              repeatable: true,
              type: 'lookup',
              valueConstraint: {
                useValuesFrom: ['http://id.loc.gov/vocabulary/carriers']
              }
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/editionStatement',
              propertyLabel: 'Edition Statement',
              mandatory: false,
              repeatable: false,
              type: 'literal'
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/responsibilityStatement',
              propertyLabel: 'Statement of Responsibility',
              mandatory: false,
              repeatable: false,
              type: 'literal'
            }
          ]
        },
        // Item Template
        {
          id: 'lc:RT:bf2:Monograph:Item',
          resourceLabel: 'BIBFRAME Item',
          resourceURI: 'http://id.loc.gov/ontologies/bibframe/Item',
          propertyTemplates: [
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/heldBy',
              propertyLabel: 'Held By',
              mandatory: false,
              repeatable: false,
              type: 'lookup',
              valueConstraint: {
                useValuesFrom: ['http://id.loc.gov/vocabulary/organizations']
              }
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/sublocation',
              propertyLabel: 'Sublocation',
              mandatory: false,
              repeatable: false,
              type: 'literal'
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/shelfMark',
              propertyLabel: 'Shelf Mark',
              mandatory: false,
              repeatable: false,
              type: 'literal'
            },
            {
              propertyURI: 'http://id.loc.gov/ontologies/bibframe/itemOf',
              propertyLabel: 'Item Of',
              mandatory: true,
              repeatable: false,
              type: 'resource'
            }
          ]
        }
      ]
    };
  }

  /**
   * Search LOC authorities
   */
  async searchAuthority(
    scheme: string,
    query: string,
    limit: number = 10
  ): Promise<LOCAuthority[]> {
    const schemeMap: Record<string, string> = {
      subjects: 'subjects',
      names: 'names',
      'genre-forms': 'genreForms',
      'geographic': 'geographicAreas',
      'languages': 'languages',
      'content-types': 'contentTypes',
      'media-types': 'mediaTypes',
      'carriers': 'carriers'
    };

    const endpoint = schemeMap[scheme] || scheme;
    const searchURL = `${this.baseURL}/authorities/${endpoint}/suggest2/?q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(searchURL);
      if (!response.ok) {
        throw new Error(`Authority search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return (data.hits || []).slice(0, limit).map((hit: any) => ({
        uri: hit.uri || hit.id,
        label: hit.aLabel || hit.label || hit.suggestLabel,
        scheme: scheme,
        type: hit.type
      }));
    } catch (error) {
      console.error('Authority search error:', error);
      return [];
    }
  }

  /**
   * Get authority details
   */
  async getAuthority(uri: string): Promise<any> {
    try {
      const response = await fetch(`${uri}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch authority: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Authority fetch error:', error);
      return null;
    }
  }

  /**
   * Validate BIBFRAME resource against profile
   */
  validateResource(resource: MarvaResource, template: ResourceTemplate): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check mandatory fields
    template.propertyTemplates
      .filter(pt => pt.mandatory)
      .forEach(pt => {
        const propKey = this.getPropertyKey(pt.propertyURI);
        if (!resource[propKey] || (Array.isArray(resource[propKey]) && resource[propKey].length === 0)) {
          errors.push(`Missing mandatory field: ${pt.propertyLabel}`);
        }
      });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert property URI to key
   */
  private getPropertyKey(uri: string): string {
    return uri.split('/').pop() || uri;
  }

  /**
   * Search LOC linked data
   */
  async searchLinkedData(query: string, type?: string): Promise<any[]> {
    const params = new URLSearchParams({
      q: query,
      count: '20',
      format: 'json'
    });

    if (type) {
      params.append('rdftype', type);
    }

    try {
      const response = await fetch(`${this.baseURL}/search/?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Linked data search error:', error);
      return [];
    }
  }

  /**
   * Get vocabulary terms
   */
  async getVocabularyTerms(vocabulary: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/vocabulary/${vocabulary}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch vocabulary: ${response.statusText}`);
      }

      const data = await response.json();
      return data['@graph'] || [];
    } catch (error) {
      console.error('Vocabulary fetch error:', error);
      return [];
    }
  }

  /**
   * Convert Marva resource to BIBFRAME RDF
   */
  toRDF(resource: MarvaResource): string {
    const context = {
      '@context': {
        'bf': 'http://id.loc.gov/ontologies/bibframe/',
        'bflc': 'http://id.loc.gov/ontologies/bflc/',
        'madsrdf': 'http://www.loc.gov/mads/rdf/v1#',
        'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
        'skos': 'http://www.w3.org/2004/02/skos/core#'
      }
    };

    return JSON.stringify({ ...context, ...resource }, null, 2);
  }

  /**
   * Export to MARCXML
   */
  async exportToMARCXML(resource: MarvaResource): Promise<string> {
    // This would integrate with LOC's BIBFRAME to MARC conversion service
    try {
      const response = await fetch('https://id.loc.gov/transform/bibframe2marc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resource)
      });

      if (!response.ok) {
        throw new Error('MARC conversion failed');
      }

      return response.text();
    } catch (error) {
      console.error('MARC export error:', error);
      throw error;
    }
  }

  /**
   * Import from MARCXML
   */
  async importFromMARCXML(marcxml: string): Promise<MarvaResource> {
    // This would integrate with LOC's MARC to BIBFRAME conversion service
    try {
      const response = await fetch('https://id.loc.gov/transform/marc2bibframe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml'
        },
        body: marcxml
      });

      if (!response.ok) {
        throw new Error('MARC import failed');
      }

      return response.json();
    } catch (error) {
      console.error('MARC import error:', error);
      throw error;
    }
  }

  /**
   * Get LC Classification suggestions
   */
  async getLCCClassification(query: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/authorities/classification/suggest2/?q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('Classification search failed');
      }

      const data = await response.json();
      return data.hits || [];
    } catch (error) {
      console.error('Classification search error:', error);
      return [];
    }
  }

  /**
   * Get Dewey Decimal Classification suggestions
   */
  async getDDCClassification(query: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/authorities/classification/ddc/suggest2/?q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('DDC search failed');
      }

      const data = await response.json();
      return data.hits || [];
    } catch (error) {
      console.error('DDC search error:', error);
      return [];
    }
  }
}

// Singleton instance
let marvaClient: MarvaQuartzClient | null = null;

export function getMarvaQuartzClient(): MarvaQuartzClient {
  if (!marvaClient) {
    marvaClient = new MarvaQuartzClient();
  }
  return marvaClient;
}
