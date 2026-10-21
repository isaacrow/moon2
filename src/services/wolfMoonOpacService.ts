/**
 * WOF MOON Linked Data OPAC Service
 * Heavily inspired by Share-VDE (svde.org) and Libris (libris.kb.se/en).
 *
 * Core Principles:
 * 1. Shared Database: Unifies Supabase cataloging records, localStorage saves,
 *    MOON Authority Profiles, and pre-indexed linked data collections.
 * 2. Full Entity Linking (Share-VDE / Libris graph traversal):
 *    - Click a Person -> navigates to Person Entity view showing their canonical URI,
 *      ISNI/VIAF/LOC identifiers, biography, and EVERY Work created by or linked to them.
 *    - Click a Subject -> navigates to Subject / Concept view showing the authority URI,
 *      broader/narrower taxonomy, and EVERY Work categorized under that subject.
 *    - Click a Publisher -> shows every publication from that publisher.
 *    - Click a Work -> reveals all its Instances (manifestations/editions/carriers) and Items.
 * 3. Formats: User View, Share-VDE WEMI Cluster, Interactive Graph, Framed JSON-LD, Turtle, MARC21.
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { AISuggestionProfile, saveAuthorityProfileToMoonSystem } from './authorFinderService';
import { VERIFIED_IRAQI_AUTHORS } from './iraqiAuthorAIService';
import { getAllRecords } from '../app/utils/recordStorageBackend';
import { realLocExamples } from '../app/utils/realLocExamples';

// Curated library of high-resolution cultural & manuscript imagery for OPAC entities
export const CURATED_COVERS = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524654458049-e36be0721fa2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
];

export function getCatalogBaseUri(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/entity`;
  }
  return 'https://catalog.moonlib.org/entity';
}

export function getEntityIri(type: 'work' | 'instance' | 'item' | 'agent' | 'subject' | 'publisher', id: string): string {
  const cleanId = encodeURIComponent(id.replace(/^[a-z]+-/, ''));
  return `${getCatalogBaseUri()}/${type}/${cleanId}`;
}

export function resolveWorkCover(work: { coverUrl?: string; title?: string; id?: string }): string {
  // Bibliographic integrity: never assign random unrelated stock photos to catalog records.
  // Return explicit coverUrl when present, or empty string to allow neutral typographic library placeholder rendering.
  return work.coverUrl || '';
}

// =========================================================================
// TEXT NORMALIZATION & UNICODE HELPERS
// =========================================================================

/**
 * Normalizes Arabic text for diacritic-insensitive, hamza-insensitive searching
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel / harakat
    .replace(/[إأآا]/g, 'ا') // normalize alef variants
    .replace(/[يى]/g, 'ي') // normalize yaa / alef maksura
    .replace(/[ة]/g, 'ه') // normalize taa marbuta
    .replace(/\u0640/g, '') // remove tatweel / kashida
    .replace(/\s+/g, ' ')
    .trim();
}

export interface OpacAdvancedSearchParams {
  query?: string;
  title?: string;
  creator?: string;
  subject?: string;
  publisher?: string;
  yearFrom?: string;
  yearTo?: string;
  format?: string;
  language?: string;
  callNumber?: string;
  scope?: string;
  sort?: 'relevance' | 'title' | 'date-desc' | 'date-asc';
  page?: number;
  pageSize?: number;
}

export interface OpacPersonEntity {
  id: string;
  uri: string;
  canonicalMoonUri: string;
  name: string;
  nameArabic: string;
  nameEnglish?: string;
  birthDate?: string;
  deathDate?: string;
  lifespan?: string;
  role: string;
  viafUri?: string;
  locUri?: string;
  isniUri?: string;
  wikidataId?: string;
  bioArabic?: string;
  bioEnglish?: string;
  disciplines?: string[];
  affiliation?: string;
  city?: string;
  avatarUrl?: string;
  worksCount: number;
  workIds: string[];
  suggestedWorks?: string[];
}

export interface OpacSubjectEntity {
  id: string;
  uri: string;
  label: string;
  labelEnglish?: string;
  scheme: 'lcsh' | 'fast' | 'arabic-authority' | 'dewey';
  notationDdc?: string;
  notationLcc?: string;
  broader?: string;
  narrower?: string[];
  related?: string[];
  worksCount: number;
  workIds: string[];
}

export interface OpacPublisherEntity {
  id: string;
  name: string;
  city?: string;
  country?: string;
  worksCount: number;
  workIds: string[];
}

export interface OpacInstanceEntity {
  id: string;
  uri: string;
  title: string;
  subtitle?: string;
  workId: string;
  workTitle: string;
  publisher?: string;
  publicationPlace?: string;
  publicationYear?: string;
  extent?: string;
  dimensions?: string;
  isbn?: string;
  carrierType?: string;
  mediaType?: string;
  issuance?: string;
  callNumber?: string;
  shelfLocation?: string;
  holdingStatus?: 'available' | 'reference_only' | 'digital_access' | 'not_connected';
  coverUrl?: string;
  items?: OpacHoldingItem[];
}

export interface OpacBibframeRelation {
  predicate: string;
  predicateLabel: string;
  targetTitle: string;
  targetUri?: string;
  targetType?: string;
  details?: string;
}

export interface OpacHoldingItem {
  id: string;
  uri?: string;
  instanceId?: string;
  heldBy?: string;
  shelfMark?: string;
  barcode?: string;
  immediateAcquisition?: string;
  acquisitionSource?: string;
  extent?: string;
  dimensions?: string;
  notation?: string;
  notes?: string[];
  status?: 'available' | 'reference_only' | 'digital_access' | 'not_connected';
  accessUrl?: string;
}

export interface OpacWorkEntity {
  id: string;
  uri: string;
  canonicalMoonUri: string;
  title: string;
  subtitle?: string;
  language: string;
  languageLabel: string;
  summaryArabic?: string;
  summaryEnglish?: string;
  originDate?: string;
  era?: string;
  coverUrl?: string;
  genreForm?: string[];
  classificationDdc?: string;
  classificationLcc?: string;
  matchReason?: string;
  
  // Linked Entities
  primaryCreator: OpacPersonEntity;
  contributors: OpacPersonEntity[];
  subjects: OpacSubjectEntity[];
  instances: OpacInstanceEntity[];
  publisher?: OpacPublisherEntity;
  
  // Rich BIBFRAME & Manuscript Linked Data
  expressionOfHub?: { uri: string; label: string };
  series?: string;
  tableOfContents?: string;
  notes?: string[];
  incipit?: string; // أوله
  explicit?: string; // آخره
  extent?: string;
  dimensions?: string;
  notation?: string;
  adminMetadata?: string;
  relatedWorks?: OpacBibframeRelation[];
  holdingItems?: OpacHoldingItem[];
  rawBibframeTriples?: Array<{ subject: string; predicate: string; object: string; objectUri?: string }>;

  // Raw Data & Source
  source: 'wolf-moon' | 'moon-bibframe' | 'moon-engine' | 'national-authority' | 'seed';
  catalogingInterface?: string;
  createdAt: string;
  modifiedAt: string;
  document?: any;
  turtleRdf?: string;
  marc21?: string;
}

export interface OpacFacets {
  types: { value: string; label: string; count: number }[];
  formats: { value: string; label: string; count: number }[];
  availabilities: { value: string; label: string; count: number }[];
  subjects: { value: string; label: string; count: number }[];
  authors: { value: string; label: string; count: number }[];
  languages: { value: string; label: string; count: number }[];
  eras: { value: string; label: string; count: number }[];
  sources: { value: string; label: string; count: number }[];
}

// =========================================================================
// SEED LINKED DATA (Rich Benchmark Iraqi & International Works)
// =========================================================================

const SEED_WORKS: OpacWorkEntity[] = [
  {
    id: 'work-wardi-mahzala',
    uri: getEntityIri('work', 'work-wardi-mahzala'),
    canonicalMoonUri: 'moon:work:wardi:mahzala:1955',
    title: 'مهزلة العقل البشري',
    subtitle: 'محاولة في التحليل الاجتماعي والنفسي للمجتمع العراقي',
    language: 'ara',
    languageLabel: 'العربية (Arabic)',
    summaryArabic: 'دراسة اجتماعية وفلسفية رائدة للدكتور علي الوردي، تتناول ازدواجية الشخصية في المجتمع العراقي والصراع بين البداوة والحضارة ودور التناقضات الاجتماعية في صياغة الفكر العربي.',
    summaryEnglish: 'A seminal sociological treatise by Dr. Ali Al-Wardi analyzing the dualism of the Iraqi personality and the conflict between nomadism (Bedouin values) and urban civilization.',
    originDate: '1955',
    era: 'منتصف القرن العشرين (1955)',
    genreForm: ['دراسة اجتماعية', 'فلسفة اجتماعية', 'علم الاجتماع العراقي'],
    classificationDdc: '301.09567',
    classificationLcc: 'HN667 .W37 1955',
    primaryCreator: {
      id: 'person-ali-wardi',
      uri: getEntityIri('agent', 'person-ali-wardi'),
      canonicalMoonUri: 'moon:person:ali-al-wardi:1913-1995',
      name: 'علي الوردي',
      nameArabic: 'د. علي الوردي',
      nameEnglish: 'Ali Al-Wardi',
      birthDate: '1913',
      deathDate: '1995',
      lifespan: '1913 – 1995',
      role: 'Author (مؤلف)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      viafUri: 'https://viaf.org/viaf/34551189',
      locUri: 'http://id.loc.gov/authorities/names/n82027914',
      isniUri: 'https://isni.org/isni/0000000121274381',
      wikidataId: 'Q4118742',
      bioArabic: 'رائد علم الاجتماع في العراق والوطن العربي، حاصل على الدكتوراه من جامعة تكساس أوستن 1950، صاحب أطروحة ازدواج الشخصية وصراع البداوة والحضارة.',
      bioEnglish: 'Pioneering Iraqi sociologist and intellectual who earned his doctorate from UT Austin in 1950, renowned for his theory on social dualism in Iraq.',
      disciplines: ['علم الاجتماع', 'الفكر العربي الحديث', 'فلسفة التاريخ'],
      affiliation: 'جامعة بغداد - قسم علم الاجتماع',
      city: 'بغداد (الكاظمية)',
      worksCount: 2,
      workIds: ['work-wardi-mahzala', 'work-wardi-lamahat']
    },
    contributors: [],
    subjects: [
      {
        id: 'subj-iraq-sociology',
        uri: getEntityIri('subject', 'subj-iraq-sociology'),
        label: 'علم الاجتماع -- العراق',
        labelEnglish: 'Sociology -- Iraq',
        scheme: 'lcsh',
        notationDdc: '301.09567',
        broader: 'العلوم الاجتماعية والتاريخ',
        worksCount: 2,
        workIds: ['work-wardi-mahzala', 'work-wardi-lamahat']
      },
      {
        id: 'subj-dual-personality',
        uri: getEntityIri('subject', 'subj-dual-personality'),
        label: 'ازدواج الشخصية -- دراسات نفسية واجتماعية',
        labelEnglish: 'Social psychology -- Arab countries',
        scheme: 'fast',
        notationDdc: '302',
        broader: 'علم النفس الاجتماعي',
        worksCount: 1,
        workIds: ['work-wardi-mahzala']
      }
    ],
    instances: [
      {
        id: 'inst-wardi-mahzala-1',
        uri: getEntityIri('instance', 'inst-wardi-mahzala-1'),
        title: 'مهزلة العقل البشري',
        subtitle: 'الطبعة الأولى الأصلية',
        workId: 'work-wardi-mahzala',
        workTitle: 'مهزلة العقل البشري',
        publisher: 'مطبعة الرابطة - بغداد',
        publicationPlace: 'بغداد، العراق',
        publicationYear: '1955',
        extent: '280 صفحة ؛ 21 سم',
        isbn: '978-9953-36-810-0',
        carrierType: 'مجلد ورقي (Print Volume)',
        mediaType: 'unmediated (بصري مباشر)',
        callNumber: 'DS79.65 .W37 1955',
        shelfLocation: 'قسم المراجع الوطنية',
        holdingStatus: 'not_connected',
        items: [
          {
            id: 'item-wardi-mahzala-sample-1',
            instanceId: 'inst-wardi-mahzala-1',
            heldBy: 'دار الكتب والوثائق الوطنية العراقية (INLA) — بغداد',
            shelfMark: 'DS79.65 .W37 1955',
            extent: '280 صفحة',
            status: 'not_connected',
            notes: ['نموذج استرشادي للمعايرة الببليوغرافية — غير متصل بنظام إدارة الإعارة الحي']
          }
        ]
      }
    ],
    holdingItems: [
      {
        id: 'item-wardi-mahzala-sample-1',
        instanceId: 'inst-wardi-mahzala-1',
        heldBy: 'دار الكتب والوثائق الوطنية العراقية (INLA) — بغداد',
        shelfMark: 'DS79.65 .W37 1955',
        extent: '280 صفحة',
        status: 'not_connected',
        notes: ['نموذج استرشادي للمعايرة الببليوغرافية — غير متصل بنظام إدارة الإعارة الحي']
      }
    ],
    publisher: {
      id: 'pub-rabita',
      name: 'مطبعة الرابطة',
      city: 'بغداد',
      country: 'العراق',
      worksCount: 1,
      workIds: ['work-wardi-mahzala']
    },
    source: 'seed',
    catalogingInterface: 'Wolf Moon Linked Cataloger',
    createdAt: '2026-01-15T10:00:00Z',
    modifiedAt: '2026-10-09T18:00:00Z'
  },
  {
    id: 'work-wardi-lamahat',
    uri: getEntityIri('work', 'work-wardi-lamahat'),
    canonicalMoonUri: 'moon:work:wardi:lamahat:1969',
    title: 'لمحات اجتماعية من تاريخ العراق الحديث',
    subtitle: 'دراسة تحليلية موسعة في تاريخ المجتمع العراقي وتطوره (8 أجزاء)',
    language: 'ara',
    languageLabel: 'العربية (Arabic)',
    summaryArabic: 'الموسوعة الاجتماعية التاريخية الكبرى للوردي في ثمانية أجزاء، ترصد تحولات المجتمع العراقي من العهد العثماني مرورا بالاحتلال البريطاني وثورة العشرين وتأسيس الحكم الوطني.',
    summaryEnglish: 'The comprehensive multi-volume historical sociology encyclopedia tracing Iraqi society from the Ottoman era through the 1920 revolution to the modern monarchy.',
    originDate: '1969',
    era: 'النصف الثاني من القرن العشرين',
    genreForm: ['تاريخ اجتماعي', 'موسوعة تاريخية', 'دراسات عراقية'],
    classificationDdc: '956.7',
    classificationLcc: 'DS79.65 .W37 1969',
    primaryCreator: {
      id: 'person-ali-wardi',
      uri: getEntityIri('agent', 'person-ali-wardi'),
      canonicalMoonUri: 'moon:person:ali-al-wardi:1913-1995',
      name: 'علي الوردي',
      nameArabic: 'د. علي الوردي',
      nameEnglish: 'Ali Al-Wardi',
      birthDate: '1913',
      deathDate: '1995',
      lifespan: '1913 – 1995',
      role: 'Author (مؤلف)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      viafUri: 'https://viaf.org/viaf/34551189',
      locUri: 'http://id.loc.gov/authorities/names/n82027914',
      isniUri: 'https://isni.org/isni/0000000121274381',
      wikidataId: 'Q4118742',
      disciplines: ['علم الاجتماع', 'تاريخ العراق'],
      worksCount: 2,
      workIds: ['work-wardi-mahzala', 'work-wardi-lamahat']
    },
    contributors: [],
    subjects: [
      {
        id: 'subj-iraq-history-modern',
        uri: getEntityIri('subject', 'subj-iraq-history-modern'),
        label: 'العراق -- تاريخ -- العصر الحديث',
        labelEnglish: 'Iraq -- History -- Modern period',
        scheme: 'lcsh',
        notationDdc: '956.704',
        broader: 'تاريخ الشرق الأدنى المعاصر',
        worksCount: 1,
        workIds: ['work-wardi-lamahat']
      },
      {
        id: 'subj-iraq-sociology',
        uri: getEntityIri('subject', 'subj-iraq-sociology'),
        label: 'علم الاجتماع -- العراق',
        labelEnglish: 'Sociology -- Iraq',
        scheme: 'lcsh',
        notationDdc: '301.09567',
        worksCount: 2,
        workIds: ['work-wardi-mahzala', 'work-wardi-lamahat']
      }
    ],
    instances: [
      {
        id: 'inst-wardi-lamahat-1',
        uri: getEntityIri('instance', 'inst-wardi-lamahat-1'),
        title: 'لمحات اجتماعية من تاريخ العراق الحديث (8 مجلدات)',
        subtitle: 'المجموعة الكاملة',
        workId: 'work-wardi-lamahat',
        workTitle: 'لمحات اجتماعية من تاريخ العراق الحديث',
        publisher: 'مطبعة الإرشاد - بغداد',
        publicationPlace: 'بغداد، العراق',
        publicationYear: '1969',
        extent: '8 مجلدات (3200 صفحة) ؛ 24 سم',
        isbn: '978-9953-36-812-4',
        carrierType: 'مجلد مقوى (Hardcover Set)',
        callNumber: 'DS79.65 .W37 1969',
        shelfLocation: 'قسم الدراسات العراقية',
        holdingStatus: 'not_connected'
      }
    ],
    publisher: {
      id: 'pub-irshad',
      name: 'مطبعة الإرشاد',
      city: 'بغداد',
      country: 'العراق',
      worksCount: 1,
      workIds: ['work-wardi-lamahat']
    },
    source: 'seed',
    catalogingInterface: 'Wolf Moon Linked Cataloger',
    createdAt: '2026-02-01T12:00:00Z',
    modifiedAt: '2026-10-09T18:00:00Z'
  },
  {
    id: 'work-sayyab-rain-song',
    uri: getEntityIri('work', 'work-sayyab-rain-song'),
    canonicalMoonUri: 'moon:work:sayyab:rain-song:1960',
    title: 'أنشودة المطر',
    subtitle: 'ديوان شعر وتأسيس حركة الشعر الحر العربية',
    language: 'ara',
    languageLabel: 'العربية (Arabic)',
    summaryArabic: 'الديوان الشعري المؤسس لقصيدة التفعيلة والشعر العربي الحر الحديث، يضم قصائد خالدة منها أنشودة المطر، النهر والموت، والأسلحة والأطفال، حافلا بالرموز الأسطورية والتموزية.',
    summaryEnglish: 'The landmark collection of modern Arabic poetry that pioneered the free verse movement, featuring the celebrated title poem Rain Song filled with Mesopotamian and Thammuzian mythological symbolism.',
    originDate: '1960',
    era: 'العصر الحديث (1960)',
    genreForm: ['شعر حر', 'قصيدة التفعيلة', 'الشعر العربي الحديث'],
    classificationDdc: '892.716',
    classificationLcc: 'PJ7862.A86 U5 1960',
    primaryCreator: {
      id: 'person-badr-sayyab',
      uri: getEntityIri('agent', 'person-badr-sayyab'),
      canonicalMoonUri: 'moon:person:badr-sayyab:1926-1964',
      name: 'بدر شاكر السياب',
      nameArabic: 'بدر شاكر السياب',
      nameEnglish: 'Badr Shakir Al-Sayyab',
      birthDate: '1926',
      deathDate: '1964',
      lifespan: '1926 – 1964',
      role: 'Poet / Author (شاعر ومؤلف)',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      viafUri: 'https://viaf.org/viaf/22283997',
      locUri: 'http://id.loc.gov/authorities/names/n81078848',
      isniUri: 'https://isni.org/isni/0000000121338531',
      wikidataId: 'Q799846',
      bioArabic: 'رائد حركة الشعر العربي الحديث ومؤسس شعر التفعيلة إلى جانب نازك الملائكة، ولد في جيكور بالبصرة ومزج التراث الأسطوري الرافديني بالهم الوطني والإنساني.',
      bioEnglish: 'Leading Iraqi poet and founder of modern Arabic free-verse poetry from Jaykur, Basra.',
      disciplines: ['الشعر العربي الحديث', 'الأدب المقارن', 'الترجمة الأدبية'],
      affiliation: 'دار المعلمين العالية - بغداد',
      city: 'البصرة (جيكور)',
      worksCount: 1,
      workIds: ['work-sayyab-rain-song']
    },
    contributors: [],
    subjects: [
      {
        id: 'subj-modern-arabic-poetry',
        uri: getEntityIri('subject', 'subj-modern-arabic-poetry'),
        label: 'الشعر العربي -- القرن 20 -- الشعر الحر',
        labelEnglish: 'Arabic poetry -- 20th century -- Free verse',
        scheme: 'lcsh',
        notationDdc: '892.716',
        broader: 'الأدب العربي واللغات السامية',
        worksCount: 3,
        workIds: ['work-sayyab-rain-song', 'work-malaika-cholera', 'work-jawahiri-diwan']
      }
    ],
    instances: [
      {
        id: 'inst-sayyab-rain-1',
        uri: getEntityIri('instance', 'inst-sayyab-rain-1'),
        title: 'أنشودة المطر',
        subtitle: 'الطبعة الأولى - منشورات مجلة شعر',
        workId: 'work-sayyab-rain-song',
        workTitle: 'أنشودة المطر',
        publisher: 'دار مجلة شعر',
        publicationPlace: 'بيروت، لبنان',
        publicationYear: '1960',
        extent: '196 صفحة ؛ 20 سم',
        isbn: '978-9953-21-102-1',
        carrierType: 'مجلد ورقي طبعة أصلية',
        callNumber: 'PJ7862.A86 U5 1960',
        shelfLocation: 'قسم الشعر العربي الحديث',
        holdingStatus: 'not_connected'
      }
    ],
    publisher: {
      id: 'pub-shir',
      name: 'دار مجلة شعر',
      city: 'بيروت',
      country: 'لبنان',
      worksCount: 1,
      workIds: ['work-sayyab-rain-song']
    },
    source: 'seed',
    catalogingInterface: 'Wolf Moon Linked Cataloger',
    createdAt: '2026-02-10T14:30:00Z',
    modifiedAt: '2026-10-09T18:00:00Z'
  },
  {
    id: 'work-malaika-cholera',
    uri: getEntityIri('work', 'work-malaika-cholera'),
    canonicalMoonUri: 'moon:work:malaika:shazaya:1949',
    title: 'شظايا ورماد',
    subtitle: 'مع مقدمة نظرية في أوزان الشعر الحر وقصيدة الكوليرا الشهيرة',
    language: 'ara',
    languageLabel: 'العربية (Arabic)',
    summaryArabic: 'ديوان نازك الملائكة التاريخي الصادر عام 1949 والذي افتتح عهد الشعر الحر الحديث ببيان نظري صريح حول عروض الشعر وتفعيلات الخليل، متضمنا قصيدتها التأسيسية الكوليرا.',
    summaryEnglish: 'Nazik Al-Malaika’s historic 1949 collection featuring the pioneering poem Cholera and her foundational theoretical essay establishing modern free-verse poetics in Arabic literature.',
    originDate: '1949',
    era: 'منتصف القرن العشرين (1949)',
    genreForm: ['شعر حر', 'نظرية أدبية', 'عروض الشعر الحديث'],
    classificationDdc: '892.716',
    classificationLcc: 'PJ7846.A4 S5 1949',
    primaryCreator: {
      id: 'person-nazik-malaika',
      uri: getEntityIri('agent', 'person-nazik-malaika'),
      canonicalMoonUri: 'moon:person:nazik-malaika:1923-2007',
      name: 'نازك الملائكة',
      nameArabic: 'نازك الملائكة',
      nameEnglish: 'Nazik Al-Malaika',
      birthDate: '1923',
      deathDate: '2007',
      lifespan: '1923 – 2007',
      role: 'Poet & Theorist (شاعرة وناقدة منظرة)',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      viafUri: 'https://viaf.org/viaf/100384469',
      locUri: 'http://id.loc.gov/authorities/names/n82040223',
      isniUri: 'https://isni.org/isni/0000000118507722',
      wikidataId: 'Q446761',
      bioArabic: 'الشاعرة والناقدة العراقية الرائدة، أول من كتب ونظّر لقصيدة الشعر الحر في الأدب العربي، خريجة دار المعلمين العالية وجامعة برينستون الأمريكية.',
      disciplines: ['الشعر العربي', 'النقد الأدبي والعروض', 'اللسانيات'],
      affiliation: 'جامعة الموصل / جامعة البصرة',
      city: 'بغداد',
      worksCount: 1,
      workIds: ['work-malaika-cholera']
    },
    contributors: [],
    subjects: [
      {
        id: 'subj-modern-arabic-poetry',
        uri: getEntityIri('subject', 'subj-modern-arabic-poetry'),
        label: 'الشعر العربي -- القرن 20 -- الشعر الحر',
        labelEnglish: 'Arabic poetry -- 20th century -- Free verse',
        scheme: 'lcsh',
        notationDdc: '892.716',
        worksCount: 3,
        workIds: ['work-sayyab-rain-song', 'work-malaika-cholera', 'work-jawahiri-diwan']
      }
    ],
    instances: [
      {
        id: 'inst-malaika-shazaya-1',
        uri: getEntityIri('instance', 'inst-malaika-shazaya-1'),
        title: 'شظايا ورماد',
        subtitle: 'الطبعة البغدادية الأولى',
        workId: 'work-malaika-cholera',
        workTitle: 'شظايا ورماد',
        publisher: 'مطبعة السعدي - بغداد',
        publicationPlace: 'بغداد، العراق',
        publicationYear: '1949',
        extent: '172 صفحة ؛ 21 سم',
        isbn: '978-9953-417-77-9',
        carrierType: 'مجلد ورقي',
        callNumber: 'PJ7846.A4 S5 1949',
        shelfLocation: 'قسم المطبوعات التراثية',
        holdingStatus: 'not_connected'
      }
    ],
    publisher: {
      id: 'pub-saadi',
      name: 'مطبعة السعدي',
      city: 'بغداد',
      country: 'العراق',
      worksCount: 1,
      workIds: ['work-malaika-cholera']
    },
    source: 'seed',
    catalogingInterface: 'Wolf Moon Linked Cataloger',
    createdAt: '2026-02-15T09:00:00Z',
    modifiedAt: '2026-10-09T18:00:00Z'
  },
  {
    id: 'work-jawahiri-diwan',
    uri: getEntityIri('work', 'work-jawahiri-diwan'),
    canonicalMoonUri: 'moon:work:jawahiri:diwan:1982',
    title: 'ديوان الجواهري (الأعمال الشعرية الكاملة)',
    subtitle: 'المجموعة الكاملة لشاعر العرب الأكبر محمد مهدي الجواهري في 5 أجزاء',
    language: 'ara',
    languageLabel: 'العربية (Arabic)',
    summaryArabic: 'ديوان شاعر العرب الأكبر محمد مهدي الجواهري، قمة الشعر العمودي الكلاسيكي في القرن العشرين، متضمنا قصائد دجلة الخير، أخي جعفر، يوم الشهيد، وذكرياتي.',
    summaryEnglish: 'The complete poetic works of the greatest 20th-century classical Arabic poet, Muhammad Mahdi Al-Jawahiri, featuring his masterworks including Dijlat Al-Khair and Ya Dajjata Al-Khayr.',
    originDate: '1982',
    era: 'القرن العشرين (1900-1997)',
    genreForm: ['شعر عمودي كلاسيكي', 'ديوان كامل', 'قصائد وطنية وفكرية'],
    classificationDdc: '892.716',
    classificationLcc: 'PJ7840.A9 A17 1982',
    primaryCreator: {
      id: 'person-jawahiri',
      uri: getEntityIri('agent', 'person-jawahiri'),
      canonicalMoonUri: 'moon:person:jawahiri:1899-1997',
      name: 'محمد مهدي الجواهري',
      nameArabic: 'محمد مهدي الجواهري',
      nameEnglish: 'Muhammad Mahdi Al-Jawahiri',
      birthDate: '1899',
      deathDate: '1997',
      lifespan: '1899 – 1997',
      role: 'Poet / شاعر العرب الأكبر',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      viafUri: 'https://viaf.org/viaf/90074474',
      locUri: 'http://id.loc.gov/authorities/names/n82006323',
      isniUri: 'https://isni.org/isni/0000000121431608',
      wikidataId: 'Q3180183',
      bioArabic: 'أعظم شعراء العربية في العصر الحديث، لُقّب بشاعر العرب الأكبر ومتنبي العصر، ولد بالنجف الأشرف وكان شاعرا وثائرا ومؤسسا لاتحاد الأدباء العراقيين.',
      disciplines: ['الشعر العمودي', 'الأدب العربي', 'الصحافة السياسية'],
      affiliation: 'اتحاد الأدباء والكتاب العراقيين (الرئيس المؤسس)',
      city: 'النجف الأشرف / بغداد',
      worksCount: 1,
      workIds: ['work-jawahiri-diwan']
    },
    contributors: [],
    subjects: [
      {
        id: 'subj-classical-arabic-poetry',
        uri: getEntityIri('subject', 'subj-classical-arabic-poetry'),
        label: 'الشعر العربي العمودي -- مدرسة الإحياء والبعث',
        labelEnglish: 'Neoclassical Arabic poetry',
        scheme: 'lcsh',
        notationDdc: '892.716',
        worksCount: 1,
        workIds: ['work-jawahiri-diwan']
      }
    ],
    instances: [
      {
        id: 'inst-jawahiri-diwan-beirut',
        uri: getEntityIri('instance', 'inst-jawahiri-diwan-beirut'),
        title: 'ديوان الجواهري (5 مجلدات)',
        subtitle: 'إعداد وتحقيق ومراجعة د. علي جواد الطاهر ود. إبراهيم السامرائي',
        workId: 'work-jawahiri-diwan',
        workTitle: 'ديوان الجواهري',
        publisher: 'دار الطليعة للطباعة والنشر',
        publicationPlace: 'بيروت، لبنان',
        publicationYear: '1982',
        extent: '5 مجلدات (2450 صفحة) ؛ 25 سم',
        isbn: '978-9953-417-90-8',
        carrierType: 'مجلد فاخر (Deluxe Set)',
        callNumber: 'PJ7840.A9 A17 1982',
        shelfLocation: 'قسم المراجع الأدبية',
        holdingStatus: 'not_connected'
      }
    ],
    publisher: {
      id: 'pub-talia',
      name: 'دار الطليعة',
      city: 'بيروت',
      country: 'لبنان',
      worksCount: 1,
      workIds: ['work-jawahiri-diwan']
    },
    source: 'seed',
    catalogingInterface: 'Wolf Moon Linked Cataloger',
    createdAt: '2026-02-20T16:00:00Z',
    modifiedAt: '2026-10-09T18:00:00Z'
  },
  {
    id: 'work-nawab-rail-hamad',
    uri: getEntityIri('work', 'work-nawab-rail-hamad'),
    canonicalMoonUri: 'moon:work:nawab:ril-hamad:1969',
    title: 'للريل وحمد',
    subtitle: 'الديوان الشعري الشعبي العراقي الأبرز وأيقونة الحداثة الشعرية',
    language: 'ara',
    languageLabel: 'العربية / اللهجة العراقية الجنوبية',
    summaryArabic: 'ديوان الشاعر الكبير مظفر النواب الذي أحدث ثورة في القصيدة الشعبية العراقية وحولها إلى لغة فنية عالية تجمع بين وجدان الريف الجنوبي وجماليات الحداثة الشعرية المقاومة.',
    summaryEnglish: 'Muzaffar Al-Nawwab’s iconic poetry collection that transformed Iraqi vernacular poetry into profound modernist literature.',
    originDate: '1969',
    era: 'النصف الثاني من القرن العشرين',
    genreForm: ['شعر شعبي عراقي حديث', 'أدب المقاومة والحرية'],
    classificationDdc: '892.716',
    primaryCreator: {
      id: 'person-muzaffar-nawab',
      uri: getEntityIri('agent', 'person-muzaffar-nawab'),
      canonicalMoonUri: 'moon:person:nawab:1934-2022',
      name: 'مظفر النواب',
      nameArabic: 'مظفر النواب',
      nameEnglish: 'Muzaffar Al-Nawab',
      birthDate: '1934',
      deathDate: '2022',
      lifespan: '1934 – 2022',
      role: 'Poet / شاعر الرفض والحرية',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      viafUri: 'https://viaf.org/viaf/39294247',
      locUri: 'http://id.loc.gov/authorities/names/nr99002220',
      isniUri: 'https://isni.org/isni/0000000078862970',
      wikidataId: 'Q4116035',
      bioArabic: 'شاعر عراقي كبير، تخرج في كلية الآداب ببغداد، جمع بين فصيح الشعر وعاميه، ولُقّب بشاعر الثورة والمنفى.',
      disciplines: ['الشعر الشعبي', 'الشعر الفصيح', 'الفنون التشكيلية'],
      city: 'بغداد (الكرخ)',
      worksCount: 1,
      workIds: ['work-nawab-rail-hamad']
    },
    contributors: [],
    subjects: [
      {
        id: 'subj-iraqi-vernacular-poetry',
        uri: getEntityIri('subject', 'subj-iraqi-vernacular-poetry'),
        label: 'الشعر العامي والشعبي -- العراق -- حداثة القصيدة',
        labelEnglish: 'Iraqi folk poetry and vernacular modernism',
        scheme: 'arabic-authority',
        worksCount: 1,
        workIds: ['work-nawab-rail-hamad']
      }
    ],
    instances: [
      {
        id: 'inst-nawab-ril-1',
        uri: getEntityIri('instance', 'inst-nawab-ril-1'),
        title: 'للريل وحمد',
        subtitle: 'الطبعة الأصلية البغدادية',
        workId: 'work-nawab-rail-hamad',
        workTitle: 'للريل وحمد',
        publisher: 'مطبعة النجاح - بغداد',
        publicationPlace: 'بغداد، العراق',
        publicationYear: '1969',
        extent: '112 صفحة ؛ 19 سم',
        carrierType: 'غلاف ورقي',
        shelfLocation: 'قسم التراث الشعبي',
        holdingStatus: 'not_connected'
      }
    ],
    source: 'seed',
    catalogingInterface: 'Wolf Moon Linked Cataloger',
    createdAt: '2026-03-01T11:00:00Z',
    modifiedAt: '2026-10-09T18:00:00Z'
  },
  {
    id: 'work-iraq-lukitz',
    uri: getEntityIri('work', 'work-iraq-lukitz'),
    canonicalMoonUri: 'moon:work:lukitz:iraq-national-identity:1995',
    title: 'Iraq : the search for national identity',
    subtitle: 'A comprehensive study on the political development and national identity in modern Iraq',
    language: 'eng',
    languageLabel: 'الإنجليزية (English)',
    summaryArabic: 'دراسة سياسية وتاريخية معمقة للدكتورة ليورا لوكيتز تبحث في جذور الهوية الوطنية العراقية وتشكل الدولة الحديثة وتفاعلات القومية والسياسة والحكم.',
    summaryEnglish: 'A pioneering analytical monograph on modern Iraqi nationalism and political development from the British Mandate through the republican era.',
    originDate: '1995',
    era: 'أواخر القرن العشرين (1995)',
    genreForm: ['دراسة سياسية', 'Non-fiction literature', 'Bibliography'],
    classificationDdc: '320.5409567',
    classificationLcc: 'DS79 .L85 1995',
    primaryCreator: {
      id: 'person-liora-lukitz',
      uri: getEntityIri('agent', 'person-liora-lukitz'),
      canonicalMoonUri: 'moon:person:liora-lukitz',
      name: 'Liora Lukitz',
      nameArabic: 'ليورا لوكيتز (Liora Lukitz)',
      nameEnglish: 'Liora Lukitz',
      role: 'Author (مؤلف)',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      viafUri: 'https://viaf.org/viaf/114424367',
      locUri: 'http://id.loc.gov/authorities/names/n94031533',
      disciplines: ['تاريخ الشرق الأوسط', 'العلوم السياسية'],
      affiliation: 'Centre for Middle Eastern Studies',
      worksCount: 1,
      workIds: ['work-iraq-lukitz']
    },
    contributors: [],
    subjects: [
      {
        id: 'subj-nationalism-iraq',
        uri: getEntityIri('subject', 'subj-nationalism-iraq'),
        label: 'Nationalism -- Iraq',
        labelEnglish: 'القومية والهوية الوطنية في العراق',
        scheme: 'lcsh',
        notationDdc: '320.5409567',
        worksCount: 1,
        workIds: ['work-iraq-lukitz']
      }
    ],
    instances: [
      {
        id: 'inst-lukitz-cass-1995',
        uri: getEntityIri('instance', 'inst-lukitz-cass-1995'),
        title: 'Iraq : the search for national identity',
        subtitle: 'Digital & Print Resource',
        workId: 'work-iraq-lukitz',
        workTitle: 'Iraq : the search for national identity',
        publisher: 'F. Cass',
        publicationPlace: 'London ; Portland, Ore.',
        publicationYear: '1995',
        extent: 'xii, 207 p. ; 22 cm',
        isbn: '0-7146-4550-8',
        carrierType: 'Digital Resource / E-book / Print',
        mediaType: 'computer / unmediated',
        callNumber: 'DS79 .L85 1995',
        shelfLocation: 'قسم الدراسات الدولية',
        holdingStatus: 'not_connected'
      }
    ],
    publisher: {
      id: 'pub-frank-cass',
      name: 'F. Cass Publishers',
      city: 'London ; Portland, Ore.',
      country: 'UK / USA',
      worksCount: 1,
      workIds: ['work-iraq-lukitz']
    },
    source: 'seed',
    catalogingInterface: 'Libris XL / Kungliga biblioteket',
    createdAt: '2026-03-06T10:00:00Z',
    modifiedAt: '2026-10-09T18:00:00Z'
  },
  {
    id: 'work-iraq-cartographic',
    uri: getEntityIri('work', 'work-iraq-cartographic'),
    canonicalMoonUri: 'moon:work:iraq-cartographic:1986',
    title: '[Iraq] = ʻIrāq',
    subtitle: 'Topographic Series 1:100,000 / الخارطة الطبوغرافية الموحدة لجمهورية العراق',
    language: 'mul',
    languageLabel: 'العربية والإنجليزية (Arabic & English)',
    summaryArabic: 'المجموعة الخرائطية الطبوغرافية الكاملة لجمهورية العراق بمقياس رسم 1:100,000، تتضمن 451 لوحة ملونة تفصيلية للتضاريس والمواقع المأهولة والمياه والحدود.',
    summaryEnglish: 'Comprehensive topographic map series of Iraq at scale 1:100,000 produced by Iraq Survey Directorate comprising 451 full-color sheets.',
    originDate: '1986-2002',
    era: '1986 – 2002',
    genreForm: ['خرائط طبوغرافية', 'Cartographic Material', 'خرائط عسكرية وجغرافية'],
    classificationDdc: '912.567',
    classificationLcc: 'G7610 s100 .I7',
    primaryCreator: {
      id: 'person-iraq-survey-dir',
      uri: getEntityIri('agent', 'person-iraq-survey-dir'),
      canonicalMoonUri: 'moon:agent:iraq-survey-directorate',
      name: 'مديرية المساحة العسكرية العراقية',
      nameArabic: 'العراق. مديرية المساحة العامة / العسكرية، مساح ورسام خرائط',
      nameEnglish: 'Iraq. Jaysh. Survey Directorate, Cartographer',
      role: 'Cartographer / مساح جغرافي',
      avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80',
      locUri: 'http://id.loc.gov/authorities/names/n88647039',
      city: 'بغداد (الدورة)',
      disciplines: ['المساحة الجغرافية', 'علم الخرائط الطبوغرافية'],
      worksCount: 1,
      workIds: ['work-iraq-cartographic']
    },
    contributors: [],
    subjects: [
      {
        id: 'subj-iraq-maps',
        uri: getEntityIri('subject', 'subj-iraq-maps'),
        label: 'Iraq -- Maps, Topographic',
        labelEnglish: 'العراق -- خرائط طبوغرافية تفصيلية',
        scheme: 'lcsh',
        notationDdc: '912.567',
        worksCount: 1,
        workIds: ['work-iraq-cartographic']
      }
    ],
    instances: [
      {
        id: 'inst-iraq-maps-loc',
        uri: getEntityIri('instance', 'inst-iraq-maps-loc'),
        title: '[Iraq] = ʻIrāq',
        subtitle: 'طبعة الدورة الأولى المعتمدة',
        workId: 'work-iraq-cartographic',
        workTitle: '[Iraq] = ʻIrāq',
        publisher: 'مديرية المساحة العسكرية',
        publicationPlace: 'al-Dawrah, Iraq : Directorate',
        publicationYear: '1986-2002',
        extent: '451 maps : color ; 55 x 68 cm',
        callNumber: 'G7610 s100 .I7',
        shelfLocation: 'قسم الخرائط والمواد الجغرافية',
        holdingStatus: 'not_connected',
        carrierType: 'خرائط ورقية ملونة مصورة'
      }
    ],
    publisher: {
      id: 'pub-survey-dawrah',
      name: 'مديرية المساحة - الدورة',
      city: 'بغداد (الدورة)',
      country: 'العراق',
      worksCount: 1,
      workIds: ['work-iraq-cartographic']
    },
    source: 'seed',
    catalogingInterface: 'Library of Congress Cataloging',
    createdAt: '2026-03-07T12:00:00Z',
    modifiedAt: '2026-10-09T18:00:00Z'
  }
];

// =========================================================================
// WOF MOON LINKED OPAC SERVICE IMPLEMENTATION
// =========================================================================

class WolfMoonOpacService {
  private works: OpacWorkEntity[] = [];
  private personsMap: Map<string, OpacPersonEntity> = new Map();
  private subjectsMap: Map<string, OpacSubjectEntity> = new Map();
  private publishersMap: Map<string, OpacPublisherEntity> = new Map();
  private initialized: boolean = false;
  private subscribers: (() => void)[] = [];

  constructor() {
    this.initDatabase();
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== cb);
    };
  }

  private notify() {
    this.subscribers.forEach(cb => cb());
  }

  /**
   * Initializes the shared database from Supabase + localStorage + Authority Profiles
   * ONLY loads the user's real backend records.
   */
  public async initDatabase(): Promise<void> {
    if (this.initialized) return;

    const gatheredWorks: OpacWorkEntity[] = [];

    // 1. Load real records from the Wolf backend storage (Supabase + localStorage cache)
    try {
      const realRecords = await getAllRecords();
      if (Array.isArray(realRecords) && realRecords.length > 0) {
        for (const r of realRecords) {
          const parsed = this.parseBibframeDocumentToOpacWork(r);
          if (parsed && !gatheredWorks.some(gw => gw.id === parsed.id || gw.title === parsed.title)) {
            gatheredWorks.push(parsed);
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching real records from backend storage:', e);
    }

    // 2. Also inspect raw localStorage for any additional user records
    try {
      if (typeof window !== 'undefined') {
        const extraKeys = ['bibframe_saved_records', 'bibframe-records', 'moon_records_v1'];
        for (const k of extraKeys) {
          const raw = localStorage.getItem(k);
          if (raw) {
            try {
              const parsedArr = JSON.parse(raw);
              if (Array.isArray(parsedArr)) {
                for (const item of parsedArr) {
                  const p = this.parseBibframeDocumentToOpacWork(item);
                  if (p && !gatheredWorks.some(gw => gw.id === p.id || gw.title === p.title)) {
                    gatheredWorks.push(p);
                  }
                }
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      console.warn('Error reading extra localStorage records:', e);
    }

    // 2b. Load authentic benchmark BIBFRAME 2.0 records (including Al-Qabasat - Mir Damad with full WEMI connections)
    try {
      if (Array.isArray(realLocExamples)) {
        for (const locEx of realLocExamples) {
          const parsed = this.parseBibframeDocumentToOpacWork(locEx);
          if (parsed && !gatheredWorks.some(gw => gw.id === parsed.id || gw.title === parsed.title)) {
            // Clearly mark benchmark demonstration records
            parsed.source = 'seed';
            gatheredWorks.unshift(parsed);
          }
        }
      }
    } catch (e) {
      console.warn('Error loading realLocExamples:', e);
    }

    // 3. Register Saved Authority Profiles from AuthorFinder
    // Store authority details in personsMap without creating synthetic unverified catalog Works
    try {
      if (typeof window !== 'undefined') {
        const authStr = localStorage.getItem('moon_saved_author_authority_records_v1');
        if (authStr) {
          const profiles: AISuggestionProfile[] = JSON.parse(authStr);
          profiles.forEach((p, idx) => {
            const authorName = p.suggestedNameArabic || p.primarySuggestion;
            const authorEn = p.suggestedNameEnglish || p.primarySuggestion;
            const personId = `person-${p.moonUri.replace(/[^a-zA-Z0-9]/g, '-') || idx}`;
            const suggestedTitles = (p.majorWorks || []).map(w => w.title);

            if (!this.personsMap.has(authorName)) {
              this.personsMap.set(authorName, {
                id: personId,
                uri: getEntityIri('agent', personId),
                canonicalMoonUri: p.moonUri,
                name: authorName,
                nameArabic: authorName,
                nameEnglish: authorEn,
                birthDate: p.birthDate,
                deathDate: p.deathDate,
                lifespan: [p.birthDate, p.deathDate].filter(Boolean).join(' – '),
                role: 'Author (مؤلف)',
                bioArabic: p.summaryAr,
                bioEnglish: p.summaryEn,
                disciplines: p.disciplines,
                affiliation: p.affiliation,
                city: p.birthCity,
                worksCount: 0,
                workIds: [],
                suggestedWorks: suggestedTitles
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Error reading local authority profiles for OPAC:', e);
    }

    // 4. Fallback to audited benchmark seed works only if no stored records exist
    if (gatheredWorks.length === 0) {
      gatheredWorks.push(...SEED_WORKS);
    }

    // 5. Index all entities & resolve bidirectional relations
    this.works = gatheredWorks;
    this.rebuildEntityIndexes();
    this.initialized = true;
    this.notify();
  }

  /**
   * Saves a synthesized Multi-Source AI Author Profile directly to the system
   * (persisting in localStorage, firing system event, updating OPAC in real time)
   */
  public saveMultiSourceAuthorProfile(profile: AISuggestionProfile): { success: boolean; uri: string; recordId: string } {
    const res = saveAuthorityProfileToMoonSystem(profile);
    if (res.success) {
      this.initialized = false;
      this.initDatabase();
    }
    return res;
  }

  /**
   * Parses raw BIBFRAME JSON-LD into unified OpacWorkEntity with full graph dereferencing
   */
  private parseBibframeDocumentToOpacWork(recordObj: any): OpacWorkEntity | null {
    try {
      const doc = recordObj.record || recordObj.document || recordObj.graphJson || recordObj.data || recordObj;
      let graph: any[] = doc?.['@graph'] || (Array.isArray(doc) ? doc : []);
      if (graph.length === 0 && doc && (doc.work || doc.instance)) {
        graph = [doc.work, doc.instance].filter(Boolean);
      }
      if (!graph || !Array.isArray(graph) || graph.length === 0) {
        if (doc && typeof doc === 'object') {
          graph = [doc];
        } else {
          return null;
        }
      }

      // 1. Build Node Map for complete graph dereferencing
      const nodeMap = new Map<string, any>();
      for (const node of graph) {
        if (node && typeof node === 'object' && node['@id']) {
          nodeMap.set(node['@id'], node);
        }
      }

      const deref = (val: any): any => {
        if (typeof val === 'string' && nodeMap.has(val)) {
          return nodeMap.get(val);
        }
        return val;
      };

      // 2. Identify Work and Instance nodes
      const workNode = graph.find((n: any) => {
        if (!n || typeof n !== 'object') return false;
        const t = Array.isArray(n['@type']) ? n['@type'] : [n['@type']];
        return t.some((typeStr: string) => typeof typeStr === 'string' && (typeStr.includes('Work') || typeStr.includes('Text')));
      }) || doc?.work || graph[0] || {};

      const instanceNode = graph.find((n: any) => {
        if (!n || typeof n !== 'object') return false;
        const t = Array.isArray(n['@type']) ? n['@type'] : [n['@type']];
        return t.some((typeStr: string) => typeof typeStr === 'string' && typeStr.includes('Instance'));
      }) || doc?.instance || {};

      // 3. Resolve Title & Subtitle (handling direct values or dereferenced Title nodes)
      const rawTitleNode = deref(workNode['bf:title'] || workNode['title']);
      let titleStr = recordObj.title || '';
      let subtitleStr = '';

      if (rawTitleNode && typeof rawTitleNode === 'object') {
        const mTitle = rawTitleNode['bf:mainTitle'] || rawTitleNode['mainTitle'] || rawTitleNode['rdfs:label'] || rawTitleNode['value'];
        if (mTitle) titleStr = typeof mTitle === 'object' ? (mTitle.value || JSON.stringify(mTitle)) : String(mTitle);
        const sub = rawTitleNode['bf:subtitle'] || rawTitleNode['subtitle'];
        if (sub) subtitleStr = typeof sub === 'object' ? (sub.value || JSON.stringify(sub)) : String(sub);
      }

      if (!titleStr && typeof workNode['mainTitle'] === 'string') {
        titleStr = workNode['mainTitle'];
      }
      if (!titleStr && typeof workNode['rdfs:label'] === 'string') {
        titleStr = workNode['rdfs:label'];
      }

      // Cleanup trailing punctuation often found in MARC/BIBFRAME (e.g. "Title :")
      titleStr = (titleStr || '').trim().replace(/[\s:;,\/]+$/, '');
      subtitleStr = (subtitleStr || '').trim().replace(/[\s:;,\/]+$/, '');

      // Filter out completely empty or blank placeholder drafts
      if (!titleStr || titleStr.toLowerCase() === 'untitled' || titleStr.toLowerCase() === 'untitled record') {
        const hasSubstantialData = workNode['subject'] || workNode['originDate'] || instanceNode['responsibilityStatement'];
        if (!hasSubstantialData) {
          return null; // Skip blank stubs without content
        }
        titleStr = subtitleStr ? subtitleStr : 'مصنف مكتبي غير معنون';
      }

      // 4. Resolve Creators and Contributors (from responsibility statement, bf:contribution, bf:creator)
      let primaryCreatorName = '';
      let primaryRole = 'Author (مؤلف)';
      const contributorsList: OpacPersonEntity[] = [];

      const respStatement = instanceNode['responsibilityStatement'] || instanceNode['bf:responsibilityStatement'] || '';
      if (respStatement && typeof respStatement === 'string') {
        // e.g. "By Mohammad reza al-Khaghani ; Translator : Yasser Pouresmaeil."
        const parts = respStatement.replace(/^By\s+/i, '').split(';');
        if (parts.length > 0) {
          const authPart = parts[0].trim();
          if (authPart) primaryCreatorName = authPart;
        }
        if (parts.length > 1) {
          for (let i = 1; i < parts.length; i++) {
            const rawPart = parts[i].trim();
            let cRole = 'Contributor (مشارك)';
            let cName = rawPart;
            if (rawPart.toLowerCase().includes('translator')) {
              cRole = 'Translator (مترجم)';
              cName = rawPart.replace(/^Translator\s*:\s*/i, '').trim();
            } else if (rawPart.toLowerCase().includes('editor')) {
              cRole = 'Editor (محرر / محقق)';
              cName = rawPart.replace(/^Editor\s*:\s*/i, '').trim();
            }
            if (cName) {
              const cId = `person-${encodeURIComponent(cName.slice(0, 30))}`;
              contributorsList.push({
                id: cId,
                uri: `https://moonlib.org/entity/person/${cId}`,
                canonicalMoonUri: `moon:person:${cId}`,
                name: cName,
                nameArabic: cName,
                role: cRole,
                worksCount: 1,
                workIds: [recordObj.id]
              });
            }
          }
        }
      }

      // Inspect bf:contribution array
      const rawContributions = workNode['bf:contribution'] || workNode['contribution'];
      const contribArr = Array.isArray(rawContributions) ? rawContributions : (rawContributions ? [rawContributions] : []);
      for (const contrib of contribArr) {
        const cNode = deref(contrib);
        const agentNode = deref(cNode?.['bf:agent'] || cNode?.['agent']);
        const agentLabel = agentNode?.['rdfs:label'] || agentNode?.['name'] || (typeof agentNode === 'string' ? agentNode : '');
        const roleLabel = cNode?.['bf:role']?.['rdfs:label'] || cNode?.['role'] || 'مؤلف';
        if (agentLabel && typeof agentLabel === 'string') {
          if (!primaryCreatorName) {
            primaryCreatorName = agentLabel.trim();
            primaryRole = roleLabel;
          } else if (agentLabel.trim() !== primaryCreatorName && !contributorsList.some(c => c.nameArabic === agentLabel.trim())) {
            const cId = `person-${encodeURIComponent(agentLabel.trim().slice(0, 30))}`;
            contributorsList.push({
              id: cId,
              uri: `https://moonlib.org/entity/person/${cId}`,
              canonicalMoonUri: `moon:person:${cId}`,
              name: agentLabel.trim(),
              nameArabic: agentLabel.trim(),
              role: roleLabel,
              worksCount: 1,
              workIds: [recordObj.id]
            });
          }
        }
      }

      // Fallback creator label only if completely missing
      const primaryCreatorFinal = primaryCreatorName || 'مؤلف غير محدد (Unspecified Creator)';
      const personId = `person-${encodeURIComponent(primaryCreatorFinal.slice(0, 35))}`;
      const primaryCreatorEntity: OpacPersonEntity = {
        id: personId,
        uri: getEntityIri('agent', personId),
        canonicalMoonUri: `moon:person:${personId}`,
        name: primaryCreatorFinal,
        nameArabic: primaryCreatorFinal,
        role: primaryRole,
        worksCount: 1,
        workIds: [recordObj.id || 'work-1']
      };

      // 5. Summary, Table of Contents, and Notes
      const rawSummaryNode = deref(workNode['bf:summary'] || workNode['summary']);
      let summaryStr = '';
      if (rawSummaryNode && typeof rawSummaryNode === 'object') {
        summaryStr = rawSummaryNode['rdfs:label'] || rawSummaryNode['value'] || '';
      } else if (typeof rawSummaryNode === 'string') {
        summaryStr = rawSummaryNode;
      }

      const rawTocNode = deref(workNode['bf:tableOfContents'] || workNode['tableOfContents']);
      let tocStr = '';
      if (rawTocNode && typeof rawTocNode === 'object') {
        tocStr = rawTocNode['rdfs:label'] || rawTocNode['value'] || '';
      } else if (typeof rawTocNode === 'string') {
        tocStr = rawTocNode;
      }

      // 6. Subjects resolution (Zero fabrication: if empty, remains empty)
      const rawSubjects = workNode['bf:subject'] || workNode['subject'] || workNode['topical'] || [];
      const subjectsArr = Array.isArray(rawSubjects) ? rawSubjects : [rawSubjects];
      const subjectsList: OpacSubjectEntity[] = [];

      for (const subj of subjectsArr) {
        const sNode = deref(subj);
        let sLabel = '';
        let sUri = '';

        if (typeof sNode === 'string') {
          sUri = sNode;
          const uriSegments = sNode.split('/');
          sLabel = decodeURIComponent(uriSegments[uriSegments.length - 1] || '');
        } else if (sNode && typeof sNode === 'object') {
          sUri = sNode['@id'] || '';
          sLabel = sNode['rdfs:label'] || sNode['value'] || sNode['label'] || '';
        }

        if (sLabel && !subjectsList.some(s => s.label === sLabel)) {
          const sId = `subj-${encodeURIComponent(sLabel.slice(0, 30))}`;
          subjectsList.push({
            id: sId,
            uri: sUri || getEntityIri('subject', sId),
            label: sLabel,
            scheme: sUri.includes('loc.gov') ? 'lcsh' : 'arabic-authority',
            worksCount: 1,
            workIds: [recordObj.id || 'work-1']
          });
        }
      }

      const workId = recordObj.id || (workNode['@id'] ? workNode['@id'].replace(/^.*[/#]/, '') : `work-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`);

      // 7. Instances & Item nodes extraction directly from graph
      // Gather all Instance nodes
      const allInstanceNodes = graph.filter((n: any) => {
        if (!n || typeof n !== 'object') return false;
        const t = Array.isArray(n['@type']) ? n['@type'] : [n['@type']];
        return t.some((typeStr: string) => typeof typeStr === 'string' && typeStr.includes('Instance'));
      });
      if (allInstanceNodes.length === 0 && instanceNode && Object.keys(instanceNode).length > 0) {
        allInstanceNodes.push(instanceNode);
      }

      // Gather all Item nodes present in graph
      const allItemNodes = graph.filter((n: any) => {
        if (!n || typeof n !== 'object') return false;
        const t = Array.isArray(n['@type']) ? n['@type'] : [n['@type']];
        return t.some((typeStr: string) => typeof typeStr === 'string' && typeStr.includes('Item'));
      });

      const instancesList: OpacInstanceEntity[] = [];
      const workHoldingItems: OpacHoldingItem[] = [];

      allInstanceNodes.forEach((instN: any, instIdx: number) => {
        const instId = instN['@id'] ? instN['@id'].replace(/^.*[/#]/, '') : `inst-${workId}-${instIdx + 1}`;
        const instTitleNode = deref(instN['bf:title'] || instN['title']);
        let instTitleStr = titleStr;
        let instSubStr = subtitleStr;
        if (instTitleNode && typeof instTitleNode === 'object') {
          const mt = instTitleNode['bf:mainTitle'] || instTitleNode['mainTitle'] || instTitleNode['rdfs:label'];
          if (mt) instTitleStr = typeof mt === 'object' ? (mt.value || JSON.stringify(mt)) : String(mt);
          const st = instTitleNode['bf:subtitle'] || instTitleNode['subtitle'];
          if (st) instSubStr = typeof st === 'object' ? (st.value || JSON.stringify(st)) : String(st);
        }

        // Provision activity / publication (no fabrication: undefined if missing)
        const provAgent = instN['bf:provisionActivity']?.['bf:agent']?.['rdfs:label'] ||
          instN['provisionActivity']?.['agent'] ||
          instN['publisher'];
        const publisherName = provAgent && typeof provAgent === 'string' ? provAgent.trim() : undefined;

        const provDate = instN['bf:provisionActivity']?.['bf:date'] ||
          instN['bf:provisionActivity']?.['bflc:simpleDate'] ||
          instN['publicationYear'] ||
          instN['publicationDate'] ||
          instN['copyrightDate'] ||
          workNode['originDate'];
        const pubYear = provDate && typeof provDate === 'string' ? provDate.trim() : undefined;

        const provPlace = instN['bf:provisionActivity']?.['bf:place']?.['rdfs:label'] ||
          instN['place'] ||
          instN['placeOfPublication'] ||
          instN['publicationPlace'];
        const pubPlace = provPlace && typeof provPlace === 'string' ? provPlace.trim() : undefined;

        // Extent & Carrier
        const extRaw = instN['extent'] || instN['bf:extent']?.['rdfs:label'] || instN['bf:extent']?.['value'];
        const extentVal = extRaw && typeof extRaw === 'string' ? extRaw.trim() : undefined;

        const carrierRaw = instN['carrier'] || instN['carrierType'] || instN['bf:carrier']?.['rdfs:label'];
        const carrierVal = carrierRaw && typeof carrierRaw === 'string' ? carrierRaw.trim() : undefined;

        const dimRaw = instN['dimensions'] || instN['bf:dimensions'];
        const dimVal = dimRaw && typeof dimRaw === 'string' ? dimRaw.trim() : undefined;

        // Classification & Call Number
        const shelfRaw = instN['shelfMark'] || instN['classification'] || instN['bf:classification']?.['rdfs:label'];
        const shelfMarkVal = shelfRaw && typeof shelfRaw === 'string' ? shelfRaw.trim() : undefined;

        const locRaw = instN['shelfLocation'] || instN['heldBy'];
        const shelfLocVal = locRaw && typeof locRaw === 'string' ? locRaw.trim() : undefined;

        // ISBN
        let isbnVal: string | undefined = instN['isbn'] || instN['identifiedBy']?.['isbn'];
        if (!isbnVal && Array.isArray(instN['bf:identifiedBy'])) {
          const isbnObj = instN['bf:identifiedBy'].find((x: any) => x && (x['@type'] === 'bf:Isbn' || x['@type'] === 'Isbn'));
          if (isbnObj) isbnVal = isbnObj['rdf:value'] || isbnObj['value'];
        }

        // Real items connected to this instance
        const instanceItems: OpacHoldingItem[] = [];

        // Check embedded bf:hasItem
        const rawHasItem = instN['bf:hasItem'] || instN['hasItem'];
        const embeddedItems = Array.isArray(rawHasItem) ? rawHasItem : (rawHasItem ? [rawHasItem] : []);

        // Also check graph items referencing this instance
        const matchedGraphItems = allItemNodes.filter((itNode: any) => {
          const itOf = itNode['bf:itemOf'] || itNode['itemOf'];
          const itOfId = typeof itOf === 'object' ? itOf?.['@id'] : itOf;
          return itOfId === instN['@id'] || (allInstanceNodes.length === 1);
        });

        const combinedItemCandidates = [...embeddedItems, ...matchedGraphItems];
        const seenItemIds = new Set<string>();

        combinedItemCandidates.forEach((rawIt, itIdx) => {
          const itNode = deref(rawIt);
          if (!itNode || typeof itNode !== 'object') return;
          const itemId = itNode['@id'] ? itNode['@id'].replace(/^.*[/#]/, '') : `item-${instId}-${itIdx + 1}`;
          if (seenItemIds.has(itemId)) return;
          seenItemIds.add(itemId);

          const itHeldBy = itNode['bf:heldBy']?.['rdfs:label'] || itNode['heldBy'] || shelfLocVal;
          const itShelfMark = itNode['bf:shelfMark'] || itNode['shelfMark'] || shelfMarkVal;
          const itBarcode = itNode['bf:barcode'] || itNode['barcode'];
          const itAccessUrl = itNode['accessUrl'] || itNode['bf:electronicLocator'];

          // Honest status determination: only 'digital_access' if URL exists, or reference_only if marked
          let itStatus: 'available' | 'reference_only' | 'digital_access' | 'not_connected' = 'not_connected';
          if (itAccessUrl) {
            itStatus = 'digital_access';
          } else if (itNode['status'] === 'reference_only' || instN['holdingStatus'] === 'reference_only') {
            itStatus = 'reference_only';
          } else if (itNode['status'] === 'available') {
            itStatus = 'available';
          }

          const itemEntity: OpacHoldingItem = {
            id: itemId,
            uri: getEntityIri('item', itemId),
            instanceId: instId,
            heldBy: itHeldBy,
            shelfMark: itShelfMark,
            barcode: itBarcode,
            immediateAcquisition: itNode['immediateAcquisition'] || itNode['bf:immediateAcquisition'],
            acquisitionSource: itNode['acquisitionSource'] || itNode['bf:acquisitionSource'],
            extent: itNode['extent'] || extentVal,
            dimensions: itNode['dimensions'] || dimVal,
            notation: itNode['notation'] || instN['notation'],
            notes: Array.isArray(itNode['notes']) ? itNode['notes'] : (itNode['note'] ? [itNode['note']] : []),
            status: itStatus,
            accessUrl: itAccessUrl
          };

          instanceItems.push(itemEntity);
          workHoldingItems.push(itemEntity);
        });

        // Determine Instance holdingStatus honestly
        let instHoldingStatus: 'available' | 'reference_only' | 'digital_access' | 'not_connected' = 'not_connected';
        if (instanceItems.some(it => it.status === 'digital_access')) {
          instHoldingStatus = 'digital_access';
        } else if (instanceItems.some(it => it.status === 'reference_only')) {
          instHoldingStatus = 'reference_only';
        } else if (instanceItems.some(it => it.status === 'available')) {
          instHoldingStatus = 'available';
        }

        instancesList.push({
          id: instId,
          uri: getEntityIri('instance', instId),
          title: instTitleStr,
          subtitle: instSubStr || undefined,
          workId: workId,
          workTitle: titleStr,
          publisher: publisherName,
          publicationPlace: pubPlace,
          publicationYear: pubYear,
          extent: extentVal,
          dimensions: dimVal,
          carrierType: carrierVal,
          callNumber: shelfMarkVal,
          shelfLocation: shelfLocVal,
          isbn: isbnVal,
          holdingStatus: instHoldingStatus,
          items: instanceItems
        });
      });

      // 8. Extract real BIBFRAME relationships (only when present in source data)
      const relatedWorks: OpacBibframeRelation[] = [];

      const exprOfNode = deref(workNode['bf:expressionOf'] || workNode['expressionOf']);
      if (exprOfNode) {
        const hUri = typeof exprOfNode === 'object' ? (exprOfNode['@id'] || '') : String(exprOfNode);
        const hLabel = typeof exprOfNode === 'object' ? (exprOfNode['bflc:aap'] || exprOfNode['rdfs:label'] || exprOfNode['title'] || '') : String(exprOfNode);
        if (hLabel || hUri) {
          relatedWorks.push({
            predicate: 'bf:expressionOf',
            predicateLabel: 'المجمع التعبيري العام (Expression Hub)',
            targetTitle: hLabel || `${titleStr} — مجمع تعبيري`,
            targetUri: hUri || undefined,
            targetType: 'bf:Hub'
          });
        }
      }

      const relToNode = deref(workNode['bf:relatedTo'] || workNode['relatedTo'] || instanceNode['bf:relatedTo'] || instanceNode['relatedTo']);
      if (relToNode) {
        const rUri = typeof relToNode === 'object' ? relToNode['@id'] : undefined;
        const rLabel = typeof relToNode === 'object' ? (relToNode['rdfs:label'] || relToNode['title'] || '') : String(relToNode);
        if (rLabel || rUri) {
          relatedWorks.push({
            predicate: 'bf:relatedTo',
            predicateLabel: 'عمل مرجعي وتوثيق ببليوغرافي (Related Work)',
            targetTitle: rLabel || 'عمل مرجعي مرتبط',
            targetUri: rUri,
            targetType: 'bf:Work'
          });
        }
      }

      const derivNode = deref(workNode['bf:hasDerivative'] || workNode['hasDerivative']);
      if (derivNode) {
        const dUri = typeof derivNode === 'object' ? derivNode['@id'] : undefined;
        const dLabel = typeof derivNode === 'object' ? (derivNode['rdfs:label'] || derivNode['title'] || '') : String(derivNode);
        if (dLabel || dUri) {
          relatedWorks.push({
            predicate: 'bf:hasDerivative',
            predicateLabel: 'شرح / مصنف مشتق (Derivative Work)',
            targetTitle: dLabel || 'مصنف مشتق',
            targetUri: dUri,
            targetType: 'bf:Work'
          });
        }
      }

      const seriesNode = deref(workNode['bf:hasSeries'] || workNode['hasSeries'] || instanceNode['bf:hasSeries'] || instanceNode['hasSeries']);
      let seriesStr: string | undefined = undefined;
      if (seriesNode) {
        const sLabel = typeof seriesNode === 'object' ? (seriesNode['bf:title'] || seriesNode['title'] || seriesNode['rdfs:label'] || '') : String(seriesNode);
        const sNum = typeof seriesNode === 'object' ? seriesNode['number'] : '';
        seriesStr = sLabel ? `${sLabel}${sNum ? ' — ' + sNum : ''}` : undefined;
        if (sLabel) {
          relatedWorks.push({
            predicate: 'bf:hasSeries',
            predicateLabel: 'سلسلة ببليوغرافية (Monographic Series)',
            targetTitle: seriesStr || sLabel,
            targetType: 'bf:Series',
            details: sNum ? `رقم السلسلة: ${sNum}` : undefined
          });
        }
      }

      const partOfNode = deref(workNode['bf:partOf'] || workNode['partOf'] || instanceNode['bf:partOf'] || instanceNode['partOf']);
      if (partOfNode) {
        const pLabel = typeof partOfNode === 'object' ? (partOfNode['rdfs:label'] || '') : String(partOfNode);
        if (pLabel) {
          relatedWorks.push({
            predicate: 'bf:partOf',
            predicateLabel: 'مجموعة وحاوية الحفظ (Collection / Fond)',
            targetTitle: pLabel,
            targetType: 'bf:Collection'
          });
        }
      }

      const hasPartNode = deref(workNode['bf:hasPart'] || workNode['hasPart'] || instanceNode['bf:hasPart'] || instanceNode['hasPart']);
      if (hasPartNode) {
        const hpLabel = typeof hasPartNode === 'object' ? (hasPartNode['rdfs:label'] || '') : String(hasPartNode);
        if (hpLabel) {
          relatedWorks.push({
            predicate: 'bf:hasPart',
            predicateLabel: 'قسم / جزء من العمل (Constituent Part)',
            targetTitle: hpLabel,
            targetType: 'bf:Part'
          });
        }
      }

      const hasExpNode = deref(workNode['bf:hasExpression'] || workNode['hasExpression']);
      if (hasExpNode) {
        const heLabel = typeof hasExpNode === 'object' ? (hasExpNode['rdfs:label'] || '') : String(hasExpNode);
        if (heLabel) {
          relatedWorks.push({
            predicate: 'bf:hasExpression',
            predicateLabel: 'تعبير محفوظ معتمد (Realized Expression)',
            targetTitle: heLabel,
            targetType: 'bf:Instance'
          });
        }
      }

      // 9. Codicological & Bibliographic Notes
      const notesList: string[] = [];
      let incipitStr: string | undefined = undefined;
      let explicitStr: string | undefined = undefined;

      const rawNotes = [
        ...(Array.isArray(workNode['bf:note']) ? workNode['bf:note'] : [workNode['bf:note']]),
        ...(Array.isArray(instanceNode['bf:note']) ? instanceNode['bf:note'] : [instanceNode['bf:note']]),
        ...(Array.isArray(workNode['note']) ? workNode['note'] : (typeof workNode['note'] === 'string' ? workNode['note'].split('\n') : [])),
        ...(Array.isArray(instanceNode['note']) ? instanceNode['note'] : (typeof instanceNode['note'] === 'string' ? instanceNode['note'].split('\n') : []))
      ].filter(Boolean);

      for (const n of rawNotes) {
        const nLabel = typeof n === 'object' ? (n['rdfs:label'] || n['value'] || '') : String(n);
        if (nLabel && !notesList.includes(nLabel)) {
          notesList.push(nLabel);
          if (nLabel.includes('أوله') || nLabel.includes('Incipit')) incipitStr = nLabel;
          if (nLabel.includes('آخره') || nLabel.includes('Explicit')) explicitStr = nLabel;
        }
      }

      // 10. Origin Date & Era
      const originDateVal = typeof workNode['originDate'] === 'string' ? workNode['originDate'] : (instancesList[0]?.publicationYear || undefined);
      let eraStr: string | undefined = undefined;
      if (originDateVal) {
        const yearNum = parseInt(originDateVal.replace(/[^0-9]/g, '').slice(0, 4), 10);
        if (yearNum > 0) {
          if (yearNum >= 2000) eraStr = 'القرن الحادي والعشرون (2000+)';
          else if (yearNum >= 1900) eraStr = 'القرن العشرون';
          else if (yearNum >= 1800) eraStr = 'القرن التاسع عشر';
          else if (yearNum >= 1600) eraStr = 'القرن السابع عشر الميلادي';
          else if (yearNum >= 1000) eraStr = 'العصر الإسلامي الوسيط';
        }
      }

      // 11. Raw RDF Triples (derived strictly from real properties)
      const rawTriples: Array<{ subject: string; predicate: string; object: string; objectUri?: string }> = [
        { subject: workId, predicate: 'rdf:type', object: 'bf:Work / bf:Text', objectUri: 'http://id.loc.gov/ontologies/bibframe/Work' },
        { subject: workId, predicate: 'bf:title', object: titleStr }
      ];

      if (primaryCreatorName) {
        rawTriples.push({
          subject: workId,
          predicate: 'bf:contribution',
          object: `${primaryCreatorName} (${primaryRole})`,
          objectUri: primaryCreatorEntity.uri
        });
      }

      const langCode = workNode['bf:language']?.['@id'] || workNode['language'] || 'ara';
      rawTriples.push({
        subject: workId,
        predicate: 'bf:language',
        object: langCode === 'ara' ? 'العربية (ara)' : langCode,
        objectUri: `http://id.loc.gov/vocabulary/languages/${langCode}`
      });

      const classLccVal = workNode['classification'] || workNode['bf:classification']?.['rdfs:label'] || instancesList[0]?.callNumber;
      if (classLccVal) {
        rawTriples.push({ subject: workId, predicate: 'bf:classification', object: classLccVal });
      }

      subjectsList.forEach(s => {
        rawTriples.push({ subject: workId, predicate: 'bf:subject', object: s.label, objectUri: s.uri });
      });

      relatedWorks.forEach(rw => {
        rawTriples.push({ subject: workId, predicate: rw.predicate, object: rw.targetTitle, objectUri: rw.targetUri });
      });

      instancesList.forEach(inst => {
        rawTriples.push({ subject: inst.id, predicate: 'bf:instanceOf', object: workId });
        (inst.items || []).forEach(it => {
          rawTriples.push({
            subject: inst.id,
            predicate: 'bf:hasItem',
            object: `${it.heldBy || 'Item'} [${it.shelfMark || it.id}]`,
            objectUri: it.uri
          });
        });
      });

      const firstPublisherName = instancesList[0]?.publisher;
      const publisherEntity: OpacPublisherEntity | undefined = firstPublisherName ? {
        id: `pub-${encodeURIComponent(firstPublisherName.slice(0, 30))}`,
        name: firstPublisherName,
        city: instancesList[0]?.publicationPlace,
        worksCount: 1,
        workIds: [workId]
      } : undefined;

      return {
        id: workId,
        uri: getEntityIri('work', workId),
        canonicalMoonUri: `moon:work:${workId}`,
        title: titleStr,
        subtitle: subtitleStr || undefined,
        language: langCode,
        languageLabel: langCode === 'ara' ? 'العربية (Arabic)' : (langCode === 'eng' ? 'الإنجليزية (English)' : langCode),
        summaryArabic: summaryStr || undefined,
        originDate: originDateVal,
        era: eraStr,
        primaryCreator: primaryCreatorEntity,
        contributors: contributorsList,
        subjects: subjectsList,
        instances: instancesList,
        publisher: publisherEntity,
        classificationDdc: workNode['classificationDdc'] || workNode['bf:classificationDdc'],
        classificationLcc: classLccVal,
        tableOfContents: tocStr || undefined,
        series: seriesStr,
        notes: notesList,
        incipit: incipitStr,
        explicit: explicitStr,
        extent: instancesList[0]?.extent,
        dimensions: instancesList[0]?.dimensions,
        notation: workNode['notation'] || instanceNode['notation'],
        adminMetadata: workNode['adminMetadata'] || 'Wolf Moon OPAC | BIBFRAME 2.0',
        relatedWorks: relatedWorks,
        holdingItems: workHoldingItems,
        rawBibframeTriples: rawTriples,
        source: recordObj.source || 'wolf-moon',
        catalogingInterface: recordObj.metadata?.catalogingInterface || 'Wolf Moon Cataloger',
        createdAt: recordObj.metadata?.created || recordObj.saved || new Date().toISOString(),
        modifiedAt: recordObj.metadata?.modified || recordObj.saved || new Date().toISOString(),
        document: doc
      };
    } catch (err) {
      console.warn('Error parsing BIBFRAME document for OPAC:', err);
      return null;
    }
  }

  /**
   * Rebuilds indices of Persons, Subjects, and Publishers for instant O(1) lookups
   */
  private rebuildEntityIndexes() {
    this.personsMap.clear();
    this.subjectsMap.clear();
    this.publishersMap.clear();

    for (const work of this.works) {
      // 1. Index Primary Creator
      const creator = work.primaryCreator;
      if (creator) {
        const pKey = creator.nameArabic || creator.name;
        if (!this.personsMap.has(pKey)) {
          this.personsMap.set(pKey, {
            ...creator,
            workIds: [work.id],
            worksCount: 1
          });
        } else {
          const existing = this.personsMap.get(pKey)!;
          if (!existing.workIds.includes(work.id)) {
            existing.workIds.push(work.id);
            existing.worksCount = existing.workIds.length;
          }
        }
      }

      // 2. Index Contributors
      for (const contrib of work.contributors) {
        const cKey = contrib.nameArabic || contrib.name;
        if (!this.personsMap.has(cKey)) {
          this.personsMap.set(cKey, {
            ...contrib,
            workIds: [work.id],
            worksCount: 1
          });
        } else {
          const existing = this.personsMap.get(cKey)!;
          if (!existing.workIds.includes(work.id)) {
            existing.workIds.push(work.id);
            existing.worksCount = existing.workIds.length;
          }
        }
      }

      // 3. Index Subjects
      for (const subj of work.subjects) {
        const sKey = subj.label;
        if (!this.subjectsMap.has(sKey)) {
          this.subjectsMap.set(sKey, {
            ...subj,
            workIds: [work.id],
            worksCount: 1
          });
        } else {
          const existing = this.subjectsMap.get(sKey)!;
          if (!existing.workIds.includes(work.id)) {
            existing.workIds.push(work.id);
            existing.worksCount = existing.workIds.length;
          }
        }
      }

      // 4. Index Publishers
      if (work.publisher) {
        const pubKey = work.publisher.name;
        if (!this.publishersMap.has(pubKey)) {
          this.publishersMap.set(pubKey, {
            ...work.publisher,
            workIds: [work.id],
            worksCount: 1
          });
        } else {
          const existing = this.publishersMap.get(pubKey)!;
          if (!existing.workIds.includes(work.id)) {
            existing.workIds.push(work.id);
            existing.worksCount = existing.workIds.length;
          }
        }
      }
    }
  }

  // =========================================================================
  // PUBLIC ACCESSORS & LINKED TRAVERSAL QUERIES
  // =========================================================================

  public getAllWorks(): OpacWorkEntity[] {
    return this.works;
  }

  public getWorkByIdOrUri(idOrUri: string): OpacWorkEntity | undefined {
    return this.works.find(w => 
      w.id === idOrUri || 
      w.uri === idOrUri || 
      w.canonicalMoonUri === idOrUri
    );
  }

  /**
   * FULL PERSON RESOLVER (Share-VDE / Libris pattern):
   * Returns Person details + every work associated with that person.
   */
  public getPersonByNameOrUri(nameOrUri: string): { person: OpacPersonEntity; works: OpacWorkEntity[] } | undefined {
    let matchedPerson: OpacPersonEntity | undefined;
    
    // Exact or normalized lookup
    for (const [key, p] of this.personsMap.entries()) {
      if (
        key === nameOrUri ||
        p.id === nameOrUri ||
        p.uri === nameOrUri ||
        p.canonicalMoonUri === nameOrUri ||
        p.nameArabic.includes(nameOrUri) ||
        (p.nameEnglish && p.nameEnglish.toLowerCase() === nameOrUri.toLowerCase())
      ) {
        matchedPerson = p;
        break;
      }
    }

    if (!matchedPerson) return undefined;

    const works = this.works.filter(w => matchedPerson!.workIds.includes(w.id));
    return { person: matchedPerson, works };
  }

  /**
   * FULL SUBJECT RESOLVER:
   * Returns Subject details + every work tagged with that subject.
   */
  public getSubjectByLabelOrUri(labelOrUri: string): { subject: OpacSubjectEntity; works: OpacWorkEntity[] } | undefined {
    let matchedSubject: OpacSubjectEntity | undefined;

    for (const [key, s] of this.subjectsMap.entries()) {
      if (
        key === labelOrUri ||
        s.id === labelOrUri ||
        s.uri === labelOrUri ||
        s.label.includes(labelOrUri)
      ) {
        matchedSubject = s;
        break;
      }
    }

    if (!matchedSubject) return undefined;

    const works = this.works.filter(w => matchedSubject!.workIds.includes(w.id));
    return { subject: matchedSubject, works };
  }

  /**
   * FULL PUBLISHER RESOLVER:
   */
  public getPublisherByName(name: string): { publisher: OpacPublisherEntity; works: OpacWorkEntity[] } | undefined {
    const pub = this.publishersMap.get(name);
    if (!pub) return undefined;
    const works = this.works.filter(w => pub.workIds.includes(w.id));
    return { publisher: pub, works };
  }



  /**
   * ALL PERSONS DIRECTORY (Requested by user: "show every person")
   */
  public getAllPersons(): OpacPersonEntity[] {
    return Array.from(this.personsMap.values()).sort((a, b) => b.worksCount - a.worksCount);
  }

  /**
   * ALL SUBJECTS DIRECTORY (Requested by user: "show every subject")
   */
  public getAllSubjects(): OpacSubjectEntity[] {
    return Array.from(this.subjectsMap.values()).sort((a, b) => b.worksCount - a.worksCount);
  }

  /**
   * ALL PUBLISHERS DIRECTORY
   */
  public getAllPublishers(): OpacPublisherEntity[] {
    return Array.from(this.publishersMap.values()).sort((a, b) => b.worksCount - a.worksCount);
  }

  /**
   * Dynamic search with multi-dimensional faceting
   */
  /**
   * Dynamic search with multi-dimensional faceting and Unicode/Arabic normalization
   */
  public searchWorks(
    query: string = '',
    selectedSubject?: string,
    selectedAuthor?: string,
    selectedEra?: string,
    selectedSource?: string,
    sort: 'relevance' | 'title' | 'date-desc' | 'date-asc' = 'relevance',
    page: number = 1,
    pageSize: number = 12,
    selectedFormat?: string,
    selectedAvailability?: string
  ): { works: OpacWorkEntity[]; totalCount: number; page: number; totalPages: number; pageSize: number; facets: OpacFacets } {
    let filtered = [...this.works];
    const rawQ = query.trim();
    const qNorm = normalizeArabic(rawQ);

    if (qNorm) {
      filtered = filtered.filter(w => {
        const titleNorm = normalizeArabic(w.title);
        const subtitleNorm = normalizeArabic(w.subtitle || '');
        const creatorNorm = normalizeArabic(w.primaryCreator.nameArabic);
        const creatorEn = (w.primaryCreator.nameEnglish || '').toLowerCase();
        const summaryNorm = normalizeArabic(w.summaryArabic || '');
        const matchedSubject = w.subjects.find(s => normalizeArabic(s.label).includes(qNorm));
        const matchedInstance = w.instances.find(i => 
          (i.publisher && normalizeArabic(i.publisher).includes(qNorm)) ||
          (i.carrierType && normalizeArabic(i.carrierType).includes(qNorm)) ||
          (i.isbn && i.isbn.includes(rawQ)) ||
          (i.callNumber && i.callNumber.toLowerCase().includes(rawQ.toLowerCase()))
        );

        let reason = '';
        let matchScore = 0;

        if (titleNorm.startsWith(qNorm) || titleNorm === qNorm) {
          reason = `تطابق تام في العنوان: "${w.title}"`;
          matchScore = 100;
        } else if (titleNorm.includes(qNorm)) {
          reason = `تطابق في العنوان: "${w.title}"`;
          matchScore = 80;
        } else if (creatorNorm.includes(qNorm) || creatorEn.includes(rawQ.toLowerCase())) {
          reason = `تطابق في اسم المؤلف: "${w.primaryCreator.nameArabic}"`;
          matchScore = 70;
        } else if (matchedSubject) {
          reason = `تطابق في رأس الموضوع المقنن: "${matchedSubject.label}"`;
          matchScore = 60;
        } else if (subtitleNorm.includes(qNorm)) {
          reason = `تطابق في العنوان الفرعي: "${w.subtitle}"`;
          matchScore = 50;
        } else if (matchedInstance?.isbn && matchedInstance.isbn.includes(rawQ)) {
          reason = `تطابق في المعرف المعياري (ISBN): ${matchedInstance.isbn}`;
          matchScore = 90;
        } else if (matchedInstance?.callNumber && matchedInstance.callNumber.toLowerCase().includes(rawQ.toLowerCase())) {
          reason = `تطابق في رمز الرف والتصنيف: ${matchedInstance.callNumber}`;
          matchScore = 75;
        } else if (matchedInstance?.publisher && normalizeArabic(matchedInstance.publisher).includes(qNorm)) {
          reason = `تطابق في جهة النشر: "${matchedInstance.publisher}"`;
          matchScore = 40;
        } else if (summaryNorm.includes(qNorm)) {
          reason = `تطابق في الملخص الفكري والمضمون`;
          matchScore = 30;
        }

        if (matchScore > 0) {
          w.matchReason = reason;
          (w as any)._matchScore = matchScore;
          return true;
        }
        return false;
      });
    } else {
      // Clear matchReason when no query is typed
      filtered.forEach(w => {
        w.matchReason = undefined;
        delete (w as any)._matchScore;
      });
    }

    if (selectedSubject && selectedSubject !== 'all') {
      const normSubj = normalizeArabic(selectedSubject);
      filtered = filtered.filter(w => w.subjects.some(s => normalizeArabic(s.label) === normSubj || s.label === selectedSubject));
    }

    if (selectedAuthor && selectedAuthor !== 'all') {
      const normAuth = normalizeArabic(selectedAuthor);
      filtered = filtered.filter(w => 
        normalizeArabic(w.primaryCreator.nameArabic) === normAuth || 
        w.primaryCreator.nameArabic === selectedAuthor ||
        w.primaryCreator.name === selectedAuthor
      );
    }

    if (selectedEra && selectedEra !== 'all') {
      filtered = filtered.filter(w => w.era === selectedEra);
    }

    if (selectedSource && selectedSource !== 'all') {
      filtered = filtered.filter(w => w.source === selectedSource);
    }

    if (selectedFormat && selectedFormat !== 'all') {
      const normFormat = normalizeArabic(selectedFormat);
      filtered = filtered.filter(w => 
        w.genreForm?.some(g => normalizeArabic(g).includes(normFormat)) ||
        w.instances.some(i => i.carrierType && normalizeArabic(i.carrierType).includes(normFormat))
      );
    }

    if (selectedAvailability && selectedAvailability !== 'all') {
      filtered = filtered.filter(w => 
        w.instances.some(i => i.holdingStatus === selectedAvailability) ||
        w.holdingItems?.some(it => it.status === selectedAvailability)
      );
    }

    // Sort Results
    if (sort === 'relevance' && qNorm) {
      filtered.sort((a, b) => ((b as any)._matchScore || 0) - ((a as any)._matchScore || 0));
    } else if (sort === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    } else if (sort === 'date-desc') {
      filtered.sort((a, b) => (parseInt(b.originDate || '0', 10) || 0) - (parseInt(a.originDate || '0', 10) || 0));
    } else if (sort === 'date-asc') {
      filtered.sort((a, b) => (parseInt(a.originDate || '0', 10) || 0) - (parseInt(b.originDate || '0', 10) || 0));
    }

    // Build Facets from the pre-paginated filtered results
    const subjectCounts = new Map<string, number>();
    const authorCounts = new Map<string, number>();
    const eraCounts = new Map<string, number>();
    const sourceCounts = new Map<string, number>();
    const formatCounts = new Map<string, number>();
    const availabilityCounts = new Map<string, number>();

    filtered.forEach(w => {
      w.subjects.forEach(s => subjectCounts.set(s.label, (subjectCounts.get(s.label) || 0) + 1));
      const auth = w.primaryCreator.nameArabic;
      authorCounts.set(auth, (authorCounts.get(auth) || 0) + 1);
      if (w.era) eraCounts.set(w.era, (eraCounts.get(w.era) || 0) + 1);
      sourceCounts.set(w.source, (sourceCounts.get(w.source) || 0) + 1);

      w.instances.forEach(inst => {
        if (inst.carrierType) {
          formatCounts.set(inst.carrierType, (formatCounts.get(inst.carrierType) || 0) + 1);
        }
        if (inst.holdingStatus) {
          formatCounts.set(inst.holdingStatus, (formatCounts.get(inst.holdingStatus) || 0) + 1);
        }
      });
      (w.genreForm || []).forEach(gf => {
        formatCounts.set(gf, (formatCounts.get(gf) || 0) + 1);
      });
    });

    const facets: OpacFacets = {
      types: [
        { value: 'all', label: 'الكل (All)', count: filtered.length },
        { value: 'work', label: 'الأعمال الفكرية (Works)', count: filtered.length },
        { value: 'instance', label: 'الطبعات والمطبوعات (Instances)', count: filtered.reduce((acc, w) => acc + w.instances.length, 0) },
        { value: 'person', label: 'الأعلام والمؤلفون (Persons)', count: this.personsMap.size },
        { value: 'subject', label: 'المواضيع والمفاهيم (Subjects)', count: this.subjectsMap.size }
      ],
      formats: Array.from(formatCounts.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => b.count - a.count),
      availabilities: [
        { value: 'available', label: 'متاح للإعارة والمطالعة', count: filtered.filter(w => w.instances.some(i => i.holdingStatus === 'available')).length },
        { value: 'reference_only', label: 'للاطلاع الداخلي فقط (نوادر ومخطوطات)', count: filtered.filter(w => w.instances.some(i => i.holdingStatus === 'reference_only')).length },
        { value: 'digital_access', label: 'إتاحة رقمية مباشرة عبر الشابكة', count: filtered.filter(w => w.instances.some(i => i.holdingStatus === 'digital_access')).length }
      ].filter(f => f.count > 0),
      subjects: Array.from(subjectCounts.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => b.count - a.count),
      authors: Array.from(authorCounts.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => b.count - a.count),
      eras: Array.from(eraCounts.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => b.count - a.count),
      sources: Array.from(sourceCounts.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => b.count - a.count)
    };

    const totalCount = filtered.length;
    const safePageSize = Math.max(1, pageSize);
    const totalPages = Math.ceil(totalCount / safePageSize) || 1;
    const validPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (validPage - 1) * safePageSize;
    const paginatedWorks = filtered.slice(startIndex, startIndex + safePageSize);

    return { 
      works: paginatedWorks, 
      totalCount, 
      page: validPage, 
      totalPages, 
      pageSize: safePageSize, 
      facets 
    };
  }

  /**
   * ADVANCED MULTI-FIELD SEARCH
   */
  public searchWorksAdvanced(params: OpacAdvancedSearchParams) {
    let filtered = [...this.works];

    if (params.title) {
      const tNorm = normalizeArabic(params.title);
      filtered = filtered.filter(w => normalizeArabic(w.title).includes(tNorm) || (w.subtitle && normalizeArabic(w.subtitle).includes(tNorm)));
    }

    if (params.creator) {
      const cNorm = normalizeArabic(params.creator);
      filtered = filtered.filter(w => 
        normalizeArabic(w.primaryCreator.nameArabic).includes(cNorm) ||
        (w.primaryCreator.nameEnglish && w.primaryCreator.nameEnglish.toLowerCase().includes(params.creator!.toLowerCase())) ||
        w.contributors.some(c => normalizeArabic(c.nameArabic).includes(cNorm))
      );
    }

    if (params.subject) {
      const sNorm = normalizeArabic(params.subject);
      filtered = filtered.filter(w => w.subjects.some(s => normalizeArabic(s.label).includes(sNorm)));
    }

    if (params.publisher) {
      const pNorm = normalizeArabic(params.publisher);
      filtered = filtered.filter(w => w.instances.some(i => i.publisher && normalizeArabic(i.publisher).includes(pNorm)));
    }

    if (params.callNumber) {
      const cn = params.callNumber.toLowerCase().trim();
      filtered = filtered.filter(w => w.instances.some(i => (i.callNumber && i.callNumber.toLowerCase().includes(cn)) || (i.isbn && i.isbn.includes(cn))));
    }

    if (params.yearFrom) {
      const yFrom = parseInt(params.yearFrom, 10);
      if (!isNaN(yFrom)) {
        filtered = filtered.filter(w => {
          const yr = parseInt(w.originDate || '0', 10);
          return yr >= yFrom;
        });
      }
    }

    if (params.yearTo) {
      const yTo = parseInt(params.yearTo, 10);
      if (!isNaN(yTo)) {
        filtered = filtered.filter(w => {
          const yr = parseInt(w.originDate || '9999', 10);
          return yr <= yTo;
        });
      }
    }

    if (params.format && params.format !== 'all') {
      const fNorm = normalizeArabic(params.format);
      filtered = filtered.filter(w => 
        w.genreForm?.some(g => normalizeArabic(g).includes(fNorm)) ||
        w.instances.some(i => i.carrierType && normalizeArabic(i.carrierType).includes(fNorm))
      );
    }

    if (params.language && params.language !== 'all') {
      filtered = filtered.filter(w => w.language === params.language);
    }

    // Fallback keyword if query passed
    if (params.query) {
      const qNorm = normalizeArabic(params.query);
      filtered = filtered.filter(w => 
        normalizeArabic(w.title).includes(qNorm) ||
        normalizeArabic(w.primaryCreator.nameArabic).includes(qNorm) ||
        w.subjects.some(s => normalizeArabic(s.label).includes(qNorm)) ||
        (w.summaryArabic && normalizeArabic(w.summaryArabic).includes(qNorm))
      );
    }

    // Sort
    const sort = params.sort || 'relevance';
    if (sort === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    } else if (sort === 'date-desc') {
      filtered.sort((a, b) => (parseInt(b.originDate || '0', 10) || 0) - (parseInt(a.originDate || '0', 10) || 0));
    } else if (sort === 'date-asc') {
      filtered.sort((a, b) => (parseInt(a.originDate || '0', 10) || 0) - (parseInt(b.originDate || '0', 10) || 0));
    }

    // Build Facets
    const subjectCounts = new Map<string, number>();
    const authorCounts = new Map<string, number>();
    const eraCounts = new Map<string, number>();
    const formatCounts = new Map<string, number>();

    filtered.forEach(w => {
      w.subjects.forEach(s => subjectCounts.set(s.label, (subjectCounts.get(s.label) || 0) + 1));
      const auth = w.primaryCreator.nameArabic;
      authorCounts.set(auth, (authorCounts.get(auth) || 0) + 1);
      if (w.era) eraCounts.set(w.era, (eraCounts.get(w.era) || 0) + 1);
      w.instances.forEach(inst => {
        if (inst.carrierType) formatCounts.set(inst.carrierType, (formatCounts.get(inst.carrierType) || 0) + 1);
      });
    });

    const facets: OpacFacets = {
      types: [
        { value: 'all', label: 'الكل (All)', count: filtered.length },
        { value: 'work', label: 'الأعمال الفكرية (Works)', count: filtered.length },
        { value: 'instance', label: 'الطبعات والمطبوعات (Instances)', count: filtered.reduce((acc, w) => acc + w.instances.length, 0) },
        { value: 'person', label: 'الأعلام والمؤلفون (Persons)', count: this.personsMap.size },
        { value: 'subject', label: 'المواضيع والمفاهيم (Subjects)', count: this.subjectsMap.size }
      ],
      formats: Array.from(formatCounts.entries()).map(([value, count]) => ({ value, label: value, count })).sort((a, b) => b.count - a.count),
      availabilities: [
        { value: 'available', label: 'متاح للإعارة والمطالعة', count: filtered.filter(w => w.instances.some(i => i.holdingStatus === 'available')).length },
        { value: 'reference_only', label: 'للاطلاع الداخلي فقط', count: filtered.filter(w => w.instances.some(i => i.holdingStatus === 'reference_only')).length },
        { value: 'digital_access', label: 'إتاحة رقمية مباشرة', count: filtered.filter(w => w.instances.some(i => i.holdingStatus === 'digital_access')).length }
      ].filter(f => f.count > 0),
      subjects: Array.from(subjectCounts.entries()).map(([value, count]) => ({ value, label: value, count })).sort((a, b) => b.count - a.count),
      authors: Array.from(authorCounts.entries()).map(([value, count]) => ({ value, label: value, count })).sort((a, b) => b.count - a.count),
      eras: Array.from(eraCounts.entries()).map(([value, count]) => ({ value, label: value, count })).sort((a, b) => b.count - a.count),
      sources: []
    };

    const totalCount = filtered.length;
    const pageSize = params.pageSize || 12;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const page = Math.min(Math.max(1, params.page || 1), totalPages);
    const startIndex = (page - 1) * pageSize;
    const paginatedWorks = filtered.slice(startIndex, startIndex + pageSize);

    return { works: paginatedWorks, totalCount, page, totalPages, pageSize, facets };
  }

  /**
   * DEEP CATEGORIZED SEARCH FOR TYPEAHEAD OVERLAY & DEEP DISCOVERY
   * Real-time categorization into Works, Persons, Subjects, and Publishers (Unicode/Arabic Normalization)
   */
  public deepCategorizedSearch(query: string, scope: 'all' | 'title' | 'creator' | 'subject' | 'publisher' | 'callNumber' = 'all') {
    const rawQ = (query || '').trim();
    const q = normalizeArabic(rawQ);
    if (!q) {
      return {
        works: this.works.slice(0, 5),
        persons: this.getAllPersons().slice(0, 4),
        subjects: this.getAllSubjects().slice(0, 5),
        publishers: this.getAllPublishers().slice(0, 3),
        totalMatches: this.works.length
      };
    }

    // 1. Matching Works
    const matchingWorks = this.works.filter(w => {
      const tNorm = normalizeArabic(w.title);
      const subNorm = normalizeArabic(w.subtitle || '');
      const cNorm = normalizeArabic(w.primaryCreator.nameArabic);
      const cEn = (w.primaryCreator.nameEnglish || '').toLowerCase();
      const sNorm = w.subjects.map(s => normalizeArabic(s.label)).join(' ');
      const pNorm = w.instances.map(i => normalizeArabic(i.publisher || '')).join(' ');
      const callNorm = w.instances.map(i => (i.callNumber || '').toLowerCase() + ' ' + (i.isbn || '')).join(' ');

      if (scope === 'title') return tNorm.includes(q) || subNorm.includes(q);
      if (scope === 'creator') return cNorm.includes(q) || cEn.includes(rawQ.toLowerCase());
      if (scope === 'subject') return sNorm.includes(q);
      if (scope === 'publisher') return pNorm.includes(q);
      if (scope === 'callNumber') return callNorm.includes(rawQ.toLowerCase());
      
      // Default: 'all' fields
      return (
        tNorm.includes(q) ||
        subNorm.includes(q) ||
        cNorm.includes(q) ||
        cEn.includes(rawQ.toLowerCase()) ||
        sNorm.includes(q) ||
        (w.summaryArabic && normalizeArabic(w.summaryArabic).includes(q)) ||
        pNorm.includes(q) ||
        callNorm.includes(rawQ.toLowerCase())
      );
    });

    // 2. Matching Persons
    const matchingPersons = this.getAllPersons().filter(p => {
      const pNorm = normalizeArabic(p.nameArabic);
      const enNorm = (p.nameEnglish || '').toLowerCase();
      const bioNorm = normalizeArabic(p.bioArabic || '');
      return pNorm.includes(q) || enNorm.includes(rawQ.toLowerCase()) || bioNorm.includes(q);
    });

    // 3. Matching Subjects
    const matchingSubjects = this.getAllSubjects().filter(s => {
      const sNorm = normalizeArabic(s.label);
      const enNorm = (s.labelEnglish || '').toLowerCase();
      return sNorm.includes(q) || enNorm.includes(rawQ.toLowerCase()) || (s.notationDdc && s.notationDdc.includes(rawQ));
    });

    // 4. Matching Publishers
    const matchingPublishers = this.getAllPublishers().filter(pub => {
      const pubNorm = normalizeArabic(pub.name);
      const cityNorm = normalizeArabic(pub.city || '');
      return pubNorm.includes(q) || cityNorm.includes(q);
    });

    const totalMatches = matchingWorks.length + matchingPersons.length + matchingSubjects.length + matchingPublishers.length;

    return {
      works: matchingWorks.slice(0, 8),
      persons: matchingPersons.slice(0, 5),
      subjects: matchingSubjects.slice(0, 6),
      publishers: matchingPublishers.slice(0, 4),
      totalMatches
    };
  }

  /**
   * RELATED WORKS RECOMMENDATION ENGINE ("ربما يعجبك أيضاً")
   * Computes relationship graph score between current work and all other catalog works
   */
  public getRelatedWorks(workId: string, limit: number = 4): OpacWorkEntity[] {
    const current = this.getWorkByIdOrUri(workId);
    if (!current) return this.works.slice(0, limit);

    const currentSubjectLabels = new Set(current.subjects.map(s => s.label));
    const currentCreator = current.primaryCreator.nameArabic;

    const scored = this.works
      .filter(w => w.id !== current.id)
      .map(w => {
        let score = 0;
        // Same creator: high affinity (+6)
        if (w.primaryCreator.nameArabic === currentCreator) score += 6;
        // Shared subjects (+3 per matching subject)
        w.subjects.forEach(s => {
          if (currentSubjectLabels.has(s.label)) score += 3;
        });
        // Shared era (+1)
        if (w.era && current.era && w.era === current.era) score += 1;
        // Shared language (+0.5)
        if (w.language === current.language) score += 0.5;

        return { work: w, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(s => s.work);
  }

  /**
   * INSTANT HOVER INFO EXTRACTOR
   * Returns fast metadata for floating glass cards on hover
   */
  public getHoverInfo(type: 'person' | 'subject' | 'work' | 'publisher' | 'classification', key: string) {
    if (type === 'person') {
      const data = this.getPersonByNameOrUri(key);
      if (!data) return null;
      return {
        type: 'person' as const,
        title: data.person.nameArabic,
        subtitle: data.person.nameEnglish,
        lifespan: data.person.lifespan,
        role: data.person.role,
        viaf: data.person.viafUri,
        loc: data.person.locUri,
        worksCount: data.works.length,
        bio: data.person.bioArabic ? data.person.bioArabic.slice(0, 150) + '...' : undefined,
        recentWork: data.works[0]?.title
      };
    }

    if (type === 'classification') {
      const works = this.works.filter(w => (w.classificationDdc && w.classificationDdc.includes(key)) || (w.classificationLcc && w.classificationLcc.includes(key)));
      return {
        type: 'classification' as const,
        title: `رمز التصنيف المكتبي: ${key}`,
        subtitle: key.startsWith('892') ? 'الأدب العربي واللغات السامية' : (key.startsWith('B') ? 'الفلسفة وعلم النفس والديانات' : 'تصنيف مكتبي معتمد'),
        worksCount: works.length,
        recentWork: works[0]?.title
      };
    }

    if (type === 'subject') {
      const data = this.getSubjectByLabelOrUri(key);
      if (!data) return null;
      return {
        type: 'subject' as const,
        title: data.subject.label,
        scheme: data.subject.scheme,
        ddc: data.subject.notationDdc,
        worksCount: data.works.length,
        broader: data.subject.broader,
        recentWork: data.works[0]?.title
      };
    }

    if (type === 'publisher') {
      const data = this.getPublisherByName(key);
      if (!data) return null;
      return {
        type: 'publisher' as const,
        title: data.publisher.name,
        city: data.publisher.city,
        worksCount: data.works.length,
        recentWork: data.works[0]?.title
      };
    }

    if (type === 'work') {
      const work = this.getWorkByIdOrUri(key);
      if (!work) return null;
      return {
        type: 'work' as const,
        title: work.title,
        subtitle: work.subtitle,
        creator: work.primaryCreator.nameArabic,
        year: work.originDate,
        editions: work.instances.length,
        summary: work.summaryArabic ? work.summaryArabic.slice(0, 140) + '...' : undefined
      };
    }

    return null;
  }

  // =========================================================================
  // LINKED DATA SERIALIZERS (Framed JSON-LD, Turtle, MARC21, Citations)
  // =========================================================================

  /**
   * Generates Framed W3C JSON-LD matching Libris & Share-VDE standard
   */
  public generateFramedJsonLd(work: OpacWorkEntity): any {
    const creator = work.primaryCreator;
    const workGraphNode: any = {
      "@id": work.uri,
      "@type": ["bf:Work", "bf:Text"],
      "bf:adminMetadata": {
        "@type": "bf:AdminMetadata",
        "bf:status": { "@type": "bf:Status", "rdfs:label": "Validated Linked Data" },
        "bf:creationDate": work.createdAt,
        "bflc:catalogingInterface": work.catalogingInterface || "Wolf Moon OPAC"
      },
      "bf:title": {
        "@type": "bf:Title",
        "bf:mainTitle": work.title,
        ...(work.subtitle ? { "bf:subtitle": work.subtitle } : {})
      },
      "bf:contribution": {
        "@type": ["bf:Contribution", "bflc:PrimaryContribution"],
        "bf:role": {
          "@id": "http://id.loc.gov/vocabulary/relators/aut",
          "rdfs:label": creator.role || "author"
        },
        "bf:agent": {
          "@id": creator.uri,
          "@type": "bf:Person",
          "rdfs:label": creator.nameArabic || creator.name,
          "bf:identifiedBy": [
            creator.viafUri && { "@id": creator.viafUri, "@type": "bf:Identifier", "rdfs:label": "VIAF" },
            creator.locUri && { "@id": creator.locUri, "@type": "bf:Identifier", "rdfs:label": "LOC" }
          ].filter(Boolean)
        }
      },
      ...(work.originDate ? { "bf:originDate": work.originDate } : {}),
      "bf:language": {
        "@id": `http://id.loc.gov/vocabulary/languages/${work.language || 'ara'}`,
        "rdfs:label": work.languageLabel || work.language
      },
      "bf:subject": work.subjects.map(s => ({
        "@id": s.uri,
        "@type": "bf:Topic",
        "rdfs:label": s.label,
        "madsrdf:authoritativeLabel": s.label
      })),
      "bf:hasInstance": work.instances.map(inst => ({
        "@id": inst.uri,
        "@type": "bf:Instance",
        "bf:title": {
          "@type": "bf:Title",
          "bf:mainTitle": inst.title,
          ...(inst.subtitle ? { "bf:subtitle": inst.subtitle } : {})
        },
        ...(inst.publisher || inst.publicationYear || inst.publicationPlace ? {
          "bf:provisionActivity": {
            "@type": "bf:ProvisionActivity",
            ...(inst.publicationPlace ? { "bf:place": { "rdfs:label": inst.publicationPlace } } : {}),
            ...(inst.publisher ? { "bf:agent": { "rdfs:label": inst.publisher } } : {}),
            ...(inst.publicationYear ? { "bf:date": inst.publicationYear } : {})
          }
        } : {}),
        ...(inst.extent ? { "bf:extent": { "rdfs:label": inst.extent } } : {}),
        ...(inst.carrierType ? { "bf:carrier": { "rdfs:label": inst.carrierType } } : {}),
        ...(inst.isbn ? { "bf:identifiedBy": { "@type": "bf:Isbn", "rdf:value": inst.isbn } } : {}),
        ...(inst.items && inst.items.length > 0 ? {
          "bf:hasItem": inst.items.map(it => ({
            "@id": it.uri,
            "@type": "bf:Item",
            ...(it.heldBy ? { "bf:heldBy": { "rdfs:label": it.heldBy } } : {}),
            ...(it.shelfMark ? { "bf:shelfMark": it.shelfMark } : {}),
            ...(it.barcode ? { "bf:barcode": it.barcode } : {}),
            ...(it.accessUrl ? { "bf:electronicLocator": it.accessUrl } : {})
          }))
        } : {})
      }))
    };

    return {
      "@context": {
        "bf": "http://id.loc.gov/ontologies/bibframe/",
        "bflc": "http://id.loc.gov/ontologies/bflc/",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "madsrdf": "http://www.loc.gov/mads/rdf/v1#",
        "moon": "https://moonlib.org/entity/"
      },
      "@graph": [workGraphNode]
    };
  }

  /**
   * Generates official Turtle RDF syntax (SVDE & Libris standard)
   */
  public generateTurtleRdf(work: OpacWorkEntity): string {
    const creator = work.primaryCreator;
    const esc = (s: string) => (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    const lines = [
      `@prefix bf: <http://id.loc.gov/ontologies/bibframe/> .`,
      `@prefix bflc: <http://id.loc.gov/ontologies/bflc/> .`,
      `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .`,
      `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .`,
      `@prefix moon: <https://moonlib.org/entity/> .`,
      ``,
      `# WORK ENTITY: ${work.title}`,
      `<${work.uri}> a bf:Work, bf:Text ;`,
      `    bf:title [`,
      `        a bf:Title ;`,
      `        bf:mainTitle "${esc(work.title)}" ;`,
      work.subtitle ? `        bf:subtitle "${esc(work.subtitle)}" ;` : ``,
      `    ] ;`,
      `    bf:contribution [`,
      `        a bf:Contribution, bflc:PrimaryContribution ;`,
      `        bf:agent <${creator.uri}> ;`,
      `        bf:role <http://id.loc.gov/vocabulary/relators/aut> ;`,
      `    ] ;`
    ].filter(Boolean);

    if (work.originDate) {
      lines.push(`    bf:originDate "${esc(work.originDate)}" ;`);
    }

    if (work.language) {
      lines.push(`    bf:language <http://id.loc.gov/vocabulary/languages/${work.language}> ;`);
    }

    if (work.classificationLcc) {
      lines.push(`    bf:classification [ a bf:ClassificationLcc ; rdfs:label "${esc(work.classificationLcc)}" ] ;`);
    }

    work.subjects.forEach(s => {
      lines.push(`    bf:subject <${s.uri}> ;`);
    });

    work.instances.forEach(inst => {
      lines.push(`    bf:hasInstance <${inst.uri}> ;`);
    });

    if (work.summaryArabic) {
      lines.push(`    rdfs:comment "${esc(work.summaryArabic.slice(0, 140))}..." .`);
    } else {
      lines[lines.length - 1] = lines[lines.length - 1].replace(/ ;$/, ' .');
    }
    lines.push(``);

    // Instances block
    work.instances.forEach(inst => {
      lines.push(`# INSTANCE ENTITY: ${inst.title}`);
      lines.push(`<${inst.uri}> a bf:Instance ;`);
      lines.push(`    bf:instanceOf <${work.uri}> ;`);
      lines.push(`    bf:title [ a bf:Title ; bf:mainTitle "${esc(inst.title)}" ] ;`);
      if (inst.publisher || inst.publicationYear || inst.publicationPlace) {
        lines.push(`    bf:provisionActivity [`);
        lines.push(`        a bf:ProvisionActivity ;`);
        if (inst.publisher) lines.push(`        bf:agent [ a bf:Agent ; rdfs:label "${esc(inst.publisher)}" ] ;`);
        if (inst.publicationPlace) lines.push(`        bf:place [ a bf:Place ; rdfs:label "${esc(inst.publicationPlace)}" ] ;`);
        if (inst.publicationYear) lines.push(`        bf:date "${esc(inst.publicationYear)}" ;`);
        lines.push(`    ] ;`);
      }
      if (inst.extent) lines.push(`    bf:extent [ a bf:Extent ; rdfs:label "${esc(inst.extent)}" ] ;`);
      if (inst.carrierType) lines.push(`    bf:carrier [ a bf:Carrier ; rdfs:label "${esc(inst.carrierType)}" ] ;`);
      if (inst.isbn) lines.push(`    bf:identifiedBy [ a bf:Isbn ; rdf:value "${esc(inst.isbn)}" ] ;`);

      (inst.items || []).forEach(it => {
        lines.push(`    bf:hasItem <${it.uri}> ;`);
      });

      lines[lines.length - 1] = lines[lines.length - 1].replace(/ ;$/, ' .');
      lines.push(``);

      // Items block
      (inst.items || []).forEach(it => {
        lines.push(`# ITEM HOLDING ENTITY: ${it.shelfMark || it.id}`);
        lines.push(`<${it.uri}> a bf:Item ;`);
        lines.push(`    bf:itemOf <${inst.uri}> ;`);
        if (it.heldBy) lines.push(`    bf:heldBy [ a bf:Agent ; rdfs:label "${esc(it.heldBy)}" ] ;`);
        if (it.shelfMark) lines.push(`    bf:shelfMark "${esc(it.shelfMark)}" ;`);
        if (it.barcode) lines.push(`    bf:barcode "${esc(it.barcode)}" ;`);
        if (it.accessUrl) lines.push(`    bf:electronicLocator <${it.accessUrl}> ;`);
        lines[lines.length - 1] = lines[lines.length - 1].replace(/ ;$/, ' .');
        lines.push(``);
      });
    });

    // Person Entity Block
    lines.push(`# AGENT / PERSON ENTITY: ${creator.nameArabic}`);
    lines.push(`<${creator.uri}> a bf:Person ;`);
    lines.push(`    rdfs:label "${esc(creator.nameArabic)}" ;`);
    if (creator.nameEnglish) lines.push(`    bflc:name00MatchKey "${esc(creator.nameEnglish)}" ;`);
    if (creator.lifespan) lines.push(`    bf:date "${esc(creator.lifespan)}" ;`);
    if (creator.viafUri) lines.push(`    rdfs:seeAlso <${creator.viafUri}> ;`);
    if (creator.locUri) lines.push(`    rdfs:seeAlso <${creator.locUri}> ;`);
    lines[lines.length - 1] = lines[lines.length - 1].replace(/ ;$/, ' .');

    return lines.join('\n');
  }

  /**
   * Generates MARC 21 Authority / Bibliographic tags mapping (Zero fabrication)
   */
  public generateMarc21Mapping(work: OpacWorkEntity): string {
    const creator = work.primaryCreator;
    const inst = work.instances[0] || {} as Partial<OpacInstanceEntity>;
    const marcLines: string[] = [
      `LEADER 01425cam a2200385 i 4500`,
      `001 ${work.id}`
    ];

    if (work.originDate) {
      const cleanYear = work.originDate.replace(/[^0-9]/g, '').slice(0, 4) || 'uuuu';
      marcLines.push(`008 261009s${cleanYear}    |||||||||||||||||||${work.language || 'ara'} d`);
    }

    if (inst.isbn) {
      marcLines.push(`020    $a ${inst.isbn}`);
    }

    marcLines.push(`040    $a IQ-BG/MOON $b ara $c IQ-BG/MOON $e rda`);

    if (work.classificationLcc) {
      marcLines.push(`050 00 $a ${work.classificationLcc}`);
    }

    if (work.classificationDdc) {
      marcLines.push(`082 04 $a ${work.classificationDdc} $2 23`);
    }

    if (creator.nameArabic) {
      marcLines.push(`100 1  $a ${creator.nameArabic}${creator.lifespan ? ', $d ' + creator.lifespan : ''} $e author $4 aut $1 ${creator.uri}`);
    }

    marcLines.push(`245 10 $a ${work.title}${work.subtitle ? ' : $b ' + work.subtitle : ''}${creator.nameArabic ? ' / $c ' + creator.nameArabic + '.' : '.'}`);

    if (inst.publisher || inst.publicationPlace || inst.publicationYear) {
      marcLines.push(`264  1 $a ${inst.publicationPlace || '[م.م.]'} : $b ${inst.publisher || '[د.ن.]'} , $c ${inst.publicationYear || work.originDate || '[د.ت.]'}.`);
    }

    if (inst.extent) {
      marcLines.push(`300    $a ${inst.extent}${inst.dimensions ? ' ; $c ' + inst.dimensions : ''}`);
    }

    marcLines.push(`336    $a text $2 rdacontent`);
    marcLines.push(`337    $a unmediated $2 rdamedia`);
    marcLines.push(`338    $a volume $2 rdacarrier`);

    work.subjects.forEach(s => {
      marcLines.push(`650  4 $a ${s.label} $1 ${s.uri}`);
    });

    if (inst.uri) {
      marcLines.push(`758    $4 http://id.loc.gov/ontologies/bibframe/hasInstance $1 ${inst.uri}`);
    }

    marcLines.push(`856 40 $u ${work.uri} $y View in WOF MOON Linked OPAC`);

    return marcLines.join('\n');
  }

  /**
   * Generates standard citations honestly
   */
  public generateCitations(work: OpacWorkEntity): { apa: string; chicago: string; mla: string; bibtex: string } {
    const author = work.primaryCreator.nameArabic || 'مؤلف غير محدد';
    const title = work.title;
    const year = work.originDate || 'n.d.';
    const inst = work.instances[0];
    const publisher = inst?.publisher || '';
    const place = inst?.publicationPlace || '';

    const pubPart = [place, publisher].filter(Boolean).join(': ') || '';

    return {
      apa: `${author}. (${year}). ${title}.${pubPart ? ' ' + pubPart + '.' : ''}`,
      chicago: `${author}. ${year}. ${title}.${pubPart ? ' ' + pubPart + '.' : ''}`,
      mla: `${author}. ${title}.${publisher ? ' ' + publisher + ',' : ''} ${year}.`,
      bibtex: `@book{${work.id},\n  author = {${author}},\n  title = {${title}},\n  year = {${year}}${publisher ? `,\n  publisher = {${publisher}}` : ''}${place ? `,\n  address = {${place}}` : ''}\n}`
    };
  }
}

// Singleton export
export const wolfMoonOpacService = new WolfMoonOpacService();
