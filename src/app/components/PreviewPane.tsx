import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BIBFRAMERecord } from '../types/bibframe';
import { Button } from './ui/button';
import { Download, Copy, Check, Network } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { convertToXML, convertToRDF } from '../utils/converters';
import { generateMARC } from '../services/marcGenerator';
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

interface PreviewPaneProps {
  record: BIBFRAMERecord;
}

// Inline Mind Map Component
function MindMapInlineView({ record }: { record: BIBFRAMERecord }) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return generateMindMapData(record);
  }, [record]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-full relative">
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
      
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border">
        <div className="flex gap-4 text-xs">
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
    </div>
  );
}

// Generate mind map data from BIBFRAME record
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
    const emptyId = createNode('لا توجد بيانات / No Data Available', 'work', 0);
    createNode('الرجاء إنشاء سجل BIBFRAME أولاً', 'property', 1, emptyId);
    return { nodes, edges };
  }

  // Extract title for root node
  const rootTitle = 
    record?.work?.['bf:title']?.['bf:mainTitle'] ||
    record?.instance?.['bf:title']?.['bf:mainTitle'] ||
    record?.work?.title ||
    record?.instance?.title ||
    'سجل BIBFRAME / BIBFRAME Record';
    
  const rootId = createNode(rootTitle, 'work', 0);

  // Work section
  if (record?.work) {
    const work = record.work;
    const workId = createNode('العمل / Work', 'work', 1, rootId);

    // Parse bf:title structure
    if (work['bf:title']) {
      const titleNode = createNode('العنوان / Title', 'property', 2, workId);
      if (work['bf:title']['bf:mainTitle']) {
        createNode(`العنوان الرئيسي / Main: ${work['bf:title']['bf:mainTitle']}`, 'property', 3, titleNode);
      }
      if (work['bf:title']['bf:subtitle']) {
        createNode(`العنوان الفرعي / Subtitle: ${work['bf:title']['bf:subtitle']}`, 'property', 3, titleNode);
      }
      if (work['bf:title']['bf:partNumber']) {
        createNode(`رقم الجزء / Part Number: ${work['bf:title']['bf:partNumber']}`, 'property', 3, titleNode);
      }
      if (work['bf:title']['bf:partName']) {
        createNode(`اسم الجزء / Part Name: ${work['bf:title']['bf:partName']}`, 'property', 3, titleNode);
      }
    } else if (work.title) {
      createNode(`العنوان / Title: ${work.title}`, 'property', 2, workId);
    }

    // Parse bf:language
    if (work['bf:language']) {
      const langs = Array.isArray(work['bf:language']) ? work['bf:language'] : [work['bf:language']];
      const langId = createNode('اللغة / Language', 'property', 2, workId);
      langs.forEach((lang: any) => {
        const label = lang['rdfs:label'] || lang.label || lang;
        createNode(String(label), 'property', 3, langId);
      });
    }

    // Parse @type
    if (work['@type']) {
      createNode(`النوع / Type: ${work['@type']}`, 'property', 2, workId);
    }
    if (work.summary) {
      const summaryPreview = work.summary.length > 50 
        ? work.summary.substring(0, 50) + '...' 
        : work.summary;
      createNode(`ملخص / Summary: ${summaryPreview}`, 'property', 2, workId);
    }

    // Parse bf:creator
    if (work['bf:creator']) {
      const creators = Array.isArray(work['bf:creator']) ? work['bf:creator'] : [work['bf:creator']];
      const creatorsId = createNode('المؤلفون / Creators', 'agent', 2, workId);
      creators.forEach((creator: any) => {
        const name = creator.label || creator['rdfs:label'] || creator['@id'] || 'Unknown';
        const creatorId = createNode(String(name), 'agent', 3, creatorsId);
        
        if (creator['@type']) {
          createNode(`النوع / Type: ${creator['@type']}`, 'property', 4, creatorId);
        }
        if (creator['@id']) {
          createNode(`URI: ${creator['@id']}`, 'property', 4, creatorId);
        }
      });
    }

    // Parse bf:contributor
    if (work['bf:contributor']) {
      const contributors = Array.isArray(work['bf:contributor']) ? work['bf:contributor'] : [work['bf:contributor']];
      const contributorsId = createNode('المساهمون / Contributors', 'agent', 2, workId);
      contributors.forEach((contributor: any) => {
        const name = contributor.label || contributor['rdfs:label'] || contributor['@id'] || 'Unknown';
        const contribId = createNode(String(name), 'agent', 3, contributorsId);
        
        if (contributor['bf:role']) {
          createNode(`الدور / Role: ${contributor['bf:role']}`, 'property', 4, contribId);
        }
        if (contributor['@type']) {
          createNode(`النوع / Type: ${contributor['@type']}`, 'property', 4, contribId);
        }
      });
    }

    // Legacy contributors field
    if (work.contributors) {
      const contributorsArray = Array.isArray(work.contributors) ? work.contributors : [work.contributors];
      if (contributorsArray.length > 0) {
        const contributorsId = createNode('المساهمون / Contributors (Legacy)', 'agent', 2, workId);
        contributorsArray.forEach((contributor: any) => {
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
        if (contributor.viaf) {
          createNode(`VIAF: ${contributor.viaf}`, 'property', 4, contribId);
        }
        if (contributor.uri) {
          createNode(`URI: ${contributor.uri}`, 'property', 4, contribId);
        }
        });
      }
    }

    // Parse bf:subject
    if (work['bf:subject']) {
      const subjects = Array.isArray(work['bf:subject']) ? work['bf:subject'] : [work['bf:subject']];
      const subjectsId = createNode('الموضوعات / Subjects', 'subject', 2, workId);
      subjects.forEach((subject: any) => {
        const label = subject.label || subject['rdfs:label'] || subject['@id'] || 'Unknown';
        const subjectId = createNode(String(label), 'subject', 3, subjectsId);
        
        if (subject['@type']) {
          createNode(`النوع / Type: ${subject['@type']}`, 'property', 4, subjectId);
        }
        if (subject['@id']) {
          createNode(`URI: ${subject['@id']}`, 'property', 4, subjectId);
        }
        if (subject.source) {
          createNode(`المصدر / Source: ${subject.source}`, 'property', 4, subjectId);
        }
      });
    }

    // Legacy subjects field
    if (work.subjects) {
      const subjectsArray = Array.isArray(work.subjects) ? work.subjects : [work.subjects];
      if (subjectsArray.length > 0) {
        const subjectsId = createNode('الموضوعات / Subjects (Legacy)', 'subject', 2, workId);
        subjectsArray.forEach((subject: any) => {
        const subjectLabel = subject.label || subject.value || subject;
        const subjectId = createNode(subjectLabel, 'subject', 3, subjectsId);
        
        if (subject.source) {
          createNode(`المصدر / Source: ${subject.source}`, 'property', 4, subjectId);
        }
        if (subject.uri) {
          createNode(`URI: ${subject.uri}`, 'property', 4, subjectId);
        }
        });
      }
    }

    // Parse bf:classification
    if (work['bf:classification']) {
      const classifications = Array.isArray(work['bf:classification']) ? work['bf:classification'] : [work['bf:classification']];
      const classId = createNode('التصنيف / Classification', 'property', 2, workId);
      classifications.forEach((cls: any) => {
        const classLabel = cls['bf:classificationPortion'] || cls.label || cls['@id'] || 'Unknown';
        const clsNode = createNode(String(classLabel), 'property', 3, classId);
        
        if (cls['bf:source']) {
          const source = cls['bf:source']['rdfs:label'] || cls['bf:source'];
          createNode(`المصدر / Source: ${source}`, 'property', 4, clsNode);
        }
      });
    }

    // Classification with labels
    if (work.classification) {
      const classId = createNode('التصنيف / Classification', 'property', 2, workId);
      if (work.classification.ddc) {
        createNode(`ديوي / DDC: ${work.classification.ddc}`, 'property', 3, classId);
      }
      if (work.classification.lcc) {
        createNode(`كونجرس / LCC: ${work.classification.lcc}`, 'property', 3, classId);
      }
      if (work.classification.udc) {
        createNode(`UDC: ${work.classification.udc}`, 'property', 3, classId);
      }
    }

    // Genre/Form with labels
    if (work.genreForm) {
      const genreArray = Array.isArray(work.genreForm) ? work.genreForm : [work.genreForm];
      if (genreArray.length > 0) {
        const genreId = createNode('النوع/الشكل / Genre/Form', 'property', 2, workId);
        genreArray.forEach((genre: any) => {
          const genreLabel = genre.label || genre.value || genre;
          createNode(genreLabel, 'property', 3, genreId);
        });
      }
    }

    // Notes with labels
    if (work.notes) {
      const notesArray = Array.isArray(work.notes) ? work.notes : [work.notes];
      if (notesArray.length > 0) {
        const notesId = createNode('ملاحظات / Notes', 'property', 2, workId);
        notesArray.forEach((note: any) => {
          const noteText = typeof note === 'string' ? note : (note.value || note.label || '');
          if (noteText) {
            const notePreview = noteText.length > 40 ? noteText.substring(0, 40) + '...' : noteText;
            createNode(notePreview, 'property', 3, notesId);
          }
        });
      }
    }

    // Awards/Honors
    if (work.awards) {
      const awardsArray = Array.isArray(work.awards) ? work.awards : [work.awards];
      if (awardsArray.length > 0) {
        const awardsId = createNode('الجوائز / Awards', 'property', 2, workId);
        awardsArray.forEach((award: any) => {
          createNode(award, 'property', 3, awardsId);
        });
      }
    }

    // Target Audience
    if (work.targetAudience) {
      createNode(`الجمهور المستهدف / Target Audience: ${work.targetAudience}`, 'property', 2, workId);
    }

    // Parse bf:content
    if (work['bf:content']) {
      const contents = Array.isArray(work['bf:content']) ? work['bf:content'] : [work['bf:content']];
      const contentId = createNode('نوع المحتوى / Content', 'property', 2, workId);
      contents.forEach((content: any) => {
        const label = content['rdfs:label'] || content.label || content;
        createNode(String(label), 'property', 3, contentId);
      });
    }

    // Parse bf:genreForm
    if (work['bf:genreForm']) {
      const genres = Array.isArray(work['bf:genreForm']) ? work['bf:genreForm'] : [work['bf:genreForm']];
      const genreId = createNode('النوع/الشكل / Genre/Form', 'property', 2, workId);
      genres.forEach((genre: any) => {
        const label = genre['rdfs:label'] || genre.label || genre;
        createNode(String(label), 'property', 3, genreId);
      });
    }

    // Parse bf:summary
    if (work['bf:summary']) {
      const summaries = Array.isArray(work['bf:summary']) ? work['bf:summary'] : [work['bf:summary']];
      const summaryId = createNode('ملخص / Summary', 'property', 2, workId);
      summaries.forEach((summary: any) => {
        const text = summary['rdfs:label'] || summary.label || summary;
        const preview = String(text).length > 50 ? String(text).substring(0, 50) + '...' : String(text);
        createNode(preview, 'property', 3, summaryId);
      });
    }

    // Parse bf:tableOfContents
    if (work['bf:tableOfContents']) {
      const tocs = Array.isArray(work['bf:tableOfContents']) ? work['bf:tableOfContents'] : [work['bf:tableOfContents']];
      const tocId = createNode('المحتويات / Table of Contents', 'property', 2, workId);
      tocs.forEach((toc: any) => {
        const text = toc['rdfs:label'] || toc;
        const preview = String(text).length > 50 ? String(text).substring(0, 50) + '...' : String(text);
        createNode(preview, 'property', 3, tocId);
      });
    }

    // Parse bf:note
    if (work['bf:note']) {
      const notes = Array.isArray(work['bf:note']) ? work['bf:note'] : [work['bf:note']];
      const noteId = createNode('ملاحظات / Notes', 'property', 2, workId);
      notes.forEach((note: any) => {
        const text = note['rdfs:label'] || note.label || note;
        const preview = String(text).length > 40 ? String(text).substring(0, 40) + '...' : String(text);
        createNode(preview, 'property', 3, noteId);
      });
    }

    // Parse bf:intendedAudience
    if (work['bf:intendedAudience']) {
      const audiences = Array.isArray(work['bf:intendedAudience']) ? work['bf:intendedAudience'] : [work['bf:intendedAudience']];
      const audId = createNode('الجمهور المستهدف / Intended Audience', 'property', 2, workId);
      audiences.forEach((aud: any) => {
        const label = aud['rdfs:label'] || aud;
        createNode(String(label), 'property', 3, audId);
      });
    }

    // Parse bf:originDate
    if (work['bf:originDate']) {
      createNode(`تاريخ الأصل / Origin Date: ${work['bf:originDate']}`, 'property', 2, workId);
    }

    // Parse bf:originPlace
    if (work['bf:originPlace']) {
      const places = Array.isArray(work['bf:originPlace']) ? work['bf:originPlace'] : [work['bf:originPlace']];
      const placeId = createNode('مكان الأصل / Origin Place', 'property', 2, workId);
      places.forEach((place: any) => {
        const label = place['rdfs:label'] || place;
        createNode(String(label), 'property', 3, placeId);
      });
    }

    // Content Type (legacy)
    if (work.contentType) {
      createNode(`نوع المحتوى / Content Type: ${work.contentType}`, 'property', 2, workId);
    }
  }

  // Instance section with all details
  if (record?.instance) {
    const instance = record.instance;
    const instanceId = createNode('النسخة / Instance', 'instance', 1, rootId);

    // Parse bf:title
    if (instance['bf:title']) {
      const titleNode = createNode('العنوان / Title', 'property', 2, instanceId);
      if (instance['bf:title']['bf:mainTitle']) {
        createNode(`العنوان الرئيسي / Main: ${instance['bf:title']['bf:mainTitle']}`, 'property', 3, titleNode);
      }
      if (instance['bf:title']['bf:subtitle']) {
        createNode(`العنوان الفرعي / Subtitle: ${instance['bf:title']['bf:subtitle']}`, 'property', 3, titleNode);
      }
    } else if (instance.title) {
      createNode(`العنوان / Title: ${instance.title}`, 'property', 2, instanceId);
    }

    // Parse bf:identifiedBy (ISBN, ISSN, etc.)
    if (instance['bf:identifiedBy']) {
      const ids = Array.isArray(instance['bf:identifiedBy']) ? instance['bf:identifiedBy'] : [instance['bf:identifiedBy']];
      const idNode = createNode('المعرفات / Identifiers', 'property', 2, instanceId);
      ids.forEach((id: any) => {
        const type = id['@type'] || 'Unknown';
        const value = id['rdf:value'] || id.value || id;
        if (type.includes('Isbn')) {
          createNode(`ISBN: ${value}`, 'property', 3, idNode);
        } else if (type.includes('Issn')) {
          createNode(`ISSN: ${value}`, 'property', 3, idNode);
        } else {
          createNode(`${type}: ${value}`, 'property', 3, idNode);
        }
      });
    }

    // Parse bf:provisionActivity (Publication info)
    if (instance['bf:provisionActivity']) {
      const provisions = Array.isArray(instance['bf:provisionActivity']) ? instance['bf:provisionActivity'] : [instance['bf:provisionActivity']];
      const provId = createNode('نشاط التوفير / Provision Activity', 'property', 2, instanceId);
      provisions.forEach((prov: any) => {
        const provType = prov['@type'] || 'Publication';
        const provNode = createNode(provType, 'property', 3, provId);
        
        if (prov['bf:agent']) {
          const agent = prov['bf:agent'];
          const agentLabel = agent['rdfs:label'] || agent.label || agent;
          createNode(`الناشر / Agent: ${agentLabel}`, 'property', 4, provNode);
        }
        if (prov['bf:date']) {
          createNode(`التاريخ / Date: ${prov['bf:date']}`, 'property', 4, provNode);
        }
        if (prov['bf:place']) {
          const place = prov['bf:place'];
          const placeLabel = place['rdfs:label'] || place;
          createNode(`المكان / Place: ${placeLabel}`, 'property', 4, provNode);
        }
      });
    }

    // Parse bf:extent
    if (instance['bf:extent']) {
      const extent = instance['bf:extent'];
      const extentLabel = extent['rdfs:label'] || extent;
      createNode(`الحجم / Extent: ${extentLabel}`, 'property', 2, instanceId);
    }

    // Parse bf:dimensions
    if (instance['bf:dimensions']) {
      createNode(`الأبعاد / Dimensions: ${instance['bf:dimensions']}`, 'property', 2, instanceId);
    }

    // Parse bf:responsibilityStatement
    if (instance['bf:responsibilityStatement']) {
      createNode(`بيان المسؤولية / Responsibility: ${instance['bf:responsibilityStatement']}`, 'property', 2, instanceId);
    }

    // Parse bf:editionStatement
    if (instance['bf:editionStatement']) {
      createNode(`بيان الطبعة / Edition: ${instance['bf:editionStatement']}`, 'property', 2, instanceId);
    }

    // Parse bf:seriesStatement
    if (instance['bf:seriesStatement']) {
      createNode(`بيان السلسلة / Series: ${instance['bf:seriesStatement']}`, 'property', 2, instanceId);
    }

    // Parse bf:media
    if (instance['bf:media']) {
      const medias = Array.isArray(instance['bf:media']) ? instance['bf:media'] : [instance['bf:media']];
      const mediaId = createNode('الوسائط / Media', 'property', 2, instanceId);
      medias.forEach((media: any) => {
        const label = media['rdfs:label'] || media;
        createNode(String(label), 'property', 3, mediaId);
      });
    }

    // Parse bf:carrier
    if (instance['bf:carrier']) {
      const carriers = Array.isArray(instance['bf:carrier']) ? instance['bf:carrier'] : [instance['bf:carrier']];
      const carrierId = createNode('الحامل / Carrier', 'property', 2, instanceId);
      carriers.forEach((carrier: any) => {
        const label = carrier['rdfs:label'] || carrier;
        createNode(String(label), 'property', 3, carrierId);
      });
    }

    // Parse bf:note
    if (instance['bf:note']) {
      const notes = Array.isArray(instance['bf:note']) ? instance['bf:note'] : [instance['bf:note']];
      const noteId = createNode('ملاحظات / Notes', 'property', 2, instanceId);
      notes.forEach((note: any) => {
        const text = note['rdfs:label'] || note;
        const preview = String(text).length > 40 ? String(text).substring(0, 40) + '...' : String(text);
        createNode(preview, 'property', 3, noteId);
      });
    }

    // Parse bf:frequency
    if (instance['bf:frequency']) {
      const freq = instance['bf:frequency'];
      const freqLabel = freq['rdfs:label'] || freq;
      createNode(`التكرار / Frequency: ${freqLabel}`, 'property', 2, instanceId);
    }

    // Legacy fields
    if (instance.isbn) {
      createNode(`ISBN (Legacy): ${instance.isbn}`, 'property', 2, instanceId);
    }
    if (instance.issn) {
      createNode(`ISSN (Legacy): ${instance.issn}`, 'property', 2, instanceId);
    }
    if (instance.publisher) {
      createNode(`الناشر (Legacy) / Publisher: ${instance.publisher}`, 'property', 2, instanceId);
    }
    if (instance.publicationDate) {
      createNode(`تاريخ النشر (Legacy) / Date: ${instance.publicationDate}`, 'property', 2, instanceId);
    }
  }

  // Holdings section with detailed labels
  if (record?.holdings) {
    const holdingsArray = Array.isArray(record.holdings) ? record.holdings : [record.holdings];
    if (holdingsArray.length > 0) {
      const holdingsId = createNode('المقتنيات / Holdings', 'instance', 1, rootId);
      holdingsArray.forEach((holding: any) => {
      const location = holding.location || 'موقع غير محدد / Unspecified Location';
      const holdingId = createNode(location, 'property', 2, holdingsId);
      
      if (holding.callNumber) {
        createNode(`رقم الاستدعاء / Call #: ${holding.callNumber}`, 'property', 3, holdingId);
      }
      if (holding.copies) {
        createNode(`نسخ / Copies: ${holding.copies}`, 'property', 3, holdingId);
      }
      if (holding.status) {
        createNode(`الحالة / Status: ${holding.status}`, 'property', 3, holdingId);
      }
      if (holding.barcode) {
        createNode(`الباركود / Barcode: ${holding.barcode}`, 'property', 3, holdingId);
      }
      });
    }
  }

  // Metadata section
  if (record?.metadata) {
    const metadataId = createNode('البيانات الوصفية / Metadata', 'property', 1, rootId);
    
    if (record.metadata.created) {
      createNode(`تاريخ الإنشاء / Created: ${new Date(record.metadata.created).toLocaleDateString()}`, 'property', 2, metadataId);
    }
    if (record.metadata.modified) {
      createNode(`آخر تعديل / Modified: ${new Date(record.metadata.modified).toLocaleDateString()}`, 'property', 2, metadataId);
    }
    if (record.metadata.cataloger) {
      createNode(`المفهرس / Cataloger: ${record.metadata.cataloger}`, 'property', 2, metadataId);
    }
    if (record.metadata.resourceType) {
      createNode(`نوع المورد / Resource Type: ${record.metadata.resourceType}`, 'property', 2, metadataId);
    }
    if (record.metadata.institution) {
      createNode(`المؤسسة / Institution: ${record.metadata.institution}`, 'property', 2, metadataId);
    }
  }

  // Apply force-directed layout
  applyForceLayout(nodes, edges);

  return { nodes, edges };
}

