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
		this.fontSize = Sunniesnow.Config.HEIGHT / 30;
		this.textStyle = {
			fontFamily: 'Noto Sans Math,Noto Sans CJK TC',
			fontSize: this.fontSize,
			lineHeight: this.fontSize,
			fill: this.COLOR
		};
		this.samplesDiagramHeight = Sunniesnow.Config.HEIGHT / 4;
	}

	constructor() {
		super(() => this.trigger(), 50);
		this.hitRect = new PIXI.Rectangle(0, 0, Sunniesnow.Config.WIDTH, Sunniesnow.Config.HEIGHT);
	}

	populate() {
		this.label = 'result-additional-info';
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
		this.allContents.label = 'all-contents-wrapper';
		this.allContents.visible = false;
		this.addChild(this.allContents);
	}

	processSamples() {
		this.samples = Sunniesnow.game.level.inaccuracies;
		this.sortedSamples = this.samples.toSorted((a, b) => a - b);
		this.sampleCount = this.samples.length;
		this.sampleMean = Sunniesnow.Utils.average(this.samples);
		this.sampleVariance = Sunniesnow.Utils.average(this.samples, x => (x - this.sampleMean)**2);
		this.sampleSd = Math.sqrt(this.sampleVariance);
	}

	createSamplesDiagram() {
		this.meanText = new PIXI.Text({text: 'μ', style: {...this.constructor.textStyle}});
		this.meanText.label = 'mean-text';
		this.meanText.anchor.set(0, 0.5);
		this.sdText = new PIXI.Text({text: 'σ', style: {...this.constructor.textStyle}});
		this.sdText.label = 'sd-text';
		this.sdText.anchor.set(0, 0.5);

		const textWidth = Math.max(this.meanText.width, this.sdText.width);
		const diagramWidth = Sunniesnow.Config.WIDTH - textWidth;
		this.samplesDiagram = new PIXI.Graphics();
		this.samplesDiagram.label = 'samples-diagram';
		const unit = this.constructor.samplesDiagramHeight / 4;
		const thin = unit / 50;
		const thick = unit / 30;

		this.samplesDiagram.stroke({width: thin, color: this.constructor.COLOR});
		this.samplesDiagram.moveTo(0, unit);
		this.samplesDiagram.lineTo(diagramWidth, unit);
		this.sdText.x = diagramWidth;
		this.sdText.y = unit;

		this.samplesDiagram.stroke({width: thick, color: this.constructor.COLOR});
		this.samplesDiagram.moveTo(0, 2*unit);
		this.samplesDiagram.lineTo(diagramWidth, 2*unit);
		this.meanText.x = diagramWidth;
		this.meanText.y = 2*unit;

		this.samplesDiagram.stroke({width: thin, color: this.constructor.COLOR});
		this.samplesDiagram.moveTo(0, 3*unit);
		this.samplesDiagram.lineTo(diagramWidth, 3*unit);

		const zeroY = this.sampleMean / this.sampleSd * unit + 2*unit;
		if (Sunniesnow.Utils.between(zeroY, 0, 4*unit)) {
			this.zeroText = new PIXI.Text({text: '0', style: { ...this.constructor.textStyle }});
			this.zeroText.label = 'zero-text';
			this.zeroText.anchor.set(0, 0.5);
			this.samplesDiagram.stroke({width: thick, color: this.constructor.COLOR});
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
			this.samplesDiagram.circle(x, y, unit/10);
			this.samplesDiagram.fill(this.constructor.COLOR);
		});

		this.allContents.addChild(this.samplesDiagram);
		this.allContents.addChild(this.meanText);
		this.allContents.addChild(this.sdText);
		if (this.zeroText) {
			this.allContents.addChild(this.zeroText);
		}
	}

	createDistributionDiagram() {
		this.meanText2 = new PIXI.Text({text: 'μ', style: {...this.constructor.textStyle}});
		this.meanText2.label = 'mean-text-2';
		this.meanText2.anchor.set(0.5, 1);
		this.sdText2 = new PIXI.Text({text: 'σ', style: {...this.constructor.textStyle}});
		this.sdText2.label = 'sd-text-2';
		this.sdText2.anchor.set(0.5, 1);
		this.zeroText2 = new PIXI.Text({text: '0', style: {...this.constructor.textStyle}});
		this.zeroText2.label = 'zero-text-2';
		this.zeroText2.anchor.set(0.5, 1);

		const width = Sunniesnow.Config.WIDTH;
		const height = Sunniesnow.Config.HEIGHT - this.constructor.samplesDiagramHeight;
		const unit = width / 6;
		this.meanText2.x = width / 2;
		this.meanText2.y = Sunniesnow.Config.HEIGHT;
		this.sdText2.x = width / 2 + unit;
		this.sdText2.y = Sunniesnow.Config.HEIGHT;

		this.distributionDiagram = new PIXI.Graphics();
		this.distributionDiagram.label = 'distribution-diagram';
		this.distributionDiagram.x = width / 2;
		this.distributionDiagram.y = this.constructor.samplesDiagramHeight;
		for (let i = -2; i <= 2; i++) {
			const thickness = i === 0 ? unit / 60 : unit / 108;
			this.distributionDiagram.stroke({width: thickness, color: this.constructor.COLOR});
			this.distributionDiagram.moveTo(i*unit, 0);
			this.distributionDiagram.lineTo(i*unit, height);
		}
		const zeroX = -this.sampleMean / this.sampleSd * unit;
		this.distributionDiagram.stroke({width: unit / 60, color: this.constructor.COLOR});
		this.distributionDiagram.moveTo(zeroX, 0);
		this.distributionDiagram.lineTo(zeroX, height);
		this.zeroText2.x = zeroX + width/2;
		this.zeroText2.y = Sunniesnow.Config.HEIGHT;

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
		for (let i = 0; i < rasterCount; i++) {
			const x = (i - rasterCount / 2) * raster
			const y = height * (1 - points[i] / max);
			i === 0 ? this.distributionDiagram.moveTo(x, y) : this.distributionDiagram.lineTo(x, y);
		}
		this.distributionDiagram.stroke({
			width: unit/60,
			color: this.constructor.COLOR,
			join: 'round'
		});

		this.allContents.addChild(this.distributionDiagram);
		this.allContents.addChild(this.meanText2);
		this.allContents.addChild(this.sdText2);
		this.allContents.addChild(this.zeroText2);
	}

	createText() {
		const style = {...this.constructor.textStyle};
		const text = this.getTextContents();
		style.fontSize = style.lineHeight = (Sunniesnow.Config.HEIGHT - this.constructor.samplesDiagramHeight) / Sunniesnow.Utils.countLines(text);
		this.text = new PIXI.Text({text, style});
		this.text.label = 'text';
		this.text.y = this.constructor.samplesDiagramHeight;
		this.allContents.addChild(this.text);
	}

	createRightText() {
		this.rightText = new PIXI.Text({text: this.getRightTextContents(), style: {...this.constructor.textStyle, align: 'right'}});
		this.rightText.label = 'right-text';
		this.rightText.anchor.set(1, 0);
		this.rightText.x = Sunniesnow.Config.WIDTH;
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
		return `judgement-windows: ${Sunniesnow.game.settings.judgementWindows}
note-hit-size: ${Sunniesnow.game.settings.noteHitSize}
offset: ${Sunniesnow.game.settings.offset}
lyrica-5: ${Sunniesnow.game.settings.lyrica5}
no-early-drag: ${Sunniesnow.game.settings.noEarlyDrag}
locking-hold: ${Sunniesnow.game.settings.lockingHold}
min-flick-distance: ${Sunniesnow.game.settings.minFlickDistance}
max-flick-distance: ${Sunniesnow.game.settings.maxFlickDistance}
flick-angle-range: ${Sunniesnow.game.settings.flickAngleRange}
overlapping-flick-fix: ${Sunniesnow.game.settings.overlappingFlickFix}
scroll: ${Sunniesnow.game.settings.scroll}
autoplay: ${Sunniesnow.game.settings.autoplay}
chart-offset: ${Sunniesnow.game.settings.chartOffset}
game-speed: ${Sunniesnow.game.settings.gameSpeed}
horizontal-flip: ${Sunniesnow.game.settings.horizontalFlip}
vertical-flip: ${Sunniesnow.game.settings.verticalFlip}
start: ${Sunniesnow.game.settings.start}
end: ${Sunniesnow.game.settings.end}

Artist: ${Sunniesnow.game.chart.artist}
Charter: ${Sunniesnow.game.chart.charter}

${Sunniesnow.Utils.currentTimeIso()}`;
	}

	getRightTextContents() {
		let result = `Early: ${Sunniesnow.game.level.early}; Late: ${Sunniesnow.game.level.late}
Mean μ = ${Math.round(this.sampleMean * 1000)}ms
SD σ = ${Math.round(this.sampleSd * 1000)}ms

`;
		const judgementWindows = Sunniesnow.Config.JUDGEMENT_WINDOWS;
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
