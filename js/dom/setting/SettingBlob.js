Sunniesnow.SettingBlob = class SettingBlob extends Sunniesnow.SettingRadio {
	constructor(collection, elements, idSuffix = '') {
		super(collection, elements, idSuffix);
		for (const element of this.elements) {
			element.addEventListener('change', () => {
				this.selectionDirty = true;
				this.activeSetting()?.interrupt?.();
			});
		}
	}

	allSettings() {
		return Sunniesnow.Utils.compactify(Array.from(this.elements).map(e => this.collection.mapElementIdToSetting.get(e.dataset.input)));
	}

	activeSetting() {
		for (const element of this.elements) {
			if (!element.checked) {
				continue;
			}
			let id = element.dataset.input;
			if (this.idSuffix && id.endsWith(this.idSuffix)) {
				id = id.slice(0, -this.idSuffix.length);
			}
			return this.collection.mapSettingIdToSetting.get(id);
		}
	}

	get() {
		throw new Error('Synchronous get() is not supported');
	}

	async getAsync(onProgress) {
		const result = await this.activeSetting()?.getAsync(onProgress);
		this.selectionDirty = false;
		return result;
	}

	save() {
		return super.get();
	}

	isDirty() {
		return this.selectionDirty || !!this.activeSetting()?.dirty;
	}
};
