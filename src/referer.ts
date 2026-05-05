import type { Plugin } from "obsidian";
import { requestUrl } from "obsidian";

const MAX_CONCURRENT = 6;

let observer: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const processedImgs = new WeakSet<HTMLImageElement>();
const urlCache = new Map<string, string>();
const inflight = new Set<string>();
let activeCount = 0;

function isRemoteUrl(src: string): boolean {
	return src.startsWith("http://") || src.startsWith("https://");
}

function fetchAndSet(img: HTMLImageElement, src: string, referer: string): void {
	inflight.add(src);
	activeCount++;
	requestUrl({ url: src, headers: { Referer: referer } })
		.then(response => {
			const contentType = response.headers["content-type"] ?? "image/png";
			const blob = new Blob([response.arrayBuffer], { type: contentType });
			const blobUrl = URL.createObjectURL(blob);
			urlCache.set(src, blobUrl);
			img.src = blobUrl;
			console.warn("[ImageReferer] Loaded:", src.substring(0, 100));
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
			urlCache.delete(src);
			img.src = src;
			console.warn("[ImageReferer] Failed:", src.substring(0, 100), err);
		})
		.finally(() => {
			inflight.delete(src);
			activeCount--;
		});
}

function interceptImage(img: HTMLImageElement, referer: string): void {
	if (processedImgs.has(img)) return;

	const src = img.src || img.getAttribute("src");
	if (!src || !isRemoteUrl(src)) return;

	processedImgs.add(img);
	console.warn("[ImageReferer] Intercepting:", src.substring(0, 100));

	const cached = urlCache.get(src);
	if (cached) {
		img.src = cached;
		console.warn("[ImageReferer] Cache hit:", src.substring(0, 100));
		return;
	}

	if (inflight.has(src)) {
		processedImgs.delete(img);
		return;
	}

	const fallbackSrc = img.src;
	img.src = "";

	if (activeCount >= MAX_CONCURRENT) {
		processedImgs.delete(img);
		img.src = fallbackSrc;
		return;
	}

	fetchAndSet(img, src, referer);
}

function scanImages(referer: string): void {
	if (!referer) return;
	document.querySelectorAll<HTMLImageElement>(
		"img[src^='http://'], img[src^='https://']"
	).forEach(img => interceptImage(img, referer));
}

export function registerRefererInterceptor(
	_plugin: Plugin,
	getReferer: () => string,
): void {
	console.warn("[ImageReferer] DOM interceptor starting...");

	scanImages(getReferer());

	observer = new MutationObserver(() => {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			scanImages(getReferer());
		}, 150);
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["src"],
	});

	console.warn("[ImageReferer] MutationObserver active");
}

export function unregisterRefererInterceptor(): void {
	if (observer) {
		observer.disconnect();
		observer = null;
	}
	if (debounceTimer) {
		clearTimeout(debounceTimer);
		debounceTimer = null;
	}
	for (const blobUrl of urlCache.values()) {
		URL.revokeObjectURL(blobUrl);
	}
	urlCache.clear();
	inflight.clear();
	console.warn("[ImageReferer] Interceptor stopped, cache cleared");
}
