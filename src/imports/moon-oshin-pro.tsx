/**
 * 🌙 MOON OSHIN PROFESSIONAL
 * National-Library-Grade Linked Data Cataloging Interface
 * Comparable to LOC Marva and Libris XL
 */

"use client";
import React, { useState, useEffect } from "react";
import { Download, Sparkles, Eye, Code, FileJson, BookOpen, AlertCircle, CheckCircle2, Loader2, Search } from "lucide-react";
import { CatalogingWizard, WizardStep } from "./cataloging/CatalogingWizard";
import { AuthoritySelect, AuthorityMultiSelect } from "./cataloging/AuthoritySelect";
import { validateBibframeRecord, ValidationResult } from "../../services/bibframeValidator";
import { toTurtle, toJsonLd, generateUri } from "../../services/rdfGraphBuilder";
import {
  AuthorityResult,
  searchAllAuthorities,
  searchLanguages,
  searchCarriers,
  searchMediaTypes,
  searchCountries,
  searchRelators,
  COMMON_RELATORS,
  lookupISBN,
  ISBNData
} from "../../services/authoritySearch";

type ViewTab = "catalog" | "preview" | "jsonld" | "turtle";

interface Contribution {
  agent: AuthorityResult | null;
  role: string;
}

interface Identifier {
  type: "Isbn" | "Issn" | "Lccn" | "Local";
  value: string;
}

