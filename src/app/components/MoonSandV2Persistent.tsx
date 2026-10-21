/**
 * 🏖️ MOON SAND V2 PERSISTENT - Full Record Lifecycle
 * Ontology-Driven + Backend Persistence + Versioning + Publishing
 */

"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Layers, Download, Eye, Code, FileJson, Network, Database, Sparkles, 
  ChevronDown, CheckCircle2, AlertCircle, BarChart3, Save, Upload, Clock,
  GitBranch, Send, FolderOpen, Settings, X, RefreshCw, Plus
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { GraphStore } from "../../services/graphStore";
import { generateUri } from "../../services/rdfGraphBuilder";
import { OntologyDrivenFormRenderer } from "./cataloging/OntologyDrivenFormRenderer";
import { ValidationPanel, validateGraph, ValidationResult } from "./cataloging/ValidationPanel";
import { RelationshipGraph, Relationship, generateRelationshipId, RELATIONSHIP_DEFINITIONS } from "../../services/relationshipManager";
import { toTurtle, toJsonLd } from "../../services/rdfGraphBuilder";
import * as recordAPI from "../../services/recordPersistence";
import {
  getCategoriesForDomain, getPropertiesByCategory
} from "../../services/ontologyRegistry";

// ===== FIELD TEMPLATE TYPE =====
interface FieldTemplate {
  id: string;
  name: string;
  baseTemplate: string;
  hiddenFields: string[];
  allFields: string[];
  createdAt: string;
}

const FIELD_TEMPLATES_KEY = "msv2p-field-templates";

type ViewMode = 'catalog' | 'relationships' | 'validation' | 'graph' | 'jsonld' | 'turtle' | 'versions';
type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';

