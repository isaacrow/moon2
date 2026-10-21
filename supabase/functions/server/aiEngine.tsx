/**
 * Enterprise AI Engine for BIBFRAME Union Catalog (Level 3)
 * 
 * MULTI-SOURCE FEDERATED LOOKUP:
 *   1. Open Library (ISBN + title)
 *   2. Google Books API (ISBN + title)
 *   3. CrossRef (DOI + title)
 *   4. ISBNdb (ISBN — if API key available)
 *   5. Library of Congress Search (title + author)
 *   6. WorldCat/OCLC Search API (title)
 *
 * AI is assistive, not authoritative.
 * AI never directly mutates canonical RDF.
 * All AI outputs are logged and auditable.
 */

import * as db from "./db.tsx";
const kv = { set: db.kvSet, get: db.kvGet, del: db.kvDel, getByPrefix: db.kvGetByPrefix };

// ─── Types ───────────────────────────────────────────────────────
export interface AISuggestion {
  label: string;
  uri?: string;
  confidence: number;
  source?: string;
}

export interface MetadataSuggestions {
  suggestedSubjects: AISuggestion[];
  suggestedGenre: AISuggestion[];
  suggestedRelatorRoles: AISuggestion[];
  detectedLanguage: { code: string; label: string; confidence: number } | null;
  extractedYear: { year: number; confidence: number } | null;
  suggestedSeries: AISuggestion[];
  generatedSummary: string | null;
  authorityCandidates: AISuggestion[];
}

export interface DuplicateCandidate {
  candidateId: string;
  candidateTitle: string;
  similarityScore: number;
  matchReasons: string[];
  mergeRecommendation: "Auto-Merge" | "Review Required" | "Low Confidence";
}

export interface StructuredSearch {
  keywords: string;
  language?: string;
  yearBefore?: number;
  yearAfter?: number;
  institution?: string;
  subject?: string;
  author?: string;
  format?: string;
  location?: string;
}

export interface SPARQLResult {
  sparqlQuery: string;
  explanation: string;
  isSafe: boolean;
  warnings: string[];
}

export interface AutoFillResult {
  sources: string[];
  confidence: number;
  mappedFields: Record<string, any>;
  unmappedFields: string[];
  bibframeTriples: Array<{ predicate: string; value: string; type?: string }>;
  rawSourceData?: Record<string, any>;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  featurePhase: string;
  input: any;
  output: any;
  approved: boolean | null;
  userId?: string;
  processingTimeMs: number;
}

// ─── Safe JSON parse ─────────────────────────────────────────────
function safeJsonParse(text: string, fallback: any = {}): any {
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code blocks
    const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (match) {
      try { return JSON.parse(match[1]); } catch { /* fall through */ }
    }
    // Try to find JSON object in text
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try { return JSON.parse(objMatch[0]); } catch { /* fall through */ }
    }
    console.error("[AI] Failed to parse JSON response:", text.slice(0, 200));
    return fallback;
  }
}

// ─── Fetch with timeout ──────────────────────────────────────────
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// ─── OpenAI Helper ───────────────────────────────────────────────
// Enterprise pattern: API key comes ONLY from backend environment variable.
// Frontend NEVER handles the key. Set via Supabase secrets.

