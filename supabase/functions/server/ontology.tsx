// Moon Engine Ontology Schema Manager
// Handles BIBFRAME ontology loading and schema management

interface OntologySchema {
  classes: Record<string, ClassDefinition>;
  properties: Record<string, PropertyDefinition>;
  namespaces: Record<string, string>;
  version: string;
}

interface ClassDefinition {
  uri: string;
  label: string;
  description: string;
  superClass?: string;
  properties: string[];
}

interface PropertyDefinition {
  uri: string;
  label: string;
  description: string;
  domain: string[];
  range: string[];
  required: boolean;
}

class Ontology {
  private schema: OntologySchema | null = null;
  private initialized: boolean = false;

  constructor() {
    console.log('[Ontology] Instance created');
  }

  async loadSchema(): Promise<void> {
    console.log('[Ontology] Loading BIBFRAME schema...');
    
    try {
      // BIBFRAME 2.0/3.0 Core Schema
      this.schema = {
        version: '2.0',
        namespaces: {
          bf: 'http://id.loc.gov/ontologies/bibframe/',
          bflc: 'http://id.loc.gov/ontologies/bflc/',
          madsrdf: 'http://www.loc.gov/mads/rdf/v1#',
          rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
          rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        },
        classes: {
          'bf:Work': {
            uri: 'http://id.loc.gov/ontologies/bibframe/Work',
            label: 'Work',
            description: 'A resource reflecting a conceptual essence of the cataloging resource',
            properties: ['bf:title', 'bf:creator', 'bf:contributor', 'bf:subject', 'bf:language', 'bf:classification', 'bf:genreForm', 'bf:originDate', 'bf:summary']
          },
          'bf:Instance': {
            uri: 'http://id.loc.gov/ontologies/bibframe/Instance',
            label: 'Instance',
            description: 'A resource reflecting an individual, material embodiment of a Work',
            properties: ['bf:title', 'bf:provisionActivity', 'bf:identifiedBy', 'bf:extent', 'bf:dimensions', 'bf:carrier', 'bf:editionStatement', 'bf:instanceOf']
          },
          'bf:Item': {
            uri: 'http://id.loc.gov/ontologies/bibframe/Item',
            label: 'Item',
            description: 'A resource reflecting an actual, individual, material item',
            properties: ['bf:heldBy', 'bf:itemOf', 'bf:electronicLocator', 'bf:shelfMark', 'bf:barcode']
          },
          'bf:Agent': {
            uri: 'http://id.loc.gov/ontologies/bibframe/Agent',
            label: 'Agent',
            description: 'An entity having a role in a resource',
            properties: ['rdfs:label', 'bf:identifiedBy']
          },
          'bf:Title': {
            uri: 'http://id.loc.gov/ontologies/bibframe/Title',
            label: 'Title',
            description: 'Title information relating to a resource',
            properties: ['bf:mainTitle', 'bf:subtitle', 'bf:partName', 'bf:partNumber']
          },
          'bf:ProvisionActivity': {
            uri: 'http://id.loc.gov/ontologies/bibframe/ProvisionActivity',
            label: 'Provision Activity',
            description: 'Activity associated with the publication, printing, distribution, issue, release, or production of an Instance',
            properties: ['bf:agent', 'bf:place', 'bf:date']
          }
        },
        properties: {
          'bf:title': {
            uri: 'http://id.loc.gov/ontologies/bibframe/title',
            label: 'Title',
            description: 'Title of the resource',
            domain: ['bf:Work', 'bf:Instance'],
            range: ['bf:Title'],
            required: true
          },
          'bf:creator': {
            uri: 'http://id.loc.gov/ontologies/bibframe/creator',
            label: 'Creator',
            description: 'Entity associated with the creation of the Work',
            domain: ['bf:Work'],
            range: ['bf:Agent'],
            required: false
          },
          'bf:contributor': {
            uri: 'http://id.loc.gov/ontologies/bibframe/contributor',
            label: 'Contributor',
            description: 'Entity associated with the content of the Work',
            domain: ['bf:Work'],
            range: ['bf:Agent'],
            required: false
          },
          'bf:subject': {
            uri: 'http://id.loc.gov/ontologies/bibframe/subject',
            label: 'Subject',
            description: 'Index term, subject term, or descriptor',
            domain: ['bf:Work'],
            range: ['bf:Topic', 'bf:Place', 'bf:Agent'],
            required: false
          },
          'bf:language': {
            uri: 'http://id.loc.gov/ontologies/bibframe/language',
            label: 'Language',
            description: 'Language of the content',
            domain: ['bf:Work'],
            range: ['bf:Language'],
            required: false
          },
          'bf:classification': {
            uri: 'http://id.loc.gov/ontologies/bibframe/classification',
            label: 'Classification',
            description: 'Classification number',
            domain: ['bf:Work'],
            range: ['bf:Classification'],
            required: false
          },
          'bf:provisionActivity': {
            uri: 'http://id.loc.gov/ontologies/bibframe/provisionActivity',
            label: 'Provision Activity',
            description: 'Publication, printing, distribution, issue, release, or production activity',
            domain: ['bf:Instance'],
            range: ['bf:ProvisionActivity'],
            required: false
          },
          'bf:identifiedBy': {
            uri: 'http://id.loc.gov/ontologies/bibframe/identifiedBy',
            label: 'Identifier',
            description: 'Character string associated with a resource that serves to differentiate that resource',
            domain: ['bf:Instance', 'bf:Work'],
            range: ['bf:Identifier'],
            required: false
          },
          'bf:extent': {
            uri: 'http://id.loc.gov/ontologies/bibframe/extent',
            label: 'Extent',
            description: 'Number and type of units and/or subunits making up a resource',
            domain: ['bf:Instance'],
            range: ['bf:Extent'],
            required: false
          },
          'bf:instanceOf': {
            uri: 'http://id.loc.gov/ontologies/bibframe/instanceOf',
            label: 'Instance Of',
            description: 'Work the resource instantiates or manifests',
            domain: ['bf:Instance'],
            range: ['bf:Work'],
            required: true
          }
        }
      };

      this.initialized = true;
      console.log('[Ontology] ✅ Schema loaded successfully');
      console.log(`[Ontology] Classes: ${Object.keys(this.schema.classes).length}`);
      console.log(`[Ontology] Properties: ${Object.keys(this.schema.properties).length}`);
      
    } catch (error) {
      console.error('[Ontology] ❌ Failed to load schema:', error);
      throw new Error(`Ontology schema loading failed: ${error}`);
    }
  }

