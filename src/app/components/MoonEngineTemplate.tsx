/**
 * Moon Engine Template - Ontology-Driven BIBFRAME Cataloging
 * 
 * This template is dynamically generated from the BIBFRAME ontology.
 * Fields are rendered based on their property definitions, not hardcoded.
 * 
 * Features:
 * - Automatic field generation from ontology
 * - Live LOC API integration
 * - RDF graph building
 * - Proper entity linking (URIs, not strings)
 * - SPARQL-ready output
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Save, 
  Download, 
  FileJson, 
  FileCode, 
  Globe,
  Sparkles,
  BookOpen,
  Package,
  AlertCircle,
  Upload,
  Eye,
  Network,
  FileText,
  Database,
  Sparkle,
  UserPlus,
  X
} from 'lucide-react';
import { OntologyField } from './ontology/OntologyField';
import { getPropertiesForDomain } from '../services/bibframeOntologyEngine';
import { buildBibframeGraph, quadsToTurtle, generateUri } from '../services/graphBuilder';
import { generateMARCFromBibframe } from '../services/marcGenerator';
import { OPACPreview } from './ontology/OPACPreview';
import { MindMapPreview } from './ontology/MindMapPreview';
import { ImportRecordDialog } from './ontology/ImportRecordDialog';
import { AuthoritySearchDialog } from './AuthoritySearchDialog';
import type { UnifiedPerson } from '../services/authorityHub/types';
import { allRealExamples, getRandomExample } from '../utils/moonEngineExamples';
import { Toaster } from './ui/sonner';
import moonLogo from 'figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png';

interface MoonEngineTemplateProps {
  onBack?: () => void;
}

export function MoonEngineTemplate({ onBack }: MoonEngineTemplateProps) {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<'en' | 'ar'>(i18n.language as 'en' | 'ar');
  
  // Work and Instance data
  const [workData, setWorkData] = useState<any>({
    '@type': 'bf:Work',
    '@id': generateUri('work')
  });
  
  const [instanceData, setInstanceData] = useState<any>({
    '@type': 'bf:Instance',
    '@id': generateUri('instance')
  });

  // Preview format
  const [previewFormat, setPreviewFormat] = useState<'jsonld' | 'turtle' | 'graph' | 'marc' | 'opac' | 'mindmap'>('jsonld');
  
  // Import dialog
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  // Example selector dropdown
  const [showExampleMenu, setShowExampleMenu] = useState(false);
  
  // Authority search dialog
  const [showAuthorityDialog, setShowAuthorityDialog] = useState(false);

  // Get properties for each domain
  const workProperties = getPropertiesForDomain('bf:Work');
  const instanceProperties = getPropertiesForDomain('bf:Instance');

  /**
   * Update a Work property
   */
  const updateWorkProperty = useCallback((uri: string, value: any) => {
    const propertyName = uri.split('/').pop() || uri;
    setWorkData((prev: any) => ({
      ...prev,
      [propertyName]: value
    }));
  }, []);

  /**
   * Update an Instance property
   */
  const updateInstanceProperty = useCallback((uri: string, value: any) => {
    const propertyName = uri.split('/').pop() || uri;
    setInstanceData((prev: any) => ({
      ...prev,
      [propertyName]: value
    }));
  }, []);

  /**
   * Build RDF Graph
   */
  const graph = buildBibframeGraph(workData, instanceData);

  /**
   * Get preview content based on format
   */
  const getPreviewContent = () => {
    switch (previewFormat) {
      case 'jsonld':
        return JSON.stringify({
          '@context': 'http://id.loc.gov/ontologies/bibframe/',
          '@graph': graph['@graph']
        }, null, 2);
      
      case 'turtle':
        return quadsToTurtle(graph.quads);
      
      case 'graph':
        return JSON.stringify({
          quads: graph.quads.map(q => ({
            subject: q.subject,
            predicate: q.predicate,
            object: typeof q.object === 'string' ? q.object : q.object.value
          }))
        }, null, 2);
      
      case 'marc':
        return generateMARCFromBibframe(workData, instanceData);
      
      default:
        return '';
    }
  };

  /**
   * Handle import
   */
  const handleImport = (importedWorkData: any, importedInstanceData: any) => {
    setWorkData({
      ...importedWorkData,
      '@id': importedWorkData['@id'] || generateUri('work')
    });
    setInstanceData({
      ...importedInstanceData,
      '@id': importedInstanceData['@id'] || generateUri('instance')
    });
  };

  /**
   * Load a real example
   */
  const handleLoadExample = (exampleData: any) => {
    if (!exampleData) {
      toast.error('Invalid example data');
      return;
    }

    if (exampleData.work) {
      setWorkData({
        ...exampleData.work,
        '@id': exampleData.work['@id'] || generateUri('work')
      });
    }
    
    if (exampleData.instance) {
      setInstanceData({
        ...exampleData.instance,
        '@id': exampleData.instance['@id'] || generateUri('instance')
      });
    }
    setShowExampleMenu(false);
  };

  /**
   * Load random example
   */
  const handleLoadRandomExample = () => {
    const example = getRandomExample();
    handleLoadExample(example.data);
    toast.success(`✨ Loaded Real Example: ${example.name}`, {
      description: 'This is a complete, real-world BIBFRAME record with proper URIs and RDF graph structure.',
      duration: 4000,
    });
  };

  /**
   * Handle authority selection
   */
  const handleAuthoritySelect = (person: UnifiedPerson) => {
    // Create a bf:Contribution object
    const contribution = {
      '@type': 'bf:Contribution',
      'bf:agent': {
        '@id': person.identifiers.loc 
          ? `http://id.loc.gov/authorities/names/${person.identifiers.loc}`
          : person.uri,
        '@type': 'bf:Person',
        'rdfs:label': person.label
      },
      'bf:role': {
        '@id': 'http://id.loc.gov/vocabulary/relators/aut',
        'rdfs:label': 'Author'
      }
    };

    // Add to work data
    setWorkData((prev: any) => {
      const existingContributions = prev['bf:contribution'] || prev['contribution'] || [];
      return {
        ...prev,
        'bf:contribution': Array.isArray(existingContributions) 
          ? [...existingContributions, contribution]
          : [contribution]
      };
    });

    toast.success(`Added contributor: ${person.label}`, {
      description: person.identifiers.loc ? `LOC URI: ${person.identifiers.loc}` : 'Local authority',
      duration: 3000,
    });
  };

  /**
   * Save record to REAL database (Supabase)
   */
  const handleSave = async () => {
    try {
      const record = {
        '@context': 'http://id.loc.gov/ontologies/bibframe/',
        '@graph': graph['@graph'],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          editor: 'Moon Engine',
          version: '1.0.0'
        }
      };

      // Get access token
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        toast.error('Please log in to save records');
        return;
      }

      // Save to Supabase backend
      const response = await fetch('/make-server-49c0e13c/save-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(record)
      });

      if (!response.ok) {
        throw new Error('Failed to save record');
      }

      const result = await response.json();
      
      toast.success('Record saved permanently!', {
        description: `${graph.quads.length} RDF triples saved to Supabase database.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save record', {
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 4000,
      });
    }
  };

  /**
   * Download as file
   */
  const handleDownload = (format: 'jsonld' | 'turtle') => {
    const content = format === 'jsonld' 
      ? JSON.stringify(graph, null, 2)
      : quadsToTurtle(graph.quads);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibframe-record-${Date.now()}.${format === 'jsonld' ? 'jsonld' : 'ttl'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={moonLogo} alt="Moon Logo" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Moon Engine
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Ontology-Driven
                </Badge>
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dynamic BIBFRAME cataloging powered by RDF graphs
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Load Real Example Button with Dropdown */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowExampleMenu(!showExampleMenu)}
                className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700 hover:from-green-100 hover:to-emerald-100"
              >
                <Database className="h-4 w-4 mr-2" />
                Load Real Example
              </Button>
              
              {showExampleMenu && (
                <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl z-[99999] min-w-[280px]" style={{ isolation: 'isolate' }}>
                  <div className="p-2 border-b dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-2 py-1">
                      Choose a Real BIBFRAME Example
                    </p>
                  </div>
                  <div className="p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left mb-1 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      onClick={handleLoadRandomExample}
                    >
                      <Sparkle className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="font-medium">Random Example</span>
                    </Button>
                    {allRealExamples.map((example, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left mb-1"
                        onClick={() => {
                          handleLoadExample(example.data);
                          toast.success(`📚 Loaded: ${example.name}`, {
                            description: 'Real BIBFRAME record with complete metadata and URIs.',
                            duration: 3000,
                          });
                        }}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span className="text-sm">{example.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>

            <Button variant="outline" size="sm" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}>
              <Globe className="h-4 w-4 mr-2" />
              {language === 'en' ? 'العربية' : 'English'}
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => handleDownload('jsonld')}>
              <FileJson className="h-4 w-4 mr-2" />
              JSON-LD
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => handleDownload('turtle')}>
              <FileCode className="h-4 w-4 mr-2" />
              Turtle
            </Button>
            
            <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Save className="h-4 w-4 mr-2" />
              Save Record
            </Button>
            
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Info Alert */}
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  About Moon Engine
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  This template dynamically generates fields from the BIBFRAME ontology. 
                  Each field knows its domain, range, MARC mapping, and which LOC API to use. 
                  The output is a proper RDF graph with URIs, not just JSON strings.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className="bg-blue-600">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {workProperties.length} Work Properties
                  </Badge>
                  <Badge className="bg-purple-600">
                    <Package className="h-3 w-3 mr-1" />
                    {instanceProperties.length} Instance Properties
                  </Badge>
                  <Badge className="bg-green-600">
                    {graph.quads.length} RDF Triples
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="work" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <TabsTrigger 
                value="work"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:font-semibold transition-all duration-200"
              >
                {language === 'ar' ? 'العمل' : 'Work'} (bf:Work)
              </TabsTrigger>
              <TabsTrigger 
                value="instance"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:font-semibold transition-all duration-200"
              >
                {language === 'ar' ? 'النسخة' : 'Instance'} (bf:Instance)
              </TabsTrigger>
              <TabsTrigger 
                value="admin"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:font-semibold transition-all duration-200"
              >
                {language === 'ar' ? 'البيانات الإدارية' : 'Admin Metadata'}
              </TabsTrigger>
              <TabsTrigger 
                value="preview"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:font-semibold transition-all duration-200"
              >
                {language === 'ar' ? 'المعاينة' : 'Preview'}
              </TabsTrigger>
            </TabsList>

            {/* WORK TAB */}
            <TabsContent value="work" className="space-y-6">
              {/* Contributors Section - Integrated Authority Search */}
              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-blue-600" />
                      Contributors (bf:contribution)
                    </div>
                    <Button 
                      onClick={() => setShowAuthorityDialog(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                      size="sm"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add from Authority
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Search LOC, VIAF, Wikidata, and AfIqa for verified authority records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const contributions = workData['bf:contribution'] || workData['contribution'] || [];
                    if (!Array.isArray(contributions) || contributions.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                          <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No contributors added yet</p>
                          <p className="text-sm">Click "Add from Authority" to search for contributors</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-3">
                        {contributions.map((contrib: any, idx: number) => {
                          const agent = contrib['bf:agent'] || contrib.agent || {};
                          const role = contrib['bf:role'] || contrib.role || {};
                          const label = agent['rdfs:label'] || agent.label || 'Unknown';
                          const roleLabel = role['rdfs:label'] || role.label || 'Contributor';
                          const uri = agent['@id'] || agent.id || '';
                          const isLOC = uri.includes('id.loc.gov');
                          
                          return (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border rounded-lg hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 dark:text-blue-300 font-bold text-lg">
                                    {label.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-white">{label}</div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Badge variant="outline" className="text-xs">{roleLabel}</Badge>
                                    {isLOC && (
                                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 text-xs">
                                        LOC Linked
                                      </Badge>
                                    )}
                                  </div>
                                  {uri && (
                                    <div className="text-xs text-gray-400 mt-1 font-mono truncate max-w-md">
                                      {uri}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setWorkData((prev: any) => ({
                                    ...prev,
                                    'bf:contribution': contributions.filter((_: any, i: number) => i !== idx)
                                  }));
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Work Entity - Conceptual Content
                  </CardTitle>
                  <CardDescription>
                    The abstract intellectual or artistic content of the resource.
                    Fields are generated from BIBFRAME ontology properties.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {workProperties.map((property) => (
                    <div key={property.uri} className="pb-6 border-b last:border-b-0 dark:border-gray-700">
                      <OntologyField
                        property={property}
                        value={workData[property.uri.split('/').pop() || '']}
                        onChange={(value) => updateWorkProperty(property.uri, value)}
                        language={language}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* INSTANCE TAB */}
            <TabsContent value="instance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Instance Entity - Physical Manifestation
                  </CardTitle>
                  <CardDescription>
                    The physical or digital embodiment of the work.
                    Fields are generated from BIBFRAME ontology properties.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {instanceProperties.map((property) => (
                    <div key={property.uri} className="pb-6 border-b last:border-b-0 dark:border-gray-700">
                      <OntologyField
                        property={property}
                        value={instanceData[property.uri.split('/').pop() || '']}
                        onChange={(value) => updateInstanceProperty(property.uri, value)}
                        language={language}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ADMIN METADATA TAB */}
            <TabsContent value="admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Administrative Metadata</CardTitle>
                  <CardDescription>
                    Cataloging source, creation date, and other admin information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Cataloging Source (040 $a)</label>
                      <input
                        type="text"
                        className="w-full mt-1 p-2 border rounded-md"
                        placeholder="Organization code"
                        defaultValue="Moon"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Cataloging Language (040 $b)</label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option value="eng">English (eng)</option>
                        <option value="ara">Arabic (ara)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description Conventions (040 $e)</label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option value="rda">RDA</option>
                        <option value="aacr2">AACR2</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option value="new">New</option>
                        <option value="updated">Updated</option>
                        <option value="corrected">Corrected</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PREVIEW TAB */}
            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCode className="h-5 w-5" />
                      Preview Options
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={previewFormat === 'mindmap' ? 'default' : 'outline'}
                        onClick={() => setPreviewFormat('mindmap')}
                      >
                        <Network className="h-4 w-4 mr-1" />
                        Mind Map
                      </Button>
                      <Button
                        size="sm"
                        variant={previewFormat === 'opac' ? 'default' : 'outline'}
                        onClick={() => setPreviewFormat('opac')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        OPAC
                      </Button>
                      <Button
                        size="sm"
                        variant={previewFormat === 'marc' ? 'default' : 'outline'}
                        onClick={() => setPreviewFormat('marc')}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        MARC
                      </Button>
                      <Button
                        size="sm"
                        variant={previewFormat === 'jsonld' ? 'default' : 'outline'}
                        onClick={() => setPreviewFormat('jsonld')}
                      >
                        JSON-LD
                      </Button>
                      <Button
                        size="sm"
                        variant={previewFormat === 'turtle' ? 'default' : 'outline'}
                        onClick={() => setPreviewFormat('turtle')}
                      >
                        Turtle
                      </Button>
                      <Button
                        size="sm"
                        variant={previewFormat === 'graph' ? 'default' : 'outline'}
                        onClick={() => setPreviewFormat('graph')}
                      >
                        Graph
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {previewFormat === 'mindmap' && 'Visual representation of the BIBFRAME graph'}
                    {previewFormat === 'opac' && 'How the record appears in a public catalog'}
                    {previewFormat === 'marc' && 'MARC21 format conversion'}
                    {(previewFormat === 'jsonld' || previewFormat === 'turtle' || previewFormat === 'graph') && 
                      'RDF output with URIs and entity linking. SPARQL-ready.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {previewFormat === 'mindmap' ? (
                    <div className="h-[600px] rounded-lg overflow-hidden">
                      <MindMapPreview workData={workData} instanceData={instanceData} />
                    </div>
                  ) : previewFormat === 'opac' ? (
                    <OPACPreview workData={workData} instanceData={instanceData} />
                  ) : (
                    <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-auto max-h-[600px] text-sm font-mono">
                      {getPreviewContent()}
                    </pre>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Import Dialog */}
      <ImportRecordDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
      />

      {/* Authority Search Dialog */}
      <AuthoritySearchDialog
        isOpen={showAuthorityDialog}
        onClose={() => setShowAuthorityDialog(false)}
        onSelect={handleAuthoritySelect}
      />

      {/* Toast Notifications */}
      <Toaster richColors position="top-right" />
    </div>
  );
}