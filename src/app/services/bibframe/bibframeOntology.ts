/**
 * BIBFRAME Ontology Service
 * Official Library of Congress BIBFRAME 2.0 Ontology Integration
 * Source: https://github.com/lcnetdev/bibframe-ontology
 * 
 * This service provides the complete BIBFRAME ontology as the core reference
 * for all cataloging operations in the Moon system.
 */

export interface BibframeClass {
  id: string;
  uri: string;
  label: string;
  definition: string;
  subClassOf?: string[];
  properties?: string[];
  examples?: string[];
  marcMapping?: string[];
}

export interface BibframeProperty {
  id: string;
  uri: string;
  label: string;
  definition: string;
  domain?: string[];
  range?: string[];
  subPropertyOf?: string[];
  inverseOf?: string;
  marcMapping?: string[];
  examples?: string[];
  repeatable?: boolean;
  required?: boolean;
}

export interface BibframeOntology {
  classes: Map<string, BibframeClass>;
  properties: Map<string, BibframeProperty>;
  version: string;
  baseUri: string;
}

/**
 * BIBFRAME 2.0 Core Classes
 * From: http://id.loc.gov/ontologies/bibframe/
 */
export const BIBFRAME_CLASSES: { [key: string]: BibframeClass } = {
  // Core Resource Classes
  'bf:Work': {
    id: 'bf:Work',
    uri: 'http://id.loc.gov/ontologies/bibframe/Work',
    label: 'Work',
    definition: 'Resource reflecting a conceptual essence of the cataloging resource.',
    properties: [
      'bf:title', 'bf:classification', 'bf:subject', 'bf:contribution',
      'bf:language', 'bf:content', 'bf:genreForm', 'bf:geographicCoverage',
      'bf:temporalCoverage', 'bf:summary', 'bf:tableOfContents', 'bf:note',
      'bf:intendedAudience', 'bf:originDate', 'bf:originPlace', 'bf:hasInstance'
    ],
    examples: ['Book (conceptual)', 'Map (conceptual)', 'Audio recording (conceptual)']
  },
  'bf:Instance': {
    id: 'bf:Instance',
    uri: 'http://id.loc.gov/ontologies/bibframe/Instance',
    label: 'Instance',
    definition: 'Resource reflecting an individual, material embodiment of a Work.',
    properties: [
      'bf:title', 'bf:responsibilityStatement', 'bf:editionStatement',
      'bf:provisionActivity', 'bf:identifiedBy', 'bf:extent', 'bf:dimensions',
      'bf:issuance', 'bf:media', 'bf:carrier', 'bf:instanceOf', 'bf:hasItem'
    ],
    examples: ['2024 Oxford University Press edition', 'First printing 1998']
  },
  'bf:Item': {
    id: 'bf:Item',
    uri: 'http://id.loc.gov/ontologies/bibframe/Item',
    label: 'Item',
    definition: 'Resource reflecting an actual, individual, concrete exemplar of an Instance.',
    properties: [
      'bf:heldBy', 'bf:shelfMark', 'bf:barcode', 'bf:itemOf',
      'bf:electronicLocator', 'bf:status', 'bf:custodialHistory'
    ],
    examples: ['Copy 1 at Main Library', 'Barcode 31234567890123']
  },

  // Work Types
  'bf:Text': {
    id: 'bf:Text',
    uri: 'http://id.loc.gov/ontologies/bibframe/Text',
    label: 'Text',
    definition: 'Work that is expressed in a form of notation for language.',
    subClassOf: ['bf:Work'],
    marcMapping: ['LDR/06=a,t']
  },
  'bf:Cartography': {
    id: 'bf:Cartography',
    uri: 'http://id.loc.gov/ontologies/bibframe/Cartography',
    label: 'Cartography',
    definition: 'Work that is a map, atlas, globe, or other cartographic resource.',
    subClassOf: ['bf:Work'],
    marcMapping: ['LDR/06=e,f']
  },
  'bf:Audio': {
    id: 'bf:Audio',
    uri: 'http://id.loc.gov/ontologies/bibframe/Audio',
    label: 'Audio',
    definition: 'Work that is intended to be perceived as sound.',
    subClassOf: ['bf:Work'],
    marcMapping: ['LDR/06=i,j']
  },
  'bf:NotatedMusic': {
    id: 'bf:NotatedMusic',
    uri: 'http://id.loc.gov/ontologies/bibframe/NotatedMusic',
    label: 'Notated Music',
    definition: 'Work that is music in notated form.',
    subClassOf: ['bf:Work'],
    marcMapping: ['LDR/06=c,d']
  },
  'bf:StillImage': {
    id: 'bf:StillImage',
    uri: 'http://id.loc.gov/ontologies/bibframe/StillImage',
    label: 'Still Image',
    definition: 'Work that is a still image or images.',
    subClassOf: ['bf:Work'],
    marcMapping: ['LDR/06=k']
  },
  'bf:MovingImage': {
    id: 'bf:MovingImage',
    uri: 'http://id.loc.gov/ontologies/bibframe/MovingImage',
    label: 'Moving Image',
    definition: 'Work that is a moving image.',
    subClassOf: ['bf:Work'],
    marcMapping: ['LDR/06=g']
  },
  'bf:Dataset': {
    id: 'bf:Dataset',
    uri: 'http://id.loc.gov/ontologies/bibframe/Dataset',
    label: 'Dataset',
    definition: 'Work that is a dataset.',
    subClassOf: ['bf:Work'],
    marcMapping: ['LDR/06=m']
  },
  'bf:Object': {
    id: 'bf:Object',
    uri: 'http://id.loc.gov/ontologies/bibframe/Object',
    label: 'Object',
    definition: 'Work that is a three-dimensional artifact or naturally occurring object.',
    subClassOf: ['bf:Work'],
    marcMapping: ['LDR/06=r']
  },
  'bf:Multimedia': {
    id: 'bf:Multimedia',
    uri: 'http://id.loc.gov/ontologies/bibframe/Multimedia',
    label: 'Multimedia',
    definition: 'Work that is a combination of two or more media types.',
    subClassOf: ['bf:Work'],
    marcMapping: ['LDR/06=m,p']
  },
  'bf:MixedMaterial': {
    id: 'bf:MixedMaterial',
    uri: 'http://id.loc.gov/ontologies/bibframe/MixedMaterial',
    label: 'Mixed Material',
    definition: 'Work that is a combination of materials in various forms.',
    subClassOf: ['bf:Work'],
    marcMapping: ['LDR/06=p']
  },
};

