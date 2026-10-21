import { BIBFRAMERecord } from '../types/bibframe';

/**
 * Convert BIBFRAME record to XML format
 */
export function convertToXML(record: BIBFRAMERecord): string {
  const { work, instance } = record;
  
  // Handle undefined or null work/instance
  if (!work || !instance) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<bibframe xmlns="http://id.loc.gov/ontologies/bibframe/">\n  <!-- No data available -->\n</bibframe>';
  }
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<bibframe xmlns="http://id.loc.gov/ontologies/bibframe/">\n';
  
  // Work element
  xml += '  <work>\n';
  if (work['@id']) {
    xml += `    <id>${escapeXML(work['@id'])}</id>\n`;
  }
  
  if (work['bf:title']?.['bf:mainTitle']) {
    xml += `    <title>${escapeXML(work['bf:title']['bf:mainTitle'])}</title>\n`;
  }
  
  if (work['bf:creator'] && work['bf:creator'].length > 0) {
    xml += '    <creators>\n';
    work['bf:creator'].forEach((creator) => {
      xml += `      <creator uri="${escapeXML(creator.uri)}">${escapeXML(creator.label)}</creator>\n`;
    });
    xml += '    </creators>\n';
  }
  
  if (work['bf:contributor'] && work['bf:contributor'].length > 0) {
    xml += '    <contributors>\n';
    work['bf:contributor'].forEach((contributor) => {
      xml += `      <contributor uri="${escapeXML(contributor.uri)}">${escapeXML(contributor.label)}</contributor>\n`;
    });
    xml += '    </contributors>\n';
  }
  
  if (work['bf:subject'] && work['bf:subject'].length > 0) {
    xml += '    <subjects>\n';
    work['bf:subject'].forEach((subject) => {
      xml += `      <subject type="${escapeXML(subject.type)}" uri="${escapeXML(subject.uri)}">${escapeXML(subject.label)}</subject>\n`;
    });
    xml += '    </subjects>\n';
  }
  
  if (work['bf:genreForm'] && work['bf:genreForm'].length > 0) {
    xml += '    <genreForms>\n';
    work['bf:genreForm'].forEach((genre) => {
      xml += `      <genreForm uri="${escapeXML(genre.uri)}">${escapeXML(genre.label)}</genreForm>\n`;
    });
    xml += '    </genreForms>\n';
  }
  
  if (work['bf:classification'] && work['bf:classification'].length > 0) {
    xml += '    <classifications>\n';
    work['bf:classification'].forEach((classification) => {
      xml += `      <classification type="${escapeXML(classification['@type'])}">${escapeXML(classification['bf:classificationPortion'])}</classification>\n`;
    });
    xml += '    </classifications>\n';
  }
  
  xml += '  </work>\n';
  
  // Instance element
  xml += '  <instance>\n';
  if (instance['@id']) {
    xml += `    <id>${escapeXML(instance['@id'])}</id>\n`;
  }
  
  if (instance['bf:instanceOf']?.['@id']) {
    xml += `    <instanceOf>${escapeXML(instance['bf:instanceOf']['@id'])}</instanceOf>\n`;
  }
  
  if (instance['bf:title']?.['bf:mainTitle']) {
    xml += `    <title>${escapeXML(instance['bf:title']['bf:mainTitle'])}</title>\n`;
  }
  
  if (instance['bf:responsibilityStatement']) {
    xml += `    <responsibilityStatement>${escapeXML(instance['bf:responsibilityStatement'])}</responsibilityStatement>\n`;
  }
  
  if (instance['bf:editionStatement']) {
    xml += `    <editionStatement>${escapeXML(instance['bf:editionStatement'])}</editionStatement>\n`;
  }
  
  if (instance['bf:provisionActivity'] && instance['bf:provisionActivity'].length > 0) {
    xml += '    <provisionActivities>\n';
    instance['bf:provisionActivity'].forEach((provision) => {
      xml += `      <provisionActivity type="${escapeXML(provision['@type'])}">\n`;
      if (provision['bf:place']?.['rdfs:label']) {
        xml += `        <place>${escapeXML(provision['bf:place']['rdfs:label'])}</place>\n`;
      }
      if (provision['bf:agent']?.['rdfs:label']) {
        xml += `        <agent>${escapeXML(provision['bf:agent']['rdfs:label'])}</agent>\n`;
      }
      if (provision['bf:date']) {
        xml += `        <date>${escapeXML(provision['bf:date'])}</date>\n`;
      }
      xml += '      </provisionActivity>\n';
    });
    xml += '    </provisionActivities>\n';
  }
  
  if (instance['bf:identifiedBy'] && instance['bf:identifiedBy'].length > 0) {
    xml += '    <identifiers>\n';
    instance['bf:identifiedBy'].forEach((identifier) => {
      xml += `      <identifier type="${escapeXML(identifier['@type'])}">${escapeXML(identifier['rdf:value'])}</identifier>\n`;
    });
    xml += '    </identifiers>\n';
  }
  
  if (instance['bf:extent']?.['rdfs:label']) {
    xml += `    <extent>${escapeXML(instance['bf:extent']['rdfs:label'])}</extent>\n`;
  }
  
  if (instance['bf:dimensions']) {
    xml += `    <dimensions>${escapeXML(instance['bf:dimensions'])}</dimensions>\n`;
  }
  
  xml += '  </instance>\n';
  xml += '</bibframe>';
  
  return xml;
}

