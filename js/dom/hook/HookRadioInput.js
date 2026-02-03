// string -> any, only applicable to radio settings.
// each radio element needs data-input attribute, or intended to be left unset for undefined.
Sunniesnow.HookRadioInput = class HookRadioInput extends Sunniesnow.Hook {
	initialize() {
		this.mapValueToSetting = new Map();
		for (const element of this.setting.elements) {
			const id = element.dataset.input;
			if (!id) {
				continue;
			}
			const setting = this.setting.refer(id);
			this.mapValueToSetting.set(element.value, setting);
			setting.addEventListener('load', event => this.setting.get(event.token));
			setting.addEventListener('change', event => element.checked && this.setting.markDirty());
		}
	}

	async apply(value, token) {
		return await this.mapValueToSetting.get(value)?.getWithoutCache(token);
	}
};
