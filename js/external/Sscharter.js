Sunniesnow.Sscharter = {
	async connect(data) {
		if (!Sunniesnow.Utils.isValidUrl(Sunniesnow.game.loaded.chart.sourceContents)) {
			return;
		}
		if (!(typeof data === 'object' && 'version' in data && 'port' in data)) {
			Sunniesnow.Logs.warn('Invalid sscharter data');
			return;
		}
		const {version, port} = data;
		this.version = version;
		this.port = port;
		this.host = new URL(Sunniesnow.game.loaded.chart.sourceContents).hostname;
		this.url = `ws://${this.host}:${this.port}`;
		this.socket = new WebSocket(this.url);
		this.addListeners();
		return new Promise(resolve => {
			this.socket.addEventListener('open', event => {
				this.connectRespond();
				resolve();
			});
		});
	},

	connectRespond() {
		this.socket.send(JSON.stringify({type: 'connect', userAgent: navigator.userAgent}));
		Sunniesnow.Logs.info(`Connected to sscharter ${this.version} at ${this.url}`);
	},

	addListeners() {
		this.socket.addEventListener('error', event => {
			this.socket = null;
			Sunniesnow.Logs.warn(`Connection to sscharter closed due to error`, event);
		});
		this.socket.addEventListener('message', event => {
			const data = JSON.parse(event.data);
			switch (data.type) {
				case 'update':
					this.onUpdate(data);
					break;
				default:
					Sunniesnow.Logs.warn(`Unknown message type '${data.type}' from sscharter`);
					break;
			}
		});
	},

	onUpdate(data) {
		Sunniesnow.Logs.info('Chart update is received from sscharter');
		Sunniesnow.Loader.triggerLoadChart();
		if (Sunniesnow.game.settings.sscharterLiveRestart) {
			Sunniesnow.game.window.focus();
			Sunniesnow.Game.run();
		}
	},

	disconnect() {
		if (!this.socket) {
			return;
		}
		this.socket.close();
		this.socket = null;
		Sunniesnow.Logs.info('Disconnected from sscharter');
	},

	sendEventInfoTip(event) {
		if (!this.socket) {
			return;
		}
		this.socket.send(JSON.stringify({type: 'eventInfoTip', id: event.id, chart: Sunniesnow.game.settings.chartSelect}));
	}
};
