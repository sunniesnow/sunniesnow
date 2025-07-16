Sunniesnow.Filter = class Filter {
	static async load() {
		this.liquid = new Sunniesnow.FilterLiquid();
	}

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
		this.setUpResources(options.resources);
		this.setUpGl(options.gl);
		this.setUpGpu(options.gpu);
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
			vertex: this.constructor.liquid.glVertex(options.vertex, this.label, this.resources),
			fragment: this.constructor.liquid.glFragment(options.fragment, this.label, this.resources),
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
		const source = this.constructor.liquid.gpu(options.source, this.label, this.resources);
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
