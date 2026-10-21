// Unified Authority Types for Multi-Source Integration

export interface UnifiedPerson {
  id: string;
  label: string;
  birth?: string;
  death?: string;
  description?: string;
  identifiers: {
    loc?: string;
    viaf?: string;
    wikidata?: string;
    afiqa?: string;
    isbndb?: string;
  };
  image?: string;
  sourceGraph: AuthorityGraphNode[];
  alternateNames?: string[];
  occupations?: string[];
  nationality?: string;
  works?: Array<{ title: string; date?: string; isbn?: string }>;
  metadata: {
    sources: string[];
    lastUpdated: string;
    confidence: number;
  };
}

export interface AuthorityGraphNode {
  id: string;
  label: string;
  source: 'LOC' | 'VIAF' | 'Wikidata' | 'AfIqa' | 'ISBNdb';
  uri: string;
  type: 'person' | 'organization' | 'work' | 'concept';
  connections: AuthorityConnection[];
  data?: any;
}

export interface AuthorityConnection {
  from: string;
  to: string;
  relationship: 'sameAs' | 'relatedTo' | 'partOf' | 'derivedFrom';
  confidence: number;
}

export interface AuthoritySearchResult {
  source: 'LOC' | 'VIAF' | 'Wikidata' | 'AfIqa' | 'ISBNdb';
  id: string;
  label: string;
  description?: string;
  uri?: string;
  score?: number;
  alternateNames?: string[];
}
