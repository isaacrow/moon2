/**
 * JSON-LD Graph Parser
 * Parses @graph structures and resolves node references
 */

import type { BF3Work, BF3Instance } from '../types/bibframe3-strict';

interface GraphNode {
  '@id': string;
  '@type': string | string[];
  [key: string]: any;
}

interface ParsedGraph {
  work: BF3Work | null;
  instances: BF3Instance[];
  nodeMap: Record<string, GraphNode>;
}

/**
 * Parse JSON-LD @graph and create node map
 */
export function parseGraph(jsonld: any): ParsedGraph {
  const graph: GraphNode[] = jsonld['@graph'] || [];
  
  // Create node map indexed by @id
  const nodeMap: Record<string, GraphNode> = {};
  graph.forEach(node => {
    if (node['@id']) {
      nodeMap[node['@id']] = node;
    }
  });

  // Find Work node(s)
  const workNode = graph.find(n => {
    const type = n['@type'];
    return type === 'bf:Work' || 
           (Array.isArray(type) && type.includes('bf:Work'));
  });

  // Find Instance node(s)
  const instanceNodes = graph.filter(n => {
    const type = n['@type'];
    return type === 'bf:Instance' || 
           (Array.isArray(type) && type.includes('bf:Instance'));
  });

  const work = workNode ? resolveWorkReferences(workNode, nodeMap) : null;
  const instances = instanceNodes.map(inst => resolveInstanceReferences(inst, nodeMap));

  return {
    work,
    instances,
    nodeMap
  };
}

/**
 * Resolve all URI references in a Work node
 */
function resolveWorkReferences(workNode: GraphNode, nodeMap: Record<string, GraphNode>): BF3Work {
  const work: any = {
    '@type': workNode['@type'],
    '@id': workNode['@id'],
  };

  // Resolve bf:title reference
  if (workNode['bf:title']) {
    const titleRef = workNode['bf:title'];
    if (typeof titleRef === 'string' && nodeMap[titleRef]) {
      const titleNode = nodeMap[titleRef];
      work['bf:title'] = {
        '@type': titleNode['@type'],
        '@id': titleNode['@id'],
        'bf:mainTitle': titleNode['bf:mainTitle'],
        'bf:subtitle': titleNode['bf:subtitle'],
        'bf:partNumber': titleNode['bf:partNumber'],
        'bf:partName': titleNode['bf:partName'],
      };
    } else if (typeof titleRef === 'object') {
      work['bf:title'] = titleRef;
    }
  }

  // Resolve bf:contribution references
  if (workNode['bf:contribution']) {
    const contributions = Array.isArray(workNode['bf:contribution']) 
      ? workNode['bf:contribution'] 
      : [workNode['bf:contribution']];

    work['bf:contribution'] = contributions.map(contribRef => {
      if (typeof contribRef === 'string' && nodeMap[contribRef]) {
        const contribNode = nodeMap[contribRef];
        const resolved: any = {
          '@type': contribNode['@type'],
          '@id': contribNode['@id'],
        };

        // Resolve agent reference
        if (contribNode['bf:agent']) {
          const agentRef = contribNode['bf:agent'];
          if (typeof agentRef === 'string' && nodeMap[agentRef]) {
            const agentNode = nodeMap[agentRef];
            resolved['bf:agent'] = {
              '@type': agentNode['@type'],
              '@id': agentNode['@id'],
              'rdfs:label': agentNode['rdfs:label'],
            };
          } else if (typeof agentRef === 'object') {
            resolved['bf:agent'] = agentRef;
          }
        }

        // Resolve role reference
        if (contribNode['bf:role']) {
          const roleRef = contribNode['bf:role'];
          if (typeof roleRef === 'string' && nodeMap[roleRef]) {
            const roleNode = nodeMap[roleRef];
            resolved['bf:role'] = {
              '@id': roleNode['@id'],
              'rdfs:label': roleNode['rdfs:label'],
            };
          } else if (typeof roleRef === 'object') {
            resolved['bf:role'] = roleRef;
          }
        }

        return resolved;
      }
      return contribRef;
    });
  }

  // Resolve bf:subject references
  if (workNode['bf:subject']) {
    const subjects = Array.isArray(workNode['bf:subject']) 
      ? workNode['bf:subject'] 
      : [workNode['bf:subject']];

    work['bf:subject'] = subjects.map(subjRef => {
      if (typeof subjRef === 'string' && nodeMap[subjRef]) {
        const subjNode = nodeMap[subjRef];
        return {
          '@type': subjNode['@type'],
          '@id': subjNode['@id'],
          'rdfs:label': subjNode['rdfs:label'],
          'bf:source': subjNode['bf:source'],
        };
      }
      return subjRef;
    });
  }

  // Resolve bf:classification references
  if (workNode['bf:classification']) {
    const classifications = Array.isArray(workNode['bf:classification'])
      ? workNode['bf:classification']
      : [workNode['bf:classification']];

    work['bf:classification'] = classifications.map(classRef => {
      if (typeof classRef === 'string' && nodeMap[classRef]) {
        const classNode = nodeMap[classRef];
        return {
          '@type': classNode['@type'],
          '@id': classNode['@id'],
          'bf:classificationPortion': classNode['bf:classificationPortion'],
          'bf:itemPortion': classNode['bf:itemPortion'],
          'bf:source': classNode['bf:source'],
        };
      }
      return classRef;
    });
  }

  // Resolve bf:language references
  if (workNode['bf:language']) {
    const languages = Array.isArray(workNode['bf:language'])
      ? workNode['bf:language']
      : [workNode['bf:language']];

    work['bf:language'] = languages.map(langRef => {
      if (typeof langRef === 'string' && nodeMap[langRef]) {
        const langNode = nodeMap[langRef];
        return {
          '@id': langNode['@id'],
          'rdfs:label': langNode['rdfs:label'],
        };
      }
      return langRef;
    });
  }

  // Copy other properties directly
  const directProps = [
    'bf:content',
    'bf:genreForm',
    'bf:geographicCoverage',
    'bf:temporalCoverage',
    'bf:originDate',
    'bf:originPlace',
    'bf:intendedAudience',
    'bf:note',
    'bf:tableOfContents',
    'bf:summary',
  ];

  directProps.forEach(prop => {
    if (workNode[prop]) {
      work[prop] = workNode[prop];
    }
  });

  return work as BF3Work;
}

