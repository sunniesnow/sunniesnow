Sunniesnow.Popup = {

	async create() {
		return new Promise(resolve => {
			this.window = open('popup', 'Sunniesnow popup', 'popup');
			this.window.addEventListener('load', event => {
				this.window.addEventListener('beforeunload', event => {
					Sunniesnow.Logs.warn('Stopping the game because the popup is unloaded');
					Sunniesnow.game?.terminate()
				});
				this.addWindowListeners();
				resolve();
			});
		});
	},

	close() {
		this.removeWindowListeners();
		this.window?.close();
	},

	addWindowListeners() {
		this.beforeunloadListener = event => {
			this.close();
		};
		window.addEventListener('beforeunload', this.beforeunloadListener);
	},

	removeWindowListeners() {
		if (!this.beforeunloadListener) {
			return;
		}
		window.removeEventListener('beforeunload', this.beforeunloadListener);
	}
};
