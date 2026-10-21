/**
 * BIBFRAME Relationship Manager
 * Manages Work-to-Work and Instance-to-Instance relationships
 * Builds connected graph structures
 */

export interface Relationship {
  id: string;
  type: RelationshipType;
  sourceUri: string;
  targetUri: string;
  label?: string;
  note?: string;
}

export type RelationshipType =
  // Work-to-Work relationships
  | 'relatedTo'
  | 'hasPart'
  | 'partOf'
  | 'precededBy'
  | 'succeededBy'
  | 'translationOf'
  | 'adaptationOf'
  | 'derivativeOf'
  | 'basedOn'
  | 'continuationOf'
  | 'absorbed'
  | 'absorbedBy'
  | 'split'
  | 'splitInto'
  | 'merged'
  | 'mergedWith'
  // Instance-to-Instance relationships
  | 'hasEquivalent'
  | 'electronicReproduction'
  | 'otherEdition'
  | 'accompaniedBy'
  | 'supplement'
  | 'supplementTo';

export const RELATIONSHIP_DEFINITIONS: Record<RelationshipType, {
  label: string;
  inverseLabel: string;
  description: string;
  domain: 'Work' | 'Instance' | 'Both';
  bibframeProperty: string;
}> = {
  // Work Relationships
  relatedTo: {
    label: 'Related to',
    inverseLabel: 'Related to',
    description: 'General relationship to another resource',
    domain: 'Both',
    bibframeProperty: 'bf:relatedTo'
  },
  hasPart: {
    label: 'Has part',
    inverseLabel: 'Part of',
    description: 'Contains this resource as a component',
    domain: 'Both',
    bibframeProperty: 'bf:hasPart'
  },
  partOf: {
    label: 'Part of',
    inverseLabel: 'Has part',
    description: 'Is a component of this resource',
    domain: 'Both',
    bibframeProperty: 'bf:partOf'
  },
  precededBy: {
    label: 'Preceded by',
    inverseLabel: 'Succeeded by',
    description: 'Earlier edition, version, or issue',
    domain: 'Both',
    bibframeProperty: 'bf:precededBy'
  },
  succeededBy: {
    label: 'Succeeded by',
    inverseLabel: 'Preceded by',
    description: 'Later edition, version, or issue',
    domain: 'Both',
    bibframeProperty: 'bf:succeededBy'
  },
  translationOf: {
    label: 'Translation of',
    inverseLabel: 'Translated as',
    description: 'Original work being translated',
    domain: 'Work',
    bibframeProperty: 'bf:translationOf'
  },
  adaptationOf: {
    label: 'Adaptation of',
    inverseLabel: 'Adapted as',
    description: 'Original work being adapted',
    domain: 'Work',
    bibframeProperty: 'bf:derivativeOf'
  },
  derivativeOf: {
    label: 'Derivative of',
    inverseLabel: 'Derived as',
    description: 'Source work for derivative',
    domain: 'Work',
    bibframeProperty: 'bf:derivativeOf'
  },
  basedOn: {
    label: 'Based on',
    inverseLabel: 'Basis for',
    description: 'Source material for this work',
    domain: 'Work',
    bibframeProperty: 'bf:basedOn'
  },
  continuationOf: {
    label: 'Continuation of',
    inverseLabel: 'Continued by',
    description: 'Continues this serial',
    domain: 'Work',
    bibframeProperty: 'bf:continuationOf'
  },
  absorbed: {
    label: 'Absorbed',
    inverseLabel: 'Absorbed by',
    description: 'Serial absorbed by this',
    domain: 'Work',
    bibframeProperty: 'bf:absorbed'
  },
  absorbedBy: {
    label: 'Absorbed by',
    inverseLabel: 'Absorbed',
    description: 'Serial that absorbed this',
    domain: 'Work',
    bibframeProperty: 'bf:absorbedBy'
  },
  split: {
    label: 'Split from',
    inverseLabel: 'Split into',
    description: 'Serial split from this',
    domain: 'Work',
    bibframeProperty: 'bf:splitInto'
  },
  splitInto: {
    label: 'Split into',
    inverseLabel: 'Split from',
    description: 'Serials resulting from split',
    domain: 'Work',
    bibframeProperty: 'bf:splitInto'
  },
  merged: {
    label: 'Merged with',
    inverseLabel: 'Merged with',
    description: 'Serial merged with this',
    domain: 'Work',
    bibframeProperty: 'bf:mergedToForm'
  },
  mergedWith: {
    label: 'Merged to form',
    inverseLabel: 'Formed from merger',
    description: 'Serial formed from merger',
    domain: 'Work',
    bibframeProperty: 'bf:mergedToForm'
  },

  // Instance Relationships
  hasEquivalent: {
    label: 'Has equivalent',
    inverseLabel: 'Equivalent to',
    description: 'Equivalent manifestation',
    domain: 'Instance',
    bibframeProperty: 'bf:hasEquivalent'
  },
  electronicReproduction: {
    label: 'Electronic reproduction',
    inverseLabel: 'Print version',
    description: 'Electronic version of print',
    domain: 'Instance',
    bibframeProperty: 'bf:electronicReproduction'
  },
  otherEdition: {
    label: 'Other edition',
    inverseLabel: 'Other edition',
    description: 'Different edition of same work',
    domain: 'Instance',
    bibframeProperty: 'bf:otherEdition'
  },
  accompaniedBy: {
    label: 'Accompanied by',
    inverseLabel: 'Accompanies',
    description: 'Accompanying material',
    domain: 'Instance',
    bibframeProperty: 'bf:accompaniedBy'
  },
  supplement: {
    label: 'Has supplement',
    inverseLabel: 'Supplement to',
    description: 'Supplementary material',
    domain: 'Instance',
    bibframeProperty: 'bf:hasPart'
  },
  supplementTo: {
    label: 'Supplement to',
    inverseLabel: 'Has supplement',
    description: 'Main resource',
    domain: 'Instance',
    bibframeProperty: 'bf:partOf'
  }
};

