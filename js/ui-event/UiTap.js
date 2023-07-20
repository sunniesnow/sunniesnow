Sunniesnow.UiTap = class UiTap extends Sunniesnow.UiNote {

	FADING_OUT_DURATION = 2/3;

	static async load() {
		this.radius = Sunniesnow.Config.noteRadius();
		this.circleRadius = this.radius * 4;
		this.circleGeometry = this.createCircleGeometry(0xeefefe);
		this.doubleCircleGeometry = this.createCircleGeometry(0xf9f9e9);
		this.geometry = this.createGeometry(0x29a9b9, 0xe8f8b8);
		this.doubleGeometry = this.createGeometry(0x3171d1, 0xe3f3f3);
	}

	static createCircleGeometry(color) {
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(this.radius / 4, color, 1, 0);
		graphics.drawCircle(0, 0, this.circleRadius);
		return graphics.geometry;
	}

	static createGeometry(fillColor, lineColor) {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(fillColor);
		graphics.lineStyle(this.radius / 8, lineColor, 1, 0);
		graphics.drawCircle(0, 0, this.radius);
		graphics.endFill();
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.connectedPos = this.getConnectedPos();
		if (this.hasConnectedTap()) {
			this.noteBody = new PIXI.Graphics(Sunniesnow.UiTap.doubleGeometry);
			this.circle = new PIXI.Graphics(Sunniesnow.UiTap.doubleCircleGeometry);
			if (this.connectedPos) {
				this.doubleLine = new PIXI.Graphics();
				this.addChild(this.doubleLine);
			}
		} else {
			this.noteBody = new PIXI.Graphics(Sunniesnow.UiTap.geometry);
			this.circle = new PIXI.Graphics(Sunniesnow.UiTap.circleGeometry);
		}
		this.text = this.createText();
		this.addChild(this.circle);
		this.note = new PIXI.Container();
		this.note.addChild(this.noteBody)
		this.note.addChild(this.text);
		this.addChild(this.note);
	}

	hasConnectedTap() {
		return this.event.simultaneousEvents.some(event => {
			return event !== this.event && (event instanceof Sunniesnow.Tap)
		});
	}

	getConnectedPos() {
		let match = null;
		for (let i = 0; i < this.event.simultaneousEvents.length; i++) {
			const event = this.event.simultaneousEvents[i];
			if (!(event instanceof Sunniesnow.Tap)) {
				continue;
			}
			if (match === this.event) {
				const [x, y] = Sunniesnow.Config.chartMapping(event.x, event.y);
				const [x0, y0] = Sunniesnow.Config.chartMapping(this.event.x, this.event.y);
				return [x - x0, y - y0];
			}
			match = event;
		}
		return null;
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		this.note.scale.set(progress);
		this.circle.scale.set(1 - (progress-1)**2);
		this.circle.alpha = progress / 3;
		if (this.connectedPos) {
			this.doubleLine.clear();
			this.doubleLine.lineStyle(this.constructor.radius / 12, 0xf9f9e9);
			Sunniesnow.Utils.drawDashedLine(
				this.doubleLine,
				(1-progress) * this.connectedPos[0] / 2,
				(1-progress) * this.connectedPos[1] / 2,
				(1+progress) * this.connectedPos[0] / 2,
				(1+progress) * this.connectedPos[1] / 2,
				this.constructor.radius / 4,
				this.constructor.radius / 4
			);
		}
	}

	updateActive(progress, relativeTime) {
		super.updateActive(progress, relativeTime);
		this.note.scale.set(1);
		const targetCircleScale = this.constructor.radius / this.constructor.circleRadius;
		if (progress <= 1) {
			this.circle.visible = true;
			this.circle.scale.set(1 - (1-targetCircleScale) * progress);
			this.circle.alpha = (1/3 + 2/3 * progress);
		} else {
			this.circle.visible = false;
		}
	}

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		this.updateTextFadingOut(progress);
		this.circle.visible = false;
		this.noteBody.visible = false;
		if (this.connectedPos) {
			this.doubleLine.visible = false;
		}
	}

	createText(maxWidth, maxSize, font) {
		maxWidth ||= this.constructor.radius * 1.5;
		maxSize ||= this.constructor.radius;
		const text = new PIXI.Text(this.event.text, {
			fontSize: maxSize,
			fill: 'white',
			align: 'center',
			fontFamily: font || 'Arial'
		});
		text.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		text.scale.set(Math.min(maxWidth / text.width, 1));
		return text;
	}

	updateTextFadingOut(progress) {
		if (!this.text.text) {
			return;
		}
		if (this.levelNote.judgement === 'miss' || this.levelNote.judgement === 'bad') {
			this.text.scale.set(1 - progress);
			return;
		}
		this.text.tint = 0xffff55;
		if (progress < 1/4) {
			this.text.scale.x = 1 + progress*4;
		} else if (progress < 1/2) {
			this.text.scale.x = 2 - (progress-1/4)*2;
		} else {
			this.text.scale.x = 1.5 + (progress-1/2)*3;
		}
		if (progress < 0.5) {
			this.text.scale.y = 1 + progress*2;
		} else if (progress < 0.6) {
			this.text.scale.y = 2 - (progress-0.5)*5;
		} else {
			this.text.scale.y = 1.5 + (progress-0.6)/0.4*1.5;
		}
		if (progress >= 1/2) {
			this.text.alpha = 1 - (progress-1/2)*2;
		} else {
			this.text.alpha = 1;
		}
	}

};
