import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Search, Filter, X, Plus, Calendar, User, Tag } from 'lucide-react';
import { Checkbox } from './ui/checkbox';

interface SearchCriteria {
  field: string;
  operator: string;
  value: string;
}

interface AdvancedSearchProps {
  onSearch: (criteria: SearchCriteria[]) => void;
  onClose?: () => void;
}

const SEARCH_FIELDS = [
  { value: 'title', label: 'Title' },
  { value: 'creator', label: 'Creator' },
  { value: 'subject', label: 'Subject' },
  { value: 'isbn', label: 'ISBN' },
  { value: 'lccn', label: 'LCCN' },
  { value: 'publisher', label: 'Publisher' },
  { value: 'date', label: 'Publication Date' },
  { value: 'language', label: 'Language' },
  { value: 'format', label: 'Format' },
  { value: 'classification', label: 'Classification' },
];

const OPERATORS = [
  { value: 'contains', label: 'contains' },
  { value: 'exact', label: 'is (exact)' },
  { value: 'startsWith', label: 'starts with' },
  { value: 'endsWith', label: 'ends with' },
  { value: 'gt', label: 'greater than' },
  { value: 'lt', label: 'less than' },
];

const FACETS = [
  { name: 'Resource Type', options: ['Text', 'Cartographic', 'Notated Music', 'Moving Image', 'Audio'] },
  { name: 'Language', options: ['English', 'Spanish', 'French', 'German', 'Arabic', 'Chinese'] },
  { name: 'Format', options: ['Print', 'Electronic', 'Microform', 'Audio CD', 'DVD'] },
  { name: 'Date Range', options: ['Last year', 'Last 5 years', 'Last 10 years', '20th century', 'Before 1900'] },
];

export function AdvancedSearch({ onSearch, onClose }: AdvancedSearchProps) {
  const { t } = useTranslation();
  const [criteria, setCriteria] = useState<SearchCriteria[]>([
    { field: 'title', operator: 'contains', value: '' }
  ]);
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({});

  const addCriteria = () => {
    setCriteria([...criteria, { field: 'title', operator: 'contains', value: '' }]);
  };

  const removeCriteria = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const updateCriteria = (index: number, field: keyof SearchCriteria, value: string) => {
    const newCriteria = [...criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setCriteria(newCriteria);
  };

  const toggleFacet = (facetName: string, option: string) => {
    setSelectedFacets(prev => {
      const current = prev[facetName] || [];
      const updated = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option];
      return { ...prev, [facetName]: updated };
    });
  };

  const handleSearch = () => {
    onSearch(criteria.filter(c => c.value.trim()));
  };

  const clearAll = () => {
    setCriteria([{ field: 'title', operator: 'contains', value: '' }]);
    setSelectedFacets({});
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Advanced Search
            </h1>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Search Criteria */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Search Criteria</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={addCriteria}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Row
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {criteria.map((criterion, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <Select
                      value={criterion.field}
                      onValueChange={(value) => updateCriteria(index, 'field', value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEARCH_FIELDS.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={criterion.operator}
                      onValueChange={(value) => updateCriteria(index, 'operator', value)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      value={criterion.value}
                      onChange={(e) => updateCriteria(index, 'value', e.target.value)}
                      placeholder="Enter search term..."
                      className="flex-1"
                    />

                    {criteria.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <div className="pt-4 flex gap-2">
                  <Button onClick={handleSearch} className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Search Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>• Use multiple rows to combine search criteria</p>
                <p>• Wildcard character * matches any sequence of characters</p>
                <p>• Use quotation marks for exact phrase matching</p>
                <p>• Select facets on the right to refine your results</p>
              </CardContent>
            </Card>
          </div>

          {/* Facets */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Refine Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {FACETS.map((facet) => (
                  <div key={facet.name}>
                    <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">
                      {facet.name}
                    </h3>
                    <div className="space-y-2">
                      {facet.options.map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedFacets[facet.name]?.includes(option) || false}
                            onCheckedChange={() => toggleFacet(facet.name, option)}
                          />
                          <label className="text-sm cursor-pointer flex-1">
                            {option}
                          </label>
                          <Badge variant="secondary" className="text-xs">
                            {Math.floor(Math.random() * 100)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Filters */}
            {Object.keys(selectedFacets).some(key => selectedFacets[key].length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedFacets).map(([facet, options]) =>
                      options.map((option) => (
                        <Badge
                          key={`${facet}-${option}`}
                          variant="secondary"
                          className="pr-1"
                        >
                          {option}
                          <button
                            onClick={() => toggleFacet(facet, option)}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
