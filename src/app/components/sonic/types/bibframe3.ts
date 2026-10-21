/**
 * BIBFRAME 3.0 TypeScript Type Definitions
 * 
 * Based on official ontology:
 * https://id.loc.gov/ontologies/bibframe.html
 * https://github.com/lcnetdev/bibframe-ontology
 * 
 * STRICT COMPLIANCE - No invented properties
 * Only official BIBFRAME 3.0 classes and properties
 * 
 * @version 3.0.0
 * @date 2026-02-16
 */

/**
 * JSON-LD Context
 */
export interface BF3Context {
  '@vocab'?: string;
  bf?: string;
  bflc?: string;
  rdf?: string;
  rdfs?: string;
  xsd?: string;
  skos?: string;
  mads?: string;
}

/**
 * Base RDF Resource
 */
export interface RDFResource {
  '@id': string;
  '@type': string | string[];
  'rdfs:label'?: string | LocalizedString | LocalizedString[];
}

/**
 * Localized String
 */
export interface LocalizedString {
  '@value': string;
  '@language'?: string;
}

/**
 * Reference to another resource
 */
export interface ResourceRef {
  '@id': string;
}

/**
 * bf:Work - Intellectual/Artistic Content
 * Domain: Top-level BIBFRAME entity
 */
export interface BF3Work extends RDFResource {
  '@type': 'bf:Work' | 'bf:Text' | 'bf:StillImage' | 'bf:MovingImage' | 'bf:Audio' | 'bf:Cartography' | 'bf:Dataset' | 'bf:Multimedia' | 'bf:MixedMaterial' | 'bf:NotatedMusic' | 'bf:NotatedMovement' | 'bf:Object3D';
  
  // Title (bf:hasTitle - range: bf:Title)
  'bf:hasTitle'?: BF3Title | BF3Title[];
  
  // Contribution (bf:contribution - range: bf:Contribution)
  'bf:contribution'?: BF3Contribution | BF3Contribution[];
  
  // Subject (bf:subject - range: bf:Subject and subclasses)
  'bf:subject'?: BF3Subject | BF3Subject[];
  
  // Classification (bf:classification - range: bf:Classification)
  'bf:classification'?: BF3Classification | BF3Classification[];
  
  // Genre/Form (bf:genreForm - range: bf:GenreForm)
  'bf:genreForm'?: BF3GenreForm | BF3GenreForm[];
  
  // Summary (bf:summary - range: bf:Summary)
  'bf:summary'?: BF3Summary | BF3Summary[];
  
  // Language (bf:language - range: bf:Language)
  'bf:language'?: BF3Language | BF3Language[];
  
  // Content Type (bf:content - range: bf:Content)
  'bf:content'?: BF3Content | BF3Content[];
  
  // Table of Contents (bf:tableOfContents - range: bf:TableOfContents)
  'bf:tableOfContents'?: BF3TableOfContents | BF3TableOfContents[];
  
  // Note (bf:note - range: bf:Note)
  'bf:note'?: BF3Note | BF3Note[];
  
  // Related Work (bf:relatedTo - range: bf:Work)
  'bf:relatedTo'?: ResourceRef | ResourceRef[];
  
  // Part of (bf:partOf - range: bf:Work)
  'bf:partOf'?: ResourceRef | ResourceRef[];
  
  // Has Part (bf:hasPart - range: bf:Work)
  'bf:hasPart'?: ResourceRef | ResourceRef[];
  
  // Expressionof (bf:expressionOf - range: bf:Work)
  'bf:expressionOf'?: ResourceRef | ResourceRef[];
  
  // Has Instance (bf:hasInstance - range: bf:Instance)
  'bf:hasInstance'?: ResourceRef | ResourceRef[];
  
  // Intended Audience (bf:intendedAudience - range: bf:IntendedAudience)
  'bf:intendedAudience'?: BF3IntendedAudience | BF3IntendedAudience[];
  
  // Origin Date (bf:originDate - range: xsd:date or edtf:EDTF-level1)
  'bf:originDate'?: string;
  
  // Origin Place (bf:originPlace - range: bf:Place)
  'bf:originPlace'?: BF3Place | BF3Place[];
  
  // Dissertation (bf:dissertation - range: bf:Dissertation)
  'bf:dissertation'?: BF3Dissertation | BF3Dissertation[];
}

