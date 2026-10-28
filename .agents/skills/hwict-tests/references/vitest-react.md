# React / Vitest 测试稳定性

适用于 `web/` 的组件、hooks 与数据层测试。测试不连真实后端、不依赖真实时间与
网络；具体脚本名以 `web/package.json` 为准（骨架建立后回填）。

## 渲染与清理

- 每个测试 `render()` 后在 `afterEach(() => { cleanup(); vi.restoreAllMocks(); })`
  统一收口；断言失败时也要释放订阅与定时器。
- 不用手工挂载到 `document.body`；Portal 内容用 `screen` + `within` 断言。
- 组件卸载才能触发的清理逻辑，要有一个专门测试覆盖。

## 时间控制

- 防抖、轮询、自动刷新一律注入定时器或调度器；测试用 `vi.useFakeTimers()` +
  `vi.advanceTimersByTime()` 推进，`afterEach` 里 `vi.useRealTimers()`。
- 只冲刷微任务时用 `await Promise.resolve()`（必要时多次），不引入真实
  `setTimeout`。
- 依赖"延迟出现"的断言，用 fake timers 推进后再断言，不用 `waitFor` 空耗真实
  时间。

## 数据层与网络

- TanStack Query 每个测试新建 `QueryClient`，默认 `retry: false`、`gcTime: 0`，
  通过 `QueryClientProvider` 包裹；不跨测试复用缓存。
- 请求一律 mock：`vi.spyOn(globalThis, "fetch")` 或注入请求封装替身，返回受控
  `Response`；禁止真实网络请求。
- 路由相关测试用内存历史（`createMemoryHistory`），不依赖浏览器地址栏。
- Zustand store 每个测试前重置到初始状态或新建实例，不跨测试共享可变状态。

## 断言与等待

- 异步收敛统一断言可观察输出（DOM 文案、`aria-*`、回调调用），用
  `await screen.findBy…` 或 `vi.waitFor`（自带超时与诊断信息）。
- 禁止无界轮询；轮询必须有单调截止时间与超时诊断。
- 快照只用于稳定的小结构；快照失败先判断是回归还是预期变更。

## 禁止事项

- `await new Promise(r => setTimeout(r, n))` 等真实时间。
- 测试间共享可变模块级状态或 QueryClient。
- 为了让异步测试通过，把等待挪进 detached Promise 或后台任务。

## 运行验证

聚焦：`pnpm test -- src/path/file.spec.ts`；交付前 `pnpm test` 全量，并保持
`pnpm typecheck` / `pnpm lint` 通过。
