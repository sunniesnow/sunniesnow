Sunniesnow.FilterLiquid = class FilterLiquid extends liquidjs.Liquid {

	static glPreamble = `
{% if environment == 'gl-vertex' -%}
	in vec2 aPosition;
	out vec2 vTextureCoord;
{%- else %}
	in vec2 vTextureCoord;
	out vec4 finalColor;
{%- endif %}

{% assign includeFilterVertexPosition = string contains 'filterVertexPosition' and not excluded contains 'filterVertexPosition' -%}
{% assign includeFilterTextureCoord = string contains 'filterTextureCoord' and not excluded contains 'filterTextureCoord' -%}

{% capture user_uniforms -%}
{%- for resource_item in resources -%}
	{%- assign key = resource_item[0] -%}
	{%- assign resource = resource_item[1] -%}
	{%- if resource.type == 'uniforms' %}
		{%- for uniform_item in resource.uniforms %}
			{% if string contains uniform_item[0] and not excluded contains uniform_item[0] -%}
				uniform {{ uniform_item[1] | gl_type }} {{ uniform_item[0] }};
			{%- endif %}
		{% endfor -%}
	{%- elsif resource.type == 'texture' %}
		{%- capture coordFunction %}{{ key }}Coord{% endcapture %}
		{%- assign includeCoordFunction = string contains coordFunction and not excluded contains coordFunction %}
		{% if string contains key and not excluded contains key -%}
			uniform sampler2D {{ key }};
		{%- endif %}
		{% if string contains resource.matrixName or includeCoordFunction and not excluded contains resource.matrixName -%}
			uniform mat3 {{ resource.matrixName }};
		{%- endif %}
		{%- if includeCoordFunction %}
			{%- assign includeFilterTextureCoord = true %}
			vec2 {{ coordFunction }}(void) {
				return ({{ resource.matrixName}} * vec3(filterTextureCoord(), 1.0)).xy;
			}
		{%- endif %}
	{%- endif %}
{%- endfor %}
{% endcapture %}

{% if string contains 'uInputSize' or includeFilterVertexPosition and not excluded contains 'filterVertexPosition' -%}
	uniform highp vec4 uInputSize;
{%- endif %}
{% if string contains 'uInputPixel' and not excluded contains 'uInputPixel' -%}
	uniform vec4 uInputPixel;
{%- endif %}
{% if string contains 'uInputClamp' and not excluded contains 'uInputClamp' -%}
	uniform vec4 uInputClamp;
{%- endif %}
{% if string contains 'uOutputFrame' or includeFilterVertexPosition or includeFilterTextureCoord and not excluded contains 'uOutputFrame' -%}
	uniform vec4 uOutputFrame;
{%- endif %}
{% if string contains 'uOutputTexture' or includeFilterVertexPosition and not excluded contains 'uOutputTexture' -%}
	uniform vec4 uOutputTexture;
{%- endif %}
{% if string contains 'uTexture' and not excluded contains 'uTexture' -%}
	uniform sampler2D uTexture;
{%- endif %}
{% if options.blendRequired and string contains 'uBackTexture' and not excluded contains 'uBackTexture' -%}
	uniform sampler2D uBackTexture;
{%- endif %}

{% if includeFilterVertexPosition -%}
	vec4 filterVertexPosition(void) {
		vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
		position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
		position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
		return vec4(position, 0.0, 1.0);
	}
{%- endif %}

{% if includeFilterTextureCoord -%}
	vec2 filterTextureCoord(void) {
		return aPosition * (uOutputFrame.zw * uInputSize.zw);
	}
{%- endif %}

// User-defined uniforms
{{ user_uniforms }}
`

	static glTrivialVertex = `
void {{ functionName }}(void) {
	gl_Position = filterVertexPosition();
	vTextureCoord = filterTextureCoord();
}
`

	static glTrivialFragment = `
void {{ functionName }}(void) {
	finalColor = texture(uTexture, vTextureCoord);
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

// User-defined uniforms
{%- assign group = group | default: 1 -%}
{%- assign binding = 0 -%}
{%- for resource_item in resources -%}
	{%- assign key = resource_item[0] -%}
	{%- assign resource = resource_item[1] -%}
	{%- if resource.type == 'uniforms' -%}
		{%- if resource.structName %}
			{%- assign struct_name = resource.structName %}
		{%- else %}
			{%- assign struct_name = key | capitalize_one %}
		{%- endif %}
		struct {{ struct_name }} {
			{%- for uniform_item in resource.uniforms %}
				{{ uniform_item[0] }}: {{ uniform_item[1] | gpu_type }},
			{% endfor -%}
		};
		@group({{ group }}) @binding({{ binding }}) var<uniform> {{ key }}: {{ struct_name }};
		{%- assign binding = binding | plus: 1 -%}
	{%- elsif resource.type == 'texture' %}
		@group({{ group }}) @binding({{ binding }}) var {{ key }}: texture_2d<f32>;
		{% assign binding = binding | plus: 1 -%}
		@group({{ group }}) @binding({{ binding }}) var {{ resource.samplerName }}: sampler;
		{% assign binding = binding | plus: 1 -%}
		{%- if resource.uniformsStructName %}
			{%- assign struct_name = resource.uniformStructName %}
		{%- else %}
			{%- assign struct_name = resource.uniformsName | capitalize_one -%}
		{%- endif %}
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

@vertex fn {{ functionName }}(@location(0) aPosition: vec2<f32>,) -> VSOutput {
	return VSOutput(filterVertexPosition(aPosition), filterTextureCoord(aPosition));
}
`

	static gpuTrivialFragment = `
@fragment fn {{ functionName }}(@location(0) uv: vec2<f32>, @builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
	return textureSample(uTexture, uSampler, uv);
}
`

	constructor() {
		super();
		this.registerFilters();
		this.registerTags();
	}

	registerFilters() {
		for (const fun of ['glType', 'gpuType', 'capitalizeOne']) {
			this.registerFilter(Sunniesnow.Utils.camelToUnderscore(fun), Sunniesnow.Utils[fun].bind(Sunniesnow.Utils));
		}
	}

	registerTags() {
		this.registerPreambleTag();
		this.registerTrivialTag();
	}

	preamblePlaceholder(moreInfo) {
		return `@SUNNIESNOW VERY UNLIKELY PREAMBLE TEXT ${moreInfo}@`;
	}

	registerPreambleTag() {
		const glPreambleTemplates = this.parse(this.constructor.glPreamble)
		const gpuPreambleTemplates = this.parse(this.constructor.gpuPreamble);
		this.registerTag('preamble', {
			parse(tagToken, remainTokens) {
				this.excluded = tagToken.args.trim();
			},
			* render(ctx, emitter) {
				const r = this.liquid.renderer;
				switch (ctx.environments.environment) {
					case 'gl-vertex':
					case 'gl-fragment':
						return this.liquid.preamblePlaceholder(this.excluded);
					case 'gpu':
						yield r.renderTemplates(gpuPreambleTemplates, ctx, emitter);
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
			parse(tagToken, remainTokens) {
				this.functionName = tagToken.args.trim();
			},
			* render(ctx, emitter) {
				const r = this.liquid.renderer;
				switch (ctx.environments.environment) {
					case 'gl-vertex':
					case 'gl-fragment':
						ctx.push({functionName: this.functionName || 'main'});
						yield r.renderTemplates(glTrivialVertexTemplates, ctx, emitter);
						break;
					case 'gpu':
						ctx.push({functionName: this.functionName || 'mainVertex'});
						yield r.renderTemplates(gpuTrivialVertexTemplates, ctx, emitter);
						break;
				}
				ctx.pop();
			}
		});
		this.registerTag('trivial_fragment', {
			parse(tagToken, remainTokens) {
				this.functionName = tagToken.args.trim();
			},
			* render(ctx, emitter) {
				const r = this.liquid.renderer;
				switch (ctx.environments.environment) {
					case 'gl-vertex':
					case 'gl-fragment':
						ctx.push({functionName: this.functionName || 'main'});
						yield r.renderTemplates(glTrivialFragmentTemplates, ctx, emitter);
						break;
					case 'gpu':
						ctx.push({functionName: this.functionName || 'mainFragment'});
						yield r.renderTemplates(gpuTrivialFragmentTemplates, ctx, emitter);
						break;
				}
				ctx.pop();
			}
		});
	}

	glVertex(string, {label, resources, filterOptions}) {
		return this.populateGlPreamble(this.parseAndRenderSync(string, {
			environment: 'gl-vertex',
			label, resources, options: filterOptions,
			settings: Sunniesnow.game.settings,
			config: Sunniesnow.Config
		}), {environment: 'gl-vertex', resources, filterOptions});
	}

	glFragment(string, {label, resources, filterOptions}) {
		return this.populateGlPreamble(this.parseAndRenderSync(string, {
			environment: 'gl-fragment',
			label, resources, options: filterOptions,
			settings: Sunniesnow.game.settings,
			config: Sunniesnow.Config
		}), {environment: 'gl-fragment', resources, filterOptions});
	}

	gpu(string, {label, resources, filterOptions}) {
		return this.parseAndRenderSync(string, {
			environment: 'gpu',
			label, resources, options: filterOptions,
			settings: Sunniesnow.game.settings,
			config: Sunniesnow.Config
		});
	}

	populateGlPreamble(string, {environment, resources, filterOptions}) {
		const [preamble, excluded] = string.match(new RegExp(this.preamblePlaceholder('(.*?)'))) ?? [];
		if (!preamble) {
			return string;
		}
		return string.replace(preamble, this.parseAndRenderSync(this.constructor.glPreamble, {
			string, environment, resources, excluded: excluded.split(','), options: filterOptions
		}));
	}
};
