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
	await buildLib(options);
}
console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s.`);
