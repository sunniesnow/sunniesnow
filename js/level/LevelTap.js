Sunniesnow.LevelTap = class LevelTap extends Sunniesnow.LevelNote {
	hit(hitData, relativeTime) {
		super.hit(hitData, relativeTime);
		this.release(relativeTime);
	}
};
