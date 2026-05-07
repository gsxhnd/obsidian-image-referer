/**
 * DOM 图片拦截与 Referer 注入模块
 *
 * 这是插件的核心运行时模块。通过 MutationObserver 监听页面 DOM 变化，
 * 自动发现所有 src 指向外部 URL 的 <img> 元素，并对其执行以下操作：
 *
 *   1. 根据域名规则查找该 URL 对应的 Referer 值
 *   2. 使用 `requestUrl` 附带自定义 Referer 重新请求图片
 *   3. 将响应数据转为 Blob URL 替换原图 src，绕过浏览器的原生 Referer 限制
 *
 * 设计要点：
 *   - 使用 WeakSet 跟踪已处理的 <img> 元素，避免重复处理
 *   - 使用 Map 缓存 Blob URL，相同 URL 的图片直接复用
 *   - 最大并发请求数限制为 6，避免资源过度占用
 *   - 支持诊断模式，在加载失败时通过 Notice 提示用户
 */

import type { Plugin } from "obsidian";
import { requestUrl, Notice } from "obsidian";

/** 最大并发图片请求数 */
const MAX_CONCURRENT = 6;

/**
 * 以下为模块级状态变量（非导出，模块内部使用）
 */
let observer: MutationObserver | null = null;           // DOM 变化观察器
let debounceTimer: ReturnType<typeof setTimeout> | null = null;  // 防抖定时器
const processedImgs = new WeakSet<HTMLImageElement>();   // 已处理的 img 元素（避免重复处理）
const urlCache = new Map<string, string>();              // 原始 URL → Blob URL 的缓存
const inflight = new Set<string>();                      // 正在请求中的 URL 集合
let activeCount = 0;                                     // 当前活跃的请求数
let getRefererForUrl: ((url: string) => string) | null = null;  // 外部注入的域名解析函数
let diagnosticMode = false;                              // 诊断模式开关
let lastDiagnosticNotice = 0;                            // 上次诊断通知的时间戳（用于节流）

/**
 * 判断 URL 是否为远程 HTTP(S) 地址
 */
function isRemoteUrl(src: string): boolean {
	return src.startsWith("http://") || src.startsWith("https://");
}

/**
 * 使用自定义 Referer 请求图片，并将响应数据转为 Blob URL 设置到 <img> 上
 *
 * 流程：
 *   1. 调用 Obsidian 的 `requestUrl` API，附带自定义 Referer 头
 *   2. 将响应 ArrayBuffer 包装为 Blob（保留原始 content-type）
 *   3. 通过 `URL.createObjectURL` 创建 Blob URL
 *   4. 将 Blob URL 设置到当前 img 及其他相同 src 的 img 上
 *
 * @param img     - 目标 <img> 元素
 * @param src     - 原始图片 URL
 * @param referer - 要设置的 Referer 值
 */
function fetchAndSet(img: HTMLImageElement, src: string, referer: string): void {
	inflight.add(src);
	activeCount++;

	requestUrl({ url: src, headers: { Referer: referer } })
		.then(response => {
			// 获取响应的 content-type，默认使用 image/png
			const contentType = response.headers["content-type"] ?? "image/png";
			const blob = new Blob([response.arrayBuffer], { type: contentType });
			const blobUrl = URL.createObjectURL(blob);

			urlCache.set(src, blobUrl);
			img.src = blobUrl;

			console.warn("[ImageReferer] Loaded:", src.substring(0, 100));

			// 同步更新页面上所有使用相同 src 的 <img> 元素
			document.querySelectorAll<HTMLImageElement>("img[src^='http://'], img[src^='https://']")
				.forEach(other => {
					const otherSrc = other.src || other.getAttribute("src");
					if (otherSrc === src) {
						other.src = blobUrl;
						processedImgs.add(other);
					}
				});
		})
		.catch(err => {
			// 加载失败时清除缓存，恢复原始 src
			urlCache.delete(src);
			img.src = src;

			console.warn("[ImageReferer] Failed:", src.substring(0, 100), err);

			// 诊断模式：每 3 秒最多弹一次 Notice，避免刷屏
			if (diagnosticMode) {
				const now = Date.now();
				if (now - lastDiagnosticNotice > 3000) {
					lastDiagnosticNotice = now;
					let hostname = src;
					try { hostname = new URL(src).hostname; } catch { /* keep src */ }
					new Notice(`[ImageReferer] Failed: ${hostname} (referer: ${referer || "none"})`);
				}
			}
		})
		.finally(() => {
			inflight.delete(src);
			activeCount--;
		});
}

