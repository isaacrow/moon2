/**
 * KAMI Ontology Engine
 * Dynamically loads and processes BIBFRAME ontology for field generation
 */

import { OntologyClass, OntologyProperty, FieldInputType } from '../../types/kami';

// LOC BIBFRAME Ontology URL
const BIBFRAME_ONTOLOGY_URL = 'https://id.loc.gov/ontologies/bibframe.json';

// Cache ontology data in memory
let ontologyCache: Map<string, OntologyClass> | null = null;
let lastCacheUpdate: number = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * BIBFRAME Core Classes with their properties
 */
export const BIBFRAME_CLASSES: Record<string, OntologyClass> = {
  'bf:Text': {
    uri: 'http://id.loc.gov/ontologies/bibframe/Text',
    label: 'Text',
    definition: 'Content expressed through language',
    subClassOf: ['bf:Work'],
    properties: [
      {
        uri: 'bf:title',
        label: 'Title',
        definition: 'Title information for the resource',
        domain: ['bf:Work', 'bf:Instance'],
        range: ['bf:Title'],
        cardinality: 'single',
        required: true,
        inputType: { type: 'nested', vocabularyUri: 'bf:Title' }
      },
      {
        uri: 'bf:contribution',
        label: 'Contribution',
        definition: 'Agent associated with the resource',
        domain: ['bf:Work', 'bf:Instance'],
        range: ['bf:Contribution'],
        cardinality: 'multiple',
        required: true,
        inputType: { 
          type: 'authority', 
          authoritySource: 'names',
          vocabularyUri: 'http://id.loc.gov/authorities/names'
        }
      },
      {
        uri: 'bf:subject',
        label: 'Subject',
        definition: 'Index term or subject heading',
        domain: ['bf:Work'],
        range: ['bf:Topic', 'bf:Place', 'bf:Temporal', 'bf:GenreForm'],
        cardinality: 'multiple',
        required: false,
        inputType: { 
          type: 'authority', 
          authoritySource: 'subjects',
          vocabularyUri: 'http://id.loc.gov/authorities/subjects'
        }
      },
      {
        uri: 'bf:classification',
        label: 'Classification',
        definition: 'Classification number or code',
        domain: ['bf:Work'],
        range: ['bf:Classification'],
        cardinality: 'multiple',
        required: false,
        inputType: { 
          type: 'authority', 
          authoritySource: 'classification',
          vocabularyUri: 'http://id.loc.gov/authorities/classification'
        }
      },
      {
        uri: 'bf:content',
        label: 'Content Type',
        definition: 'Type of content embodied in the resource',
        domain: ['bf:Work'],
        range: ['bf:Content'],
        cardinality: 'single',
        required: false,
        inputType: { 
          type: 'select',
          vocabularyUri: 'http://id.loc.gov/vocabulary/contentTypes'
        }
      },
      {
        uri: 'bf:language',
        label: 'Language',
        definition: 'Language of the resource',
        domain: ['bf:Work'],
        range: ['bf:Language'],
        cardinality: 'multiple',
        required: false,
        inputType: { 
          type: 'select',
          vocabularyUri: 'http://id.loc.gov/vocabulary/languages'
        }
      },
      {
        uri: 'bf:genreForm',
        label: 'Genre/Form',
        definition: 'Genre or form of the resource',
        domain: ['bf:Work'],
        range: ['bf:GenreForm'],
        cardinality: 'multiple',
        required: false,
        inputType: { 
          type: 'authority',
          authoritySource: 'genreForms',
          vocabularyUri: 'http://id.loc.gov/authorities/genreForms'
        }
      },
      {
        uri: 'bf:note',
        label: 'Note',
        definition: 'Additional information about the resource',
        domain: ['bf:Work', 'bf:Instance'],
        range: ['bf:Note'],
        cardinality: 'multiple',
        required: false,
        inputType: { type: 'text' }
      },
      {
        uri: 'bf:originDate',
        label: 'Date of Origin',
        definition: 'Date or date range of creation',
        domain: ['bf:Work'],
        range: ['xsd:date'],
        cardinality: 'single',
        required: false,
        inputType: { type: 'date' }
      },
      {
        uri: 'bf:temporalCoverage',
        label: 'Temporal Coverage',
        definition: 'Time period covered by the content',
        domain: ['bf:Work'],
        range: ['xsd:string'],
        cardinality: 'single',
        required: false,
        inputType: { type: 'text' }
      },
      {
        uri: 'bf:geographicCoverage',
        label: 'Geographic Coverage',
        definition: 'Geographic area covered by the content',
        domain: ['bf:Work'],
        range: ['bf:Place'],
        cardinality: 'multiple',
        required: false,
        inputType: { 
          type: 'authority',
          authoritySource: 'geographicAreas',
          vocabularyUri: 'http://id.loc.gov/vocabulary/geographicAreas'
        }
      }
    ]
  },
  
  'bf:Manuscript': {
    uri: 'http://id.loc.gov/ontologies/bibframe/Manuscript',
    label: 'Manuscript',
    definition: 'Handwritten or typescript resource',
    subClassOf: ['bf:Instance'],
    properties: [
      {
        uri: 'bf:title',
        label: 'Title',
        definition: 'Title of the manuscript',
        domain: ['bf:Instance'],
        range: ['bf:Title'],
        cardinality: 'single',
        required: true,
        inputType: { type: 'nested', vocabularyUri: 'bf:Title' }
      },
      {
        uri: 'bf:originPlace',
        label: 'Place of Origin',
        definition: 'Place where the manuscript was created',
        domain: ['bf:Instance'],
        range: ['bf:Place'],
        cardinality: 'single',
        required: false,
        inputType: { 
          type: 'authority',
          authoritySource: 'geographicAreas'
        }
      },
      {
        uri: 'bf:originDate',
        label: 'Date of Origin',
        definition: 'Date when the manuscript was created',
        domain: ['bf:Instance'],
        range: ['xsd:date'],
        cardinality: 'single',
        required: false,
        inputType: { type: 'date' }
      },
      {
        uri: 'bf:script',
        label: 'Script',
        definition: 'Script used in the manuscript',
        domain: ['bf:Instance'],
        range: ['xsd:string'],
        cardinality: 'single',
        required: false,
        inputType: { 
          type: 'select',
          vocabularyUri: 'local:scripts'
        }
      },
      {
        uri: 'bf:baseMaterial',
        label: 'Base Material',
        definition: 'Physical material of the manuscript',
        domain: ['bf:Instance'],
        range: ['bf:BaseMaterial'],
        cardinality: 'single',
        required: false,
        inputType: { 
          type: 'select',
          vocabularyUri: 'http://id.loc.gov/vocabulary/mmaterial'
        }
      },
      {
        uri: 'bf:custodialHistory',
        label: 'Custodial History',
        definition: 'History of ownership and custody',
        domain: ['bf:Instance'],
        range: ['bf:CustodialHistory'],
        cardinality: 'multiple',
        required: false,
        inputType: { type: 'text' }
      },
      {
        uri: 'bf:physicalDescription',
        label: 'Physical Description',
        definition: 'Physical characteristics of the manuscript',
        domain: ['bf:Instance'],
        range: ['xsd:string'],
        cardinality: 'single',
        required: false,
        inputType: { type: 'text' }
      },
      {
        uri: 'bf:heldBy',
        label: 'Held By',
        definition: 'Institution holding the manuscript',
        domain: ['bf:Item'],
        range: ['bf:Agent'],
        cardinality: 'single',
        required: false,
        inputType: { 
          type: 'authority',
          authoritySource: 'names'
        }
      },
      {
        uri: 'bf:shelfMark',
        label: 'Shelf Mark',
        definition: 'Repository location identifier',
        domain: ['bf:Item'],
        range: ['bf:ShelfMark'],
        cardinality: 'single',
        required: false,
        inputType: { type: 'text' }
      }
    ]
  },
  
  'bf:Print': {
    uri: 'http://id.loc.gov/ontologies/bibframe/Print',
    label: 'Print',
    definition: 'Printed resource',
    subClassOf: ['bf:Instance'],
    properties: [
      {
        uri: 'bf:provisionActivity',
        label: 'Publication Information',
        definition: 'Publication, distribution, or manufacture activity',
        domain: ['bf:Instance'],
        range: ['bf:ProvisionActivity'],
        cardinality: 'multiple',
        required: true,
        inputType: { type: 'nested', vocabularyUri: 'bf:Publication' }
      },
      {
        uri: 'bf:identifiedBy',
        label: 'Identifier',
        definition: 'Identifier for the instance',
        domain: ['bf:Instance'],
        range: ['bf:Identifier'],
        cardinality: 'multiple',
        required: true,
        inputType: { type: 'repeatable', vocabularyUri: 'bf:Identifier' }
      },
      {
        uri: 'bf:extent',
        label: 'Extent',
        definition: 'Number and type of units',
        domain: ['bf:Instance'],
        range: ['bf:Extent'],
        cardinality: 'single',
        required: false,
        inputType: { type: 'text' }
      },
      {
        uri: 'bf:dimensions',
        label: 'Dimensions',
        definition: 'Physical size of the resource',
        domain: ['bf:Instance'],
        range: ['xsd:string'],
        cardinality: 'single',
        required: false,
        inputType: { type: 'text' }
      },
      {
        uri: 'bf:media',
        label: 'Media Type',
        definition: 'Type of device required to view the content',
        domain: ['bf:Instance'],
        range: ['bf:Media'],
        cardinality: 'single',
        required: false,
        inputType: { 
          type: 'select',
          vocabularyUri: 'http://id.loc.gov/vocabulary/mediaTypes'
        }
      },
      {
        uri: 'bf:carrier',
        label: 'Carrier Type',
        definition: 'Format of the storage medium',
        domain: ['bf:Instance'],
        range: ['bf:Carrier'],
        cardinality: 'single',
        required: false,
        inputType: { 
          type: 'select',
          vocabularyUri: 'http://id.loc.gov/vocabulary/carriers'
        }
      }
    ]
  }
};

