import Sunniesnow from './Sunniesnow.js';
import {optionalChunkName} from './optional-chunk-names.js';

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

Sunniesnow.Optional = {
	load: loadOptionalChunk,
	register: registerOptionalChunk,
};
