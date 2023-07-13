Sunniesnow.Preprocess = {
	async run() {
		this.setDeviceDependentDefaults();
		await Sunniesnow.Loader.writeSavedSettings();
		this.readUrlParams();
	},

	setDeviceDependentDefaults() {
		const [height, width] = Sunniesnow.Utils.minmax(screen.width, screen.height);
		document.getElementById('width').value = width;
		document.getElementById('height').value = height;
	},

	readUrlParams() {
		const params = Sunniesnow.Utils.urlSearchParamsObject();
		Sunniesnow.Loader.writeSettings(params);
		if (Object.hasOwn(params, 'instantStart')) {
			Sunniesnow.Game.run();
		}
	}
};

window.addEventListener('load', () => Sunniesnow.Preprocess.run());
