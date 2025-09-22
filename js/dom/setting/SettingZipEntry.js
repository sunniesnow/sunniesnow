Sunniesnow.SettingZipEntry = class SettingZipEntry extends Sunniesnow.SettingSelect {

	static Hook = class HookZipEntry extends Sunniesnow.Hook {
		async apply(value, token) {
			if (this.setting.element.disabled) {
				return null;
			}
			const zip = await this.setting.zipSetting.get(token);
			if (!zip) {
				return null;
			}
			value = token ? (token.get(this.setting) ?? this.setting.previousValue.get(token)) : this.setting.value(); // because loading zip may change the value
			let file = zip.files[value];
			if (value && !file) { // this happens when zipSetting.get() read from cache
				this.setting.zipSetting.uninterruptibleStatus.set(token, true);
				this.setting.onZipStartLoading(token);
				this.setting.onZipLoaded(zip, token);
				this.setting.zipSetting.uninterruptibleStatus.set(token, false);
				value = token ? (token.get(this.setting) ?? this.setting.previousValue.get(token)) : this.setting.value();
				file = zip.files[value];
			}
			const buffer = await file?.async('arraybuffer');
			if (buffer) {
				return new Blob([buffer], {type: mime.getType(value) ?? 'application/octet-stream'});
			}
		}
	}

	postInit() {
		super.postInit();
		this.previousValue = new Sunniesnow.WeakMap(); // map from token or null to value
	}

	secondRound() {
		super.secondRound();
		this.zipSetting = this.refer(this.element.dataset.source);
		this.zipSetting.addEventListener('change', event => this.markDirty());
	}

	onZipStartLoading(token) {
		if (!token) {
			this.clearOptions();
		}
	}

	onZipLoaded(zip, token) {
		const accept = this.element.dataset.accept;
		for (const filename in zip.files) {
			if (filename.includes('/')) {
				continue;
			}
			const zipObject = zip.files[filename];
			if (zipObject.dir) {
				continue;
			}
			if (accept.startsWith('.') && filename.endsWith(accept)) {
				this.addOption(filename, token);
				continue;
			}
			const mimeType = mime.getType(filename);
			if (new RegExp('^' + accept.replaceAll('*', '.*') + '$').test(mimeType)) {
				this.addOption(filename, token);
			}
		}
	}

	clearOptions() {
		if (this.element.childElementCount === 0) {
			return;
		}
		this.previousValue.set(null, this.element.value);
		this.element.innerHTML = '';
	}

	addOption(value, token) {
		if (token) {
			if (!this.previousValue.has(token)) {
				this.previousValue.set(token, value);
			}
			return;
		}
		const option = document.createElement('option');
		option.value = value;
		option.innerText = value;
		option.defaultSelected = this.element.childElementCount === 0;
		this.element.appendChild(option);
		if (!this.element.value || this.previousValue.get(null) === value) {
			this.element.value = value;
		}
	}

	set(value) {
		for (const option of this.element.children) {
			if (option.value === value) {
				this.element.value = value;
				return;
			}
		}
		this.previousValue.set(null, value);
	}

	setUpHooks() {
		super.setUpHooks();
		this.hooks.unshift(new this.constructor.Hook(this));
	}
};
