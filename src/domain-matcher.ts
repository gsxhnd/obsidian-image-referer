/**
 * 域名匹配模块
 *
 * 负责根据用户配置的域名规则，为给定的图片 URL 解析出对应的 Referer 值。
 * 支持精确域名匹配和通配符 (*.) 子域名匹配两种模式。
 */

import type { DomainRule } from "./settings";

/**
 * 根据域名规则列表解析 URL 对应的 Referer 值
 *
 * 匹配顺序：
 *   1. 精确域名匹配 —— 优先匹配完全一致的 hostname
 *   2. 通配符子域名匹配 —— 匹配以 *. 开头的规则（如 *.imgur.com 匹配 i.imgur.com、www.imgur.com）
 *
 * 若未匹配到任何规则，返回空字符串表示不设置 Referer。
 *
 * @param url          - 需要解析的图片 URL
 * @param domainRules  - 用户配置的域名规则列表
 * @returns 匹配到的 Referer 值，未匹配则为空字符串
 */
export function resolveReferer(
	url: string,
	domainRules: DomainRule[],
): string {
	// 解析 URL 提取 hostname，非法 URL 直接返回空
	let hostname: string;
	try {
		hostname = new URL(url).hostname;
	} catch {
		return "";
	}

	// 第一轮：精确域名匹配
	for (const rule of domainRules) {
		if (!rule.domain || !rule.referer) continue;    // 跳过无效规则
		if (rule.enabled === false) continue;            // 跳过已禁用的规则
		if (hostname === rule.domain) return rule.referer;
	}

	// 第二轮：通配符子域名匹配（*.example.com）
	for (const rule of domainRules) {
		if (!rule.domain || !rule.referer) continue;
		if (rule.enabled === false) continue;
		if (!rule.domain.startsWith("*.")) continue;                      // 非通配符规则跳过
		const suffix = rule.domain.slice(1);                              // 去掉 * 得到 .example.com
		if (hostname.endsWith(suffix) || hostname === rule.domain.slice(2)) {
			return rule.referer;
		}
	}

	// 未匹配到任何规则，不设置 Referer
	return "";
}
