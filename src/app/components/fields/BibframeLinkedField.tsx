/**
 * BIBFRAME Linked Field Component
 * Auto-complete field with full LOC API integration showing URIs and labels
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ExternalLink, Check, X, Loader2, Info } from 'lucide-react';
import { bibframeApiService, BibframeEntity } from '../../services/bibframeApiService';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface BibframeLinkedFieldProps {
  label: string;
  propertyUri?: string;
  searchType: 'person' | 'organization' | 'meeting' | 'geographic' | 'topic' | 'genreForm' | 'all';
  value?: BibframeEntity | null;
  onChange: (value: BibframeEntity | null) => void;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  disabled?: boolean;
  className?: string;
}

export function BibframeLinkedField({
  label,
  propertyUri,
  searchType,
  value,
  onChange,
  placeholder = 'Search...',
  required = false,
  helpText,
  disabled = false,
  className = '',
}: BibframeLinkedFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibframeEntity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      let results;
      
      switch (searchType) {
        case 'person':
        case 'organization':
        case 'meeting':
          results = await bibframeApiService.searchNames(query, searchType);
          break;
        case 'topic':
          results = await bibframeApiService.searchSubjects(query);
          break;
        case 'genreForm':
          results = await bibframeApiService.searchGenreForms(query);
          break;
        case 'geographic':
          results = await bibframeApiService.searchGeographic(query);
          break;
        case 'all':
        default:
          results = await bibframeApiService.searchAllVocabularies({ query, type: 'all' });
      }

      setSearchResults(results.results);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchType]);

  // Handle search input change
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          selectEntity(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Select an entity
  const selectEntity = (entity: BibframeEntity) => {
    onChange(entity);
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
  };

  // Clear selection
  const clearSelection = () => {
    onChange(null);
    setSearchQuery('');
    setSearchResults([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Get property info
  const propertyInfo = propertyUri 
    ? bibframeApiService.getBibframePropertyInfo(propertyUri)
    : null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Property Info */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {propertyInfo && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-1">
                  <p className="font-medium">{propertyInfo.label}</p>
                  <p className="text-xs text-muted-foreground">{propertyInfo.definition}</p>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {propertyInfo.uri}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Selected Value Display */}
      {value ? (
        <div className="flex items-start gap-2 p-3 bg-muted rounded-lg border">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="font-medium truncate">{value.label}</span>
            </div>
            
            {value.uri && (
              <a
                href={value.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono break-all"
              >
                {value.uri}
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            )}
            
            {value.type && value.type.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {value.type.map((type, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            )}
            
            {value.source && (
              <p className="text-xs text-muted-foreground mt-1">
                Source: {value.source}
              </p>
            )}
          </div>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            disabled={disabled}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        /* Search Input */
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                disabled={disabled}
                className="pl-10 pr-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-[var(--radix-popover-trigger-width)] p-0 max-h-80 overflow-y-auto"
            align="start"
          >
            {searchResults.length > 0 ? (
              <div className="py-1">
                {searchResults.map((result, index) => (
                  <button
                    key={result.uri}
                    type="button"
                    onClick={() => selectEntity(result)}
                    className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors ${
                      index === selectedIndex ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="font-medium text-sm">{result.label}</div>
                    {result.uri && (
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        {result.uri}
                      </div>
                    )}
                    {result.type && result.type.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {result.type.slice(0, 2).map((type, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : searchQuery.trim().length >= 2 && !isSearching ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            ) : searchQuery.trim().length < 2 ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            ) : null}
          </PopoverContent>
        </Popover>
      )}

      {/* Help Text */}
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}
