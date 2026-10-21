/**
 * MOON NEXUS — Unified Working Cataloging Workstation
 * 
 * This is the REAL working integration of:
 *   - MOON DIJLA (Multi-AI Orchestration Engine)
 *   - MOON LD4 (Linked Data for Production)
 *   - MOON AI (AI-Assisted Cataloging)
 *   - Authority Integration (LOC, VIAF, Wikidata, FAST)
 * 
 * Every button calls a real API. Every search returns real results.
 * 
 * Designed and developed by isaac faleh
 */

"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";
import {
  ChevronLeft, Search, Database, Network, BookOpen, Activity,
  Layers, Zap, RefreshCw, CheckCircle2, AlertCircle, Clock,
  ArrowRight, Server, Code, FileText, Eye, Sparkles, Loader2,
  Send, Download, Copy, Link, ExternalLink, BookMarked, Library,
  Filter, X, Plus, GitBranch, Share2, Wifi, WifiOff, Tag,
  Users, MapPin, Globe, Shield, Brain, Bot, Cpu, ChevronDown,
  ChevronUp, Play, Square, BarChart3, Save, Settings,
  Hash, Bookmark, PenTool
} from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import moonLogo from "figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png";
import "../../styles/dijla-theme.css";

const API = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c`;
const AUTH = { "Authorization": `Bearer ${publicAnonKey}`, "Content-Type": "application/json" };

// ─── Helpers ─────────────────────────────────────────────────────

async function api(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...AUTH, ...(opts.headers as any || {}) } });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

async function apiGet(path: string) { return api(path); }
async function apiPost(path: string, body: any) { return api(path, { method: "POST", body: JSON.stringify(body) }); }

function elapsed(start: number) { return Date.now() - start; }

// ─── Types ───────────────────────────────────────────────────────

interface AuthResult { uri: string; label: string; description?: string; type?: string; source: string; }
interface LD4Service { service: string; status: string; latencyMs: number; protocol: string; }

type Tab = "search" | "ai-catalog" | "discovery" | "records" | "health";

// ═══════════════════════════════════��═══════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

interface Props { onBack?: () => void; }

export default function MoonNexus({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>("search");
  const [healthData, setHealthData] = useState<any>(null);

  // Quick health on mount
  useEffect(() => {
    apiGet("/health").then(d => setHealthData(d)).catch(() => {});
  }, []);

  return (
    <div className="dijla-bg h-screen flex flex-col">
      <Toaster position="top-right" />

      {/* ─── NAVBAR ─── */}
      <nav className="dijla-navbar">
        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <button onClick={onBack} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium flex items-center gap-1.5 transition-all border border-white/10">
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </button>
              )}
              <img src={moonLogo} alt="Moon" className="h-10 w-auto drop-shadow-lg" />
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">MOON NEXUS</h1>
                <p className="text-[10px] text-amber-300/80 font-medium tracking-wider">UNIFIED WORKING CATALOGING WORKSTATION</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 text-xs ${healthData ? "text-green-400" : "text-red-400"}`}>
                {healthData ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {healthData ? "Connected" : "Checking..."}
              </span>
            </div>
          </div>
        </div>
      </nav>
      <div className="dijla-gold-line" />

      {/* ─── TAB BAR ─── */}
      <div className="dijla-tabbar">
        <div className="px-5 py-1.5">
          <div className="flex items-center gap-1">
            {([
              { id: "search" as Tab, label: "Authority Search", icon: <Search className="h-3.5 w-3.5" /> },
              { id: "ai-catalog" as Tab, label: "AI Cataloging", icon: <Brain className="h-3.5 w-3.5" /> },
              { id: "discovery" as Tab, label: "Federated Discovery", icon: <Globe className="h-3.5 w-3.5" /> },
              { id: "records" as Tab, label: "Records", icon: <Database className="h-3.5 w-3.5" /> },
              { id: "health" as Tab, label: "System Health", icon: <Activity className="h-3.5 w-3.5" /> },
            ]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`dijla-tab ${tab === t.id ? "dijla-tab-active" : ""}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="flex-1 overflow-auto p-5 dijla-content">
        {tab === "search" && <AuthoritySearchTab />}
        {tab === "ai-catalog" && <AICatalogingTab />}
        {tab === "discovery" && <FederatedDiscoveryTab />}
        {tab === "records" && <RecordsTab />}
        {tab === "health" && <SystemHealthTab />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 1: LIVE AUTHORITY SEARCH
// Real searches against LOC, VIAF, Wikidata
// ═══════════════════════════════════════════════════════════

function AuthoritySearchTab() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("naf-personal");
  const [results, setResults] = useState<AuthResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [timing, setTiming] = useState(0);
  const [lastQuery, setLastQuery] = useState("");

  // Multi-source search
  const [multiMode, setMultiMode] = useState(false);
  const [multiResults, setMultiResults] = useState<Record<string, { results: AuthResult[]; time: number; error?: string }>>({});
  const [multiLoading, setMultiLoading] = useState(false);

  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setLastQuery(query);
    const start = Date.now();
    try {
      // Use dedicated endpoints for LCSH/LCGFT, else use search-authority
      let data: any;
      if (source === "lcsh") {
        data = await apiGet(`/authority/subjects?q=${encodeURIComponent(query)}`);
      } else if (source === "lcgft") {
        data = await apiGet(`/authority/genreforms?q=${encodeURIComponent(query)}`);
      } else {
        data = await apiGet(`/search-authority?q=${encodeURIComponent(query)}&source=${source}`);
      }
      setResults(data.results || []);
      setTiming(elapsed(start));
      if ((data.results || []).length === 0) toast.info("No results found");
    } catch (err: any) {
      toast.error(`Search failed: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const doMultiSearch = async () => {
    if (!query.trim()) return;
    setMultiLoading(true);
    setMultiResults({});
    setLastQuery(query);
    const sources = ["naf-personal", "viaf", "wikidata"];
    const sourceLabels: Record<string, string> = { "naf-personal": "LOC Names", viaf: "VIAF", wikidata: "Wikidata" };
    const promises = sources.map(async (src) => {
      const start = Date.now();
      try {
        const data = await apiGet(`/search-authority?q=${encodeURIComponent(query)}&source=${src}`);
        return { src, results: data.results || [], time: elapsed(start) };
      } catch (err: any) {
        return { src, results: [] as AuthResult[], time: elapsed(start), error: err.message };
      }
    });
    const all = await Promise.all(promises);
    const map: typeof multiResults = {};
    let total = 0;
    all.forEach(r => { map[r.src] = { results: r.results, time: r.time, error: r.error }; total += r.results.length; });
    setMultiResults(map);
    setMultiLoading(false);
    toast.success(`Found ${total} results across ${sources.length} sources`);
  };

  const copyUri = (uri: string) => { navigator.clipboard.writeText(uri); toast.success("URI copied!"); };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="dijla-card p-5">
        <h3 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Search className="h-4 w-4 text-blue-600" /> Live Authority Search
        </h3>
        <p className="text-xs text-gray-500 mb-4">Search real authority files — LOC Names, VIAF, Wikidata. Every result is a live URI you can link to.</p>

        {/* Mode toggle */}
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setMultiMode(false)} className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${!multiMode ? "bg-teal-50 text-teal-700 border-teal-300" : "bg-white text-gray-400 border-gray-200"}`}>
            Single Source
          </button>
          <button onClick={() => setMultiMode(true)} className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${multiMode ? "bg-teal-50 text-teal-700 border-teal-300" : "bg-white text-gray-400 border-gray-200"}`}>
            Multi-Source (LOC + VIAF + Wikidata)
          </button>
        </div>

        <div className="flex gap-2">
          {!multiMode && (
            <select value={source} onChange={e => setSource(e.target.value)} className="dijla-select text-xs w-40">
              <option value="naf-personal">LOC Names</option>
              <option value="viaf">VIAF</option>
              <option value="wikidata">Wikidata</option>
              <option value="lcsh">LCSH Subjects</option>
              <option value="lcgft">LCGFT Genre/Form</option>
            </select>
          )}
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (multiMode ? doMultiSearch() : doSearch())}
            placeholder="e.g. Shakespeare, Baghdad, Quantum physics..."
            className="dijla-input flex-1 text-sm"
          />
          <button onClick={multiMode ? doMultiSearch : doSearch} disabled={loading || multiLoading || !query.trim()} className="dijla-btn-primary dijla-btn text-xs">
            {(loading || multiLoading) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            {multiMode ? "Search All" : "Search"}
          </button>
        </div>
      </div>

      {/* Single source results */}
      {!multiMode && results.length > 0 && (
        <div className="dijla-card overflow-hidden">
          <div className="bg-blue-50 px-5 py-2.5 border-b border-blue-200 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700">{results.length} results for "{lastQuery}"</span>
            <span className="text-[10px] text-gray-400">{timing}ms</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
            {results.map((r, i) => (
              <ResultRow key={`${r.uri}-${i}`} r={r} onCopy={copyUri} />
            ))}
          </div>
        </div>
      )}

      {/* Multi source results */}
      {multiMode && Object.keys(multiResults).length > 0 && (
        <div className="space-y-3">
          {Object.entries(multiResults).map(([src, data]) => {
            const labels: Record<string, string> = { "naf-personal": "Library of Congress (Names)", viaf: "VIAF (Virtual Intl Authority File)", wikidata: "Wikidata (Knowledge Graph)" };
            const colors: Record<string, string> = { "naf-personal": "bg-blue-50 border-blue-200 text-blue-700", viaf: "bg-purple-50 border-purple-200 text-purple-700", wikidata: "bg-green-50 border-green-200 text-green-700" };
            return (
              <div key={src} className="dijla-card overflow-hidden">
                <div className={`px-5 py-2 border-b flex items-center justify-between ${colors[src] || "bg-gray-50 border-gray-200 text-gray-700"}`}>
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> {labels[src] || src}
                  </span>
                  <div className="flex items-center gap-2">
                    {data.error ? <span className="dijla-badge-danger">Error</span> : <span className="dijla-badge-success">{data.results.length} results</span>}
                    <span className="text-[10px] text-gray-400">{data.time}ms</span>
                  </div>
                </div>
                {data.error ? (
                  <div className="px-5 py-3 text-xs text-red-500">{data.error}</div>
                ) : data.results.length === 0 ? (
                  <div className="px-5 py-3 text-xs text-gray-400">No results</div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                    {data.results.slice(0, 8).map((r, i) => (
                      <ResultRow key={`${src}-${r.uri}-${i}`} r={r} onCopy={copyUri} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResultRow({ r, onCopy }: { r: AuthResult; onCopy: (uri: string) => void }) {
  const srcColors: Record<string, string> = {
    LOC: "bg-blue-50 text-blue-700 border-blue-200",
    VIAF: "bg-purple-50 text-purple-700 border-purple-200",
    Wikidata: "bg-green-50 text-green-700 border-green-200",
    FAST: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <div className="px-5 py-2.5 hover:bg-amber-50/50 flex items-center gap-3 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{r.label}</p>
        {r.description && <p className="text-[11px] text-gray-500 truncate">{r.description}</p>}
        <p className="text-[10px] text-teal-600 font-mono truncate mt-0.5">{r.uri}</p>
      </div>
      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${srcColors[r.source] || "bg-gray-50 text-gray-700 border-gray-200"}`}>{r.source}</span>
      {r.type && <span className="text-[10px] text-gray-400 shrink-0 hidden md:block">{r.type}</span>}
      <button onClick={() => onCopy(r.uri)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-teal-600" title="Copy URI">
        <Copy className="h-3.5 w-3.5" />
      </button>
      <a href={r.uri} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-600" title="Open in new tab">
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 2: AI CATALOGING — real OpenAI calls
// ═══════════════════════════════════════════════════════════

function AICatalogingTab() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [autofill, setAutofill] = useState<any>(null);
  const [naturalResult, setNaturalResult] = useState<any>(null);
  const [sparqlResult, setSparqlResult] = useState<any>(null);
  const [naturalQuery, setNaturalQuery] = useState("");
  const [sparqlQuery, setSparqlQuery] = useState("");
  const [aiKeyStatus, setAiKeyStatus] = useState<any>(null);

  // Check AI key on mount
  useEffect(() => {
    apiGet("/ai/debug-key").then(d => setAiKeyStatus(d)).catch(() => setAiKeyStatus({ configured: false, status: "UNREACHABLE" }));
  }, []);

  const suggestMetadata = async () => {
    if (!title.trim()) { toast.error("Enter a title first"); return; }
    setAiLoading("metadata");
    setMetadata(null);
    try {
      const data = await apiPost("/ai/suggest-metadata", { title, author, description });
      setMetadata(data);
      toast.success("AI metadata suggestions received!");
    } catch (err: any) {
      toast.error(`AI error: ${err.message}`);
    } finally { setAiLoading(null); }
  };

  const doAutofill = async () => {
    if (!title.trim()) { toast.error("Enter a title first"); return; }
    setAiLoading("autofill");
    setAutofill(null);
    try {
      const data = await apiPost("/ai/autofill", { title, author });
      setAutofill(data);
      toast.success("AI auto-fill complete!");
    } catch (err: any) {
      toast.error(`AI error: ${err.message}`);
    } finally { setAiLoading(null); }
  };

  const doNaturalSearch = async () => {
    if (!naturalQuery.trim()) return;
    setAiLoading("natural");
    setNaturalResult(null);
    try {
      const data = await apiPost("/ai/natural-search", { query: naturalQuery });
      setNaturalResult(data);
      toast.success("Natural language search complete!");
    } catch (err: any) {
      toast.error(`AI error: ${err.message}`);
    } finally { setAiLoading(null); }
  };

  const doSparqlTranslate = async () => {
    if (!sparqlQuery.trim()) return;
    setAiLoading("sparql");
    setSparqlResult(null);
    try {
      const data = await apiPost("/ai/sparql-translate", { query: sparqlQuery });
      setSparqlResult(data);
      toast.success("SPARQL translation complete!");
    } catch (err: any) {
      toast.error(`AI error: ${err.message}`);
    } finally { setAiLoading(null); }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* AI Status */}
      <div className={`dijla-card p-4 flex items-center gap-3 ${aiKeyStatus?.configured ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-400"}`}>
        <Bot className={`h-5 w-5 ${aiKeyStatus?.configured ? "text-green-600" : "text-red-500"}`} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">
            OpenAI Engine: {aiKeyStatus?.configured ? "Ready" : "API Key Issue"}
          </p>
          <p className="text-[10px] text-gray-400">{aiKeyStatus?.status || "Checking..."}</p>
        </div>
        {!aiKeyStatus?.configured && (
          <span className="text-[10px] text-red-500 max-w-60">Rotate your key at platform.openai.com/api-keys, then update the OPENAI_API_KEY Supabase secret.</span>
        )}
      </div>

      {/* AI Metadata Suggestions */}
      <div className="dijla-card p-5">
        <h3 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" /> AI Metadata Suggestions & Auto-Fill
        </h3>
        <p className="text-xs text-gray-500 mb-4">Enter a title and optional author — the AI will generate BIBFRAME metadata, subjects, classifications.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (required) — e.g. The Great Gatsby" className="dijla-input text-sm" />
          <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author (optional) — e.g. F. Scott Fitzgerald" className="dijla-input text-sm" />
        </div>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional) — paste a book summary or abstract..." className="dijla-input text-sm w-full h-20 resize-none mb-4" />

        <div className="flex gap-2">
          <button onClick={suggestMetadata} disabled={aiLoading !== null || !title.trim()} className="dijla-btn-primary dijla-btn text-xs">
            {aiLoading === "metadata" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Suggest Metadata
          </button>
          <button onClick={doAutofill} disabled={aiLoading !== null || !title.trim()} className="dijla-btn text-xs">
            {aiLoading === "autofill" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />} Auto-Fill BIBFRAME
          </button>
        </div>
      </div>

      {/* Metadata Results */}
      {metadata && (
        <div className="dijla-card p-5">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" /> AI Metadata Suggestions
          </h4>
          <pre className="dijla-code p-4 text-xs overflow-auto max-h-72 whitespace-pre-wrap">{JSON.stringify(metadata, null, 2)}</pre>
          <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(metadata, null, 2)); toast.success("Copied!"); }} className="dijla-btn text-xs mt-3">
            <Copy className="h-3 w-3" /> Copy JSON
          </button>
        </div>
      )}

      {/* Auto-fill Results */}
      {autofill && (
        <div className="dijla-card p-5">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" /> Auto-Filled BIBFRAME Fields
          </h4>
          <pre className="dijla-code p-4 text-xs overflow-auto max-h-72 whitespace-pre-wrap">{JSON.stringify(autofill, null, 2)}</pre>
        </div>
      )}

      {/* Natural Language Search */}
      <div className="dijla-card p-5">
        <h3 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-600" /> AI Natural Language → Search
        </h3>
        <p className="text-xs text-gray-500 mb-3">Ask a question in plain English or Arabic — the AI converts it to a structured catalog query.</p>
        <div className="flex gap-2">
          <input value={naturalQuery} onChange={e => setNaturalQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doNaturalSearch()}
            placeholder="e.g. Find all Arabic poetry books published after 2010"
            className="dijla-input flex-1 text-sm" />
          <button onClick={doNaturalSearch} disabled={aiLoading !== null || !naturalQuery.trim()} className="dijla-btn-primary dijla-btn text-xs">
            {aiLoading === "natural" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Ask AI
          </button>
        </div>
        {naturalResult && (
          <pre className="dijla-code p-4 text-xs overflow-auto max-h-52 whitespace-pre-wrap mt-3">{JSON.stringify(naturalResult, null, 2)}</pre>
        )}
      </div>

      {/* AI SPARQL Translation */}
      <div className="dijla-card p-5">
        <h3 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Code className="h-4 w-4 text-teal-600" /> AI → SPARQL Translation
        </h3>
        <p className="text-xs text-gray-500 mb-3">Describe what you want in natural language — the AI generates a SPARQL query.</p>
        <div className="flex gap-2">
          <input value={sparqlQuery} onChange={e => setSparqlQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doSparqlTranslate()}
            placeholder="e.g. Get all works by Naguib Mahfouz with their subjects"
            className="dijla-input flex-1 text-sm" />
          <button onClick={doSparqlTranslate} disabled={aiLoading !== null || !sparqlQuery.trim()} className="dijla-btn text-xs">
            {aiLoading === "sparql" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Code className="h-3.5 w-3.5" />} Generate SPARQL
          </button>
        </div>
        {sparqlResult && (
          <pre className="dijla-code p-4 text-xs overflow-auto max-h-52 whitespace-pre-wrap mt-3">{JSON.stringify(sparqlResult, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 3: FEDERATED DISCOVERY — real multi-source search
// ═══════════════════════════════════════════════════════════

function FederatedDiscoveryTab() {
  const [query, setQuery] = useState("");
  const [sources, setSources] = useState(["local", "loc", "viaf", "wikidata", "fast"]);
  const [results, setResults] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Also support LD4 reconciliation
  const [reconQuery, setReconQuery] = useState("");
  const [reconResults, setReconResults] = useState<any[]>([]);
  const [reconBest, setReconBest] = useState<any>(null);
  const [reconLoading, setReconLoading] = useState(false);

  const doDiscover = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setTotalCount(0);
    try {
      const data = await apiGet(`/ld4/discover?q=${encodeURIComponent(query)}&sources=${sources.join(",")}`);
      setResults(data.results || []);
      setTotalCount(data.totalCount || 0);
      toast.success(`Found ${data.totalCount || 0} results across ${(data.results || []).length} sources`);
    } catch (err: any) {
      toast.error(`Discovery error: ${err.message}`);
    } finally { setLoading(false); }
  };

  const doReconcile = async () => {
    if (!reconQuery.trim()) return;
    setReconLoading(true);
    setReconResults([]);
    setReconBest(null);
    try {
      const data = await apiGet(`/ld4/reconcile?q=${encodeURIComponent(reconQuery)}&sources=LOC,VIAF,Wikidata,FAST`);
      setReconResults(data.matches || []);
      setReconBest(data.bestMatch || null);
      toast.success(`${data.matches?.length || 0} authority matches found`);
    } catch (err: any) {
      toast.error(`Reconciliation error: ${err.message}`);
    } finally { setReconLoading(false); }
  };

  const toggleSource = (s: string) => setSources(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Federated Discovery */}
      <div className="dijla-card p-5">
        <h3 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-600" /> Federated Linked Data Discovery
        </h3>
        <p className="text-xs text-gray-500 mb-3">Search simultaneously across local catalog, LOC, VIAF, Wikidata, and FAST.</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            { id: "local", label: "Local Catalog" },
            { id: "loc", label: "LOC" },
            { id: "viaf", label: "VIAF" },
            { id: "wikidata", label: "Wikidata" },
            { id: "fast", label: "FAST" },
            { id: "sharevde", label: "Share-VDE" },
          ].map(s => (
            <button key={s.id} onClick={() => toggleSource(s.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                sources.includes(s.id) ? "bg-teal-50 text-teal-700 border-teal-300" : "bg-white text-gray-400 border-gray-200"
              }`}>
              {sources.includes(s.id) ? <CheckCircle2 className="h-2.5 w-2.5 inline mr-1" /> : null}
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doDiscover()}
            placeholder="Search across all linked data sources..."
            className="dijla-input flex-1 text-sm" />
          <button onClick={doDiscover} disabled={loading || !query.trim()} className="dijla-btn-primary dijla-btn text-xs">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />} Discover
          </button>
        </div>
      </div>

      {/* Discovery Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs text-gray-500 font-medium">{totalCount} total results across {results.filter(r => r.count > 0).length} sources</div>
          {results.filter(r => r.count > 0).map((sr, idx) => {
            const srcCol: Record<string, string> = { "Library of Congress": "bg-blue-50 border-blue-200 text-blue-700", "VIAF": "bg-purple-50 border-purple-200 text-purple-700", "Wikidata": "bg-green-50 border-green-200 text-green-700", "FAST": "bg-red-50 border-red-200 text-red-700", "Local MOON": "bg-amber-50 border-amber-200 text-amber-700", "Share-VDE": "bg-teal-50 border-teal-200 text-teal-700" };
            const col = srcCol[sr.source] || "bg-gray-50 border-gray-200 text-gray-700";
            return (
              <div key={idx} className="dijla-card overflow-hidden">
                <div className={`px-4 py-2 border-b flex items-center justify-between ${col}`}>
                  <span className="text-xs font-bold flex items-center gap-1.5"><Globe className="h-3 w-3" /> {sr.source}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono">{sr.protocol}</span>
                    <span className="dijla-badge-success">{sr.count}</span>
                    <span className="text-[10px] text-gray-400">{sr.latencyMs}ms</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                  {sr.results.slice(0, 6).map((r: any, ri: number) => (
                    <div key={ri} className="px-4 py-2 hover:bg-amber-50/50 flex items-center gap-3 text-xs">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{r.label || r.title || "—"}</p>
                        {r.description && <p className="text-[10px] text-gray-500 truncate">{r.description}</p>}
                        {r.uri && <p className="text-[10px] text-teal-600 font-mono truncate">{r.uri}</p>}
                      </div>
                      {r.score !== undefined && <span className={`font-bold ${r.score >= 0.8 ? "text-green-600" : "text-amber-500"}`}>{Math.round(r.score * 100)}%</span>}
                      {r.uri && <a href={r.uri} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 text-gray-400 hover:text-teal-600" /></a>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Authority Reconciliation */}
      <div className="dijla-card p-5">
        <h3 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-purple-600" /> Authority Reconciliation
        </h3>
        <p className="text-xs text-gray-500 mb-3">Match entity names against LOC, VIAF, Wikidata, FAST — find the best authority URI for a heading.</p>
        <div className="flex gap-2">
          <input value={reconQuery} onChange={e => setReconQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doReconcile()}
            placeholder="e.g. Mark Twain, Baghdad, World War II..."
            className="dijla-input flex-1 text-sm" />
          <button onClick={doReconcile} disabled={reconLoading || !reconQuery.trim()} className="dijla-btn-primary dijla-btn text-xs">
            {reconLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GitBranch className="h-3.5 w-3.5" />} Reconcile
          </button>
        </div>
      </div>

      {reconBest && (
        <div className="dijla-card p-4 border-l-4 border-l-green-500">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="font-bold text-sm text-green-800">Best Match: {reconBest.label}</span>
            <span className="text-xs text-green-600">{Math.round(reconBest.score * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">{reconBest.source}</span>
            <a href={reconBest.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 font-mono hover:underline flex items-center gap-1">
              {reconBest.uri} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {reconResults.length > 0 && (
        <div className="dijla-card p-4">
          <h4 className="text-sm font-bold text-gray-800 mb-2">{reconResults.length} matches found</h4>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {reconResults.map((m, i) => {
              const colors: Record<string, string> = { LOC: "bg-blue-50 text-blue-700 border-blue-200", VIAF: "bg-purple-50 text-purple-700 border-purple-200", Wikidata: "bg-green-50 text-green-700 border-green-200", FAST: "bg-red-50 text-red-700 border-red-200" };
              return (
                <div key={i} className="dijla-row flex items-center gap-2 px-3 py-2 text-xs">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${colors[m.source] || "bg-gray-50 text-gray-700 border-gray-200"}`}>{m.source}</span>
                  <span className="flex-1 text-sm text-gray-800 truncate">{m.label}</span>
                  <span className={`font-bold ${m.score >= 0.8 ? "text-green-600" : "text-amber-500"}`}>{Math.round(m.score * 100)}%</span>
                  {m.uri && <a href={m.uri} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 text-gray-400 hover:text-teal-600" /></a>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 4: RECORDS — real record management
// ═══════════════════════════════════════════════════════════

function RecordsTab() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [rdfOutput, setRdfOutput] = useState<{ format: string; content: string } | null>(null);
  const [rdfLoading, setRdfLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Quick form
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newType, setNewType] = useState("bf:Work");

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/list-records");
      setRecords(data.records || []);
    } catch (err: any) {
      // Fallback to moon records
      try {
        const data2 = await apiGet("/moon/records");
        setRecords(data2.records || data2 || []);
      } catch {
        toast.error("Could not load records");
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { loadRecords(); }, []);

  const saveQuickRecord = async () => {
    if (!newTitle.trim()) { toast.error("Title is required"); return; }
    setSaveLoading(true);
    try {
      const record = {
        title: newTitle,
        resourceType: newType,
        document: {
          "@context": { "bf": "http://id.loc.gov/ontologies/bibframe/" },
          "@type": newType,
          "bf:title": { "bf:mainTitle": newTitle },
          "bf:contribution": newAuthor ? { "bf:agent": { "rdfs:label": newAuthor } } : undefined,
        },
        status: "draft",
        cataloger: "moon-nexus",
      };
      await apiPost("/save-record", record);
      toast.success("Record saved!");
      setNewTitle("");
      setNewAuthor("");
      loadRecords();
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`);
    } finally { setSaveLoading(false); }
  };

  const exportRDF = async (recordId: string, format: string) => {
    setRdfLoading(true);
    setRdfOutput(null);
    try {
      const endpoint = format === "turtle" ? "turtle" : format === "ntriples" ? "ntriples" : "jsonld";
      const data = await apiGet(`/moon/records/${recordId}/${endpoint}`);
      setRdfOutput({ format: endpoint, content: typeof data === "string" ? data : (data.content || data.turtle || data.ntriples || JSON.stringify(data, null, 2)) });
      toast.success(`Exported as ${endpoint}`);
    } catch (err: any) {
      toast.error(`Export error: ${err.message}`);
    } finally { setRdfLoading(false); }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Quick Record Creator */}
      <div className="dijla-card p-5">
        <h3 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
          <PenTool className="h-4 w-4 text-amber-500" /> Quick BIBFRAME Record
        </h3>
        <p className="text-xs text-gray-500 mb-3">Create and save a BIBFRAME record to the database.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
          <select value={newType} onChange={e => setNewType(e.target.value)} className="dijla-select text-xs">
            <option value="bf:Work">bf:Work</option>
            <option value="bf:Instance">bf:Instance</option>
            <option value="bf:Item">bf:Item</option>
          </select>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title (required)" className="dijla-input text-sm" />
          <input value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="Author (optional)" className="dijla-input text-sm" />
          <button onClick={saveQuickRecord} disabled={saveLoading || !newTitle.trim()} className="dijla-btn-primary dijla-btn text-xs">
            {saveLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Record
          </button>
        </div>
      </div>

      {/* Records List */}
      <div className="dijla-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Database className="h-4 w-4 text-teal-600" /> Saved Records ({records.length})
          </h3>
          <button onClick={loadRecords} disabled={loading} className="dijla-btn text-xs">
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Reload
          </button>
        </div>
        {records.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No records yet. Create one above or use AI Cataloging to generate one.</p>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {records.map((r, i) => (
              <div key={r.id || i} className="dijla-row flex items-center gap-3 px-4 py-2.5 cursor-pointer" onClick={() => setSelectedRecord(r)}>
                <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{r.title || r.document?.["bf:title"]?.["bf:mainTitle"] || "Untitled"}</p>
                  <p className="text-[10px] text-gray-400">{r.resourceType || r.type || "—"} • {r.status || "draft"} • {r.cataloger || "—"}</p>
                </div>
                {r.id && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); exportRDF(r.id, "jsonld"); }} className="px-2 py-0.5 text-[10px] bg-teal-50 text-teal-700 rounded border border-teal-200 font-semibold hover:bg-teal-100">JSON-LD</button>
                    <button onClick={(e) => { e.stopPropagation(); exportRDF(r.id, "turtle"); }} className="px-2 py-0.5 text-[10px] bg-purple-50 text-purple-700 rounded border border-purple-200 font-semibold hover:bg-purple-100">Turtle</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Record Detail */}
      {selectedRecord && (
        <div className="dijla-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" /> Record Detail
            </h4>
            <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
          </div>
          <pre className="dijla-code p-4 text-xs overflow-auto max-h-72 whitespace-pre-wrap">{JSON.stringify(selectedRecord, null, 2)}</pre>
        </div>
      )}

      {/* RDF Output */}
      {rdfOutput && (
        <div className="dijla-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <Code className="h-4 w-4 text-teal-600" /> RDF Export ({rdfOutput.format})
            </h4>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(rdfOutput.content); toast.success("Copied!"); }} className="dijla-btn text-xs"><Copy className="h-3 w-3" /> Copy</button>
              <button onClick={() => setRdfOutput(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
            </div>
          </div>
          <pre className="dijla-code p-4 text-xs overflow-auto max-h-60 whitespace-pre-wrap">{rdfOutput.content}</pre>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 5: SYSTEM HEALTH — real endpoint checks
// ═══════════════════════════════════════════════════════════

function SystemHealthTab() {
  const [health, setHealth] = useState<any>(null);
  const [engineStatus, setEngineStatus] = useState<any>(null);
  const [ontologyStats, setOntologyStats] = useState<any>(null);
  const [aiKeyStatus, setAiKeyStatus] = useState<any>(null);
  const [aiRouterStatus, setAiRouterStatus] = useState<any>(null);
  const [ld4Services, setLd4Services] = useState<LD4Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [ld4Loading, setLd4Loading] = useState(false);

  const checkAll = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      apiGet("/health").then(d => setHealth(d)),
      apiGet("/engine/status").then(d => setEngineStatus(d)),
      apiGet("/ontology/stats").then(d => setOntologyStats(d)),
      apiGet("/ai/debug-key").then(d => setAiKeyStatus(d)),
      apiGet("/ai-router/status").then(d => setAiRouterStatus(d)),
    ]);
    setLoading(false);
    const successes = results.filter(r => r.status === "fulfilled").length;
    toast.success(`${successes}/${results.length} internal checks passed`);
  };

  const checkLD4 = async () => {
    setLd4Loading(true);
    try {
      const data = await apiGet("/ld4/status");
      setLd4Services(data.services || []);
      const online = (data.services || []).filter((s: any) => s.status === "online").length;
      toast.success(`${online}/${(data.services || []).length} LD4 services online`);
    } catch (err: any) {
      toast.error(`LD4 check failed: ${err.message}`);
    } finally { setLd4Loading(false); }
  };

  useEffect(() => { checkAll(); }, []);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex gap-2">
        <button onClick={checkAll} disabled={loading} className="dijla-btn-primary dijla-btn text-xs">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />} Check Internal Services
        </button>
        <button onClick={checkLD4} disabled={ld4Loading} className="dijla-btn text-xs">
          {ld4Loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />} Check LD4 External Services
        </button>
      </div>

      {/* Internal Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <StatusCard title="Server Health" data={health} icon={<Server className="h-5 w-5 text-green-600" />} />
        <StatusCard title="BIBFRAME Engine" data={engineStatus} icon={<Cpu className="h-5 w-5 text-blue-600" />} />
        <StatusCard title="Ontology Stats" data={ontologyStats} icon={<Network className="h-5 w-5 text-purple-600" />} />
        <StatusCard title="OpenAI API Key" data={aiKeyStatus} icon={<Bot className="h-5 w-5 text-amber-500" />} isKey />
        <StatusCard title="AI Router" data={aiRouterStatus} icon={<Zap className="h-5 w-5 text-teal-600" />} />
      </div>

      {/* LD4 External */}
      {ld4Services.length > 0 && (
        <div className="dijla-card p-5">
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600" /> LD4 External Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ld4Services.map((svc, i) => (
              <div key={i} className={`dijla-row flex items-center gap-3 px-4 py-2.5 ${svc.status === "online" ? "dijla-row-success" : "dijla-row-danger"}`}>
                {svc.status === "online" ? <Wifi className="h-3.5 w-3.5 text-green-600" /> : <WifiOff className="h-3.5 w-3.5 text-red-500" />}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{svc.service}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{svc.protocol}</p>
                </div>
                <span className={svc.status === "online" ? "dijla-badge-success" : "dijla-badge-danger"}>{svc.status}</span>
                <span className="text-xs text-gray-400">{svc.latencyMs}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusCard({ title, data, icon, isKey }: { title: string; data: any; icon: React.ReactNode; isKey?: boolean }) {
  const ok = data !== null;
  const keyOk = isKey ? data?.configured : true;
  return (
    <div className={`dijla-card p-4 ${!ok ? "opacity-50" : isKey && !keyOk ? "border-l-4 border-l-red-400" : "border-l-4 border-l-green-400"}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="font-bold text-sm text-gray-800">{title}</span>
        {ok ? (isKey && !keyOk ? <span className="dijla-badge-danger">Issue</span> : <span className="dijla-badge-success">OK</span>) : <span className="dijla-badge-warn">Pending</span>}
      </div>
      {data && (
        <div className="text-xs text-gray-500 space-y-0.5">
          {Object.entries(data).slice(0, 5).map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span className="text-gray-400 font-mono w-28 truncate">{k}:</span>
              <span className="text-gray-700 truncate">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}