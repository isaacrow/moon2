/**
 * Sonic Graph Builder
 * 
 * Builds valid BIBFRAME 3.0 JSON-LD @graph structures
 * Follows strict ontology compliance
 * 
 * @version 1.0.0
 */

import type { BF3Work, BF3Instance, BF3Graph, BF3Context } from '../types/bibframe3';

export class SonicGraphBuilder {
  /**
   * Build complete JSON-LD graph from Work and Instance
   */
  buildGraph(work: BF3Work, instance: BF3Instance): BF3Graph {
    const context = this.buildContext();
    const graph: any[] = [];

    // Add Work to graph with all nested entities expanded
    const expandedWork = this.expandWork(work);
    graph.push(...expandedWork);

    // Add Instance to graph with all nested entities expanded
    const expandedInstance = this.expandInstance(instance);
    graph.push(...expandedInstance);

    return {
      '@context': context,
      '@graph': graph
    };
  }

  /**
   * Build standard BIBFRAME 3.0 context
   */
  private buildContext(): BF3Context {
    return {
      '@vocab': 'http://id.loc.gov/ontologies/bibframe/',
      'bf': 'http://id.loc.gov/ontologies/bibframe/',
      'bflc': 'http://id.loc.gov/ontologies/bflc/',
      'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
      'xsd': 'http://www.w3.org/2001/XMLSchema#',
      'skos': 'http://www.w3.org/2004/02/skos/core#',
      'mads': 'http://www.loc.gov/mads/rdf/v1#'
    };
  }

