/**
 * Sonic Graph Resolver
 * 
 * Resolves JSON-LD @graph structures back into Work and Instance entities
 * Enables full round-trip: Export → Import → No data loss
 * 
 * Features:
 * - Parses @graph arrays
 * - Indexes nodes by @id
 * - Resolves linked nodes (Title, Contribution, Subject, etc.)
 * - Rehydrates UI form fields
 * 
 * @version 1.0.0
 */

import type { BF3Work, BF3Instance, BF3Graph } from '../types/bibframe3';

interface NodeIndex {
  [id: string]: any;
}

interface ResolvedGraph {
  work: BF3Work | null;
  instance: BF3Instance | null;
}

export class SonicGraphResolver {
  private nodeIndex: NodeIndex = {};

  /**
   * Resolve a JSON-LD graph into Work and Instance entities
   */
  async resolveGraph(jsonld: any): Promise<ResolvedGraph> {
    // Reset index
    this.nodeIndex = {};

    // Handle different JSON-LD formats
    let graphArray: any[] = [];

    if (jsonld['@graph'] && Array.isArray(jsonld['@graph'])) {
      // Standard @graph format
      graphArray = jsonld['@graph'];
    } else if (Array.isArray(jsonld)) {
      // Array of nodes
      graphArray = jsonld;
    } else if (jsonld['@type']) {
      // Single node
      graphArray = [jsonld];
    } else if (jsonld.work && jsonld.instance) {
      // Moon Engine legacy format
      return {
        work: jsonld.work,
        instance: jsonld.instance
      };
    }

    // Index all nodes by @id
    this.indexNodes(graphArray);

    // Find Work and Instance root nodes
    const workNode = this.findWorkNode(graphArray);
    const instanceNode = this.findInstanceNode(graphArray);

    if (!workNode || !instanceNode) {
      throw new Error('Could not find Work or Instance in graph');
    }

    // Resolve Work entity
    const work = await this.resolveWork(workNode);

    // Resolve Instance entity
    const instance = await this.resolveInstance(instanceNode);

    return { work, instance };
  }

  /**
   * Index all nodes by @id for quick lookup
   */
  private indexNodes(nodes: any[]): void {
    for (const node of nodes) {
      if (node['@id']) {
        this.nodeIndex[node['@id']] = node;
      }
    }
  }

  /**
   * Find the root Work node
   */
  private findWorkNode(nodes: any[]): any | null {
    return nodes.find(node => 
      node['@type'] === 'bf:Work' || 
      node['@type']?.includes('bf:Work') ||
      node['@type']?.includes('Work')
    ) || null;
  }

  /**
   * Find the root Instance node
   */
  private findInstanceNode(nodes: any[]): any | null {
    return nodes.find(node => 
      node['@type'] === 'bf:Instance' || 
      node['@type']?.includes('bf:Instance') ||
      node['@type']?.includes('Instance')
    ) || null;
  }

  /**
   * Resolve a node reference (follow @id)
   */
  private resolveRef(ref: any): any {
    if (typeof ref === 'object' && ref['@id']) {
      const nodeId = ref['@id'];
      return this.nodeIndex[nodeId] || ref;
    }
    return ref;
  }

