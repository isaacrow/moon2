/**
 * KAMI Validation Engine
 * Production-grade validation for BIBFRAME cataloging
 */

import { 
  ValidationRule, 
  ValidationMessage, 
  ValidationResult,
  KamiWork,
  KamiInstance,
  KamiItem,
  KamiRecord
} from '../../types/kami';
import { getClassProperties, isPropertyRequired } from './kamiOntologyEngine';

/**
 * Core validation rules for monograph cataloging
 */
export const MONOGRAPH_VALIDATION_RULES: ValidationRule[] = [
  {
    rule_id: 'work-title-required',
    field: 'work.title.mainTitle',
    rule_type: 'required',
    severity: 'error',
    message: 'Main title is required for all works',
    validator: (value) => !!value && value.trim().length > 0
  },
  {
    rule_id: 'work-author-required',
    field: 'work.contributions',
    rule_type: 'required',
    severity: 'error',
    message: 'At least one author/creator is required',
    validator: (value) => Array.isArray(value) && value.length > 0
  },
  {
    rule_id: 'instance-publication-required',
    field: 'instance.publication',
    rule_type: 'required',
    severity: 'error',
    message: 'Publication information is required for monographs',
    validator: (value) => !!value && (value.date || value.place || value.agent)
  },
  {
    rule_id: 'instance-isbn-recommended',
    field: 'instance.identifiers',
    rule_type: 'required',
    severity: 'warning',
    message: 'ISBN is recommended for published monographs',
    validator: (value) => {
      if (!Array.isArray(value)) return false;
      return value.some(id => id.type === 'ISBN');
    }
  },
  {
    rule_id: 'isbn-format-valid',
    field: 'instance.identifiers[type=ISBN].value',
    rule_type: 'format',
    severity: 'warning',
    message: 'ISBN should be 10 or 13 digits',
    validator: (value) => {
      if (!value) return true; // Optional field
      const cleaned = value.replace(/[-\s]/g, '');
      return /^(\d{10}|\d{13})$/.test(cleaned);
    }
  },
  {
    rule_id: 'work-subject-recommended',
    field: 'work.subjects',
    rule_type: 'required',
    severity: 'warning',
    message: 'Subject headings are recommended for better discoverability',
    validator: (value) => Array.isArray(value) && value.length > 0
  },
  {
    rule_id: 'work-classification-recommended',
    field: 'work.classifications',
    rule_type: 'required',
    severity: 'warning',
    message: 'Classification (LCC/DDC) is recommended',
    validator: (value) => Array.isArray(value) && value.length > 0
  },
  {
    rule_id: 'authority-uri-recommended',
    field: 'work.contributions[].agent.external_uri',
    rule_type: 'authority',
    severity: 'info',
    message: 'Linking to authority records (LOC, VIAF) improves data quality',
    validator: (value) => !!value && value.startsWith('http')
  }
];

/**
 * Manuscript-specific validation rules
 */
export const MANUSCRIPT_VALIDATION_RULES: ValidationRule[] = [
  {
    rule_id: 'manuscript-title-required',
    field: 'work.title.mainTitle',
    rule_type: 'required',
    severity: 'error',
    message: 'Title is required for manuscripts',
    validator: (value) => !!value && value.trim().length > 0
  },
  {
    rule_id: 'manuscript-repository-required',
    field: 'items[0].holding_institution',
    rule_type: 'required',
    severity: 'error',
    message: 'Holding institution is required for manuscripts',
    validator: (value) => !!value && !!value.name
  },
  {
    rule_id: 'manuscript-shelfmark-required',
    field: 'items[0].call_number',
    rule_type: 'required',
    severity: 'error',
    message: 'Shelf mark/call number is required for manuscripts',
    validator: (value) => !!value && value.trim().length > 0
  },
  {
    rule_id: 'manuscript-script-recommended',
    field: 'instance.jsonld.script',
    rule_type: 'required',
    severity: 'warning',
    message: 'Script type is recommended for manuscripts',
    validator: (value) => !!value
  },
  {
    rule_id: 'manuscript-origin-date-recommended',
    field: 'work.originDate',
    rule_type: 'required',
    severity: 'warning',
    message: 'Date of origin is recommended for manuscripts',
    validator: (value) => !!value
  }
];

