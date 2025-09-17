Sunniesnow.SettingOnline = class SettingOnline extends Sunniesnow.SettingText {
	constructor(collection, element, idSuffix = '') {
		super(collection, element, idSuffix);
		this.progressElement = element.dataset.downloading && collection.getElementById(element.dataset.downloading);
		this.element.addEventListener('input', () => {
			this.dirty = true;
			this.interrupt();
		});
		this.resolves = [];
		this.rejects = [];
	}

	interrupt() {
		if (this.downloading) {
			this.interrupted = true;
		}
		if (this.progressElement) {
			this.progressElement.textContent = '';
		}
	}

	url() {
		return Sunniesnow.Utils.url(this.element.dataset.basePath, super.get(), this.element.dataset.suffix);
	}

	get() {
		if (!this.dirty && this.cache) {
			return this.cache;
		}
		throw new Error('Synchronous get() is not supported');
	}

	save() {
		return super.get();
	}

	async getAsync(onProgress) {
		if (this.element.disabled) {
			return null;
		}
		if (!this.dirty && this.cache) {
			return this.cache;
		}
		if (this.downloading) {
			return new Promise((resolve, reject) => {
				this.resolves.push(resolve);
				this.rejects.push(reject);
			});
		}
		this.downloading = true;
		if (this.progressElement) {
			this.progressElement.textContent = '0% (0 / ?)';
		}
		const url = this.url();
		const response = await Sunniesnow.Utils.strictFetch(url);
		const contentLength = Number(response.headers.get('Content-Length'));
		if (this.progressElement) {
			this.progressElement.textContent = `0% (0 / ${contentLength})`;
		}
		onProgress?.(0, contentLength, url);
		const reader = response.body.getReader();
		const chunks = [];
		let receivedLength = 0;
		while (true) {
			if (this.interrupted) {
				this.interrupted = false;
				this.downloading = false;
				this.clearDownloadingProgress();
				const error = new Error('Interrupted');
				while (this.rejects.length > 0) {
					this.rejects.shift()(error);
				}
				this.resolves.length = 0;
				throw error;
			}
			const {done, value} = await reader.read();
			if (done) {
				break;
			}
			chunks.push(value);
			receivedLength += value.length;
			if (this.progressElement) {
				this.progressElement.textContent = `${Sunniesnow.Utils.toPercentage(receivedLength / contentLength)} (${receivedLength} / ${contentLength})`;
			}
			onProgress?.(receivedLength, contentLength, url);
		}
		this.downloading = false;
		this.cache = new Blob(chunks, {type: response.headers.get('Content-Type')});
		while (this.resolves.length > 0) {
			this.resolves.shift()(this.cache);
		}
		this.rejects.length = 0;
		this.dirty = false;
		return this.cache;
	}

	clearDownloadingProgress() {
		if (this.progressElement) {
			this.progressElement.textContent = '';
		}
	}
};
