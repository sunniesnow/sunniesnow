Sunniesnow.FxDrag = class FxDrag extends Sunniesnow.FxTap {
	static async load() {
		this.radius = Sunniesnow.Config.NOTE_RADIUS * 2/3;
		this.sparkLine = this.createSparkLine();
		this.explosionContourArc = this.createExplosionContourArc();
	}
};
