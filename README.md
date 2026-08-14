# dsh-provider-model-configurator

一个 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/dsh) **插件**:在独立设置页「模型 Pro / Model Pro」中集中**查看、新建、编辑、复制与删除**已配置提供商下的模型条目——上下文窗口、最大输出、输入模态、推理档位与推理兼容开关。还可以从内置的 `llm-pi-ai` 的 `providers.<route>.models` 读取其上下文参数，无需自行填写、手动查询。

## 安装

```sh
# 从 GitHub 安装(推荐版本化 tag URL;不要用 refs/heads/main.tar.gz:
# 内容会变而 URL 不变,pnpm 会复用旧缓存,导致卸载重装后仍是旧版本)
dsh plugin --profile web add https://github.com/LiangYin233/dsh-provider-model-configurator/archive/refs/tags/v0.3.2.tar.gz

# 或从本地打包安装
npm pack
dsh plugin --profile web add ./dsh-provider-model-configurator-0.3.2.tgz
```

升级:把命令里的 `v0.3.2` 换成新 tag 重新执行 `add`(URL 变化才会重新下载);曾用旧 URL 安装过时,先 `remove` 再 `add` 新 URL。

安装后**重启 Web 服务器并刷新页面**,打开设置 → 左侧导航「模型 Pro」(Models 页之后)。

> 要求:pnpm(在 PATH 中)、DSH `0.1.0-rc.6` 或更高。
> 卸载:`dsh plugin --profile web remove dsh-provider-model-configurator`。

## 功能

- 选择**目标提供商**(任意已配置的 `llm-pi-ai` 路由,含自定义与内置目录路由),列出其显式模型条目与配置摘要,可**编辑 / 删除**(删除最后一个条目时自动恢复使用内置目录);
- **新建**:输入模型 ID,手动填写显示名、上下文窗口、最大输出、输入模态(text/image)、推理档位(档位 → wire 值,`off` 留空 = 不发送);
- **复制填充**:模型 ID 行右侧「使用模型预设」打开来源选择器,从预设目录或其他提供商挑一个模型快速填充表单,再改名即复制为新模型;
- **兼容开关 (compat)**:编辑 `thinkingFormat`(openai / deepseek / openrouter / together / zai / qwen / string-thinking / ant-ling)与 `supportsReasoningEffort`(true / false / 未设置),供 openai-completions 推理分发读取;
- 内置目录路由应用后自动转为显式列表并**保留全部目录模型**,`modelOverrides` 折叠进对应条目;同名模型应用时弹窗确认覆盖;写入经 settings 校验器,立即生效,官方 Models 页自动刷新;
- 只写 settings 文档,不接触任何 API 密钥。

## 仓库结构

```
├── package.json        bundle 清单(dsh.bundle.patch / dsh.client / exports)
├── cordis.patch.yml    bundle patch:挂载 dsh-provider-model-configurator
├── dsh.plugin.json     插件元数据(id / version / main)
├── lib/                构建产物(随包发布,由 build.mjs 生成)
│   ├── index.js        ← src/host/index.js
│   ├── contract.js     ← src/host/contract.js
│   └── client.js       ← src/client/static.tsx
├── src/
│   ├── host/           Host 半区源码(index.js 静态 / dynamic.js 动态插件)
│   └── client/         Client 半区源码(page.tsx / model.ts / page.css / locales/)
├── build.mjs           esbuild 构建(lib/ 与 dist/dynamic-client-body.js)
└── tsconfig.json
```

## License

MIT
