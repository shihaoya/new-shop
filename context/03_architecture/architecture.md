# 积分商城系统 - 系统架构文档

## 1. 基础技术框架

### 1.1 技术栈选择

本系统采用前后端分离架构，后端基于现有的Spring Boot 4.0.6项目增量设计，前端基于现有的Vue 3 + reka-ui项目增量开发。系统支持多店铺独立运营，以积分作为唯一货币，实现表级别租户隔离（通过shop_id区分）。

#### 后端技术框架

- **框架**：Spring Boot 4.0.6
- **语言**：Java 21
- **ORM**：MyBatis 4.0.1 + MyBatis-Plus
- **构建工具**：Maven
- **测试框架**：JUnit 5 + Mockito
- **核心依赖**：Lombok、Jackson、Redisson（Redis客户端）

#### 前端技术框架

- **框架**：Vue 3.5 + Vite 8.0
- **UI组件库**：reka-ui（轻量级Vue3组件库）
- **语言**：TypeScript 6.0
- **状态管理**：Pinia
- **路由**：Vue Router 4
- **样式**：UnoCSS + CSS变量（液态玻璃风格）
- **包管理器**：pnpm

#### 数据库选择

- **主数据库**：MySQL 8.0+
- **字符集**：utf8mb4
- **排序规则**：utf8mb4_0900_ai_ci

#### 中间件和基础设施

| 组件 | 推荐技术 | 用途 | 可选性 |
|------|----------|------|--------|
| 缓存 | Redis | 热数据缓存、会话管理、雪花ID存储 | 必选 |
| 本地文件存储 | 阿里云OSS（可选）/本地磁盘 | 商品图片、店铺Logo存储 | 可选 |
| 消息队列 | 无 | 当前版本不需要异步消息处理 | - |

#### 新增技术选型理由

- **雪花ID（Snowflake）**：解决分布式环境下的ID生成问题，shop_id字段设计使其天然支持分店隔离。每个店铺的ID在店铺前缀基础上生成，确保跨店铺ID不冲突。
- **MyBatis-Plus**：在现有MyBatis 4.0.1基础上引入，简化CRUD操作，提供强大的条件构造器，减少样板代码。
- **Redisson**：Redis客户端，简化分布式缓存和锁操作，提供阻塞队列等高级数据结构支持订单超时处理。
- **逻辑删除**：通过deleted字段实现数据软删除，保留数据可追溯性。

### 1.2 雪花ID设计与传输规范

#### 后端雪花ID生成

- 使用Twitter Snowflake算法，64位整型
- 结构：timestamp(41bit) + machine_id(10bit) + sequence(12bit)
- 时间戳从2024-01-01开始，支持约70年

#### 前端传输规范

- 后端生成雪花ID后，在JSON序列化前转为String类型
- 响应格式：`{ "code": "200", "message": "success", "data": { "id": "184367285448197" } }`
- 前端TypeScript接收时使用string类型，避免精度丢失（JavaScript Number最大安全整数为2^53-1，约9万亿，而雪花ID最大为2^63-1）

#### 实现方式

后端全局配置Jackson，对Long类型字段自动转为String：

```yaml
spring:
  jackson:
    serialization:
      write-numbers-as-strings: true
```

---

## 2. 模块划分和模块间依赖关系

### 2.1 系统模块分层架构

```
Controller层（控制器层，接受HTTP请求，参数校验）
    ↓
Service层（业务逻辑层，核心业务处理）
    ↓
DAO层（数据访问层，MyBatis Mapper接口）
```

**分层职责**：
- **Controller层**：接收请求参数校验、调用Service、处理响应格式（统一 { code, message, data }）
- **Service层**：核心业务逻辑处理、事务管理、复杂业务规则
- **DAO层**：数据库操作、MyBatis Mapper定义

### 2.2 业务模块划分

