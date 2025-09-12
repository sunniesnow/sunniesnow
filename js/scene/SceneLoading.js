Sunniesnow.SceneLoading = class SceneLoading extends Sunniesnow.Scene {

	constructor() {
		super();
		this.label = 'scene-loading';
	}

	start() {
		super.start();
		if (Sunniesnow.Utils.isBrowser()) {
			this.ui = new Sunniesnow.LoadingProgress();
			this.addChild(this.ui);
		}
	}

	update(delta) {
		super.update(delta);
		Sunniesnow.Loader.updateLoading();
		if (Sunniesnow.Utils.isBrowser()) {
			this.ui.update();
		}
		if (Sunniesnow.Loader.loadingComplete) {
			Sunniesnow.game.goto(new Sunniesnow.SceneGame());
		}
	}

	terminate() {
		super.terminate();
		if (Sunniesnow.Utils.isBrowser()) {
			document.activeElement.blur();
			Sunniesnow.Settings.clearDownloadingProgresses();
		}
		Sunniesnow.game.postLoading();
	}
};
