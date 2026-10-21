/**
 * BIBFRAME Ontology Core Service
 * Based on https://github.com/lcnetdev/bibframe-ontology
 * Official Library of Congress BIBFRAME 3.0.1 Ontology
 */

export interface OntologyClass {
  uri: string;
  label: string;
  definition: string;
  subClassOf?: string[];
  properties?: string[];
  usedWith?: string[];
  expectedValue?: string[];
  editorialNote?: string;
  changeNotes?: Array<{ date: string; note: string }>;
  examples?: string[];
  controlledList?: string;
}

export interface OntologyProperty {
  uri: string;
  label: string;
  definition: string;
  subPropertyOf?: string[];
  domain?: string[];
  range?: string[];
  usedWith?: string;
  expectedValue?: string;
  inverseOf?: string;
  editorialNote?: string;
  changeNotes?: Array<{ date: string; note: string }>;
  examples?: string[];
  controlledList?: string;
}

export interface BibframeOntology {
  version: string;
  versionIRI: string;
  priorVersionIRI: string;
  classes: Map<string, OntologyClass>;
  properties: Map<string, OntologyProperty>;
  deprecatedClasses: string[];
  deprecatedProperties: string[];
}

/**
 * BIBFRAME Ontology Core Service
 * Provides access to the complete BIBFRAME 3.0.1 ontology
 */
class BibframeOntologyCore {
  private ontology: BibframeOntology;
  private readonly BASE_URI = 'http://id.loc.gov/ontologies/bibframe/';
  private readonly VERSION = '3.0.1';

  constructor() {
    this.ontology = this.loadOntology();
  }

  /**
   * Get the complete ontology
   */
  getOntology(): BibframeOntology {
    return this.ontology;
  }

  /**
   * Get a class by URI or local name
   */
  getClass(identifier: string): OntologyClass | undefined {
    const uri = identifier.startsWith('http') ? identifier : `${this.BASE_URI}${identifier}`;
    return this.ontology.classes.get(uri);
  }

  /**
   * Get a property by URI or local name
   */
  getProperty(identifier: string): OntologyProperty | undefined {
    const uri = identifier.startsWith('http') ? identifier : `${this.BASE_URI}${identifier}`;
    return this.ontology.properties.get(uri);
  }

  /**
   * Get all classes
   */
  getAllClasses(): OntologyClass[] {
    return Array.from(this.ontology.classes.values());
  }

  /**
   * Get all properties
   */
  getAllProperties(): OntologyProperty[] {
    return Array.from(this.ontology.properties.values());
  }

  /**
   * Get classes by type (Work, Instance, Item, etc.)
   */
  getClassesByType(baseClass: string): OntologyClass[] {
    const baseUri = baseClass.startsWith('http') ? baseClass : `${this.BASE_URI}${baseClass}`;
    return this.getAllClasses().filter(c => 
      c.subClassOf?.includes(baseUri) || c.uri === baseUri
    );
  }

  /**
   * Get properties for a class
   */
  getPropertiesForClass(className: string): OntologyProperty[] {
    const classUri = className.startsWith('http') ? className : `${this.BASE_URI}${className}`;
    return this.getAllProperties().filter(p => 
      p.domain?.includes(classUri) || 
      p.usedWith === className ||
      (!p.domain && !p.usedWith) // Generic properties
    );
  }

  /**
   * Get Work-specific classes
   */
  getWorkClasses(): OntologyClass[] {
    return this.getClassesByType('Work');
  }

  /**
   * Get Instance-specific classes
   */
  getInstanceClasses(): OntologyClass[] {
    return this.getClassesByType('Instance');
  }

  /**
   * Get Item-specific classes
   */
  getItemClasses(): OntologyClass[] {
    return this.getClassesByType('Item');
  }

  /**
   * Get properties by category
   */
  getPropertiesByCategory(category: 'identification' | 'description' | 'relationship' | 'admin'): OntologyProperty[] {
    const properties = this.getAllProperties();
    
    switch (category) {
      case 'identification':
        return properties.filter(p => 
          p.label.toLowerCase().includes('identifier') ||
          p.label.toLowerCase().includes('title') ||
          p.uri.includes('identifiedBy')
        );
      case 'description':
        return properties.filter(p => 
          p.label.toLowerCase().includes('content') ||
          p.label.toLowerCase().includes('carrier') ||
          p.label.toLowerCase().includes('media') ||
          p.label.toLowerCase().includes('extent')
        );
      case 'relationship':
        return properties.filter(p => 
          p.label.toLowerCase().includes('related') ||
          p.inverseOf !== undefined
        );
      case 'admin':
        return properties.filter(p => 
          p.label.toLowerCase().includes('metadata') ||
          p.label.toLowerCase().includes('status')
        );
      default:
        return [];
    }
  }

