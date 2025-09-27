Sunniesnow.DoubleLineBase = class DoubleLineBase extends PIXI.Container {

	static FADING_IN_DURATION = 0
	static FADING_OUT_DURATION = 0

	constructor(event1, event2) {
		super();
		this.event1 = event1;
		this.event2 = event2;
		this.levelNote1 = event1.levelNote;
		this.levelNote2 = event2.levelNote;
		this.calculateFadingInInstances();
		this.populate();
	}

	calculateFadingInInstances() {
		const {dataPoints: dataPoints1, speed: speed1} = this.event1.timeDependent.circle;
		const fadingInInstances1 = Sunniesnow.Utils.solveBrokenLine(dataPoints1, -1, speed1);
		let lastSign1 = -Math.sign(speed1) || Math.sign(dataPoints1[0].value);
		const {dataPoints: dataPoints2, speed: speed2} = this.event2.timeDependent.circle;
		const fadingInInstances2 = Sunniesnow.Utils.solveBrokenLine(dataPoints2, -1, speed2);
		let lastSign2 = -Math.sign(speed2) || Math.sign(dataPoints2[0].value);
		this.fadingInInstances = [{time: -Infinity, sign: lastSign1>=0 && lastSign2>=0 ? 1 : -1}];
		for (let index1 = 0, index2 = 0; index1 < fadingInInstances1.length || index2 < fadingInInstances2.length;) {
			let {time: time1, sign: sign1} = fadingInInstances1[index1] ?? {time: Infinity, sign: 0};
			let {time: time2, sign: sign2} = fadingInInstances2[index2] ?? {time: Infinity, sign: 0};
			if (time1 === time2) {
				this.fadingInInstances.push({time: time1, sign: sign1>=0 && sign2>=0 ? 1 : -1});
				lastSign1 = sign1;
				lastSign2 = sign2;
				index1++;
				index2++;
			} else if (time1 < time2) {
				this.fadingInInstances.push({time: time1, sign: sign1>=0 && lastSign2>=0 ? 1 : -1});
				lastSign1 = sign1;
				index1++;
			} else {
				this.fadingInInstances.push({time: time2, sign: lastSign1>=0 && sign2>=0 ? 1 : -1});
				lastSign2 = sign2;
				index2++;
			}
		}
		this.fadingInInstances.forEach(p => p.relativeTime = p.time - this.event1.time);
	}

	populate() {
		this.label = `double-line-${this.event1.id}-${this.event2.id}`;
	}

	update(relativeTime) {
		this.fadingAlpha = 1; // to be updated in updateActive(); will be used in DoubleLinesBoard
		this.updateCoordinates(relativeTime);
		this.updateState(relativeTime);
		switch (this.state) {
			case 'ready':
				// do nothing
				break;
			case 'fadingIn':
				this.updateFadingIn(this.stateProgress, relativeTime);
				break;
			case 'active':
				this.updateActive(this.stateProgress, relativeTime);
				break;
			case 'holding':
				this.updateHolding(relativeTime);
				break;
			case 'fadingOut':
				this.updateFadingOut(this.stateProgress, relativeTime);
				break;
			case 'finished':
				// do nothing
				break;
		}
	}

	getEffectiveReleaseRelativeTimeOfLevelNote(levelNote) {
		return levelNote.event.duration > 0 ? levelNote.hitRelativeTime : levelNote.releaseRelativeTime;
	}

	getEffectiveReleaseRelativeTime() {
		return Math.min(
			this.getEffectiveReleaseRelativeTimeOfLevelNote(this.levelNote1) ?? Infinity,
			this.getEffectiveReleaseRelativeTimeOfLevelNote(this.levelNote2) ?? Infinity
		);
	}

	getStateByRelativeTime(relativeTime) {
		const releaseRelativeTime = this.getEffectiveReleaseRelativeTime();
		if (relativeTime >= releaseRelativeTime + this.constructor.FADING_OUT_DURATION) {
			return ['finished'];
		} else if (relativeTime >= releaseRelativeTime) {
			return ['fadingOut', (relativeTime - releaseRelativeTime) / this.constructor.FADING_OUT_DURATION];
		} else if (releaseRelativeTime !== Infinity) { // me after 2 years: why is this clause needed???
			return ['finished'];
		} else if (relativeTime >= 0) {
			return ['holding'];
		}
		const fadingInInstanceIndex = Sunniesnow.Utils.bisectRight(
			this.fadingInInstances,
			({relativeTime: t}) => t - relativeTime
		);
		const {relativeTime: t1, sign} = this.fadingInInstances[fadingInInstanceIndex] ?? {relativeTime: -Infinity};
		if (sign > 0) {
			return ['active', Sunniesnow.Utils.mean(
				this.event1.timeDependentAtRelative('circle', relativeTime),
				this.event2.timeDependentAtRelative('circle', relativeTime)
			)];
		}
		const {relativeTime: t2} = this.fadingInInstances[fadingInInstanceIndex + 1] ?? {relativeTime: Infinity};
		const progress = 1 - Math.min(relativeTime - t1, t2 - relativeTime) / this.constructor.FADING_IN_DURATION;
		return progress >= 0 ? ['fadingIn', progress] : ['ready'];
	}

	updateCoordinates(relativeTime) {
		if (this.event1.uiEvent?.parent) {
			this.x1 = this.event1.uiEvent.x;
			this.y1 = this.event1.uiEvent.y;
		}
		if (this.event2.uiEvent?.parent) {
			this.x2 = this.event2.uiEvent.x;
			this.y2 = this.event2.uiEvent.y;
		}
	}

	updateState(relativeTime) {
		[this.state, this.stateProgress] = this.getStateByRelativeTime(relativeTime);
		this.visible = this.state !== 'ready' && this.state !== 'finished';
	}

	updateFadingIn(progress, relativeTime) {
	}

	updateFadingOut(progress, relativeTime) {
		this.fadingAlpha = Sunniesnow.Config.fadingAlpha();
	}

	updateActive(progress, relativeTime) {
		this.fadingAlpha = Sunniesnow.Config.fadingAlpha(progress, relativeTime);
	}

	updateHolding(relativeTime) {
		this.fadingAlpha = Sunniesnow.Config.fadingAlpha();
	}
};
