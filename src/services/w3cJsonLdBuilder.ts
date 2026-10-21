/**
 * W3C-Compliant JSON-LD Builder
 * 
 * Produces JSON-LD that passes:
 * - https://json-ld.org/playground/
 * - W3C RDF Validator
 * - Apache Jena / Fuseki triple store ingestion
 * - Blazegraph / GraphDB import
 * 
 * Key differences from prototype JSON:
 * 1. Full @context with ALL prefixes used in the document
 * 2. All @type values resolve via @context (bf:Work -> http://id.loc.gov/ontologies/bibframe/Work)
 * 3. All property keys use prefixed names that resolve via @context
 * 4. Literal values use @value/@type or @value/@language
 * 5. URI references use @id
 * 6. Blank nodes use @type but no @id (or use _:bN identifiers)
 * 7. @graph array contains only top-level named nodes
 * 8. No orphan properties, no unresolvable prefixes
 * 
 * Designed by Isaac Faleh for Moon Library System
 */

// =====================================================
// COMPLETE BIBFRAME @context
// This is the canonical context for BIBFRAME 2.x JSON-LD
// =====================================================
export const BIBFRAME_JSONLD_CONTEXT = {
  "bf": "http://id.loc.gov/ontologies/bibframe/",
  "bflc": "http://id.loc.gov/ontologies/bflc/",
  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
  "xsd": "http://www.w3.org/2001/XMLSchema#",
  "owl": "http://www.w3.org/2002/07/owl#",
  "skos": "http://www.w3.org/2004/02/skos/core#",
  "dcterms": "http://purl.org/dc/terms/",
  "foaf": "http://xmlns.com/foaf/0.1/",
  "madsrdf": "http://www.loc.gov/mads/rdf/v1#",
  "lcsh": "http://id.loc.gov/authorities/subjects/",
  "lcnaf": "http://id.loc.gov/authorities/names/",
  "lcgft": "http://id.loc.gov/authorities/genreForms/",
  "lcc": "http://id.loc.gov/vocabulary/classSchemes/",
  "relators": "http://id.loc.gov/vocabulary/relators/",
  "languages": "http://id.loc.gov/vocabulary/languages/",
  "carriers": "http://id.loc.gov/vocabulary/carriers/",
  "mediaTypes": "http://id.loc.gov/vocabulary/mediaTypes/",
  "countries": "http://id.loc.gov/vocabulary/countries/",
  "contentTypes": "http://id.loc.gov/vocabulary/contentTypes/",
  "issuance": "http://id.loc.gov/vocabulary/issuance/",
  "descriptionConventions": "http://id.loc.gov/vocabulary/descriptionConventions/",
  "moon": "https://moonlib.org/resource/"
};

// =====================================================
// TYPES
// =====================================================

interface W3CJsonLdNode {
  "@id": string;
  "@type": string | string[];
  [key: string]: any;
}

interface W3CJsonLdDocument {
  "@context": Record<string, string>;
  "@graph": W3CJsonLdNode[];
}

interface BuilderInput {
  workData: any;
  instanceData: any;
  itemData?: any;
  expressionData?: any;
  adminData?: any;
  uriSet: {
    work: string;
    instance: string;
    item: string;
    expression: string;
    admin: string;
  };
  enableExpression?: boolean;
}

// =====================================================
// BUILDER
// =====================================================

/**
 * Build a W3C-compliant JSON-LD document from cataloging data.
 * Every node in @graph has @id and @type.
 * Every property key is a prefixed name resolvable via @context.
 * Every literal uses @value. Every URI ref uses @id.
 */
export function buildW3CJsonLd(input: BuilderInput): W3CJsonLdDocument {
  const { workData, instanceData, itemData, expressionData, adminData, uriSet, enableExpression } = input;
  const graph: W3CJsonLdNode[] = [];

  // 1. BUILD WORK NODE
  const workNode = buildWorkNode(workData, uriSet);
  graph.push(workNode);

  // 2. BUILD EXPRESSION NODE (optional)
  if (enableExpression && expressionData) {
    const exprNode = buildExpressionNode(expressionData, uriSet);
    graph.push(exprNode);
  }

  // 3. BUILD INSTANCE NODE
  const instanceNode = buildInstanceNode(instanceData, uriSet, enableExpression);
  graph.push(instanceNode);

  // 4. BUILD ITEM NODE
  const itemNode = buildItemNode(itemData || {}, uriSet);
  graph.push(itemNode);

  // 5. BUILD ADMIN METADATA NODE
  const adminNode = buildAdminNode(adminData || {}, uriSet);
  graph.push(adminNode);

  return {
    "@context": { ...BIBFRAME_JSONLD_CONTEXT },
    "@graph": graph
  };
}

