// used to derive transformation matrices for shaders in filters.
Sunniesnow.FilterSprite = class FilterSprite extends PIXI.Sprite {
	constructor(filterEvent, resourceKey) {
		super();
		this.filterEvent = filterEvent;
		this.resourceKey = resourceKey;
		this.resource = filterEvent.filter.resources[resourceKey];
		this.samplerName = this.resource.samplerName;
		this.uniformsName = this.resource.uniformsName;
		this.matrixName = this.resource.matrixName;
		this.coordinateSystem = this.resource.coordinateSystem;
		Sunniesnow.game.auxiliaryBoard.addChild(this);
	}

	populateFilterResources(filterResources) {
		filterResources[this.resourceKey] = this.texture.source;
		filterResources[this.samplerName] = this.texture.source.style;
		Sunniesnow.game.app.renderer.filter.calculateSpriteMatrix(filterResources[this.uniformsName].uniforms[this.matrixName], this);
	}

	timeDependentAt(property, time) {
		return this.filterEvent.timeDependentAt(`${this.resourceKey}.${property}`, time);
	}

	filenameAt(time) {
		return this.filterEvent.uninterpolableTimeDependentAt(this.resourceKey, time);
	}

	update(time) {
		this.texture = Sunniesnow.StoryAssets.texture(this.filenameAt(time)) ?? PIXI.Texture.EMPTY;
		const x = this.timeDependentAt('x', time);
		const y = this.timeDependentAt('y', time);
		const width = this.timeDependentAt('width', time);
		const height = this.timeDependentAt('height', time);
		const rotation = this.timeDependentAt('rotation', time);
		switch (this.coordinateSystem) {
			case 'canvas':
				this.x = (x ?? 0.5) * Sunniesnow.Config.WIDTH;
				this.y = (y ?? 0.5) * Sunniesnow.Config.HEIGHT;
				this.scale.x = (width ?? 0) * Sunniesnow.Config.WIDTH / this.texture.width;
				this.scale.y = height == null ? this.scale.x : height * Sunniesnow.Config.HEIGHT / this.texture.height;
				this.rotation = rotation ?? 0;
				break;
			case 'chart':
				[this.x, this.y] = Sunniesnow.Config.chartMapping(x ?? 0, y ?? 0);
				this.scale.x = (width ?? 0) * Sunniesnow.Config.SCALE / this.texture.width;
				this.scale.y = height == null ? this.scale.x : height * Sunniesnow.Config.SCALE / this.texture.height;
				if (Sunniesnow.game.settings.horizontalFlip) {
					this.scale.x *= -1;
				}
				if (Sunniesnow.game.settings.verticalFlip) {
					this.scale.y *= -1;
				}
				this.rotation = Sunniesnow.Config.chartMappingRotation(rotation);
				break;
		}
		this.scale.x *= this.timeDependentAt('scaleX', time) ?? 1;
		this.scale.y *= this.timeDependentAt('scaleY', time) ?? 1;
		this.skew.x = this.timeDependentAt('skewX', time) ?? 0;
		this.skew.y = this.timeDependentAt('skewY', time) ?? 0;
		this.anchor.x = this.timeDependentAt('anchorX', time) ?? 0.5;
		this.anchor.y = this.timeDependentAt('anchorY', time) ?? 0.5;
	}
};
