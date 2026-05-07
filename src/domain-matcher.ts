import type { DomainRule } from "./settings";

export function resolveReferer(
	url: string,
	domainRules: DomainRule[],
): string {
	let hostname: string;
	try {
		hostname = new URL(url).hostname;
	} catch {
		return "";
	}

	for (const rule of domainRules) {
		if (!rule.domain || !rule.referer) continue;
		if (rule.enabled === false) continue;
		if (hostname === rule.domain) return rule.referer;
	}

	for (const rule of domainRules) {
		if (!rule.domain || !rule.referer) continue;
		if (rule.enabled === false) continue;
		if (!rule.domain.startsWith("*.")) continue;
		const suffix = rule.domain.slice(1);
		if (hostname.endsWith(suffix) || hostname === rule.domain.slice(2)) {
			return rule.referer;
		}
	}

	return "";
}
