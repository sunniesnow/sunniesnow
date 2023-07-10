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
			// values: URL strings
			backgrounds: {}
		},

		// URL string
		background: null,
	},
	
	loadChart(file) {
		this.clearChart();
		if (!file) {
			return;
		}
		JSZip.loadAsync(file).then(zip => {
			zip.forEach((filename, file) => {
				const type = mime.getType(filename);
				if (type.startsWith('audio/')) {
					this.fillMusicSelect(filename);
					file.async('arraybuffer').then(buffer => this.loaded.chart.music[filename] = buffer);
				} else if (type.startsWith('image/')) {
					this.fillBackgroundSelect(filename);
					file.async('blob').then(blob => this.loaded.chart.backgrounds[filename] = URL.createObjectURL(blob));
				} else if (type.endsWith('json')) {
					this.fillChartSelect(filename);
					file.async('string').then(string => this.loaded.chart.charts[filename] = JSON.parse(string));
				}
			});
		})
	},
	
	clearChart() {
		this.loaded.chart.charts = {};
		this.loaded.chart.music = {};
		this.loaded.chart.backgrounds = {};
		this.clearSelect('music-select');
		this.clearSelect('chart-select');
		this.clearSelect('background-from-level');
	},

	loadBackground(file) {
		this.loaded.background = URL.createObjectURL(file);
	},

	loadSkin(file) {
		Sunniesnow.Plugin.load('skin', file);
	},

	loadFx(file) {
		Sunniesnow.Plugin.load('fx', file);
	},

	loadSe(file) {
		Sunniesnow.Plugin.load('se', file);
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

	readSettings(game) {
		game.settings = {
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
		for (const id in Sunniesnow.Plugin.plugins) {
			this.targetLoadingPluginsProgress++;
			Sunniesnow.Plugin.plugins[id].loadAndApply().then(
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

	load() {
		this.loadingComplete = false;
		this.loadPlugins();
		// loadModules() will be called in updateLoadingPlugins().
	},

	updateLoading() {
		if (this.loadingPluginsComplete) {
			this.updateLoadingModules();
		} else {
			this.updateLoadingPlugins();
		}
	}

};
