Sunniesnow.Audio = class Audio {
	static initialize() {
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
		this.playbackRate = Sunniesnow.game.settings.gameSpeed;
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

	onLoad() {
		for (const listener of this.loadListeners) {
			listener();
		}
	}

	createNodes() {
		const context = this.constructor.context;
		this.sourceNode = context.createBufferSource();
		this.sourceNode.buffer = this.buffer;
		this.sourceNode.playbackRate.setValueAtTime(this.playbackRate, context.currentTime);
		this.sourceNode.connect(context.destination);
	}

	removeNodes() {
		if (this.sourceNode) {
			this.sourceNode.stop();
			this.sourceNode.disconnect();
			this.sourceNode = null;
		}
	}

	play(time) {
		time ||= 0;
		this.removeNodes();
		this.createNodes();
		if (time >= 0) {
			this.sourceNode.start(0, time);
		} else {
			this.sourceNode.start(-time / this.playbackRate, 0);
		}
		this.startTime = this.constructor.context.currentTime - time / this.playbackRate;
		this.constructor.playingAudios.push(this);
		const timeToStop = this.startTime + this.duration / this.playbackRate - this.constructor.context.currentTime
		this.stopTimer = setTimeout(() => {
			this.stop();
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
