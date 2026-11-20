import Sunniesnow from '../Sunniesnow.js';

Sunniesnow.VConsole = {
	async setup() {
		if (this.vConsole) {
			this.vConsole.showSwitch();
			return;
		}
		const {default: VConsole} = await import('vconsole');
		this.vConsole = new VConsole({onReady: () => {
			Sunniesnow.Logs.info('vConsole is created');
		}});
	},

	hide() {
		if (this.vConsole) {
			this.vConsole.hideSwitch();
		} else {
			Sunniesnow.Logs.warn('vConsole does not exist');
		}
	},

	destroy() {
		if (this.vConsole) {
			this.vConsole.destroy();
			this.vConsole = null;
		} else {
			Sunniesnow.Logs.warn('vConsole does not exist');
		}
	}
};