/**
 * Resolve all URI references in an Instance node
 */
function resolveInstanceReferences(instanceNode: GraphNode, nodeMap: Record<string, GraphNode>): BF3Instance {
  const instance: any = {
    '@type': instanceNode['@type'],
    '@id': instanceNode['@id'],
  };

  // Resolve bf:instanceOf reference
  if (instanceNode['bf:instanceOf']) {
    const workRef = instanceNode['bf:instanceOf'];
    if (typeof workRef === 'string') {
      instance['bf:instanceOf'] = { '@id': workRef };
    } else if (typeof workRef === 'object') {
      instance['bf:instanceOf'] = workRef;
    }
  }

  // Resolve bf:title reference
  if (instanceNode['bf:title']) {
    const titleRef = instanceNode['bf:title'];
    if (typeof titleRef === 'string' && nodeMap[titleRef]) {
      const titleNode = nodeMap[titleRef];
      instance['bf:title'] = {
        '@type': titleNode['@type'],
        '@id': titleNode['@id'],
        'bf:mainTitle': titleNode['bf:mainTitle'],
        'bf:subtitle': titleNode['bf:subtitle'],
      };
    } else if (typeof titleRef === 'object') {
      instance['bf:title'] = titleRef;
    }
  }

  // Resolve bf:provisionActivity references
  if (instanceNode['bf:provisionActivity']) {
    const activities = Array.isArray(instanceNode['bf:provisionActivity'])
      ? instanceNode['bf:provisionActivity']
      : [instanceNode['bf:provisionActivity']];

    instance['bf:provisionActivity'] = activities.map(activityRef => {
      if (typeof activityRef === 'string' && nodeMap[activityRef]) {
        const activityNode = nodeMap[activityRef];
        const resolved: any = {
          '@type': activityNode['@type'],
          '@id': activityNode['@id'],
          'bf:date': activityNode['bf:date'],
        };

        // Resolve agent reference
        if (activityNode['bf:agent']) {
          const agentRef = activityNode['bf:agent'];
          if (typeof agentRef === 'string' && nodeMap[agentRef]) {
            const agentNode = nodeMap[agentRef];
            resolved['bf:agent'] = {
              '@type': agentNode['@type'],
              '@id': agentNode['@id'],
              'rdfs:label': agentNode['rdfs:label'],
            };
          } else if (typeof agentRef === 'object') {
            resolved['bf:agent'] = agentRef;
          }
        }

        // Resolve place reference
        if (activityNode['bf:place']) {
          const placeRef = activityNode['bf:place'];
          if (typeof placeRef === 'string' && nodeMap[placeRef]) {
            const placeNode = nodeMap[placeRef];
            resolved['bf:place'] = {
              '@id': placeNode['@id'],
              'rdfs:label': placeNode['rdfs:label'],
            };
          } else if (typeof placeRef === 'object') {
            resolved['bf:place'] = placeRef;
          }
        }

        return resolved;
      }
      return activityRef;
    });
  }

  // Resolve bf:identifiedBy references
  if (instanceNode['bf:identifiedBy']) {
    const identifiers = Array.isArray(instanceNode['bf:identifiedBy'])
      ? instanceNode['bf:identifiedBy']
      : [instanceNode['bf:identifiedBy']];

    instance['bf:identifiedBy'] = identifiers.map(idRef => {
      if (typeof idRef === 'string' && nodeMap[idRef]) {
        const idNode = nodeMap[idRef];
        return {
          '@type': idNode['@type'],
          '@id': idNode['@id'],
          'rdf:value': idNode['rdf:value'],
          'bf:qualifier': idNode['bf:qualifier'],
        };
      }
      return idRef;
    });
  }

  // Copy other properties directly
  const directProps = [
    'bf:extent',
    'bf:dimensions',
    'bf:editionStatement',
    'bf:responsibilityStatement',
    'bf:carrier',
    'bf:media',
    'bf:issuance',
    'bf:note',
  ];

  directProps.forEach(prop => {
    if (instanceNode[prop]) {
      instance[prop] = instanceNode[prop];
    }
  });

  return instance as BF3Instance;
}

