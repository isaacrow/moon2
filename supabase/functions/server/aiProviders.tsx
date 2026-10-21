/**
 * MOON DIJLA - AI Provider Adapters (Class-Based)
 * 
 * Production-grade provider classes for:
 *   - OpenAI GPT (gpt-4o-mini)
 *   - Google Gemini (gemini-1.5-flash)
 *   - Meta LLaMA (via Groq / Together AI)
 * 
 * Each provider exposes:
 *   generateText()
 *   suggestMetadata()
 *   entityLink()
 *   translateToSPARQL()
 *   detectDuplicates()
 *   autoFill()
 *   enhanceDiscovery()
 * 
 * Providers auto-disable if API key is missing.
 * AI is assistive, never authoritative.
 */

// ─── Base Types ──────────────────────────────────────────────────

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  confidence: number;
  timestamp: string;
  latencyMs: number;
}

export interface MetadataResult {
  suggestedSubjects: Array<{ label: string; confidence: number }>;
  suggestedGenre: Array<{ label: string; confidence: number }>;
  suggestedRelatorRoles: Array<{ label: string; confidence: number; source?: string }>;
  detectedLanguage: { code: string; label: string; confidence: number } | null;
  extractedYear: { year: number; confidence: number } | null;
  suggestedSeries: Array<{ label: string; confidence: number }>;
  generatedSummary: string | null;
  authorityCandidates: Array<{ label: string; confidence: number }>;
}

export interface EntityLinkResult {
  candidates: Array<{
    label: string;
    uri: string;
    source: string;
    confidence: number;
    description?: string;
  }>;
  bestMatch: { label: string; uri: string; source: string; confidence: number } | null;
}

export interface SPARQLResult {
  sparqlQuery: string;
  explanation: string;
  isSafe: boolean;
  warnings: string[];
}

export interface DuplicateResult {
  candidates: Array<{
    candidateId: string;
    candidateTitle: string;
    similarityScore: number;
    matchReasons: string[];
    mergeRecommendation: "Auto-Merge" | "Review Required" | "Low Confidence";
  }>;
}

export interface AutoFillResult {
  mappedFields: Record<string, any>;
  sources: string[];
  confidence: number;
  unmappedFields: string[];
  bibframeTriples: Array<{ predicate: string; value: string; type?: string }>;
}

export interface DiscoveryEnhancement {
  rewrittenQuery: string;
  expandedSubjects: string[];
  relatedEntities: Array<{ label: string; type: string; relevance: number }>;
  suggestedFilters: Record<string, string>;
  synonyms: string[];
}

// ─── Utility ─────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 30000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function safeJsonParse(text: string, fallback: any = {}): any {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (match) { try { return JSON.parse(match[1]); } catch { /* */ } }
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) { try { return JSON.parse(objMatch[0]); } catch { /* */ } }
    console.error("[AI-PROVIDER] JSON parse failed:", text.slice(0, 200));
    return fallback;
  }
}

// ─── BIBFRAME System Prompts ─────────────────────────────────────

