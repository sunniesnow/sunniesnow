import {createRequire} from 'node:module';

// Loads a Node.js module. This is the implementation used by the
// `sunniesnow/node` entry point, which is built for Node.js.
const nodeRequire = createRequire(import.meta.url);

export default function requireNodeModule(name) {
	return nodeRequire(name);
}