/**
 * BIBFRAME 2.0 Properties
 * Complete property set from the official ontology
 */
export const BIBFRAME_PROPERTIES: { [key: string]: BibframeProperty } = {
  // Title Properties
  'bf:title': {
    id: 'bf:title',
    uri: 'http://id.loc.gov/ontologies/bibframe/title',
    label: 'Title',
    definition: 'Name given to a resource.',
    domain: ['bf:Work', 'bf:Instance'],
    range: ['bf:Title'],
    marcMapping: ['245', '246', '130', '240', '242', '243', '247'],
    repeatable: true,
    required: true
  },
  'bf:mainTitle': {
    id: 'bf:mainTitle',
    uri: 'http://id.loc.gov/ontologies/bibframe/mainTitle',
    label: 'Main Title',
    definition: 'Primary title of a resource.',
    domain: ['bf:Title'],
    range: ['rdfs:Literal'],
    marcMapping: ['245$a', '130$a', '240$a'],
    repeatable: false,
    required: true
  },
  'bf:subtitle': {
    id: 'bf:subtitle',
    uri: 'http://id.loc.gov/ontologies/bibframe/subtitle',
    label: 'Subtitle',
    definition: 'Word, character, or group of words or characters that contains the remainder of the title information after the main title.',
    domain: ['bf:Title'],
    range: ['rdfs:Literal'],
    marcMapping: ['245$b'],
    repeatable: false
  },
  'bf:partName': {
    id: 'bf:partName',
    uri: 'http://id.loc.gov/ontologies/bibframe/partName',
    label: 'Part Name',
    definition: 'Name designation of a part/section of a work.',
    domain: ['bf:Title'],
    range: ['rdfs:Literal'],
    marcMapping: ['245$p'],
    repeatable: false
  },
  'bf:partNumber': {
    id: 'bf:partNumber',
    uri: 'http://id.loc.gov/ontologies/bibframe/partNumber',
    label: 'Part Number',
    definition: 'Number designation of a part/section of a work.',
    domain: ['bf:Title'],
    range: ['rdfs:Literal'],
    marcMapping: ['245$n'],
    repeatable: false
  },

  // Classification Properties
  'bf:classification': {
    id: 'bf:classification',
    uri: 'http://id.loc.gov/ontologies/bibframe/classification',
    label: 'Classification',
    definition: 'Designation assigned to a resource that indicates the subject by applying a formal system of coding and organizing resources.',
    domain: ['bf:Work'],
    range: ['bf:Classification'],
    marcMapping: ['050', '082', '080', '060', '090'],
    repeatable: true
  },
  'bf:classificationPortion': {
    id: 'bf:classificationPortion',
    uri: 'http://id.loc.gov/ontologies/bibframe/classificationPortion',
    label: 'Classification Portion',
    definition: 'Classification number portion of a classification number-item number combination.',
    domain: ['bf:Classification'],
    range: ['rdfs:Literal'],
    marcMapping: ['050$a', '082$a'],
    repeatable: false
  },
  'bf:itemPortion': {
    id: 'bf:itemPortion',
    uri: 'http://id.loc.gov/ontologies/bibframe/itemPortion',
    label: 'Item Portion',
    definition: 'Item number portion of a classification-item number combination (cutter number).',
    domain: ['bf:Classification'],
    range: ['rdfs:Literal'],
    marcMapping: ['050$b', '082$b'],
    repeatable: false
  },

  // Subject Properties
  'bf:subject': {
    id: 'bf:subject',
    uri: 'http://id.loc.gov/ontologies/bibframe/subject',
    label: 'Subject',
    definition: 'Index term, subject term, subject code, or subject heading applied to describe what a resource is about.',
    domain: ['bf:Work'],
    range: ['bf:Topic', 'bf:Place', 'bf:Person', 'bf:Organization', 'bf:GenreForm'],
    marcMapping: ['600', '610', '611', '630', '648', '650', '651', '653', '654', '655', '656', '657'],
    repeatable: true
  },
  'bf:geographicCoverage': {
    id: 'bf:geographicCoverage',
    uri: 'http://id.loc.gov/ontologies/bibframe/geographicCoverage',
    label: 'Geographic Coverage',
    definition: 'Geographic coverage of the content of the resource.',
    domain: ['bf:Work'],
    range: ['bf:GeographicCoverage'],
    marcMapping: ['043', '052'],
    repeatable: true
  },
  'bf:temporalCoverage': {
    id: 'bf:temporalCoverage',
    uri: 'http://id.loc.gov/ontologies/bibframe/temporalCoverage',
    label: 'Temporal Coverage',
    definition: 'Temporal coverage of the content of the resource.',
    domain: ['bf:Work'],
    range: ['bf:Temporal'],
    marcMapping: ['045', '648'],
    repeatable: true
  },
  'bf:genreForm': {
    id: 'bf:genreForm',
    uri: 'http://id.loc.gov/ontologies/bibframe/genreForm',
    label: 'Genre/Form',
    definition: 'Form category or genre to which a resource belongs.',
    domain: ['bf:Work'],
    range: ['bf:GenreForm'],
    marcMapping: ['655'],
    repeatable: true
  },

  // Contribution Properties
  'bf:contribution': {
    id: 'bf:contribution',
    uri: 'http://id.loc.gov/ontologies/bibframe/contribution',
    label: 'Contribution',
    definition: 'Agent and role with respect to the resource being described.',
    domain: ['bf:Work', 'bf:Instance'],
    range: ['bf:Contribution'],
    marcMapping: ['100', '110', '111', '700', '710', '711'],
    repeatable: true
  },
  'bf:agent': {
    id: 'bf:agent',
    uri: 'http://id.loc.gov/ontologies/bibframe/agent',
    label: 'Agent',
    definition: 'Entity associated with a resource or element of description.',
    domain: ['bf:Contribution'],
    range: ['bf:Agent', 'bf:Person', 'bf:Organization', 'bf:Family'],
    marcMapping: ['100$a', '110$a', '700$a', '710$a'],
    repeatable: false
  },
  'bf:role': {
    id: 'bf:role',
    uri: 'http://id.loc.gov/ontologies/bibframe/role',
    label: 'Role',
    definition: 'Function or part played by an agent with respect to a resource.',
    domain: ['bf:Contribution'],
    range: ['bf:Role'],
    marcMapping: ['100$e', '700$e', '110$e', '710$e'],
    repeatable: true
  },

  // Language Properties
  'bf:language': {
    id: 'bf:language',
    uri: 'http://id.loc.gov/ontologies/bibframe/language',
    label: 'Language',
    definition: 'Language associated with a resource or element of description.',
    domain: ['bf:Work'],
    range: ['bf:Language'],
    marcMapping: ['008/35-37', '041'],
    repeatable: true
  },

  // Content Properties
  'bf:content': {
    id: 'bf:content',
    uri: 'http://id.loc.gov/ontologies/bibframe/content',
    label: 'Content Type',
    definition: 'Categorization reflecting the fundamental form of communication and the human sense through which it is perceived.',
    domain: ['bf:Work'],
    range: ['bf:Content'],
    marcMapping: ['336'],
    repeatable: true
  },
  'bf:illustrativeContent': {
    id: 'bf:illustrativeContent',
    uri: 'http://id.loc.gov/ontologies/bibframe/illustrativeContent',
    label: 'Illustrative Content',
    definition: 'Indication of the type of illustrative content present in a resource.',
    domain: ['bf:Work'],
    range: ['bf:Illustration'],
    marcMapping: ['300$b', '008/18-21'],
    repeatable: true
  },
  'bf:colorContent': {
    id: 'bf:colorContent',
    uri: 'http://id.loc.gov/ontologies/bibframe/colorContent',
    label: 'Color Content',
    definition: 'Color characteristics of the content of a resource.',
    domain: ['bf:Work'],
    range: ['bf:ColorContent'],
    marcMapping: ['007/03'],
    repeatable: true
  },
  'bf:supplementaryContent': {
    id: 'bf:supplementaryContent',
    uri: 'http://id.loc.gov/ontologies/bibframe/supplementaryContent',
    label: 'Supplementary Content',
    definition: 'Supplementary content associated with a resource.',
    domain: ['bf:Work'],
    range: ['bf:SupplementaryContent'],
    marcMapping: ['504', '505'],
    repeatable: true
  },

  // Summary and Description
  'bf:summary': {
    id: 'bf:summary',
    uri: 'http://id.loc.gov/ontologies/bibframe/summary',
    label: 'Summary',
    definition: 'Description of the content of a resource, such as an abstract, summary, or table of contents.',
    domain: ['bf:Work'],
    range: ['bf:Summary'],
    marcMapping: ['520'],
    repeatable: true
  },
  'bf:tableOfContents': {
    id: 'bf:tableOfContents',
    uri: 'http://id.loc.gov/ontologies/bibframe/tableOfContents',
    label: 'Table of Contents',
    definition: 'Table of contents of the described resource.',
    domain: ['bf:Work'],
    range: ['bf:TableOfContents'],
    marcMapping: ['505'],
    repeatable: true
  },

  // Note Properties
  'bf:note': {
    id: 'bf:note',
    uri: 'http://id.loc.gov/ontologies/bibframe/note',
    label: 'Note',
    definition: 'Additional information associated with a resource.',
    domain: ['bf:Work', 'bf:Instance', 'bf:Item'],
    range: ['bf:Note'],
    marcMapping: ['500', '501', '502', '504', '508', '510', '511', '515', '518', '520', '521', '525', '533', '534', '546'],
    repeatable: true
  },

  // Audience Properties
  'bf:intendedAudience': {
    id: 'bf:intendedAudience',
    uri: 'http://id.loc.gov/ontologies/bibframe/intendedAudience',
    label: 'Intended Audience',
    definition: 'Class of persons for which a resource is intended or judged to be suitable.',
    domain: ['bf:Work'],
    range: ['bf:IntendedAudience'],
    marcMapping: ['521', '008/22'],
    repeatable: true
  },

  // Origin Properties
  'bf:originDate': {
    id: 'bf:originDate',
    uri: 'http://id.loc.gov/ontologies/bibframe/originDate',
    label: 'Origin Date',
    definition: 'Date or date range associated with the creation of a Work.',
    domain: ['bf:Work'],
    range: ['rdfs:Literal'],
    marcMapping: ['046', '008/07-14'],
    repeatable: false
  },
  'bf:originPlace': {
    id: 'bf:originPlace',
    uri: 'http://id.loc.gov/ontologies/bibframe/originPlace',
    label: 'Origin Place',
    definition: 'Place associated with the creation of a Work.',
    domain: ['bf:Work'],
    range: ['bf:Place'],
    marcMapping: ['008/15-17', '370'],
    repeatable: true
  },

  // Instance Properties
  'bf:responsibilityStatement': {
    id: 'bf:responsibilityStatement',
    uri: 'http://id.loc.gov/ontologies/bibframe/responsibilityStatement',
    label: 'Responsibility Statement',
    definition: 'Statement relating to any persons, families, or corporate bodies responsible for the creation of, or contributing to the content of a resource.',
    domain: ['bf:Instance'],
    range: ['rdfs:Literal'],
    marcMapping: ['245$c'],
    repeatable: false
  },
  'bf:editionStatement': {
    id: 'bf:editionStatement',
    uri: 'http://id.loc.gov/ontologies/bibframe/editionStatement',
    label: 'Edition Statement',
    definition: 'Information identifying the edition or version of a resource.',
    domain: ['bf:Instance'],
    range: ['rdfs:Literal'],
    marcMapping: ['250'],
    repeatable: false
  },
  'bf:seriesStatement': {
    id: 'bf:seriesStatement',
    uri: 'http://id.loc.gov/ontologies/bibframe/seriesStatement',
    label: 'Series Statement',
    definition: 'Statement of the series the resource is in.',
    domain: ['bf:Instance'],
    range: ['rdfs:Literal'],
    marcMapping: ['490', '800', '810', '830'],
    repeatable: true
  },
  'bf:provisionActivity': {
    id: 'bf:provisionActivity',
    uri: 'http://id.loc.gov/ontologies/bibframe/provisionActivity',
    label: 'Provision Activity',
    definition: 'Activity associated with the publication, printing, distribution, issue, release, or production of an Instance.',
    domain: ['bf:Instance'],
    range: ['bf:ProvisionActivity', 'bf:Publication', 'bf:Production', 'bf:Distribution', 'bf:Manufacture'],
    marcMapping: ['260', '264'],
    repeatable: true
  },
  'bf:identifiedBy': {
    id: 'bf:identifiedBy',
    uri: 'http://id.loc.gov/ontologies/bibframe/identifiedBy',
    label: 'Identified By',
    definition: 'Character string or number associated with a resource that serves to differentiate that resource from other resources.',
    domain: ['bf:Work', 'bf:Instance'],
    range: ['bf:Identifier', 'bf:Isbn', 'bf:Issn', 'bf:Lccn'],
    marcMapping: ['010', '020', '022', '024', '028'],
    repeatable: true
  },
  'bf:extent': {
    id: 'bf:extent',
    uri: 'http://id.loc.gov/ontologies/bibframe/extent',
    label: 'Extent',
    definition: 'Number and type of units and/or subunits making up a resource.',
    domain: ['bf:Instance'],
    range: ['bf:Extent'],
    marcMapping: ['300$a'],
    repeatable: true
  },
  'bf:dimensions': {
    id: 'bf:dimensions',
    uri: 'http://id.loc.gov/ontologies/bibframe/dimensions',
    label: 'Dimensions',
    definition: 'Measurements of the resource.',
    domain: ['bf:Instance'],
    range: ['rdfs:Literal'],
    marcMapping: ['300$c'],
    repeatable: false
  },
  'bf:issuance': {
    id: 'bf:issuance',
    uri: 'http://id.loc.gov/ontologies/bibframe/issuance',
    label: 'Issuance',
    definition: 'Categorization reflecting whether a resource is issued in one or more parts.',
    domain: ['bf:Instance'],
    range: ['bf:Issuance'],
    marcMapping: ['LDR/07'],
    repeatable: false
  },
  'bf:media': {
    id: 'bf:media',
    uri: 'http://id.loc.gov/ontologies/bibframe/media',
    label: 'Media Type',
    definition: 'Categorization reflecting the general type of intermediation device required to view, play, run, etc., the content of a resource.',
    domain: ['bf:Instance'],
    range: ['bf:Media'],
    marcMapping: ['337'],
    repeatable: true
  },
  'bf:carrier': {
    id: 'bf:carrier',
    uri: 'http://id.loc.gov/ontologies/bibframe/carrier',
    label: 'Carrier Type',
    definition: 'Categorization reflecting the format of the storage medium and housing of a carrier.',
    domain: ['bf:Instance'],
    range: ['bf:Carrier'],
    marcMapping: ['338'],
    repeatable: true
  },

  // Item Properties
  'bf:heldBy': {
    id: 'bf:heldBy',
    uri: 'http://id.loc.gov/ontologies/bibframe/heldBy',
    label: 'Held By',
    definition: 'Agent holding the item or from which it is available.',
    domain: ['bf:Item'],
    range: ['bf:Agent', 'bf:Organization'],
    marcMapping: ['852$a'],
    repeatable: false
  },
  'bf:shelfMark': {
    id: 'bf:shelfMark',
    uri: 'http://id.loc.gov/ontologies/bibframe/shelfMark',
    label: 'Shelf Mark',
    definition: 'Piece identifier, such as a call or other type of number.',
    domain: ['bf:Item'],
    range: ['bf:ShelfMark'],
    marcMapping: ['852$h', '852$i'],
    repeatable: true
  },
  'bf:barcode': {
    id: 'bf:barcode',
    uri: 'http://id.loc.gov/ontologies/bibframe/barcode',
    label: 'Barcode',
    definition: 'Barcode associated with an item.',
    domain: ['bf:Item'],
    range: ['rdfs:Literal'],
    marcMapping: ['876$p'],
    repeatable: false
  },
  'bf:electronicLocator': {
    id: 'bf:electronicLocator',
    uri: 'http://id.loc.gov/ontologies/bibframe/electronicLocator',
    label: 'Electronic Locator',
    definition: 'Electronic location from which the resource is available.',
    domain: ['bf:Item', 'bf:Instance'],
    range: ['rdfs:Resource'],
    marcMapping: ['856'],
    repeatable: true
  },
  'bf:status': {
    id: 'bf:status',
    uri: 'http://id.loc.gov/ontologies/bibframe/status',
    label: 'Status',
    definition: 'Designation of the status of a resource.',
    domain: ['bf:Item'],
    range: ['bf:Status'],
    marcMapping: ['583'],
    repeatable: true
  },

  // Relationship Properties
  'bf:hasInstance': {
    id: 'bf:hasInstance',
    uri: 'http://id.loc.gov/ontologies/bibframe/hasInstance',
    label: 'Has Instance',
    definition: 'Work expressed in an Instance.',
    domain: ['bf:Work'],
    range: ['bf:Instance'],
    inverseOf: 'bf:instanceOf',
    repeatable: true
  },
  'bf:instanceOf': {
    id: 'bf:instanceOf',
    uri: 'http://id.loc.gov/ontologies/bibframe/instanceOf',
    label: 'Instance Of',
    definition: 'Work the resource instantiates or manifests.',
    domain: ['bf:Instance'],
    range: ['bf:Work'],
    inverseOf: 'bf:hasInstance',
    repeatable: false,
    required: true
  },
  'bf:hasItem': {
    id: 'bf:hasItem',
    uri: 'http://id.loc.gov/ontologies/bibframe/hasItem',
    label: 'Has Item',
    definition: 'Instance for which the described Item is an example.',
    domain: ['bf:Instance'],
    range: ['bf:Item'],
    inverseOf: 'bf:itemOf',
    repeatable: true
  },
  'bf:itemOf': {
    id: 'bf:itemOf',
    uri: 'http://id.loc.gov/ontologies/bibframe/itemOf',
    label: 'Item Of',
    definition: 'Instance for which the described Item is an example.',
    domain: ['bf:Item'],
    range: ['bf:Instance'],
    inverseOf: 'bf:hasItem',
    repeatable: false,
    required: true
  },
};

