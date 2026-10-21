/**
 * BIBFRAME Vocabulary Select Component
 * Select field for controlled vocabularies with URI display
 */

import React, { useState, useEffect } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { controlledVocabularyService } from '../../services/controlledVocabularyService';
import { bibframeApiService } from '../../services/bibframeApiService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Badge } from '../ui/badge';

interface VocabularyTerm {
  id: string;
  uri: string;
  label: string;
  code?: string;
  definition?: string;
}

interface BibframeVocabularySelectProps {
  label: string;
  propertyUri?: string;
  vocabularyType: 
    | 'carriers'
    | 'mediaTypes'
    | 'contentTypes'
    | 'issuance'
    | 'countries'
    | 'languages'
    | 'relators'
    | 'mcolor'
    | 'msoundcontent'
    | 'maudience'
    | 'mfont'
    | 'millus'
    | 'msupplcont'
    | 'mstatus'
    | 'menclvl'
    | 'descriptionConventions'
    | 'marcauthen';
  value?: string; // URI value
  onChange: (value: string, term: VocabularyTerm) => void;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  disabled?: boolean;
  showUri?: boolean;
  className?: string;
}

export function BibframeVocabularySelect({
  label,
  propertyUri,
  vocabularyType,
  value,
  onChange,
  placeholder = 'Select...',
  required = false,
  helpText,
  disabled = false,
  showUri = true,
  className = '',
}: BibframeVocabularySelectProps) {
  const [terms, setTerms] = useState<VocabularyTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState<VocabularyTerm | null>(null);

  // Load vocabulary terms
  useEffect(() => {
    loadTerms();
  }, [vocabularyType]);

  // Update selected term when value changes
  useEffect(() => {
    if (value && terms.length > 0) {
      const term = terms.find(t => t.uri === value);
      setSelectedTerm(term || null);
    } else {
      setSelectedTerm(null);
    }
  }, [value, terms]);

  const loadTerms = async () => {
    setLoading(true);
    try {
      const result = await controlledVocabularyService.searchVocabulary(vocabularyType, '', 500);
      setTerms(result.terms);
    } catch (error) {
      console.error('Error loading vocabulary:', error);
      setTerms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (uri: string) => {
    const term = terms.find(t => t.uri === uri);
    if (term) {
      onChange(uri, term);
      setSelectedTerm(term);
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

      {/* Select Input */}
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled || loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={loading ? 'Loading...' : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {terms.map((term) => (
            <SelectItem key={term.uri} value={term.uri}>
              <div className="flex flex-col gap-1">
                <div className="font-medium">
                  {term.label}
                  {term.code && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {term.code}
                    </Badge>
                  )}
                </div>
                {showUri && (
                  <div className="text-xs text-muted-foreground font-mono">
                    {term.uri}
                  </div>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selected Value Display with URI */}
      {selectedTerm && showUri && (
        <div className="p-2 bg-muted rounded border text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Selected:</span>
            <a
              href={selectedTerm.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono"
            >
              {selectedTerm.uri}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          {selectedTerm.definition && (
            <p className="text-muted-foreground mt-1">{selectedTerm.definition}</p>
          )}
        </div>
      )}

      {/* Help Text */}
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}
