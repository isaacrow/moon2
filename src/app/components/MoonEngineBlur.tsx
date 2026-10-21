/**
 * Moon Engine Blur - iOS Visual Blur Edition
 * 
 * Features:
 * - Black glossy blurred glass design inspired by expo-ios-visual-blur
 * - Directional blur gradients (BlurredBottomClearTop)
 * - Multi-authority search contributing to bf:contribution
 * - Real LOC examples with actual URIs
 * - Preview and Mind Map in separate tabs
 * - LOC-NAMES and LOD integration
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Save, Download, Upload, ChevronLeft, Search, User, Users, Building, 
  MapPin, Tag, Globe, BookOpen, Package, Eye, Network, Database,
  FileText, Code, Braces, Sparkles
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
import type { UnifiedPerson } from '../services/authorityHub/types';
import { Toaster } from './ui/sonner';
import moonLogo from 'figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png';
import '../../styles/glassmorphism.css';
import '../../styles/blur-theme.css';

interface MoonEngineBlurProps {
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

export function MoonEngineBlur({ onBack }: MoonEngineBlurProps) {
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

  // Authority search
  const [showAuthoritySearch, setShowAuthoritySearch] = useState(false);
  const [currentAuthorityTab, setCurrentAuthorityTab] = useState<AuthorityTab>('names');
  
  // Preview tab
  const [previewTab, setPreviewTab] = useState<PreviewTab>('form');
  
  // Dialogs
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExampleMenu, setShowExampleMenu] = useState(false);
  const [showSavedRecords, setShowSavedRecords] = useState(false);
  const [savedRecords, setSavedRecords] = useState<any[]>([]);

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
   * Handle authority selection
   */
  const handleAuthoritySelect = (authority: UnifiedPerson | any) => {
    console.log('Selected authority:', authority);
    
    // Add to bf:contribution if it's a person/agent
    const contribution = {
      '@type': 'bf:Contribution',
      'bf:agent': {
        '@id': authority.uri || authority.id,
        '@type': authority.type || 'bf:Person',
        'rdfs:label': authority.label || authority.name || authority.preferredLabel
      },
      'bf:role': {
        '@id': 'http://id.loc.gov/vocabulary/relators/aut',
        '@type': 'bf:Role',
        'rdfs:label': 'Author'
      }
    };
    
    setWorkData((prev: any) => ({
      ...prev,
      'bf:contribution': [...(prev['bf:contribution'] || []), contribution]
    }));
    
    setShowAuthoritySearch(false);
    
    toast.success('Authority added!', {
      description: `${authority.label || authority.name} added to record`
    });
  };

  /**
   * Build RDF graph from current data
   */
  const graph = buildBibframeGraph(workData, instanceData);

  /**
   * Generate MARC preview
   */
  const marcXml = generateMARCFromBibframe(workData, instanceData);

  /**
   * Generate RDF/Turtle
   */
  const turtleData = quadsToTurtle(graph.quads);

  /**
   * Open authority search
   */
  const openAuthoritySearch = (tab: AuthorityTab) => {
    setCurrentAuthorityTab(tab);
    setShowAuthoritySearch(true);
  };

  /**
   * Load a real LOC example
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
    toast.success(`✨ Loaded Real LOC Example`, {
      description: 'Complete bibliographic record with proper authority URIs.',
      duration: 4000,
    });
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
    toast.success('Record imported successfully!');
  };

  /**
   * Save record to Moon Engine storage
   */
  const handleSave = async () => {
    try {
      const jsonldDocument = {
        '@context': 'http://id.loc.gov/ontologies/bibframe/',
        '@graph': graph['@graph'],
        quads: graph.quads
      };

      // Extract title for display
      const titleNode = graph['@graph'].find((node: any) => node['@type'] === 'bf:Title');
      const title = titleNode?.['bf:mainTitle'] || titleNode?.['mainTitle'] || 'Untitled';

      // Generate unique ID
      const recordId = `moon-${Date.now()}`;

      // Save to Moon Engine endpoint
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
        const errorText = await response.text();
        console.error('Failed to save record:', errorText);
        throw new Error(`Failed to save record: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Moon Engine record saved:', data);

      toast.success('Record saved!', {
        description: `${title} - Saved to Moon Engine database`,
      });

      // Refresh saved records list
      loadSavedRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Failed to save record', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  /**
   * Load saved records from Moon Engine storage
   */
  const loadSavedRecords = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/moon-engine/records/list`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load records');
      }

      const data = await response.json();
      setSavedRecords(data.records || []);
      setShowSavedRecords(true);
    } catch (error) {
      console.error('Error loading records:', error);
      toast.error('Failed to load records');
    }
  };

  return (
    <div className="h-screen overflow-hidden relative" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)'
    }}>
      {/* Animated Background with Blur */}
      <div className="absolute inset-0 animated-gradient-bg opacity-20"></div>
      
      {/* Main Content with iOS Blur */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Navigation Bar with Directional Blur */}
        <div className="ios-blur-navbar p-4 border-b border-white/10">
          <div className="flex items-center justify-between max-w-[1800px] mx-auto">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="ios-blur-button-secondary p-2 rounded-xl"
                  title="Back"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
              )}
              <img src={moonLogo} alt="Gemi Moon" className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold ios-blur-text-container">
                  Moon Engine
                </h1>
                <p className="text-sm text-white/70">iOS Visual Blur • Black Glossy Glass</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowImportDialog(true)}
                className="ios-blur-button-secondary px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                <span className="text-white">Import</span>
              </button>
              
              <button
                onClick={() => setShowExampleMenu(!showExampleMenu)}
                className="ios-blur-button-secondary px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-white">LOC Examples</span>
              </button>

              <button
                onClick={handleSave}
                className="ios-blur-button px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                <span className="text-white">Save</span>
              </button>
            </div>
          </div>

          {/* Examples Menu */}
          {showExampleMenu && (
            <div className="absolute top-20 right-8 w-96 ios-blur-modal rounded-2xl overflow-hidden z-50 ios-blur-fade-in">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-3 text-white">Real LOC Examples</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {realLocExamples.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadExample(example)}
                      className="w-full text-left ios-blur-button-secondary p-3 rounded-xl"
                    >
                      <div className="font-medium text-white">{example.title}</div>
                      <div className="text-sm text-white/60">{example.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-[1800px] mx-auto p-6 grid grid-cols-12 gap-6">
            {/* Left Panel: Work Form */}
            <div className="col-span-4 h-full overflow-hidden flex flex-col">
              <div className="ios-blur-card-floating flex-1 overflow-hidden flex flex-col">
                <div className="ios-glossy-black-intense p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      bf:Work
                    </h2>
                    <button
                      onClick={() => openAuthoritySearch('names')}
                      className="ios-blur-button-secondary px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
                    >
                      <User className="h-4 w-4" />
                      <span className="text-white">Add Authority</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {workProperties.slice(0, 8).map((prop) => (
                    <OntologyField
                      key={prop.uri}
                      property={prop}
                      value={workData[prop.uri.split('/').pop() || '']}
                      onChange={(val) => updateWorkProperty(prop.uri, val)}
                      theme="blur"
                    />
                  ))}

                  {/* Contributions Display */}
                  {workData['bf:contribution']?.length > 0 && (
                    <div className="ios-glossy-black-medium p-4 rounded-xl">
                      <h3 className="font-semibold mb-3 text-white flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Contributors ({workData['bf:contribution'].length})
                      </h3>
                      <div className="space-y-2">
                        {workData['bf:contribution'].map((contrib: any, idx: number) => (
                          <div key={idx} className="ios-blur-badge p-2 rounded-lg">
                            <div className="text-sm font-medium text-white">
                              {getLabelString(contrib['bf:agent']?.['rdfs:label'])}
                            </div>
                            <div className="text-xs text-white/60">
                              {getLabelString(contrib['bf:role']?.['rdfs:label'])}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Panel: Instance Form */}
            <div className="col-span-4 h-full overflow-hidden flex flex-col">
              <div className="ios-blur-card-floating flex-1 overflow-hidden flex flex-col">
                <div className="ios-glossy-black-intense p-4 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    bf:Instance
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {instanceProperties.slice(0, 8).map((prop) => (
                    <OntologyField
                      key={prop.uri}
                      property={prop}
                      value={instanceData[prop.uri.split('/').pop() || '']}
                      onChange={(val) => updateInstanceProperty(prop.uri, val)}
                      theme="blur"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel: Preview */}
            <div className="col-span-4 h-full overflow-hidden flex flex-col">
              <div className="ios-blur-card-floating flex-1 overflow-hidden flex flex-col">
                <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as PreviewTab)} className="flex flex-col h-full">
                  <div className="ios-glossy-black-intense">
                    <TabsList className="w-full bg-transparent p-1 gap-1">
                      <TabsTrigger value="form" className="flex-1 data-[state=active]:ios-blur-button text-white/70 data-[state=active]:text-white">
                        <Eye className="h-4 w-4 mr-2" />
                        Form
                      </TabsTrigger>
                      <TabsTrigger value="graph" className="flex-1 data-[state=active]:ios-blur-button text-white/70 data-[state=active]:text-white">
                        <Network className="h-4 w-4 mr-2" />
                        Graph
                      </TabsTrigger>
                      <TabsTrigger value="marc" className="flex-1 data-[state=active]:ios-blur-button text-white/70 data-[state=active]:text-white">
                        <FileText className="h-4 w-4 mr-2" />
                        MARC
                      </TabsTrigger>
                      <TabsTrigger value="rdf" className="flex-1 data-[state=active]:ios-blur-button text-white/70 data-[state=active]:text-white">
                        <Code className="h-4 w-4 mr-2" />
                        RDF
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="form" className="h-full p-4 overflow-y-auto">
                      <OPACPreview workData={workData} instanceData={instanceData} theme="blur" />
                    </TabsContent>

                    <TabsContent value="graph" className="h-full p-4 overflow-y-auto">
                      <AuthorityGraph 
                        contributions={workData['bf:contribution'] || []} 
                        theme="blur"
                      />
                    </TabsContent>

                    <TabsContent value="marc" className="h-full overflow-y-auto">
                      <MarcView xml={marcXml} theme="blur" />
                    </TabsContent>

                    <TabsContent value="rdf" className="h-full overflow-y-auto">
                      <RdfView data={turtleData} theme="blur" />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authority Search Dialog */}
      {showAuthoritySearch && (
        <AuthoritySearchDialog
          open={showAuthoritySearch}
          onClose={() => setShowAuthoritySearch(false)}
          onSelect={handleAuthoritySelect}
          initialTab={currentAuthorityTab}
        />
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <ImportRecordDialog
          open={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onImport={handleImport}
        />
      )}

      <Toaster />
    </div>
  );
}