Sunniesnow.Setting = class Setting extends EventTarget {

	constructor(collection, element) {
		super();
		this.collection = collection;
		this.element = element;
		this.setId(element.id);
		this.collection?.mapElementIdToSetting.set(element.id, this);
	}

	// The constructor is the first round.
	// The second round is for things that need to be done after all settings in the collection are loaded.
	secondRound() {
	}

	setId(id) {
		if (this.collection?.inList) {
			const match = id.match(/^(.*?)(-\d+)?$/);
			id = match[1];
		}
		this.id = id;
	}

	// The value used in the game logic.
	get() {
		throw new Error('Not implemented');
	}

	async getAsync(onProgress) {
		return this.get();
	}

	// The value is supposed to be the same type as save() instead of get().
	set(value) {
		throw new Error('Not implemented');
	}

	// The value saved in localStorage.
	save() {
		return this.get();
	}

	async saveAsync() {
		return this.save();
	}

	// Load the value from localStorage, nullable.
	load(value) {
		if (value == null || typeof value === 'number' && isNaN(value)) {
			return;
		}
		this.set(value);
	}
};