// =====================================================
// NODE BUILDERS
// =====================================================

function buildWorkNode(data: any, uriSet: any): W3CJsonLdNode {
  const node: W3CJsonLdNode = {
    "@id": uriSet.work,
    "@type": "bf:Work",
    "bf:hasInstance": { "@id": uriSet.instance }
  };

  // Title
  const title = extractTitle(data);
  if (title.mainTitle) {
    node["bf:title"] = [{
      "@type": "bf:Title",
      "bf:mainTitle": [{ "@value": title.mainTitle }],
      ...(title.subtitle ? { "bf:subtitle": [{ "@value": title.subtitle }] } : {}),
      ...(title.partNumber ? { "bf:partNumber": [{ "@value": title.partNumber }] } : {}),
      ...(title.partName ? { "bf:partName": [{ "@value": title.partName }] } : {})
    }];
  }

  // Contributions
  const contributions = extractContributions(data);
  if (contributions.length > 0) {
    node["bf:contribution"] = contributions.map((c, idx) => ({
      "@type": "bf:Contribution",
      ...(c.isPrimary ? { "@type": ["bf:Contribution", "bflc:PrimaryContribution"] } : {}),
      "bf:agent": {
        "@id": c.agentUri || `${uriSet.work}/agent/${idx}`,
        "@type": c.agentType || "bf:Agent",
        "rdfs:label": c.agentLabel
      },
      "bf:role": {
        "@id": c.roleUri || "http://id.loc.gov/vocabulary/relators/ctb"
      }
    }));
  }

  // Language
  const lang = extractProperty(data, "bf:language", "language");
  if (lang) {
    if (typeof lang === "object" && lang["@id"]) {
      node["bf:language"] = [{ "@id": lang["@id"] }];
    } else if (typeof lang === "string") {
      node["bf:language"] = [{ "@id": lang.startsWith("http") ? lang : `http://id.loc.gov/vocabulary/languages/${lang}` }];
    }
  }

  // Subjects
  const subjects = extractArrayProperty(data, "bf:subject", "subject");
  if (subjects.length > 0) {
    node["bf:subject"] = subjects.map(s => {
      if (typeof s === "object" && s["@id"]) return { "@id": s["@id"], "@type": s["@type"] || "bf:Topic", "rdfs:label": s["rdfs:label"] };
      if (typeof s === "object" && s["rdfs:label"]) return { "@type": "bf:Topic", "rdfs:label": s["rdfs:label"] };
      return { "@type": "bf:Topic", "rdfs:label": String(s) };
    });
  }

  // Genre/Form
  const genre = extractProperty(data, "bf:genreForm", "genreForm");
  if (genre) {
    if (typeof genre === "object" && genre["@id"]) {
      node["bf:genreForm"] = [{ "@id": genre["@id"], "@type": genre["@type"] || "bf:GenreForm", "rdfs:label": genre["rdfs:label"] }];
    }
  }

  // Classification
  const classifications = extractArrayProperty(data, "bf:classification", "classification");
  if (classifications.length > 0) {
    node["bf:classification"] = classifications.map(c => ({
      "@type": c["@type"] || "bf:Classification",
      "bf:classificationPortion": c["bf:classificationPortion"] || c["classificationPortion"] || "",
      ...(c["bf:source"] ? { "bf:source": { "@id": typeof c["bf:source"] === "object" ? c["bf:source"]["@id"] : c["bf:source"] } } : {}),
      ...(c["bf:edition"] ? { "bf:edition": c["bf:edition"] } : {})
    }));
  }

  // Summary
  const summary = extractProperty(data, "bf:summary", "summary");
  if (summary) {
    const label = typeof summary === "object" ? (summary["rdfs:label"] || summary["@value"] || "") : String(summary);
    if (label) {
      node["bf:summary"] = [{ "@type": "bf:Summary", "rdfs:label": label }];
    }
  }

  // Content type
  const content = extractProperty(data, "bf:content", "content");
  if (content) {
    node["bf:content"] = [typeof content === "object" && content["@id"] ? { "@id": content["@id"] } : { "@id": `http://id.loc.gov/vocabulary/contentTypes/${content}` }];
  }

  // Origin date
  const originDate = extractProperty(data, "bf:originDate", "originDate");
  if (originDate) {
    node["bf:originDate"] = [{ "@value": String(typeof originDate === "object" ? originDate["@value"] || originDate.value || originDate : originDate), "@type": "xsd:gYear" }];
  }

  // Notes
  const notes = extractArrayProperty(data, "bf:note", "note");
  if (notes.length > 0) {
    node["bf:note"] = notes.map(n => ({
      "@type": "bf:Note",
      "rdfs:label": typeof n === "object" ? (n["rdfs:label"] || n["@value"] || JSON.stringify(n)) : String(n)
    }));
  }

  // Admin metadata reference
  node["bf:adminMetadata"] = { "@id": uriSet.admin };

  return cleanNode(node);
}

