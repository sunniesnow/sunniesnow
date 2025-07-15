Sunniesnow.ScriptsLoader = {

	CDN_PREFIX: 'https://fastly.jsdelivr.net/npm/',
	SITE_PREFIX: `${Sunniesnow.Utils.base()}/js/`,
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
	},

	async scriptContents(scriptPaths) {
		return Promise.all(scriptPaths.map(async scriptPath => {
			return [await this.fetchText(scriptPath), scriptPath];
		}));
	},

	async runScript(scriptPath) {
		const script = await this.fetchText(scriptPath);
		this.runScriptFromString(script, scriptPath)
	},

	async runModule(scriptPath) {
		if (scriptPath.endsWith('+esm')) {
			let module = await import(scriptPath);
			module = module.default ?? module;
			const moduleName = scriptPath.includes('/@pixi/') ? 'PIXI' : Sunniesnow.Utils.slugToCamel(scriptPath.match(/\/([^/]+)@/)[1]);
			if (globalThis[moduleName]) {
				Object.assign(globalThis[moduleName], module);
			} else {
				globalThis[moduleName] = module;
			}
		} else {
			const script = await this.fetchText(scriptPath);
			// use indirect eval to run in global scope
			eval?.(script + `\n//# sourceURL=${this.sourceUrl(scriptPath)}`);
		}
	},

	async fetchText(path) {
		// https://github.com/microsoft/vscode/issues/205105
		// https://github.com/microsoft/vscode/blob/7e805145f76dea04d774cb14b7bc85366c02e79d/extensions/simple-browser/preview-src/index.ts#L96-L98
		// VS Code use this search parameter to bust the cache for the main webpage,
		// but the caches for the resources that it request are not busted.
		// Here is the workaround.
		// Will service worker be blown up? I do not know.
		if (Sunniesnow.vscodeBrowserReqId) {
			path += `?vscodeBrowserReqId=${Sunniesnow.vscodeBrowserReqId}`;
		}
		return await (await fetch(path)).text();
	},

	runScriptFromString(scriptString, scriptPath) {
		if (scriptPath) {
			scriptString += `\n//# sourceURL=${this.sourceUrl(scriptPath)}`;
		}
		new Function(...this.polyfill.keys, scriptString)(...this.polyfill.values);
	},
	
	sourceUrl(scriptPath) {
		return Sunniesnow.Utils.isBrowser() ? scriptPath : scriptPath.replace(/^\//, '');
	}
};

Sunniesnow.ScriptsLoader.CDN_SCRIPTS = [
	`jszip@3.10.1/dist/jszip${Sunniesnow.environment === 'production' ? '.min' : ''}.js`,
	`pixi.js@8.11.0/dist/pixi${Sunniesnow.environment === 'production' ? '.min' : ''}.js`,
	`pixi.js@8.11.0/dist/packages/advanced-blend-modes${Sunniesnow.environment === 'production' ? '.min' : ''}.js`,
	'mime@3.0.0/lite/+esm',
	'marked@5.1.1/marked.min.js',
	`dompurify@3.0.5/dist/purify${Sunniesnow.environment === 'production' ? '.min' : ''}.js`,
	'audio-decode@2.2.2/+esm',
	`vconsole@3.15.1/dist/vconsole.min.js`
].map(path => `${Sunniesnow.ScriptsLoader.CDN_PREFIX}${path}`);

