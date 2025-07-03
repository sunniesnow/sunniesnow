Sunniesnow.Mixin = class Mixin {
	static prepend(klassName, mixin) {
		Sunniesnow[klassName] = mixin.prependedBy(Sunniesnow[klassName]);
	}

	constructor(staticAttributes, instanceAttributes) {
		this.staticAttributes = staticAttributes;
		this.instanceAttributes = instanceAttributes;
	}

	prependedBy(klass) {
		const result = class extends klass {};
		Object.defineProperty(result, 'name', Object.getOwnPropertyDescriptor(klass, 'name'));
		Object.assign(result, this.staticAttributes);
		Object.assign(result.prototype, this.instanceAttributes);
		return result;
	}
};
