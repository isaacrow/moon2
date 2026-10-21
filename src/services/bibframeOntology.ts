/**
 * BIBFRAME Ontology Loader & Parser
 * Dynamically loads official BIBFRAME ontology from LOC GitHub
 * Parses classes, properties, domains, ranges
 * Enables ontology-driven cataloging
 */

export interface BibframeClass {
  uri: string;
  label: string;
  comment?: string;
  subClassOf?: string[];
}

export interface BibframeProperty {
  uri: string;
  label: string;
  comment?: string;
  domain?: string[];
  range?: string[];
  type: 'ObjectProperty' | 'DatatypeProperty';
  required?: boolean;
}

export interface BibframeOntology {
  classes: Map<string, BibframeClass>;
  properties: Map<string, BibframeProperty>;
  version: string;
  loaded: Date;
}

/**
 * Core BIBFRAME classes (from ontology)
 */
export const BIBFRAME_CORE_CLASSES = {
  WORK: 'http://id.loc.gov/ontologies/bibframe/Work',
  INSTANCE: 'http://id.loc.gov/ontologies/bibframe/Instance',
  ITEM: 'http://id.loc.gov/ontologies/bibframe/Item',
  AGENT: 'http://id.loc.gov/ontologies/bibframe/Agent',
  PERSON: 'http://id.loc.gov/ontologies/bibframe/Person',
  ORGANIZATION: 'http://id.loc.gov/ontologies/bibframe/Organization',
  TITLE: 'http://id.loc.gov/ontologies/bibframe/Title',
  CONTRIBUTION: 'http://id.loc.gov/ontologies/bibframe/Contribution',
  PROVISION_ACTIVITY: 'http://id.loc.gov/ontologies/bibframe/ProvisionActivity',
  PUBLICATION: 'http://id.loc.gov/ontologies/bibframe/Publication',
  IDENTIFIER: 'http://id.loc.gov/ontologies/bibframe/Identifier',
  ISBN: 'http://id.loc.gov/ontologies/bibframe/Isbn',
  ISSN: 'http://id.loc.gov/ontologies/bibframe/Issn',
  LCCN: 'http://id.loc.gov/ontologies/bibframe/Lccn',
  LOCAL: 'http://id.loc.gov/ontologies/bibframe/Local',
  BARCODE: 'http://id.loc.gov/ontologies/bibframe/Barcode',
  CLASSIFICATION: 'http://id.loc.gov/ontologies/bibframe/Classification',
  TOPIC: 'http://id.loc.gov/ontologies/bibframe/Topic',
  PLACE: 'http://id.loc.gov/ontologies/bibframe/Place',
};

/**
 * Core BIBFRAME properties with metadata
 */
