/**
 * 🌐 Record API Routes
 * REST API for record lifecycle management
 */

import { Hono } from 'npm:hono@4';
import * as recordService from './recordService.tsx';
import { toTurtle, toRdfXml } from './rdfExporter.tsx';

const recordRoutes = new Hono();

/**
 * POST /make-server-49c0e13c/api/records
 * Create new record
 */
recordRoutes.post('/api/records', async (c) => {
  try {
    const body = await c.req.json();
    const { graphJson, title, resourceType, userId } = body;

    if (!graphJson) {
      return c.json({ error: 'graphJson is required' }, 400);
    }

    if (!title) {
      return c.json({ error: 'title is required' }, 400);
    }

    // Add admin metadata
    const enrichedGraph = addAdminMetadata(graphJson, userId);

    const record = await recordService.createRecord(
      enrichedGraph,
      title,
      resourceType || 'Work',
      userId
    );

    return c.json({
      success: true,
      record
    });
  } catch (error: any) {
    console.log('Error creating record:', error);
    return c.json({ error: error.message || 'Failed to create record' }, 500);
  }
});

/**
 * GET /make-server-49c0e13c/api/records/:id
 * Get record by ID (internal - includes drafts)
 */
recordRoutes.get('/api/records/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const record = await recordService.getRecord(id);

    if (!record) {
      return c.json({ error: 'Record not found' }, 404);
    }

    return c.json({
      success: true,
      record
    });
  } catch (error: any) {
    console.log('Error fetching record:', error);
    return c.json({ error: error.message || 'Failed to fetch record' }, 500);
  }
});

/**
 * GET /make-server-49c0e13c/api/records/:id/public
 * Get published record for public access (OPAC, discovery)
 * ✅ PRODUCTION-SAFE: Only returns published versions
 */
recordRoutes.get('/api/records/:id/public', async (c) => {
  try {
    const id = c.req.param('id');
    const publicRecord = await recordService.getPublicRecord(id);

    if (!publicRecord) {
      return c.json({ 
        error: 'Record not found or not published' 
      }, 404);
    }

    return c.json({
      success: true,
      record: publicRecord
    });
  } catch (error: any) {
    console.log('Error fetching public record:', error);
    return c.json({ error: error.message || 'Failed to fetch public record' }, 500);
  }
});

/**
 * PUT /make-server-49c0e13c/api/records/:id
 * Update record
 */
recordRoutes.put('/api/records/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { graphJson, title, userId } = body;

    if (!graphJson) {
      return c.json({ error: 'graphJson is required' }, 400);
    }

    // Update admin metadata
    const enrichedGraph = updateAdminMetadata(graphJson, userId);

    const record = await recordService.updateRecord(id, enrichedGraph, title, userId);

    return c.json({
      success: true,
      record
    });
  } catch (error: any) {
    console.log('Error updating record:', error);
    
    // ✅ HARDENED: Return 403 Forbidden for locked records
    if (error.message && error.message.includes('is locked')) {
      return c.json({ 
        error: error.message,
        code: 'RECORD_LOCKED'
      }, 403);
    }
    
    // ✅ HARDENED: Return 409 Conflict for validation errors on publish
    if (error.message && error.message.includes('validation')) {
      return c.json({ 
        error: error.message,
        code: 'VALIDATION_REQUIRED'
      }, 409);
    }
    
    // ✅ HARDENED: Return 500 for data corruption
    if (error.message && error.message.includes('corruption')) {
      return c.json({ 
        error: error.message,
        code: 'DATA_CORRUPTION'
      }, 500);
    }
    
    return c.json({ error: error.message || 'Failed to update record' }, 500);
  }
});

/**
 * DELETE /make-server-49c0e13c/api/records/:id
 * Soft delete record
 */
recordRoutes.delete('/api/records/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.req.header('X-User-Id');

    await recordService.deleteRecord(id, userId);

    return c.json({
      success: true,
      message: 'Record archived'
    });
  } catch (error: any) {
    console.log('Error deleting record:', error);
    return c.json({ error: error.message || 'Failed to delete record' }, 500);
  }
});

/**
 * GET /make-server-49c0e13c/api/records
 * List records with filtering
 */
recordRoutes.get('/api/records', async (c) => {
  try {
    const status = c.req.query('status') as any;
    const resourceType = c.req.query('resourceType');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const records = await recordService.listRecords({
      status,
      resourceType,
      limit,
      offset
    });

    return c.json({
      success: true,
      records,
      count: records.length
    });
  } catch (error: any) {
    console.log('Error listing records:', error);
    return c.json({ error: error.message || 'Failed to list records' }, 500);
  }
});

/**
 * POST /make-server-49c0e13c/api/records/:id/version
 * Create new version snapshot
 */
recordRoutes.post('/api/records/:id/version', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { comment, userId } = body;

    const record = await recordService.getRecord(id);
    if (!record) {
      return c.json({ error: 'Record not found' }, 404);
    }

    const version = await recordService.createVersion(
      id,
      record.graphJson,
      userId,
      comment
    );

    return c.json({
      success: true,
      version
    });
  } catch (error: any) {
    console.log('Error creating version:', error);
    return c.json({ error: error.message || 'Failed to create version' }, 500);
  }
});