const PROMPTS = {
  metadata: `You are a library science AI specializing in BIBFRAME cataloging and LCSH.
Analyze bibliographic metadata and return structured cataloging suggestions.
RULES:
- Suggest LCSH-aligned subjects
- Suggest LCGFT genres
- MARC relator roles (aut, edt, trl, etc.)
- Detect language (ISO 639-2/B)
- Extract year if mentioned
- Generate 1-2 sentence summary
- Confidence 0.0-1.0
- NEVER fabricate authority URIs
Return JSON:
{
  "suggestedSubjects":[{"label":"...","confidence":0.0}],
  "suggestedGenre":[{"label":"...","confidence":0.0}],
  "suggestedRelatorRoles":[{"label":"...","confidence":0.0,"source":"code"}],
  "detectedLanguage":{"code":"eng","label":"English","confidence":0.0},
  "extractedYear":{"year":2024,"confidence":0.0},
  "suggestedSeries":[{"label":"...","confidence":0.0}],
  "generatedSummary":"...",
  "authorityCandidates":[{"label":"Name, Form","confidence":0.0}]
}`,

  entityLink: `You are a linked data entity resolution AI.
Given an entity name and type, suggest matching authority records.
Sources: Library of Congress, VIAF, Wikidata, FAST.
Return JSON:
{
  "candidates":[{"label":"...","uri":"...","source":"LOC|VIAF|Wikidata|FAST","confidence":0.0,"description":"..."}],
  "bestMatch":{"label":"...","uri":"...","source":"...","confidence":0.0}
}`,

  sparql: `You are a SPARQL query generator for BIBFRAME linked data.
PREFIXES: bf:, rdfs:, rdf:, madsrdf:
RULES:
- ONLY SELECT queries
- NEVER INSERT/DELETE/UPDATE/DROP/CLEAR
- Use FILTER with CONTAINS/LCASE for text
- Add LIMIT 100
- Include OPTIONAL for non-required fields
Return JSON:
{
  "sparqlQuery":"SELECT ...",
  "explanation":"...",
  "isSafe":true,
  "warnings":[]
}`,

  duplicates: `You are a library duplicate detection AI.
Compare a new record against existing records.
RULES:
- ISBN exact match = high confidence (0.95+)
- Title+Author match = medium-high (0.75-0.94)
- Only suggest if similarity > 0.5
- NEVER auto-merge for scores < 0.95
Return JSON:
{
  "candidates":[{"candidateId":"...","candidateTitle":"...","similarityScore":0.0,"matchReasons":["..."],"mergeRecommendation":"Auto-Merge|Review Required|Low Confidence"}]
}`,

  autofill: `You are a BIBFRAME cataloging AI mapping metadata from external sources.
Map to correct BIBFRAME predicates: bf:title, bf:contribution, bf:provisionActivity, bf:identifiedBy, etc.
Cross-reference multiple sources for accuracy.
Return JSON:
{
  "mappedFields":{"bf:title":{"@type":"bf:Title","bf:mainTitle":"..."}},
  "sources":["..."],
  "confidence":0.0,
  "unmappedFields":["..."],
  "bibframeTriples":[{"predicate":"bf:title","value":"...","type":"bf:Title"}]
}`,

  discovery: `You are a library discovery enhancement AI.
Given a user search query, enhance it for better BIBFRAME catalog discovery.
RULES:
- Rewrite query for precision
- Expand subjects with related LCSH terms
- Find related entities (authors, works, topics)
- Suggest facet filters
- Provide synonyms in English and Arabic
Return JSON:
{
  "rewrittenQuery":"...",
  "expandedSubjects":["..."],
  "relatedEntities":[{"label":"...","type":"Person|Work|Topic","relevance":0.0}],
  "suggestedFilters":{"language":"...","dateRange":"..."},
  "synonyms":["..."]
}`,

  naturalSearch: `You are a library search AI converting natural language to structured search.
Extract: keywords, language (ISO 639-2/B), year ranges, subject, author, format, location.
Support multilingual queries (Arabic, English).
Return JSON:
{
  "keywords":"...",
  "language":null,
  "yearBefore":null,
  "yearAfter":null,
  "subject":null,
  "author":null,
  "format":null,
  "location":null
}`,
};

// ═══════════════════════════════════════════════════════════
// ABSTRACT PROVIDER BASE
// ═══════════════════════════════════════════════════════════

export abstract class AIProviderBase {
  abstract readonly name: string;
  abstract readonly model: string;

  abstract isAvailable(): boolean;
  abstract generateText(systemPrompt: string, userPrompt: string, temperature?: number, maxTokens?: number): Promise<string>;

  async suggestMetadata(input: { title?: string; author?: string; isbn?: string; publisher?: string; abstract?: string }): Promise<MetadataResult> {
    const parts: string[] = [];
    if (input.title) parts.push(`Title: ${input.title}`);
    if (input.author) parts.push(`Author: ${input.author}`);
    if (input.isbn) parts.push(`ISBN: ${input.isbn}`);
    if (input.publisher) parts.push(`Publisher: ${input.publisher}`);
    if (input.abstract) parts.push(`Abstract: ${input.abstract}`);
    const raw = await this.generateText(PROMPTS.metadata, `Analyze:\n\n${parts.join("\n")}`);
    return safeJsonParse(raw, {
      suggestedSubjects: [], suggestedGenre: [], suggestedRelatorRoles: [],
      detectedLanguage: null, extractedYear: null, suggestedSeries: [],
      generatedSummary: null, authorityCandidates: [],
    });
  }