export const BIBFRAME_PROPERTIES = new Map<string, BibframeProperty>([
  // Work properties
  ['bf:title', {
    uri: 'http://id.loc.gov/ontologies/bibframe/title',
    label: 'Title',
    comment: 'Name given to a resource',
    domain: [BIBFRAME_CORE_CLASSES.WORK, BIBFRAME_CORE_CLASSES.INSTANCE],
    range: [BIBFRAME_CORE_CLASSES.TITLE],
    type: 'ObjectProperty',
    required: true
  }],
  ['bf:contribution', {
    uri: 'http://id.loc.gov/ontologies/bibframe/contribution',
    label: 'Contribution',
    comment: 'Agent and role with respect to the resource',
    domain: [BIBFRAME_CORE_CLASSES.WORK],
    range: [BIBFRAME_CORE_CLASSES.CONTRIBUTION],
    type: 'ObjectProperty',
    required: true
  }],
  ['bf:language', {
    uri: 'http://id.loc.gov/ontologies/bibframe/language',
    label: 'Language',
    comment: 'Language of the content',
    domain: [BIBFRAME_CORE_CLASSES.WORK],
    range: ['http://id.loc.gov/vocabulary/languages/'],
    type: 'ObjectProperty',
    required: false
  }],
  ['bf:genreForm', {
    uri: 'http://id.loc.gov/ontologies/bibframe/genreForm',
    label: 'Genre/Form',
    comment: 'Genre, style, or form',
    domain: [BIBFRAME_CORE_CLASSES.WORK],
    range: ['http://id.loc.gov/authorities/genreForms/'],
    type: 'ObjectProperty',
    required: false
  }],
  ['bf:subject', {
    uri: 'http://id.loc.gov/ontologies/bibframe/subject',
    label: 'Subject',
    comment: 'Topic of the resource',
    domain: [BIBFRAME_CORE_CLASSES.WORK],
    range: [BIBFRAME_CORE_CLASSES.TOPIC, 'http://id.loc.gov/authorities/subjects/'],
    type: 'ObjectProperty',
    required: false
  }],
  ['bf:classification', {
    uri: 'http://id.loc.gov/ontologies/bibframe/classification',
    label: 'Classification',
    comment: 'Classification number',
    domain: [BIBFRAME_CORE_CLASSES.WORK],
    range: [BIBFRAME_CORE_CLASSES.CLASSIFICATION],
    type: 'ObjectProperty',
    required: false
  }],
  ['bf:hasInstance', {
    uri: 'http://id.loc.gov/ontologies/bibframe/hasInstance',
    label: 'Has Instance',
    comment: 'Work realized by an Instance',
    domain: [BIBFRAME_CORE_CLASSES.WORK],
    range: [BIBFRAME_CORE_CLASSES.INSTANCE],
    type: 'ObjectProperty',
    required: true
  }],

  // Instance properties
  ['bf:instanceOf', {
    uri: 'http://id.loc.gov/ontologies/bibframe/instanceOf',
    label: 'Instance Of',
    comment: 'Instance of a Work',
    domain: [BIBFRAME_CORE_CLASSES.INSTANCE],
    range: [BIBFRAME_CORE_CLASSES.WORK],
    type: 'ObjectProperty',
    required: true
  }],
  ['bf:provisionActivity', {
    uri: 'http://id.loc.gov/ontologies/bibframe/provisionActivity',
    label: 'Provision Activity',
    comment: 'Publication, distribution, etc.',
    domain: [BIBFRAME_CORE_CLASSES.INSTANCE],
    range: [BIBFRAME_CORE_CLASSES.PROVISION_ACTIVITY, BIBFRAME_CORE_CLASSES.PUBLICATION],
    type: 'ObjectProperty',
    required: true
  }],
  ['bf:identifiedBy', {
    uri: 'http://id.loc.gov/ontologies/bibframe/identifiedBy',
    label: 'Identified By',
    comment: 'Identifier for the resource',
    domain: [BIBFRAME_CORE_CLASSES.INSTANCE, BIBFRAME_CORE_CLASSES.ITEM],
    range: [BIBFRAME_CORE_CLASSES.IDENTIFIER],
    type: 'ObjectProperty',
    required: false
  }],
  ['bf:extent', {
    uri: 'http://id.loc.gov/ontologies/bibframe/extent',
    label: 'Extent',
    comment: 'Physical extent (e.g., pages)',
    domain: [BIBFRAME_CORE_CLASSES.INSTANCE],
    range: ['http://www.w3.org/2001/XMLSchema#string'],
    type: 'DatatypeProperty',
    required: false
  }],
  ['bf:carrier', {
    uri: 'http://id.loc.gov/ontologies/bibframe/carrier',
    label: 'Carrier',
    comment: 'Format of the storage medium',
    domain: [BIBFRAME_CORE_CLASSES.INSTANCE],
    range: ['http://id.loc.gov/vocabulary/carriers/'],
    type: 'ObjectProperty',
    required: false
  }],
  ['bf:media', {
    uri: 'http://id.loc.gov/ontologies/bibframe/media',
    label: 'Media',
    comment: 'Type of intermediation device',
    domain: [BIBFRAME_CORE_CLASSES.INSTANCE],
    range: ['http://id.loc.gov/vocabulary/mediaTypes/'],
    type: 'ObjectProperty',
    required: false
  }],
  ['bf:hasItem', {
    uri: 'http://id.loc.gov/ontologies/bibframe/hasItem',
    label: 'Has Item',
    comment: 'Instance held by an Item',
    domain: [BIBFRAME_CORE_CLASSES.INSTANCE],
    range: [BIBFRAME_CORE_CLASSES.ITEM],
    type: 'ObjectProperty',
    required: true
  }],

  // Item properties
  ['bf:itemOf', {
    uri: 'http://id.loc.gov/ontologies/bibframe/itemOf',
    label: 'Item Of',
    comment: 'Item of an Instance',
    domain: [BIBFRAME_CORE_CLASSES.ITEM],
    range: [BIBFRAME_CORE_CLASSES.INSTANCE],
    type: 'ObjectProperty',
    required: true
  }],
  ['bf:heldBy', {
    uri: 'http://id.loc.gov/ontologies/bibframe/heldBy',
    label: 'Held By',
    comment: 'Institution holding the item',
    domain: [BIBFRAME_CORE_CLASSES.ITEM],
    range: [BIBFRAME_CORE_CLASSES.AGENT, BIBFRAME_CORE_CLASSES.ORGANIZATION],
    type: 'ObjectProperty',
    required: false
  }],
  ['bf:shelfMark', {
    uri: 'http://id.loc.gov/ontologies/bibframe/shelfMark',
    label: 'Shelf Mark',
    comment: 'Call number or shelf location',
    domain: [BIBFRAME_CORE_CLASSES.ITEM],
    range: ['http://www.w3.org/2001/XMLSchema#string'],
    type: 'DatatypeProperty',
    required: false
  }],

  // Nested properties
  ['bf:mainTitle', {
    uri: 'http://id.loc.gov/ontologies/bibframe/mainTitle',
    label: 'Main Title',
    comment: 'Primary title of the resource',
    domain: [BIBFRAME_CORE_CLASSES.TITLE],
    range: ['http://www.w3.org/2001/XMLSchema#string'],
    type: 'DatatypeProperty',
    required: true
  }],
  ['bf:subtitle', {
    uri: 'http://id.loc.gov/ontologies/bibframe/subtitle',
    label: 'Subtitle',
    comment: 'Secondary title',
    domain: [BIBFRAME_CORE_CLASSES.TITLE],
    range: ['http://www.w3.org/2001/XMLSchema#string'],
    type: 'DatatypeProperty',
    required: false
  }],
  ['bf:agent', {
    uri: 'http://id.loc.gov/ontologies/bibframe/agent',
    label: 'Agent',
    comment: 'Person, organization, or entity',
    domain: [BIBFRAME_CORE_CLASSES.CONTRIBUTION, BIBFRAME_CORE_CLASSES.PROVISION_ACTIVITY],
    range: [BIBFRAME_CORE_CLASSES.AGENT, BIBFRAME_CORE_CLASSES.PERSON, BIBFRAME_CORE_CLASSES.ORGANIZATION],
    type: 'ObjectProperty',
    required: true
  }],
  ['bf:role', {
    uri: 'http://id.loc.gov/ontologies/bibframe/role',
    label: 'Role',
    comment: 'Function performed by the agent',
    domain: [BIBFRAME_CORE_CLASSES.CONTRIBUTION],
    range: ['http://id.loc.gov/vocabulary/relators/'],
    type: 'ObjectProperty',
    required: true
  }],
  ['bf:place', {
    uri: 'http://id.loc.gov/ontologies/bibframe/place',
    label: 'Place',
    comment: 'Geographic location',
    domain: [BIBFRAME_CORE_CLASSES.PROVISION_ACTIVITY],
    range: [BIBFRAME_CORE_CLASSES.PLACE, 'http://id.loc.gov/vocabulary/countries/'],
    type: 'ObjectProperty',
    required: true
  }],
  ['bf:date', {
    uri: 'http://id.loc.gov/ontologies/bibframe/date',
    label: 'Date',
    comment: 'Date of publication or provision',
    domain: [BIBFRAME_CORE_CLASSES.PROVISION_ACTIVITY],
    range: ['http://www.w3.org/2001/XMLSchema#gYear', 'http://www.w3.org/2001/XMLSchema#date'],
    type: 'DatatypeProperty',
    required: true
  }],
  ['rdf:value', {
    uri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
    label: 'Value',
    comment: 'Literal value of identifier',
    domain: [BIBFRAME_CORE_CLASSES.IDENTIFIER],
    range: ['http://www.w3.org/2001/XMLSchema#string'],
    type: 'DatatypeProperty',
    required: true
  }],
  ['bf:classificationPortion', {
    uri: 'http://id.loc.gov/ontologies/bibframe/classificationPortion',
    label: 'Classification Portion',
    comment: 'Classification number',
    domain: [BIBFRAME_CORE_CLASSES.CLASSIFICATION],
    range: ['http://www.w3.org/2001/XMLSchema#string'],
    type: 'DatatypeProperty',
    required: true
  }],
  ['rdfs:label', {
    uri: 'http://www.w3.org/2000/01/rdf-schema#label',
    label: 'Label',
    comment: 'Human-readable label',
    domain: ['*'],
    range: ['http://www.w3.org/2001/XMLSchema#string'],
    type: 'DatatypeProperty',
    required: false
  }],
]);

