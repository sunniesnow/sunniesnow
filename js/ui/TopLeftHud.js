Sunniesnow.TopLeftHud = class TopLeftHud extends Sunniesnow.UiComponent {
	populate() {
		super.populate();
		this.populateBackground();
		this.populateText();
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
		this.background = new PIXI.Graphics();
		this.background.beginFill('black', 0.5);
		this.background.drawPolygon(path2);
		this.background.endFill();
		this.background.lineStyle(unit / 6, 'white', 1, 0);
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
			fontFamily: 'Arial'
		});
		this.text.x = Sunniesnow.game.settings.width / 15;
		this.text.y = Sunniesnow.game.settings.width / 45;
		this.addChild(this.text);
	}

	update(delta, data) {
		super.update(delta);
		this.text.text = data;
	}
};
