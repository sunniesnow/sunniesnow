// Reference: https://github.com/dead8309/Kizzy/blob/65760a302378b242e6c7fbda5ecf0dd76163a06c/gateway/src/main/java/kizzy/gateway/DiscordWebSocketImpl.kt
Sunniesnow.DiscordRichPresence = {
	GATEWAY_URL: 'wss://gateway.discord.gg/?v=10&encoding=json',
	APPLICATION_ID: '1378488363597959268',
	UPDATE_INTERVAL: 60, // frames

	ASSETS: {
		logo: '1378940339213041664',
		play: '1378940655157383368',
		pause: '1378940681686614026',
	},

	// https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes
	OP_CODES: {
		Dispatch: 0,
		Heartbeat: 1,
		Identify: 2,
		PresenceUpdate: 3,
		VoiceStateUpdate: 4,
		Resume: 6,
		Reconnect: 7,
		RequestGuildMembers: 8,
		InvalidSession: 9,
		Hello: 10,
		HeartbeatACK: 11,
		RequestSoundboardSounds: 12,
	},

	// https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes
	CLOSE_CODES: {
		4000: 'Unknown error',
		4001: 'Unknown opcode',
		4002: 'Decode error',
		4003: 'Not authenticated',
		4004: 'Authentication failed',
		4005: 'Already authenticated',
		4007: 'Invalid `seq`',
		4008: 'Rate limited',
		4009: 'Session timed out',
		4010: 'Invalid shard',
		4011: 'Sharding required',
		4012: 'Invalid API version',
		4013: 'Invalid intent(s)',
		4014: 'Disallowed intent(s)',
	},

	ACTIVELY_CLOSE_CODE: 3939,

	// https://discord.com/developers/docs/events/gateway-events#activity-object-activity-types
	ACTIVITY_TYPES: {
		Playing: 0,
		Streaming: 1,
		Listening: 2,
		Watching: 3,
		Custom: 4,
		Competing: 5,
	},

	async load() {
		if (!Sunniesnow.game.settings.discordPresence) {
			return;
		}
		this.token = Sunniesnow.game.settings.discordToken;
		if (!this.token) {
			Sunniesnow.Logs.warn('Discord Rich Presence is enabled but no token is provided');
			return;
		}
		this.createdAt = Date.now();
		this.connect();
	},

	connect() {
		this.websocket = new WebSocket(this.resumeGatewayUrl ?? this.GATEWAY_URL);
		this.websocket.addEventListener('open', event => {
			Sunniesnow.Logs.info('Discord web socket connected');
		});
		this.websocket.addEventListener('message', async event => {
			try {
				await this.onMessage(JSON.parse(event.data));
			} catch (err) {
				Sunniesnow.Logs.error(`Failed to process message from Discord gateway: ${err.message}`, err);
			}
		});
		this.websocket.addEventListener('close', async event => {
			await this.onClose(event.code, event.reason);
		});
		this.websocket.addEventListener('error', event => {
			Sunniesnow.Logs.error(`Discord web socket error: ${event.data}`, event);
			this.close();
		});
	},

	async onClose(code, reason) {
		clearInterval(this.heartbeatTimer);
		this.connected = false;
		if (code !== this.ACTIVELY_CLOSE_CODE) {
			Sunniesnow.Logs.warn(`Discord web socket closed: ${code} ${reason || this.CLOSE_CODES[code]}`);
		}
		if (code === 4000) { // Unknown error
			await this.delay(200);
			this.connect();
		}
	},

	async onMessage(payload) {
		if (payload.s != null) {
			this.sequence = payload.s;
		}
		switch (payload.op) {
			case this.OP_CODES.Dispatch:
				await this.handleDispatch(payload);
				break;
			case this.OP_CODES.Heartbeat:
				await this.sendHeartbeat();
				break;
			case this.OP_CODES.Reconnect:
				this.reconnectWebSocket();
				break;
			case this.OP_CODES.InvalidSession:
				await this.handleInvalidSession();
				break;
			case this.OP_CODES.Hello:
				await this.handleHello(payload);
				break;
		}
	},

	async handleDispatch(payload) {
		switch (payload.t) {
			case 'READY':
				const ready = payload.d;
				this.sessionId = ready.session_id;
				this.resumeGatewayUrl = ready.resume_gateway_url + '/?v=10&encoding=json';
				this.connected = true;
				break;
			case 'RESUME':
				break;
		}
	},

	async handleInvalidSession() {
		await this.delay(150);
		await this.sendIdentify();
	},

	async handleHello(payload) {
		if (this.sequence > 0 && this.sessionId) {
			await this.sendResume();
		} else {
			await this.sendIdentify();
		}
		this.heartbeatInterval = payload.d.heartbeat_interval;
		this.startHeartbeat();
	},

	startHeartbeat() {
		clearInterval(this.heartbeatTimer);
		this.heartbeatTimer = setInterval(this.sendHeartbeat.bind(this), this.heartbeatInterval);
	},

	async sendHeartbeat() {
		await this.send(this.OP_CODES.Heartbeat, this.sequence ? this.sequence : null);
	},

	reconnectWebSocket() {
		if (this.isWebSocketConnected()) {
			this.websocket.close(4000, 'Attempting to reconnect');
		}
	},

	async sendIdentify() {
		await this.send(this.OP_CODES.Identify, this.identifyPayload());
	},

	async sendResume() {
		await this.send(this.OP_CODES.Resume, {
			token: this.token,
			session_id: this.sessionId,
			seq: this.sequence,
		});
	},

	isWebSocketConnected() {
		return this.websocket?.readyState === WebSocket.OPEN;
	},

	async send(op, d) {
		if (this.isWebSocketConnected()) {
			const payload = JSON.stringify({op, d});
			console.log({op, d});
			this.websocket.send(payload);
		}
	},

	close() {
		clearInterval(this.heartbeatTimer);
		this.heartbeatTimer = null;
		this.resumeGatewayUrl = null;
		this.sessionId = null;
		this.connected = false;
		this.websocket?.close(this.ACTIVELY_CLOSE_CODE);
	},

	// presence: https://discord.com/developers/docs/events/gateway-events#update-presence-gateway-presence-update-structure
	async sendPresenceUpdate(presence) {
		while (true) {
			if (!this.websocket) {
				Sunniesnow.Logs.warn('Discord Rich Presence update aborted because websocket is not established');
				return;
			}
			if (this.connected && this.isWebSocketConnected()) {
				break;
			}
			await this.delay(10);
		}
		await this.send(this.OP_CODES.PresenceUpdate, presence);
	},

	async update(delta) {
		if (this.sinceLastUpdate) {
			this.sinceLastUpdate += delta;
			if (this.sinceLastUpdate >= this.UPDATE_INTERVAL) {
				this.sinceLastUpdate = 0;
			}
			return;
		}
		this.sinceLastUpdate = delta;
		if (!Sunniesnow.Music.loaded) {
			return;
		}
		const now = Date.now();
		const activity = {
			name: 'Sunniesnow',
			type: Sunniesnow.game.settings.watchingInsteadOfPlaying ? this.ACTIVITY_TYPES.Watching : this.ACTIVITY_TYPES.Playing,
			details: Sunniesnow.game.chart.title,
			state: `${Sunniesnow.game.chart.difficultyName} ${Sunniesnow.game.chart.difficulty}${Sunniesnow.game.chart.difficultySup}`,
			created_at: this.createdAt,
			application_id: this.APPLICATION_ID,
			assets: {
				large_image: this.ASSETS.logo,
				small_image: Sunniesnow.Music.pausing ? this.ASSETS.pause : this.ASSETS.play,
				small_text: Sunniesnow.Music.pausing ? 'Pausing' : 'Playing',
			},
		};
		if (Sunniesnow.game.settings.watchingInsteadOfPlaying && !Sunniesnow.Music.pausing) {
			activity.timestamps = {
				start: Math.round(now - Sunniesnow.Music.currentTime * 1000),
				end: Math.round(now + (Sunniesnow.Music.duration - Sunniesnow.Music.currentTime) * 1000)
			};
		}
		await this.sendActivities([activity]);
	},

	// activity: https://discord.com/developers/docs/events/gateway-events#activity-object-activity-structure
	async sendActivities(activities) {
		await this.sendPresenceUpdate({
			since: null,
			status: 'online',
			afk: false,
			activities,
		});
	},

	delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},

	identifyPayload() {
		return {
			capabilities: 65,
			compress: false,
			largeThreshold: 100,
			properties: {
				browser: 'Discord Client',
				device: 'ktor',
				os: 'Windows'
			},
			token: this.token,
		};
	},

	async terminate() {
		if (this.connected) {
			await this.sendActivities([]);
		}
		this.close();
	}
};
