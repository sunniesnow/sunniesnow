Sunniesnow.UiEffectsBoard = class UiEffectsBoard {
	constructor(parent, layers) {
		this.parent = parent;
		this.layers = {};
		for (const layer in layers) {
			this.layers[layer] = {ui: layers[layer] instanceof Array ? layers[layer] : [layers[layer]]};
			Sunniesnow.Utils.compactify(this.layers[layer].ui);
		}
		this.containers = new Map();
		this.allEvents = Sunniesnow.game.chart.eventsSortedByAppearTime.filter(event => event instanceof Sunniesnow.EffectMultiple);
		if (Sunniesnow.game.progressAdjustable) {
			this.timeline = Sunniesnow.Utils.eventsTimeline(this.allEvents, e => e.appearTime(), e => e.disappearTime());
		}
		this.clear();
	}

	clear() {
		this.unappearedEvents = this.allEvents.slice();
		this.currentEvents ??= [];
		this.removeAll();
	}

	removeAll() {
		for (const layer in this.layers) {
			this.layers[layer].event = null;
		}
		for (const event of this.currentEvents) {
			const container = this.containers.get(event);
			const index = this.parent.getChildIndex(container);
			for (let i = container.children.length - 1; i >= 0; i--) {
				this.parent.addChildAt(container.children[i], index);
			}
			container.destroy();
			this.containers.delete(event);
		}
		this.currentEvents.length = 0;
	}

	remove(event) {
		this.currentEvents.splice(this.currentEvents.indexOf(event), 1);
		for (const layer of event.layers()) {
			this.layers[layer].event = null;
		}
		const container = this.containers.get(event);
		const index = this.parent.getChildIndex(container);
		for (let i = container.children.length - 1; i >= 0; i--) {
			this.parent.addChildAt(container.children[i], index);
		}
		container.destroy();
		this.containers.delete(event);
	}

	add(event) {
		const layers = event.layers();
		const container = new PIXI.Container();
		let added = false;
		for (const layer of layers) {
			if (this.layers[layer].event) {
				this.remove(this.layers[layer].event);
			}
			this.layers[layer].event = event;
			for (const ui of this.layers[layer].ui) {
				if (!added) {
					this.parent.addChildAt(container, this.parent.getChildIndex(ui));
					added = true;
				}
				container.addChild(ui);
			}
		}
		this.containers.set(event, container);
		this.currentEvents.push(event);
	}

	update(delta) {
		const time = Sunniesnow.Music.currentTime;
		while (this.unappearedEvents.length > 0) {
			const event = this.unappearedEvents[0];
			if (time < event.appearTime()) {
				break;
			}
			this.add(this.unappearedEvents.shift());
		}
		Sunniesnow.Utils.eachWithRedoingIf(this.currentEvents, (event, i) => {
			if (time >= event.disappearTime()) {
				this.remove(event);
				return true;
			}
			this.applyEffects(time, event);
		});
	}

	applyEffects(time, event) {
		const container = this.containers.get(event);
		container.x = event.timeDependentAt('x', time) * Sunniesnow.Config.WIDTH;
		container.y = event.timeDependentAt('y', time) * Sunniesnow.Config.HEIGHT;
		container.pivot.x = event.timeDependentAt('pivotX', time) * Sunniesnow.Config.WIDTH;
		container.pivot.y = event.timeDependentAt('pivotY', time) * Sunniesnow.Config.HEIGHT;
		container.scale.set(event.timeDependentAt('size', time));
		container.scale.x *= event.timeDependentAt('scaleX', time);
		container.scale.y *= event.timeDependentAt('scaleY', time);
		container.skew.x = event.timeDependentAt('skewX', time);
		container.skew.y = event.timeDependentAt('skewY', time);
		container.alpha = event.timeDependentAt('opacity', time);
		container.rotation = event.timeDependentAt('rotation', time);
		container.tint = [
			event.timeDependentAt('tintRed', time),
			event.timeDependentAt('tintGreen', time),
			event.timeDependentAt('tintBlue', time)
		];
		container.blendMode = event.timeDependentAt('blendMode', time);
		container.filters = (container.filters ?? []).filter(f => !(f instanceof Sunniesnow.FilterFromChart)).concat(event.filtersAt(time));
	}

	adjustProgress(time) {
		this.unappearedEvents = this.allEvents.slice(
			Sunniesnow.Utils.bisectLeft(this.allEvents, event => event.appearTime() - time)
		);
		this.removeAll();
		this.timeline[Sunniesnow.Utils.bisectRight(this.timeline, ({time: t}) => t - time)].events.forEach(event => this.add(event));
	}
};
