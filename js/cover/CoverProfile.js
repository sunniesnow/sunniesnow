Sunniesnow.CoverProfile = class CoverProfile extends PIXI.Container {

	populate() {
		this.radius = Sunniesnow.Config.WIDTH / 45;
		this.x = Sunniesnow.Config.WIDTH / 10;
		this.y = Sunniesnow.Config.WIDTH / 30;
		this.populateAvatar();
		this.populateNickname();
	}

	populateAvatar() {
		this.avatar = new PIXI.Sprite(Sunniesnow.ResultProfile.avatarTexture);
		this.avatar.anchor.set(0.5);
		this.avatar.scale.set(Math.min(
			this.radius/Math.sqrt(3)*4 / this.avatar.width,
			this.radius*2 / this.avatar.height
		));
		this.avatar.x = this.radius;
		this.addChild(this.avatar);
	}

	populateNickname() {
		this.nickname = new PIXI.Text({text: Sunniesnow.game.settings.nickname, style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.radius,
			fill: '#fbfbff',
			align: 'left'
		}});
		this.nickname.anchor.set(0, 0.5);
		this.nickname.x = this.avatar.x + this.radius*2;
		this.addChild(this.nickname);
	}

};
