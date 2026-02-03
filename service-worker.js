self.Sunniesnow = {};
importScripts('js/utils/Utils.js', 'js/ScriptsLoader.js');

const {CDN_PREFIX} = Sunniesnow.ScriptsLoader;
const BASE = Sunniesnow.Utils.base();
const ONLINE_HOST = atob('c3Vubmllc25vdy1jb21tdW5pdHkuNzU3MzY4MDgueHl6');
const EXTRA_SITE_RESOURCES = [ // paths not included in ScriptsLoader.{cdnScripts,siteScripts,siteJson}
	`${BASE}/css/style.css`,
	`${BASE}/index.html`,
	`${BASE}/help.html`,
	`${BASE}/`,
	`${BASE}/popup`,
	`${BASE}/popup/index.html`,
	`${BASE}/popup/style.css`,
	'/favicon.ico',
	'/favicon.svg',
];

const SITE_STORAGE_NAME = 'site-v1';
const ONLINE_STORAGE_NAME = 'online-v1';
const EXTERNAL_STORAGE_NAME = 'external-v1';
const STORAGE_NAMES = [SITE_STORAGE_NAME, ONLINE_STORAGE_NAME, EXTERNAL_STORAGE_NAME]

self.addEventListener('install', event => {
	skipWaiting();
	event.waitUntil(Sunniesnow.ScriptsLoader.init().then(
		() => caches.open(SITE_STORAGE_NAME)
	).then(cache => cache.addAll([
		...Sunniesnow.ScriptsLoader.cdnScripts.map(({path}) => path),
		...Sunniesnow.ScriptsLoader.siteScripts.map(({path}) => path),
		...Sunniesnow.ScriptsLoader.siteJson.map(path => `${BASE}/json/${path}.json`),
		...EXTRA_SITE_RESOURCES
	])));
});

self.addEventListener('activate', event => {
	event.waitUntil(clients.claim());
	event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(
		key => STORAGE_NAMES.includes(key) || caches.delete(key)
	))));
});

function isSiteResource(url) {
	if (Sunniesnow.ScriptsLoader.cdnScripts?.some(({path}) => url.href === path)) {
		return true;
	}
	if (url.origin !== location.origin) {
		return false;
	}
	return url.pathname.startsWith(BASE) || EXTRA_SITE_RESOURCES.includes(url.pathname);
}

self.addEventListener('fetch', event => {
	const oldRequest = event.request;
	if (oldRequest.mode === 'navigate') { // creating new request fails when mode is 'navigate'
		Object.defineProperty(oldRequest, 'mode', {value: 'cors'});
	}
	const url = new URL(oldRequest.url);
	// These are for busting caches for VS Code simple browser, not for service worker.
	url.searchParams.delete('vscodeBrowserReqId');
	url.searchParams.delete('fuckCache');
	const request = new Request(url.href, oldRequest);
	event.respondWith(caches.match(request).then(response => {
		if (response) {
			return response;
		}
		return fetch(oldRequest).then(fetched => {
			let cacheKey;
			if (url.protocol === 'https:') {
				if (url.host === ONLINE_HOST) {
					cacheKey = ONLINE_STORAGE_NAME;
				} else if (isSiteResource(url)) {
					cacheKey = SITE_STORAGE_NAME;
				} else if (!Sunniesnow.Utils.isPrivate(url.hostname)) {
					cacheKey = EXTERNAL_STORAGE_NAME;
				}
			}
			if (cacheKey) {
				const clonedResponse = fetched.clone();
				caches.open(cacheKey).then(cache => cache.put(request, clonedResponse));
			}
			return fetched;
		});
	}))
});
