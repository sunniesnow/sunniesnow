Sunniesnow.Plugin = class Plugin {

	static plugins = {};

	static async load() {
		if (this.needsReset()) {
			await this.reset();
			await this.loadPlugins();
			await this.applyPlugins();
		}
		await this.runMainFunctions();
	}

	static needsReset() {
		const allId = new Set();
		for (const id of ['skin', 'fx', 'se']) {
			// Use != to make sure undefined and null are treated the same
			if (this.plugins[id]?.zip != Sunniesnow.game.settings[id]) {
				return true;
			}
			allId.add(id);
		}
		for (const [id, {plugin: zip}] of Sunniesnow.game.settings.pluginList.entries()) {
			if (this.plugins[id]?.zip != zip) {
				return true;
			}
			allId.add(id.toString());
		}
		return Object.keys(this.plugins).some(id => !allId.has(id));
	}

	static async loadPlugins() {
		this.plugins = {};
		for (const id of ['skin', 'fx', 'se']) {
			await this.loadPlugin(id, Sunniesnow.game.settings[id]);
		}
		for (const [id, {plugin: zip}] of Sunniesnow.game.settings.pluginList.entries()) {
			await this.loadPlugin(id, zip);
		}
	}

	static async loadPlugin(id, zip) {
		if (!zip) {
			return;
		}
		this.plugins[id] = new this(id, zip);
		try {
			await this.plugins[id].load();
		} catch (e) {
			delete this.plugins[id];
			Sunniesnow.Logs.error(`Failed to load plugin ${id}: ${e}`, e);
		}
	}

	static async applyPlugins() {
		for (const id in this.plugins) {
			try {
				await this.plugins[id].apply();
			} catch (e) {
				Sunniesnow.Logs.error(`Failed to apply plugin ${id}: ${e}`, e);
			}
		}
	}

	static async reset() {
		document.getElementById('plugins-readme').innerHTML = '';
		await Sunniesnow.ScriptsLoader.runSiteScripts(Sunniesnow.ScriptsLoader.CUSTOMIZABLE_SITE_SCRIPTS);
	}

	static async runMainFunctions() {
		for (const id in this.plugins) {
			try {
				await this.plugins[id].main?.();
			} catch (e) {
				Sunniesnow.Logs.error(`Failed to run the main function of plugin ${id}: ${e}`, e);
			}
		}
	}

	constructor(id, zip) {
		this.id = id;
		this.zip = zip;
		this.blobs = {};
	}

	async load() {
		this.createReadmeDom();
		for (const filename in this.zip.files) {
			const zipObject = this.zip.files[filename];
			if (zipObject.dir) {
				continue;
			}
			this.blobs[filename] = new Blob([await zipObject.async('arraybuffer')], {type: mime.getType(filename) ?? 'application/octet-stream'});
			if (Sunniesnow.Utils.isBrowser() && Sunniesnow.Utils.needsDisplayTextFile(filename)) {
				this.fillReadme(filename, await this.blobs[filename].text());
			}
		}
		await this.apply();
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
		const blob = this.blobs['main.js'];
		if (blob) {
			Sunniesnow.ScriptsLoader.runScriptFromString(await blob.text(), `plugin-${this.id}/main.js`);
		} else {
			Sunniesnow.Logs.warn(`Plugin ${this.id} does not have a main.js`);
		}
		this.constructor.now = null;
	}
};
