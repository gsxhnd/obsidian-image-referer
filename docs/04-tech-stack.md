# 技术栈

## 语言与运行时

- **语言**：TypeScript 5.8+
- **运行时**：Electron（Obsidian 桌面端内嵌）
- **目标**：ES2018（esbuild target）

## 核心依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| obsidian | latest | Obsidian 插件 API 类型定义与运行时接口 |
| tslib | 2.4.0 | TypeScript 辅助函数库 |

## 开发依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| typescript | ^5.8.3 | TypeScript 编译器（类型检查） |
| esbuild | 0.25.5 | 打包构建工具 |
| @types/node | ^16.11.6 | Node.js 类型定义 |
| eslint-plugin-obsidianmd | 0.1.9 | Obsidian 插件专用 ESLint 规则 |
| typescript-eslint | 8.35.1 | TypeScript ESLint 解析器与规则 |

## 构建工具

- **包管理器**：npm
- **构建命令**：`npm run build`（tsc 类型检查 + esbuild 打包）
- **开发命令**：`npm run dev`（esbuild watch 模式）
- **Lint 命令**：`npm run lint`

## 代码规范

- **格式化工具**：EditorConfig（`.editorconfig`）
- **Lint 工具**：ESLint + typescript-eslint + eslint-plugin-obsidianmd
- **TypeScript 配置**：strict 模式相关选项已启用（`noImplicitAny`, `strictNullChecks`, `strictBindCallApply`）

## 开发环境搭建

### 前置条件

- Node.js 18+ (LTS)
- npm
- Obsidian 桌面客户端（用于测试）

### 步骤

1. 克隆仓库：`git clone <仓库地址>`
2. 安装依赖：`npm install`
3. 开发模式：`npm run dev`
4. 将产物复制到 Obsidian vault 的插件目录进行测试

## 常用命令

```bash
# 安装依赖
npm install

# 开发模式（watch）
npm run dev

# 生产构建
npm run build

# Lint 检查
npm run lint
```

## 项目结构

```text
obsidian-image-referer/
├── src/
│   ├── main.ts           # 插件入口，生命周期管理
│   ├── settings.ts       # 设置接口、默认值、设置页面
│   └── referer.ts        # 请求拦截与 Referer 注入（待实现）
├── docs/                  # 项目文档
├── manifest.json          # Obsidian 插件清单
├── package.json           # npm 配置
├── tsconfig.json          # TypeScript 配置
├── esbuild.config.mjs     # esbuild 构建配置
├── eslint.config.mts      # ESLint 配置
├── styles.css             # 插件样式（如需要）
├── versions.json          # 版本兼容性映射
└── version-bump.mjs       # 版本号更新脚本
```
