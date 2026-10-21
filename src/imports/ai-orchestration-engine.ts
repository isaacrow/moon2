You are a Senior AI Systems Architect and Linked Data Engineer.

Your task is to implement the complete Multi-AI Orchestration Engine for the MOON DIJLA BIBFRAME platform.

The platform already has a frontend dashboard showing AI providers (OpenAI, Gemini, LLaMA), but currently it does not have a real orchestration backend.

You must implement a production-grade AI router that allows MOON DIJLA to use multiple AI providers simultaneously with intelligent routing, fallback, and health monitoring.

SYSTEM CONTEXT

MOON DIJLA is a Linked Data cataloging platform inspired by:

- Library of Congress BIBFRAME Editor
- Sinopia
- FOLIO
- Share-VDE
- Wikidata

The system performs AI tasks for cataloging and discovery:

1 Metadata suggestion
2 Entity linking
3 Duplicate detection
4 Natural language discovery
5 SPARQL query translation
6 Metadata auto-fill

The router must choose the best AI model for each task.

--------------------------------

ARCHITECTURE REQUIREMENTS

Backend stack:

Deno
TypeScript
Supabase Edge Functions
REST API
JSON responses

Create a new module:

/ai-router/engine.ts

--------------------------------

AI PROVIDERS TO SUPPORT

1 OpenAI
2 Google Gemini
3 Meta LLaMA (via Groq or Together API)

Provider adapters must be implemented as classes.

Example:

OpenAIProvider
GeminiProvider
LlamaProvider

Each provider must expose:

generateText()
suggestMetadata()
entityLink()
translateToSPARQL()

--------------------------------

PROVIDER CONFIGURATION

Environment variables:

OPENAI_API_KEY=
GEMINI_API_KEY=
LLAMA_API_KEY=

Providers should automatically disable if the key is missing.

--------------------------------

AI ROUTING TABLE

Implement the routing strategy:

Metadata generation

Primary: OpenAI
Fallback: Gemini
Fallback: LLaMA

Entity linking

Primary: Gemini
Fallback: OpenAI
Fallback: LLaMA

Duplicate detection

Primary: LLaMA
Fallback: OpenAI

Natural language discovery

Primary: OpenAI
Fallback: Gemini

SPARQL translation

Primary: OpenAI
Fallback: Gemini

Auto-fill

Primary: OpenAI
Fallback: Gemini
Fallback: LLaMA

--------------------------------

SMART ROUTING ENGINE

The router must:

select provider
fallback if failure
track latency
track success rate
track error count

Example logic:

try primary provider
if fails -> fallback
if fails -> fallback
log routing decision

--------------------------------

ROUTING LOG MODEL

Store every routing decision:

taskType
selectedProvider
fallbackUsed
latency
success
timestamp

Store in Supabase table:

ai_routing_log

--------------------------------

API ENDPOINTS

POST /ai-router/suggest-metadata

Input

{
"title":"Book title"
}

Output

{
"title":"...",
"subjects":[],
"authors":[],
"_routedVia":"openai",
"_latencyMs":340
}

--------------------------------

POST /ai-router/entity-linking

Input

{
"entityName":"Isaac Newton",
"entityType":"Person"
}

--------------------------------

POST /ai-router/natural-search

Input

{
"query":"books about islamic philosophy in iraq"
}

--------------------------------

POST /ai-router/sparql-translate

Input

{
"query":"Find books written by Al-Farabi"
}

Output

SPARQL query.

--------------------------------

HEALTH MONITOR

Implement provider health tracking:

availability
average latency
success rate
error count

Endpoint:

GET /ai-router/status

--------------------------------

CIRCUIT BREAKER

If a provider fails 5 times consecutively:

disable provider for 5 minutes.

--------------------------------

AI GOVERNANCE

All AI output must include metadata:

provider
confidence
timestamp

The system must NEVER modify BIBFRAME records automatically.

AI output is always suggestions.

--------------------------------

DISCOVERY INTEGRATION

Allow AI to enhance discovery by:

rewriting user queries
expanding subjects
finding related entities

--------------------------------

CODE QUALITY

Use modular architecture:

/ai-router/providers/openai.ts
/ai-router/providers/gemini.ts
/ai-router/providers/llama.ts

/ai-router/engine.ts
/ai-router/router.ts

--------------------------------

EXPECTED RESULT

MOON DIJLA becomes a real enterprise AI cataloging platform capable of:

multi-AI orchestration
provider fallback
AI governance
cataloging assistance
natural language discovery
linked data intelligence

The implementation must be production-ready.