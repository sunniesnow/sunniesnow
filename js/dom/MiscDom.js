Sunniesnow.MiscDom = {

	async main() {
		Sunniesnow.Patches.apply();
		Sunniesnow.MiscDom.addScrollbarToAndroidWebView();
		Sunniesnow.MiscDom.adjustCustomJudgementWindowsTable();
		Sunniesnow.Settings.init();
		await Sunniesnow.I18n.init();
		Sunniesnow.I18n.apply();
		Sunniesnow.PinnedCoordinates.init();
		Sunniesnow.MiscDom.removeSiteLoadingNotice();
		Sunniesnow.ParamsProcessor.processUrlParams();
		await Sunniesnow.CacheManager.registerServiceWorker();
	},

	// https://github.com/pixijs/pixijs/issues/10020
	addScrollbarToAndroidWebView() {
		if (!Sunniesnow.Utils.isAndroidWebView()) {
			return;
		}
		document.getElementById('main-wrapper').classList.add('force-scrollbar');
	},

	adjustCustomJudgementWindowsTable() {
		const wrapper = document.getElementById('judgement-windows-custom-wrapper');
		const table = document.getElementById('judgement-windows-custom-table');
		const observer = new ResizeObserver(entries => {
			for (const entry of entries) {
				const height = entry.contentBoxSize?.[0]?.blockSize;
				if (!height) {
					continue;
				}
				wrapper.style.paddingBottom = `${height}px`;
			}
		});
		observer.observe(table);
	},

	removeSiteLoadingNotice() {
		document.getElementById('loading').remove();
		document.getElementById('main-wrapper').style.display = '';
	},

	clearDownloadingProgresses() {
		Array.from(document.getElementsByClassName('downloading-progress')).forEach(e => e.innerHTML = '');
	}
};
