import * as esbuild from 'esbuild';
import path from 'node:path';
import fs from 'node:fs/promises';
import {createLibTreePlugin} from './bundle.mjs';
import {jsSourceDirectory, libDistDirectory, rootDirectory} from './site.mjs';

async function listModules(directory) {
	const entries = await fs.readdir(directory, {withFileTypes: true});
	const files = await Promise.all(entries.map(entry => {
		const file = path.join(directory, entry.name);
		return entry.isDirectory() ? listModules(file) : entry.name.endsWith('.js') ? [file] : [];
	}));
	return files.flat();
}

async function buildTree({name, outdir, aliases, minify, sourcemap}) {
	const entryPoints = await listModules(jsSourceDirectory);
	await esbuild.build({
		entryPoints,
		outbase: jsSourceDirectory,
		outdir,
		bundle: true,
		format: 'esm',
		platform: 'neutral',
		target: 'es2022',
		packages: 'external',
		plugins: [createLibTreePlugin(aliases)],
		minify,
		sourcemap: sourcemap ? 'linked' : false,
		logLevel: 'warning',
	});
}

export async function buildLib({minify, sourcemap}) {
	console.log(`Building the library in ${path.relative(rootDirectory, libDistDirectory)} (${minify ? 'minified' : 'not minified'}, ${sourcemap ? 'with source maps' : 'without source maps'})`);
	await fs.rm(libDistDirectory, {recursive: true, force: true});
	await buildTree({
		name: 'browser',
		outdir: path.join(libDistDirectory, 'browser'),
		aliases: new Map(),
		minify,
		sourcemap,
	});
	await buildTree({
		name: 'node',
		outdir: path.join(libDistDirectory, 'node'),
		aliases: new Map([[path.join(jsSourceDirectory, 'platform.js'), path.join(jsSourceDirectory, 'platform-node.js')]]),
		minify,
		sourcemap,
	});
}
