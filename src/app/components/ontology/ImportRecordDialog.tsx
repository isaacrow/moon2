/**
 * Import Record Dialog
 * 
 * Allows importing BIBFRAME records from XML, RDF, JSON-LD files
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Upload, FileJson, FileCode, FileText, X } from 'lucide-react';

interface ImportRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (workData: any, instanceData: any) => void;
}

export function ImportRecordDialog({ isOpen, onClose, onImport }: ImportRecordDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileType, setFileType] = useState<'jsonld' | 'xml' | 'rdf' | null>(null);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError('');

    // Determine file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'json' || extension === 'jsonld') {
      setFileType('jsonld');
    } else if (extension === 'xml' || extension === 'rdf' || extension === 'marcxml') {
      setFileType('xml');
    } else if (extension === 'ttl' || extension === 'n3') {
      setFileType('rdf');
    } else {
      setError('Unsupported file type. Please use JSON-LD, XML, or RDF files.');
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    try {
      let workData: any = {};
      let instanceData: any = {};

      if (fileType === 'jsonld') {
        const parsed = JSON.parse(fileContent);
        
        // Handle different JSON-LD structures
        if (parsed['@graph']) {
          // Standard BIBFRAME JSON-LD with @graph
          const graph = parsed['@graph'];
          workData = graph.find((item: any) => 
            item['@type']?.includes('bf:Work') || item['@type'] === 'bf:Work'
          ) || {};
          instanceData = graph.find((item: any) => 
            item['@type']?.includes('bf:Instance') || item['@type'] === 'bf:Instance'
          ) || {};
        } else if (parsed.work && parsed.instance) {
          // Moon format with separate work and instance
          workData = parsed.work;
          instanceData = parsed.instance;
        } else if (parsed['@type']?.includes('bf:Work') || parsed['@type'] === 'bf:Work') {
          // Single Work object
          workData = parsed;
        } else if (parsed['@type']?.includes('bf:Instance') || parsed['@type'] === 'bf:Instance') {
          // Single Instance object
          instanceData = parsed;
        } else {
          // Try to find nested Work/Instance with flexible property names
          workData = parsed.work || parsed.Work || {};
          instanceData = parsed.instance || parsed.Instance || {};
        }
      } else if (fileType === 'xml') {
        // Basic XML/MARCXML parsing (simplified)
        setError('XML import is not yet implemented. Please use JSON-LD format.');
        return;
      } else if (fileType === 'rdf') {
        setError('Turtle/RDF import is not yet implemented. Please use JSON-LD format.');
        return;
      }

      // Validate we got at least something
      if (Object.keys(workData).length === 0 && Object.keys(instanceData).length === 0) {
        setError('No valid BIBFRAME data found in file');
        return;
      }

      // Set default @type if missing
      if (!workData['@type']) workData['@type'] = 'bf:Work';
      if (!instanceData['@type']) instanceData['@type'] = 'bf:Instance';

      onImport(workData, instanceData);
      onClose();
    } catch (err) {
      setError(`Error parsing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Import BIBFRAME Record
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Import a BIBFRAME record from JSON-LD, XML, or RDF file.
            </p>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".json,.jsonld,.xml,.rdf,.ttl,.n3,.marcxml"
                onChange={handleFileSelect}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  JSON-LD, XML, RDF, Turtle
                </span>
              </label>
            </div>

            {/* Selected File */}
            {selectedFile && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  {fileType === 'jsonld' && <FileJson className="h-5 w-5 text-blue-600" />}
                  {fileType === 'xml' && <FileText className="h-5 w-5 text-orange-600" />}
                  {fileType === 'rdf' && <FileCode className="h-5 w-5 text-purple-600" />}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Preview */}
            {fileContent && !error && fileType === 'jsonld' && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview:
                </h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-64 text-xs font-mono">
                  {fileContent.substring(0, 500)}
                  {fileContent.length > 500 && '\n...(truncated)'}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || !!error}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Record
          </Button>
        </div>
      </div>
    </div>
  );
}
