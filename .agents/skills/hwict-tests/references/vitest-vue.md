# Vitest / Vue 测试稳定性

## 时间控制

- 防抖、冷却、重试、轮询等时间行为一律注入定时器或调度器；测试用
  `vi.useFakeTimers()` + `vi.advanceTimersByTime()` / `vi.runAllTimers()`
  推进，不用真实 `setTimeout` 等"给微任务一点时间"。
- fake timers 用完必须 `vi.useRealTimers()`（放 `afterEach`），否则污染
  同文件后续测试。
- 只需要冲刷微任务时用 `await Promise.resolve()`（必要时多次），不引入
  真实定时器。
- WebSocket / 长连接组件把连接对象做成可注入替身：手动 resolve/reject
  消息与状态迁移，不让测试真的建连。

## 清理

- 定时器、事件监听、ResizeObserver/MutationObserver 替身、store 订阅、
  mock 的 fetch / WebSocket，统一在 `afterEach` 用
  `vi.restoreAllMocks()` / `vi.clearAllTimers()` / 组件卸载清理。
- Pinia 测试用 `createTestingPinia()` 或每个测试 `setActivePinia()`，
  不复用跨测试的 store 实例。
- deferred promise 只在测试控制全部 resolve/reject 路径时使用；断言失败
  也要在 teardown 释放，避免未处理拒绝。

## 断言与等待

- 异步状态收敛优先断言可观察输出（DOM 文案、emitted 事件、store 字段），
  配合 `vi.waitFor`（自带超时与诊断）；禁止无界轮询。
- 不为断言访问组件私有实例字段；通过 props / 事件 / 渲染结果验证。
- 涉及 `src/api/client.ts` 拦截器的行为用 mock fetch（`vi.spyOn(globalThis, 'fetch')`
  或注入的客户端替身）验证 40100/40300 跳转与 `X-Correlation-ID`，不起真实后端。

## 禁止事项

- `await new Promise(r => setTimeout(r, n))` 等真实时间。
- 测试间共享可变模块级状态。
- 用 `vi.useFakeTimers()` 后又混用真实异步 API（如真实 fetch）而不配
  `shouldAdvanceTime` 诊断。
- 快照测试放任体积无限膨胀；快照失败先判断是回归还是预期变更。
- 运行验证：`npm run test -- <file>` 聚焦，交付前 `npm run test` 全量，
  并保持 `typecheck` / `lint` 通过。