  getSchema(): OntologySchema | null {
    return this.schema;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getClass(className: string): ClassDefinition | undefined {
    if (!this.schema) {
      throw new Error('Ontology schema not loaded');
    }
    return this.schema.classes[className];
  }

  getProperty(propertyName: string): PropertyDefinition | undefined {
    if (!this.schema) {
      throw new Error('Ontology schema not loaded');
    }
    return this.schema.properties[propertyName];
  }

  getPropertiesForClass(className: string): PropertyDefinition[] {
    const classData = this.getClass(className);
    if (!classData) {
      return [];
    }

    return classData.properties
      .map(propName => this.getProperty(propName))
      .filter((prop): prop is PropertyDefinition => prop !== undefined);
  }

  validateEntity(entity: any, className: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const classData = this.getClass(className);

    if (!classData) {
      errors.push(`Unknown class: ${className}`);
      return { valid: false, errors };
    }

    const requiredProps = this.getPropertiesForClass(className)
      .filter(prop => prop.required)
      .map(prop => prop.uri.split('/').pop());

    requiredProps.forEach(propName => {
      if (!entity[propName]) {
        errors.push(`Required property missing: ${propName}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Singleton instance
const ontology = new Ontology();

export default ontology;
export type { OntologySchema, ClassDefinition, PropertyDefinition };
