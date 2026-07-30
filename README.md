# Gamut

**A camera that uses every colour exactly once.**

Live at **[yoshicamera.com](https://yoshicamera.com)** — open it on a phone.

Most camera filters change colours. This one rations them. It builds a palette
containing exactly as many colours as there are pixels on screen, then spends
every single one — each used once and never again. You don't choose the
saturation. The arithmetic forces it.

A project by [Yoshi Babaganoush](https://x.com/minted_i).

---

## How it works

Four steps, no machine learning anywhere:

1. The camera frame is scaled down to a grid.
2. Every pixel is ranked by where its colour falls along a **3D Hilbert curve**
   through the RGB cube.
3. Those ranks are sorted.
4. Rank *n* receives palette colour *n*.

The palette is built by walking the same Hilbert curve through all 16,777,216
possible colours and taking evenly spaced samples — so it's a bijection between
pixels and colours, not an approximation.

The whole thing runs in about 10 milliseconds a frame using a precomputed
lookup table and a two-pass radix sort.

---

## Why flat surfaces explode into colour

Because the palette has no duplicates to give them.

A blank wall wants to be one colour, but there is only one of each colour and
they've all been spoken for. So the wall gets a spread of neighbouring shades
instead, and erupts into iridescence — while your face, which occupies a wide
range of colours already, keeps its structure.

---

## Questions people keep asking

**Is there depth estimation or segmentation in here?**

No. No depth pass, no segmentation, no face detection, no model of any kind.
Surfaces look coherent because the transform is very nearly a pure function of
colour applied globally — pixels sharing an input colour land about 8× tighter
together than the frame's overall spread, wherever they are in the picture.
Real materials are already tight clusters in colour space, so the sort inherits
that structure for free. Depth reads correctly because the mapping is monotonic,
so shading gradients survive as gradients.

**Does it really use every colour exactly once?**

Yes, and it's been verified by histogramming the output: at a 900×1600 still,
1,440,000 pixels produce 1,440,000 distinct colours, and the maximum number of
times any single colour appears is 1.

Two honest caveats:

- The palette is always the same size as the pixel count, spread evenly through
  the full cube. A large still uses around 8–13% of all 16.7 million colours,
  each exactly once. It is not "every colour that exists" unless the image is
  4096×4096.
- **Video does not preserve this.** H.264 is lossy and subsamples chroma by
  design. A recorded clip is a lossy record of frames that did hold true. The
  PNG from the shutter is exact, because PNG is lossless.

**What does Dither do to the guarantee?**

Nothing. The noise is applied to the sort key, never to the output — it changes
which pixel receives a colour, not which colours exist. Verified at every
setting. Raising **Fidelity** above zero *does* break it, and the readout says
so when you do.

---

## Privacy

**Your camera feed never leaves your device.** There is no server and no
account. Frames are processed in your browser and discarded when you close the
tab; stills and video save straight to your own downloads. Nothing you point
the camera at is transmitted anywhere, ever.

The one thing that does leave: a cookieless page-view count via GoatCounter,
so I know whether anyone is using this. It records a hit, not a person — no
cookies, no fingerprinting, no personal data, and nothing whatsoever about
what your camera sees. Remove the two-line script tag at the bottom of
index.html if you'd rather it didn't.

---

## Prior art

[allRGB](https://allrgb.com) is a long-running community built around the
constraint of using each colour exactly once, and this is a real-time camera
built on their idea, not a new one. The 3D Hilbert curve construction follows
Skilling's algorithm. Neither is claimed here.

---

## Licence

MIT. See [LICENSE](LICENSE). The source is public so the privacy claims above
can be checked rather than trusted. Images and video you make with it are
entirely yours.