function buildExpressionNode(data: any, uriSet: any): W3CJsonLdNode {
  const node: W3CJsonLdNode = {
    "@id": uriSet.expression,
    "@type": "bf:Expression",
    "bf:expressionOf": { "@id": uriSet.work },
    "bf:hasInstance": { "@id": uriSet.instance }
  };

  const lang = extractProperty(data, "bf:language", "language");
  if (lang) {
    node["bf:language"] = [typeof lang === "object" && lang["@id"] ? { "@id": lang["@id"] } : { "@id": `http://id.loc.gov/vocabulary/languages/${lang}` }];
  }

  return cleanNode(node);
}

function buildInstanceNode(data: any, uriSet: any, hasExpression?: boolean): W3CJsonLdNode {
  const node: W3CJsonLdNode = {
    "@id": uriSet.instance,
    "@type": "bf:Instance",
    "bf:instanceOf": { "@id": hasExpression ? uriSet.expression : uriSet.work },
    "bf:hasItem": { "@id": uriSet.item }
  };

  // Instance title (may differ from Work title)
  const title = extractTitle(data);
  if (title.mainTitle) {
    node["bf:title"] = [{
      "@type": "bf:Title",
      "bf:mainTitle": [{ "@value": title.mainTitle }],
      ...(title.subtitle ? { "bf:subtitle": [{ "@value": title.subtitle }] } : {})
    }];
  }

  // Edition statement
  const edition = extractProperty(data, "bf:editionStatement", "editionStatement");
  if (edition) node["bf:editionStatement"] = [{ "@value": String(edition) }];

  // Responsibility statement
  const resp = extractProperty(data, "bf:responsibilityStatement", "responsibilityStatement");
  if (resp) node["bf:responsibilityStatement"] = [{ "@value": String(resp) }];

  // Identifiers
  const identifiers = extractArrayProperty(data, "bf:identifiedBy", "identifiedBy");
  if (identifiers.length > 0) {
    node["bf:identifiedBy"] = identifiers.map(id => {
      const idType = id["@type"] || "bf:Identifier";
      const idValue = id["rdf:value"] || id["value"] || id;
      return {
        "@type": idType,
        "rdf:value": typeof idValue === "object" ? (idValue["@value"] || JSON.stringify(idValue)) : String(idValue)
      };
    });
  }

  // Provision activity
  const provisions = extractArrayProperty(data, "bf:provisionActivity", "provisionActivity");
  if (provisions.length > 0) {
    node["bf:provisionActivity"] = provisions.map(p => {
      const prov: any = {
        "@type": p["@type"] || "bf:Publication"
      };
      // Agent (publisher)
      const agent = p["bf:agent"] || p["agent"];
      if (agent) {
        prov["bf:agent"] = {
          "@id": agent["@id"] || `https://moonlib.org/resource/agent/${simpleHash(agent["rdfs:label"] || "unknown")}`,
          "@type": agent["@type"] || "bf:Agent",
          "rdfs:label": agent["rdfs:label"] || ""
        };
      }
      // Place
      const place = p["bf:place"] || p["place"];
      if (place) {
        prov["bf:place"] = {
          "@id": place["@id"] || `https://moonlib.org/resource/place/${simpleHash(place["rdfs:label"] || "unknown")}`,
          "@type": "bf:Place",
          "rdfs:label": place["rdfs:label"] || ""
        };
      }
      // Date
      const date = p["bf:date"] || p["date"];
      if (date) {
        const dateStr = typeof date === "object" ? (date["@value"] || date.value || String(date)) : String(date);
        prov["bf:date"] = [{ "@value": dateStr, "@type": dateStr.length === 4 ? "xsd:gYear" : "xsd:date" }];
      }
      return prov;
    });
  }

  // Extent
  const extent = extractProperty(data, "bf:extent", "extent");
  if (extent) {
    const extVal = typeof extent === "object" ? (extent["value"] || extent["rdfs:label"] || extent["@value"] || "") : String(extent);
    if (extVal) node["bf:extent"] = [{ "@type": "bf:Extent", "rdfs:label": extVal }];
  }

  // Dimensions
  const dimensions = extractProperty(data, "bf:dimensions", "dimensions");
  if (dimensions) node["bf:dimensions"] = [{ "@value": String(dimensions) }];

  // Carrier
  const carrier = extractProperty(data, "bf:carrier", "carrier");
  if (carrier) {
    node["bf:carrier"] = [typeof carrier === "object" && carrier["@id"] ? { "@id": carrier["@id"] } : { "@id": `http://id.loc.gov/vocabulary/carriers/${carrier}` }];
  }

  // Media
  const media = extractProperty(data, "bf:media", "media");
  if (media) {
    node["bf:media"] = [typeof media === "object" && media["@id"] ? { "@id": media["@id"] } : { "@id": `http://id.loc.gov/vocabulary/mediaTypes/${media}` }];
  }

  // Issuance
  const issuance = extractProperty(data, "bf:issuance", "issuance");
  if (issuance) {
    node["bf:issuance"] = [typeof issuance === "object" && issuance["@id"] ? { "@id": issuance["@id"] } : { "@id": `http://id.loc.gov/vocabulary/issuance/${issuance}` }];
  }

  // Series statement
  const series = extractProperty(data, "bf:seriesStatement", "seriesStatement");
  if (series) node["bf:seriesStatement"] = [{ "@value": String(series) }];

  // Copyright date
  const copyright = extractProperty(data, "bf:copyrightDate", "copyrightDate");
  if (copyright) node["bf:copyrightDate"] = [{ "@value": String(copyright), "@type": "xsd:gYear" }];

  // Notes
  const notes = extractArrayProperty(data, "bf:note", "note");
  if (notes.length > 0) {
    node["bf:note"] = notes.map(n => ({
      "@type": "bf:Note",
      "rdfs:label": typeof n === "object" ? (n["rdfs:label"] || n["@value"] || JSON.stringify(n)) : String(n)
    }));
  }

  return cleanNode(node);
}

