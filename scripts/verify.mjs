// Checks the build output: `npm run verify`.
//
// The web bundle must be parseable by Chromium 37, which only understands ES5,
// and the library entries must be loadable ES modules.
import * as acorn from 'acorn';
import path from 'node:path';
import fs from 'node:fs/promises';
import {libDistDirectory, rootDirectory, webDistDirectory} from './site.mjs';

let failures = 0;
function report(ok, message) {
	console.log(`${ok ? 'ok  ' : 'FAIL'} ${message}`);
	if (!ok) {
		failures++;
	}
}

async function exists(file) {
	try {
		await fs.access(file);
		return true;
	} catch (error) {
		return false;
	}
}

async function checkEs5(file) {
	const source = await fs.readFile(file, 'utf8');
	try {
		acorn.parse(source, {ecmaVersion: 5, allowHashBang: true});
		report(true, `${path.relative(rootDirectory, file)} is ES5 (${(source.length / 1024).toFixed(0)} KiB)`);
	} catch (error) {
		report(false, `${path.relative(rootDirectory, file)} is not ES5: ${error.message}`);
	}
}

async function checkModule(file) {
	const source = await fs.readFile(file, 'utf8');
	try {
		acorn.parse(source, {ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true});
		report(true, `${path.relative(rootDirectory, file)} is a valid ES module (${(source.length / 1024).toFixed(0)} KiB)`);
	} catch (error) {
		report(false, `${path.relative(rootDirectory, file)} is not a valid ES module: ${error.message}`);
	}
}

// Every `PIXI.<name>` that the sources use must exist in the PixiJS namespace,
// because a missing name would only fail at runtime.
async function checkPixiExports() {
	const PIXI = await import('pixi.js');
	const used = new Set();
	const walk = async directory => {
		for (const entry of await fs.readdir(directory, {withFileTypes: true})) {
			const file = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				await walk(file);
			} else if (entry.name.endsWith('.js')) {
				const source = (await fs.readFile(file, 'utf8'))
					.replace(/\/\*[\s\S]*?\*\//g, '')
					.replace(/^[ \t]*\/\/.*$/gm, '');
				for (const match of source.matchAll(/\bPIXI\.([A-Za-z_$][\w$]*)/g)) {
					used.add(match[1]);
				}
			}
		}
	};
	await walk(path.join(rootDirectory, 'src', 'js'));
	// NodeCanvasElement is provided by @pixi/node, which the browser build does not use.
	const nodeOnly = new Set(['NodeCanvasElement']);
	const missing = [...used].filter(name => !(name in PIXI) && !nodeOnly.has(name));
	report(missing.length === 0, `all ${used.size} PixiJS names used by the sources exist${missing.length === 0 ? '' : `; missing: ${missing.join(', ')}`}`);
}

// The two entry points of the library must use the PixiJS library they promise.
async function checkPixiEntryPoints() {
	const browserEntry = await fs.readFile(path.join(libDistDirectory, 'index.js'), 'utf8');
	const nodeEntry = await fs.readFile(path.join(libDistDirectory, 'node.js'), 'utf8');
	report(/from "pixi\.js"/.test(browserEntry) && !/@pixi\/node/.test(browserEntry), 'dist/lib/index.js uses pixi.js');
	report(/from "@pixi\/node"/.test(nodeEntry) && !/from "pixi\.js"/.test(nodeEntry), 'dist/lib/node.js uses @pixi/node');
}

// The optional chunks hold the code that should not delay the first rendering of the
// page: they must be ES5 classic scripts that register themselves on the channel that
// the loader of the page sets up, and the service worker must be able to find them.
async function checkOptionalChunks() {
	const manifestFile = path.join(webDistDirectory, 'optional', 'manifest.json');
	if (!(await exists(manifestFile))) {
		report(false, 'dist/web/optional/manifest.json exists');
		return;
	}
	const {chunks} = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
	report(Array.isArray(chunks) && chunks.length > 0, `dist/web/optional/manifest.json lists ${chunks.length} chunk(s)`);
	for (const chunk of chunks) {
		const file = path.join(webDistDirectory, 'optional', chunk);
		const source = await fs.readFile(file, 'utf8');
		report(
			source.includes('SunniesnowOptional.register'),
			`dist/web/optional/${chunk} registers what it provides`
		);
		await checkEs5(file);
	}
	const serviceWorker = await fs.readFile(path.join(webDistDirectory, 'service-worker.js'), 'utf8');
	report(serviceWorker.includes('optional/manifest.json'), 'the service worker caches the optional chunks');
}

// The library builds must not use the loader of the static site: they use a real
// dynamic import, which the consumer's bundler resolves.
async function checkLibraryOptionalModules() {
	const browserEntry = await fs.readFile(path.join(libDistDirectory, 'index.js'), 'utf8');
	report(browserEntry.includes('import("vconsole")'), 'dist/lib/index.js imports its optional modules dynamically');
	report(!browserEntry.includes('SunniesnowOptional'), 'dist/lib/index.js does not use the loader of the static site');
}

// The help page is generated from help.md; check the parts that are easy to get wrong.
async function checkHelpPage() {
	const file = path.join(webDistDirectory, 'help.html');
	if (!(await exists(file))) {
		report(false, 'help.html exists');
		return;
	}
	const html = await fs.readFile(file, 'utf8');
	report(/<h1 id="sunniesnow-help">/.test(html), 'help.html: the headings get their GFM IDs');
	report(/<ul id="markdown-toc">/.test(html), 'help.html: the table of contents is generated');
	report(/<h5 id="level-file-online">/.test(html), 'help.html: an explicit heading ID is used');
	report(/class="katex"/.test(html), 'help.html: the math is rendered by KaTeX');
	report(!/\{:|{%|%}/.test(html), 'help.html: no Liquid or attribute list markup is left over');
	// Every link of the page to an anchor of the page must point at a heading or an
	// element that exists: the table of contents and the cross-references of the
	// settings depend on it.
	const ids = new Set([...html.matchAll(/id="([^"]*)"/g)].map(match => match[1]));
	const targets = [...new Set([...html.matchAll(/href="#([^"]*)"/g)].map(match => match[1]))];
	const dangling = targets.filter(target => !ids.has(target));
	report(dangling.length === 0, `help.html: all ${targets.length} anchor links resolve${dangling.length === 0 ? '' : `; dangling: ${dangling.join(', ')}`}`);
}

const webFiles = ['index.html', 'help.html', 'main.js', 'service-worker.js', 'manifest.json', 'style.css', 'popup/index.html'];
const libFiles = ['index.js', 'node.js'];

console.log('Checking dist/web:');
for (const file of webFiles) {
	report(await exists(path.join(webDistDirectory, file)), `dist/web/${file} exists`);
}
await checkEs5(path.join(webDistDirectory, 'main.js'));
await checkEs5(path.join(webDistDirectory, 'service-worker.js'));
await checkEs5(path.join(webDistDirectory, 'audio', 'FrameReporter.js'));
await checkEs5(path.join(webDistDirectory, 'audio', 'TimeReporter.js'));
await checkOptionalChunks();
await checkHelpPage();

console.log('\nChecking dist/lib:');
for (const file of libFiles) {
	report(await exists(path.join(libDistDirectory, file)), `dist/lib/${file} exists`);
}
await checkModule(path.join(libDistDirectory, 'index.js'));
await checkModule(path.join(libDistDirectory, 'node.js'));
await checkPixiEntryPoints();
await checkLibraryOptionalModules();
await checkPixiExports();

if (failures > 0) {
	console.log(`\n${failures} check(s) failed.`);
	process.exit(1);
}
console.log('\nAll checks passed.');
