# AI Shop 后端基础设施说明

本文档说明后端基础设施的使用方法和注意事项。

## 📁 目录结构

```
src/main/java/com/linkman/aishop/
├── common/                    # 通用组件
│   ├── Result.java           # 统一响应封装
│   ├── ResultCode.java       # 状态码枚举
│   └── PageResult.java       # 分页响应封装
├── exception/                 # 异常处理
│   ├── BusinessException.java    # 业务异常
│   ├── GlobalExceptionHandler.java  # 全局异常处理器
│   └── ErrorCode.java        # 错误码常量
├── security/                  # 安全认证
│   ├── JwtUtils.java         # JWT 工具类
│   ├── AuthContext.java      # 用户上下文
│   └── LoginUser.java        # 登录用户信息
├── interceptor/               # 拦截器
│   ├── AuthInterceptor.java  # 认证拦截器
│   ├── DataIsolationInterceptor.java  # 数据隔离拦截器
│   └── WebConfig.java        # Web 配置
├── config/                    # 配置类
│   └── WebConfig.java        # 拦截器注册
├── util/                      # 工具类
│   ├── SnowflakeIdGenerator.java  # 雪花 ID 生成器
│   ├── PasswordUtils.java    # 密码加密工具
│   ├── JsonUtils.java        # JSON 工具
│   └── DateUtils.java        # 日期时间工具
├── dto/                       # 数据传输对象
│   └── request/
│       └── PageRequest.java  # 分页请求参数
└── controller/                # 控制器（测试用）
    └── TestController.java   # 测试接口
```

## 🔧 核心功能

### 1. 统一响应格式

所有 API 返回统一的 JSON 格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

**使用示例**：

```java
// 成功响应
return Result.success(data);

// 创建成功
return Result.created(data);

// 失败响应
return Result.error(40001, "参数错误");
return Result.error(ResultCode.PARAM_ERROR);
```

### 2. 分页响应

```java
PageResult<User> pageResult = PageResult.of(list, total, page, pageSize);
return Result.success(pageResult);
```

响应格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 3. 异常处理

**抛出业务异常**：

```java
throw new BusinessException("库存不足");
throw new BusinessException(40001, "参数错误");
```

全局异常处理器会自动捕获并转换为统一响应格式，HTTP 状态码始终为 200。

### 4. JWT 认证

**生成 Token**：

```java
@Autowired
private JwtUtils jwtUtils;

String token = jwtUtils.generateToken(userId, shopId, role);
// role: ADMIN / SHOP_USER / USER
```

**验证 Token**：

认证拦截器会自动验证请求头中的 `Authorization: Bearer <token>`，无需手动处理。

### 5. 获取当前用户信息

在 Controller 或 Service 中通过 `AuthContext` 获取：

```java
String userId = AuthContext.getUserId();
String shopId = AuthContext.getShopId();
String role = AuthContext.getRole();
boolean isAdmin = AuthContext.isAdmin();
```

### 6. 雪花 ID 生成

```java
// 生成 String 类型（推荐，用于前端传输）
String id = SnowflakeIdGenerator.generateIdStr();

// 生成 Long 类型（数据库存储）
Long id = SnowflakeIdGenerator.generateId();
```

### 7. 密码加密

```java
// 加密密码
String encodedPassword = PasswordUtils.encode(rawPassword);

// 验证密码
boolean matches = PasswordUtils.matches(rawPassword, encodedPassword);

// 生成随机密码
String randomPassword = PasswordUtils.generateRandomPassword();
```

### 8. 分页参数

Controller 接收分页请求：

```java
@GetMapping("/users")
public Result<PageResult<User>> listUsers(PageRequest pageRequest) {
    pageRequest.validate(); // 验证参数
    
    // 查询数据...
    
    return Result.success(pageResult);
}
```

## 🔐 白名单配置

以下路径不需要认证（在 `WebConfig.java` 中配置）：

- `/api/auth/login` - 登录
- `/api/auth/register` - 注册
- `/api/file/upload` - 文件上传

如需添加新的白名单路径，修改 `WebConfig.addInterceptors()` 方法。

## 📝 开发规范

### 1. ID 传输规范

- **后端 → 前端**：雪花 ID 必须转为字符串
- **前端 → 后端**：可以传字符串或数字（建议字符串）

### 2. 时间格式规范

- **API 传输**：ISO 8601 格式（`"2026-04-28T10:30:00.000Z"`）
- **数据库存储**：`datetime` 类型
- **Java 对象**：`LocalDateTime`

### 3. 字段命名规范

- **数据库**：snake_case（如 `user_id`）
- **API**：camelCase（如 `userId`）

MyBatis 已配置自动转换（`map-underscore-to-camel-case: true`）。

### 4. 逻辑删除

所有表必须包含 `deleted` 字段（tinyint）：
- 0 = 未删除
- 1 = 已删除

查询时默认过滤 `deleted = 0` 的数据。

## 🚀 快速开始

### 1. 配置数据库

修改 `application.yml` 中的数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ai_shop?...
    username: root
    password: your_password
```

### 2. 运行项目

```bash
cd code/backend
mvn spring-boot:run
```

### 3. 测试接口

**健康检查**（无需认证）：

```bash
curl http://localhost:18890/api/test/health
```

**获取用户信息**（需要 Token）：

```bash
curl -H "Authorization: Bearer <your_token>" http://localhost:18890/api/test/me
```

## ⚠️ 注意事项

1. **JWT 密钥**：生产环境请使用环境变量或配置中心管理 `jwt.secret`
2. **数据库密码**：不要将真实密码提交到代码仓库
3. **ThreadLocal 清理**：认证拦截器会在请求结束后自动清理 `AuthContext`
4. **分页限制**：每页最多 100 条，防止恶意请求
5. **跨域配置**：如需支持跨域，需在 `WebConfig` 中添加 CORS 配置

## 📦 依赖说明

| 依赖 | 用途 |
|------|------|
| jjwt | JWT Token 生成和验证 |
| hutool-core | 雪花 ID 生成等工具 |
| spring-security-crypto | BCrypt 密码加密 |
| spring-boot-starter-validation | 参数校验 |
| jackson-datatype-jsr310 | LocalDateTime 序列化支持 |

## 🧪 测试接口

项目提供了测试接口用于验证基础设施：

- `GET /api/test/health` - 健康检查
- `GET /api/test/me` - 获取当前用户信息（需认证）
- `GET /api/test/snowflake` - 测试雪花 ID 生成
- `GET /api/test/page` - 测试分页响应
