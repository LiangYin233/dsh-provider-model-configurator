# 供应商模型配置器 (Provider Model Configurator)

一个 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/dsh) **可安装插件包(bundle)**:集中**查看、新建、编辑、复制与删除**已配置提供商下的模型条目——上下文窗口、最大输出、输入模态与推理档位,全部在一个独立设置页内完成;pi-ai 安装目录(预设)或其他任何提供商的模型数据可作为**复制来源**快速填充。

## 背景

DSH 默认 LLM 提供商链路基于 `@deepseek-ai/dsh-llm-pi-ai`,底层是 `@earendil-works/pi-ai` 的**安装目录 catalog**(内置各提供商的模型、上下文、推理能力数据)。

问题:

- 新模型发布而目录未更新时,原生「自定义提供商」卡片无法给出模型的 `contextWindow` / `reasoningEfforts` 等数据,只能手查;
- 原生卡片刻意**不提供**推理档位(reasoning effort)编辑——它认为这是模型级能力,而模型选择器(composer)需要这些数据才能给出正确档位;
- 手写模型条目没有推理能力声明时,模型不会按预期推理;
- 已配置的显式模型条目缺少一个集中的查看 / 编辑 / 删除入口。

本插件把「供应商模型配置」做成一个独立设置页,直接读写 `llm-pi-ai` 的 `providers.<route>.models`,无需等待目录更新。

## 安装

本插件以 DSH bundle 形式发布:通过 `dsh plugin` 命令(在 profile 内执行 pnpm 并合并 bundle 层)安装。

```sh
# 从 git 安装(推送到 GitHub 后即可用此地址)
dsh plugin --profile web add https://github.com/LiangYin233/dsh-model-config-sync/archive/refs/heads/main.tar.gz

# 或从本地打包安装(开发时;git/registry 安装会把包物化为 profile 内的真实目录,
# 而 pnpm 对 `add <目录>` 使用符号链接,宿主端 ESM 依赖解析会失效,请走 tarball)
npm pack
dsh plugin --profile web add ./dsh-model-config-sync-0.2.0.tgz
```

然后**重启** Web 服务器并刷新页面:

- Host 插件挂载为 `dsh-model-config-sync`;Client bundle 由 `/plugins/dsh-model-config-sync/client.js` 提供;
- 打开 Web 设置 → 左侧导航「供应商模型配置器」(Models 页之后)。

> 安装要求:pnpm(在 PATH 中)、DSH `0.1.0-rc.6` 或更高版本。卸载:`dsh plugin --profile web remove dsh-model-config-sync`。

## 功能

- 独立设置页「供应商模型配置器」(挂在 `settings.section`,与官方 Models 页并列,零侵入);
- **模型管理**:选择目标提供商后,列出其全部**显式模型条目**及配置摘要,每个条目可:
  - **编辑** — 一键载入该模型的当前配置(显示名、上下文、输出上限、输入模态、推理档位),修改后重新应用;表单未涉及的字段(description 等)原样保留,不会被覆盖;
  - **删除** — 确认后移除该条目(删除最后一个条目时,该提供商自动恢复使用内置目录);
- **新建 / 复制**:
  - 输入新模型 ID 手动填写(高级配置器),可自由添加/删除推理档位;
  - 选择**复制来源**(预设目录或任意其他提供商)+ 模型 → 自动填充下方字段(快速填充);载入后把 ID 改成新值即可**复制为新模型**;
- 同步/编辑字段:
  - 模型 ID、显示名称
  - `contextWindow`(上下文窗口)
  - `maxTokens`(最大输出)
  - 输入模态 `input`(text / image)
  - 推理档位 `reasoningEfforts`(档位 → wire 值的字典,off 留空 = 不发送)
- 目标:任意**已配置**的 `llm-pi-ai` 路由(含自定义提供商与内置目录路由);
- 内置目录路由应用后自动转为**显式 models 列表,保留全部目录模型**,`modelOverrides` 折叠进对应条目,不丢失;
- 同名模型需勾选「覆盖」;写入经 settings 校验器,立即生效,官方 Models 页自动刷新;
- 只写 settings 文档,不接触、不存储任何 API 密钥。

## 仓库结构

