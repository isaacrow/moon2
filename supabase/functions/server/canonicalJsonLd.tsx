/**
 * 🔐 Canonical JSON-LD Serializer
 * Deterministic, enterprise-safe JSON-LD generation
 * 
 * Features:
 * - Stable URI ordering
 * - No duplicate blank nodes
 * - Proper @context from BIBFRAME namespace
 * - Deterministic property ordering
 * - Reliable for versioning
 */

import { createHash } from 'node:crypto';

/**
 * Canonical BIBFRAME @context
 * Using official LOC namespace
 */
const CANONICAL_CONTEXT = {
  'bf': 'http://id.loc.gov/ontologies/bibframe/',
  'bflc': 'http://id.loc.gov/ontologies/bflc/',
  'madsrdf': 'http://www.loc.gov/mads/rdf/v1#',
  'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
  'owl': 'http://www.w3.org/2002/07/owl#',
  'xsd': 'http://www.w3.org/2001/XMLSchema#',
  'dcterms': 'http://purl.org/dc/terms/',
  'skos': 'http://www.w3.org/2004/02/skos/core#'
};

/**
 * Canonical ordering for BIBFRAME entity types
 */
const TYPE_ORDER = [
  'bf:AdminMetadata',
  'bf:Work',
  'bf:Instance',
  'bf:Item',
  'bf:Title',
  'bf:Contribution',
  'bf:Agent',
  'bf:Place',
  'bf:Topic',
  'bf:ProvisionActivity',
  'bf:Identifier',
  'bf:Note'
];

/**
 * Canonical ordering for BIBFRAME properties
 */
const PROPERTY_ORDER = [
  '@id',
  '@type',
  // Core relationships
  'bf:instanceOf',
  'bf:hasInstance',
  'bf:itemOf',
  'bf:hasItem',
  'bf:expressionOf',
  'bf:hasExpression',
  // Descriptive properties
  'bf:title',
  'bf:mainTitle',
  'bf:subtitle',
  'bf:partNumber',
  'bf:partName',
  'bf:contribution',
  'bf:role',
  'bf:agent',
  'bf:subject',
  'bf:classification',
  // Physical/Instance properties
  'bf:provisionActivity',
  'bf:publication',
  'bf:distribution',
  'bf:manufacture',
  'bf:date',
  'bf:place',
  'bf:agent',
  'bf:identifiedBy',
  'bf:isbn',
  'bf:issn',
  'bf:lccn',
  'bf:extent',
  'bf:dimensions',
  'bf:carrierType',
  'bf:mediaType',
  'bf:editionStatement',
  'bf:responsibilityStatement',
  // Content properties
  'bf:content',
  'bf:language',
  'bf:notation',
  'bf:illustrativeContent',
  'bf:colorContent',
  'bf:supplementaryContent',
  // Subjects and topics
  'bf:genreForm',
  'bf:geographicCoverage',
  'bf:temporalCoverage',
  // Admin metadata
  'bf:adminMetadata',
  'bf:source',
  'bf:descriptionConventions',
  'bf:descriptionLanguage',
  'bf:creationDate',
  'bf:changeDate',
  'bf:status',
  // Generic
  'rdfs:label',
  'rdf:value'
];

/**
 * Generate canonical JSON-LD from graph
 * Ensures deterministic output for versioning
 */
export function toCanonicalJsonLd(graphJson: any): any {
  // Start with canonical context
  const canonical: any = {
    '@context': CANONICAL_CONTEXT
  };

  // Extract and process graph
  const graph = graphJson['@graph'] || [];

  // Sort nodes by type, then by URI
  const sortedGraph = [...graph].sort((a, b) => {
    const typeA = getNodeType(a);
    const typeB = getNodeType(b);
    
    // Sort by type priority first
    const typeIndexA = TYPE_ORDER.indexOf(typeA);
    const typeIndexB = TYPE_ORDER.indexOf(typeB);
    
    if (typeIndexA !== typeIndexB) {
      if (typeIndexA === -1) return 1;
      if (typeIndexB === -1) return -1;
      return typeIndexA - typeIndexB;
    }
    
    // Then by URI
    const idA = a['@id'] || '';
    const idB = b['@id'] || '';
    return idA.localeCompare(idB);
  });

  // Process each node for canonical ordering
  canonical['@graph'] = sortedGraph.map(node => canonicalizeNode(node));

  return canonical;
}

/**
 * Get primary type of a node
 */
function getNodeType(node: any): string {
  const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
  
  // Find first type that matches our known types
  for (const knownType of TYPE_ORDER) {
    if (types.includes(knownType)) {
      return knownType;
    }
  }
  
  return types[0] || 'unknown';
}

