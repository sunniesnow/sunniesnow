// blob -> audio buffer
Sunniesnow.HookAudio = class HookAudio extends Sunniesnow.Hook {
	async apply(value, token) {
		// See https://github.com/WebAudio/web-audio-api/issues/1175#issuecomment-320502059.
		// Otherwise, we cannot decode the buffer again after the first time.
		const arrayBuffer = (await value.arrayBuffer()).slice();
		return await Sunniesnow.Assets.audioDecode(arrayBuffer, this.context);
	}
};
