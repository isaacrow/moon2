/**
 * Moon Engine Neon - Cyberpunk 2077 Edition
 * 
 * Features:
 * - Cyberpunk neon aesthetics
 * - Electric cyan/magenta/pink colors
 * - Glow effects and dark backgrounds
 * - Futuristic design language
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { 
  Save, Download, Upload, ChevronLeft, Search, User, Building, 
  MapPin, Tag, Globe, BookOpen, Package, Eye, Network, Database,
  FileText, Code, Braces, Sparkles, Book, Zap
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
import '../../styles/neon-theme.css';

interface MoonEngineNeonProps {
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

export function MoonEngineNeon({ onBack }: MoonEngineNeonProps) {
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

  // Auto-load on startup
  useEffect(() => {
    try {
      const saved = localStorage.getItem('moon_current_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
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

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        let newWork = null;
        let newInstance = null;

        if (json['@graph'] && Array.isArray(json['@graph'])) {
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
          newWork = json.work;
          newInstance = json.instance;
        } else if (json['@type'] === 'bf:Work' || json['@type']?.includes('Work')) {
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

  const handleSave = () => {
    const record = {
      work: workData,
      instance: instanceData,
      lastModified: new Date().toISOString(),
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        editor: 'Moon Engine Neon',
        version: '2.0.0'
      }
    };

    localStorage.setItem('moon_current_draft', JSON.stringify(record));
    
    const history = JSON.parse(localStorage.getItem('moon_record_history') || '[]');
    const titleNode = workData['bf:title'];
    const mainTitle = Array.isArray(titleNode) 
      ? titleNode[0]?.['bf:mainTitle'] 
      : titleNode?.['bf:mainTitle'] || 'Untitled';
    
    history.push({ 
      id: workData['@id'], 
      title: mainTitle,
      date: new Date().toISOString()
    });
    localStorage.setItem('moon_record_history', JSON.stringify(history));

    const existingRecords = JSON.parse(localStorage.getItem('bibframe-records') || '[]');
    existingRecords.push({
      '@context': 'http://id.loc.gov/ontologies/bibframe/',
      '@graph': graph['@graph'],
      metadata: record.metadata
    });
    localStorage.setItem('bibframe-records', JSON.stringify(existingRecords));

    toast.success('Record saved successfully!', {
      description: `Saved to local storage. ${existingRecords.length} total records.`,
    });
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Toaster position="top-right" />

      {/* Neon Navbar */}
      <div className="neon-navbar">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button 
                  onClick={onBack}
                  className="neon-button px-4 py-2 flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm">{t('backButton')}</span>
                </button>
              )}
              <img src={moonLogo} alt="Moon Logo" className="h-16 w-auto" />
              <div>
                <h1 className="text-2xl font-bold neon-text-cyan flex items-center gap-3">
                  <Zap className="h-7 w-7" />
                  <span>{t('moonEngine')}</span>
                </h1>
                <p className="text-sm neon-text-fuchsia">{t('moonEngineSubtitle')}</p>
              </div>
            </div>
          </div>

          {/* Authority Search Tabs */}
          <div className="neon-tab-bar mb-4 overflow-x-auto flex gap-2">
            <NeonAuthorityTab
              active={currentAuthorityTab === 'names'}
              onClick={() => openAuthoritySearch('names')}
              icon={<User className="h-4 w-4" />}
              label={t('nafAuthNames')}
            />
            <NeonAuthorityTab
              active={currentAuthorityTab === 'personal'}
              onClick={() => openAuthoritySearch('personal')}
              label={t('nafPersonalNames')}
            />
            <NeonAuthorityTab
              active={currentAuthorityTab === 'corporate'}
              onClick={() => openAuthoritySearch('corporate')}
              icon={<Building className="h-4 w-4" />}
              label={t('nafCorporateName')}
            />
            <NeonAuthorityTab
              active={currentAuthorityTab === 'conference'}
              onClick={() => openAuthoritySearch('conference')}
              label={t('nafConferenceName')}
            />
            <NeonAuthorityTab
              active={currentAuthorityTab === 'geographic'}
              onClick={() => openAuthoritySearch('geographic')}
              icon={<MapPin className="h-4 w-4" />}
              label={t('nafGeographic')}
            />
            <NeonAuthorityTab
              active={currentAuthorityTab === 'all'}
              onClick={() => openAuthoritySearch('all')}
              icon={<Tag className="h-4 w-4" />}
              label={t('nafAll')}
            />
            <NeonAuthorityTab
              active={currentAuthorityTab === 'wikidata'}
              onClick={() => openAuthoritySearch('wikidata')}
              icon={<Globe className="h-4 w-4" />}
              label={t('wikidata')}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handleSave} className="neon-button px-5 py-2 flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span className="text-sm">{t('saveRecord')}</span>
            </button>

            <label className="neon-button px-5 py-2 flex items-center gap-2 cursor-pointer">
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
                className="neon-button px-5 py-2 flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                <span className="text-sm">{t('loadRealExample')}</span>
              </button>

              {showExampleMenu && (
                <div className="absolute top-full left-0 mt-2 w-80 neon-card z-50 max-h-96 overflow-y-auto neon-scrollbar p-4">
                  <div className="text-sm font-semibold neon-text-cyan mb-3 pb-2 neon-divider">
                    {t('realLocExamples')}
                  </div>
                  {realLocExamples.map((example) => (
                    <button
                      key={example.id}
                      className="w-full text-left p-3 mb-2 neon-panel hover:scale-105 transition-transform"
                      onClick={() => handleLoadExample(example.data)}
                    >
                      <div className="font-semibold text-sm neon-text-cyan">{example.name}</div>
                      <div className="text-xs neon-text-fuchsia mt-1">{example.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowImportDialog(true)}
              className="neon-button px-5 py-2 flex items-center gap-2"
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
              className="neon-button px-5 py-2 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">{t('exportJsonLd')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Tabs */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border-b-2 border-cyan-500/30">
        <div className="px-6 py-3">
          <div className="neon-tab-bar flex gap-2">
            <NeonPreviewTab
              active={previewTab === 'form'}
              onClick={() => setPreviewTab('form')}
              icon={<FileText className="h-4 w-4" />}
              label={t('form')}
            />
            <NeonPreviewTab
              active={previewTab === 'graph'}
              onClick={() => setPreviewTab('graph')}
              icon={<Network className="h-4 w-4" />}
              label={t('authorityGraph')}
            />
            <NeonPreviewTab
              active={previewTab === 'marc'}
              onClick={() => setPreviewTab('marc')}
              icon={<Database className="h-4 w-4" />}
              label={t('marc')}
            />
            <NeonPreviewTab
              active={previewTab === 'rdf'}
              onClick={() => setPreviewTab('rdf')}
              icon={<Code className="h-4 w-4" />}
              label={t('rdf')}
            />
            <NeonPreviewTab
              active={previewTab === 'json'}
              onClick={() => setPreviewTab('json')}
              icon={<Braces className="h-4 w-4" />}
              label={t('json')}
            />
            <NeonPreviewTab
              active={previewTab === 'opac'}
              onClick={() => setPreviewTab('opac')}
              icon={<Eye className="h-4 w-4" />}
              label={t('opacPreview')}
            />
            <NeonPreviewTab
              active={previewTab === 'mindmap'}
              onClick={() => setPreviewTab('mindmap')}
              icon={<Sparkles className="h-4 w-4" />}
              label={t('mindMap')}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 neon-scrollbar">
        {previewTab === 'form' && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="neon-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="h-6 w-6 text-cyan-400" />
                  <h3 className="text-2xl font-bold neon-text-cyan">{t('work')}</h3>
                </div>
                <div className="space-y-4 max-h-[calc(100vh-380px)] overflow-y-auto neon-scrollbar pr-2">
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
                  <div className="neon-panel mt-6 p-4">
                    <h4 className="text-sm font-semibold neon-text-cyan mb-3 flex items-center gap-2">
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
                        className="neon-input flex-1 px-3 py-2 text-sm"
                      />
                      <button
                        onClick={handleAllSourceSearch}
                        disabled={searchingAll}
                        className="neon-button px-4 py-2 flex items-center gap-2"
                      >
                        <Search className="h-4 w-4" />
                        {searchingAll ? 'Searching...' : 'Search'}
                      </button>
                    </div>

                    {searchingAll && (
                      <div className="text-sm neon-text-cyan flex items-center gap-2 py-2">
                        <div className="animate-spin h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
                        Searching all authority sources...
                      </div>
                    )}

                    {allSourceResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto neon-scrollbar">
                        {allSourceResults.map((result, idx) => (
                          <button
                            key={idx}
                            onClick={async () => {
                              const person = await authorityHub.buildUnifiedPerson(result);
                              handleAuthoritySelect(person);
                              setAllSourceResults([]);
                              setAllSourceQuery('');
                            }}
                            className="w-full text-left p-3 neon-panel hover:scale-105 transition-transform"
                          >
                            <div className="font-semibold text-sm neon-text-cyan">
                              {result.label}
                            </div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {result.source === 'LOC' && (
                                <span className="neon-badge px-2 py-1 text-xs">LOC</span>
                              )}
                              {result.source === 'VIAF' && (
                                <span className="neon-badge px-2 py-1 text-xs">VIAF</span>
                              )}
                              {result.source === 'Wikidata' && (
                                <span className="neon-badge px-2 py-1 text-xs">Wikidata</span>
                              )}
                              {result.source === 'AfIqa' && (
                                <span className="neon-badge px-2 py-1 text-xs">AfIqa</span>
                              )}
                              {result.score && (
                                <span className="neon-badge px-2 py-1 text-xs">
                                  {Math.round(result.score * 100)}% match
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contributors Display */}
                  {workData['bf:contribution']?.length > 0 && (
                    <div className="neon-panel mt-6 p-4">
                      <h4 className="text-sm font-semibold neon-text-cyan mb-3">
                        {t('contributorsCount')} ({workData['bf:contribution'].length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {workData['bf:contribution'].map((contrib: any, idx: number) => {
                          const agentLabel = getLabelString(contrib['bf:agent']?.['rdfs:label'] || contrib['bf:agent']?.label || 'Unknown');
                          const roleLabel = getLabelString(contrib['bf:role']?.['rdfs:label'] || contrib['bf:role']?.label || 'Contributor');
                          
                          return (
                            <div
                              key={idx}
                              className="neon-badge px-4 py-2 flex items-center gap-2"
                            >
                              <User className="h-3 w-3" />
                              <span>{agentLabel}</span>
                              <span className="text-xs opacity-70 ml-1">• {roleLabel}</span>
                              {contrib['bf:agent']?.['@id']?.includes('loc.gov') && (
                                <span className="px-1.5 py-0.5 bg-red-500 text-white rounded text-xs ml-1">LOC</span>
                              )}
                              {contrib['bf:agent']?.['@id']?.includes('wikidata') && (
                                <span className="px-1.5 py-0.5 bg-green-500 text-white rounded text-xs ml-1">Wikidata</span>
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
              <div className="neon-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="h-6 w-6 text-fuchsia-400" />
                  <h3 className="text-2xl font-bold neon-text-fuchsia">{t('instance')}</h3>
                </div>
                <div className="space-y-4 max-h-[calc(100vh-380px)] overflow-y-auto neon-scrollbar pr-2">
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
          <div className="neon-card p-6">
            <h3 className="text-2xl font-bold mb-6 neon-text-cyan">{t('authorityGraph')}</h3>
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
          <div className="neon-card p-6">
            <h3 className="text-2xl font-bold mb-6 neon-text-cyan">{t('jsonStructure')}</h3>
            <pre className="neon-panel font-mono text-sm overflow-x-auto max-h-[600px] neon-scrollbar p-4 text-cyan-300">
              <code>{JSON.stringify({ work: workData, instance: instanceData }, null, 2)}</code>
            </pre>
          </div>
        )}

        {previewTab === 'opac' && (
          <OPACView data={graph} theme="neon" />
        )}

        {previewTab === 'mindmap' && (
          <div className="neon-card p-6">
            <h3 className="text-2xl font-bold mb-6 neon-text-cyan">{t('mindMap')}</h3>
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

// Neon Tab Components
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
}

function NeonAuthorityTab({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap text-sm rounded-lg transition-all ${
        active ? 'neon-tab-active' : 'neon-panel hover:scale-105'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function NeonPreviewTab({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap text-sm rounded-lg transition-all ${
        active ? 'neon-tab-active' : 'neon-panel hover:scale-105'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}