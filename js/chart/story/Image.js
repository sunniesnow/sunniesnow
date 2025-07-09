Sunniesnow.Image = class Image extends Sunniesnow.Event {
	static PROPERTIES = {
		required: ['filename', 'width', 'duration'],
		optional: {
			height: null,
			x: 0,
			y: 0
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
		rotation: {value: 0}
	};

	static UI_CLASS = 'UiImage';
	static TYPE_NAME = 'image';

};