| 模块 | 职责范围 | 对应PRD功能 | 依赖关系 |
|------|----------|-------------|---------|
| **系统基础设施** | 租户数据隔离（shop_id）、雪花ID生成器、统一响应格式 | 数据过滤（FR-SYS-006） | 无 |
| **账号与认证** | 登录、注册、邀请码、账号审核、密码重置、Token管理 | 账号注册流程、密码重置流程 | 系统基础设施 |
| **站内消息** | 消息发送、消息查看、订单超时提醒（定时任务） | 消息查看、审核结果通知、密码重置通知、订单超时提醒 | 系统基础设施 |
| **平台管理** | 管理员仪表盘、店铺审核/冻结/解冻、跨店铺用户管理、邀请码生成 | 全局数据统计、店铺审核、店铺管理、用户账号管理、邀请码管理 | 账号与认证、站内消息 |
| **店铺核心运营** | 商品分类管理（系统内置+商家自定义）、商品CRUD/上下架 | 商品分类管理、商品管理 | 系统基础设施、站内消息 |
| **店铺用户管理** | 普通用户管理（邀请码/创建/审核注册）、积分维护（增扣/记录） | 普通用户管理、积分维护、密码重置 | 账号与认证、店铺核心运营 |
| **订单流程** | 订单处理（查看/确认/发货/完成/关闭）、订单超时检查 | 订单处理 | 店铺用户管理、商品管理 |
| **用户端浏览与兑换** | 商品列表/详情、实物/虚拟兑换流程、收货信息管理、地址簿 | 商品浏览、商品兑换、收货信息管理、地址簿管理 | 店铺核心运营、店铺用户管理 |
| **用户端订单与个人中心** | 我的订单、积分查询与明细 | 订单管理、个人信息管理 | 用户端浏览与兑换 |

### 2.3 模块间依赖关系图

```mermaid
graph TB
    subgraph ["基础模块"]
        BASE1[系统基础设施<br/>租户隔离/雪花ID/统一响应]
        BASE2[账号与认证<br/>登录/注册/Token]
        BASE3[站内消息<br/>消息发送/查看]
    end

    subgraph ["店铺运营模块"]
        SHOP1[店铺核心运营<br/>商品分类/商品管理]
        SHOP2[店铺用户管理<br/>用户管理/积分维护]
        ORDER[订单流程<br/>订单处理/超时检查]
    end

    subgraph ["用户端模块"]
        USER1[用户端浏览与兑换<br/>商品浏览/兑换/地址簿]
        USER2[用户端订单与个人中心<br/>我的订单/积分查询]
    end

    subgraph ["平台管理模块"]
        ADMIN[平台管理<br/>仪表盘/店铺管理/用户管理]
    end

    BASE1 -.基础支撑.-> BASE2
    BASE1 -.基础支撑.-> BASE3
    BASE1 -.基础支撑.-> SHOP1
    BASE1 -.基础支撑.-> SHOP2
    BASE1 -.基础支撑.-> ORDER
    BASE1 -.基础支撑.-> USER1
    BASE1 -.基础支撑.-> ADMIN

    BASE2 --> BASE3
    BASE2 --> ADMIN
    BASE3 --> ADMIN
    BASE3 --> SHOP1
    BASE3 --> SHOP2
    BASE3 --> ORDER

    SHOP1 --> SHOP2
    SHOP1 --> USER1
    SHOP2 --> ORDER
    ORDER --> USER1
    USER1 --> USER2
    SHOP2 --> USER1
```

**依赖关系说明**：
- **系统基础设施**为底层基础模块，所有其他模块依赖它提供的租户隔离和雪花ID能力
- **账号与认证**依赖系统基础设施，平台管理和店铺运营依赖它提供的用户认证能力
- **站内消息**依赖系统基础设施，被平台管理、店铺运营、订单流程调用，用于发送通知
- **订单流程**依赖店铺用户管理和商品管理，完成订单的完整生命周期
- **用户端浏览与兑换**依赖店铺核心运营和店铺用户管理，提供用户兑换体验
- 模块间通过**同步API调用**进行通信，避免循环依赖