function getOpenAIKey(): string {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key || key.trim().length < 20) {
    console.error(`[AI] OPENAI_API_KEY invalid — exists=${!!key}, length=${key?.length ?? 0}`);
    throw new Error(
      "OPENAI_API_KEY is not configured on the server. " +
      "Please set it as a Supabase secret (Settings → Edge Functions → Secrets)."
    );
  }
  return key.trim();
}

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.3,
  maxTokens = 2000
): Promise<string> {
  const apiKey = getOpenAIKey();
  console.log(`[AI] Calling OpenAI (model=gpt-4o-mini, temp=${temperature}, maxTokens=${maxTokens}, keyPrefix=${apiKey.slice(0, 7)}...)`);

  const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
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
    const errText = await response.text().catch(() => "unknown error");
    console.error(`[AI] OpenAI error ${response.status}: ${errText.slice(0, 300)}`);
    if (response.status === 401) {
      throw new Error("OpenAI API key is invalid or expired. Check your OPENAI_API_KEY secret.");
    }
    if (response.status === 429) {
      throw new Error("OpenAI rate limit exceeded. Please try again in a moment.");
    }
    if (response.status === 503 || response.status === 500) {
      throw new Error("OpenAI service is temporarily unavailable. Please try again.");
    }
    throw new Error(`OpenAI API error (${response.status}): ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    console.error("[AI] OpenAI returned empty content:", JSON.stringify(data).slice(0, 300));
    throw new Error("OpenAI returned empty response. Please try again.");
  }
  return content;
}

// ─── Audit Logger ───────────────────────────────────────────────
export async function logAudit(entry: Omit<AuditEntry, "id" | "timestamp">): Promise<string> {
  const id = `ai-audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const auditEntry: AuditEntry = {
    id,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  try {
    await kv.set(`ai:audit:${id}`, JSON.stringify(auditEntry));
  } catch (err) {
    console.error("[AI-AUDIT] Failed to save audit entry:", err);
  }
  console.log(`[AI-AUDIT] Phase=${entry.featurePhase} approved=${entry.approved} time=${entry.processingTimeMs}ms`);
  return id;
}

export async function getAuditLog(limit = 50): Promise<AuditEntry[]> {
  try {
    const entries = await kv.getByPrefix("ai:audit:");
    const parsed = entries
      .map((e: string) => { try { return JSON.parse(e); } catch { return null; } })
      .filter(Boolean) as AuditEntry[];
    parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return parsed.slice(0, limit);
  } catch (error) {
    console.error("[AI-AUDIT] Failed to fetch audit log:", error);
    return [];
  }
}

export async function updateAuditApproval(auditId: string, approved: boolean): Promise<void> {
  const raw = await kv.get(`ai:audit:${auditId}`);
  if (raw) {
    const entry = JSON.parse(raw);
    entry.approved = approved;
    await kv.set(`ai:audit:${auditId}`, JSON.stringify(entry));
  }
}

// ═══════════════════════════════════════════════════════════
// MULTI-SOURCE FEDERATED LOOKUP ENGINE
// ═══════════════════════════════════════════════════════════

interface SourceResult {
  source: string;
  data: any;
  success: boolean;
  error?: string;
}

// 1. Open Library — ISBN lookup
async function lookupOpenLibraryISBN(isbn: string): Promise<SourceResult> {
  try {
    const res = await fetchWithTimeout(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`, {}, 8000);
    if (!res.ok) return { source: "Open Library (ISBN)", data: null, success: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    const key = `ISBN:${isbn}`;
    if (data[key]) return { source: "Open Library (ISBN)", data: data[key], success: true };
    return { source: "Open Library (ISBN)", data: null, success: false, error: "ISBN not found" };
  } catch (err: any) {
    return { source: "Open Library (ISBN)", data: null, success: false, error: err.message };
  }
}

// 2. Open Library — Title search
async function searchOpenLibraryTitle(title: string): Promise<SourceResult> {
  try {
    const res = await fetchWithTimeout(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=3`, {}, 8000);
    if (!res.ok) return { source: "Open Library (Search)", data: null, success: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    if (data.docs?.length > 0) return { source: "Open Library (Search)", data: data.docs.slice(0, 3), success: true };
    return { source: "Open Library (Search)", data: null, success: false, error: "No results" };
  } catch (err: any) {
    return { source: "Open Library (Search)", data: null, success: false, error: err.message };
  }
}

// 3. Google Books API — ISBN + title
async function lookupGoogleBooks(isbn?: string, title?: string): Promise<SourceResult> {
  try {
    let q = "";
    if (isbn) q = `isbn:${isbn}`;
    else if (title) q = `intitle:${encodeURIComponent(title)}`;
    else return { source: "Google Books", data: null, success: false, error: "No query" };

    const res = await fetchWithTimeout(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=3`, {}, 8000);
    if (!res.ok) return { source: "Google Books", data: null, success: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    if (data.items?.length > 0) {
      const items = data.items.slice(0, 3).map((item: any) => ({
        title: item.volumeInfo?.title,
        subtitle: item.volumeInfo?.subtitle,
        authors: item.volumeInfo?.authors,
        publisher: item.volumeInfo?.publisher,
        publishedDate: item.volumeInfo?.publishedDate,
        description: item.volumeInfo?.description?.slice(0, 500),
        categories: item.volumeInfo?.categories,
        language: item.volumeInfo?.language,
        pageCount: item.volumeInfo?.pageCount,
        isbn13: item.volumeInfo?.industryIdentifiers?.find((id: any) => id.type === "ISBN_13")?.identifier,
        isbn10: item.volumeInfo?.industryIdentifiers?.find((id: any) => id.type === "ISBN_10")?.identifier,
      }));
      return { source: "Google Books", data: items, success: true };
    }
    return { source: "Google Books", data: null, success: false, error: "No results" };
  } catch (err: any) {
    return { source: "Google Books", data: null, success: false, error: err.message };
  }
}

// 4. CrossRef — DOI/title lookup
async function lookupCrossRef(title?: string, author?: string): Promise<SourceResult> {
  try {
    if (!title) return { source: "CrossRef", data: null, success: false, error: "No title" };
    let q = `query.title=${encodeURIComponent(title)}`;
    if (author) q += `&query.author=${encodeURIComponent(author)}`;
    const res = await fetchWithTimeout(`https://api.crossref.org/works?${q}&rows=3&select=title,author,publisher,published-print,subject,type,DOI,ISBN`, {
      headers: { "User-Agent": "MoonSand/2.0 (mailto:admin@moon.local)" }
    }, 8000);
    if (!res.ok) return { source: "CrossRef", data: null, success: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    if (data.message?.items?.length > 0) {
      return { source: "CrossRef", data: data.message.items.slice(0, 3), success: true };
    }
    return { source: "CrossRef", data: null, success: false, error: "No results" };
  } catch (err: any) {
    return { source: "CrossRef", data: null, success: false, error: err.message };
  }
}

// 5. ISBNdb — ISBN lookup (requires API key)
async function lookupISBNdb(isbn: string): Promise<SourceResult> {
  try {
    const apiKey = Deno.env.get("ISBNDB_API_KEY");
    if (!apiKey || apiKey.length < 5) return { source: "ISBNdb", data: null, success: false, error: "No API key" };
    const res = await fetchWithTimeout(`https://api2.isbndb.com/book/${isbn}`, {
      headers: { "Authorization": apiKey }
    }, 8000);
    if (!res.ok) return { source: "ISBNdb", data: null, success: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    if (data.book) return { source: "ISBNdb", data: data.book, success: true };
    return { source: "ISBNdb", data: null, success: false, error: "ISBN not found" };
  } catch (err: any) {
    return { source: "ISBNdb", data: null, success: false, error: err.message };
  }
}

// 6. Library of Congress Search
async function searchLOC(title?: string, author?: string): Promise<SourceResult> {
  try {
    if (!title && !author) return { source: "Library of Congress", data: null, success: false, error: "No query" };
    let q = "";
    if (title) q = encodeURIComponent(title);
    if (author) q += (q ? "+" : "") + encodeURIComponent(author);
    const res = await fetchWithTimeout(`https://www.loc.gov/search/?q=${q}&fo=json&c=25`, {}, 8000);
    if (!res.ok) return { source: "Library of Congress", data: null, success: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    if (data.results?.length > 0) {
      const items = data.results.slice(0, 3).map((r: any) => ({
        title: r.title,
        contributors: r.contributor,
        date: r.date,
        subjects: r.subject,
        type: r.original_format,
        language: r.language,
        url: r.url,
      }));
      return { source: "Library of Congress", data: items, success: true };
    }
    return { source: "Library of Congress", data: null, success: false, error: "No results" };
  } catch (err: any) {
    return { source: "Library of Congress", data: null, success: false, error: err.message };
  }
}

// Federated multi-source lookup
async function federatedLookup(input: {
  isbn?: string;
  title?: string;
  author?: string;
}): Promise<{ results: SourceResult[]; successfulSources: string[]; aggregatedData: any }> {
  console.log(`[AI-FEDERATED] Starting federated lookup: isbn=${input.isbn}, title=${input.title}, author=${input.author}`);

  // Run all lookups in parallel
  const promises: Promise<SourceResult>[] = [];

  if (input.isbn) {
    promises.push(lookupOpenLibraryISBN(input.isbn));
    promises.push(lookupGoogleBooks(input.isbn));
    promises.push(lookupISBNdb(input.isbn));
  }
  if (input.title) {
    promises.push(searchOpenLibraryTitle(input.title));
    if (!input.isbn) promises.push(lookupGoogleBooks(undefined, input.title));
    promises.push(lookupCrossRef(input.title, input.author));
    promises.push(searchLOC(input.title, input.author));
  }
  // If only author, still try LOC
  if (!input.title && input.author) {
    promises.push(searchLOC(undefined, input.author));
  }

  const results = await Promise.allSettled(promises);
  const sourceResults: SourceResult[] = results.map(r =>
    r.status === "fulfilled" ? r.value : { source: "Unknown", data: null, success: false, error: (r as any).reason?.message || "Promise rejected" }
  );

  const successful = sourceResults.filter(r => r.success);
  const successfulSources = successful.map(r => r.source);
  
  console.log(`[AI-FEDERATED] Results: ${successful.length}/${sourceResults.length} sources succeeded. Sources: ${successfulSources.join(", ") || "none"}`);
  sourceResults.filter(r => !r.success).forEach(r => console.log(`[AI-FEDERATED]   FAILED: ${r.source} — ${r.error}`));

  // Aggregate all data
  const aggregatedData: Record<string, any> = {};
  for (const r of successful) {
    aggregatedData[r.source] = r.data;
  }

  return { results: sourceResults, successfulSources, aggregatedData };
}


// ═══════════════════════════════════════════════════════════
// PHASE 1: AI Metadata Suggestions
// ═══════════════════════════════════════════════════════════

export async function suggestMetadata(input: {
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  abstract?: string;
}): Promise<MetadataSuggestions> {
  const start = Date.now();

  // First, enrich input with federated lookup data
  let enrichmentData = "";
  try {
    const { successfulSources, aggregatedData } = await federatedLookup({
      isbn: input.isbn,
      title: input.title,
      author: input.author,
    });
    if (successfulSources.length > 0) {
      enrichmentData = `\n\nENRICHMENT DATA from external sources (${successfulSources.join(", ")}):\n${JSON.stringify(aggregatedData, null, 2)}`;
    }
  } catch (err) {
    console.log("[AI] Enrichment lookup failed, proceeding with input only:", err);
  }

  const systemPrompt = `You are a library science AI assistant specializing in BIBFRAME cataloging and Library of Congress Subject Headings (LCSH).
You analyze bibliographic metadata and suggest structured cataloging data.

RULES:
- Suggest subjects aligned with LCSH heading patterns (use subdivision format like "Topic--Subdivision")
- Suggest genres/forms from standard vocabularies (LCGFT patterns)
- Suggest MARC relator roles (e.g., "aut" for author, "edt" for editor)
- Detect language using ISO 639-2/B codes
- Extract publication year if mentioned
- Suggest series if detectable
- Generate a brief cataloging summary (1-2 sentences)
- Suggest authority reconciliation candidates from LC Name Authority patterns
- Provide confidence scores (0.0 to 1.0)
- NEVER fabricate LCSH headings - only suggest plausible patterns
- NEVER create authority URIs - only suggest label text
- Use enrichment data from external sources to improve accuracy when available

You MUST return valid JSON with this exact structure:
{
  "suggestedSubjects": [{"label": "...", "confidence": 0.0-1.0}],
  "suggestedGenre": [{"label": "...", "confidence": 0.0-1.0}],
  "suggestedRelatorRoles": [{"label": "role name", "confidence": 0.0-1.0, "source": "relator code"}],
  "detectedLanguage": {"code": "eng", "label": "English", "confidence": 0.0-1.0},
  "extractedYear": {"year": 2024, "confidence": 0.0-1.0},
  "suggestedSeries": [{"label": "...", "confidence": 0.0-1.0}],
  "generatedSummary": "...",
  "authorityCandidates": [{"label": "Name, Form", "confidence": 0.0-1.0}]
}`;

  const parts: string[] = [];
  if (input.title) parts.push(`Title: ${input.title}`);
  if (input.author) parts.push(`Author: ${input.author}`);
  if (input.isbn) parts.push(`ISBN: ${input.isbn}`);
  if (input.publisher) parts.push(`Publisher: ${input.publisher}`);
  if (input.abstract) parts.push(`Abstract: ${input.abstract}`);

  const userPrompt = `Analyze this bibliographic record and suggest metadata:\n\n${parts.join("\n")}${enrichmentData}`;

  const raw = await callOpenAI(systemPrompt, userPrompt);
  const result = safeJsonParse(raw, {
    suggestedSubjects: [], suggestedGenre: [], suggestedRelatorRoles: [],
    detectedLanguage: null, extractedYear: null, suggestedSeries: [],
    generatedSummary: null, authorityCandidates: [],
  }) as MetadataSuggestions;
  
  const elapsed = Date.now() - start;
  await logAudit({
    featurePhase: "phase1-metadata-suggestions",
    input,
    output: result,
    approved: null,
    processingTimeMs: elapsed,
  });

  return result;
}

// ═══════════════════════════════════════════════════════════
// PHASE 2: AI Duplicate Detection
// ═══════════════════════════════════════════════════════════

export async function detectDuplicates(input: {
  title: string;
  author?: string;
  isbn?: string;
  year?: number;
  subjects?: string[];
}): Promise<DuplicateCandidate[]> {
  const start = Date.now();

  // Fetch existing records for comparison
  let existingRecords: any[] = [];
  try {
    const records = await kv.getByPrefix("bibframe:record:");
    existingRecords = records.map((r: string) => {
      try { return JSON.parse(r); } catch { return null; }
    }).filter(Boolean).slice(0, 100);
  } catch (err) {
    console.log("[AI-DEDUP] No existing records found:", err);
  }

  if (existingRecords.length === 0) {
    const elapsed = Date.now() - start;
    await logAudit({
      featurePhase: "phase2-duplicate-detection",
      input,
      output: { message: "No existing records to compare" },
      approved: null,
      processingTimeMs: elapsed,
    });
    return [];
  }

  const recordSummaries = existingRecords.slice(0, 30).map((r: any) => ({
    id: r.id,
    title: r.title || r.document?.["bf:title"]?.["bf:mainTitle"] || "Unknown",
    author: r.document?.["bf:contribution"]?.[0]?.["bf:agent"]?.["rdfs:label"] || "",
  }));

  const systemPrompt = `You are a library duplicate detection AI. Compare a new bibliographic record against existing records.

RULES:
- Calculate semantic similarity considering: title similarity, author similarity, ISBN match, year proximity, subject overlap
- ISBN exact match = high confidence (0.95+)
- Title+Author strong match = medium-high confidence (0.75-0.94)
- Only suggest duplicates with similarity > 0.5
- NEVER auto-merge. Always recommend "Review Required" for scores < 0.95
- Only recommend "Auto-Merge" for ISBN exact matches

Return JSON:
{
  "candidates": [
    {
      "candidateId": "...",
      "candidateTitle": "...",
      "similarityScore": 0.0-1.0,
      "matchReasons": ["reason1", "reason2"],
      "mergeRecommendation": "Auto-Merge" | "Review Required" | "Low Confidence"
    }
  ]
}

If no duplicates found, return: {"candidates": []}`;

  const userPrompt = `New record:
Title: ${input.title}
Author: ${input.author || "N/A"}
ISBN: ${input.isbn || "N/A"}
Year: ${input.year || "N/A"}
Subjects: ${input.subjects?.join(", ") || "N/A"}

Existing records:
${JSON.stringify(recordSummaries, null, 2)}`;

  const raw = await callOpenAI(systemPrompt, userPrompt);
  const parsed = safeJsonParse(raw, { candidates: [] });
  const result = (parsed.candidates || []) as DuplicateCandidate[];

  const elapsed = Date.now() - start;
  await logAudit({
    featurePhase: "phase2-duplicate-detection",
    input,
    output: result,
    approved: null,
    processingTimeMs: elapsed,
  });

  return result;
}

// ═══════════════════════════════════════════════════════════
// PHASE 3: AI Natural Language Discovery
// ═══════════════════════════════════════════════════════════

export async function naturalLanguageSearch(query: string): Promise<StructuredSearch> {
  const start = Date.now();

  const systemPrompt = `You are a library search AI that converts natural language queries into structured search parameters for a BIBFRAME union catalog.

RULES:
- Parse intent and extract filters
- Expand synonyms where appropriate
- Support multilingual queries (Arabic, English, etc.)
- Extract: keywords, language, year ranges, institution, subject, author, format, location
- If a language is mentioned for the content (not the query language), extract it as ISO 639-2/B code
- Be precise with year extraction (before/after)

Return JSON:
{
  "keywords": "main search terms",
  "language": "ISO 639-2/B code or null",
  "yearBefore": number or null,
  "yearAfter": number or null,
  "institution": "institution name or null",
  "subject": "subject heading or null",
  "author": "author name or null",
  "format": "book/journal/manuscript/etc or null",
  "location": "geographic location or null"
}`;

  const raw = await callOpenAI(systemPrompt, `Parse this search query: "${query}"`);
  const result = safeJsonParse(raw, { keywords: query }) as StructuredSearch;

  const elapsed = Date.now() - start;
  await logAudit({
    featurePhase: "phase3-natural-language-discovery",
    input: { query },
    output: result,
    approved: null,
    processingTimeMs: elapsed,
  });

  return result;
}

// ═══════════════════════════════════════════════════════════
// PHASE 4: AI SPARQL Translator
// ═══════════════════════════════════════════════════════════

export async function translateToSPARQL(query: string): Promise<SPARQLResult> {
  const start = Date.now();

  const systemPrompt = `You are a SPARQL query generator for a BIBFRAME linked data catalog.

PREFIXES available:
PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX madsrdf: <http://www.loc.gov/mads/rdf/v1#>

RULES:
- Generate ONLY SELECT queries
- NEVER generate UPDATE, DELETE, INSERT, DROP, CLEAR, or CONSTRUCT
- Use standard BIBFRAME predicates (bf:title, bf:contribution, bf:subject, bf:provisionActivity, etc.)
- Add LIMIT clause (max 100)
- Include OPTIONAL for non-required fields
- Use FILTER with CONTAINS/LCASE for text matching
- Provide a brief explanation of what the query does

Return JSON:
{
  "sparqlQuery": "SELECT ...",
  "explanation": "This query finds...",
  "isSafe": true,
  "warnings": []
}`;

  const raw = await callOpenAI(systemPrompt, `Convert this to SPARQL: "${query}"`);
  const result = safeJsonParse(raw, { sparqlQuery: "# Error generating query", explanation: "", isSafe: false, warnings: ["Parse error"] }) as SPARQLResult;

  // Safety validation
  const dangerousPatterns = /\b(INSERT|DELETE|UPDATE|DROP|CLEAR|CREATE|LOAD|MOVE|COPY|ADD)\b/i;
  if (result.sparqlQuery && dangerousPatterns.test(result.sparqlQuery)) {
    result.isSafe = false;
    if (!result.warnings) result.warnings = [];
    result.warnings.push("BLOCKED: Query contains mutating operations. Only SELECT queries are allowed.");
    result.sparqlQuery = "# BLOCKED: Unsafe query detected. Only SELECT queries are permitted.";
  }

  const elapsed = Date.now() - start;
  await logAudit({
    featurePhase: "phase4-sparql-translator",
    input: { query },
    output: result,
    approved: null,
    processingTimeMs: elapsed,
  });

  return result;
}

// ═══════════════════════════════════════════════════════════
// PHASE 5: AI Auto Fill — MULTI-SOURCE FEDERATED
// ═══════════════════════════════════════════════════════════

export async function autoFill(input: {
  isbn?: string;
  title?: string;
  author?: string;
}): Promise<AutoFillResult> {
  const start = Date.now();

  // Run federated lookup across ALL sources
  const { results, successfulSources, aggregatedData } = await federatedLookup(input);

  const failedSources = results.filter(r => !r.success).map(r => `${r.source}: ${r.error}`);
  console.log(`[AI-AUTOFILL] Successful sources: ${successfulSources.join(", ") || "none"}`);
  console.log(`[AI-AUTOFILL] Failed sources: ${failedSources.join(", ") || "none"}`);

  const systemPrompt = `You are a BIBFRAME cataloging AI that maps metadata from multiple external sources to BIBFRAME structure.

You are given data from multiple sources (Open Library, Google Books, CrossRef, ISBNdb, Library of Congress, etc.).
Cross-reference and merge data from all available sources for the most complete and accurate result.

RULES:
- Map metadata to correct BIBFRAME predicates
- Preserve any authority URIs if available
- Use standard BIBFRAME structure: bf:title, bf:contribution, bf:provisionActivity, bf:identifiedBy, etc.
- Include confidence score for overall mapping (higher if multiple sources agree)
- List any fields that couldn't be mapped
- Generate proper BIBFRAME triple structure
- Cross-reference data from multiple sources for higher accuracy
- When sources disagree, note the discrepancy and pick the most authoritative source (LOC > ISBNdb > Google Books > Open Library > CrossRef)

You MUST return valid JSON with this exact structure:
{
  "sources": ["source1", "source2"],
  "confidence": 0.0-1.0,
  "mappedFields": {
    "bf:title": {"@type": "bf:Title", "bf:mainTitle": "..."},
    "bf:contribution": [{"@type": "bf:Contribution", "bf:agent": {"rdfs:label": "..."}, "bf:role": "aut"}],
    "bf:provisionActivity": {"@type": "bf:Publication", "bf:date": "...", "bf:agent": {"rdfs:label": "..."}},
    "bf:identifiedBy": [{"@type": "bf:Isbn", "rdf:value": "..."}],
    "bf:subject": [{"rdfs:label": "..."}],
    "bf:language": {"@type": "bf:Language", "rdfs:label": "..."},
    "bf:extent": "...",
    "bf:note": "..."
  },
  "unmappedFields": ["field1"],
  "bibframeTriples": [
    {"predicate": "bf:title", "value": "...", "type": "literal"},
    {"predicate": "bf:contribution", "value": "...", "type": "literal"}
  ]
}`;

  let inputDesc: string;
  if (successfulSources.length > 0) {
    inputDesc = `Data found from ${successfulSources.length} source(s): ${successfulSources.join(", ")}\n\n${JSON.stringify(aggregatedData, null, 2)}\n\nOriginal input: ISBN=${input.isbn || "N/A"}, Title=${input.title || "N/A"}, Author=${input.author || "N/A"}`;
  } else {
    inputDesc = `No external data found from any source (all lookups failed). Generate BIBFRAME suggestions based only on the user input:\nISBN=${input.isbn || "N/A"}\nTitle=${input.title || "N/A"}\nAuthor=${input.author || "N/A"}\n\nFailed lookups: ${failedSources.join("; ")}`;
  }

  const raw = await callOpenAI(systemPrompt, `Map this to BIBFRAME:\n\n${inputDesc}`, 0.2);
  const result = safeJsonParse(raw, {
    sources: successfulSources,
    confidence: 0,
    mappedFields: {},
    unmappedFields: [],
    bibframeTriples: [],
  }) as AutoFillResult;

  result.sources = successfulSources.length > 0 ? successfulSources : ["AI inference only"];
  result.rawSourceData = aggregatedData;

  const elapsed = Date.now() - start;
  await logAudit({
    featurePhase: "phase5-autofill",
    input,
    output: { ...result, rawSourceData: undefined }, // don't store raw data in audit
    approved: null,
    processingTimeMs: elapsed,
  });

  return result;
}