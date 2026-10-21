/**
 * 📋 MARC 21 Converter
 * Uses marcMappingRegistry for explicit BIBFRAME → MARC conversion
 * 
 * ✅ PRODUCTION-SAFE: Declarative, testable, extensible
 */

import { MARC_MAPPING_REGISTRY, type MARCFieldMapping } from './marcMappingRegistry.tsx';

export interface MARCRecord {
  leader: string;
  fields: MARCField[];
}

export interface MARCField {
  tag: string;
  ind1: string;
  ind2: string;
  subfields: MARCSubfield[];
}

export interface MARCSubfield {
  code: string;
  value: string;
}

/**
 * Convert BIBFRAME JSON-LD to MARC 21
 * Uses explicit mapping registry
 */
export function convertToMARC(jsonld: any): MARCRecord {
  const graph = jsonld['@graph'] || [];
  
  // Find entities
  const work = graph.find((n: any) => includesType(n, 'bf:Work'));
  const instance = graph.find((n: any) => includesType(n, 'bf:Instance'));
  const item = graph.find((n: any) => includesType(n, 'bf:Item'));
  
  const record: MARCRecord = {
    leader: '00000nam  2200000Ia 4500',
    fields: []
  };
  
  // Process each mapping in registry
  MARC_MAPPING_REGISTRY.forEach(mapping => {
    const entity = getEntityForMapping(mapping, work, instance, item);
    
    if (!entity) return;
    
    // Check condition
    if (mapping.condition && !mapping.condition(entity, graph)) {
      return;
    }
    
    // Generate field(s)
    const fields = generateMARCFields(mapping, entity, graph, work, instance, item);
    record.fields.push(...fields);
  });
  
  return record;
}

/**
 * Get the appropriate entity for a mapping
 */
function getEntityForMapping(
  mapping: MARCFieldMapping,
  work: any,
  instance: any,
  item: any
): any {
  if (mapping.entityType === 'Work') return work;
  if (mapping.entityType === 'Instance') return instance;
  if (mapping.entityType === 'Item') return item;
  return work || instance || item; // Default to any available
}

/**
 * Generate MARC field(s) from a mapping
 */
function generateMARCFields(
  mapping: MARCFieldMapping,
  entity: any,
  graph: any[],
  work: any,
  instance: any,
  item: any
): MARCField[] {
  const fields: MARCField[] = [];
  
  // If repeatable and property is array, create multiple fields
  if (mapping.repeatable) {
    const propertyValue = entity[mapping.bibframeProperty];
    
    if (Array.isArray(propertyValue)) {
      propertyValue.forEach((value: any) => {
        const field = generateSingleField(mapping, entity, graph, work, instance, item, value);
        if (field && field.subfields.length > 0) {
          fields.push(field);
        }
      });
      return fields;
    }
  }
  
  // Single field
  const field = generateSingleField(mapping, entity, graph, work, instance, item);
  if (field && field.subfields.length > 0) {
    fields.push(field);
  }
  
  return fields;
}

/**
 * Generate a single MARC field
 */
function generateSingleField(
  mapping: MARCFieldMapping,
  entity: any,
  graph: any[],
  work: any,
  instance: any,
  item: any,
  specificValue?: any
): MARCField | null {
  const subfields: MARCSubfield[] = [];
  
  // Generate subfields
  mapping.subfields.forEach(subfieldMapping => {
    let value: string | null = null;
    
    if (subfieldMapping.valueExtractor) {
      // Use custom extractor
      value = subfieldMapping.valueExtractor(entity, graph, specificValue || instance);
    } else {
      // Use property directly
      const propValue = entity[subfieldMapping.bibframeProperty];
      value = extractScalarValue(propValue, graph);
    }
    
    if (value) {
      subfields.push({
        code: subfieldMapping.code,
        value
      });
    } else if (subfieldMapping.required) {
      // Required subfield missing - skip entire field
      return null;
    }
  });
  
  if (subfields.length === 0) {
    return null;
  }
  
  // Determine indicators
  const ind1 = getIndicator(mapping.indicators?.ind1, { entity, work, instance, item, graph });
  const ind2 = getIndicator(mapping.indicators?.ind2, { entity, work, instance, item, graph });
  
  return {
    tag: mapping.tag,
    ind1: ind1 || ' ',
    ind2: ind2 || ' ',
    subfields
  };
}

/**
 * Get indicator value (static or dynamic)
 */
function getIndicator(
  indicator: string | ((data: any) => string) | undefined,
  data: any
): string {
  if (!indicator) return ' ';
  
  if (typeof indicator === 'function') {
    return indicator(data);
  }
  
  return indicator;
}

/**
 * Extract scalar value from RDF property
 */
function extractScalarValue(value: any, graph: any[]): string | null {
  if (!value) return null;
  
  // Plain string
  if (typeof value === 'string') return value;
  
  // Literal object
  if (value['@value']) return String(value['@value']);
  
  // Reference - try to resolve
  if (value['@id']) {
    const resolved = graph.find(n => n['@id'] === value['@id']);
    if (resolved?.['rdfs:label']) {
      return extractScalarValue(resolved['rdfs:label'], graph);
    }
    // Return ID fragment as fallback
    return value['@id'].split('/').pop() || null;
  }
  
  // Nested object with label
  if (value['rdfs:label']) {
    return extractScalarValue(value['rdfs:label'], graph);
  }
  
  return null;
}

/**
 * Check if entity includes a type
 */
function includesType(entity: any, type: string): boolean {
  if (!entity || !entity['@type']) return false;
  
  const types = Array.isArray(entity['@type']) ? entity['@type'] : [entity['@type']];
  return types.includes(type);
}

/**
 * Format MARC record as human-readable text
 */
export function formatMARCAsText(record: MARCRecord): string {
  const lines: string[] = [];
  
  // Leader
  lines.push(`LEADER ${record.leader}`);
  lines.push('');
  
  // Fields
  record.fields.forEach(field => {
    const subfieldStr = field.subfields
      .map(sf => `$${sf.code} ${sf.value}`)
      .join(' ');
    
    lines.push(`${field.tag} ${field.ind1}${field.ind2} ${subfieldStr}`);
  });
  
  return lines.join('\n');
}

/**
 * Format MARC record as ISO 2709
 * (For future implementation - proper MARC binary format)
 */
export function formatMARCAsISO2709(record: MARCRecord): string {
  // TODO: Implement ISO 2709 binary format
  // For now, return text format
  return formatMARCAsText(record);
}
