import React, { useState } from 'react';
import { X, Box, Network, ExternalLink } from 'lucide-react';
import { ARTIFACT_RECORDS } from './data/records';

export default function GraphUniverseModal({ onClose, onSelectArtifact, lang }) {
  const isAr = lang === 'ar';
  const [selectedNode, setSelectedNode] = useState(null);

  const workNodes = ARTIFACT_RECORDS.map((a) => ({
    id: a.id,
    type: 'Work',
    label: a.title[lang],
    subLabel: a.period[lang],
    artifact: a
  }));

  const authorityNodes = [
    { id: 'AUTH-LOC', type: 'Authority', label: 'Library of Congress (id.loc.gov)', role: 'Ontology Hub' },
    { id: 'AUTH-KAFEEL', type: 'Holding', label: isAr ? 'متحف الكفيل - العتبة العباسية المقدسة' : 'Al-Kafeel Museum (Al-Abbas Shrine)', role: 'Primary Custodian' },
    { id: 'AUTH-BM', type: 'Holding', label: 'British Museum (BM 92687)', role: 'Babylonian Custodian' },
    { id: 'AUTH-MOON', type: 'System', label: 'Moon Woolf Linked Data DB', role: 'Supabase Quad Store' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-6xl h-[88vh] glass-panel-primary rounded-[2.5rem] p-6 flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 font-amiri">
                {isAr ? 'فضاء شبكة البيانات المترابطة (BIBFRAME Universe)' : 'BIBFRAME Linked Data Universe'}
              </h3>
              <p className="text-xs text-slate-400 font-light">
                {isAr ? 'علاقات بيبفرام الدلالية بين الأعمال الفكرية، النماذج ثلاثية الأبعاد والمؤسسات الحافظة' : 'Semantic ontology map connecting Works, 3D Instances, and Custodial Repositories'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Canvas */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col lg:flex-row gap-6">
          
          <div className="flex-1 space-y-6">
            
            {/* 1. Hub Nodes */}
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                {isAr ? 'المستودعات والملفات الاستنادية' : 'Authority & Institutional Hubs'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {authorityNodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-4 rounded-2xl bg-black/40 border cursor-pointer transition-all hover:scale-[1.01] ${
                      selectedNode?.id === node.id ? 'border-white bg-white/10 shadow-lg' : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-white">
                        {node.type}
                      </span>
                      <span className="text-[11px] text-slate-400">{node.role}</span>
                    </div>
                    <div className="font-bold text-white text-sm">{node.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. BIBFRAME Works */}
            <div>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                {isAr ? 'أعمال بيبفرام والنماذج ثلاثية الأبعاد' : 'BIBFRAME Works & 3D Surrogates'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {workNodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3.5 rounded-2xl bg-black/40 border cursor-pointer transition-all hover:scale-[1.01] ${
                      selectedNode?.id === node.id ? 'border-white bg-white/10 shadow-lg' : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/15 text-white">
                        bf:Work
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">schema:3DModel</span>
                    </div>
                    <div className="font-bold text-white text-xs line-clamp-1 mb-1 font-amiri">{node.label}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{node.subLabel}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Node Inspector Side Panel */}
          <div className="w-full lg:w-80 glass-card rounded-3xl p-5 flex flex-col justify-between">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {selectedNode.type} Node
                  </span>
                  <span className="text-xs font-mono text-slate-400">{selectedNode.id}</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white mb-1 font-amiri">
                    {selectedNode.label}
                  </h4>
                  {selectedNode.subLabel && (
                    <p className="text-xs text-slate-300">{selectedNode.subLabel}</p>
                  )}
                </div>

                {selectedNode.artifact && (
                  <div className="space-y-3 text-xs pt-3 border-t border-white/10">
                    <div className="p-2.5 rounded-xl bg-white/5 space-y-1">
                      <span className="text-slate-400 text-[10px] block">URI</span>
                      <span className="text-white font-mono text-[11px] break-all">
                        {selectedNode.artifact.bibframe.workUri}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 space-y-1">
                      <span className="text-slate-400 text-[10px] block">{isAr ? 'المصنف' : 'Classification'}</span>
                      <span className="text-white font-mono font-bold">
                        {selectedNode.artifact.bibframe.classification.lcc}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onSelectArtifact(selectedNode.artifact);
                      }}
                      className="w-full py-2.5 rounded-2xl bg-white text-black font-bold text-xs hover:bg-slate-100 flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                    >
                      <Box className="w-4 h-4" />
                      <span>{isAr ? 'فتح المعاينة ثلاثية الأبعاد' : 'Open 3D Viewer'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                <Network className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p>{isAr ? 'انقر على أي عقدة لاستكشاف ثلاثيات الربط وعلاقات الفهرسة' : 'Click any semantic node to inspect linked data relationships'}</p>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 text-[10px] text-slate-400 text-center">
              Moon Woolf Linked Data Engine • BIBFRAME 2.0
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
