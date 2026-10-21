/**
 * 🌊 MOON WAVE 101
 * Comprehensive Production Features Demonstration
 * 
 * Shows all enterprise hardening features:
 * - Checksum verification
 * - Validation enforcement
 * - Immutable audit logs
 * - Publishing workflow
 * - Version management
 * - MARC export
 * - Mind map visualization
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle2, XCircle, Lock, Unlock, History, 
  FileText, Download, Eye, AlertTriangle, Sparkles,
  Database, GitBranch, Activity, Archive, Zap, BookOpen
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface RecordMetadata {
  id: string;
  title: string;
  resourceType: string;
  status: 'draft' | 'validated' | 'published' | 'archived';
  checksum: string;
  locked: boolean;
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  recordId: string;
  userId?: string;
  metadata?: any;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  timestamp: string;
  checksumValidated?: string;
}

export default function MoonWave101() {
  const [activeDemo, setActiveDemo] = useState<'checksum' | 'validation' | 'audit' | 'publish' | 'version'>('checksum');
  const [records, setRecords] = useState<RecordMetadata[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<RecordMetadata | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [checksumVerified, setChecksumVerified] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c`;

  // Load sample records
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/records`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) {
        console.error('Failed to load records:', response.status);
        toast.error(`Failed to load records (${response.status})`);
        return;
      }
      
      const data = await response.json();
      if (data.success && Array.isArray(data.records)) {
        setRecords(data.records);
        if (data.records.length > 0 && !selectedRecord) {
          setSelectedRecord(data.records[0]);
        }
      } else {
        console.error('Invalid response format:', data);
        setRecords([]);
      }
    } catch (error) {
      console.error('Error loading records:', error);
      toast.error('Failed to load records - check console for details');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // DEMO 1: Checksum Verification
  const demonstrateChecksumVerification = async () => {
    if (!selectedRecord?.id) {
      toast.error('Please select a record first');
      return;
    }

    setLoading(true);
    toast.info('Verifying checksum integrity...');

    try {
      // The backend automatically verifies checksum on every getRecord() call
      const response = await fetch(`${API_BASE}/api/records/${selectedRecord.id}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChecksumVerified(true);
        const checksum = data?.record?.checksum || '';
        toast.success('Checksum verified! Data integrity confirmed', {
          description: checksum ? `Checksum: ${checksum.substring(0, 16)}...` : 'Data integrity confirmed'
        });
      } else if (response.status === 500) {
        const error = await response.json();
        if (error?.code === 'DATA_CORRUPTION') {
          toast.error('Corruption Detected!', {
            description: 'Checksum mismatch - data has been tampered with'
          });
        } else {
          toast.error('Server error occurred');
        }
      } else {
        toast.error(`Verification failed (${response.status})`);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification failed - check console');
    } finally {
      setLoading(false);
    }
  };

  // DEMO 2: Validation Enforcement
  const demonstrateValidationEnforcement = async () => {
    if (!selectedRecord?.id) {
      toast.error('Please select a record first');
      return;
    }

    setLoading(true);
    toast.info('Attempting to publish without validation...');

    try {
      const response = await fetch(`${API_BASE}/api/records/${selectedRecord.id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: 'demo-user' })
      });

      const data = await response.json();

      if (response.status === 409) {
        if (data?.code === 'VALIDATION_REQUIRED') {
          toast.error('Publish Blocked!', {
            description: 'Validation failed - cannot publish invalid record'
          });
          setValidationResult({
            valid: false,
            errors: data.errors || ['Validation errors detected'],
            timestamp: new Date().toISOString()
          });
        } else if (data?.code === 'REVALIDATION_REQUIRED') {
          toast.error('Revalidation Required!', {
            description: 'Record modified after validation - please validate again'
          });
        } else {
          toast.error('Publish conflict occurred');
        }
      } else if (response.ok) {
        toast.success('Published Successfully!', {
          description: 'Validation passed and record is now locked'
        });
        loadRecords(); // Refresh to show locked status
      } else {
        toast.error(`Publish failed (${response.status})`);
      }
    } catch (error) {
      console.error('Publish test error:', error);
      toast.error('Failed to test publish - check console');
    } finally {
      setLoading(false);
    }
  };

  // DEMO 3: Audit Trail
  const loadAuditTrail = async () => {
    if (!selectedRecord?.id) {
      toast.error('Please select a record first');
      return;
    }

    setLoading(true);
    toast.info('Loading audit trail...');

    try {
      const response = await fetch(`${API_BASE}/api/records/${selectedRecord.id}/audit`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const logs = data?.auditHistory || [];
        setAuditLogs(logs);
        toast.success(`Loaded ${logs.length} audit entries`);
      } else {
        toast.error(`Failed to load audit trail (${response.status})`);
      }
    } catch (error) {
      console.error('Audit trail error:', error);
      toast.error('Failed to load audit trail - check console');
    } finally {
      setLoading(false);
    }
  };

  // DEMO 4: Lock Enforcement
  const demonstrateLockEnforcement = async () => {
    if (!selectedRecord?.id) {
      toast.error('Please select a record first');
      return;
    }

    if (!selectedRecord.locked) {
      toast.info('This record is not locked. Publish it first to see lock enforcement.');
      return;
    }

    setLoading(true);
    toast.info('Attempting to modify locked record...');

    try {
      const response = await fetch(`${API_BASE}/api/records/${selectedRecord.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          graphJson: { '@graph': [] },
          title: 'Modified Title',
          userId: 'demo-user'
        })
      });

      if (response.status === 403) {
        const data = await response.json();
        toast.error('Modification Blocked!', {
          description: 'Record is locked - cannot modify published records'
        });
      } else if (response.ok) {
        toast.success('Record updated');
        loadRecords();
      } else {
        toast.error(`Lock test returned ${response.status}`);
      }
    } catch (error) {
      console.error('Lock test error:', error);
      toast.error('Failed to test lock - check console');
    } finally {
      setLoading(false);
    }
  };

  // DEMO 5: Create Sample Record
  const createSampleRecord = async () => {
    setLoading(true);
    toast.info('Creating sample BIBFRAME record...');

    try {
      const sampleGraph = {
        '@context': {
          'bf': 'http://id.loc.gov/ontologies/bibframe/',
          'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
        },
        '@graph': [
          {
            '@id': `http://example.org/work/${Date.now()}`,
            '@type': 'bf:Work',
            'bf:title': {
              '@id': `http://example.org/title/${Date.now()}`,
              '@type': 'bf:Title',
              'bf:mainTitle': 'Moon Wave 101 Demo Record'
            }
          }
        ]
      };

      const response = await fetch(`${API_BASE}/api/records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          graphJson: sampleGraph,
          title: 'Moon Wave 101 Demo Record',
          resourceType: 'Work',
          userId: 'demo-user'
        })
      });

      if (response.ok) {
        toast.success('Sample record created with checksum!');
        loadRecords();
      } else {
        toast.error('Failed to create record');
      }
    } catch (error) {
      toast.error('Error creating record');
    } finally {
      setLoading(false);
    }
  };

  // Export as MARC
  const exportAsMARC = async () => {
    if (!selectedRecord?.id) {
      toast.error('Please select a record first');
      return;
    }

    toast.info('Generating MARC 21 export...');
    window.open(`${API_BASE}/api/records/${selectedRecord.id}/export?format=marc`, '_blank');
  };

  // View Mind Map
  const viewMindMap = async () => {
    if (!selectedRecord?.id) {
      toast.error('Please select a record first');
      return;
    }

    toast.info('Opening mind map visualization...');
    window.open(`${API_BASE}/api/records/${selectedRecord.id}/mindmap?format=svg`, '_blank');
  };

  // Show loading state during initial load
  if (loading && records.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-16 w-16 text-purple-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900">Loading Moon Wave 101...</h2>
          <p className="text-gray-600 mt-2">Connecting to production backend</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-12 w-12 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Moon Wave 101
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enterprise Production Features Demonstration
          </p>
          <p className="text-sm text-gray-500 mt-2">
            All backend hardening features in action: Checksum Verification • Validation Enforcement • Immutable Audit Logs • Record Locking • Versioning
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur border-purple-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={createSampleRecord}>
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Create Sample</h3>
              <p className="text-xs text-gray-500 mt-1">New BIBFRAME record</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-blue-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={loadRecords}>
            <CardContent className="p-6 text-center">
              <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Load Records</h3>
              <p className="text-xs text-gray-500 mt-1">Refresh from backend</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-green-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={exportAsMARC}>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">MARC Export</h3>
              <p className="text-xs text-gray-500 mt-1">BIBFRAME → MARC 21</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-pink-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={viewMindMap}>
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Mind Map</h3>
              <p className="text-xs text-gray-500 mt-1">RDF visualization</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Record Info */}
        {selectedRecord && (
          <Card className="mb-8 bg-white/90 backdrop-blur border-2 border-indigo-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {selectedRecord.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    ID: {selectedRecord.id}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={selectedRecord.status === 'published' ? 'default' : 'secondary'}>
                    {selectedRecord.status}
                  </Badge>
                  {selectedRecord.locked && (
                    <Badge variant="destructive">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Checksum:</span>
                  <p className="font-mono text-xs mt-1">
                    {selectedRecord.checksum ? selectedRecord.checksum.substring(0, 16) + '...' : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Version:</span>
                  <p className="font-semibold mt-1">v{selectedRecord.versionNumber || 1}</p>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-semibold mt-1">{selectedRecord.resourceType || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Updated:</span>
                  <p className="text-xs mt-1">
                    {selectedRecord.updatedAt ? new Date(selectedRecord.updatedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo Tabs */}
        <Tabs value={activeDemo} onValueChange={(v: any) => setActiveDemo(v)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur">
            <TabsTrigger value="checksum" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Checksum
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
            <TabsTrigger value="publish" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Publishing
            </TabsTrigger>
            <TabsTrigger value="version" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Versioning
            </TabsTrigger>
          </TabsList>

          {/* DEMO 1: Checksum Verification */}
          <TabsContent value="checksum">
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  Checksum Integrity Verification
                </CardTitle>
                <CardDescription>
                  Every record load automatically verifies SHA-256 checksum to detect data corruption
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">How It Works</h4>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Record is stored with SHA-256 checksum of canonical JSON-LD</li>
                    <li>On every <code className="bg-blue-100 px-1 rounded">getRecord()</code> call, backend recomputes checksum</li>
                    <li>If checksum mismatch detected → throws error & creates audit log</li>
                    <li>Guarantees data integrity at read time</li>
                  </ol>
                </div>

                <Button 
                  onClick={demonstrateChecksumVerification}
                  disabled={loading || !selectedRecord}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {loading ? 'Verifying...' : 'Test Checksum Verification'}
                </Button>

                {checksumVerified && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Verification Successful!</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Data integrity confirmed. Checksum matches stored value.
                      </p>
                      <code className="text-xs bg-green-100 px-2 py-1 rounded mt-2 inline-block">
                        {selectedRecord?.checksum || 'N/A'}
                      </code>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Backend Implementation</h4>
                  <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`// recordService.tsx - Line 108
export async function getRecord(recordId: string) {
  const stored = JSON.parse(await kv.get(\`record:\${recordId}\`));
  
  // 🔐 VERIFY CHECKSUM
  const recomputedChecksum = generateChecksum(stored.graphJson);
  
  if (recomputedChecksum !== stored.checksum) {
    throw new Error('Data corruption detected');
  }
  
  return stored;
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DEMO 2: Validation Enforcement */}
          <TabsContent value="validation">
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  Validation Enforcement
                </CardTitle>
                <CardDescription>
                  Publishing is blocked if validation fails or record modified after validation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Validation Workflow</h4>
                  <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
                    <li>Record must pass BIBFRAME validation</li>
                    <li>Validation result tied to specific checksum</li>
                    <li>Publishing blocked if validation failed</li>
                    <li>Publishing blocked if record modified after validation</li>
                    <li>Returns HTTP 409 Conflict with error code</li>
                  </ol>
                </div>

                <Button 
                  onClick={demonstrateValidationEnforcement}
                  disabled={loading || !selectedRecord}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {loading ? 'Testing...' : 'Test Validation Enforcement'}
                </Button>

                {validationResult && (
                  <div className={`border rounded-lg p-4 flex items-start gap-3 ${
                    validationResult.valid 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    {validationResult.valid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`font-semibold ${
                        validationResult.valid ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {validationResult.valid ? 'Validation Passed' : 'Validation Failed'}
                      </h4>
                      {!validationResult.valid && validationResult.errors.length > 0 && (
                        <ul className="text-sm text-red-700 mt-2 space-y-1">
                          {validationResult.errors.map((error, i) => (
                            <li key={i}>• {error}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 border border-orange-200 rounded p-3">
                    <h5 className="font-semibold text-orange-900 text-sm mb-1">HTTP 409 Conflict</h5>
                    <code className="text-xs text-orange-700">VALIDATION_REQUIRED</code>
                    <p className="text-xs text-orange-600 mt-2">When validation fails</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded p-3">
                    <h5 className="font-semibold text-orange-900 text-sm mb-1">HTTP 409 Conflict</h5>
                    <code className="text-xs text-orange-700">REVALIDATION_REQUIRED</code>
                    <p className="text-xs text-orange-600 mt-2">When modified after validation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DEMO 3: Audit Trail */}
          <TabsContent value="audit">
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-6 w-6 text-purple-600" />
                  Immutable Audit Trail
                </CardTitle>
                <CardDescription>
                  Complete lifecycle tracking with archive-only retention (never delete)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Audit Features</h4>
                  <ul className="text-sm text-purple-800 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Append-only pattern (no updates)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Server-side timestamps (client cannot inject)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Archive instead of delete (forensic compliance)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Tracks all CRUD, publish, export, validation events
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={loadAuditTrail}
                  disabled={loading || !selectedRecord}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  {loading ? 'Loading...' : 'Load Audit Trail'}
                </Button>

                {auditLogs.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {auditLogs.map((log, i) => (
                      <div key={i} className="bg-gray-50 border rounded p-3 text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={
                            log.action.includes('published') ? 'default' :
                            log.action.includes('created') ? 'secondary' :
                            log.action.includes('corruption') ? 'destructive' :
                            'outline'
                          }>
                            {log.action}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {log.metadata && (
                          <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Delete Function Deprecated
                  </h4>
                  <code className="text-xs bg-red-100 px-2 py-1 rounded">
                    cleanupOldAudits() → throws error
                  </code>
                  <p className="text-sm text-red-700 mt-2">
                    Use <code className="bg-red-100 px-1 rounded">archiveOldAudits()</code> instead. 
                    Audit logs must never be deleted for forensic compliance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DEMO 4: Publishing & Locking */}
          <TabsContent value="publish">
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-6 w-6 text-red-600" />
                  Publishing Workflow & Record Locking
                </CardTitle>
                <CardDescription>
                  Published records are automatically locked and cannot be modified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Lock Enforcement</h4>
                  <ol className="text-sm text-red-800 space-y-2 list-decimal list-inside">
                    <li>On publish → record status = 'published' & locked = true</li>
                    <li>All <code className="bg-red-100 px-1 rounded">updateRecord()</code> calls check lock status</li>
                    <li>If locked → throws error (server-enforced, not just UI)</li>
                    <li>Returns HTTP 403 Forbidden</li>
                    <li>To modify → create new version instead</li>
                  </ol>
                </div>

                {selectedRecord && (
                  <div className={`border-2 rounded-lg p-4 ${
                    selectedRecord.locked 
                      ? 'bg-red-50 border-red-300' 
                      : 'bg-green-50 border-green-300'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      {selectedRecord.locked ? (
                        <Lock className="h-8 w-8 text-red-600" />
                      ) : (
                        <Unlock className="h-8 w-8 text-green-600" />
                      )}
                      <div>
                        <h4 className={`font-bold ${
                          selectedRecord.locked ? 'text-red-900' : 'text-green-900'
                        }`}>
                          {selectedRecord.locked ? 'Record is LOCKED' : 'Record is UNLOCKED'}
                        </h4>
                        <p className={`text-sm ${
                          selectedRecord.locked ? 'text-red-700' : 'text-green-700'
                        }`}>
                          {selectedRecord.locked 
                            ? 'Cannot be modified. Published records are immutable.' 
                            : 'Can be freely modified until published.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={demonstrateLockEnforcement}
                  disabled={loading || !selectedRecord || !selectedRecord.locked}
                  className="w-full bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  {loading ? 'Testing...' : 'Test Lock Enforcement'}
                </Button>

                <div className="bg-gray-50 rounded p-3">
                  <h5 className="font-semibold text-gray-900 text-sm mb-1">HTTP 403 Forbidden</h5>
                  <code className="text-xs text-gray-700">RECORD_LOCKED</code>
                  <p className="text-xs text-gray-600 mt-2">
                    Returned when attempting to modify a published record
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DEMO 5: Versioning */}
          <TabsContent value="version">
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-6 w-6 text-indigo-600" />
                  Version Management
                </CardTitle>
                <CardDescription>
                  Snapshots with checksums, validation results tied to specific versions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-900 mb-2">Version Features</h4>
                  <ul className="text-sm text-indigo-800 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Automatic snapshot on publish
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Each version has its own SHA-256 checksum
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Validation results tied to checksum
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Rollback capability
                    </li>
                  </ul>
                </div>

                {selectedRecord && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-900 mb-3">Current Version</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-indigo-600">Version Number:</span>
                        <p className="font-bold text-lg">v{selectedRecord.versionNumber || 1}</p>
                      </div>
                      <div>
                        <span className="text-indigo-600">Checksum:</span>
                        <code className="text-xs bg-indigo-100 px-1 rounded block mt-1">
                          {selectedRecord.checksum ? selectedRecord.checksum.substring(0, 20) + '...' : 'N/A'}
                        </code>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Validation-Checksum Binding</h4>
                  <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`{
  "versionNumber": 2,
  "checksum": "a1b2c3d4...",
  "validationResult": {
    "valid": true,
    "errors": [],
    "timestamp": "2026-02-25T10:30:00Z",
    "checksumValidated": "a1b2c3d4..." // ← Tied to checksum
  }
}`}
                  </pre>
                  <p className="text-xs text-gray-600 mt-2">
                    This prevents publishing a record that was modified after validation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Record List */}
        <Card className="mt-8 bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Available Records ({records.length})</span>
              <Button onClick={loadRecords} variant="outline" size="sm">
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {records.map(record => (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedRecord?.id === record.id 
                      ? 'bg-indigo-50 border-indigo-300' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{record.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{record.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={record.status === 'published' ? 'default' : 'secondary'}>
                        {record.status}
                      </Badge>
                      {record.locked && (
                        <Lock className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {records.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No records found. Create a sample record to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Moon Wave 101 — Production Hardening Features Demo</p>
          <p className="text-xs text-gray-500 mt-1">
            All features are live and connected to the production backend
          </p>
        </div>
      </div>
    </div>
  );
}