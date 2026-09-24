import buildInfo from '../js/build-info.js';

const BASE = location.pathname.replace(/\/[^/]*$/, '');
const ONLINE_HOST = atob('c3Vubmllc25vdy1jb21tdW5pdHkuNzU3MzY4MDgueHl6');

const SITE_RESOURCES = [
	`${BASE}/`,
	`${BASE}/index.html`,
	`${BASE}/help.html`,
	`${BASE}/main.js`,
	`${BASE}/style.css`,
	`${BASE}/manifest.json`,
	`${BASE}/audio/FrameReporter.js`,
	`${BASE}/audio/TimeReporter.js`,
	`${BASE}/popup/`,
	`${BASE}/popup/index.html`,
	`${BASE}/popup/style.css`,
	`${BASE}/favicon.ico`,
	`${BASE}/favicon.svg`,
];

function isPrivate(hostname) {
	return [
		/^localhost$/i,
		/^(0|10|127)\.\d+\.\d+\.\d+$/,
		/^192\.168\.\d+\.\d+$/,
		/^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+$/,
	].some(regexp => regexp.test(hostname));
}

const SITE_STORAGE_NAME = `site-${buildInfo.fuckCache}`;
const ONLINE_STORAGE_NAME = 'online-v1';
const EXTERNAL_STORAGE_NAME = 'external-v1';
const STORAGE_NAMES = [SITE_STORAGE_NAME, ONLINE_STORAGE_NAME, EXTERNAL_STORAGE_NAME];

// The optional chunks are not cached while installing, because the page should not
// wait for them. They are cached in the background instead, as soon as the page asks
// for it (see Sunniesnow.CacheManager.registerServiceWorker), so that they are ready
// long before a level needs an audio decoder or the player turns on vConsole.
const OPTIONAL_MANIFEST = `${BASE}/optional/manifest.json`;
let optionalChunksCaching = null;

function cacheOptionalChunks() {
	if (!optionalChunksCaching) {
		optionalChunksCaching = doCacheOptionalChunks().catch(error => {
			console.warn(`Failed to cache the optional chunks: ${error}`);
			optionalChunksCaching = null; // try again the next time
		});
	}
	return optionalChunksCaching;
}

async function doCacheOptionalChunks() {
	const cache = await caches.open(SITE_STORAGE_NAME);
	const response = await fetch(OPTIONAL_MANIFEST);
	if (!response.ok) {
		throw new Error(`${OPTIONAL_MANIFEST} responded with ${response.status}`);
	}
	const {chunks} = await response.json();
	for (const chunk of chunks) {
		// The loader requests the chunks with a `fuck-cache` parameter, which is
		// removed from the cache keys, so the same URL is used here.
		const url = `${BASE}/optional/${chunk}`;
		if (await cache.match(url)) {
			continue;
		}
		const fetched = await fetch(url);
		if (fetched.ok) {
			await cache.put(url, fetched);
		} else {
			console.warn(`Failed to cache ${url}: ${fetched.status}`);
		}
	}
}

function cacheSiteResources() {
	return caches.open(SITE_STORAGE_NAME).then(cache => {
		// Add the resources one by one so that a missing resource
		// does not fail the whole installation.
		return Promise.all(SITE_RESOURCES.map(resource => {
			return fetch(resource).then(response => {
				if (!response.ok) {
					throw new Error(`Failed to fetch ${resource}: ${response.status}`);
				}
				return cache.put(resource, response);
			}).catch(error => {
				console.warn(`Not caching ${resource}: ${error}`);
			});
		}));
	});
}

function isSiteResource(url) {
	if (url.origin !== location.origin) {
		return false;
	}
	return url.pathname.startsWith(`${BASE}/`) || url.pathname === BASE;
}

self.addEventListener('install', event => {
	skipWaiting();
	event.waitUntil(cacheSiteResources());
});

self.addEventListener('activate', event => {
	event.waitUntil(clients.claim());
	event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(
		key => STORAGE_NAMES.includes(key) || caches.delete(key)
	))));
});

self.addEventListener('message', event => {
	if (event.data?.type === 'cache-optional-chunks') {
		event.waitUntil(cacheOptionalChunks());
	}
});

self.addEventListener('fetch', event => {
	const oldRequest = event.request;
	if (oldRequest.mode === 'navigate') { // creating new request fails when mode is 'navigate'
		Object.defineProperty(oldRequest, 'mode', {value: 'same-origin'});
	}
	const url = new URL(oldRequest.url);
	// These are for busting caches for VS Code simple browser, not for service worker.
	url.searchParams.delete('vscodeBrowserReqId');
	url.searchParams.delete('fuck-cache');
	url.searchParams.delete('authentication');
	const request = new Request(url.href, oldRequest);
	event.respondWith(caches.match(request).then(response => {
		if (response) {
			return response;
		}
		return fetch(oldRequest).then(fetched => {
			const headers = new Headers(fetched.headers);
			// https://blog.tomayac.com/2025/03/08/setting-coop-coep-headers-on-static-hosting-like-github-pages/
			headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
			headers.set('Cross-Origin-Opener-Policy', 'same-origin');
			const modifiedResponse = new Response(fetched.body, {
				status: fetched.status,
				statusText: fetched.statusText,
				headers
			});
			let cacheKey;
			if (url.protocol === 'https:') {
				if (url.host === ONLINE_HOST) {
					cacheKey = ONLINE_STORAGE_NAME;
				} else if (isSiteResource(url)) {
					cacheKey = SITE_STORAGE_NAME;
				} else if (!isPrivate(url.hostname)) {
					cacheKey = EXTERNAL_STORAGE_NAME;
				}
			}
			if (cacheKey) {
				const clonedResponse = modifiedResponse.clone();
				caches.open(cacheKey).then(cache => cache.put(request, clonedResponse));
			}
			return modifiedResponse;
		});
	}));
});
