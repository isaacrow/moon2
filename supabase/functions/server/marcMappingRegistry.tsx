/**
 * 📋 MARC 21 Mapping Registry
 * Explicit, declarative BIBFRAME → MARC mapping
 * 
 * Enterprise-safe mapping for library cataloging
 * Based on LC BIBFRAME-to-MARC conversion specifications
 */

export interface MARCFieldMapping {
  tag: string;
  label: string;
  bibframeProperty: string;
  entityType?: 'Work' | 'Instance' | 'Item' | 'any';
  indicators?: {
    ind1?: string | ((data: any) => string);
    ind2?: string | ((data: any) => string);
  };
  subfields: MARCSubfieldMapping[];
  condition?: (data: any) => boolean;
  repeatable?: boolean;
}

export interface MARCSubfieldMapping {
  code: string;
  bibframeProperty: string;
  valueExtractor?: (node: any, graph: any[]) => string | null;
  required?: boolean;
}

/**
 * MARC 21 Mapping Registry
 * Comprehensive BIBFRAME → MARC field mappings
 */
export const MARC_MAPPING_REGISTRY: MARCFieldMapping[] = [
  // ====================
  // CONTROL FIELDS (00X)
  // ====================
  {
    tag: '001',
    label: 'Control Number',
    bibframeProperty: '@id',
    entityType: 'Work',
    subfields: [
      {
        code: 'a',
        bibframeProperty: '@id',
        valueExtractor: (node) => node['@id']?.split('/').pop() || null
      }
    ]
  },
  {
    tag: '003',
    label: 'Control Number Identifier',
    bibframeProperty: 'bf:adminMetadata',
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:source',
        valueExtractor: () => 'MOON'
      }
    ]
  },
  {
    tag: '005',
    label: 'Date and Time of Latest Transaction',
    bibframeProperty: 'bf:adminMetadata',
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:changeDate',
        valueExtractor: (node) => {
          const changeDate = node['bf:changeDate']?.['@value'] || new Date().toISOString();
          return changeDate.replace(/[-:]/g, '').split('.')[0];
        }
      }
    ]
  },
  {
    tag: '008',
    label: 'Fixed-Length Data Elements',
    bibframeProperty: 'multiple',
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'multiple',
        valueExtractor: (work, graph) => {
          const date = new Date().toISOString().slice(2, 8).replace(/-/g, '');
          const language = extractLanguageCode(work, graph);
          return `${date}s2024    xxu           000 0 ${language} d`;
        }
      }
    ]
  },

  // ====================
  // ISBN / ISSN (020/022)
  // ====================
  {
    tag: '020',
    label: 'International Standard Book Number',
    bibframeProperty: 'bf:identifiedBy',
    entityType: 'Instance',
    repeatable: true,
    condition: (instance) => hasIdentifierType(instance, 'Isbn'),
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:identifiedBy',
        valueExtractor: (instance, graph) => {
          return extractIdentifierValue(instance, graph, 'Isbn');
        }
      }
    ]
  },
  {
    tag: '022',
    label: 'International Standard Serial Number',
    bibframeProperty: 'bf:identifiedBy',
    entityType: 'Instance',
    repeatable: true,
    condition: (instance) => hasIdentifierType(instance, 'Issn'),
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:identifiedBy',
        valueExtractor: (instance, graph) => {
          return extractIdentifierValue(instance, graph, 'Issn');
        }
      }
    ]
  },

  // ====================
  // CATALOGING SOURCE (040)
  // ====================
  {
    tag: '040',
    label: 'Cataloging Source',
    bibframeProperty: 'bf:adminMetadata',
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:source',
        valueExtractor: () => 'MOON'
      },
      {
        code: 'b',
        bibframeProperty: 'bf:descriptionLanguage',
        valueExtractor: () => 'eng'
      },
      {
        code: 'c',
        bibframeProperty: 'bf:source',
        valueExtractor: () => 'MOON'
      },
      {
        code: 'e',
        bibframeProperty: 'bf:descriptionConventions',
        valueExtractor: () => 'rda'
      }
    ]
  },

  // ====================
  // LC CLASSIFICATION (050)
  // ====================
  {
    tag: '050',
    label: 'Library of Congress Call Number',
    bibframeProperty: 'bf:classification',
    entityType: 'Work',
    repeatable: true,
    condition: (work) => hasClassificationType(work, 'ClassificationLcc'),
    indicators: {
      ind1: '0',
      ind2: '0'
    },
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:classification',
        valueExtractor: (work, graph) => {
          return extractClassificationValue(work, graph, 'ClassificationLcc');
        }
      }
    ]
  },

  // ====================
  // MAIN ENTRY - PERSONAL NAME (100)
  // ====================
  {
    tag: '100',
    label: 'Main Entry - Personal Name',
    bibframeProperty: 'bf:contribution',
    entityType: 'Work',
    condition: (work, graph) => {
      const mainContribution = getMainContribution(work, graph);
      return mainContribution?.agentType === 'Person';
    },
    indicators: {
      ind1: '1',
      ind2: ' '
    },
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:agent',
        valueExtractor: (work, graph) => {
          const mainContribution = getMainContribution(work, graph);
          return extractAgentName(mainContribution, graph);
        }
      },
      {
        code: 'e',
        bibframeProperty: 'bf:role',
        valueExtractor: (work, graph) => {
          const mainContribution = getMainContribution(work, graph);
          return extractRole(mainContribution, graph);
        }
      }
    ]
  },

  // ====================
  // TITLE STATEMENT (245)
  // ====================
  {
    tag: '245',
    label: 'Title Statement',
    bibframeProperty: 'bf:title',
    entityType: 'Work',
    indicators: {
      ind1: (data) => data.hasMainEntry ? '1' : '0',
      ind2: '0'
    },
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:mainTitle',
        valueExtractor: (work, graph) => {
          const titleNode = extractTitle(work, graph);
          const mainTitle = titleNode?.['bf:mainTitle'] || 'Untitled';
          const hasSubtitle = !!titleNode?.['bf:subtitle'];
          return mainTitle + (hasSubtitle ? ' :' : '');
        },
        required: true
      },
      {
        code: 'b',
        bibframeProperty: 'bf:subtitle',
        valueExtractor: (work, graph) => {
          const titleNode = extractTitle(work, graph);
          return titleNode?.['bf:subtitle'] || null;
        }
      },
      {
        code: 'c',
        bibframeProperty: 'bf:responsibilityStatement',
        valueExtractor: (work, graph, instance) => {
          return instance?.['bf:responsibilityStatement'] || null;
        }
      },
      {
        code: 'n',
        bibframeProperty: 'bf:partNumber',
        valueExtractor: (work, graph) => {
          const titleNode = extractTitle(work, graph);
          return titleNode?.['bf:partNumber'] || null;
        }
      },
      {
        code: 'p',
        bibframeProperty: 'bf:partName',
        valueExtractor: (work, graph) => {
          const titleNode = extractTitle(work, graph);
          return titleNode?.['bf:partName'] || null;
        }
      }
    ]
  },

  // ====================
  // EDITION STATEMENT (250)
  // ====================
  {
    tag: '250',
    label: 'Edition Statement',
    bibframeProperty: 'bf:editionStatement',
    entityType: 'Instance',
    condition: (instance) => !!instance['bf:editionStatement'],
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:editionStatement',
        valueExtractor: (instance) => instance['bf:editionStatement'] || null
      }
    ]
  },

  // ====================
  // PUBLICATION/DISTRIBUTION (264)
  // ====================
  {
    tag: '264',
    label: 'Publication Statement',
    bibframeProperty: 'bf:provisionActivity',
    entityType: 'Instance',
    repeatable: true,
    condition: (instance) => !!instance['bf:provisionActivity'],
    indicators: {
      ind1: ' ',
      ind2: (data) => {
        // ind2: 0=production, 1=publication, 2=distribution, 3=manufacture, 4=copyright
        const activityType = data.activityType || 'Publication';
        if (activityType.includes('Publication')) return '1';
        if (activityType.includes('Distribution')) return '2';
        if (activityType.includes('Manufacture')) return '3';
        return '1';
      }
    },
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:place',
        valueExtractor: (instance, graph) => {
          return extractProvisionPlace(instance, graph);
        }
      },
      {
        code: 'b',
        bibframeProperty: 'bf:agent',
        valueExtractor: (instance, graph) => {
          return extractProvisionAgent(instance, graph);
        }
      },
      {
        code: 'c',
        bibframeProperty: 'bf:date',
        valueExtractor: (instance, graph) => {
          return extractProvisionDate(instance, graph);
        }
      }
    ]
  },

  // ====================
  // PHYSICAL DESCRIPTION (300)
  // ====================
  {
    tag: '300',
    label: 'Physical Description',
    bibframeProperty: 'bf:extent',
    entityType: 'Instance',
    condition: (instance) => {
      return !!instance['bf:extent'] || !!instance['bf:dimensions'] || !!instance['bf:illustrativeContent'];
    },
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:extent',
        valueExtractor: (instance, graph) => {
          return extractExtent(instance, graph);
        }
      },
      {
        code: 'b',
        bibframeProperty: 'bf:illustrativeContent',
        valueExtractor: (instance, graph) => {
          return extractIllustrativeContent(instance, graph);
        }
      },
      {
        code: 'c',
        bibframeProperty: 'bf:dimensions',
        valueExtractor: (instance) => instance['bf:dimensions'] || null
      }
    ]
  },

  // ====================
  // SERIES STATEMENT (490)
  // ====================
  {
    tag: '490',
    label: 'Series Statement',
    bibframeProperty: 'bf:seriesStatement',
    entityType: 'Instance',
    condition: (instance) => !!instance['bf:seriesStatement'],
    indicators: {
      ind1: '0',
      ind2: ' '
    },
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:seriesStatement',
        valueExtractor: (instance) => instance['bf:seriesStatement'] || null
      }
    ]
  },

  // ====================
  // NOTES (500-599)
  // ====================
  {
    tag: '500',
    label: 'General Note',
    bibframeProperty: 'bf:note',
    repeatable: true,
    condition: (entity) => !!entity['bf:note'],
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:note',
        valueExtractor: (entity, graph) => extractNote(entity, graph)
      }
    ]
  },

  // ====================
  // SUBJECT ACCESS (6XX)
  // ====================
  {
    tag: '650',
    label: 'Subject Added Entry - Topical Term',
    bibframeProperty: 'bf:subject',
    entityType: 'Work',
    repeatable: true,
    condition: (work) => !!work['bf:subject'],
    indicators: {
      ind1: ' ',
      ind2: '0'
    },
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:subject',
        valueExtractor: (work, graph) => extractSubjectLabel(work, graph)
      }
    ]
  },

  // ====================
  // ADDED ENTRIES (700-799)
  // ====================
  {
    tag: '700',
    label: 'Added Entry - Personal Name',
    bibframeProperty: 'bf:contribution',
    entityType: 'Work',
    repeatable: true,
    condition: (work, graph) => {
      const contributions = getAdditionalContributions(work, graph);
      return contributions.some(c => c.agentType === 'Person');
    },
    indicators: {
      ind1: '1',
      ind2: ' '
    },
    subfields: [
      {
        code: 'a',
        bibframeProperty: 'bf:agent',
        valueExtractor: (work, graph, contribution) => {
          return extractAgentName(contribution, graph);
        }
      },
      {
        code: 'e',
        bibframeProperty: 'bf:role',
        valueExtractor: (work, graph, contribution) => {
          return extractRole(contribution, graph);
        }
      }
    ]
  },

  // ====================
  // ELECTRONIC LOCATION (856)
  // ====================
  {
    tag: '856',
    label: 'Electronic Location and Access',
    bibframeProperty: 'bf:electronicLocator',
    repeatable: true,
    condition: (entity) => !!entity['bf:electronicLocator'] || !!entity['@id'],
    indicators: {
      ind1: '4',
      ind2: '0'
    },
    subfields: [
      {
        code: 'u',
        bibframeProperty: 'bf:electronicLocator',
        valueExtractor: (entity) => {
          return entity['bf:electronicLocator'] || entity['@id'] || null;
        }
      },
      {
        code: 'z',
        bibframeProperty: '@type',
        valueExtractor: (entity) => {
          const type = Array.isArray(entity['@type']) ? entity['@type'][0] : entity['@type'];
          return `BIBFRAME ${type?.replace('bf:', '')} URI`;
        }
      }
    ]
  }
];

