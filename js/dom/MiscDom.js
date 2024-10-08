Sunniesnow.MiscDom = {

	addEventListeners() {
		const levelFileOnline = document.getElementById('level-file-online')
		levelFileOnline.addEventListener('keydown', event => {
			if (event.key === 'Enter') {
				Sunniesnow.Loader.triggerLoadChart();
			}
		});
		levelFileOnline.addEventListener('input', event => {
			Sunniesnow.Loader.interruptLevelLoad();
		});
		document.getElementById('level-file-button').addEventListener('click', event => {
			Sunniesnow.Loader.triggerLoadChart();
		});
		document.getElementById('level-file-upload').addEventListener('change', event => {
			Sunniesnow.Settings.markManual('level-file-upload');
			Sunniesnow.Loader.triggerLoadChart();
		});
		['background-upload', 'fx-upload', 'skin-upload', 'se-upload'].forEach(elementId => {
			document.getElementById(elementId).addEventListener('change', event => {
				Sunniesnow.Settings.markManual(elementId);
			});
		});
		document.getElementById('refresh').addEventListener('click', event => {
			location.reload(true);
		});
		document.getElementById('lang').addEventListener('click', event => {
			Sunniesnow.I18n.setLang();
			Sunniesnow.I18n.apply();
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

	async triggerPreprocess() {
		const script = document.createElement('script');
		script.textContent = 'Sunniesnow.Preprocess.run();';
		document.body.appendChild(script);
		await Sunniesnow.Utils.untilLoaded(document.body);
		script.remove();
	},

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

		const radio = document.getElementById('judgement-windows-custom-radio');
		const radios = document.getElementsByName(radio.name);
		const listener = () => (wrapper.style.display = radio.checked ? '' : 'none');
		for (const otherRadio of radios) {
			otherRadio.addEventListener("change", listener);
		}
		listener();
	},

	associateLabels(parent = document) {
		const inputs = parent.querySelectorAll('input[type="radio"], input[type="checkbox"]');
		for (const input of inputs) {
			const label = input.nextElementSibling;
			if (!label || label.tagName !== 'LABEL' || label.htmlFor === input.id) {
				continue;
			}
			label.addEventListener('click', event => input.click());
		}
	},

	removeSiteLoadingNotice() {
		document.getElementById('loading').remove();
		document.getElementById('main-wrapper').style.display = '';
	}

};
