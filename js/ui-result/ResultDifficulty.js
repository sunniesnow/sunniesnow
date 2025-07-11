Sunniesnow.ResultDifficulty = class ResultDifficulty extends PIXI.Container {

	static async load() {
		this.backgroundGeometry = this.createBackgroundGeometry();
	}

	static createBackgroundGeometry() {
		this.difficultyNameWidth = Sunniesnow.ResultTitle.width / 2;
		this.difficultyWidth = Sunniesnow.ResultTitle.width / 3;
		const graphics = new PIXI.GraphicsContext();
		graphics.arc(0, 0, Sunniesnow.ResultTitle.height /2, Math.PI/2, -Math.PI/2);
		graphics.lineTo(Sunniesnow.ResultTitle.width - this.difficultyWidth, -Sunniesnow.ResultTitle.height /2);
		graphics.lineTo(Sunniesnow.ResultTitle.width - this.difficultyNameWidth, Sunniesnow.ResultTitle.height /2);
		graphics.closePath();
		graphics.fill(Sunniesnow.Result.mainColor);
		graphics.arc(Sunniesnow.ResultTitle.width, 0, Sunniesnow.ResultTitle.height /2, -Math.PI/2, Math.PI/2);
		graphics.lineTo(Sunniesnow.ResultTitle.width - this.difficultyNameWidth, Sunniesnow.ResultTitle.height /2);
		graphics.lineTo(Sunniesnow.ResultTitle.width - this.difficultyWidth, -Sunniesnow.ResultTitle.height /2);
		// remove this workaround line after it is fixed: https://github.com/pixijs/pixijs/issues/11526
		graphics.lineTo(Sunniesnow.ResultTitle.width, -Sunniesnow.ResultTitle.height /2);
		graphics.closePath();
		graphics.fill(Sunniesnow.game.chart.difficultyColor);
		return graphics;
	}

	constructor() {
		super();
		this.populate();
	}

	populate() {
		this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.difficultyNameText = new PIXI.Text({text: Sunniesnow.game.chart.difficultyName, style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: Sunniesnow.ResultTitle.height / 2,
			fill: '#43586e',
			align: 'left'
		}});
		this.difficultyNameText.anchor.set(0, 0.5);
		if (this.difficultyNameText.width > this.constructor.difficultyNameWidth) {
			this.difficultyNameText.scale.set(this.constructor.difficultyNameWidth / this.difficultyNameText.width);
		}
		this.difficultyText = new PIXI.Text({text: Sunniesnow.game.chart.difficulty, style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: Sunniesnow.ResultTitle.height / 2,
			fill: '#fbfbff',
			align: 'right'
		}});
		if (this.difficultyText.width > this.constructor.difficultyWidth) {
			this.difficultyText.scale.set(this.constructor.difficultyWidth / this.difficultyText.width);
		}
		this.difficultyText.anchor.set(1, 0.5);
		this.difficultySupText = new PIXI.Text({text: Sunniesnow.game.chart.difficultySup, style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: Sunniesnow.ResultTitle.height / 4,
			fill: '#fbfbff'
		}});
		this.difficultySupText.anchor.set(1, 1);
		this.difficultySupText.x = Sunniesnow.ResultTitle.width;
		this.difficultyText.x = this.difficultySupText.getBounds().x;
		this.addChild(this.background);
		this.addChild(this.difficultyNameText);
		this.addChild(this.difficultyText);
		this.addChild(this.difficultySupText);
	}

};
