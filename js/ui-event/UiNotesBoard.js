Sunniesnow.UiNotesBoard = class UiNotesBoard extends PIXI.Container {

	constructor(fxBoard, doubleLinesBoard, debugBoard) {
		super();
		this.clear();
		this.fxBoard = fxBoard;
		this.doubleLinesBoard = doubleLinesBoard;
		this.debugBoard = debugBoard;
	}

	clear() {
		this.unappearedEvents = Sunniesnow.game.chart.events.filter(event => event instanceof Sunniesnow.Note);
		this.unappearedEvents.sort((a, b) => a.appearTime() - b.appearTime());
		this.uiEvents ||= [];
		while (this.uiEvents.length > 0) {
			const uiEvent = this.uiEvents.shift();
			uiEvent.destroy({children: true});
			this.removeChild(uiEvent);
		}
	}

	update(delta) {
		const time = Sunniesnow.Music.currentTime;
		while (this.unappearedEvents.length > 0) {
			const event = this.unappearedEvents[0];
			const shouldStartTime = event.appearTime() - Sunniesnow.Config.uiPreparationTime;
			if (time < shouldStartTime) {
				break;
			}
			this.unappearedEvents.shift();
			const uiEvent = event.newUiEvent(this.fxBoard, this.doubleLinesBoard, this.debugBoard);
			Sunniesnow.game.settings.reverseNoteOrder ? this.addChildAt(uiEvent, 0) : this.addChild(uiEvent);
			this.uiEvents.push(uiEvent);
		}
		for (const uiEvent of this.uiEvents) {
			uiEvent.update(time - uiEvent.event.time);
			if (uiEvent.state === 'finished') {
				uiEvent.destroy({children: true});
				this.removeChild(uiEvent);
				this.uiEvents.splice(this.uiEvents.indexOf(uiEvent), 1);
			}
		}
	}
};
