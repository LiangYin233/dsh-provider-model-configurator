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
      { name: "overwrite", wire: "overwrite", source: "json", codec: codec("Boolean", booleanSchema) }
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
var THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"];
function buildEntry(form) {
  const e = { id: form.id.trim() };
  if (form.name && form.name.trim()) e.name = form.name.trim();
  const cw = Number(form.contextWindow);
  if (Number.isInteger(cw) && cw > 0) e.contextWindow = cw;
  const mt = Number(form.maxTokens);
  if (Number.isInteger(mt) && mt > 0) e.maxTokens = mt;
  const input = [];
  if (form.inputText) input.push("text");
  if (form.inputImage) input.push("image");
  if (input.length) e.input = input;
  if (form.reasoningMode === "off") {
    e.reasoningEfforts = false;
  } else {
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
  return e;
}
function entryToForm(entry) {
  const input = Array.isArray(entry.input) ? entry.input : [];
  const keys = entry.reasoningEfforts && typeof entry.reasoningEfforts === "object" && !Array.isArray(entry.reasoningEfforts) ? Object.keys(entry.reasoningEfforts) : [];
  return {
    id: typeof entry.id === "string" ? entry.id : "",
    name: (typeof entry.name === "string" ? entry.name : "") || (typeof entry.id === "string" ? entry.id : ""),
    contextWindow: entry.contextWindow ? String(entry.contextWindow) : "",
    maxTokens: entry.maxTokens ? String(entry.maxTokens) : "",
    inputText: !input.length || input.indexOf("text") >= 0,
    inputImage: input.indexOf("image") >= 0,
    reasoningMode: keys.length ? "levels" : "off",
    levels: keys.map((level) => ({
      level,
      wire: level === "off" ? "" : typeof entry.reasoningEfforts[level] === "string" ? entry.reasoningEfforts[level] : "",
      on: true
    }))
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
  return parts.length ? parts.join(" \xB7 ") : "\u2014";
}

// src/client/page.css
var page_default = "/* Provider Model Configurator \u2014 settings page styles.\n   Only --dsw-alias-* semantic tokens, so the page follows the system theme. */\n\n.mcfg-page {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  max-width: 720px;\n  padding: 4px 2px 24px;\n  color: var(--dsw-alias-label-primary);\n}\n\n.mcfg-title {\n  color: var(--dsw-alias-label-primary);\n  font-size: 16px;\n  font-weight: 500;\n  line-height: 24px;\n  margin: 0;\n}\n\n.mcfg-intro {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 14px;\n  line-height: 22px;\n  margin: 0;\n}\n\n.mcfg-card {\n  background: var(--dsw-alias-bg-layer-2);\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: 12px;\n  padding: 14px 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n\n.mcfg-cardTitle {\n  color: var(--dsw-alias-label-primary);\n  font-size: 14px;\n  font-weight: 500;\n  line-height: 20px;\n  margin: 0;\n}\n\n.mcfg-field {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.mcfg-label {\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 16px;\n}\n\n.mcfg-input {\n  box-sizing: border-box;\n  width: 100%;\n  height: 32px;\n  padding: 0 10px;\n  border-radius: 8px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  background: var(--dsw-alias-bg-base);\n  color: var(--dsw-alias-label-primary);\n  font-family: inherit;\n  font-size: 13px;\n}\n\n.mcfg-input:focus {\n  outline: none;\n  border-color: var(--dsw-alias-brand-primary);\n}\n\n.mcfg-input:disabled {\n  opacity: 0.55;\n}\n\n.mcfg-selectInput {\n  appearance: auto;\n}\n\n.mcfg-shrink {\n  width: auto;\n  flex: none;\n}\n\n.mcfg-row {\n  display: flex;\n  flex-direction: row;\n  gap: 8px;\n  align-items: center;\n}\n\n.mcfg-hint {\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 18px;\n  margin: 0;\n}\n\n.mcfg-note {\n  color: var(--dsw-alias-state-warn-primary);\n  font-size: 12px;\n  line-height: 18px;\n  margin: 0;\n}\n\n.mcfg-divider {\n  border-top: 1px solid var(--dsw-alias-border-l1);\n  padding-top: 12px;\n  margin-top: 4px;\n}\n\n/* Model-id input with a dropdown trigger button (floating menu). */\n.mcfg-idWrap {\n  position: relative;\n  display: flex;\n  gap: 6px;\n}\n\n.mcfg-idInput {\n  flex: 1;\n}\n\n.mcfg-idBtn {\n  width: 34px;\n  flex: none;\n  padding: 0;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  color: var(--dsw-alias-label-secondary);\n}\n\n.mcfg-idBtn svg {\n  display: block;\n}\n\n.mcfg-idBtn:hover {\n  color: var(--dsw-alias-label-primary);\n}\n\n.mcfg-idBackdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 19;\n}\n\n.mcfg-idMenu {\n  position: absolute;\n  top: calc(100% + 4px);\n  left: 0;\n  right: 0;\n  z-index: 20;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  max-height: 240px;\n  overflow-y: auto;\n  padding: 4px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: 8px;\n  background: var(--dsw-alias-bg-overlay);\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);\n}\n\n.mcfg-idItem {\n  box-sizing: border-box;\n  width: 100%;\n  padding: 6px 8px;\n  border: none;\n  border-radius: 6px;\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n  font-family: inherit;\n  font-size: 13px;\n  line-height: 18px;\n  text-align: left;\n  cursor: pointer;\n}\n\n.mcfg-idItem:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n.mcfg-info {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  border-left: 2px solid var(--dsw-alias-border-l1);\n  padding-left: 10px;\n}\n\n.mcfg-infoLine {\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 18px;\n  margin: 0;\n}\n\n.mcfg-btn {\n  box-sizing: border-box;\n  height: 32px;\n  padding: 0 14px;\n  border-radius: 8px;\n  border: 1px solid var(--dsw-alias-border-l1);\n  background: var(--dsw-alias-bg-base);\n  color: var(--dsw-alias-label-primary);\n  font-family: inherit;\n  font-size: 13px;\n  cursor: pointer;\n}\n\n.mcfg-btn:hover {\n  background: var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-1));\n}\n\n.mcfg-btnPrimary {\n  box-sizing: border-box;\n  height: 32px;\n  padding: 0 16px;\n  border-radius: 8px;\n  border: none;\n  background: var(--dsw-alias-brand-primary);\n  color: #fff;\n  font-family: inherit;\n  font-size: 13px;\n  font-weight: 500;\n  cursor: pointer;\n}\n\n.mcfg-btnPrimary:disabled {\n  opacity: 0.5;\n  cursor: default;\n}\n\n.mcfg-check {\n  display: flex;\n  flex-direction: row;\n  gap: 8px;\n  align-items: center;\n  color: var(--dsw-alias-label-primary);\n  font-size: 13px;\n  cursor: pointer;\n}\n\n.mcfg-statusOk {\n  color: var(--dsw-alias-state-success-primary);\n  font-size: 13px;\n  line-height: 20px;\n  margin: 0;\n}\n\n.mcfg-statusErr {\n  color: var(--dsw-alias-state-error-primary);\n  font-size: 13px;\n  line-height: 20px;\n  margin: 0;\n}\n\n.mcfg-code {\n  background: var(--dsw-alias-bg-base);\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: 8px;\n  padding: 10px;\n  font-family: ui-monospace, Consolas, monospace;\n  font-size: 12px;\n  line-height: 18px;\n  white-space: pre-wrap;\n  word-break: break-all;\n  color: var(--dsw-alias-label-secondary);\n  max-height: 260px;\n  overflow: auto;\n  margin: 0;\n}\n";

// src/client/locales/zh.json
var zh_default = {
  nav: "\u6A21\u578B Pro",
  title: "\u6A21\u578B Pro",
  intro: "\u96C6\u4E2D\u7BA1\u7406\u5DF2\u914D\u7F6E\u63D0\u4F9B\u5546\u4E0B\u7684\u6A21\u578B\u914D\u7F6E:\u67E5\u770B\u3001\u65B0\u5EFA\u3001\u7F16\u8F91\u3001\u590D\u5236\u4E0E\u5220\u9664\u6A21\u578B\u6761\u76EE(\u4E0A\u4E0B\u6587\u7A97\u53E3\u3001\u6700\u5927\u8F93\u51FA\u3001\u8F93\u5165\u6A21\u6001\u3001\u63A8\u7406\u6863\u4F4D)\u3002\u53EF\u501F\u52A9 pi-ai \u5B89\u88C5\u76EE\u5F55(\u9884\u8BBE)\u6216\u4EFB\u610F\u5176\u4ED6\u63D0\u4F9B\u5546\u7684\u6A21\u578B\u6570\u636E\u5FEB\u901F\u586B\u5145\u2014\u2014\u65B0\u6A21\u578B\u53D1\u5E03\u800C\u76EE\u5F55\u672A\u66F4\u65B0\u65F6,\u4E0D\u5FC5\u624B\u67E5\u5B57\u6BB5\u3002",
  readOnly: "\u5F53\u524D\u8BBE\u7F6E\u4E3A\u53EA\u8BFB,\u65E0\u6CD5\u5199\u5165\u3002",
  remotePending: "\u8FDC\u7A0B\u670D\u52A1\u5C1A\u672A\u5C31\u7EEA,\u8BF7\u7A0D\u5019\u2026",
  sourceTitle: "\u590D\u5236\u6765\u6E90(\u53EF\u9009,\u7528\u4E8E\u5FEB\u901F\u586B\u5145)",
  sourceOptionalHint: "\u672A\u9009\u62E9\u590D\u5236\u6765\u6E90:\u53EF\u76F4\u63A5\u5728\u4E0B\u65B9\u6A21\u578B\u914D\u7F6E\u533A\u624B\u52A8\u586B\u5199(\u9AD8\u7EA7\u6A21\u5F0F),\u6216\u9009\u62E9\u6765\u6E90\u5FEB\u901F\u586B\u5145\u3002",
  clearSource: "\u6E05\u9664\u6765\u6E90,\u624B\u52A8\u586B\u5199",
  sourceProvider: "\u590D\u5236\u6765\u6E90\u63D0\u4F9B\u5546",
  sourceProviderPlaceholder: "\u9009\u62E9\u63D0\u4F9B\u5546(\u9884\u8BBE\u76EE\u5F55 / \u5DF2\u914D\u7F6E,\u53EF\u8DF3\u8FC7)",
  sourceModel: "\u6765\u6E90\u6A21\u578B",
  sourceModelPlaceholder: "\u9009\u62E9\u6A21\u578B",
  loading: "\u52A0\u8F7D\u4E2D\u2026",
  presetInfo: "\u6765\u6E90\u6A21\u578B\u4FE1\u606F",
  context: "\u4E0A\u4E0B\u6587\u7A97\u53E3",
  output: "\u6700\u5927\u8F93\u51FA",
  modalities: "\u8F93\u5165\u6A21\u6001",
  reasoningLevels: "\u63A8\u7406\u6863\u4F4D",
  unknownReasoning: "\u65E0\u53EF\u7528\u63A8\u7406\u6863\u4F4D\u4FE1\u606F",
  configuredTag: "\u5DF2\u914D\u7F6E",
  customTag: "\u81EA\u5B9A\u4E49",
  targetRoute: "\u76EE\u6807\u63D0\u4F9B\u5546",
  targetRoutePlaceholder: "\u9009\u62E9\u5DF2\u914D\u7F6E\u7684\u63D0\u4F9B\u5546",
  targetModels: "\u6A21\u578B ID(\u53EF\u8F93\u5165\u65B0\u6A21\u578B,\u6216\u4ECE\u4E0B\u65B9\u5217\u8868/\u73B0\u6709\u6A21\u578B\u4E2D\u9009\u62E9)",
  editModel: "\u7F16\u8F91",
  deleteModel: "\u5220\u9664",
  deleteConfirm: "\u786E\u5B9A\u5220\u9664\u6A21\u578B\u300C{model}\u300D\u5417?\u6B64\u64CD\u4F5C\u4F1A\u7ACB\u5373\u5199\u5165\u8BBE\u7F6E\u3002",
  statusDeleted: "\u5DF2\u5220\u9664\u6A21\u578B {model}(\u63D0\u4F9B\u5546 {route} \u5269\u4F59 {count} \u4E2A\u6A21\u578B)",
  statusDeletedCatalog: "\u5DF2\u5220\u9664\u6A21\u578B {model};\u8BE5\u63D0\u4F9B\u5546\u5DF2\u6062\u590D\u4F7F\u7528\u5185\u7F6E\u76EE\u5F55\u3002",
  catalogModelsHint: "\u5185\u7F6E\u76EE\u5F55\u6A21\u578B(\u53EA\u8BFB):",
  noExplicitModels: "\u8BE5\u63D0\u4F9B\u5546\u6682\u65E0\u663E\u5F0F\u6A21\u578B\u6761\u76EE:\u5728\u4E0B\u65B9\u8F93\u5165\u6A21\u578B ID \u5E76\u300C\u5E94\u7528\u914D\u7F6E\u300D\u5373\u53EF\u6DFB\u52A0\u3002",
  catalogRouteNote: "\u8BE5\u63D0\u4F9B\u5546\u5F53\u524D\u4F7F\u7528\u5185\u7F6E\u76EE\u5F55;\u5E94\u7528\u540E\u4F1A\u81EA\u52A8\u8F6C\u4E3A\u663E\u5F0F\u6A21\u578B\u5217\u8868,\u5E76\u4FDD\u7559\u5168\u90E8\u76EE\u5F55\u6A21\u578B\u3002",
  overridesNote: "\u8BE5\u63D0\u4F9B\u5546\u5E26\u6709\u6A21\u578B\u8986\u76D6(modelOverrides);\u5E94\u7528\u65F6\u4F1A\u81EA\u52A8\u5C06\u5176\u5408\u5E76\u8FDB\u663E\u5F0F\u6A21\u578B\u5217\u8868,\u4E0D\u4F1A\u4E22\u5931\u3002",
  emptyTargets: "\u6682\u65E0\u5DF2\u914D\u7F6E\u7684\u63D0\u4F9B\u5546\u3002\u8BF7\u5148\u5728 Models \u9875\u914D\u7F6E\u63D0\u4F9B\u5546(\u53EF\u65B0\u5EFA\u81EA\u5B9A\u4E49\u63D0\u4F9B\u5546)\u3002",
  entryId: "\u6A21\u578B ID",
  entryName: "\u663E\u793A\u540D\u79F0",
  contextWindowField: "\u4E0A\u4E0B\u6587\u7A97\u53E3 (tokens)",
  maxTokensField: "\u6700\u5927\u8F93\u51FA (tokens)",
  inputField: "\u8F93\u5165\u6A21\u6001",
  reasoningField: "\u63A8\u7406\u6863\u4F4D",
  reasoningMode: "\u63A8\u7406\u6A21\u5F0F",
  reasoningModeLevels: "\u542F\u7528\u63A8\u7406(\u6309\u6863\u4F4D)",
  reasoningModeOff: "\u975E\u63A8\u7406\u6A21\u578B(reasoningEfforts: false)",
  reasoningHint: "wire \u503C\u5373\u8BF7\u6C42\u53D1\u9001\u7684 reasoning_effort \u53C2\u6570\u3002\u6863\u4F4D\u540D\u4E0E\u7F51\u5173\u53D6\u503C\u4E0D\u4E00\u81F4\u65F6\u8BF7\u6309\u6765\u6E90\u6A21\u578B\u5B9E\u9645\u60C5\u51B5\u4FEE\u6539(\u5982 deepseek \u7CFB\u5217\u7684 minimal/low/medium \u5E38\u7559\u7A7A);off \u7559\u7A7A\u8868\u793A\u4E0D\u53D1\u9001\u3002",
  addLevel: "\u6DFB\u52A0\u6863\u4F4D",
  removeLevel: "\u79FB\u9664",
  wirePlaceholder: "wire \u503C(\u5982 high)",
  wireOffHint: "off:\u4E0D\u53D1\u9001",
  overwriteLabel: "\u8986\u76D6\u73B0\u6709\u540C\u540D\u6A21\u578B",
  overwriteHint: "\u8BE5\u6A21\u578B ID \u5DF2\u5B58\u5728\u4E8E\u76EE\u6807\u63D0\u4F9B\u5546\u3002",
  loadedHint: "\u5DF2\u8F7D\u5165\u8BE5\u6A21\u578B\u7684\u5F53\u524D\u914D\u7F6E,\u53EF\u4FEE\u6539\u540E\u91CD\u65B0\u5E94\u7528;\u672A\u7F16\u8F91\u7684\u5B57\u6BB5\u4F1A\u4FDD\u7559\u3002",
  apply: "\u5E94\u7528\u914D\u7F6E",
  applying: "\u5E94\u7528\u4E2D\u2026",
  preview: "\u9884\u89C8\u5199\u5165\u5185\u5BB9",
  statusOk: "\u5DF2\u5E94\u7528:\u6A21\u578B {model} \u5DF2\u5199\u5165\u63D0\u4F9B\u5546 {route}(\u5171 {count} \u4E2A\u6A21\u578B)\u3002Models \u9875\u5C06\u81EA\u52A8\u5237\u65B0\u3002",
  reasonEmpty: "\u63A8\u7406\u6863\u4F4D\u4E3A\u7A7A:\u8BF7\u81F3\u5C11\u52FE\u9009\u4E00\u4E2A\u975E off \u6863\u4F4D,\u6216\u9009\u62E9\u300C\u975E\u63A8\u7406\u6A21\u578B\u300D\u3002",
  needTarget: "\u8BF7\u5148\u9009\u62E9\u76EE\u6807\u63D0\u4F9B\u5546\u3002"
};

// src/client/locales/en.json
var en_default = {
  nav: "Model Pro",
  title: "Model Pro",
  intro: "Manage model configurations across your configured providers in one place: view, create, edit, copy and delete model entries (context window, max output, input modalities, reasoning efforts). Quick-fill from the pi-ai installed catalog (preset) or any other provider \u2014 no need to look fields up by hand while the catalog lags new releases.",
  readOnly: "Settings are read-only; writes are disabled.",
  remotePending: "Remote service is not ready yet\u2026",
  sourceTitle: "Copy source (optional, for quick fill)",
  sourceOptionalHint: "No copy source selected: configure the model by hand in the form below (advanced mode), or pick a source for quick fill.",
  clearSource: "Clear source, configure manually",
  sourceProvider: "Copy source provider",
  sourceProviderPlaceholder: "Choose a provider (preset catalog / configured, optional)",
  sourceModel: "Source model",
  sourceModelPlaceholder: "Choose a model",
  loading: "Loading\u2026",
  presetInfo: "Source model info",
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
  reasoningField: "Reasoning efforts",
  reasoningMode: "Reasoning mode",
  reasoningModeLevels: "Reasoning (per level)",
  reasoningModeOff: "Non-reasoning model (reasoningEfforts: false)",
  reasoningHint: "wire is the reasoning_effort value sent on the wire. Adjust it when the gateway differs from the level name (e.g. deepseek-family minimal/low/medium are often empty); off with empty wire sends nothing.",
  addLevel: "Add level",
  removeLevel: "Remove",
  wirePlaceholder: "wire value (e.g. high)",
  wireOffHint: "off: send nothing",
  overwriteLabel: "Overwrite the existing model with the same id",
  overwriteHint: "This model id already exists on the target provider.",
  loadedHint: "Loaded the model's current configuration \u2014 edit and re-apply; untouched fields are kept.",
  apply: "Apply configuration",
  applying: "Applying\u2026",
  preview: "Preview write",
  statusOk: "Applied: model {model} written to provider {route} ({count} models total). The Models page refreshes automatically.",
  reasonEmpty: "Reasoning efforts empty: check at least one non-off level, or choose non-reasoning.",
  needTarget: "Choose a target provider first."
};

// src/client/page.tsx
var zh = zh_default;
var en = en_default;
function ModelConfiguratorPage(props) {
  const { t, call } = props;
  const [boot, setBoot] = React.useState({ providers: [], targets: [], writable: true, error: "" });
  const [sourceProvider, setSourceProvider] = React.useState("");
  const [sourceModels, setSourceModels] = React.useState([]);
  const [sourceModel, setSourceModel] = React.useState("");
  const [presetInfo, setPresetInfo] = React.useState(null);
  const [busyModel, setBusyModel] = React.useState(false);
  const [targetRoute, setTargetRoute] = React.useState("");
  const [form, setForm] = React.useState({ id: "", name: "", contextWindow: "", maxTokens: "", inputText: true, inputImage: false, reasoningMode: "off", levels: [] });
  const [overwrite, setOverwrite] = React.useState(false);
  const [loadedEntryId, setLoadedEntryId] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [idMenuOpen, setIdMenuOpen] = React.useState(false);
  const fail = (err) => setStatus({ kind: "err", text: err?.message || String(err) });
  const refresh = async () => {
    const b = await call("target-providers");
    if (b && b.ok === true) setBoot((x) => ({ ...x, targets: b.providers }));
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
  const addLevel = () => setForm((f) => ({ ...f, levels: [...f.levels, { level: "low", wire: "", on: true }] }));
  const loadEntry = (entry) => {
    setForm(entryToForm(entry));
    setLoadedEntryId(entry.id);
    setOverwrite(false);
    setStatus(null);
  };
  const onIdChange = (value) => {
    const id = value.trim();
    set({ id: value });
    setOverwrite(false);
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
        setStatus({ kind: "err", text: r && r.error || "\u5220\u9664\u5931\u8D25" });
        return;
      }
      setStatus({ kind: "ok", text: (r.revertedToCatalog === true ? t("statusDeletedCatalog") : t("statusDeleted")).replace("{model}", r.model).replace("{route}", r.route).replace("{count}", String(r.count)) });
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
        setStatus({ kind: "err", text: r && r.error || "\u8BFB\u53D6\u6765\u6E90\u6A21\u578B\u5931\u8D25" });
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
        setStatus({ kind: "err", text: r && r.error || "\u8BFB\u53D6\u6765\u6E90\u6A21\u578B\u4FE1\u606F\u5931\u8D25" });
        return;
      }
      const info = r.info;
      setPresetInfo(info);
      const levels = info.reasoning && info.reasoning.efforts && info.reasoning.efforts.length ? info.reasoning.efforts.map((e) => ({ level: e.level, wire: e.level === "off" ? "" : e.level, on: true })) : [];
      setForm({
        id: model,
        name: info.name || model,
        contextWindow: info.contextWindow ? String(info.contextWindow) : "",
        maxTokens: info.maxTokens ? String(info.maxTokens) : "",
        inputText: !info.input || info.input.indexOf("text") >= 0,
        inputImage: !!(info.input && info.input.indexOf("image") >= 0),
        reasoningMode: levels.length ? "levels" : "off",
        levels
      });
      setOverwrite(false);
      setLoadedEntryId("");
    } catch (err) {
      fail(err);
    } finally {
      setBusyModel(false);
    }
  };
  const apply2 = async () => {
    const id = form.id.trim();
    if (!targetRoute) {
      setStatus({ kind: "err", text: t("needTarget") });
      return;
    }
    if (!id) {
      setStatus({ kind: "err", text: t("entryId") + "?" });
      return;
    }
    const entry = buildEntry(form);
    if (form.reasoningMode === "levels" && !entry.reasoningEfforts) {
      setStatus({ kind: "err", text: t("reasonEmpty") });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const r = await call("apply-model-config", { route: targetRoute, entry, overwrite: overwrite === true });
      if (!r || r.ok !== true) {
        setStatus({ kind: "err", text: r && r.error || "\u5E94\u7528\u5931\u8D25" });
        return;
      }
      setStatus({ kind: "ok", text: t("statusOk").replace("{model}", r.model).replace("{route}", r.route).replace("{count}", String(r.count)) });
      setOverwrite(false);
      await refresh();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };
  const previewEntry = targetRoute ? buildEntry(form) : null;
  return /* @__PURE__ */ React.createElement("div", { className: "mcfg-page" }, /* @__PURE__ */ React.createElement("h2", { className: "mcfg-title" }, t("title")), /* @__PURE__ */ React.createElement("p", { className: "mcfg-intro" }, t("intro")), boot.error ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-statusErr" }, boot.error) : null, boot.writable === false ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, t("readOnly")) : null, /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("targetRoute")), /* @__PURE__ */ React.createElement("select", { className: "mcfg-input mcfg-selectInput", value: targetRoute, onChange: (e) => {
    setTargetRoute(e.target.value);
    setLoadedEntryId("");
    setIdMenuOpen(false);
  } }, /* @__PURE__ */ React.createElement("option", { value: "" }, t("targetRoutePlaceholder")), boot.targets.map((x) => /* @__PURE__ */ React.createElement("option", { key: x.provider, value: x.provider }, x.displayName + (x.declared ? " \xB7 " + t("customTag") : "")))), boot.targets.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, t("emptyTargets")) : null), target ? /* @__PURE__ */ React.createElement("section", { className: "mcfg-card" }, /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("targetModels")), /* @__PURE__ */ React.createElement("div", { className: "mcfg-idWrap" }, /* @__PURE__ */ React.createElement("input", { className: "mcfg-input mcfg-idInput", value: form.id, placeholder: "deepseek-v5", onChange: (e) => onIdChange(e.target.value) }), /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btn mcfg-idBtn", "aria-label": t("targetModels"), onClick: () => setIdMenuOpen(!idMenuOpen) }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 12 12", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M3 4.5L6 7.5L9 4.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }))), idMenuOpen ? /* @__PURE__ */ React.createElement("div", { className: "mcfg-idBackdrop", onClick: () => setIdMenuOpen(false) }) : null, idMenuOpen ? /* @__PURE__ */ React.createElement("div", { className: "mcfg-idMenu" }, targetModelIds.map((id) => /* @__PURE__ */ React.createElement("button", { key: id, type: "button", className: "mcfg-idItem", onClick: () => {
    onIdChange(id);
    setIdMenuOpen(false);
  } }, id))) : null), target.usesCatalog ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-note" }, t("catalogRouteNote")) : null, target.hasModelOverrides ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-note" }, t("overridesNote")) : null), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, target.entries.length ? target.entries.map((m) => /* @__PURE__ */ React.createElement("div", { key: m.id, className: "mcfg-row" }, /* @__PURE__ */ React.createElement("div", { className: "mcfg-field", style: { flex: "1" } }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, m.id), /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, modelSummary(m))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btn mcfg-shrink", onClick: () => loadEntry(m) }, t("editModel")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btn mcfg-shrink", disabled: deleting, onClick: () => removeModel(m.id) }, t("deleteModel")))) : target.usesCatalog && target.catalogModels.length ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, t("catalogModelsHint") + " " + target.catalogModels.join(", ")) : /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, t("noExplicitModels"))), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field mcfg-divider" }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("sourceTitle")), !sourceProvider ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, t("sourceOptionalHint")) : null, /* @__PURE__ */ React.createElement("div", { className: "mcfg-row" }, /* @__PURE__ */ React.createElement("div", { className: "mcfg-field", style: { flex: "1" } }, /* @__PURE__ */ React.createElement("select", { className: "mcfg-input mcfg-selectInput", value: sourceProvider, disabled: busyModel, onChange: (e) => onSourceProvider(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, t("sourceProviderPlaceholder")), boot.providers.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.provider, value: p.provider }, p.displayName + (p.configured ? " \xB7 " + t("configuredTag") : "") + (p.declared ? " \xB7 " + t("customTag") : ""))))), sourceProvider ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btn mcfg-shrink", onClick: clearSource }, t("clearSource")) : null), sourceProvider ? /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, /* @__PURE__ */ React.createElement("select", { className: "mcfg-input mcfg-selectInput", value: sourceModel, disabled: busyModel, onChange: (e) => onPresetModel(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, t("sourceModelPlaceholder")), sourceModels.map((m) => /* @__PURE__ */ React.createElement("option", { key: m.id, value: m.id }, m.name))), busyModel ? /* @__PURE__ */ React.createElement("span", { className: "mcfg-hint" }, t("loading")) : null) : null, presetInfo ? /* @__PURE__ */ React.createElement("div", { className: "mcfg-info" }, /* @__PURE__ */ React.createElement("p", { className: "mcfg-infoLine" }, t("context") + ": " + (presetInfo.contextWindow ? String(presetInfo.contextWindow) : "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "mcfg-infoLine" }, t("output") + ": " + (presetInfo.maxTokens ? String(presetInfo.maxTokens) : "\u2014")), /* @__PURE__ */ React.createElement("p", { className: "mcfg-infoLine" }, t("modalities") + ": " + (presetInfo.input && presetInfo.input.length ? presetInfo.input.join(", ") : "text")), /* @__PURE__ */ React.createElement("p", { className: "mcfg-infoLine" }, t("reasoningLevels") + ": " + (presetInfo.reasoning ? presetInfo.reasoning.efforts.map((e) => e.level).join(", ") : t("unknownReasoning")))) : null), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field mcfg-divider" }, loadedEntryId === form.id.trim() ? /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, t("loadedHint")) : null, /* @__PURE__ */ React.createElement("div", { className: "mcfg-row" }, /* @__PURE__ */ React.createElement("div", { className: "mcfg-field", style: { flex: "1" } }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("entryId")), /* @__PURE__ */ React.createElement("input", { className: "mcfg-input", value: form.id, onChange: (e) => onIdChange(e.target.value) })), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field", style: { flex: "1" } }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("entryName")), /* @__PURE__ */ React.createElement("input", { className: "mcfg-input", value: form.name, onChange: (e) => set({ name: e.target.value }) }))), /* @__PURE__ */ React.createElement("div", { className: "mcfg-row" }, /* @__PURE__ */ React.createElement("div", { className: "mcfg-field", style: { flex: "1" } }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("contextWindowField")), /* @__PURE__ */ React.createElement("input", { className: "mcfg-input", type: "number", min: "1", placeholder: "262144", value: form.contextWindow, onChange: (e) => set({ contextWindow: e.target.value }) })), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field", style: { flex: "1" } }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("maxTokensField")), /* @__PURE__ */ React.createElement("input", { className: "mcfg-input", type: "number", min: "1", placeholder: "32768", value: form.maxTokens, onChange: (e) => set({ maxTokens: e.target.value }) }))), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("inputField")), /* @__PURE__ */ React.createElement("div", { className: "mcfg-row" }, /* @__PURE__ */ React.createElement("label", { className: "mcfg-check" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: form.inputText, onChange: (e) => set({ inputText: e.target.checked }) }), "text"), /* @__PURE__ */ React.createElement("label", { className: "mcfg-check" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: form.inputImage, onChange: (e) => set({ inputImage: e.target.checked }) }), "image"))), /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, /* @__PURE__ */ React.createElement("span", { className: "mcfg-label" }, t("reasoningField")), /* @__PURE__ */ React.createElement("select", { className: "mcfg-input mcfg-selectInput", value: form.reasoningMode, onChange: (e) => set({ reasoningMode: e.target.value }) }, /* @__PURE__ */ React.createElement("option", { value: "off" }, t("reasoningModeOff")), /* @__PURE__ */ React.createElement("option", { value: "levels" }, t("reasoningModeLevels"))), form.reasoningMode === "levels" ? /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, form.levels.map((row, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "mcfg-row" }, /* @__PURE__ */ React.createElement("label", { className: "mcfg-check" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: row.on === true, onChange: (e) => setLevel(i, { on: e.target.checked }) })), /* @__PURE__ */ React.createElement("select", { className: "mcfg-input mcfg-selectInput mcfg-shrink", value: row.level, onChange: (e) => setLevel(i, { level: e.target.value }) }, THINKING_LEVELS.map((l) => /* @__PURE__ */ React.createElement("option", { key: l, value: l }, l))), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "mcfg-input",
      value: row.wire,
      placeholder: row.level === "off" ? t("wireOffHint") : t("wirePlaceholder"),
      onChange: (e) => setLevel(i, { wire: e.target.value })
    }
  ), /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btn mcfg-shrink", "aria-label": t("removeLevel"), onClick: () => removeLevel(i) }, "\xD7"))), /* @__PURE__ */ React.createElement("div", { className: "mcfg-row" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btn", onClick: addLevel }, "+ ", t("addLevel"))), /* @__PURE__ */ React.createElement("p", { className: "mcfg-hint" }, presetInfo && !(presetInfo.reasoning && presetInfo.reasoning.efforts.length) ? t("unknownReasoning") : t("reasoningHint"))) : null), exists ? /* @__PURE__ */ React.createElement("div", { className: "mcfg-field" }, /* @__PURE__ */ React.createElement("p", { className: "mcfg-note" }, t("overwriteHint")), /* @__PURE__ */ React.createElement("label", { className: "mcfg-check" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: overwrite, onChange: (e) => setOverwrite(e.target.checked) }), t("overwriteLabel"))) : null)) : null, /* @__PURE__ */ React.createElement("div", { className: "mcfg-row" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btnPrimary", disabled: busy || boot.writable === false || !target, onClick: apply2 }, busy ? t("applying") : t("apply")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "mcfg-btn", onClick: () => setShowPreview(!showPreview) }, t("preview"))), showPreview && previewEntry ? /* @__PURE__ */ React.createElement("pre", { className: "mcfg-code" }, JSON.stringify(previewEntry, null, 2)) : null, status ? /* @__PURE__ */ React.createElement("p", { className: status.kind === "ok" ? "mcfg-statusOk" : "mcfg-statusErr", role: "status", "aria-live": "polite" }, status.text) : null);
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
  "apply-model-config": ["route", "entry", "overwrite"],
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
    if (r === null || typeof r !== "object" || r.ok !== true) {
      throw new Error(r && r.error && r.error.message || "\u8C03\u7528\u5931\u8D25");
    }
    const value = r.value;
    if (value && value.ok === true) return value;
    throw new Error(value && value.error || "\u8C03\u7528\u5931\u8D25");
  };
  const slots = ctx.get("slots") ?? ctx.slots;
  if (slots === void 0) return;
  slots.inject("settings.section", () => slots.register(
    { name: "settings.section", id: SLOT_ID, order: SLOT_ORDER, label: () => t("nav") },
    () => React.createElement(ModelConfiguratorPage, { t, call })
  ));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
