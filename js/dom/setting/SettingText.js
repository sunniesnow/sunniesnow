Sunniesnow.SettingText = class SettingText extends Sunniesnow.Setting {
	constructor(collection, element) {
		super(collection, element);
		element.spellcheck = false;
		element.autocomplete = 'off';
		element.autocorrect = 'off';
		element.autocapitalize = 'none';
	}

	get() {
		return this.element.value;
	}

	set(value) {
		this.element.value = value;
	}
};
