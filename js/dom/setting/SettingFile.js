Sunniesnow.SettingFile = class SettingFile extends Sunniesnow.Setting {
	constructor(constructor, element, idSuffix = '') {
		super(constructor, element, idSuffix);
		this.manualValue = null;
		this.element.addEventListener('change', event => {
			this.dirty = true;
			this.dispatchEvent(new Event('change'));
		});
	}

	get() {
		this.dirty = false;
		const file = this.element.files[0];
		if (file) {
			return file;
		}
		if (!this.manualValue) {
			return null;
		}
		if (this.manualValue instanceof Blob) {
			return this.manualValue;
		}
		return Sunniesnow.Utils.base64ToBlobSync(this.manualValue);
	}

	async getAsync(onProgress) {
		this.dirty = false;
		if (this.element.disabled) {
			return null;
		}
		const file = this.element.files[0];
		if (file) {
			return file;
		}
		if (!this.manualValue) {
			return null;
		}
		if (this.manualValue instanceof Blob) {
			return this.manualValue;
		}
		return await Sunniesnow.Utils.base64ToBlob(this.manualValue);
	}

	set(value) {
		this.manualValue = value;
	}

	save() {
		const file = this.element.files[0];
		if (file) {
			this.manualValue = Sunniesnow.Utils.blobToBase64Sync(file);
		}
		return this.manualValue;
	}

	async saveAsync() {
		const file = this.element.files[0];
		if (file) {
			this.manualValue = await Sunniesnow.Utils.blobToBase64(file);
		}
		return this.manualValue;
	}
};
