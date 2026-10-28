# AGENTS.md（仓库入口）

本仓库是第十一届华为 ICT 大赛创新赛·赛题1（基于华为云产品打造 AI 创新应用）
的团队开发仓库。开始任何工作前，先读
[.agents/skills/hwict-dev/SKILL.md](.agents/skills/hwict-dev/SKILL.md)——
它是开发流程与比赛约束的总纲（技能索引、验证矩阵、工作流）。

## 任务路由

- **任何开发、重构、调试、测试、构建、文档任务**：遵循 `hwict-dev` 及其
  技能索引。
- **创建、迁移、更新或审查决策笔记**（记录"为什么这样做、放弃了什么"）：
  先读 [.agents/skills/hwict-notes/SKILL.md](.agents/skills/hwict-notes/SKILL.md)，
  笔记写入 `.agents/notes/`。完成含明显架构/产品取舍的改动时，宣布完成前
  必须新增或更新对应笔记。
- **提交 Pull Request 前的代码自审**（明确要求 review 时）：先读
  [.agents/skills/hwict-review/SKILL.md](.agents/skills/hwict-review/SKILL.md)。
- **前端任务**：除 `hwict-react` 外，按需加载 `hwict-shadcn`（组件）、
  `hwict-ui-design`（视觉决策）、`hwict-react-perf`（性能排查）。

## 全局约定

- 使用中文回复和编写项目文档。
- 没有真实运行过的验证不得报告为「通过」。
- 未经用户明确要求，不执行 git commit、不推送远端；main 分支由队长 PR
  把关。

## 比赛速览（详见 hwict-dev 第 0 节）

- 赛程：报名截止 2026-11-30；初赛 2026-12；中国总决赛 2027-03；
  全球总决赛 2027-05。
- 初赛材料五要素：方案背景与价值、创新性解读、数据集选取与处理、关键
  代码片段解读、可量化效果——素材持续沉淀在 `docs/competition/`。
- 入围决赛需开源至 Gitee/GitHub，仓库内容从第一天起按可公开标准写。
