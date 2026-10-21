/**
 * Moon Engine Glass - iOS Visual Blur Edition
 *
 * Features:
 * - Multi-authority search contributing to bf:contribution
 * - Glassmorphism/iOS blur design
 * - Real LOC examples with actual URIs
 * - Preview and Mind Map in separate tabs
 * - LOC-NAMES and LOD integration
 */

import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Save,
  Download,
  Upload,
  ChevronLeft,
  Search,
  User,
  Building,
  MapPin,
  Tag,
  Globe,
  BookOpen,
  Package,
  Eye,
  Network,
  Database,
  FileText,
  Code,
  Braces,
  Sparkles,
  Book,
  ExternalLink,
} from "lucide-react";
import { OntologyField } from "./ontology/OntologyField";
import { getPropertiesForDomain } from "../services/bibframeOntologyEngine";
import {
  buildBibframeGraph,
  quadsToTurtle,
  generateUri,
} from "../services/graphBuilder";
import { generateMARCFromBibframe } from "../services/marcGenerator";
import { OPACPreview } from "./ontology/OPACPreview";
import WolfMoonStandaloneOpac from "./WolfMoonStandaloneOpac";
import { MindMapPreview } from "./ontology/MindMapPreview";
import { ImportRecordDialog } from "./ontology/ImportRecordDialog";
import {
  realLocExamples,
  getRandomRealExample,
} from "../utils/realLocExamples";
import { AuthoritySearchDialog } from "./AuthoritySearchDialog";
import { AuthorityGraph } from "./AuthorityGraph";
import { MarcView } from "./RecordView/MarcView";
import { RdfView } from "./RecordView/RdfView";
import type { UnifiedPerson } from "../services/authorityHub/types";
import { Toaster } from "./ui/sonner";
import moonLogo from "figma:asset/448923f9298ec547f27dd322785433298cd5ac34.png";
import "../../styles/glassmorphism.css";
import { saveRecord } from "../utils/recordStorageBackend";
import { BIBFRAMERecord } from "../types/bibframe";
import { useAuth } from "../contexts/AuthContext";

interface MoonEngineGlassProps {
  onBack?: () => void;
  initialWork?: any;
  initialInstance?: any;
  onRecordSaved?: () => void;
}

type AuthorityTab =
  | "names"
  | "personal"
  | "corporate"
  | "conference"
  | "geographic"
  | "all"
  | "wikidata"
  | "books"
  | "publishers"
  | "subjects";
type PreviewTab =
  | "form"
  | "graph"
  | "marc"
  | "rdf"
  | "json"
  | "opac"
  | "mindmap";

// Helper function to safely extract label from RDF data
const getLabelString = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value["rdfs:label"])
    return getLabelString(value["rdfs:label"]);
  if (typeof value === "object" && value["@value"])
    return value["@value"];
  return String(value);
};

