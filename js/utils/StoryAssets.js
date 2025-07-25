Sunniesnow.StoryAssets = {
	assets: {},
	async loadTexture(filename) {
		if (Object.hasOwn(this.assets, filename)) {
			return !!this.assets[filename];
		}
		const zipFiles = Sunniesnow.game.loaded.chart.zip.files;
		const zipEntry = `story/${filename}`;
		if (!Object.hasOwn(zipFiles, zipEntry)) {
			Sunniesnow.Logs.warn(`Image \`${filename}\` not found in the level file`);
			this.assets[filename] = null;
			return false;
		}
		const type = mime.getType(filename);
		if (!type?.startsWith('image')) {
			Sunniesnow.Logs.warn(`Cannot infer a image file type from the filename \`${filename}\``);
			this.assets[filename] = null;
			return false;
		}
		const url = Sunniesnow.ObjectUrl.create(new Blob([await zipFiles[zipEntry].async('blob')], {type}));
		try {
			this.assets[filename] = await Sunniesnow.Assets.loadTexture(url);
			return true;
		} catch (error) {
			Sunniesnow.Logs.warn(`Failed to load image \`${filename}\`: ${error.message}`, error);
			this.assets[filename] = null;
			return false;
		}
	},

	texture(filename) {
		const asset = this.assets[filename];
		return asset instanceof PIXI.Texture ? asset : null;
	}
};
