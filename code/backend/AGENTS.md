# 后端开发指南

## 技术栈

- **框架**: Spring Boot 4.0.6
- **语言**: Java 21
- **ORM**: MyBatis 4.0.1
- **数据库**: MySQL
- **构建**: Maven

## 开发命令

```bash
mvn clean package           # 构建（跳过测试）
mvn clean package -DskipTests
mvn spring-boot:run         # 运行
mvn compile                 # 仅编译
mvn test                    # 运行测试
```

## 入口点

```java
com.linkman.aishop.AiShopApplication#main(String[] args)
```

## 目录结构

```
src/
├── main/
│   ├── java/com/linkman/aishop/
│   │   └── AiShopApplication.java    # 启动类
│   └── resources/
│       └── application.yml           # 应用配置
└── test/
    └── java/com/linkman/aishop/
        └── AiShopApplicationTests.java
```

## 配置

- `src/main/resources/application.yml` - 当前仅含：
  ```yaml
  spring:
    application:
      name: ai-shop
  ```
- **数据库连接等关键配置未列出**，需确认是否存在 `application-dev.yml` 等环境配置

## 依赖

| 依赖 | 说明 |
|------|------|
| spring-boot-starter-webmvc | Web MVC |
| mybatis-spring-boot-starter:4.0.1 | ORM |
| mysql-connector-j | MySQL 驱动 |
| lombok | 注解处理 |

## 数据库设计规范

### 逻辑删除
- **禁止物理删除**：所有数据仅使用逻辑删除，通过 `deleted` 字段（默认 0，删除时置 1）标记
- 删除操作必须保留原始数据，仅修改删除状态

### 主键设计
- **必须使用雪花 ID**（Snowflake ID）作为所有表的主键
- 雪花 ID 必须使用 `Long` 类型存储，避免使用自增主键
- **前端传参规范**：所有 ID 参数从前端传到后端时，**必须使用字符串类型**，否则 JavaScript 处理大数字会丢失精度导致 ID 失真

### 外键设计
- **禁止使用物理外键**：表之间不设置数据库层面的外键约束
- 关联关系通过应用层逻辑维护，查询时使用业务逻辑关联

### 字段类型规范
| 场景 | 推荐类型 | 说明 |
|------|----------|------|
| 主键 ID | BIGINT UNSIGNED | 存储雪花 ID |
| 状态标记 | TINYINT | 如 deleted, status 等 |
| 金额/积分 | DECIMAL(10,2) | 避免浮点精度问题 |
| 时间 | DATETIME | 创建/更新时间 |

## 统一响应格式

**所有 API 响应必须使用以下格式**：

```json
{
  "success": true,
  "code": "200",
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 请求是否成功，true=成功，false=失败 |
| code | string | 业务状态码，"200" 表示成功，非 200 为错误 |
| message | string | 状态描述，成功时为 "success" |
| data | object/array | 响应数据，失败时为 null |

- HTTP 状态码始终 200/201
- 业务错误在 `success=false` 和 `code`/`message` 中体现，不修改 HTTP 状态码
- `success` 字段用于快速判断请求是否成功
- `code` 通常为 "200" 表示成功，或自定义错误码

## 已知限制

- `application.yml` 配置不完整，数据库连接等未配置
- 无 opencode.json 自定义指令