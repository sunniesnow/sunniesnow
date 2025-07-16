struct VSOutput {
	@builtin(position) position: vec4<f32>,
	@location(0) uv: vec2<f32>
};

@vertex fn mainVertex(@location(0) aPosition: vec2<f32>,) -> VSOutput {
	return VSOutput(filterVertexPosition(aPosition), filterTextureCoord(aPosition));
}
