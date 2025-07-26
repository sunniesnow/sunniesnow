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
		if (touch.id.startsWith('key-') && this.currentEvent) {
			for (const key of ['1', '2', '3', '4', '5']) {
				if (touch.id === `key-${key}`) {
					this.makeText(this.currentEvent, key);
					return true;
				}
			}
		}
		let event = this.findTouchedNote(touch);
		event ??= this.findTouchedBgNote(touch);
		event ??= this.findTouchedBgPattern(touch);
		if (!event) {
			return false;
		}
		this.showInfoTip(event);

		event = event.event;
		if (!(event instanceof Sunniesnow.Note)) {
			return true;
		}
		if (touch.id === 'mouse-0') {
			this.makeTint(event, 0.3, 0.3, 1);
		} else if (touch.id === 'mouse-2') {
			this.makeTint(event, 1, 0.3, 0.3);
		}
		this.currentEvent = event;
		return true;
	},

	makeTint(event, r, g, b) {
		const timeDependent = event.timeDependent;
		const common = {interpolable: true, speed: 0, nullable: false, omitted: false};
		timeDependent.tintRed = {...common, dataPoints: [{time: event.time, value: r}], value: r};
		timeDependent.tintGreen = {...common, dataPoints: [{time: event.time, value: g}], value: g};
		timeDependent.tintBlue = {...common, dataPoints: [{time: event.time, value: b}], value: b};
		const data = event.data.timeDependent ??= {};
		data.tintRed = {value: r};
		data.tintGreen = {value: g};
		data.tintBlue = {value: b};
	},

	makeText(event, text) {
		if (event instanceof Sunniesnow.Drag) {
			return;
		}
		event.text = text;
		const timeDependent = event.timeDependent;
		const common = {interpolable: false, nullable: false, omitted: false};
		timeDependent.text = {...common, dataPoints: [{time: -Infinity, value: text}], value: text};
		event.data.properties.text = text;
	},

	findTouchedNote(touch) {
		if (!this.uiNotesBoard) {
			return null;
		}
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
		if (!this.uiBgNotesBoard) {
			return null;
		}
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
		return this.uiBgPatternBoard?.uiEvents.find(uiEvent => uiEvent.state !== 'ready' && uiEvent.state !== 'finished');
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
