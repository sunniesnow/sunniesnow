Sunniesnow.ResultTitle = class ResultTitle extends Sunniesnow.UiComponent {

	static async load() {
		this.backgroundGeometry = this.createBackgroundGeometry();
	}

	static createBackgroundGeometry() {
		this.width = Sunniesnow.ResultStatsAndCombo.statsRadius * 4 + Sunniesnow.ResultStatsAndCombo.statsSeperation * 3;
		this.height = Sunniesnow.Config.WIDTH / 22.5;
		const graphics = new PIXI.Graphics();
		graphics.beginFill(Sunniesnow.Result.mainColor);
		graphics.arc(0, 0, this.height /2, Math.PI/2, -Math.PI/2);
		graphics.lineTo(this.width, -this.height /2);
		graphics.arc(this.width, 0, this.height /2, -Math.PI/2, Math.PI/2);
		graphics.closePath();
		graphics.endFill();
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.text = new PIXI.Text(Sunniesnow.game.chart.title, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.constructor.height / 2,
			fill: '#43586e',
			align: 'left'
		});
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0, 0.5);
		if (this.text.width > this.constructor.width) {
			this.text.scale.set(this.constructor.width / this.text.width);
		}
		this.addChild(this.background);
		this.addChild(this.text);
	}

};
