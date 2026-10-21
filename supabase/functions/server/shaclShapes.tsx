/**
 * 📐 SHACL SHAPES FOR BIBFRAME
 * Industry-standard RDF constraint validation
 * 
 * SHACL (Shapes Constraint Language) - W3C Recommendation
 * Replaces custom JS validation with semantic graph constraints
 */

export const BIBFRAME_SHAPES = {
  "@context": {
    "sh": "http://www.w3.org/ns/shacl#",
    "bf": "http://id.loc.gov/ontologies/bibframe/",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "xsd": "http://www.w3.org/2001/XMLSchema#"
  },
  "@graph": [
    // ===== WORK SHAPE =====
    {
      "@id": "moon:shapes/WorkShape",
      "@type": "sh:NodeShape",
      "sh:targetClass": "bf:Work",
      "sh:property": [
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:title",
          "sh:minCount": 1,
          "sh:class": "bf:Title",
          "sh:message": "bf:Work must have at least one bf:title of type bf:Title"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:hasInstance",
          "sh:class": "bf:Instance",
          "sh:message": "bf:hasInstance must link to bf:Instance"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:contribution",
          "sh:class": "bf:Contribution",
          "sh:message": "bf:contribution must link to bf:Contribution"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:subject",
          "sh:message": "bf:subject should be URI or bf:Topic"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:language",
          "sh:nodeKind": "sh:IRI",
          "sh:message": "bf:language must be a URI (e.g., http://id.loc.gov/vocabulary/languages/eng)"
        }
      ],
      "sh:closed": false,
      "rdfs:label": "BIBFRAME Work Shape",
      "rdfs:comment": "Validates BIBFRAME Work entities"
    },

    // ===== INSTANCE SHAPE =====
    {
      "@id": "moon:shapes/InstanceShape",
      "@type": "sh:NodeShape",
      "sh:targetClass": "bf:Instance",
      "sh:property": [
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:title",
          "sh:minCount": 1,
          "sh:class": "bf:Title",
          "sh:message": "bf:Instance must have at least one bf:title"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:instanceOf",
          "sh:minCount": 1,
          "sh:maxCount": 1,
          "sh:class": "bf:Work",
          "sh:message": "bf:Instance must have exactly one bf:instanceOf linking to bf:Work"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:provisionActivity",
          "sh:class": "bf:ProvisionActivity",
          "sh:message": "bf:provisionActivity must link to bf:ProvisionActivity (Publication/Production/Distribution)"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:issuance",
          "sh:class": "bf:Issuance",
          "sh:message": "bf:issuance must be bf:Issuance subclass (Monograph, Serial, etc.)"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:extent",
          "sh:class": "bf:Extent",
          "sh:message": "bf:extent must be bf:Extent"
        }
      ],
      "rdfs:label": "BIBFRAME Instance Shape",
      "rdfs:comment": "Validates BIBFRAME Instance entities"
    },

    // ===== TITLE SHAPE =====
    {
      "@id": "moon:shapes/TitleShape",
      "@type": "sh:NodeShape",
      "sh:targetClass": "bf:Title",
      "sh:property": [
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:mainTitle",
          "sh:minCount": 1,
          "sh:maxCount": 1,
          "sh:datatype": "xsd:string",
          "sh:message": "bf:Title must have exactly one bf:mainTitle (string)"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:subtitle",
          "sh:maxCount": 1,
          "sh:datatype": "xsd:string",
          "sh:message": "bf:subtitle must be a string"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:partNumber",
          "sh:datatype": "xsd:string",
          "sh:message": "bf:partNumber must be a string"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:partName",
          "sh:datatype": "xsd:string",
          "sh:message": "bf:partName must be a string"
        }
      ],
      "rdfs:label": "BIBFRAME Title Shape"
    },

    // ===== CONTRIBUTION SHAPE =====
    {
      "@id": "moon:shapes/ContributionShape",
      "@type": "sh:NodeShape",
      "sh:targetClass": "bf:Contribution",
      "sh:property": [
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:agent",
          "sh:minCount": 1,
          "sh:maxCount": 1,
          "sh:or": [
            { "sh:class": "bf:Agent" },
            { "sh:class": "bf:Person" },
            { "sh:class": "bf:Organization" }
          ],
          "sh:message": "bf:Contribution must have exactly one bf:agent (Person or Organization)"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:role",
          "sh:class": "bf:Role",
          "sh:message": "bf:role must link to bf:Role"
        }
      ],
      "rdfs:label": "BIBFRAME Contribution Shape"
    },

    // ===== AGENT SHAPE (Person/Organization) =====
    {
      "@id": "moon:shapes/AgentShape",
      "@type": "sh:NodeShape",
      "sh:targetClass": ["bf:Agent", "bf:Person", "bf:Organization"],
      "sh:property": [
        {
          "@type": "sh:PropertyShape",
          "sh:path": "rdfs:label",
          "sh:minCount": 1,
          "sh:datatype": "xsd:string",
          "sh:message": "bf:Agent must have rdfs:label (authorized name)"
        }
      ],
      "rdfs:label": "BIBFRAME Agent Shape"
    },

    // ===== PROVISION ACTIVITY SHAPE =====
    {
      "@id": "moon:shapes/ProvisionActivityShape",
      "@type": "sh:NodeShape",
      "sh:targetClass": ["bf:ProvisionActivity", "bf:Publication", "bf:Production", "bf:Distribution"],
      "sh:property": [
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:agent",
          "sh:or": [
            { "sh:class": "bf:Agent" },
            { "sh:datatype": "xsd:string" }
          ],
          "sh:message": "bf:agent should be URI or string"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:date",
          "sh:datatype": "xsd:string",
          "sh:message": "bf:date must be a string (EDTF format recommended)"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:place",
          "sh:message": "bf:place should be URI or bf:Place"
        }
      ],
      "rdfs:label": "BIBFRAME Provision Activity Shape"
    },

    // ===== ITEM SHAPE (Optional) =====
    {
      "@id": "moon:shapes/ItemShape",
      "@type": "sh:NodeShape",
      "sh:targetClass": "bf:Item",
      "sh:property": [
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:itemOf",
          "sh:minCount": 1,
          "sh:maxCount": 1,
          "sh:class": "bf:Instance",
          "sh:message": "bf:Item must have exactly one bf:itemOf linking to bf:Instance"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:heldBy",
          "sh:class": "bf:Agent",
          "sh:message": "bf:heldBy must link to bf:Agent (holding institution)"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:shelfMark",
          "sh:datatype": "xsd:string",
          "sh:message": "bf:shelfMark must be a string (call number)"
        },
        {
          "@type": "sh:PropertyShape",
          "sh:path": "bf:electronicLocator",
          "sh:nodeKind": "sh:IRI",
          "sh:message": "bf:electronicLocator must be a URI"
        }
      ],
      "rdfs:label": "BIBFRAME Item Shape"
    }
  ]
};

