Sunniesnow.Preprocess = {
	run() {
		this.setDeviceDependentDefaults();
		this.readUrlParams();
	},

	setDeviceDependentDefaults() {
		const [height, width] = Sunniesnow.Utils.minmax(screen.width, screen.height);
		document.getElementById('width').value = width;
		document.getElementById('height').value = height;
	},

	readUrlParams() {
		const params = new URLSearchParams(location.search);
		// TODO: instant-start
	}
};

window.addEventListener('load', () => Sunniesnow.Preprocess.run());