/**
 * Main Validation Engine Class
 */
export class KamiValidationEngine {
  private rules: Map<string, ValidationRule[]> = new Map();
  
  constructor() {
    // Load default rules
    this.loadRules('monograph', MONOGRAPH_VALIDATION_RULES);
    this.loadRules('manuscript', MANUSCRIPT_VALIDATION_RULES);
  }
  
  /**
   * Load validation rules for a catalog type
   */
  loadRules(catalogType: string, rules: ValidationRule[]) {
    this.rules.set(catalogType, rules);
  }
  
  /**
   * Get rules for a catalog type
   */
  getRules(catalogType: string): ValidationRule[] {
    return this.rules.get(catalogType) || [];
  }
  
  /**
   * Validate a single field
   */
  validateField(
    field: string, 
    value: any, 
    context: any,
    catalogType: string = 'monograph'
  ): ValidationMessage[] {
    const rules = this.getRules(catalogType);
    const messages: ValidationMessage[] = [];
    
    for (const rule of rules) {
      // Check if rule applies to this field
      if (!this.fieldMatches(field, rule.field)) continue;
      
      // Run validator
      try {
        const isValid = rule.validator ? rule.validator(value, context) : true;
        
        if (!isValid) {
          messages.push({
            field: rule.field,
            message: rule.message,
            severity: rule.severity,
            rule_id: rule.rule_id
          });
        }
      } catch (error) {
        console.error(`Validation error for rule ${rule.rule_id}:`, error);
      }
    }
    
    return messages;
  }
  
  /**
   * Validate an entire work
   */
  validateWork(work: Partial<KamiWork>, catalogType: string = 'monograph'): ValidationResult {
    const messages: ValidationMessage[] = [];
    const rules = this.getRules(catalogType);
    
    for (const rule of rules) {
      if (!rule.field.startsWith('work.')) continue;
      
      const value = this.getNestedValue(work, rule.field.replace('work.', ''));
      const fieldMessages = this.validateField(rule.field, value, work, catalogType);
      messages.push(...fieldMessages);
    }
    
    const errors = messages.filter(m => m.severity === 'error');
    const warnings = messages.filter(m => m.severity === 'warning');
    
    return {
      valid: errors.length === 0,
      messages,
      can_save: true, // Can always save drafts
      can_publish: errors.length === 0 && warnings.length === 0
    };
  }
  
  /**
   * Validate an instance
   */
  validateInstance(instance: Partial<KamiInstance>, catalogType: string = 'monograph'): ValidationResult {
    const messages: ValidationMessage[] = [];
    const rules = this.getRules(catalogType);
    
    for (const rule of rules) {
      if (!rule.field.startsWith('instance.')) continue;
      
      const value = this.getNestedValue(instance, rule.field.replace('instance.', ''));
      const fieldMessages = this.validateField(rule.field, value, instance, catalogType);
      messages.push(...fieldMessages);
    }
    
    const errors = messages.filter(m => m.severity === 'error');
    const warnings = messages.filter(m => m.severity === 'warning');
    
    return {
      valid: errors.length === 0,
      messages,
      can_save: true,
      can_publish: errors.length === 0 && warnings.length === 0
    };
  }
  
  /**
   * Validate items
   */
  validateItems(items: Partial<KamiItem>[], catalogType: string = 'monograph'): ValidationResult {
    const messages: ValidationMessage[] = [];
    const rules = this.getRules(catalogType);
    
    for (const rule of rules) {
      if (!rule.field.startsWith('items')) continue;
      
      // Validate first item (manuscripts typically have one item)
      if (items.length > 0) {
        const value = this.getNestedValue(items[0], rule.field.replace('items[0].', ''));
        const fieldMessages = this.validateField(rule.field, value, items[0], catalogType);
        messages.push(...fieldMessages);
      } else if (rule.severity === 'error') {
        messages.push({
          field: rule.field,
          message: 'Item information is required',
          severity: 'error',
          rule_id: rule.rule_id
        });
      }
    }
    
    const errors = messages.filter(m => m.severity === 'error');
    
    return {
      valid: errors.length === 0,
      messages,
      can_save: true,
      can_publish: errors.length === 0
    };
  }
  
