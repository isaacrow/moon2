/**
 * FEDERATED DISCOVERY PROVIDERS
 * Pluggable source registry for internal + external Linked Data sources
 *
 * Each provider implements a common interface; the discovery layer
 * fans out to all registered providers, merges, deduplicates, and
 * returns unified results tagged with their source origin.
 *
 * Providers:
 *   - InternalKVProvider   (4 KV prefixes — local catalog)
 *   - LOCProvider          (Library of Congress id.loc.gov)
 *   - VIAFProvider         (Virtual International Authority File)
 *   - OpenLibraryProvider  (Open Library / Internet Archive)
 *   - WikidataProvider     (Wikidata)
 *   - WorldcatProvider     (WorldCat)
 *   - FASTProvider         (FAST Subject Headings)
 *   - ISBNDBProvider       (ISBNdb)
 *   - GoogleBooksProvider  (Google Books)
 *   - CrossRefProvider     (CrossRef)
 *   - BNFProvider          (Bibliothèque nationale de France)
 *   - LCSHProvider         (LOC Subject Headings — LCSH)
 *   - LobidGNDProvider     (German National Library — GND via lobid.org)
 *   - ISNIProvider         (International Standard Name Identifier)
 *   - HathiTrustProvider   (HathiTrust Digital Library)
 *   - GettyProvider        (Getty Vocabularies — ULAN/AAT/TGN)
 *   - EuropeanaProvider    (Europeana — European Digital Library)
 *   - DPLAProvider         (Digital Public Library of America)
 *   - ShareVDEProvider     (Share-VDE — Virtual Discovery Environment)
 */

import * as db from "./db.tsx";
const kv = { set: db.kvSet, get: db.kvGet, del: db.kvDel, getByPrefix: db.kvGetByPrefix };

// ===================== TYPES =====================

export interface NormalizedRecord {
  id: string;
  title: string;
  document: any;
  createdAt: string;
  updatedAt: string;
  status: string;
  cataloger: string;
  resourceType: string;
  /** Which provider surfaced this record */
  source: SourceId;
  /** Original external URI (for external sources) */
  sourceUri?: string;
}

export type SourceId =
  | "internal"
  | "loc"
  | "viaf"
  | "openlibrary"
  | "wikidata"
  | "worldcat"
  | "fast"
  | "isbndb"
  | "googlebooks"
  | "crossref"
  | "bnf"
  | "lcsh"
  | "lobidgnd"
  | "isni"
  | "hathitrust"
  | "getty"
  | "europeana"
  | "dpla"
  | "sharevde";

export interface SourceMeta {
  id: SourceId;
  label: string;
  shortLabel: string;
  color: string;     // badge color
  icon: string;      // lucide icon name
  baseUrl: string;
  enabled: boolean;
}

export const SOURCE_META: Record<SourceId, SourceMeta> = {
  internal: {
    id: "internal",
    label: "Local Catalog",
    shortLabel: "Local",
    color: "#3b82f6",
    icon: "Database",
    baseUrl: "",
    enabled: true,
  },
  loc: {
    id: "loc",
    label: "Library of Congress",
    shortLabel: "LOC",
    color: "#dc2626",
    icon: "Building",
    baseUrl: "https://id.loc.gov",
    enabled: true,
  },
  viaf: {
    id: "viaf",
    label: "VIAF (Virtual International Authority File)",
    shortLabel: "VIAF",
    color: "#059669",
    icon: "Globe",
    baseUrl: "https://viaf.org",
    enabled: true,
  },
  openlibrary: {
    id: "openlibrary",
    label: "Open Library",
    shortLabel: "OpenLib",
    color: "#d97706",
    icon: "BookOpen",
    baseUrl: "https://openlibrary.org",
    enabled: true,
  },
  wikidata: {
    id: "wikidata",
    label: "Wikidata",
    shortLabel: "WD",
    color: "#ff9900",
    icon: "Globe",
    baseUrl: "https://www.wikidata.org",
    enabled: true,
  },
  worldcat: {
    id: "worldcat",
    label: "WorldCat",
    shortLabel: "WC",
    color: "#0066cc",
    icon: "BookOpen",
    baseUrl: "https://www.worldcat.org",
    enabled: true,
  },
  fast: {
    id: "fast",
    label: "FAST Subject Headings",
    shortLabel: "FAST",
    color: "#009900",
    icon: "BookOpen",
    baseUrl: "https://fast.oclc.org",
    enabled: true,
  },
  isbndb: {
    id: "isbndb",
    label: "ISBNdb",
    shortLabel: "ISBNdb",
    color: "#6574cd",
    icon: "BookOpen",
    baseUrl: "https://isbndb.com",
    enabled: true,
  },
  googlebooks: {
    id: "googlebooks",
    label: "Google Books",
    shortLabel: "GoogleBooks",
    color: "#4285f4",
    icon: "BookOpen",
    baseUrl: "https://books.google.com",
    enabled: true,
  },
  crossref: {
    id: "crossref",
    label: "CrossRef",
    shortLabel: "CrossRef",
    color: "#000000",
    icon: "BookOpen",
    baseUrl: "https://www.crossref.org",
    enabled: true,
  },
  bnf: {
    id: "bnf",
    label: "Bibliothèque nationale de France",
    shortLabel: "BNF",
    color: "#00539f",
    icon: "BookOpen",
    baseUrl: "https://data.bnf.fr",
    enabled: true,
  },
  lcsh: {
    id: "lcsh",
    label: "LOC Subject Headings — LCSH",
    shortLabel: "LCSH",
    color: "#b91c1c",
    icon: "Tag",
    baseUrl: "https://id.loc.gov/authorities/subjects",
    enabled: true,
  },
  lobidgnd: {
    id: "lobidgnd",
    label: "German National Library — GND via lobid.org",
    shortLabel: "GND",
    color: "#1d4ed8",
    icon: "Building",
    baseUrl: "https://lobid.org/gnd",
    enabled: true,
  },
  isni: {
    id: "isni",
    label: "International Standard Name Identifier",
    shortLabel: "ISNI",
    color: "#7c3aed",
    icon: "User",
    baseUrl: "https://isni.org",
    enabled: true,
  },
  hathitrust: {
    id: "hathitrust",
    label: "HathiTrust Digital Library",
    shortLabel: "HathiTrust",
    color: "#a16207",
    icon: "BookOpen",
    baseUrl: "https://www.hathitrust.org",
    enabled: true,
  },
  getty: {
    id: "getty",
    label: "Getty Vocabularies — ULAN/AAT/TGN",
    shortLabel: "Getty",
    color: "#0d9488",
    icon: "Globe",
    baseUrl: "https://vocab.getty.edu",
    enabled: true,
  },
  europeana: {
    id: "europeana",
    label: "Europeana — European Digital Library",
    shortLabel: "Europeana",
    color: "#0369a1",
    icon: "Globe",
    baseUrl: "https://www.europeana.eu",
    enabled: true,
  },
  dpla: {
    id: "dpla",
    label: "Digital Public Library of America",
    shortLabel: "DPLA",
    color: "#be185d",
    icon: "BookOpen",
    baseUrl: "https://dp.la",
    enabled: true,
  },
  sharevde: {
    id: "sharevde",
    label: "Share-VDE — Virtual Discovery Environment",
    shortLabel: "ShareVDE",
    color: "#4f46e5",
    icon: "Network",
    baseUrl: "https://sharevde.org",
    enabled: true,
  },
};

export interface DiscoveryProvider {
  id: SourceId;
  /** Search this source; return normalized records */
  search(query: string, limit?: number): Promise<NormalizedRecord[]>;
  /** Whether this provider is currently enabled */
  isEnabled(): boolean;
}

// ===================== INTERNAL KV PROVIDER =====================

export class InternalKVProvider implements DiscoveryProvider {
  id: SourceId = "internal";

  isEnabled() { return true; }

  async search(_query: string, _limit = 50): Promise<NormalizedRecord[]> {
    // Fetch from ALL 4 record storage systems in parallel
    const [moonRecords, apiRecords, inlineRecords, engineRecords] = await Promise.all([
      kv.getByPrefix('moon:record:'),
      kv.getByPrefix('record:bibframe:record:'),
      kv.getByPrefix('bibframe:record:'),
      kv.getByPrefix('moon-engine:record:'),
    ]);

    const records: NormalizedRecord[] = [];
    const seenIds = new Set<string>();

    const process = (
      rawList: any[],
      extractor: (parsed: any) => Partial<NormalizedRecord>
    ) => {
      for (const raw of rawList) {
        try {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (!parsed?.id || seenIds.has(parsed.id)) continue;
          seenIds.add(parsed.id);
          records.push({
            id: parsed.id,
            title: '',
            document: null,
            createdAt: '',
            updatedAt: '',
            status: 'draft',
            cataloger: '',
            resourceType: 'Work',
            source: 'internal',
            ...extractor(parsed),
          });
        } catch { continue; }
      }
    };

    // moon:record:*
    process(moonRecords, (p) => ({
      title: p.title || '',
      document: p.document,
      createdAt: p.metadata?.created || p.createdAt || '',
      updatedAt: p.metadata?.modified || p.updatedAt || '',
      status: p.metadata?.status || p.status || 'draft',
      cataloger: p.metadata?.creator || '',
      resourceType: p.resourceType || 'Work',
    }));

    // record:bibframe:record:*
    process(apiRecords, (p) => ({
      title: p.title || '',
      document: p.graphJson || p.document,
      createdAt: p.createdAt || '',
      updatedAt: p.updatedAt || '',
      status: p.status || 'draft',
      cataloger: p.createdBy || p.lastModifiedBy || '',
      resourceType: p.resourceType || 'Work',
    }));

    // bibframe:record:*
    process(inlineRecords, (p) => ({
      title: p.title || '',
      document: p.document,
      createdAt: p.saved || '',
      updatedAt: p.saved || '',
    }));

    // moon-engine:record:*
    process(engineRecords, (p) => ({
      title: p.title || '',
      document: p.document,
      createdAt: p.saved || '',
      updatedAt: p.saved || '',
    }));

    return records;
  }
}

// ===================== LOC PROVIDER =====================

