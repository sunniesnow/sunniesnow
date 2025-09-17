Sunniesnow.SettingZipEntry = class SettingZipEntry extends Sunniesnow.SettingSelect {
	secondRound() {
		this.zipSetting = this.collection.mapSettingIdToSetting.get(this.element.dataset.source);
		this.zipSetting.zipEntrySettings.push(this);
	}

	onZipStartLoading() {
		this.clearOptions();
	}

	onZipLoaded() {
		const accept = this.element.dataset.accept;
		const zip = this.zipSetting.zip;
		if (!zip) {
			return;
		}
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

	selected() {
		return super.get();
	}

	save() {
		return super.get();
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

	get() {
		throw new Error('Synchronous get() is not supported');
	}

	async getAsync() {
		if (this.element.disabled) {
			return null;
		}
		const buffer = await (await this.zipSetting.getAsync()).files[super.get()]?.async('arraybuffer');
		if (buffer) {
			return new Blob([buffer], {type: mime.getType(super.get()) ?? 'application/octet-stream'});
		}
	}
};
