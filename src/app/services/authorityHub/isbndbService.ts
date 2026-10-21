/**
 * ISBNdb Authority Service
 * Searches ISBNdb for author and book information
 */
import { 
  searchAuthors, 
  getAuthorDetails, 
  searchBooks, 
  searchPublishers, 
  searchSubjects, 
  getPublisherDetails, 
  getSubjectDetails, 
  getStats,
  getBookByISBN
} from '../../utils/isbndbClient';
import type { AuthoritySearchResult } from './types';

export class IsbndbService {
  /**
   * Get book details by ISBN
   */
  async getBookDetails(isbn: string): Promise<any> {
    try {
      console.log('[ISBNdb] Fetching book details for:', isbn);
      const book = await getBookByISBN(isbn);
      return book;
    } catch (error) {
      console.error('[ISBNdb] Error fetching book details:', error);
      return null;
    }
  }

  /**
   * Search for authors in ISBNdb
   */
  async search(name: string): Promise<AuthoritySearchResult[]> {
    try {
      console.log('[ISBNdb] Searching for:', name);
      
      const { authors, total } = await searchAuthors(name, 1, 10);
      
      console.log(`[ISBNdb] Found ${total} authors`);
      
      return authors.map((author: any, index: number) => ({
        id: author.author || author.author_id || `author-${index}`,
        label: author.author || 'Unknown Author',
        source: 'ISBNdb' as const,
        score: 0.8 - (index * 0.05), // Decrease score for lower results
        alternateNames: [],
      }));
    } catch (error) {
      console.error('[ISBNdb] Search error:', error);
      return [];
    }
  }

  /**
   * Get detailed information about an author
   */
  async getPersonDetails(authorName: string): Promise<any> {
    try {
      console.log('[ISBNdb] Fetching details for:', authorName);
      
      const details = await getAuthorDetails(authorName);
      
      if (!details) {
        console.warn('[ISBNdb] No details found for:', authorName);
        return null;
      }
      
      return details;
    } catch (error) {
      console.error('[ISBNdb] Error fetching author details:', error);
      return null;
    }
  }

  /**
   * Search for publishers in ISBNdb
   */
  async searchPublishers(query: string): Promise<AuthoritySearchResult[]> {
    try {
      console.log('[ISBNdb] Searching for publishers:', query);
      
      const { publishers, total } = await searchPublishers(query, 1, 10);
      
      console.log(`[ISBNdb] Found ${total} publishers`);
      
      return publishers.map((publisher: any, index: number) => ({
        id: publisher.name || `publisher-${index}`,
        label: publisher.name || 'Unknown Publisher',
        source: 'ISBNdb' as const,
        score: 0.8 - (index * 0.05),
        type: 'publisher',
        name: publisher.name
      }));
    } catch (error) {
      console.error('[ISBNdb] Search publishers error:', error);
      return [];
    }
  }

  /**
   * Search for subjects in ISBNdb
   */
  async searchSubjects(query: string): Promise<AuthoritySearchResult[]> {
    try {
      console.log('[ISBNdb] Searching for subjects:', query);
      
      const { subjects, total } = await searchSubjects(query, 1, 10);
      
      console.log(`[ISBNdb] Found ${total} subjects`);
      
      return subjects.map((subject: any, index: number) => ({
        id: subject.subject || `subject-${index}`,
        label: subject.subject || 'Unknown Subject',
        source: 'ISBNdb' as const,
        score: 0.8 - (index * 0.05),
        type: 'subject',
        subject: subject.subject
      }));
    } catch (error) {
      console.error('[ISBNdb] Search subjects error:', error);
      return [];
    }
  }

  /**
   * Get detailed information about a publisher
   */
  async getPublisherDetails(name: string): Promise<any> {
    try {
      console.log('[ISBNdb] Fetching publisher details for:', name);
      const details = await getPublisherDetails(name);
      return details;
    } catch (error) {
      console.error('[ISBNdb] Error fetching publisher details:', error);
      return null;
    }
  }

  /**
   * Get detailed information about a subject
   */
  async getSubjectDetails(name: string): Promise<any> {
    try {
      console.log('[ISBNdb] Fetching subject details for:', name);
      const details = await getSubjectDetails(name);
      return details;
    } catch (error) {
      console.error('[ISBNdb] Error fetching subject details:', error);
      return null;
    }
  }

  /**
   * Get ISBNdb statistics
   */
  async getStats(): Promise<any> {
    try {
      return await getStats();
    } catch (error) {
      console.error('[ISBNdb] Error fetching stats:', error);
      return null;
    }
  }

  /**
   * Search for books in ISBNdb
   */
  async searchBooks(query: string): Promise<any[]> {
    try {
      console.log('[ISBNdb] Searching for books:', query);
      
      const { books, total } = await searchBooks(query, 1, 10);
      
      console.log(`[ISBNdb] Found ${total} books`);
      
      return books.map((book: any, index: number) => ({
        id: book.isbn13 || book.isbn,
        label: book.title || 'Untitled',
        source: 'ISBNdb' as const,
        score: 0.8 - (index * 0.05),
        type: 'book', // Changed from 'work' to match my check in MoonEngineGlass
        description: book.authors ? `by ${book.authors.join(', ')}` : undefined,
        authors: book.authors,
        title: book.title,
        title_long: book.title_long,
        isbn: book.isbn,
        isbn13: book.isbn13,
        publisher: book.publisher,
        date_published: book.date_published,
        binding: book.binding,
        pages: book.pages,
        image: book.image,
        synopsys: book.synopsys || book.overview
      }));
    } catch (error) {
      console.error('[ISBNdb] Search books error:', error);
      return [];
    }
  }

  /**
   * Search for books by an author
   */
  async searchBooksByAuthor(authorName: string): Promise<any[]> {
    try {
      console.log('[ISBNdb] Searching books by author:', authorName);
      
      // Search for books with the author's name in the query
      const { books } = await searchBooks(authorName, 1, 20);
      
      // Filter books to only include those by this specific author
      const filteredBooks = books.filter((book: any) => 
        book.authors?.some((author: string) => 
          author.toLowerCase().includes(authorName.toLowerCase())
        )
      );
      
      console.log(`[ISBNdb] Found ${filteredBooks.length} books by ${authorName}`);
      
      return filteredBooks;
    } catch (error) {
      console.error('[ISBNdb] Error searching books:', error);
      return [];
    }
  }

  /**
   * Extract works from ISBNdb author details
   */
  extractWorks(details: any): Array<{ title: string; date?: string; isbn?: string }> {
    if (!details || !details.books) {
      return [];
    }

    return details.books.map((book: any) => ({
      title: book.title || book.title_long || 'Untitled',
      date: book.date_published,
      isbn: book.isbn13 || book.isbn,
      publisher: book.publisher,
    }));
  }

  /**
   * Convert ISBNdb author to BIBFRAME Agent format
   */
  toBIBFRAME(authorName: string, details?: any) {
    const agent: any = {
      '@type': 'bf:Agent',
      'rdfs:label': authorName,
      'bf:source': {
        '@type': 'bf:Source',
        'rdfs:label': 'ISBNdb',
      },
    };

    if (details && details.books && details.books.length > 0) {
      // Add note about number of books
      agent['bf:note'] = {
        '@type': 'bf:Note',
        'rdfs:label': `${details.books.length} books in ISBNdb`,
      };
    }

    return agent;
  }
}
