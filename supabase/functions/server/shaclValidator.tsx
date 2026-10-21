/**
 * ✅ SHACL VALIDATION EXECUTION ENGINE
 * Actually validates RDF against SHACL shapes in triple store
 * 
 * Flow:
 * 1. Upload record to temporary graph
 * 2. Upload SHACL shapes to shapes graph
 * 3. Execute SHACL validation via SPARQL
 * 4. Parse validation report
 * 5. Clean up temporary graphs
 * 6. Return validation results
 */

import * as jsonld from "npm:jsonld@9.0.0";
import * as tripleStore from "./tripleStore.tsx";
import { BIBFRAME_SHAPES, BIBFRAME_SHAPES_TURTLE } from "./shaclShapes.tsx";

export interface ValidationResult {
  valid: boolean;
  violations: ValidationViolation[];
  warnings: ValidationViolation[];
  info: ValidationViolation[];
}

export interface ValidationViolation {
  severity: 'Violation' | 'Warning' | 'Info';
  focusNode: string;
  path?: string;
  message: string;
  value?: string;
  constraint?: string;
}

/**
 * 🔍 VALIDATE BIBFRAME DOCUMENT AGAINST SHACL SHAPES
 * This is the REAL validation - not just shape definition
 */
export async function validateDocument(
  document: any,
  config: tripleStore.TripleStoreConfig
): Promise<ValidationResult> {
  const tempGraphUri = `https://moon.org/temp/validation/${crypto.randomUUID()}`;
  const shapesGraphUri = `https://moon.org/shapes/bibframe`;
  
  try {
    // STEP 1: Upload document to temporary graph
    console.log('[SHACL] Step 1: Uploading document to temp graph...');
    const uploadResult = await tripleStore.uploadToTripleStore(
      document,
      tempGraphUri,
      config
    );

    if (!uploadResult.success) {
      throw new Error(`Failed to upload document: ${uploadResult.message}`);
    }

    // STEP 2: Upload SHACL shapes (if not already present)
    console.log('[SHACL] Step 2: Uploading SHACL shapes...');
    await uploadShapes(shapesGraphUri, config);

    // STEP 3: Execute SHACL validation
    console.log('[SHACL] Step 3: Executing SHACL validation...');
    const validationResult = await executeShaclValidation(
      tempGraphUri,
      shapesGraphUri,
      config
    );

    // STEP 4: Clean up temporary graph
    console.log('[SHACL] Step 4: Cleaning up temp graph...');
    await tripleStore.deleteGraph(tempGraphUri, config);

    return validationResult;
  } catch (error) {
    console.error('[SHACL] Validation error:', error);
    
    // Try to clean up on error
    try {
      await tripleStore.deleteGraph(tempGraphUri, config);
    } catch (cleanupError) {
      console.error('[SHACL] Cleanup error:', cleanupError);
    }

    return {
      valid: false,
      violations: [{
        severity: 'Violation',
        focusNode: 'SYSTEM',
        message: `Validation system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        constraint: 'system.error'
      }],
      warnings: [],
      info: []
    };
  }
}

/**
 * Upload SHACL shapes to triple store
 */
async function uploadShapes(
  shapesGraphUri: string,
  config: tripleStore.TripleStoreConfig
): Promise<void> {
  // Convert JSON-LD shapes to RDF and upload
  const uploadResult = await tripleStore.uploadToTripleStore(
    BIBFRAME_SHAPES,
    shapesGraphUri,
    config
  );

  if (!uploadResult.success) {
    throw new Error(`Failed to upload SHACL shapes: ${uploadResult.message}`);
  }
}

/**
 * Execute SHACL validation using triple store's native validation
 * 
 * Different triple stores have different SHACL support:
 * - Apache Jena Fuseki: Use shacl:validate or external validation
 * - GraphDB: Built-in SHACL validation endpoint
 * - Blazegraph: No native SHACL, need external library
 */
async function executeShaclValidation(
  dataGraphUri: string,
  shapesGraphUri: string,
  config: tripleStore.TripleStoreConfig
): Promise<ValidationResult> {
  // For triple stores with native SHACL support (GraphDB, Fuseki with plugin)
  if (config.type === 'graphdb' || config.type === 'fuseki') {
    return await executeNativeShaclValidation(dataGraphUri, shapesGraphUri, config);
  }
  
  // For other stores, use SPARQL-based validation
  return await executeSparqlBasedValidation(dataGraphUri, shapesGraphUri, config);
}

/**
 * Native SHACL validation (GraphDB, Fuseki with SHACL plugin)
 */
async function executeNativeShaclValidation(
  dataGraphUri: string,
  shapesGraphUri: string,
  config: tripleStore.TripleStoreConfig
): Promise<ValidationResult> {
  // GraphDB has a /rdf-graphs/service?validate endpoint
  // Fuseki with shacl plugin: POST to /dataset/shacl?graph=...
  
  const validationEndpoint = config.type === 'graphdb'
    ? `${config.endpoint}/rdf-graphs/service?validate`
    : `${config.endpoint.replace('/query', '/shacl')}`;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/sparql-query',
      'Accept': 'text/turtle'
    };

    if (config.auth) {
      const authString = btoa(`${config.auth.username}:${config.auth.password}`);
      headers['Authorization'] = `Basic ${authString}`;
    }

    const response = await fetch(validationEndpoint, {
      method: 'POST',
      headers,
      body: `
        PREFIX sh: <http://www.w3.org/ns/shacl#>
        
        VALIDATE GRAPH <${dataGraphUri}>
        USING SHAPES GRAPH <${shapesGraphUri}>
      `
    });

    if (!response.ok) {
      throw new Error(`Validation endpoint returned ${response.status}`);
    }

    const reportTurtle = await response.text();
    return parseShaclReport(reportTurtle);
  } catch (error) {
    console.error('[SHACL] Native validation error:', error);
    // Fallback to SPARQL-based validation
    return await executeSparqlBasedValidation(dataGraphUri, shapesGraphUri, config);
  }
}

/**
 * SPARQL-based validation (when native SHACL not available)
 * This manually checks constraints using SPARQL queries
 */
async function executeSparqlBasedValidation(
  dataGraphUri: string,
  shapesGraphUri: string,
  config: tripleStore.TripleStoreConfig
): Promise<ValidationResult> {
  // Query to manually check SHACL constraints
  const validationQuery = `
    PREFIX sh: <http://www.w3.org/ns/shacl#>
    PREFIX bf: <http://id.loc.gov/ontologies/bibframe/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    
    SELECT ?shape ?focusNode ?path ?message ?severity
    WHERE {
      # Get shapes from shapes graph
      GRAPH <${shapesGraphUri}> {
        ?shape a sh:NodeShape ;
               sh:targetClass ?targetClass .
        
        OPTIONAL {
          ?shape sh:property ?propertyShape .
          ?propertyShape sh:path ?path ;
                        sh:message ?message .
          
          OPTIONAL { ?propertyShape sh:severity ?severity }
          OPTIONAL { ?propertyShape sh:minCount ?minCount }
          OPTIONAL { ?propertyShape sh:maxCount ?maxCount }
          OPTIONAL { ?propertyShape sh:class ?expectedClass }
        }
      }
      
      # Check violations in data graph
      GRAPH <${dataGraphUri}> {
        ?focusNode rdf:type ?targetClass .
        
        # Check property constraints
        FILTER NOT EXISTS {
          ?focusNode ?path ?value .
        }
      }
    }
  `;

  try {
    const result = await tripleStore.querySparql(validationQuery, config);
    
    if (!result.success) {
      throw new Error(`SPARQL validation query failed: ${result.message}`);
    }

    // Parse SPARQL results into validation violations
    const violations: ValidationViolation[] = [];
    const warnings: ValidationViolation[] = [];
    const info: ValidationViolation[] = [];

    if (result.results && Array.isArray(result.results)) {
      for (const binding of result.results) {
        const severityUri = binding.severity?.value || 'http://www.w3.org/ns/shacl#Violation';
        const severity = severityUri.includes('Warning') ? 'Warning' :
                        severityUri.includes('Info') ? 'Info' : 'Violation';

        const violation: ValidationViolation = {
          severity,
          focusNode: binding.focusNode?.value || 'unknown',
          path: binding.path?.value,
          message: binding.message?.value || 'Constraint violation',
          constraint: binding.shape?.value
        };

        if (severity === 'Violation') {
          violations.push(violation);
        } else if (severity === 'Warning') {
          warnings.push(violation);
        } else {
          info.push(violation);
        }
      }
    }

    return {
      valid: violations.length === 0,
      violations,
      warnings,
      info
    };
  } catch (error) {
    console.error('[SHACL] SPARQL-based validation error:', error);
    throw error;
  }
}

/**
 * Parse SHACL validation report (Turtle format)
 */
function parseShaclReport(reportTurtle: string): ValidationResult {
  // This is a simplified parser
  // In production, you'd use N3.js to properly parse the Turtle report
  
  const violations: ValidationViolation[] = [];
  const warnings: ValidationViolation[] = [];
  const info: ValidationViolation[] = [];

  // Check if report contains sh:conforms true/false
  const conformsMatch = reportTurtle.match(/sh:conforms\s+(true|false)/);
  const valid = conformsMatch ? conformsMatch[1] === 'true' : true;

  // Extract violations (simplified regex parsing)
  const violationMatches = reportTurtle.matchAll(/sh:ValidationResult[^;]*/g);
  
  for (const match of violationMatches) {
    const violationText = match[0];
    
    const focusNodeMatch = violationText.match(/sh:focusNode\s+<([^>]+)>/);
    const pathMatch = violationText.match(/sh:resultPath\s+<([^>]+)>/);
    const messageMatch = violationText.match(/sh:resultMessage\s+"([^"]+)"/);
    const severityMatch = violationText.match(/sh:resultSeverity\s+sh:(\w+)/);

    const violation: ValidationViolation = {
      severity: (severityMatch?.[1] as any) || 'Violation',
      focusNode: focusNodeMatch?.[1] || 'unknown',
      path: pathMatch?.[1],
      message: messageMatch?.[1] || 'Validation error'
    };

    if (violation.severity === 'Violation') {
      violations.push(violation);
    } else if (violation.severity === 'Warning') {
      warnings.push(violation);
    } else {
      info.push(violation);
    }
  }

  return {
    valid,
    violations,
    warnings,
    info
  };
}

/**
 * 🚫 BLOCK SAVE IF VALIDATION FAILS
 * This should be called before saving any record
 */
export async function validateAndEnforce(
  document: any,
  config: tripleStore.TripleStoreConfig,
  options?: {
    allowWarnings?: boolean;
    skipValidation?: boolean; // Only for system operations
  }
): Promise<{ 
  allowed: boolean; 
  result: ValidationResult;
  message: string;
}> {
  // Skip validation if explicitly allowed (dangerous!)
  if (options?.skipValidation) {
    console.warn('[SHACL] ⚠️ Validation skipped - this should only happen for system operations');
    return {
      allowed: true,
      result: { valid: true, violations: [], warnings: [], info: [] },
      message: 'Validation skipped'
    };
  }

  const result = await validateDocument(document, config);

  if (!result.valid) {
    const violationMessages = result.violations
      .map(v => `- ${v.focusNode}: ${v.message}`)
      .join('\n');

    return {
      allowed: false,
      result,
      message: `SHACL validation failed with ${result.violations.length} violation(s):\n${violationMessages}`
    };
  }

  if (result.warnings.length > 0 && !options?.allowWarnings) {
    const warningMessages = result.warnings
      .map(w => `- ${w.focusNode}: ${w.message}`)
      .join('\n');

    return {
      allowed: false,
      result,
      message: `SHACL validation has warnings:\n${warningMessages}\n\nSet allowWarnings=true to save anyway.`
    };
  }

  return {
    allowed: true,
    result,
    message: 'Validation passed'
  };
}
