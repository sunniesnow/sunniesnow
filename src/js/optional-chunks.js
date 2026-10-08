export const optionalLoaders = {
	vconsole: () => import('vconsole'),
};

export function loadOptionalChunk(specifier) {
	const loader = optionalLoaders[specifier];
	if (!loader) {
		throw new TypeError(`There is no optional module named ${specifier}`);
	}
	return loader();
}

export function registerOptionalChunk() {
	throw new TypeError('Optional chunks are only used by the build of the static site');
}
