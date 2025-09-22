Sunniesnow.HookJson = class HookJson extends Sunniesnow.Hook {
	async apply(value, token) {
		if (value instanceof Blob) {
			value = await value.text();
		}
		return JSON.parse(value);
	}
};
