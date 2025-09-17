Sunniesnow.SettingGravatar = class SettingGravatar extends Sunniesnow.SettingOnline {
	url() {
		return Sunniesnow.Utils.url('https://gravatar.com/avatar', Sunniesnow.Utils.sha256(this.element.value));
	}
};
