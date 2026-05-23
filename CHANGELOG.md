# Changelog

All notable changes to `@arraypress/waveform-bar-astro` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] — Unreleased

### Fixed

- `<WaveformBarTrigger>`'s default pause-icon SVG no longer carries an
  inline `style="display:none;"`. The previous value beat the core
  library's class-based toggle
  (`.wb-icon-swap.wb-playing .wb-show-pause { display: inline; }`),
  leaving the pause icon permanently hidden once a track started
  playing. The library's own CSS already covers the initial-hidden
  state via `.wb-icon-swap .wb-show-pause { display: none; }`, so the
  inline style is redundant as well as harmful.
- Added two regression tests pinning the no-inline-display contract
  so the bug can't return.

## [0.1.0]

Initial release.

### Added

- **`<WaveformBar>`** — singleton mount component for the persistent
  bottom bar. Renders a `transition:persist` host div and an inline
  init script that calls `window.WaveformBar.init(config)` on every
  `astro:page-load`. Relocates the library's `.waveform-bar`
  element into the persist host so view transitions keep it
  onscreen between navigations.
- Typed `WaveformBarConfig` covering every option `window.WaveformBar.init()`
  accepts:
  - Persistence: `persist`, `autoResume`, `continuous`, `repeat`
  - UI toggles: `showQueue`, `showPrevNext`, `showRepeat`,
    `showVolume`, `showMute`, `showTime`, `showTrackLink`,
    `showMeta`, `maxMeta`
  - Theming: `theme`, `defaultArtwork`
  - Waveform visualisation: `waveformStyle`, `waveformHeight`,
    `barWidth`, `barSpacing`, `waveformColor`, `progressColor`,
    `markerColor`
  - Volume + persistence keys: `volume`, `storageKey`
  - Server-side actions: `actions.favorite` / `actions.cart` with
    `endpoint` URL + optional `method` / `headers`
- **`<WaveformBarTrigger>`** — polymorphic click trigger. Renders a
  `<button>` by default; override via `as="a" | "div" | "span"`.
  Emits the full `data-wb-*` attribute contract:
  - Track identity: `url`, `id` (falls back to `url`), `title`,
    `artist`, `album`, `artwork`, `link`
  - Display chips: `duration`, `bpm`, `key`, `meta`
  - Audio data: `waveform` (peaks array, URL, or inline JSON),
    `markers` (DJ-mode chapters)
  - Initial state: `favorited`, `inCart`
  - Behaviour: `mode='play' | 'queue'`, `href` (when `as="a"`),
    `ariaLabel`, `class`, `noDefaultIcons`
- Default slot ships the play / pause SVG pair the core library
  toggles via `wb-show-play` / `wb-show-pause` classes. Passing
  children replaces them.
- Auto-generated `aria-label` when one isn't supplied —
  `Play {title}` for play triggers, `Add {title} to queue` for
  queue triggers.
- Public TypeScript types: `WaveformBarProps`, `WaveformBarConfig`,
  `WaveformBarTriggerProps`, `WaveformBarTrackData`,
  `WaveformBarMarker`, `WaveformBarActions`, `WaveformBarAction`,
  `WaveformBarTheme`, `RepeatMode`, `TriggerMode`, `WaveformStyle`.
- Ambient declaration for `window.WaveformBar` covering the full
  public surface (`play`, `pause`, `next`, `previous`, `addToQueue`,
  `setVolume`, `setRepeat`, `seekToMarker`, etc.).
- Vitest suite of 46 tests via Astro's `experimental_AstroContainer`
  covering attribute mapping, omission semantics, JSON
  serialisation for arrays, polymorphic `as`, default-slot
  behaviour, aria-label generation, and a kitchen-sink scenario.
- Documentation: full README with setup, prop tables, every usage
  pattern, and the `waveformbar:*` custom-event API.
  `examples/basic.astro` reference page with six demonstrations.
