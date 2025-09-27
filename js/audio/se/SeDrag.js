Object.setPrototypeOf(Sunniesnow.SeDrag = {
	async load() {
		const duration = 0.3;
		const context = Sunniesnow.Audio.context;
		this.buffer = context.createBuffer(1, duration * context.sampleRate, context.sampleRate);
		const data = this.buffer.getChannelData(0);
		for (let i = 0; i < data.length; i++) {
			const t = i / context.sampleRate;
			data[i] = 0.45*Math.sin(2*Math.PI*0.0008/(t+0.006)**2) * Math.exp(-35*t);
		}
		this.audio = new Sunniesnow.Audio(this.buffer, Sunniesnow.game.settings.volumeSe);
	},

	hit(id, when) {
	},

	release(id, when) {
		super.hit(id, when);
	}
}, Sunniesnow.SeTap);
