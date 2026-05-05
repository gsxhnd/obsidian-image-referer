# obsidian-image-referer 开发文档

## 概述

Obsidian 加载图片时自动添加自定义 Referer 请求头的社区插件。

本目录是 obsidian-image-referer 的开发文档，包含产品定义、架构设计、领域模型、技术栈说明、开发路线图和待决问题。

## 阅读顺序

| 文件 | 内容 |
|------|------|
| `01-product-scope.md` | 产品定位、需求、MVP 范围与验收标准 |
| `02-architecture.md` | 系统分层、模块职责、依赖关系 |
| `03-domain-model.md` | 核心类型、接口定义、数据流 |
| `04-tech-stack.md` | 语言版本、依赖管理、工具链、常用命令 |
| `05-roadmap.md` | 开发路线图、阶段划分、里程碑 |
| `06-open-questions.md` | 未决设计问题与决策记录 |

**建议阅读顺序**：`01` → `02` → `03` → `04` → `05` → `06`

## 文档规则

- `docs/` 是当前唯一有效的开发文档源
- 产品范围以 `01-product-scope.md` 为准
- 架构边界以 `02-architecture.md` 与 `03-domain-model.md` 为准
- 开发顺序以 `05-roadmap.md` 为准
- 未决问题统一记录在 `06-open-questions.md`
- 文档默认为 draft，代码落地后再更新为已验证描述

## 设计原则

- 先定义边界，再定义接口，再定义实现细节
- 插件保持轻量，启动时不做重计算
- 使用 Obsidian 提供的 `register*` 系列方法管理生命周期，确保卸载时无泄漏
