import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Server,
  Database,
  Link,
  Check,
  X,
  RefreshCw,
  Settings,
  BookOpen,
  Upload,
  Download,
  Search,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { FOLIOApiClient, initializeFOLIOClient, FOLIOInstance, FOLIOConfig } from '../services/folioApiClient';
import { BIBFRAMERecord } from '../types/bibframe';

interface FOLIOIntegrationProps {
  onBack?: () => void;
  currentRecord?: BIBFRAMERecord | null;
  onRecordImport?: (record: BIBFRAMERecord) => void;
}

export function FOLIOIntegration({ onBack, currentRecord, onRecordImport }: FOLIOIntegrationProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // FOLIO Connection State
  const [config, setConfig] = useState<FOLIOConfig>({
    okapiUrl: localStorage.getItem('folio_okapi_url') || 'https://folio-snapshot-okapi.dev.folio.org',
    tenant: localStorage.getItem('folio_tenant') || 'diku',
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [client, setClient] = useState<FOLIOApiClient | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FOLIOInstance[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  // Selected Instance
  const [selectedInstance, setSelectedInstance] = useState<FOLIOInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reference Data
  const [referenceData, setReferenceData] = useState<{
    instanceTypes?: any[];
    identifierTypes?: any[];
    locations?: any[];
  }>({});

  /**
   * Connect to FOLIO
   */
  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const folioClient = initializeFOLIOClient(config);
      
      if (username && password) {
        await folioClient.authenticate(username, password);
      }

      // Test connection by fetching instance types
      const instanceTypes = await folioClient.getReferenceData('instance-types');
      
      setClient(folioClient);
      setIsConnected(true);
      setReferenceData({ instanceTypes: instanceTypes.instanceTypes || [] });

      // Save config
      localStorage.setItem('folio_okapi_url', config.okapiUrl);
      localStorage.setItem('folio_tenant', config.tenant);
    } catch (error: any) {
      setConnectionError(error.message);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect from FOLIO
   */
  const handleDisconnect = () => {
    setClient(null);
    setIsConnected(false);
    setSearchResults([]);
    setSelectedInstance(null);
  };

  /**
   * Search FOLIO instances
   */
  const handleSearch = async () => {
    if (!client || !searchQuery) return;

    setIsSearching(true);
    try {
      // Build CQL query
      const cql = `title="${searchQuery}*" or contributors="${searchQuery}*"`;
      const result = await client.searchInstances(cql, 50);
      
      setSearchResults(result.instances || []);
      setTotalRecords(result.totalRecords || 0);
    } catch (error: any) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Export current Moon record to FOLIO
   */
  const handleExportToFOLIO = async () => {
    if (!client || !currentRecord) return;

    setIsLoading(true);
    try {
      const folioInstance = client.bibframeToFOLIOInstance(currentRecord);
      const created = await client.createInstance(folioInstance);
      
      alert(`Successfully exported to FOLIO!\nInstance ID: ${created.id}`);
    } catch (error: any) {
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Import FOLIO instance to Moon
   */
  const handleImportFromFOLIO = async (instance: FOLIOInstance) => {
    if (!client) return;

    setIsLoading(true);
    try {
      const bibframe = client.folioInstanceToBIBFRAME(instance);
      
      if (onRecordImport) {
        onRecordImport(bibframe as BIBFRAMERecord);
      }
      
      alert('Successfully imported from FOLIO!');
    } catch (error: any) {
      alert(`Import failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * View instance details
   */
  const handleViewInstance = async (instanceId: string) => {
    if (!client) return;

    setIsLoading(true);
    try {
      const instance = await client.getInstance(instanceId);
      setSelectedInstance(instance);
    } catch (error: any) {
      alert(`Failed to load instance: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg">
              <Server className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isRTL ? 'تكامل منصة FOLIO' : 'FOLIO Platform Integration'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL 
                  ? 'اتصل بنظام FOLIO الخاص بك للكتالوج الكامل'
                  : 'Connect to your FOLIO instance for full cataloging capabilities'
                }
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onBack}>
            {isRTL ? 'رجوع' : 'Back'}
          </Button>
        </div>

        {/* Connection Status */}
        <Card className={isConnected ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                )}
                <div>
                  <div className="font-semibold text-lg">
                    {isConnected ? 'Connected to FOLIO' : 'Not Connected'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {isConnected ? `${config.okapiUrl} (${config.tenant})` : 'Configure connection below'}
                  </div>
                </div>
              </div>
              {isConnected && (
                <Button variant="outline" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connection">
              <Settings className="h-4 w-4 mr-2" />
              Connection
            </TabsTrigger>
            <TabsTrigger value="search" disabled={!isConnected}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="export" disabled={!isConnected || !currentRecord}>
              <Upload className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger value="docs">
              <BookOpen className="h-4 w-4 mr-2" />
              Documentation
            </TabsTrigger>
          </TabsList>

          {/* Connection Tab */}
          <TabsContent value="connection" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>FOLIO Connection Settings</CardTitle>
                <CardDescription>
                  Configure your FOLIO Okapi gateway connection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Okapi URL</label>
                    <Input
                      value={config.okapiUrl}
                      onChange={(e) => setConfig({ ...config, okapiUrl: e.target.value })}
                      placeholder="https://folio-snapshot-okapi.dev.folio.org"
                      disabled={isConnected}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tenant ID</label>
                    <Input
                      value={config.tenant}
                      onChange={(e) => setConfig({ ...config, tenant: e.target.value })}
                      placeholder="diku"
                      disabled={isConnected}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Username (optional)</label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      disabled={isConnected}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password (optional)</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password"
                      disabled={isConnected}
                    />
                  </div>
                </div>

                {connectionError && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                    <div className="flex items-start gap-2">
                      <X className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-red-900 dark:text-red-200">Connection Error</div>
                        <div className="text-sm text-red-700 dark:text-red-300">{connectionError}</div>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting || isConnected}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Link className="h-4 w-4 mr-2" />
                      Connect to FOLIO
                    </>
                  )}
                </Button>

                {/* Quick Setup Examples */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Quick Setup Examples:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                      <div className="font-medium">FOLIO Snapshot (Public)</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        URL: https://folio-snapshot-okapi.dev.folio.org
                        <br />
                        Tenant: diku
                      </div>
                    </div>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                      <div className="font-medium">Local FOLIO Instance</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        URL: http://localhost:9130
                        <br />
                        Tenant: diku (or your tenant ID)
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search FOLIO Inventory</CardTitle>
                <CardDescription>
                  Search for instances in your FOLIO catalog
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, author, ISBN..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {totalRecords > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Found {totalRecords} record(s)
                  </div>
                )}

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((instance) => (
                    <div
                      key={instance.id}
                      className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => handleViewInstance(instance.id)}
                    >
                      <div className="font-semibold">{instance.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {instance.contributors?.map(c => c.name).join('; ')}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImportFromFOLIO(instance);
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Import to Moon
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export to FOLIO</CardTitle>
                <CardDescription>
                  Export current Moon record to FOLIO inventory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentRecord ? (
                  <>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
                      <div className="font-semibold">{currentRecord.title || 'Untitled'}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Type: {currentRecord['@type']}
                      </div>
                    </div>

                    <Button onClick={handleExportToFOLIO} disabled={isLoading} className="w-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Export to FOLIO
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No record selected. Create or open a record first.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>FOLIO Integration Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose dark:prose-invert max-w-none">
                  <h3>FOLIO Modules Used</h3>
                  <ul>
                    <li><strong>mod-inventory</strong> - Inventory business logic</li>
                    <li><strong>mod-inventory-storage</strong> - Persistent storage for instances, holdings, items</li>
                    <li><strong>mod-source-record-storage</strong> - MARC record storage</li>
                    <li><strong>mod-data-import</strong> - MARC import functionality</li>
                    <li><strong>okapi</strong> - API gateway</li>
                  </ul>

                  <h3>API Endpoints</h3>
                  <div className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-4 rounded space-y-1">
                    <div>POST /authn/login - Authentication</div>
                    <div>GET /instance-storage/instances - Search instances</div>
                    <div>POST /instance-storage/instances - Create instance</div>
                    <div>GET /holdings-storage/holdings - Get holdings</div>
                    <div>GET /item-storage/items - Get items</div>
                  </div>

                  <h3>Resources</h3>
                  <ul>
                    <li><a href="https://github.com/folio-org/okapi" target="_blank" rel="noopener" className="text-blue-600">Okapi Gateway</a></li>
                    <li><a href="https://github.com/folio-org/raml-module-builder" target="_blank" rel="noopener" className="text-blue-600">RAML Module Builder</a></li>
                    <li><a href="https://dev.folio.org/reference/api/" target="_blank" rel="noopener" className="text-blue-600">API Documentation</a></li>
                    <li><a href="https://github.com/folio-org" target="_blank" rel="noopener" className="text-blue-600">FOLIO GitHub Organization</a></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
