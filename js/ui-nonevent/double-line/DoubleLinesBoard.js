Sunniesnow.DoubleLinesBoard = class DoubleLinesBoard extends PIXI.Container {

	constructor() {
		super();
		this.clear();
	}

	clear() {
		this.unappearedEvents = Sunniesnow.game.chart.events.filter(event => {
			if (Sunniesnow.game.settings.doubleLineTap && event instanceof Sunniesnow.Tap) {
				return true;
			}
			if (Sunniesnow.game.settings.doubleLineHold && event instanceof Sunniesnow.Hold) {
				return true;
			}
			if (Sunniesnow.game.settings.doubleLineDrag && event instanceof Sunniesnow.Drag) {
				return true;
			}
			if (Sunniesnow.game.settings.doubleLineFlick && event instanceof Sunniesnow.Flick) {
				return true;
			}
			return false;
		});
		for (const child of this.children) {
			child.destroy({children: true});
		}
		this.removeChildren();
	}

	add(doubleLine) {
		this.addChild(doubleLine);
	}

	addNewDoubleLines(time) {
		// this condition breaks if DoubleLine.FADING_IN_DURATION is larger than FADING_IN_DURATION of note plus Sunniesnow.Config.uiPreparationTime
		while (this.unappearedEvents.length > 0 && time >= this.unappearedEvents[0].appearTime() - Sunniesnow.Config.uiPreparationTime) {
			const event = this.unappearedEvents.shift();
			const connectedEvent = event.getConnectedNote();
			if (!connectedEvent) {
				continue;
			}
			const doubleLine = new Sunniesnow.DoubleLine(event, connectedEvent);
			this.add(doubleLine);
		}
	}

	update(delta) {
		const time = Sunniesnow.Music.currentTime;
		this.addNewDoubleLines(time);
		for (const child of this.children) {
			child.update(time - child.event1.time);
			if (child.state === 'finished') {
				child.destroy({children: true});
				this.removeChild(child);
			}
		}
	}

};
