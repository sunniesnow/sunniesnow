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
		const x = this.event.timeDependentAtRelative('x', relativeTime);
		const y = this.event.timeDependentAtRelative('y', relativeTime);
		const width = this.event.timeDependentAtRelative('width', relativeTime);
		const height = this.event.timeDependentAtRelative('height', relativeTime);
		const rotation = this.event.timeDependentAtRelative('rotation', relativeTime);
		switch (this.event.coordinateSystem) {
			case 'canvas':
				this.x = x * Sunniesnow.Config.WIDTH;
				this.y = y * Sunnies
				this.scale.x = width * Sunniesnow.Config.WIDTH / this.texture.width;
				this.scale.y = height == null ? this.scale.x : height * Sunniesnow.Config.HEIGHT / this.texture.height;
				this.rotation = rotation;
				break;
			case 'chart':
				[this.x, this.y] = Sunniesnow.Config.chartMapping(x, y);
				this.rotation = Sunniesnow.Config.chartMappingRotation(rotation);
				this.scale.x = width * Sunniesnow.Config.SCALE / this.texture.width;
				this.scale.y = height == null ? this.scale.x : height * Sunniesnow.Config.SCALE / this.texture.height;
				if (Sunniesnow.game.settings.horizontalFlip) {
					this.scale.x *= -1;
				}
				if (Sunniesnow.game.settings.verticalFlip) {
					this.scale.y *= -1;
				}
				break;
		}
		this.zIndex = this.event.timeDependentAtRelative('z', relativeTime);
		this.sprite.anchor.x = this.event.timeDependentAtRelative('anchorX', relativeTime);
		this.sprite.anchor.y = this.event.timeDependentAtRelative('anchorY', relativeTime);
		this.scale.x *= this.event.timeDependentAtRelative('scaleX', relativeTime);
		this.scale.y *= this.event.timeDependentAtRelative('scaleY', relativeTime);
		this.skew.x = this.event.timeDependentAtRelative('skewX', relativeTime);
		this.skew.y = this.event.timeDependentAtRelative('skewY', relativeTime);
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
