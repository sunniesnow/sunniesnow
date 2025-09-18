Sunniesnow.SettingRadio = class SettingRadio extends Sunniesnow.Setting {
	postInit() {
		const element = this.element;
		delete this.element;
		this.setId(element.name);
		this.elements = this.collection.getElementsByName(element.name);
		for (const el of this.elements) {
			this.collection.mapElementIdToSetting.set(el.id, this);
			this.dirtyOn('change', el);
		}
	}

	value() {
		for (const element of this.elements) {
			if (element.checked) {
				return element.value;
			}
		}
	}

	set(value) {
		for (const element of this.elements) {
			if (element.value === value) {
				if (!element.checked) {
					element.checked = true;
					element.dispatchEvent(new Event('change'));
				}
				return;
			}
		}
	}
};
