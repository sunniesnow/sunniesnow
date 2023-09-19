Sunniesnow.TipPoint = class TipPoint extends Sunniesnow.TipPointBase {

	static TRAIL_DURATION = 0.5;
	static TRAIL_TAIL_DURATION = 0.1;
	static ZOOMING_IN_DURATION = 0.3;
	static ZOOMING_OUT_DURATION = 0.3;

	static TRAIL_VERTEX_SHADER = `
		attribute vec2 aVertexPosition;
		attribute vec2 aTextureCoord;

		uniform mat3 projectionMatrix;
		uniform mat3 translationMatrix;

		varying vec2 vTextureCoord; // x=0 means trail tail, x=1 means trail head

		void main() {
			gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
			vTextureCoord = aTextureCoord;
		}
	`;
	static TRAIL_FRAGMENT_SHADER = `
		varying vec2 vTextureCoord;

		uniform float uAlpha;

		void main() {
			gl_FragColor = vec4(vTextureCoord.xxx * 0.5 * uAlpha, 1.0);
		}
	`;

	static async load() {
		if (Sunniesnow.game.settings.hideTipPoints) {
			return;
		}
		this.radius = Sunniesnow.Config.noteRadius() / 3;
		this.tipPointGeometry = this.createTipPointGeometry();
	}

	static createTipPointGeometry() {
		const graphics = new PIXI.Graphics();
		graphics.beginFill(0x000000);
		graphics.drawCircle(0, 0, this.radius);
		graphics.endFill();
		const unit = this.radius / Math.sqrt(2);
		graphics.beginFill(0x000000);
		graphics.drawPolygon([
			unit, unit,
			unit*2, 0,
			unit, -unit
		]);
		graphics.endFill();
		graphics.lineStyle(this.radius / 10, 0xffff00);
		graphics.drawCircle(0, 0, unit);
		return graphics.geometry;
	}

	populate() {
		if (Sunniesnow.game.settings.renderer === 'webgl') {
			this.createTrail();
		}
		this.createTipPoint();
	}

	createTipPoint() {
		this.tipPoint = new PIXI.Graphics(this.constructor.tipPointGeometry);
		this.addChild(this.tipPoint);
	}

	createTrail() {
		this.trailGeometry = new PIXI.MeshGeometry();
		this.lastNodesCount = null;
		this.trailVertices = this.trailGeometry.getBuffer('aVertexPosition');
		this.trailUvs = this.trailGeometry.getBuffer('aTextureCoord');
		this.trailIndices = this.trailGeometry.getIndex();
		this.trailShader = PIXI.Shader.from(
			this.constructor.TRAIL_VERTEX_SHADER,
			this.constructor.TRAIL_FRAGMENT_SHADER,
			{uAlpha: 1}
		);
		this.trail = new PIXI.Mesh(this.trailGeometry, this.trailShader);
		this.trail.blendMode = PIXI.BLEND_MODES.ADD;
		this.addChild(this.trail);
	}

	updateZoomingIn(time) {
		super.updateZoomingIn(time);
		const sinceStart = time - this.startTime;
		this.tipPoint.scale.set(sinceStart / this.constructor.ZOOMING_IN_DURATION);
		this.trailShader.uniforms.uAlpha = 1;
		this.updateTrail(time);
		this.updateTipPoint(time);
	}

	updateZoomingOut(time) {
		super.updateZoomingOut(time);
		const sinceEnd = time - this.endTime;
		const alpha = 1 - sinceEnd / this.constructor.ZOOMING_OUT_DURATION;
		this.trailShader.uniforms.uAlpha = alpha;
		this.tipPoint.scale.set(alpha);
		this.updateTrail(time);
		this.updateTipPoint(time);
	}

	updateHolding(time) {
		super.updateHolding(time);
		this.tipPoint.scale.set(1);
		this.trailShader.uniforms.uAlpha = 1;
		this.updateTrail(time);
		this.updateTipPoint(time);
	}

	updateTrail(time) {
		if (Sunniesnow.game.settings.renderer !== 'webgl') {
			return;
		}
		this.drawTrailThrough(this.getCheckpointsBetween(
			Math.max(this.startTime, time - this.constructor.TRAIL_DURATION),
			Math.min(this.endTime, time)
		));
	}

	// in Lyrica, this is the zero angle
	zeroAngle() {
		return Sunniesnow.Config.chartMappingAngle(Math.PI / 2);
	}

	atan2(x, y) {
		return x === 0 && y === 0 ? this.zeroAngle() : Math.atan2(y, x);
	}

	updateTipPoint(time) {
		if (this.checkpoints.length == 1) {
			this.tipPoint.position.set(this.checkpoints[0].x, this.checkpoints[0].y);
			this.tipPoint.rotation = this.zeroAngle();
			return;
		}
		const i = this.checkpoints.findIndex(checkpoint => checkpoint.time >= time);
		if (i == 0) {
			this.tipPoint.position.set(this.checkpoints[0].x, this.checkpoints[0].y);
			this.tipPoint.rotation = this.atan2(
				this.checkpoints[1].x - this.checkpoints[0].x,
				this.checkpoints[1].y - this.checkpoints[0].y
			);
		} else if (i == -1) {
			this.tipPoint.position.set(
				this.checkpoints[this.checkpoints.length - 1].x,
				this.checkpoints[this.checkpoints.length - 1].y
			);
			this.tipPoint.rotation = this.atan2(
				this.checkpoints[this.checkpoints.length - 1].x - this.checkpoints[this.checkpoints.length - 2].x,
				this.checkpoints[this.checkpoints.length - 1].y - this.checkpoints[this.checkpoints.length - 2].y
			);
		} else {
			const previousCheckpoint = this.checkpoints[i - 1];
			const nextCheckpoint = this.checkpoints[i];
			const progress = (time - previousCheckpoint.time) / (nextCheckpoint.time - previousCheckpoint.time);
			this.tipPoint.position.set(
				previousCheckpoint.x + (nextCheckpoint.x - previousCheckpoint.x) * progress,
				previousCheckpoint.y + (nextCheckpoint.y - previousCheckpoint.y) * progress
			);
			this.tipPoint.rotation = this.atan2(
				nextCheckpoint.x - previousCheckpoint.x,
				nextCheckpoint.y - previousCheckpoint.y
			);
		}
	}

	// startTime: the time when the tip point was at the tail of the trail
	// endTime: the time when the tip point is at the head of the trail
	getCheckpointsBetween(startTime, endTime) {
		const checkpoints = [];
		let previousCheckpoint = null;
		let nextCheckpoint = null;
		const tailConnectTime = startTime + this.constructor.TRAIL_TAIL_DURATION
		let tailConnect = null;
		for (let i = 0; i < this.checkpoints.length; i++) {
			const checkpoint = this.checkpoints[i];
			if (checkpoint.time >= startTime) {
				if (!tailConnect && i > 0 && checkpoint.time >= tailConnectTime && tailConnectTime < endTime) {
					const lastCheckpoint = this.checkpoints[i-1];
					const progress = (tailConnectTime - lastCheckpoint.time) / (checkpoint.time - lastCheckpoint.time);
					tailConnect = {
						time: tailConnectTime,
						x: lastCheckpoint.x + (checkpoint.x - lastCheckpoint.x) * progress,
						y: lastCheckpoint.y + (checkpoint.y - lastCheckpoint.y) * progress
					};
					checkpoints.push(tailConnect);
				}
				if (checkpoint.time > endTime) {
					nextCheckpoint = checkpoint;
					break;
				} else
				checkpoints.push(checkpoint);
			} else {
				previousCheckpoint = checkpoint;
			}
		}
		if (!(checkpoints[0] && checkpoints[0].time == startTime) && previousCheckpoint) {
			const firstCheckpoint = checkpoints[0] || nextCheckpoint;
			const progress = (startTime - previousCheckpoint.time) / (firstCheckpoint.time - previousCheckpoint.time);
			checkpoints.unshift({
				time: startTime,
				x: previousCheckpoint.x + (firstCheckpoint.x - previousCheckpoint.x) * progress,
				y: previousCheckpoint.y + (firstCheckpoint.y - previousCheckpoint.y) * progress
			});
		}
		if (!(checkpoints[checkpoints.length-1] && checkpoints[checkpoints.length-1].time == endTime) && nextCheckpoint) {
			const lastCheckpoint = checkpoints[checkpoints.length - 1] || previousCheckpoint;
			const progress = (endTime - lastCheckpoint.time) / (nextCheckpoint.time - lastCheckpoint.time);
			checkpoints.push({
				time: endTime,
				x: lastCheckpoint.x + (nextCheckpoint.x - lastCheckpoint.x) * progress,
				y: lastCheckpoint.y + (nextCheckpoint.y - lastCheckpoint.y) * progress
			});
		}
		checkpoints.forEach(checkpoint => {
			checkpoint.thicknessRatio = Math.min(
				(checkpoint.time - startTime) / this.constructor.TRAIL_TAIL_DURATION,
				1
			);
		});
		return checkpoints;
	}

	drawTrailThrough(checkpoints) {
		const startTime = checkpoints[0].time;
		const endTime = checkpoints[checkpoints.length - 1].time;
		if (this.lastNodesCount != checkpoints.length) {
			this.lastNodesCount = checkpoints.length;
			this.trailUvs.data = new Float32Array(checkpoints.length * 4);
			this.trailVertices.data = new Float32Array(checkpoints.length * 4);
			this.trailIndices.data = new Uint16Array((checkpoints.length - 1) * 6);
			const indices = this.trailIndices.data;
			for (let i = 0, indexCount = 0; i < checkpoints.length - 1; i++) {
				const index = i * 2;
				// make a rectangle out of two triangles
				indices[indexCount++] = index;
				indices[indexCount++] = index + 1;
				indices[indexCount++] = index + 2;
				indices[indexCount++] = index + 2;
				indices[indexCount++] = index + 1;
				indices[indexCount++] = index + 3;
			}
			this.trailIndices.update();
		}

		/*
		UV logic:

		1 -- 3 -- ... -- 2n-1
		|    |           |
		0 -- 2 -- ... -- 2n
		tail ----------> head

		2n points in total, so 4n coordinates in total
		*/
		const uvs = this.trailUvs.data;
		for (let i = 0; i < checkpoints.length; i++) {
			const index = i * 4;
			const trailPos = (checkpoints[i].time - startTime) / (endTime - startTime);
			uvs[index] = trailPos;
			uvs[index + 1] = 0;
			uvs[index + 2] = trailPos;
			uvs[index + 3] = 1;
		}
		this.trailUvs.update();

		const vertices = this.trailVertices.data;
		const halfThickness = this.constructor.radius / 1.5; // half thickness of trail
		let lastX1, lastX2, lastY1, lastY2;
		lastX1 = lastX2 = vertices[0] = vertices[2] = checkpoints[0].x
		lastY1 = lastY2 = vertices[1] = vertices[3] = checkpoints[0].y;
		for (let i = 1; i < checkpoints.length; i++) {
			const index = i * 4;
			const {x, y, thicknessRatio} = checkpoints[i];
			const {x: xP, y: yP} = checkpoints[i-1];
			if (x == xP && y == yP) {
				vertices[index] = lastX1;
				vertices[index + 1] = lastY1;
				vertices[index + 2] = lastX2;
				vertices[index + 3] = lastY2;
				continue;
			}
			let j, xN, yN, perpX, perpY;
			for (j = i + 1; j < checkpoints.length; j++) {
				({x: xN, y: yN} = checkpoints[j]);
				if (xN != x || yN != y) {
					break;
				}
			}
			if (j === checkpoints.length) {
				perpX = y - yP;
				perpY = xP - x;
				const perpLength = Sunniesnow.Utils.hypot(perpX, perpY);
				perpX *= halfThickness / perpLength * thicknessRatio;
				perpY *= halfThickness / perpLength * thicknessRatio;
			} else {
				const angleP = this.atan2(xP - x, yP - y);
				const angleN = this.atan2(xN - x, yN - y);
				let angle = (angleP + angleN) / 2;
				if (Sunniesnow.Utils.angleDistance(angleP, angleN) < Math.PI/2 - 1e-3) {
					angle += Math.PI / 2;
				}
				[perpX, perpY] = Sunniesnow.Utils.polarToCartesian(halfThickness * thicknessRatio, angle);
			}
			let x1 = x + perpX;
			let y1 = y + perpY;
			let x2 = x - perpX;
			let y2 = y - perpY;
			const c1 = Sunniesnow.Utils.clockwiseness(xP, yP, x, y, x1, y1);
			const c2 = Sunniesnow.Utils.clockwiseness(xP, yP, x, y, lastX1, lastY1);
			if (c1 !== c2) {
				[x1, y1, x2, y2] = [x2, y2, x1, y1]
			}
			const cP11 = Sunniesnow.Utils.clockwiseness(xP, yP, x, y, x1, y1);
			const cP12 = Sunniesnow.Utils.clockwiseness(lastX1, lastY1, x, y, x1, y1);
			if (cP11 !== cP12) {
				[x1, y1] = [lastX1, lastY1];
			}
			const cP21 = Sunniesnow.Utils.clockwiseness(xP, yP, x, y, x2, y2);
			const cP22 = Sunniesnow.Utils.clockwiseness(lastX2, lastY2, x, y, x2, y2);
			if (cP21 !== cP22) {
				[x2, y2] = [lastX2, lastY2];
			}
			vertices[index] = lastX1 = x1;
			vertices[index + 1] = lastY1 = y1;
			vertices[index + 2] = lastX2 = x2;
			vertices[index + 3] = lastY2 = y2;
		}
		this.trailVertices.update();
	}
};
