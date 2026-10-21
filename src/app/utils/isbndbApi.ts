/**
 * ISBNdb API Integration
 * Provides access to millions of book records via ISBN lookups and searches
 */

const ISBNDB_BASE_URL = 'https://api2.isbndb.com';

export interface ISBNdbBook {
  title: string;
  title_long?: string;
  isbn: string;
  isbn13?: string;
  dewey_decimal?: string;
  binding?: string;
  publisher?: string;
  language?: string;
  date_published?: string;
  edition?: string;
  pages?: number;
  dimensions?: string;
  overview?: string;
  image?: string;
  msrp?: number;
  excerpt?: string;
  synopsys?: string;
  authors?: string[];
  subjects?: string[];
  reviews?: string[];
  prices?: Array<{
    condition: string;
    merchant: string;
    merchant_logo: string;
    merchant_logo_offset: { x: number; y: number };
    shipping: string;
    price: string;
    total: string;
    link: string;
  }>;
  related?: {
    type: string;
  };
}

export interface ISBNdbAuthor {
  author: string;
  author_id?: string;
}

export interface ISBNdbPublisher {
  name: string;
  publisher_id?: string;
}

export interface ISBNdbSubject {
  subject: string;
  subject_id?: string;
}

export interface ISBNdbSearchResult {
  total: number;
  books: ISBNdbBook[];
}

export interface ISBNdbAuthorDetails {
  author: string;
  books: ISBNdbBook[];
}

export interface ISBNdbPublisherDetails {
  name: string;
  books: ISBNdbBook[];
}

/**
 * Get book details by ISBN
 */
export async function getBookByISBN(isbn: string, apiKey: string): Promise<ISBNdbBook | null> {
  try {
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
    
    const response = await fetch(`${ISBNDB_BASE_URL}/book/${cleanIsbn}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('ISBNdb: Book not found (may be added soon)');
        return null;
      }
      if (response.status === 429) {
        throw new Error('ISBNdb API rate limit exceeded');
      }
      throw new Error(`ISBNdb API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.book || null;
  } catch (error) {
    console.error('Error fetching book from ISBNdb:', error);
    throw error;
  }
}

/**
 * Get multiple books by ISBN (batch)
 */
export async function getBooksByISBNs(isbns: string[], apiKey: string): Promise<ISBNdbBook[]> {
  try {
    const cleanIsbns = isbns.map(isbn => isbn.replace(/[^0-9X]/gi, ''));
    
    const response = await fetch(`${ISBNDB_BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: `isbns=${cleanIsbns.join(',')}`,
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('ISBNdb API rate limit exceeded');
      }
      throw new Error(`ISBNdb API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.books || [];
  } catch (error) {
    console.error('Error fetching books from ISBNdb:', error);
    throw error;
  }
}

/**
 * Search books by query
 */
export async function searchBooks(
  query: string, 
  apiKey: string,
  page: number = 1,
  pageSize: number = 20
): Promise<ISBNdbSearchResult> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await fetch(`${ISBNDB_BASE_URL}/books/${encodeURIComponent(query)}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('ISBNdb API rate limit exceeded');
      }
      throw new Error(`ISBNdb API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      total: data.total || 0,
      books: data.books || [],
    };
  } catch (error) {
    console.error('Error searching books in ISBNdb:', error);
    throw error;
  }
}

/**
 * Search for authors
 */
export async function searchAuthors(
  query: string,
  apiKey: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ total: number; authors: ISBNdbAuthor[] }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await fetch(`${ISBNDB_BASE_URL}/authors/${encodeURIComponent(query)}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('ISBNdb API rate limit exceeded');
      }
      throw new Error(`ISBNdb API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      total: data.total || 0,
      authors: data.authors || [],
    };
  } catch (error) {
    console.error('Error searching authors in ISBNdb:', error);
    throw error;
  }
}

/**
 * Get author details
 */
