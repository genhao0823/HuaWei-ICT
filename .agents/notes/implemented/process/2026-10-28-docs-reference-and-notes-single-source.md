# Agent 笔记：文档引用校验与决策笔记单源

状态：已实现

## 先说结论

文档里写下的脚本路径、引用路径必须真实存在，否则新队员照着做会直接失败；现在
由 `check-docs-links.mjs` 在本地和 PR CI 上卡住失效引用。决策笔记的生命周期、
分类与文件名规则只写在 `.agents/notes/manifest.json`，校验脚本和看板脚本都读它，
调整规则时不再需要改三处。

## 问题

仓库从模板迁移过来，文档里残留了旧项目根目录的验证脚本路径，以及当时还不存在的
产物路径（`docs/competition/design-system.md`）。这类错误不会让任何构建失败，
只会让照着文档做的人多走一步弯路，而且没人会主动回来修。

同一时期，笔记的生命周期与分类在 manifest、校验脚本、看板脚本里各写了一份，
改一处忘另一处就会让 CI 与本地结果分叉。

## 决策

- **文档引用检查**：`.agents/skills/hwict-docs/scripts/check-docs-links.mjs` 扫描
  `README.md`、`AGENTS.md`、`.agents/**/*.md`、`docs/**/*.md`、`.github/**/*.md`；
  - 相对 Markdown 链接目标不存在 → 报错；
  - 反引号内写的仓库路径（`.agents/`、`docs/`、`.github/` 等）不存在 → 报错，
    具体检查范围见脚本头部注释；
  - 代码围栏、外链、含 `*{}<>$…` 的占位路径跳过；`server/`、`web/` 在骨架建立前
    不检查，避免把计划中的路径误报为错误。
  - 由 `.github/workflows/verify-docs.yml` 在 PR 上执行，`hwict-dev` 验证矩阵与
    `hwict-docs` 工作流同步登记。
- **笔记单源**：`manifest.json` 提供 `lifecycles`、`classes`、`noteFilePattern`；
  `verify-agent-notes.mjs` 与 `build-agent-notes-board.mjs` 都读取它，脚本内不再
  保留生命周期/分类常量。状态行与必备章节的语义仍留在校验脚本
  （`statusByLifecycle`、`requiredHeadings`），因为这些是校验逻辑而不是配置；
  manifest 出现脚本不认识的生命周期时直接报错，并提示去哪里补规则。

### 正确做法

- 新增文档引用时写真实存在的路径；删除文件时在同一次提交里改掉引用。
- 调整笔记生命周期或分类：只改 `manifest.json`；新增生命周期再补校验语义。

### 不要这样做

- 在文档里写"计划中"的路径又不加占位符（`*`、`{}`、`…`），检查脚本会报错——
  先建文件，或明确写成占位形态。
- 为了通过检查把路径挪进代码围栏：检查会跳过围栏，问题只是被藏起来。

## 考虑过的备选方案

### 备选方案一：只靠人工巡检

成本最低，但本次巡检发现的死路径存在了多个提交都没人发现，说明人工巡检不可靠，
新队员也没有历史上下文。

### 备选方案二：引入 markdown-link-check 等第三方工具

功能更全，但需要 npm 依赖与网络安装，且默认只查 Markdown 链接、不查反引号里的
仓库路径——而本次的问题恰好全是路径写法。自写脚本约 150 行、零依赖、规则可控。

## 后果

- 收益：文档失效引用在 PR 阶段暴露；笔记规则只有一份配置，改一处即可。
- 代价：多维护一个脚本与一条 CI 任务；检查规则刻意收窄，`server/`、`web/` 路径在
  骨架建立前不受保护，需要后续补一行前缀。
- 重新评估的触发条件：文档数量显著增长，或需要检查外部链接时，再评估是否换用
  成熟工具。

## 验证

- `node .agents/skills/hwict-notes/scripts/verify-agent-notes.mjs`
- `.agents/skills/hwict-docs/scripts/check-docs-links.mjs`
- `node .agents/skills/hwict-notes/scripts/build-agent-notes-board.mjs --bundle .agents/notes .artifacts/agent-notes-board/index.html`

## 适用范围

- `.agents/skills/hwict-notes/scripts/`
- `.agents/skills/hwict-docs/scripts/`
- `.agents/notes/manifest.json`
- `.github/workflows/`