export class LOCProvider implements DiscoveryProvider {
  id: SourceId = "loc";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const url = `https://id.loc.gov/search/?q=${encodeURIComponent(query)}&q=cs%3Ahttp%3A%2F%2Fid.loc.gov%2Fauthorities%2Fnames&format=atom&count=${limit}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const text = await res.text();
      return this.parseAtomFeed(text);
    } catch (err) {
      console.log('[LOC Provider] Search error:', err);
      return [];
    }
  }

  private parseAtomFeed(xml: string): NormalizedRecord[] {
    const records: NormalizedRecord[] = [];
    // Simple regex-based Atom parsing (no XML parser in Deno edge)
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const title = this.extractTag(entry, 'title') || 'Unknown';
      const id = this.extractTag(entry, 'id') || `loc-${Date.now()}-${Math.random()}`;
      const updated = this.extractTag(entry, 'updated') || '';
      const linkMatch = entry.match(/<link[^>]+href="([^"]+)"/);
      const uri = linkMatch?.[1] || id;

      records.push({
        id: `loc:${encodeURIComponent(uri)}`,
        title,
        document: {
          '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
          '@graph': [
            {
              '@id': uri,
              '@type': ['bf:Work'],
              'bf:title': { '@type': 'bf:Title', 'bf:mainTitle': title },
            }
          ]
        },
        createdAt: updated,
        updatedAt: updated,
        status: 'published',
        cataloger: 'Library of Congress',
        resourceType: 'Work',
        source: 'loc',
        sourceUri: uri,
      });
    }
    return records;
  }

  private extractTag(xml: string, tag: string): string | null {
    const re = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`);
    const m = xml.match(re);
    return m ? m[1].trim() : null;
  }
}

// ===================== VIAF PROVIDER =====================

export class VIAFProvider implements DiscoveryProvider {
  id: SourceId = "viaf";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const url = `https://viaf.org/viaf/AutoSuggest?query=${encodeURIComponent(query)}&count=${limit}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const data = await res.json();
      if (!data?.result) return [];

      return data.result.slice(0, limit).map((item: any) => {
        const viafId = item.viafid || item.recordID || `${Date.now()}`;
        const uri = `https://viaf.org/viaf/${viafId}`;
        const label = item.displayForm || item.term || 'Unknown';
        const nameType = item.nametype || 'personal';

        return {
          id: `viaf:${viafId}`,
          title: label,
          document: {
            '@context': {
              'bf': 'http://id.loc.gov/ontologies/bibframe/',
              'schema': 'http://schema.org/',
            },
            '@graph': [
              {
                '@id': uri,
                '@type': nameType === 'corporate' ? ['bf:Organization'] : ['bf:Person'],
                'rdfs:label': label,
                'schema:name': label,
                'bf:identifiedBy': { '@type': 'bf:Identifier', 'rdf:value': viafId },
              }
            ]
          },
          createdAt: '',
          updatedAt: '',
          status: 'published',
          cataloger: 'VIAF',
          resourceType: nameType === 'corporate' ? 'Organization' : 'Person',
          source: 'viaf' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[VIAF Provider] Search error:', err);
      return [];
    }
  }
}

// ===================== OPEN LIBRARY PROVIDER =====================

export class OpenLibraryProvider implements DiscoveryProvider {
  id: SourceId = "openlibrary";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,first_publish_year,language,subject,isbn,cover_i`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const data = await res.json();
      if (!data?.docs) return [];

      return data.docs.slice(0, limit).map((doc: any) => {
        const olKey = doc.key || `/works/OL${Date.now()}W`;
        const uri = `https://openlibrary.org${olKey}`;
        const title = doc.title || 'Unknown';
        const authors = doc.author_name || [];
        const year = doc.first_publish_year;
        const languages = (doc.language || []).slice(0, 3);
        const subjects = (doc.subject || []).slice(0, 5);

        const graph: any[] = [
          {
            '@id': uri,
            '@type': ['bf:Work'],
            'bf:title': { '@type': 'bf:Title', 'bf:mainTitle': title },
            ...(languages.length > 0 ? { 'bf:language': { '@id': `http://id.loc.gov/vocabulary/languages/${languages[0]}`, 'rdfs:label': languages[0] } } : {}),
            ...(subjects.length > 0 ? { 'bf:subject': subjects.map((s: string) => ({ 'rdfs:label': s })) } : {}),
          },
        ];

        // Add contributions
        authors.forEach((name: string) => {
          graph.push({
            '@type': ['bf:Contribution'],
            'bf:agent': { '@type': 'bf:Person', 'rdfs:label': name },
            'bf:role': { '@id': 'http://id.loc.gov/vocabulary/relators/aut', 'rdfs:label': 'Author' },
          });
        });

        // Add ProvisionActivity
        if (year) {
          graph.push({
            '@type': ['bf:ProvisionActivity', 'bf:Publication'],
            'bf:date': String(year),
          });
        }

        // Add Instance with ISBN
        if (doc.isbn?.length > 0) {
          graph.push({
            '@id': `${uri}/instance`,
            '@type': ['bf:Instance'],
            'bf:instanceOf': { '@id': uri },
            'bf:identifiedBy': {
              '@type': 'bf:Isbn',
              'rdf:value': doc.isbn[0],
            },
          });
        }

        return {
          id: `ol:${olKey.replace(/\//g, '-')}`,
          title,
          document: {
            '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
            '@graph': graph,
          },
          createdAt: year ? `${year}-01-01` : '',
          updatedAt: '',
          status: 'published',
          cataloger: 'Open Library',
          resourceType: 'Work',
          source: 'openlibrary' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[OpenLibrary Provider] Search error:', err);
      return [];
    }
  }
}

// ===================== WIKIDATA PROVIDER =====================

export class WikidataProvider implements DiscoveryProvider {
  id: SourceId = "wikidata";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      // Use Wikidata wbsearchentities API for fast auto-complete style search
      const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&limit=${limit}&format=json&origin=*`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const data = await res.json();
      if (!data?.search?.length) return [];

      // For each entity, fetch basic claims in parallel (P31=instance of, P50=author, P577=publication date)
      const entities = data.search.slice(0, limit);
      const qids = entities.map((e: any) => e.id).join('|');
      const detailUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qids}&props=labels|descriptions|claims&languages=en|ar&format=json&origin=*`;
      const detailController = new AbortController();
      const detailTimeout = setTimeout(() => detailController.abort(), 8000);
      const detailRes = await fetch(detailUrl, { signal: detailController.signal });
      clearTimeout(detailTimeout);

      let detailData: any = null;
      if (detailRes.ok) {
        detailData = await detailRes.json();
      }

