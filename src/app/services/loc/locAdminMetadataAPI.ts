/**
 * LOC Administrative Metadata API Service
 * Vocabularies for cataloging metadata, encoding levels, description conventions, etc.
 */

export interface AdminCode {
  code: string;
  label: string;
  definition?: string;
  marcField?: string;
}

/**
 * Record Status (Leader/05)
 */
export const RECORD_STATUS_CODES: AdminCode[] = [
  { code: 'a', label: 'Increase in encoding level', marcField: 'LDR/05' },
  { code: 'c', label: 'Corrected or revised', marcField: 'LDR/05' },
  { code: 'd', label: 'Deleted', marcField: 'LDR/05' },
  { code: 'n', label: 'New', marcField: 'LDR/05' },
  { code: 'p', label: 'Increase in encoding level from prepublication', marcField: 'LDR/05' },
];

/**
 * Encoding Level (Leader/17)
 * Indicates the level of cataloging
 */
export const ENCODING_LEVEL_CODES: AdminCode[] = [
  { code: ' ', label: 'Full level', definition: 'Most complete level of cataloging', marcField: 'LDR/17' },
  { code: '1', label: 'Full level, material not examined', marcField: 'LDR/17' },
  { code: '2', label: 'Less-than-full level, material not examined', marcField: 'LDR/17' },
  { code: '3', label: 'Abbreviated level', marcField: 'LDR/17' },
  { code: '4', label: 'Core level', definition: 'PCC core-level cataloging', marcField: 'LDR/17' },
  { code: '5', label: 'Partial (preliminary) level', marcField: 'LDR/17' },
  { code: '7', label: 'Minimal level', marcField: 'LDR/17' },
  { code: '8', label: 'Prepublication level', marcField: 'LDR/17' },
  { code: 'u', label: 'Unknown', marcField: 'LDR/17' },
  { code: 'z', label: 'Not applicable', marcField: 'LDR/17' },
  { code: 'I', label: 'Full-level input by OCLC participants', marcField: 'LDR/17' },
  { code: 'K', label: 'Less-than-full input by OCLC participants', marcField: 'LDR/17' },
  { code: 'L', label: 'Full-level input added from a batch process', marcField: 'LDR/17' },
  { code: 'M', label: 'Less-than-full added from a batch process', marcField: 'LDR/17' },
];

/**
 * Description Conventions (MARC 040 $e)
 * Standards used for description
 */
export const DESCRIPTION_CONVENTIONS: AdminCode[] = [
  { code: 'rda', label: 'RDA: Resource Description and Access', definition: 'Resource Description and Access cataloging standard', marcField: '040$e' },
  { code: 'aacr', label: 'AACR2: Anglo-American Cataloguing Rules, 2nd ed.', definition: 'Anglo-American Cataloguing Rules, 2nd edition', marcField: '040$e' },
  { code: 'aacr2', label: 'AACR2R: AACR2 Revised', marcField: '040$e' },
  { code: 'dcrm(b)', label: 'DCRM(B): Descriptive Cataloging of Rare Materials (Books)', marcField: '040$e' },
  { code: 'dacs', label: 'DACS: Describing Archives: A Content Standard', marcField: '040$e' },
  { code: 'amremm', label: 'AMREMM: Archival Moving Image Materials', marcField: '040$e' },
  { code: 'appm', label: 'APPM: Archives, Personal Papers, and Manuscripts', marcField: '040$e' },
  { code: 'isbd', label: 'ISBD: International Standard Bibliographic Description', marcField: '040$e' },
];

/**
 * Description Authentication (MARC 042)
 * Authentication codes for cataloging
 */
export const DESCRIPTION_AUTHENTICATION: AdminCode[] = [
  { code: 'pcc', label: 'PCC: Program for Cooperative Cataloging', definition: 'Authenticated by PCC participant', marcField: '042' },
  { code: 'nsdp', label: 'NSDP: National Serials Data Program', marcField: '042' },
  { code: 'lc', label: 'LC: Library of Congress', marcField: '042' },
  { code: 'lcac', label: 'LCAC: Library of Congress Annotated Children', marcField: '042' },
  { code: 'lcderive', label: 'LC Derive: Derived from LC record', marcField: '042' },
  { code: 'lccopycat', label: 'LC Copycat: LC copy cataloging', marcField: '042' },
  { code: 'premarc', label: 'PreMARC: Converted from pre-MARC record', marcField: '042' },
  { code: 'nlc', label: 'NLC: National Library of Canada', marcField: '042' },
  { code: 'ukblsr', label: 'UKBLSR: UK British Library Document Supply Centre', marcField: '042' },
];

