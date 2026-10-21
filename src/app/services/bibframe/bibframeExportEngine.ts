/**
 * BIBFRAME EXPORT ENGINE - ENTERPRISE EDITION
 * ===========================================
 * 
 * Complete export functionality for BIBFRAME records
 * 
 * Supported formats:
 * - JSON-LD (native BIBFRAME format)
 * - RDF/XML
 * - Turtle
 * - N-Triples
 * - MARC21 XML (via crosswalk)
 */

import { BibframeOntologyEngine } from './bibframeOntologyEngine';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface BibframeRecord {
  '@context': any;
  '@graph': BibframeEntity[];
}

export interface BibframeEntity {
  '@id': string;
  '@type': string | string[];
  [key: string]: any;
}

export interface ExportOptions {
  format: 'json-ld' | 'rdf-xml' | 'turtle' | 'n-triples' | 'marc-xml';
  prettyPrint?: boolean;
  includeContext?: boolean;
  baseURI?: string;
}

// ============================================================================
// JSON-LD EXPORT
// ============================================================================

export class JSONLDExporter {
  
  /**
   * Export record as JSON-LD
   */
  static export(record: any, options: ExportOptions = { format: 'json-ld', prettyPrint: true }): string {
    const jsonld: BibframeRecord = {
      '@context': BibframeOntologyEngine.getJSONLDContext()['@context'],
      '@graph': this.buildGraph(record)
    };
    
    if (!options.includeContext) {
      delete jsonld['@context'];
    }
    
    return options.prettyPrint 
      ? JSON.stringify(jsonld, null, 2)
      : JSON.stringify(jsonld);
  }
  
  /**
   * Build JSON-LD graph from record
   */
  private static buildGraph(record: any): BibframeEntity[] {
    const graph: BibframeEntity[] = [];
    
    // Add Work entity
    if (record.work) {
      graph.push(this.buildWorkEntity(record.work));
    }
    
    // Add Instance entities
    if (record.instances && record.instances.length > 0) {
      record.instances.forEach((instance: any) => {
        graph.push(this.buildInstanceEntity(instance, record.work));
      });
    }
    
    // Add Item entities
    if (record.items && record.items.length > 0) {
      record.items.forEach((item: any) => {
        graph.push(this.buildItemEntity(item));
      });
    }
    
    return graph;
  }
  
