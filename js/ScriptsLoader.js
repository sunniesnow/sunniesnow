Sunniesnow.ScriptsLoader = {

	CDN_PREFIX: 'https://fastly.jsdelivr.net/npm/',
	SITE_PREFIX: '/game/js/',
	polyfill: {keys: [], values: []},

	setPolyfill(polyfill) {
		[this.polyfill.keys, this.polyfill.values] = Sunniesnow.Utils.transposeArray(Object.entries(polyfill));
	},

	async runAllScripts() {
		await this.runCdnScripts();
		await this.runSiteScripts();
	},

	async runCdnScripts() {
		for (const scriptPath of this.CDN_SCRIPTS) {
			await this.runModule(scriptPath);
		}
	},

	async runSiteScripts(scriptPaths = this.SITE_SCRIPTS) {
		for (const [script, scriptPath] of await this.scriptContents(scriptPaths)) {
			this.runScriptFromString(script, scriptPath);
		}
		Sunniesnow.ScriptsLoader.polyfill = this.polyfill;
	},

	async scriptContents(scriptPaths) {
		return Promise.all(scriptPaths.map(async scriptPath => {
			return [await fetch(scriptPath).then(r => r.text()), scriptPath];
		}));
	},

	async runScript(scriptPath) {
		const script = await fetch(scriptPath).then(response => response.text());
		this.runScriptFromString(script, scriptPath)
	},

	async runModule(scriptPath) {
		if (scriptPath.endsWith('+esm')) {
			const moduleName = Sunniesnow.Utils.slugToCamel(scriptPath.match(/\/([^/]+)@/)[1]);
			globalThis[moduleName] = (await import(scriptPath)).default;
		} else {
			const script = await fetch(scriptPath).then(response => response.text());
			// use indirect eval to run in global scope
			eval?.(script + `\n//# sourceURL=${scriptPath}`);
		}
	},

	runScriptFromString(scriptString, scriptPath) {
		if (scriptPath) {
			scriptString += `\n//# sourceURL=${scriptPath}`;
		}
		new Function(...this.polyfill.keys, scriptString)(...this.polyfill.values);
	}
};

Sunniesnow.ScriptsLoader.CDN_SCRIPTS = [
	'jszip@3.10.1/dist/jszip.min.js',
	'pixi.js-legacy@7.2.4/dist/pixi-legacy.min.js',
	'mime@3.0.0/lite/+esm',
	'marked@5.1.1/marked.min.js',
	'dompurify@3.0.5/dist/purify.min.js',
	'audio-decode@2.1.4/+esm'
].map(path => `${Sunniesnow.ScriptsLoader.CDN_PREFIX}${path}`),

Sunniesnow.ScriptsLoader.CUSTOMIZABLE_SITE_SCRIPTS = [
	'audio/Audio',
	'audio/Music',
	'audio/Se',
	'audio/SeTap',
	'audio/SeFlick',
	'audio/SeHold',
	'audio/SeDrag',
	'audio/SeWithMusic',

	'touch/TouchEffectBase',
	'touch/TouchEffect',
	'touch/TouchEffectsBoard',
	'touch/Touch',
	'touch/TouchManager',

	'button/Button',
	'button/ButtonPauseBase',
	'button/ButtonPause',
	'button/ButtonResultRetry',
	'button/ButtonResultFullscreen',

	'ui/UiComponent',
	'ui/Background',
	'ui/TopCenterHud',
	'ui/TopLeftHud',
	'ui/TopRightHud',
	'ui/ProgressBar',
	'ui/Result',
	'ui/ResultAdditionalInfo',

	'ui-pause/PauseBackground',
	'ui-pause/ButtonResume',
	'ui-pause/ButtonRetry',
	'ui-pause/ButtonFullscreen',
	'ui-pause/PauseBoard',

	'ui-debug/DebugHud',
	'ui-debug/DebugBoard',
	'ui-event/UiNotesBoard',
	'ui-event/UiBgNotesBoard',
	'ui-event/UiBgPatternBoard',
	'ui-event/UiEvent',
	'ui-event/UiNoteBase',
	'ui-event/UiNote',
	'ui-event/UiTap',
	'ui-event/UiFlick',
	'ui-event/UiHold',
	'ui-event/UiDrag',
	'ui-event/UiBgNote',
	'ui-event/UiBgPattern',
	'ui-event/UiBigText',
	'ui-event/UiGrid',
	'ui-event/UiHexagon',
	'ui-event/UiCheckerboard',
	'ui-event/UiDiamondGrid',
	'ui-event/UiPentagon',
	'ui-event/UiTurntable',

	'fx/FxBoard',
	'fx/FxNote',
	'fx/FxTap',
	'fx/FxFlick',
	'fx/FxHold',
	'fx/FxDrag',

	'level/Level',
	'level/LevelNote',
	'level/LevelTap',
	'level/LevelFlick',
	'level/LevelHold',
	'level/LevelDrag',

	'chart/Chart',
	'chart/Event',
	'chart/Note',
	'chart/Placeholder',
	'chart/Tap',
	'chart/Flick',
	'chart/Hold',
	'chart/Drag',
	'chart/BgNote',
	'chart/BgPattern',
	'chart/BigText',
	'chart/Grid',
	'chart/Hexagon',
	'chart/Checkerboard',
	'chart/DiamondGrid',
	'chart/Pentagon',
	'chart/Turntable',

	'ui-nonevent/tip-point/TipPointBase',
	'ui-nonevent/tip-point/TipPoint',
	'ui-nonevent/tip-point/TipPointsBoard',
	'ui-nonevent/double-line/DoubleLineBase',
	'ui-nonevent/double-line/DoubleLine',
	'ui-nonevent/double-line/DoubleLinesBoard',

	'scene/Scene',
	'scene/SceneGame',
	'scene/SceneResult',
];
Sunniesnow.ScriptsLoader.SITE_SCRIPTS = [
	'utils/Utils',
	'utils/ObjectUrl',
	'utils/PixiPatches',
	'utils/Patches',
	'utils/Fetcher',
	'utils/Fullscreen',
	'utils/Assets',

	'Config',
	'Plugin',
	'Dom',
	'Loader',
	'Game',

	...Sunniesnow.ScriptsLoader.CUSTOMIZABLE_SITE_SCRIPTS,

	'Preprocess',
	'ScriptsLoader'
];
for (const array of [Sunniesnow.ScriptsLoader.SITE_SCRIPTS, Sunniesnow.ScriptsLoader.CUSTOMIZABLE_SITE_SCRIPTS]) {
	for (let i = 0; i < array.length; i++) {
		array[i] = `${Sunniesnow.ScriptsLoader.SITE_PREFIX}${array[i]}.js`;
	}
}
