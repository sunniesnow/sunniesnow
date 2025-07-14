Sunniesnow.GlobalSpeed = class GlobalSpeed extends Sunniesnow.Event {
	static ABSTRACT = false

	static PROPERTIES = {
		required: ['speed'],
		optional: {}
	}

	static TYPE_NAME = 'globalSpeed'

	disappearTime() {
		// This prevents the event from being stripped in chart.stripEvents().
		return Infinity;
	}
}
