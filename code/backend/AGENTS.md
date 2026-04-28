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

## 统一响应格式

**所有 API 响应必须使用以下格式**：

```json
{
  "code": "",
  "message": "",
  "data": {}
}
```

- HTTP 状态码始终 200/201
- 业务错误在 `code` 和 `message` 中体现，不修改 HTTP 状态码
- `code` 通常为 "200" 表示成功，或自定义错误码
- `message` 用于错误原因提示

## 已知限制

- `application.yml` 配置不完整，数据库连接等未配置
- 无 opencode.json 自定义指令