/**
 * GET /make-server-49c0e13c/api/records/:id/versions
 * List all versions
 */
recordRoutes.get('/api/records/:id/versions', async (c) => {
  try {
    const id = c.req.param('id');
    const versions = await recordService.listVersions(id);

    return c.json({
      success: true,
      versions,
      count: versions.length
    });
  } catch (error: any) {
    console.log('Error listing versions:', error);
    return c.json({ error: error.message || 'Failed to list versions' }, 500);
  }
});

/**
 * GET /make-server-49c0e13c/api/records/:id/versions/:versionNumber
 * Get specific version
 */
recordRoutes.get('/api/records/:id/versions/:versionNumber', async (c) => {
  try {
    const id = c.req.param('id');
    const versionNumber = parseInt(c.req.param('versionNumber'));

    const version = await recordService.getVersion(id, versionNumber);

    if (!version) {
      return c.json({ error: 'Version not found' }, 404);
    }

    return c.json({
      success: true,
      version
    });
  } catch (error: any) {
    console.log('Error fetching version:', error);
    return c.json({ error: error.message || 'Failed to fetch version' }, 500);
  }
});

/**
 * POST /make-server-49c0e13c/api/records/:id/publish
 * Publish record
 */
recordRoutes.post('/api/records/:id/publish', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { userId } = body;

    const record = await recordService.getRecord(id);
    if (!record) {
      return c.json({ error: 'Record not found' }, 404);
    }

    // Validate before publishing
    const validation = recordService.validateForPublishing(record.graphJson);
    if (!validation.valid) {
      return c.json({ 
        error: 'Validation failed', 
        errors: validation.errors 
      }, 400);
    }

    const published = await recordService.publishRecord(id, userId);

    return c.json({
      success: true,
      record: published
    });
  } catch (error: any) {
    console.log('Error publishing record:', error);
    
    // ✅ HARDENED: Return 409 Conflict for validation errors
    if (error.message && error.message.includes('validation')) {
      return c.json({ 
        error: error.message,
        code: 'VALIDATION_REQUIRED'
      }, 409);
    }
    
    // ✅ HARDENED: Return 409 Conflict for modified after validation
    if (error.message && error.message.includes('modified since')) {
      return c.json({ 
        error: error.message,
        code: 'REVALIDATION_REQUIRED'
      }, 409);
    }
    
    return c.json({ error: error.message || 'Failed to publish record' }, 500);
  }
});

/**
 * POST /make-server-49c0e13c/api/records/:id/archive
 * Archive record
 */
recordRoutes.post('/api/records/:id/archive', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { userId } = body;

    const archived = await recordService.archiveRecord(id, userId);

    return c.json({
      success: true,
      record: archived
    });
  } catch (error: any) {
    console.log('Error archiving record:', error);
    return c.json({ error: error.message || 'Failed to archive record' }, 500);
  }
});

/**
 * GET /make-server-49c0e13c/api/records/:id/export
 * Export record in various RDF formats
 */
recordRoutes.get('/api/records/:id/export', async (c) => {
  try {
    const id = c.req.param('id');
    const format = c.req.query('format') || 'jsonld';

    const record = await recordService.getRecord(id);
    if (!record) {
      return c.json({ error: 'Record not found' }, 404);
    }

    const graphJson = record.graphJson;

    if (format === 'jsonld') {
      return c.json(graphJson);
    } else if (format === 'turtle') {
      const turtle = toTurtle(graphJson);
      return new Response(turtle, {
        headers: {
          'Content-Type': 'text/turtle',
          'Content-Disposition': `attachment; filename="${id}.ttl"`
        }
      });
    } else if (format === 'rdfxml') {
      const rdfxml = toRdfXml(graphJson);
      return new Response(rdfxml, {
        headers: {
          'Content-Type': 'application/rdf+xml',
          'Content-Disposition': `attachment; filename="${id}.rdf"`
        }
      });
    } else {
      return c.json({ error: 'Unsupported format. Use: jsonld, turtle, rdfxml' }, 400);
    }
  } catch (error: any) {
    console.log('Error exporting record:', error);
    return c.json({ error: error.message || 'Failed to export record' }, 500);
  }
});

/**
 * GET /make-server-49c0e13c/api/records/search
 * Search records by title
 */
recordRoutes.get('/api/records/search', async (c) => {
  try {
    const q = c.req.query('q');
    
    if (!q) {
      return c.json({ error: 'Query parameter "q" is required' }, 400);
    }

    const results = await recordService.searchRecords(q);

    return c.json({
      success: true,
      results,
      count: results.length
    });
  } catch (error: any) {
    console.log('Error searching records:', error);
    return c.json({ error: error.message || 'Failed to search records' }, 500);
  }
});

/**
 * Helper: Add administrative metadata to graph
 */
