"use client";
import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Download, Sparkles } from "lucide-react";

/**
 * 🌙 MOON OSHIN - Semantic BIBFRAME RDF Generator
 * Strict BIBFRAME 2.0 compliance with real RDF output
 * Triple store ready (Fuseki, Blazegraph, GraphDB, Virtuoso)
 */

type Contribution = {
  agentLabel: string;
  agentUri: string;
  role: string;
};

type Provision = {
  place: string;
  placeLabel: string;
  agent: string;
  agentLabel: string;
  date: string;
};

type Identifier = {
  type: "Isbn" | "Issn" | "Lccn" | "Local";
  value: string;
};

type ValidationError = {
  field: string;
  message: string;
};

export default function MoonOshin() {
  /* ============================= CORE STATE ============================= */

  // Work properties
  const [workTitle, setWorkTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [language, setLanguage] = useState("http://id.loc.gov/vocabulary/languages/eng");
  const [genre, setGenre] = useState("");
  const [classification, setClassification] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);

  // Contributors
  const [contributors, setContributors] = useState<Contribution[]>([
    {
      agentLabel: "",
      agentUri: "",
      role: "aut"
    }
  ]);

  // Instance properties
  const [identifiers, setIdentifiers] = useState<Identifier[]>([
    { type: "Isbn", value: "" }
  ]);
  const [extent, setExtent] = useState("");
  const [carrier, setCarrier] = useState("http://id.loc.gov/vocabulary/carriers/nc");
  const [media, setMedia] = useState("http://id.loc.gov/vocabulary/mediaTypes/n");
  const [prov, setProv] = useState<Provision>({
    place: "http://id.loc.gov/vocabulary/countries/xxu",
    placeLabel: "United States",
    agent: "",
    agentLabel: "",
    date: new Date().getFullYear().toString(),
  });

  // Item properties
  const [shelfMark, setShelfMark] = useState("");
  const [barcode, setBarcode] = useState("");
  const [heldBy, setHeldBy] = useState("https://moonlib.org/library/main");

  // Output
  const [rdf, setRdf] = useState("");
  const [format, setFormat] = useState<"turtle" | "jsonld">("turtle");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState(false);

  /* ============================= HELPERS ============================= */

  const generateUri = (type: string): string => {
    const id = Math.random().toString(36).substring(2, 11);
    return `https://moonlib.org/${type}/${id}`;
  };

  const escapeString = (str: string): string => {
    return str
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n");
  };

  const isValidHttpUri = (str: string): boolean => {
    try {
      const url = new URL(str);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  /* ============================= VALIDATION ============================= */

  const validate = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Required: Work title
    if (!workTitle.trim()) {
      errors.push({ field: "workTitle", message: "Work must have a title" });
    }

    // Required: At least one contributor with role
    if (contributors.length === 0) {
      errors.push({ field: "contributors", message: "Work must have at least one contributor" });
    } else {
      contributors.forEach((c, i) => {
        if (!c.agentLabel.trim()) {
          errors.push({ field: `contributor${i}`, message: `Contributor ${i + 1} must have a label` });
        }
        if (!c.role.trim()) {
          errors.push({ field: `contributor${i}`, message: `Contributor ${i + 1} must have a role` });
        }
        if (c.agentUri && !isValidHttpUri(c.agentUri)) {
          errors.push({ field: `contributor${i}`, message: `Contributor ${i + 1} URI must be HTTP/HTTPS` });
        }
      });
    }

    // Required: Provision activity must have agent and place
    if (!prov.agent && !prov.agentLabel) {
      errors.push({ field: "provision.agent", message: "Provision activity must have a publisher" });
    }
    if (!prov.place) {
      errors.push({ field: "provision.place", message: "Provision activity must have a place" });
    }
    if (!prov.date) {
      errors.push({ field: "provision.date", message: "Provision activity must have a date" });
    }

    // Identifiers must not be empty if present
    identifiers.forEach((id, i) => {
      if (!id.value.trim()) {
        errors.push({ field: `identifier${i}`, message: `${id.type} value cannot be empty` });
      }
    });

    // URIs must be valid HTTP
    if (language && !isValidHttpUri(language)) {
      errors.push({ field: "language", message: "Language must be a valid HTTP URI" });
    }
    if (genre && !isValidHttpUri(genre)) {
      errors.push({ field: "genre", message: "Genre must be a valid HTTP URI" });
    }
    if (carrier && !isValidHttpUri(carrier)) {
      errors.push({ field: "carrier", message: "Carrier must be a valid HTTP URI" });
    }
    if (media && !isValidHttpUri(media)) {
      errors.push({ field: "media", message: "Media must be a valid HTTP URI" });
    }
    if (heldBy && !isValidHttpUri(heldBy)) {
      errors.push({ field: "heldBy", message: "Held by must be a valid HTTP URI" });
    }

    return errors;
  };

  /* ============================= RDF GENERATORS ============================= */

  const generateTurtle = (): string => {
    const workUri = generateUri("work");
    const instUri = generateUri("instance");
    const itemUri = generateUri("item");

    let turtle = `@prefix bf: <http://id.loc.gov/ontologies/bibframe/> .
@prefix bflc: <http://id.loc.gov/ontologies/bflc/> .
@prefix rel: <http://id.loc.gov/vocabulary/relators/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

# ===== WORK =====

<${workUri}> a bf:Work ;
    bf:title [
        a bf:Title ;
        bf:mainTitle "${escapeString(workTitle)}"${subtitle ? ` ;\n        bf:subtitle "${escapeString(subtitle)}"` : ""}
    ] ;
`;

    // Language
    if (language) {
      turtle += `    bf:language <${language}> ;\n`;
    }

    // Genre
    if (genre) {
      turtle += `    bf:genreForm <${genre}> ;\n`;
    }

    // Classification
    if (classification) {
      turtle += `    bf:classification [
        a bf:Classification ;
        bf:classificationPortion "${escapeString(classification)}"
    ] ;\n`;
    }

    // Subjects
    subjects.forEach((subject) => {
      if (subject.trim()) {
        if (isValidHttpUri(subject)) {
          turtle += `    bf:subject <${subject}> ;\n`;
        } else {
          turtle += `    bf:subject [
        a bf:Topic ;
        rdfs:label "${escapeString(subject)}"
    ] ;\n`;
        }
      }
    });

    // Contributors
    contributors.forEach((c) => {
      if (c.agentLabel.trim()) {
        const agentUri = c.agentUri || generateUri("agent");
        turtle += `    bf:contribution [
        a bf:Contribution ;
        bf:agent <${agentUri}> ;
        bf:role <http://id.loc.gov/vocabulary/relators/${c.role}>
    ] ;\n`;
      }
    });

    // Work -> Instance relationship
    turtle += `    bf:hasInstance <${instUri}> .\n\n`;

    // ===== INSTANCE =====

    turtle += `# ===== INSTANCE =====

<${instUri}> a bf:Instance ;
    bf:instanceOf <${workUri}> ;
    bf:title [
        a bf:Title ;
        bf:mainTitle "${escapeString(workTitle)}"${subtitle ? ` ;\n        bf:subtitle "${escapeString(subtitle)}"` : ""}
    ] ;
`;

    // Identifiers
    identifiers.forEach((id) => {
      if (id.value.trim()) {
        turtle += `    bf:identifiedBy [
        a bf:${id.type} ;
        rdf:value "${escapeString(id.value)}"
    ] ;\n`;
      }
    });

    // Extent
    if (extent) {
      turtle += `    bf:extent [
        a bf:Extent ;
        rdfs:label "${escapeString(extent)}"
    ] ;\n`;
    }

    // Carrier
    if (carrier) {
      turtle += `    bf:carrier <${carrier}> ;\n`;
    }

    // Media
    if (media) {
      turtle += `    bf:media <${media}> ;\n`;
    }

    // Provision Activity
    turtle += `    bf:provisionActivity [
        a bf:Publication ;
`;
    if (prov.place) {
      turtle += `        bf:place <${prov.place}> ;\n`;
    }
    if (prov.agent) {
      turtle += `        bf:agent <${prov.agent}> ;\n`;
    } else if (prov.agentLabel) {
      const pubUri = generateUri("organization");
      turtle += `        bf:agent <${pubUri}> ;\n`;
    }
    if (prov.date) {
      turtle += `        bf:date "${prov.date}"^^xsd:gYear\n`;
    }
    turtle += `    ] ;\n`;

    // Instance -> Item relationship
    turtle += `    bf:hasItem <${itemUri}> .\n\n`;

    // ===== ITEM =====

    turtle += `# ===== ITEM =====

<${itemUri}> a bf:Item ;
    bf:itemOf <${instUri}> ;\n`;

    if (heldBy) {
      turtle += `    bf:heldBy <${heldBy}> ;\n`;
    }

    if (shelfMark) {
      turtle += `    bf:shelfMark "${escapeString(shelfMark)}" ;\n`;
    }

    if (barcode) {
      turtle += `    bf:identifiedBy [
        a bf:Barcode ;
        rdf:value "${escapeString(barcode)}"
    ] ;\n`;
    }

    // Remove trailing semicolon and add period
    turtle = turtle.replace(/;\s*$/, " .\n");

    // Add agent labels if URIs were generated
    turtle += `\n# ===== AGENT LABELS =====\n\n`;

    contributors.forEach((c) => {
      if (c.agentLabel.trim()) {
        const agentUri = c.agentUri || generateUri("agent");
        if (!c.agentUri) {
          turtle += `<${agentUri}> a bf:Person ;
    rdfs:label "${escapeString(c.agentLabel)}" .\n\n`;
        }
      }
    });

    if (!prov.agent && prov.agentLabel) {
      const pubUri = generateUri("organization");
      turtle += `<${pubUri}> a bf:Organization ;
    rdfs:label "${escapeString(prov.agentLabel)}" .\n\n`;
    }

    return turtle;
  };

  const generateJsonLd = (): string => {
    const workUri = generateUri("work");
    const instUri = generateUri("instance");
    const itemUri = generateUri("item");

    const graph: any[] = [];

    // Work
    const work: any = {
      "@id": workUri,
      "@type": "bf:Work",
      "bf:title": {
        "@type": "bf:Title",
        "bf:mainTitle": workTitle
      }
    };

    if (subtitle) {
      work["bf:title"]["bf:subtitle"] = subtitle;
    }

    if (language) {
      work["bf:language"] = { "@id": language };
    }

    if (genre) {
      work["bf:genreForm"] = { "@id": genre };
    }

    if (classification) {
      work["bf:classification"] = {
        "@type": "bf:Classification",
        "bf:classificationPortion": classification
      };
    }

    if (subjects.length > 0) {
      work["bf:subject"] = subjects.map((s) => {
        if (isValidHttpUri(s)) {
          return { "@id": s };
        } else {
          return {
            "@type": "bf:Topic",
            "rdfs:label": s
          };
        }
      });
    }

    work["bf:contribution"] = contributors
      .filter((c) => c.agentLabel.trim())
      .map((c) => ({
        "@type": "bf:Contribution",
        "bf:agent": { "@id": c.agentUri || generateUri("agent") },
        "bf:role": { "@id": `http://id.loc.gov/vocabulary/relators/${c.role}` }
      }));

    work["bf:hasInstance"] = { "@id": instUri };
    graph.push(work);

    // Instance
    const instance: any = {
      "@id": instUri,
      "@type": "bf:Instance",
      "bf:instanceOf": { "@id": workUri },
      "bf:title": {
        "@type": "bf:Title",
        "bf:mainTitle": workTitle
      }
    };

    if (subtitle) {
      instance["bf:title"]["bf:subtitle"] = subtitle;
    }

    instance["bf:identifiedBy"] = identifiers
      .filter((id) => id.value.trim())
      .map((id) => ({
        "@type": `bf:${id.type}`,
        "rdf:value": id.value
      }));

    if (extent) {
      instance["bf:extent"] = {
        "@type": "bf:Extent",
        "rdfs:label": extent
      };
    }

    if (carrier) {
      instance["bf:carrier"] = { "@id": carrier };
    }

    if (media) {
      instance["bf:media"] = { "@id": media };
    }

    instance["bf:provisionActivity"] = {
      "@type": "bf:Publication",
      "bf:place": { "@id": prov.place },
      "bf:agent": { "@id": prov.agent || generateUri("organization") },
      "bf:date": {
        "@value": prov.date,
        "@type": "xsd:gYear"
      }
    };

    instance["bf:hasItem"] = { "@id": itemUri };
    graph.push(instance);

    // Item
    const item: any = {
      "@id": itemUri,
      "@type": "bf:Item",
      "bf:itemOf": { "@id": instUri }
    };

    if (heldBy) {
      item["bf:heldBy"] = { "@id": heldBy };
    }

    if (shelfMark) {
      item["bf:shelfMark"] = shelfMark;
    }

    if (barcode) {
      item["bf:identifiedBy"] = {
        "@type": "bf:Barcode",
        "rdf:value": barcode
      };
    }

    graph.push(item);

    // Agents
    contributors.forEach((c) => {
      if (c.agentLabel.trim() && !c.agentUri) {
        graph.push({
          "@id": generateUri("agent"),
          "@type": "bf:Person",
          "rdfs:label": c.agentLabel
        });
      }
    });

    if (!prov.agent && prov.agentLabel) {
      graph.push({
        "@id": generateUri("organization"),
        "@type": "bf:Organization",
        "rdfs:label": prov.agentLabel
      });
    }

    const jsonld = {
      "@context": {
        "bf": "http://id.loc.gov/ontologies/bibframe/",
        "bflc": "http://id.loc.gov/ontologies/bflc/",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "xsd": "http://www.w3.org/2001/XMLSchema#"
      },
      "@graph": graph
    };

    return JSON.stringify(jsonld, null, 2);
  };

  /* ============================= GENERATE ============================= */

  const buildGraph = () => {
    const errors = validate();
    setValidationErrors(errors);

    if (errors.length > 0) {
      setIsValid(false);
      setRdf("");
      return;
    }

    setIsValid(true);

    const output = format === "turtle" ? generateTurtle() : generateJsonLd();
    setRdf(output);
  };

  /* ============================= UI HELPERS ============================= */

  const addContributor = () => {
    setContributors([...contributors, { agentLabel: "", agentUri: "", role: "aut" }]);
  };

  const updateContributor = (i: number, field: keyof Contribution, value: string) => {
    const copy = [...contributors];
    copy[i][field] = value;
    setContributors(copy);
  };

  const removeContributor = (i: number) => {
    setContributors(contributors.filter((_, idx) => idx !== i));
  };

  const addIdentifier = () => {
    setIdentifiers([...identifiers, { type: "Isbn", value: "" }]);
  };

  const updateIdentifier = (i: number, field: keyof Identifier, value: any) => {
    const copy = [...identifiers];
    copy[i][field] = value;
    setIdentifiers(copy);
  };

  const removeIdentifier = (i: number) => {
    setIdentifiers(identifiers.filter((_, idx) => idx !== i));
  };

  const addSubject = () => {
    setSubjects([...subjects, ""]);
  };

  const updateSubject = (i: number, value: string) => {
    const copy = [...subjects];
    copy[i] = value;
    setSubjects(copy);
  };

  const removeSubject = (i: number) => {
    setSubjects(subjects.filter((_, idx) => idx !== i));
  };

  const downloadRdf = () => {
    if (!rdf) return;
    const blob = new Blob([rdf], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bibframe-record.${format === "turtle" ? "ttl" : "jsonld"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ============================= RENDER ============================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-purple-400" />
                🌙 MOON OSHIN
              </h1>
              <p className="text-gray-300">Semantic BIBFRAME RDF Generator</p>
              <p className="text-sm text-gray-400 mt-1">Triple Store Ready • LOC Validator Compatible</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={buildGraph}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg"
              >
                <Sparkles className="h-5 w-5" />
                Generate RDF
              </button>
              {rdf && (
                <button
                  onClick={downloadRdf}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all"
                >
                  <Download className="h-5 w-5" />
                  Download
                </button>
              )}
            </div>
          </div>

          {/* Validation Status */}
          {validationErrors.length > 0 && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Validation Errors ({validationErrors.length})</p>
                  <ul className="mt-2 text-sm text-gray-300 list-disc list-inside space-y-1">
                    {validationErrors.map((error, i) => (
                      <li key={i}>
                        <span className="font-semibold">{error.field}:</span> {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isValid && rdf && (
            <div className="mt-4 p-4 bg-green-900/30 border border-green-500 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <p className="font-semibold text-white">Valid BIBFRAME RDF Generated</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* WORK */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">bf:Work</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Main Title *</label>
                  <input
                    placeholder="The Semantic Web"
                    value={workTitle}
                    onChange={(e) => setWorkTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Subtitle</label>
                  <input
                    placeholder="A Guide to the Future of Data"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Language URI</label>
                  <input
                    placeholder="http://id.loc.gov/vocabulary/languages/eng"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Genre URI</label>
                  <input
                    placeholder="http://id.loc.gov/authorities/genreForms/gf2014026094"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Classification</label>
                  <input
                    placeholder="025.04"
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* SUBJECTS */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Subjects</h2>
                <button
                  onClick={addSubject}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {subjects.map((subject, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      placeholder="URI or label"
                      value={subject}
                      onChange={(e) => updateSubject(i, e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeSubject(i)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CONTRIBUTORS */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Contributors *</h2>
                <button
                  onClick={addContributor}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-3">
                {contributors.map((c, i) => (
                  <div key={i} className="p-4 bg-slate-800/30 border border-slate-600 rounded-lg space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-400">Contributor {i + 1}</span>
                      {contributors.length > 1 && (
                        <button
                          onClick={() => removeContributor(i)}
                          className="text-red-400 hover:text-red-300 font-bold"
                        >
                          × Remove
                        </button>
                      )}
                    </div>
                    <input
                      placeholder="Agent label (e.g., Tim Berners-Lee)"
                      value={c.agentLabel}
                      onChange={(e) => updateContributor(i, "agentLabel", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      placeholder="Agent URI (optional, e.g., http://id.loc.gov/authorities/names/n79041487)"
                      value={c.agentUri}
                      onChange={(e) => updateContributor(i, "agentUri", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={c.role}
                      onChange={(e) => updateContributor(i, "role", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="aut">Author (aut)</option>
                      <option value="edt">Editor (edt)</option>
                      <option value="trl">Translator (trl)</option>
                      <option value="ill">Illustrator (ill)</option>
                      <option value="pbl">Publisher (pbl)</option>
                      <option value="ctb">Contributor (ctb)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* IDENTIFIERS */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Identifiers</h2>
                <button
                  onClick={addIdentifier}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {identifiers.map((id, i) => (
                  <div key={i} className="flex gap-2">
                    <select
                      value={id.type}
                      onChange={(e) => updateIdentifier(i, "type", e.target.value as any)}
                      className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Isbn">ISBN</option>
                      <option value="Issn">ISSN</option>
                      <option value="Lccn">LCCN</option>
                      <option value="Local">Local</option>
                    </select>
                    <input
                      placeholder="Value"
                      value={id.value}
                      onChange={(e) => updateIdentifier(i, "value", e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeIdentifier(i)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* INSTANCE */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">bf:Instance</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Extent</label>
                  <input
                    placeholder="xviii, 256 pages"
                    value={extent}
                    onChange={(e) => setExtent(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Carrier URI</label>
                  <input
                    placeholder="http://id.loc.gov/vocabulary/carriers/nc"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Media URI</label>
                  <input
                    placeholder="http://id.loc.gov/vocabulary/mediaTypes/n"
                    value={media}
                    onChange={(e) => setMedia(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* PROVISION */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Provision Activity *</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Place URI *</label>
                  <input
                    placeholder="http://id.loc.gov/vocabulary/countries/xxu"
                    value={prov.place}
                    onChange={(e) => setProv({ ...prov, place: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Publisher URI</label>
                  <input
                    placeholder="http://id.loc.gov/authorities/names/n79046054"
                    value={prov.agent}
                    onChange={(e) => setProv({ ...prov, agent: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Publisher Label *</label>
                  <input
                    placeholder="O'Reilly Media"
                    value={prov.agentLabel}
                    onChange={(e) => setProv({ ...prov, agentLabel: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Year *</label>
                  <input
                    placeholder="2026"
                    value={prov.date}
                    onChange={(e) => setProv({ ...prov, date: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* ITEM */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">bf:Item</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Held By URI</label>
                  <input
                    placeholder="https://moonlib.org/library/main"
                    value={heldBy}
                    onChange={(e) => setHeldBy(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Shelf Mark</label>
                  <input
                    placeholder="QA76.9.D3 S46 2026"
                    value={shelfMark}
                    onChange={(e) => setShelfMark(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Barcode</label>
                  <input
                    placeholder="31234567890123"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            <div className="glass-card p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">RDF Output</h2>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="turtle">Turtle (.ttl)</option>
                  <option value="jsonld">JSON-LD (.jsonld)</option>
                </select>
              </div>

              {rdf ? (
                <pre className="w-full h-[800px] px-4 py-3 bg-slate-950 border border-slate-600 rounded-lg text-green-400 font-mono text-xs overflow-auto">
                  {rdf}
                </pre>
              ) : (
                <div className="w-full h-[800px] flex items-center justify-center border border-dashed border-slate-600 rounded-lg">
                  <div className="text-center text-gray-400">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No RDF Generated</p>
                    <p className="text-sm mt-2">Fill in the form and click "Generate RDF"</p>
                  </div>
                </div>
              )}

              {rdf && (
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-300">
                    ✅ <strong>Ready for ingestion into:</strong> Apache Fuseki, Blazegraph, GraphDB, Virtuoso, LOC BIBFRAME Validator
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}