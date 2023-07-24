Sunniesnow.Preprocess = {

	EXTRA_URL_PARAMS: {
		instantStart(value) {
			Sunniesnow.Game.run();
		}
	},

	async run() {
		this.applyPatches();
		Sunniesnow.Dom.associateDomElements();
		Sunniesnow.Dom.setDeviceDependentDefaults();
		await Sunniesnow.Dom.writeSavedSettings();
		this.readUrlParams();
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

};

if (Sunniesnow.Utils.isBrowser()) {
	window.addEventListener('load', () => Sunniesnow.Preprocess.run());
}
