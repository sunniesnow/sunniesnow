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
		Sunniesnow.game.canvas.requestFullscreen().then(
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
	},

	quit() {
		this.quitting = true;
		document.exitFullscreen().then(
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
	},

	addListenerToCanvas() {
		this.canvasFullscreenChangeListener = event => this.should = !!document.fullscreenElement;
		Sunniesnow.game.canvas.addEventListener('fullscreenchange', this.canvasFullscreenChangeListener);
	},

	removeListenerFromCanvas() {
		if (!this.canvasFullscreenChangeListener) {
			return;
		}
		Sunniesnow.game.canvas.removeEventListener('fullscreenchange', this.canvasFullscreenChangeListener);
	}
};
