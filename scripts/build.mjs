// Builds everything: the static website in dist/web and the library in dist/lib.
//
//	node scripts/build.mjs [--web] [--lib] [--dev]
//
// Without `--web` or `--lib`, both are built.
import {buildLib} from './build-lib.mjs';
import {buildWeb} from './build-web.mjs';
import {parseArguments} from './site.mjs';

const options = parseArguments(process.argv.slice(2));
const started = Date.now();
if (options.web) {
	await buildWeb(options);
}
if (options.lib) {
	// The library is not minified unless it is asked for: that is the job of the
	// bundler of whoever consumes it.
	await buildLib({minify: options.minify ?? false, sourcemap: options.sourcemap ?? options.development});
}
console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s.`);
