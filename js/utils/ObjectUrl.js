Sunniesnow.ObjectUrl = {

	urls: [],
	timeouts: {},
	types: {},

	create(blob) {
		const url = this.createPersistent(blob);
		this.timeouts[url] = setTimeout(() => this.revoke(url), Sunniesnow.Config.objectUrlTimeout * 1000);
		return url;
	},

	createPersistent(blob) {
		const url = URL.createObjectURL(blob);
		this.urls.push(url);
		this.types[url] = blob.type;
		return url;
	},

	revoke(url) {
		URL.revokeObjectURL(url);
		const index = this.urls.indexOf(url);
		if (index === -1) {
			Sunniesnow.warn(`ObjectUrl ${url} was not created by Sunniesnow.ObjectUrl`);
			return;
		}
		this.urls.splice(index, 1);
		delete this.types[url];
		if (this.timeouts[url]) {
			clearTimeout(this.timeouts[url]);
			delete this.timeouts[url];
		}
	}

};
