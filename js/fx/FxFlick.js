Sunniesnow.FxFlick = class FxFlick extends Sunniesnow.FxTap {

	populateSparks(count, minColor, maxColor) {
		this.sparks = [];
		for (let i = 0; i < count; i++) {
			const spark = new PIXI.Graphics(this.constructor.sparkLine);
			spark.transform.rotation = Math.random() * Math.PI - Math.PI / 2;
			spark.transform.rotation += -this.levelNote.event.angle;
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
};
