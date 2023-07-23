---
layout: default
title: Sunniesnow Help
---

# Sunniesnow Help
{:.no_toc}

This is the help page for Sunniesnow.
Here you can find information about the settings and how to use them.

## Table of contents
{:.no_toc}

- toc
{:toc}

## Settings

### Level settings

#### Level file

- **Setting id**: `level-file`.
- **Possible values**: `"online"`, `"upload"`.

This setting is used to provide the level file.
A level file contains the music, the chart, and optionally the background.
There are two ways of providing the level file,
[online](#level-file-online) and [upload](#level-file-upload).

##### Online
{:#level-file-online}

- **Setting id**: `level-file-online`

You can fill in the identifier of an online level here to get access to the level.
If you want to play an online chart that is **not** from Sunniesnow's server,
you should enter the full URL to the .ssc file here.

After you finish filling in this field,
hit <kbd>Enter</kbd> or click the *Load* button to load the level file.
Then, the available options of [`music-select`](#music-select),
[`chart-select`](#chart-select), and [`background-from-level`](#background-from-level)
will be refreshed.

This setting is **only** useful when [`level-file`](#level-file) is set to `"online"`.

##### Upload
{:#level-file-upload}

- **Setting id**: `level-file-upload`.
- **Notice**: This setting **cannot** be specified through [URL parameters](#url-parameters).

You can upload a level file from your local file system here.
The level file is automatically loaded once you upload it.
Then, the available options of [`music-select`](#music-select),
[`chart-select`](#chart-select), and [`background-from-level`](#background-from-level)
will be refreshed.

This setting is **only** useful when [`level-file`](#level-file) is set to `"upload"`.

#### Music
{:#music-select}

- **Setting id**: `music-select`.

This setting is used to select an audio file as the music file.
The [level file](#level-file) you provided should contain at least one audio file.
The list of audio files will be available in the dropdown menu of this setting
**once** the level file is loaded.

#### Chart
{:#chart-select}

- **Setting id**: `chart-select`.

This setting is used to select a JSON file as the chart file.
The [level file](#level-file) you provided should contain at least one JSON file.
The list of JSON files will be available in the dropdown menu of this setting
**once** the level file is loaded.

### Judgement settings

#### Judgement time windows
{:#judgement-windows}

- **Setting id**: `judgement-windows`.
- **Possible values**: `"strict"`, `"medium"`, `"loose"`.

This setting is used to set the judgement time windows.
There are three tiers of judgement time windows: *strict*, *medium*, and *loose*.

The loose tier is the **same** as the judgement windows of
[Lyrica](https://lyricagame.wixsite.com/lyricagame){:target="_blank"}.
Data (data in "hold (*end*)" entries are **ratio** to the duration of the hold,
and other data are in **milliseconds**):

| | early bad | early good | early perfect | late perfect | late good | late bad |
|:--|--:|--:|--:|--:|--:|--:|
| tap | -400 | -300 | -110 | +150 | +300 | +400 |
| drag | -400 | -300 | -110 | +150 | +300 | +400 |
| flick | -400 | -400 | -300 | +150 | +300 | +400 |
| hold (*start*) | -400 | -400 | -400 | +400 | +400 | +400 |
| hold (*end*) | -&infin; | 0.4 | 0.7 | | | |

Data for the medium tier:

| | early bad | early good | early perfect | late perfect | late good | late bad |
|:--|--:|--:|--:|--:|--:|--:|
| tap | -240 | -160 | -80 | +80 | +160 | +240 |
| drag | -240 | -240 | -110 | +150 | +240 | +240 |
| flick | -240 | -180 | -110 | +110 | +180 | +240 |
| hold (*start*) | -240 | -240 | -110 | +110 | +240 | +240 |
| hold (*end*) | -&infin; | 0.7 | 0.7 | | | |

Data for the strict tier:

| | early bad | early good | early perfect | late perfect | late good | late bad |
|:--|--:|--:|--:|--:|--:|--:|
| tap | -150 | -100 | -50 | +50 | +100 | +150 |
| drag | -150 | -150 | -100 | +100 | +150 | +150 |
| flick | -150 | -100 | -50 | +50 | +100 | +150 |
| hold (*start*) | -150 | -100 | -50 | +50 | +100 | +150 |
| hold (*end*) | -&infin; | 0.8 | 0.8 | | | |

#### Note hit size

- **Setting id**: `note-hit-size`.
- **Possible values**: Any non-negative number.

This setting is used to set the hit size of the notes.

The hit region of a note is the **same** for all types of notes:
a **square** concentric with the note.
This setting is used to specify the **ratio** of the side length of the square
to the radius of the note (when the value of [`note-size`](#note-size) is one).

This setting does **not** affect the visual size of notes, which is set by [`note-size`](#note-size).

#### Offset

- **Setting id**: `offset`.
- **Possible values**: Any number.

This setting specifies the judgement offset in milliseconds.
The larger the offset,
the **later** the time at which the player are supposed to hit the notes.
This setting is intended to fix the latency in the video.

This does **not** affect the audio-video sync.
To fix the audio-video sync, use [`delay`](#delay).

### Visual settings

#### Speed

- **Setting id**: `speed`.
- **Possible values**: Any non-negative number.

This setting is used to set how fast the shrinking circles of the notes shrink.
In other words, it is used to set how advanced the notes appear in time.
This setting is equivalent to what is known as the *scroll speed* in most rhythm games.

The time for which the shrinking circle of a note is visible is
**one second divided by** the speed value set here
(plus a small constant defined by the skin).

Here is a comparison table between speed values here and speed values in Lyrica:

| Lyrica | Sunniesnow |
|:--:|:--:|
| 1 | 1.05 |
| 2 | 1.33 |
| 3 | 1.67 |
| 4 | 2.22 |
| 5 | 3.00 |

When the speed is set to zero, the shrinking circles do **not** appear at all.

#### Note size

- **Setting id**: `note-size`.
- **Possible values**: Any non-negative number.

This setting is used to set the visual size of the notes.
This setting does **not** affect the hit size of the notes, which is set by [`note-hit-size`](#note-hit-size).

#### Background

- **Setting id**: `background`.
- **Possible values**: `"none"`, `"online"`, `"from-level"`, `"upload"`.

This setting is used to set the background image of the game.
When the value is `"none"`, the background is a purely white image.

##### Online
{:#background-online}

- **Setting id**: `background-online`.

You can fill in the identifier of an online background to use it here.
If you want to use a background from **outside** the server of Sunniesnow,
you may also specify the URL of the image you want to use here.

This setting is **only** useful when [`background`](#background) is set to `"online"`.

##### From level
{:#background-from-level}

- **Setting id**: `background-from-level`.

You can select a background image from the level file you provided here.
The [level file](#level-file) you provided **may or may not** contain background images.
If it does, the list of background images will be available in the dropdown menu of this setting **once** the level file is loaded,
and [`background`](#background) will be automatically set to `"from-level"`.

This setting is **only** useful when [`background`](#background) is set to `"from-level"`.

##### Upload
{:#background-upload}

- **Setting id**: `background-upload`.
- **Note**: This setting **cannot** be specified in [URL parameters](#url-parameters).

You can upload a image file here as the background.

This setting is **only** useful when [`background`](#background) is set to `"upload"`.

#### Background settings

##### Blur
{:#background-blur}

- **Setting id**: `background-blur`.
- **Possible values**: Numbers between 0 and 200 with step being 1.

The background image is blurred by Gaussian blur.
This setting is used to set the radius of the blur.
The larger this value, the **more blurred** the background image.

These settings are only useful when [`renderer`](#renderer) is set to `"webgl"`.

##### Brightness
{:#background-brightness}

- **Setting id**: `background-brightness`.
- **Possible values**: Numbers between 0 and 1 with step being 0.05.

This setting is used to set the brightness of the background image.
Zero brightness is pure black, and one brightness is the original image.

#### FX (note hit special effects)
{:#fx}

- **Setting id**: `fx`.
- **Possible values**: `"default"`, `"online"`, `"upload"`.

This setting is used for you to provide a Sunniesnow plugin file to add special effects to the notes when they are hit.
They are called *FX* in Lyrica, so we call it FX here, too.

##### Online
{:#fx-online}

- **Setting id**: `fx-online`.

You can fill in the identifier of an online FX to use it here.
If you want to use a FX from **outside** the server of Sunniesnow,
you may also specify the URL of the plugin file you want to use here.

This setting is **only** useful when [`fx`](#fx) is set to `"online"`.

##### Upload
{:#fx-upload}

- **Setting id**: `fx-upload`.
- **Notice**: This setting cannot be specified through [URL parameters](#url-parameters).

You can upload a plugin file here as the FX.

This setting is **only** useful when [`fx`](#fx) is set to `"upload"`.

#### Skin (note style and other UI)
{:#skin}

- **Setting id**: `skin`.
- **Possible values**: `"default"`, `"online"`, `"upload"`.

This setting is used for you to provide a Sunniesnow plugin file
to change the style of the notes and other UI elements.

##### Online
{:#skin-online}

- **Setting id**: `skin-online`.

You can fill in the identifier of an online skin to use it here.
If you want to use a skin from **outside** the server of Sunniesnow,
you may also specify the URL of the plugin file you want to use here.

This setting is **only** useful when [`skin`](#skin) is set to `"online"`.

##### Upload
{:#skin-upload}

- **Setting id**: `skin-upload`.
- **Notice**: This setting cannot be specified through [URL parameters](#url-parameters).

You can upload a plugin file here as the skin.

This setting is **only** useful when [`skin`](#skin) is set to `"upload"`.

#### Head-up display
{:#hud}

The following settings are used to set contents of the head-up displays (HUD) of the game.
This is just a very rough control of the HUD,
and you may want to use a skin if you want to customize more.
Also, it is possible that the skin you use does **not** respect these settings.

Each of these settings can take one of the following values,
and will not be stated again to avoid repetition:

- `"none"`: The content is an empty string.
- `"title"`: The content is the title of the level (as specified in the chart file).
- `"difficulty-name"`: The content is the name of the difficulty (as specified in the chart file).
- `"difficulty"`: The content is the difficulty (as specified in the chart file).
- `"difficulty-and-name"`: The content is the difficulty name and the difficulty connected by a space.
- `"combo"`: The content is the current combo.
- `"score"`: The content is the current score.
- `"accuracy"`: The content is the current accuracy.

##### Top center
{:#hud-top-center}

- **Setting id**: `hud-top-center`.

##### Top left
{:#hud-top-left}

- **Setting id**: `hud-top-left`.

##### Top right
{:#hud-top-right}

- **Setting id**: `hud-top-right`.

### Audio settings

#### SE (note hit sound effects)

- **Setting id**: `se`.
- **Possible values**: `"default"`, `"online"`, `"upload"`.

This setting is used for you to provide a Sunniesnow plugin file
to add sound effects to the notes when they are hit.
They are called *SE* in Lyrica, so we call it SE here, too.

##### Online
{:#se-online}

- **Setting id**: `se-online`.

You can fill in the identifier of an online SE to use it here.
If you want to use a SE from **outside** the server of Sunniesnow,
you may also specify the URL of the plugin file you want to use here.

This setting is only **useful** when [`se`](#se) is set to `"online"`.

##### Upload
{:#se-upload}

- **Setting id**: `se-upload`.
- **Notice**: This setting cannot be specified through [URL parameters](#url-parameters).

You can upload a plugin file here as the SE.

This setting is only **useful** when [`se`](#se) is set to `"upload"`.

#### Volume

##### SE
{:#volume-se}

- **Setting id**: `volume-se`.
- **Possible values**: Numbers between 0 and 2 with step being 0.05.

This setting is used to set the volume of the SE.
A volume being one means the original volume.

##### Music
{:#volume-music}

- **Setting id**: `volume-music`.
- **Possible values**: Numbers between 0 and 2 with step being 0.05.

This setting is used to set the volume of the music.
A volume being one means the original volume.

#### Play SE with music
{:#se-with-music}

- **Setting id**: `se-with-music`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the SE should be played with the music.

When it is `true`, the SE will (almost perfectly) sync with the music
and will be affected by the [`delay`](#delay) setting.
When it is `false`, the SE will be played immediately when the note is hit,
and will not be affected by the [`delay`](#delay) setting.

#### Delay

- **Setting id**: `delay`.
- **Possible values**: Any number.

This setting specifies the desired audio delay for the music in milliseconds.
The larger the delay, the later the music will be played.
This setting is used to adjust video-audio sync.

It does not affect judgements, however.
To adjust judgements, you may want to use the [`offset`](#offset) setting.

### Game settings

#### Autoplay

- **Setting id**: `autoplay`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the game should be played automatically.

When it is `true`, the game will be played automatically.
All notes are hit perfectly and automatically.

Whether the UI reflects whether the game is autoplaying is dependent on the skin.

#### Speed (of music)
{:#game-speed}

- **Setting id**: `game-speed`.
- **Possible values**: Any number greater than or equal to 0.1.

This setting is used to set the speed (i.e. playback rate) of the music.
The larger the speed, the faster the music will be played.
A speed of one means the original speed.

Do **not** confuse this with the [`speed`](#speed) setting,
which controls the scroll speed.

#### Mirror

The following settings are used to apply mirroring to the **whole** chart.
To apply mirroring, the whole chart is flipped
(either horizontally or vertically or both).
This includes the position of the notes,
the direction of flicks and tip points,
and the appearance of background patterns (including big texts).

##### Horizontal flip

- **Setting id**: `horizontal-flip`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the notes should be flipped horizontally.

##### Vertical flip

- **Setting id**: `vertical-flip`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the notes should be flipped vertically.

#### Start and end

The following settings specifies a range of the chart to play.
The range is specified by the start and end position of the range
(**not** in seconds or milliseconds),
where a position of 0 means the start of the music audio file,
and a position of 1 means the end of the music audio file.
The positions **may** be negative or greater than 1,
this is useful when you want to play a part of the chart
which are not within the range of the music.

The actual events in the chart that are included are those
that satisfy both of the following rules:

- The (start) time of the event is greater than or equal to
the position specified by [`start`](#start) minus [`resume-preperation-time`](#resume-preperation-time).
- The (start) time of the event is less than or equal to
the position specified by [`end`](#end).

##### Start

- **Setting id**: `start`.
- **Possible values**: Any number.

##### End

- **Setting id**: `end`.
- **Possible values**: Any number.

#### Preperation time

##### Resume preperation time

- **Setting id**: `resume-preperation-time`.
- **Possible values**: Any non-negative number.

This setting is used to set the preperation time before resuming the game
in seconds.
When you pause the game and then resume it,
the music does **not** start at the exact position where you paused it,
but starts a little bit earlier defined by this setting.

This setting also affects which events defined in the chart will actually
appear in gameplay.
See [start and end](#start-and-end) for more details.

##### Beginning preperation time

- **Setting id**: `beginning-preperation-time`.
- **Possible values**: Any non-negative number.

This setting is used to set the preperation time before starting the game
in seconds.
When you start playing a chart,
the actual position where the music starts is a little bit earlier
(by this setting)
than the (start) time of the first event that appears in gameplay
or the start position defined by [`start`](#start)
(whichever is earlier).

### Control settings

Although Lyrica is a mobile rhythm game,
Sunniesnow **is playable** with keyboard and mouse, too.

Keyboard keys and mouse buttons are effectively the **same** thing during the gameplay
(reminding you of [osu!](https://osu.ppy.sh){:target="_blank"}),
but their settings are seperated in different settings entries.

Keys, mouse buttons use the position of the mouse cursor,
and touches use the position of each touch correspondingly.
However, you may optionally toggle on a special kind of judgement called the *whole-screen judgement*.
With whole-screen judgement,
hitting anywhere on the screen has the same effect,
and flicks may be hit just as taps.
Whole-screen judgement **only** affects the gameplay,
and it does **not** affect how you can hit the UI buttons (pause button etc.).

#### Keyboard

##### Enable keyboard

- **Setting id**: `enable-keyboard`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the keyboard should be enabled at all.
If it is `false`, the keyboard inputs will be ignored,
in **all** scenes including the main gameplay scene, the pause menu, and the results scene.

##### Keyboard keys have whole-screen judgement
{:#keyboard-whole-screen}

- **Setting id**: `keyboard-whole-screen`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the keyboard keys should have whole-screen judgement.

This setting is **only** useful when [`enable-keyboard`](#enable-keyboard) is `true`.

##### Exclude keys

- **Setting id**: `exclude-keys`.
- **Possible values**: A list of keyboard keys seperated by spaces.

This setting is used to set which keyboard keys should be excluded.
This applies to **all** scenes including the main gameplay scene, the pause menu, and the results scene.

The full list of keys can be found
[here](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values){:target="_blank"}
(use the key values **without** quotes), with an exception:
the <kbd>Spacebar</kbd> key is represented by `"Spacebar"` instead of `" "`.

This setting is **only** useful when [`enable-keyboard`](#enable-keyboard) is `true`.

##### Pause keys

- **Setting id**: `pause-keys`.
- **Possible values**: A list of keyboard keys seperated by spaces.

This setting is used to set which keyboard keys may be used to pause the music
**even if** the mouse cursor is not pointing at the pause button
or [`keyboard-pause`](#keyboard-pause) is `false`.
This applies to all scenes including the main gameplay scene, the pause menu, and the results scene.

The full list of keys can be found
[here](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values){:target="_blank"}
(use the key values **without** quotes), with an exception:
the <kbd>Spacebar</kbd> key is represented by `"Spacebar"` instead of `" "`.

This setting is **only** useful when [`enable-keyboard`](#enable-keyboard) is `true`.

##### Keyboard can press pause button in-game

- **Setting id**: `keyboard-pause`.
- **Possible values**: `true`, `false`.

If this setting is `true`,
you can hit the pause button in-game just like
how you would hit a note without whole-screen judgement
using the keyboard keys.
In other words, you can hit the pause button by moving the mouse cursor to it
and pressing any keyboard keys that are not excluded by [`exclude-keys`](#exclude-keys).
If it is `false`, the only way to hit the pause button by keyboard is by pressing any key
listed in [`pause-keys`](#pause-keys).

This setting **only** affects the main gameplay scene,
and it does **not** affect other scenes such as the pause menu and the results scene.

This setting is only useful when [`enable-keyboard`](#enable-keyboard) is `true`.

#### Mouse

##### Enable mouse buttons
{:#enable-mouse}

- **Setting id**: `enable-mouse`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the mouse buttons should be enabled at all.
If it is `false`, the mouse button inputs will be ignored,
in **all** scenes including the main gameplay scene, the pause menu, and the results scene.

##### Mouse buttons have whole-screen judgement
{:#mouse-whole-screen}

- **Setting id**: `mouse-whole-screen`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the mouse buttons should have whole-screen judgement.

This setting is **only** useful when [`enable-mouse`](#enable-mouse) is `true`.

##### Exclude mouse buttons
{:#exclude-buttons}

- **Setting id**: `exclude-buttons`.
- **Possible values**: A list of mouse buttons seperated by spaces.

This setting is used to set which mouse buttons should be excluded.
This applies to **all** scenes including the main gameplay scene, the pause menu, and the results scene.

The full list of mouse buttons can be found
[here](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button#value){:target="_blank"}.
Because the list is short, here is the full list:

- `0`: Main button pressed, usually the left button or the un-initialized state.
- `1`: Auxiliary button pressed, usually the wheel button or the middle button (if present).
- `2`: Secondary button pressed, usually the right button.
- `3`: Fourth button, typically the *Browser Back* button.
- `4`: Fifth button, typically the *Browser Forward* button.

##### Pause mouse buttons
{:#pause-buttons}

- **Setting id**: `pause-buttons`.
- **Possible values**: A list of mouse buttons seperated by spaces.

This setting is used to set which mouse buttons may be used to pause the music
**even if** the mouse cursor is not pointing at the pause button
or [`mouse-pause`](#mouse-pause) is `false`.
This applies to all scenes including the main gameplay scene, the pause menu, and the results scene.

The full list of mouse buttons can be found
[here](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button#value){:target="_blank"}
or in the explanation of [`exclude-buttons`](#exclude-buttons).

This setting is **only** useful when [`enable-mouse`](#enable-mouse) is `true`.

##### Mouse can click pause button in-game
{:#mouse-pause}

- **Setting id**: `mouse-pause`.
- **Possible values**: `true`, `false`.

If this setting is `true`,
you can hit the pause button in-game just like
how you would hit a note without whole-screen judgement
using the mouse buttons.
In other words, you can hit the pause button by moving the mouse cursor to it
and pressing any mouse buttons that are not excluded by [`exclude-buttons`](#exclude-buttons).
If it is `false`, the only way to hit the pause button by mouse is by pressing any mouse button
listed in [`pause-buttons`](#pause-buttons).

This setting **only** affects the main gameplay scene,
and it does **not** affect other scenes such as the pause menu and the results scene.

This setting is only useful when [`enable-mouse`](#enable-mouse) is `true`.

#### Touchscreen

##### Enable touchscreen

- **Setting id**: `enable-touchscreen`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the touchscreen should be enabled at all.
If it is `false`, the touchscreen inputs will be ignored,
in **all** scenes including the main gameplay scene, the pause menu, and the results scene.

##### Touchscreen has whole-screen judgement
{:#touchscreen-whole-screen}

- **Setting id**: `touchscreen-whole-screen`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the touchscreen should have whole-screen judgement.

This setting is **only** useful when [`enable-touchscreen`](#enable-touchscreen) is `true`.

##### Can touch pause button in-game
{:#touch-pause}

- **Setting id**: `touch-pause`.
- **Possible values**: `true`, `false`.

If this setting is `true`,
you can hit the pause button in-game just like
how you would hit a note without whole-screen judgement
using the touchscreen.

This setting **only** affects the main gameplay scene,
and it does **not** affect other scenes such as the pause menu and the results scene.

This setting is only useful when [`enable-touchscreen`](#enable-touchscreen) is `true`.

### System settings

#### Resolution

The default values of the following settings are dependent on your device.
Actually, the screen resolution of your screen.
Sometimes you may find that the default values are too large
for the game to run smoothly
(this is due to the poor graphical performance of the browser,
especially on mobile devices),
so you may want to set them to smaller values to have better experience.

##### Width

- **Setting id**: `width`.
- **Possible values**: Any positive integer.

This setting is used to set the width of the game canvas.

##### Height

- **Setting id**: `height`.
- **Possible values**: Any positive integer.

This setting is used to set the height of the game canvas.

#### Fullscreen

##### Enter fullscreen on start
{:#fullscreen-on-start}

- **Setting id**: `fullscreen-on-start`.
- **Possible values**: `true`, `false`.

If it is `true`, the game will try to go to fullscreen mode when it starts.
You can still toggle fullscreen by other means after the game has started.
There is a button in the pause menu to let you toggle fullscreen.

##### Float instead of actual fullscreen
{:#float-as-fullscreen}

- **Setting id**: `float-as-fullscreen`.
- **Possible values**: `true`, `false`.

There are two ways of handling fullscreen in the browser:
one is to use the native [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)
(when this setting is `false`),
and the other is to make the position of the canvas fixed and make it cover the whole screen
(when this setting is `true`).

When using the Fullscreen API, it may fail due to permission checks by the browser.
For example, in Chrome, you will have to interact with the webpage before anything in the webpage can go fullscreen.
This will make things inconvenient when using [`instant-start`](#instant-start).
Some browser environments also lack the proper support of the Fullscreen API.

When using the Fullscreen API,
you can exit fullscreen mode when you hit <kbd>Escape</kbd> or <kbd>F11</kbd> on most browsers.

#### Plugins
{:#plugin}

- **Setting id**: `plugin`.
- **Possible values**: An array, each element of which is one of `"online"` and `"upload"`.

Each plugin has its own settings.
Each element in the array represents the settings for one plugin.

The possible values of [`plugin-online`](#plugin-online) and [`plugin-upload`](#plugin-upload)
are also arrays,
and the elements of the three arrays correspond to each other.

You can click the *Add* button to add a plugin,
and click the *Delete* button to remove a plugin.

##### Online
{:#plugin-online}

- **Setting id**: `plugin-online`.
- **Possible values**: An array with the same length as [`plugin`](#plugin),

You may set the identifier of an online plugin to use it.
If you want to use a plugin that is **not** in the Sunniesnow server,
you may specify the URL of the plugin file.

This setting is **only** useful when the corresponding [`plugin`](#plugin) item is `"online"`.

##### Upload
{:#plugin-upload}

- **Setting id**: `plugin-upload`.

You may upload a plugin file to use it.

This setting is **only** useful when the corresponding [`plugin`](#plugin) item is `"upload"`.

#### Renderer

- **Setting id**: `renderer`.
- **Possible values**: `"canvas"`, `"webgl"`.

When the setting is `"canvas"`,
Sunniesnow uses the canvas API to draw everything.
When the setting is `"webgl"`,
Sunniesnow uses the [WebGL](https://webgl.org){:target="_blank"} API
to draw everything.

The technical differences between the two renderers:

- WebGL is a more modern API than canvas.
It draws hardware-accelerated 2D and 3D graphics,
whereas canvas focuses on 2D graphics.
- Canvas loads slightly faster than WebGL,
but WebGL draws **significantly** faster than canvas.
- Canvas is supported by more browsers than WebGL.

The actual differences that you may experience during the game:

- Because some features are too expensive to be implemented using canvas,
canvas lacks some features than WebGL.
For example, [`background-blur`](#background-blur) is only available when WebGL is used;
with the default skin, the trails of tip points
and the colorful rank frame of the all-perfect rank
are only visible when WebGL is used.
- There would be performance differences between the two renderers.
However, although WebGL is generally faster than canvas,
canvas **may** be faster than WebGL
because by using canvas some features are dropped.

#### WebGL options

There are some graphical settings
that are **only** useful when [`renderer`](#renderer) is set to `"webgl"`.

##### Antialias

- **Setting id**: `antialias`.
- **Possible values**: `true`, `false`.

This setting is used to set whether antialiasing should be enabled.
When it is `true`, antialiasing is enabled.
When it is `false`, antialiasing is disabled.

Antialiasing is a technique to make the edges of objects look smoother.
It may lead to noticeable performance loss on some devices.

##### Power preference

- **Setting id**: `power-preference`.
- **Possible values**: `"default"`, `"low-power"`, `"high-performance"`.

This is a hint indicating what configuration of GPU is suitable for the WebGL context.
Setting it to `"high-performance"` will prioritize performance over power consumption,
and setting it to `"low-power"` will prioritize power consumption over performance.

Because this is just a hint, whether it actually affects the performance
or the power consumption is **not** certain.

#### Debug

- **Setting id**: `debug`.
- **Possible values**: `true`, `false`.

If it is `true`, the game will be in debug mode.
The game will show more information on UI in debug mode.

## URL search parameters

You can use URL search parameters to specify settings.
This will override the saved settings from previous sessions.

The parameter names are the same as the setting ids listed above.
The parameter values are whatever values you want.
String values are the
[URL-encoded](https://en.wikipedia.org/wiki/URL_encoding){:target="_blank"}
values of the corresponding setting values (**without** quotes).
Numeric values are just the decimal representations of the corresponding setting values.
Boolean values are `true` and `false`.

For example, if you want to specify the judgement windows
to be the strict judgement windows in the URL,
the scroll speed to be 2.5, and to play SE with music,
append the following search string to the URL of Sunniesnow:

```plain
?judgement-windows=strict&speed=2.5&se-with-music=true
```

[Try it yourself!](.?judgement-windows=strict&speed=2.5&se-with-music=true)

### Special notice about some settings

#### Space-separated lists

For [`exclude-buttons`](#exclude-buttons) etc., the values are space-separated lists.
In a URL encoded string, spaces are replaced with plus signs (`+`),
so the space-separated lists are then represented as `+`-separated lists.

For example, if you want to exclude the left, middle, and right buttons of the mouse,
you may append the following search string to the URL of Sunniesnow:

```plain
?exclude-buttons=0+1+2
```

[Try it yourself!](.?exclude-buttons=0+1+2)

#### Arrays (for plugins)

To specify an array in the URL, specify a parameter multiple times.
For example, `plugin=online&plugin=upload` makes `plugin` to have value
`["online", "upload"]`.

Then, you may use this to specify the online plugins to use.
For example, if you want to use the plugin `sample-plugin` and the plugin `empty`,
you may append the following search string to the URL of Sunniesnow:

```plain
?plugin=online&plugin-online=sample-plugin&plugin=online&plugin-online=empty
```

[Try it yourself!](.?plugin=online&plugin-online=sample-plugin&plugin=online&plugin-online=empty)

### Other URL search parameters

Besides the settings, there are some other URL search parameters.
Some of them do not require any values to be specified.
For example, to use [`instant-start`](#instant-start), you may append the following search string to the URL of Sunniesnow:

```plain
?instant-start
```

and that is all.

#### `instant-start`

This parameter does not need any value.
When there is `instant-start` present in the URL parameters,
the game will start immediately after the page is loaded.

Note that if [`fullscreen`](#fullscreen) is `true`,
it is probable that the game cannot enter fullscreen mode normally
due to the permission checks by the browser.