/**
 * Cataloging Source Codes (MARC 040 $a, $c, $d)
 * See also: locOrganizationsAPI.ts for full organization list
 */
export const CATALOGING_SOURCE_TYPES: AdminCode[] = [
  { code: 'original', label: 'Original cataloging agency (040$a)', marcField: '040$a' },
  { code: 'transcribing', label: 'Transcribing agency (040$c)', marcField: '040$c' },
  { code: 'modifying', label: 'Modifying agency (040$d)', marcField: '040$d' },
];

/**
 * Bibliographic Level (Leader/07)
 */
export const BIBLIOGRAPHIC_LEVEL_CODES: AdminCode[] = [
  { code: 'a', label: 'Monographic component part', marcField: 'LDR/07' },
  { code: 'b', label: 'Serial component part', marcField: 'LDR/07' },
  { code: 'c', label: 'Collection', marcField: 'LDR/07' },
  { code: 'd', label: 'Subunit', marcField: 'LDR/07' },
  { code: 'i', label: 'Integrating resource', marcField: 'LDR/07' },
  { code: 'm', label: 'Monograph/Item', marcField: 'LDR/07' },
  { code: 's', label: 'Serial', marcField: 'LDR/07' },
];

/**
 * Cataloger Transaction Codes
 * Internal codes for cataloging workflows
 */
export const TRANSACTION_CODES = [
  { code: 'CREATE', label: 'Create new record' },
  { code: 'UPDATE', label: 'Update existing record' },
  { code: 'DELETE', label: 'Delete record' },
  { code: 'MERGE', label: 'Merge records' },
  { code: 'SPLIT', label: 'Split record' },
  { code: 'DERIVE', label: 'Derive from existing record' },
  { code: 'IMPORT', label: 'Import from external source' },
  { code: 'EXPORT', label: 'Export record' },
  { code: 'REVIEW', label: 'Review/Quality check' },
  { code: 'APPROVE', label: 'Approve for publication' },
];

/**
 * Cataloging Status
 * Workflow status tracking
 */
export const CATALOGING_STATUS = [
  { code: 'draft', label: 'Draft', definition: 'Record in progress, not ready for publication' },
  { code: 'review', label: 'Under Review', definition: 'Record submitted for review' },
  { code: 'approved', label: 'Approved', definition: 'Record approved for publication' },
  { code: 'published', label: 'Published', definition: 'Record published and available' },
  { code: 'revised', label: 'Revised', definition: 'Published record that has been revised' },
  { code: 'deprecated', label: 'Deprecated', definition: 'Record superseded by newer version' },
  { code: 'deleted', label: 'Deleted', definition: 'Record marked for deletion' },
];

/**
 * Language of Cataloging (MARC 040 $b)
 * Language in which cataloging was done
 */
export const CATALOGING_LANGUAGES: AdminCode[] = [
  { code: 'eng', label: 'English', marcField: '040$b' },
  { code: 'ara', label: 'Arabic', marcField: '040$b' },
  { code: 'fre', label: 'French', marcField: '040$b' },
  { code: 'ger', label: 'German', marcField: '040$b' },
  { code: 'spa', label: 'Spanish', marcField: '040$b' },
];

/**
 * Get encoding level label
 */
export function getEncodingLevelLabel(code: string): string {
  const level = ENCODING_LEVEL_CODES.find(l => l.code === code);
  return level ? level.label : code;
}

/**
 * Get description convention label
 */
export function getDescriptionConventionLabel(code: string): string {
  const conv = DESCRIPTION_CONVENTIONS.find(c => c.code === code);
  return conv ? conv.label : code;
}

/**
 * Get authentication label
 */
export function getAuthenticationLabel(code: string): string {
  const auth = DESCRIPTION_AUTHENTICATION.find(a => a.code === code);
  return auth ? auth.label : code;
}
