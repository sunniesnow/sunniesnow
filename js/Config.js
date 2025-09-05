Sunniesnow.Config = {

	async load() {
		this.loadLengthDimensions();
		this.loadJudgementWindows();
		this.loadAccuracies();
	},

	loadLengthDimensions() {
		this.WIDTH = Sunniesnow.game.settings.width;
		this.HEIGHT = Sunniesnow.game.settings.height;
		this.SCALE = Math.min(
			this.WIDTH / this.MIN_WIDTH,
			this.HEIGHT / this.MIN_HEIGHT
		);
		// unit: pixels
		this.NOTE_RADIUS = this.RADIUS * this.SCALE * Sunniesnow.game.settings.noteSize;
		this.SCROLL_END_Y = Sunniesnow.game.settings.scrollJudgementLine * this.HEIGHT;
		this.SCROLL_START_Y = this.SCROLL_END_Y - Sunniesnow.game.settings.scrollDistance * this.HEIGHT;
		this.SCROLL_SPEED = Sunniesnow.game.settings.speed * Sunniesnow.game.settings.scrollDistance * this.HEIGHT;
	},

	loadJudgementWindows() {
		if (Sunniesnow.game.settings.judgementWindows !== 'custom') {
			this.JUDGEMENT_WINDOWS = (Sunniesnow.game.settings.lyrica5 ? this.JUDGEMENT_WINDOWS_5 : this.JUDGEMENT_WINDOWS_4)[Sunniesnow.game.settings.judgementWindows];
			return;
		}
		this.JUDGEMENT_WINDOWS = {};
		for (const noteType of ['tap', 'drag', 'flick', 'hold']) {
			this.JUDGEMENT_WINDOWS[noteType] = {};
			let lastEarly = Infinity;
			let lastLate = -Infinity;
			for (const judgement of ['perfect', 'good', 'bad']) {
				let early = Sunniesnow.game.settings[Sunniesnow.Utils.slugToCamel(`judgement-windows-custom-${noteType}-early-${judgement}`)];
				let late = Sunniesnow.game.settings[Sunniesnow.Utils.slugToCamel(`judgement-windows-custom-${noteType}-late-${judgement}`)];
				if (early >= late) {
					Sunniesnow.Logs.warn(`Illegal custom judgement window: ${noteType} ${judgement} interval is empty`);
					early = late = (early + late) / 2;
				}
				if (early > lastEarly) {
					Sunniesnow.Logs.warn(`Illegal custom judgement window: ${noteType} early ${judgement} is narrower than the inner judgement window`);
					early = lastEarly;
				}
				if (late < lastLate) {
					Sunniesnow.Logs.warn(`Illegal custom judgement window: ${noteType} late ${judgement} is narrower than the inner judgement window`);
					late = lastLate;
				}
				this.JUDGEMENT_WINDOWS[noteType][judgement] = [lastEarly = early, lastLate = late];
			}
		}
		let perfect = Sunniesnow.game.settings.judgementWindowsCustomHoldEndEarlyPerfect
		let good = Sunniesnow.game.settings.judgementWindowsCustomHoldEndEarlyGood;
		if (perfect < good) {
			Sunniesnow.Logs.warn(`Illegal custom judgement window: hold end early good interval is narrower than the inner interval`);
			good = perfect;
		}
		this.JUDGEMENT_WINDOWS['holdEnd'] = {perfect, good, bad: -Infinity};
	},

	loadAccuracies() {
		this.ACCURACIES = Sunniesnow.game.settings.lyrica5 ? this.ACCURACIES_5 : this.ACCURACIES_4;
	},

	// calculate the note active time from the note speed specified by gamer
	fromSpeedToTime(speed) {
		return 1 / speed;
	},

	// UI of chart events will be spawned
	// this much time (in seconds) before it actually appears.
	// Must be smaller than preparationTime.
	UI_PREPARATION_TIME: 0.1,

	// Note radius in chart coordinate length units.
	// This is used for calculating judgement space window.
	RADIUS: 12.5,

	// The minimum width of the visible part of a chart.
	// The unit is chart coordinates length unit.
	// It is guaranteed that x chart coordinates within [-w/2, w/2] is inside the screen.
	// Similarly for height.
	MIN_WIDTH: 275,
	MIN_HEIGHT: 150,

	// Get coordinates on canvas by providing the coordinates in charts.
	chartMapping(chartX, chartY) {
		if (Sunniesnow.game.settings.horizontalFlip) {
			chartX = -chartX;
		}
		if (Sunniesnow.game.settings.verticalFlip) {
			chartY = -chartY;
		}
		const x = chartX * this.SCALE + this.WIDTH / 2;
		const y = -chartY * this.SCALE + this.HEIGHT / 2;
		return [x, y];
	},

	// Get coordinates on chart and canvas by providing the page coordinates.
	pageMapping(pageX, pageY) {
		const [canvasX, canvasY] = Sunniesnow.Utils.pageToCanvasCoordinates(pageX, pageY, Sunniesnow.game.canvas);
		let chartX = (canvasX - this.WIDTH / 2) / this.SCALE;
		let chartY = -(canvasY - this.HEIGHT / 2) / this.SCALE;
		if (Sunniesnow.game.settings.horizontalFlip) {
			chartX = -chartX;
		}
		if (Sunniesnow.game.settings.verticalFlip) {
			chartY = -chartY;
		}
		return [chartX, chartY, canvasX, canvasY];
	},

	chartMappingAngle(angle) {
		if (!Sunniesnow.game.settings.verticalFlip) {
			angle = -angle;
		}
		if (Sunniesnow.game.settings.horizontalFlip) {
			angle = Math.PI - angle;
		}
		return angle;
	},

	chartMappingRotation(rotation) {
		if (!Sunniesnow.game.settings.verticalFlip) {
			rotation = -rotation;
		}
		if (Sunniesnow.game.settings.horizontalFlip) {
			rotation = -rotation;
		}
		return rotation;
	},

	scrollY(progress) {
		return this.SCROLL_START_Y + (this.SCROLL_END_Y - this.SCROLL_START_Y) * progress;
	},

	fadingAlpha(progress = 1, relativeTime = 0) {
		let fadingProgress;
		if (Sunniesnow.game.settings.speed === 0) {
			fadingProgress = (relativeTime - Math.log(Sunniesnow.game.settings.fadingStart)) / Sunniesnow.game.settings.fadingDuration;
		} else {
			progress = Sunniesnow.Utils.clamp(progress, -Infinity, 1);
			fadingProgress = (progress - Sunniesnow.game.settings.fadingStart) / Sunniesnow.game.settings.fadingDuration;
		}
		return Sunniesnow.Utils.clamp(1 - fadingProgress, 0, 1);
	},

	JUDGEMENT_WINDOWS_4: {
		loose: {
			tap: {
				perfect: [-0.12, 0.12],
				good: [-0.3, 0.3],
				bad: [-0.4, 0.4]
			},
			drag: {
				perfect: [-0.12, 0.12],
				good: [-0.3, 0.3],
				bad: [-0.4, 0.4]
			},
			flick: {
				perfect: [-0.3, 0.12],
				good: [-0.4, 0.3],
				bad: [-0.4, 0.4],
			},
			hold: {
				perfect: [-0.4, 0.4],
				good: [-0.4, 0.4],
				bad: [-0.4, 0.4]
			},
			holdEnd: {
				perfect: 0.7,
				good: 0.4,
				bad: -Infinity
			}
		},
		medium: {
			tap: {
				perfect: [-0.08, 0.08],
				good: [-0.16, 0.16],
				bad: [-0.24, 0.24]
			},
			drag: {
				perfect: [-0.12, 0.12],
				good: [-0.24, 0.24],
				bad: [-0.24, 0.24]
			},
			flick: {
				perfect: [-0.12, 0.12],
				good: [-0.18, 0.18],
				bad: [-0.24, 0.24]
			},
			hold: {
				perfect: [-0.12, 0.12],
				good: [-0.24, 0.24],
				bad: [-0.24, 0.24]
			},
			holdEnd: {
				perfect: 0.7,
				good: 0.7,
				bad: -Infinity
			}
		},
		strict: {
			tap: {
				perfect: [-0.05, 0.05],
				good: [-0.1, 0.1],
				bad: [-0.15, 0.15]
			},
			drag: {
				perfect: [-0.1, 0.1],
				good: [-0.15, 0.15],
				bad: [-0.15, 0.15]
			},
			flick: {
				perfect: [-0.05, 0.05],
				good: [-0.1, 0.1],
				bad: [-0.15, 0.15]
			},
			hold: {
				perfect: [-0.05, 0.05],
				good: [-0.1, 0.1],
				bad: [-0.15, 0.15]
			},
			holdEnd: {
				perfect: 0.8,
				good: 0.8,
				bad: -Infinity
			}
		},
		rigorous: {
			tap: {
				perfect: [-0.03, 0.03],
				good: [-0.06, 0.06],
				bad: [-0.1, 0.1]
			},
			drag: {
				perfect: [-0.08, 0.08],
				good: [-0.12, 0.12],
				bad: [-0.12, 0.12]
			},
			flick: {
				perfect: [-0.03, 0.03],
				good: [-0.06, 0.06],
				bad: [-0.1, 0.1]
			},
			hold: {
				perfect: [-0.03, 0.03],
				good: [-0.06, 0.06],
				bad: [-0.1, 0.1]
			},
			holdEnd: {
				perfect: 0.8,
				good: 0.8,
				bad: -Infinity
			}
		}
	},

	JUDGEMENT_WINDOWS_5: {
		loose: {
			tap: {
				perfect: [-0.11, 0.15],
				good: [-0.3, 0.3],
				bad: [-0.4, 0.4]
			},
			drag: {
				perfect: [-0.4, 0.4],
				good: [-0.4, 0.4],
				bad: [-0.4, 0.4]
			},
			flick: {
				perfect: [-0.3, 0.15],
				good: [-0.4, 0.3],
				bad: [-0.4, 0.4],
			},
			hold: {
				perfect: [-0.4, 0.4],
				good: [-0.4, 0.4],
				bad: [-0.4, 0.4]
			},
			holdEnd: {
				perfect: 0.7,
				good: 0.4,
				bad: -Infinity
			}
		},
		medium: {
			tap: {
				perfect: [-0.08, 0.08],
				good: [-0.16, 0.16],
				bad: [-0.24, 0.24]
			},
			drag: {
				perfect: [-0.24, 0.24],
				good: [-0.24, 0.24],
				bad: [-0.24, 0.24]
			},
			flick: {
				perfect: [-0.11, 0.11],
				good: [-0.18, 0.18],
				bad: [-0.24, 0.24]
			},
			hold: {
				perfect: [-0.11, 0.11],
				good: [-0.24, 0.24],
				bad: [-0.24, 0.24]
			},
			holdEnd: {
				perfect: 0.7,
				good: 0.7,
				bad: -Infinity
			}
		},
		strict: {
			tap: {
				perfect: [-0.05, 0.05],
				good: [-0.1, 0.1],
				bad: [-0.15, 0.15]
			},
			drag: {
				perfect: [-0.15, 0.15],
				good: [-0.15, 0.15],
				bad: [-0.15, 0.15]
			},
			flick: {
				perfect: [-0.05, 0.05],
				good: [-0.1, 0.1],
				bad: [-0.15, 0.15]
			},
			hold: {
				perfect: [-0.05, 0.05],
				good: [-0.1, 0.1],
				bad: [-0.15, 0.15]
			},
			holdEnd: {
				perfect: 0.8,
				good: 0.8,
				bad: -Infinity
			}
		},
		rigorous: {
			tap: {
				perfect: [-0.03, 0.03],
				good: [-0.06, 0.06],
				bad: [-0.1, 0.1]
			},
			drag: {
				perfect: [-0.12, 0.12],
				good: [-0.12, 0.12],
				bad: [-0.12, 0.12]
			},
			flick: {
				perfect: [-0.03, 0.03],
				good: [-0.06, 0.06],
				bad: [-0.1, 0.1]
			},
			hold: {
				perfect: [-0.03, 0.03],
				good: [-0.06, 0.06],
				bad: [-0.1, 0.1]
			},
			holdEnd: {
				perfect: 0.8,
				good: 0.8,
				bad: -Infinity
			}
		}
	},

	ACCURACIES_4: {
		perfect: 1,
		good: 0.5,
		bad: 0.1,
		miss: 0
	},

	ACCURACIES_5: {
		perfect: 1,
		good: 0.6,
		bad: 0.2,
		miss: 0
	},

	SERVER_BASE_URL: atob('aHR0cHM6Ly9zdW5uaWVzbm93LWNvbW11bml0eS43NTczNjgwOC54eXo='),

	OBJECT_URL_TIMEOUT: 1,
};
