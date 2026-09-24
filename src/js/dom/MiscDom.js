import Sunniesnow from '../Sunniesnow.js';

Sunniesnow.MiscDom = {

	async main() {
		Sunniesnow.Patches.apply();
		Sunniesnow.MiscDom.adjustTables();
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

	removeSiteLoadingNotice() {
		document.getElementById('loading').remove();
		document.getElementById('main-wrapper').style.display = '';
	},

	clearDownloadingProgresses() {
		Array.from(document.getElementsByClassName('downloading-progress')).forEach(e => e.innerHTML = '');
	}
};
