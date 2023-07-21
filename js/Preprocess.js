Sunniesnow.Preprocess = {

	EXTRA_URL_PARAMS: {
		instantStart(value) {
			Sunniesnow.Game.run();
		}
	},

	async run() {
		this.associateDomElements();
		this.setDeviceDependentDefaults();
		await Sunniesnow.Loader.writeSavedSettings();
		this.readUrlParams();
	},

	setDeviceDependentDefaults() {
		this.setResolution();
		this.setRenderer();
	},

	setResolution() {
		const [height, width] = Sunniesnow.Utils.minmax(screen.width * devicePixelRatio, screen.height * devicePixelRatio);
		Sunniesnow.Loader.writeValue('width', width);
		Sunniesnow.Loader.writeValue('height', height);
		const canvas = document.getElementById('main-canvas');
		canvas.width = width;
		canvas.height = height;
	},

	setRenderer() {
		if (!Sunniesnow.Utils.supportsGl()) {
			Sunniesnow.Loader.writeRadio('renderer', 'canvas');
		}
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
	},

	associateRadio(radioId, inputId) {
		const radio = document.getElementById(radioId);
		const radios = document.getElementsByName(radio.name);
		const input = document.getElementById(inputId);
		const listener = () => input.disabled = !radio.checked;
		for (const otherRadio of radios) {
			otherRadio.addEventListener('change', listener);
		}
		listener();
	},

	associateRange(rangeId, valueId) {
		const range = document.getElementById(rangeId);
		const value = document.getElementById(valueId);
		const listener = () => value.innerText = range.value;
		range.addEventListener('input', listener);
		listener();
	},

	associateDomElements() {
		this.associateRadio('level-file-online-radio', 'level-file-online');
		this.associateRadio('level-file-online-radio', 'level-file-online-button');
		this.associateRadio('level-file-upload-radio', 'level-file-upload');
		this.associateRadio('background-online-radio', 'background-online');
		this.associateRadio('background-from-level-radio', 'background-from-level');
		this.associateRadio('background-upload-radio', 'background-upload');
		this.associateRadio('skin-online-radio', 'skin-online');
		this.associateRadio('skin-upload-radio', 'skin-upload');
		this.associateRadio('fx-online-radio', 'fx-online');
		this.associateRadio('fx-upload-radio', 'fx-upload');
		this.associateRadio('se-online-radio', 'se-online');
		this.associateRadio('se-upload-radio', 'se-upload');
		this.associateRadio('renderer-webgl-radio', 'antialias');
		this.associateRadio('renderer-webgl-radio', 'power-preference-default-radio');
		this.associateRadio('renderer-webgl-radio', 'power-preference-low-power-radio');
		this.associateRadio('renderer-webgl-radio', 'power-preference-high-performance-radio');
		this.associateRange('volume-se', 'volume-se-value');
		this.associateRange('volume-music', 'volume-music-value');
		this.associateRange('background-blur', 'background-blur-value');
		this.associateRange('background-brightness', 'background-brightness-value');
	}
};

if (typeof window === 'object') {
	window.addEventListener('load', () => Sunniesnow.Preprocess.run());
}
