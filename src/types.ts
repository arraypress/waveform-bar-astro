/**
 * @module types
 * @description
 * Public TypeScript types for `@arraypress/waveform-bar-astro`.
 *
 * Two component shapes:
 *
 *   1. `<WaveformBar>`         — the singleton persistent bar. Takes
 *                                a `config` object (every option the
 *                                core library accepts at init time).
 *   2. `<WaveformBarTrigger>`  — a polymorphic element that emits the
 *                                `data-wb-*` attribute contract the
 *                                core library scans for. One trigger
 *                                per "click here to play / queue this
 *                                track" surface — product cards,
 *                                quick-view modals, track list rows.
 *
 * Prop names match the library option / attribute names 1:1
 * (camelCase). The components handle the conversion to the library's
 * runtime shape (init-time JSON for the bar, `data-wb-*` attributes
 * for the trigger).
 *
 * Callbacks are intentionally NOT exposed as props. Astro can't
 * serialise functions across the server/client boundary, and the core
 * library also dispatches every state change as a bubbling
 * `waveformbar:*` `CustomEvent`. Listen to those from your own
 * client-side scripts — that's the framework-agnostic path the core
 * library is designed for.
 *
 * @see {@link https://github.com/arraypress/waveform-bar} — core library
 */

import type { WaveformStyle } from './waveform-style';

/* Re-export the WaveformStyle alias for ergonomic consumer imports. */
export type { WaveformStyle } from './waveform-style';

/**
 * Visual theme used by the bar. `null` (the default) lets the bar
 * auto-detect from the host page's theme.
 */
export type WaveformBarTheme = 'dark' | 'light' | null;

/**
 * Repeat-mode cycle position.
 *
 * - `off` — play the queue once, then stop
 * - `all` — loop the entire queue
 * - `one` — loop the current track indefinitely
 */
export type RepeatMode = 'off' | 'all' | 'one';

/**
 * Trigger behaviour for `<WaveformBarTrigger>`.
 *
 * - `play`  — (default) immediate play. The core library starts
 *   playback as soon as the trigger is clicked.
 * - `queue` — append to the queue without changing the current track.
 *   Maps to the library's `data-wb-queue` attribute.
 */
export type TriggerMode = 'play' | 'queue';

/**
 * A clickable DJ-mode marker within a single track. Markers fire as
 * playback crosses each `time`; the bar updates its displayed title /
 * artist / artwork / metadata to the marker's values, giving a
 * "chapter" feel to long mixes.
 */
export interface WaveformBarMarker {
	/** Time in seconds at which the marker becomes active. */
	time: number;
	/** Short label shown above the waveform when the marker is reached. */
	label: string;
	/** Override the bar title at this marker. */
	title?: string;
	/** Override the artist line at this marker. */
	artist?: string;
	/** Override the artwork at this marker (image URL). */
	artwork?: string;
	/** Override BPM at this marker. */
	bpm?: string | number;
	/** Override musical key at this marker. */
	key?: string;
	/** Per-marker line colour on the waveform (CSS colour). */
	color?: string;
}

/**
 * Configuration for a server-side action endpoint the bar calls when
 * the user toggles favorite/cart state.
 *
 * `endpoint` is a URL string. The library performs a `fetch()` with
 * the configured `method` and an optional headers map.
 *
 * Note: the core library also accepts a function for `endpoint` (so
 * you can intercept the request without leaving the browser), but
 * that form is unavailable from Astro because functions can't survive
 * the server/client serialisation boundary. If you need that level of
 * control, configure the bar from your own client-side script using
 * `window.WaveformBar.init({ actions: { favorite: { endpoint: fn } } })`
 * and skip the `<WaveformBar>` Astro component for that field.
 */
export interface WaveformBarAction {
	/** Endpoint URL the library POSTs to. */
	endpoint: string;
	/** HTTP method. Defaults to `'POST'` on the library side. */
	method?: string;
	/** Optional headers map merged on top of the default Content-Type. */
	headers?: Record<string, string>;
}

/**
 * `actions` block on the bar config — wire up the favourite / cart
 * toggle endpoints. Either action can be omitted; the bar just emits
 * a `waveformbar:favorite` / `waveformbar:cart` event for that
 * interaction so a client script can handle it directly.
 */
export interface WaveformBarActions {
	favorite?: WaveformBarAction;
	cart?: WaveformBarAction;
}

/**
 * Full configuration object for the persistent bar. Mirrors the
 * options accepted by `window.WaveformBar.init(...)`.
 *
 * Every field is optional — the core library has sensible defaults
 * for everything. Pass only the keys you want to override.
 */
export interface WaveformBarConfig {
	// ── Persistence & behaviour ─────────────────────────────────────────

