/**
 * Moon Engine Enhanced - With Multi-Authority and Marva View
 * 
 * Features:
 * - Multi-authority search (LOC, VIAF, Wikidata, AfIqa)
 * - Dual view mode: Form View (current) + Marva View (detailed)
 * - Real example loading
 * - Complete BIBFRAME cataloging
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Save, Download, FileJson, Globe, BookOpen, Package,
  Upload, Eye, Database, Layout, List, ChevronLeft,
  Search, User, Building, MapPin, Tag, Sparkles
} from 'lucide-react';
import { OntologyField } from './ontology/OntologyField';
import { getPropertiesForDomain } from '../services/bibframeOntologyEngine';
import { buildBibframeGraph, quadsToTurtle, generateUri } from '../services/graphBuilder';
import { generateMARCFromBibframe } from '../services/marcGenerator';
import { OPACPreview } from './ontology/OPACPreview';
import { ImportRecordDialog } from './ontology/ImportRecordDialog';
import { allRealExamples, getRandomExample } from '../utils/moonEngineExamples';
import { AuthoritySearchDialog } from './AuthoritySearchDialog';
import { MultiViewRecord } from './RecordView/MultiViewRecord';
import type { UnifiedPerson } from '../services/authorityHub/types';
import { Toaster } from './ui/sonner';
import moonLogo from 'figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png';

interface MoonEngineEnhancedProps {
  onBack?: () => void;
}

type ViewMode = 'form' | 'marva';
type AuthorityTab = 'names' | 'personal' | 'corporate' | 'conference' | 'geographic' | 'all' | 'wikidata';

export function MoonEngineEnhanced({ onBack }: MoonEngineEnhancedProps) {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<'en' | 'ar'>(i18n.language as 'en' | 'ar');
  
  // View mode toggle
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  
  // Work and Instance data
  const [workData, setWorkData] = useState<any>({
    '@type': 'bf:Work',
    '@id': generateUri('work')
  });
  
  const [instanceData, setInstanceData] = useState<any>({
    '@type': 'bf:Instance',
    '@id': generateUri('instance')
  });

  // Authority search
  const [showAuthoritySearch, setShowAuthoritySearch] = useState(false);
  const [currentAuthorityTab, setCurrentAuthorityTab] = useState<AuthorityTab>('names');
  const [authoritySearchQuery, setAuthoritySearchQuery] = useState('');
  
  // Dialogs
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExampleMenu, setShowExampleMenu] = useState(false);

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
    toast.success('Record imported successfully!');
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
    toast.success(`✨ Loaded Real Example`, {
      description: 'Complete BIBFRAME record with proper URIs and RDF graph structure.',
      duration: 4000,
    });
  };

  /**
   * Load random example
   */
  const handleLoadRandomExample = () => {
    const example = getRandomExample();
    handleLoadExample(example.data);
  };

  /**
   * Save record
   */
  const handleSave = () => {
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

    // Save to localStorage
    const existingRecords = JSON.parse(localStorage.getItem('bibframe-records') || '[]');
    existingRecords.push(record);
    localStorage.setItem('bibframe-records', JSON.stringify(existingRecords));

    toast.success('Record saved successfully!', {
      description: `Saved to local storage. ${existingRecords.length} total records.`,
    });
  };

  /**
   * Handle authority selection
   */
  const handleAuthoritySelect = (person: UnifiedPerson) => {
    // Convert to URI reference
    const uriRef = {
      '@id': person.identifiers.loc 
        ? `http://id.loc.gov/authorities/names/${person.identifiers.loc}`
        : person.identifiers.wikidata
        ? `https://www.wikidata.org/entity/${person.identifiers.wikidata}`
        : person.id,
      'rdfs:label': person.label,
      '@type': 'bf:Agent'
    };

    // Add to work data as creator
    updateWorkProperty('http://id.loc.gov/ontologies/bibframe/creator', uriRef);
    
    toast.success('Authority linked!', {
      description: `${person.label} added as creator with URI reference.`,
    });
  };

  /**
   * Open authority search with context
   */
  const openAuthoritySearch = (tab: AuthorityTab = 'names', query: string = '') => {
    setCurrentAuthorityTab(tab);
    setAuthoritySearchQuery(query);
    setShowAuthoritySearch(true);
  };

  // Form View Content
  const formViewContent = (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Column - Work */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Work
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
            {workProperties.map((property) => (
              <OntologyField
                key={property.uri}
                property={property}
                value={workData[property.uri.split('/').pop() || '']}
                onChange={(value) => updateWorkProperty(property.uri, value)}
                language={language}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Instance */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Instance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
            {instanceProperties.map((property) => (
              <OntologyField
                key={property.uri}
                property={property}
                value={instanceData[property.uri.split('/').pop() || '']}
                onChange={(value) => updateInstanceProperty(property.uri, value)}
                language={language}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Marva View Content (using MultiViewRecord)
  const marvaViewContent = (
    <MultiViewRecord
      data={{
        work: workData,
        instance: instanceData,
        admin: {
          recordId: workData['@id'],
          creationDate: new Date().toISOString(),
          status: 'new'
        }
      }}
      formView={formViewContent}
      authorityNodes={[]} // TODO: Extract from workData authorities
    />
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />

      {/* Top Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              <img src={moonLogo} alt="Moon Logo" className="h-16 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Moon Engine
                </h1>
                <p className="text-sm text-gray-500">Ontology-Driven BIBFRAME Cataloging</p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'form' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('form')}
              >
                <Layout className="h-4 w-4 mr-2" />
                Form View
              </Button>
              <Button
                variant={viewMode === 'marva' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('marva')}
              >
                <List className="h-4 w-4 mr-2" />
                Marva View
              </Button>
            </div>
          </div>

          {/* Authority Search Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <AuthorityTabButton
              active={currentAuthorityTab === 'names'}
              onClick={() => openAuthoritySearch('names')}
              icon={<User className="h-4 w-4" />}
              label="NAF Auth Names"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === 'personal'}
              onClick={() => openAuthoritySearch('personal')}
              label="NAF Personal Names"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === 'corporate'}
              onClick={() => openAuthoritySearch('corporate')}
              icon={<Building className="h-4 w-4" />}
              label="NAF Corporate Name"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === 'conference'}
              onClick={() => openAuthoritySearch('conference')}
              label="NAF Conference Name"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === 'geographic'}
              onClick={() => openAuthoritySearch('geographic')}
              icon={<MapPin className="h-4 w-4" />}
              label="NAF Geographic"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === 'all'}
              onClick={() => openAuthoritySearch('all')}
              icon={<Tag className="h-4 w-4" />}
              label="NAF All"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === 'wikidata'}
              onClick={() => openAuthoritySearch('wikidata')}
              icon={<Globe className="h-4 w-4" />}
              label="Wikidata"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4">
            <Button variant="default" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Record
            </Button>

            {/* Load Real Example Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExampleMenu(!showExampleMenu)}
              >
                <Database className="h-4 w-4 mr-2" />
                Load Real Example
              </Button>

              {showExampleMenu && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b">
                      Select Example Record
                    </div>
                    {allRealExamples.map((example) => (
                      <button
                        key={example.id}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        onClick={() => handleLoadExample(example.data)}
                      >
                        <div className="font-medium text-sm">{example.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{example.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const blob = new Blob([JSON.stringify(graph, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'bibframe-record.json';
                a.click();
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON-LD
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        {viewMode === 'form' ? formViewContent : marvaViewContent}
      </div>

      {/* Authority Search Dialog */}
      <AuthoritySearchDialog
        isOpen={showAuthoritySearch}
        onClose={() => setShowAuthoritySearch(false)}
        onSelect={handleAuthoritySelect}
        initialQuery={authoritySearchQuery}
      />

      {/* Import Dialog */}
      <ImportRecordDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
      />
    </div>
  );
}

// Authority Tab Button Component
interface AuthorityTabButtonProps {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
}

function AuthorityTabButton({ active, onClick, icon, label }: AuthorityTabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium
        ${active 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}