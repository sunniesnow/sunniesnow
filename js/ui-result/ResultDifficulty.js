Sunniesnow.ResultDifficulty = class ResultDifficulty extends Sunniesnow.UiComponent {

	static async load() {
		this.backgroundGeometry = this.createBackgroundGeometry();
	}

	static createBackgroundGeometry() {
		this.difficultyNameWidth = Sunniesnow.ResultTitle.width / 2;
		this.difficultyWidth = Sunniesnow.ResultTitle.width / 3;
		const graphics = new PIXI.Graphics();
		graphics.beginFill(Sunniesnow.Result.mainColor);
		graphics.arc(0, 0, Sunniesnow.ResultTitle.height /2, Math.PI/2, -Math.PI/2);
		graphics.lineTo(Sunniesnow.ResultTitle.width - this.difficultyWidth, -Sunniesnow.ResultTitle.height /2);
		graphics.lineTo(Sunniesnow.ResultTitle.width - this.difficultyNameWidth, Sunniesnow.ResultTitle.height /2);
		graphics.closePath();
		graphics.endFill();
		graphics.beginFill(Sunniesnow.game.chart.difficultyColor);
		graphics.arc(Sunniesnow.ResultTitle.width, 0, Sunniesnow.ResultTitle.height /2, -Math.PI/2, Math.PI/2);
		graphics.lineTo(Sunniesnow.ResultTitle.width - this.difficultyNameWidth, Sunniesnow.ResultTitle.height /2);
		graphics.lineTo(Sunniesnow.ResultTitle.width - this.difficultyWidth, -Sunniesnow.ResultTitle.height /2);
		graphics.closePath();
		graphics.endFill();
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.difficultyNameText = new PIXI.Text(Sunniesnow.game.chart.difficultyName, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: Sunniesnow.ResultTitle.height / 2,
			fill: '#43586e',
			align: 'left'
		});
		this.difficultyNameText.anchor = new PIXI.ObservablePoint(null, null, 0, 0.5);
		if (this.difficultyNameText.width > this.constructor.difficultyNameWidth) {
			this.difficultyNameText.scale.set(this.constructor.difficultyNameWidth / this.difficultyNameText.width);
		}
		this.difficultyText = new PIXI.Text(Sunniesnow.game.chart.difficulty, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: Sunniesnow.ResultTitle.height / 2,
			fill: '#fbfbff',
			align: 'right'
		});
		if (this.difficultyText.width > this.constructor.difficultyWidth) {
			this.difficultyText.scale.set(this.constructor.difficultyWidth / this.difficultyText.width);
		}
		this.difficultyText.anchor = new PIXI.ObservablePoint(null, null, 1, 0.5);
		this.difficultySupText = new PIXI.Text(Sunniesnow.game.chart.difficultySup, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: Sunniesnow.ResultTitle.height / 4,
			fill: '#fbfbff'
		});
		this.difficultySupText.anchor = new PIXI.ObservablePoint(null, null, 1, 1);
		this.difficultySupText.x = Sunniesnow.ResultTitle.width;
		this.difficultyText.x = this.difficultySupText.getBounds().x;
		this.addChild(this.background);
		this.addChild(this.difficultyNameText);
		this.addChild(this.difficultyText);
		this.addChild(this.difficultySupText);
	}

};
