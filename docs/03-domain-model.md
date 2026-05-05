# 领域模型

## 概述

本文档定义 obsidian-image-referer 的核心领域类型、接口和数据流。

## 核心类型

### ImageRefererSettings

插件的配置数据结构。

- **用途**：存储用户配置的 Referer 值
- **字段**：
  - `referer`: `string` — 用户自定义的 Referer 值，注入到图片请求头中

### DEFAULT_SETTINGS

默认配置常量。

- **用途**：插件首次加载或配置丢失时的回退值
- **值**：`{ referer: "" }` — 空字符串表示不注入 Referer

## 核心接口

### ImageRefererPlugin (extends Plugin)

插件主类，管理生命周期。

- **职责**：初始化配置、注册设置页、启动/停止请求拦截
- **方法**：
  - `onload(): Promise<void>` — 插件加载入口
  - `onunload(): void` — 插件卸载清理
  - `loadSettings(): Promise<void>` — 从磁盘加载配置
  - `saveSettings(): Promise<void>` — 持久化配置到磁盘

### ImageRefererSettingTab (extends PluginSettingTab)

设置页面 UI 组件。

- **职责**：渲染设置界面、处理用户输入、触发配置保存
- **方法**：
  - `display(): void` — 渲染设置页面内容

### 请求拦截器

负责拦截和修改图片请求。

- **职责**：监听网络请求、判断是否为图片请求、注入 Referer 头
- **关键逻辑**：
  - `registerRefererInterceptor(plugin, settings)` — 注册拦截器
  - 拦截器在请求发出前修改 headers

## 数据流

```text
用户配置 Referer 值
       │
       ▼
┌──────────────┐     saveData()     ┌──────────────┐
│  Setting Tab │ ──────────────────→ │  data.json   │
│  (UI 输入)   │                     │  (磁盘持久化) │
└──────────────┘                     └──────────────┘
       │                                    │
       │ settings.referer                   │ loadData()
       ▼                                    ▼
┌──────────────┐                     ┌──────────────┐
│   Referer    │ ←─── 读取配置 ────── │    Plugin    │
│  Interceptor │                     │   (main.ts)  │
└──────────────┘                     └──────────────┘
       │
       │ 修改请求头
       ▼
┌──────────────┐
│  HTTP 请求   │ → 携带 Referer → 远程图片服务器
│  (图片加载)  │
└──────────────┘
```

## 状态管理

- 插件状态通过 `this.settings` 对象在内存中维护
- 配置变更时立即写入磁盘（`saveData()`）
- 拦截器始终读取最新的 `settings.referer` 值，配置变更即时生效
- 无需额外的状态机或事件总线