/**
 * Convert BIBFRAME record to RDF/XML format
 */
export function convertToRDF(record: BIBFRAMERecord): string {
  const { work, instance } = record;
  
  // Handle undefined or null work/instance
  if (!work || !instance) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#" xmlns:bf="http://id.loc.gov/ontologies/bibframe/">\n  <!-- No data available -->\n</rdf:RDF>';
  }
  
  let rdf = '<?xml version="1.0" encoding="UTF-8"?>\n';
  rdf += '<rdf:RDF\n';
  rdf += '  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n';
  rdf += '  xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"\n';
  rdf += '  xmlns:bf="http://id.loc.gov/ontologies/bibframe/">\n\n';
  
  // Work resource
  rdf += `  <bf:Work rdf:about="${escapeXML(work['@id'] || '')}">\n`;
  
  if (work['bf:title']?.['bf:mainTitle']) {
    rdf += '    <bf:title>\n';
    rdf += '      <bf:Title>\n';
    rdf += `        <bf:mainTitle>${escapeXML(work['bf:title']['bf:mainTitle'])}</bf:mainTitle>\n`;
    rdf += '      </bf:Title>\n';
    rdf += '    </bf:title>\n';
  }
  
  if (work['bf:creator'] && work['bf:creator'].length > 0) {
    work['bf:creator'].forEach((creator) => {
      rdf += `    <bf:creator rdf:resource="${escapeXML(creator.uri)}"/>\n`;
    });
  }
  
  if (work['bf:contributor'] && work['bf:contributor'].length > 0) {
    work['bf:contributor'].forEach((contributor) => {
      rdf += `    <bf:contributor rdf:resource="${escapeXML(contributor.uri)}"/>\n`;
    });
  }
  
  if (work['bf:subject'] && work['bf:subject'].length > 0) {
    work['bf:subject'].forEach((subject) => {
      rdf += `    <bf:subject rdf:resource="${escapeXML(subject.uri)}"/>\n`;
    });
  }
  
  if (work['bf:genreForm'] && work['bf:genreForm'].length > 0) {
    work['bf:genreForm'].forEach((genre) => {
      rdf += `    <bf:genreForm rdf:resource="${escapeXML(genre.uri)}"/>\n`;
    });
  }
  
  if (work['bf:classification'] && work['bf:classification'].length > 0) {
    work['bf:classification'].forEach((classification) => {
      rdf += '    <bf:classification>\n';
      rdf += `      <${escapeXML(classification['@type'])}>\n`;
      rdf += `        <bf:classificationPortion>${escapeXML(classification['bf:classificationPortion'])}</bf:classificationPortion>\n`;
      rdf += `      </${escapeXML(classification['@type'])}>\n`;
      rdf += '    </bf:classification>\n';
    });
  }
  
  if (work['bf:language'] && work['bf:language'].length > 0) {
    work['bf:language'].forEach((lang) => {
      rdf += `    <bf:language rdf:resource="${escapeXML(lang['@id'])}"/>\n`;
    });
  }
  
  if (work['bf:content'] && work['bf:content'].length > 0) {
    work['bf:content'].forEach((content) => {
      rdf += `    <bf:content rdf:resource="${escapeXML(content['@id'])}"/>\n`;
    });
  }
  
  if (work['bf:summary'] && work['bf:summary'].length > 0) {
    work['bf:summary'].forEach((summary) => {
      rdf += '    <bf:summary>\n';
      rdf += '      <bf:Summary>\n';
      rdf += `        <rdfs:label>${escapeXML(summary['rdfs:label'])}</rdfs:label>\n`;
      rdf += '      </bf:Summary>\n';
      rdf += '    </bf:summary>\n';
    });
  }
  
  rdf += '  </bf:Work>\n\n';
  
  // Instance resource
  rdf += `  <bf:Instance rdf:about="${escapeXML(instance['@id'] || '')}">\n`;
  
  if (instance['bf:instanceOf']?.['@id']) {
    rdf += `    <bf:instanceOf rdf:resource="${escapeXML(instance['bf:instanceOf']['@id'])}"/>\n`;
  }
  
  if (instance['bf:title']?.['bf:mainTitle']) {
    rdf += '    <bf:title>\n';
    rdf += '      <bf:Title>\n';
    rdf += `        <bf:mainTitle>${escapeXML(instance['bf:title']['bf:mainTitle'])}</bf:mainTitle>\n`;
    rdf += '      </bf:Title>\n';
    rdf += '    </bf:title>\n';
  }
  
  if (instance['bf:responsibilityStatement']) {
    rdf += `    <bf:responsibilityStatement>${escapeXML(instance['bf:responsibilityStatement'])}</bf:responsibilityStatement>\n`;
  }
  
  if (instance['bf:editionStatement']) {
    rdf += `    <bf:editionStatement>${escapeXML(instance['bf:editionStatement'])}</bf:editionStatement>\n`;
  }
  
  if (instance['bf:provisionActivity'] && instance['bf:provisionActivity'].length > 0) {
    instance['bf:provisionActivity'].forEach((provision) => {
      rdf += '    <bf:provisionActivity>\n';
      rdf += `      <${escapeXML(provision['@type'])}>\n`;
      if (provision['bf:place']?.['rdfs:label']) {
        rdf += '        <bf:place>\n';
        rdf += '          <bf:Place>\n';
        rdf += `            <rdfs:label>${escapeXML(provision['bf:place']['rdfs:label'])}</rdfs:label>\n`;
        rdf += '          </bf:Place>\n';
        rdf += '        </bf:place>\n';
      }
      if (provision['bf:agent']?.['rdfs:label']) {
        rdf += '        <bf:agent>\n';
        rdf += '          <bf:Agent>\n';
        rdf += `            <rdfs:label>${escapeXML(provision['bf:agent']['rdfs:label'])}</rdfs:label>\n`;
        rdf += '          </bf:Agent>\n';
        rdf += '        </bf:agent>\n';
      }
      if (provision['bf:date']) {
        rdf += `        <bf:date>${escapeXML(provision['bf:date'])}</bf:date>\n`;
      }
      rdf += `      </${escapeXML(provision['@type'])}>\n`;
      rdf += '    </bf:provisionActivity>\n';
    });
  }
  
  if (instance['bf:identifiedBy'] && instance['bf:identifiedBy'].length > 0) {
    instance['bf:identifiedBy'].forEach((identifier) => {
      rdf += '    <bf:identifiedBy>\n';
      rdf += `      <${escapeXML(identifier['@type'])}>\n`;
      rdf += `        <rdf:value>${escapeXML(identifier['rdf:value'])}</rdf:value>\n`;
      rdf += `      </${escapeXML(identifier['@type'])}>\n`;
      rdf += '    </bf:identifiedBy>\n';
    });
  }
  
  if (instance['bf:carrier'] && instance['bf:carrier'].length > 0) {
    instance['bf:carrier'].forEach((carrier) => {
      rdf += `    <bf:carrier rdf:resource="${escapeXML(carrier['@id'])}"/>\n`;
    });
  }
  
  if (instance['bf:media'] && instance['bf:media'].length > 0) {
    instance['bf:media'].forEach((media) => {
      rdf += `    <bf:media rdf:resource="${escapeXML(media['@id'])}"/>\n`;
    });
  }
  
  if (instance['bf:extent']?.['rdfs:label']) {
    rdf += '    <bf:extent>\n';
    rdf += '      <bf:Extent>\n';
    rdf += `        <rdfs:label>${escapeXML(instance['bf:extent']['rdfs:label'])}</rdfs:label>\n`;
    rdf += '      </bf:Extent>\n';
    rdf += '    </bf:extent>\n';
  }
  
  if (instance['bf:dimensions']) {
    rdf += `    <bf:dimensions>${escapeXML(instance['bf:dimensions'])}</bf:dimensions>\n`;
  }
  
  rdf += '  </bf:Instance>\n';
  rdf += '</rdf:RDF>';
  
  return rdf;
}

function escapeXML(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
