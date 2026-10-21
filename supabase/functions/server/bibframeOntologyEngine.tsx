// BIBFRAME Ontology-Driven Engine with LOC Integration
// Intelligent property-to-authority mapping

import ontology from './ontology.tsx';
import * as locAuth from './locAuthorityService.tsx';

interface PropertyMapping {
  propertyUri: string;
  propertyName: string;
  range: string[];
  authorityService?: 'LCNAF' | 'LCSH' | 'LCGFT' | 'LCC';
  required: boolean;
}

interface ValidationError {
  property: string;
  message: string;
  severity: 'error' | 'warning';
}

// 🧠 Smart Property-to-Authority Mapping
export function getAuthorityService(propertyUri: string): string | null {
  const propertyDef = ontology.getProperty(propertyUri);
  
  if (!propertyDef) {
    console.warn(`[Ontology Engine] Property not found: ${propertyUri}`);
    return null;
  }
  
  const ranges = propertyDef.range;
  
  // Map based on property range
  for (const range of ranges) {
    if (range.includes('Agent') || range.includes('Person') || range.includes('Organization')) {
      return 'LCNAF';
    }
    
    if (range.includes('Topic') || range.includes('Subject')) {
      return 'LCSH';
    }
    
    if (range.includes('GenreForm') || range.includes('Genre')) {
      return 'LCGFT';
    }
    
    if (range.includes('Classification')) {
      return 'LCC';
    }
  }
  
  return null;
}

// 🔍 Auto-lookup Authority for Property
export async function autoLookupAuthority(propertyUri: string, query: string): Promise<any[]> {
  const service = getAuthorityService(propertyUri);
  
  if (!service) {
    console.log(`[Ontology Engine] No authority service for ${propertyUri}`);
    return [];
  }
  
  console.log(`[Ontology Engine] Using ${service} for property ${propertyUri}`);
  
  switch (service) {
    case 'LCNAF':
      return locAuth.searchNames(query);
    case 'LCSH':
      return locAuth.searchSubjects(query);
    case 'LCGFT':
      return locAuth.searchGenreForms(query);
    case 'LCC':
      return locAuth.searchClassification(query);
    default:
      return [];
  }
}

// 📋 Get All Properties for Class with Authority Mapping
export function getPropertiesWithAuthorities(className: string): PropertyMapping[] {
  const properties = ontology.getPropertiesForClass(className);
  
  return properties.map(prop => ({
    propertyUri: prop.uri,
    propertyName: prop.label,
    range: prop.range,
    authorityService: getAuthorityService(prop.uri) as any,
    required: prop.required
  }));
}

// ✅ Validate URI Links Exist
export async function validateURILinks(entity: any): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];
  
  for (const [key, value] of Object.entries(entity)) {
    if (typeof value === 'object' && value !== null) {
      // Check if it's a URI reference
      if ('@id' in value) {
        const uri = (value as any)['@id'];
        
        // Validate URI format
        if (!uri.startsWith('http://') && !uri.startsWith('https://')) {
          errors.push({
            property: key,
            message: `Invalid URI format: ${uri}`,
            severity: 'error'
          });
        }
        
        // Check if URI is from LOC
        if (uri.startsWith('http://id.loc.gov/')) {
          // Optionally validate URI exists (can be expensive)
          // For now, just validate format
          if (!isValidLOCUri(uri)) {
            errors.push({
              property: key,
              message: `Malformed LOC URI: ${uri}`,
              severity: 'warning'
            });
          }
        }
      }
    }
  }
  
  return errors;
}

// 🔗 Validate Domain/Range Compatibility
export function validateDomainRange(entityType: string, propertyUri: string, valueType: string): boolean {
  const propertyDef = ontology.getProperty(propertyUri);
  
  if (!propertyDef) {
    console.warn(`[Ontology Engine] Property not defined: ${propertyUri}`);
    return false;
  }
  
  // Check domain (what class can have this property)
  if (!propertyDef.domain.includes(entityType)) {
    console.warn(`[Ontology Engine] Domain mismatch: ${entityType} cannot have property ${propertyUri}`);
    return false;
  }
  
  // Check range (what type of value is allowed)
  if (!propertyDef.range.includes(valueType)) {
    console.warn(`[Ontology Engine] Range mismatch: ${propertyUri} expects ${propertyDef.range.join(' or ')}, got ${valueType}`);
    return false;
  }
  
  return true;
}

