/**
 * LOC Vocabulary Select Component
 * Select dropdown for LOC controlled vocabularies (no search needed)
 */

import React from 'react';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { ExternalLink } from 'lucide-react';

export interface VocabularyTerm {
  uri: string;
  label: string;
  code?: string;
  notation?: string;
  definition?: string;
}

interface LocVocabularySelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: VocabularyTerm[];
  placeholder?: string;
  helpText?: string;
  showUri?: boolean;
  showCode?: boolean;
  required?: boolean;
  apiName?: string;
}

export function LocVocabularySelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  helpText,
  showUri = false,
  showCode = true,
  required = false,
  apiName
}: LocVocabularySelectProps) {
  const selectedOption = options.find(opt => opt.uri === value || opt.code === value);

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {apiName && (
          <Badge variant="outline" className="ml-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-green-500 rounded-full" />
              {apiName}
            </div>
          </Badge>
        )}
      </Label>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder}>
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.label}
                {showCode && selectedOption.code && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedOption.code}
                  </Badge>
                )}
              </span>
            ) : (
              placeholder
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.uri} value={option.uri}>
              <div className="flex items-center justify-between w-full gap-2">
                <span>{option.label}</span>
                {showCode && option.code && (
                  <Badge variant="outline" className="text-xs">
                    {option.code}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedOption && showUri && (
        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
          <a
            href={selectedOption.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            {selectedOption.uri}
            <ExternalLink className="h-3 w-3" />
          </a>
          {selectedOption.definition && (
            <p className="text-xs text-muted-foreground mt-1">
              {selectedOption.definition}
            </p>
          )}
        </div>
      )}

      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}
