// RDF Graph Builder
// Converts Moon BIBFRAME data to proper RDF/JSON-LD with URI references

interface GraphNode {
  '@id': string;
  '@type': string;
  [key: string]: any;
}

interface RDFGraph {
  '@context': Record<string, string>;
  '@graph': GraphNode[];
}

// 🏗️ Build Complete RDF Graph
export function buildRDFGraph(workData: any, instanceData: any, adminData: any): RDFGraph {
  const graph: GraphNode[] = [];
  
  const workId = workData['@id'] || `http://example.org/work/${adminData.recordId || Date.now()}`;
  const instanceId = instanceData['@id'] || `${workId}/instance`;
  
  // Build Work node
  const workNode: GraphNode = {
    '@id': workId,
    '@type': 'bf:Work',
    ...processProperties(workData, 'bf:Work')
  };
  
  // Link to instance
  workNode['bf:hasInstance'] = { '@id': instanceId };
  
  graph.push(workNode);
  
  // Build Instance node
  const instanceNode: GraphNode = {
    '@id': instanceId,
    '@type': 'bf:Instance',
    'bf:instanceOf': { '@id': workId },
    ...processProperties(instanceData, 'bf:Instance')
  };
  
  graph.push(instanceNode);
  
  // Build Admin Metadata node
  const adminNode: GraphNode = {
    '@id': `${workId}/admin`,
    '@type': 'bf:AdminMetadata',
    'bf:status': { '@value': adminData.status || 'new' },
    'bf:creationDate': { '@value': adminData.creationDate || new Date().toISOString() },
    'bf:source': adminData.institution || 'Unknown',
    'bflc:catalogerId': adminData.cataloger || 'Unknown'
  };
  
  graph.push(adminNode);
  
  return {
    '@context': getBIBFRAMEContext(),
    '@graph': graph
  };
}

// 🔧 Process Properties to Ensure URI References
function processProperties(data: any, entityType: string): Record<string, any> {
  const processed: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Skip internal fields
    if (key.startsWith('_') || key === '@id' || key === '@type') {
      continue;
    }
    
    // Process value
    processed[key] = processValue(value, key);
  }
  
  return processed;
}

// 🔄 Process Individual Value
function processValue(value: any, propertyName: string): any {
  // Null/undefined
  if (value === null || value === undefined) {
    return value;
  }
  
  // Already a URI reference
  if (isURIReference(value)) {
    return ensureProperURIFormat(value);
  }
  
  // Array of values
  if (Array.isArray(value)) {
    return value.map(v => processValue(v, propertyName));
  }
  
  // Object (might be complex structure)
  if (typeof value === 'object') {
    // Check if it has @id (URI reference)
    if ('@id' in value) {
      return ensureProperURIFormat(value);
    }
    
    // Complex nested object
    return processComplexObject(value);
  }
  
  // Literal value - wrap in @value
  return { '@value': String(value) };
}

// ✅ Check if Value is URI Reference
function isURIReference(value: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    '@id' in value
  );
}

// 🔗 Ensure Proper URI Format
function ensureProperURIFormat(uriRef: any): GraphNode {
  const result: GraphNode = {
    '@id': uriRef['@id'],
    '@type': uriRef['@type'] || 'rdfs:Resource'
  };
  
  // Preserve label
  if (uriRef['rdfs:label'] || uriRef.label) {
    result['rdfs:label'] = { '@value': uriRef['rdfs:label'] || uriRef.label };
  }
  
  // Preserve any other properties
  for (const [key, value] of Object.entries(uriRef)) {
    if (key !== '@id' && key !== '@type' && key !== 'rdfs:label' && key !== 'label') {
      result[key] = value;
    }
  }
  
  return result;
}

// 🧩 Process Complex Nested Object
function processComplexObject(obj: any): any {
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    result[key] = processValue(value, key);
  }
  
  return result;
}

// 📚 Get BIBFRAME Context
function getBIBFRAMEContext(): Record<string, string> {
  return {
    'bf': 'http://id.loc.gov/ontologies/bibframe/',
    'bflc': 'http://id.loc.gov/ontologies/bflc/',
    'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'madsrdf': 'http://www.loc.gov/mads/rdf/v1#',
    'skos': 'http://www.w3.org/2004/02/skos/core#',
    'xsd': 'http://www.w3.org/2001/XMLSchema#'
  };
}

