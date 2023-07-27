Sunniesnow.PixiPatches = {
	apply() {
		this.patchHasProtocol();
	},

	patchHasProtocol() {
		PIXI.utils.path.hasProtocol = function (path) {
			return (/^[^/:]+:/).test(this.toPosix(path));
		};
	}
};