  /**
   * Resolve Work entity with all nested properties
   */
  private async resolveWork(workNode: any): Promise<BF3Work> {
    const work: BF3Work = {
      '@type': workNode['@type'] || 'bf:Work',
      '@id': workNode['@id']
    };

    // Resolve Title
    if (workNode['bf:hasTitle']) {
      const titleRefs = Array.isArray(workNode['bf:hasTitle']) 
        ? workNode['bf:hasTitle'] 
        : [workNode['bf:hasTitle']];
      
      const resolvedTitles = titleRefs.map(ref => this.resolveRef(ref));
      work['bf:hasTitle'] = resolvedTitles.length === 1 
        ? resolvedTitles[0] 
        : resolvedTitles;
    }

    // Resolve Contribution
    if (workNode['bf:contribution']) {
      const contribRefs = Array.isArray(workNode['bf:contribution']) 
        ? workNode['bf:contribution'] 
        : [workNode['bf:contribution']];
      
      const resolvedContribs = contribRefs.map(ref => {
        const contrib = this.resolveRef(ref);
        
        // Resolve nested agent
        if (contrib['bf:agent']) {
          contrib['bf:agent'] = this.resolveRef(contrib['bf:agent']);
        }
        
        // Resolve nested role
        if (contrib['bf:role']) {
          contrib['bf:role'] = this.resolveRef(contrib['bf:role']);
        }
        
        return contrib;
      });

      work['bf:contribution'] = resolvedContribs.length === 1 
        ? resolvedContribs[0] 
        : resolvedContribs;
    }

    // Resolve Subject
    if (workNode['bf:subject']) {
      const subjectRefs = Array.isArray(workNode['bf:subject']) 
        ? workNode['bf:subject'] 
        : [workNode['bf:subject']];
      
      const resolvedSubjects = subjectRefs.map(ref => this.resolveRef(ref));
      work['bf:subject'] = resolvedSubjects.length === 1 
        ? resolvedSubjects[0] 
        : resolvedSubjects;
    }

    // Resolve Genre/Form
    if (workNode['bf:genreForm']) {
      const genreRefs = Array.isArray(workNode['bf:genreForm']) 
        ? workNode['bf:genreForm'] 
        : [workNode['bf:genreForm']];
      
      const resolvedGenres = genreRefs.map(ref => this.resolveRef(ref));
      work['bf:genreForm'] = resolvedGenres.length === 1 
        ? resolvedGenres[0] 
        : resolvedGenres;
    }

    // Resolve Classification
    if (workNode['bf:classification']) {
      const classRefs = Array.isArray(workNode['bf:classification']) 
        ? workNode['bf:classification'] 
        : [workNode['bf:classification']];
      
      const resolvedClasses = classRefs.map(ref => this.resolveRef(ref));
      work['bf:classification'] = resolvedClasses.length === 1 
        ? resolvedClasses[0] 
        : resolvedClasses;
    }

    // Resolve Summary
    if (workNode['bf:summary']) {
      const summaryRefs = Array.isArray(workNode['bf:summary']) 
        ? workNode['bf:summary'] 
        : [workNode['bf:summary']];
      
      const resolvedSummaries = summaryRefs.map(ref => this.resolveRef(ref));
      work['bf:summary'] = resolvedSummaries.length === 1 
        ? resolvedSummaries[0] 
        : resolvedSummaries;
    }

    // Resolve Language
    if (workNode['bf:language']) {
      const langRefs = Array.isArray(workNode['bf:language']) 
        ? workNode['bf:language'] 
        : [workNode['bf:language']];
      
      const resolvedLangs = langRefs.map(ref => this.resolveRef(ref));
      work['bf:language'] = resolvedLangs.length === 1 
        ? resolvedLangs[0] 
        : resolvedLangs;
    }

    // Resolve Note
    if (workNode['bf:note']) {
      const noteRefs = Array.isArray(workNode['bf:note']) 
        ? workNode['bf:note'] 
        : [workNode['bf:note']];
      
      const resolvedNotes = noteRefs.map(ref => this.resolveRef(ref));
      work['bf:note'] = resolvedNotes.length === 1 
        ? resolvedNotes[0] 
        : resolvedNotes;
    }

    // Copy simple properties
    if (workNode['bf:originDate']) {
      work['bf:originDate'] = workNode['bf:originDate'];
    }

    if (workNode['bf:content']) {
      work['bf:content'] = workNode['bf:content'];
    }

    if (workNode['bf:intendedAudience']) {
      work['bf:intendedAudience'] = workNode['bf:intendedAudience'];
    }

    if (workNode['bf:tableOfContents']) {
      work['bf:tableOfContents'] = workNode['bf:tableOfContents'];
    }

    return work;
  }

