// Declarative event handlers for the game's page.
//
// The page used to contain inline handlers such as `onclick="Sunniesnow.Game.run()"`,
// which required a global `Sunniesnow` variable. Instead, the elements now carry a
// `data-action` attribute, and this module wires them up. Every step of the path is
// optional, so that `data-action="game.terminate"` does nothing when no game is
// running, like the `Sunniesnow.game?.terminate()` it replaces.
import Sunniesnow from '../js/Sunniesnow.js';

function createAction(path) {
	const parts = path.split('.');
	const fromGlobals = parts[0] === 'globalThis';
	if (fromGlobals) {
		parts.shift();
	}
	return () => {
		let target = fromGlobals ? globalThis : Sunniesnow;
		for (const part of parts.slice(0, -1)) {
			target = target?.[part];
		}
		const name = parts[parts.length - 1];
		const action = target?.[name];
		if (typeof action !== 'function') {
			Sunniesnow.Logs?.warn(`The action ${path} is not available`);
			return undefined;
		}
		return action.call(target);
	};
}

export function wireActions(root = document) {
	const actions = new Map();
	for (const element of root.querySelectorAll('[data-action]')) {
		const path = element.dataset.action;
		if (!actions.has(path)) {
			actions.set(path, createAction(path));
		}
		const action = actions.get(path);
		element.addEventListener('click', event => {
			action();
		});
	}
}