  /**
   * Expand Work entity into graph nodes
   * Extracts nested entities (Title, Contribution, Subject, etc.) as separate nodes
   */
  private expandWork(work: BF3Work): any[] {
    const nodes: any[] = [];
    const workNode: any = {
      '@id': work['@id'],
      '@type': work['@type']
    };

    // Process Title
    if (work['bf:hasTitle']) {
      const titles = Array.isArray(work['bf:hasTitle']) 
        ? work['bf:hasTitle'] 
        : [work['bf:hasTitle']];
      
      workNode['bf:hasTitle'] = titles.map(title => {
        if (title['@id']) {
          // Add title as separate node
          nodes.push({
            '@id': title['@id'],
            '@type': title['@type'],
            'bf:mainTitle': title['bf:mainTitle'],
            ...(title['bf:subtitle'] && { 'bf:subtitle': title['bf:subtitle'] }),
            ...(title['bf:partNumber'] && { 'bf:partNumber': title['bf:partNumber'] }),
            ...(title['bf:partName'] && { 'bf:partName': title['bf:partName'] })
          });
          return { '@id': title['@id'] };
        }
        return title;
      });
    }

    // Process Contribution
    if (work['bf:contribution']) {
      const contributions = Array.isArray(work['bf:contribution']) 
        ? work['bf:contribution'] 
        : [work['bf:contribution']];
      
      workNode['bf:contribution'] = contributions.map(contrib => {
        if (contrib['@id']) {
          const contribNode: any = {
            '@id': contrib['@id'],
            '@type': contrib['@type']
          };

          // Agent
          if (contrib['bf:agent']) {
            if (typeof contrib['bf:agent'] === 'object' && 'rdfs:label' in contrib['bf:agent']) {
              // Inline agent
              const agent = contrib['bf:agent'];
              if (agent['@id']) {
                nodes.push({
                  '@id': agent['@id'],
                  '@type': agent['@type'],
                  'rdfs:label': agent['rdfs:label']
                });
                contribNode['bf:agent'] = { '@id': agent['@id'] };
              } else {
                contribNode['bf:agent'] = agent;
              }
            } else {
              contribNode['bf:agent'] = contrib['bf:agent'];
            }
          }

          // Role
          if (contrib['bf:role']) {
            if (typeof contrib['bf:role'] === 'object' && '@id' in contrib['bf:role']) {
              const role = contrib['bf:role'];
              if (role['rdfs:label']) {
                nodes.push({
                  '@id': role['@id'],
                  '@type': role['@type'] || 'bf:Role',
                  ...(role['rdfs:label'] && { 'rdfs:label': role['rdfs:label'] })
                });
              }
              contribNode['bf:role'] = { '@id': role['@id'] };
            } else {
              contribNode['bf:role'] = contrib['bf:role'];
            }
          }

          nodes.push(contribNode);
          return { '@id': contrib['@id'] };
        }
        return contrib;
      });
    }

    // Process Subject
    if (work['bf:subject']) {
      const subjects = Array.isArray(work['bf:subject']) 
        ? work['bf:subject'] 
        : [work['bf:subject']];
      
      workNode['bf:subject'] = subjects.map(subject => {
        if (subject['@id']) {
          nodes.push({
            '@id': subject['@id'],
            '@type': subject['@type'],
            'rdfs:label': subject['rdfs:label']
          });
          return { '@id': subject['@id'] };
        }
        return subject;
      });
    }

    // Process Genre/Form
    if (work['bf:genreForm']) {
      const genres = Array.isArray(work['bf:genreForm']) 
        ? work['bf:genreForm'] 
        : [work['bf:genreForm']];
      
      workNode['bf:genreForm'] = genres.map(genre => {
        if (genre['@id']) {
          nodes.push({
            '@id': genre['@id'],
            '@type': genre['@type'],
            'rdfs:label': genre['rdfs:label']
          });
          return { '@id': genre['@id'] };
        }
        return genre;
      });
    }

    // Process Classification
    if (work['bf:classification']) {
      const classifications = Array.isArray(work['bf:classification']) 
        ? work['bf:classification'] 
        : [work['bf:classification']];
      
      workNode['bf:classification'] = classifications.map(classification => {
        if (classification['@id']) {
          nodes.push({
            '@id': classification['@id'],
            '@type': classification['@type'],
            ...(classification['bf:classificationPortion'] && { 
              'bf:classificationPortion': classification['bf:classificationPortion'] 
            }),
            ...(classification['bf:itemPortion'] && { 
              'bf:itemPortion': classification['bf:itemPortion'] 
            })
          });
          return { '@id': classification['@id'] };
        }
        return classification;
      });
    }

    // Process Summary
    if (work['bf:summary']) {
      const summaries = Array.isArray(work['bf:summary']) 
        ? work['bf:summary'] 
        : [work['bf:summary']];
      
      workNode['bf:summary'] = summaries.map(summary => {
        if (summary['@id']) {
          nodes.push({
            '@id': summary['@id'],
            '@type': summary['@type'],
            'rdfs:label': summary['rdfs:label']
          });
          return { '@id': summary['@id'] };
        }
        return summary;
      });
    }

    // Process Language
    if (work['bf:language']) {
      const languages = Array.isArray(work['bf:language']) 
        ? work['bf:language'] 
        : [work['bf:language']];
      
      workNode['bf:language'] = languages.map(lang => {
        if (typeof lang === 'object' && lang['@id']) {
          if (lang['rdfs:label']) {
            nodes.push({
              '@id': lang['@id'],
              '@type': lang['@type'],
              'rdfs:label': lang['rdfs:label']
            });
          }
          return { '@id': lang['@id'] };
        }
        return lang;
      });
    }

    // Process Note
    if (work['bf:note']) {
      const notes = Array.isArray(work['bf:note']) 
        ? work['bf:note'] 
        : [work['bf:note']];
      
      workNode['bf:note'] = notes.map(note => {
        if (note['@id']) {
          nodes.push({
            '@id': note['@id'],
            '@type': note['@type'],
            'rdfs:label': note['rdfs:label'],
            ...(note['bf:noteType'] && { 'bf:noteType': note['bf:noteType'] })
          });
          return { '@id': note['@id'] };
        }
        return note;
      });
    }

    // Simple properties (no nesting)
    if (work['bf:originDate']) {
      workNode['bf:originDate'] = work['bf:originDate'];
    }

    if (work['bf:content']) {
      workNode['bf:content'] = work['bf:content'];
    }

    if (work['bf:intendedAudience']) {
      workNode['bf:intendedAudience'] = work['bf:intendedAudience'];
    }

    // Add work node last
    nodes.push(workNode);

    return nodes;
  }

