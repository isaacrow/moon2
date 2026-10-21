import React from 'react';
import { useTranslation } from 'react-i18next';
import { BIBFRAMEWork, AuthorityLookupResult } from '../types/bibframe';
import { AutocompleteField } from './AutocompleteField';
import { MultiSourceAuthorityField } from './MultiSourceAuthorityField';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { 
  searchLCNAF, 
  searchLCSH, 
  searchLCGFT, 
  searchPlaces, 
  languageCodes, 
  contentTypes, 
  intendedAudiences, 
  illustrativeContent, 
  colorContent, 
  supplementaryContent 
} from '../services/mockAuthorityService';

interface WorkFormProps {
  work: Partial<BIBFRAMEWork>;
  onChange: (work: Partial<BIBFRAMEWork>) => void;
}

export function WorkForm({ work, onChange }: WorkFormProps) {
  const { t } = useTranslation();
  
  // Safety check: ensure work is never undefined
  const safeWork = work || {};
  
  const updateWork = (updates: Partial<BIBFRAMEWork>) => {
    onChange({ ...safeWork, ...updates });
  };

  const handleTitleChange = (value: string) => {
    updateWork({
      'bf:title': {
        '@type': 'bf:Title',
        'bf:mainTitle': value,
      },
    });
  };

  const handleCreatorAdd = (creator: AuthorityLookupResult) => {
    const existing = safeWork['bf:creator'] || [];
    updateWork({ 'bf:creator': [...existing, creator] });
  };

  const handleCreatorRemove = (creator: AuthorityLookupResult) => {
    const filtered = (safeWork['bf:creator'] || []).filter(c => c.uri !== creator.uri);
    updateWork({ 'bf:creator': filtered });
  };

  const handleContributorAdd = (contributor: AuthorityLookupResult) => {
    const existing = safeWork['bf:contributor'] || [];
    updateWork({ 'bf:contributor': [...existing, contributor] });
  };

  const handleContributorRemove = (contributor: AuthorityLookupResult) => {
    const filtered = (safeWork['bf:contributor'] || []).filter(c => c.uri !== contributor.uri);
    updateWork({ 'bf:contributor': filtered });
  };

  const handleSubjectAdd = (subject: AuthorityLookupResult) => {
    const existing = safeWork['bf:subject'] || [];
    updateWork({ 'bf:subject': [...existing, subject] });
  };

  const handleSubjectRemove = (subject: AuthorityLookupResult) => {
    const filtered = (safeWork['bf:subject'] || []).filter(s => s.uri !== subject.uri);
    updateWork({ 'bf:subject': filtered });
  };

  const handleGenreAdd = (genre: AuthorityLookupResult) => {
    const existing = safeWork['bf:genreForm'] || [];
    updateWork({ 'bf:genreForm': [...existing, genre] });
  };

  const handleGenreRemove = (genre: AuthorityLookupResult) => {
    const filtered = (safeWork['bf:genreForm'] || []).filter(g => g.uri !== genre.uri);
    updateWork({ 'bf:genreForm': filtered });
  };

  const handleOriginPlaceAdd = (place: AuthorityLookupResult) => {
    const existing = safeWork['bf:originPlace'] || [];
    updateWork({ 'bf:originPlace': [...existing, place] });
  };

  const handleOriginPlaceRemove = (place: AuthorityLookupResult) => {
    const filtered = (safeWork['bf:originPlace'] || []).filter(p => p.uri !== place.uri);
    updateWork({ 'bf:originPlace': filtered });
  };

  const handleOriginDateChange = (value: string) => {
    if (value) {
      updateWork({ 'bf:originDate': value });
    } else {
      updateWork({ 'bf:originDate': undefined });
    }
  };

  const handleLCCChange = (value: string) => {
    const existing = safeWork['bf:classification'] || [];
    const filtered = existing.filter(c => c['@type'] !== 'bf:ClassificationLcc');
    if (value) {
      updateWork({
        'bf:classification': [
          ...filtered,
          {
            '@type': 'bf:ClassificationLcc',
            'bf:classificationPortion': value,
            'bf:source': 'LCC',
          },
        ],
      });
    } else {
      updateWork({ 'bf:classification': filtered });
    }
  };

  const handleDDCChange = (value: string) => {
    const existing = safeWork['bf:classification'] || [];
    const filtered = existing.filter(c => c['@type'] !== 'bf:ClassificationDdc');
    if (value) {
      updateWork({
        'bf:classification': [
          ...filtered,
          {
            '@type': 'bf:ClassificationDdc',
            'bf:classificationPortion': value,
            'bf:source': 'DDC',
          },
        ],
      });
    } else {
      updateWork({ 'bf:classification': filtered });
    }
  };

  const handleLanguageChange = (code: string) => {
    const lang = languageCodes.find(l => l.code === code);
    if (lang) {
      updateWork({
        'bf:language': [
          {
            '@type': 'bf:Language',
            '@id': `http://id.loc.gov/vocabulary/languages/${code}`,
            'rdfs:label': lang.label,
          },
        ],
      });
    }
  };

  const handleContentTypeChange = (uri: string) => {
    const contentType = contentTypes.find(c => c.uri === uri);
    if (contentType) {
      updateWork({
        'bf:content': [
          {
            '@type': 'bf:Content',
            '@id': uri,
            'rdfs:label': contentType.label,
          },
        ],
      });
    }
  };

  const handleIntendedAudienceChange = (uri: string) => {
    const audience = intendedAudiences.find(a => a.uri === uri);
    if (audience) {
      updateWork({
        'bf:intendedAudience': [
          {
            '@type': 'bf:IntendedAudience',
            '@id': uri,
            'rdfs:label': audience.label,
          },
        ],
      });
    }
  };

  const handleIllustrativeContentChange = (uri: string) => {
    const content = illustrativeContent.find(c => c.uri === uri);
    if (content) {
      updateWork({
        'bf:illustrativeContent': [
          {
            '@type': 'bf:IllustrativeContent',
            '@id': uri,
            'rdfs:label': content.label,
          },
        ],
      });
    }
  };

  const handleColorContentChange = (uri: string) => {
    const color = colorContent.find(c => c.uri === uri);
    if (color) {
      updateWork({
        'bf:colorContent': [
          {
            '@type': 'bf:ColorContent',
            '@id': uri,
            'rdfs:label': color.label,
          },
        ],
      });
    }
  };

  const handleSupplementaryContentChange = (uri: string) => {
    const content = supplementaryContent.find(c => c.uri === uri);
    if (content) {
      updateWork({
        'bf:supplementaryContent': [
          {
            '@type': 'bf:SupplementaryContent',
            '@id': uri,
            'rdfs:label': content.label,
          },
        ],
      });
    }
  };

  const handleSummaryChange = (value: string) => {
    if (value) {
      updateWork({
        'bf:summary': [
          {
            '@type': 'bf:Summary',
            'rdfs:label': value,
          },
        ],
      });
    } else {
      updateWork({ 'bf:summary': undefined });
    }
  };

  const handleTableOfContentsChange = (value: string) => {
    if (value) {
      updateWork({
        'bf:tableOfContents': [
          {
            '@type': 'bf:TableOfContents',
            'rdfs:label': value,
          },
        ],
      });
    } else {
      updateWork({ 'bf:tableOfContents': undefined });
    }
  };

  const handleNoteChange = (value: string) => {
    if (value) {
      updateWork({
        'bf:note': [
          {
            '@type': 'bf:Note',
            'rdfs:label': value,
          },
        ],
      });
    } else {
      updateWork({ 'bf:note': undefined });
    }
  };

  const getLCCValue = () => {
    const lcc = safeWork['bf:classification']?.find(c => c['@type'] === 'bf:ClassificationLcc');
    return lcc?.['bf:classificationPortion'] || '';
  };

  const getDDCValue = () => {
    const ddc = safeWork['bf:classification']?.find(c => c['@type'] === 'bf:ClassificationDdc');
    return ddc?.['bf:classificationPortion'] || '';
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">{t('work')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('workDescription')}</p>
      </div>

      <Accordion type="multiple" defaultValue={['title', 'creators', 'subjects']} className="space-y-2">
        <AccordionItem value="title" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm">{t('title')}</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="work-title" className="text-sm font-medium">
                {t('mainTitle')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="work-title"
                value={safeWork['bf:title']?.['bf:mainTitle'] || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={t('mainTitle')}
                className="mt-2"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="creators" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">{t('creator')} & {t('contributors')}</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <MultiSourceAuthorityField
              label={t('creator')}
              placeholder="Search for creator..."
              onSelect={handleCreatorAdd}
              onRemove={handleCreatorRemove}
              selectedValues={safeWork['bf:creator'] || []}
              multiple={true}
              required={true}
              sources={['naf-personal', 'naf-corporate', 'viaf', 'wikidata', 'afiqa']}
            />

            <MultiSourceAuthorityField
              label={t('contributors')}
              placeholder="Search for contributors..."
              onSelect={handleContributorAdd}
              onRemove={handleContributorRemove}
              selectedValues={safeWork['bf:contributor'] || []}
              multiple={true}
              sources={['naf-personal', 'naf-corporate', 'naf-conference', 'viaf', 'wikidata', 'afiqa']}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="subjects" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">{t('subjects')} & {t('genreForm')}</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <AutocompleteField
              label={t('subjects')}
              placeholder="Search LCSH..."
              searchFunction={searchLCSH}
              onSelect={handleSubjectAdd}
              onRemove={handleSubjectRemove}
              selectedValues={safeWork['bf:subject'] || []}
              multiple={true}
            />

            <AutocompleteField
              label={t('genreForm')}
              placeholder="Search LCGFT..."
              searchFunction={searchLCGFT}
              onSelect={handleGenreAdd}
              onRemove={handleGenreRemove}
              selectedValues={safeWork['bf:genreForm'] || []}
              multiple={true}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="classification" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">Classification</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="lcc" className="text-sm font-medium">
                Library of Congress Classification (LCC)
              </Label>
              <Input
                id="lcc"
                value={getLCCValue()}
                onChange={(e) => handleLCCChange(e.target.value)}
                placeholder="e.g., PS3537.A426"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="ddc" className="text-sm font-medium">
                Dewey Decimal Classification (DDC)
              </Label>
              <Input
                id="ddc"
                value={getDDCValue()}
                onChange={(e) => handleDDCChange(e.target.value)}
                placeholder="e.g., 813.52"
                className="mt-2"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="origin" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">Origin Information</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <AutocompleteField
              label="Origin Place"
              placeholder="Search places..."
              searchFunction={searchPlaces}
              onSelect={handleOriginPlaceAdd}
              onRemove={handleOriginPlaceRemove}
              selectedValues={safeWork['bf:originPlace'] || []}
              multiple={true}
            />

            <div>
              <Label htmlFor="origin-date" className="text-sm font-medium">
                Origin Date
              </Label>
              <Input
                id="origin-date"
                value={safeWork['bf:originDate'] || ''}
                onChange={(e) => handleOriginDateChange(e.target.value)}
                placeholder="e.g., 1925, 2020-2023"
                className="mt-2"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="attributes" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">Content Attributes</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="language" className="text-sm font-medium">
                Language
              </Label>
              <Select
                value={safeWork['bf:language']?.[0]?.['@id']?.split('/').pop() || ''}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger id="language" className="mt-2">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languageCodes.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label} ({lang.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="content-type" className="text-sm font-medium">
                Content Type
              </Label>
              <Select
                value={safeWork['bf:content']?.[0]?.['@id'] || ''}
                onValueChange={handleContentTypeChange}
              >
                <SelectTrigger id="content-type" className="mt-2">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.uri} value={type.uri}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="audience" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">Intended Audience</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="audience" className="text-sm font-medium">
                Intended Audience
              </Label>
              <Select
                value={safeWork['bf:intendedAudience']?.[0]?.['@id'] || ''}
                onValueChange={handleIntendedAudienceChange}
              >
                <SelectTrigger id="audience" className="mt-2">
                  <SelectValue placeholder="Select intended audience" />
                </SelectTrigger>
                <SelectContent>
                  {intendedAudiences.map((audience) => (
                    <SelectItem key={audience.uri} value={audience.uri}>
                      {audience.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="content-description" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">Content Description</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="illustrative" className="text-sm font-medium">
                Illustrative Content
              </Label>
              <Select
                value={safeWork['bf:illustrativeContent']?.[0]?.['@id'] || ''}
                onValueChange={handleIllustrativeContentChange}
              >
                <SelectTrigger id="illustrative" className="mt-2">
                  <SelectValue placeholder="Select illustrative content" />
                </SelectTrigger>
                <SelectContent>
                  {illustrativeContent.map((content) => (
                    <SelectItem key={content.uri} value={content.uri}>
                      {content.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color" className="text-sm font-medium">
                Color Content
              </Label>
              <Select
                value={safeWork['bf:colorContent']?.[0]?.['@id'] || ''}
                onValueChange={handleColorContentChange}
              >
                <SelectTrigger id="color" className="mt-2">
                  <SelectValue placeholder="Select color content" />
                </SelectTrigger>
                <SelectContent>
                  {colorContent.map((color) => (
                    <SelectItem key={color.uri} value={color.uri}>
                      {color.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="supplementary" className="text-sm font-medium">
                Supplementary Content
              </Label>
              <Select
                value={safeWork['bf:supplementaryContent']?.[0]?.['@id'] || ''}
                onValueChange={handleSupplementaryContentChange}
              >
                <SelectTrigger id="supplementary" className="mt-2">
                  <SelectValue placeholder="Select supplementary content" />
                </SelectTrigger>
                <SelectContent>
                  {supplementaryContent.map((content) => (
                    <SelectItem key={content.uri} value={content.uri}>
                      {content.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="notes" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">Summary & Notes</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="summary" className="text-sm font-medium">
                Summary
              </Label>
              <Textarea
                id="summary"
                value={safeWork['bf:summary']?.[0]?.['rdfs:label'] || ''}
                onChange={(e) => handleSummaryChange(e.target.value)}
                placeholder="Enter a summary or abstract of the work"
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="toc" className="text-sm font-medium">
                Table of Contents
              </Label>
              <Textarea
                id="toc"
                value={safeWork['bf:tableOfContents']?.[0]?.['rdfs:label'] || ''}
                onChange={(e) => handleTableOfContentsChange(e.target.value)}
                placeholder="Enter table of contents"
                className="mt-2"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={safeWork['bf:note']?.[0]?.['rdfs:label'] || ''}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="Enter any additional notes"
                className="mt-2"
                rows={3}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
