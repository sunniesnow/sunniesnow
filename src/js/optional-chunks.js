/**
 * Loading the modules that the game only needs sometimes, for the library builds.
 *
 * A library is bundled by its consumer, so it can use a real dynamic import and let the
 * consumer's bundler decide what to do with it (bundle it, split it into a chunk, or
 * leave it external). The specifiers are written out explicitly, because a dynamic
 * import with a variable specifier cannot be resolved by a bundler.
 *
 * The static site does not use this module: its build replaces it with
 * ./optional-chunks-site.js, which loads the chunks of the site as classic scripts.
 */
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