      return entities.map((entity: any) => {
        const qid = entity.id;
        const uri = `https://www.wikidata.org/entity/${qid}`;
        const label = entity.label || entity.display?.label?.value || 'Unknown';
        const description = entity.description || entity.display?.description?.value || '';

        const graph: any[] = [];
        const detail = detailData?.entities?.[qid];

        // Determine BIBFRAME type from P31 (instance of)
        let bfType = 'bf:Work';
        let resourceType = 'Work';
        const p31 = detail?.claims?.P31;
        if (p31) {
          const instanceIds = p31.map((c: any) => c?.mainsnak?.datavalue?.value?.id).filter(Boolean);
          // Q5=human, Q215627=person => Person
          if (instanceIds.some((id: string) => ['Q5', 'Q215627'].includes(id))) {
            bfType = 'bf:Person';
            resourceType = 'Person';
          }
          // Q43229=organization
          else if (instanceIds.some((id: string) => ['Q43229', 'Q4830453', 'Q7278'].includes(id))) {
            bfType = 'bf:Organization';
            resourceType = 'Organization';
          }
          // Q571=book, Q7725634=literary work, Q47461344=written work
          else if (instanceIds.some((id: string) => ['Q571', 'Q7725634', 'Q47461344', 'Q386724'].includes(id))) {
            bfType = 'bf:Work';
            resourceType = 'Work';
          }
          // Q11424=film, Q5398426=television series
          else if (instanceIds.some((id: string) => ['Q11424', 'Q5398426', 'Q24856'].includes(id))) {
            bfType = 'bf:MovingImage';
            resourceType = 'MovingImage';
          }
        }

        // Main entity node
        const mainNode: any = {
          '@id': uri,
          '@type': [bfType],
          'rdfs:label': label,
          'bf:title': { '@type': 'bf:Title', 'bf:mainTitle': label },
        };
        if (description) {
          mainNode['bf:summary'] = { 'rdfs:label': description };
        }

        // Add VIAF/LOC identifiers if present
        const p214 = detail?.claims?.P214; // VIAF ID
        if (p214?.[0]?.mainsnak?.datavalue?.value) {
          mainNode['bf:identifiedBy'] = [
            { '@type': 'bf:Identifier', 'rdf:value': `VIAF:${p214[0].mainsnak.datavalue.value}` }
          ];
        }

        graph.push(mainNode);

        // Extract authors (P50)
        const p50 = detail?.claims?.P50;
        if (p50) {
          for (const claim of p50.slice(0, 5)) {
            const authorId = claim?.mainsnak?.datavalue?.value?.id;
            if (authorId) {
              graph.push({
                '@type': ['bf:Contribution'],
                'bf:agent': {
                  '@id': `https://www.wikidata.org/entity/${authorId}`,
                  '@type': 'bf:Person',
                  'rdfs:label': authorId,
                },
                'bf:role': { '@id': 'http://id.loc.gov/vocabulary/relators/aut', 'rdfs:label': 'Author' },
              });
            }
          }
        }

        // Extract publication date (P577)
        const p577 = detail?.claims?.P577;
        if (p577?.[0]?.mainsnak?.datavalue?.value?.time) {
          const timeStr = p577[0].mainsnak.datavalue.value.time; // e.g. "+1997-06-26T00:00:00Z"
          const year = timeStr.match(/([+-]?\d{4})/)?.[1] || '';
          if (year) {
            graph.push({
              '@type': ['bf:ProvisionActivity', 'bf:Publication'],
              'bf:date': year,
            });
          }
        }

        // Extract subjects (P921 = main subject)
        const p921 = detail?.claims?.P921;
        if (p921) {
          const subjects = p921.slice(0, 5).map((claim: any) => {
            const subjId = claim?.mainsnak?.datavalue?.value?.id;
            return subjId ? { '@id': `https://www.wikidata.org/entity/${subjId}`, 'rdfs:label': subjId } : null;
          }).filter(Boolean);
          if (subjects.length > 0) {
            mainNode['bf:subject'] = subjects;
          }
        }

        // Extract language (P407 = language of work)
        const p407 = detail?.claims?.P407;
        if (p407?.[0]?.mainsnak?.datavalue?.value?.id) {
          const langId = p407[0].mainsnak.datavalue.value.id;
          // Map common Wikidata language QIDs to ISO codes
          const langMap: Record<string, string> = {
            'Q1860': 'eng', 'Q7850': 'zho', 'Q9027': 'heb',
            'Q13955': 'ara', 'Q150': 'fra', 'Q188': 'deu',
            'Q1321': 'spa', 'Q652': 'ita', 'Q7737': 'rus',
            'Q5287': 'jpn', 'Q9176': 'kor', 'Q5146': 'por',
            'Q36510': 'urd', 'Q9610': 'ben', 'Q1568': 'hin',
          };
          const isoCode = langMap[langId] || langId;
          mainNode['bf:language'] = { '@id': `http://id.loc.gov/vocabulary/languages/${isoCode}`, 'rdfs:label': isoCode };
        }

        return {
          id: `wd:${qid}`,
          title: label,
          document: {
            '@context': {
              'bf': 'http://id.loc.gov/ontologies/bibframe/',
              'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
              'schema': 'http://schema.org/',
            },
            '@graph': graph,
          },
          createdAt: '',
          updatedAt: '',
          status: 'published',
          cataloger: 'Wikidata',
          resourceType,
          source: 'wikidata' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[Wikidata Provider] Search error:', err);
      return [];
    }
  }
}

// ===================== WORLDCAT PROVIDER =====================

export class WorldCatProvider implements DiscoveryProvider {
  id: SourceId = "worldcat";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      // Use WorldCat search API (public SRU endpoint — returns MARCXML via Atom)
      const url = `https://www.worldcat.org/webservices/catalog/search/worldcat/opensearch?q=${encodeURIComponent(query)}&count=${limit}&format=atom`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/atom+xml' },
      });
      clearTimeout(timeout);

      if (!res.ok) {
        // Fallback: try WorldCat search.worldcat.org JSON-like endpoint
        return this.searchFallback(query, limit);
      }

      const text = await res.text();
      return this.parseAtomResults(text);
    } catch (err) {
      console.log('[WorldCat Provider] Primary search error, trying fallback:', err);
      return this.searchFallback(query, limit);
    }
  }

  private async searchFallback(query: string, limit: number): Promise<NormalizedRecord[]> {
    try {
      // Fallback: search.worldcat.org provides OpenSearch results
      const url = `https://search.worldcat.org/api/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=0&itemType=book`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const data = await res.json();
      const items = data?.briefRecords || data?.docs || data?.results || [];
      if (!Array.isArray(items) || items.length === 0) return [];

      return items.slice(0, limit).map((item: any) => {
        const oclcNumber = item.oclcNumber || item.oclc || item.id || `wc-${Date.now()}-${Math.random()}`;
        const uri = `https://www.worldcat.org/oclc/${oclcNumber}`;
        const title = item.title || item.name || 'Unknown';
        const authors = item.creator || item.author || item.contributors || [];
        const authorList = Array.isArray(authors) ? authors : (authors ? [authors] : []);
        const year = item.date || item.datePublished || '';
        const language = item.language || item.inLanguage || '';

        const graph: any[] = [
          {
            '@id': uri,
            '@type': ['bf:Work'],
            'bf:title': { '@type': 'bf:Title', 'bf:mainTitle': title },
            ...(language ? { 'bf:language': { 'rdfs:label': language } } : {}),
          }
        ];

        // Authors
        authorList.forEach((name: any) => {
          const authorName = typeof name === 'object' ? (name.name || name.label || '') : String(name);
          if (authorName) {
            graph.push({
              '@type': ['bf:Contribution'],
              'bf:agent': { '@type': 'bf:Person', 'rdfs:label': authorName },
              'bf:role': { 'rdfs:label': 'Author' },
            });
          }
        });

        // Publication date
        if (year) {
          graph.push({
            '@type': ['bf:ProvisionActivity', 'bf:Publication'],
            'bf:date': String(year),
          });
        }

        // Instance with OCLC identifier
        graph.push({
          '@id': `${uri}/instance`,
          '@type': ['bf:Instance'],
          'bf:instanceOf': { '@id': uri },
          'bf:identifiedBy': {
            '@type': 'bf:Identifier',
            'rdf:value': `OCLC:${oclcNumber}`,
          },
        });

        return {
          id: `wc:${oclcNumber}`,
          title,
          document: {
            '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
            '@graph': graph,
          },
          createdAt: year ? `${year}-01-01` : '',
          updatedAt: '',
          status: 'published',
          cataloger: 'WorldCat / OCLC',
          resourceType: 'Work',
          source: 'worldcat' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[WorldCat Provider] Fallback search error:', err);
      return [];
    }
  }

  private parseAtomResults(xml: string): NormalizedRecord[] {
    const records: NormalizedRecord[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const title = this.extractTag(entry, 'title') || 'Unknown';
      const id = this.extractTag(entry, 'id') || `wc-${Date.now()}-${Math.random()}`;
      const updated = this.extractTag(entry, 'updated') || '';
      const author = this.extractTag(entry, 'author') || this.extractTag(entry, 'name') || '';

      // Extract OCLC number from ID
      const oclcMatch = id.match(/(\d{5,})/);
      const oclcNumber = oclcMatch?.[1] || id;
      const uri = `https://www.worldcat.org/oclc/${oclcNumber}`;

      const graph: any[] = [
        {
          '@id': uri,
          '@type': ['bf:Work'],
          'bf:title': { '@type': 'bf:Title', 'bf:mainTitle': title },
        }
      ];

      if (author) {
        graph.push({
          '@type': ['bf:Contribution'],
          'bf:agent': { '@type': 'bf:Person', 'rdfs:label': author },
          'bf:role': { 'rdfs:label': 'Author' },
        });
      }

      records.push({
        id: `wc:${oclcNumber}`,
        title,
        document: {
          '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
          '@graph': graph,
        },
        createdAt: updated,
        updatedAt: updated,
        status: 'published',
        cataloger: 'WorldCat / OCLC',
        resourceType: 'Work',
        source: 'worldcat' as SourceId,
        sourceUri: uri,
      });
    }
    return records;
  }

  private extractTag(xml: string, tag: string): string | null {
    const re = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`);
    const m = xml.match(re);
    return m ? m[1].trim() : null;
  }
}

// ===================== OCLC FAST PROVIDER =====================

export class FASTProvider implements DiscoveryProvider {
  id: SourceId = "fast";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      // OCLC FAST autoSuggest API (publicly accessible)
      const url = `https://fast.oclc.org/searchfast/fastsuggest?query=${encodeURIComponent(query)}&queryIndex=suggestall&queryReturn=suggestall%2Cidroot%2Cauth%2Ctag%2Ctype%2Cbreaker&suggest=autoSubject&rows=${limit}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const data = await res.json();
      const docs = data?.response?.docs;
      if (!docs || !Array.isArray(docs) || docs.length === 0) return [];

      return docs.slice(0, limit).map((doc: any) => {
        const fastId = doc.idroot || doc.id || `fast-${Date.now()}-${Math.random()}`;
        const cleanId = String(fastId).replace(/^fst0*/, '');
        const uri = `https://id.worldcat.org/fast/${cleanId}`;
        const label = doc.auth || doc.suggestall?.[0] || 'Unknown';
        const tag = doc.tag || '';
        const type = doc.type || '';

        // Map FAST tag codes to BIBFRAME types
        let bfType = 'bf:Topic';
        let resourceType = 'Topic';
        switch (tag) {
          case '100': case '700': bfType = 'bf:Person'; resourceType = 'Person'; break;
          case '110': case '710': bfType = 'bf:Organization'; resourceType = 'Organization'; break;
          case '111': case '711': bfType = 'bf:Meeting'; resourceType = 'Meeting'; break;
          case '130': case '730': bfType = 'bf:Work'; resourceType = 'Work'; break;
          case '150': case '550': bfType = 'bf:Topic'; resourceType = 'Topic'; break;
          case '151': case '551': bfType = 'bf:Place'; resourceType = 'Place'; break;
          case '155': case '555': bfType = 'bf:GenreForm'; resourceType = 'GenreForm'; break;
          case '148': case '548': bfType = 'bf:Temporal'; resourceType = 'Temporal'; break;
        }

        const mainNode: any = {
          '@id': uri,
          '@type': [bfType],
          'rdfs:label': label,
          'bf:identifiedBy': {
            '@type': 'bf:Identifier',
            'rdf:value': `FAST:${cleanId}`,
          },
        };

        // Add LCSH equivalent link if available
        const lcshId = doc.lccn;
        if (lcshId) {
          mainNode['owl:sameAs'] = { '@id': `http://id.loc.gov/authorities/subjects/${lcshId}` };
        }

        // Add broader/narrower terms if present in response
        if (doc.breaker) {
          mainNode['bf:source'] = { 'rdfs:label': doc.breaker };
        }

        return {
          id: `fast:${cleanId}`,
          title: label,
          document: {
            '@context': {
              'bf': 'http://id.loc.gov/ontologies/bibframe/',
              'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
              'owl': 'http://www.w3.org/2002/07/owl#',
            },
            '@graph': [mainNode],
          },
          createdAt: '',
          updatedAt: '',
          status: 'published',
          cataloger: 'OCLC FAST',
          resourceType,
          source: 'fast' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[FAST Provider] Search error:', err);
      return [];
    }
  }
}

// ===================== ISBNDB PROVIDER =====================

export class ISBNdbProvider implements DiscoveryProvider {
  id: SourceId = "isbndb";

  isEnabled() {
    return !!Deno.env.get('ISBNDB_API_KEY');
  }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    const apiKey = Deno.env.get('ISBNDB_API_KEY');
    if (!apiKey) return [];
    try {
      const url = `https://api2.isbndb.com/books/${encodeURIComponent(query)}?page=1&pageSize=${limit}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Authorization': apiKey,
          'Accept': 'application/json',
        },
      });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const data = await res.json();
      if (!data?.books?.length) return [];

      return data.books.slice(0, limit).map((book: any) => {
        const isbn13 = book.isbn13 || book.isbn || `isbndb-${Date.now()}`;
        const isbn10 = book.isbn || '';
        const uri = `https://isbndb.com/book/${isbn13}`;
        const title = book.title || 'Unknown';
        const authors = book.authors || [];
        const publisher = book.publisher || '';
        const year = book.date_published ? book.date_published.substring(0, 4) : '';
        const language = book.language || '';
        const pages = book.pages || 0;
        const subjects = (book.subjects || []).slice(0, 5);
        const synopsis = book.synopsis || book.overview || '';

        const graph: any[] = [];

        // Work node
        const workNode: any = {
          '@id': uri,
          '@type': ['bf:Work'],
          'bf:title': { '@type': 'bf:Title', 'bf:mainTitle': title },
        };
        if (language) {
          workNode['bf:language'] = { 'rdfs:label': language };
        }
        if (subjects.length > 0) {
          workNode['bf:subject'] = subjects.map((s: string) => ({ 'rdfs:label': s }));
        }
        if (synopsis) {
          workNode['bf:summary'] = { 'rdfs:label': synopsis.substring(0, 500) };
        }
        graph.push(workNode);

        // Contributors
        authors.forEach((name: string) => {
          graph.push({
            '@type': ['bf:Contribution'],
            'bf:agent': { '@type': 'bf:Person', 'rdfs:label': name },
            'bf:role': { '@id': 'http://id.loc.gov/vocabulary/relators/aut', 'rdfs:label': 'Author' },
          });
        });

        // Publication
        if (year) {
          graph.push({
            '@type': ['bf:ProvisionActivity', 'bf:Publication'],
            'bf:date': year,
            ...(publisher ? { 'bf:agent': { '@type': 'bf:Organization', 'rdfs:label': publisher } } : {}),
          });
        }

        // Instance with ISBN identifiers
        const instanceNode: any = {
          '@id': `${uri}/instance`,
          '@type': ['bf:Instance'],
          'bf:instanceOf': { '@id': uri },
          'bf:identifiedBy': [],
        };
        if (isbn13) {
          instanceNode['bf:identifiedBy'].push({ '@type': 'bf:Isbn', 'rdf:value': isbn13 });
        }
        if (isbn10 && isbn10 !== isbn13) {
          instanceNode['bf:identifiedBy'].push({ '@type': 'bf:Isbn', 'rdf:value': isbn10 });
        }
        if (pages > 0) {
          instanceNode['bf:extent'] = { 'rdfs:label': `${pages} pages` };
        }
        graph.push(instanceNode);

        return {
          id: `isbndb:${isbn13}`,
          title,
          document: {
            '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
            '@graph': graph,
          },
          createdAt: year ? `${year}-01-01` : '',
          updatedAt: '',
          status: 'published',
          cataloger: 'ISBNdb',
          resourceType: 'Work',
          source: 'isbndb' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[ISBNdb Provider] Search error:', err);
      return [];
    }
  }
}

// ===================== GOOGLE BOOKS PROVIDER =====================

export class GoogleBooksProvider implements DiscoveryProvider {
  id: SourceId = "googlebooks";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${Math.min(limit, 40)}&printType=all`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const data = await res.json();
      if (!data?.items?.length) return [];

      return data.items.slice(0, limit).map((item: any) => {
        const vol = item.volumeInfo || {};
        const gbId = item.id;
        const uri = `https://books.google.com/books?id=${gbId}`;
        const title = vol.title || 'Unknown';
        const subtitle = vol.subtitle || '';
        const fullTitle = subtitle ? `${title}: ${subtitle}` : title;
        const authors = vol.authors || [];
        const publisher = vol.publisher || '';
        const publishedDate = vol.publishedDate || '';
        const year = publishedDate.substring(0, 4);
        const language = vol.language || '';
        const categories = (vol.categories || []).slice(0, 5);
        const pageCount = vol.pageCount || 0;
        const description = vol.description || '';
        const isbn13 = vol.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier || '';
        const isbn10 = vol.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier || '';

        const graph: any[] = [];

        // Work node
        const workNode: any = {
          '@id': uri,
          '@type': ['bf:Work'],
          'bf:title': { '@type': 'bf:Title', 'bf:mainTitle': fullTitle },
        };
        if (language) {
          workNode['bf:language'] = { 'rdfs:label': language };
        }
        if (categories.length > 0) {
          workNode['bf:subject'] = categories.map((c: string) => ({ 'rdfs:label': c }));
        }
        if (description) {
          workNode['bf:summary'] = { 'rdfs:label': description.substring(0, 500) };
        }
        graph.push(workNode);

        // Contributors
        authors.forEach((name: string) => {
          graph.push({
            '@type': ['bf:Contribution'],
            'bf:agent': { '@type': 'bf:Person', 'rdfs:label': name },
            'bf:role': { '@id': 'http://id.loc.gov/vocabulary/relators/aut', 'rdfs:label': 'Author' },
          });
        });

        // Publication
        if (year) {
          graph.push({
            '@type': ['bf:ProvisionActivity', 'bf:Publication'],
            'bf:date': year,
            ...(publisher ? { 'bf:agent': { '@type': 'bf:Organization', 'rdfs:label': publisher } } : {}),
          });
        }

        // Instance
        const identifiers: any[] = [];
        if (isbn13) identifiers.push({ '@type': 'bf:Isbn', 'rdf:value': isbn13 });
        if (isbn10) identifiers.push({ '@type': 'bf:Isbn', 'rdf:value': isbn10 });
        identifiers.push({ '@type': 'bf:Identifier', 'rdf:value': `GoogleBooks:${gbId}` });

        const instanceNode: any = {
          '@id': `${uri}/instance`,
          '@type': ['bf:Instance'],
          'bf:instanceOf': { '@id': uri },
          'bf:identifiedBy': identifiers,
        };
        if (pageCount > 0) {
          instanceNode['bf:extent'] = { 'rdfs:label': `${pageCount} pages` };
        }
        graph.push(instanceNode);

        return {
          id: `gb:${gbId}`,
          title: fullTitle,
          document: {
            '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
            '@graph': graph,
          },
          createdAt: publishedDate || '',
          updatedAt: '',
          status: 'published',
          cataloger: 'Google Books',
          resourceType: 'Work',
          source: 'googlebooks' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[GoogleBooks Provider] Search error:', err);
      return [];
    }
  }
}

// ===================== CROSSREF PROVIDER =====================

export class CrossRefProvider implements DiscoveryProvider {
  id: SourceId = "crossref";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${limit}&select=DOI,title,author,published-print,published-online,container-title,type,subject,publisher,language,abstract`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'MoonSandV2/1.0 (mailto:admin@moonlib.org)',
        },
      });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const data = await res.json();
      const items = data?.message?.items;
      if (!items?.length) return [];

      return items.slice(0, limit).map((item: any) => {
        const doi = item.DOI || `crossref-${Date.now()}`;
        const uri = `https://doi.org/${doi}`;
        const title = Array.isArray(item.title) ? item.title[0] : (item.title || 'Unknown');
        const authors = (item.author || []).map((a: any) => {
          const parts = [a.given, a.family].filter(Boolean);
          return parts.join(' ') || 'Unknown';
        });
        const pubDate = item['published-print']?.['date-parts']?.[0] || item['published-online']?.['date-parts']?.[0] || [];
        const year = pubDate[0] ? String(pubDate[0]) : '';
        const containerTitle = Array.isArray(item['container-title']) ? item['container-title'][0] : '';
        const publisher = item.publisher || '';
        const subjects = (item.subject || []).slice(0, 5);
        const language = item.language || '';
        const abstract = item.abstract || '';
        const crType = item.type || 'journal-article';

        // Map CrossRef types to BIBFRAME
        let bfType = 'bf:Work';
        let resourceType = 'Work';
        if (crType === 'book' || crType === 'monograph') { resourceType = 'Work'; }
        else if (crType === 'journal-article') { resourceType = 'Article'; }
        else if (crType === 'proceedings-article') { resourceType = 'Article'; }
        else if (crType === 'dissertation') { resourceType = 'Dissertation'; }

        const graph: any[] = [];

        // Work node
        const workNode: any = {
          '@id': uri,
          '@type': [bfType],
          'bf:title': { '@type': 'bf:Title', 'bf:mainTitle': title },
          'bf:identifiedBy': { '@type': 'bf:Doi', 'rdf:value': doi },
        };
        if (language) workNode['bf:language'] = { 'rdfs:label': language };
        if (subjects.length > 0) workNode['bf:subject'] = subjects.map((s: string) => ({ 'rdfs:label': s }));
        if (abstract) workNode['bf:summary'] = { 'rdfs:label': abstract.replace(/<[^>]*>/g, '').substring(0, 500) };
        if (containerTitle) workNode['bf:partOf'] = { '@type': 'bf:Work', 'bf:title': { 'bf:mainTitle': containerTitle } };
        graph.push(workNode);

        // Contributors
        authors.forEach((name: string) => {
          graph.push({
            '@type': ['bf:Contribution'],
            'bf:agent': { '@type': 'bf:Person', 'rdfs:label': name },
            'bf:role': { '@id': 'http://id.loc.gov/vocabulary/relators/aut', 'rdfs:label': 'Author' },
          });
        });

        // Publication
        if (year) {
          graph.push({
            '@type': ['bf:ProvisionActivity', 'bf:Publication'],
            'bf:date': year,
            ...(publisher ? { 'bf:agent': { '@type': 'bf:Organization', 'rdfs:label': publisher } } : {}),
          });
        }

        return {
          id: `cr:${doi.replace(/\//g, '-')}`,
          title,
          document: {
            '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
            '@graph': graph,
          },
          createdAt: year ? `${year}-01-01` : '',
          updatedAt: '',
          status: 'published',
          cataloger: 'CrossRef',
          resourceType,
          source: 'crossref' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[CrossRef Provider] Search error:', err);
      return [];
    }
  }
}

// ===================== BNF PROVIDER =====================

export class BNFProvider implements DiscoveryProvider {
  id: SourceId = "bnf";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      // BNF SRU endpoint (publicly accessible)
      const url = `https://catalogue.bnf.fr/api/SRU?version=1.2&operation=searchRetrieve&query=bib.anywhere+all+"${encodeURIComponent(query)}"&recordSchema=dublincore&maximumRecords=${limit}&startRecord=1`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/xml' },
      });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const xml = await res.text();
      return this.parseSRUResponse(xml);
    } catch (err) {
      console.log('[BNF Provider] Search error:', err);
      return [];
    }
  }

  private parseSRUResponse(xml: string): NormalizedRecord[] {
    const records: NormalizedRecord[] = [];
    // Parse Dublin Core records from SRU response
    const recordRegex = /<srw:record>([\s\S]*?)<\/srw:record>/g;
    let match;
    while ((match = recordRegex.exec(xml)) !== null) {
      const entry = match[1];
      const title = this.extractDCTag(entry, 'dc:title') || this.extractDCTag(entry, 'title') || 'Unknown';
      const creator = this.extractDCTag(entry, 'dc:creator') || this.extractDCTag(entry, 'creator') || '';
      const date = this.extractDCTag(entry, 'dc:date') || this.extractDCTag(entry, 'date') || '';
      const identifier = this.extractDCTag(entry, 'dc:identifier') || this.extractDCTag(entry, 'identifier') || '';
      const language = this.extractDCTag(entry, 'dc:language') || this.extractDCTag(entry, 'language') || '';
      const subject = this.extractDCTag(entry, 'dc:subject') || this.extractDCTag(entry, 'subject') || '';
      const publisher = this.extractDCTag(entry, 'dc:publisher') || this.extractDCTag(entry, 'publisher') || '';
      const description = this.extractDCTag(entry, 'dc:description') || this.extractDCTag(entry, 'description') || '';

      // Extract BNF ARK identifier
      const arkMatch = identifier.match(/(ark:\/12148\/\w+)/);
      const ark = arkMatch?.[1] || identifier;
      const uri = ark.startsWith('ark:') ? `https://catalogue.bnf.fr/${ark}` : `https://catalogue.bnf.fr/ark:/12148/${Date.now()}`;
      const bnfId = ark.replace(/[:/]/g, '-');

      const graph: any[] = [];

      // Work node
      const workNode: any = {
        '@id': uri,
        '@type': ['bf:Work'],
        'bf:title': { '@type': 'bf:Title', 'bf:mainTitle': title },
      };
      if (language) workNode['bf:language'] = { 'rdfs:label': language };
      if (subject) workNode['bf:subject'] = [{ 'rdfs:label': subject }];
      if (description) workNode['bf:summary'] = { 'rdfs:label': description.substring(0, 500) };
      graph.push(workNode);

      // Contributor
      if (creator) {
        graph.push({
          '@type': ['bf:Contribution'],
          'bf:agent': { '@type': 'bf:Person', 'rdfs:label': creator },
          'bf:role': { '@id': 'http://id.loc.gov/vocabulary/relators/aut', 'rdfs:label': 'Author' },
        });
      }

      // Publication
      const year = date.substring(0, 4);
      if (year) {
        graph.push({
          '@type': ['bf:ProvisionActivity', 'bf:Publication'],
          'bf:date': year,
          ...(publisher ? { 'bf:agent': { '@type': 'bf:Organization', 'rdfs:label': publisher } } : {}),
        });
      }

      records.push({
        id: `bnf:${bnfId}`,
        title,
        document: {
          '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
          '@graph': graph,
        },
        createdAt: date,
        updatedAt: '',
        status: 'published',
        cataloger: 'BNF',
        resourceType: 'Work',
        source: 'bnf' as SourceId,
        sourceUri: uri,
      });
    }
    return records;
  }

  private extractDCTag(xml: string, tag: string): string | null {
    const re = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`);
    const m = xml.match(re);
    return m ? m[1].trim() : null;
  }
}

// ===================== LOC SUBJECTS (LCSH) PROVIDER =====================

export class LCSHProvider implements DiscoveryProvider {
  id: SourceId = "lcsh";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const url = `https://id.loc.gov/authorities/subjects/suggest2?q=${encodeURIComponent(query)}&count=${limit}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeout);
      if (!res.ok) {
        // Fallback to Atom feed
        return this.searchAtom(query, limit);
      }

      const data = await res.json();
      // suggest2 returns { hits: [{ uri, aLabel, vLabel, ... }] }
      const hits = data?.hits || [];
      if (hits.length === 0) return this.searchAtom(query, limit);

      return hits.slice(0, limit).map((hit: any) => {
        const uri = hit.uri || '';
        const label = hit.aLabel || hit.suggestLabel || hit.vLabel || 'Unknown';
        const lcshId = uri.split('/').pop() || `lcsh-${Date.now()}`;

        return {
          id: `lcsh:${lcshId}`,
          title: label,
          document: {
            '@context': {
              'bf': 'http://id.loc.gov/ontologies/bibframe/',
              'madsrdf': 'http://www.loc.gov/mads/rdf/v1#',
            },
            '@graph': [{
              '@id': uri,
              '@type': ['madsrdf:Topic', 'bf:Topic'],
              'rdfs:label': label,
              'madsrdf:authoritativeLabel': label,
              'bf:source': { '@id': 'http://id.loc.gov/authorities/subjects', 'rdfs:label': 'LCSH' },
            }],
          },
          createdAt: '',
          updatedAt: '',
          status: 'published',
          cataloger: 'Library of Congress — LCSH',
          resourceType: 'Topic',
          source: 'lcsh' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[LCSH Provider] Search error:', err);
      return [];
    }
  }

  private async searchAtom(query: string, limit: number): Promise<NormalizedRecord[]> {
    try {
      const url = `https://id.loc.gov/search/?q=${encodeURIComponent(query)}&q=cs%3Ahttp%3A%2F%2Fid.loc.gov%2Fauthorities%2Fsubjects&format=atom&count=${limit}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const text = await res.text();
      const records: NormalizedRecord[] = [];
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      let match;
      while ((match = entryRegex.exec(text)) !== null) {
        const entry = match[1];
        const titleMatch = entry.match(/<title[^>]*>([^<]*)<\/title>/);
        const title = titleMatch?.[1]?.trim() || 'Unknown';
        const linkMatch = entry.match(/<link[^>]+href="([^"]+)"/);
        const uri = linkMatch?.[1] || '';
        const lcshId = uri.split('/').pop() || `lcsh-${Date.now()}-${Math.random()}`;

        records.push({
          id: `lcsh:${lcshId}`,
          title,
          document: {
            '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
            '@graph': [{
              '@id': uri,
              '@type': ['bf:Topic'],
              'rdfs:label': title,
              'bf:source': { 'rdfs:label': 'LCSH' },
            }],
          },
          createdAt: '',
          updatedAt: '',
          status: 'published',
          cataloger: 'Library of Congress — LCSH',
          resourceType: 'Topic',
          source: 'lcsh' as SourceId,
          sourceUri: uri,
        });
      }
      return records;
    } catch { return []; }
  }
}

// ===================== LOBID GND PROVIDER =====================

export class LobidGNDProvider implements DiscoveryProvider {
  id: SourceId = "lobidgnd";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      // lobid.org GND API — fully public, returns JSON-LD
      const url = `https://lobid.org/gnd/search?q=${encodeURIComponent(query)}&size=${limit}&format=json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const data = await res.json();
      const members = data?.member || [];
      if (!members.length) return [];

      return members.slice(0, limit).map((item: any) => {
        const gndId = item.gndIdentifier || item.id?.split('/').pop() || `gnd-${Date.now()}`;
        const uri = item.id || `https://d-nb.info/gnd/${gndId}`;
        const label = item.preferredName || item.variantName?.[0] || 'Unknown';
        const type = item.type || [];
        const description = item.biographicalOrHistoricalInformation?.[0] || item.definition?.[0] || '';
        const dateOfBirth = item.dateOfBirth?.[0] || '';
        const dateOfDeath = item.dateOfDeath?.[0] || '';
        const professions = (item.professionOrOccupation || []).slice(0, 3).map((p: any) => p.label || '').filter(Boolean);

        // Map GND type to BIBFRAME
        let bfType = 'bf:Topic';
        let resourceType = 'Topic';
        if (type.includes('Person') || type.includes('DifferentiatedPerson')) {
          bfType = 'bf:Person'; resourceType = 'Person';
        } else if (type.includes('CorporateBody')) {
          bfType = 'bf:Organization'; resourceType = 'Organization';
        } else if (type.includes('PlaceOrGeographicName')) {
          bfType = 'bf:Place'; resourceType = 'Place';
        } else if (type.includes('Work')) {
          bfType = 'bf:Work'; resourceType = 'Work';
        } else if (type.includes('SubjectHeading') || type.includes('SubjectHeadingSensoStricto')) {
          bfType = 'bf:Topic'; resourceType = 'Topic';
        } else if (type.includes('ConferenceOrEvent')) {
          bfType = 'bf:Meeting'; resourceType = 'Meeting';
        }

        const mainNode: any = {
          '@id': uri,
          '@type': [bfType],
          'rdfs:label': label,
          'bf:identifiedBy': { '@type': 'bf:Identifier', 'rdf:value': `GND:${gndId}` },
        };

        if (description) mainNode['bf:summary'] = { 'rdfs:label': description };
        if (dateOfBirth || dateOfDeath) {
          mainNode['bf:note'] = { 'rdfs:label': `${dateOfBirth}–${dateOfDeath}`.trim() };
        }
        if (professions.length > 0) {
          mainNode['schema:hasOccupation'] = professions.map((p: string) => ({ 'rdfs:label': p }));
        }

        // Cross-link to VIAF/LOC if available
        const sameAs = item.sameAs || [];
        const identifiers: any[] = [{ '@type': 'bf:Identifier', 'rdf:value': `GND:${gndId}` }];
        for (const link of sameAs) {
          const linkId = typeof link === 'object' ? link.id || link['@id'] : link;
          if (typeof linkId === 'string') {
            if (linkId.includes('viaf.org')) identifiers.push({ '@type': 'bf:Identifier', 'rdf:value': `VIAF:${linkId.split('/').pop()}` });
            if (linkId.includes('id.loc.gov')) identifiers.push({ '@type': 'bf:Identifier', 'rdf:value': `LOC:${linkId.split('/').pop()}` });
          }
        }
        if (identifiers.length > 1) mainNode['bf:identifiedBy'] = identifiers;

        return {
          id: `gnd:${gndId}`,
          title: label,
          document: {
            '@context': {
              'bf': 'http://id.loc.gov/ontologies/bibframe/',
              'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
              'schema': 'http://schema.org/',
            },
            '@graph': [mainNode],
          },
          createdAt: '',
          updatedAt: '',
          status: 'published',
          cataloger: 'Deutsche Nationalbibliothek (GND)',
          resourceType,
          source: 'lobidgnd' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[GND/lobid Provider] Search error:', err);
      return [];
    }
  }
}

// ===================== ISNI PROVIDER =====================

export class ISNIProvider implements DiscoveryProvider {
  id: SourceId = "isni";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      // ISNI public SRU API
      const sruQuery = `pica.nw="${query}"`;
      const url = `https://isni.oclc.org/sru/?query=${encodeURIComponent(sruQuery)}&operation=searchRetrieve&recordSchema=isni-b&maximumRecords=${limit}&startRecord=1&version=1.1`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/xml' },
      });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const xml = await res.text();
      return this.parseSRUResponse(xml, limit);
    } catch (err) {
      console.log('[ISNI Provider] Search error:', err);
      return [];
    }
  }

  private parseSRUResponse(xml: string, limit: number): NormalizedRecord[] {
    const records: NormalizedRecord[] = [];
    // Parse ISNI records from SRU XML
    const recordRegex = /<record>([\s\S]*?)<\/record>/g;
    let match;
    while ((match = recordRegex.exec(xml)) !== null && records.length < limit) {
      const entry = match[1];

      // Extract ISNI identifier
      const isniMatch = entry.match(/<isniUnformatted>(\d+)<\/isniUnformatted>/);
      const isni = isniMatch?.[1] || '';
      if (!isni) continue;

      // Extract personal name
      const surnameMatch = entry.match(/<surname>([^<]*)<\/surname>/);
      const forenameMatch = entry.match(/<forename>([^<]*)<\/forename>/);
      const orgNameMatch = entry.match(/<organisationName>[\s\S]*?<mainName>([^<]*)<\/mainName>/);

      let label = '';
      let bfType = 'bf:Person';
      let resourceType = 'Person';

      if (surnameMatch) {
        const surname = surnameMatch[1].trim();
        const forename = forenameMatch?.[1]?.trim() || '';
        label = forename ? `${surname}, ${forename}` : surname;
      } else if (orgNameMatch) {
        label = orgNameMatch[1].trim();
        bfType = 'bf:Organization';
        resourceType = 'Organization';
      } else {
        continue; // Skip if no name found
      }

      const uri = `https://isni.org/isni/${isni}`;

      // Extract linked identifiers (VIAF, LOC, etc.)
      const identifiers: any[] = [
        { '@type': 'bf:Isni', 'rdf:value': isni },
      ];
      const viafMatch = entry.match(/<sourceIdentifier[^>]*source="VIAF"[^>]*>([^<]*)<\/sourceIdentifier>/);
      if (viafMatch) {
        identifiers.push({ '@type': 'bf:Identifier', 'rdf:value': `VIAF:${viafMatch[1]}` });
      }

      // Extract dates
      const birthMatch = entry.match(/<birthDate>([^<]*)<\/birthDate>/);
      const deathMatch = entry.match(/<deathDate>([^<]*)<\/deathDate>/);
      const dateNote = [birthMatch?.[1], deathMatch?.[1]].filter(Boolean).join('–');

      // Extract title of work
      const titleMatch = entry.match(/<title>[\s\S]*?<titleOfAWork>([^<]*)<\/titleOfAWork>/);
      const knownTitle = titleMatch?.[1]?.trim() || '';

      const mainNode: any = {
        '@id': uri,
        '@type': [bfType],
        'rdfs:label': label,
        'bf:identifiedBy': identifiers,
      };
      if (dateNote) mainNode['bf:note'] = { 'rdfs:label': dateNote };
      if (knownTitle) mainNode['bf:contribution'] = { 'bf:role': { 'rdfs:label': 'Author' }, 'bf:agent': { 'rdfs:label': label } };

      records.push({
        id: `isni:${isni}`,
        title: label,
        document: {
          '@context': {
            'bf': 'http://id.loc.gov/ontologies/bibframe/',
            'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
          },
          '@graph': [mainNode],
        },
        createdAt: '',
        updatedAt: '',
        status: 'published',
        cataloger: 'ISNI',
        resourceType,
        source: 'isni' as SourceId,
        sourceUri: uri,
      });
    }
    return records;
  }
}

