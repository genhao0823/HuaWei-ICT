---
name: hwict-notes
description: HuaWei-ICT 决策笔记规范。当在 HuaWei-ICT 项目中创建、迁移、更新或审查 .agents/notes 架构决策笔记时自动加载。触发场景：记录架构取舍、归档被否方案、更新已有决策笔记、提交前校验笔记格式。
when_to_use: 创建 / 更新 / 校验决策笔记 时
user-invocable: true
---

# HuaWei-ICT 决策笔记规范

本 Skill 负责维护 `.agents/notes/`（仓库内）。这里是 HuaWei-ICT 架构决策、
工程取舍、被否方案和历史约束的记录位置。

> 本规范改编自 Lithe-IDEA 项目的 agent-notes skill。

## 1. 基本原则

- 文档正文使用中文。代码路径、命令、协议字段按真实拼写保留。
- 先服务人，再服务 Agent：读者应当在前几行知道"这篇文档解决什么问题、
  最后决定了什么、开发者以后需要注意什么"，不能要求读者先理解全部实现
  细节。
- 默认读取 `implemented/`。只有设计新方案时读取 `proposed/`，只有做类似
  选型或排查重复问题时读取 `rejected/`，默认不读取 `archived/`。
- 优先更新已有 Note。路径、类名、模块位置、默认值和验证命令变化时，
  修改持有该决策的原 Note，不新建流水账。
- 只有决策本身发生变化时才新建 Note。新决策完全取代旧决策时，新 Note
  承接仍有价值的理由，旧 Note 进入 `archived/`。
- Note 记录"为什么这样做、放弃了什么、怎么证明仍然成立"。不要复制
  API 参考、字段全集、命令手册或代码能直接表达的实现细节。
- 修改架构边界、前后端契约、安全策略、测试策略、部署流程或高风险
  模块（华为云 client 调用、认证与安全、大模型提示词链路）前，先检索相关 Note，再改代码。

## 2. 路径和生命周期

路径就是状态：

```text
.agents/notes/
├── AGENTS.md
├── README.md
├── manifest.json
├── proposed/<class>/yyyy-mm-dd-topic.md
├── implemented/<class>/yyyy-mm-dd-topic.md
├── rejected/<class>/yyyy-mm-dd-topic.md
└── archived/<class>/yyyy-mm-dd-topic.md
```

四个生命周期目录都保留完整分类骨架，并各自包含局部 `AGENTS.md`。空分类
目录使用 `.gitkeep` 保持可见。

`class` 只使用这六类：

- `feature`：用户或模型可观察的新能力或非显然行为。
- `bug-fix`：缺陷修复、事故复盘或防止回归的约束。
- `simplification`：只删减能力、表面、依赖或复杂度。
- `architecture`：源码组织、边界、依赖方向和包拓扑。
- `process`：围绕代码的协作、验证、发布和自动化流程。
- `testing`：测试策略、测试基础设施和稳定性约束。

文件名使用首次提出日期和英文 slug，例如：

```text
2026-10-20-introduce-agent-notes-system.md
```

## 3. 写作格式

### 3.1 人类可读性要求

1. **开头先给结论**：在 `状态` 后增加 `## 先说结论`，用 2～4 句话说明
   背景、最终决定和对日常开发的直接影响。
2. **首次出现的术语必须解释**：先写中文含义，再保留真实名称。例如：
   "Outbox 模式（在同一事务内先落库待发消息，再异步投递）"。
3. **一段只表达一个意思**：能拆成"因为……所以……"或"如果……就……"就拆开。
4. **把抽象边界翻译成动作**：每条重要规则都回答"开发者写代码时应该放在
   哪里、不要放在哪里、违反后会发生什么"。
5. **区分事实和术语**：先说明用户或开发者能观察到的现象，再说明内部实现。
6. **代码细节只保留必要部分**：路径、类名、协议字段用于定位和验证。
7. **避免只写结论口号**："统一管理""保持一致"必须接具体说明。
8. **使用小例子帮助理解**：复杂边界至少给一个正确做法和一个反例。

