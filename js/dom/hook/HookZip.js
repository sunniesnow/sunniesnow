// blob -> zip
Sunniesnow.HookZip = class HookZip extends Sunniesnow.Hook {
	initialize() {
		this.zipEntries = Array.from(this.setting.collection.element.querySelectorAll(`[data-type="zip-entry"][data-source="${this.setting.id}"]`)).map(e => this.setting.refer(e.id));
		this.setting.addEventListener('loadstart', event => this.zipEntries.forEach(s => s.onZipStartLoading()));
	}

	async apply(value) {
		const result = await JSZip.loadAsync(value);
		this.zipEntries.forEach(s => s.onZipLoaded(result));
		await Promise.all(this.zipEntries.map(s => Sunniesnow.Utils.untilLoaded(s.element)));
		return result;
	}
};
