import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, Link, FileText, Loader2 } from 'lucide-react';
import { BIBFRAMERecord } from '../types/bibframe';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { Input } from './ui/input';

interface ImportRecordDialogProps {
  onImport: (record: BIBFRAMERecord) => void;
}

export function ImportRecordDialog({ onImport }: ImportRecordDialogProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importFormat, setImportFormat] = useState<'rdf-xml' | 'json-ld' | 'uri'>('uri');
  const [rdfXml, setRdfXml] = useState('');
  const [jsonLd, setJsonLd] = useState('');
  const [uri, setUri] = useState('');
  const [error, setError] = useState('');

  const handleImportFromURI = async () => {
    if (!uri) {
      setError('Please provide a URI');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Importing from URI:', uri);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/load-bibframe?uri=${encodeURIComponent(uri)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Import error:', errorData);
        throw new Error(errorData.error || 'Failed to load resource from URI');
      }

      const record = await response.json();
      console.log('Loaded record:', record);
      
      // Validate record has required structure
      if (!record.work || !record.instance) {
        throw new Error('Invalid BIBFRAME record structure');
      }
      
      onImport(record);
      setIsOpen(false);
      resetForm();
    } catch (err) {
      console.error('URI import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import record');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFromRDF = async () => {
    if (!rdfXml) {
      setError('Please provide RDF/XML content');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/import-bibframe-rdf`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rdfXml }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to import RDF/XML');
      }

      const record = await response.json();
      onImport(record);
      setIsOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import record');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFromJSONLD = async () => {
    if (!jsonLd) {
      setError('Please provide JSON-LD content');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const parsed = JSON.parse(jsonLd);
      
      // Try to extract work and instance from JSON-LD
      // This is a simplified parser - you may need to enhance it based on your JSON-LD structure
      const record: BIBFRAMERecord = {
        '@context': {
          bf: 'http://id.loc.gov/ontologies/bibframe/',
          rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
          rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        },
        work: parsed.work || {
          '@type': 'bf:Work',
          '@id': parsed['@id'] || `http://example.org/work/${Date.now()}`,
        },
        instance: parsed.instance || {
          '@type': 'bf:Instance',
          '@id': `http://example.org/instance/${Date.now()}`,
          'bf:instanceOf': {
            '@id': parsed.work?.['@id'] || parsed['@id'] || '',
          },
        },
      };

      onImport(record);
      setIsOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse JSON-LD');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    switch (importFormat) {
      case 'uri':
        handleImportFromURI();
        break;
      case 'rdf-xml':
        handleImportFromRDF();
        break;
      case 'json-ld':
        handleImportFromJSONLD();
        break;
    }
  };

  const resetForm = () => {
    setRdfXml('');
    setJsonLd('');
    setUri('');
    setError('');
  };

  const sampleJSONLD = `{
  "work": {
    "@type": "bf:Work",
    "@id": "http://id.loc.gov/resources/works/12618072",
    "bf:title": {
      "@type": "bf:Title",
      "bf:mainTitle": "The knitter's handy book of patterns"
    }
  },
  "instance": {
    "@type": "bf:Instance",
    "@id": "http://id.loc.gov/resources/instances/12618072",
    "bf:instanceOf": {
      "@id": "http://id.loc.gov/resources/works/12618072"
    }
  }
}`;

  const sampleRDFXML = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:bf="http://id.loc.gov/ontologies/bibframe/">
  <bf:Work rdf:about="http://example.org/work/1">
    <bf:title>
      <bf:Title>
        <bf:mainTitle>Sample Title</bf:mainTitle>
      </bf:Title>
    </bf:title>
  </bf:Work>
</rdf:RDF>`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import Record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Import BIBFRAME Record</DialogTitle>
          <DialogDescription>
            Import a BIBFRAME record from RDF/XML, JSON-LD, or a URI
          </DialogDescription>
        </DialogHeader>

        <Tabs value={importFormat} onValueChange={(v) => setImportFormat(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="uri">
              <Link className="h-4 w-4 mr-2" />
              From URI
            </TabsTrigger>
            <TabsTrigger value="json-ld">
              <FileText className="h-4 w-4 mr-2" />
              JSON-LD
            </TabsTrigger>
            <TabsTrigger value="rdf-xml">
              <FileText className="h-4 w-4 mr-2" />
              RDF/XML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="uri" className="space-y-4">
            <div>
              <Label>BIBFRAME Resource URI</Label>
              <Input
                type="url"
                placeholder="https://id.loc.gov/resources/works/..."
                value={uri}
                onChange={(e) => setUri(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                Example: https://id.loc.gov/resources/works/12618072
              </p>
            </div>
          </TabsContent>

          <TabsContent value="json-ld" className="space-y-4">
            <div>
              <Label>JSON-LD Content</Label>
              <Textarea
                placeholder="Paste JSON-LD content here..."
                value={jsonLd}
                onChange={(e) => setJsonLd(e.target.value)}
                className="mt-2 font-mono text-sm h-[300px]"
              />
              <details className="mt-2">
                <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                  Show example JSON-LD
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                  {sampleJSONLD}
                </pre>
              </details>
            </div>
          </TabsContent>

          <TabsContent value="rdf-xml" className="space-y-4">
            <div>
              <Label>RDF/XML Content</Label>
              <Textarea
                placeholder="Paste RDF/XML content here..."
                value={rdfXml}
                onChange={(e) => setRdfXml(e.target.value)}
                className="mt-2 font-mono text-sm h-[300px]"
              />
              <details className="mt-2">
                <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                  Show example RDF/XML
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                  {sampleRDFXML}
                </pre>
              </details>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}