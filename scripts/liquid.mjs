// The Liquid engine that renders the static site's templates.
// It replaces Jekyll for the site: the Jekyll-specific tags and filters that the
// templates use are registered here, so that the templates do not need front matter.
import path from 'node:path';
import {Liquid} from 'liquidjs';

// The subset of `strftime` that the templates use. LiquidJS' own `date` filter
// does not support `%F`, `%T` and `%:z`.
const pad = (number, length = 2) => String(number).padStart(length, '0');

function strftime(date, format) {
	const offset = -date.getTimezoneOffset();
	const offsetSign = offset < 0 ? '-' : '+';
	const offsetString = `${offsetSign}${pad(Math.floor(Math.abs(offset) / 60))}${pad(Math.abs(offset) % 60)}`;
	return format.replace(/%([:]?[A-Za-z%])/g, (match, directive) => {
		switch (directive) {
			case 'Y': return String(date.getFullYear());
			case 'm': return pad(date.getMonth() + 1);
			case 'd': return pad(date.getDate());
			case 'e': return String(date.getDate()).padStart(2, ' ');
			case 'H': return pad(date.getHours());
			case 'M': return pad(date.getMinutes());
			case 'S': return pad(date.getSeconds());
			case 'L': return pad(date.getMilliseconds(), 3);
			case 'F': return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
			case 'T': return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
			case 's': return String(Math.floor(date.getTime() / 1000));
			case 'z': return `${offsetSign}${pad(Math.floor(Math.abs(offset) / 60))}${pad(Math.abs(offset) % 60)}`;
			case ':z': return offsetString.replace(/([+-]\d{2})(\d{2})/, '$1:$2');
			case '%': return '%';
			default: return match;
		}
	});
}

export function createLiquidEngine({webSourceDirectory, site, buildInfo}) {
	const engine = new Liquid({
		root: [webSourceDirectory],
		extname: '',
		relativeReference: true,
	});
	engine.registerTag('commit_hash', {
		render() {
			return buildInfo.commitHash;
		},
	});
	engine.registerTag('commit_date', {
		render() {
			return buildInfo.commitDate;
		},
	});
	engine.registerFilter('env', name => process.env[name] ?? '');
	engine.registerFilter('dirname', input => path.posix.dirname(String(input)));
	engine.registerFilter('date', (input, format) => {
		if (input === undefined || input === null || input === '' || input === 'now' || input === 'today') {
			return strftime(new Date(), String(format));
		}
		const date = input instanceof Date ? input : new Date(input);
		if (Number.isNaN(date.getTime())) {
			return String(input);
		}
		return strftime(date, String(format));
	});
	engine.registerFilter('relative_url', input => String(input).replace(/^\//, ''));
	return engine;
}
