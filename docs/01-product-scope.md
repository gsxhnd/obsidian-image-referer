# 产品范围

## 项目简介

obsidian-image-referer 是一个 Obsidian 社区插件，用于在加载图片时自动为 HTTP 请求添加自定义的 Referer 头，解决部分图床因 Referer 校验导致图片无法显示的问题。

## 项目定位

许多图床服务（如微信公众号图片、部分 CDN）会校验请求的 Referer 头，当 Referer 为空或不在白名单内时返回 403 或替代图片。Obsidian 作为本地应用加载远程图片时，默认不携带 Referer 或携带 `app://obsidian.md`，导致这些图片无法正常显示。

本插件通过拦截图片请求并注入用户自定义的 Referer 值来解决此问题。

## 目标

- 让用户在 Obsidian 中正常查看需要特定 Referer 的远程图片
- 提供简单直观的配置界面
- 保持插件轻量，不影响 Obsidian 性能

## 目标用户

- **笔记迁移用户**：从微信公众号、博客等平台迁移笔记到 Obsidian，图片链接带有 Referer 校验
- **知识管理用户**：在笔记中引用外部图片资源，需要绕过 Referer 限制

## 功能需求

### 核心功能

1. **Referer 注入**：拦截 Obsidian 加载图片的 HTTP 请求，在请求头中添加自定义 Referer 值
2. **设置页面**：提供 Obsidian 设置面板（PluginSettingTab），允许用户配置自定义 Referer 值

### 扩展功能（未来考虑）

- 按域名配置不同的 Referer 规则
- 支持正则匹配 URL 模式
- 支持启用/禁用特定域名的 Referer 注入

## 非功能性需求

- **性能**：请求拦截逻辑应尽可能轻量，不引入可感知的延迟
- **安全**：不收集用户数据，不发送任何遥测信息，仅在本地修改请求头
- **兼容性**：仅支持 Obsidian 桌面端（Windows、macOS、Linux），`isDesktopOnly: true`。移动端（iOS/Android）因 Capacitor WebView 无法拦截自动图片请求的 Referer 头，技术上不可行（详见 `06-open-questions.md` DR-02）
- **稳定性**：插件卸载后完全恢复原始行为，不留残余副作用

## 入口模式

Obsidian 插件，通过 Obsidian 设置页面进行配置，无独立 CLI 或 API 入口。

## MVP 范围

### MVP 包含

- 全局 Referer 值配置（单一值，应用于所有图片请求）
- Obsidian 设置页面中的 Referer 输入框
- 图片请求拦截与 Referer 头注入

### MVP 不包含

- 按域名配置不同 Referer
- URL 模式匹配规则
- 启用/禁用开关（按域名粒度）
- 移动端支持（技术上不可行，非优先级问题）

### MVP 约束

- 仅处理图片类型的 HTTP/HTTPS 请求
- Referer 值为全局统一配置

## 验收标准

- 配置 Referer 后，需要该 Referer 的远程图片能在 Obsidian 中正常显示
- 设置页面能正确保存和加载 Referer 配置
- 插件禁用/卸载后，图片加载行为恢复默认
- 不影响不需要 Referer 的图片正常加载

## 延期项

- 多域名规则配置
- 正则匹配支持
- 移动端适配
- 图片加载状态指示
