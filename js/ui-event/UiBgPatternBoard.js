Sunniesnow.UiBgPatternBoard = class UiBgPatternBoard extends PIXI.Container {

	constructor() {
		super();
		this.allEvents = Sunniesnow.game.chart.eventsSortedByAppearTime.filter(event => event instanceof Sunniesnow.BgPattern)
		this.clear();
	}

	clear() {
		this.unappearedEvents = this.allEvents.slice();
		this.uiEvents ??= [];
		this.removeAll();
	}

	removeAll() {
		while (this.uiEvents.length > 0) {
			this.uiEvents.shift().destroy({children: true});
		}
	}

	update(delta) {
		const time = Sunniesnow.Music.currentTime;
		while (this.unappearedEvents.length > 0) {
			const event = this.unappearedEvents[0];
			const shouldStartTime = event.appearTime() - Sunniesnow.Config.UI_PREPARATION_TIME;
			if (time < shouldStartTime) {
				break;
			}
			this.unappearedEvents.shift();
			this.uiEvents.push(event.newUiEvent());
		}
		Sunniesnow.Utils.eachWithRedoingIf(this.uiEvents, (uiEvent, i) => {
			uiEvent.update(time - uiEvent.event.time);
			if (uiEvent.state === 'finished') {
				uiEvent.destroy({children: true});
				this.uiEvents.splice(i, 1);
				return true;
			}
		});
		// only one bg pattern is allowed to be displayed at the same time
		const index = this.uiEvents.findLastIndex(uiEvent => uiEvent.state !== 'ready');
		if (index > 0) {
			this.addChild(this.uiEvents[index]);
			const deprecated = this.uiEvents.splice(0, index);
			for (const uiEvent of deprecated) {
				uiEvent.destroy({children: true});
			}
		} else if (index === 0 && this.children.indexOf(this.uiEvents[0]) === -1) {
			this.addChild(this.uiEvents[index]);
		}
	}

	adjustProgress(time) {
		this.removeAll();
		let index = Sunniesnow.Utils.bisectLeft(this.allEvents, event => event.appearTime() - time);
		let event = this.allEvents[index - 1];
		if (!event || event.disappearTime() < time) {
			event = this.allEvents[index];
			if (!event || event.appearTime() - Sunniesnow.Config.UI_PREPARATION_TIME > time) {
				event = null;
			} else {
				index++;
			}
		}
		this.unappearedEvents = this.allEvents.slice(index);
		if (event) {
			this.uiEvents = [event.newUiEvent()];
			this.addChild(this.uiEvents[0]);
		}
	}

};
