Sunniesnow.SettingFile = class SettingFile extends Sunniesnow.Setting {
	postInit() {
		this.dirtyOn('change');
		this.element.addEventListener('change', event => {
			this.manualValue = null;
			this.get();
		});
	}

	value() {
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
		return Sunniesnow.Utils.base64ToBlobSync(this.manualValue);
	}

	load(value) {
		this.manualValue = value;
	}

	async save() {
		const file = this.element.files[0];
		if (file) {
			this.manualValue = await Sunniesnow.Utils.blobToBase64(file);
		}
		return this.manualValue;
	}
};
