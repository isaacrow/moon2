/**
 * BLUE MOON — Premium Ontology-Driven BIBFRAME Linked Data Editor
 *
 * A production-grade, RDF-native cataloging platform that generates fully valid
 * JSON-LD compliant with the official BIBFRAME vocabulary from the Library of Congress.
 *
 * Core capabilities:
 * - Real BIBFRAME RDF with @graph, real URIs, blank nodes, canonical serialization
 * - Full WEMI modeling: Work → Expression → Instance → Item
 * - Ontology-driven field engine (subject–predicate–object triple store)
 * - Live authority control: LOC, VIAF, Wikidata, ISBNdb
 * - W3C-compliant JSON-LD, Turtle, N-Triples export
 * - MARC 21 mapped export
 * - SHACL graph validation, institutional validation (LOC/PCC)
 * - OPAC preview, Mind Map, Authority Graph visualizations
 *
 * Designed and developed by Isaac Faleh
 */

"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";
import {
  Save, Download, Upload, ChevronLeft, ChevronDown, ChevronRight,
  Search, BookOpen, Package, Layers, Database, FileText, Code, Braces,
  Sparkles, Book, Network, CheckCircle2, AlertCircle, AlertTriangle,
  BarChart3, Clock, Loader2, Eye, Music, Map, FileJson, Globe, User,
  Building, MapPin, Tag, Newspaper, Archive, Shield, Hash, Activity,
  Copy, ExternalLink, Zap, Settings, RefreshCw, Plus, X, Info,
  Moon, Star, Orbit, Waves, Fingerprint, Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ===== CORE SERVICES =====
import { GraphStore } from "../../services/graphStore";
import { generateUri, toTurtle, toJsonLd, extractTriples, validateGraphConnectivity } from "../../services/rdfGraphBuilder";
import {
  RelationshipGraph, Relationship, generateRelationshipId,
  RELATIONSHIP_DEFINITIONS, getRelationshipTypesForDomain
} from "../../services/relationshipManager";
import { validateBibframeRecord, ValidationResult as BFValidationResult } from "../../services/bibframeValidator";
import { validateInstitutionalBibframe, getValidationBadge, InstitutionalValidationResult } from "../../services/institutionalValidator";
import {
  ONTOLOGY_REGISTRY, OntologyProperty,
  getPropertiesByDomain, getCategoriesForDomain, getPropertiesByCategory
} from "../../services/ontologyRegistry";
import {
  BIBFRAME_PROPERTY_REGISTRY, getPropertiesByDomain as getRegProperties,
  getGroupsForDomain, getPropertiesByGroup, getRequiredPropertiesByDomain,
  BibframePropertyDefinition
} from "../../services/bibframePropertyRegistry";
import {
  MONOGRAPH_COMPLETE_TEMPLATE, SERIAL_TEMPLATE, MANUSCRIPT_TEMPLATE,
  MUSIC_TEMPLATE, MAP_TEMPLATE, TEMPLATE_REGISTRY,
  getAllTemplates, getTemplate, CatalogingTemplate
} from "../../services/templateEngine";
import {
  generateRecordId, mintUriSet, mintUri, mintAgentUri,
  mintContributionUri, mintProvisionUri, mintIdentifierUri,
  mintTitleUri, UriSet
} from "../../services/uriMintingService";
import {
  BIBFRAME_CORE_CLASSES, BIBFRAME_PROPERTIES, ONTOLOGY_VERSION,
  getPropertiesForClass, getRequiredProperties
} from "../../services/bibframeOntology";
import {
  AuthorityResult, ISBNData,
  searchAllAuthorities, searchLanguages, searchCarriers,
  searchMediaTypes, searchCountries, searchRelators,
  COMMON_RELATORS, lookupISBN
} from "../../services/authoritySearch";

// ===== APP SERVICES =====
import { getPropertiesForDomain } from "../services/bibframeOntologyEngine";
import { buildBibframeGraph, generateUri as genUri } from "../services/graphBuilder";
import { generateMARC } from "../services/marcGenerator";
import {
  buildW3CJsonLd, validateW3CJsonLd, jsonLdToTurtle, jsonLdToNTriples,
  BIBFRAME_JSONLD_CONTEXT, JsonLdValidationResult
} from "../../services/w3cJsonLdBuilder";

// ===== APP UTILS =====
import { realLocExamples } from "../utils/realLocExamples";
import { saveRecord } from "../utils/recordStorageBackend";

// ===== COMPONENTS =====
import { OntologyField } from "./ontology/OntologyField";
import { OPACPreview } from "./ontology/OPACPreview";
import { MindMapPreview } from "./ontology/MindMapPreview";
import { ImportRecordDialog } from "./ontology/ImportRecordDialog";
import { OntologyDrivenFormRenderer } from "./cataloging/OntologyDrivenFormRenderer";
import { ValidationPanel, validateGraph, ValidationResult } from "./cataloging/ValidationPanel";
import { RecordViewerDialog } from "./cataloging/RecordViewerDialog";
import { CatalogingWizard, WizardStep } from "./cataloging/CatalogingWizard";
import { AuthoritySelect, AuthorityMultiSelect } from "./cataloging/AuthoritySelect";
import { AuthoritySearchDialog } from "./AuthoritySearchDialog";
import { AuthorityGraph } from "./AuthorityGraph";
import { MarcView } from "./RecordView/MarcView";
import { RdfView } from "./RecordView/RdfView";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// ===== CONTEXTS =====
import { useAuth } from "../contexts/AuthContext";
import { useThemeSafe } from "../hooks/useThemeSafe";
import { BIBFRAMERecord } from "../types/bibframe";

// ===== ASSETS =====
import moonLogo from "figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png";
import "../../styles/glassmorphism.css";

// ============================== TYPES ==============================

type OutputTab = "editor" | "jsonld" | "w3c-jsonld" | "turtle" | "ntriples" | "marc" | "triples" | "opac" | "mindmap" | "validation" | "relationships" | "authority-graph";
type SaveStatus = "saved" | "unsaved" | "saving" | "error";

// ============================== FIELD TEMPLATE TYPE ==============================

interface FieldTemplate {
  id: string;
  name: string;
  baseTemplate: string;
  hiddenFields: string[];
  allFields: string[];
  createdAt: string;
}

const FIELD_TEMPLATES_KEY = "bm-field-templates";

interface BlueMoonProps {
  onBack?: () => void;
  initialWork?: any;
  initialInstance?: any;
  onRecordSaved?: () => void;
}

// ============================== THEME CONSTANTS ==============================

type GlassTheme = "dark" | "legacy";

const BM_DARK = {
  bg: "linear-gradient(180deg, #0f172a 0%, #1a1040 25%, #0f172a 50%, #1a1040 75%, #0f172a 100%)",
  navBg: "rgba(15,23,42,0.85)",
  navBorder: "rgba(59,130,246,0.15)",
  cardBg: "rgba(15,23,42,0.65)",
  cardBorder: "rgba(59,130,246,0.12)",
  cardHover: "rgba(59,130,246,0.08)",
  accent: "#3b82f6",
  accentDim: "#60a5fa",
  accentGlow: "rgba(59,130,246,0.15)",
  accentBorder: "rgba(59,130,246,0.25)",
  secondary: "#1e40af",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  inputBg: "rgba(30,41,59,0.7)",
  inputBorder: "rgba(59,130,246,0.2)",
};

const BM_LEGACY = {
  bg: "transparent",
  navBg: "rgba(255,255,255,0.8)",
  navBorder: "rgba(255,255,255,0.5)",
  cardBg: "rgba(255,255,255,0.75)",
  cardBorder: "rgba(255,255,255,0.4)",
  cardHover: "rgba(0,0,0,0.05)",
  accent: "#3b82f6",
  accentDim: "#2563eb",
  accentGlow: "rgba(59,130,246,0.12)",
  accentBorder: "rgba(59,130,246,0.3)",
  secondary: "#1e40af",
  success: "#059669",
  warning: "#d97706",
  danger: "#dc2626",
  text: "#000000",
  textMuted: "#374151",
  textDim: "#6b7280",
  inputBg: "rgba(255,255,255,0.5)",
  inputBorder: "rgba(255,255,255,0.4)",
};

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  "monograph-complete": <BookOpen className="h-4 w-4" />,
  serial: <Newspaper className="h-4 w-4" />,
  manuscript: <Archive className="h-4 w-4" />,
  music: <Music className="h-4 w-4" />,
  map: <Map className="h-4 w-4" />,
};

// ============================== MAIN COMPONENT ==============================

