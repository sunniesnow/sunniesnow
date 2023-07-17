Sunniesnow.UiTap = class UiTap extends Sunniesnow.UiNote {

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
			this.note = new PIXI.Graphics(Sunniesnow.UiTap.doubleGeometry);
			this.circle = new PIXI.Graphics(Sunniesnow.UiTap.doubleCircleGeometry);
			if (this.connectedPos) {
				this.doubleLine = new PIXI.Graphics();
				this.addChild(this.doubleLine);
			}
		} else {
			this.note = new PIXI.Graphics(Sunniesnow.UiTap.geometry);
			this.circle = new PIXI.Graphics(Sunniesnow.UiTap.circleGeometry);
		}
		this.text = this.createText();
		this.addChild(this.circle);
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

};
