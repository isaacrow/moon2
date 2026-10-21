/**
 * ClassificationField Component
 * 
 * Handles both LCC and DDC classification with all subfields
 */

import React from 'react';
import { OntologyProperty } from '../../services/bibframeOntologyEngine';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/button';

interface ClassificationFieldProps {
  property: OntologyProperty;
  value?: any[];
  onChange: (value: any[]) => void;
  language?: 'en' | 'ar';
}

export function ClassificationField({ property, value = [], onChange, language = 'en' }: ClassificationFieldProps) {
  const isLCC = property.label.includes('Library of Congress');
  const isDDC = property.label.includes('Dewey');

  // Ensure value is always an array of normalized classification objects
  const safeValue = React.useMemo(() => {
    if (!value) return [];
    const arr = Array.isArray(value) ? value : [value];
    return arr.map(item => {
      if (typeof item === 'string') {
        const parts = item.trim().split(' ');
        return {
          '@type': isLCC ? 'bf:ClassificationLcc' : 'bf:ClassificationDdc',
          'bf:classificationPortion': parts[0] || item,
          'bf:itemPortion': parts.slice(1).join(' ') || ''
        };
      }
      return {
        ...item,
        'bf:classificationPortion': item['bf:classificationPortion'] || item.classificationPortion || item.number || '',
        'bf:itemPortion': item['bf:itemPortion'] || item.itemPortion || ''
      };
    });
  }, [value, isLCC]);

  const addClassification = () => {
    const newClassification = isLCC 
      ? {
          '@type': 'bf:ClassificationLcc',
          'bf:classificationPortion': '',
          'bf:itemPortion': '',
          'bf:source': { '@id': '' },
          'bf:status': ''
        }
      : {
          '@type': 'bf:ClassificationDdc',
          'bf:classificationPortion': '',
          'bf:edition': ''
        };
    
    onChange([...safeValue, newClassification]);
  };

  const updateClassification = (index: number, field: string, val: string) => {
    const updated = [...safeValue];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  const removeClassification = (index: number) => {
    onChange(safeValue.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {safeValue.map((classification, index) => (
        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border space-y-3">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-blue-600">
              {isLCC ? 'LCC' : 'DDC'} #{index + 1}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeClassification(index)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isLCC ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">
                    Classification number
                    <Badge variant="outline" className="ml-2 text-xs">050 $a</Badge>
                  </Label>
                  <Input
                    value={classification['bf:classificationPortion'] || classification.classificationPortion || classification.number || ''}
                    onChange={(e) => updateClassification(index, 'bf:classificationPortion', e.target.value)}
                    placeholder="e.g., TT820"
                    className="mt-1 font-mono"
                  />
                  <div className="text-xs text-gray-500 mt-1">Main LCC class number</div>
                </div>

                <div>
                  <Label className="text-sm">
                    Cutter / item number
                    <Badge variant="outline" className="ml-2 text-xs">050 $b</Badge>
                  </Label>
                  <Input
                    value={classification['bf:itemPortion'] || ''}
                    onChange={(e) => updateClassification(index, 'bf:itemPortion', e.target.value)}
                    placeholder="e.g., .B877 2002"
                    className="mt-1 font-mono"
                  />
                  <div className="text-xs text-gray-500 mt-1">Cutter number and date</div>
                </div>
              </div>

              <div>
                <Label className="text-sm">Classification assigner</Label>
                <Input
                  value={classification['bf:source']?.['@id'] || ''}
                  onChange={(e) => updateClassification(index, 'bf:source', { '@id': e.target.value })}
                  placeholder="Search organizations... (id.loc.gov/vocabulary/organizations)"
                  className="mt-1"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Organization that assigned the classification
                </div>
              </div>

              <div>
                <Label className="text-sm">Classification status</Label>
                <select
                  value={classification['bf:status'] || ''}
                  onChange={(e) => updateClassification(index, 'bf:status', e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="">Select status...</option>
                  <option value="used">Used by assigning agency</option>
                  <option value="assigned">Assigned by LC</option>
                  <option value="obsolete">Obsolete</option>
                  <option value="canceled">Canceled/invalid</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">
                    Dewey number
                    <Badge variant="outline" className="ml-2 text-xs">082 $a</Badge>
                  </Label>
                  <Input
                    value={classification['bf:classificationPortion'] || classification.classificationPortion || classification.number || ''}
                    onChange={(e) => updateClassification(index, 'bf:classificationPortion', e.target.value)}
                    placeholder="e.g., 746.43/2041"
                    className="mt-1 font-mono"
                  />
                  <div className="text-xs text-gray-500 mt-1">DDC classification number</div>
                </div>

                <div>
                  <Label className="text-sm">
                    Edition
                    <Badge variant="outline" className="ml-2 text-xs">082 $2</Badge>
                  </Label>
                  <Input
                    value={classification['bf:edition'] || ''}
                    onChange={(e) => updateClassification(index, 'bf:edition', e.target.value)}
                    placeholder="e.g., 21, 22, 23"
                    className="mt-1"
                  />
                  <div className="text-xs text-gray-500 mt-1">DDC edition number</div>
                </div>
              </div>
            </>
          )}
        </div>
      ))}

      <Button
        onClick={addClassification}
        variant="outline"
        size="sm"
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add {isLCC ? 'LCC' : 'DDC'} Classification
      </Button>
    </div>
  );
}
