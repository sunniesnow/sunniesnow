---
layout: default
title: Sunniesnow Help
math: true
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
- **Possible values**: `"loose"`, `"medium"`, `"strict"`, `"rigorous"`, `"custom"`.

This setting is used to set the judgement time windows.
There are three tiers of judgement time windows: *strict*, *medium*, and *loose*.

The loose tier is the **same** as the judgement windows of
[Lyrica](https://lyricagame.wixsite.com/lyricagame){:target="_blank"}.
Data (data in "hold (*end*)" entries are **ratio** to the duration of the hold,
and other data are in **milliseconds**
(the internal values are in seconds)):

| | early bad | early good | early perfect | late perfect | late good | late bad |
|:--|--:|--:|--:|--:|--:|--:|
| tap | -400 | -300 | -120 | +120 | +300 | +400 |
| drag | -400 | -300 | -120 | +120 | +300 | +400 |
| flick | -400 | -400 | -300 | +120 | +300 | +400 |
| hold (*start*) | -400 | -400 | -400 | +400 | +400 | +400 |
| hold (*end*) | -&infin; | 0.4 | 0.7 | | | |
| drag-flick | -400 | -400 | -300 | +120 | +300 | +400 |

Data for the medium tier:

| | early bad | early good | early perfect | late perfect | late good | late bad |
|:--|--:|--:|--:|--:|--:|--:|
| tap | -240 | -160 | -80 | +80 | +160 | +240 |
| drag | -240 | -240 | -120 | +120 | +240 | +240 |
| flick | -240 | -180 | -120 | +120 | +180 | +240 |
| hold (*start*) | -240 | -240 | -120 | +120 | +240 | +240 |
| hold (*end*) | -&infin; | 0.7 | 0.7 | | | |
| drag-flick | -240 | -240 | -120 | +120 | +240 | +240 |

Data for the strict tier:

| | early bad | early good | early perfect | late perfect | late good | late bad |
|:--|--:|--:|--:|--:|--:|--:|
| tap | -150 | -100 | -50 | +50 | +100 | +150 |
| drag | -150 | -150 | -100 | +100 | +150 | +150 |
| flick | -150 | -100 | -50 | +50 | +100 | +150 |
| hold (*start*) | -150 | -100 | -50 | +50 | +100 | +150 |
| hold (*end*) | -&infin; | 0.8 | 0.8 | | | |
| drag-flick | -150 | -150 | -100 | +100 | +150 | +150 |

Data for the rigorous tier:

| | early bad | early good | early perfect | late perfect | late good | late bad |
|:--|--:|--:|--:|--:|--:|--:|
| tap | -100 | -60 | -30 | +30 | +60 | +100 |
| drag | -120 | -120 | -80 | +80 | +120 | +120 |
| flick | -100 | -60 | -30 | +30 | +60 | +100 |
| hold (*start*) | -100 | -60 | -30 | +30 | +60 | +100 |
| hold (*end*) | -&infin; | 0.8 | 0.8 | | | |
| drag-flick | -120 | -120 | -80 | +80 | +120 | +120 |

The interval for drag notes are **different** when [`lyrica-5`](#lyrica-5) is `true`:
the perfect interval is the same as the bad interval.

When this setting is `"custom"`, the following settings will be available to enter,
and they will be used to determine the judgement time windows:

- `judgement-windows-custom-tap-early-bad`,
- `judgement-windows-custom-tap-early-good`,
- `judgement-windows-custom-tap-early-perfect`,
- `judgement-windows-custom-tap-late-perfect`,
- `judgement-windows-custom-tap-late-good`,
- `judgement-windows-custom-tap-late-bad`,
- `judgement-windows-custom-drag-early-bad`,
- `judgement-windows-custom-drag-early-good`,
- `judgement-windows-custom-drag-early-perfect`,
- `judgement-windows-custom-drag-late-perfect`,
- `judgement-windows-custom-drag-late-good`,
- `judgement-windows-custom-drag-late-bad`,
- `judgement-windows-custom-flick-early-bad`,
- `judgement-windows-custom-flick-early-good`,
- `judgement-windows-custom-flick-early-perfect`,
- `judgement-windows-custom-flick-late-perfect`,
- `judgement-windows-custom-flick-late-good`,
- `judgement-windows-custom-flick-late-bad`,
- `judgement-windows-custom-hold-early-bad`,
- `judgement-windows-custom-hold-early-good`,
- `judgement-windows-custom-hold-early-perfect`,
- `judgement-windows-custom-hold-late-perfect`,
- `judgement-windows-custom-hold-late-good`,
- `judgement-windows-custom-hold-late-bad`,
- `judgement-windows-custom-hold-end-early-good`,
- `judgement-windows-custom-hold-end-early-perfect`,
- `judgement-windows-custom-drag-flick-early-bad`,
- `judgement-windows-custom-drag-flick-early-good`,
- `judgement-windows-custom-drag-flick-early-perfect`,
- `judgement-windows-custom-drag-flick-late-perfect`,
- `judgement-windows-custom-drag-flick-late-good`, and
- `judgement-windows-custom-drag-flick-late-bad`.

All the values are in seconds although they are entered in milliseconds,
so you need to enter milliseconds in judgement settings UI,
but you need to enter seconds when using URL parameters
because the internal values are in seconds.
When using custom windows, the windows for drag notes are **not** affected by [`lyrica-5`](#lyrica-5).
The early bad judgement for hold end is always negative infinity.

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

This setting specifies the judgement offset in milliseconds
(the internal value is in seconds).
The larger the offset,
the **later** the time at which the player are supposed to hit the notes.
This setting is intended to fix the latency in the video.

This does **not** affect the audio-video sync.
To fix the audio-video sync, use [`delay`](#delay).

#### Mechanics

##### Lyrica 5 mechanics
{:#lyrica-5}

- **Setting id**: `lyrica-5`.
- **Possible values**: `true`, `false`.

There was a major update in Lyrica 5.0.0 that changed the mechanics of the game.
This setting is used to set whether the mechanics of the game should mock that of Lyrica 5.0.0.

When this setting is set to `true`, the following mechanics are changed:

- The score and the accuracy is calculated differently.
- The bad judgement is called *Ok* now, but it depends on the skin.
- The perfect interval of drag notes are changed to be the same as the bad interval of them.
- Hitting (instead of swiping over) a drag note will only impose judgement on the drag note itself
  instead of hitting other notes behind the drag note.
  This means [`no-early-drag`](#no-early-drag) will not have an effect.
- Bad judgement does not break the combo.
- The look of the AP/FC indicator is changed.

##### Drag notes cannot be hit early
{:#no-early-drag}

- **Setting id**: `no-early-drag`.
- **Possible values**: `true`, `false`.

This setting is used to set whether drag notes can be hit early.
When this setting is set to `false`,
tapping on a drag note within its judgement window will hit the note immediately.
When this setting is set to `true`,
the judgement will be delayed until the exact time of the drag note
(and reduces difficulty if [`lyrica-5`](#lyrica-5) is `false`).

##### Hold notes lock the position of touch
{:#locking-hold}

- **Setting id**: `locking-hold`.
- **Possible values**: `true`, `false`.

When this setting is set to `true`,
moving a touch point away from a hold note is regarded as releasing it
(increasing difficulty).

#### Flick windows

##### Minimum distance
{:#min-flick-distance}

- **Setting id**: `min-flick-distance`.
- **Possible values**: Any non-negative number.

After a touch point hit a flick note,
the touch point must move by a certain distance
before the end of the bad judgement window
(see [`judgement-windows`](#judgement-windows));
otherwise, the flick note will be judged as a **miss**.
This distance is defined as the value of this setting **times** the radius of the note
(when the value of [`note-size`](#note-size) is one).

When the touch point moves by more than this distance
**while** being in the angle range specified by [`flick-angle-range`](#flick-angle-range),
the flick note will be forced to release immediately.
The judgement of a released flick note is explained in [`flick-angle-range`](#flick-angle-range).

##### Maximum distance
{:#max-flick-distance}

- **Setting id**: `max-flick-distance`.
- **Possible values**: Any non-negative number.

A flick note is forced to release when the touch point that hit it
moves by a certain distance.
This distance is defined as the value of this setting **times** the radius of the note
(when the value of [`note-size`](#note-size) is one).
The judgement of a released flick note is explained in [`flick-angle-range`](#flick-angle-range).

In Lyrica, this value is effectively infinity,
so the default value is `999`, which is also effectively infinity.
Historically, the default value of this option used to be `3`.

##### Angle range
{:#flick-angle-range}

- **Setting id**: `flick-angle-range`.
- **Possible values**: Any number between 0 and 180 (inclusive).

After a flick note is properly released,
the direction of the displacement vector of the touch point that hit the flick note
is compared to the direction of the flick note.

If the angle between these two directions is less than the value of this setting (in degrees),
then the flick note will be judged as a perfect or good,
depending on the time when it was hit.
This judgement is independent of the time when it was released,
and is independent of the direction of the movement of the touch point.

If the angle between these two directions is greater than the value of this setting (in degrees),
then the flick note will be judged as a bad.

##### Judgement priority by angle
{:#overlapping-flick-fix}

- **Setting id**: `overlapping-flick-fix`.
- **Possible values**: `true`, `false`.

When this setting is `true`, for flick notes that are simultaneous **and** completely overlapping,
where in the judgement area the player taps will determine which note gets judged.
The smaller the angle between the angle of the flick note and the segment connecting the center of the note and the tapped position,
the higher the judgement priority of the note.

When this setting is `false`, the judgement priority of flick notes that are simultaneous and completely overlapping
will be purely determined by the order of their appearances in the chart file.
This is the behavior of Lyrica, which is manifest in the special chart of Frog Rappa.

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

When [`scroll`](#scroll) is `true`, this setting is the time
(in seconds) for the note to travel the distance specified by
[`scroll-distance`](#scroll-distance)
(which is the height of the canvas set by
[`height`](#height) multiplied by the value of 
[`scroll-distance`](#scroll-distance)).

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

#### Simultaneity hints

Simultaneity hints are lines connecting notes that are supposed to be hit at the same time.
Note that the recoloring of simultaneous tap notes is **not** controlled by these settings
because it is a skin feature.

##### Tap
{:#double-line-tap}

- **Setting id**: `double-line-tap`.
- **Possible values**: `true`, `false`.

Enable simultaneity hints for tap notes.

##### Hold
{:#double-line-hold}

- **Setting id**: `double-line-hold`.
- **Possible values**: `true`, `false`.

Enable simultaneity hints for hold notes.

##### Drag
{:#double-line-drag}

- **Setting id**: `double-line-drag`.
- **Possible values**: `true`, `false`.

Enable simultaneity hints for drag notes.

##### Flick
{:#double-line-flick}

- **Setting id**: `double-line-flick`.
- **Possible values**: `true`, `false`.

Enable simultaneity hints for flick notes.

##### Drag-flick
{:#double-line-drag-flick}

- **Setting id**: `double-line-drag-flick`.
- **Possible values**: `true`, `false`.

Enable simultaneity hints for drag-flick notes.

#### FX options

##### Hide FX in front of notes
{:#hide-fx-in-front}

- **Setting id**: `hide-fx-in-front`.
- **Possible values**: `true`, `false`.

This setting is used to hide the FX in front of notes.
When it is `true`, the FX in front of notes will not be displayed.

For the default skin, this has no effect.

##### Hide FX of perfect judgement
{:#hide-fx-perfect}

- **Setting id**: `hide-fx-perfect`.
- **Possible values**: `true`, `false`.

This setting is used to hide the FX of perfect judgement.
When it is `true`, the FX of perfect judgement will not be displayed.

##### Hide FX of start of hold notes
{:#hide-fx-hold-start}

- **Setting id**: `hide-fx-hold-start`.
- **Possible values**: `true`, `false`.

This setting is used to hide the FX of the start of hold notes.
When it is `true`, the FX of the start of hold notes will not be displayed.

##### Always update FX even when pausing
{:#always-update-fx}

- **Setting id**: `always-update-fx`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the FX should be updated even when the game is paused.
If it does not update, the FX will stop animating and be stuck at the current frame.
When it is `true`, the FX will always be updated even
whether the game is playing or pausing.
When it is `false`, the FX will not be updated when the game is paused
and only be updated when the game is playing.

#### Scroll mode

##### Judgement line position
{:#scroll-judgement-line}

- **Setting id**: `scroll-judgement-line`.
- **Possible values**: Any number.

This setting is used to set the position of the judgement line in the scroll mode.
This setting is useless if [`scroll`](#scroll) is `false`.
The position of the judgement line is at the top of the canvas
if this setting equals `0`, and at the bottom of the canvas
if this setting equals `1`.

##### Scroll distance
{:#scroll-distance}

- **Setting id**: `scroll-distance`.
- **Possible values**: Any number.

This setting is used to set the distance between the judgement line and the notes in the scroll mode.
This setting is useless if [`scroll`](#scroll) is `false`.
The distance is this setting multiplied by the height of the canvas
(the value of [`height`](#height)).

#### Hide

##### Tip points
{:#hide-tip-points}

- **Setting id**: `hide-tip-points`.
- **Possible values**: `true`, `false`.

This setting is used to hide the tip points.
When it is `true`, the tip points will not be displayed.

##### Notes
{:#hide-notes}

- **Setting id**: `hide-notes`.
- **Possible values**: `true`, `false`.

This setting is used to hide the notes.
When it is `true`, the notes and the simultaneity hints will not be displayed.

##### Circles
{:#hide-circles}

- **Setting id**: `hide-circles`.
- **Possible values**: `true`, `false`.

This setting is used to hide the circles.
When it is `true`, the circles will not be displayed.

##### Background notes
{:#hide-bg-notes}

- **Setting id**: `hide-bg-notes`.
- **Possible values**: `true`, `false`.

This setting is used to hide the background notes.
When it is `true`, the background notes will not be displayed.

##### FX
{:#hide-fx}

- **Setting id**: `hide-fx`.
- **Possible values**: `true`, `false`.

This setting is used to hide the FX.
When it is `true`, the FX will not be displayed.

##### Background pattern
{:#hide-bg-pattern}

- **Setting id**: `hide-bg-pattern`.
- **Possible values**: `true`, `false`.

This setting is used to hide the background pattern.
When it is `true`, the background pattern will not be displayed.

#### Miscellaneous

##### Touch effects

- **Setting id**: `touch-effects`.
- **Possible values**: `true`, `false`.

This setting is used to enable or disable the touch effects.

##### Reverse the display order of notes
{:#reverse-note-order}

- **Setting id**: `reverse-note-order`.
- **Possible values**: `true`, `false`.

This setting is used to reverse the display order of notes.
When it is `true`, later notes will be displayed below earlier notes.

##### Circles move with notes
{:#circle-moves-with-note}

- **Setting id**: `circle-moves-with-note`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the circles should move with the notes.
Currently, this only affects scroll mode (when [`scroll`](#scroll) is `true`).
When it is `true`, the circles will move with the notes.
When it is `false`, the circles will not move with the notes.

##### Disable ornamental effects
{:#disable-ornament}

- **Setting id**: `disable-ornament`.
- **Possible values**: `true`, `false`.

This setting is used to disable the ornamental effects of the game.
Ornamental effects include:

- changes in speed specified by the chart,
- changes in opacity, size, position, rotation, etc. of notes, background patterns, etc,
- special changes to HUDs specified by the chart,
- shader effects.

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

This setting specifies the desired audio delay for the music in milliseconds
(the internal value is in seconds).
The larger the delay, the later the music will be played.
This setting is used to adjust video-audio sync.

It does not affect judgements, however.
To adjust judgements, you may want to use the [`offset`](#offset) setting.

#### Latency hint

- **Setting id**: `latency-hint`.
- **Possible values**: `"balanced"`, `"interactive"`, `"playback"`, `"value"`.

The type of playback as a balance between audio output latency and power consumption.
See [here](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext#latencyhint){:target="_blank"}
for the meaning of each options.

##### Value
{:#latency-hint-value}

- **Setting id**: `latency-hint-value`.
- **Possible values**: Any number greater than or equal to 0.

This is **only** useful when [`latency-hint`](#latency-hint) is set to `"value"`.

### Haptic settings

#### Vibration

Vibration is a haptic feedback of note hits.

##### Vibration with music

- **Setting id**: `vibration-with-music`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the vibration is played with the music or played following the player input.
This setting is similar to [`se-with-music`](#se-with-music).
When it is `true`, the vibration is played with the music
regardless of the player input.
When it is `false`, the vibration is played following the player input.

##### Vibration delay

- **Setting id**: `vibration-delay`.
- **Possible values**: Any number.

This setting is used to set the delay of the vibration.
The larger the delay, the later the vibration will be played.
This setting is only useful when [`vibration-with-music`](#vibration-with-music) is `true`.
Although the number input on the webpage is in milliseconds,
the internal value of this setting is in seconds.

##### Tap vibration time

- **Setting id**: `tap-vibration-time`.
- **Possible values**: Any number greater than or equal to 0.

This setting is used to set the duration of the vibration of hitting a tap note.
A value of zero is equivalent to disabling the vibration for tap notes.
Different from other time-related settings, the internal value of this setting is in milliseconds,
while other time-related settings are in seconds.

##### Drag vibration time

- **Setting id**: `drag-vibration-time`.
- **Possible values**: Any number greater than or equal to 0.

This setting is used to set the duration of the vibration of hitting a drag note.
A value of zero is equivalent to disabling the vibration for drag notes.
Different from other time-related settings, the internal value of this setting is in milliseconds,
while other time-related settings are in seconds.

##### Flick vibration time

- **Setting id**: `flick-vibration-time`.
- **Possible values**: Any number greater than or equal to 0.

This setting is used to set the duration of the vibration of hitting a flick note.
A value of zero is equivalent to disabling the vibration for flick notes.
Different from other time-related settings, the internal value of this setting is in milliseconds,
while other time-related settings are in seconds.

##### Hold vibration time

- **Setting id**: `hold-vibration-time`.
- **Possible values**: Any number greater than or equal to 0.

This setting is used to set the duration of the vibration of hitting a hold note.
A value of zero is equivalent to disabling the vibration for hold notes.
Different from other time-related settings, the internal value of this setting is in milliseconds,
while other time-related settings are in seconds.

##### Hold vibration period

- **Setting id**: `hold-vibration-period`.
- **Possible values**: Any number greater than or equal to 0.

The duration of a period of the continuing vibration of holding a hold note.
While holding a hold note, one vibration occurs every period.
This setting is **unrelated** to [`hold-vibration-time`](#hold-vibration-time).
Different from other time-related settings, the internal value of this setting is in milliseconds,
while other time-related settings are in seconds.

##### Hold vibration duty cycle

- **Setting id**: `hold-vibration-duty-cycle`.
- **Possible values**: Any number between 0 and 1.

The duty cycle of the vibration of holding a hold note.
The duty cycle is the ratio of the duration of the vibration to the period,
so the duration of each vibration during holding a hold note
is the value of [`hold-vibration-period`](#hold-vibration-period) times the duty cycle.
This setting is **unrelated** to [`hold-vibration-time`](#hold-vibration-time).

##### Drag-flick vibration time

- **Setting id**: `drag-flick-vibration-time`.
- **Possible values**: Any number greater than or equal to 0.

This setting is used to set the duration of the vibration of hitting a drag-flick note.
A value of zero is equivalent to disabling the vibration for drag-flick notes.
Different from other time-related settings, the internal value of this setting is in milliseconds,
while other time-related settings are in seconds.

### Game settings

#### Scroll mode

##### Enable scroll mode
{:#scroll}

- **Setting id**: `scroll`.
- **Possible values**: `true`, `false`.

This setting is used to enable or disable the scroll mode.
In the scroll mode, the notes moves, and the player needs to hit them
when they reach the judgement line.

When it is `true`, the scroll mode is enabled.
When it is `false`, the scroll mode is disabled.

#### Autoplay
{:#autoplay-category}

##### Autoplay
{:#autoplay}

- **Setting id**: `autoplay`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the game should be played automatically.

When it is `true`, the game will be played automatically.
All notes are hit perfectly and automatically.

Whether the UI reflects whether the game is autoplaying is dependent on the skin.

##### Progress adjustable

- **Setting id**: `progress-adjustable`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the progress of the game should be adjustable when autoplaying.
It is only useful when [`autoplay`](#autoplay) is `true`.

When it is `true`, you can adjust the progress of the game when autoplaying.
When it is `false`, the progress of the game will not be adjustable when autoplaying.

{% katexmm %}

To adjust the progress, drag the progress bar at the bottom of the canvas.
Use <kbd>ArrowLeft</kbd> and <kbd>ArrowRight</kbd> to adjust the progress by $2$ seconds.
Use <kbd>,</kbd> and <kbd>.</kbd> to adjust the progress by $1/30$ seconds.
Use <kbd>[</kbd> and <kbd>]</kbd> to forward or rewind the progress continuously.

{% endkatexmm %}

#### Chart offset

- **Setting id**: `chart-offset`.
- **Possible values**: Any number.

This setting is used to set the offset of the chart in milliseconds
(the internal value is in seconds).
The time of all events will be shifted by this value.
The larger the number is, the later the events will be played.

This setting is used to adjust the chart when the chart is not well-timed.

This setting is special in that it is not saved together with other settings.
It is only saved for online level files,
and every time you load an online level file,
the value of this setting will be reset to the value saved for it.

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
the position specified by [`start`](#start) minus [`resume-preparation-time`](#resume-preparation-time).
- The (start) time of the event is less than or equal to
the position specified by [`end`](#end).

##### Start

- **Setting id**: `start`.
- **Possible values**: Any number.

##### End

- **Setting id**: `end`.
- **Possible values**: Any number.

#### Preparation time

##### Resume preparation time

- **Setting id**: `resume-preparation-time`.
- **Possible values**: Any non-negative number.

This setting is used to set the preparation time before resuming the game
in seconds.
When you pause the game and then resume it,
the music does **not** start at the exact position where you paused it,
but starts a little bit earlier defined by this setting.

This setting also affects which events defined in the chart will actually
appear in gameplay.
See [start and end](#start-and-end) for more details.

##### Beginning preparation time

- **Setting id**: `beginning-preparation-time`.
- **Possible values**: Any non-negative number.

This setting is used to set the preparation time before starting the game
in seconds.
When you start playing a chart,
the actual position where the music starts is a little bit earlier
(by this setting)
than the (start) time of the first event that appears in gameplay
or the start position defined by [`start`](#start)
(whichever is earlier).

#### Pause

##### Tap pause button twice in
{:#pause-double-time}

- **Setting id**: `pause-double-time`.
- **Possible values**: Any number greater than or equal to 0.

This setting is used to set the time window in which
you should tap the pause button twice during a level to pause the game.
If the value is set to `0`, the game will be paused immediately when you tap the pause button once.

The game always pauses immediately when you tap the pause button once
when the level has finished (when the game is in the results scene)
regardless of the value of this setting.

##### Notes have priority over the pause button
{:#notes-priority-over-pause}

- **Setting id**: `notes-priority-over-pause`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the notes should have priority over the pause button.
If a touch can potentially either a note or the pause button,
then it will hit the note if this setting is `true`,
otherwise it will hit the pause button.

##### Automatically pause when toggling fullscreen
{:#pause-fullscreen}

- **Setting id**: `pause-fullscreen`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the game should be paused when toggling fullscreen.
When it is `true`, the game will be paused when you toggle fullscreen.
When it is `false`, the game will not be paused when you toggle fullscreen.

##### Automatically pause when losing focus
{:#pause-blur}

- **Setting id**: `pause-blur`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the game should be paused when the window loses focus.
On desktop, it means switching browser tab, minimizing the window, etc.
On mobile, it means switching to another app, locking the screen, etc.
When it is `true`, the game will be paused when it loses focus.
When it is `false`, the game will not be paused when it loses focus.

##### Hide pause UI by default
{:#hide-pause-ui}

- **Setting id**: `hide-pause-ui`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the pause UI should be hidden by default.
When it is `true`, the pause UI will be hidden by default.
When it is `false`, the pause UI will be shown by default.
To toggle the visibility of the pause UI,
set [`second-pause`](#second-pause) to `toggle-ui` and hit the pause button when the game is paused.

##### Pause when the level is about to finish
{:#pause-finish}

- **Setting id**: `pause-finish`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the game should be paused when the level is about to finish
(when every note has a judgement).
When it is `true`, the game will be paused when the level is about to finish.
When you resume here, the game will then actually finish.
When it is `false`, the level will directly finish when it is about to finish.

##### Function of the pause button while pausing
{:#second-pause}

- **Setting id**: `second-pause`.
- **Possible values**: `disabled`, `resume`, `toggle-ui`.

This setting is used to set the function of the pause button when the game is already paused.
When it is `disabled`,
the pause button does nothing when the game is already paused.
When it is `resume`,
the game will resume when the pause button is hit when the game is already paused.
When it is `toggle-ui`,
the pause button will toggle the visibility of the pause UI (the three big buttons)
when the game is already paused.
This setting does **not** affect the function of the pause button
when the level is finished.

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

### Profile settings

#### Nickname

- **Setting id**: `nickname`.
- **Possible values**: Any string.

This setting is used to set the nickname of the player.
The nickname will be displayed in the results scene.

#### Avatar

- **Setting id**: `avatar`.
- **Possible values**: One of `none`, `online`, `upload`, `gravatar`.

This setting is used to set the avatar of the player.
The avatar will be displayed in the results scene.

##### Online
{:#avatar-online}

- **Setting id**: `avatar-online`.
- **Possible values**: Any string.

You can fill in the identifier of an online avatar to use it here.
If you want to use an avatar from **outside** the server of Sunniesnow,
you may also specify the URL of the image you want to use here.

This setting is only **useful** when [`avatar`](#avatar) is set to `online`.

##### Upload
{:#avatar-upload}

- **Setting id**: `avatar-upload`.
- **Notice**: This setting cannot be specified through [URL parameters](#url-parameters).

You can upload an image here as the avatar.

This setting is only **useful** when [`avatar`](#avatar) is set to `upload`.

##### Gravatar
{:#avatar-gravatar}

- **Setting id**: `avatar-gravatar`.
- **Possible values**: Any string.

You can fill in the email address of your [Gravatar](https://gravatar.com/)
account to use its avatar here.

### Integration settings

#### Sscharter

##### Enable sscharter integration
{:#sscharter}

- **Setting id**: `sscharter`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the sscharter integration should be enabled.
When it is `true`, the sscharter integration will be enabled.
When it is `false`, the sscharter integration will be disabled.
When sscharter integration is enabled,
the game will try to connect to the sscharter server
if the currently loaded level is served by sscharter
without the `--production` flag.

##### Live restart
{:#sscharter-live-restart}

- **Setting id**: `sscharter-live-restart`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the game should restart when the level file is updated by sscharter.
When it is `true`, the game will restart when the level is updated by sscharter.
When it is `false`, the game will not restart when the level is updated by sscharter.
This setting is only useful when [`sscharter`](#sscharter) is `true`.

#### Discord Rich Presence

##### Enable Discord Rich Presence
{:#discord-presence}

- **Setting id**: `discord-presence`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the Discord Rich Presence integration should be enabled.
When this setting is `true`, the game will mimick a Discord client using the token provided
in [`discord-token`](#discord-token)
to update the current presence of the user in Discord.
Information shown in the Rich Presence includes the current chart title,
difficulty, and progress.

Technically, using this feature is **against Discord's Terms of Service**
because it mimicks a Discord client to connect to Discord's websocket gateway,
so you should use it at your own risk.
However, there is no known case of Discord banning users for using custom clients,
so the risk should be minimal.

##### Discord token
{:#discord-token}

- **Setting id**: `discord-token`.
- **Possible values**: Any string.

This setting is used to set the Discord token of the user.
You need to manually fill in the token here
(because an OAuth2 flow is not possible for this use case).

To obtain the token, log in your Discord account in your browser,
head to the developer tools,
and find the `Authorization` header in the HTTP request sent by the webpage.

This setting is only useful when [`discord-presence`](#discord-presence) is `true`.

##### Use "Watching" instead of "Playing"
{:#watching-instead-of-playing}

- **Setting id**: `watching-instead-of-playing`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the Rich Presence should use "Watching" instead of "Playing".
When it is `true`, the Rich Presence will use "Watching" status.
Only in this case can the progress bar be shown in the Rich Presence.
When it is `false`, the Rich Presence will use "Playing" status.
The progress bar will be unavailable.

This setting is only useful when [`discord-presence`](#discord-presence) is `true`.

#### Imgur

##### Imgur Client ID
{:#imgur-client-id}

- **Setting id**: `imgur-client-id`.
- **Possible values**: Any string.

This setting is used to set the Imgur Client ID.
Normally you do not need to change this setting
because it almost never gets rate limited.

The Imgur Client ID is used when uploading the background images to Imgur
for use with Discord Rich Presence.
It is not used if [`discord-presence`](#discord-presence) is `false`.

### System settings

#### Interface

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

##### Show in popup window
{:#popup}

- **Setting id**: `popup`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the game should be shown in a popup window.
When it is `true`, the game will be shown in a popup window,
and the game canvas of the current webpage will be hidden.
When it is `false`, the game will be shown in the current webpage.

#### Fullscreen

##### Enter fullscreen on start
{:#fullscreen-on-start}

- **Setting id**: `fullscreen-on-start`.
- **Possible values**: `true`, `false`.

If it is `true`, the game will try to go to fullscreen mode when it starts.
You can still toggle fullscreen by other means after the game has started.
There is a button in the pause menu and a button in the results scene
to let you toggle fullscreen.

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

#### Fonts

##### Avoid downloading fonts
{:#avoid-downloading-fonts}

- **Setting id**: `avoid-downloading-fonts`.
- **Possible values**: `true`, `false`.

If it is `true`, the game will not download any fonts.
This is useful when your network is slow
because downloading fonts may take a long time.

#### Context menu

These settings are used to set the condition for the context menu (right-click menu)
of the game canvas to be enabled.
When the context menu is enabled, you can right-click the game canvas
to show the context menu.

##### Enable when playing
{:#context-menu-play}

- **Setting id**: `context-menu-play`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the context menu should be enabled when playing.
When it is `true`, the context menu will be enabled when playing.
When it is `false`, the context menu will be disabled when playing.

##### Enable when pausing or finished
{:#context-menu-pause}

- **Setting id**: `context-menu-pause`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the context menu should be enabled when pausing or finished.
When it is `true`, the context menu will be enabled when pausing or finished.
When it is `false`, the context menu will be disabled when pausing or finished.

##### Disable when holding <kbd>Control</kbd> or <kbd>Alt</kbd>
{:#context-menu-no-modifier}

- **Setting id**: `context-menu-no-modifier`.
- **Possible values**: `true`, `false`.

This setting is used to set whether the context menu should be disabled
when holding <kbd>Control</kbd>
(<kbd>Command</kbd> on macOS) or <kbd>Alt</kbd>.
When it is `true`, the context menu will be disabled in this case.
When it is `false`, the context menu will not be disabled in this case.
This setting has higher priority than [`context-menu-play`](#context-menu-play)
and [`context-menu-pause`](#context-menu-pause).

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
- **Possible values**: ~~`"canvas"`~~, `"webgl"`, `"webgpu"`.

~~When the setting is `"canvas"`,
Sunniesnow uses the canvas API to draw everything.~~
Setting this to `"canvas"` is not supported
because [PIXI.js removed it](https://github.com/pixijs/pixijs/discussions/10682).
When the setting is `"webgl"`,
Sunniesnow uses the [WebGL](https://webgl.org){:target="_blank"} API
to draw everything.
When the setting is `"webgpu"`,
Sunniesnow uses WebGPU, the successor to WebGL, to draw everything
(if WebGPU is supported on the browser).

The technical differences between the canvas renderer and the WebGL renderer:

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

##### WebGL version
{:#gl-version}

- **Setting id**: `gl-version`.
- **Possible values**: `1`, `2`.

##### Antialias
{:#gl-antialias}

- **Setting id**: `gl-antialias`.
- **Possible values**: `true`, `false`.

This setting is used to set whether antialiasing should be enabled.
When it is `true`, antialiasing is enabled.
When it is `false`, antialiasing is disabled.

Antialiasing is a technique to make the edges of objects look smoother.
It may lead to noticeable performance loss on some devices.

##### Power preference
{:#gl-power-preference}

- **Setting id**: `gl-power-preference`.
- **Possible values**: `"default"`, `"low-power"`, `"high-performance"`.

This is a hint indicating what configuration of GPU is suitable for the WebGL context.
Setting it to `"high-performance"` will prioritize performance over power consumption,
and setting it to `"low-power"` will prioritize power consumption over performance.

Because this is just a hint, whether it actually affects the performance
or the power consumption is **not** certain.

#### WebGPU options

There are some graphical settings
that are **only** useful when [`renderer`](#renderer) is set to `"webgpu"`.

##### Antialias
{:#gpu-antialias}

- **Setting id**: `gpu-antialias`.
- **Possible values**: `true`, `false`.

##### Power preference
{:#gpu-power-preference}
- **Setting id**: `gpu-power-preference`.
- **Possible values**: `"low-power"`, `"high-performance"`

#### Debug
{:#debug-category}

##### Enable debug mode
{:#debug}

- **Setting id**: `debug`.
- **Possible values**: `true`, `false`.

If it is `true`, the game will be in debug mode.
The game will show more information on UI in debug mode.

You can pin points on the screen or remove pinned points
(replace the <kbd>Control</kbd> key below with the <kbd>Command</kbd> key on macOS):

- <kbd>Control</kbd> + click on the game canvas: pin a point.
- <kbd>Control</kbd> + right click on a pinned point,
on the game canvas or on the shown coordinates below the game canvas:
remove the pinned point.
- <kbd>Alt</kbd> + click on a pinned point on the game canvas:
drag the pinned point.
- <kbd>Alt</kbd> + right click on a pinned point,
on the game canvas or on the shown coordinates below the game canvas:
enter coordinates to set the position of the pinned point.

You can also pin a new point by entering the coordinates in the text box below the game canvas.

##### Hide debug UI except in pause
{:#hide-debug-except-pause}

- **Setting id**: `hide-debug-except-pause`.
- **Possible values**: `true`, `false`.

This setting is **only** useful when [`debug`](#debug) is `true`.

If this setting is `true`, the debug UI will be hidden except when the game is paused.
If it is `false`, the debug UI will be shown all the time.

##### Suppress warnings

- **Setting id**: `suppress-warnings`.
- **Possible values**: `true`, `false`.

If it is `true`, the game will suppress warnings from showing on DOM.
It is useful when a chart contains many warnings, and you do not care about them.

Even when suppressed, the warnings are still showing in the console.

## Operations

### Webpage

#### Refresh

Refresh the webpage.
Specially on Firefox, Bypass all network caches.

#### Set language

Set the language of the webpage.
It does not affect the language of the game.

### Settings

#### Delete saved settings
{:#delete-settings}

The settings that you set above are automatically saved for next page load
when you hit the *Start* button.
If you want to delete the saved settings,
you can click the *Delete* button here.
If you reload the page immediately after deleting the saved settings,
the settings will be reset to the default values.

#### Export saved settings
{:#export-settings}

You can export the saved settings to a JSON file here.

#### Import saved settings
{:#import-settings}

You can import saved settings from a JSON file here.

### Offsets

#### Delete saved chart offsets
{:#delete-chart-offsets}

The chart offsets that you set above by filling in [`chart-offset`](#chart-offset)
are automatically saved for every every online level file
that you have played.
They are saved when you hit the *Start* button.
They are restored when you load the same online level file again.
If you want to delete the saved chart offsets,
you can click the *Delete* button here.

#### Export saved chart offsets
{:#export-chart-offsets}

You can export the saved chart offsets to a JSON file here.

#### Import saved chart offsets
{:#import-chart-offsets}

You can import saved chart offsets from a JSON file here.
They are merged with the existing saved chart offsets.

#### Play the Offset Wizard
{:#offset-wizard}

You can play the Offset Wizard by hitting this button.
The chart of the Offset Wizard is **guaranteed** to be well-timed,
so you can use it to set the offsets.
For detailed instructions, see [how to set offsets](#how-to-set-offsets).

How this is different from just setting
[`level-file-online`](#level-file-online) to `"offset-wizard"`
and starting the game is that
this button will automatically set [`autoplay`](#autoplay) to `false`,
[`volume-se`](#volume-se) to `0`,
and [`chart-offset`](#chart-offset) to `0`.
These three settings, if different from the saved settings, will not be saved
so that you can immediately play other levels without changing them back.

### Service worker

[Service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
is used to make the game playable even offline.
This is done by caching everything that needs downloading.

As defined here, there are three kinds of caches:

- **Caches of site resources**:
These are resources that make up the game itself.
- **Caches of online resources**:
These are resources that are retrieved according to user settings,
including online level files, online backgrounds, online skins, etc.
- **Caches of external resources**:
These are resources that are required by plugins,
sucn has online image files that are required by the skins and the FXs.

However, sometimes you may want to update the local files
while you are prevented from doing that because of the cache hits.
That is when you need to delete some of the caches.

*Notice*: The caches are **immediately deleted without confirmation**
when you hit the *Delete* buttons,
and this **cannot be undone**.

#### Delete caches of online resources
{:#delete-online-caches}

After you delete the caches of online resources,
the game will try to retrieve the online resources from the server
(or from whatever URLs you entered) again.
For example, if a level file that you play online is outdated,
you may want to delete the caches of online resources
to make the game retrieve the level file again.

#### Delete caches of site resources
{:#delete-site-caches}

After you delete the caches of site resources,
the game will try to retrieve the site resources from the server again.
You need to do this if the game itself is updated,
and you want to play the new version of the game.

#### Delete caches of external resources
{:#delete-external-caches}

After you delete the caches of external resources,
the game will try to retrieve the external resources from the server again.

### Logs

#### Clear

Clear the logs.

### Cover

#### Generate
{:#cover-generate}

Generates a cover image for the level file.
This can only be used after the game has started.
The resolution of the generated image is the same as the dimension set in
[`width`](#width) and [`height`](#height).

The fields for x and y coordinates and the width are all optional.
When specified, they will be used to determine which part of the background image
is used as the theme image of the cover.
The x and y coordinates are the center of the theme image
(the origin is the top-left corner of the background image).
When omitted, the theme image will be the largest square in the center of the background image.

### Game

#### Start
{:#game-start}

This button is used to start the game.

If you hit this button when the game is already started,
the game will be restarted (i.e. [stopped](#game-stop) and then started).

#### Stop
{:#game-stop}

This button is used to stop the game.
After the game is stopped, it does not update its graphics anymore.
Memory is released, so you cannot resume the game after you stop it.

If you want to start the game again,
you can hit [*Start*](#game-start) button again.

#### Pause
{:#game-pause}

This button is used to pause the game.
This is not affected by [`pause-double-time`](#pause-double-time)
or [`second-pause`](#second-pause).

#### Resume
{:#game-resume}

This button is used to resume the game after it is paused.

#### Retry
{:#game-retry}

This button is used to retry the game after it is finished.

#### Fullscreen

This button is used to toggle fullscreen mode.

#### Toggle pause UI
{:#game-toggle-pause-ui}

This button is used to toggle the visibility of the pause UI (the three big buttons)
when the game is paused.

## Differences between different offsets

There are three different offsets that you can set in Sunniesnow:
[`offset`](#offset), [`delay`](#delay), and [`chart-offset`](#chart-offset).
Each of them mitigates a different synchronization problem.
Here is a comparison in what they actually shift
and what problems they can mitigate:

| Setting | What it shifts | What it mitigates |
|-|-|-|
| `offset` | Judgement time windows | Display lag and input lag |
| `delay` | Music | Audio output lag |
| `chart-offset` | Events in the chart | Charter mis-timed the chart |

Normally, if the same person plays on the browser on the same device,
the `offset` setting and `delay` setting should be the same for all charts.
On the other hand, the `chart-offset` should be different for different charts,
but it should be the same for all players, browsers, and devices.
For this reason, `offset` and `delay` are saved together with other settings,
but `chart-offset` is saved separately per each online level file.

In the following subsections,
we will discuss how these three offsets affect different aspects of the game.

### How to set offsets

Theoretically, you should try to let the three things synchronous:
the display of a note, the music, and
the input of the player (or the judgement time).
(Because human brain also has different lags for vision, hearing, and touch,
so the standards of synchronism is dependent on individuals.)
There is no easy way to measure the display lag, the input lag,
and the audio output lag at the same time.
Fortunately, by the same reason, we just need to offset two things
(namely the music and the judgement windows),
i.e., setting `offset` and `delay`, to make the three things synchronous.

Setting the offsets rely on a well-timed chart.
You can utilize the
[Offset Wizard](https://sunniesnow.github.io/game/?level-file=online&level-file-online=offset-wizard){:target="_blank"},
whose chart is **guaranteed** to be well-timed.
Before you start, you should set [`autoplay`](#autoplay) to `false`
and set [`volume-se`](#volume-se) to `0` (to avoid the SEs from affecting your timing).
The full process of setting the offsets consists of two steps.
The first is to set `offset`, and the second is to set `delay`:

{% katexmm %}

1. (On most devices, the display lag and the input lag is low enough
so that you can just skip this step.)
This step requires you to time your inputs purely by vision
so that you can synchronize the display and the judgement time.
To avoid the music from affecting your timing,
first set [`volume-music`](#volume-music) to `0`.
Then, play the Offset Wizard.
In the results scene, tap the screen in the center to see judgement details.
You should see the mean value ($\mu$) and the standard deviation ($\sigma$).
You should try to let $\sigma$ to be lower than 30 milliseconds
(it is OK if you cannot, but try to make it as low as possible).
Then, add the value of $\mu$ to the `offset` setting.
You can repeat this step until your $\mu$ is very close to zero
(lower than 5 milliseconds at best).
After this step, the display and the judgement time should be synchronous enough.
2. This step requires you to time your inputs purely by hearing
so that you can synchronize the music and the judgement time.
Therefore, do not look at the screen when you play the Offset Wizard in this step.
First, set `volume-music` back to a non-zero value so that you can clearly hear it.
Then, play the Offset Wizard.
Try to let $\sigma$ to be lower than 20 milliseconds
(it is OK if you cannot, but try to make it as low as possible).
Then, subtract the value of $\mu$ from the `delay` setting.
You can repeat this step until your $\mu$ is very close to zero
(lower than 5 milliseconds at best).
After this step, the music and the judgement time should be synchronous enough.
{% endkatexmm %}

After these two steps, you should have your `offset` and `delay` settings well-set.
Normally you do not need to adjust often
because they should be the same for all charts.

After you have set `offset` and `delay`,
you should play well-timed charts without any synchronism problems.
However, if you find that the chart is not well-timed,
you need to adjust the `chart-offset` setting.
You can just add the {% katex %}\mu{% endkatex %} value of one of your plays of the chart
to the `chart-offset` setting
(before that, make sure that `game-speed` is `1`).

### How `start` and `end` treat different offsets

The [`start`](#start) and [`end`](#end) settings are used to set the range of the chart to play.

Whether an event in the chart is included in the gameplay is determined
by whether its time is within a specified range of music.
Therefore, the inclusion of events will possibly change
if you change `chart-offset` because events may be shifted out of or into the range.
However, `offset` and `delay` do **not** affect the inclusion of events.

### How different offset affect SEs

When we talk about SEs being affected,
it means whether the time at which an SE is played **relative to the music** is affected.

When `se-with-music` is `true`, Sunniesnow tries to play the SEs
at the exact same time of the music as the events in the chart specify.
Therefore, the SEs will be affected by `chart-offset`
while `offset` and `delay` do **not** affect the SEs.

When `se-with-music` is `false`, Sunniesnow plays the SEs immediately
when the judgement is made.
When `autoplay` is false, SE are played immediately after the player hits the note,
which depends on the player, so we cannot talk about how they are affected by offsets.
When `autoplay` is true, the judgement of a note is made at the frame when the judgement should have been made,
so the SEs will then be affected by `offset`.
Because the judgement time windows are different relative to the music
when the music is delayed,
so the time at which SEs play relative to the music will also change in this case,
so `delay` also affects SEs.

### How `game-speed` treats different offsets

The [`game-speed`](#game-speed) setting is used to set the speed of the music.
The actual shifted amount by `chart-offset` is affected by `game-speed`,
but `offset` and `delay` are **not** affected.

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
