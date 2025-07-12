Sunniesnow.UiHold = class UiHold extends Sunniesnow.UiNote {

	static async load() {
		this.radius = Sunniesnow.Config.NOTE_RADIUS;
		this.haloRadius = this.radius * 1.5;
		this.geometry = this.createNoteBodyGeometry(0xd18cef, 0xffffff);
		this.haloGeometry = this.createHaloGeometry();
		this.circleRadius = this.radius * 4;
		this.circleGeometry = this.createCircleGeometry(0xccfcfc);
		this.textStyle = this.createTextStyle();
	}

	static createHaloGeometry() {
		const graphics = new PIXI.GraphicsContext();
		graphics.circle(0, 0, this.haloRadius);
		graphics.fill(0xd3e373);
		return graphics;
	}

	populate() {
		this.noteBody = new PIXI.Graphics(this.constructor.geometry);
		this.text = this.createText();
		if (Sunniesnow.game.settings.scroll) {
			this.createBar();
		}
		this.note = new PIXI.Container();
		this.createHalo();
		this.note.addChild(this.noteBody);
		this.note.addChild(this.text);
		this.addChild(this.note);
	}

	populateCircle() {
		super.populateCircle();
		this.circleGraphics = new PIXI.Graphics(this.constructor.circleGeometry);
		this.circle.addChild(this.circleGraphics);
	}

	createBar() {
		this.bar = new PIXI.Graphics();
		this.bar.rect(-this.constructor.radius / 4, -1, this.constructor.radius / 2, 1);
		this.bar.fill(0xd3e373);
		this.bar.scale.y = this.event.duration * Sunniesnow.Config.SCROLL_SPEED;
		this.addChild(this.bar);
	}

	createHalo() {
		this.halo = new PIXI.Graphics(this.constructor.haloGeometry);
		this.haloMask = new PIXI.Graphics();
		const r = this.constructor.haloRadius;
		this.haloMask.rect(-r, -r, r*2, r*2);
		this.haloMask.fill(0xffffff);
		this.halo.mask = this.haloMask;
		this.note.addChild(this.halo);
		this.note.addChild(this.haloMask);
	}

	update(relativeTime) {
		this.updateText(relativeTime);
		super.update(relativeTime);
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		this.note.scale.set(progress);
		if (!this.circle) {
			return;
		}
		this.circleGraphics.scale.set(1 - (progress-1)**2);
		this.circleGraphics.alpha = progress / 3;
	}

	updateActive(progress, relativeTime) {
		super.updateActive(progress, relativeTime);
		this.note.scale.set(1);
		if (!this.circle) {
			return;
		}
		const targetCircleScale = this.constructor.radius / this.constructor.circleRadius;
		if (progress <= 1) {
			this.circleGraphics.visible = true;
			this.circleGraphics.scale.set(1 - (1-targetCircleScale) * progress);
			this.circleGraphics.alpha = (1/3 + 2/3 * progress);
		} else {
			this.circleGraphics.visible = false;
		}
	}

	updateHolding(progress, relativeTime) {
		super.updateHolding(progress, relativeTime);
		this.rotateHaloMask(progress);
		this.swellBounce(relativeTime);
		if (this.bar) {
			this.bar.scale.y = (this.event.duration - relativeTime) * Sunniesnow.Config.SCROLL_SPEED;
			if (this.bar.scale.y < 0) {
				this.bar.scale.y = 0;
			}
		}
		if (this.circle) {
			this.circleGraphics.visible = false;
		}
	}

	rotateHaloMask(progress) {
		progress = Sunniesnow.Utils.clamp(progress, 0, 1);
		const r = this.constructor.haloRadius;
		const corners = [0, -r];
		if (progress < 7/8) {
			corners.push(-r, -r);
			if (progress < 5/8) {
				corners.push(-r, r);
				if (progress < 3/8) {
					corners.push(r, r);
					if (progress < 1/8) {
						corners.push(r, -r);
					}
				}
			}
		}
		this.haloMask.clear();
		this.haloMask.poly([
			0, 0,
			...corners,
			...Sunniesnow.Utils.polarToCartesian(
				this.constructor.haloRadius*Math.sqrt(2),
				progress * Math.PI*2 - Math.PI/2
			)
		]);
		this.haloMask.fill(0xffffff);
	}

	swellBounce(time) {
		this.note.scale.set(1.1 - Math.cos(2*Math.PI * time/0.27) * 0.1);
	}

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		this.updateTextFadingOut(progress, relativeTime);
		progress *= 2;
		if (this.bar) {
			this.bar.visible = false;
		}
		if (this.circle) {
			this.circleGraphics.visible = false;
		}
		this.halo.visible = false;
		if (this.levelNote.judgement === 'miss') {
			this.noteBody.visible = false;
			return;
		}
		this.swellBounce(this.event.duration);
		if (progress <= 1) {
			this.noteBody.scale.set(1 + (1-(1-progress)**2) * 0.5);
			this.noteBody.alpha = (1 - progress)**3;
		} else {
			this.noteBody.visible = false;
		}
	}
}
