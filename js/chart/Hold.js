Sunniesnow.Hold = class Hold extends Sunniesnow.Note {
	static PROPERTIES = {
		required: ['x', 'y', 'duration'],
		optional: { tipPoint: null, text: '' }
	}

	static UI_CLASS = 'UiHold'
	static LEVEL_CLASS = 'LevelHold'
	static FX_CLASS = 'FxHold'
	static SE_CLASS = 'SeHold'
	static TYPE_NAME = 'hold'
};
