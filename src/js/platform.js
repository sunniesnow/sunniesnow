import * as PIXI from 'pixi.js';

function require(name) {
	throw new TypeError(`Cannot load the Node.js module ${JSON.stringify(name)} outside of Node.js`);
}

export {PIXI, require};
