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
	
	between(x, a, b) {
		return a <= x && x <= b || b <= x && x <= a;
	},

	drawDashedLine(graphics, x0, y0, x1, y1, dashLength, gapLength) {
		const dx = x1 - x0;
		const dy = y1 - y0;
		const length = Math.sqrt(dx*dx + dy*dy);
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
		graphics.finishPoly();
	}
};