export default function MoonSandV2Persistent({ recordId: initialRecordId }: { recordId?: string }) {
  const { t } = useTranslation();

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
  const [recordId, setRecordId] = useState<string | null>(initialRecordId || null);
  const [recordTitle, setRecordTitle] = useState('Untitled Record');
  const [recordStatus, setRecordStatus] = useState<'draft' | 'validated' | 'published' | 'archived'>('draft');
  const [versionNumber, setVersionNumber] = useState(1);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('unsaved');
  const [versions, setVersions] = useState<recordAPI.RecordVersion[]>([]);
  const [autoSave, setAutoSave] = useState(true);

  // ===== HIDDEN FIELDS & TEMPLATES =====
  const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set());
  const [showFieldManager, setShowFieldManager] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [savedFieldTemplates, setSavedFieldTemplates] = useState<FieldTemplate[]>(() => {
    try { return JSON.parse(localStorage.getItem(FIELD_TEMPLATES_KEY) || "[]"); } catch { return []; }
  });

  const hideField = useCallback((fieldKey: string) => {
    setHiddenFields(prev => { const n = new Set(prev); n.add(fieldKey); return n; });
  }, []);

  const restoreField = useCallback((fieldKey: string) => {
    setHiddenFields(prev => { const n = new Set(prev); n.delete(fieldKey); return n; });
  }, []);

  const restoreAllFields = useCallback(() => {
    setHiddenFields(new Set());
  }, []);

  const persistFieldTemplates = useCallback((templates: FieldTemplate[]) => {
    setSavedFieldTemplates(templates);
    localStorage.setItem(FIELD_TEMPLATES_KEY, JSON.stringify(templates));
  }, []);

  // Compute full manifest of all fields for template tracking
  const allFieldKeys = useMemo(() => {
    const keys: string[] = [];
    ["Work", "Instance", "Expression", "Item"].forEach(domain => {
      getCategoriesForDomain(domain).forEach(cat => {
        getPropertiesByCategory(domain, cat).forEach(p => keys.push(`registry:${p.shortName}`));
      });
    });
    return [...new Set(keys)];
  }, []);

  const handleSaveFieldTemplate = useCallback((name: string) => {
    const tmpl: FieldTemplate = {
      id: `ft-${Date.now()}`,
      name,
      baseTemplate: "MoonSandV2",
      hiddenFields: Array.from(hiddenFields),
      allFields: allFieldKeys,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedFieldTemplates, tmpl];
    persistFieldTemplates(updated);
    setShowSaveTemplateDialog(false);
    toast.success(`Template "${name}" saved`);
  }, [hiddenFields, allFieldKeys, savedFieldTemplates, persistFieldTemplates]);

  const handleLoadFieldTemplate = useCallback((tmpl: FieldTemplate) => {
    setHiddenFields(new Set(tmpl.hiddenFields));
    toast.success(`Template "${tmpl.name}" applied`);
  }, []);

  const handleDeleteFieldTemplate = useCallback((id: string) => {
    const deleted = savedFieldTemplates.find(t => t.id === id);
    const updated = savedFieldTemplates.filter(t => t.id !== id);
    persistFieldTemplates(updated);
    toast.success(`Template "${deleted?.name || ''}" deleted`);
  }, [savedFieldTemplates, persistFieldTemplates]);

  /* ============================= INITIALIZATION ============================= */

  useEffect(() => {
    // Load record if ID provided
    if (initialRecordId) {
      loadRecord(initialRecordId);
    } else {
      initializeNewRecord();
    }
  }, []);

  const initializeNewRecord = () => {
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

    // Create automatic WEMI links
    graphStore.createWEMILinks(workUri, undefined, instanceUri, itemUri);

    // Initial generation
    generateRDF();
  };

  const loadRecord = async (id: string) => {
    try {
      const record = await recordAPI.getRecord(id);
      
      // Load into graph store
      graphStore.fromJsonLd(record.graphJson);
      
      // Update state
      setRecordId(record.id);
      setRecordTitle(record.title);
      setRecordStatus(record.status);
      setVersionNumber(record.versionNumber);
      setSaveStatus('saved');
      
      // Load versions
      const versionsList = await recordAPI.listVersions(id);
      setVersions(versionsList);
      
      // Generate RDF
      generateRDF();
    } catch (error) {
      console.error('Failed to load record:', error);
      toast.error('Failed to load record');
    }
  };

  /* ============================= AUTO-SAVE ============================= */

  useEffect(() => {
    if (!autoSave || saveStatus === 'saved') return;

    const timer = setTimeout(() => {
      if (saveStatus === 'unsaved') {
        handleSave();
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [autoSave, saveStatus]);

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

    if (newValue) {
      graphStore.setNode(expressionUri, {
        '@id': expressionUri,
        '@type': 'bf:Expression'
      });
    }

    graphStore.createWEMILinks(
      workUri,
      newValue ? expressionUri : undefined,
      instanceUri,
      itemUri
    );

    setSaveStatus('unsaved');
    generateRDF();
  };

  /* ============================= RDF GENERATION ============================= */

  const generateRDF = () => {
    try {
      const graphData = graphStore.toJsonLd();
      relationshipGraph.addToJsonLdGraph(graphData['@graph'] || [], relationships);

      const validationResult = validateGraph(graphStore, enableExpression);
      setValidation(validationResult);

      setJsonld(graphData);

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

  /* ============================= PERSISTENCE ============================= */

  const handleSave = async () => {
    try {
      setSaveStatus('saving');

      if (!jsonld) {
        throw new Error('No graph to save');
      }

      if (recordId) {
        // Update existing
        const updated = await recordAPI.updateRecord(recordId, jsonld, recordTitle);
        setVersionNumber(updated.versionNumber);
        setRecordStatus(updated.status);
      } else {
        // Create new
        const created = await recordAPI.createRecord(jsonld, recordTitle, 'Work');
        setRecordId(created.id);
        setVersionNumber(created.versionNumber);
        setRecordStatus(created.status);
      }

      setSaveStatus('saved');
      toast.success('Record saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      toast.error('Failed to save record');
    }
  };

  const handleCreateVersion = async () => {
    if (!recordId) {
      toast.warning('Save the record first');
      return;
    }

    const comment = prompt('Version comment (optional):');
    
    try {
      const version = await recordAPI.createVersion(recordId, comment || undefined);
      const versionsList = await recordAPI.listVersions(recordId);
      setVersions(versionsList);
      toast.success(`Version ${version.versionNumber} created`);
    } catch (error) {
      console.error('Failed to create version:', error);
      toast.error('Failed to create version');
    }
  };

  const handleLoadVersion = async (versionNum: number) => {
    if (!recordId) return;

    try {
      const version = await recordAPI.getVersion(recordId, versionNum);
      graphStore.fromJsonLd(version.graphSnapshot);
      generateRDF();
      setSaveStatus('unsaved');
      toast.info(`Loaded version ${versionNum} — save to create new version`);
    } catch (error) {
      console.error('Failed to load version:', error);
      toast.error('Failed to load version');
    }
  };

  const handlePublish = async () => {
    if (!recordId) {
      toast.warning('Save the record first');
      return;
    }

    if (!validation?.valid) {
      toast.warning('Fix validation errors before publishing');
      return;
    }

    if (!confirm('Publish this record? This will create a version snapshot.')) {
      return;
    }

    try {
      const published = await recordAPI.publishRecord(recordId);
      setRecordStatus(published.status);
      setVersionNumber(published.versionNumber);
      const versionsList = await recordAPI.listVersions(recordId);
      setVersions(versionsList);
      toast.success('Record published successfully!');
    } catch (error: any) {
      console.error('Failed to publish:', error);
      toast.error(error.message || 'Failed to publish record');
    }
  };

  const handleExport = async (format: 'jsonld' | 'turtle') => {
    if (!recordId) {
      // Export current state
      if (format === 'turtle' && turtle) {
        const blob = new Blob([turtle], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recordTitle}.ttl`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'jsonld' && jsonld) {
        const blob = new Blob([JSON.stringify(jsonld, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recordTitle}.jsonld`;
        a.click();
        URL.revokeObjectURL(url);
      }
      return;
    }

    try {
      recordAPI.downloadExport(recordId, format, recordTitle);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export record');
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
    setSaveStatus('unsaved');
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

  /* ============================= RENDER ============================= */

  const stats = graphStore.getStats();

  const getSaveStatusBadge = () => {
    const badges = {
      saved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle2 className="h-4 w-4" />, label: 'Saved' },
      unsaved: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="h-4 w-4" />, label: 'Unsaved Changes' },
      saving: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Clock className="h-4 w-4 animate-spin" />, label: 'Saving...' },
      error: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle className="h-4 w-4" />, label: 'Save Failed' }
    };

    const badge = badges[saveStatus];
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${badge.bg} ${badge.text} font-semibold`}>
        {badge.icon}
        {badge.label}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="h-4 w-4" /> },
      validated: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CheckCircle2 className="h-4 w-4" /> },
      published: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle2 className="h-4 w-4" /> },
      archived: { bg: 'bg-gray-100', text: 'text-gray-600', icon: <Database className="h-4 w-4" /> }
    };

    const badge = badges[status as keyof typeof badges] || badges.draft;
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${badge.bg} ${badge.text} font-semibold`}>
        {badge.icon}
        {status}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Save Controls */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
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
            <div className="flex gap-3">
              {getSaveStatusBadge()}
              {getStatusBadge(recordStatus)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving' || saveStatus === 'saved'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-semibold flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </button>

            {recordId && (
              <>
                <button
                  onClick={handleCreateVersion}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2"
                >
                  <GitBranch className="h-4 w-4" />
                  Create Version
                </button>

                <button
                  onClick={handlePublish}
                  disabled={!validation?.valid || recordStatus === 'published'}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-semibold flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Publish
                </button>
              </>
            )}

            <div className="border-l border-gray-300 pl-3 ml-3 flex gap-2">
              {validation?.valid && (
                <>
                  <button
                    onClick={() => handleExport('turtle')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Turtle
                  </button>
                  <button
                    onClick={() => handleExport('jsonld')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    JSON-LD
                  </button>
                </>
              )}
            </div>

            {/* Field Templates Button */}
            <div className="border-l border-gray-300 pl-3 ml-auto flex gap-2">
              <button
                onClick={() => setShowFieldManager(!showFieldManager)}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                  hiddenFields.size > 0
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <Settings className="h-4 w-4" />
                {hiddenFields.size > 0 ? `${hiddenFields.size} ${t("fieldsHidden")}` : t("customTemplates")}
              </button>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
            {recordId && (
              <div className="font-mono">{recordId}</div>
            )}
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span>Version {versionNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>{stats.nodeCount} Nodes</span>
            </div>
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <span>{stats.tripleCount} Triples</span>
            </div>
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
          <div className="flex gap-2 flex-wrap">
            <ViewTab icon={<Database />} label="Catalog" active={viewMode === 'catalog'} onClick={() => setViewMode('catalog')} />
            <ViewTab icon={<Network />} label="Relationships" active={viewMode === 'relationships'} onClick={() => setViewMode('relationships')} />
            <ViewTab icon={<CheckCircle2 />} label="Validation" active={viewMode === 'validation'} onClick={() => setViewMode('validation')} />
            <ViewTab icon={<GitBranch />} label={`Versions (${versions.length})`} active={viewMode === 'versions'} onClick={() => setViewMode('versions')} />
            <ViewTab icon={<Eye />} label="Graph Stats" active={viewMode === 'graph'} onClick={() => setViewMode('graph')} />
            <ViewTab icon={<FileJson />} label="JSON-LD" active={viewMode === 'jsonld'} onClick={() => setViewMode('jsonld')} />
            <ViewTab icon={<Code />} label="Turtle" active={viewMode === 'turtle'} onClick={() => setViewMode('turtle')} />
          </div>
        </div>

        {/* Content - Same as MoonSandV2 */}
        {viewMode === 'catalog' && (
          <div className="space-y-6">
            <EntitySection title="Work" icon={<Database className="h-6 w-6 text-blue-600" />} uri={workUri}>
              <OntologyDrivenFormRenderer
                entityType="Work"
                nodeUri={workUri}
                graphStore={graphStore}
                onChange={handlePropertyChange}
                hiddenFields={hiddenFields}
                onHideField={hideField}
              />
            </EntitySection>

            {enableExpression && (
              <EntitySection title="Expression" icon={<Sparkles className="h-6 w-6 text-purple-600" />} uri={expressionUri}>
                <OntologyDrivenFormRenderer
                  entityType="Expression"
                  nodeUri={expressionUri}
                  graphStore={graphStore}
                  onChange={handlePropertyChange}
                  hiddenFields={hiddenFields}
                  onHideField={hideField}
                />
              </EntitySection>
            )}

            <EntitySection title="Instance" icon={<Database className="h-6 w-6 text-green-600" />} uri={instanceUri}>
              <OntologyDrivenFormRenderer
                entityType="Instance"
                nodeUri={instanceUri}
                graphStore={graphStore}
                onChange={handlePropertyChange}
                hiddenFields={hiddenFields}
                onHideField={hideField}
              />
            </EntitySection>

            <EntitySection title="Item" icon={<Database className="h-6 w-6 text-orange-600" />} uri={itemUri}>
              <OntologyDrivenFormRenderer
                entityType="Item"
                nodeUri={itemUri}
                graphStore={graphStore}
                onChange={handlePropertyChange}
                hiddenFields={hiddenFields}
                onHideField={hideField}
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

        {viewMode === 'versions' && (
          <VersionsView versions={versions} onLoadVersion={handleLoadVersion} />
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

      {/* ===== FIELD MANAGER PANEL ===== */}
      {showFieldManager && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-bold flex items-center gap-2 text-gray-900">
              <Settings className="h-4 w-4 text-orange-600" />
              {t("fieldCustomization")}
            </h3>
            <button onClick={() => setShowFieldManager(false)} className="p-1 rounded-lg hover:bg-gray-200 transition-all">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Summary bar */}
            <div className="px-5 py-3 flex items-center gap-3 flex-wrap border-b border-gray-100">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-green-100 text-green-700">
                {allFieldKeys.length - hiddenFields.size} {t("fieldsKept")}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-red-100 text-red-700">
                {hiddenFields.size} {t("fieldsRemoved")}
              </span>
              <div className="flex-1" />
              <button onClick={() => setShowSaveTemplateDialog(true)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all">
                <Save className="h-3 w-3" /> {t("saveTemplate")}
              </button>
              {hiddenFields.size > 0 && (
                <button onClick={restoreAllFields}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-all">
                  <RefreshCw className="h-3 w-3" /> {t("restoreAll")}
                </button>
              )}
            </div>

            {/* Saved templates */}
            {savedFieldTemplates.length > 0 && (
              <div className="px-5 py-3 border-b border-gray-100">
                <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-gray-500 flex items-center gap-1.5">
                  <Layers className="h-3 w-3" /> {t("savedTemplates")} ({savedFieldTemplates.length})
                </h4>
                <div className="space-y-1.5">
                  {savedFieldTemplates.map(tmpl => (
                    <div key={tmpl.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-900 truncate">{tmpl.name}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-2">
                          <span>{t("basedOn")}: {tmpl.baseTemplate}</span>
                          <span className="text-green-600">{tmpl.allFields.length - tmpl.hiddenFields.length} {t("fieldsKept")}</span>
                          <span className="text-red-600">{tmpl.hiddenFields.length} {t("fieldsRemoved")}</span>
                        </div>
                      </div>
                      <button onClick={() => handleLoadFieldTemplate(tmpl)}
                        className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 shrink-0 transition-all">
                        {t("applyTemplate")}
                      </button>
                      <button onClick={() => handleDeleteFieldTemplate(tmpl.id)}
                        className="p-1 rounded-md text-red-500 hover:bg-red-50 shrink-0 transition-all">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden fields list */}
            {hiddenFields.size > 0 ? (
              <div className="px-5 py-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-gray-500 flex items-center gap-1.5">
                  <Eye className="h-3 w-3" /> {t("removedFields")} ({hiddenFields.size})
                </h4>
                <div className="space-y-1">
                  {Array.from(hiddenFields).map(fieldKey => (
                    <div key={fieldKey} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                      <span className="font-mono truncate flex-1 text-gray-600">
                        {fieldKey.replace("ontology:", "").replace("registry:", "").split("/").pop()}
                      </span>
                      <button onClick={() => restoreField(fieldKey)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-all shrink-0">
                        <RefreshCw className="h-2.5 w-2.5" /> {t("restoreField")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-5 py-6 text-center">
                <p className="text-xs text-gray-500">{t("noHiddenFields")}</p>
                <p className="text-[10px] mt-1 text-gray-400">
                  Hover over any field and click the delete icon to hide it
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== SAVE TEMPLATE DIALOG ===== */}
      {showSaveTemplateDialog && (
        <SaveTemplateDialog
          allFieldKeys={allFieldKeys}
          hiddenFields={hiddenFields}
          onSave={handleSaveFieldTemplate}
          onClose={() => setShowSaveTemplateDialog(false)}
          t={t}
        />
      )}
    </div>
  );
}

/* ============================= SAVE TEMPLATE DIALOG ============================= */

function SaveTemplateDialog({ allFieldKeys, hiddenFields, onSave, onClose, t }: {
  allFieldKeys: string[];
  hiddenFields: Set<string>;
  onSave: (name: string) => void;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const [name, setName] = useState("");
  const keptFields = allFieldKeys.filter(k => !hiddenFields.has(k));
  const removedFields = allFieldKeys.filter(k => hiddenFields.has(k));
  const formatFieldName = (key: string) => key.replace("ontology:", "").replace("registry:", "").split("/").pop() || key;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[480px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
              <Save className="h-5 w-5 text-blue-600" />
              {t("saveTemplate")}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("basedOn")}: <strong>MoonSandV2</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-all">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Template name */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-gray-600">{t("templateName")}</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder={t("templateNamePlaceholder")}
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold border-2 border-gray-200 focus:border-blue-400 focus:outline-none bg-gray-50 text-gray-900"
              autoFocus
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl text-center bg-green-50 border border-green-200">
              <div className="text-2xl font-black text-green-600">{keptFields.length}</div>
              <div className="text-xs font-bold text-green-700 mt-0.5">{t("keptFields")}</div>
            </div>
            <div className="p-4 rounded-xl text-center bg-red-50 border border-red-200">
              <div className="text-2xl font-black text-red-600">{removedFields.length}</div>
              <div className="text-xs font-bold text-red-700 mt-0.5">{t("removedFields")}</div>
            </div>
          </div>

          {/* Kept fields summary */}
          <details className="rounded-xl border border-gray-200 overflow-hidden">
            <summary className="px-4 py-2.5 bg-gray-50 cursor-pointer text-xs font-bold flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> {t("keptFields")} ({keptFields.length})
            </summary>
            <div className="px-4 py-2 max-h-40 overflow-y-auto space-y-0.5">
              {keptFields.map(k => (
                <div key={k} className="text-[11px] font-mono py-0.5 flex items-center gap-1.5 text-gray-600">
                  <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-green-500" />
                  {formatFieldName(k)}
                </div>
              ))}
            </div>
          </details>

          {/* Removed fields summary */}
          {removedFields.length > 0 && (
            <details className="rounded-xl border border-gray-200 overflow-hidden">
              <summary className="px-4 py-2.5 bg-gray-50 cursor-pointer text-xs font-bold flex items-center gap-2 text-red-700">
                <X className="h-3.5 w-3.5" /> {t("removedFields")} ({removedFields.length})
              </summary>
              <div className="px-4 py-2 max-h-40 overflow-y-auto space-y-0.5">
                {removedFields.map(k => (
                  <div key={k} className="text-[11px] font-mono py-0.5 flex items-center gap-1.5 text-gray-600">
                    <X className="h-2.5 w-2.5 shrink-0 text-red-500" />
                    {formatFieldName(k)}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all">
            {t("cancel")}
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim())}
            disabled={!name.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-black text-white flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: name.trim() ? "linear-gradient(135deg, #f97316, #f59e0b)" : "#d1d5db",
              boxShadow: name.trim() ? "0 4px 16px rgba(249,115,22,0.3)" : "none",
            }}
          >
            <Save className="h-4 w-4" /> {t("saveTemplate")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================= COMPONENTS (Same as MoonSandV2) ============================= */

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

function VersionsView({ versions, onLoadVersion }: { versions: recordAPI.RecordVersion[], onLoadVersion: (num: number) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Version History</h2>
      
      {versions.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No versions yet</div>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <div key={version.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-900">Version {version.versionNumber}</div>
                <div className="text-sm text-gray-600">{new Date(version.createdAt).toLocaleString()}</div>
                {version.comment && (
                  <div className="text-sm text-gray-500 italic mt-1">{version.comment}</div>
                )}
              </div>
              <button
                onClick={() => onLoadVersion(version.versionNumber)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Load
              </button>
            </div>
          ))}
        </div>
      )}
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