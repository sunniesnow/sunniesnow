# Sunniesnow

A web rhythm game.
[Play the game online.](https://sunniesnow.github.io/game)

## Serve the game locally

> [!NOTE]
> If you play the game in this way, you still need internet access.

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
> and because the `Crypto.subtle` API is not available in insecure contexts,
> you must enable HTTPS support for some functionalities to work
> (e.g., Discord Rich Presence).
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