/**
 * Extract resolved data for form population
 */
export function extractFormData(work: BF3Work | null) {
  if (!work) return null;

  const formData: any = {
    '@id': work['@id'],
    '@type': work['@type'],
  };

  // Extract title
  if (work['bf:title']) {
    const title = work['bf:title'];
    formData.mainTitle = title['bf:mainTitle'];
    formData.subtitle = title['bf:subtitle'];
    formData.partNumber = title['bf:partNumber'];
    formData.partName = title['bf:partName'];
  }

  // Extract contributions
  if (work['bf:contribution']) {
    formData.contributions = work['bf:contribution'].map(contrib => ({
      agentLabel: contrib['bf:agent']?.['rdfs:label'],
      roleLabel: contrib['bf:role']?.['rdfs:label'],
      roleId: contrib['bf:role']?.['@id'],
    }));
  }

  // Extract subjects
  if (work['bf:subject']) {
    formData.subjects = work['bf:subject'].map(subj => ({
      label: subj['rdfs:label'],
      type: subj['@type'],
      source: subj['bf:source'],
    }));
  }

  // Extract classifications
  if (work['bf:classification']) {
    formData.classifications = work['bf:classification'].map(cls => ({
      portion: cls['bf:classificationPortion'],
      item: cls['bf:itemPortion'],
      source: cls['bf:source'],
    }));
  }

  // Direct properties
  formData.content = work['bf:content'];
  formData.genreForm = work['bf:genreForm'];
  formData.language = work['bf:language'];
  formData.originDate = work['bf:originDate'];
  formData.summary = work['bf:summary'];

  return formData;
}
