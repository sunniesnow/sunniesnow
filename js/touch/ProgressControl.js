Sunniesnow.ProgressControl = {
	init(scene) {
		this.touchHeight = Sunniesnow.game.settings.height / 10;
		this.scene = scene;
		this.clear();
		this.addDraggingListeners();
	},

	clear() {
		this.draggingTouches = [];
	},

	update(delta) {
		this.updateDragging();
	},

	addDraggingListeners() {
		this.dragStartListener = touch => {
			if (touch.start().canvasY < Sunniesnow.game.settings.height - this.touchHeight) {
				return false;
			}
			this.draggingTouches.push(touch);
			if (this.draggingTouches.length === 1) {
				this.beginDragging();
			}
			return true;
		};
		Sunniesnow.TouchManager.addStartListener(this.dragStartListener, -10);
		this.dragEndListener = touch => {
			const index = this.draggingTouches.indexOf(touch);
			if (index < 0) {
				return false;
			}
			this.draggingTouches.splice(index, 1);
			if (this.draggingTouches.length === 0) {
				this.endDragging();
			}
			return true;
		}
		Sunniesnow.TouchManager.addEndListener(this.dragEndListener, -10);
	},

	beginDragging() {
		this.scene.pauseBoard.hiddenByPauseButton = true;
	},

	endDragging() {
		this.scene.pauseBoard.hiddenByPauseButton = Sunniesnow.game.settings.hidePauseUi;
	},

	updateDragging() {
		if (this.draggingTouches.length === 0) {
			return;
		}
		const x = Sunniesnow.Utils.average(this.draggingTouches, touch => touch.end().canvasX);
		this.scene.adjustProgress(x / Sunniesnow.game.settings.width * Sunniesnow.Music.duration, 'pause');
	},
};
