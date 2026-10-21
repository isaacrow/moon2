import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Loader2, ExternalLink, User, Users, Building2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AuthorityLookupResult } from '../types/bibframe';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export type AuthoritySource = 
  | 'naf-personal'
  | 'naf-corporate'
  | 'naf-conference'
  | 'naf-family'
  | 'viaf'
  | 'wikidata';

interface AuthoritySearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (authority: AuthorityLookupResult) => void;
  fieldLabel: string;
}

export function AuthoritySearch({ open, onClose, onSelect, fieldLabel }: AuthoritySearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AuthorityLookupResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<AuthoritySource>('naf-personal');

  const authoritySources = [
    {
      id: 'naf-personal' as AuthoritySource,
      label: 'NAF Personal Names',
      icon: <User className="h-4 w-4" />,
      description: 'LC Name Authority File - Personal Names',
    },
    {
      id: 'naf-corporate' as AuthoritySource,
      label: 'NAF Corporate Names',
      icon: <Building2 className="h-4 w-4" />,
      description: 'LC Name Authority File - Corporate Bodies',
    },
    {
      id: 'naf-conference' as AuthoritySource,
      label: 'NAF Conference Names',
      icon: <Users className="h-4 w-4" />,
      description: 'LC Name Authority File - Conference Names',
    },
    {
      id: 'naf-family' as AuthoritySource,
      label: 'NAF Family Names',
      icon: <Users className="h-4 w-4" />,
      description: 'LC Name Authority File - Family Names',
    },
    {
      id: 'viaf' as AuthoritySource,
      label: 'VIAF',
      icon: <ExternalLink className="h-4 w-4" />,
      description: 'Virtual International Authority File',
    },
    {
      id: 'wikidata' as AuthoritySource,
      label: 'Wikidata',
      icon: <ExternalLink className="h-4 w-4" />,
      description: 'Wikidata Entities',
    },
  ];

  const searchAuthority = async () => {
    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/search-authority?q=${encodeURIComponent(query)}&source=${selectedSource}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Authority search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: AuthorityLookupResult) => {
    onSelect(result);
    onClose();
    setQuery('');
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {t('searchAuthority') || 'Search Authority'} - {fieldLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-auto">
          {/* Source Selector */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {authoritySources.map((source) => (
              <Button
                key={source.id}
                variant={selectedSource === source.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSource(source.id)}
                className="justify-start"
              >
                {source.icon}
                <span className="ml-2 text-xs">{source.label}</span>
              </Button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={t('enterSearchTerm') || 'Enter name to search...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchAuthority()}
              className="flex-1"
            />
            <Button onClick={searchAuthority} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-auto">
              {results.map((result, index) => (
                <Card
                  key={index}
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSelect(result)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {result.label}
                      </h4>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {result.type}
                        </Badge>
                        {result.source && (
                          <Badge variant="outline" className="text-xs">
                            {result.source}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-mono">
                        {result.uri}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(result.uri, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && results.length === 0 && query && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t('noResultsFound') || 'No results found'}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
