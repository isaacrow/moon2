/**
 * Enterprise AI Engine for BIBFRAME Union Catalog
 * 5-Phase AI augmentation system with audit logging
 * iOS frosted glassmorphism + full AR/EN i18n
 */

"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain, Sparkles, Search, Code2, Wand2, Shield, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, Clock, AlertTriangle, Copy, ExternalLink,
  BookOpen, Users, Languages, Calendar, Tag, FileText, Loader2, Database,
  Layers, BarChart3, RefreshCw, ThumbsUp, ThumbsDown, History, Zap, Info,
  ChevronLeft
} from "lucide-react";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const API = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c`;
const headers = { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` };

// ─── Colors ──────────────────────────────────────────────────────
const C = {
  bg: "rgba(15,23,42,0.6)",
  card: "rgba(30,41,59,0.55)",
  cardBorder: "rgba(59,130,246,0.12)",
  accent: "#3b82f6",
  accentDim: "rgba(59,130,246,0.7)",
  accentBg: "rgba(59,130,246,0.08)",
  accentBorder: "rgba(59,130,246,0.2)",
  text: "#f1f5f9",
  textMuted: "rgba(148,163,184,0.85)",
  success: "#34c759",
  successBg: "rgba(52,199,89,0.08)",
  successBorder: "rgba(52,199,89,0.2)",
  danger: "#ff3b30",
  dangerBg: "rgba(255,59,48,0.08)",
  dangerBorder: "rgba(255,59,48,0.2)",
  warning: "#ff9500",
  warningBg: "rgba(255,149,0,0.08)",
  warningBorder: "rgba(255,149,0,0.2)",
  purple: "#a855f7",
  purpleBg: "rgba(168,85,247,0.08)",
  purpleBorder: "rgba(168,85,247,0.2)",
  emerald: "#10b981",
  emeraldBg: "rgba(16,185,129,0.08)",
  input: "rgba(30,41,59,0.7)",
  inputBorder: "rgba(59,130,246,0.15)",
};

// ─── Phase config ────────────────────────────────────────────────
const PHASES = [
  { id: "phase1", icon: Sparkles, color: C.accent, bgColor: C.accentBg, borderColor: C.accentBorder },
  { id: "phase2", icon: Layers, color: C.warning, bgColor: C.warningBg, borderColor: C.warningBorder },
  { id: "phase3", icon: Search, color: C.emerald, bgColor: C.emeraldBg, borderColor: "rgba(16,185,129,0.2)" },
  { id: "phase4", icon: Code2, color: C.purple, bgColor: C.purpleBg, borderColor: C.purpleBorder },
  { id: "phase5", icon: Wand2, color: C.success, bgColor: C.successBg, borderColor: C.successBorder },
] as const;

const NL_EXAMPLES = [
  "Arabic books about irrigation before 1950 held in Baghdad",
  "كتب عربية عن الري قبل 1950 في بغداد",
  "Show all English manuscripts about astronomy",
  "Islamic philosophy texts published in Cairo",
  "Works by Iraqi authors about water management",
];

const SPARQL_EXAMPLES = [
  "Show all works about irrigation by Iraqi authors",
  "Find books published before 1900 in Arabic",
  "List all works with subject heading 'Islamic art'",
  "Find contributions by authors from Baghdad",
];

