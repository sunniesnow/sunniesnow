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
		this.createReadmeDom();
		for (const filename in zip.files) {
			const zipObject = zip.files[filename];
			if (zipObject.dir) {
				continue;
			}
			this.blobs[filename] = await zipObject.async('blob');
			if (Sunniesnow.Utils.needsDisplayTextFile(filename)) {
				this.fillReadme(filename, await zipObject.async('text'));
			}
		}
		this.onLoad();
	}

	createReadmeDom() {
		const details = document.createElement('details');
		details.id = `plugin-${this.id}-readme-details`
		const summary = document.createElement('summary');
		summary.innerText = `Plugin ${this.id} README`;
		details.appendChild(summary);
		const readme = document.createElement('div');
		readme.id = `plugin-${this.id}-readme`;
		readme.classList.add('readme');
		details.appendChild(readme);
		document.getElementById('plugins-readme').appendChild(details);
	}

	deleteReadmeDom() {
		const element = document.getElementById(`plugin-${this.id}-readme-details`);
		element.parentElement.removeChild(element);
	}

	fillReadme(filename, text) {
		const type = mime.getType(filename);
		const details = document.createElement('details');
		const summary = document.createElement('summary');
		summary.innerText = filename;
		details.appendChild(summary);
		const element = document.createElement('div');
		details.appendChild(element);
		if (type?.endsWith('markdown')) {
			text = marked.parse(text, { mangle: false, headerIds: false });
			element.innerHTML = DOMPurify.sanitize(text);
		} else {
			const pre = document.createElement('pre');
			pre.innerText = text;
			element.appendChild(pre);
		}
		document.getElementById(`plugin-${this.id}-readme`).appendChild(details);
	}

	async apply() {
		const blob = this.blobs['main.js'];
		if (!blob) {
			Sunniesnow.Utils.warn(`Plugin ${this.id} does not have a main.js`);
			return;
		}
		this.constructor.now = this;
		const script = document.createElement('script');
		script.src = Sunniesnow.ObjectUrl.create(blob);
		document.body.appendChild(script);
		await new Promise((resolve, reject) => script.addEventListener('load', event => resolve()));
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
		const result = document.createElement('div');
		result.id = `plugin-${n}`;
		result.innerHTML = `
			<div>
				<input type="radio" id="plugin-${n}-online-radio" name="plugin-${n}" value="online" checked>
				<label for="plugin-${n}-online-radio">Online:</label>
				<input type="text" id="plugin-${n}-online" placeholder="empty">
			</div>

			<div>
				<input type="radio" id="plugin-${n}-upload-radio" name="plugin-${n}" value="upload">
				<label for="plugin-${n}-upload-radio">Upload:</label>
				<input type="file" id="plugin-${n}-upload" accept=".ssp" onchange="Sunniesnow.Loader.markManual('plugin-${n}-upload');">
			</div>

			<div>
				<button type="button" onclick="Sunniesnow.Plugin.deleteDomElement(${n})">Delete</button>
			</div>

			<hr>
		`;
		return result;
	}

	static addDomElement(n) {
		if (n === undefined) {
			n = this.additionalTotal ||= 0;
		}
		document.getElementById('plugin-list').appendChild(this.html(n));
		Sunniesnow.Preprocess.associateRadio(`plugin-${n}-online-radio`, `plugin-${n}-online`);
		Sunniesnow.Preprocess.associateRadio(`plugin-${n}-upload-radio`, `plugin-${n}-upload`);
		this.additionalTotal = Math.max(this.additionalTotal || 0, n) + 1;
	}

	static deleteDomElement(n) {
		const listElement = document.getElementById('plugin-list');
		const pluginElement = document.getElementById(`plugin-${n}`);
		listElement.removeChild(pluginElement);
	}

	static clearDomElements() {
		this.additionalTotal = 0;
		const element = document.getElementById('plugin-list');
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
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