  async entityLink(input: { entityName: string; entityType: string; context?: string }): Promise<EntityLinkResult> {
    const prompt = `Resolve entity:\nName: ${input.entityName}\nType: ${input.entityType}\n${input.context ? `Context: ${input.context}` : ""}`;
    const raw = await this.generateText(PROMPTS.entityLink, prompt);
    return safeJsonParse(raw, { candidates: [], bestMatch: null });
  }

  async translateToSPARQL(query: string): Promise<SPARQLResult> {
    const raw = await this.generateText(PROMPTS.sparql, `Convert: "${query}"`);
    const result = safeJsonParse(raw, { sparqlQuery: "# Error", explanation: "", isSafe: false, warnings: ["Parse error"] });
    // Safety validation
    const dangerous = /\b(INSERT|DELETE|UPDATE|DROP|CLEAR|CREATE|LOAD|MOVE|COPY|ADD)\b/i;
    if (result.sparqlQuery && dangerous.test(result.sparqlQuery)) {
      result.isSafe = false;
      result.warnings = [...(result.warnings || []), "BLOCKED: Mutating operations detected"];
      result.sparqlQuery = "# BLOCKED: Unsafe query";
    }
    return result;
  }

  async detectDuplicates(input: { title: string; author?: string; isbn?: string; existingRecords: any[] }): Promise<DuplicateResult> {
    const summaries = input.existingRecords.slice(0, 30).map((r: any) => ({
      id: r.id, title: r.title || "Unknown",
      author: r.document?.["bf:contribution"]?.[0]?.["bf:agent"]?.["rdfs:label"] || "",
    }));
    const prompt = `New record:\nTitle: ${input.title}\nAuthor: ${input.author || "N/A"}\nISBN: ${input.isbn || "N/A"}\n\nExisting:\n${JSON.stringify(summaries, null, 2)}`;
    const raw = await this.generateText(PROMPTS.duplicates, prompt);
    return safeJsonParse(raw, { candidates: [] });
  }

  async autoFill(input: { title?: string; author?: string; isbn?: string; enrichmentData?: string }): Promise<AutoFillResult> {
    const parts: string[] = [];
    if (input.title) parts.push(`Title: ${input.title}`);
    if (input.author) parts.push(`Author: ${input.author}`);
    if (input.isbn) parts.push(`ISBN: ${input.isbn}`);
    if (input.enrichmentData) parts.push(`\nEnrichment data:\n${input.enrichmentData}`);
    const raw = await this.generateText(PROMPTS.autofill, `Auto-fill BIBFRAME:\n\n${parts.join("\n")}`);
    return safeJsonParse(raw, { mappedFields: {}, sources: [], confidence: 0, unmappedFields: [], bibframeTriples: [] });
  }

  async enhanceDiscovery(query: string): Promise<DiscoveryEnhancement> {
    const raw = await this.generateText(PROMPTS.discovery, `Enhance search: "${query}"`);
    return safeJsonParse(raw, { rewrittenQuery: query, expandedSubjects: [], relatedEntities: [], suggestedFilters: {}, synonyms: [] });
  }

  async naturalSearch(query: string): Promise<any> {
    const raw = await this.generateText(PROMPTS.naturalSearch, `Parse: "${query}"`);
    return safeJsonParse(raw, { keywords: query });
  }
}

// ═══════════════════════════════════════════════════════════
// OPENAI PROVIDER
// ═══════════════════════════════════════════════════════════

export class OpenAIProvider extends AIProviderBase {
  readonly name = "openai";
  readonly model = "gpt-4o-mini";