export default function BlueMoon({
  onBack, initialWork, initialInstance, onRecordSaved
}: BlueMoonProps) {
  const { t, i18n } = useTranslation();
  const { username } = useAuth();
  const [language, setLanguage] = useState<"en" | "ar">(i18n.language as "en" | "ar");

  // ===== GLASS THEME =====
  const [glassTheme, setGlassTheme] = useState<GlassTheme>("dark");
  const BM = glassTheme === "legacy" ? BM_LEGACY : BM_DARK;
  const gradientClass = glassTheme === "legacy" ? "animated-gradient-bg" : "animated-gradient-bg-blue";
  const isLegacy = glassTheme === "legacy";
  const glassElBg = isLegacy ? "rgba(255,255,255,0.6)" : "rgba(30,41,59,0.5)";
  const glassElBorder = isLegacy ? "1px solid rgba(255,255,255,0.5)" : "1px solid rgba(59,130,246,0.08)";
  const glassElBgActive = isLegacy ? "rgba(255,255,255,0.75)" : "rgba(59,130,246,0.15)";

  // ===== TEMPLATE SELECTION =====
  const [selectedTemplate, setSelectedTemplate] = useState<string>("monograph-complete");
  const template = useMemo(() => getTemplate(selectedTemplate) || MONOGRAPH_COMPLETE_TEMPLATE, [selectedTemplate]);

  // ===== ACTIVE TAB =====
  const [activeTab, setActiveTab] = useState<OutputTab>("editor");

  // ===== URI MINTING =====
  const [recordId] = useState(() => generateRecordId());
  const [uriSet] = useState<UriSet>(() => mintUriSet(recordId));

  // ===== GRAPH STORE =====
  const [graphStore] = useState(new GraphStore());
  const [enableExpression, setEnableExpression] = useState(false);
  const [relationshipGraph] = useState(new RelationshipGraph());
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  // ===== SERIALIZATION STATE =====
  const [graphJsonld, setGraphJsonld] = useState<any>(null);
  const [graphTurtle, setGraphTurtle] = useState("");
  const [graphTriples, setGraphTriples] = useState<any[]>([]);
  const [graphValidation, setGraphValidation] = useState<ValidationResult | null>(null);
  const [bfValidation, setBfValidation] = useState<BFValidationResult | null>(null);
  const [institutionalValidation, setInstitutionalValidation] = useState<InstitutionalValidationResult | null>(null);

  // ===== W3C-COMPLIANT OUTPUT =====
  const [w3cJsonLd, setW3cJsonLd] = useState<any>(null);
  const [w3cTurtle, setW3cTurtle] = useState("");
  const [w3cNTriples, setW3cNTriples] = useState("");
  const [w3cValidation, setW3cValidation] = useState<JsonLdValidationResult | null>(null);

  // ===== ONTOLOGY-DRIVEN STATE =====
  const [workData, setWorkData] = useState<any>(
    initialWork || { "@type": "bf:Work", "@id": uriSet.work, "bf:contribution": [] }
  );
  const [instanceData, setInstanceData] = useState<any>(
    initialInstance || { "@type": "bf:Instance", "@id": uriSet.instance }
  );

  // ===== SAVE STATE =====
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(initialWork ? "saved" : "unsaved");
  const [recordTitle, setRecordTitle] = useState(() => {
    if (initialWork) {
      const t = initialWork["bf:title"];
      if (t) {
        if (typeof t === "string") return t;
        if (t["bf:mainTitle"]) return typeof t["bf:mainTitle"] === "string" ? t["bf:mainTitle"] : (t["bf:mainTitle"]["@value"] || t["bf:mainTitle"]);
        if (t["mainTitle"]) return t["mainTitle"];
        if (t["rdfs:label"]) return t["rdfs:label"];
      }
    }
    return "Untitled Record";
  });
  const [showRecordViewer, setShowRecordViewer] = useState(false);

  // ===== DIALOGS =====
  const [showAuthoritySearch, setShowAuthoritySearch] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExampleMenu, setShowExampleMenu] = useState(false);

  // ===== EXPANDED SECTIONS =====
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set(["Work", "Instance"]));

  // ===== HIDDEN FIELDS (for delete/restore tracking) =====
  const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set());
  const [showFieldManager, setShowFieldManager] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [showLoadTemplateDialog, setShowLoadTemplateDialog] = useState(false);
  const [savedFieldTemplates, setSavedFieldTemplates] = useState<FieldTemplate[]>(() => {
    try { return JSON.parse(localStorage.getItem(FIELD_TEMPLATES_KEY) || "[]"); } catch { return []; }
  });

  const hideField = useCallback((fieldKey: string) => {
    setHiddenFields(prev => { const n = new Set(prev); n.add(fieldKey); return n; });
    toast.success(t("deleteField"), { description: fieldKey.replace("ontology:", "").replace("registry:", "").split("/").pop() });
  }, [t]);

  const restoreField = useCallback((fieldKey: string) => {
    setHiddenFields(prev => { const n = new Set(prev); n.delete(fieldKey); return n; });
    toast.success(t("restoreField"), { description: fieldKey.replace("ontology:", "").replace("registry:", "").split("/").pop() });
  }, [t]);

  const restoreAllFields = useCallback(() => {
    setHiddenFields(new Set());
    toast.success(t("restoreAll"));
  }, [t]);

  const persistFieldTemplates = useCallback((templates: FieldTemplate[]) => {
    setSavedFieldTemplates(templates);
    localStorage.setItem(FIELD_TEMPLATES_KEY, JSON.stringify(templates));
  }, []);

  // ===== LANGUAGE TOGGLE =====
  const toggleLanguage = useCallback(() => {
    const newLang = language === "en" ? "ar" : "en";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  }, [language, i18n]);

  // ===== ONTOLOGY PROPERTIES =====
  const workProperties = getPropertiesForDomain("bf:Work");
  const instanceProperties = getPropertiesForDomain("bf:Instance");

  // Compute the full manifest of all fields (registry + ontology) for template tracking
  const allFieldKeys = useMemo(() => {
    const keys: string[] = [];
    getCategoriesForDomain("Work").forEach(cat => {
      getPropertiesByCategory("Work", cat).forEach(p => keys.push(`registry:${p.shortName}`));
    });
    getCategoriesForDomain("Instance").forEach(cat => {
      getPropertiesByCategory("Instance", cat).forEach(p => keys.push(`registry:${p.shortName}`));
    });
    getCategoriesForDomain("Expression").forEach(cat => {
      getPropertiesByCategory("Expression", cat).forEach(p => keys.push(`registry:${p.shortName}`));
    });
    getCategoriesForDomain("Item").forEach(cat => {
      getPropertiesByCategory("Item", cat).forEach(p => keys.push(`registry:${p.shortName}`));
    });
    workProperties.forEach(p => keys.push(`ontology:${p.uri}`));
    instanceProperties.forEach(p => keys.push(`ontology:${p.uri}`));
    return [...new Set(keys)];
  }, [workProperties, instanceProperties]);

  const handleSaveFieldTemplate = useCallback((name: string) => {
    const tmpl: FieldTemplate = {
      id: `ft-${Date.now()}`,
      name,
      baseTemplate: template.name,
      hiddenFields: Array.from(hiddenFields),
      allFields: allFieldKeys,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedFieldTemplates, tmpl];
    persistFieldTemplates(updated);
    setShowSaveTemplateDialog(false);
    toast.success(t("templateSaved"), { description: `${name} — ${allFieldKeys.length - hiddenFields.size} ${t("fieldsKept")}, ${hiddenFields.size} ${t("fieldsRemoved")}` });
  }, [hiddenFields, allFieldKeys, template, savedFieldTemplates, persistFieldTemplates, t]);

  const handleLoadFieldTemplate = useCallback((tmpl: FieldTemplate) => {
    setHiddenFields(new Set(tmpl.hiddenFields));
    setShowLoadTemplateDialog(false);
    toast.success(t("templateApplied"), { description: tmpl.name });
  }, [t]);

  const handleDeleteFieldTemplate = useCallback((id: string) => {
    const updated = savedFieldTemplates.filter(t => t.id !== id);
    persistFieldTemplates(updated);
    toast.success(t("templateDeleted"));
  }, [savedFieldTemplates, persistFieldTemplates, t]);

  // ===== TEMPLATE-AWARE PROPERTIES =====
  const templateWorkGroups = useMemo(() => getGroupsForDomain("Work"), []);
  const templateInstanceGroups = useMemo(() => getGroupsForDomain("Instance"), []);
  const templateItemGroups = useMemo(() => getGroupsForDomain("Item"), []);
  const workRequiredProps = useMemo(() => getRequiredPropertiesByDomain("Work"), []);
  const instanceRequiredProps = useMemo(() => getRequiredPropertiesByDomain("Instance"), []);

  // ============================== INITIALIZATION ==============================

  useEffect(() => {
    graphStore.setNode(uriSet.work, { "@id": uriSet.work, "@type": "bf:Work" });
    graphStore.setNode(uriSet.instance, { "@id": uriSet.instance, "@type": "bf:Instance" });
    graphStore.setNode(uriSet.item, { "@id": uriSet.item, "@type": "bf:Item" });

    if (template.enableExpression) {
      setEnableExpression(true);
      graphStore.setNode(uriSet.expression, { "@id": uriSet.expression, "@type": "bf:Expression" });
      graphStore.createWEMILinks(uriSet.work, uriSet.expression, uriSet.instance, uriSet.item);
    } else {
      graphStore.createWEMILinks(uriSet.work, undefined, uriSet.instance, uriSet.item);
    }

    const adminUri = uriSet.admin;
    graphStore.setNode(adminUri, {
      "@id": adminUri, "@type": "bf:AdminMetadata",
      "bf:creationDate": new Date().toISOString().split("T")[0],
      "bf:source": { "@id": "https://moonlib.org", "rdfs:label": "Moon Library System — Blue Moon" },
      "bf:descriptionConventions": { "@id": "http://id.loc.gov/vocabulary/descriptionConventions/rda", "rdfs:label": "RDA" },
      "bf:descriptionLanguage": { "@id": "http://id.loc.gov/vocabulary/languages/eng", "rdfs:label": "English" },
      "bf:generationProcess": `Blue Moon v1.0 (${template.name})`,
      "bf:catalogerId": username || "anonymous",
    });
    regenerateRDF();
  }, []);

  useEffect(() => {
    if (template.enableExpression && !enableExpression) {
      setEnableExpression(true);
      graphStore.setNode(uriSet.expression, { "@id": uriSet.expression, "@type": "bf:Expression" });
      graphStore.createWEMILinks(uriSet.work, uriSet.expression, uriSet.instance, uriSet.item);
    }
    regenerateRDF();
  }, [selectedTemplate]);

  useEffect(() => { if (initialWork) setWorkData(initialWork); }, [initialWork]);
  useEffect(() => { if (initialInstance) setInstanceData(initialInstance); }, [initialInstance]);

  useEffect(() => {
    const currentWork = graphStore.getNode(uriSet.work);
    if (currentWork) graphStore.setNode(uriSet.work, { ...currentWork, ...workData, "@id": uriSet.work, "@type": "bf:Work" });
    const currentInstance = graphStore.getNode(uriSet.instance);
    if (currentInstance) graphStore.setNode(uriSet.instance, { ...currentInstance, ...instanceData, "@id": uriSet.instance, "@type": "bf:Instance" });
    const timer = setTimeout(() => regenerateRDF(), 300);
    return () => clearTimeout(timer);
  }, [workData, instanceData]);

  // ============================== GRAPH ENGINE ==============================

  const handlePropertyChange = useCallback((nodeUri: string, property: string, value: any) => {
    graphStore.setProperty(nodeUri, property, value);
    if (nodeUri === uriSet.work) setWorkData((prev: any) => ({ ...prev, [property]: value }));
    else if (nodeUri === uriSet.instance) setInstanceData((prev: any) => ({ ...prev, [property]: value }));
    setSaveStatus("unsaved");
    setTimeout(() => regenerateRDF(), 500);
  }, [uriSet]);

  const toggleExpression = () => {
    const newValue = !enableExpression;
    setEnableExpression(newValue);
    setSaveStatus("unsaved");
    if (newValue) {
      graphStore.setNode(uriSet.expression, { "@id": uriSet.expression, "@type": "bf:Expression" });
    } else {
      const work = graphStore.getNode(uriSet.work);
      if (work) delete work["bf:hasExpression"];
      const inst = graphStore.getNode(uriSet.instance);
      if (inst) inst["bf:instanceOf"] = { "@id": uriSet.work };
    }
    graphStore.createWEMILinks(uriSet.work, newValue ? uriSet.expression : undefined, uriSet.instance, uriSet.item);
    regenerateRDF();
  };

  const regenerateRDF = () => {
    try {
      const graphData = graphStore.toJsonLd();
      relationshipGraph.addToJsonLdGraph(graphData["@graph"] || [], relationships);
      const validationResult = validateGraph(graphStore, enableExpression);
      setGraphValidation(validationResult);
      const bfResult = validateBibframeRecord(graphData);
      setBfValidation(bfResult);
      const instResult = validateInstitutionalBibframe(graphData);
      setInstitutionalValidation(instResult);
      setGraphJsonld(graphData);
      const triples = extractTriples(graphData);
      setGraphTriples(triples);
      try { setGraphTurtle(toTurtle(graphData)); } catch { setGraphTurtle(""); }
      try {
        const itemNode = graphStore.getNode(uriSet.item);
        const exprNode = graphStore.getNode(uriSet.expression);
        const adminNode = graphStore.getNode(uriSet.admin);
        const w3cDoc = buildW3CJsonLd({ workData, instanceData, itemData: itemNode || {}, expressionData: exprNode || {}, adminData: adminNode || {}, uriSet, enableExpression });
        setW3cJsonLd(w3cDoc);
        const w3cVal = validateW3CJsonLd(w3cDoc);
        setW3cValidation(w3cVal);
        try { setW3cTurtle(jsonLdToTurtle(w3cDoc)); } catch { setW3cTurtle(""); }
        try { setW3cNTriples(jsonLdToNTriples(w3cDoc)); } catch { setW3cNTriples(""); }
      } catch (e) { console.error("W3C JSON-LD build error:", e); }
    } catch (error) { console.error("Graph RDF generation error:", error); }
  };

  // ============================== ONTOLOGY FORM ==============================

  const updateWorkProperty = useCallback((uri: string, value: any) => {
    const propertyName = uri.split("/").pop() || uri;
    setWorkData((prev: any) => ({ ...prev, [propertyName]: value }));
    setSaveStatus("unsaved");
  }, []);

  const updateInstanceProperty = useCallback((uri: string, value: any) => {
    const propertyName = uri.split("/").pop() || uri;
    if (value && value._isbnLookupData) {
      const data: ISBNData = value._isbnLookupData;
      const cleanValue = { ...value };
      delete cleanValue._isbnLookupData;
      setInstanceData((prev: any) => {
        const updated = { ...prev, [propertyName]: cleanValue };
        if (data.numberOfPages) updated["bf:extent"] = { value: `${data.numberOfPages} pages`, "@type": "bf:Extent" };
        if (data.publishers?.length) {
          updated["bf:provisionActivity"] = {
            "@type": "bf:Publication",
            "bf:agent": { "@type": "bf:Organization", "rdfs:label": data.publishers[0] },
            ...(data.publishDate ? { "bf:date": data.publishDate.match(/\d{4}/)?.[0] || data.publishDate } : {}),
          };
        }
        return updated;
      });
      setWorkData((prev: any) => {
        const updated = { ...prev };
        if (data.title) {
          updated["bf:title"] = {
            "@type": "bf:Title", "bf:mainTitle": data.title, mainTitle: data.title,
            ...(data.subtitle ? { "bf:subtitle": data.subtitle, subtitle: data.subtitle } : {}),
          };
        }
        if (data.authors?.length) {
          updated["bf:contribution"] = data.authors.map((author: string) => ({
            "bf:agent": { "@type": "bf:Person", "rdfs:label": author },
            "bf:role": { "@id": "http://id.loc.gov/vocabulary/relators/aut", "rdfs:label": "Author" },
          }));
        }
        return updated;
      });
      setSaveStatus("unsaved");
      toast.success("ISBN auto-fill complete!", { description: `${[data.title, data.authors?.join(", "), data.publishers?.[0], data.publishDate].filter(Boolean).join(" — ")}`, duration: 5000 });
      return;
    }
    setInstanceData((prev: any) => ({ ...prev, [propertyName]: value }));
    setSaveStatus("unsaved");
  }, []);

  // ============================== RELATIONSHIPS ==============================

  const addRelationship = (domain: "Work" | "Instance" = "Work") => {
    const types = getRelationshipTypesForDomain(domain);
    setRelationships(prev => [...prev, { id: generateRelationshipId(), type: types[0] || "relatedTo", sourceUri: domain === "Work" ? uriSet.work : uriSet.instance, targetUri: "", label: "" }]);
    setSaveStatus("unsaved");
  };
  const updateRelationship = (id: string, field: string, value: any) => {
    setRelationships(prev => prev.map(rel => rel.id === id ? { ...rel, [field]: value } : rel));
    setSaveStatus("unsaved");
    setTimeout(() => regenerateRDF(), 500);
  };
  const removeRelationship = (id: string) => {
    setRelationships(prev => prev.filter(rel => rel.id !== id));
    setSaveStatus("unsaved");
    setTimeout(() => regenerateRDF(), 500);
  };

  // ============================== AUTHORITY ==============================

  const handleAuthoritySelect = (entity: any) => {
    if (entity.type === "book") {
      setInstanceData((prev: any) => ({ ...prev, "bf:title": { "@type": "bf:Title", "bf:mainTitle": entity.title_long || entity.title || entity.label }, "bf:identifiedBy": [{ "@type": "bf:Isbn", "rdf:value": entity.isbn13 || entity.isbn || entity.id }] }));
      if (entity.authors) {
        const authors = Array.isArray(entity.authors) ? entity.authors : [entity.authors];
        setWorkData((prev: any) => ({ ...prev, "bf:contribution": [...(prev["bf:contribution"] || []), ...authors.map((a: string) => ({ "@type": "bf:Contribution", "bf:agent": { "@type": "bf:Person", "rdfs:label": a }, "bf:role": { "@id": "http://id.loc.gov/vocabulary/relators/aut", "rdfs:label": "Author" } }))] }));
      }
      toast.success("Book imported!", { description: entity.title || entity.label });
      return;
    }
    if (entity.type === "subject") {
      setWorkData((prev: any) => ({ ...prev, "bf:subject": [...(prev["bf:subject"] || []), { "@type": "bf:Topic", "rdfs:label": entity.subject || entity.label }] }));
      toast.success("Subject added!");
      return;
    }
    const contribution = { "@type": "bf:Contribution", "bf:agent": { "@id": entity.identifiers?.loc ? `http://id.loc.gov/authorities/names/${entity.identifiers.loc}` : entity.id, "@type": "bf:Person", "rdfs:label": entity.label }, "bf:role": { "@id": "http://id.loc.gov/vocabulary/relators/aut", "rdfs:label": "Author" } };
    setWorkData((prev: any) => ({ ...prev, "bf:contribution": [...(prev["bf:contribution"] || []), contribution] }));
    toast.success(`${entity.label} added!`);
  };

  // ============================== EXAMPLES & IMPORT ==============================

  const handleLoadExample = (exampleData: any) => {
    setWorkData({ ...exampleData.work, "@id": uriSet.work });
    setInstanceData({ ...exampleData.instance, "@id": uriSet.instance, "bf:instanceOf": { "@id": uriSet.work } });
    setShowExampleMenu(false);
    setSaveStatus("unsaved");
    toast.success("Loaded Real LOC Example", { description: "Complete bibliographic record with proper authority URIs.", duration: 4000 });
  };
  const handleImport = (importedWorkData: any, importedInstanceData: any) => {
    setWorkData({ ...importedWorkData, "@id": uriSet.work });
    setInstanceData({ ...importedInstanceData, "@id": uriSet.instance, "bf:instanceOf": { "@id": uriSet.work } });
    setSaveStatus("unsaved");
    toast.success("Record imported!");
  };

  // ============================== SAVE ==============================

  const handleSave = async () => {
    try {
      setSaveStatus("saving");
      let title = recordTitle;
      if (title === "Untitled Record") {
        const t = workData["bf:title"];
        if (t) title = typeof t === "string" ? t : (t["bf:mainTitle"] || t["rdfs:label"] || title);
      }
      const record: BIBFRAMERecord = {
        "@context": { bf: "http://id.loc.gov/ontologies/bibframe/", bflc: "http://id.loc.gov/ontologies/bflc/", rdfs: "http://www.w3.org/2000/01/rdf-schema#", rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#", xsd: "http://www.w3.org/2001/XMLSchema#", madsrdf: "http://www.loc.gov/mads/rdf/v1#" },
        work: workData,
        instance: instanceData,
        metadata: {
          catalogingLanguage: language, descriptionConventions: "rda",
          catalogingInterface: "Blue Moon",
          resourceType: `Blue Moon (${template.name})`,
          templateId: selectedTemplate, recordId, uriSet,
          ontologyVersion: ONTOLOGY_VERSION.version,
          createdAt: new Date().toISOString(),
          catalogerId: username || "anonymous",
          hiddenFields: Array.from(hiddenFields),
        },
      };
      await saveRecord(record, username || "Anonymous");
      setSaveStatus("saved");
      toast.success("Record saved!", { description: title });
      if (onRecordSaved) onRecordSaved();
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("error");
      toast.error("Save failed", { description: error instanceof Error ? error.message : "Unknown error" });
    }
  };

  // ============================== DOWNLOAD ==============================

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };
  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied to clipboard!"); };

  // ============================== COMPUTED VALUES ==============================

  const graph = buildBibframeGraph(workData, instanceData);
  const graphStats = graphStore.getStats();
  const authorityNodes = (workData["bf:contribution"] || []).filter((c: any) => c["bf:agent"]).map((c: any, i: number) => ({
    id: c["bf:agent"]["@id"] || `agent-${i}`, label: c["bf:agent"]["rdfs:label"] || "Unknown",
    source: c["bf:agent"]["@id"]?.includes("loc.gov") ? ("LOC" as const) : ("AfIqa" as const),
    uri: c["bf:agent"]["@id"] || "", type: "person" as const, connections: [],
  }));

  const completionScore = useMemo(() => {
    let filled = 0, total = 0;
    (template.entities.work || []).forEach((s: any) => s.fields.forEach((f: any) => {
      total++;
      const prop = f.property.replace("bf:", "");
      if (workData[f.property] || workData[`bf:${prop}`] || workData[prop]) filled++;
    }));
    (template.entities.instance || []).forEach((s: any) => s.fields.forEach((f: any) => {
      total++;
      const prop = f.property.replace("bf:", "");
      if (instanceData[f.property] || instanceData[`bf:${prop}`] || instanceData[prop]) filled++;
    }));
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  }, [workData, instanceData, template]);

  const tripleCount = graphTriples.length;
  const connectivity = useMemo(() => graphJsonld ? validateGraphConnectivity(graphJsonld) : { connected: false, orphans: [] }, [graphJsonld]);

  function toggleEntity(entity: string) {
    const newSet = new Set(expandedEntities);
    if (newSet.has(entity)) newSet.delete(entity); else newSet.add(entity);
    setExpandedEntities(newSet);
  }

  // ============================== RENDER ==============================

  return (
    <BMThemeContext.Provider value={BM}>
    <div className={`h-screen flex flex-col overflow-hidden ${gradientClass}`} dir={language === "ar" ? "rtl" : "ltr"}>
      <Toaster position={language === "ar" ? "top-left" : "top-right"} />

      {/* ===== HERO NAVBAR ===== */}
      <div style={{
        background: BM.navBg,
        borderBottom: `1px solid ${BM.navBorder}`,
        backdropFilter: "blur(30px) saturate(180%)",
        WebkitBackdropFilter: "blur(30px) saturate(180%)",
        boxShadow: glassTheme === "legacy"
          ? "0 8px 32px rgba(31,38,135,0.15), inset 0 1px 0 rgba(255,255,255,0.6)"
          : "0 1px 3px rgba(0,0,0,0.02)",
      }}>
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: glassTheme === "legacy" ? "rgba(255,255,255,0.6)" : "rgba(59,130,246,0.12)", border: `1px solid ${glassTheme === "legacy" ? "rgba(255,255,255,0.5)" : BM.accentBorder}`, color: BM.accentDim, backdropFilter: "blur(10px)" }}>
                  <ChevronLeft className={`h-4 w-4 ${language === "ar" ? "rotate-180" : ""}`} /> {t("back")}
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #60a5fa)", boxShadow: "0 4px 14px rgba(59,130,246,0.25)" }}>
                    <Moon className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
                    style={{ background: BM.success, borderColor: isLegacy ? "rgba(255,255,255,0.8)" : "#0f172a" }} />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <span style={{ color: BM.text }}>BLUE</span>
                    <span style={{ background: "linear-gradient(135deg, #3b82f6, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MOON</span>
                  </h1>
                  <p className="text-[10px] font-mono" style={{ color: BM.textDim }}>
                    Ontology v{ONTOLOGY_VERSION.version} | {template.name} | {recordId}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Language Toggle */}
              <button onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                style={{
                  background: isLegacy ? "rgba(255,255,255,0.6)" : "rgba(59,130,246,0.12)",
                  border: `1px solid ${isLegacy ? "rgba(255,255,255,0.5)" : BM.accentBorder}`,
                  color: BM.accent,
                  backdropFilter: isLegacy ? "blur(10px)" : undefined,
                }}>
                <Globe className="h-3 w-3" />
                {language === "en" ? "عربي" : "EN"}
              </button>

              {/* Field Manager / Template Toggle */}
              <button onClick={() => setShowFieldManager(!showFieldManager)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                style={{
                  background: hiddenFields.size > 0 ? "rgba(251,191,36,0.12)" : (isLegacy ? "rgba(255,255,255,0.6)" : "rgba(59,130,246,0.08)"),
                  border: `1px solid ${hiddenFields.size > 0 ? "rgba(251,191,36,0.25)" : (isLegacy ? "rgba(255,255,255,0.5)" : BM.accentBorder)}`,
                  color: hiddenFields.size > 0 ? BM.warning : BM.textDim,
                }}>
                <Settings className="h-3 w-3" />
                {hiddenFields.size > 0 ? `${hiddenFields.size} ${t("fieldsHidden")}` : t("customTemplates")}
                {savedFieldTemplates.length > 0 && hiddenFields.size === 0 && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: BM.accent }} />
                )}
              </button>

              {/* Glass Theme Toggle */}
              <div className="flex items-center rounded-xl overflow-hidden" style={{
                border: `1px solid ${isLegacy ? "rgba(255,255,255,0.5)" : BM.accentBorder}`,
                background: isLegacy ? "rgba(255,255,255,0.4)" : "transparent",
                backdropFilter: isLegacy ? "blur(10px)" : undefined,
              }}>
                <button onClick={() => setGlassTheme("dark")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold transition-all"
                  style={{
                    background: glassTheme === "dark" ? "rgba(59,130,246,0.2)" : "transparent",
                    color: glassTheme === "dark" ? BM.accent : BM.textDim,
                  }}>
                  <Moon className="h-3 w-3" /> {t("darkGlass")}
                </button>
                <div className="w-px h-5" style={{ background: isLegacy ? "rgba(0,0,0,0.15)" : BM.accentBorder }} />
                <button onClick={() => setGlassTheme("legacy")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold transition-all"
                  style={{
                    background: glassTheme === "legacy" ? "rgba(59,130,246,0.2)" : "transparent",
                    color: glassTheme === "legacy" ? BM.accent : BM.textDim,
                  }}>
                  <Star className="h-3 w-3" /> {t("legacyGlass")}
                </button>
              </div>

              {/* Institutional Score */}
              {institutionalValidation && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                  style={{
                    background: institutionalValidation.score >= 85 ? "rgba(52,199,89,0.1)" : institutionalValidation.score >= 50 ? "rgba(255,149,0,0.1)" : "rgba(255,59,48,0.1)",
                    border: `1px solid ${institutionalValidation.score >= 85 ? "rgba(52,199,89,0.3)" : institutionalValidation.score >= 50 ? "rgba(255,149,0,0.3)" : "rgba(255,59,48,0.3)"}`,
                    color: institutionalValidation.score >= 85 ? BM.success : institutionalValidation.score >= 50 ? BM.warning : BM.danger,
                  }}>
                  <Shield className="h-3 w-3" />
                  {getValidationBadge(institutionalValidation)} ({institutionalValidation.score}/100)
                </div>
              )}
              <BMSaveStatus status={saveStatus} />
              <input type="text" value={recordTitle}
                onChange={(e) => { setRecordTitle(e.target.value); setSaveStatus("unsaved"); }}
                className="px-3 py-1.5 rounded-lg text-sm focus:outline-none transition-all"
                style={{ background: BM.inputBg, border: `1px solid ${BM.inputBorder}`, color: BM.text, width: "180px" }}
                placeholder={t("recordTitle")} />
            </div>
          </div>

          {/* Stats + Templates */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {getAllTemplates().map(tmpl => (
              <button key={tmpl.id} onClick={() => setSelectedTemplate(tmpl.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                style={{
                  background: selectedTemplate === tmpl.id ? glassElBgActive : glassElBg,
                  border: selectedTemplate === tmpl.id ? `1px solid ${BM.accentBorder}` : glassElBorder,
                  color: selectedTemplate === tmpl.id ? BM.accent : BM.textDim,
                  backdropFilter: isLegacy ? "blur(10px)" : undefined,
                }}>
                {TEMPLATE_ICONS[tmpl.id]} {tmpl.name}
              </button>
            ))}

            <div className="w-px h-5" style={{ background: "rgba(59,130,246,0.2)" }} />

            {/* Live Stats */}
            {[
              { icon: <Database className="h-3 w-3" />, label: `${graphStats.nodeCount} ${t("nodes")}`, color: BM.accent },
              { icon: <Network className="h-3 w-3" />, label: `${tripleCount} ${t("triples")}`, color: BM.secondary },
              { icon: <Activity className="h-3 w-3" />, label: `${completionScore}%`, color: BM.success },
              { icon: connectivity.connected ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />, label: connectivity.connected ? t("connectedLabel") : `${connectivity.orphans.length} ${t("orphans")}`, color: connectivity.connected ? BM.success : BM.warning },
            ].map((stat, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: stat.color }}>
                {stat.icon} {stat.label}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {[
              { onClick: handleSave, icon: <Save className="h-3.5 w-3.5" />, label: t("save"), primary: true },
              { onClick: () => setShowExampleMenu(!showExampleMenu), icon: <Database className="h-3.5 w-3.5" />, label: t("examples") },
              { onClick: () => setShowAuthoritySearch(true), icon: <Search className="h-3.5 w-3.5" />, label: t("authoritySearch") },
              { onClick: () => setShowImportDialog(true), icon: <Upload className="h-3.5 w-3.5" />, label: t("import") },
              { onClick: () => downloadFile(JSON.stringify(w3cJsonLd || graphJsonld || graph, null, 2), `${recordId}-w3c.jsonld`, "application/ld+json"), icon: <Download className="h-3.5 w-3.5" />, label: t("w3cJsonLd") },
            ].map((btn, i) => (
              <button key={i} onClick={btn.onClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all"
                style={{
                  background: glassTheme === "legacy"
                    ? (btn.primary ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.6)")
                    : (btn.primary ? "rgba(59,130,246,0.15)" : "rgba(30,41,59,0.5)"),
                  border: `1px solid ${glassTheme === "legacy" ? "rgba(255,255,255,0.5)" : (btn.primary ? BM.accentBorder : "rgba(59,130,246,0.08)")}`,
                  color: btn.primary ? BM.accent : BM.textMuted,
                  backdropFilter: glassTheme === "legacy" ? "blur(10px)" : undefined,
                }}>
                {btn.icon} {btn.label}
              </button>
            ))}
            {w3cTurtle && (
              <button onClick={() => downloadFile(w3cTurtle, `${recordId}.ttl`, "text/turtle")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all"
                style={{ background: glassElBg, border: glassElBorder, color: BM.textMuted, backdropFilter: isLegacy ? "blur(10px)" : undefined }}>
                <Download className="h-3.5 w-3.5" /> {t("turtle")}
              </button>
            )}
            {w3cNTriples && (
              <button onClick={() => downloadFile(w3cNTriples, `${recordId}.nt`, "application/n-triples")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all"
                style={{ background: glassElBg, border: glassElBorder, color: BM.textMuted, backdropFilter: isLegacy ? "blur(10px)" : undefined }}>
                <Download className="h-3.5 w-3.5" /> {t("nTriples")}
              </button>
            )}
          </div>

          {/* Examples dropdown */}
          {showExampleMenu && (
            <div className="absolute mt-2 w-80 rounded-xl z-50 max-h-80 overflow-y-auto p-2 shadow-2xl"
              style={{ background: isLegacy ? "rgba(255,255,255,0.95)" : "rgba(15,23,42,0.95)", border: `1px solid ${BM.cardBorder}`, backdropFilter: "blur(24px)" }}>
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: BM.textDim, borderBottom: `1px solid ${BM.cardBorder}` }}>
                {t("realLocExamples")}
              </div>
              {realLocExamples.map((example) => (
                <button key={example.id} className="w-full text-left px-3 py-2.5 rounded-lg transition-all"
                  style={{ color: BM.text }}
                  onMouseOver={(e) => (e.currentTarget.style.background = BM.cardHover)}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => handleLoadExample(example.data)}>
                  <div className="font-semibold text-sm">{example.name}</div>
                  <div className="text-[10px]" style={{ color: BM.textDim }}>{example.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== OUTPUT TABS ===== */}
      <div style={{
        background: BM.navBg,
        borderBottom: `1px solid ${BM.navBorder}`,
        backdropFilter: "blur(30px) saturate(180%)",
        WebkitBackdropFilter: "blur(30px) saturate(180%)",
      }}>
        <div className="px-6 py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {([
              { key: "editor" as OutputTab, icon: <Layers className="h-3.5 w-3.5" />, label: t("bibframeEditor"), color: BM.accent },
              { key: "w3c-jsonld" as OutputTab, icon: <Shield className="h-3.5 w-3.5" />, label: `${t("w3cJsonLd")} ${w3cValidation?.valid ? "\u2713" : ""}`, color: BM.success },
              { key: "jsonld" as OutputTab, icon: <Braces className="h-3.5 w-3.5" />, label: t("rawJsonLd"), color: "#0891b2" },
              { key: "turtle" as OutputTab, icon: <Code className="h-3.5 w-3.5" />, label: t("turtle"), color: BM.secondary },
              { key: "ntriples" as OutputTab, icon: <FileText className="h-3.5 w-3.5" />, label: t("nTriples"), color: "#fb923c" },
              { key: "marc" as OutputTab, icon: <Database className="h-3.5 w-3.5" />, label: t("marc"), color: BM.danger },
              { key: "triples" as OutputTab, icon: <Hash className="h-3.5 w-3.5" />, label: `${t("triples")} (${tripleCount})`, color: "#f59e0b" },
              { key: "opac" as OutputTab, icon: <Eye className="h-3.5 w-3.5" />, label: "OPAC", color: BM.secondary },
              { key: "mindmap" as OutputTab, icon: <Sparkles className="h-3.5 w-3.5" />, label: t("mindMap"), color: "#fb923c" },
              { key: "validation" as OutputTab, icon: <Shield className="h-3.5 w-3.5" />, label: t("validation"), color: BM.success },
              { key: "relationships" as OutputTab, icon: <Network className="h-3.5 w-3.5" />, label: t("relationships"), color: BM.accent },
              { key: "authority-graph" as OutputTab, icon: <Globe className="h-3.5 w-3.5" />, label: t("authorityGraph"), color: BM.secondary },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-[11px] font-bold transition-all"
                style={{
                  background: activeTab === tab.key ? `${tab.color}18` : "transparent",
                  border: `1px solid ${activeTab === tab.key ? `${tab.color}35` : "transparent"}`,
                  color: activeTab === tab.key ? tab.color : BM.textDim,
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 overflow-auto p-6 relative"
        style={{
          background: isLegacy
            ? "linear-gradient(135deg, rgba(0, 0, 0, 0.15) 0%, rgba(10, 10, 20, 0.25) 100%)"
            : "linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 20, 30, 0.5) 100%)",
          backdropFilter: isLegacy ? "blur(20px) saturate(120%)" : "blur(40px) saturate(150%)",
          WebkitBackdropFilter: isLegacy ? "blur(20px) saturate(120%)" : "blur(40px) saturate(150%)",
          boxShadow: isLegacy
            ? undefined
            : "inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.5), 0 20px 60px rgba(0, 0, 0, 0.6)",
        }}>
        {/* Background decorative elements — cyberpunk glow */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-20 -left-32 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)" }} />
          <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(30,64,175,0.06), transparent 70%)" }} />
          <div className="absolute -bottom-32 left-1/3 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(96,165,250,0.07), transparent 70%)" }} />
        </div>

        {/* ===== BIBFRAME EDITOR ===== */}
        {activeTab === "editor" && (
          <div className="space-y-4">
            {/* Template Info */}
            <BMCard>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #60a5fa)", boxShadow: "0 4px 16px rgba(59,130,246,0.15)" }}>
                    {TEMPLATE_ICONS[selectedTemplate] || <BookOpen className="h-5 w-5 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-black" style={{ color: BM.text }}>{template.name} {t("templateLabel")}</h2>
                    <p className="text-xs" style={{ color: BM.textDim }}>{template.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: BM.textMuted }}>
                    <input type="checkbox" checked={enableExpression} onChange={toggleExpression}
                      className="w-4 h-4 rounded accent-sky-500" />
                    {t("expressionLayer")}
                  </label>
                  <span className="text-[10px] font-mono px-2 py-1 rounded-md" style={{ background: BM.accentGlow, color: BM.accent }}>
                    {uriSet.work.split("/").pop()}
                  </span>
                </div>
              </div>
              {graphValidation && (
                <div className="mt-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2 font-semibold"
                  style={{
                    background: graphValidation.valid ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}>
                  {graphValidation.valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  {graphValidation.valid
                    ? `${t("graphValid")} — ${graphStats.nodeCount} ${t("nodes")}, ${tripleCount} ${t("triples")}`
                    : `${graphValidation.errors.length} ${t("errors")}, ${graphValidation.warnings.length} ${t("warnings")}`}
                </div>
              )}
            </BMCard>

            {/* ===== WORK + INSTANCE SIDE BY SIDE ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* WORK */}
              <BMEntitySection title={t("work")} subtitle={t("intellectualContent")} color={BM.accent}
                icon={<BookOpen className="h-5 w-5" style={{ color: BM.accent }} />}
                uri={uriSet.work} expanded={expandedEntities.has("Work")} onToggle={() => toggleEntity("Work")}
                requiredCount={workRequiredProps.length} groupCount={templateWorkGroups.length}>
                <OntologyDrivenFormRenderer entityType="Work" nodeUri={uriSet.work} graphStore={graphStore} onChange={handlePropertyChange}
                  hiddenFields={hiddenFields} onHideField={hideField} />
                <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${BM.cardBorder}` }}>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: BM.textDim }}>
                    <FileText className="h-3.5 w-3.5" /> {t("ontologyDrivenFields")}
                  </h4>
                  <div className="space-y-3">
                    {workProperties.filter(p => !hiddenFields.has(`ontology:${p.uri}`)).map(property => (
                      <BMFieldWrapper key={property.uri} fieldKey={`ontology:${property.uri}`} onHide={hideField}>
                        <OntologyField property={property} value={workData[property.uri.split("/").pop() || ""]}
                          onChange={(value) => updateWorkProperty(property.uri, value)} language={language} />
                      </BMFieldWrapper>
                    ))}
                  </div>
                </div>
                {workData["bf:contribution"]?.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(59,130,246,0.06)", border: `1px solid ${BM.accentBorder}` }}>
                    <h4 className="text-xs font-bold mb-2 flex items-center gap-2" style={{ color: BM.accent }}>
                      <User className="h-3.5 w-3.5" /> {t("contributors")} ({workData["bf:contribution"].length})
                    </h4>
                    <div className="space-y-1.5">
                      {workData["bf:contribution"].map((c: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg text-sm" style={{ background: isLegacy ? "rgba(255,255,255,0.5)" : "rgba(30,41,59,0.6)", border: isLegacy ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(59,130,246,0.12)", backdropFilter: isLegacy ? "blur(8px)" : undefined }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black"
                            style={{ background: "rgba(59,130,246,0.15)", color: BM.accent }}>
                            {(c["bf:agent"]?.["rdfs:label"] || "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold" style={{ color: BM.text }}>{c["bf:agent"]?.["rdfs:label"] || "Unknown"}</span>
                          <span className="text-xs" style={{ color: BM.textDim }}>{c["bf:role"]?.["rdfs:label"] || "Contributor"}</span>
                          {c["bf:agent"]?.["@id"] && <span className="text-[10px] font-mono truncate ml-auto" style={{ color: BM.textDim }}>{c["bf:agent"]["@id"]}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </BMEntitySection>

              {/* INSTANCE */}
              <BMEntitySection title={t("instance")} subtitle={t("physicalManifestation")} color={BM.accentDim}
                icon={<Package className="h-5 w-5" style={{ color: BM.accentDim }} />}
                uri={uriSet.instance} expanded={expandedEntities.has("Instance")} onToggle={() => toggleEntity("Instance")}
                requiredCount={instanceRequiredProps.length} groupCount={templateInstanceGroups.length}>
                <OntologyDrivenFormRenderer entityType="Instance" nodeUri={uriSet.instance} graphStore={graphStore} onChange={handlePropertyChange}
                  hiddenFields={hiddenFields} onHideField={hideField} />
                <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${BM.cardBorder}` }}>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: BM.textDim }}>
                    <FileText className="h-3.5 w-3.5" /> {t("ontologyDrivenFields")}
                  </h4>
                  <div className="space-y-3">
                    {instanceProperties.filter(p => !hiddenFields.has(`ontology:${p.uri}`)).map(property => (
                      <BMFieldWrapper key={property.uri} fieldKey={`ontology:${property.uri}`} onHide={hideField}>
                        <OntologyField property={property} value={instanceData[property.uri.split("/").pop() || ""]}
                          onChange={(value) => updateInstanceProperty(property.uri, value)} language={language} />
                      </BMFieldWrapper>
                    ))}
                  </div>
                </div>
              </BMEntitySection>
            </div>

            {/* EXPRESSION (optional) — full width below */}
            {enableExpression && (
              <BMEntitySection title={t("expression")} subtitle={t("realizationOfWork")} color={BM.secondary}
                icon={<Sparkles className="h-5 w-5" style={{ color: BM.secondary }} />}
                uri={uriSet.expression} expanded={expandedEntities.has("Expression")} onToggle={() => toggleEntity("Expression")}>
                <OntologyDrivenFormRenderer entityType="Expression" nodeUri={uriSet.expression} graphStore={graphStore} onChange={handlePropertyChange}
                  hiddenFields={hiddenFields} onHideField={hideField} />
              </BMEntitySection>
            )}

            {/* ITEM */}
            <BMEntitySection title={t("item")} subtitle={t("specificCopy")} color="#f59e0b"
              icon={<Archive className="h-5 w-5" style={{ color: "#f59e0b" }} />}
              uri={uriSet.item} expanded={expandedEntities.has("Item")} onToggle={() => toggleEntity("Item")}
              groupCount={templateItemGroups.length}>
              <OntologyDrivenFormRenderer entityType="Item" nodeUri={uriSet.item} graphStore={graphStore} onChange={handlePropertyChange}
                hiddenFields={hiddenFields} onHideField={hideField} />
            </BMEntitySection>

            {/* ADMIN METADATA */}
            <BMEntitySection title={t("adminMetadata")} subtitle={t("recordProvenance")} color={BM.textDim}
              icon={<Settings className="h-5 w-5" style={{ color: BM.textDim }} />}
              uri={uriSet.admin} expanded={expandedEntities.has("Admin")} onToggle={() => toggleEntity("Admin")}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t("recordId"), value: recordId, mono: true },
                  { label: t("created"), value: new Date().toISOString().split("T")[0] },
                  { label: t("cataloger"), value: username || "anonymous" },
                  { label: t("templateLabel"), value: template.name },
                  { label: t("conventions"), value: "RDA" },
                  { label: t("ontology"), value: `BIBFRAME ${ONTOLOGY_VERSION.version}` },
                  { label: t("source"), value: "Moon Library System — Blue Moon" },
                  { label: t("language"), value: language === "en" ? "English" : "العربية" },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: isLegacy ? "rgba(255,255,255,0.5)" : "rgba(30,41,59,0.5)", border: isLegacy ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(59,130,246,0.1)", backdropFilter: isLegacy ? "blur(8px)" : undefined }}>
                    <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: BM.textDim }}>{row.label}</span>
                    <span className={`text-xs ${row.mono ? "font-mono" : "font-semibold"}`} style={{ color: BM.text }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </BMEntitySection>
          </div>
        )}

        {/* ===== W3C JSON-LD ===== */}
        {activeTab === "w3c-jsonld" && (
          <div className="space-y-4">
            {w3cValidation && <BMValidationBanner validation={w3cValidation} />}
            <BMCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black flex items-center gap-2" style={{ color: BM.text }}>
                  <Shield className="h-5 w-5" style={{ color: BM.success }} /> W3C-Compliant JSON-LD
                </h3>
                <div className="flex gap-2">
                  <BMSmallBtn onClick={() => copyToClipboard(JSON.stringify(w3cJsonLd, null, 2))} icon={<Copy className="h-3.5 w-3.5" />} label="Copy" />
                  <BMSmallBtn onClick={() => downloadFile(JSON.stringify(w3cJsonLd, null, 2), `${recordId}-w3c.jsonld`, "application/ld+json")} icon={<Download className="h-3.5 w-3.5" />} label="Download" />
                </div>
              </div>
              <pre className="p-5 rounded-xl overflow-auto text-sm max-h-[calc(100vh-420px)] font-mono leading-relaxed"
                style={{ background: "#1e1e2e", border: "1px solid rgba(120,130,180,0.12)", color: "#a3e635" }}>
                {w3cJsonLd ? JSON.stringify(w3cJsonLd, null, 2) : "Fill in the form to generate W3C-compliant JSON-LD..."}
              </pre>
            </BMCard>
          </div>
        )}

        {/* ===== RAW JSON-LD ===== */}
        {activeTab === "jsonld" && (
          <BMCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black flex items-center gap-2" style={{ color: BM.text }}>
                <Braces className="h-5 w-5" style={{ color: "#0891b2" }} /> Raw JSON-LD (GraphStore)
              </h3>
              <div className="flex gap-2">
                <BMSmallBtn onClick={() => copyToClipboard(JSON.stringify(graphJsonld || graph, null, 2))} icon={<Copy className="h-3.5 w-3.5" />} label="Copy" />
                <BMSmallBtn onClick={() => downloadFile(JSON.stringify(graphJsonld || graph, null, 2), `${recordId}.jsonld`, "application/ld+json")} icon={<Download className="h-3.5 w-3.5" />} label="Download" />
              </div>
            </div>
            <div className="mb-3 p-3 rounded-lg text-xs flex items-center gap-2" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", color: BM.warning }}>
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Raw GraphStore output. For W3C-compliant JSON-LD, use the <strong className="ml-1">W3C JSON-LD</strong> tab.
            </div>
            <pre className="p-5 rounded-xl overflow-auto text-sm max-h-[calc(100vh-400px)] font-mono leading-relaxed"
              style={{ background: "#1e1e2e", border: "1px solid rgba(120,130,180,0.12)", color: "#67e8f9" }}>
              {JSON.stringify(graphJsonld || graph, null, 2)}
            </pre>
          </BMCard>
        )}

        {/* ===== TURTLE ===== */}
        {activeTab === "turtle" && (
          <BMCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black flex items-center gap-2" style={{ color: BM.text }}>
                <Code className="h-5 w-5" style={{ color: BM.secondary }} /> Turtle RDF (W3C-Compliant)
              </h3>
              <div className="flex gap-2">
                {w3cTurtle && <BMSmallBtn onClick={() => copyToClipboard(w3cTurtle)} icon={<Copy className="h-3.5 w-3.5" />} label="Copy" />}
                {w3cTurtle && <BMSmallBtn onClick={() => downloadFile(w3cTurtle, `${recordId}.ttl`, "text/turtle")} icon={<Download className="h-3.5 w-3.5" />} label=".ttl" />}
              </div>
            </div>
            <pre className="p-5 rounded-xl overflow-auto text-sm max-h-[calc(100vh-350px)] font-mono leading-relaxed"
              style={{ background: "#1e1e2e", border: "1px solid rgba(120,130,180,0.12)", color: "#c4b5fd" }}>
              {w3cTurtle || "Fill in the form to generate Turtle RDF..."}
            </pre>
          </BMCard>
        )}

        {/* ===== N-TRIPLES ===== */}
        {activeTab === "ntriples" && (
          <BMCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black flex items-center gap-2" style={{ color: BM.text }}>
                <FileText className="h-5 w-5" style={{ color: "#fb923c" }} /> N-Triples (Triple Store Ready)
              </h3>
              <div className="flex gap-2">
                {w3cNTriples && <BMSmallBtn onClick={() => copyToClipboard(w3cNTriples)} icon={<Copy className="h-3.5 w-3.5" />} label="Copy" />}
                {w3cNTriples && <BMSmallBtn onClick={() => downloadFile(w3cNTriples, `${recordId}.nt`, "application/n-triples")} icon={<Download className="h-3.5 w-3.5" />} label=".nt" />}
              </div>
            </div>
            <div className="mb-3 p-3 rounded-lg text-xs flex items-center gap-2" style={{ background: "rgba(0,122,255,0.05)", border: `1px solid rgba(0,122,255,0.12)`, color: BM.accent }}>
              <Info className="h-3.5 w-3.5 shrink-0" /> Directly loadable into Apache Jena/Fuseki, Blazegraph, GraphDB, Virtuoso, or any SPARQL endpoint.
            </div>
            <pre className="p-5 rounded-xl overflow-auto text-xs max-h-[calc(100vh-400px)] font-mono leading-relaxed"
              style={{ background: "#1e1e2e", border: "1px solid rgba(120,130,180,0.12)", color: "#fdba74" }}>
              {w3cNTriples || "Fill in the form to generate N-Triples..."}
            </pre>
            {w3cNTriples && <div className="mt-2 text-xs font-mono" style={{ color: BM.textDim }}>{w3cNTriples.split("\n").filter(Boolean).length} triples</div>}
          </BMCard>
        )}

        {/* ===== MARC ===== */}
        {activeTab === "marc" && <MarcView data={{ work: workData, instance: instanceData, admin: {} }} />}

        {/* ===== TRIPLES ===== */}
        {activeTab === "triples" && (
          <BMCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black flex items-center gap-2" style={{ color: BM.text }}>
                <Hash className="h-5 w-5" style={{ color: "#f59e0b" }} /> RDF Triples ({tripleCount})
              </h3>
              <BMSmallBtn onClick={() => copyToClipboard(graphTriples.map(t => `<${t.subject}> <${t.predicate}> ${typeof t.object === 'string' ? `<${t.object}>` : `"${t.object.value}"`} .`).join("\n"))} icon={<Copy className="h-3.5 w-3.5" />} label="N-Triples" />
            </div>
            <div className="overflow-auto max-h-[calc(100vh-350px)] rounded-xl" style={{ border: `1px solid ${BM.cardBorder}` }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BM.cardBorder}` }}>
                    <th className="text-left p-2.5 w-8" style={{ color: BM.textDim }}>#</th>
                    <th className="text-left p-2.5" style={{ color: BM.textDim }}>Subject</th>
                    <th className="text-left p-2.5" style={{ color: BM.textDim }}>Predicate</th>
                    <th className="text-left p-2.5" style={{ color: BM.textDim }}>Object</th>
                    <th className="text-left p-2.5 w-16" style={{ color: BM.textDim }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {graphTriples.map((triple, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid rgba(120,130,180,0.06)" }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "rgba(0,122,255,0.03)")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td className="p-2.5" style={{ color: BM.textDim }}>{idx + 1}</td>
                      <td className="p-2.5 font-mono truncate max-w-[200px]" style={{ color: BM.accent }}>{shortenUri(triple.subject)}</td>
                      <td className="p-2.5 font-mono truncate max-w-[200px]" style={{ color: BM.secondary }}>{shortenUri(triple.predicate)}</td>
                      <td className="p-2.5 font-mono truncate max-w-[250px]">
                        {typeof triple.object === 'string'
                          ? <span style={{ color: BM.accent }}>{shortenUri(triple.object)}</span>
                          : triple.object.type === 'uri'
                            ? <span style={{ color: BM.accent }}>{shortenUri(triple.object.value)}</span>
                            : <span style={{ color: BM.success }}>"{triple.object.value}"</span>}
                      </td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black"
                          style={{
                            background: (typeof triple.object === 'object' && triple.object.type === 'literal') ? "rgba(5,150,105,0.08)" : "rgba(79,70,229,0.08)",
                            color: (typeof triple.object === 'object' && triple.object.type === 'literal') ? BM.success : BM.accent,
                          }}>
                          {typeof triple.object === 'string' ? 'URI' : triple.object.type?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {graphTriples.length === 0 && <div className="text-center py-12" style={{ color: BM.textDim }}>Fill in the form to extract triples...</div>}
            </div>
          </BMCard>
        )}

        {/* ===== OPAC ===== */}
        {activeTab === "opac" && (
          <BMCard>
            <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: BM.text }}>
              <Eye className="h-5 w-5" style={{ color: BM.secondary }} /> OPAC Preview
            </h3>
            <OPACPreview workData={workData} instanceData={instanceData} />
          </BMCard>
        )}

        {/* ===== MIND MAP ===== */}
        {activeTab === "mindmap" && (
          <BMCard>
            <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: BM.text }}>
              <Sparkles className="h-5 w-5" style={{ color: "#fb923c" }} /> Knowledge Graph
            </h3>
            <MindMapPreview workData={workData} instanceData={instanceData} />
          </BMCard>
        )}

        {/* ===== VALIDATION ===== */}
        {activeTab === "validation" && (
          <div className="space-y-4">
            {institutionalValidation && (
              <BMCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black flex items-center gap-2" style={{ color: BM.text }}>
                    <Shield className="h-5 w-5" style={{ color: BM.accent }} /> Institutional Validation (LOC/PCC)
                  </h3>
                  <div className="px-4 py-2 rounded-xl text-sm font-black" style={{
                    background: institutionalValidation.score >= 85 ? "rgba(52,211,153,0.1)" : institutionalValidation.score >= 50 ? "rgba(251,191,36,0.1)" : "rgba(248,113,113,0.1)",
                    color: institutionalValidation.score >= 85 ? BM.success : institutionalValidation.score >= 50 ? BM.warning : BM.danger,
                  }}>
                    {getValidationBadge(institutionalValidation)} — {institutionalValidation.score}/100
                  </div>
                </div>
                <p className="text-sm mb-4" style={{ color: BM.textMuted }}>{institutionalValidation.summary}</p>
                {institutionalValidation.errors.length > 0 && (
                  <div className="mb-4 space-y-1">
                    <h4 className="text-xs font-bold mb-1.5" style={{ color: BM.danger }}>Errors ({institutionalValidation.errors.length})</h4>
                    {institutionalValidation.errors.map((e, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg text-xs" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.1)" }}>
                        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" style={{ color: BM.danger }} />
                        <div>
                          <span className="font-bold" style={{ color: BM.danger }}>{e.entity}{e.property ? ` / ${e.property}` : ""}</span>
                          <span className="ml-2" style={{ color: BM.textMuted }}>{e.message}</span>
                          {e.fix && <p className="mt-0.5" style={{ color: BM.accent }}>Fix: {e.fix}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {institutionalValidation.warnings.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold mb-1.5" style={{ color: BM.warning }}>Warnings ({institutionalValidation.warnings.length})</h4>
                    {institutionalValidation.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg text-xs" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.1)" }}>
                        <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" style={{ color: BM.warning }} />
                        <div>
                          <span className="font-bold" style={{ color: BM.warning }}>{w.entity}{w.property ? ` / ${w.property}` : ""}</span>
                          <span className="ml-2" style={{ color: BM.textMuted }}>{w.message}</span>
                          {w.fix && <p className="mt-0.5" style={{ color: BM.accent }}>Fix: {w.fix}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </BMCard>
            )}
            {graphValidation && (
              <BMCard>
                <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: BM.text }}>
                  <CheckCircle2 className="h-5 w-5" style={{ color: BM.success }} /> SHACL Graph Validation
                </h3>
                <ValidationPanel validation={graphValidation} />
              </BMCard>
            )}
            {bfValidation && (
              <BMCard>
                <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: BM.text }}>
                  <Database className="h-5 w-5" style={{ color: BM.accent }} /> BIBFRAME Semantic Validation
                </h3>
                <div className="p-4 rounded-xl mb-4" style={{
                  background: bfValidation.valid ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)",
                  border: `1px solid ${bfValidation.valid ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)"}`,
                }}>
                  <div className="flex items-center gap-2 font-bold" style={{ color: bfValidation.valid ? BM.success : BM.danger }}>
                    {bfValidation.valid ? <><CheckCircle2 className="h-5 w-5" /> Valid BIBFRAME Record</> : <><AlertCircle className="h-5 w-5" /> {bfValidation.errors.length} Error(s)</>}
                  </div>
                </div>
                {bfValidation.errors.length > 0 && <div className="space-y-1">{bfValidation.errors.map((err, i) => (
                  <div key={i} className="text-xs p-2 rounded-lg flex items-start gap-2" style={{ background: "rgba(248,113,113,0.05)" }}>
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" style={{ color: BM.danger }} />
                    <span style={{ color: BM.textMuted }}>[{err.code}] {err.entity}: {err.message}</span>
                  </div>
                ))}</div>}
                {bfValidation.warnings.length > 0 && <div className="mt-3 space-y-1">{bfValidation.warnings.map((w, i) => (
                  <div key={i} className="text-xs p-2 rounded-lg flex items-start gap-2" style={{ background: "rgba(251,191,36,0.05)" }}>
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" style={{ color: BM.warning }} />
                    <span style={{ color: BM.textMuted }}>[{w.code}] {w.entity}: {w.message}</span>
                  </div>
                ))}</div>}
              </BMCard>
            )}
            <BMCard>
              <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: BM.text }}>
                <Network className="h-5 w-5" style={{ color: BM.secondary }} /> Graph Connectivity
              </h3>
              <div className="p-4 rounded-xl" style={{
                background: connectivity.connected ? "rgba(52,211,153,0.06)" : "rgba(251,191,36,0.06)",
                border: `1px solid ${connectivity.connected ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)"}`,
              }}>
                {connectivity.connected
                  ? <span className="font-bold flex items-center gap-2" style={{ color: BM.success }}><CheckCircle2 className="h-5 w-5" /> All nodes connected</span>
                  : <div>
                      <span className="font-bold flex items-center gap-2" style={{ color: BM.warning }}><AlertTriangle className="h-5 w-5" /> {connectivity.orphans.length} orphan node(s)</span>
                      <ul className="mt-2 space-y-1">{connectivity.orphans.map((o, i) => <li key={i} className="text-xs font-mono" style={{ color: BM.textDim }}>{o}</li>)}</ul>
                    </div>}
              </div>
            </BMCard>
          </div>
        )}

        {/* ===== RELATIONSHIPS ===== */}
        {activeTab === "relationships" && (
          <BMCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black flex items-center gap-2" style={{ color: BM.text }}>
                <Network className="h-5 w-5" style={{ color: BM.accent }} /> Semantic Relationships
              </h3>
              <div className="flex gap-2">
                <BMSmallBtn onClick={() => addRelationship("Work")} icon={<Plus className="h-3.5 w-3.5" />} label="Work Rel" />
                <BMSmallBtn onClick={() => addRelationship("Instance")} icon={<Plus className="h-3.5 w-3.5" />} label="Instance Rel" />
              </div>
            </div>
            {relationships.length === 0 && <div className="text-center py-12" style={{ color: BM.textDim }}>No relationships. Add Work-to-Work or Instance-to-Instance links.</div>}
            <div className="space-y-3">
              {relationships.map(rel => (
                <div key={rel.id} className="p-4 rounded-xl" style={{ background: glassElBg, border: `1px solid ${BM.cardBorder}`, backdropFilter: isLegacy ? "blur(10px)" : undefined }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2.5">
                      <div className="flex gap-3">
                        <select value={rel.type} onChange={(e) => updateRelationship(rel.id, "type", e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg text-sm" style={{ background: BM.inputBg, border: `1px solid ${BM.inputBorder}`, color: BM.text }}>
                          {Object.entries(RELATIONSHIP_DEFINITIONS).map(([type, def]) => (
                            <option key={type} value={type}>{(def as any).label} ({(def as any).domain})</option>
                          ))}
                        </select>
                        <input type="text" value={rel.targetUri} onChange={(e) => updateRelationship(rel.id, "targetUri", e.target.value)}
                          placeholder="Target URI" className="flex-1 px-3 py-2 rounded-lg text-sm"
                          style={{ background: BM.inputBg, border: `1px solid ${BM.inputBorder}`, color: BM.text }} />
                      </div>
                      <input type="text" value={rel.label || ""} onChange={(e) => updateRelationship(rel.id, "label", e.target.value)}
                        placeholder="Label (optional)" className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ background: BM.inputBg, border: `1px solid ${BM.inputBorder}`, color: BM.text }} />
                    </div>
                    <button onClick={() => removeRelationship(rel.id)} className="p-2 rounded-lg"
                      style={{ background: "rgba(248,113,113,0.1)", color: BM.danger }}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </BMCard>
        )}

        {/* ===== AUTHORITY GRAPH ===== */}
        {activeTab === "authority-graph" && (
          <BMCard>
            <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: BM.text }}>
              <Globe className="h-5 w-5" style={{ color: BM.secondary }} /> Authority Graph
            </h3>
            <AuthorityGraph nodes={authorityNodes} />
          </BMCard>
        )}
      </div>

      {/* ===== FIELD MANAGER PANEL ===== */}
      <AnimatePresence>
        {showFieldManager && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 z-50 w-[420px] max-h-[70vh] rounded-2xl overflow-hidden"
            style={{
              background: isLegacy ? "rgba(255,255,255,0.97)" : "rgba(15,23,42,0.97)",
              border: `1px solid ${BM.cardBorder}`,
              backdropFilter: "blur(30px) saturate(180%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              insetInlineEnd: "1.5rem",
            }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${BM.cardBorder}` }}>
              <h3 className="text-sm font-black flex items-center gap-2" style={{ color: BM.text }}>
                <Settings className="h-4 w-4" style={{ color: BM.accent }} />
                {t("fieldCustomization")}
              </h3>
              <button onClick={() => setShowFieldManager(false)} className="p-1 rounded-lg transition-all hover:opacity-70">
                <X className="h-4 w-4" style={{ color: BM.textDim }} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(70vh-52px)]">
              {/* Summary bar */}
              <div className="px-5 py-3 flex items-center gap-3 flex-wrap" style={{ borderBottom: `1px solid ${BM.cardBorder}` }}>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(52,199,89,0.1)", color: BM.success }}>
                  {allFieldKeys.length - hiddenFields.size} {t("fieldsKept")}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(255,59,48,0.1)", color: BM.danger }}>
                  {hiddenFields.size} {t("fieldsRemoved")}
                </span>
                <div className="flex-1" />
                <button onClick={() => setShowSaveTemplateDialog(true)}
                  className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: "rgba(59,130,246,0.15)", color: BM.accent, border: `1px solid ${BM.accentBorder}` }}>
                  <Save className="h-3 w-3" /> {t("saveTemplate")}
                </button>
                {hiddenFields.size > 0 && (
                  <button onClick={restoreAllFields}
                    className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: "rgba(52,199,89,0.1)", color: BM.success, border: "1px solid rgba(52,199,89,0.25)" }}>
                    <RefreshCw className="h-3 w-3" /> {t("restoreAll")}
                  </button>
                )}
              </div>

              {/* Saved templates */}
              {savedFieldTemplates.length > 0 && (
                <div className="px-5 py-3" style={{ borderBottom: `1px solid ${BM.cardBorder}` }}>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: BM.textDim }}>
                    <Layers className="h-3 w-3" /> {t("savedTemplates")} ({savedFieldTemplates.length})
                  </h4>
                  <div className="space-y-1.5">
                    {savedFieldTemplates.map(tmpl => (
                      <div key={tmpl.id} className="flex items-center gap-2 p-2.5 rounded-lg"
                        style={{ background: isLegacy ? "rgba(255,255,255,0.5)" : "rgba(30,41,59,0.5)", border: `1px solid ${BM.cardBorder}` }}>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate" style={{ color: BM.text }}>{tmpl.name}</div>
                          <div className="text-[10px] flex items-center gap-2" style={{ color: BM.textDim }}>
                            <span>{t("basedOn")}: {tmpl.baseTemplate}</span>
                            <span>•</span>
                            <span style={{ color: BM.success }}>{tmpl.allFields.length - tmpl.hiddenFields.length} {t("fieldsKept")}</span>
                            <span>•</span>
                            <span style={{ color: BM.danger }}>{tmpl.hiddenFields.length} {t("fieldsRemoved")}</span>
                          </div>
                        </div>
                        <button onClick={() => handleLoadFieldTemplate(tmpl)}
                          className="text-[10px] font-bold px-2 py-1 rounded-md shrink-0 transition-all"
                          style={{ background: "rgba(59,130,246,0.15)", color: BM.accent, border: `1px solid ${BM.accentBorder}` }}>
                          {t("applyTemplate")}
                        </button>
                        <button onClick={() => handleDeleteFieldTemplate(tmpl.id)}
                          className="p-1 rounded-md shrink-0 transition-all hover:opacity-70"
                          style={{ color: BM.danger }}>
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden fields list */}
              {hiddenFields.size > 0 ? (
                <div className="px-5 py-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: BM.textDim }}>
                    <Eye className="h-3 w-3" /> {t("removedFields")} ({hiddenFields.size})
                  </h4>
                  <div className="space-y-1">
                    {Array.from(hiddenFields).map(fieldKey => (
                      <div key={fieldKey} className="flex items-center justify-between p-2 rounded-lg text-xs"
                        style={{ background: isLegacy ? "rgba(255,255,255,0.4)" : "rgba(30,41,59,0.4)", border: `1px solid ${BM.cardBorder}` }}>
                        <span className="font-mono truncate flex-1" style={{ color: BM.textDim }}>
                          {fieldKey.replace("ontology:", "").replace("registry:", "").split("/").pop()}
                        </span>
                        <button onClick={() => restoreField(fieldKey)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all shrink-0"
                          style={{ background: "rgba(52,199,89,0.1)", color: BM.success }}>
                          <RefreshCw className="h-2.5 w-2.5" /> {t("restoreField")}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-5 py-6 text-center">
                  <p className="text-xs" style={{ color: BM.textDim }}>{t("noHiddenFields")}</p>
                  <p className="text-[10px] mt-1" style={{ color: BM.textDim }}>
                    {language === "ar" ? "مرر الماوس فوق أي حقل واضغط ✕ لإخفائه" : "Hover over any field and click ✕ to hide it"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== SAVE TEMPLATE DIALOG ===== */}
      <AnimatePresence>
        {showSaveTemplateDialog && (
          <BMSaveTemplateDialog
            allFieldKeys={allFieldKeys}
            hiddenFields={hiddenFields}
            baseTemplateName={template.name}
            onSave={handleSaveFieldTemplate}
            onClose={() => setShowSaveTemplateDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* ===== DIALOGS ===== */}
      <AuthoritySearchDialog isOpen={showAuthoritySearch} onClose={() => setShowAuthoritySearch(false)} onSelect={handleAuthoritySelect} initialQuery="" />
      <ImportRecordDialog isOpen={showImportDialog} onClose={() => setShowImportDialog(false)} onImport={handleImport} />
      <RecordViewerDialog open={showRecordViewer} onOpenChange={setShowRecordViewer} jsonldData={graphJsonld || { "@graph": [] }} title={recordTitle} />
    </div>
    </BMThemeContext.Provider>
  );
}

// ============================== BLUE MOON SUB-COMPONENTS ==============================

type BMTheme = typeof BM_DARK;
const BMThemeContext = React.createContext<BMTheme>(BM_DARK);
function useBMTheme() { return React.useContext(BMThemeContext); }

function BMCard({ children }: { children: React.ReactNode }) {
  const t = useBMTheme();
  const isLegacy = t === BM_LEGACY;
  return (
    <div className="rounded-2xl p-6" style={{
      background: t.cardBg,
      border: `1px solid ${t.cardBorder}`,
      backdropFilter: "blur(30px) saturate(180%)",
      boxShadow: isLegacy
        ? "0 8px 32px rgba(31,38,135,0.15), inset 0 1px 0 rgba(255,255,255,0.6)"
        : "0 2px 8px rgba(0,0,0,0.2), 0 8px 24px rgba(59,130,246,0.06), inset 0 1px 0 rgba(255,255,255,0.03)",
    }}>
      {children}
    </div>
  );
}

function BMEntitySection({ title, subtitle, color, icon, uri, expanded, onToggle, children, requiredCount, groupCount }: {
  title: string; subtitle?: string; color: string; icon: React.ReactNode; uri: string;
  expanded: boolean; onToggle: () => void; children: React.ReactNode;
  requiredCount?: number; groupCount?: number;
}) {
  const t = useBMTheme();
  const isLegacy = t === BM_LEGACY;
  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: t.cardBg,
      border: `1px solid ${t.cardBorder}`,
      borderLeft: `3px solid ${color}`,
      backdropFilter: "blur(30px) saturate(180%)",
      boxShadow: isLegacy
        ? "0 8px 32px rgba(31,38,135,0.15), inset 0 1px 0 rgba(255,255,255,0.6)"
        : "0 2px 8px rgba(0,0,0,0.2), 0 8px 24px rgba(59,130,246,0.06), inset 0 1px 0 rgba(255,255,255,0.03)",
    }}>
      <button onClick={onToggle} className="w-full px-6 py-4 flex items-center justify-between transition-all"
        style={{ background: "transparent" }}
        onMouseOver={(e) => (e.currentTarget.style.background = t.cardHover)}
        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")} type="button">
        <div className="flex items-center gap-3">
          {icon}
          <div className="text-start">
            <h2 className="text-lg font-black" style={{ color: t.text }}>{title}</h2>
            <div className="flex items-center gap-3">
              {subtitle && <p className="text-[10px]" style={{ color: t.textDim }}>{subtitle}</p>}
              <p className="text-[10px] font-mono" style={{ color: t.textDim }}>{uri.split("/").pop()}</p>
              {requiredCount !== undefined && <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: "rgba(99,102,241,0.06)", color: t.textDim }}>{requiredCount} req.</span>}
              {groupCount !== undefined && <span className="text-[10px]" style={{ color: t.textDim }}>{groupCount} groups</span>}
            </div>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 transition-transform ${expanded ? "" : "-rotate-90"}`} style={{ color: t.textDim }} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <div className="px-6 pb-6 bg-[#ffffff00]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== FIELD WRAPPER WITH DELETE BUTTON =====
function BMFieldWrapper({ children, fieldKey, onHide }: { children: React.ReactNode; fieldKey: string; onHide: (key: string) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {children}
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onHide(fieldKey); }}
          className="absolute -top-1 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-lg"
          style={{
            background: "rgba(255,59,48,0.9)",
            border: "2px solid rgba(255,255,255,0.8)",
            insetInlineEnd: "-4px",
          }}
          title="Hide field"
          type="button"
        >
          <X className="h-3 w-3 text-white" />
        </button>
      )}
    </div>
  );
}

