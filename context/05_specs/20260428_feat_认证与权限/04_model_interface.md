# 认证与权限 - 数据库模型设计

## 文档信息

| 项目 | 内容 |
|------|------|
| Feature ID | 20260428_feat_认证与权限 |
| 创建人 | danshihao |
| 创建日期 | 2026-04-28 |

---

## 1. 基础信息

**数据库类型**: MySQL

**字符集**: utf8mb4

**排序规则**: utf8mb4_0900_ai_ci

**存储引擎**: InnoDB

**模块前缀**: auth

---

## 2. ER图

```
用户 (auth_user) (1) ────── (N) 邀请码 (auth_invite_code)
                │
                └── creator（生成者）
```

**关系说明**:
- 用户与邀请码：通过 creator 字段关联（邀请码绑定生成者用户）
- 审核时根据 creator 判断是否有权审核（creator 是管理员则审核店铺用户，creator 是店铺用户则审核普通用户）
- 不使用数据库外键约束，关联完整性由应用层保证

---

## 3. 表结构定义

### 3.1 用户表 (auth_user)

**表名**: `auth_user`

**用途**: 存储用户账号信息

---

**DDL语句（MySQL）**:
```sql
CREATE TABLE `auth_user` (
  `id` BIGINT NOT NULL COMMENT '主键ID（雪花ID）',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名，登录账号',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
  `password` VARCHAR(100) NOT NULL COMMENT '密码（bcrypt加密）',
  `role` VARCHAR(20) NOT NULL COMMENT '角色 [字典：user_role]',
  `shop_id` BIGINT COMMENT '所属店铺ID',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '账号状态 [字典：user_status]',
  `reject_reason` VARCHAR(500) COMMENT '审核拒绝理由',
  `last_login_time` DATETIME COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(50) COMMENT '最后登录IP',
  
  -- 公共字段
  `deleted` BIT(1) NOT NULL DEFAULT b'0' COMMENT '逻辑删除标志',
  `creator` BIGINT NOT NULL COMMENT '创建者ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater` BIGINT NOT NULL COMMENT '更新者ID',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`, `deleted`),
  INDEX `idx_role` (`role`),
  INDEX `idx_shop_id` (`shop_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';