  /**
   * Expand Instance entity into graph nodes
   */
  private expandInstance(instance: BF3Instance): any[] {
    const nodes: any[] = [];
    const instanceNode: any = {
      '@id': instance['@id'],
      '@type': instance['@type'],
      'bf:instanceOf': instance['bf:instanceOf']
    };

    // Process Title
    if (instance['bf:hasTitle']) {
      const titles = Array.isArray(instance['bf:hasTitle']) 
        ? instance['bf:hasTitle'] 
        : [instance['bf:hasTitle']];
      
      instanceNode['bf:hasTitle'] = titles.map(title => {
        if (title['@id']) {
          nodes.push({
            '@id': title['@id'],
            '@type': title['@type'],
            'bf:mainTitle': title['bf:mainTitle'],
            ...(title['bf:subtitle'] && { 'bf:subtitle': title['bf:subtitle'] })
          });
          return { '@id': title['@id'] };
        }
        return title;
      });
    }

    // Process Provision Activity
    if (instance['bf:provisionActivity']) {
      const activities = Array.isArray(instance['bf:provisionActivity']) 
        ? instance['bf:provisionActivity'] 
        : [instance['bf:provisionActivity']];
      
      instanceNode['bf:provisionActivity'] = activities.map(activity => {
        if (activity['@id']) {
          const activityNode: any = {
            '@id': activity['@id'],
            '@type': activity['@type']
          };

          // Agent
          if (activity['bf:agent']) {
            const agents = Array.isArray(activity['bf:agent']) 
              ? activity['bf:agent'] 
              : [activity['bf:agent']];
            
            activityNode['bf:agent'] = agents.map(agent => {
              if (typeof agent === 'object' && 'rdfs:label' in agent && agent['@id']) {
                nodes.push({
                  '@id': agent['@id'],
                  '@type': agent['@type'],
                  'rdfs:label': agent['rdfs:label']
                });
                return { '@id': agent['@id'] };
              }
              return agent;
            });
          }

          // Place
          if (activity['bf:place']) {
            const places = Array.isArray(activity['bf:place']) 
              ? activity['bf:place'] 
              : [activity['bf:place']];
            
            activityNode['bf:place'] = places.map(place => {
              if (typeof place === 'object' && 'rdfs:label' in place && place['@id']) {
                nodes.push({
                  '@id': place['@id'],
                  '@type': place['@type'],
                  'rdfs:label': place['rdfs:label']
                });
                return { '@id': place['@id'] };
              }
              return place;
            });
          }

          // Date
          if (activity['bf:date']) {
            activityNode['bf:date'] = activity['bf:date'];
          }

          nodes.push(activityNode);
          return { '@id': activity['@id'] };
        }
        return activity;
      });
    }

    // Process Identifiers
    if (instance['bf:identifiedBy']) {
      const identifiers = Array.isArray(instance['bf:identifiedBy']) 
        ? instance['bf:identifiedBy'] 
        : [instance['bf:identifiedBy']];
      
      instanceNode['bf:identifiedBy'] = identifiers.map(identifier => {
        if (identifier['@id']) {
          nodes.push({
            '@id': identifier['@id'],
            '@type': identifier['@type'],
            'rdf:value': identifier['rdf:value'],
            ...(identifier['bf:qualifier'] && { 'bf:qualifier': identifier['bf:qualifier'] })
          });
          return { '@id': identifier['@id'] };
        }
        return identifier;
      });
    }

    // Process Extent
    if (instance['bf:extent']) {
      const extents = Array.isArray(instance['bf:extent']) 
        ? instance['bf:extent'] 
        : [instance['bf:extent']];
      
      instanceNode['bf:extent'] = extents.map(extent => {
        if (extent['@id']) {
          nodes.push({
            '@id': extent['@id'],
            '@type': extent['@type'],
            'rdfs:label': extent['rdfs:label']
          });
          return { '@id': extent['@id'] };
        }
        return extent;
      });
    }

    // Simple properties
    if (instance['bf:editionStatement']) {
      instanceNode['bf:editionStatement'] = instance['bf:editionStatement'];
    }

    if (instance['bf:seriesStatement']) {
      instanceNode['bf:seriesStatement'] = instance['bf:seriesStatement'];
    }

    if (instance['bf:responsibilityStatement']) {
      instanceNode['bf:responsibilityStatement'] = instance['bf:responsibilityStatement'];
    }

    if (instance['bf:dimensions']) {
      instanceNode['bf:dimensions'] = instance['bf:dimensions'];
    }

    if (instance['bf:copyrightDate']) {
      instanceNode['bf:copyrightDate'] = instance['bf:copyrightDate'];
    }

    if (instance['bf:media']) {
      instanceNode['bf:media'] = instance['bf:media'];
    }

    if (instance['bf:carrier']) {
      instanceNode['bf:carrier'] = instance['bf:carrier'];
    }

    // Add instance node
    nodes.push(instanceNode);

    return nodes;
  }
}
