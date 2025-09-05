Sunniesnow.Logs = {
	warn(msg, e) {
		if (Sunniesnow.record?.suppressWarnings) {
			return;
		}
		if (!Sunniesnow.game?.settings.suppressWarnings) {
			this.add(msg, 'warning');
		}
		console.warn(msg);
		if (e) {
			console.warn(e);
		} else {
			console.warn(new Error(msg));
		}
	},

	error(msg, e) {
		this.add(msg, 'error');
		console.error(msg);
		if (e) {
			console.error(e);
		}
		Sunniesnow.Loader.loadingChart = false;
		Sunniesnow.Loader.loadingComplete = true;
		Sunniesnow.game?.terminate();
	},

	info(msg) {
		this.add(msg, 'info');
		console.info(msg);
	},

	clear() {
		document.getElementById('logs').innerHTML = '';
	},

	add(msg, className) {
		if (!Sunniesnow.Utils.isBrowser()) {
			return;
		}
		const div = document.createElement('div');
		div.classList.add(className);
		div.innerHTML = msg;
		const logsDom = document.getElementById('logs');
		const scrollToBottom = logsDom.scrollTop + logsDom.offsetHeight >= logsDom.scrollHeight;
		logsDom.appendChild(div);
		if (scrollToBottom) {
			logsDom.scrollTop = logsDom.scrollHeight;
		}
	}

};