function buildItemNode(data: any, uriSet: any): W3CJsonLdNode {
  const node: W3CJsonLdNode = {
    "@id": uriSet.item,
    "@type": "bf:Item",
    "bf:itemOf": { "@id": uriSet.instance }
  };

  // Held by
  const heldBy = extractProperty(data, "bf:heldBy", "heldBy");
  if (heldBy) {
    node["bf:heldBy"] = typeof heldBy === "object" && heldBy["@id"]
      ? { "@id": heldBy["@id"], "@type": heldBy["@type"] || "bf:Agent", "rdfs:label": heldBy["rdfs:label"] || "" }
      : { "@id": `https://moonlib.org/resource/org/${simpleHash(String(heldBy))}`, "@type": "bf:Organization", "rdfs:label": String(heldBy) };
  }

  // Shelf mark
  const shelf = extractProperty(data, "bf:shelfMark", "shelfMark");
  if (shelf) {
    node["bf:shelfMark"] = [{ "@type": "bf:ShelfMark", "rdfs:label": String(shelf) }];
  }

  // Electronic locator
  const eloc = extractProperty(data, "bf:electronicLocator", "electronicLocator");
  if (eloc) {
    node["bf:electronicLocator"] = [{ "@id": String(eloc) }];
  }

  // Identifiers
  const identifiers = extractArrayProperty(data, "bf:identifiedBy", "identifiedBy");
  if (identifiers.length > 0) {
    node["bf:identifiedBy"] = identifiers.map(id => ({
      "@type": id["@type"] || "bf:Barcode",
      "rdf:value": typeof id === "object" ? (id["rdf:value"] || id["value"] || "") : String(id)
    }));
  }

  return cleanNode(node);
}

function buildAdminNode(data: any, uriSet: any): W3CJsonLdNode {
  const now = new Date().toISOString();
  const node: W3CJsonLdNode = {
    "@id": uriSet.admin,
    "@type": "bf:AdminMetadata",
    "bf:creationDate": [{ "@value": data["bf:creationDate"] || now.split("T")[0], "@type": "xsd:date" }],
    "bf:changeDate": [{ "@value": now.split("T")[0], "@type": "xsd:date" }],
    "bf:descriptionConventions": {
      "@id": "http://id.loc.gov/vocabulary/descriptionConventions/rda"
    },
    "bf:descriptionLanguage": {
      "@id": data["bf:descriptionLanguage"]?.["@id"] || "http://id.loc.gov/vocabulary/languages/eng"
    },
    "bf:source": data["bf:source"] || {
      "@id": "https://moonlib.org",
      "@type": "bf:Source",
      "rdfs:label": "Moon Library System"
    },
    "bf:generationProcess": [{
      "@type": "bf:GenerationProcess",
      "rdfs:label": data["bf:generationProcess"] || "Moon BIBFRAME Template v2.0"
    }]
  };

  return cleanNode(node);
}

// =====================================================
// HELPERS
// =====================================================

