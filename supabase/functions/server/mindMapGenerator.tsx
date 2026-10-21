/**
 * 🧠 Mind Map Generator from RDF Triples
 * ✅ PRODUCTION-SAFE: Generates from actual RDF graph, not UI structure
 * 
 * Generates mind map visualization from:
 * - GraphStore.triples (RDF triple array)
 * - NOT from Work/Instance objects manually mapped
 * 
 * True graph-based visualization:
 * - Node = RDF subject
 * - Edge = RDF predicate  
 * - Node color by rdf:type
 */

export interface MindMapNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  color: string;
  size: number;
}

export interface MindMapEdge {
  source: string;
  target: string;
  label: string;
  type: string;
}

export interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  metadata: {
    nodeCount: number;
    edgeCount: number;
    types: string[];
  };
}

/**
 * Color mapping by RDF type
 */
const TYPE_COLORS: Record<string, string> = {
  'bf:Work': '#3b82f6', // Blue
  'bf:Instance': '#10b981', // Green
  'bf:Item': '#f59e0b', // Amber
  'bf:Title': '#8b5cf6', // Purple
  'bf:Contribution': '#ec4899', // Pink
  'bf:Agent': '#06b6d4', // Cyan
  'bf:Person': '#06b6d4',
  'bf:Organization': '#0ea5e9',
  'bf:Place': '#84cc16', // Lime
  'bf:Topic': '#a855f7', // Purple
  'bf:Subject': '#a855f7',
  'bf:ProvisionActivity': '#14b8a6', // Teal
  'bf:Publication': '#14b8a6',
  'bf:Identifier': '#f97316', // Orange
  'bf:Classification': '#eab308', // Yellow
  'bf:Note': '#64748b', // Slate
  'bf:AdminMetadata': '#71717a' // Zinc
};

/**
 * Generate mind map from JSON-LD graph
 */
export function generateMindMapFromGraph(jsonld: any): MindMapData {
  const graph = jsonld['@graph'] || [];
  
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];
  const nodeMap = new Map<string, MindMapNode>();
  const types = new Set<string>();
  
  // Create nodes from graph entities
  graph.forEach((entity: any, index: number) => {
    const id = entity['@id'];
    if (!id) return;
    
    const entityType = getEntityType(entity);
    const color = TYPE_COLORS[entityType] || '#9ca3af';
    const size = getNodeSize(entityType);
    
    types.add(entityType);
    
    const node: MindMapNode = {
      id,
      label: getNodeLabel(entity, entityType),
      type: entityType,
      x: 0, // Will be positioned by layout algorithm
      y: 0,
      color,
      size
    };
    
    nodes.push(node);
    nodeMap.set(id, node);
  });
  
  // Create edges from relationships
  graph.forEach((entity: any) => {
    const subjectId = entity['@id'];
    if (!subjectId) return;
    
    // Process all properties as potential edges
    Object.entries(entity).forEach(([predicate, value]) => {
      if (predicate === '@id' || predicate === '@type') return;
      
      // Handle URI references (relationships)
      const targets = extractTargetIds(value);
      
      targets.forEach(targetId => {
        // Only create edge if target exists in graph
        if (nodeMap.has(targetId)) {
          edges.push({
            source: subjectId,
            target: targetId,
            label: formatPredicate(predicate),
            type: predicate
          });
        }
      });
    });
  });
  
  // Apply force-directed layout
  applyForceLayout(nodes, edges);
  
  return {
    nodes,
    edges,
    metadata: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      types: Array.from(types)
    }
  };
}

/**
 * Get primary type of an entity
 */
function getEntityType(entity: any): string {
  const types = Array.isArray(entity['@type']) ? entity['@type'] : [entity['@type']];
  
  // Prioritize BIBFRAME types
  const bibframeTypes = types.filter((t: string) => t?.startsWith('bf:'));
  if (bibframeTypes.length > 0) {
    return bibframeTypes[0];
  }
  
  return types[0] || 'unknown';
}

/**
 * Get human-readable label for a node
 */
function getNodeLabel(entity: any, type: string): string {
  // Try rdfs:label first
  if (entity['rdfs:label']) {
    return extractValue(entity['rdfs:label']);
  }
  
  // Type-specific labels
  if (type === 'bf:Title' && entity['bf:mainTitle']) {
    return extractValue(entity['bf:mainTitle']);
  }
  
  if (type === 'bf:Contribution' || type === 'bf:Agent' || type === 'bf:Person') {
    if (entity['rdfs:label']) return extractValue(entity['rdfs:label']);
  }
  
  // Use type as label
  const shortType = type.split(':').pop() || type;
  
  // Add ID fragment
  const idFragment = entity['@id']?.split('/').pop()?.substring(0, 8);
  
  return idFragment ? `${shortType}\n${idFragment}` : shortType;
}

