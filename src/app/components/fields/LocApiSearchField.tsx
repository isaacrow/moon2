/**
 * LOC API Search Field Component
 * Unified component for searching all LOC APIs with autocomplete
 */

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Search, X, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export interface LocApiSearchResult {
  uri: string;
  label: string;
  code?: string;
  notation?: string;
  definition?: string;
  altLabel?: string[];
}

interface LocApiSearchFieldProps {
  label: string;
  value: LocApiSearchResult | null;
  onChange: (value: LocApiSearchResult | null) => void;
  searchFunction: (query: string) => Promise<LocApiSearchResult[]>;
  placeholder?: string;
  helpText?: string;
  showUri?: boolean;
  showCode?: boolean;
  required?: boolean;
  apiName?: string;
}

export function LocApiSearchField({
  label,
  value,
  onChange,
  searchFunction,
  placeholder = 'Search...',
  helpText,
  showUri = true,
  showCode = true,
  required = false,
  apiName
}: LocApiSearchFieldProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LocApiSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    // Debounce search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const data = await searchFunction(searchQuery);
        setResults(data || []);
      } catch (err) {
        console.error('LOC API Search error:', err);
        setError('Failed to search. Please try again.');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery, searchFunction]);

  const handleSelect = (result: LocApiSearchResult) => {
    onChange(result);
    setOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onChange(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {apiName && (
          <Badge variant="outline" className="ml-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              LOC API
            </div>
          </Badge>
        )}
      </Label>

      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {value ? (
                <span className="truncate">
                  {value.label}
                  {showCode && value.code && (
                    <Badge variant="secondary" className="ml-2">
                      {value.code}
                    </Badge>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={placeholder}
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {isSearching && (
                  <div className="p-4 text-sm text-center text-muted-foreground">
                    Searching LOC API...
                  </div>
                )}
                {error && (
                  <div className="p-4 text-sm text-center text-red-500">
                    {error}
                  </div>
                )}
                {!isSearching && !error && results.length === 0 && searchQuery.length >= 2 && (
                  <CommandEmpty>No results found.</CommandEmpty>
                )}
                {!isSearching && !error && results.length === 0 && searchQuery.length < 2 && (
                  <div className="p-4 text-sm text-center text-muted-foreground">
                    Type at least 2 characters to search
                  </div>
                )}
                {results.length > 0 && (
                  <CommandGroup heading={`${results.length} results from LOC API`}>
                    {results.map((result) => (
                      <CommandItem
                        key={result.uri}
                        value={result.label}
                        onSelect={() => handleSelect(result)}
                        className="flex flex-col items-start gap-1 py-3"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{result.label}</span>
                          {result.code && (
                            <Badge variant="outline" className="ml-auto">
                              {result.code}
                            </Badge>
                          )}
                        </div>
                        {result.definition && (
                          <p className="text-xs text-muted-foreground ml-6">
                            {result.definition}
                          </p>
                        )}
                        {showUri && (
                          <p className="text-xs text-blue-600 ml-6 truncate w-full">
                            {result.uri}
                          </p>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {value && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {value && (
        <div className="space-y-1 p-3 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              {value.label}
            </span>
            {value.code && (
              <Badge variant="secondary">{value.code}</Badge>
            )}
          </div>
          {value.definition && (
            <p className="text-xs text-green-700 dark:text-green-300">
              {value.definition}
            </p>
          )}
          {showUri && (
            <a
              href={value.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              {value.uri}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}
