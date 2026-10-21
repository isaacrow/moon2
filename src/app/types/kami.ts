/**
 * KAMI Core Type Definitions
 * Production-grade types for the KAMI cataloging system
 */

// =============================================
// Core Entity Types
// =============================================

export interface KamiWork {
  id: string;
  uri: string;
  resourceType: string; // bf:Text, bf:Manuscript, etc.
  title: KamiTitle;
  contributions?: KamiContribution[];
  subjects?: KamiSubject[];
  classifications?: KamiClassification[];
  content?: string;
  language?: string[];
  genreForm?: string[];
  notes?: string[];
  temporalCoverage?: string;
  geographicCoverage?: string[];
  originDate?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  version: number;
  jsonld: any;
  rdf_triples?: string;
  marc_xml?: string;
  lock_token?: string;
  locked_by?: string;
  locked_at?: string;
}

export interface KamiInstance {
  id: string;
  uri: string;
  work_id: string;
  instance_type: string; // bf:Print, bf:Electronic, bf:Manuscript
  title: KamiTitle;
  publication?: KamiPublication;
  identifiers?: KamiIdentifier[];
  extent?: string;
  dimensions?: string;
  media?: string;
  carrier?: string;
  created_at: string;
  updated_at: string;
  jsonld: any;
}

export interface KamiItem {
  id: string;
  uri: string;
  instance_id: string;
  barcode?: string;
  call_number?: string;
  location?: string;
  status: 'available' | 'checked-out' | 'missing' | 'damaged';
  holding_institution?: KamiInstitution;
  created_at: string;
  updated_at: string;
  jsonld: any;
}

// =============================================
// Supporting Types
// =============================================

export interface KamiTitle {
  mainTitle: string;
  subtitle?: string;
  partNumber?: string;
  partName?: string;
  variants?: string[];
}

export interface KamiContribution {
  agent: KamiAgent;
  role: string;
  role_uri?: string;
}

export interface KamiAgent {
  id?: string;
  uri?: string;
  type: 'bf:Person' | 'bf:Organization' | 'bf:Family' | 'bf:Meeting' | 'bf:Jurisdiction';
  label: string;
  authority_source?: 'LOC' | 'VIAF' | 'Wikidata' | 'Local';
  external_uri?: string;
  dates?: {
    birth?: string;
    death?: string;
    active_start?: string;
    active_end?: string;
  };
  variants?: string[];
}

export interface KamiSubject {
  id?: string;
  uri?: string;
  type: 'bf:Topic' | 'bf:Place' | 'bf:Temporal' | 'bf:GenreForm';
  label: string;
  authority_source?: 'LCSH' | 'FAST' | 'Local';
  external_uri?: string;
  broader?: string[];
  narrower?: string[];
  related?: string[];
}

export interface KamiClassification {
  scheme: 'LCC' | 'DDC' | 'UDC';
  notation: string;
  edition?: string;
  source?: string;
}

export interface KamiPublication {
  place?: string;
  agent?: string;
  date?: string;
}

export interface KamiIdentifier {
  type: 'ISBN' | 'ISSN' | 'LCCN' | 'DOI' | 'URI' | 'Other';
  value: string;
  qualifier?: string;
}

export interface KamiInstitution {
  id: string;
  name: string;
  uri?: string;
  location?: string;
}

// =============================================
// Complete Record Type
// =============================================

export interface KamiRecord {
  '@context': string;
  '@type': 'Work';
  work: KamiWork;
  instance: KamiInstance;
  items?: KamiItem[];
  metadata: KamiRecordMetadata;
  provenance?: KamiProvenance[];
}

export interface KamiRecordMetadata {
  catalogType: 'monograph' | 'manuscript' | 'serial' | 'mixed';
  created: string;
  modified: string;
  cataloger: string;
  institution?: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  version: number;
}

export interface KamiProvenance {
  institution_id: string;
  institution_name: string;
  cataloger_id: string;
  cataloger_name: string;
  contribution_type: 'created' | 'modified' | 'reviewed';
  timestamp: string;
  note?: string;
}

// =============================================
// Ontology Types
// =============================================

export interface OntologyClass {
  uri: string;
  label: string;
  definition: string;
  subClassOf?: string[];
  properties: OntologyProperty[];
  constraints?: ClassConstraints;
}

export interface OntologyProperty {
  uri: string;
  label: string;
  definition: string;
  domain: string[];
  range: string[];
  cardinality: 'single' | 'multiple';
  required: boolean;
  controlledVocabulary?: string;
  inputType: FieldInputType;
}

export interface ClassConstraints {
  requiredProperties?: string[];
  recommendedProperties?: string[];
  optionalProperties?: string[];
}

export interface FieldInputType {
  type: 'text' | 'uri' | 'authority' | 'date' | 'select' | 'nested' | 'repeatable';
  authoritySource?: string;
  vocabularyUri?: string;
  validation?: ValidationRule[];
}

// =============================================
// Template Types
// =============================================

export interface KamiTemplate {
  id: string;
  name: string;
  resource_type: string;
  catalog_type: 'monograph' | 'manuscript' | 'serial' | 'custom';
  profile?: string;
  sections: TemplateSection[];
  validation_rules: ValidationRule[];
  metadata: TemplateMetadata;
}

export interface TemplateSection {
  id: string;
  label: string;
  fields: TemplateField[];
  collapsed?: boolean;
  condition?: string;
}

