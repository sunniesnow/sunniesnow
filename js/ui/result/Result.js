Sunniesnow.Result = class Result extends PIXI.Container {
	
	static async load() {
		this.mainColor = 0xfbfbff;
		this.mainContourColor = 0xaaaaaa;
	}

	constructor() {
		super();
		this.populate();
	}

	populate() {
		this.label = 'result';
		this.populateTitle();
		this.populateDifficulty();
		this.populateStatsAndCombo();
		this.populateRank();
		this.populateScore();
		this.populateAccuracy();
		this.populateProfile();
	}

	populateTitle() {
		this.title = new Sunniesnow.ResultTitle();
		this.title.x = Sunniesnow.Config.WIDTH / 5;
		this.title.y = Sunniesnow.Config.HEIGHT / 4.5;
		this.addChild(this.title);
	}

	populateDifficulty() {
		this.difficulty = new Sunniesnow.ResultDifficulty();
		this.difficulty.x = this.title.x;
		this.difficulty.y = this.title.y + Sunniesnow.ResultTitle.height * 5/4;
		this.addChild(this.difficulty);
	}

	populateStatsAndCombo() {
		this.statsAndCombo = new Sunniesnow.ResultStatsAndCombo();
		this.statsAndCombo.x = this.title.x;
		this.statsAndCombo.y = Sunniesnow.Config.HEIGHT * 2/3;
		this.addChild(this.statsAndCombo);
	}

	populateRank() {
		this.rank = new Sunniesnow.ResultRank();
		this.rank.x = Sunniesnow.Config.WIDTH * 0.7;
		this.rank.y = Sunniesnow.Config.HEIGHT * 0.35;
		this.addChild(this.rank);
	}

	populateScore() {
		this.score = new Sunniesnow.ResultScore();
		this.score.x = this.rank.x;
		this.score.y = Sunniesnow.Config.HEIGHT * 2/3;
		this.addChild(this.score);
	}

	populateAccuracy() {
		this.accuracy = new Sunniesnow.ResultAccuracy();
		this.accuracy.x = this.score.x;
		this.accuracy.y = this.score.y + Sunniesnow.ResultAccuracy.height/2 + Sunniesnow.ResultScore.height;
		this.addChild(this.accuracy);
	}

	populateProfile() {
		this.profile = new Sunniesnow.ResultProfile();
		this.profile.x = Sunniesnow.Config.WIDTH / 10;
		this.profile.y = Sunniesnow.Config.WIDTH / 30;
		this.addChild(this.profile);
	}

};
