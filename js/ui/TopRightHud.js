Sunniesnow.TopRightHud = class TopRightHud extends Sunniesnow.UiComponent {
	populate() {
		this.populateBackground();
		this.populateText();
		this.populateDifficultyName();
	}

	populateBackground() {
		const unit = Sunniesnow.game.settings.width / 60;
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
		Sunniesnow.Utils.mirrorPath(path1);
		Sunniesnow.Utils.mirrorPath(path2);
		this.background = new PIXI.Graphics();
		this.background.beginFill('black', 0.5);
		this.background.drawPolygon(path2);
		this.background.endFill();
		this.background.lineStyle(unit / 6, 'white', 1, 1);
		for (let i = 0; i < path1.length; i += 2) {
			if (i === 0) {
				this.background.moveTo(path1[i], path1[i + 1]);
			} else {
				this.background.lineTo(path1[i], path1[i + 1]);
			}
		}
		this.addChild(this.background);
	}

	populateText() {
		this.text = new PIXI.Text('', {
			fontSize: Sunniesnow.game.settings.width / 45,
			fill: 'white',
			fontFamily: 'Arial',
			align: 'right'
		});
		this.text.x = Sunniesnow.game.settings.width * (1 - 1 / 30);
		this.text.y = Sunniesnow.game.settings.width / 45;
		this.text.anchor = new PIXI.ObservablePoint(null, null, 1, 0);
		this.addChild(this.text);
	}

	populateDifficultyName() {
		this.difficultyName = new PIXI.Text(Sunniesnow.game.chart.difficultyName, {
			fontSize: Sunniesnow.game.settings.width / 45,
			fill: Sunniesnow.game.chart.difficultyColor,
			fontFamily: 'Arial',
		});
		this.difficultyName.x = Sunniesnow.game.settings.width - Sunniesnow.game.settings.width / 4;
		this.difficultyName.y = Sunniesnow.game.settings.width / 45;
		this.addChild(this.difficultyName);
	}

	update(delta, data) {
		this.text.text = data;
	}
};
