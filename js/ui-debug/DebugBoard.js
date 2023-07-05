Sunniesnow.DebugBoard = class DebugBoard extends PIXI.Container {


	constructor() {
		super();
		this.populate();
	}

	populate() {
		this.createTouchGeometry();
		this.earlyLateTexts = [];
		this.createTouchAreaGeometry();
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

	updateTouches(touches) {
		for (let i = 0; i < touches.length; i++) {
			const touchEvent = touches[i];
			const id = touchEvent.identifier;
			let touch = this.touches[id];
			if (!touch) {
				touch = this.touches[id] = new PIXI.Graphics(this.touchGeometry);
				const text = touch.text = new PIXI.Text('', {
					fontSize: 20,
					fill: '#ff00ff',
					fontFamily: 'Arial',
				});
				text.anchor = new PIXI.ObservablePoint(null, null, 0, 0.5);
				touch.addChild(text);
				touch.alpha = 0.4;
				this.addChild(touch);
			}
			touch.justUpdated = true;
			[touch.x, touch.y] = Sunniesnow.Utils.pageToCanvasCoordinates(touchEvent.pageX, touchEvent.pageY, Sunniesnow.game.canvas);
			const [chartX, chartY] = Sunniesnow.Config.pageMapping(touchEvent.pageX, touchEvent.pageY);
			touch.text.text = `${id}(${chartX.toFixed(1)},${chartY.toFixed(1)})`;
			if (touch.x + touch.width > Sunniesnow.game.settings.width) {
				touch.text.anchor.x = 1;
				touch.text.x = -10;
			} else {
				touch.text.anchor.x = 0;
				touch.text.x = 10;
			}
		}
		for (const id in this.touches) {
			const touch = this.touches[id];
			if (touch.justUpdated) {
				touch.justUpdated = false;
			} else {
				touch.destroy({ children: true });
				this.removeChild(touch);
				delete this.touches[id];
			}
		}
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
