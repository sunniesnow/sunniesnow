Sunniesnow.TipPoint = class TipPoint extends Sunniesnow.TipPointBase {

	static TRAIL_DURATION = 0.5;
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

void main() {
	gl_FragColor = vec4(vTextureCoord.xxx*0.5, 1.0);
}
`;

	static initialize() {
		this.radius = Sunniesnow.Config.noteRadius() / 3;
		this.tipPointGeometry = this.createTipPointGeometry();
		this.trailShader = this.createTrailShader();
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

	static createTrailShader() {
		return PIXI.Shader.from(
			this.TRAIL_VERTEX_SHADER,
			this.TRAIL_FRAGMENT_SHADER
		);
	}

	populate() {
		this.createTrail();
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
		this.trail = new PIXI.Mesh(this.trailGeometry, this.constructor.trailShader);
		this.trail.blendMode = PIXI.BLEND_MODES.ADD;
		this.addChild(this.trail);
	}

	updateZoomingIn(time) {
		super.updateZoomingIn(time);
		const sinceStart = (time - this.startTime) / Sunniesnow.game.settings.gameSpeed;
		this.tipPoint.scale.set(sinceStart / this.constructor.ZOOMING_IN_DURATION);
		this.updateTrail(time);
		this.updateTipPoint(time);
	}

	updateZoomingOut(time) {
		super.updateZoomingOut(time);
		const sinceEnd = (time - this.endTime) / Sunniesnow.game.settings.gameSpeed;
		this.tipPoint.scale.set(1 - sinceEnd / this.constructor.ZOOMING_OUT_DURATION);
		this.updateTrail(time);
		this.updateTipPoint(time);
	}

	updateHolding(time) {
		super.updateHolding(time);
		this.tipPoint.scale.set(1);
		this.updateTrail(time);
		this.updateTipPoint(time);
	}

	updateTrail(time) {
		this.drawTrailThrough(this.getCheckpointsBetween(
			Math.max(this.startTime, time - this.constructor.TRAIL_DURATION),
			Math.min(this.endTime, time)
		));
	}

	updateTipPoint(time) {
		const i = this.checkpoints.findIndex(checkpoint => checkpoint.time >= time);
		if (i == 0) {
			this.tipPoint.position.set(this.checkpoints[0].x, this.checkpoints[0].y);
			this.tipPoint.rotation = Math.atan2(
				this.checkpoints[1].y - this.checkpoints[0].y,
				this.checkpoints[1].x - this.checkpoints[0].x
			);
		} else if (i == -1) {
			this.tipPoint.position.set(
				this.checkpoints[this.checkpoints.length - 1].x,
				this.checkpoints[this.checkpoints.length - 1].y
			);
			this.tipPoint.rotation = Math.atan2(
				this.checkpoints[this.checkpoints.length - 1].y - this.checkpoints[this.checkpoints.length - 2].y,
				this.checkpoints[this.checkpoints.length - 1].x - this.checkpoints[this.checkpoints.length - 2].x
			);
		} else {
			const previousCheckpoint = this.checkpoints[i - 1];
			const nextCheckpoint = this.checkpoints[i];
			const progress = (time - previousCheckpoint.time) / (nextCheckpoint.time - previousCheckpoint.time);
			this.tipPoint.position.set(
				previousCheckpoint.x + (nextCheckpoint.x - previousCheckpoint.x) * progress,
				previousCheckpoint.y + (nextCheckpoint.y - previousCheckpoint.y) * progress
			);
			this.tipPoint.rotation = Math.atan2(
				nextCheckpoint.y - previousCheckpoint.y,
				nextCheckpoint.x - previousCheckpoint.x
			);
		}
	}

	// startTime: the time when the tip point was at the tail of the trail
	// endTime: the time when the tip point is at the head of the trail
	getCheckpointsBetween(startTime, endTime) {
		const checkpoints = [];
		let previousCheckpoint = null;
		let nextCheckpoint = null;
		for (let i = 0; i < this.checkpoints.length; i++) {
			const checkpoint = this.checkpoints[i];
			if (checkpoint.time >= startTime) {
				if (checkpoint.time > endTime) {
					nextCheckpoint = checkpoint;
					break;
				}
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
		for (let i = 1, lastX1 = 0, lastY1 = 0; i < checkpoints.length; i++) {
			const index = i * 4;
			const x = checkpoints[i].x;
			const y = checkpoints[i].y;
			const xp = checkpoints[i-1].x;
			const yp = checkpoints[i-1].y;
			let perpX = y - yp;
			let perpY = xp - x;
			const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
			perpX *= halfThickness / perpLength;
			perpY *= halfThickness / perpLength;
			let x1 = checkpoints[i].x + perpX;
			let y1 = checkpoints[i].y + perpY;
			let x2 = checkpoints[i].x - perpX;
			let y2 = checkpoints[i].y - perpY;
			const c1 = Sunniesnow.Utils.clockwiseness(xp, yp, x, y, x1, y1);
			const c2 = Sunniesnow.Utils.clockwiseness(xp, yp, x, y, lastX1, lastY1);
			if (c1 !== c2) {
				let t = x1;
				x1 = x2;
				x2 = t;
				t = y1;
				y1 = y2;
				y2 = t;
			}
			vertices[index] = lastX1 = x1;
			vertices[index + 1] = lastY1 = y1;
			vertices[index + 2] = x2;
			vertices[index + 3] = y2;
		}
		vertices[0] = vertices[2] = checkpoints[0].x;
		vertices[1] = vertices[3] = checkpoints[0].y;
		this.trailVertices.update();
	}
};