```
├── package.json        bundle 清单:dsh.bundle.patch / dsh.client / exports
├── cordis.patch.yml    bundle patch:插入 dsh-model-config-sync 条目
├── dsh.plugin.json     插件元数据(id/main/engines)
├── lib/
│   ├── index.js        Host 半区:modelConfigSync Typert Remote 服务(6 个方法)
│   ├── contract.js     线契约:Invocation descriptors + Host Typert manifest
│   └── client.js       Client 半区(自包含 ModuleLoader bundle):设置页
└── README.md
```

## 架构

```
┌─ Client(浏览器)────────────────────────────────┐
│ settings.section 注册 React 页面(zh/en 双语)   │
│   ├─ ① 复制来源(可选)  ② 提供商 · 模型管理    │
│   │     ③ 模型配置(新建 / 编辑)               │
│   └─ remote.modelConfigSync.*  ←→  Typert RPC  │
└─────────────────────────────────────────────────┘
                  │  Connection /api 网关
┌─ Host(主进程)───────────────────────────────────┐
│ ModelConfigSyncRuntime (TypertRemoteService)    │
│   presetProviders   llm.listConfigurableProviders│
│   presetModels      llm.listModels / discoverModels│
│   presetModelInfo   llm.resolveModelInfo(+目录)  │
│   targetProviders   settings.get('llm-pi-ai')   │
│   applyModelConfig  构建 models 数组 + settings.mutate│
│   deleteModel       移除条目(set/unset models)  │
│ + ctx.typert.register(manifest) 严格描述符解析   │
└─────────────────────────────────────────────────┘
```

### Remote 方法一览

| 方法 | 参数 | 说明 |
| --- | --- | --- |
| `presetProviders` | — | 复制来源:目录 + 已配置提供商(带 declared/configured 标记) |
| `presetModels` | `provider` | 已注册走 `listModels`,休眠走 `discoverModels` |
| `presetModelInfo` | `provider`, `model` | 上下文/输出/模态/推理档位(合并 resolve + discovery) |
| `targetProviders` | — | 已配置路由、现有模型条目(完整配置)、目录模型、writable |
| `applyModelConfig` | `route`, `entry`, `overwrite` | 校验 → 构建 → `settings.mutate('llm-pi-ai', ops)`;覆盖时保留未编辑字段 |
| `deleteModel` | `route`, `modelId` | 移除显式条目;删空后 unset 恢复内置目录 |

## 已知限制

- **推理档位名**:仅对**已注册**(已配置)的复制来源提供商可精确获取(`resolveModelInfo`);休眠目录提供商不暴露推理元数据。
- **wire 值**:精确映射(pi-ai 目录的 `thinkingLevelMap`,如 opencode-go 的 `{minimal:null, low:null, medium:null, high:"high", max:"max"}`)只存在于 pi-ai 安装目录的 JSON 中,适配器未通过 `llm` 服务暴露。默认按「档位名 = wire」预填(对绝大多数 OpenAI 兼容网关正确),逐档可改;deepseek 系 `minimal/low/medium` 通常应留空(不发送)。
- 目标路由必须**已配置**(先在官方 Models 页创建);使用 `modelOverrides` 的路由自动折叠后写入。
- **删除**仅作用于**显式 models 条目**;使用内置目录的路由(无显式条目)没有可删除项。删除最后一个条目会使该路由恢复使用内置目录。
- 提供商级配置(api / baseURL / 密钥)不属于本插件职责,请使用官方 Models 页。

## 使用

1. 安装 bundle 并重启 Web 服务器(见上);
2. 打开 Web 设置 → 左侧导航「供应商模型配置器」(Models 页之后);
3. ②选择目标提供商,查看其模型列表;点击「编辑」载入现有配置,或「删除」移除条目;
4. ①(可选)选择复制来源(预设目录 / 其他提供商)+ 模型快速填充;③编辑模型字段与推理档位;
5. 「预览写入内容」核对 → 「应用配置」;
6. 写入立即生效,官方 Models 页自动刷新;`$DSH_HOME/settings.yaml` 中 `llm-pi-ai.providers.<route>` 出现/更新 `models:` 列表。

## 兼容性

- 依赖 Host 服务:`typert`(注入)、`llm`、`settings`(后两者通过 `ctx.get` 可选读取,缺失时优雅报错);
- 依赖 Client:`slots`(`settings.section`)、`locale`(zh/en)、`remote`(Typert 网关);
- 与官方 `dsh-client-ui-settings-models` 页并列运行,不遮蔽、不替换官方 UI。

## License

MIT
