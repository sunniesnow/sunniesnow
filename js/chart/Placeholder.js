Sunniesnow.Placeholder = class Placeholder extends Sunniesnow.Event {
	static PROPERTIES = {
		required: ['x', 'y'],
		optional: {tipPoint: null}
	}
	static TYPE_NAME = 'placeholder'

	checkProperties() {
		return super.checkProperties() && this.assertType("x", "number") && this.assertType("y", "number");
	}
};