// ===================== HATHITRUST PROVIDER =====================

export class HathiTrustProvider implements DiscoveryProvider {
  id: SourceId = "hathitrust";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      // HathiTrust Catalog API — public, returns JSON
      const url = `https://catalog.hathitrust.org/api/volumes/brief/json/title:${encodeURIComponent(query)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeout);
      if (!res.ok) return this.searchFullText(query, limit);

      const data = await res.json();
      const items = data?.items || [];
      const records = data?.records || {};

      if (Object.keys(records).length === 0) return this.searchFullText(query, limit);

      const results: NormalizedRecord[] = [];
      for (const [recId, rec] of Object.entries(records).slice(0, limit)) {
        const record = rec as any;
        const title = Array.isArray(record.titles) ? record.titles[0] : (record.titles || 'Unknown');
        const authors = Array.isArray(record.authors) ? record.authors : [];
        const publishDates = Array.isArray(record.publishDates) ? record.publishDates : [];
        const year = publishDates[0] || '';
        const oclcs = Array.isArray(record.oclcs) ? record.oclcs : [];
        const isbns = Array.isArray(record.isbns) ? record.isbns : [];
        const uri = `https://catalog.hathitrust.org/Record/${recId}`;

        const graph: any[] = [];

        const workNode: any = {
          '@id': uri,
          '@type': ['bf:Work'],
          'bf:title': { '@type': 'bf:Title', 'bf:mainTitle': title.replace(/\.$/, '') },
        };
        graph.push(workNode);

