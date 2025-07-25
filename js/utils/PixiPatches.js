Sunniesnow.PixiPatches = {
	apply() {
		if (!Sunniesnow.Utils.isBrowser()) {
			this.patchNodeLoaderParsers();
		}
		this.patchWorldVisible();
		this.patchAddTo();
	},

	// https://github.com/pixijs-userland/node/pull/13
	patchNodeLoaderParsers() {
		PIXI.loadNodeTexture.name = 'loadNodeTexture';
		PIXI.loadNodeFont.name = 'loadNodeFont';
		PIXI.loadNodeBase64.name = 'loadNodeBase64';
	},

	// Then I can use child?.addTo(parent) instead of child && parent.addChild(child).
	patchAddTo() {
		PIXI.Container.prototype.addTo = PIXI.RenderLayer.prototype.addTo = function (parent) {
			if (parent instanceof PIXI.RenderLayer) {
				parent.attach(this);
			} else {
				parent.addChild(this);
			}
			return this;
		}
	},

	// https://github.com/pixijs/pixijs/issues/11030
	patchWorldVisible() {
		Object.defineProperty(PIXI.Container.prototype, 'worldVisible', {
			get() {
				return this.visible && (!this.parent || this.parent.worldVisible) && (!this.parentRenderLayer || this.parentRenderLayer.worldVisible);
			},
			readonly: true
		});
		Object.defineProperty(PIXI.RenderLayer.prototype, 'worldVisible', {
			get() {
				return (!this.parent || this.parent.worldVisible) && (!this.parentRenderLayer || this.parentRenderLayer.worldVisible);
			},
			readonly: true
		});
	}
};
