Sunniesnow.TouchEffect = class TouchEffect extends Sunniesnow.TouchEffectBase {

	static async load() {
		if (!Sunniesnow.game.settings.touchEffects) {
			return;
		}
		this.radius = Sunniesnow.Config.NOTE_RADIUS * 3;
		this.initialScale = 1/3;
		this.life = 30; // frames
		this.innerStop = 0.8; // inner radius / radius
		this.color = '#333355'
		this.texture = this.createTexture();
	}

	static createTexture() {
		const r = this.radius;
		const canvas = Sunniesnow.Utils.newCanvas(r*2, r*2);
		const context = canvas.getContext('2d');
		const gradient = context.createRadialGradient(r, r, 0, r, r, r);
		gradient.addColorStop(this.innerStop, 'black');
		gradient.addColorStop(1, this.color);
		context.fillStyle = gradient;
		context.beginPath();
		context.ellipse(r, r, r, r, 0, 0, 2*Math.PI);
		context.fill();
		return PIXI.Texture.from(canvas);
	}

	populate() {
		super.populate();
		this.sprite = new PIXI.Sprite(this.constructor.texture);
		this.sprite.anchor.set(0.5);
		this.sprite.blendMode = 'add';
		this.sprite.scale.set(this.constructor.initialScale);
		this.addChild(this.sprite);
		this.time = 0;
	}

	update(delta) {
		const t = this.time / this.constructor.life;
		if (t > 1) {
			this.state = 'finished';
			return;
		}
		const s = this.constructor.initialScale;
		this.sprite.scale.set(s + (1-s) * (1-(1-t)**2));
		this.sprite.alpha = 1 - t;
		this.time += delta;
	}
};
