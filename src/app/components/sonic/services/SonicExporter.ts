/**
 * Sonic Exporter
 * 
 * Exports BIBFRAME entities to valid JSON-LD
 * 
 * Features:
 * - Valid @context object with all required prefixes
 * - Proper @graph structure
 * - No internal "quads" or implementation details
 * - Consistent IRI format (no mixing compact and expanded)
 * - Arrays for repeatable properties
 * - Proper @id references for linked nodes
 * - JSON-LD 1.1 compliant
 * 
 * @version 1.0.0
 */

import { SonicGraphBuilder } from './SonicGraphBuilder';
import type { BF3Work, BF3Instance, BF3Graph } from '../types/bibframe3';

export class SonicExporter {
  private graphBuilder: SonicGraphBuilder;

  constructor() {
    this.graphBuilder = new SonicGraphBuilder();
  }

  /**
   * Export to JSON-LD with @graph structure
   */
  exportToJsonLD(work: BF3Work, instance: BF3Instance): BF3Graph {
    const graph = this.graphBuilder.buildGraph(work, instance);
    
    // Clean the graph - remove any internal properties
    const cleanedGraph = this.cleanGraph(graph);
    
    return cleanedGraph;
  }

  /**
   * Clean graph of any non-standard properties
   */
  private cleanGraph(graph: BF3Graph): BF3Graph {
    return {
      '@context': graph['@context'],
      '@graph': graph['@graph'].map(node => this.cleanNode(node))
    };
  }

  /**
   * Clean individual node
   */
  private cleanNode(node: any): any {
    const cleaned: any = {};

    // Always include @id and @type
    if (node['@id']) {
      cleaned['@id'] = node['@id'];
    }

    if (node['@type']) {
      // Ensure @type is not an array if single value
      const type = node['@type'];
      cleaned['@type'] = Array.isArray(type) && type.length === 1 ? type[0] : type;
    }

    // Copy all BIBFRAME properties (bf:, rdfs:, rdf:, etc.)
    for (const [key, value] of Object.entries(node)) {
      if (key === '@id' || key === '@type') continue;
      
      // Only include standard BIBFRAME/RDF properties
      if (this.isStandardProperty(key)) {
        cleaned[key] = this.cleanValue(value);
      }
    }

    return cleaned;
  }

  /**
   * Clean value (recurse if needed)
   */
  private cleanValue(value: any): any {
    if (Array.isArray(value)) {
      return value.map(v => this.cleanValue(v));
    }

    if (typeof value === 'object' && value !== null) {
      // If it's a reference object with only @id, keep as-is
      if (Object.keys(value).length === 1 && value['@id']) {
        return { '@id': value['@id'] };
      }

      // Otherwise clean the nested object
      return this.cleanNode(value);
    }

    return value;
  }

  /**
   * Check if property is standard BIBFRAME/RDF property
   */
  private isStandardProperty(property: string): boolean {
    const standardPrefixes = [
      'bf:',
      'bflc:',
      'rdf:',
      'rdfs:',
      'xsd:',
      'skos:',
      'mads:',
      'owl:',
      'dcterms:',
      'foaf:'
    ];

    return standardPrefixes.some(prefix => property.startsWith(prefix));
  }

  /**
   * Validate JSON-LD output
   */
  validateJsonLD(jsonld: BF3Graph): boolean {
    try {
      // Check required structure
      if (!jsonld['@context']) {
        console.error('Missing @context');
        return false;
      }

      if (!jsonld['@graph'] || !Array.isArray(jsonld['@graph'])) {
        console.error('Missing or invalid @graph');
        return false;
      }

      // Check @context has required prefixes
      const context = jsonld['@context'];
      const requiredPrefixes = ['bf', 'rdf', 'rdfs'];
      
      for (const prefix of requiredPrefixes) {
        if (!context[prefix as keyof typeof context]) {
          console.error(`Missing required prefix: ${prefix}`);
          return false;
        }
      }

      // Check all nodes have @id and @type
      for (const node of jsonld['@graph']) {
        if (!node['@id']) {
          console.error('Node missing @id:', node);
          return false;
        }

        if (!node['@type']) {
          console.error('Node missing @type:', node);
          return false;
        }
      }

      // Validate no duplicate @id values
      const ids = new Set<string>();
      for (const node of jsonld['@graph']) {
        if (ids.has(node['@id'])) {
          console.error('Duplicate @id:', node['@id']);
          return false;
        }
        ids.add(node['@id']);
      }

      return true;

    } catch (error) {
      console.error('JSON-LD validation error:', error);
      return false;
    }
  }