/**
 * bf:Instance - Physical/Digital Embodiment
 * Domain: Top-level BIBFRAME entity
 */
export interface BF3Instance extends RDFResource {
  '@type': 'bf:Instance' | 'bf:Print' | 'bf:Electronic' | 'bf:Manuscript';
  
  // Instance Of (bf:instanceOf - range: bf:Work) - REQUIRED
  'bf:instanceOf': ResourceRef;
  
  // Title (bf:hasTitle - range: bf:Title)
  'bf:hasTitle'?: BF3Title | BF3Title[];
  
  // Provision Activity (bf:provisionActivity - range: bf:ProvisionActivity)
  'bf:provisionActivity'?: BF3ProvisionActivity | BF3ProvisionActivity[];
  
  // Publication (subproperty of provisionActivity)
  'bf:publication'?: BF3Publication | BF3Publication[];
  
  // Production (subproperty of provisionActivity)
  'bf:production'?: BF3Production | BF3Production[];
  
  // Distribution (subproperty of provisionActivity)
  'bf:distribution'?: BF3Distribution | BF3Distribution[];
  
  // Manufacture (subproperty of provisionActivity)
  'bf:manufacture'?: BF3Manufacture | BF3Manufacture[];
  
  // Copyright Date (bf:copyrightDate - range: xsd:date)
  'bf:copyrightDate'?: string;
  
  // Extent (bf:extent - range: bf:Extent)
  'bf:extent'?: BF3Extent | BF3Extent[];
  
  // Dimensions (bf:dimensions - range: rdfs:Literal)
  'bf:dimensions'?: string;
  
  // Media Type (bf:media - range: bf:Media)
  'bf:media'?: BF3Media | BF3Media[];
  
  // Carrier Type (bf:carrier - range: bf:Carrier)
  'bf:carrier'?: BF3Carrier | BF3Carrier[];
  
  // Identified By (bf:identifiedBy - range: bf:Identifier)
  'bf:identifiedBy'?: BF3Identifier | BF3Identifier[];
  
  // Edition Statement (bf:editionStatement - range: rdfs:Literal)
  'bf:editionStatement'?: string;
  
  // Series Statement (bf:seriesStatement - range: rdfs:Literal)
  'bf:seriesStatement'?: string;
  
  // Responsibility Statement (bf:responsibilityStatement - range: rdfs:Literal)
  'bf:responsibilityStatement'?: string;
  
  // Note (bf:note - range: bf:Note)
  'bf:note'?: BF3Note | BF3Note[];
  
  // Has Item (bf:hasItem - range: bf:Item)
  'bf:hasItem'?: ResourceRef | ResourceRef[];
  
  // Electronic Locator (bf:electronicLocator - range: rdfs:Resource)
  'bf:electronicLocator'?: ResourceRef | ResourceRef[];
}

/**
 * bf:Item - Physical/Electronic Copy
 */
export interface BF3Item extends RDFResource {
  '@type': 'bf:Item';
  
  // Item Of (bf:itemOf - range: bf:Instance) - REQUIRED
  'bf:itemOf': ResourceRef;
  
  // Held By (bf:heldBy - range: bf:Agent)
  'bf:heldBy'?: BF3Agent | BF3Agent[];
  
  // Sublocation (bf:sublocation - range: bf:Sublocation)
  'bf:sublocation'?: BF3Sublocation | BF3Sublocation[];
  
  // Shelf Mark (bf:shelfMark - range: bf:ShelfMark)
  'bf:shelfMark'?: BF3ShelfMark | BF3ShelfMark[];
  
  // Barcode (bf:barcode - range: bf:Barcode)
  'bf:barcode'?: BF3Barcode | BF3Barcode[];
  
  // Note (bf:note - range: bf:Note)
  'bf:note'?: BF3Note | BF3Note[];
}

/**
 * bf:Title
 * Range for bf:hasTitle
 */
export interface BF3Title extends RDFResource {
  '@type': 'bf:Title' | 'bf:AbbreviatedTitle' | 'bf:CollectiveTitle' | 'bf:KeyTitle' | 'bf:ParallelTitle' | 'bf:VariantTitle';
  
  // Main Title (bf:mainTitle - range: rdfs:Literal) - REQUIRED for Title
  'bf:mainTitle': string;
  
