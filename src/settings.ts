import { App, PluginSettingTab, Setting } from "obsidian";
import type ImageRefererPlugin from "./main";

export interface DomainRule {
	domain: string;
	referer: string;
}

export interface ImageRefererSettings {
	referer: string;
	domainRules: DomainRule[];
}

export const DEFAULT_SETTINGS: ImageRefererSettings = {
	referer: "",
	domainRules: [],
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
			.setName("Default Referer")
			.setDesc("Fallback referer value for images that don't match any domain rule.")
			.addText(text => text
				.setPlaceholder("https://example.com")
				.setValue(this.plugin.settings.referer)
				.onChange(async (value) => {
					this.plugin.settings.referer = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl("h3", { text: "Domain rules" });
		containerEl.createEl("p", {
			text: "Configure per-domain referer values. Rules support exact match (e.g. i.imgur.com) or wildcard match (e.g. *.imgur.com).",
			cls: "setting-item-description",
		});

		const rulesContainer = containerEl.createDiv({ cls: "image-referer-rules" });

		const renderRules = () => {
			rulesContainer.empty();

			this.plugin.settings.domainRules.forEach((rule, index) => {
				const ruleEl = rulesContainer.createDiv({ cls: "image-referer-rule" });

				new Setting(ruleEl)
					.setName(`Rule ${index + 1}`)
					.addText(text => text
						.setPlaceholder("Domain (e.g. i.imgur.com or *.imgur.com)")
						.setValue(rule.domain)
						.onChange(async (value) => {
							rule.domain = value;
							await this.plugin.saveSettings();
						}))
					.addText(text => text
						.setPlaceholder("Referer")
						.setValue(rule.referer)
						.onChange(async (value) => {
							rule.referer = value;
							await this.plugin.saveSettings();
						}))
					.addExtraButton(btn => btn
						.setIcon("trash")
						.setTooltip("Remove rule")
						.onClick(async () => {
							this.plugin.settings.domainRules.splice(index, 1);
							await this.plugin.saveSettings();
							renderRules();
						}));
			});
		};

		renderRules();

		new Setting(containerEl)
			.setName("Add rule")
			.setDesc("Add a new domain-to-referer mapping rule.")
			.addButton(btn => btn
				.setButtonText("Add rule")
				.setCta()
				.onClick(async () => {
					this.plugin.settings.domainRules.push({ domain: "", referer: "" });
					await this.plugin.saveSettings();
					renderRules();
				}));
	}
}
