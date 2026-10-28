# Java / Spring 测试稳定性

## 分层与命名

- 单元 / 切片测试：`*Tests.java`，默认随 `./mvnw test` 运行；Mapper 语义
  单测可用 H2，但 H2 不承担 MySQL 方言验证职责。
- MySQL 方言集成测试：`*MySqlValidationIT.java`，必须保留
  `@EnabledIfEnvironmentVariable(named = "RUN_MYSQL_VALIDATION_TESTS", matches = "true")`
  门控与 `@ActiveProfiles("test")`；直连隔离 MySQL 验证 DDL、时间列、索引
  与分批清理等方言行为（骨架建立后新增的 `*MySqlValidationIT` 应校验
  `flyway_schema_history` 与 `information_schema`，而非只断言 Mapper 返回值）。

## 有界等待

- 等待异步结果用 `assertTimeoutPreemptively(Duration.ofSeconds(n), () -> ...)`
  或 CompletableFuture 组合，不用无界 `future.get()`。
- 等待状态收敛优先用可注入的事件 / 回调 / `CompletableFuture`；确需轮询，
  用单调截止时间 + 超时时的诊断输出（最后观测值），不用裸 `while(true)`。
- **禁止 `Thread.sleep(n)` 作为同步手段**。测试替身通过注入时钟
  （`Clock`）或调度器控制时间，不依赖真实墙钟。
- Spring 调度相关逻辑把 `TaskScheduler` / `Clock` 作为可注入依赖，测试用
  同步执行或手动触发的替身，不靠真实延迟。

## 资源与清理

- 每个测试自净：记录插入的主键 / 唯一前缀（如 `TEST_PREFIX`），在
  `@AfterEach` 中删除，断言失败也执行。
- Mockito 用 `@ExtendWith(MockitoExtension.class)`；stub 在测试内声明，
  不跨测试共享 mock 对象。
- 显式创建的线程 / `ExecutorService` / 定时任务在 `finally` 中关闭，并等待
  终止完成（有界 join）。
- 系统属性 / 环境变量改动必须在测试结束时还原（try/finally）。

## 并发与事务

- 并发测试显式描述事件顺序：启动任务 → 在同步点（屏障 / future）确认
  到达 → 触发释放或取消 → 断言全部终止与副作用。
- 不用 `@Transactional` 测试来验证真实提交语义；需要验证提交后可见性时
  用集成测试与独立连接。
- WebSocket / 消息消费者测试：等可观察副作用（落库行、发出的下一条
  消息、消费者确认），不等"应该很快"的时间。

## 禁止事项

- 无超时的 `Thread.join()` / `Future.get()` / `CountDownLatch.await()`。
- 依赖执行顺序的隐式共享状态（静态可变字段跨测试）。
- 为通过测试放大超时上限而不诊断原因。
- 在单测里连真实外部服务（邮件、钉钉、LLM API）；用替身并在集成层标注。
