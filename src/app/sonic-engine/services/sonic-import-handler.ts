/**
 * Sonic Import Handler
 * Handles importing JSON-LD with @graph resolution
 */

import { parseGraph, extractFormData } from './jsonld-graph-parser';
import type { BF3Work, BF3Instance } from '../types/bibframe3-strict';

export interface ImportResult {
  success: boolean;
  work: BF3Work | null;
  instances: BF3Instance[];
  formData: any;
  errors: string[];
}

/**
 * Import JSON-LD and resolve all references
 */
export function importJSONLD(jsonldText: string): ImportResult {
  const errors: string[] = [];

  try {
    // Parse JSON
    const jsonld = JSON.parse(jsonldText);

    // Check if it has @graph
    if (!jsonld['@graph']) {
      // Simple format without @graph
      return importSimpleFormat(jsonld);
    }

    // Parse @graph structure
    const { work, instances, nodeMap } = parseGraph(jsonld);

    if (!work) {
      errors.push('No Work entity found in @graph');
    }

    // Extract form data
    const formData = extractFormData(work);

    return {
      success: true,
      work,
      instances,
      formData,
      errors,
    };

  } catch (error) {
    errors.push(`Parse error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      work: null,
      instances: [],
      formData: null,
      errors,
    };
  }
}

/**
 * Import simple format (without @graph)
 */
function importSimpleFormat(jsonld: any): ImportResult {
  const errors: string[] = [];

  // Check if root is a Work
  if (jsonld['@type'] === 'bf:Work' || 
      (Array.isArray(jsonld['@type']) && jsonld['@type'].includes('bf:Work'))) {
    
    const work = jsonld as BF3Work;
    const formData = extractFormData(work);

    return {
      success: true,
      work,
      instances: [],
      formData,
      errors,
    };
  }

  // Check if it has work and instance properties
  if (jsonld.work || jsonld.instance) {
    const work = jsonld.work as BF3Work | null;
    const instances = jsonld.instance 
      ? (Array.isArray(jsonld.instance) ? jsonld.instance : [jsonld.instance])
      : [];
    
    const formData = extractFormData(work);

    return {
      success: true,
      work,
      instances,
      formData,
      errors,
    };
  }

  errors.push('Unrecognized JSON-LD format');
  return {
    success: false,
    work: null,
    instances: [],
    formData: null,
    errors,
  };
}

/**
 * Example usage:
 * 
 * const result = importJSONLD(jsonldString);
 * 
 * if (result.success && result.formData) {
 *   setWorkData({
 *     ...result.work,
 *     mainTitle: result.formData.mainTitle,
 *     subtitle: result.formData.subtitle,
 *   });
 * }
 */
