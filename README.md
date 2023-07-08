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
[GPL v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).

Sunniesnow has no relation to the game
[Lyrica](https://lyricagame.wixsite.com/lyricagame)
by any means,
nor does it contain any proprietary assets from Lyrica.

The open-source projects used by Sunniesnow:

- [PixiJS](https://pixijs.com)
(MIT),
- [JSZip](https://stuk.github.io/jszip)
(dual-licensed under MIT and GPL v3),
- [Mime](https://www.skypack.dev/view/mime)
(MIT),
- [wangfonts](http://code.google.com/p/wangfonts)
(GPL v2).

Sunniesnow does not contain any files from the above projects
but uses them by letting the client browser download needed files
from CDN sources.
