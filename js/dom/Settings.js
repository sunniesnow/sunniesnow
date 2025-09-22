Sunniesnow.Settings = {

	async load() {
		await this.readSettings();
		if (Sunniesnow.Utils.isBrowser()) {
			await this.saveSettings();
			Sunniesnow.game.savedSettings = this.saved;
		}
		if (!Sunniesnow.game.settings.levelFile) {
			throw new Error('No level loaded');
		}
		Sunniesnow.game.progressAdjustable = Sunniesnow.game.settings.progressAdjustable && Sunniesnow.game.settings.autoplay;
	},

	init() {
		this.initSettings();
		this.setDeviceDependentDefaults();
		this.writeSavedSettings();
	},

	initSettings() {
		this.mainSettings = new Sunniesnow.SettingCollection(null, document.getElementById('main-settings'));
		this.s = {mainSettings: this.mainSettings};
		for (const [settingId, setting] of this.mainSettings.mapSettingIdToSetting) {
			this.s[Sunniesnow.Utils.slugToCamel(settingId)] = setting;
		}
		this.s.langSelect = new Sunniesnow.SettingSelect(null, document.getElementById('lang-select'));
		this.s.importSettings = new Sunniesnow.SettingFile(null, document.getElementById('import-settings'));
		this.s.importChartOffsets = new Sunniesnow.SettingFile(null, document.getElementById('import-chart-offsets'));
		this.s.levelFile.addEventListener('load', event => {
			if (this.s.levelFile.value() === 'online') {
				this.writeSavedChartOffset(this.s.levelFileOnline.value());
			} else {
				this.s.chartOffset.set(0);
			}
			this.clearLevelReadme();
			for (const [filename, file] of Object.entries(event.value.files)) {
				if (Sunniesnow.Utils.needsDisplayTextFile(filename)) {
					file.async('text').then(text => this.fillLevelReadme(filename, text));
				}
			}
		});
	},

	fillLevelReadme(filename, text) {
		const type = mime.getType(filename);
		const details = document.createElement('details');
		const summary = document.createElement('summary');
		summary.innerText = filename;
		details.appendChild(summary);
		const element = document.createElement('div');
		details.appendChild(element);
		if (type?.endsWith('markdown')) {
			text = marked.parse(text);
			element.innerHTML = DOMPurify.sanitize(text);
		} else {
			const pre = document.createElement('pre');
			pre.innerText = text;
			element.appendChild(pre);
		}
		document.getElementById('level-readme').appendChild(details);
	},

	clearLevelReadme() {
		document.getElementById('level-readme').innerHTML = '';
	},

	async readSettings() {
		Sunniesnow.game.settings = await this.mainSettings.get(Sunniesnow.game.overrideSettings);
	},

	writeSavedSettings() {
		this.writeSettings(JSON.parse(localStorage.getItem('settings')))
	},

	writeSettings(settings) {
		this.mainSettings.load(settings);
	},

	saveChartOffset(key) {
		let chartOffsets = JSON.parse(localStorage.getItem('chartOffsets'));
		if (!chartOffsets) {
			chartOffsets = {};
		}
		chartOffsets[key] = this.s.chartOffset.value();
		try {
			localStorage.setItem('chartOffsets', JSON.stringify(chartOffsets));
		} catch (e) {
			Sunniesnow.Logs.warn(`Failed to save chart offset: ${e.message ?? e}`);
		}
	},

	writeSavedChartOffset(key) {
		const chartOffsets = JSON.parse(localStorage.getItem('chartOffsets'));
		if (!chartOffsets) {
			return;
		}
		this.s.chartOffset.load(chartOffsets[key]);
	},

	deleteSavedChartOffsets() {
		localStorage.removeItem('chartOffsets');
	},

	async saveSettings() {
		this.saved = await this.mainSettings.save();
		delete this.saved.chartOffset;
		try {
			localStorage.setItem('settings', JSON.stringify(this.saved));
		} catch (e) {
			Sunniesnow.Logs.warn(`Failed to save settings: ${e.message ? e.message : e}`);
		}
		if (this.s.levelFile.value() === 'online') {
			this.saveChartOffset(this.s.levelFileOnline.value());
		}
	},

	deleteSavedSettings() {
		localStorage.removeItem('settings');
	},

	exportSavedSettings() {
		const text = localStorage.getItem('settings');
		if (!text) {
			Sunniesnow.Logs.warn('No saved settings to export');
			return;
		}
		Sunniesnow.Utils.downloadText(text, 'settings.json', 'application/json');
	},

	exportSavedChartOffsets() {
		const text = localStorage.getItem('chartOffsets');
		if (!text) {
			Sunniesnow.Logs.warn('No saved chart offsets to export');
			return;
		}
		Sunniesnow.Utils.downloadText(text, 'chart-offsets.json', 'application/json');
	},

	async importSettings() {
		let settings;
		try {
			settings = await this.s.importSettings.get();
			this.writeSettings(settings);
			localStorage.setItem('settings', JSON.stringify(settings));
		} catch (e) {
			Sunniesnow.Logs.error(`Failed to import settings: ${e}`, e);
		}
	},

	async importChartOffsets() {
		const oldChartOffsets = localStorage.getItem('chartOffsets');
		let chartOffsets;
		try {
			chartOffsets = await this.s.importChartOffsets.get();
			chartOffsets = Object.assign(JSON.parse(oldChartOffsets), chartOffsets);
			localStorage.setItem('chartOffsets', JSON.stringify(chartOffsets));
		} catch (e) {
			Sunniesnow.Logs.error(`Failed to import chart offsets: ${e}`, e);
		}
	},

	setDeviceDependentDefaults() {
		this.setResolution();
		this.setRenderer();
		this.setFullscreenMethod();
	},

	setResolution() {
		const [height, width] = Sunniesnow.Utils.minmax(screen.width * devicePixelRatio, screen.height * devicePixelRatio);
		this.s.width.set(width);
		this.s.height.set(height);
		const canvas = document.getElementById('main-canvas');
		canvas.width = width;
		canvas.height = height;
	},

	setRenderer() {
		if (!Sunniesnow.Utils.supportsGl()) {
			this.s.renderer.set('canvas');
		}
	},

	setFullscreenMethod() {
		if (Sunniesnow.Utils.isMobileSafari()) {
			this.s.floatAsFullscreen.set(true);
		}
	},
};
