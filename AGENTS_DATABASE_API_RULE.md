# 接口设计规则

本文档定义 ai-shop 项目全栈统一接口设计规范，所有 API 必须遵循。

---

## 1. 核心原则

### 1.1 响应格式

所有 API 统一响应格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 业务状态码，200/201=成功，其他=业务错误 |
| message | string | 错误描述或成功提示 |
| data | object/array | 响应数据，失败时通常为 null |

- HTTP 状态码始终 **200/201**，业务错误在 code/message 中体现
- code = 0 也视为成功（如很多老项目用 0 表示成功）

### 1.2 数据传输

- **格式**：JSON（`Content-Type: application/json`）
- **字符编码**：UTF-8
- **命名风格**：
  - 数据库/后端内部：snake_case（如 `user_id`, `order_no`）
  - API 响应/请求：camelCase（如 `userId`, `orderNo`）

---

## 2. ID 规范

### 2.1 雪花 ID

- **所有主键 ID 必须使用雪花算法（Snowflake ID）**
- 禁止使用自增 ID（多店铺数据隔离场景下无法合并数据）

### 2.2 前端传输格式

- **雪花 ID 传给前端必须转为字符串**
- 原因：JavaScript 数字精度限制，雪花 ID（64位）超过 53 位精度会失真

```typescript
// 后端返回给前端的 JSON
{
  "id": "1823456789012345678",  // ✅ 字符串，不失真
  // "id": 1823456789012345678  // ❌ 数字，前端会丢失精度
}
```

### 2.3 请求参数

- 前端传给后端的 ID 可以是字符串或数字（后端需兼容处理）
- 建议前端传字符串，与响应格式保持一致

---

## 3. 逻辑删除

### 3.1 全局约定

- **所有表必须包含逻辑删除字段**
- 禁止物理删除数据

### 3.2 字段规范

| 字段 | 类型 | 说明 |
|------|------|------|
| deleted | tinyint | 0=未删除, 1=已删除 |

### 3.3 查询规范

- **默认查询已删除数据**（deleted = 0）
- 查询已删除数据需明确指定（如回收站功能）
- 关联查询时需同步过滤已删除数据

---

## 4. 分页机制

### 4.1 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 是 | 页码，从 1 开始 |
| page_size | number | 是 | 每页条数，建议值：10/20/50/100 |

### 4.2 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| list | array | 当前页数据列表 |
| total | number | 总记录数 |
| page | number | 当前页码 |
| page_size | number | 每页条数 |

---

## 5. 排序机制

### 5.1 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sort_field | string | 否 | 排序字段名（camelCase） |
| sort_order | string | 否 | 排序方向：`asc` / `desc` |

### 5.2 默认排序

- 未指定排序时，默认按 `createdAt` 倒序（最新的在最前面）

### 5.3 示例

```
GET /api/orders?page=1&page_size=20&sort_field=createdAt&sort_order=desc
```

---

## 6. 字段命名转换

### 6.1 后端职责

后端负责数据库字段名与 API 字段名的双向转换：

```
数据库 (snake_case)  <--->  内部对象  <--->  API 响应 (camelCase)
```

### 6.2 常用字段映射

| 数据库 | API | 说明 |
|--------|-----|------|
| user_id | userId | 用户 ID |
| shop_id | shopId | 店铺 ID |
| order_no | orderNo | 订单号 |
| created_at | createdAt | 创建时间 |
| updated_at | updatedAt | 更新时间 |
| is_deleted | isDeleted | 是否删除 |

---

## 7. 时间处理

### 7.1 存储格式

- 数据库存储：ISO 8601 或时间戳
- 推荐使用 `datetime` 类型存储，不要用时间戳

### 7.2 API 传输格式

- 统一使用 **ISO 8601 字符串**：`"2026-04-28T10:30:00.000Z"`
- 前端可按需格式化为本地时间显示

---

## 8. 异常处理

### 8.1 业务异常

```json
{
  "code": 40001,
  "message": "库存不足",
  "data": null
}
```

### 8.2 错误码规范

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 40001~40099 | 参数/业务错误 |
| 40101 | 未登录 |
| 40102 | token 过期 |
| 40301 | 无权限 |
| 40401 | 资源不存在 |
| 50001 | 服务器内部错误 |

### 8.3 HTTP 状态码

| 场景 | HTTP 状态码 |
|------|-------------|
| 成功 | 200 / 201 |
| 业务错误 | 200（code != 200） |
| 参数校验失败 | 200（code = 40001） |
| 未登录 | 200（code = 40101） |
| 无权限 | 200（code = 40301） |
| 服务器错误 | 200（code = 50001） |

---

## 9. 权限控制

### 9.1 认证方式

- 使用 JWT Token
- 前端通过 `Authorization: Bearer <token>` 请求头传递

### 9.2 店铺数据隔离

- 所有数据查询必须携带 `shop_id` 条件
- 普通用户只能访问自己的数据
- 管理员可访问所有数据（需明确传 shop_id）

---

## 10. 接口文档要求

### 10.1 必须包含的信息

每个接口必须记录：
- 接口路径 + 请求方法
- 功能描述
- 请求参数（含类型、必填、说明）
- 响应格式（含示例）
- 错误码说明

### 10.2 输出位置

接口文档统一输出到：`context/05_specs/{feature_name}/03_api_interface.md`

---

## 11. 前端 API 层规范

### 11.1 文件结构

```
src/api/
├── index.ts      # 统一导出
├── user.ts       # 用户相关
├── order.ts      # 订单相关
└── shop.ts       # 店铺相关
```

### 11.2 统一响应类型

```typescript
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}
```

### 11.3 分页类型

```typescript
interface PaginationParams {
  page: number
  page_size: number
}

interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}
```

---

## 12. 快速检查清单

新建接口时自检：

- [ ] ID 使用雪花 ID 且返回字符串
- [ ] 响应格式为 `{ code, message, data }`
- [ ] HTTP 状态码始终 200/201
- [ ] 逻辑删除字段 `deleted` 过滤已删除数据
- [ ] 分页参数 `page` + `page_size`
- [ ] 排序参数 `sort_field` + `sort_order`（有排序需求时）
- [ ] 字段名使用 camelCase
- [ ] 时间使用 ISO 8601 字符串
- [ ] 接口文档完整

---

## 附录：代码示例

### 后端响应构造（Java）

```java
// 成功响应
return Response.ok().body(Map.of(
    "code", 200,
    "message", "操作成功",
    "data", result
));

// 分页响应
return Response.ok().body(Map.of(
    "code", 200,
    "message", "success",
    "data", Map.of(
        "list", page.getContent(),
        "total", page.getTotalElements(),
        "page", page.getNumber() + 1,
        "pageSize", page.getSize()
    )
));
```

### 前端请求（TypeScript）

```typescript
// 订单列表
export function getOrderList(params: {
  page: number
  page_size: number
  sort_field?: string
  sort_order?: 'asc' | 'desc'
  status?: string
}) {
  return request.get('/orders', { params })
}

// 订单详情（ID 传字符串）
export function getOrderDetail(id: string) {
  return request.get(`/orders/${id}`)
}
```

### 数据库 DTO 示例（MyBatis）

```java
public class OrderDTO {
    private String id;           // 雪花 ID 转字符串
    private String orderNo;       // snake -> camel
    private String userId;        // 雪花 ID 转字符串
    private Integer totalPoints;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // deleted 字段不在 DTO 中暴露，由 Service 层统一处理
}
```