  /**
   * Resolve Instance entity with all nested properties
   */
  private async resolveInstance(instanceNode: any): Promise<BF3Instance> {
    const instance: BF3Instance = {
      '@type': instanceNode['@type'] || 'bf:Instance',
      '@id': instanceNode['@id'],
      'bf:instanceOf': instanceNode['bf:instanceOf'] || { '@id': 'unknown' }
    };

    // Resolve Title
    if (instanceNode['bf:hasTitle']) {
      const titleRefs = Array.isArray(instanceNode['bf:hasTitle']) 
        ? instanceNode['bf:hasTitle'] 
        : [instanceNode['bf:hasTitle']];
      
      const resolvedTitles = titleRefs.map(ref => this.resolveRef(ref));
      instance['bf:hasTitle'] = resolvedTitles.length === 1 
        ? resolvedTitles[0] 
        : resolvedTitles;
    }

    // Resolve Provision Activity
    if (instanceNode['bf:provisionActivity']) {
      const activityRefs = Array.isArray(instanceNode['bf:provisionActivity']) 
        ? instanceNode['bf:provisionActivity'] 
        : [instanceNode['bf:provisionActivity']];
      
      const resolvedActivities = activityRefs.map(ref => {
        const activity = this.resolveRef(ref);
        
        // Resolve nested agent
        if (activity['bf:agent']) {
          const agentRefs = Array.isArray(activity['bf:agent']) 
            ? activity['bf:agent'] 
            : [activity['bf:agent']];
          
          const resolvedAgents = agentRefs.map(agentRef => this.resolveRef(agentRef));
          activity['bf:agent'] = resolvedAgents.length === 1 
            ? resolvedAgents[0] 
            : resolvedAgents;
        }
        
        // Resolve nested place
        if (activity['bf:place']) {
          const placeRefs = Array.isArray(activity['bf:place']) 
            ? activity['bf:place'] 
            : [activity['bf:place']];
          
          const resolvedPlaces = placeRefs.map(placeRef => this.resolveRef(placeRef));
          activity['bf:place'] = resolvedPlaces.length === 1 
            ? resolvedPlaces[0] 
            : resolvedPlaces;
        }
        
        return activity;
      });

      instance['bf:provisionActivity'] = resolvedActivities.length === 1 
        ? resolvedActivities[0] 
        : resolvedActivities;
    }

    // Resolve Identifiers
    if (instanceNode['bf:identifiedBy']) {
      const identifierRefs = Array.isArray(instanceNode['bf:identifiedBy']) 
        ? instanceNode['bf:identifiedBy'] 
        : [instanceNode['bf:identifiedBy']];
      
      const resolvedIdentifiers = identifierRefs.map(ref => this.resolveRef(ref));
      instance['bf:identifiedBy'] = resolvedIdentifiers.length === 1 
        ? resolvedIdentifiers[0] 
        : resolvedIdentifiers;
    }

    // Resolve Extent
    if (instanceNode['bf:extent']) {
      const extentRefs = Array.isArray(instanceNode['bf:extent']) 
        ? instanceNode['bf:extent'] 
        : [instanceNode['bf:extent']];
      
      const resolvedExtents = extentRefs.map(ref => this.resolveRef(ref));
      instance['bf:extent'] = resolvedExtents.length === 1 
        ? resolvedExtents[0] 
        : resolvedExtents;
    }

    // Resolve Note
    if (instanceNode['bf:note']) {
      const noteRefs = Array.isArray(instanceNode['bf:note']) 
        ? instanceNode['bf:note'] 
        : [instanceNode['bf:note']];
      
      const resolvedNotes = noteRefs.map(ref => this.resolveRef(ref));
      instance['bf:note'] = resolvedNotes.length === 1 
        ? resolvedNotes[0] 
        : resolvedNotes;
    }

    // Copy simple properties
    if (instanceNode['bf:editionStatement']) {
      instance['bf:editionStatement'] = instanceNode['bf:editionStatement'];
    }

    if (instanceNode['bf:seriesStatement']) {
      instance['bf:seriesStatement'] = instanceNode['bf:seriesStatement'];
    }

    if (instanceNode['bf:responsibilityStatement']) {
      instance['bf:responsibilityStatement'] = instanceNode['bf:responsibilityStatement'];
    }

    if (instanceNode['bf:dimensions']) {
      instance['bf:dimensions'] = instanceNode['bf:dimensions'];
    }

    if (instanceNode['bf:copyrightDate']) {
      instance['bf:copyrightDate'] = instanceNode['bf:copyrightDate'];
    }

    if (instanceNode['bf:media']) {
      instance['bf:media'] = instanceNode['bf:media'];
    }

    if (instanceNode['bf:carrier']) {
      instance['bf:carrier'] = instanceNode['bf:carrier'];
    }

    if (instanceNode['bf:electronicLocator']) {
      instance['bf:electronicLocator'] = instanceNode['bf:electronicLocator'];
    }

    return instance;
  }

  /**
   * Validate that resolved graph is complete
   */
  validateResolved(work: BF3Work | null, instance: BF3Instance | null): boolean {
    if (!work || !instance) {
      return false;
    }

    // Check required properties
    if (!work['@id'] || !work['@type']) {
      return false;
    }

    if (!instance['@id'] || !instance['@type']) {
      return false;
    }

    if (!instance['bf:instanceOf']) {
      return false;
    }

    return true;
  }
}
