/**
 * Static bundle entry → built into lib/client.js (ModuleLoader format).
 * Talks to the host through the Typert Remote handle (descriptors imported
 * from the shared wire contract in src/host/); CSS via a fixed-id style tag.
 */
import { INVOCATIONS } from '../host/contract.js'
import { ModelConfiguratorPage, zh, en, css, type Translate, type Call } from './page.js'

export const name = 'dsh-provider-model-configurator'
export const inject = ['slots', 'remote', 'locale']

const NS = 'settings.provider-model-configurator'
const SLOT_ID = 'provider-model-configurator'
const SLOT_ORDER = 11
const STYLE_ID = 'dsh-provider-model-configurator-styles'

/** Wire method name → Remote handle method (names already match). */
const METHOD_MAP: Record<string, string> = {
  'preset-providers': 'presetProviders',
  'preset-models': 'presetModels',
  'preset-model-info': 'presetModelInfo',
  'target-providers': 'targetProviders',
  'apply-model-config': 'applyModelConfig',
  'delete-model': 'deleteModel',
}

/** Wire method name → positional argument order on the Remote handle. */
const PARAM_ORDER: Record<string, string[]> = {
  'preset-models': ['provider'],
  'preset-model-info': ['provider', 'model'],
  'apply-model-config': ['route', 'entry', 'overwrite', 'clearFields'],
  'delete-model': ['route', 'modelId'],
}

function adoptStyles(cssText: string): void {
  if (document.getElementById(STYLE_ID) !== null) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = cssText
  document.head.appendChild(style)
}

export function apply(ctx: any): void {
  const locale = ctx.get('locale') ?? ctx.locale
  if (locale !== undefined) {
    ctx.effect(() => locale.register(NS, { zh, en }), 'dsh-provider-model-configurator: dictionaries')
  }
  const t: Translate = locale !== undefined ? locale.bind(NS) : (key: string) => key
  adoptStyles(css)

  // Mount the modelConfigurator Remote namespace, then resolve its handle
  // through the service store (ctx.reflect.get), not a dotted ctx read.
  let remote: any = null
  ctx.effect(async () => {
    const dispose = await ctx.remote.$mount({ package: name, descriptors: INVOCATIONS })
    const handle = ctx.reflect.get('remote.modelConfigurator')
    if (handle === undefined) {
      throw new Error('dsh-provider-model-configurator: the modelConfigurator Remote namespace did not mount')
    }
    remote = handle
    return () => { remote = null; void dispose() }
  }, 'dsh-provider-model-configurator: remote')

  /** Unwrap the transport envelope, then the business envelope. */
  const call: Call = async (method, payload) => {
    if (remote === null) throw new Error(t('remotePending'))
    const remoteName = METHOD_MAP[method]
    const args = (PARAM_ORDER[method] || []).map((key) => (payload || {})[key])
    const r = await remote[remoteName](...args)
    // Error payloads may carry the message as a string or as { message }.
    const msgOf = (e: unknown): string =>
      typeof e === 'string' ? e : (e && typeof e === 'object' && typeof (e as any).message === 'string' ? (e as any).message : '')
    if (r === null || typeof r !== 'object' || r.ok !== true) {
      throw new Error(msgOf((r as any)?.error) || '调用失败')
    }
    const value = (r as any).value
    if (value && value.ok === true) return value
    throw new Error(msgOf((value as any)?.error) || '调用失败')
  }

  const slots = ctx.get('slots') ?? ctx.slots
  if (slots === undefined) return
  slots.inject('settings.section', () => slots.register(
    { name: 'settings.section', id: SLOT_ID, order: SLOT_ORDER, label: () => t('nav') },
    () => React.createElement(ModelConfiguratorPage, { t, call }),
  ))
}
