/**
 * RDF/XML and JSON-LD Parser for BIBFRAME Records
 * Handles parsing of Library of Congress BIBFRAME records from both RDF/XML and JSON-LD formats
 */

interface ParsedBIBFRAMERecord {
  '@context': {
    bf: string;
    rdfs: string;
    rdf: string;
    bflc?: string;
  };
  work: any;
  instance: any;
}

/**
 * Parse JSON-LD format from LOC into Moon BIBFRAME structure
 */
export function parseJSONLD(data: any, workUri: string): ParsedBIBFRAMERecord {
  const workData = data[workUri] || {};
  
  // Extract Work information
  const work: any = {
    '@type': 'bf:Work',
    '@id': workUri,
  };

  // Title
  const titlePreds = workData['http://id.loc.gov/ontologies/bibframe/title'] || [];
  if (titlePreds.length > 0) {
    const titleUri = typeof titlePreds[0] === 'string' ? titlePreds[0] : titlePreds[0]['@id'];
    const titleObj = data[titleUri] || {};
    
    work['bf:title'] = {
      '@type': 'bf:Title',
      'bf:mainTitle': titleObj['http://id.loc.gov/ontologies/bibframe/mainTitle']?.[0]?.['@value'] || 'Untitled',
    };
    
    if (titleObj['http://id.loc.gov/ontologies/bibframe/subtitle']) {
      work['bf:title']['bf:subtitle'] = titleObj['http://id.loc.gov/ontologies/bibframe/subtitle'][0]['@value'];
    }
  } else {
    // Fallback to label
    const label = workData['http://www.w3.org/2000/01/rdf-schema#label']?.[0]?.['@value'] || 'Untitled';
    work['bf:title'] = {
      '@type': 'bf:Title',
      'bf:mainTitle': label,
    };
  }

  // Contributors
  const contributions = workData['http://id.loc.gov/ontologies/bibframe/contribution'] || [];
  const creators: any[] = [];
  const contributors: any[] = [];
  
  for (const contrib of contributions) {
    const contribUri = typeof contrib === 'string' ? contrib : contrib['@id'];
    const contribObj = data[contribUri] || {};
    
    const agentRefs = contribObj['http://id.loc.gov/ontologies/bibframe/agent'] || [];
    if (agentRefs.length > 0) {
      const agentUri = typeof agentRefs[0] === 'string' ? agentRefs[0] : agentRefs[0]['@id'];
      const agentObj = data[agentUri] || {};
      
      const agentLabel = agentObj['http://www.w3.org/2000/01/rdf-schema#label']?.[0]?.['@value'] || 'Unknown';
      
      const role = contribObj['http://id.loc.gov/ontologies/bibframe/role']?.[0];
      const roleUri = typeof role === 'string' ? role : role?.['@id'];
      
      const agent = {
        uri: agentUri,
        label: agentLabel,
        type: 'Person',
        source: 'LOC',
      };
      
      // Check if primary contribution (creator vs contributor)
      const contribTypes = contribObj['@type'] || [];
      if (contribTypes.includes('http://id.loc.gov/ontologies/bibframe/PrimaryContribution')) {
        creators.push(agent);
      } else {
        contributors.push(agent);
      }
    }
  }
  
  if (creators.length > 0) work['bf:creator'] = creators;
  if (contributors.length > 0) work['bf:contributor'] = contributors;

  // Subjects
  const subjects = workData['http://id.loc.gov/ontologies/bibframe/subject'] || [];
  const subjectArray: any[] = [];
  
  for (const subj of subjects) {
    const subjUri = typeof subj === 'string' ? subj : subj['@id'];
    const subjObj = data[subjUri] || {};
    
    const subjLabel = subjObj['http://www.w3.org/2000/01/rdf-schema#label']?.[0]?.['@value'] 
                   || subjObj['http://www.loc.gov/mads/rdf/v1#authoritativeLabel']?.[0]?.['@value']
                   || 'Subject';
    
    subjectArray.push({
      uri: subjUri,
      label: subjLabel,
      type: 'Topic',
      source: 'LCSH',
    });
  }
  
  if (subjectArray.length > 0) work['bf:subject'] = subjectArray;

  // Classification
  const classifications = workData['http://id.loc.gov/ontologies/bibframe/classification'] || [];
  const classArray: any[] = [];
  
  for (const cls of classifications) {
    const clsUri = typeof cls === 'string' ? cls : cls['@id'];
    const clsObj = data[clsUri] || {};
    
    const classTypes = clsObj['@type'] || [];
    let classType = 'bf:Classification';
    
    if (classTypes.includes('http://id.loc.gov/ontologies/bibframe/ClassificationLcc')) {
      classType = 'bf:ClassificationLcc';
    } else if (classTypes.includes('http://id.loc.gov/ontologies/bibframe/ClassificationDdc')) {
      classType = 'bf:ClassificationDdc';
    }
    
    const portion = clsObj['http://id.loc.gov/ontologies/bibframe/classificationPortion']?.[0]?.['@value'];
    const itemPortion = clsObj['http://id.loc.gov/ontologies/bibframe/itemPortion']?.[0]?.['@value'];
    
    if (portion) {
      classArray.push({
        '@type': classType,
        'bf:classificationPortion': portion,
        'bf:itemPortion': itemPortion,
      });
    }
  }
  
  if (classArray.length > 0) work['bf:classification'] = classArray;

  // Language
  const languages = workData['http://id.loc.gov/ontologies/bibframe/language'] || [];
  const langArray: any[] = [];
  
  for (const lang of languages) {
    const langUri = typeof lang === 'string' ? lang : lang['@id'];
    const langObj = data[langUri] || {};
    
    langArray.push({
      '@type': 'bf:Language',
      '@id': langUri,
      'rdfs:label': langObj['http://www.w3.org/2000/01/rdf-schema#label']?.[0]?.['@value'] || langUri.split('/').pop(),
    });
  }
  
  if (langArray.length > 0) work['bf:language'] = langArray;

  // Content type
  const contents = workData['http://id.loc.gov/ontologies/bibframe/content'] || [];
  const contentArray: any[] = [];
  
  for (const content of contents) {
    const contentUri = typeof content === 'string' ? content : content['@id'];
    const contentObj = data[contentUri] || {};
    
    contentArray.push({
      '@type': 'bf:Content',
      '@id': contentUri,
      'rdfs:label': contentObj['http://www.w3.org/2000/01/rdf-schema#label']?.[0]?.['@value'] || 'text',
    });
  }
  
  if (contentArray.length > 0) work['bf:content'] = contentArray;

  // Summary
  const summaries = workData['http://id.loc.gov/ontologies/bibframe/summary'] || [];
  const summaryArray: any[] = [];
  
  for (const summ of summaries) {
    const summUri = typeof summ === 'string' ? summ : summ['@id'];
    const summObj = data[summUri] || {};
    
    summaryArray.push({
      '@type': 'bf:Summary',
      'rdfs:label': summObj['http://www.w3.org/2000/01/rdf-schema#label']?.[0]?.['@value'] || '',
    });
  }
  
  if (summaryArray.length > 0) work['bf:summary'] = summaryArray;

  // Notes
  const notes = workData['http://id.loc.gov/ontologies/bibframe/note'] || [];
  const noteArray: any[] = [];
  
  for (const note of notes) {
    const noteUri = typeof note === 'string' ? note : note['@id'];
    const noteObj = data[noteUri] || {};
    
    noteArray.push({
      '@type': 'bf:Note',
      'rdfs:label': noteObj['http://www.w3.org/2000/01/rdf-schema#label']?.[0]?.['@value'] || '',
    });
  }
  
  if (noteArray.length > 0) work['bf:note'] = noteArray;

  // Find Instance
  const instances = workData['http://id.loc.gov/ontologies/bibframe/hasInstance'] || [];
  let instance: any = {
    '@type': 'bf:Instance',
    '@id': `${workUri}/instance`,
    'bf:instanceOf': { '@id': workUri },
  };

  if (instances.length > 0) {
    const instanceUri = typeof instances[0] === 'string' ? instances[0] : instances[0]['@id'];
    const instanceData = data[instanceUri] || {};
    
    instance['@id'] = instanceUri;
    
    // Instance title
    const instTitles = instanceData['http://id.loc.gov/ontologies/bibframe/title'] || [];
    if (instTitles.length > 0) {
      const instTitleUri = typeof instTitles[0] === 'string' ? instTitles[0] : instTitles[0]['@id'];
      const instTitleObj = data[instTitleUri] || {};
      
      instance['bf:title'] = {
        '@type': 'bf:Title',
        'bf:mainTitle': instTitleObj['http://id.loc.gov/ontologies/bibframe/mainTitle']?.[0]?.['@value'] || work['bf:title']['bf:mainTitle'],
      };
      
      if (instTitleObj['http://id.loc.gov/ontologies/bibframe/subtitle']) {
        instance['bf:title']['bf:subtitle'] = instTitleObj['http://id.loc.gov/ontologies/bibframe/subtitle'][0]['@value'];
      }
    }
    
    // Responsibility statement
    const respStmt = instanceData['http://id.loc.gov/ontologies/bibframe/responsibilityStatement'];
    if (respStmt && respStmt.length > 0) {
      instance['bf:responsibilityStatement'] = respStmt[0]['@value'];
    }
    
    // Edition statement
    const editionStmt = instanceData['http://id.loc.gov/ontologies/bibframe/editionStatement'];
    if (editionStmt && editionStmt.length > 0) {
      instance['bf:editionStatement'] = editionStmt[0]['@value'];
    }
    
    // Provision activities (publication, etc.)
    const provisions = instanceData['http://id.loc.gov/ontologies/bibframe/provisionActivity'] || [];
    const provArray: any[] = [];
    
    for (const prov of provisions) {
      const provUri = typeof prov === 'string' ? prov : prov['@id'];
      const provObj = data[provUri] || {};
      
      const provTypes = provObj['@type'] || [];
      let provType = 'bf:Publication';
      if (provTypes.includes('http://id.loc.gov/ontologies/bibframe/Publication')) {
        provType = 'bf:Publication';
      } else if (provTypes.includes('http://id.loc.gov/ontologies/bibframe/Production')) {
        provType = 'bf:Production';
      } else if (provTypes.includes('http://id.loc.gov/ontologies/bibframe/Distribution')) {
        provType = 'bf:Distribution';
      }
      
      const provActivity: any = { '@type': provType };
      
      // Date
      const date = provObj['http://id.loc.gov/ontologies/bibframe/date'];
      if (date && date.length > 0) {
        provActivity['bf:date'] = date[0]['@value'];
      }
      
      // Place
      const places = provObj['http://id.loc.gov/ontologies/bibframe/place'] || [];
      if (places.length > 0) {
        const placeUri = typeof places[0] === 'string' ? places[0] : places[0]['@id'];
        const placeObj = data[placeUri] || {};
        
        provActivity['bf:place'] = {
          '@type': 'bf:Place',
          '@id': placeUri,
          'rdfs:label': placeObj['http://www.w3.org/2000/01/rdf-schema#label']?.[0]?.['@value'] || '',
        };
      }
      
      // Agent (publisher, etc.)
      const agents = provObj['http://id.loc.gov/ontologies/bibframe/agent'] || [];
      if (agents.length > 0) {
        const agentUri = typeof agents[0] === 'string' ? agents[0] : agents[0]['@id'];
        const agentObj = data[agentUri] || {};
        
        provActivity['bf:agent'] = {
          '@type': 'bf:Agent',
          '@id': agentUri,
          'rdfs:label': agentObj['http://www.w3.org/2000/01/rdf-schema#label']?.[0]?.['@value'] || '',
        };
      }
      
      provArray.push(provActivity);
    }
    
    if (provArray.length > 0) instance['bf:provisionActivity'] = provArray;
    
    // Identifiers (ISBN, LCCN, etc.)
    const identifiers = instanceData['http://id.loc.gov/ontologies/bibframe/identifiedBy'] || [];
    const idArray: any[] = [];
    
    for (const id of identifiers) {
      const idUri = typeof id === 'string' ? id : id['@id'];
      const idObj = data[idUri] || {};
      
      const idTypes = idObj['@type'] || [];
      let idType = 'bf:Identifier';
      
      if (idTypes.includes('http://id.loc.gov/ontologies/bibframe/Isbn')) {
        idType = 'bf:Isbn';
      } else if (idTypes.includes('http://id.loc.gov/ontologies/bibframe/Lccn')) {
        idType = 'bf:Lccn';
      }
      
      const value = idObj['http://www.w3.org/1999/02/22-rdf-syntax-ns#value'];
      if (value && value.length > 0) {
        idArray.push({
          '@type': idType,
          'rdf:value': value[0]['@value'],
        });
      }
    }
    
    if (idArray.length > 0) instance['bf:identifiedBy'] = idArray;
    
    // Issuance
    const issuances = instanceData['http://id.loc.gov/ontologies/bibframe/issuance'] || [];
    if (issuances.length > 0) {
      const issuanceUri = typeof issuances[0] === 'string' ? issuances[0] : issuances[0]['@id'];
      const issuanceObj = data[issuanceUri] || {};
      
      instance['bf:issuance'] = {
        '@type': 'bf:Issuance',
        '@id': issuanceUri,
        'rdfs:label': issuanceObj['http://www.w3.org/2000/01/rdf-schema#label']?.[0]?.['@value'] || 'single unit',
      };
    }
    
    // Media type
    const mediaTypes = instanceData['http://id.loc.gov/ontologies/bibframe/media'] || [];
    const mediaArray: any[] = [];
    
    for (const media of mediaTypes) {
      const mediaUri = typeof media === 'string' ? media : media['@id'];
      const mediaObj = data[mediaUri] || {};
      
      mediaArray.push({
        '@type': 'bf:Media',
        '@id': mediaUri,
        'rdfs:label': mediaObj['http://www.w3.org/2000/01/rdf-schema#label']?.[0]?.['@value'] || '',
      });
    }
    
    if (mediaArray.length > 0) instance['bf:media'] = mediaArray;
    
    // Carrier type
    const carriers = instanceData['http://id.loc.gov/ontologies/bibframe/carrier'] || [];
    const carrierArray: any[] = [];
    
    for (const carrier of carriers) {
      const carrierUri = typeof carrier === 'string' ? carrier : carrier['@id'];
      const carrierObj = data[carrierUri] || {};
      
      carrierArray.push({
        '@type': 'bf:Carrier',
        '@id': carrierUri,
        'rdfs:label': carrierObj['http://www.w3.org/2000/01/rdf-schema#label']?.[0]?.['@value'] || '',
      });
    }
    
    if (carrierArray.length > 0) instance['bf:carrier'] = carrierArray;
    
    // Extent
    const extents = instanceData['http://id.loc.gov/ontologies/bibframe/extent'] || [];
    if (extents.length > 0) {
      const extentUri = typeof extents[0] === 'string' ? extents[0] : extents[0]['@id'];
      const extentObj = data[extentUri] || {};
      
      instance['bf:extent'] = {
        '@type': 'bf:Extent',
        'rdfs:label': extentObj['http://www.w3.org/2000/01/rdf-schema#label']?.[0]?.['@value'] || '',
      };
    }
    
    // Dimensions
    const dimensions = instanceData['http://id.loc.gov/ontologies/bibframe/dimensions'];
    if (dimensions && dimensions.length > 0) {
      instance['bf:dimensions'] = dimensions[0]['@value'];
    }
  }

  return {
    '@context': {
      bf: 'http://id.loc.gov/ontologies/bibframe/',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      bflc: 'http://id.loc.gov/ontologies/bflc/',
    },
    work,
    instance,
  };
}
