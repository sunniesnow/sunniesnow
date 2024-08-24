Sunniesnow.Settings = {

	// The uploads that reads user input instead of local storage.
	// We maintain this because we cannot write file to <input type="file">.
	// keys: elementId; values: boolean
	manual: {},

	toFill: {
		chart: null,
		music: null,
		background: null
	},

	clearToFill() {
		this.toFill.chart = null;
		this.toFill.music = null;
		this.toFill.background = null;
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
			if (!this.manual[`plugin${i}Upload`] && this.saved?.pluginUpload?.[i]) {
				pluginUpload[i] = this.saved.pluginUpload[i];
			} else {
				pluginUpload[i] = this.readFile(`plugin-${i}-upload`);
			}
		}
	},

	readCustomJudgementWindowsSettings() {
		for (const noteType of ['tap', 'drag', 'flick', 'hold']) {
			for (const judgement of ['bad', 'good', 'perfect']) {
				for (const earlyLate of ['early', 'late']) {
					const id = `judgement-windows-custom-${noteType}-${earlyLate}-${judgement}`;
					Sunniesnow.game.settings[Sunniesnow.Utils.slugToCamel(id)] = this.readValue(id) / 1000;
				}
			}
		}
		Sunniesnow.game.settings.judgementWindowsCustomHoldEndEarlyGood = this.readValue('judgement-windows-custom-hold-end-early-good');
		Sunniesnow.game.settings.judgementWindowsCustomHoldEndEarlyPerfect = this.readValue('judgement-windows-custom-hold-end-early-perfect');
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
		if (filename === this.toFill.music) {
			select.value = filename;
		}
	},

	fillChartSelect(filename) {
		const select = this.fillSelect('chart-select', filename);
		select.disabled = false;
		if (filename === this.toFill.chart) {
			select.value = filename;
		}
	},

	fillBackgroundSelect(filename) {
		// this.writeRadio('background', 'from-level');
		this.fillSelect('background-from-level', filename);
		if (filename === this.toFill.background) {
			this.writeValue('background-from-level', filename);
		}
	},

	tryAvoidingNoBackground() {
		if (this.readRadio('background') === 'from-level' && !this.readValue('background-from-level')) {
			this.writeRadio('background', 'online');
			if (Sunniesnow.game?.settings) {
				Sunniesnow.game.settings.background = 'online';
			}
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
			lyrica5: this.readCheckbox('lyrica-5'),
			noEarlyDrag: this.readCheckbox('no-early-drag'),
			lockingHold: this.readCheckbox('locking-hold'),
			minFlickDistance: this.readValue('min-flick-distance'),
			maxFlickDistance: this.readValue('max-flick-distance'),
			flickAngleRange: this.readValue('flick-angle-range') / 180 * Math.PI,

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
			doubleLineTap: this.readCheckbox('double-line-tap'),
			doubleLineHold: this.readCheckbox('double-line-hold'),
			doubleLineDrag: this.readCheckbox('double-line-drag'),
			doubleLineFlick: this.readCheckbox('double-line-flick'),
			hideFxInFront: this.readCheckbox('hide-fx-in-front'),
			hideFxPerfect: this.readCheckbox('hide-fx-perfect'),
			hideFxHoldStart: this.readCheckbox('hide-fx-hold-start'),
			alwaysUpdateFx: this.readCheckbox('always-update-fx'),
			scrollJudgementLine: this.readValue('scroll-judgement-line'),
			scrollDistance: this.readValue('scroll-distance'),
			hideTipPoints: this.readCheckbox('hide-tip-points'),
			hideNotes: this.readCheckbox('hide-notes'),
			hideCircles: this.readCheckbox('hide-circles'),
			hideBgNotes: this.readCheckbox('hide-bg-notes'),
			hideFx: this.readCheckbox('hide-fx'),
			hideBgPattern: this.readCheckbox('hide-bg-pattern'),
			fadingStart: this.readValue('fading-start'),
			fadingDuration: this.readValue('fading-duration'),
			touchEffects: this.readCheckbox('touch-effects'),
			reverseNoteOrder: this.readCheckbox('reverse-note-order'),
			circleMovesWithNote: this.readCheckbox('circle-moves-with-note'),

			// audio settings
			se: this.readRadio('se'),
			seOnline: this.readValue('se-online'),
			seUpload: this.readFile('se-upload'),
			volumeSe: this.readValue('volume-se'),
			volumeMusic: this.readValue('volume-music'),
			seWithMusic: this.readCheckbox('se-with-music'),
			delay: this.readValue('delay') / 1000,
			latencyHint: this.readRadio('latency-hint'),
			latencyHintValue: this.readValue('latency-hint-value') / 1000,

			// haptic settings
			vibrationWithMusic: this.readCheckbox('vibration-with-music'),
			vibrationDelay: this.readValue('vibration-delay') / 1000,
			tapVibrationTime: this.readValue('tap-vibration-time'),
			dragVibrationTime: this.readValue('drag-vibration-time'),
			flickVibrationTime: this.readValue('flick-vibration-time'),
			holdVibrationTime: this.readValue('hold-vibration-time'),
			holdVibrationPeriod: this.readValue('hold-vibration-period'),
			holdVibrationDutyCycle: this.readValue('hold-vibration-duty-cycle'),

			// game settings
			scroll: this.readCheckbox('scroll'),
			autoplay: this.readCheckbox('autoplay'),
			progressAdjustable: this.readCheckbox('progress-adjustable'),
			chartOffset: this.readValue('chart-offset') / 1000,
			gameSpeed: this.readValue('game-speed'),
			horizontalFlip: this.readCheckbox('horizontal-flip'),
			verticalFlip: this.readCheckbox('vertical-flip'),
			start: this.readValue('start'),
			end: this.readValue('end'),
			resumePreparationTime: this.readValue('resume-preparation-time'),
			beginningPreparationTime: this.readValue('beginning-preparation-time'),
			pauseDoubleTime: this.readValue('pause-double-time'),
			notesPriorityOverPause: this.readCheckbox('notes-priority-over-pause'),
			pauseFullscreen: this.readCheckbox('pause-fullscreen'),
			pauseBlur: this.readCheckbox('pause-blur'),
			hidePauseUi: this.readCheckbox('hide-pause-ui'),
			pauseFinish: this.readCheckbox('pause-finish'),
			secondPause: this.readRadio('second-pause'),

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

			// profile settings
			nickname: this.readValue('nickname'),
			avatar: this.readRadio('avatar'),
			avatarOnline: this.readValue('avatar-online'),
			avatarUpload: this.readFile('avatar-upload'),
			avatarGravatar: this.readValue('avatar-gravatar'),

			// charting helper settings
			sscharter: this.readCheckbox('sscharter'),
			sscharterLiveRestart: this.readCheckbox('sscharter-live-restart'),

			// system settings
			width: this.readValue('width'),
			height: this.readValue('height'),
			popup: this.readCheckbox('popup'),
			fullscreenOnStart: this.readCheckbox('fullscreen-on-start'),
			floatAsFullscreen: this.readCheckbox('float-as-fullscreen'),
			avoidDownloadingFonts: this.readCheckbox('avoid-downloading-fonts'),
			contextMenuPlay: this.readCheckbox('context-menu-play'),
			contextMenuPause: this.readCheckbox('context-menu-pause'),
			contextMenuNoModifier: this.readCheckbox('context-menu-no-modifier'),
			renderer: this.readRadio('renderer'),
			antialias: this.readCheckbox('antialias'),
			powerPreference: this.readRadio('power-preference'),
			debug: this.readCheckbox('debug'),
			hideDebugExceptPause: this.readCheckbox('hide-debug-except-pause'),
			suppressWarnings: this.readCheckbox('suppress-warnings')
		}
		this.readCustomJudgementWindowsSettings();
		this.readPluginSettings();
		this.readUploadSettings();
	},

	async writeSavedSettings() {
		this.saved = JSON.parse(localStorage.getItem('settings'));
		if (!this.saved) {
			return;
		}
		const settings = Object.assign({}, this.saved);
		for (const key of ['levelFileUpload', 'backgroundUpload', 'skinUpload', 'fxUpload', 'seUpload', 'avatarUpload']) {
			if (key in this.saved) {
				this.saved[key] = await Sunniesnow.Utils.base64ToBlob(this.saved[key]);
				delete settings[key];
			}
		}
		for (const key in this.saved.plugin) {
			if (key in this.saved.pluginUpload) {
				this.saved.pluginUpload[key] = await Sunniesnow.Utils.base64ToBlob(this.saved.pluginUpload[key]);
			}
		}
		delete settings.pluginUpload;
		delete settings.chartOffset; // use writeSavedChartOffset() instead
		await this.writeSettings(settings);
	},

	async writeSettings(settings) {
		const d = property => {
			const result = settings[property];
			delete settings[property];
			return result;
		}
		this.writeRadio('level-file', d('levelFile'));
		this.writeValue('level-file-online', d('levelFileOnline'));

		const musicToFill = d('musicSelect');
		this.writeValue('music-select', musicToFill);
		if (musicToFill && this.readValue('music-select') !== musicToFill) {
			this.toFill.music = musicToFill;
		}
		const chartToFill = d('chartSelect');
		this.writeValue('chart-select', chartToFill);
		if (chartToFill && this.readValue('chart-select') !== chartToFill) {
			this.toFill.chart = chartToFill;
		}

		this.writeRadio('judgement-windows', d('judgementWindows'));
		this.writeValue('note-hit-size', d('noteHitSize'));
		this.writeValue('offset', d('offset') * 1000);
		this.writeCheckbox('lyrica-5', d('lyrica5'));
		this.writeCheckbox('no-early-drag', d('noEarlyDrag'));
		this.writeCheckbox('locking-hold', d('lockingHold'));
		this.writeValue('min-flick-distance', d('minFlickDistance'));
		this.writeValue('max-flick-distance', d('maxFlickDistance'));
		this.writeValue('flick-angle-range', d('flickAngleRange') / Math.PI * 180);

		this.writeValue('speed', d('speed'));
		this.writeValue('note-size', d('noteSize'));
		this.writeRadio('background', d('background'));
		this.writeValue('background-online', d('backgroundOnline'));
		const backgroundToFill = d('backgroundFromLevel');
		this.writeValue('background-from-level', backgroundToFill);
		if (backgroundToFill && this.readValue('background-from-level') !== backgroundToFill) {
			this.toFill.background = backgroundToFill;
		}
		this.writeValue('background-blur', d('backgroundBlur'));
		this.writeValue('background-brightness', d('backgroundBrightness'));
		this.writeRadio('skin', d('skin'));
		this.writeValue('skin-online', d('skinOnline'));
		this.writeRadio('fx', d('fx'));
		this.writeValue('fx-online', d('fxOnline'));
		this.writeValue('hud-top-center', d('hudTopCenter'));
		this.writeValue('hud-top-left', d('hudTopLeft'));
		this.writeValue('hud-top-right', d('hudTopRight'));
		this.writeCheckbox('double-line-tap', d('doubleLineTap'));
		this.writeCheckbox('double-line-hold', d('doubleLineHold'));
		this.writeCheckbox('double-line-drag', d('doubleLineDrag'));
		this.writeCheckbox('double-line-flick', d('doubleLineFlick'));
		this.writeCheckbox('hide-fx-in-front', d('hideFxInFront'));
		this.writeCheckbox('hide-fx-perfect', d('hideFxPerfect'));
		this.writeCheckbox('hide-fx-hold-start', d('hideFxHoldStart'));
		this.writeCheckbox('always-update-fx', d('alwaysUpdateFx'));
		this.writeValue('scroll-judgement-line', d('scrollJudgementLine'));
		this.writeValue('scroll-distance', d('scrollDistance'));
		this.writeCheckbox('hide-tip-points', d('hideTipPoints'));
		this.writeCheckbox('hide-notes', d('hideNotes'));
		this.writeCheckbox('hide-circles', d('hideCircles'));
		this.writeCheckbox('hide-bg-notes', d('hideBgNotes'));
		this.writeCheckbox('hide-fx', d('hideFx'));
		this.writeCheckbox('hide-bg-pattern', d('hideBgPattern'));
		this.writeValue('fading-start', d('fadingStart'));
		this.writeValue('fading-duration', d('fadingDuration'));
		this.writeCheckbox('touch-effects', d('touchEffects'));
		this.writeCheckbox('reverse-note-order', d('reverseNoteOrder'));
		this.writeCheckbox('circle-moves-with-note', d('circleMovesWithNote'));

		this.writeRadio('se', d('se'));
		this.writeValue('se-online', d('seOnline'));
		this.writeValue('volume-se', d('volumeSe'));
		this.writeValue('volume-music', d('volumeMusic'));
		this.writeCheckbox('se-with-music', d('seWithMusic'));
		this.writeValue('delay', d('delay') * 1000);
		this.writeRadio('latency-hint', d('latencyHint'));
		this.writeValue('latency-hint-value', d('latencyHintValue') * 1000);

		this.writeCheckbox('vibration-with-music', d('vibrationWithMusic'));
		this.writeValue('vibration-delay', d('vibrationDelay') * 1000);
		this.writeValue('tap-vibration-time', d('tapVibrationTime'));
		this.writeValue('drag-vibration-time', d('dragVibrationTime'));
		this.writeValue('flick-vibration-time', d('flickVibrationTime'));
		this.writeValue('hold-vibration-time', d('holdVibrationTime'));
		this.writeValue('hold-vibration-period', d('holdVibrationPeriod'));
		this.writeValue('hold-vibration-duty-cycle', d('holdVibrationDutyCycle'));

		this.writeCheckbox('scroll', d('scroll'));
		this.writeCheckbox('autoplay', d('autoplay'));
		this.writeCheckbox('progress-adjustable', d('progressAdjustable'));
		this.writeValue('chart-offset', d('chartOffset'));
		this.writeValue('game-speed', d('gameSpeed'));
		this.writeCheckbox('horizontal-flip', d('horizontalFlip'));
		this.writeCheckbox('vertical-flip', d('verticalFlip'));
		this.writeValue('start', d('start'));
		this.writeValue('end', d('end'));
		this.writeValue('resume-preparation-time', d('resumePreparationTime'));
		this.writeValue('beginning-preparation-time', d('beginningPreparationTime'));
		this.writeValue('pause-double-time', d('pauseDoubleTime'));
		this.writeCheckbox('notes-priority-over-pause', d('notesPriorityOverPause'));
		this.writeCheckbox('pause-fullscreen', d('pauseFullscreen'));
		this.writeCheckbox('pause-blur', d('pauseBlur'));
		this.writeCheckbox('hide-pause-ui', d('hidePauseUi'));
		this.writeCheckbox('pause-finish', d('pauseFinish'));
		this.writeRadio('second-pause', d('secondPause'));

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

		this.writeValue('nickname', d('nickname'));
		this.writeRadio('avatar', d('avatar'));
		this.writeValue('avatar-online', d('avatarOnline'));
		this.writeValue('avatar-gravatar', d('avatarGravatar'));

		this.writeCheckbox('sscharter', d('sscharter'));
		this.writeCheckbox('sscharter-live-restart', d('sscharterLiveRestart'));

		this.writeValue('width', d('width'));
		this.writeValue('height', d('height'));
		this.writeCheckbox('popup', d('popup'));
		this.writeRadio('renderer', d('renderer'));
		this.writeCheckbox('antialias', d('antialias'));
		this.writeRadio('power-preference', d('powerPreference'));
		this.writeCheckbox('fullscreen-on-start', d('fullscreenOnStart'));
		this.writeCheckbox('float-as-fullscreen', d('floatAsFullscreen'));
		this.writeCheckbox('avoid-downloading-fonts', d('avoidDownloadingFonts'));
		this.writeCheckbox('context-menu-play', d('contextMenuPlay'));
		this.writeCheckbox('context-menu-pause', d('contextMenuPause'));
		this.writeCheckbox('context-menu-no-modifier', d('contextMenuNoModifier'));
		this.writeCheckbox('debug', d('debug'));
		this.writeCheckbox('hide-debug-except-pause', d('hideDebugExceptPause'));
		this.writeCheckbox('suppress-warnings', d('suppressWarnings'));

		for (const noteType of ['tap', 'drag', 'hold', 'flick']) {
			for (const judgement of ['bad', 'good', 'perfect']) {
				for (const earlyLate of ['early', 'late']) {
					const id = `judgement-windows-custom-${noteType}-${earlyLate}-${judgement}`;
					this.writeValue(id, d(Sunniesnow.Utils.slugToCamel(id)) * 1000);
				}
			}
		}
		this.writeValue('judgement-windows-custom-hold-end-early-good', d('judgementWindowsCustomHoldEndEarlyGood'));
		this.writeValue('judgement-windows-custom-hold-end-early-perfect', d('judgementWindowsCustomHoldEndEarlyPerfect'));

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
			Sunniesnow.Logs.warn('plugin-online settings are ignored because plugin settings are not set');
		}

		for (const property in settings) {
			Sunniesnow.Logs.warn(`Unknown settings item ${property}`);
		}
	},

	saveChartOffset(key) {
		let chartOffsets = JSON.parse(localStorage.getItem('chartOffsets'));
		if (!chartOffsets) {
			chartOffsets = {};
		}
		chartOffsets[key] = this.readValue('chart-offset');
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
		this.writeValue('chart-offset', chartOffsets[key]);
	},

	deleteSavedChartOffsets() {
		localStorage.removeItem('chartOffsets');
	},

	readUploadSettings() {
		if (!this.saved) {
			return;
		}
		for (const key of ['levelFileUpload', 'backgroundUpload', 'skinUpload', 'fxUpload', 'seUpload', 'avatarUpload']) {
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
		for (const key of ['levelFileUpload', 'backgroundUpload', 'skinUpload', 'fxUpload', 'seUpload', 'avatarUpload']) {
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
			Sunniesnow.Logs.warn(`Failed to save settings: ${e.message ? e.message : e}`);
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
		const file = this.readFile('import-settings');
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
		const file = this.readFile('import-chart-offsets');
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

	associateCheckbox(checkboxId, inputId) {
		const checkbox = document.getElementById(checkboxId);
		const input = document.getElementById(inputId);
		const listener = () => input.disabled = !checkbox.checked;
		checkbox.addEventListener('change', listener);
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
		this.associateRadio('latency-hint-value-radio', 'latency-hint-value');
		this.associateRadio('renderer-webgl-radio', 'antialias');
		this.associateRadio('renderer-webgl-radio', 'power-preference-default-radio');
		this.associateRadio('renderer-webgl-radio', 'power-preference-low-power-radio');
		this.associateRadio('renderer-webgl-radio', 'power-preference-high-performance-radio');
		this.associateRange('volume-se', 'volume-se-value');
		this.associateRange('volume-music', 'volume-music-value');
		this.associateRange('background-blur', 'background-blur-value');
		this.associateRange('background-brightness', 'background-brightness-value');
		this.associateCheckbox('autoplay', 'progress-adjustable');
		this.associateCheckbox('debug', 'hide-debug-except-pause');
		this.associateCheckbox('sscharter', 'sscharter-live-restart');
		this.associateCheckbox('scroll', 'scroll-judgement-line');
		this.associateCheckbox('scroll', 'scroll-distance');
		this.associateCheckbox('vibration-with-music', 'vibration-delay');
		this.associateRange('hold-vibration-duty-cycle', 'hold-vibration-duty-cycle-value');
		this.associateRadio('avatar-online-radio', 'avatar-online');
		this.associateRadio('avatar-upload-radio', 'avatar-upload');
		this.associateRadio('avatar-gravatar-radio', 'avatar-gravatar');
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
	}

};
