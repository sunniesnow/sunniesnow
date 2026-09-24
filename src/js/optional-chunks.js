import Sunniesnow from './Sunniesnow.js';
import {optionalChunkName} from './optional-chunk-names.js';

/**
 * Loading the optional chunks of the built static site.
 *
 * Most of the code that the game only needs sometimes (the audio decoders and
 * vConsole) is not part of `dist/web/main.js`, but of the chunks under `optional/`.
 * They are loaded when they are first needed, so that they never delay the first
 * rendering of the page; the service worker caches them in the background (see
 * src/web/service-worker.js), so loading them is usually instant.
 *
 * The library builds replace this module with ./optional-chunks-import.js, which
 * uses a real dynamic import instead, because a library is bundled by its consumer.
 *
 * Chromium 37 cannot parse `import()` and the web build has to be a single classic
 * script, so a chunk cannot be an ES module and cannot hand over what it provides by
 * exporting it. It registers itself on the global channel below instead, and the
 * chunks rely on the polyfills and on the regenerator runtime of main.js.
 */
const modules = new Map();
const promises = new Map();

export function loadOptionalChunk(specifier) {
	if (modules.has(specifier)) {
		return Promise.resolve(modules.get(specifier));
	}
	if (!promises.has(specifier)) {
		promises.set(specifier, loadOptionalChunkFile(specifier));
	}
	return promises.get(specifier);
}

export function registerOptionalChunk(specifier, module) {
	modules.set(specifier, module);
}

function loadOptionalChunkFile(specifier) {
	return new Promise((resolve, reject) => {
		const url = optionalChunkUrl(specifier);
		const element = document.createElement('script');
		element.src = url;
		element.addEventListener('load', () => {
			const module = modules.get(specifier);
			if (module) {
				resolve(module);
			} else {
				reject(new TypeError(`The optional chunk ${url} does not provide ${specifier}`));
			}
		});
		element.addEventListener('error', () => {
			reject(new TypeError(`Failed to load the optional chunk ${url}`));
		});
		document.head.appendChild(element);
	});
}

function optionalChunkUrl(specifier) {
	const path = `${Sunniesnow.Utils.base()}/optional/${optionalChunkName(specifier)}.js`;
	return Sunniesnow.fuckCache ? `${path}?fuck-cache=${Sunniesnow.fuckCache}` : path;
}

globalThis.SunniesnowOptional = {
	load: loadOptionalChunk,
	register: registerOptionalChunk,
};
