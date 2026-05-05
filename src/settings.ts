import { App, PluginSettingTab, Setting } from "obsidian";
import type ImageRefererPlugin from "./main";

export interface ImageRefererSettings {
	referer: string;
}

export const DEFAULT_SETTINGS: ImageRefererSettings = {
	referer: "",
};

export class ImageRefererSettingTab extends PluginSettingTab {
	plugin: ImageRefererPlugin;

	constructor(app: App, plugin: ImageRefererPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Referer")
			.setDesc("Custom referer header value for image requests. Leave empty to disable.")
			.addText(text => text
				.setPlaceholder("https://example.com")
				.setValue(this.plugin.settings.referer)
				.onChange(async (value) => {
					console.debug("[ImageReferer] Setting changed — referer:", value);
					this.plugin.settings.referer = value;
					await this.plugin.saveSettings();
				}));
	}
}
