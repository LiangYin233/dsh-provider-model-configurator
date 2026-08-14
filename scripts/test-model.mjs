/**
 * Unit tests for the client model logic (src/client/model.ts) — the only
 * pure business logic shared by both mounts. Runs with the Node test runner
 * plus built-in type stripping:
 *
 *   node --experimental-strip-types --test scripts/test-model.mjs
 *
 * (the flag is a no-op on Node 24, where type stripping is default-on).
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildEntry, entryToForm, modelSummary, THINKING_LEVELS, THINKING_FORMATS } from '../src/client/model.ts'

test('shared constants match the canonical source', () => {
  assert.deepEqual(THINKING_LEVELS, ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'])
  assert.deepEqual(THINKING_FORMATS, ['openai', 'deepseek', 'openrouter', 'together', 'zai', 'qwen', 'string-thinking', 'ant-ling'])
})

test('buildEntry: trims id and name, drops empty fields', () => {
  const e = buildEntry({ id: '  deepseek-v5  ', name: '  DS  ', contextWindow: '', maxTokens: '', inputUnset: true, reasoningMode: 'unset', levels: [], compatThinkingFormat: '', compatSupportsReasoningEffort: '' })
  assert.deepEqual(e, { id: 'deepseek-v5', name: 'DS' })
})

test('buildEntry: numeric fields only when valid positive integers', () => {
  const base = { id: 'm', name: '', inputUnset: true, reasoningMode: 'unset', levels: [], compatThinkingFormat: '', compatSupportsReasoningEffort: '' }
  assert.equal(buildEntry({ ...base, contextWindow: '262144', maxTokens: '32768' }).contextWindow, 262144)
  assert.equal(buildEntry({ ...base, contextWindow: '32768' }).maxTokens, undefined)
  assert.equal(buildEntry({ ...base, contextWindow: 'abc' }).contextWindow, undefined)
  assert.equal(buildEntry({ ...base, contextWindow: '0' }).contextWindow, undefined)
  assert.equal(buildEntry({ ...base, contextWindow: '1.5' }).contextWindow, undefined)
})

test('buildEntry: input modes only when unset is off', () => {
  const base = { id: 'm', name: '', contextWindow: '', maxTokens: '', reasoningMode: 'unset', levels: [], compatThinkingFormat: '', compatSupportsReasoningEffort: '' }
  assert.equal(buildEntry({ ...base, inputUnset: true, inputText: true, inputImage: true }).input, undefined)
  assert.deepEqual(buildEntry({ ...base, inputUnset: false, inputText: true, inputImage: false }).input, ['text'])
  assert.deepEqual(buildEntry({ ...base, inputUnset: false, inputText: true, inputImage: true }).input, ['text', 'image'])
  assert.equal(buildEntry({ ...base, inputUnset: false, inputText: false, inputImage: false }).input, undefined)
})

test('buildEntry: reasoning modes', () => {
  const base = { id: 'm', name: '', contextWindow: '', maxTokens: '', inputUnset: true, compatThinkingFormat: '', compatSupportsReasoningEffort: '' }
  assert.equal(buildEntry({ ...base, reasoningMode: 'off', levels: [] }).reasoningEfforts, false)
  assert.deepEqual(buildEntry({ ...base, reasoningMode: 'unset', levels: [] }).reasoningEfforts, undefined)
  // Unchecked rows and empty wires are skipped; off writes null.
  const levels = [
    { level: 'off', wire: '', on: true },
    { level: 'low', wire: 'low', on: true },
    { level: 'high', wire: '', on: true },
    { level: 'max', wire: 'max', on: false },
  ]
  assert.deepEqual(buildEntry({ ...base, reasoningMode: 'levels', levels }).reasoningEfforts, { off: null, low: 'low' })
})

test('buildEntry: compat block only when set', () => {
  const base = { id: 'm', name: '', contextWindow: '', maxTokens: '', inputUnset: true, reasoningMode: 'unset', levels: [] }
  assert.equal(buildEntry({ ...base, compatThinkingFormat: '', compatSupportsReasoningEffort: '' }).compat, undefined)
  assert.deepEqual(buildEntry({ ...base, compatThinkingFormat: 'deepseek', compatSupportsReasoningEffort: '' }).compat, { thinkingFormat: 'deepseek' })
  assert.deepEqual(buildEntry({ ...base, compatThinkingFormat: '', compatSupportsReasoningEffort: 'false' }).compat, { supportsReasoningEffort: false })
})

test('entryToForm: full round-trip of a built entry', () => {
  const form = {
    id: 'gpt-5', name: 'GPT-5', contextWindow: '400000', maxTokens: '65536',
    inputUnset: false, inputText: true, inputImage: true,
    reasoningMode: 'levels', levels: [{ level: 'off', wire: '', on: true }, { level: 'high', wire: 'high', on: true }],
    compatThinkingFormat: 'openai', compatSupportsReasoningEffort: 'true',
  }
  const back = entryToForm(buildEntry(form))
  assert.equal(back.id, 'gpt-5')
  assert.equal(back.name, 'GPT-5')
  assert.equal(back.contextWindow, '400000')
  assert.equal(back.maxTokens, '65536')
  assert.equal(back.inputUnset, false)
  assert.equal(back.inputText, true)
  assert.equal(back.inputImage, true)
  assert.equal(back.reasoningMode, 'levels')
  assert.equal(back.levels.length, 2)
  assert.equal(back.compatThinkingFormat, 'openai')
  assert.equal(back.compatSupportsReasoningEffort, 'true')
})

test('entryToForm: absent fields map to unset states', () => {
  const back = entryToForm({ id: 'm' })
  assert.equal(back.inputUnset, true)
  assert.equal(back.reasoningMode, 'unset')
  assert.equal(back.compatThinkingFormat, '')
  assert.equal(back.compatSupportsReasoningEffort, '')
})

test('entryToForm: reasoningEfforts false maps to off mode', () => {
  const back = entryToForm({ id: 'm', reasoningEfforts: false })
  assert.equal(back.reasoningMode, 'off')
})

test('modelSummary: renders known fields and dashes for empty entries', () => {
  const s = modelSummary({ id: 'm', name: 'M', contextWindow: 1000, maxTokens: 2000, input: ['text', 'image'], reasoningEfforts: { low: 'low' }, compat: { thinkingFormat: 'openai', supportsReasoningEffort: true } })
  assert.ok(s.includes('M'))
  assert.ok(s.includes('ctx 1000'))
  assert.ok(s.includes('out 2000'))
  assert.ok(s.includes('input: text+image'))
  assert.ok(s.includes('reasoning: low'))
  assert.ok(s.includes('tf: openai'))
  assert.equal(modelSummary({ id: 'm' }), '—')
})
