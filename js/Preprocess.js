Sunniesnow.Preprocess = {

	EXTRA_URL_PARAMS: {
		instantStart(value) {
			Sunniesnow.Game.run();
		},
		vscodeBrowserReqId(value) {
			// Do nothing.
			// Do not populate Sunniesnow.vscodeBrowserReqId here because
			// this file itself may be cached by VS Code simple browser
			// and because Sunniesnow.ScriptsLoader needs it before Sunniesnow.Preprocess.run().
			// Sunniesnow.vscodeBrowserReqId is populated in _head.html instead.
		}
	},

	async preprocess() {
		Sunniesnow.MiscDom.addScrollbarToAndroidWebView();
		Sunniesnow.MiscDom.adjustCustomJudgementWindowsTable();
		Sunniesnow.Settings.setDeviceDependentDefaults();
		await Sunniesnow.Settings.writeSavedSettings();
		Sunniesnow.Settings.setTextInputs();
		Sunniesnow.Settings.associateDomElements();
		Sunniesnow.PinnedCoordinates.init();
		Sunniesnow.MiscDom.addEventListeners();
	},

	async run() {
		Sunniesnow.Patches.apply();
		await this.preprocess();
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
		Sunniesnow.Settings.writeSettings(params);
		for (const key in processedParams) {
			this.EXTRA_URL_PARAMS[key].call(this, processedParams[key]);
		}
	},

	async registerServiceWorker() {
		const sw = navigator.serviceWorker;
		if (!sw) {
			Sunniesnow.Logs.warn('Service worker is not supported on this browser')
			return;
		}
		try {
			if (Sunniesnow.serviceWorkerRegistration) {
				Sunniesnow.serviceWorkerRegistration = await Sunniesnow.serviceWorkerRegistration.update();
			} else {
				Sunniesnow.serviceWorkerRegistration = await sw.register('/game/service-worker.js', {scope: '/game/'});
			}
		} catch (error) {
			Sunniesnow.Logs.warn(`Failed to register service worker: ${error}`, error);
		}
	}

};
