Sunniesnow.Result = class Result extends Sunniesnow.UiComponent {
	
	static async load() {
		this.prepareColors();
		this.statsBackgroundGeometry = this.createStatsGeometry();
		this.comboBackgroundGeometry = this.createComboGeometry();
		this.titleBackgroundGeometry = this.createTitleGeometry();
		this.difficultyBackgroundGeometry = this.createDifficultyGeometry();
		this.createRankGeometry();
		this.scoreBackgroundGeometry = this.createScoreGeometry();
		this.accuracyBackgroundGeometry = this.createAccuracyGeometry();
	}

	static prepareColors() {
		this.mainColor = 0xfbfbff;
		this.mainContourColor = 0xaaaaaa;
		if (Sunniesnow.game.settings.renderer === 'webgl') {
			this.shaderColors = {
				fc: [0xffd55d, 0xfff2a6, 0xffd55d, 0xfff2a6],
				fcs: [0xe4ffff, 0x94b7d0, 0xe4ffff, 0x94b7d0],
				ap: [0x99ffee, 0x6688ff, 0xee77ff, 0xffffaa]
			};
			for (const key in this.shaderColors) {
				this.shaderColors[key] = new Float32Array(
					this.shaderColors[key].map(color => new PIXI.Color(color).toRgbArray()).flat()
				);
			}
		} else {
			this.plainColors = {
				fc: 0xfef856,
				fcs: 0xc9dcda,
				ap: 0xee99ff
			};
		}
	}

	static createTitleGeometry() {
		this.titleWidth = this.statsRadius * 4 + this.statsSeperation * 3;
		this.titleHeight = Sunniesnow.game.settings.width / 22.5;
		const graphics = new PIXI.Graphics();
		graphics.beginFill(this.mainColor);
		graphics.arc(0, 0, this.titleHeight /2, Math.PI/2, -Math.PI/2);
		graphics.lineTo(this.titleWidth, -this.titleHeight /2);
		graphics.arc(this.titleWidth, 0, this.titleHeight /2, -Math.PI/2, Math.PI/2);
		graphics.closePath();
		graphics.endFill();
		return graphics.geometry;
	}

	static createDifficultyGeometry() {
		this.difficultyNameWidth = this.titleWidth / 2;
		this.difficultyWidth = this.titleWidth / 3;
		const graphics = new PIXI.Graphics();
		graphics.beginFill(this.mainColor);
		graphics.arc(0, 0, this.titleHeight /2, Math.PI/2, -Math.PI/2);
		graphics.lineTo(this.titleWidth - this.difficultyWidth, -this.titleHeight /2);
		graphics.lineTo(this.titleWidth - this.difficultyNameWidth, this.titleHeight /2);
		graphics.closePath();
		graphics.endFill();
		graphics.beginFill(Sunniesnow.game.chart.difficultyColor);
		graphics.arc(this.titleWidth, 0, this.titleHeight /2, -Math.PI/2, Math.PI/2);
		graphics.lineTo(this.titleWidth - this.difficultyNameWidth, this.titleHeight /2);
		graphics.lineTo(this.titleWidth - this.difficultyWidth, -this.titleHeight /2);
		graphics.closePath();
		graphics.endFill();
		return graphics.geometry;
	}

	static createStatsGeometry() {
		this.statsRadius = Sunniesnow.game.settings.width / 18.5;
		this.statsSeperation = this.statsRadius / 4;
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(this.statsRadius / 15, this.mainColor, 1, 1);
		graphics.beginFill(this.mainColor, 1);
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, 0, this.statsRadius, 4, 0);
		graphics.endFill();
		graphics.lineStyle(this.statsRadius / 100, this.mainContourColor, 1, 0);
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, 0, this.statsRadius, 4, 0);
		return graphics.geometry;
	}

	static createComboGeometry() {
		this.comboRadius = Sunniesnow.game.settings.width / 14;
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(this.comboRadius / 15, this.mainColor, 1, 1);
		graphics.beginFill(this.mainColor, 1);
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, 0, this.comboRadius, 4, 0);
		graphics.endFill();
		graphics.lineStyle(this.comboRadius / 100, this.mainContourColor, 1, 0);
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, 0, this.comboRadius, 4, 0);
		return graphics.geometry;
	}

	static createRankGeometry() {
		this.rankFrameGeometry = this.createRankFrameGeometry();
		this.rankBackgroundGeometry = this.createRankBackgroundGeometry();
		if (Sunniesnow.game.settings.renderer === 'webgl') {
			this.createApFcGeometry();
		}
	}

	static createRankFrameGeometry() {
		this.rankRadius = Sunniesnow.game.settings.width / 8;
		const innerRadius = this.rankRadius * 5/6;
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(this.rankRadius / 15, this.mainColor, 1, 0);
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, 0, this.rankRadius, 4, 0);
		graphics.lineStyle(this.rankRadius / 30, this.mainColor, 1, 0);
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, 0, innerRadius, 4, 0);
		graphics.beginFill(0xebfbff, 1);
		const smallRadius = this.rankRadius / 8;
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, innerRadius - smallRadius, smallRadius, 4, 0);
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, -innerRadius + smallRadius, smallRadius, 4, 0);
		graphics.endFill();
		return graphics.geometry;
	}

	static createRankBackgroundGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0x000000, 0.2);
		Sunniesnow.Utils.drawRegularPolygon(graphics, 0, 0, this.rankRadius, 4, 0);
		graphics.endFill();
		return graphics.geometry;
	}

	static createApFcGeometry() {
		this.apFcVertexShader = `
			attribute vec2 aVertexPosition;
			attribute vec3 aColor;

			uniform mat3 projectionMatrix;
			uniform mat3 translationMatrix;

			varying vec3 vColor;

			void main() {
				gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
				vColor = aColor;
			}
		`;
		this.apFcFragmentShader = `
			varying vec3 vColor;

			void main() {
				gl_FragColor = vec4(vColor, 1.0);
			}
		`;
		this.apFcGeometry = new PIXI.Geometry();
		this.apFcGeometry.addAttribute('aVertexPosition', new PIXI.Buffer(new Float32Array([
			this.rankRadius, 0,
			0, this.rankRadius,
			-this.rankRadius, 0,
			0, -this.rankRadius
		]), true), 2, false, PIXI.TYPES.FLOAT);
		this.apFcGeometry.addAttribute('aColor', new PIXI.Buffer(new Float32Array(12), true), 3, false, PIXI.TYPES.FLOAT);
		this.apFcGeometry.addIndex(new PIXI.Buffer(new Uint16Array([
			0, 1, 2,
			0, 2, 3
		]), true, true));
		this.apFcShader = PIXI.Shader.from(this.apFcVertexShader, this.apFcFragmentShader);
	}

	static createScoreGeometry() {
		const w = this.scoreWidth = Sunniesnow.game.settings.width / 5;
		const h = this.scoreHeight = Sunniesnow.game.settings.width / 17.5;
		const path = [
			w/2, h/2,
			-w/2, h/2,
			-w/2-h/2, 0,
			-w/2, -h/2,
			w/2, -h/2,
			w/2+h/2, 0
		]
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(h/10, this.mainColor, 1, 1);
		graphics.beginFill(this.mainColor, 1);
		graphics.drawPolygon(path);
		graphics.endFill();
		graphics.lineStyle(h/40, this.mainContourColor, 1, 0);
		graphics.drawPolygon(path);
		return graphics.geometry;
	}

	static createAccuracyGeometry() {
		const w = this.accuracyWidth = Sunniesnow.game.settings.width / 8;
		const h = this.accuracyHeight = Sunniesnow.game.settings.width / 25;
		const path = [
			w / 2, h / 2,
			-w / 2, h / 2,
			-w / 2 - h / 2, 0,
			-w / 2, -h / 2,
			w / 2, -h / 2,
			w / 2 + h / 2, 0
		]
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(h / 10, this.mainColor, 1, 1);
		graphics.beginFill(this.mainColor, 1);
		graphics.drawPolygon(path);
		graphics.endFill();
		graphics.lineStyle(h / 40, this.mainContourColor, 1, 0);
		graphics.drawPolygon(path);
		return graphics.geometry;
	}

	populate() {
		super.populate();
		this.populateTitle();
		this.populateDifficulty();
		this.populateStatsAndCombo();
		this.populateRank();
		this.populateScore();
		this.populateAccuracy();
	}

	populateTitle() {
		this.titleBackground = new PIXI.Graphics(this.constructor.titleBackgroundGeometry);
		this.titleText = new PIXI.Text(Sunniesnow.game.chart.title, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK',
			fontSize: this.constructor.titleHeight / 2,
			fill: '#43586e',
			align: 'left'
		});
		this.titleText.anchor = new PIXI.ObservablePoint(null, null, 0, 0.5);
		if (this.titleText.width > this.constructor.titleWidth) {
			this.titleText.scale.set(this.constructor.titleWidth / this.titleText.width);
		}
		this.title = new PIXI.Container();
		this.title.addChild(this.titleBackground);
		this.title.addChild(this.titleText);
		this.title.x = Sunniesnow.game.settings.width / 5;
		this.title.y = Sunniesnow.game.settings.height / 4.5;
		this.addChild(this.title);
	}

	populateDifficulty() {
		this.difficultyBackground = new PIXI.Graphics(this.constructor.difficultyBackgroundGeometry);
		this.difficultyNameText = new PIXI.Text(Sunniesnow.game.chart.difficultyName, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK',
			fontSize: this.constructor.titleHeight / 2,
			fill: '#43586e',
			align: 'left'
		});
		this.difficultyNameText.anchor = new PIXI.ObservablePoint(null, null, 0, 0.5);
		if (this.difficultyNameText.width > this.constructor.difficultyNameWidth) {
			this.difficultyNameText.scale.set(this.constructor.difficultyNameWidth / this.difficultyNameText.width);
		}
		this.difficultyText = new PIXI.Text(Sunniesnow.game.chart.difficulty, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK',
			fontSize: this.constructor.titleHeight / 2,
			fill: '#fbfbff',
			align: 'right'
		});
		if (this.difficultyText.width > this.constructor.difficultyWidth) {
			this.difficultyText.scale.set(this.constructor.difficultyWidth / this.difficultyText.width);
		}
		this.difficultyText.anchor = new PIXI.ObservablePoint(null, null, 1, 0.5);
		this.difficultySupText = new PIXI.Text(Sunniesnow.game.chart.difficultySup, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK',
			fontSize: this.constructor.titleHeight / 4,
			fill: '#fbfbff'
		});
		this.difficultySupText.anchor = new PIXI.ObservablePoint(null, null, 1, 1);
		this.difficultySupText.x = this.constructor.titleWidth;
		this.difficultyText.x = this.difficultySupText.getBounds().x;
		this.difficulty = new PIXI.Container();
		this.difficulty.addChild(this.difficultyBackground);
		this.difficulty.addChild(this.difficultyNameText);
		this.difficulty.addChild(this.difficultyText);
		this.difficulty.addChild(this.difficultySupText);
		this.difficulty.x = this.title.x;
		this.difficulty.y = this.title.y + this.constructor.titleHeight * 5/4;
		this.addChild(this.difficulty);
	}

	populateStatsAndCombo() {
		this.statsBackgrounds = {};
		this.statsTexts = {};
		this.stats = {};
		this.populateStats('perfect');
		this.populateStats('good');
		this.populateStats('bad');
		this.populateStats('miss');
		this.populateCombo();
		const r1 = this.constructor.statsRadius;
		const r2 = this.constructor.comboRadius;
		const d = this.constructor.statsSeperation;
		this.stats.good.x = r1 + d;
		this.stats.good.y = r1 + d;
		this.stats.bad.x = this.stats.good.x + r1 + d;
		this.stats.miss.x = this.stats.bad.x + r1 + d;
		this.stats.miss.y = r1 + d;
		this.combo.x = this.stats.miss.x + r1 + d;
		this.combo.y = this.stats.miss.y - r2 - d;
		this.statsAndCombo = new PIXI.Container();
		this.statsAndCombo.addChild(this.stats.perfect);
		this.statsAndCombo.addChild(this.stats.good);
		this.statsAndCombo.addChild(this.stats.bad);
		this.statsAndCombo.addChild(this.stats.miss);
		this.statsAndCombo.addChild(this.combo);
		this.statsAndCombo.x = this.title.x;
		this.statsAndCombo.y = Sunniesnow.game.settings.height * 2/3;
		this.addChild(this.statsAndCombo);
	}

	populateStats(judgement) {
		this.statsBackgrounds[judgement] = new PIXI.Graphics(this.constructor.statsBackgroundGeometry);
		this.statsTexts[judgement] = new PIXI.Text(
			Sunniesnow.Utils.judgementText(judgement) + '\n' + Sunniesnow.game.level[judgement],
			{
				fontFamily: 'Noto Sans Math,Noto Sans CJK',
				fontSize: this.constructor.statsRadius / 3,
				fill: '#43586e',
				align: 'center'
			}
		);
		this.statsTexts[judgement].anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		this.stats[judgement] = new PIXI.Container();
		this.stats[judgement].addChild(this.statsBackgrounds[judgement]);
		this.stats[judgement].addChild(this.statsTexts[judgement]);
		this.addChild(this.stats[judgement]);
	}

	populateCombo() {
		this.comboBackground = new PIXI.Graphics(this.constructor.comboBackgroundGeometry);
		this.comboText = new PIXI.Text('Combo\n' + Sunniesnow.game.level.maxCombo, {
			fontFamily: 'Noto Sans Math,Noto Sans CJK',
			fontSize: this.constructor.comboRadius / 3,
			fill: '#43586e',
			align: 'center'
		});
		this.comboText.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		this.combo = new PIXI.Container();
		this.combo.addChild(this.comboBackground);
		this.combo.addChild(this.comboText);
		this.addChild(this.combo);
	}

	populateRank() {
		this.rank = new PIXI.Container();
		this.rankBackground = new PIXI.Graphics(this.constructor.rankBackgroundGeometry);
		this.rank.addChild(this.rankBackground);
		if (Sunniesnow.game.level.apFcIndicator) {
			if (Sunniesnow.game.settings.renderer === 'webgl') {
				this.constructor.apFcGeometry.getBuffer('aColor').data.set(
					this.constructor.shaderColors[Sunniesnow.game.level.apFcIndicator]
				);
				this.rankFrame = new PIXI.Mesh(this.constructor.apFcGeometry, this.constructor.apFcShader);
				this.rankFrame.mask = new PIXI.Graphics(this.constructor.rankFrameGeometry);
				this.rank.addChild(this.rankFrame.mask);
			} else {
				this.rankFrame = new PIXI.Graphics(this.constructor.rankFrameGeometry);
				this.rankFrame.tint = this.constructor.plainColors[Sunniesnow.game.level.apFcIndicator];
			}
		} else {
			this.rankFrame = new PIXI.Graphics(this.constructor.rankFrameGeometry);
			this.rankFrame.tint = this.constructor.mainColor;
		}
		this.rank.addChild(this.rankFrame);
		this.rankText = new PIXI.Text(Sunniesnow.game.level.rank(), {
			fontFamily: 'Noto Sans Math,Noto Sans CJK',
			fontSize: this.constructor.rankRadius / 1.5,
			fill: '#fbfbff',
			align: 'center'
		});
		this.rankText.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		this.rank.addChild(this.rankText);
		this.rank.x = Sunniesnow.game.settings.width * 0.7;
		this.rank.y = Sunniesnow.game.settings.height * 0.35;
		this.addChild(this.rank);
	}

	populateScore() {
		this.scoreBackground = new PIXI.Graphics(this.constructor.scoreBackgroundGeometry);
		this.scoreText = new PIXI.Text(Sunniesnow.game.level.score(), {
			fontFamily: 'Noto Sans Math,Noto Sans CJK',
			fontSize: this.constructor.scoreHeight / 1.5,
			fill: '#43586e',
			align: 'center'
		});
		this.scoreText.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		this.score = new PIXI.Container();
		this.score.addChild(this.scoreBackground);
		this.score.addChild(this.scoreText);
		this.score.x = this.rank.x;
		this.score.y = Sunniesnow.game.settings.height * 2/3;
		this.addChild(this.score);
	}

	populateAccuracy() {
		this.accuracyBackground = new PIXI.Graphics(this.constructor.accuracyBackgroundGeometry);
		this.accuracyText = new PIXI.Text(Sunniesnow.game.level.accuracyText(), {
			fontFamily: 'Noto Sans Math,Noto Sans CJK',
			fontSize: this.constructor.accuracyHeight / 1.5,
			fill: '#43586e',
			align: 'center'
		});
		this.accuracyText.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
		this.accuracy = new PIXI.Container();
		this.accuracy.addChild(this.accuracyBackground);
		this.accuracy.addChild(this.accuracyText);
		this.accuracy.x = this.score.x;
		this.accuracy.y = this.score.y + this.constructor.accuracyHeight/2 + this.constructor.scoreHeight;
		this.addChild(this.accuracy);
	}

};
