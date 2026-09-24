// Shared information about the repository, the static site and the current build.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const rootDirectory = path.dirname(scriptDirectory);
export const sourceDirectory = path.join(rootDirectory, 'src');
export const distDirectory = path.join(rootDirectory, 'dist');
export const buildDirectory = path.join(rootDirectory, 'build');
export const webSourceDirectory = path.join(sourceDirectory, 'web');
export const libSourceDirectory = path.join(sourceDirectory, 'lib');
export const jsSourceDirectory = path.join(sourceDirectory, 'js');
export const webDistDirectory = path.join(distDirectory, 'web');
export const libDistDirectory = path.join(distDirectory, 'lib');
export const publicDirectory = path.join(rootDirectory, 'public');

// The logo is published in the logo repository's releases, like the Jekyll site used to do.
const logoUrl = 'https://github.com/sunniesnow/logo/releases/download/v1.1/logo';

export function parseArguments(argv) {
	const web = argv.includes('--web');
	const lib = argv.includes('--lib');
	return {
		web: web || !lib,
		lib: lib || !web,
		development: argv.includes('--dev') || process.env.SUNNIESNOW_ENVIRONMENT === 'development',
	};
}

function gitOutput(arguments_, fallback) {
	try {
		return execFileSync('git', arguments_, {cwd: rootDirectory, encoding: 'utf8'}).trim() || fallback;
	} catch (error) {
		return fallback;
	}
}

export function collectBuildInfo({development}) {
	const commitHash = gitOutput(['rev-parse', 'HEAD'], 'unknown');
	return {
		commitHash,
		commitDate: gitOutput(['log', '-1', '--format=%cI'], new Date().toISOString()),
		fuckCache: development ? `${Date.now()}` : commitHash.slice(0, 7),
		environment: development ? 'development' : 'production',
		authentication: process.env.SUNNIESNOW_AUTHENTICATION ?? null,
	};
}

export function readSiteConfig() {
	const config = JSON.parse(fs.readFileSync(path.join(webSourceDirectory, 'site.json'), 'utf8'));
	return {...config, url: process.env.SUNNIESNOW_SITE_URL ?? config.url};
}

export async function downloadFavicons(directory) {
	for (const extension of ['ico', 'svg', 'png']) {
		const name = `favicon.${extension}`;
		const cache = path.join(buildDirectory, 'cache', name);
		try {
			if (!fs.existsSync(cache)) {
				const response = await fetch(`${logoUrl}.${extension}`);
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}
				const contents = Buffer.from(await response.arrayBuffer());
				await fs.promises.mkdir(path.dirname(cache), {recursive: true});
				await fs.promises.writeFile(cache, contents);
			}
			await fs.promises.copyFile(cache, path.join(directory, name));
		} catch (error) {
			console.warn(`Warning: failed to get ${name}: ${error.message}`);
		}
	}
}
