Sunniesnow.Plugin = class Plugin {

	static now = null;
	static plugins = {};

	constructor(id, blob) {
		this.id = id;
		this.blob = blob;
		this.blobs = {};
		this.loadListeners = [];
		this.loaded = false;
		this.loading = false;
		this.applied = false;
		const oldPlugin = this.constructor.plugins[id];
		if (oldPlugin?.mainUrl) {
			URL.revokeObjectURL(oldPlugin.mainUrl);
		}
		this.constructor.plugins[id] = this;
	}

	static async load(id, blob) {
		if (blob) {
			await new this(id, blob).load();
		} else {
			delete this.plugins[id];
		}
	}

	async load() {
		this.loading = true;
		let zip;
		try {
			zip = await JSZip.loadAsync(this.blob);
		} catch (e) {
			Sunniesnow.Utils.warn(`Failed to load plugin ${this.id}: cannot read as zip`);
			return;
		}
		for (const filename in zip.files) {
			const zipObject = zip.files[filename];
			if (zipObject.dir) {
				continue;
			}
			this.blobs[filename] = await zipObject.async('blob');
		}
		this.onLoad();
	}

	async apply() {
		const blob = this.blobs['main.js'];
		if (!blob) {
			Sunniesnow.Utils.warn(`Failed to apply plugin ${this.id}: main.js not found`);
			return;
		}
		this.constructor.now = this;
		const script = document.createElement('script');
		script.src = this.mainUrl = URL.createObjectURL(blob);
		document.body.appendChild(script);
		await new Promise((resolve, reject) => script.addEventListener('load', event => resolve()));
		document.body.removeChild(script);
		if (!this.main) {
			Sunniesnow.Utils.warn(`Failed to apply plugin ${this.id}: main.js does not define main()`);
			return;
		}
		await this.main();
		this.constructor.now = null;
		this.applied = true;
	}

	async loadAndApply() {
		if (this.applied) {
			return;
		}
		if (!this.loaded) {
			if (!this.loading) {
				this.load();
			}
			await new Promise((resolve, reject) => this.addLoadListener(() => resolve()));
		}
		await this.apply();
	}

	addLoadListener(listener) {
		this.loadListeners.push(listener);
	}

	onLoad() {
		this.loading = false;
		this.loaded = true;
		for (const listener of this.loadListeners) {
			listener();
		}
	}
};