  /**
   * Load the BIBFRAME ontology
   * Based on the official BIBFRAME 3.0.1 specification from LC
   */
  private loadOntology(): BibframeOntology {
    const classes = new Map<string, OntologyClass>();
    const properties = new Map<string, OntologyProperty>();

    // Load all BIBFRAME 3.0.1 classes (200+ classes)
    this.loadClasses(classes);
    
    // Load all BIBFRAME 3.0.1 properties (200+ properties)
    this.loadProperties(properties);

    return {
      version: this.VERSION,
      versionIRI: 'http://id.loc.gov/ontologies/bibframe-3-0-1/',
      priorVersionIRI: 'http://id.loc.gov/ontologies/bibframe-3-0-0/',
      classes,
      properties,
      deprecatedClasses: ['WorkTitle', 'InstanceTitle'],
      deprecatedProperties: ['organization', 'barcode', 'otherEditionOf', 'contributor', 'musicKey', 'musicOpusNumber', 'musicSerialNumber', 'musicThematicNumber'],
    };
  }

  /**
   * Load all BIBFRAME classes from the ontology
   */
  private loadClasses(classes: Map<string, OntologyClass>): void {
    // Core Model Classes
    this.addClass(classes, 'Work', {
      label: 'Work',
      definition: 'Resource reflecting a conceptual essence of a cataloging resource',
      subClassOf: [],
      properties: ['hasInstance', 'content', 'language', 'subject', 'contribution', 'title'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Instance', {
      label: 'Instance',
      definition: 'Resource reflecting an individual, material embodiment of a Work',
      subClassOf: [],
      properties: ['instanceOf', 'hasItem', 'carrier', 'media', 'provisionActivity'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Item', {
      label: 'Item',
      definition: 'Single example of an Instance',
      subClassOf: [],
      properties: ['itemOf', 'heldBy', 'shelfMark'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Hub', {
      label: 'Hub',
      definition: 'An abstract resource that functions as a bridge between two Works',
      subClassOf: [],
      changeNotes: [{ date: '2021-06-09', note: 'New (GH75)' }],
    });

    this.addClass(classes, 'Agent', {
      label: 'Agent',
      definition: 'Entity having a role in a resource, such as a person or organization',
      subClassOf: [],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/rwo/agents/',
    });

    // Work Subclasses
    this.addClass(classes, 'Text', {
      label: 'Text',
      definition: 'Resource intended to be perceived visually and understood through the use of language in written or spoken form',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'NotatedMusic', {
      label: 'Notated music',
      definition: 'Graphic, non-realized representations of musical works intended to be perceived visually',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'NotatedMovement', {
      label: 'Notated movement',
      definition: 'Graphic, non-realized representations of movement intended to be perceived visually, e.g. dance',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Cartography', {
      label: 'Cartography',
      definition: 'Resource that shows spatial information, including maps, atlases, globes, digital, and other cartographic resources',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Audio', {
      label: 'Audio',
      definition: 'Resources expressed in an audible form, including music or other sounds',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'MusicAudio', {
      label: 'Music audio',
      definition: 'Music resource expressed in an audible form',
      subClassOf: ['Audio'],
      changeNotes: [{ date: '2022-10-03', note: 'New (GH91)' }],
    });

    this.addClass(classes, 'NonMusicAudio', {
      label: 'Non-music audio',
      definition: 'Resource expressed in an audible form, including spoken word and other non-musical sounds',
      subClassOf: ['Audio'],
      changeNotes: [{ date: '2022-10-03', note: 'New (GH91)' }],
    });

    this.addClass(classes, 'MovingImage', {
      label: 'Moving image',
      definition: 'Images intended to be perceived as moving, including motion pictures (using live action and/or animation) or video recordings of performances or events',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'StillImage', {
      label: 'Still image',
      definition: 'Resource expressed through line, shape, shading, etc., intended to be perceived visually as a still image or images in two dimensions',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Object', {
      label: 'Three-dimensional object',
      definition: 'Resource in a form intended to be perceived visually in three-dimensions',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Dataset', {
      label: 'Dataset',
      definition: 'Data encoded in a defined structure, including numeric data, environmental data, etc.',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Multimedia', {
      label: 'Software or multimedia',
      definition: 'Electronic resource which is a computer program or consists of multiple media types that are software driven',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'MixedMaterial', {
      label: 'Mixed material',
      definition: 'Resource comprised of multiple types which is not driven by software',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Kit', {
      label: 'Kit',
      definition: 'Resource that contains a mixture of various components issued as a unit and intended primarily for instructional purposes',
      subClassOf: ['MixedMaterial'],
      changeNotes: [{ date: '2022-10-03', note: 'New (GH91)' }],
    });

    this.addClass(classes, 'Collection', {
      label: 'Collection',
      definition: 'Aggregation of resources, generally gathered together artificially',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Manuscript', {
      label: 'Manuscript',
      definition: 'Resource which is written in handwriting or typescript',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Arrangement', {
      label: 'Arrangement',
      definition: 'Resource that represents an arrangement of another resource',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Monograph', {
      label: 'Monograph',
      definition: 'Resource that is issued as a single physical unit or intangible single logical unit',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2022-10-03', note: 'New (GH91)' }],
    });

    this.addClass(classes, 'Serial', {
      label: 'Serial',
      definition: 'Resource that is issued in successive parts, usually numbered, that has no predetermined conclusion',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2022-10-03', note: 'New (GH91)' }],
    });

    this.addClass(classes, 'Integrating', {
      label: 'Integrating resource',
      definition: 'Resource that is added to or changed by updates that do not remain discrete but are integrated into the whole',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2022-10-03', note: 'New (GH91)' }],
    });

    this.addClass(classes, 'Series', {
      label: 'Series',
      definition: 'Resource with a collective title that applies to a group of separate resources',
      subClassOf: ['Work'],
      changeNotes: [{ date: '2022-10-03', note: 'New (GH91)' }],
    });

    // Instance Subclasses
    this.addClass(classes, 'Print', {
      label: 'Printed',
      definition: 'Resource that is printed',
      subClassOf: ['Instance'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Electronic', {
      label: 'Electronic',
      definition: 'Resource that is intended for manipulation by a computer, accessed either directly or remotely',
      subClassOf: ['Instance'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Archival', {
      label: 'Archival controlled',
      definition: 'Resources organically created, accumulated, and/or used by a person, family, or organization',
      subClassOf: ['Instance'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Tactile', {
      label: 'Tactile material',
      definition: 'Resource that is intended to be perceived by touch',
      subClassOf: ['Instance'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Microform', {
      label: 'Microform',
      definition: 'Resource that contains microimages, either transparent or opaque',
      subClassOf: ['Instance'],
      changeNotes: [{ date: '2023-11-30', note: 'New (GH101)' }],
    });

    // Agent Subclasses
    this.addClass(classes, 'Person', {
      label: 'Person',
      definition: 'Individual or identity established by an individual',
      subClassOf: ['Agent'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Organization', {
      label: 'Organization',
      definition: 'Corporation or group of persons and/or organizations that acts as a unit',
      subClassOf: ['Agent'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/organizations/',
    });

    this.addClass(classes, 'Meeting', {
      label: 'Meeting',
      definition: 'Gathering of individuals or representatives of various bodies',
      subClassOf: ['Agent'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Family', {
      label: 'Family',
      definition: 'Two or more persons related by birth, marriage, adoption, civil union, or similar legal status',
      subClassOf: ['Agent'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Jurisdiction', {
      label: 'Jurisdiction',
      definition: 'Legal or political unit administering a geographic area',
      subClassOf: ['Agent'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    // Title Classes
    this.addClass(classes, 'Title', {
      label: 'Title entity',
      definition: 'Title information relating to a resource',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'VariantTitle', {
      label: 'Title variation',
      definition: 'Title associated with the resource that is different from the Work or Instance title',
      subClassOf: ['Title'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'AbbreviatedTitle', {
      label: 'Abbreviated title',
      definition: 'Title as abbreviated for citation, indexing, and/or identification',
      subClassOf: ['VariantTitle'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'KeyTitle', {
      label: 'Key title',
      definition: 'Unique title for a continuing resource assigned by the ISSN International Center',
      subClassOf: ['VariantTitle'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'ParallelTitle', {
      label: 'Parallel title proper',
      definition: 'Title in another language and/or script',
      subClassOf: ['VariantTitle'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'CollectiveTitle', {
      label: 'Collective title',
      definition: 'Title for a compilation of resources',
      subClassOf: ['VariantTitle'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'TransliteratedTitle', {
      label: 'Transliterated title',
      definition: 'Title transliterated from one script to another',
      subClassOf: ['VariantTitle'],
      changeNotes: [{ date: '2023-11-30', note: 'New (GH104)' }],
    });

    // Identifier Classes
    this.addClass(classes, 'Identifier', {
      label: 'Identifier',
      definition: 'Token or name that is associated with a resource, such as a URI or an ISBN',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/identifiers',
    });

    this.addClass(classes, 'Lccn', {
      label: 'LCCN',
      definition: 'Library of Congress Control Number that identifies a resource description',
      subClassOf: ['Identifier'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Isbn', {
      label: 'ISBN',
      definition: 'International Standard Book Number',
      subClassOf: ['Identifier'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Issn', {
      label: 'ISSN',
      definition: 'International Standard Serial Number',
      subClassOf: ['Identifier'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Doi', {
      label: 'DOI',
      definition: 'Digital Object Identifier',
      subClassOf: ['Identifier'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    // Administrative Metadata Classes
    this.addClass(classes, 'AdminMetadata', {
      label: 'Administrative metadata',
      definition: 'Metadata about the metadata, especially provenance information',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Status', {
      label: 'Status',
      definition: 'Designation of the validity or position of something',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/mstatus/',
    });

    // Classification Classes
    this.addClass(classes, 'Classification', {
      label: 'Classification entity',
      definition: 'System of coding and organizing materials according to their subject',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'ClassificationLcc', {
      label: 'LCC Classification',
      definition: 'Library of Congress Classification number used for subject access',
      subClassOf: ['Classification'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'ClassificationDdc', {
      label: 'DDC Classification',
      definition: 'Dewey Decimal Classification number used for subject access',
      subClassOf: ['Classification'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'ClassificationNlm', {
      label: 'NLM classification',
      definition: 'National Library of Medicine Classification number',
      subClassOf: ['Classification'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    // Contribution Classes
    this.addClass(classes, 'Contribution', {
      label: 'Contribution',
      definition: 'Agent and role with respect to the resource being described',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'PrimaryContribution', {
      label: 'Primary contribution',
      definition: 'Contribution for which the agent is the name chosen as the name part of the access point',
      subClassOf: ['Contribution'],
      changeNotes: [{ date: '2023-11-30', note: 'New (GH104)' }],
    });

    this.addClass(classes, 'Role', {
      label: 'Role',
      definition: 'Function played or provided by a contributor',
      changeNotes: [{ date: '2017-02-03', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/relators/',
    });

    // Provision Activity Classes
    this.addClass(classes, 'ProvisionActivity', {
      label: 'Provider entity',
      definition: 'Information about the agent or place relating to the publication, printing, distribution, issue, release, or production',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Publication', {
      label: 'Publisher',
      definition: 'Information relating to publication of a resource',
      subClassOf: ['ProvisionActivity'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Production', {
      label: 'Producer',
      definition: 'Information relating to production of a resource',
      subClassOf: ['ProvisionActivity'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Distribution', {
      label: 'Distributor',
      definition: 'Information relating to distribution of a resource',
      subClassOf: ['ProvisionActivity'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Manufacture', {
      label: 'Manufacturer',
      definition: 'Information relating to manufacture of a resource',
      subClassOf: ['ProvisionActivity'],
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    // Content Description Classes
    this.addClass(classes, 'Content', {
      label: 'Content type',
      definition: 'Categorization reflecting the fundamental form of communication',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/contentTypes/',
    });

    this.addClass(classes, 'Media', {
      label: 'Media type',
      definition: 'Categorization reflecting the general type of intermediation device required',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/mediaTypes/',
    });

    this.addClass(classes, 'Carrier', {
      label: 'Carrier type',
      definition: 'Categorization reflecting the format of the storage medium and housing',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/carriers/',
    });

    this.addClass(classes, 'Issuance', {
      label: 'Mode of issuance',
      definition: 'Information about whether a resource is issued in one or more parts',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/issuance/',
    });

    // Subject Access Classes
    this.addClass(classes, 'Topic', {
      label: 'Topic',
      definition: 'Concept or area of knowledge',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'Place', {
      label: 'Place',
      definition: 'Geographic location',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/countries/',
    });

    this.addClass(classes, 'Temporal', {
      label: 'Temporal concept',
      definition: 'Chronological period',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'GenreForm', {
      label: 'Genre/form',
      definition: 'Form category or genre to which a resource belongs',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/authorities/genreForms/',
    });

    this.addClass(classes, 'Language', {
      label: 'Language entity',
      definition: 'Language entity',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/languages/',
    });

    // Note Classes
    this.addClass(classes, 'Note', {
      label: 'Note',
      definition: 'Information, usually in textual form, on attributes of a resource',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'http://id.loc.gov/vocabulary/mnotetype/',
    });

    this.addClass(classes, 'Summary', {
      label: 'Summary',
      definition: 'Description of the content of a resource',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addClass(classes, 'TableOfContents', {
      label: 'Table of contents',
      definition: 'Table of contents of a resource',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    // Add more classes as needed... (This is a subset of the 200+ classes)
  }

  /**
   * Helper method to add a class
   */
  private addClass(
    classes: Map<string, OntologyClass>,
    name: string,
    data: Omit<OntologyClass, 'uri'>
  ): void {
    const uri = `${this.BASE_URI}${name}`;
    classes.set(uri, {
      uri,
      ...data,
    });
  }

  /**
   * Load all BIBFRAME properties from the ontology
   */
  private loadProperties(properties: Map<string, OntologyProperty>): void {
    // Core relationship properties
    this.addProperty(properties, 'hasInstance', {
      label: 'Instance of Work',
      definition: 'Instance is related to described Work',
      domain: ['Work'],
      range: ['Instance'],
      inverseOf: 'instanceOf',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'instanceOf', {
      label: 'Instance of',
      definition: 'Work the Instance described instantiates or manifests',
      domain: ['Instance'],
      range: ['Work'],
      inverseOf: 'hasInstance',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'hasItem', {
      label: 'Has holding',
      definition: 'Item which is an example of the described Instance',
      domain: ['Instance'],
      range: ['Item'],
      inverseOf: 'itemOf',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'itemOf', {
      label: 'Holding for',
      definition: 'Instance for which the described Item is an example',
      domain: ['Item'],
      range: ['Instance'],
      inverseOf: 'hasItem',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    // Title properties
    this.addProperty(properties, 'title', {
      label: 'Title resource',
      definition: 'Name given to a resource',
      expectedValue: 'Title',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'mainTitle', {
      label: 'Main title',
      definition: 'Title being addressed',
      usedWith: 'Title',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'subtitle', {
      label: 'Subtitle',
      definition: 'Word, character, or group of words that contains the remainder of the title',
      usedWith: 'Title',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'partName', {
      label: 'Part title',
      definition: 'Part or section name of a title',
      usedWith: 'Title',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'partNumber', {
      label: 'Part number',
      definition: 'Part or section enumeration of a title',
      usedWith: 'Title',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    // Contribution properties
    this.addProperty(properties, 'contribution', {
      label: 'Contributor and role',
      definition: 'Agent and its role in relation to the resource',
      expectedValue: 'Contribution',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'agent', {
      label: 'Associated agent',
      definition: 'Entity associated with a resource',
      expectedValue: 'Agent',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/rwo/agents/',
    });

    this.addProperty(properties, 'role', {
      label: 'Contributor role',
      definition: 'Function provided by a contributor',
      usedWith: 'Contribution',
      expectedValue: 'Role',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/relators/',
    });

    // Subject properties
    this.addProperty(properties, 'subject', {
      label: 'Subject',
      definition: 'Subject term(s) describing a resource',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'genreForm', {
      label: 'Genre/form',
      definition: 'Form category or genre to which a resource belongs',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/authorities/genreForms/',
    });

    this.addProperty(properties, 'geographicCoverage', {
      label: 'Geographic coverage',
      definition: 'Geographic coverage of the content of the resource',
      expectedValue: 'GeographicCoverage',
      changeNotes: [{ date: '2017-02-06', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/geographicAreas/',
    });

    this.addProperty(properties, 'temporalCoverage', {
      label: 'Temporal coverage',
      definition: 'Time period coverage of the content',
      usedWith: 'Work',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    // Content description properties
    this.addProperty(properties, 'content', {
      label: 'Content type',
      definition: 'Categorization reflecting the fundamental form of communication',
      usedWith: 'Work',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/contentTypes/',
    });

    this.addProperty(properties, 'media', {
      label: 'Media type',
      definition: 'Categorization reflecting the general type of intermediation device required',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/mediaTypes/',
    });

    this.addProperty(properties, 'carrier', {
      label: 'Carrier type',
      definition: 'Categorization reflecting the format of the storage medium and housing',
      usedWith: 'Instance',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/carriers/',
    });

    this.addProperty(properties, 'issuance', {
      label: 'Mode of issuance',
      definition: 'Categorization reflecting whether a resource is issued in one or more parts',
      expectedValue: 'Issuance',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/issuance/',
    });

    // Language and place
    this.addProperty(properties, 'language', {
      label: 'Language information',
      definition: 'Language associated with a resource',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/languages/',
    });

    this.addProperty(properties, 'place', {
      label: 'Place',
      definition: 'Geographic location or place entity associated with a resource',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/countries/',
    });

    // Classification properties
    this.addProperty(properties, 'classification', {
      label: 'Classification',
      definition: 'Classification number in any scheme',
      expectedValue: 'Classification',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'classificationPortion', {
      label: 'Classification number',
      definition: 'Classification number that indicates the subject',
      usedWith: 'Classification',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'itemPortion', {
      label: 'Classification item number',
      definition: 'Number attached to a classification string that indicates a particular item',
      usedWith: 'Classification',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    // Identifier properties
    this.addProperty(properties, 'identifiedBy', {
      label: 'Identifier',
      definition: 'Character string associated with a resource that serves to differentiate that resource',
      expectedValue: 'Identifier',
      inverseOf: 'identifies',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    // Provision activity properties
    this.addProperty(properties, 'provisionActivity', {
      label: 'Provision activity',
      definition: 'Place, name, and/or date information relating to publication, distribution, etc.',
      usedWith: 'Instance',
      expectedValue: 'ProvisionActivity',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'provisionActivityStatement', {
      label: 'Provider statement',
      definition: 'Statement relating to providers of a resource',
      usedWith: 'Instance',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'responsibilityStatement', {
      label: 'Creative responsibility statement',
      definition: 'Statement relating to persons or organizations responsible for creation',
      usedWith: 'Instance',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    // Physical description properties
    this.addProperty(properties, 'extent', {
      label: 'Extent',
      definition: 'Number and type of units and/or subunits making up a resource',
      expectedValue: 'Extent',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'dimensions', {
      label: 'Dimensions',
      definition: 'Measurements of the carrier or carriers',
      usedWith: 'Instance',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    // Note properties
    this.addProperty(properties, 'note', {
      label: 'Note',
      definition: 'General textual information relating to a resource',
      expectedValue: 'Note',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'summary', {
      label: 'Summary content',
      definition: 'Summary or abstract of the resource described',
      expectedValue: 'Summary',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'tableOfContents', {
      label: 'Table of contents content',
      definition: 'Table of contents of the described resource',
      expectedValue: 'TableOfContents',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    // Administrative metadata properties
    this.addProperty(properties, 'adminMetadata', {
      label: 'Administrative metadata',
      definition: 'Metadata about the metadata',
      expectedValue: 'AdminMetadata',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    this.addProperty(properties, 'status', {
      label: 'Status',
      definition: 'Designation of the validity or position of something',
      expectedValue: 'Status',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/mstatus/',
    });

    this.addProperty(properties, 'descriptionConventions', {
      label: 'Description conventions',
      definition: 'Rules used for the descriptive content',
      usedWith: 'AdminMetadata',
      expectedValue: 'DescriptionConventions',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
      controlledList: 'https://id.loc.gov/vocabulary/descriptionConventions/',
    });

    this.addProperty(properties, 'descriptionLanguage', {
      label: 'Description language',
      definition: 'Language used for the metadata',
      usedWith: 'AdminMetadata',
      expectedValue: 'Language',
      changeNotes: [{ date: '2016-04-21', note: 'New' }],
    });

    // Add more properties as needed... (This is a subset of the 200+ properties)
  }

  /**
   * Helper method to add a property
   */
  private addProperty(
    properties: Map<string, OntologyProperty>,
    name: string,
    data: Omit<OntologyProperty, 'uri'>
  ): void {
    const uri = `${this.BASE_URI}${name}`;
    properties.set(uri, {
      uri,
      ...data,
    });
  }
}

// Export singleton instance
export const bibframeOntologyCore = new BibframeOntologyCore();

// Export class for testing
export { BibframeOntologyCore };
