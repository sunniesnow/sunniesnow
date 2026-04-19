Sunniesnow.Assets = {
	progresses: new Map(),

	async loadTexture(url) {
		let parser;
		// Reason for using Sunniesnow.ObjectUrl: https://github.com/pixijs/pixijs/issues/9568
		if (Sunniesnow.ObjectUrl.types[url] === 'image/svg+xml' || PIXI.loadSvg.test(url)) {
			parser = 'svg';
		} else {
			parser = Sunniesnow.Utils.isBrowser() ? 'texture' : 'node-texture';
		}
		const result = await this.loadPixiAssets(url, {parser});
		if (!(result instanceof PIXI.Texture)) {
			throw new Error('Failed to load texture');
		}
		return result;
	},

	async loadFont(url, family) {
		if (Sunniesnow.Utils.isFontAvailable(family)) {
			return;
		}
		if (Sunniesnow.game.settings.avoidDownloadingFonts) {
			Sunniesnow.Logs.warn(`Skipped downloading font ${family}`);
			return;
		}
		if (Sunniesnow.Utils.isBrowser()) {
			const result = await this.loadPixiAssets(url, {parser: 'web-font', data: {family}});
			if (!(result instanceof FontFace)) {
				throw new Error('Failed to load font');
			}
			return result;
		} else {
			return await this.loadPixiAssets(
				url,
				{
					parser: 'node-font',
					// data: {family}, // https://github.com/Automattic/node-canvas/issues/2369
					downloadToFs: true // https://github.com/pixijs-userland/node/issues/5
				}
			);
		}
	},

	async audioDecode(arrayBuffer, context) {
		if (Sunniesnow.Utils.isBrowser() && !window.WebAssembly) {
			Sunniesnow.Logs.warn('WebAssembly is disabled; using browser native audio decoder');
			return await context.decodeAudioData(arrayBuffer);
		}
		const {channelData, sampleRate} = await audioDecode(arrayBuffer);
		const result = context.createBuffer(channelData.length, channelData[0].length, sampleRate);
		for (let i = 0; i < channelData.length; i++) {
			result.copyToChannel(channelData[i], i);
		}
		return result;
	},

	async loadPixiAssets(url, options = {}) {
		const downloadToFs = (options.downloadToFs ?? false) && !Sunniesnow.Utils.isBrowser();
		delete options.downloadToFs;
		const isObjectUrl = url.startsWith('blob:') || url.startsWith('data:');
		let blob, src, fs;
		let condition = !isObjectUrl;
		let redownloadToFs = false;
		if (downloadToFs) {
			const path = require('path');
			fs = require('fs');
			src = path.join(Sunniesnow.record.tempDir, path.basename(url));
			redownloadToFs = !fs.existsSync(src) || Sunniesnow.record.clean;
			condition &&= redownloadToFs;
		}
		if (condition) {
			Sunniesnow.Loader.downloadingProgresses.set(url, 0);
			const response = await Sunniesnow.Utils.strictFetch(url);
			const contentLength = Number(response.headers.get('Content-Length'));
			const reader = response.body.getReader();
			const chunks = [];
			let receivedLength = 0;
			while (true) {
				const {done, value} = await reader.read();
				if (done) {
					break;
				}
				chunks.push(value);
				receivedLength += value.length;
				Sunniesnow.Loader.downloadingProgresses.set(url, receivedLength / contentLength);
			}
			blob = new Blob(chunks, {type: response.headers.get('Content-Type')});
		}
		if (redownloadToFs) {
			const arrayBuffer = isObjectUrl ? await fetch(url).then(res => res.arrayBuffer()) : await blob.arrayBuffer();
			fs.writeFileSync(src, Buffer.from(arrayBuffer));
		}
		if (!downloadToFs) {
			src = isObjectUrl ? url : Sunniesnow.ObjectUrl.create(blob);
		}
		const result = await PIXI.Assets.load({src, ...options});
		if (condition) {
			Sunniesnow.Loader.downloadingProgresses.delete(url);
		}
		return result;
	}

};
