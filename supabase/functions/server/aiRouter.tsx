/**
 * MOON DIJLA - Production-Grade Multi-AI Orchestration Engine
 * 
 * Smart routing with:
 *   - Class-based provider adapters (OpenAI, Gemini, LLaMA)
 *   - Automatic fallback chain per task type
 *   - Circuit breaker (5 consecutive failures = 5 min cooldown)
 *   - Health monitoring (latency, success rate, error count)
 *   - Full routing audit log (KV-persisted)
 *   - AI governance metadata on every response
 *   - Discovery enhancement integration
 * 
 * AI is assistive, never authoritative. The cataloger is always final authority.
 */

import * as db from "./db.tsx";
const kv = { set: db.kvSet, get: db.kvGet, del: db.kvDel, getByPrefix: db.kvGetByPrefix };
import {
  AIProviderBase,
  providerRegistry,
  getProvider,
  getAvailableProviders,
  type MetadataResult,
  type EntityLinkResult,
  type SPARQLResult,
  type DuplicateResult,
  type AutoFillResult,
  type DiscoveryEnhancement,
} from "./aiProviders.tsx";

// ─── Types ───────────────────────────────────────────────────────

export type AIProviderName = "openai" | "gemini" | "llama";
export type AITaskType = "metadata" | "entity-linking" | "duplicate-detection" | "natural-search" | "sparql-translate" | "autofill" | "discovery-enhance";

export interface RoutingDecision {
  id: string;
  taskType: AITaskType;
  selectedProvider: AIProviderName;
  fallbackChain: AIProviderName[];
  fallbackUsed: boolean;
  attemptedProviders: string[];
  timestamp: string;
  latencyMs: number;
  success: boolean;
  error?: string;
  retryCount: number;
}

export interface ProviderHealthStatus {
  provider: AIProviderName;
  available: boolean;
  model: string;
  circuitBreakerOpen: boolean;
  circuitBreakerResetAt?: string;
  lastCallTimestamp: string;
  lastCallSuccess: boolean;
  avgLatencyMs: number;
  totalCalls: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  consecutiveErrors: number;
}

export interface RouterConfig {
  routing: Record<AITaskType, AIProviderName[]>;
  circuitBreaker: {
    threshold: number;     // consecutive failures before open
    cooldownMs: number;    // cooldown duration in ms
  };
  timeoutMs: number;
}

// ─── Default Configuration ───────────────────────────────────────

const DEFAULT_CONFIG: RouterConfig = {
  routing: {
    "metadata":            ["openai", "gemini", "llama"],
    "entity-linking":      ["gemini", "openai", "llama"],
    "duplicate-detection": ["llama", "openai", "gemini"],
    "natural-search":      ["openai", "gemini"],
    "sparql-translate":    ["openai", "gemini"],
    "autofill":            ["openai", "gemini", "llama"],
    "discovery-enhance":   ["openai", "gemini", "llama"],
  },
  circuitBreaker: {
    threshold: 5,
    cooldownMs: 5 * 60 * 1000, // 5 minutes
  },
  timeoutMs: 30000,
};

let activeConfig: RouterConfig = { ...DEFAULT_CONFIG };

// ─── Circuit Breaker State ───────────────────────────────────────

interface CircuitState {
  totalCalls: number;
  successCount: number;
  errorCount: number;
  totalLatencyMs: number;
  lastCallTimestamp: string;
  lastCallSuccess: boolean;
  consecutiveErrors: number;
  circuitOpenSince: number | null; // timestamp when circuit opened
}

const circuitStates: Record<AIProviderName, CircuitState> = {
  openai: { totalCalls: 0, successCount: 0, errorCount: 0, totalLatencyMs: 0, lastCallTimestamp: "", lastCallSuccess: true, consecutiveErrors: 0, circuitOpenSince: null },
  gemini: { totalCalls: 0, successCount: 0, errorCount: 0, totalLatencyMs: 0, lastCallTimestamp: "", lastCallSuccess: true, consecutiveErrors: 0, circuitOpenSince: null },
  llama:  { totalCalls: 0, successCount: 0, errorCount: 0, totalLatencyMs: 0, lastCallTimestamp: "", lastCallSuccess: true, consecutiveErrors: 0, circuitOpenSince: null },
};

