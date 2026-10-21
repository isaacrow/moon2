/**
 * Sonic Engine - BIBFRAME 3.0 Strict Compliance Edition
 * 
 * A complete rebuild following official BIBFRAME 3.0 ontology
 * https://id.loc.gov/ontologies/bibframe.html
 * https://github.com/lcnetdev/bibframe-ontology
 * 
 * Key Differences from Moon Engine:
 * - Strict BIBFRAME 3.0 property usage (no invented shortcuts)
 * - Graph-native architecture with @graph support
 * - Full round-trip import/export capability
 * - Ontology-aware validation
 * - Backend persistence (Supabase)
 * - Stable URI generation
 * 
 * @version 1.0.0
 * @date 2026-02-16
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { 
  Save, Download, Upload, ChevronLeft, Search, Sparkles,
  BookOpen, Database, Eye, FileText, CheckCircle, AlertCircle,
  Network, Zap
} from 'lucide-react';

// Sonic Engine Services
import { SonicGraphBuilder } from './services/SonicGraphBuilder';
import { SonicGraphResolver } from './services/SonicGraphResolver';
import { SonicValidator } from './services/SonicValidator';
import { SonicExporter } from './services/SonicExporter';
import { SonicPersistence } from './services/SonicPersistence';
import { generateStableUri } from './utils/uriGenerator';

// Sonic Components
import { SonicWorkForm } from './components/SonicWorkForm';
import { SonicInstanceForm } from './components/SonicInstanceForm';
import { SonicPreview } from './components/SonicPreview';
import { SonicValidationPanel } from './components/SonicValidationPanel';

// Types
import type { 
  BF3Work, 
  BF3Instance, 
  BF3Graph,
  ValidationResult 
} from './types/bibframe3';

interface SonicEngineProps {
  onBack?: () => void;
}

export function SonicEngine({ onBack }: SonicEngineProps) {
  const { t, i18n } = useTranslation();
  
  // Core BIBFRAME entities
  const [work, setWork] = useState<BF3Work>({
    '@type': 'bf:Work',
    '@id': generateStableUri('work'),
  });

  const [instance, setInstance] = useState<BF3Instance>({
    '@type': 'bf:Instance',
    '@id': generateStableUri('instance'),
    'bf:instanceOf': { '@id': work['@id'] }
  });

  // UI State
  const [activeTab, setActiveTab] = useState<'work' | 'instance' | 'preview'>('work');
  const [showValidation, setShowValidation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Validation
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);

  // Services
  const graphBuilder = new SonicGraphBuilder();
  const graphResolver = new SonicGraphResolver();
  const validator = new SonicValidator();
  const exporter = new SonicExporter();
  const persistence = new SonicPersistence();

  // Update instance reference when work ID changes
  useEffect(() => {
    setInstance(prev => ({
      ...prev,
      'bf:instanceOf': { '@id': work['@id'] }
    }));
  }, [work['@id']]);

  // Validate on change
  useEffect(() => {
    const results = validator.validateGraph(work, instance);
    setValidationResults(results);
  }, [work, instance]);

  /**
   * Save to backend persistence (Supabase)
   */
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Validate before save
      const validation = validator.validateGraph(work, instance);
      
      if (!validation.isValid) {
        toast.error('Validation failed', {
          description: `${validation.errors.length} errors found. Please fix before saving.`,
          duration: 5000,
        });
        setShowValidation(true);
        return;
      }

      // Build JSON-LD graph
      const graph = graphBuilder.buildGraph(work, instance);
      
      // Save to backend
      const savedRecord = await persistence.saveRecord(graph);
      
      toast.success('Record saved successfully', {
        description: `Saved to database with ID: ${savedRecord.id}`,
        duration: 4000,
      });

    } catch (error) {
      console.error('Save error:', error);
      toast.error('Save failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Export as JSON-LD
   */
  const handleExport = () => {
    try {
      const jsonld = exporter.exportToJsonLD(work, instance);
      
      // Validate export
      const isValid = exporter.validateJsonLD(jsonld);
      if (!isValid) {
        toast.error('Export validation failed', {
          description: 'Generated JSON-LD is not valid',
          duration: 5000,
        });
        return;
      }

      // Download file
      const blob = new Blob([JSON.stringify(jsonld, null, 2)], { 
        type: 'application/ld+json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bibframe-${Date.now()}.jsonld`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Exported successfully', {
        description: 'Valid BIBFRAME 3.0 JSON-LD file downloaded',
        duration: 4000,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000,
      });
    }
  };

  /**
   * Import from JSON-LD file with full graph resolution
   */
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const jsonld = JSON.parse(content);

        // Resolve graph to Work and Instance entities
        const resolved = await graphResolver.resolveGraph(jsonld);

        if (!resolved.work || !resolved.instance) {
          toast.error('Import failed', {
            description: 'Could not find valid Work and Instance in file',
            duration: 5000,
          });
          return;
        }

        // Set resolved entities
        setWork(resolved.work);
        setInstance(resolved.instance);

        toast.success('Import successful', {
          description: 'Record loaded with full graph resolution',
          duration: 4000,
        });

      } catch (error) {
        console.error('Import error:', error);
        toast.error('Import failed', {
          description: error instanceof Error ? error.message : 'Invalid JSON-LD',
          duration: 5000,
        });
      }
    };
    reader.readAsText(file);
  };

  /**
   * Load example record
   */
  const handleLoadExample = () => {
    const exampleWork: BF3Work = {
      '@type': 'bf:Work',
      '@id': generateStableUri('work'),
      'bf:hasTitle': {
        '@type': 'bf:Title',
        '@id': generateStableUri('title'),
        'bf:mainTitle': 'Sonic Engine: A BIBFRAME 3.0 Cataloging System'
      },
      'bf:contribution': [
        {
          '@type': 'bf:Contribution',
          '@id': generateStableUri('contribution'),
          'bf:agent': {
            '@type': 'bf:Person',
            '@id': 'http://id.loc.gov/authorities/names/n79021164',
            'rdfs:label': 'Library of Congress Cataloging Team'
          },
          'bf:role': {
            '@type': 'bf:Role',
            '@id': 'http://id.loc.gov/vocabulary/relators/aut'
          }
        }
      ],
      'bf:subject': [
        {
          '@type': 'bf:Topic',
          '@id': generateStableUri('subject'),
          'rdfs:label': 'Cataloging'
        }
      ]
    };

    const exampleInstance: BF3Instance = {
      '@type': 'bf:Instance',
      '@id': generateStableUri('instance'),
      'bf:instanceOf': { '@id': exampleWork['@id'] },
      'bf:hasTitle': {
        '@type': 'bf:Title',
        '@id': generateStableUri('title'),
        'bf:mainTitle': 'Sonic Engine: A BIBFRAME 3.0 Cataloging System'
      },
      'bf:provisionActivity': [
        {
          '@type': 'bf:Publication',
          '@id': generateStableUri('publication'),
          'bf:date': '2026',
          'bf:agent': {
            '@type': 'bf:Agent',
            '@id': generateStableUri('agent'),
            'rdfs:label': 'Sonic Publishing'
          }
        }
      ]
    };

    setWork(exampleWork);
    setInstance(exampleInstance);

    toast.success('Example loaded', {
      description: 'BIBFRAME 3.0 compliant example record',
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Branding */}
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                {t('back')}
              </button>
              
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Sonic Engine
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    BIBFRAME 3.0 Strict Compliance
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleLoadExample}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Load Example
              </Button>

              <label className="cursor-pointer">
                <Button variant="outline" className="flex items-center gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Import
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json,.jsonld"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              <Button
                variant="outline"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowValidation(!showValidation)}
                className={`flex items-center gap-2 ${
                  validationResults?.isValid 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}
              >
                {validationResults?.isValid ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                Validate
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Panel */}
      {showValidation && validationResults && (
        <SonicValidationPanel 
          results={validationResults}
          onClose={() => setShowValidation(false)}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="work" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Work Entity
            </TabsTrigger>
            <TabsTrigger value="instance" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Instance Entity
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="work">
            <SonicWorkForm
              work={work}
              onChange={setWork}
            />
          </TabsContent>

          <TabsContent value="instance">
            <SonicInstanceForm
              instance={instance}
              onChange={setInstance}
            />
          </TabsContent>

          <TabsContent value="preview">
            <SonicPreview
              work={work}
              instance={instance}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}