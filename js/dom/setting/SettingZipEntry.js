Sunniesnow.SettingZipEntry = class SettingZipEntry extends Sunniesnow.SettingSelect {

	static Hook = class HookZipEntry extends Sunniesnow.Hook {
		async apply(value) {
			if (this.setting.element.disabled) {
				return null;
			}
			const zip = await this.setting.zipSetting.get();
			value = this.setting.value(); // because loading zip may change the value
			const buffer = await zip.files[value]?.async('arraybuffer');
			if (buffer) {
				return new Blob([buffer], {type: mime.getType(value) ?? 'application/octet-stream'});
			}
		}
	}

	secondRound() {
		super.secondRound();
		this.zipSetting = this.refer(this.element.dataset.source);
		this.zipSetting.addEventListener('change', event => this.markDirty());
	}

	onZipStartLoading() {
		this.clearOptions();
	}

	onZipLoaded(zip) {
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
				this.addOption(filename);
				continue;
			}
			const mimeType = mime.getType(filename);
			if (new RegExp('^' + accept.replaceAll('*', '.*') + '$').test(mimeType)) {
				this.addOption(filename);
			}
		}
	}

	clearOptions() {
		if (this.element.childElementCount === 0) {
			return;
		}
		this.previousValue = this.element.value;
		this.element.innerHTML = '';
	}

	addOption(value) {
		const option = document.createElement('option');
		option.value = value;
		option.innerText = value;
		option.defaultSelected = this.element.childElementCount === 0;
		this.element.appendChild(option);
		if (!this.element.value || this.previousValue === value) {
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
		this.previousValue = value;
	}

	setUpHooks() {
		super.setUpHooks();
		this.hooks.unshift(new this.constructor.Hook(this));
	}
};
