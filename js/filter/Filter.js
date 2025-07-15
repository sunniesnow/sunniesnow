Sunniesnow.Filter = class Filter {
	// Adapted from built-in filters in PixiJS.
	static GL_VERTEX_PREAMBLE = `
		in vec2 aPosition;
		out vec2 vTextureCoord;
		uniform highp vec4 uInputSize;
		uniform vec4 uInputPixel;
		uniform vec4 uInputClamp;
		uniform vec4 uOutputFrame;
		uniform vec4 uOutputTexture;
		uniform sampler2D uTexture;
		vec4 filterVertexPosition(void) {
			vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
			position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
			position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
			return vec4(position, 0.0, 1.0);
		}
		vec2 filterTextureCoord(void) {
			return aPosition * (uOutputFrame.zw * uInputSize.zw);
		}
	`

	static GL_FRAGMENT_PREAMBLE = `
		in vec2 vTextureCoord;
		out vec4 finalColor;
		uniform highp vec4 uInputSize;
		uniform vec4 uInputPixel;
		uniform vec4 uInputClamp;
		uniform vec4 uOutputFrame;
		uniform vec4 uOutputTexture;
		uniform sampler2D uTexture;
	`

	static GPU_PREAMBLE = `
		struct GlobalFilterUniforms {
			uInputSize: vec4<f32>,
			uInputPixel: vec4<f32>,
			uInputClamp: vec4<f32>,
			uOutputFrame: vec4<f32>,
			uGlobalFrame: vec4<f32>,
			uOutputTexture: vec4<f32>,
		};
		@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
		@group(0) @binding(1) var uTexture: texture_2d<f32>;
		@group(0) @binding(2) var uSampler: sampler;
		fn filterVertexPosition(aPosition: vec2<f32>) -> vec4<f32> {
			var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;
			position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
			position.y = position.y * (2.0 * gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;
			return vec4(position, 0.0, 1.0);
		}
		fn filterTextureCoord(aPosition: vec2<f32>) -> vec2<f32> {
			return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
		}
		fn globalTextureCoord(aPosition: vec2<f32>) -> vec2<f32> {
			return aPosition.xy / gfu.uGlobalFrame.zw + gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw;
		}
		fn getSize() -> vec2<f32> {
			return gfu.uGlobalFrame.zw;
		}
	`

	static from(label, data) {
		if (!this.check(label, data)) {
			return null;
		}
		const filter = new this(label, data);
		if (filter.invalid) {
			return null;
		}
		return filter;
	}

	static check(label, data) {
		if (typeof data !== 'object') {
			Sunniesnow.Logs.warn(`Filter ${label} data are not an object.`);
			return false;
		}
		if (data.gl != null && !this.checkGl(label, data.gl)) {
			return false;
		}
		if (data.gpu != null && !this.checkGpu(label, data.gpu)) {
			return false;
		}
		if (data.resources != null && !this.checkResources(label, data.resources)) {
			return false;
		}
		return true;
	}

	static checkGl(label, options) {
		if (typeof options !== 'object') {
			Sunniesnow.Logs.warn(`Filter ${label} WebGL options are not an object.`);
			return false;
		}
		if (typeof options.vertex !== 'string' || typeof options.fragment !== 'string') {
			Sunniesnow.Logs.warn(`Filter ${label} WebGL options do not have vertex and fragment shaders.`);
			return false;
		}
		return true;
	}

	static checkGpu(label, options) {
		if (typeof options !== 'object') {
			Sunniesnow.Logs.warn(`Filter ${label} WebGPU options are not an object.`);
			return false;
		}
		if (typeof options.source !== 'string') {
			Sunniesnow.Logs.warn(`Filter ${label} WebGPU options do not have shader source.`);
			return false;
		}
		if (typeof options.vertexEntryPoint !== 'string' || typeof options.fragmentEntryPoint !== 'string') {
			Sunniesnow.Logs.warn(`Filter ${label} WebGPU options do not have vertex and fragment entry points.`);
			return false;
		}
		return true;
	}

	static checkResources(label, resources) {
		if (typeof resources !== 'object') {
			Sunniesnow.Logs.warn(`Filter ${label} resources are not an object.`);
			return false;
		}
		for (const key in resources) {
			if (typeof resources[key] !== 'object') {
				Sunniesnow.Logs.warn(`Filter ${label} resource ${key} is not an object.`);
				return false;
			}
			switch (resources[key].type) {
				case 'uniforms':
					if (typeof resources[key].uniforms !== 'object') {
						Sunniesnow.Logs.warn(`Filter ${label} resource ${key} does not have uniforms.`);
						return false;
					}
					for (const uniformName in resources[key].uniforms) {
						if (!PIXI.UNIFORM_TYPES_MAP[resources[key].uniforms[uniformName]]) {
							Sunniesnow.Logs.warn(`Filter ${label} resource ${key} uniform ${uniformName} has unsupported type ${resources[key].uniforms[uniformName]}.`);
							return false;
						}
					}
					break;
				case 'texture':
					if (resources[key].coordinateSystem == null) {
						break;
					}
					if (!['canvas', 'chart'].includes(resources[key].coordinateSystem)) {
						Sunniesnow.Logs.warn(`Filter ${label} resource ${key} has unsupported coordinate system ${resources[key].coordinateSystem}.`);
						return false;
					}
					break;
				default:
					Sunniesnow.Logs.warn(`Filter ${label} resource ${key} has unsupported type ${resources[key].type}.`);
					return false;
			}
		}
		return true;
	}

	constructor(label, options) {
		this.label = label;
		this.setUpGl(options.gl);
		this.setUpGpu(options.gpu);
		this.setUpResources(options.resources);
		if (!this.glProgram && !this.gpuProgram) {
			this.invalid = true;
		}
		this.filterOptions = {
			blendMode: options.blendMode ?? 'normal',
			blendRequired: options.blendRequired ?? false,
			padding: options.padding ?? 0,
			resolution: 'inherit'
		};
	}

	setUpGl(options) {
		if (!options) {
			if (Sunniesnow.game.settings.renderer === 'webgl') {
				Sunniesnow.Logs.warn(`Filter ${this.label} does not support WebGL.`);
			}
			return;
		}
		this.glProgram = PIXI.GlProgram.from({
			vertex: this.constructor.GL_VERTEX_PREAMBLE + options.vertex,
			fragment: this.constructor.GL_FRAGMENT_PREAMBLE + options.fragment,
			name: this.label
		});
	}

	setUpGpu(options) {
		if (!options) {
			if (Sunniesnow.game.settings.renderer === 'webgpu') {
				Sunniesnow.Logs.warn(`Filter ${this.label} does not support WebGPU.`);
			}
			return;
		}
		const source = this.constructor.GPU_PREAMBLE + options.source;
		this.gpuProgram = PIXI.GpuProgram.from({
			vertex: {source, entryPoint: options.vertexEntryPoint},
			fragment: {source, entryPoint: options.fragmentEntryPoint},
			name: this.label
		});
	}

	setUpResources(options) {
		this.resources = {};
		if (!options) {
			return;
		}
		for (const key in options) {
			switch (options[key].type) {
				case 'uniforms':
					this.resources[key] = {type: 'uniforms', uniforms: {}};
					for (const uniformName in options[key].uniforms) {
						this.resources[key].uniforms[uniformName] = options[key].uniforms[uniformName];
					}
					break;
				case 'texture':
					this.resources[key] = {type: 'texture'};
					this.setUpTextureResourceVariableName(options, key, 'samplerName', 'Sampler');
					this.setUpTextureResourceVariableName(options, key, 'uniformsName', 'Uniforms');
					this.setUpTextureResourceVariableName(options, key, 'matrixName', 'Matrix');
					this.resources[key].coordinateSystem = options[key].coordinateSystem ?? 'canvas';
					break;
			}
		}
	}

	setUpTextureResourceVariableName(options, resourceKey, variable, defaultSuffix) {
		if (options[resourceKey][variable]) {
			this.resources[resourceKey][variable] = options[resourceKey][variable];
		} else {
			const variableName = resourceKey + defaultSuffix;
			Sunniesnow.Logs.warn(`Filter ${this.label} texture ${resourceKey} does not specify a ${variable}; using ${variableName}.`);
			this.resources[resourceKey][variable] = variableName;
		}
	}

	newFilter() {
		const resources = {};
		for (const key in this.resources) {
			switch (this.resources[key].type) {
				case 'uniforms':
					const options = {};
					for (const uniformName in this.resources[key].uniforms) {
						options[uniformName] = {type: this.resources[key].uniforms[uniformName]};
					}
					resources[key] = new PIXI.UniformGroup(options);
					break;
				case 'texture':
					const texture = PIXI.Texture.EMPTY;
					resources[key] = texture.source;
					resources[this.resources[key].samplerName] = texture.source.style;
					const textureUniforms = resources[this.resources[key].uniformsName] = {}
					textureUniforms[this.resources[key].matrixName] = {value: new PIXI.Matrix(), type: 'mat3x3<f32>'};
					break;
			}
		}
		return new Sunniesnow.FilterFromChart({
			glProgram: this.glProgram,
			gpuProgram: this.gpuProgram,
			resources,
			...this.filterOptions
		});
	}
};
