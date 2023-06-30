Sunniesnow.Hold = class Hold extends Sunniesnow.Note {
	static PROPERTIES = {
		required: ['x', 'y', 'duration'],
		optional: { tipPoint: null, text: '' }
	}

	static UI_CLASS = Sunniesnow.UiHold
	static LEVEL_CLASS = Sunniesnow.LevelHold
	static FX_CLASS = Sunniesnow.FxHold
	static TYPE_NAME = 'hold'
};
