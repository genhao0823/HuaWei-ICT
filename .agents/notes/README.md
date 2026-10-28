# HuaWei-ICT Agent Notes

`.agents/notes/` 保存 HuaWei-ICT 的工程决策：为什么这样做、放弃了什么、怎么证明
仍然成立、适用于哪些路径。写入与读取规则以 [AGENTS.md](AGENTS.md) 为准，本文件
只做入口和命令速查。

## 目录

```text
implemented/   已落地，默认读取
proposed/      提案中，设计新方案时读取
rejected/      已否决，避免重复踩坑时读取
archived/      已归档，默认不读取
```

每个生命周期下按 `architecture` / `bug-fix` / `feature` / `process` /
`simplification` / `testing` 分类，文件名格式 `yyyy-mm-dd-topic.md`。

## 命令

```bash
# 校验格式、路径、链接与验证命令（PR 上由 CI 自动执行）
node .agents/skills/hwict-notes/scripts/verify-agent-notes.mjs

# 生成只读看板（产物在 .artifacts/ 下，不入库）
node .agents/skills/hwict-notes/scripts/build-agent-notes-board.mjs \
  --bundle .agents/notes .artifacts/agent-notes-board/index.html
```

## 看板

合入 `main` 后由 `.github/workflows/deploy-agent-notes-board.yml` 发布到
GitHub Pages：<https://genhao0823.github.io/HuaWei-ICT/>。Pages 已启用，首次
部署后链接生效；设置见 `docs/ops-manual/repo-setup.md`。

## 检索

```bash
rg --hidden --glob '!.agents/notes/archived/**' '<关键词>' .agents/notes/
```

Windows 无 `rg` 时用 VS Code 全局搜索并排除 `archived/`，或：

```powershell
Get-ChildItem -Recurse .agents/notes -Filter *.md |
  Where-Object { $_.FullName -notmatch '\\archived\\' } |
  Select-String '<关键词>'
```
