import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Upload, FileJson, FileCode, CheckCircle, AlertCircle } from 'lucide-react';
import { BIBFRAMERecord } from '../types/bibframe';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface FileImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (record: BIBFRAMERecord) => void;
}

export function FileImportDialog({ open, onClose, onImport }: FileImportDialogProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [parsedRecord, setParsedRecord] = useState<BIBFRAMERecord | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setProcessing(true);
    setPreview(null);
    setParsedRecord(null);

    try {
      const text = await file.text();
      setPreview(text.substring(0, 500) + (text.length > 500 ? '...' : ''));

      let record: BIBFRAMERecord;

      // Determine file type and parse accordingly
      if (file.name.endsWith('.json') || file.name.endsWith('.jsonld')) {
        record = await parseJSONLD(text);
      } else if (file.name.endsWith('.xml') || file.name.endsWith('.rdf')) {
        record = await parseRDFXML(text);
      } else {
        // Try to auto-detect
        const trimmed = text.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          record = await parseJSONLD(text);
        } else if (trimmed.startsWith('<')) {
          record = await parseRDFXML(text);
        } else {
          throw new Error('Unsupported file format. Please upload JSON-LD or RDF/XML.');
        }
      }

      setParsedRecord(record);
      toast.success('File parsed successfully!');
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const parseJSONLD = async (text: string): Promise<BIBFRAMERecord> => {
    const data = JSON.parse(text);
    
    // If it's already a valid Moon BIBFRAME record, return it as-is
    if (data.work && data.instance && data['@context']) {
      return data as BIBFRAMERecord;
    }

    // If it's raw LOC JSON-LD, send it to backend for proper parsing
    if (data['@graph'] || (typeof data === 'object' && !data.work)) {
      try {
        // Send to backend parser
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/parse-jsonld`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ jsonld: data }),
          }
        );

        if (response.ok) {
          const parsed = await response.json();
          return parsed;
        }
      } catch (error) {
        console.error('Backend parsing failed, using client-side fallback:', error);
      }
    }

    // Fallback: Simple extraction for Moon format
    const work = data.work || data['@graph']?.find((item: any) => 
      item['@type']?.includes('Work') || item['@type']?.includes('bf:Work')
    ) || { '@type': 'bf:Work', '@id': `http://example.org/work/${Date.now()}` };

    const instance = data.instance || data['@graph']?.find((item: any) => 
      item['@type']?.includes('Instance') || item['@type']?.includes('bf:Instance')
    ) || { '@type': 'bf:Instance', '@id': `http://example.org/instance/${Date.now()}` };

    return {
      '@context': data['@context'] || {
        bf: 'http://id.loc.gov/ontologies/bibframe/',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      },
      work,
      instance,
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        cataloger: 'Imported from file',
        resourceType: 'Imported Record',
      },
    };
  };

  const parseRDFXML = async (text: string): Promise<BIBFRAMERecord> => {
    // Send RDF/XML to backend for parsing
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/parse-rdfxml`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ rdfxml: text }),
        }
      );

      if (response.ok) {
        return await response.json();
      }

      throw new Error('Backend RDF/XML parsing failed');
    } catch (error) {
      console.error('Backend RDF/XML parsing failed, using simple extraction:', error);
      
      // Fallback: Simple DOM parsing
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML format');
      }

      // Extract basic Work and Instance info
      const work: any = {
        '@type': 'bf:Work',
        '@id': `http://example.org/work/${Date.now()}`,
      };

      const instance: any = {
        '@type': 'bf:Instance',
        '@id': `http://example.org/instance/${Date.now()}`,
      };

      // Extract title
      const titleElements = xmlDoc.getElementsByTagNameNS('http://id.loc.gov/ontologies/bibframe/', 'title');
      if (titleElements.length > 0) {
        const mainTitle = titleElements[0].textContent || 'Untitled';
        work['bf:title'] = {
          '@type': 'bf:Title',
          'bf:mainTitle': mainTitle,
        };
        instance['bf:title'] = work['bf:title'];
      }

      return {
        '@context': {
          bf: 'http://id.loc.gov/ontologies/bibframe/',
          rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
          rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        },
        work,
        instance,
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          cataloger: 'Imported from RDF/XML',
          resourceType: 'Imported Record',
        },
      };
    }
  };

  const handleImport = () => {
    if (parsedRecord) {
      onImport(parsedRecord);
      onClose();
      toast.success('Record imported successfully!');
      // Reset
      setPreview(null);
      setParsedRecord(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {t('import')} / استيراد ملف
          </DialogTitle>
          <DialogDescription>
            Import a BIBFRAME record from JSON-LD or RDF/XML file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/10'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">
              Drop your file here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports: JSON-LD (.json, .jsonld) and RDF/XML (.xml, .rdf)
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".json,.jsonld,.xml,.rdf"
              onChange={handleFileInput}
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileJson className="h-4 w-4 mr-2" />
                Browse Files
              </label>
            </Button>
          </div>

          {/* Processing Indicator */}
          {processing && (
            <div className="flex items-center justify-center gap-2 text-primary">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span>Processing file...</span>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {parsedRecord ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                <h3 className="font-semibold">File Preview</h3>
              </div>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-x-auto max-h-48">
                {preview}
              </pre>
            </div>
          )}

          {/* Parsed Record Info */}
          {parsedRecord && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                ✓ Record parsed successfully
              </h3>
              <div className="text-sm space-y-1 text-green-700 dark:text-green-300">
                <p>
                  <strong>Title:</strong>{' '}
                  {parsedRecord.work['bf:title']?.['bf:mainTitle'] ||
                    parsedRecord.instance['bf:title']?.['bf:mainTitle'] ||
                    'Untitled'}
                </p>
                <p>
                  <strong>Work ID:</strong> {parsedRecord.work['@id']}
                </p>
                <p>
                  <strong>Instance ID:</strong> {parsedRecord.instance['@id']}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleImport}
              disabled={!parsedRecord}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Record
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}