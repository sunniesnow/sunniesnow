Sunniesnow.ResultProfile = class ResultProfile extends Sunniesnow.UiComponent {

	static async load() {
		this.radius = Sunniesnow.Config.WIDTH / 45;
		// this.frameGeometry = this.createFrameGeometry();
		// this.maskGeometry = this.createMaskGeometry();
		// this.backgroundGeometry = this.createBackgroundGeometry();
		this.avatarTexture = await this.createAvatarTexture();
	}

	static createFrameGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(this.radius/10, Sunniesnow.Result.mainColor);
		Sunniesnow.Utils.drawRoundRegularPolygon(graphics, 0, 0, this.radius/Math.sqrt(3)*2, this.radius/2, 6);
		return graphics.geometry;
	}

	static createMaskGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill('black');
		Sunniesnow.Utils.drawRoundRegularPolygon(graphics, 0, 0, this.radius/Math.sqrt(3)*2, this.radius/2, 6);
		graphics.endFill();
		return graphics.geometry;
	}

	static createBackgroundGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(Sunniesnow.Result.mainColor);
		Sunniesnow.Utils.drawRoundRegularPolygon(graphics, 0, 0, this.radius/Math.sqrt(3)*2, this.radius/2, 6);
		graphics.endFill();
		return graphics.geometry;
	}

	static async avatarUrl() {
		let blob;
		switch (Sunniesnow.game.settings.avatar) {
			case 'none':
				return null;
			case 'online':
				return Sunniesnow.Utils.url(
					Sunniesnow.Config.AVATAR_PREFIX,
					Sunniesnow.game.settings.avatarOnline
				);
			case 'upload':
				blob = Sunniesnow.game.settings.avatarUpload;
				if (!blob) {
					Sunniesnow.Logs.warn('No avatar provided');
					return;
				}
				break;
			case 'gravatar':
				const hash = await Sunniesnow.Utils.sha256(Sunniesnow.game.settings.avatarGravatar);
				return `https://gravatar.com/avatar/${hash}`;
		}
		return Sunniesnow.ObjectUrl.create(blob);
	}

	static async createAvatarTexture() {
		const url = await this.avatarUrl();
		if (!url) {
			return PIXI.Texture.EMPTY;
		}
		try {
			return await Sunniesnow.Assets.loadTexture(url);
		} catch (err) {
			const result = PIXI.Texture.EMPTY;
			Sunniesnow.Logs.warn(`Failed to load avatar: ${err.message ?? err}`, err);
			return result;
		}
	}

	populate() {
		super.populate();
		this.populateAvatar();
		this.populateNickname();
	}

	populateAvatar() {
		// this.frame = new PIXI.Graphics(this.constructor.frameGeometry);
		// this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.avatar = new PIXI.Sprite(this.constructor.avatarTexture);
		this.avatar.anchor.set(0.5);
		this.avatar.scale.set(Math.min(
			this.constructor.radius/Math.sqrt(3)*4 / this.avatar.width,
			this.constructor.radius*2 / this.avatar.height
		));
		// this.avatar.mask = this.mask = new PIXI.Graphics(this.constructor.maskGeometry);
		// this.frame.x = this.background.x = this.mask.x = this.constructor.radius;
		this.avatar.x = this.constructor.radius;
		// this.addChild(this.background);
		// this.addChild(this.mask);
		this.addChild(this.avatar);
		// this.addChild(this.frame);
	}

	populateNickname() {
		this.nickname = new PIXI.Text(Sunniesnow.game.settings.nickname, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: Sunniesnow.ResultTitle.height / 2,
			fill: '#fbfbff',
			align: 'left'
		});
		this.nickname.anchor = new PIXI.ObservablePoint(null, null, 0, 0.5);
		this.nickname.x = this.avatar.x + this.constructor.radius*2;
		this.addChild(this.nickname);
	}

};