	/**
	 * Save queue, current track index, and playback position to
	 * `sessionStorage`; save volume + mute + favorites to
	 * `localStorage`. Enables seamless resume after page reloads and
	 * `astro:page-load` navigations.
	 *
	 * @default true
	 */
	persist?: boolean;

	/**
	 * Resume playback automatically after a navigation, picking up
	 * roughly where the user left off. Requires {@link persist}.
	 *
	 * @default true
	 */
	autoResume?: boolean;

	/**
	 * Auto-advance to the next queued track when the current one
	 * finishes. Pairs naturally with {@link repeat}.
	 *
	 * @default true
	 */
	continuous?: boolean;

	/**
	 * Initial repeat mode.
	 *
	 * @default 'off'
	 */
	repeat?: RepeatMode;

	// ── UI element toggles ─────────────────────────────────────────────

	/** Show the queue toggle button + queue panel. @default true */
	showQueue?: boolean;
	/** Show the previous / next skip buttons. @default true */
	showPrevNext?: boolean;
	/** Show the repeat-mode button. @default true */
	showRepeat?: boolean;
	/** Show the volume slider popup. @default true */
	showVolume?: boolean;
	/** Show the mute toggle. @default true */
	showMute?: boolean;
	/** Show the current / total time readout. @default true */
	showTime?: boolean;
	/** Make the title clickable — when true the title links to the
	 *  track's `data-wb-link`. @default true */
	showTrackLink?: boolean;
	/** Render the BPM / key / custom-tag chips. @default true */
	showMeta?: boolean;

	/**
	 * Maximum number of metadata chips to render. Useful for keeping
	 * the bar dense — e.g. show BPM only by capping at 1.
	 *
	 * @default 3
	 */
	maxMeta?: number;

	// ── Defaults & theming ─────────────────────────────────────────────

	/**
	 * Artwork URL to use when a track has no `artwork` of its own.
	 * The bar still falls back to a generic icon if this is unset.
	 */
	defaultArtwork?: string | null;

	/**
	 * Forced theme. `null` (default) auto-detects from the page.
	 *
	 * @default null
	 */
	theme?: WaveformBarTheme;

	// ── Waveform visualisation ─────────────────────────────────────────

	/** `false` swaps the waveform for a classic Spotify-style seek bar. @default true */
	waveform?: boolean;

	/** Visual style of the waveform in the bar. @default 'mirror' */
	waveformStyle?: WaveformStyle;

	/** Waveform canvas height in pixels. @default 32 */
	waveformHeight?: number;

	/** Bar/block width in pixels. @default 2 */
	barWidth?: number;

	/** Gap between bars in pixels. @default 0 */
	barSpacing?: number;

	/** Colour of the unplayed waveform (CSS colour). Auto from theme
	 *  when unset. */
	waveformColor?: string | null;

	/** Colour of the played-through portion (CSS colour). Auto from
	 *  theme when unset. */
	progressColor?: string | null;

	/** Default marker line colour when a marker provides no override. */
	markerColor?: string;

	// ── Volume & persistence keys ──────────────────────────────────────

	/** Initial volume (0..1). Persisted afterwards if {@link persist}. */
	volume?: number;

	/**
	 * Prefix used for sessionStorage / localStorage keys. Change this
	 * if you run multiple `<WaveformBar>` instances on different
	 * subdomains and want them to keep separate state.
	 *
	 * @default 'waveform-bar'
	 */
	storageKey?: string;

	// ── Layout & docking ───────────────────────────────────────────────

	/**
	 * Which edge of the viewport the bar docks to.
	 *
	 * @default 'bottom'
	 */
	position?: 'bottom' | 'top';

	/**
	 * Let the bar's content span the full viewport width, lifting the
	 * built-in 1400px max-width cap.
	 *
	 * @default false
	 */
	wide?: boolean;

	/**
	 * Show a collapse button that shrinks the bar down to a floating
	 * transport pill.
	 *
	 * @default false
	 */
	collapsible?: boolean;

	/**
	 * Display mode. `'waveform'` (default) = default layout + waveform,
	 * width-adjustable. `'classic'` = Spotify-style centre layout + seekbar,
	 * always full-width.
	 *
	 * @default 'waveform'
	 */
	mode?: 'waveform' | 'classic';

	/**
	 * Show a shuffle toggle button in the transport cluster.
	 *
	 * @default false
	 */
	showShuffle?: boolean;

	/**
	 * Start with shuffle (random queue advance) on. Works with or without
	 * the toggle button (`showShuffle`).
	 *
	 * @default false
	 */
	shuffle?: boolean;

	// ── Sharing ────────────────────────────────────────────────────────

	/**
	 * Show a "copy share link" button. The copied URL carries the
	 * current playback position as a `?<shareParam>=<seconds>` query
	 * param.
	 *
	 * @default false
	 */
	share?: boolean;

