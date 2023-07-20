Sunniesnow.DebugBoard = class DebugBoard extends PIXI.Container {

	static async load() {
		this.touchGeometry = this.createTouchGeometry();
		this.touchAreaGeometry = this.createTouchAreaGeometry();
	}

	constructor() {
		super();
		this.touches = {};
		this.touchAreas = [];
		this.earlyLateTexts = [];
		this.addTouchListeners();
	}

	addTouchListeners() {
		Sunniesnow.TouchManager.addStartListener(this.touchStartListener = this.touchStart.bind(this), 200)
		Sunniesnow.TouchManager.addMoveListener(this.touchMoveListener = this.touchMove.bind(this), 200);
		Sunniesnow.TouchManager.addEndListener(this.touchEndListener = this.touchEnd.bind(this), 200);
	}

	removeTouchListeners() {
		Sunniesnow.TouchManager.removeStartListener(this.touchStartListener);
		Sunniesnow.TouchManager.removeMoveListener(this.touchMoveListener);
		Sunniesnow.TouchManager.removeEndListener(this.touchEndListener);
	}

	static createTouchGeometry() {
		this.touchRadius = Sunniesnow.game.settings.width / 180;
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0xff00ff, 0.5);
		graphics.drawCircle(0, 0, this.touchRadius);
		graphics.endFill();
		return graphics.geometry;
	}

	static createTouchAreaGeometry() {
		const radius = Sunniesnow.Config.noteRadius() * Sunniesnow.game.settings.noteHitSize;
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0xff00ff, 0.1);
		graphics.drawRect(-radius, -radius, radius*2, radius*2);
		graphics.endFill();
		return graphics.geometry;
	}

	update(delta) {
		this.updateEarlyLateTexts(delta);
		this.updateTouchAreas(delta);
	}

	touchStart(touch) {
		const id = touch.id;
		const touchUi = this.touches[id] = new PIXI.Graphics(this.constructor.touchGeometry);
		const text = touchUi.text = new PIXI.Text('', {
			fontSize: Sunniesnow.game.settings.width / 90,
			fill: '#ff00ff',
			fontFamily: 'Arial',
		});
		text.anchor = new PIXI.ObservablePoint(null, null, 0, 0.5);
		touchUi.addChild(text);
		touchUi.alpha = 0.4;
		this.addChild(touchUi);
	}

	touchMove(touch) {
		const touchUi = this.touches[touch.id];
		if (!touchUi) {
			return;
		}
		const {x, y} = touch.end();
		[touchUi.x, touchUi.y] = Sunniesnow.Config.chartMapping(x, y);
		touchUi.text.text = `${touch.id}(${x.toFixed(1)},${y.toFixed(1)})`;
		if (touchUi.x + touchUi.width > Sunniesnow.game.settings.width) {
			touchUi.text.anchor.x = 1;
			touchUi.text.x = -this.constructor.touchRadius;
		} else {
			touchUi.text.anchor.x = 0;
			touchUi.text.x = this.constructor.touchRadius;
		}
	}

	touchEnd(touch) {
		const touchUi = this.touches[touch.id];
		if (!touchUi) {
			return;
		}
		touchUi.destroy({children: true});
		this.removeChild(touchUi);
		delete this.touches[touch.id];
	}

	createEarlyLateText(uiNote) {
		const text = Math.round(uiNote.levelNote.hitRelativeTime * 1000).toString();
		const earlyLateText = new PIXI.Text(text, {
			fontFamily: 'Arial',
			fontSize: Sunniesnow.game.settings.width / 36,
			fill: '#ff00ff',
			align: 'center'
		});
		earlyLateText.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		earlyLateText.x = uiNote.x;
		earlyLateText.y = uiNote.y;
		this.addChild(earlyLateText);
		this.earlyLateTexts.push(earlyLateText);
	}

	updateEarlyLateTexts(delta) {
		for (let i = 0; i < this.earlyLateTexts.length;) {
			const earlyLateText = this.earlyLateTexts[i];
			earlyLateText.alpha -= 0.02 * delta;
			if (earlyLateText.alpha <= 0) {
				earlyLateText.destroy();
				this.removeChild(earlyLateText);
				this.earlyLateTexts.splice(i, 1);
			} else {
				i++;
			}
		}
	}

	createTouchArea(uiNote) {
		const graphics = new PIXI.Graphics(this.constructor.touchAreaGeometry);
		graphics.x = uiNote.x;
		graphics.y = uiNote.y;
		graphics.uiNote = uiNote;
		this.addChild(graphics);
		this.touchAreas.push(graphics);
	}

	updateTouchAreas(delta) {
		for (let i = 0; i < this.touchAreas.length;) {
			const touchArea = this.touchAreas[i];
			const state = touchArea.uiNote.state;
			if (!touchArea.uiNote.parent || state === 'fadingOut' || state === 'finished') {
				touchArea.destroy();
				this.removeChild(touchArea);
				this.touchAreas.splice(i, 1);
			} else {
				i++;
			}
		}
	}
};
