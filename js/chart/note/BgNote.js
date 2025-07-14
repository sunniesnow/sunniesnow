Sunniesnow.BgNote = class BgNote extends Sunniesnow.NoteBase {
	static ABSTRACT = false

	static PROPERTIES = {
		required: ['x', 'y'],
		optional: {tipPoint: null, text: '', duration: 0, size: 1}
	}

	static TIME_DEPENDENT = {
		...Sunniesnow.NoteBase.TIME_DEPENDENT,
		text: {interpolable: false},
	}

	static UI_CLASS = 'UiBgNote'
	static TYPE_NAME = 'bgNote'

};