function extractTitle(data: any): { mainTitle: string; subtitle: string; partNumber: string; partName: string } {
  const t = data["bf:title"] || data["title"];
  if (!t) return { mainTitle: "", subtitle: "", partNumber: "", partName: "" };
  
  // Array of titles -> first one
  const titleObj = Array.isArray(t) ? t[0] : t;
  
  if (typeof titleObj === "string") return { mainTitle: titleObj, subtitle: "", partNumber: "", partName: "" };
  
  // Extract mainTitle from various formats
  let mainTitle = "";
  const mt = titleObj["bf:mainTitle"] || titleObj["mainTitle"];
  if (mt) {
    if (Array.isArray(mt)) mainTitle = mt[0]?.["@value"] || String(mt[0]);
    else if (typeof mt === "object") mainTitle = mt["@value"] || String(mt);
    else mainTitle = String(mt);
  }
  
  let subtitle = "";
  const st = titleObj["bf:subtitle"] || titleObj["subtitle"];
  if (st) {
    if (Array.isArray(st)) subtitle = st[0]?.["@value"] || String(st[0]);
    else if (typeof st === "object") subtitle = st["@value"] || String(st);
    else subtitle = String(st);
  }
  
  const partNumber = titleObj["bf:partNumber"] || titleObj["partNumber"] || "";
  const partName = titleObj["bf:partName"] || titleObj["partName"] || "";
  
  return { mainTitle, subtitle, partNumber: String(partNumber), partName: String(partName) };
}

interface ContributionData {
  agentUri: string;
  agentLabel: string;
  agentType: string;
  roleUri: string;
  isPrimary: boolean;
}

function extractContributions(data: any): ContributionData[] {
  const c = data["bf:contribution"] || data["contribution"] || [];
  const arr = Array.isArray(c) ? c : [c];
  
  return arr.filter(Boolean).map((contrib, idx) => {
    const agent = contrib["bf:agent"] || contrib["agent"] || {};
    const role = contrib["bf:role"] || contrib["role"] || {};
    
    return {
      agentUri: agent["@id"] || "",
      agentLabel: agent["rdfs:label"] || agent["label"] || "Unknown",
      agentType: agent["@type"] || "bf:Person",
      roleUri: role["@id"] || "http://id.loc.gov/vocabulary/relators/ctb",
      isPrimary: idx === 0
    };
  });
}

function extractProperty(data: any, prefixedKey: string, shortKey: string): any {
  return data[prefixedKey] || data[shortKey] || null;
}

function extractArrayProperty(data: any, prefixedKey: string, shortKey: string): any[] {
  const val = data[prefixedKey] || data[shortKey];
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

function cleanNode(node: any): any {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(node)) {
    if (value === null || value === undefined || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      // Remove empty objects
      const hasContent = Object.values(value).some(v => v !== null && v !== undefined && v !== "");
      if (!hasContent && !value["@id"] && !value["@type"]) continue;
    }
    cleaned[key] = value;
  }
  return cleaned;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// =====================================================
// VALIDATION
// =====================================================

export interface JsonLdValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
  stats: {
    nodeCount: number;
    tripleEstimate: number;
    prefixesUsed: string[];
    typesFound: string[];
    allNodesHaveId: boolean;
    allNodesHaveType: boolean;
    contextComplete: boolean;
  };
}

/**
 * Validate JSON-LD document against W3C spec requirements.
 * This catches the issues that would cause failures in:
 * - JSON-LD Playground
 * - RDF validators
 * - Triple store ingestion
 */
