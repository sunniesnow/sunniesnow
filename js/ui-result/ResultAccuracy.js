Sunniesnow.ResultAccuracy = class ResultAccuracy extends Sunniesnow.UiComponent {

	static async load() {
		this.backgroundGeometry = this.createAccuracyGeometry();
	}

	static createAccuracyGeometry() {
		const w = this.width = Sunniesnow.Config.WIDTH / 8;
		const h = this.height = Sunniesnow.Config.WIDTH / 25;
		const path = [
			w / 2, h / 2,
			-w / 2, h / 2,
			-w / 2 - h / 2, 0,
			-w / 2, -h / 2,
			w / 2, -h / 2,
			w / 2 + h / 2, 0
		]
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(h / 10, Sunniesnow.Result.mainColor, 1, 1);
		graphics.beginFill(Sunniesnow.Result.mainColor, 1);
		graphics.drawPolygon(path);
		graphics.endFill();
		graphics.lineStyle(h / 40, Sunniesnow.Result.mainContourColor, 1, 0);
		graphics.drawPolygon(path);
		return graphics.geometry;
	}

	populate() {
		this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.text = new PIXI.Text(Sunniesnow.game.level.accuracyText(), {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.constructor.height / 1.5,
			fill: '#43586e',
			align: 'center'
		});
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		this.addChild(this.background);
		this.addChild(this.text);
	}

};
