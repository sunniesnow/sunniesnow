Sunniesnow.SettingText = class SettingText extends Sunniesnow.Setting {
	postInit() {
		this.dirtyOn('input');
		this.element.spellcheck = false;
		this.element.autocomplete = 'off';
		this.element.autocorrect = 'off';
		this.element.autocapitalize = 'none';
		this.element.addEventListener('keydown', event => {
			if (event.key === 'Enter' && !event.shiftKey && (this.element.type !== 'textarea' || event.ctrlKey)) {
				this.get();
			}
		})
	}

	value() {
		return this.element.value;
	}

	set(value) {
		if (Array.isArray(value)) {
			value = value.join(' '); // to support legacy button list and key list
		}
		this.element.value = value;
	}
};
