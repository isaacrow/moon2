SUPER PROMPT
Build a Multi-AI Agent System for the MOON BIBFRAME Platform

You are a Senior AI Systems Architect specializing in Linked Data, Knowledge Graphs, and Library Metadata Systems (BIBFRAME / MARC / RDF).

Your task is to design and implement a Multi-AI Agent System inside the MOON cataloging platform.

The system must integrate AI models from:

OpenAI

**Google Gemini

**Meta Llama API

The architecture must allow all models to operate simultaneously and be orchestrated by a central AI agent.

The system must support BIBFRAME cataloging workflows, linked data enrichment, discovery, and knowledge graph generation.

1 SYSTEM ARCHITECTURE

Create a central AI orchestrator called:

MoonAIOrchestrator

This service routes tasks to different models depending on their strengths.

Architecture:

User
  ↓
Moon BIBFRAME Editor
  ↓
MoonAIOrchestrator
  ↓
AI Provider Router
  ├── OpenAI (metadata reasoning)
  ├── Gemini (knowledge extraction)
  └── Meta Llama (classification / clustering)

The orchestrator decides which model to use.

2 AI PROVIDER LAYER

Create provider adapters.

OpenAI Provider

Best for:

Metadata reasoning

Cataloging suggestions

Natural language interpretation

SPARQL generation

Example:

import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
Gemini Provider

Best for:

Entity extraction

Knowledge graph linking

Subject analysis

Example:

import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
Meta Llama Provider

Best for:

Duplicate detection

Record clustering

Text classification

Example:

POST https://api.llama.meta.com/v1/chat
3 AI TASK ROUTER

Create a routing engine.

MoonAITaskRouter.ts

Example logic:

if task == "metadata_suggestion"
    use OpenAI

if task == "entity_extraction"
    use Gemini

if task == "duplicate_detection"
    use Llama

if task == "sparql_generation"
    use OpenAI
4 AI FEATURES FOR THE MOON BIBFRAME SYSTEM
Phase 1 — AI Metadata Suggestions

AI analyzes:

title

ISBN

description

Then suggests:

bf:contribution
bf:subject
bf:genreForm
bf:classification

Output must be valid BIBFRAME RDF triples.

Example output:

bf:Work
  bf:title "History of Iraq"
  bf:contribution
      bf:Agent "Ali Hassan"
Phase 2 — AI Duplicate Detection

AI scans catalog.

Detect:

same ISBN
same title
similar author
similar publication year

Create clusters.

Phase 3 — AI Natural Language Discovery

Users search using natural language:

"Arabic books about Islamic philosophy published after 2000"

AI converts to:

SPARQL
Elasticsearch DSL
Phase 4 — AI SPARQL Generator

Example input:

Find works by Naguib Mahfouz

AI outputs:

SELECT ?work WHERE {
 ?work a bf:Work .
 ?work bf:contribution ?c .
 ?c bf:agent ?agent .
 ?agent rdfs:label "Naguib Mahfouz"
}
Phase 5 — AI Auto-Fill

AI automatically fills missing fields:

publisher
place
subjects
contributors
language

Using sources like:

Library of Congress

VIAF

Wikidata

OCLC

6 LINKED DATA INTEGRATION

AI must enrich records using linked data.

Example sources:

id.loc.gov

Wikidata

VIAF

FAST

Share-VDE

AI must convert results into:

BIBFRAME RDF
JSON-LD
Turtle
7 DISCOVERY AI

AI improves discovery layer.

Capabilities:

semantic search

entity linking

recommendation engine

Example:

User searches:

Islamic history

AI returns:

works
authors
subjects
related works
8 KNOWLEDGE GRAPH GENERATION

AI constructs a graph.

Work
  ↕
Author
  ↕
Subject
  ↕
Publisher

Graph stored in:

RDF triple store

Recommended engines:

Blazegraph

GraphDB

Apache Jena Fuseki

9 SECURITY

Keys must be stored in environment variables.

OPENAI_API_KEY
GEMINI_API_KEY
META_API_KEY

Never expose keys to frontend.

10 EXPECTED RESULT

The MOON system becomes:

AI-assisted BIBFRAME cataloging platform
+
Linked data knowledge graph
+
AI discovery engine

Capabilities:

automatic cataloging

semantic discovery

duplicate detection

AI metadata enrichment

SPARQL generation

linked data integration