        // Authors
        for (const author of authors.slice(0, 5)) {
          const authorName = typeof author === 'string' ? author : (author?.name || '');
          if (authorName) {
            graph.push({
              '@type': ['bf:Contribution'],
              'bf:agent': { '@type': 'bf:Person', 'rdfs:label': authorName.replace(/[,.]$/, '') },
              'bf:role': { '@id': 'http://id.loc.gov/vocabulary/relators/aut', 'rdfs:label': 'Author' },
            });
          }
        }

        // Publication date
        if (year) {
          graph.push({
            '@type': ['bf:ProvisionActivity', 'bf:Publication'],
            'bf:date': String(year),
          });
        }

        // Instance with identifiers
        const identifiers: any[] = [];
        if (oclcs.length > 0) identifiers.push({ '@type': 'bf:Identifier', 'rdf:value': `OCLC:${oclcs[0]}` });
        if (isbns.length > 0) identifiers.push({ '@type': 'bf:Isbn', 'rdf:value': isbns[0] });
        identifiers.push({ '@type': 'bf:Identifier', 'rdf:value': `HathiTrust:${recId}` });

        graph.push({
          '@id': `${uri}/instance`,
          '@type': ['bf:Instance'],
          'bf:instanceOf': { '@id': uri },
          'bf:identifiedBy': identifiers,
        });

