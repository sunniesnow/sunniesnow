Sunniesnow.Setting = class Setting extends EventTarget {

	// When calling get() with an override value, a token is created.
	// SettingCollection and SettingList are responsible for attaching values to the tokens,
	// and then other settings can get the value from the token.
	// All maps from token to something should use WeakMap so that the memory can be freed
	// when no one holds the token anymore.
	static Token = class Token {
		constructor() {
			this.values = new Map(); // map from setting to value
		}

		set(setting, value) {
			this.values.set(setting, value);
		}

		get(setting) {
			return this.values.get(setting);
		}
	}

	constructor(collection, element, idSuffix = '') {
		super();
		this.idSuffix = idSuffix;
		this.collection = collection;
		this.element = element;
		this.setId(element.id);
		this.collection?.mapElementIdToSetting.set(element.id, this);
		if (this.element.dataset.loadButton) {
			this.collection?.getElementById(this.element.dataset.loadButton).addEventListener('click', event => this.getWithoutCache());
		}
		this.promiseCallbacks = new Sunniesnow.WeakMap(); // map from token to an array of {resolve, reject} objects
		// Map from token or null to some return value of get().
		// If the cache exists for a non-null token, the cache is never considered dirty.
		// For null token, the dirty mark is stored in this.dirty.
		this.cache = new Sunniesnow.WeakMap();
		this.currentHooks = new Sunniesnow.WeakMap(); // map from token or null to hook
		this.interruptStatus = new Sunniesnow.WeakMap(); // map from token or null to boolean
		// map from token or null to boolean; set this with caution, especially when awaiting while uninterruptible
		this.uninterruptibleStatus = new Sunniesnow.WeakMap();
		this.hooks = [];
		this.postInit();
	}

	// Convenience method for subclasses.
	postInit() {
	}

	// The constructor is the first round.
	// The second round is for things that need to be done after all settings in the collection are loaded.
	secondRound() {
		// set up hooks here because hooks may refer to other settings.
		this.setUpHooks();
	}

	markDirty() {
		this.dirty = true;
		this.interrupt();
		this.dispatch('change');
	}

	dirtyOn(eventName, element = this.element) {
		element.addEventListener(eventName, event => this.markDirty());
	}

	refer(id) {
		if (this.idSuffix && id.endsWith(this.idSuffix)) {
			id = id.slice(0, -this.idSuffix.length);
		}
		return this.collection.mapSettingIdToSetting.get(id);
	}

	setUpHooks() {
		(this.element ?? this.elements[0]).dataset.hooks?.split('|').forEach(descriptor => {
			let hookClass, hookParams;
			const leftParenIndex = descriptor.indexOf('(');
			if (leftParenIndex !== -1 && descriptor.endsWith(')')) {
				hookClass = descriptor.slice(0, leftParenIndex);
				hookParams = descriptor.slice(leftParenIndex + 1, -1).split(',');
			} else {
				hookClass = descriptor;
				hookParams = [];
			}
			hookClass = Sunniesnow[Sunniesnow.Utils.slugToCamel(`Hook-${hookClass}`)];
			this.hooks.push(new hookClass(this, ...hookParams));
		});
	}

	setId(id) {
		if (this.idSuffix && id.endsWith(this.idSuffix)) {
			id = id.slice(0, -this.idSuffix.length);
		}
		this.id = id;
	}

	// The raw value without hooks being applied. Override in subclasses.
	value() {
		throw new Error('Not implemented');
	}

	dispatch(eventName, attributes = {}) {
		this.dispatchEvent(Object.assign(new Event(eventName), attributes));
	}

	ensureToken(tokenOrValueOverride) {
		if (tokenOrValueOverride != null && !(tokenOrValueOverride instanceof Sunniesnow.Setting.Token)) {
			const token = new Sunniesnow.Setting.Token();
			token.set(this, tokenOrValueOverride);
			return token;
		} else {
			return tokenOrValueOverride ?? null;
		}
	}

	// The value used by the game logic, with hooks being applied.
	// Try not to override this method and getWithoutCache() in subclasses.
	async get(tokenOrValueOverride) {
		const token = this.ensureToken(tokenOrValueOverride);
		const cache = this.cache.get(token);
		if (cache != null && (token || !this.dirty)) {
			return cache;
		}
		const result = await this.getWithoutCache(token);
		if (!token) {
			this.dirty = false;
		}
		this.cache.set(token, result);
		return result;
	}

	promise(token) {
		if (!this.promiseCallbacks.has(token)) {
			this.promiseCallbacks.set(token, []);
		}
		return new Promise((resolve, reject) => this.promiseCallbacks.get(token).push({resolve, reject}));
	}

	resolve(token, value) {
		this.dispatch('load', {token, value});
		this.currentHooks.set(token, null);
		const callbacks = this.promiseCallbacks.get(token);
		while (callbacks?.length > 0) {
			callbacks.shift().resolve(value);
		}
		return value;
	}

	reject(token, error) {
		this.currentHooks.set(token, null);
		const callbacks = this.promiseCallbacks.get(token);
		while (callbacks?.length > 0) {
			callbacks.shift().reject(error);
		}
		return error;
	}

	async getWithoutCache(token) {
		if (this.currentHooks.get(token)) {
			return this.promise(token);
		}
		this.dispatch('loadstart', {token});
		let value = token?.get(this) ?? this.value();
		for (const hook of this.hooks) {
			if (value == null) {
				return this.resolve(token, value);
			}
			this.currentHooks.set(token, hook);
			try {
				value = await hook.apply(value, token);
			} catch (error) {
				throw this.reject(token, error);
			}
			if (this.interruptStatus.get(token)) {
				this.interruptStatus.set(token, false);
				throw this.reject(token, new Error('Interrupted'));
			}
		}
		return this.resolve(token, value);
	}

	interrupt(token) {
		if (this.uninterruptibleStatus.get(token)) {
			return;
		}
		token ??= null;
		const hook = this.currentHooks.get(token);
		if (hook) {
			this.interruptStatus.set(token, true);
			hook.interrupt(token);
		}
	}

	// Set the value directly. The value is intended to be of the same type as this.value().
	set(value) {
		throw new Error('Not implemented');
	}

	// The value saved in localStorage.
	async save() {
		return this.value();
	}

	// Load the value from localStorage, nullable.
	load(value) {
		if (value == null || typeof value === 'number' && isNaN(value)) {
			return;
		}
		this.set(value);
	}
};
