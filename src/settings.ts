import { App, PluginSettingTab, Setting } from "obsidian";
import type ImageRefererPlugin from "./main";

export interface DomainRule {
	domain: string;
	referer: string;
	enabled: boolean;
}

export interface ImageRefererSettings {
	domainRules: DomainRule[];
	diagnosticMode: boolean;
}

export const DEFAULT_SETTINGS: ImageRefererSettings = {
	domainRules: [],
	diagnosticMode: false,
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
			.setName("Domain rules")
			.setHeading()
			.setDesc(
				"Configure per-domain referer values. Use exact host names (i.imgur.com) or wildcards (*.imgur.com).",
			);

		const rulesContainer = containerEl.createDiv({ cls: "image-referer-rules" });

		const renderRules = () => {
			rulesContainer.empty();

			this.plugin.settings.domainRules.forEach((rule, index) => {
				const ruleEl = rulesContainer.createDiv({ cls: "image-referer-rule" });

				new Setting(ruleEl)
					.setName(`Rule ${index + 1}`)
					.addToggle(toggle => toggle
						.setValue(rule.enabled)
						.setTooltip("Enable/disable this rule")
						.onChange(async (value) => {
							rule.enabled = value;
							await this.plugin.saveSettings();
						}))
					.addText(text => text
						.setPlaceholder("Domain: i.imgur.com or *.imgur.com")
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
					this.plugin.settings.domainRules.push({
						domain: "",
						referer: "",
						enabled: true,
					});
					await this.plugin.saveSettings();
					renderRules();
				}));

		new Setting(containerEl)
			.setName("Diagnostic mode")
			.setDesc("Show notices when image fetches fail, including the domain and referer used.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.diagnosticMode)
				.onChange(async (value) => {
					this.plugin.settings.diagnosticMode = value;
					await this.plugin.saveSettings();
				}));
	}
}