/**
 * Relationship Graph Manager
 */
export class RelationshipGraph {
  private relationships: Map<string, Relationship> = new Map();

  /**
   * Add a relationship
   */
  addRelationship(relationship: Relationship): void {
    this.relationships.set(relationship.id, relationship);
  }

  /**
   * Remove a relationship
   */
  removeRelationship(id: string): void {
    this.relationships.delete(id);
  }

  /**
   * Get all relationships
   */
  getAllRelationships(): Relationship[] {
    return Array.from(this.relationships.values());
  }

  /**
   * Get relationships for a resource
   */
  getRelationshipsForResource(uri: string): Relationship[] {
    return this.getAllRelationships().filter(
      r => r.sourceUri === uri || r.targetUri === uri
    );
  }

  /**
   * Get outgoing relationships
   */
  getOutgoingRelationships(uri: string): Relationship[] {
    return this.getAllRelationships().filter(r => r.sourceUri === uri);
  }

  /**
   * Get incoming relationships
   */
  getIncomingRelationships(uri: string): Relationship[] {
    return this.getAllRelationships().filter(r => r.targetUri === uri);
  }

  /**
   * Get relationships by type
   */
  getRelationshipsByType(type: RelationshipType): Relationship[] {
    return this.getAllRelationships().filter(r => r.type === type);
  }

  /**
   * Convert relationships to BIBFRAME triples
   */
  toTriples(): Array<{ subject: string; predicate: string; object: string }> {
    const triples: Array<{ subject: string; predicate: string; object: string }> = [];

    this.getAllRelationships().forEach(rel => {
      const definition = RELATIONSHIP_DEFINITIONS[rel.type];
      if (!definition) return;

      const predicateUri = definition.bibframeProperty.startsWith('bf:')
        ? `http://id.loc.gov/ontologies/bibframe/${definition.bibframeProperty.substring(3)}`
        : definition.bibframeProperty;

      triples.push({
        subject: rel.sourceUri,
        predicate: predicateUri,
        object: rel.targetUri
      });
    });

    return triples;
  }

