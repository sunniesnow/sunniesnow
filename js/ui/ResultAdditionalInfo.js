Sunniesnow.ResultAdditionalInfo = class ResultAdditionalInfo extends Sunniesnow.Button {

	static COLOR = '#ff00ff';

	static DISTRIBUTION_RASTER_COUNT = 600;
	
	// should normalize
	// unit of distance: sigma
	static SAMPLE_BLUR(distance) {
		const variance = 0.03**2;
		return Math.exp(-(distance**2)/(2*variance))/Math.sqrt(2*Math.PI*variance);
	}

	static SAMPLE_BLUR_RADIUS = 10; // unit: raster

	static async load() {
		this.fontSize = Sunniesnow.game.settings.height / 30;
		this.textStyle = {
			fontFamily: 'Arial',
			fontSize: this.fontSize,
			fill: this.COLOR
		};
		this.samplesDiagramHeight = Sunniesnow.game.settings.height / 4;
	}

	constructor() {
		super(() => this.trigger(), 50);
		this.hitRect = new PIXI.Rectangle(0, 0, Sunniesnow.game.settings.width, Sunniesnow.game.settings.height);
	}

	populate() {
		this.createAllContentsWrapper();
		this.createText();
		if (Sunniesnow.game.settings.autoplay) {
			return;
		}
		this.processSamples();
		this.createSamplesDiagram();
		this.createDistributionDiagram();
		this.createRightText();
	}

	createAllContentsWrapper() {
		this.allContents = new PIXI.Container();
		this.allContents.visible = false;
		this.addChild(this.allContents);
	}

	processSamples() {
		this.samples = Sunniesnow.game.level.inaccuracies;
		this.sortedSamples = this.samples.toSorted((a, b) => a - b);
		this.sampleCount = this.samples.length;
		this.sampleMean = 0;
		for (const sample of this.samples) {
			this.sampleMean += sample;
		}
		this.sampleMean /= this.sampleCount;
		this.sampleVariance = 0;
		for (const sample of this.samples) {
			this.sampleVariance += (sample - this.sampleMean)**2;
		}
		this.sampleVariance /= this.sampleCount;
		this.sampleSd = Math.sqrt(this.sampleVariance);
	}

	createSamplesDiagram() {
		this.meanText = new PIXI.Text('μ', {...this.constructor.textStyle});
		this.meanText.anchor = new PIXI.ObservablePoint(null, null, 0, 0.5);
		this.sdText = new PIXI.Text('σ', {...this.constructor.textStyle});
		this.sdText.anchor = new PIXI.ObservablePoint(null, null, 0, 0.5);

		const textWidth = Math.max(this.meanText.width, this.sdText.width);
		const diagramWidth = Sunniesnow.game.settings.width - textWidth;
		this.samplesDiagram = new PIXI.Graphics();
		const unit = this.constructor.samplesDiagramHeight / 4;
		const thin = unit / 50;
		const thick = unit / 30;

		this.samplesDiagram.lineStyle(thin, this.constructor.COLOR);
		this.samplesDiagram.moveTo(0, unit);
		this.samplesDiagram.lineTo(diagramWidth, unit);
		this.sdText.x = diagramWidth;
		this.sdText.y = unit;

		this.samplesDiagram.lineStyle(thick, this.constructor.COLOR);
		this.samplesDiagram.moveTo(0, 2*unit);
		this.samplesDiagram.lineTo(diagramWidth, 2*unit);
		this.meanText.x = diagramWidth;
		this.meanText.y = 2*unit;

		this.samplesDiagram.lineStyle(thin, this.constructor.COLOR);
		this.samplesDiagram.moveTo(0, 3*unit);
		this.samplesDiagram.lineTo(diagramWidth, 3*unit);

		const zeroY = this.sampleMean / this.sampleSd * unit + 2*unit;
		if (Sunniesnow.Utils.between(zeroY, 0, 4*unit)) {
			this.zeroText = new PIXI.Text('0', { ...this.constructor.textStyle });
			this.zeroText.anchor = new PIXI.ObservablePoint(null, null, 0, 0.5);
			this.samplesDiagram.lineStyle(thick, this.constructor.COLOR);
			this.samplesDiagram.moveTo(0, zeroY);
			this.samplesDiagram.lineTo(diagramWidth, zeroY);
			this.zeroText.x = diagramWidth;
			this.zeroText.y = zeroY;
		}

		this.samples.forEach((sample, i) => {
			if (!Sunniesnow.Utils.between(sample, this.sampleMean - this.sampleSd*2, this.sampleMean + this.sampleSd*2)) {
				return;
			}
			const x = (i + 0.5) / this.sampleCount * diagramWidth;
			const y = unit*2 * (1 - (sample - this.sampleMean) / (this.sampleSd*2));
			this.samplesDiagram.beginFill(this.constructor.COLOR);
			this.samplesDiagram.drawCircle(x, y, unit/10);
		});

		this.allContents.addChild(this.samplesDiagram);
		this.allContents.addChild(this.meanText);
		this.allContents.addChild(this.sdText);
		if (this.zeroText) {
			this.allContents.addChild(this.zeroText);
		}
	}

	createDistributionDiagram() {
		this.meanText2 = new PIXI.Text('μ', {...this.constructor.textStyle});
		this.meanText2.anchor = new PIXI.ObservablePoint(null, null, 0.5, 1);
		this.sdText2 = new PIXI.Text('σ', {...this.constructor.textStyle});
		this.sdText2.anchor = new PIXI.ObservablePoint(null, null, 0.5, 1);
		this.zeroText2 = new PIXI.Text('0', {...this.constructor.textStyle});
		this.zeroText2.anchor = new PIXI.ObservablePoint(null, null, 0.5, 1);

		const width = Sunniesnow.game.settings.width;
		const height = Sunniesnow.game.settings.height - this.constructor.samplesDiagramHeight;
		const unit = width / 6;
		this.meanText2.x = width / 2;
		this.meanText2.y = Sunniesnow.game.settings.height;
		this.sdText2.x = width / 2 + unit;
		this.sdText2.y = Sunniesnow.game.settings.height;

		this.distributionDiagram = new PIXI.Graphics();
		this.distributionDiagram.x = width / 2;
		this.distributionDiagram.y = this.constructor.samplesDiagramHeight;
		for (let i = -2; i <= 2; i++) {
			const thickness = i === 0 ? unit / 60 : unit / 108;
			this.distributionDiagram.lineStyle(thickness, this.constructor.COLOR);
			this.distributionDiagram.moveTo(i*unit, 0);
			this.distributionDiagram.lineTo(i*unit, height);
		}
		const zeroX = -this.sampleMean / this.sampleSd * unit;
		this.distributionDiagram.lineStyle(unit / 60, this.constructor.COLOR);
		this.distributionDiagram.moveTo(zeroX, 0);
		this.distributionDiagram.lineTo(zeroX, height);
		this.zeroText2.x = zeroX + width/2;
		this.zeroText2.y = Sunniesnow.game.settings.height;

		const rasterCount = this.constructor.DISTRIBUTION_RASTER_COUNT;
		const raster = width / rasterCount;
		const blurRadius = this.constructor.SAMPLE_BLUR_RADIUS;
		const points = new Array(rasterCount).fill(0);
		this.samples.forEach(sample => {
			if (!Sunniesnow.Utils.between(sample - this.sampleMean, -this.sampleSd*3, this.sampleSd*3)) {
				return;
			}
			const rasterIndex = (sample - (this.sampleMean - this.sampleSd*3)) / (this.sampleSd*6) * rasterCount;
			const start = Math.max(0, Math.ceil(rasterIndex - blurRadius));
			const end = Math.min(rasterCount - 1, Math.floor(rasterIndex + blurRadius));
			for (let j = start; j <= end; j++) {
				const distance = (j - rasterIndex) / rasterCount * 6;
				points[j] += this.constructor.SAMPLE_BLUR(distance);
			}
		});

		const max = points.reduce((a, b) => Math.max(a, b), -Infinity);
		this.distributionDiagram.lineStyle({
			width: unit/60,
			color: this.constructor.COLOR,
			join: PIXI.LINE_JOIN.ROUND
		});
		for (let i = 0; i < rasterCount; i++) {
			const x = (i - rasterCount / 2) * raster
			const y = height * (1 - points[i] / max);
			i === 0 ? this.distributionDiagram.moveTo(x, y) : this.distributionDiagram.lineTo(x, y);
		}
		this.distributionDiagram.finishPoly();

		this.allContents.addChild(this.distributionDiagram);
		this.allContents.addChild(this.meanText2);
		this.allContents.addChild(this.sdText2);
		this.allContents.addChild(this.zeroText2);
	}

	createText() {
		this.text = new PIXI.Text(this.getTextContents(), {...this.constructor.textStyle});
		this.text.y = this.constructor.samplesDiagramHeight;
		this.allContents.addChild(this.text);
	}

	createRightText() {
		this.rightText = new PIXI.Text(this.getRightTextContents(), {...this.constructor.textStyle, align: 'right'});
		this.rightText.anchor = new PIXI.ObservablePoint(null, null, 1, 0);
		this.rightText.x = Sunniesnow.game.settings.width;
		this.rightText.y = this.constructor.samplesDiagramHeight;
		this.allContents.addChild(this.rightText);
	}

	trigger() {
		this.allContents.visible = !this.allContents.visible;
	}

	hitRegion() {
		return this.hitRect;
	}

	getTextContents() {
		return `Judgement time windows: ${Sunniesnow.game.settings.judgementWindows}
Note hit size: ${Sunniesnow.game.settings.noteHitSize}
Offset: ${Sunniesnow.game.settings.offset}
Lyrica 5 mechanics: ${Sunniesnow.game.settings.lyrica5}
Drag notes cannot be hit early: ${Sunniesnow.game.settings.noEarlyDrag}
Flick notes are direction-insensitive: ${Sunniesnow.game.settings.directionInsensitiveFlick}
Hold notes lock the position of touch: ${Sunniesnow.game.settings.lockingHold}
Autoplay: ${Sunniesnow.game.settings.autoplay}
Chart offset: ${Sunniesnow.game.settings.chartOffset}
Speed (of music): ${Sunniesnow.game.settings.gameSpeed}
Horizontal flip: ${Sunniesnow.game.settings.horizontalFlip}
Vertical flip: ${Sunniesnow.game.settings.verticalFlip}
Start: ${Sunniesnow.game.settings.start}
End: ${Sunniesnow.game.settings.end}

Artist: ${Sunniesnow.game.chart.artist}
Charter: ${Sunniesnow.game.chart.charter}

${Sunniesnow.Utils.currentTimeIso()}`;
	}

	getRightTextContents() {
		let result = `Early: ${Sunniesnow.game.level.early}; Late: ${Sunniesnow.game.level.late}
Mean μ = ${Math.round(this.sampleMean * 1000)}ms
SD σ = ${Math.round(this.sampleSd * 1000)}ms

`;
		const judgementWindows = Sunniesnow.Config.appropriateJudgementWindows();
		for (const noteType of ['tap', 'drag', 'flick', 'hold']) {
			result += `${noteType}: `;
			let intervals = [];
			for (const judgement of ['perfect', 'good', 'bad']) {
				intervals = judgementWindows[noteType][judgement].toSpliced(1, 0, ...intervals);
			}
			result += intervals.join(', ') + '\n';
		}
		result += `hold (end): -\u221e, ${judgementWindows.holdEnd.good}, ${judgementWindows.holdEnd.perfect}`
		return result;
	}

};
