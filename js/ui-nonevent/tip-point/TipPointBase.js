Sunniesnow.TipPointBase = class TipPointBase extends PIXI.Container {

	static ACTIVE_DURATION = 0;
	static ZOOMING_IN_DURATION = 0;
	static ZOOMING_OUT_DURATION = 0;
	static REMNANT_DURATION = 0;

	constructor(events, effects) {
		super();
		this.pivot.set(Sunniesnow.Config.WIDTH / 2, Sunniesnow.Config.HEIGHT / 2);
		this.events = events;
		this.allEffects = effects;
		if (Sunniesnow.game.progressAdjustable) {
			this.effectsTimeline = Sunniesnow.Utils.eventsTimeline(this.allEffects, e => e.appearTime(), e => e.disappearTime());
		}
		this.clearEffects();
		this.checkpoints = events.map((event, i) => {
			const checkpoint = {time: event.time, index: i};
			[checkpoint.x, checkpoint.y] = Sunniesnow.Config.chartMapping(event.x, event.y);
			return checkpoint;
		});
		this.startTime = this.checkpoints[0].time;
		this.endTime = this.checkpoints[this.checkpoints.length - 1].time;
		// ready -> active -> zoomingIn -> holding -> zoomingOut -> remnant -> finished
		this.state = 'ready';
		this.populate();
	}

	static async load() {
	}

	clearEffects() {
		this.unappearedEffects = this.allEffects.slice();
		this.currentEffects ??= [];
		this.removeAllEffects();
	}

	removeAllEffects() {
		this.currentEffects.length = 0;
	}

	populate() {
	}

	update(time) {
		this.updateEffects(time);
		this.updateState(time);
		switch (this.state) {
			case 'active':
				this.updateActive(time);
				break;
			case 'zoomingIn':
				this.updateZoomingIn(time);
				break;
			case 'holding':
				this.updateHolding(time);
				break;
			case 'zoomingOut':
				this.updateZoomingOut(time);
				break;
			case 'remnant':
				this.updateRemnant(time);
				break;
		}
	}

	updateEffects(time) {
		while (this.unappearedEffects.length > 0) {
			const effect = this.unappearedEffects[0];
			const shouldStartTime = effect.appearTime();
			if (time < shouldStartTime) {
				break;
			}
			this.currentEffects.push(this.unappearedEffects.shift());
		}
		Sunniesnow.Utils.eachWithRedoingIf(this.currentEffects, (effect, i) => {
			if (time >= effect.disappearTime()) {
				this.currentEffects.splice(i, 1);
				return true;
			}
		});
		this.applyEffects(time);
	}

	applyEffects(time) {
		let x, y, size, opacity, rotation, tintRed, tintGreen, tintBlue, blendMode;
		for (const effect of this.currentEffects) {
			x = effect.timeDependentAt('x', time) ?? x;
			y = effect.timeDependentAt('y', time) ?? y;
			size = effect.timeDependentAt('size', time) ?? size;
			opacity = effect.timeDependentAt('opacity', time) ?? opacity;
			rotation = effect.timeDependentAt('rotation', time) ?? rotation;
			tintRed = effect.timeDependentAt('tintRed', time) ?? tintRed;
			tintGreen = effect.timeDependentAt('tintGreen', time) ?? tintGreen
			tintBlue = effect.timeDependentAt('tintBlue', time) ?? tintBlue;
			blendMode = effect.timeDependentAt('blendMode', time) ?? blendMode;
		}
		x ??= 0;
		y ??= 0;
		this.position.set(...Sunniesnow.Config.chartMapping(x, y));
		this.alpha = opacity ?? 1;
		this.rotation = rotation ?? 0;
		this.scale.set(size ?? 1);
		this.tint = [tintRed ?? 1, tintGreen ?? 1, tintBlue ?? 1];
		this.blendMode = blendMode ?? 'normal';
	}

	updateState(time) {
		const sinceStart = time - this.startTime;
		const sinceEnd = time - this.endTime;
		if (sinceStart < -this.constructor.ACTIVE_DURATION) {
			this.visible = false;
			this.state = 'ready';
		} else if (sinceStart < 0) {
			this.visible = true;
			this.state = 'active';
		} else if (sinceStart < this.constructor.ZOOMING_IN_DURATION) {
			this.visible = true;
			this.state = 'zoomingIn';
		} else if (sinceEnd > Math.max(this.constructor.REMNANT_DURATION, this.constructor.ZOOMING_OUT_DURATION)) {
			this.visible = false;
			this.state = 'finished';
		} else if (sinceEnd > this.constructor.ZOOMING_OUT_DURATION) {
			this.visible = true;
			this.state = 'remnant';
		} else if (sinceEnd > 0) {
			this.visible = true;
			this.state = 'zoomingOut';
		} else {
			this.visible = true;
			this.state = 'holding';
		}
	}

	updateActive(time) {
	}

	updateZoomingIn(time) {
	}

	updateHolding(time) {
	}

	updateZoomingOut(time) {
	}

	updateRemnant(time) {
	}

	adjustProgress(time) {
		this.unappearedEffects = this.allEffects.slice(
			Sunniesnow.Utils.bisectLeft(this.allEffects, event => event.appearTime() - time)
		);
		this.removeAllEffects();
		let currentEffects = this.effectsTimeline[Sunniesnow.Utils.bisectRight(this.effectsTimeline, ({time: t}) => t - time)].events;
		currentEffects.forEach(effect => this.currentEffects.push(effect));
		this.applyEffects(time);
	}

};
