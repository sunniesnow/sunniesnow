Sunniesnow.CoverThemeImage = class CoverThemeImage extends PIXI.Container {

	populate() {
		this.x = Sunniesnow.Config.WIDTH / 4;
		this.y = Sunniesnow.Config.HEIGHT / 2;
		this.calculateDimensions();
		this.populateImageMask();
		this.populateImage();
		this.populateFrame();
	}

	calculateDimensions() {
		const texture = Sunniesnow.Background.originalTexture;
		this.radius = Math.min(Sunniesnow.Config.WIDTH / 4, Sunniesnow.Config.HEIGHT / 2) * 0.8;
		const x = Sunniesnow.Utils.isBrowser() && document.getElementById('cover-theme-image-x').value;
		this.imageAnchorX = x ? parseFloat(x) / texture.width : 0.5;
		const y = Sunniesnow.Utils.isBrowser() && document.getElementById('cover-theme-image-y').value;
		this.imageAnchorY = y ? parseFloat(y) / texture.height : 0.5;
		const width = Sunniesnow.Utils.isBrowser() && document.getElementById('cover-theme-image-width').value || Math.min(texture.width, texture.height);
		this.imageScale = this.radius*2 / parseFloat(width);
	}

	populateImageMask() {
		this.imageMask = new PIXI.Graphics();
		this.imageMask.beginFill('black');
		this.imageMask.drawRoundedPolygon(0, 0, this.radius, 4, this.radius/10);
		this.addChild(this.imageMask);
	}

	populateImage() {
		this.image = new PIXI.Sprite(Sunniesnow.Background.originalTexture);
		this.image.anchor.set(this.imageAnchorX, this.imageAnchorY);
		this.image.scale.set(this.imageScale);
		this.image.mask = this.imageMask;
		this.addChild(this.image);
	}

	populateFrame() {
		this.frame = new PIXI.Graphics();
		this.frame.lineStyle(this.radius/20, 0xfbfbff);
		this.frame.drawRoundedPolygon(0, 0, this.radius, 4, this.radius/10);
		this.addChild(this.frame);
	}
};
