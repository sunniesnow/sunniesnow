Sunniesnow.SettingButtonList = class SettingButtonList extends Sunniesnow.SettingText {
	get() {
		const result = super.get().split(' ');
		if (result.length === 1 && result[0] === '') {
			result.splice(0, 1);
		}
		return result;
	}

	set(value) {
		if (!Array.isArray(value)) {
			super.set(value);
			return;
		}
		super.set(value.join(' '));
	}
};
