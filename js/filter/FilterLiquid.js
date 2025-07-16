Sunniesnow.FilterLiquid = class FilterLiquid extends liquidjs.Liquid {
	static async load() {
		[
			this.glPreamble,
			this.glUniforms,
			this.glTrivialVertex,
			this.glTrivialFragment,
			this.gpuPreamble,
			this.gpuUniforms,
			this.gpuTrivialVertex,
			this.gpuTrivialFragment
		] = await Promise.all([
			'preamble.glsl.liquid',
			'uniforms.glsl.liquid',
			'trivial-vertex.glsl.liquid',
			'trivial-fragment.glsl.liquid',
			'preamble.wgsl.liquid',
			'uniforms.wgsl.liquid',
			'trivial-vertex.wgsl.liquid',
			'trivial-fragment.wgsl.liquid'
		].map(p => fetch(`shader/${p}`).then(r => r.text())));
	}

	constructor() {
		super();
		this.registerFilters();
		this.registerTags();
	}

	registerFilters() {
		for (const fun of ['glType']) {
			this.registerFilter(Sunniesnow.Utils.camelToUnderscore(fun), Sunniesnow.Utils[fun].bind(Sunniesnow.Utils));
		}
	}

	registerTags() {
		this.registerPreambleTag();
		this.registerUniformsTag();
		this.registerTrivialTag();
	}

	registerPreambleTag() {
		const glPreambleTemplates = this.parse(this.constructor.glPreamble)
		const gpuPreambleTemplates = this.parse(this.constructor.gpuPreamble);
		this.registerTag('preamble', {
			* render(ctx, emitter) {
				const r = this.liquid.renderer;
				switch (ctx.environments.environment) {
					case 'gl-vertex':
					case 'gl-fragment':
						yield r.renderTemplates(glPreambleTemplates, ctx, emitter);
						break;
					case 'gpu':
						yield r.renderTemplates(ctx.environments.environment === 'gpu' ? gpuPreambleTemplates : glPreambleTemplates, ctx, emitter);
						break;
				}
			}
		});
	}

	registerUniformsTag() {
		const glUniformsTemplates = this.parse(this.constructor.glUniforms);
		const gpuUniformsTemplates = this.parse(this.constructor.gpuUniforms);
		this.registerTag('uniforms', {
			* render(ctx, emitter) {
				const r = this.liquid.renderer;
				switch (ctx.environments.environment) {
					case 'gl-vertex':
					case 'gl-fragment':
						yield r.renderTemplates(glUniformsTemplates, ctx, emitter);
						break;
					case 'gpu':
						yield r.renderTemplates(gpuUniformsTemplates, ctx, emitter);
						break;
				}
			}
		});
	}

	registerTrivialTag() {
		const glTrivialVertexTemplates = this.parse(this.constructor.glTrivialVertex);
		const glTrivialFragmentTemplates = this.parse(this.constructor.glTrivialFragment);
		const gpuTrivialVertexTemplates = this.parse(this.constructor.gpuTrivialVertex);
		const gpuTrivialFragmentTemplates = this.parse(this.constructor.gpuTrivialFragment);
		this.registerTag('trivial_vertex', {
			* render(ctx, emitter) {
				const r = this.liquid.renderer;
				switch (ctx.environments.environment) {
					case 'gl-vertex':
					case 'gl-fragment':
						yield r.renderTemplates(glTrivialVertexTemplates, ctx, emitter);
						break;
					case 'gpu':
						yield r.renderTemplates(gpuTrivialVertexTemplates, ctx, emitter);
						break;
				}
			}
		});
		this.registerTag('trivial_fragment', {
			* render(ctx, emitter) {
				const r = this.liquid.renderer;
				switch (ctx.environments.environment) {
					case 'gl-vertex':
					case 'gl-fragment':
						yield r.renderTemplates(glTrivialFragmentTemplates, ctx, emitter);
						break;
					case 'gpu':
						yield r.renderTemplates(gpuTrivialFragmentTemplates, ctx, emitter);
						break;
				}
			}
		});
	}

	glVertex(string, {label, resources, filterOptions}) {
		return this.parseAndRenderSync(string, {
			environment: 'gl-vertex',
			label, resources, options: filterOptions,
			settings: Sunniesnow.game.settings,
			config: Sunniesnow.Config
		});
	}

	glFragment(string, {label, resources, filterOptions}) {
		return this.parseAndRenderSync(string, {
			environment: 'gl-fragment',
			label, resources, options: filterOptions,
			settings: Sunniesnow.game.settings,
			config: Sunniesnow.Config
		});
	}

	gpu(string, {label, resources, filterOptions}) {
		return this.parseAndRenderSync(string, {
			environment: 'gpu',
			label, resources, options: filterOptions,
			settings: Sunniesnow.game.settings,
			config: Sunniesnow.Config
		});
	}
};
