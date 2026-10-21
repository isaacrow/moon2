/**
 * LOOP MOON - Unified Field Grouping Engine
 * 
 * Detects fields with the same property name across both ontology sources
 * (OntologyRegistry + BibframeOntologyEngine) and stacks them vertically
 * under a single grouped header — eliminating duplication.
 * 
 * Designed and developed by Isaac Faleh
 */

import React, { useState, useMemo } from "react";
import {
  ChevronDown, ChevronRight, Layers, Link as LinkIcon,
  AlertCircle, Zap, RefreshCw
} from "lucide-react";

// ===== ONTOLOGY SOURCES =====
import {
  ONTOLOGY_REGISTRY,
  OntologyProperty as RegistryProperty,
  getPropertiesByDomain as getRegistryProps,
  getCategoriesForDomain
} from "../../services/ontologyRegistry";
import {
  OntologyProperty as EngineProperty,
  getPropertiesForDomain as getEngineProps
} from "../services/bibframeOntologyEngine";
import { GraphStore } from "../../services/graphStore";

// ===== FIELD RENDERERS =====
import { OntologyField } from "./ontology/OntologyField";

import "../../styles/glassmorphism.css";

// ============================== TYPES ==============================

/** A unified property descriptor merging both sources */
export interface UnifiedProperty {
  /** Canonical key for grouping (e.g. "title", "contribution") */
  key: string;
  /** Human-readable label */
  label: string;
  /** Arabic label if available */
  labelAr?: string;
  /** Description from either source */
  description?: string;
  /** Is it required by at least one source? */
  required: boolean;
  /** Is it repeatable in at least one source? */
  repeatable: boolean;
  /** MARC mappings collected from both */
  marc: string[];
  /** Category from the OntologyRegistry (if present) */
  category?: string;
  /** The RegistryProperty (if it came from OntologyRegistry) */
  registryProp?: RegistryProperty;
  /** The EngineProperty (if it came from BibframeOntologyEngine) */
  engineProp?: EngineProperty;
  /** Which sources contributed this property */
  sources: ("registry" | "engine")[];
}

/** A category group containing unified properties */
export interface PropertyGroup {
  category: string;
  properties: UnifiedProperty[];
  requiredCount: number;
}

interface LoopMoonProps {
  /** "Work" | "Instance" | "Item" | "Expression" */
  entityType: string;
  /** The node URI in the graph store */
  nodeUri: string;
  /** The graph store for reading current values */
  graphStore: GraphStore;
  /** Current entity data (workData or instanceData) */
  entityData: Record<string, any>;
  /** Called when a property value changes via OntologyField */
  onFieldChange: (propertyUri: string, value: any) => void;
  /** Called when a property changes via GraphStore path */
  onGraphChange: (nodeUri: string, property: string, value: any) => void;
  /** Current language */
  language?: "en" | "ar";
}

// ============================== HELPERS ==============================

/**
 * Extract canonical key from a URI or shortName.
 * e.g. "http://id.loc.gov/ontologies/bibframe/title" -> "title"
 *      "bf:title" -> "title"
 *      "http://id.loc.gov/ontologies/bibframe/contribution/primary" -> "contribution/primary"
 */
function canonicalKey(input: string): string {
  // Strip bf: prefix
  if (input.startsWith("bf:")) return input.slice(3);
  // Strip full URI prefix
  const bfPrefix = "http://id.loc.gov/ontologies/bibframe/";
  if (input.startsWith(bfPrefix)) return input.slice(bfPrefix.length);
  // Fallback: last segment
  const parts = input.split("/");
  return parts[parts.length - 1] || input;
}

/**
 * Build a canonical base key for grouping (strips sub-paths).
 * e.g. "contribution/primary" -> "contribution"
 *      "subject/topical" -> "subject"
 *      "title" -> "title"
 */
function groupKey(key: string): string {
  return key.split("/")[0];
}

// ============================== MERGE ENGINE ==============================

/**
 * Merge properties from both ontology sources into unified descriptors,
 * grouped by canonical property name.
 */
