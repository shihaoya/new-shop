# 文件存储接口设计

## 基础信息

**模块前缀：** sys_file

**接口协议：** HTTP (简化的 GET/POST 模式)

**版本：** v1

**Base URL：** /admin-api/v1

**认证方式：** Bearer Token (JWT)

---

## 配置文件说明

以下参数通过后端配置文件（`application.yml`）管理，不硬编码在接口定义中：

| 配置项 | 配置路径 | 默认值 | 说明 |
|--------|---------|--------|------|
| 允许的文件类型 | `file.upload.allowed-types` | `jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx` | 逗号分隔的文件扩展名 |
| 最大文件大小 | `file.upload.max-size` | `10485760`（字节） | 单文件最大上传大小，默认 10MB |
| 上传限流 | `file.rate-limit.upload` | `10`（次/分钟/IP） | 文件上传接口限流阈值 |
| 下载限流 | `file.rate-limit.download` | `50`（次/分钟/IP） | 文件下载接口限流阈值 |
| 删除限流 | `file.rate-limit.delete` | `20`（次/分钟/用户） | 文件删除接口限流阈值 |
| 存储类型 | `file.storage.type` | `local` | 存储类型：local（本地）/ oss（阿里云OSS） |
| 本地存储路径 | `file.storage.local.path` | `/uploads/` | 本地存储根目录 |

---

## 接口列表

### 1.1 文件上传

**接口路径：** `POST /admin-api/v1/file/upload`

**需求追溯：** [需求：F-001] 文件上传功能

**请求格式：** `multipart/form-data`

| 参数 | 类型 | 必填 | 说明 |
|------|------|--------|------|
| file | file | 是 | 文件流 |
| fileCategory | string | 否 | 文件分类，用于区分不同业务场景（默认 `common`） |

**请求示例：**
```
POST /admin-api/v1/file/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [文件流]
fileCategory: product_image
```

**响应示例：**
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "fileId": "f001a2b3c4d5e6f7g8h9i0j1k2l3m4n5",
    "originalName": "product_photo.jpg",
    "storedName": "f001a2b3c4d5e6f7g8h9i0j1k2l3m4n5.jpg",
    "fileSize": 1024567,
    "mimeType": "image/jpeg",
    "fileUrl": "/admin-api/v1/file/f001a2b3c4d5e6f7g8h9i0j1k2l3m4n5"
  }
}
```

**业务规则：**
- 文件类型限制：仅允许配置文件中的白名单类型（参见配置文件章节）
- 文件大小限制：单文件不超过配置文件中的最大限制（参见配置文件章节）
- 返回的 fileId 供其他业务模块存储使用

---

### 1.2 文件下载

**接口路径：** `GET /admin-api/v1/file/{fileId}`

**需求追溯：** [需求：F-002] 文件下载功能

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| fileId | string | 文件唯一标识（UUID） |

**响应示例：**
```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Disposition: attachment; filename="product_photo.jpg"

[文件二进制流]
```

**异常响应：**
```json
{
  "code": 40401,
  "message": "文件不存在",
  "data": null
}
```

**业务规则：**
- 根据 fileId 查询文件记录
- 验证文件存在性，不存在返回 40401
- 直接返回文件二进制流

---

### 1.3 文件删除

**接口路径：** `POST /admin-api/v1/file/delete`

**需求追溯：** [需求：F-003] 文件删除功能

**请求参数：**
```json
{
  "fileId": "f001a2b3c4d5e6f7g8h9i0j1k2l3m4n5"
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "deleted": true,
    "fileId": "f001a2b3c4d5e6f7g8h9i0j1k2l3m4n5"
  }
}
```

**异常响应：**
```json
{
  "code": 40401,
  "message": "文件不存在",
  "data": null
}
```

**业务规则：**
- 物理删除存储介质中的文件
- 删除文件记录（软删除）
- 仅当关联业务删除时调用

---

## 错误码规范

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| 200 | 200 | 成功 |
| 201 | 201 | 创建成功 |
| 40001 | 200 | 参数错误 |
| 40101 | 200 | 未登录 |
| 40102 | 200 | Token 过期 |
| 40301 | 200 | 无权限 |
| 40401 | 200 | 文件不存在 |
| 41501 | 200 | 不支持的文件类型 |
| 41301 | 200 | 文件大小超过限制 |
| 50001 | 200 | 服务器内部错误 |

**说明：** HTTP 状态码始终 200/201，业务错误在 code/message 中体现。

---

## 安全说明

### 认证
- 所有接口需要 Bearer Token 认证
- 用户信息从 JWT Token 中解析获取（userId, shopId, role）

### 输入验证
- 文件类型白名单校验（配置驱动，参见配置文件章节）
- 文件大小校验（配置驱动，参见配置文件章节）
- SQL注入防护（文件元数据）

### 存储隔离
- 文件按 shop_id 隔离存储
- 用户只能操作本店上传的文件（除平台管理员外）

---

## 限流策略

**说明：** 以下限流阈值通过后端配置文件管理（参见配置文件章节），实际限制值以配置文件为准。

| 接口 | 限流维度 | 配置路径 |
|------|---------|---------|
| 文件上传 | IP | `file.rate-limit.upload` |
| 文件下载 | IP | `file.rate-limit.download` |
| 文件删除 | 用户 | `file.rate-limit.delete` |

---

## 后端配置示例

```yaml
# application.yml

file:
  upload:
    # 允许的文件类型（逗号分隔）
    allowed-types: jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx
    # 最大文件大小（字节），默认 10MB = 10485760
    max-size: 10485760

  rate-limit:
    # 上传接口限流（次/分钟/IP）
    upload: 10
    # 下载接口限流（次/分钟/IP）
    download: 50
    # 删除接口限流（次/分钟/用户）
    delete: 20

  storage:
    # 存储类型：local（本地）/ oss（阿里云OSS）
    type: local
    local:
      # 本地存储根目录
      path: /uploads/
    oss:
      # OSS 配置（扩展用）
      bucket: ${OSS_BUCKET:your-bucket}
      endpoint: ${OSS_ENDPOINT:oss-cn-hangzhou.aliyuncs.com}
```