如果技术细节很多，正文顺序建议是：

```text
先说结论 → 为什么要这样做 → 开发者怎么做 → 哪些做法不要用
→ 代价与例外 → 验证方式
```

### 3.2 章节骨架

已落地决策使用：

```markdown
# Agent 笔记：标题

状态：已实现

## 先说结论

用普通开发者能理解的话说明最终决定和直接影响。

## 问题

## 决策

## 考虑过的备选方案

## 后果

## 验证

## 适用范围
```

提案使用 `状态：提议中`，并把 `## 决策` 换成 `## 提案`，把 `## 后果`
换成 `## 验收标准` 和 `## 风险`。

被否方案使用 `状态：已否决：一句话原因`，保留提案视角，并包含
`## 否决理由`。

模板在本 Skill 的 `templates/` 目录中。写完后在仓库根运行：

```bash
node .agents/skills/hwict-notes/scripts/verify-agent-notes.mjs
```

该脚本同时校验 Note 格式、路径、链接、验证命令和目录骨架；新增生命周期
或分类必须同步更新 `.agents/notes/manifest.json`、本 Skill 和校验脚本。

## 4. 检索流程

改动前按最窄范围查找：

1. 阅读相关代码入口附近的 Note 引用。
2. 按类别查看 `implemented/<class>/`。
3. 使用关键词检索 active Notes，默认排除 `archived/`：

   ```bash
   rg --hidden --glob '!.agents/notes/archived/**' '<关键词>' .agents/notes/
   ```

4. 做新选型、重构或避免重复踩坑时再读取 `rejected/`。

不要启动时全文读取 `.agents/notes/`。这是渐进式披露系统，不是全量上下文
仓库。

## 5. 看板

看板不是第二份文档，而是由当前 `.agents/notes/` 生成的只读视图。在仓库根
运行：

```bash
node .agents/skills/hwict-notes/scripts/build-agent-notes-board.mjs --init
```

生成包含完整 Note 正文的静态页面：

```bash
node .agents/skills/hwict-notes/scripts/build-agent-notes-board.mjs \
  --bundle .agents/notes .artifacts/agent-notes-board/index.html
```

看板产物在 `.artifacts/` 下，不入库。

## 6. 代码入口绑定

只在架构承重墙或高风险入口加一行反向引用，不给普通函数加引用：

```java
// Note: 华为云 MaaS 调用与凭据管理策略见 .agents/notes/implemented/architecture/ 相关笔记
```

适合绑定的位置包括启动类、安全配置、华为云 client 层入口、OpenAPI 契约
对应的核心 Controller、Flyway 迁移目录和共享工具入口。迁移已有代码时，只给
这些入口补索引。

## 7. 迁移规则

- `docs/tech-summary/` 中记录的长期架构决策可迁入
  `.agents/notes/`，迁移后原文降为概览或删除并修复引用。
- 使用教程、运维手册（docs/ops-manual）、发布与交接记录（docs/handoff）、
  OpenAPI 契约和协议文档不迁入 Note。
- 长文档可以拆分：已落地的事实进入 `implemented/`，未完成方案进入
  `proposed/`，被否但容易复犯的方案进入 `rejected/`。
- 如果一篇旧文档混合了当前事实和未完成计划，先拆生命周期，再处理旧文档。

## 8. 收尾

提交前确认：

- `## 先说结论` 能让不了解背景的开发者在 30 秒内明白这篇 Note 的作用。
- 重要术语第一次出现时已经解释，且每条核心规则都有对应的开发动作。
- 没有用"解耦、收敛、下沉、编排"等抽象词替代实际说明。
- Note 与代码或流程变更在同一提交中。
- `## 考虑过的备选方案` 至少包含真实备选。
- `## 后果` 同时写收益和代价。
- `## 验证` 中的命令存在，且和本次改动相关。
- `## 适用范围` 中的路径仍存在。
- `node .agents/skills/hwict-notes/scripts/verify-agent-notes.mjs` 通过。