        results.push({
          id: `ht:${recId}`,
          title: title.replace(/\.$/, ''),
          document: {
            '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
            '@graph': graph,
          },
          createdAt: year ? `${year}-01-01` : '',
          updatedAt: '',
          status: 'published',
          cataloger: 'HathiTrust',
          resourceType: 'Work',
          source: 'hathitrust' as SourceId,
          sourceUri: uri,
        });
      }
      return results;
    } catch (err) {
      console.log('[HathiTrust Provider] Search error:', err);
      return [];
    }
  }

  private async searchFullText(query: string, limit: number): Promise<NormalizedRecord[]> {
    try {
      // Fallback: HathiTrust full-text search Solr endpoint
      const url = `https://catalog.hathitrust.org/api/volumes/brief/json/oclc:${encodeURIComponent(query)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return [];
      const data = await res.json();
      const records = data?.records || {};
      const results: NormalizedRecord[] = [];
      for (const [recId, rec] of Object.entries(records).slice(0, limit)) {
        const record = rec as any;
        const title = Array.isArray(record.titles) ? record.titles[0] : 'Unknown';
        results.push({
          id: `ht:${recId}`,
          title: title.replace(/\.$/, ''),
          document: {
            '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
            '@graph': [{ '@id': `https://catalog.hathitrust.org/Record/${recId}`, '@type': ['bf:Work'], 'bf:title': { 'bf:mainTitle': title } }],
          },
          createdAt: '',
          updatedAt: '',
          status: 'published',
          cataloger: 'HathiTrust',
          resourceType: 'Work',
          source: 'hathitrust' as SourceId,
          sourceUri: `https://catalog.hathitrust.org/Record/${recId}`,
        });
      }
      return results;
    } catch { return []; }
  }
}

// ===================== GETTY VOCABULARIES PROVIDER =====================