```

**字段说明**:

| 字段名 | 类型（MySQL）| 必填 | 默认值 | 说明 |
|--------|------|--------|--------|------|
| id | BIGINT | 是 | - | 主键ID（雪花ID） |
| username | VARCHAR(50) | 是 | - | 用户名，登录账号 |
| nickname | VARCHAR(50) | 是 | - | 昵称 |
| password | VARCHAR(100) | 是 | - | 密码（bcrypt加密） |
| role | VARCHAR(20) | 是 | - | 角色 [字典：user_role] |
| shop_id | BIGINT | 否 | - | 所属店铺ID |
| status | VARCHAR(20) | 是 | pending | 账号状态 [字典：user_status] |
| reject_reason | VARCHAR(500) | 否 | - | 审核拒绝理由 |
| last_login_time | DATETIME | 否 | - | 最后登录时间 |
| last_login_ip | VARCHAR(50) | 否 | - | 最后登录IP |
| deleted | BIT(1) | 是 | b'0' | 逻辑删除标志 |
| creator | BIGINT | 是 | - | 创建者ID |
| create_time | DATETIME | 是 | CURRENT_TIMESTAMP | 创建时间 |
| updater | BIGINT | 是 | - | 更新者ID |
| update_time | DATETIME | 是 | CURRENT_TIMESTAMP | 更新时间 |

**索引说明**:

| 索引名 | 类型 | 字段 | 用途 |
|--------|------|------|------|
| pk_id | PRIMARY KEY | id | 主键索引 |
| uk_username | UNIQUE | username, deleted | 用户名唯一索引 |
| idx_role | INDEX | role | 角色查询 |
| idx_shop_id | INDEX | shop_id | 店铺查询 |
| idx_status | INDEX | status | 状态查询 |
| idx_create_time | INDEX | create_time | 创建时间排序 |

**业务规则**:
- 用户名唯一性校验
- 密码使用bcrypt加密存储
- 管理员角色不允许直接创建

---

### 3.2 邀请码表 (auth_invite_code)

**表名**: `auth_invite_code`

**用途**: 存储邀请码信息

---

**DDL语句（MySQL）**:
```sql
CREATE TABLE `auth_invite_code` (
  `id` BIGINT NOT NULL COMMENT '主键ID（雪花ID）',
  `invite_code` VARCHAR(50) NOT NULL COMMENT '邀请码',
  `role` TINYINT NOT NULL COMMENT '可注册角色 [字典：user_role]',
  `creator` BIGINT NOT NULL COMMENT '生成者ID',
  `status` VARCHAR(20) NOT NULL DEFAULT 'valid' COMMENT '邀请码状态 [字典：invite_code_status]',
  `used_user_id` BIGINT COMMENT '使用该邀请码的用户ID',
  `used_time` DATETIME COMMENT '使用时间',
  `expires_time` DATETIME COMMENT '过期时间（为空表示永久有效）',

  -- 公共字段
  `deleted` BIT(1) NOT NULL DEFAULT b'0' COMMENT '逻辑删除标志',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater` BIGINT NOT NULL COMMENT '更新者ID',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_invite_code` (`invite_code`, `deleted`),
  INDEX `idx_status` (`status`),
  INDEX `idx_creator` (`creator`),
  INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='邀请码表';
```

**字段说明**:

| 字段名 | 类型（MySQL）| 必填 | 默认值 | 说明 |
|--------|------|--------|--------|------|
| id | BIGINT | 是 | - | 主键ID（雪花ID） |
| invite_code | VARCHAR(50) | 是 | - | 邀请码 |
| role | TINYINT | 是 | - | 可注册角色 [字典：user_role] |
| creator | BIGINT | 是 | - | 生成者ID（绑定生成者用户） |
| status | VARCHAR(20) | 是 | valid | 邀请码状态 [字典：invite_code_status] |
| used_user_id | BIGINT | 否 | - | 使用该邀请码的用户ID |
| used_time | DATETIME | 否 | - | 使用时间 |
| expires_time | DATETIME | 否 | - | 过期时间（为空表示永久有效） |
| deleted | BIT(1) | 是 | b'0' | 逻辑删除标志 |
| create_time | DATETIME | 是 | CURRENT_TIMESTAMP | 创建时间 |
| updater | BIGINT | 是 | - | 更新者ID |
| update_time | DATETIME | 是 | CURRENT_TIMESTAMP | 更新时间 |

**索引说明**:

| 索引名 | 类型 | 字段 | 用途 |
|--------|------|------|------|
| pk_id | PRIMARY KEY | id | 主键索引 |
| uk_invite_code | UNIQUE | invite_code, deleted | 邀请码唯一索引 |
| idx_status | INDEX | status | 状态查询 |
| idx_creator | INDEX | creator | 生成者查询 |
| idx_create_time | INDEX | create_time | 创建时间排序 |

**业务规则**:
- 邀请码绑定生成者（creator），审核时检查生成者是否有权审核
- 管理员生成的邀请码只能注册店铺用户（role=1），由管理员审核
- 店铺用户生成的邀请码只能注册普通用户（role=2），由店铺用户审核
- 邀请码使用后状态变为"已使用"
- 重新生成邀请码后旧码失效

---

## 4. 字典数据

### 4.1 字典类型定义

```sql
-- 用户状态字典类型
INSERT INTO system_dict_type (name, type, status, remark, creator, create_time, updater, update_time, deleted, tenant_id)
VALUES ('账号状态', 'user_status', 0, '用户账号状态', 1, NOW(), 1, NOW(), b'0', 1);

-- 邀请码状态字典类型
INSERT INTO system_dict_type (name, type, status, remark, creator, create_time, updater, update_time, deleted, tenant_id)
VALUES ('邀请码状态', 'invite_code_status', 0, '邀请码状态', 1, NOW(), 1, NOW(), b'0', 1);

-- 用户角色字典类型
INSERT INTO system_dict_type (name, type, status, remark, creator, create_time, updater, update_time, deleted, tenant_id)
VALUES ('用户角色', 'user_role', 0, '用户角色', 1, NOW(), 1, NOW(), b'0', 1);
```

### 4.2 字典数据定义

```sql
-- 账号状态字典数据
INSERT INTO system_dict_data (sort, label, value, dict_type, status, color_type, css_class, remark, creator, create_time, updater, update_time, deleted, tenant_id)
VALUES 
(1, '待审核', 'pending', 'user_status', 0, 'warning', '', '等待审核', 1, NOW(), 1, NOW(), b'0', 1),
(2, '已通过', 'approved', 'user_status', 0, 'success', '', '审核通过，可正常登录', 1, NOW(), 1, NOW(), b'0', 1),
(3, '已拒绝', 'rejected', 'user_status', 0, 'danger', '', '审核拒绝，可重新注册', 1, NOW(), 1, NOW(), b'0', 1),
(4, '已冻结', 'frozen', 'user_status', 0, 'info', '', '已冻结，无法登录', 1, NOW(), 1, NOW(), b'0', 1);

-- 邀请码状态字典数据
INSERT INTO system_dict_data (sort, label, value, dict_type, status, color_type, css_class, remark, creator, create_time, updater, update_time, deleted, tenant_id)
VALUES 
(1, '有效', 'valid', 'invite_code_status', 0, 'success', '', '可用于注册', 1, NOW(), 1, NOW(), b'0', 1),
(2, '已使用', 'used', 'invite_code_status', 0, 'default', '', '已被使用', 1, NOW(), 1, NOW(), b'0', 1),
(3, '已失效', 'expired', 'invite_code_status', 0, 'danger', '', '重新生成后失效', 1, NOW(), 1, NOW(), b'0', 1);

-- 用户角色字典数据
INSERT INTO system_dict_data (sort, label, value, dict_type, status, color_type, css_class, remark, creator, create_time, updater, update_time, deleted, tenant_id)
VALUES 
(1, '管理员', 'admin', 'user_role', 0, 'danger', '', '系统管理员', 1, NOW(), 1, NOW(), b'0', 1),
(2, '店铺用户', 'shop', 'user_role', 0, 'warning', '', '店铺管理员', 1, NOW(), 1, NOW(), b'0', 1),
(3, '普通用户', 'user', 'user_role', 0, 'primary', '', '普通用户', 1, NOW(), 1, NOW(), b'0', 1);
```

---

## 5. 索引策略

### 5.1 主键索引
- 所有表使用 `id` 作为主键
- 使用雪花ID生成器，不依赖数据库自增

### 5.2 唯一索引
- `auth_user`: `(username, deleted)` 唯一索引
- `auth_invite_code`: `(invite_code, deleted)` 唯一索引

### 5.3 普通索引
- `auth_user`: `role`, `shop_id`, `status`, `create_time`
- `auth_invite_code`: `status`, `shop_id`, `create_time`

### 5.4 复合索引
- 无特殊复合索引需求

---

## 6. 安全措施

### 6.1 密码安全
- 密码使用bcrypt加密存储
- 密码最小长度8位，必须包含字母和数字

### 6.2 Token安全
- JWT Token默认有效期7天（604800秒）
- Token中包含userId、role、exp等信息

### 6.3 敏感操作
- 删除用户：逻辑删除，保留数据
- 冻结用户：状态变更，不删除数据
- 密码重置：生成随机密码，不记录明文

---

## 7. 数据权限

| 角色 | 数据范围 |
|------|---------|
| 管理员 | 全部用户 |
| 店铺用户 | 本店用户（shop_id匹配） |
| 普通用户 | 仅自己 |
