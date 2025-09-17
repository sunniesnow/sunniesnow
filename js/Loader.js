Sunniesnow.Loader = {

	async loadModules() {
		this.loadingModulesComplete = false;
		this.loadingModulesProgress = 0;
		this.targetLoadingModulesProgress = 0;
		this.modulesQueue = [];
		this.loadMeta();
		this.loadFilter();
		this.loadAudioAndChart();
		this.loadTouch();
		this.loadUiComponents();
		this.loadUiResult();
		this.loadInteraction();
		this.loadUiPause();
		this.loadButtons();
		this.loadUiEvents();
		this.loadFx();
		this.loadUiNonevents();
		this.loadExternal();
		while (this.modulesQueue.length > 0) {
			await this.modulesQueue.shift()();
		}
		this.loadingModulesComplete = true;
	},

	loadMeta() {
		this.loadModule('Settings');
		this.loadModule('Config');
		this.loadModule('Plugin');
		this.loadModule('SpinUp');
	},

	loadAudioAndChart() {
		this.loadModule('Audio');
		this.loadModule('Music');
		this.loadModule('Chart');
		this.loadModule('SeTap');
		this.loadModule('SeHold');
		this.loadModule('SeFlick');
		this.loadModule('SeDrag');
		this.loadModule('SeDragFlick');
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
	},

	loadUiResult() {
		this.loadModule('Result');
		this.loadModule('ResultStatsAndCombo');
		this.loadModule('ResultTitle');
		this.loadModule('ResultDifficulty');
		this.loadModule('ResultRank');
		this.loadModule('ResultScore');
		this.loadModule('ResultAccuracy');
		this.loadModule('ResultProfile');
		this.loadModule('ResultAdditionalInfo');
	},

	loadInteraction() {
		this.loadModule('DebugBoard');
		this.loadModule('TouchEffect');
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
		this.loadModule('UiDragFlick');
		this.loadModule('UiBgNote');
		this.loadModule('UiBigText');
		this.loadModule('UiGrid');
		this.loadModule('UiHexagon');
		this.loadModule('UiCheckerboard');
		this.loadModule('UiDiamondGrid');
		this.loadModule('UiPentagon');
		this.loadModule('UiTurntable');
		this.loadModule('UiHexagram');
		this.loadModule('UiImage');
	},

	loadFx() {
		this.loadModule('FxTap');
		this.loadModule('FxHold');
		this.loadModule('FxFlick');
		this.loadModule('FxDrag');
		this.loadModule('FxDragFlick');
	},

	loadUiNonevents() {
		this.loadModule('TipPoint');
		this.loadModule('DoubleLine');
		this.loadModule('JudgementLine');
	},

	loadFilter() {
		this.loadModule('Filter');
	},

	loadExternal() {
		this.loadModule('Imgur');
		this.loadModule('DiscordRichPresence');
	},

	loadModule(name) {
		Sunniesnow[name].loaded = false;
		this.modulesQueue.push(async () => {
			if (Sunniesnow.game.terminating) {
				return;
			}
			this.currentlyLoadingModule = name;
			this.updateLoading();
			try {
				await Sunniesnow[name].load();
				Sunniesnow[name].loaded = true;
			} catch (e) {
				Sunniesnow.Logs.error(`Failed to load ${name}: ${e}`, e);
			}
			this.loadingModulesProgress++;
		});
		this.targetLoadingModulesProgress++;
	},

	async load() {
		let element;
		if (Sunniesnow.Utils.isBrowser()) {
			element = document.getElementById('loading-progress');
			element.style.display = '';
		}
		this.loadingComplete = false;
		await this.loadModules();
		this.loadingComplete = true;
		if (element) {
			element.style.display = 'none';
		}
	},

	updateLoading() {
		this.loadingText = `Loading modules: ${this.loadingModulesProgress}/${this.targetLoadingModulesProgress} (${this.currentlyLoadingModule})`;
		if (Sunniesnow.Utils.isBrowser()) {
			const element = document.getElementById('loading-progress');
			element.textContent = this.loadingText;
		} else {
			if (this.lastLoadingText !== this.loadingText) {
				Sunniesnow.record.print(this.loadingText + '\n');
				this.lastLoadingText = this.loadingText;
			}
		}
	},

	async deleteOnlineCaches() {
		if (!window.caches) {
			Sunniesnow.Logs.warn('Caches are not available');
			return;
		}
		if (!await caches.delete('online-v1')) {
			Sunniesnow.Logs.warn('No caches of online resources to delete');
		}
	},

	async deleteSiteCaches() {
		if (!window.caches) {
			Sunniesnow.Logs.warn('Caches are not available');
			return;
		}
		if (!await caches.delete('site-v1')) {
			Sunniesnow.Logs.warn('No caches of site resources to delete');
		}
	},

	async deleteExternalCaches() {
		if (!window.caches) {
			Sunniesnow.Logs.warn('Caches are not available');
			return;
		}
		if (!await caches.delete('external-v1')) {
			Sunniesnow.Logs.warn('No caches of external resources to delete');
		}
	}

};
