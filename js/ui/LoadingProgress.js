Sunniesnow.LoadingProgress = class LoadingProgress extends PIXI.Container {
	constructor() {
		super();
		this.assetProgressBars = new Map();
		this.populate();
	}

	populate() {
		this.populateText();
		this.populateProgressBar();
	}

	populateText() {
		this.text = new PIXI.Text('', {
			fontSize: Sunniesnow.Config.HEIGHT / 20,
			fill: 'white',
			align: 'center'
		});
		this.text.anchor.set(0.5);
		this.text.x = Sunniesnow.Config.WIDTH / 2;
		this.text.y = Sunniesnow.Config.HEIGHT / 4;
		this.addChild(this.text);
	}

	populateProgressBar() {
		this.progressBar = new PIXI.Graphics();
		this.progressBar.x = Sunniesnow.Config.WIDTH / 8;
		this.progressBar.y = Sunniesnow.Config.HEIGHT / 2;
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
		this.progressBar.beginFill(0xffffff);
		const [_, numerator, denominator] = Sunniesnow.Loader.loadingText.match(/(\d+)\/(\d+)/) ?? [0, 1, 1];
		const progress = Number(numerator) / Number(denominator);
		const width = Sunniesnow.Config.WIDTH*3/4;
		const height = Sunniesnow.Config.HEIGHT / 10;
		const thickness = Sunniesnow.Config.HEIGHT / 100;
		this.progressBar.drawRect(0, 0, width, height);
		this.progressBar.beginFill(0x000000);
		const barWidth = (width - 2*thickness) * progress
		this.progressBar.drawRect(
			barWidth + thickness,
			thickness,
			width - 2*thickness - barWidth,
			height - 2*thickness
		);
	}

	populateAssetProgressBar(name) {
		const bar = new PIXI.Graphics();
		bar.x = Sunniesnow.Config.WIDTH / 2;
		const text = new PIXI.Text(name, {
			fontSize: Sunniesnow.Config.HEIGHT / 30,
			fill: 'white',
			align: 'center'
		});
		text.anchor.x = 0.5;
		text.anchor.y = 1;
		bar.addChild(text);
		this.addChild(bar);
		this.assetProgressBars.set(name, bar);
	}

	destroyAssetProgressBar(name) {
		const bar = this.assetProgressBars.get(name);
		this.removeChild(bar);
		bar.destroy(true, {children: true});
		this.assetProgressBars.delete(name);
	}

	updateAssetProgressBars() {
		for (const name of Sunniesnow.Assets.progresses.keys()) {
			if (!this.assetProgressBars.has(name)) {
				this.populateAssetProgressBar(name);
			}
		}
		const keysToRemove = [];
		for (const name of this.assetProgressBars.keys()) {
			if (!Sunniesnow.Assets.progresses.has(name)) {
				keysToRemove.push(name);
			}
		}
		for (const name of keysToRemove) {
			this.destroyAssetProgressBar(name);
		}
		this.assetProgressBars.keys().forEach((name, index) => this.updateAssetProgressBar(name, index));
	}

	updateAssetProgressBar(name, index) {
		const bar = this.assetProgressBars.get(name);
		bar.y = Sunniesnow.Config.HEIGHT * 2/3 + index * Sunniesnow.Config.HEIGHT/10;
		const progress = Sunniesnow.Assets.progresses.get(name);
		const width = Sunniesnow.Config.WIDTH / 2;
		const height = Sunniesnow.Config.HEIGHT / 20;
		const thickness = Sunniesnow.Config.HEIGHT / 100;
		bar.clear();
		bar.beginFill(0xffffff);
		bar.drawRect(-width/2, 0, width, height);
		bar.beginFill(0x000000);
		const barWidth = (width - 2 * thickness) * progress;
		bar.drawRect(
			-width/2 + thickness + barWidth,
			thickness,
			width - 2 * thickness - barWidth,
			height - 2 * thickness
		);
	}
};
