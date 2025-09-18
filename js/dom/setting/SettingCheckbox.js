Sunniesnow.SettingCheckbox = class SettingCheckbox extends Sunniesnow.Setting {
	value() {
		return this.element.checked;
	}

	set(value) {
		this.element.checked = value;
	}
};
