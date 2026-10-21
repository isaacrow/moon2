/**
 * Subject Search Field Component
 * Auto-complete field for LOC Subject Headings (LCSH)
 * Supports topical, geographic, temporal, and name subjects
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, ExternalLink, X, Tag } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  searchSubjects,
  searchGeographicNames,
  searchPersonalNames,
  SearchResult,
} from '../../services/bibframeSearchService';

interface SubjectSearchFieldProps {
  label: string;
  value?: SearchResult[];
  onChange: (subjects: SearchResult[]) => void;
  subjectType?: 'topic' | 'geographic' | 'temporal' | 'name' | 'all';
  placeholder?: string;
  helpText?: string;
}

export function SubjectSearchField({
  label,
  value = [],
  onChange,
  subjectType = 'topic',
  placeholder = 'Search Library of Congress Subject Headings...',
  helpText,
}: SubjectSearchFieldProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<SearchResult[]>(value);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle search with debounce
  useEffect(() => {
    if (query.trim().length < 2) {
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
        let response;
        
        switch (subjectType) {
          case 'geographic':
            response = await searchGeographicNames(query);
            break;
          case 'name':
            response = await searchPersonalNames(query);
            break;
          case 'topic':
          case 'all':
          default:
            response = await searchSubjects(query);
            break;
        }

        setResults(response.results);
        setShowResults(true);
      } catch (error) {
        console.error('Subject search error:', error);
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
  }, [query, subjectType]);

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

  // Add subject
  const handleSelectSubject = (subject: SearchResult) => {
    // Check if already selected
    if (selectedSubjects.some(s => s.uri === subject.uri)) {
      return;
    }

    const newSubjects = [...selectedSubjects, subject];
    setSelectedSubjects(newSubjects);
    onChange(newSubjects);
    setQuery('');
    setShowResults(false);
  };

  // Remove subject
  const handleRemoveSubject = (uri: string) => {
    const newSubjects = selectedSubjects.filter(s => s.uri !== uri);
    setSelectedSubjects(newSubjects);
    onChange(newSubjects);
  };

  // Get subject type label
  const getSubjectTypeLabel = () => {
    switch (subjectType) {
      case 'topic':
        return 'LCSH Topic';
      case 'geographic':
        return 'Geographic';
      case 'temporal':
        return 'Temporal';
      case 'name':
        return 'Name';
      default:
        return 'Subject';
    }
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" />
          {label}
        </label>
        <Badge variant="outline" className="text-xs">
          {getSubjectTypeLabel()}
        </Badge>
      </div>

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}

      {/* Selected subjects */}
      {selectedSubjects.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md">
          {selectedSubjects.map((subject) => (
            <div
              key={subject.uri}
              className="group relative flex items-center gap-2 bg-background border rounded-md px-3 py-1.5"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{subject.label}</span>
                <a
                  href={subject.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {subject.uri.split('/').slice(-1)[0]}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveSubject(subject.uri)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setShowResults(true);
            }}
            placeholder={placeholder}
            className="pl-10"
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
                {results.length} results from id.loc.gov
              </div>
              {results.map((result, index) => (
                <button
                  key={`${result.uri}-${index}`}
                  type="button"
                  onClick={() => handleSelectSubject(result)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {result.label}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs text-muted-foreground bg-muted px-1 rounded">
                          {result.uri.split('/').slice(-1)[0]}
                        </code>
                        {result.source && (
                          <Badge variant="outline" className="text-xs">
                            {result.source}
                          </Badge>
                        )}
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
        {showResults && results.length === 0 && query.trim().length >= 2 && !isSearching && (
          <Card className="absolute z-50 w-full mt-2 shadow-lg">
            <div className="p-4 text-center text-sm text-muted-foreground">
              No subject headings found for "{query}"
            </div>
          </Card>
        )}
      </div>

      {/* API info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary" className="text-xs">
          LOC API
        </Badge>
        <span>
          {subjectType === 'geographic' && 'id.loc.gov/authorities/names (Geographic)'}
          {subjectType === 'name' && 'id.loc.gov/authorities/names (Personal)'}
          {(subjectType === 'topic' || subjectType === 'all') && 'id.loc.gov/authorities/subjects'}
        </span>
      </div>
    </div>
  );
}