  isAvailable(): boolean {
    const key = Deno.env.get("OPENAI_API_KEY");
    return !!(key && key.trim().length >= 20);
  }

  async generateText(systemPrompt: string, userPrompt: string, temperature = 0.3, maxTokens = 2000): Promise<string> {
    const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
    if (!apiKey || apiKey.length < 20) throw new Error("OPENAI_API_KEY not configured");

    console.log(`[OpenAI] Calling gpt-4o-mini (temp=${temperature})`);
    const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      }),
    }, 30000);

    if (!response.ok) {
      const errText = await response.text().catch(() => "unknown");
      if (response.status === 401) throw new Error("OpenAI API key invalid or expired");
      if (response.status === 429) throw new Error("OpenAI rate limit exceeded");
      throw new Error(`OpenAI error (${response.status}): ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned empty content");
    return content;
  }
}

// ═══════════════════════════════════════════════════════════
// GEMINI PROVIDER
// ═══════════════════════════════════════════════════════════

export class GeminiProvider extends AIProviderBase {
  readonly name = "gemini";
  readonly model = "gemini-1.5-flash";

  isAvailable(): boolean {
    const key = Deno.env.get("GEMINI_API_KEY");
    return !!(key && key.trim().length >= 10);
  }

  async generateText(systemPrompt: string, userPrompt: string, temperature = 0.3, maxTokens = 2000): Promise<string> {
    const apiKey = Deno.env.get("GEMINI_API_KEY")?.trim();
    if (!apiKey || apiKey.length < 10) throw new Error("GEMINI_API_KEY not configured");

    console.log(`[Gemini] Calling gemini-1.5-flash (temp=${temperature})`);
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens, responseMimeType: "application/json" },
        }),
      },
      30000
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "unknown");
      if (response.status === 401 || response.status === 403) throw new Error("Gemini API key invalid");
      if (response.status === 429) throw new Error("Gemini rate limit exceeded");
      throw new Error(`Gemini error (${response.status}): ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("Gemini returned empty content");
    return content;
  }
}

// ═══════════════════════════════════════════════════════════
// LLAMA PROVIDER (via Groq / Together AI)
// ═══════════════════════════════════════════════════════════

export class LlamaProvider extends AIProviderBase {
  readonly name = "llama";
  readonly model = "llama-3.1-70b-versatile";

  isAvailable(): boolean {
    const key = Deno.env.get("LLAMA_API_KEY");
    return !!(key && key.trim().length >= 10);
  }

  async generateText(systemPrompt: string, userPrompt: string, temperature = 0.3, maxTokens = 2000): Promise<string> {
    const apiKey = Deno.env.get("LLAMA_API_KEY")?.trim();
    if (!apiKey || apiKey.length < 10) throw new Error("LLAMA_API_KEY not configured");

    // Detect provider: Groq uses groq.com, Together uses together.xyz
    const apiUrl = Deno.env.get("LLAMA_API_URL") || "https://api.groq.com/openai/v1/chat/completions";
    const modelName = Deno.env.get("LLAMA_MODEL") || this.model;

    console.log(`[LLaMA] Calling ${modelName} via ${new URL(apiUrl).hostname}`);
    const response = await fetchWithTimeout(apiUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      }),
    }, 30000);

    if (!response.ok) {
      const errText = await response.text().catch(() => "unknown");
      if (response.status === 401) throw new Error("LLaMA API key invalid");
      if (response.status === 429) throw new Error("LLaMA rate limit exceeded");
      throw new Error(`LLaMA error (${response.status}): ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("LLaMA returned empty content");
    return content;
  }
}

// ═══════════════════════════════════════════════════════════
// PROVIDER REGISTRY
// ═══════════════════════════════════════════════════════════

export const providerRegistry: Record<string, AIProviderBase> = {
  openai: new OpenAIProvider(),
  gemini: new GeminiProvider(),
  llama: new LlamaProvider(),
};

export function getProvider(name: string): AIProviderBase | null {
  return providerRegistry[name] || null;
}

export function getAvailableProviders(): AIProviderBase[] {
  return Object.values(providerRegistry).filter(p => p.isAvailable());
}