export async function getAuthorDetails(
  authorName: string,
  apiKey: string
): Promise<ISBNdbAuthorDetails | null> {
  try {
    const response = await fetch(`${ISBNDB_BASE_URL}/author/${encodeURIComponent(authorName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      if (response.status === 429) {
        throw new Error('ISBNdb API rate limit exceeded');
      }
      throw new Error(`ISBNdb API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching author from ISBNdb:', error);
    throw error;
  }
}

/**
 * Search publishers
 */
export async function searchPublishers(
  query: string,
  apiKey: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ total: number; publishers: ISBNdbPublisher[] }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await fetch(`${ISBNDB_BASE_URL}/publishers/${encodeURIComponent(query)}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('ISBNdb API rate limit exceeded');
      }
      throw new Error(`ISBNdb API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      total: data.total || 0,
      publishers: data.publishers || [],
    };
  } catch (error) {
    console.error('Error searching publishers in ISBNdb:', error);
    throw error;
  }
}

/**
 * Search subjects
 */
export async function searchSubjects(
  query: string,
  apiKey: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ total: number; subjects: ISBNdbSubject[] }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await fetch(`${ISBNDB_BASE_URL}/subjects/${encodeURIComponent(query)}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('ISBNdb API rate limit exceeded');
      }
      throw new Error(`ISBNdb API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      total: data.total || 0,
      subjects: data.subjects || [],
    };
  } catch (error) {
    console.error('Error searching subjects in ISBNdb:', error);
    throw error;
  }
}

/**
 * Convert ISBNdb book to BIBFRAME-compatible format
 */
export function convertISBNdbToBIBFRAME(book: ISBNdbBook) {
  return {
    work: {
      '@id': `http://isbndb.com/work/${book.isbn13 || book.isbn}`,
      '@type': ['bf:Work', 'bf:Text'],
      'bf:title': {
        'bf:mainTitle': book.title,
        'bf:subtitle': book.title_long ? book.title_long.replace(book.title, '').trim() : undefined,
      },
      'bf:creator': book.authors?.map(author => ({
        '@type': 'bf:Agent',
        'rdfs:label': author,
      })),
      'bf:subject': book.subjects?.map(subject => ({
        '@type': 'bf:Topic',
        'rdfs:label': subject,
      })),
      'bf:language': book.language ? `http://id.loc.gov/vocabulary/languages/${book.language.toLowerCase()}` : undefined,
      'bf:summary': book.synopsys || book.overview ? {
        '@type': 'bf:Summary',
        'rdfs:label': book.synopsys || book.overview,
      } : undefined,
      'bf:classification': book.dewey_decimal ? {
        '@type': 'bf:ClassificationDdc',
        'bf:classificationPortion': book.dewey_decimal,
      } : undefined,
    },
    instance: {
      '@id': `http://isbndb.com/instance/${book.isbn13 || book.isbn}`,
      '@type': ['bf:Instance', 'bf:Print'],
      'bf:instanceOf': `http://isbndb.com/work/${book.isbn13 || book.isbn}`,
      'bf:title': {
        'bf:mainTitle': book.title,
        'bf:subtitle': book.title_long ? book.title_long.replace(book.title, '').trim() : undefined,
      },
      'bf:identifiedBy': [
        book.isbn13 ? {
          '@type': 'bf:Isbn',
          'rdf:value': book.isbn13,
        } : null,
        book.isbn ? {
          '@type': 'bf:Isbn',
          'rdf:value': book.isbn,
        } : null,
      ].filter(Boolean),
      'bf:provisionActivity': book.publisher || book.date_published ? {
        '@type': 'bf:Publication',
        'bf:agent': book.publisher ? {
          '@type': 'bf:Agent',
          'rdfs:label': book.publisher,
        } : undefined,
        'bf:date': book.date_published,
      } : undefined,
      'bf:editionStatement': book.edition,
      'bf:extent': book.pages ? {
        '@type': 'bf:Extent',
        'rdfs:label': `${book.pages} pages`,
      } : undefined,
      'bf:dimensions': book.dimensions,
      'bf:media': 'http://id.loc.gov/vocabulary/mediaTypes/n',
      'bf:carrier': book.binding?.toLowerCase().includes('electronic') 
        ? 'http://id.loc.gov/vocabulary/carriers/cr'
        : 'http://id.loc.gov/vocabulary/carriers/nc',
      'bf:note': book.binding ? {
        '@type': 'bf:Note',
        'rdfs:label': book.binding,
      } : undefined,
    },
    metadata: {
      source: 'ISBNdb',
      sourceUrl: `https://isbndb.com/book/${book.isbn13 || book.isbn}`,
      coverImage: book.image,
    },
  };
}
