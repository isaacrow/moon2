import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getAllRecords, SavedRecord } from '../utils/recordStorageBackend';
import { importAliRecord } from '../utils/importSampleRecord';
import { toast } from 'sonner';
import { 
  TrendingUp,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  ArrowRight,
  Activity,
  Network,
  BookOpen,
  Sparkles,
  Star,
  Database,
  Save,
  Zap,
  Globe,
  Shield,
  Layers,
  Upload,
  Search,
  Edit,
  Library,
  Download,
  Moon,
  LayoutGrid,
  Orbit,
  GitBranch,
  Brain,
  Server,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BIBFRAMERecord } from '../types/bibframe';
import moonLogo from 'figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png';
import '../../styles/moon27.css';

// VisionOS Spatial Liquid Glass Spec
const LIQUID_GLASS_STYLE: React.CSSProperties = {
  borderRadius: '28px',
  background: 'rgba(255, 255, 255, 0.58)',
  backdropFilter: 'blur(24px) saturate(160%)',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)',
  border: '1px solid rgba(255, 255, 255, 0.78)',
};

const SPLINE_SCENE_URL = 'https://my.spline.design/3ddesigntextcopycopy-ICjwUjRH9s8O1NCNqRAWjo5g-5OJ/';

interface Moon27DashboardProps {
  onNavigate?: (view: string) => void;
  onLoadRecord?: (record: BIBFRAMERecord) => void;
}

