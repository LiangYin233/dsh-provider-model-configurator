/**
 * Dynamic plugin entry: the `code.client` body for cordis_define.
 *
 * Built by `node build.mjs --dynamic` into `dist/dynamic-client-body.js` as a
 * plain JS function body (`return <plugin object>;`) whose free symbols are
 * the dynamic runner's closure parameters: `React`, `styles`, `host` and
 * `ctx` (inside apply). Paste the generated body as `code.client` when
 * defining the dynamic plugin; `src/host.dyn.js` is the matching host half.
 *
 * The page talks to the host through `host.call(method, payload)` and CSS is
 * injected through the dynamic `styles.insert`. The locale namespace and
 * slot id carry a `-dyn` suffix so this debug copy coexists with the static
 * bundle's settings page in the same GUI.
 */
import { ModelConfiguratorPage, zh, en, css, type Translate, type Call } from './page.js'

/** Locale namespace and settings.section slot identity (dynamic debug copy). */
const NS = 'settings.provider-model-configurator-dyn'
const SLOT_ID = 'provider-model-configurator-dyn'
const SLOT_ORDER = 12

export function apply(ctx: any): void {
  const locale = ctx.get('locale')
  if (locale !== undefined) {
    ctx.effect(() => locale.register(NS, {
      zh: { ...zh, nav: '供应商模型配置器(动态)' },
      en: { ...en, nav: 'Provider Model Configurator (dynamic)' },
    }), 'dsh-provider-model-configurator: dictionaries')
  }
  const t: Translate = locale !== undefined ? locale.bind(NS) : (key: string) => key
  styles.insert(css)

  /** host.call resolves with the business envelope directly. */
  const call: Call = async (method, payload) => {
    const r: any = await host.call(method, payload)
    if (!r || r.ok !== true) throw new Error((r && r.error) || '调用失败')
    return r
  }

  const slots = ctx.get('slots')
  if (slots === undefined) return
  slots.inject('settings.section', () => slots.register(
    { name: 'settings.section', id: SLOT_ID, order: SLOT_ORDER, label: () => t('nav') },
    () => React.createElement(ModelConfiguratorPage, { t, call }),
  ))
}
