Sunniesnow.ObjectUrl = {

	urls: [],
	timeouts: {},

	create(blob) {
		const url = URL.createObjectURL(blob);
		this.urls.push(url);
		this.timeouts[url] = setTimeout(() => this.revoke(url), Sunniesnow.Config.objectUrlTimeout * 1000);
		return url;
	},

	createPersistent(blob) {
		const result = URL.createObjectURL(blob);
		this.urls.push(result);
		return result;
	},

	revoke(url) {
		URL.revokeObjectURL(url);
		const index = this.urls.indexOf(url);
		if (index === -1) {
			Sunniesnow.warn(`ObjectUrl ${url} was not created by Sunniesnow.ObjectUrl`);
			return;
		}
		this.urls.splice(index, 1);
		if (this.timeouts[url]) {
			clearTimeout(this.timeouts[url]);
			delete this.timeouts[url];
		}
	}

};
