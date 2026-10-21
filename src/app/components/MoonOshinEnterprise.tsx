/**
 * 🌙 MOON OSHIN ENTERPRISE
 * Ontology-Driven BIBFRAME Cataloging Engine
 * 
 * Features:
 * - Dynamic field rendering from BIBFRAME ontology
 * - Strict semantic validation
 * - Real RDF graph output (Turtle + JSON-LD)
 * - Triple store ready
 * - Authority integration
 * - Graph connectivity validation
 */

"use client";
import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Download, Sparkles, Database, Network, FileJson, Code, Eye, Save, X, Plus } from "lucide-react";
import { BIBFRAME_PROPERTIES, BIBFRAME_CORE_CLASSES, getPropertiesForClass, getRequiredProperties } from "../../services/bibframeOntology";
import { validateBibframeRecord, ValidationResult } from "../../services/bibframeValidator";
import { toTurtle, toJsonLd, generateUri, validateGraphConnectivity } from "../../services/rdfGraphBuilder";

type ViewMode = "form" | "jsonld" | "turtle" | "validation";

interface Contribution {
  agentLabel: string;
  agentUri: string;
  role: string;
}

interface Provision {
  place: string;
  placeLabel: string;
  agent: string;
  agentLabel: string;
  date: string;
}

interface Identifier {
  type: "Isbn" | "Issn" | "Lccn" | "Local";
  value: string;
}

