import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { X, Search, Loader2, ExternalLink } from 'lucide-react';
import { AuthorityLookupResult } from '../types/bibframe';

interface AutocompleteFieldProps {
  label: string;
  placeholder?: string;
  searchFunction: (query: string) => Promise<AuthorityLookupResult[]>;
  onSelect: (value: AuthorityLookupResult) => void;
  onRemove?: (value: AuthorityLookupResult) => void;
  selectedValues?: AuthorityLookupResult[];
  multiple?: boolean;
  required?: boolean;
}

export function AutocompleteField({
  label,
  placeholder,
  searchFunction,
  onSelect,
  onRemove,
  selectedValues = [],
  multiple = false,
  required = false,
}: AutocompleteFieldProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AuthorityLookupResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      setQuery(searchQuery);
      if (searchQuery.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchFunction(searchQuery);
        setResults(data);
        setIsOpen(data.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchFunction]
  );

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || `Search ${label}...`}
            className="pr-8"
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
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {results.map((result, index) => (
              <div
                key={index}
                className={`border-b border-gray-100 last:border-b-0 ${
                  index === focusedIndex ? 'bg-gray-100' : ''
                }`}
              >
                <button
                  onClick={() => handleSelect(result)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  <div className="text-sm font-medium flex items-center justify-between">
                    <span>{result.label}</span>
                    {result.source && (
                      <Badge variant="outline" className="text-xs">
                        {result.source}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate flex items-center gap-1 mt-1">
                    <ExternalLink className="h-3 w-3" />
                    <a
                      href={result.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {result.uri}
                    </a>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
