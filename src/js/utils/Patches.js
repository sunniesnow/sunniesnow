import Sunniesnow from '../Sunniesnow.js';

Sunniesnow.Patches = {
	apply() {
		this.patchHasOwn();
		this.patchFindLastIndex();
		this.patchToSorted();
		this.patchToSpliced();
		this.patchRequestFullscreen();
		this.patchVibrate();
		this.patchFontFaceSetIterator();
		this.patchIteratorForEach();
		Sunniesnow.PixiPatches.apply();
	},

	// Object.hasOwn is supported on Safari only since 15.4.
	patchHasOwn() {
		Object.hasOwn ??= (object, key) => Object.prototype.hasOwnProperty.call(object, key);
	},

	// Array.prototype.findLastIndex is supported on Safari only since 15.4.
	patchFindLastIndex() {
		if (Array.prototype.findLastIndex) {
			return;
		}
		Object.defineProperty(Array.prototype, 'findLastIndex', {
			value: function findLastIndex(callbackFn, thisArg) {
				thisArg ??= globalThis;
				for (let i = this.length - 1; i >= 0; i--) {
					if (callbackFn.call(thisArg, this[i], i, this)) {
						return i;
					}
				}
				return -1;
			}
		});
	},

	patchRequestFullscreen() {
		if (!Sunniesnow.Utils.isBrowser()) {
			return;
		}

		const e = Element.prototype;
		if (!e.requestFullscreen) {
			let requestFullscreen = e.webkitRequestFullscreen ?? e.mozRequestFullScreen ?? e.msRequestFullscreen;
			requestFullscreen ??= e.webkitEnterFullscreen ?? e.mozEnterFullScreen ?? e.msEnterFullscreen;
			requestFullscreen ??= function requestFullscreen() {
				return Promise.reject(new TypeError('requestFullscreen() is not supported on this browser'));
			};
			Object.defineProperty(e, 'requestFullscreen', {value: requestFullscreen});
		}

		const oldAddEventListener = e.addEventListener;
		Object.defineProperty(e, 'addEventListener', {
			value: function addEventListener(type, listener, options) {
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
		});

		const d = Document.prototype;
		if (!d.exitFullscreen) {
			let exitFullscreen = d.webkitExitFullscreen ?? d.mozExitFullScreen ?? d.msExitFullscreen;
			exitFullscreen ??= d.cancelFullscreen ?? d.webkitCancelFullScreen ?? d.mozCancelFullScreen ?? d.msCancelFullScreen;
			exitFullscreen ??= function exitFullscreen() {
				return Promise.reject(new TypeError('exitFullscreen() is not supported on this browser'));
			};
			Object.defineProperty(d, 'exitFullscreen', {value: exitFullscreen});
		}

		if (!Object.hasOwn(d, 'fullscreenElement')) {
			Object.defineProperty(d, 'fullscreenElement', {
				get() {
					let result = this.webkitFullscreenElement ?? this.mozFullScreenElement ?? this.msFullscreenElement;
					result ??= this.webkitCurrentFullScreenElement ?? this.mozCurrentFullScreenElement ?? this.msCurrentFullScreenElement;
					if (result === undefined) {
						Sunniesnow.Logs.warn('fullscreenElement is not supported on this browser');
					}
					return result;
				}
			});
		}
	},

	patchVibrate() {
		if (!Sunniesnow.Utils.isBrowser()) {
			return;
		}
		const n = navigator;
		n.vibrate ??= n.webkitVibrate ?? n.mozVibrate ?? n.msVibrate;
		n.vibrate ??= () => {};
	},

	patchToSorted() {
		if (Array.prototype.toSorted) {
			return;
		}
		// use defineProperty instead of assignment to make it non-enumerable,
		// otherwise it shows up in for...in loops.
		Object.defineProperty(Array.prototype, 'toSorted', {
			value: function toSorted(compareFunction) {
				const result = this.slice();
				result.sort(compareFunction);
				return result;
			}
		});
	},

	patchToSpliced() {
		if (Array.prototype.toSpliced) {
			return;
		}
		Object.defineProperty(Array.prototype, 'toSpliced', {
			value: function toSpliced() {
				const result = this.slice();
				result.splice(...arguments);
				return result;
			}
		});
	},

	patchFontFaceSetIterator() {
		if (!Sunniesnow.Utils.isBrowser() || !document.fonts) {
			return;
		}

		const proto = Object.getPrototypeOf(document.fonts.keys());
		if (!proto[Symbol.iterator]) {
			Object.defineProperty(proto, Symbol.iterator, {
				value: function* () {
					let obj = this.next();
					while (!obj.done) {
						yield obj.value;
						obj = this.next();
					}
				}
			});
		}

		if (!proto.some) {
			Object.defineProperty(proto, 'some', {
				value: function some(callbackFn) {
					let i = 0;
					for (const value of this) {
						if (callbackFn.call(globalThis, value, i)) {
							return true;
						}
						i++;
					}
					return false;
				}
			});
		}
	},

	patchIteratorForEach() {
		const iteratorPrototype = typeof Iterator !== 'undefined' ? Iterator.prototype : Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));
		if (iteratorPrototype.forEach) {
			return;
		}
		Object.defineProperty(iteratorPrototype, 'forEach', {
			value: function forEach(callback) {
				if (this === null || (typeof this !== 'object' && typeof this !== 'function')) {
					throw new TypeError('Expected an iterator');
				}
				const iterator = this;
				const close = () => {
					try {
						if (iterator.return != null) {
							iterator.return();
						}
					} catch(_) {
					}
				};
				if (typeof callback !== 'function') {
					close();
					throw new TypeError('Callback must be a function');
				}
				const next = iterator.next;
				let index = 0;
				while (true) {
					const result = next.call(iterator);
					if (result === null || (typeof result !== 'object' && typeof result !== 'function')) {
						throw new TypeError('Iterator result must be an object');
					}
					if (result.done) {
						return;
					}
					const value = result.value;
					try {
						callback.call(undefined, value, index++);
					} catch (error) {
						close();
						throw error;
					}
				}
			}
		});
	},
};