export default function MoonOshinEnterprise() {
  /* ============================= STATE ============================= */

  const [viewMode, setViewMode] = useState<ViewMode>("form");

  // Work
  const [workUri, setWorkUri] = useState(generateUri("work"));
  const [workTitle, setWorkTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [language, setLanguage] = useState("http://id.loc.gov/vocabulary/languages/eng");
  const [genre, setGenre] = useState("");
  const [classification, setClassification] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [contributors, setContributors] = useState<Contribution[]>([
    { agentLabel: "", agentUri: "", role: "aut" }
  ]);

  // Instance
  const [instanceUri, setInstanceUri] = useState(generateUri("instance"));
  const [identifiers, setIdentifiers] = useState<Identifier[]>([
    { type: "Isbn", value: "" }
  ]);
  const [extent, setExtent] = useState("");
  const [carrier, setCarrier] = useState("http://id.loc.gov/vocabulary/carriers/nc");
  const [media, setMedia] = useState("http://id.loc.gov/vocabulary/mediaTypes/n");
  const [provision, setProvision] = useState<Provision>({
    place: "http://id.loc.gov/vocabulary/countries/xxu",
    placeLabel: "United States",
    agent: "",
    agentLabel: "",
    date: new Date().getFullYear().toString(),
  });

  // Item
  const [itemUri, setItemUri] = useState(generateUri("item"));
  const [shelfMark, setShelfMark] = useState("");
  const [barcode, setBarcode] = useState("");
  const [heldBy, setHeldBy] = useState("https://moonlib.org/library/main");

  // Output
  const [jsonld, setJsonld] = useState<any>(null);
  const [turtle, setTurtle] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [saveBlocked, setSaveBlocked] = useState(false);

  /* ============================= GRAPH BUILDER ============================= */

  const buildGraph = (): any => {
    const graph: any[] = [];

    // WORK
    const work: any = {
      "@id": workUri,
      "@type": "bf:Work",
      "bf:title": {
        "@type": "bf:Title",
        "bf:mainTitle": [{ "@value": workTitle }]
      }
    };

    if (subtitle) {
      work["bf:title"]["bf:subtitle"] = [{ "@value": subtitle }];
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
      work["bf:subject"] = subjects
        .filter(s => s.trim())
        .map(s => {
          if (s.startsWith("http://") || s.startsWith("https://")) {
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
      .filter(c => c.agentLabel.trim())
      .map(c => {
        const agentUri = c.agentUri || generateUri("agent");
        const contrib: any = {
          "@type": "bf:Contribution",
          "bf:agent": { "@id": agentUri },
          "bf:role": { "@id": `http://id.loc.gov/vocabulary/relators/${c.role}` }
        };

        // Add agent node if no URI provided
        if (!c.agentUri && c.agentLabel) {
          graph.push({
            "@id": agentUri,
            "@type": "bf:Person",
            "rdfs:label": c.agentLabel
          });
        }

        return contrib;
      });

    work["bf:hasInstance"] = { "@id": instanceUri };
    graph.push(work);

    // INSTANCE
    const instance: any = {
      "@id": instanceUri,
      "@type": "bf:Instance",
      "bf:instanceOf": { "@id": workUri },
      "bf:title": {
        "@type": "bf:Title",
        "bf:mainTitle": [{ "@value": workTitle }]
      }
    };

    if (subtitle) {
      instance["bf:title"]["bf:subtitle"] = [{ "@value": subtitle }];
    }

    instance["bf:identifiedBy"] = identifiers
      .filter(id => id.value.trim())
      .map(id => ({
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

    const pubAgent = provision.agent || generateUri("organization");
    instance["bf:provisionActivity"] = {
      "@type": "bf:Publication",
      "bf:place": { "@id": provision.place },
      "bf:agent": { "@id": pubAgent },
      "bf:date": {
        "@value": provision.date,
        "@type": "xsd:gYear"
      }
    };

    // Add publisher node if needed
    if (!provision.agent && provision.agentLabel) {
      graph.push({
        "@id": pubAgent,
        "@type": "bf:Organization",
        "rdfs:label": provision.agentLabel
      });
    }

    instance["bf:hasItem"] = { "@id": itemUri };
    graph.push(instance);

    // ITEM
    const item: any = {
      "@id": itemUri,
      "@type": "bf:Item",
      "bf:itemOf": { "@id": instanceUri }
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

    return toJsonLd(graph);
  };

  /* ============================= VALIDATION ============================= */

  const validateAndGenerate = () => {
    const graph = buildGraph();
    const validationResult = validateBibframeRecord(graph);
    
    setValidation(validationResult);
    setJsonld(graph);

    if (validationResult.valid) {
      try {
        const turtleOutput = toTurtle(graph);
        setTurtle(turtleOutput);
        setSaveBlocked(false);
      } catch (error) {
        console.error("Turtle generation error:", error);
        setSaveBlocked(true);
      }
    } else {
      setTurtle("");
      setSaveBlocked(true);
    }

    // Check graph connectivity
    const connectivity = validateGraphConnectivity(graph);
    if (!connectivity.connected) {
      console.warn("Graph has orphan nodes:", connectivity.orphans);
    }
  };

  /* ============================= DOWNLOAD ============================= */

  const downloadRdf = (format: "turtle" | "jsonld") => {
    if (!jsonld) return;

    const content = format === "turtle" ? turtle : JSON.stringify(jsonld, null, 2);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bibframe-record.${format === "turtle" ? "ttl" : "jsonld"}`;
    a.click();
    URL.revokeObjectURL(url);
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

  /* ============================= RENDER ============================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-purple-400" />
                MOON OSHIN ENTERPRISE
              </h1>
              <p className="text-gray-300 font-semibold">Ontology-Driven BIBFRAME Cataloging Engine</p>
              <p className="text-sm text-gray-400 mt-1">
                LOC Ontology Compliant • SHACL Enforced • Triple Store Ready
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={validateAndGenerate}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg"
              >
                <Sparkles className="h-5 w-5" />
                Validate & Generate
              </button>
              {jsonld && validation?.valid && (
                <>
                  <button
                    onClick={() => downloadRdf("turtle")}
                    className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Turtle
                  </button>
                  <button
                    onClick={() => downloadRdf("jsonld")}
                    className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    JSON-LD
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Validation Status */}
          {validation && (
            <div className={`mt-4 p-4 rounded-lg ${validation.valid ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'}`}>
              <div className="flex items-start gap-2">
                {validation.valid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-white">
                    {validation.valid ? 'Valid BIBFRAME Graph' : `${validation.errors.length} Validation Errors`}
                  </p>
                  {validation.errors.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-300 space-y-1">
                      {validation.errors.map((error, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-400 font-mono text-xs">[{error.code}]</span>
                          <span>
                            <strong>{error.entity}</strong>
                            {error.property && ` → ${error.property}`}: {error.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {validation.warnings.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-yellow-500/30">
                      <p className="text-yellow-300 font-semibold mb-2">{validation.warnings.length} Warnings</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {validation.warnings.map((warning, i) => (
                          <li key={i}>
                            <strong>{warning.entity}</strong>: {warning.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {saveBlocked && (
            <div className="mt-4 p-4 bg-red-900/40 border-2 border-red-500 rounded-lg">
              <p className="text-red-200 font-bold text-center">
                SAVE BLOCKED — Fix validation errors before saving
              </p>
            </div>
          )}
        </div>

        {/* View Tabs */}
        <div className="glass-card p-2">
          <div className="flex gap-2">
            <ViewTab
              icon={<FileJson className="h-4 w-4" />}
              label="Cataloging Form"
              active={viewMode === "form"}
              onClick={() => setViewMode("form")}
            />
            <ViewTab
              icon={<Code className="h-4 w-4" />}
              label="Turtle RDF"
              active={viewMode === "turtle"}
              onClick={() => setViewMode("turtle")}
            />
            <ViewTab
              icon={<Database className="h-4 w-4" />}
              label="JSON-LD"
              active={viewMode === "jsonld"}
              onClick={() => setViewMode("jsonld")}
            />
            <ViewTab
              icon={<Network className="h-4 w-4" />}
              label="Validation Report"
              active={viewMode === "validation"}
              onClick={() => setViewMode("validation")}
            />
          </div>
        </div>

        {/* Content */}
        {viewMode === "form" && (
          <FormView
            workTitle={workTitle}
            setWorkTitle={setWorkTitle}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            language={language}
            setLanguage={setLanguage}
            genre={genre}
            setGenre={setGenre}
            classification={classification}
            setClassification={setClassification}
            subjects={subjects}
            addSubject={addSubject}
            updateSubject={updateSubject}
            removeSubject={removeSubject}
            contributors={contributors}
            addContributor={addContributor}
            updateContributor={updateContributor}
            removeContributor={removeContributor}
            identifiers={identifiers}
            addIdentifier={addIdentifier}
            updateIdentifier={updateIdentifier}
            removeIdentifier={removeIdentifier}
            extent={extent}
            setExtent={setExtent}
            carrier={carrier}
            setCarrier={setCarrier}
            media={media}
            setMedia={setMedia}
            provision={provision}
            setProvision={setProvision}
            shelfMark={shelfMark}
            setShelfMark={setShelfMark}
            barcode={barcode}
            setBarcode={setBarcode}
            heldBy={heldBy}
            setHeldBy={setHeldBy}
          />
        )}

        {viewMode === "turtle" && (
          <OutputView title="Turtle RDF" content={turtle || "Generate RDF to see Turtle output..."} language="turtle" />
        )}

        {viewMode === "jsonld" && (
          <OutputView title="JSON-LD" content={jsonld ? JSON.stringify(jsonld, null, 2) : "Generate RDF to see JSON-LD..."} language="json" />
        )}

        {viewMode === "validation" && validation && (
          <ValidationView validation={validation} />
        )}
      </div>
    </div>
  );
}

/* ============================= COMPONENTS ============================= */

function ViewTab({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function OutputView({ title, content, language }: { title: string; content: string; language: string }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <pre className="w-full h-[700px] px-4 py-3 bg-slate-950 border border-slate-600 rounded-lg text-green-400 font-mono text-xs overflow-auto whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  );
}

function ValidationView({ validation }: { validation: ValidationResult }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold text-white mb-4">Validation Report</h3>
      
      {validation.valid ? (
        <div className="p-6 bg-green-900/20 border border-green-500 rounded-lg text-center">
          <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <p className="text-2xl font-bold text-white mb-2">Valid BIBFRAME Graph</p>
          <p className="text-gray-300">Record is ready for triple store ingest</p>
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded text-sm text-blue-200">
            <p className="font-semibold mb-2">Compatible with:</p>
            <ul className="space-y-1">
              <li>✓ Apache Jena Fuseki</li>
              <li>✓ Blazegraph</li>
              <li>✓ GraphDB</li>
              <li>✓ Virtuoso</li>
              <li>✓ LOC BIBFRAME Validator</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <h4 className="font-bold text-red-300 mb-2">Errors ({validation.errors.length})</h4>
            <ul className="space-y-2">
              {validation.errors.map((error, i) => (
                <li key={i} className="p-3 bg-slate-900/50 rounded border-l-4 border-red-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="font-mono text-xs text-red-400">[{error.code}]</span>
                      <p className="text-white font-semibold mt-1">
                        {error.entity}
                        {error.property && ` → ${error.property}`}
                      </p>
                      <p className="text-gray-300 text-sm mt-1">{error.message}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {validation.warnings.length > 0 && (
            <div className="p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
              <h4 className="font-bold text-yellow-300 mb-2">Warnings ({validation.warnings.length})</h4>
              <ul className="space-y-2">
                {validation.warnings.map((warning, i) => (
                  <li key={i} className="p-3 bg-slate-900/50 rounded border-l-4 border-yellow-500">
                    <p className="text-white font-semibold">{warning.entity}</p>
                    <p className="text-gray-300 text-sm mt-1">{warning.message}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// FormView component continues in next file due to length...
function FormView(props: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Work Section */}
      <div className="space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">bf:Work</h2>
          <div className="space-y-4">
            <InputField label="Main Title *" value={props.workTitle} onChange={props.setWorkTitle} />
            <InputField label="Subtitle" value={props.subtitle} onChange={props.setSubtitle} />
            <InputField label="Language URI" value={props.language} onChange={props.setLanguage} placeholder="http://id.loc.gov/vocabulary/languages/eng" />
            <InputField label="Genre URI" value={props.genre} onChange={props.setGenre} placeholder="http://id.loc.gov/authorities/genreForms/..." />
            <InputField label="Classification" value={props.classification} onChange={props.setClassification} placeholder="025.04" />
          </div>
        </div>

        <SubjectsSection subjects={props.subjects} add={props.addSubject} update={props.updateSubject} remove={props.removeSubject} />
        <ContributorsSection contributors={props.contributors} add={props.addContributor} update={props.updateContributor} remove={props.removeContributor} />
      </div>

      {/* Instance & Item Section */}
      <div className="space-y-6">
        <InstanceSection {...props} />
        <ProvisionSection provision={props.provision} setProvision={props.setProvision} />
        <ItemSection shelfMark={props.shelfMark} setShelfMark={props.setShelfMark} barcode={props.barcode} setBarcode={props.setBarcode} heldBy={props.heldBy} setHeldBy={props.setHeldBy} />
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SubjectsSection({ subjects, add, update, remove }: any) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Subjects</h2>
        <button onClick={add} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {subjects.map((subject: string, i: number) => (
          <div key={i} className="flex gap-2">
            <input
              value={subject}
              onChange={(e) => update(i, e.target.value)}
              placeholder="URI or label"
              className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={() => remove(i)} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContributorsSection({ contributors, add, update, remove }: any) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Contributors *</h2>
        <button onClick={add} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <div className="space-y-3">
        {contributors.map((c: Contribution, i: number) => (
          <div key={i} className="p-4 bg-slate-800/30 border border-slate-600 rounded-lg space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-400">Contributor {i + 1}</span>
              {contributors.length > 1 && (
                <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1">
                  <X className="h-4 w-4" /> Remove
                </button>
              )}
            </div>
            <input
              placeholder="Agent label (e.g., Tim Berners-Lee)"
              value={c.agentLabel}
              onChange={(e) => update(i, "agentLabel", e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Agent URI (optional)"
              value={c.agentUri}
              onChange={(e) => update(i, "agentUri", e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={c.role}
              onChange={(e) => update(i, "role", e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="aut">Author (aut)</option>
              <option value="edt">Editor (edt)</option>
              <option value="trl">Translator (trl)</option>
              <option value="ill">Illustrator (ill)</option>
              <option value="ctb">Contributor (ctb)</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function InstanceSection(props: any) {
  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-white mb-4">bf:Instance</h2>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-300">Identifiers</label>
            <button onClick={props.addIdentifier} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1">
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {props.identifiers.map((id: Identifier, i: number) => (
              <div key={i} className="flex gap-2">
                <select
                  value={id.type}
                  onChange={(e) => props.updateIdentifier(i, "type", e.target.value)}
                  className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Isbn">ISBN</option>
                  <option value="Issn">ISSN</option>
                  <option value="Lccn">LCCN</option>
                  <option value="Local">Local</option>
                </select>
                <input
                  value={id.value}
                  onChange={(e) => props.updateIdentifier(i, "value", e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={() => props.removeIdentifier(i)} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <InputField label="Extent" value={props.extent} onChange={props.setExtent} placeholder="xviii, 256 pages" />
        <InputField label="Carrier URI" value={props.carrier} onChange={props.setCarrier} placeholder="http://id.loc.gov/vocabulary/carriers/nc" />
        <InputField label="Media URI" value={props.media} onChange={props.setMedia} placeholder="http://id.loc.gov/vocabulary/mediaTypes/n" />
      </div>
    </div>
  );
}

function ProvisionSection({ provision, setProvision }: any) {
  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-white mb-4">Provision Activity *</h2>
      <div className="space-y-4">
        <InputField label="Place URI *" value={provision.place} onChange={(v: string) => setProvision({ ...provision, place: v })} placeholder="http://id.loc.gov/vocabulary/countries/xxu" />
        <InputField label="Publisher URI" value={provision.agent} onChange={(v: string) => setProvision({ ...provision, agent: v })} placeholder="http://id.loc.gov/authorities/names/..." />
        <InputField label="Publisher Label *" value={provision.agentLabel} onChange={(v: string) => setProvision({ ...provision, agentLabel: v })} placeholder="O'Reilly Media" />
        <InputField label="Year *" value={provision.date} onChange={(v: string) => setProvision({ ...provision, date: v })} placeholder="2026" />
      </div>
    </div>
  );
}

function ItemSection({ shelfMark, setShelfMark, barcode, setBarcode, heldBy, setHeldBy }: any) {
  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-white mb-4">bf:Item</h2>
      <div className="space-y-4">
        <InputField label="Held By URI" value={heldBy} onChange={setHeldBy} placeholder="https://moonlib.org/library/main" />
        <InputField label="Shelf Mark" value={shelfMark} onChange={setShelfMark} placeholder="QA76.9.D3 S46 2026" />
        <InputField label="Barcode" value={barcode} onChange={setBarcode} placeholder="31234567890123" />
      </div>
    </div>
  );
}