/**
 * ═══════════════════════════════════════════════════════════════
 * MOON AI ORCHESTRATOR
 * Multi-AI Agent System for BIBFRAME Cataloging
 * ═══════════════════════════════════════════════════════════════
 * 
 * Architecture:
 *   User → Moon BIBFRAME Editor → MoonAIOrchestrator → AI Provider Router
 *     ├── OpenAI   (metadata reasoning, SPARQL generation, NL search)
 *     ├── Gemini   (entity extraction, knowledge graph linking)
 *     └── LLaMA    (duplicate detection, classification, clustering)
 * 
 * All 5 AI Phases + Discovery AI + Entity Linking + Knowledge Graph
 * Every button calls a real backend API.
 * 
 * Designed by isaac faleh
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";
import {
  ChevronLeft, Search, Database, Network, BookOpen, Activity,
  Layers, Zap, RefreshCw, CheckCircle2, AlertCircle, Clock,
  ArrowRight, Server, Code, FileText, Eye, Sparkles, Loader2,
  Send, Download, Copy, Link, ExternalLink, BookMarked,
  X, Plus, GitBranch, Share2, Wifi, WifiOff, Globe, Shield,
  Brain, Bot, Cpu, ChevronDown, ChevronUp, Play, Square,
  BarChart3, Save, Settings, Hash, PenTool, Users, MapPin,
  Workflow, RotateCcw, CircleDot, Gauge, ScanSearch, Binary,
  Cog, ListOrdered, Boxes, Waypoints, Unplug, ShieldCheck,
  TriangleAlert, CircleCheck, Flame, Target, BookText, Lightbulb,
  Radio, Layers3
} from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import moonLogo from "figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png";
import "../../styles/dijla-theme.css";

// ─── API Layer ───────────────────────────────────────────────

const API = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c`;
const H = { "Authorization": `Bearer ${publicAnonKey}`, "Content-Type": "application/json" };

async function api(path: string, opts: RequestInit = {}) {
  const t0 = Date.now();
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...H, ...(opts.headers as any || {}) } });
  const data = await res.json().catch(() => null);
  const ms = Date.now() - t0;
  if (!res.ok) throw Object.assign(new Error(data?.error || `HTTP ${res.status}`), { ms });
  return { ...data, _ms: ms };
}

const get = (p: string) => api(p);
const post = (p: string, b: any) => api(p, { method: "POST", body: JSON.stringify(b) });

// ─── Types ───────────────────────────────────────────────────

type Tab = "orchestrator" | "phase1" | "phase2" | "phase3" | "phase4" | "phase5" | "discovery" | "entity-linking" | "knowledge-graph" | "audit";

interface Provider {
  name: string;
  status: string;
  circuitState?: string;
  totalRequests?: number;
  failedRequests?: number;
  successRate?: number;
  avgLatency?: number;
  lastUsed?: string;
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

interface Props { onBack?: () => void; }

export default function MoonAIOrchestrator({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>("orchestrator");
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  useEffect(() => {
    get("/health").then(() => setServerOk(true)).catch(() => setServerOk(false));
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; group?: string }[] = [
    { id: "orchestrator", label: "Orchestrator", icon: <Workflow className="h-3.5 w-3.5" />, group: "core" },
    { id: "phase1", label: "Phase 1: Metadata", icon: <Sparkles className="h-3.5 w-3.5" />, group: "phases" },
    { id: "phase2", label: "Phase 2: Duplicates", icon: <ScanSearch className="h-3.5 w-3.5" />, group: "phases" },
    { id: "phase3", label: "Phase 3: NL Search", icon: <Brain className="h-3.5 w-3.5" />, group: "phases" },
    { id: "phase4", label: "Phase 4: SPARQL", icon: <Code className="h-3.5 w-3.5" />, group: "phases" },
    { id: "phase5", label: "Phase 5: Auto-Fill", icon: <Zap className="h-3.5 w-3.5" />, group: "phases" },
    { id: "discovery", label: "Discovery AI", icon: <Globe className="h-3.5 w-3.5" />, group: "advanced" },
    { id: "entity-linking", label: "Entity Linking", icon: <Waypoints className="h-3.5 w-3.5" />, group: "advanced" },
    { id: "knowledge-graph", label: "Knowledge Graph", icon: <Share2 className="h-3.5 w-3.5" />, group: "advanced" },
    { id: "audit", label: "Audit Log", icon: <ShieldCheck className="h-3.5 w-3.5" />, group: "core" },
  ];

  return (
    <div className="dijla-bg h-screen flex flex-col">
      <Toaster position="top-right" richColors />

      {/* ── NAVBAR ── */}
      <nav className="dijla-navbar">
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium flex items-center gap-1.5 transition-all border border-white/10">
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
            <img src={moonLogo} alt="Moon" className="h-10 w-auto drop-shadow-lg" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                MOON AI ORCHESTRATOR
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-400/30">MULTI-AI</span>
              </h1>
              <p className="text-[10px] text-amber-300/70 font-medium tracking-wider">OpenAI + Google Gemini + Meta LLaMA — BIBFRAME Cataloging Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-medium ${serverOk === true ? "text-green-400" : serverOk === false ? "text-red-400" : "text-yellow-400"}`}>
              {serverOk === true ? <Wifi className="h-3 w-3" /> : serverOk === false ? <WifiOff className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin" />}
              {serverOk === true ? "Engine Online" : serverOk === false ? "Offline" : "Connecting..."}
            </span>
          </div>
        </div>
      </nav>
      <div className="dijla-gold-line" />

      {/* ── TAB BAR ── */}
      <div className="dijla-tabbar">
        <div className="px-5 py-1.5">
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`dijla-tab whitespace-nowrap ${tab === t.id ? "dijla-tab-active" : ""}`}>
                {t.icon} <span className="hidden lg:inline">{t.label}</span>
                <span className="lg:hidden">{t.label.split(":").pop()?.trim() || t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-auto p-5 dijla-content">
        {tab === "orchestrator" && <OrchestratorTab />}
        {tab === "phase1" && <Phase1Tab />}
        {tab === "phase2" && <Phase2Tab />}
        {tab === "phase3" && <Phase3Tab />}
        {tab === "phase4" && <Phase4Tab />}
        {tab === "phase5" && <Phase5Tab />}
        {tab === "discovery" && <DiscoveryAITab />}
        {tab === "entity-linking" && <EntityLinkingTab />}
        {tab === "knowledge-graph" && <KnowledgeGraphTab />}
        {tab === "audit" && <AuditTab />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ORCHESTRATOR DASHBOARD
// ═══════════════════════════════════════════════════════════

function OrchestratorTab() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [routingLog, setRoutingLog] = useState<any[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [aiKeyStatus, setAiKeyStatus] = useState<any>(null);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const [status, keyInfo] = await Promise.all([
        get("/ai-router/status"),
        get("/ai/debug-key"),
      ]);
      setProviders(status.providers || []);
      setConfig(status.config || null);
      setAiKeyStatus(keyInfo);
    } catch (err: any) {
      toast.error(`Failed to load orchestrator status: ${err.message}`);
    } finally { setLoading(false); }
  };

  const loadRoutingLog = async () => {
    setLogLoading(true);
    try {
      const data = await get("/ai-router/routing-log?limit=20");
      setRoutingLog(data.log || []);
    } catch (err: any) {
      toast.error(`Failed to load routing log: ${err.message}`);
    } finally { setLogLoading(false); }
  };

  const resetCircuit = async (provider: string) => {
    try {
      await post(`/ai-router/reset-circuit/${provider}`, {});
      toast.success(`Circuit breaker for ${provider} reset`);
      loadStatus();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => { loadStatus(); loadRoutingLog(); }, []);

  const providerMeta: Record<string, { color: string; gradient: string; icon: React.ReactNode; bestFor: string[] }> = {
    openai: {
      color: "text-emerald-700",
      gradient: "from-emerald-50 to-green-50",
      icon: <Bot className="h-6 w-6 text-emerald-600" />,
      bestFor: ["Metadata reasoning", "SPARQL generation", "NL search", "Cataloging suggestions"],
    },
    gemini: {
      color: "text-blue-700",
      gradient: "from-blue-50 to-indigo-50",
      icon: <Sparkles className="h-6 w-6 text-blue-600" />,
      bestFor: ["Entity extraction", "Knowledge graph linking", "Subject analysis"],
    },
    llama: {
      color: "text-purple-700",
      gradient: "from-purple-50 to-fuchsia-50",
      icon: <Flame className="h-6 w-6 text-purple-600" />,
      bestFor: ["Duplicate detection", "Record clustering", "Text classification"],
    },
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Architecture Diagram */}
      <div className="dijla-card p-5">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Workflow className="h-5 w-5 text-teal-600" /> MoonAIOrchestrator — Architecture
        </h3>
        <div className="flex flex-col items-center gap-2 text-xs font-semibold">
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl px-6 py-2.5 text-amber-800 shadow-sm flex items-center gap-2">
            <Users className="h-4 w-4" /> Cataloger / User
          </div>
          <ArrowDown />
          <div className="bg-white border-2 border-teal-400 rounded-xl px-6 py-2.5 text-teal-800 shadow-sm flex items-center gap-2">
            <BookText className="h-4 w-4" /> Moon BIBFRAME Editor
          </div>
          <ArrowDown />
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-500 rounded-xl px-8 py-3 text-teal-900 shadow-md flex items-center gap-2">
            <Cpu className="h-5 w-5" /> <span className="text-sm">MoonAIOrchestrator</span>
          </div>
          <ArrowDown />
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-400 rounded-xl px-6 py-2 text-gray-700 shadow-sm flex items-center gap-2">
            <Workflow className="h-4 w-4" /> AI Provider Router (circuit-breaker + health tracking)
          </div>
          <div className="flex items-start gap-4 mt-1">
            {(["openai", "gemini", "llama"] as const).map(p => {
              const m = providerMeta[p];
              const prov = providers.find(pr => pr.name?.toLowerCase() === p);
              const online = prov?.status === "online" || prov?.status === "active";
              return (
                <div key={p} className={`flex flex-col items-center gap-1.5 bg-gradient-to-b ${m.gradient} border rounded-xl px-4 py-3 min-w-[140px] ${online ? "border-green-300" : "border-gray-300 opacity-60"}`}>
                  <div className="flex items-center gap-1.5">{m.icon} <span className={`font-bold text-sm capitalize ${m.color}`}>{p === "llama" ? "Meta LLaMA" : p === "gemini" ? "Google Gemini" : "OpenAI"}</span></div>
                  {online ? <span className="dijla-badge-success">Online</span> : <span className="dijla-badge-warn">Not configured</span>}
                  <div className="text-[9px] text-gray-500 text-center leading-tight mt-1">
                    {m.bestFor.map(b => <div key={b}>• {b}</div>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Provider Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["openai", "gemini", "llama"] as const).map(provName => {
          const prov = providers.find(p => p.name?.toLowerCase() === provName);
          const m = providerMeta[provName];
          const online = prov?.status === "online" || prov?.status === "active";
          return (
            <div key={provName} className={`dijla-card p-4 border-l-4 ${online ? "border-l-green-500" : "border-l-gray-300"}`}>
              <div className="flex items-center gap-3 mb-3">
                {m.icon}
                <div className="flex-1">
                  <p className={`font-bold text-sm ${m.color}`}>{provName === "llama" ? "Meta LLaMA" : provName === "gemini" ? "Google Gemini" : "OpenAI"}</p>
                  <p className="text-[10px] text-gray-400">{online ? "Connected & Active" : "Not configured — set API key"}</p>
                </div>
                {online ? <CircleCheck className="h-5 w-5 text-green-500" /> : <TriangleAlert className="h-5 w-5 text-amber-400" />}
              </div>
              {prov && (
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between"><span>Circuit:</span><span className={`font-semibold ${prov.circuitState === "closed" ? "text-green-600" : prov.circuitState === "open" ? "text-red-600" : "text-amber-600"}`}>{prov.circuitState || "N/A"}</span></div>
                  <div className="flex justify-between"><span>Requests:</span><span className="font-semibold text-gray-700">{prov.totalRequests ?? 0}</span></div>
                  <div className="flex justify-between"><span>Success Rate:</span><span className="font-semibold text-gray-700">{prov.successRate != null ? `${(prov.successRate * 100).toFixed(0)}%` : "N/A"}</span></div>
                  <div className="flex justify-between"><span>Avg Latency:</span><span className="font-semibold text-gray-700">{prov.avgLatency != null ? `${prov.avgLatency}ms` : "N/A"}</span></div>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                {prov?.circuitState === "open" && (
                  <button onClick={() => resetCircuit(provName)} className="dijla-btn text-[10px] px-2 py-1">
                    <RotateCcw className="h-3 w-3" /> Reset Circuit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* API Key Status */}
      <div className={`dijla-card p-4 flex items-center gap-3 ${aiKeyStatus?.configured ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-400"}`}>
        <Shield className={`h-5 w-5 ${aiKeyStatus?.configured ? "text-green-600" : "text-red-500"}`} />
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">OpenAI API Key: {aiKeyStatus?.status || "Checking..."}</p>
          <p className="text-[10px] text-gray-400">Prefix: {aiKeyStatus?.keyPrefix || "—"} | Length: {aiKeyStatus?.keyLength || 0}</p>
        </div>
        <div className="text-[10px] text-gray-400 text-right">
          <p>For Gemini: set <code className="bg-gray-100 px-1 rounded">GEMINI_API_KEY</code></p>
          <p>For LLaMA: set <code className="bg-gray-100 px-1 rounded">LLAMA_API_KEY</code></p>
        </div>
      </div>

      {/* Router Config */}
      {config && (
        <div className="dijla-card p-4">
          <h4 className="font-bold text-sm text-gray-800 mb-2 flex items-center gap-2"><Settings className="h-4 w-4 text-gray-500" /> Router Configuration</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {Object.entries(config).map(([k, v]) => (
              <div key={k} className="dijla-row px-3 py-2 rounded-lg">
                <span className="text-gray-400 font-mono text-[10px]">{k}</span>
                <p className="font-semibold text-gray-700">{typeof v === "object" ? JSON.stringify(v) : String(v)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Routing Log */}
      <div className="dijla-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2"><ListOrdered className="h-4 w-4 text-blue-600" /> Recent Routing Decisions</h4>
          <button onClick={loadRoutingLog} disabled={logLoading} className="dijla-btn text-[10px] px-2 py-1">
            <RefreshCw className={`h-3 w-3 ${logLoading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
        {routingLog.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No routing decisions yet. Use any AI feature to generate logs.</p>
        ) : (
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {routingLog.map((entry, i) => (
              <div key={i} className="dijla-row px-3 py-2 flex items-center gap-3 text-xs">
                <span className="dijla-badge-info capitalize">{entry.provider || "—"}</span>
                <span className="flex-1 text-gray-700 truncate font-medium">{entry.task || entry.action || "—"}</span>
                <span className="text-gray-400 text-[10px]">{entry.latencyMs ? `${entry.latencyMs}ms` : ""}</span>
                {entry.success !== undefined && (
                  entry.success ? <CircleCheck className="h-3.5 w-3.5 text-green-500" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                )}
                <span className="text-[9px] text-gray-400">{entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArrowDown() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-0.5 h-3 bg-gray-300" />
      <ChevronDown className="h-3 w-3 text-gray-400 -mt-1" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PHASE 1: AI METADATA SUGGESTIONS (OpenAI primary)
// ═══════════════════════════════════════════════════════════

function Phase1Tab() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [useRouter, setUseRouter] = useState(true);
  const [timing, setTiming] = useState(0);

  const run = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setLoading(true);
    setResult(null);
    const t0 = Date.now();
    try {
      const endpoint = useRouter ? "/ai-router/suggest-metadata" : "/ai/suggest-metadata";
      const data = await post(endpoint, { title, author, isbn, description });
      setResult(data);
      setTiming(Date.now() - t0);
      toast.success(`Phase 1 complete — metadata suggested via ${useRouter ? "AI Router" : "OpenAI direct"} in ${Date.now() - t0}ms`);
    } catch (err: any) {
      toast.error(`Phase 1 error: ${err.message}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PhaseHeader phase={1} title="AI Metadata Suggestions" description="AI analyzes title, ISBN, and description to suggest bf:contribution, bf:subject, bf:genreForm, bf:classification as valid BIBFRAME RDF triples." provider="OpenAI (primary)" color="emerald" />

      <div className="dijla-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <label className="text-xs font-semibold text-gray-600">Route via:</label>
          <RouterToggle useRouter={useRouter} setUseRouter={setUseRouter} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (required)" className="dijla-input text-sm" />
          <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author (optional)" className="dijla-input text-sm" />
          <input value={isbn} onChange={e => setIsbn(e.target.value)} placeholder="ISBN (optional)" className="dijla-input text-sm" />
        </div>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description / abstract..." className="dijla-input text-sm w-full h-20 resize-none mb-4" />
        <button onClick={run} disabled={loading || !title.trim()} className="dijla-btn-primary dijla-btn text-xs">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Suggest Metadata
        </button>
      </div>

      {result && <ResultCard title="AI Metadata Suggestions" data={result} timing={timing} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PHASE 2: AI DUPLICATE DETECTION (LLaMA primary)
// ═══════════════════════════════════════════════════════════

function Phase2Tab() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [useRouter, setUseRouter] = useState(true);
  const [timing, setTiming] = useState(0);

  const run = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setLoading(true);
    setResult(null);
    const t0 = Date.now();
    try {
      const endpoint = useRouter ? "/ai-router/detect-duplicates" : "/ai/detect-duplicates";
      const data = await post(endpoint, { title, author, isbn, publicationYear: year });
      setResult(data);
      setTiming(Date.now() - t0);
      const count = data.candidates?.length || data.duplicates?.length || 0;
      toast.success(`Phase 2 complete — ${count} potential duplicates found in ${Date.now() - t0}ms`);
    } catch (err: any) {
      toast.error(`Phase 2 error: ${err.message}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PhaseHeader phase={2} title="AI Duplicate Detection" description="AI scans the catalog for same ISBN, same title, similar author, similar publication year. Creates clusters of potential duplicates." provider="Meta LLaMA (primary)" color="purple" />

      <div className="dijla-card p-5">
        <RouterToggle useRouter={useRouter} setUseRouter={setUseRouter} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 mb-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (required)" className="dijla-input text-sm" />
          <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author" className="dijla-input text-sm" />
          <input value={isbn} onChange={e => setIsbn(e.target.value)} placeholder="ISBN" className="dijla-input text-sm" />
          <input value={year} onChange={e => setYear(e.target.value)} placeholder="Publication year" className="dijla-input text-sm" />
        </div>
        <button onClick={run} disabled={loading || !title.trim()} className="dijla-btn-primary dijla-btn text-xs">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanSearch className="h-3.5 w-3.5" />} Detect Duplicates
        </button>
      </div>

      {result && <ResultCard title="Duplicate Detection Results" data={result} timing={timing} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PHASE 3: AI NATURAL LANGUAGE DISCOVERY (OpenAI primary)
// ═══════════════════════════════════════════════════════════

function Phase3Tab() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [useRouter, setUseRouter] = useState(true);
  const [timing, setTiming] = useState(0);

  const run = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    const t0 = Date.now();
    try {
      const endpoint = useRouter ? "/ai-router/natural-search" : "/ai/natural-search";
      const data = await post(endpoint, { query });
      setResult(data);
      setTiming(Date.now() - t0);
      toast.success(`Phase 3 complete — natural language converted in ${Date.now() - t0}ms`);
    } catch (err: any) {
      toast.error(`Phase 3 error: ${err.message}`);
    } finally { setLoading(false); }
  };

  const examples = [
    "Arabic books about Islamic philosophy published after 2000",
    "Find all works by Naguib Mahfouz on modern Egypt",
    "كتب الشعر العربي المعاصر",
    "Books on quantum computing for beginners",
    "Iraqi literature from the 20th century",
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PhaseHeader phase={3} title="AI Natural Language Discovery" description='Users search using natural language like "Arabic books about Islamic philosophy published after 2000" — AI converts to SPARQL / Elasticsearch DSL.' provider="OpenAI (primary)" color="emerald" />

      <div className="dijla-card p-5">
        <RouterToggle useRouter={useRouter} setUseRouter={setUseRouter} />
        <div className="flex gap-2 mt-4 mb-3">
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && run()}
            placeholder="Ask in natural language (English or Arabic)..." className="dijla-input flex-1 text-sm" />
          <button onClick={run} disabled={loading || !query.trim()} className="dijla-btn-primary dijla-btn text-xs">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />} Search
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {examples.map((ex, i) => (
            <button key={i} onClick={() => setQuery(ex)} className="px-2.5 py-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors font-medium">
              {ex.length > 45 ? ex.slice(0, 45) + "…" : ex}
            </button>
          ))}
        </div>
      </div>

      {result && <ResultCard title="Natural Language → Structured Query" data={result} timing={timing} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PHASE 4: AI SPARQL GENERATOR (OpenAI primary)
// ═══════════════════════════════════════════════════════════

function Phase4Tab() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [useRouter, setUseRouter] = useState(true);
  const [timing, setTiming] = useState(0);

  const run = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    const t0 = Date.now();
    try {
      const endpoint = useRouter ? "/ai-router/sparql-translate" : "/ai/sparql-translate";
      const data = await post(endpoint, { query });
      setResult(data);
      setTiming(Date.now() - t0);
      toast.success(`Phase 4 complete — SPARQL generated in ${Date.now() - t0}ms`);
    } catch (err: any) {
      toast.error(`Phase 4 error: ${err.message}`);
    } finally { setLoading(false); }
  };

  const examples = [
    "Find works by Naguib Mahfouz",
    "All instances published by Oxford University Press after 2010",
    "Works with subject 'Islamic history' and their contributors",
    "Books that have both English and Arabic editions",
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PhaseHeader phase={4} title="AI SPARQL Generator" description={`Input: "Find works by Naguib Mahfouz" → Output: SELECT ?work WHERE { ?work a bf:Work . ?work bf:contribution ?c . ?c bf:agent ?agent . ?agent rdfs:label "Naguib Mahfouz" }`} provider="OpenAI (primary)" color="emerald" />

      <div className="dijla-card p-5">
        <RouterToggle useRouter={useRouter} setUseRouter={setUseRouter} />
        <div className="flex gap-2 mt-4 mb-3">
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && run()}
            placeholder="Describe what you want in natural language..." className="dijla-input flex-1 text-sm" />
          <button onClick={run} disabled={loading || !query.trim()} className="dijla-btn-primary dijla-btn text-xs">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Code className="h-3.5 w-3.5" />} Generate SPARQL
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {examples.map((ex, i) => (
            <button key={i} onClick={() => setQuery(ex)} className="px-2.5 py-1 text-[10px] bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors font-medium">{ex}</button>
          ))}
        </div>
      </div>

      {result && (
        <div className="dijla-card overflow-hidden">
          <div className="bg-teal-50 px-5 py-2.5 border-b border-teal-200 flex items-center justify-between">
            <span className="text-xs font-bold text-teal-700 flex items-center gap-2"><Code className="h-3.5 w-3.5" /> Generated SPARQL</span>
            <span className="text-[10px] text-gray-400">{timing}ms</span>
          </div>
          <pre className="dijla-code p-5 text-xs overflow-auto max-h-72 whitespace-pre-wrap">
            {result.sparql || result.query || JSON.stringify(result, null, 2)}
          </pre>
          <div className="px-5 py-2.5 border-t border-gray-100 flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(result.sparql || result.query || JSON.stringify(result, null, 2)); toast.success("SPARQL copied!"); }} className="dijla-btn text-[10px] px-2.5 py-1">
              <Copy className="h-3 w-3" /> Copy SPARQL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PHASE 5: AI AUTO-FILL (multi-source enrichment)
// ═══════════════════════════════════════════════════════════

function Phase5Tab() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [useRouter, setUseRouter] = useState(true);
  const [timing, setTiming] = useState(0);

  const run = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setLoading(true);
    setResult(null);
    const t0 = Date.now();
    try {
      const endpoint = useRouter ? "/ai-router/autofill" : "/ai/autofill";
      const data = await post(endpoint, { title, author });
      setResult(data);
      setTiming(Date.now() - t0);
      toast.success(`Phase 5 complete — auto-filled in ${Date.now() - t0}ms`);
    } catch (err: any) {
      toast.error(`Phase 5 error: ${err.message}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PhaseHeader phase={5} title="AI Auto-Fill" description="AI automatically fills missing BIBFRAME fields: publisher, place, subjects, contributors, language — using LOC, VIAF, Wikidata, OCLC." provider="Multi-AI (orchestrated)" color="amber" />

      <div className="dijla-card p-5">
        <RouterToggle useRouter={useRouter} setUseRouter={setUseRouter} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 mb-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (required)" className="dijla-input text-sm" />
          <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author (optional)" className="dijla-input text-sm" />
        </div>
        <button onClick={run} disabled={loading || !title.trim()} className="dijla-btn-primary dijla-btn text-xs">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />} Auto-Fill BIBFRAME Fields
        </button>
      </div>

      {result && (
        <div className="dijla-card p-5">
          <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" /> Auto-Filled Fields
            <span className="text-[10px] text-gray-400 font-normal ml-auto">{timing}ms</span>
          </h4>
          {/* Render fields nicely if they look like BIBFRAME */}
          {typeof result === "object" && !Array.isArray(result) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {Object.entries(result).filter(([k]) => !k.startsWith("_")).map(([k, v]) => (
                <div key={k} className="dijla-row px-3 py-2 rounded-lg">
                  <span className="text-[10px] text-teal-600 font-mono font-bold">{k}</span>
                  <p className="text-sm text-gray-800">{typeof v === "object" ? JSON.stringify(v) : String(v)}</p>
                </div>
              ))}
            </div>
          ) : null}
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-400 hover:text-gray-600">Show raw JSON</summary>
            <pre className="dijla-code p-4 text-xs overflow-auto max-h-48 whitespace-pre-wrap mt-2">{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DISCOVERY AI — semantic search + recommendations
// ═══════════════════════════════════════════════════════════

function DiscoveryAITab() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timing, setTiming] = useState(0);

  const run = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    const t0 = Date.now();
    try {
      const data = await post("/ai-router/discovery-enhance", { query });
      setResult(data);
      setTiming(Date.now() - t0);
      toast.success(`Discovery AI complete in ${Date.now() - t0}ms`);
    } catch (err: any) {
      toast.error(`Discovery error: ${err.message}`);
    } finally { setLoading(false); }
  };

  const examples = [
    "Islamic history",
    "تاريخ العراق القديم",
    "Machine learning applications in libraries",
    "Arabic calligraphy and typography",
    "Climate change policy",
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PhaseHeader phase={7} title="Discovery AI" description="AI improves discovery with semantic search, entity linking, and recommendations. Returns works, authors, subjects, and related works." provider="AI Router (best available)" color="blue" />

      <div className="dijla-card p-5">
        <div className="flex gap-2 mb-3">
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && run()}
            placeholder="Search semantically — AI will expand and enrich your query..."
            className="dijla-input flex-1 text-sm" />
          <button onClick={run} disabled={loading || !query.trim()} className="dijla-btn-primary dijla-btn text-xs">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />} Discover
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {examples.map((ex, i) => (
            <button key={i} onClick={() => setQuery(ex)} className="px-2.5 py-1 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-medium">{ex}</button>
          ))}
        </div>
      </div>

      {result && <ResultCard title="Discovery AI Results" data={result} timing={timing} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ENTITY LINKING — Gemini primary
// ═══════════════════════════════════════════════════════════

function EntityLinkingTab() {
  const [entityName, setEntityName] = useState("");
  const [entityType, setEntityType] = useState("person");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timing, setTiming] = useState(0);

  const run = async () => {
    if (!entityName.trim()) return;
    setLoading(true);
    setResult(null);
    const t0 = Date.now();
    try {
      const data = await post("/ai-router/entity-linking", { entityName, entityType });
      setResult(data);
      setTiming(Date.now() - t0);
      toast.success(`Entity linking complete in ${Date.now() - t0}ms`);
    } catch (err: any) {
      toast.error(`Entity linking error: ${err.message}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PhaseHeader phase={6} title="Entity Linking" description="AI links entities to authority records: id.loc.gov, Wikidata, VIAF, FAST, Share-VDE. Converts results into BIBFRAME RDF / JSON-LD / Turtle." provider="Google Gemini (primary)" color="blue" />

      <div className="dijla-card p-5">
        <div className="flex gap-2 mb-3">
          <select value={entityType} onChange={e => setEntityType(e.target.value)} className="dijla-select text-xs w-36">
            <option value="person">Person</option>
            <option value="organization">Organization</option>
            <option value="place">Place</option>
            <option value="subject">Subject</option>
            <option value="work">Work</option>
          </select>
          <input value={entityName} onChange={e => setEntityName(e.target.value)} onKeyDown={e => e.key === "Enter" && run()}
            placeholder="Entity name — e.g. Naguib Mahfouz, Baghdad, Library of Congress..."
            className="dijla-input flex-1 text-sm" />
          <button onClick={run} disabled={loading || !entityName.trim()} className="dijla-btn-primary dijla-btn text-xs">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Waypoints className="h-3.5 w-3.5" />} Link Entity
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Naguib Mahfouz", "بغداد", "Library of Congress", "Islamic art", "University of Baghdad"].map((ex, i) => (
            <button key={i} onClick={() => setEntityName(ex)} className="px-2.5 py-1 text-[10px] bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors font-medium">{ex}</button>
          ))}
        </div>
      </div>

      {result && <ResultCard title="Entity Linking Results" data={result} timing={timing} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// KNOWLEDGE GRAPH — interactive graph builder
// ═══════════════════════════════════════════════════════════

function KnowledgeGraphTab() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [graph, setGraph] = useState<any>(null);
  const [turtleOutput, setTurtleOutput] = useState<string | null>(null);
  const [timing, setTiming] = useState(0);

  const buildGraph = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setGraph(null);
    setTurtleOutput(null);
    const t0 = Date.now();
    try {
      const data = await post("/graph/build", {
        title,
        "@context": { "bf": "http://id.loc.gov/ontologies/bibframe/" },
        "@type": "bf:Work",
        "bf:title": { "bf:mainTitle": title },
      });
      setGraph(data);
      setTiming(Date.now() - t0);

      // Also get Turtle serialization
      try {
        const turtle = await post("/graph/to-turtle", {
          title,
          "@context": { "bf": "http://id.loc.gov/ontologies/bibframe/" },
          "@type": "bf:Work",
          "bf:title": { "bf:mainTitle": title },
        });
        setTurtleOutput(turtle.turtle || turtle.content || JSON.stringify(turtle, null, 2));
      } catch { /* Turtle is optional enhancement */ }

      toast.success(`Knowledge graph built in ${Date.now() - t0}ms`);
    } catch (err: any) {
      toast.error(`Graph error: ${err.message}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PhaseHeader phase={8} title="Knowledge Graph Generation" description="AI constructs a linked data graph: Work ↔ Author ↔ Subject ↔ Publisher. Stored as RDF triples. Exportable as Turtle, JSON-LD, N-Triples." provider="Multi-AI + Graph Builder" color="teal" />

      <div className="dijla-card p-5">
        <div className="flex gap-2 mb-3">
          <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && buildGraph()}
            placeholder="Enter a work title to build its knowledge graph..."
            className="dijla-input flex-1 text-sm" />
          <button onClick={buildGraph} disabled={loading || !title.trim()} className="dijla-btn-primary dijla-btn text-xs">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />} Build Graph
          </button>
        </div>
      </div>

      {graph && (
        <>
          {/* Visual Graph Representation */}
          <div className="dijla-card p-5">
            <h4 className="font-bold text-sm text-gray-800 mb-4 flex items-center gap-2">
              <Share2 className="h-4 w-4 text-teal-600" /> Knowledge Graph Visualization
              <span className="text-[10px] text-gray-400 font-normal ml-auto">{timing}ms</span>
            </h4>
            <GraphVisualization data={graph} />
          </div>

          {/* Turtle Output */}
          {turtleOutput && (
            <div className="dijla-card overflow-hidden">
              <div className="bg-purple-50 px-5 py-2.5 border-b border-purple-200 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700 flex items-center gap-2"><Code className="h-3.5 w-3.5" /> Turtle Serialization</span>
                <button onClick={() => { navigator.clipboard.writeText(turtleOutput); toast.success("Turtle copied!"); }} className="dijla-btn text-[10px] px-2 py-0.5">
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
              <pre className="dijla-code p-5 text-xs overflow-auto max-h-52 whitespace-pre-wrap">{turtleOutput}</pre>
            </div>
          )}

          {/* Raw JSON */}
          <ResultCard title="Graph Raw Data" data={graph} timing={timing} />
        </>
      )}
    </div>
  );
}

function GraphVisualization({ data }: { data: any }) {
  const triples = data.triples || data.graph?.triples || [];
  const nodes = new Map<string, { label: string; type: string }>();
  const edges: { from: string; to: string; label: string }[] = [];

  // Extract nodes and edges from triples
  if (Array.isArray(triples)) {
    triples.forEach((t: any) => {
      const s = t.subject || t.s || "";
      const p = t.predicate || t.p || "";
      const o = t.object || t.o || "";
      if (s) nodes.set(s, { label: s.split("/").pop() || s, type: "subject" });
      if (o && typeof o === "string" && o.startsWith("http")) {
        nodes.set(o, { label: o.split("/").pop() || o, type: "object" });
        edges.push({ from: s, to: o, label: p.split("/").pop() || p });
      }
    });
  }

  // Also parse from stats or other shapes
  const stats = data.stats || data.statistics || {};

  const nodeColors: Record<string, string> = {
    Work: "bg-blue-100 border-blue-400 text-blue-800",
    Instance: "bg-green-100 border-green-400 text-green-800",
    Agent: "bg-amber-100 border-amber-400 text-amber-800",
    Subject: "bg-purple-100 border-purple-400 text-purple-800",
    default: "bg-gray-100 border-gray-400 text-gray-800",
  };

  return (
    <div className="space-y-3">
      {/* Stats */}
      {(stats.totalTriples || stats.nodeCount || data.tripleCount) && (
        <div className="flex gap-3 flex-wrap">
          {data.tripleCount != null && <StatBadge label="Triples" value={data.tripleCount} color="teal" />}
          {stats.totalTriples != null && <StatBadge label="Total Triples" value={stats.totalTriples} color="teal" />}
          {stats.nodeCount != null && <StatBadge label="Nodes" value={stats.nodeCount} color="blue" />}
          {stats.predicateCount != null && <StatBadge label="Predicates" value={stats.predicateCount} color="purple" />}
        </div>
      )}

      {/* Node list */}
      {nodes.size > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Array.from(nodes.entries()).slice(0, 12).map(([uri, node]) => (
            <div key={uri} className={`px-3 py-2 rounded-xl border-2 text-xs font-semibold ${nodeColors.default}`}>
              <div className="truncate">{node.label}</div>
              <div className="text-[9px] font-mono text-gray-400 truncate mt-0.5">{uri.length > 50 ? "…" + uri.slice(-45) : uri}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-6 mb-3">
              <div className="dijla-wemi-work px-4 py-2 rounded-xl text-xs font-bold">bf:Work</div>
              <span className="text-gray-400">↔</span>
              <div className="dijla-wemi-instance px-4 py-2 rounded-xl text-xs font-bold">bf:Agent</div>
              <span className="text-gray-400">↔</span>
              <div className="bg-purple-50 border-2 border-purple-300 text-purple-700 px-4 py-2 rounded-xl text-xs font-bold">bf:Subject</div>
              <span className="text-gray-400">↔</span>
              <div className="dijla-wemi-item px-4 py-2 rounded-xl text-xs font-bold">bf:Publisher</div>
            </div>
            <p className="text-[10px] text-gray-400">Graph structure: BIBFRAME WEMI entity relationships</p>
          </div>
        </div>
      )}

      {/* Edges */}
      {edges.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {edges.slice(0, 10).map((e, i) => (
            <div key={i} className="dijla-row px-3 py-1.5 flex items-center gap-2 text-[10px]">
              <span className="text-blue-600 font-mono truncate flex-1">{e.from.split("/").pop()}</span>
              <span className="text-amber-600 font-semibold">→ {e.label} →</span>
              <span className="text-green-600 font-mono truncate flex-1">{e.to.split("/").pop()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colors: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${colors[color] || colors.teal}`}>
      <span className="text-gray-400 font-normal">{label}:</span> {value}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AUDIT LOG — AI decision tracking
// ═══════════════════════════════════════════════════════════

function AuditTab() {
  const [entries, setEntries] = useState<any[]>([]);
  const [routingLog, setRoutingLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [audit, routing] = await Promise.all([
        get("/ai/audit-log?limit=50"),
        get("/ai-router/routing-log?limit=50"),
      ]);
      setEntries(audit.entries || []);
      setRoutingLog(routing.log || []);
      toast.success(`Loaded ${(audit.entries || []).length} audit + ${(routing.log || []).length} routing entries`);
    } catch (err: any) {
      toast.error(`Audit load error: ${err.message}`);
    } finally { setLoading(false); }
  };

  const approveEntry = async (id: string, approved: boolean) => {
    try {
      await post(`/ai/audit/${id}/approve`, { approved });
      toast.success(approved ? "AI suggestion approved" : "AI suggestion rejected");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-teal-600" /> AI Audit & Governance Log</h3>
          <p className="text-xs text-gray-500">Every AI decision is logged. Approve or reject AI suggestions for governance.</p>
        </div>
        <button onClick={load} disabled={loading} className="dijla-btn text-xs">
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Reload
        </button>
      </div>

      {/* AI Audit Entries */}
      <div className="dijla-card p-4">
        <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600" /> AI Suggestion Audit ({entries.length})
        </h4>
        {entries.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No audit entries yet. Use any AI phase to generate suggestions.</p>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {entries.map((e, i) => (
              <div key={e.id || i} className="dijla-row px-4 py-2.5 flex items-center gap-3 text-xs">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{e.action || e.task || "AI Suggestion"}</p>
                  <p className="text-[10px] text-gray-400 truncate">{e.input ? JSON.stringify(e.input).slice(0, 100) : "—"}</p>
                </div>
                <span className="dijla-badge-info">{e.provider || "openai"}</span>
                {e.approved === true ? (
                  <span className="dijla-badge-success">Approved</span>
                ) : e.approved === false ? (
                  <span className="dijla-badge-danger">Rejected</span>
                ) : (
                  <div className="flex gap-1">
                    <button onClick={() => approveEntry(e.id, true)} className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[10px] font-bold hover:bg-green-100">Approve</button>
                    <button onClick={() => approveEntry(e.id, false)} className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-bold hover:bg-red-100">Reject</button>
                  </div>
                )}
                <span className="text-[9px] text-gray-400">{e.timestamp ? new Date(e.timestamp).toLocaleString() : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Routing Decisions Log */}
      <div className="dijla-card p-4">
        <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
          <Workflow className="h-4 w-4 text-purple-600" /> AI Routing Decisions ({routingLog.length})
        </h4>
        {routingLog.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No routing decisions yet.</p>
        ) : (
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {routingLog.map((e, i) => {
              const provColors: Record<string, string> = { openai: "bg-emerald-50 text-emerald-700 border-emerald-200", gemini: "bg-blue-50 text-blue-700 border-blue-200", llama: "bg-purple-50 text-purple-700 border-purple-200" };
              return (
                <div key={i} className="dijla-row px-3 py-2 flex items-center gap-3 text-xs">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${provColors[e.provider] || "bg-gray-50 text-gray-700 border-gray-200"}`}>{e.provider || "—"}</span>
                  <span className="flex-1 text-gray-700 truncate">{e.task || e.action || "—"}</span>
                  {e.fallback && <span className="dijla-badge-warn">Fallback</span>}
                  {e.success !== undefined && (e.success ? <CircleCheck className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-red-500" />)}
                  <span className="text-gray-400">{e.latencyMs ? `${e.latencyMs}ms` : ""}</span>
                  <span className="text-[9px] text-gray-400">{e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : ""}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════

function PhaseHeader({ phase, title, description, provider, color }: { phase: number; title: string; description: string; provider: string; color: string }) {
  const bgColors: Record<string, string> = {
    emerald: "from-emerald-50 to-green-50 border-emerald-200",
    purple: "from-purple-50 to-fuchsia-50 border-purple-200",
    blue: "from-blue-50 to-indigo-50 border-blue-200",
    amber: "from-amber-50 to-orange-50 border-amber-200",
    teal: "from-teal-50 to-cyan-50 border-teal-200",
  };
  const textColors: Record<string, string> = {
    emerald: "text-emerald-800",
    purple: "text-purple-800",
    blue: "text-blue-800",
    amber: "text-amber-800",
    teal: "text-teal-800",
  };
  return (
    <div className={`bg-gradient-to-r ${bgColors[color] || bgColors.teal} border rounded-2xl p-5`}>
      <div className="flex items-center gap-3 mb-1">
        <span className={`text-2xl font-black ${textColors[color] || "text-gray-800"}`}>{phase}</span>
        <h3 className={`text-lg font-bold ${textColors[color] || "text-gray-800"}`}>{title}</h3>
      </div>
      <p className="text-xs text-gray-600 mb-2">{description}</p>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400">Primary provider:</span>
        <span className="dijla-badge-info">{provider}</span>
      </div>
    </div>
  );
}

function RouterToggle({ useRouter, setUseRouter }: { useRouter: boolean; setUseRouter: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Route via:</span>
      <button onClick={() => setUseRouter(false)} className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${!useRouter ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-white text-gray-400 border-gray-200"}`}>
        OpenAI Direct
      </button>
      <button onClick={() => setUseRouter(true)} className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${useRouter ? "bg-teal-50 text-teal-700 border-teal-300" : "bg-white text-gray-400 border-gray-200"}`}>
        AI Router (multi-provider)
      </button>
    </div>
  );
}

function ResultCard({ title, data, timing }: { title: string; data: any; timing: number }) {
  const json = JSON.stringify(data, null, 2);
  return (
    <div className="dijla-card overflow-hidden">
      <div className="bg-teal-50 px-5 py-2.5 border-b border-teal-200 flex items-center justify-between">
        <span className="text-xs font-bold text-teal-700 flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5" /> {title}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">{timing}ms</span>
          <button onClick={() => { navigator.clipboard.writeText(json); toast.success("Copied!"); }} className="dijla-btn text-[10px] px-2 py-0.5">
            <Copy className="h-3 w-3" /> Copy
          </button>
        </div>
      </div>
      <pre className="dijla-code p-5 text-xs overflow-auto max-h-72 whitespace-pre-wrap">{json}</pre>
    </div>
  );
}