  // Subtitle (bf:subtitle - range: rdfs:Literal)
  'bf:subtitle'?: string;
  
  // Part Number (bf:partNumber - range: rdfs:Literal)
  'bf:partNumber'?: string;
  
  // Part Name (bf:partName - range: rdfs:Literal)
  'bf:partName'?: string;
  
  // Note (bf:note - range: bf:Note)
  'bf:note'?: BF3Note | BF3Note[];
}

/**
 * bf:Contribution
 * Range for bf:contribution
 */
export interface BF3Contribution extends RDFResource {
  '@type': 'bf:Contribution' | 'bf:PrimaryContribution';
  
  // Agent (bf:agent - range: bf:Agent) - REQUIRED
  'bf:agent': BF3Agent | ResourceRef;
  
  // Role (bf:role - range: bf:Role)
  'bf:role'?: BF3Role | ResourceRef;
  
  // Date (bf:date - range: xsd:date or edtf:EDTF-level1)
  'bf:date'?: string;
}

/**
 * bf:Agent (Abstract)
 * Subclasses: bf:Person, bf:Organization, bf:Meeting, bf:Family, bf:Jurisdiction
 */
export interface BF3Agent extends RDFResource {
  '@type': 'bf:Person' | 'bf:Organization' | 'bf:Meeting' | 'bf:Family' | 'bf:Jurisdiction';
  'rdfs:label': string;
}

/**
 * bf:Role
 */
export interface BF3Role extends RDFResource {
  '@type': 'bf:Role';
  'rdfs:label'?: string;
}

/**
 * bf:Subject (Abstract)
 * Subclasses: bf:Topic, bf:Place, bf:Temporal, bf:Person, bf:Organization, etc.
 */
export type BF3Subject = 
  | BF3Topic 
  | BF3Place 
  | BF3Temporal 
  | BF3Agent
  | BF3GenreForm;

/**
 * bf:Topic
 */
export interface BF3Topic extends RDFResource {
  '@type': 'bf:Topic';
  'rdfs:label': string;
}

/**
 * bf:Place
 */
export interface BF3Place extends RDFResource {
  '@type': 'bf:Place';
  'rdfs:label': string;
}

/**
 * bf:Temporal
 */
export interface BF3Temporal extends RDFResource {
  '@type': 'bf:Temporal';
  'rdfs:label': string;
}

/**
 * bf:GenreForm
 */
export interface BF3GenreForm extends RDFResource {
  '@type': 'bf:GenreForm';
  'rdfs:label': string;
}

/**
 * bf:Classification
 */
export interface BF3Classification extends RDFResource {
  '@type': 'bf:Classification' | 'bf:ClassificationDdc' | 'bf:ClassificationLcc' | 'bf:ClassificationUdc';
  
  // Classification Number (bf:classificationPortion - range: rdfs:Literal)
  'bf:classificationPortion'?: string;
  
  // Item Number (bf:itemPortion - range: rdfs:Literal)
  'bf:itemPortion'?: string;
  
  // Edition (bf:edition - range: rdfs:Literal)
  'bf:edition'?: string;
  
  // Source (bf:source - range: bf:Source)
  'bf:source'?: ResourceRef;
}

/**
 * bf:Summary
 */
export interface BF3Summary extends RDFResource {
  '@type': 'bf:Summary';
  'rdfs:label': string;
}

/**
 * bf:Language
 */
export interface BF3Language extends RDFResource {
  '@type': 'bf:Language';
  'rdfs:label'?: string;
}

/**
 * bf:Content
 */
export interface BF3Content extends RDFResource {
  '@type': 'bf:Content';
  'rdfs:label'?: string;
}

/**
 * bf:TableOfContents
 */
export interface BF3TableOfContents extends RDFResource {
  '@type': 'bf:TableOfContents';
  'rdfs:label': string;
}

/**
 * bf:Note
 */
export interface BF3Note extends RDFResource {
  '@type': 'bf:Note';
  'rdfs:label': string;
  'bf:noteType'?: string;
}

/**
 * bf:IntendedAudience
 */
export interface BF3IntendedAudience extends RDFResource {
  '@type': 'bf:IntendedAudience';
  'rdfs:label': string;
}

/**
 * bf:Dissertation
 */
