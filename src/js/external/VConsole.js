import Sunniesnow from '../Sunniesnow.js';
import {loadOptionalChunk} from '../optional-chunks.js';

Sunniesnow.VConsole = {
	async setup() {
		if (this.vConsole) {
			this.vConsole.showSwitch();
			return;
		}
		// vConsole is large and is only needed when it is explicitly turned on, so it
		// is one of the optional chunks of the site (and is imported on Node.js)
		// instead of being part of the main bundle.
		const {default: VConsole} = await loadOptionalChunk('vconsole');
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
