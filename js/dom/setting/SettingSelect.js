Sunniesnow.SettingSelect = class SettingSelect extends Sunniesnow.Setting {
	get() {
		return this.element.value;
	}

	set(value) {
		this.element.value = value;
	}
};