export default function MoonOshinPro() {
  /* ============================= STATE ============================= */

  const [viewTab, setViewTab] = useState<ViewTab>("catalog");
  const [currentStep, setCurrentStep] = useState<WizardStep>("work");
  const [advancedMode, setAdvancedMode] = useState(false);

  // URIs
  const [workUri] = useState(generateUri("work"));
  const [instanceUri] = useState(generateUri("instance"));
  const [itemUri] = useState(generateUri("item"));

  // Work
  const [workTitle, setWorkTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [language, setLanguage] = useState<AuthorityResult | null>({
    label: "English",
    uri: "http://id.loc.gov/vocabulary/languages/eng",
    source: "LOC"
  });
  const [genre, setGenre] = useState<AuthorityResult | null>(null);
  const [subjects, setSubjects] = useState<AuthorityResult[]>([]);
  const [contributors, setContributors] = useState<Contribution[]>([
    { agent: null, role: "aut" }
  ]);

  // Instance
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

  // Publication
  const [publicationPlace, setPublicationPlace] = useState<AuthorityResult | null>({
    label: "United States",
    uri: "http://id.loc.gov/vocabulary/countries/xxu",
    source: "LOC"
  });
  const [publisher, setPublisher] = useState<AuthorityResult | null>(null);
  const [publicationDate, setPublicationDate] = useState(new Date().getFullYear().toString());

  // Item
  const [heldBy, setHeldBy] = useState("https://moonlib.org/library/main");
  const [shelfMark, setShelfMark] = useState("");
  const [barcode, setBarcode] = useState("");

  // Output
  const [jsonld, setJsonld] = useState<any>(null);
  const [turtle, setTurtle] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // ISBN Lookup
  const [isbnLookupLoading, setIsbnLookupLoading] = useState(false);

  /* ============================= VALIDATION ============================= */

  const validateStep = (step: WizardStep): boolean => {
    switch (step) {
      case "work":
        return !!(
          workTitle.trim() &&
          contributors.length > 0 &&
          contributors.every(c => c.agent !== null && c.role)
        );
      case "instance":
        return !!(carrier && media);
      case "publication":
        return !!(publicationPlace && publisher && publicationDate);
      case "item":
        return true; // Item is optional
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
      work["bf:language"] = { "@id": language.uri };
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

    work["bf:hasInstance"] = { "@id": instanceUri };
    graph.push(work);

    // Add agent nodes
    contributors.forEach(c => {
      if (c.agent && c.agent.source === "Local") {
        graph.push({
          "@id": c.agent.uri,
          "@type": "bf:Person",
          "rdfs:label": c.agent.label
        });
      }
    });

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
      instance["bf:carrier"] = { "@id": carrier.uri };
    }

    if (media) {
      instance["bf:media"] = { "@id": media.uri };
    }

    const pubAgent = publisher ? publisher.uri : generateUri("organization");
    instance["bf:provisionActivity"] = {
      "@type": "bf:Publication",
      "bf:place": { "@id": publicationPlace!.uri },
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

    return toJsonLd(graph);
  };

  const generateRDF = () => {
    try {
      const graph = buildGraph();
      const validationResult = validateBibframeRecord(graph);
      
      setValidation(validationResult);
      setJsonld(graph);

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
        generateRDF();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [workTitle, subtitle, language, genre, subjects, contributors, identifiers, extent, carrier, media, publicationPlace, publisher, publicationDate, heldBy, shelfMark, barcode]);

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
      }
    } catch (error) {
      console.error("ISBN lookup error:", error);
    } finally {
      setIsbnLookupLoading(false);
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

  /* ============================= RENDER ============================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-blue-600" />
                MOON Cataloging System
              </h1>
              <p className="text-gray-600">BIBFRAME 2.0 Linked Data Editor</p>
            </div>
            <div className="flex gap-3">
              {validation?.valid && (
                <>
                  <button
                    onClick={() => downloadRdf("turtle")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Turtle
                  </button>
                  <button
                    onClick={() => downloadRdf("jsonld")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    JSON-LD
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Validation Summary */}
          {validation && (
            <div className={`mt-4 p-4 rounded-lg ${validation.valid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center gap-2">
                {validation.valid ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">Valid BIBFRAME Record</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-900">
                      {validation.errors.length} validation issue(s)
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* View Tabs */}
        <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
          <div className="flex gap-2">
            <ViewTabButton
              icon={<BookOpen className="h-4 w-4" />}
              label="Cataloging"
              active={viewTab === "catalog"}
              onClick={() => setViewTab("catalog")}
            />
            <ViewTabButton
              icon={<Eye className="h-4 w-4" />}
              label="Preview"
              active={viewTab === "preview"}
              onClick={() => setViewTab("preview")}
            />
            <ViewTabButton
              icon={<FileJson className="h-4 w-4" />}
              label="JSON-LD"
              active={viewTab === "jsonld"}
              onClick={() => setViewTab("jsonld")}
            />
            <ViewTabButton
              icon={<Code className="h-4 w-4" />}
              label="Turtle"
              active={viewTab === "turtle"}
              onClick={() => setViewTab("turtle")}
            />
          </div>
        </div>

        {/* Content */}
        {viewTab === "catalog" && (
          <CatalogingWizard
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            validation={stepValidation}
          >
            {currentStep === "work" && (
              <WorkStep
                workTitle={workTitle}
                setWorkTitle={setWorkTitle}
                subtitle={subtitle}
                setSubtitle={setSubtitle}
                language={language}
                setLanguage={setLanguage}
                genre={genre}
                setGenre={setGenre}
                subjects={subjects}
                setSubjects={setSubjects}
                contributors={contributors}
                setContributors={setContributors}
              />
            )}

            {currentStep === "instance" && (
              <InstanceStep
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
              <PublicationStep
                publicationPlace={publicationPlace}
                setPublicationPlace={setPublicationPlace}
                publisher={publisher}
                setPublisher={setPublisher}
                publicationDate={publicationDate}
                setPublicationDate={setPublicationDate}
              />
            )}

            {currentStep === "item" && (
              <ItemStep
                heldBy={heldBy}
                setHeldBy={setHeldBy}
                shelfMark={shelfMark}
                setShelfMark={setShelfMark}
                barcode={barcode}
                setBarcode={setBarcode}
              />
            )}
          </CatalogingWizard>
        )}

        {viewTab === "preview" && (
          <PreviewView
            workTitle={workTitle}
            subtitle={subtitle}
            contributors={contributors}
            publisher={publisher}
            publicationDate={publicationDate}
            publicationPlace={publicationPlace}
            subjects={subjects}
            identifiers={identifiers}
            shelfMark={shelfMark}
          />
        )}

        {viewTab === "jsonld" && (
          <CodeView title="JSON-LD" content={jsonld ? JSON.stringify(jsonld, null, 2) : "Configure the record to generate JSON-LD..."} />
        )}

        {viewTab === "turtle" && (
          <CodeView title="Turtle RDF" content={turtle || "Configure the record to generate Turtle RDF..."} />
        )}
      </div>
    </div>
  );
}

/* ============================= STEP COMPONENTS ============================= */

function WorkStep({
  workTitle, setWorkTitle, subtitle, setSubtitle,
  language, setLanguage, genre, setGenre,
  subjects, setSubjects, contributors, setContributors
}: any) {
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Work: Intellectual Content</h2>
        <p className="text-gray-600">Describe the conceptual essence of this resource</p>
      </div>

      {/* Title */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Main Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={workTitle}
            onChange={(e) => setWorkTitle(e.target.value)}
            placeholder="Enter the main title"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Enter subtitle if applicable"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Language */}
      <AuthoritySelect
        label="Language"
        value={language}
        onChange={setLanguage}
        onSearch={searchLanguages}
        placeholder="Search languages..."
        required
      />

      {/* Genre */}
      <AuthoritySelect
        label="Genre/Form"
        value={genre}
        onChange={setGenre}
        onSearch={(q) => searchAllAuthorities(q, 'genre')}
        placeholder="Search genre forms..."
      />

      {/* Subjects */}
      <AuthorityMultiSelect
        label="Subjects"
        values={subjects}
        onChange={setSubjects}
        onSearch={(q) => searchAllAuthorities(q, 'subject')}
        placeholder="Search and add subjects..."
      />

      {/* Contributors */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">
            Contributors <span className="text-red-500">*</span>
          </label>
          <button
            onClick={addContributor}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all"
            type="button"
          >
            + Add Contributor
          </button>
        </div>

        {contributors.map((contrib: any, index: number) => (
          <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Contributor {index + 1}</span>
              {contributors.length > 1 && (
                <button
                  onClick={() => removeContributor(index)}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  type="button"
                >
                  Remove
                </button>
              )}
            </div>

            <AuthoritySelect
              label="Agent"
              value={contrib.agent}
              onChange={(value) => updateContributor(index, "agent", value)}
              onSearch={(q) => searchAllAuthorities(q, 'person')}
              placeholder="Search for person or organization..."
              required
              allowCustom
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={contrib.role}
                onChange={(e) => updateContributor(index, "role", e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COMMON_RELATORS.map(r => (
                  <option key={r.code} value={r.code}>{r.label} ({r.code})</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InstanceStep({
  identifiers, setIdentifiers, extent, setExtent,
  carrier, setCarrier, media, setMedia,
  onISBNLookup, isbnLookupLoading
}: any) {
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Instance: Physical Manifestation</h2>
        <p className="text-gray-600">Describe how this work is embodied</p>
      </div>

      {/* Identifiers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">Identifiers</label>
          <button
            onClick={addIdentifier}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
            type="button"
          >
            + Add Identifier
          </button>
        </div>

        {identifiers.map((id: Identifier, index: number) => (
          <div key={index} className="flex gap-3">
            <select
              value={id.type}
              onChange={(e) => updateIdentifier(index, "type", e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => removeIdentifier(index)}
              className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-all"
              type="button"
            >
              Remove
            </button>
          </div>
        ))}

        {/* ISBN Lookup Button */}
        {identifiers.some((id: Identifier) => id.type === "Isbn" && id.value.trim()) && (
          <button
            onClick={onISBNLookup}
            disabled={isbnLookupLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            type="button"
          >
            {isbnLookupLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading from Open Library...
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

      {/* Extent */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Extent</label>
        <input
          type="text"
          value={extent}
          onChange={(e) => setExtent(e.target.value)}
          placeholder="e.g., xviii, 256 pages"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Carrier */}
      <AuthoritySelect
        label="Carrier"
        value={carrier}
        onChange={setCarrier}
        onSearch={searchCarriers}
        placeholder="Select carrier type..."
        required
      />

      {/* Media */}
      <AuthoritySelect
        label="Media Type"
        value={media}
        onChange={setMedia}
        onSearch={searchMediaTypes}
        placeholder="Select media type..."
        required
      />
    </div>
  );
}

function PublicationStep({
  publicationPlace, setPublicationPlace,
  publisher, setPublisher,
  publicationDate, setPublicationDate
}: any) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Publication Information</h2>
        <p className="text-gray-600">Describe how and where this instance was published</p>
      </div>

      {/* Place */}
      <AuthoritySelect
        label="Place of Publication"
        value={publicationPlace}
        onChange={setPublicationPlace}
        onSearch={searchCountries}
        placeholder="Search countries..."
        required
      />

      {/* Publisher */}
      <AuthoritySelect
        label="Publisher"
        value={publisher}
        onChange={setPublisher}
        onSearch={(q) => searchAllAuthorities(q, 'organization')}
        placeholder="Search publishers..."
        required
        allowCustom
      />

      {/* Date */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Publication Year <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={publicationDate}
          onChange={(e) => setPublicationDate(e.target.value)}
          placeholder="YYYY"
          pattern="\d{4}"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

function ItemStep({ heldBy, setHeldBy, shelfMark, setShelfMark, barcode, setBarcode }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Item: Holdings (Optional)</h2>
        <p className="text-gray-600">Describe physical holdings and location</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Held By (Institution URI)</label>
        <input
          type="text"
          value={heldBy}
          onChange={(e) => setHeldBy(e.target.value)}
          placeholder="https://moonlib.org/library/main"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Shelf Mark / Call Number</label>
        <input
          type="text"
          value={shelfMark}
          onChange={(e) => setShelfMark(e.target.value)}
          placeholder="QA76.9.D3 S46 2026"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Barcode</label>
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="31234567890123"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

/* ============================= VIEW COMPONENTS ============================= */

function ViewTabButton({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function PreviewView({ workTitle, subtitle, contributors, publisher, publicationDate, publicationPlace, subjects, identifiers, shelfMark }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Preview</h2>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <h3 className="text-3xl font-bold text-gray-900">{workTitle || "Untitled"}</h3>
          {subtitle && <p className="text-xl text-gray-600 mt-2">{subtitle}</p>}
        </div>

        {/* Contributors */}
        {contributors.filter((c: any) => c.agent).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Contributors</h4>
            <div className="space-y-1">
              {contributors.filter((c: any) => c.agent).map((c: any, i: number) => (
                <div key={i} className="text-lg text-gray-800">
                  {c.agent.label} ({COMMON_RELATORS.find(r => r.code === c.role)?.label || c.role})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publication */}
        {(publisher || publicationDate || publicationPlace) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Publication</h4>
            <p className="text-gray-800">
              {publisher?.label && <span className="font-semibold">{publisher.label}</span>}
              {publicationPlace && publisher?.label && <span>, </span>}
              {publicationPlace && <span>{publicationPlace.label}</span>}
              {publicationDate && <span> ({publicationDate})</span>}
            </p>
          </div>
        )}

        {/* Identifiers */}
        {identifiers.filter((id: Identifier) => id.value).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Identifiers</h4>
            <div className="space-y-1">
              {identifiers.filter((id: Identifier) => id.value).map((id: Identifier, i: number) => (
                <div key={i} className="text-gray-800">
                  <span className="font-semibold">{id.type}:</span> {id.value}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subjects */}
        {subjects.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Subjects</h4>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject: AuthorityResult, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {subject.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Holdings */}
        {shelfMark && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Holdings</h4>
            <p className="text-gray-800">
              <span className="font-semibold">Call Number:</span> {shelfMark}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CodeView({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <pre className="w-full h-[600px] px-4 py-3 bg-gray-900 text-green-400 font-mono text-sm rounded-lg overflow-auto">
        {content}
      </pre>
    </div>
  );
}
