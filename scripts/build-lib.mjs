// Builds the importable library in dist/lib, which is what the npm package contains.
import * as esbuild from 'esbuild';
import path from 'node:path';
import fs from 'node:fs/promises';
import {createLibraryAliasesPlugin, createNodeEntryAliasesPlugin} from './bundle.mjs';
import {libDistDirectory, libSourceDirectory, rootDirectory} from './site.mjs';

const commonOptions = {
	bundle: true,
	format: 'esm',
	platform: 'neutral',
	target: 'es2022',
	// A library does not bundle its dependencies: they are resolved from the
	// package.json of the consumer (see the `dependencies` of this package).
	packages: 'external',
	legalComments: 'eof',
	sourcemap: false,
	logLevel: 'warning',
};

export async function buildLib() {
	console.log(`Building the library in ${path.relative(rootDirectory, libDistDirectory)}`);
	await fs.rm(libDistDirectory, {recursive: true, force: true});
	await fs.mkdir(libDistDirectory, {recursive: true});
	await esbuild.build({
		...commonOptions,
		entryPoints: [path.join(libSourceDirectory, 'index.js')],
		outfile: path.join(libDistDirectory, 'index.js'),
		plugins: [createLibraryAliasesPlugin()],
	});
	await esbuild.build({
		...commonOptions,
		entryPoints: [path.join(libSourceDirectory, 'node.js')],
		outfile: path.join(libDistDirectory, 'node.js'),
		plugins: [createNodeEntryAliasesPlugin()],
	});
}
