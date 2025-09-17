Sunniesnow.SettingCheckbox = class SettingCheckbox extends Sunniesnow.Setting {
	get() {
		return this.element.checked;
	}

	set(value) {
		this.element.checked = value;
	}
};