export function validateW3CJsonLd(doc: any): JsonLdValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];
  const prefixesUsed = new Set<string>();
  const typesFound = new Set<string>();
  let allNodesHaveId = true;
  let allNodesHaveType = true;

  // 1. Must be an object
  if (typeof doc !== "object" || doc === null) {
    errors.push("Document must be a JSON object");
    return { valid: false, errors, warnings, info, stats: { nodeCount: 0, tripleEstimate: 0, prefixesUsed: [], typesFound: [], allNodesHaveId: false, allNodesHaveType: false, contextComplete: false } };
  }

  // 2. Must have @context
  if (!doc["@context"]) {
    errors.push("Missing @context - JSON-LD requires @context for prefix resolution");
  } else {
    // Check context is an object with string values
    if (typeof doc["@context"] !== "object") {
      errors.push("@context must be an object mapping prefixes to URIs");
    } else {
      for (const [prefix, uri] of Object.entries(doc["@context"])) {
        if (typeof uri !== "string") {
          errors.push(`@context["${prefix}"] must be a string URI, got ${typeof uri}`);
        } else if (!uri.startsWith("http://") && !uri.startsWith("https://")) {
          errors.push(`@context["${prefix}"] = "${uri}" is not a valid HTTP(S) URI`);
        }
      }
    }
  }

  // 3. Must have @graph
  if (!doc["@graph"]) {
    errors.push("Missing @graph - document must contain @graph array for named graph");
  } else if (!Array.isArray(doc["@graph"])) {
    errors.push("@graph must be an array");
  } else {
    const graph = doc["@graph"];
    info.push(`@graph contains ${graph.length} node(s)`);

    // 4. Validate each node
    graph.forEach((node: any, idx: number) => {
      // @id check
      if (!node["@id"]) {
        allNodesHaveId = false;
        errors.push(`Node [${idx}] missing @id - every named node in @graph must have @id`);
      } else if (typeof node["@id"] !== "string") {
        errors.push(`Node [${idx}] @id must be a string`);
      } else if (!node["@id"].startsWith("http://") && !node["@id"].startsWith("https://") && !node["@id"].startsWith("_:")) {
        errors.push(`Node [${idx}] @id="${node["@id"]}" is not a valid URI or blank node identifier`);
      }

      // @type check
      if (!node["@type"]) {
        allNodesHaveType = false;
        warnings.push(`Node [${idx}] (${node["@id"] || "unnamed"}) missing @type`);
      } else {
        const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
        types.forEach((t: string) => {
          typesFound.add(t);
          // Check prefix resolves
          if (t.includes(":") && !t.startsWith("http")) {
            const prefix = t.split(":")[0];
            prefixesUsed.add(prefix);
            if (doc["@context"] && !doc["@context"][prefix]) {
              errors.push(`Node [${idx}] uses prefix "${prefix}" in @type="${t}" but prefix not in @context`);
            }
          }
        });
      }

      // Check all property keys resolve
      for (const key of Object.keys(node)) {
        if (key.startsWith("@")) continue; // JSON-LD keywords
        if (key.includes(":") && !key.startsWith("http")) {
          const prefix = key.split(":")[0];
          prefixesUsed.add(prefix);
          if (doc["@context"] && !doc["@context"][prefix]) {
            errors.push(`Node [${idx}] property "${key}" uses prefix "${prefix}" not in @context`);
          }
        } else if (!key.startsWith("http")) {
          warnings.push(`Node [${idx}] property "${key}" has no namespace prefix - may not resolve to a URI`);
        }

        // Validate nested objects
        validateNestedValue(node[key], key, idx, doc["@context"] || {}, errors, warnings, prefixesUsed);
      }
    });

    // 5. Check WEMI structure
    const hasWork = graph.some((n: any) => {
      const t = Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]];
      return t.includes("bf:Work");
    });
    const hasInstance = graph.some((n: any) => {
      const t = Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]];
      return t.includes("bf:Instance");
    });
    const hasItem = graph.some((n: any) => {
      const t = Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]];
      return t.includes("bf:Item");
    });

    if (hasWork) info.push("Contains bf:Work node");
    else warnings.push("Missing bf:Work node - BIBFRAME requires Work entity");

    if (hasInstance) info.push("Contains bf:Instance node");
    else warnings.push("Missing bf:Instance node - BIBFRAME requires Instance entity");

    if (hasItem) info.push("Contains bf:Item node");
    else warnings.push("Missing bf:Item node - recommended for complete BIBFRAME record");

    // Check WEMI links
    if (hasWork && hasInstance) {
      const work = graph.find((n: any) => (Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]).includes("bf:Work"));
      if (work && !work["bf:hasInstance"]) {
        errors.push("Work missing bf:hasInstance link to Instance");
      }
    }
    if (hasInstance && hasItem) {
      const instance = graph.find((n: any) => (Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]).includes("bf:Instance"));
      if (instance && !instance["bf:hasItem"]) {
        warnings.push("Instance missing bf:hasItem link to Item");
      }
    }
  }

  // Context completeness
  const contextPrefixes = new Set(Object.keys(doc["@context"] || {}));
  const contextComplete = Array.from(prefixesUsed).every(p => contextPrefixes.has(p));

  // Estimate triples
  let tripleEstimate = 0;
  if (doc["@graph"] && Array.isArray(doc["@graph"])) {
    doc["@graph"].forEach((node: any) => {
      tripleEstimate++; // rdf:type triple
      for (const key of Object.keys(node)) {
        if (key.startsWith("@")) continue;
        const val = node[key];
        if (Array.isArray(val)) tripleEstimate += val.length;
        else tripleEstimate++;
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    stats: {
      nodeCount: doc["@graph"]?.length || 0,
      tripleEstimate,
      prefixesUsed: Array.from(prefixesUsed),
      typesFound: Array.from(typesFound),
      allNodesHaveId,
      allNodesHaveType,
      contextComplete
    }
  };
}

function validateNestedValue(value: any, parentKey: string, nodeIdx: number, context: Record<string, string>, errors: string[], warnings: string[], prefixesUsed: Set<string>) {
  if (value === null || value === undefined) return;
  
  if (Array.isArray(value)) {
    value.forEach((v, i) => validateNestedValue(v, `${parentKey}[${i}]`, nodeIdx, context, errors, warnings, prefixesUsed));
    return;
  }
  
  if (typeof value === "object") {
    // Check nested @type
    if (value["@type"]) {
      const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
      types.forEach((t: string) => {
        if (t.includes(":") && !t.startsWith("http")) {
          const prefix = t.split(":")[0];
          prefixesUsed.add(prefix);
          if (!context[prefix]) {
            errors.push(`Nested object at [${nodeIdx}].${parentKey} uses prefix "${prefix}" in @type="${t}" not in @context`);
          }
        }
      });
    }
    
    for (const key of Object.keys(value)) {
      if (key.startsWith("@")) continue;
      if (key.includes(":") && !key.startsWith("http")) {
        const prefix = key.split(":")[0];
        prefixesUsed.add(prefix);
        if (!context[prefix]) {
          errors.push(`Nested property "${key}" at [${nodeIdx}].${parentKey} uses prefix "${prefix}" not in @context`);
        }
      }
    }
  }
}

// =====================================================
// TURTLE SERIALIZER (W3C-compliant)
// =====================================================

/**
 * Convert W3C JSON-LD to Turtle RDF.
 * Uses @context for prefix declarations.
 */
export function jsonLdToTurtle(doc: W3CJsonLdDocument): string {
  const lines: string[] = [];
  const context = doc["@context"] || {};

  // Prefix declarations
  for (const [prefix, uri] of Object.entries(context)) {
    lines.push(`@prefix ${prefix}: <${uri}> .`);
  }
  lines.push("");

  // Nodes
  const graph = doc["@graph"] || [];
  for (const node of graph) {
    lines.push(nodeToTurtle(node, context));
    lines.push("");
  }

  return lines.join("\n");
}

function nodeToTurtle(node: any, context: Record<string, string>): string {
  const lines: string[] = [];
  const subject = node["@id"] ? `<${node["@id"]}>` : "[]";

  // Collect properties
  const props: string[] = [];

  // @type
  if (node["@type"]) {
    const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    props.push(`    a ${types.map((t: string) => expandForTurtle(t, context)).join(", ")}`);
  }

  // Other properties
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("@")) continue;
    const predicate = expandForTurtle(key, context);
    const objects = Array.isArray(value) ? value : [value];
    const objectStrs = objects.map(v => valueToTurtleStr(v, context)).filter(Boolean);
    if (objectStrs.length > 0) {
      props.push(`    ${predicate} ${objectStrs.join(", ")}`);
    }
  }

  if (props.length > 0) {
    lines.push(`${subject}`);
    lines.push(props.join(" ;\n") + " .");
  }

  return lines.join("\n");
}

