/**
 * The name of the file (without the extension) of the optional chunk that provides a
 * dynamically imported specifier, under `optional/` in the built site.
 *
 * The web build imports this module too, so that the chunks it generates and the
 * loader that fetches them cannot disagree about the names.
 */
export function optionalChunkName(specifier) {
	// All the decoders of @audio/decode are in a single chunk: they depend on each
	// other (e.g. the webm decoder uses the mp3 and the opus decoders), so separate
	// chunks would contain many copies of the same code.
	if (specifier.startsWith('@audio/decode-')) {
		return 'audio-decoders';
	}
	return specifier.replace(/^@/, '').replace(/\//g, '-');
}
