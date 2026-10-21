/**
 * Complete BIBFRAME Field Definitions
 * Based on Marva Monograph Record Analysis
 * All 54+ distinct field types with full metadata
 */

export interface FieldDefinition {
  fieldName: string;
  bibframeProperty: string;
  marcMapping?: string;
  inputType: 'TEXT_INPUT' | 'TEXTAREA' | 'SELECT_MENU' | 'AUTHORITY_LOOKUP' | 'DATE_FIELD' | 'NUMBER_FIELD' | 'URI_FIELD' | 'DERIVED' | 'REPEATABLE_BLOCK';
  apiEndpoint?: string;
  vocabularyUri?: string;
  repeatable: boolean;
  required: boolean;
  entityType?: string;
  section: 'WORK' | 'INSTANCE' | 'ADMIN' | 'SYSTEM';
  category?: string;
  generated?: boolean;
  description?: string;
}

/**
 * Complete field registry for BIBFRAME Monograph cataloging
 * Matches Marva/LC standards exactly
 */
export const COMPLETE_BIBFRAME_FIELDS: FieldDefinition[] = [
  // ===== WORK ENTITY FIELDS =====
  
  // 1. Work Type
  {
    fieldName: 'Work type',
    bibframeProperty: 'rdf:type',
    inputType: 'SELECT_MENU',
    repeatable: false,
    required: true,
    section: 'WORK',
    category: 'Type',
    generated: true,
    description: 'bf:Monograph, bf:Text, etc.'
  },

  // 2. Authorized Access Point (AAP)
  {
    fieldName: 'Authorized access point',
    bibframeProperty: 'bflc:aap',
    inputType: 'DERIVED',
    repeatable: false,
    required: false,
    section: 'WORK',
    category: 'Identification',
    generated: true,
    description: 'Generated from Creator + Title'
  },
  {
    fieldName: 'Normalized AAP',
    bibframeProperty: 'bflc:aap-normalized',
    inputType: 'DERIVED',
    repeatable: false,
    required: false,
    section: 'WORK',
    category: 'Identification',
    generated: true,
    description: 'System-generated normalized form'
  },

  // 3. Classification — LCC
  {
    fieldName: 'LCC Classification number',
    bibframeProperty: 'bf:classificationPortion',
    marcMapping: '050 $a',
    inputType: 'TEXT_INPUT',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Classification',
    entityType: 'bf:ClassificationLcc'
  },
  {
    fieldName: 'LCC Cutter / item number',
    bibframeProperty: 'bf:itemPortion',
    marcMapping: '050 $b',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'WORK',
    category: 'Classification',
    entityType: 'bf:ClassificationLcc'
  },
  {
    fieldName: 'LCC Classification assigner',
    bibframeProperty: 'bf:assigner',
    inputType: 'AUTHORITY_LOOKUP',
    apiEndpoint: 'https://id.loc.gov/vocabulary/organizations',
    vocabularyUri: 'http://id.loc.gov/vocabulary/organizations/',
    repeatable: false,
    required: true,
    section: 'WORK',
    category: 'Classification',
    entityType: 'bf:ClassificationLcc',
    description: 'Organization that assigned classification'
  },
  {
    fieldName: 'LCC Classification status',
    bibframeProperty: 'bf:status',
    inputType: 'SELECT_MENU',
    apiEndpoint: 'https://id.loc.gov/vocabulary/mstatus',
    vocabularyUri: 'http://id.loc.gov/vocabulary/mstatus/',
    repeatable: false,
    required: false,
    section: 'WORK',
    category: 'Classification',
    entityType: 'bf:ClassificationLcc'
  },

  // 4. Classification — Dewey
  {
    fieldName: 'DDC Dewey number',
    bibframeProperty: 'bf:classificationPortion',
    marcMapping: '082 $a',
    inputType: 'TEXT_INPUT',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Classification',
    entityType: 'bf:ClassificationDdc'
  },
  {
    fieldName: 'DDC Dewey edition',
    bibframeProperty: 'bf:source',
    marcMapping: '082 $2',
    inputType: 'SELECT_MENU',
    repeatable: false,
    required: false,
    section: 'WORK',
    category: 'Classification',
    entityType: 'bf:ClassificationDdc',
    description: 'Edition number (e.g., 21, 22, 23)'
  },

  // 5. Subject Access
  {
    fieldName: 'Subject - Topic',
    bibframeProperty: 'bf:subject',
    marcMapping: '650',
    inputType: 'AUTHORITY_LOOKUP',
    apiEndpoint: 'https://id.loc.gov/authorities/subjects',
    vocabularyUri: 'http://id.loc.gov/authorities/subjects/',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Subject Access',
    entityType: 'bf:Topic',
    description: 'Topical subject headings (LCSH)'
  },
  {
    fieldName: 'Subject - Geographic',
    bibframeProperty: 'bf:subject',
    marcMapping: '651',
    inputType: 'AUTHORITY_LOOKUP',
    apiEndpoint: 'https://id.loc.gov/authorities/subjects',
    vocabularyUri: 'http://id.loc.gov/authorities/subjects/',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Subject Access',
    entityType: 'bf:Geographic',
    description: 'Geographic subject headings'
  },
  {
    fieldName: 'Subject - Temporal',
    bibframeProperty: 'bf:subject',
    marcMapping: '648',
    inputType: 'AUTHORITY_LOOKUP',
    apiEndpoint: 'https://id.loc.gov/authorities/subjects',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Subject Access',
    entityType: 'bf:Temporal',
    description: 'Chronological subject headings'
  },
  {
    fieldName: 'Subject - Name',
    bibframeProperty: 'bf:subject',
    marcMapping: '600',
    inputType: 'AUTHORITY_LOOKUP',
    apiEndpoint: 'https://id.loc.gov/authorities/names',
    vocabularyUri: 'http://id.loc.gov/rwo/agents/',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Subject Access',
    entityType: 'bf:Person',
    description: 'Personal name as subject'
  },

  // 6. Genre/Form
  {
    fieldName: 'Genre/Form',
    bibframeProperty: 'bf:genreForm',
    marcMapping: '655',
    inputType: 'AUTHORITY_LOOKUP',
    apiEndpoint: 'https://id.loc.gov/authorities/genreForms',
    vocabularyUri: 'http://id.loc.gov/authorities/genreForms/',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Subject Access',
    description: 'Form or genre terms (LCGFT)'
  },

  // 7. Geographic Coverage
  {
    fieldName: 'Geographic coverage',
    bibframeProperty: 'bf:geographicCoverage',
    marcMapping: '043',
    inputType: 'AUTHORITY_LOOKUP',
    apiEndpoint: 'https://id.loc.gov/vocabulary/geographicAreas',
    vocabularyUri: 'http://id.loc.gov/vocabulary/geographicAreas/',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Subject Access',
    description: 'Geographic area codes'
  },

  // 8. Content Description
  {
    fieldName: 'Content type',
    bibframeProperty: 'bf:content',
    marcMapping: '336',
    inputType: 'SELECT_MENU',
    apiEndpoint: 'https://id.loc.gov/vocabulary/contentTypes',
    vocabularyUri: 'http://id.loc.gov/vocabulary/contentTypes/',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Content',
    description: 'RDA content type'
  },
  {
    fieldName: 'Illustrative content',
    bibframeProperty: 'bf:illustrativeContent',
    marcMapping: '300 $b / 340',
    inputType: 'SELECT_MENU',
    apiEndpoint: 'https://id.loc.gov/vocabulary/millus',
    vocabularyUri: 'http://id.loc.gov/vocabulary/millus/',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Content',
    description: 'Illustrations, charts, maps, etc.'
  },
  {
    fieldName: 'Supplementary content',
    bibframeProperty: 'bf:supplementaryContent',
    marcMapping: '504 / 500',
    inputType: 'SELECT_MENU',
    apiEndpoint: 'https://id.loc.gov/vocabulary/msupplcont',
    vocabularyUri: 'http://id.loc.gov/vocabulary/msupplcont/',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Content',
    description: 'Index, bibliography, etc.'
  },

  // 9. Contribution
  {
    fieldName: 'Creator - Person',
    bibframeProperty: 'bf:contribution',
    marcMapping: '100',
    inputType: 'AUTHORITY_LOOKUP',
    apiEndpoint: 'https://id.loc.gov/authorities/names',
    vocabularyUri: 'http://id.loc.gov/rwo/agents/',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Contributors',
    entityType: 'bf:PrimaryContribution',
    description: 'Primary creator (person)'
  },
  {
    fieldName: 'Contributor - Person',
    bibframeProperty: 'bf:contribution',
    marcMapping: '700',
    inputType: 'AUTHORITY_LOOKUP',
    apiEndpoint: 'https://id.loc.gov/authorities/names',
    vocabularyUri: 'http://id.loc.gov/rwo/agents/',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Contributors',
    entityType: 'bf:Contribution',
    description: 'Added entry - person'
  },
  {
    fieldName: 'Creator - Organization',
    bibframeProperty: 'bf:contribution',
    marcMapping: '110',
    inputType: 'AUTHORITY_LOOKUP',
    apiEndpoint: 'https://id.loc.gov/authorities/names',
    vocabularyUri: 'http://id.loc.gov/rwo/agents/',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Contributors',
    entityType: 'bf:PrimaryContribution',
    description: 'Primary creator (organization)'
  },
  {
    fieldName: 'Contributor role',
    bibframeProperty: 'bf:role',
    marcMapping: '$e',
    inputType: 'SELECT_MENU',
    apiEndpoint: 'https://id.loc.gov/vocabulary/relators',
    vocabularyUri: 'http://id.loc.gov/vocabulary/relators/',
    repeatable: false,
    required: false,
    section: 'WORK',
    category: 'Contributors',
    description: 'Relator term (author, editor, etc.)'
  },

  // 10. Language
  {
    fieldName: 'Language',
    bibframeProperty: 'bf:language',
    marcMapping: '008/35-37 / 041',
    inputType: 'AUTHORITY_LOOKUP',
    apiEndpoint: 'https://id.loc.gov/vocabulary/languages',
    vocabularyUri: 'http://id.loc.gov/vocabulary/languages/',
    repeatable: true,
    required: false,
    section: 'WORK',
    category: 'Language',
    description: 'Language of content'
  },

  // ===== INSTANCE ENTITY FIELDS =====

  // 11. Title
  {
    fieldName: 'Main title',
    bibframeProperty: 'bf:mainTitle',
    marcMapping: '245 $a',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: true,
    section: 'INSTANCE',
    category: 'Title',
    entityType: 'bf:Title'
  },
  {
    fieldName: 'Subtitle',
    bibframeProperty: 'bf:subtitle',
    marcMapping: '245 $b',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Title',
    entityType: 'bf:Title'
  },
  {
    fieldName: 'Part number',
    bibframeProperty: 'bf:partNumber',
    marcMapping: '245 $n',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Title',
    entityType: 'bf:Title'
  },
  {
    fieldName: 'Part name',
    bibframeProperty: 'bf:partName',
    marcMapping: '245 $p',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Title',
    entityType: 'bf:Title'
  },
  {
    fieldName: 'Non-sort characters',
    bibframeProperty: 'bflc:nonSortNum',
    marcMapping: '245 ind2',
    inputType: 'NUMBER_FIELD',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Title',
    entityType: 'bf:Title',
    description: 'Number of characters to skip for sorting'
  },

  // 12. Variant Titles
  {
    fieldName: 'Variant title',
    bibframeProperty: 'bf:title',
    marcMapping: '246',
    inputType: 'TEXT_INPUT',
    repeatable: true,
    required: false,
    section: 'INSTANCE',
    category: 'Title',
    entityType: 'bf:VariantTitle'
  },

  // 13. Responsibility
  {
    fieldName: 'Statement of responsibility',
    bibframeProperty: 'bf:responsibilityStatement',
    marcMapping: '245 $c',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Responsibility'
  },

  // 14. Provision Activity - Publication
  {
    fieldName: 'Publication place - URI',
    bibframeProperty: 'bf:place',
    marcMapping: '264 $a',
    inputType: 'AUTHORITY_LOOKUP',
    apiEndpoint: 'https://id.loc.gov/vocabulary/countries',
    vocabularyUri: 'http://id.loc.gov/vocabulary/countries/',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Publication',
    entityType: 'bf:Publication',
    description: 'Place of publication (controlled)'
  },
  {
    fieldName: 'Publication place - text',
    bibframeProperty: 'bflc:simplePlace',
    marcMapping: '264 $a',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Publication',
    entityType: 'bf:Publication',
    description: 'Place of publication (text)'
  },
  {
    fieldName: 'Publisher name',
    bibframeProperty: 'bflc:simpleAgent',
    marcMapping: '264 $b',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Publication',
    entityType: 'bf:Publication'
  },
  {
    fieldName: 'Publication date',
    bibframeProperty: 'bf:date',
    marcMapping: '264 $c',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Publication',
    entityType: 'bf:Publication'
  },
  {
    fieldName: 'Copyright date',
    bibframeProperty: 'bflc:simpleDate',
    marcMapping: '264 $c',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Publication',
    description: 'Copyright date with c prefix'
  },

  // 15. Provision Activity - Distribution
  {
    fieldName: 'Distribution place',
    bibframeProperty: 'bflc:simplePlace',
    marcMapping: '264 $a (ind2=2)',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Distribution',
    entityType: 'bf:Distribution'
  },
  {
    fieldName: 'Distributor name',
    bibframeProperty: 'bflc:simpleAgent',
    marcMapping: '264 $b (ind2=2)',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Distribution',
    entityType: 'bf:Distribution'
  },

  // 16. Provision Activity - Manufacture
  {
    fieldName: 'Manufacture place',
    bibframeProperty: 'bflc:simplePlace',
    marcMapping: '264 $a (ind2=3)',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Manufacture',
    entityType: 'bf:Manufacture'
  },
  {
    fieldName: 'Manufacturer name',
    bibframeProperty: 'bflc:simpleAgent',
    marcMapping: '264 $b (ind2=3)',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Manufacture',
    entityType: 'bf:Manufacture'
  },

  // 17. Identifiers
  {
    fieldName: 'LCCN',
    bibframeProperty: 'bf:identifiedBy',
    marcMapping: '010 $a',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Identifiers',
    entityType: 'bf:Lccn'
  },
  {
    fieldName: 'ISBN',
    bibframeProperty: 'bf:identifiedBy',
    marcMapping: '020 $a',
    inputType: 'TEXT_INPUT',
    repeatable: true,
    required: false,
    section: 'INSTANCE',
    category: 'Identifiers',
    entityType: 'bf:Isbn'
  },
  {
    fieldName: 'ISSN',
    bibframeProperty: 'bf:identifiedBy',
    marcMapping: '022 $a',
    inputType: 'TEXT_INPUT',
    repeatable: true,
    required: false,
    section: 'INSTANCE',
    category: 'Identifiers',
    entityType: 'bf:Issn'
  },

  // 18. Physical Description
  {
    fieldName: 'Extent',
    bibframeProperty: 'bf:extent',
    marcMapping: '300 $a',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Physical Description'
  },
  {
    fieldName: 'Dimensions',
    bibframeProperty: 'bf:dimensions',
    marcMapping: '300 $c',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Physical Description'
  },

  // 19. Carrier/Media
  {
    fieldName: 'Carrier type',
    bibframeProperty: 'bf:carrier',
    marcMapping: '338',
    inputType: 'SELECT_MENU',
    apiEndpoint: 'https://id.loc.gov/vocabulary/carriers',
    vocabularyUri: 'http://id.loc.gov/vocabulary/carriers/',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Carrier'
  },
  {
    fieldName: 'Media type',
    bibframeProperty: 'bf:media',
    marcMapping: '337',
    inputType: 'SELECT_MENU',
    apiEndpoint: 'https://id.loc.gov/vocabulary/mediaTypes',
    vocabularyUri: 'http://id.loc.gov/vocabulary/mediaTypes/',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Carrier'
  },

  // 20. Issuance
  {
    fieldName: 'Mode of issuance',
    bibframeProperty: 'bf:issuance',
    marcMapping: 'Leader/07',
    inputType: 'SELECT_MENU',
    apiEndpoint: 'https://id.loc.gov/vocabulary/issuance',
    vocabularyUri: 'http://id.loc.gov/vocabulary/issuance/',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Issuance'
  },

  // 21. Notes
  {
    fieldName: 'General note',
    bibframeProperty: 'bf:note',
    marcMapping: '500',
    inputType: 'TEXTAREA',
    repeatable: true,
    required: false,
    section: 'INSTANCE',
    category: 'Notes'
  },
  {
    fieldName: 'Physical note',
    bibframeProperty: 'bf:note',
    marcMapping: '300 $b',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'INSTANCE',
    category: 'Notes',
    description: 'Physical details note'
  },
  {
    fieldName: 'Summary',
    bibframeProperty: 'bf:summary',
    marcMapping: '520',
    inputType: 'TEXTAREA',
    repeatable: true,
    required: false,
    section: 'INSTANCE',
    category: 'Notes',
    entityType: 'bf:Summary'
  },
  {
    fieldName: 'Table of contents',
    bibframeProperty: 'bf:tableOfContents',
    marcMapping: '505',
    inputType: 'TEXTAREA',
    repeatable: true,
    required: false,
    section: 'INSTANCE',
    category: 'Notes',
    entityType: 'bf:TableOfContents'
  },

  // 22. Electronic Location
  {
    fieldName: 'Electronic locator (URL)',
    bibframeProperty: 'bf:electronicLocator',
    marcMapping: '856 $u',
    inputType: 'URI_FIELD',
    repeatable: true,
    required: false,
    section: 'INSTANCE',
    category: 'Electronic Access'
  },

  // ===== ADMIN METADATA FIELDS =====

  // 23. Status
  {
    fieldName: 'Record status',
    bibframeProperty: 'bf:status',
    inputType: 'SELECT_MENU',
    apiEndpoint: 'https://id.loc.gov/vocabulary/mstatus',
    vocabularyUri: 'http://id.loc.gov/vocabulary/mstatus/',
    repeatable: false,
    required: true,
    section: 'ADMIN',
    category: 'Status'
  },

  // 24. Dates
  {
    fieldName: 'Creation date',
    bibframeProperty: 'bf:creationDate',
    inputType: 'DATE_FIELD',
    repeatable: false,
    required: false,
    section: 'ADMIN',
    category: 'Dates',
    generated: true
  },
  {
    fieldName: 'Modification date',
    bibframeProperty: 'bf:changeDate',
    inputType: 'DATE_FIELD',
    repeatable: false,
    required: false,
    section: 'ADMIN',
    category: 'Dates',
    generated: true
  },

  // 25. Agency
  {
    fieldName: 'Cataloging source',
    bibframeProperty: 'bf:source',
    marcMapping: '040 $a',
    inputType: 'AUTHORITY_LOOKUP',
    apiEndpoint: 'https://id.loc.gov/vocabulary/organizations',
    vocabularyUri: 'http://id.loc.gov/vocabulary/organizations/',
    repeatable: false,
    required: true,
    section: 'ADMIN',
    category: 'Agency'
  },
  {
    fieldName: 'Description modifier',
    bibframeProperty: 'bf:descriptionModifier',
    marcMapping: '040 $d',
    inputType: 'AUTHORITY_LOOKUP',
    apiEndpoint: 'https://id.loc.gov/vocabulary/organizations',
    vocabularyUri: 'http://id.loc.gov/vocabulary/organizations/',
    repeatable: true,
    required: false,
    section: 'ADMIN',
    category: 'Agency'
  },

  // 26. Encoding
  {
    fieldName: 'Encoding level',
    bibframeProperty: 'bflc:encodingLevel',
    marcMapping: 'Leader/17',
    inputType: 'SELECT_MENU',
    apiEndpoint: 'https://id.loc.gov/vocabulary/menclvl',
    vocabularyUri: 'http://id.loc.gov/vocabulary/menclvl/',
    repeatable: false,
    required: false,
    section: 'ADMIN',
    category: 'Encoding'
  },
  {
    fieldName: 'Description conventions',
    bibframeProperty: 'bf:descriptionConventions',
    marcMapping: '040 $e',
    inputType: 'SELECT_MENU',
    apiEndpoint: 'https://id.loc.gov/vocabulary/descriptionConventions',
    vocabularyUri: 'http://id.loc.gov/vocabulary/descriptionConventions/',
    repeatable: false,
    required: false,
    section: 'ADMIN',
    category: 'Encoding'
  },
  {
    fieldName: 'Description authentication',
    bibframeProperty: 'bf:descriptionAuthentication',
    marcMapping: '042',
    inputType: 'SELECT_MENU',
    apiEndpoint: 'https://id.loc.gov/vocabulary/marcauthen',
    vocabularyUri: 'http://id.loc.gov/vocabulary/marcauthen/',
    repeatable: false,
    required: false,
    section: 'ADMIN',
    category: 'Encoding'
  },

  // 27. Cataloger
  {
    fieldName: 'Cataloger ID',
    bibframeProperty: 'bflc:catalogerId',
    inputType: 'TEXT_INPUT',
    repeatable: false,
    required: false,
    section: 'ADMIN',
    category: 'Cataloger'
  },
];

/**
 * Get fields by section
 */
export function getFieldsBySection(section: 'WORK' | 'INSTANCE' | 'ADMIN' | 'SYSTEM'): FieldDefinition[] {
  return COMPLETE_BIBFRAME_FIELDS.filter(f => f.section === section);
}

/**
 * Get fields by category
 */
export function getFieldsByCategory(category: string): FieldDefinition[] {
  return COMPLETE_BIBFRAME_FIELDS.filter(f => f.category === category);
}

/**
 * Get authority-controlled fields
 */
export function getAuthorityFields(): FieldDefinition[] {
  return COMPLETE_BIBFRAME_FIELDS.filter(f => f.inputType === 'AUTHORITY_LOOKUP');
}

/**
 * Get vocabulary-controlled fields
 */
export function getVocabularyFields(): FieldDefinition[] {
  return COMPLETE_BIBFRAME_FIELDS.filter(f => 
    f.inputType === 'SELECT_MENU' && f.apiEndpoint
  );
}
