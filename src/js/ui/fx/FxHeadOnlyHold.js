import Sunniesnow from '../../Sunniesnow.js';

Sunniesnow.FxHeadOnlyHold = class FxHeadOnlyHold extends Sunniesnow.FxTap {
	populate() {
		super.populate();
		this.label = `fx-head-only-hold-${this.levelNote.event.id}`;
	}
};
