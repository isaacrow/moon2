import React from 'react';
import { useTranslation } from 'react-i18next';
import { BIBFRAMEInstance, AuthorityLookupResult } from '../types/bibframe';
import { AutocompleteField } from './AutocompleteField';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { carrierTypes, mediaTypes, issuanceModes, searchPublishers, searchPlaces } from '../services/mockAuthorityService';
import { Button } from './ui/button';
import { Plus, X } from 'lucide-react';

interface InstanceFormProps {
  instance: Partial<BIBFRAMEInstance>;
  onChange: (instance: Partial<BIBFRAMEInstance>) => void;
}

export function InstanceForm({ instance, onChange }: InstanceFormProps) {
  const { t } = useTranslation();
  
  // Safety check: ensure instance is never undefined
  const safeInstance = instance || {};
  
  const updateInstance = (updates: Partial<BIBFRAMEInstance>) => {
    onChange({ ...safeInstance, ...updates });
  };

  const handleTitleChange = (value: string) => {
    updateInstance({
      'bf:title': {
        '@type': 'bf:Title',
        'bf:mainTitle': value,
      },
    });
  };

  const handleResponsibilityChange = (value: string) => {
    updateInstance({ 'bf:responsibilityStatement': value });
  };

  const handleEditionChange = (value: string) => {
    updateInstance({ 'bf:editionStatement': value });
  };

  const handleProvisionActivityChange = (field: string, value: string | AuthorityLookupResult) => {
    const existing = safeInstance['bf:provisionActivity']?.[0] || {
      '@type': 'bf:Publication' as const,
    };
    
    if (field === 'place') {
      if (typeof value === 'string') {
        existing['bf:place'] = {
          '@type': 'bf:Place',
          'rdfs:label': value,
        };
      } else {
        existing['bf:place'] = {
          '@type': 'bf:Place',
          '@id': value.uri,
          'rdfs:label': value.label,
        };
      }
    } else if (field === 'publisher') {
      if (typeof value === 'string') {
        existing['bf:agent'] = {
          '@type': 'bf:Agent',
          'rdfs:label': value,
        };
      } else {
        existing['bf:agent'] = {
          '@type': 'bf:Agent',
          '@id': value.uri,
          'rdfs:label': value.label,
        };
      }
    } else if (field === 'date' && typeof value === 'string') {
      existing['bf:date'] = value;
    }

    updateInstance({ 'bf:provisionActivity': [existing] });
  };

  const handlePlaceAdd = (place: AuthorityLookupResult) => {
    handleProvisionActivityChange('place', place);
  };

  const handlePublisherAdd = (publisher: AuthorityLookupResult) => {
    handleProvisionActivityChange('publisher', publisher);
  };

  const handleIssuanceChange = (uri: string) => {
    const mode = issuanceModes.find(m => m.uri === uri);
    if (mode) {
      updateInstance({
        'bf:issuance': {
          '@type': 'bf:Issuance',
          '@id': uri,
          'rdfs:label': mode.label,
        },
      });
    }
  };

  const handleIdentifierAdd = (type: 'bf:Lccn' | 'bf:Isbn') => {
    const existing = safeInstance['bf:identifiedBy'] || [];
    updateInstance({
      'bf:identifiedBy': [
        ...existing,
        {
          '@type': type,
          'rdf:value': '',
        },
      ],
    });
  };

  const handleIdentifierChange = (index: number, value: string) => {
    const identifiers = [...(safeInstance['bf:identifiedBy'] || [])];
    identifiers[index] = { ...identifiers[index], 'rdf:value': value };
    updateInstance({ 'bf:identifiedBy': identifiers });
  };

  const handleIdentifierRemove = (index: number) => {
    const identifiers = safeInstance['bf:identifiedBy']?.filter((_, i) => i !== index);
    updateInstance({ 'bf:identifiedBy': identifiers });
  };

  const handleCarrierChange = (uri: string) => {
    const carrier = carrierTypes.find(c => c.uri === uri);
    if (carrier) {
      updateInstance({
        'bf:carrier': [
          {
            '@type': 'bf:Carrier',
            '@id': uri,
            'rdfs:label': carrier.label,
          },
        ],
      });
    }
  };

  const handleMediaChange = (uri: string) => {
    const media = mediaTypes.find(m => m.uri === uri);
    if (media) {
      updateInstance({
        'bf:media': [
          {
            '@type': 'bf:Media',
            '@id': uri,
            'rdfs:label': media.label,
          },
        ],
      });
    }
  };

  const handleExtentChange = (value: string) => {
    if (value) {
      updateInstance({
        'bf:extent': {
          '@type': 'bf:Extent',
          'rdfs:label': value,
        },
      });
    } else {
      updateInstance({ 'bf:extent': undefined });
    }
  };

  const handleDimensionsChange = (value: string) => {
    updateInstance({ 'bf:dimensions': value });
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">{t('instance')}</h2>
        <p className="text-sm text-gray-500">{t('instanceDescription')}</p>
      </div>

      <Accordion type="multiple" defaultValue={['title', 'publication', 'identifiers']} className="space-y-2">
        <AccordionItem value="title" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">{t('title')}</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="instance-title" className="text-sm font-medium">
                {t('instanceTitle')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="instance-title"
                value={safeInstance['bf:title']?.['bf:mainTitle'] || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={t('instanceTitle')}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="responsibility" className="text-sm font-medium">
                {t('responsibilityStatement')}
              </Label>
              <Input
                id="responsibility"
                value={safeInstance['bf:responsibilityStatement'] || ''}
                onChange={(e) => handleResponsibilityChange(e.target.value)}
                placeholder={t('responsibilityStatement')}
                className="mt-2"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="edition" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">Edition</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="edition" className="text-sm font-medium">
                Edition Statement
              </Label>
              <Input
                id="edition"
                value={safeInstance['bf:editionStatement'] || ''}
                onChange={(e) => handleEditionChange(e.target.value)}
                placeholder="e.g., First edition, Revised edition"
                className="mt-2"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="publication" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">Publication Information</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <AutocompleteField
              label="Place of Publication"
              placeholder="Search places..."
              searchFunction={searchPlaces}
              onSelect={handlePlaceAdd}
              selectedValues={
                safeInstance['bf:provisionActivity']?.[0]?.['bf:place']
                  ? [{
                      uri: safeInstance['bf:provisionActivity'][0]['bf:place']['@id'] || '',
                      label: safeInstance['bf:provisionActivity'][0]['bf:place']['rdfs:label'] || '',
                      type: 'bf:Place',
                      source: 'LCNAF',
                    }]
                  : []
              }
              multiple={false}
            />

            <AutocompleteField
              label="Publisher"
              placeholder="Search publishers..."
              searchFunction={searchPublishers}
              onSelect={handlePublisherAdd}
              selectedValues={
                safeInstance['bf:provisionActivity']?.[0]?.['bf:agent']
                  ? [{
                      uri: safeInstance['bf:provisionActivity'][0]['bf:agent']['@id'] || '',
                      label: safeInstance['bf:provisionActivity'][0]['bf:agent']['rdfs:label'] || '',
                      type: 'bf:Organization',
                      source: 'LCNAF',
                    }]
                  : []
              }
              multiple={false}
            />

            <div>
              <Label htmlFor="pub-date" className="text-sm font-medium">
                Publication Date
              </Label>
              <Input
                id="pub-date"
                value={safeInstance['bf:provisionActivity']?.[0]?.['bf:date'] || ''}
                onChange={(e) => handleProvisionActivityChange('date', e.target.value)}
                placeholder="e.g., 2024"
                className="mt-2"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="issuance" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">Mode of Issuance</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="issuance" className="text-sm font-medium">
                Mode of Issuance
              </Label>
              <Select
                value={safeInstance['bf:issuance']?.['@id'] || ''}
                onValueChange={handleIssuanceChange}
              >
                <SelectTrigger id="issuance" className="mt-2">
                  <SelectValue placeholder="Select mode of issuance" />
                </SelectTrigger>
                <SelectContent>
                  {issuanceModes.map((mode) => (
                    <SelectItem key={mode.uri} value={mode.uri}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="identifiers" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">Identifiers</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {safeInstance['bf:identifiedBy']?.map((identifier, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Label className="text-sm font-medium">
                    {identifier['@type'] === 'bf:Lccn' ? 'LCCN' : 'ISBN'}
                  </Label>
                  <Input
                    value={identifier['rdf:value']}
                    onChange={(e) => handleIdentifierChange(index, e.target.value)}
                    placeholder={`Enter ${identifier['@type'] === 'bf:Lccn' ? 'LCCN' : 'ISBN'}`}
                    className="mt-2"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleIdentifierRemove(index)}
                  className="mt-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleIdentifierAdd('bf:Lccn')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add LCCN
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleIdentifierAdd('bf:Isbn')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add ISBN
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="carrier" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">Carrier & Media</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="carrier" className="text-sm font-medium">
                Carrier Type
              </Label>
              <Select
                value={safeInstance['bf:carrier']?.[0]?.['@id'] || ''}
                onValueChange={handleCarrierChange}
              >
                <SelectTrigger id="carrier" className="mt-2">
                  <SelectValue placeholder="Select carrier type" />
                </SelectTrigger>
                <SelectContent>
                  {carrierTypes.map((type) => (
                    <SelectItem key={type.uri} value={type.uri}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="media" className="text-sm font-medium">
                Media Type
              </Label>
              <Select
                value={safeInstance['bf:media']?.[0]?.['@id'] || ''}
                onValueChange={handleMediaChange}
              >
                <SelectTrigger id="media" className="mt-2">
                  <SelectValue placeholder="Select media type" />
                </SelectTrigger>
                <SelectContent>
                  {mediaTypes.map((type) => (
                    <SelectItem key={type.uri} value={type.uri}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="physical" className="border dark:border-gray-700 rounded-lg px-4 dark:bg-gray-800">
          <AccordionTrigger className="hover:no-underline">
            <span className="font-semibold text-sm dark:text-white">Physical Description</span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="extent" className="text-sm font-medium">
                Extent
              </Label>
              <Input
                id="extent"
                value={safeInstance['bf:extent']?.['rdfs:label'] || ''}
                onChange={(e) => handleExtentChange(e.target.value)}
                placeholder="e.g., 1 volume (xxiv, 345 pages)"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="dimensions" className="text-sm font-medium">
                Dimensions
              </Label>
              <Input
                id="dimensions"
                value={safeInstance['bf:dimensions'] || ''}
                onChange={(e) => handleDimensionsChange(e.target.value)}
                placeholder="e.g., 24 cm"
                className="mt-2"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
