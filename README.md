# HuaWei-ICT

第十一届华为 ICT 大赛（2026-2027）创新赛 · 赛题 1《基于华为云产品打造 AI
创新应用》团队开发仓库。

> 本文件是给队员看的入口导读。**规则的唯一真源是 `AGENTS.md` 与
> `.agents/skills/`**，本文件如与两者有出入，以后者为准。

## 项目简介

- **赛题**：基于华为云产品（RDS MySQL、Redis、MaaS 大模型服务）打造 AI
  创新应用，部署在华为云，演示真实可跑（决赛组委复会现作品）。
- **技术栈**：后端 Java 21 + Spring Boot（`server/`）；前端 React 19 +
  TypeScript + Vite + Tailwind + shadcn/ui（`web/`）。
- **赛程**：报名截止 2026-11-30 → 初赛（材料评审）2026-12 →
  中国总决赛 2027-03 → 全球总决赛 2027-05。

## 仓库结构

```text
server/    Java 后端（Spring Boot，包根 com.hwict.server）
web/       React 前端
docs/      plans 开发计划 / openapi 接口契约 / protocol 协议文档 /
           logs 开发日志 / competition 比赛材料与留痕
.agents/   AI 协作规范（skills/）与架构决策笔记（notes/）
```

## 队员第一次上手

1. 克隆仓库，功能分支从 `preview` 拉：

   ```bash
   git checkout preview && git pull
   git checkout -b feat/你的功能
   ```

2. 用 AI 编码工具（ZCode 等）开发时，仓库的 `AGENTS.md` 与
   `.agents/skills/` 会自动指导 AI 按团队规范写码；**拉取后重启一次 AI
   会话**，项目级 skill 才会生效。
3. 动手前花两分钟读 `.agents/skills/hwict-dev/SKILL.md`（总纲：
   改哪里 → 加载哪个规范 → 跑哪些验证）。

## PR 合并规范

分支模型：`main`（稳定，始终可部署）← `preview`（集成分支）← `feat/xxx`

标准流程：

1. 从最新 `preview` 建分支：`feat/功能描述`（修复用 `fix/`，文档用 `docs/`）。
2. 开发 + 本地自测（验证速览见下）。
3. 提交：中文 Conventional Commits（例 `feat(server): 添加用户登录接口`），
   一个 commit 只做一件事。
4. push 分支，开 **PR 到 `preview`（不是 main）**。
5. PR 描述写清所有改动点（小改动也要写），让 reviewer 一眼看懂。
6. CI 校验通过 + 队长批准 → 合入 `preview`。

硬规则：

- **PR 一律合入 `preview`，不直接合 `main`**；
- `preview → main` 由队长阶段性合入，`main` 始终保持可部署；
- 未完成的功能代码不开 PR；提交前确保编译通过；
- 改决策笔记的 PR 由 CI 自动校验格式。

## 开发规范速览

细则见 `.agents/skills/` 下对应 skill：

| 领域 | Skill | 核心要求 |
|------|-------|----------|
| 总纲 / 比赛约束 | `hwict-dev` | 技能索引 + 验证矩阵 + 工作流 |
| 后端 Java | `hwict-java` | Controller 只做参数与响应，业务在 Service；凭据只走环境变量 |
| 前端 React | `hwict-react` | TanStack 路由与数据请求；页面组件就近放；语义化 HTML |
| UI 组件 | `hwict-shadcn` | 组合优先；只用语义色 token；Dialog 必带 Title |
| 视觉设计 | `hwict-ui-design` | 设计系统先行（`docs/competition/design-system.md`） |
| 前端性能 | `hwict-react-perf` | 无依赖请求并行；禁 barrel file |
| 数据库 | `hwict-mysql` | **已执行的 Flyway 脚本永不修改**，只新增版本脚本 |
| 测试 | `hwict-tests` | 每个等待有超时；不依赖真实网络与真实时间 |
| 提交前自审 | `hwict-review` | 明确要求 review 时触发，P0/P1 才阻塞合并 |
| 文档 / 契约 | `hwict-docs` | 改接口必须同步 `docs/openapi/` |
| 决策笔记 | `hwict-notes` | 架构取舍写 `.agents/notes/`（为什么做、放弃了什么） |

验证速览（改什么 → 至少跑什么，全表见 `hwict-dev` 第 2 节）：

- Java 后端：`./mvnw test`
- 前端：`pnpm typecheck` + `pnpm lint` + `pnpm test`
- 决策笔记：PR 上由 CI 自动校验

## 全局约定

- 文档与沟通使用中文。
- 没有真实运行过的验证不得报告为「通过」。
- 凭据（`.env`、华为云 AK/SK、MaaS API Key、密码、Token）不入库；
  示例地址统一用 `SERVER_IP_OR_DOMAIN`。
- 任务结束关闭自己启动的服务进程（Spring Boot、Vite dev server 等），
  关不掉要如实报告。

## 决策看板

架构决策笔记在合入 `main` 后自动发布为网页看板：
<https://genhao0823.github.io/HuaWei-ICT/>
