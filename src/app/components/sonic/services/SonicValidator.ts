/**
 * Sonic Validator
 * 
 * Ontology-aware validation based on BIBFRAME 3.0 specification
 * 
 * Features:
 * - Property domain validation
 * - Property range validation  
 * - Literal datatype validation
 * - Required property checks
 * - Structural validation
 * 
 * @version 1.0.0
 */

import type { 
  BF3Work, 
  BF3Instance, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning 
} from '../types/bibframe3';

export class SonicValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];

  /**
   * Validate Work and Instance against BIBFRAME 3.0 ontology
   */
  validateGraph(work: BF3Work, instance: BF3Instance): ValidationResult {
    this.errors = [];
    this.warnings = [];

    this.validateWork(work);
    this.validateInstance(instance);
    this.validateRelationship(work, instance);

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Validate Work entity
   */
  private validateWork(work: BF3Work): void {
    // Required: @id
    if (!work['@id']) {
      this.addError('Work', '@id', 'Work must have an @id');
    }

    // Required: @type
    if (!work['@type']) {
      this.addError('Work', '@type', 'Work must have an @type');
    } else {
      // Validate @type is a valid Work class
      const validTypes = [
        'bf:Work', 'bf:Text', 'bf:StillImage', 'bf:MovingImage', 
        'bf:Audio', 'bf:Cartography', 'bf:Dataset', 'bf:Multimedia', 
        'bf:MixedMaterial', 'bf:NotatedMusic', 'bf:NotatedMovement', 'bf:Object3D'
      ];
      if (!validTypes.includes(work['@type'] as string)) {
        this.addError('Work', '@type', `Invalid Work type: ${work['@type']}`);
      }
    }

    // Recommended: bf:hasTitle
    if (!work['bf:hasTitle']) {
      this.addWarning('Work', 'bf:hasTitle', 'Work should have a title');
    } else {
      this.validateTitle(work['bf:hasTitle'], 'Work');
    }

    // Validate bf:contribution
    if (work['bf:contribution']) {
      this.validateContribution(work['bf:contribution'], 'Work');
    } else {
      this.addWarning('Work', 'bf:contribution', 'Work should have at least one contributor');
    }

    // Validate bf:subject
    if (work['bf:subject']) {
      this.validateSubject(work['bf:subject'], 'Work');
    }

    // Validate bf:classification
    if (work['bf:classification']) {
      this.validateClassification(work['bf:classification'], 'Work');
    }

    // Validate bf:language
    if (work['bf:language']) {
      this.validateLanguage(work['bf:language'], 'Work');
    }

    // Validate bf:originDate (must be valid date format)
    if (work['bf:originDate']) {
      if (!this.isValidDate(work['bf:originDate'])) {
        this.addError('Work', 'bf:originDate', 'Invalid date format for bf:originDate');
      }
    }
  }

  /**
   * Validate Instance entity
   */
  private validateInstance(instance: BF3Instance): void {
    // Required: @id
    if (!instance['@id']) {
      this.addError('Instance', '@id', 'Instance must have an @id');
    }

    // Required: @type
    if (!instance['@type']) {
      this.addError('Instance', '@type', 'Instance must have an @type');
    } else {
      const validTypes = ['bf:Instance', 'bf:Print', 'bf:Electronic', 'bf:Manuscript'];
      if (!validTypes.includes(instance['@type'] as string)) {
        this.addError('Instance', '@type', `Invalid Instance type: ${instance['@type']}`);
      }
    }

    // Required: bf:instanceOf
    if (!instance['bf:instanceOf']) {
      this.addError('Instance', 'bf:instanceOf', 'Instance must have bf:instanceOf pointing to a Work');
    } else {
      if (!instance['bf:instanceOf']['@id']) {
        this.addError('Instance', 'bf:instanceOf', 'bf:instanceOf must have an @id reference');
      }
    }

    // Recommended: bf:hasTitle
    if (!instance['bf:hasTitle']) {
      this.addWarning('Instance', 'bf:hasTitle', 'Instance should have a title');
    } else {
      this.validateTitle(instance['bf:hasTitle'], 'Instance');
    }

    // Validate bf:provisionActivity
    if (instance['bf:provisionActivity']) {
      this.validateProvisionActivity(instance['bf:provisionActivity'], 'Instance');
    } else {
      this.addWarning('Instance', 'bf:provisionActivity', 'Instance should have publication/production information');
    }

    // Validate bf:identifiedBy
    if (instance['bf:identifiedBy']) {
      this.validateIdentifier(instance['bf:identifiedBy'], 'Instance');
    }

    // Validate bf:copyrightDate
    if (instance['bf:copyrightDate']) {
      if (!this.isValidDate(instance['bf:copyrightDate'])) {
        this.addError('Instance', 'bf:copyrightDate', 'Invalid date format for bf:copyrightDate');
      }
    }
  }

  /**
   * Validate relationship between Work and Instance
   */
  private validateRelationship(work: BF3Work, instance: BF3Instance): void {
    if (instance['bf:instanceOf']) {
      const instanceOfId = instance['bf:instanceOf']['@id'];
      if (instanceOfId !== work['@id']) {
        this.addWarning('Instance', 'bf:instanceOf', 
          `Instance references Work ${instanceOfId} but current Work is ${work['@id']}`);
      }
    }
  }

  /**
   * Validate Title
   */
  private validateTitle(title: any, entity: 'Work' | 'Instance'): void {
    const titles = Array.isArray(title) ? title : [title];

    for (const t of titles) {
      if (!t['@type']) {
        this.addError(entity, 'bf:hasTitle', 'Title must have @type');
      }

      if (!t['bf:mainTitle']) {
        this.addError(entity, 'bf:hasTitle', 'Title must have bf:mainTitle');
      }

      if (t['@id'] && !t['@id'].startsWith('http')) {
        this.addWarning(entity, 'bf:hasTitle', 'Title @id should be a full URI');
      }
    }
  }

  /**
   * Validate Contribution
   */
  private validateContribution(contribution: any, entity: 'Work' | 'Instance'): void {
    const contribs = Array.isArray(contribution) ? contribution : [contribution];

    for (const contrib of contribs) {
      if (!contrib['@type']) {
        this.addError(entity, 'bf:contribution', 'Contribution must have @type');
      }

      if (!contrib['bf:agent']) {
        this.addError(entity, 'bf:contribution', 'Contribution must have bf:agent');
      } else {
        // Validate agent
        const agent = contrib['bf:agent'];
        if (typeof agent === 'object') {
          if (!agent['@type']) {
            this.addError(entity, 'bf:contribution', 'Agent must have @type');
          }
          if (!agent['rdfs:label'] && !agent['@id']) {
            this.addError(entity, 'bf:contribution', 'Agent must have rdfs:label or @id');
          }
        }
      }

      if (!contrib['bf:role']) {
        this.addWarning(entity, 'bf:contribution', 'Contribution should have bf:role');
      }
    }
  }

  /**
   * Validate Subject
   */
  private validateSubject(subject: any, entity: 'Work' | 'Instance'): void {
    const subjects = Array.isArray(subject) ? subject : [subject];

    for (const subj of subjects) {
      if (!subj['@type']) {
        this.addError(entity, 'bf:subject', 'Subject must have @type');
      }

      if (!subj['rdfs:label'] && !subj['@id']) {
        this.addError(entity, 'bf:subject', 'Subject must have rdfs:label or @id');
      }

      // Validate subject type
      const validTypes = [
        'bf:Topic', 'bf:Place', 'bf:Temporal', 'bf:Person', 
        'bf:Organization', 'bf:Meeting', 'bf:GenreForm'
      ];
      if (subj['@type'] && !validTypes.includes(subj['@type'])) {
        this.addWarning(entity, 'bf:subject', `Unusual subject type: ${subj['@type']}`);
      }
    }
  }

  /**
   * Validate Classification
   */
  private validateClassification(classification: any, entity: 'Work' | 'Instance'): void {
    const classes = Array.isArray(classification) ? classification : [classification];

    for (const cls of classes) {
      if (!cls['@type']) {
        this.addError(entity, 'bf:classification', 'Classification must have @type');
      }

      if (!cls['bf:classificationPortion']) {
        this.addWarning(entity, 'bf:classification', 'Classification should have bf:classificationPortion');
      }
    }
  }

  /**
   * Validate Language
   */
  private validateLanguage(language: any, entity: 'Work' | 'Instance'): void {
    const langs = Array.isArray(language) ? language : [language];

    for (const lang of langs) {
      if (typeof lang === 'object') {
        if (!lang['@type']) {
          this.addError(entity, 'bf:language', 'Language must have @type');
        }
        if (!lang['@id'] && !lang['rdfs:label']) {
          this.addError(entity, 'bf:language', 'Language must have @id or rdfs:label');
        }
      }
    }
  }

  /**
   * Validate Provision Activity
   */
  private validateProvisionActivity(activity: any, entity: 'Work' | 'Instance'): void {
    const activities = Array.isArray(activity) ? activity : [activity];

    for (const act of activities) {
      if (!act['@type']) {
        this.addError(entity, 'bf:provisionActivity', 'ProvisionActivity must have @type');
      }

      const validTypes = [
        'bf:ProvisionActivity', 'bf:Publication', 'bf:Production', 
        'bf:Distribution', 'bf:Manufacture'
      ];
      if (act['@type'] && !validTypes.includes(act['@type'])) {
        this.addError(entity, 'bf:provisionActivity', `Invalid ProvisionActivity type: ${act['@type']}`);
      }

      if (!act['bf:date']) {
        this.addWarning(entity, 'bf:provisionActivity', 'ProvisionActivity should have bf:date');
      }

      if (!act['bf:agent']) {
        this.addWarning(entity, 'bf:provisionActivity', 'ProvisionActivity should have bf:agent (publisher/producer)');
      }
    }
  }

  /**
   * Validate Identifier
   */
  private validateIdentifier(identifier: any, entity: 'Work' | 'Instance'): void {
    const identifiers = Array.isArray(identifier) ? identifier : [identifier];

    for (const id of identifiers) {
      if (!id['@type']) {
        this.addError(entity, 'bf:identifiedBy', 'Identifier must have @type');
      }

      if (!id['rdf:value']) {
        this.addError(entity, 'bf:identifiedBy', 'Identifier must have rdf:value');
      }

      // Validate identifier type
      const validTypes = [
        'bf:Identifier', 'bf:Isbn', 'bf:Issn', 'bf:Lccn', 'bf:Doi', 
        'bf:Ean', 'bf:Local', 'bf:Isni', 'bf:Orcid', 'bf:Upc'
      ];
      if (id['@type'] && !validTypes.some(t => id['@type'].includes(t))) {
        this.addWarning(entity, 'bf:identifiedBy', `Unusual identifier type: ${id['@type']}`);
      }
    }
  }

  /**
   * Check if string is valid date
   */
  private isValidDate(dateString: string): boolean {
    // Accept ISO 8601 or EDTF formats
    const isoPattern = /^\d{4}(-\d{2}(-\d{2})?)?$/;
    const edtfPattern = /^\d{4}(\/\d{4})?$/;
    
    return isoPattern.test(dateString) || edtfPattern.test(dateString);
  }

  /**
   * Add validation error
   */
  private addError(entity: 'Work' | 'Instance' | 'Item', property: string, message: string): void {
    this.errors.push({
      entity,
      property,
      message,
      severity: 'error'
    });
  }

  /**
   * Add validation warning
   */
  private addWarning(entity: 'Work' | 'Instance' | 'Item', property: string, message: string): void {
    this.warnings.push({
      entity,
      property,
      message,
      severity: 'warning'
    });
  }
}
