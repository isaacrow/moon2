/**
 * Moon Engine Classic - Traditional Library Edition
 * 
 * Features:
 * - Classic library catalog aesthetics
 * - Parchment and leather textures
 * - Traditional serif typography
 * - Academic/professional design
 * - Burgundy and gold accents
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Save, Download, Upload, ChevronLeft, Search, User, Building, 
  MapPin, Tag, Globe, BookOpen, Package, Eye, Network, Database,
  FileText, Code, Braces, Sparkles, Book, Library
} from 'lucide-react';
import { OntologyField } from './ontology/OntologyField';
import { getPropertiesForDomain } from '../services/bibframeOntologyEngine';
import { buildBibframeGraph, quadsToTurtle, generateUri } from '../services/graphBuilder';
import { generateMARCFromBibframe } from '../services/marcGenerator';
import { OPACPreview } from './ontology/OPACPreview';
import { MindMapPreview } from './ontology/MindMapPreview';
import { ImportRecordDialog } from './ontology/ImportRecordDialog';
import { realLocExamples, getRandomRealExample } from '../utils/realLocExamples';
import { AuthoritySearchDialog } from './AuthoritySearchDialog';
import { AuthorityGraph } from './AuthorityGraph';
import { MarcView } from './RecordView/MarcView';
import { RdfView } from './RecordView/RdfView';
import { OPACView } from './RecordView/OPACView';
import type { UnifiedPerson } from '../services/authorityHub/types';
import { Toaster } from './ui/sonner';
import { authorityHub } from '../services/authorityHub/authorityHubService';
import moonLogo from 'figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png';
import '../../styles/classic-theme.css';

interface MoonEngineClassicProps {
  onBack?: () => void;
}

type AuthorityTab = 'names' | 'personal' | 'corporate' | 'conference' | 'geographic' | 'all' | 'wikidata';
type PreviewTab = 'form' | 'graph' | 'marc' | 'rdf' | 'json' | 'opac' | 'mindmap';

// Helper function to safely extract label from RDF data
const getLabelString = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value['rdfs:label']) return getLabelString(value['rdfs:label']);
  if (typeof value === 'object' && value['@value']) return value['@value'];
  return String(value);
};

export function MoonEngineClassic({ onBack }: MoonEngineClassicProps) {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<'en' | 'ar'>(i18n.language as 'en' | 'ar');
  
  // Work and Instance data
  const [workData, setWorkData] = useState<any>({
    '@type': 'bf:Work',
    '@id': generateUri('work'),
    'bf:contribution': []
  });
  
  const [instanceData, setInstanceData] = useState<any>({
    '@type': 'bf:Instance',
    '@id': generateUri('instance')
  });

  // FIX 1: ROBUST PERSISTENCE - Auto-load on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem('moon_current_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only load if we have valid data
        if (parsed.work && parsed.instance) {
          setWorkData(parsed.work);
          setInstanceData(parsed.instance);
          toast.success('Restored previous session', {
            description: 'Your last cataloging session was recovered.',
            duration: 3000,
          });
        }
      }
    } catch (e) {
      console.error('Failed to load draft', e);
      toast.error('Could not restore previous session');
    }
  }, []);

  // Authority search
  const [showAuthoritySearch, setShowAuthoritySearch] = useState(false);
  const [currentAuthorityTab, setCurrentAuthorityTab] = useState<AuthorityTab>('names');
  
  // All Sources Search
  const [allSourceQuery, setAllSourceQuery] = useState('');
  const [allSourceResults, setAllSourceResults] = useState<any[]>([]);
  const [searchingAll, setSearchingAll] = useState(false);
  
  // Preview tab
  const [previewTab, setPreviewTab] = useState<PreviewTab>('form');
  
  // Dialogs
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExampleMenu, setShowExampleMenu] = useState(false);

  // Get properties for each domain
  const workProperties = getPropertiesForDomain('bf:Work');
  const instanceProperties = getPropertiesForDomain('bf:Instance');

  const updateWorkProperty = useCallback((uri: string, value: any) => {
    const propertyName = uri.split('/').pop() || uri;
    setWorkData((prev: any) => ({
      ...prev,
      [propertyName]: value
    }));
  }, []);

  const updateInstanceProperty = useCallback((uri: string, value: any) => {
    const propertyName = uri.split('/').pop() || uri;
    setInstanceData((prev: any) => ({
      ...prev,
      [propertyName]: value
    }));
  }, []);

  const graph = buildBibframeGraph(workData, instanceData);

  const handleAuthoritySelect = (person: UnifiedPerson) => {
    const contribution = {
      '@type': 'bf:Contribution',
      'bf:agent': {
        '@id': person.identifiers.loc 
          ? `http://id.loc.gov/authorities/names/${person.identifiers.loc}`
          : person.identifiers.wikidata
          ? `https://www.wikidata.org/entity/${person.identifiers.wikidata}`
          : person.id,
        '@type': 'bf:Person',
        'rdfs:label': person.label
      },
      'bf:role': {
        '@id': 'http://id.loc.gov/vocabulary/relators/aut',
        'rdfs:label': 'Author'
      }
    };

    setWorkData((prev: any) => ({
      ...prev,
      'bf:contribution': [...(prev['bf:contribution'] || []), contribution]
    }));
    
    toast.success('Contributor added!', {
      description: `${person.label} added to bf:contribution with LOC URI.`,
    });
  };

  const openAuthoritySearch = (tab: AuthorityTab) => {
    setCurrentAuthorityTab(tab);
    setShowAuthoritySearch(true);
  };

  const handleAllSourceSearch = async () => {
    if (!allSourceQuery.trim()) return;

    setSearchingAll(true);
    try {
      const results = await authorityHub.searchAll(allSourceQuery);
      setAllSourceResults(results);
      if (results.length > 0) {
        toast.info(`Found ${results.length} results from all sources`);
      } else {
        toast.info('No results found. Try a different search term.');
      }
    } catch (err) {
      console.error("All source search failed", err);
      toast.warning('Search completed with some errors. Check console for details.');
    } finally {
      setSearchingAll(false);
    }
  };

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
    toast.success(`Loaded Real LOC Example`, {
      description: 'Complete bibliographic record with proper authority URIs.',
      duration: 4000,
    });
  };

  // FIX 3: SMART IMPORT - Handles @graph structure and multiple formats
  const handleImport = (importedWorkData: any, importedInstanceData: any) => {
    setWorkData({
      ...importedWorkData,
      '@id': importedWorkData['@id'] || generateUri('work')
    });
    setInstanceData({
      ...importedInstanceData,
      '@id': importedInstanceData['@id'] || generateUri('instance')
    });
    toast.success('Record imported successfully!', {
      description: 'Work and Instance data loaded.',
      duration: 3000,
    });
  };

  // FIX 4: FILE IMPORT HANDLER - Handles various BIBFRAME formats
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        let newWork = null;
        let newInstance = null;

        // Logic: If it has @graph, split it. If not, check root keys.
        if (json['@graph'] && Array.isArray(json['@graph'])) {
          // Standard JSON-LD format with @graph
          newWork = json['@graph'].find((n: any) => 
            n['@type'] === 'bf:Work' || 
            n['@type']?.includes('bf:Work') ||
            n['@type']?.includes('Work')
          );
          newInstance = json['@graph'].find((n: any) => 
            n['@type'] === 'bf:Instance' || 
            n['@type']?.includes('bf:Instance') ||
            n['@type']?.includes('Instance')
          );
        } else if (json.work && json.instance) {
          // Native Moon Export format
          newWork = json.work;
          newInstance = json.instance;
        } else if (json['@type'] === 'bf:Work' || json['@type']?.includes('Work')) {
          // Single Work object
          newWork = json;
          newInstance = {
            '@type': 'bf:Instance',
            '@id': generateUri('instance'),
            'bf:instanceOf': { '@id': json['@id'] }
          };
        }

        if (newWork && newInstance) {
          setWorkData({
            ...newWork,
            '@id': newWork['@id'] || generateUri('work')
          });
          setInstanceData({
            ...newInstance,
            '@id': newInstance['@id'] || generateUri('instance')
          });
          toast.success('Import Successful!', {
            description: 'Records loaded from file.',
            duration: 3000,
          });
        } else {
          toast.error('Invalid structure', {
            description: 'Could not find Work/Instance in file.',
            duration: 4000,
          });
        }
      } catch (err) {
        console.error('Import error:', err);
        toast.error('Failed to parse file', {
          description: 'Please check the file format.',
          duration: 4000,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    try {
      const jsonldDocument = {
        '@context': 'http://id.loc.gov/ontologies/bibframe/',
        '@graph': graph['@graph'],
        quads: graph.quads
      };

      const titleNode = graph['@graph'].find((node: any) => node['@type'] === 'bf:Title');
      const title = titleNode?.['bf:mainTitle'] || titleNode?.['mainTitle'] || 'Untitled';
      const recordId = `moon-${Date.now()}`;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon-engine/records/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          id: recordId,
          title,
          document: jsonldDocument
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save record');
      }

      toast.success('Record saved!', {
        description: `${title} - Saved to Moon Engine`,
      });
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Failed to save record');
    }
  };

  const authorityNodes = (workData['bf:contribution'] || [])
    .filter((contrib: any) => contrib['bf:agent'])
    .map((contrib: any, index: number) => ({
      id: contrib['bf:agent']['@id'] || `agent-${index}`,
      label: contrib['bf:agent']['rdfs:label'] || 'Unknown',
      source: contrib['bf:agent']['@id']?.includes('loc.gov') ? 'LOC' as const : 'Wikidata' as const,
      uri: contrib['bf:agent']['@id'] || '',
      type: 'person' as const,
      connections: []
    }));

  return (
    <div className="h-screen flex flex-col classic-bg">
      <Toaster position="top-right" />

      {/* Classic Navbar - Like a library header */}
      <div className="classic-navbar">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="classic-button-secondary px-4 py-2 flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm">{t('backButton')}</span>
                </button>
              )}
              <img src={moonLogo} alt="Moon Logo" className="h-16 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3 classic-title">
                  <Library className="h-7 w-7 text-yellow-300" />
                  <span className="classic-embossed">{t('moonEngine')}</span>
                </h1>
                <p className="text-sm text-yellow-200 classic-subtitle">{t('moonEngineSubtitle')}</p>
              </div>
            </div>
          </div>

          {/* Authority Search Tabs - Classic Style */}
          <div className="classic-tab-bar mb-4 overflow-x-auto">
            <ClassicAuthorityTab
              active={currentAuthorityTab === 'names'}
              onClick={() => openAuthoritySearch('names')}
              icon={<User className="h-4 w-4" />}
              label={t('nafAuthNames')}
            />
            <ClassicAuthorityTab
              active={currentAuthorityTab === 'personal'}
              onClick={() => openAuthoritySearch('personal')}
              label={t('nafPersonalNames')}
            />
            <ClassicAuthorityTab
              active={currentAuthorityTab === 'corporate'}
              onClick={() => openAuthoritySearch('corporate')}
              icon={<Building className="h-4 w-4" />}
              label={t('nafCorporateName')}
            />
            <ClassicAuthorityTab
              active={currentAuthorityTab === 'conference'}
              onClick={() => openAuthoritySearch('conference')}
              label={t('nafConferenceName')}
            />
            <ClassicAuthorityTab
              active={currentAuthorityTab === 'geographic'}
              onClick={() => openAuthoritySearch('geographic')}
              icon={<MapPin className="h-4 w-4" />}
              label={t('nafGeographic')}
            />
            <ClassicAuthorityTab
              active={currentAuthorityTab === 'all'}
              onClick={() => openAuthoritySearch('all')}
              icon={<Tag className="h-4 w-4" />}
              label={t('nafAll')}
            />
            <ClassicAuthorityTab
              active={currentAuthorityTab === 'wikidata'}
              onClick={() => openAuthoritySearch('wikidata')}
              icon={<Globe className="h-4 w-4" />}
              label={t('wikidata')}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handleSave} className="classic-button px-5 py-2 flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span className="text-sm">{t('saveRecord')}</span>
            </button>

            <label className="classic-button px-5 py-2 flex items-center gap-2 cursor-pointer">
              <Upload className="h-4 w-4" />
              <span className="text-sm">{t('importFile') || 'Import File'}</span>
              <input
                type="file"
                accept=".json,.jsonld"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            <div className="relative">
              <button
                onClick={() => setShowExampleMenu(!showExampleMenu)}
                className="classic-button px-5 py-2 flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                <span className="text-sm">{t('loadRealExample')}</span>
              </button>

              {showExampleMenu && (
                <div className="absolute top-full left-0 mt-2 w-80 classic-card z-50 max-h-96 overflow-y-auto classic-scrollbar">
                  <div className="classic-label mb-3 pb-2 border-b-2 border-amber-700/30">
                    {t('realLocExamples')}
                  </div>
                  {realLocExamples.map((example) => (
                    <button
                      key={example.id}
                      className="w-full text-left p-3 mb-2 classic-catalog-card classic-hover-lift"
                      onClick={() => handleLoadExample(example.data)}
                    >
                      <div className="font-semibold text-sm classic-title-burgundy">{example.name}</div>
                      <div className="text-xs classic-subtitle mt-1">{example.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowImportDialog(true)}
              className="classic-button px-5 py-2 flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm">{t('import')}</span>
            </button>

            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(graph, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'bibframe-record.json';
                a.click();
              }}
              className="classic-button px-5 py-2 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">{t('exportJsonLd')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Tabs */}
      <div className="bg-gradient-to-b from-amber-50 to-stone-100 border-b-4 border-amber-700">
        <div className="px-6 py-3">
          <div className="classic-tab-bar">
            <ClassicPreviewTab
              active={previewTab === 'form'}
              onClick={() => setPreviewTab('form')}
              icon={<FileText className="h-4 w-4" />}
              label={t('form')}
            />
            <ClassicPreviewTab
              active={previewTab === 'graph'}
              onClick={() => setPreviewTab('graph')}
              icon={<Network className="h-4 w-4" />}
              label={t('authorityGraph')}
            />
            <ClassicPreviewTab
              active={previewTab === 'marc'}
              onClick={() => setPreviewTab('marc')}
              icon={<Database className="h-4 w-4" />}
              label={t('marc')}
            />
            <ClassicPreviewTab
              active={previewTab === 'rdf'}
              onClick={() => setPreviewTab('rdf')}
              icon={<Code className="h-4 w-4" />}
              label={t('rdf')}
            />
            <ClassicPreviewTab
              active={previewTab === 'json'}
              onClick={() => setPreviewTab('json')}
              icon={<Braces className="h-4 w-4" />}
              label={t('json')}
            />
            <ClassicPreviewTab
              active={previewTab === 'opac'}
              onClick={() => setPreviewTab('opac')}
              icon={<Eye className="h-4 w-4" />}
              label={t('opacPreview')}
            />
            <ClassicPreviewTab
              active={previewTab === 'mindmap'}
              onClick={() => setPreviewTab('mindmap')}
              icon={<Sparkles className="h-4 w-4" />}
              label={t('mindMap')}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 classic-scrollbar">
        {previewTab === 'form' && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="classic-panel p-6 classic-corner-decoration">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="h-6 w-6 text-amber-700" />
                  <h3 className="text-2xl font-bold classic-title-burgundy">{t('work')}</h3>
                </div>
                <div className="space-y-4 max-h-[calc(100vh-380px)] overflow-y-auto classic-scrollbar pr-2">
                  {workProperties.map((property) => (
                    <OntologyField
                      key={property.uri}
                      property={property}
                      value={workData[property.uri.split('/').pop() || '']}
                      onChange={(value) => updateWorkProperty(property.uri, value)}
                      language={language}
                    />
                  ))}
                  
                  {/* All Sources Authority Search Panel */}
                  <div className="classic-catalog-card mt-6 p-4 border-2 border-amber-700/40">
                    <h4 className="classic-label mb-3 flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      All Sources Authority Search
                    </h4>

                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={allSourceQuery}
                        onChange={(e) => setAllSourceQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAllSourceSearch();
                          }
                        }}
                        placeholder="Search all sources (LOC • VIAF • Wikidata • AfIqa)"
                        className="flex-1 px-3 py-2 border-2 border-amber-700/30 rounded bg-white text-sm focus:outline-none focus:border-amber-700"
                      />
                      <button
                        onClick={handleAllSourceSearch}
                        disabled={searchingAll}
                        className="classic-button px-4 py-2 flex items-center gap-2"
                      >
                        <Search className="h-4 w-4" />
                        {searchingAll ? 'Searching...' : 'Search'}
                      </button>
                    </div>

                    {searchingAll && (
                      <div className="text-sm text-amber-700 flex items-center gap-2 py-2">
                        <div className="animate-spin h-4 w-4 border-2 border-amber-700 border-t-transparent rounded-full"></div>
                        Searching all authority sources...
                      </div>
                    )}

                    {allSourceResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto classic-scrollbar">
                        {allSourceResults.map((result, idx) => (
                          <button
                            key={idx}
                            onClick={async () => {
                              const person = await authorityHub.buildUnifiedPerson(result);
                              handleAuthoritySelect(person);
                              setAllSourceResults([]);
                              setAllSourceQuery('');
                            }}
                            className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 border-2 border-amber-700/30 rounded classic-hover-lift transition-all"
                          >
                            <div className="font-semibold text-sm classic-title-burgundy">
                              {result.label}
                            </div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {result.source === 'LOC' && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                  LOC
                                </span>
                              )}
                              {result.source === 'VIAF' && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                  VIAF
                                </span>
                              )}
                              {result.source === 'Wikidata' && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                  Wikidata
                                </span>
                              )}
                              {result.source === 'AfIqa' && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                                  AfIqa
                                </span>
                              )}
                              {result.score && (
                                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                                  {Math.round(result.score * 100)}% match
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contributors Display - As Tags */}
                  {workData['bf:contribution']?.length > 0 && (
                    <div className="classic-catalog-card mt-6 p-4">
                      <h4 className="classic-label mb-3">
                        {t('contributorsCount')} ({workData['bf:contribution'].length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {workData['bf:contribution'].map((contrib: any, idx: number) => {
                          const agentLabel = getLabelString(contrib['bf:agent']?.['rdfs:label'] || contrib['bf:agent']?.label || 'Unknown');
                          const roleLabel = getLabelString(contrib['bf:role']?.['rdfs:label'] || contrib['bf:role']?.label || 'Contributor');
                          
                          return (
                            <div
                              key={idx}
                              className="px-4 py-2 bg-gradient-to-r from-amber-200 to-amber-300 text-amber-900 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm classic-hover-lift"
                            >
                              <User className="h-3 w-3" />
                              <span>{agentLabel}</span>
                              <span className="text-xs opacity-70 ml-1">
                                • {roleLabel}
                              </span>
                              {contrib['bf:agent']?.['@id']?.includes('loc.gov') && (
                                <span className="px-1.5 py-0.5 bg-red-600 text-white rounded text-xs ml-1">
                                  LOC
                                </span>
                              )}
                              {contrib['bf:agent']?.['@id']?.includes('wikidata') && (
                                <span className="px-1.5 py-0.5 bg-green-600 text-white rounded text-xs ml-1">
                                  Wikidata
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="classic-panel p-6 classic-corner-decoration">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="h-6 w-6 text-amber-700" />
                  <h3 className="text-2xl font-bold classic-title-gold">{t('instance')}</h3>
                </div>
                <div className="space-y-4 max-h-[calc(100vh-380px)] overflow-y-auto classic-scrollbar pr-2">
                  {instanceProperties.map((property) => (
                    <OntologyField
                      key={property.uri}
                      property={property}
                      value={instanceData[property.uri.split('/').pop() || '']}
                      onChange={(value) => updateInstanceProperty(property.uri, value)}
                      language={language}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {previewTab === 'graph' && (
          <div className="classic-panel p-6">
            <h3 className="text-2xl font-bold mb-6 classic-title-burgundy">{t('authorityGraph')}</h3>
            <AuthorityGraph nodes={authorityNodes} />
          </div>
        )}

        {previewTab === 'marc' && (
          <MarcView data={{ work: workData, instance: instanceData, admin: {} }} />
        )}

        {previewTab === 'rdf' && (
          <RdfView data={{ work: workData, instance: instanceData, admin: {} }} />
        )}

        {previewTab === 'json' && (
          <div className="classic-panel p-6">
            <h3 className="text-2xl font-bold mb-6 classic-title-burgundy">{t('jsonStructure')}</h3>
            <pre className="classic-catalog-card font-mono text-sm overflow-x-auto max-h-[600px] classic-scrollbar" style={{ color: '#5c4a2f' }}>
              <code>{JSON.stringify({ work: workData, instance: instanceData }, null, 2)}</code>
            </pre>
          </div>
        )}

        {previewTab === 'opac' && (
          <OPACView data={graph} theme="classic" />
        )}

        {previewTab === 'mindmap' && (
          <div className="classic-panel p-6">
            <h3 className="text-2xl font-bold mb-6 classic-title-burgundy">{t('mindMap')}</h3>
            <MindMapPreview workData={workData} instanceData={instanceData} />
          </div>
        )}
      </div>

      <AuthoritySearchDialog
        isOpen={showAuthoritySearch}
        onClose={() => setShowAuthoritySearch(false)}
        onSelect={handleAuthoritySelect}
        initialQuery=""
      />

      <ImportRecordDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
      />
    </div>
  );
}

// Classic Tab Components
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
}

function ClassicAuthorityTab({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 whitespace-nowrap text-sm
        ${active ? 'classic-tab-active' : 'classic-tab'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ClassicPreviewTab({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 whitespace-nowrap text-sm
        ${active ? 'classic-tab-active' : 'classic-tab'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}