Sunniesnow.Dom = {

	// The uploads that reads user input instead of local storage.
	// We maintain this because we cannot write file to <input type="file">.
	// keys: elementId; values: boolean
	manual: {},

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
			if (!this.manual[`plugin${i}Upload`] && this.saved?.pluginUpload?.[i]) {
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
		option.defaultSelected = select.childElementCount === 0;
		select.appendChild(option);
		return select;
	},

	async untilSelectsLoaded() {
		await Promise.all([
			Sunniesnow.Utils.untilLoaded('music-select'),
			Sunniesnow.Utils.untilLoaded('chart-select'),
			Sunniesnow.Utils.untilLoaded('background-from-level')
		]);
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

	tryAvoidingNoBackground() {
		if (this.readRadio('background') === 'from-level' && !this.readValue('background-from-level')) {
			this.writeRadio('background', 'online');
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
			text = marked.parse(text, { mangle: false, headerIds: false });
			element.innerHTML = DOMPurify.sanitize(text);
		} else {
			const pre = document.createElement('pre');
			pre.innerText = text;
			element.appendChild(pre);
		}
		document.getElementById('level-readme').appendChild(details);
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
			noEarlyDrag: this.readCheckbox('no-early-drag'),
			directionInsensitiveFlick: this.readCheckbox('direction-insensitive-flick'),
			lockingHold: this.readCheckbox('locking-hold'),

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
			touchEffects: this.readCheckbox('touch-effects'),
			reverseNoteOrder: this.readCheckbox('reverse-note-order'),
			hideTipPoints: this.readCheckbox('hide-tip-points'),
			hideFxInFront: this.readCheckbox('hide-fx-in-front'),

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
			resumePreparationTime: this.readValue('resume-preparation-time'),
			beginningPreparationTime: this.readValue('beginning-preparation-time'),
			notesPriorityOverPause: this.readCheckbox('notes-priority-over-pause'),

			// control settings
			enableKeyboard: this.readCheckbox('enable-keyboard'),
			keyboardWholeScreen: this.readCheckbox('keyboard-whole-screen'),
			excludeKeys: this.readKeyList('exclude-keys'),
			pauseKeys: this.readKeyList('pause-keys'),
			keyboardPause: this.readCheckbox('keyboard-pause'),
			enableMouse: this.readCheckbox('enable-mouse'),
			mouseWholeScreen: this.readCheckbox('mouse-whole-screen'),
			excludeButtons: this.readButtonList('exclude-buttons'),
			pauseButtons: this.readButtonList('pause-buttons'),
			mousePause: this.readCheckbox('mouse-pause'),
			enableTouchscreen: this.readCheckbox('enable-touchscreen'),
			touchscreenWholeScreen: this.readCheckbox('touchscreen-whole-screen'),
			touchPause: this.readCheckbox('touch-pause'),

			// system settings
			width: this.readValue('width'),
			height: this.readValue('height'),
			fullscreenOnStart: this.readCheckbox('fullscreen-on-start'),
			floatAsFullscreen: this.readCheckbox('float-as-fullscreen'),
			renderer: this.readRadio('renderer'),
			antialias: this.readCheckbox('antialias'),
			powerPreference: this.readRadio('power-preference'),
			debug: this.readCheckbox('debug'),
			suppressWarnings: this.readCheckbox('suppress-warnings')
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
		Sunniesnow.Loader.loadingChart = true;

		const d = property => {
			const result = settings[property];
			delete settings[property];
			return result;
		}
		this.writeRadio('level-file', d('levelFile'));
		this.writeValue('level-file-online', d('levelFileOnline'));

		await Sunniesnow.Loader.loadChart();

		this.writeValue('music-select', d('musicSelect'));
		this.writeValue('chart-select', d('chartSelect'));

		this.writeRadio('judgement-windows', d('judgementWindows'));
		this.writeValue('note-hit-size', d('noteHitSize'));
		this.writeValue('offset', d('offset') * 1000);
		this.writeCheckbox('no-early-drag', d('noEarlyDrag'));
		this.writeCheckbox('direction-insensitive-flick', d('directionInsensitiveFlick'));
		this.writeCheckbox('locking-hold', d('lockingHold'));

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
		this.writeCheckbox('touch-effects', d('touchEffects'));
		this.writeCheckbox('reverse-note-order', d('reverseNoteOrder'));
		this.writeCheckbox('hide-tip-points', d('hideTipPoints'));
		this.writeCheckbox('hide-fx-in-front', d('hideFxInFront'));

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
		this.writeValue('resume-preparation-time', d('resumePreparationTime'));
		this.writeValue('beginning-preparation-time', d('beginningPreparationTime'));
		this.writeCheckbox('notes-priority-over-pause', d('notesPriorityOverPause'));

		this.writeCheckbox('enable-keyboard', d('enableKeyboard'));
		this.writeCheckbox('keyboard-whole-screen', d('keyboardWholeScreen'));
		this.writeKeyList('exclude-keys', d('excludeKeys'));
		this.writeKeyList('pause-keys', d('pauseKeys'));
		this.writeCheckbox('keyboard-pause', d('keyboardPause'));
		this.writeCheckbox('enable-mouse', d('enableMouse'));
		this.writeCheckbox('mouse-whole-screen', d('mouseWholeScreen'));
		this.writeButtonList('exclude-buttons', d('excludeButtons'));
		this.writeButtonList('pause-buttons', d('pauseButtons'));
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
		this.writeRadio('renderer', d('renderer'));
		this.writeCheckbox('antialias', d('antialias'));
		this.writeRadio('power-preference', d('powerPreference'));
		this.writeCheckbox('fullscreen-on-start', d('fullscreenOnStart'));
		this.writeCheckbox('float-as-fullscreen', d('floatAsFullscreen'));
		this.writeCheckbox('debug', d('debug'));
		this.writeCheckbox('suppress-warnings', d('suppressWarnings'));

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

		Sunniesnow.Loader.loadingChart = false;
		Sunniesnow.Loader.onChartLoad();
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

	actualLevelFileUpload() {
		return this.manual.levelFileUpload ? this.readFile('level-file-upload') : Sunniesnow.game?.settings.levelFileUpload ?? this.saved?.levelFileUpload;
	},

	markManual(elementId) {
		this.manual[Sunniesnow.Utils.slugToCamel(elementId)] = true;
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
		try {
			localStorage.setItem('settings', JSON.stringify(settings));
		} catch (e) {
			Sunniesnow.Utils.warn(`Failed to save settings: ${e.message ? e.message : e}`);
		}
	},

	deleteSavedSettings() {
		localStorage.removeItem('settings');
	},

	exportSavedSettings() {
		const text = localStorage.getItem('settings');
		if (!text) {
			Sunniesnow.warn('No saved settings to export');
			return;
		}
		const url = Sunniesnow.ObjectUrl.createPersistent(new Blob([text], {type: 'application/json'}));
		const a = document.createElement('a');
		a.href = url;
		a.download = 'settings.json';
		a.style.display = 'none';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		Sunniesnow.ObjectUrl.revoke(url);
	},

	async importSettings() {
		const file = this.readFile('import-settings');
		if (!file) {
			return;
		}
		localStorage.setItem('settings', await file.text());
		this.writeSavedSettings();
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

	readKeyList(id) {
		return Sunniesnow.Utils.stringToKeyList(this.readValue(id));
	},

	readButtonList(id) {
		return Sunniesnow.Utils.stringToButtonList(this.readValue(id));
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

	writeKeyList(id, value) {
		if (Array.isArray(value)) {
			value = Sunniesnow.Utils.keyListToString(value);
		}
		this.writeValue(id, value);
	},

	writeButtonList(id, value) {
		if (Array.isArray(value)) {
			value = Sunniesnow.Utils.buttonListToString(value);
		}
		this.writeValue(id, value);
	},

	setDeviceDependentDefaults() {
		this.setResolution();
		this.setRenderer();
		this.setFullscreenMethod();
	},

	setResolution() {
		const [height, width] = Sunniesnow.Utils.minmax(screen.width * devicePixelRatio, screen.height * devicePixelRatio);
		this.writeValue('width', width);
		this.writeValue('height', height);
		const canvas = document.getElementById('main-canvas');
		canvas.width = width;
		canvas.height = height;
	},

	setRenderer() {
		if (!Sunniesnow.Utils.supportsGl()) {
			this.writeRadio('renderer', 'canvas');
		}
	},

	setFullscreenMethod() {
		if (Sunniesnow.Utils.isMobileSafari()) {
			this.writeCheckbox('float-as-fullscreen', true);
		}
	},

	associateRadio(radioId, inputId) {
		const radio = document.getElementById(radioId);
		const radios = document.getElementsByName(radio.name);
		const input = document.getElementById(inputId);
		const listener = () => input.disabled = !radio.checked;
		for (const otherRadio of radios) {
			otherRadio.addEventListener('change', listener);
		}
		listener();
	},

	associateRange(rangeId, valueId) {
		const range = document.getElementById(rangeId);
		const value = document.getElementById(valueId);
		const listener = () => value.innerText = range.value;
		range.addEventListener('input', listener);
		listener();
	},

	setTextInput(elementId) {
		const element = document.getElementById(elementId);
		element.spellcheck = false;
		element.autocomplete = 'off';
		element.autocorrect = 'off';
		element.autocapitalize = 'none';
	},

	setTextInputs() {
		this.setTextInput('level-file-online');
		this.setTextInput('background-online');
		this.setTextInput('skin-online');
		this.setTextInput('fx-online');
		this.setTextInput('se-online');
		this.setTextInput('exclude-keys');
		this.setTextInput('pause-keys');
		this.setTextInput('exclude-buttons');
		this.setTextInput('pause-buttons');
	},

	associateDomElements() {
		this.associateRadio('level-file-online-radio', 'level-file-online');
		this.associateRadio('level-file-online-radio', 'level-file-online-button');
		this.associateRadio('level-file-upload-radio', 'level-file-upload');
		this.associateRadio('background-online-radio', 'background-online');
		this.associateRadio('background-from-level-radio', 'background-from-level');
		this.associateRadio('background-upload-radio', 'background-upload');
		this.associateRadio('skin-online-radio', 'skin-online');
		this.associateRadio('skin-upload-radio', 'skin-upload');
		this.associateRadio('fx-online-radio', 'fx-online');
		this.associateRadio('fx-upload-radio', 'fx-upload');
		this.associateRadio('se-online-radio', 'se-online');
		this.associateRadio('se-upload-radio', 'se-upload');
		this.associateRadio('renderer-webgl-radio', 'antialias');
		this.associateRadio('renderer-webgl-radio', 'power-preference-default-radio');
		this.associateRadio('renderer-webgl-radio', 'power-preference-low-power-radio');
		this.associateRadio('renderer-webgl-radio', 'power-preference-high-performance-radio');
		this.associateRange('volume-se', 'volume-se-value');
		this.associateRange('volume-music', 'volume-music-value');
		this.associateRange('background-blur', 'background-blur-value');
		this.associateRange('background-brightness', 'background-brightness-value');
	},

	clearDownloadingProgresses() {
		document.getElementById('level-file-downloading').innerHTML = '';
		document.getElementById('background-downloading').innerHTML = '';
		document.getElementById('skin-downloading').innerHTML = '';
		document.getElementById('fx-downloading').innerHTML = '';
		document.getElementById('se-downloading').innerHTML = '';
		for (const pluginId in Sunniesnow.Plugin.plugins) {
			if (typeof pluginId === 'number') {
				document.getElementById(`plugin-${pluginId}-downloading`).innerHTML = '';
			}
		}
	},

	addEventListeners() {
		document.getElementById('level-file-online').addEventListener('keydown', event => {
			if (event.key === 'Enter') {
				document.getElementById('level-file-online-button').click();
			}
		});
	},

	async preprocess() {
		this.addEventListeners();
		this.setTextInputs();
		this.associateDomElements();
		this.setDeviceDependentDefaults();
		await this.writeSavedSettings();
	},

	async triggerPreprocess() {
		const script = document.createElement('script');
		script.textContent = 'Sunniesnow.Preprocess.run();';
		document.body.appendChild(script);
		await Sunniesnow.Utils.untilLoaded(document.body);
		script.remove();
	}
};