function isCircuitOpen(provider: AIProviderName): boolean {
  const state = circuitStates[provider];
  if (!state.circuitOpenSince) return false;

  const elapsed = Date.now() - state.circuitOpenSince;
  if (elapsed >= activeConfig.circuitBreaker.cooldownMs) {
    // Cooldown expired, half-open (allow retry)
    console.log(`[CIRCUIT] ${provider} cooldown expired (${Math.round(elapsed / 1000)}s), resetting to half-open`);
    state.circuitOpenSince = null;
    state.consecutiveErrors = 0;
    return false;
  }

  return true;
}

function recordSuccess(provider: AIProviderName, latencyMs: number): void {
  const s = circuitStates[provider];
  s.totalCalls++;
  s.successCount++;
  s.totalLatencyMs += latencyMs;
  s.lastCallTimestamp = new Date().toISOString();
  s.lastCallSuccess = true;
  s.consecutiveErrors = 0;
  s.circuitOpenSince = null; // close circuit on success
}

function recordFailure(provider: AIProviderName, latencyMs: number): void {
  const s = circuitStates[provider];
  s.totalCalls++;
  s.errorCount++;
  s.totalLatencyMs += latencyMs;
  s.lastCallTimestamp = new Date().toISOString();
  s.lastCallSuccess = false;
  s.consecutiveErrors++;

  if (s.consecutiveErrors >= activeConfig.circuitBreaker.threshold && !s.circuitOpenSince) {
    s.circuitOpenSince = Date.now();
    console.log(`[CIRCUIT] ${provider} OPENED after ${s.consecutiveErrors} consecutive failures. Cooldown: ${activeConfig.circuitBreaker.cooldownMs / 1000}s`);
  }
}

// ─── Routing Log ─────────────────────────────────────────────────

async function logRoutingDecision(decision: RoutingDecision): Promise<void> {
  try {
    await kv.set(`ai:routing:${decision.id}`, JSON.stringify(decision));
  } catch (err) {
    console.error("[ROUTER] Failed to log routing decision:", err);
  }
}

