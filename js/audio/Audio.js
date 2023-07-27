Sunniesnow.Audio = class Audio {
	static async load() {
		this.context = new AudioContext();
		this.playingAudios = [];
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
			audioBuffer = await audioDecode(arrayBuffer);
		} catch (audioDecodeError) {
			Sunniesnow.Utils.error(`Failed to decode audio data, ${audioDecodeError}`, audioDecodeError);
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
		const sourceNode = context.createBufferSource();
		sourceNode.buffer = this.buffer;
		sourceNode.playbackRate.setValueAtTime(this.playbackRate, context.currentTime);
		const gainNode = context.createGain();
		gainNode.gain.setValueAtTime(this.volume, context.currentTime);
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
		this.startTime = this.constructor.context.currentTime - time;
		if (time >= this.duration) {
			this.onFinish();
			return;
		}
		[this.sourceNode, this.gainNode] = this.createNodes();
		if (time >= 0) {
			this.sourceNode.start(0, time);
		} else {
			this.sourceNode.start(this.startTime, 0);
		}
		this.constructor.playingAudios.push(this);
		this.clearStopTimer();
		const timeToStop = this.startTime + this.duration - this.constructor.context.currentTime
		this.stopTimer = setTimeout(() => {
			this.stop();
			this.onFinish();
			this.stopTimer = null;
		}, timeToStop * 1000);
	}

	// Provides an alternative way of playing the audio than play().
	// Different calls of this method does not interfere with each other.
	// Returns a function that can be called to stop the audio.
	spawn(when) {
		when = Math.max(when || 0, 0);
		const [sourceNode, gainNode] = this.createNodes();
		sourceNode.start(this.constructor.context.currentTime + when);
		const stop = () => {
			sourceNode.stop();
			sourceNode.disconnect();
			gainNode.disconnect();
		};
		setTimeout(stop, (when + this.duration) * 1000);
		return stop;
	}

	stop() {
		this.removeNodes();
		this.constructor.removePlayingAudio(this);
		this.clearStopTimer();
	}

	clearStopTimer() {
		if (!this.stopTimer) {
			return;
		}
		clearTimeout(this.stopTimer);
		this.stopTimer = null;
	}

	currentTime() {
		return this.constructor.context.currentTime - this.startTime;
	}

	static systematicDelay() {
		// Seems that it is better not to consider the systematic delay.
		return 0; // this.context.baseLatency + this.context.outputLatency;
	}
};
