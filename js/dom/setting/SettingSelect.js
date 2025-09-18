Sunniesnow.SettingSelect = class SettingSelect extends Sunniesnow.Setting {
	postInit() {
		this.dirtyOn('change');
	}

	value() {
		return this.element.value;
	}

	set(value) {
		this.element.value = value;
	}
};