// ====================
// HELPER FUNCTIONS
// ====================

function extractLanguageCode(work: any, graph: any[]): string {
  const langRef = work['bf:language'];
  if (!langRef) return 'eng';
  
  const langNode = resolveReference(langRef, graph);
  const langId = langNode?.['@id'] || langRef['@id'] || '';
  
  // Extract 3-letter code from URI
  const code = langId.split('/').pop();
  return code?.substring(0, 3) || 'eng';
}

function hasIdentifierType(instance: any, type: string): boolean {
  const identifiers = Array.isArray(instance['bf:identifiedBy']) 
    ? instance['bf:identifiedBy'] 
    : [instance['bf:identifiedBy']];
  
  return identifiers.some((id: any) => {
    const idType = Array.isArray(id?.['@type']) ? id['@type'] : [id?.['@type']];
    return idType.some((t: string) => t?.includes(type));
  });
}

function extractIdentifierValue(instance: any, graph: any[], type: string): string | null {
  const identifiers = Array.isArray(instance['bf:identifiedBy']) 
    ? instance['bf:identifiedBy'] 
    : [instance['bf:identifiedBy']];
  
  for (const id of identifiers) {
    const idNode = resolveReference(id, graph);
    const idType = Array.isArray(idNode?.['@type']) ? idNode['@type'] : [idNode?.['@type']];
    
    if (idType.some((t: string) => t?.includes(type))) {
      return idNode?.['rdf:value'] || idNode?.['bf:value'] || null;
    }
  }
  
  return null;
}

