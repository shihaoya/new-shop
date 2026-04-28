# 接口设计规则

本文档定义 ai-shop 项目的全局 API 设计规范，所有 API 必须遵循。

## 1. 通用规范

### 1.1 RESTful 风格

| 操作 | 方法 | 示例 |
|------|------|------|
| 查询 | GET | `GET /api/v1/users` |
| 获取单个 | GET | `GET /api/v1/users/{id}` |
| 创建 | POST | `POST /api/v1/users` |
| 更新 | PUT | `PUT /api/v1/users/{id}` |
| 删除 | DELETE | `DELETE /api/v1/users/{id}` |
| 部分更新 | PATCH | `PATCH /api/v1/users/{id}` |

### 1.2 URL 规范

- **前缀**：`/api/v1`
- **资源名词**：复数形式，小写，连字符分隔（`goods-items` 而非 `goodsItems`）
- **嵌套资源**：不超过 2 层（`/shops/{shopId}/users`）
- **禁止动词**：用 HTTP 方法表达操作，不在 URL 中使用动词

```
✓ /api/v1/users
✓ /api/v1/shops/{shopId}/users
✗ /api/v1/getUsers
✗ /api/v1/user/get
```

### 1.3 版本控制

- URL 路径中包含版本号 `/api/v1/`
- 重大变更时升级版本（`/api/v2/`），旧版本保持兼容

## 2. 请求规范

### 2.1 请求头

| 头信息 | 值 | 必需 |
|--------|-----|------|
| Content-Type | application/json | POST/PUT/PATCH |
| Authorization | Bearer {token} | 需要认证的接口 |

### 2.2 ID 类型约定

**所有 ID（主键）从前端传到后端时，必须使用字符串类型。**

原因：JavaScript Number 类型最大安全整数为 9007199254740991，而雪花 ID 超出此范围，直接用 Number 会丢失精度。

```json
// ✓ 正确
{ "userId": "2847384729477121" }

// ✗ 错误
{ "userId": 2847384729477121 }
```

### 2.3 分页请求

```json
{
  "page": 1,
  "pageSize": 20
}
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | int | 1 | 页码（从 1 开始） |
| pageSize | int | 20 | 每页条数（最大 100） |

## 3. 响应规范

### 3.1 统一响应格式

**所有 API 响应必须使用以下格式，HTTP 状态码始终 200/201：**

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

**业务错误示例：**

```json
{
  "success": false,
  "code": "40001",
  "message": "用户名或密码错误",
  "data": null
}
```

### 3.2 success 字段约定

| 值 | 含义 |
|-----|------|
| true | 请求成功，code 为 "200" |
| false | 请求失败，code 为非 "200" 的错误码 |

前端可根据 `success` 字段快速判断请求是否成功，无需解析 `code`。

### 3.3 业务错误码规范

| 前缀 | 范围 | 用途 |
|------|------|------|
| 2xx | 200-299 | 成功 |
| 4xx | 400-499 | 客户端错误（参数错误、权限不足等） |
| 5xx | 500-599 | 服务端错误 |

常见错误码：

| code | 说明 |
|------|------|
| 200 | 成功 |
| 40001 | 登录失败（用户名或密码错误） |
| 40002 | 登录失败（账号已被冻结） |
| 40003 | 登录失败（账号待审核） |
| 40101 | 无权限访问 |
| 40301 | 禁止操作（非本人资源） |
| 40401 | 资源不存在 |
| 40099 | 参数校验失败 |

### 3.4 分页响应

```json
{
  "success": true,
  "code": "200",
  "message": "success",
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 3.5 列表响应（无分页）

```json
{
  "success": true,
  "code": "200",
  "message": "success",
  "data": []
}
```

### 3.6 无返回数据的响应

```json
{
  "success": true,
  "code": "200",
  "message": "success",
  "data": null
}
```

## 4. 数据规范

### 4.1 时间格式

- **统一使用 `YYYY-MM-DD HH:mm:ss` 格式**
- 示例：`2026-04-28 10:30:00`

### 4.2 金额/积分

- 使用字符串传输，避免精度问题
- 单位：分（最小单位）
- 示例：`"1000"` 表示 10.00 积分

### 4.3 布尔值

- 使用 true/false（小写），**禁止使用 0/1**

### 4.4 枚举值

- 状态类字段使用整型（0, 1, 2...）并提供清晰的语义
- 在接口文档中明确列出所有枚举值含义

```json
{
  "status": 1,
  "statusText": "审核通过"
}
```

## 5. 异常处理

### 5.1 常见 HTTP 状态码使用

| 状态码 | 场景 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证（未登录或 Token 过期） |
| 403 | 已认证但无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 5.2 错误响应示例

**参数校验失败（400）：**

```json
{
  "success": false,
  "code": "40099",
  "message": "参数校验失败",
  "data": {
    "errors": [
      { "field": "username", "message": "用户名不能为空" },
      { "field": "password", "message": "密码长度不能少于 8 位" }
    ]
  }
}
```

**未认证（401）：**

```json
{
  "success": false,
  "code": "40101",
  "message": "请先登录",
  "data": null
}
```

**禁止操作（403）：**

```json
{
  "success": false,
  "code": "40301",
  "message": "无权操作此资源",
  "data": null
}
```

## 6. 安全规范

### 6.1 认证

- 除公开接口（登录、注册等）外，所有接口需要携带有效 Token
- Token 在请求头 `Authorization: Bearer {token}` 中传递
- Token 有效期：默认 7 天（168 小时），可配置

### 6.2 数据权限

- 接口必须基于当前登录用户自动过滤数据
- 普通用户只能访问自己的数据
- 店铺用户只能访问本店铺（shop_id）的数据
- 管理员可访问全部数据

### 6.3 敏感操作日志

- 删除、冻结、重置密码等敏感操作需记录操作日志
- 日志内容：操作人、操作时间、操作类型、目标资源

## 7. 接口文档要求

每个接口必须包含以下信息：

1. **接口描述**：清晰说明接口用途
2. **请求方法 + URL**：完整路径
3. **请求头**：需要哪些 header
4. **请求参数**：参数名、类型、必填、说明、校验规则
5. **响应示例**：正常响应 + 错误响应
6. **业务错误码**：此接口特有的错误码说明

## 8. 设计检查清单

新接口设计完成后，对照以下清单检查：

- [ ] 遵循 RESTful 风格，URL 中无动词
- [ ] ID 类型为字符串
- [ ] 分页参数完整（page, pageSize）
- [ ] 响应格式符合统一格式 `{ success, code, message, data }`
- [ ] success 字段与 code 保持一致（成功时 success=true，失败时 success=false）
- [ ] HTTP 状态码始终 200/201
- [ ] 时间格式为 YYYY-MM-DD HH:mm:ss
- [ ] 布尔值使用 true/false
- [ ] 错误码有明确含义
- [ ] 敏感接口有权限校验
- [ ] 有完整的请求/响应示例