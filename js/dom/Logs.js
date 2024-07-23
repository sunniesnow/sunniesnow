Sunniesnow.Logs = {
	warn(msg, e) {
		if (Sunniesnow.record?.suppressWarnings) {
			return;
		}
		if (Sunniesnow.Utils.isBrowser() && !Sunniesnow.game?.settings.suppressWarnings) {
			const div = document.createElement('div');
			div.classList.add('warning');
			div.innerHTML = msg;
			document.getElementById('logs').appendChild(div);
		}
		console.warn(msg);
		if (e) {
			console.warn(e);
		} else {
			console.warn(new Error(msg));
		}
	},

	error(msg, e) {
		if (Sunniesnow.Utils.isBrowser()) {
			const div = document.createElement('div');
			div.classList.add('error');
			div.innerHTML = msg;
			document.getElementById('logs').appendChild(div);
		}
		console.error(msg);
		console.error(e);
		Sunniesnow.Loader.loadingChart = false;
		Sunniesnow.Loader.loadingComplete = true;
		Sunniesnow.game?.terminate();
	},

	clearWarningsAndErrors() {
		document.getElementById('logs').innerHTML = '';
	}

};