function mergeProperties(
  entityType: string
): { unified: UnifiedProperty[]; groups: PropertyGroup[] } {
  const map = new Map<string, UnifiedProperty>();

  // --- 1. Ingest from OntologyRegistry ---
  const domainKey = entityType; // "Work", "Instance", etc.
  const registryProps = getRegistryProps(domainKey);
  for (const rp of registryProps) {
    const key = canonicalKey(rp.shortName);
    const gk = groupKey(key);

    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.registryProp = rp;
      if (!existing.sources.includes("registry")) existing.sources.push("registry");
      if (rp.required) existing.required = true;
      if (rp.category && !existing.category) existing.category = rp.category;
    } else {
      map.set(key, {
        key,
        label: rp.label,
        description: rp.description,
        required: rp.required,
        repeatable: rp.repeatable,
        marc: [],
        category: rp.category,
        registryProp: rp,
        sources: ["registry"],
      });
    }
  }

  // --- 2. Ingest from BibframeOntologyEngine ---
  const bfDomain = `bf:${entityType}`;
  const engineProps = getEngineProps(bfDomain);
  for (const ep of engineProps) {
    const key = canonicalKey(ep.uri);
    const gk = groupKey(key);

    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.engineProp = ep;
      if (!existing.sources.includes("engine")) existing.sources.push("engine");
      if (ep.required) existing.required = true;
      if (ep.labelAr && !existing.labelAr) existing.labelAr = ep.labelAr;
      existing.marc = [...new Set([...existing.marc, ...ep.marc])];
    } else {
      // Check if there's a parent group we should merge into
      const parentKey = groupKey(key);
      // Don't merge sub-paths into parent — keep them separate for full control
      map.set(key, {
        key,
        label: ep.label,
        labelAr: ep.labelAr,
        description: ep.description,
        required: ep.required || false,
        repeatable: ep.repeatable || false,
        marc: [...ep.marc],
        engineProp: ep,
        sources: ["engine"],
      });
    }
  }

  // --- 3. Group by category or by base key ---
  const unified = Array.from(map.values());

  // Assign categories to uncategorized properties based on groupKey matching
  for (const prop of unified) {
    if (!prop.category) {
      // Try to find a sibling with a category
      const gk = groupKey(prop.key);
      const sibling = unified.find(
        (p) => groupKey(p.key) === gk && p.category
      );
      if (sibling) {
        prop.category = sibling.category;
      } else {
        // Fallback categories
        prop.category = inferCategory(prop.key);
      }
    }
  }

  // Build groups
  const categoryMap = new Map<string, UnifiedProperty[]>();
  for (const prop of unified) {
    const cat = prop.category || "Other";
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push(prop);
  }

  // Sort: categories with required fields first
  const groups: PropertyGroup[] = Array.from(categoryMap.entries())
    .map(([category, properties]) => ({
      category,
      properties: properties.sort((a, b) => {
        // Required first, then alphabetical
        if (a.required !== b.required) return a.required ? -1 : 1;
        return a.label.localeCompare(b.label);
      }),
      requiredCount: properties.filter((p) => p.required).length,
    }))
    .sort((a, b) => {
      if (a.requiredCount !== b.requiredCount) return b.requiredCount - a.requiredCount;
      return a.category.localeCompare(b.category);
    });

  return { unified, groups };
}

function inferCategory(key: string): string {
  const base = groupKey(key).toLowerCase();
  if (["title", "mainTitle", "subtitle", "partName", "partNumber"].includes(base)) return "Title Information";
  if (["contribution", "creator", "contributor"].includes(base)) return "Contributors";
  if (["subject", "genreForm", "classification", "classificationLcc", "classificationDdc"].includes(base)) return "Subject & Classification";
  if (["language", "content", "summary", "tableOfContents", "note", "intendedAudience"].includes(base)) return "Content Description";
  if (["identifiedBy", "isbn", "lccn"].includes(base)) return "Identifiers";
  if (["provisionActivity", "publication", "distribution"].includes(base)) return "Publication";
  if (["extent", "dimensions", "media", "carrier", "issuance"].includes(base)) return "Physical Description";
  if (["editionStatement", "responsibilityStatement", "seriesStatement"].includes(base)) return "Statements";
  if (["illustrativeContent", "supplementaryContent"].includes(base)) return "Supplementary";
  if (["geographicCoverage", "geographicAreaCode", "originPlace", "originDate"].includes(base)) return "Geographic & Temporal";
  return "Other Properties";
}