Sunniesnow.ScriptsLoader.CUSTOMIZABLE_SITE_SCRIPTS = [
	'StoryAssets',

	'audio/Audio',
	'audio/Music',
	'audio/Se',
	'audio/SeTap',
	'audio/SeFlick',
	'audio/SeHold',
	'audio/SeDrag',
	'audio/SeWithMusic',

	'touch/Touch',
	'touch/TouchManager',

	'button/Button',
	'button/ButtonPauseBase',
	'button/ButtonPause',
	'button/ButtonResultRetry',
	'button/ButtonResultFullscreen',

	'interaction/Level',
	'interaction/ProgressControl',
	'interaction/DebugBoard',
	'interaction/TouchEffectBase',
	'interaction/TouchEffect',
	'interaction/TouchEffectsBoard',
	'interaction/EventInfoTip',

	'filter/Filter',
	'filter/FilterEvent',
	'filter/FilterFromChart',

	'ui/LoadingProgress',
	'ui/UiComponent',
	'ui/Background',
	'ui/TopCenterHud',
	'ui/TopLeftHud',
	'ui/TopRightHud',
	'ui/ProgressBar',
	'ui/DebugHud',

	'ui-pause/PauseBackground',
	'ui-pause/ButtonResume',
	'ui-pause/ButtonRetry',
	'ui-pause/ButtonFullscreen',
	'ui-pause/PauseBoard',

	'ui-result/Result',
	'ui-result/ResultStatsAndCombo',
	'ui-result/ResultTitle',
	'ui-result/ResultDifficulty',
	'ui-result/ResultRank',
	'ui-result/ResultScore',
	'ui-result/ResultAccuracy',
	'ui-result/ResultProfile',
	'ui-result/ResultAdditionalInfo',

	'ui-event/UiNotesBoard',
	'ui-event/UiBgNotesBoard',
	'ui-event/UiImagesBoard',
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
	'ui-event/UiHexagram',
	'ui-event/UiImage',
	'ui-event/UiEffectsBoard',

	'fx/FxBoard',
	'fx/FxNote',
	'fx/FxTap',
	'fx/FxFlick',
	'fx/FxHold',
	'fx/FxDrag',

	'level-event/LevelNote',
	'level-event/LevelTap',
	'level-event/LevelFlick',
	'level-event/LevelHold',
	'level-event/LevelDrag',

	'chart/Chart',
	'chart/Event',
	'chart/FilterableEvent',
	'chart/Placeholder',
	'chart/note/NoteBase',
	'chart/note/Note',
	'chart/note/Tap',
	'chart/note/Flick',
	'chart/note/Hold',
	'chart/note/Drag',
	'chart/note/BgNote',
	'chart/bg-pattern/BgPattern',
	'chart/bg-pattern/BigText',
	'chart/bg-pattern/Grid',
	'chart/bg-pattern/Hexagon',
	'chart/bg-pattern/Checkerboard',
	'chart/bg-pattern/DiamondGrid',
	'chart/bg-pattern/Pentagon',
	'chart/bg-pattern/Turntable',
	'chart/bg-pattern/Hexagram',
	'chart/story/Image',
	'chart/GlobalSpeed',
	'chart/effect/EffectUiComponent',
	'chart/effect/EffectBackground',
	'chart/effect/EffectTopCenterHud',
	'chart/effect/EffectTopLeftHud',
	'chart/effect/EffectTopRightHud',
	'chart/effect/EffectProgressBar',
	'chart/effect/EffectTipPoint',
	'chart/effect/EffectMultiple',

	'ui-nonevent/tip-point/TipPointBase',
	'ui-nonevent/tip-point/TipPoint',
	'ui-nonevent/tip-point/TipPointsBoard',
	'ui-nonevent/double-line/DoubleLineBase',
	'ui-nonevent/double-line/DoubleLine',
	'ui-nonevent/double-line/DoubleLinesBoard',
	'ui-nonevent/judgement-line/JudgementLineBase',
	'ui-nonevent/judgement-line/JudgementLine',

	'vibration/VibrationManager',
	'vibration/VibrationWithMusic',

	'scene/Scene',
	'scene/SceneLoading',
	'scene/SceneGame',
	'scene/SceneResult',
];
Sunniesnow.ScriptsLoader.SITE_SCRIPTS = [
	'utils/Utils',
	'utils/Mixin',
	'utils/ObjectUrl',
	'utils/PixiPatches',
	'utils/Patches',
	'utils/Fetcher',
	'utils/Assets',

	'dom/I18n',
	'dom/Settings',
	'dom/Fullscreen',
	'dom/Logs',
	'dom/MiscDom',
	'dom/PinnedCoordinates',
	'dom/Popup',
	'dom/SpinUp',

	'external/Sscharter',
	'external/DiscordRichPresence',
	'external/Imgur',

	'Config',
	'Plugin',
	'Loader',
	'Game',

	...Sunniesnow.ScriptsLoader.CUSTOMIZABLE_SITE_SCRIPTS,

	'cover/Cover',
	'cover/CoverGenerator',
	'cover/CoverBackground',
	'cover/CoverThemeImage',
	'cover/CoverTitle',
	'cover/CoverDifficulty',
	'cover/CoverProfile',

	'Preprocess',
	'ScriptsLoader'
];
for (const array of [Sunniesnow.ScriptsLoader.SITE_SCRIPTS, Sunniesnow.ScriptsLoader.CUSTOMIZABLE_SITE_SCRIPTS]) {
	for (let i = 0; i < array.length; i++) {
		array[i] = `${Sunniesnow.ScriptsLoader.SITE_PREFIX}${array[i]}.js`;
	}
}
