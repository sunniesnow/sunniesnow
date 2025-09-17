Sunniesnow.SettingSelect = class SettingSelect extends Sunniesnow.Setting {
	constructor(collection, element, idSuffix = '') {
		super(collection, element, idSuffix);
		this.element.addEventListener('change', event => this.dispatchEvent(new Event('change')));
	}

	get() {
		return this.element.value;
	}

	set(value) {
		this.element.value = value;
	}
};
