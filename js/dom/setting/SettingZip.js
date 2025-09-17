Sunniesnow.SettingZip = class SettingZip extends Sunniesnow.SettingBlob {
	constructor(collection, element, idSuffix = '') {
		super(collection, element, idSuffix);
		this.zipEntrySettings = [];
		this.loadButton = collection.getElementById(this.elements[0].dataset.loadButton);
		this.loadButton?.addEventListener('click', () => this.getAsync());
		this.resolves = [];
		this.rejects = [];
	}

	secondRound() {
		super.secondRound();
		this.allSettings().forEach(setting => {
			if (setting instanceof Sunniesnow.SettingOnline) {
				setting.element.addEventListener('keydown', event => {
					if (event.key === 'Enter') {
						this.getAsync();
					}
				});
			} else if (setting instanceof Sunniesnow.SettingFile) {
				setting.element.addEventListener('change', () => this.getAsync());
			}
		})
	}

	async getAsync(onProgress) {
		if (!this.isDirty() && this.zip) {
			return this.zip;
		}
		if (this.loading) {
			return new Promise((resolve, reject) => {
				this.resolves.push(resolve);
				this.rejects.push(reject);
			});
		}
		this.loading = true;
		try {
			this.zipEntrySettings.forEach(s => s.onZipStartLoading());
			const blob = await super.getAsync(onProgress);
			if (blob) {
				this.zip = await JSZip.loadAsync(await super.getAsync(onProgress));
			} else {
				this.zip = null;
			}
			this.zipEntrySettings.forEach(s => s.onZipLoaded());
			this.dispatchEvent(new Event('ziploaded'));
			await Promise.all(this.zipEntrySettings.map(s => Sunniesnow.Utils.untilLoaded(s.element)));
		} catch (e) {
			this.rejects.forEach(reject => reject(e));
			this.rejects.length = 0;
			this.resolves.length = 0;
			this.loading = false;
			this.zip = null;
			throw e;
		}
		this.loading = false;
		this.resolves.forEach(resolve => resolve(this.zip));
		this.rejects.length = 0;
		this.resolves.length = 0;
		return this.zip;
	}
};
