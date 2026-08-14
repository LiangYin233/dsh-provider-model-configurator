/**
 * dsh-provider-model-configurator client bundle: the "Provider Model Configurator" settings page.
 *
 * This file is the built client artifact consumed by the web shell: the Node
 * half of dsh-client-modules resolves `exports["./client"]` and serves this
 * file raw under /plugins/dsh-provider-model-configurator/client.js. The ModuleLoader
 * contract executes the bundle as a lazy CJS factory — `require` walks the
 * shell's static registry first (react, @deepseek-ai/cordis, ...), so this
 * bundle is self-contained: only `react` is required, everything else is
 * inline.
 *
 * The page registers into the `settings.section` slot (the official Models
 * page sits beside it, zero intrusion), reads preset model metadata and
 * writes explicit model entries through the host `modelConfigurator` Typert
 * Remote namespace. zh/en dictionaries via ctx.locale.
 *
 * Invocation descriptors below mirror lib/contract.js — keep them in sync.
 */
window.__ModuleLoader__.load({
  id: 'dsh-provider-model-configurator',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    var React = require('react')

    // ---- shared contract (keep in sync with lib/contract.js) ----
    var NS = 'settings.provider-model-configurator'
    var THINKING_LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']

    function schema(parse) { return { parse: parse } }
    var stringSchema = schema(function (v) {
      if (typeof v !== 'string') throw new TypeError('expected a string')
      return v
    })
    var booleanSchema = schema(function (v) {
      if (typeof v !== 'boolean') throw new TypeError('expected a boolean')
      return v
    })
    var objectSchema = schema(function (v) {
      if (v === null || typeof v !== 'object' || Array.isArray(v)) throw new TypeError('expected an object')
      return v
    })
    var resultEnvelopeSchema = schema(function (v) {
      if (v === null || typeof v !== 'object' || typeof v.ok !== 'boolean') throw new TypeError('expected an { ok, ... } envelope')
      return v
    })

    function codec(name, sch) { return { mode: 'strict', typeSymbol: 'dsh-provider-model-configurator#' + name, schema: sch } }
    function stringParam(name) {
      return { name: name, wire: name, source: 'json', codec: codec('String', stringSchema) }
    }

    var INVOCATIONS = [
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

    // ---- dictionaries ----
    var zh = {
      nav: '供应商模型配置器',
      title: '供应商模型配置器',
      intro: '集中管理已配置提供商下的模型配置:查看、新建、编辑、复制与删除模型条目(上下文窗口、最大输出、输入模态、推理档位)。可借助 pi-ai 安装目录(预设)或任意其他提供商的模型数据快速填充——新模型发布而目录未更新时,不必手查字段。',
      readOnly: '当前设置为只读,无法写入。',
      remotePending: '远程服务尚未就绪,请稍候…',
      sourceTitle: '复制来源(可选,用于快速填充)',
      sourceOptionalHint: '未选择复制来源:可直接在下方③卡片手动填写模型配置(高级模式),或选择来源快速填充。',
      clearSource: '清除来源,手动填写',
      sourceProvider: '复制来源提供商',
      sourceProviderPlaceholder: '选择提供商(预设目录 / 已配置,可跳过)',
      sourceModel: '来源模型',
      sourceModelPlaceholder: '选择模型',
      loading: '加载中…',
      presetInfo: '来源模型信息',
      context: '上下文窗口',
      output: '最大输出',
      modalities: '输入模态',
      reasoningLevels: '推理档位',
      unknownReasoning: '无可用推理档位信息',
      configuredTag: '已配置',
      customTag: '自定义',
      targetTitle: '② 目标提供商 · 模型管理',
      targetRoute: '目标提供商',
      targetRoutePlaceholder: '选择已配置的提供商',
      targetModels: '模型 ID(可输入新模型,或从下方列表/现有模型中选择)',
      modelListTitle: '该提供商的模型(编辑 = 载入配置,删除 = 移除条目)',
      editModel: '编辑',
      deleteModel: '删除',
      deleteConfirm: '确定删除模型「{model}」吗?此操作会立即写入设置。',
      statusDeleted: '已删除模型 {model}(提供商 {route} 剩余 {count} 个模型)',
      statusDeletedCatalog: '已删除模型 {model};该提供商已恢复使用内置目录。',
      catalogModelsHint: '内置目录模型(只读):',
      noExplicitModels: '该提供商暂无显式模型条目:在下方输入模型 ID 并「应用配置」即可添加。',
      catalogRouteNote: '该提供商当前使用内置目录;应用后会自动转为显式模型列表,并保留全部目录模型。',
      overridesNote: '该提供商带有模型覆盖(modelOverrides);应用时会自动将其合并进显式模型列表,不会丢失。',
      emptyTargets: '暂无已配置的提供商。请先在 Models 页配置提供商(可新建自定义提供商)。',
      entryTitle: '③ 模型配置(新建 / 编辑)',
      entryId: '模型 ID',
      entryName: '显示名称',
      contextWindowField: '上下文窗口 (tokens;留空使用路由默认 262144)',
      maxTokensField: '最大输出 (tokens;留空使用路由默认 32768)',
      inputField: '输入模态',
      reasoningField: '推理档位',
      reasoningMode: '推理模式',
      reasoningModeLevels: '启用推理(按档位)',
      reasoningModeOff: '非推理模型(reasoningEfforts: false)',
      reasoningHint: 'wire 值即请求发送的 reasoning_effort 参数。档位名与网关取值不一致时请按来源模型实际情况修改(如 deepseek 系列的 minimal/low/medium 常留空);off 留空表示不发送。',
      addLevel: '添加档位',
      removeLevel: '移除',
      wirePlaceholder: 'wire 值(如 high)',
      wireOffHint: 'off:不发送',
      overwriteLabel: '覆盖现有同名模型',
      overwriteHint: '该模型 ID 已存在于目标提供商。',
      loadedHint: '已载入该模型的当前配置,可修改后重新应用;未编辑的字段会保留。',
      apply: '应用配置',
      applying: '应用中…',
      preview: '预览写入内容',
      statusOk: '已应用:模型 {model} 已写入提供商 {route}(共 {count} 个模型)。Models 页将自动刷新。',
      reasonEmpty: '推理档位为空:请至少勾选一个非 off 档位,或选择「非推理模型」。',
      needTarget: '请先选择目标提供商。',
    }
    var en = {
      nav: 'Provider Model Configurator',
      title: 'Provider Model Configurator',
      intro: "Manage model configurations across your configured providers in one place: view, create, edit, copy and delete model entries (context window, max output, input modalities, reasoning efforts). Quick-fill from the pi-ai installed catalog (preset) or any other provider — no need to look fields up by hand while the catalog lags new releases.",
      readOnly: 'Settings are read-only; writes are disabled.',
      remotePending: 'Remote service is not ready yet…',
      sourceTitle: 'Copy source (optional, for quick fill)',
      sourceOptionalHint: 'No copy source selected: configure the model by hand in card 3 (advanced mode), or pick a source for quick fill.',
      clearSource: 'Clear source, configure manually',
      sourceProvider: 'Copy source provider',
      sourceProviderPlaceholder: 'Choose a provider (preset catalog / configured, optional)',
      sourceModel: 'Source model',
      sourceModelPlaceholder: 'Choose a model',
      loading: 'Loading…',
      presetInfo: 'Source model info',
      context: 'Context window',
      output: 'Max output',
      modalities: 'Modalities',
      reasoningLevels: 'Reasoning levels',
      unknownReasoning: 'No reasoning info available',
      configuredTag: 'configured',
      customTag: 'custom',
      targetTitle: '2. Target provider · model management',
      targetRoute: 'Target provider',
      targetRoutePlaceholder: 'Choose a configured provider',
      targetModels: 'Model id (type a new model, or pick one from the list below)',
      modelListTitle: 'Models of this provider (edit = load the config, delete = remove the entry)',
      editModel: 'Edit',
      deleteModel: 'Delete',
      deleteConfirm: 'Delete model "{model}"? This writes to settings immediately.',
      statusDeleted: 'Deleted model {model} from provider {route} ({count} models left).',
      statusDeletedCatalog: 'Deleted model {model}; the provider now serves the built-in catalog again.',
      catalogModelsHint: 'Catalog models (read-only):',
      noExplicitModels: 'No explicit model entries on this provider yet: type a model id below and hit Apply to add one.',
      catalogRouteNote: 'This provider currently serves the built-in catalog; applying converts it to an explicit model list keeping every catalog model.',
      overridesNote: 'This provider carries model overrides (modelOverrides); applying folds them into the explicit model list without loss.',
      emptyTargets: 'No configured providers yet. Configure one on the Models page first (custom providers can be created there).',
      entryTitle: '3. Model configuration (create / edit)',
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
      loadedHint: "Loaded the model's current configuration — edit and re-apply; untouched fields are kept.",
      apply: 'Apply configuration',
      applying: 'Applying…',
      preview: 'Preview write',
      statusOk: 'Applied: model {model} written to provider {route} ({count} models total). The Models page refreshes automatically.',
      reasonEmpty: 'Reasoning efforts empty: check at least one non-off level, or choose non-reasoning.',
      needTarget: 'Choose a target provider first.',
    }

    // ---- styles (document-based; the bundle owns one fixed-id tag) ----
    var STYLE_ID = 'dsh-provider-model-configurator-styles'
    var CSS = '.mcfg-page{display:flex;flex-direction:column;gap:16px;max-width:680px;padding:4px 2px 24px}' +
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
      '.mcfg-divider{border-top:1px solid var(--dsw-alias-border-l1);padding-top:12px;margin-top:4px}' +
      '.mcfg-info{display:flex;flex-direction:column;gap:4px;border-left:2px solid var(--dsw-alias-border-l1);padding-left:10px}' +
      '.mcfg-infoLine{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;margin:0}' +
      '.mcfg-btn{box-sizing:border-box;height:32px;padding:0 14px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;cursor:pointer}' +
      '.mcfg-btn:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-1))}' +
      '.mcfg-btnPrimary{box-sizing:border-box;height:32px;padding:0 16px;border-radius:8px;border:none;background:var(--dsw-alias-brand-primary);color:#fff;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer}' +
      '.mcfg-btnPrimary:disabled{opacity:.5;cursor:default}' +
      '.mcfg-check{display:flex;flex-direction:row;gap:8px;align-items:center;color:var(--dsw-alias-label-primary);font-size:13px;cursor:pointer}' +
      '.mcfg-statusOk{color:var(--dsw-alias-state-success-primary);font-size:13px;line-height:20px;margin:0}' +
      '.mcfg-statusErr{color:var(--dsw-alias-state-error-primary);font-size:13px;line-height:20px;margin:0}' +
      '.mcfg-code{background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:10px;font-family:ui-monospace,Consolas,monospace;font-size:12px;line-height:18px;white-space:pre-wrap;word-break:break-all;color:var(--dsw-alias-label-secondary);max-height:260px;overflow:auto;margin:0}'

    function adoptStyles() {
      if (document.getElementById(STYLE_ID) !== null) return
      var style = document.createElement('style')
      style.id = STYLE_ID
      style.textContent = CSS
      document.head.appendChild(style)
    }

    // ---- helpers ----
    function buildEntry(form) {
      var e = { id: form.id.trim() }
      if (form.name && form.name.trim()) e.name = form.name.trim()
      var cw = Number(form.contextWindow)
      if (Number.isInteger(cw) && cw > 0) e.contextWindow = cw
      var mt = Number(form.maxTokens)
      if (Number.isInteger(mt) && mt > 0) e.maxTokens = mt
      var input = []
      if (form.inputText) input.push('text')
      if (form.inputImage) input.push('image')
      if (input.length) e.input = input
      if (form.reasoningMode === 'off') {
        e.reasoningEfforts = false
      } else {
        var efforts = {}
        for (var i = 0; i < form.levels.length; i++) {
          var row = form.levels[i]
          if (!row.on) continue
          if (row.level === 'off') { efforts.off = null; continue }
          var wire = String(row.wire || '').trim()
          if (wire) efforts[row.level] = wire
        }
        if (Object.keys(efforts).length) e.reasoningEfforts = efforts
      }
      return e
    }

    /**
     * Convert one existing model entry (as stored in the target provider's
     * settings) back into editable form state, so editing an already
     * configured model starts from its current configuration.
     */
    function entryToForm(entry) {
      var reasoningMode = 'off'
      var levels = []
      if (entry.reasoningEfforts && typeof entry.reasoningEfforts === 'object' && !Array.isArray(entry.reasoningEfforts)) {
        var keys = Object.keys(entry.reasoningEfforts)
        if (keys.length) {
          reasoningMode = 'levels'
          levels = keys.map(function (level) {
            var wire = entry.reasoningEfforts[level]
            return {
              level: level,
              wire: level === 'off' ? '' : (typeof wire === 'string' ? wire : ''),
              on: true,
            }
          })
        }
      }
      var input = Array.isArray(entry.input) ? entry.input : []
      return {
        id: (typeof entry.id === 'string' ? entry.id : ''),
        name: (typeof entry.name === 'string' ? entry.name : '') || (typeof entry.id === 'string' ? entry.id : ''),
        contextWindow: entry.contextWindow ? String(entry.contextWindow) : '',
        maxTokens: entry.maxTokens ? String(entry.maxTokens) : '',
        inputText: !input.length || input.indexOf('text') >= 0,
        inputImage: input.indexOf('image') >= 0,
        reasoningMode: reasoningMode,
        levels: levels,
      }
    }

    /** One-line summary of an existing model entry for the provider model list. */
    function modelSummary(entry) {
      var parts = []
      if (typeof entry.name === 'string' && entry.name && entry.name !== entry.id) parts.push(entry.name)
      if (entry.contextWindow) parts.push('ctx ' + entry.contextWindow)
      if (entry.maxTokens) parts.push('out ' + entry.maxTokens)
      if (Array.isArray(entry.input) && entry.input.length) parts.push('input: ' + entry.input.join('+'))
      if (entry.reasoningEfforts && typeof entry.reasoningEfforts === 'object' && !Array.isArray(entry.reasoningEfforts)) {
        var keys = Object.keys(entry.reasoningEfforts)
        if (keys.length) parts.push('reasoning: ' + keys.join(','))
      }
      return parts.length ? parts.join(' · ') : '—'
    }

    function ModelConfiguratorPage(props) {
      var el = React.createElement
      var t = props.t
      var call = props.call
      var useState = React.useState
      var useEffect = React.useEffect

      var bootState = useState({ providers: [], targets: [], writable: true, error: '' })
      var boot = bootState[0]
      var setBoot = bootState[1]
      var sourceProviderState = useState('')
      var sourceProvider = sourceProviderState[0]
      var setSourceProvider = sourceProviderState[1]
      var sourceModelsState = useState([])
      var sourceModels = sourceModelsState[0]
      var setSourceModels = sourceModelsState[1]
      var sourceModelState = useState('')
      var sourceModel = sourceModelState[0]
      var setSourceModel = sourceModelState[1]
      var presetInfoState = useState(null)
      var presetInfo = presetInfoState[0]
      var setPresetInfo = presetInfoState[1]
      var busyModelState = useState(false)
      var busyModel = busyModelState[0]
      var setBusyModel = busyModelState[1]
      var targetRouteState = useState('')
      var targetRoute = targetRouteState[0]
      var setTargetRoute = targetRouteState[1]
      var formState = useState({ id: '', name: '', contextWindow: '', maxTokens: '', inputText: true, inputImage: false, reasoningMode: 'off', levels: [] })
      var form = formState[0]
      var setForm = formState[1]
      var overwriteState = useState(false)
      var overwrite = overwriteState[0]
      var setOverwrite = overwriteState[1]
      var loadedEntryIdState = useState('')
      var loadedEntryId = loadedEntryIdState[0]
      var setLoadedEntryId = loadedEntryIdState[1]
      var deletingState = useState(false)
      var deleting = deletingState[0]
      var setDeleting = deletingState[1]
      var busyState = useState(false)
      var busy = busyState[0]
      var setBusy = busyState[1]
      var statusState = useState(null)
      var status = statusState[0]
      var setStatus = statusState[1]
      var showPreviewState = useState(false)
      var showPreview = showPreviewState[0]
      var setShowPreview = showPreviewState[1]

      useEffect(function () {
        var alive = true
        Promise.all([call('presetProviders'), call('targetProviders')])
          .then(function (results) {
            if (!alive) return
            var a = results[0] || {}
            var b = results[1] || {}
            var errs = []
            if (a.ok !== true) errs.push(a.error || 'presetProviders failed')
            if (b.ok !== true) errs.push(b.error || 'targetProviders failed')
            setBoot({
              providers: a.ok === true ? a.providers : [],
              targets: b.ok === true ? b.providers : [],
              writable: b.ok === true ? b.writable !== false : true,
              error: errs.join('; '),
            })
          })
          .catch(function (err) { if (alive) setBoot(function (x) { return Object.assign({}, x, { error: String((err && err.message) || err) }) }) })
        return function () { alive = false }
      }, [])

      var target = null
      for (var i = 0; i < boot.targets.length; i++) {
        if (boot.targets[i].provider === targetRoute) { target = boot.targets[i]; break }
      }
      var targetModelIds = []
      if (target) {
        var seen = {}
        for (var j = 0; j < (target.models || []).length; j++) {
          var mid = target.models[j]
          if (!seen[mid]) { seen[mid] = true; targetModelIds.push(mid) }
        }
        for (var k = 0; k < (target.catalogModels || []).length; k++) {
          var cid = target.catalogModels[k]
          if (!seen[cid]) { seen[cid] = true; targetModelIds.push(cid) }
        }
      }
      var exists = targetModelIds.indexOf(form.id.trim()) >= 0

      /**
       * Load one existing model entry's current configuration into the form
       * (shared by the id-input match and the list's Edit button).
       */
      var loadEntry = function (entry) {
        setForm(entryToForm(entry))
        setLoadedEntryId(entry.id)
        setOverwrite(false)
        setStatus(null)
      }

      /**
       * When the typed model id matches an already-configured model on the
       * target provider, load its current configuration into the form (once
       * per id — later edits are kept). Changing the id to a new value keeps
       * the loaded fields, which doubles as "copy this model to a new id".
       */
      var onIdChange = function (value) {
        var id = value.trim()
        set({ id: value })
        setOverwrite(false)
        if (!target || !id) { setLoadedEntryId(''); return }
        var found = null
        for (var i = 0; i < (target.entries || []).length; i++) {
          var e = target.entries[i]
          if (e && e.id === id) { found = e; break }
        }
        if (found && found.id !== loadedEntryId) {
          loadEntry(found)
        } else if (!found && loadedEntryId === id) {
          setLoadedEntryId('')
        }
      }

      /** Delete one explicit model entry after a confirm. */
      var removeModel = function (modelId) {
        if (deleting) return
        if (!window.confirm(t('deleteConfirm').replace('{model}', modelId))) return
        setDeleting(true)
        setStatus(null)
        call('deleteModel', targetRoute, modelId)
          .then(function (r) {
            if (!r || r.ok !== true) { setStatus({ kind: 'err', text: (r && r.error) || '删除失败' }); return }
            if (r.revertedToCatalog === true) {
              setStatus({ kind: 'ok', text: t('statusDeletedCatalog').replace('{model}', r.model).replace('{route}', r.route) })
            } else {
              setStatus({ kind: 'ok', text: t('statusDeleted').replace('{model}', r.model).replace('{route}', r.route).replace('{count}', String(r.count)) })
            }
            call('targetProviders').then(function (b) { if (b && b.ok === true) setBoot(function (x) { return Object.assign({}, x, { targets: b.providers }) }) }).catch(function () {})
          })
          .catch(function (err) { setStatus({ kind: 'err', text: String((err && err.message) || err) }) })
          .finally(function () { setDeleting(false) })
      }

      var clearSource = function () {
        setSourceProvider('')
        setSourceModel('')
        setPresetInfo(null)
        setSourceModels([])
        setStatus(null)
      }

      var onSourceProvider = function (value) {
        setSourceProvider(value)
        setSourceModel('')
        setPresetInfo(null)
        setSourceModels([])
        setStatus(null)
        if (!value) return
        setBusyModel(true)
        call('presetModels', value)
          .then(function (r) {
            if (!r || r.ok !== true) { setStatus({ kind: 'err', text: (r && r.error) || '读取预设模型失败' }); return }
            setSourceModels(r.models)
          })
          .catch(function (err) { setStatus({ kind: 'err', text: String((err && err.message) || err) }) })
          .finally(function () { setBusyModel(false) })
      }

      var onPresetModel = function (model) {
        setSourceModel(model)
        setStatus(null)
        if (!model) { setPresetInfo(null); return }
        setBusyModel(true)
        call('presetModelInfo', sourceProvider, model)
          .then(function (r) {
            if (!r || r.ok !== true) { setStatus({ kind: 'err', text: (r && r.error) || '读取预设模型信息失败' }); return }
            var info = r.info
            setPresetInfo(info)
            var levels = (info.reasoning && info.reasoning.efforts && info.reasoning.efforts.length)
              ? info.reasoning.efforts.map(function (e) { return { level: e.level, wire: e.level === 'off' ? '' : e.level, on: true } })
              : []
            setForm({
              id: model,
              name: info.name || model,
              contextWindow: info.contextWindow ? String(info.contextWindow) : '',
              maxTokens: info.maxTokens ? String(info.maxTokens) : '',
              inputText: !info.input || info.input.indexOf('text') >= 0,
              inputImage: !!(info.input && info.input.indexOf('image') >= 0),
              reasoningMode: levels.length ? 'levels' : 'off',
              levels: levels,
            })
            setOverwrite(false)
            setLoadedEntryId('')
          })
          .catch(function (err) { setStatus({ kind: 'err', text: String((err && err.message) || err) }) })
          .finally(function () { setBusyModel(false) })
      }

      var apply = function () {
        var id = form.id.trim()
        if (!targetRoute) { setStatus({ kind: 'err', text: t('needTarget') }); return }
        if (!id) { setStatus({ kind: 'err', text: t('entryId') + '?' }); return }
        var entry = buildEntry(form)
        if (form.reasoningMode === 'levels' && !entry.reasoningEfforts) {
          setStatus({ kind: 'err', text: t('reasonEmpty') }); return
        }
        setBusy(true)
        setStatus(null)
        call('applyModelConfig', targetRoute, entry, overwrite === true)
          .then(function (r) {
            if (!r || r.ok !== true) { setStatus({ kind: 'err', text: (r && r.error) || '应用失败' }); return }
            setStatus({ kind: 'ok', text: t('statusOk').replace('{model}', r.model).replace('{route}', r.route).replace('{count}', String(r.count)) })
            setOverwrite(false)
            call('targetProviders').then(function (b) { if (b && b.ok === true) setBoot(function (x) { return Object.assign({}, x, { targets: b.providers }) }) }).catch(function () {})
          })
          .catch(function (err) { setStatus({ kind: 'err', text: String((err && err.message) || err) }) })
          .finally(function () { setBusy(false) })
      }

      var set = function (patch) { setForm(function (f) { return Object.assign({}, f, patch) }) }
      var setLevel = function (index, patch) {
        setForm(function (f) {
          return Object.assign({}, f, {
            levels: f.levels.map(function (row, i) { return i === index ? Object.assign({}, row, patch) : row }),
          })
        })
      }
      var removeLevel = function (index) {
        setForm(function (f) { return Object.assign({}, f, { levels: f.levels.filter(function (_, i) { return i !== index }) }) })
      }
      var addLevel = function () {
        setForm(function (f) { return Object.assign({}, f, { levels: f.levels.concat([{ level: 'low', wire: '', on: true }]) }) })
      }

      var previewEntry = targetRoute ? buildEntry(form) : null

      return el('div', { className: 'mcfg-page' },
        el('h2', { className: 'mcfg-title' }, t('title')),
        el('p', { className: 'mcfg-intro' }, t('intro')),
        boot.error ? el('p', { className: 'mcfg-statusErr' }, boot.error) : null,
        boot.writable === false ? el('p', { className: 'mcfg-hint' }, t('readOnly')) : null,

        el('section', { className: 'mcfg-card' },
          el('h3', { className: 'mcfg-cardTitle' }, t('targetTitle')),
          el('div', { className: 'mcfg-field' },
            el('span', { className: 'mcfg-label' }, t('targetRoute')),
            el('select', { className: 'mcfg-input mcfg-selectInput', value: targetRoute, onChange: function (e) { setTargetRoute(e.target.value); setLoadedEntryId('') } },
              el('option', { value: '' }, t('targetRoutePlaceholder')),
              boot.targets.map(function (x) { return el('option', { key: x.provider, value: x.provider }, x.displayName + (x.declared ? ' · ' + t('customTag') : '')) }),
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
              onChange: function (e) { onIdChange(e.target.value) },
            }),
            el('datalist', { id: 'mcfg-model-ids' }, targetModelIds.map(function (id) { return el('option', { key: id, value: id }) })),
            target.usesCatalog ? el('p', { className: 'mcfg-note' }, t('catalogRouteNote')) : null,
            target.hasModelOverrides ? el('p', { className: 'mcfg-note' }, t('overridesNote')) : null,
          ) : null,
          target ? el('div', { className: 'mcfg-field' },
            el('span', { className: 'mcfg-label' }, t('modelListTitle')),
            target.entries.length ? target.entries.map(function (m) {
              return el('div', { key: m.id, className: 'mcfg-row' },
                el('div', { className: 'mcfg-field', style: { flex: '1' } },
                  el('span', { className: 'mcfg-label' }, m.id),
                  el('p', { className: 'mcfg-hint' }, modelSummary(m)),
                ),
                el('button', { type: 'button', className: 'mcfg-btn mcfg-shrink', onClick: function () { loadEntry(m) } }, t('editModel')),
                el('button', { type: 'button', className: 'mcfg-btn mcfg-shrink', disabled: deleting, onClick: function () { removeModel(m.id) } }, t('deleteModel')),
              )
            }) : (target.usesCatalog && target.catalogModels.length
              ? el('p', { className: 'mcfg-hint' }, t('catalogModelsHint') + ' ' + target.catalogModels.join(', '))
              : el('p', { className: 'mcfg-hint' }, t('noExplicitModels'))),
          ) : null,
          target ? el('div', { className: 'mcfg-field mcfg-divider' },
            el('span', { className: 'mcfg-label' }, t('sourceTitle')),
            !sourceProvider ? el('p', { className: 'mcfg-hint' }, t('sourceOptionalHint')) : null,
            el('div', { className: 'mcfg-row' },
              el('div', { className: 'mcfg-field', style: { flex: '1' } },
                el('select', { className: 'mcfg-input mcfg-selectInput', value: sourceProvider, disabled: busyModel, onChange: function (e) { onSourceProvider(e.target.value) } },
                  el('option', { value: '' }, t('sourceProviderPlaceholder')),
                  boot.providers.map(function (p) {
                    return el('option', { key: p.provider, value: p.provider },
                      p.displayName + (p.configured ? ' · ' + t('configuredTag') : '') + (p.declared ? ' · ' + t('customTag') : ''))
                  }),
                ),
              ),
              sourceProvider ? el('button', { type: 'button', className: 'mcfg-btn mcfg-shrink', onClick: clearSource }, t('clearSource')) : null,
            ),
            sourceProvider ? el('div', { className: 'mcfg-field' },
              el('select', { className: 'mcfg-input mcfg-selectInput', value: sourceModel, disabled: busyModel, onChange: function (e) { onPresetModel(e.target.value) } },
                el('option', { value: '' }, t('sourceModelPlaceholder')),
                sourceModels.map(function (m) { return el('option', { key: m.id, value: m.id }, m.name) }),
              ),
              busyModel ? el('span', { className: 'mcfg-hint' }, t('loading')) : null,
            ) : null,
            presetInfo ? el('div', { className: 'mcfg-info' },
              el('p', { className: 'mcfg-infoLine' }, t('context') + ': ' + (presetInfo.contextWindow ? String(presetInfo.contextWindow) : '—')),
              el('p', { className: 'mcfg-infoLine' }, t('output') + ': ' + (presetInfo.maxTokens ? String(presetInfo.maxTokens) : '—')),
              el('p', { className: 'mcfg-infoLine' }, t('modalities') + ': ' + ((presetInfo.input && presetInfo.input.length) ? presetInfo.input.join(', ') : 'text')),
              el('p', { className: 'mcfg-infoLine' }, t('reasoningLevels') + ': ' + (presetInfo.reasoning ? presetInfo.reasoning.efforts.map(function (e) { return e.level }).join(', ') : t('unknownReasoning'))),
            ) : null,
          ) : null,
        ),

        el('section', { className: 'mcfg-card' },
          el('h3', { className: 'mcfg-cardTitle' }, t('entryTitle')),
          loadedEntryId === form.id.trim() ? el('p', { className: 'mcfg-hint' }, t('loadedHint')) : null,
          el('div', { className: 'mcfg-row' },
            el('div', { className: 'mcfg-field', style: { flex: '1' } },
              el('span', { className: 'mcfg-label' }, t('entryId')),
              el('input', { className: 'mcfg-input', value: form.id, onChange: function (e) { onIdChange(e.target.value) } }),
            ),
            el('div', { className: 'mcfg-field', style: { flex: '1' } },
              el('span', { className: 'mcfg-label' }, t('entryName')),
              el('input', { className: 'mcfg-input', value: form.name, onChange: function (e) { set({ name: e.target.value }) } }),
            ),
          ),
          el('div', { className: 'mcfg-row' },
            el('div', { className: 'mcfg-field', style: { flex: '1' } },
              el('span', { className: 'mcfg-label' }, t('contextWindowField')),
              el('input', { className: 'mcfg-input', type: 'number', min: '1', value: form.contextWindow, onChange: function (e) { set({ contextWindow: e.target.value }) } }),
            ),
            el('div', { className: 'mcfg-field', style: { flex: '1' } },
              el('span', { className: 'mcfg-label' }, t('maxTokensField')),
              el('input', { className: 'mcfg-input', type: 'number', min: '1', value: form.maxTokens, onChange: function (e) { set({ maxTokens: e.target.value }) } }),
            ),
          ),
          el('div', { className: 'mcfg-field' },
            el('span', { className: 'mcfg-label' }, t('inputField')),
            el('div', { className: 'mcfg-row' },
              el('label', { className: 'mcfg-check' }, el('input', { type: 'checkbox', checked: form.inputText, onChange: function (e) { set({ inputText: e.target.checked }) } }), 'text'),
              el('label', { className: 'mcfg-check' }, el('input', { type: 'checkbox', checked: form.inputImage, onChange: function (e) { set({ inputImage: e.target.checked }) } }), 'image'),
            ),
          ),
          el('div', { className: 'mcfg-field' },
            el('span', { className: 'mcfg-label' }, t('reasoningField')),
            el('select', { className: 'mcfg-input mcfg-selectInput', value: form.reasoningMode, onChange: function (e) { set({ reasoningMode: e.target.value }) } },
              el('option', { value: 'off' }, t('reasoningModeOff')),
              el('option', { value: 'levels' }, t('reasoningModeLevels')),
            ),
            form.reasoningMode === 'levels' ? el('div', { className: 'mcfg-field' },
              form.levels.map(function (row, i) {
                return el('div', { key: i, className: 'mcfg-row' },
                  el('label', { className: 'mcfg-check' }, el('input', { type: 'checkbox', checked: row.on === true, onChange: function (e) { setLevel(i, { on: e.target.checked }) } })),
                  el('select', { className: 'mcfg-input mcfg-selectInput mcfg-shrink', value: row.level, onChange: function (e) { setLevel(i, { level: e.target.value }) } },
                    THINKING_LEVELS.map(function (l) { return el('option', { key: l, value: l }, l) }),
                  ),
                  el('input', { className: 'mcfg-input', value: row.wire, placeholder: row.level === 'off' ? t('wireOffHint') : t('wirePlaceholder'), onChange: function (e) { setLevel(i, { wire: e.target.value }) } }),
                  el('button', { type: 'button', className: 'mcfg-btn mcfg-shrink', 'aria-label': t('removeLevel'), onClick: function () { removeLevel(i) } }, '×'),
                )
              }),
              el('div', { className: 'mcfg-row' },
                el('button', { type: 'button', className: 'mcfg-btn', onClick: addLevel }, '+ ' + t('addLevel')),
              ),
              el('p', { className: 'mcfg-hint' }, presetInfo && !(presetInfo.reasoning && presetInfo.reasoning.efforts.length) ? t('unknownReasoning') : t('reasoningHint')),
            ) : null,
          ),
          exists ? el('div', { className: 'mcfg-field' },
            el('p', { className: 'mcfg-note' }, t('overwriteHint')),
            el('label', { className: 'mcfg-check' }, el('input', { type: 'checkbox', checked: overwrite, onChange: function (e) { setOverwrite(e.target.checked) } }), t('overwriteLabel')),
          ) : null,
        ),

        el('div', { className: 'mcfg-row' },
          el('button', { type: 'button', className: 'mcfg-btnPrimary', disabled: busy || boot.writable === false || !target, onClick: apply }, busy ? t('applying') : t('apply')),
          el('button', { type: 'button', className: 'mcfg-btn', onClick: function () { setShowPreview(!showPreview) } }, t('preview')),
        ),
        showPreview && previewEntry ? el('pre', { className: 'mcfg-code' }, JSON.stringify(previewEntry, null, 2)) : null,
        status ? el('p', { className: status.kind === 'ok' ? 'mcfg-statusOk' : 'mcfg-statusErr', role: 'status', 'aria-live': 'polite' }, status.text) : null,
      )
    }

    // ---- plugin ----
    exports.name = 'dsh-provider-model-configurator'
    exports.inject = ['slots', 'remote', 'locale']
    exports.apply = function (ctx) {
      ctx.effect(function () { return ctx.locale.register(NS, { zh: zh, en: en }) }, 'dsh-provider-model-configurator: dictionaries')
      adoptStyles()
      var t = ctx.locale.bind(NS)

      // Mount the modelConfigurator Remote namespace, then resolve its handle
      // through the service store (ctx.reflect.get), not a dotted ctx read:
      // the fiber chain stops at the Loader's runtime-less internal forks.
      var remote = null
      ctx.effect(async function () {
        var dispose = await ctx.remote.$mount({ package: 'dsh-provider-model-configurator', descriptors: INVOCATIONS })
        var handle = ctx.reflect.get('remote.modelConfigurator')
        if (handle === undefined) {
          throw new Error('dsh-provider-model-configurator: the modelConfigurator Remote namespace did not mount')
        }
        remote = handle
        return function () { remote = null; void dispose() }
      }, 'dsh-provider-model-configurator: remote')

      /** Unwrap the transport envelope, then the business envelope. */
      function call(method) {
        var args = Array.prototype.slice.call(arguments, 1)
        if (remote === null) return Promise.reject(new Error(t('remotePending')))
        return Promise.resolve(remote[method].apply(null, args)).then(function (r) {
          if (r === null || typeof r !== 'object' || r.ok !== true) {
            throw new Error((r && r.error && r.error.message) || '调用失败')
          }
          var value = r.value
          if (value && value.ok === true) return value
          throw new Error((value && value.error) || '调用失败')
        })
      }

      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register(
          { name: 'settings.section', id: 'provider-model-configurator', order: 11, label: function () { return t('nav') } },
          function () { return React.createElement(ModelConfiguratorPage, { t: t, call: call }) },
        )
      })
    }

    return module.exports
  },
})
