Sunniesnow.Config = {

	noteRadius() {
		const scale = Math.min(Sunniesnow.game.settings.width / 275, Sunniesnow.game.settings.height / 150);
		return 12.5 * scale;
	},

	// calculate the note active time from the note speed specified by gamer
	fromSpeedToTime(speed) {
		return 1 / speed;
	},

	// the blank time in the start of a level, in seconds
	preperationTime: 1,

	// UI of chart events will be spawned
	// this much time (in seconds) before it actually appears.
	// Must be smaller than preperationTime.
	uiPreperationTime: 0.1,

	// Get coordinates on canvas by providing the coordinates in charts.
	chartMapping(chartX, chartY) {
		const scale = Math.min(Sunniesnow.game.settings.width / 275, Sunniesnow.game.settings.height / 150);
		const x = chartX * scale + Sunniesnow.game.settings.width / 2;
		const y = -chartY * scale + Sunniesnow.game.settings.height / 2;
		return [x, y];
	},

	resumePreperationTime: 3
};
