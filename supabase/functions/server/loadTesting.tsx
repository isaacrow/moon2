/**
 * 🧪 LOAD TESTING UTILITIES
 * Generate test data and measure performance
 */

import * as dataIsolation from "./dataIsolation.tsx";
import * as observability from "./observability.tsx";

/**
 * Generate bulk test records
 */
export async function generateTestRecords(
  institutionId: string,
  userId: string,
  count: number
): Promise<{
  generated: number;
  duration: number;
  recordIds: string[];
}> {
  const startTime = Date.now();
  const recordIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const id = `test-work-${Date.now()}-${i}`;
    
    const document = {
      "@context": {
        "bf": "http://id.loc.gov/ontologies/bibframe/",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      },
      "@graph": [
        {
          "@id": `https://moon.org/work/${id}`,
          "@type": "bf:Work",
          "bf:title": {
            "@type": "bf:Title",
            "bf:mainTitle": `Test Work ${i + 1}`
          },
          "bf:subject": {
            "@id": `https://moon.org/topic/test-topic-${i % 10}`,
            "@type": "bf:Topic",
            "rdfs:label": `Test Topic ${i % 10}`
          }
        }
      ]
    };

    try {
      await dataIsolation.saveRecord(id, institutionId, document, userId);
      recordIds.push(id);
    } catch (error) {
      console.error(`Failed to generate test record ${i}:`, error);
    }
  }

  const duration = Date.now() - startTime;

  await observability.logPerformanceMetric({
    operation: 'test.bulk_generate',
    duration,
    recordCount: recordIds.length,
    success: recordIds.length === count,
    metadata: { requested: count, generated: recordIds.length }
  });

  return {
    generated: recordIds.length,
    duration,
    recordIds
  };
}

/**
 * Benchmark list operation
 */
export async function benchmarkListOperation(
  institutionId: string,
  limit?: number
): Promise<{
  duration: number;
  recordCount: number;
  throughput: number;
}> {
  const startTime = Date.now();
  
  const records = await dataIsolation.listRecords(institutionId, { limit });
  
  const duration = Date.now() - startTime;
  const throughput = records.length / (duration / 1000); // records per second

  await observability.logPerformanceMetric({
    operation: 'benchmark.list',
    duration,
    recordCount: records.length,
    success: true,
    metadata: { limit, throughput }
  });

  return {
    duration,
    recordCount: records.length,
    throughput
  };
}

/**
 * Benchmark search operation
 */
export async function benchmarkSearchOperation(
  institutionId: string,
  query: string
): Promise<{
  duration: number;
  resultCount: number;
  throughput: number;
}> {
  const startTime = Date.now();
  
  const results = await dataIsolation.searchRecords(institutionId, query);
  
  const duration = Date.now() - startTime;
  const throughput = results.length / (duration / 1000);

  await observability.logPerformanceMetric({
    operation: 'benchmark.search',
    duration,
    recordCount: results.length,
    success: true,
    metadata: { query, throughput }
  });

  return {
    duration,
    resultCount: results.length,
    throughput
  };
}

/**
 * Stress test: Concurrent operations
 */
export async function stressTestConcurrentReads(
  institutionId: string,
  concurrency: number,
  recordId: string
): Promise<{
  totalRequests: number;
  successful: number;
  failed: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
}> {
  const promises = [];
  const durations: number[] = [];
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < concurrency; i++) {
    const promise = (async () => {
      const start = Date.now();
      try {
        await dataIsolation.getRecord(recordId, institutionId);
        const duration = Date.now() - start;
        durations.push(duration);
        successful++;
      } catch (error) {
        failed++;
      }
    })();
    
    promises.push(promise);
  }

  await Promise.all(promises);

  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;

  return {
    totalRequests: concurrency,
    successful,
    failed,
    avgDuration,
    maxDuration: Math.max(...durations),
    minDuration: Math.min(...durations)
  };
}

/**
 * Clean up test data
 */
export async function cleanupTestRecords(
  institutionId: string,
  recordIds: string[]
): Promise<{
  deleted: number;
  failed: number;
  duration: number;
}> {
  const startTime = Date.now();
  let deleted = 0;
  let failed = 0;

  for (const id of recordIds) {
    try {
      const success = await dataIsolation.deleteRecord(id, institutionId);
      if (success) {
        deleted++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
      console.error(`Failed to delete test record ${id}:`, error);
    }
  }

  const duration = Date.now() - startTime;

  return { deleted, failed, duration };
}
