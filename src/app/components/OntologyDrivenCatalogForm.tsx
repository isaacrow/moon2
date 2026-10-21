/**
 * Ontology-Driven Catalog Form
 * Dynamically generates cataloging forms based on the BIBFRAME ontology
 * Core component that drives the entire Moon editor using the official BIBFRAME ontology
 */

import React, { useState, useEffect } from 'react';
import { bibframeOntologyCore, OntologyClass, OntologyProperty } from '../services/bibframeOntologyCore';
import { BibframeLinkedField } from './fields/BibframeLinkedField';
import { BibframeVocabularySelect } from './fields/BibframeVocabularySelect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Info, Save, Eye, BookOpen, ExternalLink } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface FormField {
  property: OntologyProperty;
  value: any;
  controlType: 'text' | 'textarea' | 'linkedField' | 'vocabulary' | 'date';
}

export function OntologyDrivenCatalogForm() {
  const [selectedResourceType, setSelectedResourceType] = useState<'Work' | 'Instance' | 'Item'>('Work');
  const [workClass, setWorkClass] = useState<OntologyClass | undefined>();
  const [instanceClass, setInstanceClass] = useState<OntologyClass | undefined>();
  const [itemClass, setItemClass] = useState<OntologyClass | undefined>();
  const [workFields, setWorkFields] = useState<Map<string, any>>(new Map());
  const [instanceFields, setInstanceFields] = useState<Map<string, any>>(new Map());
  const [itemFields, setItemFields] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    // Load the ontology classes
    setWorkClass(bibframeOntologyCore.getClass('Work'));
    setInstanceClass(bibframeOntologyCore.getClass('Instance'));
    setItemClass(bibframeOntologyCore.getClass('Item'));
  }, []);

  // Get properties for the current resource type
  const getCurrentProperties = (): OntologyProperty[] => {
    switch (selectedResourceType) {
      case 'Work':
        return bibframeOntologyCore.getPropertiesForClass('Work');
      case 'Instance':
        return bibframeOntologyCore.getPropertiesForClass('Instance');
      case 'Item':
        return bibframeOntologyCore.getPropertiesForClass('Item');
      default:
        return [];
    }
  };

  // Determine control type based on property
  const getControlType = (property: OntologyProperty): FormField['controlType'] => {
    if (property.controlledList) {
      // Check if it's a searchable authority vs. a fixed vocabulary
      if (property.controlledList.includes('/rwo/agents') ||
          property.controlledList.includes('/authorities/')) {
        return 'linkedField';
      }
      return 'vocabulary';
    }
    
    if (property.expectedValue === 'Title' || property.expectedValue === 'Note') {
      return 'textarea';
    }
    
    if (property.label.toLowerCase().includes('date')) {
      return 'date';
    }
    
    return 'text';
  };

  // Get search type for linked fields
  const getSearchType = (property: OntologyProperty): any => {
    if (property.uri.includes('agent') || property.uri.includes('contribution')) {
      return 'all';
    }
    if (property.uri.includes('subject')) {
      return 'topic';
    }
    if (property.uri.includes('genreForm')) {
      return 'genreForm';
    }
    if (property.uri.includes('geographic')) {
      return 'geographic';
    }
    return 'all';
  };

  // Get vocabulary type for controlled vocabularies
  const getVocabularyType = (property: OntologyProperty): any => {
    if (property.controlledList?.includes('/carriers/')) return 'carriers';
    if (property.controlledList?.includes('/mediaTypes/')) return 'mediaTypes';
    if (property.controlledList?.includes('/contentTypes/')) return 'contentTypes';
    if (property.controlledList?.includes('/issuance/')) return 'issuance';
    if (property.controlledList?.includes('/countries/')) return 'countries';
    if (property.controlledList?.includes('/languages/')) return 'languages';
    if (property.controlledList?.includes('/relators/')) return 'relators';
    if (property.controlledList?.includes('/mcolor/')) return 'mcolor';
    if (property.controlledList?.includes('/msoundcontent/')) return 'msoundcontent';
    if (property.controlledList?.includes('/maudience/')) return 'maudience';
    if (property.controlledList?.includes('/mfont/')) return 'mfont';
    return 'carriers'; // default
  };

  // Update field value
  const updateFieldValue = (property: string, value: any) => {
    const currentFields = selectedResourceType === 'Work' ? workFields :
                         selectedResourceType === 'Instance' ? instanceFields : itemFields;
    const newFields = new Map(currentFields);
    newFields.set(property, value);
    
    if (selectedResourceType === 'Work') setWorkFields(newFields);
    else if (selectedResourceType === 'Instance') setInstanceFields(newFields);
    else setItemFields(newFields);
  };

  // Get field value
  const getFieldValue = (property: string): any => {
    const currentFields = selectedResourceType === 'Work' ? workFields :
                         selectedResourceType === 'Instance' ? instanceFields : itemFields;
    return currentFields.get(property);
  };

  // Render a field based on the ontology property
  const renderField = (property: OntologyProperty) => {
    const controlType = getControlType(property);
    const value = getFieldValue(property.uri);

    const commonProps = {
      label: property.label,
      propertyUri: property.uri,
      helpText: property.definition,
    };

    switch (controlType) {
      case 'linkedField':
        return (
          <BibframeLinkedField
            {...commonProps}
            searchType={getSearchType(property)}
            value={value}
            onChange={(val) => updateFieldValue(property.uri, val)}
            placeholder={`Search ${property.label}...`}
          />
        );

      case 'vocabulary':
        return (
          <BibframeVocabularySelect
            {...commonProps}
            vocabularyType={getVocabularyType(property)}
            value={value}
            onChange={(uri, term) => updateFieldValue(property.uri, { uri, label: term.label })}
            placeholder={`Select ${property.label}...`}
          />
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              {property.label}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-xs">{property.definition}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">{property.uri}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <Textarea
              value={value || ''}
              onChange={(e) => updateFieldValue(property.uri, e.target.value)}
              placeholder={property.definition}
              rows={3}
            />
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              {property.label}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-xs">{property.definition}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">{property.uri}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <Input
              type="date"
              value={value || ''}
              onChange={(e) => updateFieldValue(property.uri, e.target.value)}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              {property.label}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-xs">{property.definition}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">{property.uri}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <Input
              value={value || ''}
              onChange={(e) => updateFieldValue(property.uri, e.target.value)}
              placeholder={property.definition}
            />
          </div>
        );
    }
  };

  // Group properties by category
  const groupPropertiesByCategory = (properties: OntologyProperty[]) => {
    const categories: Record<string, OntologyProperty[]> = {
      'Identification': [],
      'Content & Carrier': [],
      'Contributors': [],
      'Subject Access': [],
      'Notes': [],
      'Other': [],
    };

    properties.forEach(prop => {
      if (prop.uri.includes('title') || prop.uri.includes('identifiedBy')) {
        categories['Identification'].push(prop);
      } else if (prop.uri.includes('content') || prop.uri.includes('carrier') || 
                 prop.uri.includes('media') || prop.uri.includes('extent')) {
        categories['Content & Carrier'].push(prop);
      } else if (prop.uri.includes('contribution') || prop.uri.includes('agent') ||
                 prop.uri.includes('role')) {
        categories['Contributors'].push(prop);
      } else if (prop.uri.includes('subject') || prop.uri.includes('genre') ||
                 prop.uri.includes('classification')) {
        categories['Subject Access'].push(prop);
      } else if (prop.uri.includes('note') || prop.uri.includes('summary')) {
        categories['Notes'].push(prop);
      } else {
        categories['Other'].push(prop);
      }
    });

    return categories;
  };

  // Save the record
  const handleSave = () => {
    const record = {
      '@context': 'http://id.loc.gov/ontologies/bibframe/',
      '@type': [selectedResourceType],
      work: Object.fromEntries(workFields),
      instance: Object.fromEntries(instanceFields),
      item: Object.fromEntries(itemFields),
    };

    console.log('BIBFRAME Record (Ontology-Driven):', JSON.stringify(record, null, 2));
    alert('Check console for complete BIBFRAME record');
  };

  const properties = getCurrentProperties();
  const groupedProperties = groupPropertiesByCategory(properties.slice(0, 20)); // Limit for demo

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* Header with Ontology Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Moon BIBFRAME Editor
            </h1>
            <p className="text-muted-foreground mt-1">
              Powered by the official Library of Congress BIBFRAME {bibframeOntologyCore.getOntology().version} Ontology
            </p>
          </div>
          <a
            href="https://github.com/lcnetdev/bibframe-ontology"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            View Ontology on GitHub
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Ontology Stats */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {bibframeOntologyCore.getAllClasses().length}
                </div>
                <div className="text-sm text-muted-foreground">Classes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {bibframeOntologyCore.getAllProperties().length}
                </div>
                <div className="text-sm text-muted-foreground">Properties</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {bibframeOntologyCore.getWorkClasses().length}
                </div>
                <div className="text-sm text-muted-foreground">Work Types</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {bibframeOntologyCore.getInstanceClasses().length}
                </div>
                <div className="text-sm text-muted-foreground">Instance Types</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Type Selector */}
      <Tabs value={selectedResourceType} onValueChange={(val) => setSelectedResourceType(val as any)}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="Work" className="gap-2">
            <Badge variant="outline">Work</Badge>
            {workClass && (
              <span className="text-xs text-muted-foreground">
                {bibframeOntologyCore.getPropertiesForClass('Work').length} properties
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Instance" className="gap-2">
            <Badge variant="outline">Instance</Badge>
            {instanceClass && (
              <span className="text-xs text-muted-foreground">
                {bibframeOntologyCore.getPropertiesForClass('Instance').length} properties
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Item" className="gap-2">
            <Badge variant="outline">Item</Badge>
            {itemClass && (
              <span className="text-xs text-muted-foreground">
                {bibframeOntologyCore.getPropertiesForClass('Item').length} properties
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Dynamic Forms Generated from Ontology */}
        <TabsContent value={selectedResourceType} className="space-y-6">
          {/* Class Definition Card */}
          {(selectedResourceType === 'Work' ? workClass :
            selectedResourceType === 'Instance' ? instanceClass : itemClass) && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedResourceType}
                  <a
                    href={(selectedResourceType === 'Work' ? workClass :
                          selectedResourceType === 'Instance' ? instanceClass : itemClass)?.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardTitle>
                <CardDescription>
                  {(selectedResourceType === 'Work' ? workClass :
                    selectedResourceType === 'Instance' ? instanceClass : itemClass)?.definition}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Dynamically Generated Property Groups */}
          {Object.entries(groupedProperties).map(([category, props]) => 
            props.length > 0 && (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                  <CardDescription>
                    Properties defined in the BIBFRAME ontology for {selectedResourceType}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {props.map(property => (
                    <div key={property.uri}>
                      {renderField(property)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <Button onClick={handleSave} size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          Save BIBFRAME Record
        </Button>
        <Button onClick={() => window.open('http://id.loc.gov/ontologies/bibframe.html', '_blank')} variant="outline" size="lg" className="gap-2">
          <Eye className="h-4 w-4" />
          View Full Ontology
        </Button>
      </div>

      {/* Info Box */}
      <Card className="mt-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Ontology-Driven Architecture:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>All forms dynamically generated from the official BIBFRAME ontology</li>
            <li>Based on https://github.com/lcnetdev/bibframe-ontology (Version {bibframeOntologyCore.getOntology().version})</li>
            <li>200+ classes and 200+ properties from Library of Congress</li>
            <li>Full property definitions, domains, and ranges from the ontology</li>
            <li>Automatic field type detection based on ontology metadata</li>
            <li>Complete integration with LOC controlled vocabularies</li>
            <li>All URIs, labels, and relationships preserved from the ontology</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}