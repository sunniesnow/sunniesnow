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
		'Preprocess'
	].map(path => `/game/js/${path}.js`),
	'/game/css/style.css',
	'/game/json/manifest.json',
	'/game/index.html',
	'/game/',
	'/favicon.ico',
	'/favicon.svg',
];

const SITE_STORAGE_NAME = 'site-v1';
const ONLINE_STORAGE_NAME = 'online-v1';
const EXTERNAL_STORAGE_NAME = 'external-v1';
const STORAGE_NAMES = [SITE_STORAGE_NAME, ONLINE_STORAGE_NAME, EXTERNAL_STORAGE_NAME]

self.addEventListener('install', event => {
	skipWaiting();
	event.waitUntil(caches.open(SITE_STORAGE_NAME).then(
		cache => cache.addAll([...CDN_RESOURCES, ...SITE_RESOURCES])
	));
});

self.addEventListener('activate', event => {
	event.waitUntil(clients.claim());
	event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(
		key => STORAGE_NAMES.includes(key) || caches.delete(key)
	))));
})

self.addEventListener('fetch', event => event.respondWith(caches.match(event.request).then(response => {
	if (response) {
		return response;
	}
	return fetch(event.request).then(fetched => {
		const url = new URL(event.request.url);
		const clone = fetched.clone();
		let cacheKey;
		if (url.pathname.endsWith('.ssc') || url.pathname.endsWith('.ssp')) {
			cacheKey = ONLINE_STORAGE_NAME;
		} else if (CDN_HOST === url.hostname || SITE_RESOURCES.includes(url.pathname)) {
			cacheKey = SITE_STORAGE_NAME;
		} else {
			cacheKey = EXTERNAL_STORAGE_NAME;
		}
		caches.open(cacheKey).then(cache => cache.put(event.request, clone));
		return fetched;
	});
})));
