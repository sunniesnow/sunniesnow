Sunniesnow.Image = class Image extends Sunniesnow.Event {
	static ABSTRACT = false

	static PROPERTIES = {
		required: ['filename', 'width', 'duration'],
		optional: {
			height: null,
			x: 0,
			y: 0,
			above: 'bgPattern'
		}
	}

	static TIME_DEPENDENT = {
		x: {},
		y: {},
		z: {interpolable: false, value: 0},
		opacity: {value: 1},
		width: {},
		height: {nullable: true},
		anchorX: {value: 0.5},
		anchorY: {value: 0.5},
		rotation: {value: 0},
		tintRed: {value: 1},
		tintGreen: {value: 1},
		tintBlue: {value: 1},
		blendMode: {value: 'normal', interpolable: false}
	};

	static UI_CLASS = 'UiImage'
	static TYPE_NAME = 'image'

	static LAYER_ABOVE = [
		'none',
		'background',
		'bgPattern',
		'hud',
		'fx',
		'judgementLine',
		'bgNotes',
		'notes',
		'circles',
		'tipPoints',
		'fxFront'
	]

	checkProperties() {
		return super.checkProperties() && this.constructor.LAYER_ABOVE.includes(this.above);
	}

};
