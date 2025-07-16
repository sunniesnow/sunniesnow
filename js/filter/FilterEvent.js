Sunniesnow.FilterEvent = class FilterEvent {
	static SPRITE_TIME_DEPENDENT = [
		'x', 'y', 'width', 'height', 'rotation',
		'scaleX', 'scaleY', 'skewX', 'skewY', 'anchorX', 'anchorY'
	];

	static check(data) {
		if (typeof data !== 'object') {
			Sunniesnow.Logs.warn('Filter event data are not an object.');
			return false;
		}
		if (typeof data.time !== 'number') {
			Sunniesnow.Logs.warn('Filter event time is not a number.');
			return false;
		}
		if (typeof data.label !== 'string') {
			Sunniesnow.Logs.warn('Filter event label is not a string.');
			return false;
		}
		if (typeof data.duration !== 'number' || data.duration <= 0) {
			Sunniesnow.Logs.warn('Filter event duration is not a positive number.');
			return false;
		}
		if (data.timeDependent == null) {
			return true;
		}
		if (typeof data.timeDependent !== 'object') {
			Sunniesnow.Logs.warn('Filter event timeDependent is not an object.');
			return false;
		}
		for (const property in data.timeDependent) {
			const timeDependentItem = data.timeDependent[property];
			if (typeof timeDependentItem !== 'object') {
				Sunniesnow.Logs.warn(`Filter event timeDependent.${property} is not an object.`);
				return false;
			}
			if (timeDependentItem.scaleBy != null && !['none', 'chartUnitWidth', 'chartUnitHeight', 'canvasWidth', 'canvasHeight'].includes(timeDependentItem.scaleBy)) {
				Sunniesnow.Logs.warn(`Filter event timeDependent.${property}.scaleBy is not valid.`);
				return false;
			}
			if (timeDependentItem.dataPoints == null) {
				continue;
			}
			if (!Array.isArray(timeDependentItem.dataPoints)) {
				Sunniesnow.Logs.warn(`Filter event timeDependent.${property}.dataPoints is not an array.`);
				return false;
			}
			if (!timeDependentItem.dataPoints.every(
				point => typeof point === 'object' && typeof point.time === 'number' && point.value != null
			)) {
				Sunniesnow.Logs.warn(`Filter event timeDependent.${property}.dataPoints contains invalid data points.`);
				return false;
			}
		}
		return true;
	}

	static from(data, offset) {
		if (!this.check(data)) {
			return null;
		}
		return new this(data, offset);
	}

	constructor(data, offset) {
		this.data = data;
		this.time = data.time;
		this.label = data.label;
		this.duration = data.duration;
		this.assignTimeDependent(data.timeDependent ?? {});
		if (offset != null) {
			this.reduceTime(offset);
		}
		this.sprites = {};
	}

	reduceTime(offset) {
		this.time = (this.time + offset) / Sunniesnow.game.settings.gameSpeed;
		this.duration /= Sunniesnow.game.settings.gameSpeed;
		for (const property in this.timeDependent) {
			this.timeDependent[property].dataPoints.forEach(point => {
				point.time = (point.time + offset) / Sunniesnow.game.settings.gameSpeed;
			});
		}
	}

	actualFilter() {
		this.internalFilter ??= (this.filter ??= Sunniesnow.game.chart.filters[this.label])?.newFilter();
		return this.internalFilter;
	}

	assignTimeDependent(timeDependent) {
		this.timeDependent = {};
		for (const key in timeDependent) {
			this.timeDependent[key] = {scaleBy: timeDependent[key].scaleBy ?? 'none'};
			const dataPoints = this.timeDependent[key].dataPoints = timeDependent[key].dataPoints?.map(o => Object.assign({}, o)) ?? [];
			if (timeDependent[key].value != null) {
				dataPoints.unshift({time: this.time, value: timeDependent[key].value});
			}
			dataPoints.sort((a, b) => a.time - b.time);
		}
	}

	// time must be at least as large as this.time.
	timeDependentAt(property, time) {
		if (!this.timeDependent[property]) {
			return null;
		}
		const {dataPoints} = this.timeDependent[property];
		const index = Sunniesnow.Utils.bisectRight(dataPoints, ({time: t}) => t - time);
		if (index === -1) {
			return null;
		}
		if (index === dataPoints.length - 1) {
			return dataPoints[index].value;
		}
		const {time: t1, value: v1} = dataPoints[index];
		const {time: t2, value: v2} = dataPoints[index + 1];
		let progress = (time - t1) / (t2 - t1);
		if (Number.isNaN(progress)) {
			progress = 1/2;
		}
		let scale = 1;
		switch (this.timeDependent[property].scaleBy) {
			case 'chartUnitWidth':
				scale = Sunniesnow.Config.SCALE * (Sunniesnow.game.settings.horizontalFlip ? -1 : 1);
				break;
			case 'chartUnitHeight':
				scale = Sunniesnow.Config.SCALE * (Sunniesnow.game.settings.verticalFlip ? -1 : 1);
				break;
			case 'canvasWidth':
				scale = Sunniesnow.Config.WIDTH;
				break;
			case 'canvasHeight':
				scale = Sunniesnow.Config.HEIGHT;
				break;
		}
		if (typeof v1 === 'number' && typeof v2 === 'number') {
			return (v1 + (v2 - v1) * progress) * scale;
		}
		return v1.map((v, i) => (v + (v2[i] - v) * progress) * scale);
	}

	uninterpolableTimeDependentAt(property, time) {
		if (!this.timeDependent[property]) {
			return null;
		}
		const {dataPoints} = this.timeDependent[property];
		const index = Sunniesnow.Utils.bisectRight(dataPoints, ({time: t}) => t - time);
		if (index === -1) {
			return null;
		}
		return dataPoints[index].value;
	}

	update(time) {
		const filter = this.actualFilter();
		if (!filter) {
			return;
		}
		for (const key in this.filter.resources) {
			switch (this.filter.resources[key].type) {
				case 'uniforms':
					const uniformTypes = this.filter.resources[key].uniforms;
					const uniformGroup = filter.resources[key];
					for (const uniformName in uniformTypes) {
						const property = key + '.' + uniformName;
						const type = uniformTypes[uniformName];
						// whether the type is integer or float
						const value = type.includes('i') ? this.uninterpolableTimeDependentAt(property, time) : this.timeDependentAt(property, time);
						uniformGroup.uniforms[uniformName] = value ?? PIXI.getDefaultUniformValue(type, 1);
					}
					break;
				case 'texture':
					const sprite = this.sprites[key] ??= new Sunniesnow.FilterSprite(this, key);
					sprite.update(time);
					sprite.populateFilterResources(filter.resources);
					break;
			}
		}
	}

	endTime() {
		return this.time + this.duration;
	}

	async checkAndLoad() {
		if (!this.actualFilter()) {
			Sunniesnow.Logs.warn(`There is no valid filter labeled "${this.label}" in the chart.`);
			return false;
		}
		for (const key in this.filter.resources) {
			const resource = this.filter.resources[key];
			switch (resource.type) {
				case 'uniforms':
					const uniformTypes = resource.uniforms;
					for (const uniformName in uniformTypes) {
						const timeDependentItem = this.timeDependent[key + '.' + uniformName];
						if (timeDependentItem == null) {
							continue;
						}
						const {value, dataPoints, scaleBy} = timeDependentItem;
						if (value != null && !Sunniesnow.Utils.isValidUniformValue(value, uniformTypes[uniformName])) {
							Sunniesnow.Logs.warn(`Filter event has an invalid value fo the uniform ${key}.${uniformName}.`);
							return false;
						}
						if (scaleBy != null && scaleBy !== 'none' && uniformTypes[uniformName].includes('i')) {
							Sunniesnow.Logs.warn(`Filter event has a scaleBy for uniform ${uniformName} of type ${uniformTypes[uniformName]}.`);
							return false;
						}
						if (dataPoints == null) {
							continue;
						}
						if (!dataPoints.every(({value}) => Sunniesnow.Utils.isValidUniformValue(value, uniformTypes[uniformName]))) {
							Sunniesnow.Logs.warn(`Filter event has an invalid data point for the uniform ${key}.${uniformName}.`);
							return false;
						}
					}
					break;
				case 'texture':
					const timeDependentItem = this.timeDependent[key];
					if (timeDependentItem == null) {
						continue;
					}
					const {value, dataPoints} = timeDependentItem;
					if (value != null && !(await Sunniesnow.StoryAssets.loadTexture(value))) {
						return false;
					}
					if (dataPoints != null && !(await Promise.all(dataPoints.map(({value}) => Sunniesnow.StoryAssets.loadTexture(value)))).every(r => r)) {
						return false;
					}
					for (const property of this.constructor.SPRITE_TIME_DEPENDENT) {
						const timeDependentItem = this.timeDependent[key + '.' + property];
						if (timeDependentItem == null) {
							continue;
						}
						const {value, dataPoints, scaleBy} = timeDependentItem;
						if (value != null && typeof value !== 'number') {
							Sunniesnow.Logs.warn(`Filter event has an invalid value for the sprite property ${key}.${property}.`);
							return false;
						}
						if (scaleBy != null && scaleBy !== 'none') {
							Sunniesnow.Logs.warn(`Filter event has a scaleBy for the sprite property ${key}.${property}.`);
							return false;
						}
						if (dataPoints != null && !dataPoints.every(({value}) => typeof value === 'number')) {
							Sunniesnow.Logs.warn(`Filter event has an invalid data point for the sprite property ${key}.${property}.`);
							return false;
						}
					}
					break;
			}
		}
		return true;
	}

	// currently never called, but we may see the necessity in the future.
	gc() {
		for (const key in this.sprites) {
			this.sprites[key]?.destroy();
			this.sprites[key] = null;
		}
		this.internalFilter?.destroy();
		this.internalFilter = null;
	}
};
