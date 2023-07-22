Sunniesnow.Patches = {
	apply() {
		this.patchHasOwn();
		this.patchFindLastIndex();
		this.patchRequestFullscreen();
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
	},

	patchRequestFullscreen() {
		const e = Element.prototype;
		e.requestFullscreen ||= e.webkitRequestFullscreen || e.mozRequestFullScreen || e.msRequestFullscreen;
		e.requestFullscreen ||= function () {
			return new Promise((resolve, reject) => reject(new TypeError('requestFullscreen() is not supported on this browser')));
		};
		const d = Document.prototype;
		d.exitFullscreen ||= d.webkitExitFullscreen || d.mozExitFullScreen || d.msExitFullscreen;
		d.exitFullscreen ||= d.cancelFullscreen || d.webkitCancelFullScreen || d.mozCancelFullScreen || d.msCancelFullScreen;
		d.exitFullscreen ||= function () {
			return new Promise((resolve, reject) => reject(new TypeError('exitFullscreen() is not supported on this browser')));
		};
		if (!Object.hasOwn(d, 'fullscreenElement')) {
			Object.defineProperty(d, 'fullscreenElement', {
				get() {
					let result = this.webkitFullscreenElement || this.mozFullScreenElement || this.msFullscreenElement;
					result ||= this.webkitCurrentFullScreenElement || this.mozCurrentFullScreenElement || this.msCurrentFullScreenElement;
					if (result === undefined) {
						Sunniesnow.warn('fullscreenElement is not supported on this browser');
					}
					return result;
				}
			});
		}
	}
};