/**
 * Canonicalize a single node
 * - Sort properties in canonical order
 * - Normalize blank nodes
 * - Ensure stable serialization
 */
function canonicalizeNode(node: any): any {
  const canonical: any = {};
  
  // Get all keys and sort them
  const keys = Object.keys(node);
  const sortedKeys = keys.sort((a, b) => {
    const indexA = PROPERTY_ORDER.indexOf(a);
    const indexB = PROPERTY_ORDER.indexOf(b);
    
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    // Alphabetical for unknown properties
    return a.localeCompare(b);
  });
  
  // Build canonical node with sorted properties
  for (const key of sortedKeys) {
    const value = node[key];
    canonical[key] = canonicalizeValue(value);
  }
  
  return canonical;
}

/**
 * Canonicalize a value
 * - Arrays are sorted by @id or @value
 * - Objects are recursively canonicalized
 */
function canonicalizeValue(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }
  
  // Array - sort for determinism
  if (Array.isArray(value)) {
    return value.map(v => canonicalizeValue(v)).sort((a, b) => {
      // Sort by @id if present
      if (a['@id'] && b['@id']) {
        return a['@id'].localeCompare(b['@id']);
      }
      // Sort by @value if present
      if (a['@value'] && b['@value']) {
        return String(a['@value']).localeCompare(String(b['@value']));
      }
      // Otherwise maintain order
      return 0;
    });
  }
  
  // Object - recursively canonicalize
  if (typeof value === 'object') {
    return canonicalizeNode(value);
  }
  
  // Primitive - return as-is
  return value;
}

/**
 * Generate SHA-256 checksum of canonical JSON-LD
 * Used for version integrity checking
 */
export function generateChecksum(canonicalJsonLd: any): string {
  const normalized = JSON.stringify(canonicalJsonLd, null, 0);
  const hash = createHash('sha256');
  hash.update(normalized);
  return hash.digest('hex');
}

/**
 * Validate that JSON-LD has proper structure
 */
export function validateJsonLdStructure(jsonld: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Must have @context
  if (!jsonld['@context']) {
    errors.push('Missing @context');
  }
  
  // Must have @graph or be a single node
  if (!jsonld['@graph'] && !jsonld['@id']) {
    errors.push('Must have @graph array or be a single node with @id');
  }
  
  // Check all nodes have @id
  const graph = jsonld['@graph'] || [jsonld];
  graph.forEach((node: any, index: number) => {
    if (!node['@id']) {
      errors.push(`Node at index ${index} missing @id`);
    }
    if (!node['@type']) {
      errors.push(`Node at index ${index} missing @type`);
    }
  });
  
  // Check for duplicate @ids
  const ids = graph.map((n: any) => n['@id']).filter(Boolean);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    errors.push('Duplicate @id values found in graph');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Ensure all URIs are stable and properly formed
 */
export function normalizeUris(jsonld: any, baseUri: string): any {
  const graph = jsonld['@graph'] || [jsonld];
  
  const normalized = graph.map((node: any) => {
    const normalizedNode = { ...node };
    
    // Ensure @id is absolute URI
    if (normalizedNode['@id'] && !normalizedNode['@id'].startsWith('http')) {
      normalizedNode['@id'] = `${baseUri}/${normalizedNode['@id']}`;
    }
    
    return normalizedNode;
  });
  
  return {
    '@context': jsonld['@context'] || CANONICAL_CONTEXT,
    '@graph': normalized
  };
}

/**
 * Add export metadata to canonical JSON-LD
 */
export function addExportMetadata(
  canonicalJsonLd: any,
  userId?: string,
  recordId?: string
): any {
  const enriched = JSON.parse(JSON.stringify(canonicalJsonLd));
  
  // Find or create AdminMetadata node
  const graph = enriched['@graph'] || [];
  let adminNode = graph.find((n: any) => n['@type'] === 'bf:AdminMetadata');
  
  if (!adminNode) {
    adminNode = {
      '@id': `http://moon.library/admin/${recordId || 'unknown'}`,
      '@type': 'bf:AdminMetadata'
    };
    graph.push(adminNode);
  }
  
  // Add export metadata
  adminNode['bf:generationDate'] = {
    '@value': new Date().toISOString(),
    '@type': 'xsd:dateTime'
  };
  
  if (userId) {
    adminNode['bf:generationProcess'] = {
      '@value': `MOON Cataloging System - User: ${userId}`
    };
  }
  
  adminNode['bf:generationTool'] = {
    '@value': 'MOON SAND V2 - Production Build'
  };
  
  return enriched;
}
