/**
 * Mind Map View Component
 * Visualizes BIBFRAME records as an interactive mind map
 */

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  ConnectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { X, Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MindMapViewProps {
  record: any;
  onClose: () => void;
}

const MindMapView: React.FC<MindMapViewProps> = ({ record, onClose }) => {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return generateMindMapData(record);
  }, [record]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleDownload = useCallback(() => {
    // Export as SVG or PNG
    const svgElement = document.querySelector('.react-flow__viewport');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bibframe-mindmap.svg';
      link.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">عرض الخريطة الذهنية / Mind Map View</h2>
            <p className="text-sm text-muted-foreground">
              {record?.work?.title || record?.instance?.title || 'BIBFRAME Record'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex gap-2"
            >
              <Download className="w-4 h-4" />
              <span>تصدير / Export</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-left"
            connectionMode={ConnectionMode.Loose}
          >
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <Controls />
          </ReactFlow>
        </div>

        <div className="p-4 border-t bg-muted/30">
          <div className="flex gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>عمل / Work</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>نسخة / Instance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>مؤلف / Agent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>موضوع / Subject</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span>خصائص / Properties</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Generate mind map data from BIBFRAME record
 */
function generateMindMapData(record: any): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeId = 0;

  const createNode = (
    label: string,
    type: 'work' | 'instance' | 'agent' | 'subject' | 'property',
    level: number,
    parent?: number
  ): number => {
    const id = nodeId++;
    const colors = {
      work: '#3b82f6',
      instance: '#10b981',
      agent: '#8b5cf6',
      subject: '#f97316',
      property: '#ec4899'
    };

    nodes.push({
      id: id.toString(),
      type: 'default',
      position: { x: level * 250, y: id * 80 },
      data: { 
        label: (
          <div className="px-3 py-2 text-sm">
            <div className="font-semibold">{label}</div>
          </div>
        )
      },
      style: {
        background: colors[type],
        color: 'white',
        border: '2px solid white',
        borderRadius: '8px',
        padding: '0',
        minWidth: '180px'
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left
    });

    if (parent !== undefined) {
      edges.push({
        id: `e${parent}-${id}`,
        source: parent.toString(),
        target: id.toString(),
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: colors[type]
        },
        style: { stroke: colors[type] }
      });
    }

    return id;
  };

  // Check if record has data
  if (!record || (!record.work && !record.instance)) {
    // No data available
    const emptyId = createNode('لا توجد بيانات / No Data Available', 'work', 0);
    createNode('الرجاء إنشاء سجل BIBFRAME أولاً', 'property', 1, emptyId);
    return { nodes, edges };
  }

  // Root node
  const rootId = createNode(
    record?.work?.title || record?.instance?.title || 'سجل BIBFRAME / BIBFRAME Record',
    'work',
    0
  );

  // Work section
  if (record?.work) {
    const work = record.work;
    const workId = createNode('العمل / Work', 'work', 1, rootId);

    // Work properties
    if (work.title) {
      createNode(`العنوان / Title: ${work.title}`, 'property', 2, workId);
    }
    if (work.subtitle) {
      createNode(`عنوان فرعي / Subtitle: ${work.subtitle}`, 'property', 2, workId);
    }
    if (work.language) {
      createNode(`اللغة / Language: ${work.language}`, 'property', 2, workId);
    }
    if (work.type) {
      createNode(`النوع / Type: ${work.type}`, 'property', 2, workId);
    }
    if (work.summary) {
      const summaryPreview = work.summary.length > 50 
        ? work.summary.substring(0, 50) + '...' 
        : work.summary;
      createNode(`ملخص / Summary: ${summaryPreview}`, 'property', 2, workId);
    }

    // Contributors
    if (work.contributors && work.contributors.length > 0) {
      const contributorsId = createNode('المؤلفون / Contributors', 'agent', 2, workId);
      work.contributors.forEach((contributor: any) => {
        const contribName = contributor.name || contributor.label || contributor.value || 'غير معروف / Unknown';
        const contribId = createNode(contribName, 'agent', 3, contributorsId);
        
        if (contributor.role) {
          createNode(`الدور / Role: ${contributor.role}`, 'property', 4, contribId);
        }
        if (contributor.afiqaId) {
          createNode(`AFIQA ID: ${contributor.afiqaId}`, 'property', 4, contribId);
        }
        if (contributor.isni) {
          createNode(`ISNI: ${contributor.isni}`, 'property', 4, contribId);
        }
      });
    }

    // Subjects
    if (work.subjects && work.subjects.length > 0) {
      const subjectsId = createNode('الموضوعات / Subjects', 'subject', 2, workId);
      work.subjects.slice(0, 5).forEach((subject: any) => {
        const subjectLabel = subject.label || subject.value || subject;
        createNode(subjectLabel, 'subject', 3, subjectsId);
      });
      if (work.subjects.length > 5) {
        createNode(`... و ${work.subjects.length - 5} موضوعات أخرى`, 'subject', 3, subjectsId);
      }
    }

    // Classification
    if (work.classification) {
      const classId = createNode('التصنيف / Classification', 'property', 2, workId);
      if (work.classification.ddc) {
        createNode(`ديوي / DDC: ${work.classification.ddc}`, 'property', 3, classId);
      }
      if (work.classification.lcc) {
        createNode(`كونجرس / LCC: ${work.classification.lcc}`, 'property', 3, classId);
      }
    }

    // Notes
    if (work.notes && work.notes.length > 0) {
      const notesId = createNode('ملاحظات / Notes', 'property', 2, workId);
      work.notes.slice(0, 3).forEach((note: any) => {
        const noteText = typeof note === 'string' ? note : (note.value || note.label || '');
        if (noteText) {
          const notePreview = noteText.length > 40 ? noteText.substring(0, 40) + '...' : noteText;
          createNode(notePreview, 'property', 3, notesId);
        }
      });
    }
  }

  // Instance section
  if (record?.instance) {
    const instance = record.instance;
    const instanceId = createNode('النسخة / Instance', 'instance', 1, rootId);

    if (instance.title) {
      createNode(`العنوان / Title: ${instance.title}`, 'property', 2, instanceId);
    }
    if (instance.isbn) {
      createNode(`ISBN: ${instance.isbn}`, 'property', 2, instanceId);
    }
    if (instance.publisher) {
      createNode(`الناشر / Publisher: ${instance.publisher}`, 'property', 2, instanceId);
    }
    if (instance.publicationDate) {
      createNode(`تاريخ النشر / Date: ${instance.publicationDate}`, 'property', 2, instanceId);
    }
    if (instance.placeOfPublication) {
      createNode(`مكان النشر / Place: ${instance.placeOfPublication}`, 'property', 2, instanceId);
    }
    if (instance.edition) {
      createNode(`الطبعة / Edition: ${instance.edition}`, 'property', 2, instanceId);
    }
    if (instance.extent) {
      createNode(`الحجم / Extent: ${instance.extent}`, 'property', 2, instanceId);
    }
    if (instance.format) {
      createNode(`الشكل / Format: ${instance.format}`, 'property', 2, instanceId);
    }
    if (instance.dimensions) {
      createNode(`الأبعاد / Dimensions: ${instance.dimensions}`, 'property', 2, instanceId);
    }
  }

  // Holdings section
  if (record?.holdings && record.holdings.length > 0) {
    const holdingsId = createNode('المقتنيات / Holdings', 'instance', 1, rootId);
    record.holdings.slice(0, 3).forEach((holding: any) => {
      const location = holding.location || 'موقع غير محدد';
      const holdingId = createNode(location, 'property', 2, holdingsId);
      if (holding.callNumber) {
        createNode(`رقم الاستدعاء / Call #: ${holding.callNumber}`, 'property', 3, holdingId);
      }
      if (holding.copies) {
        createNode(`نسخ / Copies: ${holding.copies}`, 'property', 3, holdingId);
      }
    });
  }

  // Apply force-directed layout
  applyForceLayout(nodes, edges);

  return { nodes, edges };
}

/**
 * Apply a simple force-directed layout
 */
function applyForceLayout(nodes: Node[], edges: Edge[]) {
  const levels = new Map<number, number>();
  
  // Calculate levels
  nodes.forEach((node, index) => {
    const incomingEdges = edges.filter(e => e.target === node.id);
    const level = incomingEdges.length > 0 
      ? Math.max(...incomingEdges.map(e => levels.get(parseInt(e.source)) || 0)) + 1
      : 0;
    levels.set(parseInt(node.id), level);
  });

  // Position nodes by level
  const levelNodes = new Map<number, Node[]>();
  nodes.forEach(node => {
    const level = levels.get(parseInt(node.id)) || 0;
    if (!levelNodes.has(level)) {
      levelNodes.set(level, []);
    }
    levelNodes.get(level)!.push(node);
  });

  // Update positions
  levelNodes.forEach((levelNodesList, level) => {
    levelNodesList.forEach((node, index) => {
      node.position = {
        x: level * 300,
        y: index * 100 - (levelNodesList.length * 50) / 2
      };
    });
  });
}

export default MindMapView;
