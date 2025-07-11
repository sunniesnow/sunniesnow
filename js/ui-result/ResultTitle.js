Sunniesnow.ResultTitle = class ResultTitle extends PIXI.Container {

	static async load() {
		this.backgroundGeometry = this.createBackgroundGeometry();
	}

	static createBackgroundGeometry() {
		this.width = Sunniesnow.ResultStatsAndCombo.statsRadius * 4 + Sunniesnow.ResultStatsAndCombo.statsSeperation * 3;
		this.height = Sunniesnow.Config.WIDTH / 22.5;
		const graphics = new PIXI.GraphicsContext();
		graphics.arc(0, 0, this.height /2, Math.PI/2, -Math.PI/2);
		graphics.lineTo(this.width, -this.height /2);
		graphics.arc(this.width, 0, this.height /2, -Math.PI/2, Math.PI/2);
		graphics.closePath();
		graphics.fill(Sunniesnow.Result.mainColor);
		return graphics;
	}

	constructor() {
		super();
		this.populate();
	}

	populate() {
		this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.text = new PIXI.Text({text: Sunniesnow.game.chart.title, style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.constructor.height / 2,
			fill: '#43586e',
			align: 'left'
		}});
		this.text.anchor.set(0, 0.5);
		if (this.text.width > this.constructor.width) {
			this.text.scale.set(this.constructor.width / this.text.width);
		}
		this.addChild(this.background);
		this.addChild(this.text);
	}

};
