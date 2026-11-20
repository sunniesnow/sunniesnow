import * as babel from '@babel/core';
import fs from 'node:fs/promises';
import path from 'node:path';
import {rootDirectory, sourceDirectory} from './site.mjs';

export const webBabelTargets = {chrome: '37'};

const alreadyEs5 = [
	path.join(rootDirectory, 'node_modules', 'core-js'),
	path.join(rootDirectory, 'node_modules', 'regenerator-runtime'),
	path.join(rootDirectory, 'node_modules', 'whatwg-fetch'),
];

export function createBabelPlugin({targets = webBabelTargets, sourcemap = false} = {}) {
	return {
		name: 'babel',
		setup(build) {
			build.onLoad({filter: /\.[cm]?js$/}, async arguments_ => {
				if (alreadyEs5.some(directory => arguments_.path.startsWith(directory))) {
					return null;
				}
				const source = await fs.readFile(arguments_.path, 'utf8');
				const result = await babel.transformAsync(source, {
					filename: arguments_.path,
					cwd: rootDirectory,
					sourceType: 'unambiguous',
					babelrc: false,
					configFile: false,
					compact: false,
					// esbuild composes the inline source maps of its inputs into the source map of the output
					// so the source maps of the build point at the original sources instead of at the output of Babel
					sourceMaps: sourcemap ? 'inline' : false,
					sourceFileName: arguments_.path,
					presets: [['@babel/preset-env', {targets, modules: false}]],
				});
				return {contents: result.code, loader: 'js'};
			});
		},
	};
}

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

export function createLibTreePlugin(aliases) {
	return {
		name: 'lib-tree',
		setup(build) {
			build.onResolve({filter: /^\.\.?\//}, arguments_ => {
				// JSON imports are inlined by esbuild
				// so that the library does not depend on how the consumer imports JSON
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