### 2.4 模块间通信方式

| 场景 | 通信方式 | 说明 |
|------|----------|------|
| Controller调用Service | 依赖注入 | 通过@Autowired或构造器注入，直接方法调用 |
| Service间调用 | 依赖注入 | 跨模块调用通过Service接口，降低耦合 |
| 订单超时提醒 | Redis键过期监听 + 定时任务 | 使用Redisson的键过期监听实现订单超时提醒 |

### 2.5 新增模块内部结构

#### 后端新增业务模块

**模块说明**：基于现有 `com.linkman.aishop` 包结构增量开发，按业务能力划分模块。

```
ai-shop-backend/
└── src/main/java/com/linkman/aishop/
    ├── AishopApplication.java           # 启动类
    │
    ├── common/                          # 公共模块
    │   ├── annotation/                   # 自定义注解
    │   │   └── ShopIsolation.java       # 店铺隔离注解（用于自动注入shop_id）
    │   ├── config/                      # 配置类
    │   │   ├── JacksonConfig.java       # Jackson全局配置（Long转String）
    │   │   ├── RedisConfig.java         # Redis配置
    │   │   └── WebMvcConfig.java        # Web MVC配置
    │   ├── constant/                    # 常量定义
    │   │   └── RedisKeys.java           # Redis Key常量
    │   ├── enums/                       # 枚举类
    │   │   ├── UserType.java            # 用户类型（管理员/店铺用户/普通用户）
    │   │   ├── ShopStatus.java          # 店铺状态（申请中/已通过/已拒绝/已冻结）
    │   │   ├── AccountStatus.java        # 账号状态（审核中/已通过/已拒绝）
    │   │   ├── OrderStatus.java          # 订单状态（已下单/已确认/已发货/已完成/已关闭）
    │   │   └── ProductType.java         # 商品类型（虚拟/实物）
    │   ├── exception/                  # 异常类
    │   │   ├── BizException.java        # 业务异常
    │   │   └── ErrorCode.java           # 错误码枚举
    │   ├── util/                        # 工具类
    │   │   ├── SnowflakeIdUtil.java      # 雪花ID生成工具
    │   │   └── ShopContextUtil.java     # 店铺上下文工具
    │   └── vo/                          # 统一响应 VO
    │       └── ApiResponse.java         # { code, message, data }
    │
    ├── system/                          # 系统基础设施模块
    │   ├── controller/
    │   │   └── health/                  # 健康检查
    │   ├── service/
    │   │   └── ConfigService.java       # 系统配置服务
    │   └── mapper/
    │       └── ConfigMapper.java        # 配置Mapper
    │
    ├── auth/                            # 账号与认证模块
    │   ├── controller/
    │   │   ├── LoginController.java     # 登录
    │   │   ├── RegisterController.java  # 注册
    │   │   └── InviteCodeController.java # 邀请码
    │   ├── service/
    │   │   ├── AuthService.java         # 认证服务接口
    │   │   └── impl/
    │   │       └── AuthServiceImpl.java # 认证服务实现
    │   ├── mapper/
    │   │   ├── UserMapper.java          # 用户Mapper
    │   │   └── InviteCodeMapper.java    # 邀请码Mapper
    │   └── vo/
    │       ├── LoginRequest.java        # 登录请求
    │       ├── LoginResponse.java       # 登录响应
    │       └── RegisterRequest.java     # 注册请求
    │
    ├── message/                         # 站内消息模块
    │   ├── controller/
    │   │   └── MessageController.java   # 消息管理
    │   ├── service/
    │   │   ├── MessageService.java      # 消息服务接口
    │   │   └── impl/
    │   │       └── MessageServiceImpl.java
    │   ├── mapper/
    │   │   └── MessageMapper.java       # 消息Mapper
    │   ├── job/
    │   │   └── OrderTimeoutJob.java     # 订单超时检查定时任务
    │   └── entity/
    │       └── Message.java             # 消息实体
    │
    ├── shop/                            # 店铺运营模块
    │   ├── controller/
    │   │   ├── ProductCategoryController.java # 商品分类
    │   │   └── ProductController.java    # 商品管理
    │   ├── service/
    │   │   ├── ProductCategoryService.java
    │   │   ├── ProductService.java
    │   │   └── impl/
    │   ├── mapper/
    │   │   ├── ProductCategoryMapper.java
    │   │   └── ProductMapper.java
    │   └── entity/
    │       ├── ProductCategory.java     # 商品分类
    │       └── Product.java             # 商品
    │
    ├── user/                            # 用户管理模块
    │   ├── controller/
    │   │   ├── ShopUserController.java   # 店铺用户管理
    │   │   └── NormalUserController.java # 普通用户管理
    │   ├── service/
    │   │   ├── ShopUserService.java
    │   │   ├── NormalUserService.java
    │   │   ├── PointsService.java       # 积分服务
    │   │   └── AddressBookService.java   # 地址簿服务
    │   ├── mapper/
    │   │   ├── ShopUserMapper.java
    │   │   ├── NormalUserMapper.java
    │   │   ├── PointsLogMapper.java
    │   │   └── AddressBookMapper.java
    │   └── entity/
    │       ├── ShopUser.java            # 店铺用户
    │       ├── NormalUser.java           # 普通用户
    │       ├── PointsLog.java            # 积分变动记录
    │       └── AddressBook.java          # 地址簿
    │
    └── order/                           # 订单模块
        ├── controller/
        │   └── OrderController.java      # 订单处理
        ├── service/
        │   ├── OrderService.java
        │   └── PointsRefundService.java  # 积分退回服务
        ├── mapper/
        │   └── OrderMapper.java
        └── entity/
            └── Order.java               # 订单
```

