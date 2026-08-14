/**
 * Canonical reasoning-effort levels and reasoning-dispatch wire formats —
 * the single source of truth for both plugin halves.
 *
 * Imported by the host contract (src/host/contract.js), the client model
 * logic (src/client/model.ts) and verified against the standalone dynamic
 * host body (src/host/dynamic.js) by scripts/check-dynamic.mjs, so the three
 * copies can never drift silently. Copied to shared/thinking.js (package
 * root) by build.mjs for the shipped package — lib/contract.js imports it
 * via '../shared/thinking.js', which resolves to that root directory.
 */

/** Reasoning effort levels accepted in a profile's reasoningEfforts map. */
export const THINKING_LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']

/** Reasoning-dispatch wire formats DSH (dsh-llm-pi-ai) accepts. */
export const THINKING_FORMATS = ['openai', 'deepseek', 'openrouter', 'together', 'zai', 'qwen', 'string-thinking', 'ant-ling']
