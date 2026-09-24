// The esbuild setup shared by the web build and the library build.
import * as babel from '@babel/core';
import fs from 'node:fs/promises';
import path from 'node:path';
import {jsSourceDirectory, rootDirectory} from './site.mjs';

// The browsers that the web build supports. Chromium 37 only understands ES5,
// so everything (including the dependencies) is transpiled and polyfilled.
export const webBabelTargets = {chrome: '37'};

// These packages are already written in ES5 and must not be transpiled:
// core-js patches the built-ins from ES5 code and regenerator-runtime
// implements generators without native generator support.
const alreadyEs5 = [
	path.join(rootDirectory, 'node_modules', 'core-js'),
	path.join(rootDirectory, 'node_modules', 'regenerator-runtime'),
	path.join(rootDirectory, 'node_modules', 'whatwg-fetch'),
];

export function createBabelPlugin({targets = webBabelTargets, patchSource} = {}) {
	return {
		name: 'babel',
		setup(build) {
			build.onLoad({filter: /\.[cm]?js$/}, async arguments_ => {
				if (alreadyEs5.some(directory => arguments_.path.startsWith(directory))) {
					return null;
				}
				let source = await fs.readFile(arguments_.path, 'utf8');
				if (patchSource) {
					source = patchSource(arguments_.path, source);
				}
				const result = await babel.transformAsync(source, {
					filename: arguments_.path,
					cwd: rootDirectory,
					sourceType: 'unambiguous',
					babelrc: false,
					configFile: false,
					compact: false,
					presets: [['@babel/preset-env', {targets, modules: false}]],
				});
				return {contents: result.code, loader: 'js'};
			});
		},
	};
}

// Replaces the contents of src/js/build-info.js with the information collected
// while building the static site.
export function createBuildInfoPlugin(buildInfo) {
	const file = path.join(jsSourceDirectory, 'build-info.js');
	const contents = `export default ${JSON.stringify({
		commitHash: buildInfo.commitHash,
		fuckCache: buildInfo.fuckCache,
		environment: buildInfo.environment,
		authentication: buildInfo.authentication,
	}, null, '\t')};\n`;
	return {
		name: 'build-info',
		setup(build) {
			build.onLoad({filter: /build-info\.js$/}, arguments_ => {
				if (arguments_.path !== file) {
					return null;
				}
				return {contents, loader: 'js'};
			});
		},
	};
}

// The build of main.js has to know every module that is loaded on demand, so that
// scripts/optional-chunks.mjs can build a chunk for each of them:
//   - the dynamic imports of @audio/decode, which are rewritten below, because
//     Chromium 37 cannot parse `import()` and because every decoder would otherwise
//     end up in the main bundle (the loaders have the same shape either way: they are
//     only awaited, and then `default` and `decoder` are read from the result);
//   - the calls to loadOptionalChunk(), which the game itself makes.
// The two patches of this module also check that none of them is left behind.
export function createOptionalChunksPatch({specifiers, ownSpecifiers}) {
	const loaderModule = path.join(jsSourceDirectory, 'optional-chunks.js');
	const identifier = '__sunniesnowLoadOptionalChunk__';
	const decoderImport = /(?:^|[^\w$.])import\(\s*(['"])(@audio\/decode-[a-z0-9-]+)\1\s*\)/g;
	const loaderCall = /loadOptionalChunk\(\s*(['"])([^'"]+)\1\s*\)/g;
	return function patchOptionalChunks(file, source) {
		if (file.startsWith(jsSourceDirectory)) {
			// The modules that the game itself loads on demand, before the loader
			// that it calls is renamed below.
			for (const match of source.matchAll(loaderCall)) {
				specifiers.add(match[2]);
				ownSpecifiers.add(match[2]);
			}
		}
		if (!source.includes('@audio/decode-') || !source.includes('import(')) {
			return source;
		}
		let count = 0;
		const patched = source.replace(decoderImport, (match, quote, specifier) => {
			count++;
			specifiers.add(specifier);
			// Keep whatever preceded the `import(`.
			const prefix = match.slice(0, match.indexOf('import('));
			return `${prefix}${identifier}(${quote}${specifier}${quote})`;
		});
		if (count === 0) {
			// The decoders are no longer loaded with `import()`: they would be bundled
			// into the main bundle instead of being optional chunks.
			throw new Error(`No dynamic import of an audio decoder was found in ${file}`);
		}
		return `import {loadOptionalChunk as ${identifier}} from ${JSON.stringify(loaderModule)};\n${patched}`;
	};
}

// Checks that every optional module the game itself loads is also loadable by the
// library builds, which list their optional modules explicitly (see
// src/js/optional-chunks-import.js), because a bundler cannot resolve a dynamic
// import with a variable specifier.
export async function checkLibraryOptionalModules(ownSpecifiers) {
	const {optionalLoaders} = await import('../src/js/optional-chunks-import.js');
	const missing = [...ownSpecifiers].filter(specifier => !(specifier in optionalLoaders));
	if (missing.length > 0) {
		throw new Error(`These optional modules are missing from src/js/optional-chunks-import.js: ${missing.join(', ')}`);
	}
}

// The optional chunks are loaded by classic scripts (see src/js/optional-chunks.js),
// which is the implementation of the loader that the static site uses. The library
// builds use ./optional-chunks-import.js instead, which uses a real dynamic import.
function optionalLoaderAliases() {
	return new Map([
		[path.join(jsSourceDirectory, 'optional-chunks.js'), path.join(jsSourceDirectory, 'optional-chunks-import.js')],
	]);
}

// Makes a library build load its optional modules the way a library should.
export function createLibraryAliasesPlugin() {
	const aliases = optionalLoaderAliases();
	return {
		name: 'library-aliases',
		setup(build) {
			build.onResolve({filter: /^\.\.?\/.*\.js$/}, arguments_ => {
				const resolved = path.resolve(path.dirname(arguments_.importer), arguments_.path);
				return aliases.has(resolved) ? {path: aliases.get(resolved)} : null;
			});
		},
	};
}

// Makes a build use the implementations that only work on Node.js
// (@pixi/node instead of pixi.js, and require() instead of the stub),
// which is what the `sunniesnow/node` entry point is about.
export function createNodeEntryAliasesPlugin() {
	const aliases = new Map([
		...optionalLoaderAliases(),
		[path.join(jsSourceDirectory, 'pixi.js'), path.join(jsSourceDirectory, 'pixi-node.js')],
		[path.join(jsSourceDirectory, 'node-require.js'), path.join(jsSourceDirectory, 'node-require-node.js')],
	]);
	return {
		name: 'node-entry-aliases',
		setup(build) {
			build.onResolve({filter: /^\.\.?\/.*\.js$/}, arguments_ => {
				const resolved = path.resolve(path.dirname(arguments_.importer), arguments_.path);
				return aliases.has(resolved) ? {path: aliases.get(resolved)} : null;
			});
		},
	};
}
