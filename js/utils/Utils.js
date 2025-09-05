Sunniesnow.Utils = {
	isValidUrl(text) {
		try {
			new URL(text);
		} catch(e) {
			return false;
		}
		return true;
	},

	url(basePath, text, suffix = '') {
		if (Sunniesnow.Utils.isValidUrl(text)) {
			return text;
		} else {
			let result = `${Sunniesnow.Config.SERVER_BASE_URL}/${basePath}/${text.endsWith(suffix) ? text : text + suffix}`;
			if (Sunniesnow.authentication) {
				result += `${result.includes('?') ? '&' : '?'}authentication=${Sunniesnow.authentication}`;
			}
			return result;
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
			path[i] *= -1;
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
		return [Math.hypot(x, y), Math.atan2(y, x)];
	},
	
	between(x, a, b) {
		return a <= x && x <= b || b <= x && x <= a;
	},

	drawDashedLine(graphics, x0, y0, x1, y1, dashLength, gapLength) {
		const dx = x1 - x0;
		const dy = y1 - y0;
		const length = Math.hypot(dx, dy);
		if (length === 0) {
			return;
		}
		const dashDx = dashLength * dx / length;
		const dashDy = dashLength * dy / length;
		const gapDx = gapLength * dx / length;
		const gapDy = gapLength * dy / length;
		let x = x0;
		let y = y0;
		while (Sunniesnow.Utils.between(x, x0, x1) && Sunniesnow.Utils.between(y, y0, y1)) {
			graphics.moveTo(x, y);
			x += dashDx;
			y += dashDy;
			graphics.lineTo(x, y);
			x += gapDx;
			y += gapDy;
		}
		return graphics;
	},

	minmax(...numbers) {
		return [Math.min(...numbers), Math.max(...numbers)];
	},

	pageToCanvasCoordinates(pageX, pageY, canvas) {
		const rect = canvas.getBoundingClientRect();
		rect.x += window.scrollX;
		rect.y += window.scrollY;
		let scaleX = canvas.width / canvas.offsetWidth;
		let scaleY = canvas.height / canvas.offsetHeight;
		if (canvas.ownerDocument.fullscreenElement === canvas) {
			scaleX = scaleY = Math.max(scaleX, scaleY);
		}
		return [
			(pageX - rect.x - rect.width/2) * scaleX + canvas.width/2,
			(pageY - rect.y - rect.height/2) * scaleY + canvas.height/2
		];
	},

	distance(x0, y0, x1, y1) {
		return Math.hypot(x1 - x0, y1 - y0);
	},

	// The L-infinity distance
	lInfDistance(x0, y0, x1, y1) {
		return Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
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
		return (Math.trunc(number * 10000) / 100).toFixed(2) + '%';
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

	camelToUnderscore(string) {
		return string.replace(/[A-Z\d]/g, c => '_' + c.toLowerCase());
	},

	urlSearchParamsObject(searchString) {
		const params = new URLSearchParams(searchString || location.search);
		const result = {};
		for (const [key, value] of params) {
			const k = Sunniesnow.Utils.slugToCamel(key);
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
		return Sunniesnow.Utils.between(x, 0, Sunniesnow.Config.WIDTH) && Sunniesnow.Utils.between(y, 0, Sunniesnow.Config.HEIGHT);
	},

	inScreenPage(x, y, canvas) {
		return Sunniesnow.Utils.inScreen(...Sunniesnow.Utils.pageToCanvasCoordinates(x, y, canvas));
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
		return typeof window === 'object' || typeof self === 'object';
	},

	isMobileSafari() {
		return Sunniesnow.Utils.isBrowser() && /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
	},

	until(condition, interval = 100) {
		let time = 0;
		const poll = (resolve, reject) => {
			if (condition(time)) {
				resolve();
			} else {
				setTimeout(() => poll(resolve), interval);
			}
			time += interval;
		};
		return new Promise(poll);
	},

	isBlobUrl(url) {
		return url.startsWith('blob:');
	},

	async strictFetch(url, options) {
		return fetch(url, options).then(response => {
			if (!response.ok) {
				let message = `HTTP ${response.status}`;
				if (response.statusText) {
					message += `: ${response.statusText}`;
				}
				throw new Error(message);
			}
			return response;
		});
	},

	async untilLoaded(elementId) {
		const element = elementId instanceof HTMLElement ? elementId : document.getElementById(elementId);
		const img = document.createElement('img');
		img.src = '';
		element.appendChild(img);
		return new Promise((resolve, reject) => img.addEventListener('error', event => {
			element.removeChild(img);
			resolve();
		}));
	},

	newCanvas(width, height) {
		if (Sunniesnow.Utils.isBrowser()) {
			const result = document.createElement('canvas');
			result.width = width;
			result.height = height;
			return result;
		} else {
			return new PIXI.NodeCanvasElement(width, height);
		}
	},

	// range: [-pi, pi)
	angleDifference(angle1, angle2) {
		return Sunniesnow.Utils.quo(angle1 - angle2 + Math.PI, Math.PI*2)[1] - Math.PI;
	},

	angleDistance(angle1, angle2) {
		return Math.abs(Sunniesnow.Utils.angleDifference(angle1, angle2));
	},

	transposeArray(array) {
		return array[0].map((_, i) => array.map(row => row[i]));
	},

	currentTimeIso() {
		const date = new Date();
		const timezoneOffset = -date.getTimezoneOffset();
		return date.getFullYear().toString().padStart(4, '0') +
			'-' + (date.getMonth() + 1).toString().padStart(2, '0') +
			'-' + date.getDate().toString().padStart(2, '0') +
			'T' + date.getHours().toString().padStart(2, '0') +
			':' + date.getMinutes().toString().padStart(2, '0') +
			':' + date.getSeconds().toString().padStart(2, '0') +
			(timezoneOffset >= 0 ? '+' : '-') +
			Math.floor(Math.abs(timezoneOffset) / 60).toString().padStart(2, '0') +
			':' + (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
	},

	download(url, filename) {
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.style.display = 'none';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	},

	downloadText(text, filename, type = 'text/plain') {
		const url = Sunniesnow.ObjectUrl.createPersistent(new Blob([text], {type}));
		this.download(url, filename);
		if (!this.isAndroidWebView()) { // causes bug in Android WebView
			Sunniesnow.ObjectUrl.revoke(url);
		}
	},

	judgementText(judgement) {
		switch (judgement) {
			case 'perfect':
				return 'Perfect';
			case 'good':
				return 'Good';
			case 'bad':
				return Sunniesnow.game.settings.lyrica5 ? 'Ok' : 'Bad';
			case 'miss':
				return 'Miss';
			default:
				this.warn(`Unknown judgement: ${judgement}`);
				return this.upcaseFirst(judgement);
		}
	},

	isAndroidWebView() {
		return this.isBrowser() && !navigator.mediaSession;
	},

	fonts(family) {
		if (!this.isBrowser() && process.platform === 'win32') {
			return `${family},Cambria,MicroSoft YaHei`;
		}
		return family;
	},

	countLines(string) {
		return string.split('\n').length;
	},

	// If there no match, return the next index.
	// Less than all: return 0. Greater than all: return array.length.
	// Empty: return 0.
	bisectLeft(array, compareFn, low = 0, high = array.length) {
		if (typeof compareFn !== 'function') {
			const value = compareFn;
			compareFn = e => e < value ? -1 : e > value ? 1 : 0;
		}
		while (low < high) {
			const mid = low + high >>> 1;
			const compare = compareFn(array[mid]);
			if (compare === 0) {
				return mid;
			} else if (compare < 0) {
				low = mid + 1;
			} else {
				high = mid;
			}
		}
		return low;
	},

	// If there no match, return the previous index.
	// Less than all: return -1. Greater than all: return array.length - 1.
	// Empty: return -1.
	bisectRight(array, compareFn, low = 0, high = array.length) {
		if (typeof compareFn !== 'function') {
			const value = compareFn;
			compareFn = e => e < value ? -1 : e > value ? 1 : 0;
		}
		while (low < high) {
			const mid = low + high >>> 1;
			const compare = compareFn(array[mid]);
			if (compare === 0) {
				return mid;
			} else if (compare < 0) {
				low = mid + 1;
			} else {
				high = mid;
			}
		}
		return high - 1;
	},

	// Returns [a - b, b - a].
	// Not the best algorithm, but should be fast enough.
	bidirectionalSetMinus(a, b) {
		aMinusB = [];
		for (const e of a) {
			if (!b.includes(e)) {
				aMinusB.push(e);
			}
		}
		bMinusA = [];
		for (const e of b) {
			if (!a.includes(e)) {
				bMinusA.push(e);
			}
		}
		return [aMinusB, bMinusA];
	},

	// events: an array of objects; each of them is understood as an event.
	// beginFn: maps an event to its begin time.
	// endFn: maps an event to its end time.
	// Returns an array of objects `{time:, events:}`,
	// where `events` is the array of events (sorted by begin time) that is active since `time`.
	eventsTimeline(events, beginFn, endFn) {
		const instants = [];
		events.forEach(event => {
			const begin = beginFn(event);
			const end = endFn(event);
			if (begin < end) {
				instants.push({time: begin, event, appear: true});
				instants.push({time: end, event, appear: false});
			}
		});
		instants.sort((a, b) => a.time - b.time);
		result = [{time: -Infinity, events: []}];
		for (const {time, event, appear} of instants) {
			let {time: lastTime, events} = result[result.length - 1];
			if (time !== lastTime) {
				events = events.slice();
				result.push({time, events});
			}
			appear ? events.push(event) : events.splice(events.indexOf(event), 1);
		}
		return result;
	},

	average(array, fn = e => e) {
		return array.reduce((sum, e) => sum + fn(e), 0) / array.length;
	},

	colorMatrixInterpolate(topColor, alpha, outArray) {
		const r = (topColor >> 16) / 0xff;
		const g = (topColor >> 8 & 0xff) / 0xff;
		const b = (topColor & 0xff) / 0xff;
		const a = alpha;
		outArray[0] = 1-a;
		outArray[1] = 0;
		outArray[2] = 0;
		outArray[3] = 0;
		outArray[4] = r*a;
		outArray[5] = 0;
		outArray[6] = 1-a;
		outArray[7] = 0;
		outArray[8] = 0;
		outArray[9] = g*a;
		outArray[10] = 0;
		outArray[11] = 0;
		outArray[12] = 1-a;
		outArray[13] = 0;
		outArray[14] = b*a;
		outArray[15] = 0;
		outArray[16] = 0;
		outArray[17] = 0;
		outArray[18] = 1;
		outArray[19] = 0;
	},
	
	dirname(path) {
		return path.replace(/\/[^/]*$/, '');
	},
	
	isPrivate(hostname) {
		return [
			/^localhost$/i,
			/^(0|10|127)\.\d+\.\d+\.\d+$/,
			/^192\.168\.\d+\.\d+$/,
			/^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+$/,
		].some(regexp => regexp.test(hostname));
	},

	async sha256(data) {
		if (!crypto?.subtle) {
			Sunniesnow.Logs.warn('Crypto.subtle API not available');
			return null;
		}
		if (typeof data === 'string') {
			data = new TextEncoder().encode(data);
		} else if (data instanceof Blob) {
			data = await data.arrayBuffer();
		}
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const array = Array.from(new Uint8Array(hashBuffer))
		return array.map(b => b.toString(16).padStart(2, '0')).join('');
	},

	arrayDifference(array) {
		const result = [];
		for (let i = 0; i < array.length - 1; i++) {
			result.push(array[i+1] - array[i]);
		}
		return result;
	},

	eachWithRedoingIf(array, predicate) {
		for (let i = 0; i < array.length;) {
			if (!predicate(array[i], i, array)) {
				i++;
			}
		}
	},

	base() {
		return Sunniesnow.Utils.isBrowser() ? Sunniesnow.Utils.dirname(location.pathname) : '/game'
	},

	compactify(array) {
		let nullCount = 0;
		for (let i = 0; i < array.length; i++) {
			if (array[i] == null) {
				nullCount++;
			} else {
				array[i - nullCount] = array[i];
			}
		}
		array.length -= nullCount;
		return array;
	},

	// dataPoints: an array of {time, value} objects.
	// Interpolates each consecutive pair of points linearly,
	// and returns an array of {time, sign} objects,
	// where `time` is the time of the point and it is when the line crosses the target value,
	// and `sign` is one of -1, 0, 1,
	// depending on whether the line is above or below the target value immediately after the point.
	solveBrokenLine(dataPoints, targetValue = 0) {
		const result = [];
		for (let i = 0; i < dataPoints.length - 1; i++) {
			const {time: t1, value: v1} = dataPoints[i];
			const {time: t2, value: v2} = dataPoints[i + 1];
			if (v1 <= targetValue && targetValue < v2) {
				result.push({
					time: t1 + (t2 - t1) * (targetValue - v1) / (v2 - v1),
					sign: 1
				});
			} else if (v1 >= targetValue && targetValue > v2) {
				result.push({
					time: t1 + (t2 - t1) * (targetValue - v1) / (v2 - v1),
					sign: -1
				});
			} else if (v1 === targetValue && v2 === targetValue && result[result.length - 1]?.sign !== 0) {
				result.push({time: t1, sign: 0});
			}
		}
		return result;
	},

	isValidUniformValue(value, type) {
		const [_, n] = /^vec(\d+)/.exec(type) ?? [];
		if (n != null) {
			return Array.isArray(value) && value.length === parseInt(n) && value.every(v => typeof v === 'number');
		}
		const [__, a, b] = /^mat(\d+)x(\d+)/.exec(type) ?? [];
		if (a != null && b != null) {
			return Array.isArray(value) && value.length === parseInt(a) * parseInt(b) && value.every(v => typeof v === 'number');
		}
		return typeof value === 'number' || Array.isArray(value) && value.length === 1 && typeof value[0] === 'number';
	},

	async deleteIfAsync(array, predicate) {
		const shouldDelete = await Promise.all(array.map(predicate));
		let count = 0;
		for (let i = 0; i < array.length; i++) {
			if (shouldDelete[i]) {
				count++;
			} else {
				array[i - count] = array[i];
			}
		}
		array.length -= count;
		return array;
	},

	glType(type) {
		const basicTypes = {bool: 'bool', i32: 'int', u32: 'uint', f32: 'float'};
		if (basicTypes[type]) {
			return basicTypes[type];
		}
		const [_, base, typeParam] = type.match(/^(.+)<(.+)>$/) || [];
		if (!base || !typeParam) {
			return null;
		}
		return typeParam === 'f32' ? base : `${basicTypes[typeParam][0]}${base}`;
	},

	isFontAvailable(fontFamily) {
		if (!Sunniesnow.Utils.isBrowser()) {
			return false;
		}
		if (!document.fonts || !document.fonts.check) {
			Sunniesnow.Logs.warn('FontFaceSet API not available');
			return false;
		}
		return document.fonts.check(`12px ${fontFamily}`)
	}
};
