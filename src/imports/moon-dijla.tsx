cobine all these codes into one and call it moon dijla (/**
 * 🏖️ MOON SAND V2 - Ontology-Driven BIBFRAME Semantic Engine
 * TRUE GRAPH EDITOR | REGISTRY-POWERED | NO TEMPLATES
 * Complete architectural transformation
 */

"use client";
import React, { useState, useEffect } from "react";
import { 
  Layers, Download, Eye, Code, FileJson, Network, Database, Sparkles, 
  ChevronDown, CheckCircle2, AlertCircle, BarChart3, BookOpen
} from "lucide-react";
import { GraphStore } from "../../services/graphStore";
import { generateUri } from "../../services/rdfGraphBuilder";
import { OntologyDrivenFormRenderer } from "./cataloging/OntologyDrivenFormRenderer";
import { ValidationPanel, validateGraph, ValidationResult } from "./cataloging/ValidationPanel";
import { RelationshipGraph, Relationship, generateRelationshipId, RELATIONSHIP_DEFINITIONS } from "../../services/relationshipManager";
import { toTurtle, toJsonLd } from "../../services/rdfGraphBuilder";
import * as recordAPI from "../../services/recordPersistence";
import { Save, Clock } from "lucide-react";
import { RecordViewerDialog } from "./cataloging/RecordViewerDialog";

type ViewMode = 'catalog' | 'relationships' | 'validation' | 'graph' | 'jsonld' | 'turtle';
type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';

export default function MoonSandV2() {
  /* ============================= GRAPH-CENTRIC STATE ============================= */

  const [graphStore] = useState(new GraphStore());
  const [enableExpression, setEnableExpression] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('catalog');
  
  // Entity URIs (generated once)
  const [workUri] = useState(generateUri('work'));
  const [expressionUri] = useState(generateUri('expression'));
  const [instanceUri] = useState(generateUri('instance'));
  const [itemUri] = useState(generateUri('item'));

  // Relationships
  const [relationshipGraph] = useState(new RelationshipGraph());
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  // RDF Output
  const [jsonld, setJsonld] = useState<any>(null);
  const [turtle, setTurtle] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // Persistence State
  const [recordId, setRecordId] = useState<string | null>(null);
  const [recordTitle, setRecordTitle] = useState('Untitled Record');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('unsaved');

  // Viewer Dialog State
  const [showRecordViewer, setShowRecordViewer] = useState(false);

  /* ============================= INITIALIZATION ============================= */

  useEffect(() => {
    // Initialize graph with entities
    graphStore.setNode(workUri, {
      '@id': workUri,
      '@type': 'bf:Work'
    });

    graphStore.setNode(instanceUri, {
      '@id': instanceUri,
      '@type': 'bf:Instance'
    });

    graphStore.setNode(itemUri, {
      '@id': itemUri,
      '@type': 'bf:Item'
    });

    if (enableExpression) {
      graphStore.setNode(expressionUri, {
        '@id': expressionUri,
        '@type': 'bf:Expression'
      });
    }

    // Create automatic WEMI links
    graphStore.createWEMILinks(
      workUri,
      enableExpression ? expressionUri : undefined,
      instanceUri,
      itemUri
    );

    // Initial generation
    generateRDF();
  }, []);

  /* ============================= UPDATE HANDLERS ============================= */

  const handlePropertyChange = (nodeUri: string, property: string, value: any) => {
    graphStore.setProperty(nodeUri, property, value);
    setSaveStatus('unsaved');
    
    // Debounced RDF generation
    setTimeout(() => generateRDF(), 500);
  };

  const toggleExpression = () => {
    const newValue = !enableExpression;
    setEnableExpression(newValue);
    setSaveStatus('unsaved');

    if (newValue) {
      // Add Expression node
      graphStore.setNode(expressionUri, {
        '@id': expressionUri,
        '@type': 'bf:Expression'
      });
    } else {
      // Remove Expression links (keep the data for now)
      const work = graphStore.getNode(workUri);
      if (work) {
        delete work['bf:hasExpression'];
      }
      const instance = graphStore.getNode(instanceUri);
      if (instance) {
        instance['bf:instanceOf'] = { '@id': workUri };
      }
    }

    // Recreate WEMI links
    graphStore.createWEMILinks(
      workUri,
      newValue ? expressionUri : undefined,
      instanceUri,
      itemUri
    );

    generateRDF();
  };

  /* ============================= RDF GENERATION ============================= */

  const generateRDF = () => {
    try {
      // Add relationships to graph
      const graphData = graphStore.toJsonLd();
      
      // Add relationships
      relationshipGraph.addToJsonLdGraph(graphData['@graph'] || [], relationships);

      // Validate
      const validationResult = validateGraph(graphStore, enableExpression);
      setValidation(validationResult);

      // Set JSON-LD
      setJsonld(graphData);

      // Generate Turtle if valid
      if (validationResult.valid) {
        const turtleOutput = toTurtle(graphData);
        setTurtle(turtleOutput);
      } else {
        setTurtle('');
      }
    } catch (error) {
      console.error('RDF generation error:', error);
    }
  };

  /* ============================= RELATIONSHIPS ============================= */

  const addRelationship = () => {
    const newRel: Relationship = {
      id: generateRelationshipId(),
      type: 'relatedTo',
      sourceUri: workUri,
      targetUri: '',
      label: ''
    };
    setRelationships([...relationships, newRel]);
  };

  const updateRelationship = (id: string, field: string, value: any) => {
    setRelationships(prev =>
      prev.map(rel => (rel.id === id ? { ...rel, [field]: value } : rel))
    );
    setSaveStatus('unsaved');
    setTimeout(() => generateRDF(), 500);
  };

  const removeRelationship = (id: string) => {
    setRelationships(prev => prev.filter(rel => rel.id !== id));
    setSaveStatus('unsaved');
    setTimeout(() => generateRDF(), 500);
  };

  /* ============================= PERSISTENCE ============================= */

  const handleSave = async () => {
    try {
      setSaveStatus('saving');

      if (!jsonld) {
        throw new Error('No graph to save');
      }

      if (recordId) {
        // Update existing
        await recordAPI.updateRecord(recordId, jsonld, recordTitle);
      } else {
        // Create new
        const created = await recordAPI.createRecord(jsonld, recordTitle, 'Work');
        setRecordId(created.id);
      }

      setSaveStatus('saved');
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      alert('Failed to save record');
    }
  };

  /* ============================= DOWNLOAD ============================= */

  const downloadRdf = (format: 'turtle' | 'jsonld') => {
    if (!jsonld) return;

    const content = format === 'turtle' ? turtle : JSON.stringify(jsonld, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibframe-graph.${format === 'turtle' ? 'ttl' : 'jsonld'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ============================= RENDER HELPERS ============================= */

  const getSaveStatusBadge = () => {
    const badges = {
      saved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle2 className="h-4 w-4" />, label: 'Saved' },
      unsaved: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="h-4 w-4" />, label: 'Unsaved' },
      saving: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Save className="h-4 w-4 animate-spin" />, label: 'Saving...' },
      error: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle className="h-4 w-4" />, label: 'Error' }
    };

    const badge = badges[saveStatus];
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${badge.bg} ${badge.text} font-semibold text-sm`}>
        {badge.icon}
        {badge.label}
      </div>
    );
  };

  /* ============================= RENDER ============================= */

  const stats = graphStore.getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Layers className="h-8 w-8 text-orange-600" />
                <input
                  type="text"
                  value={recordTitle}
                  onChange={(e) => {
                    setRecordTitle(e.target.value);
                    setSaveStatus('unsaved');
                  }}
                  className="text-3xl font-bold text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent"
                  placeholder="Record Title"
                />
              </div>
              <p className="text-gray-600">
                🧠 Registry-Powered • 🔗 Graph-Based • ✅ SHACL-Validatable
              </p>
            </div>
            <div className="flex gap-3">
              {getSaveStatusBadge()}
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              {validation?.valid && (
                <>
                  <button
                    onClick={() => setShowRecordViewer(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    OPAC/MARC View
                  </button>
                  <button
                    onClick={() => downloadRdf('jsonld')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    JSON-LD
                  </button>
                  <button
                    onClick={() => downloadRdf('turtle')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Turtle
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Graph Stats */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Database className="h-4 w-4" />
              <span className="font-semibold">{stats.nodeCount} Nodes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Network className="h-4 w-4" />
              <span className="font-semibold">{stats.tripleCount} Triples</span>
            </div>
            {Object.entries(stats.types).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart3 className="h-4 w-4" />
                <span>{type.replace('bf:', '')}: {count}</span>
              </div>
            ))}
          </div>

          {/* Expression Toggle */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={enableExpression}
              onChange={toggleExpression}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-semibold text-gray-700">
              Enable Expression Layer (FRBR Work→Expression→Instance→Item)
            </span>
          </label>

          {/* Validation Compact */}
          {validation && (
            <div className="mt-4">
              <ValidationPanel validation={validation} compact />
            </div>
          )}
        </div>

        {/* View Tabs */}
        <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
          <div className="flex gap-2">
            <ViewTab icon={<Database />} label="Catalog" active={viewMode === 'catalog'} onClick={() => setViewMode('catalog')} />
            <ViewTab icon={<Network />} label="Relationships" active={viewMode === 'relationships'} onClick={() => setViewMode('relationships')} />
            <ViewTab icon={<CheckCircle2 />} label="Validation" active={viewMode === 'validation'} onClick={() => setViewMode('validation')} />
            <ViewTab icon={<Eye />} label="Graph Stats" active={viewMode === 'graph'} onClick={() => setViewMode('graph')} />
            <ViewTab icon={<FileJson />} label="JSON-LD" active={viewMode === 'jsonld'} onClick={() => setViewMode('jsonld')} />
            <ViewTab icon={<Code />} label="Turtle" active={viewMode === 'turtle'} onClick={() => setViewMode('turtle')} />
          </div>
        </div>

        {/* Content */}
        {viewMode === 'catalog' && (
          <div className="space-y-6">
            {/* Work */}
            <EntitySection title="Work" icon={<Database className="h-6 w-6 text-blue-600" />} uri={workUri}>
              <OntologyDrivenFormRenderer
                entityType="Work"
                nodeUri={workUri}
                graphStore={graphStore}
                onChange={handlePropertyChange}
              />
            </EntitySection>

            {/* Expression */}
            {enableExpression && (
              <EntitySection title="Expression" icon={<Sparkles className="h-6 w-6 text-purple-600" />} uri={expressionUri}>
                <OntologyDrivenFormRenderer
                  entityType="Expression"
                  nodeUri={expressionUri}
                  graphStore={graphStore}
                  onChange={handlePropertyChange}
                />
              </EntitySection>
            )}

            {/* Instance */}
            <EntitySection title="Instance" icon={<Database className="h-6 w-6 text-green-600" />} uri={instanceUri}>
              <OntologyDrivenFormRenderer
                entityType="Instance"
                nodeUri={instanceUri}
                graphStore={graphStore}
                onChange={handlePropertyChange}
              />
            </EntitySection>

            {/* Item */}
            <EntitySection title="Item" icon={<Database className="h-6 w-6 text-orange-600" />} uri={itemUri}>
              <OntologyDrivenFormRenderer
                entityType="Item"
                nodeUri={itemUri}
                graphStore={graphStore}
                onChange={handlePropertyChange}
              />
            </EntitySection>
          </div>
        )}

        {viewMode === 'relationships' && (
          <RelationshipsView
            relationships={relationships}
            onAdd={addRelationship}
            onUpdate={updateRelationship}
            onRemove={removeRelationship}
          />
        )}

        {viewMode === 'validation' && validation && (
          <ValidationPanel validation={validation} />
        )}

        {viewMode === 'graph' && (
          <GraphStatsView graphStore={graphStore} />
        )}

        {viewMode === 'jsonld' && (
          <CodeView title="JSON-LD" content={jsonld ? JSON.stringify(jsonld, null, 2) : 'Building graph...'} />
        )}

        {viewMode === 'turtle' && (
          <CodeView title="Turtle RDF" content={turtle || 'Fix validation errors to see Turtle output...'} />
        )}
      </div>

      {/* Record Viewer Dialog */}
      <RecordViewerDialog
        open={showRecordViewer}
        onOpenChange={setShowRecordViewer}
        jsonldData={jsonld || { '@graph': [] }}
        title={recordTitle}
      />
    </div>
  );
}

/* ============================= COMPONENTS ============================= */

function ViewTab({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
        active ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function EntitySection({ title, icon, uri, children }: any) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white border-2 border-orange-200 rounded-xl overflow-hidden shadow-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 flex items-center justify-between transition-all"
        type="button"
      >
        <div className="flex items-center gap-3">
          {icon}
          <div className="text-left">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500 font-mono">{uri}</p>
          </div>
        </div>
        {expanded ? <ChevronDown className="h-6 w-6" /> : <ChevronDown className="h-6 w-6 rotate-180" />}
      </button>
      {expanded && <div className="p-6">{children}</div>}
    </div>
  );
}

function RelationshipsView({ relationships, onAdd, onUpdate, onRemove }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Semantic Relationships</h2>
        <button onClick={onAdd} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
          + Add Relationship
        </button>
      </div>

      {relationships.length === 0 && (
        <div className="text-center text-gray-500 py-8">No relationships defined</div>
      )}

      <div className="space-y-4">
        {relationships.map((rel: Relationship) => (
          <div key={rel.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-3">
                <select
                  value={rel.type}
                  onChange={(e) => onUpdate(rel.id, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {Object.entries(RELATIONSHIP_DEFINITIONS).map(([type, def]) => (
                    <option key={type} value={type}>{def.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={rel.targetUri}
                  onChange={(e) => onUpdate(rel.id, 'targetUri', e.target.value)}
                  placeholder="Target URI"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={() => onRemove(rel.id)}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GraphStatsView({ graphStore }: { graphStore: GraphStore }) {
  const stats = graphStore.getStats();
  const validation = graphStore.validate();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Graph Statistics</h2>
      
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-4xl font-bold text-blue-600 mb-2">{stats.nodeCount}</div>
          <div className="text-sm font-semibold text-blue-900">Total Nodes</div>
        </div>
        <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="text-4xl font-bold text-purple-600 mb-2">{stats.tripleCount}</div>
          <div className="text-sm font-semibold text-purple-900">Total Triples</div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-4">Node Types</h3>
      <div className="space-y-2">
        {Object.entries(stats.types).map(([type, count]) => (
          <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm">{type}</span>
            <span className="font-bold text-gray-900">{count}</span>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Graph Validation</h3>
      <div className={`p-4 rounded-lg ${validation.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center gap-2">
          {validation.valid ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900">Valid Graph Structure</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-900">{validation.errors.length} Error(s)</span>
            </>
          )}
        </div>
        {validation.errors.length > 0 && (
          <ul className="mt-3 space-y-1">
            {validation.errors.map((err, idx) => (
              <li key={idx} className="text-sm text-red-700">• {err}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CodeView({ title, content }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <pre className="w-full h-[600px] px-4 py-3 bg-gray-900 text-green-400 font-mono text-sm rounded-lg overflow-auto">
        {content}
      </pre>
    </div>
  );
}
) (/**
 * 🌙 MOON OSHIN PROFESSIONAL
 * National-Library-Grade Linked Data Cataloging Interface
 * Comparable to LOC Marva and Libris XL
 */

"use client";
import React, { useState, useEffect } from "react";
import { Download, Sparkles, Eye, Code, FileJson, BookOpen, AlertCircle, CheckCircle2, Loader2, Search } from "lucide-react";
import { CatalogingWizard, WizardStep } from "./cataloging/CatalogingWizard";
import { AuthoritySelect, AuthorityMultiSelect } from "./cataloging/AuthoritySelect";
import { validateBibframeRecord, ValidationResult } from "../../services/bibframeValidator";
import { toTurtle, toJsonLd, generateUri } from "../../services/rdfGraphBuilder";
import {
  AuthorityResult,
  searchAllAuthorities,
  searchLanguages,
  searchCarriers,
  searchMediaTypes,
  searchCountries,
  searchRelators,
  COMMON_RELATORS,
  lookupISBN,
  ISBNData
} from "../../services/authoritySearch";

type ViewTab = "catalog" | "preview" | "jsonld" | "turtle";

interface Contribution {
  agent: AuthorityResult | null;
  role: string;
}

interface Identifier {
  type: "Isbn" | "Issn" | "Lccn" | "Local";
  value: string;
}

export default function MoonOshinPro() {
  /* ============================= STATE ============================= */

  const [viewTab, setViewTab] = useState<ViewTab>("catalog");
  const [currentStep, setCurrentStep] = useState<WizardStep>("work");
  const [advancedMode, setAdvancedMode] = useState(false);

  // URIs
  const [workUri] = useState(generateUri("work"));
  const [instanceUri] = useState(generateUri("instance"));
  const [itemUri] = useState(generateUri("item"));

  // Work
  const [workTitle, setWorkTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [language, setLanguage] = useState<AuthorityResult | null>({
    label: "English",
    uri: "http://id.loc.gov/vocabulary/languages/eng",
    source: "LOC"
  });
  const [genre, setGenre] = useState<AuthorityResult | null>(null);
  const [subjects, setSubjects] = useState<AuthorityResult[]>([]);
  const [contributors, setContributors] = useState<Contribution[]>([
    { agent: null, role: "aut" }
  ]);

  // Instance
  const [identifiers, setIdentifiers] = useState<Identifier[]>([
    { type: "Isbn", value: "" }
  ]);
  const [extent, setExtent] = useState("");
  const [carrier, setCarrier] = useState<AuthorityResult | null>({
    label: "volume (print)",
    uri: "http://id.loc.gov/vocabulary/carriers/nc",
    source: "LOC"
  });
  const [media, setMedia] = useState<AuthorityResult | null>({
    label: "unmediated",
    uri: "http://id.loc.gov/vocabulary/mediaTypes/n",
    source: "LOC"
  });

  // Publication
  const [publicationPlace, setPublicationPlace] = useState<AuthorityResult | null>({
    label: "United States",
    uri: "http://id.loc.gov/vocabulary/countries/xxu",
    source: "LOC"
  });
  const [publisher, setPublisher] = useState<AuthorityResult | null>(null);
  const [publicationDate, setPublicationDate] = useState(new Date().getFullYear().toString());

  // Item
  const [heldBy, setHeldBy] = useState("https://moonlib.org/library/main");
  const [shelfMark, setShelfMark] = useState("");
  const [barcode, setBarcode] = useState("");

  // Output
  const [jsonld, setJsonld] = useState<any>(null);
  const [turtle, setTurtle] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // ISBN Lookup
  const [isbnLookupLoading, setIsbnLookupLoading] = useState(false);

  /* ============================= VALIDATION ============================= */

  const validateStep = (step: WizardStep): boolean => {
    switch (step) {
      case "work":
        return !!(
          workTitle.trim() &&
          contributors.length > 0 &&
          contributors.every(c => c.agent !== null && c.role)
        );
      case "instance":
        return !!(carrier && media);
      case "publication":
        return !!(publicationPlace && publisher && publicationDate);
      case "item":
        return true; // Item is optional
      default:
        return false;
    }
  };

  const stepValidation = {
    work: validateStep("work"),
    instance: validateStep("instance"),
    publication: validateStep("publication"),
    item: validateStep("item")
  };

  /* ============================= GRAPH BUILDER ============================= */

  const buildGraph = (): any => {
    const graph: any[] = [];

    // WORK
    const work: any = {
      "@id": workUri,
      "@type": "bf:Work",
      "bf:title": {
        "@type": "bf:Title",
        "bf:mainTitle": [{ "@value": workTitle }]
      }
    };

    if (subtitle) {
      work["bf:title"]["bf:subtitle"] = [{ "@value": subtitle }];
    }

    if (language) {
      work["bf:language"] = { "@id": language.uri };
    }

    if (genre) {
      work["bf:genreForm"] = { "@id": genre.uri };
    }

    if (subjects.length > 0) {
      work["bf:subject"] = subjects.map(s => ({ "@id": s.uri }));
    }

    work["bf:contribution"] = contributors
      .filter(c => c.agent)
      .map(c => ({
        "@type": "bf:Contribution",
        "bf:agent": { "@id": c.agent!.uri },
        "bf:role": { "@id": `http://id.loc.gov/vocabulary/relators/${c.role}` }
      }));

    work["bf:hasInstance"] = { "@id": instanceUri };
    graph.push(work);

    // Add agent nodes
    contributors.forEach(c => {
      if (c.agent && c.agent.source === "Local") {
        graph.push({
          "@id": c.agent.uri,
          "@type": "bf:Person",
          "rdfs:label": c.agent.label
        });
      }
    });

    // INSTANCE
    const instance: any = {
      "@id": instanceUri,
      "@type": "bf:Instance",
      "bf:instanceOf": { "@id": workUri },
      "bf:title": {
        "@type": "bf:Title",
        "bf:mainTitle": [{ "@value": workTitle }]
      }
    };

    if (subtitle) {
      instance["bf:title"]["bf:subtitle"] = [{ "@value": subtitle }];
    }

    instance["bf:identifiedBy"] = identifiers
      .filter(id => id.value.trim())
      .map(id => ({
        "@type": `bf:${id.type}`,
        "rdf:value": id.value
      }));

    if (extent) {
      instance["bf:extent"] = {
        "@type": "bf:Extent",
        "rdfs:label": extent
      };
    }

    if (carrier) {
      instance["bf:carrier"] = { "@id": carrier.uri };
    }

    if (media) {
      instance["bf:media"] = { "@id": media.uri };
    }

    const pubAgent = publisher ? publisher.uri : generateUri("organization");
    instance["bf:provisionActivity"] = {
      "@type": "bf:Publication",
      "bf:place": { "@id": publicationPlace!.uri },
      "bf:agent": { "@id": pubAgent },
      "bf:date": {
        "@value": publicationDate,
        "@type": "xsd:gYear"
      }
    };

    // Add publisher node if local
    if (publisher && publisher.source === "Local") {
      graph.push({
        "@id": publisher.uri,
        "@type": "bf:Organization",
        "rdfs:label": publisher.label
      });
    }

    instance["bf:hasItem"] = { "@id": itemUri };
    graph.push(instance);

    // ITEM
    const item: any = {
      "@id": itemUri,
      "@type": "bf:Item",
      "bf:itemOf": { "@id": instanceUri }
    };

    if (heldBy) {
      item["bf:heldBy"] = { "@id": heldBy };
    }

    if (shelfMark) {
      item["bf:shelfMark"] = shelfMark;
    }

    if (barcode) {
      item["bf:identifiedBy"] = {
        "@type": "bf:Barcode",
        "rdf:value": barcode
      };
    }

    graph.push(item);

    return toJsonLd(graph);
  };

  const generateRDF = () => {
    try {
      const graph = buildGraph();
      const validationResult = validateBibframeRecord(graph);
      
      setValidation(validationResult);
      setJsonld(graph);

      if (validationResult.valid) {
        const turtleOutput = toTurtle(graph);
        setTurtle(turtleOutput);
      } else {
        setTurtle("");
      }
    } catch (error) {
      console.error("RDF generation error:", error);
    }
  };

  // Auto-generate on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (workTitle) {
        generateRDF();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [workTitle, subtitle, language, genre, subjects, contributors, identifiers, extent, carrier, media, publicationPlace, publisher, publicationDate, heldBy, shelfMark, barcode]);

  /* ============================= ISBN LOOKUP ============================= */

  const handleISBNLookup = async () => {
    const isbn = identifiers.find(id => id.type === "Isbn" && id.value.trim());
    if (!isbn) return;

    setIsbnLookupLoading(true);
    try {
      const data = await lookupISBN(isbn.value);
      if (data) {
        if (data.title) setWorkTitle(data.title);
        if (data.subtitle) setSubtitle(data.subtitle);
        if (data.authors && data.authors.length > 0) {
          const newContribs: Contribution[] = data.authors.map(author => ({
            agent: {
              label: author,
              uri: generateUri("agent"),
              source: "Local" as const
            },
            role: "aut"
          }));
          setContributors(newContribs);
        }
        if (data.publishers && data.publishers.length > 0) {
          setPublisher({
            label: data.publishers[0],
            uri: generateUri("organization"),
            source: "Local"
          });
        }
        if (data.publishDate) {
          const year = data.publishDate.match(/\d{4}/)?.[0];
          if (year) setPublicationDate(year);
        }
        if (data.numberOfPages) {
          setExtent(`${data.numberOfPages} pages`);
        }
      }
    } catch (error) {
      console.error("ISBN lookup error:", error);
    } finally {
      setIsbnLookupLoading(false);
    }
  };

  /* ============================= DOWNLOAD ============================= */

  const downloadRdf = (format: "turtle" | "jsonld") => {
    if (!jsonld) return;

    const content = format === "turtle" ? turtle : JSON.stringify(jsonld, null, 2);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bibframe-record.${format === "turtle" ? "ttl" : "jsonld"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ============================= RENDER ============================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-blue-600" />
                MOON Cataloging System
              </h1>
              <p className="text-gray-600">BIBFRAME 2.0 Linked Data Editor</p>
            </div>
            <div className="flex gap-3">
              {validation?.valid && (
                <>
                  <button
                    onClick={() => downloadRdf("turtle")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Turtle
                  </button>
                  <button
                    onClick={() => downloadRdf("jsonld")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    JSON-LD
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Validation Summary */}
          {validation && (
            <div className={`mt-4 p-4 rounded-lg ${validation.valid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center gap-2">
                {validation.valid ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">Valid BIBFRAME Record</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-900">
                      {validation.errors.length} validation issue(s)
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* View Tabs */}
        <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
          <div className="flex gap-2">
            <ViewTabButton
              icon={<BookOpen className="h-4 w-4" />}
              label="Cataloging"
              active={viewTab === "catalog"}
              onClick={() => setViewTab("catalog")}
            />
            <ViewTabButton
              icon={<Eye className="h-4 w-4" />}
              label="Preview"
              active={viewTab === "preview"}
              onClick={() => setViewTab("preview")}
            />
            <ViewTabButton
              icon={<FileJson className="h-4 w-4" />}
              label="JSON-LD"
              active={viewTab === "jsonld"}
              onClick={() => setViewTab("jsonld")}
            />
            <ViewTabButton
              icon={<Code className="h-4 w-4" />}
              label="Turtle"
              active={viewTab === "turtle"}
              onClick={() => setViewTab("turtle")}
            />
          </div>
        </div>

        {/* Content */}
        {viewTab === "catalog" && (
          <CatalogingWizard
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            validation={stepValidation}
          >
            {currentStep === "work" && (
              <WorkStep
                workTitle={workTitle}
                setWorkTitle={setWorkTitle}
                subtitle={subtitle}
                setSubtitle={setSubtitle}
                language={language}
                setLanguage={setLanguage}
                genre={genre}
                setGenre={setGenre}
                subjects={subjects}
                setSubjects={setSubjects}
                contributors={contributors}
                setContributors={setContributors}
              />
            )}

            {currentStep === "instance" && (
              <InstanceStep
                identifiers={identifiers}
                setIdentifiers={setIdentifiers}
                extent={extent}
                setExtent={setExtent}
                carrier={carrier}
                setCarrier={setCarrier}
                media={media}
                setMedia={setMedia}
                onISBNLookup={handleISBNLookup}
                isbnLookupLoading={isbnLookupLoading}
              />
            )}

            {currentStep === "publication" && (
              <PublicationStep
                publicationPlace={publicationPlace}
                setPublicationPlace={setPublicationPlace}
                publisher={publisher}
                setPublisher={setPublisher}
                publicationDate={publicationDate}
                setPublicationDate={setPublicationDate}
              />
            )}

            {currentStep === "item" && (
              <ItemStep
                heldBy={heldBy}
                setHeldBy={setHeldBy}
                shelfMark={shelfMark}
                setShelfMark={setShelfMark}
                barcode={barcode}
                setBarcode={setBarcode}
              />
            )}
          </CatalogingWizard>
        )}

        {viewTab === "preview" && (
          <PreviewView
            workTitle={workTitle}
            subtitle={subtitle}
            contributors={contributors}
            publisher={publisher}
            publicationDate={publicationDate}
            publicationPlace={publicationPlace}
            subjects={subjects}
            identifiers={identifiers}
            shelfMark={shelfMark}
          />
        )}

        {viewTab === "jsonld" && (
          <CodeView title="JSON-LD" content={jsonld ? JSON.stringify(jsonld, null, 2) : "Configure the record to generate JSON-LD..."} />
        )}

        {viewTab === "turtle" && (
          <CodeView title="Turtle RDF" content={turtle || "Configure the record to generate Turtle RDF..."} />
        )}
      </div>
    </div>
  );
}

/* ============================= STEP COMPONENTS ============================= */

function WorkStep({
  workTitle, setWorkTitle, subtitle, setSubtitle,
  language, setLanguage, genre, setGenre,
  subjects, setSubjects, contributors, setContributors
}: any) {
  const addContributor = () => {
    setContributors([...contributors, { agent: null, role: "aut" }]);
  };

  const updateContributor = (index: number, field: string, value: any) => {
    const updated = [...contributors];
    updated[index][field] = value;
    setContributors(updated);
  };

  const removeContributor = (index: number) => {
    setContributors(contributors.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Work: Intellectual Content</h2>
        <p className="text-gray-600">Describe the conceptual essence of this resource</p>
      </div>

      {/* Title */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Main Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={workTitle}
            onChange={(e) => setWorkTitle(e.target.value)}
            placeholder="Enter the main title"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Enter subtitle if applicable"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Language */}
      <AuthoritySelect
        label="Language"
        value={language}
        onChange={setLanguage}
        onSearch={searchLanguages}
        placeholder="Search languages..."
        required
      />

      {/* Genre */}
      <AuthoritySelect
        label="Genre/Form"
        value={genre}
        onChange={setGenre}
        onSearch={(q) => searchAllAuthorities(q, 'genre')}
        placeholder="Search genre forms..."
      />

      {/* Subjects */}
      <AuthorityMultiSelect
        label="Subjects"
        values={subjects}
        onChange={setSubjects}
        onSearch={(q) => searchAllAuthorities(q, 'subject')}
        placeholder="Search and add subjects..."
      />

      {/* Contributors */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">
            Contributors <span className="text-red-500">*</span>
          </label>
          <button
            onClick={addContributor}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all"
            type="button"
          >
            + Add Contributor
          </button>
        </div>

        {contributors.map((contrib: any, index: number) => (
          <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Contributor {index + 1}</span>
              {contributors.length > 1 && (
                <button
                  onClick={() => removeContributor(index)}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  type="button"
                >
                  Remove
                </button>
              )}
            </div>

            <AuthoritySelect
              label="Agent"
              value={contrib.agent}
              onChange={(value) => updateContributor(index, "agent", value)}
              onSearch={(q) => searchAllAuthorities(q, 'person')}
              placeholder="Search for person or organization..."
              required
              allowCustom
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={contrib.role}
                onChange={(e) => updateContributor(index, "role", e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COMMON_RELATORS.map(r => (
                  <option key={r.code} value={r.code}>{r.label} ({r.code})</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InstanceStep({
  identifiers, setIdentifiers, extent, setExtent,
  carrier, setCarrier, media, setMedia,
  onISBNLookup, isbnLookupLoading
}: any) {
  const addIdentifier = () => {
    setIdentifiers([...identifiers, { type: "Isbn", value: "" }]);
  };

  const updateIdentifier = (index: number, field: string, value: any) => {
    const updated = [...identifiers];
    updated[index][field] = value;
    setIdentifiers(updated);
  };

  const removeIdentifier = (index: number) => {
    setIdentifiers(identifiers.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Instance: Physical Manifestation</h2>
        <p className="text-gray-600">Describe how this work is embodied</p>
      </div>

      {/* Identifiers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">Identifiers</label>
          <button
            onClick={addIdentifier}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
            type="button"
          >
            + Add Identifier
          </button>
        </div>

        {identifiers.map((id: Identifier, index: number) => (
          <div key={index} className="flex gap-3">
            <select
              value={id.type}
              onChange={(e) => updateIdentifier(index, "type", e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Isbn">ISBN</option>
              <option value="Issn">ISSN</option>
              <option value="Lccn">LCCN</option>
              <option value="Local">Local</option>
            </select>
            <input
              type="text"
              value={id.value}
              onChange={(e) => updateIdentifier(index, "value", e.target.value)}
              placeholder="Enter identifier"
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => removeIdentifier(index)}
              className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-all"
              type="button"
            >
              Remove
            </button>
          </div>
        ))}

        {/* ISBN Lookup Button */}
        {identifiers.some((id: Identifier) => id.type === "Isbn" && id.value.trim()) && (
          <button
            onClick={onISBNLookup}
            disabled={isbnLookupLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            type="button"
          >
            {isbnLookupLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading from Open Library...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Auto-fill from ISBN
              </>
            )}
          </button>
        )}
      </div>

      {/* Extent */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Extent</label>
        <input
          type="text"
          value={extent}
          onChange={(e) => setExtent(e.target.value)}
          placeholder="e.g., xviii, 256 pages"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Carrier */}
      <AuthoritySelect
        label="Carrier"
        value={carrier}
        onChange={setCarrier}
        onSearch={searchCarriers}
        placeholder="Select carrier type..."
        required
      />

      {/* Media */}
      <AuthoritySelect
        label="Media Type"
        value={media}
        onChange={setMedia}
        onSearch={searchMediaTypes}
        placeholder="Select media type..."
        required
      />
    </div>
  );
}

function PublicationStep({
  publicationPlace, setPublicationPlace,
  publisher, setPublisher,
  publicationDate, setPublicationDate
}: any) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Publication Information</h2>
        <p className="text-gray-600">Describe how and where this instance was published</p>
      </div>

      {/* Place */}
      <AuthoritySelect
        label="Place of Publication"
        value={publicationPlace}
        onChange={setPublicationPlace}
        onSearch={searchCountries}
        placeholder="Search countries..."
        required
      />

      {/* Publisher */}
      <AuthoritySelect
        label="Publisher"
        value={publisher}
        onChange={setPublisher}
        onSearch={(q) => searchAllAuthorities(q, 'organization')}
        placeholder="Search publishers..."
        required
        allowCustom
      />

      {/* Date */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Publication Year <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={publicationDate}
          onChange={(e) => setPublicationDate(e.target.value)}
          placeholder="YYYY"
          pattern="\d{4}"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

function ItemStep({ heldBy, setHeldBy, shelfMark, setShelfMark, barcode, setBarcode }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Item: Holdings (Optional)</h2>
        <p className="text-gray-600">Describe physical holdings and location</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Held By (Institution URI)</label>
        <input
          type="text"
          value={heldBy}
          onChange={(e) => setHeldBy(e.target.value)}
          placeholder="https://moonlib.org/library/main"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Shelf Mark / Call Number</label>
        <input
          type="text"
          value={shelfMark}
          onChange={(e) => setShelfMark(e.target.value)}
          placeholder="QA76.9.D3 S46 2026"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Barcode</label>
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="31234567890123"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

/* ============================= VIEW COMPONENTS ============================= */

function ViewTabButton({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function PreviewView({ workTitle, subtitle, contributors, publisher, publicationDate, publicationPlace, subjects, identifiers, shelfMark }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Preview</h2>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <h3 className="text-3xl font-bold text-gray-900">{workTitle || "Untitled"}</h3>
          {subtitle && <p className="text-xl text-gray-600 mt-2">{subtitle}</p>}
        </div>

        {/* Contributors */}
        {contributors.filter((c: any) => c.agent).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Contributors</h4>
            <div className="space-y-1">
              {contributors.filter((c: any) => c.agent).map((c: any, i: number) => (
                <div key={i} className="text-lg text-gray-800">
                  {c.agent.label} ({COMMON_RELATORS.find(r => r.code === c.role)?.label || c.role})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publication */}
        {(publisher || publicationDate || publicationPlace) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Publication</h4>
            <p className="text-gray-800">
              {publisher?.label && <span className="font-semibold">{publisher.label}</span>}
              {publicationPlace && publisher?.label && <span>, </span>}
              {publicationPlace && <span>{publicationPlace.label}</span>}
              {publicationDate && <span> ({publicationDate})</span>}
            </p>
          </div>
        )}

        {/* Identifiers */}
        {identifiers.filter((id: Identifier) => id.value).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Identifiers</h4>
            <div className="space-y-1">
              {identifiers.filter((id: Identifier) => id.value).map((id: Identifier, i: number) => (
                <div key={i} className="text-gray-800">
                  <span className="font-semibold">{id.type}:</span> {id.value}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subjects */}
        {subjects.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Subjects</h4>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject: AuthorityResult, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {subject.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Holdings */}
        {shelfMark && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Holdings</h4>
            <p className="text-gray-800">
              <span className="font-semibold">Call Number:</span> {shelfMark}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CodeView({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <pre className="w-full h-[600px] px-4 py-3 bg-gray-900 text-green-400 font-mono text-sm rounded-lg overflow-auto">
        {content}
      </pre>
    </div>
  );
}
) (/**
 * Moon Engine Glass - iOS Visual Blur Edition
 *
 * Features:
 * - Multi-authority search contributing to bf:contribution
 * - Glassmorphism/iOS blur design
 * - Real LOC examples with actual URIs
 * - Preview and Mind Map in separate tabs
 * - LOC-NAMES and LOD integration
 */

import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Save,
  Download,
  Upload,
  ChevronLeft,
  Search,
  User,
  Building,
  MapPin,
  Tag,
  Globe,
  BookOpen,
  Package,
  Eye,
  Network,
  Database,
  FileText,
  Code,
  Braces,
  Sparkles,
  Book,
} from "lucide-react";
import { OntologyField } from "./ontology/OntologyField";
import { getPropertiesForDomain } from "../services/bibframeOntologyEngine";
import {
  buildBibframeGraph,
  quadsToTurtle,
  generateUri,
} from "../services/graphBuilder";
import { generateMARCFromBibframe } from "../services/marcGenerator";
import { OPACPreview } from "./ontology/OPACPreview";
import { MindMapPreview } from "./ontology/MindMapPreview";
import { ImportRecordDialog } from "./ontology/ImportRecordDialog";
import {
  realLocExamples,
  getRandomRealExample,
} from "../utils/realLocExamples";
import { AuthoritySearchDialog } from "./AuthoritySearchDialog";
import { AuthorityGraph } from "./AuthorityGraph";
import { MarcView } from "./RecordView/MarcView";
import { RdfView } from "./RecordView/RdfView";
import type { UnifiedPerson } from "../services/authorityHub/types";
import { Toaster } from "./ui/sonner";
import moonLogo from "figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png";
import "../../styles/glassmorphism.css";
import { saveRecord } from "../utils/recordStorageBackend";
import { BIBFRAMERecord } from "../types/bibframe";
import { useAuth } from "../contexts/AuthContext";

interface MoonEngineGlassProps {
  onBack?: () => void;
  initialWork?: any;
  initialInstance?: any;
  onRecordSaved?: () => void;
}

type AuthorityTab =
  | "names"
  | "personal"
  | "corporate"
  | "conference"
  | "geographic"
  | "all"
  | "wikidata"
  | "books"
  | "publishers"
  | "subjects";
type PreviewTab =
  | "form"
  | "graph"
  | "marc"
  | "rdf"
  | "json"
  | "opac"
  | "mindmap";

// Helper function to safely extract label from RDF data
const getLabelString = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value["rdfs:label"])
    return getLabelString(value["rdfs:label"]);
  if (typeof value === "object" && value["@value"])
    return value["@value"];
  return String(value);
};

export function MoonEngineGlass({
  onBack,
  initialWork,
  initialInstance,
  onRecordSaved,
}: MoonEngineGlassProps) {
  const { t, i18n } = useTranslation();
  const { username } = useAuth();
  const [language, setLanguage] = useState<"en" | "ar">(
    i18n.language as "en" | "ar",
  );

  // Work and Instance data - use initial values if provided
  const [workData, setWorkData] = useState<any>(
    initialWork || {
      "@type": "bf:Work",
      "@id": generateUri("work"),
      "bf:contribution": [],
    }
  );

  const [instanceData, setInstanceData] = useState<any>(
    initialInstance || {
      "@type": "bf:Instance",
      "@id": generateUri("instance"),
    }
  );

  // Update state when props change
  React.useEffect(() => {
    if (initialWork) {
      setWorkData(initialWork);
    }
  }, [initialWork]);

  React.useEffect(() => {
    if (initialInstance) {
      setInstanceData(initialInstance);
    }
  }, [initialInstance]);

  // Authority search
  const [showAuthoritySearch, setShowAuthoritySearch] =
    useState(false);
  const [currentAuthorityTab, setCurrentAuthorityTab] =
    useState<AuthorityTab>("names");

  // Preview tab
  const [previewTab, setPreviewTab] =
    useState<PreviewTab>("form");

  // Dialogs
  const [showImportDialog, setShowImportDialog] =
    useState(false);
  const [showExampleMenu, setShowExampleMenu] = useState(false);
  const [showOpacViewer, setShowOpacViewer] = useState(false);

  // Get properties for each domain
  const workProperties = getPropertiesForDomain("bf:Work");
  const instanceProperties =
    getPropertiesForDomain("bf:Instance");

  /**
   * Update a Work property
   */
  const updateWorkProperty = useCallback(
    (uri: string, value: any) => {
      const propertyName = uri.split("/").pop() || uri;
      setWorkData((prev: any) => ({
        ...prev,
        [propertyName]: value,
      }));
    },
    [],
  );

  /**
   * Update an Instance property
   */
  const updateInstanceProperty = useCallback(
    (uri: string, value: any) => {
      const propertyName = uri.split("/").pop() || uri;
      setInstanceData((prev: any) => ({
        ...prev,
        [propertyName]: value,
      }));
    },
    [],
  );

  /**
   * Build RDF Graph
   */
  const graph = buildBibframeGraph(workData, instanceData);

  /**
   * Handle authority selection - Add to bf:contribution or handle other types
   */
  const handleAuthoritySelect = (entity: any) => {
    // Check if it's a Book (Work/Instance)
    if (entity.type === 'book') {
      // If it's a book, we might want to import its data
      // Populate Work and Instance data from the book
      // We need a helper to convert ISBNdb book to BIBFRAME
      // For now, let's just show a toast that we received it
      
      // Ideally, we should use the convertISBNdbToBIBFRAME function from isbndbApi.ts
      // But we can't easily import it here without adding more imports.
      // Let's just set the title and ISBN for now as a basic integration.
      
      const newInstance = {
        ...instanceData,
        "bf:title": {
           "@type": "bf:Title",
           "bf:mainTitle": entity.title_long || entity.title || entity.label
        },
        "bf:identifiedBy": [
           { "@type": "bf:Isbn", "rdf:value": entity.isbn13 || entity.isbn || entity.id }
        ]
      };
      
      setInstanceData(newInstance);
      
      if (entity.authors) {
         // Add authors to work
         const authors = Array.isArray(entity.authors) ? entity.authors : [entity.authors];
         const contributions = authors.map((author: string) => ({
            "@type": "bf:Contribution",
            "bf:agent": {
               "@type": "bf:Person",
               "rdfs:label": author
            },
            "bf:role": {
               "@id": "http://id.loc.gov/vocabulary/relators/aut",
               "rdfs:label": "Author"
            }
         }));
         
         setWorkData((prev: any) => ({
            ...prev,
            "bf:contribution": [
               ...(prev["bf:contribution"] || []),
               ...contributions
            ]
         }));
      }

      toast.success("Book Data Imported!", {
        description: `Imported metadata for "${entity.title || entity.label}"`,
      });
      return;
    }

    // Check if it's a Publisher
    if (entity.type === 'publisher') {
       // Add to bf:provisionActivity
       const publication = {
          "@type": "bf:Publication",
          "bf:agent": {
             "@type": "bf:Agent",
             "rdfs:label": entity.name || entity.label
          },
          "bf:date": new Date().getFullYear().toString() // Default to current year or leave empty
       };
       
       setInstanceData((prev: any) => ({
          ...prev,
          "bf:provisionActivity": publication
       }));

       toast.success("Publisher Added!", {
        description: `Set publisher to ${entity.name || entity.label}`,
      });
      return;
    }

    // Check if it's a Subject
    if (entity.type === 'subject') {
       // Add to bf:subject
       const subject = {
          "@type": "bf:Topic",
          "rdfs:label": entity.subject || entity.label
       };
       
       setWorkData((prev: any) => ({
          ...prev,
          "bf:subject": [
             ...(prev["bf:subject"] || []),
             subject
          ]
       }));

       toast.success("Subject Added!", {
        description: `Added subject "${entity.subject || entity.label}"`,
      });
      return;
    }

    // Default: It's a Person/Authority
    const person = entity as UnifiedPerson;
    
    // Create contribution object
    const contribution = {
      "@type": "bf:Contribution",
      "bf:agent": {
        "@id": person.identifiers.loc
          ? `http://id.loc.gov/authorities/names/${person.identifiers.loc}`
          : person.identifiers.wikidata
            ? `https://www.wikidata.org/entity/${person.identifiers.wikidata}`
            : person.id,
        "@type": "bf:Person",
        "rdfs:label": person.label,
      },
      "bf:role": {
        "@id": "http://id.loc.gov/vocabulary/relators/aut",
        "rdfs:label": "Author",
      },
    };

    // Add to contributions array
    setWorkData((prev: any) => ({
      ...prev,
      "bf:contribution": [
        ...(prev["bf:contribution"] || []),
        contribution,
      ],
    }));

    toast.success("Contributor added!", {
      description: `${person.label} added to bf:contribution with LOC URI.`,
    });
  };

  /**
   * Open authority search
   */
  const openAuthoritySearch = (tab: AuthorityTab) => {
    setCurrentAuthorityTab(tab);
    setShowAuthoritySearch(true);
  };

  /**
   * Load a real LOC example
   */
  const handleLoadExample = (exampleData: any) => {
    setWorkData({
      ...exampleData.work,
      "@id": exampleData.work["@id"] || generateUri("work"),
    });
    setInstanceData({
      ...exampleData.instance,
      "@id":
        exampleData.instance["@id"] || generateUri("instance"),
    });
    setShowExampleMenu(false);
    toast.success(`✨ Loaded Real LOC Example`, {
      description:
        "Complete bibliographic record with proper authority URIs.",
      duration: 4000,
    });
  };

  /**
   * Handle import
   */
  const handleImport = (
    importedWorkData: any,
    importedInstanceData: any,
  ) => {
    setWorkData({
      ...importedWorkData,
      "@id": importedWorkData["@id"] || generateUri("work"),
    });
    setInstanceData({
      ...importedInstanceData,
      "@id":
        importedInstanceData["@id"] || generateUri("instance"),
    });
    toast.success("Record imported successfully!");
  };

  /**
   * Save record to backend
   */
  const handleSave = async () => {
    try {
      // Extract title for display
      let title = 'Untitled Record';
      const instanceTitle = instanceData['bf:title'];
      if (instanceTitle) {
        if (typeof instanceTitle === 'string') {
          title = instanceTitle;
        } else if (instanceTitle['bf:mainTitle']) {
          title = instanceTitle['bf:mainTitle'];
        } else if (instanceTitle['rdfs:label']) {
          title = instanceTitle['rdfs:label'];
        }
      }
      
      if (title === 'Untitled Record') {
        const workTitle = workData['bf:title'];
        if (workTitle) {
          if (typeof workTitle === 'string') {
            title = workTitle;
          } else if (workTitle['bf:mainTitle']) {
            title = workTitle['bf:mainTitle'];
          } else if (workTitle['rdfs:label']) {
            title = workTitle['rdfs:label'];
          }
        }
      }

      // Build BIBFRAME Record in the format expected by backend
      const record: BIBFRAMERecord = {
        "@context": {
          bf: "http://id.loc.gov/ontologies/bibframe/",
          rdfs: "http://www.w3.org/2000/01/rdf-schema#",
          rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        },
        work: workData,
        instance: instanceData,
        metadata: {
          catalogingLanguage: language,
          descriptionConventions: "rda",
          resourceType: "Moon Engine designed and developed by isaac faleh",
        },
      };

      // Save to backend using the recordStorageBackend utility
      const savedRecord = await saveRecord(record, username || "Anonymous");

      toast.success("Record saved to database permanently!", {
        description: title,
      });

      // Notify parent component if callback provided
      if (onRecordSaved) {
        onRecordSaved();
      }

      console.log("✅ Record saved successfully:", savedRecord);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save record", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Extract authority nodes for graph
  const authorityNodes = (workData["bf:contribution"] || [])
    .filter((contrib: any) => contrib["bf:agent"])
    .map((contrib: any, index: number) => ({
      id: contrib["bf:agent"]["@id"] || `agent-${index}`,
      label: contrib["bf:agent"]["rdfs:label"] || "Unknown",
      source: contrib["bf:agent"]["@id"]?.includes("loc.gov")
        ? ("LOC" as const)
        : ("AfIqa" as const),
      uri: contrib["bf:agent"]["@id"] || "",
      type: "person" as const,
      connections: [],
    }));

  return (
    <div className="h-screen flex flex-col animated-gradient-bg">
      <Toaster position="top-right" />

      {/* Glass Navbar */}
      <div className="glass-navbar">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="glass-button px-4 py-2 flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              <img
                src={moonLogo}
                alt="Moon Logo"
                className="h-16 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg text-[#000000]">
                  Moon Engine
                </h1>
                <p className="text-sm text-white/80 text-[#000000cc]">
                  designed and developed by isaac faleh
                </p>
              </div>
            </div>
          </div>

          {/* Authority Search Tabs - Glass Style */}
          <div className="glass-tab-bar flex items-center gap-2 overflow-x-auto pb-2">
            <AuthorityTabButton
              active={currentAuthorityTab === "names"}
              onClick={() => openAuthoritySearch("names")}
              icon={<User className="h-4 w-4" />}
              label="NAF Auth Names"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === "personal"}
              onClick={() => openAuthoritySearch("personal")}
              label="NAF Personal Names"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === "corporate"}
              onClick={() => openAuthoritySearch("corporate")}
              icon={<Building className="h-4 w-4" />}
              label="NAF Corporate Name"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === "conference"}
              onClick={() => openAuthoritySearch("conference")}
              label="NAF Conference Name"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === "geographic"}
              onClick={() => openAuthoritySearch("geographic")}
              icon={<MapPin className="h-4 w-4" />}
              label="NAF Geographic"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === "all"}
              onClick={() => openAuthoritySearch("all")}
              icon={<Tag className="h-4 w-4" />}
              label="NAF All"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === "wikidata"}
              onClick={() => openAuthoritySearch("wikidata")}
              icon={<Globe className="h-4 w-4" />}
              label="Wikidata"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <button
              onClick={handleSave}
              className="glass-button px-4 py-2 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Record
            </button>

            {/* Load Real Example Dropdown */}
            <div className="relative">
              <button
                onClick={() =>
                  setShowExampleMenu(!showExampleMenu)
                }
                className="glass-button px-4 py-2 flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Load Real Example
              </button>

              {showExampleMenu && (
                <div className="absolute top-full left-0 mt-2 w-80 glass-card z-50 max-h-96 overflow-y-auto">
                  <div
                    className="p-2 hover:bg-black/10 transition-all duration-300 rounded-lg"
                    style={{
                      transition:
                        "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div
                      className="px-3 py-2 text-xs font-semibold text-white border-b border-white/30 hover:border-white/50 hover:bg-black/20 rounded-t-lg transition-all duration-300 cursor-default backdrop-blur-sm"
                      style={{
                        textShadow:
                          "0 2px 8px rgba(0, 0, 0, 0.5)",
                      }}
                    >
                      Real LOC Examples
                    </div>
                    {realLocExamples.map((example) => (
                      <button
                        key={example.id}
                        className="w-full text-left px-3 py-2 rounded transition-all duration-300 group relative overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          transition:
                            "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(30, 30, 40, 0.7) 100%)";
                          e.currentTarget.style.backdropFilter =
                            "blur(20px) saturate(150%)";
                          e.currentTarget.style.WebkitBackdropFilter =
                            "blur(20px) saturate(150%)";
                          e.currentTarget.style.transform =
                            "translateX(4px) scale(1.02)";
                          e.currentTarget.style.boxShadow =
                            "inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 24px rgba(0, 0, 0, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)";
                          e.currentTarget.style.backdropFilter =
                            "blur(10px)";
                          e.currentTarget.style.WebkitBackdropFilter =
                            "blur(10px)";
                          e.currentTarget.style.transform =
                            "translateX(0) scale(1)";
                          e.currentTarget.style.boxShadow =
                            "none";
                        }}
                        onClick={() =>
                          handleLoadExample(example.data)
                        }
                      >
                        <div
                          className="font-medium text-sm text-white group-hover:text-blue-300 transition-colors duration-300"
                          style={{
                            textShadow:
                              "0 2px 6px rgba(0, 0, 0, 0.8)",
                          }}
                        >
                          {example.name}
                        </div>
                        <div
                          className="text-xs text-gray-300 group-hover:text-gray-100 mt-1 transition-colors duration-300"
                          style={{
                            textShadow:
                              "0 1px 4px rgba(0, 0, 0, 0.6)",
                          }}
                        >
                          {example.description}
                        </div>
                        {/* Glossy shine effect on hover */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowImportDialog(true)}
              className="glass-button px-4 py-2 flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>

            <button
              onClick={() => {
                const blob = new Blob(
                  [JSON.stringify(graph, null, 2)],
                  { type: "application/json" },
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "bibframe-record.json";
                a.click();
              }}
              className="glass-button px-4 py-2 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export JSON-LD
            </button>
          </div>
        </div>
      </div>

      {/* Preview Tabs - Separate Tabs for Everything */}
      <div className="glass-navbar border-t border-white/20">
        <div className="px-6 py-3">
          <div className="glass-tab-bar flex items-center gap-2 overflow-x-auto">
            <PreviewTabButton
              active={previewTab === "form"}
              onClick={() => setPreviewTab("form")}
              icon={<FileText className="h-4 w-4" />}
              label="Form"
            />
            <PreviewTabButton
              active={previewTab === "graph"}
              onClick={() => setPreviewTab("graph")}
              icon={<Network className="h-4 w-4" />}
              label="Authority Graph"
            />
            <PreviewTabButton
              active={previewTab === "marc"}
              onClick={() => setPreviewTab("marc")}
              icon={<Database className="h-4 w-4" />}
              label="MARC"
            />
            <PreviewTabButton
              active={previewTab === "rdf"}
              onClick={() => setPreviewTab("rdf")}
              icon={<Code className="h-4 w-4" />}
              label="RDF"
            />
            <PreviewTabButton
              active={previewTab === "json"}
              onClick={() => setPreviewTab("json")}
              icon={<Braces className="h-4 w-4" />}
              label="JSON"
            />
            <PreviewTabButton
              active={previewTab === "opac"}
              onClick={() => setPreviewTab("opac")}
              icon={<Eye className="h-4 w-4" />}
              label="Preview (OPAC)"
            />
            <PreviewTabButton
              active={previewTab === "mindmap"}
              onClick={() => setPreviewTab("mindmap")}
              icon={<Sparkles className="h-4 w-4" />}
              label="Mind Map"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 overflow-auto p-6 bg-black/30 backdrop-blur-3xl relative"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 20, 30, 0.5) 100%)",
          backdropFilter: "blur(40px) saturate(150%)",
          WebkitBackdropFilter: "blur(40px) saturate(150%)",
          boxShadow:
            "inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.5), 0 20px 60px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Form Tab */}
        {previewTab === "form" && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xl font-semibold">
                    Work
                  </h3>
                </div>
                <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto">
                  {workProperties.map((property) => (
                    <OntologyField
                      key={property.uri}
                      property={property}
                      value={
                        workData[
                          property.uri.split("/").pop() || ""
                        ]
                      }
                      onChange={(value) =>
                        updateWorkProperty(property.uri, value)
                      }
                      language={language}
                    />
                  ))}

                  {/* Show Contributions */}
                  {workData["bf:contribution"]?.length > 0 && (
                    <div className="glass-panel p-4 rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">
                        Contributors (
                        {workData["bf:contribution"].length})
                      </h4>
                      {workData["bf:contribution"].map(
                        (contrib: any, idx: number) => {
                          const agentLabel = getLabelString(
                            contrib["bf:agent"]?.[
                              "rdfs:label"
                            ] ||
                              contrib["bf:agent"]?.label ||
                              "Unknown",
                          );
                          const roleLabel = getLabelString(
                            contrib["bf:role"]?.[
                              "rdfs:label"
                            ] ||
                              contrib["bf:role"]?.label ||
                              "Contributor",
                          );

                          return (
                            <div
                              key={idx}
                              className="text-sm p-2 bg-white/50 rounded mb-2"
                            >
                              <div className="font-medium">
                                {agentLabel}
                              </div>
                              <div className="text-xs text-gray-600">
                                {roleLabel}
                              </div>
                              <div className="text-xs text-blue-600 truncate">
                                {contrib["bf:agent"]?.["@id"]}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-purple-600" />
                  <h3 className="text-xl font-semibold">
                    Instance
                  </h3>
                </div>
                <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto">
                  {instanceProperties.map((property) => (
                    <OntologyField
                      key={property.uri}
                      property={property}
                      value={
                        instanceData[
                          property.uri.split("/").pop() || ""
                        ]
                      }
                      onChange={(value) =>
                        updateInstanceProperty(
                          property.uri,
                          value,
                        )
                      }
                      language={language}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authority Graph Tab */}
        {previewTab === "graph" && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">
              Authority Graph
            </h3>
            <AuthorityGraph nodes={authorityNodes} />
          </div>
        )}

        {/* MARC Tab */}
        {previewTab === "marc" && (
          <MarcView
            data={{
              work: workData,
              instance: instanceData,
              admin: {},
            }}
          />
        )}

        {/* RDF Tab */}
        {previewTab === "rdf" && (
          <RdfView
            data={{
              work: workData,
              instance: instanceData,
              admin: {},
            }}
          />
        )}

        {/* JSON Tab */}
        {previewTab === "json" && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">
              JSON Structure
            </h3>
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
              <code>
                {JSON.stringify(
                  { work: workData, instance: instanceData },
                  null,
                  2,
                )}
              </code>
            </pre>
          </div>
        )}

        {/* OPAC Preview Tab */}
        {previewTab === "opac" && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">
              OPAC Preview
            </h3>
            <OPACPreview
              workData={workData}
              instanceData={instanceData}
            />
          </div>
        )}

        {/* Mind Map Tab */}
        {previewTab === "mindmap" && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">
              Mind Map
            </h3>
            <MindMapPreview
              workData={workData}
              instanceData={instanceData}
            />
          </div>
        )}
      </div>

      {/* Authority Search Dialog */}
      <AuthoritySearchDialog
        isOpen={showAuthoritySearch}
        onClose={() => setShowAuthoritySearch(false)}
        onSelect={handleAuthoritySelect}
        initialQuery=""
      />

      {/* Import Dialog */}
      <ImportRecordDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
      />
    </div>
  );
}

// Authority Tab Button with Glass Effect
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
}

function AuthorityTabButton({
  active,
  onClick,
  icon,
  label,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm font-medium
        ${
          active
            ? "glass-tab-active text-blue-600 shadow-lg"
            : "hover:bg-white/30 text-gray-700"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

function PreviewTabButton({
  active,
  onClick,
  icon,
  label,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm font-medium
        ${
          active
            ? "glass-tab-active text-purple-600 shadow-lg"
            : "hover:bg-white/30 text-gray-700"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}) (// Authority Search Dialog - Searches all 4 sources + ISBNdb Books/Publishers/Subjects
import { useState, useEffect } from 'react';
import { Search, ExternalLink, CheckCircle, Loader2, User, Book, Building, Tag } from 'lucide-react';
import { useThemeSafe } from '../hooks/useThemeSafe';
import { getThemeGradients } from '../utils/themeGradients';
import { authorityHub } from '../services/authorityHub/authorityHubService';
import type { AuthoritySearchResult, UnifiedPerson } from '../services/authorityHub/types';
import { AuthorityGraph } from './AuthorityGraph';

interface AuthoritySearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (result: UnifiedPerson | any) => void;
  initialQuery?: string;
  initialTab?: 'people' | 'books' | 'publishers' | 'subjects';
}

export function AuthoritySearchDialog({ 
  isOpen, 
  onClose, 
  onSelect,
  initialQuery = '',
  initialTab = 'people'
}: AuthoritySearchDialogProps) {
  const { moonEngineTheme } = useThemeSafe();
  const gradients = getThemeGradients(moonEngineTheme);
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<'people' | 'books' | 'publishers' | 'subjects'>(initialTab);
  const [results, setResults] = useState<AuthoritySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AuthoritySearchResult | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Update search type when initialTab changes
  useEffect(() => {
    if (initialTab) setSearchType(initialTab);
  }, [initialTab]);

  // Update query when initialQuery changes
  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSelectedResult(null);
    setDetails(null);
    setResults([]);

    try {
      let searchResults: AuthoritySearchResult[] = [];
      const isbndb = authorityHub.getIsbndbService();
      
      switch (searchType) {
        case 'books':
          searchResults = await isbndb.searchBooks(query);
          break;
        case 'publishers':
          searchResults = await isbndb.searchPublishers(query);
          break;
        case 'subjects':
          searchResults = await isbndb.searchSubjects(query);
          break;
        case 'people':
        default:
          searchResults = await authorityHub.searchAll(query);
          break;
      }
      
      setResults(searchResults);
    } catch (error) {
      console.error('Authority search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = async (result: AuthoritySearchResult) => {
    setSelectedResult(result);
    setLoadingDetails(true);
    setDetails(null);

    try {
      const isbndb = authorityHub.getIsbndbService();

      if (searchType === 'people') {
        const person = await authorityHub.buildUnifiedPerson(result);
        setDetails(person);
      } else if (searchType === 'books') {
        // For books, we might want details or just use the result
        // Since we don't have a specific "get book details" in isbndbService that returns a unified format yet,
        // we'll just use the result or fetch details if it's an ISBN
        if (result.id && (result.id.length === 10 || result.id.length === 13)) {
           // It's likely an ISBN, we could fetch details if needed, 
           // but search result already has some info.
           // Let's just use the result for now.
           setDetails({ ...result, type: 'book' });
        } else {
           setDetails({ ...result, type: 'book' });
        }
      } else if (searchType === 'publishers') {
        const pubDetails = await isbndb.getPublisherDetails(result.label);
        setDetails({ ...pubDetails, type: 'publisher', source: 'ISBNdb' });
      } else if (searchType === 'subjects') {
        const subDetails = await isbndb.getSubjectDetails(result.label);
        setDetails({ ...subDetails, type: 'subject', source: 'ISBNdb' });
      }
    } catch (error) {
      console.error('Failed to get details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleConfirmSelection = () => {
    if (details) {
      onSelect(details);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="glass-navbar text-gray-900 px-6 py-4 rounded-t-lg relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-40 -z-10"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 15%, #f093fb 30%, #4facfe 45%, #00f2fe 60%, #fa709a 75%, #fee140 90%, #667eea 100%)',
              backgroundSize: '400% 400%',
              animation: 'gradientShift 20s ease infinite'
            }}
          />
          <h2 className="text-2xl font-semibold">Universal Authority & Resource Search</h2>
          <p className="text-sm opacity-90 mt-1">Search Authorities, Books, Publishers, and Subjects</p>
        </div>

        {/* Search Tabs */}
        <div className="flex border-b bg-gray-50">
           <button 
             onClick={() => setSearchType('people')}
             className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${searchType === 'people' ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             <User className="w-4 h-4" /> People (Agents)
           </button>
           <button 
             onClick={() => setSearchType('books')}
             className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${searchType === 'books' ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             <Book className="w-4 h-4" /> Books (Works)
           </button>
           <button 
             onClick={() => setSearchType('publishers')}
             className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${searchType === 'publishers' ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             <Building className="w-4 h-4" /> Publishers
           </button>
           <button 
             onClick={() => setSearchType('subjects')}
             className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${searchType === 'subjects' ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             <Tag className="w-4 h-4" /> Subjects
           </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Search ${searchType}...`}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-3 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.7) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(147, 197, 253, 0.5)',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Results List */}
          <div className="w-1/3 border-r overflow-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Results ({results.length})
              </h3>

              {results.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">No results yet</p>
                  <p className="text-xs mt-1">Enter a query and click Search</p>
                </div>
              )}

              <div className="space-y-2">
                {results.map((result, idx) => (
                  <button
                    key={`${result.source}-${result.id}-${idx}`}
                    onClick={() => handleSelectResult(result)}
                    className={`
                      w-full text-left p-3 rounded-lg border-2 transition-all
                      ${selectedResult?.id === result.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {result.label}
                        </div>
                        {result.description && (
                          <div className="text-xs text-gray-600 mt-1 truncate">
                            {result.description}
                          </div>
                        )}
                      </div>
                      <SourceBadge source={result.source} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="flex-1 overflow-auto">
            {loadingDetails ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : details ? (
              <div className="p-6">
                {searchType === 'people' ? (
                   // Render Person Details (UnifiedPerson)
                   <PersonDetails person={details} gradients={gradients} />
                ) : (
                   // Render Other Details
                   <GenericDetails details={details} type={searchType} gradients={gradients} />
                )}

                {/* Confirm Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleConfirmSelection}
                    className={`px-6 py-3 ${gradients.btnSuccess} text-white rounded-lg flex items-center gap-2`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Use This {searchType === 'people' ? 'Authority' : searchType.slice(0, -1)}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="text-sm">Select a result to view details</p>
                  <p className="text-xs mt-1">Unified view from sources</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-between items-center bg-gray-50">
          <div className="text-xs text-gray-500">
            Powered by: Library of Congress • VIAF • Wikidata • AfIqa • ISBNdb
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function PersonDetails({ person, gradients }: { person: UnifiedPerson, gradients: any }) {
  return (
    <>
        <div className={`${gradients.cardPrimary} rounded-lg p-6 mb-6`}>
          <div className="flex gap-6">
            {person.image && (
              <img
                src={person.image}
                alt={person.label}
                className="w-32 h-32 rounded-lg object-cover shadow-md"
              />
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {person.label}
              </h3>
              {(person.birth || person.death) && (
                <div className="text-gray-700 mb-2">
                  {person.birth && <span>{person.birth}</span>}
                  {person.birth && person.death && <span> - </span>}
                  {person.death && <span>{person.death}</span>}
                </div>
              )}
              {person.description && (
                <p className="text-gray-600 text-sm mb-3">{person.description}</p>
              )}
              {person.occupations && person.occupations.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {person.occupations.map((occ, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {occ}
                    </span>
                  ))}
                </div>
              )}
              {person.nationality && (
                <div className="text-sm text-gray-600">
                  <strong>Nationality:</strong> {person.nationality}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Identifiers */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Authority Identifiers</h4>
          <div className="grid grid-cols-2 gap-3">
            {person.identifiers.loc && (
              <IdentifierCard
                source="LOC"
                id={person.identifiers.loc}
                uri={`http://id.loc.gov/authorities/names/${person.identifiers.loc}`}
              />
            )}
            {person.identifiers.viaf && (
              <IdentifierCard
                source="VIAF"
                id={person.identifiers.viaf}
                uri={`https://viaf.org/viaf/${person.identifiers.viaf}`}
              />
            )}
            {person.identifiers.wikidata && (
              <IdentifierCard
                source="Wikidata"
                id={person.identifiers.wikidata}
                uri={`https://www.wikidata.org/entity/${person.identifiers.wikidata}`}
              />
            )}
            {person.identifiers.afiqa && (
              <IdentifierCard
                source="AfIqa"
                id={person.identifiers.afiqa}
                uri={`http://moon.library/authorities/${person.identifiers.afiqa}`}
              />
            )}
             {person.identifiers.isbndb && (
              <IdentifierCard
                source="ISBNdb"
                id={person.identifiers.isbndb}
                uri={`https://isbndb.com/author/${person.identifiers.isbndb}`}
              />
            )}
          </div>
        </div>

        {/* Authority Graph */}
        {person.sourceGraph && person.sourceGraph.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Authority Connections</h4>
            <AuthorityGraph nodes={person.sourceGraph} />
          </div>
        )}
    </>
  );
}

function GenericDetails({ details, type, gradients }: { details: any, type: string, gradients: any }) {
  if (type === 'books') {
    return (
      <div className={`${gradients.cardPrimary} rounded-lg p-6 mb-6`}>
        <div className="flex gap-6">
          {details.image ? (
            <img src={details.image} alt={details.label} className="w-32 h-48 object-cover rounded shadow-lg" />
          ) : (
            <div className="w-32 h-48 bg-gray-200 rounded flex items-center justify-center text-gray-400">
              <Book className="w-12 h-12" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{details.label || details.title_long || details.title}</h3>
            {details.authors && (
              <p className="text-gray-700 mb-2">by {Array.isArray(details.authors) ? details.authors.join(', ') : details.authors}</p>
            )}
            <div className="flex gap-2 mb-4">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium uppercase tracking-wide">
                Book
              </span>
              {details.publisher && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded font-medium">
                  {details.publisher}
                </span>
              )}
              {details.date_published && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded font-medium">
                  {details.date_published}
                </span>
              )}
            </div>
            
            {details.synopsys && (
              <p className="text-sm text-gray-600 line-clamp-4 mb-4">{details.synopsys}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              {details.isbn && <div><strong>ISBN:</strong> {details.isbn}</div>}
              {details.isbn13 && <div><strong>ISBN13:</strong> {details.isbn13}</div>}
              {details.binding && <div><strong>Format:</strong> {details.binding}</div>}
              {details.pages && <div><strong>Pages:</strong> {details.pages}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${gradients.cardPrimary} rounded-lg p-6 mb-6`}>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {details.label || details.name || 'Unknown'}
      </h3>
      <div className="text-sm text-gray-700 uppercase tracking-wide font-semibold mb-4">
        {type} Record
      </div>
      
      {details.description && (
        <p className="text-gray-800 mb-4">{details.description}</p>
      )}

      {/* Display raw details for now as a fallback */}
      <div className="bg-white/50 p-4 rounded-lg text-sm overflow-auto max-h-60">
        <pre>{JSON.stringify(details, null, 2)}</pre>
      </div>
    </div>
  );
}

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    LOC: 'bg-red-100 text-red-700',
    VIAF: 'bg-blue-100 text-blue-700',
    Wikidata: 'bg-green-100 text-green-700',
    AfIqa: 'bg-purple-100 text-purple-700',
    ISBNdb: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[source] || 'bg-gray-100 text-gray-700'}`}>
      {source}
    </span>
  );
}

function IdentifierCard({ source, id, uri }: { source: string; id: string; uri: string }) {
  return (
    <div className="border rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <SourceBadge source={source} />
        <a
          href={uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      <div className="text-xs text-gray-600 font-mono truncate">{id}</div>
    </div>
  );
}
) mix everything and blende it togather dont forget nothing