**说明**：
- 严格遵循现有 `com.linkman.aishop` 包结构，按业务能力划分
- Controller层处理参数校验和响应格式化
- Service层处理核心业务逻辑
- Mapper层处理数据库操作
- 全局使用统一响应格式 `{ code, message, data }`

#### 前端新增模块

基于现有Vue 3 + reka-ui + UnoCSS项目增量开发，按用户角色划分页面模块。

```
ai-shop-frontend/
└── src/
    ├── api/                            # API接口
    │   ├── auth/                       # 认证相关API
    │   │   ├── login.ts
    │   │   └── register.ts
    │   ├── admin/                      # 平台管理API
    │   │   ├── dashboard.ts
    │   │   ├── shop.ts
    │   │   └── user.ts
    │   ├── shop/                       # 店铺运营API
    │   │   ├── product.ts
    │   │   ├── category.ts
    │   │   ├── customer.ts
    │   │   ├── points.ts
    │   │   └── order.ts
    │   └── user/                       # 用户端API
    │       ├── product.ts
    │       ├── order.ts
    │       ├── address.ts
    │       └── profile.ts
    │
    ├── components/                      # 公共组件（已存在）
    │   └── ...
    │
    ├── views/                          # 页面视图
    │   ├── admin/                      # 平台管理端页面
    │   │   ├── Dashboard.vue           # 管理仪表盘
    │   │   ├── ShopList.vue           # 店铺列表/审核
    │   │   ├── UserList.vue           # 用户列表
    │   │   └── InviteCode.vue         # 邀请码管理
    │   │
    │   ├── shop/                       # 店铺运营端页面
    │   │   ├── Dashboard.vue          # 店铺仪表盘
    │   │   ├── ProductList.vue        # 商品列表
    │   │   ├── ProductEdit.vue        # 商品编辑
    │   │   ├── CategoryList.vue        # 分类管理
    │   │   ├── CustomerList.vue       # 普通用户管理
    │   │   ├── PointsLog.vue          # 积分记录
    │   │   ├── OrderList.vue          # 订单列表
    │   │   └── OrderDetail.vue        # 订单详情
    │   │
    │   └── user/                       # 用户端页面
    │       ├── ProductList.vue        # 商品列表
    │       ├── ProductDetail.vue      # 商品详情
    │       ├── Exchange.vue           # 兑换页面
    │       ├── OrderList.vue         # 我的订单
    │       ├── AddressBook.vue        # 地址簿
    │       └── Profile.vue           # 个人中心
    │
    ├── store/                          # Pinia状态管理
    │   ├── modules/
    │   │   ├── auth.ts                # 认证状态
    │   │   ├── shop.ts                # 店铺状态
    │   │   └── user.ts                # 用户状态
    │   └── index.ts
    │
    ├── router/                         # 路由配置
    │   ├── modules/
    │   │   ├── admin.ts              # 管理端路由
    │   │   ├── shop.ts               # 店铺端路由
    │   │   └── user.ts               # 用户端路由
    │   └── index.ts
    │
    ├── styles/                         # 样式文件
    │   ├── variables.scss             # 液态玻璃CSS变量
    │   └── glassmorphism.scss         # 毛玻璃效果样式
    │
    ├── App.vue
    └── main.ts
```

