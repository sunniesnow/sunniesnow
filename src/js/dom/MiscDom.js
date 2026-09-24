import Sunniesnow from '../Sunniesnow.js';

Sunniesnow.MiscDom = {

	async main() {
		Sunniesnow.Patches.apply();
		Sunniesnow.MiscDom.adjustTables();
		Sunniesnow.MiscDom.addActionListeners();
		Sunniesnow.Settings.init();
		await Sunniesnow.I18n.init();
		Sunniesnow.I18n.apply();
		Sunniesnow.PinnedCoordinates.init();
		Sunniesnow.MiscDom.removeSiteLoadingNotice();
		Sunniesnow.ParamsProcessor.processUrlParams();
		await Sunniesnow.CacheManager.registerServiceWorker();
	},

	adjustTables() {
		for (const wrapper of document.getElementsByClassName('table-wrapper')) {
			new ResizeObserver(entries => {
				for (const entry of entries) {
					const height = entry.contentBoxSize?.[0]?.blockSize;
					if (!height) {
						continue;
					}
					wrapper.style.paddingBottom = `${height}px`;
				}
			}).observe(wrapper.getElementsByTagName('table')[0]);
		}
	},

	// Declarative event listeners for the elements of the page.
	//
	// The page used to contain inline handlers such as `onclick="Sunniesnow.Game.run()"`,
	// which required a global `Sunniesnow` variable. Instead, the elements carry a
	// `data-action` attribute, e.g. `data-action="Game.run"`, and the path is resolved on
	// Sunniesnow (or from the global object, for `data-action="globalThis.location.reload"`).
	// Every step of the path is optional, so that `data-action="game.terminate"` does
	// nothing when no game is running, like the `Sunniesnow.game?.terminate()` it replaces.
	addActionListeners(root = document) {
		const actions = new Map();
		for (const element of root.querySelectorAll('[data-action]')) {
			const path = element.dataset.action;
			if (!actions.has(path)) {
				actions.set(path, this.createAction(path));
			}
			const action = actions.get(path);
			element.addEventListener('click', event => action());
		}
	},

	createAction(path) {
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
	},

	removeSiteLoadingNotice() {
		document.getElementById('loading').remove();
		document.getElementById('main-wrapper').style.display = '';
	},

	clearDownloadingProgresses() {
		Array.from(document.getElementsByClassName('downloading-progress')).forEach(e => e.innerHTML = '');
	}
};
