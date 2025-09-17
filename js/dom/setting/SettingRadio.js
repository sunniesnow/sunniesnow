Sunniesnow.SettingRadio = class SettingRadio extends Sunniesnow.Setting {
	constructor(collection, element) {
		super(collection, element);
		delete this.element;
		this.setId(element.name);
		this.elements = collection.getElementsByName(element.name);
		for (const el of this.elements) {
			collection.mapElementIdToSetting.set(el.id, this);
		}
	}

	get() {
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
