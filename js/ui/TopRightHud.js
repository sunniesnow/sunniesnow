Sunniesnow.TopRightHud = class TopRightHud extends Sunniesnow.UiComponent {

	static async load() {
		this.backgroundGeometry = this.createBackgroundGeometry();
	}

	static createBackgroundGeometry() {
		const unit = Sunniesnow.Config.WIDTH / 60;
		const path1 = [
			20 * unit, 2 * unit,
			19 * unit, 3 * unit,
			18 * unit, 2 * unit,
			20 * unit, 0,
			22 * unit, 2 * unit,
			20 * unit, 4 * unit,
			0, 4 * unit,
			0, 0,
			20 * unit, 0
		]
		const path2 = [
			0, 0,
			20 * unit, 0,
			22 * unit, 2 * unit,
			20 * unit, 4 * unit,
			0, 4 * unit
		]
		Sunniesnow.Utils.mirrorAndReversePath(path1);
		Sunniesnow.Utils.mirrorAndReversePath(path2);
		const graphics = new PIXI.Graphics();
		graphics.beginFill('black', 0.5);
		graphics.drawPolygon(path2);
		graphics.endFill();
		graphics.lineStyle(unit / 6, 'white', 1, 0);
		for (let i = 0; i < path1.length; i += 2) {
			if (i === 0) {
				graphics.moveTo(path1[i], path1[i + 1]);
			} else {
				graphics.lineTo(path1[i], path1[i + 1]);
			}
		}
		graphics.finishPoly();
		return graphics.geometry;
	}

	populate() {
		this.populateBackground();
		this.populateText();
		this.populateDifficultyName();
	}

	populateBackground() {
		this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.addChild(this.background);
	}

	populateText() {
		this.text = new PIXI.Text('', {
			fontSize: Sunniesnow.Config.WIDTH / 45,
			fill: 'white',
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			align: 'right'
		});
		this.text.x = Sunniesnow.Config.WIDTH * (1 - 1 / 30);
		this.text.y = Sunniesnow.Config.WIDTH / 45;
		this.text.anchor = new PIXI.ObservablePoint(null, null, 1, 0);
		this.addChild(this.text);
	}

	populateDifficultyName() {
		this.difficultyName = new PIXI.Text(Sunniesnow.game.chart.difficultyName, {
			fontSize: Sunniesnow.Config.WIDTH / 45,
			fill: Sunniesnow.game.chart.difficultyColor,
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
		});
		this.difficultyName.x = Sunniesnow.Config.WIDTH - Sunniesnow.Config.WIDTH / 4;
		this.difficultyName.y = Sunniesnow.Config.WIDTH / 45;
		this.addChild(this.difficultyName);
	}

	update(delta, data) {
		this.text.text = data;
	}
};
