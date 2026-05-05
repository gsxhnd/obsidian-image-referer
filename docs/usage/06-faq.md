# 常见问题

## 安装相关

### Q: 插件支持哪些平台？

A: 仅支持 Obsidian 桌面端（Windows、macOS、Linux）。移动端（iOS/Android）不支持，原因是插件依赖 Electron 的网络请求拦截 API，而移动端使用的 Capacitor WebView 不提供此能力。这是技术限制而非优先级问题，目前没有可行的移动端实现方案。

---

### Q: 为什么不支持移动端？

A: 核心原因有三点：
1. 移动端没有 Electron `session.webRequest` API，无法拦截网络请求
2. 在 WebView 环境中，`Referer` 是浏览器的 forbidden header，JavaScript 无法通过 fetch/XHR 设置
3. Obsidian 渲染 Markdown 时自动加载的 `<img>` 图片请求由 WebView 内核发起，插件层面无法 hook

如果未来 Obsidian 提供官方的请求拦截 API，会重新评估移动端支持。

---

### Q: 插件需要联网吗？

A: 插件本身不需要联网。但它的作用是帮助 Obsidian 正确加载远程图片，因此查看远程图片时需要网络连接。插件不会向任何第三方服务发送数据。

---

## 使用相关

### Q: 配置 Referer 后需要重启 Obsidian 吗？

A: 不需要。配置修改后立即生效。但已缓存的图片可能需要关闭并重新打开笔记才能看到效果。

---

### Q: 可以为不同网站配置不同的 Referer 吗？

A: 当前版本（MVP）仅支持全局统一的 Referer 值。按域名配置不同 Referer 的功能计划在后续版本中实现。

---

### Q: 插件会影响本地图片的显示吗？

A: 不会。插件仅拦截 HTTP/HTTPS 远程图片请求，本地图片（`file://` 或 vault 内相对路径）不受影响。

---

### Q: Referer 值应该填什么？

A: 填入图片来源网站的首页 URL。例如：
- 微信公众号图片 → `https://mp.weixin.qq.com`
- 简书图片 → `https://www.jianshu.com`
- CSDN 图片 → `https://blog.csdn.net`

通常就是你在浏览器中查看原始文章时地址栏显示的域名。

---

## 配置相关

### Q: 清空 Referer 配置会怎样？

A: 清空后插件不会注入任何 Referer 头，图片请求恢复 Obsidian 默认行为。

---

### Q: 配置数据存储在哪里？

A: 存储在 `<你的 Vault>/.obsidian/plugins/obsidian-image-referer/data.json` 中，由 Obsidian 自动管理。

---

## 安全相关

### Q: 插件会收集我的数据吗？

A: 不会。插件完全在本地运行，不发送任何遥测数据，不访问任何第三方服务。唯一的网络行为是修改 Obsidian 本身发出的图片请求头。

---

### Q: 设置 Referer 有安全风险吗？

A: Referer 头是标准的 HTTP 请求头，浏览器在正常浏览网页时也会自动发送。设置 Referer 相当于告诉图片服务器"这个请求来自某个网站"，不会暴露你的个人信息或 vault 内容。
