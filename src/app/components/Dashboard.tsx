import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useThemeSafe } from '../hooks/useThemeSafe';
import { getThemeGradients } from '../utils/themeGradients';
import { getAllRecords, SavedRecord } from '../utils/recordStorageBackend';
import { importAliRecord } from '../utils/importSampleRecord';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { 
  LayoutDashboard,
  TrendingUp,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Calendar,
  ArrowRight,
  Activity,
  Network,
  BookOpen,
  Sparkles,
  Star,
  Package,
  Database,
  Save,
  Palette,
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
  ChevronUp,
  Compass,
  Box
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import moonLogoWhite from '../../assets/white.png';
import moonLogoBlack from '../../assets/black.png';
import '../../styles/glassmorphism.css';

// 3D Spline Scene from Login Screen
const SPLINE_SCENE_URL = 'https://my.spline.design/3ddesigntextcopycopy-ICjwUjRH9s8O1NCNqRAWjo5g-5OJ/';

// Glass Panel Level 1 (VisionOS Primary Floating Window)
const GLASS_STYLE: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.58)',
  borderRadius: '28px',
  boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(24px) saturate(160%)',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  border: '1px solid rgba(255, 255, 255, 0.78)',
};

// Liquid Glass Pill Style
const LIQUID_GLASS_PURPLE_REPLACEMENT: React.CSSProperties = {
  borderRadius: '9999px',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(240, 245, 255, 0.65) 100%)',
  backdropFilter: 'blur(14px) saturate(180%)',
  WebkitBackdropFilter: 'blur(14px) saturate(180%)',
  boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), 0 4px 14px rgba(15, 23, 42, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.85)',
};

interface DashboardProps {
  onNavigate?: (view: string) => void;
  onLoadRecord?: (record: BIBFRAMERecord) => void;
}

interface Stat {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: any;
  gradient: string;
}

interface RecentRecord {
  id: string;
  title: string;
  type: string;
  timestamp: Date;
  status: 'complete' | 'draft' | 'needs-review';
  record?: BIBFRAMERecord;
}

