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
		Sunniesnow.Settings.init();
		await Sunniesnow.I18n.init();
		Sunniesnow.I18n.apply();
		Sunniesnow.PinnedCoordinates.init();
		Sunniesnow.MiscDom.addEventListeners();
		Sunniesnow.MiscDom.removeSiteLoadingNotice();
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
				const base = Sunniesnow.Utils.base();
				let swUrl = `${base}/service-worker.js`;
				if (Sunniesnow.vscodeBrowserReqId) {
					swUrl += `?vscodeBrowserReqId=${Sunniesnow.vscodeBrowser}`;
				}
				Sunniesnow.serviceWorkerRegistration = await sw.register(swUrl, {scope: `${base}/`});
			}
		} catch (error) {
			Sunniesnow.Logs.warn(`Failed to register service worker: ${error}`, error);
		}
	}

};
