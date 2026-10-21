// Moon Engine Core
// Handles BIBFRAME entity processing and validation

import ontology from './ontology.tsx';
import type { OntologySchema } from './ontology.tsx';

interface MoonEntity {
  '@id': string;
  '@type': string;
  [key: string]: any;
}

interface ProcessResult {
  success: boolean;
  entity?: MoonEntity;
  errors?: string[];
  warnings?: string[];
}

interface EngineStatus {
  initialized: boolean;
  ontologyLoaded: boolean;
  entitiesProcessed: number;
  lastError: string | null;
}

class MoonEngine {
  private initialized: boolean = false;
  private entitiesProcessed: number = 0;
  private lastError: string | null = null;

  constructor() {
    console.log('[MoonEngine] Instance created');
  }

  async initialize(): Promise<void> {
    console.log('[MoonEngine] Initializing...');

    // Check if ontology is loaded
    if (!ontology.isInitialized()) {
      throw new Error('[MoonEngine] ❌ Ontology not loaded - cannot initialize engine');
    }

    const schema = ontology.getSchema();
    if (!schema) {
      throw new Error('[MoonEngine] ❌ Ontology schema is null');
    }

    console.log('[MoonEngine] ✅ Ontology connection verified');
    console.log(`[MoonEngine] Available classes: ${Object.keys(schema.classes).join(', ')}`);

    this.initialized = true;
    console.log('[MoonEngine] ✅ Engine initialized successfully');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getStatus(): EngineStatus {
    return {
      initialized: this.initialized,
      ontologyLoaded: ontology.isInitialized(),
      entitiesProcessed: this.entitiesProcessed,
      lastError: this.lastError
    };
  }

  async process(entity: any): Promise<ProcessResult> {
    if (!this.initialized) {
      return {
        success: false,
        errors: ['Engine not initialized']
      };
    }

    console.log('[MoonEngine] Processing entity:', entity['@type'] || entity.type);

    try {
      // Extract entity type
      const entityType = entity['@type'] || entity.type;
      if (!entityType) {
        return {
          success: false,
          errors: ['Entity type not specified']
        };
      }

      // Validate against ontology
      const validation = ontology.validateEntity(entity, entityType);
      
      if (!validation.valid) {
        this.lastError = validation.errors.join('; ');
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Process successful
      this.entitiesProcessed++;
      this.lastError = null;

      const processedEntity: MoonEntity = {
        '@id': entity['@id'] || `http://example.org/entity/${Date.now()}`,
        '@type': entityType,
        ...entity
      };

      console.log('[MoonEngine] ✅ Entity processed successfully');

      return {
        success: true,
        entity: processedEntity,
        warnings: []
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.lastError = errorMsg;
      console.error('[MoonEngine] ❌ Processing error:', errorMsg);
      
      return {
        success: false,
        errors: [errorMsg]
      };
    }
  }

  async processWork(workData: any): Promise<ProcessResult> {
    console.log('[MoonEngine] Processing Work entity');
    return this.process({
      '@type': 'bf:Work',
      ...workData
    });
  }

  async processInstance(instanceData: any): Promise<ProcessResult> {
    console.log('[MoonEngine] Processing Instance entity');
    return this.process({
      '@type': 'bf:Instance',
      ...instanceData
    });
  }

  async processBIBFRAME(data: any): Promise<ProcessResult> {
    console.log('[MoonEngine] Processing full BIBFRAME record');
    
    const results: ProcessResult[] = [];

    // Process Work
    if (data.work) {
      const workResult = await this.processWork(data.work);
      results.push(workResult);
    }

    // Process Instance
    if (data.instance) {
      const instanceResult = await this.processInstance(data.instance);
      results.push(instanceResult);
    }

    // Check if all processing succeeded
    const allSuccessful = results.every(r => r.success);
    const allErrors = results.flatMap(r => r.errors || []);

    if (allSuccessful) {
      return {
        success: true,
        entity: data,
        warnings: []
      };
    } else {
      return {
        success: false,
        errors: allErrors
      };
    }
  }

  getOntologyInfo(): OntologySchema | null {
    return ontology.getSchema();
  }

  getClassInfo(className: string) {
    return ontology.getClass(className);
  }

  getPropertyInfo(propertyName: string) {
    return ontology.getProperty(propertyName);
  }

  reset(): void {
    console.log('[MoonEngine] Resetting engine state');
    this.entitiesProcessed = 0;
    this.lastError = null;
  }
}

// Singleton instance
const engine = new MoonEngine();

export default engine;
export type { MoonEntity, ProcessResult, EngineStatus };
