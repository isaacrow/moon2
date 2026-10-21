/**
 * BIBFRAME Field Mapper
 * Maps UI fields to official BIBFRAME ontology properties
 * Ensures all cataloging is compliant with LC BIBFRAME specification
 */

import { BIBFRAME_PROPERTIES, BIBFRAME_CLASSES, BibframeProperty } from './bibframeOntology';

export interface FieldMapping {
  fieldId: string;
  fieldLabel: string;
  bibframeProperty: string;
  bibframeClass: string;
  marcField?: string[];
  required?: boolean;
  repeatable?: boolean;
  valueType?: 'string' | 'uri' | 'object' | 'literal';
  controlledVocabulary?: string;
  locApiEndpoint?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    allowedValues?: string[];
  };
  helpText?: string;
}

/**
 * Complete field mapping for Comprehensive Monograph Template
 * Every field is linked to the official BIBFRAME ontology
 */
export const FIELD_MAPPINGS: { [key: string]: FieldMapping } = {
  // ========== WORK ENTITY FIELDS ==========
  
  // Resource Type
  'work.resourceType': {
    fieldId: 'work.resourceType',
    fieldLabel: 'Resource Type',
    bibframeProperty: 'rdf:type',
    bibframeClass: 'bf:Work',
    marcField: ['LDR/06'],
    required: true,
    repeatable: false,
    valueType: 'uri',
    validation: {
      allowedValues: [
        'bf:Text', 'bf:Cartography', 'bf:Audio', 'bf:NotatedMusic',
        'bf:StillImage', 'bf:MovingImage', 'bf:Dataset', 'bf:Object',
        'bf:Multimedia', 'bf:MixedMaterial'
      ]
    },
    helpText: 'LDR/06 • rdf:type • Fundamental form of the Work'
  },

  // Title
  'work.title.mainTitle': {
    fieldId: 'work.title.mainTitle',
    fieldLabel: 'Main Title',
    bibframeProperty: 'bf:mainTitle',
    bibframeClass: 'bf:Title',
    marcField: ['130$a', '240$a'],
    required: true,
    repeatable: false,
    valueType: 'literal',
    helpText: '130/240$a • bf:mainTitle • Preferred title of the Work'
  },
  'work.title.subtitle': {
    fieldId: 'work.title.subtitle',
    fieldLabel: 'Subtitle',
    bibframeProperty: 'bf:subtitle',
    bibframeClass: 'bf:Title',
    marcField: ['130$k', '240$k'],
    repeatable: false,
    valueType: 'literal',
    helpText: '130/240$k • bf:subtitle • Subtitle of the Work'
  },
  'work.title.partNumber': {
    fieldId: 'work.title.partNumber',
    fieldLabel: 'Part Number',
    bibframeProperty: 'bf:partNumber',
    bibframeClass: 'bf:Title',
    marcField: ['130$n', '240$n'],
    repeatable: false,
    valueType: 'literal',
    helpText: '130/240$n • bf:partNumber • Part number designation'
  },
  'work.title.partName': {
    fieldId: 'work.title.partName',
    fieldLabel: 'Part Name',
    bibframeProperty: 'bf:partName',
    bibframeClass: 'bf:Title',
    marcField: ['130$p', '240$p'],
    repeatable: false,
    valueType: 'literal',
    helpText: '130/240$p • bf:partName • Part name designation'
  },

  // Classification - LCC
  'work.classification.lcc.classNumber': {
    fieldId: 'work.classification.lcc.classNumber',
    fieldLabel: 'LCC Class Number',
    bibframeProperty: 'bf:classificationPortion',
    bibframeClass: 'bf:ClassificationLcc',
    marcField: ['050$a'],
    repeatable: false,
    valueType: 'literal',
    helpText: '050$a • bf:classificationPortion • Library of Congress Classification number'
  },
  'work.classification.lcc.cutterNumber': {
    fieldId: 'work.classification.lcc.cutterNumber',
    fieldLabel: 'LCC Cutter Number',
    bibframeProperty: 'bf:itemPortion',
    bibframeClass: 'bf:ClassificationLcc',
    marcField: ['050$b'],
    repeatable: false,
    valueType: 'literal',
    helpText: '050$b • bf:itemPortion • Cutter number portion'
  },

  // Classification - DDC
  'work.classification.ddc.classNumber': {
    fieldId: 'work.classification.ddc.classNumber',
    fieldLabel: 'DDC Number',
    bibframeProperty: 'bf:classificationPortion',
    bibframeClass: 'bf:ClassificationDdc',
    marcField: ['082$a'],
    repeatable: false,
    valueType: 'literal',
    helpText: '082$a • bf:classificationPortion • Dewey Decimal Classification number'
  },
  'work.classification.ddc.edition': {
    fieldId: 'work.classification.ddc.edition',
    fieldLabel: 'DDC Edition',
    bibframeProperty: 'bf:edition',
    bibframeClass: 'bf:ClassificationDdc',
    marcField: ['082$2'],
    repeatable: false,
    valueType: 'literal',
    helpText: '082$2 • bf:edition • Edition of DDC used'
  },

  // Classification - UDC
  'work.classification.udc.classNumber': {
    fieldId: 'work.classification.udc.classNumber',
    fieldLabel: 'UDC Number',
    bibframeProperty: 'bf:classificationPortion',
    bibframeClass: 'bf:ClassificationUdc',
    marcField: ['080$a'],
    repeatable: false,
    valueType: 'literal',
    helpText: '080$a • bf:classificationPortion • Universal Decimal Classification number'
  },

  // Classification - NLM
  'work.classification.nlm.classNumber': {
    fieldId: 'work.classification.nlm.classNumber',
    fieldLabel: 'NLM Number',
    bibframeProperty: 'bf:classificationPortion',
    bibframeClass: 'bf:ClassificationNlm',
    marcField: ['060$a'],
    repeatable: false,
    valueType: 'literal',
    helpText: '060$a • bf:classificationPortion • National Library of Medicine classification'
  },

  // Subject - Topical
  'work.subject.topical': {
    fieldId: 'work.subject.topical',
    fieldLabel: 'Topical Subject',
    bibframeProperty: 'bf:subject',
    bibframeClass: 'bf:Topic',
    marcField: ['650'],
    repeatable: true,
    valueType: 'uri',
    controlledVocabulary: 'LCSH',
    locApiEndpoint: 'http://id.loc.gov/authorities/subjects',
    helpText: '650 • bf:subject • Topical subject heading from LCSH'
  },

  // Subject - Geographic
  'work.subject.geographic': {
    fieldId: 'work.subject.geographic',
    fieldLabel: 'Geographic Subject',
    bibframeProperty: 'bf:subject',
    bibframeClass: 'bf:Place',
    marcField: ['651'],
    repeatable: true,
    valueType: 'uri',
    controlledVocabulary: 'LCSH',
    locApiEndpoint: 'http://id.loc.gov/authorities/subjects',
    helpText: '651 • bf:subject • Geographic subject heading'
  },

  // Subject - Personal Name
  'work.subject.personalName': {
    fieldId: 'work.subject.personalName',
    fieldLabel: 'Personal Name Subject',
    bibframeProperty: 'bf:subject',
    bibframeClass: 'bf:Person',
    marcField: ['600'],
    repeatable: true,
    valueType: 'uri',
    controlledVocabulary: 'LCNAF',
    locApiEndpoint: 'http://id.loc.gov/authorities/names',
    helpText: '600 • bf:subject • Personal name as subject'
  },

  // Subject - Corporate Name
  'work.subject.corporateName': {
    fieldId: 'work.subject.corporateName',
    fieldLabel: 'Corporate Name Subject',
    bibframeProperty: 'bf:subject',
    bibframeClass: 'bf:Organization',
    marcField: ['610'],
    repeatable: true,
    valueType: 'uri',
    controlledVocabulary: 'LCNAF',
    locApiEndpoint: 'http://id.loc.gov/authorities/names',
    helpText: '610 • bf:subject • Corporate name as subject'
  },

  // Genre/Form
  'work.genreForm': {
    fieldId: 'work.genreForm',
    fieldLabel: 'Genre/Form',
    bibframeProperty: 'bf:genreForm',
    bibframeClass: 'bf:GenreForm',
    marcField: ['655'],
    repeatable: true,
    valueType: 'uri',
    controlledVocabulary: 'LCGFT',
    locApiEndpoint: 'http://id.loc.gov/authorities/genreForms',
    helpText: '655 • bf:genreForm • Genre or form term from LCGFT'
  },

  // Geographic Coverage
  'work.geographicCoverage': {
    fieldId: 'work.geographicCoverage',
    fieldLabel: 'Geographic Coverage',
    bibframeProperty: 'bf:geographicCoverage',
    bibframeClass: 'bf:GeographicCoverage',
    marcField: ['043'],
    repeatable: true,
    valueType: 'uri',
    controlledVocabulary: 'GAC',
    locApiEndpoint: 'http://id.loc.gov/vocabulary/geographicAreas',
    helpText: '043 • bf:geographicCoverage • Geographic area code'
  },

  // Temporal Coverage
  'work.temporalCoverage': {
    fieldId: 'work.temporalCoverage',
    fieldLabel: 'Temporal Coverage',
    bibframeProperty: 'bf:temporalCoverage',
    bibframeClass: 'bf:Temporal',
    marcField: ['648'],
    repeatable: true,
    valueType: 'uri',
    helpText: '648 • bf:temporalCoverage • Chronological subject heading'
  },

  // Contributors
  'work.contribution.agent': {
    fieldId: 'work.contribution.agent',
    fieldLabel: 'Contributor',
    bibframeProperty: 'bf:agent',
    bibframeClass: 'bf:Contribution',
    marcField: ['100$a', '700$a'],
    repeatable: true,
    valueType: 'uri',
    controlledVocabulary: 'LCNAF',
    locApiEndpoint: 'http://id.loc.gov/authorities/names',
    helpText: '100/700$a • bf:agent • Contributor to the Work'
  },
  'work.contribution.role': {
    fieldId: 'work.contribution.role',
    fieldLabel: 'Role',
    bibframeProperty: 'bf:role',
    bibframeClass: 'bf:Contribution',
    marcField: ['100$e', '700$e'],
    repeatable: true,
    valueType: 'uri',
    controlledVocabulary: 'relators',
    locApiEndpoint: 'http://id.loc.gov/vocabulary/relators',
    helpText: '100/700$e • bf:role • Role of the contributor'
  },

  // Language
  'work.language': {
    fieldId: 'work.language',
    fieldLabel: 'Language',
    bibframeProperty: 'bf:language',
    bibframeClass: 'bf:Language',
    marcField: ['008/35-37', '041'],
    repeatable: true,
    valueType: 'uri',
    controlledVocabulary: 'ISO 639-2',
    locApiEndpoint: 'http://id.loc.gov/vocabulary/languages',
    helpText: '008/35-37, 041 • bf:language • Language of content'
  },

  // Content Type
  'work.content': {
    fieldId: 'work.content',
    fieldLabel: 'Content Type',
    bibframeProperty: 'bf:content',
    bibframeClass: 'bf:Content',
    marcField: ['336'],
    repeatable: true,
    valueType: 'uri',
    controlledVocabulary: 'RDA Content Types',
    locApiEndpoint: 'http://id.loc.gov/vocabulary/contentTypes',
    helpText: '336 • bf:content • RDA Content Type'
  },

  // Illustrative Content
  'work.illustrativeContent': {
    fieldId: 'work.illustrativeContent',
    fieldLabel: 'Illustrative Content',
    bibframeProperty: 'bf:illustrativeContent',
    bibframeClass: 'bf:Illustration',
    marcField: ['300$b'],
    repeatable: true,
    valueType: 'uri',
    helpText: '300$b • bf:illustrativeContent • Type of illustrations'
  },

  // Color Content
  'work.colorContent': {
    fieldId: 'work.colorContent',
    fieldLabel: 'Color Content',
    bibframeProperty: 'bf:colorContent',
    bibframeClass: 'bf:ColorContent',
    marcField: ['007/03'],
    repeatable: true,
    valueType: 'uri',
    helpText: '007/03 • bf:colorContent • Color characteristics'
  },

  // Summary
  'work.summary': {
    fieldId: 'work.summary',
    fieldLabel: 'Summary',
    bibframeProperty: 'bf:summary',
    bibframeClass: 'bf:Summary',
    marcField: ['520'],
    repeatable: true,
    valueType: 'literal',
    helpText: '520 • bf:summary • Abstract or summary'
  },

  // Table of Contents
  'work.tableOfContents': {
    fieldId: 'work.tableOfContents',
    fieldLabel: 'Table of Contents',
    bibframeProperty: 'bf:tableOfContents',
    bibframeClass: 'bf:TableOfContents',
    marcField: ['505'],
    repeatable: true,
    valueType: 'literal',
    helpText: '505 • bf:tableOfContents • Contents note'
  },

  // Intended Audience
  'work.intendedAudience': {
    fieldId: 'work.intendedAudience',
    fieldLabel: 'Intended Audience',
    bibframeProperty: 'bf:intendedAudience',
    bibframeClass: 'bf:IntendedAudience',
    marcField: ['521'],
    repeatable: true,
    valueType: 'uri',
    helpText: '521 • bf:intendedAudience • Target audience'
  },

  // Origin Date
  'work.originDate': {
    fieldId: 'work.originDate',
    fieldLabel: 'Origin Date',
    bibframeProperty: 'bf:originDate',
    bibframeClass: 'bf:Work',
    marcField: ['046', '008/07-14'],
    repeatable: false,
    valueType: 'literal',
    helpText: '046, 008/07-14 • bf:originDate • Date of creation'
  },

  // Origin Place
  'work.originPlace': {
    fieldId: 'work.originPlace',
    fieldLabel: 'Origin Place',
    bibframeProperty: 'bf:originPlace',
    bibframeClass: 'bf:Place',
    marcField: ['008/15-17', '370'],
    repeatable: true,
    valueType: 'uri',
    helpText: '008/15-17, 370 • bf:originPlace • Place of creation'
  },

  // Note
  'work.note': {
    fieldId: 'work.note',
    fieldLabel: 'Note',
    bibframeProperty: 'bf:note',
    bibframeClass: 'bf:Note',
    marcField: ['500', '502', '504', '508', '511', '518', '520', '521'],
    repeatable: true,
    valueType: 'literal',
    helpText: '5XX • bf:note • General note'
  },

  // ========== INSTANCE ENTITY FIELDS ==========

  // Instance Title
  'instance.title.mainTitle': {
    fieldId: 'instance.title.mainTitle',
    fieldLabel: 'Title Proper',
    bibframeProperty: 'bf:mainTitle',
    bibframeClass: 'bf:Title',
    marcField: ['245$a'],
    required: true,
    repeatable: false,
    valueType: 'literal',
    helpText: '245$a • bf:mainTitle • Title as it appears on the resource'
  },
  'instance.title.subtitle': {
    fieldId: 'instance.title.subtitle',
    fieldLabel: 'Subtitle',
    bibframeProperty: 'bf:subtitle',
    bibframeClass: 'bf:Title',
    marcField: ['245$b'],
    repeatable: false,
    valueType: 'literal',
    helpText: '245$b • bf:subtitle • Subtitle'
  },
  'instance.title.partNumber': {
    fieldId: 'instance.title.partNumber',
    fieldLabel: 'Part Number',
    bibframeProperty: 'bf:partNumber',
    bibframeClass: 'bf:Title',
    marcField: ['245$n'],
    repeatable: false,
    valueType: 'literal',
    helpText: '245$n • bf:partNumber • Number of part/section'
  },
  'instance.title.partName': {
    fieldId: 'instance.title.partName',
    fieldLabel: 'Part Name',
    bibframeProperty: 'bf:partName',
    bibframeClass: 'bf:Title',
    marcField: ['245$p'],
    repeatable: false,
    valueType: 'literal',
    helpText: '245$p • bf:partName • Name of part/section'
  },

  // Responsibility Statement
  'instance.responsibilityStatement': {
    fieldId: 'instance.responsibilityStatement',
    fieldLabel: 'Statement of Responsibility',
    bibframeProperty: 'bf:responsibilityStatement',
    bibframeClass: 'bf:Instance',
    marcField: ['245$c'],
    repeatable: false,
    valueType: 'literal',
    helpText: '245$c • bf:responsibilityStatement • Statement of responsibility'
  },

  // Edition Statement
  'instance.editionStatement': {
    fieldId: 'instance.editionStatement',
    fieldLabel: 'Edition Statement',
    bibframeProperty: 'bf:editionStatement',
    bibframeClass: 'bf:Instance',
    marcField: ['250$a'],
    repeatable: false,
    valueType: 'literal',
    helpText: '250$a • bf:editionStatement • Edition designation'
  },

  // Series Statement
  'instance.seriesStatement': {
    fieldId: 'instance.seriesStatement',
    fieldLabel: 'Series Statement',
    bibframeProperty: 'bf:seriesStatement',
    bibframeClass: 'bf:Instance',
    marcField: ['490'],
    repeatable: true,
    valueType: 'literal',
    helpText: '490 • bf:seriesStatement • Series statement'
  },

  // Publication
  'instance.publication.place': {
    fieldId: 'instance.publication.place',
    fieldLabel: 'Publication Place',
    bibframeProperty: 'bf:place',
    bibframeClass: 'bf:Publication',
    marcField: ['264_1$a'],
    repeatable: false,
    valueType: 'literal',
    helpText: '264_1$a • bf:place • Place of publication'
  },
  'instance.publication.agent': {
    fieldId: 'instance.publication.agent',
    fieldLabel: 'Publisher',
    bibframeProperty: 'bf:agent',
    bibframeClass: 'bf:Publication',
    marcField: ['264_1$b'],
    repeatable: false,
    valueType: 'literal',
    helpText: '264_1$b • bf:agent • Publisher name'
  },
  'instance.publication.date': {
    fieldId: 'instance.publication.date',
    fieldLabel: 'Publication Date',
    bibframeProperty: 'bf:date',
    bibframeClass: 'bf:Publication',
    marcField: ['264_1$c'],
    repeatable: false,
    valueType: 'literal',
    helpText: '264_1$c • bf:date • Publication date'
  },

  // Identifiers
  'instance.identifier.isbn': {
    fieldId: 'instance.identifier.isbn',
    fieldLabel: 'ISBN',
    bibframeProperty: 'bf:identifiedBy',
    bibframeClass: 'bf:Isbn',
    marcField: ['020$a'],
    repeatable: true,
    valueType: 'literal',
    validation: {
      pattern: '^(\\d{10}|\\d{13}|\\d{3}-\\d{1,5}-\\d{1,7}-\\d{1,7}-\\d{1})$'
    },
    helpText: '020$a • bf:identifiedBy • International Standard Book Number'
  },
  'instance.identifier.issn': {
    fieldId: 'instance.identifier.issn',
    fieldLabel: 'ISSN',
    bibframeProperty: 'bf:identifiedBy',
    bibframeClass: 'bf:Issn',
    marcField: ['022$a'],
    repeatable: true,
    valueType: 'literal',
    validation: {
      pattern: '^\\d{4}-\\d{3}[\\dX]$'
    },
    helpText: '022$a • bf:identifiedBy • International Standard Serial Number'
  },
  'instance.identifier.lccn': {
    fieldId: 'instance.identifier.lccn',
    fieldLabel: 'LCCN',
    bibframeProperty: 'bf:identifiedBy',
    bibframeClass: 'bf:Lccn',
    marcField: ['010$a'],
    repeatable: false,
    valueType: 'literal',
    helpText: '010$a • bf:identifiedBy • Library of Congress Control Number'
  },

  // Extent
  'instance.extent': {
    fieldId: 'instance.extent',
    fieldLabel: 'Extent',
    bibframeProperty: 'bf:extent',
    bibframeClass: 'bf:Extent',
    marcField: ['300$a'],
    repeatable: false,
    valueType: 'literal',
    helpText: '300$a • bf:extent • Physical extent'
  },

  // Dimensions
  'instance.dimensions': {
    fieldId: 'instance.dimensions',
    fieldLabel: 'Dimensions',
    bibframeProperty: 'bf:dimensions',
    bibframeClass: 'bf:Instance',
    marcField: ['300$c'],
    repeatable: false,
    valueType: 'literal',
    helpText: '300$c • bf:dimensions • Size of resource'
  },

  // Media Type
  'instance.media': {
    fieldId: 'instance.media',
    fieldLabel: 'Media Type',
    bibframeProperty: 'bf:media',
    bibframeClass: 'bf:Media',
    marcField: ['337'],
    repeatable: true,
    valueType: 'uri',
    controlledVocabulary: 'RDA Media Types',
    locApiEndpoint: 'http://id.loc.gov/vocabulary/mediaTypes',
    helpText: '337 • bf:media • RDA Media Type'
  },

  // Carrier Type
  'instance.carrier': {
    fieldId: 'instance.carrier',
    fieldLabel: 'Carrier Type',
    bibframeProperty: 'bf:carrier',
    bibframeClass: 'bf:Carrier',
    marcField: ['338'],
    repeatable: true,
    valueType: 'uri',
    controlledVocabulary: 'RDA Carrier Types',
    locApiEndpoint: 'http://id.loc.gov/vocabulary/carriers',
    helpText: '338 • bf:carrier • RDA Carrier Type'
  },

  // ========== ITEM ENTITY FIELDS ==========

  // Barcode
  'item.barcode': {
    fieldId: 'item.barcode',
    fieldLabel: 'Barcode',
    bibframeProperty: 'bf:barcode',
    bibframeClass: 'bf:Item',
    marcField: ['876$p'],
    repeatable: false,
    valueType: 'literal',
    helpText: '876$p • bf:barcode • Item barcode'
  },

  // Call Number (Shelf Mark)
  'item.shelfMark': {
    fieldId: 'item.shelfMark',
    fieldLabel: 'Call Number',
    bibframeProperty: 'bf:shelfMark',
    bibframeClass: 'bf:ShelfMark',
    marcField: ['852$h', '852$i'],
    repeatable: false,
    valueType: 'literal',
    helpText: '852$h$i • bf:shelfMark • Call number'
  },

  // Held By
  'item.heldBy': {
    fieldId: 'item.heldBy',
    fieldLabel: 'Holding Institution',
    bibframeProperty: 'bf:heldBy',
    bibframeClass: 'bf:Item',
    marcField: ['852$a'],
    repeatable: false,
    valueType: 'uri',
    helpText: '852$a • bf:heldBy • Holding institution'
  },

  // Location
  'item.sublocation': {
    fieldId: 'item.sublocation',
    fieldLabel: 'Sublocation',
    bibframeProperty: 'bf:sublocation',
    bibframeClass: 'bf:Item',
    marcField: ['852$b', '852$c'],
    repeatable: false,
    valueType: 'literal',
    helpText: '852$b$c • bf:sublocation • Specific location within institution'
  },

  // Status
  'item.status': {
    fieldId: 'item.status',
    fieldLabel: 'Status',
    bibframeProperty: 'bf:status',
    bibframeClass: 'bf:Status',
    marcField: ['583'],
    repeatable: true,
    valueType: 'uri',
    helpText: '583 • bf:status • Item status'
  },
};

