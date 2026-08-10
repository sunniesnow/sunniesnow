Sunniesnow.LevelTap = class LevelTap extends Sunniesnow.LevelNote {
	settingsHitSize() {
		return Sunniesnow.game.settings.noteHitSizeTap;
	}

	hit(touch, time) {
		super.hit(touch, time);
		this.release(time);
	}
};
