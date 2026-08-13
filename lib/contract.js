/**
 * dsh-model-config-sync wire contract: the strict Typert invocation
 * descriptors and the host manifest for the `modelConfigSync` Remote
 * namespace.
 *
 * The client half (lib/client.js) is a self-contained browser bundle and
 * inlines an identical copy of these descriptors — keep them in sync.
 */
export const THINKING_LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']

/** One strict codec: only `parse` is required by the typert boundary. */
const schema = (parse) => ({ parse })

const stringSchema = schema((v) => {
  if (typeof v !== 'string') throw new TypeError('expected a string')
  return v
})
const booleanSchema = schema((v) => {
  if (typeof v !== 'boolean') throw new TypeError('expected a boolean')
  return v
})
const objectSchema = schema((v) => {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) throw new TypeError('expected an object')
  return v
})
/** Every business method answers `{ ok, ... }` or `{ ok: false, error }`. */
const resultEnvelopeSchema = schema((v) => {
  if (v === null || typeof v !== 'object' || typeof v.ok !== 'boolean') throw new TypeError('expected an { ok, ... } envelope')
  return v
})

const codec = (name, sch) => ({ mode: 'strict', typeSymbol: `dsh-model-config-sync#${name}`, schema: sch })

const stringParam = (name) => ({
  name,
  wire: name,
  source: 'json',
  codec: codec('String', stringSchema),
})

export const INVOCATIONS = [
  {
    id: 'dsh-model-config-sync#modelConfigSync/presetProviders',
    service: 'modelConfigSync',
    namespace: 'modelConfigSync',
    method: 'presetProviders',
    invocation: { kind: 'direct' },
    parameters: [],
    result: { mode: 'strict', typeSymbol: 'dsh-model-config-sync#PresetProvidersResult', schema: resultEnvelopeSchema },
  },
  {
    id: 'dsh-model-config-sync#modelConfigSync/presetModels',
    service: 'modelConfigSync',
    namespace: 'modelConfigSync',
    method: 'presetModels',
    invocation: { kind: 'direct' },
    parameters: [stringParam('provider')],
    result: { mode: 'strict', typeSymbol: 'dsh-model-config-sync#PresetModelsResult', schema: resultEnvelopeSchema },
  },
  {
    id: 'dsh-model-config-sync#modelConfigSync/presetModelInfo',
    service: 'modelConfigSync',
    namespace: 'modelConfigSync',
    method: 'presetModelInfo',
    invocation: { kind: 'direct' },
    parameters: [stringParam('provider'), stringParam('model')],
    result: { mode: 'strict', typeSymbol: 'dsh-model-config-sync#PresetModelInfoResult', schema: resultEnvelopeSchema },
  },
  {
    id: 'dsh-model-config-sync#modelConfigSync/targetProviders',
    service: 'modelConfigSync',
    namespace: 'modelConfigSync',
    method: 'targetProviders',
    invocation: { kind: 'direct' },
    parameters: [],
    result: { mode: 'strict', typeSymbol: 'dsh-model-config-sync#TargetProvidersResult', schema: resultEnvelopeSchema },
  },
  {
    id: 'dsh-model-config-sync#modelConfigSync/applyModelConfig',
    service: 'modelConfigSync',
    namespace: 'modelConfigSync',
    method: 'applyModelConfig',
    invocation: { kind: 'direct' },
    parameters: [
      stringParam('route'),
      { name: 'entry', wire: 'entry', source: 'json', codec: codec('ModelEntry', objectSchema) },
      { name: 'overwrite', wire: 'overwrite', source: 'json', codec: codec('Boolean', booleanSchema) },
    ],
    result: { mode: 'strict', typeSymbol: 'dsh-model-config-sync#ApplyModelConfigResult', schema: resultEnvelopeSchema },
  },
]

/**
 * Host manifest registered through `ctx.typert.register`: the strict
 * descriptors are what the Host Gateway resolves and invokes
 * `modelConfigSync/<method>` with, independent of decorator markers.
 */
export const TYPERT_MANIFEST = {
  package: 'dsh-model-config-sync',
  face: 'host',
  schemas: [],
  model: {
    services: [
      {
        key: 'modelConfigSync',
        exportName: 'ModelConfigSyncRuntime',
        description: 'Read preset model metadata and write explicit model entries into llm-pi-ai provider settings.',
        tags: [],
        members: [
          { kind: 'method', name: 'presetProviders', signature: 'presetProviders(): Promise<object>' },
          { kind: 'method', name: 'presetModels', signature: 'presetModels(provider: string): Promise<object>' },
          { kind: 'method', name: 'presetModelInfo', signature: 'presetModelInfo(provider: string, model: string): Promise<object>' },
          { kind: 'method', name: 'targetProviders', signature: 'targetProviders(): Promise<object>' },
          { kind: 'method', name: 'applyModelConfig', signature: 'applyModelConfig(route: string, entry: object, overwrite: boolean): Promise<object>' },
        ],
        types: [],
      },
    ],
    events: [],
    objects: [],
  },
  invocations: INVOCATIONS,
}
