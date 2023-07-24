Sunniesnow.Utils = {
	warn(msg, e) {
		document.getElementById('warnings').innerHTML += msg + '<br>';
		console.warn(msg);
		if (e) {
			console.warn(e);
		} else {
			console.warn(new Error(msg));
		}
	},

	error(msg, e) {
		document.getElementById('errors').innerHTML += msg + '<br>';
		console.error(msg);
		Sunniesnow.Loader.loadingChart = false;
		Sunniesnow.Loader.loadingComplete = true;
		Sunniesnow.game?.terminate();
		if (e) {
			throw(e);
		} else {
			throw(new Error(msg));
		}
	},

	clearWarningsAndErrors() {
		document.getElementById('warnings').innerHTML = '';
		document.getElementById('errors').innerHTML = '';
	},

	isValidUrl(text) {
		try {
			new URL(text);
		} catch(e) {
			return false;
		}
		return true;
	},

	url(prefix, text, suffix = '') {
		if (this.isValidUrl(text)) {
			return text;
		} else {
			return prefix + (text.endsWith(suffix) ? text : text + suffix);
		}
	},

	downcaseFirst(string) {
		return string.charAt(0).toLowerCase() + string.slice(1);
	},

	upcaseFirst(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	mirrorAndReversePath(path) {
		for (let i = 0; i < path.length; i += 2) {
			path[i] = Sunniesnow.game.settings.width - path[i];
		}
		for (let i = 0; i < path.length / 2; i += 2) {
			const x = path[i];
			const y = path[i + 1];
			path[i] = path[path.length - i - 2];
			path[i + 1] = path[path.length - i - 1];
			path[path.length - i - 2] = x;
			path[path.length - i - 1] = y;
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
		const rect = canvas.getBoundingClientRect();
		rect.x += window.scrollX;
		rect.y += window.scrollY;
		const scale = Math.max(
			canvas.width / canvas.offsetWidth,
			canvas.height / canvas.offsetHeight
		);
		return [
			(pageX - rect.x - rect.width/2) * scale + canvas.width/2,
			(pageY - rect.y - rect.height/2) * scale + canvas.height/2
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
	},

	toPercentage(number) {
		return (number * 100).toFixed(2) + '%';
	},

	async blobToBase64(blob) {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		return new Promise((resolve, reject) => reader.addEventListener(
			'loadend',
			e => resolve(reader.result)
		));
	},

	blobToBase64Sync(blob) {
		return new FileReaderSync().readAsDataURL(blob);
	},

	async base64ToBlob(base64) {
		return await (await fetch(base64)).blob();
	},

	base64ToBlobSync(base64) {
		const type = base64.substring('data:'.length, base64.indexOf(';'));
		const bytesString = atob(base64.substring(base64.indexOf(',') + 1));
		const bytes = new Uint8Array(bytesString.length);
		for (let i = 0; i < bytesString.length; i++) {
			bytes[i] = bytesString.charCodeAt(i);
		}
		return new Blob([bytes], {type});
	},

	slugToCamel(string) {
		return string.replace(/-([a-z\d])/g, (_, c) => c.toUpperCase());
	},

	camelToSlug(string) {
		return string.replace(/[A-Z\d]/g, c => '-' + c.toLowerCase());
	},

	urlSearchParamsObject(searchString) {
		const params = new URLSearchParams(searchString || location.search);
		const result = {};
		for (const [key, value] of params) {
			const k = this.slugToCamel(key);
			if (Object.hasOwn(result, k)) {
				if (Array.isArray(result[k])) {
					result[k].push(value);
				} else {
					result[k] = [result[k], value];
				}
			} else {
				result[k] = value;
			}
		}
		return result;
	},

	stringToKeyList(string) {
		const result = string.split(' ');
		for (let i = 0; i < result.length; i++) {
			if (result[i] === 'Spacebar') {
				result[i] = ' ';
			}
		}
		if (result.length === 1 && result[0] === '') {
			result.splice(0, 1);
		}
		return result;
	},

	keyListToString(keyList) {
		if (keyList === undefined) {
			return undefined;
		}
		return keyList.map(key => key === ' ' ? 'Spacebar' : key).join(' ');
	},

	stringToButtonList(string) {
		const result = string.split(' ');
		if (result.length === 1 && result[0] === '') {
			result.splice(0, 1);
		}
		return result;
	},

	buttonListToString(buttonList) {
		if (buttonList === undefined) {
			return undefined;
		}
		return buttonList.join(' ');
	},

	inScreen(x, y) {
		return this.between(x, 0, Sunniesnow.game.settings.width) && this.between(y, 0, Sunniesnow.game.settings.height);
	},

	inScreenPage(x, y, canvas) {
		return this.inScreen(...this.pageToCanvasCoordinates(x, y, canvas));
	},

	needsDisplayTextFile(filename) {
		const type = mime.getType(filename);
		if (type?.endsWith('markdown') || type?.endsWith('plain')) {
			return true;
		}
		return [
			/^READ_?ME/i,
			/^LICEN[SC]/i,
			/^NOTICE/i,
			/^COPYING/i,
			/^COPYRIGHT/i,
			/^PATENT/i,
			/^CHANGE_?LOG/i,
			/^CODE_?OF_?CONDUCT/i,
			/^ATTRIBUTION/i,
			/^VERSION/i,
			/^CONTRIBUT/i
		].some(regexp => regexp.test(filename));
	},

	supportsGl() {
		const canvas = document.createElement("canvas");
		const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		return gl instanceof WebGLRenderingContext;
	},

	bufToHex(buf, start = 0, end = buf.length) {
		let result = ''
		for (let i = start; i < end; i++) {
			result += buf[i].toString(16).padStart(2, '0');
		}
		return result;
	},

	isBrowser() {
		return typeof window === 'object';
	},

	isMobileSafari() {
		return this.isBrowser() && /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
	}
};
