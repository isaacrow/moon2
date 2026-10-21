import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X, Search, Loader2, ExternalLink, Globe, Building, Users, MapPin, Database } from 'lucide-react';
import { AuthorityLookupResult } from '../types/bibframe';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface MultiSourceAuthorityFieldProps {
  label: string;
  placeholder?: string;
  onSelect: (value: AuthorityLookupResult) => void;
  onRemove?: (value: AuthorityLookupResult) => void;
  selectedValues?: AuthorityLookupResult[];
  multiple?: boolean;
  required?: boolean;
  sources?: string[];
}

const AUTHORITY_SOURCES = [
  { value: 'naf-personal', label: 'NAF Personal Names', icon: Users, color: 'text-blue-600' },
  { value: 'naf-corporate', label: 'NAF Corporate Names', icon: Building, color: 'text-purple-600' },
  { value: 'naf-conference', label: 'NAF Conference Names', icon: Users, color: 'text-green-600' },
  { value: 'naf-geographic', label: 'NAF Geographic', icon: MapPin, color: 'text-orange-600' },
  { value: 'viaf', label: 'VIAF (Virtual International Authority)', icon: Globe, color: 'text-indigo-600' },
  { value: 'wikidata', label: 'Wikidata', icon: Globe, color: 'text-red-600' },
  { value: 'geonames', label: 'GeoNames', icon: MapPin, color: 'text-teal-600' },
  { value: 'afiqa', label: 'Afiqa', icon: Database, color: 'text-emerald-600' },
];

export function MultiSourceAuthorityField({
  label,
  placeholder,
  onSelect,
  onRemove,
  selectedValues = [],
  multiple = false,
  required = false,
  sources,
}: MultiSourceAuthorityFieldProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AuthorityLookupResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState('naf-personal');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const availableSources = sources 
    ? AUTHORITY_SOURCES.filter(s => sources.includes(s.value))
    : AUTHORITY_SOURCES;

  const currentSource = AUTHORITY_SOURCES.find(s => s.value === selectedSource);
  const SourceIcon = currentSource?.icon || Database;

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/search-authority?q=${encodeURIComponent(searchQuery)}&source=${selectedSource}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen((data.results || []).length > 0);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Authority search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (result: AuthorityLookupResult) => {
    onSelect(result);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < results.length) {
          handleSelect(results[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {multiple && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedValues.map((value, index) => (
            <Badge key={index} variant="secondary" className="pr-1">
              <span className="mr-1 text-xs truncate max-w-[200px]" title={value.label}>
                {value.label}
              </span>
              <span className="text-[10px] opacity-60 mr-1">({value.source})</span>
              {onRemove && (
                <button
                  onClick={() => onRemove(value)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  aria-label="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Select value={selectedSource} onValueChange={setSelectedSource}>
          <SelectTrigger className="w-[280px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            <div className="flex items-center gap-2">
              <SourceIcon className={`h-4 w-4 ${currentSource?.color}`} />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700 max-h-96">
            {availableSources.map((source) => {
              const Icon = source.icon;
              return (
                <SelectItem 
                  key={source.value} 
                  value={source.value}
                  className="dark:text-white dark:hover:bg-gray-700 cursor-pointer py-3 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${source.color}`} />
                    <span className="font-medium">{source.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <div className="relative">
            <Input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || `Search ${label}...`}
              className="pr-8 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <Search className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {isOpen && results.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-[32rem] overflow-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-all duration-200 ${
                    index === focusedIndex ? 'bg-blue-50 dark:bg-blue-900/30 shadow-md' : ''
                  }`}
                >
                  <button
                    onClick={() => handleSelect(result)}
                    className="w-full text-left px-5 py-5 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:shadow-lg transition-all duration-200 group relative"
                    title={`${result.label}${result.description ? ' - ' + result.description : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors break-words">
                          {result.label}
                        </div>
                        {result.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 break-words">
                            {result.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                          <a
                            href={result.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline break-all"
                            title={result.uri}
                          >
                            {result.uri}
                          </a>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end flex-shrink-0">
                        {result.type && (
                          <Badge variant="outline" className="text-xs font-semibold dark:border-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {result.type}
                          </Badge>
                        )}
                        {result.source && (
                          <Badge 
                            variant="default" 
                            className={`text-xs font-bold whitespace-nowrap ${
                              result.source === 'VIAF' ? 'bg-indigo-600' :
                              result.source === 'Wikidata' ? 'bg-red-600' :
                              result.source === 'LOC' ? 'bg-blue-600' :
                              result.source === 'Afiqa' ? 'bg-emerald-600' :
                              'bg-gray-600'
                            } hover:opacity-90`}
                          >
                            {result.source}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}