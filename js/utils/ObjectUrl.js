Sunniesnow.ObjectUrl = {

	urls: new Set(),
	timeouts: {},
	types: {},

	create(blob) {
		const url = this.createPersistent(blob);
		this.timeouts[url] = setTimeout(() => this.revoke(url), Sunniesnow.Config.objectUrlTimeout * 1000);
		return url;
	},

	createPersistent(blob) {
		const url = URL.createObjectURL(blob);
		this.urls.add(url);
		this.types[url] = blob.type;
		return url;
	},

	revoke(url) {
		URL.revokeObjectURL(url);
		if (!this.urls.has(url)) {
			Sunniesnow.warn(`ObjectUrl ${url} was not created by Sunniesnow.ObjectUrl`);
			return;
		}
		this.urls.delete(url);
		delete this.types[url];
		if (this.timeouts[url]) {
			clearTimeout(this.timeouts[url]);
			delete this.timeouts[url];
		}
	}

};
