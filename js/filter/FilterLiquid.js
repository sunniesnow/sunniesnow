Sunniesnow.FilterLiquid = class FilterLiquid extends liquidjs.Liquid {

	static glPreamble = `
{% if environment == 'gl-vertex' -%}
	in vec2 aPosition;
	out vec2 vTextureCoord;
{%- else %}
	in vec2 vTextureCoord;
	out vec4 finalColor;
{%- endif %}

uniform highp vec4 uInputSize;
uniform vec4 uInputPixel;
uniform vec4 uInputClamp;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
uniform sampler2D uTexture;
{% if options.blendRequired -%}
	uniform sampler2D uBackTexture;
{%- endif %}

{% if environment == 'gl-vertex' -%}
	vec4 filterVertexPosition(void) {
		vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
		position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
		position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
		return vec4(position, 0.0, 1.0);
	}

	vec2 filterTextureCoord(void) {
		return aPosition * (uOutputFrame.zw * uInputSize.zw);
	}
{%- endif %}
`
	static glUniforms = `
{%- for resource_item in resources -%}
	{%- assign key = resource_item[0] -%}
	{%- assign resource = resource_item[1] -%}
	{%- if resource.type == 'uniforms' %}
		{%- for uniform_item in resource.uniforms %}
			uniform {{ uniform_item[1] | gl_type }} {{ uniform_item[0] }};
		{% endfor -%}
	{%- elsif resource.type == 'texture' %}
		uniform sampler2D {{ key }};
		uniform mat3 {{ resource.matrixName }};
		{%- if environment == 'gl-vertex' %}
			vec2 {{ key }}Coord(void) {
				return ({{ resource.matrixName}} * vec3(filterTextureCoord(), 1.0)).xy;
			}
		{% endif -%}
	{%- endif -%}
{%- endfor -%}
`

	static glTrivialVertex = `
void main(void) {
	gl_Position = filterVertexPosition();
	vTextureCoord = filterTextureCoord();
}
`

	static glTrivialFragment = `
@fragment fn mainFragment(@location(0) uv: vec2<f32>, @builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
	return textureSample(uTexture, uSampler, uv);
}
`

	static gpuPreamble = `
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
{% if options.blendRequired -%}
	@group(0) @binding(3) var uBackTexture: texture_2d<f32>;
{%- endif %}

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

	static gpuUniforms = `
{%- assign group = group | default: 1 -%}
{%- assign binding = 0 -%}
{%- for resource_item in resources -%}
	{%- assign key = resource_item[0] -%}
	{%- assign resource = resource_item[1] -%}
	{%- if resource.type == 'uniforms' -%}
		{%- assign struct_name = key | capitalize %}
		struct {{ struct_name }} {
			{%- for uniform_item in resource_item[1].uniforms %}
				{{ uniform_item[0] }}: {{ uniform_item[1] }},
			{% endfor -%}
		};
		@group({{ group }}) @binding({{ binding }}) var<uniform> {{ key }}: {{ struct_name }};
		{%- assign binding = binding | plus: 1 -%}
	{%- elsif resource.type == 'texture' %}
		@group({{ group }}) @binding({{ binding }}) var {{ key }}: texture_2d<f32>;
		{% assign binding = binding | plus: 1 -%}
		@group({{ group }}) @binding({{ binding }}) var {{ resource.samplerName }}: sampler;
		{% assign binding = binding | plus: 1 -%}
		{%- assign struct_name = resource.uniformsName | capitalize -%}
		struct {{ struct_name }} {
			{{ resource.matrixName }}: mat3x3<f32>,
		};
		@group({{ group }}) @binding({{ binding }}) var<uniform> {{ resource.uniformsName }}: {{ struct_name }};
		{% assign binding = binding | plus: 1 -%}
		fn {{ key }}Coord(aPosition: vec2<f32>) -> vec2<f32> {
			return ({{ resource.uniformsName }}.{{ resource.matrixName }} * vec3(filterTextureCoord(aPosition), 1.0)).xy;
		}
	{% endif -%}
{%- endfor -%}
`

	static gpuTrivialVertex = `
struct VSOutput {
	@builtin(position) position: vec4<f32>,
	@location(0) uv: vec2<f32>
};

@vertex fn mainVertex(@location(0) aPosition: vec2<f32>,) -> VSOutput {
	return VSOutput(filterVertexPosition(aPosition), filterTextureCoord(aPosition));
}
`

	static gpuTrivialFragment = `
@fragment fn mainFragment(@location(0) uv: vec2<f32>, @builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
	return textureSample(uTexture, uSampler, uv);
}
`

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
