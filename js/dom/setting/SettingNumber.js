Sunniesnow.SettingNumber = class SettingNumber extends Sunniesnow.Setting {
	postInit() {
		this.dirtyOn('change');
	}

	value() {
		let {id, value, min, max, dataset: {multiplier}} = this.element;
		value = Number(value);
		if (isNaN(value)) {
			Sunniesnow.Logs.warn(`Setting ${id} is NaN`);
			return value;
		}
		min = min === '' ? -Infinity : Number(min);
		max = max === '' ? Infinity : Number(max);
		multiplier = multiplier ? Number(multiplier) : 1;
		return Sunniesnow.Utils.clamp(value, min, max) * multiplier;
	}

	set(value) {
		let {min, max, dataset: {multiplier}} = this.element;
		min = min === '' ? -Infinity : Number(min);
		max = max === '' ? Infinity : Number(max);
		multiplier = multiplier ? Number(multiplier) : 1;
		this.element.value = Sunniesnow.Utils.clamp(value / multiplier, min, max);
	}
};
