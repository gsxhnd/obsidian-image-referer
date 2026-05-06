import type { DomainRule } from "./settings";

export function resolveReferer(
	url: string,
	domainRules: DomainRule[],
	globalReferer: string,
): string {
	let hostname: string;
	try {
		hostname = new URL(url).hostname;
	} catch {
		return globalReferer;
	}

	for (const rule of domainRules) {
		if (!rule.domain || !rule.referer) continue;
		if (hostname === rule.domain) return rule.referer;
	}

	for (const rule of domainRules) {
		if (!rule.domain || !rule.referer) continue;
		if (!rule.domain.startsWith("*.")) continue;
		const suffix = rule.domain.slice(1);
		if (hostname.endsWith(suffix) || hostname === rule.domain.slice(2)) {
			return rule.referer;
		}
	}

	return globalReferer;
}