function addAdminMetadata(graphJson: any, userId?: string): any {
  const now = new Date().toISOString();
  
  // Clone graph
  const enriched = JSON.parse(JSON.stringify(graphJson));
  
  // Add admin metadata to each entity
  if (enriched['@graph']) {
    enriched['@graph'].forEach((node: any) => {
      if (node['@type'] === 'bf:Work' || node['@type'] === 'bf:Instance' || node['@type'] === 'bf:Item') {
        node['bf:adminMetadata'] = {
          '@type': 'bf:AdminMetadata',
          'bf:creationDate': { '@value': now, '@type': 'xsd:dateTime' },
          'bf:changeDate': { '@value': now, '@type': 'xsd:dateTime' },
          'bf:source': { '@id': 'http://moon.library/system' },
          'bf:descriptionConventions': { '@id': 'http://id.loc.gov/vocabulary/descriptionConventions/rda' }
        };
        
        if (userId) {
          node['bf:adminMetadata']['bf:createdBy'] = { '@value': userId };
        }
      }
    });
  }
  
  return enriched;
}

/**
 * Helper: Update administrative metadata
 */
function updateAdminMetadata(graphJson: any, userId?: string): any {
  const now = new Date().toISOString();
  
  // Clone graph
  const enriched = JSON.parse(JSON.stringify(graphJson));
  
  // Update admin metadata
  if (enriched['@graph']) {
    enriched['@graph'].forEach((node: any) => {
      if (node['bf:adminMetadata']) {
        node['bf:adminMetadata']['bf:changeDate'] = { '@value': now, '@type': 'xsd:dateTime' };
        
        if (userId) {
          node['bf:adminMetadata']['bf:modifiedBy'] = { '@value': userId };
        }
      }
    });
  }
  
  return enriched;
}

/**
 * GET /make-server-49c0e13c/api/records/:id/marc
 * Export record as MARC 21
 * ✅ PRODUCTION-SAFE: Uses mapping registry
 */
recordRoutes.get('/api/records/:id/marc', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.req.header('X-User-Id');

    const record = await recordService.getRecord(id);
    if (!record) {
      return c.json({ error: 'Record not found' }, 404);
    }

    // Convert to MARC using registry
    const { convertToMARC, formatMARCAsText } = await import('./marcConverter.tsx');
    const marcRecord = convertToMARC(record.graphJson);
    const marcText = formatMARCAsText(marcRecord);

    // Log export
    const auditLog = await import('./auditLog.tsx');
    await auditLog.logExport(id, 'marc', userId, c.req);

    return new Response(marcText, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename=\"${id}.mrc\"`,
        'X-Export-Timestamp': new Date().toISOString(),
        'X-Record-Checksum': record.checksum
      }
    });
  } catch (error: any) {
    console.log('Error exporting MARC:', error);
    return c.json({ error: error.message || 'Failed to export MARC' }, 500);
  }
});

/**
 * GET /make-server-49c0e13c/api/records/:id/mindmap
 * Generate mind map from RDF triples
 * ✅ PRODUCTION-SAFE: Generated from graph structure, not UI objects
 */
recordRoutes.get('/api/records/:id/mindmap', async (c) => {
  try {
    const id = c.req.param('id');
    const format = c.req.query('format') || 'json'; // json or svg

    const record = await recordService.getRecord(id);
    if (!record) {
      return c.json({ error: 'Record not found' }, 404);
    }

    // Generate mind map from graph
    const { generateMindMapFromGraph, generateMindMapSVG } = await import('./mindMapGenerator.tsx');
    const mindMapData = generateMindMapFromGraph(record.graphJson);

    if (format === 'svg') {
      const svg = generateMindMapSVG(mindMapData);
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `inline; filename=\"${id}-mindmap.svg\"`
        }
      });
    }

    return c.json({
      success: true,
      mindMap: mindMapData
    });
  } catch (error: any) {
    console.log('Error generating mind map:', error);
    return c.json({ error: error.message || 'Failed to generate mind map' }, 500);
  }
});

/**
 * GET /make-server-49c0e13c/api/records/:id/audit
 * Get audit history for a record
 * ✅ NEW: Full lifecycle tracking
 */
recordRoutes.get('/api/records/:id/audit', async (c) => {
  try {
    const id = c.req.param('id');
    const history = await recordService.getRecordAuditHistory(id);

    return c.json({
      success: true,
      history,
      count: history.length
    });
  } catch (error: any) {
    console.log('Error fetching audit history:', error);
    return c.json({ error: error.message || 'Failed to fetch audit history' }, 500);
  }
});

/**
 * GET /make-server-49c0e13c/api/records/:id/validation-history
 * Get validation history for a record
 * ✅ NEW: Validation tracking per version
 */
recordRoutes.get('/api/records/:id/validation-history', async (c) => {
  try {
    const id = c.req.param('id');
    const history = await recordService.getValidationHistory(id);

    return c.json({
      success: true,
      history,
      count: history.length
    });
  } catch (error: any) {
    console.log('Error fetching validation history:', error);
    return c.json({ error: error.message || 'Failed to fetch validation history' }, 500);
  }
});

export default recordRoutes;
