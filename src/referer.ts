import type { Plugin } from "obsidian";
import { requestUrl, Notice } from "obsidian";

const MAX_CONCURRENT = 6;

let observer: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const processedImgs = new WeakSet<HTMLImageElement>();
const urlCache = new Map<string, string>();
const inflight = new Set<string>();
let activeCount = 0;
let getRefererForUrl: ((url: string) => string) | null = null;
let diagnosticMode = false;
let lastDiagnosticNotice = 0;

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

function interceptImage(img: HTMLImageElement): void {
	if (processedImgs.has(img)) return;

	const src = img.src || img.getAttribute("src");
	if (!src || !isRemoteUrl(src)) return;

	processedImgs.add(img);

	const referer = getRefererForUrl ? getRefererForUrl(src) : "";
	if (!referer) return;

	const cached = urlCache.get(src);
	if (cached) {
		img.src = cached;
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

function scanImages(): void {
	document.querySelectorAll<HTMLImageElement>(
		"img[src^='http://'], img[src^='https://']"
	).forEach(img => interceptImage(img));
}

export function registerRefererInterceptor(
	_plugin: Plugin,
	_resolveReferer: (url: string) => string,
	_diagnosticMode: boolean,
): void {
	console.warn("[ImageReferer] DOM interceptor starting...");
	getRefererForUrl = _resolveReferer;
	diagnosticMode = _diagnosticMode;

	scanImages();

	observer = new MutationObserver(() => {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			scanImages();
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
	for (const blobUrl of urlCache.values()) {
		URL.revokeObjectURL(blobUrl);
	}
	urlCache.clear();
	inflight.clear();
	console.warn("[ImageReferer] Interceptor stopped, cache cleared");
}
