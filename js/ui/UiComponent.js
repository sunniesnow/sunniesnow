Sunniesnow.UiComponent = class UiComponent extends PIXI.Container {

	static EFFECT_EVENT_CLASS = 'EffectUiComponent';
	static DEFAULT_X = 0;
	static DEFAULT_Y = 0;

	static async load() {
	}
	
	constructor() {
		super();
		this.allEffects = Sunniesnow.game.chart.eventsSortedByAppearTime.filter(event => event instanceof Sunniesnow[this.constructor.EFFECT_EVENT_CLASS]);
		if (Sunniesnow.game.progressAdjustable) {
			this.effectsTimeline = Sunniesnow.Utils.eventsTimeline(this.allEffects, e => e.appearTime(), e => e.disappearTime());
		}
		this.clearEffects();
		this.populate();
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

	update(delta, data) {
		const time = Sunniesnow.Music.currentTime;
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
		this.privateUpdate(delta, this.currentEffects[this.currentEffects.length - 1]?.timeDependentAt('data', time) ?? data);
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
		this.x = (x ?? this.constructor.DEFAULT_X) * Sunniesnow.Config.WIDTH;
		this.y = (y ?? this.constructor.DEFAULT_Y) * Sunniesnow.Config.HEIGHT;
		this.alpha = opacity ?? 1;
		this.transform.rotation = rotation ?? 0;
		this.scale.set(size ?? 1);
		this.tint = [tintRed ?? 1, tintGreen ?? 1, tintBlue ?? 1];
		this.blendMode = blendMode ?? 'normal';
	}

	privateUpdate(delta, data) {
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
