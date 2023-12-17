Sunniesnow.Config = {

	scale() {
		return Math.min(
			Sunniesnow.game.settings.width / this.minWidth,
			Sunniesnow.game.settings.height / this.minHeight
		);
	},

	// unit: pixels
	noteRadius() {
		return this.radius * this.scale() * Sunniesnow.game.settings.noteSize;
	},

	// calculate the note active time from the note speed specified by gamer
	fromSpeedToTime(speed) {
		return 1 / speed;
	},

	// UI of chart events will be spawned
	// this much time (in seconds) before it actually appears.
	// Must be smaller than preparationTime.
	uiPreparationTime: 0.1,

	// Note radius in chart coordinate length units.
	// This is used for calculating judgement space window.
	radius: 12.5,

	// The minimum width of the visible part of a chart.
	// The unit is chart coordinates length unit.
	// It is guaranteed that x chart coordinates within [-w/2, w/2] is inside the screen.
	// Similarly for height.
	minWidth: 275,
	minHeight: 150,

	// Get coordinates on canvas by providing the coordinates in charts.
	chartMapping(chartX, chartY) {
		if (Sunniesnow.game.settings.horizontalFlip) {
			chartX = -chartX;
		}
		if (Sunniesnow.game.settings.verticalFlip) {
			chartY = -chartY;
		}
		const scale = this.scale();
		const x = chartX * scale + Sunniesnow.game.settings.width / 2;
		const y = -chartY * scale + Sunniesnow.game.settings.height / 2;
		return [x, y];
	},

	// Get coordinates on chart by providing the page coordinates.
	pageMapping(pageX, pageY) {
		const [canvasX, canvasY] = Sunniesnow.Utils.pageToCanvasCoordinates(pageX, pageY, Sunniesnow.game.canvas);
		const scale = this.scale();
		let chartX = (canvasX - Sunniesnow.game.settings.width / 2) / scale;
		let chartY = -(canvasY - Sunniesnow.game.settings.height / 2) / scale;
		if (Sunniesnow.game.settings.horizontalFlip) {
			chartX = -chartX;
		}
		if (Sunniesnow.game.settings.verticalFlip) {
			chartY = -chartY;
		}
		return [chartX, chartY];
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

	appropriateJudgementWindows() {
		return (Sunniesnow.game.settings.lyrica5 ? this.judgementWindows5 : this.judgementWindows)[Sunniesnow.game.settings.judgementWindows];
	},

	judgementWindows: {
		loose: {
			tap: {
				perfect: [-0.11, 0.15],
				good: [-0.3, 0.3],
				bad: [-0.4, 0.4]
			},
			drag: {
				perfect: [-0.11, 0.15],
				good: [-0.3, 0.3],
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
				perfect: [-0.11, 0.15],
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
		}
	},

	judgementWindows5: {
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
		}
	},

	accuracies: {
		perfect: 1,
		good: 0.5,
		bad: 0.1,
		miss: 0
	},

	accuracies5: {
		perfect: 1,
		good: 0.6,
		bad: 0.2,
		miss: 0
	},

	chartPrefix: atob('aHR0cHM6Ly9zdW5uaWVzbm93LWNvbW11bml0eS43NTczNjgwOC54eXovY2hhcnQv'),
	backgroundPrefix: atob('aHR0cHM6Ly9zdW5uaWVzbm93LWNvbW11bml0eS43NTczNjgwOC54eXovYmFja2dyb3VuZC8='),
	sePrefix: atob('aHR0cHM6Ly9zdW5uaWVzbm93LWNvbW11bml0eS43NTczNjgwOC54eXovc2Uv'),
	skinPrefx: atob('aHR0cHM6Ly9zdW5uaWVzbm93LWNvbW11bml0eS43NTczNjgwOC54eXovc2tpbi8='),
	fxPrefix: atob('aHR0cHM6Ly9zdW5uaWVzbm93LWNvbW11bml0eS43NTczNjgwOC54eXovZngv'),
	pluginPrefix: atob('aHR0cHM6Ly9zdW5uaWVzbm93LWNvbW11bml0eS43NTczNjgwOC54eXovcGx1Z2luLw=='),

	objectUrlTimeout: 1,
};