/**
 * Get ontology class definition
 */
export function getOntologyClass(classUri: string): OntologyClass | undefined {
  // Normalize URI
  const shortForm = classUri.replace('http://id.loc.gov/ontologies/bibframe/', 'bf:');
  return BIBFRAME_CLASSES[shortForm];
}

/**
 * Get all properties for a class (including inherited)
 */
export function getClassProperties(classUri: string): OntologyProperty[] {
  const ontologyClass = getOntologyClass(classUri);
  if (!ontologyClass) return [];
  
  const properties = [...ontologyClass.properties];
  
  // Add inherited properties
  if (ontologyClass.subClassOf) {
    for (const parentUri of ontologyClass.subClassOf) {
      const parentClass = getOntologyClass(parentUri);
      if (parentClass) {
        properties.push(...parentClass.properties);
      }
    }
  }
  
  // Remove duplicates
  const seen = new Set<string>();
  return properties.filter(prop => {
    if (seen.has(prop.uri)) return false;
    seen.add(prop.uri);
    return true;
  });
}

/**
 * Get property definition
 */
export function getProperty(propertyUri: string): OntologyProperty | undefined {
  for (const ontologyClass of Object.values(BIBFRAME_CLASSES)) {
    const property = ontologyClass.properties.find(p => p.uri === propertyUri);
    if (property) return property;
  }
  return undefined;
}

