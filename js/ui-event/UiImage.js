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
			if (Object.hasOwn(this.assets, event.filename)) {
				continue;
			}
			const filename = `story/${event.filename}`;
			const zipFiles = Sunniesnow.game.loaded.chart.zip.files;
			if (!Object.hasOwn(zipFiles, filename)) {
				Sunniesnow.Logs.warn(`Image \`${filename}\` not found in the level file`);
				this.assets[event.filename] = null;
				continue;
			}
			const type = mime.getType(filename);
			if (!type?.startsWith('image')) {
				Sunniesnow.Logs.warn(`Cannot infer a image file type from the filename \`${filename}\``);
				this.assets[event.filename] = null;
				continue;
			}
			const url = Sunniesnow.ObjectUrl.create(new Blob([await zipFiles[filename].async('blob')], {type}));
			try {
				this.assets[event.filename] = await Sunniesnow.Assets.loadTexture(url);
			} catch (error) {
				Sunniesnow.Logs.warn(`Failed to load image \`${filename}\`: ${error.message}`);
				this.assets[event.filename] = null;
			}
		}
	}

	populate() {
		super.populate();
		this.texture = this.constructor.assets[this.event.filename];
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
		this.transform.rotation = Sunniesnow.Config.chartMappingRotation(this.event.timeDependentAtRelative('rotation', relativeTime));
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
	}

};
