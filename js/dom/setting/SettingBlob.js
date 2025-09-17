Sunniesnow.SettingBlob = class SettingBlob extends Sunniesnow.SettingRadio {
	constructor(collection, elements) {
		super(collection, elements);
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
			if (element.checked) {
				return this.collection.mapSettingIdToSetting.get(element.dataset.input);
			}
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
