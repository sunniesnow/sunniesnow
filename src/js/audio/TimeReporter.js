addEventListener('message', event => {
	const sharedArray = new BigInt64Array(event.data.sharedBuffer);
	while (true) {
		Atomics.wait(sharedArray, 0, Atomics.load(sharedArray, 0));
		Atomics.store(sharedArray, 1, BigInt(Math.round((performance.now() + performance.timeOrigin) * 1000)));
	}
});
