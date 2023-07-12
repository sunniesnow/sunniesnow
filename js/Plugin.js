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
		this.constructor.plugins[id] = this;
	}

	static async load(id, blob) {
		if (blob) {
			const plugin = new this(id, blob)
			await plugin.load();
			return plugin;
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
			Sunniesnow.Utils.warn(`Failed to load plugin ${this.id}: cannot read as zip`, e);
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
			Sunniesnow.Utils.warn(`Plugin ${this.id} does not have a main.js`);
			return;
		}
		this.constructor.now = this;
		const script = document.createElement('script');
		script.src = URL.createObjectURL(blob);
		document.body.appendChild(script);
		await new Promise((resolve, reject) => script.addEventListener('load', event => resolve()));
		URL.revokeObjectURL(script.src);
		document.body.removeChild(script);
		if (this.main) {
			await this.main();
		}
		this.constructor.now = null;
		this.applied = true;
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

	static html(n) {
		return `
			<div id="plugin-${n}">
				<div>
					<input type="radio" id="plugin-${n}-online-radio" name="plugin-${n}" checked>
					<label for="plugin-${n}-online-radio">Online:</label>
					<input type="text" id="plugin-${n}-online" placeholder="empty.ssp">
				</div>

				<div>
					<input type="radio" id="plugin-${n}-upload-radio" name="plugin-${n}">
					<label for="plugin-${n}-upload-radio">Upload:</label>
					<input type="file" id="plugin-${n}-upload" accept=".ssp">
				</div>

				<div>
					<button type="button" onclick="Sunniesnow.Plugin.deleteDomElement(${n})">Delete</button>
				</div>

				<hr>
			</div>
		`;
	}

	static addDomElement() {
		this.additionalTotal ||= 0;
		const listElement = document.getElementById('plugin-list');
		listElement.innerHTML += this.html(this.additionalTotal);
		this.additionalTotal++;
	}

	static deleteDomElement(n) {
		const listElement = document.getElementById('plugin-list');
		const pluginElement = document.getElementById(`plugin-${n}`);
		listElement.removeChild(pluginElement);
	}

	static async loadSkin() {
		const plugin = await this.load('skin', await Sunniesnow.Loader.skinBlob());
		await plugin?.apply();
	}

	static async loadFx() {
		const plugin = await this.load('fx', await Sunniesnow.Loader.fxBlob());
		await plugin?.apply();
	}

	static async loadSe() {
		const plugin = await this.load('se', await Sunniesnow.Loader.seBlob());
		await plugin?.apply();
	}

	static async loadPlugin(id) {
		switch (id) {
			case 'skin':
				return this.loadSkin();
			case 'fx':
				return this.loadFx();
			case 'se':
				return this.loadSe();
			default:
				const plugin = await this.load(id, await Sunniesnow.Loader.pluginBlob(id));
				await plugin?.apply();
		}
	}
};
