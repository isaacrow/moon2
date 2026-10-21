// Multi-View Record Component - Marva-style Toggle
import { useState } from 'react';
import { FileText, Network, Database, Code, Braces } from 'lucide-react';
import type { ViewMode, RecordData } from './types';
import { MarcView } from './MarcView';
import { RdfView } from './RdfView';
import { AuthorityGraph } from '../AuthorityGraph';

interface MultiViewRecordProps {
  data: RecordData;
  formView: React.ReactNode;
  authorityNodes?: any[];
}

export function MultiViewRecord({ data, formView, authorityNodes = [] }: MultiViewRecordProps) {
  const [mode, setMode] = useState<ViewMode>('FORM');

  return (
    <div className="flex flex-col h-full">
      {/* View Mode Toolbar */}
      <div className="bg-white border-b shadow-sm">
        <div className="flex items-center gap-1 p-2">
          <ViewButton
            active={mode === 'FORM'}
            onClick={() => setMode('FORM')}
            icon={<FileText className="w-4 h-4" />}
            label="Form"
          />
          <ViewButton
            active={mode === 'GRAPH'}
            onClick={() => setMode('GRAPH')}
            icon={<Network className="w-4 h-4" />}
            label="Graph"
          />
          <ViewButton
            active={mode === 'MARC'}
            onClick={() => setMode('MARC')}
            icon={<Database className="w-4 h-4" />}
            label="MARC"
          />
          <ViewButton
            active={mode === 'RDF'}
            onClick={() => setMode('RDF')}
            icon={<Code className="w-4 h-4" />}
            label="RDF"
          />
          <ViewButton
            active={mode === 'JSON'}
            onClick={() => setMode('JSON')}
            icon={<Braces className="w-4 h-4" />}
            label="JSON"
          />

          <div className="ml-auto text-xs text-gray-500 px-3">
            Viewing as: <span className="font-semibold text-gray-700">{mode}</span>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'FORM' && (
          <div className="h-full overflow-auto">
            {formView}
          </div>
        )}

        {mode === 'GRAPH' && (
          <div className="h-full p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Authority Graph</h2>
              <AuthorityGraph nodes={authorityNodes} />
            </div>
          </div>
        )}

        {mode === 'MARC' && <MarcView data={data} />}

        {mode === 'RDF' && <RdfView data={data} />}

        {mode === 'JSON' && (
          <div className="h-full overflow-auto bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border">
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4">
                <h2 className="text-xl font-semibold">JSON View</h2>
                <p className="text-sm text-green-100 mt-1">JavaScript Object Notation</p>
              </div>

              <div className="p-6">
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm leading-relaxed font-mono">
                  <code>{JSON.stringify({ work: data.work, instance: data.instance, admin: data.admin }, null, 2)}</code>
                </pre>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Raw BIBFRAME data structure
                </p>
                <button 
                  onClick={async () => {
                    try {
                      const text = JSON.stringify({ work: data.work, instance: data.instance, admin: data.admin }, null, 2);
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(text);
                      } else {
                        // Fallback
                        const textarea = document.createElement('textarea');
                        textarea.value = text;
                        textarea.style.position = 'fixed';
                        textarea.style.opacity = '0';
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                      }
                    } catch (err) {
                      console.error('Copy failed:', err);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Copy JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ViewButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function ViewButton({ active, onClick, icon, label }: ViewButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all
        ${active 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
