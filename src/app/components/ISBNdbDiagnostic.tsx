/**
 * ISBNdb Diagnostic Tool
 * Check ISBNdb API configuration and connectivity
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c`;

export function ISBNdbDiagnostic() {
  const [status, setStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/isbndb/status`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      setStatus(data);
      console.log('ISBNdb Status:', data);
    } catch (error) {
      console.error('Error checking status:', error);
      setStatus({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testAPICall = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      // Test with a simple ISBN lookup
      const response = await fetch(`${API_BASE}/isbndb/book/9780134685991`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      const data = await response.json();
      
      setTestResult({
        status: response.status,
        ok: response.ok,
        data: data
      });
      
      console.log('ISBNdb Test Result:', {
        status: response.status,
        ok: response.ok,
        data: data
      });
    } catch (error) {
      console.error('Error testing API:', error);
      setTestResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">ISBNdb Diagnostic Tool</h1>
      
      <div className="space-y-6">
        {/* Status Check */}
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">API Configuration Status</h2>
          <Button onClick={checkStatus} disabled={loading} className="mb-4">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Check Configuration
          </Button>
          
          {status && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded border">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(status, null, 2)}
              </pre>
              
              {status.configured ? (
                <div className="flex items-center gap-2 mt-4 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>API Key is configured</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-4 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span>API Key is NOT configured</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* API Test */}
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Test API Call</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This will test a real API call to ISBNdb using ISBN: 9780134685991
          </p>
          <Button onClick={testAPICall} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Test API Call
          </Button>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded border">
              <div className="flex items-center gap-2 mb-4">
                {testResult.ok ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-semibold">Success!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-semibold">
                      Failed (Status: {testResult.status})
                    </span>
                  </>
                )}
              </div>
              
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>

              {testResult.data?.message === "Bad credentials." && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        Bad Credentials Error
                      </p>
                      <p className="text-yellow-700 dark:text-yellow-300 mb-2">
                        This error means the ISBNdb API key is either:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
                        <li>Not set in the ISBNDB_API_KEY environment variable</li>
                        <li>Invalid or expired</li>
                        <li>In the wrong format (check for extra spaces or quotes)</li>
                      </ul>
                      <p className="mt-3 font-semibold text-yellow-800 dark:text-yellow-200">
                        Solution:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
                        <li>Go to <a href="https://isbndb.com/api-key" target="_blank" rel="noopener noreferrer" className="underline">isbndb.com/api-key</a></li>
                        <li>Get or verify your API key</li>
                        <li>Update the ISBNDB_API_KEY secret in Supabase</li>
                        <li>Ensure there are no extra spaces or quotes around the key</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="border rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
            How to Fix ISBNdb Issues
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
            <li>
              <strong>Get API Key:</strong> Visit{' '}
              <a 
                href="https://isbndb.com/api-key" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-blue-600"
              >
                isbndb.com/api-key
              </a>
            </li>
            <li>
              <strong>Copy Your Key:</strong> Copy the entire API key (it should be a long string of characters)
            </li>
            <li>
              <strong>Set Environment Variable:</strong> In your Supabase project, set the ISBNDB_API_KEY secret
            </li>
            <li>
              <strong>Verify Format:</strong> Make sure there are NO quotes, spaces, or line breaks around the key
            </li>
            <li>
              <strong>Test:</strong> Click "Test API Call" above to verify it works
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}