// ============================== COMPONENT ==============================

export default function LoopMoon({
  entityType,
  nodeUri,
  graphStore,
  entityData,
  onFieldChange,
  onGraphChange,
  language = "en",
}: LoopMoonProps) {
  const { unified, groups } = useMemo(() => mergeProperties(entityType), [entityType]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(groups.filter((g) => g.requiredCount > 0).map((g) => g.category))
  );

  const toggleGroup = (cat: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const expandAll = () => setExpandedGroups(new Set(groups.map((g) => g.category)));
  const collapseAll = () => setExpandedGroups(new Set());

  // Count how many fields have values
  const filledCount = unified.filter((p) => {
    const val = resolveValue(p, entityData);
    return val !== undefined && val !== null && val !== "";
  }).length;

  const totalDuplicates = unified.filter((p) => p.sources.length > 1).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Loop Moon
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                {entityType}
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              {unified.length} unified fields &middot; {filledCount} filled &middot;{" "}
              {totalDuplicates > 0 && (
                <span className="text-cyan-400">{totalDuplicates} merged from dual sources</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="glass-button-dark px-3 py-1.5 text-xs flex items-center gap-1"
          >
            <ChevronDown className="h-3 w-3" /> Expand All
          </button>
          <button
            onClick={collapseAll}
            className="glass-button-dark px-3 py-1.5 text-xs flex items-center gap-1"
          >
            <ChevronRight className="h-3 w-3" /> Collapse All
          </button>
        </div>
      </div>

      {/* Groups */}
      {groups.map((group) => (
        <LoopGroup
          key={group.category}
          group={group}
          expanded={expandedGroups.has(group.category)}
          onToggle={() => toggleGroup(group.category)}
          entityData={entityData}
          graphStore={graphStore}
          nodeUri={nodeUri}
          onFieldChange={onFieldChange}
          onGraphChange={onGraphChange}
          language={language}
        />
      ))}
    </div>
  );
}

// ============================== GROUP ==============================

function LoopGroup({
  group,
  expanded,
  onToggle,
  entityData,
  graphStore,
  nodeUri,
  onFieldChange,
  onGraphChange,
  language,
}: {
  group: PropertyGroup;
  expanded: boolean;
  onToggle: () => void;
  entityData: Record<string, any>;
  graphStore: GraphStore;
  nodeUri: string;
  onFieldChange: (uri: string, value: any) => void;
  onGraphChange: (nodeUri: string, property: string, value: any) => void;
  language: string;
}) {
  const filledInGroup = group.properties.filter((p) => {
    const val = resolveValue(p, entityData);
    return val !== undefined && val !== null && val !== "";
  }).length;

  return (
    <div className="glass-card-dark overflow-hidden border-l-4 border-violet-500/30">
      <button
        onClick={onToggle}
        className="w-full px-5 py-3 bg-white/5 hover:bg-white/10 flex items-center justify-between transition-all"
        type="button"
      >
        <div className="flex items-center gap-3">
          <Layers className="h-4 w-4 text-violet-400" />
          <div className="text-left">
            <h4 className="text-sm font-bold text-white">{group.category}</h4>
            <p className="text-xs text-gray-500">
              {group.properties.length} fields
              {group.requiredCount > 0 && (
                <span className="text-amber-400 ml-1">
                  &middot; {group.requiredCount} required
                </span>
              )}
              {filledInGroup > 0 && (
                <span className="text-green-400 ml-1">
                  &middot; {filledInGroup} filled
                </span>
              )}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "" : "-rotate-90"}`}
        />
      </button>

      {expanded && (
        <div className="p-5 space-y-4">
          {group.properties.map((prop) => (
            <LoopField
              key={prop.key}
              prop={prop}
              entityData={entityData}
              graphStore={graphStore}
              nodeUri={nodeUri}
              onFieldChange={onFieldChange}
              onGraphChange={onGraphChange}
              language={language}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================== UNIFIED FIELD ==============================

function LoopField({
  prop,
  entityData,
  graphStore,
  nodeUri,
  onFieldChange,
  onGraphChange,
  language,
}: {
  prop: UnifiedProperty;
  entityData: Record<string, any>;
  graphStore: GraphStore;
  nodeUri: string;
  onFieldChange: (uri: string, value: any) => void;
  onGraphChange: (nodeUri: string, property: string, value: any) => void;
  language: string;
}) {
  const isDual = prop.sources.length > 1;
  const value = resolveValue(prop, entityData);
  const hasValue = value !== undefined && value !== null && value !== "";

  return (
    <div
      className={`rounded-lg border transition-all ${
        hasValue
          ? "border-green-500/20 bg-green-500/5"
          : prop.required
          ? "border-amber-500/20 bg-amber-500/5"
          : "border-white/10 bg-white/5"
      }`}
    >
      {/* Field Header */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">
            {language === "ar" && prop.labelAr ? prop.labelAr : prop.label}
          </span>
          {prop.required && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
              Required
            </span>
          )}
          {prop.repeatable && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
              Repeatable
            </span>
          )}
          {isDual && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 flex items-center gap-0.5">
              <RefreshCw className="h-2.5 w-2.5" /> Merged
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          {prop.marc.length > 0 && (
            <span className="font-mono">MARC: {prop.marc.join(", ")}</span>
          )}
          <span className="font-mono text-violet-400/60">
            bf:{prop.key}
          </span>
        </div>
      </div>

      {/* Field Renderers — stacked vertically */}
      <div className="p-4 space-y-3">
        {prop.description && (
          <p className="text-xs text-gray-500 mb-2">{prop.description}</p>
        )}

        {/* Render Engine field (OntologyField) if available */}
        {prop.engineProp && (
          <div className="relative">
            {isDual && (
              <div className="absolute -left-2 top-0 bottom-0 w-0.5 rounded bg-cyan-500/40" />
            )}
            <div className={isDual ? "pl-2" : ""}>
              <OntologyField
                property={prop.engineProp}
                value={resolveEngineValue(prop.engineProp, entityData)}
                onChange={(val: any) => onFieldChange(prop.engineProp!.uri, val)}
                language={language as "en" | "ar"}
                theme="blur"
              />
            </div>
          </div>
        )}

        {/* If only registry prop (no engine equivalent), show a simple input */}
        {prop.registryProp && !prop.engineProp && (
          <div className="relative">
            <RegistryFieldFallback
              prop={prop.registryProp}
              value={graphStore.getNode(nodeUri)?.[prop.registryProp.shortName]}
              onChange={(val) =>
                onGraphChange(nodeUri, prop.registryProp!.shortName, val)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================== FALLBACK FOR REGISTRY-ONLY ==============================

function RegistryFieldFallback({
  prop,
  value,
  onChange,
}: {
  prop: RegistryProperty;
  value: any;
  onChange: (value: any) => void;
}) {
  const displayValue =
    typeof value === "object" && value !== null
      ? value["rdfs:label"] || value["@value"] || JSON.stringify(value)
      : value || "";

  if (prop.rangeType === "BlankNode") {
    return (
      <div className="text-xs text-gray-500 italic flex items-center gap-1.5">
        <LinkIcon className="h-3 w-3 text-purple-400" />
        Complex entity — use the BIBFRAME Editor tab for full editing
        {value && (
          <span className="text-cyan-400 font-mono ml-2 truncate max-w-[300px]">
            {typeof value === "object" ? JSON.stringify(value).slice(0, 80) + "..." : value}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-300">
        {prop.label}
        {prop.required && <span className="text-amber-400 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={prop.inputHint || prop.description || `Enter ${prop.label.toLowerCase()}`}
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 backdrop-blur-sm"
      />
    </div>
  );
}

// ============================== VALUE RESOLUTION ==============================

function resolveValue(prop: UnifiedProperty, entityData: Record<string, any>): any {
  // Try multiple key formats
  const keys = [
    `bf:${prop.key}`,
    prop.key,
    prop.engineProp?.uri.split("/").pop(),
    prop.registryProp?.shortName,
  ].filter(Boolean) as string[];

  for (const k of keys) {
    if (entityData[k] !== undefined) return entityData[k];
  }
  return undefined;
}

function resolveEngineValue(ep: EngineProperty, entityData: Record<string, any>): any {
  const propName = ep.uri.split("/").pop() || "";
  return entityData[propName] ?? entityData[`bf:${propName}`] ?? entityData[ep.uri];
}
