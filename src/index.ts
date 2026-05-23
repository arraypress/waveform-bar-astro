/**
 * @module @arraypress/waveform-bar-astro
 * @description
 * Public entry point for the Astro wrappers around
 * `@arraypress/waveform-bar`.
 *
 * Two components are exported:
 *
 *   - `WaveformBar`         — singleton init mount, render once
 *                             in your root layout
 *   - `WaveformBarTrigger`  — polymorphic play / queue trigger,
 *                             render anywhere you want a clickable
 *                             "play this track" element
 *
 * ## Importing the components
 *
 * ```astro
 * ---
 * import { WaveformBar, WaveformBarTrigger } from '@arraypress/waveform-bar-astro';
 * // or the explicit subpath form:
 * import WaveformBar from '@arraypress/waveform-bar-astro/WaveformBar.astro';
 * ---
 * ```
 *
 * ## Importing the types
 *
 * ```ts
 * import type {
 *   WaveformBarProps,
 *   WaveformBarConfig,
 *   WaveformBarTriggerProps,
 *   WaveformBarTrackData,
 *   WaveformBarMarker,
 *   WaveformBarActions,
 *   WaveformBarAction,
 *   WaveformBarTheme,
 *   RepeatMode,
 *   TriggerMode,
 *   WaveformStyle,
 * } from '@arraypress/waveform-bar-astro';
 * ```
 */

import WaveformBar from './WaveformBar.astro';
import WaveformBarTrigger from './WaveformBarTrigger.astro';

export { WaveformBar, WaveformBarTrigger };
export default WaveformBar;

export type {
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
} from './types';
