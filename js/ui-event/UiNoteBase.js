Sunniesnow.UiNoteBase = class UiNote extends Sunniesnow.UiEvent {

	constructor(event) {
		super(event);
		//this.activeDuration = Sunniesnow.Config.fromSpeedToTime(Sunniesnow.game.settings.speed);
		this.calculateFadingInInstances();
	}

	static fadingInDuration(event) {
		return 1/4; // Sunniesnow.game.settings.scroll ? 0 : 1/4;
	}

	static fadingOutDuration(event) {
		return 2/3;
	}

	calculateFadingInInstances() {
		const {dataPoints, speed} = this.event.timeDependent.circle;
		this.fadingInInstances = Sunniesnow.Utils.solveBrokenLine(dataPoints, -1);
		const {time: t0, value: v0} = dataPoints[0];
		if (v0 > -1 && speed > 0) {
			this.fadingInInstances.unshift({time: t0 + (-1 - v0) / speed, sign: 1})
		}
		this.fadingInInstances.forEach(p => p.relativeTime = p.time - this.event.time);
	}

	updateFadingIn(progress, relativeTime) {
		super.updateFadingIn(progress, relativeTime);
		if (!Sunniesnow.game.settings.scroll) {
			return;
		}
		this.y = Sunniesnow.Config.SCROLL_START_Y;
	}

	updateActive(progress, relativeTime) {
		super.updateActive(progress, relativeTime);
		this.fadingAlpha = Sunniesnow.Config.fadingAlpha(progress, relativeTime);
		if (Sunniesnow.game.settings.scroll) {
			this.y = Sunniesnow.Config.scrollY(progress);
		}
	}

	updateHolding(progress, relativeTime) {
		super.updateHolding(progress, relativeTime);
		this.fadingAlpha = Sunniesnow.Config.fadingAlpha();
		if (Sunniesnow.game.settings.scroll && Sunniesnow.game.settings.autoplay) {
			this.y = Sunniesnow.Config.SCROLL_END_Y;
		}
	}

	updateFadingOut(progress, relativeTime) {
		super.updateFadingOut(progress, relativeTime);
		if (Sunniesnow.game.settings.scroll && Sunniesnow.game.settings.autoplay) {
			this.y = Sunniesnow.Config.SCROLL_END_Y;
		}
	}

	update(relativeTime) {
		this.fadingAlpha = 1; // to be updated in updateActive(); will be used in UiNotesBoard and UiBgNotesBoard
		[this.x, this.y] = Sunniesnow.Config.chartMapping(
			this.event.timeDependentAtRelative('x', relativeTime),
			this.event.timeDependentAtRelative('y', relativeTime)
		);
		this.rotation = Sunniesnow.Config.chartMappingRotation(this.event.timeDependentAtRelative('rotation', relativeTime));
		this.scale.set(this.event.timeDependentAtRelative('size', relativeTime));
		this.alpha = this.event.timeDependentAtRelative('opacity', relativeTime);
		this.tint = [
			this.event.timeDependentAtRelative('tintRed', relativeTime),
			this.event.timeDependentAtRelative('tintGreen', relativeTime),
			this.event.timeDependentAtRelative('tintBlue', relativeTime)
		];
		this.blendMode = this.event.timeDependentAtRelative('blendMode', relativeTime);
		super.update(relativeTime);
		this.alpha *= this.fadingAlpha;
	}

	getBeforeTimeStateByRelativeTime(relativeTime) {
		const circleValue = this.event.timeDependentAtRelative('circle', relativeTime);
		if (circleValue >= -1) {
			return ['active', circleValue + 1];
		}
		const fadingInInstanceIndex = Sunniesnow.Utils.bisectRight(
			this.fadingInInstances,
			({relativeTime: t}) => t - relativeTime
		);
		let delta = Infinity;
		if (fadingInInstanceIndex < this.fadingInInstances.length) {
			delta = Math.min(delta, this.fadingInInstances[fadingInInstanceIndex + 1].relativeTime - relativeTime);
		}
		if (fadingInInstanceIndex >= 0) {
			delta = Math.min(delta, relativeTime - this.fadingInInstances[fadingInInstanceIndex].relativeTime);
		}
		const progress = 1 - delta / this.fadingInDuration();
		return progress >= 0 ? ['fadingIn', progress] : ['ready'];
	}

};