export async function getRoutingLog(limit = 50): Promise<RoutingDecision[]> {
  try {
    const entries = await kv.getByPrefix("ai:routing:");
    return entries
      .map((e: string) => { try { return JSON.parse(e); } catch { return null; } })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch {
    return [];
  }
}

// ─── Core Router ─────────────────────────────────────────────────

type TaskExecutor<T> = (provider: AIProviderBase) => Promise<T>;

async function routeTask<T>(
  taskType: AITaskType,
  executor: TaskExecutor<T>,
): Promise<{ result: T; provider: AIProviderName; latencyMs: number; decision: RoutingDecision }> {
  const fallbackChain = activeConfig.routing[taskType] || ["openai"];
  const attemptedProviders: string[] = [];
  let lastError: Error | null = null;
  let retryCount = 0;

  for (const providerName of fallbackChain) {
    // Check if provider adapter exists and has API key
    const adapter = getProvider(providerName);
    if (!adapter || !adapter.isAvailable()) {
      console.log(`[ROUTER] Skipping ${providerName} - not available`);
      attemptedProviders.push(`${providerName}:unavailable`);
      continue;
    }

    // Check circuit breaker
    if (isCircuitOpen(providerName as AIProviderName)) {
      const state = circuitStates[providerName as AIProviderName];
      const remaining = state.circuitOpenSince
        ? Math.round((activeConfig.circuitBreaker.cooldownMs - (Date.now() - state.circuitOpenSince)) / 1000)
        : 0;
      console.log(`[ROUTER] Skipping ${providerName} - circuit OPEN (${remaining}s remaining)`);
      attemptedProviders.push(`${providerName}:circuit-open`);
      continue;
    }

    const start = Date.now();
    try {
      console.log(`[ROUTER] ${taskType} -> ${providerName} (attempt ${retryCount + 1})`);
      const result = await executor(adapter);
      const latencyMs = Date.now() - start;

      recordSuccess(providerName as AIProviderName, latencyMs);
      attemptedProviders.push(`${providerName}:success`);

      const decision: RoutingDecision = {
        id: `route-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        taskType,
        selectedProvider: providerName as AIProviderName,
        fallbackChain: fallbackChain as AIProviderName[],
        fallbackUsed: retryCount > 0,
        attemptedProviders,
        timestamp: new Date().toISOString(),
        latencyMs,
        success: true,
        retryCount,
      };

      await logRoutingDecision(decision);
      console.log(`[ROUTER] ${taskType} -> ${providerName} SUCCESS in ${latencyMs}ms${retryCount > 0 ? ` (after ${retryCount} fallback(s))` : ""}`);

      return { result, provider: providerName as AIProviderName, latencyMs, decision };
    } catch (error: any) {
      const latencyMs = Date.now() - start;
      lastError = error;
      retryCount++;
      recordFailure(providerName as AIProviderName, latencyMs);
      attemptedProviders.push(`${providerName}:failed`);
      console.log(`[ROUTER] ${taskType} -> ${providerName} FAILED (${latencyMs}ms): ${error.message}`);
    }
  }

  // All providers failed
  const decision: RoutingDecision = {
    id: `route-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    taskType,
    selectedProvider: fallbackChain[0] as AIProviderName,
    fallbackChain: fallbackChain as AIProviderName[],
    fallbackUsed: retryCount > 0,
    attemptedProviders,
    timestamp: new Date().toISOString(),
    latencyMs: 0,
    success: false,
    error: lastError?.message || "All providers failed",
    retryCount,
  };

  await logRoutingDecision(decision);
  throw new Error(`All AI providers failed for ${taskType}. Attempted: [${attemptedProviders.join(", ")}]. Last error: ${lastError?.message}`);
}

// ─── Governance Wrapper ──────────────────────────────────────────
// Every AI response includes governance metadata

function wrapWithGovernance<T>(result: T, provider: AIProviderName, latencyMs: number, taskType: AITaskType): T & { _governance: any } {
  return {
    ...result,
    _governance: {
      provider,
      model: providerRegistry[provider]?.model || "unknown",
      confidence: "see individual field scores",
      timestamp: new Date().toISOString(),
      latencyMs,
      taskType,
      disclaimer: "AI suggestions only. Cataloger is final authority. Never auto-applied to records.",
    },
    _routedVia: provider,
    _latencyMs: latencyMs,
  };
}

// ═══════════════════════════════════════════════════════════
// PUBLIC API - Routed Task Functions
// ═══════════════════════════════════════════════���═══════════

export async function routedSuggestMetadata(input: {
  title?: string; author?: string; isbn?: string; publisher?: string; abstract?: string;
}): Promise<MetadataResult & { _governance: any }> {
  const { result, provider, latencyMs } = await routeTask(
    "metadata",
    (adapter) => adapter.suggestMetadata(input),
  );
  return wrapWithGovernance(result, provider, latencyMs, "metadata");
}

export async function routedEntityLinking(input: {
  entityName: string; entityType: string; context?: string;
}): Promise<EntityLinkResult & { _governance: any }> {
  const { result, provider, latencyMs } = await routeTask(
    "entity-linking",
    (adapter) => adapter.entityLink(input),
  );
  return wrapWithGovernance(result, provider, latencyMs, "entity-linking");
}

export async function routedSPARQLTranslate(query: string): Promise<SPARQLResult & { _governance: any }> {
  const { result, provider, latencyMs } = await routeTask(
    "sparql-translate",
    (adapter) => adapter.translateToSPARQL(query),
  );
  return wrapWithGovernance(result, provider, latencyMs, "sparql-translate");
}

export async function routedDuplicateDetection(input: {
  title: string; author?: string; isbn?: string; existingRecords: any[];
}): Promise<DuplicateResult & { _governance: any }> {
  const { result, provider, latencyMs } = await routeTask(
    "duplicate-detection",
    (adapter) => adapter.detectDuplicates(input),
  );
  return wrapWithGovernance(result, provider, latencyMs, "duplicate-detection");
}

export async function routedNaturalSearch(query: string): Promise<any> {
  const { result, provider, latencyMs } = await routeTask(
    "natural-search",
    (adapter) => adapter.naturalSearch(query),
  );
  return wrapWithGovernance(result, provider, latencyMs, "natural-search");
}

export async function routedAutoFill(input: {
  title?: string; author?: string; isbn?: string;
}): Promise<AutoFillResult & { _governance: any }> {
  const { result, provider, latencyMs } = await routeTask(
    "autofill",
    (adapter) => adapter.autoFill(input),
  );
  return wrapWithGovernance(result, provider, latencyMs, "autofill");
}

export async function routedDiscoveryEnhance(query: string): Promise<DiscoveryEnhancement & { _governance: any }> {
  const { result, provider, latencyMs } = await routeTask(
    "discovery-enhance",
    (adapter) => adapter.enhanceDiscovery(query),
  );
  return wrapWithGovernance(result, provider, latencyMs, "discovery-enhance");
}

// ═══════════════════════════════════════════════════════════
// PROVIDER STATUS & CONFIG
// ═══════════════════════════════════════════════════════════

export function getProviderStatus(): ProviderHealthStatus[] {
  return (["openai", "gemini", "llama"] as AIProviderName[]).map(name => {
    const adapter = providerRegistry[name];
    const state = circuitStates[name];
    const circuitOpen = isCircuitOpen(name);

    return {
      provider: name,
      available: adapter?.isAvailable() ?? false,
      model: adapter?.model || "unknown",
      circuitBreakerOpen: circuitOpen,
      circuitBreakerResetAt: state.circuitOpenSince
        ? new Date(state.circuitOpenSince + activeConfig.circuitBreaker.cooldownMs).toISOString()
        : undefined,
      lastCallTimestamp: state.lastCallTimestamp,
      lastCallSuccess: state.lastCallSuccess,
      avgLatencyMs: state.totalCalls > 0 ? Math.round(state.totalLatencyMs / state.totalCalls) : 0,
      totalCalls: state.totalCalls,
      successCount: state.successCount,
      errorCount: state.errorCount,
      successRate: state.totalCalls > 0 ? Math.round((state.successCount / state.totalCalls) * 100) : 100,
      consecutiveErrors: state.consecutiveErrors,
    };
  });
}

export function getRouterConfig(): RouterConfig {
  return { ...activeConfig };
}

export function updateRouterConfig(updates: Partial<RouterConfig>): RouterConfig {
  if (updates.routing) {
    activeConfig.routing = { ...activeConfig.routing, ...updates.routing };
  }
  if (updates.circuitBreaker) {
    activeConfig.circuitBreaker = { ...activeConfig.circuitBreaker, ...updates.circuitBreaker };
  }
  if (updates.timeoutMs) {
    activeConfig.timeoutMs = updates.timeoutMs;
  }
  console.log("[ROUTER] Configuration updated");
  return { ...activeConfig };
}

// Reset circuit breaker for a specific provider (manual override)
export function resetCircuitBreaker(provider: AIProviderName): void {
  const state = circuitStates[provider];
  state.consecutiveErrors = 0;
  state.circuitOpenSince = null;
  console.log(`[CIRCUIT] ${provider} manually reset`);
}
