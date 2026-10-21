import React, { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ChevronLeft, Upload, Download, FileText, Copy, Play,
  BookOpen, Code, RefreshCw, Trash2,
  CheckCircle, AlertTriangle, Info, FileCode, ArrowRight,
  Table, Eye, ExternalLink,
  GitBranch, Loader2, WifiOff, Zap, Shield,
  Terminal, FileInput, ToggleLeft, ToggleRight
} from 'lucide-react';
import {
  getMarc2BibframeEngine,
  SAMPLE_MARCXML,
  type Marc2BibframeEngineState,
} from './Marc2BibframeEngine';

// ============================================================================
// MARC2BIBFRAME2 CONVERTER
// Uses the ACTUAL Library of Congress marc2bibframe2 XSLT stylesheets
// https://github.com/lcnetdev/marc2bibframe2
//
// MARCXML → BIBFRAME 2.0 RDF/XML via browser-native XSLTProcessor
// ============================================================================

type OutputView = 'rdfxml' | 'triples' | 'summary';

interface Marc2BibframeProps {
  onBack?: () => void;
}

/** Extract a simple triple-like summary from RDF/XML */
function extractTripleSummary(rdfxml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rdfxml, 'text/xml');
  if (doc.querySelector('parsererror')) return 'Could not parse RDF/XML output.';

  const lines: string[] = [];
  const root = doc.documentElement;
  if (!root) return '';

  const processElement = (el: Element, depth: number) => {
    const about = el.getAttribute('rdf:about') || el.getAttribute('about') || '';
    const tag = el.localName || el.tagName;
    const ns = el.namespaceURI || '';
    const prefix = ns.includes('bibframe') ? 'bf:' : ns.includes('mads') ? 'madsrdf:' : ns.includes('bflc') ? 'bflc:' : '';

    if (about && depth <= 1) {
      lines.push(`\n=== ${prefix}${tag} ===`);
      lines.push(`  URI: ${about}`);
    }

    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i];
      const childTag = child.localName || child.tagName;
      const childNs = child.namespaceURI || '';
      const childPrefix = childNs.includes('bibframe') ? 'bf:' : childNs.includes('mads') ? 'madsrdf:' : childNs.includes('bflc') ? 'bflc:' : childNs.includes('rdf') ? 'rdf:' : childNs.includes('rdfs') ? 'rdfs:' : '';
      const resource = child.getAttribute('rdf:resource') || child.getAttribute('resource') || '';
      const text = child.children.length === 0 ? (child.textContent || '').trim() : '';

      if (resource) {
        lines.push(`  ${childPrefix}${childTag}: <${resource}>`);
      } else if (text && text.length < 200) {
        lines.push(`  ${childPrefix}${childTag}: "${text}"`);
      } else if (child.children.length > 0) {
        lines.push(`  ${childPrefix}${childTag}:`);
        processElement(child, depth + 1);
      }
    }
  };

  for (let i = 0; i < root.children.length; i++) {
    processElement(root.children[i], 0);
  }

  return lines.join('\n') || 'No triples extracted.';
}

