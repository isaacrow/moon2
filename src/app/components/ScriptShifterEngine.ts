/**
 * ScriptShifter Engine — Client-side transliteration using LC's mapping tables
 * 
 * Fetches YAML character mapping tables from the lcnetdev/scriptshifter GitHub repo
 * and performs longest-match-first character substitution transliteration.
 * 
 * Supports parent inheritance (e.g., russian.yml extends cyrillic_generic.yml).
 * Some scripts (Arabic S2R, Chinese, Korean, Hebrew) use Python hooks in the
 * original implementation — those are flagged as "basic support" since we can
 * only do the character-map portion here.
 * 
 * Reference: https://github.com/lcnetdev/scriptshifter
 */

import yaml from "js-yaml";

const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/lcnetdev/scriptshifter/main/scriptshifter/tables";

// Scripts that use Python hooks and won't work with pure character mapping
const HOOK_DEPENDENT_SCRIPTS = new Set([
  "chinese", "korean_names", "korean_nonames", "hebrew", "thai",
  "burmese", "khmer", "tibetan", "inuktitut", "cherokee",
]);

// Scripts where S2R specifically uses hooks (R2S still works via maps)
const S2R_HOOK_SCRIPTS = new Set([
  "arabic", "persian", "pushto", "urdu", "sindhi_arabic", "uighur_arabic", "kurdish_arabic",
]);

export interface SSLanguageEntry {
  name: string;
  marc_code?: string;
  alias_of?: string;
  description?: string;
}

export interface SSLanguageIndex {
  [key: string]: SSLanguageEntry;
}

interface SSMapData {
  roman_to_script?: { map?: Record<string, string> };
  script_to_roman?: { map?: Record<string, string> };
  general?: {
    name?: string;
    parents?: string[];
    case_sensitive?: boolean;
    description?: string;
  };
}

// Caches
const indexCache: { data: SSLanguageIndex | null; loading: boolean } = { data: null, loading: false };
const tableCache = new Map<string, SSMapData>();
const mergedMapCache = new Map<string, { r2s: [string, string][]; s2r: [string, string][] }>();

/**
 * Fetch and parse the index.yml to get the list of all available languages
 */
export async function fetchLanguageIndex(): Promise<SSLanguageIndex> {
  if (indexCache.data) return indexCache.data;

  const resp = await fetch(`${GITHUB_RAW_BASE}/index.yml`);
  if (!resp.ok) throw new Error(`Failed to fetch index.yml: HTTP ${resp.status}`);
  const text = await resp.text();
  const parsed = yaml.load(text) as SSLanguageIndex;
  indexCache.data = parsed;
  return parsed;
}

/**
 * Fetch a single language YAML table from GitHub
 */
async function fetchTable(langKey: string): Promise<SSMapData> {
  if (tableCache.has(langKey)) return tableCache.get(langKey)!;

  // Skip internal/base tables that start with underscore
  const url = `${GITHUB_RAW_BASE}/data/${langKey}.yml`;
  const resp = await fetch(url);
  if (!resp.ok) {
    console.warn(`[ScriptShifter] Could not fetch table ${langKey}: HTTP ${resp.status}`);
    const empty: SSMapData = {};
    tableCache.set(langKey, empty);
    return empty;
  }
  const text = await resp.text();
  const parsed = yaml.load(text) as SSMapData;
  tableCache.set(langKey, parsed);
  return parsed;
}

/**
 * Resolve parent inheritance and merge all maps for a given language.
 * Returns sorted (longest-first) mapping arrays for both directions.
 */
async function getMergedMaps(langKey: string): Promise<{ r2s: [string, string][]; s2r: [string, string][] }> {
  if (mergedMapCache.has(langKey)) return mergedMapCache.get(langKey)!;

  // Check if this is an alias
  const index = await fetchLanguageIndex();
  const entry = index[langKey];
  const resolvedKey = entry?.alias_of || langKey;

  // Fetch the table
  const table = await fetchTable(resolvedKey);

  // Fetch parent tables recursively
  const parentMaps = { r2s: {} as Record<string, string>, s2r: {} as Record<string, string> };
  if (table.general?.parents) {
    for (const parent of table.general.parents) {
      if (parent.startsWith("_")) continue; // Skip internal bases like _ignore_base
      try {
        const parentData = await getMergedMaps(parent);
        for (const [k, v] of parentData.r2s) parentMaps.r2s[k] = v;
        for (const [k, v] of parentData.s2r) parentMaps.s2r[k] = v;
      } catch (e) {
        console.warn(`[ScriptShifter] Could not load parent ${parent}:`, e);
      }
    }
  }

  // Merge: child overrides parent
  const r2sMap = { ...parentMaps.r2s, ...(table.roman_to_script?.map || {}) };
  const s2rMap = { ...parentMaps.s2r, ...(table.script_to_roman?.map || {}) };

  // Sort by key length descending (longest match first) for greedy matching
  const r2s = Object.entries(r2sMap).sort((a, b) => b[0].length - a[0].length);
  const s2r = Object.entries(s2rMap).sort((a, b) => b[0].length - a[0].length);

  const result = { r2s, s2r };
  mergedMapCache.set(langKey, result);
  return result;
}

