// Builds the importable library in dist/lib, which is what the npm package contains.
//
// The library is not one file: every module of src/js is built into its own file, so
// that the published library keeps the file structure of the sources and can be read
// and debugged like them. (The web bundle is one file; a library is not, and the
// consumers' bundlers are the ones that decide what to do with it.)
//
// The two variants are two builds of the same tree and differ only in the modules that
// provide the environment. Their roots are the entry points of the package:
//
//   sunniesnow       -> dist/lib/browser/index.js, which uses pixi.js
//   sunniesnow/node  -> dist/lib/node/index.js,    which uses @pixi/node
//
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
	// Every module is an entry point, so that every module is emitted; the relative
	// imports between them are kept by createLibTreePlugin, which is also what keeps
	// the structure of the tree.
	const entryPoints = await listModules(jsSourceDirectory);
	await esbuild.build({
		entryPoints,
		outbase: jsSourceDirectory,
		outdir,
		bundle: true,
		format: 'esm',
		platform: 'neutral',
		target: 'es2022',
		// A library does not bundle its dependencies: they are resolved from the
		// package.json of the consumer (see the `dependencies` of this package).
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
		aliases: new Map([
			[path.join(jsSourceDirectory, 'pixi.js'), path.join(jsSourceDirectory, 'pixi-node.js')],
			[path.join(jsSourceDirectory, 'node-require.js'), path.join(jsSourceDirectory, 'node-require-node.js')],
		]),
		minify,
		sourcemap,
	});
}
