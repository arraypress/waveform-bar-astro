/**
 * test/WaveformBarTrigger.test.ts
 * -------------------------------
 *
 * Output tests for `<WaveformBarTrigger>`. Each test renders the
 * component through Astro's `experimental_AstroContainer` and
 * asserts on the resulting HTML string — that the right `data-wb-*`
 * attributes are emitted (or omitted), that the polymorphic `as`
 * prop picks the correct tag, that JSON-shaped props are serialised
 * correctly, and that the default play/pause SVG slot behaves as
 * documented.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import WaveformBarTriggerRaw from '../src/WaveformBarTrigger.astro';
import type { WaveformBarTriggerProps } from '../src/types';

const WaveformBarTrigger = WaveformBarTriggerRaw as Parameters<
	AstroContainer['renderToString']
>[0];

let container: AstroContainer;

beforeAll(async () => {
	container = await AstroContainer.create();
});

async function render(props: WaveformBarTriggerProps): Promise<string> {
	return container.renderToString(WaveformBarTrigger, {
		props: props as unknown as Record<string, unknown>,
	});
}

/**
 * HTML attribute values are encoded by Astro on the way out
 * (`"` → `&quot;` etc.) — browsers decode them when reading
 * `dataset.foo` at runtime. Decode here so JSON-comparisons work.
 */