/**
 * Determine input type for a property
 */
export function getInputType(property: OntologyProperty): FieldInputType {
  return property.inputType;
}

/**
 * Check if property is required for a class
 */
export function isPropertyRequired(classUri: string, propertyUri: string): boolean {
  const properties = getClassProperties(classUri);
  const property = properties.find(p => p.uri === propertyUri);
  return property?.required ?? false;
}

/**
 * Get all work classes
 */
export function getWorkClasses(): OntologyClass[] {
  return Object.values(BIBFRAME_CLASSES).filter(
    cls => cls.subClassOf?.includes('bf:Work')
  );
}

/**
 * Get all instance classes
 */
export function getInstanceClasses(): OntologyClass[] {
  return Object.values(BIBFRAME_CLASSES).filter(
    cls => cls.subClassOf?.includes('bf:Instance')
  );
}

/**
 * Load ontology from LOC (future implementation)
 */
export async function loadOntologyFromLOC(): Promise<void> {
  // Check cache
  if (ontologyCache && Date.now() - lastCacheUpdate < CACHE_TTL) {
    return;
  }
  
  try {
    const response = await fetch(BIBFRAME_ONTOLOGY_URL);
    if (!response.ok) {
      console.warn('Failed to load ontology from LOC, using static definitions');
      return;
    }
    
    const data = await response.json();
    
    // Parse ontology and update cache
    // This would involve parsing RDF JSON-LD and building the class/property structure
    // For now, we use the static definitions above
    
    ontologyCache = new Map();
    lastCacheUpdate = Date.now();
    
    console.log('Ontology loaded successfully from LOC');
  } catch (error) {
    console.error('Error loading ontology:', error);
    console.log('Using static ontology definitions');
  }
}

/**
 * Refresh ontology cache
 */
export async function refreshOntology(): Promise<void> {
  ontologyCache = null;
  lastCacheUpdate = 0;
  await loadOntologyFromLOC();
}

/**
 * Get ontology statistics
 */
export function getOntologyStats() {
  const classes = Object.values(BIBFRAME_CLASSES);
  const totalProperties = classes.reduce((sum, cls) => sum + cls.properties.length, 0);
  
  return {
    totalClasses: classes.length,
    totalProperties,
    workClasses: getWorkClasses().length,
    instanceClasses: getInstanceClasses().length,
    lastUpdated: new Date(lastCacheUpdate).toISOString()
  };
}

/**
 * Vocabulary definitions for select fields
 */
export const VOCABULARIES: Record<string, { uri: string; label: string }[]> = {
  'local:scripts': [
    { uri: 'Arabic', label: 'Arabic' },
    { uri: 'Hebrew', label: 'Hebrew' },
    { uri: 'Latin', label: 'Latin' },
    { uri: 'Greek', label: 'Greek' },
    { uri: 'Cyrillic', label: 'Cyrillic' },
    { uri: 'Chinese', label: 'Chinese' },
    { uri: 'Japanese', label: 'Japanese' },
    { uri: 'Korean', label: 'Korean' },
    { uri: 'Devanagari', label: 'Devanagari' },
    { uri: 'Other', label: 'Other' }
  ]
};

/**
 * Get vocabulary options
 */
export async function getVocabularyOptions(vocabularyUri: string): Promise<{ uri: string; label: string }[]> {
  // Check local vocabularies first
  if (VOCABULARIES[vocabularyUri]) {
    return VOCABULARIES[vocabularyUri];
  }
  
  // For LOC vocabularies, fetch from API
  if (vocabularyUri.startsWith('http://id.loc.gov/vocabulary/')) {
    try {
      const response = await fetch(`${vocabularyUri}.json`);
      if (response.ok) {
        const data = await response.json();
        // Parse LOC vocabulary JSON-LD
        // Return formatted options
        return [];
      }
    } catch (error) {
      console.error('Error loading vocabulary:', error);
    }
  }
  
  return [];
}
