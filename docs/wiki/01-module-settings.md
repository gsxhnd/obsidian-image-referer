# Settings 模块

> 插件配置管理与设置页面 UI

## 设计决策

### 为什么需要这个模块

插件需要让用户自定义 Referer 值，因此需要：
1. 定义配置数据结构
2. 提供设置页面让用户输入和修改配置
3. 持久化配置到磁盘

### 为什么这么设计

- **选择了**：使用 Obsidian 内置的 `PluginSettingTab` + `Setting` 组件
- **而不是**：自定义 Modal 或独立配置文件
- **原因**：遵循 Obsidian 插件规范，用户在统一的设置入口管理所有插件配置，体验一致

## 关键类型与接口

### ImageRefererSettings

- **定义位置**：`src/settings.ts`
- **用途**：定义插件配置的数据结构
- **字段**：
  - `referer: string` — 用户自定义的 Referer 值

### DEFAULT_SETTINGS

- **定义位置**：`src/settings.ts`
- **用途**：提供配置默认值，首次加载或数据丢失时使用
- **值**：`{ referer: "" }`

### ImageRefererSettingTab

- **定义位置**：`src/settings.ts`
- **用途**：Obsidian 设置页面组件，渲染 Referer 配置输入框
- **继承**：`PluginSettingTab`
- **使用场景**：在 `main.ts` 的 `onload()` 中通过 `this.addSettingTab()` 注册

## 模块结构

```text
src/
└── settings.ts    # 配置接口、默认值、设置页面组件
```

| 文件 | 职责 |
|------|------|
| `settings.ts` | 导出 `ImageRefererSettings` 接口、`DEFAULT_SETTINGS` 常量、`ImageRefererSettingTab` 类 |

## 与其他模块的关系

### 依赖

- **obsidian**：使用 `PluginSettingTab`、`Setting`、`App` 等 API

### 被依赖

- **main**：导入设置接口和设置页面类
- **referer**：读取 `settings.referer` 值用于注入

### 依赖关系图

```text
obsidian API
    ↑
settings.ts ←── main.ts
    ↑
    └──────── referer.ts (读取配置值)
```

## 注意事项

- 配置变更后需立即调用 `saveData()` 持久化，避免数据丢失
- `DEFAULT_SETTINGS` 中 `referer` 默认为空字符串，表示不注入任何 Referer
- 设置页面的 `display()` 方法每次打开设置时都会重新调用，需先 `containerEl.empty()` 清空旧内容
