Sunniesnow.HookSpaceList = class HookSpaceList extends Sunniesnow.Hook {
	initialize(spaceReplacement = ' ') {
		this.spaceReplacement = spaceReplacement;
	}

	async apply(value, token) {
		const result = value.split(' ');
		if (result.length === 1 && result[0] === '') {
			return [];
		}
		for (let i = 0; i < result.length; i++) {
			if (result[i] === this.spaceReplacement) {
				result[i] = ' ';
			}
		}
		return result;
	}
};
