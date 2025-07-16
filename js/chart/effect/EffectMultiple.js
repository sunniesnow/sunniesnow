Sunniesnow.EffectMultiple = class EffectMultiple extends Sunniesnow.FilterableEvent {
	static ABSTRACT = false

	static PROPERTIES = {
		required: ['duration'],
		optional: {
			from: 'imagesAboveNone',
			to: 'imagesAboveFxFront'
		}
	}

	static TIME_DEPENDENT = {
		x: {value: 0.5},
		y: {value: 0.5},
		opacity: {value: 1},
		pivotX: {value: 0.5},
		pivotY: {value: 0.5},
		size: {value: 1},
		scaleX: {value: 1},
		scaleY: {value: 1},
		skewX: {value: 0},
		skewY: {value: 0},
		rotation: {value: 0},
		tintRed: {value: 1},
		tintGreen: {value: 1},
		tintBlue: {value: 1},
		blendMode: {value: 'normal', interpolable: false}
	}

	static TYPE_NAME = 'effectMultiple'

	static LAYERS = [
		'imagesAboveNone',
		'background',
		'imagesAboveBackground',
		'bgPattern',
		'imagesAboveBgPattern',
		'hud',
		'imagesAboveHud',
		'fx',
		'imagesAboveFx',
		'judgementLine',
		'imagesAboveJudgementLine',
		'bgNotes',
		'imagesAboveBgNotes',
		'notes',
		'imagesAboveNotes',
		'circles',
		'imagesAboveCircles',
		'tipPoints',
		'imagesAboveTipPoints',
		'fxFront',
		'imagesAboveFxFront'
	]

	checkProperties() {
		return super.checkProperties() && this.constructor.LAYERS.includes(this.from) && this.constructor.LAYERS.includes(this.to);
	}

	layers() {
		return this.constructor.LAYERS.slice(
			this.constructor.LAYERS.indexOf(this.from),
			this.constructor.LAYERS.lastIndexOf(this.to) + 1
		);
	}

};
