/**
 * Provider Model Configurator — shared settings page (single TSX source).
 * Environment-neutral: driven only by `t` (translate) and `call` (one host
 * RPC returning `{ ok, ... } | { ok: false, error }`).
 * Entries: src/static.tsx (bundle) and src/dynamic.ts (dynamic plugin).
 */

export type Translate = (key: string) => string
export type Call = (method: string, payload?: Record<string, unknown>) => Promise<any>
export interface PageProps { t: Translate; call: Call }

/** Page stylesheet (src/page.css), inlined as text at build time. */
export { default as css } from './page.css'

export const zh = {
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
} as const

export const en: Record<keyof typeof zh, string> = {
  nav: 'Provider Model Configurator',
  title: 'Provider Model Configurator',
  intro: 'Manage model configurations across your configured providers in one place: view, create, edit, copy and delete model entries (context window, max output, input modalities, reasoning efforts). Quick-fill from the pi-ai installed catalog (preset) or any other provider — no need to look fields up by hand while the catalog lags new releases.',
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

const THINKING_LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']
type Status = { kind: 'ok' | 'err'; text: string }

function buildEntry(form: any): any {
  const e: any = { id: form.id.trim() }
  if (form.name && form.name.trim()) e.name = form.name.trim()
  const cw = Number(form.contextWindow)
  if (Number.isInteger(cw) && cw > 0) e.contextWindow = cw
  const mt = Number(form.maxTokens)
  if (Number.isInteger(mt) && mt > 0) e.maxTokens = mt
  const input: string[] = []
  if (form.inputText) input.push('text')
  if (form.inputImage) input.push('image')
  if (input.length) e.input = input
  if (form.reasoningMode === 'off') {
    e.reasoningEfforts = false
  } else {
    const efforts: Record<string, string | null> = {}
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

/** Convert one existing model entry back into editable form state. */
function entryToForm(entry: any): any {
  const input = Array.isArray(entry.input) ? entry.input : []
  const keys = entry.reasoningEfforts && typeof entry.reasoningEfforts === 'object' && !Array.isArray(entry.reasoningEfforts)
    ? Object.keys(entry.reasoningEfforts)
    : []
  return {
    id: typeof entry.id === 'string' ? entry.id : '',
    name: (typeof entry.name === 'string' ? entry.name : '') || (typeof entry.id === 'string' ? entry.id : ''),
    contextWindow: entry.contextWindow ? String(entry.contextWindow) : '',
    maxTokens: entry.maxTokens ? String(entry.maxTokens) : '',
    inputText: !input.length || input.indexOf('text') >= 0,
    inputImage: input.indexOf('image') >= 0,
    reasoningMode: keys.length ? 'levels' : 'off',
    levels: keys.map((level: string) => ({
      level,
      wire: level === 'off' ? '' : (typeof entry.reasoningEfforts[level] === 'string' ? entry.reasoningEfforts[level] : ''),
      on: true,
    })),
  }
}

/** One-line summary of an existing model entry for the provider model list. */
function modelSummary(entry: any): string {
  const parts: string[] = []
  if (typeof entry.name === 'string' && entry.name && entry.name !== entry.id) parts.push(entry.name)
  if (entry.contextWindow) parts.push('ctx ' + entry.contextWindow)
  if (entry.maxTokens) parts.push('out ' + entry.maxTokens)
  if (Array.isArray(entry.input) && entry.input.length) parts.push('input: ' + entry.input.join('+'))
  if (entry.reasoningEfforts && typeof entry.reasoningEfforts === 'object' && !Array.isArray(entry.reasoningEfforts)) {
    const keys = Object.keys(entry.reasoningEfforts)
    if (keys.length) parts.push('reasoning: ' + keys.join(','))
  }
  return parts.length ? parts.join(' · ') : '—'
}

export function ModelConfiguratorPage(props: PageProps) {
  const { t, call } = props
  const [boot, setBoot] = React.useState({ providers: [] as any[], targets: [] as any[], writable: true, error: '' })
  const [sourceProvider, setSourceProvider] = React.useState('')
  const [sourceModels, setSourceModels] = React.useState<any[]>([])
  const [sourceModel, setSourceModel] = React.useState('')
  const [presetInfo, setPresetInfo] = React.useState<any>(null)
  const [busyModel, setBusyModel] = React.useState(false)
  const [targetRoute, setTargetRoute] = React.useState('')
  const [form, setForm] = React.useState({ id: '', name: '', contextWindow: '', maxTokens: '', inputText: true, inputImage: false, reasoningMode: 'off', levels: [] as any[] })
  const [overwrite, setOverwrite] = React.useState(false)
  const [loadedEntryId, setLoadedEntryId] = React.useState('')
  const [deleting, setDeleting] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [status, setStatus] = React.useState<Status | null>(null)
  const [showPreview, setShowPreview] = React.useState(false)

  const fail = (err: unknown) => setStatus({ kind: 'err', text: (err as Error)?.message || String(err) })
  const refresh = async () => {
    const b = await call('target-providers')
    if (b && b.ok === true) setBoot((x) => ({ ...x, targets: b.providers }))
  }

  React.useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [a, b] = await Promise.all([call('preset-providers'), call('target-providers')])
        if (!alive) return
        const errs: string[] = []
        if (a.ok !== true) errs.push(a.error || 'preset-providers failed')
        if (b.ok !== true) errs.push(b.error || 'target-providers failed')
        setBoot({
          providers: a.ok === true ? a.providers : [],
          targets: b.ok === true ? b.providers : [],
          writable: b.ok === true ? b.writable !== false : true,
          error: errs.join('; '),
        })
      } catch (err) {
        if (alive) setBoot((x) => ({ ...x, error: (err as Error)?.message || String(err) }))
      }
    })()
    return () => { alive = false }
  }, [])

  const target = boot.targets.find((x) => x.provider === targetRoute) || null
  const targetModelIds = target ? [...new Set([...(target.models || []), ...(target.catalogModels || [])])] : []
  const exists = targetModelIds.indexOf(form.id.trim()) >= 0

  const set = (patch: Record<string, unknown>) => setForm((f) => ({ ...f, ...patch }))
  const setLevel = (index: number, patch: Record<string, unknown>) => setForm((f) => ({
    ...f,
    levels: f.levels.map((row, i) => (i === index ? { ...row, ...patch } : row)),
  }))
  const removeLevel = (index: number) => setForm((f) => ({ ...f, levels: f.levels.filter((_, i) => i !== index) }))
  const addLevel = () => setForm((f) => ({ ...f, levels: [...f.levels, { level: 'low', wire: '', on: true }] }))

  const loadEntry = (entry: any) => {
    setForm(entryToForm(entry))
    setLoadedEntryId(entry.id)
    setOverwrite(false)
    setStatus(null)
  }

  const onIdChange = (value: string) => {
    const id = value.trim()
    set({ id: value })
    setOverwrite(false)
    if (!target || !id) { setLoadedEntryId(''); return }
    const found = (target.entries || []).find((e: any) => e && e.id === id) || null
    if (found && found.id !== loadedEntryId) loadEntry(found)
    else if (!found && loadedEntryId === id) setLoadedEntryId('')
  }

  const removeModel = async (modelId: string) => {
    if (deleting || !window.confirm(t('deleteConfirm').replace('{model}', modelId))) return
    setDeleting(true)
    setStatus(null)
    try {
      const r = await call('delete-model', { route: targetRoute, modelId })
      if (!r || r.ok !== true) { setStatus({ kind: 'err', text: (r && r.error) || '删除失败' }); return }
      setStatus({ kind: 'ok', text: (r.revertedToCatalog === true ? t('statusDeletedCatalog') : t('statusDeleted')).replace('{model}', r.model).replace('{route}', r.route).replace('{count}', String(r.count)) })
      await refresh()
    } catch (err) { fail(err) } finally { setDeleting(false) }
  }

  const clearSource = () => {
    setSourceProvider('')
    setSourceModel('')
    setPresetInfo(null)
    setSourceModels([])
    setStatus(null)
  }

  const onSourceProvider = async (value: string) => {
    setSourceProvider(value)
    setSourceModel('')
    setPresetInfo(null)
    setSourceModels([])
    setStatus(null)
    if (!value) return
    setBusyModel(true)
    try {
      const r = await call('preset-models', { provider: value })
      if (!r || r.ok !== true) { setStatus({ kind: 'err', text: (r && r.error) || '读取来源模型失败' }); return }
      setSourceModels(r.models)
    } catch (err) { fail(err) } finally { setBusyModel(false) }
  }

  const onPresetModel = async (model: string) => {
    setSourceModel(model)
    setStatus(null)
    if (!model) { setPresetInfo(null); return }
    setBusyModel(true)
    try {
      const r = await call('preset-model-info', { provider: sourceProvider, model })
      if (!r || r.ok !== true) { setStatus({ kind: 'err', text: (r && r.error) || '读取来源模型信息失败' }); return }
      const info = r.info
      setPresetInfo(info)
      const levels = info.reasoning && info.reasoning.efforts && info.reasoning.efforts.length
        ? info.reasoning.efforts.map((e: any) => ({ level: e.level, wire: e.level === 'off' ? '' : e.level, on: true }))
        : []
      setForm({
        id: model,
        name: info.name || model,
        contextWindow: info.contextWindow ? String(info.contextWindow) : '',
        maxTokens: info.maxTokens ? String(info.maxTokens) : '',
        inputText: !info.input || info.input.indexOf('text') >= 0,
        inputImage: !!(info.input && info.input.indexOf('image') >= 0),
        reasoningMode: levels.length ? 'levels' : 'off',
        levels,
      })
      setOverwrite(false)
      setLoadedEntryId('')
    } catch (err) { fail(err) } finally { setBusyModel(false) }
  }

  const apply = async () => {
    const id = form.id.trim()
    if (!targetRoute) { setStatus({ kind: 'err', text: t('needTarget') }); return }
    if (!id) { setStatus({ kind: 'err', text: t('entryId') + '?' }); return }
    const entry = buildEntry(form)
    if (form.reasoningMode === 'levels' && !entry.reasoningEfforts) {
      setStatus({ kind: 'err', text: t('reasonEmpty') }); return
    }
    setBusy(true)
    setStatus(null)
    try {
      const r = await call('apply-model-config', { route: targetRoute, entry, overwrite: overwrite === true })
      if (!r || r.ok !== true) { setStatus({ kind: 'err', text: (r && r.error) || '应用失败' }); return }
      setStatus({ kind: 'ok', text: t('statusOk').replace('{model}', r.model).replace('{route}', r.route).replace('{count}', String(r.count)) })
      setOverwrite(false)
      await refresh()
    } catch (err) { fail(err) } finally { setBusy(false) }
  }

  const previewEntry = targetRoute ? buildEntry(form) : null

  return (
    <div className="mcfg-page">
      <h2 className="mcfg-title">{t('title')}</h2>
      <p className="mcfg-intro">{t('intro')}</p>
      {boot.error ? <p className="mcfg-statusErr">{boot.error}</p> : null}
      {boot.writable === false ? <p className="mcfg-hint">{t('readOnly')}</p> : null}

      <section className="mcfg-card">
        <h3 className="mcfg-cardTitle">{t('targetTitle')}</h3>
        <div className="mcfg-field">
          <span className="mcfg-label">{t('targetRoute')}</span>
          <select className="mcfg-input mcfg-selectInput" value={targetRoute} onChange={(e) => { setTargetRoute(e.target.value); setLoadedEntryId('') }}>
            <option value="">{t('targetRoutePlaceholder')}</option>
            {boot.targets.map((x) => (
              <option key={x.provider} value={x.provider}>{x.displayName + (x.declared ? ' · ' + t('customTag') : '')}</option>
            ))}
          </select>
          {boot.targets.length === 0 ? <p className="mcfg-hint">{t('emptyTargets')}</p> : null}
        </div>
        {target ? (
          <div className="mcfg-field">
            <span className="mcfg-label">{t('targetModels')}</span>
            <input className="mcfg-input" list="mcfg-model-ids" value={form.id} placeholder="deepseek-v5" onChange={(e) => onIdChange(e.target.value)} />
            <datalist id="mcfg-model-ids">{targetModelIds.map((id) => <option key={id} value={id} />)}</datalist>
            {target.usesCatalog ? <p className="mcfg-note">{t('catalogRouteNote')}</p> : null}
            {target.hasModelOverrides ? <p className="mcfg-note">{t('overridesNote')}</p> : null}
          </div>
        ) : null}
        {target ? (
          <div className="mcfg-field">
            <span className="mcfg-label">{t('modelListTitle')}</span>
            {target.entries.length ? target.entries.map((m: any) => (
              <div key={m.id} className="mcfg-row">
                <div className="mcfg-field" style={{ flex: '1' }}>
                  <span className="mcfg-label">{m.id}</span>
                  <p className="mcfg-hint">{modelSummary(m)}</p>
                </div>
                <button type="button" className="mcfg-btn mcfg-shrink" onClick={() => loadEntry(m)}>{t('editModel')}</button>
                <button type="button" className="mcfg-btn mcfg-shrink" disabled={deleting} onClick={() => removeModel(m.id)}>{t('deleteModel')}</button>
              </div>
            )) : (target.usesCatalog && target.catalogModels.length
              ? <p className="mcfg-hint">{t('catalogModelsHint') + ' ' + target.catalogModels.join(', ')}</p>
              : <p className="mcfg-hint">{t('noExplicitModels')}</p>)}
          </div>
        ) : null}
        {target ? (
          <div className="mcfg-field mcfg-divider">
            <span className="mcfg-label">{t('sourceTitle')}</span>
            {!sourceProvider ? <p className="mcfg-hint">{t('sourceOptionalHint')}</p> : null}
            <div className="mcfg-row">
              <div className="mcfg-field" style={{ flex: '1' }}>
                <select className="mcfg-input mcfg-selectInput" value={sourceProvider} disabled={busyModel} onChange={(e) => onSourceProvider(e.target.value)}>
                  <option value="">{t('sourceProviderPlaceholder')}</option>
                  {boot.providers.map((p) => (
                    <option key={p.provider} value={p.provider}>
                      {p.displayName + (p.configured ? ' · ' + t('configuredTag') : '') + (p.declared ? ' · ' + t('customTag') : '')}
                    </option>
                  ))}
                </select>
              </div>
              {sourceProvider ? <button type="button" className="mcfg-btn mcfg-shrink" onClick={clearSource}>{t('clearSource')}</button> : null}
            </div>
            {sourceProvider ? (
              <div className="mcfg-field">
                <select className="mcfg-input mcfg-selectInput" value={sourceModel} disabled={busyModel} onChange={(e) => onPresetModel(e.target.value)}>
                  <option value="">{t('sourceModelPlaceholder')}</option>
                  {sourceModels.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                {busyModel ? <span className="mcfg-hint">{t('loading')}</span> : null}
              </div>
            ) : null}
            {presetInfo ? (
              <div className="mcfg-info">
                <p className="mcfg-infoLine">{t('context') + ': ' + (presetInfo.contextWindow ? String(presetInfo.contextWindow) : '—')}</p>
                <p className="mcfg-infoLine">{t('output') + ': ' + (presetInfo.maxTokens ? String(presetInfo.maxTokens) : '—')}</p>
                <p className="mcfg-infoLine">{t('modalities') + ': ' + ((presetInfo.input && presetInfo.input.length) ? presetInfo.input.join(', ') : 'text')}</p>
                <p className="mcfg-infoLine">{t('reasoningLevels') + ': ' + (presetInfo.reasoning ? presetInfo.reasoning.efforts.map((e: any) => e.level).join(', ') : t('unknownReasoning'))}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="mcfg-card">
        <h3 className="mcfg-cardTitle">{t('entryTitle')}</h3>
        {loadedEntryId === form.id.trim() ? <p className="mcfg-hint">{t('loadedHint')}</p> : null}
        <div className="mcfg-row">
          <div className="mcfg-field" style={{ flex: '1' }}>
            <span className="mcfg-label">{t('entryId')}</span>
            <input className="mcfg-input" value={form.id} onChange={(e) => onIdChange(e.target.value)} />
          </div>
          <div className="mcfg-field" style={{ flex: '1' }}>
            <span className="mcfg-label">{t('entryName')}</span>
            <input className="mcfg-input" value={form.name} onChange={(e) => set({ name: e.target.value })} />
          </div>
        </div>
        <div className="mcfg-row">
          <div className="mcfg-field" style={{ flex: '1' }}>
            <span className="mcfg-label">{t('contextWindowField')}</span>
            <input className="mcfg-input" type="number" min="1" value={form.contextWindow} onChange={(e) => set({ contextWindow: e.target.value })} />
          </div>
          <div className="mcfg-field" style={{ flex: '1' }}>
            <span className="mcfg-label">{t('maxTokensField')}</span>
            <input className="mcfg-input" type="number" min="1" value={form.maxTokens} onChange={(e) => set({ maxTokens: e.target.value })} />
          </div>
        </div>
        <div className="mcfg-field">
          <span className="mcfg-label">{t('inputField')}</span>
          <div className="mcfg-row">
            <label className="mcfg-check">
              <input type="checkbox" checked={form.inputText} onChange={(e) => set({ inputText: e.target.checked })} />text
            </label>
            <label className="mcfg-check">
              <input type="checkbox" checked={form.inputImage} onChange={(e) => set({ inputImage: e.target.checked })} />image
            </label>
          </div>
        </div>
        <div className="mcfg-field">
          <span className="mcfg-label">{t('reasoningField')}</span>
          <select className="mcfg-input mcfg-selectInput" value={form.reasoningMode} onChange={(e) => set({ reasoningMode: e.target.value })}>
            <option value="off">{t('reasoningModeOff')}</option>
            <option value="levels">{t('reasoningModeLevels')}</option>
          </select>
          {form.reasoningMode === 'levels' ? (
            <div className="mcfg-field">
              {form.levels.map((row, i) => (
                <div key={i} className="mcfg-row">
                  <label className="mcfg-check">
                    <input type="checkbox" checked={row.on === true} onChange={(e) => setLevel(i, { on: e.target.checked })} />
                  </label>
                  <select className="mcfg-input mcfg-selectInput mcfg-shrink" value={row.level} onChange={(e) => setLevel(i, { level: e.target.value })}>
                    {THINKING_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <input
                    className="mcfg-input"
                    value={row.wire}
                    placeholder={row.level === 'off' ? t('wireOffHint') : t('wirePlaceholder')}
                    onChange={(e) => setLevel(i, { wire: e.target.value })}
                  />
                  <button type="button" className="mcfg-btn mcfg-shrink" aria-label={t('removeLevel')} onClick={() => removeLevel(i)}>×</button>
                </div>
              ))}
              <div className="mcfg-row">
                <button type="button" className="mcfg-btn" onClick={addLevel}>+ {t('addLevel')}</button>
              </div>
              <p className="mcfg-hint">{presetInfo && !(presetInfo.reasoning && presetInfo.reasoning.efforts.length) ? t('unknownReasoning') : t('reasoningHint')}</p>
            </div>
          ) : null}
        </div>
        {exists ? (
          <div className="mcfg-field">
            <p className="mcfg-note">{t('overwriteHint')}</p>
            <label className="mcfg-check">
              <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />{t('overwriteLabel')}
            </label>
          </div>
        ) : null}
      </section>

      <div className="mcfg-row">
        <button type="button" className="mcfg-btnPrimary" disabled={busy || boot.writable === false || !target} onClick={apply}>
          {busy ? t('applying') : t('apply')}
        </button>
        <button type="button" className="mcfg-btn" onClick={() => setShowPreview(!showPreview)}>{t('preview')}</button>
      </div>
      {showPreview && previewEntry ? <pre className="mcfg-code">{JSON.stringify(previewEntry, null, 2)}</pre> : null}
      {status ? <p className={status.kind === 'ok' ? 'mcfg-statusOk' : 'mcfg-statusErr'} role="status" aria-live="polite">{status.text}</p> : null}
    </div>
  )
}