/**
 * 拦截并处理单个 <img> 元素
 *
 * 决策流程：
 *   1. 已处理过 → 跳过
 *   2. 非远程 URL → 跳过
 *   3. 无可用的 Referer 规则 → 跳过（不处理）
 *   4. 有缓存 → 直接替换为 Blob URL
 *   5. 已在请求队列中 → 跳过（等待完成后自动更新）
 *   6. 并发数已达上限 → 跳过，保留原始 src
 *   7. 满足条件 → 发起附带自定义 Referer 的请求
 *
 * @param img - 目标 <img> 元素
 */
function interceptImage(img: HTMLImageElement): void {
	// 已处理过的图片不再重复处理
	if (processedImgs.has(img)) return;

	const src = img.src || img.getAttribute("src");
	if (!src || !isRemoteUrl(src)) return;

	processedImgs.add(img);

	// 查找 Referer 规则，无匹配则跳过
	const referer = getRefererForUrl ? getRefererForUrl(src) : "";
	if (!referer) return;

	// 命中缓存，直接替换为 Blob URL
	const cached = urlCache.get(src);
	if (cached) {
		img.src = cached;
		return;
	}

	// 同一 URL 已在请求中，等待即可
	if (inflight.has(src)) {
		processedImgs.delete(img);
		return;
	}

	// 保存原始 src 作为 fallback，先清空防止闪烁
	const fallbackSrc = img.src;
	img.src = "";

	// 超出并发上限，放弃本次拦截，保留原始 src
	if (activeCount >= MAX_CONCURRENT) {
		processedImgs.delete(img);
		img.src = fallbackSrc;
		return;
	}

	// 发起带 Referer 的请求
	fetchAndSet(img, src, referer);
}

/**
 * 扫描页面中所有外部图片并尝试拦截处理
 *
 * 通过 CSS 属性选择器匹配 src 以 http:// 或 https:// 开头的 <img> 元素。
 */
function scanImages(): void {
	document.querySelectorAll<HTMLImageElement>(
		"img[src^='http://'], img[src^='https://']"
	).forEach(img => interceptImage(img));
}

/**
 * 注册 DOM 拦截器（由 main.ts 在 onload 中调用）
 *
 * 主要工作：
 *   1. 保存域名解析函数和诊断模式配置
 *   2. 立即扫描当前页面中已有的外部图片
 *   3. 创建 MutationObserver 监听 DOM 变化（新增元素、src 属性变化）
 *   4. 使用 150ms 防抖合并密集的 DOM 变更
 *
 * @param _plugin        - 插件实例
 * @param _resolveReferer - 域名 → Referer 的解析函数
 * @param _diagnosticMode - 是否启用诊断模式
 */
export function registerRefererInterceptor(
	_plugin: Plugin,
	_resolveReferer: (url: string) => string,
	_diagnosticMode: boolean,
): void {
	console.warn("[ImageReferer] DOM interceptor starting...");
	getRefererForUrl = _resolveReferer;
	diagnosticMode = _diagnosticMode;

	// 处理已有图片
	scanImages();

	// 监听 DOM 变化，处理后续动态加载的图片
	observer = new MutationObserver(() => {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			scanImages();
		}, 150);
	});

	observer.observe(document.body, {
		childList: true,    // 监听从 body 下新增或移除子节点
		subtree: true,      // 递归监听所有后代节点
		attributes: true,   // 监听属性变化
		attributeFilter: ["src"],  // 只关注 src 属性的变化
	});

	console.warn("[ImageReferer] MutationObserver active");
}

/**
 * 注销 DOM 拦截器并清理所有资源（由 main.ts 在 onunload 中调用）
 *
 * 清理项：
 *   - 断开 MutationObserver
 *   - 清除防抖定时器
 *   - 重置模块级状态变量
 *   - 释放所有 Blob URL（避免内存泄漏）
 *   - 清空缓存和请求队列
 */
export function unregisterRefererInterceptor(): void {
	getRefererForUrl = null;

	if (observer) {
		observer.disconnect();
		observer = null;
	}

	if (debounceTimer) {
		clearTimeout(debounceTimer);
		debounceTimer = null;
	}

	diagnosticMode = false;
	lastDiagnosticNotice = 0;

	// 释放所有已创建的 Blob URL，防止内存泄漏
	for (const blobUrl of urlCache.values()) {
		URL.revokeObjectURL(blobUrl);
	}
	urlCache.clear();
	inflight.clear();

	console.warn("[ImageReferer] Interceptor stopped, cache cleared");
}
