Sunniesnow.ResultRank = class ResultRank extends Sunniesnow.UiComponent {

	static async load() {
		this.prepareColors();
		this.frameGeometry = this.createFrameGeometry();
		this.backgroundGeometry = this.createBackgroundGeometry();
		if (Sunniesnow.game.settings.renderer === 'webgl') {
			this.createApFcGeometry();
		}
	}

	static prepareColors() {
		if (Sunniesnow.game.settings.renderer === 'webgl') {
			this.shaderColors = {
				fc: [0xffd55d, 0xfff2a6, 0xffd55d, 0xfff2a6],
				fcs: [0xe4ffff, 0x94b7d0, 0xe4ffff, 0x94b7d0],
				ap: [0x99ffee, 0x6688ff, 0xee77ff, 0xffffaa]
			};
			for (const key in this.shaderColors) {
				this.shaderColors[key] = new Float32Array(
					this.shaderColors[key].map(color => new PIXI.Color(color).toRgbArray()).flat()
				);
			}
		} else {
			this.plainColors = {
				fc: 0xfef856,
				fcs: 0xc9dcda,
				ap: 0xee99ff
			};
		}
	}

	static createFrameGeometry() {
		this.radius = Sunniesnow.Config.WIDTH / 8;
		const innerRadius = this.radius * 5/6;
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(this.radius / 15, Sunniesnow.Result.mainColor, 1, 0);
		graphics.drawRegularPolygon(0, 0, this.radius, 4, 0);
		graphics.lineStyle(this.radius / 30, Sunniesnow.Result.mainColor, 1, 0);
		graphics.drawRegularPolygon(0, 0, innerRadius, 4, 0);
		graphics.beginFill(0xebfbff, 1);
		const smallRadius = this.radius / 8;
		graphics.drawRegularPolygon(0, innerRadius - smallRadius, smallRadius, 4, 0);
		graphics.drawRegularPolygon(0, -innerRadius + smallRadius, smallRadius, 4, 0);
		graphics.endFill();
		return graphics.geometry;
	}

	static createBackgroundGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0x000000, 0.2);
		graphics.drawRegularPolygon(0, 0, this.radius, 4, 0);
		graphics.endFill();
		return graphics.geometry;
	}

	static createApFcGeometry() {
		this.apFcVertexShader = `
			attribute vec2 aVertexPosition;
			attribute vec3 aColor;

			uniform mat3 projectionMatrix;
			uniform mat3 translationMatrix;

			varying vec3 vColor;

			void main() {
				gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
				vColor = aColor;
			}
		`;
		this.apFcFragmentShader = `
			varying vec3 vColor;

			void main() {
				gl_FragColor = vec4(vColor, 1.0);
			}
		`;
		this.apFcGeometry = new PIXI.Geometry();
		this.apFcGeometry.addAttribute('aVertexPosition', new PIXI.Buffer(new Float32Array([
			this.radius, 0,
			0, this.radius,
			-this.radius, 0,
			0, -this.radius
		]), true), 2, false, PIXI.TYPES.FLOAT);
		this.apFcGeometry.addAttribute('aColor', new PIXI.Buffer(new Float32Array(12), true), 3, false, PIXI.TYPES.FLOAT);
		this.apFcGeometry.addIndex(new PIXI.Buffer(new Uint16Array([
			0, 1, 2,
			0, 2, 3
		]), true, true));
		this.apFcShader = PIXI.Shader.from(this.apFcVertexShader, this.apFcFragmentShader);
	}

	populate() {
		super.populate();
		this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.addChild(this.background);
		if (Sunniesnow.game.level.apFcIndicator) {
			if (Sunniesnow.game.settings.renderer === 'webgl') {
				this.constructor.apFcGeometry.getBuffer('aColor').data.set(
					this.constructor.shaderColors[Sunniesnow.game.level.apFcIndicator]
				);
				this.frame = new PIXI.Mesh(this.constructor.apFcGeometry, this.constructor.apFcShader);
				this.frame.mask = new PIXI.Graphics(this.constructor.frameGeometry);
				this.addChild(this.frame.mask);
			} else {
				this.frame = new PIXI.Graphics(this.constructor.frameGeometry);
				this.frame.tint = this.constructor.plainColors[Sunniesnow.game.level.apFcIndicator];
			}
		} else {
			this.frame = new PIXI.Graphics(this.constructor.frameGeometry);
			this.frame.tint = Sunniesnow.Result.mainColor;
		}
		this.addChild(this.frame);
		this.text = new PIXI.Text(Sunniesnow.game.level.rank(), {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.constructor.radius / 1.5,
			fill: '#fbfbff',
			align: 'center'
		});
		this.text.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		this.addChild(this.text);
	}

};
