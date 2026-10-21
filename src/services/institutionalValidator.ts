/**
 * INSTITUTIONAL VALIDATOR
 * Validates BIBFRAME graphs against national library standards
 * Enforces rules from LOC, PCC, and RDA cataloging guidelines
 */

export interface ValidationIssue {
  level: 'error' | 'warning' | 'info';
  entity: string;
  property?: string;
  message: string;
  fix?: string;
}

export interface InstitutionalValidationResult {
  valid: boolean;
  score: number; // 0-100
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
  summary: string;
}

/**
 * Validate BIBFRAME graph against institutional standards
 */
export function validateInstitutionalBibframe(jsonld: any): InstitutionalValidationResult {
  const issues: ValidationIssue[] = [];
  const graph = jsonld['@graph'] || [];

  // Find entities
  const work = graph.find((e: any) => e['@type'] === 'bf:Work');
  const instance = graph.find((e: any) => e['@type'] === 'bf:Instance');
  const item = graph.find((e: any) => e['@type'] === 'bf:Item');
  const admin = graph.find((e: any) => e['@type'] === 'bf:AdminMetadata');

  // CRITICAL VALIDATIONS (errors)
  
  // 1. Work must exist
  if (!work) {
    issues.push({
      level: 'error',
      entity: 'Work',
      message: 'Work entity is missing',
      fix: 'Every BIBFRAME record must have a Work entity'
    });
  } else {
    // Work must have title
    if (!work['bf:title']) {
      issues.push({
        level: 'error',
        entity: 'Work',
        property: 'bf:title',
        message: 'Work missing title',
        fix: 'Add bf:title with bf:mainTitle'
      });
    } else if (typeof work['bf:title'] === 'object' && !work['bf:title']['bf:mainTitle']) {
      issues.push({
        level: 'error',
        entity: 'Work',
        property: 'bf:title/bf:mainTitle',
        message: 'Work title missing bf:mainTitle',
        fix: 'Title must have mainTitle property'
      });
    }

    // Work should have contribution
    if (!work['bf:contribution']) {
      issues.push({
        level: 'warning',
        entity: 'Work',
        property: 'bf:contribution',
        message: 'Work has no contributors',
        fix: 'Add at least one bf:contribution with agent and role'
      });
    } else {
      // Validate contributions
      const contribs = Array.isArray(work['bf:contribution']) ? work['bf:contribution'] : [work['bf:contribution']];
      contribs.forEach((contrib: any, idx: number) => {
        if (!contrib['bf:agent']) {
          issues.push({
            level: 'error',
            entity: 'Work',
            property: `bf:contribution[${idx}]/bf:agent`,
            message: 'Contribution missing agent',
            fix: 'Each contribution must have bf:agent with URI'
          });
        }
        if (!contrib['bf:role']) {
          issues.push({
            level: 'warning',
            entity: 'Work',
            property: `bf:contribution[${idx}]/bf:role`,
            message: 'Contribution missing role',
            fix: 'Add bf:role with MARC relator code'
          });
        }
      });
    }
  }

  // 2. Instance must exist
  if (!instance) {
    issues.push({
      level: 'error',
      entity: 'Instance',
      message: 'Instance entity is missing',
      fix: 'Every BIBFRAME record must have an Instance entity'
    });
  } else {
    // Instance must link to Work
    if (!instance['bf:instanceOf']) {
      issues.push({
        level: 'error',
        entity: 'Instance',
        property: 'bf:instanceOf',
        message: 'Instance not linked to Work',
        fix: 'Add bf:instanceOf pointing to Work URI'
      });
    }

    // Instance must have carrier
    if (!instance['bf:carrier']) {
      issues.push({
        level: 'error',
        entity: 'Instance',
        property: 'bf:carrier',
        message: 'Instance missing carrier type',
        fix: 'Add bf:carrier from LOC vocabulary'
      });
    }

    // Instance must have media
    if (!instance['bf:media']) {
      issues.push({
        level: 'error',
        entity: 'Instance',
        property: 'bf:media',
        message: 'Instance missing media type',
        fix: 'Add bf:media from LOC vocabulary'
      });
    }

    // Instance should have provisionActivity
    const provAct = instance['bf:provisionActivity'] || instance['provisionActivity'];
    if (!provAct) {
      issues.push({
        level: 'warning',
        entity: 'Instance',
        property: 'bf:provisionActivity',
        message: 'Instance missing publication information',
        fix: 'Add bf:provisionActivity with agent, place, and date'
      });
    } else {
      // Validate provisionActivity structure (supporting both linked and inline nodes)
      const provId = typeof provAct === 'object' && provAct['@id'];
      const prov = provId ? (graph.find((e: any) => e['@id'] === provId) || provAct) : provAct;
      if (prov && typeof prov === 'object') {
        const hasAgent = prov['bf:agent'] || prov['agent'];
        const hasPlace = prov['bf:place'] || prov['place'];
        const hasDate = prov['bf:date'] || prov['date'];

        if (!hasAgent) {
          issues.push({
            level: 'warning',
            entity: 'ProvisionActivity',
            property: 'bf:agent',
            message: 'Publication missing publisher/agent',
            fix: 'Add bf:agent to provisionActivity'
          });
        }
        if (!hasPlace) {
          issues.push({
            level: 'warning',
            entity: 'ProvisionActivity',
            property: 'bf:place',
            message: 'Publication missing place',
            fix: 'Add bf:place to provisionActivity'
          });
        }
        if (!hasDate) {
          issues.push({
            level: 'warning',
            entity: 'ProvisionActivity',
            property: 'bf:date',
            message: 'Publication missing date',
            fix: 'Add bf:date to provisionActivity'
          });
        }
      }
    }
  }

  // 3. Item validation
  if (!item) {
    issues.push({
      level: 'warning',
      entity: 'Item',
      message: 'Item entity is missing',
      fix: 'Add Item entity for holdings information'
    });
  } else {
    // Item must link to Instance
    const itemOfLink = item['bf:itemOf'] || item['itemOf'];
    if (!itemOfLink) {
      issues.push({
        level: 'error',
        entity: 'Item',
        property: 'bf:itemOf',
        message: 'Item not linked to Instance',
        fix: 'Add bf:itemOf pointing to Instance URI'
      });
    }
  }

  // 4. AdminMetadata validation (CRITICAL for institutional)
  if (!admin) {
    issues.push({
      level: 'error',
      entity: 'AdminMetadata',
      message: 'AdminMetadata is missing',
      fix: 'Add bf:AdminMetadata with creation date, source, and conventions'
    });
  } else {
    // AdminMetadata must have creation date
    const creationDate = admin['bf:creationDate'] || admin['creationDate'] || admin['bf:changeDate'] || admin['changeDate'] || admin['date'];
    if (!creationDate) {
      issues.push({
        level: 'error',
        entity: 'AdminMetadata',
        property: 'bf:creationDate',
        message: 'AdminMetadata missing creation date',
        fix: 'Add bf:creationDate with ISO timestamp'
      });
    }

    // AdminMetadata must have source
    const source = admin['bf:source'] || admin['source'] || admin['bf:assigner'] || admin['assigner'];
    if (!source) {
      issues.push({
        level: 'error',
        entity: 'AdminMetadata',
        property: 'bf:source',
        message: 'AdminMetadata missing cataloging source',
        fix: 'Add bf:source with institution URI'
      });
    }

    // AdminMetadata should have description conventions
    const conventions = admin['bf:descriptionConventions'] || admin['descriptionConventions'];
    if (!conventions) {
      issues.push({
        level: 'warning',
        entity: 'AdminMetadata',
        property: 'bf:descriptionConventions',
        message: 'AdminMetadata missing cataloging conventions',
        fix: 'Add bf:descriptionConventions (RDA, AACR2, etc.)'
      });
    }
  }

  // 5. URI validation
  graph.forEach((entity: any) => {
    if (!entity['@id']) {
      issues.push({
        level: 'error',
        entity: entity['@type'] || 'Unknown',
        property: '@id',
        message: 'Entity missing URI',
        fix: 'All entities must have @id with valid HTTP URI'
      });
    } else if (!entity['@id'].startsWith('http')) {
      issues.push({
        level: 'error',
        entity: entity['@type'] || 'Unknown',
        property: '@id',
        message: `Invalid URI: ${entity['@id']}`,
        fix: 'URIs must start with http:// or https://'
      });
    }
  });

  // 6. Validate entity linking
  if (work && instance) {
    const hasLink = work['bf:hasInstance'] || work['bf:hasExpression'] || work['hasInstance'] || instance['bf:instanceOf'] || instance['instanceOf'];
    if (!hasLink) {
      issues.push({
        level: 'error',
        entity: 'Work',
        property: 'bf:hasInstance',
        message: 'Work not linked to Instance',
        fix: 'Add bf:hasInstance or bf:hasExpression link'
      });
    }
  }

  if (instance && item) {
    const hasItemLink = instance['bf:hasItem'] || instance['hasItem'] || item['bf:itemOf'] || item['itemOf'];
    if (!hasItemLink) {
      issues.push({
        level: 'warning',
        entity: 'Instance',
        property: 'bf:hasItem',
        message: 'Instance not linked to Item',
        fix: 'Add bf:hasItem link'
      });
    }
  }

  // Calculate score
  const errors = issues.filter(i => i.level === 'error');
  const warnings = issues.filter(i => i.level === 'warning');
  const info = issues.filter(i => i.level === 'info');

  const score = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));
  const valid = errors.length === 0;

  let summary = '';
  if (valid && warnings.length === 0) {
    summary = '✅ Institutional-grade BIBFRAME record';
  } else if (valid) {
    summary = `⚠️ Valid but ${warnings.length} improvement(s) recommended`;
  } else {
    summary = `❌ Invalid: ${errors.length} critical error(s) must be fixed`;
  }

  return {
    valid,
    score,
    errors,
    warnings,
    info,
    summary
  };
}

/**
 * Quick validation - just check if record is minimally valid
 */
export function isMinimallyValid(jsonld: any): boolean {
  const graph = jsonld['@graph'] || [];
  
  const hasWork = graph.some((e: any) => e['@type'] === 'bf:Work');
  const hasInstance = graph.some((e: any) => e['@type'] === 'bf:Instance');
  
  return hasWork && hasInstance;
}

/**
 * Get validation level badge
 */
export function getValidationBadge(result: InstitutionalValidationResult): string {
  if (result.score >= 95) return 'EXCELLENT';
  if (result.score >= 85) return 'GOOD';
  if (result.score >= 70) return 'ACCEPTABLE';
  if (result.score >= 50) return 'NEEDS WORK';
  return 'INVALID';
}
