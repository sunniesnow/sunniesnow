Sunniesnow.Fetcher = {

	interrupted: false,
	fetching: false,

	async blob(url, elementId, options) {
		this.fetching = true;
		let element;
		let needsUpdateProgress = false;
		if (Sunniesnow.Utils.isBrowser() && elementId) {
			element = document.getElementById(elementId);
			needsUpdateProgress = true;
			element.textContent = '0% (0 / ?)';
		}
		let response;
		try {
			response = await Sunniesnow.Utils.strictFetch(url, options);
		} catch (e) {
			this.fetching = false;
			throw e;
		}
		const contentLength = Number(response.headers.get('Content-Length'));
		const reader = response.body.getReader();
		const chunks = [];
		let receivedLength = 0;
		while (true) {
			if (this.interrupted) {
				this.interrupted = false;
				this.fetching = false;
				throw new Error('Interrupted');
			}
			const {done, value} = await reader.read();
			if (done) {
				break;
			}
			chunks.push(value);
			receivedLength += value.length;
			if (needsUpdateProgress) {
				element.textContent = `${Sunniesnow.Utils.toPercentage(receivedLength / contentLength)} (${receivedLength} / ${contentLength})`;
			}
		}
		const blob = new Blob(chunks, {type: response.headers.get('Content-Type')});
		this.fetching = false;
		return blob;
	},

	interrupt() {
		if (this.fetching) {
			this.interrupted = true;
		}
	}
};
