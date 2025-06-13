Sunniesnow.Imgur = {
	async load() {
		if (typeof indexedDB === 'undefined') {
			Sunniesnow.Logs.warn('IndexedDB is not supported in this browser');
			return;
		}
		this.db = await new Promise((resolve, reject) => {
			const request = indexedDB.open('Imgur', 1);
			request.addEventListener('error', event => reject(event.target.error));
			const successListener = event => resolve(event.target.result);
			request.addEventListener('success', successListener);
			request.addEventListener('upgradeneeded', event => {
				const db = event.target.result;
				if (db.objectStoreNames.contains('images')) {
					return;
				}
				request.removeEventListener('success', successListener);
				const objectStore = db.createObjectStore('images', {keyPath: 'hash'});
				for (const key of ['title', 'description', 'createdAt', 'url', 'deleteKey']) {
					objectStore.createIndex(key, key);
				}
				objectStore.transaction.addEventListener('complete', event => resolve(db));
				objectStore.transaction.addEventListener('error', event => reject(event.target.error));
				objectStore.transaction.addEventListener('abort', event => reject(new Error('Transaction for creating object store aborted')));
			});
		});
	},

	async uploadImage(title, description, blob) {
		let hash;
		if (this.db) {
			hash = await Sunniesnow.Utils.sha256(blob);
			if (!hash) {
				return null;
			}
			const retrieved = await new Promise((resolve, reject) => {
				const transaction = this.db.transaction(['images'], 'readonly');
				const objectStore = transaction.objectStore('images');
				let result;
				const request = objectStore.get(hash);
				request.addEventListener('success', event => result = event.target.result);
				request.addEventListener('error', event => {
					const error = event.target.error;
					Sunniesnow.Logs.warn(`Failed to retrieve image ${title} from IndexedDB: ${error.message}`, error);
					resolve(null);
				});
				transaction.addEventListener('complete', event => resolve(result));
				transaction.addEventListener('abort', event => {
					Sunniesnow.Logs.warn('Transaction for retrieving image from IndexedDB aborted');
					resolve(null);
				});
			});
			if (retrieved) {
				return retrieved.url;
			}
		}
		const formData = new FormData();
		formData.append('image', blob);
		formData.append('type', 'image');
		formData.append('title', title);
		formData.append('description', description);
		const response = await fetch('https://api.imgur.com/3/image', {
			method: 'POST',
			headers: {Authorization: `Client-ID ${Sunniesnow.game.settings.imgurClientId}`},
			body: formData,
		});
		if (!response.ok) {
			throw new Error(`Imgur upload failed: ${response.status} ${response.statusText}`);
		}
		const data = await response.json();
		if (!data.success) {
			throw new Error(`Imgur upload failed: ${data.data.error}`);
		}
		if (this.db) {
			await new Promise((resolve, reject) => {
				const transaction = this.db.transaction(['images'], 'readwrite');
				const objectStore = transaction.objectStore('images');
				const imageData = {hash, title, description, createdAt: data.data.datetime, url: data.data.link, deleteKey: data.data.deletehash};
				const request = objectStore.add(imageData);
				request.addEventListener('error', event => {
					const error = event.target.error;
					Sunniesnow.Logs.warn(`Failed to store image ${title} in IndexedDB: ${error.message}`, error);
					resolve();
				});
				transaction.addEventListener('complete', event => resolve());
				transaction.addEventListener('abort', event => {
					Sunniesnow.Logs.warn('Transaction for storing image in IndexedDB aborted');
					resolve();
				});
			});
		}
		return data.data.link;
	},

	async backgroundFromLevel() {
		if (Sunniesnow.game.settings.background != 'from-level') {
			return null;
		}
		if (!Sunniesnow.game.settings.backgroundFromLevel) {
			return null;
		}
		let levelName;
		switch (Sunniesnow.game.settings.levelFile) {
			case 'online':
				levelName = Sunniesnow.game.settings.levelFileOnline;
				break;
			case 'upload':
				levelName = Sunniesnow.game.settings.levelFileUpload.name;
				break;
		}
		try {
			return await this.uploadImage(
				Sunniesnow.game.chart.title,
				`${levelName}/${Sunniesnow.game.settings.backgroundFromLevel}`,
				Sunniesnow.game.loaded.chart.backgrounds[Sunniesnow.game.settings.backgroundFromLevel]
			);
		} catch (err) {
			Sunniesnow.Logs.warn(`Failed to generate background image URL: ${err.message ?? err}`, err);
			return null;
		}
	}
};
