Sunniesnow.UiFlick = class UiFlick extends Sunniesnow.UiNote {
	static async load() {
		this.radius = Sunniesnow.Config.NOTE_RADIUS;
		this.geometry = this.createNoteBodyGeometry(0xfe6e4e, 0xffffff);
		this.arrowGeometry = this.createArrowGeometry();
		this.circleRadius = this.radius * 4;
		this.circleGeometry = this.createCircleGeometry(0xccfcfc);
		this.textStyle = this.createTextStyle();
	}

	static createArrowGeometry() {
		const graphics = new PIXI.GraphicsContext();
		const tipDistance = this.radius * 2;
		const innerDistance = this.radius * 1.1;
		const halfAngle = Math.PI / 4;
		graphics.arc(0, 0, innerDistance, -halfAngle, halfAngle);
		graphics.lineTo(tipDistance, 0);
		graphics.closePath();
		graphics.fill(0xeece4e);
		graphics.poly([
			tipDistance, 0,
			...Sunniesnow.Utils.polarToCartesian(innerDistance, halfAngle),
			(innerDistance + tipDistance) / 2, 0,
			...Sunniesnow.Utils.polarToCartesian(innerDistance, -halfAngle)
		]);
		graphics.fill(0xfafa7a);
		return graphics;
	}

	populate() {
		super.populate();
		this.noteBody = new PIXI.Graphics(this.constructor.geometry);
		this.arrow = new PIXI.Graphics(this.constructor.arrowGeometry);
		this.arrow.rotation = Sunniesnow.Config.chartMappingAngle(this.event.angle);
		this.text = this.createText();
		this.note = new PIXI.Container();
		this.note.addChild(this.noteBody);
		this.note.addChild(this.text);
		this.note.addChild(this.arrow);
		this.addChild(this.note);
	}

	populateCircle() {
		this.circle = new PIXI.Graphics(this.constructor.circleGeometry);
	}

	update(relativeTime) {
		this.updateText(relativeTime);
		super.update(relativeTime);
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		this.note.scale.set(progress);
		this.arrow.alpha = progress;
		this.arrow.scale.set(1 - 0.05*Math.cos(relativeTime * 5));
		if (!this.circle) {
			return;
		}
		this.circle.scale.set(1 - (progress - 1) ** 2);
		this.circle.alpha = progress / 3;
	}

	updateActive(progress, relativeTime) {
		super.updateActive(progress, relativeTime);
		this.note.scale.set(1);
		this.arrow.scale.set(1 - 0.05*Math.cos(relativeTime * 5));
		if (!this.circle) {
			return;
		}
		const targetCircleScale = this.constructor.radius / this.constructor.circleRadius;
		if (progress <= 1) {
			this.circle.visible = true;
			this.circle.scale.set(1 - (1 - targetCircleScale) * progress);
			this.circle.alpha = (1 / 3 + 2 / 3 * progress);
		} else {
			this.circle.visible = false;
		}
	}

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		this.updateTextFadingOut(progress);
		this.noteBody.visible = false;
		if (this.circle) {
			this.circle.visible = false;
		}
		progress *= 2;
		if (this.levelNote.judgement === 'miss' || this.levelNote.judgement === 'bad') {
			this.arrow.visible = false;
			return;
		}
		const distance = this.constructor.radius * 2;
		this.arrow.scale.set(1.05);
		if (progress <= 1) {
			this.arrow.alpha = (1 - progress)**3;
			this.arrow.position.set(...Sunniesnow.Utils.polarToCartesian(
				distance * (1 - (1-progress)**2),
				this.arrow.rotation
			));
		} else {
			this.arrow.visible = false;
		}
	}

};
