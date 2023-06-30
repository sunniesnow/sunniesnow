Sunniesnow.FxDrag = class FxDrag extends Sunniesnow.FxTap {
	static initialize() {
		this.radius = Sunniesnow.Config.noteRadius() * 2/3;
		this.sparkLine = this.createSparkLine();
		this.explosionContourArc = this.createExplosionContourArc();
	}
}
