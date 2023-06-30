Sunniesnow.UiHold = class UiHold extends Sunniesnow.UiTap {

	static FADING_OUT_DURATION = 1/3;
	static initialize() {
		this.radius = Sunniesnow.Config.noteRadius();
		this.haloRadius = this.radius * 1.5;
		this.circleRadius = this.radius * 4;
		this.circleGeometry = this.createCircleGeometry(0xeefefe);
		this.geometry = this.createGeometry(0x29a9b9, 0xe8f8b8);
		this.haloGeometry = this.createHaloGeometry();
	}

	static createHaloGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0xd3e373);
		graphics.drawCircle(0, 0, this.haloRadius);
		graphics.endFill();
		return graphics.geometry;
	}
	
	populate() {
		this.noteBody = new PIXI.Graphics(this.constructor.geometry);
		this.circle = new PIXI.Graphics(this.constructor.circleGeometry);
		this.text = new PIXI.Text(this.event.text, {
			fontSize: this.constructor.radius, // TODO
			fill: 'white',
			align: 'center',
			fontFamily: 'Arial'
		});
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		this.addChild(this.circle);
		this.note = new PIXI.Container();
		this.createHalo();
		this.note.addChild(this.noteBody);
		this.note.addChild(this.text);
		this.addChild(this.note);
	}

	createHalo() {
		this.halo = new PIXI.Graphics(this.constructor.haloGeometry);
		this.haloMask = new PIXI.Graphics();
		this.haloMask.beginFill(0xffffff);
		const r = this.constructor.haloRadius;
		this.haloMask.drawRect(-r, -r, r*2, r*2);
		this.haloMask.endFill();
		this.halo.mask = this.haloMask;
		this.note.addChild(this.halo);
		this.note.addChild(this.haloMask);
	}

	updateFadingIn(time) {
		const progress = time / this.constructor.FADING_IN_DURATION;
		this.note.scale.set(progress);
		this.circle.scale.set(1 - (progress-1)**2);
		this.circle.alpha = progress / 3;
	}

	updateActive(progress) {
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

	updateHolding(progress) {
		this.circle.visible = false;
		this.rotateHaloMask(progress);
		this.swellBounce(progress);
	}

	rotateHaloMask(progress) {
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
		this.haloMask.beginFill(0xffffff);
		this.haloMask.drawPolygon([
			0, 0,
			...corners,
			...Sunniesnow.Utils.polarToCartesian(
				this.constructor.haloRadius*Math.sqrt(2),
				progress * Math.PI*2 - Math.PI/2
			)
		]);
		this.haloMask.endFill();
	}

	swellBounce(progress) {
		const periodsCount = Math.floor(this.event.duration / Sunniesnow.game.settings.gameSpeed / 0.33);
		const phase = progress * (periodsCount+1/2) * Math.PI*2;
		this.note.scale.set(1.1 - Math.cos(phase) * 0.1);
	}

	updateFadingOut(time) {
		this.halo.visible = false;
		const progress = time / this.constructor.FADING_OUT_DURATION;
		this.note.scale.set(1.2 + (1-(1-progress)**2) * 0.3);
		this.note.alpha = 1 - progress;
	}
}
