Sunniesnow.TipPoint = class TipPoint extends Sunniesnow.TipPointBase {

	static TRAIL_DURATION = 0.5
	static TRAIL_TAIL_DURATION = 0.1
	static ZOOMING_IN_DURATION = 0.3
	static ZOOMING_OUT_DURATION = 0.3

	static TRAIL_SHADER_BIT_GL = {
		name: 'tipPointTrail',
		vertex: {},
		fragment: {
			header: 'uniform float uAlpha;',
			main: 'outColor = vec4(vUV.xxx * 0.5 * uAlpha, 1.0);',
		}
	}

	static TRAIL_SHADER_BIT = {
		name: 'tipPointTrail',
		vertex: {},
		fragment: {
			header: 'struct MyUniforms { uAlpha: f32, } @group(2) @binding(0) var<uniform> myUniforms: MyUniforms;',
			main: 'outColor = vec4<f32>(vUV.xxx * 0.5 * myUniforms.uAlpha, 1.0);',
		}
	}

	static async load() {
		if (Sunniesnow.game.settings.hideTipPoints) {
			return;
		}
		this.radius = Sunniesnow.Config.NOTE_RADIUS / 3;
		this.halfThickness = this.radius / 1.5; // half width of trail
		this.tipPointGeometry = this.createTipPointGeometry();
		if (Sunniesnow.game.settings.scroll) {
			this.ACTIVE_DURATION = Sunniesnow.Config.fromSpeedToTime(Sunniesnow.game.settings.speed);
			this.REMNANT_DURATION = this.calculateRemnantDuration();
		}
	}

	static calculateRemnantDuration() {
		const edge = Sunniesnow.Config.SCROLL_SPEED > 0 ? Sunniesnow.Config.HEIGHT : 0;
		return edge - Sunniesnow.Config.SCROLL_END_Y / Sunniesnow.Config.SCROLL_SPEED;
	}

	static createTipPointGeometry() {
		const graphics = new PIXI.GraphicsContext();
		graphics.circle(0, 0, this.radius);
		graphics.fill(0x000000);
		const unit = this.radius / Math.sqrt(2);
		graphics.poly([
			unit, unit,
			unit*2, 0,
			unit, -unit
		]);
		graphics.fill(0x000000);
		graphics.circle(0, 0, unit);
		graphics.stroke({width: this.radius / 10, color: 0xffff00});
		return graphics;
	}

	populate() {
		if (Sunniesnow.game.settings.renderer !== 'canvas') {
			this.createTrail();
		}
		this.createTipPoint();
		if (Sunniesnow.game.settings.scroll) {
			this.checkpoints.forEach(checkpoint => checkpoint.y = Sunniesnow.Config.SCROLL_END_Y);
			this.createConnections();
		}
	}

	createTipPoint() {
		this.tipPoint = new PIXI.Graphics(this.constructor.tipPointGeometry);
		this.addChild(this.tipPoint);
	}

	createTrail() {
		this.trailGeometry = new PIXI.MeshGeometry();
		this.lastNodesCount = null;
		this.trailVertices = this.trailGeometry.attributes.aPosition.buffer;
		this.trailUvs = this.trailGeometry.attributes.aUV.buffer;
		this.trailIndices = this.trailGeometry.indexBuffer;
		this.trailShader = new PIXI.Shader({
			glProgram: PIXI.compileHighShaderGlProgram({bits: [
				PIXI.localUniformBitGl,
				PIXI.roundPixelsBitGl,
				this.constructor.TRAIL_SHADER_BIT_GL
			]}),
			gpuProgram: PIXI.compileHighShaderGpuProgram({bits: [
				PIXI.localUniformBit,
				PIXI.roundPixelsBit,
				this.constructor.TRAIL_SHADER_BIT
			]}),
			resources: {myUniforms: {uAlpha: {value: 1, type: 'f32'}}}
		});
		this.trail = new PIXI.Mesh({geometry: this.trailGeometry, shader: this.trailShader});
		this.trail.blendMode = 'add';
		this.addChild(this.trail);
	}

	createConnections() {
		this.connections = new PIXI.Graphics();
		this.connections.moveTo(this.checkpoints[0].x, 0);
		for (const {x, time} of this.checkpoints.slice(1)) {
			this.connections.lineTo(
				x,
				(this.startTime - time) * Sunniesnow.Config.SCROLL_SPEED
			);
		}
		this.connections.stroke({width: Sunniesnow.Config.WIDTH / 200, color: 0x8f8f7f, alpha: 0.5});
		this.connections.y = Sunniesnow.Config.SCROLL_END_Y;
		this.addChild(this.connections);
	}

	update(time) {
		super.update(time);
		if (!Sunniesnow.game.settings.scroll) {
			return;
		}
		this.connections.y = Sunniesnow.Config.SCROLL_END_Y + (time - this.startTime) * Sunniesnow.Config.SCROLL_SPEED;
	}

	updateActive(time) {
		super.updateActive(time);
		this.tipPoint.visible = false;
		if (Sunniesnow.game.settings.renderer !== 'canvas') {
			this.trail.visible = true;
		}
	}

	updateZoomingIn(time) {
		super.updateZoomingIn(time);
		this.tipPoint.visible = true;
		const sinceStart = time - this.startTime;
		this.tipPoint.scale.set(sinceStart / this.constructor.ZOOMING_IN_DURATION);
		this.updateTipPoint(time);
		if (Sunniesnow.game.settings.renderer !== 'canvas') {
			this.trail.visible = true;
			this.trailShader.resources.myUniforms.uniforms.uAlpha = 1;
			this.updateTrail(time);
		}
	}

	updateZoomingOut(time) {
		super.updateZoomingOut(time);
		this.tipPoint.visible = true;
		const sinceEnd = time - this.endTime;
		const alpha = 1 - sinceEnd / this.constructor.ZOOMING_OUT_DURATION;
		this.tipPoint.scale.set(alpha);
		this.updateTipPoint(time);
		if (Sunniesnow.game.settings.renderer !== 'canvas') {
			this.trail.visible = true;
			this.trailShader.resources.myUniforms.uniforms.uAlpha = alpha;
			this.updateTrail(time);
		}
	}

	updateHolding(time) {
		super.updateHolding(time);
		this.tipPoint.visible = true;
		this.tipPoint.scale.set(1);
		this.updateTipPoint(time);
		if (Sunniesnow.game.settings.renderer !== 'canvas') {
			this.trail.visible = true;
			this.trailShader.resources.myUniforms.uniforms.uAlpha = 1;
			this.updateTrail(time);
		}
	}

	updateRemnant(time) {
		super.updateRemnant(time);
		this.tipPoint.visible = false;
		if (Sunniesnow.game.settings.renderer !== 'canvas') {
			this.trail.visible = false;
		}
	}

	updateTrail(time) {
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
		let previousCheckpointIndex = null; // the nearest checkpoint before startTime
		let nextCheckpointIndex = null; // the nearest checkpoint after endTime
		const tailConnectTime = startTime + this.constructor.TRAIL_TAIL_DURATION
		let tailConnect = null; // the checkpoint that connects the tail to the main trail
		for (let i = 0; i < this.checkpoints.length; i++) {
			const checkpoint = this.checkpoints[i];
			if (checkpoint.time >= startTime) {
				if (!tailConnect && i > 0 && checkpoint.time >= tailConnectTime && tailConnectTime < endTime) {
					checkpoints.push(tailConnect = this.checkpointByProgress(i-1, tailConnectTime));
				}
				if (checkpoint.time > endTime) {
					nextCheckpointIndex = i;
					break;
				}
				checkpoints.push(checkpoint)
			} else {
				previousCheckpointIndex = i;
			}
		}
		if (checkpoints[0]?.time !== startTime && previousCheckpointIndex !== null) {
			checkpoints.unshift(this.checkpointByProgress(previousCheckpointIndex, startTime));
		}
		if (checkpoints[checkpoints.length - 1]?.time !== endTime && nextCheckpointIndex !== null) {
			checkpoints.push(this.checkpointByProgress(nextCheckpointIndex - 1, endTime));
		}
		return checkpoints;
	}

	checkpointByProgress(index, time) {
		const {time: t1, x: x1, y: y1} = this.checkpoints[index];
		const {time: t2, x: x2, y: y2} = this.checkpoints[index + 1];
		const progress = (time - t1) / (t2 - t1);
		return {time, x: x1 + (x2 - x1) * progress, y: y1 + (y2 - y1) * progress, index: index + 0.5};
	}

	jointEdge(checkpoint, startTime) {
		const {x, y, index} = checkpoint;
		let xP, yP;
		for (let i = Math.floor(index); i >= 0; i--) {
			({x: xP, y: yP} = this.checkpoints[i]);
			if (xP != x || yP != y) {
				break;
			}
		}
		let xN, yN;
		for (let i = Math.ceil(index); i < this.checkpoints.length; i++) {
			({x: xN, y: yN} = this.checkpoints[i]);
			if (xN != x || yN != y) {
				break;
			}
		}
		let angleP = xP != x || yP != y ? this.atan2(xP - x, yP - y) : undefined;
		let angleN = xN != x || yN != y ? this.atan2(xN - x, yN - y) : undefined;
		if (angleP === undefined && angleN === undefined) {
			return this.zeroAngle();
		}
		angleP ??= angleN + Math.PI;
		angleN ??= angleP + Math.PI;
		let angle = (angleP + angleN) / 2;
		if (Sunniesnow.Utils.angleDistance(angleP, angleN) < Math.PI/2 - 1e-4) {
			angle += Math.PI / 2;
		}
		return Sunniesnow.Utils.polarToCartesian(
			this.constructor.halfThickness * Math.min((checkpoint.time - startTime) / this.constructor.TRAIL_TAIL_DURATION, this.tipPoint.scale.x) / Math.sin(angle - angleN),
			angle
		);
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
		let lastX1, lastX2, lastY1, lastY2;
		lastX1 = lastX2 = vertices[0] = vertices[2] = checkpoints[0].x
		lastY1 = lastY2 = vertices[1] = vertices[3] = checkpoints[0].y;
		for (let i = 1; i < checkpoints.length; i++) {
			const index = i * 4;
			const {x, y} = checkpoints[i];
			const {x: xP, y: yP} = checkpoints[i-1];
			const [dx, dy] = this.jointEdge(checkpoints[i], startTime);
			let x1 = x + dx, y1 = y + dy, x2 = x - dx, y2 = y - dy;
			if (Sunniesnow.Utils.clockwiseness(xP, yP, x, y, x1, y1) !== Sunniesnow.Utils.clockwiseness(xP, yP, x, y, lastX1, lastY1)) {
				[x1, y1, x2, y2] = [x2, y2, x1, y1]
			}
			if (Sunniesnow.Utils.clockwiseness(xP, yP, x, y, x1, y1) !== Sunniesnow.Utils.clockwiseness(lastX1, lastY1, x, y, x1, y1)) {
				[x1, y1] = [lastX1, lastY1];
			}
			if (Sunniesnow.Utils.clockwiseness(xP, yP, x, y, x2, y2) !== Sunniesnow.Utils.clockwiseness(lastX2, lastY2, x, y, x2, y2)) {
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