/**
 * Get property by ID
 */
export function getProperty(propertyId: string): BibframeProperty | undefined {
  return BIBFRAME_PROPERTIES[propertyId];
}

/**
 * Get class by ID
 */
export function getClass(classId: string): BibframeClass | undefined {
  return BIBFRAME_CLASSES[classId];
}

/**
 * Get all properties for a class
 */
export function getPropertiesForClass(classId: string): BibframeProperty[] {
  const bibClass = BIBFRAME_CLASSES[classId];
  if (!bibClass || !bibClass.properties) return [];
  
  return bibClass.properties
    .map(propId => BIBFRAME_PROPERTIES[propId])
    .filter(prop => prop !== undefined);
}

/**
 * Get MARC mapping for a property
 */
export function getMarcMapping(propertyId: string): string[] {
  const property = BIBFRAME_PROPERTIES[propertyId];
  return property?.marcMapping || [];
}

/**
 * Search properties by label or definition
 */
export function searchProperties(query: string): BibframeProperty[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(BIBFRAME_PROPERTIES).filter(prop =>
    prop.label.toLowerCase().includes(lowerQuery) ||
    prop.definition.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Validate that a value is appropriate for a property
 */
export function validatePropertyValue(
  propertyId: string,
  value: any,
  context: { domain?: string }
): { valid: boolean; errors: string[] } {
  const property = BIBFRAME_PROPERTIES[propertyId];
  if (!property) {
    return { valid: false, errors: [`Unknown property: ${propertyId}`] };
  }

  const errors: string[] = [];

  // Check domain
  if (property.domain && context.domain) {
    if (!property.domain.includes(context.domain)) {
      errors.push(`Property ${propertyId} not valid for ${context.domain}`);
    }
  }

  // Check required
  if (property.required && !value) {
    errors.push(`Property ${propertyId} is required`);
  }

  // Check repeatable
  if (!property.repeatable && Array.isArray(value) && value.length > 1) {
    errors.push(`Property ${propertyId} is not repeatable`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get ontology version info
 */
export function getOntologyInfo() {
  return {
    version: '2.0.0',
    baseUri: 'http://id.loc.gov/ontologies/bibframe/',
    source: 'https://github.com/lcnetdev/bibframe-ontology',
    classCount: Object.keys(BIBFRAME_CLASSES).length,
    propertyCount: Object.keys(BIBFRAME_PROPERTIES).length,
    lastUpdated: '2024'
  };
}
