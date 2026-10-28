---
name: hwict-react-perf
description: HuaWei-ICT 前端 React 性能规范。当排查前端卡顿、优化重渲染、做代码拆分与懒加载、评审数据获取模式时自动加载。触发场景：页面卡顿排查、useEffect/依赖数组问题、列表渲染慢、首屏体积优化、请求瀑布流。
when_to_use: 排查前端性能 / 优化重渲染 / 拆包懒加载 / 消除请求瀑布 时
user-invocable: true
---

# HuaWei-ICT React 性能规范

> 规则精选自 Vercel react-best-practices（MIT）公开规则，自写精简版。
> Demo 规模下先按正常写法开发，出现卡顿再按本 skill 排查；但"消瀑布流"
> 与"禁 barrel file"两条从第一天遵守。

## 1. 消除请求瀑布流（CRITICAL，第一天遵守）

- 相互独立的请求必须并行：`Promise.all([a(), b()])`，不逐个 await。
- await 延迟到真正使用结果的地方，不在函数开头集中等待。
- 先检查廉价的同步条件（如缓存命中）再发起昂贵请求。
- 列表页"先请求列表→再逐项请求详情"是典型瀑布：改为列表接口一次返回
  所需字段，或详情批量接口。

## 2. Bundle 体积（CRITICAL，第一天遵守）

- **禁 barrel file**：不建 `components/index.ts` 桶导出；从具体文件直接
  `import`，保证打包器可静态分析、可摇树。
- 重组件（图表、富文本、地图）用懒加载（`React.lazy`/路由级 code
  split），首屏不用不加载。
- 分析/埋点类第三方库在交互发生后动态 import。

## 3. 重渲染优化（出现卡顿再排查）

- 不订阅只在回调里用到的状态；回调里要用的值放 ref 或参数传递。
- 昂贵子组件用 `memo` 包裹，同时把非原始类型的默认 props 提为模块级
  常量。
- `useEffect` 依赖数组用原始值（string/number），不依赖每次渲染都变的
  对象/数组。
- 派生状态在渲染期计算，不要"先 setState 再读"的 effect 链。
- `useState` 传函数做惰性初始化：`useState(() => expensive())`。
- 简单原始值的计算不值得 `useMemo`；反之大列表过滤/排序必须 memo。
- 交互逻辑放事件处理器，不放 effect；非紧急更新（搜索结果过滤）用
  `startTransition`。
- 高频瞬态值（鼠标位置、滚动）存 ref，不进 state。
- 禁止在组件内定义组件（每次渲染都是新类型，子树必重挂载）。

## 4. 渲染与 JS 微优化

- 长列表用 `content-visibility` 或虚拟滚动；列表项避免昂贵内联计算。
- 静态 JSX 块提取为模块级常量或独立组件。
- 循环内的重复查找改 `Map`；`filter`+`map` 连用合并为单循环或
  `flatMap`。
- 循环内不变的 RegExp、深层属性访问提到循环外。

## 5. 排查顺序

卡顿排查按此序：请求瀑布（Network 面板）→ 不必要重渲染（React DevTools
Profiler）→ 大列表/大组件渲染 → bundle 体积（构建分析）。修复后用可感知
指标（交互延迟、首屏时间）验证，不凭感觉宣布"变快了"。
