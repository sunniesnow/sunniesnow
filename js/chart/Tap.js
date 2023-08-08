Sunniesnow.Tap = class Tap extends Sunniesnow.Note {
	static PROPERTIES = {
		required: ['x', 'y'],
		optional: {tipPoint: null, text: ''}
	}

	static UI_CLASS = 'UiTap'
	static LEVEL_CLASS = 'LevelTap'
	static FX_CLASS = 'FxTap'
	static SE_CLASS = 'SeTap'
	static TYPE_NAME = 'tap'

	newUiEvent(fxBoard, doubleLinesBoard, debugBoard) {
		const result = super.newUiEvent(fxBoard, doubleLinesBoard, debugBoard);
		const connectedPos = this.getConnectedPos();
		if (connectedPos) {
			result.doubleLine = new Sunniesnow.DoubleLine(result, ...connectedPos);
			doubleLinesBoard.add(result.doubleLine);
		}
		return result;
	}

	getConnectedPos() {
		let match = null;
		for (let i = 0; i < this.simultaneousEvents.length; i++) {
			const event = this.simultaneousEvents[i];
			if (!(event instanceof Sunniesnow.Tap)) {
				continue;
			}
			if (match === this) {
				const [x, y] = Sunniesnow.Config.chartMapping(event.x, event.y);
				const [x0, y0] = Sunniesnow.Config.chartMapping(this.x, this.y);
				return [x0, y0, x, y];
			}
			match = event;
		}
		return null;
	}

};
