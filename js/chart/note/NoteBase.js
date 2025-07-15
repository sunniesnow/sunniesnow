Sunniesnow.NoteBase = class NoteBase extends Sunniesnow.FilterableEvent {
	static TIME_DEPENDENT = {
		x: {},
		y: {},
		circle: {speed: 1, value: 0},
		opacity: {value: 1},
		size: {},
		rotation: {value: 0},
		tintRed: {value: 1},
		tintGreen: {value: 1},
		tintBlue: {value: 1},
		blendMode: {value: 'normal', interpolable: false}
	}

	static UI_CLASS = 'UiNoteBase'
	static LEVEL_CLASS = 'LevelNoteBase'
	static TYPE_NAME = 'noteBase'

	appearTime() {
		const {speed, dataPoints} = this.timeDependent.circle;
		if (speed < 0) {
			return -Infinity;
		}
		const fadingInDuration = this.uiClass().fadingInDuration(this);
		const {time: t0, value: v0} = dataPoints[0];
		if (v0 >= -1) {
			return speed === 0 ? -Infinity : t0 - (v0 - -1) / speed - fadingInDuration;
		}
		for (let i = 0; i < dataPoints.length - 1; i++) {
			const {time: t1, value: v1} = dataPoints[i];
			const {time: t2, value: v2} = dataPoints[i + 1];
			if (v1 <= -1 && v2 >= -1) {
				return (v1 === v2 ? t1 : t1 + (-1 - v1) / (v2 - v1) * (t2 - t1)) - fadingInDuration;
			}
		}
		return super.appearTime();
	}

	checkProperties() {
		return super.checkProperties() && this.assertType("x", "number") && this.assertType("y", "number");
	}

	hasText() {
		return !!this.timeDependent.text?.dataPoints.some(({value}) => value);
	}
};
