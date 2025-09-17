Sunniesnow.Settings = {

	async load() {
		await this.readSettings((received, total, url) => {
			// TODO
		});
		if (Sunniesnow.Utils.isBrowser()) {
			await this.saveSettings();
			Sunniesnow.game.savedSettings = this.saved;
		}
		this.tryAvoidingNoBackground();
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
		this.s.levelFile.addEventListener('ziploaded', event => {
			if (this.s.levelFile.save() === 'online') {
				this.writeSavedChartOffset(this.s.levelFileOnline.save());
			} else {
				this.s.chartOffset.set(0);
			}
			this.clearLevelReadme();
			for (const [filename, file] of Object.entries(this.s.levelFile.zip.files)) {
				if (Sunniesnow.Utils.needsDisplayTextFile(filename)) {
					file.async('text').then(text => this.fillLevelReadme(filename, text));
				}
			}
		});
	},

	tryAvoidingNoBackground() {
		if (this.s.background.save() === 'from-level' && !this.s.backgroundFromLevel.save()) {
			this.s.background.set('online');
		}
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

	async readSettings(onProgress) {
		Sunniesnow.game.settings = await this.mainSettings.getAsync(onProgress);
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
		chartOffsets[key] = this.s.chartOffset.save();
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
		this.saved = await this.mainSettings.saveAsync();
		delete this.saved.chartOffset;
		try {
			localStorage.setItem('settings', JSON.stringify(this.saved));
		} catch (e) {
			Sunniesnow.Logs.warn(`Failed to save settings: ${e.message ? e.message : e}`);
		}
		if (this.s.levelFile.save() === 'online') {
			this.saveChartOffset(this.s.levelFileOnline.save());
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
		const file = this.s.importSettings.get();
		if (!file) {
			return;
		}
		let importSuccess = false;
		try {
			localStorage.setItem('settings', await file.text());
			importSuccess = true;
		} catch (e) {
			Sunniesnow.Logs.warn(`Failed to import settings: ${e.message ?? e}`);
		}
		if (importSuccess) {
			this.writeSavedSettings();
		}
	},

	async importChartOffsets() {
		const file = this.s.importChartOffsets.get();
		if (!file) {
			return;
		}
		const oldJson = localStorage.getItem('chartOffsets');
		const chartOffsets = oldJson ? JSON.parse(oldJson) : {};
		Object.assign(chartOffsets, JSON.parse(await file.text()));
		try {
			localStorage.setItem('chartOffsets', JSON.stringify(chartOffsets));
		} catch (e) {
			Sunniesnow.Logs.warn(`Failed to import chart offsets: ${e.message ?? e}`);
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

	clearDownloadingProgresses() {
		this.mainSettings.clearDownloadingProgresses();
	}

};