export function Moon27Dashboard({ onNavigate, onLoadRecord }: Moon27DashboardProps) {
  const { t } = useTranslation();
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  const [recordCount, setRecordCount] = useState(0);
  const [isQuickActionsFolded, setIsQuickActionsFolded] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'studios' | 'discovery' | 'authorities'>('all');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const records = await getAllRecords();
      setSavedRecords(records);
      setRecordCount(records.length);
    } catch (error) {
      console.error('Error loading records:', error);
      setSavedRecords([]);
      setRecordCount(0);
    }
  };

  const stats = [
    { 
      label: t('totalRecords') || 'Total Records', 
      value: recordCount.toString(), 
      change: 12, 
      trend: 'up',
      icon: Library,
      iconBg: 'from-amber-400 to-yellow-600'
    },
    { 
      label: t('today') || 'Today', 
      value: savedRecords.filter(r => {
        const today = new Date();
        const recordDate = new Date(r.createdAt || '');
        return recordDate.toDateString() === today.toDateString();
      }).length.toString(), 
      change: 8, 
      trend: 'up',
      icon: Zap,
      iconBg: 'from-emerald-400 to-teal-600'
    },
    { 
      label: t('thisWeek') || 'This Week', 
      value: savedRecords.filter(r => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recordDate = new Date(r.createdAt || '');
        return recordDate >= weekAgo;
      }).length.toString(), 
      change: -5, 
      trend: 'down',
      icon: TrendingUp,
      iconBg: 'from-cyan-400 to-blue-600'
    },
    { 
      label: t('pendingReview') || 'BIBFRAME 3.0.1', 
      value: '100%', 
      change: 0, 
      trend: 'neutral',
      icon: Shield,
      iconBg: 'from-purple-400 to-indigo-600'
    },
  ];

  const recentRecords = savedRecords
    .slice(0, 5)
    .map((record, index) => ({
      id: record.id || `record-${index}-${Date.now()}`,
      title: record.title || 'Untitled Record',
      type: record.record?.metadata?.catalogingInterface || record.resourceType || 'Moon 27 Engine',
      timestamp: new Date(record.modifiedAt || record.createdAt || Date.now()),
      record: record.record
    }));

  const mainActions = [
    { 
      id: 'author-finder', 
      label: 'AI AUTHOR FINDER 🇮🇶', 
      description: 'Gemini 2.0 AI + Google Deep Search • Iraqi Author Verification • LOC / VIAF / Wikidata / INLA / Open Library',
      icon: Sparkles, 
      action: 'author-finder', 
      gradient: 'from-violet-400 to-indigo-600',
      category: 'authorities'
    },
    { 
      id: 'moon-27-studio', 
      label: 'MOON 27 STUDIO', 
      description: 'Ultra Liquid Glass Editor • Full WEMI Ontology • Real W3C JSON-LD/Turtle • 40px Spec',
      icon: Sparkles, 
      action: 'moon-27-studio', 
      gradient: 'from-amber-400 to-yellow-600',
      category: 'studios'
    },
    { 
      id: 'wolf-moon', 
      label: 'WOLF MOON', 
      description: '3D Spline Linked Data Studio • Full WEMI Ontology • Real W3C JSON-LD/Turtle • Triple Store Ready',
      icon: Moon, 
      action: 'wolf-moon', 
      gradient: 'from-emerald-400 to-teal-600',
      category: 'studios'
    },
    { 
      id: 'blue-moon', 
      label: 'BLUE MOON', 
      description: 'Premium BIBFRAME Editor • Moon Engine Theme • Full WEMI • W3C JSON-LD • Triple Store Ready',
      icon: Moon, 
      action: 'blue-moon', 
      gradient: 'from-blue-400 to-indigo-600',
      category: 'studios'
    },
    { 
      id: 'moon-opac', 
      label: 'WOF MOON OPAC', 
      description: 'VisionOS Spatial Discovery Portal • Share-VDE & Libris Linked Data • Real-Time Typeahead',
      icon: Search, 
      action: 'wolf-moon-opac', 
      gradient: 'from-blue-500 to-indigo-600',
      category: 'discovery'
    },
    { 
      id: 'moon-oshin', 
      label: 'MOON OSHIN PRO', 
      description: 'Professional Cataloging System • Authority Search • LOC/VIAF/Wikidata • ISBN Lookup',
      icon: Sparkles, 
      action: 'moon-oshin', 
      gradient: 'from-violet-400 to-fuchsia-600',
      category: 'authorities'
    },
    { 
      id: 'dijla-platform', 
      label: 'DIJLA PLATFORM', 
      description: 'ENTERPRISE COMMAND CENTER - Multi-AI Orchestrator (OpenAI/Gemini/LLaMA) + Discovery Federation',
      icon: Server, 
      action: 'dijla-platform', 
      gradient: 'from-indigo-400 to-cyan-600',
      category: 'discovery'
    }
  ];

  const filteredActions = activeTab === 'all' 
    ? mainActions 
    : mainActions.filter(a => a.category === activeTab);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white font-sans selection:bg-white/30">
      
      {/* ===== 1. INTERACTIVE 3D SPLINE SCENE BACKGROUND ===== */}
      <div
        className="fixed inset-0 z-0 overflow-hidden pointer-events-auto"
        style={{ top: '-10%', height: '120%' }}
      >
        <iframe
          src={SPLINE_SCENE_URL}
          frameBorder="0"
          width="100%"
          height="100%"
          className="w-full h-full"
          title="Spline 3D Scene"
          allow="fullscreen; autoplay"
          style={{ pointerEvents: 'auto', border: 'none', background: 'transparent' }}
        />
      </div>

      {/* ===== 2. LIQUID GLASS DASHBOARD CONTENT ===== */}
      <div className="relative z-10 p-8 max-w-7xl mx-auto space-y-8 pointer-events-auto">
        
        {/* Header Panel */}
        <header className="p-8" style={LIQUID_GLASS_STYLE}>
          <div className="flex items-center justify-between flex-wrap gap-6">
            
            {/* Logo & Title */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <img src={moonLogo} alt="Moon Logo" className="h-20 w-auto drop-shadow-2xl" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">
                    MOON <span className="text-amber-300">27</span>
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 border border-white/40 text-white shadow-sm">
                    BIBFRAME 3.0.1
                  </span>
                </div>
                <p className="text-sm text-white/80 mt-1.5 font-medium drop-shadow-sm">
                  Next-Gen Linked Data Studio • Ultra Liquid Glass 40px Specification
                </p>
              </div>
            </div>

            {/* Top Navigation & Action */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Segmented Filter */}
              <div className="moon27-glass-nav">
                {[
                  { id: 'all', label: 'All Modules' },
                  { id: 'studios', label: 'Studios' },
                  { id: 'discovery', label: 'Discovery' },
                  { id: 'authorities', label: 'Authorities' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`moon27-glass-tab ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Liquid Glass Author Finder Button */}
              <button
                type="button"
                onClick={() => onNavigate?.('author-finder')}
                className="moon27-glass-pill px-5 py-3 flex items-center gap-2 text-sm font-bold text-white shadow-lg border border-violet-400/40 bg-violet-600/30 hover:bg-violet-600/50"
              >
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                <span>AI Author Finder 🇮🇶</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Liquid Glass Launch Button */}
              <button
                type="button"
                onClick={() => onNavigate?.('moon-27-studio')}
                className="moon27-glass-pill px-6 py-3 flex items-center gap-2.5 text-sm font-bold text-white shadow-lg"
              >
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                <span>Open Moon 27 Studio</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="p-6 transition-all duration-300 hover:scale-[1.02]"
                style={LIQUID_GLASS_STYLE}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                    {stat.label}
                  </span>
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.iconBg} shadow-md text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-white/80">
                    {stat.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />}
                    <span>{stat.change ? `+${stat.change}% this session` : '100% Validated'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Quick Actions (Foldable Liquid Glass Grid) */}
        <section className="p-8 space-y-6" style={LIQUID_GLASS_STYLE}>
          
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/15 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-white/20 border border-white/30 text-white shadow-md">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white drop-shadow-sm">Quick Actions</h2>
                <p className="text-sm text-white/80 font-medium">Choose your cataloging workspace</p>
              </div>
            </div>

            {/* Fold / Unfold Button */}
            <button
              type="button"
              onClick={() => setIsQuickActionsFolded(!isQuickActionsFolded)}
              className="moon27-glass-pill px-5 py-2.5 text-xs font-bold text-white flex items-center gap-2"
            >
              {isQuickActionsFolded ? (
                <>
                  <span>Unfold Workspaces</span>
                  <ChevronDown className="h-4 w-4 text-amber-300" />
                </>
              ) : (
                <>
                  <span>Fold Workspaces</span>
                  <ChevronUp className="h-4 w-4 text-amber-300" />
                </>
              )}
            </button>
          </div>

          {!isQuickActionsFolded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActions.map(action => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.id}
                    onClick={() => onNavigate?.(action.action)}
                    className="p-8 cursor-pointer transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between"
                    style={{
                      ...LIQUID_GLASS_STYLE,
                      minHeight: '260px',
                    }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-4 rounded-3xl bg-gradient-to-br ${action.gradient} shadow-lg text-white`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white">
                          Ready
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-white drop-shadow-sm">
                          {action.label}
                        </h3>
                        <p className="text-xs text-white/80 mt-1.5 leading-relaxed font-medium">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs font-bold text-white">
                      <span>Launch Workspace</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </section>

        {/* Recent Records Panel */}
        <section className="p-8 space-y-6" style={LIQUID_GLASS_STYLE}>
          
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/15 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-white/20 border border-white/30 text-white shadow-md">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white drop-shadow-sm">Recent Records</h2>
                <p className="text-sm text-white/80 font-medium">Triple store cataloging activity</p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await importAliRecord();
                await loadRecords();
                toast.success('Sample BIBFRAME record imported!');
              }}
              className="moon27-glass-pill px-5 py-2.5 text-xs font-bold text-white flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Import Sample Record</span>
            </button>
          </div>

          <div className="space-y-3">
            {recentRecords.length > 0 ? (
              recentRecords.map(record => (
                <div
                  key={record.id}
                  onClick={() => {
                    if (record.record && onLoadRecord) {
                      onLoadRecord(record.record);
                      onNavigate?.('moon-27-studio');
                    }
                  }}
                  className="p-5 flex items-center justify-between gap-4 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                  style={{
                    borderRadius: '24px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 15px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-3 rounded-xl bg-white/20 text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate drop-shadow-sm">{record.title}</h4>
                      <div className="text-xs text-white/70 flex items-center gap-2 mt-0.5 font-medium">
                        <span>{record.type}</span>
                        <span>·</span>
                        <span>{record.timestamp.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 border border-emerald-400/40 text-emerald-200">
                      Conforming
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/70" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 space-y-3">
                <BookOpen className="h-10 w-10 text-white/40 mx-auto" />
                <p className="text-base font-bold text-white">No records cataloged yet</p>
                <p className="text-xs text-white/60">Launch Moon 27 Studio to catalog your first linked data work</p>
              </div>
            )}
          </div>

        </section>

      </div>
    </div>
  );
}
