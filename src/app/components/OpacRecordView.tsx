// BIBFRAME OPAC Viewer - Library Catalog Display
import React, { useMemo } from 'react';
import { Book, Globe, Users, Clock, MapPin, Layers, FileText, Tag, Hash } from 'lucide-react';

// --- Types ---
type GraphNode = {
  "@id": string;
  "@type": string | string[];
  [key: string]: any;
};

type BibframeJson = {
  "@context": string;
  "@graph": GraphNode[];
};

// --- Helper: The Graph Resolver ---
// This class turns the messy graph of IDs into a clean object we can read
class GraphResolver {
  nodeMap: Map<string, GraphNode>;

  constructor(json: BibframeJson) {
    this.nodeMap = new Map();
    if (json?.["@graph"]) {
      json["@graph"].forEach(node => {
        this.nodeMap.set(node["@id"], node);
      });
    }
  }

  // Find the main Work node
  getWork() {
    return Array.from(this.nodeMap.values()).find(node => {
      const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
      return types.some(t => t.includes("Work"));
    });
  }

  // Find the main Instance node
  getInstance() {
    return Array.from(this.nodeMap.values()).find(node => {
      const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
      return types.some(t => t.includes("Instance"));
    });
  }

  // Follow a reference ID to get the actual value
  resolve(idOrNode: any, key: string = "value"): string | null {
    if (!idOrNode) return null;
    
    // If it's just a string literal, return it
    if (typeof idOrNode === 'string' && !idOrNode.startsWith('http')) return idOrNode;
    if (typeof idOrNode === 'object' && idOrNode.value) return idOrNode.value;

    // If it's a URI pointer, find the node
    const id = typeof idOrNode === 'string' ? idOrNode : idOrNode['@id'];
    const node = this.nodeMap.get(id);

    if (!node) return id; // Return URI if node not found (fallback)

    // Specific handlers for different BIBFRAME nodes
    if (node["@type"] === "bf:Title") {
      return `${node["mainTitle"] || ''} ${node["subtitle"] || ''}`.trim();
    }
    
    // Generic value fetcher
    if (node[key]) return typeof node[key] === 'object' ? node[key].value : node[key];
    if (node["rdfs:label"]) return node["rdfs:label"];

    return null;
  }

  // Get a list of items (e.g., subjects)
  resolveList(ids: string | string[]) {
    const list = Array.isArray(ids) ? ids : [ids];
    return list.map(id => {
      // Clean up LOC URIs to make them readable labels
      if (id.includes("loc.gov")) {
        const parts = id.split('/');
        return parts[parts.length - 1]; // Return the ID code (e.g., 'sh85068390')
      }
      return this.resolve(id);
    });
  }
}

// --- Main Component ---
export function OpacRecordView({ data }: { data: BibframeJson }) {
  const resolver = useMemo(() => new GraphResolver(data), [data]);
  const work = resolver.getWork();
  const instance = resolver.getInstance();

  if (!work) return <div className="p-4 text-red-500">Invalid Record: No Work Found</div>;

  // Extract Data using Resolver
  const title = resolver.resolve(work.title);
  const summary = resolver.resolve(work.summary);
  const toc = resolver.resolve(work.tableOfContents);
  const audience = resolver.resolve(work.intendedAudience);
  const language = work.language ? work.language.split('/').pop() : 'Unknown';
  
  // Instance Data
  const author = resolver.resolve(instance?.responsibilityStatement) || "Unknown Author";
  const edition = resolver.resolve(instance?.editionStatement);
  const series = resolver.resolve(instance?.seriesStatement);
  const dimensions = resolver.resolve(instance?.dimensions);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 font-sans my-8">
      {/* 🟢 Header / Title Area */}
      <div className="bg-slate-900 text-white p-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm uppercase tracking-wider text-blue-300 font-semibold mb-2">
              {series || "Moon Engine"}
            </div>
            <h1 className="text-3xl font-bold leading-tight mb-2">
              {title}
            </h1>
            <p className="text-xl text-gray-300 italic font-light">
              {author}
            </p>
          </div>
          <div className="hidden md:block bg-blue-600 p-4 rounded-lg shadow-lg">
            <Book size={48} className="text-white" />
          </div>
        </div>
      </div>

      {/* 🟢 Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        
        {/* Left Column: Metadata */}
        <div className="col-span-1 bg-gray-50 p-6 border-r border-gray-200 space-y-6">
          
          {/* Publication Info */}
          <div>
            <h3 className="flex items-center text-gray-500 text-sm font-bold uppercase mb-2">
              <MapPin size={14} className="mr-2" /> Origin
            </h3>
            <p className="text-gray-800 font-medium">{resolver.resolve(work.originDate)}</p>
            <p className="text-gray-600 text-sm">Iraq (IQ)</p>
          </div>

          {/* Physical Details */}
          <div>
            <h3 className="flex items-center text-gray-500 text-sm font-bold uppercase mb-2">
              <Layers size={14} className="mr-2" /> Format
            </h3>
            <p className="text-gray-800">{edition}</p>
            <p className="text-gray-600 text-sm">{dimensions}</p>
          </div>

          {/* Language & Audience */}
          <div>
            <h3 className="flex items-center text-gray-500 text-sm font-bold uppercase mb-2">
              <Globe size={14} className="mr-2" /> Details
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Lang: {language}
              </span>
              {audience && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Aud: {audience}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="col-span-2 p-8 space-y-8">
          
          {/* Summary */}
          {summary && (
            <section>
              <h3 className="flex items-center text-slate-800 text-lg font-bold mb-3 border-b pb-2">
                <FileText size={18} className="mr-2 text-blue-600" /> 
                Summary
              </h3>
              <p className="text-gray-700 leading-relaxed bg-yellow-50 p-4 rounded border border-yellow-100">
                {summary}
              </p>
            </section>
          )}

          {/* Table of Contents */}
          {toc && (
            <section>
              <h3 className="flex items-center text-slate-800 text-lg font-bold mb-3 border-b pb-2">
                <Hash size={18} className="mr-2 text-blue-600" /> 
                Table of Contents
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {/* Basic split if TOC is a single string, otherwise display as is */}
                <li className="marker:text-blue-500">{toc}</li>
              </ul>
            </section>
          )}

          {/* Subjects (Links) */}
          {work.subject && (
            <section>
              <h3 className="flex items-center text-slate-800 text-lg font-bold mb-3 border-b pb-2">
                <Tag size={18} className="mr-2 text-blue-600" /> 
                Subjects
              </h3>
              <div className="flex flex-wrap gap-2">
                {resolver.resolveList(work.subject).map((subj, i) => (
                  <a 
                    key={i} 
                    href="#" 
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded text-sm transition-colors border border-gray-300"
                  >
                    {subj}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* System Info (LDR/Admin) */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-400 font-mono">
            Record ID: {work["@id"].split('/').pop()} <br/>
            Cataloged By: {resolver.resolve(work.adminMetadata) || "System"}
          </div>

        </div>
      </div>
    </div>
  );
}

export default OpacRecordView;
