import React, { useRef, useState } from 'react';
import { Box, Eye, QrCode, RotateCw, Bookmark } from 'lucide-react';

export default function ArtifactCard({ artifact, onSelect, onOpenAR, lang }) {
  const isAr = lang === 'ar';
  const viewerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Dynamic hover turntable: model tracks mouse move
  const handleMouseMove = (e) => {
    if (!viewerRef.current || isInteracting) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1

    const baseOrbit = artifact.model.cameraOrbit ? parseFloat(artifact.model.cameraOrbit) : 0;
    const theta = (baseOrbit + x * 50).toFixed(1);
    const phi = Math.max(45, Math.min(105, 75 + y * 25)).toFixed(1);

    viewerRef.current.cameraOrbit = `${theta}deg ${phi}deg auto`;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsInteracting(false);
    if (viewerRef.current) {
      viewerRef.current.cameraOrbit = artifact.model.cameraOrbit || "0deg 75deg auto";
    }
  };

  return (
    <div 
      className="glass-card flex flex-col justify-between p-4 sm:p-5 relative group transition-all duration-300 hover:-translate-y-1.5"
      onClick={() => onSelect(artifact)}
    >
      {/* 3D Model Viewport with Real GLB & Mouse Tracking */}
      <div 
        className="card-3d-viewport relative mb-4 cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden bg-black"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsInteracting(true)}
        onMouseUp={() => setIsInteracting(false)}
        onTouchStart={() => setIsInteracting(true)}
        onTouchEnd={() => setIsInteracting(false)}
      >
        {/* Real Live 3D Model Viewer */}
        <model-viewer
          ref={viewerRef}
          src={artifact.model.glb}
          alt={artifact.title[lang]}
          camera-controls
          touch-action="pan-y"
          interaction-prompt="none"
          draco-decoder-location="./draco/"
          loading="lazy"
          reveal="auto"
          camera-target="auto auto auto"
          bounds="tight"
          auto-rotate={isHovered ? true : undefined}
          rotation-per-second="14deg"
          shadow-intensity="1.5"
          shadow-softness="0.8"
          exposure="1.25"
          camera-orbit={artifact.model.cameraOrbit || "0deg 75deg auto"}
          field-of-view={artifact.model.fieldOfView || "30deg"}
          className="w-full h-full block" style={{ width: "100%", height: "260px", minHeight: "260px", display: "block", direction: "ltr" }}
        >
          <div slot="progress-bar" style={{ display: 'none' }}></div>
        </model-viewer>

        {/* Top Floating Glass Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <span className="glass-pill px-2.5 py-1 text-[11px] font-medium text-slate-200 border-white/20">
            {artifact.categoryLabel[lang]}
          </span>

          <span className={`glass-pill px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
            isHovered ? 'bg-white/20 text-white border-white/40 shadow-lg' : 'text-slate-300 border-white/15'
          }`}>
            <Box className="w-3.5 h-3.5 text-white" />
            <span>3D Model</span>
          </span>
        </div>

        {/* Floating Round Action Button (Bookmark) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsBookmarked(!isBookmarked);
          }}
          className={`absolute top-12 ${isAr ? 'left-3' : 'right-3'} w-8 h-8 rounded-full flex items-center justify-center transition-all z-20 cursor-pointer ${
            isBookmarked 
              ? 'bg-white text-black shadow-lg shadow-white/30' 
              : 'bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white border border-white/20'
          }`}
          title={isAr ? "حفظ المقتنى في المفضلة" : "Bookmark artifact"}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Hover Indicator */}
        <div className={`absolute bottom-2.5 inset-x-3 pointer-events-none transition-opacity duration-300 z-10 flex items-center justify-between text-[10px] text-slate-300 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/15 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex items-center gap-1.5 text-slate-200">
            <RotateCw className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{isAr ? 'حرك الفأرة لتدوير النموذج' : 'Move mouse to orbit'}</span>
          </div>
          <span className="text-slate-400 font-mono text-[9px]">360°</span>
        </div>
      </div>

      {/* Metadata & Classification */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1.5">
            <span className="truncate max-w-[200px]">{artifact.period[lang]}</span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-white font-mono text-[10px]">
              {artifact.bibframe.classification.lcc}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-slate-200 transition-colors line-clamp-1 mb-1 font-amiri leading-tight">
            {artifact.title[lang]}
          </h3>

          <p className="text-xs text-slate-400 font-light line-clamp-1 mb-2 font-display">
            {isAr ? artifact.title.en : artifact.title.ar}
          </p>

          <div className="text-xs text-slate-300/80 flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0"></span>
            <span className="truncate">{artifact.physical.material[lang]}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 text-[11px] truncate">{artifact.physical.dimensions}</span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(artifact);
            }}
            className="flex-1 glass-pill py-2 px-3 text-xs font-semibold text-slate-100 hover:text-white flex items-center justify-center gap-1.5 hover:border-white/50 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-white" />
            <span>{isAr ? 'فحص السجل والـ 3D' : 'Inspect 3D & Record'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenAR(artifact);
            }}
            className="glass-pill p-2 text-slate-200 hover:text-white border-white/15 cursor-pointer"
            title={isAr ? "عرض في الواقع المعزز (AR)" : "View in Augmented Reality"}
          >
            <QrCode className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
