Sunniesnow.FxTap = class FxTap extends Sunniesnow.FxNote {
	static initialize() {
		this.radius = Sunniesnow.Config.noteRadius();
		this.sparkLine = this.createSparkLine();
		this.explosionContourArc = this.createExplosionContourArc();
	}

	static createSparkLine() {
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(this.radius / 20, 0xffff00);
		graphics.moveTo(0, 0);
		graphics.lineTo(this.radius * 2, 0);
		graphics.finishPoly();
		return graphics.geometry;
	}

	static createExplosionContourArc() {
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(this.radius / 10, 0xffff00);
		graphics.arc(0, 0, this.radius * 1.5, -Math.PI / 6, Math.PI / 6);
		graphics.finishPoly();
		return graphics.geometry;
	}

	populatePerfect() {
		this.sparks = [];
		for (let i = 0; i < 20; i++) {
			const spark = new PIXI.Graphics(this.constructor.sparkLine);
			spark.transform.rotation = Math.random() * Math.PI * 2;
			spark.tint = [Math.random()/4 + 3/4, Math.random()/3 + 2/3, 0]
			this.addChild(spark);
			this.sparks.push(spark);
		}
		this.contours = [];
		for (let i = 0; i < 3; i++) {
			const contour = new PIXI.Graphics(this.constructor.explosionContourArc);
			contour.transform.rotation = Math.random() * Math.PI * 2;
			contour.tint = [Math.random()/4 + 3/4, Math.random()/2 + 1/2, 0]
			this.addChild(contour);
			this.contours.push(contour);
		}
	}

	updatePerfect(delta) {
		this.sparks.forEach((spark) => {
			const [vx, vy] = Sunniesnow.Utils.polarToCartesian(this.constructor.radius / 2, spark.transform.rotation);
			spark.x += delta * vx;
			spark.y += delta * vy;
			spark.alpha -= delta * 0.1;
			if (spark.alpha <= 0) {
				this.state = 'finished';
			}
		});
		this.contours.forEach((contour) => {
			contour.scale.x += delta * 0.2;
			contour.scale.y += delta * 0.2;
			contour.alpha -= delta * 0.1;
		});
	}
};
