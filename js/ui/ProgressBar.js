Sunniesnow.ProgressBar = class ProgressBar extends Sunniesnow.UiComponent {

	populate() {
		super.populate();
		this.barHeight = Sunniesnow.game.settings.width / 200;
		this.y = Sunniesnow.game.settings.height - this.barHeight;
		this.populateBackground();
		this.populateBar();
	}

	populateBackground() {
		this.background = new PIXI.Graphics();
		this.background.beginFill(0xffffff, 0.5);
		this.background.drawRect(0, 0, Sunniesnow.game.settings.width, this.barHeight);
		this.background.endFill();
		this.addChild(this.background);
	}

	populateBar() {
		this.bar = new PIXI.Graphics();
		this.bar.beginFill(0xc3efec);
		this.bar.drawRect(0, 0, Sunniesnow.game.settings.width, this.barHeight);
		this.bar.endFill();
		this.bar.x = -Sunniesnow.game.settings.width;
		this.addChild(this.bar);
	}

	update(delta, data) {
		super.update(delta);
		this.bar.x = Sunniesnow.game.settings.width * Math.min(0, data - 1);
	}
};
