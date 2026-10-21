import React, { useState, useMemo, useEffect } from 'react';
import LiquidGlassHeader from './LiquidGlassHeader';
import HeroSpatialShowcase from './HeroSpatialShowcase';
import SpatialCategoryDock from './SpatialCategoryDock';
import ArtifactCard from './ArtifactCard';
import Viewer3DModal from './Viewer3DModal';
import ArQrModal from './ArQrModal';
import GraphUniverseModal from './GraphUniverseModal';
import { ARTIFACT_RECORDS } from './data/records';
import { 
  Sparkles, Layers, Box, Globe, Shield, Landmark, 
  ExternalLink, Database, Filter, Check, Home, Compass, Volume2, VolumeX, QrCode, ArrowLeft, ArrowRight
} from 'lucide-react';

import Ambient3DBackground from './Ambient3DBackground';
import '../../../styles/spatial-glass.css';

interface MoonSpatialOPACProps {
  onBackToDashboard?: () => void;
}

export function MoonSpatialOPAC({ onBackToDashboard }: MoonSpatialOPACProps) {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtifact, setSelectedArtifact] = useState<any>(null);
  const [arArtifact, setArArtifact] = useState<any>(null);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const isAr = lang === 'ar';

  // Ambient Web Audio Drone Synthesizer
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let osc1: OscillatorNode | null = null;
    let osc2: OscillatorNode | null = null;
    let gainNode: GainNode | null = null;

    if (soundEnabled) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioContextClass();
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.035, audioCtx.currentTime);

        osc1 = audioCtx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(108, audioCtx.currentTime);

        osc2 = audioCtx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(216, audioCtx.currentTime);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start();
        osc2.start();
      } catch (err) {
        console.warn("Audio context error:", err);
      }
    }

    return () => {
      if (osc1) osc1.stop();
      if (osc2) osc2.stop();
      if (audioCtx) audioCtx.close();
    };
  }, [soundEnabled]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ARTIFACT_RECORDS.length };
    ARTIFACT_RECORDS.forEach((art: any) => {
      counts[art.category] = (counts[art.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filter records
  const filteredRecords = useMemo(() => {
    return ARTIFACT_RECORDS.filter((art: any) => {
      const matchCat = selectedCategory === 'all' || art.category === selectedCategory;
      if (!matchCat) return false;

      const matchInst = selectedInstitution === 'all' || art.institution.ar.includes(selectedInstitution);
      if (!matchInst) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        art.title.ar?.toLowerCase().includes(q) ||
        art.title.en?.toLowerCase().includes(q) ||
        art.creator.ar?.toLowerCase().includes(q) ||
        art.period.ar?.toLowerCase().includes(q) ||
        art.bibframe?.classification?.lcc?.toLowerCase().includes(q) ||
        art.bibframe?.classification?.ddc?.toLowerCase().includes(q) ||
        art.summary.ar?.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, selectedInstitution, searchQuery]);

  return (
    <div className={`min-h-screen relative flex flex-col justify-between selection:bg-white/20 selection:text-white bg-black text-slate-100 ${isAr ? 'rtl' : 'ltr'}`}>
      
      {/* Pure Black Void Background with Faded Ambient 3D Model */}
      <Ambient3DBackground />

      {/* FOREGROUND SPATIAL GLASS LAYOUT */}
      <div className="relative z-10 flex-1 flex flex-col">
        
        {/* Navigation Bar with Back Button */}
        <div className="max-w-[1550px] mx-auto w-full px-4 pt-3 flex items-center justify-between">
          {onBackToDashboard ? (
            <button
              onClick={onBackToDashboard}
              className="glass-pill px-4 py-1.5 text-xs font-bold text-white flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
            >
              {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{isAr ? 'العودة إلى لوحة تحكم Moon' : 'Back to Moon Dashboard'}</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <a
              href="/mobile/"
              target="_blank"
              rel="noreferrer"
              className="glass-pill px-3.5 py-1.5 text-xs text-blue-300 hover:text-white flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{isAr ? 'فتح تطبيق الهاتف (Mobile AR)' : 'Launch Mobile AR'}</span>
            </a>
          </div>
        </div>

        {/* Liquid Glass Header */}
        <LiquidGlassHeader
          lang={lang}
          setLang={setLang}
          soundEnabled={soundEnabled}
          toggleSound={() => setSoundEnabled(!soundEnabled)}
          onOpenGraph={() => setIsGraphOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalRecords={ARTIFACT_RECORDS.length}
        />

        {/* 3D Model Random Slideshow Hero Showcase */}
        <HeroSpatialShowcase
          records={ARTIFACT_RECORDS}
          onSelectArtifact={setSelectedArtifact}
          onOpenAR={setArArtifact}
          lang={lang}
        />

        {/* Category Dock */}
        <SpatialCategoryDock
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          lang={lang}
          counts={categoryCounts}
        />

        {/* Artifacts Grid */}
        <main className="w-full max-w-7xl mx-auto px-4 pb-16 flex-1">
          {filteredRecords.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRecords.map((artifact: any) => (
                <ArtifactCard
                  key={artifact.id}
                  artifact={artifact}
                  onSelect={setSelectedArtifact}
                  onOpenAR={setArArtifact}
                  lang={lang}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-dock rounded-3xl p-8 max-w-md mx-auto">
              <Box className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <h4 className="text-lg font-bold text-white mb-1">
                {isAr ? 'لم يتم العثور على مقتنيات مطابقة' : 'No Artifacts Found'}
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                {isAr ? 'جرب البحث بكلمات أخرى أو اختر قسماً مختلفاً' : 'Try adjusting your search query or category filter'}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedInstitution('all');
                  setSearchQuery('');
                }}
                className="glass-pill px-4 py-2 text-xs font-semibold text-white"
              >
                {isAr ? 'إعادة ضبط التصفية' : 'Reset Filters'}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-black/85 backdrop-blur-xl py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-center text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <img src="/white.png" alt="Moon" className="h-5 w-auto" />
            <span className="font-bold text-white">MOON Spatial OPAC & 3D Discovery</span>
          </div>
          <p className="tracking-wide">
            {isAr ? 'منظومة Moon - تصميم وتطوير اسحاق فالح' : 'Moon Platform - Designed & Developed by Isaac Faleh'}
          </p>
        </div>
      </footer>

      {/* MODALS */}
      {selectedArtifact && (
        <Viewer3DModal
          artifact={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
          onOpenAR={(art: any) => {
            setSelectedArtifact(null);
            setArArtifact(art);
          }}
          lang={lang}
        />
      )}

      {arArtifact && (
        <ArQrModal
          artifact={arArtifact}
          onClose={() => setArArtifact(null)}
          lang={lang}
        />
      )}

      {isGraphOpen && (
        <GraphUniverseModal
          onClose={() => setIsGraphOpen(false)}
          onSelectArtifact={(art: any) => {
            setSelectedArtifact(art);
          }}
          lang={lang}
        />
      )}

    </div>
  );
}

export default MoonSpatialOPAC;
