/**
 * dsh-provider-model-configurator wire contract: the strict Typert invocation
 * descriptors and the host manifest for the `modelConfigurator` Remote
 * namespace.
 *
 * Shared verbatim by both sides: the static client entry imports INVOCATIONS
 * from here (bundled into lib/client.js), and the host entry imports
 * THINKING_LEVELS / TYPERT_MANIFEST (lib/index.js). Copied to lib/ by build.mjs.
 */
export const THINKING_LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']

/** Reasoning-dispatch wire formats DSH (dsh-llm-pi-ai) accepts. */
export const THINKING_FORMATS = ['openai', 'deepseek', 'openrouter', 'together', 'zai', 'qwen', 'string-thinking', 'ant-ling']

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
const stringArraySchema = schema((v) => {
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) throw new TypeError('expected an array of strings')
  return v
})
/** Every business method answers `{ ok, ... }` or `{ ok: false, error }`. */
const resultEnvelopeSchema = schema((v) => {
  if (v === null || typeof v !== 'object' || typeof v.ok !== 'boolean') throw new TypeError('expected an { ok, ... } envelope')
  return v
})

const codec = (name, sch) => ({ mode: 'strict', typeSymbol: `dsh-provider-model-configurator#${name}`, schema: sch })

const stringParam = (name) => ({
  name,
  wire: name,
  source: 'json',
  codec: codec('String', stringSchema),
})

export const INVOCATIONS = [
  {
    id: 'dsh-provider-model-configurator#modelConfigurator/presetProviders',
    service: 'modelConfigurator',
    namespace: 'modelConfigurator',
    method: 'presetProviders',
    invocation: { kind: 'direct' },
    parameters: [],
    result: { mode: 'strict', typeSymbol: 'dsh-provider-model-configurator#PresetProvidersResult', schema: resultEnvelopeSchema },
  },
  {
    id: 'dsh-provider-model-configurator#modelConfigurator/presetModels',
    service: 'modelConfigurator',
    namespace: 'modelConfigurator',
    method: 'presetModels',
    invocation: { kind: 'direct' },
    parameters: [stringParam('provider')],
    result: { mode: 'strict', typeSymbol: 'dsh-provider-model-configurator#PresetModelsResult', schema: resultEnvelopeSchema },
  },
  {
    id: 'dsh-provider-model-configurator#modelConfigurator/presetModelInfo',
    service: 'modelConfigurator',
    namespace: 'modelConfigurator',
    method: 'presetModelInfo',
    invocation: { kind: 'direct' },
    parameters: [stringParam('provider'), stringParam('model')],
    result: { mode: 'strict', typeSymbol: 'dsh-provider-model-configurator#PresetModelInfoResult', schema: resultEnvelopeSchema },
  },
  {
    id: 'dsh-provider-model-configurator#modelConfigurator/targetProviders',
    service: 'modelConfigurator',
    namespace: 'modelConfigurator',
    method: 'targetProviders',
    invocation: { kind: 'direct' },
    parameters: [],
    result: { mode: 'strict', typeSymbol: 'dsh-provider-model-configurator#TargetProvidersResult', schema: resultEnvelopeSchema },
  },
  {
    id: 'dsh-provider-model-configurator#modelConfigurator/applyModelConfig',
    service: 'modelConfigurator',
    namespace: 'modelConfigurator',
    method: 'applyModelConfig',
    invocation: { kind: 'direct' },
    parameters: [
      stringParam('route'),
      { name: 'entry', wire: 'entry', source: 'json', codec: codec('ModelEntry', objectSchema) },
      { name: 'overwrite', wire: 'overwrite', source: 'json', codec: codec('Boolean', booleanSchema) },
      { name: 'clearFields', wire: 'clearFields', source: 'json', codec: codec('StringArray', stringArraySchema) },
    ],
    result: { mode: 'strict', typeSymbol: 'dsh-provider-model-configurator#ApplyModelConfigResult', schema: resultEnvelopeSchema },
  },
  {
    id: 'dsh-provider-model-configurator#modelConfigurator/deleteModel',
    service: 'modelConfigurator',
    namespace: 'modelConfigurator',
    method: 'deleteModel',
    invocation: { kind: 'direct' },
    parameters: [stringParam('route'), stringParam('modelId')],
    result: { mode: 'strict', typeSymbol: 'dsh-provider-model-configurator#DeleteModelResult', schema: resultEnvelopeSchema },
  },
]

/**
 * Host manifest registered through `ctx.typert.register`: the strict
 * descriptors are what the Host Gateway resolves and invokes
 * `modelConfigurator/<method>` with, independent of decorator markers.
 */
export const TYPERT_MANIFEST = {
  package: 'dsh-provider-model-configurator',
  face: 'host',
  schemas: [],
  model: {
    services: [
      {
        key: 'modelConfigurator',
        exportName: 'ModelConfiguratorRuntime',
        description: 'Manage model configurations across configured llm-pi-ai providers: view, create, edit, copy and delete explicit model entries.',
        tags: [],
        members: [
          { kind: 'method', name: 'presetProviders', signature: 'presetProviders(): Promise<object>' },
          { kind: 'method', name: 'presetModels', signature: 'presetModels(provider: string): Promise<object>' },
          { kind: 'method', name: 'presetModelInfo', signature: 'presetModelInfo(provider: string, model: string): Promise<object>' },
          { kind: 'method', name: 'targetProviders', signature: 'targetProviders(): Promise<object>' },
          { kind: 'method', name: 'applyModelConfig', signature: 'applyModelConfig(route: string, entry: object, overwrite: boolean, clearFields: string[]): Promise<object>' },
          { kind: 'method', name: 'deleteModel', signature: 'deleteModel(route: string, modelId: string): Promise<object>' },
        ],
        types: [],
      },
    ],
    events: [],
    objects: [],
  },
  invocations: INVOCATIONS,
}
