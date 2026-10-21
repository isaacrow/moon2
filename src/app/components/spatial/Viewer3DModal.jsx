import React, { useState, useRef } from 'react';
import { 
  X, RotateCw, QrCode, Download, Copy, Check, ExternalLink, 
  Layers, Sparkles, BookOpen, Shield, Box, Sun, FileCode, Maximize2
} from 'lucide-react';
import { moonCatalog } from './services/moonSupabase';
import confetti from 'canvas-confetti';

export default function Viewer3DModal({ artifact, onClose, onOpenAR, lang }) {
  const isAr = lang === 'ar';
  const modelRef = useRef(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [rdfFormat, setRdfFormat] = useState('backend-raw');
  const [autoRotate, setAutoRotate] = useState(true);
  const [exposure, setExposure] = useState(1.1);
  const [copied, setCopied] = useState(false);
  const [activeAnnotation, setActiveAnnotation] = useState(null);

  // Determine active RDF/Linked Data code to display
  const getActiveCode = () => {
    if (rdfFormat === 'backend-raw') {
      return artifact.rawBackendRdf || artifact.rawBackendTtl || moonCatalog.exportLinkedData(artifact, 'turtle');
    }
    if (rdfFormat === 'backend-ttl') {
      return artifact.rawBackendTtl || moonCatalog.exportLinkedData(artifact, 'turtle');
    }
    return moonCatalog.exportLinkedData(artifact, rdfFormat);
  };

  const currentCode = getActiveCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let ext = 'ttl';
    if (rdfFormat === 'backend-raw') ext = artifact.backendRdfFile ? 'rdf' : 'ttl';
    else if (rdfFormat === 'backend-ttl') ext = 'ttl';
    else if (rdfFormat === 'jsonld') ext = 'json';
    else if (rdfFormat === 'sparql') ext = 'sparql';

    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.slug}-record.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#ffffff', '#e2e8f0', '#94a3b8']
    });
  };

  const resetCamera = () => {
    if (modelRef.current) {
      modelRef.current.cameraOrbit = artifact.model.cameraOrbit || "0deg 75deg auto";
      modelRef.current.fieldOfView = "30deg";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-2xl animate-fade-in">
      
      {/* Main Spatial Stage Window */}
      <div className="relative w-full max-w-7xl h-[92vh] glass-panel-primary rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row-reverse shadow-2xl">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-40 p-2.5 rounded-full bg-black/60 hover:bg-white/20 border border-white/20 backdrop-blur-md text-slate-300 hover:text-white transition-all transform hover:scale-105"
          title={isAr ? "إغلاق المعاينة" : "Close Viewer"}
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3D Viewport Stage: Solid Pitch Black Background & Left-Centered Model */}
        <div className="relative flex-1 h-[48vh] lg:h-full bg-black flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          
          {/* Live Google Model-Viewer Element: Centered with auto target, tight bounds, and safe FOV */}
          <model-viewer
            ref={modelRef}
            src={artifact.model.glb}
            alt={artifact.title[lang]}
            camera-controls
            touch-action="pan-y"
            draco-decoder-location="./draco/"
            camera-target="auto auto auto"
            bounds="tight"
            loading="eager"
            reveal="auto"
            auto-rotate={autoRotate ? "" : null}
            auto-rotate-delay="1000"
            rotation-per-second="16deg"
            shadow-intensity="1.5"
            shadow-softness="0.8"
            exposure={exposure}
            camera-orbit="0deg 75deg 115%"
            min-camera-orbit="auto auto 40%"
            max-camera-orbit="auto auto 300%"
            field-of-view="35deg"
            ar
            ar-modes="webxr scene-viewer quick-look"
            className="w-full h-full block cursor-grab active:cursor-grabbing"
            style={{ width: '100%', height: '100%', display: 'block', margin: 'auto' }}
          >
            {/* Suppress built-in loading line */}
            <div slot="progress-bar" style={{ display: 'none' }}></div>

            {/* Interactive 3D Hotspot Annotations */}
            {artifact.model.annotations?.map((anno, idx) => (
              <button
                key={idx}
                slot={`hotspot-${idx}`}
                data-position={anno.position}
                data-normal={anno.normal}
                onClick={() => {
                  setActiveAnnotation(anno);
                  triggerCelebration();
                }}
                className="group relative flex items-center justify-center w-6 h-6 rounded-full bg-white text-black border-2 border-white shadow-xl transform hover:scale-125 transition-transform"
              >
                <span className="w-2 h-2 rounded-full bg-black"></span>
                <span className="absolute -top-7 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-black/90 text-[10px] text-white font-medium border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  {anno.title[lang]}
                </span>
              </button>
            ))}
          </model-viewer>

          {/* Active Hotspot Info Overlay Card */}
          {activeAnnotation && (
            <div className="absolute bottom-20 left-6 right-6 md:left-auto md:right-6 md:w-84 glass-card rounded-2xl p-4 animate-fade-in z-20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {activeAnnotation.title[lang]}
                </span>
                <button 
                  onClick={() => setActiveAnnotation(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-light">
                {activeAnnotation.text[lang]}
              </p>
            </div>
          )}

          {/* Floating Spatial 3D Controls */}
          <div className="absolute bottom-4 inset-x-4 flex items-center justify-center pointer-events-none z-30">
            <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full glass-dock shadow-xl">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                title={autoRotate ? (isAr ? "إيقاف الدوران" : "Pause Rotation") : (isAr ? "تشغيل الدوران" : "Start Rotation")}
                className={`p-2 rounded-full transition-all ${autoRotate ? 'bg-white/25 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={resetCamera}
                title={isAr ? "إعادة ضبط الكاميرا" : "Reset Camera"}
                className="p-2 rounded-full text-slate-400 hover:text-white transition-all"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-4 bg-white/20"></div>

              {/* Launch AR Modal */}
              <button
                onClick={() => onOpenAR(artifact)}
                className="glass-pill px-3.5 py-1.5 text-xs font-semibold text-black bg-white hover:bg-slate-100 shadow flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{isAr ? 'عرض في الواقع المعزز (AR)' : 'Launch in AR'}</span>
              </button>

              {/* Exposure Slider */}
              <div className="hidden sm:flex items-center gap-2 pl-2">
                <Sun className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={exposure}
                  onChange={(e) => setExposure(parseFloat(e.target.value))}
                  className="w-16 h-1 accent-white bg-white/20 rounded-lg cursor-pointer"
                  title={isAr ? "إضاءة النموذج" : "Lighting Exposure"}
                />
              </div>
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT: BIBFRAME 2.0 LINKED DATA PANEL
           ══════════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-[480px] h-[44vh] lg:h-full bg-black/95 backdrop-blur-2xl flex flex-col border-t lg:border-t-0 lg:border-r border-white/15 flex-shrink-0">
          
          {/* Header & Tabs */}
          <div className="p-4 sm:p-5 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-medium border border-white/20">
                {artifact.categoryLabel[lang]}
              </span>
              <span className="text-xs font-mono text-slate-300">
                {artifact.id}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 font-amiri leading-tight">
              {artifact.title[lang]}
            </h2>
            <p className="text-xs text-slate-300/80 font-light mb-4 font-display">
              {isAr ? artifact.title.en : artifact.title.ar}
            </p>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-2xl border border-white/10 text-xs font-medium">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === 'overview' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'البطاقة الوصفية' : 'Overview'}
              </button>

              <button
                onClick={() => setActiveTab('bibframe')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === 'bibframe' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'تصنيف وفهارس' : 'BIBFRAME'}
              </button>

              <button
                onClick={() => setActiveTab('backend-rdf')}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  activeTab === 'backend-rdf' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'سجل الباك إند (RDF)' : 'Backend RDF'}
              </button>
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-3.5 text-xs">
                
                {/* Historical Summary */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 leading-relaxed text-slate-200">
                  <h4 className="text-[11px] font-semibold text-white uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {isAr ? 'النبذة التاريخية والوصف الببليوجرافي' : 'Historical & Bibliographical Summary'}
                  </h4>
                  <p className="font-light leading-relaxed">
                    {artifact.summary[lang]}
                  </p>
                </div>

                {/* Manuscript Special Inscriptions (Incipit & Explicit) */}
                {artifact.notes?.incipit && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15 space-y-2.5">
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      {isAr ? 'نصوص المخطوط والتوثيق (Incipit & Explicit)' : 'Manuscript Texts & Inscriptions'}
                    </h4>
                    
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-[10px] text-amber-300/90 font-semibold block mb-1">
                        {isAr ? 'أول المخطوط (Incipit):' : 'Opening (Incipit):'}
                      </span>
                      <p className="font-amiri text-xs text-slate-200 leading-relaxed italic">
                        « {artifact.notes.incipit} »
                      </p>
                    </div>

                    {artifact.notes?.explicit && (
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                        <span className="text-[10px] text-cyan-300/90 font-semibold block mb-1">
                          {isAr ? 'آخر المخطوط (Explicit):' : 'Closing (Explicit):'}
                        </span>
                        <p className="font-amiri text-xs text-slate-200 leading-relaxed italic">
                          « {artifact.notes.explicit} »
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Key Provenance & Physical Attributes */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 text-[11px] block mb-0.5">{isAr ? 'العصر / تاريخ النسخ' : 'Period / Date'}</span>
                    <span className="text-white font-medium">{artifact.period[lang]}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 text-[11px] block mb-0.5">{isAr ? 'المادة والصناعة' : 'Material'}</span>
                    <span className="text-white font-medium">{artifact.physical.material[lang]}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 text-[11px] block mb-0.5">{isAr ? 'عدد الأوراق والأسطر' : 'Extent & Foliation'}</span>
                    <span className="text-white font-medium">{artifact.physical.extent || artifact.physical.dimensions}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 text-[11px] block mb-0.5">{isAr ? 'حالة الحفظ' : 'Preservation'}</span>
                    <span className="text-emerald-300 font-medium">{artifact.physical.condition[lang]}</span>
                  </div>
                </div>

                {/* Detailed Manuscript Codicology (Binding, Seals, Series) */}
                {(artifact.physical.binding || artifact.production?.scribe) && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-[11px] text-slate-300">
                    <span className="text-[11px] text-white block font-semibold mb-1">
                      {isAr ? 'معلومات الكوديكولوجيا والصناعة (Codicology):' : 'Codicological Features:'}
                    </span>
                    {artifact.production?.scribe && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isAr ? 'الخطاط ونوع الخط:' : 'Scribe & Script:'}</span>
                        <span className="text-white font-medium">{artifact.production.scribe}</span>
                      </div>
                    )}
                    {artifact.production?.place && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isAr ? 'مكان النسخ:' : 'Production Place:'}</span>
                        <span className="text-white font-medium">{artifact.production.place}</span>
                      </div>
                    )}
                    {artifact.physical.binding && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isAr ? 'التجليد / الغلاف:' : 'Binding:'}</span>
                        <span className="text-white font-medium">{artifact.physical.binding}</span>
                      </div>
                    )}
                    {artifact.physical.decoration && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isAr ? 'الزخرفة والتذهيب:' : 'Illumination:'}</span>
                        <span className="text-white font-medium">{artifact.physical.decoration}</span>
                      </div>
                    )}
                    {artifact.physical.catchwords && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isAr ? 'الترتيب والتعقيبات:' : 'Catchwords:'}</span>
                        <span className="text-white font-medium">{artifact.physical.catchwords}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Historical Bibliographic Reference (Al-Dhariah & Holding) */}
                {artifact.notes?.dhariahCitation && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 text-slate-300">
                    <span className="text-[11px] text-amber-300 block font-semibold mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {isAr ? 'المراجع وفهارس التراث (Bibliography):' : 'Bibliographical Source:'}
                    </span>
                    <p className="text-xs text-slate-200 font-medium">
                      {artifact.notes.dhariahCitation}
                    </p>
                    {artifact.notes.holdingNote && (
                      <p className="text-xs text-slate-300 pt-0.5">
                        {artifact.notes.holdingNote}
                      </p>
                    )}
                    {artifact.notes.systemIdentifiers && (
                      <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-slate-400">
                        <span>IDs:</span>
                        {artifact.notes.systemIdentifiers.map((id, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-white">
                            {id}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Institutional Holding */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-200">
                  <span className="text-[11px] text-white block font-semibold mb-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    {isAr ? 'المؤسسة الحافظة (Item Holding)' : 'Custodial Institution'}
                  </span>
                  <p className="text-xs font-light">{artifact.institution[lang]}</p>
                </div>

              </div>
            )}

            {/* 2. BIBFRAME CLASSIFICATION & ONTOLOGY TAB */}
            {activeTab === 'bibframe' && (
              <div className="space-y-3.5 text-xs">
                
                {/* URIs Hierarchy */}
                <div className="p-3.5 rounded-2xl glass-surface-dark border border-white/10 space-y-2">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                    {isAr ? 'هيكلية كيانات بيبفرام 2.0 (BIBFRAME Triad & Linked Data)' : 'BIBFRAME 2.0 Triad URIs'}
                  </span>
                  
                  <div className="flex flex-col gap-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                      <span className="text-white font-bold">bf:Work</span>
                      <a href={artifact.bibframe.workUri} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white truncate max-w-[240px] flex items-center gap-1">
                        {artifact.bibframe.workUri}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>

                    {artifact.bibframe.expressionUri && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                        <span className="text-slate-300 font-bold">bf:Expression</span>
                        <a href={artifact.bibframe.expressionUri} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white truncate max-w-[240px] flex items-center gap-1">
                          {artifact.bibframe.expressionUri}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                      <span className="text-slate-200 font-bold">bf:Instance</span>
                      <a href={artifact.bibframe.instanceUri} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white truncate max-w-[240px] flex items-center gap-1">
                        {artifact.bibframe.instanceUri}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                      <span className="text-slate-200 font-bold">bf:Item</span>
                      <a href={artifact.bibframe.itemUri} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white truncate max-w-[240px] flex items-center gap-1">
                        {artifact.bibframe.itemUri}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>

                    {artifact.adminMetadata?.adminUri && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                        <span className="text-cyan-300 font-bold">bf:AdminMetadata</span>
                        <a href={artifact.adminMetadata.adminUri} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white truncate max-w-[240px] flex items-center gap-1">
                          {artifact.adminMetadata.adminUri}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Classifications */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 text-[11px] block">LCC (مكتبة الكونغرس)</span>
                    <span className="text-white font-mono font-bold text-sm">{artifact.bibframe.classification.lcc}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 text-[11px] block">DDC (ديوي العشري)</span>
                    <span className="text-slate-200 font-mono font-bold text-sm">{artifact.bibframe.classification.ddc}</span>
                  </div>
                </div>

                {/* LCSH Subjects */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[11px] font-bold text-slate-300 block mb-2">
                    {isAr ? 'رؤوس الموضوعات المقننة (LCSH Authorities)' : 'Controlled Subjects (LCSH)'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {artifact.bibframe.subjects?.map((subj, i) => (
                      <a 
                        key={i}
                        href={subj.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-[11px] flex items-center gap-1 border border-white/10 transition-colors"
                      >
                        <span>{subj.label}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Creator Authority Link */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[11px] block">{isAr ? 'الملف الاستنادي للمؤلف / الصانع' : 'Creator Authority Record'}</span>
                    <span className="text-white font-medium">{artifact.creator[lang]}</span>
                  </div>
                  <a 
                    href={artifact.creator.uri} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                    title="Open Authority Record"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

              </div>
            )}

            {/* 3. BACKEND RDF & LINKED DATA CODE TAB */}
            {activeTab === 'backend-rdf' && (
              <div className="space-y-3 text-xs">
                {/* Format Switcher */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 overflow-x-auto">
                    {artifact.rawBackendRdf && (
                      <button
                        onClick={() => setRdfFormat('backend-raw')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                          rdfFormat === 'backend-raw' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Backend RDF/XML
                      </button>
                    )}
                    {artifact.rawBackendTtl && (
                      <button
                        onClick={() => setRdfFormat('backend-ttl')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                          rdfFormat === 'backend-ttl' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Backend Turtle (.ttl)
                      </button>
                    )}
                    <button
                      onClick={() => setRdfFormat('turtle')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                        rdfFormat === 'turtle' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      BIBFRAME Triples
                    </button>
                    <button
                      onClick={() => setRdfFormat('jsonld')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                        rdfFormat === 'jsonld' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      JSON-LD
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center gap-1 text-[11px]"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                      <span className="hidden sm:inline">{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ' : 'Copy')}</span>
                    </button>

                    <button
                      onClick={handleDownload}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 text-[11px]"
                      title="Download RDF File"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isAr ? 'تنزيل' : 'Export'}</span>
                    </button>
                  </div>
                </div>

                {/* Source File Badge */}
                {(artifact.backendRdfFile || artifact.backendTtlFile) && (
                  <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 flex items-center justify-between text-[11px] text-white font-mono">
                    <span className="flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-white" />
                      <span>{artifact.backendRdfFile || artifact.backendTtlFile}</span>
                    </span>
                    <span className="text-[10px] text-slate-300">Backend Synced</span>
                  </div>
                )}

                {/* Code Block with Full Pre */}
                <div className="relative rounded-2xl glass-surface-dark border border-white/10 p-3 font-mono text-[11px] overflow-x-auto max-h-[300px] text-slate-200 leading-relaxed scrollbar-thin">
                  <pre>{currentCode}</pre>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{isAr ? 'سجل رسمي مطابق لمعايير W3C ومكتبة الكونغرس' : 'Official W3C & Library of Congress BIBFRAME 2.0 Record'}</span>
                  <span className="text-white font-medium">Valid Triples</span>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Stage Action Pill */}
          <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between">
            <button
              onClick={() => onOpenAR(artifact)}
              className="glass-pill px-4 py-2.5 text-xs font-semibold text-black bg-white hover:bg-slate-100 shadow flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>{isAr ? 'فتح رمز الواقع المعزز (AR QR)' : 'Open AR Experience'}</span>
            </button>

            <a
              href={artifact.model.glb}
              download={`${artifact.slug}.glb`}
              className="glass-pill px-3 py-2 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5"
              title="Download 3D GLB Asset"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{isAr ? 'تحميل 3D' : 'GLB 3D'}</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
