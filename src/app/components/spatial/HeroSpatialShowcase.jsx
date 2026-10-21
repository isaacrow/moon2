import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Box, Eye, QrCode, Plus } from 'lucide-react';

export default function HeroSpatialShowcase({ 
  records, 
  onSelectArtifact, 
  onOpenAR, 
  lang 
}) {
  const isAr = lang === 'ar';

  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * records.length));
  const modelViewerRef = useRef(null);
  const isInteractingRef = useRef(false);
  const targetOrbitRef = useRef({ theta: 45, phi: 75 });
  const currentOrbitRef = useRef({ theta: 45, phi: 75 });
  const rafRef = useRef(null);

  const currentArtifact = records[currentIndex] || records[0];

  // Auto-play slideshow timer (every 10s)
  useEffect(() => {
    if (records.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % records.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [records.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % records.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + records.length) % records.length);
  };

  // Smooth Mouse Move Tracking on the 3D Model (loop sleeps once settled)
  useEffect(() => {
    const animate = () => {
      const cur = currentOrbitRef.current;
      const tgt = targetOrbitRef.current;
      const dTheta = tgt.theta - cur.theta;
      const dPhi = tgt.phi - cur.phi;
      if (!isInteractingRef.current && modelViewerRef.current) {
        cur.theta += dTheta * 0.06;
        cur.phi += dPhi * 0.06;
        modelViewerRef.current.cameraOrbit = `${cur.theta.toFixed(2)}deg ${cur.phi.toFixed(2)}deg 115%`;
      }
      if (!isInteractingRef.current && (Math.abs(dTheta) > 0.05 || Math.abs(dPhi) > 0.05)) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    };

    const handleMouseMove = (e) => {
      if (isInteractingRef.current) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

      // Subtle responsive 3D tilt following cursor (centered)
      targetOrbitRef.current = {
        theta: nx * 30,
        phi: Math.max(55, Math.min(95, 75 + ny * 15))
      };
      if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  return (
    <section className="relative w-full max-w-[1550px] mx-auto px-2 sm:px-6 lg:px-10 pt-2 pb-10">
      
      {/* ══════════════════════════════════════════════════════════════
          BIG FLOATING NAVIGATION ARROWS (Replacing Image 3 toolbar)
         ══════════════════════════════════════════════════════════════ */}
      
      {/* Big Left Arrow */}
      <button
        onClick={handlePrev}
        className="absolute left-1 sm:left-3 lg:left-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-black/85 hover:bg-white/20 border border-white/30 backdrop-blur-3xl text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-[0_10px_40px_rgba(0,0,0,0.8)] group cursor-pointer"
        aria-label={isAr ? "المقتنى السابق" : "Previous Model"}
      >
        <ChevronLeft className="w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11 group-hover:-translate-x-1 transition-transform" />
      </button>

      {/* Big Right Arrow */}
      <button
        onClick={handleNext}
        className="absolute right-1 sm:right-3 lg:right-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-black/85 hover:bg-white/20 border border-white/30 backdrop-blur-3xl text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-[0_10px_40px_rgba(0,0,0,0.8)] group cursor-pointer"
        aria-label={isAr ? "المقتنى التالي" : "Next Model"}
      >
        <ChevronRight className="w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* ══════════════════════════════════════════════════════════════
          BORDERLESS WIDE HERO CANVAS (No outer border outline)
         ══════════════════════════════════════════════════════════════ */}
      <div className="w-full min-h-[560px] lg:min-h-[640px] rounded-[2.5rem] relative p-4 sm:p-8 lg:p-12 overflow-hidden flex flex-col justify-between border-0 shadow-none bg-transparent">
        
        {/* Soft Ambient Cinematic Glow */}
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-white/[0.04] blur-[160px] pointer-events-none" />

        {/* ══════════════════════════════════════════════════════════════
            CENTRAL STAGE: EDITORIAL HEADLINE + HERO 3D MODEL
           ══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1 my-auto z-10">
          
          {/* Editorial Headline & Description (Image 4 & Image 5 completely removed) */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-5 text-right rtl:text-right ltr:text-left z-20">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs text-slate-200 w-fit backdrop-blur-md">
              <Box className="w-4 h-4 text-white" />
              <span>{isAr ? 'فهرس التراث ثلاثي الأبعاد' : '3D Spatial Heritage OPAC'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span className="font-mono text-slate-300">BIBFRAME 2.0</span>
            </div>

            {/* Large Luxury Serif Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-6xl font-black text-white tracking-tight font-amiri leading-[1.12]">
              {isAr ? 'استكشف روائع التراث بالحجم الطبيعي' : 'Explore Heritage In Full Spatial Reality'}
            </h1>

            <p className="text-sm sm:text-base text-slate-200/90 font-light leading-relaxed max-w-xl">
              {isAr 
                ? 'فهرس علقمي المفتوح يربط الكيانات الفكرية بنماذجها الحقيقية ثلاثية الأبعاد والواقع المعزز، مع بيانات مترابطة دقيقة وفق معايير مكتبة الكونغرس.'
                : 'Uniting authentic 3D surrogates with Library of Congress BIBFRAME 2.0 Linked Data and WebXR Augmented Reality for global cultural preservation.'}
            </p>

            {/* Action Buttons (Solid White + Glass AR) */}
            <div className="flex items-center gap-3 pt-3 flex-wrap">
              <button
                onClick={() => onSelectArtifact(currentArtifact)}
                className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-black font-bold text-sm transition-all shadow-2xl shadow-white/15 flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>{isAr ? 'فحص السجل والـ 3D' : 'Start Exploration'}</span>
              </button>

              <button
                onClick={() => onOpenAR(currentArtifact)}
                className="px-6 py-3.5 rounded-2xl glass-pill text-white text-sm font-semibold hover:bg-white/20 transition-all flex items-center gap-2 border-white/25 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>{isAr ? 'واقع معزز (AR)' : 'Launch AR'}</span>
              </button>
            </div>

          </div>

          {/* 3D Central Showcase Canvas (Centered with generous padding and Mouse Tracking) */}
          <div className="lg:col-span-8 relative h-[500px] sm:h-[600px] md:h-[680px] lg:h-[750px] rounded-3xl overflow-hidden flex items-center justify-center px-6 sm:px-12 lg:px-20 py-4">
            
            {/* Live Model Viewer */}
            <model-viewer
              key={currentArtifact.id}
              ref={modelViewerRef}
              src={currentArtifact.model.glb}
              alt={currentArtifact.title[lang]}
              camera-controls
              touch-action="pan-y"
              interaction-prompt="none"
              draco-decoder-location="./draco/"
              camera-target="auto auto auto"
              bounds="tight"
              loading="eager"
              reveal="auto"
              auto-rotate
              rotation-per-second="10deg"
              shadow-intensity="1.5"
              shadow-softness="0.75"
              exposure="1.25"
              camera-orbit="0deg 75deg 115%"
              min-camera-orbit="auto auto 40%"
              max-camera-orbit="auto auto 300%"
              field-of-view="36deg"
              onPointerDown={() => { isInteractingRef.current = true; }}
              onPointerUp={() => { isInteractingRef.current = false; }}
              className="w-full h-full block cursor-grab active:cursor-grabbing" style={{ width: "100%", height: "100%", minHeight: "500px", display: "block", direction: "ltr" }}
            >
              <div slot="progress-bar" style={{ display: 'none' }}></div>
            </model-viewer>

          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════
            BOTTOM BAR: FLOATING MODEL INFO CARD + PROGRESS DOTS
           ══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 z-20 pt-6">
          
          {/* Floating Model Info Card */}
          <div 
            onClick={() => onSelectArtifact(currentArtifact)}
            className="glass-card p-3 sm:p-4 rounded-2xl border border-white/20 flex items-center gap-3.5 cursor-pointer hover:border-white/40 transition-all shadow-xl group max-w-sm w-full sm:w-auto"
          >
            {/* 3D Icon */}
            <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Box className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0 text-right rtl:text-right ltr:text-left">
              <span className="text-[10px] text-slate-400 font-mono block">
                {currentArtifact.bibframe.classification.lcc}
              </span>
              <h4 className="text-sm font-bold text-white truncate font-amiri">
                {currentArtifact.title[lang]}
              </h4>
              <span className="text-[11px] text-slate-300 font-light truncate block">
                {currentArtifact.period[lang]}
              </span>
            </div>

            {/* Plus Action Circle */}
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-slate-200 transition-colors shadow-md">
              <Plus className="w-4 h-4" />
            </div>
          </div>

          {/* Dots Indicator & Position Counter */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              {currentIndex + 1} / {records.length}
            </span>
            <div className="flex items-center gap-1.5">
              {records.map((rec, idx) => (
                <button
                  key={rec.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx 
                      ? 'w-7 bg-white shadow-sm' 
                      : 'w-1.5 bg-white/25 hover:bg-white/60'
                  }`}
                  title={rec.title[lang]}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