/**
 * Get field mapping by field ID
 */
export function getFieldMapping(fieldId: string): FieldMapping | undefined {
  return FIELD_MAPPINGS[fieldId];
}

/**
 * Get all field mappings for an entity type
 */
export function getFieldMappingsForEntity(entity: 'work' | 'instance' | 'item'): FieldMapping[] {
  return Object.values(FIELD_MAPPINGS).filter(mapping =>
    mapping.fieldId.startsWith(`${entity}.`)
  );
}

/**
 * Get BIBFRAME property for a field
 */
export function getBibframePropertyForField(fieldId: string): BibframeProperty | undefined {
  const mapping = FIELD_MAPPINGS[fieldId];
  if (!mapping) return undefined;
  
  return BIBFRAME_PROPERTIES[mapping.bibframeProperty];
}

/**
 * Validate field value against BIBFRAME ontology rules
 */
export function validateField(
  fieldId: string,
  value: any
): { valid: boolean; errors: string[]; warnings: string[] } {
  const mapping = FIELD_MAPPINGS[fieldId];
  if (!mapping) {
    return { valid: false, errors: [`Unknown field: ${fieldId}`], warnings: [] };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field check
  if (mapping.required && !value) {
    errors.push(`${mapping.fieldLabel} is required (${mapping.bibframeProperty})`);
  }

  // Validation pattern check
  if (mapping.validation?.pattern && value) {
    const regex = new RegExp(mapping.validation.pattern);
    if (!regex.test(value)) {
      errors.push(`${mapping.fieldLabel} format is invalid`);
    }
  }

  // Length validation
  if (mapping.validation?.minLength && value && value.length < mapping.validation.minLength) {
    errors.push(`${mapping.fieldLabel} must be at least ${mapping.validation.minLength} characters`);
  }
  if (mapping.validation?.maxLength && value && value.length > mapping.validation.maxLength) {
    errors.push(`${mapping.fieldLabel} must not exceed ${mapping.validation.maxLength} characters`);
  }

  // Allowed values check
  if (mapping.validation?.allowedValues && value) {
    if (!mapping.validation.allowedValues.includes(value)) {
      errors.push(`${mapping.fieldLabel} must be one of: ${mapping.validation.allowedValues.join(', ')}`);
    }
  }

  // Controlled vocabulary warning
  if (mapping.controlledVocabulary && value && !value.startsWith('http://')) {
    warnings.push(`${mapping.fieldLabel} should use ${mapping.controlledVocabulary} authority`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get all required fields for an entity
 */
export function getRequiredFields(entity: 'work' | 'instance' | 'item'): FieldMapping[] {
  return getFieldMappingsForEntity(entity).filter(mapping => mapping.required);
}

/**
 * Get controlled vocabulary info for a field
 */
export function getControlledVocabulary(fieldId: string): {
  vocabulary?: string;
  endpoint?: string;
} {
  const mapping = FIELD_MAPPINGS[fieldId];
  return {
    vocabulary: mapping?.controlledVocabulary,
    endpoint: mapping?.locApiEndpoint
  };
}
