Sunniesnow.Image = class Image extends Sunniesnow.Event {
	static PROPERTIES = {
		required: ['filename', 'width', 'duration'],
		optional: {
			height: null,
			x: 0,
			y: 0,
			z: 0,
			anchorX: 0.5,
			anchorY: 0.5
		}
	}

	static TIME_DEPENDENT = {
		x: {},
		y: {},
		z: {interpolable: false},
		opacity: {value: 1},
		width: {},
		height: {nullable: true},
		anchorX: {},
		anchorY: {},
		rotation: {value: 0}
	};

	static UI_CLASS = 'UiImage';
	static TYPE_NAME = 'image';

};