export function Dashboard({ onNavigate, onLoadRecord }: DashboardProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { themeStyle } = useTheme();
  const { moonEngineTheme } = useThemeSafe();
  const gradients = getThemeGradients(moonEngineTheme);
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  const [recordCount, setRecordCount] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavoritePicker, setShowFavoritePicker] = useState(false);
  const [isQuickActionsFolded, setIsQuickActionsFolded] = useState(false);

  // Get/create persistent session ID for favorite tools
  const getSessionId = () => {
    let sessionId = localStorage.getItem('moon-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('moon-session-id', sessionId);
    }
    return sessionId;
  };

  // Load saved records and favorites from database
  useEffect(() => {
    loadRecords();
    loadFavoritesFromBackend();
  }, []);

  const loadRecords = async () => {
    try {
      const records = await getAllRecords();
      setSavedRecords(records);
      setRecordCount(records.length);
    } catch (error) {
      console.error('Error loading records from database:', error);
      setSavedRecords([]);
      setRecordCount(0);
    }
  };

  // Load favorites from backend
  const loadFavoritesFromBackend = async () => {
    try {
      const sessionId = getSessionId();
      const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c`;
      
      const response = await fetch(`${API_BASE}/favorites?sessionId=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavoriteIds(data.favorites || []);
      } else {
        setFavoriteIds([]);
      }
    } catch {
      try {
        const saved = localStorage.getItem('moon-favorite-tools');
        setFavoriteIds(saved ? JSON.parse(saved) : []);
      } catch {
        setFavoriteIds([]);
      }
    }
  };

  // Save favorites to backend
  const saveFavoritesToBackend = async (favorites: string[]) => {
    try {
      const sessionId = getSessionId();
      const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c`;
      
      const response = await fetch(`${API_BASE}/favorites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, favorites }),
      });

      if (response.ok) {
        toast.success('Favorites saved!');
      }
    } catch (error) {
      console.error('[FAVORITES] Error saving to backend:', error);
    }
    
    // Also save to localStorage as backup
    localStorage.setItem('moon-favorite-tools', JSON.stringify(favorites));
  };

  const stats: Stat[] = [
    { 
      label: t('totalRecords'), 
      value: recordCount.toString(), 
      change: 12, 
      trend: 'up',
      icon: Library,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600'
    },
    { 
      label: t('today'), 
      value: savedRecords.filter(r => {
        const today = new Date();
        const recordDate = new Date(r.createdAt || '');
        return recordDate.toDateString() === today.toDateString();
      }).length.toString(), 
      change: 8, 
      trend: 'up',
      icon: Zap,
      gradient: 'from-cyan-500 via-blue-600 to-teal-600'
    },
    { 
      label: t('thisWeek'), 
      value: savedRecords.filter(r => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recordDate = new Date(r.createdAt || '');
        return recordDate >= weekAgo;
      }).length.toString(), 
      change: -5, 
      trend: 'down',
      icon: TrendingUp,
      gradient: 'from-emerald-500 via-teal-600 to-cyan-600'
    },
    { 
      label: t('pendingReview'), 
      value: '0', 
      change: 0, 
      trend: 'neutral',
      icon: AlertCircle,
      gradient: 'from-orange-500 via-amber-600 to-yellow-600'
    },
  ];

  const recentRecords: RecentRecord[] = savedRecords
    .slice(0, 5)
    .map((record, index) => ({
      id: record.id || `record-${index}-${Date.now()}`,
      title: record.title || 'Untitled',
      type: record.record?.metadata?.catalogingInterface || record.resourceType || 'Moon Engine',
      timestamp: new Date(record.modifiedAt || record.createdAt || Date.now()),
      status: 'complete' as const,
      record: record.record
    }));

  const mainActions = [
    { 
      id: 'author-finder', 
      label: 'AI AUTHOR FINDER 🇮🇶', 
      description: 'Gemini AI + Multi-Page Google Deep Search • Global Authority Federation & Bio Dossiers',
      icon: Sparkles, 
      action: 'author-finder', 
      gradient: 'from-blue-600 via-cyan-600 to-teal-700',
      iconBg: 'from-blue-400 to-cyan-600'
    },
    { 
      id: 'moon-spatial-opac', 
      label: 'MOON 3D SPATIAL OPAC', 
      description: 'فهرس المقتنيات ثلاثية الأبعاد • عرض النماذج 3D • تطبيق الواقع المعزز AR للهاتف • Graph Universe',
      icon: Box, 
      action: 'moon-spatial-opac', 
      gradient: 'from-purple-600 via-indigo-600 to-blue-700',
      iconBg: 'from-purple-400 to-indigo-600'
    },
    { 
      id: 'moon-manuscripts', 
      label: 'MOON MANUSCRIPTS MARC & RDA', 
      description: 'منظومة فهرسة ومقارنة المخطوطات المعيارية • 107,149 مخطوط • استناد kiqp.net و dromh.org (D:\\MAN)',
      icon: BookOpen, 
      action: 'moon-manuscripts', 
      gradient: 'from-blue-700 via-slate-800 to-indigo-900',
      iconBg: 'from-blue-400 to-slate-700'
    },
    { 
      id: 'moon-27', 
      label: 'MOON 27 DASHBOARD', 
      description: 'Next-Gen 27 Edition UI • Dual-Layer Matte Charcoal • 3D Holographic 27 • Prismatic Controls',
      icon: Sparkles, 
      action: 'moon-27', 
      gradient: 'from-[#3d3c3d] via-[#323132] to-[#262526]',
      iconBg: 'from-amber-400 to-yellow-600'
    },
    { 
      id: 'moon-27-studio', 
      label: 'MOON 27 STUDIO', 
      description: '3D Spline Linked Data Editor • Complete WEMI Ontology Engine • 17 Formats • 27 Design',
      icon: Moon, 
      action: 'moon-27-studio', 
      gradient: 'from-amber-500 via-orange-600 to-yellow-700',
      iconBg: 'from-amber-400 to-orange-600'
    },
    { 
      id: 'wolf-moon', 
      label: 'WOLF MOON', 
      description: '3D Spline Linked Data Studio • Full WEMI Ontology • Real W3C JSON-LD/Turtle • Triple Store Ready',
      icon: Moon, 
      action: 'wolf-moon', 
      gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
      iconBg: 'from-emerald-400 to-teal-600'
    },
    { 
      id: 'wolf-moon-opac', 
      label: 'WOF MOON OPAC', 
      description: 'بوابة الفهرس العام المستقلة • مستوحى من Share-VDE وLibris السويدي • ربط الكيانات الكامل للأعلام والمواضيع • قاعدة بيانات موحدة ومترابطة',
      icon: Compass, 
      action: 'wolf-moon-opac', 
      gradient: 'from-blue-600 via-indigo-600 to-slate-800',
      iconBg: 'from-blue-400 to-indigo-600'
    },
    { 
      id: 'blue-moon', 
      label: 'BLUE MOON', 
      description: 'Premium BIBFRAME Editor • Moon Engine Theme • Full WEMI • W3C JSON-LD • Triple Store Ready',
      icon: Moon, 
      action: 'blue-moon', 
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      iconBg: 'from-blue-400 to-blue-600'
    },
    { 
      id: 'moon-linked-data-engine', 
      label: 'MOON Engine', 
      description: 'Complete Linked Data Editor • JSON-LD • RDF • Turtle • Graph View',
      icon: Moon, 
      action: 'moon-linked-data-engine', 
      gradient: 'from-indigo-500 via-blue-600 to-teal-700',
      iconBg: 'from-indigo-400 to-blue-600'
    },
    { 
      id: 'wolf-moon-opac', 
      label: 'WOF MOON OPAC', 
      description: 'VisionOS Spatial Discovery Portal • Share-VDE & Libris Linked Data • Real-Time Typeahead & Entity Nodes',
      icon: BookOpen, 
      action: 'wolf-moon-opac', 
      gradient: 'from-blue-600 via-indigo-600 to-slate-800',
      iconBg: 'from-blue-500 to-indigo-600'
    },
    { 
      id: 'moon-opac', 
      label: 'WOF MOON OPAC', 
      description: 'Pro Discovery Interface • Faceted Search • Linked Data • RDF Export',
      icon: Search, 
      action: 'wolf-moon-opac', 
      gradient: 'from-teal-500 via-cyan-600 to-blue-700',
      iconBg: 'from-teal-400 to-cyan-600'
    },
    { 
      id: 'blue-moon', 
      label: 'BLUE MOON', 
      description: 'Premium BIBFRAME Editor • Moon Engine Theme • Full WEMI • W3C JSON-LD • Triple Store Ready',
      icon: Moon, 
      action: 'blue-moon', 
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      iconBg: 'from-blue-400 to-blue-600'
    },
    { 
      id: 'moon-oshin', 
      label: 'MOON OSHIN PRO', 
      description: 'Professional Cataloging System • Authority Search • LOC/VIAF/Wikidata • ISBN Lookup',
      icon: Sparkles, 
      action: 'moon-oshin', 
      gradient: 'from-blue-500 via-teal-600 to-emerald-700',
      iconBg: 'from-blue-400 to-teal-600'
    },
    { 
      id: 'moon-faleh', 
      label: 'MOON FALEH', 
      description: 'ULTIMATE SYSTEM • All Features Combined • Wizard + Ontology + Glass UI + Multi-Authority Search • Designed by Isaac Faleh',
      icon: Zap, 
      action: 'moon-faleh', 
      gradient: 'from-cyan-600 via-blue-600 to-indigo-700',
      iconBg: 'from-cyan-500 to-blue-600'
    },
    { 
      id: 'moon-dijla', 
      label: 'MOON DIJLA', 
      description: 'UNIFIED ENGINE • SandV2 + OshinPro + EngineGlass + AuthoritySearch • Graph Engine + Wizard + Ontology Form + 12 Preview Tabs • Designed by Isaac Faleh',
      icon: Sparkles, 
      action: 'moon-dijla', 
      gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
      iconBg: 'from-cyan-400 to-blue-600'
    },
    { 
      id: 'dijla-platform', 
      label: 'DIJLA PLATFORM', 
      description: 'ENTERPRISE COMMAND CENTER - Multi-AI Orchestrator (OpenAI/Gemini/LLaMA) + Discovery Federation + BIBFRAME Model + RDF Export + AI Governance + Full Architecture',
      icon: Server, 
      action: 'dijla-platform', 
      gradient: 'from-indigo-500 via-blue-600 to-cyan-600',
      iconBg: 'from-indigo-400 to-blue-600'
    },
    { 
      id: 'moon-nexus', 
      label: 'MOON NEXUS', 
      description: 'UNIFIED WORKING WORKSTATION - Live Authority Search (LOC/VIAF/Wikidata) + AI Cataloging (OpenAI) + Federated Discovery + Record Management + RDF Export — EVERYTHING WORKS',
      icon: Zap, 
      action: 'moon-nexus', 
      gradient: 'from-amber-500 via-orange-600 to-red-600',
      iconBg: 'from-amber-400 to-orange-600'
    },
    { 
      id: 'moon-ai-orchestrator', 
      label: 'AI ORCHESTRATOR', 
      description: 'MULTI-AI AGENT SYSTEM — OpenAI + Gemini + LLaMA with circuit breaker routing. All 5 AI phases + Discovery AI + Entity Linking + Knowledge Graph + Audit governance. Every button calls a real API.',
      icon: Brain, 
      action: 'moon-ai-orchestrator', 
      gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
      iconBg: 'from-emerald-400 to-teal-600'
    },
    { 
      id: 'moon-dijla-core', 
      label: 'DIJLA CORE', 
      description: 'ENTERPRISE BIBFRAME INFRASTRUCTURE — Cataloging Engine + Authority Hub (LOC/VIAF/Wikidata/FAST) + AI Orchestrator (OpenAI/Gemini/LLaMA) + Federated Discovery + SPARQL Engine + Knowledge Graph + LD4 Integration + Record API + System Health — ALL REAL APIs',
      icon: Database, 
      action: 'moon-dijla-core', 
      gradient: 'from-[#1a3a4a] via-[#245566] to-[#c9944a]',
      iconBg: 'from-[#1a3a4a] to-[#c9944a]'
    },
    { 
      id: 'ld4-platform', 
      label: 'LD4 PLATFORM', 
      description: 'LINKED DATA FOR PRODUCTION - Sinopia Templates + LD4P Profile Registry + Authority Reconciliation (LOC/VIAF/Wikidata/FAST/Share-VDE) + Federated Discovery + Content Negotiation + Graph Explorer',
      icon: Globe, 
      action: 'ld4-platform', 
      gradient: 'from-teal-500 via-cyan-600 to-blue-700',
      iconBg: 'from-teal-400 to-cyan-600'
    },
    { 
      id: 'moon-k', 
      label: 'MOON K', 
      description: 'CLASSIC 3-TAB • Ontology Form + Wizard + Graph Engine as separate tabs • Original layout with full preview tabs  Designed by Isaac Faleh',
      icon: Layers, 
      action: 'moon-k', 
      gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
      iconBg: 'from-emerald-400 to-teal-600'
    },
    { 
      id: 'moon-bibframe-template', 
      label: 'BIBFRAME TEMPLATE', 
      description: 'PRODUCTION-GRADE • 5 Resource Templates (Monograph/Serial/Manuscript/Music/Map) • Full WEMI + AdminMetadata • 100+ Properties • Triple Extraction • 3-Level Validation • URI Minting • Designed by Isaac Faleh',
      icon: Database, 
      action: 'moon-bibframe-template', 
      gradient: 'from-rose-500 via-fuchsia-600 to-violet-700',
      iconBg: 'from-rose-400 to-fuchsia-600'
    },
    { 
      id: 'sun-moon', 
      label: 'SUN MOON', 
      description: 'LIGHT THEME • Same engine as BIBFRAME Template with classic light glassmorphism theme • 5 Resource Templates • Full WEMI • 100+ Properties • All tabs & validation • Designed by Isaac Faleh',
      icon: BookOpen, 
      action: 'sun-moon', 
      gradient: 'from-amber-400 via-yellow-500 to-orange-500',
      iconBg: 'from-amber-300 to-yellow-500'
    },
    { 
      id: 'moon-testing', 
      label: 'MOON TESTING', 
      description: 'VALIDATION SUITE • W3C JSON-LD Compliance • RDF Validator • Turtle/N-Triples Serialization • In-Memory Triple Store • SPARQL Query Engine • JSON-LD Playground Integration • Designed by Isaac Faleh',
      icon: Shield, 
      action: 'moon-testing', 
      gradient: 'from-amber-500 via-orange-600 to-red-700',
      iconBg: 'from-amber-400 to-orange-600'
    },
    { 
      id: 'moon-wave-diagnostic', 
      label: 'BACKEND DIAGNOSTIC', 
      description: 'TEST BACKEND NOW - See if APIs are connected and working',
      icon: Shield, 
      action: 'moon-wave-diagnostic', 
      gradient: 'from-red-500 via-orange-600 to-yellow-700',
      iconBg: 'from-red-400 to-orange-600'
    },
    { 
      id: 'moon-wave-101', 
      label: 'MOON WAVE 101', 
      description: 'Production Features Demo • Checksum • Validation • Audit Trail • LIVE BACKEND',
      icon: Zap, 
      action: 'moon-wave-101', 
      gradient: 'from-indigo-500 via-blue-600 to-cyan-700',
      iconBg: 'from-indigo-400 to-blue-600'
    },
    { 
      id: 'moon-sand', 
      label: 'MOON SAND', 
      description: 'Complete Cataloging Sandbox • 100+ Fields • Expression Layer • Relationships • Templates',
      icon: Layers, 
      action: 'moon-sand', 
      gradient: 'from-amber-500 via-orange-600 to-yellow-700',
      iconBg: 'from-amber-400 to-orange-600'
    },
    { 
      id: 'moon-sand-v2', 
      label: 'MOON SAND V2', 
      description: 'Ontology-Driven Semantic Engine • Registry-Powered • Graph-Based • SHACL Validation',
      icon: Network, 
      action: 'moon-sand-v2', 
      gradient: 'from-rose-500 via-pink-600 to-orange-700',
      iconBg: 'from-rose-400 to-pink-600'
    },
    { 
      id: 'moon-sand-persistent', 
      label: 'MOON SAND PERSISTENT', 
      description: 'Full Record Lifecycle • Save/Load • Versioning • Publishing • Export API',
      icon: Save, 
      action: 'moon-sand-persistent', 
      gradient: 'from-indigo-500 via-blue-600 to-teal-700',
      iconBg: 'from-indigo-400 to-blue-600'
    },
    { 
      id: 'records-dashboard', 
      label: 'RECORDS DASHBOARD', 
      description: 'Browse Records • Search • Manage • Export • Version History',
      icon: BookOpen, 
      action: 'records-dashboard', 
      gradient: 'from-blue-500 via-cyan-600 to-teal-700',
      iconBg: 'from-blue-400 to-cyan-600'
    },
    { 
      id: 'upgrade-status', 
      label: 'Upgrade Status', 
      description: 'See what was upgraded from prototype to production • Real RDF • D3 Graphs',
      icon: Activity, 
      action: 'upgrade-status', 
      gradient: 'from-green-500 via-emerald-600 to-teal-700',
      iconBg: 'from-green-400 to-emerald-600'
    },
    { 
      id: 'moon-authority-manager', 
      label: 'Authority Control', 
      description: 'Manage authorities • Duplicate detection • URI merging • External linking',
      icon: Users, 
      action: 'moon-authority-manager', 
      gradient: 'from-orange-500 via-red-600 to-pink-700',
      iconBg: 'from-orange-400 to-red-600'
    },
    { 
      id: 'sparql-interface', 
      label: 'SPARQL Endpoint', 
      description: 'Query triple stores • Fuseki • Blazegraph • GraphDB • Federated queries',
      icon: Database, 
      action: 'sparql-interface', 
      gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
      iconBg: 'from-cyan-400 to-blue-600'
    },
    { 
      id: 'enterprise-features', 
      label: 'Enterprise Features', 
      description: 'Versioning • Audit logs • SHACL validation • Multi-tenant • Discovery',
      icon: Shield, 
      action: 'enterprise-status', 
      gradient: 'from-teal-500 via-blue-600 to-indigo-700',
      iconBg: 'from-teal-400 to-blue-600'
    },
    { 
      id: 'moon-engine', 
      label: 'Moon Engine (Legacy)', 
      description: 'Ontology-Driven • RDF Graphs • Mind Maps • MARC • OPAC Preview',
      icon: Moon, 
      action: 'moon-engine', 
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      iconBg: 'from-blue-400 to-blue-600'
    },
    { 
      id: 'classic-1', 
      label: 'Classic 1.0', 
      description: 'Traditional Three-Pane Layout • Work • Instance • Preview',
      icon: LayoutGrid, 
      action: 'classic-1', 
      gradient: 'from-gray-500 via-gray-600 to-gray-700',
      iconBg: 'from-gray-400 to-gray-600'
    },
    { 
      id: 'linked-data-discovery', 
      label: 'LINKED DATA DISCOVERY', 
      description: 'Federated Search • 19 Providers • LOC/VIAF/WorldCat/Wikidata/FAST/ISBNdb/CrossRef/BNF/GoogleBooks/OpenLibrary/LCSH/GND/ISNI/HathiTrust/Getty/Europeana/DPLA/ShareVDE • Content Negotiation • JSON-LD/Turtle/N-Triples',
      icon: Orbit, 
      action: 'linked-data-discovery', 
      gradient: 'from-teal-500 via-cyan-600 to-blue-700',
      iconBg: 'from-teal-400 to-cyan-600'
    },
    { 
      id: 'bibframe2marc', 
      label: 'BIBFRAME2MARC', 
      description: 'LC bibframe2marc v3.0.0 XSLT Engine • Actual LC Rules from GitHub • BIBFRAME RDF/XML → MARCXML • Browser-Native XSLTProcessor • 14 Rule Files • MARC Tagged/XML/Breaker',
      icon: GitBranch, 
      action: 'bibframe2marc', 
      gradient: 'from-amber-500 via-orange-600 to-red-600',
      iconBg: 'from-amber-400 to-orange-600'
    },
    { 
      id: 'marc2bibframe', 
      label: 'MARC2BIBFRAME', 
      description: 'LC marc2bibframe2 XSLT Engine • MARC 21 → BIBFRAME 2.0 RDF/XML • 27 Stylesheets + 7 Config Files • Browser-Native XSLTProcessor • Full LC Spec Coverage',
      icon: GitBranch, 
      action: 'marc2bibframe', 
      gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
      iconBg: 'from-cyan-400 to-blue-600'
    },
    { 
      id: 'enterprise-ai', 
      label: 'Enterprise AI Engine', 
      description: 'AI-Assisted BIBFRAME Cataloging • 5-Phase Intelligence Layer • Metadata Suggestions • Duplicate Detection • NL Discovery • SPARQL Translator • Auto Fill • Full Audit Log',
      icon: Brain, 
      action: 'enterprise-ai', 
      gradient: 'from-blue-500 via-cyan-600 to-indigo-700',
      iconBg: 'from-blue-400 to-cyan-600'
    },
    { 
      id: 'moon-ai', 
      label: 'MOON AI', 
      description: 'AI-Assisted BIBFRAME Cataloging System • JSON-LD Fragment Output • Per-Field Accept/Reject • Multi-Source Federated Lookup • SPARQL Generator • Duplicate Detection • Full Audit Trail',
      icon: Brain, 
      action: 'moon-ai', 
      gradient: 'from-indigo-500 via-blue-600 to-cyan-700',
      iconBg: 'from-indigo-400 to-cyan-500'
    },
  ];

  const secondaryActions = [
    { id: 'all-records', label: 'All Records', icon: Database, action: 'all-records', gradient: 'from-blue-500 to-indigo-600' },
    { id: 'advanced-search', label: t('advancedSearch'), icon: Search, action: 'advanced-search', gradient: 'from-cyan-500 to-blue-600' },
    { id: 'authority-files', label: 'Authority Files', icon: Users, action: 'authority-manager', gradient: 'from-teal-500 to-blue-600' },
    { id: 'templates', label: 'Templates', icon: Layers, action: 'template-manager', gradient: 'from-pink-500 to-rose-600' },
    { id: 'import-records', label: t('importRecords'), icon: Upload, action: 'bibframe-search', gradient: 'from-amber-500 to-orange-600' },
    { id: 'bulk-edit', label: t('bulkEdit'), icon: Edit, action: 'bulk-edit', gradient: 'from-green-500 to-emerald-600' },
  ];

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const handleLoadRecord = (record: BIBFRAMERecord) => {
    if (onLoadRecord) {
      onLoadRecord(record);
    }
  };

  const handleImportAliRecord = async () => {
    try {
      toast.info('Importing Ali b. Abi Talib record...');
      await importAliRecord();
      toast.success('Ali b. Abi Talib record imported successfully!');
      await loadRecords();
    } catch (error) {
      console.error('Failed to import Ali record:', error);
      toast.error('Failed to import record. Check console for details.');
    }
  };

  const toggleFavorite = (id: string) => {
    const newFavorites = favoriteIds.includes(id) ? favoriteIds.filter(favId => favId !== id) : [...favoriteIds, id];
    setFavoriteIds(newFavorites);
    saveFavoritesToBackend(newFavorites);
  };

  const isFavorite = (id: string) => favoriteIds.includes(id);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black text-white selection:bg-blue-500/30">
      
      {/* ===== 1. INTERACTIVE 3D SPLINE SCENE FROM LOGIN SCREEN ===== */}
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
          style={{
            pointerEvents: 'auto',
            border: 'none',
            background: 'transparent'
          }}
        />
      </div>

      {/* ===== 2. FROSTED GLASS OVERLAY & MAIN DASHBOARD CONTENT ===== */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto space-y-6 pointer-events-auto">
        
        {/* Glass Header */}
        <div className="p-8" style={GLASS_STYLE}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/40 rounded-3xl blur-xl opacity-60 animate-pulse" />
                <img src={moonLogoBlack} alt="Moon Logo" className="relative h-24 w-auto drop-shadow-2xl" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tight" style={{ color: '#2d3748' }}>
                  {t('dashboard')}
                </h1>
                <p className="text-lg mt-2 font-medium" style={{ color: '#4a5568' }}>
                  Moon • BIBFRAME 3.0.1 Cataloging Platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => onNavigate?.('author-finder')}
                className="liquid-glass-btn text-xs font-bold gap-1.5 cursor-pointer py-2 px-4"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>AI Author Finder</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate?.('moon-27')}
                className="liquid-glass-btn text-xs font-bold gap-1.5 cursor-pointer py-2 px-4"
              >
                <Sparkles className="h-4 w-4 text-slate-700" />
                <span>Moon 27 Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate?.('wolf-moon')}
                className="liquid-glass-primary text-xs font-bold gap-1.5 cursor-pointer py-2 px-4"
              >
                <Moon className="h-3.5 w-3.5 text-blue-200" />
                <span>Wolf Moon</span>
              </button>

              {/* Link directly to OPAC discovery portal */}
              <a
                href="/opac.html"
                target="_blank"
                rel="noreferrer"
                className="liquid-glass-pill py-2 px-4 text-xs font-bold cursor-pointer"
                title="فتح بوابة الفهرس العام"
              >
                <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                <span>OPAC Public</span>
              </a>

              {/* Link directly to Alqami 3D Spatial Heritage OPAC */}
              <button
                type="button"
                onClick={() => {
                  const targetHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
                  window.open(`http://${targetHost}:5174`, '_blank');
                }}
                className="liquid-glass-pill py-2 px-3.5 text-xs font-bold cursor-pointer flex items-center gap-2 group hover:border-cyan-400/50 hover:bg-slate-900/5 transition-all shadow-sm"
                title="فتح بوابة علقمي ثلاثية الأبعاد والواقع المعزز (Alqami 3D & AR Spatial OPAC)"
              >
                <img
                  src="/alqami-logo.png"
                  alt="علقمي"
                  className="h-4.5 w-auto max-h-5 object-contain brightness-0 invert opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                />
                <span className="text-xs font-extrabold text-slate-800 tracking-tight">علقمي 3D</span>
                <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-800 border border-cyan-500/30">
                  AR
                </span>
              </button>

              <div className="liquid-glass-pill py-2 px-3.5 text-xs font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-xs font-bold text-slate-800">
                  Live Triple Store
                </span>
              </div>
              
              <div className="liquid-glass-pill py-2 px-3.5 text-xs font-bold">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-800">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="p-6 hover:scale-105 transition-all duration-500 group cursor-pointer"
                style={{
                  ...GLASS_STYLE,
                  animationName: 'fadeInUp',
                  animationDuration: '0.6s',
                  animationTimingFunction: 'ease-out',
                  animationFillMode: 'forwards',
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {stat.label === t('today') ? (
                      <div className="flex flex-col items-center justify-center w-8 h-8 text-white">
                        <div className="text-[14px] font-bold leading-none mb-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</div>
                        <div className="font-black leading-none text-[48px] font-[Antic_Didone]">{new Date().getDate()}</div>
                      </div>
                    ) : (
                      <Icon className="h-8 w-8 text-white" />
                    )}
                  </div>
                  {stat.change !== undefined && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ ...GLASS_STYLE, padding: '4px 8px', color: '#2d3748' }}>
                      {stat.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />}
                      {stat.trend === 'down' && <TrendingUp className="h-3.5 w-3.5 rotate-180 text-rose-600" />}
                      {Math.abs(stat.change)}%
                    </div>
                  )}
                </div>
                <div className="text-sm font-semibold mb-2" style={{ color: '#4a5568' }}>{stat.label}</div>
                <div className="text-4xl font-black tracking-tight" style={{ color: '#1a202c' }}>
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== FAVORITE TOOLS ===== */}
        <div
          className="p-8"
          style={{
            ...GLASS_STYLE,
            border: '1px solid rgba(255, 215, 0, 0.4)',
            boxShadow: '0 8px 32px rgba(255, 215, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
          }}
        >
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-3xl blur-lg opacity-60 animate-pulse" />
                <div className="relative p-4 rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 shadow-2xl shadow-amber-500/40">
                  <Star className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight" style={{ color: '#2d3748' }}>Favorite Tools</h2>
                <p className="text-base mt-1 font-semibold" style={{ color: '#4a5568' }}>
                  {favoriteIds.length > 0 ? `${favoriteIds.length} tool${favoriteIds.length > 1 ? 's' : ''} ready for quick access` : 'Pin your most-used workflows here'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowFavoritePicker(true)}
              className="px-6 py-3 rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              style={{
                ...GLASS_STYLE,
                border: '1px solid rgba(255, 215, 0, 0.6)'
              }}
            >
              <Edit className="h-5 w-5" style={{ color: '#2d3748' }} />
              <span className="font-bold text-base" style={{ color: '#2d3748' }}>
                {favoriteIds.length > 0 ? 'Manage' : 'Add Tools'}
              </span>
            </button>
          </div>

          {favoriteIds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mainActions.filter(a => favoriteIds.includes(a.id)).map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => onNavigate?.(action.action)}
                    className="group relative overflow-hidden rounded-[28px] transition-all duration-700 hover:scale-[1.03] active:scale-[0.97] focus:outline-none cursor-pointer"
                    style={{
                      animationName: 'fadeInUp',
                      animationDuration: '0.6s',
                      animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                      animationFillMode: 'forwards',
                      animationDelay: `${index * 120}ms`,
                      opacity: 0,
                      minHeight: '340px',
                    }}
                  >
                    {/* Full gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient}`} />
                    
                    {/* Decorative circle accents */}
                    <div className={`absolute -right-12 -top-12 w-56 h-56 rounded-full bg-gradient-to-br ${action.iconBg} opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700`} />
                    <div className={`absolute -right-6 top-6 w-40 h-40 rounded-full bg-gradient-to-br ${action.iconBg} opacity-20 group-hover:opacity-40 transition-all duration-500`} />
                    
                    {/* Outer glow on hover */}
                    <div className={`absolute -inset-2 bg-gradient-to-br ${action.gradient} rounded-[32px] blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-700 -z-10`} />
                    
                    {/* Top section — large icon */}
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex-1 flex items-center justify-center pt-8 pb-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/20 rounded-[32px] blur-2xl scale-150 opacity-0 group-hover:opacity-60 transition-all duration-700" />
                          <div className="relative p-7 rounded-[28px] bg-white/20 backdrop-blur-md border border-white/40 shadow-2xl group-hover:scale-110 group-hover:rotate-2 transition-all duration-500">
                            {action.logo ? (
                              <img src={action.logo} alt={action.label} className="h-16 w-16 object-contain filter drop-shadow-2xl brightness-0 invert group-hover:scale-110 transition-transform duration-300" />
                            ) : (
                              <Icon className="h-16 w-16 text-white drop-shadow-xl" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Favorite star badge */}
                      <div className="absolute top-5 right-5 z-20">
                        <div className="p-2.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 group-hover:bg-black/30 transition-all duration-300">
                          <Star className="h-5 w-5 text-amber-300 fill-amber-300 drop-shadow-lg" />
                        </div>
                      </div>
                      
                      {/* Counter badge top-left */}
                      <div className="absolute top-5 left-5 z-20">
                        <span className="text-sm font-bold text-white/80 tracking-widest">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      
                      {/* Bottom frosted glass panel */}
                      <div className="relative mx-3 mb-3 rounded-[22px] overflow-hidden" style={GLASS_STYLE}>
                        <div className="relative z-10 px-6 py-5">
                          <h3 className="text-lg font-black text-[#1a202c] drop-shadow-sm leading-tight mb-1.5 text-left">
                            {action.label}
                          </h3>
                          <p className="text-xs font-medium text-[#4a5568] leading-relaxed line-clamp-2 text-left mb-3">
                            {action.description.split('•')[0].trim()}
                          </p>
                          
                          {/* Launch button */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 group-hover:bg-white/80 transition-all duration-300 group-hover:shadow-lg">
                              <span className="text-sm font-bold text-[#1a202c]">Launch</span>
                              <ArrowRight className="h-4 w-4 text-[#1a202c] group-hover:translate-x-1 transition-transform duration-300" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-8">
              <div className="inline-block relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="relative p-8 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-2 border-amber-400/30">
                  <Star className="h-20 w-20" style={{ color: '#4a5568', opacity: 0.4 }} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#2d3748' }}>
                No Favorites Yet
              </h3>
              <p className="text-base mb-8 max-w-md mx-auto leading-relaxed font-medium" style={{ color: '#4a5568' }}>
                Select your most-used tools to create a personalized quick-access dashboard. Your selections will be saved automatically.
              </p>
              <button
                onClick={() => setShowFavoritePicker(true)}
                className="px-8 py-4 text-base font-bold hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl cursor-pointer"
                style={{ ...GLASS_STYLE, color: '#2d3748', border: '1px solid rgba(255, 215, 0, 0.6)' }}
              >
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <span>Choose Your Favorites</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Main Actions - Large Glass Cards (Foldable) */}
        <div className="p-8" style={GLASS_STYLE}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#2d3748' }}>Quick Actions</h2>
                <p className="text-sm font-medium" style={{ color: '#4a5568' }}>Choose your cataloging workspace</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsQuickActionsFolded(!isQuickActionsFolded)}
              className="px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer hover:scale-105 shadow-sm"
              style={{ ...GLASS_STYLE, color: '#2d3748', border: '1px solid rgba(0, 0, 0, 0.1)' }}
            >
              {isQuickActionsFolded ? (
                <>
                  <span>Unfold Workspaces</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Fold Workspaces</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {!isQuickActionsFolded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mainActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => onNavigate?.(action.action)}
                    className="group relative overflow-hidden p-8 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                    style={{
                      ...GLASS_STYLE,
                      animationName: 'fadeInUp',
                      animationDuration: '0.6s',
                      animationTimingFunction: 'ease-out',
                      animationFillMode: 'forwards',
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                      {/* Big Icon */}
                      <div className={`p-6 rounded-3xl bg-gradient-to-br ${action.iconBg} shadow-2xl group-hover:shadow-3xl group-hover:scale-110 transition-all duration-300`}>
                        <Icon className="h-12 w-12 text-white" />
                      </div>
                      
                      {/* Text */}
                      <div>
                        <h3 className="text-lg font-bold mb-2 text-[#2d3748] group-hover:text-white group-hover:scale-105 transition-all">
                          {action.label}
                        </h3>
                        <p className="text-xs leading-relaxed group-hover:text-white/90 transition-colors text-[#4a5568]">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Secondary Actions - Compact Glass Buttons */}
        <div className="p-8" style={GLASS_STYLE}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-600 shadow-lg">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#2d3748' }}>More Tools</h2>
              <p className="text-sm font-medium" style={{ color: '#4a5568' }}>Additional semantic utilities</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {secondaryActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => onNavigate?.(action.action)}
                  className="group p-6 rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col items-center gap-3 cursor-pointer"
                  style={{
                    ...GLASS_STYLE,
                    animationName: 'fadeIn',
                    animationDuration: '0.5s',
                    animationTimingFunction: 'ease-out',
                    animationFillMode: 'forwards',
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.gradient} shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-bold text-center leading-tight" style={{ color: '#2d3748' }}>
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Records - Glass Table */}
        <div className="p-8" style={GLASS_STYLE}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#2d3748' }}>{t('recentRecords')}</h2>
                <p className="text-sm font-medium" style={{ color: '#4a5568' }}>Latest cataloged activity</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleImportAliRecord}
                className="px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer font-semibold text-sm"
                style={{ ...GLASS_STYLE, color: '#2d3748' }}
                title="Import Ali b. Abi Talib sample record"
              >
                <Download className="h-4 w-4" />
                <span>Import Ali Record</span>
              </button>
              
              <button 
                onClick={() => onNavigate?.('records-dashboard')}
                className="px-6 py-2.5 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer font-bold text-sm"
                style={{ ...GLASS_STYLE, color: '#2d3748' }}
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {recentRecords.length > 0 ? recentRecords.map((record, index) => (
              <div
                key={record.id}
                onClick={() => record.record && handleLoadRecord(record.record)}
                className="p-6 rounded-2xl hover:scale-[1.01] transition-all duration-300 cursor-pointer group"
                style={{
                  ...GLASS_STYLE,
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards'
                }}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold transition-colors" style={{ color: '#1a202c' }}>
                        {record.title}
                      </h3>
                      <Badge className="border-black/10 bg-white/40 font-semibold" style={{ color: '#2d3748' }}>
                        {record.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium" style={{ color: '#4a5568' }}>
                      <span className="font-mono">{record.id}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTimestamp(record.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className="bg-emerald-500/20 text-emerald-800 border-emerald-400/40 font-bold">
                      <CheckCircle className="h-3 w-3 mr-1 text-emerald-600" />
                      Complete
                    </Badge>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-all" style={{ color: '#2d3748' }} />
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-16">
                <div className="inline-block p-6 rounded-3xl bg-white/40 border border-white/60 mb-4 shadow-sm">
                  <FileText className="h-16 w-16" style={{ color: '#4a5568', opacity: 0.5 }} />
                </div>
                <p className="mb-4 font-semibold text-lg" style={{ color: '#2d3748' }}>{t('noRecordsFound')}</p>
                <button
                  onClick={() => onNavigate?.('wolf-moon-quantum')}
                  className="px-8 py-4 text-lg font-bold hover:scale-105 transition-transform cursor-pointer"
                  style={{ ...GLASS_STYLE, color: '#1a202c' }}
                >
                  <FileText className="h-5 w-5 mr-2 inline" />
                  {t('createNewRecord')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* System Status - Glass Panel */}
        <div className="p-8" style={GLASS_STYLE}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#2d3748' }}>{t('systemStatus')}</h2>
              <p className="text-sm font-medium" style={{ color: '#4a5568' }}>All systems operational</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl" style={GLASS_STYLE}>
              <div className="flex items-center justify-between mb-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              </div>
              <div className="text-sm font-medium mb-1" style={{ color: '#4a5568' }}>LOC API</div>
              <div className="text-lg font-bold" style={{ color: '#1a202c' }}>Online</div>
            </div>
            
            <div className="p-6 rounded-2xl" style={GLASS_STYLE}>
              <div className="flex items-center justify-between mb-2">
                <Network className="h-5 w-5 text-indigo-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              </div>
              <div className="text-sm font-medium mb-1" style={{ color: '#4a5568' }}>VIAF</div>
              <div className="text-lg font-bold" style={{ color: '#1a202c' }}>Online</div>
            </div>
            
            <div className="p-6 rounded-2xl" style={GLASS_STYLE}>
              <div className="flex items-center justify-between mb-2">
                <Database className="h-5 w-5 text-cyan-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              </div>
              <div className="text-sm font-medium mb-1" style={{ color: '#4a5568' }}>Database</div>
              <div className="text-lg font-bold" style={{ color: '#1a202c' }}>Connected</div>
            </div>
            
            <div className="p-6 rounded-2xl" style={GLASS_STYLE}>
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-5 w-5 text-pink-600" />
                <div className="font-bold text-lg" style={{ color: '#1a202c' }}>100%</div>
              </div>
              <div className="text-sm font-medium mb-1" style={{ color: '#4a5568' }}>SHACL Engine</div>
              <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ===== FAVORITE PICKER MODAL ===== */}
      {showFavoritePicker && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setShowFavoritePicker(false)} />
          
          <div
            className="relative w-full max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col"
            style={GLASS_STYLE}
          >
            <div className="p-6 pb-4 border-b border-black/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 shadow-lg">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#1a202c' }}>Select Favorite Tools</h2>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: '#4a5568' }}>
                    Tap tools to add or remove from favorites ({favoriteIds.length} selected)
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {favoriteIds.length > 0 && (
                  <button
                    onClick={() => { setFavoriteIds([]); localStorage.setItem('moon-favorite-tools', '[]'); }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
                    style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFavoritePicker(false)}
                  className="px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 cursor-pointer text-white"
                  style={{ background: '#2563eb', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                >
                  Done
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {mainActions.map((action) => {
                const Icon = action.icon;
                const selected = isFavorite(action.id);
                return (
                  <button
                    key={action.id}
                    onClick={() => toggleFavorite(action.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-left"
                    style={{
                      background: selected ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.4)',
                      border: selected ? '2px solid rgba(255,215,0,0.6)' : '1px solid rgba(255,255,255,0.5)',
                    }}
                    type="button"
                  >
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${action.iconBg} shadow-lg shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <h3 className="text-sm font-bold truncate" style={{ color: '#1a202c' }}>{action.label}</h3>
                      <p className="text-[11px] leading-snug mt-0.5 line-clamp-1 font-medium" style={{ color: '#4a5568' }}>{action.description}</p>
                    </div>

                    <div className={`p-2 rounded-xl shrink-0 transition-all duration-300 ${selected ? 'scale-110' : ''}`}>
                      <Star
                        className={`h-5 w-5 transition-all duration-300 ${selected ? 'text-amber-500 fill-amber-500 drop-shadow-lg' : 'text-gray-400'}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
