Sunniesnow.Sscharter = {
	async connect(data) {
		if (Sunniesnow.game.savedSettings.levelFile !== 'online') {
			return;
		}
		if (!Sunniesnow.Utils.isValidUrl(Sunniesnow.game.savedSettings.levelFileOnline)) {
			return;
		}
		if (!(typeof data === 'object' && 'version' in data && 'port' in data)) {
			Sunniesnow.Logs.warn('Invalid sscharter data');
			return;
		}
		this.disconnect(); // only one connection at a time is allowed
		const {version, port} = data;
		this.version = version;
		this.port = port;
		this.host = new URL(Sunniesnow.game.savedSettings.levelFileOnline).hostname;
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
				case 'chartUpdate':
					this.onChartUpdate(data);
					break;
				default:
					Sunniesnow.Logs.warn(`Unknown message type '${data.type}' from sscharter`);
					break;
			}
		});
	},

	onUpdate({onlyCharts}) {
		Sunniesnow.Logs.info('Chart update is received from sscharter');
		Sunniesnow.Settings.s.levelFileOnline.dirty = true;
		if (Sunniesnow.game.settings.sscharterLiveRestart) {
			Sunniesnow.game.window.focus();
			if (onlyCharts) {
				Sunniesnow.Logs.info('Live restart is ignored because the chart update was probably already active')
				return;
			}
			Sunniesnow.Game.run();
		}
	},

	async onChartUpdate({name, chart}) {
		Sunniesnow.Logs.info(`Chart ${name}.json is updated from sscharter`);
		if (Sunniesnow.game.savedSettings.chartSelect !== name + '.json') {
			return;
		}
		// See Sunniesnow.Chart.load
		Sunniesnow.game.chart = new Sunniesnow.Chart(chart);
		await Sunniesnow.game.chart.readSscharterInfo();
		await Sunniesnow.game.chart.checkAndLoadFilters();
		Sunniesnow.Music.setStart();
		if (Sunniesnow.game.scene instanceof Sunniesnow.SceneGame) {
			const time = Sunniesnow.Music.currentTime;
			const pause = Sunniesnow.Music.pausing;
			Sunniesnow.game.scene.retry(true);
			if (Sunniesnow.game.progressAdjustable) {
				Sunniesnow.game.scene.adjustProgress(time, pause ? 'pause' : 'play');
			}
		} else if (Sunniesnow.game.scene instanceof Sunniesnow.SceneResult) {
			Sunniesnow.game.scene.gotoGame();
		} else {
			Sunniesnow.Logs.warn('The chart update was not handled correctly; try restarting if so');
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
		this.socket.send(JSON.stringify({type: 'eventInfoTip', id: event.id, chart: Sunniesnow.game.savedSettings.chartSelect}));
	}
};