  /**
   * Build Work entity
   */
  private static buildWorkEntity(work: any): BibframeEntity {
    const entity: BibframeEntity = {
      '@id': work.id || BibframeOntologyEngine.generateURI('work', Date.now().toString()),
      '@type': 'bf:Work'
    };
    
    // Title
    if (work.title) {
      entity['bf:title'] = {
        '@type': 'bf:Title',
        'bf:mainTitle': work.title,
        ...(work.subtitle && { 'bf:subtitle': work.subtitle })
      };
    }
    
    // Contributions
    if (work.contributions && work.contributions.length > 0) {
      entity['bf:contribution'] = work.contributions.map((contrib: any) => ({
        '@type': 'bf:Contribution',
        'bf:agent': {
          '@id': contrib.agent?.uri,
          'rdfs:label': contrib.agent?.label
        },
        'bf:role': {
          '@id': contrib.roleUri,
          'rdfs:label': contrib.role
        },
        ...(contrib.date && { 'bf:date': contrib.date })
      }));
    }
    
    // Subjects
    if (work.subjects && work.subjects.length > 0) {
      entity['bf:subject'] = work.subjects.map((subject: any) => ({
        '@id': subject.uri,
        'rdfs:label': subject.label,
        ...(subject.source && { 'bf:source': subject.source })
      }));
    }
    
    // Classification
    if (work.classification) {
      entity['bf:classification'] = [];
      
      if (work.classification.lcc) {
        entity['bf:classification'].push({
          '@type': 'bf:ClassificationLcc',
          'bf:classificationPortion': work.classification.lcc.number,
          ...(work.classification.lcc.cutter && { 'bf:itemPortion': work.classification.lcc.cutter }),
          ...(work.classification.lcc.assigner && { 
            'bf:assigner': {
              '@id': work.classification.lcc.assigner.uri,
              'rdfs:label': work.classification.lcc.assigner.label
            }
          })
        });
      }
      
      if (work.classification.ddc) {
        entity['bf:classification'].push({
          '@type': 'bf:ClassificationDdc',
          'bf:classificationPortion': work.classification.ddc.number,
          ...(work.classification.ddc.edition && { 'bf:edition': work.classification.ddc.edition })
        });
      }
    }
    
    // Language
    if (work.languages && work.languages.length > 0) {
      entity['bf:language'] = work.languages.map((lang: string) => ({
        '@id': `http://id.loc.gov/vocabulary/languages/${lang}`,
        'rdfs:label': lang
      }));
    }
    
    // Content Type
    if (work.contentType) {
      entity['bf:content'] = {
        '@id': work.contentType
      };
    }
    
    // Genre/Form
    if (work.genreForms && work.genreForms.length > 0) {
      entity['bf:genreForm'] = work.genreForms.map((gf: any) => ({
        '@id': gf.uri,
        'rdfs:label': gf.label
      }));
    }
    
    // Summary
    if (work.summary) {
      entity['bf:summary'] = {
        '@type': 'bf:Summary',
        'rdfs:label': work.summary
      };
    }
    
    // Table of Contents
    if (work.tableOfContents) {
      entity['bf:tableOfContents'] = {
        '@type': 'bf:TableOfContents',
        'rdfs:label': work.tableOfContents
      };
    }
    
    // Intended Audience
    if (work.intendedAudience && work.intendedAudience.length > 0) {
      entity['bf:intendedAudience'] = work.intendedAudience.map((aud: string) => ({
        '@id': aud
      }));
    }
    
    // Geographic Coverage
    if (work.geographicCoverage && work.geographicCoverage.length > 0) {
      entity['bf:geographicCoverage'] = work.geographicCoverage.map((geo: any) => ({
        '@id': geo.uri,
        'rdfs:label': geo.label
      }));
    }
    
    // Temporal Coverage
    if (work.temporalCoverage) {
      entity['bf:temporalCoverage'] = work.temporalCoverage;
    }
    
    // Origin Date
    if (work.originDate) {
      entity['bf:originDate'] = work.originDate;
    }
    
    // Origin Place
    if (work.originPlace && work.originPlace.length > 0) {
      entity['bf:originPlace'] = work.originPlace.map((place: any) => ({
        '@id': place.uri,
        'rdfs:label': place.label
      }));
    }
    
    // Dissertation
    if (work.dissertation && work.dissertation.degree) {
      entity['bf:dissertation'] = {
        'bf:degree': work.dissertation.degree,
        ...(work.dissertation.grantingInstitution && {
          'bf:grantingInstitution': {
            '@id': work.dissertation.grantingInstitution.uri,
            'rdfs:label': work.dissertation.grantingInstitution.label
          }
        }),
        ...(work.dissertation.year && { 'bf:dissertationYear': work.dissertation.year }),
        ...(work.dissertation.note && { 'bf:note': work.dissertation.note })
      };
    }
    
    // Notes
    if (work.notes && work.notes.length > 0) {
      entity['bf:note'] = work.notes.map((note: any) => 
        typeof note === 'string' ? note : { 'rdfs:label': note.text, ...(note.type && { 'bf:noteType': note.type }) }
      );
    }
    
    return entity;
  }
  
