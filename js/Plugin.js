Sunniesnow.Plugin = class Plugin {

	static now = null;
	static plugins = {};
	static needsReset = false;

	constructor(id, blob) {
		this.id = id;
		this.blob = blob;
		this.blobs = {};
		this.loadListeners = [];
		this.loaded = false;
		this.loading = false;
		this.applied = false;
	}

	static async reset() {
		if (!this.needsReset) {
			return;
		}
		await Sunniesnow.ScriptsLoader.runSiteScripts(Sunniesnow.ScriptsLoader.CUSTOMIZABLE_SITE_SCRIPTS);
		this.needsReset = false;
	}

	static async load(id, blob) {
		if (blob) {
			if (this.plugins[id]?.blob !== blob) {
				this.plugins[id]?.deleteReadmeDom();
				this.needsReset = true;
				this.plugins[id] = new this(id, blob);
			}
			await this.plugins[id].load();
		} else {
			if (this.plugins[id]) {
				this.needsReset = true;
				this.plugins[id].deleteReadmeDom();
			}
			delete this.plugins[id];
		}
	}

	async load() {
		if (this.loaded) {
			this.onLoad();
			return;
		}
		this.loading = true;
		let zip;
		try {
			zip = await JSZip.loadAsync(this.blob);
		} catch (e) {
			Sunniesnow.Utils.warn(`Failed to load plugin ${this.id}: cannot read as zip`, e);
			return;
		}
		if (Sunniesnow.Utils.isBrowser()) {
			this.createReadmeDom();
		}
		for (const filename in zip.files) {
			const zipObject = zip.files[filename];
			if (zipObject.dir) {
				continue;
			}
			this.blobs[filename] = await zipObject.async('blob');
			if (Sunniesnow.Utils.isBrowser() && Sunniesnow.Utils.needsDisplayTextFile(filename)) {
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
		this.constructor.now = this;
		if (!this.applied) {
			const blob = this.blobs['main.js'];
			if (!blob) {
				Sunniesnow.Utils.warn(`Plugin ${this.id} does not have a main.js`);
				this.constructor.now = null;
				return;
			}
			Sunniesnow.ScriptsLoader.runScriptFromString(await blob.text(), `plugin-${this.id}/main.js`);
			this.applied = true;
		}
		await this.main?.();
		this.constructor.now = null;
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
				<span id="plugin-${n}-downloading"></span>
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
		Sunniesnow.Dom.associateRadio(`plugin-${n}-online-radio`, `plugin-${n}-online`);
		Sunniesnow.Dom.associateRadio(`plugin-${n}-upload-radio`, `plugin-${n}-upload`);
		Sunniesnow.Dom.setTextInput(`plugin-${n}-online`);
		this.additionalTotal = Math.max(this.additionalTotal || 0, n) + 1;
	}

	static deleteDomElement(n) {
		const listElement = document.getElementById('plugin-list');
		const pluginElement = document.getElementById(`plugin-${n}`);
		listElement.removeChild(pluginElement);
	}

	static clearDomElements() {
		this.additionalTotal = 0;
		document.getElementById('plugin-list').innerHTML = '';
	}

	static async loadPlugin(id) {
		await this.load(id, await Sunniesnow.Loader.pluginBlob(id));
	}

	static async applyPlugins() {
		for (const id in this.plugins) {
			await this.plugins[id].apply();
		}
	}
};
