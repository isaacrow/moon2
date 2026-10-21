/**
 * Stable URI Generator for Sonic Engine
 * 
 * Generates consistent, stable URIs for BIBFRAME entities
 * Follows best practices for Linked Data identifiers
 * 
 * @version 1.0.0
 */

import { v4 as uuidv4 } from 'uuid';

const BASE_URI = 'http://example.org/bibframe/';

/**
 * Generate stable URI for an entity type
 * 
 * Format: http://example.org/bibframe/{type}/{uuid}
 */
export function generateStableUri(type: string): string {
  const uuid = uuidv4();
  return `${BASE_URI}${type}/${uuid}`;
}

/**
 * Generate URI with custom base
 */
export function generateUriWithBase(base: string, type: string): string {
  const uuid = uuidv4();
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${type}/${uuid}`;
}

/**
 * Generate URI from title (human-readable)
 * 
 * Format: http://example.org/bibframe/{type}/{slug}-{short-uuid}
 */
export function generateUriFromTitle(type: string, title: string): string {
  const slug = slugify(title);
  const shortUuid = uuidv4().split('-')[0];
  return `${BASE_URI}${type}/${slug}-${shortUuid}`;
}

/**
 * Slugify a string for use in URIs
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50); // Limit length
}

/**
 * Validate URI format
 */
export function isValidUri(uri: string): boolean {
  try {
    new URL(uri);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract type from URI
 */
export function extractTypeFromUri(uri: string): string | null {
  const match = uri.match(/\/(\w+)\/[^\/]+$/);
  return match ? match[1] : null;
}

/**
 * Check if two URIs reference the same entity
 */
export function isSameEntity(uri1: string, uri2: string): boolean {
  return uri1 === uri2;
}

/**
 * Normalize URI (remove trailing slashes, fragments, etc.)
 */
export function normalizeUri(uri: string): string {
  try {
    const url = new URL(uri);
    // Remove fragment
    url.hash = '';
    // Remove trailing slash from path
    if (url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.toString();
  } catch {
    return uri;
  }
}
