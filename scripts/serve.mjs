// Serves dist/web for local development: `npm run serve -- [--port 4000]`.
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import {webDistDirectory} from './site.mjs';

const contentTypes = {
	'.css': 'text/css',
	'.html': 'text/html',
	'.ico': 'image/x-icon',
	'.js': 'text/javascript',
	'.json': 'application/json',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.woff2': 'font/woff2',
};

const portArgument = process.argv.indexOf('--port');
const port = Number(portArgument === -1 ? process.env.PORT ?? 4000 : process.argv[portArgument + 1]);

const server = http.createServer(async (request, response) => {
	const url = new URL(request.url, `http://${request.headers.host}`);
	let pathname = decodeURIComponent(url.pathname);
	if (pathname.endsWith('/')) {
		pathname += 'index.html';
	}
	const file = path.join(webDistDirectory, path.normalize(pathname).replace(/^([/\\])+/, ''));
	if (!file.startsWith(webDistDirectory)) {
		response.writeHead(403).end('Forbidden');
		return;
	}
	try {
		const contents = await fs.readFile(file);
		// The service worker sets these headers for cross-origin isolation,
		// and the audio time reporter needs it, so do the same here.
		response.writeHead(200, {
			'Content-Type': contentTypes[path.extname(file)] ?? 'application/octet-stream',
			'Cross-Origin-Embedder-Policy': 'require-corp',
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cache-Control': 'no-cache',
		});
		response.end(contents);
	} catch (error) {
		response.writeHead(404, {'Content-Type': 'text/plain'}).end(`Not found: ${pathname}`);
	}
});

server.listen(port, () => {
	console.log(`Serving ${webDistDirectory} at http://localhost:${port}/`);
});
