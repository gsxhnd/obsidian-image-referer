# 故障排查

## 常见错误

### 配置 Referer 后图片仍无法显示

**可能原因**：

1. 图片 URL 已失效（原始链接被删除）
2. Referer 值不正确（域名不匹配）
3. 图片被浏览器/Obsidian 缓存了旧的失败结果

**解决方案**：

1. 在浏览器中直接访问图片 URL，确认链接有效
2. 检查 Referer 值是否与图片来源网站域名匹配
3. 关闭当前笔记，重新打开以清除缓存
4. 如仍无效，尝试重启 Obsidian

---

### 插件启用后其他功能异常

**可能原因**：拦截器影响了非图片请求

**解决方案**：

1. 临时禁用插件，确认问题是否由本插件引起
2. 如确认是本插件问题，请在 GitHub 提交 Issue

---

### 设置页面中看不到 Image Referer 选项

**可能原因**：

1. 插件未正确安装
2. 插件未启用

**解决方案**：

1. 检查 **Settings → Community plugins** 中是否有 "Image Referer"
2. 确认插件开关已开启
3. 如未出现，检查插件目录中是否有 `main.js` 和 `manifest.json`

---

### 移动端图片仍无法显示

**说明**：本插件仅支持桌面端。移动端（iOS/Android）因技术限制无法实现 Referer 注入（Capacitor WebView 不提供请求拦截 API，且 Referer 是 forbidden header）。移动端用户需要寻找其他解决方案，如将图片下载到本地 vault 中。

## 调试方式

打开 Obsidian 开发者工具查看网络请求：

1. 按 `Ctrl+Shift+I`（Windows/Linux）或 `Cmd+Option+I`（macOS）打开开发者工具
2. 切换到 **Network** 标签
3. 刷新笔记页面，观察图片请求的 Request Headers 中是否包含正确的 Referer

## 获取帮助

如果以上方法无法解决你的问题：

1. 查看 [常见问题](./06-faq.md)
2. 搜索 [已有 Issue](https://github.com/gsxhnd/obsidian-image-referer/issues)
3. 提交新 Issue，请附带以下信息：
   - 操作系统和版本
   - Obsidian 版本
   - 插件版本
   - 图片 URL（脱敏后）
   - 配置的 Referer 值
   - 开发者工具中的网络请求截图
