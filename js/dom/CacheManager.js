Sunniesnow.CacheManager = {
	SITE_STORAGE_NAME: 'site-v1',
	ONLINE_STORAGE_NAME: 'online-v1',
	EXTERNAL_STORAGE_NAME: 'external-v1',

	async clearCacheStorage(storageName, userSeenName, element) {
		if (!globalThis.caches) {
			Sunniesnow.Logs.warn('Caches are not available');
			return;
		}
		if (!await caches.delete(storageName)) {
			Sunniesnow.Logs.warn(`No caches of ${userSeenName} to delete`);
		}
		element.innerHTML = '';
	},

	async deleteOnlineCaches() {
		await this.clearCacheStorage(this.ONLINE_STORAGE_NAME, 'online resources', document.getElementById('online-caches-list'));
	},

	async deleteSiteCaches() {
		await this.clearCacheStorage(this.SITE_STORAGE_NAME, 'site resources', document.getElementById('site-caches-list'));
	},

	async deleteExternalCaches() {
		await this.clearCacheStorage(this.EXTERNAL_STORAGE_NAME, 'external resources', document.getElementById('external-caches-list'));
	},

	async listOnlineCaches() {
		await this.listCaches(this.ONLINE_STORAGE_NAME, document.getElementById('online-caches-list'));
	},

	async listSiteCaches() {
		await this.listCaches(this.SITE_STORAGE_NAME, document.getElementById('site-caches-list'));
	},

	async listExternalCaches() {
		await this.listCaches(this.EXTERNAL_STORAGE_NAME, document.getElementById('external-caches-list'));
	},

	async listCaches(storageName, element) {
		if (!globalThis.caches) {
			Sunniesnow.Logs.warn('Caches are not available');
			return;
		}
		const cache = await caches.open(storageName);
		const requests = await cache.keys();
		element.innerHTML = '';
		requests.forEach((request, i) => {
			const tr = document.createElement('tr');
			tr.dataset.i18n = 'cache';
			const suffix = tr.dataset.i18nSuffix = `-${storageName}-${i}`;
			const td1 = document.createElement('td');
			const name = td1.textContent = Sunniesnow.Utils.sanitizeUrl(request.url);
			tr.appendChild(td1);
			const td2 = document.createElement('td');
			const button = document.createElement('button');
			button.textContent = 'Delete';
			button.type = 'button';
			button.id = `delete${suffix}`;
			button.addEventListener('click', async () => {
				if (!await cache.delete(request)) {
					Sunniesnow.Logs.warn(`Failed to delete cache of ${name}`);
				}
				tr.remove();
			});
			td2.appendChild(button);
			tr.appendChild(td2);
			element.appendChild(tr);
		});
		Sunniesnow.I18n.apply(element);
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