  /**
   * Add relationships to JSON-LD graph
   */
  addToJsonLdGraph(graph: any[], relationships: Relationship[]): void {
    const nodeMap = new Map<string, any>();
    graph.forEach(node => {
      if (node['@id']) {
        nodeMap.set(node['@id'], node);
      }
    });

    relationships.forEach(rel => {
      const sourceNode = nodeMap.get(rel.sourceUri);
      if (!sourceNode) return;

      const definition = RELATIONSHIP_DEFINITIONS[rel.type];
      if (!definition) return;

      const property = definition.bibframeProperty;

      // Initialize property if doesn't exist
      if (!sourceNode[property]) {
        sourceNode[property] = [];
      }

      // Add relationship
      const relValue: any = { '@id': rel.targetUri };
      if (rel.label) {
        relValue['rdfs:label'] = rel.label;
      }
      if (rel.note) {
        relValue['bf:note'] = rel.note;
      }

      if (Array.isArray(sourceNode[property])) {
        sourceNode[property].push(relValue);
      } else {
        sourceNode[property] = [sourceNode[property], relValue];
      }
    });
  }

  /**
   * Validate relationship (check domain compatibility)
   */
  validateRelationship(
    relationship: Relationship,
    sourceType: 'Work' | 'Instance',
    targetType: 'Work' | 'Instance'
  ): { valid: boolean; error?: string } {
    const definition = RELATIONSHIP_DEFINITIONS[relationship.type];
    if (!definition) {
      return { valid: false, error: 'Unknown relationship type' };
    }

    // Check domain
    if (definition.domain !== 'Both' && definition.domain !== sourceType) {
      return {
        valid: false,
        error: `Relationship ${relationship.type} is only valid for ${definition.domain}`
      };
    }

    // Check that source and target are same type
    if (sourceType !== targetType) {
      return {
        valid: false,
        error: 'Source and target must be same type (Work-to-Work or Instance-to-Instance)'
      };
    }

    return { valid: true };
  }

  /**
   * Create inverse relationship
   */
  createInverseRelationship(relationship: Relationship): Relationship | null {
    const definition = RELATIONSHIP_DEFINITIONS[relationship.type];
    if (!definition) return null;

    // Find inverse type
    const inverseType = Object.entries(RELATIONSHIP_DEFINITIONS).find(
      ([type, def]) => def.label === definition.inverseLabel && type !== relationship.type
    )?.[0] as RelationshipType;

    if (!inverseType) return null;

    return {
      id: `${relationship.id}-inverse`,
      type: inverseType,
      sourceUri: relationship.targetUri,
      targetUri: relationship.sourceUri,
      label: relationship.label,
      note: relationship.note
    };
  }

  /**
   * Export to D3 graph format
   */
  toD3Graph(): { nodes: any[]; links: any[] } {
    const nodesMap = new Map<string, any>();
    const links: any[] = [];

    this.getAllRelationships().forEach(rel => {
      // Add nodes
      if (!nodesMap.has(rel.sourceUri)) {
        nodesMap.set(rel.sourceUri, {
          id: rel.sourceUri,
          label: rel.sourceUri.split('/').pop()
        });
      }
      if (!nodesMap.has(rel.targetUri)) {
        nodesMap.set(rel.targetUri, {
          id: rel.targetUri,
          label: rel.targetUri.split('/').pop()
        });
      }

      // Add link
      const definition = RELATIONSHIP_DEFINITIONS[rel.type];
      links.push({
        source: rel.sourceUri,
        target: rel.targetUri,
        type: rel.type,
        label: definition?.label || rel.type,
        note: rel.note
      });
    });

    return {
      nodes: Array.from(nodesMap.values()),
      links
    };
  }

  /**
   * Clear all relationships
   */
  clear(): void {
    this.relationships.clear();
  }

  /**
   * Import from JSON
   */
  importFromJson(json: string): void {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data)) {
        data.forEach((rel: Relationship) => this.addRelationship(rel));
      }
    } catch (error) {
      console.error('Failed to import relationships:', error);
    }
  }

  /**
   * Export to JSON
   */
  exportToJson(): string {
    return JSON.stringify(this.getAllRelationships(), null, 2);
  }
}

/**
 * Helper: Generate relationship ID
 */
export function generateRelationshipId(): string {
  return `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper: Get relationship types for domain
 */
export function getRelationshipTypesForDomain(domain: 'Work' | 'Instance'): RelationshipType[] {
  return Object.entries(RELATIONSHIP_DEFINITIONS)
    .filter(([_, def]) => def.domain === domain || def.domain === 'Both')
    .map(([type, _]) => type as RelationshipType);
}

/**
 * Helper: Format relationship label
 */
export function formatRelationshipLabel(type: RelationshipType): string {
  return RELATIONSHIP_DEFINITIONS[type]?.label || type;
}
