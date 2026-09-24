// The esbuild setup shared by the web build and the library build.
import * as babel from '@babel/core';
import fs from 'node:fs/promises';
import path from 'node:path';
import {jsSourceDirectory, rootDirectory, sourceDirectory} from './site.mjs';

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

export function createBabelPlugin({targets = webBabelTargets, patchSource, sourcemap = false} = {}) {
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
					// esbuild composes the inline source maps of its inputs into the
					// source map of the output, so the source maps of the build point at
					// the original sources instead of at the output of Babel.
					sourceMaps: sourcemap ? 'inline' : false,
					sourceFileName: arguments_.path,
					presets: [['@babel/preset-env', {targets, modules: false}]],
				});
				return {contents: result.code, loader: 'js'};
			});
		},
	};
}

// Replaces the contents of src/data/build-info.json with the information collected
// while building the static site.
export function createBuildInfoPlugin(buildInfo) {
	const file = path.join(sourceDirectory, 'data', 'build-info.json');
	const contents = `${JSON.stringify({
		commitHash: buildInfo.commitHash,
		fuckCache: buildInfo.fuckCache,
		environment: buildInfo.environment,
		authentication: buildInfo.authentication,
	}, null, '\t')}\n`;
	return {
		name: 'build-info',
		setup(build) {
			build.onLoad({filter: /build-info\.json$/}, arguments_ => {
				if (arguments_.path !== file) {
					return null;
				}
				return {contents, loader: 'json'};
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
	const loaderModule = path.join(jsSourceDirectory, 'optional-chunks-site.js');
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

// Checks that every optional module the game itself loads is listed in
// src/js/optional-chunks.js, which lists its optional modules explicitly, because a
// bundler cannot resolve a dynamic import with a variable specifier.
export async function checkLibraryOptionalModules(ownSpecifiers) {
	const {optionalLoaders} = await import('../src/js/optional-chunks.js');
	const missing = [...ownSpecifiers].filter(specifier => !(specifier in optionalLoaders));
	if (missing.length > 0) {
		throw new Error(`These optional modules are missing from src/js/optional-chunks.js: ${missing.join(', ')}`);
	}
}

// The site's loader of the optional chunks is a classic script loader, which only the
// static site uses (see src/js/optional-chunks-site.js). The library builds use the
// module that the game imports, which loads the chunks with a dynamic import.
export function createOptionalChunksAliasPlugin() {
	const module = path.join(jsSourceDirectory, 'optional-chunks.js');
	const siteModule = path.join(jsSourceDirectory, 'optional-chunks-site.js');
	return {
		name: 'optional-chunks-alias',
		setup(build) {
			build.onResolve({filter: /^\.\.?\/.*optional-chunks\.js$/}, arguments_ => {
				const resolved = path.resolve(path.dirname(arguments_.importer), arguments_.path);
				return resolved === module ? {path: siteModule} : null;
			});
		},
	};
}

// The published library keeps the file structure of src/js, one file per module, so
// that it can be read and debugged like the sources (see scripts/build-lib.mjs). The
// relative imports of a module are therefore left alone — except the ones that the
// aliases of a build point elsewhere, which is how the node build of the library gets
// @pixi/node instead of pixi.js.
export function createLibTreePlugin(aliases) {
	return {
		name: 'lib-tree',
		setup(build) {
			build.onResolve({filter: /^\.\.?\//}, arguments_ => {
				// JSON imports are inlined by esbuild, so that the library does not
				// depend on how the consumer imports JSON.
				if (arguments_.path.endsWith('.json')) {
					return null;
				}
				const resolved = path.resolve(path.dirname(arguments_.importer), arguments_.path);
				const alias = aliases.get(resolved);
				if (!alias) {
					return {path: arguments_.path, external: true};
				}
				let relative = path.relative(path.dirname(arguments_.importer), alias).split(path.sep).join('/');
				if (!relative.startsWith('.')) {
					relative = `./${relative}`;
				}
				return {path: relative, external: true};
			});
		},
	};
}
