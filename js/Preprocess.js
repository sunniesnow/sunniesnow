Sunniesnow.Preprocess = {

	EXTRA_URL_PARAMS: ['instantStart', 'record'],

	async run() {
		this.setDeviceDependentDefaults();
		await Sunniesnow.Loader.writeSavedSettings();
		this.readUrlParams();
	},

	setDeviceDependentDefaults() {
		const [height, width] = Sunniesnow.Utils.minmax(screen.width, screen.height);
		document.getElementById('width').value = width;
		document.getElementById('height').value = height;
		const canvas = document.getElementById('main-canvas');
		canvas.width = width;
		canvas.height = height;
	},

	readUrlParams() {
		const params = Sunniesnow.Utils.urlSearchParamsObject();
		for (const key of this.EXTRA_URL_PARAMS) {
			if (Object.hasOwn(params, key)) {
				this[key](params[key]);
				delete params[key];
			}
		}
		Sunniesnow.Loader.writeSettings(params);
	},

	instantStart(value) {
		Sunniesnow.Game.run();
	},

	record(value) {
		this.record = true;
	}
};

window.addEventListener('load', () => Sunniesnow.Preprocess.run());
