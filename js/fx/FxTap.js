Sunniesnow.FxTap = class FxTap extends Sunniesnow.FxNote {
	static async load() {
		this.radius = Sunniesnow.Config.NOTE_RADIUS;
		this.sparkLine = this.createSparkLine();
		this.explosionContourArc = this.createExplosionContourArc();
		this.missHalo = this.createMissHalo();
	}

	static createSparkLine() {
		const graphics = new PIXI.GraphicsContext();
		graphics.moveTo(0, 0);
		graphics.lineTo(this.radius * 2, 0);
		graphics.stroke({width: this.radius / 20, color: 0xffffff});
		return graphics;
	}

	static createExplosionContourArc() {
		const graphics = new PIXI.GraphicsContext();
		graphics.arc(0, 0, this.radius * 1.5, -Math.PI / 6, Math.PI / 6);
		graphics.stroke({width: this.radius / 10, color: 0xffffff});
		return graphics;
	}

	static createMissHalo() {
		const graphics = new PIXI.GraphicsContext();
		graphics.circle(0, 0, this.radius);
		graphics.fill({color: 0x000000, alpha: 0.7});
		return graphics;
	}

	populate() {
		super.populate();
		this.label = `fx-tap-${this.levelNote.event.id}`;
	}

	populateSparks(count, minColor, maxColor) {
		this.sparks = [];
		for (let i = 0; i < count; i++) {
			const spark = new PIXI.Graphics(this.constructor.sparkLine);
			spark.rotation = Math.random() * Math.PI * 2;
			spark.tint = Sunniesnow.Utils.randColor(minColor, maxColor);
			this.addChild(spark);
			this.sparks.push(spark);
		}
	}

	populateContours(count, minColor, maxColor) {
		this.contours = [];
		for (let i = 0; i < count; i++) {
			const contour = new PIXI.Graphics(this.constructor.explosionContourArc);
			contour.rotation = Math.random() * Math.PI * 2;
			contour.tint = Sunniesnow.Utils.randColor(minColor, maxColor);
			this.addChild(contour);
			this.contours.push(contour);
		}
	}

	updateSparks(delta) {
		this.sparks.forEach(spark => {
			const [vx, vy] = Sunniesnow.Utils.polarToCartesian(this.constructor.radius / 2, spark.rotation);
			spark.x += delta * vx;
			spark.y += delta * vy;
			spark.alpha -= delta * 0.1;
			if (spark.alpha <= 0) {
				this.state = 'finished';
			}
		});
	}

	updateContours(delta) {
		this.contours.forEach((contour) => {
			contour.scale.x += delta * 0.2;
			contour.scale.y += delta * 0.2;
			contour.alpha -= delta * 0.1;
		});
	}

	populatePerfect() {
		this.populateSparks(20, 0xbfaa00, 0xffff00);
		this.populateContours(3, 0xbfaa00, 0xff7f00);
	}

	updatePerfect(delta) {
		this.updateSparks(delta);
		this.updateContours(delta);
	}

	populateGood() {
		this.populateSparks(15, 0x0f0fff, 0xafafff);
		this.populateContours(3, 0x0f0fff, 0xafafff);
	}

	updateGood(delta) {
		this.updateSparks(delta);
		this.updateContours(delta);
	}

	populateBad() {
		this.populateSparks(15, 0x000000, 0x001000);
		this.populateContours(2, 0x000000, 0x001000);
	}

	updateBad(delta) {
		this.updateSparks(delta);
		this.updateContours(delta);
	}

	populateMiss() {
		this.graphics = new PIXI.Graphics(this.constructor.missHalo);
		this.addChild(this.graphics);
	}

	updateMiss(delta) {
		this.graphics.scale.x += delta * 0.05;
		this.graphics.scale.y += delta * 0.05;
		this.graphics.alpha -= delta * 0.05;
		if (this.graphics.alpha <= 0) {
			this.state = 'finished';
		}
	}
};
