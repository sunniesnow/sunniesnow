Sunniesnow.LevelNote = class LevelNote {

	static HAS_DURATION = false;
	
	constructor(event) {
		this.event = event;
		this.time = event.time;
		this.endTime = event.time + (event.duration || 0);
		this.hitRelativeTime = null;
		this.releaseRelativeTime = null;
		this.judgement = null;
	}

};