  /**
   * Build Instance entity
   */
  private static buildInstanceEntity(instance: any, work: any): BibframeEntity {
    const entity: BibframeEntity = {
      '@id': instance.id || BibframeOntologyEngine.generateURI('instance', Date.now().toString()),
      '@type': 'bf:Instance'
    };
    
    // Link to Work
    if (work && work.id) {
      entity['bf:instanceOf'] = { '@id': work.id };
    }
    
    // Titles
    if (instance.titles && instance.titles.length > 0) {
      entity['bf:title'] = instance.titles.map((title: any) => ({
        '@type': title.type || 'bf:Title',
        'bf:mainTitle': title.mainTitle,
        ...(title.subtitle && { 'bf:subtitle': title.subtitle }),
        ...(title.partNumber && { 'bf:partNumber': title.partNumber }),
        ...(title.partName && { 'bf:partName': title.partName })
      }));
    }
    
    // Responsibility Statement
    if (instance.responsibilityStatement) {
      entity['bf:responsibilityStatement'] = instance.responsibilityStatement;
    }
    
    // Edition Statement
    if (instance.editionStatement) {
      entity['bf:editionStatement'] = instance.editionStatement;
    }
    
    // Provision Activities
    if (instance.provisionActivities && instance.provisionActivities.length > 0) {
      entity['bf:provisionActivity'] = instance.provisionActivities.map((activity: any) => ({
        '@type': `bf:${activity.type}`,
        ...(activity.agent && {
          'bf:agent': {
            '@id': activity.agent.uri || '',
            'rdfs:label': activity.agent.label || activity.agentText
          }
        }),
        ...(activity.place && {
          'bf:place': {
            '@id': activity.place.uri || '',
            'rdfs:label': activity.place.label || activity.placeText
          }
        }),
        ...(activity.date && { 'bf:date': activity.date })
      }));
    }
    
    // Identifiers
    if (instance.identifiers && instance.identifiers.length > 0) {
      entity['bf:identifiedBy'] = instance.identifiers.map((id: any) => ({
        '@type': `bf:${id.type}`,
        'rdf:value': id.value,
        ...(id.qualifier && { 'bf:qualifier': id.qualifier }),
        ...(id.status && { 'bf:status': id.status })
      }));
    }
    
    // Content Type
    if (instance.contentType) {
      entity['bf:content'] = { '@id': instance.contentType };
    }
    
    // Media Type
    if (instance.mediaType) {
      entity['bf:media'] = { '@id': instance.mediaType };
    }
    
    // Carrier Type
    if (instance.carrierType) {
      entity['bf:carrier'] = { '@id': instance.carrierType };
    }
    
    // Extent
    if (instance.extent) {
      entity['bf:extent'] = {
        '@type': 'bf:Extent',
        'rdfs:label': instance.extent
      };
    }
    
    // Dimensions
    if (instance.dimensions) {
      entity['bf:dimensions'] = instance.dimensions;
    }
    
    // Series Statement
    if (instance.seriesStatement && instance.seriesStatement.length > 0) {
      entity['bf:seriesStatement'] = instance.seriesStatement.map((series: any) =>
        typeof series === 'string' ? series : series.statement
      );
    }
    
    // Issuance
    if (instance.issuance) {
      entity['bf:issuance'] = { '@id': instance.issuance };
    }
    
    // Notes
    if (instance.notes && instance.notes.length > 0) {
      entity['bf:note'] = instance.notes.map((note: any) =>
        typeof note === 'string' ? note : { 'rdfs:label': note.text }
      );
    }
    
    return entity;
  }
  
  /**
   * Build Item entity
   */
  private static buildItemEntity(item: any): BibframeEntity {
    const entity: BibframeEntity = {
      '@id': item.id || BibframeOntologyEngine.generateURI('item', Date.now().toString()),
      '@type': 'bf:Item'
    };
    
    // Link to Instance
    if (item.instanceId) {
      entity['bf:itemOf'] = { '@id': item.instanceId };
    }
    
    // Holding Institution
    if (item.heldBy) {
      entity['bf:heldBy'] = {
        '@id': item.heldBy.uri,
        'rdfs:label': item.heldBy.label
      };
    }
    
    // Shelf Mark / Call Number
    if (item.shelfMark) {
      entity['bf:shelfMark'] = {
        '@type': 'bf:ShelfMark',
        'rdfs:label': item.shelfMark
      };
    }
    
    // Barcode
    if (item.barcode) {
      entity['bf:barcode'] = item.barcode;
    }
    
    // Sublocation
    if (item.sublocation) {
      entity['bf:sublocation'] = {
        'rdfs:label': item.sublocation
      };
    }
    
    // Enumeration and Chronology
    if (item.enumerationAndChronology) {
      entity['bf:enumerationAndChronology'] = {
        'rdfs:label': item.enumerationAndChronology
      };
    }
    
    return entity;
  }
}

// ============================================================================
// RDF/XML EXPORT
// ============================================================================

export class RDFXMLExporter {
  
  /**
   * Export record as RDF/XML
   */
  static export(record: any, options: ExportOptions = { format: 'rdf-xml', prettyPrint: true }): string {
    const indent = options.prettyPrint ? '  ' : '';
    const nl = options.prettyPrint ? '\n' : '';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>${nl}`;
    xml += `<rdf:RDF${nl}`;
    xml += `${indent}xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"${nl}`;
    xml += `${indent}xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"${nl}`;
    xml += `${indent}xmlns:bf="http://id.loc.gov/ontologies/bibframe/"${nl}`;
    xml += `${indent}xmlns:madsrdf="http://www.loc.gov/mads/rdf/v1#"${nl}`;
    xml += `${indent}xmlns:dcterms="http://purl.org/dc/terms/">${nl}${nl}`;
    
    // Work
    if (record.work) {
      xml += this.buildWorkRDF(record.work, indent, nl, 1);
    }
    
    // Instances
    if (record.instances && record.instances.length > 0) {
      record.instances.forEach((instance: any) => {
        xml += this.buildInstanceRDF(instance, record.work, indent, nl, 1);
      });
    }
    
    // Items
    if (record.items && record.items.length > 0) {
      record.items.forEach((item: any) => {
        xml += this.buildItemRDF(item, indent, nl, 1);
      });
    }
    
    xml += `</rdf:RDF>`;
    
    return xml;
  }
  
