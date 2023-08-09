const CDN_HOST = 'fastly.jsdelivr.net';
const CDN_RESOURCES = [
	'jszip@3.10.1/dist/jszip.min.js',
	'pixi.js-legacy@7.2.4/dist/pixi-legacy.min.js',
	'mime@3.0.0/lite/+esm',
	'marked@5.1.1/marked.min.js',
	'dompurify@3.0.5/dist/purify.min.js',
	'audio-decode@2.1.4/+esm'
].map(path => `https://${CDN_HOST}/npm/${path}`);

const SITE_RESOURCES = [
	...[
		'utils/Utils',
		'utils/ObjectUrl',
		'utils/PixiPatches',
		'utils/Patches',
		'utils/Fullscreen',
		'utils/Assets',
		'Config',
		'Plugin',
		'Dom',
		'Loader',
		'Game',
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
		'ui/UiComponent',
		'ui/Background',
		'ui/TopCenterHud',
		'ui/TopLeftHud',
		'ui/TopRightHud',
		'ui/ProgressBar',
		'ui/Result',
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
		'Preprocess'
	].map(path => `/game/js/${path}.js`),
	'/game/css/style.css',
	'/game/json/manifest.json',
	'/game/index.html',
	'/game/',
	'/favicon.ico',
	'/favicon.svg',
];

self.addEventListener('install', event => event.waitUntil(caches.open('site-v1').then(cache => {
	cache.addAll([...CDN_RESOURCES, ...SITE_RESOURCES]);
})));

self.addEventListener('fetch', event => event.respondWith(caches.match(event.request).then(response => {
	if (response) {
		return response;
	}
	return fetch(event.request).then(fetched => {
		const url = new URL(event.request.url);
		const clone = fetched.clone();
		let cacheKey;
		if (url.pathname.endsWith('.ssc') || url.pathname.endsWith('.ssp')) {
			cacheKey = 'online-v1';
		} else if (CDN_HOST === url.hostname || SITE_RESOURCES.includes(url.pathname)) {
			cacheKey = 'site-v1';
		} else {
			cacheKey = 'external-v1';
		}
		caches.open(cacheKey).then(cache => cache.put(event.request, clone));
		return fetched;
	});
})));
