Sunniesnow.FxDrag = class FxDrag extends Sunniesnow.FxTap {
	static async load() {
		this.radius = Sunniesnow.UiDrag.radius;
		this.sparkLine = this.createSparkLine();
		this.explosionContourArc = this.createExplosionContourArc();
		this.missHalo = this.createMissHalo();
	}

	populate() {
		super.populate();
		this.label = `fx-drag-${this.levelNote.event.id}`;
	}
};