function BMSaveStatus({ status }: { status: SaveStatus }) {
  const t = useBMTheme();
  const { t: tr } = useTranslation();
  const meta = {
    saved: { bg: "rgba(52,199,89,0.1)", border: "rgba(52,199,89,0.25)", color: t.success, icon: <CheckCircle2 className="h-3 w-3" />, label: tr("saved") },
    unsaved: { bg: "rgba(255,149,0,0.1)", border: "rgba(255,149,0,0.25)", color: t.warning, icon: <Clock className="h-3 w-3" />, label: tr("unsaved") },
    saving: { bg: "rgba(0,122,255,0.1)", border: "rgba(0,122,255,0.25)", color: t.accent, icon: <Loader2 className="h-3 w-3 animate-spin" />, label: tr("savingDots") },
    error: { bg: "rgba(255,59,48,0.1)", border: "rgba(255,59,48,0.25)", color: t.danger, icon: <AlertCircle className="h-3 w-3" />, label: tr("error") },
  }[status];
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold"
      style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}>
      {meta.icon} {meta.label}
    </div>
  );
}

function BMSmallBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  const t = useBMTheme();
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:shadow-md"
      style={{ background: "rgba(59,130,246,0.12)", border: `1px solid ${t.accentBorder}`, color: t.accentDim }}>
      {icon} {label}
    </button>
  );
}

