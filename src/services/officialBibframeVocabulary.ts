/**
 * Official Library of Congress BIBFRAME 3.0.1 Vocabulary & Ontology
 * Generated directly from official LOC RDF schema: D:/New foltdftrdr/bibframe.rdf
 * Specification: https://id.loc.gov/ontologies/bibframe.html
 * Version: 3.0.1
 */

export interface OfficialBFClass {
  uri: string;
  name: string;
  label: string;
  definition: string;
  subClassOf: string[];
}

export interface OfficialBFProperty {
  uri: string;
  name: string;
  type: 'object' | 'datatype';
  label: string;
  definition: string;
  domains: string[];
  domainNames: string[];
  ranges: string[];
  rangeNames: string[];
  subPropertyOf: string[];
}

export const OFFICIAL_BIBFRAME_CLASSES: OfficialBFClass[] = [
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/DescriptionLevel",
    "name": "DescriptionLevel",
    "label": "Description level",
    "definition": "Designation of the descriptive content of the metadata",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Relationship",
    "name": "Relationship",
    "label": "Relationship",
    "definition": "Type of relationship between resources",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Work",
    "name": "Work",
    "label": "Work",
    "definition": "Resource reflecting a conceptual essence of a cataloging resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Instance",
    "name": "Instance",
    "label": "Instance",
    "definition": "Resource reflecting an individual, material embodiment of a Work",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Item",
    "name": "Item",
    "label": "Item",
    "definition": "Single example of an Instance",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Hub",
    "name": "Hub",
    "label": "Hub",
    "definition": "An abstract resource that functions as a bridge between two Works",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Text",
    "name": "Text",
    "label": "Text",
    "definition": "Resource intended to be perceived visually and understood through the use of language in written or spoken form",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Cartography",
    "name": "Cartography",
    "label": "Cartography",
    "definition": "Resource that shows spatial information, including maps, atlases, globes, digital, and other cartographic resources",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Audio",
    "name": "Audio",
    "label": "Audio",
    "definition": "Resources expressed in an audible form, including music or other sounds",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/NotatedMusic",
    "name": "NotatedMusic",
    "label": "Notated music",
    "definition": "Graphic, non-realized representations of musical works intended to be perceived visually",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/NotatedMovement",
    "name": "NotatedMovement",
    "label": "Notated movement",
    "definition": "Graphic, non-realized representations of movement intended to be perceived visually, e.g. dance",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Dataset",
    "name": "Dataset",
    "label": "Dataset",
    "definition": "Data encoded in a defined structure, including numeric data, environmental data, etc., used by applications software",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/StillImage",
    "name": "StillImage",
    "label": "Still image",
    "definition": "Resource expressed through line, shape, shading, etc., intended to be perceived visually as a still image or images in two dimensions, including two-dimensional images and slides and transparencies",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MovingImage",
    "name": "MovingImage",
    "label": "Moving image",
    "definition": "Images intended to be perceived as moving, including motion pictures (using live action and/or animation) or video recordings of performances or events",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Object",
    "name": "Object",
    "label": "Three-dimensional object",
    "definition": "Resource in a form intended to be perceived visually in three-dimensions, including man-made objects such as models, sculptures, clothing, and toys, as well as naturally occurring objects such as specimens mounted for viewing",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Multimedia",
    "name": "Multimedia",
    "label": "Software or multimedia",
    "definition": "Electronic resource which is a computer program or consists of multiple media types that are software driven, such as videogames",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MixedMaterial",
    "name": "MixedMaterial",
    "label": "Mixed material",
    "definition": "Resource comprised of multiple types which is not driven by software, e.g. an archival collection of text, photographs and sound recordings",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Print",
    "name": "Print",
    "label": "Printed",
    "definition": "Resource that is printed",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Manuscript",
    "name": "Manuscript",
    "label": "Manuscript",
    "definition": "Resource which is written in handwriting or typescript",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Archival",
    "name": "Archival",
    "label": "Archival controlled",
    "definition": "Resources organically created, accumulated, and/or used by a person, family, or organization in the course of conduct of affairs and preserved because of their continuing value",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Tactile",
    "name": "Tactile",
    "label": "Tactile material",
    "definition": "Resource that is intended to be perceived by touch",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Collection",
    "name": "Collection",
    "label": "Collection",
    "definition": "Aggregation of resources, generally gathered together artificially",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Electronic",
    "name": "Electronic",
    "label": "Electronic",
    "definition": "Resource that is intended for manipulation by a computer, accessed either directly or remotely",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Arrangement",
    "name": "Arrangement",
    "label": "Arrangement",
    "definition": "Resource that represents an arrangement of another resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MusicAudio",
    "name": "MusicAudio",
    "label": "Music audio",
    "definition": "Music resource expressed in an audible form",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Audio"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/NonMusicAudio",
    "name": "NonMusicAudio",
    "label": "Non-music audio",
    "definition": "Resource expressed in an audible form, including spoken word and other non-musical sounds",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Audio"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Integrating",
    "name": "Integrating",
    "label": "Integrating resource",
    "definition": "Resource that is added to or changed by updates that do not remain discrete but are integrated into the whole",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Kit",
    "name": "Kit",
    "label": "Kit",
    "definition": "Resource that contains a mixture of various components issued as a unit and intended primarily for instructional purposes",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/MixedMaterial"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Monograph",
    "name": "Monograph",
    "label": "Monograph",
    "definition": "Resource that is issued as a single physical unit or intangible single logical unit",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Serial",
    "name": "Serial",
    "label": "Serial",
    "definition": "Resource that is issued in successive parts, usually numbered, that has no predetermined conclusion",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Series",
    "name": "Series",
    "label": "Series",
    "definition": "Resource with a collective title that applies to a group of separate resources, each of which also has its own title",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Microform",
    "name": "Microform",
    "label": "Microform",
    "definition": "Resource that contains microimages, either transparent or opaque, that may be reproductions of existing textual or graphic materials or may be original publications",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Note",
    "name": "Note",
    "label": "Note",
    "definition": "Information, usually in textual form, on attributes of a resource or some aspect of a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Identifier",
    "name": "Identifier",
    "label": "Identifier",
    "definition": "Token or name that is associated with a resource, such as a URI or an ISBN",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Unit",
    "name": "Unit",
    "label": "Unit",
    "definition": "Units in which a value is expressed",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Role",
    "name": "Role",
    "label": "Role",
    "definition": "Function played or provided by a contributor, e.g., author or illustrator",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Source",
    "name": "Source",
    "label": "Source",
    "definition": "Resource from which value or label came or was derived",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Status",
    "name": "Status",
    "label": "Status",
    "definition": "Designation of the validity or position of something, e.g., whether something is incorrect or available",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Relation",
    "name": "Relation",
    "label": "Relation",
    "definition": "Associated resource and its relationship to the resource being described",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Agent",
    "name": "Agent",
    "label": "Agent",
    "definition": "Entity having a role in a resource, such as a person or organization",
    "subClassOf": [
      "http://xmlns.com/foaf/0.1/Agent"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Person",
    "name": "Person",
    "label": "Person",
    "definition": "Individual or identity established by an individual (either alone or in collaboration with one or more other individuals)",
    "subClassOf": [
      "http://xmlns.com/foaf/0.1/Person",
      "http://id.loc.gov/ontologies/bibframe/Agent"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Family",
    "name": "Family",
    "label": "Family",
    "definition": "Two or more persons related by birth, marriage, adoption, civil union, or similar legal status, or who otherwise present themselves as a family",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Agent"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Organization",
    "name": "Organization",
    "label": "Organization",
    "definition": "Corporation or group of persons and/or organizations that acts, or may act, as a unit",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Agent"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Jurisdiction",
    "name": "Jurisdiction",
    "label": "Jurisdiction",
    "definition": "Legal or political unit administering a geographic area",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Agent"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Meeting",
    "name": "Meeting",
    "label": "Meeting",
    "definition": "Gathering of individuals or representatives of various bodies for the purpose of discussing and/or acting on topics of common interest",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Agent"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Topic",
    "name": "Topic",
    "label": "Topic",
    "definition": "Concept or area of knowledge",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Temporal",
    "name": "Temporal",
    "label": "Temporal concept",
    "definition": "Chronological period",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Place",
    "name": "Place",
    "label": "Place",
    "definition": "Geographic location",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Event",
    "name": "Event",
    "label": "Event entity",
    "definition": "Something that happens at a certain time and location, such as a performance, speech, or athletic event",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Contribution",
    "name": "Contribution",
    "label": "Contribution",
    "definition": "Agent and role with respect to the resource being described",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/PrimaryContribution",
    "name": "PrimaryContribution",
    "label": "Primary contribution",
    "definition": "Contribution for which the agent is the name chosen as the name part of the name and title access point",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Contribution"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Content",
    "name": "Content",
    "label": "Content type",
    "definition": "Categorization reflecting the fundamental form of communication in which the content is expressed and the human sense through which it is intended to be perceived",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Media",
    "name": "Media",
    "label": "Media type",
    "definition": "Categorization reflecting the general type of intermediation device required to view, play, run, etc., the content of a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Carrier",
    "name": "Carrier",
    "label": "Carrier type",
    "definition": "Categorization reflecting the format of the storage medium and housing of a carrier",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/GenreForm",
    "name": "GenreForm",
    "label": "Genre/form",
    "definition": "Form category or genre to which a resource belongs",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Title",
    "name": "Title",
    "label": "Title entity",
    "definition": "Title information relating to a resource: work title, preferred title, instance title, transcribed title, translated title, variant form of title, etc.",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/VariantTitle",
    "name": "VariantTitle",
    "label": "Title variation",
    "definition": "Title associated with the resource that is different from the Work or Instance title",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Title"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/KeyTitle",
    "name": "KeyTitle",
    "label": "Key title",
    "definition": "Unique title for a continuing resource that is assigned by the ISSN International Center in conjunction with an ISSN",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/VariantTitle"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/AbbreviatedTitle",
    "name": "AbbreviatedTitle",
    "label": "Abbreviated title",
    "definition": "Title as abbreviated for citation, indexing, and/or identification",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/VariantTitle"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ParallelTitle",
    "name": "ParallelTitle",
    "label": "Parallel title proper",
    "definition": "Title in another language and/or script",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/VariantTitle"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/CollectiveTitle",
    "name": "CollectiveTitle",
    "label": "Collective title",
    "definition": "Title for a compilation of resources",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/VariantTitle"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/TransliteratedTitle",
    "name": "TransliteratedTitle",
    "label": "Transliterated title",
    "definition": "Title transliterated from one script to another",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/VariantTitle"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Language",
    "name": "Language",
    "label": "Language entity",
    "definition": "Language entity",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MusicMedium",
    "name": "MusicMedium",
    "label": "Music medium information",
    "definition": "Summary statement of the medium for a musical work",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MusicInstrument",
    "name": "MusicInstrument",
    "label": "Musical instrument",
    "definition": "Instrument for which a musical work is appropriate",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Ensemble",
    "name": "Ensemble",
    "label": "Ensemble",
    "definition": "Composition of the ensemble, including the size of the ensemble and the medium of performance components",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MusicEnsemble",
    "name": "MusicEnsemble",
    "label": "Music ensemble",
    "definition": "Ensemble for which a musical work is appropriate",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Ensemble"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MusicVoice",
    "name": "MusicVoice",
    "label": "Music voice",
    "definition": "Voice for which a musical work is appropriate",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/OpusNumber",
    "name": "OpusNumber",
    "label": "Opus number",
    "definition": "An opus number assigned to a musical work",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/SerialNumber",
    "name": "SerialNumber",
    "label": "Serial number",
    "definition": "A serial number assigned to a work",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ThematicCatalogNumber",
    "name": "ThematicCatalogNumber",
    "label": "Thematic catalog number",
    "definition": "A numeric or alphanumeric designation of a musical work as found in a thematic index or catalog",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/VideogamePlatformId",
    "name": "VideogamePlatformId",
    "label": "Videogame platform identifier",
    "definition": "An identifier assigned to a videogame platform",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/GeographicCoverage",
    "name": "GeographicCoverage",
    "label": "Geographic coverage",
    "definition": "Geographic coverage of the content of the resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/IntendedAudience",
    "name": "IntendedAudience",
    "label": "Intended audience information",
    "definition": "Information that identifies the specific intended or target audience or intellectual level for which the content described is considered appropriate; also used to record interest and motivation levels and special learner characteristics",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/CollectionArrangement",
    "name": "CollectionArrangement",
    "label": "Organization of materials information",
    "definition": "Information about the organization and arrangement of a collection of items",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Dissertation",
    "name": "Dissertation",
    "label": "Dissertation information",
    "definition": "Information about a work presented as part of the formal requirements for an academic degree",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Summary",
    "name": "Summary",
    "label": "Summary",
    "definition": "Description of the content of a resource, such as an abstract, summary, etc.",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Capture",
    "name": "Capture",
    "label": "Capture of content",
    "definition": "Information about place and date associated with the capture (i.e., recording, filming, etc.) of the content of a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Notation",
    "name": "Notation",
    "label": "Notation",
    "definition": "Information on the alphabet, script, or symbol system used to convey the content of the resource, including specialized scripts, typefaces, tactile notation, movement notation, and musical notation",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ContentAccessibility",
    "name": "ContentAccessibility",
    "label": "Content accessibility information",
    "definition": "Information that assists those with a sensory impairment for greater understanding of content, e.g., captions",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Script",
    "name": "Script",
    "label": "Script",
    "definition": "Information on the script, or symbol system used to convey the content of a text resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Notation"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MusicNotation",
    "name": "MusicNotation",
    "label": "Music notation",
    "definition": "Information on the symbol system used to convey the content of a music resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Notation"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/TactileNotation",
    "name": "TactileNotation",
    "label": "Tactile notation",
    "definition": "Information on the symbol system used to convey the content of a tactile resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Notation"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MovementNotation",
    "name": "MovementNotation",
    "label": "Movement notation",
    "definition": "Information on the symbol system used to convey the content of a movement resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Notation"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Illustration",
    "name": "Illustration",
    "label": "Illustrative content",
    "definition": "Information about content intended to illustrate a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/SupplementaryContent",
    "name": "SupplementaryContent",
    "label": "Supplementary material",
    "definition": "Index, bibliography, appendix, etc. intended to supplement the primary content of a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ColorContent",
    "name": "ColorContent",
    "label": "Color content",
    "definition": "Color characteristics of a resource, e.g., black and white, multicolored, etc.",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/SoundContent",
    "name": "SoundContent",
    "label": "Sound content",
    "definition": "Indication of whether the production of sound is an integral part of the resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/AspectRatio",
    "name": "AspectRatio",
    "label": "Aspect ratio",
    "definition": "Proportional relationship between an image's width and its height",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MusicFormat",
    "name": "MusicFormat",
    "label": "Notated music format",
    "definition": "Layout for content of a resource that is presented in the form of musical notation",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Scale",
    "name": "Scale",
    "label": "Scale",
    "definition": "Ratio of the dimensions of a form contained or embodied in a resource to the dimensions of the entity it represents, e.g., for images or cartographic resources",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Cartographic",
    "name": "Cartographic",
    "label": "Cartographic information",
    "definition": "Content that represents the whole or part of the earth, any celestial body, or imaginary place at any scale",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Projection",
    "name": "Projection",
    "label": "Projection",
    "definition": "Method or system used to represent the surface of the earth or of a celestial sphere on a plane",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Classification",
    "name": "Classification",
    "label": "Classification entity",
    "definition": "System of coding and organizing materials according to their subject",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ClassificationDdc",
    "name": "ClassificationDdc",
    "label": "DDC Classification",
    "definition": "Dewey Decimal Classification number used for subject access",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Classification"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ClassificationLcc",
    "name": "ClassificationLcc",
    "label": "LCC Classification",
    "definition": "Library of Congress Classification number used for subject access",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Classification"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ClassificationUdc",
    "name": "ClassificationUdc",
    "label": "UDC Classification",
    "definition": "Universal Decimal Classification number used for subject access",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Classification"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ClassificationNlm",
    "name": "ClassificationNlm",
    "label": "NLM classification",
    "definition": "National Library of Medicine Classification number used for subject access",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Classification"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ClassificationNal",
    "name": "ClassificationNal",
    "label": "NAL classification",
    "definition": "National Library of Agriculture number used for subject access",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Classification"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/DramaticRole",
    "name": "DramaticRole",
    "label": "Dramatic role",
    "definition": "The dramatic role performed by a contributing agent",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/EnsembleSize",
    "name": "EnsembleSize",
    "label": "Ensemble size",
    "definition": "A designation of the size of the individual musical ensemble",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/KeyMode",
    "name": "KeyMode",
    "label": "Key and mode",
    "definition": "Key and mode, or key only if no mode is present, of a music work",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MediumComponent",
    "name": "MediumComponent",
    "label": "Medium component",
    "definition": "An individual component of a medium of performance, gathering together the medium of performance, medium count, number of hands, and component qualifier",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MediumComponentQualifier",
    "name": "MediumComponentQualifier",
    "label": "Medium component qualifier",
    "definition": "Relates a medium component to a qualifier (solo, optional, etc.) that affects the medium component",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MediumOfPerformance",
    "name": "MediumOfPerformance",
    "label": "Medium of performance",
    "definition": "An individual instrument, voice, ensemble, or instrumental group",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Mode",
    "name": "Mode",
    "label": "Mode",
    "definition": "Mode (not associated with a key) of a musical work",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Tempo",
    "name": "Tempo",
    "label": "Tempo",
    "definition": "The speed of pace of a music work, whether declared in a score or performed",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Frequency",
    "name": "Frequency",
    "label": "Frequency",
    "definition": "Information about intervals at which the parts of a serially produced resource or the updates to an integrating resource are issued",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/PubFrequency",
    "name": "PubFrequency",
    "label": "Publication Frequency",
    "definition": "Information about the publication frequency of a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Issuance",
    "name": "Issuance",
    "label": "Mode of issuance",
    "definition": "Information about whether a resource is issued in one or more parts, the way it is updated, and its intended termination",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ProvisionActivity",
    "name": "ProvisionActivity",
    "label": "Provider entity",
    "definition": "Information about the agent or place relating to the publication, printing, distribution, issue, release, or production of a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Distribution",
    "name": "Distribution",
    "label": "Distributor",
    "definition": "Information relating to distribution of a resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/ProvisionActivity"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Manufacture",
    "name": "Manufacture",
    "label": "Manufacturer",
    "definition": "Information relating to manufacture of a resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/ProvisionActivity"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Publication",
    "name": "Publication",
    "label": "Publisher",
    "definition": "Information relating to publication of a resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/ProvisionActivity"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Production",
    "name": "Production",
    "label": "Producer",
    "definition": "Information relating to production of a resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/ProvisionActivity"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Modification",
    "name": "Modification",
    "label": "Modification",
    "definition": "Information relating to modification of a resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/ProvisionActivity"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/AcquisitionSource",
    "name": "AcquisitionSource",
    "label": "Acquisition source",
    "definition": "Information about an organization, person, etc., from which a resource may be obtained",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/CopyrightRegistration",
    "name": "CopyrightRegistration",
    "label": "Copyright registration",
    "definition": "Copyright or Legal Deposit registration information",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/CoverArt",
    "name": "CoverArt",
    "label": "Cover art",
    "definition": "Cover illustration of a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Review",
    "name": "Review",
    "label": "Review",
    "definition": "Review of a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/TableOfContents",
    "name": "TableOfContents",
    "label": "Table of contents",
    "definition": "Table of contents of a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Relief",
    "name": "Relief",
    "label": "Relief",
    "definition": "Relief term specified on a cartographic resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/CaptureStorage",
    "name": "CaptureStorage",
    "label": "Capture and Storage Technique",
    "definition": "Specifies the sound capture and storage technique used on a sound recording resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/SoundCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Extent",
    "name": "Extent",
    "label": "Extent",
    "definition": "Number and type of units and/or subunits making up a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Material",
    "name": "Material",
    "label": "Material",
    "definition": "Substance or composition of the resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/BaseMaterial",
    "name": "BaseMaterial",
    "label": "Base material",
    "definition": "Underlying physical material of a resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Material"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/AppliedMaterial",
    "name": "AppliedMaterial",
    "label": "Applied material",
    "definition": "Physical or chemical substance applied to a base material of a resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Material"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Emulsion",
    "name": "Emulsion",
    "label": "Emulsion",
    "definition": "Suspension of light-sensitive chemicals used as a coating on a microfilm or microfiche, e.g., silver halide",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Mount",
    "name": "Mount",
    "label": "Mount",
    "definition": "Physical material or object used for the support or backing to which the base material of a resource has been attached",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ProductionMethod",
    "name": "ProductionMethod",
    "label": "Production method",
    "definition": "Process used to produce a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Generation",
    "name": "Generation",
    "label": "Generation",
    "definition": "Relationship between an original carrier and the carrier of a reproduction made from the original",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Layout",
    "name": "Layout",
    "label": "Layout",
    "definition": "Arrangement of text, images, tactile notation, etc., in a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/BookFormat",
    "name": "BookFormat",
    "label": "Book format",
    "definition": "Result of folding a printed sheet to form a gathering of leaves",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/FontSize",
    "name": "FontSize",
    "label": "Font size",
    "definition": "Size of the type used to represent the characters and symbols in a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Polarity",
    "name": "Polarity",
    "label": "Polarity",
    "definition": "Relationship of the colors and tones in an image to the colors and tones of the object reproduced",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ReductionRatio",
    "name": "ReductionRatio",
    "label": "Reduction ratio",
    "definition": "Size of a micro-image in relation to the original from which it was produced",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Binding",
    "name": "Binding",
    "label": "Binding method",
    "definition": "Information about methods used to bind a published or unpublished resource, or other binding information",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/SoundCharacteristic",
    "name": "SoundCharacteristic",
    "label": "Sound characteristic",
    "definition": "Technical specification relating to the encoding of sound in a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/RecordingMethod",
    "name": "RecordingMethod",
    "label": "Type of recording",
    "definition": "Method used to encode audio content for playback, e.g., analog, digital",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/SoundCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/RecordingMedium",
    "name": "RecordingMedium",
    "label": "Recording medium",
    "definition": "Type of medium used to record sound on an audio carrier, e.g., magnetic, optical",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/SoundCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/PlayingSpeed",
    "name": "PlayingSpeed",
    "label": "Playing speed",
    "definition": "Speed at which an audio carrier must be operated to produce the sound intended, e.g., 78 rpm, 19 cm/s",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/SoundCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/GrooveCharacteristic",
    "name": "GrooveCharacteristic",
    "label": "Groove characteristic",
    "definition": "Groove width of an analog disc or the groove pitch of an analog cylinder, e.g., coarse groove, microgroove",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/SoundCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/TrackConfig",
    "name": "TrackConfig",
    "label": "Track configuration",
    "definition": "Configuration of the audio track on a sound-track film, e.g., center track, edge track",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/SoundCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/TapeConfig",
    "name": "TapeConfig",
    "label": "Tape configuration",
    "definition": "Number of tracks on an audiotape, e.g., 12 track",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/SoundCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/PlaybackChannels",
    "name": "PlaybackChannels",
    "label": "Configuration of playback channels",
    "definition": "Configuration/number of sound channels used to make a recording, such as one channel for a monophonic recording, e.g., mono, stereo, quadraphonic, surround",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/SoundCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/PlaybackCharacteristic",
    "name": "PlaybackCharacteristic",
    "label": "Special playback characteristics",
    "definition": "Equalization system, noise reduction system, etc., used in making an audio recording, e.g., CCIR standard, CX encoded, Dolby",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/SoundCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ProjectionCharacteristic",
    "name": "ProjectionCharacteristic",
    "label": "Projection characteristic",
    "definition": "Technical specification relating to the projection of a motion picture film",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/PresentationFormat",
    "name": "PresentationFormat",
    "label": "Presentation format",
    "definition": "Format used in the production of a projected image, e.g., Cinerama, IMAX",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/ProjectionCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ProjectionSpeed",
    "name": "ProjectionSpeed",
    "label": "Projection speed",
    "definition": "Speed at which a projected carrier must be operated to produce the moving image intended, e.g., 20 fps",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/ProjectionCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/VideoCharacteristic",
    "name": "VideoCharacteristic",
    "label": "Video characteristic",
    "definition": "Technical specification relating to the encoding of video images in a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/VideoFormat",
    "name": "VideoFormat",
    "label": "Video format",
    "definition": "Standard, etc., used to encode the analog video content of a resource, e.g., Beta, 8mm",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/VideoCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/BroadcastStandard",
    "name": "BroadcastStandard",
    "label": "Broadcast standard",
    "definition": "System used to format a video resource for television broadcast, e.g., HDTV, PAL",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/VideoCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/DigitalCharacteristic",
    "name": "DigitalCharacteristic",
    "label": "Digital characteristic",
    "definition": "Technical specification relating to the digital encoding of text, image, audio, video, and other types of data in a resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/FileType",
    "name": "FileType",
    "label": "File type",
    "definition": "General type of data content encoded in a computer file, e.g., text file, audio file",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/DigitalCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/EncodingFormat",
    "name": "EncodingFormat",
    "label": "Encoding format",
    "definition": "Schema, standard, etc., used to encode the digital content of a resource, e.g., MP3, XML, JPEG",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/DigitalCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/FileSize",
    "name": "FileSize",
    "label": "File size",
    "definition": "Number of bytes in a digital file, e.g., 162 KB",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/DigitalCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Resolution",
    "name": "Resolution",
    "label": "Resolution",
    "definition": "Clarity or fineness of detail in a digital image, expressed by the measurement of the image in pixels, etc., e.g., 3.1 megapixels",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/DigitalCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/RegionalEncoding",
    "name": "RegionalEncoding",
    "label": "Regional encoding",
    "definition": "Identification of the region of the world for which a videodisc has been encoded, e.g., region 4",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/DigitalCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/EncodedBitrate",
    "name": "EncodedBitrate",
    "label": "Encoded bitrate",
    "definition": "Speed at which streaming audio, video, etc., is designed to play, e.g., 32 kbps",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/DigitalCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/CartographicDataType",
    "name": "CartographicDataType",
    "label": "Digital cartographic data type",
    "definition": "Data type for encoding of geospatial information in a cartographic resource, e.g., raster, vector, point",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/DigitalCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/CartographicObjectType",
    "name": "CartographicObjectType",
    "label": "Digital cartographic object type",
    "definition": "Object type for encoding of geospatial information in a cartographic resource, e.g., point, line, polygon",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/DigitalCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ObjectCount",
    "name": "ObjectCount",
    "label": "Digital cartographic object count",
    "definition": "Number of objects in encoded geospatial information in a cartographic resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/DigitalCharacteristic"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/SystemRequirement",
    "name": "SystemRequirement",
    "label": "System Requirement",
    "definition": "Equipment or system requirements beyond what is normal and obvious for the type of carrier or type of file, such as make and model of equipment or hardware, operating system, amount of memory, programming language, other necessary software, any plug-ins or peripherals required to play, view, or run the resource",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/EnumerationAndChronology",
    "name": "EnumerationAndChronology",
    "label": "Enumeration and chronology",
    "definition": "Numbering or other enumeration and dates associated with issues or items held",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Enumeration",
    "name": "Enumeration",
    "label": "Enumeration",
    "definition": "Numbering or other enumeration associated with issues or items held",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/EnumerationAndChronology"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Chronology",
    "name": "Chronology",
    "label": "Chronology",
    "definition": "Dates associated with issues or items held",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/EnumerationAndChronology"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Sublocation",
    "name": "Sublocation",
    "label": "Sublocation",
    "definition": "Specific place within the holding entity where the item is located or made available",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ShelfMark",
    "name": "ShelfMark",
    "label": "Shelf location",
    "definition": "Piece/item identifier, such as a call or other type of number",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ShelfMarkDdc",
    "name": "ShelfMarkDdc",
    "label": "DDC call number",
    "definition": "Shelf mark based on Dewey Decimal Classification",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/ShelfMark"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ShelfMarkLcc",
    "name": "ShelfMarkLcc",
    "label": "LCC call number",
    "definition": "Shelf mark based on Library of Congress Classification",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/ShelfMark"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ShelfMarkUdc",
    "name": "ShelfMarkUdc",
    "label": "UDC call number",
    "definition": "Shelf mark based on Universal Decimal Classification",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/ShelfMark"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ShelfMarkNlm",
    "name": "ShelfMarkNlm",
    "label": "NLM call number",
    "definition": "Shelf mark based on National Library of Medicine Classification",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/ShelfMark"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/UsageAndAccessPolicy",
    "name": "UsageAndAccessPolicy",
    "label": "Use and access conditions",
    "definition": "General statement of allowances and restrictions on access to a resource, including retention, reproduction, access, and lending",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/AccessPolicy",
    "name": "AccessPolicy",
    "label": "Access policy",
    "definition": "Access restrictions and allowances regarding access to a resource, e.g., lending policy, access restrictions, embargos",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/UsageAndAccessPolicy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/UsePolicy",
    "name": "UsePolicy",
    "label": "Use policy",
    "definition": "Usage limitations placed on a resource with respect to reproduction, publication, exhibition, etc.",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/UsageAndAccessPolicy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/RetentionPolicy",
    "name": "RetentionPolicy",
    "label": "Retention policy",
    "definition": "Policy of holding institution for retaining resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/UsageAndAccessPolicy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ImmediateAcquisition",
    "name": "ImmediateAcquisition",
    "label": "Immediate acquisition",
    "definition": "Information about the circumstances, e.g., source, date, method, under which the resource was directly acquired",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/AccessionNumber",
    "name": "AccessionNumber",
    "label": "Accession number",
    "definition": "Accession Number",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Ansi",
    "name": "Ansi",
    "label": "ANSI number",
    "definition": "American National Standards Institute identifier",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/AudioIssueNumber",
    "name": "AudioIssueNumber",
    "label": "Audio issue number",
    "definition": "Number assigned by publishers of sound recordings to identify the issue designation, or serial identification, of the resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/AudioTake",
    "name": "AudioTake",
    "label": "Audio recording take",
    "definition": "Identifier assigned to the smallest identifiable unit of a recording session, e.g., a specific recording of an individual song",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Barcode",
    "name": "Barcode",
    "label": "Barcode",
    "definition": "Optical machine-readable representation of data relating to the item to which it is attached",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Coden",
    "name": "Coden",
    "label": "CODEN",
    "definition": "Identifier for scientific and technical periodical titles assigned by the International CODEN Section of Chemical Abstracts Service",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/CopyrightNumber",
    "name": "CopyrightNumber",
    "label": "Copyright-legal deposit number",
    "definition": "Identifier assigned to a copyright registration or legal deposit",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/DissertationIdentifier",
    "name": "DissertationIdentifier",
    "label": "Dissertation Identifier",
    "definition": "Identifier assigned to a thesis or dissertation for identification purposes",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Doi",
    "name": "Doi",
    "label": "DOI",
    "definition": "Digital Object Identifier",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Ean",
    "name": "Ean",
    "label": "EAN",
    "definition": "International Article Identifier",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Eidr",
    "name": "Eidr",
    "label": "EIDR",
    "definition": "Entertainment Identifier Registry",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Fingerprint",
    "name": "Fingerprint",
    "label": "Fingerprint identifier",
    "definition": "Identifier that is used to assist in the identification of antiquarian books by recording information comprising groups of characters taken from specified positions on specified pages of the book",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Gtin14Number",
    "name": "Gtin14Number",
    "label": "Global Trade Item Number 14",
    "definition": "14-digit number assigned to identify trade items as various packaging levels that encompasses EAN/UCC-128 and ITF-14",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Hdl",
    "name": "Hdl",
    "label": "Handle",
    "definition": "Unique and persistent identifier for digital objects developed by the Corporation for National Research Initiatives",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Isan",
    "name": "Isan",
    "label": "ISAN",
    "definition": "International Standard Audiovisual Number",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Isbn",
    "name": "Isbn",
    "label": "ISBN",
    "definition": "International Standard Book Number",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Ismn",
    "name": "Ismn",
    "label": "ISMN",
    "definition": "International Standard Music Number",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Isni",
    "name": "Isni",
    "label": "ISNI",
    "definition": "International Standard Name Identifier, a unique, persistent reference number for the identities of contributors to creative works",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Iso",
    "name": "Iso",
    "label": "ISO number",
    "definition": "International Organization for Standardization standard number",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Isrc",
    "name": "Isrc",
    "label": "ISRC",
    "definition": "International Standard Recording Code",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Issn",
    "name": "Issn",
    "label": "ISSN",
    "definition": "International Standard Serial Number",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/IssnL",
    "name": "IssnL",
    "label": "ISSN-L",
    "definition": "International Standard Serial Number that links together various media versions of a continuing resource",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Istc",
    "name": "Istc",
    "label": "ISTC",
    "definition": "International Standard Text Code, a numbering system developed to enable the unique identification of textual works",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Iswc",
    "name": "Iswc",
    "label": "ISWC",
    "definition": "International Standard Musical Work Code, a unique, persistent reference number for the identification of musical works",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/LcOverseasAcq",
    "name": "LcOverseasAcq",
    "label": "LC acquisition program",
    "definition": "Identification number assigned by the Library of Congress to works acquired through one of its collaborative overseas acquisition programs",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Lccn",
    "name": "Lccn",
    "label": "LCCN",
    "definition": "Library of Congress Control Number that identifies a resource description",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Local",
    "name": "Local",
    "label": "Local identifier",
    "definition": "Identifier established locally and not a standard number",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MatrixNumber",
    "name": "MatrixNumber",
    "label": "Audio matrix number",
    "definition": "Matrix identifier assigned to the master from which a specific sound recording was pressed",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MusicDistributorNumber",
    "name": "MusicDistributorNumber",
    "label": "Music distributor number",
    "definition": "Identifier appearing on a resource assigned by a distributor to a specific audio recording, notated music publication, music-related publication, or videorecording",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MusicPlate",
    "name": "MusicPlate",
    "label": "Music plate number",
    "definition": "Identifiers assigned by a music publisher or printer to the printing plates for the notated portion of a notated music publication, or an identifier that emulates the printing plate tradition in contemporary publications",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/MusicPublisherNumber",
    "name": "MusicPublisherNumber",
    "label": "Music publisher number",
    "definition": "Identifier assigned to a notated music publication other than an issue, matrix, or plate number",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Nbn",
    "name": "Nbn",
    "label": "NBN",
    "definition": "National Bibliography Number that identifies a resource description",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/OclcNumber",
    "name": "OclcNumber",
    "label": "OCLC number",
    "definition": "Identifier assigned by OCLC",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/PostalRegistration",
    "name": "PostalRegistration",
    "label": "Postal registration number",
    "definition": "Number assigned to a publication for which the specified postal service permits the use of a special mailing class privilege",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/PublisherNumber",
    "name": "PublisherNumber",
    "label": "Publisher number",
    "definition": "Number assigned by a publisher that is not one of the specific defined types",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ReportNumber",
    "name": "ReportNumber",
    "label": "Technical report number",
    "definition": "Identification number of a technical report that is not a Standard Technical Report Number",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Sici",
    "name": "Sici",
    "label": "SICI",
    "definition": "Serial Item and Contribution Identifier",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/StockNumber",
    "name": "StockNumber",
    "label": "Stock number",
    "definition": "Identification number used for stock purposes and assigned by agencies such as distributors, publishers, or vendors",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Strn",
    "name": "Strn",
    "label": "STRN",
    "definition": "Standard Technical Report Number",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/StudyNumber",
    "name": "StudyNumber",
    "label": "Study number",
    "definition": "Identification number for a computer data file",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Upc",
    "name": "Upc",
    "label": "UPC",
    "definition": "Universal Product Code",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/Urn",
    "name": "Urn",
    "label": "URN",
    "definition": "Uniform Resource Name",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/VideoRecordingNumber",
    "name": "VideoRecordingNumber",
    "label": "Video recording number",
    "definition": "Number assigned by a publisher to a video recording",
    "subClassOf": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/AdminMetadata",
    "name": "AdminMetadata",
    "label": "Administrative metadata",
    "definition": "Metadata about the metadata, especially provenance information",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/DescriptionConventions",
    "name": "DescriptionConventions",
    "label": "Description conventions",
    "definition": "Rules used for the descriptive content of the resource description",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/GenerationProcess",
    "name": "GenerationProcess",
    "label": "Generation process",
    "definition": "Indication of the program or process used to generate the description by application of a particular transformation",
    "subClassOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/DescriptionAuthentication",
    "name": "DescriptionAuthentication",
    "label": "Metadata authentication",
    "definition": "Indication of specific types of reviews that have been carried out on the description information",
    "subClassOf": []
  }
];

export const OFFICIAL_BIBFRAME_PROPERTIES: OfficialBFProperty[] = [
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/descriptionLevel",
    "name": "descriptionLevel",
    "type": "object",
    "label": "Description level",
    "definition": "Designation of the descriptive content of the metadata",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/AdminMetadata"
    ],
    "domainNames": [
      "AdminMetadata"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/DescriptionLevel"
    ],
    "rangeNames": [
      "DescriptionLevel"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/identifiedBy",
    "name": "identifiedBy",
    "type": "object",
    "label": "Identifier",
    "definition": "Character string associated with a resource that serves to differentiate that resource from other resources, i.e., that uniquely identifies an entity.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ],
    "rangeNames": [
      "Identifier"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/identifies",
    "name": "identifies",
    "type": "object",
    "label": "Resource identified",
    "definition": "Resource that is associated with a character string that serves to differentiate one resource from another.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Identifier"
    ],
    "domainNames": [
      "Identifier"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/qualifier",
    "name": "qualifier",
    "type": "datatype",
    "label": "Qualifier",
    "definition": "Qualifier of information, such as an addition to a title to make it unique or qualifying information associated with an identifier.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/adminMetadata",
    "name": "adminMetadata",
    "type": "object",
    "label": "Administrative metadata",
    "definition": "Metadata about the metadata, especially provenance information.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/AdminMetadata"
    ],
    "rangeNames": [
      "AdminMetadata"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/adminMetadataFor",
    "name": "adminMetadataFor",
    "type": "object",
    "label": "Administrative metadata for",
    "definition": "Relates an Administrative metadata resource to the resource it captures information about.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/AdminMetadata"
    ],
    "domainNames": [
      "AdminMetadata"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/noteFor",
    "name": "noteFor",
    "type": "object",
    "label": "Note for",
    "definition": "Relates a Note resource to the resource to which the note pertains.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Note"
    ],
    "domainNames": [
      "Note"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/date",
    "name": "date",
    "type": "datatype",
    "label": "Date",
    "definition": "Date designation associated with a resource or element of description, such as date of title variation; year a degree was awarded; date associated with the publication, printing, distribution, issue, release or production of a resource. May be date typed.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/place",
    "name": "place",
    "type": "object",
    "label": "Place",
    "definition": "Geographic location or place entity associated with a resource or element of description, such as the place associated with the publication, printing, distribution, issue, release or production of a resource, place of an event.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/agent",
    "name": "agent",
    "type": "object",
    "label": "Associated agent",
    "definition": "Entity associated with a resource or element of description, such as the name of the entity responsible for the content or of the publication, printing, distribution, issue, release or production of a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/agentOf",
    "name": "agentOf",
    "type": "object",
    "label": "Associated agent of",
    "definition": "Property relating an agent, such as an entity responsible for the content or of the publication, printing, distribution, issue, release or production, to another resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/count",
    "name": "count",
    "type": "datatype",
    "label": "Number of units",
    "definition": "Number associated with a measure of units, such as the number of units and/or subunits making up a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/unit",
    "name": "unit",
    "type": "object",
    "label": "Type of unit",
    "definition": "Units in which a value is expressed, such as the physical or logical constituent of a resource (e.g., a volume, audiocassette, film reel, a map, a digital file).",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Unit"
    ],
    "rangeNames": [
      "Unit"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/code",
    "name": "code",
    "type": "datatype",
    "label": "Code",
    "definition": "String of characters that serves as a code representing information.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/assigner",
    "name": "assigner",
    "type": "object",
    "label": "Assigner",
    "definition": "Entity that assigned the metadata, such as the entity that assigned a classification number, entity that assigned a name, entity that assigned an identifier.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Agent"
    ],
    "rangeNames": [
      "Agent"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/source",
    "name": "source",
    "type": "object",
    "label": "Source",
    "definition": "Resource from which value or label came or was derived, such as the formal source/scheme from which a classification number is taken or derived, list from which an agent name is taken or derived, source within which an identifier is unique.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Source"
    ],
    "rangeNames": [
      "Source"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/note",
    "name": "note",
    "type": "object",
    "label": "Note",
    "definition": "General textual information relating to a resource, such as Information about a specific copy of a resource or information about a particular attribute of a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Note"
    ],
    "rangeNames": [
      "Note"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/status",
    "name": "status",
    "type": "object",
    "label": "Status",
    "definition": "Designation of the validity or position of something, such as indication that the classification number is canceled or invalid, circulation availability of an item, indication of whether the identifier is canceled or invalid.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Status"
    ],
    "rangeNames": [
      "Status"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/part",
    "name": "part",
    "type": "datatype",
    "label": "Part",
    "definition": "Part of a resource to which information applies.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/language",
    "name": "language",
    "type": "object",
    "label": "Language information",
    "definition": "Language associated with a resource or its parts.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/content",
    "name": "content",
    "type": "object",
    "label": "Content type",
    "definition": "Categorization reflecting the fundamental form of communication in which the content is expressed and the human sense through which it is intended to be perceived.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/media",
    "name": "media",
    "type": "object",
    "label": "Media type",
    "definition": "Categorization reflecting the general type of intermediation device required to view, play, run, etc., the content of a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/carrier",
    "name": "carrier",
    "type": "object",
    "label": "Carrier type",
    "definition": "Categorization reflecting the format of the storage medium and housing of a carrier.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/genreForm",
    "name": "genreForm",
    "type": "object",
    "label": "Genre/form",
    "definition": "Form category or genre to which a resource belongs",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/title",
    "name": "title",
    "type": "object",
    "label": "Title resource",
    "definition": "Name given to a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Title"
    ],
    "rangeNames": [
      "Title"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/titleOf",
    "name": "titleOf",
    "type": "object",
    "label": "Title of",
    "definition": "Relates a title resource to that which it is the title of.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Title"
    ],
    "domainNames": [
      "Title"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/mainTitle",
    "name": "mainTitle",
    "type": "datatype",
    "label": "Main title",
    "definition": "Title being addressed. Possible title component.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Title"
    ],
    "domainNames": [
      "Title"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/subtitle",
    "name": "subtitle",
    "type": "datatype",
    "label": "Subtitle",
    "definition": "Word, character, or group of words and/or characters that contains the remainder of the title after the main title. Possible title component.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Title"
    ],
    "domainNames": [
      "Title"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/partNumber",
    "name": "partNumber",
    "type": "datatype",
    "label": "Part number",
    "definition": "Part or section enumeration of a title. Possible title component.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Title"
    ],
    "domainNames": [
      "Title"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/partName",
    "name": "partName",
    "type": "datatype",
    "label": "Part title",
    "definition": "Part or section name of a title. Possible title component.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Title"
    ],
    "domainNames": [
      "Title"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/variantType",
    "name": "variantType",
    "type": "datatype",
    "label": "Variant title type",
    "definition": "Type of title variation, e.g., acronym, cover, spine, earlier, later, series version.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/VariantTitle"
    ],
    "domainNames": [
      "VariantTitle"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/originDate",
    "name": "originDate",
    "type": "datatype",
    "label": "Origin date",
    "definition": "Date or date range associated with the creation of a Work.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/date"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/originPlace",
    "name": "originPlace",
    "type": "object",
    "label": "Origin place",
    "definition": "Place from which the creation of the resource originated.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/place"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/historyOfWork",
    "name": "historyOfWork",
    "type": "datatype",
    "label": "History of the work",
    "definition": "Information about the history of a Work.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/musicMedium",
    "name": "musicMedium",
    "type": "object",
    "label": "Music medium",
    "definition": "Instrumental, vocal, and/or other medium of performance for which a musical resource was originally conceived, written or performed.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/MusicMedium"
    ],
    "rangeNames": [
      "MusicMedium"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/instrument",
    "name": "instrument",
    "type": "object",
    "label": "Instrument",
    "definition": "Instrument for which a musical Work is appropriate.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/MusicInstrument"
    ],
    "rangeNames": [
      "MusicInstrument"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/instrumentalType",
    "name": "instrumentalType",
    "type": "datatype",
    "label": "Instrument role",
    "definition": "Specific role of instrument, such as alternate, doubling, solo, ensemble.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/MusicInstrument"
    ],
    "domainNames": [
      "MusicInstrument"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ensemble",
    "name": "ensemble",
    "type": "object",
    "label": "Ensemble",
    "definition": "Composition of the ensemble applicable to the Work.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Ensemble"
    ],
    "rangeNames": [
      "Ensemble"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ensembleType",
    "name": "ensembleType",
    "type": "datatype",
    "label": "Ensemble type",
    "definition": "Specific type of ensemble, such as orchestra, band, guitar ensemble.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Ensemble"
    ],
    "domainNames": [
      "Ensemble"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/voice",
    "name": "voice",
    "type": "object",
    "label": "Voice",
    "definition": "Voice for which a musical work is appropriate, such as soprano, tenor, mixed.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/MusicVoice"
    ],
    "rangeNames": [
      "MusicVoice"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/voiceType",
    "name": "voiceType",
    "type": "datatype",
    "label": "Type of voice",
    "definition": "Specific type of voice group, such as chorus, solo.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/MusicVoice"
    ],
    "domainNames": [
      "MusicVoice"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/musicSerialNumber",
    "name": "musicSerialNumber",
    "type": "datatype",
    "label": "Music serial number",
    "definition": "Numeric designation for musical works consecutively numbered in music reference sources.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/musicOpusNumber",
    "name": "musicOpusNumber",
    "type": "datatype",
    "label": "Music opus number",
    "definition": "Numeric designation of a musical work assigned by a composer, publisher, or a musicologist.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/musicThematicNumber",
    "name": "musicThematicNumber",
    "type": "datatype",
    "label": "Music thematic number",
    "definition": "Numeric designation for a musical work as found in a thematic index for the composer.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/musicKey",
    "name": "musicKey",
    "type": "datatype",
    "label": "Music key",
    "definition": "Pitch and mode for music.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/legalDate",
    "name": "legalDate",
    "type": "datatype",
    "label": "Date of legal work",
    "definition": "Date of legal work, or promulgation of a law, or signing of a treaty.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/date"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/version",
    "name": "version",
    "type": "datatype",
    "label": "Version",
    "definition": "Term or terms that identify works such as arranged for music, vulgate for religious work, etc.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/validDate",
    "name": "validDate",
    "type": "datatype",
    "label": "Valid date",
    "definition": "The date or date range during which the resource is accurate.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/date"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/natureOfContent",
    "name": "natureOfContent",
    "type": "datatype",
    "label": "Content nature",
    "definition": "Characterization that epitomizes the primary content of a resource, e.g., field recording of birdsong; combined time series analysis and graph plotting system.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/geographicCoverage",
    "name": "geographicCoverage",
    "type": "object",
    "label": "Geographic coverage",
    "definition": "Geographic coverage of the content of the resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/temporalCoverage",
    "name": "temporalCoverage",
    "type": "datatype",
    "label": "Temporal coverage",
    "definition": "Time period coverage of the content of the resource.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/intendedAudience",
    "name": "intendedAudience",
    "type": "object",
    "label": "Intended audience",
    "definition": "Information that identifies the specific audience or intellectual level for which the content of the resource is considered appropriate.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/collectionArrangement",
    "name": "collectionArrangement",
    "type": "object",
    "label": "Collection Organization and arrangement",
    "definition": "Information about the organization and arrangement of a collection of resources.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/CollectionArrangement"
    ],
    "rangeNames": [
      "CollectionArrangement"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/collectionArrangementOf",
    "name": "collectionArrangementOf",
    "type": "object",
    "label": "Organization and arrangement of Collection",
    "definition": "Relates an Arrangement resource to that which it describes.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/CollectionArrangement"
    ],
    "domainNames": [
      "CollectionArrangement"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/pattern",
    "name": "pattern",
    "type": "datatype",
    "label": "Arrangement of material",
    "definition": "Pattern of arrangement of materials within a unit.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/CollectionArrangement"
    ],
    "domainNames": [
      "CollectionArrangement"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/hierarchicalLevel",
    "name": "hierarchicalLevel",
    "type": "datatype",
    "label": "Hierarchical level of material",
    "definition": "Hierarchical position of the described materials relative to other material from the same source.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/CollectionArrangement"
    ],
    "domainNames": [
      "CollectionArrangement"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/collectionOrganization",
    "name": "collectionOrganization",
    "type": "datatype",
    "label": "Organization of material",
    "definition": "Manner in which the resource is divided into smaller units.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/CollectionArrangement"
    ],
    "domainNames": [
      "CollectionArrangement"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/dissertation",
    "name": "dissertation",
    "type": "object",
    "label": "Dissertation Information",
    "definition": "Work presented as part of the formal requirements for an academic degree.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Dissertation"
    ],
    "rangeNames": [
      "Dissertation"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/degree",
    "name": "degree",
    "type": "datatype",
    "label": "Degree",
    "definition": "Degree for which author was a candidate.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Dissertation"
    ],
    "domainNames": [
      "Dissertation"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/grantingInstitution",
    "name": "grantingInstitution",
    "type": "object",
    "label": "Degree issuing institution",
    "definition": "Name of degree granting institution.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Dissertation"
    ],
    "domainNames": [
      "Dissertation"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/summary",
    "name": "summary",
    "type": "object",
    "label": "Summary content",
    "definition": "Summary or abstract of the resource described.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Summary"
    ],
    "rangeNames": [
      "Summary"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/capture",
    "name": "capture",
    "type": "object",
    "label": "Capture of content",
    "definition": "Information about place and date associated with the capture (e.g., recording, filming) of the content of a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Capture"
    ],
    "rangeNames": [
      "Capture"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/notation",
    "name": "notation",
    "type": "object",
    "label": "Notation system",
    "definition": "Alphabet, script, or symbol system used to convey the content of the resource, including specialized scripts, typefaces, tactile notation, movement notation, and musical notation.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Notation"
    ],
    "rangeNames": [
      "Notation"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/contentAccessibility",
    "name": "contentAccessibility",
    "type": "object",
    "label": "Content accessibility information",
    "definition": "Information that assists those with a sensory impairment for greater understanding of content, e.g., captions.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/ContentAccessibility"
    ],
    "rangeNames": [
      "ContentAccessibility"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/illustrativeContent",
    "name": "illustrativeContent",
    "type": "object",
    "label": "Illustrative content information",
    "definition": "Information about content intended to illustrate a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Illustration"
    ],
    "rangeNames": [
      "Illustration"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/supplementaryContent",
    "name": "supplementaryContent",
    "type": "object",
    "label": "Supplementary material",
    "definition": "Material such as an index, bibliography, appendix intended to supplement the primary content of a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/SupplementaryContent"
    ],
    "rangeNames": [
      "SupplementaryContent"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/colorContent",
    "name": "colorContent",
    "type": "object",
    "label": "Color content",
    "definition": "Color characteristics, e.g., black and white, multicolored.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/ColorContent"
    ],
    "rangeNames": [
      "ColorContent"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/soundContent",
    "name": "soundContent",
    "type": "object",
    "label": "Sound content",
    "definition": "Indication of whether the production of sound is an integral part of the resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/SoundContent"
    ],
    "rangeNames": [
      "SoundContent"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/aspectRatio",
    "name": "aspectRatio",
    "type": "object",
    "label": "Aspect ratio",
    "definition": "Proportional relationship between an image's width and its height.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/AspectRatio"
    ],
    "rangeNames": [
      "AspectRatio"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/musicFormat",
    "name": "musicFormat",
    "type": "object",
    "label": "Format of notated music",
    "definition": "Layout for content of a resource that is presented in the form of musical notation, such as full score, condensed score, vocal score, etc.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/MusicFormat"
    ],
    "rangeNames": [
      "MusicFormat"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/duration",
    "name": "duration",
    "type": "datatype",
    "label": "Duration",
    "definition": "Information about the playing time, running time, etc. of a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/scale",
    "name": "scale",
    "type": "object",
    "label": "Scale",
    "definition": "Ratio of the dimensions of a form contained or embodied in a resource to the dimensions of the entity it represents, e.g., for images or cartographic resources.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Scale"
    ],
    "rangeNames": [
      "Scale"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/cartographicAttributes",
    "name": "cartographicAttributes",
    "type": "object",
    "label": "Cartographic data",
    "definition": "Cartographic data that identifies characteristics of the resource, such as coordinates, projection, etc.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Cartographic"
    ],
    "rangeNames": [
      "Cartographic"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ascensionAndDeclination",
    "name": "ascensionAndDeclination",
    "type": "datatype",
    "label": "Cartographic ascension and declination",
    "definition": "System for identifying the location of a celestial object in the sky covered by the cartographic content of a resource using the angles of right ascension and declination.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Cartographic"
    ],
    "domainNames": [
      "Cartographic"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/coordinates",
    "name": "coordinates",
    "type": "datatype",
    "label": "Cartographic coordinates",
    "definition": "Mathematical system for identifying the area covered by the cartographic content of a resource, expressed either by means of longitude and latitude on the surface of planets or by the angles of right ascension and declination for celestial cartographic content.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Cartographic"
    ],
    "domainNames": [
      "Cartographic"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/equinox",
    "name": "equinox",
    "type": "datatype",
    "label": "Cartographic equinox",
    "definition": "One of two points of intersection of the ecliptic and the celestial equator, occupied by the sun when its declination is 0 degrees.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Cartographic"
    ],
    "domainNames": [
      "Cartographic"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/exclusionGRing",
    "name": "exclusionGRing",
    "type": "datatype",
    "label": "Cartographic G ring area excluded",
    "definition": "Coordinate pairs that identify the closed non-intersecting boundary of the area contained within the G-polygon outer ring that is excluded.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Cartographic"
    ],
    "domainNames": [
      "Cartographic"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/outerGRing",
    "name": "outerGRing",
    "type": "datatype",
    "label": "Cartographic outer G ring area covered",
    "definition": "Coordinate pairs that identify the closed non-intersecting boundary of the area covered.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Cartographic"
    ],
    "domainNames": [
      "Cartographic"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/projection",
    "name": "projection",
    "type": "object",
    "label": "Cartographic projection",
    "definition": "Method or system used to represent the surface of the earth or of a celestial sphere on a plane.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Cartographic"
    ],
    "domainNames": [
      "Cartographic"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Projection"
    ],
    "rangeNames": [
      "Projection"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/credits",
    "name": "credits",
    "type": "datatype",
    "label": "Credits note",
    "definition": "Information in note form of credits for persons or organizations who have participated in the creation and/or production of the resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/awards",
    "name": "awards",
    "type": "datatype",
    "label": "Award note",
    "definition": "Information on awards associated with the described resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/ensembleSize",
    "name": "ensembleSize",
    "type": "object",
    "label": "Ensemble size",
    "definition": "Relates a work to the musical ensemble size",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/EnsembleSize"
    ],
    "rangeNames": [
      "EnsembleSize"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/keyMode",
    "name": "keyMode",
    "type": "object",
    "label": "Key and mode",
    "definition": "Relates a work to a musical key and mode",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/KeyMode"
    ],
    "rangeNames": [
      "KeyMode"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/mediumComponent",
    "name": "mediumComponent",
    "type": "object",
    "label": "Medium component",
    "definition": "Relates a work to a medium component",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/MediumComponent"
    ],
    "rangeNames": [
      "MediumComponent"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/mediumComponentQualifier",
    "name": "mediumComponentQualifier",
    "type": "object",
    "label": "Medium component qualifier",
    "definition": "Relates a medium component to a qualifier that affects the medium of component",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/MediumComponent"
    ],
    "domainNames": [
      "MediumComponent"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/MediumComponentQualifer"
    ],
    "rangeNames": [
      "MediumComponentQualifer"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/mediumOfPerformance",
    "name": "mediumOfPerformance",
    "type": "object",
    "label": "Medium of performance",
    "definition": "Relates a work to a musical medium of performance",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/MediumOfPerformance"
    ],
    "rangeNames": [
      "MediumOfPerformance"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/mode",
    "name": "mode",
    "type": "object",
    "label": "Mode",
    "definition": "Relates a work to a music mode",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Mode"
    ],
    "rangeNames": [
      "Mode"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/tempo",
    "name": "tempo",
    "type": "object",
    "label": "Tempo",
    "definition": "Relates a work to a music tempo",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Tempo"
    ],
    "rangeNames": [
      "Tempo"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/numberOfHands",
    "name": "numberOfHands",
    "type": "datatype",
    "label": "Number of hands",
    "definition": "Relates a medium component to the number of hands required for performance",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/MediumComponent"
    ],
    "domainNames": [
      "MediumComponent"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/phonogramDate",
    "name": "phonogramDate",
    "type": "datatype",
    "label": "Phonogram date",
    "definition": "Relates a work or instance to a phonogram copyright date for a work that is an audio recording",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/date"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/usesMediumOfPerformance",
    "name": "usesMediumOfPerformance",
    "type": "object",
    "label": "Uses medium of performance",
    "definition": "The medium of performance used by a contributing agent",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/MediumOfPerformance"
    ],
    "rangeNames": [
      "MediumOfPerformance"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/subject",
    "name": "subject",
    "type": "object",
    "label": "Subject",
    "definition": "Subject term(s) describing a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/subjectOf",
    "name": "subjectOf",
    "type": "object",
    "label": "Subject of",
    "definition": "Relates a subject to that which it describes.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/classification",
    "name": "classification",
    "type": "object",
    "label": "Classification",
    "definition": "Classification number in any scheme.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Classification"
    ],
    "rangeNames": [
      "Classification"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/schedulePart",
    "name": "schedulePart",
    "type": "datatype",
    "label": "Classification designation",
    "definition": "Designates whether the classification number is from the standard or optional part of a schedule or table.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Classification"
    ],
    "domainNames": [
      "Classification"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/edition",
    "name": "edition",
    "type": "datatype",
    "label": "Classification scheme edition",
    "definition": "Edition of the classification scheme, such as full, abridged or a number, when a classification scheme designates editions.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Classification"
    ],
    "domainNames": [
      "Classification"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/itemPortion",
    "name": "itemPortion",
    "type": "datatype",
    "label": "Classification item number",
    "definition": "Number attached to a classification string that indicates a particular item.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Classification"
    ],
    "domainNames": [
      "Classification"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/classificationPortion",
    "name": "classificationPortion",
    "type": "datatype",
    "label": "Classification number",
    "definition": "Classification number (single class number or beginning number of a span) that indicates the subject by applying a formal system of coding and organizing resources.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Classification"
    ],
    "domainNames": [
      "Classification"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/spanEnd",
    "name": "spanEnd",
    "type": "datatype",
    "label": "Classification number span end",
    "definition": "Ending number of classification number span.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Classification"
    ],
    "domainNames": [
      "Classification"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/table",
    "name": "table",
    "type": "datatype",
    "label": "Classification table identification",
    "definition": "Number of the table from which the classification number in a subdivision entry is taken, e.g., a DDC table.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Classification"
    ],
    "domainNames": [
      "Classification"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/tableSeq",
    "name": "tableSeq",
    "type": "datatype",
    "label": "Classification table sequence number",
    "definition": "Sequence number or other identifier for an internal classification sub arrangement or add in a classification scheme.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Classification"
    ],
    "domainNames": [
      "Classification"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/responsibilityStatement",
    "name": "responsibilityStatement",
    "type": "datatype",
    "label": "Creative responsibility statement",
    "definition": "Statement relating to any persons, families, or corporate bodies responsible for the creation of, or contributing to the content of a resource; usually transcribed.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/editionStatement",
    "name": "editionStatement",
    "type": "datatype",
    "label": "Edition statement",
    "definition": "Information identifying the edition or version of the resource and associated statements of responsibility for the edition; usually transcribed.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/editionEnumeration",
    "name": "editionEnumeration",
    "type": "datatype",
    "label": "Edition enumeration",
    "definition": "Enumeration of the edition; usually transcribed.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/provisionActivityStatement",
    "name": "provisionActivityStatement",
    "type": "datatype",
    "label": "Provider statement",
    "definition": "Statement relating to providers of a resource; usually transcribed.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/seriesStatement",
    "name": "seriesStatement",
    "type": "datatype",
    "label": "Series statement",
    "definition": "Statement of the series the resource is in; usually transcribed; includes the ISSN if applicable.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/seriesEnumeration",
    "name": "seriesEnumeration",
    "type": "datatype",
    "label": "Series enumeration",
    "definition": "Series enumeration of the resource; usually transcribed.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/subseriesStatement",
    "name": "subseriesStatement",
    "type": "datatype",
    "label": "Subseries statement",
    "definition": "Statement of the subseries the resource is in; usually transcribed; includes the ISSN if applicable.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/subseriesEnumeration",
    "name": "subseriesEnumeration",
    "type": "datatype",
    "label": "Subseries enumeration",
    "definition": "Subseries enumeration of the resource; usually transcribed.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/distributionStatement",
    "name": "distributionStatement",
    "type": "datatype",
    "label": "Distribution statement",
    "definition": "Statement related to the distribution of the resources; usually transcribed.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/manufactureStatement",
    "name": "manufactureStatement",
    "type": "datatype",
    "label": "Manufacture statement",
    "definition": "Statement related to the manufacture of the resources; usually transcribed.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/productionStatement",
    "name": "productionStatement",
    "type": "datatype",
    "label": "Production statement",
    "definition": "Statement related to the production of the resources; usually transcribed.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/publicationStatement",
    "name": "publicationStatement",
    "type": "datatype",
    "label": "Publication statement",
    "definition": "Statement related to the publication of the resources; usually transcribed.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/pubFrequency",
    "name": "pubFrequency",
    "type": "object",
    "label": "Publication frequency",
    "definition": "Relates a resource to a publication frequency resource to capture such details as first issue, last issue, status, etc.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/PubFrequency"
    ],
    "rangeNames": [
      "PubFrequency"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/frequency",
    "name": "frequency",
    "type": "object",
    "label": "Frequency",
    "definition": "Intervals at which the parts of a serially produced resource or the updates to an integrating resource are issued.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Frequency"
    ],
    "rangeNames": [
      "Frequency"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/preferredCitation",
    "name": "preferredCitation",
    "type": "datatype",
    "label": "Preferred citation",
    "definition": "Citation to the resource preferred by its custodian of the resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/issuance",
    "name": "issuance",
    "type": "object",
    "label": "Mode of issuance",
    "definition": "Categorization reflecting whether a resource is issued in one or more parts, the way it is updated, and its intended termination.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Issuance"
    ],
    "rangeNames": [
      "Issuance"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/firstIssue",
    "name": "firstIssue",
    "type": "datatype",
    "label": "Multipart first issue",
    "definition": "Beginning date of a resource and/or the sequential designations.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/lastIssue",
    "name": "lastIssue",
    "type": "datatype",
    "label": "Multipart last issue",
    "definition": "Ending date of a resource and/or the sequential designations.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/provisionActivity",
    "name": "provisionActivity",
    "type": "object",
    "label": "Provision activity",
    "definition": "Place, name, and/or date information relating to the publication, printing, distribution, issue, release, production, etc. of a resource.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/ProvisionActivity"
    ],
    "rangeNames": [
      "ProvisionActivity"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/copyrightDate",
    "name": "copyrightDate",
    "type": "datatype",
    "label": "Copyright date",
    "definition": "Date associated with a claim of protection under copyright or a similar regime.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/date"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/custodialHistory",
    "name": "custodialHistory",
    "type": "datatype",
    "label": "Custodial history",
    "definition": "Information about the provenance, such as origin, ownership and custodial history (chain of custody), of a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/acquisitionTerms",
    "name": "acquisitionTerms",
    "type": "datatype",
    "label": "Terms of acquisition",
    "definition": "Conditions under which the publisher, distributor, etc., will normally supply a resource, e.g., price of a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/acquisitionSource",
    "name": "acquisitionSource",
    "type": "object",
    "label": "Source of acquisition",
    "definition": "Information about an organization, person, etc., from which a resource may be obtained.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/copyrightRegistration",
    "name": "copyrightRegistration",
    "type": "object",
    "label": "Copyright registration information",
    "definition": "Copyright and Legal Deposit registration information",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/CopyrightRegistration"
    ],
    "rangeNames": [
      "CopyrightRegistration"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/coverArt",
    "name": "coverArt",
    "type": "object",
    "label": "Cover art",
    "definition": "Cover art image of a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/CoverArt"
    ],
    "rangeNames": [
      "CoverArt"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/review",
    "name": "review",
    "type": "object",
    "label": "Review content",
    "definition": "Review of a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Review"
    ],
    "rangeNames": [
      "Review"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/tableOfContents",
    "name": "tableOfContents",
    "type": "object",
    "label": "Table of contents content",
    "definition": "Table of contents of the described resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/TableOfContents"
    ],
    "rangeNames": [
      "TableOfContents"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/relief",
    "name": "relief",
    "type": "object",
    "label": "Relief",
    "definition": "Relief term specified on a cartographic resource",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Relief"
    ],
    "rangeNames": [
      "Relief"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/extent",
    "name": "extent",
    "type": "object",
    "label": "Extent",
    "definition": "Number and type of units and/or subunits making up a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Extent"
    ],
    "rangeNames": [
      "Extent"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/dimensions",
    "name": "dimensions",
    "type": "datatype",
    "label": "Dimensions",
    "definition": "Measurements of the carrier or carriers and/or the container of a resource.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/material",
    "name": "material",
    "type": "object",
    "label": "Material",
    "definition": "Resource uses, is composed of, integrates, etc. the related material.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/materialOf",
    "name": "materialOf",
    "type": "object",
    "label": "Material of",
    "definition": "This material is related to a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/baseMaterial",
    "name": "baseMaterial",
    "type": "object",
    "label": "Base material",
    "definition": "Underlying physical material of a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/material"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/baseMaterialOf",
    "name": "baseMaterialOf",
    "type": "object",
    "label": "Base material of",
    "definition": "Relates a Material resource to that which it is the base material of.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/materialOf"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/appliedMaterial",
    "name": "appliedMaterial",
    "type": "object",
    "label": "Applied material",
    "definition": "Physical or chemical substance applied to a base material of a resource.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/material"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/appliedMaterialOf",
    "name": "appliedMaterialOf",
    "type": "object",
    "label": "Applied material of",
    "definition": "Relates a Material resource to that which it is the applied material of.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/materialOf"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/emulsion",
    "name": "emulsion",
    "type": "object",
    "label": "Emulsion",
    "definition": "Suspension of light-sensitive chemicals used as a coating on a microfilm or microfiche, e.g., silver halide.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Emulsion"
    ],
    "rangeNames": [
      "Emulsion"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/mount",
    "name": "mount",
    "type": "object",
    "label": "Mount material or object",
    "definition": "Physical material or object used for the support or backing to which the base material of a resource has been attached.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/productionMethod",
    "name": "productionMethod",
    "type": "object",
    "label": "Production method",
    "definition": "Process used to produce a resource.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/ProductionMethod"
    ],
    "rangeNames": [
      "ProductionMethod"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/generation",
    "name": "generation",
    "type": "object",
    "label": "Generation",
    "definition": "Relationship between an original carrier and the carrier of a reproduction made from the original.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Generation"
    ],
    "rangeNames": [
      "Generation"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/layout",
    "name": "layout",
    "type": "object",
    "label": "Layout",
    "definition": "Arrangement of text, images, tactile notation, etc., in a resource.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Layout"
    ],
    "rangeNames": [
      "Layout"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/bookFormat",
    "name": "bookFormat",
    "type": "object",
    "label": "Book format",
    "definition": "Result of folding a printed sheet to form a gathering of leaves.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/BookFormat"
    ],
    "rangeNames": [
      "BookFormat"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/fontSize",
    "name": "fontSize",
    "type": "object",
    "label": "Font size",
    "definition": "Size of the type used to represent the characters and symbols in a resource.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/FontSize"
    ],
    "rangeNames": [
      "FontSize"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/polarity",
    "name": "polarity",
    "type": "object",
    "label": "Polarity",
    "definition": "Relationship of the colors and tones in an image to the colors and tones of the object reproduced.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Polarity"
    ],
    "rangeNames": [
      "Polarity"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/reductionRatio",
    "name": "reductionRatio",
    "type": "object",
    "label": "Reduction ratio",
    "definition": "Size of a micro-image in relation to the original from which it was produced.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/ReductionRatio"
    ],
    "rangeNames": [
      "ReductionRatio"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/soundCharacteristic",
    "name": "soundCharacteristic",
    "type": "object",
    "label": "Sound characteristic",
    "definition": "Technical specification relating to the encoding of sound in a resource.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/SoundCharacteristic"
    ],
    "rangeNames": [
      "SoundCharacteristic"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/projectionCharacteristic",
    "name": "projectionCharacteristic",
    "type": "object",
    "label": "Projection characteristic",
    "definition": "Technical specification relating to the projection of a motion picture film.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/ProjectionCharacteristic"
    ],
    "rangeNames": [
      "ProjectionCharacteristic"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/videoCharacteristic",
    "name": "videoCharacteristic",
    "type": "object",
    "label": "Video characteristic",
    "definition": "Technical specification relating to the encoding of video images in a resource",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/VideoCharacteristic"
    ],
    "rangeNames": [
      "VideoCharacteristic"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/digitalCharacteristic",
    "name": "digitalCharacteristic",
    "type": "object",
    "label": "Digital characteristic",
    "definition": "Technical specification relating to the digital encoding of text, image, audio, video, and other types of data in a resource.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/DigitalCharacteristic"
    ],
    "rangeNames": [
      "DigitalCharacteristic"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/systemRequirement",
    "name": "systemRequirement",
    "type": "object",
    "label": "Equipment or system requirements",
    "definition": "Equipment or system requirement beyond what is normal and obvious for the type of carrier or type of file, such as make and model of equipment or hardware, operating system, amount of memory, programming language, other necessary software, any plug-ins or peripherals required to play, view, or run the resource, etc.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/SystemRequirement"
    ],
    "rangeNames": [
      "SystemRequirement"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/binding",
    "name": "binding",
    "type": "object",
    "label": "Binding method",
    "definition": "A method used to bind a published or unpublished resource,or other binding information.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/enumerationAndChronology",
    "name": "enumerationAndChronology",
    "type": "object",
    "label": "Enumeration and chronology",
    "definition": "Numbering and dates of issues or items held.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/EnumerationAndChronology"
    ],
    "rangeNames": [
      "EnumerationAndChronology"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/heldBy",
    "name": "heldBy",
    "type": "object",
    "label": "Held by",
    "definition": "Entity holding the item or from which it is available.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Item"
    ],
    "domainNames": [
      "Item"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/sublocation",
    "name": "sublocation",
    "type": "object",
    "label": "Held in sublocation",
    "definition": "Specific place within the holding entity where the item is located or made available.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Item"
    ],
    "domainNames": [
      "Item"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Sublocation"
    ],
    "rangeNames": [
      "Sublocation"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/physicalLocation",
    "name": "physicalLocation",
    "type": "datatype",
    "label": "Storing or shelving location",
    "definition": "Location in the holding agency where the item is shelved or stored.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Item"
    ],
    "domainNames": [
      "Item"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/shelfMark",
    "name": "shelfMark",
    "type": "object",
    "label": "Shelf mark",
    "definition": "Piece identifier, such as a call or other type of number.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Item"
    ],
    "domainNames": [
      "Item"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/ShelfMark"
    ],
    "rangeNames": [
      "ShelfMark"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/electronicLocator",
    "name": "electronicLocator",
    "type": "object",
    "label": "Electronic location",
    "definition": "Electronic location from which the resource is available.",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/usageAndAccessPolicy",
    "name": "usageAndAccessPolicy",
    "type": "object",
    "label": "Use and access condition",
    "definition": "General statement of allowances and restrictions on access to a resource, including retention, reproduction, access, and lending.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/UsageAndAccessPolicy"
    ],
    "rangeNames": [
      "UsageAndAccessPolicy"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/immediateAcquisition",
    "name": "immediateAcquisition",
    "type": "object",
    "label": "Immediate acquisition",
    "definition": "Information about the circumstances, e.g., source, date, method, under which the resource was directly acquired.",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/ImmediateAcquisition"
    ],
    "rangeNames": [
      "ImmediateAcquisition"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/noteType",
    "name": "noteType",
    "type": "datatype",
    "label": "Note type",
    "definition": "Type of note.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Note"
    ],
    "domainNames": [
      "Note"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/hasInstance",
    "name": "hasInstance",
    "type": "object",
    "label": "Instance of Work",
    "definition": "Instance is related to described Work ; used to connect Works to Instances in the BIBFRAME structure",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "rangeNames": [
      "Instance"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/instanceOf",
    "name": "instanceOf",
    "type": "object",
    "label": "Instance of",
    "definition": "Work the Instance described instantiates or manifests; used to connect Instances to Works in the BIBFRAME structure",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "rangeNames": [
      "Work"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/hasExpression",
    "name": "hasExpression",
    "type": "object",
    "label": "Expressed as",
    "definition": "Work or Hub that is an expression of a described Work or Hub; used to relate Works and/or Hubs under LRM/RDA guidelines or similar implementations",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/expressionOf",
    "name": "expressionOf",
    "type": "object",
    "label": "Expression of",
    "definition": "Work or Hub that the described Work or Hub is an expression of; used to connect Works and/or Hubs under LRM/RDA guidelines or similar implementations",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/itemOf",
    "name": "itemOf",
    "type": "object",
    "label": "Holding for",
    "definition": "Instance for which the described Item is an example",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Item"
    ],
    "domainNames": [
      "Item"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "rangeNames": [
      "Instance"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/associatedResource",
    "name": "associatedResource",
    "type": "object",
    "label": "Associated resource",
    "definition": "Associated resource",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Relation"
    ],
    "domainNames": [
      "Relation"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/hasItem",
    "name": "hasItem",
    "type": "object",
    "label": "Has holding",
    "definition": "Item which is an example of the described Instance",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Item"
    ],
    "rangeNames": [
      "Item"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/relation",
    "name": "relation",
    "type": "object",
    "label": "Relation",
    "definition": "Associated resource and its relationship to the resource being described",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Relation"
    ],
    "rangeNames": [
      "Relation"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/relationship",
    "name": "relationship",
    "type": "object",
    "label": "Relationship",
    "definition": "Type of relationship between resources",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Relation"
    ],
    "domainNames": [
      "Relation"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Relationship"
    ],
    "rangeNames": [
      "Relationship"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/eventContent",
    "name": "eventContent",
    "type": "object",
    "label": "Event content",
    "definition": "Work whose content is the described event",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Event"
    ],
    "domainNames": [
      "Event"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "rangeNames": [
      "Work"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/eventContentOf",
    "name": "eventContentOf",
    "type": "object",
    "label": "Has event content",
    "definition": "Event that is the content of the described work",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Event"
    ],
    "rangeNames": [
      "Event"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/hasPart",
    "name": "hasPart",
    "type": "object",
    "label": "Has part",
    "definition": "Resource that is included either physically or logically in the described resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/partOf",
    "name": "partOf",
    "type": "object",
    "label": "Is part of",
    "definition": "Resource in which the described resource is physically or logically contained",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/accompaniedBy",
    "name": "accompaniedBy",
    "type": "object",
    "label": "Accompanied by",
    "definition": "Resource that accompanies the described resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/accompanies",
    "name": "accompanies",
    "type": "object",
    "label": "Accompanies",
    "definition": "Resource that adds to or is issued with the described resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/hasDerivative",
    "name": "hasDerivative",
    "type": "object",
    "label": "Has derivative",
    "definition": "A relationship which records that the described resource has a derivative resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/derivativeOf",
    "name": "derivativeOf",
    "type": "object",
    "label": "Is derivative of",
    "definition": "A relationship that records the fact that one resource is a derivative of another resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/precededBy",
    "name": "precededBy",
    "type": "object",
    "label": "Preceded by",
    "definition": "Resource that precedes the resource being described, e.g., is earlier in time or before in narrative",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/succeededBy",
    "name": "succeededBy",
    "type": "object",
    "label": "Succeeded by",
    "definition": "Resource that succeeds the resource being described, e.g., later in time or after in a narrative",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/references",
    "name": "references",
    "type": "object",
    "label": "References",
    "definition": "Resource that is referenced by the described resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/referencedBy",
    "name": "referencedBy",
    "type": "object",
    "label": "Referenced by",
    "definition": "Resource that references the described resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/hasReproduction",
    "name": "hasReproduction",
    "type": "object",
    "label": "Reproduced as",
    "definition": "Resource that reproduces another Resource",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "rangeNames": [
      "Instance"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/hasEquivalent"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/reproductionOf",
    "name": "reproductionOf",
    "type": "object",
    "label": "Reproduction of",
    "definition": "Resource that is a reproduction of another Resource",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "domainNames": [
      "Instance"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Instance"
    ],
    "rangeNames": [
      "Instance"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/hasEquivalent"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/dataSource",
    "name": "dataSource",
    "type": "object",
    "label": "Data source",
    "definition": "Resource that is a data source to which the described resource is related; may contain information about other files, printed sources, or collection procedures",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/hasSeries",
    "name": "hasSeries",
    "type": "object",
    "label": "In series",
    "definition": "Relation between a resource and the larger resource in which it has been issued; the title of the encompassing larger resource features on the part",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/partOf"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/seriesOf",
    "name": "seriesOf",
    "type": "object",
    "label": "Series container of",
    "definition": "Relation between a larger resource and the resources it encompasses, forming a series, the title of the larger resource appears on the parts",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/hasPart"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/hasSubseries",
    "name": "hasSubseries",
    "type": "object",
    "label": "Subseries",
    "definition": "Relation between a resource and the larger Series resource in which it has been issued; the larger Series resource is part of another overarching Series resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/partOf"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/subseriesOf",
    "name": "subseriesOf",
    "type": "object",
    "label": "Subseries of",
    "definition": "Relation between a Series resource and the resources it encompasses, forming a Subseries; the Series resource itself has a relation with a larger resource, of which it is a part",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/hasPart"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/supplement",
    "name": "supplement",
    "type": "object",
    "label": "Supplement",
    "definition": "Resource that updates or otherwise complements the predominant resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/accompaniedBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/supplementTo",
    "name": "supplementTo",
    "type": "object",
    "label": "Supplement to",
    "definition": "Resource that is updated or otherwise complemented by the augmenting resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/accompanies"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/arrangement",
    "name": "arrangement",
    "type": "object",
    "label": "Arrangement",
    "definition": "Relates one resource to another of which it is an arrangement of the first",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "rangeNames": [
      "Work"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/arrangementOf",
    "name": "arrangementOf",
    "type": "object",
    "label": "Arrangement of",
    "definition": "Relates an arrangement to the resource of which it is an arrangement.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "domainNames": [
      "Work"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Work"
    ],
    "rangeNames": [
      "Work"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/relatedTo"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/translation",
    "name": "translation",
    "type": "object",
    "label": "Translation as",
    "definition": "Resource that translates the text of the source entity into a language different from that of the original",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/hasDerivative"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/translationOf",
    "name": "translationOf",
    "type": "object",
    "label": "Translation of",
    "definition": "Resource that has been translated, i.e., the text is expressed in a language different from that of the original resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/derivativeOf"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/originalVersion",
    "name": "originalVersion",
    "type": "object",
    "label": "Original version",
    "definition": "Resource is the original version of which this resource is a reproduction",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/derivativeOf"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/originalVersionOf",
    "name": "originalVersionOf",
    "type": "object",
    "label": "Original version of",
    "definition": "Original version of a resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/hasDerivative"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/index",
    "name": "index",
    "type": "object",
    "label": "Has index",
    "definition": "Resource has an accompanying index",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/accompaniedBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/indexOf",
    "name": "indexOf",
    "type": "object",
    "label": "Index to",
    "definition": "Index that accompanies a resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/accompanies"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/findingAid",
    "name": "findingAid",
    "type": "object",
    "label": "Finding aid",
    "definition": "Relationship for archival, visual, and manuscript resources to a finding aid or similar control materials",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/accompaniedBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/findingAidOf",
    "name": "findingAidOf",
    "type": "object",
    "label": "Finding aid for",
    "definition": "Finding aid or similar control materials for archival, visual, and manuscript resources",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/accompanies"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/separatedFrom",
    "name": "separatedFrom",
    "type": "object",
    "label": "Separated from",
    "definition": "Resource that spun off a part of its content to form a new resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/precededBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/splitInto",
    "name": "splitInto",
    "type": "object",
    "label": "Split into",
    "definition": "One of two or more resources resulting from the division of an earlier resource into separate resources",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/succeededBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/replacementOf",
    "name": "replacementOf",
    "type": "object",
    "label": "Replacement of",
    "definition": "Earlier resource whose content has been replaced by a later resource, usually because the later resource contains updated or new information",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/precededBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/replacedBy",
    "name": "replacedBy",
    "type": "object",
    "label": "Replaced by",
    "definition": "Later resource used in place of an earlier resource, usually because the later resource contains updated or new information",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/succeededBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/mergerOf",
    "name": "mergerOf",
    "type": "object",
    "label": "Merger of",
    "definition": "One of two or more resources which came together to form a new resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/precededBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/mergedToForm",
    "name": "mergedToForm",
    "type": "object",
    "label": "Merged to form",
    "definition": "One of two or more resources that come together to form a new resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/succeededBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/continues",
    "name": "continues",
    "type": "object",
    "label": "Continuation of",
    "definition": "Resource that is continued by the content of a later resource under a new title",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/precededBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/continuesInPart",
    "name": "continuesInPart",
    "type": "object",
    "label": "Continuation in part of",
    "definition": "Resource that split into two or more separate resources with new titles",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/precededBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/absorbed",
    "name": "absorbed",
    "type": "object",
    "label": "Absorption of",
    "definition": "Resource that has been incorporated into another resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/precededBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/absorbedBy",
    "name": "absorbedBy",
    "type": "object",
    "label": "Absorbed by",
    "definition": "Resource that incorporates another resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/succeededBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/continuedBy",
    "name": "continuedBy",
    "type": "object",
    "label": "Continued by",
    "definition": "Resource whose content continues an earlier resource under a new title",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/succeededBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/continuedInPartBy",
    "name": "continuedInPartBy",
    "type": "object",
    "label": "Continued in part by",
    "definition": "Resource part of whose content separated from an earlier resource to form a new resource",
    "domains": [],
    "domainNames": [],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/succeededBy"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/contribution",
    "name": "contribution",
    "type": "object",
    "label": "Contributor and role",
    "definition": "Agent and its role in relation to the resource",
    "domains": [],
    "domainNames": [],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Contribution"
    ],
    "rangeNames": [
      "Contribution"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/contributionOf",
    "name": "contributionOf",
    "type": "object",
    "label": "Contribution of",
    "definition": "Relates a contribution resource, which associates an Agent and Role together, to the relevant resource",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Contribution"
    ],
    "domainNames": [
      "Contribution"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/role",
    "name": "role",
    "type": "object",
    "label": "Contributor role",
    "definition": "Function provided by a contributor, e.g., author, illustrator, etc.",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Contribution"
    ],
    "domainNames": [
      "Contribution"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Role"
    ],
    "rangeNames": [
      "Role"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/dramaticRole",
    "name": "dramaticRole",
    "type": "object",
    "label": "Dramatic Role",
    "definition": "Relates a contribution to a dramatic role",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/Contribution"
    ],
    "domainNames": [
      "Contribution"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/DramaticRole"
    ],
    "rangeNames": [
      "DramaticRole"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/derivedFrom",
    "name": "derivedFrom",
    "type": "object",
    "label": "Source metadata",
    "definition": "Meant to establish a link from a description that was derived from, perhaps via copy, another description; example: X description/metadata was derived from Y description/metadata",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/AdminMetadata"
    ],
    "domainNames": [
      "AdminMetadata"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/changeDate",
    "name": "changeDate",
    "type": "datatype",
    "label": "Description change date",
    "definition": "Date or date and time on which the metadata was modified",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/AdminMetadata"
    ],
    "domainNames": [
      "AdminMetadata"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/date"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/creationDate",
    "name": "creationDate",
    "type": "datatype",
    "label": "Description creation date",
    "definition": "Date or date and time on which the original metadata first created",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/AdminMetadata"
    ],
    "domainNames": [
      "AdminMetadata"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/date"
    ]
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/descriptionConventions",
    "name": "descriptionConventions",
    "type": "object",
    "label": "Description conventions",
    "definition": "Rules used for the descriptive content of the resource description",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/AdminMetadata"
    ],
    "domainNames": [
      "AdminMetadata"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/DescriptionConventions"
    ],
    "rangeNames": [
      "DescriptionConventions"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/descriptionLanguage",
    "name": "descriptionLanguage",
    "type": "object",
    "label": "Description language",
    "definition": "Language used for the metadata",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/AdminMetadata"
    ],
    "domainNames": [
      "AdminMetadata"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/Language"
    ],
    "rangeNames": [
      "Language"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/generationProcess",
    "name": "generationProcess",
    "type": "object",
    "label": "Description generation",
    "definition": "Indication of the program or process used to generate the description by application of a particular transformation",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/AdminMetadata"
    ],
    "domainNames": [
      "AdminMetadata"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/GenerationProcess"
    ],
    "rangeNames": [
      "GenerationProcess"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/descriptionModifier",
    "name": "descriptionModifier",
    "type": "object",
    "label": "Description modifier",
    "definition": "Agency that modified a description",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/AdminMetadata"
    ],
    "domainNames": [
      "AdminMetadata"
    ],
    "ranges": [],
    "rangeNames": [],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/descriptionAuthentication",
    "name": "descriptionAuthentication",
    "type": "object",
    "label": "Description authentication",
    "definition": "Indication of specific types of reviews that have been carried out on the description information",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/AdminMetadata"
    ],
    "domainNames": [
      "AdminMetadata"
    ],
    "ranges": [
      "http://id.loc.gov/ontologies/bibframe/DescriptionAuthentication"
    ],
    "rangeNames": [
      "DescriptionAuthentication"
    ],
    "subPropertyOf": []
  },
  {
    "uri": "http://id.loc.gov/ontologies/bibframe/generationDate",
    "name": "generationDate",
    "type": "datatype",
    "label": "Date generated",
    "definition": "Date of conversion of the metadata from another format",
    "domains": [
      "http://id.loc.gov/ontologies/bibframe/AdminMetadata"
    ],
    "domainNames": [
      "AdminMetadata"
    ],
    "ranges": [
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ],
    "rangeNames": [
      "rdf-schema#Literal"
    ],
    "subPropertyOf": [
      "http://id.loc.gov/ontologies/bibframe/date"
    ]
  }
];

export const BF_CLASSES_BY_NAME = new Map<string, OfficialBFClass>(
  OFFICIAL_BIBFRAME_CLASSES.map(c => [c.name, c])
);

export const BF_PROPERTIES_BY_NAME = new Map<string, OfficialBFProperty>(
  OFFICIAL_BIBFRAME_PROPERTIES.map(p => [p.name, p])
);

/**
 * Get all official BIBFRAME properties applicable to a domain (Work, Instance, Item, Hub)
 */
export function getOfficialPropertiesForDomain(domain: 'Work' | 'Instance' | 'Item' | 'Hub' | 'AdminMetadata'): OfficialBFProperty[] {
  return OFFICIAL_BIBFRAME_PROPERTIES.filter(p => 
    p.domainNames.length === 0 || p.domainNames.includes(domain)
  );
}

/**
 * Get class definition by short name
 */
export function getOfficialClass(name: string): OfficialBFClass | undefined {
  return BF_CLASSES_BY_NAME.get(name);
}

/**
 * Get property definition by short name
 */
export function getOfficialProperty(name: string): OfficialBFProperty | undefined {
  return BF_PROPERTIES_BY_NAME.get(name);
}
