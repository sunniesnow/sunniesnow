Sunniesnow.SettingRange = class SettingRange extends Sunniesnow.Setting {
	postInit() {
		this.dirtyOn('input');
		if (!this.element.dataset.output) {
			return;
		}
		this.output = this.collection.getElementById(this.element.dataset.output);
		const listener = () => this.output.innerText = this.element.value;
		this.element.addEventListener('input', listener);
		listener();
	}

	value() {
		return Number(this.element.value);
	}

	set(value) {
		this.element.value = value;
		this.output.innerText = value;
	}

	load(value) {
		if (isNaN(value)) {
			return;
		}
		super.load(Number(value));
	}
};
