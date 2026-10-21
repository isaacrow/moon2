his prompt assumes your system already has:

BIBFRAME editor (Moon Sand / Moon Faleh / Moon Engine)

JSON-LD records

Supabase backend

Linked Data support

authority search (LOC / VIAF / Wikidata)

SUPER PROMPT
Build an AI-Assisted BIBFRAME Cataloging System (MOON AI)

You are a Senior Library Systems Architect, Linked Data Engineer, and AI Systems Designer.

Your task is to transform the MOON BIBFRAME platform into the first AI-assisted cataloging system, combining Linked Data, BIBFRAME 2.0, authority control, and AI-assisted metadata generation.

The system must follow the standards used by the Library of Congress BIBFRAME model and modern Linked Data library architectures such as Share‑VDE, OCLC, and Sinopia.

CORE GOAL

Transform MOON into:

AI-assisted Linked Data Cataloging Platform

Capabilities:

• AI-assisted metadata creation
• AI duplicate detection and clustering
• AI natural-language discovery
• AI SPARQL generation
• AI authority linking
• AI MARC → BIBFRAME conversion
• AI subject suggestion (LCSH / FAST / Wikidata)

The system must produce real BIBFRAME JSON-LD records.

PHASE 1 — AI METADATA SUGGESTIONS (Editor Assistant)

Inside the cataloging editor:

When a cataloger enters:

Title
ISBN
Author
Description
Table of contents
PDF / text

The AI must automatically suggest:

BIBFRAME fields:

bf:title
bf:contribution
bf:subject
bf:genreForm
bf:classification
bf:language
bf:summary
bf:extent
bf:identifiedBy

AI must return suggestions as valid JSON-LD fragments.

Example output:

{
 "@type": "bf:Work",
 "bf:title": {
   "@type": "bf:Title",
   "bf:mainTitle": "Artificial Intelligence in Libraries"
 },
 "bf:subject": [
   {
     "@id": "http://id.loc.gov/authorities/subjects/sh85008180",
     "rdfs:label": "Artificial intelligence"
   }
 ]
}

Features:

Auto-fill button
Confidence scores
Explain suggestion
Accept / reject fields

PHASE 2 — AI DUPLICATE DETECTION

The system must detect:

Duplicate works
Duplicate instances
Variant editions
Translations

Use AI embeddings to cluster:

Title similarity
Author similarity
Subject similarity

Algorithm:

vector embedding search

Fields analyzed:

title
author
publisher
year
subjects

Output:

Possible duplicates

Example:

Possible duplicates:

1. The Great Gatsby (1925)
2. The Great Gatsby (Penguin edition)
3. The Great Gatsby (Spanish translation)

The system suggests linking:

bf:translationOf
bf:instanceOf
bf:hasInstance

PHASE 3 — AI NATURAL LANGUAGE DISCOVERY

Users should be able to search like:

“books about artificial intelligence written after 2015”

AI converts query into:

Linked Data query.

Example:

Natural query:

“Arabic books about Islamic history”

Converted to:

SPARQL or search DSL.

Sources searched:

Internal BIBFRAME catalog
Library of Congress authority data
VIAF
Wikidata
OCLC

Results returned as BIBFRAME entities.

PHASE 4 — AI SPARQL GENERATOR

User writes:

“find all works by Isaac Asimov translated into Arabic”

AI generates:

SPARQL query.

Example:

SELECT ?work ?title
WHERE {
 ?work a bf:Work .
 ?work bf:contribution ?c .
 ?c bf:agent <http://viaf.org/viaf/96994048> .
 ?work bf:language <http://id.loc.gov/vocabulary/languages/ara>
}

This query runs against:

Triple store.

PHASE 5 — AI AUTO-FILL CATALOGING

When cataloger enters:

ISBN

AI must automatically fetch metadata from:

Open Library
Google Books
WorldCat

AI then converts metadata into:

BIBFRAME JSON-LD.

Also suggest:

LCSH subjects
FAST subjects
classification numbers

AI AUTHORITY LINKING

When entering:

Author
Subject
Place
Publisher

AI must search:

Library of Congress
VIAF
Wikidata

Then recommend best URI.

Example:

Author suggestion:

Isaac Asimov
URI: http://viaf.org/viaf/96994048
Confidence: 98%
BACKEND AI ARCHITECTURE

Server API:

POST /api/ai/suggest-metadata
POST /api/ai/detect-duplicates
POST /api/ai/natural-search
POST /api/ai/sparql-generator
POST /api/ai/autofill

Backend stack:

Node.js / Deno
Supabase
PostgreSQL
Vector database (pgvector)

Triple store:

Blazegraph
Fuseki
GraphDB

DISCOVERY LAYER

Create Linked Data OPAC.

Features:

Faceted search
Graph navigation
Mind-map visualization
Entity pages (Work / Instance / Agent)

Entities have persistent URIs.

Example:

/work/123
/instance/456
/agent/789

Content negotiation:

HTML
JSON-LD
RDF
Turtle

SECURITY

OpenAI API key stored on server only.

Environment:

OPENAI_API_KEY=xxxx

Never expose to frontend.

Frontend calls:

POST /api/ai/*
USER INTERFACE

AI panel inside editor.

Buttons:

AI Suggest Metadata
AI Detect Duplicates
AI Suggest Subjects
AI Auto-Fill ISBN
AI Generate SPARQL

Display confidence scores.

FINAL RESULT

MOON becomes:

AI-assisted BIBFRAME cataloging system.

Features:

Linked Data editor
Authority linking
AI metadata generation
AI duplicate detection
AI semantic discovery
AI SPARQL generation

Produces real BIBFRAME records.

If you want, I can also show you:

1️⃣ The architecture of a real Linked Data discovery layer like WorldCat / Share-VDE
2️⃣ The best triple store for MOON (Blazegraph vs GraphDB vs Fuseki)
3️⃣ How to build the OPAC discovery interface like Share-VDE