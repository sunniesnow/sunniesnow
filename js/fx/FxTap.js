Sunniesnow.FxTap = class FxTap extends Sunniesnow.FxNote {
	static async load() {
		this.radius = Sunniesnow.Config.noteRadius();
		this.sparkLine = this.createSparkLine();
		this.explosionContourArc = this.createExplosionContourArc();
		this.missHalo = this.createMissHalo();
		this.earlyTextTexture = this.createTextTexture('E', 0x9f57e4);
		this.lateTextTexture = this.createTextTexture('L', 0xe74c4c);
	}

	static createTextTexture(text, color) {
		const sprite = new PIXI.Text(text, {
			align: 'center',
			fill: color,
			fontSize: this.radius,
			fontFamily: 'Arial',
			fontWeight: 'bold'
		});
		sprite.updateText();
		return sprite.texture;
	}

	static createSparkLine() {
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(this.radius / 20, 0xffffff);
		graphics.moveTo(0, 0);
		graphics.lineTo(this.radius * 2, 0);
		graphics.finishPoly();
		return graphics.geometry;
	}

	static createExplosionContourArc() {
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(this.radius / 10, 0xffffff);
		graphics.arc(0, 0, this.radius * 1.5, -Math.PI / 6, Math.PI / 6);
		graphics.finishPoly();
		return graphics.geometry;
	}

	static createMissHalo() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0x000000, 0.7);
		graphics.drawCircle(0, 0, this.radius);
		graphics.endFill();
		return graphics.geometry;
	}

	populateSparks(count, minColor, maxColor) {
		this.sparks = [];
		for (let i = 0; i < count; i++) {
			const spark = new PIXI.Graphics(this.constructor.sparkLine);
			spark.transform.rotation = Math.random() * Math.PI * 2;
			spark.tint = Sunniesnow.Utils.randColor(minColor, maxColor);
			this.addChild(spark);
			this.sparks.push(spark);
		}
	}

	populateContours(count, minColor, maxColor) {
		this.contours = [];
		for (let i = 0; i < count; i++) {
			const contour = new PIXI.Graphics(this.constructor.explosionContourArc);
			contour.transform.rotation = Math.random() * Math.PI * 2;
			contour.tint = Sunniesnow.Utils.randColor(minColor, maxColor);
			this.addChild(contour);
			this.contours.push(contour);
		}
	}

	updateSparks(delta) {
		this.sparks.forEach((spark) => {
			const [vx, vy] = Sunniesnow.Utils.polarToCartesian(this.constructor.radius / 2, spark.transform.rotation);
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

	populate() {
		super.populate();
		// this.createEarlyLateText(); // commented in favor of Lyrica 5 style E/L indicator
	}

	createEarlyLateText() {
		if (!this.earlyLate) {
			return;
		}
		this.earlyLateText = new PIXI.Sprite(this.earlyLate < 0 ? this.constructor.earlyTextTexture : this.constructor.lateTextTexture);
		this.earlyLateText.anchor.set(0.5);
		this.front.addChild(this.earlyLateText);
	}

	update(delta) {
		super.update(delta);
		this.updateEarlyLateText(delta);
	}

	updateEarlyLateText(delta) {
		if (!this.earlyLateText) {
			return;
		}
		this.earlyLateText.alpha -= delta * 0.05;
		if (this.earlyLateText.alpha <= 0) {
			this.front.removeChild(this.earlyLateText);
			this.earlyLateText = null;
		}
	}
};
