Sunniesnow.SettingSelect = class SettingSelect extends Sunniesnow.Setting {
	constructor(collection, element) {
		super(collection, element);
		this.element.addEventListener('change', event => this.dispatchEvent(new Event('change')));
	}

	get() {
		return this.element.value;
	}

	set(value) {
		this.element.value = value;
	}
};
