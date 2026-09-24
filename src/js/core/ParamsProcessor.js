import Sunniesnow from '../Sunniesnow.js';

Sunniesnow.ParamsProcessor = {

	// Functions here can be async, but they are not awaited.
	// Only URL parameters that do not match a setting key should be looked up here.
	EXTRA_URL_PARAMS: {
		instantStart(value) {
			Sunniesnow.Game.run();
		},
		vscodeBrowserReqId(value) {
			// Do nothing.
			// Do not populate Sunniesnow.vscodeBrowserReqId here.
			// It is populated in the entry point of the web page instead.
		}
	},

	async run() {
		Sunniesnow.Patches.apply();
		Sunniesnow.MiscDom.adjustCustomJudgementWindowsTable();
		Sunniesnow.Settings.init();
		await Sunniesnow.I18n.init();
		Sunniesnow.I18n.apply();
		Sunniesnow.PinnedCoordinates.init();
		Sunniesnow.MiscDom.addEventListeners();
		Sunniesnow.MiscDom.removeSiteLoadingNotice();
		this.processUrlParams();
		await Sunniesnow.CacheManager.registerServiceWorker();
	},

	processUrlParams() {
		const params = Sunniesnow.Utils.urlSearchParamsObject();
		const processedParams = {};
		for (const key in this.EXTRA_URL_PARAMS) {
			if (Object.hasOwn(params, key)) {
				processedParams[key] = params[key];
				delete params[key];
			}
		}
		const settings = {};
		for (const key in params) {
			settings[Sunniesnow.Utils.slugToCamel(key)] = params[key];
		}
		Sunniesnow.Settings.writeSettings(settings);
		for (const key in processedParams) {
			this.EXTRA_URL_PARAMS[key].call(this, processedParams[key]);
		}
	},
};
