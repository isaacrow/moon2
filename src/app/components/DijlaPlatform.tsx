/**
 * MOON DIJLA Platform - Enterprise BIBFRAME Linked Data & Multi-AI Command Center
 * 
 * DIJLA RIVER THEME - Warm sands, Tigris teal, Mesopotamian gold
 * 
 * Architecture dashboard for the complete MOON DIJLA system:
 * - Multi-AI Orchestration (OpenAI, Gemini, LLaMA) with routing & fallback
 * - Discovery Federation (LOC, VIAF, Wikidata, OpenLibrary)
 * - BIBFRAME Ontology Model Browser
 * - Cataloger Toolkit (LC Cutter, Authority Search, ISBN Import)
 * - RDF Serialization (JSON-LD, RDF/XML, Turtle, N-Triples)
 * - AI Governance & Audit Dashboard
 * - System Architecture Visualization
 * 
 * Designed and developed by isaac faleh
 */

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";
import {
  ChevronLeft, Brain, Cpu, Globe, Search, Database, Network,
  BookOpen, Shield, Activity, Layers, Zap, RefreshCw, CheckCircle2,
  AlertCircle, Clock, BarChart3, ArrowRight, Server, Code,
  FileText, Eye, Sparkles, Settings, ChevronDown, ChevronRight,
  Loader2, Send, Download, Copy, User, Tag, MapPin, Building,
  Book, Link, Play, Square
} from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import moonLogo from "figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png";
import "../../styles/dijla-theme.css";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c`;

// ─── Types ───────────────────────────────────────────────────────
interface AIProviderStatus {
  provider: string;
  available: boolean;
  model: string;
  lastCallTimestamp?: string;
  lastCallSuccess?: boolean;
  avgLatencyMs: number;
  totalCalls: number;
  successRate: number;
  errorCount: number;
  consecutiveErrors?: number;
  circuitBreakerOpen?: boolean;
  circuitBreakerResetAt?: string;
  successCount?: number;
}

interface RoutingDecision {
  taskType: string;
  selectedProvider: string;
  fallbackChain: string[];
  timestamp: string;
  latencyMs: number;
  success: boolean;
  error?: string;
  retryCount: number;
}

interface DiscoveryResult {
  source: string;
  title: string;
  uri: string;
  authors?: string[];
  date?: string;
  type?: string;
}

type PlatformTab = "overview" | "ai-orchestrator" | "discovery" | "ontology" | "cataloger-tools" | "rdf-exports" | "ai-governance" | "architecture";

// ─── Helper ──────────────────────────────────────────────────────
async function apiCall(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${publicAnonKey}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(errData.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── Data ────────────────────────────────────────────────────────
const BIBFRAME_MODEL = {
  classes: [
    { name: "bf:Work", description: "The highest level of abstraction, a distinct intellectual or artistic creation", color: "blue", properties: ["bf:title", "bf:contribution", "bf:language", "bf:genreForm", "bf:subject", "bf:classification"] },
    { name: "bf:Instance", description: "A material embodiment of a Work", color: "green", properties: ["bf:title", "bf:provisionActivity", "bf:extent", "bf:carrier", "bf:media", "bf:identifiedBy"] },
    { name: "bf:Item", description: "An actual copy of an Instance", color: "orange", properties: ["bf:heldBy", "bf:shelfMark", "bf:electronicLocator", "bf:itemOf"] },
    { name: "bf:Agent", description: "Entity (person, organization, etc.) associated with a resource", color: "cyan", properties: ["rdfs:label", "bf:identifiedBy"] },
    { name: "bf:Subject", description: "Topic or subject of a Work", color: "purple", properties: ["rdfs:label", "bf:source"] },
    { name: "bf:Place", description: "Geographic location", color: "pink", properties: ["rdfs:label", "bf:identifiedBy"] },
    { name: "bf:Event", description: "A significant occurrence or happening", color: "yellow", properties: ["rdfs:label", "bf:date", "bf:place"] },
  ],
  exportFormats: ["JSON-LD", "RDF/XML", "Turtle", "N-Triples"],
};

const AI_ROUTING_TABLE: Record<string, string[]> = {
  "Metadata Generation": ["OpenAI", "Gemini", "LLaMA"],
  "Entity Linking": ["Gemini", "OpenAI", "LLaMA"],
  "Duplicate Detection": ["LLaMA", "OpenAI", "Gemini"],
  "Natural Language Discovery": ["OpenAI", "Gemini", "LLaMA"],
  "SPARQL Translation": ["OpenAI", "Gemini"],
  "Auto-Fill": ["OpenAI", "Gemini", "LLaMA"],
};

const DISCOVERY_SOURCES = [
  { name: "Library of Congress", uri: "id.loc.gov", abbr: "LOC", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  { name: "VIAF", uri: "viaf.org", abbr: "VIAF", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  { name: "Wikidata", uri: "wikidata.org", abbr: "WD", bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  { name: "OpenLibrary", uri: "openlibrary.org", abbr: "OL", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  { name: "FAST", uri: "fast.oclc.org", abbr: "FAST", bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  { name: "Share-VDE", uri: "sharevde.org", abbr: "SVD", bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" },
  { name: "WorldCat", uri: "worldcat.org", abbr: "WC", bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700" },
  { name: "ISBNdb", uri: "isbndb.com", abbr: "ISBN", bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
  { name: "Google Books", uri: "books.google.com", abbr: "GB", bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700" },
  { name: "CrossRef", uri: "crossref.org", abbr: "CR", bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
  { name: "BNF", uri: "data.bnf.fr", abbr: "BNF", bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-800" },
  { name: "LCSH", uri: "id.loc.gov/subjects", abbr: "LCSH", bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
  { name: "GND (lobid)", uri: "lobid.org/gnd", abbr: "GND", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
  { name: "ISNI", uri: "isni.org", abbr: "ISNI", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
  { name: "HathiTrust", uri: "hathitrust.org", abbr: "HT", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
  { name: "Getty Vocab", uri: "vocab.getty.edu", abbr: "GTY", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  { name: "Europeana", uri: "europeana.eu", abbr: "EU", bg: "bg-sky-50", border: "border-sky-300", text: "text-sky-700" },
  { name: "DPLA", uri: "dp.la", abbr: "DPLA", bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
];

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

interface DijlaPlatformProps {
  onBack?: () => void;
  onOpenCatalogEngine?: () => void;
}

export default function DijlaPlatform({ onBack, onOpenCatalogEngine }: DijlaPlatformProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<PlatformTab>("overview");
  const [providers, setProviders] = useState<AIProviderStatus[]>([]);
  const [routingLog, setRoutingLog] = useState<RoutingDecision[]>([]);
  const [loading, setLoading] = useState(false);

  const [testInput, setTestInput] = useState("");
  const [testTaskType, setTestTaskType] = useState("metadata");
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const [discoveryResults, setDiscoveryResults] = useState<DiscoveryResult[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [aiEnhanceQuery, setAiEnhanceQuery] = useState("");
  const [aiEnhanceResult, setAiEnhanceResult] = useState<any>(null);
  const [aiEnhanceLoading, setAiEnhanceLoading] = useState(false);

  const [rdfSample, setRdfSample] = useState<any>(null);

  const loadAIStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiCall("/ai-router/status");
      setProviders(data.providers || []);
    } catch (err: any) {
      console.error("Failed to load AI status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoutingLog = useCallback(async () => {
    try {
      const data = await apiCall("/ai-router/routing-log?limit=20");
      setRoutingLog(data.log || []);
    } catch (err: any) {
      console.error("Failed to load routing log:", err);
    }
  }, []);

  useEffect(() => { loadAIStatus(); loadRoutingLog(); }, [loadAIStatus, loadRoutingLog]);

  const handleTestAI = async () => {
    if (!testInput.trim()) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      let endpoint = "";
      let body: any = {};
      switch (testTaskType) {
        case "metadata": endpoint = "/ai-router/suggest-metadata"; body = { title: testInput }; break;
        case "entity-linking": endpoint = "/ai-router/entity-linking"; body = { entityName: testInput, entityType: "Person" }; break;
        case "natural-search": endpoint = "/ai-router/natural-search"; body = { query: testInput }; break;
        case "sparql": endpoint = "/ai-router/sparql-translate"; body = { query: testInput }; break;
        case "autofill": endpoint = "/ai-router/autofill"; body = { title: testInput }; break;
        case "discovery": endpoint = "/ai-router/discovery-enhance"; body = { query: testInput }; break;
      }
      const result = await apiCall(endpoint, { method: "POST", body: JSON.stringify(body) });
      setTestResult(result);
      toast.success(`AI task routed via ${result._routedVia || "unknown"} in ${result._latencyMs || 0}ms`);
      loadRoutingLog();
    } catch (err: any) {
      toast.error(err.message);
      setTestResult({ error: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  const handleDiscoverySearch = async () => {
    if (!discoveryQuery.trim()) return;
    setDiscoveryLoading(true);
    setDiscoveryResults([]);
    try {
      const [locRes, viafRes] = await Promise.allSettled([
        apiCall(`/authority/names?q=${encodeURIComponent(discoveryQuery)}`),
        apiCall(`/viaf/search?q=${encodeURIComponent(discoveryQuery)}`),
      ]);
      const results: DiscoveryResult[] = [];
      if (locRes.status === "fulfilled" && locRes.value.results) {
        locRes.value.results.slice(0, 5).forEach((r: any) => {
          results.push({ source: "Library of Congress", title: r.label || r.authoritativeLabel || "Unknown", uri: r.uri || "", type: "Authority" });
        });
      }
      if (viafRes.status === "fulfilled" && viafRes.value.results) {
        viafRes.value.results.slice(0, 5).forEach((r: any) => {
          results.push({ source: "VIAF", title: r.label || "Unknown", uri: r.uri || "", type: "Authority" });
        });
      }
      setDiscoveryResults(results);
      toast.success(`Found ${results.length} results across federated sources`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDiscoveryLoading(false);
    }
  };

  const handleAIEnhance = async () => {
    if (!aiEnhanceQuery.trim()) return;
    setAiEnhanceLoading(true);
    setAiEnhanceResult(null);
    try {
      const result = await apiCall("/ai-router/discovery-enhance", {
        method: "POST",
        body: JSON.stringify({ query: aiEnhanceQuery }),
      });
      setAiEnhanceResult(result);
      toast.success(`Discovery enhanced via ${result._routedVia || "AI"} in ${result._latencyMs || 0}ms`);
    } catch (err: any) {
      toast.error(err.message);
      setAiEnhanceResult({ error: err.message });
    } finally {
      setAiEnhanceLoading(false);
    }
  };

  useEffect(() => {
    setRdfSample({
      jsonld: JSON.stringify({
        "@context": { "bf": "http://id.loc.gov/ontologies/bibframe/", "rdfs": "http://www.w3.org/2000/01/rdf-schema#" },
        "@graph": [
          { "@id": "http://moonlib.org/work/1", "@type": "bf:Work", "bf:title": { "@type": "bf:Title", "bf:mainTitle": "Sample BIBFRAME Work" }, "bf:language": { "@id": "http://id.loc.gov/vocabulary/languages/eng" }, "bf:hasInstance": { "@id": "http://moonlib.org/instance/1" } },
          { "@id": "http://moonlib.org/instance/1", "@type": "bf:Instance", "bf:instanceOf": { "@id": "http://moonlib.org/work/1" }, "bf:identifiedBy": { "@type": "bf:Isbn", "rdf:value": "978-0-123456-78-9" } },
          { "@id": "http://moonlib.org/item/1", "@type": "bf:Item", "bf:itemOf": { "@id": "http://moonlib.org/instance/1" }, "bf:heldBy": { "@id": "http://moonlib.org/library/main" } }
        ]
      }, null, 2),
      turtle: `@prefix bf: <http://id.loc.gov/ontologies/bibframe/> .\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\n<http://moonlib.org/work/1> a bf:Work ;\n    bf:title [ a bf:Title ; bf:mainTitle "Sample BIBFRAME Work" ] ;\n    bf:language <http://id.loc.gov/vocabulary/languages/eng> ;\n    bf:hasInstance <http://moonlib.org/instance/1> .\n\n<http://moonlib.org/instance/1> a bf:Instance ;\n    bf:instanceOf <http://moonlib.org/work/1> ;\n    bf:identifiedBy [ a bf:Isbn ; rdf:value "978-0-123456-78-9" ] .\n\n<http://moonlib.org/item/1> a bf:Item ;\n    bf:itemOf <http://moonlib.org/instance/1> ;\n    bf:heldBy <http://moonlib.org/library/main> .`,
      rdfxml: `<?xml version="1.0" encoding="UTF-8"?>\n<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n         xmlns:bf="http://id.loc.gov/ontologies/bibframe/">\n  <bf:Work rdf:about="http://moonlib.org/work/1">\n    <bf:title>\n      <bf:Title><bf:mainTitle>Sample BIBFRAME Work</bf:mainTitle></bf:Title>\n    </bf:title>\n    <bf:hasInstance rdf:resource="http://moonlib.org/instance/1"/>\n  </bf:Work>\n  <bf:Instance rdf:about="http://moonlib.org/instance/1">\n    <bf:instanceOf rdf:resource="http://moonlib.org/work/1"/>\n  </bf:Instance>\n</rdf:RDF>`,
      ntriples: `<http://moonlib.org/work/1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://id.loc.gov/ontologies/bibframe/Work> .\n<http://moonlib.org/work/1> <http://id.loc.gov/ontologies/bibframe/hasInstance> <http://moonlib.org/instance/1> .\n<http://moonlib.org/instance/1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://id.loc.gov/ontologies/bibframe/Instance> .\n<http://moonlib.org/item/1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://id.loc.gov/ontologies/bibframe/Item> .`,
    });
  }, []);

  const defaultProviders: AIProviderStatus[] = [
    { provider: "openai", available: true, model: "gpt-4o-mini", avgLatencyMs: 0, totalCalls: 0, successRate: 100, errorCount: 0 },
    { provider: "gemini", available: false, model: "gemini-1.5-flash", avgLatencyMs: 0, totalCalls: 0, successRate: 100, errorCount: 0 },
    { provider: "llama", available: false, model: "llama-3.1-70b", avgLatencyMs: 0, totalCalls: 0, successRate: 100, errorCount: 0 },
  ];
  const displayProviders = providers.length > 0 ? providers : defaultProviders;

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="dijla-bg h-screen flex flex-col">
      <Toaster position="top-right" />

      {/* ===== NAVBAR ===== */}
      <div className="dijla-navbar">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-sm font-medium flex items-center gap-2 transition-all border border-white/10">
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              )}
              <img src={moonLogo} alt="Moon" className="h-12 w-auto drop-shadow-lg" />
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">MOON DIJLA</h1>
                <p className="text-xs text-amber-300/80 font-medium tracking-wide">Enterprise BIBFRAME & Multi-AI Command Center</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={loadAIStatus} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-xs font-medium flex items-center gap-1.5 transition-all border border-white/10">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
              {onOpenCatalogEngine && (
                <button onClick={onOpenCatalogEngine} className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-sm font-semibold flex items-center gap-2 transition-all border border-amber-500/30">
                  <BookOpen className="h-4 w-4" /> Open Cataloging Engine
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== GOLD ACCENT LINE ===== */}
      <div className="dijla-gold-line" />

      {/* ===== TAB BAR ===== */}
      <div className="dijla-tabbar">
        <div className="px-6 py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {([
              { id: "overview", label: "Overview", icon: <Layers className="h-3.5 w-3.5" /> },
              { id: "ai-orchestrator", label: "AI Orchestrator", icon: <Brain className="h-3.5 w-3.5" /> },
              { id: "discovery", label: "Discovery Federation", icon: <Globe className="h-3.5 w-3.5" /> },
              { id: "ontology", label: "BIBFRAME Model", icon: <Network className="h-3.5 w-3.5" /> },
              { id: "cataloger-tools", label: "Cataloger Tools", icon: <BookOpen className="h-3.5 w-3.5" /> },
              { id: "rdf-exports", label: "RDF Serialization", icon: <Code className="h-3.5 w-3.5" /> },
              { id: "ai-governance", label: "AI Governance", icon: <Shield className="h-3.5 w-3.5" /> },
              { id: "architecture", label: "Architecture", icon: <Server className="h-3.5 w-3.5" /> },
            ] as { id: PlatformTab; label: string; icon: React.ReactNode }[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`dijla-tab ${activeTab === tab.id ? "dijla-tab-active" : ""}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 overflow-auto p-6 dijla-content">

        {/* ═══ OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatusCard title="AI Providers" value={`${displayProviders.filter(p => p.available).length}/${displayProviders.length}`} subtitle="Active" icon={<Brain className="h-6 w-6" />} accent="text-purple-600" accentBg="bg-purple-50" />
              <StatusCard title="Discovery Sources" value="19" subtitle="Federated" icon={<Globe className="h-6 w-6" />} accent="text-blue-600" accentBg="bg-blue-50" />
              <StatusCard title="BIBFRAME Classes" value="7" subtitle="Full Ontology" icon={<Network className="h-6 w-6" />} accent="text-teal-600" accentBg="bg-teal-50" />
              <StatusCard title="RDF Formats" value="4" subtitle="Export Ready" icon={<Code className="h-6 w-6" />} accent="text-amber-600" accentBg="bg-amber-50" />
            </div>

            {/* AI Provider Status */}
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-purple-600" /> Multi-AI Provider Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {displayProviders.map(p => <ProviderCard key={p.provider} provider={p} />)}
              </div>
            </div>

            {/* AI Routing Table */}
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" /> AI Task Routing Table
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 pr-4 font-semibold">Task Type</th>
                      <th className="pb-3 pr-4 font-semibold">Primary</th>
                      <th className="pb-3 pr-4 font-semibold">Fallback 1</th>
                      <th className="pb-3 font-semibold">Fallback 2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(AI_ROUTING_TABLE).map(([task, chain]) => (
                      <tr key={task} className="border-b border-gray-100">
                        <td className="py-3 pr-4 font-medium text-gray-800">{task}</td>
                        {chain.map((provider, idx) => (
                          <td key={idx} className="py-3 pr-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              idx === 0 ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-gray-50 text-gray-500 border border-gray-200"
                            }`}>
                              {idx === 0 && <ArrowRight className="h-3 w-3" />}
                              {provider}
                            </span>
                          </td>
                        ))}
                        {chain.length < 3 && <td className="py-3 text-gray-300">-</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Access */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "AI Orchestrator", icon: <Brain className="h-8 w-8" />, tab: "ai-orchestrator" as PlatformTab, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Discovery", icon: <Globe className="h-8 w-8" />, tab: "discovery" as PlatformTab, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "BIBFRAME Model", icon: <Network className="h-8 w-8" />, tab: "ontology" as PlatformTab, color: "text-teal-600", bg: "bg-teal-50" },
                { label: "RDF Export", icon: <Code className="h-8 w-8" />, tab: "rdf-exports" as PlatformTab, color: "text-amber-600", bg: "bg-amber-50" },
              ].map(item => (
                <button key={item.label} onClick={() => setActiveTab(item.tab)} className="dijla-card p-6 flex flex-col items-center gap-3 hover:shadow-lg transition-all cursor-pointer group">
                  <div className={`${item.bg} p-3 rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</div>
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ AI ORCHESTRATOR ═══ */}
        {activeTab === "ai-orchestrator" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="dijla-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-purple-600" /> AI Provider Health
                </h3>
                <button onClick={loadAIStatus} className="dijla-btn text-xs">
                  <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {displayProviders.map(p => <ProviderCard key={p.provider} provider={p} detailed />)}
              </div>
            </div>

            {/* Test AI Routing */}
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-teal-600" /> Test AI Routing
              </h3>
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <select value={testTaskType} onChange={e => setTestTaskType(e.target.value)} className="dijla-select">
                  <option value="metadata">Metadata Suggestion</option>
                  <option value="entity-linking">Entity Linking</option>
                  <option value="natural-search">Natural Language Search</option>
                  <option value="sparql">SPARQL Translation</option>
                  <option value="autofill">Auto-Fill</option>
                  <option value="discovery">Discovery Enhancement</option>
                </select>
                <input
                  type="text" value={testInput} onChange={e => setTestInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleTestAI()}
                  placeholder={testTaskType === "metadata" ? "Enter a book title..." : testTaskType === "entity-linking" ? "Enter an entity name..." : "Enter a query..."}
                  className="dijla-input flex-1"
                />
                <button onClick={handleTestAI} disabled={testLoading || !testInput.trim()} className="dijla-btn-primary dijla-btn">
                  {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Route Task
                </button>
              </div>
              {testResult && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {testResult.error ? (
                      <span className="text-red-600 text-xs flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Error</span>
                    ) : (
                      <span className="text-teal-700 text-xs flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Routed via <b>{testResult._routedVia}</b> in {testResult._latencyMs}ms
                      </span>
                    )}
                  </div>
                  <pre className="dijla-code p-4 overflow-auto text-xs max-h-64">{JSON.stringify(testResult, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Routing Log */}
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" /> Recent Routing Decisions
              </h3>
              {routingLog.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No routing decisions yet. Run an AI task to see routing activity.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {routingLog.map((d, idx) => (
                    <div key={idx} className={`dijla-row flex items-center gap-3 px-4 py-2.5 text-xs ${d.success ? "dijla-row-success" : "dijla-row-danger"}`}>
                      {d.success ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                      <span className="font-medium text-gray-800">{d.taskType}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="font-semibold text-teal-700">{d.selectedProvider}</span>
                      <span className="text-gray-400">{d.latencyMs}ms</span>
                      {d.retryCount > 0 && <span className="text-amber-600 font-medium">(retry: {d.retryCount})</span>}
                      <span className="ml-auto text-gray-400">{new Date(d.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ DISCOVERY FEDERATION ═══ */}
        {activeTab === "discovery" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" /> Federated Discovery Sources
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {DISCOVERY_SOURCES.map(s => (
                  <div key={s.name} className={`${s.bg} ${s.border} border rounded-xl p-4 text-center`}>
                    <div className={`w-11 h-11 mx-auto rounded-xl ${s.bg} border ${s.border} flex items-center justify-center ${s.text} font-bold text-sm mb-2`}>
                      {s.abbr}
                    </div>
                    <p className="text-xs font-semibold text-gray-700">{s.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{s.uri}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-teal-600" /> Federated Authority Search
              </h3>
              <div className="flex gap-3 mb-4">
                <input type="text" value={discoveryQuery} onChange={e => setDiscoveryQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleDiscoverySearch()}
                  placeholder="Search across LOC, VIAF, Wikidata, OpenLibrary..."
                  className="dijla-input flex-1" />
                <button onClick={handleDiscoverySearch} disabled={discoveryLoading} className="dijla-btn-primary dijla-btn">
                  {discoveryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search
                </button>
              </div>
              {discoveryResults.length > 0 && (
                <div className="space-y-2">
                  {discoveryResults.map((r, idx) => (
                    <div key={idx} className="dijla-row flex items-center gap-3 px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.source === "Library of Congress" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        r.source === "VIAF" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                        "bg-green-50 text-green-700 border border-green-200"
                      }`}>{r.source}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                        {r.uri && <p className="text-[10px] text-gray-400 font-mono truncate">{r.uri}</p>}
                      </div>
                      {r.type && <span className="text-xs text-gray-400">{r.type}</span>}
                      <a href={r.uri} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700"><Link className="h-3.5 w-3.5" /></a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI-Enhanced Discovery */}
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" /> AI-Enhanced Discovery
              </h3>
              <p className="text-sm text-gray-500 mb-4">Use AI to rewrite queries, expand subjects, find related entities, and suggest filters for better catalog discovery.</p>
              <div className="flex gap-3 mb-4">
                <input type="text" value={aiEnhanceQuery} onChange={e => setAiEnhanceQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAIEnhance()}
                  placeholder="e.g. books about islamic philosophy in iraq..."
                  className="dijla-input flex-1" />
                <button onClick={handleAIEnhance} disabled={aiEnhanceLoading || !aiEnhanceQuery.trim()} className="dijla-btn-primary dijla-btn">
                  {aiEnhanceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Enhance
                </button>
              </div>
              {aiEnhanceResult && !aiEnhanceResult.error && (
                <div className="space-y-3">
                  {aiEnhanceResult.rewrittenQuery && (
                    <div className="dijla-row px-4 py-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Rewritten Query</p>
                      <p className="text-sm text-teal-700 font-medium">{aiEnhanceResult.rewrittenQuery}</p>
                    </div>
                  )}
                  {aiEnhanceResult.expandedSubjects?.length > 0 && (
                    <div className="dijla-row px-4 py-3">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Expanded Subjects</p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiEnhanceResult.expandedSubjects.map((s: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-200 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiEnhanceResult.relatedEntities?.length > 0 && (
                    <div className="dijla-row px-4 py-3">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Related Entities</p>
                      <div className="space-y-1">
                        {aiEnhanceResult.relatedEntities.map((e: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-200">{e.type}</span>
                            <span className="text-gray-800 font-medium">{e.label}</span>
                            <span className="text-gray-400 ml-auto">{Math.round((e.relevance || 0) * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiEnhanceResult.synonyms?.length > 0 && (
                    <div className="dijla-row px-4 py-3">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Synonyms</p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiEnhanceResult.synonyms.map((s: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiEnhanceResult._governance && (
                    <div className="text-[10px] text-gray-400 px-4 flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      Routed via {aiEnhanceResult._routedVia} | {aiEnhanceResult._latencyMs}ms | {aiEnhanceResult._governance.disclaimer}
                    </div>
                  )}
                </div>
              )}
              {aiEnhanceResult?.error && (
                <div className="dijla-row dijla-row-danger px-4 py-3 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5" /> {aiEnhanceResult.error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ BIBFRAME MODEL ═══ */}
        {activeTab === "ontology" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Network className="h-5 w-5 text-teal-600" /> BIBFRAME Ontology Model
              </h3>
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="dijla-wemi-work px-10 py-4 rounded-xl text-center">
                  <p className="font-bold text-lg">bf:Work</p>
                  <p className="text-xs opacity-70">Intellectual content</p>
                </div>
                <div className="w-px h-5 bg-gradient-to-b from-blue-400 to-green-400" />
                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1"><ChevronDown className="h-3 w-3" /> bf:hasInstance</span>
                <div className="dijla-wemi-instance px-10 py-4 rounded-xl text-center">
                  <p className="font-bold text-lg">bf:Instance</p>
                  <p className="text-xs opacity-70">Material embodiment</p>
                </div>
                <div className="w-px h-5 bg-gradient-to-b from-green-400 to-orange-400" />
                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1"><ChevronDown className="h-3 w-3" /> bf:hasItem</span>
                <div className="dijla-wemi-item px-10 py-4 rounded-xl text-center">
                  <p className="font-bold text-lg">bf:Item</p>
                  <p className="text-xs opacity-70">Actual copy</p>
                </div>
              </div>
            </div>

            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">BIBFRAME Classes & Properties</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BIBFRAME_MODEL.classes.map(cls => <ClassCard key={cls.name} cls={cls} />)}
              </div>
            </div>

            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Supported RDF Serializations</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BIBFRAME_MODEL.exportFormats.map(fmt => (
                  <div key={fmt} className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <Code className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">{fmt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ CATALOGER TOOLS ═══ */}
        {activeTab === "cataloger-tools" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-600" /> Cataloger Toolkit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ToolCard title="LC Cutter Calculator" description="Generate LC Cutter numbers for classification" icon={<BarChart3 className="h-6 w-6 text-blue-600" />} />
                <ToolCard title="Authority Search" description="Search LOC, VIAF, Wikidata authorities" icon={<Search className="h-6 w-6 text-purple-600" />} />
                <ToolCard title="Classification Lookup" description="Browse LC Classification schedules" icon={<Database className="h-6 w-6 text-teal-600" />} />
                <ToolCard title="ISBN Metadata Import" description="Auto-fill from ISBN via OpenLibrary, Google Books" icon={<Book className="h-6 w-6 text-amber-600" />} />
                <ToolCard title="OCLC Lookup" description="Search WorldCat/OCLC for matching records" icon={<Globe className="h-6 w-6 text-blue-600" />} />
                <ToolCard title="MARC Preview" description="Live MARC21 preview from BIBFRAME data" icon={<FileText className="h-6 w-6 text-red-600" />} />
              </div>
            </div>

            <CutterCalculator />

            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Link className="h-5 w-5 text-purple-600" /> Authority Resolution Pipeline
              </h3>
              <div className="space-y-3">
                {["Names", "Subjects", "Places", "Works"].map(type => (
                  <div key={type} className="dijla-row flex items-center gap-4 px-4 py-3">
                    <span className="text-sm font-semibold text-gray-800 w-24">{type}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="flex gap-2 flex-wrap">
                      {["LOC", "VIAF", "Wikidata", "FAST"].map(source => (
                        <span key={source} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">{source}</span>
                      ))}
                    </div>
                    <span className="ml-auto text-xs text-green-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Auto-resolve
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ RDF EXPORTS ═══ */}
        {activeTab === "rdf-exports" && rdfSample && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Code className="h-5 w-5 text-amber-600" /> RDF Serialization Formats
              </h3>
              <p className="text-sm text-gray-500">MOON DIJLA supports all major RDF serialization formats. Records can be exported for Linked Data publishing.</p>
            </div>
            <RDFFormatPanel title="JSON-LD" content={rdfSample.jsonld} description="JavaScript Object Notation for Linked Data" />
            <RDFFormatPanel title="Turtle" content={rdfSample.turtle} description="Terse RDF Triple Language - human-readable RDF" />
            <RDFFormatPanel title="RDF/XML" content={rdfSample.rdfxml} description="XML-based RDF serialization" />
            <RDFFormatPanel title="N-Triples" content={rdfSample.ntriples} description="Line-based triple format for streaming" />
          </div>
        )}

        {/* ═══ AI GOVERNANCE ═══ */}
        {activeTab === "ai-governance" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-600" /> AI Governance Principles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GovernanceCard title="Reviewable" description="All AI outputs presented to cataloger for review before acceptance." icon={<Eye className="h-8 w-8 text-blue-600" />} bg="bg-blue-50" />
                <GovernanceCard title="Editable" description="Catalogers can modify any AI suggestion before applying it." icon={<FileText className="h-8 w-8 text-teal-600" />} bg="bg-teal-50" />
                <GovernanceCard title="Traceable" description="Every AI decision is logged with provider, confidence, and approval." icon={<Activity className="h-8 w-8 text-purple-600" />} bg="bg-purple-50" />
              </div>
            </div>

            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Core Governance Rules</h3>
              <div className="space-y-2">
                {[
                  "AI is assistive, not authoritative. The cataloger is always the final authority.",
                  "AI never directly mutates canonical RDF records.",
                  "All AI outputs are logged and auditable in the audit trail.",
                  "AI suggestions include confidence scores for transparency.",
                  "Multiple AI providers ensure no single-vendor lock-in.",
                  "Circuit breaker pattern prevents cascading failures.",
                  "SPARQL queries are safety-validated (no INSERT/DELETE/UPDATE).",
                  "All AI interactions are stored with full provenance metadata.",
                ].map((rule, idx) => (
                  <div key={idx} className="dijla-row flex items-start gap-3 px-4 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-600">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" /> AI Routing Audit Trail
              </h3>
              {routingLog.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No audit entries yet.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {routingLog.map((e, idx) => (
                    <div key={idx} className={`dijla-row flex items-center gap-3 px-4 py-2.5 text-xs ${e.success ? "dijla-row-success" : "dijla-row-danger"}`}>
                      {e.success ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                      <span className="text-gray-800 font-medium">{e.taskType}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="text-teal-700 font-semibold">{e.selectedProvider}</span>
                      <span className="text-gray-400">{e.latencyMs}ms</span>
                      <span className="ml-auto text-gray-400">{new Date(e.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ ARCHITECTURE ═══ */}
        {activeTab === "architecture" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-600" /> MOON DIJLA System Architecture
              </h3>
              <div className="flex flex-col items-center gap-3">
                <ArchTier label="Frontend" description="React + TypeScript + Tailwind CSS" className="dijla-tier-frontend" items={["BIBFRAME Editor (Marva/Sinopia/FOLIO inspired)", "Multi-AI Dashboard", "Discovery Federation", "OPAC View", "MARC/RDF Preview"]} />
                <div className="flex items-center gap-2">
                  <div className="w-px h-7 bg-gradient-to-b from-blue-400 to-purple-400" />
                  <span className="text-[10px] text-gray-400 font-mono">REST API</span>
                  <div className="w-px h-7 bg-gradient-to-b from-blue-400 to-purple-400" />
                </div>
                <ArchTier label="Backend" description="Deno + Hono + Supabase Edge Functions" className="dijla-tier-backend" items={["AI Routing Engine (OpenAI/Gemini/LLaMA)", "BIBFRAME RDF Engine", "Authority Resolution Service", "Discovery Federation Engine", "SPARQL Query Engine"]} />
                <div className="flex items-center gap-2">
                  <div className="w-px h-7 bg-gradient-to-b from-purple-400 to-green-400" />
                  <span className="text-[10px] text-gray-400 font-mono">PostgreSQL + KV</span>
                  <div className="w-px h-7 bg-gradient-to-b from-purple-400 to-green-400" />
                </div>
                <ArchTier label="Database" description="Supabase PostgreSQL + KV Store" className="dijla-tier-database" items={["BIBFRAME Records (JSON-LD)", "Authority Cache", "AI Audit Trail", "User Sessions", "Routing Decisions"]} />
              </div>
            </div>

            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Core API Endpoints</h3>
              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {[
                  { method: "GET", path: "/engine/status", desc: "System health check" },
                  { method: "GET", path: "/engine/ontology", desc: "BIBFRAME ontology schema" },
                  { method: "POST", path: "/engine/process", desc: "Process BIBFRAME entity" },
                  { method: "GET", path: "/authority/names", desc: "Search LC Name Authority" },
                  { method: "GET", path: "/authority/subjects", desc: "Search LC Subject Headings" },
                  { method: "GET", path: "/viaf/search", desc: "Search VIAF authorities" },
                  { method: "POST", path: "/sparql/query", desc: "Execute SPARQL query" },
                  { method: "POST", path: "/ai-router/suggest-metadata", desc: "AI metadata suggestions (routed)" },
                  { method: "POST", path: "/ai-router/entity-linking", desc: "AI entity linking (routed)" },
                  { method: "POST", path: "/ai-router/detect-duplicates", desc: "AI duplicate detection (routed)" },
                  { method: "POST", path: "/ai-router/natural-search", desc: "AI natural language search (routed)" },
                  { method: "POST", path: "/ai-router/sparql-translate", desc: "AI SPARQL translation (routed)" },
                  { method: "POST", path: "/ai-router/autofill", desc: "AI BIBFRAME auto-fill (routed)" },
                  { method: "POST", path: "/ai-router/discovery-enhance", desc: "AI discovery enhancement (routed)" },
                  { method: "GET", path: "/ai-router/status", desc: "AI provider health status" },
                  { method: "GET", path: "/ai-router/routing-log", desc: "AI routing audit log" },
                  { method: "POST", path: "/ai-router/config", desc: "Update router configuration" },
                  { method: "POST", path: "/ai-router/reset-circuit/:provider", desc: "Reset circuit breaker" },
                  { method: "POST", path: "/records/save", desc: "Save BIBFRAME record" },
                  { method: "GET", path: "/records", desc: "List all records" },
                ].map((ep, idx) => (
                  <div key={idx} className="dijla-row flex items-center gap-3 px-4 py-2 text-xs">
                    <span className={`px-2 py-0.5 rounded font-bold ${ep.method === "GET" ? "bg-green-50 text-green-700 border border-green-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>{ep.method}</span>
                    <code className="text-amber-700 font-mono font-medium flex-1">{ep.path}</code>
                    <span className="text-gray-500">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">URI Strategy</h3>
              <div className="space-y-1.5">
                {[
                  { pattern: "/work/{id}", example: "http://moonlib.org/work/12345" },
                  { pattern: "/instance/{id}", example: "http://moonlib.org/instance/12345" },
                  { pattern: "/item/{id}", example: "http://moonlib.org/item/12345" },
                  { pattern: "/agent/{id}", example: "http://moonlib.org/agent/12345" },
                ].map((uri, idx) => (
                  <div key={idx} className="dijla-row flex items-center gap-4 px-4 py-2.5 text-xs">
                    <code className="text-teal-700 font-mono font-bold">{uri.pattern}</code>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <code className="text-amber-700 font-mono">{uri.example}</code>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Content negotiation: HTML (humans), JSON-LD (machines), RDF/XML, Turtle</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS (Dijla River Theme)
// ═══════════════════════════════════════════════════════════

function StatusCard({ title, value, subtitle, icon, accent, accentBg }: { title: string; value: string; subtitle: string; icon: React.ReactNode; accent: string; accentBg: string }) {
  return (
    <div className="dijla-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <div className={`${accentBg} p-3 rounded-xl ${accent}`}>{icon}</div>
      </div>
    </div>
  );
}

function ProviderCard({ provider, detailed }: { provider: AIProviderStatus; detailed?: boolean }) {
  const names: Record<string, string> = { openai: "OpenAI GPT", gemini: "Google Gemini", llama: "Meta LLaMA" };
  const handleResetCircuit = async () => {
    try {
      await apiCall(`/ai-router/reset-circuit/${provider.provider}`, { method: "POST" });
      toast.success(`Circuit breaker reset for ${names[provider.provider] || provider.provider}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  return (
    <div className={`dijla-provider ${provider.available ? "dijla-provider-online" : "dijla-provider-offline"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-800 text-sm">{names[provider.provider] || provider.provider}</span>
        <div className="flex items-center gap-1.5">
          {provider.circuitBreakerOpen && <span className="dijla-badge-warn">CIRCUIT OPEN</span>}
          <span className={provider.available ? "dijla-badge-success" : "dijla-badge-danger"}>
            {provider.available ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 font-mono mb-2">{provider.model}</p>
      {detailed && (
        <div className="space-y-1 text-xs text-gray-500 border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between"><span>Total Calls:</span><span className="text-gray-800 font-medium">{provider.totalCalls}</span></div>
          <div className="flex justify-between"><span>Success Rate:</span><span className="text-green-700 font-medium">{provider.successRate}%</span></div>
          <div className="flex justify-between"><span>Avg Latency:</span><span className="text-gray-800 font-medium">{provider.avgLatencyMs}ms</span></div>
          <div className="flex justify-between"><span>Errors:</span><span className={provider.errorCount > 0 ? "text-red-600 font-medium" : "text-gray-800"}>{provider.errorCount}</span></div>
          {provider.consecutiveErrors !== undefined && provider.consecutiveErrors > 0 && (
            <div className="flex justify-between"><span>Consecutive Errors:</span><span className="text-amber-600 font-medium">{provider.consecutiveErrors}/5</span></div>
          )}
          {provider.circuitBreakerOpen && provider.circuitBreakerResetAt && (
            <div className="flex justify-between"><span>Resets at:</span><span className="text-amber-600 font-medium">{new Date(provider.circuitBreakerResetAt).toLocaleTimeString()}</span></div>
          )}
          {provider.circuitBreakerOpen && (
            <button onClick={handleResetCircuit} className="w-full mt-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-all flex items-center justify-center gap-1">
              <RefreshCw className="h-3 w-3" /> Reset Circuit Breaker
            </button>
          )}
          {provider.lastCallTimestamp && (
            <div className="flex justify-between pt-1 border-t border-gray-100 mt-1">
              <span>Last Call:</span>
              <span className="text-gray-600 font-medium">{new Date(provider.lastCallTimestamp).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ClassCard({ cls }: { cls: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setExpanded(!expanded)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-all">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-teal-600" />
          <span className="font-semibold text-gray-800 text-sm">{cls.name}</span>
        </div>
        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 mt-2">{cls.description}</p>
          <div className="flex flex-wrap gap-1">
            {cls.properties.map((prop: string) => (
              <span key={prop} className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[10px] font-mono text-amber-800">{prop}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-amber-300 transition-all cursor-pointer">
      <div className="flex items-center gap-3 mb-2">{icon}<h4 className="font-semibold text-gray-800 text-sm">{title}</h4></div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

function CutterCalculator() {
  const [authorName, setAuthorName] = useState("");
  const [cutterResult, setCutterResult] = useState("");
  const calculateCutter = () => {
    if (!authorName.trim()) return;
    const name = authorName.trim().toUpperCase();
    const firstLetter = name[0];
    const rest = name.slice(1, 4);
    const charToNum = (c: string) => Math.max(1, Math.min(9, Math.floor((c.charCodeAt(0) - 65) / 3) + 1)).toString();
    setCutterResult(`${firstLetter}${rest.split("").map(charToNum).join("")}`);
  };
  return (
    <div className="dijla-card p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-600" /> LC Cutter Number Calculator
      </h3>
      <div className="flex gap-3">
        <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} onKeyDown={e => e.key === "Enter" && calculateCutter()}
          placeholder="Enter author surname..." className="dijla-input flex-1" />
        <button onClick={calculateCutter} className="dijla-btn">Calculate</button>
      </div>
      {cutterResult && (
        <div className="mt-3 px-4 py-3 bg-teal-50 border border-teal-200 rounded-xl">
          <span className="text-sm text-gray-600">Cutter Number: </span>
          <span className="text-lg font-bold text-teal-700 font-mono">{cutterResult}</span>
        </div>
      )}
    </div>
  );
}

function GovernanceCard({ title, description, icon, bg }: { title: string; description: string; icon: React.ReactNode; bg: string }) {
  return (
    <div className={`${bg} border border-gray-200 rounded-xl p-6 text-center`}>
      <div className="mx-auto mb-3">{icon}</div>
      <h4 className="text-lg font-bold text-gray-800 mb-2">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

function RDFFormatPanel({ title, content, description }: { title: string; content: string; description: string }) {
  const [expanded, setExpanded] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(content); toast.success(`${title} copied`); };
  const handleDownload = () => {
    const ext = title === "JSON-LD" ? "jsonld" : title === "Turtle" ? "ttl" : title === "RDF/XML" ? "rdf" : "nt";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `bibframe-sample.${ext}`; a.click();
    URL.revokeObjectURL(url); toast.success(`${title} downloaded`);
  };
  return (
    <div className="dijla-card overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-all">
        <div className="flex items-center gap-3">
          <Code className="h-5 w-5 text-amber-600" />
          <div className="text-left">
            <h4 className="font-bold text-gray-800">{title}</h4>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expanded ? "" : "-rotate-90"}`} />
      </button>
      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="flex gap-2 my-3">
            <button onClick={handleCopy} className="dijla-btn text-xs"><Copy className="h-3 w-3" /> Copy</button>
            <button onClick={handleDownload} className="dijla-btn text-xs"><Download className="h-3 w-3" /> Download</button>
          </div>
          <pre className="dijla-code p-4 overflow-auto text-xs max-h-64">{content}</pre>
        </div>
      )}
    </div>
  );
}

function ArchTier({ label, description, className, items }: { label: string; description: string; className: string; items: string[] }) {
  return (
    <div className={`w-full max-w-2xl rounded-xl p-5 ${className}`}>
      <h4 className="text-lg font-bold text-gray-800 text-center mb-1">{label}</h4>
      <p className="text-xs text-gray-500 text-center mb-3 font-mono">{description}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {items.map(item => (
          <span key={item} className="px-2 py-1 bg-white/70 border border-gray-200 rounded-lg text-[10px] text-gray-600 font-medium">{item}</span>
        ))}
      </div>
    </div>
  );
}