**说明**：
- 遵循现有Vue 3 Composition API + `<script setup>` 风格
- 使用reka-ui组件库构建UI
- 使用UnoCSS原子CSS
- 液态玻璃（Glassmorphism）设计风格，通过CSS变量统一管理

---

## 3. 本系统与外部系统的关联

### 3.1 本系统调用外部系统的接口（集成外部服务）

#### 3.1.1 本地文件存储集成

| 接口名称 | 用途 | 交互方式 | 数据流向 | 集成方式 |
|----------|------|----------|----------|----------|
| 文件上传 | 商品主图、详情图、店铺Logo上传 | HTTP Multipart | 前端→后端→本地存储/OSS | 可选：本地磁盘或阿里云OSS |

**使用场景**：
- **店铺运营**：店铺用户上传商品图片、设置店铺Logo
- **商品管理**：普通用户查看商品详情时加载图片

**错误处理和重试机制**：
- 超时时间：30秒
- 重试次数：3次（指数退避）
- 失败降级：返回默认占位图

### 3.2 本系统提供给外部的接口（对外暴露服务接口）

**定义**：本系统作为提供方，向外部系统开放HTTP RESTful API。

**使用场景**：
- 当前版本无对外暴露接口需求
- 所有功能仅供内部用户使用

**注意**：
- 后续如有小程序/APP接入需求，可扩展对外API
- 届时需设计API文档、认证授权机制、版本管理策略

### 3.3 接口清单

| 外部系统 | 交互方式 | 集成方式 | 错误处理 |
|----------|----------|----------|----------|
| 本地文件存储 | HTTP Multipart | Spring MultipartResolver | 超时重试+降级占位图 |

---

## 4. 架构约束

### 4.1 性能要求

#### 响应时间要求

| 场景 | 目标响应时间 | 说明 |
|------|-------------|------|
| 页面初次加载 | < 2s | 首屏渲染完成 |
| API普通请求 | < 500ms | 正常操作响应 |
| 文件上传 | < 5s | 图片上传完成 |
| 复杂查询（统计报表） | < 2s | 数据量<10万级别 |

#### 并发量要求

| 场景 | 目标并发量 | 说明 |
|------|-------------|------|
| 同时在线用户 | 100-500 | 中小型店铺运营 |
| API并发请求 | 50-100 TPS | 正常运营期间 |

#### 数据量要求

| 场景 | 预估数据量 | 说明 |
|------|-----------|------|
| 单店铺商品数 | < 10000 | 正常运营商品数量 |
| 单店铺用户数 | < 50000 | 活跃用户数量 |
| 单店铺订单数 | < 100000 | 历史订单累计 |

### 4.2 安全要求

#### 认证方式

