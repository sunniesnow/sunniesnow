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

		const radio = document.getElementById('judgement-windows-custom');
		const radios = document.getElementsByName(radio.name);
		const listener = () => (wrapper.style.display = radio.checked ? '' : 'none');
		for (const otherRadio of radios) {
			otherRadio.addEventListener("change", listener);
		}
		listener();
	},

};
