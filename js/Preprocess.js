Sunniesnow.Preprocess = {

	EXTRA_URL_PARAMS: {
		instantStart(value) {
			Sunniesnow.Game.run();
		},

		record(value) {
			this.record = true;
		}
	},

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
		for (const key in this.EXTRA_URL_PARAMS) {
			if (Object.hasOwn(params, key)) {
				this.EXTRA_URL_PARAMS[key].call(this, params[key]);
				delete params[key];
			}
		}
		Sunniesnow.Loader.writeSettings(params);
	}
};

window.addEventListener('load', () => Sunniesnow.Preprocess.run());
