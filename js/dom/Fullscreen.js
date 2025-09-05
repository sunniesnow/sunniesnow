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
		if (Sunniesnow.game.settings.floatAsFullscreen) {
			Sunniesnow.game.canvas.classList.add('float-fullscreen');
			this.entering = false;
			this.is = true;
			return;
		}
		const promise = Sunniesnow.game.canvas.requestFullscreen();
		if (typeof promise?.then === 'function') {
			promise.catch(reason => {
				this.entering = false;
				Sunniesnow.Logs.warn('Failed to request fullscreen: ' + reason, reason);
			});
		} else {
			this.entering = false;
			this.is = true;
		}
	},

	quit() {
		this.quitting = true;
		if (Sunniesnow.game.settings.floatAsFullscreen) {
			Sunniesnow.game.canvas.classList.remove('float-fullscreen');
			this.quitting = false;
			this.is = false;
			return;
		}
		const promise = Sunniesnow.game.document.exitFullscreen();
		if (typeof promise?.then === 'function') {
			promise.catch(reason => {
				this.quitting = false;
				Sunniesnow.Logs.warn('Failed to exit fullscreen: ' + reason, reason);
			});
		} else {
			this.quitting = false;
			this.is = false;
		}
	},

	addListenerToCanvas() {
		this.canvasFullscreenChangeListener = event => {
			this.entering = this.quitting = false;
			this.should = this.is = !!Sunniesnow.game.document.fullscreenElement;
		};
		Sunniesnow.game.canvas.addEventListener('fullscreenchange', this.canvasFullscreenChangeListener);
	},

	removeListenerFromCanvas() {
		if (!this.canvasFullscreenChangeListener) {
			return;
		}
		Sunniesnow.game.canvas.removeEventListener('fullscreenchange', this.canvasFullscreenChangeListener);
	}
};
