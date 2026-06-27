/**
 * @module globals
 * @description
 * Ambient declarations for the globals the core
 * `@arraypress/waveform-bar` library installs on `window` when its
 * IIFE script runs.
 *
 * Consumers don't need to import this file — TypeScript picks it up
 * automatically via the package's exported types. The shim lets you
 * write things like:
 *
 * ```ts
 * window.WaveformBar?.play({ url: '/audio/track.mp3', title: 'My Track' });
 * window.WaveformBar?.setRepeat('all');
 * const current = window.WaveformBar?.getCurrentTrack();
 * ```
 *
 * without TypeScript complaining about `window.WaveformBar` being
 * `any` / undefined.
 *
 * The shape mirrors the public surface documented in the core
 * library's README. It is intentionally lenient (most return types
 * are `unknown` or `void`) — write your own narrower types in your
 * application if you want stricter checks.
 */

import type { WaveformBarConfig, WaveformBarTrackData, RepeatMode } from './types';

/**
 * Static + instance surface of `window.WaveformBar`.
 *
 * The core library exposes a singleton instance on `window`, and
 * every method is chainable on that instance.
 */
interface WaveformBarGlobal {
	/**
	 * Initialise the bar. Safe to call multiple times — subsequent
	 * calls destroy and re-create the bar with the new config.
	 */
	init(config?: WaveformBarConfig): WaveformBarGlobal;

	/** Tear down the bar and remove all listeners. */
	destroy(): WaveformBarGlobal;

	// ─── Playback ────────────────────────────────────────────────────────

	/** Play a track. Accepts a full track object or just a URL string. */
	play(track: WaveformBarTrackData | string): WaveformBarGlobal;
	/** Toggle play / pause for the current track. */
	togglePlay(): WaveformBarGlobal;
	/** Pause playback. */
	pause(): WaveformBarGlobal;
	/** Skip to the next track. */
	next(): WaveformBarGlobal;
	/** Skip to the previous track (or restart if >3s in). */
	previous(): WaveformBarGlobal;
	/** Jump to the track at the given queue index. */
	skipTo(index: number): WaveformBarGlobal;

	// ─── Repeat ──────────────────────────────────────────────────────────

	/** Cycle through repeat modes: off → all → one → off. */
	cycleRepeat(): WaveformBarGlobal;
	setRepeat(mode: RepeatMode): WaveformBarGlobal;

	// ─── Markers / DJ mode ───────────────────────────────────────────────

	seekToMarker(index: number): WaveformBarGlobal;
	seekToMarkerByLabel(label: string): WaveformBarGlobal;

	// ─── Volume ──────────────────────────────────────────────────────────

	setVolume(level: number): WaveformBarGlobal;
	getVolume(): number;
	toggleMute(): WaveformBarGlobal;

	// ─── Queue management ────────────────────────────────────────────────

	addToQueue(track: WaveformBarTrackData | string): WaveformBarGlobal;
	removeFromQueue(index: number): WaveformBarGlobal;
	clearQueue(): WaveformBarGlobal;
	getQueue(): WaveformBarTrackData[];
	getCurrentIndex(): number;
	getCurrentTrack(): WaveformBarTrackData | null;

	// ─── Favourites + cart ───────────────────────────────────────────────

	toggleFavorite(): WaveformBarGlobal;
	isFavorited(id?: string): boolean;
	addToCart(): WaveformBarGlobal;
	isInCart(id?: string): boolean;

	// ─── Queries ─────────────────────────────────────────────────────────

	isCurrentlyPlaying(url: string): boolean;
	isCurrentTrack(url: string): boolean;
	/** Underlying WaveformPlayer instance. Returned typed as `unknown`
	 *  — cast in your code if you need strict typing. */
	getPlayer(): unknown;

	// ─── UI ──────────────────────────────────────────────────────────────

	show(): WaveformBarGlobal;
	hide(): WaveformBarGlobal;
	toggleQueuePanel(): WaveformBarGlobal;
	openQueuePanel(): WaveformBarGlobal;
	closeQueuePanel(): WaveformBarGlobal;
	toggleVolumePopup(): WaveformBarGlobal;
	openVolumePopup(): WaveformBarGlobal;
	closeVolumePopup(): WaveformBarGlobal;
}

declare global {
	interface Window {
		/**
		 * Installed by `@arraypress/waveform-bar`'s IIFE script.
		 * `undefined` until that script loads.
		 */
		WaveformBar?: WaveformBarGlobal;

		/**
		 * Internal — set by `<WaveformBar>`'s inline script to
		 * deduplicate the page-load init binding. Do not rely on this;
		 * it is an implementation detail.
		 *
		 * @internal
		 */
		__wbAstroInitBound?: boolean;

		/**
		 * Internal — set by `<WaveformBar>`'s inline script once the bar
		 * has been initialised, making `init(config)` idempotent across
		 * `astro:page-load` events (waveform-bar's `init()` destroys +
		 * rebuilds, which would restart the playing audio). Do not rely
		 * on this; it is an implementation detail.
		 *
		 * @internal
		 */
		__apWaveformBarInited?: boolean;
	}
}

export {};
