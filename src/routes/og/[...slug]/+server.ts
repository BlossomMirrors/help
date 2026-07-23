import { getLocale } from '$lib/paraglide/runtime';
import * as m from '$lib/paraglide/messages';
import { getDocsetMeta } from '$lib/docsets';
import { renderIcon } from '$lib/server/og-icons';
import { error, redirect } from '@sveltejs/kit';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import type { Component } from 'svelte';
import type { RequestHandler } from './$types';

const pages = import.meta.glob<{ default: Component; metadata?: Record<string, unknown> }>(
	'/content/**/*.svx'
);

let fontsPromise: Promise<
	{ name: string; data: Buffer; weight: 400 | 700; style: 'normal' | 'italic' }[]
> | null = null;

function loadFonts(fetch: typeof globalThis.fetch) {
	if (!fontsPromise) {
		fontsPromise = Promise.all([
			fetch('/fonts-og/Aspekta-400.ttf').then((r) => r.arrayBuffer()),
			fetch('/fonts-og/Aspekta-700.ttf').then((r) => r.arrayBuffer()),
			fetch('/fonts-og/Lora-Italic.ttf').then((r) => r.arrayBuffer())
		]).then(([aspekta400, aspekta700, loraItalic]) => [
			{
				name: 'Aspekta',
				data: Buffer.from(aspekta400),
				weight: 400 as const,
				style: 'normal' as const
			},
			{
				name: 'Aspekta',
				data: Buffer.from(aspekta700),
				weight: 700 as const,
				style: 'normal' as const
			},
			{
				name: 'Lora',
				data: Buffer.from(loraItalic),
				weight: 400 as const,
				style: 'italic' as const
			}
		]);
	}
	return fontsPromise;
}

async function toDataUri(fetch: typeof globalThis.fetch, url: string) {
	const res = await fetch(url);
	const buf = Buffer.from(await res.arrayBuffer());
	const contentType = res.headers.get('content-type') ?? 'image/jpeg';
	return `data:${contentType};base64,${buf.toString('base64')}`;
}

export const GET: RequestHandler = async ({ params, fetch }) => {
	const locale = getLocale();
	const [docset, ...rest] = params.slug.split('/');
	const path = rest.join('/');

	const loader = path
		? (pages[`/content/${locale}/${docset}/${path}.svx`] ??
			pages[`/content/${locale}/${docset}/${path}/+page.svx`] ??
			pages[`/content/en/${docset}/${path}.svx`] ??
			pages[`/content/en/${docset}/${path}/+page.svx`])
		: (pages[`/content/${locale}/${docset}/+page.svx`] ?? pages[`/content/en/${docset}/+page.svx`]);

	if (!loader) error(404, `No content found for ${docset}/${path}`);

	const mod = await loader();
	const metadata = mod.metadata ?? {};
	const title = typeof metadata.title === 'string' ? metadata.title : m.help_title();
	const image = typeof metadata.image === 'string' ? metadata.image : null;
	const isVideo = image ? /\.(mp4|webm|mov)$/i.test(image) : false;

	// No usable cover image, fall back to the static default card instead of generating one
	if (!image || isVideo) redirect(302, '/og-image.png');

	const iconName = typeof metadata.icon === 'string' ? metadata.icon : getDocsetMeta(docset).icon;

	const [fonts, imageDataUri] = await Promise.all([loadFonts(fetch), toDataUri(fetch, image)]);

	const svg = await satori(
		{
			type: 'div',
			props: {
				style: {
					display: 'flex',
					width: '1200px',
					height: '630px',
					position: 'relative',
					background: '#0c0c12',
					fontFamily: 'Aspekta'
				},
				children: [
					{
						type: 'img',
						props: {
							src: imageDataUri,
							style: {
								position: 'absolute',
								top: 0,
								left: 0,
								width: '1200px',
								height: '630px',
								objectFit: 'cover'
							}
						}
					},
					{
						type: 'div',
						props: {
							style: {
								position: 'absolute',
								top: 0,
								left: 0,
								width: '1200px',
								height: '630px',
								background:
									'linear-gradient(to top, #0c0c12 20%, rgba(12,12,18,0.55) 48%, rgba(12,12,18,0.05) 78%, rgba(12,12,18,0) 100%)'
							}
						}
					},
					{
						type: 'div',
						props: {
							style: {
								position: 'absolute',
								top: 48,
								left: 48,
								display: 'flex',
								width: 64,
								height: 64,
								borderRadius: 16,
								background: 'rgba(255,255,255,0.16)',
								border: '1px solid rgba(255,255,255,0.25)',
								alignItems: 'center',
								justifyContent: 'center'
							},
							children: iconName ? [renderIcon(iconName, '#ffffff', 30)] : []
						}
					},
					{
						type: 'div',
						props: {
							style: {
								position: 'absolute',
								left: 64,
								right: 64,
								bottom: 56,
								display: 'flex',
								flexDirection: 'column'
							},
							children: [
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											color: '#3e78ff',
											fontSize: 22,
											fontWeight: 700,
											letterSpacing: 2,
											textTransform: 'uppercase',
											marginBottom: 20
										},
										children: m.help_title()
									}
								},
								{
									type: 'div',
									props: {
										style: {
											display: 'flex',
											fontFamily: 'Lora',
											fontStyle: 'italic',
											fontSize: 60,
											lineHeight: 1.15,
											color: '#ededf0'
										},
										children: title
									}
								}
							]
						}
					}
				]
			}
		},
		{ width: 1200, height: 630, fonts }
	);

	const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();

	return new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
