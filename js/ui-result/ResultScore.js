Sunniesnow.ResultScore = class ResultScore extends PIXI.Container {

	static async load() {
		this.backgroundGeometry = this.createBackgroundGeometry();
	}

	static createBackgroundGeometry() {
		const w = this.width = Sunniesnow.Config.WIDTH / 5;
		const h = this.height = Sunniesnow.Config.WIDTH / 17.5;
		const path = [
			w/2, h/2,
			-w/2, h/2,
			-w/2-h/2, 0,
			-w/2, -h/2,
			w/2, -h/2,
			w/2+h/2, 0
		]
		const graphics = new PIXI.GraphicsContext();
		graphics.poly(path);
		graphics.fill(Sunniesnow.Result.mainColor);
		graphics.stroke({width: h/10, color: Sunniesnow.Result.mainColor, alignment: 0});
		graphics.poly(path);
		graphics.stroke({width: h/40, color: Sunniesnow.Result.mainContourColor, alignment: 1});
		return graphics;
	}

	constructor() {
		super();
		this.populate();
	}

	populate() {
		this.label = 'result-score';
		this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.background.label = 'background';
		this.text = new PIXI.Text({text: Sunniesnow.game.level.score(), style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.constructor.height / 1.5,
			fill: '#43586e',
			align: 'center'
		}});
		this.text.label = 'text';
		this.text.anchor.set(0.5, 0.5);
		this.addChild(this.background);
		this.addChild(this.text);
	}

};