function BMValidationBanner({ validation }: { validation: JsonLdValidationResult }) {
  const t = useBMTheme();
  const isLegacy = t === BM_LEGACY;
  return (
    <div className="rounded-2xl p-5" style={{
      background: validation.valid ? "rgba(52,199,89,0.04)" : "rgba(255,59,48,0.04)",
      border: `1px solid ${validation.valid ? "rgba(52,199,89,0.12)" : "rgba(255,59,48,0.12)"}`,
      borderLeft: `3px solid ${validation.valid ? t.success : t.danger}`,
      backdropFilter: "blur(30px) saturate(180%)",
      boxShadow: isLegacy
        ? "0 8px 32px rgba(31,38,135,0.15), inset 0 1px 0 rgba(255,255,255,0.6)"
        : "0 2px 8px rgba(0,0,0,0.2), 0 8px 24px rgba(59,130,246,0.06), inset 0 1px 0 rgba(255,255,255,0.03)",
    }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 font-black" style={{ color: validation.valid ? t.success : t.danger }}>
          {validation.valid ? <><CheckCircle2 className="h-6 w-6" /> W3C-Compliant JSON-LD</> : <><AlertCircle className="h-6 w-6" /> {validation.errors.length} Compliance Error(s)</>}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: t.textDim }}>
          <span>{validation.stats.nodeCount} nodes</span>
          <span>~{validation.stats.tripleEstimate} triples</span>
          <span>{validation.stats.prefixesUsed.length} prefixes</span>
          <span style={{ color: validation.stats.contextComplete ? t.success : t.danger }}>
            Context: {validation.stats.contextComplete ? "Complete" : "Incomplete"}
          </span>
        </div>
      </div>
      <div className="text-[10px] mb-2" style={{ color: t.textDim }}>
        Passes: <span style={{ color: t.accent }}>json-ld.org/playground</span> | <span style={{ color: t.accent }}>W3C RDF Validator</span> | <span style={{ color: t.accent }}>Apache Jena/Fuseki</span> | <span style={{ color: t.accent }}>Blazegraph</span> | <span style={{ color: t.accent }}>GraphDB</span>
      </div>
      {validation.errors.length > 0 && <div className="mt-2 space-y-1">{validation.errors.map((e, i) => (
        <div key={i} className="text-xs p-2 rounded-lg flex items-start gap-1.5" style={{ background: "rgba(255,59,48,0.05)" }}>
          <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" style={{ color: t.danger }} /> <span style={{ color: t.danger }}>{e}</span>
        </div>
      ))}</div>}
      {validation.warnings.length > 0 && <div className="mt-2 space-y-1">{validation.warnings.map((w, i) => (
        <div key={i} className="text-xs p-2 rounded-lg flex items-start gap-1.5" style={{ background: "rgba(255,149,0,0.05)" }}>
          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" style={{ color: t.warning }} /> <span style={{ color: t.warning }}>{w}</span>
        </div>
      ))}</div>}
      {validation.info.length > 0 && <div className="mt-2 space-y-1">{validation.info.map((inf, i) => (
        <div key={i} className="text-xs p-2 rounded-lg flex items-start gap-1.5" style={{ background: "rgba(0,122,255,0.05)" }}>
          <Info className="h-3 w-3 mt-0.5 shrink-0" style={{ color: t.accent }} /> <span style={{ color: t.accent }}>{inf}</span>
        </div>
      ))}</div>}
      <div className="mt-3 flex gap-2">
        <a href={`https://json-ld.org/playground/#startTab=tab-expanded&json-ld=${encodeURIComponent(JSON.stringify(validation))}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
          style={{ background: "rgba(59,130,246,0.12)", border: `1px solid ${t.accentBorder}`, color: t.accentDim }}>
          <ExternalLink className="h-3 w-3" /> JSON-LD Playground
        </a>
        <a href="https://www.w3.org/RDF/Validator/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
          style={{ background: "rgba(59,130,246,0.12)", border: `1px solid ${t.accentBorder}`, color: t.accentDim }}>
          <ExternalLink className="h-3 w-3" /> W3C RDF Validator
        </a>
      </div>
    </div>
  );
}

// ===== SAVE TEMPLATE DIALOG =====
function BMSaveTemplateDialog({ allFieldKeys, hiddenFields, baseTemplateName, onSave, onClose }: {
  allFieldKeys: string[];
  hiddenFields: Set<string>;
  baseTemplateName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const th = useBMTheme();
  const { t } = useTranslation();
  const isLeg = th === BM_LEGACY;
  const [name, setName] = useState("");
  const [showKept, setShowKept] = useState(false);
  const [showRemoved, setShowRemoved] = useState(false);

  const keptFields = allFieldKeys.filter(k => !hiddenFields.has(k));
  const removedFields = allFieldKeys.filter(k => hiddenFields.has(k));

  const formatFieldName = (key: string) => key.replace("ontology:", "").replace("registry:", "").split("/").pop() || key;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-[520px] max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: isLeg ? "rgba(255,255,255,0.98)" : "rgba(15,23,42,0.98)",
          border: `1px solid ${th.cardBorder}`,
          backdropFilter: "blur(30px) saturate(180%)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${th.cardBorder}` }}>
          <div>
            <h2 className="text-lg font-black flex items-center gap-2" style={{ color: th.text }}>
              <Save className="h-5 w-5" style={{ color: th.accent }} />
              {t("saveTemplate")}
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: th.textDim }}>
              {t("basedOn")}: <strong>{baseTemplateName}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70 transition-all">
            <X className="h-5 w-5" style={{ color: th.textDim }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Template name input */}
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: th.textDim }}>{t("templateName")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("templateNamePlaceholder")}
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none transition-all"
              style={{
                background: th.inputBg, border: `2px solid ${name ? th.accentBorder : th.inputBorder}`,
                color: th.text, caretColor: th.accent,
              }}
              autoFocus
            />
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl text-center"
              style={{ background: "rgba(52,199,89,0.08)", border: "1px solid rgba(52,199,89,0.2)" }}>
              <div className="text-2xl font-black" style={{ color: th.success }}>{keptFields.length}</div>
              <div className="text-[11px] font-bold mt-0.5" style={{ color: th.success }}>{t("keptFields")}</div>
            </div>
            <div className="p-4 rounded-xl text-center"
              style={{ background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.2)" }}>
              <div className="text-2xl font-black" style={{ color: th.danger }}>{removedFields.length}</div>
              <div className="text-[11px] font-bold mt-0.5" style={{ color: th.danger }}>{t("removedFields")}</div>
            </div>
          </div>

          {/* Kept fields accordion */}
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${th.cardBorder}` }}>
            <button onClick={() => setShowKept(!showKept)} className="w-full px-4 py-2.5 flex items-center justify-between transition-all"
              style={{ background: isLeg ? "rgba(255,255,255,0.5)" : "rgba(30,41,59,0.5)" }} type="button">
              <span className="text-xs font-bold flex items-center gap-2" style={{ color: th.success }}>
                <CheckCircle2 className="h-3.5 w-3.5" /> {t("keptFields")} ({keptFields.length})
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showKept ? "" : "-rotate-90"}`} style={{ color: th.textDim }} />
            </button>
            {showKept && (
              <div className="px-4 py-2 max-h-40 overflow-y-auto space-y-0.5">
                {keptFields.map(k => (
                  <div key={k} className="text-[11px] font-mono py-0.5 flex items-center gap-1.5" style={{ color: th.textMuted }}>
                    <CheckCircle2 className="h-2.5 w-2.5 shrink-0" style={{ color: th.success }} />
                    {formatFieldName(k)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Removed fields accordion */}
          {removedFields.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${th.cardBorder}` }}>
              <button onClick={() => setShowRemoved(!showRemoved)} className="w-full px-4 py-2.5 flex items-center justify-between transition-all"
                style={{ background: isLeg ? "rgba(255,255,255,0.5)" : "rgba(30,41,59,0.5)" }} type="button">
                <span className="text-xs font-bold flex items-center gap-2" style={{ color: th.danger }}>
                  <X className="h-3.5 w-3.5" /> {t("removedFields")} ({removedFields.length})
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showRemoved ? "" : "-rotate-90"}`} style={{ color: th.textDim }} />
              </button>
              {showRemoved && (
                <div className="px-4 py-2 max-h-40 overflow-y-auto space-y-0.5">
                  {removedFields.map(k => (
                    <div key={k} className="text-[11px] font-mono py-0.5 flex items-center gap-1.5" style={{ color: th.textMuted }}>
                      <X className="h-2.5 w-2.5 shrink-0" style={{ color: th.danger }} />
                      {formatFieldName(k)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: `1px solid ${th.cardBorder}` }}>
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ color: th.textDim }}>
            {t("cancel")}
          </button>
          <button onClick={() => name.trim() && onSave(name.trim())}
            disabled={!name.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2"
            style={{
              background: name.trim() ? "linear-gradient(135deg, #3b82f6, #60a5fa)" : (isLeg ? "rgba(0,0,0,0.05)" : "rgba(59,130,246,0.08)"),
              color: name.trim() ? "#ffffff" : th.textDim,
              boxShadow: name.trim() ? "0 4px 16px rgba(59,130,246,0.3)" : "none",
              opacity: name.trim() ? 1 : 0.5,
            }}>
            <Save className="h-4 w-4" /> {t("saveTemplate")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function shortenUri(uri: string): string {
  if (!uri) return "";
  return uri
    .replace("http://id.loc.gov/ontologies/bibframe/", "bf:")
    .replace("http://id.loc.gov/vocabulary/relators/", "rel:")
    .replace("http://id.loc.gov/vocabulary/languages/", "lang:")
    .replace("http://id.loc.gov/vocabulary/carriers/", "carrier:")
    .replace("http://id.loc.gov/vocabulary/mediaTypes/", "media:")
    .replace("http://id.loc.gov/vocabulary/countries/", "country:")
    .replace("http://id.loc.gov/authorities/names/", "naf:")
    .replace("http://id.loc.gov/authorities/subjects/", "lcsh:")
    .replace("http://id.loc.gov/authorities/genreForms/", "lcgft:")
    .replace("http://www.w3.org/2000/01/rdf-schema#", "rdfs:")
    .replace("http://www.w3.org/1999/02/22-rdf-syntax-ns#", "rdf:")
    .replace("http://www.w3.org/2001/XMLSchema#", "xsd:")
    .replace("https://moonlib.org/resource/", "moon:")
    .replace("https://moonlib.org/", "moon:");
}

export { BlueMoon };
