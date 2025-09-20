Sunniesnow.SettingCheckbox = class SettingCheckbox extends Sunniesnow.Setting {
	postInit() {
		this.dirtyOn('change');
	}

	value() {
		return this.element.checked;
	}

	set(value) {
		this.element.checked = value;
	}
};
