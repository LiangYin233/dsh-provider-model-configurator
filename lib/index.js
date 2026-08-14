/**
 * dsh-provider-model-configurator host plugin: mounts the `modelConfigurator` Typert
 * Remote service — read preset (installed catalog) model metadata and write
 * explicit model entries into `llm-pi-ai` provider settings — and registers
 * its strict Typert manifest. The client half ships in the same package
 * (`./client`); the web server serves it under
 * /plugins/dsh-provider-model-configurator/client.js and it registers the
 * "Provider Model Configurator" settings page.
 *
 * Services are read through `ctx.get` so a missing service degrades to a
 * loud business error instead of a mount failure:
 *   - llm      : listProviders / listConfigurableProviders / listModels /
 *                discoverModels / resolveModelInfo
 *   - settings : get / writable / mutate
 */
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { THINKING_LEVELS, THINKING_FORMATS, TYPERT_MANIFEST } from './contract.js'

/** Cordis plugin name (the Loader entry and client bundle id). */
export const name = 'dsh-provider-model-configurator'

/** Services required before load: the Typert registry. */
export const inject = ['typert']

/** Settings namespace owned by the pi-ai provider adapter. */
const NS = 'llm-pi-ai'

/**
 * The modelConfigurator Remote service. Each method answers the business
 * envelope `{ ok: true, ... }` or `{ ok: false, error }`; the typert
 * boundary wraps it in its own transport envelope.
 */
class ModelConfiguratorRuntime extends TypertRemoteService {
  /**
   * Register the service under the `modelConfigurator` key (the wire namespace).
   * @param ctx - owning cordis context.
   */
  constructor(ctx) {
    super(ctx, 'modelConfigurator')
  }

  /** Catalog + configured providers, with declared/configured markers. */
  async presetProviders() {
    const llm = this.ctx.get('llm')
    if (llm === undefined) return { ok: false, error: 'llm 服务不可用' }
    const st = this.ctx.get('settings')
    let configured = {}
    if (st !== undefined) {
      try {
        const section = st.get(NS)
        if (section && typeof section === 'object' && section.providers && typeof section.providers === 'object') configured = section.providers
      } catch { /* resolved value unavailable */ }
    }
    const live = new Set(llm.listProviders().map((p) => p.id))
    let dir = []
    try { dir = llm.listConfigurableProviders() } catch { /* no directory */ }
    const items = dir
      .filter((e) => e.settingsNs === NS)
      .map((e) => ({
        provider: e.provider,
        displayName: e.displayName,
        declared: e.declared === true,
        registered: live.has(e.provider),
        configured: Object.prototype.hasOwnProperty.call(configured, e.provider),
      }))
    items.sort((a, b) => (b.configured - a.configured) || (Number(a.declared) - Number(b.declared)) || a.provider.localeCompare(b.provider))
    return { ok: true, providers: items }
  }

