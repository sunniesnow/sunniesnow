Sunniesnow.Loader = {
	loaded: {
		chart: {
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

		// URL string
		background: null,
	},
	
	async loadChart() {
		this.clearChart();
		let file;
		if (this.readRadio('level-file') === 'online') {
			this.chartOnline = this.readValue('level-file-online');
			const url = Sunniesnow.Utils.url(Sunniesnow.Config.chartPrefix, this.chartOnline, '.ssc');
			try {
				file = await (await fetch(url)).blob();
			} catch (e) {
				Sunniesnow.Utils.error(`Failed to load chart: ${e}`, e);
			}
		} else {
			file = this.readFile('level-file-upload');
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
			if (type.startsWith('audio/')) {
				this.fillMusicSelect(filename);
				this.loaded.chart.music[filename] = await zipObject.async('arraybuffer');
			} else if (type.startsWith('image/')) {
				this.fillBackgroundSelect(filename);
				this.loaded.chart.backgrounds[filename] = await zipObject.async('blob');
			} else if (type.endsWith('json')) {
				this.fillChartSelect(filename);
				this.loaded.chart.charts[filename] = JSON.parse(await zipObject.async('string'));
			} else {
				Sunniesnow.Utils.warn(`Cannot determine type of ${filename}`)
			}
		}
	},
	
	clearChart() {
		this.loaded.chart.charts = {};
		this.loaded.chart.music = {};
		this.loaded.chart.backgrounds = {};
		this.clearSelect('music-select');
		this.clearSelect('chart-select');
		this.clearSelect('background-from-level');
	},

	backgroundUrl() {
		switch (Sunniesnow.game.settings.background) {
			case 'online':
				return Sunniesnow.Utils.url(
					Sunniesnow.Config.backgroundPrefix,
					Sunniesnow.game.settings.backgroundOnline
				);
			case 'from-level':
				let url = URL.createObjectURL(this.loaded.chart.backgrounds[Sunniesnow.game.settings.backgroundFromLevel]);
				setTimeout(() => URL.revokeObjectURL(url), 1000);
				return url;
			case 'upload':
				url = URL.createObjectURL(Sunniesnow.game.settings.backgroundUpload);
				setTimeout(() => URL.revokeObjectURL(url), 1000);
				return url;
		}
	},

	async skinBlob() {
		switch (Sunniesnow.game.settings.skin) {
			case 'default':
				return null;
			case 'online':
				const response = await fetch(Sunniesnow.Utils.url(
					Sunniesnow.Config.skinPrefix,
					Sunniesnow.game.settings.skinOnline,
					'.ssp'
				));
				return await response.blob();
			case 'upload':
				return Sunniesnow.game.settings.skinUpload;
		}
	},

	async fxBlob() {
		switch (Sunniesnow.game.settings.fx) {
			case 'default':
				return null;
			case 'online':
				const response = await fetch(Sunniesnow.Utils.url(
					Sunniesnow.Config.fxPrefix,
					Sunniesnow.game.settings.fxOnline,
					'.ssp'
				));
				return await response.blob();
			case 'upload':
				return Sunniesnow.game.settings.fxUpload;
		}
	},

	async seBlob() {
		switch (Sunniesnow.game.settings.se) {
			case 'default':
				return null;
			case 'online':
				const response = await fetch(Sunniesnow.Utils.url(
					Sunniesnow.Config.sePrefix,
					Sunniesnow.game.settings.seOnline,
					'.ssp'
				));
				return await response.blob();
			case 'upload':
				return Sunniesnow.game.settings.seUpload;
		}
	},
	
	async pluginBlob(n) {
		switch (Sunniesnow.game.settings.plugin[n]) {
			case 'online':
				const response = await fetch(Sunniesnow.Utils.url(
					Sunniesnow.Config.pluginPrefix,
					Sunniesnow.game.settings.pluginOnline[n],
					'.ssp'
				));
				return await response.blob();
			case 'upload':
				return Sunniesnow.game.settings.pluginUpload[n];
		}
	},

	readPluginSettings() {
		const plugin = Sunniesnow.game.settings.plugin = {};
		const pluginOnline = Sunniesnow.game.settings.pluginOnline = {};
		const pluginUpload = Sunniesnow.game.settings.pluginUpload = {};
		if (!Sunniesnow.Plugin.additionalTotal) {
			return;
		}
		for (let i = 0; i < Sunniesnow.Plugin.additionalTotal; i++) {
			if (!document.getElementById(`plugin-${i}`)) {
				continue;
			}
			plugin[i] = this.readRadio(`plugin-${i}`);
			pluginOnline[i] = this.readValue(`plugin-${i}-online`);
			pluginUpload[i] = this.readFile(`plugin-${i}-upload`);
		}
	},

	fillSelect(elementId, filename) {
		const select = document.getElementById(elementId);
		const option = document.createElement('option');
		option.value = filename;
		option.innerText = filename;
		select.appendChild(option);
		return select;
	},

	clearSelect(elementId) {
		const select = document.getElementById(elementId);
		while (select.firstChild) {
			select.removeChild(select.firstChild);
		}
		return select;
	},

	fillMusicSelect(filename) {
		const select = this.fillSelect('music-select', filename);
		select.disabled = false;
	},

	fillChartSelect(filename) {
		const select = this.fillSelect('chart-select', filename);
		select.disabled = false;
	},

	fillBackgroundSelect(filename) {
		this.fillSelect('background-from-level', filename);
	},

	readSettings() {
		Sunniesnow.game.settings = {
			levelFile: this.readRadio('level-file'),
			levelFileOnline: this.readValue('level-file-online'),
			levelFileUpload: this.readFile('level-file-upload'),

			musicSelect: this.readValue('music-select'),
			chartSelect: this.readValue('chart-select'),

			// judgement settings
			judgementWindows: this.readRadio('judgement-windows'),
			noteHitSize: this.readValue('note-hit-size'),
			offset: this.readValue('offset') / 1000,

			// visual settings
			speed: this.readValue('speed'),
			noteSize: this.readValue('note-size'),
			background: this.readRadio('background'),
			backgroundOnline: this.readValue('background-online'),
			backgroundFromLevel: this.readValue('background-from-level'),
			backgroundUpload: this.readFile('background-upload'),
			backgroundBlur: this.readValue('background-blur'),
			backgroundBrightness: this.readValue('background-brightness'),
			skin: this.readRadio('skin'),
			skinOnline: this.readValue('skin-online'),
			skinUpload: this.readFile('skin-upload'),
			fx: this.readRadio('fx'),
			fxOnline: this.readValue('fx-online'),
			fxUpload: this.readFile('fx-upload'),
			hudTopCenter: this.readValue('hud-top-center'),
			hudTopLeft: this.readValue('hud-top-left'),
			hudTopRight: this.readValue('hud-top-right'),

			// audio settings
			se: this.readRadio('se'),
			seOnline: this.readValue('se-online'),
			seUpload: this.readFile('se-upload'),
			volumeSe: this.readValue('volume-se'),
			volumeMusic: this.readValue('volume-music'),
			seWithMusic: this.readCheckbox('se-with-music'),
			delay: this.readValue('delay') / 1000,

			// game settings
			autoplay: this.readCheckbox('autoplay'),
			gameSpeed: this.readValue('game-speed'),
			start: this.readValue('start'),
			end: this.readValue('end'),

			// system settings
			width: this.readValue('width'),
			height: this.readValue('height'),
			fullscreen: this.readCheckbox('fullscreen'),
			debug: this.readCheckbox('debug'),
		}
		this.readPluginSettings();
	},

	readCheckbox(id) {
		return document.getElementById(id).checked;
	},

	readRadio(name) {
		const radios = document.getElementsByName(name);
		for (const radio of radios) {
			if (radio.checked) {
				return radio.value;
			}
		}
	},

	readValue(id) {
		return document.getElementById(id).value;
	},

	readFile(id) {
		return document.getElementById(id).files[0];
	},

	loadModules() {
		this.loadingModulesComplete = false;
		this.loadingModulesProgress = 0;
		this.targetLoadingModulesProgress = 0;
		this.loadAudio();
		this.loadUiComponents();
		this.loadUiPause();
		this.loadButtons();
		this.loadUiEvents();
		this.loadFx();
		this.loadTipPoint();
	},

	loadAudio() {
		this.loadModule('Audio');
		this.loadModule('Music');
		this.loadModule('SeTap');
		this.loadModule('SeHold');
		this.loadModule('SeFlick');
		this.loadModule('SeDrag');
	},

	loadButtons() {
		this.loadModule('ButtonPause');
		this.loadModule('ButtonResultRetry');
	},

	loadUiPause() {
		this.loadModule('PauseBackground');
		this.loadModule('ButtonResume');
		this.loadModule('ButtonRetry');
		this.loadModule('ButtonFullscreen');
	},

	loadUiComponents() {
		this.loadModule('Background');
		this.loadModule('ProgressBar');
		this.loadModule('TopCenterHud');
		this.loadModule('TopLeftHud');
		this.loadModule('TopRightHud');
		this.loadModule('Result');
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

	loadTipPoint() {
		this.loadModule('TipPoint');
	},

	loadModule(name) {
		Sunniesnow[name].load().then(
			() => this.loadingModulesProgress++,
			reason => Sunniesnow.Utils.error(`Failed to load Sunniesnow.${name}: ${reason}`, reason)
		);
		this.targetLoadingModulesProgress++;
	},

	updateLoadingModules() {
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
				() => this.loadingPluginsProgress++,
				reason => Sunniesnow.Utils.warn(`Failed to load plugin ${id}: ${reason}`, reason)
			);
		}
	},

	updateLoadingPlugins() {
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
		const element = document.getElementById('loading-progress');
		element.style.display = '';
		element.innerHTML = 'Loading chart';
	},

	load() {
		this.readSettings();
		this.loadingComplete = false;
		if (Sunniesnow.game.settings.levelFile === 'online' && this.chartOnline !== Sunniesnow.game.settings.levelFileOnline) {
			this.loadChart().then(() => {
				Sunniesnow.game.settings.musicSelect = Object.keys(this.loaded.chart.music)[0];
				Sunniesnow.game.settings.chartSelect = Object.keys(this.loaded.chart.charts)[0];
				Sunniesnow.game.initLevel();
				this.loadingChartComplete = true;
				this.loadPlugins();
			}, reason => Sunniesnow.Utils.error(`Failed to load chart: ${reason}`, reason));
		} else {
			Sunniesnow.game.initLevel();
			this.loadingChartComplete = true;
			this.loadPlugins();
		}
		// loadModules() will be called in updateLoadingPlugins().
	},

	updateLoading() {
		if (this.loadingPluginsComplete) {
			this.updateLoadingModules();
		} else if (this.loadingChartComplete) {
			this.updateLoadingPlugins();
		} else {
			this.updateLoadingChart();
		}
	}

};
