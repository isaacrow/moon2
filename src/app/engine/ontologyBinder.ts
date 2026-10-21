// Marva-Level Ontology Binding System
// Connects ontology properties to LOC authorities automatically

import { locAuthorityService, type AuthorityResult } from "../services/locAuthorityService";

export interface OntologyProperty {
  id: string;
  uri: string;
  label: string;
  range: string[];
  required?: boolean;
}

export interface URIReference {
  '@id': string;
  'rdfs:label': string;
  '@type': string;
}

/**
 * Resolve authority based on ontology property range
 * This is THE KEY FUNCTION - ontology drives which LOC service to use
 * NOT the UI, NOT the template, THE ONTOLOGY
 */
export async function resolveAuthority(
  property: OntologyProperty, 
  query: string
): Promise<AuthorityResult[]> {
  
  console.log(`[Ontology Binder] Resolving authority for ${property.label} (range: ${property.range.join(', ')})`);

  if (!query || query.trim().length === 0) {
    return [];
  }

  // Check property range and call appropriate LOC service
  
  // Agent (Person, Organization, Family)
  if (property.range.some(r => 
    r.includes("bf:Agent") || 
    r.includes("bf:Person") || 
    r.includes("bf:Organization") ||
    r.includes("bf:Family")
  )) {
    console.log(`[Ontology Binder] → Using LCNAF for ${property.label}`);
    return await locAuthorityService.searchNames(query);
  }

  // Subject/Topic
  if (property.range.some(r => 
    r.includes("bf:Topic") ||
    r.includes("bf:Subject") ||
    r.includes("bf:Temporal") ||
    r.includes("bf:Geographic")
  )) {
    console.log(`[Ontology Binder] → Using LCSH for ${property.label}`);
    return await locAuthorityService.searchSubjects(query);
  }

  // Genre/Form
  if (property.range.some(r => 
    r.includes("bf:GenreForm") || 
    r.includes("bf:Genre")
  )) {
    console.log(`[Ontology Binder] → Using LCGFT for ${property.label}`);
    return await locAuthorityService.searchGenreForms(query);
  }

  // Classification
  if (property.range.some(r => 
    r.includes("bf:Classification")
  )) {
    console.log(`[Ontology Binder] → Using LCC for ${property.label}`);
    return await locAuthorityService.searchClassification(query);
  }

  // Default: no authority service available
  console.log(`[Ontology Binder] → No authority service for ${property.label}`);
  return [];
}

/**
 * Convert authority result to proper URI reference
 * This ensures we store URIs, not plain strings
 */
export function authorityToURIReference(authority: AuthorityResult): URIReference {
  return {
    '@id': authority.uri,
    'rdfs:label': authority.label,
    '@type': determineType(authority)
  };
}

/**
 * Determine BIBFRAME type from authority URI
 */
function determineType(authority: AuthorityResult): string {
  const uri = authority.uri;

  if (uri.includes('/authorities/names/')) {
    return 'bf:Agent';
  }

  if (uri.includes('/authorities/subjects/')) {
    return 'bf:Topic';
  }

  if (uri.includes('/authorities/genreForms/')) {
    return 'bf:GenreForm';
  }

  if (uri.includes('/authorities/classification/')) {
    return 'bf:Classification';
  }

  return 'rdfs:Resource';
}

/**
 * Validate that a value is a proper URI reference
 * Returns true if value has @id field
 */
export function isURIReference(value: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    '@id' in value
  );
}

/**
 * Validate that a value is NOT a plain string where URI is required
 */
export function validateNoLiteral(value: any, property: OntologyProperty): boolean {
  const requiresURI = property.range.some(r => 
    r.includes("Agent") || 
    r.includes("Subject") ||
    r.includes("Topic") ||
    r.includes("GenreForm") ||
    r.includes("Classification")
  );

  if (requiresURI) {
    // Must be object with @id
    if (typeof value === 'string') {
      console.error(`[Ontology Binder] ❌ Property ${property.label} requires URI, got string`);
      return false;
    }

    if (!isURIReference(value)) {
      console.error(`[Ontology Binder] ❌ Property ${property.label} requires @id field`);
      return false;
    }
  }

  return true;
}

/**
 * Check if property should have authority autocomplete
 */
export function hasAuthorityBinding(property: OntologyProperty): boolean {
  return property.range.some(r => 
    r.includes("Agent") ||
    r.includes("Person") ||
    r.includes("Organization") ||
    r.includes("Topic") ||
    r.includes("Subject") ||
    r.includes("GenreForm") ||
    r.includes("Classification")
  );
}

/**
 * Get human-readable authority service name
 */
export function getAuthorityServiceName(property: OntologyProperty): string | null {
  if (property.range.some(r => r.includes("Agent") || r.includes("Person"))) {
    return "LC Name Authority (LCNAF)";
  }

  if (property.range.some(r => r.includes("Topic") || r.includes("Subject"))) {
    return "LC Subject Headings (LCSH)";
  }

  if (property.range.some(r => r.includes("GenreForm"))) {
    return "LC Genre/Form Terms (LCGFT)";
  }

  if (property.range.some(r => r.includes("Classification"))) {
    return "LC Classification (LCC)";
  }

  return null;
}

/**
 * Example: Get property configuration for UI binding
 */
export function getPropertyAuthorityConfig(property: OntologyProperty) {
  return {
    hasAuthority: hasAuthorityBinding(property),
    serviceName: getAuthorityServiceName(property),
    requiresURI: property.range.some(r => 
      r.includes("Agent") || 
      r.includes("Subject") ||
      r.includes("GenreForm")
    ),
    multipleValues: true, // Most BIBFRAME properties allow multiple
    required: property.required || false
  };
}