export default function Marc2Bibframe({ onBack }: Marc2BibframeProps) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [outputView, setOutputView] = useState<OutputView>('rdfxml');
  const [isConverting, setIsConverting] = useState(false);
  const [activeTab, setActiveTab] = useState<'convert' | 'about'>('convert');
  const [engineState, setEngineState] = useState<Marc2BibframeEngineState>({
    status: 'idle', error: null, progress: { loaded: 0, total: 34 },
    xslFilesCount: 27, confFilesCount: 7,
  });
  const [baseUri, setBaseUri] = useState('http://example.org/');
  const [conversionEngine, setConversionEngine] = useState<'xslt' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const engine = getMarc2BibframeEngine();
    const unsub = engine.subscribe(setEngineState);
    setEngineState(engine.state);
    if (engine.state.status === 'idle') {
      engine.initialize().catch(() => {});
    }
    return unsub;
  }, []);

  const handleConvert = useCallback(() => {
    if (!inputText.trim()) {
      toast.error('Please provide MARCXML input');
      return;
    }

    const engine = getMarc2BibframeEngine();
    if (!engine.isReady) {
      toast.error('XSLT engine is still loading. Please wait.');
      return;
    }

    setIsConverting(true);
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const result = engine.convert(inputText, { baseuri: baseUri });
        if (result.success) {
          setOutputText(result.rdfxml);
          setConversionEngine('xslt');

          // Count approximate triples
          const tripleCount = (result.rdfxml.match(/<bf:|<bflc:|<rdfs:|<rdf:type/g) || []).length;
          toast.success(`Converted! ~${tripleCount} BIBFRAME properties generated via LC XSLT`);
        } else {
          toast.error(`Conversion failed: ${result.error}`);
          setOutputText(`<!-- Error: ${result.error} -->`);
          setConversionEngine(null);
        }
      } catch (e: any) {
        toast.error(`Error: ${e.message}`);
        setOutputText(`<!-- Error: ${e.message} -->`);
        setConversionEngine(null);
      } finally {
        setIsConverting(false);
      }
    }, 50);
  }, [inputText, baseUri]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setInputText(ev.target?.result as string);
      toast.success(`Loaded: ${file.name}`);
    };
    reader.readAsText(file);
  }, []);

  const handleExport = useCallback(() => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'application/rdf+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marc2bibframe-output-${Date.now()}.rdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported RDF/XML');
  }, [outputText]);

  const handleCopy = useCallback(() => {
    if (!outputText) return;
    const content = outputView === 'summary' ? extractTripleSummary(outputText) : outputText;
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  }, [outputText, outputView]);

  const loadSample = useCallback(() => {
    setInputText(SAMPLE_MARCXML);
    toast.success('Sample MARCXML record loaded');
  }, []);

  const getDisplayOutput = (): string => {
    if (!outputText) return '';
    if (outputView === 'summary') return extractTripleSummary(outputText);
    if (outputView === 'triples') return extractTripleSummary(outputText);
    return outputText;
  };

  const retryInit = useCallback(() => {
    const engine = getMarc2BibframeEngine();
    engine.reset();
    engine.initialize().catch(() => {});
  }, []);

  const glassCard = "backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl";
  const glassCardBg = "bg-white/5";

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1a2e 30%, #1a1040 60%, #0a0a1a 100%)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent flex items-center gap-3">
                <GitBranch className="w-7 h-7 text-cyan-400" />
                marc2bibframe2
              </h1>
              <p className="text-sm text-white/40 mt-1">
                MARC 21 → BIBFRAME 2.0 &bull; Powered by LC's{' '}
                <a href="https://github.com/lcnetdev/marc2bibframe2" target="_blank" rel="noopener noreferrer"
                  className="text-cyan-400/60 hover:text-cyan-400 underline inline-flex items-center gap-1">
                  lcnetdev/marc2bibframe2 <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            {[
              { key: 'convert' as const, label: 'Convert', icon: Play },
              { key: 'about' as const, label: 'About', icon: Info },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Engine Status Bar */}
        <div className={`mb-4 px-4 py-2.5 rounded-xl border ${
          engineState.status === 'ready' ? 'bg-emerald-500/5 border-emerald-500/20' :
          engineState.status === 'error' ? 'bg-red-500/5 border-red-500/20' :
          engineState.status === 'fetching' || engineState.status === 'merging' ? 'bg-cyan-500/5 border-cyan-500/20' :
          'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {engineState.status === 'ready' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-400">LC XSLT ENGINE READY</span>
                  </div>
                  <span className="text-[10px] text-white/30">|</span>
                  <span className="text-[10px] text-white/40">{engineState.xslFilesCount} stylesheets merged</span>
                  <span className="text-[10px] text-white/30">|</span>
                  <span className="text-[10px] text-white/40">{engineState.confFilesCount} config files embedded</span>
                </>
              )}
              {engineState.status === 'fetching' && (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span className="text-xs text-cyan-400">Fetching LC stylesheets from GitHub...</span>
                  <span className="text-[10px] text-white/40">{engineState.progress.loaded}/{engineState.progress.total} files</span>
                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400/60 rounded-full transition-all" style={{ width: `${(engineState.progress.loaded / engineState.progress.total) * 100}%` }} />
                  </div>
                </>
              )}
              {engineState.status === 'merging' && (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                  <span className="text-xs text-violet-400">Merging XSLT stylesheets &amp; embedding config...</span>
                </>
              )}
              {engineState.status === 'error' && (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs text-red-400">Engine failed</span>
                  <span className="text-[10px] text-red-300/50 max-w-md truncate">{engineState.error}</span>
                </>
              )}
              {engineState.status === 'idle' && (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-xs text-white/40">Engine not initialized</span>
                </>
              )}
            </div>
            {engineState.status === 'error' && (
              <button onClick={retryInit} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all">
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            )}
          </div>
        </div>

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className={`${glassCard} ${glassCardBg} p-6 space-y-4`}>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" />
              About marc2bibframe2
            </h2>
            <div className="prose prose-invert prose-sm max-w-none space-y-3 text-white/70">
              <p>
                This tool uses the <strong className="text-cyan-300">actual XSLT 1.0 stylesheets</strong> from the Library of Congress{' '}
                <a href="https://github.com/lcnetdev/marc2bibframe2" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">marc2bibframe2</a>{' '}
                project to convert MARCXML records into BIBFRAME 2.0 RDF/XML.
              </p>
              <div className={`p-4 rounded-xl ${glassCardBg} border border-white/10`}>
                <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  How It Works
                </h3>
                <ol className="space-y-1.5 text-xs">
                  <li><span className="text-cyan-300 font-mono">1.</span> Fetches <code className="text-cyan-300">marc2bibframe2.xsl</code> + {engineState.xslFilesCount - 1} included ConvSpec-*.xsl stylesheets from GitHub</li>
                  <li><span className="text-cyan-300 font-mono">2.</span> Fetches {engineState.confFilesCount} XML configuration files (codeMaps, language crosswalks, etc.)</li>
                  <li><span className="text-cyan-300 font-mono">3.</span> Merges all <code className="text-white/60">xsl:include</code> references into a single monolithic XSLT stylesheet</li>
                  <li><span className="text-cyan-300 font-mono">4.</span> Replaces <code className="text-white/60">document()</code> config references with inline embedded data</li>
                  <li><span className="text-cyan-300 font-mono">5.</span> Converts MARCXML → BIBFRAME RDF/XML using browser's native <code className="text-cyan-300">XSLTProcessor</code></li>
                </ol>
              </div>
              <div className={`p-4 rounded-xl ${glassCardBg} border border-white/10`}>
                <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-400" />
                  LC Specification Coverage
                </h3>
                <ul className="space-y-1 text-xs">
                  <li><strong className="text-cyan-300">Leader &amp; Control Fields:</strong> LDR, 001-007, 006/008 with full code mapping</li>
                  <li><strong className="text-cyan-300">Numbers &amp; Codes (01X-04X):</strong> LCCN, ISBN, ISSN, all standard identifiers</li>
                  <li><strong className="text-cyan-300">Classification (05X-08X):</strong> LC, Dewey, NLM, government documents</li>
                  <li><strong className="text-cyan-300">Names (1XX/7XX/8XX):</strong> Personal, corporate, meeting with relator codes</li>
                  <li><strong className="text-cyan-300">Titles (2XX):</strong> Main, variant, uniform, key titles</li>
                  <li><strong className="text-cyan-300">Publication (250-270):</strong> Edition, imprint, provision activity</li>
                  <li><strong className="text-cyan-300">Physical (3XX):</strong> Extent, dimensions, RDA content/media/carrier types</li>
                  <li><strong className="text-cyan-300">Series (4XX/8XX):</strong> Series statements and added entries</li>
                  <li><strong className="text-cyan-300">Notes (5XX):</strong> All note fields with proper BIBFRAME mapping</li>
                  <li><strong className="text-cyan-300">Subjects (6XX):</strong> LCSH, MeSH, fast, genre/form with MADSRDF</li>
                  <li><strong className="text-cyan-300">Links (760-788):</strong> Related works, preceding/succeeding entries</li>
                  <li><strong className="text-cyan-300">Holdings (841-887):</strong> Items, electronic access, metadata</li>
                  <li><strong className="text-cyan-300">880 Linked Fields:</strong> Alternate script handling</li>
                  <li><strong className="text-cyan-300">Preprocessing:</strong> Record splitting for multiple instances</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Convert Tab */}
        {activeTab === 'convert' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <div className={`${glassCard} ${glassCardBg} flex flex-col`}>
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileInput className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-white">MARCXML Input</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={loadSample} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/20 transition-all">
                    <BookOpen className="w-3.5 h-3.5" /> Sample
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all">
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </button>
                  <input ref={fileInputRef} type="file" accept=".xml,.mrc,.marcxml" onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => { setInputText(''); setOutputText(''); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/40 hover:text-red-300 hover:bg-red-500/10 border border-white/10 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Base URI setting */}
              <div className="px-4 pt-3 flex items-center gap-2">
                <span className="text-[10px] text-white/40 shrink-0">Base URI:</span>
                <input
                  value={baseUri}
                  onChange={(e) => setBaseUri(e.target.value)}
                  className="flex-1 bg-black/20 rounded-lg px-2 py-1 text-[11px] font-mono text-cyan-300/80 border border-white/5 focus:border-cyan-500/30 focus:outline-none"
                  placeholder="http://example.org/"
                />
              </div>

              <div className="flex-1 p-4 pt-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Paste MARCXML here...\n\n<record xmlns="http://www.loc.gov/MARC21/slim">\n  <leader>01234nam a22...</leader>\n  <controlfield tag="001">12345</controlfield>\n  <datafield tag="245" ind1="1" ind2="0">\n    <subfield code="a">Title</subfield>\n  </datafield>\n</record>`}
                  className="w-full h-[400px] bg-black/30 rounded-xl p-4 text-sm font-mono text-white/80 placeholder:text-white/20 border border-white/5 focus:border-cyan-500/30 focus:outline-none resize-none"
                  spellCheck={false}
                />
              </div>

              <div className="p-4 border-t border-white/10">
                <button
                  onClick={handleConvert}
                  disabled={isConverting || !inputText.trim() || engineState.status !== 'ready'}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 text-white hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  {isConverting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Convert MARC 21 → BIBFRAME 2.0
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div className={`${glassCard} ${glassCardBg} flex flex-col`}>
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-white">BIBFRAME 2.0 Output</h2>
                  {conversionEngine === 'xslt' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300">LC XSLT</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 p-0.5 rounded-lg bg-black/30 border border-white/5">
                    {[
                      { key: 'rdfxml' as const, label: 'RDF/XML', icon: Code },
                      { key: 'summary' as const, label: 'Summary', icon: Eye },
                    ].map(fmt => (
                      <button
                        key={fmt.key}
                        onClick={() => setOutputView(fmt.key)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                          outputView === fmt.key
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20'
                            : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        <fmt.icon className="w-3 h-3" />
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                  {outputText && (
                    <>
                      <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-all">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/20 transition-all">
                        <Download className="w-3.5 h-3.5" /> Export .rdf
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4">
                {outputText ? (
                  <pre className="w-full h-[440px] overflow-auto bg-black/30 rounded-xl p-4 text-sm font-mono text-white/80 border border-white/5 whitespace-pre-wrap">
                    {getDisplayOutput()}
                  </pre>
                ) : (
                  <div className="w-full h-[440px] bg-black/30 rounded-xl border border-white/5 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <ArrowRight className="w-8 h-8 text-white/10 mx-auto" />
                      <p className="text-sm text-white/20">BIBFRAME RDF/XML output will appear here</p>
                      <p className="text-xs text-white/10">Paste MARCXML on the left and click Convert</p>
                    </div>
                  </div>
                )}
              </div>

              {outputText && (
                <div className="p-4 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-green-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Conversion successful
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400/60">
                      <Shield className="w-3 h-3" /> LC marc2bibframe2 XSLT
                    </span>
                    <span className="text-[10px] text-white/30">
                      {(outputText.length / 1024).toFixed(1)} KB output
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
