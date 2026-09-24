import buildInfo from './build-info.js';

// The object that used to be the global variable `Sunniesnow`.
// Every game module attaches its classes and objects to it when the module graph
// (see ./index.js) is evaluated, and it is the default export of the package.
const Sunniesnow = {
	commitHash: buildInfo.commitHash,
	fuckCache: buildInfo.fuckCache,
	environment: buildInfo.environment,
	authentication: buildInfo.authentication,
};

export default Sunniesnow;
