Sunniesnow.UiBgPattern = class UiBgPattern extends Sunniesnow.UiEvent {
	
	static fadingInDuration(event) {
		return 1/6;
	}

	static fadingOutDuration(event) {
		return 1/6;
	}

	constructor(event) {
		super(event);
	}

	update(relativeTime) {
		[this.x, this.y] = Sunniesnow.Config.chartMapping(
			this.event.timeDependentAtRelative('x', relativeTime),
			this.event.timeDependentAtRelative('y', relativeTime)
		);
		this.transform.rotation = Sunniesnow.Config.chartMappingAngle(this.event.timeDependentAtRelative('rotation', relativeTime));
		this.scale.set(this.event.timeDependentAtRelative('size', relativeTime));
		this.alpha = this.event.timeDependentAtRelative('opacity', relativeTime);
		super.update(relativeTime);
	}
};
