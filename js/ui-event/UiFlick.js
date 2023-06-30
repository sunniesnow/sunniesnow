Sunniesnow.UiFlick = class UiFlick extends Sunniesnow.UiNote {
	static FADING_OUT_DURATION = 1/3;
	static initialize() {
		this.radius = Sunniesnow.Config.noteRadius();
		this.circleRadius = this.radius * 4;
		this.circleGeometry = Sunniesnow.UiTap.createCircleGeometry.call(this, 0xeefefe);
		this.geometry = Sunniesnow.UiTap.createGeometry.call(this, 0xfe6e4e, 0xffffff);
		this.arrowGeometry = this.createArrowGeometry();
	}
	
	static createArrowGeometry() {
		const graphics = new PIXI.Graphics();
		const tipDistance = this.radius * 2;
		const innerDistance = this.radius * 1.1;
		const halfAngle = Math.PI / 4;
		graphics.beginFill(0xeece4e);
		graphics.arc(0, 0, innerDistance, -halfAngle, halfAngle);
		graphics.lineTo(tipDistance, 0);
		graphics.closePath();
		graphics.endFill();
		graphics.beginFill(0xfafa7a);
		graphics.drawPolygon([
			tipDistance, 0,
			...Sunniesnow.Utils.polarToCartesian(innerDistance, halfAngle),
			(innerDistance + tipDistance) / 2, 0,
			...Sunniesnow.Utils.polarToCartesian(innerDistance, -halfAngle)
		]);
		graphics.endFill();
		return graphics.geometry;
	}

	populate() {
		this.noteBody = new PIXI.Graphics(Sunniesnow.UiFlick.geometry);
		this.circle = new PIXI.Graphics(Sunniesnow.UiFlick.circleGeometry);
		this.arrow = new PIXI.Graphics(Sunniesnow.UiFlick.arrowGeometry);
		this.arrow.transform.rotation = -this.event.angle;
		this.text = new PIXI.Text(this.event.text, {
			fontSize: this.constructor.radius, // TODO
			fill: 'white',
			align: 'center',
			fontFamily: 'Arial'
		});
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		this.addChild(this.circle);
		this.note = new PIXI.Container();
		this.note.addChild(this.noteBody);
		this.note.addChild(this.text);
		this.note.addChild(this.arrow);
		this.addChild(this.note);
	}

	updateFadingIn(time) {
		const progress = time / this.constructor.FADING_IN_DURATION;
		this.note.scale.set(progress);
		this.circle.scale.set(1 - (progress - 1) ** 2);
		this.circle.alpha = progress / 3;
		this.arrow.alpha = progress;
		const relativeTime = -this.activeDuration - this.constructor.FADING_IN_DURATION + time;
		this.arrow.scale.set(1 + 0.05*Math.cos(relativeTime * 2));
	}

	updateActive(progress) {
		this.note.scale.set(1);
		const targetCircleScale = this.constructor.radius / this.constructor.circleRadius;
		if (progress <= 1) {
			this.circle.visible = true;
			this.circle.scale.set(1 - (1 - targetCircleScale) * progress);
			this.circle.alpha = (1 / 3 + 2 / 3 * progress);
		} else {
			this.circle.visible = false;
		}
		const relativeTime = this.activeDuration * (progress-1);
		this.arrow.scale.set(1 + 0.05*Math.cos(relativeTime * 5));
	}

	updateFadingOut(time) {
		const distance = this.constructor.radius * 2;
		const progress = time / this.constructor.FADING_OUT_DURATION;
		this.noteBody.visible = false;
		this.text.visible = false;
		this.circle.visible = false;
		this.arrow.scale.set(1.05);
		this.arrow.alpha = 1 - progress;
		this.arrow.position.set(...Sunniesnow.Utils.polarToCartesian(
			distance * (1 - (1-progress)**2),
			-this.event.angle
		));
	}

};
