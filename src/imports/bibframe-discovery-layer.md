SUPER PROMPT
Build an Open Linked Data Discovery Layer for a BIBFRAME Platform

You are building a production-grade Open Linked Data Discovery Layer integrated with a BIBFRAME-native cataloging system aligned with the official vocabulary from the Library of Congress.

This system must not simulate linked data.
It must expose real, resolvable, machine-readable RDF.

🎯 OBJECTIVE

Create a public discovery layer that:

• Exposes BIBFRAME records as Linked Data
• Supports semantic navigation
• Provides scalable search
• Enables faceted browsing
• Supports content negotiation
• Optionally exposes SPARQL
• Is ingestible by external systems

This must be production-ready and architecturally sound.

🏗 CORE ARCHITECTURE
BIBFRAME Editor
        ↓
Canonical JSON-LD
        ↓
PostgreSQL (versioned storage)
        ↓
Search Index (OpenSearch/Elasticsearch)
        ↓
Discovery API Layer
        ↓
Public Discovery UI
        ↓
Content Negotiation (HTML + JSON-LD + Turtle)

Optional advanced layer:

JSON-LD → Triple Store → SPARQL Endpoint
1️⃣ FULL TECHNICAL BLUEPRINT

The system must include:

A) Data Layer

• Canonical JSON-LD storage
• Deterministic serialization
• SHA-256 checksum per version
• Immutable audit logs
• Record locking when published

B) Search Layer

• Full-text search
• Faceting
• Ranking
• Authority-aware boosting
• Related entity expansion

C) API Layer

Public endpoints:

GET /search?q=
GET /work/:id
GET /instance/:id
GET /agent/:id
GET /subject/:id
GET /records/:id/public

Must support:

• JSON
• application/ld+json
• text/turtle
• HTML

2️⃣ URI STRATEGY (MANDATORY)

Every entity must have persistent HTTP URI:

https://domain.org/work/{uuid}
https://domain.org/instance/{uuid}
https://domain.org/agent/{uuid}
https://domain.org/subject/{uuid}

Rules:

• URIs must never change
• URIs must resolve
• Browser → HTML
• Machine → RDF

Implement full content negotiation.

3️⃣ POSTGRESQL SCHEMA DESIGN

Design tables:

records

• id (UUID)
• type (Work/Instance/Item)
• canonical_jsonld (JSONB)
• checksum
• status (draft/published)
• created_at
• updated_at
• version

versions

• id
• record_id
• canonical_jsonld
• checksum
• created_at

audit_log

• id
• record_id
• action
• user_id
• timestamp

Index JSONB for performance.

4️⃣ SEARCH INDEX MAPPING

Index fields:

• work_title
• subtitle
• creator_label
• creator_uri
• subject_label
• subject_uri
• language
• publication_year
• identifiers (ISBN, ISSN)
• abstract
• series

Support:

• Multi-field boosting
• Phrase matching
• Fuzzy matching
• Facet aggregation
• Nested fields

Search must not query raw RDF directly — use index.

5️⃣ DISCOVERY UI REQUIREMENTS

Public UI must include:

Search Interface

• Keyword search
• Autocomplete
• Suggestions

Facets

• Author
• Subject
• Date
• Language
• Format

Record Page

• Work view
• Linked Instance list
• Related works
• Authority linkouts
• JSON-LD download
• RDF download

Linked Navigation

Clicking an agent URI must show all works by that agent.

6️⃣ SPARQL DEPLOYMENT (Enterprise Level)

Optional but recommended for Level 3:

Deploy triple store:

• Apache Jena Fuseki
or
• GraphDB

Expose:

/sparql

Support:

• SELECT
• CONSTRUCT
• DESCRIBE

Enable CORS.

7️⃣ LINKED DATA INTEGRITY RULES

• Never store flat metadata
• Always generate RDF triples
• Always preserve WEMI relationships
• No mutation of published records
• Canonicalize before saving
• Validate JSON-LD structure
• Ensure external URIs remain intact

8️⃣ AI INTEGRATION (OPTIONAL ENHANCEMENT)

AI may assist with:

• Natural language search interpretation
• Subject suggestion
• Related work recommendation
• Entity reconciliation
• Summary generation

AI must not override RDF authority URIs without human validation.

🔥 IMPLEMENTATION LEVEL SELECTION

Before building, define the deployment level:

1️⃣ Lightweight Search-Based Discovery

• PostgreSQL
• Search engine
• REST API
• JSON-LD export
• No SPARQL

Best for MVP.

2️⃣ Full Linked Data with Content Negotiation

• Persistent URIs
• HTML + JSON-LD
• RDF export
• Authority navigation
• Advanced faceting

Institution-level deployment.

3️⃣ Enterprise Linked Data + SPARQL

• Triple store
• SPARQL endpoint
• Federated query support
• RDF ingestion pipeline
• Advanced graph traversal
• Linked Open Data publication

National library / research infrastructure level.

📌 FINAL INSTRUCTION TO DEVELOPMENT TEAM

Do not:

• Build flat JSON APIs
• Fake RDF
• Skip content negotiation
• Ignore URI persistence
• Store only labels without URIs

Do:

• Build RDF-native architecture
• Separate search index from canonical graph
• Preserve semantic relationships
• Ensure long-term persistence
• Follow BIBFRAME ontology strictly

END OF SUPER PROMPT

If you want, I can now:

• Expand this into a full deployment blueprint
• Write Docker architecture
• Design Kubernetes deployment
• Create database migration scripts
• Write SPARQL schema examples
• Design a full enterprise roadmap

