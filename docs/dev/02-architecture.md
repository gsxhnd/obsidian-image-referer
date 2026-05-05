# 系统架构

## 架构概述

obsidian-image-referer 采用简单的分层架构，作为 Obsidian 插件运行在 Electron 环境中。插件通过 Electron 的协议拦截或 Obsidian 提供的 API 来修改图片请求的 Referer 头。

## 分层设计

```text
┌─────────────────────────────────────────┐
│           Obsidian Application          │
├─────────────────────────────────────────┤
│  Plugin Entry (main.ts)                 │  ← 插件生命周期管理
│    ├── Settings Module (settings.ts)    │  ← 配置管理与设置 UI
│    └── Referer Module (referer.ts)      │  ← 请求拦截与 Referer 注入
├─────────────────────────────────────────┤
│           Electron / Chromium           │  ← 底层网络请求层
└─────────────────────────────────────────┘
```

## 模块职责

| 模块 | 职责 | 关键文件 |
|------|------|----------|
| Plugin Entry | 插件生命周期（onload/onunload）、注册设置页、初始化拦截器 | `src/main.ts` |
| Settings | 定义设置接口、默认值、设置页面 UI、数据持久化 | `src/settings.ts` |
| Referer | 拦截图片 HTTP 请求、注入 Referer 头、管理拦截器生命周期 | `src/referer.ts` |

## 依赖关系

```text
settings (配置层，无内部依赖)
  ↑
  ├── referer (依赖 settings 获取 Referer 值)
  ↑
  └── main (顶层，依赖 settings + referer，管理生命周期)
```

**依赖规则**：

- `settings` 是基础层，不依赖其他内部模块
- `referer` 依赖 `settings` 获取配置值
- `main` 是胶水层，组装所有模块并管理生命周期
- 严格禁止循环依赖

## 运行时模型

- 插件在 Obsidian 启动时通过 `onload()` 初始化
- 拦截器在 `onload()` 中注册，监听所有图片类型的网络请求
- 当检测到图片请求时，同步修改请求头添加 Referer
- 插件卸载时通过 `onunload()` 移除拦截器，恢复默认行为

## 错误处理策略

- 拦截器注册失败时，在控制台输出警告，插件降级为无操作模式
- 设置加载失败时，使用默认值（空 Referer，即不注入）
- 不向用户弹出错误通知，除非是关键配置问题
