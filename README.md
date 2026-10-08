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

## Build and serve the game locally

[Install Node.js](https://nodejs.org) (version 20 or later), and then run

```shell
git clone https://github.com/sunniesnow/sunniesnow.git
cd sunniesnow
npm install
npm run build
npm run serve
```

Now, visit http://localhost:4000/ to see the game.

`npm run build` writes two things:

- `dist/web`, the standalone static website that is pushed to GitHub Pages, and
- `dist/lib`, the library that is packed in the npm package.

The build can be told what to produce:

- `--web` and `--lib` build only one of the two (both are built by default),
- `--minify` and `--no-minify`,
- `--sourcemap` and `--no-sourcemap`,
- `--dev` (or `SUNNIESNOW_ENVIRONMENT=development`) builds a development version:
  it is not minified, has source maps, busts caches with a timestamp instead of the commit hash,
  and uses `localhost:4000` as the default site URL.

The build accepts a few environment variables:

- `SUNNIESNOW_SITE_URL` overrides the site's URL (used for the canonical URLs and the
  metadata of the pages), which defaults to the `url` of `src/web/site.json`,
- `SUNNIESNOW_AUTHENTICATION` is passed to the game as `Sunniesnow.authentication`
  (used when the game is hosted with an authentication token),
- `GITHUB_RUN_ID` is only used to link to the workflow run in the page's footer.

> [!NOTE]
> Because Imgur blocks requests with `Origin` being localhost,
> when testing related features (e.g. Discord Rich Presence),
> you may want to use a different hostname instead of `localhost`
> to access the locally served site.

## Development notes

### The web page

`src/web/main.js` is the entry point of the JavaScript that runs in the page.
It loads the polyfills, puts the namespace on the global object as `globalThis.Sunniesnow`
and runs `Sunniesnow.MiscDom.main()`, the main logic of the page.
The main logic of the game itself is `Sunniesnow.Game.run()`.

Everything the page needs to render is bundled into the single file `dist/web/main.js`.
The browser support of that file is Chromium 37: it is transpiled to ES5 and polyfilled,
including the dependencies.

The exceptions to the single file are the two scripts that the browser loads by itself,
`dist/web/audio/FrameReporter.js` (an audio worklet) and `dist/web/audio/TimeReporter.js` (a worker),
`dist/web/service-worker.js`, and the optional chunks below.

### The optional chunks

The code that the game only needs sometimes is not part of `main.js`,
so that it never delays the first rendering of the page.
It is built into the chunks under `dist/web/optional`, which the page loads when they are first needed:

- `audio-decoders.js` is loaded when a level's music is decoded.
- `vconsole.js` is loaded when vConsole is turned on in the page's settings.

The page never waits for the chunks to download.
Right after it registers the service worker, it asks the worker to cache them (`Sunniesnow.CacheManager`),
and the worker downloads them in the background from the list in `dist/web/optional/manifest.json`.

### The library

`npm run build -- --lib` writes `dist/lib/browser` and `dist/lib/node`:
two builds of the whole of `src/js`, which keep its file structure, one file per module,
so that the published library can be read and debugged like the sources.
They differ only in the modules that provide the environment,
and their roots are the entry points of the package:

- `sunniesnow` is `dist/lib/browser/index.js`, which uses `pixi.js`, and
- `sunniesnow/node` is `dist/lib/node/index.js`, which uses `@pixi/node`.

The build keeps the relative imports between the modules and leaves the dependencies to whoever consumes the library,
so they are resolved from the consumer's `node_modules`;
`@pixi/node` is an optional peer dependency,
which means that it has to be installed explicitly.
The JSON that the sources import (`src/data/build-info.json` and the translations)
is inlined into the built modules, so that the library does not depend on how the consumer imports JSON.

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
- [KaTeX](https://katex.org) (MIT),
- the marked extensions
  ([marked-gfm-heading-id](https://github.com/markedjs/marked-gfm-heading-id),
  [marked-custom-heading-id](https://github.com/markedjs/marked-custom-heading-id),
  [marked-katex-extension](https://github.com/UziTech/marked-katex-extension),
  [marked-smartypants](https://github.com/markedjs/marked-smartypants),
  [smartypants](https://github.com/othree/smartypants.js) and
  [node-html-parser](https://github.com/taoqf/node-fast-html-parser)) (MIT),
- [core-js](https://github.com/zloirock/core-js) (MIT),
- [vConsole](https://github.com/Tencent/vConsole) (MIT),
- [wangfonts](http://code.google.com/p/wangfonts) (GPL-2.0),
- [Yuji](https://github.com/Kinutafontfactory/Yuji) (OFL-1.1),
- [LXGW WenKai](https://github.com/lxgw/LxgwWenKai) (OFL-1.1),
- [Noto fonts](https://fonts.google.com/noto/use) (OFL-1.1).

Sunniesnow's source codes do not contain any files from the above projects.
The dependencies are installed with npm: they are bundled into `dist/web/main.js` and into
the optional chunks of the site, and the license notices of the bundled files are kept at
the end of the built files; the library keeps them external instead. The favicons are downloaded from the
[logo repository](https://github.com/sunniesnow/logo)'s releases while building the site,
and the fonts are downloaded by the game itself from public CDN sources at runtime.
