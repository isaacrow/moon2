/**
 * MOON LD4 Platform - Linked Data for Production Integration Dashboard
 * 
 * DIJLA RIVER THEME - warm sands, Tigris teal, Mesopotamian gold
 * 
 * Integrates with LD4 ecosystem:
 *   - Sinopia Resource Templates
 *   - LD4P Profile Registry
 *   - Authority Reconciliation (LOC, VIAF, Wikidata, FAST, Share-VDE)
 *   - Federated Discovery (Blacklight/VuFind-inspired)
 *   - Content Negotiation
 *   - Graph Explorer
 *   - Linked Data APIs
 * 
 * Designed and developed by isaac faleh
 */

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";
import {
  ChevronLeft, Globe, Search, Database, Network, BookOpen, Shield,
  Activity, Layers, Zap, RefreshCw, CheckCircle2, AlertCircle,
  Clock, ArrowRight, Server, Code, FileText, Eye, Sparkles,
  ChevronDown, ChevronRight, Loader2, Send, Download, Copy,
  Link, ExternalLink, BookMarked, Library, Filter, X, Plus,
  GitBranch, Share2, Wifi, WifiOff, Tag, Users, MapPin
} from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import moonLogo from "figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png";
import "../../styles/dijla-theme.css";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c`;

// ─── Types ───────────────────────────────────────────────────────

interface LD4Service {
  service: string;
  url: string;
  protocol: string;
  status: "online" | "offline" | "unknown";
  latencyMs: number;
}

interface LD4Profile {
  id: string;
  name: string;
  description: string;
  author: string;
  date: string;
  resourceTemplates: string[];
  source: string;
  importedAt?: string;
}

interface AuthorityMatch {
  label: string;
  uri: string;
  source: string;
  type: string;
  description?: string;
  score: number;
}

interface DiscoverySourceResult {
  source: string;
  protocol: string;
  results: any[];
  count: number;
  latencyMs: number;
}

type LD4Tab = "overview" | "discovery" | "reconciliation" | "profiles" | "sinopia" | "linked-data-api" | "graph-explorer" | "interoperability";

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

// ─── Source Colors ───────────────────────────────────────────────

const SOURCE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  LOC: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "Library of Congress": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  VIAF: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Wikidata: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  FAST: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  ShareVDE: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  "Share-VDE": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  "Local MOON": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
};

function sourceStyle(source: string) {
  return SOURCE_STYLES[source] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

interface LD4PlatformProps {
  onBack?: () => void;
}

export default function LD4Platform({ onBack }: LD4PlatformProps) {
  const [activeTab, setActiveTab] = useState<LD4Tab>("overview");
  const [services, setServices] = useState<LD4Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [profiles, setProfiles] = useState<LD4Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);

  // Discovery
  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const [discoveryResults, setDiscoveryResults] = useState<DiscoverySourceResult[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryFacets, setDiscoveryFacets] = useState<string[]>(["local", "loc", "viaf", "wikidata", "fast"]);

  // Reconciliation
  const [reconQuery, setReconQuery] = useState("");
  const [reconType, setReconType] = useState("");
  const [reconSources, setReconSources] = useState<string[]>(["LOC", "VIAF", "Wikidata", "FAST"]);
  const [reconResults, setReconResults] = useState<AuthorityMatch[]>([]);
  const [reconLoading, setReconLoading] = useState(false);
  const [reconBestMatch, setReconBestMatch] = useState<AuthorityMatch | null>(null);

  // Load services
  const loadServices = useCallback(async () => {
    setServicesLoading(true);
    try {
      const data = await apiCall("/ld4/status");
      setServices(data.services || []);
    } catch (err: any) {
      console.error("Failed to load LD4 services:", err);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  // Load profiles
  const loadProfiles = useCallback(async () => {
    setProfilesLoading(true);
    try {
      const data = await apiCall("/ld4/profiles");
      setProfiles(data.profiles || []);
    } catch (err: any) {
      console.error("Failed to load profiles:", err);
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  useEffect(() => { loadServices(); loadProfiles(); }, [loadServices, loadProfiles]);

  // Federated discovery
  const handleDiscovery = async () => {
    if (!discoveryQuery.trim()) return;
    setDiscoveryLoading(true);
    setDiscoveryResults([]);
    try {
      const data = await apiCall(`/ld4/discover?q=${encodeURIComponent(discoveryQuery)}&sources=${discoveryFacets.join(",")}`);
      setDiscoveryResults(data.results || []);
      toast.success(`Found ${data.totalCount} results across ${data.results?.length || 0} sources`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDiscoveryLoading(false);
    }
  };

  // Reconciliation
  const handleReconcile = async () => {
    if (!reconQuery.trim()) return;
    setReconLoading(true);
    setReconResults([]);
    setReconBestMatch(null);
    try {
      const params = new URLSearchParams({ q: reconQuery });
      if (reconType) params.set("type", reconType);
      if (reconSources.length > 0) params.set("sources", reconSources.join(","));
      const data = await apiCall(`/ld4/reconcile?${params}`);
      setReconResults(data.matches || []);
      setReconBestMatch(data.bestMatch || null);
      toast.success(`Reconciled across ${data.sources?.length || 0} sources: ${data.matches?.length || 0} matches`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setReconLoading(false);
    }
  };

  // Import profile
  const handleImportProfile = async (profileId: string) => {
    try {
      await apiCall("/ld4/profiles/import", { method: "POST", body: JSON.stringify({ profileId }) });
      toast.success("Profile imported successfully");
      loadProfiles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const onlineCount = services.filter(s => s.status === "online").length;

  // ─── RENDER ────────────────────────────────────────────────────

  return (
    <div className="dijla-bg h-screen flex flex-col">
      <Toaster position="top-right" />

      {/* NAVBAR */}
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
                <h1 className="text-2xl font-bold text-white tracking-tight">MOON LD4</h1>
                <p className="text-xs text-amber-300/80 font-medium tracking-wide">Linked Data for Production Integration Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-white/70 text-xs">
                <Wifi className="h-3.5 w-3.5 text-green-400" />
                <span>{onlineCount}/{services.length || 4} Services</span>
              </div>
              <button onClick={() => { loadServices(); loadProfiles(); }} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-xs font-medium flex items-center gap-1.5 transition-all border border-white/10">
                <RefreshCw className={`h-3.5 w-3.5 ${servicesLoading ? "animate-spin" : ""}`} /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dijla-gold-line" />

      {/* TAB BAR */}
      <div className="dijla-tabbar">
        <div className="px-6 py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {([
              { id: "overview", label: "Overview", icon: <Layers className="h-3.5 w-3.5" /> },
              { id: "discovery", label: "Federated Discovery", icon: <Search className="h-3.5 w-3.5" /> },
              { id: "reconciliation", label: "Authority Reconciliation", icon: <GitBranch className="h-3.5 w-3.5" /> },
              { id: "profiles", label: "LD4P Profiles", icon: <BookMarked className="h-3.5 w-3.5" /> },
              { id: "sinopia", label: "Sinopia Templates", icon: <FileText className="h-3.5 w-3.5" /> },
              { id: "linked-data-api", label: "Linked Data APIs", icon: <Code className="h-3.5 w-3.5" /> },
              { id: "graph-explorer", label: "Graph Explorer", icon: <Network className="h-3.5 w-3.5" /> },
              { id: "interoperability", label: "Interoperability", icon: <Share2 className="h-3.5 w-3.5" /> },
            ] as { id: LD4Tab; label: string; icon: React.ReactNode }[]).map(tab => (
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

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto p-6 dijla-content">

        {/* ═══ OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="LD4 Services" value={`${onlineCount}/${services.length || 4}`} subtitle="Connected" icon={<Globe className="h-6 w-6" />} accent="text-blue-600" bg="bg-blue-50" />
              <StatCard title="Profiles" value={`${profiles.length}`} subtitle="LD4P Registry" icon={<BookMarked className="h-6 w-6" />} accent="text-purple-600" bg="bg-purple-50" />
              <StatCard title="Authorities" value="5" subtitle="Reconciliation Sources" icon={<GitBranch className="h-6 w-6" />} accent="text-teal-600" bg="bg-teal-50" />
              <StatCard title="Formats" value="4" subtitle="Content Negotiation" icon={<Code className="h-6 w-6" />} accent="text-amber-600" bg="bg-amber-50" />
            </div>

            {/* Service Health */}
            <div className="dijla-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-teal-600" /> LD4 Ecosystem Service Health
                </h3>
                <button onClick={loadServices} className="dijla-btn text-xs" disabled={servicesLoading}>
                  <RefreshCw className={`h-3 w-3 ${servicesLoading ? "animate-spin" : ""}`} /> Check
                </button>
              </div>
              {services.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">Click "Check" to probe LD4 services...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map((svc, idx) => (
                    <div key={idx} className={`dijla-row flex items-center gap-3 px-4 py-3 ${svc.status === "online" ? "dijla-row-success" : "dijla-row-danger"}`}>
                      {svc.status === "online" ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-500" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{svc.service}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{svc.protocol}</p>
                      </div>
                      <span className={svc.status === "online" ? "dijla-badge-success" : "dijla-badge-danger"}>{svc.status.toUpperCase()}</span>
                      <span className="text-xs text-gray-400">{svc.latencyMs}ms</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LD4 Ecosystem Map */}
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Network className="h-5 w-5 text-purple-600" /> LD4 Ecosystem Integration Map
              </h3>
              <div className="flex flex-col items-center gap-3">
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-300 rounded-xl px-8 py-4 text-center">
                  <p className="font-bold text-teal-800 text-lg">MOON BIBFRAME Platform</p>
                  <p className="text-xs text-teal-600">AI-Assisted Cataloging + Linked Data Engine</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-px h-6 bg-teal-300" />
                  <span className="text-[10px] text-gray-400 font-mono">LD4 Integration Layer</span>
                  <div className="w-px h-6 bg-teal-300" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full max-w-4xl">
                  {[
                    { name: "LOC", desc: "LCNAF, LCSH, BIBFRAME", color: "border-blue-300 bg-blue-50" },
                    { name: "VIAF", desc: "Virtual Authority File", color: "border-purple-300 bg-purple-50" },
                    { name: "Wikidata", desc: "Knowledge Graph", color: "border-green-300 bg-green-50" },
                    { name: "Sinopia", desc: "LD Editor & Templates", color: "border-amber-300 bg-amber-50" },
                    { name: "Share-VDE", desc: "Entity Clusters", color: "border-teal-300 bg-teal-50" },
                  ].map(node => (
                    <div key={node.name} className={`border-2 ${node.color} rounded-xl p-3 text-center`}>
                      <p className="font-bold text-sm text-gray-800">{node.name}</p>
                      <p className="text-[10px] text-gray-500">{node.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Access */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Federated Discovery", icon: <Search className="h-8 w-8" />, tab: "discovery" as LD4Tab, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Reconciliation", icon: <GitBranch className="h-8 w-8" />, tab: "reconciliation" as LD4Tab, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "LD4P Profiles", icon: <BookMarked className="h-8 w-8" />, tab: "profiles" as LD4Tab, color: "text-teal-600", bg: "bg-teal-50" },
                { label: "Graph Explorer", icon: <Network className="h-8 w-8" />, tab: "graph-explorer" as LD4Tab, color: "text-amber-600", bg: "bg-amber-50" },
              ].map(item => (
                <button key={item.label} onClick={() => setActiveTab(item.tab)} className="dijla-card p-6 flex flex-col items-center gap-3 hover:shadow-lg transition-all cursor-pointer group">
                  <div className={`${item.bg} p-3 rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</div>
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ FEDERATED DISCOVERY ═══ */}
        {activeTab === "discovery" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" /> Federated Linked Data Discovery
              </h3>
              <p className="text-sm text-gray-500 mb-4">Search across local catalog, Library of Congress, VIAF, Wikidata, FAST, and Share-VDE simultaneously.</p>

              {/* Source Facets */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { id: "local", label: "Local Catalog" },
                  { id: "loc", label: "LOC" },
                  { id: "viaf", label: "VIAF" },
                  { id: "wikidata", label: "Wikidata" },
                  { id: "fast", label: "FAST" },
                  { id: "sharevde", label: "Share-VDE" },
                ].map(src => (
                  <button
                    key={src.id}
                    onClick={() => setDiscoveryFacets(prev =>
                      prev.includes(src.id) ? prev.filter(s => s !== src.id) : [...prev, src.id]
                    )}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      discoveryFacets.includes(src.id)
                        ? "bg-teal-50 text-teal-700 border-teal-300"
                        : "bg-gray-50 text-gray-400 border-gray-200"
                    }`}
                  >
                    {discoveryFacets.includes(src.id) ? <CheckCircle2 className="h-3 w-3 inline mr-1" /> : <Plus className="h-3 w-3 inline mr-1" />}
                    {src.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="flex gap-3">
                <input
                  type="text" value={discoveryQuery} onChange={e => setDiscoveryQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleDiscovery()}
                  placeholder="Search entities, authorities, works, subjects..."
                  className="dijla-input flex-1"
                />
                <button onClick={handleDiscovery} disabled={discoveryLoading || !discoveryQuery.trim()} className="dijla-btn-primary dijla-btn">
                  {discoveryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Discover
                </button>
              </div>
            </div>

            {/* Results by Source */}
            {discoveryResults.length > 0 && (
              <div className="space-y-4">
                {discoveryResults.filter(sr => sr.count > 0).map((sr, idx) => {
                  const style = sourceStyle(sr.source);
                  return (
                    <div key={idx} className="dijla-card overflow-hidden">
                      <div className={`${style.bg} px-6 py-3 border-b ${style.border} flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <Globe className={`h-4 w-4 ${style.text}`} />
                          <span className={`font-bold text-sm ${style.text}`}>{sr.source}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{sr.protocol}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="dijla-badge-info">{sr.count} results</span>
                          <span className="text-xs text-gray-400">{sr.latencyMs}ms</span>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {sr.results.slice(0, 8).map((r: any, rIdx: number) => (
                          <div key={rIdx} className="px-6 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{r.label || r.title || r.auth || JSON.stringify(r).slice(0, 80)}</p>
                              {r.description && <p className="text-xs text-gray-500 truncate">{r.description}</p>}
                              {r.uri && <p className="text-[10px] text-gray-400 font-mono truncate">{r.uri}</p>}
                            </div>
                            {r.score !== undefined && (
                              <span className={`text-xs font-semibold ${r.score >= 0.8 ? "text-green-600" : r.score >= 0.5 ? "text-amber-600" : "text-gray-400"}`}>
                                {Math.round(r.score * 100)}%
                              </span>
                            )}
                            {r.type && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded font-medium">{r.type}</span>}
                            {r.uri && (
                              <a href={r.uri} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {discoveryResults.filter(sr => sr.count === 0).length > 0 && (
                  <div className="dijla-row px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5" />
                    No results from: {discoveryResults.filter(sr => sr.count === 0).map(sr => sr.source).join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ AUTHORITY RECONCILIATION ═══ */}
        {activeTab === "reconciliation" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-purple-600" /> Authority Reconciliation
              </h3>
              <p className="text-sm text-gray-500 mb-4">Reconcile entity names against LOC, VIAF, Wikidata, FAST, and Share-VDE authority files simultaneously.</p>

              {/* Source Selection */}
              <div className="flex flex-wrap gap-2 mb-4">
                {["LOC", "VIAF", "Wikidata", "FAST", "ShareVDE"].map(src => (
                  <button
                    key={src}
                    onClick={() => setReconSources(prev =>
                      prev.includes(src) ? prev.filter(s => s !== src) : [...prev, src]
                    )}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      reconSources.includes(src)
                        ? `${sourceStyle(src).bg} ${sourceStyle(src).text} ${sourceStyle(src).border}`
                        : "bg-gray-50 text-gray-400 border-gray-200"
                    }`}
                  >
                    {reconSources.includes(src) ? <CheckCircle2 className="h-3 w-3 inline mr-1" /> : <Plus className="h-3 w-3 inline mr-1" />}
                    {src}
                  </button>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <select value={reconType} onChange={e => setReconType(e.target.value)} className="dijla-select">
                  <option value="">All Types</option>
                  <option value="names">Personal/Corporate Names</option>
                  <option value="subjects">Subjects (LCSH)</option>
                  <option value="genreForms">Genre/Form (LCGFT)</option>
                </select>
                <input
                  type="text" value={reconQuery} onChange={e => setReconQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleReconcile()}
                  placeholder="Enter entity name to reconcile..."
                  className="dijla-input flex-1"
                />
                <button onClick={handleReconcile} disabled={reconLoading || !reconQuery.trim()} className="dijla-btn-primary dijla-btn">
                  {reconLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitBranch className="h-4 w-4" />} Reconcile
                </button>
              </div>
            </div>

            {/* Best Match */}
            {reconBestMatch && (
              <div className="dijla-card p-6 border-l-4 border-l-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <h4 className="font-bold text-green-800">Best Match</h4>
                  <span className="text-xs text-green-600 font-semibold">{Math.round(reconBestMatch.score * 100)}% confidence</span>
                </div>
                <p className="text-lg font-semibold text-gray-800">{reconBestMatch.label}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sourceStyle(reconBestMatch.source).bg} ${sourceStyle(reconBestMatch.source).text} ${sourceStyle(reconBestMatch.source).border}`}>
                    {reconBestMatch.source}
                  </span>
                  {reconBestMatch.type && <span className="text-xs text-gray-500">{reconBestMatch.type}</span>}
                  {reconBestMatch.uri && (
                    <a href={reconBestMatch.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline font-mono flex items-center gap-1">
                      {reconBestMatch.uri} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* All Matches */}
            {reconResults.length > 0 && (
              <div className="dijla-card p-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" /> All Matches ({reconResults.length})
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {reconResults.map((m, idx) => {
                    const style = sourceStyle(m.source);
                    return (
                      <div key={idx} className="dijla-row flex items-center gap-3 px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}>{m.source}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{m.label}</p>
                          {m.description && <p className="text-[10px] text-gray-500 truncate">{m.description}</p>}
                        </div>
                        <span className={`text-xs font-semibold ${m.score >= 0.8 ? "text-green-600" : m.score >= 0.5 ? "text-amber-600" : "text-gray-400"}`}>
                          {Math.round(m.score * 100)}%
                        </span>
                        {m.type && <span className="text-[10px] text-gray-400">{m.type}</span>}
                        {m.uri && (
                          <a href={m.uri} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ LD4P PROFILES ═══ */}
        {activeTab === "profiles" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="dijla-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-purple-600" /> LD4P Profile Registry
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Browse and import BIBFRAME cataloging profiles from the LD4 community.</p>
                </div>
                <button onClick={loadProfiles} className="dijla-btn text-xs" disabled={profilesLoading}>
                  <RefreshCw className={`h-3 w-3 ${profilesLoading ? "animate-spin" : ""}`} /> Reload
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.map(profile => (
                  <div key={profile.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:border-teal-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">{profile.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{profile.description}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        profile.source === "ld4p" ? "bg-purple-50 text-purple-700 border-purple-200" :
                        profile.source === "sinopia" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-gray-50 text-gray-600 border-gray-200"
                      }`}>{profile.source}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{profile.author}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{profile.date}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {profile.resourceTemplates.slice(0, 3).map(rt => (
                        <span key={rt} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-mono border border-teal-200 rounded">{rt}</span>
                      ))}
                      {profile.resourceTemplates.length > 3 && <span className="text-[10px] text-gray-400">+{profile.resourceTemplates.length - 3} more</span>}
                    </div>
                    <button onClick={() => handleImportProfile(profile.id)} className="dijla-btn text-xs w-full justify-center" disabled={!!profile.importedAt}>
                      {profile.importedAt ? <><CheckCircle2 className="h-3 w-3 text-green-600" /> Imported</> : <><Download className="h-3 w-3" /> Import to MOON</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ SINOPIA TEMPLATES ═══ */}
        {activeTab === "sinopia" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" /> Sinopia Resource Templates
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Import Sinopia resource templates for template-based BIBFRAME cataloging.
                MOON converts Sinopia profiles into native editor forms.
              </p>
              <div className="dijla-card-accent p-4 mb-4">
                <h4 className="font-semibold text-gray-800 text-sm mb-2">How It Works</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { step: "1", title: "Import Template", desc: "Paste a Sinopia resource template JSON or import from the registry" },
                    { step: "2", title: "Convert to MOON", desc: "Template is mapped to MOON BIBFRAME editor form fields" },
                    { step: "3", title: "Catalog", desc: "Use the converted template for cataloging in the MOON editor" },
                  ].map(s => (
                    <div key={s.step} className="flex items-start gap-3">
                      <span className="bg-teal-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">{s.step}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                        <p className="text-xs text-gray-500">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sinopia Template Examples */}
              <h4 className="font-semibold text-gray-800 mb-3">Example Sinopia Templates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: "sinopia:bf2:WorkMonograph", label: "BIBFRAME Work (Monograph)", type: "bf:Work", props: 12 },
                  { id: "sinopia:bf2:InstancePrint", label: "BIBFRAME Instance (Print)", type: "bf:Instance", props: 15 },
                  { id: "sinopia:bf2:ItemPhysical", label: "BIBFRAME Item (Physical)", type: "bf:Item", props: 6 },
                  { id: "sinopia:bf2:PersonAgent", label: "BIBFRAME Agent (Person)", type: "bf:Agent", props: 8 },
                ].map(tmpl => (
                  <div key={tmpl.id} className="dijla-row flex items-center gap-3 px-4 py-3">
                    <FileText className="h-4 w-4 text-amber-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{tmpl.label}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{tmpl.id}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-200 rounded">{tmpl.type}</span>
                    <span className="text-xs text-gray-400">{tmpl.props} fields</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Compatibility */}
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Share2 className="h-5 w-5 text-teal-600" /> Template Compatibility Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 pr-4 font-semibold">Feature</th>
                      <th className="pb-3 pr-4 font-semibold text-center">Sinopia</th>
                      <th className="pb-3 pr-4 font-semibold text-center">MOON</th>
                      <th className="pb-3 font-semibold text-center">Compatible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "BIBFRAME Resource Templates", sinopia: true, moon: true },
                      { feature: "Literal Property Templates", sinopia: true, moon: true },
                      { feature: "URI/Resource References", sinopia: true, moon: true },
                      { feature: "Authority Lookups", sinopia: true, moon: true },
                      { feature: "Value Constraints", sinopia: true, moon: true },
                      { feature: "Nested Templates", sinopia: true, moon: true },
                      { feature: "JSON-LD Export", sinopia: true, moon: true },
                      { feature: "RDF Validation (SHACL)", sinopia: false, moon: true },
                      { feature: "AI Suggestions", sinopia: false, moon: true },
                      { feature: "Arabic/RTL Support", sinopia: false, moon: true },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2.5 pr-4 font-medium text-gray-800">{row.feature}</td>
                        <td className="py-2.5 pr-4 text-center">{row.sinopia ? <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-gray-300 mx-auto" />}</td>
                        <td className="py-2.5 pr-4 text-center">{row.moon ? <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-gray-300 mx-auto" />}</td>
                        <td className="py-2.5 text-center">{row.sinopia && row.moon ? <span className="dijla-badge-success">Yes</span> : <span className="dijla-badge-info">MOON+</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ LINKED DATA APIs ═══ */}
        {activeTab === "linked-data-api" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Code className="h-5 w-5 text-amber-600" /> Linked Data REST APIs
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                MOON exposes dereferenceable Linked Data URIs with full content negotiation.
              </p>
            </div>

            {/* Content Negotiation */}
            <div className="dijla-card p-6">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-teal-600" /> Content Negotiation
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 pr-4 font-semibold">Accept Header</th>
                      <th className="pb-3 pr-4 font-semibold">Response Format</th>
                      <th className="pb-3 font-semibold">Content-Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { accept: "application/ld+json", format: "JSON-LD", contentType: "application/ld+json" },
                      { accept: "text/turtle", format: "Turtle (TTL)", contentType: "text/turtle" },
                      { accept: "application/rdf+xml", format: "RDF/XML", contentType: "application/rdf+xml" },
                      { accept: "application/n-triples", format: "N-Triples", contentType: "application/n-triples" },
                      { accept: "text/html", format: "Human-readable HTML", contentType: "text/html" },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2.5 pr-4"><code className="text-xs text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded">{row.accept}</code></td>
                        <td className="py-2.5 pr-4 text-gray-800 font-medium">{row.format}</td>
                        <td className="py-2.5"><code className="text-xs text-teal-700 font-mono">{row.contentType}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* API Endpoints */}
            <div className="dijla-card p-6">
              <h4 className="font-bold text-gray-800 mb-3">LD4 API Endpoints</h4>
              <div className="space-y-1.5">
                {[
                  { method: "GET", path: "/ld4/status", desc: "LD4 ecosystem service health" },
                  { method: "GET", path: "/ld4/profiles", desc: "List LD4P profiles" },
                  { method: "POST", path: "/ld4/profiles/import", desc: "Import LD4P profile" },
                  { method: "GET", path: "/ld4/sinopia/templates", desc: "List imported Sinopia templates" },
                  { method: "POST", path: "/ld4/sinopia/import", desc: "Import Sinopia resource template" },
                  { method: "GET", path: "/ld4/reconcile?q=&type=&sources=", desc: "Federated authority reconciliation" },
                  { method: "GET", path: "/ld4/authority/search?q=&source=&type=", desc: "Single-source authority search" },
                  { method: "GET", path: "/ld4/authority/lookup?uri=", desc: "Dereference authority URI" },
                  { method: "GET", path: "/ld4/discover?q=&sources=", desc: "Federated Linked Data discovery" },
                  { method: "GET", path: "/ld4/resource/:type/:id", desc: "Content-negotiated Linked Data resource" },
                ].map((ep, idx) => (
                  <div key={idx} className="dijla-row flex items-center gap-3 px-4 py-2 text-xs">
                    <span className={`px-2 py-0.5 rounded font-bold ${ep.method === "GET" ? "bg-green-50 text-green-700 border border-green-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>{ep.method}</span>
                    <code className="text-amber-700 font-mono font-medium flex-1">{ep.path}</code>
                    <span className="text-gray-500">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* URI Strategy */}
            <div className="dijla-card p-6">
              <h4 className="font-bold text-gray-800 mb-3">URI Strategy (Cool URIs)</h4>
              <div className="space-y-1.5">
                {[
                  { pattern: "https://moon-library.org/resource/work/{id}", example: "bf:Work entity" },
                  { pattern: "https://moon-library.org/resource/instance/{id}", example: "bf:Instance entity" },
                  { pattern: "https://moon-library.org/resource/item/{id}", example: "bf:Item entity" },
                  { pattern: "https://moon-library.org/resource/agent/{id}", example: "bf:Agent entity" },
                  { pattern: "https://moon-library.org/resource/subject/{id}", example: "bf:Subject entity" },
                ].map((uri, idx) => (
                  <div key={idx} className="dijla-row flex items-center gap-4 px-4 py-2.5 text-xs">
                    <Link className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                    <code className="text-teal-700 font-mono font-bold flex-1">{uri.pattern}</code>
                    <span className="text-gray-500">{uri.example}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Content negotiation via Accept header. Supports JSON-LD, Turtle, RDF/XML, N-Triples, HTML.</p>
            </div>
          </div>
        )}

        {/* ═══ GRAPH EXPLORER ═══ */}
        {activeTab === "graph-explorer" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Network className="h-5 w-5 text-teal-600" /> BIBFRAME Knowledge Graph
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Visual representation of the BIBFRAME entity relationship model used in MOON.
              </p>

              {/* Visual Graph */}
              <div className="flex flex-col items-center gap-4">
                {/* Work Level */}
                <div className="dijla-wemi-work px-8 py-4 rounded-xl text-center relative">
                  <p className="font-bold text-lg">bf:Work</p>
                  <p className="text-xs opacity-70">Intellectual/Artistic Creation</p>
                </div>

                {/* Connections from Work */}
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-5 bg-blue-300" />
                    <span className="text-[9px] text-gray-400 font-mono">bf:contribution</span>
                    <div className="bg-cyan-50 border-2 border-cyan-300 text-cyan-800 px-4 py-2 rounded-lg text-center">
                      <p className="font-bold text-sm">bf:Agent</p>
                      <p className="text-[10px] opacity-70">Person/Org</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-5 bg-blue-300" />
                    <span className="text-[9px] text-gray-400 font-mono">bf:hasInstance</span>
                    <div className="dijla-wemi-instance px-6 py-3 rounded-lg text-center">
                      <p className="font-bold text-sm">bf:Instance</p>
                      <p className="text-[10px] opacity-70">Publication</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-5 bg-blue-300" />
                    <span className="text-[9px] text-gray-400 font-mono">bf:subject</span>
                    <div className="bg-purple-50 border-2 border-purple-300 text-purple-800 px-4 py-2 rounded-lg text-center">
                      <p className="font-bold text-sm">bf:Subject</p>
                      <p className="text-[10px] opacity-70">Topic/LCSH</p>
                    </div>
                  </div>
                </div>

                {/* Instance to Item */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-px h-5 bg-green-300" />
                  <span className="text-[9px] text-gray-400 font-mono">bf:hasItem</span>
                  <div className="dijla-wemi-item px-6 py-3 rounded-lg text-center">
                    <p className="font-bold text-sm">bf:Item</p>
                    <p className="text-[10px] opacity-70">Held Copy</p>
                  </div>
                </div>

                {/* Supporting entities */}
                <div className="flex items-center gap-6 mt-2">
                  {[
                    { cls: "bf:Place", color: "border-pink-300 bg-pink-50 text-pink-800" },
                    { cls: "bf:Event", color: "border-yellow-300 bg-yellow-50 text-yellow-800" },
                    { cls: "madsrdf:Authority", color: "border-indigo-300 bg-indigo-50 text-indigo-800" },
                  ].map(e => (
                    <div key={e.cls} className={`border-2 ${e.color} px-4 py-2 rounded-lg text-center`}>
                      <p className="font-bold text-xs">{e.cls}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Triple Store Info */}
            <div className="dijla-card p-6">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" /> Graph Storage Architecture
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "Primary Store", desc: "Supabase PostgreSQL + KV Store", detail: "JSON-LD documents with full-text search", icon: <Database className="h-6 w-6 text-teal-600" /> },
                  { title: "Triple Index", desc: "In-memory Triple Store", detail: "SPO index for SPARQL query resolution", icon: <Network className="h-6 w-6 text-purple-600" /> },
                  { title: "Federation", desc: "LD4 External Sources", detail: "LOC, VIAF, Wikidata, FAST via REST/SPARQL", icon: <Globe className="h-6 w-6 text-blue-600" /> },
                ].map(item => (
                  <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <div className="mx-auto mb-2">{item.icon}</div>
                    <h5 className="font-semibold text-gray-800 text-sm">{item.title}</h5>
                    <p className="text-xs text-gray-600 font-medium">{item.desc}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SPARQL Endpoint */}
            <div className="dijla-card p-6">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Code className="h-4 w-4 text-amber-600" /> SPARQL Query Endpoint
              </h4>
              <p className="text-sm text-gray-500 mb-3">MOON exposes a SPARQL endpoint for querying the knowledge graph.</p>
              <pre className="dijla-code p-4 text-xs overflow-auto">
{`PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?work ?title ?author WHERE {
  ?work a bf:Work ;
        bf:title ?titleNode .
  ?titleNode bf:mainTitle ?title .
  OPTIONAL {
    ?work bf:contribution ?contrib .
    ?contrib bf:agent ?agent .
    ?agent rdfs:label ?author .
  }
}
LIMIT 100`}
              </pre>
            </div>
          </div>
        )}

        {/* ═══ INTEROPERABILITY ═══ */}
        {activeTab === "interoperability" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="dijla-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Share2 className="h-5 w-5 text-teal-600" /> LD4 Interoperability
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                MOON is designed for full interoperability with the international linked data cataloging infrastructure.
              </p>

              {/* Compatibility Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 pr-4 font-semibold">System</th>
                      <th className="pb-3 pr-4 font-semibold">Protocol</th>
                      <th className="pb-3 pr-4 font-semibold">Integration</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { system: "Library of Congress BIBFRAME Editor", protocol: "REST/RDF", integration: "Authority search, BIBFRAME import/export", status: "Active" },
                      { system: "Sinopia Linked Data Editor", protocol: "REST/JSON-LD", integration: "Template import, profile compatibility", status: "Active" },
                      { system: "VIAF (Virtual International Authority File)", protocol: "SRU/REST", integration: "Authority reconciliation, URI linking", status: "Active" },
                      { system: "Wikidata", protocol: "REST/SPARQL", integration: "Entity linking, knowledge graph federation", status: "Active" },
                      { system: "FAST (OCLC)", protocol: "REST", integration: "Subject heading reconciliation", status: "Active" },
                      { system: "Share-VDE", protocol: "SPARQL/RDF", integration: "Cluster entity linking, authority enrichment", status: "Active" },
                      { system: "FOLIO LSP", protocol: "REST", integration: "Instance/Item management (planned)", status: "Planned" },
                      { system: "Apache Jena Fuseki", protocol: "SPARQL", integration: "Triple store federation (planned)", status: "Planned" },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2.5 pr-4 font-medium text-gray-800">{row.system}</td>
                        <td className="py-2.5 pr-4"><code className="text-xs text-amber-700 font-mono">{row.protocol}</code></td>
                        <td className="py-2.5 pr-4 text-xs text-gray-500">{row.integration}</td>
                        <td className="py-2.5">{row.status === "Active" ? <span className="dijla-badge-success">Active</span> : <span className="dijla-badge-warn">Planned</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Standards Compliance */}
            <div className="dijla-card p-6">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" /> Standards Compliance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "BIBFRAME 2.0 (Library of Congress)",
                  "RDF 1.1 (W3C)",
                  "JSON-LD 1.1 (W3C)",
                  "SPARQL 1.1 (W3C)",
                  "SHACL (Shapes Constraint Language)",
                  "LCSH / LCNAF / LCGFT",
                  "MARC 21 (crosswalk)",
                  "Dublin Core",
                  "MADS/RDF",
                  "SKOS (Simple Knowledge Organization System)",
                  "Cool URIs for the Semantic Web (W3C)",
                  "Linked Data Platform (LDP)",
                ].map((standard, idx) => (
                  <div key={idx} className="dijla-row flex items-center gap-3 px-4 py-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    <span className="text-sm text-gray-700">{standard}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LD4 Partners */}
            <div className="dijla-card p-6">
              <h4 className="font-bold text-gray-800 mb-4">LD4 Community Partners</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { name: "Library of Congress", abbr: "LOC" },
                  { name: "Stanford", abbr: "SU" },
                  { name: "Cornell", abbr: "CUL" },
                  { name: "Harvard", abbr: "HL" },
                  { name: "Columbia", abbr: "CU" },
                  { name: "Share-VDE", abbr: "SVD" },
                ].map(partner => (
                  <div key={partner.abbr} className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
                    <div className="w-11 h-11 mx-auto rounded-xl bg-teal-100 border border-teal-300 flex items-center justify-center text-teal-700 font-bold text-sm mb-2">
                      {partner.abbr}
                    </div>
                    <p className="text-xs font-semibold text-gray-700">{partner.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

function StatCard({ title, value, subtitle, icon, accent, bg }: { title: string; value: string; subtitle: string; icon: React.ReactNode; accent: string; bg: string }) {
  return (
    <div className="dijla-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <div className={`${bg} p-3 rounded-xl ${accent}`}>{icon}</div>
      </div>
    </div>
  );
}
