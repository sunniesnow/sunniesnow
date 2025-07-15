Sunniesnow.UiImage = class UiImage extends Sunniesnow.UiEvent {

	static async load() {
		this.assets = {};
		if (Sunniesnow.game.settings.disableOrnament) {
			return;
		}
		for (const event of Sunniesnow.game.chart.events) {
			if (!(event instanceof Sunniesnow.Image)) {
				continue;
			}
			await Sunniesnow.StoryAssets.loadTexture(event.filename);
		}
	}

	populate() {
		super.populate();
		this.texture = Sunniesnow.StoryAssets.texture(this.event.filename);
		if (!this.texture) {
			return;
		}
		this.sprite = new PIXI.Sprite(this.texture);
		this.addChild(this.sprite);
	}

	updateHolding(relativeTime) {
		if (!this.sprite) {
			return;
		}
		this.sprite.visible = true;
		[this.x, this.y] = Sunniesnow.Config.chartMapping(
			this.event.timeDependentAtRelative('x', relativeTime),
			this.event.timeDependentAtRelative('y', relativeTime)
		);
		this.zIndex = this.event.timeDependentAtRelative('z', relativeTime);
		this.rotation = Sunniesnow.Config.chartMappingRotation(this.event.timeDependentAtRelative('rotation', relativeTime));
		this.scale.x = this.event.timeDependentAtRelative('width', relativeTime) * Sunniesnow.Config.SCALE / this.texture.width;
		const setHeight = this.event.timeDependentAtRelative('height', relativeTime);
		this.scale.y = setHeight == null ? this.scale.x : setHeight * Sunniesnow.Config.SCALE / this.texture.height;
		if (Sunniesnow.game.settings.horizontalFlip) {
			this.scale.x *= -1;
		}
		if (Sunniesnow.game.settings.verticalFlip) {
			this.scale.y *= -1;
		}
		this.sprite.anchor.x = this.event.timeDependentAtRelative('anchorX', relativeTime);
		this.sprite.anchor.y = this.event.timeDependentAtRelative('anchorY', relativeTime);
		this.alpha = this.event.timeDependentAtRelative('opacity', relativeTime);
		this.tint = [
			this.event.timeDependentAtRelative('tintRed', relativeTime),
			this.event.timeDependentAtRelative('tintGreen', relativeTime),
			this.event.timeDependentAtRelative('tintBlue', relativeTime)
		];
		this.blendMode = this.event.timeDependentAtRelative('blendMode', relativeTime);
		this.filters = (this.filters ?? []).filter(f => !(f instanceof Sunniesnow.FilterFromChart)).concat(this.event.filtersAtRelative(relativeTime));
	}

};