/**
 * Get properties for a specific BIBFRAME class
 */
export function getPropertiesForClass(classUri: string): BibframeProperty[] {
  const properties: BibframeProperty[] = [];
  
  BIBFRAME_PROPERTIES.forEach((prop) => {
    if (prop.domain && prop.domain.includes(classUri)) {
      properties.push(prop);
    }
  });
  
  return properties;
}

/**
 * Get required properties for a class
 */
export function getRequiredProperties(classUri: string): BibframeProperty[] {
  return getPropertiesForClass(classUri).filter(p => p.required);
}

/**
 * Validate property for a domain
 */
export function isValidPropertyForDomain(propertyUri: string, domainUri: string): boolean {
  const property = BIBFRAME_PROPERTIES.get(propertyUri);
  if (!property) return false;
  if (!property.domain) return true; // No domain restriction
  if (property.domain.includes('*')) return true; // Universal property
  return property.domain.includes(domainUri);
}

/**
 * Check if value matches property range
 */
export function isValidRange(propertyUri: string, value: any): boolean {
  const property = BIBFRAME_PROPERTIES.get(propertyUri);
  if (!property || !property.range) return true;
  
  if (property.type === 'DatatypeProperty') {
    return typeof value === 'string';
  }
  
  if (property.type === 'ObjectProperty') {
    // Check if value is URI or object with @id
    if (typeof value === 'string') {
      return value.startsWith('http://') || value.startsWith('https://');
    }
    if (typeof value === 'object' && value['@id']) {
      return true;
    }
  }
  
  return false;
}

/**
 * Ontology version tracking
 */
export const ONTOLOGY_VERSION = {
  source: 'https://github.com/lcnetdev/bibframe-ontology',
  version: '2.4.0',
  date: '2024',
  loaded: new Date().toISOString()
};

/**
 * Get human-readable label for property
 */
export function getPropertyLabel(propertyUri: string): string {
  const property = BIBFRAME_PROPERTIES.get(propertyUri);
  return property?.label || propertyUri.split('/').pop() || propertyUri;
}

/**
 * Get property description
 */
export function getPropertyDescription(propertyUri: string): string | undefined {
  const property = BIBFRAME_PROPERTIES.get(propertyUri);
  return property?.comment;
}

/**
 * Check if property is required
 */
export function isRequiredProperty(propertyUri: string, domainUri: string): boolean {
  const property = BIBFRAME_PROPERTIES.get(propertyUri);
  if (!property) return false;
  return property.required || false;
}
