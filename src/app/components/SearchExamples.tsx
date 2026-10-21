import React from 'react';
import { BookOpen, Search, Sparkles } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface SearchExample {
  query: string;
  description: string;
  expectedResults: string;
}

const examples: SearchExample[] = [
  {
    query: "The Great Gatsby",
    description: "Search by title",
    expectedResults: "F. Scott Fitzgerald's classic novel"
  },
  {
    query: "Shakespeare",
    description: "Search by author",
    expectedResults: "Works by William Shakespeare"
  },
  {
    query: "knitter's handy book",
    description: "Partial title search",
    expectedResults: "Knitting pattern books"
  },
  {
    query: "To Kill a Mockingbird",
    description: "Full title search",
    expectedResults: "Harper Lee's novel"
  }
];

interface SearchExamplesProps {
  onExampleClick: (query: string) => void;
  darkMode?: boolean;
}

export function SearchExamples({ onExampleClick, darkMode }: SearchExamplesProps) {
  return (
    <Card className={`p-6 ${darkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Try These Examples
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => onExampleClick(example.query)}
            className="text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Search className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-mono text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  "{example.query}"
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {example.description}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  → {example.expectedResults}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              About LOC BIBFRAME Search
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
              This search queries the Library of Congress Linked Data Service, which contains millions of 
              bibliographic records in BIBFRAME 2.0 format.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                Searchable by Title
              </Badge>
              <Badge variant="outline" className="text-xs">
                Searchable by Author
              </Badge>
              <Badge variant="outline" className="text-xs">
                Full Metadata
              </Badge>
              <Badge variant="outline" className="text-xs">
                Authority Links
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <strong>API Endpoint:</strong>{' '}
        <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono">
          https://id.loc.gov/search/?q=&lt;query&gt;&q=cs:http://id.loc.gov/resources/works&format=json
        </code>
      </div>
    </Card>
  );
}