export class GettyProvider implements DiscoveryProvider {
  id: SourceId = "getty";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      // Getty SPARQL endpoint — searches AAT, ULAN, TGN simultaneously
      const sparql = `
        SELECT ?subject ?prefLabel ?scopeNote ?type WHERE {
          ?subject a ?type ;
                   luc:term "${query.replace(/"/g, '\\"')}" ;
                   skos:prefLabel ?prefLabel .
          OPTIONAL { ?subject skos:scopeNote/rdf:value ?scopeNote }
          FILTER(LANG(?prefLabel) = "en" || LANG(?prefLabel) = "")
        } LIMIT ${limit}
      `;
      const url = `https://vocab.getty.edu/sparql.json?query=${encodeURIComponent(sparql)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/sparql-results+json' },
      });
      clearTimeout(timeout);
      if (!res.ok) return this.searchFallback(query, limit);

      const data = await res.json();
      const bindings = data?.results?.bindings || [];
      if (bindings.length === 0) return this.searchFallback(query, limit);

      return bindings.slice(0, limit).map((b: any) => {
        const uri = b.subject?.value || '';
        const label = b.prefLabel?.value || 'Unknown';
        const scopeNote = b.scopeNote?.value || '';
        const typeUri = b.type?.value || '';
        const gettyId = uri.split('/').pop() || `getty-${Date.now()}`;

        // Determine vocabulary and BIBFRAME type
        let bfType = 'bf:Topic';
        let resourceType = 'Topic';
        let vocabulary = 'Getty';
        if (uri.includes('/aat/')) { vocabulary = 'AAT'; bfType = 'bf:Topic'; resourceType = 'Topic'; }
        else if (uri.includes('/ulan/')) { vocabulary = 'ULAN'; bfType = 'bf:Person'; resourceType = 'Person'; }
        else if (uri.includes('/tgn/')) { vocabulary = 'TGN'; bfType = 'bf:Place'; resourceType = 'Place'; }

        const mainNode: any = {
          '@id': uri,
          '@type': [bfType, 'skos:Concept'],
          'rdfs:label': label,
          'skos:prefLabel': label,
          'bf:source': { '@id': `https://vocab.getty.edu/${vocabulary.toLowerCase()}/`, 'rdfs:label': `Getty ${vocabulary}` },
        };
        if (scopeNote) mainNode['skos:scopeNote'] = scopeNote.substring(0, 500);
        mainNode['bf:identifiedBy'] = { '@type': 'bf:Identifier', 'rdf:value': `Getty-${vocabulary}:${gettyId}` };

        return {
          id: `getty:${vocabulary.toLowerCase()}-${gettyId}`,
          title: `${label} [${vocabulary}]`,
          document: {
            '@context': {
              'bf': 'http://id.loc.gov/ontologies/bibframe/',
              'skos': 'http://www.w3.org/2004/02/skos/core#',
              'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
            },
            '@graph': [mainNode],
          },
          createdAt: '',
          updatedAt: '',
          status: 'published',
          cataloger: `Getty ${vocabulary}`,
          resourceType,
          source: 'getty' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[Getty Provider] SPARQL error, trying fallback:', err);
      return this.searchFallback(query, limit);
    }
  }

  private async searchFallback(query: string, limit: number): Promise<NormalizedRecord[]> {
    try {
      // Fallback: AAT full-text search endpoint
      const url = `https://vocab.getty.edu/aat/search?q=${encodeURIComponent(query)}&count=${limit}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeout);
      if (!res.ok) return [];
      const data = await res.json();
      const results = data?.results || [];
      return results.slice(0, limit).map((item: any) => {
        const uri = item.uri || item['@id'] || '';
        const label = item.label || item.prefLabel || 'Unknown';
        const gettyId = uri.split('/').pop() || `getty-${Date.now()}`;
        return {
          id: `getty:aat-${gettyId}`,
          title: `${label} [AAT]`,
          document: {
            '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
            '@graph': [{ '@id': uri, '@type': ['bf:Topic'], 'rdfs:label': label }],
          },
          createdAt: '',
          updatedAt: '',
          status: 'published',
          cataloger: 'Getty AAT',
          resourceType: 'Topic',
          source: 'getty' as SourceId,
          sourceUri: uri,
        };
      });
    } catch { return []; }
  }
}

// ===================== EUROPEANA PROVIDER =====================

export class EuropeanaProvider implements DiscoveryProvider {
  id: SourceId = "europeana";

  isEnabled() {
    // Europeana API is publicly accessible with a free API key
    // Works without key for basic entity search; full search needs key
    return true;
  }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      // Europeana Entity API — fully public, no key required
      const url = `https://api.europeana.eu/entity/suggest?text=${encodeURIComponent(query)}&language=en&type=agent,concept,place&pageSize=${limit}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeout);

      if (!res.ok) return this.searchRecordApi(query, limit);

      const data = await res.json();
      const items = data?.items || [];
      if (items.length === 0) return this.searchRecordApi(query, limit);

      return items.slice(0, limit).map((item: any) => {
        const uri = item.id || '';
        const label = item.prefLabel?.en || item.prefLabel?.def || Object.values(item.prefLabel || {})[0] || 'Unknown';
        const entityId = uri.split('/').pop() || `eu-${Date.now()}`;
        const type = item.type || 'Concept';
        const description = item.note?.en?.[0] || item.biographicalInformation?.en?.[0] || '';

        let bfType = 'bf:Topic';
        let resourceType = 'Topic';
        if (type === 'Agent') { bfType = 'bf:Person'; resourceType = 'Person'; }
        else if (type === 'Place') { bfType = 'bf:Place'; resourceType = 'Place'; }
        else if (type === 'Concept') { bfType = 'bf:Topic'; resourceType = 'Topic'; }
        else if (type === 'Organization') { bfType = 'bf:Organization'; resourceType = 'Organization'; }

        const mainNode: any = {
          '@id': uri,
          '@type': [bfType],
          'rdfs:label': typeof label === 'string' ? label : String(label),
          'bf:source': { 'rdfs:label': 'Europeana' },
        };
        if (description) mainNode['bf:summary'] = { 'rdfs:label': description };

        // Cross-reference identifiers (sameAs links to VIAF, Wikidata, etc.)
        const sameAs = item.sameAs || item.exactMatch || [];
        const identifiers: any[] = [];
        for (const link of sameAs.slice(0, 5)) {
          const linkStr = typeof link === 'string' ? link : link?.['@id'] || '';
          if (linkStr.includes('viaf.org')) identifiers.push({ '@type': 'bf:Identifier', 'rdf:value': `VIAF:${linkStr.split('/').pop()}` });
          if (linkStr.includes('wikidata.org')) identifiers.push({ '@type': 'bf:Identifier', 'rdf:value': `Wikidata:${linkStr.split('/').pop()}` });
          if (linkStr.includes('id.loc.gov')) identifiers.push({ '@type': 'bf:Identifier', 'rdf:value': `LOC:${linkStr.split('/').pop()}` });
        }
        if (identifiers.length > 0) mainNode['bf:identifiedBy'] = identifiers;

        return {
          id: `eu:${entityId}`,
          title: typeof label === 'string' ? label : String(label),
          document: {
            '@context': {
              'bf': 'http://id.loc.gov/ontologies/bibframe/',
              'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
            },
            '@graph': [mainNode],
          },
          createdAt: '',
          updatedAt: '',
          status: 'published',
          cataloger: 'Europeana',
          resourceType,
          source: 'europeana' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[Europeana Provider] Entity search error:', err);
      return this.searchRecordApi(query, limit);
    }
  }

  private async searchRecordApi(query: string, limit: number): Promise<NormalizedRecord[]> {
    try {
      // Fallback: Europeana Record API (may need API key in production)
      const apiKey = Deno.env.get('EUROPEANA_API_KEY') || 'api2demo';
      const url = `https://api.europeana.eu/record/v2/search.json?query=${encodeURIComponent(query)}&rows=${limit}&wskey=${apiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const data = await res.json();
      const items = data?.items || [];

      return items.slice(0, limit).map((item: any) => {
        const europeanaId = item.id || `eu-${Date.now()}`;
        const uri = item.guid || `https://www.europeana.eu/item${europeanaId}`;
        const title = Array.isArray(item.title) ? item.title[0] : (item.title || 'Unknown');
        const creator = item.dcCreator?.[0] || item.dcCreatorLangAware?.en?.[0] || '';
        const year = item.year?.[0] || '';
        const description = item.dcDescription?.[0] || '';
        const language = item.language?.[0] || '';

        const graph: any[] = [{
          '@id': uri,
          '@type': ['bf:Work'],
          'bf:title': { '@type': 'bf:Title', 'bf:mainTitle': title },
          ...(language ? { 'bf:language': { 'rdfs:label': language } } : {}),
          ...(description ? { 'bf:summary': { 'rdfs:label': description.substring(0, 500) } } : {}),
        }];

        if (creator) {
          graph.push({
            '@type': ['bf:Contribution'],
            'bf:agent': { '@type': 'bf:Person', 'rdfs:label': creator },
            'bf:role': { 'rdfs:label': 'Creator' },
          });
        }

        if (year) {
          graph.push({
            '@type': ['bf:ProvisionActivity', 'bf:Publication'],
            'bf:date': String(year),
          });
        }

        return {
          id: `eu:${europeanaId.replace(/\//g, '-')}`,
          title,
          document: {
            '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
            '@graph': graph,
          },
          createdAt: year ? `${year}-01-01` : '',
          updatedAt: '',
          status: 'published',
          cataloger: 'Europeana',
          resourceType: 'Work',
          source: 'europeana' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[Europeana Provider] Record API error:', err);
      return [];
    }
  }
}

// ===================== DPLA PROVIDER =====================

export class DPLAProvider implements DiscoveryProvider {
  id: SourceId = "dpla";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      // DPLA API — public with optional API key for higher rate limits
      const apiKey = Deno.env.get('DPLA_API_KEY') || '';
      const keyParam = apiKey ? `&api_key=${apiKey}` : '';
      const url = `https://api.dp.la/v2/items?q=${encodeURIComponent(query)}&page_size=${limit}${keyParam}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const data = await res.json();
      const docs = data?.docs || [];
      if (!docs.length) return [];

      return docs.slice(0, limit).map((doc: any) => {
        const dplaId = doc.id || doc['@id'] || `dpla-${Date.now()}`;
        const uri = doc.isShownAt || `https://dp.la/item/${dplaId}`;
        const sourceResource = doc.sourceResource || {};
        const title = Array.isArray(sourceResource.title) ? sourceResource.title[0] : (sourceResource.title || 'Unknown');
        const creators = sourceResource.creator || [];
        const creatorList = Array.isArray(creators) ? creators : [creators];
        const date = sourceResource.date || {};
        const dateStr = Array.isArray(date) ? (date[0]?.displayDate || date[0]?.begin || '') : (date.displayDate || date.begin || '');
        const year = dateStr.substring(0, 4);
        const subjects = (sourceResource.subject || []).slice(0, 5);
        const language = sourceResource.language || [];
        const langStr = Array.isArray(language) ? (language[0]?.name || language[0]?.iso639_3 || '') : '';
        const description = Array.isArray(sourceResource.description) ? sourceResource.description[0] : (sourceResource.description || '');
        const publisher = sourceResource.publisher || [];
        const publisherStr = Array.isArray(publisher) ? publisher[0] : (typeof publisher === 'string' ? publisher : '');
        const type = sourceResource.type || '';

        const graph: any[] = [];

        const workNode: any = {
          '@id': uri,
          '@type': ['bf:Work'],
          'bf:title': { '@type': 'bf:Title', 'bf:mainTitle': title },
        };
        if (langStr) workNode['bf:language'] = { 'rdfs:label': langStr };
        if (subjects.length > 0) {
          workNode['bf:subject'] = subjects.map((s: any) => ({
            'rdfs:label': typeof s === 'object' ? (s.name || s.label || '') : String(s)
          })).filter((s: any) => s['rdfs:label']);
        }
        if (description) workNode['bf:summary'] = { 'rdfs:label': description.substring(0, 500) };
        graph.push(workNode);

        // Contributors
        creatorList.forEach((name: any) => {
          const authorName = typeof name === 'string' ? name : '';
          if (authorName) {
            graph.push({
              '@type': ['bf:Contribution'],
              'bf:agent': { '@type': 'bf:Person', 'rdfs:label': authorName },
              'bf:role': { 'rdfs:label': 'Creator' },
            });
          }
        });

        // Publication
        if (year) {
          graph.push({
            '@type': ['bf:ProvisionActivity', 'bf:Publication'],
            'bf:date': year,
            ...(publisherStr ? { 'bf:agent': { '@type': 'bf:Organization', 'rdfs:label': publisherStr } } : {}),
          });
        }

        // Instance with DPLA identifier
        graph.push({
          '@id': `${uri}/instance`,
          '@type': ['bf:Instance'],
          'bf:instanceOf': { '@id': uri },
          'bf:identifiedBy': { '@type': 'bf:Identifier', 'rdf:value': `DPLA:${dplaId}` },
        });

        return {
          id: `dpla:${dplaId}`,
          title,
          document: {
            '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
            '@graph': graph,
          },
          createdAt: year ? `${year}-01-01` : '',
          updatedAt: '',
          status: 'published',
          cataloger: 'DPLA',
          resourceType: 'Work',
          source: 'dpla' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[DPLA Provider] Search error:', err);
      return [];
    }
  }
}

// ===================== SHARE-VDE PROVIDER =====================

export class ShareVDEProvider implements DiscoveryProvider {
  id: SourceId = "sharevde";

  isEnabled() { return true; }

  async search(query: string, limit = 10): Promise<NormalizedRecord[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      // Share-VDE discovery API — public BIBFRAME search
      const url = `https://svde.org/api/search?q=${encodeURIComponent(query)}&limit=${limit}&format=json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeout);

      if (!res.ok) return this.searchFallback(query, limit);

      const data = await res.json();
      const results = data?.results || data?.items || data?.docs || [];
      if (!results.length) return this.searchFallback(query, limit);

      return results.slice(0, limit).map((item: any) => {
        const svdeId = item.id || item.uri?.split('/').pop() || `svde-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const uri = item.uri || item.id || `https://svde.org/resource/${svdeId}`;
        const title = item.title || item.label || item.prefLabel || 'Unknown';
        const type = item.type || item.resourceType || 'Work';
        const contributor = item.contributor || item.creator || '';

        let bfType = 'bf:Work';
        let resourceType = 'Work';
        if (type.toLowerCase().includes('person')) { bfType = 'bf:Person'; resourceType = 'Person'; }
        else if (type.toLowerCase().includes('organization')) { bfType = 'bf:Organization'; resourceType = 'Organization'; }

        const graph: any[] = [{
          '@id': uri,
          '@type': [bfType],
          'rdfs:label': title,
          'bf:title': { '@type': 'bf:Title', 'bf:mainTitle': title },
          'bf:source': { 'rdfs:label': 'Share-VDE' },
        }];

        if (contributor) {
          graph.push({
            '@type': ['bf:Contribution'],
            'bf:agent': { '@type': 'bf:Person', 'rdfs:label': contributor },
            'bf:role': { 'rdfs:label': 'Contributor' },
          });
        }

        return {
          id: `svde:${svdeId}`,
          title,
          document: {
            '@context': {
              'bf': 'http://id.loc.gov/ontologies/bibframe/',
              'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
            },
            '@graph': graph,
          },
          createdAt: '',
          updatedAt: '',
          status: 'published',
          cataloger: 'Share-VDE',
          resourceType,
          source: 'sharevde' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[Share-VDE Provider] Search error:', err);
      return this.searchFallback(query, limit);
    }
  }

  private async searchFallback(query: string, limit: number): Promise<NormalizedRecord[]> {
    try {
      // Fallback: Share-VDE SPARQL endpoint
      const sparql = `
        PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT ?work ?title WHERE {
          ?work a bf:Work ;
                bf:title/bf:mainTitle ?title .
          FILTER(CONTAINS(LCASE(?title), LCASE("${query.replace(/"/g, '\\"')}")))
        } LIMIT ${limit}
      `;
      const url = `https://svde.org/sparql?query=${encodeURIComponent(sparql)}&format=json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/sparql-results+json' },
      });
      clearTimeout(timeout);
      if (!res.ok) return [];

      const data = await res.json();
      const bindings = data?.results?.bindings || [];

      return bindings.slice(0, limit).map((b: any) => {
        const uri = b.work?.value || '';
        const title = b.title?.value || 'Unknown';
        const svdeId = uri.split('/').pop() || `svde-${Date.now()}`;

        return {
          id: `svde:${svdeId}`,
          title,
          document: {
            '@context': { 'bf': 'http://id.loc.gov/ontologies/bibframe/' },
            '@graph': [{ '@id': uri, '@type': ['bf:Work'], 'bf:title': { 'bf:mainTitle': title } }],
          },
          createdAt: '',
          updatedAt: '',
          status: 'published',
          cataloger: 'Share-VDE',
          resourceType: 'Work',
          source: 'sharevde' as SourceId,
          sourceUri: uri,
        };
      });
    } catch (err) {
      console.log('[Share-VDE Provider] SPARQL fallback error:', err);
      return [];
    }
  }
}

// ===================== REGISTRY =====================

const PROVIDERS: DiscoveryProvider[] = [
  new InternalKVProvider(),
  new LOCProvider(),
  new VIAFProvider(),
  new OpenLibraryProvider(),
  new WikidataProvider(),
  new WorldCatProvider(),
  new FASTProvider(),
  new ISBNdbProvider(),
  new GoogleBooksProvider(),
  new CrossRefProvider(),
  new BNFProvider(),
  new LCSHProvider(),
  new LobidGNDProvider(),
  new ISNIProvider(),
  new HathiTrustProvider(),
  new GettyProvider(),
  new EuropeanaProvider(),
  new DPLAProvider(),
  new ShareVDEProvider(),
];

/**
 * Search across ALL registered & enabled providers.
 * Returns deduplicated, source-tagged results.
 */
export async function federatedSearch(
  query: string,
  options?: {
    sources?: SourceId[];
    limit?: number;
  }
): Promise<NormalizedRecord[]> {
  const limit = options?.limit || 50;
  const activeSources = options?.sources;

  const providers = PROVIDERS.filter(p => {
    if (!p.isEnabled()) return false;
    if (activeSources && activeSources.length > 0) {
      return activeSources.includes(p.id);
    }
    return true;
  });

  // Fan out to all providers in parallel
  const providerResults = await Promise.allSettled(
    providers.map(p => p.search(query, limit))
  );

  const allRecords: NormalizedRecord[] = [];
  const seenIds = new Set<string>();

  for (const result of providerResults) {
    if (result.status === 'fulfilled') {
      for (const record of result.value) {
        if (!seenIds.has(record.id)) {
          seenIds.add(record.id);
          allRecords.push(record);
        }
      }
    } else {
      console.log('[Federation] Provider failed:', result.reason);
    }
  }

  return allRecords;
}

/**
 * Get only internal records (backward-compatible with old getAllNormalizedRecords)
 */
export async function getInternalRecords(): Promise<NormalizedRecord[]> {
  const provider = new InternalKVProvider();
  return provider.search('');
}

/**
 * Return source metadata for frontend display
 */
export function getSourceMetadata(): SourceMeta[] {
  return Object.values(SOURCE_META);
}

/**
 * Import an external discovery record into the local KV store as a moon:record.
 * Preserves provenance metadata (original source, sourceUri).
 */
export async function importToLocal(record: NormalizedRecord): Promise<NormalizedRecord> {
  const now = new Date().toISOString();
  const localId = `imported-${record.source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Enrich the document with provenance
  const enrichedDocument = {
    ...record.document,
    '@graph': [
      ...(record.document?.['@graph'] || []),
      {
        '@type': ['bf:AdminMetadata'],
        'bf:source': {
          '@id': record.sourceUri || `urn:source:${record.source}`,
          'rdfs:label': record.cataloger || record.source,
        },
        'bf:creationDate': record.createdAt || now,
        'bf:descriptionConventions': { 'rdfs:label': `Imported from ${record.source}` },
        'bf:identifiedBy': record.sourceUri ? { '@type': 'bf:Identifier', 'rdf:value': record.sourceUri } : undefined,
      },
    ],
  };

  const moonRecord = {
    id: localId,
    uri: `https://moonlib.org/resource/${localId}`,
    title: record.title,
    document: enrichedDocument,
    metadata: {
      created: now,
      modified: now,
      creator: 'discovery-import',
      status: 'imported',
      version: 1,
    },
    resourceType: record.resourceType,
    // Provenance fields
    importedFrom: {
      source: record.source,
      sourceUri: record.sourceUri || '',
      originalId: record.id,
      importedAt: now,
    },
  };

  await kv.set(`moon:record:${localId}`, JSON.stringify(moonRecord));
  console.log(`[IMPORT] Imported ${record.source} record "${record.title}" → moon:record:${localId}`);

  return {
    ...record,
    id: localId,
    source: 'internal',
    status: 'imported',
  };
}