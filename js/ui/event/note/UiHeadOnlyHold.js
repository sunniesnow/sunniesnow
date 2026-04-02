Sunniesnow.UiHeadOnlyHold = class UiHeadOnlyHold extends Sunniesnow.UiHold {
	static createHaloGeometry(color = 0x8ad2cd) {
		return super.createHaloGeometry(color);
	}

	populate() {
		super.populate();
		this.label = `head-only-hold-${this.event.id}`;
		this.haloMask.scale.x = -1;
	}
};
