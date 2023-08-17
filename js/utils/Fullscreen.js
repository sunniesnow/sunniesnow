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
		if (typeof navigator.standalone === 'boolean' && !navigator.standalone) {
			Sunniesnow.Utils.warn(
				'Consider ' +
				'<a href="https://support.apple.com/guide/iphone/bookmark-favorite-webpages-iph42ab2f3a7/ios#iph4f9a47bbc">adding to home screen</a>' +
				' to have a better experience on iOS.'
			);
		}
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
				Sunniesnow.Utils.warn('Failed to request fullscreen: ' + reason, reason);
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
		const promise = document.exitFullscreen();
		if (typeof promise?.then === 'function') {
			promise.catch(reason => {
				this.quitting = false;
				Sunniesnow.Utils.warn('Failed to exit fullscreen: ' + reason, reason);
			});
		} else {
			this.quitting = false;
			this.is = false;
		}
	},

	addListenerToCanvas() {
		this.canvasFullscreenChangeListener = event => {
			this.entering = this.quitting = false;
			this.should = this.is = !!document.fullscreenElement;
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