function valueToTurtleStr(value: any, context: Record<string, string>): string {
  if (value === null || value === undefined) return "";

  // Typed literal
  if (typeof value === "object" && value["@value"] !== undefined) {
    const escaped = String(value["@value"]).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
    if (value["@type"]) return `"${escaped}"^^${expandForTurtle(value["@type"], context)}`;
    if (value["@language"]) return `"${escaped}"@${value["@language"]}`;
    return `"${escaped}"`;
  }

  // URI reference
  if (typeof value === "object" && value["@id"]) {
    if (Object.keys(value).length === 1) {
      // Pure URI ref
      return `<${value["@id"]}>`;
    }
    // Inline blank node with @id - just reference the URI
    return `<${value["@id"]}>`;
  }

  // Blank node (object with @type but no @id)
  if (typeof value === "object" && value["@type"]) {
    const innerProps: string[] = [];
    innerProps.push(`a ${expandForTurtle(Array.isArray(value["@type"]) ? value["@type"][0] : value["@type"], context)}`);
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith("@")) continue;
      const pred = expandForTurtle(k, context);
      const vals = Array.isArray(v) ? v : [v];
      const objStrs = vals.map(vv => valueToTurtleStr(vv, context)).filter(Boolean);
      if (objStrs.length > 0) innerProps.push(`${pred} ${objStrs.join(", ")}`);
    }
    return `[\n        ${innerProps.join(" ;\n        ")}\n    ]`;
  }

  // Plain object
  if (typeof value === "object") {
    return `"${JSON.stringify(value).replace(/"/g, '\\"')}"`;
  }

  // String
  if (typeof value === "string") {
    if (value.startsWith("http://") || value.startsWith("https://")) return `<${value}>`;
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
  }

  // Number/Boolean
  return String(value);
}

