Sunniesnow.WeakMap = class WeakMap extends globalThis.WeakMap {
	get(key) {
		if (key != null) {
			return super.get(key);
		}
		return this.hasNullValue ? this.nullValue : undefined;
	}

	set(key, value) {
		if (key != null) {
			return super.set(key, value);
		}
		this.hasNullValue = true;
		this.nullValue = value;
		return this;
	}

	has(key) {
		return key == null ? !!this.hasNullValue : super.has(key);
	}

	delete(key) {
		if (key != null) {
			return super.delete(key);
		}
		if (!this.hasNullValue) {
			return false;
		}
		this.hasNullValue = false;
		this.nullValue = undefined;
		return true;
	}
};
