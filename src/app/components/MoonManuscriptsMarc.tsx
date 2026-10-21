import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, RefreshCw, BookOpen, Database, Shield, Layers, Server } from 'lucide-react';
import moonLogoWhite from '../../assets/white.png';

interface MoonManuscriptsMarcProps {
  onBackToDashboard?: () => void;
}

export function MoonManuscriptsMarc({ onBackToDashboard }: MoonManuscriptsMarcProps) {
  const [iframeUrl, setIframeUrl] = useState<string>('http://localhost:3456');
  const [isServerRunning, setIsServerRunning] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const handleRefresh = () => {
    setReloadKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar with Moon Branding & Back Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-6 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/15"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للوحة التحكم</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="h-9 px-2.5 py-1 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <img src={moonLogoWhite} alt="Moon Logo" className="h-6 w-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white">Moon MARC &bull; RDA</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  منظومة فهرسة المخطوطات
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                قاعدة بيانات تضم 107,149 مخطوط مع استناد kiqp.net و dromh.org (D:\MAN)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all border border-white/10"
            title="تحديث الإطار"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <a
            href={iframeUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فتح في نافذة مستقلة (Local:3456)</span>
          </a>
        </div>
      </header>

      {/* Main Container: Full Embedded Viewer */}
      <div className="flex-1 w-full relative bg-slate-900">
        <iframe
          key={reloadKey}
          src={iframeUrl}
          title="Moon Manuscripts MARC & RDA Cataloger"
          className="w-full h-[calc(100vh-65px)] border-none"
          onError={() => setIsServerRunning(false)}
        />
      </div>
    </div>
  );
}

export default MoonManuscriptsMarc;