function hasClassificationType(work: any, type: string): boolean {
  const classifications = Array.isArray(work['bf:classification']) 
    ? work['bf:classification'] 
    : [work['bf:classification']];
  
  return classifications.some((c: any) => {
    const cType = Array.isArray(c?.['@type']) ? c['@type'] : [c?.['@type']];
    return cType.some((t: string) => t?.includes(type));
  });
}

function extractClassificationValue(work: any, graph: any[], type: string): string | null {
  const classifications = Array.isArray(work['bf:classification']) 
    ? work['bf:classification'] 
    : [work['bf:classification']];
  
  for (const c of classifications) {
    const cNode = resolveReference(c, graph);
    const cType = Array.isArray(cNode?.['@type']) ? cNode['@type'] : [cNode?.['@type']];
    
    if (cType.some((t: string) => t?.includes(type))) {
      return cNode?.['bf:classificationPortion'] || cNode?.['rdf:value'] || null;
    }
  }
  
  return null;
}

function getMainContribution(work: any, graph: any[]): any {
  const contributions = Array.isArray(work['bf:contribution']) 
    ? work['bf:contribution'] 
    : [work['bf:contribution']];
  
  // First contribution is typically main entry
  return resolveReference(contributions[0], graph);
}

function getAdditionalContributions(work: any, graph: any[]): any[] {
  const contributions = Array.isArray(work['bf:contribution']) 
    ? work['bf:contribution'] 
    : [work['bf:contribution']];
  
  // Skip first (main entry)
  return contributions.slice(1).map(c => resolveReference(c, graph)).filter(Boolean);
}

