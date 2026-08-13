/**
 * 模型配置同步 (Model Config Sync) — Host 半区
 *
 * 这是动态 Cordis 插件的 Host 端源码:即 cordis_define 的 `code.host` 参数
 * (一个普通 JS 函数体,返回 Cordis Plugin 对象)。
 *
 * 使用方法:在 DSH 会话中 cordis_define 时,将本文件内容(不含本注释块)
 * 原样粘贴为 `code.host`;src/client.js 粘贴为 `code.client`,然后 cordis_run 激活。
 *
 * 对应运行时:pluginId mcfg-1,packageId pkg-8(当前稳定版本)。
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
      const live = new Set(llm.listProviders().map((p) => p.id))
      let dir = []
      try { dir = llm.listConfigurableProviders() } catch (e) { /* no directory */ }
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
    })

    harness.handle('preset-models', async (args) => {
      const llm = getLlm()
      if (llm === undefined) return { ok: false, error: 'llm 服务不可用' }
      const provider = String((args && args.provider) || '')
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
    })

    harness.handle('preset-model-info', async (args) => {
      const llm = getLlm()
      if (llm === undefined) return { ok: false, error: 'llm 服务不可用' }
      const provider = String((args && args.provider) || '')
      const model = String((args && args.model) || '')
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
        registered: live.has(provider),
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
        const models = Array.isArray(p.models) ? p.models.map((m) => String(m && typeof m === 'object' ? m.id : m)) : []
        const entry = dirMap.get(route)
        const overrideCount = p.modelOverrides && typeof p.modelOverrides === 'object' ? Object.keys(p.modelOverrides).length : 0
        const item = {
          provider: route,
          displayName: (typeof p.displayName === 'string' && p.displayName) || (entry ? entry.displayName : undefined) || route,
          declared: entry ? entry.declared === true : true,
          models,
          usesCatalog: !Array.isArray(p.models),
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
      let providers = {}
      try {
        const section = st.get(NS)
        if (section && typeof section === 'object' && section.providers && typeof section.providers === 'object') providers = section.providers
      } catch (e) {
        return { ok: false, error: String((e && e.message) || e) }
      }
      const profile = providers[route]
      if (!profile || typeof profile !== 'object') return { ok: false, error: '提供商 "' + route + '" 尚未配置,请先在 Models 页创建' }

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
          if (THINKING_LEVELS.indexOf(level) < 0) return { ok: false, error: '未知推理档位 "' + level + '"' }
          const wire = entry.reasoningEfforts[level]
          if (typeof wire !== 'string' || !wire.trim()) return { ok: false, error: '推理档位 "' + level + '" 需要填写 wire 值,或取消勾选该档位' }
          efforts[level] = wire.trim()
          hasThinking = true
        }
        if (Object.keys(efforts).length === 0) return { ok: false, error: '推理档位为空:请至少勾选一个档位,或选择「非推理模型」' }
        if (!hasThinking) return { ok: false, error: '推理档位必须包含至少一个非 off 档位' }
        built.reasoningEfforts = efforts
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
        if (!base.length) return { ok: false, error: '无法读取提供商 "' + route + '" 的现有模型列表,已中止(避免覆盖整个模型目录)' }
      }
      const idx = base.findIndex((m) => m.id === id)
      if (idx >= 0) {
        if (args.overwrite !== true) return { ok: false, error: '模型 "' + id + '" 已存在;请勾选「覆盖现有同名模型」后重试' }
        base[idx] = built
      } else {
        base.push(built)
      }

      // The sandbox runs in its own vm realm: plain objects built here carry the
      // sandbox Object.prototype, which main-realm isPlainObject checks reject.
      // Rebuild the whole mutate payload onto a host-realm prototype template
      // (the wire-decoded args object) before handing it to settings.mutate.
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
  },
}
