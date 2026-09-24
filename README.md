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

`npm run build -- --dev` (or `SUNNIESNOW_ENVIRONMENT=development`) builds a development
version of the web page: it is not minified and it busts caches with a timestamp instead
of the commit hash. `npm run verify` checks the build output, including the requirement
that the web bundle is parseable by Chromium 37.

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

### Layout

- `src/js` is the game itself. It is a set of ES modules that attach their classes and
  objects to the `Sunniesnow` object, which used to be a global variable and is now the
  default export of the package. `src/js/index.js` imports all of them in the order they
  used to be loaded, and `src/js/Sunniesnow.js` is the object they attach to.
- `src/lib/index.js` and `src/lib/node.js` are the library entry points of the npm package
  (`sunniesnow` and `sunniesnow/node`). They differ in the PixiJS library they use:
  `pixi.js` and `@pixi/node` respectively.
- `src/web` is the static site. `index.html` and `popup/index.html` are LiquidJS templates
  that apply `_layout.html` with the `{% layout %}` tag, which is why none of the templates
  needs Jekyll front matter; the values that used to be in Jekyll's `_config.yml` are in
  `src/web/site.json`. `help.md` is Markdown, and `service-worker.js` caches the site.
- `src/data` is data that ends up in the bundle: the translations of `src/data/i18n`,
  which are imported as modules instead of being fetched from the site's `json` directory.
- `scripts` is the build: `build.mjs` (the entry point), `build-web.mjs`, `build-lib.mjs`,
  `bundle.mjs` (esbuild and Babel), `optional-chunks.mjs` (the chunks of the site),
  `liquid.mjs` (the Liquid engine), `markdown.mjs` (marked and its extensions),
  `table-of-contents.mjs` (the `[TOC]` marker), `site.mjs`, `serve.mjs` and `verify.mjs`.

### The web page

`src/web/main.js` is the entry point of the JavaScript that runs in the page.
It replaces the inline scripts that the static site generator used to put in the page's
head: it loads the polyfills, wires up the `data-action` attributes of the page and runs
`Sunniesnow.MiscDom.main()`, the main logic of the page. The main logic of the game itself
is `Sunniesnow.Game.run()`.

Everything the page needs to render is bundled into the single file `dist/web/main.js`.
The browser support of that file is Chromium 37: it is transpiled to ES5 and polyfilled,
including the dependencies. Note that Chromium 37 cannot run the game itself, because
PixiJS 8 requires WebGL 2.

The exceptions to the single file are the two scripts that the browser loads by itself,
`dist/web/audio/FrameReporter.js` (an audio worklet) and `dist/web/audio/TimeReporter.js`
(a worker), `dist/web/service-worker.js`, and the optional chunks below.

### The optional chunks

The code that the game only needs sometimes is not part of `main.js`, so that it never
delays the first rendering of the page. It is built into the chunks under
`dist/web/optional`, which the page loads when they are first needed:

- `audio-decoders.js` is loaded when a level's music is decoded. It contains all the
  decoders that `@audio/decode` loads with a dynamic `import()`, which the build rewrites
  to the chunk loader (`scripts/bundle.mjs`); they are in a single chunk because they
  depend on each other, and were about 5 MiB of the 9 MiB that `main.js` used to be.
- `vconsole.js` is loaded when vConsole is turned on in the page's settings.

Chromium 37 cannot parse `import()` and cannot load ES modules, so the chunks are classic
scripts that register what they provide on the channel that `src/js/optional-chunks.js`
sets up; `src/js/optional-chunks-import.js` is used instead by the library builds, which
can use a real dynamic import because their consumer's bundler resolves it.

The page never waits for the chunks to download. Right after it registers the service
worker, it asks the worker to cache them (`Sunniesnow.CacheManager`), and the worker
downloads them in the background from the list in `dist/web/optional/manifest.json`.
The downloads therefore do not block the first rendering of the page, but an audio
decoder still works offline once the service worker has cached it.

### The Markdown page

`help.md` is rendered by LiquidJS first (which expands the settings lists of the page),
and then by marked, which uses these extensions:

- [marked-gfm-heading-id](https://github.com/markedjs/marked-gfm-heading-id) gives the
  headings their GFM IDs,
- [marked-custom-heading-id](https://github.com/markedjs/marked-custom-heading-id) gives a
  heading the ID of the extended syntax, e.g. `##### Online {#level-file-online}`: the
  settings of the page are linked to by their setting IDs, both from the other settings
  and from outside the site,
- [marked-katex-extension](https://github.com/UziTech/marked-katex-extension) renders the
  `$...$` math with KaTeX (with `nonStandard`, so that math followed by punctuation, like
  `($\mu$)`, is rendered too),
- [marked-smartypants](https://github.com/markedjs/marked-smartypants) converts the quotes
  of the prose, as Kramdown's smart quotes used to,
- `scripts/table-of-contents.mjs` expands the `[TOC]` marker. The marked ecosystem has a
  table of contents extension, but it derives its links from the heading *text*, so it
  cannot link to the explicit heading IDs above; this extension reads the headings of the
  rendered page instead, and it does not list the headings that come before the marker
  (the title of the page and the title of the table of contents itself).

The page's Markdown therefore uses marked's conventions rather than Kramdown's: heading
IDs are the extended syntax above, the table of contents is `[TOC]`, `target="_blank"`
links are HTML, and the math is delimited by `$` instead of jekyll-katex's tags.
`npm run verify` checks that every anchor link of the page resolves to an element of the
page, which is what the table of contents and the cross-references of the settings need.

The KaTeX stylesheet and fonts are copied from the `katex` package into `dist/web/katex`,
so the page does not depend on a CDN.

### Node.js

It is possible to run Sunniesnow in Node.js by importing `sunniesnow/node`, which uses
`@pixi/node` as the PixiJS library. The library build keeps its dependencies external,
so the consumer resolves them from its own `node_modules`; `@pixi/node` is an optional
peer dependency, which means that it has to be installed explicitly.

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
The dependencies are installed with npm: some of them are bundled into `dist/web/main.js`
and into `dist/lib`, and the license notices of the bundled files are kept at the end of
the built files. The favicons are downloaded from the
[logo repository](https://github.com/sunniesnow/logo)'s releases while building the site,
and the fonts are downloaded by the game itself from public CDN sources at runtime.