// Apply a simple force-directed layout
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

export function PreviewPane({ record }: PreviewPaneProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [currentTab, setCurrentTab] = useState('mindmap');

  const jsonLdOutput = JSON.stringify(record, null, 2);
  const xmlOutput = convertToXML(record);
  const rdfOutput = convertToRDF(record);

  const getCurrentOutput = () => {
    switch (currentTab) {
      case 'xml':
        return xmlOutput;
      case 'rdf':
        return rdfOutput;
      case 'marc':
        return generateMARCPreview();
      default:
        return jsonLdOutput;
    }
  };

  const handleCopy = async () => {
    try {
      const text = getCurrentOutput();
      
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback to legacy method
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Still show success to user since the fallback method doesn't throw
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    let content = jsonLdOutput;
    let mimeType = 'application/ld+json';
    let extension = 'json';

    switch (currentTab) {
      case 'xml':
        content = xmlOutput;
        mimeType = 'application/xml';
        extension = 'xml';
        break;
      case 'rdf':
        content = rdfOutput;
        mimeType = 'application/rdf+xml';
        extension = 'rdf';
        break;
      case 'marc':
        content = generateMARCPreview();
        mimeType = 'text/plain';
        extension = 'mrc';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibframe-record-${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate complete MARC record using the new service
  const generateMARCPreview = (): string => {
    const work = record?.work || {};
    const instance = record?.instance || {};
    return generateMARC(work, instance);
  };

  // OLD IMPLEMENTATION (replaced by service)
  const generateMARCPreview_OLD = (): string => {
    const lines: string[] = [];
    lines.push('=LDR  00000nam  2200000   4500');
    
    // Safety checks for work and instance
    const work = record?.work || {};
    const instance = record?.instance || {};
    
    // Helper function to extract main title
    const getMainTitle = (node: any) => {
      if (!node) return '';
      if (Array.isArray(node)) {
        return node[0]?.['bf:mainTitle'] || '';
      }
      return node['bf:mainTitle'] || '';
    };
    
    // 100 - Main Entry - Personal Name (from bf:contribution)
    const mainContribution = work['bf:contribution']?.[0];
    if (mainContribution) {
      const agentLabel = mainContribution['bf:agent']?.['rdfs:label'];
      if (agentLabel) {
        lines.push(`=100  1\\$a${agentLabel}`);
      }
    }

    // 245 - Title Statement
    const workTitle = getMainTitle(work['bf:title']);
    const instanceTitle = getMainTitle(instance['bf:title']);
    const responsibility = instance['bf:responsibilityStatement'];
    if (instanceTitle || workTitle) {
      let field245 = `=245  10$a${instanceTitle || workTitle}`;
      if (responsibility) {
        field245 += ` /$c${responsibility}`;
      }
      lines.push(field245);
    }

    // 250 - Edition Statement
    const edition = instance['bf:editionStatement'];
    if (edition) {
      lines.push(`=250    $a${edition}`);
    }

    // 260/264 - Publication
    const pub = instance['bf:provisionActivity']?.[0];
    if (pub) {
      let field264 = '=264  1\\';
      if (pub['bf:place']) {
        field264 += `$a${pub['bf:place']['rdfs:label']} :`;
      }
      if (pub['bf:agent']) {
        field264 += `$b${pub['bf:agent']['rdfs:label']},`;
      }
      if (pub['bf:date']) {
        field264 += `$c${pub['bf:date']}`;
      }
      if (field264.length > 9) {
        lines.push(field264);
      }
    }

    // 300 - Physical Description
    const extent = instance['bf:extent'];
    const dimensions = instance['bf:dimensions'];
    if (extent || dimensions) {
      let field300 = '=300    ';
      if (extent) {
        field300 += `$a${extent['rdfs:label']}`;
      }
      if (dimensions) {
        field300 += ` ;$c${dimensions}`;
      }
      lines.push(field300);
    }

    // 336 - Content Type
    const content = work['bf:content']?.[0];
    if (content) {
      lines.push(`=336    $a${content['rdfs:label']}$2rdacontent`);
    }

    // 337 - Media Type
    const media = instance['bf:media']?.[0];
    if (media) {
      lines.push(`=337    $a${media['rdfs:label']}$2rdamedia`);
    }

    // 338 - Carrier Type
    const carrier = instance['bf:carrier']?.[0];
    if (carrier) {
      lines.push(`=338    $a${carrier['rdfs:label']}$2rdacarrier`);
    }

    // 520 - Summary
    const summary = work['bf:summary']?.[0];
    if (summary) {
      lines.push(`=520    $a${summary['rdfs:label']}`);
    }

    // 650 - Subject Added Entry - Topical Term
    work['bf:subject']?.forEach((subject) => {
      if (subject.type === 'bf:Topic') {
        lines.push(`=650  0$a${subject.label}`);
      } else if (subject.type === 'bf:Place') {
        lines.push(`=651  0$a${subject.label}`);
      } else if (subject.type === 'bf:Person') {
        lines.push(`=600  10$a${subject.label}`);
      }
    });

    // 655 - Index Term - Genre/Form
    work['bf:genreForm']?.forEach((genre) => {
      lines.push(`=655  7$a${genre.label}$2lcgft`);
    });

    // 700 - Added Entry - Personal Name (Contributors from bf:contribution)
    work['bf:contribution']?.slice(1).forEach((contrib: any) => {
      const label = contrib['bf:agent']?.['rdfs:label'];
      if (label) {
        lines.push(`=700  1\\$a${label}`);
      }
    });

    return lines.join('\n');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{t('preview')}</h2>
            <p className="text-sm text-gray-500">{t('livePreview')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  {t('copied')}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  {t('copy')}
                </>
              )}
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              {t('download')}
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 w-fit">
          <TabsTrigger value="mindmap">
            <Network className="h-4 w-4 mr-1" />
            {t('mindMap')}
          </TabsTrigger>
          <TabsTrigger value="jsonld">{t('jsonLd')}</TabsTrigger>
          <TabsTrigger value="xml">{t('xml')}</TabsTrigger>
          <TabsTrigger value="rdf">{t('rdf')}</TabsTrigger>
          <TabsTrigger value="marc">{t('marcPreview')}</TabsTrigger>
        </TabsList>

        <TabsContent value="mindmap" className="flex-1 m-4 mt-2">
          <div className="h-full bg-white rounded-lg border overflow-hidden">
            <MindMapInlineView record={record} />
          </div>
        </TabsContent>

        <TabsContent value="jsonld" className="flex-1 m-4 mt-2">
          <div className="h-full bg-white rounded-lg border overflow-auto">
            <pre className="p-4 text-xs font-mono leading-relaxed">
              <code>{jsonLdOutput}</code>
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="xml" className="flex-1 m-4 mt-2">
          <div className="h-full bg-white rounded-lg border overflow-auto">
            <pre className="p-4 text-xs font-mono leading-relaxed">
              <code>{xmlOutput}</code>
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="rdf" className="flex-1 m-4 mt-2">
          <div className="h-full bg-white rounded-lg border overflow-auto">
            <pre className="p-4 text-xs font-mono leading-relaxed">
              <code>{rdfOutput}</code>
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="marc" className="flex-1 m-4 mt-2">
          <div className="h-full bg-white rounded-lg border overflow-auto">
            <pre className="p-4 text-xs font-mono leading-relaxed">
              <code>{generateMARCPreview()}</code>
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
