Sunniesnow.LoadingProgress = class LoadingProgress extends PIXI.Container {
	constructor() {
		super();
		this.assetProgressBars = new Map();
		this.populate();
	}

	populate() {
		this.label = 'loading-progress';
		this.populateText();
		this.populateProgressBar();
	}

	populateText() {
		this.text = new PIXI.Text({text: '', style: {
			fontSize: Sunniesnow.Config.HEIGHT / 20,
			fill: 'white',
			align: 'center'
		}});
		this.text.anchor.set(0.5);
		this.text.x = Sunniesnow.Config.WIDTH / 2;
		this.text.y = Sunniesnow.Config.HEIGHT / 4;
		this.text.label = 'text';
		this.addChild(this.text);
	}

	populateProgressBar() {
		this.progressBar = new PIXI.Graphics();
		this.progressBar.x = Sunniesnow.Config.WIDTH / 8;
		this.progressBar.y = Sunniesnow.Config.HEIGHT / 2;
		this.progressBar.label = 'progress-bar';
		this.addChild(this.progressBar);
	}

	update() {
		this.updateText();
		this.updateProgressBar();
		this.updateAssetProgressBars();
	}

	updateText() {
		this.text.text = Sunniesnow.Loader.loadingText ?? '';
	}

	updateProgressBar() {
		this.progressBar.clear();
		const [_, numerator, denominator] = Sunniesnow.Loader.loadingText.match(/(\d+)\/(\d+)/) ?? [0, 1, 1];
		const progress = Number(numerator) / Number(denominator);
		const width = Sunniesnow.Config.WIDTH*3/4;
		const height = Sunniesnow.Config.HEIGHT / 10;
		const thickness = Sunniesnow.Config.HEIGHT / 100;
		this.progressBar.rect(0, 0, width, height);
		this.progressBar.fill(0xffffff);
		const barWidth = (width - 2*thickness) * progress
		this.progressBar.rect(
			barWidth + thickness,
			thickness,
			width - 2*thickness - barWidth,
			height - 2*thickness
		);
		this.progressBar.fill(0x000000);
	}

	sanitizeUrl(url) {
		if (url.startsWith(Sunniesnow.Config.SERVER_BASE_URL)) {
			url = url.slice(Sunniesnow.Config.SERVER_BASE_URL.length + 1);
		}
		if (Sunniesnow.authentication && url.includes(Sunniesnow.authentication)) {
			url = url.replace(Sunniesnow.authentication, '***');
		}
		return url;
	}

	populateAssetProgressBar(name) {
		const container = new PIXI.Container();
		container.label = `asset-progress-bar-${name}`;
		container.x = Sunniesnow.Config.WIDTH / 2;
		const bar = new PIXI.Graphics();
		bar.label = 'bar';
		const text = new PIXI.Text({text: this.sanitizeUrl(name), style: {
			fontSize: Sunniesnow.Config.HEIGHT / 30,
			fill: 'white',
			align: 'center'
		}});
		text.anchor.x = 0.5;
		text.anchor.y = 1;
		text.label = 'text';
		container.addChild(bar);
		container.addChild(text);
		this.addChild(container);
		this.assetProgressBars.set(name, {container, bar, text});
	}

	destroyAssetProgressBar(name) {
		const {container} = this.assetProgressBars.get(name);
		container.destroy({children: true});
		this.assetProgressBars.delete(name);
	}

	updateAssetProgressBars() {
		for (const name of Sunniesnow.Loader.downloadingProgresses.keys()) {
			if (!this.assetProgressBars.has(name)) {
				this.populateAssetProgressBar(name);
			}
		}
		const keysToRemove = [];
		for (const name of this.assetProgressBars.keys()) {
			if (!Sunniesnow.Loader.downloadingProgresses.has(name)) {
				keysToRemove.push(name);
			}
		}
		for (const name of keysToRemove) {
			this.destroyAssetProgressBar(name);
		}
		this.assetProgressBars.keys().forEach((name, index) => this.updateAssetProgressBar(name, index));
	}

	updateAssetProgressBar(name, index) {
		const {container, bar} = this.assetProgressBars.get(name);
		container.y = Sunniesnow.Config.HEIGHT * 2/3 + index * Sunniesnow.Config.HEIGHT/10;
		const progress = Sunniesnow.Loader.downloadingProgresses.get(name);
		const width = Sunniesnow.Config.WIDTH / 2;
		const height = Sunniesnow.Config.HEIGHT / 20;
		const thickness = Sunniesnow.Config.HEIGHT / 100;
		bar.clear();
		bar.rect(-width/2, 0, width, height);
		bar.fill(0xffffff);
		const barWidth = (width - 2 * thickness) * progress;
		bar.rect(
			-width/2 + thickness + barWidth,
			thickness,
			width - 2 * thickness - barWidth,
			height - 2 * thickness
		);
		bar.fill(0x000000);
	}
};
