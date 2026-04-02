Sunniesnow.ScreenshotManager = {
	copyScreenshot() {
		Sunniesnow.game?.canvas?.toBlob(
			blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})])
		);
	},

	saveScreenshot() {
		Sunniesnow.game?.canvas?.toBlob(blob => {
			const url = Sunniesnow.ObjectUrl.createPersistent(blob);
			Sunniesnow.Utils.download(url, 'sunniesnow-screenshot.png');
			if (!Sunniesnow.Utils.isAndroidWebView()) { // causes bug on Android WebView
				Sunniesnow.ObjectUrl.revoke(url);
			}
		});
	}
}
