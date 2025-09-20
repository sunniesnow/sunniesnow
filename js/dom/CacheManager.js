Sunniesnow.CacheManager = {
	SITE_STORAGE_NAME: 'site-v1',
	ONLINE_STORAGE_NAME: 'online-v1',
	EXTERNAL_STORAGE_NAME: 'external-v1',

	async clearCacheStorage(storageName, userSeenName) {
		if (!globalThis.caches) {
			Sunniesnow.Logs.warn('Caches are not available');
			return;
		}
		if (!await caches.delete(storageName)) {
			Sunniesnow.Logs.warn(`No caches of ${userSeenName} to delete`);
		}
	},

	async deleteOnlineCaches() {
		await this.clearCacheStorage(this.ONLINE_STORAGE_NAME, 'online resources');
	},

	async deleteSiteCaches() {
		await this.clearCacheStorage(this.SITE_STORAGE_NAME, 'site resources');
	},

	async deleteExternalCaches() {
		await this.clearCacheStorage(this.EXTERNAL_STORAGE_NAME, 'external resources');
	},

	async registerServiceWorker() {
		const sw = navigator.serviceWorker;
		if (!sw) {
			Sunniesnow.Logs.warn('Service worker is not supported on this browser')
			return;
		}
		try {
			if (this.serviceWorkerRegistration) {
				this.serviceWorkerRegistration = await this.serviceWorkerRegistration.update();
			} else {
				const base = Sunniesnow.Utils.base();
				let swUrl = `${base}/service-worker.js`;
				if (Sunniesnow.vscodeBrowserReqId) {
					swUrl += `?vscodeBrowserReqId=${Sunniesnow.vscodeBrowser}`;
				}
				this.serviceWorkerRegistration = await sw.register(swUrl, {scope: `${base}/`});
			}
		} catch (error) {
			Sunniesnow.Logs.warn(`Failed to register service worker: ${error}`, error);
		}
	}

};