// 🎯 Validate Graph is SPARQL-Ready
export function validateSPARQLGraph(graph: RDFGraph): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check @context exists
  if (!graph['@context']) {
    errors.push('Missing @context');
  }
  
  // Check @graph exists
  if (!graph['@graph'] || !Array.isArray(graph['@graph'])) {
    errors.push('Missing or invalid @graph');
    return { valid: false, errors, warnings };
  }
  
  // Validate each node
  for (const node of graph['@graph']) {
    // Must have @id
    if (!node['@id']) {
      errors.push(`Node missing @id: ${JSON.stringify(node).substring(0, 50)}`);
    }
    
    // Must have @type
    if (!node['@type']) {
      warnings.push(`Node missing @type: ${node['@id']}`);
    }
    
    // Check for invalid URI patterns
    if (node['@id'] && !isValidURI(node['@id'])) {
      errors.push(`Invalid URI format: ${node['@id']}`);
    }
    
    // Validate property values
    for (const [key, value] of Object.entries(node)) {
      if (key === '@id' || key === '@type') continue;
      
      if (!validatePropertyValue(value, key)) {
        warnings.push(`Property ${key} in ${node['@id']} may have invalid format`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ✅ Validate URI Format
function isValidURI(uri: string): boolean {
  try {
    new URL(uri);
    return true;
  } catch {
    return false;
  }
}

// ✅ Validate Property Value
function validatePropertyValue(value: any, propertyName: string): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  
  // Array
  if (Array.isArray(value)) {
    return value.every(v => validatePropertyValue(v, propertyName));
  }
  
  // Object
  if (typeof value === 'object') {
    // URI reference should have @id
    if ('@id' in value) {
      return isValidURI(value['@id']);
    }
    
    // Literal should have @value
    if ('@value' in value) {
      return true;
    }
    
    // Complex object - recursively validate
    return true;
  }
  
  // Primitive values should be wrapped
  return false;
}

// 📊 Extract All URIs from Graph
export function extractAllURIs(graph: RDFGraph): string[] {
  const uris: Set<string> = new Set();
  
  for (const node of graph['@graph']) {
    if (node['@id']) {
      uris.add(node['@id']);
    }
    
    extractURIsFromValue(node, uris);
  }
  
  return Array.from(uris);
}

// 🔍 Extract URIs from Value (Recursive)
function extractURIsFromValue(value: any, uris: Set<string>): void {
  if (value === null || value === undefined) {
    return;
  }
  
  if (Array.isArray(value)) {
    value.forEach(v => extractURIsFromValue(v, uris));
    return;
  }
  
  if (typeof value === 'object') {
    if ('@id' in value) {
      uris.add(value['@id']);
    }
    
    for (const v of Object.values(value)) {
      extractURIsFromValue(v, uris);
    }
  }
}

// 🔄 Convert to Turtle Format
export function convertToTurtle(graph: RDFGraph): string {
  const prefixes = Object.entries(graph['@context'])
    .map(([prefix, uri]) => `@prefix ${prefix}: <${uri}> .`)
    .join('\n');
  
  const triples: string[] = [];
  
  for (const node of graph['@graph']) {
    const subject = node['@id'];
    
    // Type triple
    if (node['@type']) {
      triples.push(`<${subject}> a ${node['@type']} .`);
    }
    
    // Property triples
    for (const [predicate, value] of Object.entries(node)) {
      if (predicate === '@id' || predicate === '@type') continue;
      
      const objectStr = formatTurtleObject(value);
      if (objectStr) {
        triples.push(`<${subject}> ${predicate} ${objectStr} .`);
      }
    }
  }
  
  return prefixes + '\n\n' + triples.join('\n');
}

// 📝 Format Turtle Object
function formatTurtleObject(value: any): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (Array.isArray(value)) {
    return value.map(v => formatTurtleObject(v)).filter(Boolean).join(', ');
  }
  
  if (typeof value === 'object') {
    if ('@id' in value) {
      return `<${value['@id']}>`;
    }
    
    if ('@value' in value) {
      return `"${value['@value']}"`;
    }
  }
  
  return `"${String(value)}"`;
}

// 📈 Get Graph Statistics
export function getGraphStats(graph: RDFGraph): {
  nodes: number;
  uriReferences: number;
  literals: number;
  blankNodes: number;
} {
  let uriReferences = 0;
  let literals = 0;
  let blankNodes = 0;
  
  const countValues = (value: any) => {
    if (Array.isArray(value)) {
      value.forEach(countValues);
      return;
    }
    
    if (typeof value === 'object' && value !== null) {
      if ('@id' in value) {
        if (value['@id'].startsWith('_:')) {
          blankNodes++;
        } else {
          uriReferences++;
        }
      } else if ('@value' in value) {
        literals++;
      }
      
      Object.values(value).forEach(countValues);
    }
  };
  
  graph['@graph'].forEach(node => countValues(node));
  
  return {
    nodes: graph['@graph'].length,
    uriReferences,
    literals,
    blankNodes
  };
}
