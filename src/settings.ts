/**
 * 设置类型定义与设置选项卡 UI
 *
 * 定义插件的配置结构（DomainRule、ImageRefererSettings），
 * 并提供 Obsidian 设置选项卡的渲染逻辑。
 *
 * 配置持久化由 main.ts 中的 loadSettings / saveSettings 负责，
 * 本模块只负责声明类型和渲染 UI。
 */

import { App, PluginSettingTab, Setting } from "obsidian";
import type ImageRefererPlugin from "./main";

/**
 * 单条域名 → Referer 映射规则
 *
 * @property domain  - 匹配的域名（支持精确值如 "i.imgur.com" 或通配符如 "*.imgur.com"）
 * @property referer - 当图片 URL 匹配该域名时，请求中携带的 Referer 头值
 * @property enabled - 是否启用该规则（用户可在 UI 中通过 toggle 开关）
 */
export interface DomainRule {
	domain: string;
	referer: string;
	enabled: boolean;
}

/**
 * 插件设置的整体结构
 *
 * @property domainRules   - 域名映射规则列表
 * @property diagnosticMode - 诊断模式开关（开启后失败时弹出 Notice 提示）
 */
export interface ImageRefererSettings {
	domainRules: DomainRule[];
	diagnosticMode: boolean;
}

/** 设置默认值：空规则列表，诊断模式关闭 */
export const DEFAULT_SETTINGS: ImageRefererSettings = {
	domainRules: [],
	diagnosticMode: false,
};

/**
 * 设置选项卡类
 *
 * 继承自 Obsidian 的 PluginSettingTab，在 "设置 → 社区插件 → Image Referer" 下渲染 UI。
 * 支持以下操作：
 *   - 查看、添加、删除域名规则
 *   - 切换单条规则的启用/禁用状态
 *   - 编辑规则的域名和 Referer 值
 *   - 切换诊断模式
 *
 * 每次修改配置后自动调用 `plugin.saveSettings()` 持久化到磁盘。
 */
export class ImageRefererSettingTab extends PluginSettingTab {
	plugin: ImageRefererPlugin;

	constructor(app: App, plugin: ImageRefererPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/**
	 * 渲染设置面板
	 *
	 * 每次打开设置页面时调用，先清空容器再重新渲染所有内容。
	 */
	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// ---- 规则列表标题 ----
		new Setting(containerEl)
			.setName("Domain rules")
			.setHeading()
			.setDesc(
				"Configure per-domain referer values. Use exact host names (i.imgur.com) or wildcards (*.imgur.com).",
			);

		const rulesContainer = containerEl.createDiv({ cls: "image-referer-rules" });

		/**
		 * 渲染（或重新渲染）规则列表
		 *
		 * 每次添加或删除规则后调用，保证 UI 与 settings.domainRules 数组保持同步。
		 * 每条规则显示为一行，包含：
		 *   - toggle 开关（启用/禁用）
		 *   - 域名输入框
		 *   - Referer 输入框
		 *   - 删除按钮（垃圾桶图标）
		 */
		const renderRules = () => {
			rulesContainer.empty();

			this.plugin.settings.domainRules.forEach((rule, index) => {
				const ruleEl = rulesContainer.createDiv({ cls: "image-referer-rule" });

				new Setting(ruleEl)
					.setName(`Rule ${index + 1}`)
					// 启用/禁用开关
					.addToggle(toggle => toggle
						.setValue(rule.enabled)
						.setTooltip("Enable/disable this rule")
						.onChange(async (value) => {
							rule.enabled = value;
							await this.plugin.saveSettings();
						}))
					// 域名输入
					.addText(text => text
						.setPlaceholder("Domain: i.imgur.com or *.imgur.com")
						.setValue(rule.domain)
						.onChange(async (value) => {
							rule.domain = value;
							await this.plugin.saveSettings();
						}))
					// Referer 输入
					.addText(text => text
						.setPlaceholder("Referer")
						.setValue(rule.referer)
						.onChange(async (value) => {
							rule.referer = value;
							await this.plugin.saveSettings();
						}))
					// 删除按钮
					.addExtraButton(btn => btn
						.setIcon("trash")
						.setTooltip("Remove rule")
						.onClick(async () => {
							this.plugin.settings.domainRules.splice(index, 1);
							await this.plugin.saveSettings();
							renderRules();  // 重新渲染
						}));
			});
		};

		// 首次渲染规则列表
		renderRules();

		// ---- 添加规则按钮 ----
		new Setting(containerEl)
			.setName("Add rule")
			.setDesc("Add a new domain-to-referer mapping rule.")
			.addButton(btn => btn
				.setButtonText("Add rule")
				.setCta()
				.onClick(async () => {
					// 追加一条空规则（用户可随后编辑）
					this.plugin.settings.domainRules.push({
						domain: "",
						referer: "",
						enabled: true,
					});
					await this.plugin.saveSettings();
					renderRules();  // 重新渲染
				}));

		// ---- 诊断模式开关 ----
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
