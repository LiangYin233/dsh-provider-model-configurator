/**
 * Provider Model Configurator — shared settings page component.
 * Environment-neutral: driven only by `t` (translate) and `call` (one host
 * RPC returning `{ ok, ... } | { ok: false, error }`).
 * Business helpers live in ./model.ts; dictionaries in ./locales/*.json.
 * Entries: ./static.tsx (bundle) and ./dynamic.ts (dynamic plugin).
 */

import { THINKING_LEVELS, buildEntry, entryToForm, modelSummary } from './model.js'

export type Translate = (key: string) => string
export type Call = (method: string, payload?: Record<string, unknown>) => Promise<any>
export interface PageProps { t: Translate; call: Call }

/** Page stylesheet (./page.css), inlined as text at build time. */
export { default as css } from './page.css'

/** Dictionaries — one JSON file per language (./locales/*.json). */
import zhRaw from './locales/zh.json'
import enRaw from './locales/en.json'
export const zh = zhRaw
export const en = enRaw satisfies Record<keyof typeof zh, string>

type Status = { kind: 'ok' | 'err'; text: string }

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
  const [loadedEntryId, setLoadedEntryId] = React.useState('')
  const [deleting, setDeleting] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [status, setStatus] = React.useState<Status | null>(null)
  const [sourceOpen, setSourceOpen] = React.useState(false)

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
    setStatus(null)
  }

  const onIdChange = (value: string) => {
    const id = value.trim()
    set({ id: value })
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
      setPresetInfo(r.info)
    } catch (err) { fail(err) } finally { setBusyModel(false) }
  }

  /** Apply the selected preset to the form only when the user confirms. */
  const applySource = () => {
    const info = presetInfo
    const model = sourceModel
    if (!info || !model) return
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
    setLoadedEntryId('')
    setSourceOpen(false)
  }

  const apply = async () => {
    const id = form.id.trim()
    if (!targetRoute) { setStatus({ kind: 'err', text: t('needTarget') }); return }
    if (!id) { setStatus({ kind: 'err', text: t('entryId') + '?' }); return }
    if (exists && !window.confirm(t('overwriteConfirm').replace('{model}', id))) {
      setStatus(null)
      return
    }
    const entry = buildEntry(form)
    if (form.reasoningMode === 'levels' && !entry.reasoningEfforts) {
      setStatus({ kind: 'err', text: t('reasonEmpty') }); return
    }
    setBusy(true)
    setStatus(null)
    try {
      const r = await call('apply-model-config', { route: targetRoute, entry, overwrite: true })
      if (!r || r.ok !== true) { setStatus({ kind: 'err', text: (r && r.error) || '应用失败' }); return }
      setStatus({ kind: 'ok', text: t('statusOk').replace('{model}', r.model).replace('{route}', r.route).replace('{count}', String(r.count)) })
      await refresh()
    } catch (err) { fail(err) } finally { setBusy(false) }
  }

  return (
    <div className="mcfg-page">
      <h2 className="mcfg-title">{t('title')}</h2>
      <p className="mcfg-intro">{t('intro')}</p>
      {boot.error ? <p className="mcfg-statusErr">{boot.error}</p> : null}
      {boot.writable === false ? <p className="mcfg-hint">{t('readOnly')}</p> : null}

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
        <section className="mcfg-card">
          <div className="mcfg-field">
            <span className="mcfg-label">{t('targetModels')}</span>
            <div className="mcfg-idWrap">
              <input className="mcfg-input mcfg-idInput" value={form.id} placeholder="deepseek-v5" onChange={(e) => onIdChange(e.target.value)} />
              <button type="button" className="mcfg-btn mcfg-shrink" onClick={() => setSourceOpen(true)}>{t('usePreset')}</button>
            </div>
            {target.usesCatalog ? <p className="mcfg-note">{t('catalogRouteNote')}</p> : null}
            {target.hasModelOverrides ? <p className="mcfg-note">{t('overridesNote')}</p> : null}
          </div>
          <div className="mcfg-field">
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
          <div className="mcfg-field mcfg-divider">
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
                <input className="mcfg-input" type="number" min="1" placeholder="262144" value={form.contextWindow} onChange={(e) => set({ contextWindow: e.target.value })} />
              </div>
              <div className="mcfg-field" style={{ flex: '1' }}>
                <span className="mcfg-label">{t('maxTokensField')}</span>
                <input className="mcfg-input" type="number" min="1" placeholder="32768" value={form.maxTokens} onChange={(e) => set({ maxTokens: e.target.value })} />
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
          </div>
        </section>
      ) : null}

      <div className="mcfg-row">
        <button type="button" className="mcfg-btnPrimary" disabled={busy || boot.writable === false || !target} onClick={apply}>
          {busy ? t('applying') : t('apply')}
        </button>
      </div>
      {status ? <p className={status.kind === 'ok' ? 'mcfg-statusOk' : 'mcfg-statusErr'} role="status" aria-live="polite">{status.text}</p> : null}

      {sourceOpen ? (
        <div className="mcfg-modalBackdrop" onClick={() => setSourceOpen(false)}>
          <div className="mcfg-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="mcfg-modalHead">
              <span className="mcfg-modalTitle">{t('sourceTitle')}</span>
              <button type="button" className="mcfg-btn mcfg-idBtn" aria-label={t('sourceTitle') + ' close'} onClick={() => setSourceOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
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
            {sourceProvider && sourceModel ? (
              <div className="mcfg-modalActions">
                <button type="button" className="mcfg-btnPrimary" disabled={!presetInfo} onClick={applySource}>{t('useSource')}</button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
