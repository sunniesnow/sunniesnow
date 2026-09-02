Sunniesnow.ScriptsLoader = {
	CDN_PREFIX: 'https://fastly.jsdelivr.net/npm',

	incarnation: Sunniesnow.ScriptsLoader,
	polyfill: {keys: [], values: []},

	async init() {
		this.data = await this.json('scripts');
		this.cdnScripts = this.data.npmScripts.map(({path, pathMin, esm}) => {
			if (Sunniesnow.environment === 'production' && pathMin) {
				path = pathMin;
			}
			path = `${this.CDN_PREFIX}/${
				path.replaceAll(/\$(\w+)/g, (match, varName) => this.data.npmLock[varName])
			}?fuck-cache=${Sunniesnow.fuckCache}`;
			return {path, esm};
		});
		const mapSite = async path => {
			path = `${Sunniesnow.Utils.base()}/js/${path}.js?fuck-cache=${Sunniesnow.fuckCache}`;
			return {path, script: await this.text(path)};
		};
		[this.customizableSiteScripts, this.siteScripts] = await Promise.all([
			Promise.all(this.data.customizableSiteScripts.map(mapSite)),
			Promise.all(this.data.siteScripts.map(mapSite))
		]);
		this.siteScripts = this.siteScripts.concat(this.customizableSiteScripts);
		this.siteJson = this.data.siteJson; // do not load them immediately because not all of them are actually needed
	},

	initFromIncarnation() {
		if (!this.incarnation) {
			return;
		}
		this.data = this.incarnation.data;
		this.cdnScripts = this.incarnation.cdnScripts;
		this.customizableSiteScripts = this.incarnation.customizableSiteScripts;
		this.siteScripts = this.incarnation.siteScripts;
		this.siteJson = this.incarnation.siteJson;
	},

	async initAndRunAllScripts() {
		await this.init();
		await Promise.all(this.cdnScripts.map(this.runModule.bind(this)));
		this.siteScripts.forEach(this.runScript.bind(this));
	},

	async initAndRunSiteScripts() {
		await this.init();
		this.siteScripts.forEach(this.runScript.bind(this));
	},

	setPolyfill(polyfill) {
		[this.polyfill.keys, this.polyfill.values] = Sunniesnow.Utils.transposeArray(Object.entries(polyfill));
	},

	runCustomizableSiteScripts() {
		this.customizableSiteScripts.forEach(this.runScript.bind(this));
	},

	async runModule({path, esm}) {
		if (esm) {
			let module = await import(path);
			module = module.default ?? module;
			if (globalThis[esm]) {
				Object.assign(globalThis[esm], module);
			} else {
				globalThis[esm] = module;
			}
		} else {
			// use indirect eval to run in global scope
			eval?.(`${await this.text(path)}\n//# sourceURL=${this.sourceUrl(path)}`);
		}
	},

	async text(path) {
		return await (await fetch(path)).text();
	},

	runScript({script, path}) {
		if (path) {
			script += `\n//# sourceURL=${this.sourceUrl(path)}`;
		}
		new Function('selfPath', ...this.polyfill.keys, script)(path, ...this.polyfill.values);
	},

	async json(path) {
		return JSON.parse(await this.text(`${Sunniesnow.Utils.base()}/json/${path}.json?fuck-cache=${Sunniesnow.fuckCache}`));
	},

	sourceUrl(scriptPath) {
		return Sunniesnow.Utils.isBrowser() ? scriptPath : scriptPath.replace(/^\//, '');
	}
};

Sunniesnow.ScriptsLoader.initFromIncarnation();
