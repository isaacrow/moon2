/**
 * 🌙 MOON FALEH - Ultimate BIBFRAME Cataloging System
 * Designed and Developed by Isaac Faleh
 * 
 * Features:
 * ✨ Glassmorphism iOS-style design
 * 🧠 Ontology-driven semantic engine with GraphStore
 * 📚 4-step wizard workflow (Work → Instance → Publication → Item)
 * 🔍 Universal authority search (LOC, VIAF, Wikidata, AfIqa, ISBNdb)
 * 📖 Multi-source search: People, Books, Publishers, Subjects
 * 🎯 Expression layer support (FRBR WEMI)
 * ✅ Real-time SHACL-like validation
 * 💾 Backend persistence with versioning
 * 📥 ISBN auto-fill from Open Library
 * 🌐 Multiple export formats (JSON-LD, Turtle, MARC)
 * 👁️ Rich preview modes (OPAC, Mind Map, Authority Graph)
 * 🔗 Real LOC examples with actual URIs
 */

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Save, Download, Upload, ChevronLeft, Search, User, Building, 
  MapPin, Tag, Globe, BookOpen, Package, Eye, Network, Database,
  FileText, Code, Braces, Sparkles, Book, Layers, CheckCircle2,
  AlertCircle, Loader2, ExternalLink, Clock, BarChart3, ChevronDown
} from "lucide-react";

// Services
import { GraphStore } from "../../services/graphStore";
import { generateUri, toTurtle, toJsonLd } from "../../services/rdfGraphBuilder";
import { getPropertiesForDomain } from "../services/bibframeOntologyEngine";
import { validateGraph, ValidationResult } from "./cataloging/ValidationPanel";
import { RelationshipGraph, Relationship, generateRelationshipId } from "../../services/relationshipManager";
import * as recordAPI from "../../services/recordPersistence";
import { authorityHub } from "../services/authorityHub/authorityHubService";
import { lookupISBN, COMMON_RELATORS } from "../../services/authoritySearch";
import { realLocExamples } from "../utils/realLocExamples";
import type { AuthoritySearchResult, UnifiedPerson } from "../services/authorityHub/types";

// Components
import { OntologyField } from "./ontology/OntologyField";
import { OPACPreview } from "./ontology/OPACPreview";
import { MindMapPreview } from "./ontology/MindMapPreview";
import { AuthorityGraph } from "./AuthorityGraph";
import { MarcView } from "./RecordView/MarcView";
import { RdfView } from "./RecordView/RdfView";
import { RecordViewerDialog } from "./cataloging/RecordViewerDialog";
import { ImportRecordDialog } from "./ontology/ImportRecordDialog";
import { Toaster } from "./ui/sonner";

// Assets
import moonLogo from "figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png";
import "../../styles/glassmorphism.css";

/* ========================================
   TYPES
======================================== */

type WizardStep = "work" | "instance" | "publication" | "item";
type PreviewTab = "form" | "graph" | "marc" | "rdf" | "json" | "opac" | "mindmap" | "validation" | "relationships";
type AuthorityTab = "names" | "personal" | "corporate" | "conference" | "geographic" | "all" | "wikidata" | "books" | "publishers" | "subjects";
type SaveStatus = "saved" | "unsaved" | "saving" | "error";

interface Contribution {
  agent: AuthorityResult | null;
  role: string;
}

interface Identifier {
  type: "Isbn" | "Issn" | "Lccn" | "Local";
  value: string;
}

interface AuthorityResult {
  label: string;
  uri: string;
  source: "LOC" | "VIAF" | "Wikidata" | "AfIqa" | "ISBNdb" | "Local";
}

/* ========================================
   MAIN COMPONENT
======================================== */

