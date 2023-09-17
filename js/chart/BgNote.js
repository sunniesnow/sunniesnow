Sunniesnow.BgNote = class BgNote extends Sunniesnow.NoteBase {
	static PROPERTIES = {
		required: ['x', 'y'],
		optional: {tipPoint: null, text: '', duration: 0}
	}

	static UI_CLASS = 'UiBgNote'
	static TYPE_NAME = 'bgNote'

};
