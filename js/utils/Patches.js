Sunniesnow.Patches = {
	apply() {
		this.patchHasOwn();
		this.patchFindLastIndex();
		this.patchRequestFullscreen();
		Sunniesnow.PixiPatches.apply();
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
		e.requestFullscreen ||= e.webkitEnterFullscreen || e.mozEnterFullScreen || e.msEnterFullscreen;
		e.requestFullscreen ||= function () {
			return new Promise((resolve, reject) => reject(new TypeError('requestFullscreen() is not supported on this browser')));
		};
		const oldAddEventListener = e.addEventListener;
		e.addEventListener = function (type, listener, options) {
			oldAddEventListener.call(this, type, listener, options);
			if (type === 'fullscreenchange') {
				oldAddEventListener.call(this, 'webkitfullscreenchange', listener, options);
				oldAddEventListener.call(this, 'mozfullscreenchange', listener, options);
				oldAddEventListener.call(this, 'MSFullscreenChange', listener, options);
				oldAddEventListener.call(this, 'webkitbeginfullscreen', listener, options);
				oldAddEventListener.call(this, 'mozbeginfullscreen', listener, options);
				oldAddEventListener.call(this, 'MSBeginFullscreen', listener, options);
				oldAddEventListener.call(this, 'webkitendfullscreen', listener, options);
				oldAddEventListener.call(this, 'mozendfullscreen', listener, options);
				oldAddEventListener.call(this, 'MSEndFullscreen', listener, options);
			}
			if (type === 'fullscreenerror') {
				oldAddEventListener.call(this, 'webkitfullscreenerror', listener, options);
				oldAddEventListener.call(this, 'mozfullscreenerror', listener, options);
				oldAddEventListener.call(this, 'MSFullscreenError', listener, options);
			}
		}
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
						Sunniesnow.Utils.warn('fullscreenElement is not supported on this browser');
					}
					return result;
				}
			});
		}
	}
};
