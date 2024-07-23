self.Sunniesnow = {};
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

self.addEventListener('fetch', event => event.respondWith(caches.match(event.request).then(response => {
	if (response) {
		return response;
	}
	return fetch(event.request).then(fetched => {
		const url = new URL(event.request.url);
		let cacheKey;
		if (url.host === ONLINE_HOST) {
			cacheKey = ONLINE_STORAGE_NAME;
		} else if (url.href.startsWith(CDN_PREFIX) || SITE_RESOURCES.includes(url.pathname) || url.pathname.startsWith(dirname(location.pathname))) {
			cacheKey = SITE_STORAGE_NAME;
		} else if (!isPrivate(url.hostname)) {
			cacheKey = EXTERNAL_STORAGE_NAME;
		}
		if (cacheKey) {
			const clone = fetched.clone();
			caches.open(cacheKey).then(cache => cache.put(event.request, clone));
		}
		return fetched;
	});
})));

function dirname(path) {
	return path.replace(/\/[^/]*$/, '');
}

function isPrivate(hostname) {
	if (hostname === 'localhost') {
		return true;
	}
	if (/10\.\d+\.\d+\.\d+/.test(hostname)) {
		return true;
	}
	if (/192\.168\.\d+\.\d+/.test(hostname)) {
		return true;
	}
	if (/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+/.test(hostname)) {
		return true;
	}
	if (/127\.\d+\.\d+\.\d+/.test(hostname)) {
		return true;
	}
	return false;
}