export default function MoonFaleh({ onBack }: { onBack?: () => void }) {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<"en" | "ar">(i18n.language as "en" | "ar");

  /* ============================= GRAPH STATE ============================= */
  
  const [graphStore] = useState(new GraphStore());
  const [relationshipGraph] = useState(new RelationshipGraph());
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  
  // URIs
  const [workUri] = useState(generateUri("work"));
  const [expressionUri] = useState(generateUri("expression"));
  const [instanceUri] = useState(generateUri("instance"));
  const [itemUri] = useState(generateUri("item"));

  /* ============================= UI STATE ============================= */
  
  const [currentStep, setCurrentStep] = useState<WizardStep>("work");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("form");
  const [enableExpression, setEnableExpression] = useState(false);
  
  // Dialogs
  const [showAuthoritySearch, setShowAuthoritySearch] = useState(false);
  const [currentAuthorityTab, setCurrentAuthorityTab] = useState<AuthorityTab>("names");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExampleMenu, setShowExampleMenu] = useState(false);
  const [showRecordViewer, setShowRecordViewer] = useState(false);

  /* ============================= WORK DATA ============================= */
  
  const [workTitle, setWorkTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [workLanguage, setWorkLanguage] = useState<AuthorityResult | null>({
    label: "English",
    uri: "http://id.loc.gov/vocabulary/languages/eng",
    source: "LOC"
  });
  const [genre, setGenre] = useState<AuthorityResult | null>(null);
  const [subjects, setSubjects] = useState<AuthorityResult[]>([]);
  const [contributors, setContributors] = useState<Contribution[]>([
    { agent: null, role: "aut" }
  ]);

  /* ============================= INSTANCE DATA ============================= */
  
  const [identifiers, setIdentifiers] = useState<Identifier[]>([
    { type: "Isbn", value: "" }
  ]);
  const [extent, setExtent] = useState("");
  const [carrier, setCarrier] = useState<AuthorityResult | null>({
    label: "volume (print)",
    uri: "http://id.loc.gov/vocabulary/carriers/nc",
    source: "LOC"
  });
  const [media, setMedia] = useState<AuthorityResult | null>({
    label: "unmediated",
    uri: "http://id.loc.gov/vocabulary/mediaTypes/n",
    source: "LOC"
  });

  /* ============================= PUBLICATION DATA ============================= */
  
  const [publicationPlace, setPublicationPlace] = useState<AuthorityResult | null>({
    label: "United States",
    uri: "http://id.loc.gov/vocabulary/countries/xxu",
    source: "LOC"
  });
  const [publisher, setPublisher] = useState<AuthorityResult | null>(null);
  const [publicationDate, setPublicationDate] = useState(new Date().getFullYear().toString());

  /* ============================= ITEM DATA ============================= */
  
  const [heldBy, setHeldBy] = useState("https://moonlib.org/library/main");
  const [shelfMark, setShelfMark] = useState("");
  const [barcode, setBarcode] = useState("");

  /* ============================= PERSISTENCE ============================= */
  
  const [recordId, setRecordId] = useState<string | null>(null);
  const [recordTitle, setRecordTitle] = useState("Untitled Record");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("unsaved");

  /* ============================= RDF OUTPUT ============================= */
  
  const [jsonld, setJsonld] = useState<any>(null);
  const [turtle, setTurtle] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  /* ============================= ISBN LOOKUP ============================= */
  
  const [isbnLookupLoading, setIsbnLookupLoading] = useState(false);

  /* ============================= AUTHORITY SEARCH STATE ============================= */
  
  const [authorityQuery, setAuthorityQuery] = useState("");
  const [authorityResults, setAuthorityResults] = useState<AuthoritySearchResult[]>([]);
  const [authorityLoading, setAuthorityLoading] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState<AuthoritySearchResult | null>(null);
  const [authorityDetails, setAuthorityDetails] = useState<any | null>(null);
  const [loadingAuthorityDetails, setLoadingAuthorityDetails] = useState(false);

  /* ============================= INITIALIZATION ============================= */

  useEffect(() => {
    // Initialize graph with entities
    graphStore.setNode(workUri, {
      '@id': workUri,
      '@type': 'bf:Work'
    });

    graphStore.setNode(instanceUri, {
      '@id': instanceUri,
      '@type': 'bf:Instance'
    });

    graphStore.setNode(itemUri, {
      '@id': itemUri,
      '@type': 'bf:Item'
    });

    // Create WEMI links
    graphStore.createWEMILinks(workUri, undefined, instanceUri, itemUri);

    // Initial generation
    generateRDF();
  }, []);

  /* ============================= GRAPH BUILDING ============================= */

  const buildCompleteGraph = (): any => {
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

    if (workLanguage) {
      work["bf:language"] = { "@id": workLanguage.uri };
    }

    if (genre) {
      work["bf:genreForm"] = { "@id": genre.uri };
    }

    if (subjects.length > 0) {
      work["bf:subject"] = subjects.map(s => ({ "@id": s.uri }));
    }

    work["bf:contribution"] = contributors
      .filter(c => c.agent)
      .map(c => ({
        "@type": "bf:Contribution",
        "bf:agent": { "@id": c.agent!.uri },
        "bf:role": { "@id": `http://id.loc.gov/vocabulary/relators/${c.role}` }
      }));

    if (enableExpression) {
      work["bf:hasExpression"] = { "@id": expressionUri };
    } else {
      work["bf:hasInstance"] = { "@id": instanceUri };
    }

    graph.push(work);

    // Add agent nodes for local contributors
    contributors.forEach(c => {
      if (c.agent && c.agent.source === "Local") {
        graph.push({
          "@id": c.agent.uri,
          "@type": "bf:Person",
          "rdfs:label": c.agent.label
        });
      }
    });

    // EXPRESSION (if enabled)
    if (enableExpression) {
      const expression: any = {
        "@id": expressionUri,
        "@type": "bf:Expression",
        "bf:expressionOf": { "@id": workUri },
        "bf:hasInstance": { "@id": instanceUri }
      };
      graph.push(expression);
    }

    // INSTANCE
    const instance: any = {
      "@id": instanceUri,
      "@type": "bf:Instance",
      "bf:instanceOf": { "@id": enableExpression ? expressionUri : workUri },
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
      instance["bf:carrier"] = { "@id": carrier.uri };
    }

    if (media) {
      instance["bf:media"] = { "@id": media.uri };
    }

    // Publication
    const pubAgent = publisher ? publisher.uri : generateUri("organization");
    instance["bf:provisionActivity"] = {
      "@type": "bf:Publication",
      "bf:place": publicationPlace ? { "@id": publicationPlace.uri } : undefined,
      "bf:agent": { "@id": pubAgent },
      "bf:date": {
        "@value": publicationDate,
        "@type": "xsd:gYear"
      }
    };

    // Add publisher node if local
    if (publisher && publisher.source === "Local") {
      graph.push({
        "@id": publisher.uri,
        "@type": "bf:Organization",
        "rdfs:label": publisher.label
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

    // Add relationships
    relationshipGraph.addToJsonLdGraph(graph, relationships);

    return toJsonLd(graph);
  };

  const generateRDF = () => {
    try {
      const graph = buildCompleteGraph();
      
      // Validate
      const validationResult = validateGraph(graphStore, enableExpression);
      setValidation(validationResult);

      // Set JSON-LD
      setJsonld(graph);

      // Generate Turtle if valid
      if (validationResult.valid) {
        const turtleOutput = toTurtle(graph);
        setTurtle(turtleOutput);
      } else {
        setTurtle("");
      }
    } catch (error) {
      console.error("RDF generation error:", error);
    }
  };

  // Auto-generate on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (workTitle) {
        setSaveStatus("unsaved");
        generateRDF();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [workTitle, subtitle, workLanguage, genre, subjects, contributors, identifiers, 
      extent, carrier, media, publicationPlace, publisher, publicationDate, 
      heldBy, shelfMark, barcode, enableExpression, relationships]);

  /* ============================= AUTHORITY SEARCH ============================= */

  const handleAuthoritySearch = async () => {
    if (!authorityQuery.trim()) return;

    setAuthorityLoading(true);
    setSelectedAuthority(null);
    setAuthorityDetails(null);
    setAuthorityResults([]);

    try {
      let searchResults: AuthoritySearchResult[] = [];
      const isbndb = authorityHub.getIsbndbService();
      
      switch (currentAuthorityTab) {
        case "books":
          searchResults = await isbndb.searchBooks(authorityQuery);
          break;
        case "publishers":
          searchResults = await isbndb.searchPublishers(authorityQuery);
          break;
        case "subjects":
          searchResults = await isbndb.searchSubjects(authorityQuery);
          break;
        case "names":
        case "personal":
        case "corporate":
        case "conference":
        case "geographic":
        case "all":
        case "wikidata":
        default:
          searchResults = await authorityHub.searchAll(authorityQuery);
          break;
      }
      
      setAuthorityResults(searchResults);
    } catch (error) {
      console.error("Authority search error:", error);
      toast.error("Search failed");
    } finally {
      setAuthorityLoading(false);
    }
  };

  const handleSelectAuthority = async (result: AuthoritySearchResult) => {
    setSelectedAuthority(result);
    setLoadingAuthorityDetails(true);
    setAuthorityDetails(null);

    try {
      const isbndb = authorityHub.getIsbndbService();

      if (currentAuthorityTab === "books") {
        setAuthorityDetails({ ...result, type: "book" });
      } else if (currentAuthorityTab === "publishers") {
        const pubDetails = await isbndb.getPublisherDetails(result.label);
        setAuthorityDetails({ ...pubDetails, type: "publisher", source: "ISBNdb" });
      } else if (currentAuthorityTab === "subjects") {
        const subDetails = await isbndb.getSubjectDetails(result.label);
        setAuthorityDetails({ ...subDetails, type: "subject", source: "ISBNdb" });
      } else {
        // Person/Authority
        const person = await authorityHub.buildUnifiedPerson(result);
        setAuthorityDetails(person);
      }
    } catch (error) {
      console.error("Failed to get details:", error);
    } finally {
      setLoadingAuthorityDetails(false);
    }
  };

  const handleConfirmAuthority = () => {
    if (!authorityDetails) return;

    // Handle different types
    if (authorityDetails.type === "book") {
      // Import book data
      setWorkTitle(authorityDetails.title_long || authorityDetails.title || authorityDetails.label);
      if (authorityDetails.isbn13 || authorityDetails.isbn) {
        setIdentifiers([{ type: "Isbn", value: authorityDetails.isbn13 || authorityDetails.isbn }]);
      }
      if (authorityDetails.authors) {
        const authors = Array.isArray(authorityDetails.authors) ? authorityDetails.authors : [authorityDetails.authors];
        const newContribs: Contribution[] = authors.map((author: string) => ({
          agent: {
            label: author,
            uri: generateUri("agent"),
            source: "Local" as const
          },
          role: "aut"
        }));
        setContributors(newContribs);
      }
      toast.success("Book data imported!");
    } else if (authorityDetails.type === "publisher") {
      setPublisher({
        label: authorityDetails.name || authorityDetails.label,
        uri: generateUri("organization"),
        source: "Local"
      });
      toast.success("Publisher added!");
    } else if (authorityDetails.type === "subject") {
      setSubjects([...subjects, {
        label: authorityDetails.subject || authorityDetails.label,
        uri: generateUri("topic"),
        source: "Local"
      }]);
      toast.success("Subject added!");
    } else {
      // Person/Authority
      const person = authorityDetails as UnifiedPerson;
      setContributors([...contributors, {
        agent: {
          label: person.label,
          uri: person.identifiers.loc
            ? `http://id.loc.gov/authorities/names/${person.identifiers.loc}`
            : person.identifiers.wikidata
              ? `https://www.wikidata.org/entity/${person.identifiers.wikidata}`
              : person.id,
          source: person.identifiers.loc ? "LOC" : "Wikidata"
        },
        role: "aut"
      }]);
      toast.success("Contributor added!");
    }

    setShowAuthoritySearch(false);
  };

  /* ============================= ISBN LOOKUP ============================= */

  const handleISBNLookup = async () => {
    const isbn = identifiers.find(id => id.type === "Isbn" && id.value.trim());
    if (!isbn) return;

    setIsbnLookupLoading(true);
    try {
      const data = await lookupISBN(isbn.value);
      if (data) {
        if (data.title) setWorkTitle(data.title);
        if (data.subtitle) setSubtitle(data.subtitle);
        if (data.authors && data.authors.length > 0) {
          const newContribs: Contribution[] = data.authors.map(author => ({
            agent: {
              label: author,
              uri: generateUri("agent"),
              source: "Local" as const
            },
            role: "aut"
          }));
          setContributors(newContribs);
        }
        if (data.publishers && data.publishers.length > 0) {
          setPublisher({
            label: data.publishers[0],
            uri: generateUri("organization"),
            source: "Local"
          });
        }
        if (data.publishDate) {
          const year = data.publishDate.match(/\d{4}/)?.[0];
          if (year) setPublicationDate(year);
        }
        if (data.numberOfPages) {
          setExtent(`${data.numberOfPages} pages`);
        }
        toast.success("Data imported from ISBN!");
      }
    } catch (error) {
      console.error("ISBN lookup error:", error);
      toast.error("ISBN lookup failed");
    } finally {
      setIsbnLookupLoading(false);
    }
  };

  /* ============================= PERSISTENCE ============================= */

  const handleSave = async () => {
    try {
      setSaveStatus("saving");

      if (!jsonld) {
        throw new Error("No graph to save");
      }

      if (recordId) {
        await recordAPI.updateRecord(recordId, jsonld, recordTitle);
      } else {
        const created = await recordAPI.createRecord(jsonld, workTitle || recordTitle, "Work");
        setRecordId(created.id);
      }

      setSaveStatus("saved");
      toast.success("Record saved!");
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
      toast.error("Failed to save record");
    }
  };

  /* ============================= LOAD EXAMPLE ============================= */

  const handleLoadExample = (exampleData: any) => {
    // Extract data from example
    const exWork = exampleData.work;
    const exInstance = exampleData.instance;

    // Populate work data
    const workTitleObj = exWork["bf:title"];
    if (workTitleObj) {
      setWorkTitle(workTitleObj["bf:mainTitle"]?.[0]?.["@value"] || "");
      setSubtitle(workTitleObj["bf:subtitle"]?.[0]?.["@value"] || "");
    }

    // Contributors
    const contribs = exWork["bf:contribution"] || [];
    const mappedContribs: Contribution[] = contribs.map((c: any) => ({
      agent: {
        label: c["bf:agent"]["rdfs:label"] || "Unknown",
        uri: c["bf:agent"]["@id"],
        source: "LOC" as const
      },
      role: c["bf:role"]["@id"]?.split("/").pop() || "aut"
    }));
    setContributors(mappedContribs.length > 0 ? mappedContribs : [{ agent: null, role: "aut" }]);

    // Subjects
    const subjs = exWork["bf:subject"] || [];
    const mappedSubjects: AuthorityResult[] = subjs.map((s: any) => ({
      label: s["rdfs:label"] || s["@id"],
      uri: s["@id"],
      source: "LOC" as const
    }));
    setSubjects(mappedSubjects);

    // Instance
    const instanceTitleObj = exInstance["bf:title"];
    if (instanceTitleObj && !workTitleObj) {
      setWorkTitle(instanceTitleObj["bf:mainTitle"]?.[0]?.["@value"] || "");
    }

    // Identifiers
    const ids = exInstance["bf:identifiedBy"] || [];
    const mappedIds: Identifier[] = ids.map((id: any) => ({
      type: id["@type"]?.replace("bf:", "") as any || "Local",
      value: id["rdf:value"] || ""
    }));
    setIdentifiers(mappedIds.length > 0 ? mappedIds : [{ type: "Isbn", value: "" }]);

    // Publication
    const provision = exInstance["bf:provisionActivity"];
    if (provision) {
      if (provision["bf:date"]) {
        setPublicationDate(provision["bf:date"]["@value"] || "");
      }
      if (provision["bf:place"]) {
        setPublicationPlace({
          label: provision["bf:place"]["rdfs:label"] || "Unknown",
          uri: provision["bf:place"]["@id"],
          source: "LOC"
        });
      }
    }

    setShowExampleMenu(false);
    toast.success("✨ Real LOC example loaded!");
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

  /* ============================= WIZARD VALIDATION ============================= */

  const validateStep = (step: WizardStep): boolean => {
    switch (step) {
      case "work":
        return !!(workTitle.trim() && contributors.length > 0 && contributors.every(c => c.agent !== null && c.role));
      case "instance":
        return !!(carrier && media);
      case "publication":
        return !!(publicationPlace && publisher && publicationDate);
      case "item":
        return true;
      default:
        return false;
    }
  };

  const stepValidation = {
    work: validateStep("work"),
    instance: validateStep("instance"),
    publication: validateStep("publication"),
    item: validateStep("item")
  };

  /* ============================= RELATIONSHIPS ============================= */

  const addRelationship = () => {
    const newRel: Relationship = {
      id: generateRelationshipId(),
      type: "relatedTo",
      sourceUri: workUri,
      targetUri: "",
      label: ""
    };
    setRelationships([...relationships, newRel]);
  };

  /* ============================= AUTHORITY NODES ============================= */

  const authorityNodes = contributors
    .filter(c => c.agent)
    .map((c, index) => ({
      id: c.agent!.uri || `agent-${index}`,
      label: c.agent!.label || "Unknown",
      source: c.agent!.source,
      uri: c.agent!.uri,
      type: "person" as const,
      connections: []
    }));

  /* ============================= SAVE STATUS BADGE ============================= */

  const getSaveStatusBadge = () => {
    const badges = {
      saved: { bg: "bg-green-100", text: "text-green-800", icon: <CheckCircle2 className="h-4 w-4" />, label: "Saved" },
      unsaved: { bg: "bg-yellow-100", text: "text-yellow-800", icon: <Clock className="h-4 w-4" />, label: "Unsaved" },
      saving: { bg: "bg-blue-100", text: "text-blue-800", icon: <Save className="h-4 w-4 animate-spin" />, label: "Saving..." },
      error: { bg: "bg-red-100", text: "text-red-800", icon: <AlertCircle className="h-4 w-4" />, label: "Error" }
    };

    const badge = badges[saveStatus];
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${badge.bg} ${badge.text} font-semibold text-sm`}>
        {badge.icon}
        {badge.label}
      </div>
    );
  };

  /* ============================= RENDER ============================= */

  return (
    <div className="h-screen flex flex-col animated-gradient-bg">
      <Toaster position="top-right" />

      {/* Glass Navbar */}
      <div className="glass-navbar">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="glass-button px-4 py-2 flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              <img src={moonLogo} alt="Moon Logo" className="h-16 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg text-[#000000]">
                  Moon Faleh
                </h1>
                <p className="text-sm text-white/80 text-[#000000cc]">
                  Ultimate BIBFRAME Cataloging System • Designed by Isaac Faleh
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getSaveStatusBadge()}
              <button onClick={handleSave} disabled={saveStatus === "saving"} className="glass-button px-4 py-2 flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save
              </button>
              {validation?.valid && (
                <>
                  <button onClick={() => downloadRdf("jsonld")} className="glass-button px-4 py-2 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    JSON-LD
                  </button>
                  <button onClick={() => downloadRdf("turtle")} className="glass-button px-4 py-2 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Turtle
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Expression Toggle */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={enableExpression}
                onChange={() => setEnableExpression(!enableExpression)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-white font-semibold">
                Enable Expression Layer (FRBR Work→Expression→Instance→Item)
              </span>
            </label>
          </div>

          {/* Authority Search Tabs */}
          <div className="glass-tab-bar flex items-center gap-2 overflow-x-auto pb-2">
            <AuthorityTabButton active={currentAuthorityTab === "names"} onClick={() => { setCurrentAuthorityTab("names"); setShowAuthoritySearch(true); }} icon={<User className="h-4 w-4" />} label="NAF Names" />
            <AuthorityTabButton active={currentAuthorityTab === "corporate"} onClick={() => { setCurrentAuthorityTab("corporate"); setShowAuthoritySearch(true); }} icon={<Building className="h-4 w-4" />} label="Corporate" />
            <AuthorityTabButton active={currentAuthorityTab === "wikidata"} onClick={() => { setCurrentAuthorityTab("wikidata"); setShowAuthoritySearch(true); }} icon={<Globe className="h-4 w-4" />} label="Wikidata" />
            <AuthorityTabButton active={currentAuthorityTab === "books"} onClick={() => { setCurrentAuthorityTab("books"); setShowAuthoritySearch(true); }} icon={<Book className="h-4 w-4" />} label="Books" />
            <AuthorityTabButton active={currentAuthorityTab === "publishers"} onClick={() => { setCurrentAuthorityTab("publishers"); setShowAuthoritySearch(true); }} icon={<Building className="h-4 w-4" />} label="Publishers" />
            <AuthorityTabButton active={currentAuthorityTab === "subjects"} onClick={() => { setCurrentAuthorityTab("subjects"); setShowAuthoritySearch(true); }} icon={<Tag className="h-4 w-4" />} label="Subjects" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {/* Load Real Example */}
            <div className="relative">
              <button onClick={() => setShowExampleMenu(!showExampleMenu)} className="glass-button px-4 py-2 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Load Real Example
              </button>

              {showExampleMenu && (
                <div className="absolute top-full left-0 mt-2 w-80 glass-card z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-white border-b border-white/30">
                      Real LOC Examples
                    </div>
                    {realLocExamples.map((example) => (
                      <button
                        key={example.id}
                        className="w-full text-left px-3 py-2 rounded transition-all hover:bg-black/20"
                        onClick={() => handleLoadExample(example.data)}
                      >
                        <div className="font-medium text-sm text-white">{example.name}</div>
                        <div className="text-xs text-gray-300 mt-1">{example.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setShowImportDialog(true)} className="glass-button px-4 py-2 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Wizard Steps */}
      <div className="glass-navbar border-t border-white/20">
        <div className="px-6 py-3">
          <div className="flex items-center gap-2">
            <WizardStepButton step="work" label="1. Work" active={currentStep === "work"} valid={stepValidation.work} onClick={() => setCurrentStep("work")} />
            <WizardStepButton step="instance" label="2. Instance" active={currentStep === "instance"} valid={stepValidation.instance} onClick={() => setCurrentStep("instance")} />
            <WizardStepButton step="publication" label="3. Publication" active={currentStep === "publication"} valid={stepValidation.publication} onClick={() => setCurrentStep("publication")} />
            <WizardStepButton step="item" label="4. Item" active={currentStep === "item"} valid={stepValidation.item} onClick={() => setCurrentStep("item")} />
          </div>
        </div>
      </div>

      {/* Preview Tabs */}
      <div className="glass-navbar border-t border-white/20">
        <div className="px-6 py-3">
          <div className="glass-tab-bar flex items-center gap-2 overflow-x-auto">
            <PreviewTabButton active={previewTab === "form"} onClick={() => setPreviewTab("form")} icon={<FileText className="h-4 w-4" />} label="Form" />
            <PreviewTabButton active={previewTab === "graph"} onClick={() => setPreviewTab("graph")} icon={<Network className="h-4 w-4" />} label="Graph" />
            <PreviewTabButton active={previewTab === "validation"} onClick={() => setPreviewTab("validation")} icon={<CheckCircle2 className="h-4 w-4" />} label="Validation" />
            <PreviewTabButton active={previewTab === "marc"} onClick={() => setPreviewTab("marc")} icon={<Database className="h-4 w-4" />} label="MARC" />
            <PreviewTabButton active={previewTab === "rdf"} onClick={() => setPreviewTab("rdf")} icon={<Code className="h-4 w-4" />} label="RDF" />
            <PreviewTabButton active={previewTab === "json"} onClick={() => setPreviewTab("json")} icon={<Braces className="h-4 w-4" />} label="JSON" />
            <PreviewTabButton active={previewTab === "opac"} onClick={() => setPreviewTab("opac")} icon={<Eye className="h-4 w-4" />} label="OPAC" />
            <PreviewTabButton active={previewTab === "mindmap"} onClick={() => setPreviewTab("mindmap")} icon={<Sparkles className="h-4 w-4" />} label="Mind Map" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 bg-black/30 backdrop-blur-3xl">
        {/* FORM TAB - Wizard Steps */}
        {previewTab === "form" && (
          <div className="max-w-4xl mx-auto">
            {currentStep === "work" && (
              <WorkStepForm
                workTitle={workTitle}
                setWorkTitle={setWorkTitle}
                subtitle={subtitle}
                setSubtitle={setSubtitle}
                contributors={contributors}
                setContributors={setContributors}
                subjects={subjects}
                setSubjects={setSubjects}
                genre={genre}
                setGenre={setGenre}
              />
            )}

            {currentStep === "instance" && (
              <InstanceStepForm
                identifiers={identifiers}
                setIdentifiers={setIdentifiers}
                extent={extent}
                setExtent={setExtent}
                carrier={carrier}
                setCarrier={setCarrier}
                media={media}
                setMedia={setMedia}
                onISBNLookup={handleISBNLookup}
                isbnLookupLoading={isbnLookupLoading}
              />
            )}

            {currentStep === "publication" && (
              <PublicationStepForm
                publicationPlace={publicationPlace}
                setPublicationPlace={setPublicationPlace}
                publisher={publisher}
                setPublisher={setPublisher}
                publicationDate={publicationDate}
                setPublicationDate={setPublicationDate}
              />
            )}

            {currentStep === "item" && (
              <ItemStepForm
                heldBy={heldBy}
                setHeldBy={setHeldBy}
                shelfMark={shelfMark}
                setShelfMark={setShelfMark}
                barcode={barcode}
                setBarcode={setBarcode}
              />
            )}
          </div>
        )}

        {/* GRAPH TAB */}
        {previewTab === "graph" && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Authority Graph</h3>
            <AuthorityGraph nodes={authorityNodes} />
          </div>
        )}

        {/* VALIDATION TAB */}
        {previewTab === "validation" && validation && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Validation Results</h3>
            <div className={`p-4 rounded-lg ${validation.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                {validation.valid ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">Valid BIBFRAME Record</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-900">{validation.errors.length} Error(s)</span>
                  </>
                )}
              </div>
              {validation.errors.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {validation.errors.map((err, idx) => (
                    <li key={idx} className="text-sm text-red-700">• {err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* MARC TAB */}
        {previewTab === "marc" && jsonld && (
          <MarcView data={{ work: jsonld['@graph']?.find((n: any) => n['@type'] === 'bf:Work') || {}, instance: jsonld['@graph']?.find((n: any) => n['@type'] === 'bf:Instance') || {}, admin: {} }} />
        )}

        {/* RDF TAB */}
        {previewTab === "rdf" && jsonld && (
          <RdfView data={{ work: jsonld['@graph']?.find((n: any) => n['@type'] === 'bf:Work') || {}, instance: jsonld['@graph']?.find((n: any) => n['@type'] === 'bf:Instance') || {}, admin: {} }} />
        )}

        {/* JSON TAB */}
        {previewTab === "json" && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">JSON-LD Structure</h3>
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
              <code>{JSON.stringify(jsonld, null, 2)}</code>
            </pre>
          </div>
        )}

        {/* OPAC TAB */}
        {previewTab === "opac" && jsonld && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">OPAC Preview</h3>
            <OPACPreview
              workData={jsonld['@graph']?.find((n: any) => n['@type'] === 'bf:Work') || {}}
              instanceData={jsonld['@graph']?.find((n: any) => n['@type'] === 'bf:Instance') || {}}
            />
          </div>
        )}

        {/* MINDMAP TAB */}
        {previewTab === "mindmap" && jsonld && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Mind Map</h3>
            <MindMapPreview
              workData={jsonld['@graph']?.find((n: any) => n['@type'] === 'bf:Work') || {}}
              instanceData={jsonld['@graph']?.find((n: any) => n['@type'] === 'bf:Instance') || {}}
            />
          </div>
        )}
      </div>

      {/* Authority Search Dialog */}
      {showAuthoritySearch && (
        <AuthoritySearchDialogComponent
          isOpen={showAuthoritySearch}
          onClose={() => setShowAuthoritySearch(false)}
          searchType={currentAuthorityTab}
          query={authorityQuery}
          setQuery={setAuthorityQuery}
          results={authorityResults}
          loading={authorityLoading}
          onSearch={handleAuthoritySearch}
          selectedResult={selectedAuthority}
          onSelectResult={handleSelectAuthority}
          details={authorityDetails}
          loadingDetails={loadingAuthorityDetails}
          onConfirm={handleConfirmAuthority}
        />
      )}

      {/* Import Dialog */}
      <ImportRecordDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={(work, instance) => {
          // Handle import
          toast.success("Record imported!");
          setShowImportDialog(false);
        }}
      />
    </div>
  );
}

/* ========================================
   FORM STEP COMPONENTS
======================================== */

function WorkStepForm({ workTitle, setWorkTitle, subtitle, setSubtitle, contributors, setContributors, subjects, setSubjects, genre, setGenre }: any) {
  const addContributor = () => {
    setContributors([...contributors, { agent: null, role: "aut" }]);
  };

  const updateContributor = (index: number, field: string, value: any) => {
    const updated = [...contributors];
    updated[index][field] = value;
    setContributors(updated);
  };

  const removeContributor = (index: number) => {
    setContributors(contributors.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Work: Intellectual Content</h2>
        <p className="text-white/80">Describe the conceptual essence of this resource</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Main Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={workTitle}
          onChange={(e) => setWorkTitle(e.target.value)}
          placeholder="Enter the main title"
          className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-2">Subtitle</label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Enter subtitle if applicable"
          className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-white">
            Contributors <span className="text-red-400">*</span>
          </label>
          <button onClick={addContributor} className="glass-button px-3 py-1.5 text-sm">
            + Add Contributor
          </button>
        </div>

        {contributors.map((contrib: any, index: number) => (
          <div key={index} className="p-4 bg-white/10 rounded-lg mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-white">Contributor {index + 1}</span>
              {contributors.length > 1 && (
                <button onClick={() => removeContributor(index)} className="text-sm text-red-400 hover:text-red-300">
                  Remove
                </button>
              )}
            </div>

            {contrib.agent && (
              <div className="mb-3 p-3 bg-white/90 rounded">
                <div className="font-medium text-gray-900">{contrib.agent.label}</div>
                <div className="text-xs text-gray-600 mt-1">{contrib.agent.uri}</div>
              </div>
            )}

            <select
              value={contrib.role}
              onChange={(e) => updateContributor(index, "role", e.target.value)}
              className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-900"
            >
              {COMMON_RELATORS.map(r => (
                <option key={r.code} value={r.code}>{r.label} ({r.code})</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {subjects.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Subjects</label>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject: AuthorityResult, i: number) => (
              <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {subject.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InstanceStepForm({ identifiers, setIdentifiers, extent, setExtent, carrier, setCarrier, media, setMedia, onISBNLookup, isbnLookupLoading }: any) {
  const addIdentifier = () => {
    setIdentifiers([...identifiers, { type: "Isbn", value: "" }]);
  };

  const updateIdentifier = (index: number, field: string, value: any) => {
    const updated = [...identifiers];
    updated[index][field] = value;
    setIdentifiers(updated);
  };

  const removeIdentifier = (index: number) => {
    setIdentifiers(identifiers.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Instance: Physical Manifestation</h2>
        <p className="text-white/80">Describe how this work is embodied</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-white">Identifiers</label>
          <button onClick={addIdentifier} className="glass-button px-3 py-1.5 text-sm">
            + Add Identifier
          </button>
        </div>

        {identifiers.map((id: Identifier, index: number) => (
          <div key={index} className="flex gap-3 mb-3">
            <select
              value={id.type}
              onChange={(e) => updateIdentifier(index, "type", e.target.value)}
              className="px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="Isbn">ISBN</option>
              <option value="Issn">ISSN</option>
              <option value="Lccn">LCCN</option>
              <option value="Local">Local</option>
            </select>
            <input
              type="text"
              value={id.value}
              onChange={(e) => updateIdentifier(index, "value", e.target.value)}
              placeholder="Enter identifier"
              className="flex-1 px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-900"
            />
            <button onClick={() => removeIdentifier(index)} className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg">
              Remove
            </button>
          </div>
        ))}

        {identifiers.some((id: Identifier) => id.type === "Isbn" && id.value.trim()) && (
          <button onClick={onISBNLookup} disabled={isbnLookupLoading} className="w-full glass-button px-4 py-3 flex items-center justify-center gap-2">
            {isbnLookupLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading from ISBN...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Auto-fill from ISBN
              </>
            )}
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-2">Extent</label>
        <input
          type="text"
          value={extent}
          onChange={(e) => setExtent(e.target.value)}
          placeholder="e.g., xviii, 256 pages"
          className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-900"
        />
      </div>
    </div>
  );
}

function PublicationStepForm({ publicationPlace, setPublicationPlace, publisher, setPublisher, publicationDate, setPublicationDate }: any) {
  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Publication Information</h2>
        <p className="text-white/80">Describe how and where this instance was published</p>
      </div>

      {publisher && (
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Publisher</label>
          <div className="p-3 bg-white/90 rounded">
            <div className="font-medium text-gray-900">{publisher.label}</div>
            <div className="text-xs text-gray-600 mt-1">{publisher.uri}</div>
          </div>
        </div>
      )}

      {publicationPlace && (
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Place</label>
          <div className="p-3 bg-white/90 rounded">
            <div className="font-medium text-gray-900">{publicationPlace.label}</div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Publication Year <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={publicationDate}
          onChange={(e) => setPublicationDate(e.target.value)}
          placeholder="YYYY"
          pattern="\d{4}"
          className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-900"
        />
      </div>
    </div>
  );
}

function ItemStepForm({ heldBy, setHeldBy, shelfMark, setShelfMark, barcode, setBarcode }: any) {
  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Item: Holdings (Optional)</h2>
        <p className="text-white/80">Describe physical holdings and location</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-2">Held By (Institution URI)</label>
        <input
          type="text"
          value={heldBy}
          onChange={(e) => setHeldBy(e.target.value)}
          placeholder="https://moonlib.org/library/main"
          className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-2">Shelf Mark / Call Number</label>
        <input
          type="text"
          value={shelfMark}
          onChange={(e) => setShelfMark(e.target.value)}
          placeholder="QA76.9.D3 S46 2026"
          className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-2">Barcode</label>
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="31234567890123"
          className="w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-900"
        />
      </div>
    </div>
  );
}

/* ========================================
   TAB BUTTON COMPONENTS
======================================== */

function AuthorityTabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm font-medium ${
        active ? "glass-tab-active text-blue-600 shadow-lg" : "hover:bg-white/30 text-gray-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PreviewTabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm font-medium ${
        active ? "glass-tab-active text-purple-600 shadow-lg" : "hover:bg-white/30 text-gray-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function WizardStepButton({ step, label, active, valid, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-sm font-medium ${
        active 
          ? "glass-tab-active text-blue-600 shadow-lg" 
          : valid 
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "hover:bg-white/30 text-gray-700"
      }`}
    >
      {valid && <CheckCircle2 className="h-4 w-4 text-green-600" />}
      {label}
    </button>
  );
}

/* ========================================
   AUTHORITY SEARCH DIALOG
======================================== */

function AuthoritySearchDialogComponent({
  isOpen, onClose, searchType, query, setQuery, results, loading,
  onSearch, selectedResult, onSelectResult, details, loadingDetails, onConfirm
}: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="glass-navbar text-gray-900 px-6 py-4 rounded-t-lg">
          <h2 className="text-2xl font-semibold">Universal Authority & Resource Search</h2>
          <p className="text-sm opacity-90 mt-1">Search: {searchType}</p>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder={`Search ${searchType}...`}
              className="flex-1 px-4 py-3 border rounded-lg"
              autoFocus
            />
            <button onClick={onSearch} disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Results */}
          <div className="w-1/3 border-r overflow-auto p-4">
            <h3 className="text-sm font-semibold mb-3">Results ({results.length})</h3>
            {results.map((result: any, idx: number) => (
              <button
                key={idx}
                onClick={() => onSelectResult(result)}
                className={`w-full text-left p-3 rounded-lg mb-2 border-2 ${
                  selectedResult?.id === result.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium">{result.label}</div>
                <div className="text-xs text-gray-600 mt-1">{result.description}</div>
              </button>
            ))}
          </div>

          {/* Details */}
          <div className="flex-1 overflow-auto p-6">
            {loadingDetails ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : details ? (
              <div>
                <h3 className="text-2xl font-bold mb-4">{details.label || details.name}</h3>
                {details.description && <p className="text-gray-600 mb-4">{details.description}</p>}
                
                <button onClick={onConfirm} className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Use This {searchType}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a result to view details
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-between bg-gray-50">
          <div className="text-xs text-gray-500">Powered by: LOC • VIAF • Wikidata • AfIqa • ISBNdb</div>
          <button onClick={onClose} className="px-4 py-2 hover:bg-gray-200 rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );
}