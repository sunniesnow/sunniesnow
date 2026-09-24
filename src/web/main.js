// The entry point of the JavaScript that runs on the game's web page.
// It takes the place of the inline scripts that used to be put in the page's head
// by the static site generator (see index.html).
import './polyfills.js';
import Sunniesnow from '../js/index.js';

// The VS Code simple browser adds this URL parameter to bust its own cache.
Sunniesnow.vscodeBrowserReqId = location.search.match(/^\?.*vscodeBrowserReqId=(\d+)/)?.[1];

function main() {
	Sunniesnow.MiscDom.main().catch(error => {
		Sunniesnow.Logs.error(`Failed to set up the page: ${error}`, error);
	});
}

// The script is loaded with `defer`, but be robust about the document's state anyway.
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', main);
} else {
	main();
}
