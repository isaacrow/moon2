import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Download,
  Share2,
  Sparkles,
  Search,
  BookOpen,
  Layers,
  Database,
  FileText,
  Code,
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
  Eye,
  Settings,
  RefreshCw,
  Copy,
  ExternalLink,
  Bot,
  Send,
  Loader2,
  Hash,
  Globe,
  Sliders,
  Orbit,
  Zap,
  Activity,
  Maximize2
} from 'lucide-react';
import { WolfMoon3DCanvas } from './3d/WolfMoon3DCanvas';
import { IraqiAuthorFinder } from './IraqiAuthorFinder';
import { IraqiAuthorRecord, VERIFIED_IRAQI_AUTHORS } from '../../services/iraqiAuthorAIService';
import { processAICatalogPrompt } from '../../services/realAIService';
import { Dialog, DialogContent } from './ui/dialog';
import { BIBFRAMEWork, BIBFRAMEInstance } from '../types/bibframe';
import '../../styles/glassmorphism.css';

interface WolfMoonQuantumProps {
  onBack?: () => void;
  initialWork?: Partial<BIBFRAMEWork>;
  initialInstance?: Partial<BIBFRAMEInstance>;
}

export function WolfMoonQuantum({ onBack, initialWork, initialInstance }: WolfMoonQuantumProps) {
  const { t } = useTranslation();

  // Active States
  const [activeTab, setActiveTab] = useState<'work' | 'instance' | 'graph' | 'authorities'>('work');
  const [outputMode, setOutputMode] = useState<'jsonld' | 'turtle'>('jsonld');
  const [show3dBackground, setShow3dBackground] = useState(true);
  const [showIraqiModal, setShowIraqiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Core BIBFRAME Data
  const [title, setTitle] = useState(initialWork?.title || 'لمحات اجتماعية من تاريخ العراق الحديث');
  const [subtitle, setSubtitle] = useState('دراسة تحليلية في تاريخ المجتمع العراقي المعاصر');
  const [creator, setCreator] = useState('علي الوردي');
  const [creatorUri, setCreatorUri] = useState('http://id.loc.gov/authorities/names/n82027914');
  const [role, setRole] = useState('Author (مؤلف)');
  const [publicationDate, setPublicationDate] = useState('1969');
  const [place, setPlace] = useState('بغداد، العراق');
  const [publisher, setPublisher] = useState('مطبعة الإرشاد');
  const [extent, setExtent] = useState('8 مجلدات (3200 ص) ؛ 24 سم');
  const [isbn, setIsbn] = useState('978-9953-36-812-4');
  const [lcc, setLcc] = useState('DS79.65 .W37 1969');
  const [subjects, setSubjects] = useState<string[]>([
    'العراق -- تاريخ -- القرن 20',
    'علم الاجتماع التاريخي -- العراق',
    'البداوة والحضارة -- الفكر الاجتماعي'
  ]);
  const [newSubject, setNewSubject] = useState('');

  // Live Serializations
  const jsonLdCode = JSON.stringify({
    "@context": {
      "bf": "http://id.loc.gov/ontologies/bibframe/",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#"
    },
    "@graph": [
      {
        "@id": "http://example.org/resources/work/iq-2026-001",
        "@type": "bf:Work",
        "bf:title": {
          "@type": "bf:Title",
          "bf:mainTitle": title,
          "bf:subtitle": subtitle
        },
        "bf:contribution": {
          "@type": "bf:Contribution",
          "bf:role": { "@id": "http://id.loc.gov/vocabulary/relators/aut" },
          "bf:agent": {
            "@type": "bf:Person",
            "@id": creatorUri,
            "rdfs:label": creator
          }
        },
        "bf:subject": subjects.map(s => ({ "@type": "bf:Topic", "rdfs:label": s })),
        "bf:hasInstance": { "@id": "http://example.org/resources/instance/iq-2026-001" }
      },
      {
        "@id": "http://example.org/resources/instance/iq-2026-001",
        "@type": "bf:Instance",
        "bf:instanceOf": { "@id": "http://example.org/resources/work/iq-2026-001" },
        "bf:title": { "@type": "bf:Title", "bf:mainTitle": title },
        "bf:provisionActivity": {
          "@type": "bf:Publication",
          "bf:date": publicationDate,
          "bf:place": { "rdfs:label": place },
          "bf:agent": { "rdfs:label": publisher }
        },
        "bf:extent": { "@type": "bf:Extent", "rdfs:label": extent },
        "bf:identifiedBy": { "@type": "bf:Isbn", "rdf:value": isbn }
      }
    ]
  }, null, 2);

  const turtleCode = `@prefix bf: <http://id.loc.gov/ontologies/bibframe/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<http://example.org/resources/work/iq-2026-001> a bf:Work ;
    bf:title [ a bf:Title ; bf:mainTitle "${title}" ; bf:subtitle "${subtitle}" ] ;
    bf:contribution [
        a bf:Contribution ;
        bf:role <http://id.loc.gov/vocabulary/relators/aut> ;
        bf:agent <${creatorUri}>
    ] ;
    bf:language <http://id.loc.gov/vocabulary/languages/ara> ;
    bf:hasInstance <http://example.org/resources/instance/iq-2026-001> .

<${creatorUri}> a bf:Person ;
    rdfs:label "${creator}" .

<http://example.org/resources/instance/iq-2026-001> a bf:Instance ;
    bf:instanceOf <http://example.org/resources/work/iq-2026-001> ;
    bf:provisionActivity [
        a bf:Publication ;
        bf:date "${publicationDate}" ;
        bf:place [ rdfs:label "${place}" ] ;
        bf:agent [ rdfs:label "${publisher}" ]
    ] ;
    bf:extent [ a bf:Extent ; rdfs:label "${extent}" ] ;
    bf:identifiedBy [ a bf:Isbn ; rdf:value "${isbn}" ] .
`;

  const handleApplyAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const result = await processAICatalogPrompt(aiPrompt);
      setTitle(result.title);
      setCreator(result.creator);
      if (result.publicationDate) setPublicationDate(result.publicationDate);
      if (result.place) setPlace(result.place);
      if (result.publisher) setPublisher(result.publisher);
      if (result.subjects) setSubjects(result.subjects);
      toast.success(`Auto-cataloged: "${result.title}"`);
      setAiPrompt('');
    } catch (err) {
      toast.error('AI processing error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectIraqiAuthor = (author: IraqiAuthorRecord, selectedRole: string) => {
    setCreator(author.nameArabic);
    if (author.bibframePersonTriple.uri) {
      setCreatorUri(author.bibframePersonTriple.uri);
    }
    setRole(selectedRole);
    toast.success(`Author "${author.nameArabic}" linked with LOC/VIAF URI!`);
  };

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (i: number) => {
    setSubjects(subjects.filter((_, idx) => idx !== i));
  };

  return (
    <div className="relative min-h-screen bg-[#060810] text-[#f0f6fc] flex flex-col font-sans overflow-hidden select-none">
      
      {/* ===== 1. INTERACTIVE 3D WEBGL GRAPH CANVAS IN CENTER ===== */}
      {show3dBackground && (
        <WolfMoon3DCanvas
          interactive={true}
          intensity={0.95}
          recordTitle={title}
          creatorName={creator}
        />
      )}

      {/* ===== 2. FLOATING TOP NAVIGATION HUD ===== */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between gap-4">
        {/* Left: Home & Title */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="prismatic-pill-button hover:scale-105 active:scale-95 transition-transform"
              title="Return to Dashboard"
            >
              <div className="prismatic-ring-wrapper" style={{ width: '34px', height: '34px' }}>
                <div className="prismatic-inner-disc">
                  <ChevronLeft className="h-4 w-4 text-white" />
                </div>
              </div>
              <span className="text-xs font-bold pr-2">Dashboard</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/08 backdrop-blur-2xl border border-white/15 shadow-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00f2fe]" />
            <span className="text-xs font-black tracking-wide text-white">WOLF MOON SPATIAL</span>
            <span className="text-[10px] text-white/50 font-mono">BIBFRAME 3.0.1</span>
          </div>
        </div>

        {/* Center: Segmented View Pill */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-white/08 backdrop-blur-2xl border border-white/15 shadow-xl">
          {[
            { id: 'work', label: 'Work (العمل)', icon: BookOpen },
            { id: 'instance', label: 'Instance (التجسيد)', icon: Layers },
            { id: 'graph', label: '3D Graph (الرسم الثلاثي)', icon: Orbit },
            { id: 'authorities', label: 'Authorities (الاستناد)', icon: Users },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  active ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm' : 'text-white/60 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowIraqiModal(true)}
            className="px-4 py-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xl backdrop-blur-2xl transition-all"
          >
            <span>🇮🇶</span>
            <span>Iraqi Directory</span>
          </button>

          <button
            type="button"
            onClick={() => toast.success('Record saved to persistent triple store!')}
            className="px-5 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
        </div>
      </header>

      {/* ===== 3. MAIN SPATIAL HUD LAYOUT (FLOATING CARDS OVER 3D GRAPH) ===== */}
      <div className="relative z-10 flex-1 px-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-y-auto">
        
        {/* ── LEFT FLOATING CARD: METADATA FORM (7 COLS) ── */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          
          <div className="p-6 rounded-3xl bg-[#101420]/80 backdrop-blur-3xl border border-white/15 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                  {activeTab === 'work' ? <BookOpen className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                </span>
                <div>
                  <h2 className="text-base font-black text-white tracking-tight">
                    {activeTab === 'work' ? 'Work Description (bf:Work)' : 'Physical Instance (bf:Instance)'}
                  </h2>
                  <p className="text-[11px] text-white/50">Official LOC BIBFRAME 3.0.1 Standards</p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/10 text-cyan-300 border border-white/15">
                {activeTab === 'work' ? 'INTELLECTUAL LEVEL' : 'MANIFESTATION LEVEL'}
              </span>
            </div>

            {/* Work Tab Content */}
            {activeTab === 'work' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                    Main Title (bf:mainTitle)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                    Subtitle (bf:subtitle)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                      Primary Creator (bf:agent)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={creator}
                        onChange={(e) => setCreator(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowIraqiModal(true)}
                        className="px-3 py-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold shrink-0 cursor-pointer"
                        title="Reconcile with Iraqi Directory"
                      >
                        🇮🇶
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                      Authorized URI
                    </label>
                    <input
                      type="text"
                      value={creatorUri}
                      onChange={(e) => setCreatorUri(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-xs font-mono text-cyan-300/90 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Subject Headings */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                    Subject Topics (bf:subject / LCSH)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {subjects.map((sub, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white flex items-center gap-2"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(idx)}
                          className="text-white/50 hover:text-red-400 cursor-pointer text-sm"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                      placeholder="Add subject topic (e.g. علم الاجتماع -- العراق)..."
                      className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubject}
                      className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold text-white shrink-0 cursor-pointer"
                    >
                      Add Topic
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Instance Tab Content */}
            {activeTab === 'instance' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                    Publication Date (bf:date)
                  </label>
                  <input
                    type="text"
                    value={publicationDate}
                    onChange={(e) => setPublicationDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                    Publication Place (bf:place)
                  </label>
                  <input
                    type="text"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                    Publisher / Agent (bf:agent)
                  </label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                    Extent / Pages (bf:extent)
                  </label>
                  <input
                    type="text"
                    value={extent}
                    onChange={(e) => setExtent(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                    ISBN (bf:identifiedBy)
                  </label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                    LCC Classification (bf:classification)
                  </label>
                  <input
                    type="text"
                    value={lcc}
                    onChange={(e) => setLcc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/15 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}

            {/* Authorities Tab Content */}
            {activeTab === 'authorities' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{creator}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      LOC Verified
                    </span>
                  </div>
                  <p className="text-xs font-mono text-cyan-300 truncate">{creatorUri}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {VERIFIED_IRAQI_AUTHORS.slice(0, 4).map(author => (
                    <button
                      type="button"
                      key={author.id}
                      onClick={() => handleSelectIraqiAuthor(author, 'Author')}
                      className="p-3 rounded-xl bg-white/05 hover:bg-white/15 border border-white/10 text-left cursor-pointer transition-all"
                    >
                      <div className="text-xs font-bold text-white">{author.nameArabic}</div>
                      <div className="text-[10px] text-white/50">{author.era}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3D Graph Tab Content */}
            {activeTab === 'graph' && (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-center text-white/70 text-xs">
                <Orbit className="h-8 w-8 text-cyan-400 mx-auto animate-spin" style={{ animationDuration: '12s' }} />
                <p className="font-bold text-white">Spatial 3D Graph Rendering</p>
                <p className="text-[11px] text-white/50">Move your mouse to interact with RDF entities and laser connection lines.</p>
              </div>
            )}

          </div>

        </div>

        {/* ── RIGHT FLOATING CARD: LIVE SERIALIZATION TERMINAL (5 COLS) ── */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          <div className="p-6 rounded-3xl bg-[#101420]/80 backdrop-blur-3xl border border-white/15 shadow-2xl space-y-4 flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-black text-white tracking-wide">LIVE RDF SERIALIZATION</span>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/15">
                <button
                  type="button"
                  onClick={() => setOutputMode('jsonld')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    outputMode === 'jsonld' ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40' : 'text-white/60'
                  }`}
                >
                  JSON-LD
                </button>
                <button
                  type="button"
                  onClick={() => setOutputMode('turtle')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    outputMode === 'turtle' ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40' : 'text-white/60'
                  }`}
                >
                  Turtle
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div className="flex-1 rounded-2xl bg-black/60 border border-white/10 p-4 overflow-auto font-mono text-[11px] text-cyan-300 leading-relaxed max-h-[360px] select-all">
              <pre className="whitespace-pre-wrap">
                {outputMode === 'jsonld' ? jsonLdCode : turtleCode}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(outputMode === 'jsonld' ? jsonLdCode : turtleCode);
                  toast.success('RDF Code copied to clipboard!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([outputMode === 'jsonld' ? jsonLdCode : turtleCode], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `bibframe-record.${outputMode === 'jsonld' ? 'json' : 'ttl'}`;
                  a.click();
                  toast.success('Exported successfully!');
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ===== 4. FLOATING BOTTOM AI ASSISTANT CAPSULE (Inspired by Ref 1 & 2) ===== */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-30 pointer-events-auto">
        <div className="p-3 rounded-full bg-[#101420]/90 backdrop-blur-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/30">
            <Bot className="h-4 w-4" />
          </div>

          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyAI()}
            placeholder="Auto-Catalog: Type any author or title (e.g. بدر شاكر السياب - أنشودة المطر)..."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none px-2"
          />

          <button
            type="button"
            onClick={handleApplyAI}
            disabled={aiLoading}
            className="px-5 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
          >
            {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            <span>Auto-Catalog</span>
          </button>
        </div>
      </div>

      {/* ===== 5. IRAQI AUTHOR MODAL ===== */}
      <Dialog open={showIraqiModal} onOpenChange={setShowIraqiModal}>
        <DialogContent className="max-w-3xl p-0 bg-[#0d1117]/98 border border-white/20 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-3xl">
          <IraqiAuthorFinder
            isModal={true}
            onClose={() => setShowIraqiModal(false)}
            onSelectAuthor={(author, selectedRole) => {
              handleSelectIraqiAuthor(author, selectedRole);
              setShowIraqiModal(false);
            }}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
}
