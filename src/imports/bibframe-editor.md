SUPER PROMPT — Build a Real BIBFRAME Linked Data Editor

Build a production-grade, ontology-driven BIBFRAME editor that produces fully valid RDF/JSON-LD compliant with the official BIBFRAME vocabulary from the Library of Congress.

The system must not simulate metadata. It must generate real Linked Data.

1️⃣ Core Requirement: Real BIBFRAME RDF

The editor MUST:

Use official BIBFRAME context:

https://id.loc.gov/ontologies/bibframe.jsonld

Generate valid JSON-LD

Support @graph

Use real URIs

Support blank nodes when necessary

Produce deterministic canonical serialization

Be ingestible into a triple store without errors

2️⃣ Full BIBFRAME Entity Support

Support complete WEMI modeling:

bf:Work

bf:Expression (optional but supported)

bf:Instance

bf:Item

Support relationships:

bf:contribution

bf:subject

bf:genreForm

bf:language

bf:provisionActivity

bf:identifiedBy

bf:classification

bf:instanceOf

bf:itemOf

bf:hasSeries

bf:relatedTo

All relationships must generate RDF triples.

3️⃣ Ontology-Driven Field Engine

The UI must:

Dynamically render fields from ontology definitions

Map form fields directly to RDF predicates

Never store flat JSON

Use a graph store internally (subject–predicate–object)

Internal model must be triple-based:

subject | predicate | object

Not:

{
  title: "...",
  author: "..."
}
4️⃣ Authority Control Integration

Integrate live authority APIs:

Library of Congress (id.loc.gov)

VIAF

Wikidata

Requirements:

Search authority endpoints

Store selected authority as URI

Store label separately

Never store plain strings for controlled fields

5️⃣ Linked Data Integrity

System must:

Enforce URI-based relationships

Support internal linking between Work and Instance

Prevent duplicate blank nodes

Canonicalize JSON-LD

Generate SHA-256 checksum per version

Verify checksum on load

Lock record when published

6️⃣ Validation Engine

Include:

Required field validation

URI format validation

Relationship validation

WEMI consistency validation

JSON-LD structural validation

Publishing must be blocked if validation fails.

7️⃣ Multi-View Interface

Provide:

Form view

Graph visualization (nodes = subjects, edges = predicates)

Raw RDF (JSON-LD)

Turtle export

MARC 21 mapped export

OPAC preview mode

Mind map visualization

Validation report

All views must reflect the same underlying RDF graph.

8️⃣ Backend Architecture

Use:

PostgreSQL for versioned persistence

JSONB for canonical JSON-LD storage

Optional triple store (Fuseki / GraphDB) for indexing

REST API endpoints:

GET /records/:id
POST /records
PUT /records/:id
GET /records/:id/public
GET /records/:id/marc
GET /records/:id/rdf
GET /records/:id/audit

All writes must:

Canonicalize RDF

Generate checksum

Append audit log

Store version snapshot

9️⃣ MARC Mapping Registry

Implement declarative mapping:

BIBFRAME → MARC 21 fields

Support repeatable fields

Support indicators

Generate leader and control fields

Allow future extension

🔟 Production Guarantees

System must ensure:

Deterministic serialization

Immutable audit logs

Record locking after publish

Version rollback capability

Public endpoint isolation

No direct mutation of published records

1️⃣1️⃣ What This System Is

It is:

A Linked Data cataloging platform

An RDF-native editor

An ontology-driven interface

A BIBFRAME production tool

It is NOT:

A flat metadata form

A mock JSON generator

A UI-only prototype

Expected Output Example

The system must produce records like:

{
  "@context": "https://id.loc.gov/ontologies/bibframe.jsonld",
  "@graph": [
    {
      "@id": "http://example.org/work/123",
      "@type": "bf:Work",
      "bf:title": {
        "@type": "bf:Title",
        "bf:mainTitle": "The Great Gatsby"
      },
      "bf:contribution": {
        "@type": "bf:Contribution",
        "bf:agent": {
          "@id": "http://id.loc.gov/authorities/names/n79021164"
        }
      }
    }
  ]
}

This must validate as RDF.

Final Instruction To AI Builder

Do not create partial implementations.
Do not simulate RDF.
Do not flatten structure.
Do not omit ontology alignment.

Build a real BIBFRAME Linked Data editor capable of producing ingestion-ready RDF records aligned with the official BIBFRAME ontology.