/**
 * Process Unicode escape sequences in map keys/values.
 * The YAML files use \\uXXXX notation that js-yaml may or may not resolve.
 */
function processUnicode(s: string): string {
  // js-yaml should handle \uXXXX in quoted strings, but let's be safe
  return s.replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Perform transliteration using longest-match-first substitution
 */
export async function transliterate(
  text: string,
  langKey: string,
  direction: "s2r" | "r2s" = "s2r",
  capitalize: boolean = false
): Promise<{ output: string; warnings: string[] }> {
  const warnings: string[] = [];

  // Check for hook-dependent scripts
  if (HOOK_DEPENDENT_SCRIPTS.has(langKey)) {
    warnings.push(`${langKey} requires Python hooks for transliteration. Results may be incomplete or unavailable.`);
  }
  if (direction === "s2r" && S2R_HOOK_SCRIPTS.has(langKey)) {
    warnings.push(`${langKey} Script-to-Roman uses a Python library. Only Roman-to-Script is available via character maps.`);
  }

  const maps = await getMergedMaps(langKey);
  const mapEntries = direction === "r2s" ? maps.r2s : maps.s2r;

  if (mapEntries.length === 0) {
    return {
      output: "",
      warnings: [...warnings, `No ${direction === "r2s" ? "Roman-to-Script" : "Script-to-Roman"} mapping found for ${langKey}.`],
    };
  }

  // Normalize the input text
  let input = text;
  let output = "";
  let pos = 0;

  // Process word-boundary markers: % indicates word boundary in the YAML maps
  // We'll handle this by checking if we're at a word boundary
  const isWordBoundary = (p: number): boolean => {
    if (p <= 0) return true;
    if (p >= input.length) return true;
    const ch = input[p - 1];
    return ch === " " || ch === "\n" || ch === "\t" || ch === "-" || ch === "." || ch === ",";
  };

  const isWordEnd = (p: number): boolean => {
    if (p >= input.length) return true;
    const ch = input[p];
    return ch === " " || ch === "\n" || ch === "\t" || ch === "-" || ch === "." || ch === "," || ch === ";";
  };

  while (pos < input.length) {
    let matched = false;

    for (const [pattern, replacement] of mapEntries) {
      // Handle word-boundary markers
      let actualPattern = pattern;
      let requireStart = false;
      let requireEnd = false;

      if (actualPattern.startsWith("%")) {
        requireStart = true;
        actualPattern = actualPattern.slice(1);
      }
      if (actualPattern.endsWith("%")) {
        requireEnd = true;
        actualPattern = actualPattern.slice(0, -1);
      }

      if (actualPattern.length === 0) continue;

      // Check if pattern matches at current position
      const caseSensitive = true; // Most maps are case-sensitive
      const inputSlice = input.slice(pos, pos + actualPattern.length);

      const matches = caseSensitive
        ? inputSlice === actualPattern
        : inputSlice.toLowerCase() === actualPattern.toLowerCase();

      if (matches) {
        // Check word boundary constraints
        if (requireStart && !isWordBoundary(pos)) continue;
        if (requireEnd && !isWordEnd(pos + actualPattern.length)) continue;

        output += replacement;
        pos += actualPattern.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Pass through unmatched characters
      output += input[pos];
      pos++;
    }
  }

  if (capitalize && output.length > 0) {
    output = output[0].toUpperCase() + output.slice(1);
  }

  return { output, warnings };
}

/**
 * Get info about what directions are supported for a language
 */
export async function getLanguageCapabilities(langKey: string): Promise<{
  hasR2S: boolean;
  hasS2R: boolean;
  hookWarning: string | null;
  name: string;
}> {
  const maps = await getMergedMaps(langKey);
  const index = await fetchLanguageIndex();
  const entry = index[langKey];

  let hookWarning: string | null = null;
  if (HOOK_DEPENDENT_SCRIPTS.has(langKey)) {
    hookWarning = "This script requires Python hooks; browser-based transliteration has limited support.";
  } else if (S2R_HOOK_SCRIPTS.has(langKey)) {
    hookWarning = "Script-to-Roman for this language uses a Python library; only Roman-to-Script works in-browser.";
  }

  return {
    hasR2S: maps.r2s.length > 0,
    hasS2R: maps.s2r.length > 0,
    hookWarning,
    name: entry?.name || langKey,
  };
}

/**
 * Clear all caches (useful for forced refresh)
 */
export function clearCaches() {
  indexCache.data = null;
  tableCache.clear();
  mergedMapCache.clear();
}
