Sunniesnow.ResultProfile = class ResultProfile extends PIXI.Container {

	static async load() {
		this.radius = Sunniesnow.Config.WIDTH / 45;
		this.avatarTexture = await this.createAvatarTexture();
	}

	static async createAvatarTexture() {
		if (!Sunniesnow.game.settings.avatar) {
			return PIXI.Texture.EMPTY;
		}
		const url = Sunniesnow.ObjectUrl.create(Sunniesnow.game.settings.avatar);
		try {
			return await Sunniesnow.Assets.loadTexture(url);
		} catch (err) {
			const result = PIXI.Texture.EMPTY;
			Sunniesnow.Logs.warn(`Failed to load avatar: ${err.message ?? err}`, err);
			return result;
		}
	}

	constructor() {
		super();
		this.populate();
	}

	populate() {
		this.label = 'result-profile';
		this.populateAvatar();
		this.populateNickname();
	}

	populateAvatar() {
		this.avatar = new PIXI.Sprite(this.constructor.avatarTexture);
		this.avatar.label = 'avatar';
		this.avatar.anchor.set(0.5);
		this.avatar.scale.set(Math.min(
			this.constructor.radius/Math.sqrt(3)*4 / this.avatar.width,
			this.constructor.radius*2 / this.avatar.height
		));
		this.avatar.x = this.constructor.radius;
		this.addChild(this.avatar);
	}

	populateNickname() {
		this.nickname = new PIXI.Text({text: Sunniesnow.game.settings.nickname, style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: Sunniesnow.ResultTitle.height / 2,
			fill: '#fbfbff',
			align: 'left'
		}});
		this.nickname.label = 'nickname';
		this.nickname.anchor.set(0, 0.5);
		this.nickname.x = this.avatar.x + this.constructor.radius*2;
		this.addChild(this.nickname);
	}

};