Tell me your level (1, 2, or 3), and we go deeper.

3

Good.

You chose Level 3 — Enterprise Linked Data + SPARQL.

This is national-library / research-infrastructure level architecture.

Below is the full enterprise blueprint.

🌙 MOON ENTERPRISE LEVEL 3
Open Linked Data + SPARQL Infrastructure

Aligned with BIBFRAME from the Library of Congress

🏗 OVERALL ARCHITECTURE
Cataloging UI (BIBFRAME Editor)
        ↓
Canonical JSON-LD (Deterministic)
        ↓
PostgreSQL (Versioned + Audit)
        ↓
RDF Transformation Pipeline
        ↓
Triple Store (Fuseki / GraphDB)
        ↓
SPARQL Endpoint
        ↓
Search Index (OpenSearch)
        ↓
Public Discovery Layer
        ↓
Content Negotiation (HTML + JSON-LD + Turtle)

This separates:

• Editing
• Persistence
• Graph storage
• Search
• Public exposure

Clean enterprise layering.

1️⃣ DATA FLOW DESIGN
A) Save Record

Editor produces canonical JSON-LD

System generates SHA-256 checksum

Store in PostgreSQL

Push RDF triples to triple store

Index flattened search fields in OpenSearch

Three storage representations:

Layer	Purpose
PostgreSQL	Authoritative versioned record
Triple Store	Graph query + SPARQL
Search Engine	Fast discovery

Never mix responsibilities.

2️⃣ TRIPLE STORE DEPLOYMENT

Recommended options:

• Apache Jena Fuseki
• GraphDB
• Blazegraph

Best balance of power + cost: Apache Jena Fuseki.

Expose:

/sparql

Enable:

• SELECT
• CONSTRUCT
• DESCRIBE
• ASK

Enable CORS for public queries.

3️⃣ URI STRATEGY (CRITICAL)

Every entity must resolve.

Pattern:

https://moon.org/work/{uuid}
https://moon.org/instance/{uuid}
https://moon.org/item/{uuid}
https://moon.org/agent/{uuid}
https://moon.org/subject/{uuid}

Rules:

• No database IDs exposed
• UUID only
• Never change URIs
• HTTP 303 redirect for RDF

Implement content negotiation:

If Accept:

text/html → Render human page

application/ld+json → Return JSON-LD

text/turtle → Return Turtle

This is real Linked Data.

4️⃣ SPARQL CAPABILITIES

Your endpoint must support:

A) Work search
SELECT ?work ?title WHERE {
  ?work a bf:Work ;
        bf:title ?t .
  ?t bf:mainTitle ?title .
}
B) Author navigation
SELECT ?work WHERE {
  ?work bf:contribution ?c .
  ?c bf:agent <http://id.loc.gov/authorities/names/n79021164> .
}
C) Subject browsing
SELECT ?work WHERE {
  ?work bf:subject <http://id.loc.gov/authorities/subjects/sh85026371> .
}

This is what makes it enterprise-grade.

5️⃣ SEARCH INDEX DESIGN (OpenSearch)

Index only what is needed for speed:

Fields:

• work_title (text, boosted)
• creator_label (text)
• subject_label (text)
• publication_year (keyword)
• language (keyword)
• format (keyword)
• identifiers (keyword)
• abstract (text)
• agent_uri (keyword)
• subject_uri (keyword)

Use nested mapping for contributions.

Faceting must be powered by index — not SPARQL.

6️⃣ DISCOVERY LAYER FEATURES

Your public interface must include:

Search

• Keyword search
• Autocomplete
• Relevance ranking
• Fuzzy matching

Facets

• Author
• Subject
• Year
• Language
• Format

Record Page

• Work view
• Instance grouping
• Linked Items
• Authority links
• Download RDF
• SPARQL query link

Linked Graph Navigation

Click any URI → navigate graph.

7️⃣ RDF INGESTION PIPELINE

When a record is published:

Validate JSON-LD

Canonicalize

Transform to N-Triples

Push to triple store

Reindex search

Lock record

Use asynchronous job queue.

8️⃣ SECURITY MODEL

Public:

• Read-only RDF
• SPARQL SELECT only

Internal:

• Full SPARQL update disabled
• No mutation outside editor

Never allow public SPARQL UPDATE.

9️⃣ DOCKER DEPLOYMENT MODEL

Containers:

• Frontend (React / Next)
• API server
• PostgreSQL
• OpenSearch
• Fuseki (Triple store)
• Reverse proxy (NGINX)

All behind HTTPS.

🔟 SCALABILITY

For enterprise scaling:

• Separate search cluster
• Separate triple store node
• Redis cache for record pages
• CDN for HTML + JSON-LD

1️⃣1️⃣ AI INTEGRATION (Enterprise)

AI layer sits between:

Search UI → Query Enhancer → OpenSearch

Use AI to:

• Expand user queries
• Suggest related subjects
• Rank semantic similarity
• Provide natural language interface

But RDF graph remains authoritative.

1️⃣2️⃣ OPEN LINKED DATA REQUIREMENTS

To be truly open:

• Public resolvable URIs
• SPARQL endpoint
• RDF downloads
• No authentication required for read
• Persistent identifiers
• Machine-readable metadata

🚨 WHAT THIS MAKES YOU

With Level 3:

You are not building an OPAC.

You are building:

A Linked Open Data Platform.

Comparable to:

• Library of Congress Linked Data Service
• Europeana
• Wikidata

This is institutional infrastructure.