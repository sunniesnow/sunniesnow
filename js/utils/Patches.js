Sunniesnow.Patches = {
	apply() {
		this.patchHasOwn();
		this.patchFindLastIndex();
	},

	// Object.hasOwn is supported on Safari only since 15.4.
	patchHasOwn() {
		Object.hasOwn ||= (object, key) => Object.prototype.hasOwnProperty.call(object, key);
	},

	// Array.prototype.findLastIndex is supported on Safari only since 15.4.
	patchFindLastIndex() {
		Array.prototype.findLastIndex ||= function(callbackFn, thisArg) {
			thisArg ??= globalThis;
			for (let i = this.length - 1; i >= 0; i--) {
				if (callbackFn.call(thisArg, this[i], i, this)) {
					return i;
				}
			}
			return -1;
		}
	}
};
