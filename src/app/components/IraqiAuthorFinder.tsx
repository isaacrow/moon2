import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  searchRealIraqiAuthorities, 
  IraqiAuthorRecord 
} from '../../services/iraqiAuthorAIService';
import { 
  Search, 
  Users, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Globe,
  Database,
  Building,
  Plus,
  Loader2,
  X,
  MapPin,
  Calendar,
  Check
} from 'lucide-react';
import '../../styles/glassmorphism.css';

interface IraqiAuthorFinderProps {
  onSelectAuthor?: (author: IraqiAuthorRecord, role: 'Author' | 'Editor' | 'Translator' | 'Contributor') => void;
  onClose?: () => void;
  isModal?: boolean;
}

export function IraqiAuthorFinder({ onSelectAuthor, onClose, isModal = false }: IraqiAuthorFinderProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IraqiAuthorRecord[]>([]);
  const [sourcesFound, setSourcesFound] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'Author' | 'Editor' | 'Translator' | 'Contributor'>('Author');
  const [activeAuthor, setActiveAuthor] = useState<IraqiAuthorRecord | null>(null);
  const [selectedEra, setSelectedEra] = useState<string>('all');

  useEffect(() => {
    handleSearch('');
  }, []);

  const handleSearch = async (searchQuery: string = query) => {
    setLoading(true);
    try {
      const response = await searchRealIraqiAuthorities(searchQuery);
      setResults(response.results);
      setSourcesFound(response.sourcesFound);
      if (response.results.length > 0 && (!activeAuthor || !response.results.some(r => r.id === activeAuthor.id))) {
        setActiveAuthor(response.results[0]);
      }
    } catch (err) {
      console.error('Error querying Iraqi authorities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (author: IraqiAuthorRecord) => {
    if (onSelectAuthor) {
      onSelectAuthor(author, selectedRole);
    }
  };

  const filteredResults = selectedEra === 'all' 
    ? results 
    : results.filter(r => r.era === selectedEra);

  return (
    <div className={`space-y-5 ${isModal ? 'p-6 max-h-[85vh] overflow-y-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-lg">
            🇮🇶
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Iraqi Name Authorities Directory</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified Catalog Database
              </span>
            </div>
            <p className="text-xs text-white/50">
              National Library (INLA), IASJ, LOC Name Authorities & VIAF Reconciler
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Input & Era Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Search Iraqi author by name or work (e.g. علي الوردي, بدر شاكر السياب, الجواهري, نازك الملائكة)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/05 border border-white/15 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Era Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Eras (الكل)' },
            { id: 'الجمهورية والحديث', label: 'الحديث والمعاصر' },
            { id: 'العصر العباسي', label: 'العصر العباسي' },
            { id: 'باحث أكاديمي معاصر', label: 'الأكاديميون والباحثون' },
          ].map(era => (
            <button
              type="button"
              key={era.id}
              onClick={() => setSelectedEra(era.id)}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                selectedEra === era.id 
                  ? 'bg-white/20 text-white border border-white/30 shadow-sm' 
                  : 'text-white/50 hover:text-white bg-white/05'
              }`}
            >
              {era.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Results & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Results List (5 cols) */}
        <div className="lg:col-span-5 space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {filteredResults.map((author) => {
            const isSelected = activeAuthor?.id === author.id;
            return (
              <div
                key={author.id}
                onClick={() => setActiveAuthor(author)}
                className={`p-3.5 rounded-xl transition-all cursor-pointer border ${
                  isSelected 
                    ? 'border-cyan-400/60 bg-cyan-950/30' 
                    : 'bg-white/05 hover:bg-white/10 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{author.nameArabic}</span>
                      <span className="text-[11px] text-white/50 font-normal">({author.nameEnglish})</span>
                    </h3>
                    <p className="text-[10px] text-white/40 mt-0.5">
                      {author.affiliation || author.era} {author.birthDate ? `• ${author.birthDate}-${author.deathDate || ''}` : ''}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 shrink-0">
                    {author.era}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Author Authority Details & BIBFRAME Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {activeAuthor ? (
            <div className="p-5 rounded-2xl bg-white/05 border border-white/15 space-y-4">
              {/* Header & Insert */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400">
                    {activeAuthor.era} • {activeAuthor.city || 'العراق'}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {activeAuthor.nameArabic}
                  </h3>
                  <p className="text-[11px] text-white/60 font-mono">
                    Authorized: {activeAuthor.bibframePersonTriple.authorizedAccessPoint}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Author">Author (مؤلف)</option>
                    <option value="Editor">Editor (محرر)</option>
                    <option value="Translator">Translator (مترجم)</option>
                    <option value="Contributor">Contributor (مساهم)</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleApply(activeAuthor)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Insert</span>
                  </button>
                </div>
              </div>

              {/* Biography Summary */}
              <div className="p-3 rounded-xl bg-black/20 border border-white/05 space-y-1 text-xs text-white/80 leading-relaxed">
                <p className="font-arabic">{activeAuthor.biographyArabic}</p>
                <p className="text-white/50 text-[11px] pt-1 border-t border-white/05">{activeAuthor.biographyEnglish}</p>
              </div>

              {/* Major Works */}
              {activeAuthor.majorWorks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Notable Publications:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {activeAuthor.majorWorks.slice(0, 4).map((work, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-white/05 border border-white/08 text-[11px] flex items-center justify-between gap-1.5">
                        <span className="font-bold text-white truncate">{work.title}</span>
                        {work.year && <span className="text-[10px] text-white/40 font-mono shrink-0">{work.year}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reconciled Authority URIs */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                  Authority Control URIs:
                </span>
                <div className="space-y-1">
                  {activeAuthor.authorities.map((auth, idx) => (
                    <a
                      key={idx}
                      href={auth.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 px-2.5 rounded-lg bg-white/05 hover:bg-white/10 border border-white/08 flex items-center justify-between text-xs text-cyan-300 hover:text-cyan-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white/70">{auth.source}:</span>
                        <span className="font-mono text-[10px] truncate max-w-sm">{auth.uri}</span>
                      </div>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-white/40 border border-dashed border-white/10 rounded-2xl">
              <Users className="h-6 w-6 mx-auto mb-1 opacity-40" />
              <p className="text-xs">Select an author to view verified authority URIs and BIBFRAME triples.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
