Sunniesnow.CoverTitle = class CoverTitle extends PIXI.Container {

	populate() {
		this.bgHeight = Sunniesnow.Config.HEIGHT * 0.3;
		this.x = Sunniesnow.Config.WIDTH / 2;
		this.y = Sunniesnow.Config.HEIGHT / 2;
		this.populateBackground();
		this.populateTitleText();
		this.populateArtistText();
	}

	populateBackground() {
		this.background = new PIXI.Graphics();
		this.background.rect(-Sunniesnow.Config.WIDTH/4, -this.bgHeight/2, Sunniesnow.Config.WIDTH*3/4, this.bgHeight);
		this.background.fill({color: 0x000000, alpha: 0.3});
		this.addChild(this.background);
	}

	populateTitleText() {
		this.titleText = new PIXI.Text({text: Sunniesnow.game.chart.title, style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.bgHeight / 4,
			fill: '#fbfbfb',
			align: 'left'
		}});
		this.titleText.scale.set(Math.min(Sunniesnow.Config.WIDTH / 2 / this.titleText.width, 1));
		this.titleText.anchor.set(0, 1);
		this.addChild(this.titleText);
	}

	populateArtistText() {
		this.artistText = new PIXI.Text({text: Sunniesnow.game.chart.artist, style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.bgHeight / 6,
			fill: '#a5c8e9',
			align: 'left'
		}});
		this.artistText.scale.set(Math.min(Sunniesnow.Config.WIDTH / 2 / this.artistText.width, 1));
		this.artistText.anchor.set(0, 0.5);
		this.artistText.y = this.bgHeight / 4;
		this.addChild(this.artistText);
	}

};
