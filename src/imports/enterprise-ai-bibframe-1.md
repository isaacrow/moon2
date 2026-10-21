SUPER PROMPT
Enterprise AI Layer for BIBFRAME Union Catalog (Level 3)

You are designing an enterprise-grade AI augmentation system for a Linked Data union catalog platform built on BIBFRAME, RDF, SPARQL, OpenSearch, and a triple store.

The AI system must enhance the platform without compromising semantic integrity, authority control, provenance, or RDF structure.

AI is assistive, not authoritative.

🎯 OVERALL PRINCIPLES

AI must never directly mutate canonical RDF.

AI suggestions must require human validation (except explicitly configured autofill).

All AI outputs must be logged.

AI-generated data must be stored separately from authoritative RDF.

AI must respect URI-based authority control.

No hallucinated identifiers allowed.

All AI interactions must be auditable.

🔹 PHASE 1 — AI Metadata Suggestions in Editor
Objective

Enhance cataloging efficiency by suggesting structured metadata aligned with BIBFRAME.

Trigger Points

When user enters:

Title

Author name

ISBN

Publisher

Abstract text

Uploaded PDF

AI Must Suggest

Subjects (aligned with LCSH pattern)

Genre/Form

Relator roles

Language detection

Publication year extraction

Series detection

Summary generation

Authority reconciliation candidates

Architecture
Editor UI
    ↓
AI Suggestion API
    ↓
Suggestion Engine
    ↓
Return structured JSON suggestions
    ↓
User Review Panel
    ↓
User Approves → Convert to RDF triples
Output Format Example
{
  "suggestedSubjects": [
    {
      "label": "Irrigation—History",
      "confidence": 0.91
    }
  ],
  "suggestedGenre": "Historical monograph",
  "confidenceScores": {...}
}

Never insert directly into RDF without user confirmation.

🔹 PHASE 2 — AI Duplicate Detection in Clustering
Objective

Improve union catalog work-level clustering.

AI Role

Calculate semantic similarity between works using:

Title embeddings

Author similarity

ISBN match

Publication year proximity

Subject overlap

Architecture
Ingestion Pipeline
    ↓
Embedding Generator
    ↓
Vector Database
    ↓
Similarity Engine
    ↓
Return Similarity Score
Rules

If:

ISBN exact match → high confidence

Title similarity > threshold AND author similarity > threshold → suggest merge

AI returns probability score:

{
  "candidateWork": "uuid-123",
  "similarityScore": 0.87,
  "mergeRecommendation": "Review Required"
}

System never auto-merges without governance rule.

🔹 PHASE 3 — AI Natural Language Discovery
Objective

Allow users to search in natural language.

Example:
“Arabic books about irrigation before 1950 held in Baghdad”

AI Tasks

Parse intent

Extract filters

Expand synonyms

Translate to structured search query

Architecture
User Query
    ↓
AI Query Parser
    ↓
Structured Search Object
    ↓
OpenSearch + Filters
    ↓
Ranked Results

Example structured query output:

{
  "keywords": "irrigation",
  "language": "Arabic",
  "yearBefore": 1950,
  "institution": "Baghdad"
}

AI enhances search. It does not replace search engine.

🔹 PHASE 4 — AI SPARQL Translator
Objective

Enable natural language to SPARQL for power users.

Example:
“Show all works about irrigation by Iraqi authors”

Architecture
User NL Query
    ↓
AI NL → SPARQL Generator
    ↓
SPARQL Validation Layer
    ↓
Execute SELECT only
    ↓
Return Results

AI must generate only safe queries.

Disallowed:

SPARQL UPDATE

DELETE

INSERT

Example output:

SELECT ?work WHERE {
  ?work a bf:Work .
  ?work bf:subject ?s .
  FILTER(CONTAINS(LCASE(?s), "irrigation"))
}

Add validation guard before execution.

🔹 PHASE 5 — AI Auto Fill (Controlled Mode)
Objective

Speed up cataloging using structured AI-assisted autofill.

Trigger

User enters ISBN or title.

Process
Input ISBN
    ↓
External Lookup (Open Library / other APIs)
    ↓
AI Mapping Engine
    ↓
Map metadata to BIBFRAME structure
    ↓
Preview Screen
    ↓
User Approves → Save

Auto-fill must:

Preserve authority URIs

Map to correct BIBFRAME predicates

Avoid overwriting existing confirmed fields

Example mapping:

{
  "bf:title": "...",
  "bf:contribution": "...",
  "bf:provisionActivity": "...",
  "bf:identifiedBy": "ISBN"
}

User confirmation required unless system configured for trusted sources.

🔐 SECURITY & GOVERNANCE

All AI interactions must:

• Log prompt
• Log response
• Log user decision
• Log timestamp

Audit table:

ai_interactions
- id
- user_id
- feature_phase
- input
- output
- approved (boolean)
- timestamp
🧠 OPTIONAL ADVANCED LAYER

Add vector search hybrid ranking:

Combine:
• OpenSearch text relevance
• Vector similarity
• AI ranking re-score

This gives enterprise discovery intelligence.

🏗 DEPLOYMENT MODEL

AI Microservice:

Containerized service:

• Embedding service
• NLP parser
• SPARQL generator
• Metadata suggestion engine

Never mix AI logic inside RDF store.

📊 SUCCESS METRICS

Phase 1:
• % metadata suggestions accepted

Phase 2:
• Duplicate detection precision

Phase 3:
• Search satisfaction improvement

Phase 4:
• SPARQL query success rate

Phase 5:
• Cataloging time reduction

🚨 DO NOT

❌ Auto-create authority URIs
❌ Fabricate LCSH headings
❌ Mutate published records
❌ Replace canonical RDF with AI text
❌ Allow unrestricted SPARQL execution

🎯 FINAL GOAL

Transform the union catalog into:

• AI-assisted semantic cataloging system
• Intelligent clustering engine
• Natural language discovery platform
• Linked Data research interface
• Enterprise-grade infrastructure

Comparable in architecture ambition to:

• OCLC
• Europeana