- **方式**：Token认证（JWT）
- **实现**：用户登录成功后服务端生成JWT Token返回给客户端，客户端在后续请求中携带Token
- **Token有效期**：7天（可刷新）
- **登录方式**：用户名+密码登录，支持邀请码注册

#### 授权机制

- **方式**：基于角色（Role）的访问控制 + 数据店铺隔离
- **实现**：用户拥有角色（管理员/店铺用户/普通用户），角色对应功能权限，数据通过shop_id隔离
- **权限粒度**：
  - 管理员：全局数据访问权限
  - 店铺用户：本店数据访问权限
  - 普通用户：个人数据访问权限（仅限本人订单、地址等）

#### 数据加密

- **传输加密**：HTTPS（TLS 1.2+）
- **存储加密**：暂不启用（数据敏感度低）
- **密码加密**：BCrypt（盐值+哈希）

#### 敏感数据保护

- **字段脱敏**：手机号中间4位脱敏（如138****8888）
- **访问审计**：关键操作记录操作日志（管理员重置密码、积分调整等）
- **数据隔离**：通过shop_id确保店铺间数据完全隔离，跨店查询返回空

### 4.3 可扩展性要求

当前系统为中小型单体应用，单服务器部署即可满足需求。架构支持以下扩展能力：

#### 水平扩展能力

- **应用部署**：通过Nginx负载均衡多实例部署，支持横向扩展
- **数据库扩展**：当前为单MySQL实例，如数据量增长可升级为主从复制或分库分表

#### 垂直扩展能力

- **应用配置**：通过增加服务器配置（CPU/内存）提升单机性能

### 4.4 技术约束

#### 必须使用的技术栈

- **后端框架**：Spring Boot 4.0.6（现有）
- **前端框架**：Vue 3.5 + Vite 8.0（现有）
- **数据库**：MySQL 8.0+（utf8mb4字符集）
- **ORM**：MyBatis 4.0.1 + MyBatis-Plus
- **UI组件库**：reka-ui（现有）
- **状态管理**：Pinia（现有）
- **缓存**：Redis
- **样式方案**：UnoCSS + CSS变量（液态玻璃风格）
- **ID生成**：雪花ID（Snowflake），传输时转为String

#### 禁止的技术

- **前端框架**：禁止使用jQuery（已有Vue无需引入）
- **后端**：禁止使用Hibernate（JPA），保持MyBatis
- **状态管理**：禁止使用Vuex（已有Pinia）

#### 兼容性要求

- **浏览器**：Chrome 90+、Firefox 88+、Safari 14+、Edge 90+
- **移动端**：暂不支持移动端H5，后续可扩展
- **第三方系统**：暂不涉及

---

## 5. 附录

### 5.1 技术术语表

| 术语 | 说明 |
|------|------|
| 雪花ID（Snowflake） | Twitter开源的分布式ID生成算法，生成64位整型ID，具有趋势递增和唯一性 |
| 表级别租户隔离 | 通过shop_id字段区分不同店铺的数据，实现多租户数据隔离 |
| 逻辑删除 | 通过deleted字段标记数据状态，而非物理删除，保留数据可追溯性 |
| 液态玻璃（Glassmorphism） | UI设计风格，特点毛玻璃效果、半透明背景、光泽边框 |
| BCrypt | 密码哈希算法，自带盐值，安全性高 |
| JWT | JSON Web Token，一种用于身份认证的Token格式 |

### 5.2 参考文档

- PRD文档：`/context/02_prd/PRD.md`
- 业务需求：`/context/01_需求澄清/00_业务需求.md`
- 前端开发指南：`/code/frontend/AGENTS.md`
- 后端开发指南：`/code/backend/AGENTS.md`
- UI设计资产：`/UI/00_UI页面提示词.md`

### 5.3 变更记录

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|---------|------|
| v1.0 | 2026-04-28 | 初版架构文档，基于PRD和现有项目技术栈生成 | Sisyphus |

---

**文档版本**：v1.0
**创建日期**：2026-04-28
**最后更新**：2026-04-28