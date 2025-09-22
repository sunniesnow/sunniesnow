// string -> string, only applicable to radio settings.
// Each radio element needs data-input attribute, or intended to be left unset for undefined.
// If the current value is set to a radio element with data-input attribute but points to empty value,
// it will try to find a non-empty valued radio element to set the value to.
Sunniesnow.HookAvoidNull = class HookAvoidNull extends Sunniesnow.Hook {
	initialize() {
		this.mapValueToSetting = new Map();
		for (const element of this.setting.elements) {
			const id = element.dataset.input;
			if (!id) {
				continue;
			}
			const setting = this.setting.refer(id);
			this.mapValueToSetting.set(element.value, setting);
		}
	}

	async apply(value, token) {
		const selectedSetting = this.mapValueToSetting.get(value);
		if (selectedSetting == null || await selectedSetting.get(token) != null) {
			return value;
		}
		let result;
		for (const element of this.setting.elements) {
			if (element.value === value) {
				continue;
			}
			this.setting.uninterruptibleStatus.set(token, true);
			this.setting.set(element.value); // otherwise some inputs may return null
			this.setting.uninterruptibleStatus.set(token, false);
			const got = await this.mapValueToSetting.get(element.value)?.get(token);
			if (got != null) {
				result = element.value;
				break;
			}
		}
		if (!result || token) {
			this.setting.uninterruptibleStatus.set(token, true);
			this.setting.set(value);
			this.setting.uninterruptibleStatus.set(token, false);
		}
		return result || value; // use || instead of ?? to ensure empty string is also treated falsy
	}
};