	/**
	 * URL query param used for the shared timestamp (in seconds).
	 *
	 * @default 'wt'
	 */
	shareParam?: string;

	// ── Error handling ─────────────────────────────────────────────────

	/**
	 * Custom "audio failed to load" message shown in the bar. `null`
	 * keeps the underlying player's default message.
	 *
	 * @default null
	 */
	errorText?: string | null;

	// ── Server-side action endpoints ───────────────────────────────────

	/** Favorite / cart endpoints. See {@link WaveformBarActions}. */
	actions?: WaveformBarActions | null;
}

/**
 * Props accepted by `<WaveformBar>` — the singleton mount component.
 *
 * Render this **once** in your root layout. Subsequent navigations
 * (Astro view transitions) re-init the bar with the same config
 * automatically.
 */
export interface WaveformBarProps {
	/**
	 * Bar configuration. The component JSON-encodes this and passes
	 * it to `window.WaveformBar.init(...)` from an inline script.
	 *
	 * Pass `{}` (or omit) to take every default.
	 */
	config?: WaveformBarConfig;

	/**
	 * Render the persistent host `<div>` with a `transition:persist`
	 * key so the bar survives Astro view transitions intact. Set to
	 * `false` if you handle persistence yourself or are integrating
	 * into a non-View-Transitions stack.
	 *
	 * @default true
	 */
	persist?: boolean;

	/**
	 * DOM `id` for the persistent host. Useful if external scripts
	 * need to query for it.
	 *
	 * @default 'waveform-bar-host'
	 */
	hostId?: string;

	/**
	 * Extra class names appended to the host container.
	 */
	class?: string;
}

/**
 * Track metadata the bar reads from `<WaveformBarTrigger>`. Every
 * field is optional except `url` (which is the unique identity / play
 * target for the track).
 */
export interface WaveformBarTrackData {
	/** Audio file URL. Required. */
	url: string;
	/**
	 * Stable identifier for the track. Used by the bar to recognise
	 * "is this the same track that's already playing?" when the same
	 * audio appears at multiple click surfaces. Falls back to the URL
	 * when omitted.
	 */
	id?: string;

	/** Display title. */
	title?: string;
	/** Display artist line. */
	artist?: string;
	/** Album name. */
	album?: string;
	/** Cover image URL. */
	artwork?: string;
	/** Click-through link when the bar's title is clicked. */
	link?: string;

	/** Display duration (any free-form string — `'3:45'`, `'1m 32s'`). */
	duration?: string | number;
	/** BPM displayed as a chip. */
	bpm?: string | number;
	/** Musical key displayed as a chip. */
	key?: string;

	/** Arbitrary additional chips ("Stems included", "Stereo", etc.). */
	meta?: string[];

	/**
	 * Pre-computed waveform peaks. Pass a `number[]` of peaks (0..1),
	 * a JSON file URL, or a CSV string. Saves the bar from decoding
	 * the audio at play time.
	 */
	waveform?: number[] | string;

	/** DJ-mode markers for chapter-style playback within one track. */
	markers?: WaveformBarMarker[];

	/** Initial favorited state for this track. */
	favorited?: boolean;
	/** Initial in-cart state for this track. */
	inCart?: boolean;
}

/**
 * Props accepted by `<WaveformBarTrigger>`.
 */
export interface WaveformBarTriggerProps extends WaveformBarTrackData {
	/**
	 * Whether clicking this trigger plays the track immediately
	 * (`'play'`) or just appends it to the queue (`'queue'`).
	 *
	 * @default 'play'
	 */
	mode?: TriggerMode;

	/**
	 * HTML tag for the rendered element. The library's click
	 * delegation doesn't care which tag — any element with the
	 * `data-wb-play` / `data-wb-queue` attribute is bound at runtime.
	 *
	 * `button` is the default because it gives keyboard focus,
	 * Enter/Space activation, and a sensible accessible role for
	 * free. Override to `a` if you want a real link, or `div` if you
	 * want to wrap a whole product card.
	 *
	 * @default 'button'
	 */
	as?: 'button' | 'a' | 'div' | 'span';

	/**
	 * `href` value to render when `as="a"`. Ignored otherwise. Note
	 * that the library still calls `event.preventDefault()` on the
	 * click — if you also want the link to navigate, listen to a
	 * `waveformbar:play` event and route from there.
	 */
	href?: string;

	/** Accessible label. Auto-generated from `title` if absent. */
	ariaLabel?: string;

	/** Extra class names appended to the element. */
	class?: string;

	/**
	 * When true, suppresses the default play/pause SVG content the
	 * component renders into its slot. Use this if your trigger is a
	 * whole product card and you don't want the SVG pair inside it.
	 *
	 * @default false
	 */
	noDefaultIcons?: boolean;
}
