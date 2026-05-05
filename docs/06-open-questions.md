# 待决问题

## 概述

本文档记录 obsidian-image-referer 开发过程中的未决设计问题和已做出的决策。

## 未决问题

| # | 问题 | 上下文 | 候选方案 | 状态 |
|---|------|--------|----------|------|
| 3 | 空 Referer 配置的行为 | 用户未配置 Referer 时插件应如何表现 | A: 不拦截任何请求 / B: 拦截但不修改头 | 待讨论 |

## 已决策

| # | 问题 | 决策 | 理由 | 日期 |
|---|------|------|------|------|
| 1 | 请求拦截方式选择 | Electron `session.webRequest.onBeforeSendHeaders` | 官方 API，可按 resourceType 过滤，稳定可靠 | 2026-05-05 |
| 2 | 是否标记为 isDesktopOnly | 设为 `true`（仅桌面端） | 移动端无法实现自动图片请求的 Referer 注入 | 2026-05-05 |

## 决策记录

### DR-01: 使用 Electron WebRequest API 拦截图片请求

- **日期**：2026-05-05
- **状态**：已决策
- **上下文**：需要在图片 HTTP 请求发出前注入自定义 Referer 头，Electron 环境下有多种拦截方式
- **决策**：使用 `session.defaultSession.webRequest.onBeforeSendHeaders` API
- **理由**：
  - 官方 Electron API，稳定且有明确的生命周期管理
  - 支持 `resourceType` 过滤，可精确匹配 `image` 类型请求
  - 支持 URL pattern filter，可按域名过滤
  - 不影响其他类型的网络请求
  - 相比 monkey-patch fetch/XHR，能覆盖所有图片加载场景（包括 `<img>` 标签自动加载）
- **影响**：
  - 插件必须标记为 `isDesktopOnly: true`
  - 需要注意 Electron 版本差异：某些版本设置 Referer 头需配合 `referrerPolicy` 使用（参考 [electron#33092](https://github.com/electron/electron/issues/33092)）
- **备选方案对比**：

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| Electron `session.webRequest.onBeforeSendHeaders` | 官方 API，覆盖所有请求，支持 resourceType 过滤 | 仅桌面端可用；Referer 头在部分 Electron 版本有 bug | **采用** |
| Monkey-patch `window.fetch` / `XMLHttpRequest` | 纯 JS，跨平台 | 无法拦截 `<img>` 标签自动加载的请求 | 排除 |
| Service Worker | 标准 Web API | Obsidian 使用 `app://` 协议，不支持注册 Service Worker | 排除 |
| Markdown post-processor + `requestUrl()` 下载 | 可跨平台 | 性能差，内存开销大，无法覆盖所有渲染场景 | 排除 |

---

### DR-02: 插件标记为 isDesktopOnly

- **日期**：2026-05-05
- **状态**：已决策
- **上下文**：需要确定插件是否支持移动端（iOS/Android）
- **决策**：`manifest.json` 中设置 `isDesktopOnly: true`
- **理由**：
  - 核心功能依赖 Electron `session.webRequest` API，移动端（Capacitor WebView）不可用
  - 移动端 WebView 中 `Referer` 是 forbidden header，JS 层无法设置
  - 移动端无法拦截 Markdown 渲染器自动发起的 `<img>` 请求
  - Service Worker 在 `app://obsidian.md` 协议下无法注册
  - 理论上的 workaround（post-processor + requestUrl 下载转 blob）性能差、兼容性差、可能导致 OOM
  - Obsidian 官方确认移动端绕过 header 限制只能通过 `requestUrl()`，但无法拦截自动图片加载
- **影响**：
  - 移动端用户无法安装此插件
  - 文档中需明确说明仅支持桌面端及原因
  - 未来如果 Obsidian 提供官方请求拦截 API，可重新评估移动端支持