export interface BF3Dissertation extends RDFResource {
  '@type': 'bf:Dissertation';
  'bf:degree'?: string;
  'bf:grantingInstitution'?: BF3Agent | ResourceRef;
  'bf:date'?: string;
}

/**
 * bf:ProvisionActivity (Abstract)
 * Subclasses: bf:Publication, bf:Production, bf:Distribution, bf:Manufacture
 */
export interface BF3ProvisionActivity extends RDFResource {
  '@type': 'bf:ProvisionActivity' | 'bf:Publication' | 'bf:Production' | 'bf:Distribution' | 'bf:Manufacture';
  
  // Agent (bf:agent - range: bf:Agent)
  'bf:agent'?: BF3Agent | BF3Agent[] | ResourceRef | ResourceRef[];
  
  // Place (bf:place - range: bf:Place)
  'bf:place'?: BF3Place | BF3Place[] | ResourceRef | ResourceRef[];
  
  // Date (bf:date - range: xsd:date or edtf:EDTF-level1)
  'bf:date'?: string;
}

export interface BF3Publication extends BF3ProvisionActivity {
  '@type': 'bf:Publication';
}

export interface BF3Production extends BF3ProvisionActivity {
  '@type': 'bf:Production';
}

export interface BF3Distribution extends BF3ProvisionActivity {
  '@type': 'bf:Distribution';
}

export interface BF3Manufacture extends BF3ProvisionActivity {
  '@type': 'bf:Manufacture';
}

/**
 * bf:Extent
 */
export interface BF3Extent extends RDFResource {
  '@type': 'bf:Extent';
  'rdfs:label': string;
}

/**
 * bf:Media
 */
export interface BF3Media extends RDFResource {
  '@type': 'bf:Media';
  'rdfs:label'?: string;
}

/**
 * bf:Carrier
 */
export interface BF3Carrier extends RDFResource {
  '@type': 'bf:Carrier';
  'rdfs:label'?: string;
}

/**
 * bf:Identifier (Abstract)
 * Subclasses: bf:Isbn, bf:Issn, bf:Lccn, bf:Doi, etc.
 */
export interface BF3Identifier extends RDFResource {
  '@type': 'bf:Identifier' | 'bf:Isbn' | 'bf:Issn' | 'bf:Lccn' | 'bf:Doi' | 'bf:Ean' | 'bf:Fingerprint' | 'bf:Local' | 'bf:Isrc' | 'bf:Ismn' | 'bf:Isni' | 'bf:Isan' | 'bf:Istc' | 'bf:Iswc' | 'bf:MatrixNumber' | 'bf:MusicPlate' | 'bf:MusicPublisherNumber' | 'bf:Nbn' | 'bf:Orcid' | 'bf:PostalRegistration' | 'bf:PublisherNumber' | 'bf:Upc' | 'bf:Urn' | 'bf:Strn';
  
  // Value (rdf:value - range: rdfs:Literal) - REQUIRED
  'rdf:value': string;
  
  // Qualifier (bf:qualifier - range: rdfs:Literal)
  'bf:qualifier'?: string;
  
  // Status (bf:status - range: bf:Status)
  'bf:status'?: BF3Status | ResourceRef;
}

/**
 * bf:Status
 */
export interface BF3Status extends RDFResource {
  '@type': 'bf:Status';
  'rdfs:label'?: string;
}

/**
 * bf:Sublocation
 */
export interface BF3Sublocation extends RDFResource {
  '@type': 'bf:Sublocation';
  'rdfs:label': string;
}

/**
 * bf:ShelfMark
 */
export interface BF3ShelfMark extends RDFResource {
  '@type': 'bf:ShelfMark';
  'rdfs:label': string;
}

/**
 * bf:Barcode
 */
export interface BF3Barcode extends RDFResource {
  '@type': 'bf:Barcode';
  'rdf:value': string;
}

/**
 * Complete JSON-LD Graph
 */
export interface BF3Graph {
  '@context': BF3Context;
  '@graph': (BF3Work | BF3Instance | BF3Item | RDFResource)[];
}

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  entity: 'Work' | 'Instance' | 'Item';
  property: string;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  entity: 'Work' | 'Instance' | 'Item';
  property: string;
  message: string;
  severity: 'warning';
}
