// RDF/Turtle View Component
import { useState } from 'react';
import type { RecordData } from './types';

interface RdfViewProps {
  data: RecordData;
}

export function RdfView({ data }: RdfViewProps) {
  const [format, setFormat] = useState<'turtle' | 'jsonld' | 'ntriples'>('turtle');

  const rdfContent = convertToRDF(data, format);

  return (
    <div className="h-full overflow-auto bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">RDF View</h2>
            <p className="text-sm text-purple-100 mt-1">Resource Description Framework</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFormat('turtle')}
              className={`px-3 py-1 rounded text-sm ${
                format === 'turtle' 
                  ? 'bg-white text-purple-700 font-semibold' 
                  : 'bg-purple-500 text-white hover:bg-purple-400'
              }`}
            >
              Turtle
            </button>
            <button
              onClick={() => setFormat('jsonld')}
              className={`px-3 py-1 rounded text-sm ${
                format === 'jsonld' 
                  ? 'bg-white text-purple-700 font-semibold' 
                  : 'bg-purple-500 text-white hover:bg-purple-400'
              }`}
            >
              JSON-LD
            </button>
            <button
              onClick={() => setFormat('ntriples')}
              className={`px-3 py-1 rounded text-sm ${
                format === 'ntriples' 
                  ? 'bg-white text-purple-700 font-semibold' 
                  : 'bg-purple-500 text-white hover:bg-purple-400'
              }`}
            >
              N-Triples
            </button>
          </div>
        </div>

        <div className="p-6">
          <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm leading-relaxed font-mono">
            <code>{rdfContent}</code>
          </pre>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Generated from BIBFRAME data • SPARQL-ready RDF output
          </p>
          <button 
            onClick={() => copyToClipboard(rdfContent)}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}

function convertToRDF(data: RecordData, format: 'turtle' | 'jsonld' | 'ntriples'): string {
  if (format === 'jsonld') {
    return convertToJSONLD(data);
  } else if (format === 'ntriples') {
    return convertToNTriples(data);
  } else {
    return convertToTurtle(data);
  }
}

function convertToTurtle(data: RecordData): string {
  const lines: string[] = [];

  // Prefixes
  lines.push('@prefix bf: <http://id.loc.gov/ontologies/bibframe/> .');
  lines.push('@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .');
  lines.push('@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .');
  lines.push('@prefix bflc: <http://id.loc.gov/ontologies/bflc/> .');
  lines.push('');

  // Work
  const workId = data.work?.['@id'] || `<http://example.org/work/${Date.now()}>`;
  lines.push(`${workId} a bf:Work ;`);

  const title = data.work?.['bf:title'] || data.work?.title;
  if (title) {
    const titleValue = typeof title === 'string' ? title : (title['@value'] || title.mainTitle || '');
    lines.push(`    bf:title "${titleValue}" ;`);
  }

  const creator = data.work?.['bf:creator'];
  if (creator?.['@id']) {
    lines.push(`    bf:creator <${creator['@id']}> ;`);
  }

  const subjects = data.work?.['bf:subject'];
  if (subjects) {
    const subjectArray = Array.isArray(subjects) ? subjects : [subjects];
    subjectArray.forEach(subject => {
      if (subject['@id']) {
        lines.push(`    bf:subject <${subject['@id']}> ;`);
      }
    });
  }

  lines.push(`    bf:hasInstance <${workId}/instance> .`);
  lines.push('');

  // Instance
  lines.push(`${workId}/instance a bf:Instance ;`);
  lines.push(`    bf:instanceOf ${workId} ;`);

  const extent = data.instance?.['bf:extent'];
  if (extent) {
    lines.push(`    bf:extent "${extent}" ;`);
  }

  lines.push(`    bf:adminMetadata <${workId}/admin> .`);
  lines.push('');

  // Admin Metadata
  lines.push(`${workId}/admin a bf:AdminMetadata ;`);
  lines.push(`    bf:creationDate "${data.admin?.creationDate || new Date().toISOString()}" ;`);
  lines.push(`    bf:status "${data.admin?.status || 'new'}" .`);

  return lines.join('\n');
}

function convertToJSONLD(data: RecordData): string {
  const graph = {
    '@context': {
      'bf': 'http://id.loc.gov/ontologies/bibframe/',
      'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
      'bflc': 'http://id.loc.gov/ontologies/bflc/'
    },
    '@graph': [
      {
        '@id': data.work?.['@id'] || `http://example.org/work/${Date.now()}`,
        '@type': 'bf:Work',
        ...data.work
      },
      {
        '@id': `${data.work?.['@id'] || 'http://example.org/work'}/instance`,
        '@type': 'bf:Instance',
        ...data.instance
      },
      {
        '@id': `${data.work?.['@id'] || 'http://example.org/work'}/admin`,
        '@type': 'bf:AdminMetadata',
        ...data.admin
      }
    ]
  };

  return JSON.stringify(graph, null, 2);
}

function convertToNTriples(data: RecordData): string {
  const lines: string[] = [];

  const workId = data.work?.['@id'] || `http://example.org/work/${Date.now()}`;
  
  lines.push(`<${workId}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://id.loc.gov/ontologies/bibframe/Work> .`);

  const title = data.work?.['bf:title'] || data.work?.title;
  if (title) {
    const titleValue = typeof title === 'string' ? title : (title['@value'] || '');
    lines.push(`<${workId}> <http://id.loc.gov/ontologies/bibframe/title> "${titleValue}" .`);
  }

  const creator = data.work?.['bf:creator'];
  if (creator?.['@id']) {
    lines.push(`<${workId}> <http://id.loc.gov/ontologies/bibframe/creator> <${creator['@id']}> .`);
  }

  return lines.join('\n');
}

async function copyToClipboard(text: string) {
  try {
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
}
