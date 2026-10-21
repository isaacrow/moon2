import React from 'react';
import { Globe, Volume2, VolumeX, Database, Search, Layers, X, Smartphone } from 'lucide-react';

export default function LiquidGlassHeader({ 
  onOpenMoonStudio,
  onOpenManuscripts, 
  lang, 
  setLang, 
  soundEnabled, 
  toggleSound, 
  onOpenGraph,
  searchQuery, 
  setSearchQuery,
  totalRecords = 10
}) {
  const isAr = lang === 'ar';

  return (
    <header className="sticky top-4 z-40 w-full max-w-[1550px] mx-auto px-4 mb-4">
      {/* Sleek Obsidian Glass Capsule Bar matching Image 1 */}
      <div className="glass-card rounded-full p-2.5 sm:px-6 sm:py-3 flex flex-col lg:flex-row items-center justify-between gap-4 transition-all duration-300 shadow-2xl">
        
        {/* Right Section: Brand & Alqami Logo Capsule */}
        <div className="flex items-center gap-3.5 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3.5">
            
            {/* Moon Logo Box */}
            <div className="relative h-11 px-3.5 py-1.5 rounded-2xl overflow-hidden flex items-center justify-center bg-white/10 border border-white/25 shadow-lg flex-shrink-0">
              <img 
                src="/white.png" 
                alt="Moon Logo" 
                className="h-7 w-auto max-w-[100px] object-contain filter drop-shadow"
                onError={(e) => {
                  e.target.src = './images/logo.png';
                }}
              />
            </div>

            {/* Title */}
            <div className="text-right rtl:text-right ltr:text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-amiri flex items-center gap-1.5">
                  <span>🌕</span>
                  <span>{isAr ? 'MOON 3D' : 'MOON 3D'}</span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-300 font-light flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                <span>{isAr ? 'فهرس المقتنيات ثلاثية الأبعاد والواقع المعزز (Spatial OPAC)' : '3D & AR Cultural Heritage Catalog'}</span>
              </p>
            </div>

          </div>
        </div>

        {/* Center Section: Spatial Search Capsule */}
        <div className="w-full lg:flex-1 lg:max-w-xl relative flex items-center">
          <div className="relative w-full flex items-center">
            <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} w-4 h-4 text-slate-400 pointer-events-none`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحث في المقتنيات، المخطوطات، الكيانات، أو LCC..." : "Search artifacts, BIBFRAME works, LCSH topics..."}
              className={`w-full py-2.5 ${isAr ? 'pr-11 pl-10' : 'pl-11 pr-10'} bg-black/60 border border-white/20 rounded-full text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all shadow-inner`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={`absolute ${isAr ? 'left-3.5' : 'right-3.5'} p-1 text-slate-400 hover:text-white cursor-pointer`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Left Section: Action Pills */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap">

          {/* Sound Ambience */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? (isAr ? "كتم الصوت التراثي" : "Mute Soundscape") : (isAr ? "تشغيل الصوت التراثي" : "Enable Soundscape")}
            className="glass-pill p-2 text-slate-200 hover:text-white hover:bg-white/15 transition-all cursor-pointer border-white/20"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Language Switch */}
          <button
            onClick={() => setLang(isAr ? 'en' : 'ar')}
            className="glass-pill px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/15 transition-all cursor-pointer border-white/20"
          >
            <Globe className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
            <span>{isAr ? 'English' : 'عربي'}</span>
          </button>

          {/* Moon DB Supabase Live Badge */}
          <div 
            title="Moon Woolf DB (Supabase Connected) • Full RDF/BIBFRAME Sync"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] text-white backdrop-blur-md shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">Moon DB</span>
            <Database className="w-3 h-3 text-white/80" />
          </div>

                    {/* Link to Moon Studio Backbone */}
          <button
            type="button"
            onClick={onOpenMoonStudio || (() => { window.location.href = './?view=dashboard'; })}
            title={isAr ? "الدخول إلى استوديو الفهرسة MOON Backbone" : "Open Moon BIBFRAME Editor Backbone"}
            className="glass-pill px-3.5 py-1.5 text-xs font-bold text-amber-200 hover:text-white bg-amber-500/20 hover:bg-amber-500/35 transition-all cursor-pointer border-amber-400/40 flex items-center gap-1.5 shadow-sm"
          >
            <span>🌙</span>
            <span>{isAr ? 'Moon Backbone' : 'Moon Studio'}</span>
          </button>

          {/* Link to Manuscripts MARC 21 */}
          <button
            type="button"
            onClick={onOpenManuscripts || (() => { window.location.href = './?view=moon-manuscripts'; })}
            title={isAr ? "فهرس ومقارنة المخطوطات MARC 21 (D:\MAN)" : "Manuscripts MARC 21 Viewer"}
            className="glass-pill px-3 py-1.5 text-xs font-bold text-emerald-200 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/35 transition-all cursor-pointer border-emerald-400/40 flex items-center gap-1.5 shadow-sm"
          >
            <span>📜</span>
            <span>{isAr ? 'المخطوطات MARC' : 'Manuscripts MARC'}</span>
          </button>

          {/* Mobile AR View Link */}
          <a
            href="./mobile/"
            title={isAr ? "الانتقال إلى واجهة الجوال والواقع المعزز" : "Open Mobile AR & Vision Interface"}
            className="glass-pill px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/15 transition-all cursor-pointer border-white/20 flex items-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-white" />
            <span>{isAr ? 'نسخة الجوال' : 'Mobile AR'}</span>
          </a>

        </div>

      </div>
    </header>
  );
}
