/**
 * 模型配置同步 (Model Config Sync) — Client 半区
 *
 * 这是动态 Cordis 插件的浏览器端源码:即 cordis_define 的 `code.client` 参数
 * (一个普通 JS 函数体,返回 Cordis Plugin 对象)。
 *
 * 使用方法:在 DSH 会话中 cordis_define 时,将本文件内容(不含本注释块)
 * 原样粘贴为 `code.client`;src/host.js 粘贴为 `code.host`,然后 cordis_run 激活。
 *
 * 对应运行时:pluginId mcfg-1,packageId pkg-8(当前稳定版本)。
 *
 * 依赖 Client 服务(均通过 ctx.get 可选读取):
 *   - locale : zh/en 词典注册与翻译绑定
 *   - slots  : settings.section 插槽注册(设置页导航条目)
 *   - styles / React / host : 内置符号
 *
 * 页面结构:
 *   ① 预设模型(可选,快速填充) → ② 目标自定义提供商 → ③ 模型配置(可编辑)
 *   预览写入内容 → 应用配置(host.call('apply-model-config'))
 */
return {
  apply(ctx) {
    const NS = 'settings.model-config-sync'
    const el = React.createElement
    const THINKING_LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']

    const locale = ctx.get('locale')
    if (locale !== undefined) {
      ctx.effect(() => locale.register(NS, {
        zh: {
          nav: '模型配置同步',
          title: '模型配置同步',
          intro: '把已安装目录(预设)中某个模型的上下文、输出上限与推理档位配置,应用到已配置的自定义提供商上——新模型发布而目录未更新时,不必手查字段。也可以不选预设,直接手动填写模型配置(高级配置器)。',
          readOnly: '当前设置为只读,无法写入。',
          sourceTitle: '① 预设模型(可选,用于快速填充)',
          sourceOptionalHint: '未选择预设:可直接在下方③卡片手动填写模型配置(高级模式),或选择预设快速填充。',
          clearSource: '清除预设,手动填写',
          sourceProvider: '预设提供商',
          sourceProviderPlaceholder: '选择预设提供商(可跳过)',
          sourceModel: '预设模型',
          sourceModelPlaceholder: '选择预设模型',
          loading: '加载中…',
          presetInfo: '预设模型信息',
          context: '上下文窗口',
          output: '最大输出',
          modalities: '输入模态',
          reasoningLevels: '推理档位',
          unknownReasoning: '无可用推理档位信息',
          configuredTag: '已配置',
          customTag: '自定义',
          targetTitle: '② 目标自定义提供商',
          targetRoute: '目标提供商',
          targetRoutePlaceholder: '选择已配置的提供商',
          targetModels: '模型 ID(可输入新模型,或从现有模型中选择)',
          catalogRouteNote: '该提供商当前使用内置目录;应用后会自动转为显式模型列表,并保留全部目录模型。',
          overridesNote: '该提供商带有模型覆盖(modelOverrides);应用时会自动将其合并进显式模型列表,不会丢失。',
          emptyTargets: '暂无已配置的提供商。请先在 Models 页配置提供商(可新建自定义提供商)。',
          entryTitle: '③ 要应用的模型配置(可编辑)',
          entryId: '模型 ID',
          entryName: '显示名称',
          contextWindowField: '上下文窗口 (tokens;留空使用路由默认 262144)',
          maxTokensField: '最大输出 (tokens;留空使用路由默认 32768)',
          inputField: '输入模态',
          reasoningField: '推理档位',
          reasoningMode: '推理模式',
          reasoningModeLevels: '启用推理(按档位)',
          reasoningModeOff: '非推理模型(reasoningEfforts: false)',
          reasoningHint: 'wire 值即请求发送的 reasoning_effort 参数。档位名与网关取值不一致时请按预设模型实际情况修改(如 deepseek 系列的 minimal/low/medium 常留空);off 留空表示不发送。',
          addLevel: '添加档位',
          removeLevel: '移除',
          wirePlaceholder: 'wire 值(如 high)',
          wireOffHint: 'off:不发送',
          overwriteLabel: '覆盖现有同名模型',
          overwriteHint: '该模型 ID 已存在于目标提供商。',
          apply: '应用配置',
          applying: '应用中…',
          preview: '预览写入内容',
          statusOk: '已应用:模型 {model} 已写入提供商 {route}(共 {count} 个模型)。Models 页将自动刷新。',
          reasonEmpty: '推理档位为空:请至少勾选一个非 off 档位,或选择「非推理模型」。',
          needTarget: '请先选择目标提供商。',
        },
        en: {
          nav: 'Model Config Sync',
          title: 'Model Config Sync',
          intro: 'Apply a preset (installed catalog) model\'s context, max output and reasoning effort configuration to a configured custom provider, for models released before the catalog catches up. A preset is optional: configure the model by hand (advanced mode) without one.',
          readOnly: 'Settings are read-only; writes are disabled.',
          sourceTitle: '1. Preset model (optional, for quick fill)',
          sourceOptionalHint: 'No preset selected: configure the model by hand in card 3 (advanced mode), or pick a preset for quick fill.',
          clearSource: 'Clear preset, configure manually',
          sourceProvider: 'Preset provider',
          sourceProviderPlaceholder: 'Choose a preset provider (optional)',
          sourceModel: 'Preset model',
          sourceModelPlaceholder: 'Choose a preset model',
          loading: 'Loading…',
          presetInfo: 'Preset model info',
          context: 'Context window',
          output: 'Max output',
          modalities: 'Modalities',
          reasoningLevels: 'Reasoning levels',
          unknownReasoning: 'No reasoning info available',
          configuredTag: 'configured',
          customTag: 'custom',
          targetTitle: '2. Target custom provider',
          targetRoute: 'Target provider',
          targetRoutePlaceholder: 'Choose a configured provider',
          targetModels: 'Model id (type a new model, or pick an existing one)',
          catalogRouteNote: 'This provider currently serves the built-in catalog; applying converts it to an explicit model list keeping every catalog model.',
          overridesNote: 'This provider carries model overrides (modelOverrides); applying folds them into the explicit model list without loss.',
          emptyTargets: 'No configured providers yet. Configure one on the Models page first (custom providers can be created there).',
          entryTitle: '3. Model configuration to apply (editable)',
          entryId: 'Model id',
          entryName: 'Display name',
          contextWindowField: 'Context window (tokens; empty uses route default 262144)',
          maxTokensField: 'Max output (tokens; empty uses route default 32768)',
          inputField: 'Modalities',
          reasoningField: 'Reasoning efforts',
          reasoningMode: 'Reasoning mode',
          reasoningModeLevels: 'Reasoning (per level)',
          reasoningModeOff: 'Non-reasoning model (reasoningEfforts: false)',
          reasoningHint: 'wire is the reasoning_effort value sent on the wire. Adjust it when the gateway differs from the level name (e.g. deepseek-family minimal/low/medium are often empty); off with empty wire sends nothing.',
          addLevel: 'Add level',
          removeLevel: 'Remove',
          wirePlaceholder: 'wire value (e.g. high)',
          wireOffHint: 'off: send nothing',
          overwriteLabel: 'Overwrite the existing model with the same id',
          overwriteHint: 'This model id already exists on the target provider.',
          apply: 'Apply configuration',
          applying: 'Applying…',
          preview: 'Preview write',
          statusOk: 'Applied: model {model} written to provider {route} ({count} models total). The Models page refreshes automatically.',
          reasonEmpty: 'Reasoning efforts empty: check at least one non-off level, or choose non-reasoning.',
          needTarget: 'Choose a target provider first.',
        },
      }))
    }
    const t = locale !== undefined ? locale.bind(NS) : (key) => key

    styles.insert('\n.mcfg-page{display:flex;flex-direction:column;gap:16px;max-width:680px;padding:4px 2px 24px}' +
      '.mcfg-title{color:var(--dsw-alias-label-primary);font-size:16px;font-weight:500;line-height:24px;margin:0}' +
      '.mcfg-intro{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;margin:0}' +
      '.mcfg-card{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:14px 16px;display:flex;flex-direction:column;gap:12px}' +
      '.mcfg-cardTitle{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:20px;margin:0}' +
      '.mcfg-field{display:flex;flex-direction:column;gap:6px}' +
      '.mcfg-label{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:16px}' +
      '.mcfg-input{box-sizing:border-box;width:100%;height:32px;padding:0 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px}' +
      '.mcfg-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}' +
      '.mcfg-input:disabled{opacity:.55}' +
      '.mcfg-selectInput{appearance:auto}' +
      '.mcfg-shrink{width:auto;flex:none}' +
      '.mcfg-row{display:flex;flex-direction:row;gap:8px;align-items:center}' +
      '.mcfg-hint{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;margin:0}' +
      '.mcfg-note{color:var(--dsw-alias-state-warn-primary);font-size:12px;line-height:18px;margin:0}' +
      '.mcfg-info{display:flex;flex-direction:column;gap:4px;border-left:2px solid var(--dsw-alias-border-l1);padding-left:10px}' +
      '.mcfg-infoLine{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;margin:0}' +
      '.mcfg-btn{box-sizing:border-box;height:32px;padding:0 14px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;cursor:pointer}' +
      '.mcfg-btn:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-1))}' +
      '.mcfg-btnPrimary{box-sizing:border-box;height:32px;padding:0 16px;border-radius:8px;border:none;background:var(--dsw-alias-brand-primary);color:#fff;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer}' +
      '.mcfg-btnPrimary:disabled{opacity:.5;cursor:default}' +
      '.mcfg-check{display:flex;flex-direction:row;gap:8px;align-items:center;color:var(--dsw-alias-label-primary);font-size:13px;cursor:pointer}' +
      '.mcfg-statusOk{color:var(--dsw-alias-state-success-primary);font-size:13px;line-height:20px;margin:0}' +
      '.mcfg-statusErr{color:var(--dsw-alias-state-error-primary);font-size:13px;line-height:20px;margin:0}' +
      '.mcfg-code{background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:10px;font-family:ui-monospace,Consolas,monospace;font-size:12px;line-height:18px;white-space:pre-wrap;word-break:break-all;color:var(--dsw-alias-label-secondary);max-height:260px;overflow:auto;margin:0}')

    function buildEntry(form) {
      const e = { id: form.id.trim() }
      if (form.name && form.name.trim()) e.name = form.name.trim()
      const cw = Number(form.contextWindow)
      if (Number.isInteger(cw) && cw > 0) e.contextWindow = cw
      const mt = Number(form.maxTokens)
      if (Number.isInteger(mt) && mt > 0) e.maxTokens = mt
      const input = []
      if (form.inputText) input.push('text')
      if (form.inputImage) input.push('image')
      if (input.length) e.input = input
      if (form.reasoningMode === 'off') {
        e.reasoningEfforts = false
      } else {
        const efforts = {}
        for (const row of form.levels) {
          if (!row.on) continue
          if (row.level === 'off') { efforts.off = null; continue }
          const wire = String(row.wire || '').trim()
          if (wire) efforts[row.level] = wire
        }
        if (Object.keys(efforts).length) e.reasoningEfforts = efforts
      }
      return e
    }

    function ModelConfigSyncPage(props) {
      const [boot, setBoot] = React.useState({ providers: [], targets: [], writable: true, error: '' })
      const [sourceProvider, setSourceProvider] = React.useState('')
      const [sourceModels, setSourceModels] = React.useState([])
      const [sourceModel, setSourceModel] = React.useState('')
      const [presetInfo, setPresetInfo] = React.useState(null)
      const [busyModel, setBusyModel] = React.useState(false)
      const [targetRoute, setTargetRoute] = React.useState('')
      const [form, setForm] = React.useState({ id: '', name: '', contextWindow: '', maxTokens: '', inputText: true, inputImage: false, reasoningMode: 'off', levels: [] })
      const [overwrite, setOverwrite] = React.useState(false)
      const [busy, setBusy] = React.useState(false)
      const [status, setStatus] = React.useState(null)
      const [showPreview, setShowPreview] = React.useState(false)

      React.useEffect(() => {
        let alive = true
        Promise.all([host.call('preset-providers'), host.call('target-providers')])
          .then((results) => {
            if (!alive) return
            const a = results[0] || {}
            const b = results[1] || {}
            const errs = []
            if (a.ok !== true) errs.push(a.error || 'preset-providers failed')
            if (b.ok !== true) errs.push(b.error || 'target-providers failed')
            setBoot({
              providers: a.ok === true ? a.providers : [],
              targets: b.ok === true ? b.providers : [],
              writable: b.ok === true ? b.writable !== false : true,
              error: errs.join('; '),
            })
          })
          .catch((err) => { if (alive) setBoot((x) => ({ ...x, error: String((err && err.message) || err) })) })
        return () => { alive = false }
      }, [])

      const target = boot.targets.find((x) => x.provider === targetRoute) || null
      const targetModelIds = target ? [...new Set([...(target.models || []), ...(target.catalogModels || [])])] : []
      const exists = targetModelIds.includes(form.id.trim())

      const clearSource = () => {
        setSourceProvider('')
        setSourceModel('')
        setPresetInfo(null)
        setSourceModels([])
        setStatus(null)
      }

      const onSourceProvider = (value) => {
        setSourceProvider(value)
        setSourceModel('')
        setPresetInfo(null)
        setSourceModels([])
        setStatus(null)
        if (!value) return
        setBusyModel(true)
        host.call('preset-models', { provider: value })
          .then((r) => {
            if (!r || r.ok !== true) { setStatus({ kind: 'err', text: (r && r.error) || '读取预设模型失败' }); return }
            setSourceModels(r.models)
          })
          .catch((err) => setStatus({ kind: 'err', text: String((err && err.message) || err) }))
          .finally(() => setBusyModel(false))
      }

      const onPresetModel = (model) => {
        setSourceModel(model)
        setStatus(null)
        if (!model) { setPresetInfo(null); return }
        setBusyModel(true)
        host.call('preset-model-info', { provider: sourceProvider, model })
          .then((r) => {
            if (!r || r.ok !== true) { setStatus({ kind: 'err', text: (r && r.error) || '读取预设模型信息失败' }); return }
            const info = r.info
            setPresetInfo(info)
            const levels = (info.reasoning && info.reasoning.efforts && info.reasoning.efforts.length)
              ? info.reasoning.efforts.map((e) => ({ level: e.level, wire: e.level === 'off' ? '' : e.level, on: true }))
              : []
            setForm({
              id: model,
              name: info.name || model,
              contextWindow: info.contextWindow ? String(info.contextWindow) : '',
              maxTokens: info.maxTokens ? String(info.maxTokens) : '',
              inputText: !info.input || info.input.includes('text'),
              inputImage: !!(info.input && info.input.includes('image')),
              reasoningMode: levels.length ? 'levels' : 'off',
              levels,
            })
            setOverwrite(false)
          })
          .catch((err) => setStatus({ kind: 'err', text: String((err && err.message) || err) }))
          .finally(() => setBusyModel(false))
      }

      const apply = () => {
        const id = form.id.trim()
        if (!targetRoute) { setStatus({ kind: 'err', text: t('needTarget') }); return }
        if (!id) { setStatus({ kind: 'err', text: t('entryId') + '?' }); return }
        const entry = buildEntry(form)
        if (form.reasoningMode === 'levels' && !entry.reasoningEfforts) {
          setStatus({ kind: 'err', text: t('reasonEmpty') }); return
        }
        setBusy(true)
        setStatus(null)
        host.call('apply-model-config', { route: targetRoute, entry, overwrite: overwrite === true })
          .then((r) => {
            if (!r || r.ok !== true) { setStatus({ kind: 'err', text: (r && r.error) || '应用失败' }); return }
            setStatus({ kind: 'ok', text: t('statusOk').replace('{model}', r.model).replace('{route}', r.route).replace('{count}', String(r.count)) })
            setOverwrite(false)
            host.call('target-providers').then((b) => { if (b && b.ok === true) setBoot((x) => ({ ...x, targets: b.providers })) }).catch(() => {})
          })
          .catch((err) => setStatus({ kind: 'err', text: String((err && err.message) || err) }))
          .finally(() => setBusy(false))
      }

      const set = (patch) => setForm((f) => ({ ...f, ...patch }))
      const setLevel = (index, patch) => setForm((f) => ({
        ...f,
        levels: f.levels.map((row, i) => (i === index ? { ...row, ...patch } : row)),
      }))
      const removeLevel = (index) => setForm((f) => ({ ...f, levels: f.levels.filter((_, i) => i !== index) }))
      const addLevel = () => setForm((f) => ({ ...f, levels: [...f.levels, { level: 'low', wire: '', on: true }] }))

      const previewEntry = targetRoute ? buildEntry(form) : null

      return el('div', { className: 'mcfg-page' },
        el('h2', { className: 'mcfg-title' }, t('title')),
        el('p', { className: 'mcfg-intro' }, t('intro')),
        boot.error ? el('p', { className: 'mcfg-statusErr' }, boot.error) : null,
        boot.writable === false ? el('p', { className: 'mcfg-hint' }, t('readOnly')) : null,

        el('section', { className: 'mcfg-card' },
          el('h3', { className: 'mcfg-cardTitle' }, t('sourceTitle')),
          !sourceProvider ? el('p', { className: 'mcfg-hint' }, t('sourceOptionalHint')) : null,
          el('div', { className: 'mcfg-row' },
            el('div', { className: 'mcfg-field', style: { flex: '1' } },
              el('span', { className: 'mcfg-label' }, t('sourceProvider')),
              el('select', { className: 'mcfg-input mcfg-selectInput', value: sourceProvider, disabled: busyModel, onChange: (e) => onSourceProvider(e.target.value) },
                el('option', { value: '' }, t('sourceProviderPlaceholder')),
                boot.providers.map((p) => el('option', { key: p.provider, value: p.provider },
                  p.displayName + (p.configured ? ' · ' + t('configuredTag') : '') + (p.declared ? ' · ' + t('customTag') : ''))),
              ),
            ),
            sourceProvider ? el('button', { type: 'button', className: 'mcfg-btn mcfg-shrink', onClick: clearSource }, t('clearSource')) : null,
          ),
          sourceProvider ? el('div', { className: 'mcfg-field' },
            el('span', { className: 'mcfg-label' }, t('sourceModel')),
            el('select', { className: 'mcfg-input mcfg-selectInput', value: sourceModel, disabled: busyModel, onChange: (e) => onPresetModel(e.target.value) },
              el('option', { value: '' }, t('sourceModelPlaceholder')),
              sourceModels.map((m) => el('option', { key: m.id, value: m.id }, m.name)),
            ),
            busyModel ? el('span', { className: 'mcfg-hint' }, t('loading')) : null,
          ) : null,
          presetInfo ? el('div', { className: 'mcfg-info' },
            el('p', { className: 'mcfg-infoLine' }, t('context') + ': ' + (presetInfo.contextWindow ? String(presetInfo.contextWindow) : '—')),
            el('p', { className: 'mcfg-infoLine' }, t('output') + ': ' + (presetInfo.maxTokens ? String(presetInfo.maxTokens) : '—')),
            el('p', { className: 'mcfg-infoLine' }, t('modalities') + ': ' + ((presetInfo.input && presetInfo.input.length) ? presetInfo.input.join(', ') : 'text')),
            el('p', { className: 'mcfg-infoLine' }, t('reasoningLevels') + ': ' + (presetInfo.reasoning ? presetInfo.reasoning.efforts.map((e) => e.level).join(', ') : t('unknownReasoning'))),
          ) : null,
        ),

        el('section', { className: 'mcfg-card' },
          el('h3', { className: 'mcfg-cardTitle' }, t('targetTitle')),
          el('div', { className: 'mcfg-field' },
            el('span', { className: 'mcfg-label' }, t('targetRoute')),
            el('select', { className: 'mcfg-input mcfg-selectInput', value: targetRoute, onChange: (e) => setTargetRoute(e.target.value) },
              el('option', { value: '' }, t('targetRoutePlaceholder')),
              boot.targets.map((x) => el('option', { key: x.provider, value: x.provider }, x.displayName + (x.declared ? ' · ' + t('customTag') : ''))),
            ),
            boot.targets.length === 0 ? el('p', { className: 'mcfg-hint' }, t('emptyTargets')) : null,
          ),
          target ? el('div', { className: 'mcfg-field' },
            el('span', { className: 'mcfg-label' }, t('targetModels')),
            el('input', {
              className: 'mcfg-input',
              list: 'mcfg-model-ids',
              value: form.id,
              placeholder: 'deepseek-v5',
              onChange: (e) => { set({ id: e.target.value }); setOverwrite(false) },
            }),
            el('datalist', { id: 'mcfg-model-ids' }, targetModelIds.map((id) => el('option', { key: id, value: id }))),
            target.usesCatalog ? el('p', { className: 'mcfg-note' }, t('catalogRouteNote')) : null,
            target.hasModelOverrides ? el('p', { className: 'mcfg-note' }, t('overridesNote')) : null,
            target.models.length ? el('p', { className: 'mcfg-hint' }, t('targetRoute') + ' · ' + target.models.join(', ')) : null,
          ) : null,
        ),

        el('section', { className: 'mcfg-card' },
          el('h3', { className: 'mcfg-cardTitle' }, t('entryTitle')),
          el('div', { className: 'mcfg-row' },
            el('div', { className: 'mcfg-field', style: { flex: '1' } },
              el('span', { className: 'mcfg-label' }, t('entryId')),
              el('input', { className: 'mcfg-input', value: form.id, onChange: (e) => { set({ id: e.target.value }); setOverwrite(false) } }),
            ),
            el('div', { className: 'mcfg-field', style: { flex: '1' } },
              el('span', { className: 'mcfg-label' }, t('entryName')),
              el('input', { className: 'mcfg-input', value: form.name, onChange: (e) => set({ name: e.target.value }) }),
            ),
          ),
          el('div', { className: 'mcfg-row' },
            el('div', { className: 'mcfg-field', style: { flex: '1' } },
              el('span', { className: 'mcfg-label' }, t('contextWindowField')),
              el('input', { className: 'mcfg-input', type: 'number', min: '1', value: form.contextWindow, onChange: (e) => set({ contextWindow: e.target.value }) }),
            ),
            el('div', { className: 'mcfg-field', style: { flex: '1' } },
              el('span', { className: 'mcfg-label' }, t('maxTokensField')),
              el('input', { className: 'mcfg-input', type: 'number', min: '1', value: form.maxTokens, onChange: (e) => set({ maxTokens: e.target.value }) }),
            ),
          ),
          el('div', { className: 'mcfg-field' },
            el('span', { className: 'mcfg-label' }, t('inputField')),
            el('div', { className: 'mcfg-row' },
              el('label', { className: 'mcfg-check' }, el('input', { type: 'checkbox', checked: form.inputText, onChange: (e) => set({ inputText: e.target.checked }) }), 'text'),
              el('label', { className: 'mcfg-check' }, el('input', { type: 'checkbox', checked: form.inputImage, onChange: (e) => set({ inputImage: e.target.checked }) }), 'image'),
            ),
          ),
          el('div', { className: 'mcfg-field' },
            el('span', { className: 'mcfg-label' }, t('reasoningField')),
            el('select', { className: 'mcfg-input mcfg-selectInput', value: form.reasoningMode, onChange: (e) => set({ reasoningMode: e.target.value }) },
              el('option', { value: 'off' }, t('reasoningModeOff')),
              el('option', { value: 'levels' }, t('reasoningModeLevels')),
            ),
            form.reasoningMode === 'levels' ? el('div', { className: 'mcfg-field' },
              form.levels.map((row, i) => el('div', { key: i, className: 'mcfg-row' },
                el('label', { className: 'mcfg-check' }, el('input', { type: 'checkbox', checked: row.on === true, onChange: (e) => setLevel(i, { on: e.target.checked }) })),
                el('select', { className: 'mcfg-input mcfg-selectInput mcfg-shrink', value: row.level, onChange: (e) => setLevel(i, { level: e.target.value }) },
                  THINKING_LEVELS.map((l) => el('option', { key: l, value: l }, l)),
                ),
                el('input', { className: 'mcfg-input', value: row.wire, placeholder: row.level === 'off' ? t('wireOffHint') : t('wirePlaceholder'), onChange: (e) => setLevel(i, { wire: e.target.value }) }),
                el('button', { type: 'button', className: 'mcfg-btn mcfg-shrink', 'aria-label': t('removeLevel'), onClick: () => removeLevel(i) }, '×'),
              )),
              el('div', { className: 'mcfg-row' },
                el('button', { type: 'button', className: 'mcfg-btn', onClick: addLevel }, '+ ' + t('addLevel')),
              ),
              el('p', { className: 'mcfg-hint' }, presetInfo && !(presetInfo.reasoning && presetInfo.reasoning.efforts.length) ? t('unknownReasoning') : t('reasoningHint')),
            ) : null,
          ),
          exists ? el('div', { className: 'mcfg-field' },
            el('p', { className: 'mcfg-note' }, t('overwriteHint')),
            el('label', { className: 'mcfg-check' }, el('input', { type: 'checkbox', checked: overwrite, onChange: (e) => setOverwrite(e.target.checked) }), t('overwriteLabel')),
          ) : null,
        ),

        el('div', { className: 'mcfg-row' },
          el('button', { type: 'button', className: 'mcfg-btnPrimary', disabled: busy || boot.writable === false || !target, onClick: apply }, busy ? t('applying') : t('apply')),
          el('button', { type: 'button', className: 'mcfg-btn', onClick: () => setShowPreview(!showPreview) }, t('preview')),
        ),
        showPreview && previewEntry ? el('pre', { className: 'mcfg-code' }, JSON.stringify(previewEntry, null, 2)) : null,
        status ? el('p', { className: status.kind === 'ok' ? 'mcfg-statusOk' : 'mcfg-statusErr', role: 'status', 'aria-live': 'polite' }, status.text) : null,
      )
    }

    const slots = ctx.get('slots')
    if (slots === undefined) return
    slots.inject('settings.section', () => slots.register(
      { name: 'settings.section', id: 'model-config-sync', order: 11, label: () => t('nav') },
      () => el(ModelConfigSyncPage, { t }),
    ))
  },
}
