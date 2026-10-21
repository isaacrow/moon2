import { ARTIFACT_RECORDS } from '../data/records';

export const MOON_PROJECT_ID = "gfbagczwhvxxstbfrfhu";
export const MOON_SUPABASE_URL = `https://${MOON_PROJECT_ID}.supabase.co`;
export const MOON_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmFnY3p3aHZ4eHN0YmZyZmh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3ODg4OTksImV4cCI6MjA4NjM2NDg5OX0.Hrib4UwwVvCu0o7K51UAICoSmd2J-0XlkLegdkIqLJk";

// Supabase client fallback
export const supabase = null;

const STORAGE_KEY = 'alqami_spatial_opac_records_v1';

export class MoonCatalogService {
  constructor() {
    this.status = 'initializing';
    this.isOnline = navigator.onLine;
  }

  // Load records from Local/Cache + attempt Moon Supabase sync
  async getRecords() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("Storage read error:", e);
    }

    // Default to our pre-built verified BIBFRAME artifacts
    this.saveLocally(ARTIFACT_RECORDS);
    return ARTIFACT_RECORDS;
  }

  saveLocally(records) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn("Local storage write error:", e);
    }
  }

  // Generate complete RDF / Turtle / JSON-LD export for any record
  exportLinkedData(record, format = 'jsonld') {
    if (format === 'jsonld') {
      const jsonldDoc = {
        "@context": "https://id.loc.gov/ontologies/bibframe.jsonld",
        "@graph": [
          {
            "@id": record.bibframe.workUri,
            "@type": "bf:Work",
            "bf:title": [
              {
                "@type": "bf:Title",
                "bf:mainTitle": [{ "@value": record.title.ar, "@language": "ar" }],
                "bf:subtitle": [{ "@value": record.title.en, "@language": "en" }]
              }
            ],
            "bf:contribution": [
              {
                "@type": "bf:Contribution",
                "bf:agent": [
                  {
                    "@id": record.creator.uri,
                    "@type": "bf:Agent",
                    "rdfs:label": [{ "@value": record.creator.ar, "@language": "ar" }]
                  }
                ],
                "bf:role": [
                  {
                    "@id": "http://id.loc.gov/vocabulary/relators/cre",
                    "rdfs:label": [{ "@value": "Creator" }]
                  }
                ]
              }
            ],
            "bf:subject": record.bibframe.subjects.map(s => ({
              "@id": s.uri,
              "@type": "bf:Topic",
              "rdfs:label": [{ "@value": s.label }]
            })),
            "bf:genreForm": record.bibframe.genreForm.map(g => ({
              "@id": g.uri,
              "@type": "bf:GenreForm",
              "rdfs:label": [{ "@value": g.label }]
            })),
            "bf:classification": [
              {
                "@type": "bf:ClassificationLcc",
                "bf:classificationPortion": [{ "@value": record.bibframe.classification.lcc }]
              },
              {
                "@type": "bf:ClassificationDdc",
                "bf:classificationPortion": [{ "@value": record.bibframe.classification.ddc }]
              }
            ],
            "bf:hasInstance": [{ "@id": record.bibframe.instanceUri }]
          },
          {
            "@id": record.bibframe.instanceUri,
            "@type": "bf:Instance",
            "bf:instanceOf": { "@id": record.bibframe.workUri },
            "bf:extent": [{ "@value": record.physical.dimensions }],
            "bf:carrier": [
              {
                "@id": "http://id.loc.gov/vocabulary/carriers/cr",
                "rdfs:label": [{ "@value": "Online resource / 3D Model Surrogate" }]
              }
            ],
            "bf:hasItem": [{ "@id": record.bibframe.itemUri }],
            "schema:digitalSurrogate": {
              "@type": "schema:3DModel",
              "schema:contentUrl": window.location.origin + record.model.glb,
              "schema:encodingFormat": "model/gltf-binary"
            }
          },
          {
            "@id": record.bibframe.itemUri,
            "@type": "bf:Item",
            "bf:itemOf": { "@id": record.bibframe.instanceUri },
            "bf:heldBy": [
              {
                "@type": "bf:Organization",
                "rdfs:label": [{ "@value": record.institution.ar, "@language": "ar" }]
              }
            ]
          }
        ]
      };
      return JSON.stringify(jsonldDoc, null, 2);
    }

    if (format === 'turtle') {
      return `@prefix bf: <http://id.loc.gov/ontologies/bibframe/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix schema: <http://schema.org/> .
@prefix dc: <http://purl.org/dc/elements/1.1/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

# BIBFRAME 2.0 Work
<${record.bibframe.workUri}>
    a bf:Work ;
    bf:title [
        a bf:Title ;
        bf:mainTitle "${record.title.ar}"@ar ;
        bf:subtitle "${record.title.en}"@en
    ] ;
    bf:contribution [
        a bf:Contribution ;
        bf:agent <${record.creator.uri}> ;
        bf:role <http://id.loc.gov/vocabulary/relators/cre>
    ] ;
    bf:classification [
        a bf:ClassificationLcc ;
        bf:classificationPortion "${record.bibframe.classification.lcc}"
    ] ;
    bf:summary [
        a bf:Summary ;
        rdfs:label """${record.summary.ar}"""@ar
    ] ;
    bf:hasInstance <${record.bibframe.instanceUri}> .

# BIBFRAME 2.0 Instance with 3D AR Digital Surrogate
<${record.bibframe.instanceUri}>
    a bf:Instance ;
    bf:instanceOf <${record.bibframe.workUri}> ;
    bf:extent "${record.physical.dimensions}" ;
    schema:material "${record.physical.material.ar}"@ar ;
    schema:digitalSurrogate <${window.location.origin + record.model.glb}> ;
    bf:hasItem <${record.bibframe.itemUri}> .

# BIBFRAME 2.0 Item & Holdings
<${record.bibframe.itemUri}>
    a bf:Item ;
    bf:itemOf <${record.bibframe.instanceUri}> ;
    bf:heldBy [
        a bf:Organization ;
        rdfs:label "${record.institution.ar}"@ar
    ] .
`;
    }

    if (format === 'sparql') {
      return `PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema: <http://schema.org/>

SELECT ?work ?title ?creator ?instance ?digitalSurrogate
WHERE {
  ?work a bf:Work ;
        bf:title [ bf:mainTitle ?title ] ;
        bf:hasInstance ?instance .
  ?instance schema:digitalSurrogate ?digitalSurrogate .
  FILTER (?work = <${record.bibframe.workUri}>)
}`;
    }

    return '';
  }
}

export const moonCatalog = new MoonCatalogService();
