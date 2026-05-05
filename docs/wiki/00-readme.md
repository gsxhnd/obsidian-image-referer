# obsidian-image-referer 代码描述

## 概述

本目录包含 obsidian-image-referer 各模块的代码描述和设计决策文档。每个文档解释对应模块的职责、设计理由、关键类型和注意事项。

## 模块总览

| 编号 | 模块 | 职责 | 文档 |
|:----:|------|------|------|
| 01 | settings | 插件配置管理与设置页面 UI | [01-module-settings.md](./01-module-settings.md) |
| 02 | referer | 请求拦截与 Referer 头注入 | [02-module-referer.md](./02-module-referer.md) |

## 命名规则

- 文件名格式：`{{编号}}-module-{{模块名}}.md`
- 编号按模块依赖层级排序：基础层在前，应用层在后
- 模块名使用小写英文 + 连字符

## 文档维护

- 新增模块时，在本目录下创建对应的文档文件
- 模块重构后，更新对应文档的内容
- 模块删除后，将对应文档标记为已废弃或删除