  /**
   * Validate complete record
   */
  validateRecord(record: Partial<KamiRecord>): ValidationResult {
    const catalogType = record.metadata?.catalogType || 'monograph';
    const allMessages: ValidationMessage[] = [];
    
    // Validate work
    if (record.work) {
      const workResult = this.validateWork(record.work, catalogType);
      allMessages.push(...workResult.messages);
    } else {
      allMessages.push({
        field: 'work',
        message: 'Work information is required',
        severity: 'error'
      });
    }
    
    // Validate instance
    if (record.instance) {
      const instanceResult = this.validateInstance(record.instance, catalogType);
      allMessages.push(...instanceResult.messages);
    } else {
      allMessages.push({
        field: 'instance',
        message: 'Instance information is required',
        severity: 'error'
      });
    }
    
    // Validate items (if applicable)
    if (catalogType === 'manuscript' && record.items) {
      const itemsResult = this.validateItems(record.items, catalogType);
      allMessages.push(...itemsResult.messages);
    }
    
    const errors = allMessages.filter(m => m.severity === 'error');
    const warnings = allMessages.filter(m => m.severity === 'warning');
    
    return {
      valid: errors.length === 0,
      messages: allMessages,
      can_save: true,
      can_publish: errors.length === 0 && warnings.length === 0
    };
  }
  
  /**
   * Check if a record can be published
   */
  canPublish(record: Partial<KamiRecord>): boolean {
    const result = this.validateRecord(record);
    return result.can_publish;
  }
  
  /**
   * Get validation summary
   */
  getValidationSummary(result: ValidationResult): {
    errors: number;
    warnings: number;
    info: number;
    status: 'valid' | 'warnings' | 'errors';
  } {
    const errors = result.messages.filter(m => m.severity === 'error').length;
    const warnings = result.messages.filter(m => m.severity === 'warning').length;
    const info = result.messages.filter(m => m.severity === 'info').length;
    
    let status: 'valid' | 'warnings' | 'errors' = 'valid';
    if (errors > 0) status = 'errors';
    else if (warnings > 0) status = 'warnings';
    
    return { errors, warnings, info, status };
  }
  
  /**
   * Helper: Check if field path matches rule field pattern
   */
  private fieldMatches(actualField: string, ruleField: string): boolean {
    // Simple exact match for now
    // Could be extended to support wildcards like work.contributions[*].agent.uri
    return actualField === ruleField || actualField.startsWith(ruleField + '.');
  }
  
  /**
   * Helper: Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) return undefined;
      
      // Handle array notation like contributions[0]
      const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, arrayKey, index] = arrayMatch;
        current = current[arrayKey]?.[parseInt(index)];
      } else {
        current = current[key];
      }
    }
    
    return current;
  }
}

/**
 * Singleton instance
 */
let validationEngineInstance: KamiValidationEngine | null = null;

/**
 * Get validation engine instance
 */
export function getValidationEngine(): KamiValidationEngine {
  if (!validationEngineInstance) {
    validationEngineInstance = new KamiValidationEngine();
  }
  return validationEngineInstance;
}

/**
 * Quick validation helpers
 */
export function validateMonograph(record: Partial<KamiRecord>): ValidationResult {
  return getValidationEngine().validateRecord(record);
}

export function validateManuscript(record: Partial<KamiRecord>): ValidationResult {
  return getValidationEngine().validateRecord(record);
}

/**
 * Real-time field validation hook
 */
export function useFieldValidation(
  field: string,
  value: any,
  context: any,
  catalogType: string = 'monograph'
) {
  const engine = getValidationEngine();
  return engine.validateField(field, value, context, catalogType);
}
