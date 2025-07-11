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
		this.background.regularPoly(0, 0, this.radius, 4);
		this.background.fill(Sunniesnow.game.chart.difficultyColor);
		this.addChild(this.background);
	}

	populateDifficulty() {
		this.difficulty = new PIXI.Text({text: Sunniesnow.game.chart.difficulty, style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.radius / 3,
			fill: '#fbfbff'
		}});
		this.difficultySup = new PIXI.Text({text: Sunniesnow.game.chart.difficultySup, style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.radius / 6,
			fill: '#fbfbff'
		}});
		this.difficultySup.x = this.difficulty.getBounds().width;
		this.difficultyContainer = new PIXI.Container();
		this.difficultyContainer.addChild(this.difficulty);
		this.difficultyContainer.addChild(this.difficultySup);
		this.difficultyContainer.y = -this.radius * 3/4;
		this.difficultyContainer.x = -this.difficultyContainer.getBounds().width / 2;
		this.addChild(this.difficultyContainer);
	}

	populateDifficultyName() {
		this.difficultyName = new PIXI.Text({text: Sunniesnow.game.chart.difficultyName, style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.radius / 6,
			fill: '#fbfbff',
			align: 'center'
		}});
		this.difficultyName.anchor.set(0.5, 1);
		this.difficultyName.y = -this.radius / 8;
		this.addChild(this.difficultyName);
	}

};
