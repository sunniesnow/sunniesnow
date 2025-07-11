Sunniesnow.ResultStatsAndCombo = class ResultStatsAndCombo extends PIXI.Container {

	static async load() {
		this.statsBackgroundGeometry = this.createStatsGeometry();
		this.comboBackgroundGeometry = this.createComboGeometry();
	}

	static createStatsGeometry() {
		this.statsRadius = Sunniesnow.Config.WIDTH / 18.5;
		this.statsSeperation = this.statsRadius / 4;
		const graphics = new PIXI.GraphicsContext();
		graphics.regularPoly(0, 0, this.statsRadius, 4, 0);
		graphics.fill(Sunniesnow.Result.mainColor);
		graphics.stroke({width: this.statsRadius / 15, color: Sunniesnow.Result.mainColor, alignment: 0});
		graphics.regularPoly(0, 0, this.statsRadius, 4, 0);
		graphics.stroke({width: this.statsRadius / 100, color: Sunniesnow.Result.mainContourColor, alignment: 1});
		return graphics;
	}

	static createComboGeometry() {
		this.comboRadius = Sunniesnow.Config.WIDTH / 14;
		const graphics = new PIXI.GraphicsContext();
		graphics.regularPoly(0, 0, this.comboRadius, 4, 0);
		graphics.fill(Sunniesnow.Result.mainColor);
		graphics.stroke({width: this.comboRadius / 15, color: Sunniesnow.Result.mainColor, alignment: 0});
		graphics.regularPoly(0, 0, this.comboRadius, 4, 0);
		graphics.stroke({width: this.comboRadius / 100, color: Sunniesnow.Result.mainContourColor, alignment: 1});
		return graphics;
	}

	constructor() {
		super();
		this.populate();
	}

	populate() {
		this.statsBackgrounds = {};
		this.statsTexts = {};
		this.stats = {};
		this.populateStats('perfect');
		this.populateStats('good');
		this.populateStats('bad');
		this.populateStats('miss');
		this.populateCombo();
		const r1 = this.constructor.statsRadius;
		const r2 = this.constructor.comboRadius;
		const d = this.constructor.statsSeperation;
		this.stats.good.x = r1 + d;
		this.stats.good.y = r1 + d;
		this.stats.bad.x = this.stats.good.x + r1 + d;
		this.stats.miss.x = this.stats.bad.x + r1 + d;
		this.stats.miss.y = r1 + d;
		this.combo.x = this.stats.miss.x + r1 + d;
		this.combo.y = this.stats.miss.y - r2 - d;
		this.addChild(this.stats.perfect);
		this.addChild(this.stats.good);
		this.addChild(this.stats.bad);
		this.addChild(this.stats.miss);
		this.addChild(this.combo);
	}

	populateStats(judgement) {
		this.statsBackgrounds[judgement] = new PIXI.Graphics(this.constructor.statsBackgroundGeometry);
		this.statsTexts[judgement] = new PIXI.Text({
			text: Sunniesnow.Utils.judgementText(judgement) + '\n' + Sunniesnow.game.level[judgement],
			style: {
				fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
				fontSize: this.constructor.statsRadius / 3,
				fill: '#43586e',
				align: 'center'
			}
		});
		this.statsTexts[judgement].anchor.set(0.5, 0.5);
		this.stats[judgement] = new PIXI.Container();
		this.stats[judgement].addChild(this.statsBackgrounds[judgement]);
		this.stats[judgement].addChild(this.statsTexts[judgement]);
		this.addChild(this.stats[judgement]);
	}

	populateCombo() {
		this.comboBackground = new PIXI.Graphics(this.constructor.comboBackgroundGeometry);
		this.comboText = new PIXI.Text({text: 'Combo\n' + Sunniesnow.game.level.maxCombo, style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.constructor.comboRadius / 3,
			fill: '#43586e',
			align: 'center'
		}});
		this.comboText.anchor.set(0.5, 0.5);
		this.combo = new PIXI.Container();
		this.combo.addChild(this.comboBackground);
		this.combo.addChild(this.comboText);
		this.addChild(this.combo);
	}

};
