/**
 * 🏖️ MOON SAND - Complete BIBFRAME Cataloging Sandbox
 * 100+ Fields | Expression Modeling | Relationships | AdminMetadata
 * Dynamic Template-Driven Interface
 */

"use client";
import React, { useState, useEffect } from "react";
import { 
  Layers, Download, Eye, Code, FileJson, Save, Settings, 
  Network, Database, Sparkles, ChevronDown, CheckCircle2, AlertCircle, BookOpen
} from "lucide-react";
import { 
  CatalogingTemplate, 
  getTemplate, 
  getTemplateNames,
  MONOGRAPH_COMPLETE_TEMPLATE 
} from "../../services/templateEngine";
import { DynamicFormRenderer } from "./cataloging/DynamicFormRenderer";
import { RelationshipGraph, Relationship, generateRelationshipId, RELATIONSHIP_DEFINITIONS, RelationshipType } from "../../services/relationshipManager";
import { toTurtle, toJsonLd, generateUri } from "../../services/rdfGraphBuilder";
import { validateBibframeRecord, ValidationResult } from "../../services/bibframeValidator";
import * as recordAPI from "../../services/recordPersistence";
import { RecordViewerDialog } from "./cataloging/RecordViewerDialog";

type ViewMode = 'catalog' | 'relationships' | 'admin' | 'preview' | 'jsonld' | 'turtle';
type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';

