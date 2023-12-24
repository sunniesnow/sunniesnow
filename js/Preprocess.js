Sunniesnow.Preprocess = {

	EXTRA_URL_PARAMS: {
		instantStart(value) {
			Sunniesnow.Game.run();
		}
	},

	async run() {
		Sunniesnow.Patches.apply();
		await Sunniesnow.Dom.preprocess();
		this.readUrlParams();
		await this.registerServiceWorker();
	},

	readUrlParams() {
		const params = Sunniesnow.Utils.urlSearchParamsObject();
		const processedParams = {};
		for (const key in this.EXTRA_URL_PARAMS) {
			if (Object.hasOwn(params, key)) {
				processedParams[key] = params[key];
				delete params[key];
			}
		}
		Sunniesnow.Dom.writeSettings(params);
		for (const key in processedParams) {
			this.EXTRA_URL_PARAMS[key].call(this, processedParams[key]);
		}
	},

	async registerServiceWorker() {
		const sw = navigator.serviceWorker;
		if (!sw) {
			Sunniesnow.Utils.warn('Service worker is not supported on this browser')
			return;
		}
		try {
			if (Sunniesnow.serviceWorkerRegistration) {
				Sunniesnow.serviceWorkerRegistration = await Sunniesnow.serviceWorkerRegistration.update();
			} else {
				Sunniesnow.serviceWorkerRegistration = await sw.register('/game/service-worker.js', {scope: '/game/'});
			}
		} catch (error) {
			Sunniesnow.Utils.warn(`Failed to register service worker: ${error}`, error);
		}
	}

};
