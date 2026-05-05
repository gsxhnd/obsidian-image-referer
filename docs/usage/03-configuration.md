# 配置说明

## 配置入口

**Settings → Community plugins → Image Referer**

插件的所有配置都在 Obsidian 设置页面中完成，无需手动编辑配置文件。

## 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| Referer | 字符串 | 空 | 自定义的 Referer 值，将注入到图片请求头中 |

## 配置说明

### Referer

填入你希望图片请求携带的 Referer URL。

**常见值示例**：

| 图片来源 | 推荐 Referer 值 |
|----------|-----------------|
| 微信公众号 | `https://mp.weixin.qq.com` |
| 简书 | `https://www.jianshu.com` |
| CSDN | `https://blog.csdn.net` |
| 知乎 | `https://www.zhihu.com` |

**注意**：

- 留空表示不注入 Referer，保持默认行为
- Referer 值应为完整的 URL 格式（包含 `https://`）
- 当前版本为全局配置，所有图片请求使用同一个 Referer 值

## 配置生效

配置修改后立即生效，无需重启 Obsidian 或重新加载插件。已缓存的图片可能需要关闭并重新打开笔记才能看到效果。

## 数据存储

配置数据存储在：
```
<你的 Vault>/.obsidian/plugins/obsidian-image-referer/data.json
```

该文件由 Obsidian 自动管理，通常不需要手动编辑。

## 下一步

配置完成后，请阅读 [基础使用](./04-basic-usage.md) 了解日常使用方法。
