Object.setPrototypeOf(Sunniesnow.SeTap = {
	async load() {
		const duration = 0.3;
		const context = Sunniesnow.Audio.context;
		this.buffer = context.createBuffer(1, duration*context.sampleRate, context.sampleRate);
		const data = this.buffer.getChannelData(0);
		for (let i = 0; i < data.length; i++) {
			const t = i / context.sampleRate;
			data[i] = (
				0.4*Math.sin(2*Math.PI*0.1/(t+0.005)) +
				0.6*Math.sin(2*Math.PI*0.12/(t+0.01))
			) * Math.exp(-40*t);
		}
		this.audio = new Sunniesnow.Audio(this.buffer, Sunniesnow.game.settings.volumeSe);
	},

	hit(id, when) {
		this.audio.spawn(when);
	}
}, Sunniesnow.Se);
