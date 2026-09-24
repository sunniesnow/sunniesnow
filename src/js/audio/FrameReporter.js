registerProcessor('frame-reporter', class extends AudioWorkletProcessor {
	constructor(options) {
		super(options);
		this.sharedArray = new BigInt64Array(options.processorOptions.sharedBuffer);
	}

	process(inputs, outputs, parameters) {
		Atomics.store(this.sharedArray, 0, BigInt(currentFrame));
		Atomics.notify(this.sharedArray, 0);
		return true;
	}
});
