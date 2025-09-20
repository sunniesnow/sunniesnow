Sunniesnow.MiscDom = {

	addEventListeners() {
		document.getElementById('refresh').addEventListener('click', event => {
			location.reload(true);
		});
		document.getElementById('delete-settings').addEventListener('click', event => {
			Sunniesnow.Settings.deleteSavedSettings();
		});
		document.getElementById('export-settings').addEventListener('click', event => {
			Sunniesnow.Settings.exportSavedSettings();
		});
		document.getElementById('import-settings').addEventListener('change', event => {
			Sunniesnow.Settings.importSettings();
		});
		document.getElementById('delete-chart-offsets').addEventListener('click', event => {
			Sunniesnow.Settings.deleteSavedChartOffsets();
		});
		document.getElementById('export-chart-offsets').addEventListener('click', event => {
			Sunniesnow.Settings.exportSavedChartOffsets();
		});
		document.getElementById('import-chart-offsets').addEventListener('change', event => {
			Sunniesnow.Settings.importChartOffsets();
		});
		document.getElementById('offset-wizard').addEventListener('click', event => {
			Sunniesnow.MiscDom.offsetWizard();
		});
		document.getElementById('delete-online-caches').addEventListener('click', event => {
			Sunniesnow.Loader.deleteOnlineCaches();
		});
		document.getElementById('delete-site-caches').addEventListener('click', event => {
			Sunniesnow.Loader.deleteSiteCaches();
		});
		document.getElementById('delete-external-caches').addEventListener('click', event => {
			Sunniesnow.Loader.deleteExternalCaches();
		});
		['game-start', 'start-button'].forEach(elementId => {
			document.getElementById(elementId).addEventListener('click', event => {
				Sunniesnow.Game.run();
			});
		});
		['game-stop', 'stop-button'].forEach(elementId => {
			document.getElementById(elementId).addEventListener('click', event => {
				Sunniesnow.game?.terminate();
			});
		});
		document.getElementById('game-pause').addEventListener('click', event => {
			Sunniesnow.game?.pause();
		});
		document.getElementById('game-resume').addEventListener('click', event => {
			Sunniesnow.game?.resume();
		});
		document.getElementById('game-retry').addEventListener('click', event => {
			Sunniesnow.game?.retry();
		});
		document.getElementById('game-fullscreen').addEventListener('click', event => {
			Sunniesnow.Fullscreen.toggle();
		});
		document.getElementById('game-toggle-pause-ui').addEventListener('click', event => {
			if (!Sunniesnow.game) {
				return;
			}
			Sunniesnow.game.hidePauseUi = !Sunniesnow.game.hidePauseUi;
		});
		document.getElementById('logs-clear').addEventListener('click', event => {
			Sunniesnow.Logs.clear();
		});
		document.getElementById('vconsole-setup').addEventListener('click', event => {
			if (Sunniesnow.vConsole) {
				Sunniesnow.vConsole.showSwitch();
			} else {
				Sunniesnow.vConsole = new VConsole({onReady: () => {
					Sunniesnow.Logs.info('vConsole is created');
				}});
			}
		});
		document.getElementById('vconsole-hide').addEventListener('click', event => {
			if (Sunniesnow.vConsole) {
				Sunniesnow.vConsole.hideSwitch();
			} else {
				Sunniesnow.Logs.warn('vConsole does not exist');
			}
		});
		document.getElementById('vconsole-destroy').addEventListener('click', event => {
			if (Sunniesnow.vConsole) {
				Sunniesnow.vConsole.destroy();
				Sunniesnow.vConsole = null;
			} else {
				Sunniesnow.Logs.warn('vConsole does not exist');
			}
		});
		document.getElementById('cover-generate').addEventListener('click', event => {
			Sunniesnow.CoverGenerator.download();
		});
	},

	// TODO: fix
	async offsetWizard() {
		Sunniesnow.Settings.writeRadio('level-file', 'online');
		Sunniesnow.Settings.writeValue('level-file-online', 'offset-wizard');
		await Sunniesnow.Loader.loadChart();
		Sunniesnow.Game.run();
		Object.assign(Sunniesnow.game.settings, {
			volumeSe: 0,
			autoplay: false,
			chartOffset: 0
		});
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
