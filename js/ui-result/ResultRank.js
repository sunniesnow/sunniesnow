Sunniesnow.ResultRank = class ResultRank extends PIXI.Container {

	static async load() {
		this.prepareColors();
		this.frameGeometry = this.createFrameGeometry();
		this.backgroundGeometry = this.createBackgroundGeometry();
		if (Sunniesnow.game.settings.renderer !== 'canvas') {
			this.apFcShader = this.createApFcShader();
		}
	}

	static prepareColors() {
		if (Sunniesnow.game.settings.renderer !== 'canvas') {
			this.shaderColors = {
				fc: [0xffd55d, 0xfff2a6, 0xffd55d, 0xfff2a6],
				fcs: [0xe4ffff, 0x94b7d0, 0xe4ffff, 0x94b7d0],
				ap: [0x99ffee, 0x6688ff, 0xee77ff, 0xffffaa]
			};
			for (const key in this.shaderColors) {
				this.shaderColors[key] = new Float32Array(this.shaderColors[key].flatMap(c => new PIXI.Color(c).toArray()));
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
		const graphics = new PIXI.GraphicsContext();
		graphics.regularPoly(0, 0, this.radius, 4, 0);
		graphics.stroke({width: this.radius / 15, color: Sunniesnow.Result.mainColor, alignment: 1});
		graphics.regularPoly(0, 0, innerRadius, 4, 0);
		graphics.stroke({width: this.radius / 30, color: Sunniesnow.Result.mainColor, alignment: 1});
		const smallRadius = this.radius / 8;
		graphics.regularPoly(0, innerRadius - smallRadius, smallRadius, 4, 0);
		graphics.fill(0xebfbff);
		graphics.regularPoly(0, -innerRadius + smallRadius, smallRadius, 4, 0);
		graphics.fill(0xebfbff);
		return graphics;
	}

	static createBackgroundGeometry() {
		const graphics = new PIXI.GraphicsContext();
		graphics.regularPoly(0, 0, this.radius, 4, 0);
		graphics.fill({color: 0x000000, alpha: 0.2});
		return graphics;
	}

	createApFcGeometry() {
		this.apFcGeometry = new PIXI.MeshGeometry();
		this.apFcGeometry.positions = new Float32Array([
			this.constructor.radius, 0,
			0, this.constructor.radius,
			-this.constructor.radius, 0,
			0, -this.constructor.radius
		]);
		this.apFcGeometry.addAttribute('aColor', {
			buffer: this.constructor.shaderColors[Sunniesnow.game.level.apFcIndicator],
			size: 4
		});
		this.apFcGeometry.indices = new Uint16Array([
			0, 1, 2,
			0, 2, 3
		]);
	}

	static createApFcShader() {
		return new PIXI.Shader({
			glProgram: PIXI.compileHighShaderGlProgram({bits: [
				PIXI.colorBitGl,
				PIXI.localUniformBitGl,
				PIXI.roundPixelsBitGl,
				{fragment: {main: 'outColor = vec4(1.0);'}}
			]}),
			gpuProgram: PIXI.compileHighShaderGpuProgram({bits: [
				PIXI.colorBit,
				PIXI.localUniformBit,
				PIXI.roundPixelsBit,
				{fragment: {main: 'outColor = vec4<f32>(1.0);'}}
			]})
		});
	}

	constructor() {
		super();
		this.populate();
	}

	populate() {
		this.label = 'result-rank';
		this.background = new PIXI.Graphics(this.constructor.backgroundGeometry);
		this.background.label = 'background';
		this.addChild(this.background);
		if (Sunniesnow.game.level.apFcIndicator) {
			if (Sunniesnow.game.settings.renderer !== 'canvas') {
				this.createApFcGeometry();
				this.frame = new PIXI.Mesh({geometry: this.apFcGeometry, shader: this.constructor.apFcShader});
				this.frame.mask = new PIXI.Graphics(this.constructor.frameGeometry);
				this.frame.mask.label = 'frame-mask';
				this.addChild(this.frame.mask);
			} else {
				this.frame = new PIXI.Graphics(this.constructor.frameGeometry);
				this.frame.tint = this.constructor.plainColors[Sunniesnow.game.level.apFcIndicator];
			}
		} else {
			this.frame = new PIXI.Graphics(this.constructor.frameGeometry);
			this.frame.tint = Sunniesnow.Result.mainColor;
		}
		this.frame.label = 'frame';
		this.addChild(this.frame);
		this.text = new PIXI.Text({text: Sunniesnow.game.level.rank(), style: {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.constructor.radius / 1.5,
			fill: '#fbfbff',
			align: 'center'
		}});
		this.text.label = 'text';
		this.text.anchor.set(0.5, 0.5);
		this.addChild(this.text);
	}

};
