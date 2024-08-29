Sunniesnow.CoverDifficulty = class CoverDifficulty extends PIXI.Container {

	populate() {
		this.radius = Sunniesnow.Config.HEIGHT / 4;
		this.x = Sunniesnow.Config.WIDTH / 2;
		this.y = Sunniesnow.Config.HEIGHT;
		this.populateBackground();
		this.populateDifficulty();
		this.populateDifficultyName();
	}

	populateBackground() {
		this.background = new PIXI.Graphics();
		this.background.beginFill(Sunniesnow.game.chart.difficultyColor);
		this.background.drawRegularPolygon(0, 0, this.radius, 4);
		this.background.endFill();
		this.addChild(this.background);
	}

	populateDifficulty() {
		this.difficulty = new PIXI.Text(Sunniesnow.game.chart.difficulty, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.radius / 3,
			fill: '#fbfbff'
		});
		this.difficultySup = new PIXI.Text(Sunniesnow.game.chart.difficultySup, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.radius / 6,
			fill: '#fbfbff'
		});
		this.difficultySup.x = this.difficulty.getBounds().width;
		this.difficultyContainer = new PIXI.Container();
		this.difficultyContainer.addChild(this.difficulty);
		this.difficultyContainer.addChild(this.difficultySup);
		this.difficultyContainer.y = -this.radius * 3/4;
		this.difficultyContainer.x = -this.difficultyContainer.getBounds().width / 2;
		this.addChild(this.difficultyContainer);
	}

	populateDifficultyName() {
		this.difficultyName = new PIXI.Text(Sunniesnow.game.chart.difficultyName, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.radius / 6,
			fill: '#fbfbff',
			align: 'center'
		});
		this.difficultyName.anchor = new PIXI.ObservablePoint(null, null, 0.5, 1);
		this.difficultyName.y = -this.radius / 8;
		this.addChild(this.difficultyName);
	}

};
