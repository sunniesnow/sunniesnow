# Sunniesnow

A web rhythm game.
[Play the game online.](https://sunniesnow.github.io/game)

## Serve the game locally

*Note: if you play the game in this way, you still need internet access.*

[Install Ruby](https://www.ruby-lang.org/en/documentation/installation), and then run

```shell
git clone --recursive https://github.com/sunniesnow/sunniesnow.github.io.git
cd sunniesnow.github.io
bundle install # and resolve all errors if there are any
bundle exec jekyll serve
```

Now, visit http://localhost:4000/game/ to see the game.

## License notice

Sunniesnow is licensed under
[GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).

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
- [wangfonts](http://code.google.com/p/wangfonts) (GPL-2.0),
- [Yuji](https://github.com/Kinutafontfactory/Yuji) (OFL-1.1),
- [LXGW WenKai](https://github.com/lxgw/LxgwWenKai) (OFL-1.1),
- [Noto fonts](https://fonts.google.com/noto/use) (OFL-1.1),
- [vConsole](https://github.com/Tencent/vConsole) (MIT).

Sunniesnow does not contain any files from the above projects
but uses them by letting the client browser download needed files
from CDN sources.
