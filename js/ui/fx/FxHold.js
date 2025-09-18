Sunniesnow.FxHold = class FxHold extends Sunniesnow.FxTap {
	populate() {
		super.populate();
		this.label = `fx-hold-${this.levelNote.event.id}`;
	}
};
