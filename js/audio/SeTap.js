Object.setPrototypeOf(Sunniesnow.SeTap = {
	async load() {
		const duration = 0.3;
		const context = Sunniesnow.Audio.context;
		this.buffer = context.createBuffer(1, duration*context.sampleRate, context.sampleRate);
		const data = this.buffer.getChannelData(0);
		for (let i = 0; i < data.length; i++) {
			const t = i / context.sampleRate;
			data[i] = Math.sin(2*Math.PI * 0.1/(t+0.006)) * Math.exp(-t * 40);
		}
		this.audio = new Sunniesnow.Audio(this.buffer, Sunniesnow.game.settings.volumeSe);
	},

	hit(id, when) {
		this.audio.spawn(when);
	}
}, Sunniesnow.Se);
