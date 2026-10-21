/**
 * 🔍 SPARQL QUERY INTERFACE
 * Execute SPARQL queries against triple stores
 */

import React, { useState } from 'react';
import { Play, Database, Code, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface TripleStoreConfig {
  type: 'fuseki' | 'blazegraph' | 'graphdb';
  endpoint: string;
  updateEndpoint?: string;
  auth?: {
    username: string;
    password: string;
  };
}

const EXAMPLE_QUERIES = {
  listWorks: `PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>

SELECT ?work ?title
WHERE {
  ?work a bf:Work .
  ?work bf:title ?titleNode .
  ?titleNode bf:mainTitle ?title .
}
LIMIT 100`,

  findByAuthor: `PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?work ?title ?author
WHERE {
  ?work a bf:Work .
  ?work bf:contribution ?contribution .
  ?contribution bf:agent ?agent .
  ?agent rdfs:label ?author .
  FILTER(CONTAINS(LCASE(?author), LCASE("shakespeare")))
  
  ?work bf:title ?titleNode .
  ?titleNode bf:mainTitle ?title .
}`,

  countByType: `PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>

SELECT ?type (COUNT(?s) as ?count)
WHERE {
  ?s a ?type .
  FILTER(STRSTARTS(STR(?type), "http://id.loc.gov/ontologies/bibframe/"))
}
GROUP BY ?type
ORDER BY DESC(?count)`
};

export function SparqlInterface() {
  const [config, setConfig] = useState<TripleStoreConfig>({
    type: 'fuseki',
    endpoint: 'http://localhost:3030/moon/sparql',
    updateEndpoint: 'http://localhost:3030/moon/update'
  });
  
  const [query, setQuery] = useState(EXAMPLE_QUERIES.listWorks);
  const [results, setResults] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = async () => {
    setExecuting(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon/sparql/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ query, config })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Query failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('SPARQL query error:', err);
      setError(err instanceof Error ? err.message : 'Query failed');
    } finally {
      setExecuting(false);
    }
  };

  const loadExample = (exampleKey: keyof typeof EXAMPLE_QUERIES) => {
    setQuery(EXAMPLE_QUERIES[exampleKey]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
            🔍 SPARQL Query Interface
          </h1>
          <p className="text-gray-300">
            Query linked data from triple stores (Fuseki, Blazegraph, GraphDB)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Database className="h-5 w-5" />
                Triple Store Config
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={config.type}
                    onChange={(e) => setConfig({ ...config, type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fuseki">Apache Jena Fuseki</option>
                    <option value="blazegraph">Blazegraph</option>
                    <option value="graphdb">GraphDB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    SPARQL Endpoint
                  </label>
                  <input
                    type="text"
                    value={config.endpoint}
                    onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="http://localhost:3030/moon/sparql"
                  />
                </div>

                {config.type === 'fuseki' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Update Endpoint
                    </label>
                    <input
                      type="text"
                      value={config.updateEndpoint || ''}
                      onChange={(e) => setConfig({ ...config, updateEndpoint: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="http://localhost:3030/moon/update"
                    />
                  </div>
                )}

                <div className="border-t border-slate-600 pt-4">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Authentication (Optional)
                  </label>
                  <input
                    type="text"
                    value={config.auth?.username || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      auth: { 
                        username: e.target.value, 
                        password: config.auth?.password || '' 
                      } 
                    })}
                    className="w-full px-4 py-2 mb-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Username"
                  />
                  <input
                    type="password"
                    value={config.auth?.password || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      auth: { 
                        username: config.auth?.username || '', 
                        password: e.target.value 
                      } 
                    })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>

            {/* Example Queries */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Example Queries</h2>
              <div className="space-y-2">
                <button
                  onClick={() => loadExample('listWorks')}
                  className="w-full text-left px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white transition-all"
                >
                  <div className="font-semibold mb-1">List All Works</div>
                  <div className="text-xs text-gray-400">Get all bf:Work entities</div>
                </button>
                <button
                  onClick={() => loadExample('findByAuthor')}
                  className="w-full text-left px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white transition-all"
                >
                  <div className="font-semibold mb-1">Find by Author</div>
                  <div className="text-xs text-gray-400">Search works by contributor</div>
                </button>
                <button
                  onClick={() => loadExample('countByType')}
                  className="w-full text-left px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white transition-all"
                >
                  <div className="font-semibold mb-1">Count by Type</div>
                  <div className="text-xs text-gray-400">Statistics by entity type</div>
                </button>
              </div>
            </div>
          </div>

          {/* Query & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Query Editor */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  SPARQL Query
                </h2>
                <button
                  onClick={executeQuery}
                  disabled={executing}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {executing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Execute
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-[300px] px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-green-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                spellCheck={false}
              />
            </div>

            {/* Results */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Query Results</h2>
                {results && (
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'sparql-results.json';
                      a.click();
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download JSON
                  </button>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-600/20 border border-red-500 rounded-lg flex items-start gap-3 mb-4">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-300 mb-1">Query Error</div>
                    <div className="text-sm text-red-200">{error}</div>
                  </div>
                </div>
              )}

              {results && !error && (
                <div>
                  <div className="mb-4 p-3 bg-green-600/20 border border-green-500 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span className="text-green-300">
                      Query successful • {results.results?.bindings?.length || 0} results
                    </span>
                  </div>

                  {/* Table View */}
                  {results.results?.bindings && results.results.bindings.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-600">
                            {results.head.vars.map((variable: string) => (
                              <th key={variable} className="px-4 py-2 text-left text-gray-300 font-semibold">
                                ?{variable}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {results.results.bindings.map((binding: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/30">
                              {results.head.vars.map((variable: string) => (
                                <td key={variable} className="px-4 py-3 text-gray-300">
                                  {binding[variable] ? (
                                    <div>
                                      <div className="text-white">
                                        {binding[variable].value}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {binding[variable].type}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-600">-</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* JSON View */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-blue-400 hover:text-blue-300 font-semibold mb-2">
                      View Raw JSON
                    </summary>
                    <pre className="p-4 bg-slate-900 rounded-lg text-green-400 text-xs overflow-auto max-h-[400px]">
                      {JSON.stringify(results, null, 2)}
                    </pre>
                  </details>
                </div>
              )}

              {!results && !error && (
                <div className="text-center py-12 text-gray-400">
                  <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Execute a SPARQL query to see results</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="glass-card p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Triple Store Integration Setup</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">1. Apache Jena Fuseki</h3>
              <pre className="p-4 bg-slate-900 rounded-lg text-gray-300 text-sm overflow-x-auto">
{`# Download Fuseki
wget https://downloads.apache.org/jena/binaries/apache-jena-fuseki-4.x.x.tar.gz
tar -xzf apache-jena-fuseki-4.x.x.tar.gz
cd apache-jena-fuseki-4.x.x

# Create dataset
./fuseki-server --mem /moon

# Endpoint: http://localhost:3030/moon/sparql`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-3">2. Blazegraph</h3>
              <pre className="p-4 bg-slate-900 rounded-lg text-gray-300 text-sm overflow-x-auto">
{`# Download Blazegraph
wget https://github.com/blazegraph/database/releases/download/BLAZEGRAPH_2_1_6_RC/blazegraph.jar

# Run
java -server -Xmx4g -jar blazegraph.jar

# Endpoint: http://localhost:9999/blazegraph/sparql`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-3">3. GraphDB</h3>
              <pre className="p-4 bg-slate-900 rounded-lg text-gray-300 text-sm overflow-x-auto">
{`# Download GraphDB Free
# Visit: https://www.ontotext.com/products/graphdb/download/

# Create repository "moon"
# Endpoint: http://localhost:7200/repositories/moon`}
              </pre>
            </div>

            <div className="p-4 bg-blue-600/20 border border-blue-500 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Auto-Sync from MOON</h3>
              <p className="text-gray-300 mb-2">
                Configure MOON to automatically sync records to your triple store:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                <li>Set triple store config in MOON settings</li>
                <li>Enable "Auto-sync to triple store" option</li>
                <li>Every saved record will be uploaded as a named graph</li>
                <li>Query across all records using SPARQL</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}