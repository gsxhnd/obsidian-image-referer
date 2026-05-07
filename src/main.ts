/**
 * 插件入口模块
 *
 * Image Referer 插件用于在 Obsidian 中加载外部图片时自定义 HTTP Referer 头，
 * 解决部分图床因防盗链（Referer 检查）导致图片无法显示的问题。
 *
 * 核心工作流：
 *   1. 启动时加载用户配置的域名 → Referer 映射规则
 *   2. 通过 MutationObserver 监听 DOM 变化，拦截所有外部图片请求
 *   3. 对匹配规则的图片，使用 `requestUrl` 重新请求并附带自定义 Referer
 *   4. 将获取到的图片数据转为 Blob URL 替换原 `<img>` 的 src
 */

import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, ImageRefererSettings, ImageRefererSettingTab } from "./settings";
import { registerRefererInterceptor, unregisterRefererInterceptor } from "./referer";
import { resolveReferer } from "./domain-matcher";

export default class ImageRefererPlugin extends Plugin {
	/** 插件设置（持久化到 Obsidian 的 data.json） */
	settings: ImageRefererSettings;

	/**
	 * 插件加载时调用
	 *
	 * 完成以下初始化工作：
	 *   1. 从磁盘加载持久化设置
	 *   2. 注册设置选项卡（供用户在 Obsidian 界面中配置规则）
	 *   3. 注册 DOM 拦截器，开始监听并处理图片
	 */
	async onload() {
		console.debug("[ImageReferer] Plugin loading...");
		await this.loadSettings();
		console.debug("[ImageReferer] Settings loaded:", this.settings);

		this.addSettingTab(new ImageRefererSettingTab(this.app, this));
		console.debug("[ImageReferer] Settings tab registered");

		// 传入域名解析函数：根据图片 URL 查找对应的 Referer 值
		registerRefererInterceptor(this, (url: string) => {
			return resolveReferer(url, this.settings.domainRules);
		}, this.settings.diagnosticMode);
		console.debug("[ImageReferer] Plugin loaded");
	}

	/**
	 * 插件卸载时调用
	 *
	 * 断开 MutationObserver、清除定时器、释放 Blob URL 缓存，避免内存泄漏。
	 */
	onunload() {
		console.debug("[ImageReferer] Plugin unloading...");
		unregisterRefererInterceptor();
		console.debug("[ImageReferer] Plugin unloaded");
	}

	/**
	 * 从 Obsidian 的插件数据存储中加载设置
	 *
	 * 使用 `Object.assign` 将磁盘数据与默认设置合并，
	 * 确保新版本新增的字段有默认值。
	 * 兼容旧版本未保存 `enabled` 字段的情况，默认设为 true。
	 */
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

	/**
	 * 将当前设置持久化到磁盘
	 *
	 * 在设置选项卡中修改规则后调用，确保重启 Obsidian 后配置不丢失。
	 */
	async saveSettings() {
		console.debug("[ImageReferer] saveData to disk:", this.settings);
		await this.saveData(this.settings);
	}
}
