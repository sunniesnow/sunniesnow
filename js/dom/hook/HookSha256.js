// string -> string, blob -> string
Sunniesnow.HookSha256 = class HookSha256 extends Sunniesnow.Hook {
	async apply(value, token) {
		return await Sunniesnow.Utils.sha256Async(value);
	}
};
