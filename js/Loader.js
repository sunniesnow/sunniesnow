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
		}
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
			Sunniesnow.Utils.error('Failed to load chart: ' + reason, reason);
		});
	},
	
	async loadChart(force = false) {
		let file;
		let sourceContents;
		switch (Sunniesnow.game?.settings.levelFile ?? Sunniesnow.Dom.readRadio('level-file')) {
			case 'online':
				if (force) {
					sourceContents = Sunniesnow.Dom.readValue('level-file-online');
				} else {
					sourceContents = Sunniesnow.game?.settings.levelFileOnline ?? Sunniesnow.Dom.readValue('level-file-online');
				}
				if (this.loaded.chart.source === 'online' && this.loaded.chart.sourceContents === sourceContents) {
					return;
				}
				this.clearChart();
				this.loaded.chart.source = 'online';
				this.loaded.chart.sourceContents = sourceContents;
				const url = Sunniesnow.Utils.url(Sunniesnow.Config.chartPrefix, sourceContents, '.ssc');
				try {
					file = await Sunniesnow.Utils.fetchBlobWithProgress(url, 'level-file-downloading');
				} catch (e) {
					Sunniesnow.Utils.error(`Failed to load chart: ${e.message ?? e}`, e);
				}
				break;
			case 'upload':
				if (force) {
					sourceContents = Sunniesnow.Dom.actualLevelFileUpload();
				} else {
					sourceContents = Sunniesnow.game?.settings.levelFileUpload ?? Sunniesnow.Dom.actualLevelFileUpload();
				}
				if (this.loaded.chart.source === 'upload' && this.loaded.chart.sourceContents === sourceContents) {
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
		}
		if (Sunniesnow.game?.settings) {
			if (Sunniesnow.Utils.isBrowser()) {
				Sunniesnow.game.settings.musicSelect = Object.keys(this.loaded.chart.music)[0];
				Sunniesnow.game.settings.chartSelect = Object.keys(this.loaded.chart.charts)[0];
			} else {
				Sunniesnow.game.settings.musicSelect ||= Object.keys(this.loaded.chart.music)[0];
				Sunniesnow.game.settings.chartSelect ||= Object.keys(this.loaded.chart.charts)[0];
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

	async skinBlob() {
		switch (Sunniesnow.game.settings.skin) {
			case 'default':
				return null;
			case 'online':
				try {
					return await Sunniesnow.Utils.fetchBlobWithProgress(Sunniesnow.Utils.url(
						Sunniesnow.Config.skinPrefix,
						Sunniesnow.game.settings.skinOnline,
						'.ssp'
					), 'skin-downloading');
				} catch (e) {
					Sunniesnow.Utils.warn(`Failed to download skin: ${e.message ?? e}`, e);
					return null;
				}
			case 'upload':
				return Sunniesnow.game.settings.skinUpload;
		}
	},

	async fxBlob() {
		switch (Sunniesnow.game.settings.fx) {
			case 'default':
				return null;
			case 'online':
				try {
					return await Sunniesnow.Utils.fetchBlobWithProgress(Sunniesnow.Utils.url(
						Sunniesnow.Config.fxPrefix,
						Sunniesnow.game.settings.fxOnline,
						'.ssp'
					), 'fx-downloading');
				} catch (e) {
					Sunniesnow.Utils.warn(`Failed to download fx: ${e.message ?? e}`, e);
					return null;
				}
			case 'upload':
				return Sunniesnow.game.settings.fxUpload;
		}
	},

	async seBlob() {
		switch (Sunniesnow.game.settings.se) {
			case 'default':
				return null;
			case 'online':
				try {
					return await Sunniesnow.Utils.fetchBlobWithProgress(Sunniesnow.Utils.url(
						Sunniesnow.Config.sePrefix,
						Sunniesnow.game.settings.seOnline,
						'.ssp'
					), 'se-downloading');
				} catch (e) {
					Sunniesnow.Utils.warn(`Failed to download se: ${e.message ?? e}`, e);
					return null;
				}
			case 'upload':
				return Sunniesnow.game.settings.seUpload;
		}
	},
	
	async pluginBlob(n) {
		switch (Sunniesnow.game.settings.plugin[n]) {
			case 'online':
				try {
					return await Sunniesnow.Utils.fetchBlobWithProgress(Sunniesnow.Utils.url(
						Sunniesnow.Config.pluginPrefix,
						Sunniesnow.game.settings.pluginOnline[n],
						'.ssp'
					), `plugin-${n}-downloading`);
				} catch (e) {
					Sunniesnow.Utils.warn(`Failed to download plugin ${n}: ${e.message ?? e}`, e);
					return null;
				}
			case 'upload':
				return Sunniesnow.game.settings.pluginUpload[n];
		}
	},

	loadModules() {
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
		(async () => {
			while (this.modulesQueue.length > 0) {
				await this.modulesQueue.shift()();
			}
		})();
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
		if (!Sunniesnow.Utils.isBrowser()) {
			if (this.loadingModulesProgress >= this.targetLoadingModulesProgress) {
				this.loadingModulesComplete = true;
				this.loadingComplete = true;
			}
			return;
		}
		const element = document.getElementById('loading-progress');
		if (this.loadingModulesProgress >= this.targetLoadingModulesProgress) {
			element.style.display = 'none';
			this.loadingModulesComplete = true;
			this.loadingComplete = true;
		} else {
			element.style.display = '';
			element.innerHTML = `Loading modules: ${this.loadingModulesProgress}/${this.targetLoadingModulesProgress}`;
		}
	},

	loadPlugins() {
		this.loadingPluginsProgress = 0;
		this.targetLoadingPluginsProgress = 0;
		this.loadingPluginsComplete = false;
		for (const id of ['skin', 'fx', 'se', ...Object.keys(Sunniesnow.game.settings.plugin)]) {
			this.targetLoadingPluginsProgress++;
			Sunniesnow.Plugin.loadPlugin(id).then(
				() => this.loadingPluginsProgress++
			).catch(
				reason => Sunniesnow.Utils.warn(`Failed to load plugin ${id}: ${reason}`, reason)
			);
		}
	},

	updateLoadingPlugins() {
		if (!Sunniesnow.Utils.isBrowser()) {
			if (this.loadingPluginsProgress >= this.targetLoadingPluginsProgress) {
				this.loadingPluginsComplete = true;
				this.loadModules();
			}
			return;
		}
		const element = document.getElementById('loading-progress');
		if (this.loadingPluginsProgress >= this.targetLoadingPluginsProgress) {
			element.style.display = 'none';
			this.loadingPluginsComplete = true;
			this.loadModules();
		} else {
			element.style.display = '';
			element.innerHTML = `Loading plugins: ${this.loadingPluginsProgress}/${this.targetLoadingPluginsProgress}`;
		}
	},

	updateLoadingChart() {
		if (!Sunniesnow.Utils.isBrowser()) {
			return;
		}
		const element = document.getElementById('loading-progress');
		element.style.display = '';
		element.innerHTML = 'Loading chart';
	},

	load() {
		if (Sunniesnow.Utils.isBrowser()) {
			Sunniesnow.Dom.readSettings();
		}
		this.loadingComplete = false;
		if (Sunniesnow.game.settings.levelFile === 'online' && this.loaded.chart.sourceContents !== Sunniesnow.game.settings.levelFileOnline) {
			Sunniesnow.Utils.warn('Level file not loaded, waiting');
			this.loadChart().then(() => {
				if (Sunniesnow.Utils.isBrowser()) {
					Sunniesnow.Dom.saveSettings();
				}
				this.loadingChartComplete = true;
				this.loadPlugins();
			}).catch(
				reason => Sunniesnow.Utils.error(`Failed to load chart: ${reason}`, reason)
			);
		} else {
			if (Sunniesnow.Utils.isBrowser()) {
				Sunniesnow.Dom.saveSettings();
			}
			this.loadingChartComplete = true;
			this.loadPlugins();
		}
		// loadModules() will be called in updateLoadingPlugins().
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
