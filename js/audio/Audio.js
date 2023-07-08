Sunniesnow.Audio = class Audio {
	static async load() {
		this.context = new AudioContext();
		this.playingAudios = [];
	}

	static stopAll() {
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
	
	constructor(arrayBuffer) {
		this.loadListeners = [];
		this.finishListeners = [];
		this.playbackRate = 1;
		this.volume = 1;
		// See https://github.com/WebAudio/web-audio-api/issues/1175#issuecomment-320502059.
		// Otherwise, we cannot start the game again after the first time.
		arrayBuffer = arrayBuffer.slice();
		this.constructor.context.decodeAudioData(arrayBuffer, buffer => {
			this.buffer = buffer;
			this.duration = buffer.duration;
			this.onLoad();
		});
	}

	addLoadListener(listener) {
		this.loadListeners.push(listener);
	}

	addFinishListener(listener) {
		this.finishListeners.push(listener);
	}

	onLoad() {
		for (const listener of this.loadListeners) {
			listener();
		}
	}

	onFinish() {
		for (const listener of this.finishListeners) {
			listener();
		}
	}

	createNodes() {
		const context = this.constructor.context;
		this.sourceNode = context.createBufferSource();
		this.sourceNode.buffer = this.buffer;
		this.sourceNode.playbackRate.setValueAtTime(this.playbackRate, context.currentTime);
		this.gainNode = context.createGain();
		this.gainNode.gain.setValueAtTime(this.volume, context.currentTime);
		this.sourceNode.connect(this.gainNode);
		this.gainNode.connect(context.destination);
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
		this.createNodes();
		this.startTime = this.constructor.context.currentTime - time / this.playbackRate;
		if (time >= 0) {
			this.sourceNode.start(0, time);
		} else {
			this.sourceNode.start(this.startTime, 0);
		}
		this.constructor.playingAudios.push(this);
		const timeToStop = this.startTime + this.duration / this.playbackRate - this.constructor.context.currentTime
		this.stopTimer = setTimeout(() => {
			this.stop();
			this.onFinish();
			this.stopTimer = null;
		}, timeToStop * 1000);
	}

	stop() {
		this.removeNodes();
		this.constructor.removePlayingAudio(this);
		if (this.stopTimer) {
			clearTimeout(this.stopTimer);
			this.stopTimer = null;
		}
	}

	currentTime() {
		return (this.constructor.context.currentTime - this.startTime + Sunniesnow.game.settings.delay / 1000) * this.playbackRate;
	}
};
