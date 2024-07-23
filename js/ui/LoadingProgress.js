Sunniesnow.LoadingProgress = class LoadingProgress extends PIXI.Container {
	constructor() {
		super();
		this.populate();
	}

	populate() {
		this.populateText();
		this.populateProgressBar();
	}

	populateText() {
		this.text = new PIXI.Text('', {
			fontSize: Sunniesnow.game.settings.height / 20,
			fill: 'white',
			align: 'center'
		});
		this.text.anchor.set(0.5);
		this.text.x = Sunniesnow.game.settings.width / 2;
		this.text.y = Sunniesnow.game.settings.height / 4;
		this.addChild(this.text);
	}

	populateProgressBar() {
		this.progressBar = new PIXI.Graphics();
		this.progressBar.x = Sunniesnow.game.settings.width / 8;
		this.progressBar.y = Sunniesnow.game.settings.height / 2;
		this.addChild(this.progressBar);
	}

	update() {
		this.updateText();
		this.updateProgressBar();
	}

	updateText() {
		this.text.text = Sunniesnow.Loader.loadingText ?? '';
	}

	updateProgressBar() {
		this.progressBar.clear();
		this.progressBar.beginFill(0xffffff);
		const [_, numerator, denominator] = Sunniesnow.Loader.loadingText.match(/(\d+)\/(\d+)/) ?? [0, 1, 1];
		const progress = Number(numerator) / Number(denominator);
		const width = Sunniesnow.game.settings.width*3/4;
		const height = Sunniesnow.game.settings.height / 10;
		const thickness = Sunniesnow.game.settings.height / 100;
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
};
