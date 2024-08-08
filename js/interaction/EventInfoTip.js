Sunniesnow.EventInfoTip = {

	init(uiNotesBoard, uiBgNotesBoard, uiBgPatternBoard) {
		this.clear();
		this.uiNotesBoard = uiNotesBoard;
		this.uiBgNotesBoard = uiBgNotesBoard;
		this.uiBgPatternBoard = uiBgPatternBoard;
		this.addListeners();
	},

	clear() {
		this.uiNotesBoard = null;
		this.uiBgNotesBoard = null;
		this.uiBgPatternBoard = null;
		this.removeListeners();
	},

	addListeners() {
		this.startListener = this.onTouch.bind(this);
		Sunniesnow.TouchManager.addStartListener(this.startListener, -20);
	},

	removeListeners() {
		if (!this.startListener) {
			return;
		}
		Sunniesnow.TouchManager.removeStartListener(this.startListener);
		this.startListener = null;
	},

	onTouch(touch) {
		if (!Sunniesnow.Music.pausing || touch.ctrlKey || touch.altKey) {
			return false;
		}
		let event = this.findTouchedNote(touch);
		event ??= this.findTouchedBgNote(touch);
		event ??= this.findTouchedBgPattern(touch);
		if (!event) {
			return false;
		}
		this.showInfoTip(event);
		return true;
	},

	findTouchedNote(touch) {
		let minDistance = Infinity;
		let nearest = null;
		const {canvasX: x, canvasY: y} = touch.start();
		for (const uiEvent of this.uiNotesBoard.uiEvents) {
			if (uiEvent.state === 'ready' || uiEvent.state === 'finished') {
				continue;
			}
			const distance = Math.hypot(uiEvent.x - x, uiEvent.y - y);
			if (distance < minDistance) {
				minDistance = distance;
				nearest = uiEvent;
			}
		}
		if (minDistance < Sunniesnow.Config.NOTE_RADIUS) {
			return nearest;
		}
		return null;
	},

	findTouchedBgNote(touch) {
		let minDistance = Infinity;
		let nearest = null;
		const {canvasX: x, canvasY: y} = touch.start();
		for (const uiEvent of this.uiBgNotesBoard.uiEvents) {
			if (uiEvent.state === 'ready' || uiEvent.state === 'finished') {
				continue;
			}
			const distance = Math.hypot(uiEvent.x - x, uiEvent.y - y);
			if (distance < minDistance) {
				minDistance = distance;
				nearest = uiEvent;
			}
		}
		if (minDistance < Sunniesnow.Config.NOTE_RADIUS) {
			return nearest;
		}
		return null;
	},

	findTouchedBgPattern(touch) {
		return this.uiBgPatternBoard.uiEvents.find(uiEvent => uiEvent.state !== 'ready' && uiEvent.state !== 'finished');
	},

	showInfoTip(uiEvent) {
		const event = uiEvent.event;
		let head = `ev${event.id}`
		if (event.comboIndex) {
			head += ` (cb${event.comboIndex})`;
		}
		Sunniesnow.Logs.info(`${head}: ${JSON.stringify(event.data)}`);
		Sunniesnow.game.debugBoard.addEventInfoTipHighlight(uiEvent);
		Sunniesnow.Sscharter.sendEventInfoTip(event);
	}
};
