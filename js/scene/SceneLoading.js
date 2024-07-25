Sunniesnow.SceneLoading = class SceneLoading extends Sunniesnow.Scene {

	start() {
		super.start();
		if (Sunniesnow.Utils.isBrowser()) {
			this.ui = new Sunniesnow.LoadingProgress();
			this.addChild(this.ui);
		}
	}

	update() {
		super.update();
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
		Sunniesnow.game.initInteraction();
	}
};
