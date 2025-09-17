Sunniesnow.SettingCollection = class SettingCollection extends Sunniesnow.Setting {
	constructor(collection, element, inList = false) {
		super(collection, element);
		this.inList = inList;
		this.mapElementIdToSetting = new Map();
		this.mapSettingIdToSetting = new Map();
		this.processElements();
		this.applyPrerequisites();
		this.processElementsSecondRound();
	}

	getElementById(id) {
		return id && this.element.querySelector('#' + id);
	}

	getElementsByName(name) {
		return name ? this.element.querySelectorAll(`[name="${name}"]`) : [];
	}

	processElements() {
		const unprocessedElements = new Set(this.element.querySelectorAll('select, input, textarea, [data-type]'));
		while (unprocessedElements.size) {
			const element = unprocessedElements.values().next().value;
			unprocessedElements.delete(element);
			if (this.mapElementIdToSetting.has(element.id)) {
				continue;
			}
			let settingClass;
			if (element.dataset.type) {
				settingClass = Sunniesnow[Sunniesnow.Utils.slugToCamel('Setting-' + element.dataset.type)];
			} else {
				switch (element.type) {
					case 'select-one':
						settingClass = Sunniesnow.SettingSelect;
						break;
					case 'textarea':
					case 'text':
					case 'password':
					case 'email':
					case 'url':
					case 'tel':
						settingClass = Sunniesnow.SettingText;
						break;
					case 'checkbox':
						settingClass = Sunniesnow.SettingCheckbox;
						break;
					case 'radio':
						settingClass = Sunniesnow.SettingRadio;
						break;
					case 'file':
						settingClass = Sunniesnow.SettingFile;
						break;
					case 'range':
						settingClass = Sunniesnow.SettingRange;
						break;
					case 'number':
						settingClass = Sunniesnow.SettingNumber;
						break;
				}
			}
			const setting = new settingClass(this.collection ?? this, element);
			this.mapSettingIdToSetting.set(setting.id, setting);
		}
	}

	processElementsSecondRound() {
		for (const setting of this.mapSettingIdToSetting.values()) {
			setting.secondRound();
		}
	}

	applyPrerequisites() {
		this.element.querySelectorAll('[data-prerequisite]').forEach(element => {
			const prerequisiteElement = this.getElementById(element.dataset.prerequisite);
			let listener;
			switch (prerequisiteElement.type) {
				case 'checkbox':
					listener = () => this.setEnabled(element, prerequisiteElement.checked);
					prerequisiteElement.addEventListener('change', listener);
					listener();
					break;
				case 'radio':
					const radios = this.getElementsByName(prerequisiteElement.name);
					listener = () => this.setEnabled(element, prerequisiteElement.checked);
					radios.forEach(radio => radio.addEventListener('change', listener));
					listener();
					break;
			}
		});
	}

	setEnabled(element, enabled) {
		if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
			element.disabled = !enabled;
		} else {
			element.style.display = enabled ? '' : 'none';
		}
	}

	get() {
		const result = {};
		for (const [id, setting] of this.mapSettingIdToSetting) {
			result[id] = setting.get();
		}
		return result;
	}

	async getAsync(onProgress) {
		const result = {};
		await Promise.all(Array.from(this.mapSettingIdToSetting).map(async ([id, setting]) => {
			// the conversion between slug and camel is to keep backward compatibility
			result[Sunniesnow.Utils.slugToCamel(id)] = await setting.getAsync(onProgress);
		}));
		return result;
	}

	set(value) {
		for (const [id, setting] of this.mapSettingIdToSetting) {
			if (id in value) {
				setting.set(value[id]);
			}
		}
	}

	save() {
		const result = {};
		for (const [id, setting] of this.mapSettingIdToSetting) {
			// the conversion between slug and camel is to keep backward compatibility
			result[Sunniesnow.Utils.slugToCamel(id)] = setting.save();
		}
		return result;
	}

	load(value) {
		if (!value) {
			return;
		}
		for (const id in value) {
			const settingId = Sunniesnow.Utils.camelToSlug(id);
			const setting = this.mapSettingIdToSetting.get(settingId);
			if (setting) {
				setting.load(value[id]);
			} else {
				Sunniesnow.Logs.warn(`Unknown setting ID: ${settingId}`);
			}
		}
	}

	clearDownloadingProgresses() {
		for (const setting of this.mapSettingIdToSetting.values()) {
			if (setting instanceof Sunniesnow.SettingOnline) {
				setting.clearDownloadingProgress();
			} else if (setting instanceof Sunniesnow.SettingCollection || setting instanceof Sunniesnow.SettingList) {
				setting.clearDownloadingProgresses();
			}
		}
	}
};