function decodeEntities(value: string): string {
	return value
		.replace(/&quot;/g, '"')
		.replace(/&#x27;/g, "'")
		.replace(/&#39;/g, "'")
		.replace(/&apos;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}

function getAttr(html: string, name: string): string | null {
	const bare = new RegExp(`\\s${name}(?=[\\s>])`).test(html);
	const valued = new RegExp(`\\s${name}="([^"]*)"`).exec(html);
	if (valued) return decodeEntities(valued[1]);
	if (bare) return '';
	return null;
}

function expectNoAttr(html: string, name: string): void {
	expect(getAttr(html, name), `expected ${name} to be absent`).toBeNull();
}

// ─── Minimal render + tag default ────────────────────────────────────────

describe('<WaveformBarTrigger> — minimal props', () => {
	it('defaults to a <button> with data-wb-play and data-wb-url', async () => {
		const html = await render({ url: '/audio/track.mp3' });

		expect(html).toMatch(/^<button[\s>]/);
		expect(getAttr(html, 'data-wb-play')).toBe('');
		expect(getAttr(html, 'data-wb-url')).toBe('/audio/track.mp3');
	});

	it('omits every optional data-wb-* attribute when the prop is unset', async () => {
		const html = await render({ url: '/audio/track.mp3' });

		expectNoAttr(html, 'data-wb-title');
		expectNoAttr(html, 'data-wb-artist');
		expectNoAttr(html, 'data-wb-album');
		expectNoAttr(html, 'data-wb-artwork');
		expectNoAttr(html, 'data-wb-link');
		expectNoAttr(html, 'data-wb-duration');
		expectNoAttr(html, 'data-wb-bpm');
		expectNoAttr(html, 'data-wb-key');
		expectNoAttr(html, 'data-wb-meta');
		expectNoAttr(html, 'data-wb-waveform');
		expectNoAttr(html, 'data-wb-markers');
		expectNoAttr(html, 'data-wb-favorited');
		expectNoAttr(html, 'data-wb-in-cart');
	});

	it('always emits data-wb-id (falling back to url when not provided)', async () => {
		const html = await render({ url: '/audio/track.mp3' });
		expect(getAttr(html, 'data-wb-id')).toBe('/audio/track.mp3');
	});

	it('uses an explicit id when provided', async () => {
		const html = await render({ url: '/audio/track.mp3', id: 'sku-42' });
		expect(getAttr(html, 'data-wb-id')).toBe('sku-42');
	});

	it('always applies the wb-icon-swap class for the library to hook', async () => {
		const html = await render({ url: '/a.mp3' });
		expect(html).toMatch(/class="[^"]*\bwb-icon-swap\b/);
	});

	it('always applies type="button" when rendering a <button>', async () => {
		const html = await render({ url: '/a.mp3' });
		expect(getAttr(html, 'type')).toBe('button');
	});
});

// ─── Mode prop (play vs queue) ───────────────────────────────────────────

describe('<WaveformBarTrigger> — mode prop', () => {
	it('emits data-wb-play when mode is unset', async () => {
		const html = await render({ url: '/a.mp3' });
		expect(getAttr(html, 'data-wb-play')).toBe('');
		expectNoAttr(html, 'data-wb-queue');
	});

	it('emits data-wb-play when mode is "play"', async () => {
		const html = await render({ url: '/a.mp3', mode: 'play' });
		expect(getAttr(html, 'data-wb-play')).toBe('');
		expectNoAttr(html, 'data-wb-queue');
	});

	it('emits data-wb-queue when mode is "queue"', async () => {
		const html = await render({ url: '/a.mp3', mode: 'queue' });
		expect(getAttr(html, 'data-wb-queue')).toBe('');
		expectNoAttr(html, 'data-wb-play');
	});
});

// ─── Polymorphic `as` prop ───────────────────────────────────────────────

describe('<WaveformBarTrigger> — polymorphic as prop', () => {
	it('renders <a> when as="a"', async () => {
		const html = await render({ url: '/a.mp3', as: 'a' });
		expect(html).toMatch(/^<a[\s>]/);
		// `<a>` should NOT carry type="button"
		expectNoAttr(html, 'type');
	});

	it('passes href through when as="a"', async () => {
		const html = await render({ url: '/a.mp3', as: 'a', href: '/tracks/123' });
		expect(getAttr(html, 'href')).toBe('/tracks/123');
	});

	it('drops href when as is not "a"', async () => {
		const html = await render({ url: '/a.mp3', href: '/should-not-appear' });
		expectNoAttr(html, 'href');
	});

	it('renders <div> when as="div" (no type, no href)', async () => {
		const html = await render({ url: '/a.mp3', as: 'div' });
		expect(html).toMatch(/^<div[\s>]/);
		expectNoAttr(html, 'type');
		expectNoAttr(html, 'href');
	});

	it('renders <span> when as="span"', async () => {
		const html = await render({ url: '/a.mp3', as: 'span' });
		expect(html).toMatch(/^<span[\s>]/);
	});
});

// ─── Track metadata ──────────────────────────────────────────────────────

describe('<WaveformBarTrigger> — track metadata', () => {
	it('emits title, artist, album, artwork, link verbatim', async () => {
		const html = await render({
			url: '/a.mp3',
			title: 'My Track',
			artist: 'Artist Name',
			album: 'The Album',
			artwork: '/img/cover.jpg',
			link: '/products/abc',
		});

		expect(getAttr(html, 'data-wb-title')).toBe('My Track');
		expect(getAttr(html, 'data-wb-artist')).toBe('Artist Name');
		expect(getAttr(html, 'data-wb-album')).toBe('The Album');
		expect(getAttr(html, 'data-wb-artwork')).toBe('/img/cover.jpg');
		expect(getAttr(html, 'data-wb-link')).toBe('/products/abc');
	});

	it('coerces numeric duration / bpm to strings', async () => {
		const html = await render({
			url: '/a.mp3',
			duration: 234,
			bpm: 174,
		});

		expect(getAttr(html, 'data-wb-duration')).toBe('234');
		expect(getAttr(html, 'data-wb-bpm')).toBe('174');
	});

	it('accepts string duration / bpm verbatim', async () => {
		const html = await render({
			url: '/a.mp3',
			duration: '3:45',
			bpm: '174',
		});

		expect(getAttr(html, 'data-wb-duration')).toBe('3:45');
		expect(getAttr(html, 'data-wb-bpm')).toBe('174');
	});

	it('emits key as a plain string', async () => {
		const html = await render({ url: '/a.mp3', key: 'Cm' });
		expect(getAttr(html, 'data-wb-key')).toBe('Cm');
	});
});

// ─── Array props (meta, waveform, markers) ───────────────────────────────

describe('<WaveformBarTrigger> — array props', () => {
	it('JSON-stringifies the meta chips array', async () => {
		const meta = ['Stems', 'Stereo', '24-bit'];
		const html = await render({ url: '/a.mp3', meta });
		expect(getAttr(html, 'data-wb-meta')).toBe(JSON.stringify(meta));
	});

	it('omits data-wb-meta when the meta array is empty', async () => {
		const html = await render({ url: '/a.mp3', meta: [] });
		expectNoAttr(html, 'data-wb-meta');
	});

	it('JSON-stringifies waveform peaks when passed an array', async () => {
		const peaks = [0.1, 0.5, 0.9, 0.3];
		const html = await render({ url: '/a.mp3', waveform: peaks });
		expect(getAttr(html, 'data-wb-waveform')).toBe(JSON.stringify(peaks));
	});

	it('passes a waveform string through verbatim (URL or inline JSON)', async () => {
		const html = await render({ url: '/a.mp3', waveform: '/peaks/track.json' });
		expect(getAttr(html, 'data-wb-waveform')).toBe('/peaks/track.json');
	});

	it('JSON-stringifies the markers array', async () => {
		const markers = [
			{ time: 0, label: 'Intro' },
			{ time: 60, label: 'Drop', title: 'Big Tune', bpm: '174' },
		];
		const html = await render({ url: '/a.mp3', markers });
		expect(getAttr(html, 'data-wb-markers')).toBe(JSON.stringify(markers));
	});

	it('omits data-wb-markers when the markers array is empty', async () => {
		const html = await render({ url: '/a.mp3', markers: [] });
		expectNoAttr(html, 'data-wb-markers');
	});
});

// ─── Initial state flags ─────────────────────────────────────────────────

describe('<WaveformBarTrigger> — initial state flags', () => {
	it('emits favorited as "true" / "false"', async () => {
		const yes = await render({ url: '/a.mp3', favorited: true });
		expect(getAttr(yes, 'data-wb-favorited')).toBe('true');

		const no = await render({ url: '/a.mp3', favorited: false });
		expect(getAttr(no, 'data-wb-favorited')).toBe('false');
	});

	it('emits inCart as "true" / "false" under data-wb-in-cart', async () => {
		const html = await render({ url: '/a.mp3', inCart: true });
		expect(getAttr(html, 'data-wb-in-cart')).toBe('true');
	});
});

// ─── Slot / default icon handling ────────────────────────────────────────

describe('<WaveformBarTrigger> — slot + default icons', () => {
	it('renders the default play/pause SVGs when no children are passed', async () => {
		const html = await render({ url: '/a.mp3' });
		expect(html).toMatch(/wb-show-play/);
		expect(html).toMatch(/wb-show-pause/);
		expect(html).toContain('M8 5v14l11-7z');
	});

	it('suppresses default icons when noDefaultIcons is true', async () => {
		const html = await render({ url: '/a.mp3', noDefaultIcons: true });
		expect(html).not.toMatch(/wb-show-play/);
		expect(html).not.toMatch(/wb-show-pause/);
	});

	/* Regression test: an earlier version emitted
	 *   <svg class="wb-show-pause" style="display:none;">
	 * which permanently overrode the library's class-based toggle
	 * (`.wb-icon-swap.wb-playing .wb-show-pause { display: inline; }`)
	 * — inline styles win over class rules without `!important`. The
	 * library's CSS already handles the initial-hidden state via
	 * `.wb-icon-swap .wb-show-pause { display: none; }`, so the SVG
	 * MUST NOT carry an inline display rule of its own.
	 */
	it('default pause SVG carries no inline display style (library toggles via class)', async () => {
		const html = await render({ url: '/a.mp3' });
		const pauseMatch = /<svg[^>]*class="wb-show-pause"[^>]*>/.exec(html);
		expect(pauseMatch, 'expected a wb-show-pause svg in the default slot').not.toBeNull();
		expect(pauseMatch![0]).not.toMatch(/style=/);
	});

	it('default play SVG also carries no inline display style', async () => {
		const html = await render({ url: '/a.mp3' });
		const playMatch = /<svg[^>]*class="wb-show-play"[^>]*>/.exec(html);
		expect(playMatch, 'expected a wb-show-play svg in the default slot').not.toBeNull();
		expect(playMatch![0]).not.toMatch(/style=/);
	});
});

// ─── Aria label generation ───────────────────────────────────────────────

describe('<WaveformBarTrigger> — accessibility', () => {
	it('uses explicit ariaLabel when provided', async () => {
		const html = await render({ url: '/a.mp3', ariaLabel: 'Custom label' });
		expect(getAttr(html, 'aria-label')).toBe('Custom label');
	});

	it('auto-generates an aria-label from title in play mode', async () => {
		const html = await render({ url: '/a.mp3', title: 'My Track' });
		expect(getAttr(html, 'aria-label')).toBe('Play My Track');
	});

	it('auto-generates an aria-label from title in queue mode', async () => {
		const html = await render({ url: '/a.mp3', title: 'My Track', mode: 'queue' });
		expect(getAttr(html, 'aria-label')).toBe('Add My Track to queue');
	});

	it('falls back to a bare "Play" / "Add to queue" without a title', async () => {
		const play = await render({ url: '/a.mp3' });
		expect(getAttr(play, 'aria-label')).toBe('Play');

		const queue = await render({ url: '/a.mp3', mode: 'queue' });
		expect(getAttr(queue, 'aria-label')).toBe('Add to queue');
	});
});

// ─── Class pass-through ──────────────────────────────────────────────────

describe('<WaveformBarTrigger> — class merging', () => {
	it('appends user-supplied class to wb-icon-swap', async () => {
		const html = await render({ url: '/a.mp3', class: 'card-play-btn' });
		const classes = getAttr(html, 'class') ?? '';
		expect(classes).toContain('wb-icon-swap');
		expect(classes).toContain('card-play-btn');
	});
});

// ─── Realistic kitchen-sink ──────────────────────────────────────────────

describe('<WaveformBarTrigger> — full prop set', () => {
	it('handles every prop together without dropping or mangling attributes', async () => {
		const html = await render({
			url: '/audio/track.mp3',
			id: 'sku-42',
			title: 'Trap Beat',
			artist: 'Producer',
			album: 'The Album',
			artwork: '/img/cover.jpg',
			link: '/products/trap-beat',
			duration: '3:45',
			bpm: 174,
			key: 'Cm',
			meta: ['Stems included'],
			waveform: [0.1, 0.5, 0.9],
			markers: [
				{ time: 0, label: 'Intro' },
				{ time: 60, label: 'Drop' },
			],
			favorited: true,
			inCart: false,
			mode: 'play',
			class: 'product-card-play',
			ariaLabel: 'Preview Trap Beat',
		});

		expect(getAttr(html, 'data-wb-play')).toBe('');
		expect(getAttr(html, 'data-wb-url')).toBe('/audio/track.mp3');
		expect(getAttr(html, 'data-wb-id')).toBe('sku-42');
		expect(getAttr(html, 'data-wb-title')).toBe('Trap Beat');
		expect(getAttr(html, 'data-wb-artist')).toBe('Producer');
		expect(getAttr(html, 'data-wb-artwork')).toBe('/img/cover.jpg');
		expect(getAttr(html, 'data-wb-link')).toBe('/products/trap-beat');
		expect(getAttr(html, 'data-wb-duration')).toBe('3:45');
		expect(getAttr(html, 'data-wb-bpm')).toBe('174');
		expect(getAttr(html, 'data-wb-key')).toBe('Cm');
		expect(getAttr(html, 'data-wb-meta')).toBe('["Stems included"]');
		expect(getAttr(html, 'data-wb-waveform')).toBe('[0.1,0.5,0.9]');
		expect(getAttr(html, 'data-wb-markers')).toBe(
			'[{"time":0,"label":"Intro"},{"time":60,"label":"Drop"}]'
		);
		expect(getAttr(html, 'data-wb-favorited')).toBe('true');
		expect(getAttr(html, 'data-wb-in-cart')).toBe('false');
		expect(getAttr(html, 'aria-label')).toBe('Preview Trap Beat');
	});
});
