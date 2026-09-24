// Information that the web build collects while building the static site.
// The web build replaces the contents of this module with the collected values
// (see scripts/build-web.mjs); library builds use the defaults below.
export default {
	commitHash: 'unknown',
	fuckCache: 'unknown',
	environment: 'production',
	authentication: null,
};
