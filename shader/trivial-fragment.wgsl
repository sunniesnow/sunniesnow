@fragment fn mainFragment(@location(0) uv: vec2<f32>, @builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
	return textureSample(uTexture, uSampler, uv);
}
