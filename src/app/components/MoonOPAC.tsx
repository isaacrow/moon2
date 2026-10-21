/**
 * MOON OPAC V2 - Professional Public Discovery Interface
 * Modern library catalog with Linked Data, faceted search, and pro design
 * Supports records from Moon BIBFRAME Template, Moon Engine, Moon Dijla, Moon K
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search, BookOpen, Download, Code, Network, ExternalLink, Filter,
  CheckCircle2, Layers, Tag, User, Calendar, Globe, Hash, FileText,
  Library, RefreshCw, LayoutGrid, List, ChevronDown, ChevronRight,
  Eye, Copy, Sparkles, BarChart3, Clock, X, ArrowUpDown, BookMarked,
  Database, Fingerprint, Info, Share2, Maximize2, Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface MoonRecord {
  id: string;
  uri: string;
  title: string;
  document: any;
  metadata: {
    created: string;
    modified: string;
    status?: string;
    catalogingInterface?: string;
    catalogingLanguage?: string;
    descriptionConventions?: string;
    templateId?: string;
    recordId?: string;
    resourceType?: string;
    cataloger?: string;
    [key: string]: any;
  };
  workUri?: string;
  instanceUri?: string;
  source: 'bibframe' | 'moon' | 'moon-engine';
}

type DisplayMode = 'human' | 'jsonld' | 'turtle' | 'graph';
type SourceFilter = 'all' | 'bibframe' | 'moon' | 'moon-engine';
type ViewLayout = 'grid' | 'list';
type SortBy = 'newest' | 'oldest' | 'title-az' | 'title-za';

// ============================== HELPERS ==============================

function extractTitleFromDocument(doc: any): string {
  if (!doc) return 'Untitled';
  if (doc['@graph'] && Array.isArray(doc['@graph'])) {
    const titleNode = doc['@graph'].find((n: any) =>
      n['@type'] === 'bf:Title' || n['@type']?.includes?.('bf:Title')
    );
    if (titleNode) {
      const main = titleNode['bf:mainTitle'] || titleNode['mainTitle'] || titleNode['rdfs:label'];
      if (main) {
        const mainStr = typeof main === 'string' ? main : (main?.['@value'] || main?.[0]?.['@value'] || JSON.stringify(main));
        const sub = titleNode['bf:subtitle'] || titleNode['subtitle'];
        const subStr = sub ? (typeof sub === 'string' ? sub : (sub?.['@value'] || '')) : '';
        return subStr ? `${mainStr} : ${subStr}` : mainStr;
      }
    }
    const workNode = doc['@graph'].find((n: any) => {
      const t = n['@type'];
      if (Array.isArray(t)) return t.some((x: string) => x?.includes?.('Work'));
      return typeof t === 'string' && t.includes('Work');
    });
    if (workNode) {
      const wTitle = workNode['bf:title'] || workNode['title'];
      if (wTitle) {
        if (typeof wTitle === 'string') {
          if (wTitle.startsWith('http')) {
            const refTitle = doc['@graph'].find((n: any) => n['@id'] === wTitle);
            if (refTitle) {
              const m = refTitle['mainTitle'] || refTitle['bf:mainTitle'];
              if (m) return typeof m === 'string' ? m : (m?.['@value'] || m?.[0]?.['@value'] || '');
            }
          }
          return wTitle;
        }
        if (wTitle['bf:mainTitle']) {
          const m = wTitle['bf:mainTitle'];
          return typeof m === 'string' ? m : (m?.['@value'] || m?.[0]?.['@value'] || JSON.stringify(m));
        }
        if (wTitle['mainTitle']) return String(wTitle['mainTitle']);
      }
      if (workNode['rdfs:label']) return String(workNode['rdfs:label']);
    }
    const instNode = doc['@graph'].find((n: any) => {
      const t = n['@type'];
      if (Array.isArray(t)) return t.some((x: string) => x?.includes?.('Instance'));
      return typeof t === 'string' && t.includes('Instance');
    });
    if (instNode) {
      const iTitle = instNode['bf:title'] || instNode['title'];
      if (iTitle) {
        if (typeof iTitle === 'string' && iTitle.startsWith('http')) {
          const refTitle = doc['@graph'].find((n: any) => n['@id'] === iTitle);
          if (refTitle) {
            const m = refTitle['mainTitle'] || refTitle['bf:mainTitle'];
            if (m) return typeof m === 'string' ? m : (m?.['@value'] || '');
          }
        }
        if (typeof iTitle === 'string') return iTitle;
        if (iTitle['bf:mainTitle']) {
          const m = iTitle['bf:mainTitle'];
          return typeof m === 'string' ? m : (m?.['@value'] || '');
        }
      }
      if (instNode['rdfs:label']) return String(instNode['rdfs:label']);
    }
  }
  return 'Untitled';
}

function getWorkNode(doc: any): any | null {
  if (!doc?.['@graph'] || !Array.isArray(doc['@graph'])) return null;
  return doc['@graph'].find((n: any) => {
    const t = n['@type'];
    if (Array.isArray(t)) return t.some((x: string) => x?.includes?.('Work'));
    return typeof t === 'string' && t.includes('Work');
  }) || null;
}

function getInstanceNode(doc: any): any | null {
  if (!doc?.['@graph'] || !Array.isArray(doc['@graph'])) return null;
  return doc['@graph'].find((n: any) => {
    const t = n['@type'];
    if (Array.isArray(t)) return t.some((x: string) => x?.includes?.('Instance'));
    return typeof t === 'string' && t.includes('Instance');
  }) || null;
}

function extractContributions(workNode: any, graph: any[]): Array<{ role: string; name: string; uri?: string }> {
  const contributions: Array<{ role: string; name: string; uri?: string }> = [];
  if (!workNode) return contributions;
  const contribs = workNode['bf:contribution'];
  if (contribs) {
    const contribArr = Array.isArray(contribs) ? contribs : [contribs];
    for (const c of contribArr) {
      let contribNode = c;
      if (typeof c === 'string' && c.startsWith('http')) {
        contribNode = graph.find((n: any) => n['@id'] === c);
      }
      if (!contribNode) continue;
      const role = contribNode['bf:role']
        ? (typeof contribNode['bf:role'] === 'string'
          ? contribNode['bf:role']
          : contribNode['bf:role']?.['rdfs:label'] || contribNode['bf:role']?.['@id'] || 'Contributor')
        : 'Contributor';
      const agent = contribNode['bf:agent'];
      if (agent) {
        let agentNode = agent;
        if (typeof agent === 'string' && agent.startsWith('http')) {
          agentNode = graph.find((n: any) => n['@id'] === agent);
        }
        if (agentNode) {
          const name = agentNode['rdfs:label'] || agentNode['@id'] || 'Unknown';
          contributions.push({
            role: typeof role === 'string' ? role : String(role),
            name: typeof name === 'string' ? name : String(name),
            uri: agentNode['@id']
          });
        }
      }
    }
  }
  if (workNode['bf:creator']) {
    const creators = Array.isArray(workNode['bf:creator']) ? workNode['bf:creator'] : [workNode['bf:creator']];
    for (const cr of creators) {
      const label = cr?.['rdfs:label'] || cr?.label || cr?.uri || (typeof cr === 'string' ? cr : '');
      if (label) contributions.push({ role: 'Creator', name: String(label), uri: cr?.uri || cr?.['@id'] });
    }
  }
  return contributions;
}

function extractSubjects(workNode: any, graph: any[]): Array<{ label: string; uri?: string }> {
  if (!workNode?.['bf:subject']) return [];
  const subjects = Array.isArray(workNode['bf:subject']) ? workNode['bf:subject'] : [workNode['bf:subject']];
  return subjects.map((s: any) => {
    if (typeof s === 'string') {
      const node = graph.find((n: any) => n['@id'] === s);
      return { label: node?.['rdfs:label'] || s, uri: s };
    }
    return { label: s?.['rdfs:label'] || s?.label || s?.['@id'] || '', uri: s?.['@id'] || s?.uri };
  }).filter((s: any) => s.label);
}

function extractIdentifiers(instNode: any, graph: any[]): Array<{ type: string; value: string }> {
  if (!instNode?.['bf:identifiedBy']) return [];
  const ids = Array.isArray(instNode['bf:identifiedBy']) ? instNode['bf:identifiedBy'] : [instNode['bf:identifiedBy']];
  return ids.map((id: any) => {
    if (typeof id === 'string') {
      const node = graph.find((n: any) => n['@id'] === id);
      return { type: node?.['@type'] || 'Identifier', value: node?.['rdf:value'] || id };
    }
    const t = id?.['@type'] || 'Identifier';
    return {
      type: typeof t === 'string' ? t.replace('bf:', '') : (Array.isArray(t) ? t[0]?.replace('bf:', '') : 'Identifier'),
      value: id?.['rdf:value'] || id?.['@value'] || ''
    };
  }).filter((id: any) => id.value);
}

function extractProvisionActivity(instNode: any, graph: any[]): Array<{ type: string; agent?: string; place?: string; date?: string }> {
  if (!instNode?.['bf:provisionActivity']) return [];
  const pas = Array.isArray(instNode['bf:provisionActivity']) ? instNode['bf:provisionActivity'] : [instNode['bf:provisionActivity']];
  return pas.map((pa: any) => {
    let node = pa;
    if (typeof pa === 'string') {
      node = graph.find((n: any) => n['@id'] === pa) || {};
    }
    return {
      type: (node['@type'] || 'Publication').toString().replace('bf:', ''),
      agent: node['bf:agent']?.['rdfs:label'] || node['bf:agent']?.['@id'] || '',
      place: node['bf:place']?.['rdfs:label'] || node['bf:place']?.['@id'] || '',
      date: node['bf:date'] || ''
    };
  });
}

function generateTurtle(doc: any): string {
  if (!doc?.['@graph'] || !Array.isArray(doc['@graph'])) return '# No @graph data available';
  const lines: string[] = [
    '@prefix bf: <http://id.loc.gov/ontologies/bibframe/> .',
    '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .',
    '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .',
    ''
  ];
  for (const node of doc['@graph']) {
    const id = node['@id'] || '_:blank';
    const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
    lines.push(`<${id}>`);
    lines.push(`    a ${types.filter(Boolean).join(', ')} ;`);
    const props = Object.keys(node).filter(k => k !== '@id' && k !== '@type');
    props.forEach((key, i) => {
      const val = node[key];
      const isLast = i === props.length - 1;
      const terminator = isLast ? ' .' : ' ;';
      if (typeof val === 'string') {
        if (val.startsWith('http')) {
          lines.push(`    ${key} <${val}>${terminator}`);
        } else {
          lines.push(`    ${key} "${val.replace(/"/g, '\\"')}"${terminator}`);
        }
      } else if (val && typeof val === 'object' && val['@id']) {
        lines.push(`    ${key} <${val['@id']}>${terminator}`);
      } else {
        lines.push(`    ${key} "${JSON.stringify(val).replace(/"/g, '\\"').substring(0, 200)}"${terminator}`);
      }
    });
    lines.push('');
  }
  return lines.join('\n');
}

function getSourceMeta(source: string) {
  switch (source) {
    case 'bibframe': return { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', label: 'BIBFRAME', icon: '~' };
    case 'moon': return { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', label: 'Moon', icon: '~' };
    case 'moon-engine': return { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', label: 'Engine', icon: '~' };
    default: return { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)', label: 'Unknown', icon: '~' };
  }
}

function getSourceLabel(source: string, catalogingInterface?: string): string {
  if (catalogingInterface) return catalogingInterface;
  switch (source) {
    case 'bibframe': return 'BIBFRAME Template';
    case 'moon': return 'Moon Records';
    case 'moon-engine': return 'Moon Engine';
    default: return 'Unknown';
  }
}

function getResourceTypeIcon(doc: any): string {
  const workNode = getWorkNode(doc);
  if (!workNode) return 'book';
  const types = Array.isArray(workNode['@type']) ? workNode['@type'] : [workNode['@type'] || ''];
  const typeStr = types.join(' ').toLowerCase();
  if (typeStr.includes('text') || typeStr.includes('book')) return 'book';
  if (typeStr.includes('audio') || typeStr.includes('music')) return 'music';
  if (typeStr.includes('video') || typeStr.includes('moving')) return 'video';
  if (typeStr.includes('cartograph') || typeStr.includes('map')) return 'map';
  if (typeStr.includes('serial') || typeStr.includes('journal')) return 'journal';
  return 'book';
}

function getResourceTypeColor(doc: any): string {
  const icon = getResourceTypeIcon(doc);
  switch (icon) {
    case 'book': return '#6366f1';
    case 'music': return '#ec4899';
    case 'video': return '#f59e0b';
    case 'map': return '#10b981';
    case 'journal': return '#06b6d4';
    default: return '#6366f1';
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// ============================== MAIN COMPONENT ==============================

export function MoonOPAC() {
  const [records, setRecords] = useState<MoonRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MoonRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('human');
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [turtleData, setTurtleData] = useState('');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('list');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadAllRecords(); }, []);

  const filteredRecords = useMemo(() => {
    let result = records;
    if (sourceFilter !== 'all') {
      result = result.filter(r => r.source === sourceFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(record =>
        record.title.toLowerCase().includes(query) ||
        (record.metadata?.catalogingInterface || '').toLowerCase().includes(query) ||
        JSON.stringify(record.document).toLowerCase().includes(query)
      );
    }
    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.metadata.modified || b.metadata.created || 0).getTime() - new Date(a.metadata.modified || a.metadata.created || 0).getTime();
        case 'oldest': return new Date(a.metadata.modified || a.metadata.created || 0).getTime() - new Date(b.metadata.modified || b.metadata.created || 0).getTime();
        case 'title-az': return a.title.localeCompare(b.title);
        case 'title-za': return b.title.localeCompare(a.title);
        default: return 0;
      }
    });
    return result;
  }, [records, searchQuery, sourceFilter, sortBy]);

  useEffect(() => {
    if (selectedRecord) {
      const existingScript = document.getElementById('moon-jsonld-seo');
      if (existingScript) existingScript.remove();
      const script = document.createElement('script');
      script.id = 'moon-jsonld-seo';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(selectedRecord.document, null, 2);
      document.head.appendChild(script);
      return () => {
        const scriptToRemove = document.getElementById('moon-jsonld-seo');
        if (scriptToRemove) scriptToRemove.remove();
      };
    }
  }, [selectedRecord]);

  useEffect(() => {
    if (selectedRecord && displayMode === 'turtle') {
      if (selectedRecord.source === 'moon') {
        loadTurtleFromServer(selectedRecord.id);
      } else {
        setTurtleData(generateTurtle(selectedRecord.document));
      }
    }
  }, [selectedRecord, displayMode]);

  const loadTurtleFromServer = async (recordId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/records/${recordId}/turtle`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      if (response.ok) {
        setTurtleData(await response.text());
      } else {
        if (selectedRecord) setTurtleData(generateTurtle(selectedRecord.document));
      }
    } catch (error) {
      console.error('Load turtle error:', error);
      if (selectedRecord) setTurtleData(generateTurtle(selectedRecord.document));
    }
  };

  const loadAllRecords = async () => {
    setLoading(true);
    const allRecords: MoonRecord[] = [];

    // 1. BIBFRAME records
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/records`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      if (response.ok) {
        const data = await response.json();
        const bibRecords = (data.records || []).map((r: any) => ({
          id: r.id,
          uri: `https://moon.org/record/${r.id}`,
          title: r.title || extractTitleFromDocument(r.document) || 'Untitled',
          document: r.document,
          metadata: {
            created: r.saved || r.metadata?.created || new Date().toISOString(),
            modified: r.saved || r.metadata?.modified || new Date().toISOString(),
            status: r.metadata?.status || 'draft',
            catalogingInterface: r.metadata?.catalogingInterface,
            catalogingLanguage: r.metadata?.catalogingLanguage,
            descriptionConventions: r.metadata?.descriptionConventions,
            templateId: r.metadata?.templateId,
            recordId: r.metadata?.recordId,
            resourceType: r.metadata?.resourceType,
            cataloger: r.metadata?.cataloger,
            ...r.metadata,
          },
          workUri: getWorkNode(r.document)?.['@id'],
          instanceUri: getInstanceNode(r.document)?.['@id'],
          source: 'bibframe' as const,
        }));
        allRecords.push(...bibRecords);
        console.log(`[OPAC V2] Loaded ${bibRecords.length} BIBFRAME records`);
      }
    } catch (error) {
      console.error('[OPAC V2] Error loading BIBFRAME records:', error);
    }

    // 2. Moon records
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/records`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      if (response.ok) {
        const data = await response.json();
        const moonRecs = (data.records || []).map((r: any) => ({
          ...r,
          uri: r.uri || `https://moon.org/record/${r.id}`,
          title: r.title || extractTitleFromDocument(r.document) || 'Untitled',
          metadata: {
            created: r.metadata?.created || new Date().toISOString(),
            modified: r.metadata?.modified || new Date().toISOString(),
            status: r.metadata?.status || 'published',
            ...r.metadata,
          },
          source: 'moon' as const,
        }));
        for (const mr of moonRecs) {
          if (!allRecords.some(r => r.id === mr.id)) allRecords.push(mr);
        }
        console.log(`[OPAC V2] Loaded ${moonRecs.length} Moon records`);
      }
    } catch (error) {
      console.error('[OPAC V2] Error loading Moon records:', error);
    }

    // 3. Moon Engine records
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon-engine/records`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      if (response.ok) {
        const data = await response.json();
        const meRecs = (data.records || []).map((r: any) => ({
          id: r.id,
          uri: `https://moon.org/record/${r.id}`,
          title: r.title || extractTitleFromDocument(r.document) || 'Untitled',
          document: r.document,
          metadata: {
            created: r.saved || new Date().toISOString(),
            modified: r.saved || new Date().toISOString(),
            status: 'draft',
            ...r.metadata,
          },
          workUri: getWorkNode(r.document)?.['@id'],
          instanceUri: getInstanceNode(r.document)?.['@id'],
          source: 'moon-engine' as const,
        }));
        for (const me of meRecs) {
          if (!allRecords.some(r => r.id === me.id)) allRecords.push(me);
        }
        console.log(`[OPAC V2] Loaded ${meRecs.length} Moon Engine records`);
      }
    } catch (error) {
      console.error('[OPAC V2] Error loading Moon Engine records:', error);
    }

    allRecords.sort((a, b) => {
      const dateA = new Date(a.metadata.modified || a.metadata.created || 0).getTime();
      const dateB = new Date(b.metadata.modified || b.metadata.created || 0).getTime();
      return dateB - dateA;
    });

    setRecords(allRecords);
    setLoading(false);
    console.log(`[OPAC V2] Total records loaded: ${allRecords.length}`);
  };

  const downloadRecord = (format: 'jsonld' | 'turtle' | 'ntriples') => {
    if (!selectedRecord) return;
    let data: string;
    let mimeType: string;
    let ext: string;
    if (format === 'jsonld') {
      data = JSON.stringify(selectedRecord.document, null, 2);
      mimeType = 'application/ld+json';
      ext = 'jsonld';
    } else if (format === 'turtle') {
      data = turtleData || generateTurtle(selectedRecord.document);
      mimeType = 'text/turtle';
      ext = 'ttl';
    } else {
      data = generateTurtle(selectedRecord.document);
      mimeType = 'application/n-triples';
      ext = 'nt';
    }
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedRecord.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const sourceCounts = useMemo(() => {
    const counts = { all: records.length, bibframe: 0, moon: 0, 'moon-engine': 0 };
    records.forEach(r => { counts[r.source]++; });
    return counts;
  }, [records]);

  // Unique languages, statuses for facets
  const facets = useMemo(() => {
    const langs = new Set<string>();
    const statuses = new Set<string>();
    records.forEach(r => {
      if (r.metadata.catalogingLanguage) langs.add(r.metadata.catalogingLanguage);
      if (r.metadata.status) statuses.add(r.metadata.status);
    });
    return { languages: Array.from(langs), statuses: Array.from(statuses) };
  }, [records]);

  const graphNodeCount = useMemo(() => {
    return records.reduce((sum, r) => sum + (r.document?.['@graph']?.length || 0), 0);
  }, [records]);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0f0a2e 30%, #1a0a35 60%, #0d1117 100%)' }}>
      {/* ============= HEADER ============= */}
      <header style={{
        background: 'linear-gradient(180deg, rgba(15,10,46,0.95) 0%, rgba(10,10,26,0.85) 100%)',
        borderBottom: '1px solid rgba(139,92,246,0.15)',
        backdropFilter: 'blur(24px)',
      }}>
        <div className="max-w-[1600px] mx-auto px-6 pt-8 pb-6">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}>
                  <Library className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0a0a1a]" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <span style={{ color: '#e2e8f0' }}>MOON</span>
                  <span style={{
                    background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>OPAC</span>
                  <span className="text-sm font-bold px-2.5 py-1 rounded-lg" style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.2))',
                    border: '1px solid rgba(139,92,246,0.3)',
                    color: '#a78bfa',
                  }}>V2</span>
                </h1>
                <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
                  Linked Data Discovery Interface
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadAllRecords}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                }}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))', filter: 'blur(8px)' }} />
              <div className="relative flex items-center">
                <Search className="absolute left-5 h-5 w-5" style={{ color: '#6366f1' }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, subject, identifier..."
                  className="w-full pl-14 pr-14 py-4 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '15px',
                  }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.4)'; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-5">
                    <X className="h-4 w-4" style={{ color: '#64748b' }} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { label: 'Total Records', value: records.length, icon: Database, color: '#6366f1' },
              { label: 'BIBFRAME', value: sourceCounts.bibframe, icon: BookMarked, color: '#10b981' },
              { label: 'Moon', value: sourceCounts.moon, icon: Sparkles, color: '#3b82f6' },
              { label: 'Engine', value: sourceCounts['moon-engine'], icon: Layers, color: '#a855f7' },
              { label: 'Graph Nodes', value: graphNodeCount, icon: Network, color: '#f59e0b' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-2.5 px-4 py-2 rounded-xl" style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                <span className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</span>
                <span className="text-xs font-medium" style={{ color: '#64748b' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ============= MAIN CONTENT ============= */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* ===== LEFT: Filters + Record List ===== */}
          <div className={`${selectedRecord && !detailExpanded ? 'w-[380px]' : selectedRecord && detailExpanded ? 'hidden' : 'flex-1'} flex-shrink-0 space-y-4 transition-all`}>
            {/* Filter + View Controls */}
            <div className="flex items-center justify-between gap-3">
              {/* Source Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {([
                  { key: 'all' as const, label: 'All', color: '#8b5cf6' },
                  { key: 'bibframe' as const, label: 'BIBFRAME', color: '#10b981' },
                  { key: 'moon' as const, label: 'Moon', color: '#3b82f6' },
                  { key: 'moon-engine' as const, label: 'Engine', color: '#a855f7' },
                ]).map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() => setSourceFilter(key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: sourceFilter === key ? `${color}20` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${sourceFilter === key ? `${color}50` : 'rgba(255,255,255,0.06)'}`,
                      color: sourceFilter === key ? color : '#64748b',
                    }}
                  >
                    {label}
                    <span className="ml-1.5 opacity-70">{sourceCounts[key]}</span>
                  </button>
                ))}
              </div>

              {/* View & Sort */}
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    onClick={() => setViewLayout('list')}
                    className="p-1.5 transition-all"
                    style={{ background: viewLayout === 'list' ? 'rgba(99,102,241,0.2)' : 'transparent', color: viewLayout === 'list' ? '#818cf8' : '#475569' }}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewLayout('grid')}
                    className="p-1.5 transition-all"
                    style={{ background: viewLayout === 'grid' ? 'rgba(99,102,241,0.2)' : 'transparent', color: viewLayout === 'grid' ? '#818cf8' : '#475569' }}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="text-xs px-2 py-1.5 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                  }}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title-az">A-Z</option>
                  <option value="title-za">Z-A</option>
                </select>
              </div>
            </div>

            {/* Records */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <RefreshCw className="h-6 w-6 animate-spin" style={{ color: '#6366f1' }} />
                </div>
                <p style={{ color: '#64748b' }} className="text-sm">Loading records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <BookOpen className="h-12 w-12 mb-4" style={{ color: '#1e293b' }} />
                <p style={{ color: '#475569' }} className="text-sm font-semibold">No records found</p>
                <p style={{ color: '#334155' }} className="text-xs mt-1">Save a record from any Moon module to see it here.</p>
              </div>
            ) : (
              <div className={viewLayout === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
                <AnimatePresence>
                  {filteredRecords.map((record, idx) => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      isSelected={selectedRecord?.id === record.id}
                      onClick={() => { setSelectedRecord(record); setDetailExpanded(false); }}
                      layout={viewLayout}
                      index={idx}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ===== RIGHT: Detail Panel ===== */}
          <AnimatePresence>
            {selectedRecord && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className={`${detailExpanded ? 'flex-1' : 'flex-1'} min-w-0`}
              >
                <DetailPanel
                  record={selectedRecord}
                  displayMode={displayMode}
                  setDisplayMode={setDisplayMode}
                  turtleData={turtleData}
                  onClose={() => setSelectedRecord(null)}
                  onDownload={downloadRecord}
                  onCopy={copyToClipboard}
                  copied={copied}
                  expanded={detailExpanded}
                  onToggleExpand={() => setDetailExpanded(!detailExpanded)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== Placeholder when no record selected ===== */}
          {!selectedRecord && (
            <div className="flex-1 flex items-center justify-center rounded-2xl min-h-[500px]" style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.06)',
            }}>
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <Eye className="h-9 w-9" style={{ color: '#4338ca' }} />
                </div>
                <p className="text-lg font-bold" style={{ color: '#334155' }}>Select a record</p>
                <p className="text-sm mt-1" style={{ color: '#1e293b' }}>Click any record to view its full BIBFRAME detail</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================== RECORD CARD ==============================

function RecordCard({ record, isSelected, onClick, layout, index }: {
  record: MoonRecord;
  isSelected: boolean;
  onClick: () => void;
  layout: ViewLayout;
  index: number;
}) {
  const graph = record.document?.['@graph'] || [];
  const workNode = getWorkNode(record.document);
  const contributions = extractContributions(workNode, graph);
  const sourceMeta = getSourceMeta(record.source);
  const typeColor = getResourceTypeColor(record.document);
  const nodeCount = graph.length;

  if (layout === 'grid') {
    return (
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        onClick={onClick}
        className="w-full text-left rounded-xl p-4 transition-all group"
        style={{
          background: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${isSelected ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.05)'}`,
          boxShadow: isSelected ? '0 0 20px rgba(99,102,241,0.1)' : 'none',
        }}
      >
        {/* Type color bar */}
        <div className="w-full h-1 rounded-full mb-3" style={{ background: `linear-gradient(90deg, ${typeColor}, ${typeColor}44)` }} />
        <p className="font-bold text-sm truncate mb-1.5" style={{ color: isSelected ? '#e2e8f0' : '#cbd5e1' }}>
          {record.title}
        </p>
        {contributions[0] && (
          <p className="text-xs truncate mb-2" style={{ color: '#64748b' }}>{contributions[0].name}</p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{
            background: sourceMeta.bg,
            color: sourceMeta.color,
            border: `1px solid ${sourceMeta.border}`,
          }}>
            {sourceMeta.label}
          </span>
          <span className="text-[10px]" style={{ color: '#475569' }}>{nodeCount} nodes</span>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      onClick={onClick}
      className="w-full text-left rounded-xl transition-all group flex items-center gap-4 px-4 py-3.5"
      style={{
        background: isSelected ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isSelected ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.04)'}`,
        boxShadow: isSelected ? '0 0 25px rgba(99,102,241,0.08), inset 0 0 0 1px rgba(99,102,241,0.1)' : 'none',
      }}
    >
      {/* Color indicator */}
      <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: isSelected ? '#6366f1' : typeColor + '40' }} />

      {/* Type badge */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
        background: `${typeColor}15`,
        border: `1px solid ${typeColor}25`,
      }}>
        <BookOpen className="h-4.5 w-4.5" style={{ color: typeColor }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm truncate" style={{ color: isSelected ? '#e2e8f0' : '#cbd5e1' }}>
            {record.title}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {contributions[0] && (
            <span className="text-xs truncate" style={{ color: '#64748b' }}>{contributions[0].name}</span>
          )}
          {contributions[0] && <span style={{ color: '#334155' }}>|</span>}
          <span className="text-xs" style={{ color: '#475569' }}>
            {timeAgo(record.metadata.modified || record.metadata.created)}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] font-bold px-2 py-1 rounded-md" style={{
          background: sourceMeta.bg,
          color: sourceMeta.color,
          border: `1px solid ${sourceMeta.border}`,
        }}>
          {sourceMeta.label}
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{
          background: 'rgba(255,255,255,0.04)',
          color: '#475569',
        }}>
          {nodeCount}
        </span>
        <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#475569' }} />
      </div>
    </motion.button>
  );
}

