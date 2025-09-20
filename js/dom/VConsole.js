Sunniesnow.VConsole = {
	setup() {
		if (this.vConsole) {
			this.vConsole.showSwitch();
		} else {
			this.vConsole = new VConsole({onReady: () => {
				Sunniesnow.Logs.info('vConsole is created');
			}});
		}
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
