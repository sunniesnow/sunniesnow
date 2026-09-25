// Builds the standalone static website in dist/web.
import * as esbuild from 'esbuild';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
	checkLibraryOptionalModules,
	createBabelPlugin,
	createBuildInfoPlugin,
	createOptionalChunksAliasPlugin,
	createOptionalChunksPatch,
	webBabelTargets,
} from './bundle.mjs';
import {buildOptionalChunks, createOptionalSpecifierCollector} from './optional-chunks.mjs';
import {createLiquidEngine} from './liquid.mjs';
import {renderMarkdown, stripFrontMatter} from './markdown.mjs';
import {
	collectBuildInfo,
	downloadFavicons,
	jsSourceDirectory,
	readSiteConfig,
	rootDirectory,
	webDistDirectory,
	webSourceDirectory,
} from './site.mjs';

const scriptOptions = ({minify, sourcemap}) => ({
	minify,
	legalComments: 'eof',
	sourcemap: sourcemap ? 'linked' : false,
	logLevel: 'warning',
});

async function renderPages({engine, site, buildInfo}) {
	const context = extra => ({site, fuck_cache: buildInfo.fuckCache, ...extra});
	// index.html: the Jekyll layout is applied by the `{% layout %}` tag in the
	// template itself, which is why the templates need no front matter.
	await fs.writeFile(path.join(webDistDirectory, 'index.html'), await engine.renderFile('index.html', context({
		title: site.title,
		description: 'Sunniesnow is a web rhythm game',
		canonical: `${site.url}/`,
	})));
	await fs.mkdir(path.join(webDistDirectory, 'popup'), {recursive: true});
	await fs.writeFile(path.join(webDistDirectory, 'popup', 'index.html'), await engine.renderFile('popup/index.html', context({
		title: 'Sunniesnow popup',
		canonical: `${site.url}/popup/`,
	})));
	await fs.writeFile(path.join(webDistDirectory, 'manifest.json'), await engine.parseAndRender(
		await fs.readFile(path.join(webSourceDirectory, 'manifest.json'), 'utf8'),
		context({})
	));
	// help.html is the Markdown page: it is processed by Liquid, then by marked.
	const markdown = stripFrontMatter(await fs.readFile(path.join(webSourceDirectory, 'help.md'), 'utf8'));
	const helpContents = renderMarkdown(await engine.parseAndRender(markdown, context({})));
	const layout = await fs.readFile(path.join(webSourceDirectory, '_layout.html'), 'utf8');
	await fs.writeFile(path.join(webDistDirectory, 'help.html'), await engine.parseAndRender(layout, context({
		title: 'Sunniesnow Help',
		canonical: `${site.url}/help.html`,
		math: true,
		content: helpContents,
	})));
}

async function renderServiceWorker({buildInfo, options}) {
	await esbuild.build({
		entryPoints: [path.join(webSourceDirectory, 'service-worker.js')],
		outfile: path.join(webDistDirectory, 'service-worker.js'),
		bundle: true,
		format: 'iife',
		platform: 'browser',
		target: 'es5',
		plugins: [createBuildInfoPlugin(buildInfo), createBabelPlugin()],
		...scriptOptions(options),
	});
}

async function buildScripts({buildInfo, options}) {  // options: {minify, sourcemap}
	// The dynamic imports that main.js cannot contain (Chromium 37 cannot parse
	// `import()`) are collected here, so that the build knows which optional chunks
	// to generate.
	const optionalSpecifiers = createOptionalSpecifierCollector();
	const ownOptionalSpecifiers = createOptionalSpecifierCollector();
	await esbuild.build({
		entryPoints: [path.join(webSourceDirectory, 'main.js')],
		outfile: path.join(webDistDirectory, 'main.js'),
		bundle: true,
		format: 'iife',
		platform: 'browser',
		target: 'es5',
		plugins: [
			createBuildInfoPlugin(buildInfo),
			createBabelPlugin({
				targets: webBabelTargets,
				patchSource: createOptionalChunksPatch({
					specifiers: optionalSpecifiers,
					ownSpecifiers: ownOptionalSpecifiers,
				}),
				sourcemap: options.sourcemap,
			}),
			createOptionalChunksAliasPlugin(),
		],
		...scriptOptions(options),
	});
	await checkLibraryOptionalModules(ownOptionalSpecifiers);
	await buildOptionalChunks({specifiers: optionalSpecifiers, ...options});
	// The audio worklet and the worker that report the audio time cannot be part of
	// the main bundle, because they are loaded as separate scripts by the browser.
	for (const name of ['FrameReporter', 'TimeReporter']) {
		await esbuild.build({
			entryPoints: [path.join(jsSourceDirectory, 'audio', `${name}.js`)],
			outfile: path.join(webDistDirectory, 'audio', `${name}.js`),
			bundle: true,
			format: 'iife',
			platform: 'browser',
			target: 'es5',
			plugins: [createBabelPlugin({sourcemap: options.sourcemap})],
				...scriptOptions(options),
		});
	}
}

async function copyStaticFiles() {
	await fs.copyFile(
		path.join(webSourceDirectory, 'style.css'),
		path.join(webDistDirectory, 'style.css')
	);
	await fs.copyFile(
		path.join(webSourceDirectory, 'popup', 'style.css'),
		path.join(webDistDirectory, 'popup', 'style.css')
	);
	// KaTeX's stylesheet and fonts are served by the site itself,
	// so that the help page does not depend on a CDN.
	const katexDist = path.join(rootDirectory, 'node_modules', 'katex', 'dist');
	const katexTarget = path.join(webDistDirectory, 'katex');
	await fs.mkdir(katexTarget, {recursive: true});
	await fs.copyFile(path.join(katexDist, 'katex.min.css'), path.join(katexTarget, 'katex.min.css'));
	await fs.cp(path.join(katexDist, 'fonts'), path.join(katexTarget, 'fonts'), {recursive: true});
	await downloadFavicons(webDistDirectory);
}

export async function buildWeb(options) {
	const {development} = options;
	// The web build is minified in production and keeps its source maps in development,
	// unless the command line says otherwise.
	const minify = options.minify ?? !development;
	const sourcemap = options.sourcemap ?? development;
	const scripts = {minify, sourcemap};
	const buildInfo = collectBuildInfo({development});
	const site = readSiteConfig();
	const engine = createLiquidEngine({webSourceDirectory, site, buildInfo});
	console.log(`Building the web page in ${path.relative(rootDirectory, webDistDirectory)} (${buildInfo.environment}, ${minify ? 'minified' : 'not minified'}, ${sourcemap ? 'with source maps' : 'without source maps'})`);
	await fs.rm(webDistDirectory, {recursive: true, force: true});
	await fs.mkdir(webDistDirectory, {recursive: true});
	await renderPages({engine, site, buildInfo});
	await renderServiceWorker({buildInfo, options: scripts});
	await buildScripts({buildInfo, options: scripts});
	await copyStaticFiles();
}
