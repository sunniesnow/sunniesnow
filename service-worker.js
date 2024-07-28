self.Sunniesnow = {};
importScripts('js/utils/Utils.js');
importScripts('js/ScriptsLoader.js');
const {CDN_PREFIX, CDN_SCRIPTS, SITE_SCRIPTS} = Sunniesnow.ScriptsLoader;

const ONLINE_HOST = atob('c3Vubmllc25vdy1jb21tdW5pdHkuNzU3MzY4MDgueHl6');
const SITE_RESOURCES = [
	...SITE_SCRIPTS,
	'/game/css/style.css',
	'/game/json/manifest.json',
	'/game/index.html',
	'/game/help.html',
	'/game/',
	'/game/popup/',
	'/game/popup/index.html',
	'/game/popup/style.css',
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
		cache => cache.addAll([...CDN_SCRIPTS, ...SITE_RESOURCES])
	));
});

self.addEventListener('activate', event => {
	event.waitUntil(clients.claim());
	event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(
		key => STORAGE_NAMES.includes(key) || caches.delete(key)
	))));
});

self.addEventListener('fetch', event => {
	let request = event.request;
	const url = new URL(request.url);
	// These are for busting caches for VS Code simple browser, not for service worker.
	url.searchParams.delete('vscodeBrowserReqId');
	url.searchParams.delete('fuckCache');
	request = new Request(url.href, request);
	event.respondWith(caches.match(request).then(response => {
		if (response) {
			return response;
		}
		return fetch(request).then(fetched => {
			let cacheKey;
			if (url.host === ONLINE_HOST) {
				cacheKey = ONLINE_STORAGE_NAME;
			} else if (url.href.startsWith(CDN_PREFIX) || SITE_RESOURCES.includes(url.pathname) || url.pathname.startsWith(Sunniesnow.Utils.dirname(location.pathname))) {
				cacheKey = SITE_STORAGE_NAME;
			} else if (!Sunniesnow.Utils.isPrivate(url.hostname)) {
				cacheKey = EXTERNAL_STORAGE_NAME;
			}
			if (cacheKey) {
				const clonedResponse = fetched.clone();
				caches.open(cacheKey).then(cache => cache.put(request, clonedResponse));
			}
			return fetched;
		});
	}))
});
