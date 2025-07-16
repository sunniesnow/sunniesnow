Sunniesnow.FilterLiquid = class FilterLiquid extends liquidjs.Liquid {
	static async load() {
		[
			this.glVertexPreamble,
			this.glFragmentPreamble,
			this.glUniforms,
			this.glTrivialVertex,
			this.glTrivialFragment,
			this.gpuPreamble,
			this.gpuUniforms,
			this.gpuTrivialVertex,
			this.gpuTrivialFragment
		] = await Promise.all([
			'vertex-preamble.glsl',
			'fragment-preamble.glsl',
			'uniforms.glsl.liquid',
			'trivial-vertex.glsl',
			'trivial-fragment.glsl',
			'preamble.wgsl',
			'uniforms.wgsl.liquid',
			'trivial-vertex.wgsl',
			'trivial-fragment.wgsl'
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
		const glVertexPreambleTemplates = this.parse(this.constructor.glVertexPreamble)
		const glFragmentPreambleTemplates = this.parse(this.constructor.glFragmentPreamble);
		const gpuPreambleTemplates = this.parse(this.constructor.gpuPreamble);
		this.registerTag('preamble', {
			* render(ctx, emitter) {
				const r = this.liquid.renderer;
				switch (ctx.environments.environment) {
					case 'gl-vertex':
						yield r.renderTemplates(glVertexPreambleTemplates, ctx, emitter);
						break;
					case 'gl-fragment':
						yield r.renderTemplates(glFragmentPreambleTemplates, ctx, emitter);
						break;
					case 'gpu':
						yield r.renderTemplates(gpuPreambleTemplates, ctx, emitter);
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

	glVertex(string, label, resources) {
		return this.parseAndRenderSync(string, {
			environment: 'gl-vertex',
			label, resources,
			settings: Sunniesnow.game.settings,
			config: Sunniesnow.Config
		});
	}

	glFragment(string, label, resources) {
		return this.parseAndRenderSync(string, {
			environment: 'gl-fragment',
			label, resources,
			settings: Sunniesnow.game.settings,
			config: Sunniesnow.Config
		});
	}

	gpu(string, label, resources) {
		return this.parseAndRenderSync(string, {
			environment: 'gpu',
			label, resources,
			settings: Sunniesnow.game.settings,
			config: Sunniesnow.Config
		});
	}
};
