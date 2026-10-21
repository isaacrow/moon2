/**
 * MOON TESTING - RDF/JSON-LD Validation & Triple Store Testing Suite
 * 
 * Tests whether your output is:
 * 1. Valid JSON (syntax)
 * 2. Valid JSON-LD (W3C spec compliant)
 * 3. Valid BIBFRAME RDF (ontology compliant)
 * 4. Triple-store ingestible (N-Triples / Turtle)
 * 5. SPARQL-queryable
 * 
 * External validator links:
 * - https://json-ld.org/playground/
 * - https://www.w3.org/RDF/Validator/
 * - https://rdf-translator.appspot.com/
 * 
 * Designed by Isaac Faleh
 */

"use client";
import React, { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";
import {
  ChevronLeft, Shield, CheckCircle2, AlertCircle, AlertTriangle,
  Braces, Code, FileText, Copy, Download, ExternalLink, Play,
  Upload, Database, Network, Hash, Globe, Zap, Info, X,
  Search, RefreshCw, BarChart3, Eye, Loader2
} from "lucide-react";
import {
  buildW3CJsonLd, validateW3CJsonLd, jsonLdToTurtle, jsonLdToNTriples,
  BIBFRAME_JSONLD_CONTEXT, JsonLdValidationResult
} from "../../services/w3cJsonLdBuilder";
import { validateBibframeRecord } from "../../services/bibframeValidator";
import { validateInstitutionalBibframe, getValidationBadge } from "../../services/institutionalValidator";
import { extractTriples, validateGraphConnectivity } from "../../services/rdfGraphBuilder";
import { ONTOLOGY_VERSION } from "../../services/bibframeOntology";
import { realLocExamples } from "../utils/realLocExamples";
import { mintUriSet, generateRecordId } from "../../services/uriMintingService";
import { useAuth } from "../contexts/AuthContext";
import moonLogo from "figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png";
import "../../styles/glassmorphism.css";

// Sample valid BIBFRAME JSON-LD for testing
const SAMPLE_VALID_JSONLD = {
  "@context": { ...BIBFRAME_JSONLD_CONTEXT },
  "@graph": [
    {
      "@id": "https://moonlib.org/resource/work/test-001",
      "@type": "bf:Work",
      "bf:title": [{
        "@type": "bf:Title",
        "bf:mainTitle": [{ "@value": "The Art of Computer Programming" }],
        "bf:subtitle": [{ "@value": "Fundamental Algorithms" }]
      }],
      "bf:contribution": [{
        "@type": ["bf:Contribution", "bflc:PrimaryContribution"],
        "bf:agent": {
          "@id": "http://id.loc.gov/authorities/names/n79135509",
          "@type": "bf:Person",
          "rdfs:label": "Knuth, Donald Ervin, 1938-"
        },
        "bf:role": { "@id": "http://id.loc.gov/vocabulary/relators/aut" }
      }],
      "bf:language": [{ "@id": "http://id.loc.gov/vocabulary/languages/eng" }],
      "bf:subject": [{
        "@id": "http://id.loc.gov/authorities/subjects/sh85029533",
        "@type": "bf:Topic",
        "rdfs:label": "Computer programming"
      }],
      "bf:classification": [{
        "@type": "bf:Classification",
        "bf:classificationPortion": "QA76.6",
        "bf:source": { "@id": "http://id.loc.gov/vocabulary/classSchemes/lcc" }
      }],
      "bf:hasInstance": { "@id": "https://moonlib.org/resource/instance/test-001" },
      "bf:adminMetadata": { "@id": "https://moonlib.org/resource/admin/test-001" }
    },
    {
      "@id": "https://moonlib.org/resource/instance/test-001",
      "@type": "bf:Instance",
      "bf:instanceOf": { "@id": "https://moonlib.org/resource/work/test-001" },
      "bf:title": [{
        "@type": "bf:Title",
        "bf:mainTitle": [{ "@value": "The Art of Computer Programming" }]
      }],
      "bf:editionStatement": [{ "@value": "3rd edition" }],
      "bf:identifiedBy": [{
        "@type": "bf:Isbn",
        "rdf:value": "978-0-201-89683-1"
      }],
      "bf:provisionActivity": [{
        "@type": "bf:Publication",
        "bf:agent": {
          "@id": "https://moonlib.org/resource/agent/addison-wesley",
          "@type": "bf:Organization",
          "rdfs:label": "Addison-Wesley"
        },
        "bf:place": {
          "@id": "http://id.loc.gov/vocabulary/countries/mau",
          "@type": "bf:Place",
          "rdfs:label": "Reading, Massachusetts"
        },
        "bf:date": [{ "@value": "1997", "@type": "xsd:gYear" }]
      }],
      "bf:extent": [{ "@type": "bf:Extent", "rdfs:label": "634 pages" }],
      "bf:dimensions": [{ "@value": "24 cm" }],
      "bf:carrier": [{ "@id": "http://id.loc.gov/vocabulary/carriers/nc" }],
      "bf:media": [{ "@id": "http://id.loc.gov/vocabulary/mediaTypes/n" }],
      "bf:hasItem": { "@id": "https://moonlib.org/resource/item/test-001" }
    },
    {
      "@id": "https://moonlib.org/resource/item/test-001",
      "@type": "bf:Item",
      "bf:itemOf": { "@id": "https://moonlib.org/resource/instance/test-001" },
      "bf:heldBy": {
        "@id": "https://moonlib.org",
        "@type": "bf:Organization",
        "rdfs:label": "Moon Library"
      },
      "bf:shelfMark": [{ "@type": "bf:ShelfMark", "rdfs:label": "QA76.6 .K64 1997" }]
    },
    {
      "@id": "https://moonlib.org/resource/admin/test-001",
      "@type": "bf:AdminMetadata",
      "bf:creationDate": [{ "@value": "2026-02-27", "@type": "xsd:date" }],
      "bf:descriptionConventions": { "@id": "http://id.loc.gov/vocabulary/descriptionConventions/rda" },
      "bf:descriptionLanguage": { "@id": "http://id.loc.gov/vocabulary/languages/eng" },
      "bf:source": {
        "@id": "https://moonlib.org",
        "@type": "bf:Source",
        "rdfs:label": "Moon Library System"
      }
    }
  ]
};

type TestTab = "input" | "json-validate" | "jsonld-validate" | "bibframe-validate" | "turtle" | "ntriples" | "sparql" | "triple-store";

interface MoonTestingProps {
  onBack?: () => void;
}

export default function MoonTesting({ onBack }: MoonTestingProps) {
  const { username } = useAuth();
  const [activeTab, setActiveTab] = useState<TestTab>("input");
  const [inputJson, setInputJson] = useState(JSON.stringify(SAMPLE_VALID_JSONLD, null, 2));
  const [parsedDoc, setParsedDoc] = useState<any>(SAMPLE_VALID_JSONLD);
  const [parseError, setParseError] = useState<string | null>(null);

  // Validation results
  const [jsonValid, setJsonValid] = useState<boolean | null>(null);
  const [w3cResult, setW3cResult] = useState<JsonLdValidationResult | null>(null);
  const [bfResult, setBfResult] = useState<any>(null);
  const [instResult, setInstResult] = useState<any>(null);
  const [turtleOutput, setTurtleOutput] = useState("");
  const [ntriplesOutput, setNtriplesOutput] = useState("");
  const [tripleCount, setTripleCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // In-memory triple store
  const [tripleStore, setTripleStore] = useState<any[]>([]);
  const [sparqlQuery, setSparqlQuery] = useState("SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 50");
  const [sparqlResults, setSparqlResults] = useState<any[]>([]);

  // ===== PARSE INPUT =====
  const handleParseInput = useCallback(() => {
    try {
      const doc = JSON.parse(inputJson);
      setParsedDoc(doc);
      setParseError(null);
      setJsonValid(true);
      toast.success("Valid JSON!");
    } catch (e: any) {
      setParseError(e.message);
      setJsonValid(false);
      setParsedDoc(null);
      toast.error("Invalid JSON", { description: e.message });
    }
  }, [inputJson]);

  // ===== RUN ALL TESTS =====
  const runAllTests = useCallback(() => {
    setIsRunning(true);
    setTimeout(() => {
      try {
        // 1. JSON parse
        let doc: any;
        try {
          doc = JSON.parse(inputJson);
          setJsonValid(true);
          setParsedDoc(doc);
          setParseError(null);
        } catch (e: any) {
          setJsonValid(false);
          setParseError(e.message);
          setIsRunning(false);
          return;
        }

        // 2. W3C JSON-LD validation
        const w3c = validateW3CJsonLd(doc);
        setW3cResult(w3c);

        // 3. BIBFRAME validation
        const bf = validateBibframeRecord(doc);
        setBfResult(bf);

        // 4. Institutional validation
        const inst = validateInstitutionalBibframe(doc);
        setInstResult(inst);

        // 5. Turtle generation
        try {
          const ttl = jsonLdToTurtle(doc);
          setTurtleOutput(ttl);
        } catch (e) {
          setTurtleOutput(`ERROR: ${e}`);
        }

        // 6. N-Triples generation
        try {
          const nt = jsonLdToNTriples(doc);
          setNtriplesOutput(nt);
          const count = nt.split("\n").filter(Boolean).length;
          setTripleCount(count);

          // 7. Load into in-memory triple store
          const triples = nt.split("\n").filter(Boolean).map(line => {
            const match = line.match(/^(<[^>]+>|_:\S+)\s+(<[^>]+>)\s+(.+)\s+\.$/);
            if (!match) return null;
            return { subject: match[1], predicate: match[2], object: match[3] };
          }).filter(Boolean);
          setTripleStore(triples as any[]);
        } catch (e) {
          setNtriplesOutput(`ERROR: ${e}`);
          setTripleCount(0);
        }

        toast.success("All tests complete!", { description: `${w3c.errors.length} errors, ${w3c.warnings.length} warnings` });
      } catch (e) {
        console.error("Test error:", e);
        toast.error("Test failed", { description: String(e) });
      }
      setIsRunning(false);
    }, 100);
  }, [inputJson]);

  // ===== SPARQL (simplified) =====
  const runSparql = useCallback(() => {
    if (tripleStore.length === 0) {
      toast.error("Load data into triple store first (run all tests)");
      return;
    }

    try {
      const query = sparqlQuery.trim().toUpperCase();
      let results = [...tripleStore];

      // Very simplified SPARQL-like filter
      const whereMatch = sparqlQuery.match(/WHERE\s*\{([^}]+)\}/i);
      if (whereMatch) {
        const pattern = whereMatch[1].trim();
        // Check for specific subject/predicate/object filters
        const triplePattern = pattern.match(/\?(\w+)\s+(<[^>]+>)\s+\?(\w+)/);
        if (triplePattern) {
          const predUri = triplePattern[2];
          results = tripleStore.filter(t => t.predicate === predUri);
        }
        // Filter by subject
        const subjectFilter = pattern.match(/<([^>]+)>\s+\?(\w+)\s+\?(\w+)/);
        if (subjectFilter) {
          const subUri = `<${subjectFilter[1]}>`;
          results = tripleStore.filter(t => t.subject === subUri);
        }
      }

      // LIMIT
      const limitMatch = sparqlQuery.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        results = results.slice(0, parseInt(limitMatch[1]));
      }

      setSparqlResults(results);
      toast.success(`Query returned ${results.length} result(s)`);
    } catch (e) {
      toast.error("SPARQL error", { description: String(e) });
    }
  }, [sparqlQuery, tripleStore]);

  // ===== LOAD EXAMPLE =====
  const loadExample = (exampleData: any) => {
    const recordId = generateRecordId();
    const uris = mintUriSet(recordId);
    const w3c = buildW3CJsonLd({
      workData: { ...exampleData.work, "@id": uris.work },
      instanceData: { ...exampleData.instance, "@id": uris.instance, "bf:instanceOf": { "@id": uris.work } },
      itemData: exampleData.item || {},
      adminData: {},
      uriSet: uris,
      enableExpression: false
    });
    setInputJson(JSON.stringify(w3c, null, 2));
    setParsedDoc(w3c);
    setParseError(null);
    setJsonValid(true);
    toast.success("Example loaded as W3C JSON-LD!");
  };

  // ===== HELPERS =====
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  // Overall test score
  const overallScore = useMemo(() => {
    let score = 0;
    let total = 0;
    if (jsonValid !== null) { total++; if (jsonValid) score++; }
    if (w3cResult) { total++; if (w3cResult.valid) score++; }
    if (bfResult) { total++; if (bfResult.valid) score++; }
    if (instResult) { total++; if (instResult.valid) score++; }
    if (turtleOutput && !turtleOutput.startsWith("ERROR")) { total++; score++; }
    if (ntriplesOutput && !ntriplesOutput.startsWith("ERROR")) { total++; score++; }
    if (tripleStore.length > 0) { total++; score++; }
    return { score, total, pct: total > 0 ? Math.round((score / total) * 100) : 0 };
  }, [jsonValid, w3cResult, bfResult, instResult, turtleOutput, ntriplesOutput, tripleStore]);

  return (
    <div className="h-screen flex flex-col animated-gradient-bg">
      <Toaster position="top-right" />

      {/* ===== TOP BAR ===== */}
      <div className="glass-navbar">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="glass-button px-3 py-2 flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              )}
              <img src={moonLogo} alt="Moon" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                  Moon Testing
                </h1>
                <p className="text-xs text-white/70">
                  RDF Validator + JSON-LD Playground + Triple Store + SPARQL
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {overallScore.total > 0 && (
                <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  overallScore.pct >= 80 ? "bg-green-500/30 text-green-300 border border-green-500/50" :
                  overallScore.pct >= 50 ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/50" :
                  "bg-red-500/30 text-red-300 border border-red-500/50"
                }`}>
                  {overallScore.score}/{overallScore.total} Tests Passed ({overallScore.pct}%)
                </div>
              )}
              <button onClick={runAllTests} disabled={isRunning}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50">
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Run All Tests
              </button>
            </div>
          </div>

          {/* Stats bar */}
          {overallScore.total > 0 && (
            <div className="mt-3 flex items-center gap-4 text-xs">
              <TestBadge label="JSON" passed={jsonValid === true} />
              <TestBadge label="W3C JSON-LD" passed={w3cResult?.valid === true} />
              <TestBadge label="BIBFRAME" passed={bfResult?.valid === true} />
              <TestBadge label="Institutional" passed={instResult?.valid === true} />
              <TestBadge label="Turtle" passed={!!turtleOutput && !turtleOutput.startsWith("ERROR")} />
              <TestBadge label="N-Triples" passed={!!ntriplesOutput && !ntriplesOutput.startsWith("ERROR")} />
              <TestBadge label="Triple Store" passed={tripleStore.length > 0} />
              {tripleCount > 0 && <span className="text-gray-400 ml-2">{tripleCount} triples loaded</span>}
            </div>
          )}
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="glass-navbar border-t border-white/10">
        <div className="px-6 py-2 flex items-center gap-1.5 overflow-x-auto">
          <TTab active={activeTab === "input"} onClick={() => setActiveTab("input")} icon={<Braces className="h-3.5 w-3.5" />} label="Input JSON-LD" />
          <TTab active={activeTab === "json-validate"} onClick={() => setActiveTab("json-validate")} icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="JSON Syntax" />
          <TTab active={activeTab === "jsonld-validate"} onClick={() => setActiveTab("jsonld-validate")} icon={<Shield className="h-3.5 w-3.5" />} label="W3C JSON-LD" />
          <TTab active={activeTab === "bibframe-validate"} onClick={() => setActiveTab("bibframe-validate")} icon={<Database className="h-3.5 w-3.5" />} label="BIBFRAME RDF" />
          <TTab active={activeTab === "turtle"} onClick={() => setActiveTab("turtle")} icon={<Code className="h-3.5 w-3.5" />} label="Turtle" />
          <TTab active={activeTab === "ntriples"} onClick={() => setActiveTab("ntriples")} icon={<FileText className="h-3.5 w-3.5" />} label="N-Triples" />
          <TTab active={activeTab === "triple-store"} onClick={() => setActiveTab("triple-store")} icon={<Database className="h-3.5 w-3.5" />} label={`Triple Store (${tripleStore.length})`} />
          <TTab active={activeTab === "sparql"} onClick={() => setActiveTab("sparql")} icon={<Search className="h-3.5 w-3.5" />} label="SPARQL" />
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 overflow-auto p-6" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(20,20,30,0.5) 100%)" }}>

        {/* ===== INPUT ===== */}
        {activeTab === "input" && (
          <div className="space-y-4">
            {/* Example loader */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Load Test Data</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setInputJson(JSON.stringify(SAMPLE_VALID_JSONLD, null, 2))}
                  className="glass-button px-3 py-1.5 text-xs">Sample: Knuth TAOCP (Valid W3C)</button>
                {realLocExamples.map(ex => (
                  <button key={ex.id} onClick={() => loadExample(ex.data)}
                    className="glass-button px-3 py-1.5 text-xs">{ex.name}</button>
                ))}
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">JSON-LD Input</h3>
                <div className="flex gap-2">
                  <button onClick={handleParseInput} className="glass-button px-4 py-2 text-sm">Parse</button>
                  <button onClick={runAllTests} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                    Run All Tests
                  </button>
                </div>
              </div>
              <textarea value={inputJson} onChange={e => setInputJson(e.target.value)}
                className="w-full h-[calc(100vh-400px)] bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/50"
                spellCheck={false} />
              {parseError && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-2" />{parseError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== JSON SYNTAX ===== */}
        {activeTab === "json-validate" && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Test 1: JSON Syntax Validation</h3>
            <div className="mb-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-400">
              Checks: Is the input valid JSON? Can it be parsed by <code>JSON.parse()</code>?
            </div>
            {jsonValid === null ? (
              <div className="text-center py-12 text-gray-400">Click "Run All Tests" to validate</div>
            ) : jsonValid ? (
              <div className="p-6 bg-green-500/20 border-2 border-green-500/50 rounded-xl">
                <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <h4 className="text-xl font-bold text-green-300 text-center">PASS - Valid JSON</h4>
                <p className="text-sm text-green-200/70 text-center mt-2">
                  Document is syntactically valid JSON. Size: {inputJson.length.toLocaleString()} bytes.
                </p>
              </div>
            ) : (
              <div className="p-6 bg-red-500/20 border-2 border-red-500/50 rounded-xl">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <h4 className="text-xl font-bold text-red-300 text-center">FAIL - Invalid JSON</h4>
                <p className="text-sm text-red-200/70 text-center mt-2">{parseError}</p>
              </div>
            )}
          </div>
        )}

        {/* ===== W3C JSON-LD ===== */}
        {activeTab === "jsonld-validate" && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Test 2: W3C JSON-LD Specification Compliance</h3>
            <div className="mb-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-400">
              Checks: Does the document follow the W3C JSON-LD 1.1 specification? Are @context prefixes complete?
              Do all @type and property keys resolve? Would it pass <a href="https://json-ld.org/playground/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">json-ld.org/playground</a>?
            </div>
            {!w3cResult ? (
              <div className="text-center py-12 text-gray-400">Click "Run All Tests" to validate</div>
            ) : (
              <div className="space-y-4">
                <div className={`p-6 rounded-xl border-2 ${w3cResult.valid ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"}`}>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    {w3cResult.valid ? <CheckCircle2 className="h-10 w-10 text-green-400" /> : <AlertCircle className="h-10 w-10 text-red-400" />}
                    <h4 className={`text-xl font-bold ${w3cResult.valid ? "text-green-300" : "text-red-300"}`}>
                      {w3cResult.valid ? "PASS - W3C Compliant JSON-LD" : `FAIL - ${w3cResult.errors.length} Error(s)`}
                    </h4>
                  </div>
                  {/* Stats */}
                  <div className="flex justify-center gap-6 text-xs text-gray-300 mt-2">
                    <span>{w3cResult.stats.nodeCount} nodes</span>
                    <span>~{w3cResult.stats.tripleEstimate} triples</span>
                    <span>{w3cResult.stats.prefixesUsed.length} prefixes</span>
                    <span className={w3cResult.stats.allNodesHaveId ? "text-green-400" : "text-red-400"}>
                      All @id: {w3cResult.stats.allNodesHaveId ? "Yes" : "No"}
                    </span>
                    <span className={w3cResult.stats.allNodesHaveType ? "text-green-400" : "text-yellow-400"}>
                      All @type: {w3cResult.stats.allNodesHaveType ? "Yes" : "No"}
                    </span>
                    <span className={w3cResult.stats.contextComplete ? "text-green-400" : "text-red-400"}>
                      Context: {w3cResult.stats.contextComplete ? "Complete" : "Incomplete"}
                    </span>
                  </div>
                </div>
                {/* Types */}
                {w3cResult.stats.typesFound.length > 0 && (
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h5 className="text-xs font-semibold text-gray-400 mb-2">RDF Types Found:</h5>
                    <div className="flex flex-wrap gap-2">{w3cResult.stats.typesFound.map((t, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-mono">{t}</span>
                    ))}</div>
                  </div>
                )}
                {/* Errors */}
                {w3cResult.errors.length > 0 && (
                  <div><h5 className="text-sm font-semibold text-red-400 mb-2">Errors ({w3cResult.errors.length})</h5>
                    {w3cResult.errors.map((e, i) => <ErrLine key={i} level="error" message={e} />)}
                  </div>
                )}
                {w3cResult.warnings.length > 0 && (
                  <div><h5 className="text-sm font-semibold text-yellow-400 mb-2">Warnings ({w3cResult.warnings.length})</h5>
                    {w3cResult.warnings.map((w, i) => <ErrLine key={i} level="warning" message={w} />)}
                  </div>
                )}
                {w3cResult.info.length > 0 && (
                  <div><h5 className="text-sm font-semibold text-blue-400 mb-2">Info ({w3cResult.info.length})</h5>
                    {w3cResult.info.map((inf, i) => <ErrLine key={i} level="info" message={inf} />)}
                  </div>
                )}
                {/* External links */}
                <div className="flex gap-3 mt-4">
                  <a href={`https://json-ld.org/playground/#startTab=tab-expanded&json-ld=${encodeURIComponent(inputJson)}`}
                    target="_blank" rel="noopener noreferrer" className="glass-button px-4 py-2 text-sm flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" /> Open in JSON-LD Playground
                  </a>
                  <a href="https://www.w3.org/RDF/Validator/" target="_blank" rel="noopener noreferrer"
                    className="glass-button px-4 py-2 text-sm flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" /> W3C RDF Validator
                  </a>
                  <a href="https://rdf-translator.appspot.com/" target="_blank" rel="noopener noreferrer"
                    className="glass-button px-4 py-2 text-sm flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" /> RDF Translator
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== BIBFRAME RDF ===== */}
        {activeTab === "bibframe-validate" && (
          <div className="space-y-4">
            {!bfResult && !instResult ? (
              <div className="glass-card p-6 text-center py-12 text-gray-400">Click "Run All Tests" to validate</div>
            ) : (
              <>
                {/* BIBFRAME */}
                {bfResult && (
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Test 3a: BIBFRAME Semantic Validation</h3>
                    <div className={`p-6 rounded-xl border-2 mb-4 ${bfResult.valid ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"}`}>
                      <div className="flex items-center justify-center gap-3">
                        {bfResult.valid ? <CheckCircle2 className="h-10 w-10 text-green-400" /> : <AlertCircle className="h-10 w-10 text-red-400" />}
                        <h4 className={`text-xl font-bold ${bfResult.valid ? "text-green-300" : "text-red-300"}`}>
                          {bfResult.valid ? "PASS - Valid BIBFRAME" : `FAIL - ${bfResult.errors.length} Error(s)`}
                        </h4>
                      </div>
                    </div>
                    {bfResult.errors.length > 0 && bfResult.errors.map((e: any, i: number) => (
                      <ErrLine key={i} level="error" message={`[${e.code}] ${e.entity}: ${e.message}`} />
                    ))}
                    {bfResult.warnings.length > 0 && bfResult.warnings.map((w: any, i: number) => (
                      <ErrLine key={i} level="warning" message={`[${w.code}] ${w.entity}: ${w.message}`} />
                    ))}
                  </div>
                )}
                {/* Institutional */}
                {instResult && (
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Test 3b: Institutional Standards (LOC/PCC)</h3>
                    <div className={`p-6 rounded-xl border-2 mb-4 ${instResult.valid ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"}`}>
                      <div className="flex items-center justify-center gap-3">
                        <h4 className={`text-xl font-bold ${instResult.valid ? "text-green-300" : "text-red-300"}`}>
                          {getValidationBadge(instResult)} - Score: {instResult.score}/100
                        </h4>
                      </div>
                      <p className="text-sm text-gray-300 text-center mt-2">{instResult.summary}</p>
                    </div>
                    {instResult.errors.map((e: any, i: number) => <ErrLine key={i} level="error" message={`${e.entity}: ${e.message}${e.fix ? ` (Fix: ${e.fix})` : ""}`} />)}
                    {instResult.warnings.map((w: any, i: number) => <ErrLine key={i} level="warning" message={`${w.entity}: ${w.message}${w.fix ? ` (Fix: ${w.fix})` : ""}`} />)}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== TURTLE ===== */}
        {activeTab === "turtle" && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Test 4: Turtle RDF Serialization</h3>
              <div className="flex gap-2">
                {turtleOutput && <button onClick={() => copyToClipboard(turtleOutput)} className="glass-button px-3 py-1.5 text-xs"><Copy className="h-3.5 w-3.5" /></button>}
                {turtleOutput && <button onClick={() => downloadFile(turtleOutput, "test.ttl", "text/turtle")} className="glass-button px-3 py-1.5 text-xs"><Download className="h-3.5 w-3.5" /></button>}
              </div>
            </div>
            {!turtleOutput ? (
              <div className="text-center py-12 text-gray-400">Click "Run All Tests"</div>
            ) : turtleOutput.startsWith("ERROR") ? (
              <div className="p-6 bg-red-500/20 border-2 border-red-500/50 rounded-xl text-red-300">{turtleOutput}</div>
            ) : (
              <div>
                <div className="p-3 bg-green-500/20 border border-green-500/40 rounded-lg mb-4 text-green-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Turtle serialization successful
                </div>
                <pre className="bg-gray-900 text-cyan-400 p-6 rounded-lg overflow-auto text-sm max-h-[calc(100vh-400px)] font-mono">{turtleOutput}</pre>
              </div>
            )}
          </div>
        )}

        {/* ===== N-TRIPLES ===== */}
        {activeTab === "ntriples" && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Test 5: N-Triples Serialization ({tripleCount} triples)</h3>
              <div className="flex gap-2">
                {ntriplesOutput && <button onClick={() => copyToClipboard(ntriplesOutput)} className="glass-button px-3 py-1.5 text-xs"><Copy className="h-3.5 w-3.5" /></button>}
                {ntriplesOutput && <button onClick={() => downloadFile(ntriplesOutput, "test.nt", "application/n-triples")} className="glass-button px-3 py-1.5 text-xs"><Download className="h-3.5 w-3.5" /></button>}
              </div>
            </div>
            {!ntriplesOutput ? (
              <div className="text-center py-12 text-gray-400">Click "Run All Tests"</div>
            ) : ntriplesOutput.startsWith("ERROR") ? (
              <div className="p-6 bg-red-500/20 border-2 border-red-500/50 rounded-xl text-red-300">{ntriplesOutput}</div>
            ) : (
              <div>
                <div className="p-3 bg-green-500/20 border border-green-500/40 rounded-lg mb-4 text-green-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> {tripleCount} N-Triples generated - ready for triple store ingestion
                </div>
                <pre className="bg-gray-900 text-orange-400 p-6 rounded-lg overflow-auto text-xs max-h-[calc(100vh-400px)] font-mono leading-relaxed">{ntriplesOutput}</pre>
              </div>
            )}
          </div>
        )}

        {/* ===== TRIPLE STORE ===== */}
        {activeTab === "triple-store" && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Test 6: In-Memory Triple Store ({tripleStore.length} triples loaded)</h3>
            <div className="mb-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-400">
              Simulates loading N-Triples into a triple store (like Apache Jena, Blazegraph, or GraphDB).
              Each row below is a subject-predicate-object triple stored in memory.
            </div>
            {tripleStore.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Click "Run All Tests" to load triples</div>
            ) : (
              <div>
                <div className="p-3 bg-green-500/20 border border-green-500/40 rounded-lg mb-4 text-green-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> {tripleStore.length} triples loaded into in-memory store
                </div>
                <div className="overflow-auto max-h-[calc(100vh-450px)]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/20 text-gray-400">
                        <th className="text-left p-2 w-8">#</th>
                        <th className="text-left p-2">Subject</th>
                        <th className="text-left p-2">Predicate</th>
                        <th className="text-left p-2">Object</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tripleStore.slice(0, 200).map((t, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-2 text-gray-500">{i + 1}</td>
                          <td className="p-2 text-cyan-400 font-mono truncate max-w-[250px]">{t.subject}</td>
                          <td className="p-2 text-purple-400 font-mono truncate max-w-[250px]">{t.predicate}</td>
                          <td className="p-2 font-mono truncate max-w-[300px]">
                            {t.object.startsWith("<") || t.object.startsWith("_:")
                              ? <span className="text-cyan-400">{t.object}</span>
                              : <span className="text-green-400">{t.object}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tripleStore.length > 200 && (
                    <div className="text-center text-gray-400 py-3 text-xs">Showing first 200 of {tripleStore.length} triples</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== SPARQL ===== */}
        {activeTab === "sparql" && (
          <div className="space-y-4">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Test 7: SPARQL Query (Simplified)</h3>
              <div className="mb-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-400">
                Query the in-memory triple store using simplified SPARQL. Supports basic SELECT with WHERE patterns and LIMIT.
                For full SPARQL, export the N-Triples file and load into Apache Jena Fuseki.
              </div>
              <div className="flex gap-3 mb-4">
                <textarea value={sparqlQuery} onChange={e => setSparqlQuery(e.target.value)}
                  className="flex-1 bg-gray-900 text-blue-400 p-3 rounded-lg font-mono text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  spellCheck={false} />
                <div className="flex flex-col gap-2">
                  <button onClick={runSparql} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <Play className="h-4 w-4" /> Execute
                  </button>
                  <button onClick={() => setSparqlQuery("SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 50")}
                    className="glass-button px-3 py-1.5 text-xs">Reset</button>
                </div>
              </div>
              {/* Quick queries */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => { setSparqlQuery("SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 50"); }}
                  className="glass-button px-2 py-1 text-xs">All triples</button>
                <button onClick={() => { setSparqlQuery("SELECT ?s ?p ?o WHERE { ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?o } LIMIT 50"); }}
                  className="glass-button px-2 py-1 text-xs">All types</button>
                <button onClick={() => { setSparqlQuery("SELECT ?s ?p ?o WHERE { ?s <http://id.loc.gov/ontologies/bibframe/title> ?o } LIMIT 20"); }}
                  className="glass-button px-2 py-1 text-xs">Titles</button>
                <button onClick={() => { setSparqlQuery("SELECT ?s ?p ?o WHERE { ?s <http://id.loc.gov/ontologies/bibframe/contribution> ?o } LIMIT 20"); }}
                  className="glass-button px-2 py-1 text-xs">Contributions</button>
              </div>
            </div>
            {sparqlResults.length > 0 && (
              <div className="glass-card p-6">
                <h4 className="text-sm font-semibold text-white mb-3">Results ({sparqlResults.length})</h4>
                <div className="overflow-auto max-h-[calc(100vh-550px)]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/20 text-gray-400">
                        <th className="text-left p-2 w-8">#</th>
                        <th className="text-left p-2">?s</th>
                        <th className="text-left p-2">?p</th>
                        <th className="text-left p-2">?o</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sparqlResults.map((r, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-2 text-gray-500">{i + 1}</td>
                          <td className="p-2 text-cyan-400 font-mono truncate max-w-[250px]">{r.subject}</td>
                          <td className="p-2 text-purple-400 font-mono truncate max-w-[250px]">{r.predicate}</td>
                          <td className="p-2 font-mono truncate max-w-[300px] text-green-400">{r.object}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== SUB-COMPONENTS =====

function TestBadge({ label, passed }: { label: string; passed: boolean }) {
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
      passed ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"
    }`}>
      {passed ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
      {label}
    </span>
  );
}

function TTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all text-xs font-medium ${
        active ? "glass-tab-active text-white shadow-lg" : "hover:bg-white/20 text-gray-400"
      }`}>
      {icon} {label}
    </button>
  );
}

function ErrLine({ level, message }: { level: "error" | "warning" | "info"; message: string }) {
  const config = {
    error: { bg: "bg-red-500/10", icon: <AlertCircle className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />, text: "text-red-300" },
    warning: { bg: "bg-yellow-500/10", icon: <AlertTriangle className="h-3 w-3 text-yellow-400 mt-0.5 shrink-0" />, text: "text-yellow-300" },
    info: { bg: "bg-blue-500/10", icon: <Info className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />, text: "text-blue-300" },
  }[level];
  return (
    <div className={`flex items-start gap-2 p-2 ${config.bg} rounded mb-1 text-xs`}>
      {config.icon}
      <span className={config.text}>{message}</span>
    </div>
  );
}
