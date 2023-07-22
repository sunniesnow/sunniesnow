Sunniesnow.Fullscreen = {

	should: false,
	is: false,
	entering: false,
	quitting: false,

	set(fullscreen) {
		this.should = fullscreen;
		if (this.should && !this.entering && !this.is) {
			this.enter();
		} else if (!this.should && !this.quitting && this.is) {
			this.quit();
		}
	},

	toggle() {
		this.set(!this.should);
	},

	enter() {
		this.entering = true;
		const promise = Sunniesnow.game.canvas.requestFullscreen();
		if (typeof promise?.then === 'function') {
			promise.then(
				() => {
					this.entering = false;
					this.is = true;
					if (!this.should) {
						this.quit();
					}
				},
				reason => {
					this.entering = false;
					Sunniesnow.Utils.warn('Failed to request fullscreen: ' + reason, reason);
				}
			);
		} else {
			this.entering = false;
			this.is = true;
		}
	},

	quit() {
		this.quitting = true;
		const promise = document.exitFullscreen();
		if (typeof promise?.then === 'function') {
			promise.then(
				() => {
					this.quitting = false;
					this.is = false;
					if (this.should) {
						this.enter();
					}
				},
				reason => {
					this.quitting = false;
					Sunniesnow.Utils.warn('Failed to exit fullscreen: ' + reason, reason);
				}
			);
		} else {
			this.quitting = false;
			this.is = false;
		}
	},

	addListenerToCanvas() {
		this.canvasFullscreenChangeListener = event => this.should = this.is = !!document.fullscreenElement;
		Sunniesnow.game.canvas.addEventListener('fullscreenchange', this.canvasFullscreenChangeListener);
	},

	removeListenerFromCanvas() {
		if (!this.canvasFullscreenChangeListener) {
			return;
		}
		Sunniesnow.game.canvas.removeEventListener('fullscreenchange', this.canvasFullscreenChangeListener);
	}
};
