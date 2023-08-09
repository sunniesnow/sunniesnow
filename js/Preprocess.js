Sunniesnow.Preprocess = {

	EXTRA_URL_PARAMS: {
		instantStart(value) {
			Sunniesnow.Game.run();
		}
	},

	async run() {
		this.applyPatches();
		Sunniesnow.Dom.addEventListeners();
		Sunniesnow.Dom.associateDomElements();
		Sunniesnow.Dom.setDeviceDependentDefaults();
		await Sunniesnow.Dom.writeSavedSettings();
		this.readUrlParams();
		await this.registerServiceWorker();
	},

	applyPatches() {
		Sunniesnow.Patches.apply();
	},

	readUrlParams() {
		const params = Sunniesnow.Utils.urlSearchParamsObject();
		for (const key in this.EXTRA_URL_PARAMS) {
			if (Object.hasOwn(params, key)) {
				this.EXTRA_URL_PARAMS[key].call(this, params[key]);
				delete params[key];
			}
		}
		Sunniesnow.Dom.writeSettings(params);
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
