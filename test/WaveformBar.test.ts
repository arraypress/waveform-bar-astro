/**
 * test/WaveformBar.test.ts
 * ------------------------
 *
 * Output tests for the singleton `<WaveformBar>` mount. We render the
 * component and assert that:
 *
 *   - The persist host div is rendered with the right id / class
 *   - The init script is inlined and contains the JSON-serialised
 *     config so the runtime call has the right arguments
 *   - The `persist` prop toggles the `transition:persist` attribute
 *   - The init script self-deduplicates via the window flag, defined
 *     by name so we can pin it as part of the API contract
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import WaveformBarRaw from '../src/WaveformBar.astro';
import type { WaveformBarProps } from '../src/types';

const WaveformBar = WaveformBarRaw as Parameters<
	AstroContainer['renderToString']
>[0];

let container: AstroContainer;

beforeAll(async () => {
	container = await AstroContainer.create();
});

async function render(props: WaveformBarProps = {}): Promise<string> {
	return container.renderToString(WaveformBar, {
		props: props as unknown as Record<string, unknown>,
	});
}

function getAttr(html: string, name: string): string | null {
	const valued = new RegExp(`\\s${name}="([^"]*)"`).exec(html);
	const bare = new RegExp(`\\s${name}(?=[\\s>])`).test(html);
	if (valued) return valued[1];
	if (bare) return '';
	return null;
}

// ─── Host element ────────────────────────────────────────────────────────

describe('<WaveformBar> — persist host', () => {
	it('renders a single host div with the default id', async () => {
		const html = await render();
		expect(html).toContain('<div');
		expect(getAttr(html, 'id')).toBe('waveform-bar-host');
	});

	it('always carries the wb-host class so consumers can target it', async () => {
		const html = await render();
		const classes = getAttr(html, 'class') ?? '';
		expect(classes).toContain('wb-host');
	});

	it('honours a custom hostId', async () => {
		const html = await render({ hostId: 'my-app-bar' });
		expect(getAttr(html, 'id')).toBe('my-app-bar');
	});

	it('merges user-supplied class with wb-host', async () => {
		const html = await render({ class: 'theme-dark' });
		const classes = getAttr(html, 'class') ?? '';
		expect(classes).toContain('wb-host');
		expect(classes).toContain('theme-dark');
	});
});

// ─── Init script presence + config ───────────────────────────────────────

describe('<WaveformBar> — init script', () => {
	it('ships an inline script that references window.WaveformBar', async () => {
		const html = await render();
		expect(html).toContain('window.WaveformBar');
	});

	it('passes the config object through define:vars as WB_CFG', async () => {
		const html = await render({
			config: {
				persist: true,
				autoResume: true,
				continuous: true,
				maxMeta: 1,
				storageKey: 'my-key',
			},
		});

		/* `define:vars` declares the variable as a `const WB_CFG = …;`
		 * literal at the top of the script. We don't need to parse the
		 * exact serialisation — just confirm every value is present. */
		expect(html).toMatch(/WB_CFG\s*=\s*\{/);
		expect(html).toContain('"persist":true');
		expect(html).toContain('"autoResume":true');
		expect(html).toContain('"continuous":true');
		expect(html).toContain('"maxMeta":1');
		expect(html).toContain('"storageKey":"my-key"');
	});

	it('flows the 1.4.0 config additions through to WB_CFG', async () => {
		const html = await render({
			config: {
				position: 'top',
				wide: true,
				mode: 'classic',
				collapsible: true,
				waveform: false,
				share: true,
				shareParam: 'ts',
				errorText: 'Could not load audio',
			},
		});

		expect(html).toContain('"position":"top"');
		expect(html).toContain('"wide":true');
		expect(html).toContain('"mode":"classic"');
		expect(html).toContain('"collapsible":true');
		expect(html).toContain('"waveform":false');
		expect(html).toContain('"share":true');
		expect(html).toContain('"shareParam":"ts"');
		expect(html).toContain('"errorText":"Could not load audio"');
	});

	it('passes the hostId through as WB_HOST_ID', async () => {
		const html = await render({ hostId: 'my-app-bar' });
		expect(html).toMatch(/WB_HOST_ID\s*=\s*"my-app-bar"/);
	});

	it('serialises nested actions block correctly', async () => {
		const html = await render({
			config: {
				actions: {
					favorite: { endpoint: '/api/favorites', method: 'POST' },
					cart:     { endpoint: '/api/cart' },
				},
			},
		});

		expect(html).toContain('"actions":');
		expect(html).toContain('"favorite":');
		expect(html).toContain('"endpoint":"/api/favorites"');
		expect(html).toContain('"endpoint":"/api/cart"');
	});

	it('serialises an empty config as an empty object by default', async () => {
		const html = await render();
		expect(html).toMatch(/WB_CFG\s*=\s*\{\s*\}/);
	});

	it('declares the __wbAstroInitBound dedup flag as part of the contract', async () => {
		const html = await render();
		expect(html).toContain('__wbAstroInitBound');
	});
});

// ─── Persist toggle ──────────────────────────────────────────────────────

describe('<WaveformBar> — persist prop', () => {
	it('adds the transition:persist attribute by default', async () => {
		const html = await render();
		/* Astro's container renderer compiles `transition:persist` to the
		 * `data-astro-transition-persist` attribute, carrying the persisted
		 * element name so the host survives view transitions. */
		expect(html).toMatch(/data-astro-transition-persist="waveform-bar"/);
	});

	it('omits the persist attribute when persist=false', async () => {
		const html = await render({ persist: false });
		expect(html).not.toMatch(/data-astro-transition-persist/);
	});
});
