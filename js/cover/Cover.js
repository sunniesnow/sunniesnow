Sunniesnow.Cover = class Cover extends PIXI.Container {

	async populate() {
		await this.populateBackground();
		this.populateTitle();
		this.populateThemeImage();
		this.populateDifficulty();
		this.populateProfile();
	}

	async populateBackground() {
		this.background = new Sunniesnow.CoverBackground();
		await this.background.populate();
		this.addChild(this.background);
	}

	populateThemeImage() {
		this.themeImage = new Sunniesnow.CoverThemeImage();
		this.themeImage.populate();
		this.addChild(this.themeImage);
	}

	populateTitle() {
		this.title = new Sunniesnow.CoverTitle();
		this.title.populate();
		this.addChild(this.title);
	}

	populateDifficulty() {
		this.difficulty = new Sunniesnow.CoverDifficulty();
		this.difficulty.populate();
		this.addChild(this.difficulty);
	}

	populateProfile() {
		this.profile = new Sunniesnow.CoverProfile();
		this.profile.populate();
		this.addChild(this.profile);
	}

};
