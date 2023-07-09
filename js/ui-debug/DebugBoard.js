Sunniesnow.DebugBoard = class DebugBoard extends PIXI.Container {

	constructor() {
		super();
		this.populate();
		this.addTouchListeners();
	}

	populate() {
		this.createTouchGeometry();
		this.earlyLateTexts = [];
		this.createTouchAreaGeometry();
	}

	addTouchListeners() {
		Sunniesnow.TouchManager.addStartListener(this.touchStartListener = this.touchStart.bind(this))
		Sunniesnow.TouchManager.addMoveListener(this.touchMoveListener = this.touchMove.bind(this));
		Sunniesnow.TouchManager.addEndListener(this.touchEndListener = this.touchEnd.bind(this));
	}

	removeTouchListeners() {
		Sunniesnow.TouchManager.removeStartListener(this.touchStartListener);
		Sunniesnow.TouchManager.removeMoveListener(this.touchMoveListener);
		Sunniesnow.TouchManager.removeEndListener(this.touchEndListener);
	}

	createTouchGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0xff00ff, 0.5);
		graphics.drawCircle(0, 0, 10);
		graphics.endFill();
		this.touchGeometry = graphics.geometry;
		this.touches = {};
	}

	createTouchAreaGeometry() {
		const radius = Sunniesnow.Config.noteRadius() * Sunniesnow.game.settings.noteHitSize;
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0xff00ff, 0.1);
		graphics.drawRect(-radius, -radius, radius*2, radius*2);
		graphics.endFill();
		this.touchAreaGeometry = graphics.geometry;
		this.touchAreas = [];
	}

	update(delta) {
		this.updateEarlyLateTexts(delta);
		this.updateTouchAreas(delta);
	}

	touchStart(touch) {
		const id = touch.id;
		const touchUi = this.touches[id] = new PIXI.Graphics(this.touchGeometry);
		const text = touchUi.text = new PIXI.Text('', {
			fontSize: 20,
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
		const {x, y} = touch.end();
		[touchUi.x, touchUi.y] = Sunniesnow.Config.chartMapping(x, y);
		touchUi.text.text = `${touch.id}(x:${x.toFixed(1)},y:${y.toFixed(1)})`;
		if (touchUi.x + touchUi.width > Sunniesnow.game.settings.width) {
			touchUi.text.anchor.x = 1;
			touchUi.text.x = -10;
		} else {
			touchUi.text.anchor.x = 0;
			touchUi.text.x = 10;
		}
	}

	touchEnd(touch) {
		const touchUi = this.touches[touch.id];
		touchUi.destroy({ children: true });
		this.removeChild(touchUi);
		delete this.touches[touch.id];
	}

	createEarlyLateText(uiNote) {
		const text = Math.round(uiNote.levelNote.hitRelativeTime * 1000).toString();
		const earlyLateText = new PIXI.Text(text, {
			fontFamily: 'Arial',
			fontSize: 50,
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
		const graphics = new PIXI.Graphics(this.touchAreaGeometry);
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