// 🎯 Ensure No Literal Where URI Required
export function validateNoLiteralsWhereURIRequired(entity: any, className: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const properties = ontology.getPropertiesForClass(className);
  
  for (const prop of properties) {
    const value = entity[prop.uri] || entity[prop.label];
    
    if (!value) continue;
    
    // Check if property range requires URI
    const requiresURI = prop.range.some(r => 
      r.includes('Agent') || 
      r.includes('Subject') || 
      r.includes('Topic') ||
      r.includes('GenreForm')
    );
    
    if (requiresURI) {
      // Value should be object with @id
      if (typeof value === 'string') {
        errors.push({
          property: prop.label,
          message: `Property "${prop.label}" requires a URI reference, but got a literal value`,
          severity: 'error'
        });
      } else if (typeof value === 'object' && !('@id' in value)) {
        errors.push({
          property: prop.label,
          message: `Property "${prop.label}" requires @id field`,
          severity: 'error'
        });
      }
    }
  }
  
  return errors;
}

// 🔍 Check if URI is Valid LOC Format
function isValidLOCUri(uri: string): boolean {
  const validPatterns = [
    /^http:\/\/id\.loc\.gov\/authorities\/names\/n\d+$/,
    /^http:\/\/id\.loc\.gov\/authorities\/subjects\/sh\d+$/,
    /^http:\/\/id\.loc\.gov\/authorities\/genreForms\/gf\d+$/,
    /^http:\/\/id\.loc\.gov\/authorities\/classification\/[A-Z]+\d*$/,
    /^http:\/\/id\.loc\.gov\/resources\/works\/\w+$/,
    /^http:\/\/id\.loc\.gov\/resources\/instances\/\w+$/,
  ];
  
  return validPatterns.some(pattern => pattern.test(uri));
}

// 🛡️ Comprehensive Validation
export async function validateBIBFRAMERecord(entity: any, className: string): Promise<{
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}> {
  const allErrors: ValidationError[] = [];
  
  // 1. Ontology validation
  const ontologyValidation = ontology.validateEntity(entity, className);
  if (!ontologyValidation.valid) {
    allErrors.push(...ontologyValidation.errors.map(err => ({
      property: 'general',
      message: err,
      severity: 'error' as const
    })));
  }
  
  // 2. URI link validation
  const uriErrors = await validateURILinks(entity);
  allErrors.push(...uriErrors);
  
  // 3. Literal vs URI validation
  const literalErrors = validateNoLiteralsWhereURIRequired(entity, className);
  allErrors.push(...literalErrors);
  
  const errors = allErrors.filter(e => e.severity === 'error');
  const warnings = allErrors.filter(e => e.severity === 'warning');
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// 📊 Get Property Autocomplete Configuration
export function getAutocompleteConfig(propertyUri: string): {
  enabled: boolean;
  service: string | null;
  multiple: boolean;
  required: boolean;
} {
  const propertyDef = ontology.getProperty(propertyUri);
  const service = getAuthorityService(propertyUri);
  
  return {
    enabled: service !== null,
    service,
    multiple: true, // Most BIBFRAME properties allow multiple values
    required: propertyDef?.required || false
  };
}

// 🔄 Convert Literal to URI Reference
export async function convertLiteralToURI(
  propertyUri: string, 
  literalValue: string
): Promise<{ '@id': string; 'rdfs:label': string; '@type': string } | null> {
  
  const results = await autoLookupAuthority(propertyUri, literalValue);
  
  if (results.length === 0) {
    console.warn(`[Ontology Engine] No authority found for "${literalValue}"`);
    return null;
  }
  
  // Return best match (first result)
  const best = results[0];
  return {
    '@id': best.uri,
    'rdfs:label': best.label,
    '@type': best.type
  };
}

// 📈 Get Ontology Statistics
export function getOntologyStats() {
  const schema = ontology.getSchema();
  
  if (!schema) return null;
  
  const classes = Object.keys(schema.classes);
  const properties = Object.keys(schema.properties);
  
  const propertiesWithAuthorities = properties.filter(prop => 
    getAuthorityService(prop) !== null
  );
  
  return {
    totalClasses: classes.length,
    totalProperties: properties.length,
    authorityEnabledProperties: propertiesWithAuthorities.length,
    authorityCoverage: (propertiesWithAuthorities.length / properties.length * 100).toFixed(1) + '%'
  };
}
