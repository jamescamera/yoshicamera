# Yoshi Camera

**One shutter. Every camera.**

Live at **[yoshicamera.com](https://yoshicamera.com)** — open it on a phone.

Yoshi Camera is a browser camera app built around a single idea: instead of
picking a filter from a menu, you swipe through a rack of entirely different
*cameras*, each one a from-scratch image algorithm rather than a colour
preset laid over the same feed. Some ration colour like a fixed budget. Some
draw with typography instead of pixels. Some remember the last few seconds
and paint with time itself. None of them use a model — everything on screen
is arithmetic over the live frame, computed in your browser, every frame.

A project by [Yoshi Babaganoush](https://x.com/minted_i).

---

## The cameras

The rack currently holds 36 instruments. Swipe left or right (or use the
dots) to move between them; each gets its own controls in the setup sheet.

| Camera | What it does |
|---|---|
| Gamut | Every colour, once |
| Ink | A fixed amount of ink |
| Rain | Written in falling glyphs |
| Mosaic | Assembled from emoji |
| Joiner | A composite camera |
| Fold | A weaving camera |
| Facet | A compound eye |
| Ridge | A carbon relief camera |
| Riot | A graphic poster camera |
| Halo | A touch-bent time lens |
| Prism | A colour constellation camera |
| Riptide | A fluid-time camera |
| Litho | A living topographic camera |
| Interference | A moiré camera |
| Shatter | A glass camera |
| Infinite | A recursion camera |
| Goober | It has identified a goober |
| One Bit | Two colours, nothing else |
| Ribbon | One line per moment |
| VHS | A magnetic tape camcorder |
| Potato | A camera from a worse phone |
| Psyche | A hallucinogenic screen-print camera |
| Warhol | A silkscreen quad camera |
| Liquid Light | A living oil-projector camera |
| Chroma Type | A colour-word camera |
| Newsprint | A newspaper-word camera |
| Lyrics | A refrain camera |
| ASCII Deluxe | A high-detail character camera |
| Emoji | A pixel-face emoji camera |
| Lifeform | A cellular automata camera |
| Veil | An ink-band camera |
| Fresco | A painterly glitch camera |
| Current | A motion-field camera |
| Colony | A friend-and-enemy camera |
| Afterimage | An accumulated exposure camera |
| Glass | A pane in front of the scene |

Gamut is the founding camera and the one described in detail below; every
other instrument is its own algorithm with its own sliders, living in the
same file.

---

## What else it does

- **Stills and video.** The shutter saves a PNG. Recording saves MP4 where
  the browser supports it, falling back to WebM otherwise — pick a fixed
  aspect (Reel 9:16, Square 1:1, Wide 16:9, or full Screen) before you start.
- **GIF.** Hold the shutter to record a short loop instead of a still.
- **Extra white.** Exports a still as an Ultra HDR JPEG — an ordinary SDR
  image with a gain map appended, so HDR screens can drive the highlights
  past white. A mask overlay (`Show mask`) previews which pixels will burn.
- **A photo or video instead of a lens.** `Use a photo or video` runs every
  camera on a picture or clip you load, drag in, or paste, instead of the
  live feed — no camera needed. A loaded video loops continuously as the
  source, so effects that read motion work on it the same way they do on
  a live feed, and recording from it carries the clip's own audio through
  to the export, not just the mic.
- **Zoom, torch and focus.** Where the browser exposes them (Chrome on
  Android), lens controls appear on the picture itself and in the setup
  sheet. iOS hands out none of these, by Apple's own design.
- **Hold and Look.** `Hold` freezes the current frame; `Look` peeks at the
  undistorted picture for as long as you press it, so you can compare the
  camera's take against the source.
- **Installable, and works offline.** It's a PWA — add it to your home
  screen and a service worker caches the app shell for tunnels, flights, and
  patchy signal.

---

## How it works

Four steps for Gamut, no machine learning anywhere:

1. The camera frame is scaled down to a grid.
2. Every pixel is ranked by where its colour falls along a **3D Hilbert
   curve** through the RGB cube.
3. Those ranks are sorted.
4. Rank *n* receives palette colour *n*.

The palette is built by walking the same Hilbert curve through all
16,777,216 possible colours and taking evenly spaced samples — so it's a
bijection between pixels and colours, not an approximation. The whole thing
runs in about 10 milliseconds a frame using a precomputed lookup table and a
two-pass radix sort.

The other 34 cameras each implement their own transform the same way —
hand-written canvas/WebGL code reading the raw frame — rather than sharing
one filter pipeline with different parameters.

### Why flat surfaces explode into colour, in Gamut

Because the palette has no duplicates to give them. A blank wall wants to be
one colour, but there is only one of each colour and they've all been
spoken for. So the wall gets a spread of neighbouring shades instead, and
erupts into iridescence — while your face, which occupies a wide range of
colours already, keeps its structure.

### Recording, on Android specifically

Chrome's `MediaRecorder` writes MP4 when a device supports it, and its MP4
muxer records the real duration correctly. Where MP4 encoding isn't
available it falls back to WebM — but Chrome streams a WebM's header out
before it knows how long the recording will run, leaving a "duration
unknown" placeholder baked into the file. Left alone, that makes clips look
far shorter than they are to anything reading the file afterwards (gallery
apps, editors, share targets), and can stop them being trimmed past the
apparent end. Before saving a WebM, this app patches the reserved duration
field in the file's own header with the real elapsed time, so the exported
clip reports correctly everywhere it's opened.

---

## Questions people keep asking

**Is there depth estimation or segmentation in here?**

No. No depth pass, no segmentation, no face detection, no model of any kind,
in any of the 35 cameras. In Gamut specifically, surfaces look coherent
because the transform is very nearly a pure function of colour applied
globally — pixels sharing an input colour land about 8× tighter together
than the frame's overall spread, wherever they are in the picture. Real
materials are already tight clusters in colour space, so the sort inherits
that structure for free. Depth reads correctly because the mapping is
monotonic, so shading gradients survive as gradients.

**Does Gamut really use every colour exactly once?**

Yes, and it's been verified by histogramming the output: at a 900×1600
still, 1,440,000 pixels produce 1,440,000 distinct colours, and the maximum
number of times any single colour appears is 1.

Two honest caveats:

- The palette is always the same size as the pixel count, spread evenly
  through the full cube. A large still uses around 8–13% of all 16.7 million
  colours, each exactly once. It is not "every colour that exists" unless
  the image is 4096×4096.
- **Video does not preserve this.** H.264 is lossy and subsamples chroma by
  design. A recorded clip is a lossy record of frames that did hold true.
  The PNG from the shutter is exact, because PNG is lossless.

**What does Dither do to the guarantee?**

Nothing. The noise is applied to the sort key, never to the output — it
changes which pixel receives a colour, not which colours exist. Verified at
every setting. Raising **Fidelity** above zero *does* break it, and the
readout says so when you do.

---

## Running it yourself

It's a single static HTML file — `index.html` — with no build step and no
dependencies. `manifest.webmanifest` and `sw.js` make it installable and
offline-capable; `icon-192.png` / `icon-512.png` are the PWA icons; `CNAME`
is only relevant to the GitHub Pages deployment at yoshicamera.com.

Browsers only hand out camera access on a secure context, so open it over
`https://` or from `localhost` — not a plain `http://` address on your LAN.
Any static file server works, for example:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

---

## Privacy

**Your camera feed never leaves your device.** There is no server and no
account. Frames are processed in your browser and discarded when you close
the tab; stills, GIFs and video save straight to your own downloads.
Nothing you point the camera at is transmitted anywhere, ever.

The one thing that does leave: a cookieless page-view count via
GoatCounter, so I know whether anyone is using this. It records a hit, not
a person — no cookies, no fingerprinting, no personal data, and nothing
whatsoever about what your camera sees. Remove the two-line script tag at
the bottom of `index.html` if you'd rather it didn't.

---

## Prior art

[allRGB](https://allrgb.com) is a long-running community built around the
constraint of using each colour exactly once, and Gamut is a real-time
camera built on their idea, not a new one. Its 3D Hilbert curve construction
follows Skilling's algorithm. Neither is claimed here.

---

## Licence

MIT. See [LICENSE](LICENSE). The source is public so the privacy claims
above can be checked rather than trusted. Images and video you make with it
are entirely yours.
