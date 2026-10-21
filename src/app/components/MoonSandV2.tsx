/**
 * 🏖️ MOON SAND V2 - Ontology-Driven BIBFRAME Semantic Engine
 * TRUE GRAPH EDITOR | REGISTRY-POWERED | NO TEMPLATES
 * Complete architectural transformation
 */

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { 
  Layers, Download, Eye, Code, FileJson, Network, Database, Sparkles, 
  ChevronDown, CheckCircle2, AlertCircle, BarChart3, BookOpen, EyeOff, ListFilter
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
import { useTranslation } from 'react-i18next';

type ViewMode = 'catalog' | 'relationships' | 'validation' | 'graph' | 'jsonld' | 'turtle';
type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';

const FIELD_TEMPLATES_KEY = "msv2-field-templates";

interface FieldTemplate {
  id: string;
  name: string;
  hiddenFields: string[];
  entityType: string;
  createdAt: string;
}

export default function MoonSandV2() {
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
  const [recordId, setRecordId] = useState<string | null>(null);
  const [recordTitle, setRecordTitle] = useState('Untitled Record');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('unsaved');

  // Viewer Dialog State
  const [showRecordViewer, setShowRecordViewer] = useState(false);

  // ===== HIDDEN FIELDS & TEMPLATES =====
  const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set());
  const [showFieldManager, setShowFieldManager] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [showLoadTemplateDialog, setShowLoadTemplateDialog] = useState(false);
  const [savedFieldTemplates, setSavedFieldTemplates] = useState<FieldTemplate[]>(() => {
    try { return JSON.parse(localStorage.getItem(FIELD_TEMPLATES_KEY) || "[]"); } catch { return []; }
  });
  const [templateName, setTemplateName] = useState('');

  const hideField = useCallback((fieldKey: string) => {
    setHiddenFields(prev => {
      const next = new Set(prev);
      next.add(fieldKey);
      return next;
    });
    setSaveStatus('unsaved');
  }, []);

  const restoreField = useCallback((fieldKey: string) => {
    setHiddenFields(prev => {
      const next = new Set(prev);
      next.delete(fieldKey);
      return next;
    });
    setSaveStatus('unsaved');
  }, []);

  const restoreAllFields = useCallback(() => {
    setHiddenFields(new Set());
    setSaveStatus('unsaved');
  }, []);

  const persistFieldTemplates = useCallback((templates: FieldTemplate[]) => {
    setSavedFieldTemplates(templates);
    localStorage.setItem(FIELD_TEMPLATES_KEY, JSON.stringify(templates));
  }, []);

  const saveFieldTemplate = useCallback(() => {
    if (!templateName.trim()) return;
    const template: FieldTemplate = {
      id: `tmpl-${Date.now()}`,
      name: templateName.trim(),
      hiddenFields: Array.from(hiddenFields),
      entityType: 'All',
      createdAt: new Date().toISOString(),
    };
    persistFieldTemplates([...savedFieldTemplates, template]);
    setTemplateName('');
    setShowSaveTemplateDialog(false);
  }, [templateName, hiddenFields, savedFieldTemplates, persistFieldTemplates]);

  const loadFieldTemplate = useCallback((template: FieldTemplate) => {
    setHiddenFields(new Set(template.hiddenFields));
    setShowLoadTemplateDialog(false);
    setSaveStatus('unsaved');
  }, []);

  const deleteFieldTemplate = useCallback((id: string) => {
    persistFieldTemplates(savedFieldTemplates.filter(t => t.id !== id));
  }, [savedFieldTemplates, persistFieldTemplates]);

  // Auto-load last used template on startup
  useEffect(() => {
    const lastTemplate = localStorage.getItem('msv2-last-template');
    if (lastTemplate) {
      try {
        const template = JSON.parse(lastTemplate);
        if (template.hiddenFields && Array.isArray(template.hiddenFields)) {
          setHiddenFields(new Set(template.hiddenFields));
        }
      } catch { /* ignore */ }
    }
  }, []);

  // Persist current hidden fields as last used
  useEffect(() => {
    if (hiddenFields.size > 0) {
      localStorage.setItem('msv2-last-template', JSON.stringify({
        hiddenFields: Array.from(hiddenFields),
      }));
    } else {
      localStorage.removeItem('msv2-last-template');
    }
  }, [hiddenFields]);

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
            {/* Field Customization Toolbar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ListFilter className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-gray-700">{t('fieldCustomization')}</span>
                  {hiddenFields.size > 0 && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                      {hiddenFields.size} {t('fieldsHidden')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hiddenFields.size > 0 && (
                    <>
                      <button
                        onClick={() => setShowFieldManager(!showFieldManager)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold flex items-center gap-1"
                      >
                        <EyeOff className="h-4 w-4" />
                        {t('hiddenFields')} ({hiddenFields.size})
                      </button>
                      <button
                        onClick={restoreAllFields}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold"
                      >
                        {t('restoreAll')}
                      </button>
                      <button
                        onClick={() => setShowSaveTemplateDialog(true)}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold"
                      >
                        {t('saveAsTemplate')}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowLoadTemplateDialog(!showLoadTemplateDialog)}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold"
                  >
                    {t('savedTemplates')} ({savedFieldTemplates.length})
                  </button>
                </div>
              </div>

              {/* Hidden Fields List */}
              {showFieldManager && hiddenFields.size > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {Array.from(hiddenFields).map(field => (
                      <button
                        key={field}
                        onClick={() => restoreField(field)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        {field.replace('registry:', '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Template Dialog */}
              {showSaveTemplateDialog && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder={t('templateNamePlaceholder')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={saveFieldTemplate}
                      disabled={!templateName.trim()}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-semibold"
                    >
                      {t('saveTemplate')}
                    </button>
                    <button
                      onClick={() => setShowSaveTemplateDialog(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Load Template Dialog */}
              {showLoadTemplateDialog && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {savedFieldTemplates.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">{t('noSavedTemplates')}</p>
                  ) : (
                    <div className="space-y-2">
                      {savedFieldTemplates.map(tmpl => (
                        <div key={tmpl.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-semibold text-gray-800">{tmpl.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({tmpl.hiddenFields.length} {t('fieldsHidden')})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => loadFieldTemplate(tmpl)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                            >
                              {t('applyTemplate')}
                            </button>
                            <button
                              onClick={() => deleteFieldTemplate(tmpl.id)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold"
                            >
                              {t('deleteTemplate')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Work */}
            <EntitySection title={t('work')} icon={<Database className="h-6 w-6 text-blue-600" />} uri={workUri}>
              <OntologyDrivenFormRenderer
                entityType="Work"
                nodeUri={workUri}
                graphStore={graphStore}
                onChange={handlePropertyChange}
                hiddenFields={hiddenFields}
                onHideField={hideField}
              />
            </EntitySection>

            {/* Expression */}
            {enableExpression && (
              <EntitySection title={t('expression')} icon={<Sparkles className="h-6 w-6 text-purple-600" />} uri={expressionUri}>
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

            {/* Instance */}
            <EntitySection title={t('instance')} icon={<Database className="h-6 w-6 text-green-600" />} uri={instanceUri}>
              <OntologyDrivenFormRenderer
                entityType="Instance"
                nodeUri={instanceUri}
                graphStore={graphStore}
                onChange={handlePropertyChange}
                hiddenFields={hiddenFields}
                onHideField={hideField}
              />
            </EntitySection>

            {/* Item */}
            <EntitySection title={t('item')} icon={<Database className="h-6 w-6 text-orange-600" />} uri={itemUri}>
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