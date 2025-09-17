Sunniesnow.SettingRange = class SettingRange extends Sunniesnow.Setting {
	constructor(collection, element) {
		super(collection, element);
		if (!element.dataset.output) {
			return;
		}
		const output = collection.getElementById(element.dataset.output);
		const listener = () => output.innerText = element.value;
		element.addEventListener('input', listener);
		listener();
	}

	get() {
		return Number(this.element.value);
	}

	set(value) {
		this.element.value = value;
	}
};
