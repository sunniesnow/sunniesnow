/**
 * Loads a Node.js module. This module is replaced by ./node-require-node.js in the
 * `sunniesnow/node` entry point, whose build knows that Node.js is the host; the
 * other builds never call it, because the code paths that load Node.js modules are
 * guarded by `Sunniesnow.Utils.isBrowser()`.
 */
export default function requireNodeModule(name) {
	throw new TypeError(`Cannot load the Node.js module ${JSON.stringify(name)} outside of Node.js`);
}