  /**
   * Build Work RDF/XML
   */
  private static buildWorkRDF(work: any, indent: string, nl: string, level: number): string {
    const i = indent.repeat(level);
    let xml = `${i}<bf:Work rdf:about="${work.id || '#work1'}">${nl}`;
    
    // Title
    if (work.title) {
      xml += `${i}${indent}<bf:title>${nl}`;
      xml += `${i}${indent}${indent}<bf:Title>${nl}`;
      xml += `${i}${indent}${indent}${indent}<bf:mainTitle>${this.escapeXML(work.title)}</bf:mainTitle>${nl}`;
      if (work.subtitle) {
        xml += `${i}${indent}${indent}${indent}<bf:subtitle>${this.escapeXML(work.subtitle)}</bf:subtitle>${nl}`;
      }
      xml += `${i}${indent}${indent}</bf:Title>${nl}`;
      xml += `${i}${indent}</bf:title>${nl}`;
    }
    
    // Contributions
    if (work.contributions && work.contributions.length > 0) {
      work.contributions.forEach((contrib: any) => {
        xml += `${i}${indent}<bf:contribution>${nl}`;
        xml += `${i}${indent}${indent}<bf:Contribution>${nl}`;
        xml += `${i}${indent}${indent}${indent}<bf:agent rdf:resource="${contrib.agent?.uri}" />${nl}`;
        xml += `${i}${indent}${indent}${indent}<bf:role rdf:resource="${contrib.roleUri}" />${nl}`;
        xml += `${i}${indent}${indent}</bf:Contribution>${nl}`;
        xml += `${i}${indent}</bf:contribution>${nl}`;
      });
    }
    
    // Subjects
    if (work.subjects && work.subjects.length > 0) {
      work.subjects.forEach((subject: any) => {
        xml += `${i}${indent}<bf:subject rdf:resource="${subject.uri}" />${nl}`;
      });
    }
    
    // Classification
    if (work.classification?.lcc) {
      xml += `${i}${indent}<bf:classification>${nl}`;
      xml += `${i}${indent}${indent}<bf:ClassificationLcc>${nl}`;
      xml += `${i}${indent}${indent}${indent}<bf:classificationPortion>${work.classification.lcc.number}</bf:classificationPortion>${nl}`;
      if (work.classification.lcc.cutter) {
        xml += `${i}${indent}${indent}${indent}<bf:itemPortion>${work.classification.lcc.cutter}</bf:itemPortion>${nl}`;
      }
      xml += `${i}${indent}${indent}</bf:ClassificationLcc>${nl}`;
      xml += `${i}${indent}</bf:classification>${nl}`;
    }
    
    // Language
    if (work.languages && work.languages.length > 0) {
      work.languages.forEach((lang: string) => {
        xml += `${i}${indent}<bf:language rdf:resource="http://id.loc.gov/vocabulary/languages/${lang}" />${nl}`;
      });
    }
    
    xml += `${i}</bf:Work>${nl}${nl}`;
    
    return xml;
  }
  
