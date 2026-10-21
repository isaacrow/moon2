/**
 * 🧠 RDF Graph Store - Graph-Centric State Management
 * Replaces flat form state with true RDF graph model
 */

export interface RDFNode {
  '@id': string;
  '@type': string | string[];
  [key: string]: any;
}

export interface RDFTriple {
  subject: string;
  predicate: string;
  object: string | RDFNode;
  objectType: 'URI' | 'Literal' | 'BlankNode';
}

export class GraphStore {
  private nodes: Map<string, RDFNode> = new Map();
  private triples: RDFTriple[] = [];

  constructor() {}

  /**
   * Add or update a node in the graph
   */
  setNode(uri: string, node: RDFNode): void {
    this.nodes.set(uri, { ...node, '@id': uri });
  }

  /**
   * Get a node from the graph
   */
  getNode(uri: string): RDFNode | undefined {
    return this.nodes.get(uri);
  }

  /**
   * Get all nodes of a specific type
   */
  getNodesByType(type: string): RDFNode[] {
    return Array.from(this.nodes.values()).filter(node => {
      const nodeType = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      return nodeType.includes(type);
    });
  }

  /**
   * Add a property to a node
   */
  setProperty(nodeUri: string, property: string, value: any): void {
    const node = this.nodes.get(nodeUri);
    if (!node) {
      throw new Error(`Node ${nodeUri} not found`);
    }
    node[property] = value;
  }

  /**
   * Get a property from a node
   */
  getProperty(nodeUri: string, property: string): any {
    const node = this.nodes.get(nodeUri);
    return node ? node[property] : undefined;
  }

  /**
   * Add a triple to the graph
   */
  addTriple(triple: RDFTriple): void {
    this.triples.push(triple);
  }

  /**
   * Get all triples
   */
  getTriples(): RDFTriple[] {
    return [...this.triples];
  }

  /**
   * Get triples where subject matches
   */
  getTriplesBySubject(subject: string): RDFTriple[] {
    return this.triples.filter(t => t.subject === subject);
  }

  /**
   * Get triples where predicate matches
   */
  getTriplesByPredicate(predicate: string): RDFTriple[] {
    return this.triples.filter(t => t.predicate === predicate);
  }

  /**
   * Link two nodes with a predicate
   */
  linkNodes(subjectUri: string, predicate: string, objectUri: string): void {
    this.addTriple({
      subject: subjectUri,
      predicate,
      object: objectUri,
      objectType: 'URI'
    });

    // Also update the node's property
    const subject = this.nodes.get(subjectUri);
    if (subject) {
      subject[predicate] = { '@id': objectUri };
    }
  }

  /**
   * Create automatic WEMI links
   * Work → Expression → Instance → Item
   */
  createWEMILinks(workUri: string, expressionUri?: string, instanceUri?: string, itemUri?: string): void {
    if (expressionUri) {
      // Work → hasExpression → Expression
      this.linkNodes(workUri, 'bf:hasExpression', expressionUri);
      // Expression → expressionOf → Work
      this.linkNodes(expressionUri, 'bf:expressionOf', workUri);

      if (instanceUri) {
        // Expression → hasInstance → Instance
        this.linkNodes(expressionUri, 'bf:hasInstance', instanceUri);
        // Instance → instanceOf → Expression
        this.linkNodes(instanceUri, 'bf:instanceOf', expressionUri);
      }
    } else if (instanceUri) {
      // Work → hasInstance → Instance
      this.linkNodes(workUri, 'bf:hasInstance', instanceUri);
      // Instance → instanceOf → Work
      this.linkNodes(instanceUri, 'bf:instanceOf', workUri);
    }

    if (itemUri && instanceUri) {
      // Instance → hasItem → Item (implicit)
      // Item → itemOf → Instance
      this.linkNodes(itemUri, 'bf:itemOf', instanceUri);
    }
  }

  /**
   * Export to JSON-LD format
   */
  toJsonLd(context?: any): any {
    const graph = Array.from(this.nodes.values());
    
    return {
      '@context': context || {
        'bf': 'http://id.loc.gov/ontologies/bibframe/',
        'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
        'xsd': 'http://www.w3.org/2001/XMLSchema#'
      },
      '@graph': graph
    };
  }

  /**
   * Import from JSON-LD
   */
  fromJsonLd(jsonld: any): void {
    this.nodes.clear();
    this.triples = [];

    const graph = jsonld['@graph'] || [jsonld];
    
    graph.forEach((node: RDFNode) => {
      if (node['@id']) {
        this.setNode(node['@id'], node);
      }
    });
  }

  /**
   * Validate graph structure
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check that all instances have instanceOf
    const instances = this.getNodesByType('bf:Instance');
    instances.forEach(instance => {
      if (!instance['bf:instanceOf']) {
        errors.push(`Instance ${instance['@id']} missing bf:instanceOf`);
      }
    });

    // Check that all items have itemOf
    const items = this.getNodesByType('bf:Item');
    items.forEach(item => {
      if (!item['bf:itemOf']) {
        errors.push(`Item ${item['@id']} missing bf:itemOf`);
      }
    });

    // Check that all expressions have expressionOf
    const expressions = this.getNodesByType('bf:Expression');
    expressions.forEach(expr => {
      if (!expr['bf:expressionOf']) {
        errors.push(`Expression ${expr['@id']} missing bf:expressionOf`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Clear the entire graph
   */
  clear(): void {
    this.nodes.clear();
    this.triples = [];
  }

  /**
   * Get graph statistics
   */
  getStats(): { nodeCount: number; tripleCount: number; types: Record<string, number> } {
    const types: Record<string, number> = {};
    
    this.nodes.forEach(node => {
      const nodeTypes = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      nodeTypes.forEach(type => {
        types[type] = (types[type] || 0) + 1;
      });
    });

    return {
      nodeCount: this.nodes.size,
      tripleCount: this.triples.length,
      types
    };
  }

  /**
   * Clone the graph
   */
  clone(): GraphStore {
    const newStore = new GraphStore();
    newStore.nodes = new Map(this.nodes);
    newStore.triples = [...this.triples];
    return newStore;
  }
}