export function MoonEngineGlass({
  onBack,
  initialWork,
  initialInstance,
  onRecordSaved,
}: MoonEngineGlassProps) {
  const { t, i18n } = useTranslation();
  const { username } = useAuth();
  const [language, setLanguage] = useState<"en" | "ar">(
    i18n.language as "en" | "ar",
  );

  // Work and Instance data - use initial values if provided
  const [workData, setWorkData] = useState<any>(
    initialWork || {
      "@type": "bf:Work",
      "@id": generateUri("work"),
      "bf:contribution": [],
    }
  );

  const [instanceData, setInstanceData] = useState<any>(
    initialInstance || {
      "@type": "bf:Instance",
      "@id": generateUri("instance"),
    }
  );

  // Update state when props change
  React.useEffect(() => {
    if (initialWork) {
      setWorkData(initialWork);
    }
  }, [initialWork]);

  React.useEffect(() => {
    if (initialInstance) {
      setInstanceData(initialInstance);
    }
  }, [initialInstance]);

  // Authority search
  const [showAuthoritySearch, setShowAuthoritySearch] =
    useState(false);
  const [currentAuthorityTab, setCurrentAuthorityTab] =
    useState<AuthorityTab>("names");

  // Preview tab
  const [previewTab, setPreviewTab] =
    useState<PreviewTab>("form");

  // Dialogs
  const [showImportDialog, setShowImportDialog] =
    useState(false);
  const [showExampleMenu, setShowExampleMenu] = useState(false);
  const [showOpacViewer, setShowOpacViewer] = useState(false);

  // Get properties for each domain
  const workProperties = getPropertiesForDomain("bf:Work");
  const instanceProperties =
    getPropertiesForDomain("bf:Instance");

  /**
   * Update a Work property
   */
  const updateWorkProperty = useCallback(
    (uri: string, value: any) => {
      const propertyName = uri.split("/").pop() || uri;
      setWorkData((prev: any) => ({
        ...prev,
        [propertyName]: value,
      }));
    },
    [],
  );

  /**
   * Update an Instance property
   */
  const updateInstanceProperty = useCallback(
    (uri: string, value: any) => {
      const propertyName = uri.split("/").pop() || uri;
      setInstanceData((prev: any) => ({
        ...prev,
        [propertyName]: value,
      }));
    },
    [],
  );

  /**
   * Build RDF Graph
   */
  const graph = buildBibframeGraph(workData, instanceData);

  /**
   * Handle authority selection - Add to bf:contribution or handle other types
   */
  const handleAuthoritySelect = (entity: any) => {
    // Check if it's a Book (Work/Instance)
    if (entity.type === 'book') {
      // If it's a book, we might want to import its data
      // Populate Work and Instance data from the book
      // We need a helper to convert ISBNdb book to BIBFRAME
      // For now, let's just show a toast that we received it
      
      // Ideally, we should use the convertISBNdbToBIBFRAME function from isbndbApi.ts
      // But we can't easily import it here without adding more imports.
      // Let's just set the title and ISBN for now as a basic integration.
      
      const newInstance = {
        ...instanceData,
        "bf:title": {
           "@type": "bf:Title",
           "bf:mainTitle": entity.title_long || entity.title || entity.label
        },
        "bf:identifiedBy": [
           { "@type": "bf:Isbn", "rdf:value": entity.isbn13 || entity.isbn || entity.id }
        ]
      };
      
      setInstanceData(newInstance);
      
      if (entity.authors) {
         // Add authors to work
         const authors = Array.isArray(entity.authors) ? entity.authors : [entity.authors];
         const contributions = authors.map((author: string) => ({
            "@type": "bf:Contribution",
            "bf:agent": {
               "@type": "bf:Person",
               "rdfs:label": author
            },
            "bf:role": {
               "@id": "http://id.loc.gov/vocabulary/relators/aut",
               "rdfs:label": "Author"
            }
         }));
         
         setWorkData((prev: any) => ({
            ...prev,
            "bf:contribution": [
               ...(prev["bf:contribution"] || []),
               ...contributions
            ]
         }));
      }

      toast.success("Book Data Imported!", {
        description: `Imported metadata for "${entity.title || entity.label}"`,
      });
      return;
    }

    // Check if it's a Publisher
    if (entity.type === 'publisher') {
       // Add to bf:provisionActivity
       const publication = {
          "@type": "bf:Publication",
          "bf:agent": {
             "@type": "bf:Agent",
             "rdfs:label": entity.name || entity.label
          },
          "bf:date": new Date().getFullYear().toString() // Default to current year or leave empty
       };
       
       setInstanceData((prev: any) => ({
          ...prev,
          "bf:provisionActivity": publication
       }));

       toast.success("Publisher Added!", {
        description: `Set publisher to ${entity.name || entity.label}`,
      });
      return;
    }

    // Check if it's a Subject
    if (entity.type === 'subject') {
       // Add to bf:subject
       const subject = {
          "@type": "bf:Topic",
          "rdfs:label": entity.subject || entity.label
       };
       
       setWorkData((prev: any) => ({
          ...prev,
          "bf:subject": [
             ...(prev["bf:subject"] || []),
             subject
          ]
       }));

       toast.success("Subject Added!", {
        description: `Added subject "${entity.subject || entity.label}"`,
      });
      return;
    }

    // Default: It's a Person/Authority
    const person = entity as UnifiedPerson;
    
    // Create contribution object
    const contribution = {
      "@type": "bf:Contribution",
      "bf:agent": {
        "@id": person.identifiers.loc
          ? `http://id.loc.gov/authorities/names/${person.identifiers.loc}`
          : person.identifiers.wikidata
            ? `https://www.wikidata.org/entity/${person.identifiers.wikidata}`
            : person.id,
        "@type": "bf:Person",
        "rdfs:label": person.label,
      },
      "bf:role": {
        "@id": "http://id.loc.gov/vocabulary/relators/aut",
        "rdfs:label": "Author",
      },
    };

    // Add to contributions array
    setWorkData((prev: any) => ({
      ...prev,
      "bf:contribution": [
        ...(prev["bf:contribution"] || []),
        contribution,
      ],
    }));

    toast.success("Contributor added!", {
      description: `${person.label} added to bf:contribution with LOC URI.`,
    });
  };

  /**
   * Open authority search
   */
  const openAuthoritySearch = (tab: AuthorityTab) => {
    setCurrentAuthorityTab(tab);
    setShowAuthoritySearch(true);
  };

  /**
   * Load a real LOC example
   */
  const handleLoadExample = (exampleData: any) => {
    setWorkData({
      ...exampleData.work,
      "@id": exampleData.work["@id"] || generateUri("work"),
    });
    setInstanceData({
      ...exampleData.instance,
      "@id":
        exampleData.instance["@id"] || generateUri("instance"),
    });
    setShowExampleMenu(false);
    toast.success(`✨ Loaded Real LOC Example`, {
      description:
        "Complete bibliographic record with proper authority URIs.",
      duration: 4000,
    });
  };

  /**
   * Handle import
   */
  const handleImport = (
    importedWorkData: any,
    importedInstanceData: any,
  ) => {
    setWorkData({
      ...importedWorkData,
      "@id": importedWorkData["@id"] || generateUri("work"),
    });
    setInstanceData({
      ...importedInstanceData,
      "@id":
        importedInstanceData["@id"] || generateUri("instance"),
    });
    toast.success("Record imported successfully!");
  };

  /**
   * Save record to backend
   */
  const handleSave = async () => {
    try {
      // Extract title for display
      let title = 'Untitled Record';
      const instanceTitle = instanceData['bf:title'];
      if (instanceTitle) {
        if (typeof instanceTitle === 'string') {
          title = instanceTitle;
        } else if (instanceTitle['bf:mainTitle']) {
          title = instanceTitle['bf:mainTitle'];
        } else if (instanceTitle['rdfs:label']) {
          title = instanceTitle['rdfs:label'];
        }
      }
      
      if (title === 'Untitled Record') {
        const workTitle = workData['bf:title'];
        if (workTitle) {
          if (typeof workTitle === 'string') {
            title = workTitle;
          } else if (workTitle['bf:mainTitle']) {
            title = workTitle['bf:mainTitle'];
          } else if (workTitle['rdfs:label']) {
            title = workTitle['rdfs:label'];
          }
        }
      }

      // Build BIBFRAME Record in the format expected by backend
      const record: BIBFRAMERecord = {
        "@context": {
          bf: "http://id.loc.gov/ontologies/bibframe/",
          rdfs: "http://www.w3.org/2000/01/rdf-schema#",
          rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        },
        work: workData,
        instance: instanceData,
        metadata: {
          catalogingLanguage: language,
          descriptionConventions: "rda",
          resourceType: "Moon Engine designed and developed by isaac faleh",
        },
      };

      // Save to backend using the recordStorageBackend utility
      const savedRecord = await saveRecord(record, username || "Anonymous");

      toast.success("Record saved to database permanently!", {
        description: title,
      });

      // Notify parent component if callback provided
      if (onRecordSaved) {
        onRecordSaved();
      }

      console.log("Record saved successfully:", savedRecord);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save record", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Extract authority nodes for graph
  const authorityNodes = (workData["bf:contribution"] || [])
    .filter((contrib: any) => contrib["bf:agent"])
    .map((contrib: any, index: number) => ({
      id: contrib["bf:agent"]["@id"] || `agent-${index}`,
      label: contrib["bf:agent"]["rdfs:label"] || "Unknown",
      source: contrib["bf:agent"]["@id"]?.includes("loc.gov")
        ? ("LOC" as const)
        : ("AfIqa" as const),
      uri: contrib["bf:agent"]["@id"] || "",
      type: "person" as const,
      connections: [],
    }));

  return (
    <div className="h-screen flex flex-col animated-gradient-bg">
      <Toaster position="top-right" />

      {/* Glass Navbar */}
      <div className="glass-navbar">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="glass-button px-4 py-2 flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              <img
                src={moonLogo}
                alt="Moon Logo"
                className="h-16 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg text-[#000000]">
                  Moon Engine
                </h1>
                <p className="text-sm text-white/80 text-[#000000cc]">
                  designed and developed by isaac faleh
                </p>
              </div>
            </div>
          </div>

          {/* Authority Search Tabs - Glass Style */}
          <div className="glass-tab-bar flex items-center gap-2 overflow-x-auto pb-2">
            <AuthorityTabButton
              active={currentAuthorityTab === "names"}
              onClick={() => openAuthoritySearch("names")}
              icon={<User className="h-4 w-4" />}
              label="NAF Auth Names"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === "personal"}
              onClick={() => openAuthoritySearch("personal")}
              label="NAF Personal Names"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === "corporate"}
              onClick={() => openAuthoritySearch("corporate")}
              icon={<Building className="h-4 w-4" />}
              label="NAF Corporate Name"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === "conference"}
              onClick={() => openAuthoritySearch("conference")}
              label="NAF Conference Name"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === "geographic"}
              onClick={() => openAuthoritySearch("geographic")}
              icon={<MapPin className="h-4 w-4" />}
              label="NAF Geographic"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === "all"}
              onClick={() => openAuthoritySearch("all")}
              icon={<Tag className="h-4 w-4" />}
              label="NAF All"
            />
            <AuthorityTabButton
              active={currentAuthorityTab === "wikidata"}
              onClick={() => openAuthoritySearch("wikidata")}
              icon={<Globe className="h-4 w-4" />}
              label="Wikidata"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <button
              onClick={handleSave}
              className="glass-button px-4 py-2 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Record
            </button>

            {/* Load Real Example Dropdown */}
            <div className="relative">
              <button
                onClick={() =>
                  setShowExampleMenu(!showExampleMenu)
                }
                className="glass-button px-4 py-2 flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Load Real Example
              </button>

              {showExampleMenu && (
                <div className="absolute top-full left-0 mt-2 w-80 glass-card z-50 max-h-96 overflow-y-auto">
                  <div
                    className="p-2 hover:bg-black/10 transition-all duration-300 rounded-lg"
                    style={{
                      transition:
                        "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div
                      className="px-3 py-2 text-xs font-semibold text-white border-b border-white/30 hover:border-white/50 hover:bg-black/20 rounded-t-lg transition-all duration-300 cursor-default backdrop-blur-sm"
                      style={{
                        textShadow:
                          "0 2px 8px rgba(0, 0, 0, 0.5)",
                      }}
                    >
                      Real LOC Examples
                    </div>
                    {realLocExamples.map((example) => (
                      <button
                        key={example.id}
                        className="w-full text-left px-3 py-2 rounded transition-all duration-300 group relative overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          transition:
                            "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(30, 30, 40, 0.7) 100%)";
                          e.currentTarget.style.backdropFilter =
                            "blur(20px) saturate(150%)";
                          e.currentTarget.style.WebkitBackdropFilter =
                            "blur(20px) saturate(150%)";
                          e.currentTarget.style.transform =
                            "translateX(4px) scale(1.02)";
                          e.currentTarget.style.boxShadow =
                            "inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 24px rgba(0, 0, 0, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)";
                          e.currentTarget.style.backdropFilter =
                            "blur(10px)";
                          e.currentTarget.style.WebkitBackdropFilter =
                            "blur(10px)";
                          e.currentTarget.style.transform =
                            "translateX(0) scale(1)";
                          e.currentTarget.style.boxShadow =
                            "none";
                        }}
                        onClick={() =>
                          handleLoadExample(example.data)
                        }
                      >
                        <div
                          className="font-medium text-sm text-white group-hover:text-blue-300 transition-colors duration-300"
                          style={{
                            textShadow:
                              "0 2px 6px rgba(0, 0, 0, 0.8)",
                          }}
                        >
                          {example.name}
                        </div>
                        <div
                          className="text-xs text-gray-300 group-hover:text-gray-100 mt-1 transition-colors duration-300"
                          style={{
                            textShadow:
                              "0 1px 4px rgba(0, 0, 0, 0.6)",
                          }}
                        >
                          {example.description}
                        </div>
                        {/* Glossy shine effect on hover */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowImportDialog(true)}
              className="glass-button px-4 py-2 flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>

            <button
              onClick={() => {
                const blob = new Blob(
                  [JSON.stringify(graph, null, 2)],
                  { type: "application/json" },
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "bibframe-record.json";
                a.click();
              }}
              className="glass-button px-4 py-2 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export JSON-LD
            </button>
          </div>
        </div>
      </div>

      {/* Preview Tabs - Separate Tabs for Everything */}
      <div className="glass-navbar border-t border-white/20">
        <div className="px-6 py-3">
          <div className="glass-tab-bar flex items-center gap-2 overflow-x-auto">
            <PreviewTabButton
              active={previewTab === "form"}
              onClick={() => setPreviewTab("form")}
              icon={<FileText className="h-4 w-4" />}
              label="Form"
            />
            <PreviewTabButton
              active={previewTab === "graph"}
              onClick={() => setPreviewTab("graph")}
              icon={<Network className="h-4 w-4" />}
              label="Authority Graph"
            />
            <PreviewTabButton
              active={previewTab === "marc"}
              onClick={() => setPreviewTab("marc")}
              icon={<Database className="h-4 w-4" />}
              label="MARC"
            />
            <PreviewTabButton
              active={previewTab === "rdf"}
              onClick={() => setPreviewTab("rdf")}
              icon={<Code className="h-4 w-4" />}
              label="RDF"
            />
            <PreviewTabButton
              active={previewTab === "json"}
              onClick={() => setPreviewTab("json")}
              icon={<Braces className="h-4 w-4" />}
              label="JSON"
            />
            <PreviewTabButton
              active={previewTab === "opac"}
              onClick={() => {
                window.location.href = "/opac.html";
              }}
              icon={<Eye className="h-4 w-4" />}
              label="Public OPAC"
            />
            <PreviewTabButton
              active={previewTab === "mindmap"}
              onClick={() => setPreviewTab("mindmap")}
              icon={<Sparkles className="h-4 w-4" />}
              label="Mind Map"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 overflow-auto p-6 bg-black/30 backdrop-blur-3xl relative"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 20, 30, 0.5) 100%)",
          backdropFilter: "blur(40px) saturate(150%)",
          WebkitBackdropFilter: "blur(40px) saturate(150%)",
          boxShadow:
            "inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.5), 0 20px 60px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Form Tab */}
        {previewTab === "form" && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div
                className="p-6 rounded-2xl border border-white/50"
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  boxShadow:
                    '0px 8px 32px 0px rgba(31, 38, 135, 0.15), inset 0px 1px 0px 0px rgba(255, 255, 255, 0.6)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-[#0a0a0a]">
                    Work
                  </h3>
                </div>
                <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto">
                  {workProperties.map((property) => (
                    <OntologyField
                      key={property.uri}
                      property={property}
                      value={
                        workData[
                          property.uri.split("/").pop() || ""
                        ]
                      }
                      onChange={(value) =>
                        updateWorkProperty(property.uri, value)
                      }
                      language={language}
                    />
                  ))}

                  {/* Show Contributions */}
                  {workData["bf:contribution"]?.length > 0 && (
                    <div
                      className="p-4 rounded-xl border-[0.8px] border-white/50"
                      style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.1), inset 0px 1px 0px 0px white',
                      }}
                    >
                      <h4 className="text-sm font-semibold mb-2 text-[#0a0a0a]">
                        Contributors (
                        {workData["bf:contribution"].length})
                      </h4>
                      {workData["bf:contribution"].map(
                        (contrib: any, idx: number) => {
                          const agentLabel = getLabelString(
                            contrib["bf:agent"]?.[
                              "rdfs:label"
                            ] ||
                              contrib["bf:agent"]?.label ||
                              "Unknown",
                          );
                          const roleLabel = getLabelString(
                            contrib["bf:role"]?.[
                              "rdfs:label"
                            ] ||
                              contrib["bf:role"]?.label ||
                              "Contributor",
                          );

                          return (
                            <div
                              key={idx}
                              className="text-sm p-2 rounded-lg mb-2 border-[0.8px] border-white/50"
                              style={{
                                background: 'rgba(255, 255, 255, 0.6)',
                              }}
                            >
                              <div className="font-medium text-[#0a0a0a]">
                                {agentLabel}
                              </div>
                              <div className="text-xs text-[#364153]">
                                {roleLabel}
                              </div>
                              <div className="text-xs text-[#155dfc] truncate">
                                {contrib["bf:agent"]?.["@id"]}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-purple-600" />
                  <h3 className="text-xl font-semibold">
                    Instance
                  </h3>
                </div>
                <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto">
                  {instanceProperties.map((property) => (
                    <OntologyField
                      key={property.uri}
                      property={property}
                      value={
                        instanceData[
                          property.uri.split("/").pop() || ""
                        ]
                      }
                      onChange={(value) =>
                        updateInstanceProperty(
                          property.uri,
                          value,
                        )
                      }
                      language={language}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authority Graph Tab */}
        {previewTab === "graph" && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">
              Authority Graph
            </h3>
            <AuthorityGraph nodes={authorityNodes} />
          </div>
        )}

        {/* MARC Tab */}
        {previewTab === "marc" && (
          <MarcView
            data={{
              work: workData,
              instance: instanceData,
              admin: {},
            }}
          />
        )}

        {/* RDF Tab */}
        {previewTab === "rdf" && (
          <RdfView
            data={{
              work: workData,
              instance: instanceData,
              admin: {},
            }}
          />
        )}

        {/* JSON Tab */}
        {previewTab === "json" && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">
              JSON Structure
            </h3>
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
              <code>
                {JSON.stringify(
                  { work: workData, instance: instanceData },
                  null,
                  2,
                )}
              </code>
            </pre>
          </div>
        )}

        {/* OPAC Preview Tab */}
        {previewTab === "opac" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <div>
                <h4 className="text-sm font-bold text-white">WOF MOON Public Discovery OPAC</h4>
                <p className="text-xs text-white/70">Connected to the shared catalog database (Share-VDE & Libris standard)</p>
              </div>
              <a
                href="/opac.html"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg cursor-pointer shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open Full Standalone OPAC (/opac.html)</span>
              </a>
            </div>
            <WolfMoonStandaloneOpac onOpenEditor={() => setPreviewTab('form')} />
          </div>
        )}

        {/* Mind Map Tab */}
        {previewTab === "mindmap" && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">
              Mind Map
            </h3>
            <MindMapPreview
              workData={workData}
              instanceData={instanceData}
            />
          </div>
        )}
      </div>

      {/* Authority Search Dialog */}
      <AuthoritySearchDialog
        isOpen={showAuthoritySearch}
        onClose={() => setShowAuthoritySearch(false)}
        onSelect={handleAuthoritySelect}
        initialQuery=""
      />

      {/* Import Dialog */}
      <ImportRecordDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
      />
    </div>
  );
}

// Authority Tab Button with Glass Effect
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
}

function AuthorityTabButton({
  active,
  onClick,
  icon,
  label,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm font-medium
        ${
          active
            ? "glass-tab-active text-blue-600 shadow-lg"
            : "hover:bg-white/30 text-gray-700"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

function PreviewTabButton({
  active,
  onClick,
  icon,
  label,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm font-medium
        ${
          active
            ? "glass-tab-active text-purple-600 shadow-lg"
            : "hover:bg-white/30 text-gray-700"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}