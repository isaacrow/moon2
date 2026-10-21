import React, { useState, useMemo } from 'react';
import { Search, Book, Tag, FileText, Link as LinkIcon, ChevronRight, ChevronDown, Info, ExternalLink } from 'lucide-react';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { BIBFRAME_VOCABULARIES } from '../types/bibframe3';

interface OntologyClass {
  name: string;
  uri: string;
  label: string;
  definition: string;
  subClassOf?: string;
  subClasses?: string[];
  properties?: string[];
  controlledList?: string;
  examples?: string;
}

interface OntologyProperty {
  name: string;
  uri: string;
  label: string;
  definition: string;
  domain?: string;
  range?: string;
  subPropertyOf?: string;
  subProperties?: string[];
  controlledList?: string;
}

// BIBFRAME 3.0.1 Core Classes (Top-level categories)
const CORE_CLASSES: Record<string, OntologyClass[]> = {
  'Work Classes': [
    {
      name: 'Work',
      uri: 'http://id.loc.gov/ontologies/bibframe/Work',
      label: 'Work',
      definition: 'Resource reflecting a conceptual essence of a cataloging resource',
      properties: ['title', 'contribution', 'subject', 'classification', 'language', 'content'],
      examples: 'All types of creative works including texts, audio, moving images, etc.'
    },
    {
      name: 'Text',
      uri: 'http://id.loc.gov/ontologies/bibframe/Text',
      label: 'Text',
      definition: 'Resource intended to be perceived visually and understood through the use of language in written or spoken form',
      subClassOf: 'Work',
      examples: 'Books, articles, manuscripts'
    },
    {
      name: 'Cartography',
      uri: 'http://id.loc.gov/ontologies/bibframe/Cartography',
      label: 'Cartography',
      definition: 'Resource that shows spatial information, including maps, atlases, globes',
      subClassOf: 'Work',
      examples: 'Maps, atlases, globes, digital cartographic resources'
    },
    {
      name: 'Audio',
      uri: 'http://id.loc.gov/ontologies/bibframe/Audio',
      label: 'Audio',
      definition: 'Resources expressed in an audible form, including music or other sounds',
      subClassOf: 'Work',
      subClasses: ['MusicAudio', 'NonMusicAudio'],
      examples: 'Music recordings, spoken word recordings'
    },
    {
      name: 'NotatedMusic',
      uri: 'http://id.loc.gov/ontologies/bibframe/NotatedMusic',
      label: 'Notated music',
      definition: 'Graphic, non-realized representations of musical works intended to be perceived visually',
      subClassOf: 'Work',
      examples: 'Musical scores, sheet music'
    },
    {
      name: 'MovingImage',
      uri: 'http://id.loc.gov/ontologies/bibframe/MovingImage',
      label: 'Moving image',
      definition: 'Images intended to be perceived as moving, including motion pictures or video recordings',
      subClassOf: 'Work',
      examples: 'Films, videos, animations'
    },
    {
      name: 'StillImage',
      uri: 'http://id.loc.gov/ontologies/bibframe/StillImage',
      label: 'Still image',
      definition: 'Resource expressed through line, shape, shading, etc., intended to be perceived visually as a still image',
      subClassOf: 'Work',
      examples: 'Photographs, paintings, drawings, slides'
    },
    {
      name: 'Dataset',
      uri: 'http://id.loc.gov/ontologies/bibframe/Dataset',
      label: 'Dataset',
      definition: 'Data encoded in a defined structure, including numeric data, environmental data',
      subClassOf: 'Work',
      examples: 'Statistical data, scientific datasets'
    },
    {
      name: 'Object',
      uri: 'http://id.loc.gov/ontologies/bibframe/Object',
      label: 'Three-dimensional object',
      definition: 'Resource in a form intended to be perceived visually in three-dimensions',
      subClassOf: 'Work',
      examples: 'Models, sculptures, specimens'
    },
    {
      name: 'Multimedia',
      uri: 'http://id.loc.gov/ontologies/bibframe/Multimedia',
      label: 'Software or multimedia',
      definition: 'Electronic resource which is a computer program or consists of multiple media types',
      subClassOf: 'Work',
      examples: 'Computer programs, video games, interactive multimedia'
    },
  ],
  'Instance Classes': [
    {
      name: 'Instance',
      uri: 'http://id.loc.gov/ontologies/bibframe/Instance',
      label: 'Instance',
      definition: 'Resource reflecting an individual, material embodiment of a Work',
      properties: ['title', 'provisionActivity', 'identifiedBy', 'carrier', 'media', 'extent'],
      examples: 'Specific published manifestations, editions'
    },
    {
      name: 'Print',
      uri: 'http://id.loc.gov/ontologies/bibframe/Print',
      label: 'Printed',
      definition: 'Resource that is printed',
      subClassOf: 'Instance',
      examples: 'Printed books, journals'
    },
    {
      name: 'Electronic',
      uri: 'http://id.loc.gov/ontologies/bibframe/Electronic',
      label: 'Electronic',
      definition: 'Resource that is intended for manipulation by a computer',
      subClassOf: 'Instance',
      examples: 'E-books, digital files, online resources'
    },
    {
      name: 'Archival',
      uri: 'http://id.loc.gov/ontologies/bibframe/Archival',
      label: 'Archival controlled',
      definition: 'Resources organically created and preserved because of their continuing value',
      subClassOf: 'Instance',
      examples: 'Archival collections, manuscript collections'
    },
    {
      name: 'Tactile',
      uri: 'http://id.loc.gov/ontologies/bibframe/Tactile',
      label: 'Tactile material',
      definition: 'Resource that is intended to be perceived by touch',
      subClassOf: 'Instance',
      examples: 'Braille materials, tactile graphics'
    },
    {
      name: 'Microform',
      uri: 'http://id.loc.gov/ontologies/bibframe/Microform',
      label: 'Microform',
      definition: 'Resource that contains microimages',
      subClassOf: 'Instance',
      examples: 'Microfilm, microfiche'
    },
  ],
  'Agent Classes': [
    {
      name: 'Agent',
      uri: 'http://id.loc.gov/ontologies/bibframe/Agent',
      label: 'Agent',
      definition: 'Entity having a role in a resource, such as a person or organization',
      subClasses: ['Person', 'Organization', 'Family', 'Meeting', 'Jurisdiction'],
      controlledList: BIBFRAME_VOCABULARIES.names
    },
    {
      name: 'Person',
      uri: 'http://id.loc.gov/ontologies/bibframe/Person',
      label: 'Person',
      definition: 'Individual or identity established by an individual',
      subClassOf: 'Agent'
    },
    {
      name: 'Organization',
      uri: 'http://id.loc.gov/ontologies/bibframe/Organization',
      label: 'Organization',
      definition: 'Corporation or group of persons and/or organizations that acts as a unit',
      subClassOf: 'Agent',
      controlledList: BIBFRAME_VOCABULARIES.organizations
    },
    {
      name: 'Family',
      uri: 'http://id.loc.gov/ontologies/bibframe/Family',
      label: 'Family',
      definition: 'Two or more persons related by birth, marriage, adoption, or similar legal status',
      subClassOf: 'Agent'
    },
    {
      name: 'Meeting',
      uri: 'http://id.loc.gov/ontologies/bibframe/Meeting',
      label: 'Meeting',
      definition: 'Gathering of individuals or representatives for discussion and/or action',
      subClassOf: 'Agent'
    },
  ],
  'Title Classes': [
    {
      name: 'Title',
      uri: 'http://id.loc.gov/ontologies/bibframe/Title',
      label: 'Title entity',
      definition: 'Title information relating to a resource',
      properties: ['mainTitle', 'subtitle', 'partName', 'partNumber'],
      subClasses: ['VariantTitle', 'AbbreviatedTitle', 'KeyTitle', 'ParallelTitle']
    },
  ],
  'Identifier Classes': [
    {
      name: 'Identifier',
      uri: 'http://id.loc.gov/ontologies/bibframe/Identifier',
      label: 'Identifier',
      definition: 'Token or name that is associated with a resource',
      subClasses: ['Lccn', 'Isbn', 'Issn', 'Doi', 'Urn', 'Local'],
      properties: ['value', 'qualifier', 'assigner']
    },
  ],
};