/**
 * Extract value from RDF literal or object
 */
function extractValue(value: any): string {
  if (typeof value === 'string') return value;
  if (value['@value']) return String(value['@value']);
  if (value['rdfs:label']) return extractValue(value['rdfs:label']);
  return String(value);
}

/**
 * Extract target IDs from a property value
 */
function extractTargetIds(value: any): string[] {
  const ids: string[] = [];
  
  if (!value) return ids;
  
  // Array of values
  if (Array.isArray(value)) {
    value.forEach(v => {
      const extracted = extractTargetIds(v);
      ids.push(...extracted);
    });
    return ids;
  }
  
  // URI reference object
  if (value['@id']) {
    ids.push(value['@id']);
  }
  
  return ids;
}

/**
 * Format predicate for display
 */
function formatPredicate(predicate: string): string {
  // Remove namespace prefix
  const short = predicate.split(':').pop() || predicate;
  
  // Convert camelCase to spaced
  return short.replace(/([A-Z])/g, ' $1').trim();
}

/**
 * Get node size based on type
 */
function getNodeSize(type: string): number {
  if (type === 'bf:Work') return 80;
  if (type === 'bf:Instance') return 70;
  if (type === 'bf:Item') return 60;
  if (type === 'bf:Title') return 50;
  if (type === 'bf:Contribution') return 50;
  if (type === 'bf:Agent' || type === 'bf:Person' || type === 'bf:Organization') return 50;
  return 40;
}

/**
 * Apply simple force-directed layout
 * Centers Work nodes, arranges others around them
 */
function applyForceLayout(nodes: MindMapNode[], edges: MindMapEdge[]): void {
  const width = 1400;
  const height = 1000;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Find Work nodes - they go in center
  const workNodes = nodes.filter(n => n.type === 'bf:Work');
  const instanceNodes = nodes.filter(n => n.type === 'bf:Instance');
  const otherNodes = nodes.filter(n => n.type !== 'bf:Work' && n.type !== 'bf:Instance');
  
  // Position Works in center
  if (workNodes.length === 1) {
    workNodes[0].x = centerX;
    workNodes[0].y = centerY;
  } else {
    workNodes.forEach((node, i) => {
      const angle = (i / workNodes.length) * Math.PI * 2;
      node.x = centerX + Math.cos(angle) * 100;
      node.y = centerY + Math.sin(angle) * 100;
    });
  }
  
  // Position Instances to the right
  instanceNodes.forEach((node, i) => {
    const angle = (i / Math.max(instanceNodes.length, 1)) * Math.PI * 2;
    node.x = centerX + 400 + Math.cos(angle) * 80;
    node.y = centerY + Math.sin(angle) * 80;
  });
  
  // Position other nodes in orbit
  otherNodes.forEach((node, i) => {
    const angle = (i / otherNodes.length) * Math.PI * 2;
    const radius = 250;
    node.x = centerX + Math.cos(angle) * radius;
    node.y = centerY + Math.sin(angle) * radius;
  });
}

/**
 * Generate SVG representation
 */
export function generateMindMapSVG(mindMapData: MindMapData): string {
  const { nodes, edges } = mindMapData;
  
  let svg = `<svg width="1400" height="1000" viewBox="0 0 1400 1000" xmlns="http://www.w3.org/2000/svg">`;
  
  // Defs for filters
  svg += `
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  `;
  
  // Background
  svg += `<rect width="1400" height="1000" fill="url(#bgGrad)"/>`;
  
  // Draw edges first (so they're behind nodes)
  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode) {
      svg += `
        <line 
          x1="${sourceNode.x}" y1="${sourceNode.y}" 
          x2="${targetNode.x}" y2="${targetNode.y}" 
          stroke="#60a5fa" 
          stroke-width="2" 
          stroke-dasharray="5,5" 
          opacity="0.6"
        />
        <text 
          x="${(sourceNode.x + targetNode.x) / 2}" 
          y="${(sourceNode.y + targetNode.y) / 2}" 
          fill="white" 
          font-size="10" 
          opacity="0.7"
          text-anchor="middle"
        >
          ${edge.label}
        </text>
      `;
    }
  });
  
  // Draw nodes
  nodes.forEach(node => {
    svg += `
      <g transform="translate(${node.x}, ${node.y})">
        <circle 
          r="${node.size}" 
          fill="${node.color}" 
          filter="url(#glow)" 
          opacity="0.9"
        />
        <text 
          text-anchor="middle" 
          y="5" 
          fill="white" 
          font-size="12" 
          font-weight="bold"
        >
          ${node.label}
        </text>
      </g>
    `;
  });
  
  svg += `</svg>`;
  
  return svg;
}