export default function MoonSand() {
  /* ============================= STATE ============================= */

  const [viewMode, setViewMode] = useState<ViewMode>('catalog');
  const [selectedTemplate, setSelectedTemplate] = useState<CatalogingTemplate>(MONOGRAPH_COMPLETE_TEMPLATE);
  const [enableExpression, setEnableExpression] = useState(false);
  
  // Entity URIs
  const [workUri] = useState(generateUri('work'));
  const [expressionUri] = useState(generateUri('expression'));
  const [instanceUri] = useState(generateUri('instance'));
  const [itemUri] = useState(generateUri('item'));

  // Entity Data
  const [workData, setWorkData] = useState<Record<string, any>>({});
  const [expressionData, setExpressionData] = useState<Record<string, any>>({});
  const [instanceData, setInstanceData] = useState<Record<string, any>>({});
  const [itemData, setItemData] = useState<Record<string, any>>({});
  const [adminMetadata, setAdminMetadata] = useState<Record<string, any>>({
    'bf:creationDate': new Date().toISOString(),
    'bf:changeDate': new Date().toISOString(),
    'bf:descriptionConventions': 'RDA'
  });

  // Relationships
  const [relationshipGraph] = useState(new RelationshipGraph());
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  // Output
  const [jsonld, setJsonld] = useState<any>(null);
  const [turtle, setTurtle] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // Persistence State
  const [recordId, setRecordId] = useState<string | null>(null);
  const [recordTitle, setRecordTitle] = useState('Untitled Record');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('unsaved');

  // Viewer Dialog State
  const [showRecordViewer, setShowRecordViewer] = useState(false);

  /* ============================= GRAPH BUILDER ============================= */

  const buildGraph = (): any => {
    const graph: any[] = [];

    // WORK
    const work: any = {
      '@id': workUri,
      '@type': 'bf:Work'
    };

    // Add work properties from workData
    Object.entries(workData).forEach(([prop, value]) => {
      if (!value) return;
      
      if (prop === 'bf:title' && value.mainTitle) {
        work['bf:title'] = {
          '@type': 'bf:Title',
          'bf:mainTitle': [{ '@value': value.mainTitle }]
        };
        if (value.subtitle) {
          work['bf:title']['bf:subtitle'] = [{ '@value': value.subtitle }];
        }
      } else if (prop === 'bf:contribution' && Array.isArray(value)) {
        work['bf:contribution'] = value
          .filter(c => c.agent)
          .map(c => ({
            '@type': 'bf:Contribution',
            'bf:agent': { '@id': c.agent.uri },
            'bf:role': { '@id': `http://id.loc.gov/vocabulary/relators/${c.role}` }
          }));
      } else if (prop === 'bf:language' && value.uri) {
        work['bf:language'] = { '@id': value.uri };
      } else if (prop === 'bf:subject' && Array.isArray(value)) {
        work['bf:subject'] = value.map(s => ({ '@id': s.uri }));
      } else if (prop === 'bf:classification' && value) {
        work['bf:classification'] = {
          '@type': 'bf:Classification',
          'bf:classificationPortion': value.number,
          'bf:source': { '@id': value.scheme }
        };
      } else if (value && typeof value === 'object' && value.uri) {
        work[prop] = { '@id': value.uri };
      } else if (value && typeof value === 'string') {
        work[prop] = value;
      }
    });

    // Link to Expression or Instance
    if (enableExpression) {
      work['bf:hasExpression'] = { '@id': expressionUri };
    } else {
      work['bf:hasInstance'] = { '@id': instanceUri };
    }

    graph.push(work);

    // EXPRESSION (if enabled)
    if (enableExpression) {
      const expression: any = {
        '@id': expressionUri,
        '@type': 'bf:Expression',
        'bf:expressionOf': { '@id': workUri },
        'bf:hasInstance': { '@id': instanceUri }
      };

      Object.entries(expressionData).forEach(([prop, value]) => {
        if (!value) return;
        
        if (prop === 'bf:language' && value.uri) {
          expression['bf:language'] = { '@id': value.uri };
        } else if (prop === 'bf:contribution' && Array.isArray(value)) {
          expression['bf:contribution'] = value
            .filter(c => c.agent)
            .map(c => ({
              '@type': 'bf:Contribution',
              'bf:agent': { '@id': c.agent.uri },
              'bf:role': { '@id': `http://id.loc.gov/vocabulary/relators/${c.role}` }
            }));
        } else if (value && typeof value === 'object' && value.uri) {
          expression[prop] = { '@id': value.uri };
        } else if (value) {
          expression[prop] = value;
        }
      });

      graph.push(expression);
    }

    // INSTANCE
    const instance: any = {
      '@id': instanceUri,
      '@type': 'bf:Instance',
      'bf:instanceOf': { '@id': enableExpression ? expressionUri : workUri }
    };

    Object.entries(instanceData).forEach(([prop, value]) => {
      if (!value) return;
      
      if (prop === 'bf:title' && value.mainTitle) {
        instance['bf:title'] = {
          '@type': 'bf:Title',
          'bf:mainTitle': [{ '@value': value.mainTitle }]
        };
        if (value.subtitle) {
          instance['bf:title']['bf:subtitle'] = [{ '@value': value.subtitle }];
        }
      } else if (prop === 'bf:identifiedBy' && Array.isArray(value)) {
        instance['bf:identifiedBy'] = value
          .filter(id => id.value)
          .map(id => ({
            '@type': `bf:${id.type}`,
            'rdf:value': id.value
          }));
      } else if (prop === 'bf:provisionActivity' && value) {
        instance['bf:provisionActivity'] = {
          '@type': 'bf:Publication',
          'bf:place': { '@id': value.place?.uri || 'http://id.loc.gov/vocabulary/countries/xxu' },
          'bf:agent': { '@id': value.publisher?.uri || generateUri('organization') },
          'bf:date': { '@value': value.date || new Date().getFullYear().toString(), '@type': 'xsd:gYear' }
        };
      } else if (prop === 'bf:carrier' && value.uri) {
        instance['bf:carrier'] = { '@id': value.uri };
      } else if (prop === 'bf:media' && value.uri) {
        instance['bf:media'] = { '@id': value.uri };
      } else if (value && typeof value === 'object' && value.uri) {
        instance[prop] = { '@id': value.uri };
      } else if (value) {
        instance[prop] = value;
      }
    });

    instance['bf:hasItem'] = { '@id': itemUri };
    graph.push(instance);

    // ITEM
    const item: any = {
      '@id': itemUri,
      '@type': 'bf:Item',
      'bf:itemOf': { '@id': instanceUri }
    };

    Object.entries(itemData).forEach(([prop, value]) => {
      if (!value) return;
      
      if (value && typeof value === 'object' && value.uri) {
        item[prop] = { '@id': value.uri };
      } else if (value) {
        item[prop] = value;
      }
    });

    graph.push(item);

    // Add relationships
    relationshipGraph.addToJsonLdGraph(graph, relationships);

    // Add AdminMetadata to Work
    const workNode = graph.find(n => n['@id'] === workUri);
    if (workNode && Object.keys(adminMetadata).length > 0) {
      workNode['bf:adminMetadata'] = {
        '@type': 'bf:AdminMetadata',
        ...adminMetadata
      };
    }

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
        setTurtle('');
      }

      // Update change date
      setAdminMetadata(prev => ({
        ...prev,
        'bf:changeDate': new Date().toISOString()
      }));
    } catch (error) {
      console.error('RDF generation error:', error);
    }
  };

  // Auto-generate on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (workData['bf:title']?.mainTitle) {
        generateRDF();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [workData, expressionData, instanceData, itemData, relationships, adminMetadata, enableExpression]);

  /* ============================= TEMPLATE SELECTION ============================= */

  const handleTemplateChange = (templateId: string) => {
    const template = getTemplate(templateId);
    if (template) {
      setSelectedTemplate(template);
      setEnableExpression(template.enableExpression || false);
      // Clear data when switching templates
      setWorkData({});
      setExpressionData({});
      setInstanceData({});
      setItemData({});
      setSaveStatus('unsaved');
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
  };

  const removeRelationship = (id: string) => {
    setRelationships(prev => prev.filter(rel => rel.id !== id));
    setSaveStatus('unsaved');
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
    a.download = `bibframe-${selectedTemplate.id}.${format === 'turtle' ? 'ttl' : 'jsonld'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ============================= RENDER HELPERS ============================= */

  const getSaveStatusBadge = () => {
    const badges = {
      saved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle2 className="h-4 w-4" />, label: 'Saved' },
      unsaved: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <AlertCircle className="h-4 w-4" />, label: 'Unsaved' },
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
              <p className="text-gray-600">100+ Fields • Expression Layer • Relationships • AdminMetadata</p>
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

          {/* Template Selector */}
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-semibold text-gray-700">Template:</label>
            <select
              value={selectedTemplate.id}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {getTemplateNames().map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            {selectedTemplate.enableExpression && (
              <label className="flex items-center gap-2 ml-4">
                <input
                  type="checkbox"
                  checked={enableExpression}
                  onChange={(e) => setEnableExpression(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-semibold text-gray-700">Enable Expression Layer</span>
              </label>
            )}
          </div>

          {/* Validation */}
          {validation && (
            <div className={`p-4 rounded-lg ${validation.valid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
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
            <ViewTab icon={<Database />} label="Work" active={viewMode === 'catalog'} onClick={() => setViewMode('catalog')} />
            <ViewTab icon={<Network />} label="Relationships" active={viewMode === 'relationships'} onClick={() => setViewMode('relationships')} />
            <ViewTab icon={<Settings />} label="Admin" active={viewMode === 'admin'} onClick={() => setViewMode('admin')} />
            <ViewTab icon={<Eye />} label="Preview" active={viewMode === 'preview'} onClick={() => setViewMode('preview')} />
            <ViewTab icon={<FileJson />} label="JSON-LD" active={viewMode === 'jsonld'} onClick={() => setViewMode('jsonld')} />
            <ViewTab icon={<Code />} label="Turtle" active={viewMode === 'turtle'} onClick={() => setViewMode('turtle')} />
          </div>
        </div>

        {/* Content */}
        {viewMode === 'catalog' && (
          <div className="space-y-6">
            {/* Work */}
            <EntitySection title="Work" icon={<Database className="h-6 w-6 text-blue-600" />}>
              {selectedTemplate.entities.work && (
                <DynamicFormRenderer
                  sections={selectedTemplate.entities.work}
                  data={workData}
                  onChange={(field, value) => {
                    setWorkData(prev => ({ ...prev, [field]: value }));
                    setSaveStatus('unsaved');
                  }}
                />
              )}
            </EntitySection>

            {/* Expression */}
            {enableExpression && selectedTemplate.entities.expression && (
              <EntitySection title="Expression" icon={<Sparkles className="h-6 w-6 text-purple-600" />}>
                <DynamicFormRenderer
                  sections={selectedTemplate.entities.expression}
                  data={expressionData}
                  onChange={(field, value) => {
                    setExpressionData(prev => ({ ...prev, [field]: value }));
                    setSaveStatus('unsaved');
                  }}
                />
              </EntitySection>
            )}

            {/* Instance */}
            {selectedTemplate.entities.instance && (
              <EntitySection title="Instance" icon={<Database className="h-6 w-6 text-green-600" />}>
                <DynamicFormRenderer
                  sections={selectedTemplate.entities.instance}
                  data={instanceData}
                  onChange={(field, value) => {
                    setInstanceData(prev => ({ ...prev, [field]: value }));
                    setSaveStatus('unsaved');
                  }}
                />
              </EntitySection>
            )}

            {/* Item */}
            {selectedTemplate.entities.item && (
              <EntitySection title="Item" icon={<Database className="h-6 w-6 text-orange-600" />}>
                <DynamicFormRenderer
                  sections={selectedTemplate.entities.item}
                  data={itemData}
                  onChange={(field, value) => {
                    setItemData(prev => ({ ...prev, [field]: value }));
                    setSaveStatus('unsaved');
                  }}
                />
              </EntitySection>
            )}
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

        {viewMode === 'admin' && (
          <AdminMetadataView data={adminMetadata} onChange={setAdminMetadata} />
        )}

        {viewMode === 'preview' && (
          <PreviewView workData={workData} instanceData={instanceData} itemData={itemData} />
        )}

        {viewMode === 'jsonld' && (
          <CodeView title="JSON-LD" content={jsonld ? JSON.stringify(jsonld, null, 2) : 'Configure the record...'} />
        )}

        {viewMode === 'turtle' && (
          <CodeView title="Turtle RDF" content={turtle || 'Configure the record...'} />
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

function EntitySection({ title, icon, children }: any) {
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
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
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
        <h2 className="text-2xl font-bold text-gray-900">Relationships</h2>
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
                <input
                  type="text"
                  value={rel.label || ''}
                  onChange={(e) => onUpdate(rel.id, 'label', e.target.value)}
                  placeholder="Label (optional)"
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

function AdminMetadataView({ data, onChange }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Administrative Metadata</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Creation Date</label>
          <input
            type="datetime-local"
            value={data['bf:creationDate']?.substring(0, 16) || ''}
            onChange={(e) => onChange({ ...data, 'bf:creationDate': new Date(e.target.value).toISOString() })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Last Modified</label>
          <input
            type="datetime-local"
            value={data['bf:changeDate']?.substring(0, 16) || ''}
            onChange={(e) => onChange({ ...data, 'bf:changeDate': new Date(e.target.value).toISOString() })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Cataloging Source</label>
          <input
            type="text"
            value={data['bf:source'] || ''}
            onChange={(e) => onChange({ ...data, 'bf:source': e.target.value })}
            placeholder="Institution URI"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description Conventions</label>
          <select
            value={data['bf:descriptionConventions'] || 'RDA'}
            onChange={(e) => onChange({ ...data, 'bf:descriptionConventions': e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          >
            <option value="RDA">RDA</option>
            <option value="AACR2">AACR2</option>
            <option value="DACS">DACS</option>
            <option value="ISBD">ISBD</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function PreviewView({ workData, instanceData, itemData }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Preview</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-3xl font-bold text-gray-900">{workData['bf:title']?.mainTitle || 'Untitled'}</h3>
          {workData['bf:title']?.subtitle && (
            <p className="text-xl text-gray-600 mt-2">{workData['bf:title'].subtitle}</p>
          )}
        </div>

        {workData['bf:contribution'] && Array.isArray(workData['bf:contribution']) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Contributors</h4>
            <div className="space-y-1">
              {workData['bf:contribution'].filter((c: any) => c.agent).map((c: any, i: number) => (
                <div key={i} className="text-lg text-gray-800">
                  {c.agent.label} ({c.role})
                </div>
              ))}
            </div>
          </div>
        )}

        {instanceData['bf:provisionActivity'] && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Publication</h4>
            <p className="text-gray-800">
              {instanceData['bf:provisionActivity'].publisher?.label} ({instanceData['bf:provisionActivity'].date})
            </p>
          </div>
        )}

        {itemData['bf:shelfMark'] && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Holdings</h4>
            <p className="text-gray-800">Call Number: {itemData['bf:shelfMark']}</p>
          </div>
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
