import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, BookOpen, ExternalLink, Loader2, Moon, Sun, Languages, ChevronLeft } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { BIBFRAMERecord } from '../types/bibframe';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { SearchExamples } from './SearchExamples';

interface BibframeSearchResult {
  title: string;
  authors: string[];
  isbn?: string;
  cover?: string;
  bibframe_uri: string;
  type?: string;
  date?: string;
  subjects?: string[];
  classification?: string;
}

interface BibframeSearchPageProps {
  onLoadRecord: (record: BIBFRAMERecord) => void;
  onNewRecord: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function BibframeSearchPage({ 
  onLoadRecord, 
  onNewRecord,
  darkMode,
  onToggleDarkMode 
}: BibframeSearchPageProps) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BibframeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<BibframeSearchResult | null>(null);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const searchBibframe = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    
    if (!queryToSearch.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    setResults([]);
    
    // If searchQuery was provided (from example), update the input
    if (searchQuery) {
      setQuery(searchQuery);
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/search-bibframe?q=${encodeURIComponent(queryToSearch)}`,
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
      
      if (data.results?.length === 0) {
        toast.info('No results found. Try a different search term.');
      }
    } catch (error) {
      console.error('BIBFRAME search error:', error);
      toast.error('Failed to search BIBFRAME resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadResource = async (result: BibframeSearchResult) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-49c0e13c/load-bibframe?uri=${encodeURIComponent(result.bibframe_uri)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load resource');
      }

      const record = await response.json();
      onLoadRecord(record);
      toast.success('Resource loaded successfully!');
    } catch (error) {
      console.error('Load resource error:', error);
      toast.error('Failed to load resource details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('bibframeSearch') || 'BIBFRAME Search'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('searchLocResources') || 'Search Library of Congress Linked Data'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onToggleDarkMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleDarkMode}
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLanguageChange(i18n.language === 'en' ? 'ar' : 'en')}
              >
                <Languages className="h-4 w-4 mr-2" />
                {i18n.language === 'en' ? 'العربية' : 'English'}
              </Button>
              <Button onClick={onNewRecord}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t('backToCatalog') || 'Back to Catalog'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto p-8">
        <Card className="p-8 mb-8 bg-white dark:bg-gray-800">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder={t('enterTitleOrAuthor') || 'Enter Title or Author name...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchBibframe()}
                className="text-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <Button 
              onClick={searchBibframe}
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {t('searching') || 'Searching...'}
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  {t('search') || 'Search'}
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            {t('searchHint') || 'Search for bibliographic resources in the Library of Congress BIBFRAME database'}
          </p>
        </Card>

        {/* Search Examples - show when no results yet */}
        {!loading && results.length === 0 && !query && (
          <SearchExamples 
            onExampleClick={(exampleQuery) => searchBibframe(exampleQuery)}
            darkMode={darkMode}
          />
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('searchResults') || 'Search Results'} ({results.length})
            </h2>
            {results.map((result, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
              >
                <div className="flex gap-6">
                  {/* Cover Image */}
                  <div className="flex-shrink-0">
                    {result.cover ? (
                      <img
                        src={result.cover}
                        alt={result.title}
                        className="w-32 h-48 object-cover rounded shadow-md"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="192" viewBox="0 0 128 192"%3E%3Crect fill="%23e5e7eb" width="128" height="192"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3ENo Cover%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-32 h-48 bg-gray-200 dark:bg-gray-700 rounded shadow-md flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {result.title}
                    </h3>
                    {result.authors && result.authors.length > 0 && (
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        <span className="font-semibold">{t('authors') || 'Authors'}:</span>{' '}
                        {result.authors.join(', ')}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {result.type && (
                        <Badge variant="secondary">{result.type}</Badge>
                      )}
                      {result.date && (
                        <Badge variant="outline">{result.date}</Badge>
                      )}
                      {result.isbn && (
                        <Badge>ISBN: {result.isbn}</Badge>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleLoadResource(result)}
                        disabled={loading}
                      >
                        {t('editResource') || 'Edit Resource'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(result.bibframe_uri, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t('viewOnLOC') || 'View on LOC'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && query && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('noResults') || 'No results found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('tryDifferentSearch') || 'Try a different search term'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
