# Image Referer

[![GitHub release](https://img.shields.io/github/v/release/gsxhnd/obsidian-image-referer)](https://github.com/gsxhnd/obsidian-image-referer/releases)

为 Obsidian 的远程图片请求自动注入自定义 Referer 头，解决部分图床因 Referer 校验导致图片无法显示的问题。

## 解决的问题

许多图床（微信公众号、简书、CSDN 等）会校验 HTTP 请求的 Referer 头。Obsidian 作为本地应用，加载远程图片时不携带 Referer 或携带 `app://obsidian.md`，导致图片返回 403 或空白。

本插件拦截图片请求并注入你指定的 Referer，让图片正常显示。

## 快速开始

1. 安装并启用插件
2. 进入 **Settings → Community plugins → Image Referer**
3. 在 Referer 输入框填入目标值（如 `https://mp.weixin.qq.com`）
4. 打开笔记，远程图片即可正常加载

## 安装

### 通过社区插件市场

1. **Settings → Community plugins → Browse**
2. 搜索 "Image Referer"
3. 点击 Install，然后 Enable

### 手动安装

从 [Releases](https://github.com/gsxhnd/obsidian-image-referer/releases) 下载 `main.js`、`manifest.json`，放入 `<vault>/.obsidian/plugins/obsidian-image-referer/` 后启用。

### 从源码构建

```bash
git clone https://github.com/gsxhnd/obsidian-image-referer.git
cd obsidian-image-referer
npm install
npm run build
```

将生成的 `main.js` 和 `manifest.json` 复制到 vault 插件目录。

## 配置

| 配置项 | 类型 | 默认 | 说明 |
|--------|------|------|------|
| Referer | string | 空 | 注入到图片请求头的 Referer 值 |

**常用 Referer 值**：

| 来源 | 推荐值 |
|------|--------|
| 微信公众号 | `https://mp.weixin.qq.com` |
| 简书 | `https://www.jianshu.com` |
| CSDN | `https://blog.csdn.net` |
| 知乎 | `https://www.zhihu.com` |

- 留空表示不注入，保持默认行为
- 配置修改后立即生效

## 常见问题

**配置后图片仍无法显示？**
检查图片 URL 是否有效（在浏览器中直接访问），确认 Referer 值与图片域名匹配，尝试关闭笔记重新打开以清除缓存。

**支持移动端吗？**
不支持。移动端 Capacitor WebView 无法拦截自动图片请求，这是技术限制。

**会影响本地图片吗？**
不会。仅处理 `http://` / `https://` 远程图片。

**支持多域名不同 Referer？**
当前版本为全局统一配置，多域名规则计划在后续版本实现。

## 调试

打开开发者工具（`Cmd+Option+I` / `Ctrl+Shift+I`），观察控制台中 `[ImageReferer]` 前缀的日志。

## 开发

```bash
npm install      # 安装依赖
npm run dev      # 开发模式（watch）
npm run build    # 生产构建
npm run lint     # 代码检查
```

## 许可

MIT
