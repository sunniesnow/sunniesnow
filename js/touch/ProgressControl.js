Sunniesnow.ProgressControl = {

	FORWARD_KEY: ']',
	REWIND_KEY: '[',
	STEP_FORWARD_KEY: '.',
	STEP_REWIND_KEY: ',',
	SEEK_FORWARD_KEY: 'ArrowRight',
	SEEK_REWIND_KEY: 'ArrowLeft',
	STEP_DURATION: 1/30,
	SEEK_DURATION: 2,

	init(scene) {
		this.touchHeight = Sunniesnow.game.settings.height / 10;
		this.scene = scene;
		this.clear();
		this.addDraggingListeners();
		this.addKeyListeners();
	},

	clear() {
		this.status = 'none'; // none, dragging, forwarding, rewinding
		this.draggingTouches = [];
	},

	update(delta) {
		this.updateDragging();
		this.updateForwarding();
		this.updateRewinding();
	},

	addKeyListeners() {
		this.keyDownListener = touch => {
			if (touch.key === this.FORWARD_KEY) {
				this.beginForwarding();
				return true;
			}
			if (touch.key === this.REWIND_KEY) {
				this.beginRewinding();
				return true;
			}
			if (touch.key === this.STEP_FORWARD_KEY) {
				this.stepForward();
				return true;
			}
			if (touch.key === this.STEP_REWIND_KEY) {
				this.stepRewind();
				return true;
			}
			if (touch.key === this.SEEK_FORWARD_KEY) {
				this.seekForward();
				return true;
			}
			if (touch.key === this.SEEK_REWIND_KEY) {
				this.seekRewind();
				return true;
			}
			return false;
		};
		Sunniesnow.TouchManager.addStartListener(this.keyDownListener, -5);
		this.keyUpListener = touch => {
			if (touch.key === this.FORWARD_KEY) {
				this.endForwarding();
				return true;
			}
			if (touch.key === this.REWIND_KEY) {
				this.endRewinding();
				return true;
			}
			return false;
		};
		Sunniesnow.TouchManager.addEndListener(this.keyUpListener, -5);
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
		};
		Sunniesnow.TouchManager.addEndListener(this.dragEndListener, -10);
	},

	beginDragging() {
		if (this.status !== 'none') {
			return;
		}
		this.status = 'dragging';
		this.scene.pauseBoard.hiddenByPauseButton = true;
	},

	endDragging() {
		if (this.status !== 'dragging') {
			return;
		}
		this.status = 'none';
		this.scene.pauseBoard.hiddenByPauseButton = Sunniesnow.game.settings.hidePauseUi;
	},

	updateDragging() {
		if (this.draggingTouches.length === 0 || this.status !== 'dragging') {
			return;
		}
		const x = Sunniesnow.Utils.average(this.draggingTouches, touch => touch.end().canvasX);
		this.scene.adjustProgress(x / Sunniesnow.game.settings.width * Sunniesnow.Music.duration, 'pause');
	},

	beginForwarding() {
		if (this.status !== 'none') {
			return;
		}
		this.status = 'forwarding';
		if (Sunniesnow.Music.pausing) {
			Sunniesnow.Music.play(Sunniesnow.Music.currentTime);
		}
	},

	endForwarding() {
		if (this.status !== 'forwarding') {
			return;
		}
		this.status = 'none';
		Sunniesnow.Music.pause();
		this.scene.pauseBoard.hiddenByPauseButton = Sunniesnow.game.settings.hidePauseUi;
	},

	updateForwarding() {
		if (this.status !== 'forwarding') {
			return;
		}
		// do nothing
	},

	beginRewinding() {
		if (this.status !== 'none') {
			return;
		}
		this.status = 'rewinding';
	},

	endRewinding() {
		if (this.status !== 'rewinding') {
			return;
		}
		this.status = 'none';
		this.scene.pauseBoard.hiddenByPauseButton = Sunniesnow.game.settings.hidePauseUi;
	},

	updateRewinding() {
		if (this.status !== 'rewinding') {
			return;
		}
		this.scene.adjustProgress(Sunniesnow.Music.currentTime - 1/Sunniesnow.game.app.ticker.FPS, 'pause');
		this.scene.pauseBoard.hiddenByPauseButton = true;
	},

	stepForward() {
		this.status = 'none';
		this.scene.adjustProgress(Sunniesnow.Music.currentTime + this.STEP_DURATION, 'pause');
	},

	stepRewind() {
		this.status = 'none';
		this.scene.adjustProgress(Sunniesnow.Music.currentTime - this.STEP_DURATION, 'pause');
	},

	seekForward() {
		this.scene.adjustProgress(Sunniesnow.Music.currentTime + this.SEEK_DURATION, 'seek');
	},

	seekRewind() {
		this.scene.adjustProgress(Sunniesnow.Music.currentTime - this.SEEK_DURATION, 'seek');
	}

};
