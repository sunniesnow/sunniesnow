// The name of the file (without the extension) of the optional chunk
export function optionalChunkName(specifier) {
	// all the decoders of @audio/decode are in a single chunk:
	// they depend on each other, so separate chunks would contain many copies of the same code
	if (specifier.startsWith('@audio/decode-')) {
		return 'audio-decoders';
	}
	return specifier.replace(/^@/, '').replace(/\//g, '-');
}
