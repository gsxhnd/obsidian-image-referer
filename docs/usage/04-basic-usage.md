# 基础使用

> obsidian-image-referer 核心功能的使用方法

## 场景：查看需要 Referer 的远程图片

### 问题现象

在 Obsidian 笔记中引用了远程图片（如从微信公众号复制的文章），图片显示为空白、破损图标或 403 错误页。

### 解决步骤

1. **确认图片 URL 来源**：右键图片（或查看 Markdown 源码），确认图片 URL 的域名
2. **配置对应的 Referer**：
   - 打开 **Settings → Community plugins → Image Referer**
   - 在 Referer 输入框中填入图片来源网站的 URL
   - 例如微信公众号图片，填入 `https://mp.weixin.qq.com`
3. **验证效果**：返回笔记，图片应能正常显示

### 注意事项

- 如果图片仍无法显示，尝试关闭并重新打开当前笔记（清除缓存）
- 当前版本使用全局 Referer，如果笔记中有来自不同平台的图片，需要设置为最常用的那个来源

## 场景：从其他平台迁移笔记

### 操作流程

1. 将笔记内容（含图片链接）导入 Obsidian
2. 打开笔记，观察哪些图片无法显示
3. 确认图片来源平台
4. 在插件设置中配置对应的 Referer
5. 重新打开笔记验证

## 场景：临时禁用 Referer 注入

如果某些场景下不需要 Referer 注入：

- **方式一**：将设置中的 Referer 值清空
- **方式二**：在 **Settings → Community plugins** 中临时禁用插件

## 下一步

- 遇到问题 → [故障排查](./05-troubleshooting.md)
- 有疑问 → [常见问题](./06-faq.md)