// ─── Helpers ─────────────────────────────────────────────────────
function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.8 ? C.success : value >= 0.6 ? C.warning : C.danger;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
      {pct}%
    </span>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl ${className}`} style={{
      background: C.card,
      border: `1px solid ${C.cardBorder}`,
      backdropFilter: "blur(30px) saturate(180%)",
      WebkitBackdropFilter: "blur(30px) saturate(180%)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2), 0 8px 24px rgba(59,130,246,0.06), inset 0 1px 0 rgba(255,255,255,0.03)",
    }}>
      {children}
    </div>
  );
}

function GlassInput({ value, onChange, placeholder, multiline = false, dir }: {
  value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean; dir?: string;
}) {
  const style = {
    background: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.text,
    backdropFilter: "blur(10px)",
  };
  const cls = "w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all";
  return multiline ? (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      rows={3} className={cls} style={style} dir={dir} />
  ) : (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={cls} style={style} dir={dir} />
  );
}

function ActionButton({ onClick, loading, children, color = C.accent }: {
  onClick: () => void; loading: boolean; children: React.ReactNode; color?: string;
}) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
      style={{ background: `${color}20`, border: `1px solid ${color}40`, color }}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

function SectionTag({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3" style={{ color }}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </div>
  );
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard"));
}

// ═══════════════════════════════════════════════════════════
// Phase 1: AI Metadata Suggestions
// ═══════════════════════════════════════════════════════════
function Phase1Panel({ t }: { t: any }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("");
  const [abstract, setAbstract] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = useCallback(async () => {
    if (!title && !author && !isbn) { toast.error("Enter at least a title, author, or ISBN"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/suggest-metadata`, {
        method: "POST", headers,
        body: JSON.stringify({ title, author, isbn, publisher, abstract }),
      });
      if (!res.ok) throw new Error((await res.json()).error || res.statusText);
      setResult(await res.json());
      toast.success("Metadata suggestions generated");
    } catch (err: any) {
      console.error("Phase 1 error:", err);
      toast.error(`AI error: ${err.message}`);
    } finally { setLoading(false); }
  }, [title, author, isbn, publisher, abstract]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <GlassInput value={title} onChange={setTitle} placeholder={t("ai.enterTitle")} />
        <GlassInput value={author} onChange={setAuthor} placeholder={t("ai.enterAuthor")} />
        <GlassInput value={isbn} onChange={setIsbn} placeholder={t("ai.enterISBN")} />
        <GlassInput value={publisher} onChange={setPublisher} placeholder={t("ai.enterPublisher")} />
      </div>
      <GlassInput value={abstract} onChange={setAbstract} placeholder={t("ai.enterAbstract")} multiline />
      <ActionButton onClick={analyze} loading={loading}><Sparkles className="h-4 w-4" /> {t("ai.analyze")}</ActionButton>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-4">
          {/* Subjects */}
          {result.suggestedSubjects?.length > 0 && (
            <div>
              <SectionTag icon={Tag} label={t("ai.subjects")} color={C.accent} />
              <div className="flex flex-wrap gap-2">
                {result.suggestedSubjects.map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                    style={{ background: C.accentBg, border: `1px solid ${C.accentBorder}`, color: C.text }}>
                    {s.label} <ConfidenceBadge value={s.confidence} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Genre */}
          {result.suggestedGenre?.length > 0 && (
            <div>
              <SectionTag icon={BookOpen} label={t("ai.genres")} color={C.purple} />
              <div className="flex flex-wrap gap-2">
                {result.suggestedGenre.map((g: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                    style={{ background: C.purpleBg, border: `1px solid ${C.purpleBorder}`, color: C.text }}>
                    {g.label} <ConfidenceBadge value={g.confidence} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Relator Roles */}
          {result.suggestedRelatorRoles?.length > 0 && (
            <div>
              <SectionTag icon={Users} label={t("ai.relatorRoles")} color={C.warning} />
              <div className="flex flex-wrap gap-2">
                {result.suggestedRelatorRoles.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                    style={{ background: C.warningBg, border: `1px solid ${C.warningBorder}`, color: C.text }}>
                    {r.label} {r.source && <span className="text-[10px] opacity-60">({r.source})</span>}
                    <ConfidenceBadge value={r.confidence} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Language + Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.detectedLanguage && (
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.emeraldBg, border: `1px solid rgba(16,185,129,0.2)` }}>
                <Languages className="h-5 w-5" style={{ color: C.emerald }} />
                <div>
                  <div className="text-xs font-bold" style={{ color: C.emerald }}>{t("ai.language")}</div>
                  <div className="text-sm" style={{ color: C.text }}>{result.detectedLanguage.label} ({result.detectedLanguage.code})</div>
                </div>
                <ConfidenceBadge value={result.detectedLanguage.confidence} />
              </div>
            )}
            {result.extractedYear && (
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.warningBg, border: `1px solid ${C.warningBorder}` }}>
                <Calendar className="h-5 w-5" style={{ color: C.warning }} />
                <div>
                  <div className="text-xs font-bold" style={{ color: C.warning }}>{t("ai.year")}</div>
                  <div className="text-sm" style={{ color: C.text }}>{result.extractedYear.year}</div>
                </div>
                <ConfidenceBadge value={result.extractedYear.confidence} />
              </div>
            )}
          </div>

          {/* Summary */}
          {result.generatedSummary && (
            <div>
              <SectionTag icon={FileText} label={t("ai.summary")} color={C.accentDim} />
              <div className="p-3 rounded-xl text-sm leading-relaxed" style={{ background: C.accentBg, border: `1px solid ${C.accentBorder}`, color: C.text }}>
                {result.generatedSummary}
              </div>
            </div>
          )}

          {/* Authority Candidates */}
          {result.authorityCandidates?.length > 0 && (
            <div>
              <SectionTag icon={Database} label={t("ai.authorities")} color={C.success} />
              <div className="space-y-1.5">
                {result.authorityCandidates.map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg"
                    style={{ background: C.successBg, border: `1px solid ${C.successBorder}` }}>
                    <span className="text-sm" style={{ color: C.text }}>{a.label}</span>
                    <ConfidenceBadge value={a.confidence} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Phase 2: Duplicate Detection
// ═══════════════════════════════════════════════════════════
function Phase2Panel({ t }: { t: any }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[] | null>(null);

  const detect = useCallback(async () => {
    if (!title) { toast.error("Title is required"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/detect-duplicates`, {
        method: "POST", headers,
        body: JSON.stringify({ title, author, isbn }),
      });
      if (!res.ok) throw new Error((await res.json()).error || res.statusText);
      const data = await res.json();
      setCandidates(data.candidates || []);
      toast.success(`Found ${(data.candidates || []).length} candidate(s)`);
    } catch (err: any) {
      console.error("Phase 2 error:", err);
      toast.error(`AI error: ${err.message}`);
    } finally { setLoading(false); }
  }, [title, author, isbn]);

  const mergeColor = (rec: string) => rec === "Auto-Merge" ? C.success : rec === "Review Required" ? C.warning : C.danger;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <GlassInput value={title} onChange={setTitle} placeholder={t("ai.enterTitle")} />
        <GlassInput value={author} onChange={setAuthor} placeholder={t("ai.enterAuthor")} />
        <GlassInput value={isbn} onChange={setIsbn} placeholder={t("ai.enterISBN")} />
      </div>
      <ActionButton onClick={detect} loading={loading} color={C.warning}>
        <Layers className="h-4 w-4" /> {loading ? t("ai.detecting") : t("ai.analyze")}
      </ActionButton>

      {candidates !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mt-4">
          {candidates.length === 0 ? (
            <div className="text-center py-8 rounded-xl" style={{ background: C.successBg, border: `1px solid ${C.successBorder}` }}>
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2" style={{ color: C.success }} />
              <p className="text-sm font-semibold" style={{ color: C.success }}>{t("ai.noCandidates")}</p>
            </div>
          ) : (
            candidates.map((c, i) => (
              <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: C.card, border: `1px solid ${mergeColor(c.mergeRecommendation)}40` }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: C.text }}>{c.candidateTitle || c.candidateId}</span>
                  <ConfidenceBadge value={c.similarityScore} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase" style={{ color: C.textMuted }}>{t("ai.mergeRec")}:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: `${mergeColor(c.mergeRecommendation)}15`, color: mergeColor(c.mergeRecommendation) }}>
                    {c.mergeRecommendation}
                  </span>
                </div>
                {c.matchReasons?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {c.matchReasons.map((r: string, j: number) => (
                      <span key={j} className="px-2 py-0.5 rounded text-[10px]" style={{ background: C.accentBg, color: C.accentDim }}>
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Phase 3: Natural Language Discovery
// ═══════════════════════════════════════════════════════════
function Phase3Panel({ t, language }: { t: any; language: string }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const search = useCallback(async () => {
    if (!query.trim()) { toast.error("Enter a query"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/natural-search`, {
        method: "POST", headers,
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error((await res.json()).error || res.statusText);
      setResult(await res.json());
      toast.success("Query parsed successfully");
    } catch (err: any) {
      console.error("Phase 3 error:", err);
      toast.error(`AI error: ${err.message}`);
    } finally { setLoading(false); }
  }, [query]);

  return (
    <div className="space-y-4">
      <GlassInput value={query} onChange={setQuery} placeholder={t("ai.enterQuery")} dir={language === "ar" ? "rtl" : "ltr"} />
      
      {/* Example queries */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] font-bold uppercase py-1" style={{ color: C.textMuted }}>{t("ai.exampleQueries")}:</span>
        {NL_EXAMPLES.slice(0, 3).map((ex, i) => (
          <button key={i} onClick={() => setQuery(ex)}
            className="px-2.5 py-1 rounded-lg text-[11px] transition-all hover:scale-105"
            style={{ background: C.emeraldBg, border: `1px solid rgba(16,185,129,0.2)`, color: C.emerald }}>
            {ex.length > 40 ? ex.slice(0, 40) + "..." : ex}
          </button>
        ))}
      </div>
      
      <ActionButton onClick={search} loading={loading} color={C.emerald}>
        <Search className="h-4 w-4" /> {t("ai.search")}
      </ActionButton>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <SectionTag icon={Database} label={t("ai.structuredQuery")} color={C.emerald} />
          <div className="rounded-xl overflow-hidden" style={{ background: "rgba(15,23,42,0.8)", border: `1px solid rgba(16,185,129,0.2)` }}>
            <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: `1px solid rgba(16,185,129,0.1)` }}>
              <span className="text-[10px] font-bold uppercase" style={{ color: C.emerald }}>JSON</span>
              <button onClick={() => copyToClipboard(JSON.stringify(result, null, 2))} className="text-[10px] flex items-center gap-1" style={{ color: C.textMuted }}>
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
            <pre className="p-4 text-xs overflow-auto max-h-64" style={{ color: C.text }} dir="ltr">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Phase 4: SPARQL Translator
// ═══════════════════════════════════════════════════════════
function Phase4Panel({ t, language }: { t: any; language: string }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const translate = useCallback(async () => {
    if (!query.trim()) { toast.error("Enter a query"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/sparql-translate`, {
        method: "POST", headers,
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error((await res.json()).error || res.statusText);
      setResult(await res.json());
      toast.success("SPARQL generated");
    } catch (err: any) {
      console.error("Phase 4 error:", err);
      toast.error(`AI error: ${err.message}`);
    } finally { setLoading(false); }
  }, [query]);

  return (
    <div className="space-y-4">
      <GlassInput value={query} onChange={setQuery} placeholder={t("ai.enterSparql")} dir={language === "ar" ? "rtl" : "ltr"} />
      
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] font-bold uppercase py-1" style={{ color: C.textMuted }}>{t("ai.exampleQueries")}:</span>
        {SPARQL_EXAMPLES.slice(0, 3).map((ex, i) => (
          <button key={i} onClick={() => setQuery(ex)}
            className="px-2.5 py-1 rounded-lg text-[11px] transition-all hover:scale-105"
            style={{ background: C.purpleBg, border: `1px solid ${C.purpleBorder}`, color: C.purple }}>
            {ex.length > 40 ? ex.slice(0, 40) + "..." : ex}
          </button>
        ))}
      </div>

      <ActionButton onClick={translate} loading={loading} color={C.purple}>
        <Code2 className="h-4 w-4" /> {t("ai.translate")}
      </ActionButton>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Safety Badge */}
          <div className="flex items-center gap-2">
            {result.isSafe ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: C.successBg, border: `1px solid ${C.successBorder}`, color: C.success }}>
                <CheckCircle2 className="h-3.5 w-3.5" /> {t("ai.safe")}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, color: C.danger }}>
                <XCircle className="h-3.5 w-3.5" /> {t("ai.unsafe")}
              </span>
            )}
          </div>

          {/* Explanation */}
          {result.explanation && (
            <div className="p-3 rounded-xl text-sm" style={{ background: C.purpleBg, border: `1px solid ${C.purpleBorder}`, color: C.text }}>
              <span className="text-xs font-bold" style={{ color: C.purple }}>{t("ai.explanation")}:</span> {result.explanation}
            </div>
          )}

          {/* SPARQL Query */}
          <div className="rounded-xl overflow-hidden" style={{ background: "rgba(15,23,42,0.8)", border: `1px solid ${C.purpleBorder}` }}>
            <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.purpleBorder}` }}>
              <span className="text-[10px] font-bold uppercase" style={{ color: C.purple }}>SPARQL</span>
              <button onClick={() => copyToClipboard(result.sparqlQuery)} className="text-[10px] flex items-center gap-1" style={{ color: C.textMuted }}>
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
            <pre className="p-4 text-xs overflow-auto max-h-64 whitespace-pre-wrap" style={{ color: "#93c5fd" }} dir="ltr">
              {result.sparqlQuery}
            </pre>
          </div>

          {/* Warnings */}
          {result.warnings?.length > 0 && (
            <div className="space-y-1.5">
              {result.warnings.map((w: string, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg text-xs"
                  style={{ background: C.warningBg, border: `1px solid ${C.warningBorder}`, color: C.warning }}>
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {w}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Phase 5: AI Auto Fill
// ═══════════════════════════════════════════════════════════
function Phase5Panel({ t }: { t: any }) {
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fill = useCallback(async () => {
    if (!isbn && !title) { toast.error("Enter an ISBN or title"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/autofill`, {
        method: "POST", headers,
        body: JSON.stringify({ isbn, title }),
      });
      if (!res.ok) throw new Error((await res.json()).error || res.statusText);
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
        <GlassInput value={isbn} onChange={setIsbn} placeholder={t("ai.enterISBN")} />
        <GlassInput value={title} onChange={setTitle} placeholder={t("ai.enterTitle")} />
      </div>
      <ActionButton onClick={fill} loading={loading} color={C.success}>
        <Wand2 className="h-4 w-4" /> {t("ai.autoFill")}
      </ActionButton>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-4">
          {/* Source + Confidence */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold" style={{ color: C.textMuted }}>{t("ai.source")}:</span>
            {(result.sources || [result.source || "AI"]).map((s: string, i: number) => (
              <span key={i} className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: C.successBg, color: C.success }}>
                {s}
              </span>
            ))}
            {result.confidence && <ConfidenceBadge value={result.confidence} />}
          </div>

          {/* Mapped Fields */}
          {result.mappedFields && (
            <div>
              <SectionTag icon={CheckCircle2} label={t("ai.mappedFields")} color={C.success} />
              <div className="rounded-xl overflow-hidden" style={{ background: "rgba(15,23,42,0.8)", border: `1px solid ${C.successBorder}` }}>
                <pre className="p-4 text-xs overflow-auto max-h-80" style={{ color: C.text }} dir="ltr">
                  {JSON.stringify(result.mappedFields, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* BIBFRAME Triples */}
          {result.bibframeTriples?.length > 0 && (
            <div>
              <SectionTag icon={Layers} label={t("ai.bibframeTriples")} color={C.accent} />
              <div className="space-y-1.5">
                {result.bibframeTriples.map((triple: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg text-xs"
                    style={{ background: C.accentBg, border: `1px solid ${C.accentBorder}` }}>
                    <span className="font-mono font-bold" style={{ color: C.accent }}>{triple.predicate}</span>
                    <span style={{ color: C.text }}>{typeof triple.value === 'string' ? triple.value : JSON.stringify(triple.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unmapped Fields */}
          {result.unmappedFields?.length > 0 && (
            <div>
              <SectionTag icon={AlertTriangle} label={t("ai.unmappedFields")} color={C.warning} />
              <div className="flex flex-wrap gap-1.5">
                {result.unmappedFields.map((f: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[10px]" style={{ background: C.warningBg, color: C.warning, border: `1px solid ${C.warningBorder}` }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Audit Log Panel
// ═══════════════════════════════════════════════════════════
function AuditLogPanel({ t }: { t: any }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/audit-log?limit=50`, { headers });
      if (!res.ok) throw new Error((await res.json()).error || res.statusText);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err: any) {
      console.error("Audit log error:", err);
      toast.error(`Error: ${err.message}`);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const updateApproval = async (id: string, approved: boolean) => {
    try {
      await fetch(`${API}/ai/audit/${id}/approve`, {
        method: "POST", headers,
        body: JSON.stringify({ approved }),
      });
      setEntries(prev => prev.map(e => e.id === id ? { ...e, approved } : e));
      toast.success(approved ? "Approved" : "Rejected");
    } catch (err: any) { toast.error(err.message); }
  };

  const phaseLabel = (p: string) => {
    if (p.includes("phase1")) return "Phase 1";
    if (p.includes("phase2")) return "Phase 2";
    if (p.includes("phase3")) return "Phase 3";
    if (p.includes("phase4")) return "Phase 4";
    if (p.includes("phase5")) return "Phase 5";
    return p;
  };

  const phaseColor = (p: string) => {
    if (p.includes("phase1")) return C.accent;
    if (p.includes("phase2")) return C.warning;
    if (p.includes("phase3")) return C.emerald;
    if (p.includes("phase4")) return C.purple;
    if (p.includes("phase5")) return C.success;
    return C.textMuted;
  };

  // Stats
  const total = entries.length;
  const approved = entries.filter(e => e.approved === true).length;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const avgTime = total > 0 ? Math.round(entries.reduce((s, e) => s + (e.processingTimeMs || 0), 0) / total) : 0;

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t("ai.totalInteractions"), value: total, color: C.accent, icon: BarChart3 },
          { label: t("ai.approvalRate"), value: `${approvalRate}%`, color: C.success, icon: ThumbsUp },
          { label: t("ai.avgProcessingTime"), value: `${avgTime}ms`, color: C.purple, icon: Zap },
        ].map((stat, i) => (
          <div key={i} className="p-3 rounded-xl text-center" style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}20` }}>
            <stat.icon className="h-4 w-4 mx-auto mb-1" style={{ color: stat.color }} />
            <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[10px]" style={{ color: C.textMuted }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: C.text }}>{t("ai.auditLog")}</span>
        <button onClick={load} className="p-2 rounded-lg transition-all" style={{ color: C.textMuted }}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-sm" style={{ color: C.textMuted }}>{t("ai.noResults")}</div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-xl overflow-hidden transition-all"
              style={{ background: C.card, border: `1px solid ${phaseColor(entry.featurePhase)}20` }}>
              <button onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                className="w-full px-4 py-3 flex items-center gap-3 text-start">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold" style={{ background: `${phaseColor(entry.featurePhase)}15`, color: phaseColor(entry.featurePhase) }}>
                  {phaseLabel(entry.featurePhase)}
                </span>
                <span className="text-xs flex-1 truncate" style={{ color: C.text }}>
                  {typeof entry.input === 'object' ? (entry.input.title || entry.input.query || entry.input.isbn || JSON.stringify(entry.input).slice(0, 60)) : String(entry.input).slice(0, 60)}
                </span>
                <span className="text-[10px]" style={{ color: C.textMuted }}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                {entry.approved === true && <CheckCircle2 className="h-3.5 w-3.5" style={{ color: C.success }} />}
                {entry.approved === false && <XCircle className="h-3.5 w-3.5" style={{ color: C.danger }} />}
                {entry.approved === null && <Clock className="h-3.5 w-3.5" style={{ color: C.textMuted }} />}
                <span className="text-[10px]" style={{ color: C.textMuted }}>{entry.processingTimeMs}ms</span>
                {expandedId === entry.id ? <ChevronDown className="h-3 w-3" style={{ color: C.textMuted }} /> : <ChevronRight className="h-3 w-3" style={{ color: C.textMuted }} />}
              </button>

              <AnimatePresence>
                {expandedId === entry.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                      <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <div className="text-[10px] font-bold uppercase mb-1" style={{ color: C.textMuted }}>Input</div>
                          <pre className="p-2 rounded-lg text-[10px] overflow-auto max-h-40" style={{ background: C.input, color: C.text }} dir="ltr">
                            {JSON.stringify(entry.input, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase mb-1" style={{ color: C.textMuted }}>Output</div>
                          <pre className="p-2 rounded-lg text-[10px] overflow-auto max-h-40" style={{ background: C.input, color: C.text }} dir="ltr">
                            {JSON.stringify(entry.output, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateApproval(entry.id, true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ background: C.successBg, border: `1px solid ${C.successBorder}`, color: C.success }}>
                          <ThumbsUp className="h-3 w-3" /> {t("ai.approve")}
                        </button>
                        <button onClick={() => updateApproval(entry.id, false)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, color: C.danger }}>
                          <ThumbsDown className="h-3 w-3" /> {t("ai.reject")}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Principles Panel
// ═══════════════════════════════════════════════════════════
function PrinciplesPanel({ t }: { t: any }) {
  const principles = [
    { key: "ai.principleAssistive", icon: Brain, color: C.accent },
    { key: "ai.principleNoMutate", icon: Shield, color: C.danger },
    { key: "ai.principleLogged", icon: History, color: C.purple },
    { key: "ai.principleSeparate", icon: Database, color: C.emerald },
    { key: "ai.principleAuthority", icon: ExternalLink, color: C.warning },
    { key: "ai.principleNoHallucinate", icon: AlertTriangle, color: C.danger },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {principles.map((p, i) => (
        <div key={i} className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: `${p.color}06`, border: `1px solid ${p.color}18` }}>
          <p.icon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: p.color }} />
          <span className="text-sm leading-relaxed" style={{ color: C.text }}>{t(p.key)}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function EnterpriseAIEngine({ onBack }: { onBack?: () => void }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const isRtl = language === "ar";
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(["phase1"]));
  const [showPrinciples, setShowPrinciples] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [keyDebug, setKeyDebug] = useState<any>(null);

  const checkApiKey = async () => {
    try {
      const res = await fetch(`${API}/ai/debug-key`, { headers });
      const data = await res.json();
      setKeyDebug(data);
      console.log("[AI DEBUG] Key status:", data);
      if (data.configured) {
        toast.success(`API Key ready: ${data.keyPrefix} (${data.keyLength} chars)`);
      } else {
        toast.error(`API Key not configured: ${data.status}`);
      }
    } catch (err: any) {
      console.error("[AI DEBUG] Error:", err);
      toast.error(`Debug check failed: ${err.message}`);
    }
  };

  // Auto-check on mount
  useEffect(() => {
    checkApiKey();
  }, []);

  const togglePhase = (id: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen" style={{ direction: isRtl ? "rtl" : "ltr" }} dir={isRtl ? "rtl" : "ltr"}>
      {/* Background */}
      <div className="fixed inset-0 -z-10" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(16,185,129,0.05) 0%, transparent 50%)",
        }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            {onBack && (
              <button onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 absolute left-4 top-4 z-10"
                style={{ background: C.card, border: `1px solid ${C.accentBorder}`, color: C.text, backdropFilter: "blur(20px)" }}>
                <ChevronLeft className="h-4 w-4" />
                {t("back")}
              </button>
            )}
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(168,85,247,0.2))", border: `1px solid ${C.accentBorder}` }}>
              <Brain className="h-6 w-6" style={{ color: C.accent }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: C.text }}>{t("ai.title")}</h1>
              <p className="text-sm" style={{ color: C.textMuted }}>{t("ai.subtitle")}</p>
            </div>
          </div>

          {/* Top Controls */}
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setShowPrinciples(!showPrinciples)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: showPrinciples ? C.accentBg : "transparent", border: `1px solid ${C.accentBorder}`, color: C.accent }}>
              <Shield className="h-3.5 w-3.5" /> {t("ai.principles")}
            </button>
            <button onClick={() => setShowAudit(!showAudit)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: showAudit ? C.purpleBg : "transparent", border: `1px solid ${C.purpleBorder}`, color: C.purple }}>
              <History className="h-3.5 w-3.5" /> {t("ai.auditLog")}
            </button>
            <button onClick={checkApiKey}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: "transparent", border: `1px solid ${C.warningBorder}`, color: C.warning }}>
              <Zap className="h-3.5 w-3.5" /> Check API Key
            </button>
          </div>
          {keyDebug && (
            <div className="mt-2 p-3 rounded-xl text-xs" style={{ background: C.card, border: `1px solid ${keyDebug.configured ? C.successBorder : C.dangerBorder}`, color: C.text }}>
              <span className="font-bold" style={{ color: keyDebug.configured ? C.success : C.danger }}>
                {keyDebug.configured ? "✓ Key Ready" : "✗ Key Not Configured"}
              </span>
              {" — "}{keyDebug.status} | {keyDebug.keyPrefix} ({keyDebug.keyLength} chars)
            </div>
          )}
        </div>

        {/* Principles */}
        <AnimatePresence>
          {showPrinciples && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <GlassCard className="p-5">
                <PrinciplesPanel t={t} />
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audit Log */}
        <AnimatePresence>
          {showAudit && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <GlassCard className="p-5">
                <AuditLogPanel t={t} />
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase Panels */}
        <div className="space-y-3">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            const expanded = expandedPhases.has(phase.id);
            const phaseNum = phase.id.replace("phase", "");
            const titleKey = `ai.phase${phaseNum}` as const;
            const descKey = `ai.phase${phaseNum}Desc` as const;

            return (
              <GlassCard key={phase.id}>
                <button onClick={() => togglePhase(phase.id)}
                  className="w-full px-6 py-5 flex items-center gap-4 transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: phase.bgColor, border: `1px solid ${phase.borderColor}` }}>
                    <Icon className="h-5 w-5" style={{ color: phase.color }} />
                  </div>
                  <div className="flex-1 text-start">
                    <h3 className="text-sm font-bold" style={{ color: C.text }}>{t(titleKey)}</h3>
                    <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>{t(descKey)}</p>
                  </div>
                  <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-5 w-5" style={{ color: C.textMuted }} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                        <div className="pt-5">
                          {phase.id === "phase1" && <Phase1Panel t={t} />}
                          {phase.id === "phase2" && <Phase2Panel t={t} />}
                          {phase.id === "phase3" && <Phase3Panel t={t} language={language} />}
                          {phase.id === "phase4" && <Phase4Panel t={t} language={language} />}
                          {phase.id === "phase5" && <Phase5Panel t={t} />}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-[11px]" style={{ color: C.textMuted }}>
            Enterprise AI Layer v3.0 — BIBFRAME Union Catalog Intelligence
          </p>
          <p className="text-[10px] mt-1" style={{ color: `${C.textMuted}80` }}>
            Comparable in architecture ambition to OCLC & Europeana
          </p>
        </div>
      </div>
    </div>
  );
}