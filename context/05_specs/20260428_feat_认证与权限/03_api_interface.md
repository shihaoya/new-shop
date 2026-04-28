# 认证与权限 - API接口设计

## 文档信息

| 项目 | 内容 |
|------|------|
| Feature ID | 20260428_feat_认证与权限 |
| 创建人 | danshihao |
| 创建日期 | 2026-04-28 |

---

## 1. 基础信息

**Base URL**: `/api/v1`

**认证方式**: Bearer Token（JWT）

**统一响应格式**:
```json
{
  "success": true,
  "code": "200",
  "message": "success",
  "data": {}
}
```

**业务错误码规范**:
| 前缀 | 范围 | 用途 |
|------|------|------|
| 2xx | 200-299 | 成功 |
| 4xx | 400-499 | 客户端错误（参数错误、权限不足等） |
| 5xx | 500-599 | 服务端错误 |

---

## 2. 接口列表

### 2.1 认证模块

#### 2.1.1 登录

**接口路径**: `/api/v1/auth/login`

**请求方法**: POST

**功能描述**: 账号密码登录 [需求：F-001]

**请求头**:
| 头信息 | 值 | 必需 |
|--------|-----|------|
| Content-Type | application/json | 是 |

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名，4-20字符 |
| password | string | 是 | 密码，8-20位字母+数字 |

**请求示例**:
```json
{
  "username": "admin",
  "password": "Pass1234"
}
```

**响应参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| token | string | JWT访问令牌 |
| expiresIn | integer | 有效期（秒），默认604800（7天） |

