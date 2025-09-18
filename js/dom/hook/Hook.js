// Simply a postprocessor for setting values. They can be chained to form very good postprocessing.
// They are good because the postprocessing results are cached until the setting is changed.
// This prevents too many assets re-decoding every time the game starts.
// Hooks cannot be applied to lists and collections.
Sunniesnow.Hook = class Hook {
	constructor(setting, ...args) {
		this.setting = setting;
		this.initialize(...args);
	}

	initialize() {
	}

	interrupt() {
	}

	async apply(value) {
		return value;
	}
};
