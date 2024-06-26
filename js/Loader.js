Sunniesnow.Loader = {
	loaded: {
		chart: {

			// 'online' or 'upload'
			source: null,

			// online: the string filled in level-file-online
			// upload: the file object
			sourceContents: null,

			// chart files in JSON contained in the loaded .ssc file.
			// keys: filename
			// values: JSON object
			charts: {},

			// music files contained in the .ssc file.
			// keys: filename
			// values: ArrayBuffer
			music: {},

			// background image files contained in the .ssc file.
			// keys: filename
			// values: Blob
			backgrounds: {}
		},

		// id: {source: 'online' | 'upload', sourceContents: string | File}
		plugins: {}
	},

	chartLoadListeners: [],

	triggerLoadChart() {
		if (this.loadingChart) {
			return;
		}
		this.loadingChart = true;
		return this.loadChart(true).then(() => {
			this.loadingChart = false;
			this.onChartLoad();
		}).catch(reason => {
			this.loadingChart = false;
			throw reason;
		});
	},

	interruptLevelLoad() {
		Sunniesnow.Dom.clearToFill();
		Sunniesnow.Fetcher.interrupt();
	},
	
	async loadChart(force = false) {
		let file;
		let sourceContents;
		let sourceType;
		if (force) {
			sourceType = Sunniesnow.Dom.readRadio('level-file');
		} else {
			sourceType = Sunniesnow.game?.settings.levelFile ?? Sunniesnow.Dom.readRadio('level-file');
		}
		switch (sourceType) {
			case 'online':
				if (force) {
					sourceContents = Sunniesnow.Dom.readValue('level-file-online');
				} else {
					sourceContents = Sunniesnow.game?.settings.levelFileOnline ?? Sunniesnow.Dom.readValue('level-file-online');
				}
				if (!force && this.loaded.chart.source === 'online' && this.loaded.chart.sourceContents === sourceContents) {
					return;
				}
				this.clearChart();
				this.loaded.chart.source = 'online';
				this.loaded.chart.sourceContents = sourceContents;
				const url = Sunniesnow.Utils.url(Sunniesnow.Config.chartPrefix, sourceContents, '.ssc');
				try {
					file = await Sunniesnow.Fetcher.blob(url, 'level-file-downloading');
				} catch (e) {
					this.loaded.chart.source = null;
					this.loaded.chart.sourceContents = null;
					Sunniesnow.Utils.error(`Failed to load level ${sourceContents}: ${e.message ?? e}`, e);
				}
				if (Sunniesnow.Utils.isBrowser()) {
					Sunniesnow.Dom.writeSavedChartOffset(sourceContents);
				}
				break;
			case 'upload':
				if (force) {
					sourceContents = Sunniesnow.Dom.actualLevelFileUpload();
				} else {
					sourceContents = Sunniesnow.game?.settings.levelFileUpload ?? Sunniesnow.Dom.actualLevelFileUpload();
				}
				if (!force && this.loaded.chart.source === 'upload' && this.loaded.chart.sourceContents === sourceContents) {
					return;
				}
				this.clearChart();
				this.loaded.chart.source = 'upload';
				file = this.loaded.chart.sourceContents = sourceContents;
				break;
		}
		if (!file) {
			Sunniesnow.Utils.warn('No chart to load');
			return;
		}
		let zip;
		try {
			zip = await JSZip.loadAsync(file);
		} catch (e) {
			Sunniesnow.Utils.warn('Failed to load chart: cannot read as zip', e);
			return;
		}
		for (const filename in zip.files) {
			const zipObject = zip.files[filename];
			if (zipObject.dir) {
				continue;
			}
			const type = mime.getType(filename);
			if (type?.startsWith('audio')) {
				if (Sunniesnow.Utils.isBrowser()) {
					Sunniesnow.Dom.fillMusicSelect(filename);
				}
				this.loaded.chart.music[filename] = await zipObject.async('arraybuffer');
			} else if (type?.startsWith('image')) {
				if (Sunniesnow.Utils.isBrowser()) {
					Sunniesnow.Dom.fillBackgroundSelect(filename);
				}
				const blob = new Blob([await zipObject.async('blob')], {type});
				this.loaded.chart.backgrounds[filename] = blob;
			} else if (type?.endsWith('json')) {
				if (Sunniesnow.Utils.isBrowser()) {
					Sunniesnow.Dom.fillChartSelect(filename);
				}
				this.loaded.chart.charts[filename] = JSON.parse(await zipObject.async('string'));
			} else if (Sunniesnow.Utils.needsDisplayTextFile(filename)) {
				if (Sunniesnow.Utils.isBrowser()) {
					Sunniesnow.Dom.fillLevelReadme(filename, await zipObject.async('string'));
				}
			} else {
				Sunniesnow.Utils.warn(`Cannot determine type of ${filename}`)
			}
		}
		if (Sunniesnow.Utils.isBrowser()) {
			await Sunniesnow.Dom.untilSelectsLoaded();
			Sunniesnow.Dom.tryAvoidingNoBackground();
		}
		if (Sunniesnow.game?.settings) {
			if (Sunniesnow.Utils.isBrowser()) {
				Sunniesnow.game.settings.musicSelect = Sunniesnow.Dom.readValue('music-select');
				Sunniesnow.game.settings.chartSelect = Sunniesnow.Dom.readValue('chart-select');
				Sunniesnow.game.settings.backgroundFromLevel ||= Sunniesnow.Dom.readValue('background-from-level');
			} else {
				Sunniesnow.game.settings.musicSelect ||= Object.keys(this.loaded.chart.music)[0];
				Sunniesnow.game.settings.chartSelect ||= Object.keys(this.loaded.chart.charts)[0];
				Sunniesnow.game.settings.backgroundFromLevel ||= Object.keys(this.loaded.chart.backgrounds)[0];
			}
		}
	},

	onChartLoad() {
		while (this.chartLoadListeners.length) {
			this.chartLoadListeners.shift()();
		}
	},

	addChartLoadListener(listener) {
		this.chartLoadListeners.push(listener);
	},
	
	clearChart() {
		this.loaded.chart.charts = {};
		this.loaded.chart.music = {};
		this.loaded.chart.backgrounds = {};
		if (!Sunniesnow.Utils.isBrowser()) {
			return;
		}
		Sunniesnow.Dom.clearSelect('music-select');
		Sunniesnow.Dom.clearSelect('chart-select');
		Sunniesnow.Dom.clearSelect('background-from-level');
		document.getElementById('level-readme').innerHTML = '';
	},

	backgroundUrl() {
		let blob;
		switch (Sunniesnow.game.settings.background) {
			case 'none':
				return null;
			case 'online':
				return Sunniesnow.Utils.url(
					Sunniesnow.Config.backgroundPrefix,
					Sunniesnow.game.settings.backgroundOnline
				);
			case 'from-level':
				blob = this.loaded.chart.backgrounds[Sunniesnow.game.settings.backgroundFromLevel];
				if (!blob) {
					Sunniesnow.Utils.warn('No background provided');
					return;
				}
				break;
			case 'upload':
				blob = Sunniesnow.game.settings.backgroundUpload;
				if (!blob) {
					Sunniesnow.Utils.warn('No background provided');
					return;
				}
				break;
		}
		return Sunniesnow.ObjectUrl.create(blob);
	},
	
	async pluginBlob(id) {
		let source, prefix, online, upload, downloading;
		switch (id) {
			case 'skin':
				source = Sunniesnow.game.settings.skin;
				prefix = Sunniesnow.Config.skinPrefix;
				online = Sunniesnow.game.settings.skinOnline;
				upload = Sunniesnow.game.settings.skinUpload;
				downloading = 'skin-downloading';
				break;
			case 'fx':
				source = Sunniesnow.game.settings.fx;
				prefix = Sunniesnow.Config.fxPrefix;
				online = Sunniesnow.game.settings.fxOnline;
				upload = Sunniesnow.game.settings.fxUpload;
				downloading = 'fx-downloading';
				break;
			case 'se':
				source = Sunniesnow.game.settings.se;
				prefix = Sunniesnow.Config.sePrefix;
				online = Sunniesnow.game.settings.seOnline;
				upload = Sunniesnow.game.settings.seUpload;
				downloading = 'se-downloading';
				break;
			default:
				source = Sunniesnow.game.settings.plugin[id];
				prefix = Sunniesnow.Config.pluginPrefix;
				online = Sunniesnow.game.settings.pluginOnline[id];
				upload = Sunniesnow.game.settings.pluginUpload[id];
				downloading = `plugin-${id}-downloading`;
		}
		switch (source) {
			case 'online':
				const loaded = this.loaded.plugins[id];
				if (loaded?.source === 'online' && loaded.sourceContents === online) {
					if (Sunniesnow.Plugin.plugins[id]) {
						return Sunniesnow.Plugin.plugins[id].blob;
					}
				} else {
					this.loaded.plugins[id] = {source: 'online', sourceContents: online};
				}
				try {
					return await Sunniesnow.Fetcher.blob(Sunniesnow.Utils.url(prefix, online, '.ssp'), downloading);
				} catch (e) {
					Sunniesnow.Utils.warn(`Failed to download plugin ${id}: ${e.message ?? e}`, e);
					return null;
				}
			case 'upload':
				this.loaded.plugins[id] = {source: 'upload', sourceContents: upload};
				return upload;
		}
	},

	async loadModules() {
		this.loadingModulesComplete = false;
		this.loadingModulesProgress = 0;
		this.targetLoadingModulesProgress = 0;
		this.modulesQueue = [];
		this.loadAudioAndChart();
		this.loadTouch();
		this.loadUiComponents();
		this.loadUiDebug();
		this.loadUiPause();
		this.loadButtons();
		this.loadUiEvents();
		this.loadFx();
		this.loadUiNonevents();
		while (this.modulesQueue.length > 0) {
			await this.modulesQueue.shift()();
		}
		this.loadingModulesComplete = true;
	},

	loadAudioAndChart() {
		this.loadModule('Audio');
		this.loadModule('Music');
		this.loadModule('Chart');
		this.loadModule('SeTap');
		this.loadModule('SeHold');
		this.loadModule('SeFlick');
		this.loadModule('SeDrag');
	},

	loadTouch() {
		this.loadModule('TouchEffect');
		this.loadModule('TouchManager');
	},

	loadUiComponents() {
		this.loadModule('Background');
		this.loadModule('ProgressBar');
		this.loadModule('TopCenterHud');
		this.loadModule('TopLeftHud');
		this.loadModule('TopRightHud');
		this.loadModule('Result');
		this.loadModule('ResultAdditionalInfo');
	},

	loadUiDebug() {
		this.loadModule('DebugBoard');
	},

	loadUiPause() {
		this.loadModule('PauseBackground');
		this.loadModule('ButtonResume');
		this.loadModule('ButtonRetry');
		this.loadModule('ButtonFullscreen');
	},

	loadButtons() {
		this.loadModule('ButtonPause');
		this.loadModule('ButtonResultRetry');
		this.loadModule('ButtonResultFullscreen');
	},

	loadUiEvents() {
		this.loadModule('UiNote');
		this.loadModule('UiTap');
		this.loadModule('UiHold');
		this.loadModule('UiFlick');
		this.loadModule('UiDrag');
		this.loadModule('UiBgNote');
		this.loadModule('UiBigText');
		this.loadModule('UiGrid');
		this.loadModule('UiHexagon');
		this.loadModule('UiCheckerboard');
		this.loadModule('UiDiamondGrid');
		this.loadModule('UiPentagon');
		this.loadModule('UiTurntable');
		this.loadModule('UiHexagram');
	},

	loadFx() {
		this.loadModule('FxTap');
		this.loadModule('FxHold');
		this.loadModule('FxFlick');
		this.loadModule('FxDrag');
	},

	loadUiNonevents() {
		this.loadModule('TipPoint');
		this.loadModule('DoubleLine');
	},

	loadModule(name) {
		this.modulesQueue.push(() => Sunniesnow[name].load().then(
			() => this.loadingModulesProgress++
		).catch(
			reason => Sunniesnow.Utils.error(`Failed to load Sunniesnow.${name}: ${reason}`, reason)
		));
		this.targetLoadingModulesProgress++;
	},

	updateLoadingModules() {
		if (Sunniesnow.Utils.isBrowser()) {
			const element = document.getElementById('loading-progress');
			element.textContent = `Loading modules: ${this.loadingModulesProgress}/${this.targetLoadingModulesProgress}`;
		} else {
			if (this.lastLoadingModulesProgress !== this.loadingModulesProgress) {
				Sunniesnow.record.print(`Loading modules: ${this.loadingModulesProgress}/${this.targetLoadingModulesProgress}\n`);
				this.lastLoadingModulesProgress = this.loadingModulesProgress;
			}
		}
	},

	async loadPlugins() {
		this.loadingPluginsProgress = 0;
		this.targetLoadingPluginsProgress = 0;
		this.loadingPluginsComplete = false;
		for (const id of ['skin', 'fx', 'se', ...Object.keys(Sunniesnow.game.settings.plugin)]) {
			this.targetLoadingPluginsProgress++;
			try {
				await Sunniesnow.Plugin.loadPlugin(id);
			} catch (e) {
				Sunniesnow.Utils.warn(`Failed to load plugin ${id}: ${e.message ?? e}`, e);
			}
			this.loadingPluginsProgress++;
		}
		await Sunniesnow.Plugin.reset();
		await Sunniesnow.Plugin.applyPlugins();
		this.loadingPluginsComplete = true;
	},

	updateLoadingPlugins() {
		if (!Sunniesnow.Utils.isBrowser()) {
			if (this.loadingPluginsComplete) {
				this.loadModules();
			}
			return;
		}
		const element = document.getElementById('loading-progress');
		element.textContent = `Loading plugins: ${this.loadingPluginsProgress}/${this.targetLoadingPluginsProgress}`;
	},

	updateLoadingChart() {
		if (!Sunniesnow.Utils.isBrowser()) {
			return;
		}
		const element = document.getElementById('loading-progress');
		element.textContent = 'Loading chart';
	},

	async load() {
		let element;
		if (Sunniesnow.Utils.isBrowser()) {
			element = document.getElementById('loading-progress');
			element.style.display = '';
			Sunniesnow.Dom.readSettings();
		}
		this.loadingComplete = false;
		if (Sunniesnow.game.settings.levelFile === 'online' && this.loaded.chart.sourceContents !== Sunniesnow.game.settings.levelFileOnline) {
			Sunniesnow.Utils.warn('Level file not loaded, waiting');
			await this.loadChart()
		}
		if (Sunniesnow.Utils.isBrowser()) {
			Sunniesnow.Dom.saveSettings();
			if (this.loaded.chart.source === 'online') {
				Sunniesnow.Dom.saveChartOffset(this.loaded.chart.sourceContents);
			}
		}
		this.loadingChartComplete = true;
		await this.loadPlugins();
		await this.loadModules();
		this.loadingComplete = true;
		if (element) {
			element.style.display = 'none';
		}
	},

	clearLocalStorage() {
		localStorage.removeItem('settings');
	},

	updateLoading() {
		if (this.loadingPluginsComplete) {
			this.updateLoadingModules();
		} else if (this.loadingChartComplete) {
			this.updateLoadingPlugins();
		} else {
			this.updateLoadingChart();
		}
	},

	async deleteOnlineCaches() {
		if (!window.caches) {
			Sunniesnow.Utils.warn('Caches are not available');
			return;
		}
		if (!await caches.delete('online-v1')) {
			Sunniesnow.Utils.warn('No caches of online resources to delete');
		}
	},

	async deleteSiteCaches() {
		if (!window.caches) {
			Sunniesnow.Utils.warn('Caches are not available');
			return;
		}
		if (!await caches.delete('site-v1')) {
			Sunniesnow.Utils.warn('No caches of site resources to delete');
		}
	},

	async deleteExternalCaches() {
		if (!window.caches) {
			Sunniesnow.Utils.warn('Caches are not available');
			return;
		}
		if (!await caches.delete('external-v1')) {
			Sunniesnow.Utils.warn('No caches of external resources to delete');
		}
	}

};
