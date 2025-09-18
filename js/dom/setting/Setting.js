Sunniesnow.Setting = class Setting extends EventTarget {

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
		this.resolves = [];
		this.rejects = [];
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
		this.dispatchEvent(new Event('change'));
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
		this.hooks = (this.element ?? this.elements[0]).dataset.hooks?.split('|').map(descriptor => {
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
			return new hookClass(this, ...hookParams);
		}) ?? [];
	}

	setId(id) {
		if (this.idSuffix && id.endsWith(this.idSuffix)) {
			id = id.slice(0, -this.idSuffix.length);
		}
		this.id = id;
	}

	// The raw value without hooks being applied.
	value() {
		throw new Error('Not implemented');
	}

	// The value used by the game logic, with hooks being applied.
	async get() {
		if (!this.dirty && this.cache != null) {
			return this.cache;
		}
		return this.getWithoutCache();
	}

	async getWithoutCache() {
		if (this.currentHook) {
			return new Promise((resolve, reject) => {
				this.resolves.push(resolve);
				this.rejects.push(reject);
			});
		}
		this.dispatchEvent(new Event('loadstart'));
		let result = this.value();
		for (const hook of this.hooks) {
			if (result == null) {
				return result;
			}
			this.currentHook = hook;
			result = await hook.apply(result);
			if (this.interrupted) {
				this.interrupted = false;
				this.currentHook = null;
				const error = new Error('Interrupted');
				while (this.rejects.length > 0) {
					this.rejects.shift()(error);
				}
				this.resolves.length = 0;
				throw error;
			}
			this.currentHook = null;
		}
		this.cache = result;
		this.dirty = false;
		this.dispatchEvent(new Event('load'));
		while (this.resolves.length > 0) {
			this.resolves.shift()(result);
		}
		this.rejects.length = 0;
		return result;
	}

	interrupt() {
		if (this.currentHook) {
			this.interrupted = true;
			this.currentHook.interrupt();
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
