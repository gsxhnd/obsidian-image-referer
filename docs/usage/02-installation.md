# 安装指南

## 系统要求

| 项目 | 要求 |
|------|------|
| 操作系统 | Windows / macOS / Linux |
| Obsidian 版本 | ≥ 0.15.0 |
| 网络 | 需要网络连接（用于加载远程图片） |

## 安装方式

### 方式一：通过 Obsidian 社区插件市场（推荐）

1. 打开 Obsidian，进入 **Settings → Community plugins**
2. 点击 **Browse**，搜索 "Image Referer"
3. 点击 **Install**，然后点击 **Enable**

### 方式二：手动安装

1. 从 [GitHub Releases](https://github.com/gsxhnd/obsidian-image-referer/releases) 下载最新版本的以下文件：
   - `main.js`
   - `manifest.json`
   - `styles.css`（如果有）

2. 在你的 Obsidian vault 中创建插件目录：
   ```
   <你的 Vault>/.obsidian/plugins/obsidian-image-referer/
   ```

3. 将下载的文件复制到该目录

4. 重启 Obsidian 或重新加载插件列表

5. 进入 **Settings → Community plugins**，找到 "Image Referer" 并启用

### 方式三：从源码构建

```bash
git clone https://github.com/gsxhnd/obsidian-image-referer.git
cd obsidian-image-referer
npm install
npm run build
```

将生成的 `main.js` 和 `manifest.json` 复制到 vault 的插件目录。

## 安装验证

1. 打开 **Settings → Community plugins**
2. 确认 "Image Referer" 出现在已安装插件列表中
3. 确认插件状态为已启用（开关为开启状态）

## 下一步

安装完成后，请阅读 [配置说明](./03-configuration.md) 进行 Referer 配置。
