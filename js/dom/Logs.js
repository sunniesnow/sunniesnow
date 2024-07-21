Sunniesnow.Logs = {
	warn(msg, e) {
		if (Sunniesnow.record?.suppressWarnings) {
			return;
		}
		if (Sunniesnow.Utils.isBrowser() && !Sunniesnow.game?.settings.suppressWarnings) {
			const div = document.createElement('div');
			div.innerHTML = msg;
			document.getElementById('warnings').appendChild(div);
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
			div.innerHTML = msg;
			document.getElementById('errors').appendChild(div);
		}
		console.error(msg);
		Sunniesnow.Loader.loadingChart = false;
		Sunniesnow.Loader.loadingComplete = true;
		Sunniesnow.game?.terminate();
		if (e) {
			throw(e);
		} else {
			throw(new Error(msg));
		}
	},

	clearWarningsAndErrors() {
		document.getElementById('warnings').innerHTML = '';
		document.getElementById('errors').innerHTML = '';
	}

};
