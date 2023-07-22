Sunniesnow.Patches = {
	apply() {
		this.patchHasOwn();
	},

	// Object.hasOwn is supported on Safari only since 15.4.
	patchHasOwn() {
		Object.hasOwn ||= (object, key) => Object.prototype.hasOwnProperty.call(object, key);
	}
};