// BIBFRAME 3.0.1 Core Properties (organized by category)
const CORE_PROPERTIES: Record<string, OntologyProperty[]> = {
  'Title Properties': [
    {
      name: 'title',
      uri: 'http://id.loc.gov/ontologies/bibframe/title',
      label: 'Title resource',
      definition: 'Name given to a resource',
      domain: 'Work, Instance, Item, Event',
      range: 'Title'
    },
    {
      name: 'mainTitle',
      uri: 'http://id.loc.gov/ontologies/bibframe/mainTitle',
      label: 'Main title',
      definition: 'Title being addressed. Possible title component',
      domain: 'Title',
      range: 'Literal'
    },
    {
      name: 'subtitle',
      uri: 'http://id.loc.gov/ontologies/bibframe/subtitle',
      label: 'Subtitle',
      definition: 'Word, character, or group of words and/or characters that contains the remainder of the title',
      domain: 'Title',
      range: 'Literal'
    },
  ],
  'Contribution Properties': [
    {
      name: 'contribution',
      uri: 'http://id.loc.gov/ontologies/bibframe/contribution',
      label: 'Contributor and role',
      definition: 'Agent and its role in relation to the resource',
      domain: 'Work, Instance, Item',
      range: 'Contribution'
    },
    {
      name: 'agent',
      uri: 'http://id.loc.gov/ontologies/bibframe/agent',
      label: 'Associated agent',
      definition: 'Entity associated with a resource',
      domain: 'Contribution',
      range: 'Agent',
      controlledList: BIBFRAME_VOCABULARIES.names
    },
    {
      name: 'role',
      uri: 'http://id.loc.gov/ontologies/bibframe/role',
      label: 'Contributor role',
      definition: 'Function provided by a contributor',
      domain: 'Contribution',
      range: 'Role',
      controlledList: BIBFRAME_VOCABULARIES.relators
    },
  ],
  'Subject Properties': [
    {
      name: 'subject',
      uri: 'http://id.loc.gov/ontologies/bibframe/subject',
      label: 'Subject',
      definition: 'Subject term(s) describing a resource',
      domain: 'Work, Instance, Item, Event',
      range: 'Topic, Agent, Place, Event, Temporal',
      controlledList: BIBFRAME_VOCABULARIES.subjects
    },
    {
      name: 'genreForm',
      uri: 'http://id.loc.gov/ontologies/bibframe/genreForm',
      label: 'Genre/form',
      definition: 'Form category or genre to which a resource belongs',
      domain: 'Work, Instance, Item',
      range: 'GenreForm',
      controlledList: BIBFRAME_VOCABULARIES.genreForms
    },
  ],
  'Classification Properties': [
    {
      name: 'classification',
      uri: 'http://id.loc.gov/ontologies/bibframe/classification',
      label: 'Classification',
      definition: 'Classification number in any scheme',
      domain: 'Work, Instance, Item',
      range: 'Classification'
    },
  ],
  'Identifier Properties': [
    {
      name: 'identifiedBy',
      uri: 'http://id.loc.gov/ontologies/bibframe/identifiedBy',
      label: 'Identifier',
      definition: 'Character string associated with a resource that serves to differentiate that resource',
      domain: 'Any',
      range: 'Identifier'
    },
  ],
  'Provision Properties': [
    {
      name: 'provisionActivity',
      uri: 'http://id.loc.gov/ontologies/bibframe/provisionActivity',
      label: 'Provision activity',
      definition: 'Place, name, and/or date information relating to publication, distribution, etc.',
      domain: 'Instance',
      range: 'ProvisionActivity'
    },
  ],
};

