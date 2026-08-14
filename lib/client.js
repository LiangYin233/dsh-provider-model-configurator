window.__ModuleLoader__.load({ id: "dsh-provider-model-configurator", factory: (require) => { var module = { exports: {} }; var exports = module.exports; var React = require('react');
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/static.tsx
var static_exports = {};
__export(static_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(static_exports);

// src/shared/thinking.js
var THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"];
var THINKING_FORMATS = ["openai", "deepseek", "openrouter", "together", "zai", "qwen", "string-thinking", "ant-ling"];

// src/host/contract.js
var schema = (parse) => ({ parse });
var stringSchema = schema((v) => {
  if (typeof v !== "string") throw new TypeError("expected a string");
  return v;
});
var booleanSchema = schema((v) => {
  if (typeof v !== "boolean") throw new TypeError("expected a boolean");
  return v;
});
var objectSchema = schema((v) => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) throw new TypeError("expected an object");
  return v;
});
var stringArraySchema = schema((v) => {
  if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) throw new TypeError("expected an array of strings");
  return v;
});
var resultEnvelopeSchema = schema((v) => {
  if (v === null || typeof v !== "object" || typeof v.ok !== "boolean") throw new TypeError("expected an { ok, ... } envelope");
  return v;
});
var codec = (name2, sch) => ({ mode: "strict", typeSymbol: `dsh-provider-model-configurator#${name2}`, schema: sch });
var stringParam = (name2) => ({
  name: name2,
  wire: name2,
  source: "json",
  codec: codec("String", stringSchema)
});
var INVOCATIONS = [
  {
    id: "dsh-provider-model-configurator#modelConfigurator/presetProviders",
    service: "modelConfigurator",
    namespace: "modelConfigurator",
    method: "presetProviders",
    invocation: { kind: "direct" },
    parameters: [],
    result: { mode: "strict", typeSymbol: "dsh-provider-model-configurator#PresetProvidersResult", schema: resultEnvelopeSchema }
  },
  {
    id: "dsh-provider-model-configurator#modelConfigurator/presetModels",
    service: "modelConfigurator",
    namespace: "modelConfigurator",
    method: "presetModels",
    invocation: { kind: "direct" },
    parameters: [stringParam("provider")],
    result: { mode: "strict", typeSymbol: "dsh-provider-model-configurator#PresetModelsResult", schema: resultEnvelopeSchema }
  },
  {
    id: "dsh-provider-model-configurator#modelConfigurator/presetModelInfo",
    service: "modelConfigurator",
    namespace: "modelConfigurator",
    method: "presetModelInfo",
    invocation: { kind: "direct" },
    parameters: [stringParam("provider"), stringParam("model")],
    result: { mode: "strict", typeSymbol: "dsh-provider-model-configurator#PresetModelInfoResult", schema: resultEnvelopeSchema }
  },
  {
    id: "dsh-provider-model-configurator#modelConfigurator/targetProviders",
    service: "modelConfigurator",
    namespace: "modelConfigurator",
    method: "targetProviders",
    invocation: { kind: "direct" },
    parameters: [],
    result: { mode: "strict", typeSymbol: "dsh-provider-model-configurator#TargetProvidersResult", schema: resultEnvelopeSchema }
  },
  {
    id: "dsh-provider-model-configurator#modelConfigurator/applyModelConfig",
    service: "modelConfigurator",
    namespace: "modelConfigurator",
    method: "applyModelConfig",
    invocation: { kind: "direct" },
    parameters: [
      stringParam("route"),
      { name: "entry", wire: "entry", source: "json", codec: codec("ModelEntry", objectSchema) },
      { name: "overwrite", wire: "overwrite", source: "json", codec: codec("Boolean", booleanSchema) },
      { name: "clearFields", wire: "clearFields", source: "json", codec: codec("StringArray", stringArraySchema) }
    ],
    result: { mode: "strict", typeSymbol: "dsh-provider-model-configurator#ApplyModelConfigResult", schema: resultEnvelopeSchema }
  },
  {
    id: "dsh-provider-model-configurator#modelConfigurator/deleteModel",
    service: "modelConfigurator",
    namespace: "modelConfigurator",
    method: "deleteModel",
    invocation: { kind: "direct" },
    parameters: [stringParam("route"), stringParam("modelId")],
    result: { mode: "strict", typeSymbol: "dsh-provider-model-configurator#DeleteModelResult", schema: resultEnvelopeSchema }
  }
];

// src/client/model.ts
var THINKING_LEVELS2 = THINKING_LEVELS;
var THINKING_FORMATS2 = THINKING_FORMATS;
function buildEntry(form) {
  const e = { id: form.id.trim() };
  if (form.name && form.name.trim()) e.name = form.name.trim();
  const cw = Number(form.contextWindow);
  if (Number.isInteger(cw) && cw > 0) e.contextWindow = cw;
  const mt = Number(form.maxTokens);
  if (Number.isInteger(mt) && mt > 0) e.maxTokens = mt;
  if (!form.inputUnset) {
    const input = [];
    if (form.inputText) input.push("text");
    if (form.inputImage) input.push("image");
    if (input.length) e.input = input;
  }
  if (form.reasoningMode === "off") {
    e.reasoningEfforts = false;
  } else if (form.reasoningMode === "levels") {
    const efforts = {};
    for (const row of form.levels) {
      if (!row.on) continue;
      if (row.level === "off") {
        efforts.off = null;
        continue;
      }
      const wire = String(row.wire || "").trim();
      if (wire) efforts[row.level] = wire;
    }
    if (Object.keys(efforts).length) e.reasoningEfforts = efforts;
  }
  const compat = {};
  if (form.compatThinkingFormat) compat.thinkingFormat = form.compatThinkingFormat;
  if (form.compatSupportsReasoningEffort !== "") compat.supportsReasoningEffort = form.compatSupportsReasoningEffort === "true";
  if (Object.keys(compat).length) e.compat = compat;
  return e;
}
function entryToForm(entry) {
  const input = Array.isArray(entry.input) ? entry.input : [];
  const re = entry.reasoningEfforts;
  const keys = re && typeof re === "object" && !Array.isArray(re) ? Object.keys(re) : [];
  const compat = entry.compat && typeof entry.compat === "object" && !Array.isArray(entry.compat) ? entry.compat : {};
  return {
    id: typeof entry.id === "string" ? entry.id : "",
    name: typeof entry.name === "string" ? entry.name : "",
    contextWindow: entry.contextWindow ? String(entry.contextWindow) : "",
    maxTokens: entry.maxTokens ? String(entry.maxTokens) : "",
    inputUnset: !Object.prototype.hasOwnProperty.call(entry, "input"),
    inputText: !input.length || input.indexOf("text") >= 0,
    inputImage: input.indexOf("image") >= 0,
    reasoningMode: re === false ? "off" : keys.length ? "levels" : "unset",
    levels: keys.map((level) => ({
      level,
      wire: level === "off" ? "" : typeof re[level] === "string" ? re[level] : "",
      on: true
    })),
    compatThinkingFormat: typeof compat.thinkingFormat === "string" ? compat.thinkingFormat : "",
    compatSupportsReasoningEffort: typeof compat.supportsReasoningEffort === "boolean" ? String(compat.supportsReasoningEffort) : ""
  };
}
function modelSummary(entry) {
  const parts = [];
  if (typeof entry.name === "string" && entry.name && entry.name !== entry.id) parts.push(entry.name);
  if (entry.contextWindow) parts.push("ctx " + entry.contextWindow);
  if (entry.maxTokens) parts.push("out " + entry.maxTokens);
  if (Array.isArray(entry.input) && entry.input.length) parts.push("input: " + entry.input.join("+"));
  if (entry.reasoningEfforts && typeof entry.reasoningEfforts === "object" && !Array.isArray(entry.reasoningEfforts)) {
    const keys = Object.keys(entry.reasoningEfforts);
    if (keys.length) parts.push("reasoning: " + keys.join(","));
  }
  if (entry.compat && typeof entry.compat === "object" && !Array.isArray(entry.compat)) {
    const bits = [];
    if (typeof entry.compat.thinkingFormat === "string") bits.push("tf: " + entry.compat.thinkingFormat);
    if (typeof entry.compat.supportsReasoningEffort === "boolean") bits.push("sre: " + entry.compat.supportsReasoningEffort);
    if (bits.length) parts.push("compat: " + bits.join(", "));
  }
  return parts.length ? parts.join(" · ") : "—";
}

// src/client/page.css
var page_default = '/* Provider Model Configurator — settings page styles.\n   Only --dsw-alias-* semantic tokens, so the page follows the system theme. */\n\n.mcfg-page {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  max-width: 720px;\n  padding: 4px 2px 24px;\n  color: var(--dsw-alias-label-primary);\n}\n\n.mcfg-title {\n  color: var(--dsw-alias-label-primary);\n  font-size: 16px;\n  font-weight: 500;\n  line-height: 24px;\n  margin: 0;\n}\n\n.mcfg-intro {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 14px;\n  line-height: 22px;\n  margin: 0;\n}\n\n.mcfg-card {\n  background: var(--dsw-alias-bg-layer-2);\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: 12px;\n  padding: 14px 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n\n.mcfg-field {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.mcfg-label {\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 16px;\n}\n\n.mcfg-input {\n  box-sizing: border-box;\n  width: 100%;\n  height: 32px;\n  padding: 0 10px;\n  border-radius: 8px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  background: var(--dsw-alias-bg-base);\n  color: var(--dsw-alias-label-primary);\n  font-family: inherit;\n  font-size: 13px;\n}\n\n.mcfg-input:focus {\n  outline: none;\n  border-color: var(--dsw-alias-brand-primary);\n}\n\n.mcfg-input:disabled {\n  opacity: 0.55;\n}\n\n.mcfg-selectInput {\n  appearance: auto;\n}\n\n.mcfg-shrink {\n  width: auto;\n  flex: none;\n}\n\n.mcfg-row {\n  display: flex;\n  flex-direction: row;\n  gap: 8px;\n  align-items: center;\n}\n\n.mcfg-hint {\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 18px;\n  margin: 0;\n}\n\n.mcfg-note {\n  color: var(--dsw-alias-state-warn-primary);\n  font-size: 12px;\n  line-height: 18px;\n  margin: 0;\n}\n\n.mcfg-divider {\n  border-top: 1px solid var(--dsw-alias-border-l1);\n  padding-top: 12px;\n  margin-top: 4px;\n}\n\n/* Model-id input with a "use preset" action button. */\n.mcfg-idWrap {\n  display: flex;\n  gap: 6px;\n}\n\n.mcfg-idInput {\n  flex: 1;\n}\n\n/* Copy-source picker modal. */\n.mcfg-modalBackdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 40;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(0, 0, 0, 0.35);\n}\n\n.mcfg-modal {\n  box-sizing: border-box;\n  width: min(440px, calc(100% - 32px));\n  max-height: calc(100vh - 64px);\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 16px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: 12px;\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-primary);\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);\n}\n\n.mcfg-modalHead {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n\n.mcfg-modalTitle {\n  color: var(--dsw-alias-label-primary);\n  font-size: 14px;\n  font-weight: 500;\n  line-height: 20px;\n}\n\n.mcfg-modalActions {\n  display: flex;\n  justify-content: flex-end;\n}\n\n.mcfg-info {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  border-left: 2px solid var(--dsw-alias-border-l1);\n  padding-left: 10px;\n}\n\n.mcfg-infoLine {\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 18px;\n  margin: 0;\n}\n\n.mcfg-btn {\n  box-sizing: border-box;\n  height: 32px;\n  padding: 0 14px;\n  border-radius: 8px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  background: var(--dsw-alias-bg-base);\n  color: var(--dsw-alias-label-primary);\n  font-family: inherit;\n  font-size: 13px;\n  cursor: pointer;\n}\n\n.mcfg-btn:hover {\n  background: var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-1));\n}\n\n/* Compact square icon button (modal close). */\n.mcfg-idBtn {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  padding: 0;\n}\n\n.mcfg-btnPrimary {\n  box-sizing: border-box;\n  height: 32px;\n  padding: 0 16px;\n  border-radius: 8px;\n  border: none;\n  background: var(--dsw-alias-button-primary-fill);\n  color: var(--dsw-alias-label-primary-foreground);\n  font-family: inherit;\n  font-size: 13px;\n  font-weight: 500;\n  cursor: pointer;\n}\n\n.mcfg-btnPrimary:hover:not(:disabled) {\n  background: var(--dsw-alias-button-primary-hover);\n}\n\n.mcfg-btnPrimary:disabled {\n  opacity: 0.5;\n  cursor: default;\n}\n\n.mcfg-check {\n  display: flex;\n  flex-direction: row;\n  gap: 8px;\n  align-items: center;\n  color: var(--dsw-alias-label-primary);\n  font-size: 13px;\n  cursor: pointer;\n}\n\n.mcfg-statusOk {\n  color: var(--dsw-alias-state-success-primary);\n  font-size: 13px;\n  line-height: 20px;\n  margin: 0;\n}\n\n.mcfg-statusErr {\n  color: var(--dsw-alias-state-error-primary);\n  font-size: 13px;\n  line-height: 20px;\n  margin: 0;\n}\n';

// src/client/locales/zh.json
var zh_default = {
  nav: "模型 Pro",
  title: "模型 Pro",
  intro: "集中管理各提供商的模型条目:查看、新建、编辑、复制与删除,配置上下文窗口、最大输出、输入模态与推理档位;可用模型预设快速填充。",
  readOnly: "当前设置为只读,无法写入。",
  remotePending: "远程服务尚未就绪,请稍候…",
  sourceTitle: "复制来源(可选,用于快速填充)",
  sourceOptionalHint: "未选择复制来源:可直接在下方模型配置区手动填写(高级模式),或选择来源快速填充。",
  clearSource: "清除来源,手动填写",
  sourceProviderPlaceholder: "选择提供商(预设目录 / 已配置,可跳过)",
  sourceModelPlaceholder: "选择模型",
  loading: "加载中…",
  context: "上下文窗口",
  output: "最大输出",
  modalities: "输入模态",
  reasoningLevels: "推理档位",
  unknownReasoning: "无可用推理档位信息",
  configuredTag: "已配置",
  customTag: "自定义",
  targetRoute: "目标提供商",
  targetRoutePlaceholder: "选择已配置的提供商",
  targetModels: "模型 ID(可输入新模型,或从下方列表/现有模型中选择)",
  usePreset: "使用模型预设",
  editModel: "编辑",
  deleteModel: "删除",
  deleteConfirm: "确定删除模型「{model}」吗?此操作会立即写入设置。",
  statusDeleted: "已删除模型 {model}(提供商 {route} 剩余 {count} 个模型)",
  statusDeletedCatalog: "已删除模型 {model};该提供商已恢复使用内置目录。",
  catalogModelsHint: "内置目录模型(只读):",
  noExplicitModels: "该提供商暂无显式模型条目:在下方输入模型 ID 并「应用配置」即可添加。",
  catalogRouteNote: "该提供商当前使用内置目录;应用后会自动转为显式模型列表,并保留全部目录模型。",
  overridesNote: "该提供商带有模型覆盖(modelOverrides);应用时会自动将其合并进显式模型列表,不会丢失。",
  emptyTargets: "暂无已配置的提供商。请先在 Models 页配置提供商(可新建自定义提供商)。",
  entryId: "模型 ID",
  entryName: "显示名称",
  contextWindowField: "上下文窗口 (tokens)",
  maxTokensField: "最大输出 (tokens)",
  inputField: "输入模态",
  inputUnset: "继承目录(未设置)",
  reasoningField: "推理档位",
  reasoningModeUnset: "未设置(继承目录)",
  reasoningModeLevels: "启用推理(按档位)",
  reasoningModeOff: "非推理模型(reasoningEfforts: false)",
  compatField: "兼容选项 (compat)",
  compatThinkingFormat: "推理参数格式 (thinkingFormat)",
  compatSupportsReasoningEffort: "接受 reasoning_effort (supportsReasoningEffort)",
  compatUnset: "未设置(继承目录/自动检测)",
  compatHint: "仅 openai-completions 模型的推理分发读取这两个开关;缺省继承目录条目,再按 baseURL 自动检测。",
  reasoningHint: "wire 值即请求发送的 reasoning_effort 参数。档位名与网关取值不一致时请按来源模型实际情况修改(如 deepseek 系列的 minimal/low/medium 常留空);off 留空表示不发送。",
  addLevel: "添加档位",
  removeLevel: "移除",
  wirePlaceholder: "wire 值(如 high)",
  wireOffHint: "off:不发送",
  overwriteConfirm: "模型 {model} 已存在于目标提供商,确定覆盖吗?",
  apply: "应用配置",
  applying: "应用中…",
  useSource: "使用此来源",
  statusOk: "已应用:模型 {model} 已写入提供商 {route}(共 {count} 个模型)。Models 页将自动刷新。",
  reasonEmpty: "推理档位为空:请至少勾选一个非 off 档位,或选择「非推理模型」。",
  dupLevel: "推理档位重复:「{level}」只能出现一次。",
  wireRequired: "档位「{level}」需要填写 wire 值,或取消勾选该档位。",
  needId: "请输入模型 ID。",
  needTarget: "请先选择目标提供商。"
};

// src/client/locales/en.json
var en_default = {
  nav: "Model Pro",
  title: "Model Pro",
  intro: "Manage model entries across your providers in one place: view, create, edit, copy and delete, with context window, max output, modalities and reasoning efforts — quick-fill from model presets.",
  readOnly: "Settings are read-only; writes are disabled.",
  remotePending: "Remote service is not ready yet…",
  sourceTitle: "Copy source (optional, for quick fill)",
  sourceOptionalHint: "No copy source selected: configure the model by hand in the form below (advanced mode), or pick a source for quick fill.",
  clearSource: "Clear source, configure manually",
  sourceProviderPlaceholder: "Choose a provider (preset catalog / configured, optional)",
  sourceModelPlaceholder: "Choose a model",
  loading: "Loading…",
  context: "Context window",
  output: "Max output",
  modalities: "Modalities",
  reasoningLevels: "Reasoning levels",
  unknownReasoning: "No reasoning info available",
  configuredTag: "configured",
  customTag: "custom",
  targetRoute: "Target provider",
  targetRoutePlaceholder: "Choose a configured provider",
  targetModels: "Model id (type a new model, or pick one from the list below)",
  usePreset: "Use model preset",
  editModel: "Edit",
  deleteModel: "Delete",
  deleteConfirm: 'Delete model "{model}"? This writes to settings immediately.',
  statusDeleted: "Deleted model {model} from provider {route} ({count} models left).",
  statusDeletedCatalog: "Deleted model {model}; the provider now serves the built-in catalog again.",
  catalogModelsHint: "Catalog models (read-only):",
  noExplicitModels: "No explicit model entries on this provider yet: type a model id below and hit Apply to add one.",
  catalogRouteNote: "This provider currently serves the built-in catalog; applying converts it to an explicit model list keeping every catalog model.",
  overridesNote: "This provider carries model overrides (modelOverrides); applying folds them into the explicit model list without loss.",
  emptyTargets: "No configured providers yet. Configure one on the Models page first (custom providers can be created there).",
  entryId: "Model id",
  entryName: "Display name",
  contextWindowField: "Context window (tokens)",
  maxTokensField: "Max output (tokens)",
  inputField: "Modalities",
  inputUnset: "Inherit catalog (unset)",
  reasoningField: "Reasoning efforts",
  reasoningModeUnset: "Unset (inherit catalog)",
  reasoningModeLevels: "Reasoning (per level)",
  reasoningModeOff: "Non-reasoning model (reasoningEfforts: false)",
  compatField: "Compatibility (compat)",
  compatThinkingFormat: "Reasoning wire format (thinkingFormat)",
  compatSupportsReasoningEffort: "Accepts reasoning_effort (supportsReasoningEffort)",
  compatUnset: "Unset (inherit catalog / auto-detect)",
  compatHint: "Only openai-completions reasoning dispatch reads these two switches; absent keeps the catalog entry's value, then baseURL-derived detection.",
  reasoningHint: "wire is the reasoning_effort value sent on the wire. Adjust it when the gateway differs from the level name (e.g. deepseek-family minimal/low/medium are often empty); off with empty wire sends nothing.",
  addLevel: "Add level",
  removeLevel: "Remove",
  wirePlaceholder: "wire value (e.g. high)",
  wireOffHint: "off: send nothing",
  overwriteConfirm: "Model {model} already exists on the target provider. Overwrite it?",
  apply: "Apply configuration",
  applying: "Applying…",
  useSource: "Use this source",
  statusOk: "Applied: model {model} written to provider {route} ({count} models total). The Models page refreshes automatically.",
  reasonEmpty: "Reasoning efforts empty: check at least one non-off level, or choose non-reasoning.",
  dupLevel: 'Duplicate reasoning level: "{level}" may only appear once.',
  wireRequired: 'Level "{level}" needs a wire value; fill it in or uncheck the level.',
  needId: "Enter a model id.",
  needTarget: "Choose a target provider first."
};

// src/client/page.tsx
var zh = zh_default;
var en = en_default;
function emptyForm() {
  return { id: "", name: "", contextWindow: "", maxTokens: "", inputUnset: true, inputText: true, inputImage: false, reasoningMode: "unset", levels: [], compatThinkingFormat: "", compatSupportsReasoningEffort: "" };
}
function ModelConfiguratorPage(props) {
  const { t, call } = props;
  const [boot, setBoot] = React.useState({ providers: [], targets: [], writable: true, error: "" });
  const [sourceProvider, setSourceProvider] = React.useState("");
  const [sourceModels, setSourceModels] = React.useState([]);
  const [sourceModel, setSourceModel] = React.useState("");
  const [presetInfo, setPresetInfo] = React.useState(null);
  const [busyModel, setBusyModel] = React.useState(false);
  const [targetRoute, setTargetRoute] = React.useState("");
  const [form, setForm] = React.useState(emptyForm);
  const [loadedEntryId, setLoadedEntryId] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState(null);
  const [sourceOpen, setSourceOpen] = React.useState(false);
  const closeSourceRef = React.useRef(null);
  const modalRef = React.useRef(null);
  React.useEffect(() => {
    if (!sourceOpen) return;
    const prev = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSourceOpen(false);
        return;
      }
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    closeSourceRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [sourceOpen]);
  const fail = (err) => setStatus({ kind: "err", text: err?.message || String(err) });
  const refresh = async () => {
    const b = await call("target-providers");
    if (b && b.ok === true) setBoot((x) => ({ ...x, targets: b.providers, writable: b.writable !== false }));
  };
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [a, b] = await Promise.all([call("preset-providers"), call("target-providers")]);
        if (!alive) return;
        const errs = [];
        if (a.ok !== true) errs.push(a.error || "preset-providers failed");
        if (b.ok !== true) errs.push(b.error || "target-providers failed");
        setBoot({
          providers: a.ok === true ? a.providers : [],
          targets: b.ok === true ? b.providers : [],
          writable: b.ok === true ? b.writable !== false : true,
          error: errs.join("; ")
        });
      } catch (err) {
        if (alive) setBoot((x) => ({ ...x, error: err?.message || String(err) }));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  const target = boot.targets.find((x) => x.provider === targetRoute) || null;
  const targetModelIds = target ? [.../* @__PURE__ */ new Set([...target.models || [], ...target.catalogModels || []])] : [];
  const exists = targetModelIds.indexOf(form.id.trim()) >= 0;
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setLevel = (index, patch) => setForm((f) => ({
    ...f,
    levels: f.levels.map((row, i) => i === index ? { ...row, ...patch } : row)
  }));
  const removeLevel = (index) => setForm((f) => ({ ...f, levels: f.levels.filter((_, i) => i !== index) }));
  const addLevel = () => setForm((f) => {
    const used = new Set(f.levels.map((r) => r.level));
    const next = THINKING_LEVELS2.find((l) => !used.has(l)) || "low";
    return { ...f, levels: [...f.levels, { level: next, wire: "", on: true }] };
  });
  const allLevelsUsed = new Set(form.levels.map((r) => r.level)).size >= THINKING_LEVELS2.length;
  const loadEntry = (entry) => {
    setForm(entryToForm(entry));
    setLoadedEntryId(entry.id);
    setStatus(null);
  };
  const onIdChange = (value) => {
    const id = value.trim();
    set({ id: value });
    if (!target || !id) {
      setLoadedEntryId("");
      return;
    }
    const found = (target.entries || []).find((e) => e && e.id === id) || null;
    if (found && found.id !== loadedEntryId) loadEntry(found);
    else if (!found && loadedEntryId === id) setLoadedEntryId("");
  };
  const removeModel = async (modelId) => {
    if (deleting || !window.confirm(t("deleteConfirm").replace("{model}", modelId))) return;
    setDeleting(true);
    setStatus(null);
    try {
      const r = await call("delete-model", { route: targetRoute, modelId });
      if (!r || r.ok !== true) {
        setStatus({ kind: "err", text: r && r.error || "删除失败" });
        return;
      }
      setStatus({ kind: "ok", text: (r.revertedToCatalog === true ? t("statusDeletedCatalog") : t("statusDeleted")).replace("{model}", r.model).replace("{route}", r.route).replace("{count}", String(r.count)) });
      setForm(emptyForm());
      setLoadedEntryId("");
      await refresh();
    } catch (err) {
      fail(err);
    } finally {
      setDeleting(false);
    }
  };
  const clearSource = () => {
    setSourceProvider("");
    setSourceModel("");
    setPresetInfo(null);
    setSourceModels([]);
    setStatus(null);
  };
  const onSourceProvider = async (value) => {
    setSourceProvider(value);
    setSourceModel("");
    setPresetInfo(null);
    setSourceModels([]);
    setStatus(null);
    if (!value) return;
    setBusyModel(true);
    try {
      const r = await call("preset-models", { provider: value });
      if (!r || r.ok !== true) {
        setStatus({ kind: "err", text: r && r.error || "读取来源模型失败" });
        return;
      }
      setSourceModels(r.models);
    } catch (err) {
      fail(err);
    } finally {
      setBusyModel(false);
    }
  };
  const onPresetModel = async (model) => {
    setSourceModel(model);
    setStatus(null);
    if (!model) {
      setPresetInfo(null);
      return;
    }
    setBusyModel(true);
    try {
      const r = await call("preset-model-info", { provider: sourceProvider, model });
      if (!r || r.ok !== true) {
        setStatus({ kind: "err", text: r && r.error || "读取来源模型信息失败" });
        return;
      }
      setPresetInfo(r.info);
    } catch (err) {
      fail(err);
    } finally {
      setBusyModel(false);
    }
  };
  const applySource = () => {
    const info = presetInfo;
    const model = sourceModel;
    if (!info || !model) return;
    const levels = info.reasoning && info.reasoning.efforts && info.reasoning.efforts.length ? info.reasoning.efforts.filter((e) => THINKING_LEVELS2.indexOf(e.level) >= 0).map((e) => ({ level: e.level, wire: e.level === "off" ? "" : e.level, on: true })) : [];
    const rawInput = Array.isArray(info.input) ? info.input : [];
    const knownInput = rawInput.filter((m) => m === "text" || m === "image");
    const hasInput = knownInput.length > 0;
    setForm((f) => ({
      id: model,
      name: info.name || model,
      contextWindow: info.contextWindow ? String(info.contextWindow) : "",
      maxTokens: info.maxTokens ? String(info.maxTokens) : "",
      // Absent preset knowledge stays "unset" (catalog inheritance) instead
      // of being forced to an explicit default.
      inputUnset: !hasInput,
      inputText: !hasInput || knownInput.indexOf("text") >= 0,
      inputImage: knownInput.indexOf("image") >= 0,
      reasoningMode: levels.length ? "levels" : "unset",
      levels,
      compatThinkingFormat: f.compatThinkingFormat,
      compatSupportsReasoningEffort: f.compatSupportsReasoningEffort
    }));
    setLoadedEntryId("");
    setSourceOpen(false);
  };
  const apply2 = async () => {
    const id = form.id.trim();
    if (!targetRoute) {
      setStatus({ kind: "err", text: t("needTarget") });
      return;
    }
    if (!id) {
      setStatus({ kind: "err", text: t("needId") });
      return;
    }
    if (exists && !window.confirm(t("overwriteConfirm").replace("{model}", id))) {
      setStatus(null);
      return;
    }
    if (form.reasoningMode === "levels") {
      const seen = /* @__PURE__ */ new Set();
      for (const row of form.levels) {
        if (row.on !== true) continue;
        if (seen.has(row.level)) {
          setStatus({ kind: "err", text: t("dupLevel").replace("{level}", row.level) });
          return;
        }
        seen.add(row.level);
      }
      const emptyWire = form.levels.find((row) => row.on === true && row.level !== "off" && !String(row.wire || "").trim());
      if (emptyWire) {
        setStatus({ kind: "err", text: t("wireRequired").replace("{level}", emptyWire.level) });
        return;
      }
    }
    const entry = buildEntry(form);
    if (form.reasoningMode === "levels" && !entry.reasoningEfforts) {
      setStatus({ kind: "err", text: t("reasonEmpty") });
      return;
    }
    const clearFields = [];
    if (!form.name.trim()) clearFields.push("name");
    if (!form.contextWindow.trim()) clearFields.push("contextWindow");
    if (!form.maxTokens.trim()) clearFields.push("maxTokens");
    if (form.inputUnset || !form.inputText && !form.inputImage) clearFields.push("input");
    if (form.reasoningMode === "unset") clearFields.push("reasoningEfforts");
    if (form.compatThinkingFormat === "" && form.compatSupportsReasoningEffort === "") clearFields.push("compat");
    setBusy(true);
    setStatus(null);
    try {
      const r = await call("apply-model-config", { route: targetRoute, entry, overwrite: true, clearFields });
      if (!r || r.ok !== true) {
        setStatus({ kind: "err", text: r && r.error || "应用失败" });
        return;
      }
      setStatus({ kind: "ok", text: t("statusOk").replace("{model}", r.model).replace("{route}", r.route).replace("{count}", String(r.count)) });
      await refresh();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "mcfg-page" }, /* @__PURE__ */ React.createElement("h2", { className: "mcfg-title" }, t("title")), /* @__PURE__ */ React.createElement("p", { className: "mcfg-intro" }, t("intro")), boot.error ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-statusErr" }, boot.error) : null, boot.writable === false ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, t("readOnly")) : null, /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("targetRoute")), /* @__PURE__ */ React.createElement("select", { className: "mcfg-input mcfg-selectInput", value: targetRoute, onChange: (e) => {
    setTargetRoute(e.target.value);
    setLoadedEntryId("");
    setForm(emptyForm());
    setStatus(null);
  } }, /* @__PURE__ */ React.createElement("option", { value: "" }, t("targetRoutePlaceholder")), boot.targets.map((x) => /* @__PURE__ */ React.createElement("option", { key: x.provider, value: x.provider }, x.displayName + (x.declared ? " · " + t("customTag") : "")))), boot.targets.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, t("emptyTargets")) : null), target ? /* @__PURE__ */ React.createElement("section", { className: "mcfg-card" }, /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("targetModels")), /* @__PURE__ */ React.createElement("div", { className: "mcfg-idWrap" }, /* @__PURE__ */ React.createElement("input", { className: "mcfg-input mcfg-idInput", value: form.id, placeholder: "deepseek-v5", onChange: (e) => onIdChange(e.target.value) }), /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btn mcfg-shrink", disabled: boot.writable === false, onClick: () => setSourceOpen(true) }, t("usePreset"))), target.usesCatalog ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-note" }, t("catalogRouteNote")) : null, target.hasModelOverrides ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-note" }, t("overridesNote")) : null), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, target.entries.length ? target.entries.map((m) => /* @__PURE__ */ React.createElement("div", { key: m.id, className: "mcfg-row" }, /* @__PURE__ */ React.createElement("div", { className: "mcfg-field", style: { flex: "1" } }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, m.id), /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, modelSummary(m))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btn mcfg-shrink", disabled: boot.writable === false, onClick: () => loadEntry(m) }, t("editModel")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btn mcfg-shrink", disabled: deleting || boot.writable === false, onClick: () => removeModel(m.id) }, t("deleteModel")))) : target.usesCatalog && target.catalogModels.length ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, t("catalogModelsHint") + " " + target.catalogModels.join(", ")) : /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, t("noExplicitModels"))), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field mcfg-divider" }, /* @__PURE__ */ React.createElement("div", { className: "mcfg-row" }, /* @__PURE__ */ React.createElement("div", { className: "mcfg-field", style: { flex: "1" } }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("entryId")), /* @__PURE__ */ React.createElement("input", { className: "mcfg-input", value: form.id, onChange: (e) => onIdChange(e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field", style: { flex: "1" } }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("entryName")), /* @__PURE__ */ React.createElement("input", { className: "mcfg-input", value: form.name, onChange: (e) => set({ name: e.target.value }) }))), /* @__PURE__ */ React.createElement("div", { className: "mcfg-row" }, /* @__PURE__ */ React.createElement("div", { className: "mcfg-field", style: { flex: "1" } }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("contextWindowField")), /* @__PURE__ */ React.createElement("input", { className: "mcfg-input", type: "number", min: "1", placeholder: "262144", value: form.contextWindow, onChange: (e) => set({ contextWindow: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field", style: { flex: "1" } }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("maxTokensField")), /* @__PURE__ */ React.createElement("input", { className: "mcfg-input", type: "number", min: "1", placeholder: "32768", value: form.maxTokens, onChange: (e) => set({ maxTokens: e.target.value }) }))), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("inputField")), /* @__PURE__ */ React.createElement("div", { className: "mcfg-row" }, /* @__PURE__ */ React.createElement("label", { className: "mcfg-check" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: form.inputUnset, onChange: (e) => set({ inputUnset: e.target.checked }) }), t("inputUnset")), /* @__PURE__ */ React.createElement("label", { className: "mcfg-check" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: form.inputText, disabled: form.inputUnset, onChange: (e) => set({ inputText: e.target.checked }) }), "text"), /* @__PURE__ */ React.createElement("label", { className: "mcfg-check" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: form.inputImage, disabled: form.inputUnset, onChange: (e) => set({ inputImage: e.target.checked }) }), "image"))), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("reasoningField")), /* @__PURE__ */ React.createElement("select", { className: "mcfg-input mcfg-selectInput", value: form.reasoningMode, onChange: (e) => set({ reasoningMode: e.target.value }) }, /* @__PURE__ */ React.createElement("option", { value: "unset" }, t("reasoningModeUnset")), /* @__PURE__ */ React.createElement("option", { value: "off" }, t("reasoningModeOff")), /* @__PURE__ */ React.createElement("option", { value: "levels" }, t("reasoningModeLevels"))), form.reasoningMode === "levels" ? /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, form.levels.map((row, i) => (
    // Rows are fully controlled (no local state), so index
    // keys keep the DOM stable: changing a level select no
    // longer remounts the row and the wire input keeps focus.
    // Duplicate prevention comes from the disabled options
    // below plus the apply-time validation.
    /* @__PURE__ */ React.createElement("div", { key: i, className: "mcfg-row" }, /* @__PURE__ */ React.createElement("label", { className: "mcfg-check" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: row.on === true, onChange: (e) => setLevel(i, { on: e.target.checked }) })), /* @__PURE__ */ React.createElement("select", { className: "mcfg-input mcfg-selectInput mcfg-shrink", value: row.level, onChange: (e) => setLevel(i, { level: e.target.value }) }, THINKING_LEVELS2.map((l) => (
      // Levels already used by another row are disabled so
      // rows can never become duplicates.
      /* @__PURE__ */ React.createElement("option", { key: l, value: l, disabled: form.levels.some((r, j) => j !== i && r.level === l) }, l)
    ))), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "mcfg-input",
        value: row.wire,
        placeholder: row.level === "off" ? t("wireOffHint") : t("wirePlaceholder"),
        onChange: (e) => setLevel(i, { wire: e.target.value })
      }
    ), /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btn mcfg-shrink", "aria-label": t("removeLevel"), onClick: () => removeLevel(i) }, "×"))
  )), /* @__PURE__ */ React.createElement("div", { className: "mcfg-row" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btn", disabled: allLevelsUsed, onClick: addLevel }, "+ ", t("addLevel"))), /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, presetInfo && !(presetInfo.reasoning && presetInfo.reasoning.efforts.length) ? t("unknownReasoning") : t("reasoningHint"))) : null), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("compatField")), /* @__PURE__ */ React.createElement("div", { className: "mcfg-row" }, /* @__PURE__ */ React.createElement("div", { className: "mcfg-field", style: { flex: "1" } }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("compatThinkingFormat")), /* @__PURE__ */ React.createElement("select", { className: "mcfg-input mcfg-selectInput", value: form.compatThinkingFormat, onChange: (e) => set({ compatThinkingFormat: e.target.value }) }, /* @__PURE__ */ React.createElement("option", { value: "" }, t("compatUnset")), THINKING_FORMATS2.map((f) => /* @__PURE__ */ React.createElement("option", { key: f, value: f }, f)))), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field", style: { flex: "1" } }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("compatSupportsReasoningEffort")), /* @__PURE__ */ React.createElement("select", { className: "mcfg-input mcfg-selectInput", value: form.compatSupportsReasoningEffort, onChange: (e) => set({ compatSupportsReasoningEffort: e.target.value }) }, /* @__PURE__ */ React.createElement("option", { value: "" }, t("compatUnset")), /* @__PURE__ */ React.createElement("option", { value: "true" }, "true"), /* @__PURE__ */ React.createElement("option", { value: "false" }, "false")))), /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, t("compatHint"))))) : null, /* @__PURE__ */ React.createElement("div", { className: "mcfg-row" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btnPrimary", disabled: busy || boot.writable === false || !target, onClick: apply2 }, busy ? t("applying") : t("apply"))), status ? /* @__PURE__ */ React.createElement("p", { className: status.kind === "ok" ? "mcfg-statusOk" : "mcfg-statusErr", role: "status", "aria-live": "polite" }, status.text) : null, sourceOpen ? /* @__PURE__ */ React.createElement("div", { className: "mcfg-modalBackdrop", onClick: () => setSourceOpen(false) }, /* @__PURE__ */ React.createElement("div", { ref: modalRef, className: "mcfg-modal", role: "dialog", "aria-modal": "true", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "mcfg-modalHead" }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-modalTitle" }, t("sourceTitle")), /* @__PURE__ */ React.createElement("button", { ref: closeSourceRef, type: "button", className: "mcfg-btn mcfg-idBtn", "aria-label": t("sourceTitle") + " close", onClick: () => setSourceOpen(false) }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 12 12", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M3 3l6 6M9 3l-6 6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })))), !sourceProvider ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, t("sourceOptionalHint")) : null, /* @__PURE__ */ React.createElement("div", { className: "mcfg-row" }, /* @__PURE__ */ React.createElement("div", { className: "mcfg-field", style: { flex: "1" } }, /* @__PURE__ */ React.createElement("select", { className: "mcfg-input mcfg-selectInput", value: sourceProvider, disabled: busyModel, onChange: (e) => onSourceProvider(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, t("sourceProviderPlaceholder")), boot.providers.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.provider, value: p.provider }, p.displayName + (p.configured ? " · " + t("configuredTag") : "") + (p.declared ? " · " + t("customTag") : ""))))), sourceProvider ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btn mcfg-shrink", onClick: clearSource }, t("clearSource")) : null), sourceProvider ? /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, /* @__PURE__ */ React.createElement("select", { className: "mcfg-input mcfg-selectInput", value: sourceModel, disabled: busyModel, onChange: (e) => onPresetModel(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, t("sourceModelPlaceholder")), sourceModels.map((m) => /* @__PURE__ */ React.createElement("option", { key: m.id, value: m.id }, m.name))), busyModel ? /* @__PURE__ */ React.createElement("span", { className: "mcfg-hint" }, t("loading")) : null) : null, presetInfo ? /* @__PURE__ */ React.createElement("div", { className: "mcfg-info" }, /* @__PURE__ */ React.createElement("p", { className: "mcfg-infoLine" }, t("context") + ": " + (presetInfo.contextWindow ? String(presetInfo.contextWindow) : "—")), /* @__PURE__ */ React.createElement("p", { className: "mcfg-infoLine" }, t("output") + ": " + (presetInfo.maxTokens ? String(presetInfo.maxTokens) : "—")), /* @__PURE__ */ React.createElement("p", { className: "mcfg-infoLine" }, t("modalities") + ": " + (presetInfo.input && presetInfo.input.length ? presetInfo.input.join(", ") : "text")), /* @__PURE__ */ React.createElement("p", { className: "mcfg-infoLine" }, t("reasoningLevels") + ": " + (presetInfo.reasoning ? presetInfo.reasoning.efforts.map((e) => e.level).join(", ") : t("unknownReasoning")))) : null, sourceProvider && sourceModel ? /* @__PURE__ */ React.createElement("div", { className: "mcfg-modalActions" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btnPrimary", disabled: !presetInfo, onClick: applySource }, t("useSource"))) : null)) : null);
}

// src/client/static.tsx
var name = "dsh-provider-model-configurator";
var inject = ["slots", "remote", "locale"];
var NS = "settings.provider-model-configurator";
var SLOT_ID = "provider-model-configurator";
var SLOT_ORDER = 11;
var STYLE_ID = "dsh-provider-model-configurator-styles";
var METHOD_MAP = {
  "preset-providers": "presetProviders",
  "preset-models": "presetModels",
  "preset-model-info": "presetModelInfo",
  "target-providers": "targetProviders",
  "apply-model-config": "applyModelConfig",
  "delete-model": "deleteModel"
};
var PARAM_ORDER = {
  "preset-models": ["provider"],
  "preset-model-info": ["provider", "model"],
  "apply-model-config": ["route", "entry", "overwrite", "clearFields"],
  "delete-model": ["route", "modelId"]
};
function adoptStyles(cssText) {
  if (document.getElementById(STYLE_ID) !== null) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = cssText;
  document.head.appendChild(style);
}
function apply(ctx) {
  const locale = ctx.get("locale") ?? ctx.locale;
  if (locale !== void 0) {
    ctx.effect(() => locale.register(NS, { zh, en }), "dsh-provider-model-configurator: dictionaries");
  }
  const t = locale !== void 0 ? locale.bind(NS) : (key) => key;
  adoptStyles(page_default);
  let remote = null;
  ctx.effect(async () => {
    const dispose = await ctx.remote.$mount({ package: name, descriptors: INVOCATIONS });
    const handle = ctx.reflect.get("remote.modelConfigurator");
    if (handle === void 0) {
      throw new Error("dsh-provider-model-configurator: the modelConfigurator Remote namespace did not mount");
    }
    remote = handle;
    return () => {
      remote = null;
      void dispose();
    };
  }, "dsh-provider-model-configurator: remote");
  const call = async (method, payload) => {
    if (remote === null) throw new Error(t("remotePending"));
    const remoteName = METHOD_MAP[method];
    const args = (PARAM_ORDER[method] || []).map((key) => (payload || {})[key]);
    const r = await remote[remoteName](...args);
    const msgOf = (e) => typeof e === "string" ? e : e && typeof e === "object" && typeof e.message === "string" ? e.message : "";
    if (r === null || typeof r !== "object" || r.ok !== true) {
      throw new Error(msgOf(r?.error) || "调用失败");
    }
    const value = r.value;
    if (value && value.ok === true) return value;
    throw new Error(msgOf(value?.error) || "调用失败");
  };
  const slots = ctx.get("slots") ?? ctx.slots;
  if (slots === void 0) return;
  slots.inject("settings.section", () => slots.register(
    { name: "settings.section", id: SLOT_ID, order: SLOT_ORDER, label: () => t("nav") },
    () => React.createElement(ModelConfiguratorPage, { t, call })
  ));
}
return module.exports; } });
