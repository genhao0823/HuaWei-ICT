---
name: hwict-mysql
description: HuaWei-ICT MySQL 规范。当在 HuaWei-ICT 项目 server/ 目录下进行数据库设计或编写 SQL 时自动加载。触发场景：数据库表设计、编写 SQL 语句、索引设计、Flyway 迁移脚本。
when_to_use: 设计数据库表 / 编写 SQL / 设计索引 / 编写 Flyway 迁移 时
user-invocable: true
---

# HuaWei-ICT MySQL 规范

## 1. 建表规范

### 命名

- 表名：小写，下划线分隔，复数形式，如 `users`、`alert_rules`
- 字段名：小写，下划线分隔，如 `created_at`、`server_id`
- 索引名：`idx_表名_字段名`，如 `idx_metrics_server_id`
- 唯一索引：`uk_表名_字段名`，如 `uk_users_username`

### 字段类型

- 主键：`BIGINT UNSIGNED AUTO_INCREMENT`
- 字符串：`VARCHAR(n)`，不超长用 `VARCHAR`，不用 `CHAR`
- 时间：`DATETIME`，不用 `TIMESTAMP`（2038 年溢出风险）
- 布尔：`TINYINT(1)`
- 金额：`DECIMAL(10,2)`，不用 `FLOAT`
- 状态枚举：`VARCHAR(20)` 或 `TINYINT`，不用 `ENUM`

### 建表示例

```sql
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password_hash` VARCHAR(100) NOT NULL COMMENT '密码（BCrypt 哈希）',
    `role` VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT '角色: user/admin',
    `status` VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态: active/disabled',
    `last_login_at` DATETIME COMMENT '最后登录时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_username` (`username`),
    KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

## 2. 索引规范

- 每个表必须有主键
- WHERE / JOIN / ORDER BY 字段建索引
- 联合索引字段顺序：区分度高的在前
- 避免在索引列上使用函数
- 定期分析慢查询，优化索引

## 3. SQL 编写规范

- 关键字大写：`SELECT`、`FROM`、`WHERE`
- **禁止使用 `SELECT *`，必须指定具体字段**
- 使用参数化查询，防止 SQL 注入
- 批量操作使用 `IN` 或 `VALUES` 多行，不用循环
- 分页查询使用 `LIMIT offset, count`，大数据量用游标分页
- 敏感字段（密码、Token、API Key）只能存哈希 / 密文，不能明文落库

## 4. Flyway 迁移脚本

- 迁移脚本放在 `server/src/main/resources/db/migration/`
- 文件名使用 Flyway 规范，例如 `V1__create_users_table.sql`
- 每个迁移脚本只做一组相关表结构变更
- **已执行到共享环境的迁移脚本不得直接修改，应通过新的版本脚本变更**
- 破坏性操作（DROP/TRUNCATE/批量 DELETE）执行前必须：
  1. 备份并验证备份可读
  2. 展示影响范围并获得最终确认
  3. 操作后验证数据库结构与数据状态

## 5. 其他

- 所有表使用 InnoDB 引擎
- 字符集使用 `utf8mb4`
- 每个字段必须有 COMMENT
- 避免使用外键约束，应用层维护关联关系
- 大表考虑分表或分区（如 metrics 表）
- 凭据不入库不入代码；确需落库的密文字段，加密密钥从环境变量读取
