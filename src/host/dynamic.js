/**
 * 供应商模型配置器 — 动态插件 Host 半区源码(即 cordis_define 的 `code.host`)。
 *
 * 与 `src/client/dynamic.ts` 构建出的 `code.client`(dist/dynamic-client-body.js)
 * 组成动态插件版本:在 DSH 会话中 cordis_define 时,本文件内容(不含本注释块)
 * 原样粘贴为 `code.host`,生成体粘贴为 `code.client`,然后 cordis_run 激活
 * (Client 端首次需要用户批准)。
 *
 * 依赖 Host 服务(均通过 ctx.get 可选读取,缺失时返回错误而非崩溃):
 *   - llm      : listProviders / listConfigurableProviders / listModels /
 *                discoverModels / resolveModelInfo
 *   - settings : get / writable / mutate
 */
return {
  apply(ctx) {
    const NS = 'llm-pi-ai'
    const THINKING_LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']
    const THINKING_FORMATS = ['openai', 'deepseek', 'openrouter', 'together', 'zai', 'qwen', 'string-thinking', 'ant-ling']
    const getLlm = () => ctx.get('llm')
    const getSettings = () => ctx.get('settings')

    harness.handle('preset-providers', async () => {
      const llm = getLlm()
      if (llm === undefined) return { ok: false, error: 'llm 服务不可用' }
      const st = getSettings()
      let configured = {}
      if (st !== undefined) {
        try {
          const section = st.get(NS)
          if (section && typeof section === 'object' && section.providers && typeof section.providers === 'object') configured = section.providers
        } catch (e) { /* resolved value unavailable */ }
      }
      let dir = []
      try { dir = llm.listConfigurableProviders() } catch (e) { /* no directory */ }
      const items = dir
        .filter((e) => e.settingsNs === NS)
        .map((e) => ({
          provider: e.provider,
          displayName: e.displayName,
          declared: e.declared === true,
          configured: Object.prototype.hasOwnProperty.call(configured, e.provider),
        }))
      items.sort((a, b) => (b.configured - a.configured) || (Number(a.declared) - Number(b.declared)) || a.provider.localeCompare(b.provider))
      return { ok: true, providers: items }
    })

    harness.handle('preset-models', async (args) => {
      const llm = getLlm()
      if (llm === undefined) return { ok: false, error: 'llm 服务不可用' }
      const provider = String((args && args.provider) || '')
      if (!provider) return { ok: false, error: '缺少复制来源提供商' }
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
    })

    harness.handle('preset-model-info', async (args) => {
      const llm = getLlm()
      if (llm === undefined) return { ok: false, error: 'llm 服务不可用' }
      const provider = String((args && args.provider) || '')
      const model = String((args && args.model) || '')
      if (!provider || !model) return { ok: false, error: '缺少复制来源提供商或模型' }
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
      } catch (e) { /* catalog knowledge unavailable; resolve path may still answer */ }
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
        } catch (e) { /* keep catalog-only info */ }
      }
      const info = {
        provider,
        model,
        name: name || model,
        reasoning,
        ...(contextWindow !== undefined ? { contextWindow } : {}),
        ...(maxTokens !== undefined ? { maxTokens } : {}),
        ...(input !== undefined ? { input } : {}),
      }
      return { ok: true, info }
    })

    harness.handle('target-providers', async () => {
      const st = getSettings()
      const llm = getLlm()
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
        try { dir = llm.listConfigurableProviders() } catch (e) { /* no directory */ }
      }
      const dirMap = new Map(dir.filter((e) => e.settingsNs === NS).map((e) => [e.provider, e]))
      const items = []
      for (const route of keys) {
        const profile = providers[route]
        const p = profile && typeof profile === 'object' ? profile : {}
        // A resolved section may carry models: [] after the last entry was
        // unset; an empty list means "no explicit entries" (catalog state).
        const hasExplicit = Array.isArray(p.models) && p.models.length > 0
        const models = hasExplicit ? p.models.map((m) => String(m && typeof m === 'object' ? m.id : m)) : []
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
        } catch (e) { /* keep empty */ }
      }
      let writable = true
      try { writable = st.writable !== false } catch (e) { /* default true */ }
      return { ok: true, providers: items, writable }
    })

    harness.handle('apply-model-config', async (args) => {
      const st = getSettings()
      if (st === undefined) return { ok: false, error: 'settings 服务不可用' }
      const route = String((args && args.route) || '')
      const entry = args && args.entry && typeof args.entry === 'object' ? args.entry : null
      if (!route) return { ok: false, error: '缺少目标提供商路由名' }
      if (!entry || typeof entry.id !== 'string' || !entry.id.trim()) return { ok: false, error: '缺少模型 ID' }
      const id = entry.id.trim()
      if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)) return { ok: false, error: '模型 ID 只能包含字母、数字、点、下划线与连字符' }
      const clears = Array.isArray(args.clearFields) ? args.clearFields.filter((k) => typeof k === 'string') : []
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
        const llm = getLlm()
        let disc = []
        if (llm !== undefined) {
          try { disc = await llm.discoverModels(NS, { provider: route }) } catch (e) { /* ignore */ }
        }
        base = disc.map((m) => {
          const ov = overrides && overrides[m.id]
          return ov && typeof ov === 'object' ? { id: m.id, ...ov } : { id: m.id }
        })
        if (!base.length) return { ok: false, error: `无法读取提供商 "${route}" 的现有模型列表,已中止(避免覆盖整个模型目录)` }
      }
      const idx = base.findIndex((m) => m.id === id)
      if (idx >= 0) {
        if (args.overwrite !== true) return { ok: false, error: `模型 "${id}" 已存在;请确认覆盖后重试` }
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

      // The sandbox runs in its own vm realm: plain objects built here carry
      // the sandbox Object.prototype, which main-realm isPlainObject checks
      // reject. Rebuild the whole mutate payload onto a host-realm prototype
      // template (the wire-decoded args object) before settings.mutate.
      const hostProto = args && typeof args === 'object' ? Object.getPrototypeOf(args) : null
      const hostify = (value) => {
        if (value === null || typeof value !== 'object') return value
        if (Array.isArray(value)) return value.map(hostify)
        const out = Object.create(hostProto)
        for (const key of Object.keys(value)) out[key] = hostify(value[key])
        return out
      }
      const ops = [hostify({ op: 'set', path: ['providers', route, 'models'], value: base })]
      try {
        await st.mutate(NS, ops)
      } catch (err) {
        return { ok: false, error: String((err && err.message) || err) }
      }
      return { ok: true, route, model: id, count: base.length }
    })

    harness.handle('delete-model', async (args) => {
      const st = getSettings()
      if (st === undefined) return { ok: false, error: 'settings 服务不可用' }
      const route = String((args && args.route) || '')
      const modelId = String((args && args.modelId) || '')
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
      let revertedToCatalog = false
      let ops
      if (models.length === 0) {
        // listConfigurableProviders includes custom declared providers; only a
        // true catalog route (declared !== true) may revert to the catalog.
        let inCatalog = false
        const llm = getLlm()
        if (llm !== undefined) {
          try { inCatalog = llm.listConfigurableProviders().some((e) => e.settingsNs === NS && e.provider === route && e.declared !== true) } catch (e) { /* assume custom */ }
        }
        if (!inCatalog) return { ok: false, error: `提供商 "${route}" 不在内置目录中,必须至少保留一个显式模型条目;已中止删除` }
        revertedToCatalog = true
        ops = [{ op: 'unset', path: ['providers', route, 'models'] }]
      } else {
        ops = [{ op: 'set', path: ['providers', route, 'models'], value: models }]
      }
      const hostProto = args && typeof args === 'object' ? Object.getPrototypeOf(args) : null
      const hostify = (value) => {
        if (value === null || typeof value !== 'object') return value
        if (Array.isArray(value)) return value.map(hostify)
        const out = Object.create(hostProto)
        for (const key of Object.keys(value)) out[key] = hostify(value[key])
        return out
      }
      try {
        await st.mutate(NS, ops.map(hostify))
      } catch (err) {
        return { ok: false, error: String((err && err.message) || err) }
      }
      return { ok: true, route, model: modelId, count: models.length, revertedToCatalog }
    })
  },
}
