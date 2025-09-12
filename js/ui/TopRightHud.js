Sunniesnow.TopRightHud = class TopRightHud extends Sunniesnow.UiComponent {

	static EFFECT_EVENT_CLASS = 'EffectTopRightHud';
	static DEFAULT_X = 1;
	static DEFAULT_Y = 0;

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
		const graphics = new PIXI.GraphicsContext();
		graphics.poly(path2);
		graphics.fill({color: 'black', alpha: 0.5});
		graphics.poly(path1, false);
		graphics.stroke({width: unit / 6, color: 'white', alignment: 1});
		return graphics;
	}

	populate() {
		super.populate();
		this.label = 'top-right-hud';
		this.populateBackground();
		this.populateText();
		this.populateDifficultyName();
	}

	populateBackground() {
		this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.background.label = 'background';
		this.addChild(this.background);
	}

	populateText() {
		this.text = new PIXI.Text({text: '', style: {
			fontSize: Sunniesnow.Config.WIDTH / 45,
			fill: 'white',
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			align: 'right'
		}});
		this.text.x = -Sunniesnow.Config.WIDTH / 30;
		this.text.y = Sunniesnow.Config.WIDTH / 30;
		this.text.anchor.set(1, 0.5);
		this.text.label = 'text';
		this.addChild(this.text);
	}

	populateDifficultyName() {
		this.difficultyName = new PIXI.Text({text: Sunniesnow.game.chart.difficultyName, style: {
			fontSize: Sunniesnow.Config.WIDTH / 45,
			fill: Sunniesnow.game.chart.difficultyColor,
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
		}});
		this.difficultyName.x = -Sunniesnow.Config.WIDTH / 4;
		this.difficultyName.y = Sunniesnow.Config.WIDTH / 30;
		this.difficultyName.anchor.set(0, 0.5);
		this.difficultyName.label = 'difficulty-name';
		this.addChild(this.difficultyName);
	}

	privateUpdate(delta, data) {
		super.privateUpdate(delta, data);
		this.text.text = data;
	}
};
