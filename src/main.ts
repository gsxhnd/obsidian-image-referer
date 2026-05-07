import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, ImageRefererSettings, ImageRefererSettingTab } from "./settings";
import { registerRefererInterceptor, unregisterRefererInterceptor } from "./referer";
import { resolveReferer } from "./domain-matcher";

export default class ImageRefererPlugin extends Plugin {
	settings: ImageRefererSettings;

	async onload() {
		console.debug("[ImageReferer] Plugin loading...");
		await this.loadSettings();
		console.debug("[ImageReferer] Settings loaded:", this.settings);

		this.addSettingTab(new ImageRefererSettingTab(this.app, this));
		console.debug("[ImageReferer] Settings tab registered");

		registerRefererInterceptor(this, (url: string) => {
			return resolveReferer(url, this.settings.domainRules);
		}, this.settings.diagnosticMode);
		console.debug("[ImageReferer] Plugin loaded");
	}

	onunload() {
		console.debug("[ImageReferer] Plugin unloading...");
		unregisterRefererInterceptor();
		console.debug("[ImageReferer] Plugin unloaded");
	}

	async loadSettings() {
		const data: unknown = await this.loadData();
		console.debug("[ImageReferer] loadData from disk:", data);
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data as Partial<ImageRefererSettings>);
		for (const rule of this.settings.domainRules) {
			if (rule.enabled === undefined) {
				rule.enabled = true;
			}
		}
	}

	async saveSettings() {
		console.debug("[ImageReferer] saveData to disk:", this.settings);
		await this.saveData(this.settings);
	}
}
