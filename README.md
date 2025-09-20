# Sunniesnow

A web rhythm game.
Play the game online:
[stable branch](https://sunniesnow.github.io/game),
[master branch](https://sunniesnow.github.io/game-unstable).

## Browser recommendations

On desktop, any modern browser should work,
and any browser-specific issues are considered bugs and should be reported.

On Android, any modern browser should largely work
but may not have good enough WebGL performance for the game to run smoothly.
Recommended browsers are WebView-based browsers,
and examples include Fulguris, Via, Opera GX, etc.

On iOS, any browser that you can get from App Store probably
have good enough performance for the game to run smoothly,
but there is a bug in the WebKit engine used by Safari and most browsers
on iOS that makes the game hardly playable
(to elaborate, when a `touchend` event and a `touchstart` event should happen at roughly the same time,
the `touchstart` event may not be fired at all).
Fortunately, *some* of the WebView-based browsers on iOS do not have this bug,
and examples include Via and QQ browser.
Reporting more examples to be included here is appreciated.

## Stable branch vs. master branch

The master branch is currently under active development,
so it probably has some undiscovered bugs.
To ensure that players' gaming experiences cannot be easily affected by the development,
the stable branch is used to keep an old version of the game
that has been extensively tested and is considered to have no major bugs.
Both versions are live on the website:
[/game](https://sunniesnow.github.io/game) for the stable branch
and [/game-unstable](https://sunniesnow.github.io/game-unstable) for the master branch.

New features and insignificant bug fixes are only added to the master branch.
Only significant bug fixes will be backported to the stable branch.

## Serve the game locally

> [!NOTE]
> If you play the game in this way, you still need internet access.
> However, a feature to use a vendor in place of a CDN for external scripts
> may be added in the future to allow full offline usage.

[Install Ruby](https://www.ruby-lang.org/en/documentation/installation), and then run

```shell
git clone --recursive https://github.com/sunniesnow/sunniesnow.github.io.git
cd sunniesnow.github.io
bundle install # and resolve all errors if there are any
JEKYLL_ENVIRONMENT=production bundle exec jekyll serve --host 0.0.0.0 --port 4000
```

Now, visit http://localhost:4000/game/ to see the game.

You can also build the static files by running `bundle exec jekyll build`.
You can see the built files in the `_site` directory.

> [!NOTE]
> Because Imgur blocks requests with `Origin` being localhost,
> when testing related features (e.g. Discord Rich Presence),
> you may want to use a different hostname instead of `localhost`
> to access the locally served site.

> [!NOTE]
> You can enable HTTPS support by setting `JEKYLL_SSL=1` and trusting the generated certificate at `_ssl/ca.crt` in the browser.
> The generated server certificate can be used to enable HTTPS
> with the hostname `jekyll.local`,
> which you can use some custom DNS resolver to resolve to `127.0.0.1`.
> You can change the hostname by modifying `_ssl/*.cnf` files
> and deleting the previously generated `_ssl/server.*` files.

## Use in Node.js

I do not think anyone would want to do this,
but [sunniesnow-record](https://github.com/sunniesnow/sunniesnow-record) does this.
Look at its source codes for reference.

## Other development notes

The entrypoint script can be found at `_head.html`.

There are two main logics: the DOM main logic and the game main logic.
The main function of the DOM main logic is `Sunniesnow.MiscDom.main()`,
and the main function of the game main logic is `Sunniesnow.Game.run()`.

## License notice

Sunniesnow is licensed under
[AGPL-3.0-or-later](https://www.gnu.org/licenses/agpl-3.0.en.html).

Sunniesnow has no relation to the game
[Lyrica](https://lyricagame.wixsite.com/lyricagame)
by any means,
nor does it contain any proprietary assets from Lyrica.

The open-source projects used by Sunniesnow:

- [PixiJS](https://pixijs.com) (MIT),
- [JSZip](https://stuk.github.io/jszip) (MIT or GPL-3.0),
- [Mime](https://www.skypack.dev/view/mime) (MIT),
- [audio-decode](https://github.com/audiojs/audio-decode) (MIT),
- [marked](https://marked.js.org) (MIT),
- [DOMPurify](https://github.com/cure53/DOMPurify) (Apache-2.0 or MPL-2.0),
- [LiquidJS](https://liquidjs.com) (MIT),
- [wangfonts](http://code.google.com/p/wangfonts) (GPL-2.0),
- [Yuji](https://github.com/Kinutafontfactory/Yuji) (OFL-1.1),
- [LXGW WenKai](https://github.com/lxgw/LxgwWenKai) (OFL-1.1),
- [Noto fonts](https://fonts.google.com/noto/use) (OFL-1.1),
- [vConsole](https://github.com/Tencent/vConsole) (MIT).

Sunniesnow's source codes do not contain any files from the above projects.
Sunniesnow uses them by letting the client download needed files
from public CDN sources.
