/**
 * JSON-LD Import Examples
 * Demonstrates @graph parsing with node resolution
 */

export const exampleGraphFormat = `{
  "@context": {
    "bf": "http://id.loc.gov/ontologies/bibframe/",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  },
  "@graph": [
    {
      "@id": "http://moon.local/work/12345",
      "@type": "bf:Work",
      "bf:title": "http://moon.local/node/title-1",
      "bf:contribution": [
        "http://moon.local/node/contrib-1",
        "http://moon.local/node/contrib-2"
      ],
      "bf:subject": "http://moon.local/node/subject-1",
      "bf:classification": "http://moon.local/node/class-1",
      "bf:language": "http://id.loc.gov/vocabulary/languages/eng",
      "bf:content": "http://id.loc.gov/vocabulary/contentTypes/txt",
      "bf:summary": "A comprehensive guide to semantic cataloging."
    },
    {
      "@id": "http://moon.local/node/title-1",
      "@type": "bf:Title",
      "bf:mainTitle": "Introduction to BIBFRAME 3.0",
      "bf:subtitle": "A Complete Guide"
    },
    {
      "@id": "http://moon.local/node/contrib-1",
      "@type": "bf:Contribution",
      "bf:agent": "http://moon.local/node/agent-1",
      "bf:role": "http://id.loc.gov/vocabulary/relators/aut"
    },
    {
      "@id": "http://moon.local/node/agent-1",
      "@type": "bf:Person",
      "rdfs:label": "Smith, Jane"
    },
    {
      "@id": "http://moon.local/node/contrib-2",
      "@type": "bf:Contribution",
      "bf:agent": "http://moon.local/node/agent-2",
      "bf:role": "http://id.loc.gov/vocabulary/relators/edt"
    },
    {
      "@id": "http://moon.local/node/agent-2",
      "@type": "bf:Person",
      "rdfs:label": "Doe, John"
    },
    {
      "@id": "http://id.loc.gov/vocabulary/relators/aut",
      "rdfs:label": "Author"
    },
    {
      "@id": "http://id.loc.gov/vocabulary/relators/edt",
      "rdfs:label": "Editor"
    },
    {
      "@id": "http://moon.local/node/subject-1",
      "@type": "bf:Topic",
      "rdfs:label": "Library science",
      "bf:source": {
        "@id": "http://id.loc.gov/authorities/subjects/sh85076723"
      }
    },
    {
      "@id": "http://moon.local/node/class-1",
      "@type": "bf:ClassificationDdc",
      "bf:classificationPortion": "025.3",
      "bf:itemPortion": "SM",
      "bf:source": {
        "@id": "http://id.loc.gov/vocabulary/classSchemes/ddc23"
      }
    },
    {
      "@id": "http://moon.local/instance/67890",
      "@type": "bf:Instance",
      "bf:instanceOf": {
        "@id": "http://moon.local/work/12345"
      },
      "bf:title": "http://moon.local/node/title-1",
      "bf:provisionActivity": "http://moon.local/node/pub-1",
      "bf:identifiedBy": [
        "http://moon.local/node/isbn-1"
      ],
      "bf:extent": {
        "@type": "bf:Extent",
        "rdfs:label": "xvi, 342 pages"
      },
      "bf:dimensions": "24 cm",
      "bf:carrier": "http://id.loc.gov/vocabulary/carriers/nc"
    },
    {
      "@id": "http://moon.local/node/pub-1",
      "@type": "bf:Publication",
      "bf:agent": "http://moon.local/node/publisher-1",
      "bf:date": "2026",
      "bf:place": "http://id.loc.gov/vocabulary/countries/nyu"
    },
    {
      "@id": "http://moon.local/node/publisher-1",
      "@type": "bf:Organization",
      "rdfs:label": "Library Press"
    },
    {
      "@id": "http://moon.local/node/isbn-1",
      "@type": "bf:Isbn",
      "rdf:value": "978-0-123456-78-9"
    }
  ]
}`;

export const exampleSimpleFormat = `{
  "@context": {
    "bf": "http://id.loc.gov/ontologies/bibframe/",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#"
  },
  "@id": "http://moon.local/work/simple",
  "@type": "bf:Work",
  "bf:title": {
    "@type": "bf:Title",
    "bf:mainTitle": "Simple Format Example",
    "bf:subtitle": "Embedded Objects"
  },
  "bf:contribution": [
    {
      "@type": "bf:Contribution",
      "bf:agent": {
        "@type": "bf:Person",
        "rdfs:label": "Johnson, Emily"
      },
      "bf:role": {
        "@id": "http://id.loc.gov/vocabulary/relators/aut",
        "rdfs:label": "Author"
      }
    }
  ],
  "bf:subject": [
    {
      "@type": "bf:Topic",
      "rdfs:label": "Cataloging"
    }
  ]
}`;

export const exampleWorkInstanceFormat = `{
  "@context": {
    "bf": "http://id.loc.gov/ontologies/bibframe/",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#"
  },
  "work": {
    "@id": "http://moon.local/work/combo",
    "@type": "bf:Work",
    "bf:title": {
      "bf:mainTitle": "Combined Format",
      "bf:subtitle": "Work and Instance"
    }
  },
  "instance": {
    "@id": "http://moon.local/instance/combo",
    "@type": "bf:Instance",
    "bf:instanceOf": {
      "@id": "http://moon.local/work/combo"
    },
    "bf:title": {
      "bf:mainTitle": "Combined Format"
    },
    "bf:provisionActivity": [
      {
        "@type": "bf:Publication",
        "bf:date": "2026"
      }
    ]
  }
}`;

/**
 * Usage example in a component:
 * 
 * import { importJSONLD } from '../services/sonic-import-handler';
 * import { exampleGraphFormat } from '../utils/import-examples';
 * 
 * const handleImport = () => {
 *   const result = importJSONLD(exampleGraphFormat);
 *   
 *   if (result.success && result.formData) {
 *     console.log('Main Title:', result.formData.mainTitle);
 *     console.log('Subtitle:', result.formData.subtitle);
 *     console.log('Contributions:', result.formData.contributions);
 *     
 *     // Populate form
 *     setWorkData({
 *       ...result.work,
 *       mainTitle: result.formData.mainTitle,
 *       subtitle: result.formData.subtitle,
 *     });
 *   }
 * };
 */
