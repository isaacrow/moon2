/**
 * 🌕 MOON ENGINE - Linked Data Cataloging Editor
 * Complete BIBFRAME 2.0 editor with multiple views
 */

import React, { useState, useEffect } from 'react';
import { Save, FileJson, Code, Network, FileText, Eye, AlertCircle, CheckCircle2, Download, Upload, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { RDFGraphVisualizer } from './RDFGraphVisualizer';

interface MoonRecord {
  id?: string;
  uri?: string;
  title?: string;
  document: any;
  metadata?: {
    created?: string;
    modified?: string;
    creator?: string;
    status?: 'draft' | 'published' | 'archived';
    version?: number;
  };
}

type ViewMode = 'form' | 'jsonld' | 'turtle' | 'graph' | 'preview';

export function MoonEngine() {
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [record, setRecord] = useState<MoonRecord | null>(null);
  const [document, setDocument] = useState<any>(null);
  const [jsonldText, setJsonldText] = useState('');
  const [turtleText, setTurtleText] = useState('');
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize with empty BIBFRAME document
  useEffect(() => {
    if (!document) {
      initializeNewDocument();
    }
  }, []);

  const initializeNewDocument = () => {
    const newDoc = {
      "@context": "https://id.loc.gov/ontologies/bibframe.jsonld",
      "@graph": [
        {
          "@id": `https://moon.org/work/${crypto.randomUUID()}`,
          "@type": "bf:Work",
          "bf:title": [{
            "@type": "bf:Title",
            "bf:mainTitle": [{ "@value": "" }]
          }],
          "bf:contribution": [],
          "bf:subject": [],
          "bf:hasInstance": [{ "@id": `https://moon.org/instance/${crypto.randomUUID()}` }]
        },
        {
          "@id": `https://moon.org/instance/${crypto.randomUUID()}`,
          "@type": "bf:Instance",
          "bf:title": [{
            "@type": "bf:Title",
            "bf:mainTitle": [{ "@value": "" }]
          }],
          "bf:identifiedBy": [],
          "bf:provisionActivity": []
        }
      ]
    };
    setDocument(newDoc);
    setJsonldText(JSON.stringify(newDoc, null, 2));
  };

  const validateDocument = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(document)
        }
      );

      const result = await response.json();
      
      // Ensure result has the expected structure
      const validationResult = {
        valid: result.valid || false,
        errors: Array.isArray(result.errors) ? result.errors : []
      };
      
      setValidation(validationResult);
      return validationResult;
    } catch (error) {
      console.error('Validation error:', error);
      const errorResult = { valid: false, errors: ['Validation failed'] };
      setValidation(errorResult);
      return errorResult;
    }
  };

  const saveRecord = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Validate first
      const val = await validateDocument();
      if (!val.valid) {
        const errorMsg = val.errors && Array.isArray(val.errors) && val.errors.length > 0
          ? val.errors.join(', ')
          : 'Unknown validation error';
        setMessage({ type: 'error', text: `Validation failed: ${errorMsg}` });
        setSaving(false);
        return;
      }

      // Save to MOON API
      const endpoint = record?.id 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/records/${record.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/records`;

      const response = await fetch(endpoint, {
        method: record?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          id: record?.id,
          document,
          metadata: {
            status: 'published',
            creator: 'cataloger'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save record');
      }

      const savedRecord = await response.json();
      setRecord(savedRecord);
      setMessage({ type: 'success', text: `Record saved: ${savedRecord.title}` });
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to save record' });
    } finally {
      setSaving(false);
    }
  };

  const loadTurtle = async () => {
    if (!record?.id) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/records/${record.id}/turtle`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      const turtle = await response.text();
      setTurtleText(turtle);
    } catch (error) {
      console.error('Load turtle error:', error);
    }
  };

  useEffect(() => {
    if (viewMode === 'turtle' && record?.id) {
      loadTurtle();
    }
  }, [viewMode, record?.id]);

  useEffect(() => {
    if (document) {
      setJsonldText(JSON.stringify(document, null, 2));
    }
  }, [document]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">MOON ENGINE</h1>
            <p className="text-gray-300">Linked Data Cataloging Editor</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={validateDocument}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
            >
              <CheckCircle2 className="h-5 w-5" />
              Validate
            </button>
            
            <button
              onClick={saveRecord}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {saving ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </div>

        {/* Validation Status */}
        {validation && (
          <div className={`mt-4 p-4 rounded-lg ${validation.valid ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
            <div className="flex items-start gap-2">
              {validation.valid ? (
                <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-white">
                  {validation.valid ? 'Valid JSON-LD Document' : 'Validation Errors'}
                </p>
                {!validation.valid && validation.errors && Array.isArray(validation.errors) && (
                  <ul className="mt-2 text-sm text-gray-300 list-disc list-inside">
                    {validation.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
            <p className="text-white">{message.text}</p>
          </div>
        )}
      </div>

      {/* View Tabs */}
      <div className="glass-card p-2 mb-6">
        <div className="flex gap-2">
          <ViewTab
            icon={<FileText className="h-4 w-4" />}
            label="Form View"
            active={viewMode === 'form'}
            onClick={() => setViewMode('form')}
          />
          <ViewTab
            icon={<FileJson className="h-4 w-4" />}
            label="JSON-LD"
            active={viewMode === 'jsonld'}
            onClick={() => setViewMode('jsonld')}
          />
          <ViewTab
            icon={<Code className="h-4 w-4" />}
            label="Turtle"
            active={viewMode === 'turtle'}
            onClick={() => setViewMode('turtle')}
          />
          <ViewTab
            icon={<Network className="h-4 w-4" />}
            label="Graph"
            active={viewMode === 'graph'}
            onClick={() => setViewMode('graph')}
          />
          <ViewTab
            icon={<Eye className="h-4 w-4" />}
            label="Preview"
            active={viewMode === 'preview'}
            onClick={() => setViewMode('preview')}
          />
        </div>
      </div>

      {/* View Content */}
      <div className="glass-card p-6">
        {viewMode === 'form' && <FormView document={document} setDocument={setDocument} />}
        {viewMode === 'jsonld' && <JSONLDView text={jsonldText} setText={setJsonldText} setDocument={setDocument} />}
        {viewMode === 'turtle' && <TurtleView text={turtleText} />}
        {viewMode === 'graph' && <GraphView document={document} recordId={record?.id} />}
        {viewMode === 'preview' && <PreviewView document={document} />}
      </div>
    </div>
  );
}

// View Tab Component
function ViewTab({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
        active 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Form View
function FormView({ document, setDocument }: { document: any; setDocument: (doc: any) => void }) {
  if (!document || !document['@graph']) {
    return <div className="text-gray-400">No document loaded</div>;
  }

  const workNode = document['@graph'].find((n: any) => n['@type'] === 'bf:Work');
  const instanceNode = document['@graph'].find((n: any) => n['@type'] === 'bf:Instance');

  const updateWorkTitle = (value: string) => {
    const newDoc = { ...document };
    const work = newDoc['@graph'].find((n: any) => n['@type'] === 'bf:Work');
    if (work && work['bf:title']?.[0]) {
      work['bf:title'][0]['bf:mainTitle'] = [{ "@value": value }];
    }
    setDocument(newDoc);
  };

  const updateInstanceTitle = (value: string) => {
    const newDoc = { ...document };
    const instance = newDoc['@graph'].find((n: any) => n['@type'] === 'bf:Instance');
    if (instance && instance['bf:title']?.[0]) {
      instance['bf:title'][0]['bf:mainTitle'] = [{ "@value": value }];
    }
    setDocument(newDoc);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-4">bf:Work</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Main Title</label>
            <input
              type="text"
              value={workNode?.['bf:title']?.[0]?.['bf:mainTitle']?.[0]?.['@value'] || ''}
              onChange={(e) => updateWorkTitle(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter work title..."
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4">bf:Instance</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Instance Title</label>
            <input
              type="text"
              value={instanceNode?.['bf:title']?.[0]?.['bf:mainTitle']?.[0]?.['@value'] || ''}
              onChange={(e) => updateInstanceTitle(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter instance title..."
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 This is a basic form view. Full cataloging interface with authority linking will be expanded in the complete implementation.
        </p>
      </div>
    </div>
  );
}

// JSON-LD View
function JSONLDView({ text, setText, setDocument }: { text: string; setText: (t: string) => void; setDocument: (doc: any) => void }) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (value: string) => {
    setText(value);
    setError(null);
    
    try {
      const parsed = JSON.parse(value);
      setDocument(parsed);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Editable JSON-LD</h3>
        {error && <span className="text-sm text-red-400">Invalid JSON: {error}</span>}
      </div>
      
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full h-[600px] px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-green-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        spellCheck={false}
      />
    </div>
  );
}

// Turtle View
function TurtleView({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">RDF Turtle Serialization</h3>
      
      <pre className="w-full h-[600px] px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-cyan-400 font-mono text-sm overflow-auto">
        {text || 'Save the record to generate Turtle output...'}
      </pre>
    </div>
  );
}

// Graph View - Real RDF Triple Visualization
function GraphView({ document, recordId }: { document: any; recordId?: string }) {
  const [triples, setTriples] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recordId) {
      loadTriples();
    }
  }, [recordId]);

  const loadTriples = async () => {
    if (!recordId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/records/${recordId}/triples`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load triples');
      }

      const data = await response.json();
      setTriples(data.triples || []);
    } catch (err) {
      console.error('Load triples error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load triples');
    } finally {
      setLoading(false);
    }
  };

  if (!document || !document['@graph']) {
    return <div className="text-gray-400">No graph data</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Extracting RDF triples...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center text-red-400">
          <p className="mb-4">{error}</p>
          <button 
            onClick={loadTriples}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">RDF Graph Visualization</h3>
        {triples.length > 0 && (
          <span className="text-sm text-gray-400">{triples.length} triples</span>
        )}
      </div>
      
      <RDFGraphVisualizer triples={triples} />
    </div>
  );
}

// Preview View
function PreviewView({ document }: { document: any }) {
  if (!document || !document['@graph']) {
    return <div className="text-gray-400">No document to preview</div>;
  }

  const workNode = document['@graph'].find((n: any) => n['@type'] === 'bf:Work');
  const instanceNode = document['@graph'].find((n: any) => n['@type'] === 'bf:Instance');

  const getTitle = (node: any) => {
    return node?.['bf:title']?.[0]?.['bf:mainTitle']?.[0]?.['@value'] || 'Untitled';
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white">Human-Readable Preview</h3>
      
      <div className="p-6 bg-slate-900 rounded-lg border border-slate-600">
        <h2 className="text-2xl font-black text-white mb-4">{getTitle(workNode)}</h2>
        
        <div className="space-y-4 text-gray-300">
          <div>
            <span className="font-semibold text-blue-300">Work URI:</span>
            <span className="ml-2 text-sm text-gray-400 font-mono">{workNode?.['@id']}</span>
          </div>
          
          <div>
            <span className="font-semibold text-blue-300">Instance URI:</span>
            <span className="ml-2 text-sm text-gray-400 font-mono">{instanceNode?.['@id']}</span>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <p className="text-sm text-gray-400">
              This preview shows a human-readable display of the BIBFRAME record. Additional fields will appear as they are added to the document.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoonEngine;