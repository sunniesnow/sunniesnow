Sunniesnow.UiHeadOnlyHold = class UiHeadOnlyHold extends Sunniesnow.UiHold {
	populate() {
		super.populate();
		this.label = `head-only-hold-${this.event.id}`;
		this.haloMask.scale.x = -1;
	}
};
