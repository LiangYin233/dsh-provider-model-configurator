# 变更历史

所有版本均为同一动态插件(`pluginId: mcfg-1`)的不可变 Package。`pkg-8` 为当前稳定版本。

## pkg-8 — 修复 THINKING_LEVELS 未定义(当前)

- 修复 pkg-7 引入的运行时错误:Host 端 `apply-model-config` 引用 `THINKING_LEVELS` 但只在 Client 端定义;
- 在 Host `apply` 顶部补充档位常量。

## pkg-7 — 修复推理参数仍未写入(形状不匹配)

- 客户端 `buildEntry()` 生成的是 **level→wire 字典**(如 `{ high: "high", max: "max" }`),而 Host 端检查的是数组形态,分支从不进入,`reasoningEfforts` 被静默丢弃;
- Host 端改为直接接受字典形态(最终 profile 形态),并校验档位名合法性与 wire 非空。

## pkg-6 — 修复推理参数字段名不匹配

- 客户端字段名为 `reasoningEfforts`,Host 端读取 `entry.reasoning`(不存在)→ 推理参数静默丢失;
- 字段名对齐为 `entry.reasoningEfforts`。

## pkg-5 — 预设来源可选(高级模型配置器)

- 不选预设也可手动填写模型配置并应用;预设仅作快速填充;
- 新增「清除预设,手动填写」按钮;应用/预览不再依赖来源;
- 页面初始即处于手动模式。

## pkg-4 — 修复 VM 沙箱跨 realm 写入

- Host 半区运行在 `node:vm` 独立 realm,沙箱内对象原型与主 realm 不同,`settings.mutate` 的 `isPlainObject` 校验拒绝(报 `ops must be {op:'set'|'unset', path}`);
- 以 wire 解码参数 `args` 的原型为模板,`Object.create(hostProto)` 递归重建 mutate 载荷(`hostify`)。

## pkg-3 — 修复 modelOverrides 空对象误报

- schemastery 对 object/dict 字段默认 `{}`,已解析配置里 `modelOverrides` 永远存在,`!!p.modelOverrides` 误判为「存在覆盖」并拒绝写入;
- 改为按非空判断;真实覆盖不再拒绝,而是折叠进显式 models 列表(语义等价,不丢失)。

## pkg-2 — 修复结果 JSON 契约

- `target-providers` 返回对象中 `api`/`baseURL` 为 `undefined` 时,harness 结果克隆校验拒绝;
- 改为条件构建,只放有值的键;`preset-model-info` 同样处理。

## pkg-1 — 初始版本

- 独立设置页「模型配置同步」:预设(目录)模型 → 目标自定义提供商;
- Host 5 个 RPC:preset-providers / preset-models / preset-model-info / target-providers / apply-model-config;
- 同步字段:模型 ID、显示名称、contextWindow、maxTokens、输入模态、推理档位;
- 目录路由自动转为显式 models 列表并保留全部目录模型;同名模型需勾选覆盖;
- 只写 settings,不触碰 API 密钥。
