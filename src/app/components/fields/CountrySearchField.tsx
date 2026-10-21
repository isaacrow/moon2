/**
 * Country Search Field Component
 * Auto-complete field for LOC Countries vocabulary
 * Used for publication place and geographic coverage
 */

import React, { useState, useEffect, useRef } from 'react';
import { Globe, ExternalLink, X, MapPin } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { searchCountries, SearchResult } from '../../services/bibframeSearchService';

interface CountrySearchFieldProps {
  label: string;
  value?: SearchResult | null;
  onChange: (country: SearchResult | null) => void;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  marcMapping?: string;
}

export function CountrySearchField({
  label,
  value = null,
  onChange,
  placeholder = 'Search countries...',
  helpText,
  required = false,
  marcMapping,
}: CountrySearchFieldProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<SearchResult | null>(value);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle search with debounce
  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await searchCountries(query);
        setResults(response.results);
        setShowResults(true);
      } catch (error) {
        console.error('Country search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Select country
  const handleSelectCountry = (country: SearchResult) => {
    setSelectedCountry(country);
    onChange(country);
    setQuery('');
    setShowResults(false);
  };

  // Clear selection
  const handleClear = () => {
    setSelectedCountry(null);
    onChange(null);
    setQuery('');
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-2">
          {marcMapping && (
            <Badge variant="outline" className="text-xs">
              {marcMapping}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            LOC Countries
          </Badge>
        </div>
      </div>

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}

      {/* Selected country */}
      {selectedCountry && (
        <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-sm">{selectedCountry.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedCountry.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  {selectedCountry.uri}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="mt-1">
                <code className="text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded border">
                  {selectedCountry.uri.split('/').slice(-1)[0]}
                </code>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Search input */}
      {!selectedCountry && (
        <div ref={containerRef} className="relative">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setShowResults(true);
              }}
              placeholder={placeholder}
              className="pl-10"
              required={required}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Results dropdown */}
          {showResults && results.length > 0 && (
            <Card className="absolute z-50 w-full mt-2 max-h-80 overflow-auto shadow-lg">
              <div className="p-2">
                <div className="text-xs text-muted-foreground px-2 py-1 mb-1">
                  {results.length} countries found
                </div>
                {results.map((result, index) => (
                  <button
                    key={`${result.uri}-${index}`}
                    type="button"
                    onClick={() => handleSelectCountry(result)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          {result.label}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs text-muted-foreground bg-muted px-1 rounded">
                            {result.uri.split('/').slice(-1)[0]}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            id.loc.gov
                          </Badge>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* No results */}
          {showResults && results.length === 0 && query.trim().length >= 1 && !isSearching && (
            <Card className="absolute z-50 w-full mt-2 shadow-lg">
              <div className="p-4 text-center text-sm text-muted-foreground">
                No countries found for "{query}"
              </div>
            </Card>
          )}
        </div>
      )}

      {/* API info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary" className="text-xs">
          LOC API
        </Badge>
        <span>https://id.loc.gov/vocabulary/countries/</span>
      </div>
    </div>
  );
}