// ============================== DETAIL PANEL ==============================

function DetailPanel({ record, displayMode, setDisplayMode, turtleData, onClose, onDownload, onCopy, copied, expanded, onToggleExpand }: {
  record: MoonRecord;
  displayMode: DisplayMode;
  setDisplayMode: (m: DisplayMode) => void;
  turtleData: string;
  onClose: () => void;
  onDownload: (f: 'jsonld' | 'turtle' | 'ntriples') => void;
  onCopy: (text: string) => void;
  copied: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const graph = record.document?.['@graph'] || [];
  const workNode = getWorkNode(record.document);
  const instanceNode = getInstanceNode(record.document);
  const contributions = extractContributions(workNode, graph);
  const subjects = extractSubjects(workNode, graph);
  const identifiers = extractIdentifiers(instanceNode, graph);
  const provisionActivities = extractProvisionActivity(instanceNode, graph);
  const sourceMeta = getSourceMeta(record.source);

  const language = workNode?.['bf:language'];
  const languageLabel = language
    ? (Array.isArray(language)
      ? language.map((l: any) => l?.['rdfs:label'] || l?.['@id'] || '').filter(Boolean).join(', ')
      : language?.['rdfs:label'] || language?.['@id'] || '')
    : '';

  const contentType = workNode?.['bf:content'];
  const contentLabel = contentType
    ? (Array.isArray(contentType)
      ? contentType.map((c: any) => c?.['rdfs:label'] || '').filter(Boolean).join(', ')
      : contentType?.['rdfs:label'] || '')
    : '';

  const summary = workNode?.['bf:summary'];
  const summaryText = summary
    ? (Array.isArray(summary)
      ? summary.map((s: any) => s?.['rdfs:label'] || '').filter(Boolean).join('; ')
      : summary?.['rdfs:label'] || '')
    : '';

  const extent = instanceNode?.['bf:extent'];
  const extentLabel = extent?.['rdfs:label'] || '';
  const dimensions = instanceNode?.['bf:dimensions'] || '';

  const displayTabs: { key: DisplayMode; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'human', label: 'Catalog', icon: <BookOpen className="h-3.5 w-3.5" />, color: '#6366f1' },
    { key: 'jsonld', label: 'JSON-LD', icon: <Code className="h-3.5 w-3.5" />, color: '#10b981' },
    { key: 'turtle', label: 'Turtle', icon: <Code className="h-3.5 w-3.5" />, color: '#06b6d4' },
    { key: 'graph', label: 'Graph', icon: <Network className="h-3.5 w-3.5" />, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-4">
      {/* ===== Record Header Card ===== */}
      <div className="rounded-2xl overflow-hidden" style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Gradient banner */}
        <div className="h-2" style={{
          background: `linear-gradient(90deg, ${sourceMeta.color}, #6366f1, #a855f7)`,
        }} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg" style={{
                  background: sourceMeta.bg,
                  color: sourceMeta.color,
                  border: `1px solid ${sourceMeta.border}`,
                }}>
                  {getSourceLabel(record.source, record.metadata?.catalogingInterface)}
                </span>
                {record.metadata.status && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg" style={{
                    background: record.metadata.status === 'published' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                    color: record.metadata.status === 'published' ? '#10b981' : '#f59e0b',
                    border: `1px solid ${record.metadata.status === 'published' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                  }}>
                    {record.metadata.status}
                  </span>
                )}
                <span className="text-[10px] font-mono" style={{ color: '#475569' }}>
                  {graph.length} nodes
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: '#f1f5f9' }}>
                {record.title}
              </h2>
              {contributions.length > 0 && (
                <p className="text-sm mt-2" style={{ color: '#94a3b8' }}>
                  {contributions.map((c, i) => (
                    <span key={i}>
                      {i > 0 && <span style={{ color: '#334155' }}> ; </span>}
                      {c.uri ? (
                        <a href={c.uri} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#818cf8' }}>
                          {c.name}
                        </a>
                      ) : c.name}
                      {c.role && c.role !== 'Contributor' && (
                        <span className="ml-1 text-xs" style={{ color: '#475569' }}>({c.role})</span>
                      )}
                    </span>
                  ))}
                </p>
              )}
              {record.uri && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Globe className="h-3 w-3" style={{ color: '#475569' }} />
                  <span className="text-xs font-mono truncate" style={{ color: '#475569' }}>{record.uri}</span>
                  <button onClick={() => onCopy(record.uri)} className="ml-1">
                    <Copy className="h-3 w-3" style={{ color: '#475569' }} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={onToggleExpand} className="p-2 rounded-lg transition-all" style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#64748b',
              }}>
                {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button onClick={onClose} className="p-2 rounded-lg transition-all" style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#64748b',
              }}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick info pills */}
          <div className="flex flex-wrap gap-2">
            {languageLabel && (
              <InfoPill icon={<Globe className="h-3 w-3" />} label={languageLabel} color="#6366f1" />
            )}
            {contentLabel && (
              <InfoPill icon={<FileText className="h-3 w-3" />} label={contentLabel} color="#a855f7" />
            )}
            {extentLabel && (
              <InfoPill icon={<BookOpen className="h-3 w-3" />} label={extentLabel} color="#06b6d4" />
            )}
            {dimensions && (
              <InfoPill icon={<Layers className="h-3 w-3" />} label={dimensions} color="#f59e0b" />
            )}
            <InfoPill
              icon={<Clock className="h-3 w-3" />}
              label={timeAgo(record.metadata.modified || record.metadata.created)}
              color="#64748b"
            />
          </div>
        </div>
      </div>

      {/* ===== Display Mode Tabs ===== */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl" style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        {displayTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setDisplayMode(tab.key)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex-1 justify-center"
            style={{
              background: displayMode === tab.key ? `${tab.color}15` : 'transparent',
              border: `1px solid ${displayMode === tab.key ? `${tab.color}30` : 'transparent'}`,
              color: displayMode === tab.key ? tab.color : '#475569',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== Content ===== */}
      <div className="rounded-2xl overflow-hidden" style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {displayMode === 'human' && (
                <HumanViewV2
                  record={record}
                  workNode={workNode}
                  instanceNode={instanceNode}
                  contributions={contributions}
                  subjects={subjects}
                  identifiers={identifiers}
                  provisionActivities={provisionActivities}
                  summaryText={summaryText}
                />
              )}
              {displayMode === 'jsonld' && <JSONLDViewV2 record={record} onCopy={onCopy} copied={copied} />}
              {displayMode === 'turtle' && <TurtleViewV2 turtle={turtleData} onCopy={onCopy} copied={copied} />}
              {displayMode === 'graph' && <GraphViewV2 record={record} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ===== Export & SEO ===== */}
      <div className="flex gap-4">
        {/* Export */}
        <div className="flex-1 rounded-2xl p-5" style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#94a3b8' }}>
            <Download className="h-4 w-4" style={{ color: '#6366f1' }} />
            Export Linked Data
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { format: 'jsonld' as const, label: 'JSON-LD', color: '#10b981' },
              { format: 'turtle' as const, label: 'Turtle', color: '#06b6d4' },
              { format: 'ntriples' as const, label: 'N-Triples', color: '#8b5cf6' },
            ].map(exp => (
              <button
                key={exp.format}
                onClick={() => onDownload(exp.format)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: `${exp.color}10`,
                  border: `1px solid ${exp.color}25`,
                  color: exp.color,
                }}
              >
                <Download className="h-3.5 w-3.5" />
                {exp.label}
              </button>
            ))}
          </div>
        </div>

        {/* SEO Status */}
        <div className="w-[280px] rounded-2xl p-5" style={{
          background: 'rgba(16,185,129,0.03)',
          border: '1px solid rgba(16,185,129,0.1)',
        }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }} />
            <h3 className="text-xs font-bold" style={{ color: '#10b981' }}>SEO EMBEDDED</h3>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: '#475569' }}>
            JSON-LD injected into page HEAD for search engine discoverability and Linked Data indexing.
          </p>
          <code className="block text-[10px] font-mono mt-2 px-2 py-1 rounded" style={{
            background: 'rgba(16,185,129,0.08)',
            color: '#34d399',
          }}>
            &lt;script type="application/ld+json"&gt;
          </code>
        </div>
      </div>
    </div>
  );
}

// ============================== INFO PILL ==============================

function InfoPill({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{
      background: `${color}10`,
      color: color,
      border: `1px solid ${color}20`,
    }}>
      {icon}
      {label}
    </span>
  );
}

// ============================== HUMAN VIEW V2 ==============================

function HumanViewV2({ record, workNode, instanceNode, contributions, subjects, identifiers, provisionActivities, summaryText }: {
  record: MoonRecord;
  workNode: any;
  instanceNode: any;
  contributions: Array<{ role: string; name: string; uri?: string }>;
  subjects: Array<{ label: string; uri?: string }>;
  identifiers: Array<{ type: string; value: string }>;
  provisionActivities: Array<{ type: string; agent?: string; place?: string; date?: string }>;
  summaryText: string;
}) {
  return (
    <div className="space-y-5">
      {/* Summary */}
      {summaryText && (
        <div className="rounded-xl p-4" style={{
          background: 'rgba(99,102,241,0.05)',
          border: '1px solid rgba(99,102,241,0.1)',
        }}>
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#818cf8' }} />
            <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>{summaryText}</p>
          </div>
        </div>
      )}

      {/* Entity Cards Row */}
      <div className="grid grid-cols-2 gap-3">
        <EntityCard
          title="Work"
          subtitle="Intellectual Content"
          color="#6366f1"
          uri={workNode?.['@id']}
          type={Array.isArray(workNode?.['@type']) ? workNode['@type'].join(', ') : workNode?.['@type']}
        />
        <EntityCard
          title="Instance"
          subtitle="Physical Manifestation"
          color="#a855f7"
          uri={instanceNode?.['@id']}
          type={Array.isArray(instanceNode?.['@type']) ? instanceNode['@type'].join(', ') : instanceNode?.['@type']}
        />
      </div>

      {/* Contributors */}
      {contributions.length > 0 && (
        <SectionCard title="Contributors" icon={<User className="h-4 w-4" />} color="#06b6d4">
          <div className="space-y-2.5">
            {contributions.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" style={{
                  background: 'rgba(6,182,212,0.1)',
                  color: '#06b6d4',
                  border: '1px solid rgba(6,182,212,0.2)',
                }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  {c.uri ? (
                    <a href={c.uri} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:underline flex items-center gap-1" style={{ color: '#818cf8' }}>
                      {c.name} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{c.name}</span>
                  )}
                  <span className="text-xs block" style={{ color: '#64748b' }}>{c.role}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Subjects */}
      {subjects.length > 0 && (
        <SectionCard title="Subjects" icon={<Tag className="h-4 w-4" />} color="#f59e0b">
          <div className="flex flex-wrap gap-2">
            {subjects.map((s, i) => (
              <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{
                background: 'rgba(245,158,11,0.08)',
                color: '#fbbf24',
                border: '1px solid rgba(245,158,11,0.2)',
              }}>
                {s.label}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Identifiers */}
      {identifiers.length > 0 && (
        <SectionCard title="Identifiers" icon={<Fingerprint className="h-4 w-4" />} color="#10b981">
          <div className="space-y-2">
            {identifiers.map((id, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[10px] font-black px-2 py-1 rounded-md min-w-[64px] text-center" style={{
                  background: 'rgba(16,185,129,0.1)',
                  color: '#34d399',
                  border: '1px solid rgba(16,185,129,0.2)',
                }}>
                  {id.type}
                </span>
                <span className="text-sm font-mono" style={{ color: '#cbd5e1' }}>{id.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Publication */}
      {provisionActivities.length > 0 && (
        <SectionCard title="Publication" icon={<Calendar className="h-4 w-4" />} color="#ec4899">
          {provisionActivities.map((pa, i) => (
            <div key={i} className="flex items-start gap-3 mb-2 last:mb-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                background: 'rgba(236,72,153,0.08)',
                border: '1px solid rgba(236,72,153,0.15)',
              }}>
                <Calendar className="h-3.5 w-3.5" style={{ color: '#ec4899' }} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase" style={{ color: '#f472b6' }}>{pa.type}</span>
                <p className="text-sm mt-0.5" style={{ color: '#cbd5e1' }}>
                  {pa.agent && <span>{pa.agent}</span>}
                  {pa.place && <span className="ml-1" style={{ color: '#94a3b8' }}>({pa.place})</span>}
                  {pa.date && <span className="ml-1" style={{ color: '#94a3b8' }}>, {pa.date}</span>}
                </p>
              </div>
            </div>
          ))}
        </SectionCard>
      )}

      {/* Cataloging Metadata */}
      <SectionCard title="Cataloging Metadata" icon={<Layers className="h-4 w-4" />} color="#64748b">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <MetaField label="Created" value={record.metadata.created ? new Date(record.metadata.created).toLocaleString() : 'N/A'} />
          <MetaField label="Modified" value={record.metadata.modified ? new Date(record.metadata.modified).toLocaleString() : 'N/A'} />
          <MetaField label="Status" value={record.metadata.status || 'N/A'} />
          <MetaField label="Record ID" value={record.id} mono />
          {record.metadata.catalogingInterface && <MetaField label="Interface" value={record.metadata.catalogingInterface} />}
          {record.metadata.catalogingLanguage && <MetaField label="Language" value={record.metadata.catalogingLanguage} />}
          {record.metadata.descriptionConventions && <MetaField label="Conventions" value={record.metadata.descriptionConventions} />}
          {record.metadata.resourceType && <MetaField label="Resource Type" value={record.metadata.resourceType} />}
          {record.metadata.cataloger && <MetaField label="Cataloger" value={record.metadata.cataloger} />}
        </div>
      </SectionCard>
    </div>
  );
}

// ============================== SUB-COMPONENTS ==============================

function EntityCard({ title, subtitle, color, uri, type }: {
  title: string; subtitle: string; color: string; uri?: string; type?: string;
}) {
  return (
    <div className="rounded-xl p-4" style={{
      background: `${color}08`,
      border: `1px solid ${color}15`,
    }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-xs font-black uppercase tracking-wide" style={{ color }}>{title}</span>
      </div>
      <p className="text-[10px] mb-2" style={{ color: '#64748b' }}>{subtitle}</p>
      {type && <p className="text-xs font-semibold mb-1" style={{ color: '#94a3b8' }}>{type}</p>}
      {uri && <p className="text-[10px] font-mono truncate" style={{ color: '#475569' }}>{uri}</p>}
    </div>
  );
}

function SectionCard({ title, icon, color, children }: {
  title: string; icon: React.ReactNode; color: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-4" style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <h3 className="text-xs font-black uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color }}>
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function MetaField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>{label}</span>
      <p className={`text-sm ${mono ? 'font-mono text-xs' : ''} truncate`} style={{ color: '#cbd5e1' }}>{value}</p>
    </div>
  );
}

// ============================== JSON-LD VIEW V2 ==============================

function JSONLDViewV2({ record, onCopy, copied }: { record: MoonRecord; onCopy: (t: string) => void; copied: boolean }) {
  const jsonStr = JSON.stringify(record.document, null, 2);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black uppercase tracking-wide flex items-center gap-2" style={{ color: '#10b981' }}>
          <Code className="h-4 w-4" />
          JSON-LD Document
        </h3>
        <button
          onClick={() => onCopy(jsonStr)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: copied ? '#10b981' : '#64748b',
          }}
        >
          {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 rounded-xl text-xs font-mono overflow-auto max-h-[600px] leading-relaxed" style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(16,185,129,0.1)',
        color: '#34d399',
      }}>
        {jsonStr}
      </pre>
    </div>
  );
}

// ============================== TURTLE VIEW V2 ==============================

function TurtleViewV2({ turtle, onCopy, copied }: { turtle: string; onCopy: (t: string) => void; copied: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black uppercase tracking-wide flex items-center gap-2" style={{ color: '#06b6d4' }}>
          <Code className="h-4 w-4" />
          RDF Turtle
        </h3>
        <button
          onClick={() => onCopy(turtle)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: copied ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${copied ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: copied ? '#06b6d4' : '#64748b',
          }}
        >
          {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 rounded-xl text-xs font-mono overflow-auto max-h-[600px] leading-relaxed" style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(6,182,212,0.1)',
        color: '#22d3ee',
      }}>
        {turtle || 'Loading Turtle format...'}
      </pre>
    </div>
  );
}

// ============================== GRAPH VIEW V2 ==============================

function GraphViewV2({ record }: { record: MoonRecord }) {
  const graph = record.document?.['@graph'] || [];
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const toggleNode = (idx: number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const getNodeColor = (node: any): string => {
    const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type'] || ''];
    const typeStr = types.join(' ').toLowerCase();
    if (typeStr.includes('work')) return '#6366f1';
    if (typeStr.includes('instance')) return '#a855f7';
    if (typeStr.includes('item')) return '#f59e0b';
    if (typeStr.includes('title')) return '#10b981';
    if (typeStr.includes('contribution') || typeStr.includes('agent')) return '#06b6d4';
    if (typeStr.includes('subject') || typeStr.includes('topic')) return '#ec4899';
    if (typeStr.includes('identifier') || typeStr.includes('isbn')) return '#14b8a6';
    if (typeStr.includes('provision')) return '#f97316';
    return '#64748b';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black uppercase tracking-wide flex items-center gap-2" style={{ color: '#f59e0b' }}>
          <Network className="h-4 w-4" />
          RDF Graph
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md ml-1" style={{
            background: 'rgba(245,158,11,0.1)',
            color: '#fbbf24',
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            {graph.length} nodes
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpandedNodes(new Set(graph.map((_: any, i: number) => i)))}
            className="text-[10px] font-bold px-2.5 py-1 rounded-lg" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#64748b',
            }}
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedNodes(new Set())}
            className="text-[10px] font-bold px-2.5 py-1 rounded-lg" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#64748b',
            }}
          >
            Collapse
          </button>
        </div>
      </div>

      {graph.length === 0 ? (
        <p style={{ color: '#475569' }} className="text-sm">No @graph data available for this record.</p>
      ) : (
        <div className="space-y-2">
          {graph.map((node: any, index: number) => {
            const color = getNodeColor(node);
            const isExpanded = expandedNodes.has(index);
            const types = (Array.isArray(node['@type']) ? node['@type'] : [node['@type']]).filter(Boolean);
            const propKeys = Object.keys(node).filter(k => k !== '@id' && k !== '@type');

            return (
              <div key={index} className="rounded-xl overflow-hidden" style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${color}15`,
              }}>
                <button
                  onClick={() => toggleNode(index)}
                  className="w-full flex items-center gap-3 p-3.5 text-left"
                >
                  <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: color }} />
                  <div className="flex items-center gap-2 flex-wrap flex-1">
                    {types.map((t: string, ti: number) => (
                      <span key={ti} className="text-[10px] font-black px-2 py-0.5 rounded-md" style={{
                        background: `${color}15`,
                        color: color,
                        border: `1px solid ${color}25`,
                      }}>
                        {t}
                      </span>
                    ))}
                    <span className="text-[10px] font-mono truncate" style={{ color: '#475569' }}>
                      {node['@id']?.split('/').pop() || node['@id'] || '_:blank'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono" style={{ color: '#475569' }}>{propKeys.length} props</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: '#475569' }} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 space-y-1.5">
                        <div className="text-[10px] font-mono break-all mb-2 px-2 py-1 rounded" style={{
                          background: 'rgba(0,0,0,0.2)',
                          color: '#64748b',
                        }}>
                          @id: {node['@id']}
                        </div>
                        {propKeys.map((key, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <span className="font-semibold flex-shrink-0" style={{ color }}>{key}</span>
                            <span className="font-mono break-all" style={{ color: '#94a3b8' }}>
                              {typeof node[key] === 'string'
                                ? node[key].substring(0, 300)
                                : JSON.stringify(node[key]).substring(0, 300)
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MoonOPAC;