function extractAgentName(contribution: any, graph: any[]): string | null {
  if (!contribution) return null;
  
  const agentRef = contribution['bf:agent'];
  const agentNode = resolveReference(agentRef, graph);
  
  return agentNode?.['rdfs:label'] || agentNode?.['bf:name'] || null;
}

function extractRole(contribution: any, graph: any[]): string | null {
  if (!contribution) return null;
  
  const roleRef = contribution['bf:role'];
  const roleNode = resolveReference(roleRef, graph);
  
  return roleNode?.['rdfs:label'] || roleRef?.['@id']?.split('/').pop() || null;
}

function extractTitle(work: any, graph: any[]): any {
  const titleRef = work['bf:title'];
  return resolveReference(titleRef, graph);
}

function extractProvisionPlace(instance: any, graph: any[]): string | null {
  const provisionRef = instance['bf:provisionActivity'];
  const provisionNode = resolveReference(provisionRef, graph);
  
  const placeRef = provisionNode?.['bf:place'];
  const placeNode = resolveReference(placeRef, graph);
  
  return placeNode?.['rdfs:label'] || null;
}

function extractProvisionAgent(instance: any, graph: any[]): string | null {
  const provisionRef = instance['bf:provisionActivity'];
  const provisionNode = resolveReference(provisionRef, graph);
  
  const agentRef = provisionNode?.['bf:agent'];
  const agentNode = resolveReference(agentRef, graph);
  
  return agentNode?.['rdfs:label'] || agentNode?.['bf:name'] || null;
}

function extractProvisionDate(instance: any, graph: any[]): string | null {
  const provisionRef = instance['bf:provisionActivity'];
  const provisionNode = resolveReference(provisionRef, graph);
  
  return provisionNode?.['bf:date'] || null;
}

function extractExtent(instance: any, graph: any[]): string | null {
  const extentRef = instance['bf:extent'];
  const extentNode = resolveReference(extentRef, graph);
  
  return extentNode?.['rdfs:label'] || instance['bf:extent'] || null;
}

function extractIllustrativeContent(instance: any, graph: any[]): string | null {
  const illustrativeRef = instance['bf:illustrativeContent'];
  const illustrativeNode = resolveReference(illustrativeRef, graph);
  
  return illustrativeNode?.['rdfs:label'] || null;
}

function extractNote(entity: any, graph: any[]): string | null {
  const noteRef = entity['bf:note'];
  const noteNode = resolveReference(noteRef, graph);
  
  return noteNode?.['rdfs:label'] || noteNode?.['bf:noteType'] || null;
}

function extractSubjectLabel(work: any, graph: any[]): string | null {
  const subjectRef = work['bf:subject'];
  const subjectNode = resolveReference(subjectRef, graph);
  
  return subjectNode?.['rdfs:label'] || subjectRef?.['@id']?.split('/').pop() || null;
}

function resolveReference(ref: any, graph: any[]): any {
  if (!ref) return null;
  
  // Already resolved
  if (ref['@type'] && !ref['@id']) return ref;
  
  // URI reference
  if (typeof ref === 'string') {
    return graph.find(n => n['@id'] === ref);
  }
  
  // Object with @id
  if (ref['@id']) {
    const resolved = graph.find(n => n['@id'] === ref['@id']);
    return resolved || ref;
  }
  
  return ref;
}