  /** Models of one preset provider; registered providers use listModels, dormant ones discoverModels. */
  async presetModels(provider) {
    const llm = this.ctx.get('llm')
    if (llm === undefined) return { ok: false, error: 'llm 服务不可用' }
    if (!provider) return { ok: false, error: '缺少预设提供商' }
    const live = new Set(llm.listProviders().map((p) => p.id))
    try {
      let models
      if (live.has(provider)) models = await llm.listModels(provider)
      else models = await llm.discoverModels(NS, { provider })
      return {
        ok: true,
        models: models.map((m) => ({
          id: m.id,
          name: m.name,
          ...(m.description ? { description: m.description } : {}),
          ...(m.contextWindow ? { contextWindow: m.contextWindow } : {}),
          ...(m.maxTokens ? { maxTokens: m.maxTokens } : {}),
          ...(m.inputModalities && m.inputModalities.length ? { input: [...m.inputModalities] } : {}),
        })),
      }
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) }
    }
  }

  /** Context / max output / modalities / reasoning efforts of one preset model. */
  async presetModelInfo(provider, model) {
    const llm = this.ctx.get('llm')
    if (llm === undefined) return { ok: false, error: 'llm 服务不可用' }
    if (!provider || !model) return { ok: false, error: '缺少预设提供商或模型' }
    const live = new Set(llm.listProviders().map((p) => p.id))
    let name
    let contextWindow
    let maxTokens
    let input
    let reasoning = null
    try {
      const disc = await llm.discoverModels(NS, { provider })
      const hit = disc.find((m) => m.id === model)
      if (hit) {
        if (hit.name) name = hit.name
        if (hit.contextWindow) contextWindow = hit.contextWindow
        if (hit.maxTokens) maxTokens = hit.maxTokens
      }
    } catch { /* catalog knowledge unavailable; resolve path may still answer */ }
    if (live.has(provider)) {
      try {
        const resolved = await llm.resolveModelInfo(provider, model)
        if (resolved.name) name = resolved.name
        if (resolved.inputModalities && resolved.inputModalities.length) input = [...resolved.inputModalities]
        if (resolved.context && resolved.context.contextWindow) contextWindow = resolved.context.contextWindow
        if (resolved.defaultMaxTokens) maxTokens = resolved.defaultMaxTokens
        if (resolved.reasoning && resolved.reasoning.efforts && resolved.reasoning.efforts.length) {
          reasoning = {
            efforts: resolved.reasoning.efforts.map((e) => ({ level: e.id, name: e.name })),
            ...(resolved.reasoning.defaultEffort ? { defaultEffort: resolved.reasoning.defaultEffort } : {}),
          }
        }
      } catch { /* keep catalog-only info */ }
    }
    const info = {
      provider,
      model,
      registered: live.has(provider),
      name: name || model,
      reasoning,
      ...(contextWindow !== undefined ? { contextWindow } : {}),
      ...(maxTokens !== undefined ? { maxTokens } : {}),
      ...(input !== undefined ? { input } : {}),
    }
    return { ok: true, info }
  }

  /** Configured llm-pi-ai routes with their current/catalog model lists. */
  async targetProviders() {
    const st = this.ctx.get('settings')
    const llm = this.ctx.get('llm')
    if (st === undefined) return { ok: false, error: 'settings 服务不可用' }
    let providers = {}
    try {
      const section = st.get(NS)
      if (section && typeof section === 'object' && section.providers && typeof section.providers === 'object') providers = section.providers
    } catch (e) {
      return { ok: false, error: String((e && e.message) || e) }
    }
    const keys = Object.keys(providers)
    let dir = []
    if (llm !== undefined) {
      try { dir = llm.listConfigurableProviders() } catch { /* no directory */ }
    }
    const dirMap = new Map(dir.filter((e) => e.settingsNs === NS).map((e) => [e.provider, e]))
    const items = []
    for (const route of keys) {
      const profile = providers[route]
      const p = profile && typeof profile === 'object' ? profile : {}
      // A resolved section may carry models: [] after the last entry was
      // unset; an empty list means "no explicit entries" (catalog state),
      // never an intentionally empty model list.
      const hasExplicit = Array.isArray(p.models) && p.models.length > 0
      const models = hasExplicit ? p.models.map((m) => String(m && typeof m === 'object' ? m.id : m)) : []
      // Full existing model entries (JSON-safe copy), so the client can load
      // the current configuration of an already-configured model for editing.
      const entries = hasExplicit
        ? p.models.map((m) => {
            if (m === null || typeof m !== 'object') return { id: String(m) }
            const out = {}
            for (const key of Object.keys(m)) if (m[key] !== undefined) out[key] = m[key]
            return out
          })
        : []
      const entry = dirMap.get(route)
      const overrideCount = p.modelOverrides && typeof p.modelOverrides === 'object' ? Object.keys(p.modelOverrides).length : 0
      const item = {
        provider: route,
        displayName: (typeof p.displayName === 'string' && p.displayName) || (entry ? entry.displayName : undefined) || route,
        declared: entry ? entry.declared === true : true,
        models,
        entries,
        usesCatalog: !hasExplicit,
        hasModelOverrides: overrideCount > 0,
        catalogModels: [],
      }
      if (typeof p.api === 'string') item.api = p.api
      if (typeof p.baseURL === 'string') item.baseURL = p.baseURL
      items.push(item)
    }
    for (const item of items) {
      if (!item.usesCatalog || llm === undefined) continue
      try {
        const disc = await llm.discoverModels(NS, { provider: item.provider })
        item.catalogModels = disc.map((m) => m.id)
      } catch { /* keep empty */ }
    }
    let writable = true
    try { writable = st.writable !== false } catch { /* default true */ }
    return { ok: true, providers: items, writable }
  }

  /** Validate, build and write one model entry into the target route's explicit models list. */
  async applyModelConfig(route, entry, overwrite, clearFields) {
    const st = this.ctx.get('settings')
    if (st === undefined) return { ok: false, error: 'settings 服务不可用' }
    if (!route) return { ok: false, error: '缺少目标提供商路由名' }
    if (!entry || typeof entry.id !== 'string' || !entry.id.trim()) return { ok: false, error: '缺少模型 ID' }
    const id = entry.id.trim()
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)) return { ok: false, error: '模型 ID 只能包含字母、数字、点、下划线与连字符' }
    const clears = Array.isArray(clearFields) ? clearFields.filter((k) => typeof k === 'string') : []
    let providers = {}
    try {
      const section = st.get(NS)
      if (section && typeof section === 'object' && section.providers && typeof section.providers === 'object') providers = section.providers
    } catch (e) {
      return { ok: false, error: String((e && e.message) || e) }
    }
    const profile = providers[route]
    if (!profile || typeof profile !== 'object') return { ok: false, error: `提供商 "${route}" 尚未配置,请先在 Models 页创建` }

    const overrides = profile.modelOverrides && typeof profile.modelOverrides === 'object' && Object.keys(profile.modelOverrides).length
      ? profile.modelOverrides
      : null

    const built = { id }
    if (typeof entry.name === 'string' && entry.name.trim()) built.name = entry.name.trim()
    const cw = Number(entry.contextWindow)
    if (Number.isInteger(cw) && cw > 0) built.contextWindow = cw
    const mt = Number(entry.maxTokens)
    if (Number.isInteger(mt) && mt > 0) built.maxTokens = mt
    if (Array.isArray(entry.input) && entry.input.length) {
      const input = entry.input.filter((m) => m === 'text' || m === 'image')
      if (input.length) built.input = input
    }
    // The client sends reasoningEfforts as false or as a level->wire dict
    // (e.g. { high: "high", max: "max" }), the final profile shape.
    if (entry.reasoningEfforts === false) {
      built.reasoningEfforts = false
    } else if (entry.reasoningEfforts && typeof entry.reasoningEfforts === 'object' && !Array.isArray(entry.reasoningEfforts)) {
      const efforts = {}
      let hasThinking = false
      for (const level of Object.keys(entry.reasoningEfforts)) {
        if (level === 'off') { efforts.off = null; continue }
        if (THINKING_LEVELS.indexOf(level) < 0) return { ok: false, error: `未知推理档位 "${level}"` }
        const wire = entry.reasoningEfforts[level]
        if (typeof wire !== 'string' || !wire.trim()) return { ok: false, error: `推理档位 "${level}" 需要填写 wire 值,或取消勾选该档位` }
        efforts[level] = wire.trim()
        hasThinking = true
      }
      if (Object.keys(efforts).length === 0) return { ok: false, error: '推理档位为空:请至少勾选一个档位,或选择「非推理模型」' }
      if (!hasThinking) return { ok: false, error: '推理档位必须包含至少一个非 off 档位' }
      built.reasoningEfforts = efforts
    }
    // DSH reasoning-dispatch compat switches (openai-completions only).
    if (entry.compat && typeof entry.compat === 'object' && !Array.isArray(entry.compat)) {
      const compat = {}
      if (entry.compat.thinkingFormat !== undefined) {
        if (typeof entry.compat.thinkingFormat !== 'string' || THINKING_FORMATS.indexOf(entry.compat.thinkingFormat) < 0) {
          return { ok: false, error: `未知 thinkingFormat "${entry.compat.thinkingFormat}"` }
        }
        compat.thinkingFormat = entry.compat.thinkingFormat
      }
      if (entry.compat.supportsReasoningEffort !== undefined) {
        if (typeof entry.compat.supportsReasoningEffort !== 'boolean') {
          return { ok: false, error: 'supportsReasoningEffort 必须是布尔值' }
        }
        compat.supportsReasoningEffort = entry.compat.supportsReasoningEffort
      }
      if (Object.keys(compat).length) built.compat = compat
    }

    const existing = Array.isArray(profile.models) ? profile.models.map((m) => ({ ...m })) : []
    let base = existing
    if (!base.length) {
      const llm = this.ctx.get('llm')
      let disc = []
      if (llm !== undefined) {
        try { disc = await llm.discoverModels(NS, { provider: route }) } catch { /* ignore */ }
      }
      base = disc.map((m) => {
        const ov = overrides && overrides[m.id]
        return ov && typeof ov === 'object' ? { id: m.id, ...ov } : { id: m.id }
      })
      if (!base.length) return { ok: false, error: `无法读取提供商 "${route}" 的现有模型列表,已中止(避免覆盖整个模型目录)` }
    }
    const idx = base.findIndex((m) => m.id === id)
    if (idx >= 0) {
      if (overwrite !== true) return { ok: false, error: `模型 "${id}" 已存在;请确认覆盖后重试` }
      // Editing an existing model: keep every field the form does not edit
      // (description, tools, …) and let the form fields win for the rest.
      // Fields the form cleared (empty inputs / unset compat) are removed so
      // they fall back to catalog inheritance instead of keeping stale values.
      const previous = base[idx] && typeof base[idx] === 'object' ? base[idx] : {}
      const kept = {}
      for (const key of Object.keys(previous)) if (clears.indexOf(key) < 0) kept[key] = previous[key]
      base[idx] = { ...kept, ...built }
    } else {
      base.push(built)
    }

    const ops = [{ op: 'set', path: ['providers', route, 'models'], value: base }]
    try {
      await st.mutate(NS, ops)
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) }
    }
    return { ok: true, route, model: id, count: base.length }
  }

  /** Remove one explicit model entry from a route's models list. */
  async deleteModel(route, modelId) {
    const st = this.ctx.get('settings')
    if (st === undefined) return { ok: false, error: 'settings 服务不可用' }
    if (!route) return { ok: false, error: '缺少目标提供商路由名' }
    if (!modelId) return { ok: false, error: '缺少模型 ID' }
    let providers = {}
    try {
      const section = st.get(NS)
      if (section && typeof section === 'object' && section.providers && typeof section.providers === 'object') providers = section.providers
    } catch (e) {
      return { ok: false, error: String((e && e.message) || e) }
    }
    const profile = providers[route]
    if (!profile || typeof profile !== 'object') return { ok: false, error: `提供商 "${route}" 尚未配置` }
    if (!Array.isArray(profile.models) || profile.models.length === 0) return { ok: false, error: `提供商 "${route}" 当前没有显式模型条目可删除` }
    const models = profile.models.map((m) => ({ ...m }))
    const idx = models.findIndex((m) => String(m && typeof m === 'object' ? m.id : m) === modelId)
    if (idx < 0) return { ok: false, error: `模型 "${modelId}" 不存在于提供商 "${route}"` }
    models.splice(idx, 1)
    // Removing the last explicit entry reverts a catalog route to the
    // built-in catalog; a custom route (unknown to the catalog) must keep at
    // least one explicit model or the settings schema rejects the write.
    let revertedToCatalog = false
    let ops
    if (models.length === 0) {
      // listConfigurableProviders includes custom declared providers; only a
      // true catalog route (declared !== true) may revert to the catalog.
      let inCatalog = false
      const llm = this.ctx.get('llm')
      if (llm !== undefined) {
        try { inCatalog = llm.listConfigurableProviders().some((e) => e.settingsNs === NS && e.provider === route && e.declared !== true) } catch { /* assume custom */ }
      }
      if (!inCatalog) return { ok: false, error: `提供商 "${route}" 不在内置目录中,必须至少保留一个显式模型条目;已中止删除` }
      revertedToCatalog = true
      ops = [{ op: 'unset', path: ['providers', route, 'models'] }]
    } else {
      ops = [{ op: 'set', path: ['providers', route, 'models'], value: models }]
    }
    try {
      await st.mutate(NS, ops)
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) }
    }
    return { ok: true, route, model: modelId, count: models.length, revertedToCatalog }
  }
}

/**
 * Mount the modelConfigurator service and its strict Typert manifest.
 * @param ctx - host cordis context.
 */
export function apply(ctx) {
  new ModelConfiguratorRuntime(ctx)
  ctx.effect(() => ctx.typert.register(TYPERT_MANIFEST), 'dsh-provider-model-configurator: typert manifest')
}
