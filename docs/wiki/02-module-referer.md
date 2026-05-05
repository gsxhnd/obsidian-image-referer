# Referer 模块

> 请求拦截与 Referer 头注入

## 设计决策

### 为什么需要这个模块

Obsidian 加载远程图片时，部分图床会校验 HTTP 请求的 Referer 头。默认情况下 Obsidian（Electron 应用）发出的请求 Referer 为空或为 `app://obsidian.md`，导致这些图片返回 403 或占位图。需要一个模块来拦截请求并注入正确的 Referer。

### 为什么这么设计

- **选择了**：Electron `session.defaultSession.webRequest.onBeforeSendHeaders`
- **而不是**：Monkey-patch fetch/XHR、Service Worker、Markdown post-processor + requestUrl
- **原因**：这是唯一能拦截 `<img>` 标签自动加载请求并修改 headers 的方案。其他方案要么无法覆盖自动图片加载，要么在 Obsidian 的 `app://` 协议下不可用

方案对比：

| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| Electron `session.webRequest.onBeforeSendHeaders` | 官方 API，覆盖所有请求，支持 resourceType 过滤 | 仅桌面端；部分 Electron 版本 Referer 设置有 bug | **采用** |
| Monkey-patch `window.fetch` / `XMLHttpRequest` | 纯 JS，跨平台 | 无法拦截 `<img>` 标签自动加载 | 排除 |
| Service Worker | 标准 Web API | `app://obsidian.md` 协议不支持注册 | 排除 |
| Markdown post-processor + `requestUrl()` | 可跨平台 | 性能差，内存开销大，无法覆盖所有渲染场景 | 排除 |

**已知风险**：Electron 某些版本中通过 `onBeforeSendHeaders` 设置 `Referer` 头可能被 Chromium 网络层丢弃（[electron#33092](https://github.com/electron/electron/issues/33092)）。解决方案是同时设置 `referrerPolicy` 或使用小写 `referer` 作为 header key。需在实际 Obsidian 版本中验证。

## 关键类型与接口

### registerRefererInterceptor

- **定义位置**：`src/referer.ts`（待实现）
- **用途**：通过 Electron `session.webRequest.onBeforeSendHeaders` 注册请求拦截器，在图片请求发出前注入 Referer 头
- **签名**：`function registerRefererInterceptor(plugin: Plugin, getReferer: () => string): void`
- **使用场景**：在 `main.ts` 的 `onload()` 中调用
- **实现要点**：
  - 通过 `require('electron').remote.session` 或 `(window as any).require('electron')` 获取 session
  - 使用 URL filter 限定拦截范围（`http://*/*`, `https://*/*`）
  - 通过 `details.resourceType === 'image'` 过滤仅图片请求
  - 在 callback 中设置 `details.requestHeaders['Referer'] = referer`

### unregisterRefererInterceptor

- **定义位置**：`src/referer.ts`（待实现）
- **用途**：移除拦截器，恢复默认请求行为
- **签名**：`function unregisterRefererInterceptor(): void`
- **使用场景**：在 `main.ts` 的 `onunload()` 中调用，或通过 `plugin.register()` 自动管理

## 模块结构

```text
src/
└── referer.ts    # 请求拦截器注册/注销、Referer 注入逻辑
```

| 文件 | 职责 |
|------|------|
| `referer.ts` | 导出拦截器注册/注销函数，封装底层拦截实现细节 |

## 与其他模块的关系

### 依赖

- **settings**：读取 `referer` 配置值
- **obsidian**：使用 `Plugin` 类型进行生命周期绑定

### 被依赖

- **main**：在 `onload()` 中调用注册函数

### 依赖关系图

```text
settings.ts (提供 referer 值)
    ↑
referer.ts ←── main.ts (注册/注销)
    ↓
Electron session.webRequest API
```

## 注意事项

- 拦截器必须在 `onunload()` 时正确移除，否则会影响其他插件或 Obsidian 本身
- 应使用 `plugin.register()` 或 `plugin.registerEvent()` 确保自动清理
- Referer 值应从回调函数动态获取（`getReferer()`），而非注册时固定，以支持配置热更新
- 需要判断请求类型，仅对图片请求注入 Referer，避免影响其他网络请求
- 空 Referer 配置时应跳过注入，保持默认行为
- 注意 Electron 版本差异：部分版本设置 `Referer` 头可能被 Chromium 丢弃，需验证并可能需要配合 `referrerPolicy` 使用
- 仅支持桌面端（`isDesktopOnly: true`），移动端 Capacitor WebView 无此 API
