// string -> blob
// This hook cannot be applied to radio settings.
Sunniesnow.HookOnline = class HookOnline extends Sunniesnow.Hook {
	initialize(basePath = '', suffix = '') {
		let element = this.setting.element;
		while (element.nextSibling.tagName === 'LABEL' && element.nextSibling.for === this.setting.element) {
			element = element.nextSibling;
		}
		this.progressElement = document.createElement('span');
		this.progressElement.classList.add('downloading-progress');
		element.after(this.progressElement);
		this.basePath = basePath;
		this.suffix = suffix;
	}

	// TODO: interrupt by token
	interrupt(token) {
		if (this.downloading) {
			this.interrupted = true;
		}
		this.clearDownloadingProgress();
	}

	clearDownloadingProgress() {
		if (this.progressElement) {
			this.progressElement.textContent = '';
		}
	}

	async apply(value) {
		if (this.setting.element.disabled) {
			return null;
		}
		this.downloading = true;
		if (this.progressElement) {
			this.progressElement.textContent = '0% (0 / ?)';
		}
		const url = Sunniesnow.Utils.url(this.basePath, value, this.suffix);
		Sunniesnow.Loader.downloadingProgresses?.set(url, 0);
		const response = await Sunniesnow.Utils.strictFetch(url);
		const contentLength = Number(response.headers.get('Content-Length'));
		if (this.progressElement) {
			this.progressElement.textContent = `0% (0 / ${contentLength})`;
		}
		const reader = response.body.getReader();
		const chunks = [];
		let receivedLength = 0;
		while (true) {
			if (this.interrupted) {
				this.interrupted = false;
				this.downloading = false;
				this.clearDownloadingProgress();
				return;
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
			Sunniesnow.Loader.downloadingProgresses?.set(url, receivedLength / contentLength);
		}
		Sunniesnow.Loader.downloadingProgresses?.delete(url);
		this.downloading = false;
		return new Blob(chunks, {type: response.headers.get('Content-Type')});
	}
};
