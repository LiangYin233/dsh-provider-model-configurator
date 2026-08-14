/**
 * Model entry business logic, shared by every client mount (static bundle and
 * dynamic plugin). Pure data transformations — no React, no DOM, no host RPC.
 */

import { THINKING_LEVELS as LEVELS, THINKING_FORMATS as FORMATS } from '../shared/thinking.js'

/** Canonical reasoning effort levels (wire names), from the shared source. */
export const THINKING_LEVELS: readonly string[] = LEVELS

/** Reasoning-dispatch wire formats DSH (dsh-llm-pi-ai) accepts. */
export const THINKING_FORMATS: readonly string[] = FORMATS

/**
 * Build one profile model entry object from the form state.
 * `reasoningMode: 'unset'` and `inputUnset: true` mean "no field written" —
 * the entry keeps (or inherits) the catalog value instead of an explicit one.
 */
export function buildEntry(form: any): any {
  const e: any = { id: form.id.trim() }
  if (form.name && form.name.trim()) e.name = form.name.trim()
  const cw = Number(form.contextWindow)
  if (Number.isInteger(cw) && cw > 0) e.contextWindow = cw
  const mt = Number(form.maxTokens)
  if (Number.isInteger(mt) && mt > 0) e.maxTokens = mt
  if (!form.inputUnset) {
    const input: string[] = []
    if (form.inputText) input.push('text')
    if (form.inputImage) input.push('image')
    if (input.length) e.input = input
  }
  if (form.reasoningMode === 'off') {
    e.reasoningEfforts = false
  } else if (form.reasoningMode === 'levels') {
    const efforts: Record<string, string | null> = {}
    for (const row of form.levels) {
      if (!row.on) continue
      if (row.level === 'off') { efforts.off = null; continue }
      const wire = String(row.wire || '').trim()
      if (wire) efforts[row.level] = wire
    }
    if (Object.keys(efforts).length) e.reasoningEfforts = efforts
  }
  const compat: Record<string, unknown> = {}
  if (form.compatThinkingFormat) compat.thinkingFormat = form.compatThinkingFormat
  if (form.compatSupportsReasoningEffort !== '') compat.supportsReasoningEffort = form.compatSupportsReasoningEffort === 'true'
  if (Object.keys(compat).length) e.compat = compat
  return e
}

/**
 * Convert one existing model entry back into editable form state.
 * Absent `reasoningEfforts` / `input` fields map to the 'unset' states so a
 * re-apply keeps them inherited instead of writing explicit defaults.
 */
export function entryToForm(entry: any): any {
  const input = Array.isArray(entry.input) ? entry.input : []
  const re = entry.reasoningEfforts
  const keys = re && typeof re === 'object' && !Array.isArray(re)
    ? Object.keys(re)
    : []
  const compat = entry.compat && typeof entry.compat === 'object' && !Array.isArray(entry.compat) ? entry.compat : {}
  return {
    id: typeof entry.id === 'string' ? entry.id : '',
    name: typeof entry.name === 'string' ? entry.name : '',
    contextWindow: entry.contextWindow ? String(entry.contextWindow) : '',
    maxTokens: entry.maxTokens ? String(entry.maxTokens) : '',
    inputUnset: !Object.prototype.hasOwnProperty.call(entry, 'input'),
    inputText: !input.length || input.indexOf('text') >= 0,
    inputImage: input.indexOf('image') >= 0,
    reasoningMode: re === false ? 'off' : (keys.length ? 'levels' : 'unset'),
    levels: keys.map((level: string) => ({
      level,
      wire: level === 'off' ? '' : (typeof re[level] === 'string' ? re[level] : ''),
      on: true,
    })),
    compatThinkingFormat: typeof compat.thinkingFormat === 'string' ? compat.thinkingFormat : '',
    compatSupportsReasoningEffort: typeof compat.supportsReasoningEffort === 'boolean' ? String(compat.supportsReasoningEffort) : '',
  }
}

/** One-line summary of an existing model entry for the provider model list. */
export function modelSummary(entry: any): string {
  const parts: string[] = []
  if (typeof entry.name === 'string' && entry.name && entry.name !== entry.id) parts.push(entry.name)
  if (entry.contextWindow) parts.push('ctx ' + entry.contextWindow)
  if (entry.maxTokens) parts.push('out ' + entry.maxTokens)
  if (Array.isArray(entry.input) && entry.input.length) parts.push('input: ' + entry.input.join('+'))
  if (entry.reasoningEfforts && typeof entry.reasoningEfforts === 'object' && !Array.isArray(entry.reasoningEfforts)) {
    const keys = Object.keys(entry.reasoningEfforts)
    if (keys.length) parts.push('reasoning: ' + keys.join(','))
  }
  if (entry.compat && typeof entry.compat === 'object' && !Array.isArray(entry.compat)) {
    const bits: string[] = []
    if (typeof entry.compat.thinkingFormat === 'string') bits.push('tf: ' + entry.compat.thinkingFormat)
    if (typeof entry.compat.supportsReasoningEffort === 'boolean') bits.push('sre: ' + entry.compat.supportsReasoningEffort)
    if (bits.length) parts.push('compat: ' + bits.join(', '))
  }
  return parts.length ? parts.join(' · ') : '—'
}
