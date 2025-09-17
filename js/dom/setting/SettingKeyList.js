Sunniesnow.SettingKeyList = class SettingKeyList extends Sunniesnow.SettingText {
	get() {
		const result = super.get().split(' ');
		for (let i = 0; i < result.length; i++) {
			if (result[i] === 'Spacebar') {
				result[i] = ' ';
			}
		}
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
		super.set(value.map(key => key === ' ' ? 'Spacebar' : key).join(' '));
	}
};
