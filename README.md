# @arraypress/waveform-bar-astro

Astro component wrappers around [`@arraypress/waveform-bar`](https://github.com/arraypress/waveform-bar) — a Spotify-style persistent bottom-bar audio player. Two components:

| | |
|---|---|
| **`<WaveformBar>`** | Singleton mount. Render **once** in your root layout. Takes a typed `config` prop. |
| **`<WaveformBarTrigger>`** | Polymorphic click trigger. Render anywhere you want a play / queue button — product cards, modals, track rows. |

The core libraries stay zero-dependency vanilla JS, so they keep working anywhere a `<script>` tag does (WordPress, Shopify, raw HTML). This package adds framework-native ergonomics — typed props, proper attribute serialisation, JSON encoding for arrays — for Astro users.

```astro
---
import { WaveformBar, WaveformBarTrigger } from '@arraypress/waveform-bar-astro';
---
<WaveformBarTrigger
  url="/audio/track.mp3"
  title="My Track"
  artist="Producer"
/>

<WaveformBar config={{ persist: true, continuous: true }} />
```

## Installation

```bash
npm install @arraypress/waveform-bar-astro \
            @arraypress/waveform-bar \
            @arraypress/waveform-player
```

Both core libraries are peer dependencies — you bring them so you control versions. The bar has a strict runtime dependency on the player; both must be present.

## Setup

Load both core libraries' JS + CSS once in your root layout, then mount `<WaveformBar>` once after the content:

```astro
---
// src/layouts/Layout.astro
import '@arraypress/waveform-player/dist/waveform-player.css';
import '@arraypress/waveform-bar/dist/waveform-bar.css';
import wfpJsUrl from '@arraypress/waveform-player/dist/waveform-player.min.js?url';
import wbJsUrl  from '@arraypress/waveform-bar/dist/waveform-bar.min.js?url';
import { WaveformBar } from '@arraypress/waveform-bar-astro';
---
<html>
  <head>
    <script src={wfpJsUrl} is:inline></script>
    <script src={wbJsUrl}  is:inline></script>
  </head>
  <body>
    <slot />
    <WaveformBar config={{ persist: true, continuous: true }} />
  </body>
</html>
```

Trigger buttons can now be rendered on any page that uses this layout.

## Usage

### Basic play trigger

```astro
<WaveformBarTrigger
  url="/audio/track.mp3"
  title="My Track"
  artist="Producer"
/>
```

Renders a `<button>` with the play / pause SVG pair the library knows how to toggle. Clicking starts playback in the persistent bar at the bottom of the page.

### With full metadata

```astro
<WaveformBarTrigger
  url="/audio/beat.mp3"
  id="product-42"
  title="Trap Beat"
  artist="Producer"
  artwork="/img/cover.jpg"
  album="Beat Tape Vol. 3"
  bpm={140}
  key="Cm"
  duration="3:45"
  link="/products/trap-beat"
  meta={['Stems included', '24-bit']}
/>
```

### Add to queue (no auto-play)

```astro
<WaveformBarTrigger
  mode="queue"
  url="/audio/track.mp3"
  title="My Track"
>
  + Queue
</WaveformBarTrigger>
```

### Pre-computed waveform peaks

```astro
<WaveformBarTrigger
  url="/audio/track.mp3"
  waveform="/peaks/track.json"
/>
```

Saves a Web Audio decode at play time. Generate the JSON at build time with [`@arraypress/waveform-gen`](https://github.com/arraypress/waveform-gen).

### DJ-mode markers (multi-chapter mixes)

As playback crosses each marker, the bar updates its displayed title, artist, artwork, and metadata to match — giving long DJ mixes a "chapter" feel.

```astro
<WaveformBarTrigger
  url="/audio/guest-mix.mp3"
  title="Friday Night Mix"
  artist="DJ One"
  markers={[
    { time: 0,   label: 'Intro', title: 'Opening Track' },
    { time: 180, label: 'Drop',  title: 'Big Tune', bpm: 174, key: 'Am' },
    { time: 360, label: 'Outro', title: 'Cooldown' },
  ]}
>
  Play mix
</WaveformBarTrigger>
```

### Whole-card-as-trigger

When the entire card should be clickable. Set `as="div"` and `noDefaultIcons` so the SVG pair doesn't leak into the layout:

```astro
<WaveformBarTrigger
  as="div"
  url="/audio/track.mp3"
  title="Card Track"
  noDefaultIcons
  class="product-card"
>
  <img src={cover} alt="" />
  <h3>{title}</h3>
</WaveformBarTrigger>
```

### Initial favorite / cart state

The bar reads these on first paint and reflects them in the UI:

```astro
<WaveformBarTrigger
  url="/audio/track.mp3"
  title="My Track"
  favorited={user.favorites.includes('sku-42')}
  inCart={cart.items.includes('sku-42')}
/>
```

## `<WaveformBar>` config

Every field optional — the library has sensible defaults.

### Persistence & behaviour

| Prop | Type | Default | Description |
|---|---|---|---|
| `persist` | `boolean` | `true` | Save queue / current track / position to sessionStorage; volume + favourites to localStorage. |
| `autoResume` | `boolean` | `true` | Resume playback after a reload / view transition. |
| `continuous` | `boolean` | `true` | Auto-advance to the next queued track when one ends. |
| `repeat` | `'off' \| 'all' \| 'one'` | `'off'` | Initial repeat mode. |

### UI toggles

| Prop | Type | Default | Description |
|---|---|---|---|
| `showQueue` | `boolean` | `true` | Show queue toggle + panel. |
| `showPrevNext` | `boolean` | `true` | Show prev / next skip buttons. |
| `showRepeat` | `boolean` | `true` | Show repeat-mode button. |
| `showVolume` | `boolean` | `true` | Show volume slider popup. |
| `showMute` | `boolean` | `true` | Show mute toggle. |
| `showTime` | `boolean` | `true` | Show current / total time. |
| `showTrackLink` | `boolean` | `true` | Make title clickable. |
| `showMeta` | `boolean` | `true` | Show BPM / key / custom-meta chips. |
| `maxMeta` | `number` | `3` | Cap the number of meta chips. |

### Theming + visualisation

| Prop | Type | Default | Description |
|---|---|---|---|
| `theme` | `'dark' \| 'light' \| null` | `null` | `null` auto-detects from page. |
| `defaultArtwork` | `string` | — | Fallback cover when a track has no artwork. |
| `waveform` | `boolean` | `true` | `false` swaps the waveform for a classic Spotify-style seek bar. |
| `waveformStyle` | `'bars' \| 'mirror' \| 'line' \| 'blocks' \| 'dots' \| 'seekbar'` | `'mirror'` | |
| `waveformHeight` | `number` | `32` | Canvas height in pixels. |
| `barWidth` | `number` | `2` | Bar / block width. |
| `barSpacing` | `number` | `0` | Gap between bars. |
| `waveformColor` | `string` | auto | Unplayed peak colour. |
| `progressColor` | `string` | auto | Played-through colour. |
| `markerColor` | `string` | `rgba(255,255,255,0.25)` | Default marker colour. |

### Volume + persistence keys

| Prop | Type | Default | Description |
|---|---|---|---|
| `volume` | `number` | — | Initial volume (0..1). |
| `storageKey` | `string` | `'waveform-bar'` | Prefix for storage keys. |

### Layout & docking

| Prop | Type | Default | Description |
|---|---|---|---|
| `mode` | `'waveform' \| 'classic'` | `'waveform'` | `'classic'` = Spotify-style centre layout + seek bar. |
| `position` | `'bottom' \| 'top'` | `'bottom'` | Which edge the bar docks to. |
| `wide` | `boolean` | `false` | Waveform mode only: span full viewport width (lifts the 1400px cap). |
| `collapsible` | `boolean` | `false` | Show a collapse button that shrinks the bar to a floating transport pill. |
| `showShuffle` | `boolean` | `false` | Show a shuffle toggle in the transport cluster. |
| `shuffle` | `boolean` | `false` | Start with shuffle (random queue advance) on. |

### Sharing

| Prop | Type | Default | Description |
|---|---|---|---|
| `share` | `boolean` | `false` | Show a "copy share link" button (emits `?<shareParam>=<seconds>`). |
| `shareParam` | `string` | `'wt'` | URL query param for the shared timestamp (seconds). |

### Error handling

| Prop | Type | Default | Description |
|---|---|---|---|
| `errorText` | `string \| null` | `null` | Custom "audio failed to load" message (`null` = player default). |

### Actions (favorite / cart endpoints)

```astro
<WaveformBar config={{
  actions: {
    favorite: { endpoint: '/api/favorites', method: 'POST' },
    cart:     { endpoint: '/api/cart',      method: 'POST' },
  },
}} />
```

Each action object accepts `{ endpoint, method?, headers? }`. The library POSTs a small JSON payload (`{ action, id, url, title, ... }`) when the user clicks the bar's favourite / cart buttons.

> The core library also lets you pass a function for `endpoint` (so you can intercept in-browser instead of round-tripping a request). That form is **not** available from the Astro wrapper because Astro can't serialise functions through the server/client boundary. If you need it, call `window.WaveformBar.init({ actions: { favorite: { endpoint: fn } } })` from your own client-side script and skip the Astro mount.

## `<WaveformBarTrigger>` props

### Track identity / metadata

| Prop | Type | Becomes |
|---|---|---|
| `url` *required* | `string` | `data-wb-url` |
| `id` | `string` | `data-wb-id` (falls back to `url`) |
| `title` | `string` | `data-wb-title` |
| `artist` | `string` | `data-wb-artist` |
| `album` | `string` | `data-wb-album` |
| `artwork` | `string` | `data-wb-artwork` |
| `link` | `string` | `data-wb-link` |

### Display chips

| Prop | Type | Becomes |
|---|---|---|
| `duration` | `string \| number` | `data-wb-duration` |
| `bpm` | `string \| number` | `data-wb-bpm` |
| `key` | `string` | `data-wb-key` |
| `meta` | `string[]` | `data-wb-meta` (JSON) |

### Audio data

| Prop | Type | Becomes |
|---|---|---|
| `waveform` | `number[] \| string` | `data-wb-waveform` (JSON if array) |
| `markers` | `WaveformBarMarker[]` | `data-wb-markers` (JSON) |

### Initial state

| Prop | Type | Becomes |
|---|---|---|
| `favorited` | `boolean` | `data-wb-favorited` |
| `inCart` | `boolean` | `data-wb-in-cart` |

### Behaviour

| Prop | Type | Default | Description |
|---|---|---|---|
| `mode` | `'play' \| 'queue'` | `'play'` | Play vs queue-append. |
| `as` | `'button' \| 'a' \| 'div' \| 'span'` | `'button'` | Element to render. |
| `href` | `string` | — | When `as="a"`. |
| `ariaLabel` | `string` | auto | Falls back to `Play {title}` / `Add {title} to queue`. |
| `class` | `string` | — | Appended to `wb-icon-swap`. |
| `noDefaultIcons` | `boolean` | `false` | Suppress the default play / pause SVGs. |

## Listening to bar events

Astro can't pass function props across the server/client boundary, so this package doesn't expose `onPlay` / `onPause` callbacks. The core library dispatches every state change as a bubbling `CustomEvent` instead — listen from any client-side script:

```astro
<script>
document.addEventListener('waveformbar:play',       e => console.log('playing', e.detail));
document.addEventListener('waveformbar:pause',      e => console.log('paused',  e.detail));
document.addEventListener('waveformbar:trackchange',e => console.log('track:',  e.detail.track));
document.addEventListener('waveformbar:favorite',   e => console.log('fav:',    e.detail));
document.addEventListener('waveformbar:cart',       e => console.log('cart:',   e.detail));
document.addEventListener('waveformbar:volumechange',e => console.log('vol:',   e.detail.volume));
document.addEventListener('waveformbar:markerchange',e => console.log('marker:',e.detail.marker));
document.addEventListener('waveformbar:queuechange',e => console.log('queue:',  e.detail.queue));
</script>
```

## TypeScript

```ts
import type {
  WaveformBarProps,
  WaveformBarConfig,
  WaveformBarTriggerProps,
  WaveformBarTrackData,
  WaveformBarMarker,
  WaveformBarActions,
  WaveformBarAction,
  WaveformBarTheme,
  RepeatMode,
  TriggerMode,
  WaveformStyle,
} from '@arraypress/waveform-bar-astro';
```

An ambient declaration is shipped for `window.WaveformBar` so consumer scripts reaching for the global get autocomplete on `play()`, `pause()`, `next()`, etc.

## Testing

```bash
npm test            # one-shot
npm run test:watch
npm run typecheck
```

49 Vitest tests via Astro's `experimental_AstroContainer` API — no browser required.

## License

MIT © ArrayPress