export default function BibframeOntologyBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<OntologyClass | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<OntologyProperty | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Work Classes': true,
  });

  // Add defensive null checks
  if (!BIBFRAME_VOCABULARIES) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading ontology data...</p>
      </div>
    );
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const filteredClasses = useMemo(() => {
    if (!searchTerm) return CORE_CLASSES;
    
    const filtered: Record<string, OntologyClass[]> = {};
    Object.entries(CORE_CLASSES).forEach(([category, classes]) => {
      const matchingClasses = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.definition.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingClasses.length > 0) {
        filtered[category] = matchingClasses;
      }
    });
    return filtered;
  }, [searchTerm]);

  const filteredProperties = useMemo(() => {
    if (!searchTerm) return CORE_PROPERTIES;
    
    const filtered: Record<string, OntologyProperty[]> = {};
    Object.entries(CORE_PROPERTIES).forEach(([category, properties]) => {
      const matchingProperties = properties.filter(prop =>
        prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.definition.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingProperties.length > 0) {
        filtered[category] = matchingProperties;
      }
    });
    return filtered;
  }, [searchTerm]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-blue-50 dark:bg-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Book className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              BIBFRAME 3.0.1 Ontology Browser
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Library of Congress BIBFRAME Ontology - Version 3.0.1
            </p>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search classes and properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800"
          />
        </div>

        <div className="mt-4 flex gap-2">
          <Badge variant="outline" className="text-xs">
            <Info className="h-3 w-3 mr-1" />
            200+ Classes
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Tag className="h-3 w-3 mr-1" />
            200+ Properties
          </Badge>
          <a
            href="http://id.loc.gov/ontologies/bibframe.html"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto"
          >
            <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-gray-200">
              <ExternalLink className="h-3 w-3 mr-1" />
              View on LOC
            </Badge>
          </a>
        </div>
      </div>

      <Tabs defaultValue="classes" className="flex-1 flex flex-col">
        <TabsList className="mx-6 mt-4">
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="vocabularies" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Vocabularies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="flex-1 mt-0 p-6">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Classes List */}
            <ScrollArea className="h-[calc(100vh-300px)] border rounded-lg p-4 bg-white dark:bg-gray-800">
              {Object.entries(filteredClasses).map(([category, classes]) => (
                <div key={category} className="mb-4">
                  <Collapsible
                    open={expandedCategories[category]}
                    onOpenChange={() => toggleCategory(category)}
                  >
                    <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-2">
                      {expandedCategories[category] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {category} ({classes.length})
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-1 pl-6">
                        {classes.map((cls) => (
                          <button
                            key={cls.name}
                            onClick={() => setSelectedClass(cls)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedClass?.name === cls.name
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="font-medium">{cls.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              bf:{cls.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </ScrollArea>

            {/* Class Details */}
            <div>
              {selectedClass ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      {selectedClass.label}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {selectedClass.uri}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Definition</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedClass.definition}
                      </p>
                    </div>

                    {selectedClass.subClassOf && (
                      <div>
                        <h3 className="font-semibold text-sm mb-2">SubClass Of</h3>
                        <Badge variant="secondary">{selectedClass.subClassOf}</Badge>
                      </div>
                    )}

                    {selectedClass.subClasses && selectedClass.subClasses.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm mb-2">SubClasses</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedClass.subClasses.map((sub) => (
                            <Badge key={sub} variant="outline">{sub}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedClass.properties && selectedClass.properties.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm mb-2">Key Properties</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedClass.properties.map((prop) => (
                            <Badge key={prop} variant="outline" className="text-xs">
                              {prop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedClass.controlledList && (
                      <div>
                        <h3 className="font-semibold text-sm mb-2">Controlled List</h3>
                        <a
                          href={selectedClass.controlledList}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {selectedClass.controlledList}
                        </a>
                      </div>
                    )}

                    {selectedClass.examples && (
                      <div>
                        <h3 className="font-semibold text-sm mb-2">Examples</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                          {selectedClass.examples}
                        </p>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(selectedClass.uri, '_blank')}
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Documentation
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Select a class to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="flex-1 mt-0 p-6">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Properties List */}
            <ScrollArea className="h-[calc(100vh-300px)] border rounded-lg p-4 bg-white dark:bg-gray-800">
              {Object.entries(filteredProperties).map(([category, properties]) => (
                <div key={category} className="mb-4">
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {category} ({properties.length})
                  </h3>
                  <div className="space-y-1 pl-2">
                    {properties.map((prop) => (
                      <button
                        key={prop.name}
                        onClick={() => setSelectedProperty(prop)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedProperty?.name === prop.name
                            ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="font-medium">{prop.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          bf:{prop.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>

            {/* Property Details */}
            <div>
              {selectedProperty ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-green-600" />
                      {selectedProperty.label}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {selectedProperty.uri}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Definition</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedProperty.definition}
                      </p>
                    </div>

                    {selectedProperty.domain && (
                      <div>
                        <h3 className="font-semibold text-sm mb-2">Domain (Used with)</h3>
                        <Badge variant="secondary">{selectedProperty.domain}</Badge>
                      </div>
                    )}

                    {selectedProperty.range && (
                      <div>
                        <h3 className="font-semibold text-sm mb-2">Range (Expected Value)</h3>
                        <Badge variant="secondary">{selectedProperty.range}</Badge>
                      </div>
                    )}

                    {selectedProperty.subPropertyOf && (
                      <div>
                        <h3 className="font-semibold text-sm mb-2">SubProperty Of</h3>
                        <Badge variant="outline">{selectedProperty.subPropertyOf}</Badge>
                      </div>
                    )}

                    {selectedProperty.controlledList && (
                      <div>
                        <h3 className="font-semibold text-sm mb-2">Controlled List</h3>
                        <a
                          href={selectedProperty.controlledList}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {selectedProperty.controlledList}
                        </a>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(selectedProperty.uri, '_blank')}
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Documentation
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <LinkIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Select a property to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vocabularies" className="flex-1 mt-0 p-6">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(BIBFRAME_VOCABULARIES as Record<string, string>).map(([key, url]) => (
                <Card key={key}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Tag className="h-4 w-4 text-purple-600" />
                      {key}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 break-all"
                    >
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      {url}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
