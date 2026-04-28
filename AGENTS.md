# ai-shop 项目概览

多店铺积分商城系统，前后端分离架构。

```
ai-shop/
├── code/
│   ├── frontend/          # Vue3 + reka-ui + unocss (见 code/frontend/AGENTS.md)
│   └── backend/           # Spring Boot + MyBatis (见 code/backend/AGENTS.md)
├── context/                # 需求文档（SSOT）、PRD、原型
├── UI/                     # 液态玻璃设计资产
└── AGENTS.md              # 本文档（索引）
```

## 核心约束（来自需求文档，勿违背）
- 积分是唯一货币，无现金支付
- 表级别数据隔离（shop_id 区分）
- 店铺审核：账号审核 → 店铺申请审核
- 邀请码永久有效，重新生成后旧码立即失效
- 普通用户最多 5 个收货地址，仅 1 个默认
- **后端统一响应格式**：`{ code, message, data }`，HTTP 状态码始终 200/201，业务错误在 code/message 中体现

## 开发快速入口

| 前端 | 后端 |
|------|------|
| `cd code/frontend && pnpm dev` | `cd code/backend && mvn spring-boot:run` |
| 类型检查：`pnpm build` | 编译：`mvn compile` |
| 详细文档：`code/frontend/AGENTS.md` | 详细文档：`code/backend/AGENTS.md` |

## 文档索引

| 文档 | 用途 |
|------|------|
| `code/frontend/AGENTS.md` | 前端技术栈、开发命令、入口点、UI 规范 |
| `code/backend/AGENTS.md` | 后端技术栈、开发命令、入口点、配置 |
| `AGETNS_DATABASE_API_RULE.md` | 全局 API 设计规范（RESTful、响应格式、错误码） |
| `context/01_需求澄清/00_业务需求.md` | 核心业务逻辑、角色、数据隔离规则（SSOT） |
| `context/02_prd/PRD.md` | 产品需求文档 |
| `UI/00_UI页面提示词.md` | 前端页面风格指导（液态玻璃） |
| `UI/template/variables.css` | 主题色变量 |

## 已知限制

1. 后端 `application.yml` 配置不完整（数据库连接等未列出）
2. 前端无测试框架（需自行添加）
3. 无 CI/CD 配置
4. 无 `opencode.json` 自定义指令配置