function expandForTurtle(term: string, context: Record<string, string>): string {
  if (term.startsWith("http://") || term.startsWith("https://")) return `<${term}>`;
  if (term.includes(":")) {
    const [prefix] = term.split(":");
    if (context[prefix]) return term; // Prefixed name is valid in Turtle
  }
  return term;
}

// =====================================================
// N-TRIPLES SERIALIZER
// =====================================================

export function jsonLdToNTriples(doc: W3CJsonLdDocument): string {
  const context = doc["@context"] || {};
  const lines: string[] = [];
  const graph = doc["@graph"] || [];
  let blankNodeCounter = 0;

  for (const node of graph) {
    const subject = node["@id"];
    if (!subject) continue;

    // rdf:type
    if (node["@type"]) {
      const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
      for (const t of types) {
        lines.push(`<${subject}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <${expandUri(t, context)}> .`);
      }
    }

    // Properties
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith("@")) continue;
      const predUri = expandUri(key, context);
      const values = Array.isArray(value) ? value : [value];

      for (const val of values) {
        const triple = valueToNTriple(subject, predUri, val, context, () => `_:b${blankNodeCounter++}`, lines);
        if (triple) lines.push(triple);
      }
    }
  }

  return lines.join("\n");
}

function valueToNTriple(subject: string, predicate: string, value: any, context: Record<string, string>, genBlank: () => string, extraLines: string[]): string | null {
  if (value === null || value === undefined) return null;

  // Typed literal
  if (typeof value === "object" && value["@value"] !== undefined) {
    const escaped = String(value["@value"]).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r");
    if (value["@type"]) {
      return `<${subject}> <${predicate}> "${escaped}"^^<${expandUri(value["@type"], context)}> .`;
    }
    if (value["@language"]) {
      return `<${subject}> <${predicate}> "${escaped}"@${value["@language"]} .`;
    }
    return `<${subject}> <${predicate}> "${escaped}" .`;
  }

  // URI reference
  if (typeof value === "object" && value["@id"]) {
    const objUri = value["@id"].startsWith("http") ? value["@id"] : expandUri(value["@id"], context);
    // If it has more properties, also emit those as separate triples
    const otherKeys = Object.keys(value).filter(k => !k.startsWith("@"));
    if (otherKeys.length > 0) {
      // Emit the link
      extraLines.push(`<${subject}> <${predicate}> <${objUri}> .`);
      // Emit the nested node's properties
      if (value["@type"]) {
        const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
        for (const t of types) {
          extraLines.push(`<${objUri}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <${expandUri(t, context)}> .`);
        }
      }
      for (const k of otherKeys) {
        const v = value[k];
        const pUri = expandUri(k, context);
        const vals = Array.isArray(v) ? v : [v];
        for (const vv of vals) {
          const t = valueToNTriple(objUri, pUri, vv, context, genBlank, extraLines);
          if (t) extraLines.push(t);
        }
      }
      return null; // Already added
    }
    return `<${subject}> <${predicate}> <${objUri}> .`;
  }

  // Blank node (object with @type but no @id)
  if (typeof value === "object" && value["@type"]) {
    const bnode = genBlank();
    extraLines.push(`<${subject}> <${predicate}> ${bnode} .`);
    const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
    for (const t of types) {
      extraLines.push(`${bnode} <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <${expandUri(t, context)}> .`);
    }
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith("@")) continue;
      const pUri = expandUri(k, context);
      const vals = Array.isArray(v) ? v : [v];
      for (const vv of vals) {
        const t = valueToNTriple(bnode.startsWith("_:") ? bnode : `<${bnode}>`, pUri, vv, context, genBlank, extraLines);
        if (t) extraLines.push(t);
      }
    }
    return null;
  }

  // String
  if (typeof value === "string") {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return `<${subject}> <${predicate}> <${value}> .`;
    }
    const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
    return `<${subject}> <${predicate}> "${escaped}" .`;
  }

  // Number
  if (typeof value === "number") {
    return `<${subject}> <${predicate}> "${value}"^^<http://www.w3.org/2001/XMLSchema#${Number.isInteger(value) ? "integer" : "decimal"}> .`;
  }

  return null;
}

function expandUri(term: string, context: Record<string, string>): string {
  if (term.startsWith("http://") || term.startsWith("https://")) return term;
  if (term.includes(":")) {
    const [prefix, ...rest] = term.split(":");
    const localName = rest.join(":");
    if (context[prefix]) return context[prefix] + localName;
  }
  return term;
}
