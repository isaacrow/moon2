/**
 * 🔧 MOON WAVE DIAGNOSTIC
 * Tests backend connectivity and shows EXACTLY what's working
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface DiagnosticTest {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  message?: string;
  data?: any;
}

export default function MoonWaveDiagnostic() {
  const [tests, setTests] = useState<DiagnosticTest[]>([
    { name: 'Supabase Configuration', status: 'pending' },
    { name: 'Health Check', status: 'pending' },
    { name: 'Engine Status', status: 'pending' },
    { name: 'List Records API', status: 'pending' },
    { name: 'Record Creation', status: 'pending' },
  ]);

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c`;

  const updateTest = (index: number, updates: Partial<DiagnosticTest>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test));
  };

  const runDiagnostics = async () => {
    console.log('🔧 STARTING DIAGNOSTICS');
    console.log('API Base:', API_BASE);
    console.log('Project ID:', projectId);
    console.log('Public Key:', publicAnonKey?.substring(0, 20) + '...');

    // Test 1: Supabase Config
    updateTest(0, { status: 'running' });
    if (!projectId || !publicAnonKey) {
      updateTest(0, { 
        status: 'failed', 
        message: 'Supabase credentials missing' 
      });
      return;
    }
    updateTest(0, { 
      status: 'success', 
      message: `Project: ${projectId}`,
      data: { projectId, hasKey: !!publicAnonKey }
    });

    // Test 2: Health Check
    updateTest(1, { status: 'running' });
    try {
      const healthUrl = `${API_BASE}/health`;
      console.log('Testing:', healthUrl);
      
      const response = await fetch(healthUrl, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      console.log('Health response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Health data:', data);
        updateTest(1, { 
          status: 'success', 
          message: 'Server is alive',
          data 
        });
      } else {
        updateTest(1, { 
          status: 'failed', 
          message: `HTTP ${response.status}` 
        });
        return;
      }
    } catch (error: any) {
      console.error('Health check error:', error);
      updateTest(1, { 
        status: 'failed', 
        message: error.message 
      });
      return;
    }

    // Test 3: Engine Status
    updateTest(2, { status: 'running' });
    try {
      const statusUrl = `${API_BASE}/engine/status`;
      console.log('Testing:', statusUrl);
      
      const response = await fetch(statusUrl, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      console.log('Engine response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Engine data:', data);
        updateTest(2, { 
          status: 'success', 
          message: `Boot: ${data.bootComplete}`,
          data 
        });
      } else {
        const data = await response.json();
        updateTest(2, { 
          status: 'failed', 
          message: `HTTP ${response.status}: ${data.message || 'Unknown'}`,
          data 
        });
      }
    } catch (error: any) {
      console.error('Engine status error:', error);
      updateTest(2, { 
        status: 'failed', 
        message: error.message 
      });
    }

    // Test 4: List Records
    updateTest(3, { status: 'running' });
    try {
      const recordsUrl = `${API_BASE}/api/records`;
      console.log('Testing:', recordsUrl);
      
      const response = await fetch(recordsUrl, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      console.log('Records response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Records data:', data);
        updateTest(3, { 
          status: 'success', 
          message: `Found ${data.records?.length || 0} records`,
          data 
        });
      } else {
        const errorData = await response.json();
        updateTest(3, { 
          status: 'failed', 
          message: `HTTP ${response.status}`,
          data: errorData 
        });
      }
    } catch (error: any) {
      console.error('Records API error:', error);
      updateTest(3, { 
        status: 'failed', 
        message: error.message 
      });
    }

    // Test 5: Create Record
    updateTest(4, { status: 'running' });
    try {
      const createUrl = `${API_BASE}/api/records`;
      console.log('Testing:', createUrl);
      
      const sampleGraph = {
        '@context': {
          'bf': 'http://id.loc.gov/ontologies/bibframe/',
          'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
        },
        '@graph': [
          {
            '@id': `http://example.org/work/diagnostic-${Date.now()}`,
            '@type': 'bf:Work',
            'bf:title': {
              '@type': 'bf:Title',
              'bf:mainTitle': 'Diagnostic Test Record'
            }
          }
        ]
      };

      const response = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          graphJson: sampleGraph,
          title: 'Diagnostic Test Record',
          resourceType: 'Work',
          userId: 'diagnostic-test'
        })
      });
      
      console.log('Create response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Created record:', data);
        updateTest(4, { 
          status: 'success', 
          message: `Created: ${data.record?.id}`,
          data 
        });
      } else {
        const errorData = await response.json();
        updateTest(4, { 
          status: 'failed', 
          message: `HTTP ${response.status}`,
          data: errorData 
        });
      }
    } catch (error: any) {
      console.error('Create record error:', error);
      updateTest(4, { 
        status: 'failed', 
        message: error.message 
      });
    }

    console.log('🔧 DIAGNOSTICS COMPLETE');
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-600">PASS</Badge>;
      case 'failed':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'running':
        return <Badge className="bg-blue-600">RUNNING</Badge>;
      default:
        return <Badge variant="outline">PENDING</Badge>;
    }
  };

  const allPassed = tests.every(t => t.status === 'success');
  const anyFailed = tests.some(t => t.status === 'failed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔧 Moon Wave Backend Diagnostic
          </h1>
          <p className="text-gray-300">
            Testing all backend connections and APIs
          </p>
        </div>

        {/* Overall Status */}
        <Card className="mb-8 border-2 border-white/20 bg-white/10 backdrop-blur">
          <CardContent className="p-6">
            <div className="text-center">
              {allPassed && (
                <div className="text-green-400 text-2xl font-bold">
                  ✅ ALL SYSTEMS OPERATIONAL
                </div>
              )}
              {anyFailed && !allPassed && (
                <div className="text-red-400 text-2xl font-bold">
                  ❌ SOME TESTS FAILED
                </div>
              )}
              {!allPassed && !anyFailed && (
                <div className="text-blue-400 text-2xl font-bold">
                  ⏳ RUNNING DIAGNOSTICS...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="space-y-4">
          {tests.map((test, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <span>{test.name}</span>
                  </div>
                  {getStatusBadge(test.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {test.message && (
                  <p className="text-gray-300 mb-2">{test.message}</p>
                )}
                {test.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-300 text-sm">
                      View Data
                    </summary>
                    <pre className="mt-2 text-xs bg-black/50 text-green-400 p-3 rounded overflow-x-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Re-run Button */}
        <div className="mt-8 text-center">
          <Button 
            onClick={runDiagnostics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            size="lg"
          >
            🔄 Re-run Diagnostics
          </Button>
        </div>

        {/* API Info */}
        <Card className="mt-8 bg-black/30 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-300 font-mono text-sm">
            <div>
              <span className="text-gray-500">Base URL:</span>
              <br />
              <span className="text-green-400">{API_BASE}</span>
            </div>
            <div>
              <span className="text-gray-500">Project ID:</span>
              <br />
              <span className="text-blue-400">{projectId}</span>
            </div>
            <div>
              <span className="text-gray-500">Auth Key:</span>
              <br />
              <span className="text-purple-400">{publicAnonKey ? `${publicAnonKey.substring(0, 30)}...` : 'MISSING'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Console Reminder */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          💡 Open browser console (F12) to see detailed logs
        </div>
      </div>
    </div>
  );
}