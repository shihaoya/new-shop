# 数据库模型设计

## 基础信息

**模块前缀：** sys_file

**数据库类型：** MySQL

**字符集：** utf8mb4

**排序规则：** utf8mb4_0900_ai_ci

**存储引擎：** InnoDB

---

## ER图

```
文件信息表 (sys_file_info)
  │
  └── shop_id 关联 → 店铺表（数据隔离）
  └── uploader_id 关联 → 用户表（上传用户）
```

---

## 表结构定义

### 1. sys_file_info 文件信息表

**表名：** `sys_file_info`

**用途：** 存储文件元数据，实现文件存储服务。业务模块通过 file_id 关联文件，不存储文件本身。

---

**MySQL DDL：**
```sql
CREATE TABLE `sys_file_info` (
  `id` BIGINT NOT NULL COMMENT '主键ID（雪花ID）',
  `file_id` VARCHAR(50) NOT NULL COMMENT '文件唯一标识（UUID）',
  `original_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
  `stored_name` VARCHAR(255) NOT NULL COMMENT '存储文件名（UUID生成）',
  `storage_path` VARCHAR(500) NOT NULL COMMENT '存储路径，含目录结构',
  `file_size` BIGINT NOT NULL COMMENT '文件大小（字节）',
  `mime_type` VARCHAR(100) NOT NULL COMMENT 'MIME类型，如 image/png',
  `file_category` VARCHAR(50) NOT NULL DEFAULT 'common' COMMENT '文件分类，用于区分业务场景',

  -- 租户隔离字段
  `shop_id` BIGINT NOT NULL COMMENT '店铺ID，数据隔离标识',

  -- 审计字段
  `creator` BIGINT NOT NULL COMMENT '创建者ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater` BIGINT NOT NULL COMMENT '更新者ID',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` BIT(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_file_id` (`file_id`),
  INDEX `idx_shop_id` (`shop_id`),
  INDEX `idx_creator` (`creator`),
  INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='文件信息表';
```

---

**字段说明：**

| 字段名 | 类型（MySQL）| 必填 | 默认值 | 说明 |
|--------|------|--------|--------|------|
| id | BIGINT | 是 | - | 主键ID（雪花ID） |
| file_id | VARCHAR(50) | 是 | - | 文件唯一标识（UUID），业务模块通过此ID关联文件 |
| original_name | VARCHAR(255) | 是 | - | 原始文件名，用于展示给用户 |
| stored_name | VARCHAR(255) | 是 | - | 存储文件名（UUID生成），存储介质中的实际文件名 |
| storage_path | VARCHAR(500) | 是 | - | 存储路径，包含时间戳目录结构，如 `/uploads/2026/04/28/xxx.jpg` |
| file_size | BIGINT | 是 | - | 文件大小，单位：字节 |
| mime_type | VARCHAR(100) | 是 | - | MIME类型，如 `image/png`、`application/pdf` |
| file_category | VARCHAR(50) | 否 | common | 文件分类，用于区分不同业务场景（common/product_image/avatar等） |
| shop_id | BIGINT | 是 | - | 店铺ID，数据隔离标识，按店铺隔离文件访问 |
| creator | BIGINT | 是 | - | 创建者ID |
| create_time | DATETIME | 是 | CURRENT_TIMESTAMP | 创建时间 |
| updater | BIGINT | 是 | - | 更新者ID |
| update_time | DATETIME | 是 | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deleted | BIT(1) | 是 | b'0' | 是否删除 |

**索引说明：**

| 索引名 | 类型 | 字段 | 用途 |
|--------|------|------|------|
| pk_id | PRIMARY KEY | id | 主键索引 |
| uk_file_id | UNIQUE KEY | file_id | 唯一索引，保证文件ID全局唯一 |
| idx_shop_id | INDEX | shop_id | 按店铺查询文件 |
| idx_creator | INDEX | creator | 按创建人查询文件 |
| idx_create_time | INDEX | create_time | 按时间排序和查询 |

**业务规则：**
1. 文件记录物理删除：删除时同时删除存储介质中的文件和数据库记录，不提供回收站功能
2. file_id 关联模式：业务模块仅存储 file_id，不存储文件本身，通过 file_id 查询获取文件
3. 存储路径结构：`{存储根目录}/{年份}/{月份}/{日期}/{stored_name}`
4. 文件类型限制：仅允许图片类型（jpg, jpeg, png, gif, webp）和文档类型（pdf, doc, docx, xls, xlsx）
5. 文件大小限制：单文件不超过 10MB（10485760 字节）

---

## 存储配置

### 存储类型配置

| 配置项 | 值 | 说明 |
|-------|------|------|
| 存储类型 | LOCAL / OSS | 通过后端配置文件指定，默认 LOCAL |
| 本地存储路径 | /uploads/ | 服务器本地磁盘存储路径 |
| OSS bucket | [配置项] | OSS bucket 名称（扩展用） |

### 存储路径生成规则

```
storage_path = {storage_root}/{yyyy}/{MM}/{dd}/{stored_name}
示例：/uploads/2026/04/28/f001a2b3c4d5.jpg
```

---

## 性能优化

### 索引优化
- `idx_shop_id`：按店铺查询文件列表，避免全表扫描
- `idx_create_time`：按时间排序，支持分页查询

### 存储优化
- 文件物理存储与数据库分离，数据库仅存储元数据
- 大文件可分离到独立存储服务（OSS）

---

## 安全措施

### 数据隔离
- 所有文件操作必须携带 shop_id 过滤条件
- 平台管理员可访问所有店铺文件
- 普通用户仅能操作本店文件

### 文件安全
- 文件类型白名单校验，不在白名单内的文件拒绝上传
- 文件大小校验，超过限制拒绝上传
- SQL注入防护：文件名等元数据存储时进行特殊字符过滤