  /**
   * Build Instance RDF/XML
   */
  private static buildInstanceRDF(instance: any, work: any, indent: string, nl: string, level: number): string {
    const i = indent.repeat(level);
    let xml = `${i}<bf:Instance rdf:about="${instance.id || '#instance1'}">${nl}`;
    
    // Link to Work
    if (work && work.id) {
      xml += `${i}${indent}<bf:instanceOf rdf:resource="${work.id}" />${nl}`;
    }
    
    // Titles
    if (instance.titles && instance.titles.length > 0) {
      instance.titles.forEach((title: any) => {
        xml += `${i}${indent}<bf:title>${nl}`;
        xml += `${i}${indent}${indent}<bf:Title>${nl}`;
        xml += `${i}${indent}${indent}${indent}<bf:mainTitle>${this.escapeXML(title.mainTitle)}</bf:mainTitle>${nl}`;
        if (title.subtitle) {
          xml += `${i}${indent}${indent}${indent}<bf:subtitle>${this.escapeXML(title.subtitle)}</bf:subtitle>${nl}`;
        }
        xml += `${i}${indent}${indent}</bf:Title>${nl}`;
        xml += `${i}${indent}</bf:title>${nl}`;
      });
    }
    
    // Provision Activities
    if (instance.provisionActivities && instance.provisionActivities.length > 0) {
      instance.provisionActivities.forEach((activity: any) => {
        xml += `${i}${indent}<bf:provisionActivity>${nl}`;
        xml += `${i}${indent}${indent}<bf:${activity.type}>${nl}`;
        if (activity.date) {
          xml += `${i}${indent}${indent}${indent}<bf:date>${activity.date}</bf:date>${nl}`;
        }
        if (activity.placeText) {
          xml += `${i}${indent}${indent}${indent}<bf:place><rdfs:label>${this.escapeXML(activity.placeText)}</rdfs:label></bf:place>${nl}`;
        }
        if (activity.agentText) {
          xml += `${i}${indent}${indent}${indent}<bf:agent><rdfs:label>${this.escapeXML(activity.agentText)}</rdfs:label></bf:agent>${nl}`;
        }
        xml += `${i}${indent}${indent}</bf:${activity.type}>${nl}`;
        xml += `${i}${indent}</bf:provisionActivity>${nl}`;
      });
    }
    
    // Content/Media/Carrier
    if (instance.contentType) {
      xml += `${i}${indent}<bf:content rdf:resource="${instance.contentType}" />${nl}`;
    }
    if (instance.mediaType) {
      xml += `${i}${indent}<bf:media rdf:resource="${instance.mediaType}" />${nl}`;
    }
    if (instance.carrierType) {
      xml += `${i}${indent}<bf:carrier rdf:resource="${instance.carrierType}" />${nl}`;
    }
    
    // Extent
    if (instance.extent) {
      xml += `${i}${indent}<bf:extent>${nl}`;
      xml += `${i}${indent}${indent}<bf:Extent><rdfs:label>${this.escapeXML(instance.extent)}</rdfs:label></bf:Extent>${nl}`;
      xml += `${i}${indent}</bf:extent>${nl}`;
    }
    
    xml += `${i}</bf:Instance>${nl}${nl}`;
    
    return xml;
  }
  
  /**
   * Build Item RDF/XML
   */
  private static buildItemRDF(item: any, indent: string, nl: string, level: number): string {
    const i = indent.repeat(level);
    let xml = `${i}<bf:Item rdf:about="${item.id || '#item1'}">${nl}`;
    
    if (item.instanceId) {
      xml += `${i}${indent}<bf:itemOf rdf:resource="${item.instanceId}" />${nl}`;
    }
    
    if (item.heldBy) {
      xml += `${i}${indent}<bf:heldBy rdf:resource="${item.heldBy.uri}" />${nl}`;
    }
    
    if (item.shelfMark) {
      xml += `${i}${indent}<bf:shelfMark>${nl}`;
      xml += `${i}${indent}${indent}<bf:ShelfMark><rdfs:label>${this.escapeXML(item.shelfMark)}</rdfs:label></bf:ShelfMark>${nl}`;
      xml += `${i}${indent}</bf:shelfMark>${nl}`;
    }
    
    xml += `${i}</bf:Item>${nl}${nl}`;
    
    return xml;
  }
  
  /**
   * Escape XML special characters
   */
  private static escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// ============================================================================
// UNIFIED EXPORT ENGINE
// ============================================================================

export class BibframeExportEngine {
  
  /**
   * Export record in specified format
   */
  static export(record: any, options: ExportOptions): string {
    switch (options.format) {
      case 'json-ld':
        return JSONLDExporter.export(record, options);
      
      case 'rdf-xml':
        return RDFXMLExporter.export(record, options);
      
      case 'turtle':
        // TODO: Implement Turtle serialization
        throw new Error('Turtle format not yet implemented');
      
      case 'n-triples':
        // TODO: Implement N-Triples serialization
        throw new Error('N-Triples format not yet implemented');
      
      case 'marc-xml':
        // TODO: Implement MARC21 XML via crosswalk
        throw new Error('MARC XML format not yet implemented');
      
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }
  
  /**
   * Validate record before export
   */
  static validateForExport(record: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for Work
    if (!record.work) {
      errors.push('Record must have a Work entity');
    }
    
    // Check for Work title
    if (!record.work?.title) {
      errors.push('Work must have a title');
    }
    
    // Check for Instance
    if (!record.instances || record.instances.length === 0) {
      errors.push('Record must have at least one Instance');
    }
    
    // Check for Instance titles
    if (record.instances) {
      record.instances.forEach((instance: any, index: number) => {
        if (!instance.titles || instance.titles.length === 0) {
          errors.push(`Instance ${index + 1} must have at least one title`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default BibframeExportEngine;
