Sunniesnow.SettingFile = class SettingFile extends Sunniesnow.Setting {
	constructor(constructor, element) {
		super(constructor, element);
		this.manualValue = null;
	}

	get() {
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
};