export interface TemplateField {
  property_uri: string;
  label: string;
  input_type: FieldInputType;
  required: boolean;
  repeatable: boolean;
  default_value?: any;
  placeholder?: string;
  help_text?: string;
  authority_source?: string;
  vocabulary_uri?: string;
  validation?: ValidationRule[];
}

export interface TemplateMetadata {
  created_by: string;
  created_at: string;
  updated_at: string;
  institution?: string;
  is_public: boolean;
}

// =============================================
// Validation Types
// =============================================

export interface ValidationRule {
  rule_id: string;
  field: string;
  rule_type: 'required' | 'format' | 'cardinality' | 'uri' | 'authority' | 'relationship';
  severity: 'error' | 'warning' | 'info';
  message: string;
  validator?: (value: any, context: any) => boolean;
}

export interface ValidationMessage {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  rule_id?: string;
}

export interface ValidationResult {
  valid: boolean;
  messages: ValidationMessage[];
  can_save: boolean;
  can_publish: boolean;
}

// =============================================
// Version Control Types
// =============================================

export interface KamiVersion {
  id: string;
  entity_id: string;
  entity_type: 'work' | 'instance' | 'item';
  version_number: number;
  jsonld: any;
  changed_by: string;
  changed_at: string;
  change_summary: string;
  diff?: any;
}

export interface KamiAuditLog {
  id: string;
  entity_id?: string;
  entity_type?: string;
  action: 'create' | 'update' | 'delete' | 'lock' | 'unlock' | 'publish' | 'submit' | 'approve' | 'reject';
  user_id: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  details?: any;
}

// =============================================
// Review Workflow Types
// =============================================

export interface KamiReview {
  id: string;
  work_id: string;
  submitted_by: string;
  submitted_at: string;
  reviewer_id?: string;
  reviewed_at?: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_needed';
  comments?: string;
}

// =============================================
// Authority Types
// =============================================

export interface AuthoritySearchResult {
  uri: string;
  label: string;
  type: string;
  description?: string;
  source: 'LOC' | 'VIAF' | 'Wikidata' | 'Local';
  dates?: {
    birth?: string;
    death?: string;
  };
  variants?: string[];
  linkedData?: any;
}

export interface AuthorityCacheEntry {
  query: string;
  source: string;
  results: AuthoritySearchResult[];
  cached_at: string;
  expires_at: string;
}

// =============================================
// MARC Transformation Types
// =============================================

export interface MARCField {
  tag: string;
  ind1: string;
  ind2: string;
  subfields: MARCSubfield[];
}

export interface MARCSubfield {
  code: string;
  value: string;
}

export interface MARCRecord {
  leader: string;
  controlFields: { tag: string; value: string }[];
  dataFields: MARCField[];
}

// =============================================
// Manuscript-Specific Types
// =============================================

export interface ManuscriptMetadata {
  origin_place?: string;
  origin_date?: string;
  script?: 'Arabic' | 'Hebrew' | 'Latin' | 'Greek' | 'Cyrillic' | 'Other';
  material?: 'parchment' | 'paper' | 'papyrus' | 'other';
  binding?: string;
  illuminations?: boolean;
  marginalia?: boolean;
  custodial_history?: CustodialEvent[];
  repository?: {
    institution: string;
    uri?: string;
    location?: string;
    shelf_mark?: string;
  };
  physical_description?: {
    leaves?: number;
    dimensions?: string;
    columns?: number;
    lines_per_page?: number;
    condition?: string;
  };
}

export interface CustodialEvent {
  date?: string;
  custodian?: string;
  event_type?: 'acquisition' | 'transfer' | 'sale' | 'donation' | 'other';
  note?: string;
}

// =============================================
// UI State Types
// =============================================

export interface KamiEditorState {
  work: Partial<KamiWork>;
  instance: Partial<KamiInstance>;
  items: Partial<KamiItem>[];
  template?: KamiTemplate;
  validation: ValidationResult;
  isDirty: boolean;
  isSaving: boolean;
  isLocked: boolean;
  lockToken?: string;
  activePanel: 'work' | 'instance' | 'item';
  manuscriptMode: boolean;
}

export interface FormConfiguration {
  sections: FormSection[];
  validationRules: ValidationRule[];
}

export interface FormSection {
  id: string;
  label: string;
  fields: FormField[];
  collapsed?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  component: string;
  props: any;
}

// =============================================
// API Response Types
// =============================================

export interface KamiApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface KamiListResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// =============================================
// Filter & Search Types
// =============================================

export interface KamiSearchFilters {
  query?: string;
  resource_type?: string;
  status?: string;
  created_after?: string;
  created_before?: string;
  created_by?: string;
  institution?: string;
}

export interface KamiSortOptions {
  field: 'created_at' | 'updated_at' | 'title' | 'status';
  direction: 'asc' | 'desc';
}

// =============================================
// Statistics Types
// =============================================

export interface KamiStatistics {
  total_works: number;
  total_instances: number;
  total_items: number;
  by_status: {
    draft: number;
    review: number;
    approved: number;
    published: number;
  };
  by_type: {
    [key: string]: number;
  };
  by_institution: {
    [key: string]: number;
  };
  recent_activity: {
    action: string;
    count: number;
    timestamp: string;
  }[];
}
