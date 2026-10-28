# GitHub 仓库设置清单

本文件记录仓库侧（GitHub Settings）必须人工开启的配置。仓库内的 CI 与流程都
假设这些设置已就位；重建仓库或换管理员时按本清单逐项执行。

## 当前状态（2026-10-28 实测）

| 项 | 现状 | 说明 |
|---|---|---|
| 可见性 | public | 赛题入围后需开源，内容按可公开标准写 |
| 默认分支 | main | |
| License | MIT（工作区已新增，合并后 GitHub 识别） | 此前 API 显示 `license: null` |
| GitHub Pages | 已启用（Source = GitHub Actions） | 首次 `main` 部署后 `https://genhao0823.github.io/HuaWei-ICT/` 生效 |
| main 分支保护 | 已启用 | PR + 1 approve + Code Owner review + 两个状态检查；禁止强推与删除 |
| preview 分支保护 | 已启用 | PR + 两个状态检查；0 approval，队长可直接合并自己的 PR |
| Actions | 已启用（allowed_actions=all） | |
| CODEOWNERS | `* @genhao0823` | 已随 main 的 "Require review from Code Owners" 生效 |

## 已完成配置（2026-10-28）

- **Pages**：Source 设为 **GitHub Actions**。合入 `main` 会触发
  `deploy-agent-notes-board.yml`，看板地址
  `https://genhao0823.github.io/HuaWei-ICT/`；首次部署前站点 `status` 为空。
- **main 保护**：Require a pull request before merging（1 个 approve）、
  Require review from Code Owners、Require status checks（`Verify Agent Notes`、
  `Verify Docs Links`，要求分支最新）、禁止 force push 与删除、要求解决会话。
  两个校验工作流不加路径过滤，每次 PR 都能上报状态。
- **preview 保护**：Require a pull request before merging（0 approval）、
  同样要求两个状态检查与分支最新、禁止 force push 与删除。
- 两个分支都没有强制管理员遵守（`enforce_admins=false`）：队长在紧急情况下
  可以绕过；待第二名协作者加入后，main 的 1 approval 与 Code Owner review
  才会实际约束普通 PR。

## 待办

1. **Actions 权限**：Settings → Actions → General，Workflow permissions 设为
   **Read repository contents**（工作流已显式声明各自所需权限）。
2. **Secrets**：华为云 AK/SK、MaaS API Key 只放 Environments/Secrets，命名统一
   为 `HUAWEI_AK` / `HUAWEI_SK` / `MAAS_API_KEY`，不出现在仓库文件与日志中。
3. **协作者**：把队员加为 write 权限协作者；main 的 1 approval 与 Code Owner
   review 需要非作者的协作者才能真正满足。

## 本地工具目录

`.zcode/` 等本地 AI 工具目录已在 `.gitignore` 中忽略，且仓库历史中从未入库。
不要用 `git add -f` 强行加入；需要共享的规范放 `.agents/skills/`。
