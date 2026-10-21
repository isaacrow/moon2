/**
 * 🔄 RDF Exporter
 * Convert JSON-LD to Turtle format
 */

/**
 * Convert JSON-LD to Turtle
 */
export function toTurtle(jsonld: any): string {
  const lines: string[] = [];
  
  // Prefixes
  const context = jsonld['@context'] || {
    'bf': 'http://id.loc.gov/ontologies/bibframe/',
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    'xsd': 'http://www.w3.org/2001/XMLSchema#'
  };

  // Write prefixes
  Object.entries(context).forEach(([prefix, uri]) => {
    if (typeof uri === 'string') {
      lines.push(`@prefix ${prefix}: <${uri}> .`);
    }
  });
  lines.push('');

  // Process graph
  const graph = jsonld['@graph'] || [jsonld];

  graph.forEach((node: any) => {
    if (!node['@id']) return;

    // Subject
    const subject = formatUri(node['@id']);
    lines.push(`${subject}`);

    // Type
    if (node['@type']) {
      const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      types.forEach(type => {
        lines.push(`  a ${formatUri(type)} ;`);
      });
    }

    // Properties
    const props = Object.entries(node).filter(([key]) => 
      key !== '@id' && key !== '@type'
    );

    props.forEach(([predicate, value], idx) => {
      const isLast = idx === props.length - 1;
      const predicateUri = formatUri(predicate);
      const objectStr = formatValue(value);
      
      lines.push(`  ${predicateUri} ${objectStr} ${isLast ? '.' : ';'}`);
    });

    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Format URI for Turtle
 */
function formatUri(uri: string): string {
  // Check for prefixes
  if (uri.startsWith('http://id.loc.gov/ontologies/bibframe/')) {
    return `bf:${uri.replace('http://id.loc.gov/ontologies/bibframe/', '')}`;
  }
  if (uri.startsWith('http://www.w3.org/1999/02/22-rdf-syntax-ns#')) {
    return `rdf:${uri.replace('http://www.w3.org/1999/02/22-rdf-syntax-ns#', '')}`;
  }
  if (uri.startsWith('http://www.w3.org/2000/01/rdf-schema#')) {
    return `rdfs:${uri.replace('http://www.w3.org/2000/01/rdf-schema#', '')}`;
  }
  
  return `<${uri}>`;
}

/**
 * Format value for Turtle
 */
function formatValue(value: any): string {
  // URI reference
  if (typeof value === 'object' && value['@id']) {
    return formatUri(value['@id']);
  }

  // Literal with type
  if (typeof value === 'object' && value['@value']) {
    const literal = value['@value'];
    const datatype = value['@type'];
    
    if (datatype) {
      return `"${escapeString(literal)}"^^${formatUri(datatype)}`;
    }
    
    return `"${escapeString(literal)}"`;
  }

  // Array
  if (Array.isArray(value)) {
    return value.map(v => formatValue(v)).join(', ');
  }

  // Blank node (nested object)
  if (typeof value === 'object') {
    const props = Object.entries(value)
      .filter(([key]) => key !== '@type')
      .map(([key, val]) => `${formatUri(key)} ${formatValue(val)}`)
      .join(' ; ');
    
    return `[ ${props} ]`;
  }

  // Plain literal
  return `"${escapeString(String(value))}"`;
}

/**
 * Escape special characters in strings
 */
function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
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
 * Convert JSON-LD to W3C RDF/XML format
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

  function serializeNode(node: any): string {
    const type = node['@type'] || 'bf:Work';
    const idAttr = node['@id'] ? ` rdf:about="${escapeXml(node['@id'])}"` : '';
    let out = `  <${type}${idAttr}>\n`;

    for (const [key, val] of Object.entries(node)) {
      if (key === '@id' || key === '@type' || key === '@context') continue;
      const tag = key.includes(':') ? key : `bf:${key}`;
      if (Array.isArray(val)) {
        for (const item of val) {
          if (typeof item === 'object' && item !== null) {
            if (item['@id'] && Object.keys(item).length === 1) {
              out += `    <${tag} rdf:resource="${escapeXml(item['@id'])}" />\n`;
            } else {
              out += `    <${tag}>\n      ${serializeNode(item).trim()}\n    </${tag}>\n`;
            }
          } else {
            out += `    <${tag}>${escapeXml(item)}</${tag}>\n`;
          }
        }
      } else if (typeof val === 'object' && val !== null) {
        if (val['@id'] && Object.keys(val).length === 1) {
          out += `    <${tag} rdf:resource="${escapeXml(val['@id'])}" />\n`;
        } else {
          out += `    <${tag}>\n      ${serializeNode(val).trim()}\n    </${tag}>\n`;
        }
      } else {
        out += `    <${tag}>${escapeXml(val)}</${tag}>\n`;
      }
    }
    out += `  </${type}>\n`;
    return out;
  }

  for (const node of nodes) {
    xml += serializeNode(node);
  }
  xml += '</rdf:RDF>';
  return xml;
}

