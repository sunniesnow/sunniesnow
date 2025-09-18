// blob -> texture
Sunniesnow.HookTexture = class HookTexture extends Sunniesnow.Hook {
	async apply(value) {
		return await Sunniesnow.Assets.loadTexture(Sunniesnow.ObjectUrl.create(value));
	}
};
