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

		// URL string
		background: null,
	},

	// The uploads that reads user input instead of local storage.
	// We maintain this because we cannot write file to <input type="file">.
	// keys: elementId; values: boolean
	manual: {},

	chartLoadListeners: [],

	triggerLoadChart() {
		if (this.loadingChart) {
			return;
		}
		this.loadingChart = true;
		return this.loadChart().then(() => {
			this.loadingChart = false;
			this.onChartLoad();
		}, reason => {
			this.loadingChart = false;
			Sunniesnow.Utils.error('Failed to load chart: ' + reason, reason);
		});
	},
	
	async loadChart() {
		let file;
		let sourceContents;
		switch (this.readRadio('level-file')) {
			case 'online':
				sourceContents = this.readValue('level-file-online');
				if (this.loaded.chart.source === 'online' && this.loaded.chart.sourceContents === sourceContents) {
					return;
				}
				this.clearChart();
				this.loaded.chart.source = 'online';
				this.loaded.chart.sourceContents = sourceContents;
				const url = Sunniesnow.Utils.url(Sunniesnow.Config.chartPrefix, sourceContents, '.ssc');
				try {
					file = await (await fetch(url)).blob();
				} catch (e) {
					Sunniesnow.Utils.error(`Failed to load chart: ${e}`, e);
				}
				break;
			case 'upload':
				sourceContents = this.manual.levelFileUpload ? this.readFile('level-file-upload') : this.saved?.levelFileUpload;
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
			if (type.startsWith('audio/')) {
				this.fillMusicSelect(filename);
				this.loaded.chart.music[filename] = await zipObject.async('arraybuffer');
			} else if (type.startsWith('image/')) {
				this.fillBackgroundSelect(filename);
				const blob = new Blob([await zipObject.async('blob')], {type});
				this.loaded.chart.backgrounds[filename] = blob;
			} else if (type.endsWith('json')) {
				this.fillChartSelect(filename);
				this.loaded.chart.charts[filename] = JSON.parse(await zipObject.async('string'));
			} else {
				Sunniesnow.Utils.warn(`Cannot determine type of ${filename}`)
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
		this.clearSelect('music-select');
		this.clearSelect('chart-select');
		this.clearSelect('background-from-level');
	},

	backgroundUrl() {
		switch (Sunniesnow.game.settings.background) {
			case 'none':
				return null;
			case 'online':
				return Sunniesnow.Utils.url(
					Sunniesnow.Config.backgroundPrefix,
					Sunniesnow.game.settings.backgroundOnline
				);
			case 'from-level':
				const url1 = URL.createObjectURL(this.loaded.chart.backgrounds[Sunniesnow.game.settings.backgroundFromLevel]);
				setTimeout(() => URL.revokeObjectURL(url1), Sunniesnow.Config.objectUrlTimeout*1000);
				return url1;
			case 'upload':
				const url2 = URL.createObjectURL(Sunniesnow.game.settings.backgroundUpload);
				setTimeout(() => URL.revokeObjectURL(url2), Sunniesnow.Config.objectUrlTimeout*1000);
				return url2;
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
			if (!this.manual[`pluginUpload${i}`] && this.saved?.pluginUpload?.[i]) {
				pluginUpload[i] = this.saved.pluginUpload[i];
			} else {
				pluginUpload[i] = this.readFile(`plugin-${i}-upload`);
			}
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
		this.writeRadio('background', 'from-level');
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
			horizontalFlip: this.readCheckbox('horizontal-flip'),
			verticalFlip: this.readCheckbox('vertical-flip'),
			start: this.readValue('start'),
			end: this.readValue('end'),
			resumePreperationTime: this.readValue('resume-preperation-time'),
			beginningPreperationTime: this.readValue('beginning-preperation-time'),

			// control settings
			enableKeyboard: this.readCheckbox('enable-keyboard'),
			keyboardWholeScreen: this.readCheckbox('keyboard-whole-screen'),
			excludeKeys: Sunniesnow.Utils.stringToKeyList(this.readValue('exclude-keys')),
			pauseKeys: Sunniesnow.Utils.stringToKeyList(this.readValue('pause-keys')),
			keyboardPause: this.readCheckbox('keyboard-pause'),
			enableMouse: this.readCheckbox('enable-mouse'),
			mouseWholeScreen: this.readCheckbox('mouse-whole-screen'),
			excludeButtons: Sunniesnow.Utils.stringToButtonList(this.readValue('exclude-buttons')),
			pauseButtons: Sunniesnow.Utils.stringToButtonList(this.readValue('pause-buttons')),
			mousePause: this.readCheckbox('mouse-pause'),
			enableTouchscreen: this.readCheckbox('enable-touchscreen'),
			touchscreenWholeScreen: this.readCheckbox('touchscreen-whole-screen'),
			touchPause: this.readCheckbox('touch-pause'),

			// system settings
			width: this.readValue('width'),
			height: this.readValue('height'),
			fullscreen: this.readCheckbox('fullscreen'),
			debug: this.readCheckbox('debug'),
		}
		this.readPluginSettings();
		this.readUploadSettings();
	},

	async writeSavedSettings() {
		this.saved = JSON.parse(localStorage.getItem('settings'));
		if (!this.saved) {
			return;
		}
		const settings = Object.assign({}, this.saved);
		for (const key of ['levelFileUpload', 'backgroundUpload', 'skinUpload', 'fxUpload', 'seUpload']) {
			if (this.saved[key]) {
				this.saved[key] = await Sunniesnow.Utils.base64ToBlob(this.saved[key]);
				delete settings[key];
			}
		}
		for (const key in this.saved.plugin) {
			if (this.saved.pluginUpload[key]) {
				this.saved.pluginUpload[key] = await Sunniesnow.Utils.base64ToBlob(this.saved.pluginUpload[key]);
			}
		}
		delete settings.pluginUpload;
		await this.writeSettings(settings);
	},

	async writeSettings(settings) {
		this.loadingChart = true;

		const d = property => {
			const result = settings[property];
			delete settings[property];
			return result;
		}
		this.writeRadio('level-file', d('levelFile'));
		this.writeValue('level-file-online', d('levelFileOnline'));
		
		await this.loadChart();

		this.writeValue('music-select', d('musicSelect'));
		this.writeValue('chart-select', d('chartSelect'));

		this.writeRadio('judgement-windows', d('judgementWindows'));
		this.writeValue('note-hit-size', d('noteHitSize'));
		this.writeValue('offset', d('offset') * 1000);

		this.writeValue('speed', d('speed'));
		this.writeValue('note-size', d('noteSize'));
		this.writeRadio('background', d('background'));
		this.writeValue('background-online', d('backgroundOnline'));
		this.writeValue('background-from-level', d('backgroundFromLevel'));
		this.writeValue('background-blur', d('backgroundBlur'));
		this.writeValue('background-brightness', d('backgroundBrightness'));
		this.writeRadio('skin', d('skin'));
		this.writeValue('skin-online', d('skinOnline'));
		this.writeRadio('fx', d('fx'));
		this.writeValue('fx-online', d('fxOnline'));
		this.writeValue('hud-top-center', d('hudTopCenter'));
		this.writeValue('hud-top-left', d('hudTopLeft'));
		this.writeValue('hud-top-right', d('hudTopRight'));

		this.writeRadio('se', d('se'));
		this.writeValue('se-online', d('seOnline'));
		this.writeValue('volume-se', d('volumeSe'));
		this.writeValue('volume-music', d('volumeMusic'));
		this.writeCheckbox('se-with-music', d('seWithMusic'));
		this.writeValue('delay', d('delay') * 1000);

		this.writeCheckbox('autoplay', d('autoplay'));
		this.writeValue('game-speed', d('gameSpeed'));
		this.writeCheckbox('horizontal-flip', d('horizontalFlip'));
		this.writeCheckbox('vertical-flip', d('verticalFlip'));
		this.writeValue('start', d('start'));
		this.writeValue('end', d('end'));
		this.writeValue('resume-preperation-time', d('resumePreperationTime'));
		this.writeValue('beginning-preperation-time', d('beginningPreperationTime'));

		this.writeCheckbox('enable-keyboard', d('enableKeyboard'));
		this.writeCheckbox('keyboard-whole-screen', d('keyboardWholeScreen'));
		this.writeValue('exclude-keys', Sunniesnow.Utils.keyListToString(d('excludeKeys')));
		this.writeValue('pause-keys', Sunniesnow.Utils.keyListToString(d('pauseKeys')));
		this.writeCheckbox('keyboard-pause', d('keyboardPause'));
		this.writeCheckbox('enable-mouse', d('enableMouse'));
		this.writeCheckbox('mouse-whole-screen', d('mouseWholeScreen'));
		this.writeValue('exclude-buttons', Sunniesnow.Utils.buttonListToString(d('excludeButtons')));
		this.writeValue('pause-buttons', Sunniesnow.Utils.buttonListToString(d('pauseButtons')));
		this.writeCheckbox('mouse-pause', d('mousePause'));
		this.writeCheckbox('enable-touchscreen', d('enableTouchscreen'));
		this.writeCheckbox('touchscreen-whole-screen', d('touchscreenWholeScreen'));
		this.writeCheckbox('touch-pause', d('touchPause'));

		const width = d('width');
		const height = d('height');
		this.writeValue('width', width);
		this.writeValue('height', height);
		const canvas = document.getElementById('main-canvas');
		if (width) {
			canvas.width = width;
		}
		if (height) {
			canvas.height = height;
		}
		this.writeCheckbox('fullscreen', d('fullscreen'));
		this.writeCheckbox('debug', d('debug'));

		const plugin = d('plugin');
		const pluginOnline = d('pluginOnline');
		if (plugin) {
			Sunniesnow.Plugin.clearDomElements();
			for (const key in plugin) {
				Sunniesnow.Plugin.addDomElement(key);
				this.writeRadio(`plugin-${key}`, plugin[key]);
			}
			if (pluginOnline) {
				for (const key in plugin) {
					this.writeValue(`plugin-${key}-online`, pluginOnline[key]);
				}
			}
		} else if (pluginOnline) {
			Sunniesnow.warn('plugin-online settings are ignored because plugin settings are not set');
		}

		for (const property in settings) {
			console.warn(`Unknown settings item ${property}`);
		}

		this.loadingChart = false;
		this.onChartLoad();
	},

	readUploadSettings() {
		if (!this.saved) {
			return;
		}
		for (const key of ['levelFileUpload', 'backgroundUpload', 'skinUpload', 'fxUpload', 'seUpload']) {
			if (!this.manual[key] && this.saved[key]) {
				Sunniesnow.game.settings[key] = this.saved[key];
			}
		}
		for (const key in this.saved.plugin) {
			if (!this.manual[`pluginUpload${key}`] && this.saved.pluginUpload[key]) {
				Sunniesnow.game.settings.pluginUpload[key] = this.saved.pluginUpload[key];
			}
		}
	},

	async saveSettings() {
		this.saved = Object.assign({}, Sunniesnow.game.settings);
		const settings = Object.assign({}, this.saved);
		for (const key of ['levelFileUpload', 'backgroundUpload', 'skinUpload', 'fxUpload', 'seUpload']) {
			if (this.saved[key]) {
				settings[key] = await Sunniesnow.Utils.blobToBase64(this.saved[key]);
			}
		}
		for (const key in this.saved.plugin) {
			if (this.saved.pluginUpload[key]) {
				settings.pluginUpload[key] = await Sunniesnow.Utils.blobToBase64(this.saved.pluginUpload[key]);
			}
		}
		localStorage.setItem('settings', JSON.stringify(settings));
	},

	markManual(element) {
		this.manual[Sunniesnow.Utils.slugToCamel(element.id)] = true;
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
		const element = document.getElementById(id);
		if (element.type !== 'number') {
			return element.type === 'range' ? Number(element.value) : element.value;
		}
		const value = Number(element.value);
		if (element.min !== '' && value < Number(element.min)) {
			return Number(element.min);
		}
		if (element.max !== '' && value > Number(element.max)) {
			return Number(element.max);
		}
		return value;
	},

	readFile(id) {
		return document.getElementById(id).files[0];
	},

	writeCheckbox(id, value) {
		if (value !== undefined) {
			document.getElementById(id).checked = value === true || value === 'true';
		}
	},

	writeRadio(name, value) {
		if (value === undefined) {
			return;
		}
		const radios = document.getElementsByName(name);
		for (const radio of radios) {
			if (radio.value === value) {
				if (!radio.checked) {
					radio.checked = true;
					radio.dispatchEvent(new Event('change'));
				}
				return;
			}
		}
	},

	writeValue(id, value) {
		if (value !== undefined && !(typeof value === 'number' && isNaN(value))) {
			document.getElementById(id).value = value;
		}
	},

	loadModules() {
		this.loadingModulesComplete = false;
		this.loadingModulesProgress = 0;
		this.targetLoadingModulesProgress = 0;
		this.modulesQueue = [];
		this.loadAudio();
		this.loadTouch();
		this.loadChartModule();
		this.loadUiComponents();
		this.loadUiPause();
		this.loadButtons();
		this.loadUiEvents();
		this.loadFx();
		this.loadTipPoint();
		(async () => {
			while (this.modulesQueue.length > 0) {
				await this.modulesQueue.shift()();
			}
		})();
	},

	loadAudio() {
		this.loadModule('Audio');
		this.loadModule('Music');
		this.loadModule('SeTap');
		this.loadModule('SeHold');
		this.loadModule('SeFlick');
		this.loadModule('SeDrag');
	},

	loadTouch() {
		this.loadModule('TouchManager');
	},

	loadChartModule() {
		this.loadModule('Chart');
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
		this.modulesQueue.push(() => Sunniesnow[name].load().then(
			() => this.loadingModulesProgress++,
			reason => Sunniesnow.Utils.error(`Failed to load Sunniesnow.${name}: ${reason}`, reason)
		));
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
		if (Sunniesnow.game.settings.levelFile === 'online' && this.loaded.chart.sourceContents !== Sunniesnow.game.settings.levelFileOnline) {
			this.loadChart().then(() => {
				Sunniesnow.game.settings.musicSelect = Object.keys(this.loaded.chart.music)[0];
				Sunniesnow.game.settings.chartSelect = Object.keys(this.loaded.chart.charts)[0];
				this.saveSettings();
				this.loadingChartComplete = true;
				this.loadPlugins();
			}, reason => Sunniesnow.Utils.error(`Failed to load chart: ${reason}`, reason));
		} else {
			this.saveSettings();
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
	}

};
