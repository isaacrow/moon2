ROLE
You are a senior library systems architect, semantic web engineer,
and AI infrastructure developer.

Your task is to design and implement the core architecture of
MOON DIJLA — an enterprise BIBFRAME linked data cataloging
and discovery platform with integrated multi-AI intelligence.

The system must produce REAL BIBFRAME RDF records,
support Linked Data authority resolution,
and provide AI-assisted cataloging.

The system must integrate multiple AI engines simultaneously.

AI PROVIDERS

Primary AI Engines:

OpenAI GPT
Google Gemini
Meta LLaMA

The system must support a multi-AI routing architecture.

Example routing logic:

metadata generation → OpenAI
entity linking → Gemini
duplicate detection → LLaMA
natural language discovery → hybrid

If one AI fails, automatically fallback to another.

----------------------------------

CORE SYSTEM NAME

MOON DIJLA

----------------------------------

ARCHITECTURE

Frontend
React + TypeScript
Next.js
Tailwind UI

Cataloging Interface inspired by:

Marva
Sinopia
FOLIO

Features:

Work editor
Instance editor
Item editor
Authority linking
MARC preview
RDF preview
URI resolution

----------------------------------

BACKEND

Node.js / Deno
Supabase

Core services:

BIBFRAME RDF engine
AI orchestration engine
Discovery federation engine
Authority resolution engine
SPARQL query engine

----------------------------------

DATABASE

PostgreSQL

Tables:

works
instances
items
agents
subjects
identifiers
relationships

Each record stores:

uri
rdf_graph
json_index
search_vector
source

----------------------------------

TRIPLE STORE

Deploy RDF store:

Apache Jena Fuseki
or Blazegraph

Expose:

SPARQL endpoint
content negotiation
RDF serialization

----------------------------------

BIBFRAME MODEL

Support full ontology:

bf:Work
bf:Instance
bf:Item
bf:Agent
bf:Subject
bf:Place
bf:Event

Properties:

bf:title
bf:contribution
bf:language
bf:genreForm
bf:identifiedBy
bf:subject
bf:provisionActivity
bf:extent
bf:carrier
bf:media

Records must export as:

JSON-LD
RDF/XML
Turtle
N-Triples

----------------------------------

AUTHORITY LINKING

Integrate APIs:

Library of Congress
id.loc.gov

VIAF

Wikidata

FAST

OpenLibrary

System automatically resolves:

names
subjects
places
works

----------------------------------

AI ENGINE

Create AI Orchestrator:

/ai/router.ts

Responsibilities:

route task to best AI provider
handle retries
handle fallbacks
merge AI results

----------------------------------

AI PHASES

Phase 1
AI metadata suggestions

Input:

title
isbn
author

Output:

bf:title
bf:subject
bf:language
bf:classification
bf:summary

----------------------------------

Phase 2
AI duplicate detection

Use embeddings to detect:

duplicate works
same manifestations
variant titles

Cluster records.

----------------------------------

Phase 3
Natural language discovery

User query:

"books about Islamic philosophy in the 10th century"

AI converts query to:

SPARQL
or
Elasticsearch query

----------------------------------

Phase 4
AI SPARQL translator

User asks:

"Show works written in Baghdad in 1900"

AI converts to SPARQL.

----------------------------------

Phase 5
AI autofill

When cataloger types:

title

AI suggests:

subjects
author
classification
series
related works

----------------------------------

DISCOVERY LAYER

Linked Data discovery engine.

Sources:

Internal catalog
Library of Congress
VIAF
Wikidata
OpenLibrary
Share-VDE catalogs

Use provider pattern:

providers = [
internalProvider,
locProvider,
viafProvider,
wikidataProvider
]

Search merges and deduplicates results.

----------------------------------

SEARCH ENGINE

Elasticsearch or OpenSearch

Index fields:

title
agent
subject
year
language
identifier

Support:

facets
filters
semantic search

----------------------------------

URI STRATEGY

Every entity must have stable URI.

Example:

/work/12345
/instance/12345
/item/12345
/agent/12345

Support HTTP content negotiation.

----------------------------------

RDF ENDPOINT

GET /work/12345

Returns:

HTML page for humans
JSON-LD for machines
RDF/XML
Turtle

----------------------------------

EDITOR FEATURES

BIBFRAME visual editor

Graph relationships:

Work → Instance → Item

Drag-drop entity linking.

----------------------------------

CATALOGER TOOLS

Add toolbar tools:

LC Cutter calculator
Authority search
Classification lookup
ISBN metadata import
OCLC lookup

----------------------------------

AI GOVERNANCE

All AI outputs must be:

reviewable
editable
traceable

Cataloger is always final authority.

----------------------------------

GOAL

Create the most advanced
AI-assisted BIBFRAME cataloging
and Linked Data discovery system
ever built for libraries.

Comparable to systems developed by:

Library of Congress
OCLC
Share-VDE

----------------------------------

OUTPUT

Produce:

full system architecture
API design
database schema
AI routing system
discovery federation
BIBFRAME record generator

The system must generate valid BIBFRAME RDF
ready for Linked Data publishing.