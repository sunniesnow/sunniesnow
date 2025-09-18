Sunniesnow.LevelTap = class LevelTap extends Sunniesnow.LevelNote {
	hit(touch, time) {
		super.hit(touch, time);
		this.release(time);
	}
};
