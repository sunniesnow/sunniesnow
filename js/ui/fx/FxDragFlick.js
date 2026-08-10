Sunniesnow.FxDragFlick = class FxDragFlick extends Sunniesnow.FxFlick {
	static async load() {
		this.radius = Sunniesnow.UiDragFlick.radius;
		this.sparkLine = this.createSparkLine();
		this.explosionContourArc = this.createExplosionContourArc();
		this.missHalo = this.createMissHalo();
	}

	populate() {
		super.populate();
		this.label = `fx-drag-flick-${this.levelNote.event.id}`;
	}
};
