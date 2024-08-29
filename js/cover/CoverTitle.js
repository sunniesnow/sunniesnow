Sunniesnow.CoverTitle = class CoverTitle extends PIXI.Container {

	/* // Welp, I don't like this design.
	populate() {
		this.radius = Math.min(Sunniesnow.Config.WIDTH / 4, Sunniesnow.Config.HEIGHT / 2) * 0.8;
		this.x = Sunniesnow.Config.WIDTH * 3 / 4;
		this.y = Sunniesnow.Config.HEIGHT / 2;
		this.populateBackground();
		this.populateLines();
		this.populateTitleText();
		this.populateArtistText();
	}

	populateBackground() {
		this.background = new PIXI.Graphics();
		this.background.beginFill(0xfbfbff);
		this.background.drawRegularPolygon(0, 0, this.radius, 4);
		this.background.endFill();
		this.addChild(this.background);
	}

	populateLines() {
		this.lines = new PIXI.Graphics();
		this.lines.lineStyle(this.radius/100, 0xaaaaaa);
		this.lines.drawRegularPolygon(0, 0, this.radius * 0.95, 4);
		this.lines.drawRegularPolygon(0, 0, this.radius * 0.85, 4);
		for (let i = 0; i < 4; i++) {
			const angle = Math.PI / 2 * i;
			let [[x1, y1], [x2, y2], [x3, y3]] = [[0, 1], [-1, 0], [0, -1]].map(([x, y]) => {
				x = this.radius*0.85 + x*this.radius*0.1;
				y = y*this.radius*0.1;
				return [x*Math.cos(angle) - y*Math.sin(angle), x*Math.sin(angle) + y*Math.cos(angle)];
			});
			this.lines.moveTo(x1, y1);
			this.lines.lineTo(x2, y2);
			this.lines.lineTo(x3, y3);
		}
		this.lines.finishPoly();
		this.addChild(this.lines);
	}

	populateTitleText() {
		this.titleText = new PIXI.Text(Sunniesnow.game.chart.title, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.radius / 8,
			fill: '#43586e',
			align: 'center'
		});
		this.titleText.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0);
		this.titleText.y = -this.radius / 4;
		this.titleText.scale.set(Math.min(this.radius*3/2 / this.titleText.width, 1));
		this.addChild(this.titleText);
	}

	populateArtistText() {
		this.artistText = new PIXI.Text(Sunniesnow.game.chart.artist, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.radius / 12,
			fill: '#43586e',
			align: 'center'
		});
		this.artistText.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0);
		this.artistText.scale.set(Math.min(this.radius / this.artistText.width, 1));
		this.addChild(this.artistText);
	}*/

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
		this.background.beginFill(0x000000, 0.3);
		this.background.drawRect(-Sunniesnow.Config.WIDTH/4, -this.bgHeight/2, Sunniesnow.Config.WIDTH*3/4, this.bgHeight);
		this.background.endFill();
		this.addChild(this.background);
	}

	populateTitleText() {
		this.titleText = new PIXI.Text(Sunniesnow.game.chart.title, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.bgHeight / 4,
			fill: '#fbfbfb',
			align: 'left'
		});
		this.titleText.scale.set(Math.min(Sunniesnow.Config.WIDTH / 2 / this.titleText.width, 1));
		this.titleText.anchor = new PIXI.ObservablePoint(null, null, 0, 1);
		this.addChild(this.titleText);
	}

	populateArtistText() {
		this.artistText = new PIXI.Text(Sunniesnow.game.chart.artist, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.bgHeight / 6,
			fill: '#a5c8e9',
			align: 'left'
		});
		this.artistText.scale.set(Math.min(Sunniesnow.Config.WIDTH / 2 / this.artistText.width, 1));
		this.artistText.anchor = new PIXI.ObservablePoint(null, null, 0, 0.5);
		this.artistText.y = this.bgHeight / 4;
		this.addChild(this.artistText);
	}

};