  /**
   * Export as compact JSON-LD (no @graph, embedded nodes)
   */
  exportToCompact(work: BF3Work, instance: BF3Instance): any {
    const graph = this.exportToJsonLD(work, instance);
    
    // Find root nodes
    const workNode = graph['@graph'].find(n => n['@type'].includes('Work'));
    const instanceNode = graph['@graph'].find(n => n['@type'].includes('Instance'));

    return {
      '@context': graph['@context'],
      work: workNode,
      instance: instanceNode
    };
  }

  /**
   * Export as Turtle (RDF/Turtle format)
   */
  exportToTurtle(work: BF3Work, instance: BF3Instance): string {
    const graph = this.exportToJsonLD(work, instance);
    const context = graph['@context'];

    let turtle = '';

    // Add prefix declarations
    turtle += `@prefix bf: <${context.bf}> .\n`;
    turtle += `@prefix rdf: <${context.rdf}> .\n`;
    turtle += `@prefix rdfs: <${context.rdfs}> .\n`;
    turtle += `@prefix xsd: <${context.xsd}> .\n\n`;

    // Convert each node to Turtle triples
    for (const node of graph['@graph']) {
      turtle += this.nodeToTurtle(node);
      turtle += '\n';
    }

    return turtle;
  }

  /**
   * Convert node to Turtle format
   */
  private nodeToTurtle(node: any): string {
    const subject = `<${node['@id']}>`;
    let triples = '';

    // rdf:type
    if (node['@type']) {
      const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      for (const type of types) {
        triples += `${subject} rdf:type ${type} ;\n`;
      }
    }

    // Other properties
    for (const [predicate, object] of Object.entries(node)) {
      if (predicate === '@id' || predicate === '@type') continue;

      const objects = Array.isArray(object) ? object : [object];
      
      for (const obj of objects) {
        const objectStr = this.valueToTurtle(obj);
        triples += `    ${predicate} ${objectStr} ;\n`;
      }
    }

    // Remove last semicolon and add period
    if (triples.endsWith(';\n')) {
      triples = triples.slice(0, -2) + ' .\n';
    }

    return triples;
  }

  /**
   * Convert value to Turtle format
   */
  private valueToTurtle(value: any): string {
    if (typeof value === 'string') {
      return `"${value}"`;
    }

    if (typeof value === 'object' && value !== null) {
      if (value['@id']) {
        return `<${value['@id']}>`;
      }

      if (value['@value']) {
        const literal = `"${value['@value']}"`;
        if (value['@language']) {
          return `${literal}@${value['@language']}`;
        }
        if (value['@type']) {
          return `${literal}^^${value['@type']}`;
        }
        return literal;
      }
    }

    return String(value);
  }

  /**
   * Export as RDF/XML
   */
  exportToRDFXML(work: BF3Work, instance: BF3Instance): string {
    const graph = this.exportToJsonLD(work, instance);
    const context = graph['@context'];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rdf:RDF\n';
    xml += '    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n';
    xml += '    xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"\n';
    xml += `    xmlns:bf="${context.bf}"\n`;
    xml += `    xmlns:xsd="${context.xsd}">\n\n`;

    for (const node of graph['@graph']) {
      xml += this.nodeToRDFXML(node);
    }

    xml += '</rdf:RDF>';

    return xml;
  }

  /**
   * Convert node to RDF/XML
   */
  private nodeToRDFXML(node: any): string {
    const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
    const mainType = types[0];
    
    let xml = `  <${mainType} rdf:about="${node['@id']}">\n`;

    for (const [predicate, object] of Object.entries(node)) {
      if (predicate === '@id' || predicate === '@type') continue;

      const objects = Array.isArray(object) ? object : [object];
      
      for (const obj of objects) {
        xml += `    <${predicate}`;
        
        if (typeof obj === 'object' && obj['@id']) {
          xml += ` rdf:resource="${obj['@id']}"`;
          xml += '/>\n';
        } else if (typeof obj === 'string') {
          xml += `>${obj}</${predicate}>\n`;
        } else {
          xml += `>${JSON.stringify(obj)}</${predicate}>\n`;
        }
      }
    }

    xml += `  </${mainType}>\n\n`;

    return xml;
  }
}