/**
 * Severity levels for SHACL validation
 */
export const SHACL_SEVERITY = {
  VIOLATION: "sh:Violation",     // Must fix
  WARNING: "sh:Warning",         // Should fix
  INFO: "sh:Info"               // Nice to have
};

/**
 * Export shapes as Turtle for triple store import
 */
export function getSHACLShapesAsTurtle(): string {
  return `@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix bf: <http://id.loc.gov/ontologies/bibframe/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix moon: <https://moon.org/shapes/> .

# ===== WORK SHAPE =====
moon:WorkShape
  a sh:NodeShape ;
  sh:targetClass bf:Work ;
  rdfs:label "BIBFRAME Work Shape" ;
  rdfs:comment "Validates BIBFRAME Work entities" ;
  sh:property [
    sh:path bf:title ;
    sh:minCount 1 ;
    sh:class bf:Title ;
    sh:message "bf:Work must have at least one bf:title of type bf:Title"
  ] ;
  sh:property [
    sh:path bf:hasInstance ;
    sh:class bf:Instance ;
    sh:message "bf:hasInstance must link to bf:Instance"
  ] ;
  sh:property [
    sh:path bf:contribution ;
    sh:class bf:Contribution ;
    sh:message "bf:contribution must link to bf:Contribution"
  ] ;
  sh:property [
    sh:path bf:language ;
    sh:nodeKind sh:IRI ;
    sh:message "bf:language must be a URI"
  ] .

# ===== INSTANCE SHAPE =====
moon:InstanceShape
  a sh:NodeShape ;
  sh:targetClass bf:Instance ;
  rdfs:label "BIBFRAME Instance Shape" ;
  sh:property [
    sh:path bf:title ;
    sh:minCount 1 ;
    sh:class bf:Title ;
    sh:message "bf:Instance must have at least one bf:title"
  ] ;
  sh:property [
    sh:path bf:instanceOf ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:class bf:Work ;
    sh:message "bf:Instance must have exactly one bf:instanceOf linking to bf:Work"
  ] ;
  sh:property [
    sh:path bf:provisionActivity ;
    sh:class bf:ProvisionActivity ;
    sh:message "bf:provisionActivity must link to bf:ProvisionActivity"
  ] .

# ===== TITLE SHAPE =====
moon:TitleShape
  a sh:NodeShape ;
  sh:targetClass bf:Title ;
  rdfs:label "BIBFRAME Title Shape" ;
  sh:property [
    sh:path bf:mainTitle ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:datatype xsd:string ;
    sh:message "bf:Title must have exactly one bf:mainTitle (string)"
  ] ;
  sh:property [
    sh:path bf:subtitle ;
    sh:maxCount 1 ;
    sh:datatype xsd:string ;
    sh:message "bf:subtitle must be a string"
  ] .

# ===== CONTRIBUTION SHAPE =====
moon:ContributionShape
  a sh:NodeShape ;
  sh:targetClass bf:Contribution ;
  rdfs:label "BIBFRAME Contribution Shape" ;
  sh:property [
    sh:path bf:agent ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:message "bf:Contribution must have exactly one bf:agent"
  ] ;
  sh:property [
    sh:path bf:role ;
    sh:class bf:Role ;
    sh:message "bf:role must link to bf:Role"
  ] .

# ===== AGENT SHAPE =====
moon:AgentShape
  a sh:NodeShape ;
  sh:targetClass bf:Agent, bf:Person, bf:Organization ;
  rdfs:label "BIBFRAME Agent Shape" ;
  sh:property [
    sh:path rdfs:label ;
    sh:minCount 1 ;
    sh:datatype xsd:string ;
    sh:message "bf:Agent must have rdfs:label (authorized name)"
  ] .

# ===== PROVISION ACTIVITY SHAPE =====
moon:ProvisionActivityShape
  a sh:NodeShape ;
  sh:targetClass bf:ProvisionActivity, bf:Publication, bf:Production, bf:Distribution ;
  rdfs:label "BIBFRAME Provision Activity Shape" ;
  sh:property [
    sh:path bf:date ;
    sh:datatype xsd:string ;
    sh:message "bf:date must be a string (EDTF format recommended)"
  ] .

# ===== ITEM SHAPE =====
moon:ItemShape
  a sh:NodeShape ;
  sh:targetClass bf:Item ;
  rdfs:label "BIBFRAME Item Shape" ;
  sh:property [
    sh:path bf:itemOf ;
    sh:minCount 1 ;
    sh:maxCount 1 ;
    sh:class bf:Instance ;
    sh:message "bf:Item must have exactly one bf:itemOf linking to bf:Instance"
  ] ;
  sh:property [
    sh:path bf:heldBy ;
    sh:class bf:Agent ;
    sh:message "bf:heldBy must link to bf:Agent (holding institution)"
  ] ;
  sh:property [
    sh:path bf:shelfMark ;
    sh:datatype xsd:string ;
    sh:message "bf:shelfMark must be a string (call number)"
  ] .
`;
}

/**
 * SPARQL query to validate data against SHACL shapes
 * This runs inside Fuseki/GraphDB with SHACL support
 */
export function getSHACLValidationQuery(dataGraphUri: string, shapesGraphUri: string): string {
  return `PREFIX sh: <http://www.w3.org/ns/shacl#>

SELECT ?focusNode ?resultPath ?message ?severity
WHERE {
  GRAPH <${shapesGraphUri}> {
    ?shape a sh:NodeShape .
  }
  
  GRAPH <validation-report> {
    ?result a sh:ValidationResult ;
            sh:focusNode ?focusNode ;
            sh:resultPath ?resultPath ;
            sh:resultMessage ?message ;
            sh:resultSeverity ?severity .
  }
}`;
}