**响应示例（成功）**:
```json
{
  "success": true,
  "code": "200",
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

**响应示例（失败）**:
```json
{
  "success": false,
  "code": "40001",
  "message": "用户名或密码错误",
  "data": null
}
```

**错误码**:
| code | 说明 |
|------|------|
| 40001 | 用户名或密码错误 |
| 40002 | 账号已冻结 |
| 40003 | 账号待审核 |
| 40004 | 账号已拒绝 |

---

#### 2.1.2 验证邀请码

**接口路径**: `/api/v1/auth/invite-codes/validate`

**请求方法**: POST

**功能描述**: 验证邀请码有效性 [需求：F-002]

**请求头**:
| 头信息 | 值 | 必需 |
|--------|-----|------|
| Content-Type | application/json | 是 |

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| inviteCode | string | 是 | 邀请码 |

**请求示例**:
```json
{
  "inviteCode": "ABC12345"
}
```

**响应参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| valid | boolean | 是否有效 |
| shopId | string | 关联店铺ID（有效时返回） |
| role | integer | 可注册角色（有效时返回，0=管理员，1=店铺用户，2=普通用户） |

**响应示例（成功）**:
```json
{
  "success": true,
  "code": "200",
  "message": "success",
  "data": {
    "valid": true,
    "shopId": "1001",
    "role": 2
  }
}
```

**错误码**:
| code | 说明 |
|------|------|
| 40401 | 邀请码无效 |

---

#### 2.1.3 注册

**接口路径**: `/api/v1/auth/register`

**请求方法**: POST

**功能描述**: 邀请码注册 [需求：F-003]

**请求头**:
| 头信息 | 值 | 必需 |
|--------|-----|------|
| Content-Type | application/json | 是 |

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| inviteCode | string | 是 | 邀请码 |
| username | string | 是 | 用户名，4-20字符，字母开头 |
| nickname | string | 是 | 昵称，2-20字符 |
| password | string | 是 | 密码，8-20位字母+数字 |
| confirmPassword | string | 是 | 确认密码，与密码相同 |

**请求示例**:
```json
{
  "inviteCode": "ABC12345",
  "username": "user001",
  "nickname": "张三",
  "password": "Pass1234",
  "confirmPassword": "Pass1234"
}
```

**响应参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户ID |

**响应示例（成功）**:
```json
{
  "success": true,
  "code": "200",
  "message": "注册成功，请等待审核",
  "data": {
    "userId": "10001"
  }
}
```

**错误码**:
| code | 说明 |
|------|------|
| 40401 | 邀请码无效 |
| 40005 | 用户名已存在 |
| 40099 | 参数校验失败（密码格式不正确、两次密码不一致等） |

---

### 2.2 用户管理模块

#### 2.2.1 查询用户列表

**接口路径**: `/api/v1/users`

**请求方法**: GET

**功能描述**: 分页查询用户列表 [需求：F-004]

**请求头**:
| 头信息 | 值 | 必需 |
|--------|-----|------|
| Authorization | Bearer {token} | 是 |

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认1 |
| pageSize | integer | 否 | 每页条数，默认20，最大100 |
| keyword | string | 否 | 搜索关键词（用户名/昵称） |
| role | integer | 否 | 角色筛选 |
| status | integer | 否 | 状态筛选 |

**响应参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| items | array | 用户列表 |
| page | integer | 当前页码 |
| pageSize | integer | 每页数量 |
| total | integer | 总记录数 |
| totalPages | integer | 总页数 |

**响应示例（成功）**:
```json
{
  "success": true,
  "code": "200",
  "message": "success",
  "data": {
    "items": [
      {
        "userId": "10001",
        "username": "user001",
        "nickname": "张三",
        "role": 2,
        "shopId": "1001",
        "shopName": "旗舰店",
        "status": 1,
        "createTime": "2026-04-28 10:00:00"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**数据权限说明**:
- 管理员：可查看所有用户
- 店铺用户：仅可查看本店用户
- 普通用户：无此接口权限

---

#### 2.2.2 创建用户

**接口路径**: `/api/v1/users`

**请求方法**: POST

**功能描述**: 直接创建用户（无需审核） [需求：F-005]

**请求头**:
| 头信息 | 值 | 必需 |
|--------|-----|------|
| Content-Type | application/json | 是 |
| Authorization | Bearer {token} | 是 |

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名，4-20字符，字母开头，唯一 |
| nickname | string | 是 | 昵称，2-20字符 |
| role | integer | 是 | 角色（仅支持 2=普通用户） |
| shopId | string | 条件必填 | 店铺ID（店铺用户创建时必填） |

**请求示例**:
```json
{
  "username": "user002",
  "nickname": "李四",
  "role": 2,
  "shopId": "1001"
}
```

**响应参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户ID |
| password | string | 随机生成的初始密码 |

**响应示例（成功）**:
```json
{
  "success": true,
  "code": "200",
  "message": "创建成功",
  "data": {
    "userId": "10002",
    "password": "Abc12345"
  }
}
```

**错误码**:
| code | 说明 |
|------|------|
| 40005 | 用户名已存在 |
| 40301 | 无权限创建该角色用户 |
| 40099 | 参数校验失败 |

---

#### 2.2.3 审核用户

**接口路径**: `/api/v1/users/{userId}/review`

**请求方法**: POST

**功能描述**: 审核注册申请 [需求：F-006]

**请求头**:
| 头信息 | 值 | 必需 |
|--------|-----|------|
| Content-Type | application/json | 是 |
| Authorization | Bearer {token} | 是 |

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户ID |

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 审核动作（approve/reject） |
| rejectReason | string | 条件必填 | 拒绝理由（action=reject时必填，10-200字符） |

**请求示例**:
```json
{
  "action": "reject",
  "rejectReason": "信息填写不完整，请补充"
}
```

**响应示例（成功）**:
```json
{
  "success": true,
  "code": "200",
  "message": "审核成功",
  "data": null
}
```

**错误码**:
| code | 说明 |
|------|------|
| 40401 | 用户不存在 |
| 40006 | 用户状态不允许审核 |
| 40099 | 参数校验失败（拒绝理由格式不正确） |

---

#### 2.2.4 冻结/解冻用户

**接口路径**: `/api/v1/users/{userId}/freeze`

**请求方法**: POST

**功能描述**: 冻结或解冻用户 [需求：F-007]

**请求头**:
| 头信息 | 值 | 必需 |
|--------|-----|------|
| Content-Type | application/json | 是 |
| Authorization | Bearer {token} | 是 |

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户ID |

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 动作（freeze/unfreeze） |

**请求示例**:
```json
{
  "action": "freeze"
}
```

**响应示例（成功）**:
```json
{
  "success": true,
  "code": "200",
  "message": "冻结成功",
  "data": null
}
```

**错误码**:
| code | 说明 |
|------|------|
| 40401 | 用户不存在 |
| 40006 | 用户状态不允许此操作 |
| 40301 | 无权限执行此操作 |

**权限说明**: 仅管理员可执行冻结/解冻

---

#### 2.2.5 删除用户

**接口路径**: `/api/v1/users/{userId}`

**请求方法**: DELETE

**功能描述**: 逻辑删除用户 [需求：F-008]

**请求头**:
| 头信息 | 值 | 必需 |
|--------|-----|------|------|
| Authorization | Bearer {token} | 是 |

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户ID |

**响应示例（成功）**:
```json
{
  "success": true,
  "code": "200",
  "message": "删除成功",
  "data": null
}
```

**错误码**:
| code | 说明 |
|------|------|
| 40401 | 用户不存在 |
| 40301 | 不能删除自己 / 无权限删除该用户 |

---

#### 2.2.6 重置密码

**接口路径**: `/api/v1/users/{userId}/reset-password`

**请求方法**: POST

**功能描述**: 重置用户密码 [需求：F-009]

**请求头**:
| 头信息 | 值 | 必需 |
|--------|-----|------|------|
| Content-Type | application/json | 是 |
| Authorization | Bearer {token} | 是 |

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户ID |

**响应参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| password | string | 新密码 |

**响应示例（成功）**:
```json
{
  "success": true,
  "code": "200",
  "message": "密码重置成功",
  "data": {
    "password": "Xyz98765"
  }
}
```

**错误码**:
| code | 说明 |
|------|------|
| 40401 | 用户不存在 |
| 40301 | 无权限重置该用户密码 |

---

### 2.3 邀请码管理模块

#### 2.3.1 生成邀请码

**接口路径**: `/api/v1/invite-codes`

**请求方法**: POST

**功能描述**: 生成新的邀请码 [需求：F-010]

**请求头**:
| 头信息 | 值 | 必需 |
|--------|-----|------|------|
| Content-Type | application/json | 是 |
| Authorization | Bearer {token} | 是 |

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| role | integer | 是 | 可注册角色（管理员生成：1=店铺用户；店铺用户生成：2=普通用户） |

**请求示例**:
```json
{
  "role": 1
}
```

**响应参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| inviteCode | string | 生成的邀请码 |
| createTime | string | 创建时间 |

**响应示例（成功）**:
```json
{
  "success": true,
  "code": "200",
  "message": "生成成功",
  "data": {
    "inviteCode": "ABC12345",
    "createTime": "2026-04-28 10:00:00"
  }
}
```

---

## 3. 字典数据

### 3.1 账号状态 (user_status)

| value | label | 说明 |
|-------|-------|------|
| 0 | 待审核 | 等待审核 |
| 1 | 已通过 | 审核通过，可正常登录 |
| 2 | 已拒绝 | 审核拒绝，可重新注册 |
| 3 | 已冻结 | 已冻结，无法登录 |

### 3.2 邀请码状态 (invite_code_status)

| value | label | 说明 |
|-------|-------|------|
| 0 | 有效 | 可用于注册 |
| 1 | 已使用 | 已被使用 |
| 2 | 已失效 | 重新生成后失效 |

### 3.3 用户角色 (user_role)

| value | label | 说明 |
|-------|-------|------|
| 0 | 管理员 | 系统管理员 |
| 1 | 店铺用户 | 店铺管理员 |
| 2 | 普通用户 | 普通用户 |

---

## 4. 错误码汇总

| code | 说明 |
|------|------|
| 200 | 成功 |
| 40001 | 用户名或密码错误 |
| 40002 | 账号已冻结 |
| 40003 | 账号待审核 |
| 40004 | 账号已拒绝 |
| 40005 | 用户名已存在 |
| 40006 | 用户状态不允许操作 |
| 40099 | 参数校验失败 |
| 40101 | 未认证（未登录或Token过期） |
| 40301 | 无权限访问或禁止操作 |
| 40401 | 资源不存在 |
| 50000 | 服务器内部错误 |

---

## 5. 设计检查清单

- [x] 遵循 RESTful 风格，URL 中无动词
- [x] ID 类型为字符串（string）
- [x] 分页参数完整（page, pageSize）
- [x] 响应格式符合统一格式 `{ success, code, message, data }`
- [x] success 字段与 code 保持一致
- [x] HTTP 状态码始终 200/201
- [x] 时间格式为 YYYY-MM-DD HH:mm:ss
- [x] 布尔值使用 true/false
- [x] 错误码有明确含义
- [x] 敏感接口有权限校验
- [x] 有完整的请求/响应示例
