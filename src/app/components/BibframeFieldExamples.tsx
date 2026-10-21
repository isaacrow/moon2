/**
 * BIBFRAME Field Examples
 * Demonstrates how to use the fully-linked BIBFRAME fields with LOC API integration
 */

import React, { useState } from 'react';
import { BibframeLinkedField } from './fields/BibframeLinkedField';
import { BibframeVocabularySelect } from './fields/BibframeVocabularySelect';
import { BibframeEntity } from '../services/bibframeApiService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Save, Eye } from 'lucide-react';

export function BibframeFieldExamples() {
  // Work fields state
  const [creator, setCreator] = useState<BibframeEntity | null>(null);
  const [contributor, setContributor] = useState<BibframeEntity | null>(null);
  const [subject, setSubject] = useState<BibframeEntity | null>(null);
  const [genreForm, setGenreForm] = useState<BibframeEntity | null>(null);
  const [geographicCoverage, setGeographicCoverage] = useState<BibframeEntity | null>(null);
  
  // Instance fields state
  const [contentType, setContentType] = useState<string>('');
  const [mediaType, setMediaType] = useState<string>('');
  const [carrierType, setCarrierType] = useState<string>('');
  const [issuanceMode, setIssuanceMode] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [country, setCountry] = useState<string>('');

  // Handle save - this would integrate with your backend
  const handleSave = () => {
    const bibframeData = {
      work: {
        creator: creator ? {
          '@id': creator.uri,
          '@type': creator.type,
          label: creator.label,
        } : null,
        contributor: contributor ? {
          '@id': contributor.uri,
          '@type': contributor.type,
          label: contributor.label,
        } : null,
        subject: subject ? {
          '@id': subject.uri,
          '@type': subject.type,
          label: subject.label,
        } : null,
        genreForm: genreForm ? {
          '@id': genreForm.uri,
          '@type': genreForm.type,
          label: genreForm.label,
        } : null,
        geographicCoverage: geographicCoverage ? {
          '@id': geographicCoverage.uri,
          '@type': geographicCoverage.type,
          label: geographicCoverage.label,
        } : null,
      },
      instance: {
        contentType: contentType ? { '@id': contentType } : null,
        mediaType: mediaType ? { '@id': mediaType } : null,
        carrierType: carrierType ? { '@id': carrierType } : null,
        issuance: issuanceMode ? { '@id': issuanceMode } : null,
        language: language ? { '@id': language } : null,
        country: country ? { '@id': country } : null,
      },
    };

    console.log('BIBFRAME Data with URIs:', JSON.stringify(bibframeData, null, 2));
    alert('Check console for BIBFRAME data with full URIs and labels');
  };

  // Preview the data
  const handlePreview = () => {
    const preview = {
      work: {
        creator: creator?.label || 'Not set',
        creatorUri: creator?.uri || '',
        contributor: contributor?.label || 'Not set',
        contributorUri: contributor?.uri || '',
        subject: subject?.label || 'Not set',
        subjectUri: subject?.uri || '',
        genreForm: genreForm?.label || 'Not set',
        genreFormUri: genreForm?.uri || '',
        geographicCoverage: geographicCoverage?.label || 'Not set',
        geographicCoverageUri: geographicCoverage?.uri || '',
      },
      instance: {
        contentType: contentType || 'Not set',
        mediaType: mediaType || 'Not set',
        carrierType: carrierType || 'Not set',
        issuance: issuanceMode || 'Not set',
        language: language || 'Not set',
        country: country || 'Not set',
      },
    };

    console.log('BIBFRAME Preview:', preview);
    alert('Check console for preview data');
  };

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">BIBFRAME Cataloging with Full LOC API Integration</h1>
        <p className="text-muted-foreground">
          All fields are linked to Library of Congress controlled vocabularies with URIs and labels
        </p>
      </div>

      <Tabs defaultValue="work" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="work">Work Fields</TabsTrigger>
          <TabsTrigger value="instance">Instance Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="work" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Creator of Work</CardTitle>
              <CardDescription>
                Search Library of Congress Name Authority File (LCNAF) for persons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BibframeLinkedField
                label="Creator (Person)"
                propertyUri="http://id.loc.gov/ontologies/bibframe/agent"
                searchType="person"
                value={creator}
                onChange={setCreator}
                placeholder="Search for a person (e.g., Budd, Ann, 1956-)"
                helpText="Search returns linked data from LOC with full URIs"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contributors</CardTitle>
              <CardDescription>
                Search for contributing agents (organizations, persons, meetings)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BibframeLinkedField
                label="Contributor"
                propertyUri="http://id.loc.gov/ontologies/bibframe/agent"
                searchType="all"
                value={contributor}
                onChange={setContributor}
                placeholder="Search for any contributor"
                helpText="Searches across persons, organizations, and meetings"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subject Access</CardTitle>
              <CardDescription>
                Subject headings from Library of Congress Subject Headings (LCSH)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BibframeLinkedField
                label="Subject Topic"
                propertyUri="http://id.loc.gov/ontologies/bibframe/subject"
                searchType="topic"
                value={subject}
                onChange={setSubject}
                placeholder="Search LCSH (e.g., Knitting--Patterns)"
                helpText="Returns authorized subject headings with URIs"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Genre/Form</CardTitle>
              <CardDescription>
                Genre and form terms from LCGFT
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BibframeLinkedField
                label="Genre/Form"
                propertyUri="http://id.loc.gov/ontologies/bibframe/genreForm"
                searchType="genreForm"
                value={genreForm}
                onChange={setGenreForm}
                placeholder="Search LCGFT"
                helpText="Library of Congress Genre/Form Terms"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Coverage</CardTitle>
              <CardDescription>
                Geographic coverage of the content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BibframeLinkedField
                label="Geographic Coverage"
                propertyUri="http://id.loc.gov/ontologies/bibframe/geographicCoverage"
                searchType="geographic"
                value={geographicCoverage}
                onChange={setGeographicCoverage}
                placeholder="Search geographic names"
                helpText="Geographic names from LCNAF"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Type</CardTitle>
              <CardDescription>
                Form of communication and human sense
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BibframeVocabularySelect
                label="Content Type"
                propertyUri="http://id.loc.gov/ontologies/bibframe/content"
                vocabularyType="contentTypes"
                value={contentType}
                onChange={(uri, term) => setContentType(uri)}
                placeholder="Select content type"
                helpText="Categorization reflecting the fundamental form of communication"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media Type</CardTitle>
              <CardDescription>
                Type of intermediation device required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BibframeVocabularySelect
                label="Media Type"
                propertyUri="http://id.loc.gov/ontologies/bibframe/media"
                vocabularyType="mediaTypes"
                value={mediaType}
                onChange={(uri, term) => setMediaType(uri)}
                placeholder="Select media type"
                helpText="General type of intermediation device (unmediated, computer, audio, video, etc.)"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carrier Type</CardTitle>
              <CardDescription>
                Format of the storage medium and housing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BibframeVocabularySelect
                label="Carrier Type"
                propertyUri="http://id.loc.gov/ontologies/bibframe/carrier"
                vocabularyType="carriers"
                value={carrierType}
                onChange={(uri, term) => setCarrierType(uri)}
                placeholder="Select carrier type"
                helpText="Format of the storage medium and housing (volume, sheet, online resource, etc.)"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mode of Issuance</CardTitle>
              <CardDescription>
                How the resource is issued
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BibframeVocabularySelect
                label="Issuance Mode"
                propertyUri="http://id.loc.gov/ontologies/bibframe/issuance"
                vocabularyType="issuance"
                value={issuanceMode}
                onChange={(uri, term) => setIssuanceMode(uri)}
                placeholder="Select issuance mode"
                helpText="Whether issued in one or more parts (single unit, serial, multipart monograph, etc.)"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Language</CardTitle>
              <CardDescription>
                Language of the content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BibframeVocabularySelect
                label="Language"
                propertyUri="http://id.loc.gov/ontologies/bibframe/language"
                vocabularyType="languages"
                value={language}
                onChange={(uri, term) => setLanguage(uri)}
                placeholder="Select language"
                helpText="Language associated with the resource"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Country of Origin</CardTitle>
              <CardDescription>
                Place of publication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BibframeVocabularySelect
                label="Country"
                propertyUri="http://id.loc.gov/ontologies/bibframe/place"
                vocabularyType="countries"
                value={country}
                onChange={(uri, term) => setCountry(uri)}
                placeholder="Select country"
                helpText="Country associated with publication"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <Button onClick={handleSave} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save BIBFRAME Record
        </Button>
        <Button onClick={handlePreview} variant="outline" size="lg">
          <Eye className="h-4 w-4 mr-2" />
          Preview Data
        </Button>
      </div>

      {/* Info Box */}
      <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Full BIBFRAME API Integration Features:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>All fields link to Library of Congress controlled vocabularies</li>
            <li>Real-time search with LOC Suggest API</li>
            <li>Full URI display for all selected values</li>
            <li>Linked data from LCNAF, LCSH, LCGFT, and other LOC vocabularies</li>
            <li>Property definitions from BIBFRAME 3.0.1 ontology</li>
            <li>Type information and source attribution</li>
            <li>Saves data as proper linked data with @id and @type</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
