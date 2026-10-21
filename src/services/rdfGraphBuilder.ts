/**
 * RDF Graph Builder
 * Generates semantically correct BIBFRAME RDF
 * Supports Turtle and JSON-LD serialization
 * Triple store ready output
 */

export interface GraphNode {
  uri: string;
  type: string;
  properties: Map<string, any>;
}

export interface RDFTriple {
  subject: string;
  predicate: string;
  object: string | { value: string; type: 'uri' | 'literal'; datatype?: string };
}

/**
 * Generate stable URI
 */
export function generateUri(type: string, id?: string): string {
  const namespace = 'https://moonlib.org/';
  const identifier = id || (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`);
  return `${namespace}${type}/${identifier}`;
}

/**
 * Escape string for Turtle serialization
 */
function escapeTurtle(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Convert BIBFRAME record to Turtle RDF
 */
export function toTurtle(jsonld: any): string {
  if (!jsonld['@graph']) {
    throw new Error('Invalid JSON-LD: missing @graph');
  }

  const graph = jsonld['@graph'];
  
  // Prefixes
  let turtle = `@prefix bf: <http://id.loc.gov/ontologies/bibframe/> .
@prefix bflc: <http://id.loc.gov/ontologies/bflc/> .
@prefix rel: <http://id.loc.gov/vocabulary/relators/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix madsrdf: <http://www.loc.gov/mads/rdf/v1#> .

`;

  // Process each node in graph
  graph.forEach((node: any, index: number) => {
    if (!node || typeof node !== 'object') return;
    if (index > 0) turtle += '\n';
    turtle += nodeToTurtle(node);
  });

  return turtle;
}

/**
 * Convert single node to Turtle
 */
function nodeToTurtle(node: any, depth: number = 0): string {
  const indent = '    ';
  let turtle = '';

  // Subject and type
  if (node['@id']) {
    turtle += `<${node['@id']}> a ${shortenType(node['@type'])} ;\n`;
  } else {
    turtle += `[\n${indent}a ${shortenType(node['@type'])} ;\n`;
  }

  // Properties
  const properties = Object.keys(node).filter(
    k => k !== '@id' && k !== '@type' && k !== '@context'
  );

  properties.forEach((prop, index) => {
    const isLast = index === properties.length - 1;
    const shortProp = shortenProperty(prop);
    const value = node[prop];

    turtle += `${indent}${shortProp} `;
    turtle += valueToTurtle(value, depth + 1);
    turtle += isLast ? ' .\n' : ' ;\n';
  });

  if (!node['@id']) {
    turtle += ']';
  }

  return turtle;
}

/**
 * Convert value to Turtle representation
 */
function valueToTurtle(value: any, depth: number): string {
  const indent = '    '.repeat(depth);

  // Array
  if (Array.isArray(value)) {
    if (value.length === 0) return '()';
    if (value.length === 1) return valueToTurtle(value[0], depth);
    
    // Multiple values
    return value.map(v => valueToTurtle(v, depth)).join(', ');
  }

  // Object (nested node)
  if (typeof value === 'object' && value !== null) {
    // URI reference
    if (value['@id'] && !value['@type']) {
      return `<${value['@id']}>`;
    }

    // Typed literal
    if (value['@value'] !== undefined) {
      const literal = `"${escapeTurtle(String(value['@value']))}"`;
      if (value['@type']) {
        return `${literal}^^xsd:${value['@type'].replace('xsd:', '')}`;
      }
      if (value['@language']) {
        return `${literal}@${value['@language']}`;
      }
      return literal;
    }

    // Nested structure
    return `[\n${indent}${nodeToTurtle(value, depth).trim()}\n${indent}]`;
  }

  // Literal string
  if (typeof value === 'string') {
    // Check if it's a URI
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return `<${value}>`;
    }
    return `"${escapeTurtle(value)}"`;
  }

  // Number
  if (typeof value === 'number') {
    return String(value);
  }

  // Boolean
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return '""';
}

/**
 * Shorten type to prefix notation
 */
function shortenType(type: string | undefined): string {
  if (!type) return 'bf:Resource';
  
  if (type.startsWith('http://id.loc.gov/ontologies/bibframe/')) {
    return 'bf:' + type.replace('http://id.loc.gov/ontologies/bibframe/', '');
  }
  if (type.startsWith('bf:')) {
    return type;
  }
  return type;
}

/**
 * Shorten property to prefix notation
 */
function shortenProperty(prop: string): string {
  if (prop.startsWith('http://id.loc.gov/ontologies/bibframe/')) {
    return 'bf:' + prop.replace('http://id.loc.gov/ontologies/bibframe/', '');
  }
  if (prop.startsWith('http://www.w3.org/2000/01/rdf-schema#')) {
    return 'rdfs:' + prop.replace('http://www.w3.org/2000/01/rdf-schema#', '');
  }
  if (prop.startsWith('http://www.w3.org/1999/02/22-rdf-syntax-ns#')) {
    return 'rdf:' + prop.replace('http://www.w3.org/1999/02/22-rdf-syntax-ns#', '');
  }
  if (prop.startsWith('bf:') || prop.startsWith('rdfs:') || prop.startsWith('rdf:')) {
    return prop;
  }
  return prop;
}

/**
 * Convert to clean JSON-LD
 */
export function toJsonLd(graph: any[]): any {
  return {
    '@context': {
      'bf': 'http://id.loc.gov/ontologies/bibframe/',
      'bflc': 'http://id.loc.gov/ontologies/bflc/',
      'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
      'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      'xsd': 'http://www.w3.org/2001/XMLSchema#',
      'madsrdf': 'http://www.loc.gov/mads/rdf/v1#'
    },
    '@graph': graph
  };
}

/**
 * Extract triples from JSON-LD
 */
export function extractTriples(jsonld: any): RDFTriple[] {
  const triples: RDFTriple[] = [];
  
  if (!jsonld['@graph']) return triples;

  jsonld['@graph'].forEach((node: any) => {
    if (!node || typeof node !== 'object') return;
    extractNodeTriples(node, triples);
  });

  return triples;
}

/**
 * Extract triples from a node
 */
function extractNodeTriples(node: any, triples: RDFTriple[], parentSubject?: string) {
  const subject = node['@id'] || parentSubject;
  if (!subject) return;

  // Type triple
  if (node['@type']) {
    triples.push({
      subject,
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      object: { value: expandType(node['@type']), type: 'uri' }
    });
  }

  // Property triples
  Object.keys(node).forEach(prop => {
    if (prop === '@id' || prop === '@type' || prop === '@context') return;

    const expandedProp = expandProperty(prop);
    const value = node[prop];

    if (Array.isArray(value)) {
      value.forEach(v => addTriple(subject, expandedProp, v, triples));
    } else {
      addTriple(subject, expandedProp, value, triples);
    }
  });
}

/**
 * Add a triple
 */
function addTriple(subject: string, predicate: string, value: any, triples: RDFTriple[]) {
  if (typeof value === 'object' && value !== null) {
    if (value['@id']) {
      // URI reference
      triples.push({
        subject,
        predicate,
        object: { value: value['@id'], type: 'uri' }
      });
    } else if (value['@value'] !== undefined) {
      // Typed literal
      triples.push({
        subject,
        predicate,
        object: {
          value: String(value['@value']),
          type: 'literal',
          datatype: value['@type'] || 'http://www.w3.org/2001/XMLSchema#string'
        }
      });
    } else {
      // Nested blank node - generate blank node ID
      const blankNode = `_:b${Math.random().toString(36).substr(2, 9)}`;
      triples.push({
        subject,
        predicate,
        object: { value: blankNode, type: 'uri' }
      });
      extractNodeTriples(value, triples, blankNode);
    }
  } else if (typeof value === 'string') {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      triples.push({
        subject,
        predicate,
        object: { value, type: 'uri' }
      });
    } else {
      triples.push({
        subject,
        predicate,
        object: { value, type: 'literal' }
      });
    }
  } else {
    triples.push({
        subject,
        predicate,
        object: { value: String(value), type: 'literal' }
      });
  }
}

/**
 * Expand type to full URI
 */
function expandType(type: string): string {
  if (type.startsWith('http://')) return type;
  if (type.startsWith('bf:')) {
    return 'http://id.loc.gov/ontologies/bibframe/' + type.substring(3);
  }
  return type;
}

/**
 * Expand property to full URI
 */
function expandProperty(prop: string): string {
  if (prop.startsWith('http://')) return prop;
  if (prop.startsWith('bf:')) {
    return 'http://id.loc.gov/ontologies/bibframe/' + prop.substring(3);
  }
  if (prop.startsWith('rdfs:')) {
    return 'http://www.w3.org/2000/01/rdf-schema#' + prop.substring(5);
  }
  if (prop.startsWith('rdf:')) {
    return 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' + prop.substring(4);
  }
  return prop;
}

/**
 * Validate graph connectivity
 */
export function validateGraphConnectivity(jsonld: any): { connected: boolean; orphans: string[] } {
  if (!jsonld['@graph']) {
    return { connected: false, orphans: [] };
  }

  const graph = jsonld['@graph'];
  const nodeIds = new Set(graph.filter((n: any) => n && typeof n === 'object').map((n: any) => n['@id']).filter(Boolean));
  const referencedIds = new Set<string>();
  const orphans: string[] = [];

  // Collect all referenced IDs
  graph.forEach((node: any) => {
    if (!node || typeof node !== 'object') return;
    Object.values(node).forEach(value => {
      collectReferences(value, referencedIds);
    });
  });

  // Find orphans (nodes not referenced by others)
  // Except for the root Work node
  const work = graph.find((n: any) => n['@type'] === 'bf:Work');
  nodeIds.forEach(id => {
    if (id !== work?.['@id'] && !referencedIds.has(id)) {
      orphans.push(id);
    }
  });

  return {
    connected: orphans.length === 0,
    orphans
  };
}

/**
 * Collect all URI references
 */
function collectReferences(value: any, refs: Set<string>) {
  if (Array.isArray(value)) {
    value.forEach(v => collectReferences(v, refs));
  } else if (typeof value === 'object' && value !== null) {
    if (value['@id']) {
      refs.add(value['@id']);
    }
    Object.values(value).forEach(v => collectReferences(v, refs));
  }
}
/**
 * Escape XML special characters
 */
function escapeXml(str: any): string {
  if (typeof str !== 'string') str = String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Convert BIBFRAME JSON-LD record to W3C RDF/XML representation
 */
export function toRdfXml(jsonld: any): string {
  if (!jsonld) return '';
  const nodes = jsonld['@graph'] || (Array.isArray(jsonld) ? jsonld : [jsonld]);

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<rdf:RDF\n';
  xml += '  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n';
  xml += '  xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"\n';
  xml += '  xmlns:bf="http://id.loc.gov/ontologies/bibframe/"\n';
  xml += '  xmlns:bflc="http://id.loc.gov/ontologies/bflc/"\n';
  xml += '  xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"\n';
  xml += '  xmlns:xsd="http://www.w3.org/2001/XMLSchema#">\n\n';

  function serializeValue(key: string, val: any, indent: string = '    '): string {
    let out = '';
    const cleanKey = key.startsWith('http') ? key.split(/[\/#]/).pop() || key : key;
    const tag = cleanKey.includes(':') ? cleanKey : `bf:${cleanKey}`;

    if (Array.isArray(val)) {
      for (const item of val) {
        out += serializeValue(key, item, indent);
      }
      return out;
    }

    if (val === null || val === undefined) return '';

    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      out += `${indent}<${tag}>${escapeXml(val)}</${tag}>\n`;
      return out;
    }

    if (typeof val === 'object') {
      if (val['@value'] !== undefined) {
        const langAttr = val['@language'] ? ` xml:lang="${escapeXml(val['@language'])}"` : '';
        const typeAttr = val['@type'] ? ` rdf:datatype="${escapeXml(val['@type'])}"` : '';
        out += `${indent}<${tag}${langAttr}${typeAttr}>${escapeXml(val['@value'])}</${tag}>\n`;
        return out;
      }

      if (val['@id'] && Object.keys(val).length === 1) {
        out += `${indent}<${tag} rdf:resource="${escapeXml(val['@id'])}"/>\n`;
        return out;
      }

      const innerType = val['@type'] || (tag.startsWith('bf:') ? tag.slice(3) : 'Description');
      const innerTag = innerType.includes(':') ? innerType : `bf:${innerType}`;
      const aboutAttr = val['@id'] ? ` rdf:about="${escapeXml(val['@id'])}"` : '';

      out += `${indent}<${tag}>\n`;
      out += `${indent}  <${innerTag}${aboutAttr}>\n`;
      for (const subKey of Object.keys(val)) {
        if (subKey === '@id' || subKey === '@type') continue;
        out += serializeValue(subKey, val[subKey], indent + '    ');
      }
      out += `${indent}  </${innerTag}>\n`;
      out += `${indent}</${tag}>\n`;
    }
    return out;
  }

  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue;
    const nodeType = node['@type'] || 'bf:Description';
    const tag = nodeType.includes(':') ? nodeType : `bf:${nodeType}`;
    const aboutAttr = node['@id'] ? ` rdf:about="${escapeXml(node['@id'])}"` : '';

    xml += `  <${tag}${aboutAttr}>\n`;
    for (const key of Object.keys(node)) {
      if (key === '@id' || key === '@type' || key === '@context') continue;
      xml += serializeValue(key, node[key], '    ');
    }
    xml += `  </${tag}>\n\n`;
  }

  xml += '</rdf:RDF>\n';
  return xml;
}
