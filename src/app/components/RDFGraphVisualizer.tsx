/**
 * 🕸️ RDF Graph Visualizer
 * Real RDF triple visualization using D3.js force-directed graph
 * Shows subject-predicate-object relationships
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Loader2 } from 'lucide-react';

interface RDFTriple {
  subject: string;
  predicate: string;
  object: string;
  objectType: 'uri' | 'literal';
}

interface Node {
  id: string;
  label: string;
  type: 'uri' | 'literal';
  group: string;
}

interface Link {
  source: string;
  target: string;
  label: string;
}

interface RDFGraphVisualizerProps {
  triples: RDFTriple[];
  width?: number;
  height?: number;
}

export function RDFGraphVisualizer({ triples, width = 1200, height = 600 }: RDFGraphVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    if (!triples || triples.length === 0 || !svgRef.current) return;

    setRendering(true);

    // Build nodes and links from RDF triples
    const nodeMap = new Map<string, Node>();
    const links: Link[] = [];

    triples.forEach(triple => {
      // Add subject node
      if (!nodeMap.has(triple.subject)) {
        nodeMap.set(triple.subject, {
          id: triple.subject,
          label: compactURI(triple.subject),
          type: 'uri',
          group: getNodeGroup(triple.subject)
        });
      }

      // Add object node
      if (!nodeMap.has(triple.object)) {
        nodeMap.set(triple.object, {
          id: triple.object,
          label: compactURI(triple.object),
          type: triple.objectType,
          group: triple.objectType === 'literal' ? 'literal' : getNodeGroup(triple.object)
        });
      }

      // Add link
      links.push({
        source: triple.subject,
        target: triple.object,
        label: compactPredicate(triple.predicate)
      });
    });

    const nodes = Array.from(nodeMap.values());

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create container for zoom
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Define arrow markers for edges
    svg.append('defs').selectAll('marker')
      .data(['end'])
      .enter().append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#64b5f6');

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#64b5f6')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Create link labels
    const linkLabel = g.append('g')
      .selectAll('text')
      .data(links)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .attr('font-size', 10)
      .attr('fill', '#90caf9')
      .attr('text-anchor', 'middle')
      .text(d => d.label);

    // Create nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d: Node) => d.type === 'literal' ? 8 : 12)
      .attr('fill', (d: Node) => getNodeColor(d.group))
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .call(d3.drag<SVGCircleElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Add node labels
    const nodeLabel = g.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('font-size', 11)
      .attr('fill', '#e2e8f0')
      .attr('text-anchor', 'middle')
      .attr('dy', 25)
      .text((d: Node) => d.label.length > 30 ? d.label.substring(0, 30) + '...' : d.label);

    // Add tooltips
    node.append('title')
      .text((d: Node) => d.id);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabel
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      nodeLabel
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    setRendering(false);

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [triples, width, height]);

  if (!triples || triples.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] text-gray-400">
        <p>No triples to visualize. Save a record to generate RDF graph.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {rendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
          <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
        </div>
      )}
      <svg ref={svgRef} className="border border-slate-600 rounded-lg bg-slate-900" />
      <div className="mt-4 flex gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
          <span>bf:Work</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>bf:Instance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>bf:Item</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <span>Contribution/Agent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-500"></div>
          <span>Other/Literal</span>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function compactURI(uri: string): string {
  if (uri.includes('bibframe/Work')) return 'bf:Work';
  if (uri.includes('bibframe/Instance')) return 'bf:Instance';
  if (uri.includes('bibframe/Item')) return 'bf:Item';
  if (uri.includes('bibframe/Title')) return 'bf:Title';
  if (uri.includes('bibframe/Contribution')) return 'bf:Contribution';
  if (uri.includes('bibframe/Agent')) return 'bf:Agent';
  if (uri.includes('bibframe/Person')) return 'bf:Person';
  if (uri.includes('bibframe/Organization')) return 'bf:Organization';
  if (uri.includes('bibframe/')) return 'bf:' + uri.split('/').pop();
  if (uri.includes('viaf.org')) return 'VIAF:' + uri.split('/').pop();
  if (uri.includes('id.loc.gov/authorities')) return 'LC:' + uri.split('/').pop();
  if (uri.includes('wikidata.org')) return 'Wikidata:' + uri.split('/').pop();
  if (uri.includes('moon.org')) return 'moon:' + uri.split('/').pop();
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    const parts = uri.split('/');
    return parts[parts.length - 1] || uri;
  }
  return uri.length > 40 ? uri.substring(0, 40) + '...' : uri;
}

function compactPredicate(predicate: string): string {
  if (predicate.includes('bibframe/')) return 'bf:' + predicate.split('/').pop();
  if (predicate.includes('rdf-syntax-ns#type')) return 'rdf:type';
  if (predicate.includes('rdfs#label')) return 'rdfs:label';
  return predicate.split('/').pop() || predicate;
}

function getNodeGroup(uri: string): string {
  if (uri.includes('bibframe/Work') || uri.includes('/work/')) return 'work';
  if (uri.includes('bibframe/Instance') || uri.includes('/instance/')) return 'instance';
  if (uri.includes('bibframe/Item') || uri.includes('/item/')) return 'item';
  if (uri.includes('bibframe/Contribution') || uri.includes('bibframe/Agent') || 
      uri.includes('bibframe/Person') || uri.includes('bibframe/Organization')) return 'agent';
  if (uri.includes('viaf.org') || uri.includes('id.loc.gov') || uri.includes('wikidata.org')) return 'authority';
  return 'other';
}

function getNodeColor(group: string): string {
  switch (group) {
    case 'work': return '#a855f7'; // purple
    case 'instance': return '#3b82f6'; // blue
    case 'item': return '#22c55e'; // green
    case 'agent': return '#f97316'; // orange
    case 'authority': return '#06b6d4'; // cyan
    case 'literal': return '#6b7280'; // gray
    default: return '#64748b'; // slate
  }
}
