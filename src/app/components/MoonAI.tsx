/**
 * MOON AI - AI-Assisted BIBFRAME Cataloging System
 * 
 * 5-Phase AI Intelligence Layer:
 *   Phase 1: AI Metadata Suggestions (with JSON-LD fragment output)
 *   Phase 2: AI Duplicate Detection & Clustering
 *   Phase 3: AI Natural Language Discovery
 *   Phase 4: AI SPARQL Generator
 *   Phase 5: AI Auto-Fill Cataloging
 * 
 * iOS frosted glassmorphism + full Arabic/RTL support
 */

"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";
import {
  Brain, Sparkles, Search, Code2, Wand2, Shield,
  ChevronDown, ChevronRight, ChevronLeft,
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Copy, ExternalLink, BookOpen, Users, Languages,
  Calendar, Tag, FileText, Loader2, Database,
  Layers, BarChart3, RefreshCw, ThumbsUp, ThumbsDown,
  History, Zap, Info, Check, X, Link2, Globe,
  Braces, Network
} from "lucide-react";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import moonLogo from "figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c`;
const apiHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` };

// =========================================================================
// TYPES
// =========================================================================
interface AISuggestion {
  label: string;
  uri?: string;
  confidence: number;
  source?: string;
}

interface MetadataResult {
  suggestedSubjects: AISuggestion[];
  suggestedGenre: AISuggestion[];
  suggestedRelatorRoles: AISuggestion[];
  detectedLanguage: { code: string; label: string; confidence: number } | null;
  extractedYear: { year: number; confidence: number } | null;
  suggestedSeries: AISuggestion[];
  generatedSummary: string | null;
  authorityCandidates: AISuggestion[];
}

interface DuplicateCandidate {
  candidateId: string;
  candidateTitle: string;
  similarityScore: number;
  matchReasons: string[];
  mergeRecommendation: "Auto-Merge" | "Review Required" | "Low Confidence";
}

// =========================================================================
// UI PRIMITIVES
// =========================================================================

function GlassCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: "rgba(30, 41, 59, 0.55)",
        border: "1px solid rgba(59, 130, 246, 0.12)",
        backdropFilter: "blur(30px) saturate(180%)",
        WebkitBackdropFilter: "blur(30px) saturate(180%)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function GlassInput({ value, onChange, placeholder, multiline = false, dir, className = "" }: {
  value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean; dir?: string; className?: string;
}) {
  const style: React.CSSProperties = {
    background: "rgba(30,41,59,0.7)",
    border: "1px solid rgba(59,130,246,0.15)",
    color: "#f1f5f9",
    backdropFilter: "blur(10px)",
  };
  const cls = `w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${className}`;
  return multiline ? (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls} style={style} dir={dir} />
  ) : (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} style={style} dir={dir} />
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.8 ? "#34c759" : value >= 0.6 ? "#ff9500" : "#ff3b30";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
      {pct}%
    </span>
  );
}

function ActionBtn({ onClick, loading, disabled, children, color = "#3b82f6" }: {
  onClick: () => void; loading: boolean; disabled?: boolean; children: React.ReactNode; color?: string;
}) {
  return (
    <button onClick={onClick} disabled={loading || disabled}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
      style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

function SectionLabel({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3" style={{ color }}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </div>
  );
}

function StatusChip({ accepted, onAccept, onReject }: { accepted: boolean | null; onAccept: () => void; onReject: () => void }) {
  if (accepted === true) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/30">Accepted</span>;
  if (accepted === false) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">Rejected</span>;
  return (
    <div className="flex items-center gap-1">
      <button onClick={onAccept} className="p-1 rounded-lg hover:bg-green-500/20 transition-all" title="Accept">
        <Check className="h-3.5 w-3.5 text-green-400" />
      </button>
      <button onClick={onReject} className="p-1 rounded-lg hover:bg-red-500/20 transition-all" title="Reject">
        <X className="h-3.5 w-3.5 text-red-400" />
      </button>
    </div>
  );
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard"));
}

// =========================================================================
// PHASE 1: AI METADATA SUGGESTIONS
// =========================================================================
function Phase1_MetadataSuggestions({ language }: { language: string }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("");
  const [abstract, setAbstract] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MetadataResult | null>(null);
  const [fieldStatus, setFieldStatus] = useState<Record<string, boolean | null>>({});
  const [showJsonLd, setShowJsonLd] = useState(false);
  const isRtl = language === "ar";

  const analyze = useCallback(async () => {
    if (!title && !author && !isbn) { toast.error("Enter at least a title, author, or ISBN"); return; }
    setLoading(true);
    setFieldStatus({});
    try {
      const res = await fetch(`${API_BASE}/ai/suggest-metadata`, {
        method: "POST", headers: apiHeaders,
        body: JSON.stringify({ title, author, isbn, publisher, abstract }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || res.statusText); }
      setResult(await res.json());
      toast.success("AI metadata suggestions generated");
    } catch (err: any) {
      console.error("Phase 1 error:", err);
      toast.error(`AI error: ${err.message}`);
    } finally { setLoading(false); }
  }, [title, author, isbn, publisher, abstract]);

  // Build JSON-LD fragment from accepted suggestions
  const buildJsonLdFragment = (): any => {
    if (!result) return null;
    const fragment: any = {
      "@type": "bf:Work",
    };
    if (title) {
      fragment["bf:title"] = { "@type": "bf:Title", "bf:mainTitle": title };
    }
    if (result.suggestedSubjects?.length > 0) {
      const acceptedSubjects = result.suggestedSubjects.filter((_, i) => fieldStatus[`subject-${i}`] !== false);
      if (acceptedSubjects.length > 0) {
        fragment["bf:subject"] = acceptedSubjects.map(s => ({
          ...(s.uri ? { "@id": s.uri } : {}),
          "rdfs:label": s.label
        }));
      }
    }
    if (result.suggestedGenre?.length > 0) {
      const acceptedGenres = result.suggestedGenre.filter((_, i) => fieldStatus[`genre-${i}`] !== false);
      if (acceptedGenres.length > 0) {
        fragment["bf:genreForm"] = acceptedGenres.map(g => ({
          ...(g.uri ? { "@id": g.uri } : {}),
          "rdfs:label": g.label
        }));
      }
    }
    if (result.detectedLanguage && fieldStatus["language"] !== false) {
      fragment["bf:language"] = {
        "@id": `http://id.loc.gov/vocabulary/languages/${result.detectedLanguage.code}`,
        "rdfs:label": result.detectedLanguage.label,
      };
    }
    if (result.generatedSummary && fieldStatus["summary"] !== false) {
      fragment["bf:summary"] = { "@type": "bf:Summary", "rdfs:label": result.generatedSummary };
    }
    if (result.extractedYear && fieldStatus["year"] !== false) {
      fragment["bf:originDate"] = { "@value": String(result.extractedYear.year), "@type": "xsd:gYear" };
    }
    if (result.authorityCandidates?.length > 0) {
      const accepted = result.authorityCandidates.filter((_, i) => fieldStatus[`auth-${i}`] !== false);
      if (accepted.length > 0) {
        fragment["bf:contribution"] = accepted.map(a => ({
          "@type": "bf:Contribution",
          "bf:agent": { "rdfs:label": a.label, ...(a.uri ? { "@id": a.uri } : {}) }
        }));
      }
    }
    return fragment;
  };

  const jsonLdFragment = result ? buildJsonLdFragment() : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <GlassInput value={title} onChange={setTitle} placeholder="Enter title" dir={isRtl ? "rtl" : "ltr"} />
        <GlassInput value={author} onChange={setAuthor} placeholder="Enter author name" dir={isRtl ? "rtl" : "ltr"} />
        <GlassInput value={isbn} onChange={setIsbn} placeholder="Enter ISBN" />
        <GlassInput value={publisher} onChange={setPublisher} placeholder="Enter publisher" dir={isRtl ? "rtl" : "ltr"} />
      </div>
      <GlassInput value={abstract} onChange={setAbstract} placeholder="Enter abstract or description..." multiline dir={isRtl ? "rtl" : "ltr"} />
      
      <div className="flex items-center gap-3">
        <ActionBtn onClick={analyze} loading={loading}><Sparkles className="h-4 w-4" /> AI Suggest Metadata</ActionBtn>
        {result && (
          <ActionBtn onClick={() => setShowJsonLd(!showJsonLd)} loading={false} color="#a855f7">
            <Braces className="h-4 w-4" /> {showJsonLd ? "Hide" : "View"} JSON-LD
          </ActionBtn>
        )}
      </div>

      {result && (
        <div className="space-y-4 mt-2">
          {/* Subjects */}
          {result.suggestedSubjects?.length > 0 && (
            <div>
              <SectionLabel icon={Tag} label="Suggested Subjects (LCSH)" color="#3b82f6" />
              <div className="space-y-1.5">
                {result.suggestedSubjects.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
                    style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", opacity: fieldStatus[`subject-${i}`] === false ? 0.4 : 1 }}>
                    <div className="flex items-center gap-2 flex-1">
                      <Tag className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span className="text-sm text-slate-200">{s.label}</span>
                      {s.uri && <a href={s.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300"><ExternalLink className="h-3 w-3" /></a>}
                    </div>
                    <div className="flex items-center gap-2">
                      <ConfidenceBadge value={s.confidence} />
                      <StatusChip accepted={fieldStatus[`subject-${i}`] ?? null}
                        onAccept={() => setFieldStatus(p => ({ ...p, [`subject-${i}`]: true }))}
                        onReject={() => setFieldStatus(p => ({ ...p, [`subject-${i}`]: false }))} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Genre/Form */}
          {result.suggestedGenre?.length > 0 && (
            <div>
              <SectionLabel icon={BookOpen} label="Suggested Genre/Form (LCGFT)" color="#a855f7" />
              <div className="flex flex-wrap gap-2">
                {result.suggestedGenre.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                    style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", color: "#f1f5f9", opacity: fieldStatus[`genre-${i}`] === false ? 0.4 : 1 }}>
                    {g.label}
                    <ConfidenceBadge value={g.confidence} />
                    <StatusChip accepted={fieldStatus[`genre-${i}`] ?? null}
                      onAccept={() => setFieldStatus(p => ({ ...p, [`genre-${i}`]: true }))}
                      onReject={() => setFieldStatus(p => ({ ...p, [`genre-${i}`]: false }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Relator Roles */}
          {result.suggestedRelatorRoles?.length > 0 && (
            <div>
              <SectionLabel icon={Users} label="Relator Roles" color="#ff9500" />
              <div className="flex flex-wrap gap-2">
                {result.suggestedRelatorRoles.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                    style={{ background: "rgba(255,149,0,0.08)", border: "1px solid rgba(255,149,0,0.2)", color: "#f1f5f9" }}>
                    {r.label}
                    {r.source && <span className="text-[10px] opacity-60">({r.source})</span>}
                    <ConfidenceBadge value={r.confidence} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Language + Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.detectedLanguage && (
              <div className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", opacity: fieldStatus["language"] === false ? 0.4 : 1 }}>
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-emerald-400">Language</div>
                    <div className="text-sm text-slate-200">{result.detectedLanguage.label} ({result.detectedLanguage.code})</div>
                  </div>
                  <ConfidenceBadge value={result.detectedLanguage.confidence} />
                </div>
                <StatusChip accepted={fieldStatus["language"] ?? null}
                  onAccept={() => setFieldStatus(p => ({ ...p, language: true }))}
                  onReject={() => setFieldStatus(p => ({ ...p, language: false }))} />
              </div>
            )}
            {result.extractedYear && (
              <div className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "rgba(255,149,0,0.08)", border: "1px solid rgba(255,149,0,0.2)", opacity: fieldStatus["year"] === false ? 0.4 : 1 }}>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="text-xs font-bold text-orange-400">Year</div>
                    <div className="text-sm text-slate-200">{result.extractedYear.year}</div>
                  </div>
                  <ConfidenceBadge value={result.extractedYear.confidence} />
                </div>
                <StatusChip accepted={fieldStatus["year"] ?? null}
                  onAccept={() => setFieldStatus(p => ({ ...p, year: true }))}
                  onReject={() => setFieldStatus(p => ({ ...p, year: false }))} />
              </div>
            )}
          </div>

          {/* Summary */}
          {result.generatedSummary && (
            <div style={{ opacity: fieldStatus["summary"] === false ? 0.4 : 1 }}>
              <div className="flex items-center justify-between">
                <SectionLabel icon={FileText} label="Generated Summary" color="rgba(59,130,246,0.7)" />
                <StatusChip accepted={fieldStatus["summary"] ?? null}
                  onAccept={() => setFieldStatus(p => ({ ...p, summary: true }))}
                  onReject={() => setFieldStatus(p => ({ ...p, summary: false }))} />
              </div>
              <div className="p-3 rounded-xl text-sm leading-relaxed text-slate-200"
                style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                {result.generatedSummary}
              </div>
            </div>
          )}

          {/* Authority Candidates */}
          {result.authorityCandidates?.length > 0 && (
            <div>
              <SectionLabel icon={Link2} label="Authority Candidates" color="#34c759" />
              <div className="space-y-1.5">
                {result.authorityCandidates.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg"
                    style={{ background: "rgba(52,199,89,0.08)", border: "1px solid rgba(52,199,89,0.2)", opacity: fieldStatus[`auth-${i}`] === false ? 0.4 : 1 }}>
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-green-400 shrink-0" />
                      <span className="text-sm text-slate-200">{a.label}</span>
                      {a.uri && (
                        <a href={a.uri} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 text-[10px]">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <ConfidenceBadge value={a.confidence} />
                      <StatusChip accepted={fieldStatus[`auth-${i}`] ?? null}
                        onAccept={() => setFieldStatus(p => ({ ...p, [`auth-${i}`]: true }))}
                        onReject={() => setFieldStatus(p => ({ ...p, [`auth-${i}`]: false }))} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* JSON-LD Fragment Output */}
          {showJsonLd && jsonLdFragment && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <SectionLabel icon={Braces} label="BIBFRAME JSON-LD Fragment" color="#3b82f6" />
                <button onClick={() => copyText(JSON.stringify(jsonLdFragment, null, 2))}
                  className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-slate-200">
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <pre className="p-4 text-xs overflow-auto max-h-80 text-blue-300" dir="ltr">
                  {JSON.stringify(jsonLdFragment, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// PHASE 2: DUPLICATE DETECTION
// =========================================================================
function Phase2_DuplicateDetection({ language }: { language: string }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<DuplicateCandidate[] | null>(null);

  const detect = useCallback(async () => {
    if (!title) { toast.error("Title is required"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/detect-duplicates`, {
        method: "POST", headers: apiHeaders,
        body: JSON.stringify({ title, author, isbn }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || res.statusText); }
      const data = await res.json();
      setCandidates(data.candidates || []);
      toast.success(`Found ${(data.candidates || []).length} candidate(s)`);
    } catch (err: any) {
      console.error("Phase 2 error:", err);
      toast.error(`AI error: ${err.message}`);
    } finally { setLoading(false); }
  }, [title, author, isbn]);

  const mergeColor = (rec: string) => rec === "Auto-Merge" ? "#34c759" : rec === "Review Required" ? "#ff9500" : "#ff3b30";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <GlassInput value={title} onChange={setTitle} placeholder="Enter title *" dir={language === "ar" ? "rtl" : "ltr"} />
        <GlassInput value={author} onChange={setAuthor} placeholder="Enter author" dir={language === "ar" ? "rtl" : "ltr"} />
        <GlassInput value={isbn} onChange={setIsbn} placeholder="Enter ISBN" />
      </div>
      <ActionBtn onClick={detect} loading={loading} color="#ff9500">
        <Layers className="h-4 w-4" /> Detect Duplicates
      </ActionBtn>

      {candidates !== null && (
        <div className="space-y-3 mt-2">
          {candidates.length === 0 ? (
            <div className="text-center py-8 rounded-xl" style={{ background: "rgba(52,199,89,0.08)", border: "1px solid rgba(52,199,89,0.2)" }}>
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <p className="text-sm font-semibold text-green-400">No duplicate candidates found. This appears to be a unique record.</p>
            </div>
          ) : (
            candidates.map((c, i) => (
              <GlassCard key={i} className="p-4 space-y-3" style={{ border: `1px solid ${mergeColor(c.mergeRecommendation)}40` }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-200">{c.candidateTitle || c.candidateId}</span>
                  <ConfidenceBadge value={c.similarityScore} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Recommendation:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: `${mergeColor(c.mergeRecommendation)}15`, color: mergeColor(c.mergeRecommendation) }}>
                    {c.mergeRecommendation}
                  </span>
                </div>
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Suggested BIBFRAME Links:</div>
                <div className="flex flex-wrap gap-1.5">
                  {c.mergeRecommendation === "Auto-Merge" && <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">bf:instanceOf</span>}
                  {c.matchReasons?.some(r => r.toLowerCase().includes("translation")) && <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">bf:translationOf</span>}
                  {c.matchReasons?.some(r => r.toLowerCase().includes("edition")) && <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 border border-green-500/20">bf:hasInstance</span>}
                </div>
                {c.matchReasons?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {c.matchReasons.map((r, j) => (
                      <span key={j} className="px-2 py-0.5 rounded text-[10px] bg-blue-500/8 text-blue-300">{r}</span>
                    ))}
                  </div>
                )}
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// PHASE 3: NATURAL LANGUAGE DISCOVERY
// =========================================================================
const NL_EXAMPLES = [
  "Arabic books about irrigation before 1950 held in Baghdad",
  "books about artificial intelligence written after 2015",
  "Islamic philosophy texts published in Cairo",
  "Works by Iraqi authors about water management",
];

function Phase3_NaturalLanguage({ language }: { language: string }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const search = useCallback(async () => {
    if (!query.trim()) { toast.error("Enter a query"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/natural-search`, {
        method: "POST", headers: apiHeaders,
        body: JSON.stringify({ query }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || res.statusText); }
      setResult(await res.json());
      toast.success("Query parsed successfully");
    } catch (err: any) {
      console.error("Phase 3 error:", err);
      toast.error(`AI error: ${err.message}`);
    } finally { setLoading(false); }
  }, [query]);

  return (
    <div className="space-y-4">
      <GlassInput value={query} onChange={setQuery} placeholder="Enter natural language query..." dir={language === "ar" ? "rtl" : "ltr"} />
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] font-bold uppercase py-1 text-slate-400">Examples:</span>
        {NL_EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => setQuery(ex)}
            className="px-2.5 py-1 rounded-lg text-[11px] transition-all hover:scale-105 bg-emerald-500/8 border border-emerald-500/20 text-emerald-400">
            {ex.length > 45 ? ex.slice(0, 45) + "..." : ex}
          </button>
        ))}
      </div>
      <ActionBtn onClick={search} loading={loading} color="#10b981">
        <Search className="h-4 w-4" /> Search
      </ActionBtn>

      {result && (
        <div className="space-y-3">
          {/* Parsed filters */}
          <SectionLabel icon={Database} label="Parsed Search Filters" color="#10b981" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(result).filter(([, v]) => v != null).map(([key, value]) => (
              <div key={key} className="p-2.5 rounded-lg" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <div className="text-[10px] font-bold uppercase text-emerald-400">{key}</div>
                <div className="text-sm text-slate-200 mt-0.5">{String(value)}</div>
              </div>
            ))}
          </div>

          {/* Full JSON */}
          <div className="rounded-xl overflow-hidden" style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <div className="px-4 py-2 flex items-center justify-between border-b border-emerald-500/10">
              <span className="text-[10px] font-bold uppercase text-emerald-400">Structured Query JSON</span>
              <button onClick={() => copyText(JSON.stringify(result, null, 2))} className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-slate-200">
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
            <pre className="p-4 text-xs overflow-auto max-h-48 text-slate-300" dir="ltr">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// PHASE 4: SPARQL GENERATOR
// =========================================================================
const SPARQL_EXAMPLES = [
  "find all works by Isaac Asimov translated into Arabic",
  "Show all works about irrigation by Iraqi authors",
  "Find books published before 1900 in Arabic",
  "List all works with subject heading 'Islamic art'",
];

function Phase4_SparqlGenerator({ language }: { language: string }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const translate = useCallback(async () => {
    if (!query.trim()) { toast.error("Enter a query"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/sparql-translate`, {
        method: "POST", headers: apiHeaders,
        body: JSON.stringify({ query }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || res.statusText); }
      setResult(await res.json());
      toast.success("SPARQL generated");
    } catch (err: any) {
      console.error("Phase 4 error:", err);
      toast.error(`AI error: ${err.message}`);
    } finally { setLoading(false); }
  }, [query]);

  return (
    <div className="space-y-4">
      <GlassInput value={query} onChange={setQuery} placeholder='Enter query in natural language (e.g. "find all works by Isaac Asimov translated into Arabic")' dir={language === "ar" ? "rtl" : "ltr"} />
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] font-bold uppercase py-1 text-slate-400">Examples:</span>
        {SPARQL_EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => setQuery(ex)}
            className="px-2.5 py-1 rounded-lg text-[11px] transition-all hover:scale-105 bg-purple-500/8 border border-purple-500/20 text-purple-400">
            {ex.length > 40 ? ex.slice(0, 40) + "..." : ex}
          </button>
        ))}
      </div>
      <ActionBtn onClick={translate} loading={loading} color="#a855f7">
        <Code2 className="h-4 w-4" /> Generate SPARQL
      </ActionBtn>

      {result && (
        <div className="space-y-4">
          {/* Safety */}
          <div className="flex items-center gap-2">
            {result.isSafe ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-500/10 border border-green-500/20 text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Safe SELECT Query
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400">
                <XCircle className="h-3.5 w-3.5" /> Unsafe - Blocked
              </span>
            )}
          </div>

          {/* Explanation */}
          {result.explanation && (
            <div className="p-3 rounded-xl text-sm bg-purple-500/8 border border-purple-500/20 text-slate-200">
              <span className="text-xs font-bold text-purple-400">Explanation:</span> {result.explanation}
            </div>
          )}

          {/* SPARQL */}
          <div className="rounded-xl overflow-hidden" style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(168,85,247,0.2)" }}>
            <div className="px-4 py-2 flex items-center justify-between border-b border-purple-500/10">
              <span className="text-[10px] font-bold uppercase text-purple-400">SPARQL</span>
              <button onClick={() => copyText(result.sparqlQuery)} className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-slate-200">
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
            <pre className="p-4 text-xs overflow-auto max-h-64 whitespace-pre-wrap text-blue-300" dir="ltr">
              {result.sparqlQuery}
            </pre>
          </div>

          {/* Warnings */}
          {result.warnings?.length > 0 && (
            <div className="space-y-1.5">
              {result.warnings.map((w: string, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg text-xs bg-orange-500/8 border border-orange-500/20 text-orange-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {w}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// PHASE 5: AI AUTO-FILL
// =========================================================================
function Phase5_AutoFill({ language }: { language: string }) {
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fill = useCallback(async () => {
    if (!isbn && !title) { toast.error("Enter an ISBN or title"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/autofill`, {
        method: "POST", headers: apiHeaders,
        body: JSON.stringify({ isbn, title }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || res.statusText); }
      setResult(await res.json());
      toast.success("Auto-fill complete");
    } catch (err: any) {
      console.error("Phase 5 error:", err);
      toast.error(`AI error: ${err.message}`);
    } finally { setLoading(false); }
  }, [isbn, title]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <GlassInput value={isbn} onChange={setIsbn} placeholder="Enter ISBN (e.g. 978-0-262-04630-7)" />
        <GlassInput value={title} onChange={setTitle} placeholder="Or enter title" dir={language === "ar" ? "rtl" : "ltr"} />
      </div>
      <ActionBtn onClick={fill} loading={loading} color="#34c759">
        <Wand2 className="h-4 w-4" /> AI Auto-Fill
      </ActionBtn>

      {result && (
        <div className="space-y-4 mt-2">
          {/* Sources + Confidence */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Sources:</span>
            {(result.sources || [result.source || "AI"]).map((s: string, i: number) => (
              <span key={i} className="px-2 py-0.5 rounded text-xs font-semibold bg-green-500/10 text-green-400">{s}</span>
            ))}
            {result.confidence && <ConfidenceBadge value={result.confidence} />}
          </div>

          {/* Mapped Fields */}
          {result.mappedFields && (
            <div>
              <SectionLabel icon={CheckCircle2} label="Mapped BIBFRAME Fields" color="#34c759" />
              <div className="rounded-xl overflow-hidden" style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(52,199,89,0.2)" }}>
                <pre className="p-4 text-xs overflow-auto max-h-80 text-slate-300" dir="ltr">
                  {JSON.stringify(result.mappedFields, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* BIBFRAME Triples */}
          {result.bibframeTriples?.length > 0 && (
            <div>
              <SectionLabel icon={Network} label="BIBFRAME Triples" color="#3b82f6" />
              <div className="space-y-1.5">
                {result.bibframeTriples.map((triple: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg text-xs bg-blue-500/8 border border-blue-500/20">
                    <span className="font-mono font-bold text-blue-400 shrink-0">{triple.predicate}</span>
                    <span className="text-slate-200 truncate">{typeof triple.value === "string" ? triple.value : JSON.stringify(triple.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unmapped */}
          {result.unmappedFields?.length > 0 && (
            <div>
              <SectionLabel icon={AlertTriangle} label="Unmapped Fields" color="#ff9500" />
              <div className="flex flex-wrap gap-1.5">
                {result.unmappedFields.map((f: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-orange-500/8 text-orange-400 border border-orange-500/20">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// AUDIT LOG
// =========================================================================
function AuditLogPanel() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/audit-log?limit=50`, { headers: apiHeaders });
      if (!res.ok) throw new Error("Failed to load audit log");
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const updateApproval = async (id: string, approved: boolean) => {
    try {
      await fetch(`${API_BASE}/ai/audit/${id}/approve`, {
        method: "POST", headers: apiHeaders,
        body: JSON.stringify({ approved }),
      });
      setEntries(prev => prev.map(e => e.id === id ? { ...e, approved } : e));
      toast.success(approved ? "Approved" : "Rejected");
    } catch (err: any) { toast.error(err.message); }
  };

  const phaseInfo: Record<string, { label: string; color: string }> = {
    "phase1": { label: "Metadata", color: "#3b82f6" },
    "phase2": { label: "Duplicates", color: "#ff9500" },
    "phase3": { label: "NL Search", color: "#10b981" },
    "phase4": { label: "SPARQL", color: "#a855f7" },
    "phase5": { label: "Auto-Fill", color: "#34c759" },
  };

  const getPhase = (p: string) => {
    for (const [key, val] of Object.entries(phaseInfo)) {
      if (p.includes(key)) return val;
    }
    return { label: p, color: "#94a3b8" };
  };

  const total = entries.length;
  const approved = entries.filter(e => e.approved === true).length;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const avgTime = total > 0 ? Math.round(entries.reduce((s, e) => s + (e.processingTimeMs || 0), 0) / total) : 0;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Interactions", value: total, color: "#3b82f6", icon: BarChart3 },
          { label: "Approval Rate", value: `${approvalRate}%`, color: "#34c759", icon: ThumbsUp },
          { label: "Avg Processing", value: `${avgTime}ms`, color: "#a855f7", icon: Zap },
        ].map((stat, i) => (
          <div key={i} className="p-3 rounded-xl text-center" style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}20` }}>
            <stat.icon className="h-4 w-4 mx-auto mb-1" style={{ color: stat.color }} />
            <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[10px] text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-200">Audit Trail</span>
        <button onClick={load} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 transition-all">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-sm text-slate-400">No audit entries yet.</div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {entries.map(entry => {
            const phase = getPhase(entry.featurePhase);
            return (
              <GlassCard key={entry.id} style={{ border: `1px solid ${phase.color}20` }}>
                <button onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-start">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold" style={{ background: `${phase.color}15`, color: phase.color }}>
                    {phase.label}
                  </span>
                  <span className="text-xs flex-1 truncate text-slate-200">
                    {typeof entry.input === "object" ? (entry.input.title || entry.input.query || entry.input.isbn || JSON.stringify(entry.input).slice(0, 60)) : String(entry.input).slice(0, 60)}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  {entry.approved === true && <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />}
                  {entry.approved === false && <XCircle className="h-3.5 w-3.5 text-red-400" />}
                  {entry.approved === null && <Clock className="h-3.5 w-3.5 text-slate-400" />}
                  <span className="text-[10px] text-slate-400">{entry.processingTimeMs}ms</span>
                  {expandedId === entry.id ? <ChevronDown className="h-3 w-3 text-slate-400" /> : <ChevronRight className="h-3 w-3 text-slate-400" />}
                </button>

                {expandedId === entry.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-blue-500/10">
                    <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase mb-1 text-slate-400">Input</div>
                        <pre className="p-2 rounded-lg text-[10px] overflow-auto max-h-40 bg-slate-900/50 text-slate-300" dir="ltr">
                          {JSON.stringify(entry.input, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase mb-1 text-slate-400">Output</div>
                        <pre className="p-2 rounded-lg text-[10px] overflow-auto max-h-40 bg-slate-900/50 text-slate-300" dir="ltr">
                          {JSON.stringify(entry.output, null, 2)}
                        </pre>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateApproval(entry.id, true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all">
                        <ThumbsUp className="h-3 w-3" /> Approve
                      </button>
                      <button onClick={() => updateApproval(entry.id, false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                        <ThumbsDown className="h-3 w-3" /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// PHASE TABS CONFIG
// =========================================================================
const PHASE_TABS = [
  { id: "phase1", label: "AI Metadata", icon: Sparkles, color: "#3b82f6", description: "Suggest BIBFRAME metadata with JSON-LD output" },
  { id: "phase2", label: "Duplicates", icon: Layers, color: "#ff9500", description: "Detect duplicate works, instances, and editions" },
  { id: "phase3", label: "NL Discovery", icon: Search, color: "#10b981", description: "Search using natural language queries" },
  { id: "phase4", label: "SPARQL", icon: Code2, color: "#a855f7", description: "Generate SPARQL from natural language" },
  { id: "phase5", label: "Auto-Fill", icon: Wand2, color: "#34c759", description: "Auto-fill from ISBN via multi-source lookup" },
  { id: "audit", label: "Audit Log", icon: History, color: "#94a3b8", description: "View all AI interaction history" },
] as const;

// =========================================================================
// MAIN COMPONENT
// =========================================================================
export default function MoonAI({ onBack }: { onBack?: () => void }) {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const isRtl = language === "ar";
  const [activeTab, setActiveTab] = useState<string>("phase1");
  const [apiStatus, setApiStatus] = useState<"checking" | "ready" | "error">("checking");

  // Check API key on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/ai/debug-key`, { headers: apiHeaders });
        const data = await res.json();
        if (data.configured) {
          setApiStatus("ready");
        } else {
          setApiStatus("error");
          console.error("[MOON AI] API Key not configured:", data);
        }
      } catch {
        setApiStatus("error");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen" style={{ direction: isRtl ? "rtl" : "ltr" }} dir={isRtl ? "rtl" : "ltr"}>
      <Toaster position="top-right" />

      {/* Background */}
      <div className="fixed inset-0 -z-10" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(16,185,129,0.05) 0%, transparent 50%)",
        }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <GlassCard className="p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 bg-slate-700/50 border border-blue-500/20 text-slate-200">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              <img src={moonLogo} alt="Moon" className="h-12 w-12" />
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-400" />
                  MOON AI
                </h1>
                <p className="text-sm text-slate-400">AI-Assisted BIBFRAME Cataloging System</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* API Status */}
              {apiStatus === "checking" && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking API...
                </span>
              )}
              {apiStatus === "ready" && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-500/10 border border-green-500/20 text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> AI Ready
                </span>
              )}
              {apiStatus === "error" && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> API Key Issue
                </span>
              )}

              {/* Language toggle */}
              <button onClick={() => i18n.changeLanguage(language === "en" ? "ar" : "en")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-700/50 border border-blue-500/20 text-slate-200 hover:scale-105 transition-all">
                <Languages className="h-4 w-4" />
                {language === "en" ? "ع" : "EN"}
              </button>
            </div>
          </div>

          {/* Architecture banner */}
          <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { label: "Linked Data", icon: Network },
              { label: "BIBFRAME 2.0", icon: Layers },
              { label: "Authority Control", icon: Link2 },
              { label: "JSON-LD Output", icon: Braces },
              { label: "Multi-Source", icon: Database },
              { label: "Audit Trail", icon: Shield },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-700/30 border border-slate-600/20">
                <item.icon className="h-3 w-3 text-blue-400 shrink-0" />
                <span className="text-[10px] font-medium text-slate-300 truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Phase Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {PHASE_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-medium ${isActive ? "scale-[1.02] shadow-lg" : "hover:scale-[1.01]"}`}
                style={{
                  background: isActive ? `${tab.color}20` : "rgba(30,41,59,0.4)",
                  border: `1px solid ${isActive ? `${tab.color}50` : "rgba(59,130,246,0.1)"}`,
                  color: isActive ? tab.color : "#94a3b8",
                  backdropFilter: "blur(10px)",
                }}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Phase Description */}
        {PHASE_TABS.map(tab => {
          if (activeTab !== tab.id) return null;
          return (
            <div key={tab.id} className="mb-4 px-1">
              <p className="text-sm text-slate-400">{tab.description}</p>
            </div>
          );
        })}

        {/* Phase Content */}
        <GlassCard className="p-6">
          {activeTab === "phase1" && <Phase1_MetadataSuggestions language={language} />}
          {activeTab === "phase2" && <Phase2_DuplicateDetection language={language} />}
          {activeTab === "phase3" && <Phase3_NaturalLanguage language={language} />}
          {activeTab === "phase4" && <Phase4_SparqlGenerator language={language} />}
          {activeTab === "phase5" && <Phase5_AutoFill language={language} />}
          {activeTab === "audit" && <AuditLogPanel />}
        </GlassCard>

        {/* AI Principles Footer */}
        <GlassCard className="p-4 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Governance Principles</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { text: "AI is assistive, not authoritative", icon: Brain, color: "#3b82f6" },
              { text: "AI never directly mutates canonical RDF", icon: Shield, color: "#ff3b30" },
              { text: "All AI outputs are logged and auditable", icon: History, color: "#a855f7" },
              { text: "AI data stored separately from authoritative RDF", icon: Database, color: "#10b981" },
              { text: "AI respects URI-based authority control", icon: ExternalLink, color: "#ff9500" },
              { text: "No hallucinated identifiers allowed", icon: AlertTriangle, color: "#ff3b30" },
            ].map((p, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: `${p.color}06`, border: `1px solid ${p.color}15` }}>
                <p.icon className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: p.color }} />
                <span className="text-[11px] leading-relaxed text-slate-300">{p.text}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500">
          MOON AI — Powered by OpenAI + 19-Source Federated Discovery (LOC, VIAF, Wikidata, OpenLibrary, GoogleBooks, CrossRef, ISBNdb, WorldCat, BNF, FAST, LCSH, GND, ISNI, HathiTrust, Getty, Europeana, DPLA, ShareVDE)
        </div>
      </div>
    </div>
  );
}
