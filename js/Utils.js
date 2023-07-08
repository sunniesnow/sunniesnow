Sunniesnow.Utils = {
	warn(msg) {
		document.getElementById('warnings').innerText += msg + '\n';
	},

	error(msg) {
		document.getElementById('errors').innerText += msg + '\n';
		Sunniesnow.game.terminate();
		throw msg;
	},

	clearWarningsAndErrors() {
		document.getElementById('warnings').innerText = '';
		document.getElementById('errors').innerText = '';
	},

	isValidUrl(text) {
		try {
			new URL(text);
		} catch(e) {
			return false;
		}
		return true;
	},

	url(prefix, text) {
		if (Sunniesnow.Utils.isValidUrl(text)) {
			return text;
		} else {
			return prefix + text;
		}
	},

	downcaseFirst(string) {
		return string.charAt(0).toLowerCase() + string.slice(1);
	},

	upcaseFirst(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	mirrorPath(path) {
		for (let i = 0; i < path.length; i += 2) {
			path[i] = Sunniesnow.game.settings.width - path[i];
		}
	},

	stringify(obj) {
		result = '';
		for (let key in obj) {
			result += `${key}: ${obj[key]}\n`;
		}
		return result;
	},

	polarToCartesian(rho, phi) {
		return [rho * Math.cos(phi), rho * Math.sin(phi)];
	},

	cartesianToPolar(x, y) {
		return [this.hypot(x, y), Math.atan2(y, x)];
	},
	
	between(x, a, b) {
		return a <= x && x <= b || b <= x && x <= a;
	},

	drawDashedLine(graphics, x0, y0, x1, y1, dashLength, gapLength) {
		const dx = x1 - x0;
		const dy = y1 - y0;
		const length = this.hypot(dx, dy);
		const dashDx = dashLength * dx / length;
		const dashDy = dashLength * dy / length;
		const gapDx = gapLength * dx / length;
		const gapDy = gapLength * dy / length;
		let x = x0;
		let y = y0;
		while (this.between(x, x0, x1) || this.between(y, y0, y1)) {
			graphics.moveTo(x, y);
			x += dashDx;
			y += dashDy;
			graphics.lineTo(x, y);
			x += gapDx;
			y += gapDy;
		}
		return graphics.finishPoly();
	},

	minmax(...numbers) {
		return [Math.min(...numbers), Math.max(...numbers)];
	},

	pageToCanvasCoordinates(pageX, pageY, canvas) {
		let totalOffsetX = 0;
		let totalOffsetY = 0;
		for (let e = canvas; e; e = e.offsetParent) {
			totalOffsetX += e.offsetLeft;
			totalOffsetY += e.offsetTop;
		}
		const scale = Math.max(
			canvas.width / canvas.offsetWidth,
			canvas.height / canvas.offsetHeight
		);
		return [
			(pageX - totalOffsetX - canvas.offsetWidth/2) * scale + canvas.width/2,
			(pageY - totalOffsetY - canvas.offsetHeight/2) * scale + canvas.height/2
		];
	},

	distance(x0, y0, x1, y1) {
		return this.hypot(x1 - x0, y1 - y0);
	},

	// The L-infinity distance
	lInfDistance(x0, y0, x1, y1) {
		return Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
	},

	hypot(x, y) {
		return Math.sqrt(x*x + y*y);
	},

	quo(a, b) {
		if (b === 0) {
			return NaN;
		}
		const r = Math.floor(a / b);
		return [r, a - r * b];
	},

	maxJudgement(...judgements) {
		for (const j of ['perfect', 'good', 'bad', 'miss']) {
			if (judgements.some(judgement => judgement === j)) {
				return j;
			}
		}
		return null;
	},

	minJudgement(...judgements) {
		for (const j of ['miss', 'bad', 'good', 'perfect']) {
			if (judgements.some(judgement => judgement === j)) {
				return j;
			}
		}
		return null;
	},

	// min and max must be specified as integers in the form 0xRRGGBB
	randColor(min, max) {
		let result = 0;
		for (let i = 0; i < 3; i++) {
			result |= Math.floor(Math.random() * ((max&0xff) - (min&0xff) + 1)) + (min&0xff) << i*8;
			min >>= 8;
			max >>= 8;
		}
		return result;
	},

	drawRegularPolygon(graphics, x, y, radius, sides, rotation) {
		sides = Math.max(sides || 0, 3);
		rotation ||= 0;
		const delta = Math.PI*2 / sides;
		const polygon = [];
		for (let i = 0; i < sides; i++) {
			const angle = i * delta + rotation;
			polygon.push(
				x + radius * Math.cos(angle),
				y + radius * Math.sin(angle)
			);
		}
		return graphics.drawPolygon(polygon);
	},

	clockwiseness(x1, y1, x2, y2, x3, y3) {
		return Math.sign((y2 - y1) * (x3 - x2) - (y3 - y2) * (x2 - x1));
	},

	p(...objects) {
		console.log(...objects);
		return objects.length === 1 ? objects[0] : objects;
	},

	clamp(number, min, max) {
		return Math.max(min, Math.min(number, max));
	}
};
