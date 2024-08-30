Sunniesnow.Audio = class Audio {
	static async load() {
		if (Sunniesnow.Utils.isBrowser()) {
			let latencyHint;
			if (Sunniesnow.game.settings.latencyHint === 'value') {
				latencyHint = Sunniesnow.game.settings.latencyHintValue;
			} else {
				latencyHint = Sunniesnow.game.settings.latencyHint;
			}
			this.context = new AudioContext({latencyHint});
		} else {
			// The offline audio context is dummy and will not be used in the main loop
			this.context = new OfflineAudioContext(2, 44100, 44100);
		}
		this.playingAudios = [];
	}

	static loadOfflineAudioContext() {
		let end;
		if (Sunniesnow.record.waitForMusic) {
			end = Sunniesnow.Music.duration;
		} else {
			end = Sunniesnow.game.chart.endTime() + (Sunniesnow.record.resultsDuration || 0);
		}
		this.context = new OfflineAudioContext(
			this.context.destination.channelCount,
			Math.ceil((end - Sunniesnow.Music.start) * this.context.sampleRate),
			this.context.sampleRate
		);
	}

	static stopAll() {
		// put this guard here because sometimes this method gets called before load()
		if (!this.playingAudios) {
			return;
		}
		for (const audio of this.playingAudios) {
			audio.stop();
		}
	}

	static getCurrentTime() {
		// this.currentTime is set manually in the main loop
		return (Sunniesnow.Utils.isBrowser() ? this.context : this).currentTime;
	}

	static removePlayingAudio(audio) {
		const index = this.playingAudios.indexOf(audio);
		if (index >= 0) {
			this.playingAudios.splice(index, 1);
		}
	}
	
	static async fromArrayBuffer(arrayBuffer, volume = 1, playbackRate = 1) {
		// See https://github.com/WebAudio/web-audio-api/issues/1175#issuecomment-320502059.
		// Otherwise, we cannot start the game again after the first time.
		arrayBuffer = arrayBuffer.slice();
		let audioBuffer;
		try {
			audioBuffer = await Sunniesnow.Assets.audioDecode(arrayBuffer, this.context);
		} catch (audioDecodeError) {
			Sunniesnow.Logs.error(`Failed to decode audio data, ${audioDecodeError}`, audioDecodeError);
		}
		return new this(audioBuffer, volume, playbackRate);
	}

	static async fromUrl(url, volume = 1, playbackRate = 1) {
		return await this.fromArrayBuffer(await fetch(url).then(response => response.arrayBuffer()), volume, playbackRate);
	}

	constructor(audioBuffer, volume = 1, playbackRate = 1) {
		this.finishListeners = [];
		this.playbackRate = playbackRate;
		this.volume = volume;
		this.buffer = audioBuffer;
		this.duration = audioBuffer.duration / playbackRate;
	}

	addFinishListener(listener) {
		this.finishListeners.push(listener);
	}

	onFinish() {
		for (const listener of this.finishListeners) {
			listener();
		}
	}

	createNodes() {
		const context = this.constructor.context;
		const currentTime = this.constructor.getCurrentTime();
		const sourceNode = context.createBufferSource();
		sourceNode.buffer = this.buffer;
		sourceNode.playbackRate.setValueAtTime(this.playbackRate, currentTime);
		const gainNode = context.createGain();
		gainNode.gain.setValueAtTime(this.volume, currentTime);
		sourceNode.connect(gainNode);
		gainNode.connect(context.destination);
		return [sourceNode, gainNode]
	}

	removeNodes() {
		if (!this.sourceNode) {
			return;
		}
		this.sourceNode.stop();
		this.sourceNode.disconnect();
		this.sourceNode = null;
		this.gainNode.disconnect();
		this.gainNode = null;
	}

	play(time) {
		time ||= 0;
		this.removeNodes();
		this.startTime = this.constructor.getCurrentTime() - time;
		if (time >= this.duration) {
			this.onFinish();
			return;
		}
		[this.sourceNode, this.gainNode] = this.createNodes();
		if (time >= 0) {
			this.sourceNode.start(0, time * this.playbackRate);
		} else {
			this.sourceNode.start(this.startTime, 0);
		}
		this.constructor.playingAudios.push(this);
	}

	// Provides an alternative way of playing the audio than play().
	// Different calls of this method does not interfere with each other.
	// Returns a function that can be called to stop the audio.
	spawn(when) {
		when = Math.max(when || 0, 0);
		const [sourceNode, gainNode] = this.createNodes();
		sourceNode.start(this.constructor.getCurrentTime() + when);
		const stop = () => {
			sourceNode.stop();
			sourceNode.disconnect();
			gainNode.disconnect();
		};
		if (Sunniesnow.Utils.isBrowser()) {
			setTimeout(stop, (when + this.duration) * 1000);
		}
		return stop;
	}

	stop() {
		this.removeNodes();
		this.constructor.removePlayingAudio(this);
	}

	currentTime() {
		return this.constructor.getCurrentTime() - this.startTime;
	}

	static systematicDelay() {
		// Seems that it is better not to consider the systematic delay.
		return 0; // this.context.baseLatency + this.context.outputLatency;
	}
};
