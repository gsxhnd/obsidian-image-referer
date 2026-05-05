# Image Referer

[![GitHub release](https://img.shields.io/github/v/release/gsxhnd/obsidian-image-referer)](https://github.com/gsxhnd/obsidian-image-referer/releases)

Automatically inject a custom Referer header into remote image requests in Obsidian, solving image loading issues caused by referer-checking image hosts.

## The Problem

Many image hosts (WeChat Official Accounts, Jianshu, CSDN, etc.) validate the HTTP Referer header. Obsidian, as a local application, sends requests with no Referer or `app://obsidian.md`, causing these images to return 403 or appear blank.

This plugin intercepts image requests and injects your specified Referer, making images load correctly.

## Quick Start

1. Install and enable the plugin
2. Go to **Settings → Community plugins → Image Referer**
3. Enter a Referer value (e.g. `https://mp.weixin.qq.com`)
4. Open your notes — remote images will now load properly

## Installation

### Via Community Plugin Browser

1. **Settings → Community plugins → Browse**
2. Search for "Image Referer"
3. Click Install, then Enable

### Manual Installation

Download `main.js` and `manifest.json` from [Releases](https://github.com/gsxhnd/obsidian-image-referer/releases), place them in `<vault>/.obsidian/plugins/obsidian-image-referer/`, then enable.

### Build From Source

```bash
git clone https://github.com/gsxhnd/obsidian-image-referer.git
cd obsidian-image-referer
npm install
npm run build
```

Copy the generated `main.js` and `manifest.json` to your vault's plugin directory.

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Referer | string | empty | The Referer value injected into image request headers |

**Common Referer values**:

| Source | Recommended Value |
|--------|-------------------|
| WeChat Official Accounts | `https://mp.weixin.qq.com` |
| Jianshu | `https://www.jianshu.com` |
| CSDN | `https://blog.csdn.net` |
| Zhihu | `https://www.zhihu.com` |

- Leave empty to disable injection
- Changes take effect immediately

## FAQ

**Images still not loading after configuration?**
Verify the image URL is valid (open it directly in a browser), ensure the Referer value matches the image host domain, and try reopening the note to clear the cache.

**Does it support mobile?**
No. Mobile (iOS/Android) uses Capacitor WebView, which cannot intercept automatic image requests — a technical limitation.

**Does it affect local images?**
No. Only `http://` / `https://` remote images are intercepted.

**Can I set different Referer values for different domains?**
The current version uses a single global value. Per-domain rules are planned for a future release.

## Debugging

Open Developer Tools (`Cmd+Option+I` / `Ctrl+Shift+I`) and look for `[ImageReferer]` prefixed logs in the console.

## Development

```bash
npm install      # Install dependencies
npm run dev      # Dev mode (watch)
npm run build    # Production build
npm run lint     # Lint
```

## License

MIT
